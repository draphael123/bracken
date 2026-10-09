// tools/skyroad.mjs - THE SKY ROAD's own check (claude/skyroad, the greybox). Node only: no page, no port.
//   - the level is on the main road: in LEVELS with needs 'moor', THE ORE ROAD needs it, a CRAG map node, gated by level-quality, one new foe (the kite-rider)
//   - the reach model WITH the cloak reaches every checkpoint, silver, kite cloth, stone, the disc, the loft, the Roc and the gate
//   - THE CLOAK IS REQUIRED: without the glide (opts.noGlide) the fill stops at the station - nothing past ledge one
//   - EVERY STONE AND THE DISC IS A LOCK: with its thermal(s) dead the thing past it is out of reach (s1 the lower deck, s3 the spire, s4+s6 span B,
//     the disc the east tower), and the reel's cage is the only way up the station's cliff
//   - THE LOFT IS A LOCK: with its woven door shut (not the model's "done") its silver is out of reach
//   - four checkpoints at least 90 columns apart; three silvers; four kite cloths (the quest's n)
//   - every thermal's column is clear rock-free from its foot to its top (a column through rock is a lie)
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { readFileSync } from 'node:fs';
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const lv = LEVELS.find(l => l.id === 'skyroad'), L0 = lv && lv.build();
ok(!!lv && lv.needs === 'moor' && LEVELS.find(l => l.id === 'oreroad').needs === 'skyroad', 'THE SKY ROAD follows GALE MOOR and THE ORE ROAD follows it');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
ok(/id: 'skyroad', kind: 'level'/.test(main), 'a map node on the crag sheet');
const lq = readFileSync(new URL('./level-quality.mjs', import.meta.url), 'utf8'), onf = readFileSync(new URL('./one-new-foe.mjs', import.meta.url), 'utf8');
ok(/GATE = \[[^\]]*'skyroad'/.test(lq) && /skyroad: \['kiterider'\]/.test(onf), 'gated by level-quality; its one new foe is the kite-rider');
const L = L0, at = (e, r) => r.near(e.x, e.y) || r.jumpNear(e.x, e.y);
const KEY = ['check', 'silver', 'stray', 'sunstone', 'sundisc', 'loft', 'cloak', 'gate', 'roc'];
{ const r = floodReach(L, T); const miss = L.ents.filter(e => KEY.includes(e.t) && !at(e, r)).map(e => e.t + '@' + e.x + ',' + e.y); ok(!miss.length, 'with the cloak the fill reaches every checkpoint, silver, cloth, stone, the disc, the loft, the Roc and the gate ' + miss.join(' ')); }
{ const r = floodReach(L, T, { noGlide: true }); const past = L.ents.filter(e => KEY.includes(e.t) && e.x > 124 && at(e, r)); ok(!past.length, 'without the cloak nothing past ledge one is reached ' + past.map(e => e.t + '@' + e.x).join(' ')); }
const without = (srcs, extra) => { const ents = L.ents.filter(e => !(e.t === 'vent' && srcs.includes(e.src))); return floodReach({ ...L, ents, ...(extra || {}) }, T); };
const ent = (t, x) => L.ents.find(e => e.t === t && e.x === x);
ok(!at(ent('sunstone', 139), without(['stone:s1'])), 'stone s1 is a lock: with its thermal dead the station\'s lower deck is out of reach');
ok(!at(ent('check', 181), floodReach({ ...L, moversExtra: [] }, T)), 'THE GREAT KITE REEL is a lock: without its cage the upper deck is out of reach');
ok(!at(ent('check', 294), without(['stone:s3'])), 'stone s3 is a lock: with R2 dead the spire and the far cliff are out of reach');
ok(!at(ent('sunstone', 364), without(['stone:s4', 'stone:s6'])), 'stone s4 is a lock: with R5 dead (and R6 dead until span B\'s stone) span B is out of reach');
ok(!at(ent('check', 384), without(['stone:s6'])), 'stone s6 is a lock: with R6 dead the Eyrie door is out of reach');
ok(!at(ent('sunstone', 352), without(['disc:disc'])), 'the sun-disc is a lock: with its road dead the east tower and the spans are out of reach');
{ const r = floodReach({ ...L, vaultDoors: [] }, T); /* (the loft's door as built: the fill opens only the doors L.vaultDoors names) */ const s = ent('silver', 361); ok(!at(s, r), "the riders' loft is a lock: with its woven door shut its silver is out of reach"); }
const ch = L.ents.filter(e => e.t === 'check').sort((a, b) => a.x - b.x); ok(ch.length >= 4 && ch.every((c, i) => !i || c.x - ch[i - 1].x >= 90), 'checkpoints: ' + ch.map(c => c.x).join(', ') + ' (four, 90+ columns apart)');
ok(L.ents.filter(e => e.t === 'silver').length === 3, 'three silvers'); ok(L.ents.filter(e => e.t === 'stray' && e.kind === 'kite').length === L.quest.n, L.quest.n + ' kite cloths');
{ const lie = []; for (const v of L.ents.filter(e => e.t === 'vent' && e.thermal)) { const top = Math.floor(v.y + 1 - v.h / 16); for (let y = top; y <= v.y; y++) if (L.grid[y * L.W + v.x] === T.SOLID) { lie.push(v.x + ',' + y); break; } } ok(!lie.length, 'every thermal column is open air from its foot to its top ' + lie.join(' ')); }
console.log(bad ? 'skyroad: ' + bad + ' FAILED' : 'skyroad: all green'); process.exit(bad ? 1 : 0);
