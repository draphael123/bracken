// tools/balance.mjs — the numbers behind a playthrough, level by level.
// Reads the live tables out of src/main.js (EHP, DMG, TIER, DIFF, the store) and the built levels, and prints:
//   1. per level: what you fight (count, the toughest regular, the boss) as hits to kill for each hero, and what
//      they do to you as hits to die;
//   2. the purse: gold you can pick up by the end of each level against what the store asks for;
//   3. silver: how much there is against how much the store wants.
// usage: node tools/balance.mjs [--diff easy|normal|hard]
import fs from 'fs';
import { LEVELS } from '../src/level.js';

const src = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const grab = name => { const i = src.indexOf('const ' + name + ' = '); if (i < 0) throw new Error(name); let j = src.indexOf('=', i) + 1, depth = 0, k = j;
  for (; k < src.length; k++) { const c = src[k]; if (c === '{' || c === '[') depth++; else if (c === '}' || c === ']') { depth--; if (!depth) break; } }
  return src.slice(j, k + 1); };
const obj = name => Function('return (' + grab(name) + ')')();
const EHP = obj('EHP'), DMG = obj('DMG'), TIER = obj('TIER'), DIFF = obj('DIFF');
const listOf = name => Function('return (' + grab(name).replace(/pal: \{[^}]*\},?/g, '') + ')')();
const SWORDS = listOf('SWORDS'), SKINS = listOf('SKINS'), UPGRADES = listOf('UPGRADES').filter(u => !u.consumable), CHARMS = listOf('CHARMS'), HEROES = listOf('HEROES'), TRAINING = [], ABILITIES = listOf('ABILITIES');
const diff = DIFF[(process.argv.indexOf('--diff') > 0 && process.argv[process.argv.indexOf('--diff') + 1]) || 'normal'];

// the heroes' melee at the start and fully kitted (+3 +3 edges, temper 5); the pyromancer's staff is x0.7 and her
// fire is where her damage is (a hot ember is 12, a jet ticks), so her row is the staff and says so
const HERO = {
  knight: { hp: 100, hitRaw: 10, mul: 1, top: 10 + 9 + 5 },            // (top: the three smith edges and the level-10 growth)
  pyro: { hp: 88, hitRaw: 10, mul: 0.7, top: Math.round(24 * 0.7) },
  paladin: { hp: 120, hitRaw: 14, mul: 1, top: 14 + 9 + 5 },
  pirate: { hp: 90, hitRaw: 8, mul: 1, top: 8 + 9 + 5 },
  reaper: { hp: 95, hitRaw: 16, mul: 1, top: 16 + 9 + 5 },
};
const NOT_FOES = new Set(['folk', 'bale', 'heart']);
const pad = (s, n) => String(s).padEnd(n), rpad = (s, n) => String(s).padStart(n);

