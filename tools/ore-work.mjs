// tools/ore-work.mjs — THE ORE ROAD'S WORK LOOPS, proved in the page (docs/briefs/ore-road-mine-life.md, section 2).
// A goblin at work in the mine is not fighting: it picks at a seam, pushes a cart, hauls a sack, sorts at a table or cranks a
// winch, and when it sees the hero it drops the work, shouts (told: the jump, the shout, its notice sound), stands a startled
// beat, and only then fights with its own tells. Three promises, and each is held here:
//   1. A WORKING GOBLIN NEVER DEALS DAMAGE BEFORE ITS ALERT. Every worker, alone in the level, with the hero stood in front of it
//      and behind it, close in and at a throw's reach: every blow on the hero is logged (BK.log), and each must come AFTER the
//      goblin's alert has played out (its startle included). A blow from a goblin that never alerted, or during its startle, fails.
//   2. EVERY WORK LOOP RETURNS TO FIGHTING WHEN IT SEES THE HERO. One worker of every kind, walked into from ahead: it alerts,
//      drops the work, and after the startle it is back on its own update (its own mode, facing him).
//   3. THEY WORK. Left alone, every loop moves: the cart travels, the sack goes back and forth, the table is sorted, the cage rises.
// usage: node tools/ore-work.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { OR } from '../src/ore-road.js';
const pg = await openPage({ audio: false, fonts: false });
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
try {
  const R = await pg.evalp(`(async()=>{
    const lvm = await import('./src/level.js'), idx = lvm.LEVELS.findIndex(l => l.id === 'oreroad'), TS = 16;
    const fresh = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = false; BK.sim(2); };
    fresh(); const workers = BK.enemies().map((e, i) => [i, e]).filter(([, e]) => e.work).map(([i, e]) => ({ i, t: e.t, k: e.work.k, x: e.x, y: e.y }));
    /* 1. THE BLOWS. Everything but the one worker is gone. A blow is HIS when it names him (who) or was struck while updateEnemies was
       running him (by) - the crusher's teeth, a rockfall and the pit are the level's, not his */
    const blows = [], tells = [], TELL = /Tell$|^aim$|^raise$|^wind$|^crouch$|^throw$/, STARTLE = ${OR.WORK_STARTLE};   /* on the GAME clock (BK.time), not frames: the world runs slower than 60 steps a second */
    for (const w of workers) for (const dx of [-110, -30, 30, 110]) {
      fresh(); const all = BK.enemies(), e = all[w.i]; for (const q of all) if (q !== e) q.alive = false;
      const P = BK.P; BK.log = []; P.x = e.x + dx; P.y = e.y; P.vx = P.vy = 0;
      /* AND NO WIND-UP BEFORE IT EITHER: a blow comes at the end of a tell, so a tell begun before the alert has played out is the
         same broken promise caught earlier - a goblin that turned on you and started to throw while still "at work" */
      for (let f = 0; f < 60 * 5; f++) { P.hp = P.maxHp; BK.sim(1); const a = e.workAlertAt;
        if (e.alive && (TELL.test(e.mode || '') || e.fuse > 0) && (a === undefined || BK.time < a + STARTLE - 1e-6)) { tells.push({ t: w.t, k: w.k, x: Math.round(w.x / TS), dx, at: +BK.time.toFixed(2), alertAt: a === undefined ? null : +a.toFixed(2), mode: e.mode || 'fuse' }); break; } }
      for (const b of BK.log.filter(q => q.k === 'dmgP' && q.by === e)) blows.push({ t: w.t, k: w.k, x: Math.round(w.x / TS), dx, at: +b.t.toFixed(2), alertAt: e.workAlertAt === undefined ? null : +e.workAlertAt.toFixed(2) });
      BK.log = null; }
    /* 2. BACK TO FIGHTING: one of every kind, the hero put 60 px in front of it */
    const back = [];
    for (const k of [...new Set(workers.map(w => w.k))]) { const w = workers.find(q => q.k === k);
      fresh(); const all = BK.enemies(), e = all[w.i]; for (const q of all) if (q !== e) q.alive = false;
      BK.sim(60); const P = BK.P, face = e.face || 1; P.x = e.x + face * 60; P.y = e.y; P.vx = P.vy = 0;
      let alertF = -1, fightF = -1, dropped = null, xf = null, acted = false;
      for (let f = 0; f < 60 * 4; f++) { P.hp = P.maxHp; BK.sim(1); if (alertF < 0 && e.workAlertAt !== undefined) { alertF = f; dropped = e.work.dropped || null; }
        if (fightF < 0 && e.work.st === 'fight') { fightF = f; xf = e.x; } if (fightF >= 0 && (Math.abs(e.x - xf) > 8 || (e.mode !== undefined && e.mode !== e.work.mode0))) acted = true; }
      back.push({ k, t: e.t, alert: alertF, fight: fightF, mode: e.mode, faces: Math.sign(P.x - e.x) === e.face, acted, st: e.work.st, dropped, alive: e.alive }); }
    /* 3. THEY WORK: the hero held up in the air over the yard, where nobody sees him, and twelve seconds of the mine */
    fresh(); BK.tp(3, 5); const P = BK.P, seen = {};
    const ws = BK.enemies().filter(e => e.work);
    for (let f = 0; f < 60 * 12; f++) { BK.tp(3, 5); BK.sim(1);
      for (const e of ws) { const r = seen[e.work.key] || (seen[e.work.key] = { lo: 1e9, hi: -1e9, carry: new Set(), flicks: 0, chips: 0, cage: [1e9, -1e9] });
        const pos = e.work.k === 'cart' ? e.work.cx : e.x; r.lo = Math.min(r.lo, pos); r.hi = Math.max(r.hi, pos); r.carry.add(!!e.work.carry);
        r.flicks = Math.max(r.flicks, e.work.flicks || 0); r.chips = Math.max(r.chips, (e.oreWork && e.oreWork.chips) || e.work.chips || 0);
        if (e.work.cage !== undefined) { r.cage[0] = Math.min(r.cage[0], e.work.cage); r.cage[1] = Math.max(r.cage[1], e.work.cage); } } }
    const work = ws.map(e => { const r = seen[e.work.key]; return { key: e.work.key, k: e.work.k, st: e.work.st, span: Math.round(r.hi - r.lo), carry: r.carry.size, flicks: r.flicks, chips: r.chips, cage: +(r.cage[1] - r.cage[0]).toFixed(2) }; });
    return { workers, blows, tells, back, work };
  })()`, 1800000);
  if (process.env.ORE_WORK_DEBUG) console.log(JSON.stringify({ tells: R.tells, blows: R.blows }));
  const kinds = [...new Set(R.workers.map(w => w.k))].sort();
  console.log(`THE WORK LOOPS: ${R.workers.length} goblins at work, ${kinds.length} kinds (${kinds.join(', ')})`);
  ok(['cart', 'pick', 'sack', 'sort', 'winch'].every(k => kinds.includes(k)), 'all five loops of the brief are in the level: pick, cart, sack, sort and winch');
  /* 1 */
  const early = R.blows.filter(b => b.alertAt === null || b.at < b.alertAt + OR.WORK_STARTLE - 1e-6);
  ok(!early.length, `a working goblin never deals damage before its alert: ${R.blows.length} blows landed on a hero stood beside ${R.workers.length} workers x 4 places, every one after the alert and its ${OR.WORK_STARTLE}s startle` + (early.length ? ' - NOT ' + JSON.stringify(early.slice(0, 4)) : ''));
  ok(R.blows.length > 0, 'and the check is not vacuous: the goblins DO fight once they have alerted (some blows landed)');
  ok(!R.tells.length, 'and none of them so much as BEGINS a wind-up (a Tell, an aim, a raise, a lit fuse) before its alert has played out' + (R.tells.length ? ' - NOT ' + JSON.stringify(R.tells.slice(0, 4)) : ''));
  /* 2 */
  /* fighting = its own update has it again: it has turned on him, or moved (a sapper runs in and out), or changed its mode */
  for (const b of R.back) ok(b.alert >= 0 && b.fight > b.alert && b.st === 'fight' && b.mode !== 'work' && (b.faces || b.acted) && b.dropped, `the ${b.k} loop (${b.t}) sees him in ${(b.alert / 60).toFixed(2)}s, drops the work (${b.dropped}), and is fighting ${((b.fight - b.alert) / 60).toFixed(2)}s later (mode ${b.mode}${b.faces ? ', facing him' : ''}${b.acted ? ', on the move' : ''})`);
  /* 3 */
  for (const w of R.work) { const moves = w.k === 'cart' ? w.span > 24 : w.k === 'sack' ? w.carry === 2 && w.span > 16 : w.k === 'sort' ? w.flicks >= 4 : w.k === 'winch' ? w.cage > 0.4 : w.k === 'pick' ? w.chips > 0 || w.span > 8 : false;
    ok(moves && w.st === 'work', `left alone, the ${w.key} works (${w.k === 'cart' ? 'the cart ran ' + w.span + ' px' : w.k === 'sack' ? 'he hauled ' + w.span + ' px, carrying and not' : w.k === 'sort' ? w.flicks + ' pieces sorted' : w.k === 'winch' ? 'the cage ran ' + w.cage + ' of its height' : w.chips + ' blows at a seam, ' + w.span + ' px walked'})`); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
  ok(!pg.errors.length, 'no page errors');
} finally { pg.close(); }
assert(!fails, fails + ' work-loop check(s) failed');
console.log('every goblin at work in the mine is told before it fights');
