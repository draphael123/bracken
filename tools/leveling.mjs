// tools/leveling.mjs — THE LEVELING LANE'S RULES (Daniel, 2026-10-03; scratch audit-econ sec.7). Node only, no page.
//   1. THE CURVE: 400*n^1.365 from L10 (9,270 unchanged; L24 30,620; L32 45,350; L50 83,400), the old 325*n^1.455 below it where that is
//      lower - so NO threshold rises and no save loses a level; it climbs every level; XP stops at level 50 (xpCap).
//      The XP holes: canal/theatre/fair are paid a tier (XP_TIER), the moor's hares and the theatre's brute and harlequin weigh something.
//   2. THE CARD: an even spread at L24 beats the old automatic growth (the relic buffs are paid back, not added); a stat stops at 25 picks; a
//      pick is refused when none is owed; milestones at 25..50 offer three untaken perks each, every perk once; a respec puts it all back.
//   3. THE SOFT CAP: full pay to E+2, half to E+5, a fifth beyond (E = depth + 1), and it never pays less than one.
//   4. THE SLOTS: two, then the third at 16 and no more (Daniel 2026-10-04); equipSkill refuses a slot the level has not opened.
//   5. HEROES FOR SILVER: a new game owns nothing and co-op is shut until a second hero is owned; an OLD save keeps every starter it played,
//      and co-op (coopLegacy); the migration runs once.
//   6. THE CARD'S MIGRATION: an old save's heroes get their levels as an even spread and one free respec, milestones owed; idempotent; and the
//      whole thing through migrateProgress (a real version-2 save round-trips and a second load changes nothing).
import assert from 'node:assert/strict';
import * as XP from '../src/xp.js';
import * as PR from '../src/progression.js';
import * as DC from '../src/death-cost.js';
import * as CM from '../src/commit.js';
import { readFileSync } from 'node:fs';

const fails = [], notes = [];
const check = (name, fn) => { try { fn(); } catch (e) { fails.push(name + ': ' + String(e && e.message || e).replace(/\s+/g, ' ').slice(0, 300)); } };
const old = n => n <= 0 ? 0 : Math.round(325 * Math.pow(n, 1.455) / 10) * 10;

check('curve', () => {
  assert.equal(XP.xpFloor(10), 9270); assert.equal(XP.xpFloor(24), 30620); assert.equal(XP.xpFloor(32), 45350); assert.equal(XP.xpFloor(50), 83400);
  for (let n = 1; n <= 60; n++) { assert(XP.xpFloor(n) <= old(n), 'L' + n + ' rose: ' + XP.xpFloor(n) + ' > ' + old(n)); assert(XP.xpFloor(n) > XP.xpFloor(n - 1), 'L' + n + ' does not climb'); }
  for (const xp of [0, 500, 3400, 9270, 20000, 47632, 80000]) assert(XP.levelOfXp(xp) >= (() => { let n = 0; while (old(n + 1) <= xp) n++; return n; })(), xp + ' XP lost a level');
  assert.equal(XP.xpCap(), XP.xpFloor(XP.LV_MAX)); assert.equal(XP.LV_MAX, 50); assert.equal(XP.levelOfXp(XP.xpCap()), 50);
  for (const id of ['canal', 'theatre', 'fair']) assert(XP.xpFoe('x', 'boss', XP.xpTier(id, 0)) >= 450, id + ' boss purse ' + XP.xpFoe('x', 'boss', XP.xpTier(id, 0)));
  assert.equal(XP.xpTier('wood', 0), 0); assert.equal(XP.xpTier('keep', 2.25), 2.25);
  for (const t of ['hare', 'marionette', 'harlequin']) assert(XP.xpFoe(t, '', 0) > 0, t + ' pays nothing');
  assert.equal(XP.xpFoe('sprig', '', 0, true), 5 * XP.xpFoe('sprig', '', 0));
  notes.push('curve L1..50: ' + [1, 5, 10, 16, 20, 24, 25, 30, 32, 40, 50].map(n => n + ':' + XP.xpFloor(n)).join(' '));
});

