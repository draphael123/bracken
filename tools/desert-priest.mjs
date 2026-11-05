// tools/desert-priest.mjs - THE DESERT PRIEST (claude/desertpriest), NODE ONLY (no browser, < 1 s). Proves his kit module (src/desert-priest.js) on a fake world,
// his L1-L25 ladder and L25-50 fork pack (src/progression-catalog.js, src/tech-priest.js, src/progression.js), the flag (src/hero-roster.js PRIEST_SHIPS), the
// reflect-kit numbers, and that every main.js / lab.js / satellite hook is present exactly once. The in-page proof (he plays, a bot fights with him) is BROWSER OWED.
import fs from 'fs';
import { makePriest, DP, radMultOf, REFLECT_ROW } from '../src/desert-priest.js';
import { PRIEST_TECH, PRIEST_TECH_FLAT, PRIEST_UPGRADES } from '../src/tech-priest.js';
import * as PR from '../src/progression.js';
import * as HR from '../src/hero-roster.js';
import { PASSIVE_GLYPH } from '../src/skill-glyphs.js';
let n = 0, bad = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL ' + m); } };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

// ---- a fake world: a 40x12 room, floor at row 10, a wall at column 30 ----
const TS = 16, solid = (x, y) => y >= 10 || x >= 30 || x < 0;
function world(opt = {}) {
  const P = { x: 100, y: 160, w: 10, h: 18, face: 1, hp: 60, maxHp: 85, st: 100, ground: true, atk: -1, dead: false };
  const W = { P, enemies: [], seeds: [], time: 0, dark: !!opt.dark, hurt: [], parried: 0, flinched: 0, leaned: 0, reflected: 0, spent: 0, tal: {}, tech: new Set(), upg: {} };
  const api = { get P() { return W.P; }, get enemies() { return W.enemies; }, get seeds() { return W.seeds; }, get time() { return W.time; }, boss: null, TS, SFX: { parry() {}, aegis() {}, lightFull() {}, buzz() {} },
    tal: () => W.tal, tech: id => W.tech.has(id), upg: id => W.upg[id] || 0, spend: c => { if (W.P.st < c) return false; W.P.st -= c; W.spent += c; return true; }, tired() {},
    isSolid: solid, box: b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - b.h, b: b.y }), knockSkip: () => false, undead: e => !!e.undead,
    dark: () => W.dark, inLightAt: () => !W.dark, hurtAs: (tag, e, d) => { W.hurt.push({ tag, e, d }); e.hp -= d; }, swordDmg: () => 13, amul: () => 1,
    number() {}, sparks() {}, dust() {}, burst() {}, ringAt() {}, streaks() {}, shakeCam() {}, hitstop() {}, zoomKick() {}, kitPose() {}, meterReady() {}, trialEvent() {}, noteVerb() {}, teach() {},
    parried: () => { W.parried++; }, noteParry() {}, tap: () => 0.15, windingUp: e => !!e.winding, flinch: e => { W.flinched++; e.winding = false; return true; },
    boltHome: () => false, reflect: s => { s.reflected = true; s.vx = -s.vx; W.reflected++; }, poiseLean: () => { W.leaned++; } };
  W.S = makePriest(api); W.S.ensure(); return W;
}
const foe = (x, o = {}) => ({ x, y: 160, w: 12, h: 16, hp: 100, alive: true, ...o });
const keys = (o = {}) => ({ atk: false, block: false, up: false, down: false, ...o });
const ctx = { stunned: false, dodging: false, attacking: false, guardOk: true };
const run = (W, s, k = keys(), dt = 1 / 60) => { for (let t = 0; t < s; t += dt) { W.time += dt; W.S.update(dt, k, ctx); W.S.kitStep(dt); } };

