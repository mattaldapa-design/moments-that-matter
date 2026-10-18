// The Recap (Decision, 2026-10-17): one long scroll — cover, stats with pictures, every emoji, then day by day —
// and an export that draws each band to a picture and wraps the pictures into a PDF, on the phone.
import * as db from './db.js';
import { esc, addDays, fmtDay, fmtLong, joinNames, titleOf, focusOf, objectPosition } from './util.js';

const num = (v) => { const m = String(v || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : 0; };
const money = (n) => '$' + Math.round(n).toLocaleString();
// The day's pictures for a card: key pictures in tap order, then the rest in day order, four at most.
function pickFour(d, pmap) {
  const keys = (d.keyPhotos || []).map((id) => pmap[id]).filter(Boolean);
  const rest = d.blocks.map((b) => b.photoId && pmap[b.photoId]).filter((p) => p && !keys.includes(p));
  return [...keys, ...rest].slice(0, 4);
}

// ---------- data ----------
export async function gather(trip) {
  const blocks = (await db.where('blocks', 'tripId', trip.id)).sort((a, b) => a.dayIndex - b.dayIndex || a.order - b.order);
  const photos = await db.where('photos', 'tripId', trip.id);
  const pmap = Object.fromEntries(photos.map((p) => [p.id, p]));
  const days = [];
  for (let i = 0; i < trip.dayCount; i++) {
    const d = (await db.get('days', `${trip.id}:${i}`)) || { index: i, city: '', weather: '' };
    if (!Array.isArray(d.keyPhotos)) d.keyPhotos = d.keyPhotoId ? [d.keyPhotoId] : [];
    days.push({ ...d, index: i, date: addDays(trip.startDate, i), blocks: blocks.filter((b) => b.dayIndex === i) });
  }
  const cover = (trip.coverPhotoId && pmap[trip.coverPhotoId]) || photos[0] || null;
  const keeper = await db.setting('yourName', '');
  if (Array.isArray(trip.places) && trip.places.length) trip.region = trip.places.map((p) => p.name).join(', ');
  return { trip, blocks, photos, pmap, days, cover, keeper };
}

// Only stats with something to count. Matt's three first (food spend, people met, places eaten at), then the agent's.
export function stats(data) {
  const { blocks, photos, days } = data;
  const S = [];
  const of = (k) => blocks.filter((b) => b.kind === k);
  const food = of('food'), people = of('people'), places = of('place');
  const firstPhoto = (arr) => arr.find((b) => b.photoId)?.photoId || null;
  const add = (cond, emoji, big, small, photoId) => { if (cond) S.push({ emoji, big: String(big), small, photoId }); };

  const foodSpend = food.reduce((s, b) => s + num(b.details?.cost), 0);
  add(foodSpend > 0, '💸', money(foodSpend), 'spent on food and drink', firstPhoto(food));
  const peopleCount = people.reduce((s, b) => s + (Array.isArray(b.fields?.people) && b.fields.people.length ? b.fields.people.length : Math.max(1, (b.fields?.names || '').split(/,|&|\band\b/).filter((x) => x.trim()).length)), 0);
  add(people.length, '👋', peopleCount, `new ${peopleCount === 1 ? 'person' : 'people'} met`, firstPhoto(people));
  const eateries = new Set(food.map((b) => (b.place?.name || b.title || '').trim().toLowerCase()).filter(Boolean)).size;
  add(eateries, '🍽️', eateries, `place${eateries === 1 ? '' : 's'} you ate or drank at`, firstPhoto(food.slice().reverse()));
  add(food.length && !eateries, '🍽️', food.length, `meal${food.length === 1 ? '' : 's'} and drinks logged`, firstPhoto(food));
  const cities = new Set(days.map((d) => (d.city || '').trim().toLowerCase()).filter(Boolean));
  add(cities.size > 1, '🏙️', cities.size, 'cities and towns, by the day', firstPhoto(blocks));
  const named = new Set(blocks.map((b) => (b.place?.name || '').trim().toLowerCase()).filter(Boolean));
  add(named.size > 1, '📍', named.size, 'different places, by name', firstPhoto(blocks.filter((b) => b.place?.name)));
  const daysLogged = days.filter((d) => d.blocks.length).length;
  const avg = daysLogged ? blocks.length / daysLogged : 0;
  add(daysLogged > 1, '🧮', Number.isInteger(avg) ? avg : avg.toFixed(1), `moments a day, over ${daysLogged} days with something logged`, null);
  const biggest = days.reduce((m, d) => (d.blocks.length > (m ? m.blocks.length : 0) ? d : m), null);
  add(biggest && biggest.blocks.length > 1, '🔥', `Day ${(biggest?.index ?? 0) + 1}`, `was the biggest: ${biggest?.blocks.length} moments${biggest?.city ? ' in ' + biggest.city : ''}`, biggest ? firstPhoto(biggest.blocks) : null);
  const weather = {};
  days.forEach((d) => { if (d.weather) weather[d.weather] = (weather[d.weather] || 0) + 1; });
  const wk = Object.entries(weather).sort((a, b) => b[1] - a[1]);
  add(wk.length, wk[0]?.[0], wk.map(([e, n]) => `${e}${n}`).join('  '), 'the weather, counted by day', null);
  const rated = blocks.filter((b) => Number(b.details?.rating) > 0);
  const fourPlus = rated.filter((b) => Number(b.details.rating) >= 4);
  const best = rated.slice().sort((a, b) => Number(b.details.rating) - Number(a.details.rating))[0];
  add(fourPlus.length, '⭐', fourPlus.length, `moment${fourPlus.length === 1 ? '' : 's'} you gave four stars or more`, firstPhoto(fourPlus));
  add(best, '🏆', '★'.repeat(Number(best?.details.rating || 0)), `your top rating: ${best ? titleOf(best) : ''}`, best?.photoId || null);
  const hosts = blocks.map((b) => b.details?.host).filter(Boolean);
  add(hosts.length, '🙌', hosts.length, `guide${hosts.length === 1 ? '' : 's'} and hosts worth remembering: ${hosts.slice(0, 3).join(', ')}${hosts.length > 3 ? '…' : ''}`, null);
  const total = blocks.reduce((s, b) => s + num(b.details?.cost), 0);
  add(total > 0 && total !== foodSpend, '🧾', money(total), 'spent in total', null);
  return S;
}

// ---------- the screen ----------
export function renderRecap(data, S, photoUrl) {
  const { trip, blocks, photos, days, cover, pmap, keeper } = data;
  const logged = days.filter((d) => d.blocks.length);
  const statCard = (s, k) => {
    const ph = s.photoId ? pmap[s.photoId] : null;
    return `<div class="dr-panel mtm-stat" data-tone="${k % 4}">${ph ? `<div class="mtm-stat__art"><img src="${photoUrl(ph)}" alt="" style="${objectPosition(ph, 1, 1)}"></div>` : `<div class="mtm-stat__art mtm-stat__art--emoji">${esc(s.emoji)}</div>`}
      <div><div class="dr-title mtm-stat__big">${esc(s.big)}</div><div class="dr-body-sm">${esc(s.small)}</div></div></div>`;
  };
  const dayBand = (d) => {
    const pics = pickFour(d, pmap);
    return `<section class="dr-panel mtm-dayband">
      <button class="mtm-dayband__head" data-go="/t/${trip.id}/d/${d.index}" aria-label="Open day ${d.index + 1}">
        <div class="dr-eyebrow">Day ${d.index + 1} · ${fmtDay(d.date)}</div>
        <div class="mtm-bar mtm-bar--between"><h3 class="dr-heading">${esc(d.city || 'Somewhere')} <span class="mtm-dayband__go">›</span></h3><span class="mtm-snap">${esc(d.weather || '')}</span></div>
      </button>
      <div class="mtm-snap mtm-dayband__emojis">${d.blocks.map((b) => esc(b.emoji || '·')).join('')}</div>
      ${pics.length ? `<div class="mtm-dayband__pics mtm-dayband__pics--${Math.min(pics.length, 4)}">${pics.map((p, k) => `<div class="dr-cover"><img src="${photoUrl(p)}" alt="" style="${objectPosition(p, k === 0 && pics.length >= 3 ? 4 : 1, k === 0 && pics.length >= 3 ? 3 : 1)}"></div>`).join('')}</div>` : ''}
      <div class="mtm-dayband__titles">${d.blocks.slice(0, 10).map((b) => `<button data-go="/t/${trip.id}/d/${b.dayIndex}/b/${b.id}">${esc(b.emoji || '')} ${esc(titleOf(b))}</button>`).join('')}${d.blocks.length > 10 ? `<span class="dr-caption">+${d.blocks.length - 10} more</span>` : ''}</div>
    </section>`;
  };
  return `<div class="mtm-stack mtm-recap">
    <div class="dr-cover dr-tile--wide mtm-recap__cover">${cover ? `<img src="${photoUrl(cover)}" alt="" style="${objectPosition(cover, 16, 10)}">` : `<div class="dr-cover--type" style="position:absolute;inset:0"><span>${esc(trip.title || 'Your trip')}</span></div>`}</div>
    <div><div class="dr-eyebrow">${trip.region ? esc(trip.region) + ' · ' : ''}${fmtLong(addDays(trip.startDate, 0))} – ${fmtLong(addDays(trip.startDate, trip.dayCount - 1))}</div>
      <h1 class="dr-title-xl">${esc(trip.title || 'Your trip')}</h1>
      ${keeper || trip.companions?.length ? `<p class="dr-body-sm">${keeper ? `Kept by ${esc(keeper)}` : ''}${keeper && trip.companions?.length ? ' · ' : ''}${trip.companions?.length ? `with ${esc(joinNames(trip.companions))}` : ''}</p>` : ''}
      <p class="dr-hero mtm-recap__hero">${trip.dayCount} day${trip.dayCount === 1 ? '' : 's'}, ${blocks.length} moment${blocks.length === 1 ? '' : 's'}.</p></div>
    <div class="mtm-bar"><button class="dr-btn" id="savePdf">Save as PDF</button><button class="dr-btn dr-btn--ghost" id="sharePics">Share as pictures</button></div>
    ${S.length ? `<div><div class="dr-eyebrow">The numbers</div><div class="mtm-stats">${S.map(statCard).join('')}</div></div>` : ''}
    ${blocks.length ? `<div><div class="dr-eyebrow">Everything you did</div><div class="mtm-emojifield">${blocks.map((b) => `<button class="mtm-emojifield__item" data-go="/t/${trip.id}/d/${b.dayIndex}/b/${b.id}" title="${esc(titleOf(b))}" aria-label="${esc(titleOf(b))}">${esc(b.emoji || '·')}</button>`).join('')}</div><div class="dr-field__hint">Tap one to open that moment.</div></div>` : '<p class="dr-body-lg">No moments yet. The recap fills itself as the days do.</p>'}
    ${logged.length ? `<div><div class="dr-eyebrow">Day by day</div><div class="mtm-stack">${logged.map(dayBand).join('')}</div></div>` : ''}
  </div>`;
}

// ---------- pages drawn to canvas ----------
const W = 1080, H = 1620, P = 72;
const C = { bg: '#15100e', panel: '#1f1715', raised: '#2b201c', cream: '#f5ebe2', dim: 'rgba(245,235,226,0.62)', signal: '#ff4d2e' };
const F = { display: '"Outfit", "Segoe UI", system-ui, sans-serif', loud: '"Unbounded", "Outfit", "Segoe UI", system-ui, sans-serif', body: '"Figtree", "Segoe UI", system-ui, sans-serif' };

async function ensureFonts() {
  try { await Promise.all(['700 64px Outfit', '800 56px Unbounded', '400 30px Figtree'].map((f) => document.fonts.load(f))); } catch { /* fallbacks draw instead */ }
}
function loadImage(blob) {
  return new Promise((res) => {
    const url = URL.createObjectURL(blob); const im = new Image();
    im.onload = () => { URL.revokeObjectURL(url); res(im); };
    im.onerror = () => { URL.revokeObjectURL(url); res(null); };
    im.src = url;
  });
}
function newPage() {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  return { c, g };
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function drawCover(g, im, x, y, w, h, r, photo) {
  g.save(); roundRect(g, x, y, w, h, r); g.clip();
  g.fillStyle = C.raised; g.fillRect(x, y, w, h);
  if (im) {
    const s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    const dw = im.naturalWidth * s, dh = im.naturalHeight * s;
    const f = focusOf(photo || { w: im.naturalWidth, h: im.naturalHeight }, w, h);
    g.drawImage(im, x + (w - dw) * f.x, y + (h - dh) * f.y, dw, dh);
  }
  g.restore();
}
function wrap(g, text, maxWidth) {
  const words = String(text).split(/\s+/); const lines = []; let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (g.measureText(t).width > maxWidth && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}
function text(g, str, x, y, { font, color = C.cream, maxWidth = W - 2 * P, lineHeight = 1.2, maxLines = 99, align = 'left' } = {}) {
  g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic';
  const size = parseInt(font.match(/(\d+)px/)[1], 10);
  let lines = wrap(g, str, maxWidth);
  if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…'; }
  lines.forEach((l, i) => g.fillText(l, x, y + i * size * lineHeight));
  return y + lines.length * size * lineHeight;
}
function eyebrow(g, str, y) { text(g, str.toUpperCase(), P, y, { font: `700 26px ${F.display}`, color: C.signal }); return y + 44; }

export async function drawPages(data, S) {
  await ensureFonts();
  const { trip, blocks, days, cover, pmap, keeper } = data;
  const img = async (p) => (p ? loadImage(p.blob) : null);
  const pages = [];

  // 1. Cover
  {
    const { c, g } = newPage();
    drawCover(g, await img(cover), 0, 0, W, Math.round(H * 0.58), 0, cover);
    const grad = g.createLinearGradient(0, H * 0.3, 0, H * 0.6); grad.addColorStop(0, 'rgba(21,16,14,0)'); grad.addColorStop(1, C.bg);
    g.fillStyle = grad; g.fillRect(0, H * 0.3, W, H * 0.3);
    let y = Math.round(H * 0.62);
    y = eyebrow(g, `${trip.region ? trip.region + ' · ' : ''}${fmtLong(addDays(trip.startDate, 0))} – ${fmtLong(addDays(trip.startDate, trip.dayCount - 1))}`, y);
    y = text(g, trip.title || 'Your trip', P, y + 60, { font: `700 84px ${F.display}`, lineHeight: 1.05, maxLines: 3 });
    const byLine = [keeper ? `Kept by ${keeper}` : '', trip.companions?.length ? `with ${joinNames(trip.companions)}` : ''].filter(Boolean).join(' · ');
    if (byLine) y = text(g, byLine, P, y + 24, { font: `400 32px ${F.body}`, color: C.dim, maxLines: 2 }) - 30;
    text(g, `${trip.dayCount} day${trip.dayCount === 1 ? '' : 's'}, ${blocks.length} moment${blocks.length === 1 ? '' : 's'}.`, P, y + 70, { font: `800 56px ${F.loud}`, color: C.signal, lineHeight: 1.1 });
    text(g, 'Moments That Matter', P, H - P, { font: `700 26px ${F.display}`, color: C.dim });
    pages.push(c);
  }

  // 2. Stats, 7 per page
  for (let i = 0; i < S.length; i += 7) {
    const { c, g } = newPage();
    let y = eyebrow(g, i ? 'The numbers, continued' : 'The numbers', P + 20);
    y += 30;
    for (const s of S.slice(i, i + 7)) {
      const ph = s.photoId ? pmap[s.photoId] : null;
      const im = await img(ph);
      if (im) drawCover(g, im, P, y, 150, 150, 24, ph);
      else { g.fillStyle = C.panel; roundRect(g, P, y, 150, 150, 24); g.fill(); g.font = `80px ${F.body}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = C.cream; g.fillText(s.emoji || '', P + 75, y + 80); g.textBaseline = 'alphabetic'; }
      const bigFont = s.big.length > 12 ? `700 44px ${F.display}` : `700 64px ${F.display}`;
      text(g, s.big, P + 190, y + 70, { font: bigFont, maxWidth: W - 2 * P - 190, maxLines: 1 });
      text(g, s.small, P + 190, y + 118, { font: `400 30px ${F.body}`, color: C.dim, maxWidth: W - 2 * P - 190, maxLines: 1 });
      y += 200;
    }
    pages.push(c);
  }

  // 3. Everything you did
  if (blocks.length) {
    let { c, g } = newPage();
    let y = eyebrow(g, 'Everything you did', P + 20) + 70;
    let x = P; const size = 72, gap = 22; g.textBaseline = 'alphabetic';
    for (const b of blocks) {
      g.font = `${size}px ${F.body}`; g.textAlign = 'left'; g.fillStyle = C.cream;
      const e = b.emoji || '·'; const w = Math.max(g.measureText(e).width, size * 0.9) + gap;
      if (x + w > W - P) { x = P; y += size + gap; }
      if (y > H - P) { pages.push(c); ({ c, g } = newPage()); y = eyebrow(g, 'Everything you did, continued', P + 20) + 70; x = P; g.font = `${size}px ${F.body}`; g.fillStyle = C.cream; }
      g.fillText(e, x, y); x += w;
    }
    pages.push(c);
  }

  // 4. Day by day, packed: a new page only when the next day will not fit
  let page = null, y = 0;
  const inner = W - 2 * P;
  const startPage = (first) => { page = newPage(); y = eyebrow(page.g, first ? 'Day by day' : 'Day by day, continued', P + 20) + 10; pages.push(page.c); };
  for (const d of days.filter((dd) => dd.blocks.length)) {
    const pics = pickFour(d, pmap);
    const picH = pics.length === 0 ? 0 : pics.length === 1 ? 400 : pics.length === 2 ? (inner - 24) / 2 : 380 + 24 + 200;
    const lines = Math.min(d.blocks.length, 6);
    const need = 130 + (picH ? picH + 24 : 0) + lines * 44 + (d.blocks.length > 6 ? 40 : 0) + 50;
    if (!page || y + need > H - P) startPage(!page);
    const g = page.g;
    text(g, `Day ${d.index + 1} · ${fmtDay(d.date)}`.toUpperCase(), P, y + 26, { font: `700 24px ${F.display}`, color: C.signal });
    if (d.weather) { g.font = `40px ${F.body}`; g.textAlign = 'right'; g.fillStyle = C.cream; g.fillText(d.weather, W - P, y + 76); }
    text(g, d.city || 'Somewhere', P, y + 78, { font: `700 48px ${F.display}`, maxLines: 1, maxWidth: inner - 90 });
    g.font = `34px ${F.body}`; g.textAlign = 'left'; g.fillStyle = C.cream; g.fillText(d.blocks.map((b) => b.emoji || '·').join(' ').slice(0, 70), P, y + 122);
    y += 130;
    const ims = await Promise.all(pics.map(img));
    if (ims.length === 1) drawCover(g, ims[0], P, y, inner, 400, 24, pics[0]);
    else if (ims.length === 2) { const w2 = (inner - 24) / 2; drawCover(g, ims[0], P, y, w2, w2, 24, pics[0]); drawCover(g, ims[1], P + w2 + 24, y, w2, w2, 24, pics[1]); }
    else if (ims.length >= 3) {
      drawCover(g, ims[0], P, y, inner, 380, 24, pics[0]);
      const n = ims.length - 1; const w2 = (inner - 24 * (n - 1)) / n;
      ims.slice(1).forEach((im, k) => drawCover(g, im, P + k * (w2 + 24), y + 404, w2, 200, 20, pics[k + 1]));
    }
    if (picH) y += picH + 24;
    for (const b of d.blocks.slice(0, 6)) { text(g, `${b.emoji || '•'}  ${titleOf(b)}${b.place?.name ? '  ·  ' + b.place.name : ''}`, P, y + 32, { font: `500 30px ${F.body}`, maxLines: 1 }); y += 44; }
    if (d.blocks.length > 6) { text(g, `+${d.blocks.length - 6} more`, P, y + 28, { font: `400 26px ${F.body}`, color: C.dim }); y += 40; }
    y += 50;
    g.fillStyle = 'rgba(255,228,206,0.10)'; g.fillRect(P, y - 26, inner, 2);
  }
  return pages;
}

// One day as a single 4:5 picture, for sending or posting (I19). Photo-first: the pictures fill what the words leave.
export async function drawDayCard(data, dayIndex) {
  await ensureFonts();
  const { trip, pmap } = data;
  const d = data.days[dayIndex];
  const CW = 1080, CH = 1350, inner = CW - 2 * P, gap = 20;
  const c = document.createElement('canvas'); c.width = CW; c.height = CH;
  const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, CH); bg.addColorStop(0, '#1f1715'); bg.addColorStop(1, C.bg);
  g.fillStyle = bg; g.fillRect(0, 0, CW, CH);
  const glow = g.createRadialGradient(CW * 0.85, CH * 0.08, 0, CW * 0.85, CH * 0.08, 480); glow.addColorStop(0, 'rgba(255,77,46,0.32)'); glow.addColorStop(1, 'rgba(255,77,46,0)');
  g.fillStyle = glow; g.fillRect(0, 0, CW, CH);

  // Header: trip, Day N, date · city, weather, emojis
  // Header: the date and the place lead; "Day n" sits small by the weather (Matt, seventh look).
  let y = P;
  y = eyebrow(g, `${trip.title || 'My trip'}${trip.region && trip.region !== trip.title ? ' · ' + trip.region : ''}`, y);
  const top = y;
  if (d.weather) { g.font = `64px ${F.body}`; g.textAlign = 'right'; g.fillStyle = C.cream; g.fillText(d.weather, CW - P, top + 58); }
  text(g, `Day ${d.index + 1}`, CW - P, top + (d.weather ? 108 : 50), { font: `700 28px ${F.display}`, color: C.signal, align: 'right' });
  y = text(g, fmtDay(d.date), P, top + 48, { font: `700 40px ${F.display}`, color: C.dim, maxLines: 1, maxWidth: inner - 220 });
  y = text(g, d.city || 'Somewhere', P, y + 14, { font: `800 60px ${F.loud}`, maxLines: 1, maxWidth: inner - 220, lineHeight: 1 });
  g.font = `38px ${F.body}`; g.textAlign = 'left'; g.fillStyle = C.cream; g.fillText(d.blocks.map((b) => b.emoji || '·').join(' ').slice(0, 60), P, y + 24);
  y += 64;

  // Words at the bottom: title · place, and a note line when there is one. Up to six moments.
  const shown = d.blocks.slice(0, 6);
  const noteOf = (b) => (b.note || '').split(String.fromCharCode(10)).map((x) => x.trim()).filter(Boolean)[0] || '';
  const linesNeed = shown.reduce((n, b) => n + 46 + (noteOf(b) ? 32 : 0), 0) + (d.blocks.length > 6 ? 36 : 0);
  const footer = 54;
  const picTop = y + 12;
  const picArea = Math.max(420, CH - P - footer - linesNeed - 24 - picTop);

  // Pictures fill the middle: 1 wide, 2 side by side, 3 as one tall and two stacked, 4 as a 2×2.
  const pics = pickFour(d, pmap);
  const loaded = await Promise.all(pics.map(async (p) => ({ p, im: await loadImage(p.blob) })));
  const shots = loaded.filter((x) => x.im);
  const ims = shots.map((x) => x.im), ps = shots.map((x) => x.p);
  const r = 26;
  if (ims.length === 1) drawCover(g, ims[0], P, picTop, inner, picArea, r, ps[0]);
  else if (ims.length === 2) { const w2 = (inner - gap) / 2; drawCover(g, ims[0], P, picTop, w2, picArea, r, ps[0]); drawCover(g, ims[1], P + w2 + gap, picTop, w2, picArea, r, ps[1]); }
  else if (ims.length === 3) {
    const wl = Math.round(inner * 0.6), wr = inner - wl - gap, h2 = (picArea - gap) / 2;
    drawCover(g, ims[0], P, picTop, wl, picArea, r, ps[0]);
    drawCover(g, ims[1], P + wl + gap, picTop, wr, h2, r, ps[1]);
    drawCover(g, ims[2], P + wl + gap, picTop + h2 + gap, wr, h2, r, ps[2]);
  } else if (ims.length >= 4) {
    const w2 = (inner - gap) / 2, h2 = (picArea - gap) / 2;
    ims.slice(0, 4).forEach((im, k) => drawCover(g, im, P + (k % 2) * (w2 + gap), picTop + Math.floor(k / 2) * (h2 + gap), w2, h2, r, ps[k]));
  }
  y = ims.length ? picTop + picArea + 24 : picTop;

  for (const b of shown) {
    text(g, `${b.emoji || '•'}  ${titleOf(b)}${b.place?.name ? '  ·  ' + b.place.name : ''}${b.details?.rating ? '  ' + '★'.repeat(Number(b.details.rating)) : ''}`, P, y + 34, { font: `600 32px ${F.body}`, maxLines: 1 });
    y += 46;
    const n = noteOf(b);
    if (n) { text(g, n, P + 54, y + 20, { font: `400 26px ${F.body}`, color: C.dim, maxLines: 1, maxWidth: inner - 54 }); y += 32; }
  }
  if (d.blocks.length > 6) { text(g, `+${d.blocks.length - 6} more`, P, y + 26, { font: `400 26px ${F.body}`, color: C.dim }); y += 36; }
  text(g, 'Moments That Matter', P, CH - P + 24, { font: `700 24px ${F.display}`, color: C.dim });
  return c;
}

// ---------- files ----------
const toJpeg = (canvas, q = 0.86) => new Promise((res) => canvas.toBlob(res, 'image/jpeg', q));

export async function pagesToPdf(canvases) {
  const jpegs = await Promise.all(canvases.map(async (c) => new Uint8Array(await (await toJpeg(c)).arrayBuffer())));
  const enc = new TextEncoder();
  const chunks = []; let length = 0; const offsets = [];
  const put = (s) => { const b = typeof s === 'string' ? enc.encode(s) : s; chunks.push(b); length += b.length; };
  const obj = (n, body) => { offsets[n] = length; put(`${n} 0 obj\n`); put(body); put('\nendobj\n'); };
  put('%PDF-1.4\n'); put(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));
  const n = jpegs.length;
  const pageIds = jpegs.map((_, i) => 3 + i * 3);
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${n} >>`);
  const pw = W / 2, ph = H / 2; // points: 540 × 810
  jpegs.forEach((jpg, i) => {
    const pid = pageIds[i], iid = pid + 1, cid = pid + 2;
    obj(pid, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 ${iid} 0 R >> >> /Contents ${cid} 0 R >>`);
    offsets[iid] = length;
    put(`${iid} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);
    put(jpg); put('\nendstream\nendobj\n');
    const content = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;
    obj(cid, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });
  const xref = length; const total = 3 + n * 3;
  put(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for (let i = 1; i < total; i++) put(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  put(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks, { type: 'application/pdf' });
}

export async function pagesToPictures(canvases, baseName) {
  const files = [];
  for (let i = 0; i < canvases.length; i++) files.push(new File([await toJpeg(canvases[i])], `${baseName} ${String(i + 1).padStart(2, '0')}.jpg`, { type: 'image/jpeg' }));
  return files;
}