check('card', () => {
  const oldGrowth = { hp: 3 * 24 + 16, stamina: 5 * 24, damage: 12 + 2 };   /* the automatic growth at L24 before the card (+88 / +120 / +14) */
  for (const h of PR.HERO_IDS) { const base = PR.growthAt(h, 0, null), g = PR.growthAt(h, 24, { v: 8, e: 8, m: 8 });
    assert(g.hp - base.hp >= oldGrowth.hp && g.stamina - base.stamina >= oldGrowth.stamina && g.damage - base.damage >= oldGrowth.damage - (h === 'reaper' ? 1 : 0), h + ' L24 even spread under the old growth: ' + JSON.stringify([g.hp - base.hp, g.stamina - base.stamina, g.damage - base.damage]));
    for (let lv = 0; lv < 50; lv++) assert(PR.growthAt(h, lv + 1).hp > PR.growthAt(h, lv).hp && PR.growthAt(h, lv + 1).stamina > PR.growthAt(h, lv).stamina, h + ' does not grow at ' + lv); }
  const k = PR.growthAt('knight', 24, { v: 8, e: 8, m: 8 }), k0 = PR.growthAt('knight', 0, null), f = PR.growthAt('knight', 24, { v: 24, e: 0, m: 0 });
  notes.push('card L24 even (8/8/8): +' + (k.hp - k0.hp) + ' hp +' + (k.stamina - k0.stamina) + ' st +' + (k.damage - k0.damage) + ' dmg (old +88/+120/+14); all-vigor: +' + (f.hp - k0.hp) + ' hp');
  const p = { card: {} };
  assert.equal(PR.picksOwed(p, 'knight', 3), 3); assert.equal(PR.pickCard(p, 'knight', 'v', 3), null); assert.equal(PR.picksOwed(p, 'knight', 3), 2);
  assert.equal(PR.pickCard(p, 'knight', 'x', 3), 'Unknown pick'); PR.pickCard(p, 'knight', 'e', 3); PR.pickCard(p, 'knight', 'm', 3); assert.equal(PR.pickCard(p, 'knight', 'v', 3), 'No pick owed');
  const q = { card: { warden: { v: 25, e: 0, m: 0, ms: {} } } }; assert.match(PR.pickCard(q, 'warden', 'v', 30), /full/); assert.equal(PR.pickCard(q, 'warden', 'e', 30), null);
  assert.equal(PR.growthAt('warden', 50, { v: 40, e: 0, m: 0 }).hp, PR.growthAt('warden', 50, { v: 25, e: 0, m: 0 }).hp, 'a stat past the cap still grows');
  const r = { card: { pyro: { v: 9, e: 8, m: 8, ms: {} } } };
  assert.deepEqual(PR.milestonesOwed(r, 'pyro', 4), []); assert.deepEqual(PR.milestonesOwed(r, 'pyro', 24), [5, 10, 15, 20]); assert.deepEqual(PR.milestonesOwed(r, 'pyro', 50), [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);   /* LEVELING2: four early milestones under the six */
  const taken = new Set(); for (const n of PR.MILESTONES) { const offer = PR.perkOffer(r, 'pyro', n); assert(offer.length >= 1 && offer.length <= 3); assert(offer.every(o => !taken.has(o.id)), 'offered a perk twice');
    assert.equal(PR.pickMilestone(r, 'pyro', n, offer[0].id, 50), null); taken.add(offer[0].id); }
  assert.equal(taken.size, 10); assert.equal(PR.pickMilestone(r, 'pyro', 25, 'iron', 50), 'No milestone owed'); assert(PR.perkOn(r, 'pyro', [...taken][0]));
  assert.equal(PR.pickMilestone({ card: {} }, 'knight', 25, 'iron', 24), 'No milestone owed');
  assert.notEqual(JSON.stringify(PR.perkOffer({}, 'knight', 25)), JSON.stringify(PR.perkOffer({}, 'warden', 25)), 'every hero sees the same hand');
  PR.respecCard(r, 'pyro'); assert.equal(PR.picksOwed(r, 'pyro', 50), 50); assert.equal(PR.milestonesOwed(r, 'pyro', 50).length, 10);
  assert(PR.growthAt('knight', 30, { v: 10, e: 10, m: 10, ms: { 25: 'heart' } }).hp > PR.growthAt('knight', 30, { v: 10, e: 10, m: 10, ms: {} }).hp, 'GREAT HEART does nothing');
  assert(PR.growthAt('knight', 30, { v: 10, e: 10, m: 10, ms: { 25: 'arcane' } }).skillMultiplier > PR.growthAt('knight', 30, { v: 10, e: 10, m: 10 }).skillMultiplier, 'MASTERY does nothing');
  assert.equal(PR.RESPEC_SILVER, 3); assert.equal(PR.PERKS.length >= 8, true); assert.equal(PR.CARD_CAP, 25);
});

/* LEVELING2 (Daniel 10-04): early minor milestones, the hero's own at every one, stat thresholds, the card's words */
check('early milestones', () => {
  assert.deepEqual(PR.MILESTONES_MINOR, [5, 10, 15, 20]); assert.deepEqual(PR.MILESTONES, [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
  for (const h of PR.HERO_IDS) { const c = { card: { [h]: { v: 0, e: 0, m: 0, ms: {} } } };
    for (const n of PR.MILESTONES) { const o = PR.perkOffer(c, h, n); assert.equal(o.length, 3, h + ' L' + n + ' offers ' + o.length); assert.equal(new Set(o.map(k => k.id)).size, 3, h + ' L' + n + ' repeats');
      assert.equal(o.filter(k => k.own).length, 1, h + ' L' + n + ' has no hero option'); assert(PR.HERO_PERKS[h].some(k => k.id === o[2].id), h + ' L' + n + ' own is not his');
      if (PR.isMinor(n)) assert(o.every(k => k.minor) && o.slice(0, 2).every(k => PR.MINOR_PERKS.some(m => m.id === k.id)), h + ' L' + n + ' minor hand has a major perk'); else assert(o.slice(0, 2).every(k => PR.PERKS.some(m => m.id === k.id)), h + ' L' + n + ' major hand has a minor perk'); }
    /* take the first two of every hand: each generic once, the hero's own stacks to HERO_PERK_MAX over the ten milestones, two per hero */
    const own = {}; for (const n of PR.MILESTONES) { const o = PR.perkOffer(c, h, n); assert.equal(PR.pickMilestone(c, h, n, o[2].id, 50), null); own[o[2].id] = (own[o[2].id] || 0) + 1; }
    assert.deepEqual(Object.values(own), [5, 5], h + ' own ranks ' + JSON.stringify(own)); assert.equal(PR.perkRank(c, h, PR.HERO_PERKS[h][0].id), 5); assert.equal(PR.milestonesOwed(c, h, 50).length, 0);
    assert.equal(PR.HERO_PERKS[h].length, 2, h + ' needs two options'); }
  assert.equal(PR.PERKS.length + PR.MINOR_PERKS.length >= 16, true); assert.equal(PR.MINOR_PERKS.length >= 8, true);
  /* the hero's own is a different hand per hero, and every id of every hero is unique */
  assert.equal(new Set(PR.ALL_HERO_PERKS.map(k => k.id)).size, 14);
  assert.equal(PR.levelsToPerk(0), 5); assert.equal(PR.levelsToPerk(7), 3); assert.equal(PR.levelsToPerk(20), 5); assert.equal(PR.levelsToPerk(49), 1); assert.equal(PR.levelsToPerk(50), null);
  assert.deepEqual(PR.techniquesArriving('knight', 0, 50), []); assert.deepEqual(PR.TECH_LEVELS, [10, 20, 30]);   /* the technique hook: empty, ready, and L20/L30 untouched */
});
check('stat thresholds', () => {
  const card = (v, e, m) => ({ card: { knight: { v, e, m, ms: {} } } });
  for (const st of ['v', 'e', 'm']) { for (const [at, i] of [[10, 0], [20, 1]]) { const lo = card(0, 0, 0), hi = card(0, 0, 0); lo.card.knight[st] = at - 1; hi.card.knight[st] = at;
      assert(!PR.thrOn(lo, 'knight', st, i), st + ' ' + (at - 1) + ' fired'); assert(PR.thrOn(hi, 'knight', st, i), st + ' ' + at + ' did not fire'); } }
  assert.deepEqual(PR.THRESH_AT, [10, 20]); assert.equal(PR.thrNext(card(7, 0, 0), 'knight', 'v').at, 10); assert.equal(PR.thrNext(card(7, 0, 0), 'knight', 'v').have, 7); assert.equal(PR.thrNext(card(12, 0, 0), 'knight', 'v').at, 20); assert.equal(PR.thrNext(card(21, 0, 0), 'knight', 'v'), null);
  assert(!PR.thrOn({}, 'knight', 'v', 0), 'a hero with no card has a threshold');
  /* what the thresholds are tied to: the src (no page): commit.js seam, the poise rule, the kill heal, the revive */
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), cm = readFileSync(new URL('../src/commit.js', import.meta.url), 'utf8');
  assert(/lean: \(\) => thr\('e', 0\)/.test(main) && /wind: \(\) => thr\('e', 1\)/.test(main), 'ENDURANCE thresholds are not bound to the stamina seam');
  assert(/thr\('v', 0\)[^\n]*P\.hp \+ 2/.test(main), 'VIGOR 10 does not heal on a kill'); assert(/thrOn\(PROG, helper\.hero \|\| PROG\.hero, 'v', 1\)/.test(main), 'VIGOR 20 does not touch the revive');
  assert(/thr\('m', 0\)[^\n]*n \*= 1\.25/.test(main), 'MIGHT 10 does not lean on the poise'); assert(/thr\('m', 1\) && !e\.mighted/.test(main), 'MIGHT 20 does not hit a staggered foe harder');
  assert(/leanMul\(P\)/.test(cm) && /SECOND_WIND/.test(cm));
});
check('stamina thresholds (commit.js)', () => {
  let lean = false, wind = false; CM.bindStamina({ lean: () => lean, wind: () => wind, rest: () => false });
  const P = { st: 100, maxSt: 100, winded: false, stDelay: 0 }, h = 'knight', base = CM.rollCost(P, h);
  assert.equal(CM.rollCost(P, h), base); lean = true; assert.equal(CM.rollCost(P, h), base, 'LEAN ROLL cheapened a roll above half'); P.st = 40;
  assert(CM.rollCost(P, h) < base && CM.rollCost(P, h) >= Math.round(base * 0.8) - 1, 'LEAN ROLL under half: ' + CM.rollCost(P, h) + ' vs ' + base); lean = false; P.st = 40;
  assert.equal(CM.rollCost(P, h), base);
  /* SECOND WIND: the bar empties once -> 40%, not winded; again inside the wait -> exhausted as before */
  wind = true; P.st = 10; assert(CM.trySpend(P, 30)); assert(!P.winded && Math.abs(P.st - 40) < 1e-6 && P.windSurge, 'no second wind: ' + JSON.stringify(P)); P.windSurge = false;
  P.st = 10; assert(CM.trySpend(P, 30)); assert(P.winded && P.st === 0, 'a second wind inside the wait'); CM.clearCommit(P); assert.equal(P.windUsedT, 0);
  P.st = 10; CM.trySpend(P, 30); assert(!P.winded); P.windUsedT = 0.01; CM.staminaTick(P, 0.1, {}); assert.equal(P.windUsedT, 0, 'the wait never runs down');
  wind = false; P.st = 10; CM.clearCommit(P); assert(CM.trySpend(P, 30)); assert(P.winded, 'no threshold, no second wind'); CM.bindStamina({ lean: () => false, wind: () => false });
});
check('the card says it', () => {
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert(/' TO YOUR NEXT PERK \(LEVEL '/.test(main), 'no N LEVELS TO YOUR NEXT PERK line'); assert(/thrNext\(PROG, h, k\.id\)/.test(main) && /'BOTH UNLOCKED'/.test(main), 'no threshold progress on the stat cards');
  assert(/fresh: !review && back !== 'menu'/.test(main) && /SFX\.sting\(\)/.test(main) && /u\.t \/ 0\.35/.test(main) && /rgba\(255,246,200/.test(main), 'the level-up moment (flash, sting, slide-in) is not there');
  assert(/if \(cardOwed\(hero\(\)\)\) openCard\('play'\)/.test(main) && /function levelHealTick\(\) \{ const o = lvHealOwed; if \(!o \|\| state !== 'play' \|\| fightLive\(\)\) return;/.test(main), 'the card must wait for the fight to end');
  for (const k of [...PR.MINOR_PERKS, ...PR.ALL_HERO_PERKS, ...Object.values(PR.THRESH).flat()]) { assert(k.what && k.what === k.what.toUpperCase(), k.name + ' text'); assert(/^[A-Z0-9 ,'.:%+?!\/-]+$/.test(k.name + k.what), k.name + ' has a character the font lacks'); }
  const hooks = ['stride', 'mend', 'magnet', 'climber', 'buffer', 'rest', 'tonic', 'grit', ...PR.ALL_HERO_PERKS.map(k => k.id)];
  for (const id of hooks) assert(new RegExp("(perk|prk)\\('" + id + "'\\)|BIND\\.rest").test(main) || (id === 'rest' && /rest: \(\) => perk\('rest'\)/.test(main)), 'perk ' + id + ' has no hook in main.js');
});

check('soft cap', () => {
  const d = 10;   /* a wood at depth 10: E = 11 */
  assert.equal(XP.softCapMul(11, d), 1); assert.equal(XP.softCapMul(13, d), 1); assert.equal(XP.softCapMul(14, d), 0.5); assert.equal(XP.softCapMul(16, d), 0.5);
  assert.equal(XP.softCapMul(17, d), 0.2); assert.equal(XP.softCapMul(49, 0), 0.2); assert.equal(XP.softCapMul(1, 30), 1);
  assert.equal(XP.xpSoftCap(40, 14, d), 20); assert.equal(XP.xpSoftCap(40, 20, d), 8); assert.equal(XP.xpSoftCap(1, 20, d), 1); assert.equal(XP.xpSoftCap(0, 20, d), 0);
});

check('slots', () => {
  assert.deepEqual([0, 7, 8, 15, 16, 23, 24, 50].map(PR.slotsAt), [2, 2, 2, 2, 3, 3, 3, 3]); assert.equal(PR.MAX_SLOTS, 3);
  const p = PR.migrateProgress(null).progress, n = PR.skillsFor('knight').find(s => s.active); p.coins = 9999; p.skillOwned.knight = { [n.id]: true };
  assert.equal(PR.equipSkill(p, 'knight', n.id, 2, 15, true), 'Slot is locked'); assert.equal(PR.equipSkill(p, 'knight', n.id, 3, 50, true), 'Slot is locked'); assert.equal(PR.equipSkill(p, 'knight', n.id, 2, 16, true), null);
  assert.equal(PR.equipped(p, 'knight', 15).length, 2); assert.equal(PR.equipped(p, 'knight', 16)[2], n.id); assert.equal(PR.equipped(p, 'knight', 50).length, 3);
  const four = PR.skillsFor('warden').filter(s => s.active).slice(0, 4).map(s => s.id), old = PR.migrateProgress(JSON.stringify({ progressionVersion: 2, hero: 'warden', heroes: { warden: true }, xp: { warden: XP.xpFloor(20) }, skillOwned: { warden: Object.fromEntries(four.map(id => [id, true])) }, loadouts: { warden: four } })).progress;
  assert.deepEqual(old.loadouts.warden, four.slice(0, 3), 'a four-slot save was not cut to three'); assert(four.every(id => old.skillOwned.warden[id]), 'the fourth ability was lost, not just unslotted');
});

check('heroes for silver', () => {
  const fresh = PR.migrateProgress(null).progress; assert.equal(fresh.heroFlow, 1); assert(!fresh.coopLegacy); assert(!PR.coopOpen(fresh));
  fresh.heroes = { warden: true }; assert(!PR.coopOpen(fresh)); fresh.heroes.knight = true; assert(PR.coopOpen(fresh), 'a second hero does not open co-op');
  assert.deepEqual(PR.DEFAULT_HEROES, ['knight', 'warden', 'geomancer']);
  const oldSave = JSON.stringify({ progressionVersion: 2, hero: 'warden', heroes: { warden: true }, xp: { warden: 5000, geomancer: 400 }, done: { warden: { wood: 1 }, geomancer: {} }, wood: { cleared: true }, coins: 10 });
  const o = PR.migrateProgress(oldSave).progress; assert(o.coopLegacy && PR.coopOpen(o), 'an old save lost co-op'); assert(o.heroes.warden && o.heroes.geomancer, 'an old save lost a starter it played'); assert(!o.heroes.pyro);
  const again = PR.migrateProgress(JSON.stringify(o)).progress; assert.deepEqual(again.heroes, o.heroes); assert.equal(again.heroFlow, 1);
});

check('card migration', () => {
  const raw = JSON.stringify({ progressionVersion: 2, hero: 'knight', heroes: { knight: true }, xp: { knight: XP.xpFloor(26) + 5, pyro: XP.xpFloor(7) }, done: { knight: { wood: 1 } }, coins: 0 });
  const p = PR.migrateProgress(raw).progress; assert.equal(p.cardV, 1);
  assert.deepEqual([p.card.knight.v, p.card.knight.e, p.card.knight.m], [9, 9, 8]); assert.deepEqual([p.card.pyro.v, p.card.pyro.e, p.card.pyro.m], [3, 2, 2]);
  assert.equal(p.cardFree.knight, 1); assert.equal(PR.picksOwed(p, 'knight', 26), 0); assert.deepEqual(PR.milestonesOwed(p, 'knight', 26), [5, 10, 15, 20, 25]);
  assert(!p.card.warden, 'a hero with no XP got a card');
  const g1 = PR.growthAt('knight', 26, p.card.knight), g0 = PR.growthAt('knight', 26); assert.deepEqual([g1.hp, g1.stamina, g1.damage], [g0.hp, g0.stamina, g0.damage], 'the migrated card is not the even spread');
  p.card.knight.v = 12; p.card.knight.e = 7; p.card.knight.m = 7; const twice = PR.migrateProgress(JSON.stringify(p)).progress; assert.equal(twice.card.knight.v, 12, 'a second migration redid the card');
  assert.throws(() => PR.validateProgress({ card: { knight: { v: 26 } } }), /Invalid card pick/); assert.throws(() => PR.validateProgress({ card: { knight: { v: -1 } } }));
  const store = new Map(), mem = { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) };
  const first = PR.loadProgress(mem, 'slot', raw); assert.equal(first.progress.cardV, 1); const second = PR.migrateProgress(JSON.stringify(first.progress)); assert.equal(JSON.stringify(second.progress.card), JSON.stringify(first.progress.card));   /* (a same-version save is migrated in memory; the next save writes it) */
});

check('skill ranks', () => {
  const p = PR.migrateProgress(null).progress, n = PR.skillsFor('knight').find(s => s.active && s.level === 1); p.coins = 100000;
  assert.equal(PR.skillRank(p, 'knight', n.id), 0); assert.equal(PR.rankUp(p, 'knight', n.id, 30), 'Learn it first');
  assert.equal(PR.buySkill(p, 'knight', n.id, 1), null); assert.equal(PR.skillRank(p, 'knight', n.id), 1);
  assert.equal(PR.rankUp(p, 'knight', n.id, 5), 'Rank 2 at level 6'); const c0 = p.coins; assert.equal(PR.rankUp(p, 'knight', n.id, 6), null); assert.equal(c0 - p.coins, PR.rankPrice(n, 2));
  assert.equal(PR.rankUp(p, 'knight', n.id, 10), 'Rank 3 at level 11'); assert.equal(PR.rankUp(p, 'knight', n.id, 11), null); assert.equal(PR.skillRank(p, 'knight', n.id), 3); assert.equal(PR.rankUp(p, 'knight', n.id, 50), 'Top rank');
  const all = PR.HERO_IDS.reduce((s, h) => s + PR.skillsFor(h).filter(x => x.active).reduce((t, x) => t + PR.rankPrice(x, 2) + PR.rankPrice(x, 3), 0), 0);
  notes.push('skill ranks 2+3 for every ability of every hero: ' + all + ' gold (knight alone ' + PR.skillsFor('knight').filter(x => x.active).reduce((t, x) => t + PR.rankPrice(x, 2) + PR.rankPrice(x, 3), 0) + ')');
  PR.validateProgress(p);
});
/* 7. WEAPONS ARE LOOKS AND THE SINKS (read from src/main.js's own tables: no page) */
{ const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), at = src.indexOf('const SWORDS = ['), block = src.slice(at, src.indexOf('];', at));
  check('weapons are looks', () => { const rows = block.split(/\r?\n/).filter(l => /\{ id: '/.test(l)); assert(rows.length >= 9, 'weapon rows: ' + rows.length);
    for (const r of rows) { assert(!/\b(burn|freeze|leech|heavy|gold): true/.test(r), 'a weapon keeps a stat: ' + r.slice(0, 60)); assert(/dmg: 10, cost: 15/.test(r), 'a weapon cuts differently: ' + r.slice(0, 60));
      const p = +r.match(/price: (\d+)/)[1], silver = /silver: true/.test(r), id = r.match(/id: '(\w+)'/)[1]; if (id === 'steel') continue;
      assert(silver ? p >= 6 && p <= 10 : p >= 150 && p <= 400, id + ' priced ' + p); } });
  check('sinks', () => { assert(/id: 'tonic'[^\n]*max: 5/.test(src), 'tonics do not reach five'); assert(/id: 'edge4'/.test(src) && /id: 'mail2'/.test(src), 'no late smith');
    for (const n of PR.SKILLS.filter(n => n.active && ['knight', 'warden', 'geomancer'].includes(n.hero) && PR.TOP_PRICE[n.level])) assert.equal(n.price, PR.TOP_PRICE[n.level], n.id);
    assert.equal(DC.bankStake(400), 0); assert.equal(DC.bankStake(900), 100); assert.equal(DC.bankStake(5000), 300); assert.equal(DC.bankStake(-5), 0);
    notes.push('bank stake on death: bank 1k ' + DC.bankStake(1000) + ', 2k ' + DC.bankStake(2000) + ', 5k ' + DC.bankStake(5000)); }); }

for (const n of notes) console.log('  ' + n);
if (fails.length) { console.log('LEVELING: ' + fails.length + ' problem(s)\n' + fails.map(f => '  - ' + f).join('\n')); process.exitCode = 1; }
else console.log('Leveling: the curve to fifty never rises, the card beats the old growth evenly spread and caps at 25, ten milestones (L5-L20 small, L25-L50 big) each offer two untaken perks and the hero's own (ranks to 5), thresholds fire at 10 and 20 picks, the card counts the levels to the next perk, the soft cap halves at E+3 and fifths at E+6, a third slot at 16 (three at most; an old fourth is unslotted, not lost), a new game owns one hero and co-op opens with the second, old saves keep heroes, co-op and a free respec.');
