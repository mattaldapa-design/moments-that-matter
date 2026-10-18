// Small helpers shared by the app and the recap, so the two never disagree.
import { kindOf } from './words.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
export const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d; };
export const fmtDay = (d) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
export const fmtLong = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
export const joinNames = (arr) => (arr.length <= 1 ? arr.join('') : arr.length === 2 ? `${arr[0]} and ${arr[1]}` : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`);
export const autoTitle = (b) => (b.kind === 'people' && b.fields?.people?.length ? `Met ${joinNames(b.fields.people)}` : '');
export const titleOf = (b) => b.title || autoTitle(b) || cap(b.label) || kindOf(b.kind)?.name || 'Moment';

// Imported files are data, not trusted markup. Ids must look like ids; emoji and weather must be short and tag-free.
const ID_OK = /^[A-Za-z0-9_:.-]{1,64}$/;
export const safeId = (v) => (typeof v === 'string' && ID_OK.test(v) ? v : null);
export const safeGlyph = (v) => (typeof v === 'string' && v.length <= 16 && !/[<>&"'\\/]/.test(v) ? v : '');

// Where a crop should look. A chosen focal point wins; otherwise a tall picture in a wide frame favours its top third,
// where faces usually are; everything else centres.
export function focusOf(photo, frameW = 1, frameH = 1) {
  if (photo?.focus && Number.isFinite(photo.focus.x) && Number.isFinite(photo.focus.y)) return { x: photo.focus.x, y: photo.focus.y };
  const tall = photo?.w && photo?.h ? photo.h > photo.w : false;
  const wide = frameW / frameH > 1.05;
  return { x: 0.5, y: tall && wide ? 0.3 : 0.5 };
}
// Money as typed ("$12.50", "12,000") to a number, and back to a short dollar string.
export const num = (v) => { const m = String(v || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : 0; };
export const money = (n) => '$' + Math.round(n).toLocaleString();
export const objectPosition = (photo, frameW, frameH) => { const f = focusOf(photo, frameW, frameH); return `object-position:${Math.round(f.x * 100)}% ${Math.round(f.y * 100)}%`; };
