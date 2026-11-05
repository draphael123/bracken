/* tools/foe-cast.mjs - THE FOE CAST AUDIT (claude/foecast, 11-05). Node only: no page, no port, no Chrome.
     node tools/foe-cast.mjs            the table (road order): foes by kind per level, goblin-AI share, generic share, distinct kinds
     node tools/foe-cast.mjs --check    the lint (exit 1 on a fail): see tools/foe-cast-lint.mjs
   A "kind" is the ent type plus its reskin (cnSkin / canal.cnSkin / bone), so a reskinned goblin counts as its own foe. */
import { fileURLToPath } from 'node:url';
import { install } from './node-canvas.mjs';
install();
const { LEVELS } = await import('../src/level.js');
const { THREAT } = await import('../src/threat.js');
const { depthsOf } = await import('../src/campaign-order.js');
export const GOBLIN_KINDS = new Set(['sprig', 'shield', 'thorn', 'archer', 'sapper', 'brute', 'rockgoblin', 'gobpriest', 'gobmage', 'assassin', 'berserker', 'burngob', 'hearthgob', 'stormshaman', 'sailer', 'horn', 'thief', 'miner', 'sheargob', 'gaffer', 'kite', 'sandgob', 'chief', 'lance', 'snuffer', 'propman', 'tippler', 'scalder', 'sentry', 'pike', 'temperer', 'hornsman', 'gobbomb']);   /* tools/goblin-lint.mjs's list (+ hornsman): copied, not imported, because importing that tool runs it */
export const GENERIC = new Set(['sprig', 'archer', 'shield', 'pike', 'brute', 'hound', 'rockgoblin']);   /* the camp-goblin chassis: the foes every goblin level uses */
/* a reskin is an ent flag (tools/goblin-lint.mjs skinOf, kept in step by hand): cnSkin, canal.cnSkin, or one of the theatre / fair / well-town role flags */
export const skinOf = e => (e.canal && e.canal.cnSkin) || e.cnSkin || (e.juggler ? 'juggler' : e.shy ? 'shy' : e.bandit ? 'bandit' : e.flyman ? 'flyman' : e.prompter ? 'prompter' : null);
export function cast() {
  const depth = depthsOf(LEVELS), out = [];
  for (const lv of LEVELS) {
    let L; try { L = lv.build(); } catch { continue; }
    if (depth[lv.id] === null || depth[lv.id] === undefined || !L.ents) continue;
    const tally = {}; let n = 0;
    for (const e of L.ents) {
      if (!(THREAT[e.t] > 0) || e.t === 'captive') continue;
      const skin = skinOf(e) || (e.bone ? 'bone' : '');
      const k = skin ? e.t + '/' + skin : e.t; tally[k] = (tally[k] || 0) + 1; n++;
    }
    const add = (t, e) => { if (!(THREAT[t] > 0) || t === 'captive') return; const skin = e ? skinOf(e) : ''; const k = skin ? t + '/' + skin : t; tally[k] = (tally[k] || 0) + 1; n++; };
    for (const A of L.ambushes || []) for (const w of A.waves || []) for (const q of w) add(q[0], q[3]);   /* ambush waves and rung-bell garrisons are foes too (the ents list does not hold them) */
    for (const al of L.alarms || []) for (const gd of al.garrison || []) add(gd.t, gd);
    out.push({ id: lv.id, depth: depth[lv.id], W: L.W, n, tally, ents: L.ents });
  }
  return out.sort((a, b) => a.depth - b.depth);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const r of cast()) {
    const g = Object.entries(r.tally).filter(([k]) => GENERIC.has(k)).reduce((s, [, v]) => s + v, 0);
    console.log(`d${r.depth} ${r.id} W${r.W} n${r.n} kinds${Object.keys(r.tally).length} generic${r.n ? Math.round(g / r.n * 100) : 0}%  ` + Object.entries(r.tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + v).join(' '));
  }
}
