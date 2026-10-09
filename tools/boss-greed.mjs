/* tools/boss-greed.mjs - THE GLOBAL BOSS RULE AND THE GREED REPRISAL (claude/combat3, the combat pass; Daniel 2026-10-01, src/boss-greed.js).
   Daniel: "the boss is just attack, attack" - the mash bot beat 18 of 34 bosses and 12 of 13 minis by pressing attack and nothing else.
   NODE (no page): every campaign boss has an opening rule or a written reason it has none (NO_OPENING, a boss-wave TODO), and every
     campaign mini has a rule or is on the list of minis whose every blow counts toward greed.
   PAGE, per boss fight (a sample that covers each kind of rule):
     - a HERO's blow (hurtAs) outside his opening lands at most a twentieth (and a run of them adds up to a twentieth, not to nothing);
       the same blow from the ROOM (hurtEnemy, no hero blow) is not chipped; inside his opening, or broken by his poise bar, the
       hero's blow lands whole
     - a boss with his own twentieth (the Puppeteer) keeps HIS number: never a chip of a chip
     - a boss with no opening (NO_OPENING: the Spore Mother, the Kraken) is left at full damage, never made unbeatable (Node: the chip never applies
       to one); the Grandmother had none and was the page's sample until claude/bosswave1 gave her two (her rap, her feel turned): she is chipped now
     - GREED.n hero blows outside an opening start the reprisal: the red !! goes up, and only after GREED.tell does it land - on a hero
       beside him, not on one who stood off; blows inside an opening never count
     - his burn outside an opening is chipped too
     - a mini takes his blows whole, answers GREED.nMini of them, and his own blows land GREED.miniHit harder
   Red on master 3fd06c78: no src/boss-greed.js (and BK.greed undefined). Run: node tools/boss-greed.mjs */
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import { OPEN_RULE, NO_OPENING, MINI_EVERY_BLOW, GREED, chipped, CHIP_MINI, FULL_DAMAGE } from '../src/boss-greed.js';
import { openPage } from './cdp.mjs';
import { GUARD, ANGLE } from '../src/boss-read.js';   /* (claude/keyscore) the duelists whose front is a wall (B11/B13): their front blows are TURNED, not chipped */

const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
/* NODE: the table covers the campaign */
const campaign = LEVELS.filter(l => !/^(shop|trial_|custom)/.test(l.id));
const arenaBoss = id => { try { return LEVELS.find(l => l.id === id).build(); } catch { return null; } };
let bosses = 0, minis = 0;
for (const lv of campaign) {
  const L = arenaBoss(lv.id); if (!L) continue;
  if (L.arena && L.arena.boss) { bosses++; ok(OPEN_RULE[L.arena.boss] || NO_OPENING[L.arena.boss], lv.id + ': the boss ' + L.arena.boss + ' has no opening rule and no NO_OPENING reason (src/boss-greed.js)'); }
  if (L.mini && L.mini.boss) { minis++; ok(OPEN_RULE[L.mini.boss] || MINI_EVERY_BLOW.has(L.mini.boss), lv.id + ': the mini ' + L.mini.boss + ' has no opening rule and is not on MINI_EVERY_BLOW'); }
}
ok(bosses >= 30, 'only ' + bosses + ' campaign bosses found');
for (const t of CHIP_MINI) { ok(OPEN_RULE[t], 'the mini ' + t + ' is on the chip with no opening rule'); ok(chipped({ t, xpRole: 'mini' }, false), t + ' is on CHIP_MINI and must be chipped'); }
ok(!chipped({ t: 'spider', xpRole: 'mini' }, false), 'a mini with no opening (the spider) keeps full damage');
/* (claude/dk3) A DUELIST ON FULL DAMAGE (THE DEATH KNIGHT, Daniel 10-03): never chipped, but his openings are still named, so greed still counts outside them */
for (const t of Object.keys(FULL_DAMAGE || {})) { ok(!chipped({ t }, true), t + ' is on FULL_DAMAGE and must never be chipped'); ok(OPEN_RULE[t], t + ' is on FULL_DAMAGE but has no opening rule: greed would never count'); }
/* (claude/redgorge2) the duelists off the chip, named one by one (design standard B11: a beast duelist guards by angle instead) - a new name here is a design call (QUESTION in the lane report) */
const DUELISTS = ['bloodknight', 'matriarch', 'roc', 'hawkmistress', 'fogknight', 'greathound', 'pyromancer', 'huntmaster', 'lance', 'closedhelm', 'captain', 'quarter', 'paladinboss'];   /* (claude/litchurch: THE PALADIN - Daniel 10-07, a B11 duelist with a light bar, NOT the x0.05 chip) */   /* (claude/rootway: THE GOBLIN HUNTMASTER is a duelist, src/boss-greed.js FULL_DAMAGE - the list lagged the module) */   /* (claude/burnvillage2: THE PYROMANCER - Daniel's brief 10-07, "must NEVER be invulnerable... takes real damage normally (B11/B13)") */   /* (claude/hound: THE GREAT HOUND - Daniel 10-07, 'he should NOT be invincible': a design change by Daniel, the same strictness) */   /* (claude/roc2: THE ROC - Daniel 10-06, 'she DOESN'T NEED TO BE INVULNERABLE BY DEFAULT': a beast guarding by height, src/roc-eyrie.js take) */   /* (claude/keyscore: the four waiting rooms, B13 + Daniel's B15 10-08 - duelists with a WALL, src/boss-read.js GUARD) */   
ok(FULL_DAMAGE && DUELISTS.every(k => FULL_DAMAGE[k]) && Object.keys(FULL_DAMAGE).length === DUELISTS.length, 'FULL_DAMAGE is the named duelists alone (the Death Knight, the Raptor Matriarch, the Roc, the Hawk-Mistress, the Great Hound, the Pyromancer, the Huntmaster, and the four WALL duelists Lance/Crusader/Captain/Quartermaster and the Paladin; nobody else is taken off the chip): ' + Object.keys(FULL_DAMAGE || {}));
for (const t of Object.keys(NO_OPENING)) ok(!chipped({ t }, true), t + ' is on NO_OPENING and must never be chipped (left at full damage, never made unbeatable)');

