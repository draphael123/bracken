/* tools/anti-mash.mjs - ANTI-MASH INSIDE OPENINGS (claude/difficulty; Daniel 10-15 ~12:55, src/anti-mash.js).
   NODE: the stale table (x1 / 0.85 / 0.7 / floor 0.55), a different verb resets it, a new opening resets it, a room's blow is never stale;
     every campaign boss and mini carries a break bar (breakMax > 0) unless BREAK_SKIP names why; heavies / plunges / ripostes / abilities fill
     the bar far faster than the basic cut, and outside an opening the cut fills nothing; the finisher fires once a break and only for a heavy or an ability.
   PAGE (a boss in his opening, and a mini): the same plain cut landed again pays the table's share; a heavy between resets it; a new opening resets it;
     a heavy leans the bar to BROKEN in a few blows where the cut takes many; BROKEN lasts BREAK.secs, pays x BREAK.mul, and the first heavy into it is
     the FINISHER (once); a varied blow takes CD_REFILL off an ability's wait; outside his opening nothing is stale.
   Red before claude/difficulty: no src/anti-mash.js. Run: PORT=8965 node tools/anti-mash.mjs */
import { LEVELS } from '../src/level.js';
import { STALE, BREAK, BREAK_SKIP, breakMax, breakFill, staleMul, openTick, finisherNow, varied, CD_REFILL } from '../src/anti-mash.js';
import { openPage } from './cdp.mjs';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const near = (a, b, tol = 0.035) => Math.abs(a - b) <= tol;
/* NODE */
ok(JSON.stringify(STALE.pay) === JSON.stringify([1, 0.85, 0.7, 0.55]), 'STALE.pay is Daniel\'s x1 / 0.85 / 0.7 / floor 0.55 (is ' + JSON.stringify(STALE.pay) + ')');
{ const e = {}; openTick(e, true); const seq = [1, 2, 3, 4, 5].map(() => staleMul(e, 'cut', true)); ok(JSON.stringify(seq) === '[1,0.85,0.7,0.55,0.55]', 'five cuts in one opening pay ' + seq);
  ok(staleMul(e, 'heavy', true) === 1 && staleMul(e, 'cut', true) === 1, 'a different verb resets the count (the cut after a heavy pays whole)');
  openTick(e, false); openTick(e, true); staleMul(e, 'heavy', true); ok(staleMul(e, 'cut', true) === 1 && staleMul(e, 'cut', true) === 0.85, 'a new opening starts clean');
  ok(staleMul(e, 'throw', true) === 1 && staleMul(e, 'throw', true) === 1, 'a room\'s blow (a throw) is never stale');
  ok(staleMul(e, 'cut', false) === 1, 'outside an opening nothing is stale'); }
let bosses = 0, minis = 0;
for (const lv of LEVELS.filter(l => !/^(shop|trial_|custom)/.test(l.id))) { let L = null; try { L = lv.build(); } catch {} if (!L) continue;
  if (L.arena && L.arena.boss) { bosses++; ok(breakMax({ t: L.arena.boss, xpRole: 'boss' }) > 0 || BREAK_SKIP[L.arena.boss], lv.id + ': the boss ' + L.arena.boss + ' carries no break bar and BREAK_SKIP says nothing'); }
  if (L.mini && L.mini.boss) { minis++; ok(breakMax({ t: L.mini.boss, xpRole: 'mini' }) === BREAK.max.mini, lv.id + ': the mini ' + L.mini.boss + ' carries the mini\'s lighter bar'); } }
