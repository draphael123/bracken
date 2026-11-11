// tools/warden-forks.mjs - NODE-ONLY checks for the Warden's fork road (claude/wardenfork). No browser, no cdp, no puppeteer. Run: node tools/warden-forks.mjs
// 1. data: 11 rungs on the ladder, 10 trait pairs for her 10 traits, ids unique (and apart from the Knight's and the Geomancer's), text limits, sides differ, the kit rule (reach, no beam / hammer / shield / stone)
// 2. wiring: every side id is read by src/main.js (wb('id')) and nowhere outside wb; the effect sites exist; the numbers on the cards are the numbers in src/warden-forks.js
// 3. flag off = the base: legacyTech null, no p.fork read; flag on: reads respect pick + level + slot (skill) / worn (trait); PvP EVEN L1 turns every side off
// 4. the FOLD rule: with forks on the four folded passives retire as slottable traits (kindOf 'retired', never on), with forks off they stay slottable exactly as today
// 5. balance hand math: Spear Dance A/B within 10% of the base dance, the two capstones within 10% on one boss, the rank scale on every trait side
// 6. boss law: no pin / freeze / invulnerability / resist word in the new bodies, a drive or a pin only behind !lcBig
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as F from '../src/forks.js';
import * as PR from '../src/progression.js';
import * as T from '../src/traits.js';
import { KNIGHT_FORKS } from '../src/forks-knight.js';
import { WARDEN_FORKS, WARDEN_RUNG_FORKS, WARDEN_TRAIT_FORKS } from '../src/forks-warden.js';
import { WFK, WTF, setBackStops, highVy, ultBudget, danceTotal } from '../src/warden-forks.js';
import { WID, tipStart } from '../src/warden-id.js';
const bad = []; const check = (n, fn) => { try { fn(); } catch (e) { bad.push(n + ': ' + String(e.message).split('\n')[0]); } };
const rd = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const main = rd('src/main.js'), trSrc = rd('src/traits.js');
const withFlag = (v, fn) => { const was = F.forksShip(); F.setForksShip(v); try { return fn(); } finally { F.setForksShip(was); } };
const sides = (data = WARDEN_FORKS) => Object.entries(data).flatMap(([k, e]) => ['A', 'B'].map(s => ({ k, e, s, x: e[s] })));
const bodyStart = main.indexOf("/* ==== (claude/wardenfork) THE WARDEN'S FORK BODIES"), bodyEnd = main.indexOf('function springLand()');
const bodies = main.slice(bodyStart, bodyEnd > bodyStart ? bodyEnd : bodyStart + 6000);

check('11 rungs: every ladder slot holds one fork, ability forks sit on their rung level', () => {
  const ability = F.forkList('warden', false); assert.equal(ability.length, 11); assert.deepEqual(ability.map(r => r.level), [21, 22, 24, 27, 29, 32, 36, 38, 43, 48, 50]);
  assert.deepEqual(ability.map(r => r.e.slot), F.FORK_LADDER.map(r => r.slot));
  assert.deepEqual(ability.map(r => r.key), ['dash', 'skill:harrier', 'chain', 'block', 'skill:setSpears', 'heavy', 'spender', 'skill:wheel', 'sig', 'skill:spearDance', 'ult']);
  assert.equal(Object.keys(WARDEN_RUNG_FORKS).length, 11); for (const r of ability) if (r.key.startsWith('skill:')) assert.equal(r.e.ability, r.key, 'a skill fork is keyed by its skill id'); assert(ability[10].e.capstone === true); });
check('10 trait forks: one pair per Warden trait, keyed trait:<id>, open at L20 while worn', () => {
  const traits = F.forkList('warden', true), want = ['vaulter', 'throughAndThrough', 'giveGround', 'exact', 'widerRow', 'everReady', 'pinTwist', 'freeHand', 'skirmisher', 'spitted'];
  assert.equal(traits.length, 10); assert.equal(Object.keys(WARDEN_TRAIT_FORKS).length, 10); assert.deepEqual(traits.map(r => r.e.trait).sort(), want.slice().sort());
  withFlag(true, () => { const split = T.traitIds('warden'); assert.equal(split.length, 10, 'her ten traits: the four folded ids are retired while the forks are on'); for (const id of want) assert(split.includes(id), id + ' is one of her traits'); });
  for (const r of traits) { assert.equal(r.key, 'trait:' + r.e.trait); assert.equal(r.level, 20); } });