/* RADIANCE: fills in ~6 s lit, drains in ~20 s dark; x0.75 .. x1.15 */
{ const W = world(); W.P.spRad = 0; run(W, 3); ok(near(W.P.spRad, 0.5, 0.02), 'lit: half the bar in 3 s (' + W.P.spRad.toFixed(3) + ')'); run(W, 4); ok(W.P.spRad === 1, 'lit: full by 7 s');
  ok(near(radMultOf(0), 0.75) && near(radMultOf(1), 1.15) && near(radMultOf(0.5), 0.95), 'radMult 0.75 empty, 0.95 half, 1.15 full'); }
{ const W = world({ dark: true }); W.P.spRad = 1; run(W, 10); ok(near(W.P.spRad, 0.5, 0.02), 'dark: half drained in 10 s (' + W.P.spRad.toFixed(3) + ')');
  W.tal.glow = 1; const r0 = W.P.spRad; run(W, 10); ok(near(r0 - W.P.spRad, 0.25, 0.02), 'CARRIED GLOW: the dark drains half as fast'); }
{ const W = world({ dark: true }); W.P.spRad = 0.5; W.tech.add('spnoon'); run(W, 20); ok(near(W.P.spRad, 0.25, 0.01), 'HIGH NOON: the dark drains it to a quarter, no lower'); }

/* THE BEAM: rooted, stops at the first foe (SECOND LIGHT: one more), burns the dead harder, ends at a wall, costs wind */
{ const W = world(); W.P.spRad = 1; const a = foe(200), b = foe(240, { undead: true }); W.enemies.push(a, b);
  for (let i = 0; i < 60; i++) { W.time += 1 / 60; W.S.charge(1 / 60, keys({ atk: true }), true); }
  ok(W.S.beaming(), 'HOLD X: the beam is planted after ' + DP.beam.start + ' s');
  ok(W.hurt.some(h => h.e === a) && !W.hurt.some(h => h.e === b), 'the beam stops at the first foe');
  ok(W.spent >= DP.beam.plant, 'planting costs wind (' + W.spent.toFixed(1) + ')');
  const ln = W.S.beamLine(); ok(ln.x1 <= 30 * TS, 'the beam ends at the wall');
  W.tal.pierce = 1; W.hurt = []; for (let i = 0; i < 30; i++) { W.time += 1 / 60; W.S.charge(1 / 60, keys({ atk: true }), true); }
  const da = W.hurt.filter(h => h.e === a).reduce((s, h) => s + h.d, 0), db = W.hurt.filter(h => h.e === b).reduce((s, h) => s + h.d, 0);
  ok(db > da * 1.8, 'SECOND LIGHT reaches the dead foe behind, and the dead burn harder (' + da + ' vs ' + db + ')');
  W.S.charge(1 / 60, keys(), true); ok(!W.S.beaming(), 'let go of X: the beam is out'); }
{ const W = world(); W.P.st = 5; for (let i = 0; i < 30; i++) { W.time += 1 / 60; W.S.charge(1 / 60, keys({ atk: true }), true); } ok(!W.S.beaming(), 'no wind: no beam'); }

/* THE DISC: tap C on the beat = parry (yellow, front); off the beat nothing; a red blow is not his; a missile met on the beat goes back */
{ const W = world(); const f = foe(120); W.enemies.push(f);
  W.time = 1; W.S.update(1 / 60, keys({ block: true }), ctx); ok(W.S.discTakes(130, 10, false, f, false) === 'blocked' && W.parried === 1, 'the disc on the beat turns a yellow blow (the shared parry)');
  ok(W.S.discTakes(130, 10, true, f, false) === null, 'a red blow is not the disc\'s (TOO STRONG)');
  ok(W.S.discTakes(70, 10, false, f, false) === null, 'from behind: not turned');
  W.time = 2; ok(W.S.discTakes(130, 10, false, f, false) === null, 'off the beat the disc is nothing');
  run(W, 0.5); const s = { x: 110, y: 148, vx: -200, dead: false }; W.seeds.push(s); W.S.update(1 / 60, keys({ block: true }), ctx); ok(s.reflected && W.reflected === 1, 'a missile met on the beat is thrown back'); }

