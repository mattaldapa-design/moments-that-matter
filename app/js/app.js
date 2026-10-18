// Moments That Matter — the app. Trips → days (boards) → blocks (moments).
import * as db from './db.js';
import { readExif, exifDateToLocal } from './exif.js';
import { KINDS, kindOf, WEATHER, WORDS, emojiFor, emojiFromText } from './words.js';
import { gather, stats, renderRecap, drawPages, drawDayCard, pagesToPdf, pagesToPictures } from './recap.js';
import { esc, cap, addDays, fmtDay, joinNames, autoTitle, titleOf, safeId, safeGlyph } from './util.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const top = $('#top');
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
const go = (h) => { location.hash = h; };

// Backup reminder threshold. Placeholder until the open decision in README is settled.
const BACKUP_DUE = { changes: 10, bytes: 8 * 1024 * 1024 };
const APP_VERSION = 28; // keep in step with VERSION in sw.js

// ---------- dates ----------
const fmtRange = (t) => `${fmtDay(addDays(t.startDate, 0))} – ${fmtDay(addDays(t.startDate, t.dayCount - 1))}`;
const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
// Where a trip sits against today: before, during or after (I22).
function tripWhen(t) {
  const today = new Date(todayIso() + 'T00:00:00');
  const start = addDays(t.startDate, 0), end = addDays(t.startDate, t.dayCount - 1);
  const days = Math.round((start - today) / 86400000);
  if (days > 0) return { phase: 'before', text: days === 1 ? 'Starts tomorrow' : `Starts in ${days} days` };
  if (today <= end) { const n = Math.round((today - start) / 86400000) + 1; return { phase: 'during', text: `Day ${n} of ${t.dayCount} today` }; }
  const since = Math.round((today - end) / 86400000);
  return { phase: 'after', text: since === 1 ? 'Ended yesterday' : `Ended ${since} days ago` };
}
const ago = (t) => {
  if (!t) return 'never';
  const m = (Date.now() - t) / 60000;
  if (m < 1.5) return 'just now';
  if (m < 90) return `${Math.round(m)} min ago`;
  const h = m / 60;
  if (h < 36) return `${Math.round(h)} hours ago`;
  return `${Math.round(h / 24)} days ago`;
};

// ---------- small helpers ----------
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}
function debounce(fn, ms) {
  let timer, pending = false;
  const d = () => { pending = true; clearTimeout(timer); timer = setTimeout(() => { pending = false; fn(); }, ms); };
  d.flush = async () => { if (pending) { clearTimeout(timer); pending = false; await fn(); } };
  return d;
}
let urls = [];
const freeUrls = () => { urls.forEach((u) => URL.revokeObjectURL(u)); urls = []; };
const photoUrl = (p) => { const u = URL.createObjectURL(p.blob); urls.push(u); return u; };
const bindGo = () => $$('[data-go]').forEach((el) => {
  el.addEventListener('click', () => go(el.dataset.go));
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(el.dataset.go); } });
});