check('ids unique across the whole road and apart from the Knight (and by prefix the Geomancer); names <= 14; what <= 96; teach <= 175; sides differ', () => {
  const ids = new Set(), other = new Set(sides(KNIGHT_FORKS).map(o => o.x.id));   /* the Geomancer's ids are all g-prefixed (claude/geofork), the Knight's k-prefixed, hers w-prefixed: no collision whatever merges */
  for (const { k, s, x } of sides()) { assert(x.id && x.name && x.what && x.teach && x.input, k + s); assert(x.name.length <= F.NAME_MAX, k + s + ' name ' + x.name); assert(x.what.length <= 96, k + s + ' what ' + x.what.length); assert(x.teach.length <= 175, k + s + ' teach ' + x.teach.length);
    assert(!ids.has(x.id), 'dup ' + x.id); ids.add(x.id); assert(!other.has(x.id), 'another hero id ' + x.id); assert(/^w[a-z]+$/.test(x.id), 'w-prefixed ' + x.id); assert(x.input.length <= 28, 'input ' + x.input); }
  for (const [k, e] of Object.entries(WARDEN_FORKS)) { assert(e.trade && e.trade.length <= 28, k + ' trade'); assert(e.name.length <= F.NAME_MAX, k + ' title ' + e.name); assert.notEqual(e.A.what, e.B.what); assert.notEqual(e.A.name, e.B.name); }
  assert.equal(ids.size, 42); });
check('kit rule: reach is the verb - no beam, ray, hammer, shield advance, riposte, stone or light wording', () => {
  for (const { x } of sides()) assert(!/BEAM|\bRAY\b|FLYING SLASH|WAVE OF LIGHT|LIGHT RING|HOLY|SUNFALL|SHIELD|HAMMER|RIPOSTE|BOULDER|STONE/i.test(x.what + ' ' + x.teach), 'her kit is the spear: ' + x.id); });
check('every side id is read by main.js through wb(), and nowhere else', () => {
  for (const { k, x } of sides()) { assert(main.includes("wb('" + x.id + "')"), k + ': ' + x.id + ' is never read');
    const re = new RegExp("(?<!wb\\()'" + x.id + "'", 'g'); assert.equal((main.match(re) || []).length, 0, x.id + ' used outside wb'); } });
check('no ad-block-looking filename', () => { for (const f of ['forks-warden.js', 'warden-forks.js', 'warden-forks.mjs']) assert(!/(^|[-_.])(ad|ads|admiral|banner|track|tracker|sponsor|promo)([-_.]|$)/i.test(f), f); });
check('flag off = the base: no side reads, no p.fork needed', () => withFlag(false, () => {
  const p = { fork: { warden: { dash: 'A', v: 1 } } }; assert.equal(F.forkOn(p, 'warden', 'whop', 50), false); assert.equal(F.legacyTech(p, 'warden', 50, 'whop'), null); assert.deepEqual(F.forksOwed(p, 'warden', 50), []); assert.equal(PR.hasKit('warden'), false, 'she never had technique cards');
  assert.equal(T.traitIds('warden').length, 14, 'flag off: the four folded ids are still slottable traits (10 + 4)'); for (const id of ['openPoint', 'counterpoise', 'spearhead', 'holdTheLine']) { assert.equal(T.kindOf('warden', id), 'folded'); assert(T.slottable('warden').includes(id)); } }));
check('flag on: every side reads from the pick, the level and the slot / the wear', () => withFlag(true, () => {
  const p = { fork: { warden: { dash: 'B', 'skill:wheel': 'B', chain: 'A', 'trait:exact': 'B', v: 1 } } }, slotted = { slotted: id => id === 'wheel' };
  assert.equal(F.legacyTech(p, 'warden', 21, 'wsetback'), true); assert.equal(F.legacyTech(p, 'warden', 21, 'whop'), false); assert.equal(F.legacyTech(p, 'warden', 37, 'whalf', slotted), false, 'level 38 not reached');
  assert.equal(F.legacyTech(p, 'warden', 38, 'whalf', slotted), true); assert.equal(F.legacyTech(p, 'warden', 38, 'whalf', { slotted: () => false }), false, 'the skill must be slotted'); assert.equal(F.legacyTech(p, 'warden', 24, 'wpointed'), true);
  assert.equal(F.legacyTech(p, 'warden', 19, 'wtfillband', { worn: () => true }), false); assert.equal(F.legacyTech(p, 'warden', 20, 'wtfillband', { worn: id => id === 'exact' }), true); assert.equal(F.legacyTech(p, 'warden', 20, 'wtfillband', { worn: () => false }), false);
  assert.equal(F.legacyTech(p, 'geomancer', 50, 'wsetback'), false, 'another hero never reads her sides'); assert.equal(F.legacyTech(p, 'knight', 50, 'wsetback'), false); }));