console.log('== 1. FIGHTS  (hits to kill: knight / pyro staff / paladin / freebooter / death knight, start kit -> full kit;  hits to die from a typical blow)');
console.log(pad('level', 9) + pad('tier', 5) + pad('foes', 5) + pad('toughest regular', 40) + pad('boss', 44) + 'typical blow -> hits to die k/p/pal/fb/dk');
let goldSoFar = 0; const goldBy = []; let lvIdx = 0; // the hero's level on arriving: one per wood cleared before this one (+3 health, +1 damage every second)
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  const L = lv.build(), tr = TIER[lv.id] || 0, ents = L.ents || [];
  const bossT = L.arena && L.arena.boss, miniT = L.mini && L.mini.boss;
  const foes = ents.filter(e => EHP[e.t] !== undefined && !NOT_FOES.has(e.t) && e.t !== bossT && e.t !== miniT && !(e.t === 'ram' && bossT !== 'ram')); // (the Kingswood rams are battering rams)
  const hpOf = t => Math.round(EHP[t] * diff.ehp * (1 + 0.5 * tr));
  const tough = foes.reduce((a, e) => (!a || EHP[e.t] > EHP[a.t]) ? e : a, null);
  const up = Math.floor(lvIdx / 2), hit = hk => Math.max(1, (HERO[hk].hitRaw + up) * HERO[hk].mul);
  const H5 = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper'];   // every hero, in the order the header names them
  const htk = (hp, h) => H5.map(k => Math.ceil(hp / (h === 'hit' ? hit(k) : HERO[k].top))).join('/');
  const toughS = tough ? `${tough.t} ${hpOf(tough.t)}hp ${htk(hpOf(tough.t), 'hit')}->${htk(hpOf(tough.t), 'top')}` : '-';
  const bossS = bossT === 'mother' ? 'mother (breaks, not bled)' : bossT ? (() => { const hp = Math.round(EHP[bossT] * diff.bhp * (1 + 0.25 * tr)); return `${bossT} ${hp}hp ${htk(hp, 'hit')}->${htk(hp, 'top')}`; })() : '-';
  // the typical blow: the median contact damage of what is placed, scaled up the slope
  const dm = foes.map(e => DMG[e.t]).filter(Boolean).sort((a, b) => a - b), med = dm.length ? dm[dm.length >> 1] : 15;
  const blow = Math.max(1, Math.round(med * diff.take * (1 + 0.28 * tr))), worst = Math.round((dm[dm.length - 1] || 15) * diff.take * (1 + 0.28 * tr));
  const hpL = hk => HERO[hk].hp + 3 * lvIdx; lvIdx++;
  const htd = H5.map(k => Math.ceil(hpL(k) / blow)).join('/');
  console.log(pad(lv.id, 9) + pad(tr, 5) + pad(foes.length, 5) + pad(toughS, 40) + pad(bossS, 44) + `${blow} -> ${htd}   worst ${worst}`);
  const coins = ents.filter(e => e.t === 'coin').length; goldSoFar += coins; goldBy.push([lv.id, coins, goldSoFar, ents.filter(e => e.t === 'silver').length]);
}

console.log('\n== 2. THE PURSE  (every coin picked up, first time through; a replay pays again)');
const priced = [...SWORDS, ...SKINS, ...UPGRADES, ...CHARMS, ...ABILITIES].filter(k => k.price > 0 && !k.silver);
const trainGold = TRAINING.reduce((a, t) => a + t.prices.reduce((x, y) => x + y, 0), 0);
const knightKit = ABILITIES.filter(a => a.hero === 'knight').reduce((a, b) => a + b.price, 0), pyroKit = ABILITIES.filter(a => a.hero === 'pyro').reduce((a, b) => a + b.price, 0);
const allGold = priced.reduce((a, k) => a + k.price, 0) + trainGold;
for (const [id, c, cum] of goldBy) console.log(`  ${pad(id, 9)} ${rpad(c, 4)} coins   ${rpad(cum, 5)} by the end`);
console.log(`  store asks: swords ${SWORDS.filter(s => !s.silver).reduce((a, s) => a + s.price, 0)}, skins ${SKINS.filter(s => !s.silver).reduce((a, s) => a + s.price, 0)}, gear ${UPGRADES.reduce((a, s) => a + s.price, 0)}, charms ${CHARMS.reduce((a, s) => a + s.price, 0)}, knight skills ${knightKit}, pyro skills ${pyroKit}, training ${trainGold}`);
console.log(`  everything for gold: ${allGold}   one playthrough picks up: ${goldSoFar}   (${Math.round(goldSoFar / allGold * 100)}%)`);
console.log(`  (training is gone: the hero's level gives what it did; red tonics at 40 are a sink that never fills)`);

console.log('\n== 3. SILVER');
const silverTotal = goldBy.reduce((a, g) => a + g[3], 0);
const silverAsk = [...SWORDS, ...SKINS, ...HEROES].filter(k => k.silver);
console.log(`  there are ${silverTotal} silvers; the store wants ${silverAsk.reduce((a, k) => a + k.price, 0)}: ` + silverAsk.map(k => `${k.name} ${k.price}`).join(', '));
