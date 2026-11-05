// tools/demon-hunter.mjs - THE DEMON HUNTER (claude/demonhunter), NODE ONLY (no browser, < 1 s). Proves his kit module (src/demon-hunter.js) on a fake world,
// his L1-L25 ladder and L25-50 fork pack (src/progression-catalog.js, src/tech-hunter.js, src/progression.js), the flag (src/hero-roster.js HUNTER_SHIPS), the
// reflect-kit row, and that every main.js / lab.js / satellite hook is present exactly once. The in-page proof (he plays, a bot fights with him) is BROWSER OWED.
import fs from 'fs';
import { makeHunter, DH, REFLECT_ROW, isDemon } from '../src/demon-hunter.js';
import { HUNTER_TECH, HUNTER_TECH_FLAT, HUNTER_UPGRADES } from '../src/tech-hunter.js';
import * as PR from '../src/progression.js';
import * as HR from '../src/hero-roster.js';
import { PASSIVE_GLYPH } from '../src/skill-glyphs.js';
import { COMMIT, ROLL_COST, ROLL_LEN } from '../src/commit.js';
let n = 0, bad = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL ' + m); } };

// ---- a fake world: a 40x12 room, floor at row 10, a wall at column 30 ----
const TS = 16, solid = (x, y) => y >= 10 || x >= 30 || x < 0;
function world() {
  const P = { x: 100, y: 160, w: 10, h: 18, face: 1, hp: 60, maxHp: 95, st: 100, maxSt: 100, ground: true, atk: -1, dead: false, vx: 0, dodge: 0, inv: 0, hurt: 0 };
  const W = { P, enemies: [], seeds: [], time: 0, hurt: [], parried: 0, leaned: 0, reflected: 0, homed: 0, tal: {}, tech: new Set(), upg: {} };
  const api = { get P() { return W.P; }, get enemies() { return W.enemies; }, get seeds() { return W.seeds; }, get time() { return W.time; }, boss: null, TS, SFX: { parry() {} },
    tal: () => W.tal, tech: id => W.tech.has(id), upg: id => W.upg[id] || 0, spend: c => { if (W.P.st < c) return false; W.P.st -= c; return true; }, tired() {},
    isSolid: solid, box: b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - b.h, b: b.y }), knockSkip: () => false, demon: e => isDemon(e),
    hurtAs: (tag, e, d) => { W.hurt.push({ tag, e, d }); e.hp -= d; if (e.hp <= 0) e.alive = false; }, swordDmg: () => 10, amul: () => 1,
    number() {}, sparks() {}, dust() {}, burst() {}, ringAt() {}, streaks() {}, shakeCam() {}, hitstop() {}, zoomKick() {}, kitPose() {}, meterReady() {}, trialEvent() {}, noteVerb() {},
    parried: () => { W.parried++; }, noteParry() {}, tap: () => 0.15, windingUp: e => !!e.winding,
    boltHome: () => { W.homed++; return true; }, reflect: s => { s.reflected = true; s.vx = -s.vx; W.reflected++; }, poiseLean: () => { W.leaned++; } };
  W.D = makeHunter(api); W.D.ensure(); return W;
}
const foe = (x, o = {}) => ({ x, y: 160, w: 12, h: 16, hp: 100, maxHp: undefined, hp0: 100, alive: true, ...o });
const keys = (o = {}) => ({ atk: false, block: false, up: false, down: false, ...o });
const ctx = { stunned: false, dodging: false, attacking: false, guardOk: true };
const step = (W, k = keys(), dt = 1 / 60, c = ctx) => { W.time += dt; W.P.x += (W.P.vx || 0) * dt; if (W.P.dodge > 0) W.P.dodge = Math.max(0, W.P.dodge - dt); W.D.update(dt, k, c); W.D.kitStep(dt); };
const run = (W, s, k, c) => { for (let t = 0; t < s; t += 1 / 60) step(W, k, 1 / 60, c); };