/* THE FLARE: hold C, half the bar; stops a wind-up (a boss's only leaned on); any blow inside the beat is turned, red too; 8 s lock; too little light = nothing */
{ const W = world(); W.P.spRad = 1; const f = foe(130, { winding: true }), bz = foe(80, { winding: true, maxHp: 900 }); W.enemies.push(f, bz);
  W.time = 1; for (let i = 0; i < 20; i++) { W.time += 1 / 60; W.S.update(1 / 60, keys({ block: true }), ctx); }
  ok(near(W.P.spRad, 1 - DP.flare.cost, 0.02), 'the flare costs half the bar'); ok(W.flinched === 1 && W.leaned === 1, 'a wind-up stopped; the boss only leaned on (never cancelled)');
  ok(W.S.flareTakes(140, 30, { unblockable: true, who: f }) === 'blocked', 'inside the beat a RED blow is turned too');
  W.time += 0.3; ok(W.S.flareTakes(140, 30, { who: f }) === null, 'after the beat the flare turns nothing');
  W.S.update(1 / 60, keys(), ctx); f.winding = true; W.P.spFlareRec = 0; for (let i = 0; i < 20; i++) { W.time += 1 / 60; W.S.update(1 / 60, keys({ block: true }), ctx); }
  ok(W.flinched === 1, 'the same foe is not stopped twice inside 8 s');
  W.P.spRad = 0.1; W.S.update(1 / 60, keys(), ctx); W.P.spFlareRec = 0; const f0 = W.P.spFlareAt; for (let i = 0; i < 20; i++) { W.time += 1 / 60; W.S.update(1 / 60, keys({ block: true }), ctx); } ok(W.P.spFlareAt === f0, 'too little light: no flare'); }
ok(REFLECT_ROW.beat === DP.flare.beat && REFLECT_ROW.r === DP.flare.r && REFLECT_ROW.id === 'sunpriest', 'reflect-kit row: the flare\'s beat (0.2 s) and reach (3 tiles) are flareAnswer\'s');

/* CONSECRATE: DOWN+C, a third of the bar; mends him on it; burns the dead on it; SUNFALL: the plunge lands in a patch */
{ const W = world(); W.P.spRad = 0.5; W.P.hp = 50; const d = foe(100, { undead: true }); W.enemies.push(d);
  W.S.update(1 / 60, keys({ block: true, down: true }), ctx); ok(near(W.P.spRad, 0.5 - 1 / 3, 0.01) && W.S.patches().length === 1, 'DOWN+C: a patch for a third of the bar');
  run(W, 2); ok(W.P.hp >= 57, 'standing on it mends ~4/s (' + W.P.hp.toFixed(1) + ')'); ok(d.hp < 100, 'the dead on it burn');
  run(W, 5); ok(W.S.patches().length === 0, 'the patch is gone after 6 s');
  W.P.plunge = true; run(W, 0.05); W.P.plunge = false; run(W, 0.05); ok(W.S.stats.sunfalls === 1 && W.S.patches().length === 1, 'SUNFALL: the plunge leaves a ring and a patch'); }

/* SUNRISE: a full bar; spends it; 6 s; the bar cannot drain; THE FALLING SUN (L50 B) drops a sun when it ends */
{ const W = world({ dark: true }); W.P.spRad = 0.9; ok(!W.S.sunriseReady(), 'SUNRISE wants a full bar'); W.P.spRad = 1; ok(W.S.sunrise() && W.P.spRad === 0 && W.P.spSunrise === DP.sunrise.t, 'SUNRISE: the bar spent, 6 s of light');
  run(W, 3); ok(W.P.spRad > 0.4, 'in SUNRISE the bar fills even in a dark level');
  W.tech.add('spfallsun'); W.P.spRad = 1; W.P.spSunrise = 0; W.S.sunrise(); const e = foe(150); W.enemies.push(e); run(W, 6.2); ok(e.hp < 100 && W.hurt.some(h => h.e === e && h.d >= 13 * 3 - 1), 'THE FALLING SUN: the room takes it when SUNRISE ends'); }