check('owed queue, free swap with the level lock, strip and board shape', () => withFlag(true, () => {
  const p = {}; assert.equal(F.forksOwed(p, 'warden', 21).length, 1); assert.equal(F.forksOwed(p, 'warden', 50).length, 11); assert.equal(F.setFork(p, 'warden', 'dash', 'A', 21), null); assert.equal(F.setFork(p, 'warden', 'dash', 'B', 21), null); assert.equal(p.fork.warden.dash, 'B');
  assert(/Locked until level 22/.test(F.setFork(p, 'warden', 'skill:harrier', 'A', 21))); assert.equal(F.roadStrip(p, 'warden', 30).length, 11); assert.equal(F.boardRows(p, 'warden', 30, 'ABILITIES').length, 11); assert.equal(F.boardRows(p, 'warden', 30, 'TRAITS').length, 10);
  const c = F.forkCard('warden', 'ult'); assert.equal(c.capstone, true); assert.equal(c.opts.length, 2); assert.deepEqual(F.botForks('warden', 'A'), Object.assign({ v: 1 }, Object.fromEntries(Object.keys(WARDEN_FORKS).map(k => [k, 'A'])))); }));
check('PvP EVEN L1: every fork reads off (YOUR LEVEL: on)', () => withFlag(true, () => {
  const p = { fork: { warden: { chain: 'B', v: 1 } } }; assert.equal(F.legacyTech(p, 'warden', 30, 'wrunthru'), true); F.setPvpEvenForks(true); try { assert.equal(F.legacyTech(p, 'warden', 30, 'wrunthru'), false); assert.equal(F.forkSide(p, 'warden', 'chain'), null); } finally { F.setPvpEvenForks(false); } }));
check('THE FOLD: with forks on the four folded passives retire (never slot, never on); with them off nothing moves', () => {
  const folded = ['openPoint', 'counterpoise', 'spearhead', 'holdTheLine'], was = T.traitsShip();
  try { T.setTraitsShip(true);
    withFlag(true, () => { for (const id of folded) { assert.equal(T.kindOf('warden', id), 'retired', id); assert(!T.slottable('warden').includes(id), id + ' slots'); assert.equal(T.traitGate({ traits: { warden: [id] } }, 'warden', id, 30), false, id + ' on'); } assert(T.slottable('warden').includes('vaulter')); assert.equal(T.traitScale({}, 'warden', 'openPoint', 30), 1); });
    withFlag(false, () => { for (const id of folded) { assert.equal(T.kindOf('warden', id), 'folded', id); assert(T.slottable('warden').includes(id), id + ' no longer slots flag off'); assert.equal(T.traitGate({ traits: { warden: [id] } }, 'warden', id, 30), true, id + ' off'); } }); }
  finally { T.setTraitsShip(was); }
  assert(/foldRetire: true/.test(trSrc), 'the warden split carries foldRetire'); for (const id of folded) { assert(main.includes("wb('") && true); } });
check('every fork side that carries a folded passive reads it as tal(old) || wb(side)', () => {
  for (const frag of ["tal('openPoint') || wb('wpointed')", "tal('counterpoise') || wb('whaftcatch')", "tal('spearhead') || wb('wrunthru')", "const wall = tal('holdTheLine') || wb('whedge')"]) assert(main.includes(frag), 'main.js lacks ' + frag); });