/* THE DASH: through foes, cuts and brands each once, fury from it; a bolt in the first 0.2 s goes home (the reflect-kit POWER), later it does not */
{ const W = world(), a = foe(130), b = foe(160); W.enemies.push(a, b); W.P.dodge = 0.24; W.P.vx = 200;
  run(W, 0.24, keys(), { ...ctx, dodging: true }); run(W, 0.05);
  ok(W.P.x > 165, 'the dash carries him through both (' + W.P.x.toFixed(0) + ')');
  ok(W.hurt.filter(h => h.e === a).length === 1 && W.hurt.filter(h => h.e === b).length === 1, 'each foe passed is cut once');
  ok(W.D.branded(a) && W.D.branded(b), 'both are branded'); ok(W.D.fury() === 2, 'fury +1 a foe passed (' + W.D.fury() + ')');
  ok(W.hurt[0].d === Math.round(10 * DH.dash.k), 'the pass cuts at swordDmg x ' + DH.dash.k); }
{ const W = world(); W.P.dodge = 0.24; W.P.vx = 1; const s = { x: 104, y: 150, vx: -200 }; W.seeds.push(s); step(W, keys(), 1 / 60, { ...ctx, dodging: true }); ok(W.homed === 1, 'a bolt met in the first beat of the dash: the POWER return');
  const W2 = world(); W2.P.dodge = 0.24; W2.P.vx = 0.01; run(W2, 0.22, keys(), { ...ctx, dodging: true }); const s2 = { x: W2.P.x + 2, y: 150, vx: -200 }; W2.seeds.push(s2); step(W2, keys(), 1 / 60, { ...ctx, dodging: true }); ok(W2.homed === 0 && !s2.reflected, 'after the beat the pass only goes through it'); }
ok(REFLECT_ROW.id === 'demonhunter' && REFLECT_ROW.beat === DH.dash.beat, 'reflect-kit row: id demonhunter, the dash beat 0.2 s');

/* FURY: +2 on a branded foe; kept, then it bleeds; a blow on him halves it; ten is full */
{ const W = world(), e = foe(120); W.enemies.push(e); W.D.blowMul(e); ok(W.D.fury() === 1, 'a blade hit: +1'); W.D.brand(e); W.D.blowMul(e); ok(W.D.fury() === 3, 'a hit on a branded foe: +2');
  run(W, DH.fury.keep - 0.1); ok(W.D.fury() === 3, 'kept ' + DH.fury.keep + ' s'); run(W, 0.6); ok(W.D.fury() < 3, 'then it bleeds');
  W.P.dhFury = 8; W.P.hurt = 0.3; step(W); ok(W.D.fury() === 4, 'a blow on him halves it'); W.P.hurt = 0; step(W);
  W.P.dhFury = 9; W.D.blowMul(e); ok(W.D.fury() === 10 && W.D.reckonReady(), 'ten is full: THE RECKONING is ready'); }

/* THE SCISSOR (the third cut) brands; demons take more, branded more still */
{ const W = world(), e = foe(120); W.enemies.push(e); W.D.thirdCut(); W.D.blowMul(e); ok(W.D.branded(e), 'the third cut brands'); ok(W.D.fury() === 2, 'the third cut: +1 more fury');
  const d = foe(120, { t: 'imp' }); ok(isDemon(d) && isDemon({ demon: true }) && isDemon({ dkSkin: 'demon' }) && !isDemon({ t: 'impaler' }) && !isDemon({ t: 'wight' }), 'the demon tag (imp yes, impaler no, wight no)');
  const m0 = W.D.blowMul(d); W.D.brand(d); const m1 = W.D.blowMul(d); ok(Math.abs(m0 - DH.demon.mul) < 1e-9 && Math.abs(m1 - DH.demon.branded) < 1e-9, 'demon x' + DH.demon.mul + ', branded x' + DH.demon.branded);
  ok((d.dhBrandT - W.time) > (e.dhBrandT - W.time), 'a demon\'s brand lasts longer'); }