// ---------- model ----------
const dayId = (tripId, i) => `${tripId}:${i}`;
async function getDay(tripId, i) {
  const d = (await db.get('days', dayId(tripId, i))) || { id: dayId(tripId, i), tripId, index: i, city: '', weather: '' };
  return keyify(d);
}
// Up to four key pictures per day, in tap order (Decision, 2026-10-17). Older days had one keyPhotoId.
function keyify(d) {
  if (!Array.isArray(d.keyPhotos)) d.keyPhotos = d.keyPhotoId ? [d.keyPhotoId] : [];
  d.keyPhotoId = d.keyPhotos[0] || null;
  return d;
}
const KEY_MAX = 4;
async function touch(trip, bytes = 0) {
  trip.updatedAt = Date.now();
  trip.pending = trip.pending || { changes: 0, bytes: 0 };
  trip.pending.changes += 1;
  trip.pending.bytes += bytes;
  await db.put('trips', trip);
}
const backupDue = (t) => { const p = t.pending || { changes: 0, bytes: 0 }; return p.changes >= BACKUP_DUE.changes || p.bytes >= BACKUP_DUE.bytes; };
async function blocksForDay(id) { return (await db.where('blocks', 'dayId', id)).sort((a, b) => a.order - b.order); }
async function staysCovering(tripId, dayIndex) {
  const all = await db.where('blocks', 'tripId', tripId);
  return all.filter((b) => b.kind === 'stay' && b.dayIndex < dayIndex && dayIndex < b.dayIndex + Math.max(1, +(b.fields?.nights || 1)));
}
async function saveOrder(blocks, trip) { blocks.forEach((b, i) => { b.order = i; }); await db.putMany('blocks', blocks); await touch(trip); }
async function deleteDay(trip, i) {
  const id = dayId(trip.id, i);
  for (const b of await db.where('blocks', 'dayId', id)) { if (b.photoId) await db.del('photos', b.photoId); await db.del('blocks', b.id); }
  await db.del('days', id);
}
async function deleteTrip(id) {
  await db.delWhere('blocks', 'tripId', id);
  await db.delWhere('photos', 'tripId', id);
  await db.delWhere('days', 'tripId', id);
  await db.del('trips', id);
}
// Optional details, added to a card from a list (Decision, 2026-10-17). Not on every card.
const DETAILS = [
  { k: 'time', label: 'Time', type: 'time' },
  { k: 'cost', label: 'Cost', hint: 'How much' },
  { k: 'duration', label: 'How long', hint: 'Hours or minutes' },
  { k: 'rating', label: 'Rating', type: 'rating' },
  { k: 'website', label: 'Website', type: 'url', hint: 'Paste the address' },
  { k: 'menu', label: 'Menu', type: 'url', hint: 'Paste the menu address' },
  { k: 'steps', label: 'Steps', hint: 'How many', numeric: true },
  { k: 'distance', label: 'Distance', hint: 'Miles or km' },
  { k: 'room', label: 'Room', hint: 'Room number' },
  { k: 'confirmation', label: 'Confirmation number', hint: 'The code' },
  { k: 'host', label: 'Guide or host', hint: 'Their name' },
];
const stars = (n) => '★'.repeat(Number(n) || 0) + '☆'.repeat(5 - (Number(n) || 0));
// Trip-wide details (I18): the big-picture things that are not any one day's.
const TRIP_DETAILS = [
  { k: 'carrier', label: 'Airline or cruise line', hint: 'Who you flew or sailed with' },
  { k: 'booking', label: 'Booking reference', hint: 'The code' },
  { k: 'budget', label: 'Budget', hint: 'For the whole trip', money: true },
  { k: 'website', label: 'Website', type: 'url', hint: 'Paste the address' },
  { k: 'insurance', label: 'Insurance', hint: 'Company and policy number' },
];
function normalizeTrip(t) {
  t.companions = t.companions || []; t.details = t.details || {}; t.extras = t.extras || []; t.custom = t.custom || []; t.packing = t.packing || [];
  if (!Array.isArray(t.places)) t.places = t.region ? [{ name: t.region, cities: [] }] : [];
  t.region = t.places.map((p) => p.name).join(', ');
  return t;
}
// The country a day's city belongs to, from the trip's Places; else the first place; else a blank.
function countryOf(trip, city) {
  normalizeTrip(trip);
  const c = (city || '').trim().toLowerCase();
  const hit = c && trip.places.find((p) => p.cities.some((x) => x.trim().toLowerCase() === c));
  return (hit || trip.places[0])?.name || '…';
}
let ownTripOpen = null;
let aboutOpen = false;
try { aboutOpen = localStorage.getItem('mtm-about') === '1'; } catch { /* default closed */ }
const asLink = (v) => (/^https?:\/\//i.test(v) ? v : 'https://' + v);
// Bring an older block up to the current shape (time/cost used to be fields on every card).
function normalize(b) {
  b.fields = b.fields || {}; b.place = b.place || { name: '', lat: null, lon: null }; b.details = b.details || {}; b.extras = b.extras || []; b.custom = b.custom || [];
  if (b.time) { b.details.time = b.time.includes('T') ? b.time.slice(11, 16) : b.time; delete b.time; }
  if (b.cost) { b.details.cost = b.cost; delete b.cost; }
  if (b.fields.duration) { b.details.duration = b.fields.duration; delete b.fields.duration; }
  if (b.kind === 'people' && typeof b.fields.names === 'string') {
    b.fields.people = (b.fields.people || []).concat(b.fields.names.split(/,|&|\band\b/).map((x) => x.trim()).filter(Boolean));
    delete b.fields.names;
  }
  if (b.kind === 'people' && !Array.isArray(b.fields.people)) b.fields.people = [];
  return b;
}
// What a tile says under its title: the place and the stars, nothing bookkeeping-ish (Matt, sixth look).
function blockMeta(b) {
  normalize(b);
  const parts = [];
  if (b.place?.name) parts.push(b.place.name);
  if (b.details.rating) parts.push(stars(b.details.rating));
  if (b.kind === 'stay' && b.fields?.nights) parts.push(`${b.fields.nights} night${+b.fields.nights === 1 ? '' : 's'}`);
  if (b.details.host) parts.push(`with ${b.details.host}`);
  return parts.join(' · ');
}
function coordsText(p) {
  if (p?.lat == null) return 'No position yet';
  return `${Math.abs(p.lat).toFixed(4)}°${p.lat < 0 ? 'S' : 'N'} ${Math.abs(p.lon).toFixed(4)}°${p.lon < 0 ? 'W' : 'E'}${p.from === 'photo' ? ' · from the photo' : ''}`;
}

// Move, insert or remove days: every day and block gets its new index; dates follow from the first day.
async function remapDays(trip, map, newCount) {
  const days = await db.where('days', 'tripId', trip.id);
  const blocks = await db.where('blocks', 'tripId', trip.id);
  const keptDays = [], keptBlocks = [], goneBlocks = [], gonePhotos = [];
  for (const d of days) { const ni = map(d.index); if (ni >= 0) keptDays.push({ ...d, index: ni, id: dayId(trip.id, ni) }); }
  for (const b of blocks) {
    const ni = map(b.dayIndex);
    if (ni < 0) { goneBlocks.push(b.id); if (b.photoId) { gonePhotos.push(b.photoId); if (trip.coverPhotoId === b.photoId) trip.coverPhotoId = null; } continue; }
    keptBlocks.push({ ...b, dayIndex: ni, dayId: dayId(trip.id, ni) });
  }
  // Everything lands in one transaction, so a suspend or crash cannot leave half a trip renumbered.
  await db.batch(['days', 'blocks', 'photos'], (s) => {
    days.forEach((d) => s.days.delete(d.id));
    keptDays.forEach((d) => s.days.put(d));
    goneBlocks.forEach((id) => s.blocks.delete(id));
    gonePhotos.forEach((id) => s.photos.delete(id));
    keptBlocks.forEach((b) => s.blocks.put(b));
  });
  trip.dayCount = newCount;
  await touch(trip);
}
// A bottom sheet of choices. Resolves with the chosen key, or null.
function sheet(title, actions) {
  return new Promise((resolve) => {
    const back = document.createElement('div'); back.className = 'mtm-backdrop';
    const box = document.createElement('div'); box.className = 'dr-peek dr-peek--sheet mtm-sheet';
    box.innerHTML = `<div class="dr-peek__title">${esc(title)}</div>${actions.map((a) => `<button class="dr-btn ${a.danger ? 'dr-btn--ghost' : 'dr-btn--quiet'}" data-act="${a.k}" ${a.disabled ? 'disabled' : ''}>${esc(a.label)}</button>`).join('')}<button class="dr-btn dr-btn--ghost" data-act="">Never mind</button>`;
    const close = (k) => { back.remove(); box.remove(); resolve(k || null); };
    back.onclick = () => close(null);
    box.onclick = (e) => { const b = e.target.closest('[data-act]'); if (b && !b.disabled) close(b.dataset.act); };
    document.body.append(back, box);
    requestAnimationFrame(() => box.classList.add('is-in'));
  });
}

// ---------- routing ----------
let leaveHook = null; // the editor sets this so an unsaved edit lands before the screen changes
let renderSeq = 0; // each render takes a number; a screen that finishes late finds it is stale and does nothing
const stale = (my) => my !== renderSeq;
function paint(my, html) { if (stale(my)) return false; app.innerHTML = html; return true; }
let reloadWhenIdle = false; // a new worker took over; reload on the next screen change, not mid-edit
window.addEventListener('mtm-new-worker', () => { reloadWhenIdle = true; });
async function render() {
  if (reloadWhenIdle) { reloadWhenIdle = false; if (leaveHook) { const h = leaveHook; leaveHook = null; await h(); } location.reload(); return; }
  const my = ++renderSeq;
  if (leaveHook) { const h = leaveHook; leaveHook = null; await h(); }
  if (stale(my)) return;
  freeUrls();
  app.onclick = null;
  const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  try {
    if (!p.length) return await trips();
    if (p[0] === 'new') return newTrip();
    if (p[0] === 'settings') return await settingsPage();
    if (p[0] === 't') {
      const trip = await db.get('trips', p[1]);
      if (!trip) return await trips();
      if (p.length === 2) return await tripPage(trip);
      if (p[2] === 'recap') return await recapPage(trip);
      if (p[2] === 'd') {
        const i = +p[3];
        if (p.length === 4) return await board(trip, i);
        if (isPassed(trip)) { toast('This trip is passed on. Take it back to edit it.'); return go(`/t/${trip.id}`); }
        if (p[4] === 'add') return addPage(trip, i);
        if (p[4] === 'b') return await editor(trip, i, p[5]);
      }
    }
    return await trips();
  } catch (e) {
    console.error(e);
    app.innerHTML = `<p class="dr-body">Something went wrong: ${esc(e.message)}</p>`;
  }
}
function trail(items, backHash) {
  top.innerHTML = `${backHash != null ? '<button class="mtm-top__back" aria-label="Back">←</button>' : ''}<nav class="mtm-trail">${
    items.map((it, i) => (i < items.length - 1 ? `<a href="#${it.h}">${esc(it.t)}</a><i>›</i>` : `<span class="is-here">${esc(it.t)}</span>`)).join('')
  }</nav>`;
  const b = $('.mtm-top__back', top);
  if (b) b.onclick = () => go(backHash);
}

// ---------- screens ----------
async function trips() {
  const my = renderSeq;
  const list = (await db.all('trips')).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  if (stale(my)) return;
  trail([{ t: 'Trips', h: '/' }], null);
  const tiles = await Promise.all(list.map(async (t) => {
    const cover = t.coverPhotoId ? await db.get('photos', t.coverPhotoId) : null;
    const face = cover ? `<img src="${photoUrl(cover)}" alt="">`
      : `<div class="dr-cover--type" style="position:absolute;inset:0"><span>${esc(t.title || 'Untitled trip')}</span></div>`;
    return `<button class="dr-tile" data-go="/t/${t.id}">
      <div class="dr-cover mtm-trip-cover">${face}<span class="dr-badge mtm-days">${t.dayCount} day${t.dayCount === 1 ? '' : 's'}</span></div>
      <div class="dr-tile__title">${esc(t.title || 'Untitled trip')}</div>
      <div class="dr-tile__meta">${fmtRange(t)}${backupDue(t) ? ' · <b style="color:var(--state-warn)">back up</b>' : ''}</div>
      ${tripWhen(t).phase !== 'after' ? `<div class="dr-tile__meta mtm-countdown">${tripWhen(t).text}${tripWhen(t).phase === 'before' && (t.packing || []).length ? ` · ${t.packing.filter((p) => p.done).length} of ${t.packing.length} packed` : ''}</div>` : ''}
    </button>`;
  }));
  if (!paint(my, `<div class="mtm-stack">
    <div><div class="dr-eyebrow">Your trips</div><h1 class="dr-title-xl">Moments That Matter</h1></div>
    ${list.length ? `<div class="dr-shelf">${tiles.join('')}</div>`
      : '<div class="mtm-empty"><p class="dr-body-lg">No trips yet. Start one, and build each day from the moments that matter.</p></div>'}
    <div class="mtm-bar">
      <button class="dr-btn" data-go="/new">Start a trip</button>
      <label class="dr-btn dr-btn--ghost">Import a trip<input type="file" accept=".json,application/json" hidden id="importFile"></label>
    </div>
    <div class="mtm-foot mtm-bar mtm-bar--between"><span>Moments That Matter · version ${APP_VERSION}</span><button class="dr-btn dr-btn--ghost dr-btn--sm" data-go="/settings">⚙ Settings &amp; help</button></div>
  </div>`)) return;
  bindGo();
  $('#importFile').onchange = (e) => importTrip(e.target.files[0]);
}

// Settings & help (Decision, 2026-10-17): how it works, the settings, and your name.
const HOW_IT_WORKS = [
  ['Trips, days and moments', 'A trip is a run of days. Each day has a board. On a board you add moments: a meal, a place, a person you met, anything. Tap the + and pick a kind, or type any word and take the icon it offers. Nothing is required on a moment; fill in what you feel like, when you feel like it.'],
  ['Pictures', 'Every moment can carry one picture from your photo library. When the photo has a time and a place in it, they fill in by themselves. On each day you can mark up to four pictures as key pictures; those lead on the day’s card and in the recap, in the order you tapped them.'],
  ['Where', 'Each moment can say where it was. A picture or "Use my location" gives a position; "Look up the name" turns that into a place name using an online map service, only when you ask, or always if you switch that on below. Under About this trip you can list the countries and cities of the trip, and the boards offer them as you type.'],
  ['Back up, Archive, Pass the notebook', 'All three make the same file: the whole trip, pictures included, which you save to Files, iCloud Drive, Google Drive, or send by Messages. Back up keeps the trip here; do that whenever the reminder shows. Archive makes the file and then takes the trip off this phone, to free space; Import a trip brings it back whole. Pass the notebook sends the file to someone and locks the trip here until their file comes back through Import a trip, which then replaces yours with everything they added. One person writes at a time, and the notebook always comes home.'],
  ['Send this day, Import a trip', 'Send this day, in a day’s ⋯ menu, sends just that day and its pictures to someone. Import a trip, on the Trips screen, opens any of these files. A whole trip you don’t have arrives as itself; one you already have arrives as a copy, unless you passed it on, in which case it comes home in its place. A day asks which trip it joins, then adds its moments to the day with the same date, or as a new day at the end; moments already there from an earlier send are skipped, and you remove what you don’t want.'],
  ['Recap and Share this day', 'Recap, on a trip’s page, sums the trip up: the numbers, every icon, then day by day. Save it as a PDF or as pictures. Share this day, on a board, makes one picture of that day for Messages or a post. Both are made on the phone; nothing is uploaded.'],
  ['Storage and updates', 'Everything lives on this phone, inside the app. The gauge below shows how much of what the phone allows is in use; archive a finished trip when it fills. New versions arrive when you reopen the app, or from Check for an update. If the app ever reopens by itself, that was an update taking over between screens.'],
];
async function settingsPage() {
  const my = renderSeq;
  const [name, autoOn, saved] = await Promise.all([db.setting('yourName', ''), db.setting('autoLookup', false), db.setting('packingTemplate', [])]);
  if (stale(my)) return;
  trail([{ t: 'Trips', h: '/' }, { t: 'Settings & help' }], '/');
  if (!paint(my, `<div class="mtm-stack">
    <h1 class="dr-title-xl">Settings &amp; help</h1>
    <div class="dr-panel mtm-stack mtm-stack--tight">
      <div class="dr-field"><label for="yourName">Your name</label><input class="dr-input" id="yourName" value="${esc(name)}" placeholder="First name is plenty" autocomplete="given-name" autocapitalize="words"><div class="dr-field__hint">Signs the note when you pass the notebook, and the recap’s cover.</div></div>
      <label class="dr-check"><input type="checkbox" id="autoLookup" ${autoOn ? 'checked' : ''}> Look up place names automatically when online</label>
      <div class="mtm-bar mtm-bar--between"><span class="dr-body-sm">Saved packing list: ${saved.length ? `${saved.length} item${saved.length === 1 ? '' : 's'}` : 'none yet'}</span>${saved.length ? '<button class="dr-btn dr-btn--ghost dr-btn--sm" id="forgetPack">Forget it</button>' : ''}</div>
      <div id="storage"></div>
      <div class="mtm-bar mtm-bar--between"><span class="dr-body-sm">Version ${APP_VERSION}</span><button class="dr-btn dr-btn--ghost dr-btn--sm" id="checkUpdate">Check for an update</button></div>
    </div>
    <div><div class="dr-eyebrow">How it works</div>
      <div class="mtm-stack mtm-stack--tight mtm-help">${HOW_IT_WORKS.map(([h, p]) => `<section class="dr-panel"><h2 class="dr-label">${esc(h)}</h2><p class="dr-body-sm">${esc(p)}</p></section>`).join('')}</div></div>
    <div class="mtm-foot">Moments That Matter is built for one phone at a time. Your trips never leave it unless you send them.</div>
  </div>`)) return;
  bindGo();
  const nameIn = $('#yourName');
  const saveName = debounce(async () => { await db.setSetting('yourName', nameIn.value.trim()); }, 400);
  nameIn.oninput = saveName;
  leaveHook = saveName.flush;
  $('#autoLookup').onchange = async (e) => { await db.setSetting('autoLookup', e.target.checked); toast(e.target.checked ? 'Place names will be looked up when online.' : 'Place names are yours to type.'); };
  const fp = $('#forgetPack'); if (fp) fp.onclick = async () => { await db.setSetting('packingTemplate', []); toast('Saved packing list forgotten.'); render(); };
  $('#checkUpdate').onclick = async () => {
    const btn = $('#checkUpdate'); btn.disabled = true; toast('Checking…');
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (!reg) { toast('No offline worker here; just reload.'); btn.disabled = false; return; }
      await reg.update();
      const fresh = reg.installing || reg.waiting;
      if (fresh) { toast('Update found. Reopening…'); fresh.addEventListener('statechange', () => { if (fresh.state === 'activated') location.reload(); }); }
      else toast(`You have the latest: version ${APP_VERSION}.`);
    } catch { toast('Could not check right now.'); }
    btn.disabled = false;
  };
  storageGauge().then((h) => { const el = $('#storage'); if (el) el.innerHTML = h; });
}

const mb = (n) => (n >= 1024 * 1048576 ? `${(n / 1073741824).toFixed(1)} GB` : `${Math.max(0.1, n / 1048576).toFixed(n < 10 * 1048576 ? 1 : 0)} MB`);
// How much of the phone the app is using (I21). The quota is the browser's offer, which iOS keeps modest.
async function storageGauge() {
  try {
    const est = await navigator.storage?.estimate?.();
    const persisted = await navigator.storage?.persisted?.();
    if (!est || est.usage == null) return '';
    const used = est.usage, quota = est.quota || 0;
    const share = quota ? used / quota : 0;
    const level = share >= 0.9 ? 'bad' : share >= 0.7 ? 'warn' : 'good';
    const note = share >= 0.9 ? 'Nearly full. Archive a past trip to make room.' : share >= 0.7 ? 'Getting full. Think about archiving a past trip.' : (persisted === false ? 'Storage not yet marked protected by the phone.' : 'Plenty of room.');
    return `<div class="mtm-gauge mtm-gauge--${level}">
      <div class="mtm-bar mtm-bar--between"><span class="dr-caption">Using ${mb(used)}${quota ? ` of about ${mb(quota)} the phone allows` : ' on this phone'}</span>${quota ? `<span class="dr-caption">${Math.round(share * 100)}%</span>` : ''}</div>
      ${quota ? `<div class="mtm-gauge__track"><div class="mtm-gauge__fill" style="width:${Math.max(1, Math.min(100, share * 100))}%"></div></div>` : ''}
      <div class="dr-caption">${note}</div>
    </div>`;
  } catch { return ''; }
}