const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1; const out = {};
    const none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk', 'dodge']) BK.keys[k] = false; };
    const boot = (id, mini) => { BK.setHero('knight'); BK.reset({ fresh: true }); if (BKT.PROG[id]) BKT.PROG[id].mini = false; BK.load(LEVELS.findIndex(l => l.id === id)); BK.state = 'play'; BK.start(); BK.god = true; BK.sim(5); BK.reset();
      const A = mini ? BK.L.mini : BK.L.arena; const b = BK.enemies().find(e => e.t === A.boss && e.alive && (!mini || e.mini));
      for (const e of BK.enemies()) if (e !== b && !e.maxHp && !e.mini) e.alive = false;
      if (A.carpet) { BK.board(); } else if (A.start) BK.tp(A.start[0], A.start[1]); else BK.tp(Math.round(A.trigger / 16) + (A.reverse ? -1 : 1), Math.round(A.floor / 16) - 1);
      BK.sim(150); none(); return b; };
    const freeze = b => { b.greedLog = []; b.greedT = 0; b.greedCd = 0; b.chipAcc = 0; b.poise = 0; b.broken = 0; };   /* (and his poise bar: a full one breaks him, and broken he is open) */
    const hero = (b, d) => { const h0 = b.hp; BKT.hurtAs('light', b, d, b.x - 12, false); const t = h0 - b.hp; b.hp = h0; return t; };
    const room = (b, d) => { const h0 = b.hp; BKT.hurtEnemy(b, d, b.x - 12, false); const t = h0 - b.hp; b.hp = h0; return t; };
    /* a closed mode for each sampled boss (his own idle) */
    const shut = { wood: b => { b.mode = 'hover'; b.modeT = 9; for (const d of BK.enemies()) if (d.t === 'wasp' && d.drone) d.alive = false; },
      hurricane: b => { b.mode = 'idle'; b.modeT = 9; }, lamplit: b => { b.mode = 'idle'; b.open = 0; b.modeT = 9; }, spire: b => { b.mode = 'idle'; b.modeT = 9; },
      theatre: b => { b.mode = 'idle'; b.modeT = 9; }, underleaf: b => { b.mode = 'walk'; b.alpha = 1; b.modeT = 9; b.listenT = b.sweepT = b.teleT = b.fireT = b.callT = b.feelT = 99; b.stagger = 0; }, burning: b => { b.mode = 'idle'; b.open = 0; b.modeT = 9; } };
    const opener = { wood: b => { b.mode = 'winded'; b.modeT = 9; }, hurricane: b => { b.mode = 'beach'; b.modeT = 9; }, lamplit: b => { b.open = 3; b.onFoot = true; }, spire: b => { b.mode = 'downed'; b.modeT = 9; },
      theatre: b => { b.mode = 'staggered'; b.modeT = 9; b.openT = 9; const S = BK.puppeteerHands().show(); if (S) S.visitLeft = 999; }, burning: b => { b.open = 3; }, underleaf: b => { b.mode = 'rap'; b.modeT = 9; } };   /* (claude/bosswave1: her rap after a silent listen) */
    for (const id of ['wood', 'hurricane', 'lamplit', 'spire', 'theatre', 'underleaf', 'burning']) {
      const b = boot(id); if (!b) { out[id] = { missing: true }; continue; }
      const o = { t: b.t, bossActive: BK.bossActive !== undefined ? BK.bossActive : null };
      shut[id](b); freeze(b); BK.sim(1); shut[id](b); o.openShut = BK.greed.open(b);
      o.heroShut = hero(b, 40); freeze(b); o.roomShut = room(b, 40); freeze(b);
      let sum = 0; for (let i = 0; i < 20; i++) { freeze(b); shut[id](b); sum += hero(b, 20); } o.heroRun = sum; freeze(b);   /* 20 blows of 20: a twentieth is 20 */
      b.broken = 1; o.heroBroken = hero(b, 40); b.broken = 0; freeze(b);
      if (opener[id]) { opener[id](b); o.openOpen = BK.greed.open(b); o.heroOpen = hero(b, 40); freeze(b); shut[id](b); }
      /* GREED: n blows in a breath, a hero beside him and then one stood off */
      if (id !== 'burning') {   /* (the Pyromander reads blows and runs his own fire: his chip is asked, his greed is the others') */ freeze(b); shut[id](b); const P = BK.P; BK.god = false; P.inv = 0; P.dead = 0; P.hp = P.maxHp; P.x = b.x - 30; P.y = b.y; let began = -1;
        for (let i = 0; i < ${GREED.n}; i++) { shut[id](b); BKT.hurtAs('light', b, 10, b.x - 12, false); if (b.greedT > 0 && began < 0) began = i + 1; }
        o.greedBegan = began; o.markUp = false; const hp0 = P.hp; let firstHurtT = -1, t = 0;
        for (let f = 0; f < 90; f++) { shut[id](b); P.x = b.x - 30; P.y = b.y; P.inv = 0; P.vx = 0; BK.sim(1); t += 1 / 60; if (BK.textLab && BK.textLab.nums().some(n => n.txt === '!!')) o.markUp = true; if (P.hp < hp0 && firstHurtT < 0) firstHurtT = t; }
        o.hurtAfter = +firstHurtT.toFixed(2); o.hurt = hp0 - P.hp;
        freeze(b); P.hp = P.maxHp; P.inv = 0; for (let i = 0; i < ${GREED.n}; i++) { shut[id](b); BKT.hurtAs('light', b, 10, b.x - 12, false); }
        const hp1 = P.hp; o.farMin = 1e9; for (let f = 0; f < 90; f++) { shut[id](b);
          /* STAND OFF ON THE ROOMY SIDE: the camera lock walls the hero in at the arena edge, and a chasing boss (the Hornet Queen hovers to P.x) closes a clamped 115 px inside 0.6 s - the flake was the burst landing on a hero the wall had pulled back in, not a long reach */
          const AR = BK.L.arena, side = (b.x - AR.x0 >= AR.x1 - b.x) ? -1 : 1; P.x = Math.max(AR.x0 + 8, Math.min(AR.x1 - 8, b.x + side * 220)); P.y = b.y; P.inv = 0; BK.sim(1); o.farMin = Math.min(o.farMin, Math.abs(P.x - b.x)); } o.hurtFar = hp1 - P.hp;
        if (opener[id]) { freeze(b); opener[id](b); for (let i = 0; i < ${GREED.n} + 2; i++) { opener[id](b); BKT.hurtAs('light', b, 1, b.x - 12, false); } o.greedInOpen = b.greedT > 0; }
        BK.god = true; }
      /* HIS BURN outside an opening */
      { freeze(b); shut[id](b); const h0 = b.hp; b.burn = 3; b.burnTick = 0; for (let f = 0; f < 120; f++) { shut[id](b); b.burn = 3; BK.sim(1); } o.burn4s = Math.round((h0 - b.hp) * 10) / 10; b.burn = 0; b.hp = h0; }
      out[id] = o; }
    /* A MINI: the bosun (claude/bosswave1: his parried pin is his opening, and he is on the chip outside it) */
    { const b = boot('harbor', true); const o = {}; if (b) { freeze(b); b.open = 0; o.t = b.t; o.heroBlow = hero(b, 40); freeze(b); b.open = 3; o.heroOpen = hero(b, 40); b.open = 0; freeze(b);   /* (claude/bosswave1: on the chip outside his parried pin, whole inside it) */
      const P = BK.P; BK.god = false; P.inv = 0; P.hp = P.maxHp; let began = -1; for (let i = 0; i < ${GREED.nMini}; i++) { BKT.hurtAs('light', b, 1, b.x - 12, false); if (b.greedT > 0 && began < 0) began = i + 1; } o.greedBegan = began;
      freeze(b); P.hp = P.maxHp; P.inv = 0; const h0 = P.hp; BKT.damagePlayer(b.x, 20, { who: b }); o.miniHit = h0 - P.hp; P.hp = P.maxHp; P.inv = 0; BKT.damagePlayer(b.x, 20, {}); o.plainHit = h0 - P.hp; BK.god = true; }
      out.bosunMini = o; }
    return out; })()`, 600000);
} finally { pg.close(); }

const chipMax = (d, t) => Math.ceil(d * (GREED.chipBy[t] ?? GREED.chip));   /* (a boss with his own chip - the first boss, the Pyromancer - GREED.chipBy) */
for (const [id, o] of Object.entries(R)) {
  if (id === 'bosunMini') continue;
  if (o.missing) { ok(false, id + ': no boss found'); continue; }
  const own = o.t === 'puppeteer', exempt = !!NO_OPENING[o.t];
  if (exempt) { ok(o.heroShut >= 20, id + ' (' + o.t + ', no opening): a hero blow of 40 must land whole-ish, not chipped (took ' + o.heroShut + ')'); continue; }
  ok(o.openShut === false, id + ': the sampled closed mode must read as NOT open (BK.greed.open = ' + o.openShut + ')');
  const wall = GUARD[o.t] === 'wall';   /* (claude/keyscore, B13 + B15) a duelist WALL: off the chip, 0.4 into his front (src/boss-read.js ANGLE.front) */
  if (own) ok(o.heroShut === Math.max(1, Math.round(40 * 0.05)), id + ': his own ward keeps his own number (a blow of 40 took ' + o.heroShut + ', not ' + Math.max(1, Math.round(40 * 0.05)) + ': a chip of a chip?)');
  else if (wall) ok(o.heroShut === Math.round(40 * ANGLE.front), id + ': B15 - a duelist WALL takes ANGLE.front of a front blow outside his opening, never nothing (a blow of 40 took ' + o.heroShut + ')');
  else if (FULL_DAMAGE[o.t]) ok(o.heroShut >= 30, id + ': ' + o.t + ' is a duelist on FULL_DAMAGE - a hero blow of 40 outside his opening lands WHOLE, never chipped (took ' + o.heroShut + ')');   /* (claude/burnvillage2) */
  else ok(o.heroShut <= chipMax(40, o.t), id + ': a hero blow of 40 outside his opening must take at most ' + chipMax(40, o.t) + ' (took ' + o.heroShut + ')');
  if (FULL_DAMAGE[o.t]) { ok(o.roomShut >= 30, id + ': a blow from the ROOM lands whole (took ' + o.roomShut + ')'); if (o.openOpen !== undefined) { ok(o.openOpen === true, id + ': forced into his opening, BK.greed.open must say so'); ok(o.heroOpen >= 40, id + ': in his opening a hero blow of 40 lands whole or better (took ' + o.heroOpen + ')'); } continue; }   /* (his chip rows are a chip boss's: a duelist has none - the rest of his read is tools/village-water.mjs) */
  const cr = GREED.chipBy[o.t] ?? GREED.chip;
  if (wall) ok(o.heroRun === 20 * Math.round(20 * ANGLE.front), id + ': a duelist WALL (B11/B13/B15, claude/keyscore) takes ANGLE.front of every front blow at his height outside his opening - 20 blows of 20 took ' + o.heroRun);
  if (!own && !wall) ok((o.t === 'pyromancer' || o.heroRun >= 20 * 20 * cr - 1) && o.heroRun <= 20 * 20 * cr + 1, id + ': 20 hero blows of 20 outside his opening must add up to a twentieth (' + 20 * 20 * GREED.chip + '), took ' + o.heroRun);
  if (!own && cr < 0.5) ok(o.roomShut > chipMax(40, o.t), id + ': a blow from the ROOM (no hero blow) must not be chipped (took ' + o.roomShut + ')');
  if (!own && cr < 0.5) ok(o.heroBroken > chipMax(40, o.t) * 3, id + ': broken by his poise bar he is open (a hero blow of 40 took ' + o.heroBroken + ')');
  if (o.openOpen !== undefined) { ok(o.openOpen === true, id + ': forced into his opening, BK.greed.open must say so'); ok(o.heroOpen >= 30, id + ': in his opening a hero blow of 40 lands whole (took ' + o.heroOpen + ')'); }
  if (o.greedBegan === undefined) continue;   /* (a boss sampled for the chip only) */
  ok(o.greedBegan === GREED.n, id + ': the reprisal must begin on the ' + GREED.n + 'th greedy blow (began on ' + o.greedBegan + ')');
  ok(o.markUp, id + ': the reprisal must be TOLD - a red !! over him');
  ok(o.hurt > 0 && o.hurtAfter >= GREED.tell - 0.05, id + ': the reprisal lands on the hero beside him only after its tell (' + GREED.tell + ' s): hurt ' + o.hurt + ' at ' + o.hurtAfter + ' s');
  ok(o.farMin > GREED.reach + 40, id + ': the stood-off hero must really stand off (closest he got: ' + o.farMin + ' px; reach ' + GREED.reach + ' + half the boss)');
  ok(o.hurtFar === 0, id + ': a hero who stood off is not hurt by it (lost ' + o.hurtFar + ')');
  if (o.greedInOpen !== undefined) ok(!o.greedInOpen, id + ': blows in his opening must never count as greed');
  if (wall) ok(o.burn4s > 4 * 2 / 0.3 * GREED.chip + 1, id + ': B15 - a duelist WALL is off the chip: his burn lands (2 s of burn took ' + o.burn4s + ')');
  if (!own && !wall) ok(o.burn4s <= 4 * 2 / 0.3 * cr + 1, id + ': his burn outside an opening is chipped (2 s of burn took ' + o.burn4s + ')');
}
{ const m = R.bosunMini; ok(m && m.t === 'bosun', 'the bosun mini was not found');
  if (m && m.t) { ok(m.heroBlow <= Math.ceil(40 * GREED.chip), 'a mini on the chip (CHIP_MINI, claude/bosswave1): a hero blow of 40 on the bosun outside his opening took ' + m.heroBlow);
    ok(m.heroOpen >= 20, 'and in his opening (his pin parried) it lands whole: took ' + m.heroOpen);
    ok(m.greedBegan === GREED.nMini, 'the bosun must answer the ' + GREED.nMini + 'th blow in a row (began on ' + m.greedBegan + ')');
    ok(m.miniHit > m.plainHit && Math.abs(m.miniHit / m.plainHit - GREED.miniHit) < 0.15, 'a mini hits ' + GREED.miniHit + 'x harder: ' + m.miniHit + ' against ' + m.plainHit); } }
console.log(JSON.stringify(R));
if (fails.length) { console.log('boss-greed: ' + fails.length + ' FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('boss-greed: ' + bosses + ' bosses and ' + minis + ' minis have a rule or a reason; the chip, the room\'s blow, the opening, the poise break, the own ward, the no-opening boss, the told reprisal, the burn and the mini all hold');