ok(bosses >= 30 && minis >= 10, 'found ' + bosses + ' bosses and ' + minis + ' minis (too few: the census broke)');
{ const b = { t: 'x' }; for (const v of ['heavy', 'plunge', 'riposte', 'skill']) ok(breakFill(b, v, true) >= 5 * breakFill(b, 'cut', true), v + ' fills the bar at least 5x what the cut does');
  ok(breakFill(b, 'cut', false) === 0, 'outside an opening the cut leans on nothing'); ok(breakFill(b, 'heavy', false) > 0, 'outside an opening a heavy still leans on him');
  const e = { broken: 2, bkBroke: true }; ok(!finisherNow(e, 'cut'), 'a cut is not the finisher'); ok(finisherNow(e, 'heavy') && !finisherNow(e, 'skill'), 'the finisher fires ONCE a break');
  const P = {}; varied(P, 'cut'); ok(!varied(P, 'cut') && varied(P, 'heavy'), 'a varied blow is a different verb from the last'); }

/* PAGE */
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1; BK.difficulty.setOverride('normal');
    const none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk', 'dodge']) BK.keys[k] = false; };
    const boot = (id, mini) => { BK.setHero('knight'); BK.reset({ fresh: true }); if (BKT.PROG[id]) BKT.PROG[id].mini = false; BK.load(LEVELS.findIndex(l => l.id === id)); BK.state = 'play'; BK.start(); BK.god = true; BK.sim(5); BK.reset();
      const A = mini ? BK.L.mini : BK.L.arena; const b = BK.enemies().find(e => e.t === A.boss && e.alive && (!mini || e.mini));
      for (const e of BK.enemies()) if (e !== b && !e.maxHp && !e.mini) e.alive = false;
      if (A.start) BK.tp(A.start[0], A.start[1]); else BK.tp(Math.round(A.trigger / 16) + (A.reverse ? -1 : 1), Math.round(A.floor / 16) - 1);
      BK.sim(150); none(); return b; };
    const calm = b => { b.greedLog = []; b.greedT = 0; b.greedCd = 0; b.chipAcc = 0; b.poise = 0; b.broken = 0; b.poiseCd = 0; b.bkBroke = false; b.dmgPct = 0; };
    const blow = (b, kind, d) => { BK.P.mixN = 0; BK.P.mixLast = null; const h0 = b.hp; BKT.hurtAs(kind, b, d, b.x - 12, false); const t = h0 - b.hp; b.hp = h0; return t; };
    const out = {};
    for (const [id, mini, shut, open] of [['spire', false, b => { b.mode = 'idle'; b.modeT = 9; }, b => { b.mode = 'downed'; b.modeT = 9; }], ['harbor', true, b => { b.open = 0; }, b => { b.open = 9; }]]) {
      const b = boot(id, mini); if (!b) { out[id] = { missing: true }; continue; } const o = { t: b.t }; const tick = () => { BK.sim(15); };   /* (past any hitstop the last blow left: a frozen frame runs no creature) */
      calm(b); shut(b); tick(); open(b); tick(); o.open = BK.greed.open(b);
      o.cuts = []; for (let i = 0; i < 5; i++) { b.poise = 0; o.cuts.push(blow(b, 'light', 40)); }
      o.afterHeavy = (b.poise = 0, blow(b, 'heavy', 40), b.poise = 0, blow(b, 'light', 40));
      o.k0 = b.stOpenN; calm(b); shut(b); tick(); o.sh = BK.greed.open(b); tick(); open(b); tick(); o.k1 = b.stOpenN; o.st = JSON.stringify(b.stale); b.poise = 0; o.newOpen = blow(b, "light", 40);
      calm(b); shut(b); tick(); o.shutA = blow(b, 'light', 40); o.shutB = blow(b, 'light', 40);
      /* THE BAR: cuts to break vs heavies to break, in his opening */
      calm(b); shut(b); tick(); tick(); open(b); tick(); let n = 0; while (!(b.broken > 0) && n < 60) { b.stale = null; blow(b, 'light', 1); n++; } o.cutsToBreak = b.broken > 0 ? n : 99;
      calm(b); shut(b); tick(); tick(); open(b); tick(); n = 0; while (!(b.broken > 0) && n < 20) { blow(b, 'heavy', 1); n++; } o.heaviesToBreak = n; o.broken = +b.broken.toFixed(2); o.bkBroke = !!b.bkBroke;
      tick(); const am0 = BK.antiMash().finishers; b.stale = null; o.finA = blow(b, 'heavy', 40); o.finB = blow(b, 'heavy', 40); o.finishers = BK.antiMash().finishers - am0;
      calm(b); shut(b); tick(); tick(); open(b); tick(); b.stale = null; b.poise = 0; o.openHeavy = blow(b, 'heavy', 40); b.broken = 2; b.bkBroke = true; b.bkFinished = true; b.stale = null; b.poise = 0; o.brokenHeavy = blow(b, 'heavy', 40);
      /* VARIED HITS REFILL */
      calm(b); shut(b); tick(); tick(); open(b); tick(); BK.P.cds = { x: 5 }; BK.P.amLastVerb = undefined; b.poise = 0; blow(b, 'light', 10); b.poise = 0; blow(b, 'light', 10); const c1 = BK.P.cds.x; b.poise = 0; blow(b, 'heavy', 10); o.cdA = c1; o.cdB = BK.P.cds.x;
      out[id] = o; }
    return out; })()`, 600000);
} finally { pg.close(); }
for (const [id, o] of Object.entries(R)) {
  if (o.missing) { ok(false, id + ': no boss found'); continue; }
  const t = id + ' (' + o.t + ')';
  ok(o.open === true, t + ': forced into his opening, BK.greed.open must say so');
  const r = o.cuts.map(x => x / o.cuts[0]);
  ok(near(r[1], 0.85) && near(r[2], 0.7) && near(r[3], 0.55) && near(r[4], 0.55), t + ': five cuts in one opening pay ' + o.cuts.join('/') + ' (want x1 / 0.85 / 0.7 / 0.55 / 0.55)');
  ok(near(o.afterHeavy / o.cuts[0], 1), t + ': a cut after a heavy pays whole again (' + o.afterHeavy + ' vs ' + o.cuts[0] + ')');
  ok(near(o.newOpen / o.cuts[0], 1), t + ': a new opening starts the count clean (' + o.newOpen + ' vs ' + o.cuts[0] + ')');
  ok(o.shutA === o.shutB, t + ': outside his opening nothing is stale (' + o.shutA + ' then ' + o.shutB + ')');
  ok(o.heaviesToBreak <= 5, t + ': heavies break him in a few blows (took ' + o.heaviesToBreak + ')');
  ok(o.cutsToBreak >= 4 * o.heaviesToBreak, t + ': the plain cut barely fills the bar (cuts ' + o.cutsToBreak + ' vs heavies ' + o.heaviesToBreak + ')');
  ok(o.bkBroke && o.broken >= (id === 'harbor' ? BREAK.secs.mini : BREAK.secs.boss) - 0.05, t + ': BROKEN by the bar lasts BREAK.secs (' + o.broken + ' s)');
  ok(o.finishers === 1 && o.finA > o.finB, t + ': the FIRST heavy into a broken boss is the finisher, once (' + o.finA + ' then ' + o.finB + ', finishers ' + o.finishers + ')');
  ok(o.brokenHeavy >= 1.25 * o.openHeavy, t + ': broken by the bar, a blow pays more than in a plain opening (' + o.brokenHeavy + ' vs ' + o.openHeavy + ')');
  ok(near(o.cdA, 5, 0.01) && near(o.cdB, 5 - CD_REFILL, 0.01), t + ': a varied blow takes ' + CD_REFILL + ' s off an ability\'s wait, a repeated one nothing (' + o.cdA + ' -> ' + o.cdB + ')');
}
console.log(JSON.stringify(R));
if (fails.length) { console.log('ANTI-MASH: ' + fails.length + ' FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('anti-mash: ok (stale table, break bar on ' + bosses + ' bosses + ' + minis + ' minis, finisher, varied refill)');