function newTrip() {
  trail([{ t: 'Trips', h: '/' }, { t: 'New trip' }], '/');
  let days = 7;
  app.innerHTML = `<div class="mtm-stack">
    <h1 class="dr-title-xl">Start a trip</h1>
    <div class="dr-field"><label for="title">What do you call it?</label><input class="dr-input" id="title" placeholder="Name the trip" autocomplete="off"></div>
    <div class="dr-field"><label for="start">First day</label><input class="dr-input" id="start" type="date" value="${todayIso()}"></div>
    <div class="dr-field"><label>How many days?</label>
      <div class="mtm-stepper"><button type="button" id="minus" aria-label="Fewer days">−</button><output id="days">7</output><button type="button" id="plus" aria-label="More days">+</button></div>
      <div class="dr-field__hint">You can add or remove days later.</div></div>
    <div><button class="dr-btn" id="create">Start the trip</button></div>
  </div>`;
  const out = $('#days');
  $('#minus').onclick = () => { days = Math.max(1, days - 1); out.textContent = days; };
  $('#plus').onclick = () => { days = Math.min(120, days + 1); out.textContent = days; };
  $('#create').onclick = async () => {
    const trip = { id: uid(), title: $('#title').value.trim(), startDate: $('#start').value || todayIso(), dayCount: days,
      createdAt: Date.now(), updatedAt: Date.now(), pending: { changes: 0, bytes: 0 }, backup: { lastAt: 0 }, coverPhotoId: null };
    await db.put('trips', trip);
    go(`/t/${trip.id}`);
  };
}

function aboutPanel(trip, photoCount = 0, photoBytes = 0) {
  normalizeTrip(trip);
  const shown = TRIP_DETAILS.filter((d) => (trip.details[d.k] !== undefined && trip.details[d.k] !== '') || trip.extras.includes(d.k));
  const hidden = TRIP_DETAILS.filter((d) => !shown.includes(d));
  const field = (d) => `<div class="dr-field mtm-detail"><div class="mtm-bar mtm-bar--between"><label for="t-${d.k}">${esc(d.label)}</label><button type="button" class="mtm-x" data-tdrop="${d.k}" aria-label="Remove ${esc(d.label)}">×</button></div>
    <div class="mtm-bar"><span class="mtm-grow ${d.money ? 'mtm-money' : ''}"><input class="dr-input" id="t-${d.k}" data-tdetail="${d.k}" type="${d.type || 'text'}" ${d.type === 'url' ? 'inputmode="url" autocapitalize="none"' : ''} ${d.money ? 'inputmode="decimal"' : ''} value="${esc(trip.details[d.k] || '')}" placeholder="${esc(d.hint || '')}" autocomplete="off"></span>${d.type === 'url' && trip.details[d.k] ? `<a class="dr-btn dr-btn--ghost dr-btn--sm" href="${esc(asLink(trip.details[d.k]))}" target="_blank" rel="noopener">Open</a>` : ''}</div></div>`;
  const customRow = (c, k) => `<div class="dr-field mtm-detail"><div class="mtm-bar mtm-bar--between"><label for="tc-${k}">${esc(c.label)}</label><button type="button" class="mtm-x" data-tdropcustom="${k}" aria-label="Remove ${esc(c.label)}">×</button></div>
    <input class="dr-input" id="tc-${k}" data-tcustom="${k}" value="${esc(c.value || '')}" placeholder="${esc(c.label)}" autocomplete="off"></div>`;
  const packed = trip.packing.filter((p) => p.done).length;
  const bits = [];
  if (trip.places.length) bits.push(trip.places.map((p) => p.name).join(', '));
  if (trip.companions.length) bits.push(`with ${joinNames(trip.companions)}`);
  if (trip.packing.length) bits.push(`${packed} of ${trip.packing.length} packed`);
  if (photoCount) bits.push(`${photoCount} picture${photoCount === 1 ? '' : 's'}, ${mb(photoBytes)}`);
  const placesHtml = trip.places.map((p, k) => `<div class="mtm-place">
      <div class="mtm-bar mtm-bar--between"><span class="dr-label">${esc(p.name)}</span><button type="button" class="mtm-x" data-unplace="${k}" aria-label="Remove ${esc(p.name)}">×</button></div>
      ${p.cities.length ? `<div class="mtm-chips">${p.cities.map((c, j) => `<span class="mtm-person">${esc(c)}<button type="button" data-uncity="${k}:${j}" aria-label="Remove ${esc(c)}">×</button></span>`).join('')}</div>` : ''}
      <div class="mtm-bar" style="flex-wrap:nowrap"><input class="dr-input mtm-grow" data-newcity="${k}" placeholder="Add a city or town" autocomplete="off" autocapitalize="words" enterkeyhint="done"><button type="button" class="dr-btn dr-btn--quiet dr-btn--sm" data-addcity="${k}">Add</button></div>
    </div>`).join('');
  return `<details class="dr-panel mtm-about" id="about" ${aboutOpen ? 'open' : ''}>
    <summary><span class="dr-heading">About this trip</span><span class="dr-caption">${esc(bits.join(' · ') || 'who, what, and what to pack')}</span></summary>
    <div class="mtm-stack mtm-stack--tight mtm-about__body">
      <div class="dr-field"><label for="newPlace">Places</label>
        ${placesHtml}
        <div class="mtm-bar" style="flex-wrap:nowrap"><input class="dr-input mtm-grow" id="newPlace" placeholder="${trip.places.length ? 'Add another country or region' : 'Add a country or region'}" autocomplete="off" autocapitalize="words" enterkeyhint="done"><button type="button" class="dr-btn dr-btn--quiet dr-btn--sm" id="addPlace">Add</button></div></div>
      <div class="dr-field"><label for="newCompanion">Travelling with</label>
        ${trip.companions.length ? `<div class="mtm-chips">${trip.companions.map((n, k) => `<span class="mtm-person">${esc(n)}<button type="button" data-uncompanion="${k}" aria-label="Remove ${esc(n)}">×</button></span>`).join('')}</div>` : ''}
        <div class="mtm-bar" style="flex-wrap:nowrap"><input class="dr-input mtm-grow" id="newCompanion" placeholder="${trip.companions.length ? 'Add another person' : 'Add a person'}" autocomplete="off" autocapitalize="words" enterkeyhint="done"><button type="button" class="dr-btn dr-btn--quiet dr-btn--sm" id="addCompanion">Add</button></div></div>
      ${shown.map(field).join('')}
      ${trip.custom.map(customRow).join('')}
      ${ownTripOpen === trip.id ? `<div class="dr-field mtm-detail"><label for="ownTripLabel">Your own detail</label>
        <div class="mtm-bar" style="flex-wrap:nowrap"><input class="dr-input mtm-grow" id="ownTripLabel" placeholder="Name the detail" autocomplete="off" autocapitalize="words" enterkeyhint="done"><button type="button" class="dr-btn dr-btn--quiet dr-btn--sm" id="ownTripAdd">Add</button></div></div>` : ''}
      <div class="dr-field"><label for="addTripDetail">Add a trip detail</label><select class="dr-select" id="addTripDetail"><option value="">Choose one…</option>${hidden.map((d) => `<option value="${d.k}">${esc(d.label)}</option>`).join('')}<option value="__own">Your own…</option></select></div>
      <div class="dr-field"><label for="newPack">Packing list${trip.packing.length ? ` <span class="dr-caption">· ${packed} of ${trip.packing.length} packed</span>` : ''}</label>
        ${trip.packing.length ? `<div class="mtm-pack">${trip.packing.map((p, k) => `<div class="mtm-pack__item ${p.done ? 'is-done' : ''}"><label class="dr-check"><input type="checkbox" data-pack="${k}" ${p.done ? 'checked' : ''}><span>${esc(p.text)}</span></label><button type="button" class="mtm-x" data-unpack="${k}" aria-label="Remove ${esc(p.text)}">×</button></div>`).join('')}</div>` : ''}
        <div class="mtm-bar" style="flex-wrap:nowrap"><input class="dr-input mtm-grow" id="newPack" placeholder="Add an item" autocomplete="off" enterkeyhint="done"><button type="button" class="dr-btn dr-btn--quiet dr-btn--sm" id="addPack">Add</button></div>
        <div class="mtm-bar">${trip.packing.length ? '<button type="button" class="dr-btn dr-btn--ghost dr-btn--sm" id="savePack">Save this list for next time</button>' : ''}<button type="button" class="dr-btn dr-btn--ghost dr-btn--sm" id="usePack">Use my saved list</button></div></div>
    </div>
  </details>`;
}
function bindAbout(trip) {
  const about = $('#about');
  if (!about) return;
  about.addEventListener('toggle', () => { aboutOpen = about.open; try { localStorage.setItem('mtm-about', aboutOpen ? '1' : '0'); } catch { /* fine */ } });
  const saveText = debounce(async () => { await touch(trip); }, 400);
  leaveHook = saveText.flush;
  const commit = async () => { await saveText.flush(); await touch(trip); render(); };
  const npl = $('#newPlace');
  const addPlace = async () => { const n = (npl.value || '').trim(); if (!n) return; trip.places.push({ name: n, cities: [] }); npl.value = ''; await commit(); setTimeout(() => $(`[data-newcity="${trip.places.length - 1}"]`)?.focus(), 50); };
  npl.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addPlace(); } };
  $('#addPlace').onclick = addPlace;
  $$('[data-unplace]').forEach((x) => { x.onclick = async () => { trip.places.splice(Number(x.dataset.unplace), 1); await commit(); }; });
  $$('[data-newcity]').forEach((inp) => {
    const k = Number(inp.dataset.newcity);
    const addCity = async () => { const n = (inp.value || '').trim(); if (!n) return; trip.places[k].cities.push(n); inp.value = ''; await commit(); setTimeout(() => $(`[data-newcity="${k}"]`)?.focus(), 50); };
    inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addCity(); } };
    $(`[data-addcity="${k}"]`).onclick = addCity;
  });
  $$('[data-uncity]').forEach((x) => { x.onclick = async () => { const [k, j] = x.dataset.uncity.split(':').map(Number); trip.places[k].cities.splice(j, 1); await commit(); }; });
  const nc = $('#newCompanion');
  const addCompanion = async () => { const n = (nc.value || '').trim(); if (!n) return; trip.companions.push(n); nc.value = ''; await commit(); setTimeout(() => $('#newCompanion')?.focus(), 50); };
  nc.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addCompanion(); } };
  $('#addCompanion').onclick = addCompanion;
  $$('[data-uncompanion]').forEach((x) => { x.onclick = async () => { trip.companions.splice(Number(x.dataset.uncompanion), 1); await commit(); }; });
  $$('[data-tdetail]').forEach((inp) => {
    inp.oninput = () => { trip.details[inp.dataset.tdetail] = inp.value; saveText(); };
    if (inp.type === 'url') inp.onchange = async () => { await saveText.flush(); render(); };
  });
  $$('[data-tdrop]').forEach((x) => { x.onclick = async () => { const k = x.dataset.tdrop; delete trip.details[k]; trip.extras = trip.extras.filter((e) => e !== k); await commit(); }; });
  $$('[data-tcustom]').forEach((inp) => { inp.oninput = () => { trip.custom[Number(inp.dataset.tcustom)].value = inp.value; saveText(); }; });
  $$('[data-tdropcustom]').forEach((x) => { x.onclick = async () => { trip.custom.splice(Number(x.dataset.tdropcustom), 1); await commit(); }; });
  const add = $('#addTripDetail');
  add.onchange = async () => {
    if (!add.value) return;
    if (add.value === '__own') { ownTripOpen = trip.id; render(); setTimeout(() => $('#ownTripLabel')?.focus(), 50); return; }
    trip.extras.push(add.value); await commit(); setTimeout(() => $(`#t-${add.value}`)?.focus(), 50);
  };
  const ol = $('#ownTripLabel');
  if (ol) {
    const addOwn = async () => { const label = (ol.value || '').trim(); if (!label) return; trip.custom.push({ label, value: '' }); ownTripOpen = null; await commit(); setTimeout(() => $(`#tc-${trip.custom.length - 1}`)?.focus(), 50); };
    ol.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addOwn(); } };
    $('#ownTripAdd').onclick = addOwn;
  }
  const np = $('#newPack');
  const addPack = async () => { const t = (np.value || '').trim(); if (!t) return; trip.packing.push({ text: t, done: false }); np.value = ''; await commit(); setTimeout(() => $('#newPack')?.focus(), 50); };
  np.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addPack(); } };
  $('#addPack').onclick = addPack;
  $$('[data-pack]').forEach((cb) => { cb.onchange = async () => { trip.packing[Number(cb.dataset.pack)].done = cb.checked; await commit(); }; });
  const sp = $('#savePack');
  if (sp) sp.onclick = async () => { await db.setSetting('packingTemplate', trip.packing.map((p) => p.text)); toast(`Saved ${trip.packing.length} item${trip.packing.length === 1 ? '' : 's'} for next time.`); };
  $('#usePack').onclick = async () => {
    const saved = await db.setting('packingTemplate', []);
    if (!saved.length) return toast('No saved list yet. Build one here, then "Save this list for next time".');
    const have = new Set(trip.packing.map((p) => p.text.trim().toLowerCase()));
    const fresh = saved.filter((t) => !have.has(t.trim().toLowerCase()));
    fresh.forEach((t) => trip.packing.push({ text: t, done: false }));
    toast(fresh.length ? `Added ${fresh.length} item${fresh.length === 1 ? '' : 's'} from your saved list.` : 'Everything on your saved list is already here.');
    await commit();
  };
  $$('[data-unpack]').forEach((x) => { x.onclick = async () => { trip.packing.splice(Number(x.dataset.unpack), 1); await commit(); }; });
}

