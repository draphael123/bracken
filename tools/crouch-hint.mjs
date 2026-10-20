// tools/crouch-hint.mjs - THE FIRST-CROUCH HINT (claude/crouchfix, src/crouch-hint.js): the first time each hero crouches, one short line names
// his twist. On the Stockade's flat floor, fresh save, this fails when:
//   - a hero stood or walking is told anything, or crouching 0.1 s (a stumble) is
//   - a hero who crouches is not told FIRST[hero] (the hint box, PROG.crouchFirst[hero] = 1), or all nine lines are not distinct
//   - he is told a second time (a second crouch, a minute later, even after a level load)
//   - a hint (or two) already showing is CUT IN ON: the crouch hint must wait until the box and its queue are quiet, then show
//   - a hero whose own contextual line was already said (the paladin's kneelTold) is told twice
//   - a line is longer than 56 characters (the box is two lines at 6px caps; tools/textfit.mjs reads the same table)
//   node tools/crouch-hint.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { FIRST, SETTLE } from '../src/crouch-hint.js';

const bad = [];
const HEROES = Object.keys(FIRST);
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    if (!BK.crouchHint) return { err: 'no BK.crouchHint' };
    const { LEVELS } = await import('/src/level.js');
    BK.manualSimulation = true; BK.SET.speed = 1;
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const setUp = h => { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = true; BK.sim(600); BK.crouchHintReset(); BKT.PROG.crouchFirst = {}; BK.sim(5); none(); };
    const out = {};
    for (const h of ${JSON.stringify(HEROES)}) {
      const r = {}; setUp(h);
      /* standing and walking: nothing */
      BK.sim(120); K.right = true; BK.sim(60); none(); r.walkTold = BK.crouchHint().stats.told;
      /* a stumble: down for 0.1 s */
      K.down = true; BK.sim(6); none(); BK.sim(10); r.stumbleTold = BK.crouchHint().stats.told;
      /* the crouch: held 1 s */
      for (const k of ['crouchTold_knight', 'crouchTold_warden', 'crouchTold_pirate', 'kneelTold', 'senseTold', 'harvestTold', 'spikeTold', 'workTold', 'pounceTold']) delete BKT.PROG[k];   /* (the contextual lines are tested in their own checks) */
      K.down = true; { let n = 0; while (BK.crouchHint().stats.told < 1 && n < 2000) { BK.sim(10); n += 10; } r.after = n; }   /* (the stockade's own toasts are up first: it waits for them) */
      r.msg = BKT.hintNow.msg; r.t = BKT.hintNow.t; r.told = BK.crouchHint().stats.told; r.flag = BKT.PROG.crouchFirst && BKT.PROG.crouchFirst[h]; none();
      /* again: never twice (a minute later, and after a level load) */
      BK.sim(900); K.down = true; BK.sim(90); none(); BK.sim(30); K.down = true; BK.sim(90); none(); r.toldAfter = BK.crouchHint().stats.told;
      BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.state = 'play'; BK.sim(600); K.down = true; BK.sim(90); none(); r.toldAfterLoad = BK.crouchHint().stats.told;
      out[h] = r; }
    /* BEHIND THE TOASTS: two already up (and one waiting), then the first crouch - it must wait, then show */
    { setUp('knight'); BKT.number(BK.P.x, BK.P.y - 40, 'TIRED', '#8fd160'); BKT.number(BK.P.x, BK.P.y - 40, 'STUNNED', '#8fd160'); const r = {}; r.up = BKT.hintNow.t > 0;
      K.down = true; BK.sim(40); r.toldWhileBusy = BK.crouchHint().stats.told; r.waiting = BK.crouchHint().waiting; r.busyMsg = BKT.hintNow.msg;
      let n = 0; while (BK.crouchHint().stats.told < 1 && n < 1500) { BK.sim(10); n += 10; } r.drained = n; r.told = BK.crouchHint().stats.told; r.msg = BKT.hintNow.msg; none(); out.behind = r; }
    /* already taught by its own contextual line */
    { setUp('paladin'); BKT.PROG.kneelTold = 1; K.down = true; BK.sim(120); none(); out.taught = { told: BK.crouchHint().stats.told, flag: BKT.PROG.crouchFirst && BKT.PROG.crouchFirst.paladin }; }
    return out;
  })()`, 600000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }

if (R.err) bad.push(R.err);
else {
  for (const [k, v] of Object.entries(R)) console.log(k, JSON.stringify(v));
  if (new Set(Object.values(FIRST)).size !== HEROES.length || HEROES.length !== 9) bad.push('the nine heroes need nine distinct lines');
  for (const [h, s] of Object.entries(FIRST)) if (s.length > 56 || s !== s.toUpperCase()) bad.push(h + ': the line is over 56 characters or not capitals: ' + s);
  for (const h of HEROES) { const r = R[h];
    if (r.walkTold || r.stumbleTold) bad.push(h + ': told while standing, walking or on a ' + SETTLE + ' s stumble: ' + JSON.stringify(r));
    /* (claude/berserker2) THE BERSERKER's crouch is THE COIL and THE POUNCE now - taught here like everyone's; WORKING UP moved off the crouch to his idle WHETSTONE, which teaches itself standing */
    /* (batch97 integ 10-17, PALADIN 4) the paladin kneels anywhere now and src/crouch-b.js teaches PRAYER the moment he stands calm (Conviction under 40, always true on a fresh save): that line IS his first-crouch teaching - the first-crouch line is skipped and flagged seen, never said on top of it. */
    const prayed = h === 'paladin' && r.told === 0 && /^PRAYER: /.test(r.msg || '') && r.t > 0;
    if (!prayed && (r.told !== 1 || r.msg !== FIRST[h] || !(r.t > 0))) bad.push(h + ': the first crouch did not say ' + JSON.stringify(FIRST[h]) + ': ' + JSON.stringify(r));
    if (r.flag !== 1) bad.push(h + ': PROG.crouchFirst not set (it must save with the slot)');
    if (r.toldAfter !== (prayed ? 0 : 1) || r.toldAfterLoad !== (prayed ? 0 : 1)) bad.push(h + ': told a second time: ' + JSON.stringify(r)); }
  const B = R.behind;
  if (!B.up) bad.push('the test did not get a hint up');
  if (B.toldWhileBusy !== 0 || B.waiting !== 'knight') bad.push('the crouch hint cut in on a hint that was showing: ' + JSON.stringify(B));
  if (B.msg === undefined || B.told !== 1) bad.push('the crouch hint never showed after the box emptied: ' + JSON.stringify(B));
  if (R.taught.told !== 0 || R.taught.flag !== 1) bad.push('the paladin was told twice (his own line was said): ' + JSON.stringify(R.taught));
}
assert.deepEqual(bad, [], 'the first-crouch hint:\n  ' + bad.join('\n  '));
console.log('the first-crouch hint holds: each of the nine heroes is told his twist once, on his first real crouch, queued behind any toast already up, and never twice');
