// src/secrets.js - THE SECRETS SYSTEM (claude/secrets, Daniel 10-21: "secrets must be CLEAR"). One registry for every hidden path, one set of pure helpers; main.js draws and applies.
//
// A SECRET is a way the game hides on purpose: some pieces to find (THREE LOST BANNERS, THREE VOTIVE LAMPS), and when the last is found a road opens. The pieces are
// SAVED where they always were (PROG.lostBanners[id], PROG.votive[id]) and the road flags are what they always were (PROG.fieldOpen, PROG.churchOpen), so an OLD SAVE needs no
// conversion: found is READ from the save, never counted twice (MIGRATION, below, only marks what an old save already has open as "already told", so no old save is shown the
// 'A HIDDEN WAY OPENS' moment for a road it walked years ago).
//
//   BEFORE DISCOVERY  nothing on the map, nothing in the journal's lines (only the act's count 0 of N), no store/hero line that names the place. The level that hides the first
//                     piece carries the hint (a glint on the piece itself, drawn by main.js: `glintOf`).
//   DISCOVERED        the first piece is found (or the way is open): a dim '?' on the map with its progress line ('2/3 LOST BANNERS'), a row in the journal, a pickup TOAST per piece.
//   OPEN              the last piece: the toast 'A HIDDEN WAY OPENS' in the level, the reveal on the map (rings, the ghost-path, the same words), the hero it carries tagged
//                     'FOUND ON A HIDDEN PATH' on his card and in the store.
//
// `kind`: 'hidden' = the map shows nothing of it until discovered (the Unburied Field). 'told' = the map already shows the locked road and its price (THE LIT CHURCH: Daniel 10-16
// made its three lamps an openly-priced spur) - it is still a secret of the journal and the toasts, it just was never invisible. A later secret (THE PIRATE FLEET) is one row here.
import { ACTS } from './foe-react.js';

export const SECRETS = [
  { id: 'unburied', level: 'unburied', name: 'THE UNBURIED FIELD', kind: 'hidden', host: 'witchlight', hero: 'reaper', openFlag: 'fieldOpen',
    pieces: { prog: 'lostBanners', ids: ['fields', 'burial', 'witchlight'], one: 'LOST BANNER', many: 'LOST BANNERS', stir: 'THE FIELD STIRS' } },
  { id: 'church', level: 'church', name: 'THE LIT CHURCH', kind: 'told', host: 'waymeet', hero: 'paladin', openFlag: 'churchOpen',
    pieces: { prog: 'votive', ids: ['v1', 'v2', 'v3'], one: 'VOTIVE LAMP', many: 'VOTIVE LAMPS', stir: 'THE HILL ROAD STIRS' } },
];
export const byId = id => SECRETS.find(s => s.id === id) || null;
export const forLevel = levelId => SECRETS.find(s => s.level === levelId) || null;
export const forHero = heroId => SECRETS.find(s => s.hero === heroId) || null;
export const HIDDEN_PATH = 'FOUND ON A HIDDEN PATH';

/* HOW MANY PIECES the save holds, of how many */
export function count(s, prog) { const have = (prog && prog[s.pieces.prog]) || {}; return s.pieces.ids.filter(id => have[id]).length; }
export const total = s => s.pieces.ids.length;
/* THE WAY IS OPEN: every piece, the road flag (an old save's), or the level cleared (it was walked) */
export function isOpen(s, prog) { return !!(prog && (prog[s.openFlag] || (prog[s.level] && prog[s.level].cleared))) || count(s, prog) >= total(s); }
/* DISCOVERED: one piece found, or already open. An undiscovered secret is nothing to the player. */
export function isFound(s, prog) { return isOpen(s, prog) || count(s, prog) > 0; }
export const stateOf = (s, prog) => isOpen(s, prog) ? 'open' : isFound(s, prog) ? 'found' : 'unknown';
/* the progress line on the map and in the journal: '2/3 LOST BANNERS' (one piece owed reads singular: '1/1 LOST BANNER' never happens, but '0/1 ...' would) */
export function progressLine(s, prog) { const n = count(s, prog), t = total(s); return n + '/' + t + ' ' + (t === 1 ? s.pieces.one : s.pieces.many); }

/* THE TOASTS. A piece found -> { title: 'LOST BANNER 1/3', sub }, the last -> { title: 'A HIDDEN WAY OPENS', sub: the road's name }. `n` is the count AFTER the pickup. */
export function pieceToast(s, n) {
  const t = total(s);
  if (n >= t) return { title: 'A HIDDEN WAY OPENS', sub: s.name, last: true, col: '#c8b6ff' };
  return { title: s.pieces.one + ' ' + n + '/' + t, sub: n === 1 ? s.pieces.stir : (t - n) + ' MORE TO FIND', last: false, col: '#ffd36b' };
}

/* THE JOURNAL: one block per act that hides anything. found = secrets whose way is OPEN; rows = what the player may be told - a discovered secret by name with its progress,
   an undiscovered one as '? ? ?' (no name, no hint; the count in the header is all it gives away). Act order and names are src/foe-react.js ACTS. */
export function journal(prog) {
  const out = [];
  for (const a of ACTS) {
    const here = SECRETS.filter(s => a.levels.includes(s.level)); if (!here.length) continue;
    const rows = here.map(s => { const st = stateOf(s, prog);
      return { id: s.id, state: st, text: st === 'unknown' ? '? ? ?' : s.name, note: st === 'open' ? 'FOUND' : st === 'found' ? progressLine(s, prog) : 'NOT FOUND YET' }; });
    out.push({ act: a.act, name: a.name, found: rows.filter(r => r.state === 'open').length, of: here.length, rows });
  }
  return out;
}
export const journalTotals = prog => journal(prog).reduce((o, a) => ({ found: o.found + a.found, of: o.of + a.of }), { found: 0, of: 0 });

/* THE HERO LINE: a hero carried by a secret says so. Before the secret is found his lock reads 'BEAT HIM, THEN BUY' with no place; after, with it. null for everyone else. */
export function heroLine(heroId) { return forHero(heroId) ? HIDDEN_PATH : null; }
export function heroHow(heroId, prog, plain) {
  const s = forHero(heroId); if (!s) return plain;
  return isFound(s, prog) ? plain : 'BEAT HIM, THEN BUY: 10 SILVER';
}
/* the store's lock sentence for a secret-carried hero: before the secret is found, no place is named */
export function featWords(heroId, prog, named) { const s = forHero(heroId); return s && !isFound(s, prog) ? 'follow a hidden path' : named; }

/* MIGRATION (run on every load, cheap): a secret already open on this save is marked told, so the reveal and the toast are not replayed for it. Returns the ids marked. */
export function migrate(prog) {
  prog.secretTold = prog.secretTold || {}; const marked = [];
  for (const s of SECRETS) if (isOpen(s, prog) && !prog.secretTold[s.id] && !(prog.secretNew || []).includes(s.id)) { prog.secretTold[s.id] = 1; marked.push(s.id); }
  return marked;
}
/* THE LAST PIECE FOUND: the way opens and the map owes the player the reveal (PROG.secretNew, drained by main.js when the map shows it). Idempotent. */
export function opened(prog, s) { prog.secretNew = prog.secretNew || []; if (!prog.secretTold || !prog.secretTold[s.id]) { if (!prog.secretNew.includes(s.id)) prog.secretNew.push(s.id); } }
export function revealed(prog, id) { prog.secretNew = (prog.secretNew || []).filter(q => q !== id); prog.secretTold = prog.secretTold || {}; prog.secretTold[id] = 1; }