async function tripPage(trip) {
  const my = renderSeq;
  const blocks = await db.where('blocks', 'tripId', trip.id);
  const photos = await db.where('photos', 'tripId', trip.id);
  const dayRecords = await db.where('days', 'tripId', trip.id);
  if (stale(my)) return;
  trail([{ t: 'Trips', h: '/' }, { t: trip.title || 'Untitled trip' }], '/');
  const dayByIndex = Object.fromEntries(dayRecords.map((d) => [d.index, keyify(d)]));
  const byDay = {};
  blocks.forEach((b) => { (byDay[b.dayIndex] = byDay[b.dayIndex] || []).push(b); });
  const rows = [];
  for (let i = 0; i < trip.dayCount; i++) {
    const d = dayByIndex[i] || keyify({ id: dayId(trip.id, i), tripId: trip.id, index: i, city: '', weather: '' });
    const bs = (byDay[i] || []).sort((a, b) => a.order - b.order);
    const withPhoto = bs.find((b) => b.photoId);
    const ph = (d.keyPhotos[0] && photos.find((p) => p.id === d.keyPhotos[0])) || (withPhoto ? photos.find((p) => p.id === withPhoto.photoId) : null);
    const art = ph ? `<div class="dr-row__art dr-row__art--disc"><img src="${photoUrl(ph)}" alt=""></div>` : `<div class="mtm-daynum">${i + 1}</div>`;
    const meta = bs.length ? `${d.city ? esc(d.city) + ' · ' : ''}${bs.length} moment${bs.length === 1 ? '' : 's'}` : (d.city ? esc(d.city) + ' · nothing yet' : 'Nothing yet');
    const snap = bs.slice(0, 8).map((b) => esc(b.emoji || '·')).join('') + (bs.length > 8 ? `<small>+${bs.length - 8}</small>` : '');
    rows.push(`<div class="dr-row ${bs.length ? '' : 'is-empty'}" data-go="/t/${trip.id}/d/${i}" role="button" tabindex="0" aria-label="Day ${i + 1}">${art}
      <div class="dr-row__text"><div class="dr-row__title">Day ${i + 1} · ${fmtDay(addDays(trip.startDate, i))}</div><div class="dr-row__meta">${meta}</div>${snap ? `<div class="mtm-snap" title="${bs.length} moments">${snap}</div>` : ''}</div>
      <div class="dr-row__end">${d.weather ? `<span class="mtm-snap">${esc(d.weather)}</span>` : ''}${isPassed(trip) ? '' : `<button class="mtm-more" data-more="${i}" aria-label="Day ${i + 1} options">⋯</button>`}</div></div>`);
  }
  const due = backupDue(trip);
  const last = trip.backup?.lastAt;
  const tripBytes = photos.reduce((n, p) => n + (p.bytes || p.blob?.size || 0), 0);
  if (!paint(my, `<div class="mtm-stack">
    <div><div class="dr-eyebrow">${fmtRange(trip)}${tripWhen(trip).phase === 'before' ? ' · ' + tripWhen(trip).text : ''}</div>
      <div class="mtm-titlerow"><h1 class="dr-title-xl" id="tripTitle">${esc(trip.title || 'Untitled trip')}</h1>${isPassed(trip) ? '' : '<button class="mtm-pencil" id="editTitle" aria-label="Rename the trip">✎</button>'}</div></div>
    ${isPassed(trip) ? `<div class="dr-panel dr-accent-acid mtm-passed"><div class="dr-eyebrow">Passed on ${fmtDay(new Date(trip.passedOn.at))}</div><p class="dr-body">Someone else is writing in it. It is read-only here until their file comes back through Import a trip.</p><button class="dr-btn dr-btn--quiet dr-btn--sm" id="takeBack">Take it back</button></div>` : ''}
    <div ${isPassed(trip) ? 'inert' : ''}>${aboutPanel(trip, photos.length, tripBytes)}</div>
    <div class="mtm-backup">
      <button class="dr-btn dr-btn--sm" data-go="/t/${trip.id}/recap">Recap</button>
      <button class="dr-btn ${due ? '' : 'dr-btn--quiet'} dr-btn--sm" id="backup">Back up this trip</button>
      ${isPassed(trip) ? '' : '<button class="dr-btn dr-btn--ghost dr-btn--sm" id="pass">Pass the notebook</button>'}
      <span class="dr-caption">${last ? `Backed up ${ago(last)}` : 'Never backed up'}${due ? ' · <b style="color:var(--state-warn)">new moments since</b>' : ''}</span>
    </div>
    <div class="dr-list">${rows.join('')}</div>
    ${isPassed(trip) ? '' : `<div class="mtm-bar">
      <button class="dr-btn dr-btn--ghost dr-btn--sm" id="addDay">Add a day at the end</button>
      <button class="dr-btn dr-btn--ghost dr-btn--sm" id="rename">Rename</button>
    </div>`}
    <div class="mtm-bar mtm-endbar">
      <button class="dr-btn dr-btn--ghost dr-btn--sm" id="archive">Archive: back up, then remove from this phone</button>
      <button class="dr-btn dr-btn--ghost dr-btn--sm" id="delete">Delete trip</button>
    </div>
  </div>`)) return;
  bindGo();
  bindAbout(trip);
  $('#backup').onclick = () => backupTrip(trip);
  $('#archive').onclick = () => archiveTrip(trip);
  const passBtn = $('#pass'); if (passBtn) passBtn.onclick = () => passNotebook(trip);
  const tb = $('#takeBack'); if (tb) tb.onclick = () => takeBack(trip);
  const addDayBtn = $('#addDay'); if (addDayBtn) addDayBtn.onclick = async () => { trip.dayCount += 1; await touch(trip); render(); };
  $$('[data-more]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const i = Number(btn.dataset.more);
      const n = (byDay[i] || []).length;
      const k = await sheet(`Day ${i + 1} · ${fmtDay(addDays(trip.startDate, i))}`, [
        { k: 'send', label: n ? `Send this day to someone (${n} moment${n === 1 ? '' : 's'})` : 'Send this day to someone', disabled: !n },
        { k: 'before', label: 'Slide a day in before' },
        { k: 'after', label: 'Slide a day in after' },
        { k: 'earlier', label: 'Move earlier', disabled: i === 0 },
        { k: 'later', label: 'Move later', disabled: i === trip.dayCount - 1 },
        { k: 'remove', label: n ? `Remove this day and its ${n} moment${n === 1 ? '' : 's'}` : 'Remove this day', danger: true, disabled: trip.dayCount <= 1 },
      ]);
      if (!k) return;
      if (k === 'send') { await sendDay(trip, i); return; }
      const c = trip.dayCount;
      if (k === 'before') await remapDays(trip, (o) => (o >= i ? o + 1 : o), c + 1);
      if (k === 'after') await remapDays(trip, (o) => (o > i ? o + 1 : o), c + 1);
      if (k === 'earlier') await remapDays(trip, (o) => (o === i ? i - 1 : o === i - 1 ? i : o), c);
      if (k === 'later') await remapDays(trip, (o) => (o === i ? i + 1 : o === i + 1 ? i : o), c);
      if (k === 'remove') {
        if (n && !confirm(`Remove day ${i + 1} and its ${n} moment${n === 1 ? '' : 's'}? This cannot be undone.`)) return;
        await remapDays(trip, (o) => (o === i ? -1 : o > i ? o - 1 : o), c - 1);
      }
      render();
    });
  });
  const renameInline = () => {
    const h = $('#tripTitle'); if (!h) return;
    const input = document.createElement('input');
    input.className = 'mtm-city mtm-titleedit'; input.value = trip.title || ''; input.placeholder = 'Name the trip'; input.setAttribute('aria-label', 'Trip name');
    h.replaceWith(input); input.focus(); input.select();
    let done = false;
    const finish = async (keep) => {
      if (done) return; done = true;
      if (keep) { trip.title = input.value.trim(); await touch(trip); }
      render();
    };
    input.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); finish(true); } if (e.key === 'Escape') finish(false); };
    input.onblur = () => finish(true);
  };
  const et = $('#editTitle'); if (et) et.onclick = renameInline;
  const rn = $('#rename'); if (rn) rn.onclick = renameInline;
  $('#delete').onclick = async () => {
    if (!confirm(`Delete “${trip.title || 'this trip'}” and everything in it? Back it up first if you want to keep it.`)) return;
    await deleteTrip(trip.id); go('/');
  };
}

// Hand files to the share sheet, or download them where there is no share sheet.
async function deliverFiles(files, title, text) {
  if (navigator.canShare && navigator.canShare({ files })) {
    try { await navigator.share(text ? { files, title, text } : { files, title }); return true; } catch (e) { if (e.name === 'AbortError') return false; }
  }
  for (const f of files) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click();
    await new Promise((r) => setTimeout(r, 400)); URL.revokeObjectURL(a.href); a.remove();
  }
  return true;
}

// The Recap: the trip summed up, and exported as a PDF or pictures (Decision, 2026-10-17).
async function recapPage(trip) {
  const my = renderSeq;
  const data = await gather(trip);
  if (stale(my)) return;
  trail([{ t: 'Trips', h: '/' }, { t: trip.title || 'Trip', h: `/t/${trip.id}` }, { t: 'Recap' }], `/t/${trip.id}`);
  const S = stats(data);
  if (!paint(my, renderRecap(data, S, photoUrl))) return;
  bindGo();
  const baseName = `${(trip.title || 'Trip').replace(/[\/:*?"<>|]+/g, ' ').trim()} recap`;
  const busy = (on) => $$('#savePdf, #sharePics').forEach((b) => { b.disabled = on; });
  $('#savePdf').onclick = async () => {
    busy(true); toast('Drawing the pages…');
    try {
      const pages = await drawPages(data, S);
      const pdf = await pagesToPdf(pages);
      const ok = await deliverFiles([new File([pdf], `${baseName}.pdf`, { type: 'application/pdf' })], baseName);
      toast(ok ? `PDF ready: ${pages.length} page${pages.length === 1 ? '' : 's'}.` : 'Cancelled.');
    } catch (e) { console.error(e); toast('Could not make the PDF.'); }
    busy(false);
  };
  $('#sharePics').onclick = async () => {
    busy(true); toast('Drawing the pages…');
    try {
      const pages = await drawPages(data, S);
      const files = await pagesToPictures(pages, baseName);
      const ok = await deliverFiles(files, baseName);
      toast(ok ? `${files.length} picture${files.length === 1 ? '' : 's'} ready.` : 'Cancelled.');
    } catch (e) { console.error(e); toast('Could not make the pictures.'); }
    busy(false);
  };
}

let ownOpen = null; // block id whose "Your own" row is open
let view = 'tiles';
try { view = localStorage.getItem('mtm-view') || 'tiles'; } catch { /* storage blocked: default view */ }
let dragMoved = false;

