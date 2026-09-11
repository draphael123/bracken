// tools/content-audit.mjs — the gaps that fail SILENTLY.
// spawnEnt's switch has no default and the deco map returns undefined on an unknown kind, so a
// mistyped entity or scenery kind simply never appears and nothing says a word. Same for a creature
// with no DMG/EHP/COLS row, a stray or relic with no icon, and a foe missing from the bestiary.
// usage: node tools/content-audit.mjs
import fs from 'fs';
import { LEVELS } from '../src/level.js';

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const list = (re, n = 1) => { const out = new Set(); let m; while ((m = re.exec(main))) out.add(m[n]); return out; };
const table = name => { const m = main.match(new RegExp('const ' + name + ' = \\{([^\\n]*)')); if (!m) return new Set();
  return new Set([...m[1].matchAll(/(?:^\s*|[{,]\s*)'?([A-Za-z_][A-Za-z0-9_]*)'?\s*:/g)].map(x => x[1])); };

const spawnCases = list(/case '(\w+)':/g);
const decoKinds = new Set([...(main.match(/const K = \{([\s\S]*?)\}\[e\.kind\]/) || ['', ''])[1].matchAll(/(\w+):\s*\[/g)].map(m => m[1]));
const EHP = table('EHP'), DMG = table('DMG'), COLS = table('COLS');
const beasts = new Set([...main.matchAll(/\{ t: '(\w+)', name: ["']/g)].map(m => m[1]));
const sprites = new Set([...main.matchAll(/SPR\.(\w+)\s*=/g)].map(m => m[1]));
const strayIcons = new Set([...main.matchAll(/pr\.kind === '(\w+)'[ )?]/g)].map(m => m[1]));
const relics = new Set([...(main.match(/const RELICS = \{([\s\S]*?)\};/) || ['', ''])[1].matchAll(/(\w+):\s*\{/g)].map(m => m[1]));

const used = { ent: new Map(), deco: new Map(), stray: new Map(), relic: new Map() };
const note = (m, k, lv) => { if (!m.has(k)) m.set(k, new Set()); m.get(k).add(lv); };

for (const lv of LEVELS) {
  let L; try { L = lv.build(); } catch (e) { console.log(`!! ${lv.id} FAILED TO BUILD: ${e.message}`); continue; }
  for (const e of L.ents) {
    note(used.ent, e.t, lv.id);
    if (e.t === 'deco' && e.kind) note(used.deco, e.kind, lv.id);
    if (e.t === 'stray' && e.kind) note(used.stray, e.kind, lv.id);
    if (e.t === 'relic' && e.kind) note(used.relic, e.kind, lv.id);
  }
}

let bad = 0;
const say = (s) => { bad++; console.log('  ' + s); };
// these five are read straight out of L.ents by loadLevel, not by spawnEnt
const LOADER = new Set(['sign', 'coin', 'check', 'silver', 'gate']);
console.log('== entities placed in a level with no case in spawnEnt (they never appear) ==');
for (const [t, where] of used.ent) if (!spawnCases.has(t) && !LOADER.has(t)) say(`${t}  <- ${[...where].join(', ')}`);
console.log('== deco kinds with no entry in the deco map (silently nothing) ==');
for (const [k, where] of used.deco) if (!decoKinds.has(k)) say(`${k}  <- ${[...where].join(', ')}`);
console.log('== stray kinds with no icon (they fall back to a bright cap) ==');
// sheep draw as sheep; 'cap' uses the bright cap on purpose
for (const [k, where] of used.stray) if (!strayIcons.has(k) && !['sheep', 'cap'].includes(k)) say(`${k}  <- ${[...where].join(', ')}`);
console.log('== relics placed with no RELICS entry (the HUD would throw) ==');
for (const [k, where] of used.relic) if (!relics.has(k)) say(`${k}  <- ${[...where].join(', ')}`);

console.log('== creatures with a spawn case but no EHP / DMG / COLS / bestiary row ==');
// parts of a boss and internals are not creatures you meet
// parked: their code is kept for a re-home but no level places them, so they are not missing anything
const NOT_A_BEAST = new Set(['gill', 'heart', 'bearer', 'master', 'squirrel', 'golem', 'suncatcher', 'bale', 'cutter', 'dummy']); // (the rope cutter is retired: no level places him)
const creatures = [...spawnCases].filter(t => (EHP.has(t) || COLS.has(t) || beasts.has(t)) && !NOT_A_BEAST.has(t));
for (const t of creatures) {
  const miss = [];
  if (!EHP.has(t)) miss.push('EHP');
  if (!COLS.has(t)) miss.push('COLS');
  if (!beasts.has(t)) miss.push('bestiary');
  if (miss.length) say(`${t}: no ${miss.join(', ')}`);
}
// the wight is not placed: the bog raises it. The forgemaster is a known orphan.
const SPAWNED_BY_THE_WORLD = new Set(['wight']);
console.log('== bestiary rows for creatures no level places (they can never be filled in) ==');
for (const t of beasts) if (!used.ent.has(t) && !SPAWNED_BY_THE_WORLD.has(t)) say(`${t}`);

console.log('== per level: silver, quest strays, relic, medals ==');
const MEDALS = new Set([...(main.match(/const MEDALS = \{([^\n]*)/) || ['', ''])[1].matchAll(/(\w+):\s*\[/g)].map(m => m[1]));
for (const lv of LEVELS) {
  if (lv.hidden) continue;
  const L = lv.build();
  const n = t => L.ents.filter(e => e.t === t).length;
  const flags = [];
  if (n('silver') !== 3) flags.push(`silver ${n('silver')}`);
  if (!MEDALS.has(lv.id)) flags.push('NO MEDALS');
  const q = L.quest || (L.strays ? { n: L.strays } : null);
  if (!q) flags.push('no quest');
  else if (n('stray') !== q.n) flags.push(`quest wants ${q.n}, level has ${n('stray')}`);
  if (!n('gate') && !L.escapeGate && !(L.arena && L.arena.boss)) flags.push('no gate'); // a boss level ends when the boss does
  if (flags.length) say(`${lv.id}: ${flags.join('   ')}`);
}
console.log(bad ? `\n${bad} things to look at.` : '\nnothing to report.');