/* THE ACTIVES: each fires and does its thing */
{ const W = world(); const e = foe(160), d = foe(220, { undead: true }); W.enemies.push(e, d);
  W.S.kit.shard(); run(W, 0.5); ok(e.hp < 100, 'SUN SHARD strikes the first foe');
  const x0 = W.P.x; W.S.kit.step(); ok(W.P.x > x0 && W.P.x < 30 * TS, 'HALLOWED STEP: forward, never into the wall');
  W.S.kit.ward(); ok(W.S.wardTakes() === 'blocked' && W.S.wardTakes() === null, 'DAWN WARD turns one blow');
  W.P.hp = 40; W.S.kit.mercy(); run(W, 3.1); ok(W.P.hp >= 40 + 85 * 0.18 - 1, 'MERCY mends a fifth');
  const h0 = d.hp; W.S.kit.eye(); run(W, 2); ok(W.hurt.length > 3, 'THE BURNING EYE burns the nearest');
  W.P.x = 100; const hp1 = e.hp; W.S.kit.pillar(); run(W, 1); ok(e.hp < hp1, 'PILLAR OF NOON falls on the nearest foe ahead'); }

/* THE LADDER (L1-L25): ten actives on the starters' levels, 21 passives, a capstone a branch */
{ const S = PR.skillsFor('sunpriest'), act = S.filter(s => s.active), pas = S.filter(s => !s.active);
  ok(act.length === 10 && pas.length === 21, 'ten actives and 21 passives (' + act.length + '/' + pas.length + ')');
  ok(JSON.stringify(act.map(a => a.level).sort((a, b) => a - b)) === JSON.stringify([1, 3, 4, 5, 7, 9, 12, 14, 17, 20]), 'actives on the Ranger\'s ladder (1,3,4,5,7,9,12,14,17,20)');
  ok(pas.filter(p => p.cap).map(p => p.level).sort().join() === '22,23,24' && [0, 1, 2].every(b => pas.filter(p => p.branch === b).length === 7), 'seven passives a branch, capstones 22/23/24');
  ok(pas.every(p => PASSIVE_GLYPH.sunpriest && PASSIVE_GLYPH.sunpriest[p.id]), 'every passive has a glyph row');
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(act.every(a => main.includes("skillPress('" + a.id + "')")) && act.every(a => new RegExp('\\b' + a.id + ': [0-9.]+').test(main)), 'every active is pressed in priestKit and has a wait in CD_MAX');
  ok(pas.every(p => main.includes("tal('" + p.id + "')")), 'every passive is read (spTal)'); }

/* THE L25-50 PACK: kfork's shape - forks at 30/40/50, roles differ, one trade line, both L50 capstones; eight upgrades of two ranks; master reads the flat A */
{ const lv = [25, 30, 35, 40, 45, 50]; ok(lv.every(l => PRIEST_TECH[l]), 'a technique at each of 25..50');
  for (const l of [30, 40, 50]) { const f = PRIEST_TECH[l].fork; ok(Array.isArray(f) && f.length === 2 && f[0].role !== f[1].role && f[0].trade === f[1].trade && f.every(t => t.id && t.name && t.what && t.teach && t.input), 'L' + l + ': a fork of two, roles differ, one trade'); }
  ok(PRIEST_TECH[50].fork.every(t => t.capstone), 'both L50 options are capstones');
  ok(PRIEST_UPGRADES.length === 8 && PRIEST_UPGRADES.every(u => u.what.length === 2), 'eight upgrades, two ranks each');
  ok(lv.every(l => PRIEST_TECH_FLAT[l].id) && PRIEST_TECH_FLAT[30].id === 'spprism', 'the flat view: each fork\'s A');
  const ids = Object.values(PRIEST_TECH).flatMap(e => e.fork || [e]).map(t => t.id), src = fs.readFileSync(new URL('../src/desert-priest.js', import.meta.url), 'utf8');
  ok(ids.every(id => src.includes("K('" + id + "')")), 'every technique (both sides of each fork) has its rule in the kit');
  ok(PRIEST_UPGRADES.every(u => src.includes("U('" + u.id + "')")), 'every upgrade is read in the kit');
  const p = { card: { sunpriest: { v: 0, e: 0, m: 0, ms: {} } } }; ok(PR.hasKit('sunpriest') && PR.perkOffer(p, 'sunpriest', 25)[0].id === 'spspear', 'the L25 card offers THE SUN SPEAR first');
  ok(PR.HERO_PERKS.sunpriest && PR.HERO_PERKS.sunpriest.length === 2, 'his own two perks'); ok(PR.growthAt('sunpriest', 0).hp === 85, '85 health at level 0'); }