async function board(trip, i) {
  if (!(i >= 0 && i < trip.dayCount)) return go(`/t/${trip.id}`);
  const my = renderSeq;
  const day = await getDay(trip.id, i);
  const blocks = await blocksForDay(day.id);
  const stays = await staysCovering(trip.id, i);
  const photos = await db.where('photos', 'tripId', trip.id);
  if (stale(my)) return;
  const pmap = Object.fromEntries(photos.map((p) => [p.id, p]));
  trail([{ t: 'Trips', h: '/' }, { t: trip.title || 'Trip', h: `/t/${trip.id}` }, { t: `Day ${i + 1}${day.city ? ' · ' + day.city : ''}` }], `/t/${trip.id}`);

  const tile = (b) => {
    const ph = b.photoId ? pmap[b.photoId] : null;
    const keyN = ph ? day.keyPhotos.indexOf(ph.id) + 1 : 0;
    const face = ph ? `<img src="${photoUrl(ph)}" alt=""><span class="mtm-block__badge">${esc(b.emoji || '🏷️')}</span>${keyN ? `<span class="mtm-block__key" title="Key picture ${keyN}">${keyN}</span>` : ''}`
      : (b.emoji ? `<div class="mtm-block__emoji">${esc(b.emoji)}</div>` : `<div class="mtm-block__emoji mtm-block__emoji--word">${esc(cap(b.label))}</div>`);
    return `<div class="dr-tile mtm-block" data-id="${b.id}" role="button" tabindex="0" aria-label="${esc(titleOf(b))}">
      <div class="dr-cover">${face}</div>
      <div class="dr-tile__title">${esc(titleOf(b))}</div>
      <div class="dr-tile__meta">${esc(blockMeta(b)) || '&nbsp;'}</div></div>`;
  };
  const row = (b, idx) => {
    const ph = b.photoId ? pmap[b.photoId] : null;
    const art = ph ? `<div class="dr-row__art"><img src="${photoUrl(ph)}" alt=""></div>` : `<div class="mtm-daynum">${esc(b.emoji || '•')}</div>`;
    return `<div class="dr-row mtm-rowblock" data-id="${b.id}" role="button" tabindex="0" aria-label="${esc(titleOf(b))}">${art}
      <div class="dr-row__text"><div class="dr-row__title">${esc(titleOf(b))}</div><div class="dr-row__meta">${esc(blockMeta(b))}</div></div>
      <div class="dr-row__end mtm-move">
        <button data-move="-1" data-id="${b.id}" ${idx === 0 || isPassed(trip) ? 'disabled' : ''} aria-label="Move up">↑</button>
        <button data-move="1" data-id="${b.id}" ${idx === blocks.length - 1 || isPassed(trip) ? 'disabled' : ''} aria-label="Move down">↓</button>
      </div></div>`;
  };
  if (!paint(my, `<div class="mtm-stack">
    <div class="mtm-stack mtm-stack--tight">
      <div class="dr-eyebrow">Day ${i + 1} of ${trip.dayCount} · ${fmtDay(addDays(trip.startDate, i))}</div>
      <input class="mtm-city" id="city" placeholder="Where were you?" value="${esc(day.city)}" autocomplete="off" aria-label="City or area" list="plannedCities" ${isPassed(trip) ? 'disabled' : ''}>
      <datalist id="plannedCities">${(normalizeTrip(trip).places || []).flatMap((p) => p.cities).map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
      <div class="mtm-weather" id="weather" ${isPassed(trip) ? 'inert' : ''}>${WEATHER.map((w) => `<button class="mtm-chip ${day.weather === w ? 'is-on' : ''}" data-w="${w}" aria-label="Weather ${w}">${w}</button>`).join('')}</div>
      ${isPassed(trip) ? '<div class="dr-caption">Passed on. Read-only until it comes back.</div>' : ''}
    </div>
    ${stays.length ? `<div class="mtm-carry">${stays.map((s) => `<button class="dr-magnet" data-go="/t/${trip.id}/d/${s.dayIndex}/b/${s.id}"><span style="font-size:22px">🏨</span>${esc(s.title || 'Stay')} · night ${i - s.dayIndex + 1}</button>`).join('')}</div>` : ''}
    <div class="mtm-bar mtm-bar--between">
      <span class="dr-caption">${blocks.length ? `${blocks.length} moment${blocks.length === 1 ? '' : 's'}` : 'Nothing here yet'}</span>
      <div class="mtm-bar" style="gap:8px"><button class="dr-btn dr-btn--quiet dr-btn--sm" id="shareDay" ${blocks.length ? '' : 'disabled'}>Share this day</button><div class="mtm-seg"><button data-view="tiles" class="${view === 'tiles' ? 'is-on' : ''}">Tiles</button><button data-view="list" class="${view === 'list' ? 'is-on' : ''}">List</button></div></div>
    </div>
    ${blocks.length
      ? (view === 'tiles' ? `<div class="mtm-grid" id="grid">${blocks.map(tile).join('')}</div>` : `<div class="dr-list">${blocks.map(row).join('')}</div>`)
      : '<div class="mtm-empty"><p class="dr-body-lg">Tap <strong>+</strong> to add the first moment of the day. A coffee counts.</p></div>'}
  </div>
  ${isPassed(trip) ? '' : `<button class="dr-btn dr-btn--icon mtm-fab" aria-label="Add a moment" data-go="/t/${trip.id}/d/${i}/add">+</button>`}`)) return;
  bindGo();

  const city = $('#city');
  const saveCity = debounce(async () => { day.city = city.value.trim(); await db.put('days', day); await touch(trip); }, 400);
  city.oninput = saveCity;
  leaveHook = saveCity.flush;
  $('#weather').onclick = async (e) => {
    const b = e.target.closest('[data-w]'); if (!b) return;
    day.weather = day.weather === b.dataset.w ? '' : b.dataset.w;
    await db.put('days', day); await touch(trip);
    $$('.mtm-chip', $('#weather')).forEach((c) => c.classList.toggle('is-on', c.dataset.w === day.weather));
  };
  $('#shareDay').onclick = async () => {
    const btn = $('#shareDay'); btn.disabled = true; toast('Drawing your day…');
    try {
      const data = await gather(trip);
      const card = await drawDayCard(data, i);
      const name = `${(trip.title || 'Trip').replace(/[\\/:*?"<>|]+/g, ' ').trim()} day ${i + 1}.jpg`;
      const blob = await new Promise((r) => card.toBlob(r, 'image/jpeg', 0.9));
      const ok = await deliverFiles([new File([blob], name, { type: 'image/jpeg' })], `Day ${i + 1}`);
      toast(ok ? 'Your day, as one picture.' : 'Cancelled.');
    } catch (e) { console.error(e); toast('Could not draw the day.'); }
    btn.disabled = false;
  };
  $$('.mtm-seg button').forEach((b) => { b.onclick = () => { view = b.dataset.view; try { localStorage.setItem('mtm-view', view); } catch { /* fine */ } render(); }; });
  $$('.mtm-block').forEach((el) => {
    el.addEventListener('click', () => { if (!dragMoved) go(`/t/${trip.id}/d/${i}/b/${el.dataset.id}`); });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(`/t/${trip.id}/d/${i}/b/${el.dataset.id}`); });
  });
  $$('.mtm-rowblock').forEach((el) => {
    el.addEventListener('click', (e) => { if (!e.target.closest('[data-move]')) go(`/t/${trip.id}/d/${i}/b/${el.dataset.id}`); });
  });
  $$('[data-move]').forEach((b) => {
    b.onclick = async () => {
      const from = blocks.findIndex((x) => x.id === b.dataset.id);
      const to = from + Number(b.dataset.move);
      if (to < 0 || to >= blocks.length) return;
      const [m] = blocks.splice(from, 1); blocks.splice(to, 0, m);
      await saveOrder(blocks, trip); render();
    };
  });
  if (view === 'tiles' && blocks.length > 1 && !isPassed(trip)) enableDrag($('#grid'), blocks, trip);
}

// Drag a tile to a new spot. Mouse: drag at once. Touch: hold a moment first, so scrolling still works.
function enableDrag(grid, blocks, trip) {
  let src = null, active = false, timer = null, startX = 0, startY = 0, pid = null;
  const tiles = () => $$('.mtm-block', grid);
  const begin = () => {
    active = true; dragMoved = true;
    src.classList.add('is-dragging');
    try { src.setPointerCapture(pid); } catch { /* not supported: still works without capture */ }
    if (navigator.vibrate) navigator.vibrate(8);
  };
  grid.addEventListener('pointerdown', (e) => {
    const t = e.target.closest('.mtm-block');
    if (!t || e.button) return;
    src = t; startX = e.clientX; startY = e.clientY; pid = e.pointerId; dragMoved = false;
    clearTimeout(timer);
    if (e.pointerType === 'mouse') begin(); else timer = setTimeout(begin, 260);
  });
  grid.addEventListener('pointermove', (e) => {
    if (!src) return;
    if (!active) { if (Math.hypot(e.clientX - startX, e.clientY - startY) > 8) { clearTimeout(timer); src = null; } return; }
    e.preventDefault();
    src.style.transform = `translate(${e.clientX - startX}px, ${e.clientY - startY}px)`;
    src.style.pointerEvents = 'none';
    const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('.mtm-block');
    src.style.pointerEvents = '';
    tiles().forEach((t) => t.classList.toggle('is-over', t === over && t !== src));
  });
  const end = async () => {
    clearTimeout(timer);
    if (!src) return;
    const s = src; src = null;
    if (!active) return;
    active = false;
    s.classList.remove('is-dragging'); s.style.transform = '';
    const list = tiles();
    const over = list.find((t) => t.classList.contains('is-over'));
    list.forEach((t) => t.classList.remove('is-over'));
    setTimeout(() => { dragMoved = false; }, 80);
    if (over && over !== s) {
      const from = list.indexOf(s), to = list.indexOf(over);
      const [m] = blocks.splice(from, 1); blocks.splice(to, 0, m);
      await saveOrder(blocks, trip); render();
    }
  };
  grid.addEventListener('pointerup', end);
  grid.addEventListener('pointercancel', end);
  grid.addEventListener('touchmove', (e) => { if (active) e.preventDefault(); }, { passive: false });
  grid.addEventListener('contextmenu', (e) => { if (active || src) e.preventDefault(); });
}

function addPage(trip, i) {
  trail([{ t: 'Trips', h: '/' }, { t: trip.title || 'Trip', h: `/t/${trip.id}` }, { t: `Day ${i + 1}`, h: `/t/${trip.id}/d/${i}` }, { t: 'Add' }], `/t/${trip.id}/d/${i}`);
  app.innerHTML = `<div class="mtm-stack">
    <h1 class="dr-title">Add to day ${i + 1}</h1>
    <div class="mtm-kinds">${KINDS.map((k) => `<button class="mtm-kind" data-kind="${k.key}"><span class="mtm-kind__emoji">${k.emoji}</span><span class="mtm-kind__name">${esc(k.name)}</span></button>`).join('')}</div>
    <div id="askPanel"></div>
    <div class="dr-field"><label for="q">Or type anything</label>
      <input class="dr-input dr-input--search" id="q" placeholder="Type anything" autocomplete="off" autocapitalize="none" enterkeyhint="done"></div>
    <div class="mtm-gallery" id="gallery"></div>
  </div>`;
  const q = $('#q'), gal = $('#gallery');
  if (!q || !gal) return; // the screen moved on while this was drawing
  const draw = () => {
    if (!q.isConnected) return;
    const s = q.value.trim().toLowerCase();
    const list = (s ? WORDS.filter((w) => w.word.includes(s)) : WORDS).slice(0, 80);
    const exact = s && WORDS.some((w) => w.word === s);
    gal.innerHTML = (s && !exact ? `<button class="mtm-word mtm-word--new" data-new="1"><em>${emojiFor(s) || '✚'}</em>Add “${esc(q.value.trim())}”</button>` : '')
      + list.map((w) => `<button class="mtm-word" data-word="${esc(w.word)}" data-emoji="${w.emoji}"><em>${w.emoji}</em>${esc(w.word)}</button>`).join('');
  };
  draw();
  q.oninput = draw;
  q.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); gal.querySelector('button')?.click(); } };
  app.onclick = async (e) => {
    const k = e.target.closest('[data-kind]'), w = e.target.closest('[data-word]'), n = e.target.closest('[data-new]');
    if (!k && !w && !n) return;
    let partial;
    if (k) {
      const kind = kindOf(k.dataset.kind);
      if (ASK_FIRST.includes(kind.key)) { askFirst(trip, i, kind); return; }
      partial = { kind: kind.key, emoji: kind.emoji, label: kind.name };
    }
    else if (w) partial = { kind: 'other', emoji: w.dataset.emoji, label: w.dataset.word };
    else { const word = q.value.trim(); partial = { kind: 'other', emoji: emojiFor(word), label: word }; }
    await createBlock(trip, i, partial);
  };
}

