// tools/paladin-boss.mjs - THE PALADIN AS THE HERO BOSS (claude/church2, LIT CHURCH 2). Node only: no page, no port, no Chrome. src/paladin-boss.js in a fake
// world (the real src/holy-ground.js makeHolyGround for his circle). What it holds:
//   - B5: every move of his is the HERO's kit (the catalog has each active he uses; his circle is the hero's module, side 'foe'); one new told move a phase
//     (HOLY CHARGE in the Bastion, HAMMER LEAP in the Earthbreaker); his sprite is the hero's sheet (every pose he uses exists in the paladin rig, src/chars.js)
//   - B16: every told move has its OWN windup frame and its OWN release frame (no two moves share either)
//   - B17: at least four told attacks, and the central mechanic is the level's: his LAMPS feed his Light (regen + his vigil), a snuffed lamp dims it, his
//     spenders are gated by it, and starved he FALTERS
//   - B11/B15: always hittable, guards by angle - his aegis turns the front at his height on guard at >= 0.4x and FEEDS him; behind, above, committed it lands
//     and DRAINS; under the aegis's Light the front lands too; hammering the aegis a minute never opens him
//   - B10/B4/B3: the falter is open >= 2.5 s, he stands still in it, then a told ward; the open rule and FULL_DAMAGE are his; marks are src/marks.js's
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as PBM from '../src/paladin-boss.js';
import { makeHolyGround, HG } from '../src/holy-ground.js';
import { BY_HAND, ANSWER } from '../src/marks.js';
import { OPEN_RULE, FULL_DAMAGE } from '../src/boss-greed.js';
import { DIAL_EXEMPT } from '../src/boss-pressure.js';
const { PB } = PBM; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const TS = 16, A = { pb: { sx: 241, R: 41 } }, G = PBM.geom(A, TS);
const cat = readFileSync(new URL('../src/progression-catalog.js', import.meta.url), 'utf8'), chars = readFileSync(new URL('../src/chars.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

/* ---------- THE KIT IS THE HERO'S (B5) ---------- */
const KIT = { chain: 'the maul (his X)', plant: 'CONSECRATE (his tap C: src/holy-ground.js)', throw: 'the HAMMER THROW (UP+C, HG.throw.cost)', smite: 'SMITE (the held overhead in his circle, HG.smite.cost)',
  empower: 'EMPOWER (C in his circle, HG.empower.cost)', charge: 'HOLY CHARGE (holyCharge, the Bastion)', leap: 'HAMMER LEAP (hammerLeap, the Earthbreaker)' };
for (const ph of [1, 2, 3]) for (const m of PBM.CYCLES[ph].flat()) ok(KIT[m], 'his ' + m + ' is the hero\'s own: ' + KIT[m]);
for (const id of ['holyCharge', 'hammerLeap']) ok(new RegExp('"id": "' + id + '",\\s*"hero": "paladin"').test(cat), 'the hero\'s catalog has ' + id);
ok(/"id": "lightLance"|judgement/i.test(cat) && /JUDGEMENT/.test(main), 'JUDGEMENT is the hero\'s (the full bar, C in his circle)');
{ const moves = ph => new Set(PBM.CYCLES[ph].flat()); const p1 = moves(1), p2 = moves(2), p3 = moves(3);
  ok([...p2].filter(m => !p1.has(m)).join() === 'charge' && [...p3].filter(m => !p2.has(m)).join() === 'leap', 'one new told move a phase (B5): HOLY CHARGE (the Bastion), then HAMMER LEAP (the Earthbreaker)'); }
ok(PB.scale >= 1.3 && PB.scale <= 1.7 && /SPR\.paladinboss = palHeroSet\(bakePaladin\(\{\}\)\)/.test(main) && /e\.t === 'paladinboss' \? PBG\.PB\.scale/.test(main), 'his body is the hero\'s own sheet (bakePaladin), drawn x' + PB.scale + ' like the Death Knight boss');
for (const [k] of PBM.PAL_POSES) ok(new RegExp('(F\\.' + k + ' = |\\b' + k + ': )').test(chars), 'the pose ' + k + ' is the hero paladin\'s (src/chars.js)');
ok(PB.circle.r >= HG.r && PB.empower.r >= HG.empower.r && PB.throw.reach >= HG.throw.reach && PB.throw.t === HG.throw.t, 'his circle, empower and hammer are the hero\'s numbers scaled to a boss (r ' + HG.r + ' -> ' + PB.circle.r + ', reach ' + HG.throw.reach + ' -> ' + PB.throw.reach + ')');

/* ---------- B16: OWN WINDUP + OWN RELEASE A MOVE ---------- */
{ const e0 = (mode, modeT = 0.3, o = {}) => PBM.palFrame({ mode, modeT, anim: 0, ...o });
  const pairs = { chain: [e0('chainTell'), e0('chain', 0.01)], plant: [e0('plantTell'), e0('plant')], throw: [e0('throwTell'), e0('throw')], smite: [e0('smiteTell', PB.smite.tell), e0('smite')],
    empower: [e0('empowerTell'), e0('empower')], judge: [e0('judgeTell'), e0('judge')], charge: [e0('chargeTell'), e0('charge')], leap: [e0('leapTell'), e0('leap', 0.1, { lift: 60 })] };
  const wind = Object.values(pairs).map(p => p[0]), rel = Object.values(pairs).map(p => p[1]);
  ok(new Set(wind).size === wind.length && new Set(rel).size === rel.length && Object.values(pairs).every(([a, b]) => a !== b), 'every told move has its own windup frame and its own release frame (B16): ' + JSON.stringify(pairs));
  ok(wind.concat(rel).every(f => f > 0 && f < PBM.PAL_POSES.length - 1), '(none of them is the idle or the hurt frame)'); }

/* ---------- A FAKE WORLD ---------- */
const mkWorld = (lit = 3) => { const c = { said: [], marks: [], hits: [], kindled: [], t: 0 };
  c.lampsArr = G.lamps.map((l, i) => ({ id: l.id, x: l.x, lit: i < lit }));
  Object.assign(c, { lamps: () => c.lampsArr, kindle: id => { const l = c.lampsArr.find(q => q.id === id); if (l && !l.lit) { l.lit = true; c.kindled.push(id); return true; } return false; },
    hit: (b, d, name) => { c.hits.push({ b, d, name }); return false; }, number: (x, y, s) => c.said.push(s), mark: m => c.marks.push(m), sound() {}, fx() {}, shake() {}, music() {}, time: () => c.t });
  c.hg = makeHolyGround({ time: () => c.t, g: () => null, parts: null, targets: () => [], hurt() {}, healers: () => [], heal() {} });
  return c; };
const mk = () => { const S = PBM.newFight(G), e = { t: 'paladinboss', x: G.x0 + 30 * TS, y: G.floorY, hp: PB.hp, maxHp: PB.hp, face: -1, mode: 'walk', modeT: 5, open: 0, alive: true }; S.script = ['chain']; return { S, e }; };
const step = (e, S, c, h, secs) => { for (let i = 0; i < secs * 60; i++) { c.t += 1 / 60; PBM.stepPaladin(e, S, 1 / 60, h, c); c.hg.update(1 / 60); } };

/* ---------- B11 / B15: GUARD BY ANGLE ---------- */
{ const { S, e } = mk(), c = mkWorld(); S.light = 60; const L0 = S.light;
  const r1 = PBM.blowOn(e, S, c, 30, e.x - 20, e.y, false, false); ok(r1.read === 'aegis' && r1.dmg === Math.round(30 * PB.aegis.take) && PB.aegis.take >= 0.4 && S.light === L0 + PB.light.feed, 'HIS AEGIS turns a blow from the front at his height on guard - at x' + PB.aegis.take + ' (B15) - and it FEEDS his Light');
  const r2 = PBM.blowOn(e, S, c, 30, e.x + 20, e.y, false, false); ok(r2.read === 'landed' && r2.dmg === 30 && S.light < L0 + PB.light.feed, 'from behind it lands whole, and drains his Light');
  ok(PBM.blowOn(e, S, c, 30, e.x - 10, e.y - 30, true, false).read === 'landed', 'from above (a jump) it lands');
  for (const m of ['chainTell', 'throwTell', 'smiteTell', 'plantTell', 'vigil', 'land', 'reel']) { e.mode = m; ok(PBM.blowOn(e, S, c, 30, e.x - 20, e.y, false, false).read === 'landed', 'committed (' + m + ') the front lands too'); }
  e.mode = 'walk'; S.light = PB.aegis.min - 1; const r3 = PBM.blowOn(e, S, c, 30, e.x - 20, e.y, false, false); ok(r3.read === 'failed' && r3.dmg === 30 && c.said.includes('HIS LIGHT IS LOW: THE AEGIS FAILS'), 'low on Light (< ' + PB.aegis.min + ') his aegis FAILS, told, and the front lands whole'); }
{ const { S, e } = mk(), c = mkWorld(); let opened = false; const h = [{ x: e.x - 30, y: e.y, alive: true, ground: true }];
  for (let i = 0; i < 60 * 60; i++) { c.t += 1 / 60; h[0].x = e.x + (e.face || -1) * 30; if (i % 30 === 0 && ['walk', 'recover', 'aegis'].includes(e.mode) && S.light >= PB.aegis.min) PBM.blowOn(e, S, c, 20, h[0].x, e.y, false, false); PBM.stepPaladin(e, S, 1 / 60, h, c); c.hg.update(1 / 60); if (PBM.pbOpen(e)) opened = true; }
  ok(!opened, 'hammering his AEGIS (the front, on guard, while it holds) for a minute never opens him (it feeds him)'); }

/* ---------- THE CENTRAL MECHANIC: HIS LAMPS ---------- */
{ const a = mk(), b = mk(), c3 = mkWorld(3), c0 = mkWorld(0); a.S.light = b.S.light = 50; a.e.mode = b.e.mode = 'recover'; a.e.modeT = b.e.modeT = 99;
  step(a.e, a.S, c3, [{ x: a.e.x - 200, y: a.e.y, alive: true }], 2); step(b.e, b.S, c0, [{ x: b.e.x - 200, y: b.e.y, alive: true }], 2);
  ok(a.S.light > b.S.light + 5 && b.S.light === 50, 'his lamps feed his Light (three lit: ' + a.S.light.toFixed(1) + ', all dark: ' + b.S.light.toFixed(1) + ' after 2 s)'); }
{ const { S, e } = mk(), c = mkWorld(); S.light = 50; PBM.lampOut(e, S, c, 'arena0'); ok(S.light === 50 - PB.light.lampDim && c.said.some(s => /HIS LIGHT DIMS/.test(s)), 'a snuffed sanctuary lamp dims his Light at once (told)'); }
{ const { S, e } = mk(), c = mkWorld(); S.light = 20; S.vigilCd = 0; e.mode = 'recover'; e.modeT = 0; const h = [{ x: e.x - 150, y: e.y, alive: true }];
  PBM.stepPaladin(e, S, 1 / 60, h, c); ok(e.mode === 'vigilWalk' && S.kneelId, 'low on Light with a lamp lit, he goes to KNEEL at it (the hero\'s crouch rule)');
  let t = 0; while (e.mode === 'vigilWalk' && t < 4) { PBM.stepPaladin(e, S, 1 / 60, h, c); t += 1 / 60; } ok(e.mode === 'vigilTell' || e.mode === 'vigil', 'he reaches it and kneels (told: ' + c.said.filter(s => /KNEELS/.test(s)).join() + ')');
  step(e, S, c, h, 0.6); const l1 = S.light; step(e, S, c, h, 0.5); ok(e.mode === 'vigil' && S.light > l1 + 8, 'the vigil fills his Light fast (' + l1.toFixed(0) + ' -> ' + S.light.toFixed(0) + ' in half a second)');
  PBM.blowOn(e, S, c, 20, e.x + 20, e.y, false, false); ok(e.mode === 'recover' && S.n.vigilsCut === 1, 'a blow that lands CUTS the vigil');
  const f = mk(); f.S.light = 20; f.S.vigilCd = 0; f.e.mode = 'recover'; f.e.modeT = 0; let tt = 0; while (f.e.mode !== 'vigil' && tt < 6) { PBM.stepPaladin(f.e, f.S, 1 / 60, h, c); tt += 1 / 60; }
  const lamp = c.lampsArr.find(q => q.id === f.S.kneelId); lamp.lit = false; PBM.lampOut(f.e, f.S, c, lamp.id); ok(f.e.mode === 'recover', 'SNUFFING the lamp he kneels at cuts it too'); }
{ /* THE SPENDERS ARE GATED BY HIS LIGHT: a starved Paladin throws nothing, smites nothing, empowers nothing, never judges */
  const { S, e } = mk(), c = mkWorld(0), seen = new Set(); const h = [{ x: e.x - 90, y: e.y, alive: true, ground: true }];
  c.hg.plant(e, e.x, G.floorY, { r: PB.circle.r, life: 99, side: 'foe' }); S.light = 0; S.vigilCd = 99;
  for (let i = 0; i < 60 * 40; i++) { c.t += 1 / 60; S.light = Math.min(S.light, 6); PBM.stepPaladin(e, S, 1 / 60, h, c); seen.add(e.mode); if (e.mode === 'walk' || e.mode === 'recover') e.x = Math.max(G.x0 + 40, Math.min(G.x1 - 40, e.x)); }
  ok(!['throwTell', 'smiteTell', 'empowerTell', 'judgeTell'].some(m => seen.has(m)) && seen.has('chainTell'), 'starved of Light he throws no hammer, smites nothing, empowers nothing, never judges - only his maul (' + [...seen].join(' ') + ')'); }
{ const { S, e } = mk(), c = mkWorld(), seen = new Set(); const h = [{ x: e.x - 80, y: e.y, alive: true, ground: true }];
  for (let i = 0; i < 60 * 90; i++) { c.t += 1 / 60; S.light = Math.max(S.light, 60); PBM.stepPaladin(e, S, 1 / 60, h, c); c.hg.update(1 / 60); seen.add(e.mode); h[0].x = Math.max(G.x0 + 30, Math.min(G.x1 - 30, e.x + (e.x > (G.x0 + G.x1) / 2 ? -80 : 80))); }
  ok(['chainTell', 'plantTell', 'throwTell', 'smiteTell', 'empowerTell'].every(m => seen.has(m)), 'with Light he plays his whole phase-one kit: ' + ['chainTell', 'plantTell', 'throwTell', 'smiteTell', 'empowerTell'].filter(m => seen.has(m)).join(' ')); }

/* ---------- THE FALTER (B10/B4/B3) ---------- */
{ const { S, e } = mk(), c = mkWorld(0); S.light = 4; e.mode = 'walk'; const x0 = e.x; PBM.blowOn(e, S, c, 20, e.x + 20, e.y, false, false); PBM.stepPaladin(e, S, 1 / 60, [{ x: e.x + 60, y: e.y, alive: true }], c);
  ok(PBM.pbOpen(e) && e.open >= 2.5, 'DRIVEN TO NOTHING he FALTERS: open ' + e.open.toFixed(2) + ' s');
  let still = true, t = 0; while (PBM.pbOpen(e)) { PBM.stepPaladin(e, S, 1 / 60, [{ x: e.x + 60, y: e.y, alive: true }], c); if (Math.abs(e.x - x0) > 0.01) still = false; t += 1 / 60; if (t > 5) break; } ok(still && t >= 2.5, 'he stands still through it (B4): ' + t.toFixed(2) + ' s');
  ok(S.ward > 0 && PBM.blowOn(e, S, c, 30, e.x + 20, e.y, false, false).read === 'ward' && S.light === PB.light.refill, 'then a told ward (B3) as his Light comes back to ' + PB.light.refill);
  const o = mk(); o.S.light = 30; o.e.mode = 'falter'; o.e.open = 3; ok(PBM.blowOn(o.e, o.S, c, 100, o.e.x - 10, o.e.y, false, false).dmg === Math.round(100 * PB.falterMul), 'open, a blow lands x' + PB.falterMul);
  ok(PB.falterMul >= 1.5 && PB.falterMul <= 2, '(B15: openings pay 1.5-2x)'); }
{ /* JUDGEMENT: only with the full bar in his circle; it spends it all - and the next blow that LANDS on the empty bar is the falter */
  const { S, e } = mk(), c = mkWorld(); S.light = 100; e.mode = 'recover'; e.modeT = 0; const h = [{ x: e.x - 40, y: e.y, alive: true }];
  PBM.stepPaladin(e, S, 1 / 60, h, c); ok(e.mode !== 'judgeTell', 'the full bar out of his circle: no judgement');
  c.hg.plant(e, e.x, G.floorY, { r: PB.circle.r, life: 9, side: 'foe' }); S.light = 100; e.mode = 'recover'; e.modeT = 0; PBM.stepPaladin(e, S, 1 / 60, h, c);
  ok(e.mode === 'judgeTell' && S.marks.length >= 5, 'the full bar IN his circle: JUDGEMENT, told by ' + S.marks.length + ' crosses round him');
  step(e, S, c, h, PB.judge.tell + 0.05); ok(S.light < 1 && !PBM.pbOpen(e) && c.hits.some(q => q.name === PBM.MOVE_NAME.judge), 'the light comes down; it spends the whole bar (and is no falter)');
  e.mode = 'recover'; e.modeT = 0.5; PBM.blowOn(e, S, c, 20, e.x + 20, e.y, false, false); PBM.stepPaladin(e, S, 1 / 60, h, c); ok(PBM.pbOpen(e), 'a blow that lands on the empty bar: he falters'); }

/* ---------- THE PHASES CHANGE THE ARENA ---------- */
{ const { S, e } = mk(), c = mkWorld(1); e.hp = e.maxHp * 0.6; e.mode = 'walk'; e.modeT = 1; PBM.stepPaladin(e, S, 1 / 60, [{ x: e.x - 80, y: e.y, alive: true }], c);
  ok(S.ph === 2 && c.kindled.length === 2 && c.said.some(s => /ROSE WINDOW KINDLES HIS LAMPS/.test(s)), 'THE BASTION (P2): the rose window kindles his dark lamps (' + c.kindled.join() + ')'); }
{ const { S, e } = mk(), c = mkWorld(); e.hp = e.maxHp * 0.25; S.ph = 3; c.hg.plant(e, e.x, G.floorY, { r: PB.circle.r, life: 9, side: 'foe' }); S.script = ['leap']; S.step = 0; e.mode = 'recover'; e.modeT = 0;
  const h = [{ x: e.x - 160, y: e.y, alive: true }]; PBM.stepPaladin(e, S, 1 / 60, h, c); ok(e.mode === 'leapTell' && S.leap, 'THE EARTHBREAKER (P3): HAMMER LEAP, a ring at your feet');
  const tx = S.leap.x; step(e, S, c, h, PB.leap.tell + PB.leap.fly + 0.05); const ci = c.hg.of(e); ok(Math.abs(e.x - tx) < 1 && ci && Math.abs(ci.x - tx) < 1 && S.waves.length >= 1, 'he comes down on it, the quake runs both ways, and HIS CIRCLE COMES WITH HIM'); }
{ /* HIS HOLY GROUND burns a hero who stands in it and mends him (the hero's module, his side) */
  let burnt = 0, mend = 0; const t = { x: 0, y: 0 }, e = { x: 100, y: 200, light: 0, hp: 500, maxHp: 1000, alive: true }; t.x = 110; t.y = 200;
  const hg = makeHolyGround({ time: () => 0, g: () => null, parts: null, targets: () => [t], hurt: (b, d) => { burnt += d; }, healers: () => [e], heal: (b, nn) => { mend += nn; } });
  hg.plant(e, 100, 200, { r: PB.circle.r, life: 9, side: 'foe' }); for (let i = 0; i < 120; i++) hg.update(1 / 60);
  ok(burnt > 0 && mend > 0 && hg.of(e).side === 'foe', 'his circle (side foe) burns a hero standing in it (' + burnt + ' in 2 s) and mends him'); }

/* ---------- THE TABLES ---------- */
ok(Object.values(PBM.MOVES).filter(m => m.mark).length >= 4, 'B17: at least four told attacks (' + Object.entries(PBM.MOVES).filter(([, m]) => m.mark).map(([k]) => k).join(' ') + ')');
for (const [mode, mv] of Object.entries(PBM.MOVES)) ok(BY_HAND['paladinboss|' + mode] === mv.mark && (!mv.answer || ANSWER['paladinboss|' + mode] === mv.answer), 'his ' + mode + ' wears ' + (mv.mark || 'no mark') + ' in src/marks.js');
ok(OPEN_RULE.paladinboss && FULL_DAMAGE.paladinboss, 'he has an opening rule and is on FULL_DAMAGE (a duelist: no chip)');
ok(DIAL_EXEMPT.has('paladinboss'), 'he is self-tuned in his lane: DIAL_EXEMPT (src/boss-pressure.js)');
ok(/coinBoss: true, feat: 'boss:church'/.test(main) && /PROG\.bossDown\.church = true/.test(main), 'beating him is the Paladin\'s hero fight: PROG.bossDown.church opens the hero (silver after; the feat boss:church)');
console.log('ok  paladin-boss  ' + n + ' checks: the hero\'s kit and sheet (B5), own windup + release a move (B16), four+ told attacks and his lamps as the central mechanic (B17), guard by angle at >= 0.4x (B11/B15), the falter, still, then a ward (B10/B4/B3), judgement, the vigil, the phases, his holy ground, the tables');
