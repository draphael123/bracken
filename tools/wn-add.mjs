// tools/wn-add.mjs - WHAT'S NEW ENTRIES WITH LEVEL TAGS (claude/wnseed, Daniel 11-03 18:42). Node only, no browser.
//   Every What's New line from batch 143 on is { "s": "the line", "lv": ["kings"] } - the ids of the levels it changed (a boss is tagged by its level; "lv": [] = a game-wide line).
//   The title menu's LEVELS & BOSSES tab lists a line under each level it names, for players who have unlocked that level (src/whatsnew.js levelHistory).
//   add    node tools/wn-add.mjs add <batch> <YYYY-MM-DD> "line text|lv1,lv2" "line text|" ...   puts the entry at the TOP of docs/updates.json (3-6 lines, tags checked against the real level ids)
//   check  node tools/wn-add.mjs check <batch> < docs/updates.json   exit 0 when the batch has a valid entry (what scratch/release.sh --deploy runs in place of whatsnew-guard.mjs)
//   ids    node tools/wn-add.mjs ids   prints the taggable level ids
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), FILE = join(ROOT, 'docs/updates.json');
export const TAG_FROM = 143;   /* batches from here on must tag every line (a plain string is an untagged line) */
export const levelIdList = async () => { const { LEVELS } = await import('../src/level.js'); return LEVELS.filter(l => !/^(trial_|shop|custom)/.test(l.id)).map(l => l.id); };
/* problems with entry `e` (empty = fine); ids = the valid level ids, or null to skip the id check */
export function problems(e, ids) {
  const out = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(e.date))) out.push('date ' + e.date);
  if (!Array.isArray(e.lines) || e.lines.length < 3 || e.lines.length > 6) out.push('needs 3-6 lines');
  for (const l of e.lines || []) {
    const tagged = l && typeof l === 'object', s = tagged ? l.s : l;
    if (typeof s !== 'string' || !s || s.length > 90 || /claude\/|branch|\.js|\.mjs/i.test(s)) out.push('a short player line: ' + JSON.stringify(s));
    if (tagged) { if (!Array.isArray(l.lv)) out.push('lv must be a list: ' + s); else for (const id of l.lv) if (ids && !ids.includes(id)) out.push('unknown level id "' + id + '": ' + s); }
    else if (+e.batch >= TAG_FROM) out.push('untagged line (use { s, lv:[...] }, lv:[] for a general line): ' + s);
  }
  return out;
}
const cmd = process.argv[2];
if (process.argv[1] && process.argv[1].endsWith('wn-add.mjs')) {
  if (cmd === 'ids') console.log((await levelIdList()).join(' '));
  else if (cmd === 'check') {
    let s = ''; for await (const c of process.stdin) s += c;
    let a; try { a = JSON.parse(s); } catch { process.exit(1); }
    const n = +process.argv[3], e = a.find(x => +x.batch === n); const ids = await levelIdList();
    const p = e ? problems(e, ids) : ['no entry for batch ' + n]; if (p.length) console.error(p.join('\n')); process.exit(p.length ? 1 : 0);
  } else if (cmd === 'add') {
    const [batch, date, ...raw] = process.argv.slice(3), ids = await levelIdList();
    const lines = raw.map(r => { const k = r.lastIndexOf('|'); return { s: (k < 0 ? r : r.slice(0, k)).trim(), lv: k < 0 ? [] : r.slice(k + 1).split(',').map(x => x.trim()).filter(Boolean) }; });
    const e = { date, batch: +batch, lines }, p = problems(e, ids); if (p.length) { console.error(p.join('\n')); process.exit(1); }
    const text = readFileSync(FILE, 'utf8'), nl = text.includes('\r\n') ? '\r\n' : '\n', a = JSON.parse(text);
    if (a.some(x => +x.batch === +batch)) { console.error('batch ' + batch + ' already has an entry'); process.exit(1); }
    const q = JSON.stringify, ln = l => '      { "s": ' + q(l.s) + ', "lv": ' + q(l.lv) + ' }';
    const block = ['  {', '    "date": ' + q(date) + ',', '    "batch": ' + +batch + ',', '    "lines": [', lines.map(ln).join(',' + nl), '    ]', '  },'].join(nl);
    writeFileSync(FILE, text.replace(/^\[\s*/, m => '[' + nl + block + nl + '  '));
    console.log('added batch ' + batch + ' (' + lines.length + ' lines) at the top of docs/updates.json');
  } else { console.error('usage: wn-add.mjs add|check|ids (see the header)'); process.exit(2); }
}