// Kinds that ask what you did before anything else; the icon follows the words (Matt, seventh look).
const ASK_FIRST = ['activity'];
function askFirst(trip, i, kind) {
  const panel = $('#askPanel');
  $$('.mtm-kind').forEach((k) => k.classList.toggle('is-on', k.dataset.kind === kind.key));
  panel.innerHTML = `<div class="dr-panel mtm-ask">
    <label class="dr-field" for="askTitle"><span class="dr-label">What did you do?</span>
      <div class="mtm-bar" style="flex-wrap:nowrap"><span class="mtm-ask__emoji" id="askEmoji">${kind.emoji}</span><input class="dr-input mtm-grow" id="askTitle" placeholder="What did you do?" autocomplete="off" enterkeyhint="done"><button type="button" class="dr-btn dr-btn--sm" id="askGo">Add</button></div></label>
  </div>`;
  const input = $('#askTitle'), face = $('#askEmoji');
  input.oninput = () => { face.textContent = emojiFromText(input.value) || kind.emoji; };
  const go = () => {
    const title = input.value.trim();
    createBlock(trip, i, { kind: kind.key, emoji: emojiFromText(title) || kind.emoji, label: kind.name, title });
  };
  input.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
  $('#askGo').onclick = go;
  input.focus();
  setTimeout(() => panel.scrollIntoView({ block: 'center' }), 60);
}

async function createBlock(trip, i, partial) {
  const day = await getDay(trip.id, i);
  if (!(await db.get('days', day.id))) await db.put('days', day);
  const existing = await blocksForDay(day.id);
  const b = { id: uid(), tripId: trip.id, dayId: day.id, dayIndex: i, order: existing.length, title: '', note: '',
    fields: {}, details: {}, extras: [], place: { name: '', lat: null, lon: null }, photoId: null, createdAt: Date.now(), ...partial };
  await db.put('blocks', b);
  await touch(trip);
  go(`/t/${trip.id}/d/${i}/b/${b.id}`);
}

async function editor(trip, i, bid) {
  const my = renderSeq;
  const b = await db.get('blocks', bid);
  if (!b) return go(`/t/${trip.id}/d/${i}`);
  normalize(b);
  const kind = kindOf(b.kind);
  const ph = b.photoId ? await db.get('photos', b.photoId) : null;
  const day = await getDay(trip.id, i);
  const keyN = ph ? day.keyPhotos.indexOf(ph.id) + 1 : 0;
  const keyFull = day.keyPhotos.length >= KEY_MAX;
  const family = await familyOf(b);
  if (stale(my)) return;
  const onDays = new Set(family.map((x) => x.dayIndex));
  const dayChips = Array.from({ length: trip.dayCount }, (_, d) => `<button type="button" class="mtm-chip mtm-chip--text ${onDays.has(d) ? 'is-on' : ''}" data-day="${d}" ${d === i ? 'disabled' : ''}>Day ${d + 1}</button>`).join('');
  trail([{ t: 'Trips', h: '/' }, { t: trip.title || 'Trip', h: `/t/${trip.id}` }, { t: `Day ${i + 1}${day.city ? ' · ' + day.city : ''}`, h: `/t/${trip.id}/d/${i}` }, { t: titleOf(b) }], `/t/${trip.id}/d/${i}`);

  const field = (f) => {
    const v = b.fields[f.k] ?? '';
    if (f.type === 'people') {
      const list = b.fields.people || [];
      return `<div class="dr-field"><label for="newPerson">${esc(f.label)}</label>
        ${list.length ? `<div class="mtm-chips">${list.map((n, k) => `<span class="mtm-person">${esc(n)}<button type="button" data-unperson="${k}" aria-label="Remove ${esc(n)}">×</button></span>`).join('')}</div>` : ''}
        <div class="mtm-bar" style="flex-wrap:nowrap"><input class="dr-input mtm-grow" id="newPerson" placeholder="${list.length ? 'Add another person' : 'Add a person'}" autocomplete="off" autocapitalize="words" enterkeyhint="done"><button type="button" class="dr-btn dr-btn--quiet dr-btn--sm" id="addPerson">Add</button></div></div>`;
    }
    if (f.type === 'chips') {
      return `<div class="dr-field"><label>${esc(f.label)}</label><div class="mtm-chips">${
        f.options.map((o) => `<button type="button" class="mtm-chip mtm-chip--text ${v === o ? 'is-on' : ''}" data-chip="${f.k}" data-val="${esc(o)}">${esc(o)}</button>`).join('')
      }</div></div>`;
    }
    return `<div class="dr-field"><label for="f-${f.k}">${esc(f.label)}</label>
      <input class="dr-input" id="f-${f.k}" data-field="${f.k}" type="${f.type === 'number' ? 'number' : 'text'}" ${f.type === 'number' ? 'inputmode="numeric" min="1"' : ''} value="${esc(v)}" placeholder="${esc(f.hint || '')}" autocomplete="off"></div>`;
  };
  const shown = DETAILS.filter((d) => (b.details[d.k] !== undefined && b.details[d.k] !== '') || b.extras.includes(d.k));
  const hidden = DETAILS.filter((d) => !shown.includes(d));
  const detail = (d) => `<div class="dr-field mtm-detail"><div class="mtm-bar mtm-bar--between"><label for="d-${d.k}">${esc(d.label)}</label><button type="button" class="mtm-x" data-drop="${d.k}" aria-label="Remove ${esc(d.label)}">×</button></div>
    ${d.type === 'rating'
      ? `<div class="mtm-chips">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="mtm-chip ${Number(b.details.rating) >= n ? 'is-on' : ''}" data-star="${n}" aria-label="${n} of 5">★</button>`).join('')}</div>`
      : `<div class="mtm-bar"><span class="mtm-grow ${d.k === 'cost' ? 'mtm-money' : ''}"><input class="dr-input" id="d-${d.k}" data-detail="${d.k}" type="${d.type || 'text'}" ${d.type === 'url' ? 'inputmode="url" autocapitalize="none"' : ''} ${d.k === 'cost' ? 'inputmode="decimal"' : ''} ${d.numeric ? 'inputmode="numeric"' : ''} value="${esc(b.details[d.k] || '')}" placeholder="${esc(d.hint || '')}" autocomplete="off"></span>${d.type === 'url' && b.details[d.k] ? `<a class="dr-btn dr-btn--ghost dr-btn--sm" href="${esc(asLink(b.details[d.k]))}" target="_blank" rel="noopener">Open</a>` : ''}</div>`}</div>`;
  const customRow = (c, k) => `<div class="dr-field mtm-detail"><div class="mtm-bar mtm-bar--between"><label for="c-${k}">${esc(c.label)}</label><button type="button" class="mtm-x" data-dropcustom="${k}" aria-label="Remove ${esc(c.label)}">×</button></div>
    <input class="dr-input" id="c-${k}" data-custom="${k}" value="${esc(c.value || '')}" placeholder="${esc(c.label)}" autocomplete="off"></div>`;
  const ownRow = ownOpen === b.id ? `<div class="dr-field mtm-detail"><label for="ownLabel">Your own detail</label>
    <div class="mtm-bar" style="flex-wrap:nowrap"><input class="dr-input mtm-grow" id="ownLabel" placeholder="Name the detail" autocomplete="off" autocapitalize="words" enterkeyhint="done"><button type="button" class="dr-btn dr-btn--quiet dr-btn--sm" id="ownAdd">Add</button></div></div>` : '';

  if (!paint(my, `<div class="mtm-stack">
    <div class="mtm-editor-head">
      ${b.emoji ? `<span class="mtm-big">${esc(b.emoji)}</span>` : `<span class="mtm-big mtm-big--word">${esc(cap(b.label))}</span>`}
      <div><div class="dr-eyebrow">${esc(kind ? kind.name : cap(b.label))}</div><div class="dr-caption">Day ${i + 1} · ${fmtDay(addDays(trip.startDate, i))}</div></div>
    </div>
    <label class="mtm-photo ${ph ? 'has-picture' : ''}" ${ph && ph.w && ph.h ? `style="aspect-ratio: ${ph.w} / ${ph.h}"` : ''}>
      ${ph ? `<img src="${photoUrl(ph)}" alt="">` : '<div class="mtm-photo__empty"><span style="font-size:40px">🖼️</span><b>Add a picture</b><span class="dr-caption">From your photos. Place and time fill in when the photo carries them.</span></div>'}
      <input type="file" accept="image/*" id="photoFile" aria-label="Choose a picture">
    </label>
    ${ph ? `<div class="mtm-bar"><button class="dr-btn ${keyN ? 'dr-btn--quiet' : 'dr-btn--ghost'} dr-btn--sm" id="keyPhoto" ${!keyN && keyFull ? 'disabled' : ''}>${keyN ? `Key picture ${keyN} of ${KEY_MAX} · tap to take it off` : keyFull ? `The day’s ${KEY_MAX} key pictures are chosen` : `Make this key picture ${day.keyPhotos.length + 1} of ${KEY_MAX}`}</button><button class="dr-btn dr-btn--ghost dr-btn--sm" id="removePhoto">Remove picture</button></div>` : ''}
    <div class="mtm-fields">
      <div class="dr-field"><label for="title">${['place', 'stay', 'other'].includes(b.kind) ? 'Name' : 'Title'}</label><input class="dr-input" id="title" value="${esc(b.title)}" placeholder="${esc(autoTitle(b) || kind?.hint || cap(b.label))}" autocomplete="off"></div>
      ${(kind?.fields || []).map(field).join('')}
      <div class="dr-field mtm-where"><label for="where">Where</label>
        <div class="dr-caption mtm-placetrail" id="placeTrail">${esc(countryOf(trip, day.city))} › ${esc(day.city || '…')} › <b>${esc(b.place.name || '…')}</b></div>
        <input class="dr-input" id="where" value="${esc(b.place.name || '')}" placeholder="Where" autocomplete="off">
        <div class="mtm-bar"><span class="mtm-coords" id="coords">${coordsText(b.place)}</span><button type="button" class="dr-btn dr-btn--ghost dr-btn--sm" id="locate">Use my location</button>${b.place.lat != null ? '<button type="button" class="dr-btn dr-btn--ghost dr-btn--sm" id="lookup">Look up the name</button>' : ''}</div>
      </div>
      <div class="dr-field"><label for="note">Note</label><textarea class="dr-textarea" id="note" rows="3" placeholder="Only if you want to.">${esc(b.note)}</textarea></div>
      ${shown.map(detail).join('')}
      ${b.custom.map(customRow).join('')}
      ${ownRow}
      <div class="dr-field"><label>Also on</label><div class="mtm-chips" id="alsoDays">${dayChips}</div>
        <div class="dr-field__hint">Tap a day to put this there too. The name and place travel with it; each day keeps its own picture, note and details.</div></div>
      <div class="dr-field"><label for="addDetail">Add a detail</label><select class="dr-select" id="addDetail"><option value="">Choose one…</option>${hidden.map((d) => `<option value="${d.k}">${esc(d.label)}</option>`).join('')}<option value="__own">Your own…</option></select></div>
    </div>
    <div class="mtm-bar mtm-bar--between">
      <button class="dr-btn dr-btn--ghost dr-btn--sm" id="deleteBlock">Delete this moment</button>
      <button class="dr-btn" id="done">Done</button>
    </div>
  </div>`)) return;

  const save = debounce(async () => { await db.put('blocks', b); await syncFamily(b); await touch(trip); }, 350);
  leaveHook = save.flush;
  $$('#alsoDays [data-day]').forEach((chip) => {
    chip.onclick = async () => {
      const d = Number(chip.dataset.day);
      await save.flush();
      const there = family.find((x) => x.dayIndex === d);
      if (there) {
        if (there.photoId && !confirm(`Day ${d + 1}'s copy has its own picture. Remove it anyway?`)) return;
        if (there.photoId) { await db.del('photos', there.photoId); await forgetPhoto(trip, d, there.photoId); }
        await db.del('blocks', there.id); await touch(trip);
        toast(`Taken off day ${d + 1}.`);
      } else {
        await copyToDay(trip, b, d);
        toast(`Now also on day ${d + 1}.`);
      }
      render();
    };
  });
  $('#title').oninput = (e) => {
    b.title = e.target.value;
    if (kind) { const em = emojiFromText(b.title) || kind.emoji; if (em !== b.emoji) { b.emoji = em; const big = $('.mtm-editor-head .mtm-big'); if (big) big.textContent = em; } }
    save();
  };
  const np = $('#newPerson');
  const addPerson = async () => {
    const n = (np.value || '').trim(); if (!n) return;
    b.fields.people = (b.fields.people || []).concat(n); np.value = '';
    await save.flush(); await db.put('blocks', b); await syncFamily(b); await touch(trip); render();
    setTimeout(() => $('#newPerson')?.focus(), 50);
  };
  if (np) { np.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addPerson(); } }; $('#addPerson').onclick = addPerson; }
  $$('[data-unperson]').forEach((x) => { x.onclick = async () => { b.fields.people.splice(Number(x.dataset.unperson), 1); await save.flush(); await db.put('blocks', b); await syncFamily(b); await touch(trip); render(); }; });
  $('#where').oninput = (e) => { b.place.name = e.target.value; const pt = $('#placeTrail'); if (pt) pt.innerHTML = `${esc(countryOf(trip, day.city))} › ${esc(day.city || '…')} › <b>${esc(b.place.name || '…')}</b>`; save(); };
  $('#note').oninput = (e) => { b.note = e.target.value; save(); };
  $$('[data-field]').forEach((inp) => { inp.oninput = () => { b.fields[inp.dataset.field] = inp.value; save(); }; });
  $$('[data-detail]').forEach((inp) => {
    inp.oninput = () => { b.details[inp.dataset.detail] = inp.value; save(); };
    if (inp.type === 'url') inp.onchange = async () => { await save.flush(); render(); };
  });
  $$('[data-drop]').forEach((x) => {
    x.onclick = async () => { const k = x.dataset.drop; delete b.details[k]; b.extras = b.extras.filter((e) => e !== k); await save.flush(); await db.put('blocks', b); await touch(trip); render(); };
  });
  const add = $('#addDetail');
  if (add) add.onchange = async () => {
    if (!add.value) return;
    if (add.value === '__own') { ownOpen = b.id; await save.flush(); render(); setTimeout(() => $('#ownLabel')?.focus(), 50); return; }
    b.extras.push(add.value); await save.flush(); await db.put('blocks', b); render(); setTimeout(() => $(`#d-${add.value}`)?.focus(), 50);
  };
  const ownLabel = $('#ownLabel');
  const addOwn = async () => {
    const label = (ownLabel.value || '').trim(); if (!label) return;
    b.custom.push({ label, value: '' }); ownOpen = null;
    await save.flush(); await db.put('blocks', b); await touch(trip); render();
    setTimeout(() => $(`#c-${b.custom.length - 1}`)?.focus(), 50);
  };
  if (ownLabel) { ownLabel.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addOwn(); } }; $('#ownAdd').onclick = addOwn; }
  $$('[data-star]').forEach((st) => {
    st.onclick = () => {
      const n = Number(st.dataset.star);
      b.details.rating = Number(b.details.rating) === n ? '' : n;
      $$('[data-star]').forEach((x) => x.classList.toggle('is-on', Number(b.details.rating) >= Number(x.dataset.star)));
      save();
    };
  });
  $$('[data-custom]').forEach((inp) => { inp.oninput = () => { b.custom[Number(inp.dataset.custom)].value = inp.value; save(); }; });
  $$('[data-dropcustom]').forEach((x) => { x.onclick = async () => { b.custom.splice(Number(x.dataset.dropcustom), 1); await save.flush(); await db.put('blocks', b); await touch(trip); render(); }; });
  $$('[data-chip]').forEach((c) => {
    c.onclick = () => {
      const k = c.dataset.chip;
      b.fields[k] = b.fields[k] === c.dataset.val ? '' : c.dataset.val;
      $$(`[data-chip="${k}"]`).forEach((x) => x.classList.toggle('is-on', x.dataset.val === b.fields[k]));
      save();
    };
  });
  $('#photoFile').onchange = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    await save.flush();
    await attachPhoto(trip, b, f);
    render();
  };
  const kp = $('#keyPhoto');
  if (kp) kp.onclick = async () => {
    const at = day.keyPhotos.indexOf(b.photoId);
    if (at >= 0) { day.keyPhotos.splice(at, 1); toast(`Taken off day ${i + 1}’s key pictures.`); }
    else if (day.keyPhotos.length < KEY_MAX) { day.keyPhotos.push(b.photoId); toast(`Key picture ${day.keyPhotos.length} of ${KEY_MAX} for day ${i + 1}.`); }
    keyify(day); await db.put('days', day); await touch(trip); render();
  };
  const rp = $('#removePhoto');
  if (rp) rp.onclick = async () => {
    if (!b.photoId) return;
    await db.del('photos', b.photoId);
    if (trip.coverPhotoId === b.photoId) trip.coverPhotoId = null;
    if (day.keyPhotos.includes(b.photoId)) { day.keyPhotos = day.keyPhotos.filter((k) => k !== b.photoId); keyify(day); await db.put('days', day); }
    b.photoId = null;
    await db.put('blocks', b); await touch(trip); render();
  };
  $('#locate').onclick = () => {
    if (!navigator.geolocation) return toast('This phone will not share its position here.');
    const btn = $('#locate'); btn.disabled = true;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      b.place.lat = pos.coords.latitude; b.place.lon = pos.coords.longitude; b.place.from = 'phone';
      const named = await maybeAutoName(b);
      await db.put('blocks', b); await syncFamily(b); await touch(trip);
      toast(named ? `Position saved: ${b.place.name}` : 'Position saved. Name the place if you like.');
      render();
    }, () => { btn.disabled = false; toast('Could not get a position. Type the place instead.'); },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  };
  const lu = $('#lookup');
  if (lu) lu.onclick = async () => {
    if (!navigator.onLine) return toast('No internet right now. Try again later or type the place.');
    lu.disabled = true; toast('Looking up the name…');
    try {
      const n = await lookupName(b.place.lat, b.place.lon);
      if (n) { b.place.name = n; $('#where').value = n; await save.flush(); await db.put('blocks', b); await syncFamily(b); await touch(trip); toast('Found it. Change it if it is wrong.'); }
      else toast('No name found here. Type one.');
    } catch { toast('Could not reach the lookup service.'); }
    lu.disabled = false;
  };
  $('#deleteBlock').onclick = async () => {
    if (!confirm('Delete this moment?')) return;
    if (b.photoId) { await db.del('photos', b.photoId); if (trip.coverPhotoId === b.photoId) trip.coverPhotoId = null; if (day.keyPhotos.includes(b.photoId)) { day.keyPhotos = day.keyPhotos.filter((k) => k !== b.photoId); keyify(day); await db.put('days', day); } }
    await db.del('blocks', b.id); await touch(trip);
    leaveHook = null;
    go(`/t/${trip.id}/d/${i}`);
  };
  $('#done').onclick = async () => { await save.flush(); go(`/t/${trip.id}/d/${i}`); };
}