check('the effect sites exist (source scan)', () => {
  for (const frag of ['function wardenSetBack(', 'function wardenVaultLand(', 'function wardenKeepOff(', 'function wardenSkewer(', 'function wardenDanceStep(', 'function wardenExact(', 'function wardenWideHurl(', 'const vaultWind =', 'const reachMul =', 'const wb = id =>',
    "wb('whop') && !back", "wb('wsetback') && wardenSetBack()", "wb('wspring') && P.cds", 'highVy(300)', "wb('wround') ? [P.face, -P.face]", "wb('whedge') ? WFK.hedge.reach", "wb('wtwin')) wthSpears.push", "wb('wfar') && j.dist >= WFK.far.from", "!wb('wsteady')", "wb('whungry') ? WFK.band.hungryFill",
    "wb('wwide') ? WFK.wheel.wide.t", "wb('whalf') ? WFK.wheel.half.wind", 'wardenSkewer(e)', "wb('wplanted') ? WFK.plunge.planted.perch", "wb('wdanceb') ? WFK.dance.b.n", "wb('wlongline') ? WFK.ult.long.finalLen", "wb('wgreatjav') ? WFK.ult.great.t", "wb('wgreatjav') ? WFK.ult.great.final", 'wardenWideHurl(e, best)']) assert(main.includes(frag), 'main.js lacks ' + frag);
  assert(main.includes("import { WFK, WTF, setBackStops, highVy } from './warden-forks.js'")); });
check('rank scale: every trait side delta scales with the trait rank (trk / trm), a discrete side does not', () => {
  for (const frag of ["Math.round(13 - (wb('wtlight') ? WTF.vaulterLight : 7) * trk('vaulter'))", "(80 + (wb('wtlongv') ? WTF.vaulterLong : 0)) * trk('longVault')", "(wb('wtdeepline') ? WTF.throughDeep : 16) * trk('throughAndThrough')", "(160 + (wb('wthard') ? WTF.throughHard : 0)) * trk('driveHome')",
    "WTF.giveLong : 0.6) * trk('giveGround')", "WTF.giveShove * trk('giveGround')", "WTF.exactOpen * trk('exact')", "WTF.exactFill * trk('exact')", "(wb('wtcloserow') ? WTF.rowClose : 5) * trk('widerRow')", "(wb('wtdeeprow') ? 90 + WTF.rowDeep : 90) * trk('widerRow')",
    "WTF.readyRefund * trk('everReady')", "WTF.readySecond * trk('everReady')", "(wb('wtdeeptwist') ? WTF.twistBleed : 3) * trk('pinTwist')", "trm(wb('wtholddown') ? WTF.twistHold : 1.5, 'pinTwist')", "(wb('wtfullpurse') ? WTF.handPurse : 20) * trk('freeHand')",
    "(wb('wtheavyhurl') ? WTF.hurlKnock : 340) * trk('skirmisher')", "WTF.hurlHit * trk('skirmisher')", "trm(wb('wtlongbreak') && !lcBig(e) ? WTF.spitLong : 1.5, 'spitted')", "WTF.spitHit * trk('spitted')"]) assert(main.includes(frag), 'rank scaling lacks ' + frag);
  assert.equal(T.traitScale({}, 'warden', 'vaulter', 5), 1, 'flag off every scale is exactly 1'); });