/* THE BACKSTEP: tap C hops back; on the beat THE SLIP turns a yellow blow from the front (brand + 2 fury); off the beat, red, behind: nothing */
{ const W = world(), f = foe(120); W.enemies.push(f); W.time = 1; step(W, keys({ block: true }));
  ok(W.P.vx < 0, 'tap C: he steps back'); ok(W.D.stepTakes(130, 10, false, f, false) === 'blocked' && W.parried === 1 && W.D.branded(f) && W.D.fury() === 2, 'THE SLIP on the beat: parried, branded, two fury');
  ok(W.D.stepTakes(130, 10, true, f, false) === null, 'a red blow is not his (TOO STRONG)'); ok(W.D.stepTakes(70, 10, false, f, false) === null, 'from behind: not slipped');
  W.time += 0.5; ok(W.D.stepTakes(130, 10, false, f, false) === null, 'off the beat the backstep is only spacing'); }

/* BANISH: DOWN+C, half the fury, the nearest branded foe; a small demon half dead is gone; a boss only struck; no brand / no fury: nothing */
{ const W = world(), d = foe(130, { t: 'imp', hp: 30 }); W.enemies.push(d); W.P.dhFury = 6; W.P.dhKeep = 99; step(W, keys({ block: true, down: true })); ok(W.P.dhFury === 6, 'no brand near: nothing spent');
  step(W); W.D.brand(d); step(W, keys({ block: true, down: true })); ok(!d.alive && W.P.dhFury === 1 && W.D.stats.banished === 1, 'a branded small demon under 40%: BANISHED, five fury');
  const W2 = world(), bz = foe(130, { t: 'demonlord', hp: 2000, maxHp: 2000 }); W2.enemies.push(bz); W2.D.brand(bz); W2.P.dhFury = 5; W2.P.dhKeep = 99; step(W2, keys({ block: true, down: true }));
  ok(bz.alive && W2.hurt[0].d === Math.round(10 * DH.banish.k * DH.banish.demonK), 'a boss is only struck (k ' + DH.banish.k + ', demon x' + DH.banish.demonK + ')');
  W2.tech.add('dhchain'); W2.P.dhFury = 5; W2.P.dhKeep = 99; W2.D.brand(bz); step(W2); step(W2, keys({ block: true, down: true })); ok(bz.dhBoundT > W2.time && W2.leaned === 1, 'SILVER CHAINS (L30 B): a big foe bound, poise leaned on'); }

/* THE RECKONING: full fury; blinks to each branded foe, a cut each; a boss harder; no brands: the nearest; THE CULLING twice; THE SILVER STORM knives all */
{ const W = world(), a = foe(140), b = foe(200), c = foe(260); W.enemies.push(a, b, c); W.D.brand(a); W.D.brand(c); W.P.dhFury = 10;
  ok(W.D.reckoning() && W.P.dhFury === 0, 'THE RECKONING spends the bar'); run(W, 1);
  ok(W.hurt.filter(h => h.e === a).length === 1 && W.hurt.filter(h => h.e === c).length === 1 && !W.hurt.some(h => h.e === b), 'a cut on each branded foe, none on the unbranded');
  ok(!W.D.branded(a) && !W.D.branded(c), 'brands spent'); ok(W.hurt[0].d === Math.round(10 * DH.reck.k), 'k ' + DH.reck.k);
  const W2 = world(), e = foe(150); W2.enemies.push(e); W2.P.dhFury = 10; W2.D.reckoning(); run(W2, 0.5); ok(W2.hurt.length === 1, 'no brands: one cut on the nearest');
  const W3 = world(), f = foe(150); W3.enemies.push(f); W3.D.brand(f); W3.tech.add('dhcull'); W3.P.dhFury = 10; W3.D.reckoning(); run(W3, 0.6); ok(W3.hurt.length === 2, 'THE CULLING: every brand twice');
  const W4 = world(), g1 = foe(150), g2 = foe(250); W4.enemies.push(g1, g2); W4.tech.add('dhvolley'); W4.P.dhFury = 10; W4.D.reckoning(); ok(W4.hurt.length === 2 && W4.D.branded(g1) && W4.D.branded(g2) && W4.P.dhFury === DH.tech.volley.left, 'THE SILVER STORM: a knife into each, branded, half the fury kept'); }

