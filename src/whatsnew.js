// THE TITLE MENU'S WHAT'S NEW (Daniel 10-11): one row on the title board, "WHAT'S NEW 11 OCT" (the date of the newest deploy), with a small dot until the
// player has opened the list. The list is docs/updates.json, newest first: [{ date:'2026-10-11', batch:85, lines:[...3-6 short PLAYER lines...] }].
// The coordinator adds the entry at merge time; scratch/release.sh --deploy refuses to deploy a batch that has none.
// Pure data and layout (no drawing: src/main.js drawWhatsNew); the seen-date lives in localStorage (always inside try/catch).
export const SEEN_KEY = 'bracken.whatsnewSeen';
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
let updates = [];
let loaded = false;
export const parseUpdates = (raw) => {
  const a = Array.isArray(raw) ? raw : [];
  return a.filter(e => e && /^\d{4}-\d{2}-\d{2}$/.test(String(e.date)) && Array.isArray(e.lines) && e.lines.length)
    .map(e => ({ date: String(e.date), batch: +e.batch || 0, lines: e.lines.map(String) }))
    .sort((x, y) => (y.date < x.date ? -1 : y.date > x.date ? 1 : y.batch - x.batch));
};
export const setUpdates = (raw) => { updates = parseUpdates(raw); loaded = true; };
export const loadUpdates = async () => { try { const r = await fetch('docs/updates.json', { cache: 'no-cache' }); if (r.ok) setUpdates(await r.json()); } catch {} return updates; };
export const getUpdates = () => updates;
export const updatesLoaded = () => loaded;
export const newestDate = () => (updates[0] ? updates[0].date : '');
/* '2026-10-11' -> '11 OCT' */
export const shortDate = (d) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d)); return m ? (+m[3]) + ' ' + (MON[+m[2] - 1] || '') : ''; };
export const longDate = shortDate;
export const readSeen = () => { try { return localStorage.getItem(SEEN_KEY) || ''; } catch { return ''; } };
export const markSeen = () => { try { if (newestDate()) localStorage.setItem(SEEN_KEY, newestDate()); } catch {} };
export const hasNew = () => !!newestDate() && readSeen() < newestDate();
/* the list as drawable rows: { kind:'head', s } for a date, { kind:'line', s } for a line; wrapFn(s, maxW) splits a long line */
export const rows = (wrapFn, maxW) => {
  const out = [];
  updates.forEach((e, i) => { out.push({ kind: 'head', s: shortDate(e.date), gap: i > 0 });
    for (const ln of e.lines) wrapFn('- ' + ln, maxW).forEach((part, j) => out.push({ kind: 'line', s: j ? '  ' + part : part })); });
  return out;
};