/* THE FLAG, THE ROSTER, THE SAVE */
{ ok(HR.PRIEST_SHIPS === false, 'PRIEST_SHIPS is false (the Sun Temple has not shipped)'); ok(HR.HERO_IDS.includes('sunpriest') && !HR.STARTERS.includes('sunpriest'), 'a roster may hold him; he is no starter');
  ok(/SUN TEMPLE/.test(HR.howTo('sunpriest')), 'his locked card: clear the Sun Temple, then buy');
  ok(PR.HERO_IDS.includes('sunpriest') && !PR.DEFAULT_HEROES.includes('sunpriest'), 'a save may hold him; not a default');
  let threw = false; try { PR.validateProgress({ hero: 'sunpriest', heroes: { sunpriest: true }, card: { sunpriest: { v: 1, e: 0, m: 0, ms: {} } } }); } catch { threw = true; } ok(!threw, 'a save that plays him validates'); }

/* THE HOOKS: each once */
{ const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), lab = fs.readFileSync(new URL('../src/lab.js', import.meta.url), 'utf8');
  const once = (s, t, m) => ok(s.split(t).length - 1 === 1, m + ' (once)');
  once(main, "const SP_OPEN = HR.PRIEST_SHIPS || q.get('priest') === '1'", 'the lab unlock'); once(main, "...(SP_OPEN ? ['sunpriest'] : [])", 'PICK only when open');
  once(main, "HEROES.filter(h => h.id !== 'sunpriest' || SP_OPEN)", 'the store only when open'); once(main, "if (isSp() && SPK) { SPK.charge(", 'HOLD X -> the beam');
  once(main, 'if (isSp() && SPK) SPK.update(', 'his C'); once(main, 'SPK.wardTakes() || SPK.flareTakes(', 'the flare/ward before TOO STRONG'); once(main, 'SPK.discTakes(', 'the disc parry');
  once(main, "isSp() ? !!(SPK && SPK.onBeat())", 'rpAnswerUp'); once(main, "ultRegister('sunpriest'", 'SUNRISE ult'); once(main, 'SPK.thirdFlash()', 'the third blow'); once(main, 'mul *= SPK.blowMul(e)', 'radiance on blows');
  once(main, 'priestKit(dt, canAct, tired);', 'the actives'); once(main, 'SPK.clear()', 'cleared on a level'); once(main, 'SPK.draw(g, cx, cy)', 'drawn'); once(main, "h === 'sunpriest' ? bakePyro(SP_PAL, previewOnly)", 'his set (placeholder rig)');
  once(main, 'spk: () => SPK', 'BK.spk for the bots'); once(lab, "sunpriest: 30 }", 'LAB_REACH'); once(lab, "h === 'sunpriest') { const S = BK.spk", 'ULT_BOT');
  ok(lab.includes("|| h === 'sunpriest';"), 'DEFLECTS: the bot taps the disc on the beat'); }

console.log(bad ? `desert-priest: ${bad} of ${n} FAILED` : `desert-priest: ${n} ok`); process.exit(bad ? 1 : 0);