/* THE ACTIVES: each fires and does its thing */
{ const W = world(), e = foe(150), d = foe(130, { demon: true }); W.enemies.push(d, e);
  W.D.kit.knives(); run(W, 0.4); ok(W.D.branded(d), 'SILVER KNIVES strike and brand');
  W.D.kit.call(); ok(W.D.branded(e), "HUNTER'S CALL brands all near");
  const W2 = world(), s = foe(170); W2.enemies.push(s); W2.D.kit.hook(); ok(s.x < 170 && W2.D.branded(s), 'CHAIN HOOK drags a small foe in, branded');
  const W3 = world(), r = foe(150); W3.enemies.push(r); W3.D.kit.rain(); run(W3, 0.5); ok(r.hp < 100 && W3.D.branded(r), 'SILVER RAIN falls and brands');
  const W4 = world(), o = foe(110); W4.enemies.push(o); W4.D.kit.storm(); run(W4, 0.85); ok(W4.hurt.length >= 4, 'BLADE STORM cuts again and again (' + W4.hurt.length + ')');
  const W5 = world(), v = foe(120); W5.enemies.push(v); W5.D.kit.vault(); ok(W5.P.x > 120 && W5.P.face === -1 && W5.D.branded(v), 'OVER THE HORNS: over, turned, branded');
  const W6 = world(); W6.D.kit.chase(); let passes = 0, was = false; for (let i = 0; i < 90; i++) { step(W6, keys(), 1 / 60, { ...ctx, dodging: W6.P.dodge > 0 }); if (W6.P.dodge > 0 && !was) passes++; was = W6.P.dodge > 0; } ok(W6.D.stats.passes === 3, 'THE CHASE: three dashes (' + W6.D.stats.passes + ')');
  const W7 = world(), x = foe(120, { hp: 20 }); W7.enemies.push(x); W7.D.brand(x); W7.D.kit.sentence(); ok(W7.D.blowMul(x) >= 50, 'THE SENTENCE ends a branded foe under a third');
  const W8 = world(), q = foe(100); W8.enemies.push(q); W8.D.kit.sigil(); run(W8, 0.1); ok(W8.D.branded(q), 'WARDING SIGIL brands what stands on it');
  const W9 = world(), z = foe(120, { demon: true }); W9.enemies.push(z); W9.D.kit.oil(); const m = W9.D.blowMul(z); ok(W9.D.branded(z) && m > DH.demon.mul * 1.2, 'HOLY OIL: every cut brands, a demon x1.25'); }