// ---------- one item on several days (I12) ----------
// Copies share a groupId. Name, place, kind fields, emoji and label travel together; picture, note, details and order are each day's own.
async function familyOf(b) {
  if (!b.groupId) return [b];
  return (await db.where('blocks', 'tripId', b.tripId)).filter((x) => x.groupId === b.groupId);
}
async function syncFamily(b) {
  if (!b.groupId) return;
  const sibs = (await familyOf(b)).filter((x) => x.id !== b.id);
  if (!sibs.length) return;
  sibs.forEach((x) => { x.title = b.title; x.place = { ...b.place }; x.fields = { ...b.fields }; x.emoji = b.emoji; x.label = b.label; });
  await db.putMany('blocks', sibs);
}
async function copyToDay(trip, b, i) {
  if (!b.groupId) { b.groupId = uid(); await db.put('blocks', b); }
  const day = await getDay(trip.id, i);
  if (!(await db.get('days', day.id))) await db.put('days', day);
  const existing = await blocksForDay(day.id);
  const copy = { ...b, id: uid(), dayId: day.id, dayIndex: i, order: existing.length, photoId: null, note: '', details: {}, extras: [],
    place: { ...b.place }, fields: { ...b.fields }, createdAt: Date.now() };
  await db.put('blocks', copy);
  await touch(trip);
  return copy;
}

