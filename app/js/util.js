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