check('the numbers on the cards are the numbers in warden-forks.js', () => {
  const t = id => sides().find(o => o.x.id === id).x.teach + ' ' + sides().find(o => o.x.id === id).x.what, has = (id, re) => assert(re.test(t(id)), id + ' text vs number');
  has('whop', /FOUR MORE WIND/); assert.equal(WFK.hop.wind, 4); has('wspring', /HALF THE TIME/); assert.equal(WFK.spring.cdMul, 0.5); has('wspring', /THREE MORE/); assert.equal(WFK.spring.extra, 3); has('whigh', /TWICE AS HIGH/); assert(Math.abs(highVy(300) / 300) ** 2 > 1.99 && (highVy(300) / 300) ** 2 < 2.01);
  has('whigh', /A FIFTH HARDER/); assert.equal(WFK.high.land, 1.2); has('wkeepoff', /BACK OUT TO THE POINT/); has('whaftcatch', /0\.6 S/); assert.equal(WFK.haft.stagger, 0.6); has('whaftcatch', /0\.25 S/); assert.equal(WFK.haft.bossOpen, 0.25);
  has('whedge', /TWO THIRDS/); assert(Math.abs(WFK.hedge.reach / 300 - 2 / 3) < 0.01); has('whedge', /TWICE AND A HALF/); assert.equal(WFK.hedge.life, 2.6); has('wtwin', /0\.18 S/); assert.equal(WFK.twin.delay, 0.18); has('wfar', /20% FURTHER/); assert.equal(WFK.far.range, 1.2); has('wfar', /70 PX/); assert.equal(WFK.far.from, 70); has('wfar', /30%/); assert.equal(WFK.far.mul, 1.3);
  has('whungry', /40% MORE/); assert.equal(WFK.band.hungryFill, 1.4); has('whungry', /TWICE AS FAST/); assert.equal(WFK.band.hungryHaft, 2); has('whungry', /6 A SECOND/); assert.equal(WFK.band.idle, 6);
  has('wwide', /HALF A SECOND/); assert.equal(WFK.wheel.wide.t, 0.5); has('wwide', /60 PX/); assert.equal(WFK.wheel.wide.reach, 60); has('wwide', /QUARTER HARDER/); assert.equal(WFK.wheel.wide.k, 1.25); has('whalf', /0\.18 S/); assert.equal(WFK.wheel.half.t, 0.18); has('whalf', /12 WIND/); assert.equal(WFK.wheel.half.wind, 12);
  has('wplanted', /HALF AGAIN AS LONG/); assert.equal(WFK.plunge.planted.pin, 1.5); has('wplanted', /TWICE AS LONG/); assert.equal(WFK.plunge.planted.perch, 2.2); has('wskewer', /0\.7/); assert.equal(WFK.plunge.skewer.k, 0.7);
  has('wdancea', /BLOW AND A HALF/); assert.equal(WFK.dance.a.last, 1.6); has('wdanceb', /FOUR THRUSTS/); assert.equal(WFK.dance.b.n, 4); has('wdanceb', /HALF AGAIN HEAVIER/); assert.equal(WFK.dance.b.k, 1.5);
  has('wlongline', /THREE TIMES/); assert.equal(WFK.ult.long.mul, 3); has('wlongline', /340 PX/); assert.equal(WFK.ult.long.finalLen, 340); has('wgreatjav', /FOUR AND A HALF/); assert.equal(WFK.ult.great.t, 4.5); has('wgreatjav', /TWICE AS HARD/); assert.equal(WFK.ult.great.final, 2); has('wgreatjav', /A QUARTER MORE/); assert.equal(WFK.ult.great.throw, 1.25);
  has('wtlight', /THREE WIND/); assert.equal(Math.round(13 - WTF.vaulterLight * 1), 3); has('wtlongv', /80 MORE PX/); assert.equal(WTF.vaulterLong, 80); has('wtdeepline', /32 PX/); assert.equal(WTF.throughDeep, 32); has('wthard', /160 HARDER/); assert.equal(WTF.throughHard, 160);
  has('wtlongstag', /1\.0 S/); assert.equal(WTF.giveLong, 1.0); has('wtkeepopen', /0\.5 S/); assert.equal(WTF.exactOpen, 0.5); has('wtfillband', /15/); assert.equal(WTF.exactFill, 15); has('wtdeeprow', /180 PX/); assert.equal(WTF.rowDeep, 180); has('wtcloserow', /10 PX/); assert.equal(WTF.rowClose, 10);
  has('wtrefund', /SIX WIND/); assert.equal(WTF.readyRefund, 6); has('wtsecond', /0\.3 S/); assert.equal(WTF.readySecond, 0.3); has('wtdeeptwist', /SIX SECONDS/); assert.equal(WTF.twistBleed, 6); has('wtholddown', /TWICE AS LONG/); assert.equal(WTF.twistHold, 2.0);
  has('wtfullpurse', /36 WIND/); assert.equal(WTF.handPurse, 36); has('wtbackinhand', /20 WIND/); assert.equal(WTF.handStep, 20); has('wtheavyhurl', /520/); assert.equal(WTF.hurlKnock, 520); has('wtheavyhurl', /1\.2 S/); assert.equal(WTF.hurlStag, 1.2); has('wtheavyhurl', /QUARTER BLOW/); assert.equal(WTF.hurlHit, 0.25);
  has('wtlongbreak', /TWICE AS LONG/); assert.equal(WTF.spitLong, 2.0); has('wtimpaled', /HALF A BLOW/); assert.equal(WTF.spitHit, 0.5); });