// ---------- place names (Decision, 2026-10-17: optional, OpenStreetMap's Nominatim) ----------
async function lookupName(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&accept-language=en`;
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('lookup failed');
  const j = await r.json();
  const a = j.address || {};
  const what = j.name || a.tourism || a.amenity || a.shop || a.leisure || a.historic || a.building || a.road || '';
  const where = a.suburb || a.neighbourhood || a.city || a.town || a.village || a.county || '';
  return [what, where].filter(Boolean).join(', ') || (j.display_name || '').split(',').slice(0, 2).join(',').trim();
}
async function autoLookupOn() { return db.setting('autoLookup', false); }
// Fill a block's place name from its coordinates when the switch is on and the phone is online.
async function maybeAutoName(b) {
  if (b.place?.lat == null || b.place.name || !navigator.onLine) return false;
  if (!(await autoLookupOn())) return false;
  try { const n = await lookupName(b.place.lat, b.place.lon); if (n) { b.place.name = n; return true; } } catch { /* offline or refused: leave it */ }
  return false;
}

// ---------- photos ----------
// A picture that goes away must leave the day's key list; a picture that is replaced keeps its slot.
async function forgetPhoto(trip, dayIndex, photoId) {
  if (trip.coverPhotoId === photoId) trip.coverPhotoId = null;
  const day = await getDay(trip.id, dayIndex);
  if (day.keyPhotos.includes(photoId)) { day.keyPhotos = day.keyPhotos.filter((k) => k !== photoId); keyify(day); await db.put('days', day); }
}
async function replacePhotoRefs(trip, dayIndex, oldId, newId) {
  if (trip.coverPhotoId === oldId) trip.coverPhotoId = newId;
  const day = await getDay(trip.id, dayIndex);
  const at = day.keyPhotos.indexOf(oldId);
  if (at >= 0) { day.keyPhotos[at] = newId; keyify(day); await db.put('days', day); }
}
async function attachPhoto(trip, b, file) {
  const exif = await readExif(file);
  const { blob, w, h } = await shrink(file);
  const photo = { id: uid(), tripId: trip.id, blockId: b.id, blob, w, h, takenAt: exif.takenAt || '', lat: exif.lat ?? null, lon: exif.lon ?? null, bytes: blob.size, createdAt: Date.now() };
  const old = b.photoId;
  if (old) await db.del('photos', old);
  await db.put('photos', photo);
  b.photoId = photo.id;
  if (old) await replacePhotoRefs(trip, b.dayIndex, old, photo.id);
  normalize(b);
  if (!b.details.time && exif.takenAt) { const t = exifDateToLocal(exif.takenAt); if (t) b.details.time = t.slice(11, 16); }
  if (b.place.lat == null && exif.lat != null) { b.place.lat = exif.lat; b.place.lon = exif.lon; b.place.from = 'photo'; }
  const named = await maybeAutoName(b);
  await db.put('blocks', b);
  await syncFamily(b);
  if (!trip.coverPhotoId) trip.coverPhotoId = photo.id;
  await touch(trip, blob.size);
  toast(named ? `Picture added: ${b.place.name}.` : exif.lat != null ? 'Picture added, with its position and time.'
    : exif.takenAt ? 'Picture added, with its time. No place in this photo.'
      : 'Picture added. No place or time in this photo.');
}
async function shrink(file, max = 1600) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
    return { blob: blob || file, w, h };
  } catch { return { blob: file, w: 0, h: 0 }; }
  finally { URL.revokeObjectURL(url); }
}

// ---------- backup and import ----------
const blobToDataUrl = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
async function backupTrip(trip, note) {
  toast('Packing the trip…');
  const days = await db.where('days', 'tripId', trip.id);
  const blocks = await db.where('blocks', 'tripId', trip.id);
  const photos = await db.where('photos', 'tripId', trip.id);
  const photoData = await Promise.all(photos.map(async (p) => ({ ...p, blob: undefined, data: await blobToDataUrl(p.blob) })));
  const payload = { format: 'moments-that-matter', version: 1, exportedAt: new Date().toISOString(), trip: { ...trip }, days, blocks, photos: photoData };
  const name = `${(trip.title || 'Trip').replace(/[\\/:*?"<>|]+/g, ' ').trim()} - Moments backup ${todayIso()}.json`;
  const file = new File([JSON.stringify(payload)], name, { type: 'application/json' });
  const went = await deliverFiles([file], name, note);
  if (!went) { toast('Backup cancelled.'); return false; }
  trip.backup = { lastAt: Date.now() };
  trip.pending = { changes: 0, bytes: 0 };
  await db.put('trips', trip);
  toast('Backed up. Keep that file somewhere safe.');
  render();
  return true;
}
// Archive (I3): back the trip up, then, once Matt says the file is safe, take it off the phone.
async function archiveTrip(trip) {
  const went = await backupTrip(trip);
  if (!went) return;
  const k = await sheet('Is that backup saved somewhere safe?', [
    { k: 'remove', label: 'Yes. Remove the trip from this phone', danger: true },
    { k: '', label: 'Not yet, keep it here' },
  ]);
  if (k !== 'remove') return toast('Kept on the phone.');
  await deleteTrip(trip.id);
  toast('Archived. Import brings it back any time.');
  go('/');
}
// A backup is data from outside: keep ids id-shaped and glyphs glyph-shaped before anything renders them.
function cleanImport(data) {
  const idOr = (v, fallback) => safeId(v) || fallback;
  const t = data.trip;
  t.dayCount = Math.max(1, Math.min(400, Number(t.dayCount) || 1));
  t.startDate = /^\d{4}-\d{2}-\d{2}$/.test(String(t.startDate || '')) ? t.startDate : todayIso();
  t.coverPhotoId = safeId(t.coverPhotoId);
  data.days = (Array.isArray(data.days) ? data.days : []).filter((d) => Number.isInteger(d?.index)).map((d) => ({
    ...d, weather: safeGlyph(d.weather), keyPhotos: (Array.isArray(d.keyPhotos) ? d.keyPhotos : [d.keyPhotoId]).map(safeId).filter(Boolean), keyPhotoId: undefined,
  }));
  data.blocks = (Array.isArray(data.blocks) ? data.blocks : []).filter((b) => safeId(b?.id) && Number.isInteger(b.dayIndex)).map((b) => ({
    ...b, emoji: safeGlyph(b.emoji), photoId: safeId(b.photoId), groupId: safeId(b.groupId) || undefined, kind: typeof b.kind === 'string' ? b.kind.slice(0, 20) : 'other',
  }));
  data.photos = (Array.isArray(data.photos) ? data.photos : []).filter((p) => safeId(p?.id) && typeof p.data === 'string' && p.data.startsWith('data:image/')).map((p) => ({ ...p, blockId: idOr(p.blockId, undefined) }));
}
// Pass the notebook (Decision, 2026-10-17): one person writes at a time.
const APP_URL = 'https://mattaldapa-design.github.io/moments-that-matter/';
const isPassed = (t) => !!t.passedOn;
async function passNotebook(trip) {
  const who = await db.setting('yourName', '');
  const note = `${who ? who + ' passed you' : "Here's"} the notebook for ${trip.title || 'our trip'}. Save the file to Files, open Moments That Matter and tap "Import a trip". Add your days, then pass it back the same way. ${APP_URL}`;
  const went = await backupTrip(trip, note);
  if (!went) return;
  trip.passedOn = { at: Date.now() };
  await db.put('trips', trip);
  toast('Passed on. This trip is read-only here until it comes back.');
  render();
}
async function takeBack(trip) {
  trip.passedOn = null;
  await db.put('trips', trip);
  toast('Taken back. You can edit it again.');
  render();
}

// ---------- one day on its own (I25) ----------
const DAY_FORMAT = 'moments-that-matter-day';
const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
async function sendDay(trip, i) {
  toast('Packing the day…');
  const day = await getDay(trip.id, i);
  const blocks = await blocksForDay(day.id);
  const photos = (await db.where('photos', 'tripId', trip.id)).filter((p) => blocks.some((b) => b.photoId === p.id));
  const photoData = await Promise.all(photos.map(async (p) => ({ ...p, blob: undefined, data: await blobToDataUrl(p.blob) })));
  const date = isoOf(addDays(trip.startDate, i));
  const payload = { format: DAY_FORMAT, version: 1, exportedAt: new Date().toISOString(),
    from: { tripId: trip.id, tripTitle: trip.title || '', dayIndex: i, date },
    day: { city: day.city || '', weather: day.weather || '', keyPhotos: day.keyPhotos || [] }, blocks, photos: photoData };
  const who = await db.setting('yourName', '');
  const name = `${(trip.title || 'Trip').replace(/[\\/:*?"<>|]+/g, ' ').trim()} day ${i + 1} - ${date}.json`;
  const note = `${who ? who + ' sent you' : "Here's"} day ${i + 1} (${fmtDay(addDays(trip.startDate, i))}) from ${trip.title || 'the trip'}. Open Moments That Matter, tap Import a trip, and choose which trip it joins. Keep what you like, remove the rest. ${APP_URL}`;
  const file = new File([JSON.stringify(payload)], name, { type: 'application/json' });
  const went = await deliverFiles([file], name, note);
  toast(went ? 'Day sent.' : 'Cancelled.');
}
async function importDay(data) {
  // Tidy what came in, then ask where it goes.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(data.from?.date || '')) ? data.from.date : null;
  const blocksIn = (Array.isArray(data.blocks) ? data.blocks : []).filter((b) => safeId(b?.id)).map((b) => ({ ...b, emoji: safeGlyph(b.emoji), photoId: safeId(b.photoId), groupId: undefined }));
  const photosIn = (Array.isArray(data.photos) ? data.photos : []).filter((p) => safeId(p?.id) && typeof p.data === 'string' && p.data.startsWith('data:image/'));
  if (!blocksIn.length) return toast('That day file has no moments in it.');
  const trips = (await db.all('trips')).filter((t) => !isPassed(t)).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  if (!trips.length) return toast('Start a trip first, then import the day into it.');
  const label = `${data.from?.tripTitle ? data.from.tripTitle + ', ' : ''}day ${(data.from?.dayIndex ?? 0) + 1}${date ? ' · ' + fmtDay(new Date(date + 'T00:00:00')) : ''}`;
  const tk = trips.length === 1 ? trips[0].id : await sheet(`Add ${label} to which trip?`, trips.slice(0, 8).map((t) => ({ k: t.id, label: t.title || 'Untitled trip' })));
  if (!tk) return toast('Nothing added.');
  const trip = trips.find((t) => t.id === tk);
  normalizeTrip(trip);
  // Same date already in the trip? Offer to join that day.
  let at = -1;
  if (date) for (let i = 0; i < trip.dayCount; i++) if (isoOf(addDays(trip.startDate, i)) === date) { at = i; break; }
  let mode = 'new';
  if (at >= 0) {
    mode = await sheet(`${trip.title || 'This trip'} already has Day ${at + 1} on that date.`, [
      { k: 'join', label: `Add these ${blocksIn.length} moment${blocksIn.length === 1 ? '' : 's'} to Day ${at + 1}` },
      { k: 'new', label: 'Add as a new day at the end' },
    ]);
    if (!mode) return toast('Nothing added.');
  }
  const index = mode === 'join' ? at : trip.dayCount;
  const day = await getDay(trip.id, index);
  if (mode === 'new') { trip.dayCount += 1; if (!day.city) day.city = data.day?.city || ''; if (!day.weather) day.weather = safeGlyph(data.day?.weather); }
  const existing = await blocksForDay(day.id);
  const seen = new Set(existing.flatMap((b) => [b.id, b.srcId].filter(Boolean)));
  const fresh = blocksIn.filter((b) => !seen.has(b.id) && !seen.has(b.srcId));
  const photoMap = {};
  const photos = [];
  for (const p of photosIn) {
    if (!fresh.some((b) => b.photoId === p.id)) continue;
    const nid = uid(); photoMap[p.id] = nid;
    photos.push({ ...p, id: nid, tripId: trip.id, blob: await (await fetch(p.data)).blob(), data: undefined });
  }
  const blocks = fresh.map((b, k) => ({ ...normalize({ ...b }), id: uid(), srcId: b.srcId || b.id, tripId: trip.id, dayId: day.id, dayIndex: index, order: existing.length + k,
    photoId: b.photoId && photoMap[b.photoId] ? photoMap[b.photoId] : null }));
  photos.forEach((p) => { const owner = blocks.find((b) => b.photoId === p.id); if (owner) p.blockId = owner.id; });
  if (mode === 'new') day.keyPhotos = (data.day?.keyPhotos || []).map((id) => photoMap[id]).filter(Boolean).slice(0, KEY_MAX);
  keyify(day);
  await db.batch(['days', 'blocks', 'photos'], (s) => { s.days.put(day); blocks.forEach((b) => s.blocks.put(b)); photos.forEach((p) => s.photos.put(p)); });
  if (!trip.coverPhotoId && photos[0]) trip.coverPhotoId = photos[0].id;
  await touch(trip, photos.reduce((n, p) => n + (p.bytes || 0), 0));
  toast(fresh.length ? `${fresh.length} moment${fresh.length === 1 ? '' : 's'} added to Day ${index + 1}.` : `Day ${index + 1} already had all of these.`);
  go(`/t/${trip.id}/d/${index}`);
}

async function importTrip(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.format === DAY_FORMAT) return await importDay(data);
    if (data.format !== 'moments-that-matter' || !data.trip || !safeId(data.trip.id)) throw new Error('That is not a Moments backup file.');
    cleanImport(data);
    const existing = await db.get('trips', data.trip.id);
    const comingHome = !!(existing && isPassed(existing));
    if (comingHome) await deleteTrip(existing.id);
    const exists = !!existing && !comingHome;
    const map = {};
    const nid = (old) => (exists ? (map[old] || (map[old] = uid())) : old);
    const tripId = nid(data.trip.id);
    const photos = await Promise.all((data.photos || []).map(async (p) => ({ ...p, id: nid(p.id), tripId, blockId: p.blockId ? nid(p.blockId) : undefined, blob: await (await fetch(p.data)).blob(), data: undefined })));
    const blocks = (data.blocks || []).map((b) => ({ ...b, id: nid(b.id), tripId, dayId: dayId(tripId, b.dayIndex), photoId: b.photoId ? nid(b.photoId) : null }));
    const days = (data.days || []).map((d) => ({ ...d, id: dayId(tripId, d.index), tripId }));
    const trip = { ...data.trip, id: tripId, updatedAt: Date.now(), pending: { changes: 0, bytes: 0 }, passedOn: null, coverPhotoId: data.trip.coverPhotoId ? nid(data.trip.coverPhotoId) : null };
    await db.put('trips', trip);
    await db.putMany('days', days);
    await db.putMany('blocks', blocks);
    await db.putMany('photos', photos);
    toast(comingHome ? 'The notebook is back, with everything they added.' : exists ? 'Imported as a copy.' : 'Trip imported.');
    go(`/t/${tripId}`);
    if (location.hash === `#/t/${tripId}`) render();
  } catch (e) {
    toast(e.message || 'Could not import that file.');
  }
}

// ---------- start ----------
window.addEventListener('hashchange', render);
window.addEventListener('pagehide', () => { if (leaveHook) leaveHook(); });
try { navigator.storage?.persist?.().catch(() => {}); } catch { /* not available */ }
render();