/* THE LADDER (L1-L25): ten actives on the starters' levels, 21 passives, a capstone a branch */
{ const S = PR.skillsFor('demonhunter'), act = S.filter(s => s.active), pas = S.filter(s => !s.active);
  ok(act.length === 10 && pas.length === 21, 'ten actives and 21 passives (' + act.length + '/' + pas.length + ')');
  ok(JSON.stringify(act.map(a => a.level).sort((a, b) => a - b)) === JSON.stringify([1, 3, 4, 5, 7, 9, 12, 14, 17, 20]), "actives on the Ranger's ladder (1,3,4,5,7,9,12,14,17,20)");
  ok(pas.filter(p => p.cap).map(p => p.level).sort().join() === '22,23,24' && [0, 1, 2].every(b => pas.filter(p => p.branch === b).length === 7), 'seven passives a branch, capstones 22/23/24');
  ok(pas.every(p => PASSIVE_GLYPH.demonhunter && PASSIVE_GLYPH.demonhunter[p.id]), 'every passive has a glyph row');
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(act.every(a => main.includes("skillPress('" + a.id + "')")) && act.every(a => new RegExp('\\b' + a.id + ': [0-9.]+').test(main)), 'every active is pressed in hunterKit and has a wait in CD_MAX');
  ok(pas.every(p => main.includes("tal('" + p.id + "')")), 'every passive is read (dhTal)');
  const src = fs.readFileSync(new URL('../src/demon-hunter.js', import.meta.url), 'utf8'), m = main.match(/const dhTal = \(\) => \(\{([^]*?)\}\);/);
  const keysT = m ? [...m[1].matchAll(/(\w+): tal\(/g)].map(x => x[1]) : []; ok(keysT.length === 21 && keysT.every(k => src.includes('T().' + k)), 'every passive has its rule in the kit (T().<key>)'); }

/* THE L25-50 PACK: kfork's shape - forks at 30/40/50, roles differ, one trade line, both L50 capstones; eight upgrades of two ranks; master reads the flat A */
{ const lv = [25, 30, 35, 40, 45, 50]; ok(lv.every(l => HUNTER_TECH[l]), 'a technique at each of 25..50');
  for (const l of [30, 40, 50]) { const f = HUNTER_TECH[l].fork; ok(Array.isArray(f) && f.length === 2 && f[0].role !== f[1].role && f[0].trade === f[1].trade && f.every(t => t.id && t.name && t.what && t.teach && t.input), 'L' + l + ': a fork of two, roles differ, one trade'); }
  ok(HUNTER_TECH[50].fork.every(t => t.capstone), 'both L50 options are capstones');
  ok(HUNTER_UPGRADES.length === 8 && HUNTER_UPGRADES.every(u => u.what.length === 2), 'eight upgrades, two ranks each');
  ok(lv.every(l => HUNTER_TECH_FLAT[l].id) && HUNTER_TECH_FLAT[30].id === 'dhrend' && HUNTER_TECH_FLAT[40].id === 'dhblink' && HUNTER_TECH_FLAT[50].id === 'dhcull', "the flat view: each fork's A");
  const ids = Object.values(HUNTER_TECH).flatMap(e => e.fork || [e]).map(t => t.id), src = fs.readFileSync(new URL('../src/demon-hunter.js', import.meta.url), 'utf8');
  ok(ids.every(id => src.includes("K('" + id + "')")), 'every technique (both sides of each fork) has its rule in the kit');
  ok(HUNTER_UPGRADES.every(u => src.includes("U('" + u.id + "')")), 'every upgrade is read in the kit');
  const p = { card: { demonhunter: { v: 0, e: 0, m: 0, ms: {} } } }; ok(PR.hasKit('demonhunter') && PR.perkOffer(p, 'demonhunter', 25)[0].id === 'dhwake', 'the L25 card offers SILVER WAKE first');
  ok(PR.HERO_PERKS.demonhunter && PR.HERO_PERKS.demonhunter.length === 2, 'his own two perks'); ok(PR.growthAt('demonhunter', 0).hp === 95, '95 health at level 0'); }
{ const W = world(), e = foe(115); W.tech.add('dhwake'); W.P.dodge = 0.24; W.P.vx = 1; run(W, 0.24, keys(), { ...ctx, dodging: true }); W.P.vx = 0; run(W, 0.05); const h0 = W.hurt.length; W.enemies.push(e); run(W, 0.3); ok(W.hurt.length > h0, 'SILVER WAKE (L25): the dash\'s wake cuts what walks into it');
  const W2 = world(); W2.tech.add('dhblink'); W2.P.dodge = 0.05; W2.P.vx = 300; run(W2, 0.06, keys(), { ...ctx, dodging: true }); step(W2); step(W2, keys({ block: true })); ok(W2.P.dodge > 0 && W2.P.vx < 0, 'BLINK BACK (L40 A): tap C after a dash, a pass back');
  const W3 = world(), f = foe(120); W3.enemies.push(f); W3.tech.add('dhward'); W3.time = 1; step(W3, keys({ block: true })); W3.D.stepTakes(130, 10, false, f, false); ok(W3.D.wardTakes() === 'half' && W3.D.wardTakes() === null, 'SILVER WARD (L40 B): the next blow at half, once');
  const W4 = world(), r = foe(120); W4.enemies.push(r); W4.tech.add('dhrend'); W4.D.brand(r); W4.D.thirdCut(); W4.D.blowMul(r); ok(!W4.D.branded(r) && W4.hurt.length === 1 && W4.D.fury() === 5, 'REND THE BRAND (L30 A): torn out, a burst, +2 fury'); }

/* THE FLAG, THE ROSTER, THE SAVE, THE SATELLITES */
{ ok(HR.HUNTER_SHIPS === false, 'HUNTER_SHIPS is false (the temple has not shipped)'); ok(HR.HERO_IDS.includes('demonhunter') && !HR.STARTERS.includes('demonhunter'), 'a roster may hold him; he is no starter');
  ok(/HIDDEN TEMPLE/.test(HR.howTo('demonhunter')), 'his locked card: beat him in the hidden temple, then buy');
  ok(PR.HERO_IDS.includes('demonhunter') && !PR.DEFAULT_HEROES.includes('demonhunter'), 'a save may hold him; not a default');
  let threw = false; try { PR.validateProgress({ hero: 'demonhunter', heroes: { demonhunter: true }, card: { demonhunter: { v: 1, e: 0, m: 0, ms: {} } } }); } catch { threw = true; } ok(!threw, 'a save that plays him validates');
  ok(COMMIT.demonhunter && COMMIT.demonhunter.light < COMMIT.knight.light && ROLL_COST.demonhunter && ROLL_LEN.demonhunter < ROLL_LEN.knight, 'commit: the quickest light cut; a short dash'); }

/* THE HOOKS: each once */
{ const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), lab = fs.readFileSync(new URL('../src/lab.js', import.meta.url), 'utf8');
  const once = (s, t, m) => ok(s.split(t).length - 1 === 1, m + ' (once)');
  once(main, "const DH_OPEN = HR.HUNTER_SHIPS || q.get('hunter') === '1'", 'the lab unlock'); once(main, "...(DH_OPEN ? ['demonhunter'] : [])", 'PICK only when open');
  once(main, "HEROES.filter(h => h.id !== 'demonhunter' || DH_OPEN)", 'the store only when open'); once(main, "feat: 'boss:huntertemple'", 'beat him, then buy');
  once(main, 'if (isDh() && DHK) DHK.update(', 'his C and dash'); once(main, 'DHK.stepTakes(', 'the slip parry'); once(main, 'DHK.wardTakes()', 'silver ward');
  once(main, 'isDh() ? !!(DHK && DHK.onBeat())', 'rpAnswerUp'); once(main, "ultRegister('demonhunter'", 'THE RECKONING ult'); once(main, 'DHK.thirdCut()', 'the third cut'); once(main, 'mul *= DHK.blowMul(e)', 'fury/brands on blows');
  once(main, 'hunterKit(dt, canAct, tired);', 'the actives'); once(main, 'DHK.clear()', 'cleared on a level'); once(main, 'DHK.draw(g, cx, cy)', 'drawn'); once(main, "h === 'demonhunter' ? bakeBerserkerHero(DH_PAL, previewOnly)", 'his set (placeholder rig)');
  once(main, 'dhk: () => DHK', 'BK.dhk for the bots'); once(main, '  demonhunter: { win: 0.5,', 'DASH_STRIKE'); once(lab, 'demonhunter: 22 }', 'LAB_REACH'); once(lab, "h === 'demonhunter') { const D = BK.dhk", 'ULT_BOT');
  ok(lab.includes("|| h === 'demonhunter';"), 'DEFLECTS: the bot taps the backstep on the beat');
  for (const [f, t] of [['finishers', "demonhunter: { name: 'HUNTED'"], ['riposte', "demonhunter: { look: 'THE SLIP'"], ['controls', "demonhunter: ['backstep / banish'"], ['hero-move', 'demonhunter: { ground:'], ['audio', "h === 'demonhunter' ? 'pirate'"]])
    ok(fs.readFileSync(new URL('../src/' + f + '.js', import.meta.url), 'utf8').includes(t), 'satellite ' + f); }

console.log(bad ? `demon-hunter: ${bad} of ${n} FAILED` : `demon-hunter: ${n} ok`); process.exit(bad ? 1 : 0);