check('SET BACK: the step stops where the point pays, never before, never with nothing in front', () => {
  const s = tipStart(0, false); assert.equal(setBackStops(null, s), false, 'no foe'); assert.equal(setBackStops(s, s), false, 'not yet at the tip'); assert.equal(setBackStops(s + WFK.setBack.pad, s), true); assert.equal(setBackStops(WFK.setBack.far + 1, s), false, 'too far out: the plain step');
  const full = tipStart(100, true); assert(full < s, 'a full band widens the tip, so the step stops closer'); });
check('balance hand math: dance sides within 10% of the base dance; capstones within 10% of each other on one boss at any plausible hit rate', () => {
  const base = danceTotal('base'), a = danceTotal('A'), b = danceTotal('B'); assert(a / base <= 1.12 && a / base >= 0.95, 'A ' + a / base); assert(Math.abs(b / base - 1) <= 0.05, 'B ' + b / base);
  const K = { perHit: 1.4, final: 4.0 }; for (const rate of [1.5, 2.0, 2.5]) { const A = ultBudget('A', rate, K.perHit, K.final), B = ultBudget('B', rate, K.perHit, K.final); assert(Math.abs(A - B) / A <= 0.10, 'capstones at ' + rate + ' hits/s: A ' + A.toFixed(1) + ' B ' + B.toFixed(1)); }
  assert.equal(WFK.ult.base.mul, WID.reach.mul); assert.equal(WFK.ult.base.finalLen, WID.reach.finalLen); assert.equal(WFK.ult.base.t, WID.reach.t, 'the base numbers copied into warden-forks.js are warden-id.js\'s'); });
check('boss law in the new bodies: no pin / freeze / invulnerability / resist word; a pin or a drive only behind lcBig', () => {
  assert(bodies.length > 1500, 'the bodies block was found'); assert(!/\.pinned\s*=|invuln|\.inv\s*=|resist|\.immune|undying|\.frozen/i.test(bodies), 'a pin / freeze / invulnerability word in the fork bodies');
  assert(/if \(q\.alive && !lcBig\(q\)\) pinFoe/.test(bodies), 'SKEWER DROP pins only a non-big foe'); assert(/lcBig\(f\) \|\| KNOCK_SKIP\.has\(f\.t\)\) \{ P\.vx = -P\.face/.test(bodies), 'KEEP-OFF: a boss pushes HER back'); assert(/if \(lcBig\(f\)\) f\.disarmOpenT/.test(main), 'HAFT CATCH: a boss gets the told opening, a small foe the stagger');
  assert(/!lcBig\(e\)\) e\.stagger = Math\.max\(e\.stagger \|\| 0, WTF\.exactOpen/.test(bodies), 'KEEP OPEN staggers a non-big foe only'); assert(/wb\('wtshove'\) && !lcBig\(e\) && !e\.elite/.test(main), 'SHOVE OFF: never a boss, a mini or an elite');
  assert(/wb\('wtlongbreak'\) && !lcBig\(e\)/.test(main) && /wb\('wtlongstag'\) && !lcBig\(e\)/.test(main), 'the long break / long stagger skip a boss');
  const added = main.split('\n').filter(l => /wb\('w[a-z]+'\)/.test(l)).join('\n'); assert(!/\.pinned\s*=|invuln|resist/i.test(added), 'the inline fork reads add no pin / resist'); });
check('flag off: the changed expressions evaluate to the old ones (every new read is wb() or a pure number x 1)', () => {
  /* the base numbers each edit replaced, still present as the false branch */
  for (const frag of ['P.vy = wb(\'whigh\') ? -highVy(300) : -300', ': 13;', "(wb('wtlongv') ? WTF.vaulterLong : 0)", "(wb('wwide') ? WFK.wheel.wide.reach : 46)", ': 0.36;', ": WID.reach.t;", ': WID.reach.mul;', ': WID.reach.finalLen']) assert(main.includes(frag) || trSrc.includes(frag), 'false branch missing ' + frag);
  assert(!/FORKS_SHIP = true/.test(rd('src/forks.js')), 'FORKS_SHIP stays false'); assert.equal(F.FORKS_SHIP, false); });
if (bad.length) { console.log('WARDEN FORKS: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Warden forks: 11 rungs + 10 trait pairs (42 side ids), every side read by wb(), flag off = base, PvP EVEN off, the four folded passives retire with the forks on, boss law holds, dance and capstone parity within 10%.');
