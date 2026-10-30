// tools/warcairn.mjs - THE WAR CAIRN and THE BERSERKER CHIEFTAIN (claude/warcairn, the opus greybox; Node, no page - tools/warcairn-probe.mjs is the page smoke).
// scratch/brief-crownpath-1028.md (Daniel 10-28, all five recs).
//   THE ROAD: a TOLD spur off HIGHCROWN (spurOf 'crown'), APPENDED to LEVELS, needing what Highcrown needs (and open with PROG.crownOpen too), a spur node on the crag sheet,
//   classFor the Berserker; gated by level-quality; five named areas; start + TWO shrines; nothing on the main road needs it.
//   THE ROUTE: the fill reaches every shrine and the boss; each DRUM GATE (the tunnel, the three chimney hatches) is a LOCK; each REQUIRED chained slab is a LOCK and the high
//   line's two are NOT (the shortcut); the gorge's DRIVEN HATCHET is a LOCK; the rule is taught, tested, remixed and examined.
//   THEME: no goblin anywhere (every soldier / javelin / shield / heavy / runner wears a clan reskin; the harpies are crag harpies); no timber, no ice tiles.
//   THE HANDS IN A FAKE WORLD: a beat opens the drum's gates (and they swing shut, never on a body), swings its slabs level and back, cracks its cornice (gone, then back),
//   stumbles the clan in earshot (e.broken) and gives the striker WAR-RAGE; a spent drum does nothing; the drummer's beat surges the clan; an arrow in flight is a beat.
//   THE BOSS, PURE: the B15 floor on every mode (>= 0.4 outside an opening, the ward and his parry included), TAKE IT broken by a heavy and by a beat, BREAK THE BEAT
//   (a beat in his frenzy: open x2, capped at 15%, then the ward), the stuck cross-chop (x1.5), P3's own drum (only the other breaks him), the phases each add one move,
//   every told move its own windup + release pose (B16) off the hero's own sheet, the bot strikes a drum in his frenzy.
//   THE UNLOCK: WARCAIRN_SHIPS is true (BATCH129); the store lock is the Blood Knight's (beat him, then 10 silver) and the HOW line fits; owners keep him;
//   the Chieftain's Axes skin is the berserker's, earned by the feat.
//   WAR CAIRN 2 (claude/warcairn2, scratch/brief-warcairn2-1030.md): THE HATCHET - racks, the clan's drops, the told arc; the gorge's HAULED BRIDGE is a LOCK its rope's post answers
//   (a lob from the lip hits it); a hanging stone crushes and stays, a totem crushes and shatters, a nest knocked down hurts its harpies (and a standing one hatches them again),
//   a hatchet on a drum is a beat. MORE harpies / rams / elite berserkers, no goblins. THE BOSS: his hatchet sticks BZC.throw.stick s, a hero takes it and throws it back - he STAGGERS
//   (open x2, capped, then the ward), not taken he tugs it back; FULL-RAGE FRENZY turns EVERY blow (x0, told) until a drum is rung (Daniel's 2nd resist-floor exception); TAKE IT
//   absorbs and COUNTERS (the hero's riposte: its own windup pose); the bot takes his hatchet and throws it back.
//     node tools/warcairn.mjs
import { readFileSync } from 'node:fs';
import { install } from './node-canvas.mjs'; install();
const { LEVELS, T } = await import('../src/level.js');
const { floodReach } = await import('../src/reachcore.js');
const { CAIRN, SECTIONS, WC_RULE, ARCS, WC_RESKIN } = await import('../src/war-cairn.js');
const { makeWarCairnHands, WC, WC_SAY, CLAN } = await import('../src/war-cairn-hands.js');
const { HATCHET } = await import('../src/war-cairn-hatchets.js');
const CTW = await import('../src/carry-throw.js');
const BZ = await import('../src/bzchief.js');
const { SAY_LINES } = await import('../src/hint-lines.js');
const { lockOf } = await import('../src/store.js');
const HR = await import('../src/hero-roster.js');
const { anchorFaults } = await import('./anchor-lint.mjs');
const TS = 16;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const lv = LEVELS.find(l => l.id === 'warcairn'), L = lv.build();
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const main = src('src/main.js');

