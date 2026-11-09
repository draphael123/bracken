// THE TITLE MENU'S WHAT'S NEW (Daniel 10-11): one row on the title board, "WHAT'S NEW 11 OCT" (the date of the newest deploy), with a small dot until the
// player has opened the list. The list is docs/updates.json, newest first: [{ date:'2026-10-11', batch:85, lines:[...3-6 short PLAYER lines, each a string or { s, lv:[level ids] }...] }].
// The coordinator adds the entry at merge time; scratch/release.sh --deploy refuses to deploy a batch that has none.
// Pure data and layout (no drawing: src/main.js drawWhatsNew); the seen-date lives in localStorage (always inside try/catch).
export const SEEN_KEY = 'bracken.whatsnewSeen';
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
let updates = [];
let loaded = false;
export const parseUpdates = (raw) => {
  const a = Array.isArray(raw) ? raw : [];
  return a.filter(e => e && /^\d{4}-\d{2}-\d{2}$/.test(String(e.date)) && Array.isArray(e.lines) && e.lines.length)
    .map(e => ({ date: String(e.date), batch: +e.batch || 0, lines: e.lines.map(l => (l && typeof l === 'object') ? String(l.s) : String(l)), tags: e.lines.map(l => (l && typeof l === 'object' && Array.isArray(l.lv)) ? l.lv.map(String) : []) }))
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
/* THE BUILD, SMALL ON THE TITLE (and in a bug report): 'BATCH 86 - 11 OCT', plus the short sha when the release stamped src/build.js */
export const versionLine = (sha = '') => { const u = updates[0]; return u ? (u.batch ? 'BATCH ' + u.batch + ' - ' : '') + shortDate(u.date) + (sha ? ' ' + String(sha).slice(0, 7) : '') : ''; };
export const hasNew = () => !!newestDate() && readSeen() < newestDate();
/* the list as drawable rows: { kind:'head', s } for a date, { kind:'line', s } for a line; wrapFn(s, maxW) splits a long line */
export const rows = (wrapFn, maxW) => {
  const out = [];
  updates.forEach((e, i) => { out.push({ kind: 'head', s: shortDate(e.date), gap: i > 0 });
    for (const ln of e.lines) { const parts = wrapFn('- ' + ln, maxW); parts.forEach((part, j) => out.push({ kind: 'line', s: j ? '  ' + part : part, cont: j > 0, more: j < parts.length - 1 })); } });   /* (claude/bloodknight) cont/more: the list never shows half of a wrapped line at its top or bottom edge */
  return out;
};
/* (claude/wnseed, Daniel 11-03 18:42) THE 2ND TAB, 'LEVELS & BOSSES': every line may carry LEVEL TAGS - the ids of the levels (a boss is tagged by its level) it changed. In docs/updates.json a line is
   either a plain string (untagged: a hero, a menu, a general fix) or { "s": "the line", "lv": ["kings", "burning"] } ("lv": [] = deliberately general). parseUpdates keeps `lines` as strings
   (everything that reads the list is unchanged) and adds a parallel `tags`. levelRows lists only the levels the caller says are unlocked (a locked level's history stays hidden). */
/* { id, entries:[{ date, batch, s }] } per tagged level, newest first, only for ids unlocked(id) is true for; order = order(id) (campaign order) */
export const levelHistory = (unlocked, order = () => 0) => {
  const by = new Map();
  for (const e of updates) e.lines.forEach((s, j) => { for (const id of (e.tags[j] || [])) { if (!unlocked(id)) continue; if (!by.has(id)) by.set(id, []); by.get(id).push({ date: e.date, batch: e.batch, s }); } });
  return [...by.entries()].map(([id, entries]) => ({ id, entries })).sort((a, b) => order(a.id) - order(b.id));
};
/* the ids the filter can cycle through: '' (ALL) then each unlocked level that has history */
export const filterIds = (hist) => [''].concat(hist.map(h => h.id));
/* the 2nd tab as drawable rows: a level head, then 'DATE - line' per change; filter = '' (all) or a level id; nameOf(id) is the level's name */
export const levelRows = (wrapFn, maxW, hist, filter, nameOf) => {
  const out = []; let first = true;
  for (const h of hist) { if (filter && h.id !== filter) continue;
    out.push({ kind: 'head', s: nameOf(h.id), gap: !first }); first = false;
    for (const en of h.entries) { const parts = wrapFn(shortDate(en.date) + ' - ' + en.s, maxW); parts.forEach((part, j) => out.push({ kind: 'line', s: j ? '  ' + part : part, cont: j > 0, more: j < parts.length - 1 })); } }
  return out;
};