// ---- THE ROAD ----
const crown = LEVELS.find(l => l.id === 'crown');
ok(lv.spurOf === 'crown' && lv.classFor === 'berserker' && lv.needs === crown.needs, 'a told spur off HIGHCROWN (spurOf crown, classFor berserker), needing what Highcrown needs (' + lv.needs + ')');
ok(LEVELS.indexOf(lv) > LEVELS.findIndex(l => l.id === 'kitchengate'), 'APPENDED after the Kitchen Gate (saves count levels by index)');
ok(!LEVELS.some(l => l.needs === 'warcairn' || (l.opensOn && l.opensOn.level === 'warcairn')), 'SKIPPABLE: nothing needs it');
ok(/CRAG_NODES\.push\(\{ id: 'warcairn', kind: 'level'[^\n]*spur: true/.test(main), 'a spur node on the crag sheet');
ok(/!\(lv\.id === 'warcairn' && PROG\.crownOpen\)/.test(main), 'it opens when Highcrown opens (a grandfathered save with PROG.crownOpen too)');
ok(lv.rule === WC_RULE && /STRIKE A DRUM/.test(lv.rule), 'the rule line: ' + lv.rule);
ok(/GATE = \[[^\]]*'warcairn'/.test(src('tools/level-quality.mjs')), 'gated by level-quality');
ok(L.warcairn === true && L.W === CAIRN.W && L.H === CAIRN.H, 'the level is src/war-cairn.js (L.warcairn), ' + L.W + 'x' + L.H);
ok(SECTIONS.length === 5 && SECTIONS.every((s, i) => i === 0 || s[1] === SECTIONS[i - 1][2]) && SECTIONS[4][2] === L.W, 'five named areas tile the level: ' + SECTIONS.map(s => s[0]).join(', '));
const checks = L.ents.filter(e => e.t === 'check');
ok(checks.length === 2, 'start + TWO shrines (Daniel: fewer): ' + checks.map(c => c.x + ',' + c.y).join(' '));
ok(L.arena && L.arena.boss === 'bzchief' && checks[1].x < L.arena.wallL && L.arena.wallL - checks[1].x <= 16, 'the second shrine is the boss\'s retry point, a short walk from the ring (' + (L.arena.wallL - checks[1].x) + ' tiles)');
ok(L.arena.x1 - L.arena.x0 >= 40 * TS, 'the ring is ~44 columns (room to read him): ' + (L.arena.x1 - L.arena.x0) / TS);

// ---- THE ROUTE ----
const goal = [Math.round((L.arena.x0 + L.arena.x1) / 2 / TS), Math.round(L.arena.floor / TS) - 1];
const reach = (LL) => floodReach(LL, T, { rides: true }).seen;
const reaches = (LL, x, y) => { const s = reach(LL); for (let dx = -3; dx <= 3; dx++) for (let dy = -2; dy <= 1; dy++) if (s.has((x + dx) + ',' + (y + dy))) return true; return false; };
const clone = o => ({ ...L, grid: L.grid.slice(), reachDoors: (L.reachDoors || []).slice(), reachSpans: (L.reachSpans || []).slice(), ...o });
ok(reaches(L, goal[0], goal[1]), 'the fill reaches THE WAR CAIRN RING');
for (const c of checks) ok(reaches(L, c.x, c.y), 'the fill reaches the shrine at ' + c.x + ',' + c.y);
/* (shut = the gate's cells SOLID for this test: the fill's flight treats T.PORT as a portcullis it may pass over - a lockgate's key is always on the road - so a PORT proves nothing) */
for (const g of L.wcGates) { const LL = clone({ reachDoors: L.reachDoors.filter(d => !(d.x0 === g.x0 && d.y0 === g.y0)) }); for (let y = g.y0; y <= g.y1; y++) for (let x = g.x0; x <= g.x1; x++) LL.grid[y * L.W + x] = T.SOLID; ok(!reaches(LL, goal[0], goal[1]), 'the drum gate \'' + g.id + '\' is a LOCK (shut, the ring is out of reach)'); }
const required = ['face1a', 'face2a', 'face3a', 'face4a'], optional = ['high1', 'high2'];
for (const s of L.wcSlabs) { const LL = clone({ reachSpans: L.reachSpans.filter(([x0, , y]) => !(x0 === s.x0 && y === s.y)) }); const lock = !reaches(LL, goal[0], goal[1]);
  ok(required.includes(s.id) ? lock : optional.includes(s.id) ? !lock : true, 'the slab \'' + s.id + '\' is ' + (lock ? 'a LOCK' : 'not a lock') + (optional.includes(s.id) ? ' (the high line: the shortcut)' : '')); }
{ const h = L.wcHolds[0], LL = clone({}); LL.grid[h.y * L.W + h.x] = T.AIR; ok(!reaches(LL, goal[0], goal[1]), 'the gorge\'s DRIVEN HATCHET (' + h.x + ',' + h.y + ') is a LOCK'); }
/* (claude/warcairn2) THE HAULED BRIDGE is a LOCK: with its span taken away (the rope never cut) the ring is out of reach */
{ const b = L.wcCuts.find(c => c.id === 'gorge'); const LL = clone({ reachSpans: L.reachSpans.filter(([x0, , y]) => !(x0 === b.x0 && y === b.y)) });
  ok(b && b.kind === 'bridge' && !reaches(LL, goal[0], goal[1]), 'THE GORGE\'s HAULED BRIDGE is a LOCK (its rope never cut, the ring is out of reach) - the one required throw');
  { let air = true; for (let x = b.x0; x <= b.x1; x++) if (L.grid[b.y * L.W + x] !== T.AIR) air = false; ok(air, 'it stands hauled up at load (its row is air)'); }
  ok(new Set(L.wcCuts.map(c => c.id)).size === L.wcCuts.length, 'every hatchet target has its own id');
  const ho = L.hoists.find(h => h.id === 'gorge' && h.load === 'throw'); ok(!!ho, 'the pilot reads it as a THROW hoist (src/playtest.js)');
  /* the lob from the throw spot hits the post (the told arc is the arc flown) */
  const solid = (px, py, falling) => { const tx = Math.floor(px / TS), ty = Math.floor(py / TS), t = L.grid[ty * L.W + tx]; return t === T.SOLID || (falling && (t === T.ONEWAY || t === T.PLANK) && (py % TS) < 6); };
  const pb = { l: b.post[0] * TS + 2, r: b.post[0] * TS + 14, t: (b.post[1] - 2) * TS, b: (b.post[1] + 1) * TS };
  const lob = c => { const a = CTW.aimOf('hatchet', 1, { up: true }); const r = CTW.predictArc('hatchet', c * TS + 14, (ho.from[1] + 1) * TS - HATCHET.hand, { vx: a.vx, vy: a.vy }, solid, { stopAt: (x, y) => x > pb.l && x < pb.r && y > pb.t && y < pb.b ? 'post' : null }); return r.land && r.land.hit; };
  const spots = [62, 63, 64].filter(lob); ok(spots.length >= 2 && spots.includes(ho.from[0]), 'a LOB (UP + ATTACK) from the lip hits the rope post: from cols ' + spots.join(', ')); }
ok((L.wcRacks || []).length >= 4, 'HATCHET RACKS: ' + L.wcRacks.map(r => r.id + '@' + r.x + ',' + r.f).join(' '));
for (const r of L.wcRacks) ok([T.SOLID, T.ONEWAY].includes(L.grid[(r.f + 1) * L.W + r.x]), 'the rack ' + r.id + ' stands on footing');
{ const k = t => L.wcCuts.filter(c => c.kind === t).length; ok(k('bridge') >= 1 && k('stone') >= 2 && k('totem') >= 1 && k('nest') >= 3, 'what a hatchet knocks down: ' + ['bridge', 'stone', 'totem', 'nest'].map(t => k(t) + ' ' + t).join(', ')); }
for (const c of L.wcCuts.filter(c => c.kind === 'nest')) ok(c.foes.length >= 2 && c.foes.every(([x, y]) => L.ents.some(e => e.t === 'harpy' && e.x === x && e.y === y)), 'the nest ' + c.id + ' has its harpies: ' + c.foes.map(q => q.join(',')).join(' '));
{ const n = t => L.ents.filter(e => e.t === t).length, els = L.ents.filter(e => e.t === 'berserker' && e.elite).length;
  ok(n('harpy') >= 6 && n('goat') >= 5 && els >= 2, 'MORE OF THE CLAN\'S BEASTS: ' + n('harpy') + ' crag harpies, ' + n('goat') + ' rams, ' + els + ' elite berserkers (' + n('berserker') + ' runners)');
  const foes = L.ents.filter(e => !['sign', 'coin', 'silver', 'deco', 'check', 'cascade', 'wcdrum', 'wcgate', 'wcslab', 'wccornice', 'wchold', 'bzchief'].includes(e.t)), by = {}; for (const e of foes) by[e.t] = (by[e.t] || 0) + 1;
  const top = Object.entries(by).sort((a, b) => b[1] - a[1])[0]; ok(top[1] / foes.length <= 0.36, 'no foe type over ~35%: ' + Object.entries(by).map(([t, k]) => t + ' ' + k).join(', ')); }
{ const LL = clone({}); for (const d of L.wcDrums) for (const id of d.gates) { const g = L.wcGates.find(q => q.id === id); for (let y = g.y0; y <= g.y1; y++) for (let x = g.x0; x <= g.x1; x++) LL.grid[y * L.W + x] = T.AIR; }
  ok(reaches(LL, goal[0], goal[1]), 'with its gates open (the beat) the way is whole'); }
for (const [k, a] of Object.entries(ARCS)) { const steps = Object.keys(a); ok(steps.length >= 2, 'the ' + k + ' arc: ' + steps.join(' -> ')); }
ok(L.wcDrums.filter(d => !d.arena).length >= 9 && L.wcGates.length === 4 && L.wcSlabs.length === 6 && L.wcCornices.length === 4 && L.wcHolds.length === 3, 'the machines: ' + L.wcDrums.length + ' drums, ' + L.wcGates.length + ' gates, ' + L.wcSlabs.length + ' slabs, ' + L.wcCornices.length + ' cornices, ' + L.wcHolds.length + ' driven hatchets');
ok(L.ents.filter(e => e.t === 'drummer').length === 2 && L.ents.filter(e => e.t === 'drummer').every(e => e.drum && L.wcDrums.some(d => d.id === e.drum)), 'two DRUMMERS (the one new foe), each with his drum');
ok(L.ents.filter(e => e.t === 'silver').length === 3, 'three silvers');
ok(anchorFaults(L).length === 0, 'NOTHING FLOATS: anchor-lint finds no fault (' + anchorFaults(L).map(f => f.kind + '@' + f.x + ',' + f.y).join(' ') + ')');

// ---- THEME ----
const GOBLIN = new Set(['sprig', 'rockgoblin', 'hearthgob', 'gobmage', 'gobpriest', 'brute', 'sapper', 'archer', 'chief', 'shieldgob', 'bonegob']);
ok(!L.ents.some(e => GOBLIN.has(e.t)), 'NO GOBLINS: no goblin foe kind in the level');
ok(['soldier', 'javelin', 'shield', 'heavy', 'berserker', 'harpy'].every(t => !L.ents.some(e => e.t === t) || WC_RESKIN[t]), 'every reused foe wears a clan (or crag) reskin: ' + Object.entries(WC_RESKIN).map(([a, b]) => a + '>' + b).join(' '));
ok(!L.ents.some(e => e.t === 'deco' && /tree|log|timber|plank|crate|barrel|ice/i.test(e.kind || '')), 'no timber, no logs, no ice in the dressing');
{ let ice = 0; for (const t of L.grid) if (t === T.ICE || t === T.CRYST) ice++; ok(ice === 0, 'no ice tiles'); }

// ---- THE HANDS IN A FAKE WORLD ----
{ const LL = lv.build(); let now = 0; const said = []; const cells = LL.grid;
  const P = { x: LL.wcDrums[0].x * TS + 8 - 10, y: (LL.wcDrums[0].f + 1) * TS, hp: 100, dead: false, rgArrows: [] };
  const foe = { t: 'soldier', x: P.x + 40, y: P.y, alive: true, speed: 30, mode: 'walk' };
  const ctx = { L: LL, TS, T, sfx: {}, players: () => [P], enemies: () => [foe], time: () => now, hero: () => P, number: (x, y, t) => said.push(t), burst() {}, dust() {}, shake() {}, ring() {},
    asPlayer: (p, fn) => fn(), damage: () => 'hit', cellSet: (x, y, t) => { cells[y * LL.W + x] = t; }, text() {}, moveBody: () => ({ ground: true }), hitOnce: () => true, seen() {} };
  const H = makeWarCairnHands(ctx); H.reset();
  const g = LL.wcGates.find(q => q.id === 'tunnel'), at = (x, y) => cells[y * LL.W + x];
  ok(at(g.x0, g.y0) === T.PORT, 'the tunnel gate stands shut (T.PORT)');
  const d = LL.wcDrums[0], box = { l: d.x * TS, r: d.x * TS + 16, t: d.f * TS, b: (d.f + 1) * TS };
  H.strike(box);
  ok(at(g.x0, g.y0) === T.AIR, 'a blow on the drum: THE BEAT - its gate swings open');
  ok((P.wcRageT || 0) > now && H.raging(P), 'the striker takes WAR-RAGE (' + WC.rage.t + ' s: x' + WC.rage.dealt + ' dealt, x' + WC.rage.taken + ' taken)');
  ok((foe.broken || 0) >= WC.beat.stumble - 1e-6, 'the clansman in earshot STUMBLES (e.broken ' + foe.broken + ')');
  const r0 = H.read().drums[0].spent; H.strike(box); ok(r0 > 0 && H.read().n.heroBeats === 1, 'a SPENT drum does nothing (' + WC.beat.spent + ' s)');
  P.x = g.x0 * TS + 8; P.y = (g.y1 + 1) * TS; for (let i = 0; i < 60 * (WC.gate.open + 1); i++) { now += 1 / 60; H.update(1 / 60); }
  ok(at(g.x0, g.y0) === T.AIR, 'it will not swing shut on a body standing in it');
  P.x = g.x0 * TS - 80; for (let i = 0; i < 30; i++) { now += 1 / 60; H.update(1 / 60); }
  ok(at(g.x0, g.y0) === T.PORT, 'clear of it, it swings shut');
  /* a slab and a cornice */
  const sd = LL.wcDrums.find(q => q.slabs.length && q.cornices.length), s = LL.wcSlabs.find(q => q.id === sd.slabs[0]), c = LL.wcCornices.find(q => q.id === sd.cornices[0]);
  for (let i = 0; i < 60 * 7; i++) { now += 1 / 60; H.update(1 / 60); }
  P.x = sd.x * TS - 200;
  ok(at(s.x0, s.y) === T.AIR && at(c.x0, c.y) === T.ONEWAY, 'the slab hangs (no footing), the cornice stands');
  H.beat(sd.id, 'hero'); ok(at(s.x0, s.y) === T.ONEWAY, 'the beat swings the slab LEVEL');
  for (let i = 0; i < 60 * (WC.cornice.crack + 0.1); i++) { now += 1 / 60; H.update(1 / 60); }
  ok(at(c.x0, c.y) === T.AIR, 'the cornice CRACKS (told) and falls away');
  for (let i = 0; i < 60 * (WC.slab.level); i++) { now += 1 / 60; H.update(1 / 60); }
  ok(at(s.x0, s.y) === T.AIR, 'the slab swings back on its chains');
  for (let i = 0; i < 60 * (WC.cornice.gone); i++) { now += 1 / 60; H.update(1 / 60); }
  ok(at(c.x0, c.y) === T.ONEWAY, 'the snow settles back');
  /* the drummer's beat: the clan SURGES */
  for (let i = 0; i < 60 * 7; i++) { now += 1 / 60; H.update(1 / 60); }
  const dd = LL.wcDrums.find(q => q.id === 'drummer1'); foe.x = dd.x * TS + 30; foe.y = (dd.f + 1) * TS; foe.broken = 0; foe.speed = 30;
  H.beat('drummer1', 'drummer'); now += 0.1; H.update(0.1); ok(H.surging(foe) && foe.speed > 30, 'the DRUMMER\'s beat: the clan SURGES (faster, no flinch: speed ' + foe.speed + ')');
  for (let i = 0; i < 60 * (WC.surge.t + 0.2); i++) { now += 1 / 60; H.update(1 / 60); } ok(!H.surging(foe) && foe.speed === 30, 'the surge passes');
  /* an arrow in flight is a beat (every hero can use the drum: the ranger's arrow) */
  for (let i = 0; i < 60 * 7; i++) { now += 1 / 60; H.update(1 / 60); }
  const d4 = LL.wcDrums.find(q => q.id === 'exam'); P.rgArrows = [{ state: 'fly', x: d4.x * TS + 8, y: (d4.f + 1) * TS - 10 }]; const b0 = H.read().n.heroBeats; H.update(1 / 60);
  ok(H.read().n.heroBeats === b0 + 1 && H.read().n.arrows >= 1, 'a RANGER\'S ARROW through a drum is a beat');
  ok(Object.values(WC_SAY).every(t => SAY_LINES.has(t)), 'every WC_SAY line is a hint line (it is shown)');
  ok(CLAN.has('drummer') && CLAN.has('soldier'), 'the clan set'); }

// ---- (claude/warcairn2) THE HATCHET IN A FAKE WORLD ----
{ const LL = lv.build(); let now = 0; const cells = LL.grid; const at = (x, y) => cells[y * LL.W + x]; const keys = { up: false, down: false };
  const P = { x: 0, y: 0, face: 1, hp: 100, dead: false, ground: true, hurt: 0, rgArrows: [] };
  const foes = []; let hatched = 0;
  const solidPx = (px, py, falling) => { const tx = Math.floor(px / TS), ty = Math.floor(py / TS), t = at(tx, ty); return t === T.SOLID || (falling && (t === T.ONEWAY || t === T.PLANK) && (py % TS) < 6); };
  const ctx = { L: LL, TS, T, sfx: {}, players: () => [P], enemies: () => foes, time: () => now, hero: () => P, number() {}, burst() {}, dust() {}, shake() {}, ring() {}, text() {},
    asPlayer: (p, fn) => fn(), damage: () => 'hit', cellSet: (x, y, t) => { cells[y * LL.W + x] = t; }, moveBody: () => ({ ground: true }), hitOnce: () => true, seen() {},
    keys: () => keys, solidPx, footAt: (x, y) => [T.SOLID, T.ONEWAY, T.PLANK, T.SPIKE].includes(at(x, y)), hurtFoe: (e, d) => { e.hp -= d; if (e.hp <= 0) e.alive = false; },
    spawnFoe: (t, x, y) => { hatched++; const e = { t, x: x * TS + 8, y: (y + 1) * TS, hx: x * TS + 8, hy: (y + 1) * TS, hp: 20, maxHp: 20, alive: true }; foes.push(e); return [e]; }, shoveHero() {} };
  const H = makeWarCairnHands(ctx); H.reset(); const HX = H.hatchets(), step = (s) => { for (let i = 0; i < 60 * s; i++) { now += 1 / 60; H.update(1 / 60); } };
  const throwIt = () => { const q = P.carry; const v = q.launch(P); q.state = 'fly'; q.vx = v.vx; q.vy = v.vy; P.carry = null; };
  /* a rack: E takes one */
  const r0 = LL.wcRacks[0]; P.x = r0.x * TS + 8; P.y = (r0.f + 1) * TS; ok(H.canTake(P) && H.interact(P) && P.carry && P.carry.t === 'wchatchet', 'E at a RACK: a hatchet in hand (P.carry, THROW_KIND.hatchet)');
  ok(H.interact(P) && !P.carry && HX.read().axes.some(q => q.state === 'rest'), 'E again: set down');
  ok(H.interact(P) && P.carry, '...and taken up again');
  /* THE GORGE: a lob from the lip cuts the rope, the bridge swings down */
  const b = LL.wcCuts.find(c => c.id === 'gorge'), ho = LL.hoists.find(h => h.id === 'gorge'); P.x = ho.from[0] * TS + 8; P.y = (ho.from[1] + 1) * TS; P.face = 1; keys.up = true; step(1 / 60);
  ok(HX.arc() && HX.arc().land && HX.arc().land.hit === 'cut', 'the TOLD ARC ends on the rope post (UP: the lob)');
  throwIt(); keys.up = false; step(2); ok(at(b.x0, b.y) === T.PLANK && at(b.x1, b.y) === T.PLANK && HX.read().n.bridges === 1, 'the hatchet CUTS THE ROPE: the bridge swings down (its row is slate treads)');
  /* A HANGING STONE crushes the yard's axeman and stays as a block */
  const st = LL.wcCuts.find(c => c.id === 'yard'), ax = { t: 'soldier', x: (st.x0 + 0.5) * TS + 8, y: 40 * TS, w: 10, h: 14, hp: 60, maxHp: 60, alive: true }; foes.push(ax);
  ok(HX.cut('yard'), 'the yard\'s HANGING STONE: a hatchet on its rope'); step(2); const top = HX.landRow ? HX.landRow('yard') : null;
  ok(at(st.x0, 39) === T.SOLID && at(st.x1, 38) === T.SOLID && ax.hp < 60, 'it falls, CRUSHES the axeman (' + ax.hp + '/60) and stays: a block (a step)');
  /* A TOTEM crushes and shatters (no footing) */
  const tt = LL.wcCuts.find(c => c.kind === 'totem'), gd = { t: 'shield', x: tt.x0 * TS + 8, y: 34 * TS, w: 10, h: 14, hp: 60, maxHp: 60, alive: true }; foes.push(gd);
  HX.cut(tt.id); step(2); ok(gd.hp < 60 && at(tt.x0, 33) === T.AIR && HX.read().cuts.find(c => c.id === tt.id).st === 'gone', 'the TOTEM falls on the guard (' + gd.hp + '/60) and shatters - no footing left');
  /* A NEST: its harpies hurt and reeling; a standing nest hatches one again */
  const ne = LL.wcCuts.find(c => c.id === 'face'); const hs = ne.foes.map(([x, y]) => ({ t: 'harpy', x: x * TS + 8, y: (y + 1) * TS, hx: x * TS + 8, hy: (y + 1) * TS, hp: 20, maxHp: 20, alive: true })); foes.push(...hs);
  H.reset(); ok(hs.every(e => e.wcNest === 'face'), 'the nest\'s harpies are bound to it');
  hs[0].alive = false; P.x = ne.x0 * TS; P.y = 34 * TS; P.carry = null; step(HATCHET.nestEvery + 1); ok(hatched >= 1, 'a NEST that stands HATCHES a harpy again (' + HATCHET.nestEvery + ' s, a hero near)');
  const alive0 = foes.filter(e => e.t === 'harpy' && e.wcNest === 'face' && e.alive); HX.cut('face'); step(1.5);
  ok(alive0.every(e => !e.alive || (e.hp < 20 && e.broken > 0)) && HX.read().cuts.find(c => c.id === 'face').st === 'gone', 'KNOCKED DOWN: its harpies are hurt and reel (' + alive0.map(e => e.alive ? e.hp : 'dead').join(',') + ')');
  const h1 = hatched; step(HATCHET.nestEvery + 2); ok(hatched === h1, '...and none hatch again');
  /* A HATCHET ON A DRUM is a beat */
  const dd = LL.wcDrums.find(d => d.id === 'face2'); P.x = dd.x * TS + 8 - 60; P.y = (dd.f + 1) * TS; P.face = 1; const r2 = LL.wcRacks.find(r => r.id === 'face'); P.x = r2.x * TS + 8; P.y = (r2.f + 1) * TS; H.interact(P);
  const b0 = H.read().n.heroBeats; P.x = dd.x * TS + 8 - 40; throwIt(); step(1); ok(H.read().n.heroBeats === b0 + 1, 'a thrown HATCHET on a DRUM is a BEAT (from range)');
  /* A CLANSMAN FALLS: his hatchet with him */
  const n0 = HX.read().n.drops; const cl = { t: 'soldier', x: 500, y: 600, alive: false, hp: 0 }; foes.push(cl); step(1 / 60); ok(HX.read().n.drops === n0 + 1, 'an axeman cut down DROPS his hatchet');
  /* a blow on you knocks it out of your hand */
  P.x = r0.x * TS + 8; P.y = (r0.f + 1) * TS; H.interact(P); P.hurt = 0.3; step(1 / 60); ok(!P.carry && HX.read().n.lost >= 1, 'a blow that lands knocks it from your hand'); P.hurt = 0;
  ok(Object.values(WC_SAY).every(t => SAY_LINES.has(t)), 'every hatchet line is a hint line'); }

// ---- THE BOSS, PURE ----
{ const A = L.arena, G = BZ.geom(A, TS), S = BZ.newFight(G), e = { x: (G.x0 + G.x1) / 2, y: G.floorY, hp: 2000, maxHp: 2000, alive: true, face: -1, mode: 'walk', modeT: 1 };
  const said = [], c = { number: (x, y, t) => said.push(t), sound() {}, shake() {}, fx() {}, mark() {}, mend() {}, music() {}, drums() {}, drumsAt: () => G.drums.map(d => ({ ...d, spent: false })), takeDrum() {}, crack() {}, hit: () => false };
  const mul = (mode, o = {}) => { e.mode = mode; e.modeT = o.t ?? 0.5; e.open = o.open ?? 0; S.ward = o.ward ?? 0; S.frenzy = o.frenzy ?? 0; S.openTaken = 0; const r = BZ.blowOn(e, S, c, 100, !!o.heavy, o.fromX ?? e.x - 20); return r; };
  const outside = ['walk', 'recover', 'flurryTell', 'flurry', 'crossTell', 'cross', 'doubleTell', 'double', 'throwTell', 'throw', 'whirlTell', 'whirl', 'coil', 'pounce', 'land', 'splitTell', 'split', 'warcry', 'drumWalk', 'drumStrike', 'reel', 'fetch'];
  const lows = outside.map(m => [m, mul(m).dmg / 100]); ok(lows.every(([, k]) => k >= 0.4), 'B15: never under x0.4 outside an opening (and outside his frenzy): ' + lows.map(([m, k]) => m + ' ' + k).join(', '));
  /* (claude/warcairn2) E. THE FRENZY EXCEPTION (Daniel 10-30): in his full-rage frenzy NOTHING lands - every mode - until a drum is rung; told (RING THE DRUM) */
  { const fz = outside.map(m => mul(m, { frenzy: 5 })); ok(fz.every(r => r.dmg === 0 && r.read === 'frenzy'), 'FULL-RAGE FRENZY: fully invulnerable on every mode (x0, read frenzy) - the 2nd resist-floor exception');
    ok(said.includes(BZ.BZC_SAY.ringDrum), 'told: ' + BZ.BZC_SAY.ringDrum); ok(BZ.BZC.frenzy.max >= 8 && BZ.BZC.frenzy.max <= 15, 'it holds until a drum is rung (safety cap ' + BZ.BZC.frenzy.max + ' s)'); }
  ok(mul('walk').dmg === 70 && mul('flurry').dmg === 100, 'walking x0.7, committed x1.0');
  ok(mul('take', { t: 0.5 }).dmg === 40 && mul('take', { t: 0.5 }).read === 'take', 'TAKE IT: a light blow from the front x0.4 (and it feeds his rage)');
  ok(mul('take', { t: 0.5, fromX: e.x + 20 }).dmg === 100, 'TAKE IT turns the front only: round him it lands whole');
  ok(mul('take', { t: BZ.BZC.take.t }).read === 'parry' && mul('take', { t: BZ.BZC.take.t }).dmg >= 40 && S.nextCross, 'ON THE BEAT he PARRIES a light blow (x0.4 still lands; his next cut is the cross-chop)');
  { const r = mul('take', { t: 0.5, heavy: true }); ok(r.read === 'reel' && e.mode === 'reel' && r.dmg === 100, 'a HEAVY blow (a held attack or a plunge) BREAKS TAKE IT: he reels, x1.0'); }
  ok(mul('walk', { ward: 1 }).dmg === 40, 'the post-opening WARD is x0.4 (never wholly turned)');
  { e.mode = 'take'; e.modeT = 0.5; S.ward = 0; S.frenzy = 0; ok(BZ.beatOn(e, S, c, 'arena0', 'hero') === 'reel' && e.mode === 'reel', 'a BEAT breaks TAKE IT too'); }
  { e.mode = 'walk'; S.frenzy = 0; ok(BZ.beatOn(e, S, c, 'arena0', 'hero') === 'idle', 'a beat outside his frenzy: he keeps his own time'); }
  { e.mode = 'flurry'; S.frenzy = 3; S.ward = 0; S.hisDrum = null; const r = BZ.beatOn(e, S, c, 'arena0', 'hero'); ok(r === 'break' && BZ.bzcOpen(e) && S.frenzy === 0, 'BREAK THE BEAT: a beat in his FRENZY ends it - OPEN ' + BZ.BZC.open.t + ' s');
    S.openTaken = 0; const d1 = BZ.blowOn(e, S, c, 100, false, e.x - 20); ok(d1.dmg === 200 && d1.read === 'open', 'open: x' + BZ.BZC.open.mul);
    let tot = d1.dmg; for (let i = 0; i < 10; i++) tot += BZ.blowOn(e, S, c, 100, false, e.x - 20).dmg; ok(S.openTaken <= e.maxHp * BZ.BZC.open.cap + 1, 'the opening is capped at ' + BZ.BZC.open.cap * 100 + '% of him (' + S.openTaken + ')');
    e.open = 0; S.ward = 0; const h = [{ x: e.x - 60, y: e.y, alive: true, ground: true }]; BZ.stepChief(e, S, 1 / 60, h, c); ok(S.ward > 0 && !BZ.bzcOpen(e), 'then a told WARD (' + BZ.BZC.wardT + ' s)'); }
  { S.ward = 0; S.hisDrum = 'arena1'; e.mode = 'flurry'; S.frenzy = 3; ok(BZ.beatOn(e, S, c, 'arena1', 'hero') === 'his' && S.frenzy > 0, 'P3: HIS drum does nothing'); ok(BZ.beatOn(e, S, c, 'arena0', 'hero') === 'break', '...THE OTHER breaks him'); S.hisDrum = null; e.open = 0; S.ward = 0; S.frenzy = 0; }
  { /* THE STUCK CROSS-CHOP: a cross-chop that hits nobody leaves his axes in the stone */ e.mode = 'cross'; e.modeT = 0.001; S.crossHit = false; S.ward = 0; e.face = -1;
    BZ.stepChief(e, S, 1 / 60, [{ x: e.x + 200, y: e.y, alive: true, ground: true }], c); ok(e.mode === 'stuck' && BZ.bzcOpen(e), 'a WHIFFED cross-chop: STUCK (the gold opening)'); S.openTaken = 0;
    ok(BZ.blowOn(e, S, c, 100, false, e.x - 20).dmg === 150, 'stuck: x' + BZ.BZC.stuck.mul); e.open = 0; e.mode = 'walk'; S.ward = 0; }
  /* (claude/warcairn2) D. THE HATCHET BACK */
  { const S3 = BZ.newFight(G), e3 = { ...e, mode: 'walk', modeT: 1, open: 0, face: -1, hp: 2000 }; const hh = [{ x: e3.x - 160, y: e3.y, alive: true, ground: true }];
    e3.mode = 'throwTell'; e3.modeT = 0.001; BZ.stepChief(e3, S3, 1 / 60, hh, c); ok(S3.axe && S3.axe.fly && S3.oneHand, 'THE AXE THROW: his hatchet flies, he is one-handed');
    for (let i = 0; i < 120 && S3.axe.fly; i++) BZ.stepChief(e3, S3, 1 / 60, hh, c); ok(S3.axe && !S3.axe.fly && BZ.axeGrabbable(S3) && Math.abs(S3.axe.stick - BZ.BZC.throw.stick) < 0.1, 'it STICKS in the floor ' + BZ.BZC.throw.stick + ' s (grabbable)');
    ok(BZ.grabAxe(e3, S3, c) && S3.axe.taken && S3.oneHand && !BZ.axeGrabbable(S3), 'E: a hero TAKES it (he stays one-handed)');
    e3.mode = 'walk'; S3.ward = 0; S3.frenzy = 0; const rr = BZ.axeBack(e3, S3, c); ok(rr === 'stagger' && e3.mode === 'staggered' && BZ.bzcOpen(e3) && !S3.oneHand && !S3.axe, 'THROWN BACK, it meets him: he STAGGERS (open ' + BZ.BZC.open.t + ' s) and has both axes again');
    S3.openTaken = 0; ok(BZ.blowOn(e3, S3, c, 100, false, e3.x - 20).dmg === 200, 'staggered: x' + BZ.BZC.open.mul);
    e3.open = 0; BZ.stepChief(e3, S3, 1 / 60, hh, c); ok(S3.ward > 0, 'then the told WARD');
    BZ.axeDropped(e3, S3, c, e3.x - 100); ok(BZ.axeGrabbable(S3), 'thrown and MISSED: it sticks where it lands, the window runs again');
    S3.ward = 0; e3.mode = 'walk'; e3.modeT = 5; for (let i = 0; i < 60 * (BZ.BZC.throw.stick + BZ.BZC.throw.tug + 0.3); i++) BZ.stepChief(e3, S3, 1 / 60, [{ x: e3.x - 400, y: e3.y, alive: true, ground: true }], c);
    ok(!S3.axe && !S3.oneHand && S3.n.tugs >= 1, 'NOT TAKEN: he TUGS it back on its thong');
    S3.frenzy = 4; S3.axe = { x: 0, fly: false, taken: true }; ok(BZ.axeBack(e3, S3, c) === 'frenzy' && e3.mode !== 'staggered', 'in his FRENZY his hatchet does not stagger him (RING THE DRUM)'); S3.frenzy = 0; }
  /* (claude/warcairn2) F. TAKE IT ABSORBS AND COUNTERS (the hero's own) */
  { const S4 = BZ.newFight(G), e4 = { ...e, mode: 'take', modeT: 0.5, open: 0, face: -1, hp: 2000 }; S4.ward = 0; S4.frenzy = 0;
    BZ.blowOn(e4, S4, c, 100, false, e4.x - 20); BZ.blowOn(e4, S4, c, 100, false, e4.x - 20); ok(S4.absorbed === 2, 'TAKE IT absorbs blows from the front (' + S4.absorbed + ')');
    e4.modeT = 0.001; BZ.stepChief(e4, S4, 1 / 60, [{ x: e4.x - 30, y: e4.y, alive: true, ground: true }], c); ok(e4.mode === 'counterTell' && S4.n.counters === 1, 'the stance drops: THE COUNTER (told)');
    for (let i = 0; i < 40 && e4.mode === 'counterTell'; i++) BZ.stepChief(e4, S4, 1 / 60, [{ x: e4.x - 30, y: e4.y, alive: true, ground: true }], c); ok(e4.mode === 'cross' && S4.counterBonus === Math.min(BZ.BZC.counter.cap, 2 * BZ.BZC.counter.per), 'it is a cross-chop, harder for what he took (+' + S4.counterBonus + ')');
    ok(BZ.MOVES.counterTell.mark === '!!' && BZ.bzcFrame({ mode: 'counterTell' }) !== BZ.bzcFrame({ mode: 'cross' }), 'the counter: !! (dodge), its own windup pose'); }
  /* the bot: takes his hatchet off the floor and throws it back */
  { const S5 = BZ.newFight(G), e5 = { ...e, mode: 'walk', modeT: 1, open: 0, face: -1 }; S5.axe = { x: e5.x - 120, y: G.floorY - 2, fly: false, taken: false, tug: 0, stick: 1.2 };
    const b1 = BZ.bzcPlan({ P: { x: e5.x - 121, y: e5.y, face: -1, ground: true, atk: -1 }, e: e5, S: S5, drums: [], reach: 24, shield: false, t: 1, mem: {}, v2: true });
    ok(b1.talk, 'the bot takes his hatchet: ' + b1.why);
    const b2 = BZ.bzcPlan({ P: { x: e5.x - 90, y: e5.y, face: 1, ground: true, atk: -1 }, e: e5, S: S5, drums: [], reach: 24, shield: false, t: 1, mem: {}, v2: true, holding: true, carry: true });
    ok(b2.atk && b2.face === 1, 'holding it, the bot throws it back: ' + b2.why); }
  /* the phases: each adds one move */
  const moves = ph => new Set(BZ.CYCLES[ph].flat());
  ok(!moves(1).has('pounce') && moves(2).has('pounce') && !moves(2).has('split') && moves(3).has('split'), 'P2 adds THE POUNCE, P3 THE GROUND-SPLITTER');
  ok(BZ.BZC.p2 === 0.65 && BZ.BZC.p3 === 0.3, 'the phase lines: 65% and 30%');
  /* P1: his rage fills but no frenzy */
  { const S1 = BZ.newFight(G), e1 = { ...e, hp: 2000, mode: 'walk', modeT: 0.1, open: 0 }; S1.rage = 100; for (let i = 0; i < 120; i++) BZ.stepChief(e1, S1, 1 / 60, [{ x: e1.x - 300, y: e1.y, alive: true, ground: true }], c); ok(S1.frenzy === 0, 'P1: his rage is full but locked (no frenzy)');
    e1.hp = 1200; S1.rage = 100; let fz = false; for (let i = 0; i < 600 && !fz; i++) { BZ.stepChief(e1, S1, 1 / 60, [{ x: e1.x - 300, y: e1.y, alive: true, ground: true }], c); fz = S1.frenzy > 0; } ok(fz, 'P2: full rage is a FRENZY (the war cry)'); }
  /* the poses: every told move its own windup + release frame, off the hero's own sheet */
  { const chars = src('src/chars.js'), keys = [...new Set(BZ.BZC_POSES.map(p => p[0]))], base = new Set(['idle', 'run', 'hurt', 'windup', 'heavy', 'blast', 'slump']);
    ok(keys.every(k => base.has(k) || new RegExp('F\\.' + k + ' = ').test(chars)), 'every pose row is a key of the Berserker\'s own sheet: ' + keys.join(' '));
    const tells = Object.keys(BZ.MOVES).filter(m => BZ.MOVES[m].mark); const fr = m => { const ee = { mode: m, modeT: 0, anim: 0, left: true }; return BZ.bzcFrame(ee); };
    const rel = m => ({ flurryBeat: 'flurry', coil: 'pounce' })[m] || m.replace(/Tell$/, ''); ok(tells.every(m => fr(m) > 3 && fr(m) !== fr(rel(m))), 'B16: each told move has its own windup pose, apart from its release'); }
  /* the bot: in his frenzy it goes to a drum and strikes it; into TAKE IT it does not swing */
  { const S2 = BZ.newFight(G), e2 = { ...e, mode: 'walk', modeT: 1, open: 0 }; S2.frenzy = 4; const d0 = G.drums[0];
    const pl = BZ.bzcPlan({ P: { x: d0.x + 80, y: e2.y, face: -1, ground: true, atk: -1 }, e: e2, S: S2, drums: G.drums.map(d => ({ ...d, spent: false, his: false })), reach: 24, shield: false, t: 1, mem: {}, v2: true });
    ok(/drum/.test(pl.why), 'the bot in his frenzy: ' + pl.why);
    const pl2 = BZ.bzcPlan({ P: { x: d0.x + 14, y: e2.y, face: -1, ground: true, atk: -1 }, e: e2, S: S2, drums: G.drums.map(d => ({ ...d, spent: false, his: false })), reach: 24, shield: false, t: 1, mem: {}, v2: true });
    ok(pl2.atk && pl2.why === 'strike the drum', 'beside the drum it strikes it');
    S2.frenzy = 0; e2.mode = 'take'; e2.x = d0.x + 200; const pl3 = BZ.bzcPlan({ P: { x: e2.x - 30, y: e2.y, face: 1, ground: true, atk: -1 }, e: e2, S: S2, drums: [], reach: 24, shield: false, t: 1, mem: {}, v2: true });
    ok(!pl3.atk, 'it never swings into TAKE IT: ' + pl3.why); }
  ok(Object.values(BZ.BZC_SAY).every(t => SAY_LINES.has(t)), 'every BZC_SAY line is a hint line (it is shown)');
  ok(Object.values(BZ.BZC.heroHp).every(k => k > 0) && BZ.BZC.hp >= 1900 && BZ.BZC.hp <= 2200, 'his health in the Paladin / Blood Knight class at crown tier: ' + BZ.BZC.hp); }

// ---- THE UNLOCK ----
{ ok(HR.WARCAIRN_SHIPS === true && HR.howTo('berserker') === 'BEAT HIM AT THE WAR CAIRN, THEN BUY: 10 SILVER', 'shipped (BATCH129): THE BERSERKER is locked behind the Chieftain, then 10 silver');
  const hr = src('src/hero-roster.js'), how = /berserker: '([^']+)'/.exec(hr); ok(how && how[1].length <= 46, 'the flipped HOW line fits (heropick, 46 chars): ' + (how && how[1]));
  ok(/const BZ_WIN = \{ coinPrice: 800, coinNeeds: 'warcairn', coinBoss: true, feat: 'boss:warcairn'/.test(main) && /id: 'berserker'[^\n]*\.\.\.\(HR\.WARCAIRN_SHIPS \? BZ_WIN : \{\}\)/.test(main), 'flipped, his row takes the Blood Knight\'s fields (beat him, then 10 silver)');
  const row = { id: 'berserker', price: 10, silver: true, coinPrice: 800, coinNeeds: 'warcairn', coinBoss: true, feat: 'boss:warcairn', featName: 'beat the Berserker Chieftain at the War Cairn' };
  ok(lockOf(row, {}, () => false) === 'beat the Berserker Chieftain at the War Cairn to earn it' && lockOf(row, {}, () => true) === null, 'the store lock: beat him first, then he is for sale');
  ok(/function bzchiefBeaten\(e\)[^\n]*curId\(\) !== 'warcairn'/.test(main) && /PROG\.bossDown\.warcairn = true/.test(main) && /PROG\.swords\.chiefaxes = true/.test(main), 'beaten in his own level: boss:warcairn, and THE CHIEFTAIN\'S AXES for anyone who beats him (no refund)');
  ok(/id: 'chiefaxes', name: "THE CHIEFTAIN'S AXES", price: 8, silver: true, hero: 'berserker'[^\n]*feat: 'boss:warcairn'/.test(main), 'the Chieftain\'s Axes: the berserker\'s weapon skin, earned by the feat'); }

console.log(bad ? '\nwarcairn: ' + bad + ' FAILED' : '\nok  warcairn');
process.exit(bad ? 1 : 0);
