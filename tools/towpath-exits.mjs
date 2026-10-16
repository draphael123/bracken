// tools/towpath-exits.mjs - THE TOWPATH HAS NO DEAD ENDS (claude/towpathchurch, Daniel 10-16, live: "you miss the boat in this section - it never comes back to you" and "you cannot leave the boss room").
// REAL KEYS in the real page, three heroes:
//   A  THE MISSED BOAT (the aqueduct's barge): strike the west sluice and do NOT board - the barge floats to the east stop and docks empty, and the far sluice is across the break. The
//      bargeman poles it back to the hero stranded at the west end (src/towpath-hands.js, TP.bargeBackT), who then boards it with real keys, sends it, and is carried across the break and
//      walks off the east end. (Before the fix the barge stayed at the far end for ever: a soft-lock in the middle of the level.)
//   B  THE EXIT (THE FOG KNIGHT's room): he falls, the gate opens (gateAfterBoss), and the hero - set at the room's door, RIGHT held - walks out to the gate and the level is won (the gate
//      stood buried in the upper quay's solid block before: no hero could reach it).
//   PORT=8974 node tools/towpath-exits.mjs [heroes=knight,ranger,geomancer]
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : 'knight,ranger,geomancer').split(',');
const pg = await openPage({ audio: false, fonts: false });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log('  ok   ' + m); };
try {
  for (const hero of heroes) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16, O = 9, out = {};
      BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero(${JSON.stringify(hero)});
      BK.load(LEVELS.findIndex(l => l.id === 'towpath')); BK.state = 'play'; BK.god = true; BK.sim(5);
      for (const e of BK.enemies()) if (e.t !== 'fogknight') e.alive = false;
      const P = () => BK.P, k = BK.keys, TH = () => BK.towpathHands(), clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = false; };
      const tick = n => { for (let i = 0; i < n; i++) { if (BK.state === 'card') BK.cardClose && BK.cardClose(); BK.sim(1); } };
      const st = () => TH().handsState('trough.aq');
      const hold = (o, n) => { clear(); Object.assign(k, o); tick(n); clear(); };
      /* A. THE MISSED BOAT */
      BK.tp(239, 14); tick(10); out.start = { st: st(), x: Math.round(P().x / TS), y: Math.round(P().y / TS) };
      BK.press('talk'); tick(2); out.sent = st();
      tick(60 * 16); out.east = st();                       /* the barge has floated across and docked empty */
      out.hero = { x: Math.round(P().x / TS), ground: P().ground };
      out.times = []; for (let s = 0; s < 40 && st() !== 'west'; s++) tick(60); out.back = st();
      /* the hero is still on the west walkway: board her (right is a step down onto her deck), send her, ride */
      out.boardX = Math.round(P().x / TS);
      /* (the water stands full now: her deck floats two rows over the walkway's end - boarded with a running jump off it, as a player does) */
      for (let tries = 0; tries < 6 && !(P().onMover && P().onMover.kind === 'barge'); tries++) { BK.tp(239, 14); tick(6); clear(); k.right = true; BK.press('jump'); k.jump = true; tick(8); k.jump = false; tick(40); clear(); tick(10); out.tries = tries + 1; }
      out.boarded = { x: Math.round(P().x / TS), y: Math.round(P().y / TS), on: P().onMover && P().onMover.kind };
      TH().sluice('aq', true); tick(60 * 3); out.moving = st();
      for (let s = 0; s < 40 && st() !== 'east'; s++) tick(60); out.arrived = st(); out.rideX = Math.round(P().x / TS);
      hold({ right: true }, 150); out.off = Math.round(P().x / TS);
      /* B. THE EXIT */
      BK.load(LEVELS.findIndex(l => l.id === 'towpath')); BK.state = 'play'; BK.god = true; BK.sim(5);
      const L = BK.L, A = L.arena, gt = L.ents.find(e => e.t === 'gate');
      BK.tp(Math.round(A.trigger / TS) + 1, Math.round(A.floor / TS) - 1); tick(200);
      const b = BK.boss; out.boss = !!b && b.t === 'fogknight';
      if (b) { b.hp = 1; b.mode = 'downed'; b.modeT = 3; BKT.hurtEnemy(b, 99, b.x - 10, false); }
      for (let i = 0; i < 900 && BK.bossActive; i++) tick(1);
      for (let i = 0; i < 400 && !L.gateOpen; i++) tick(1);
      out.gateOpen = !!L.gateOpen; out.dead = !(b && b.alive);
      BK.tp(Math.round(A.x0 / TS) + 4, Math.round(A.floor / TS) - 1); tick(5);
      /* RIGHT held, and a jump whenever the way is blocked (the three bollards are a two-row step): what a player does */
      let f = 0, still = 0, lx = P().x; for (; f < 2400 && BK.state === 'play'; f++) { if (BK.state === 'card') BK.cardClose && BK.cardClose(); k.right = true; if (Math.abs(P().x - lx) < 0.3) still++; else still = 0; lx = P().x;
        if (still > 5 && P().ground) { BK.press('jump'); k.jump = true; still = 0; for (let j = 0; j < 14; j++) BK.sim(1); k.jump = false; } BK.sim(1); }
      clear(); out.walkedFrames = f; out.state = BK.state; out.x = Math.round(P().x / TS); out.gateX = gt.x;
      return out; })()`, 600000);
    console.log(hero, JSON.stringify(r));
    ok(r.start.st === 'west', hero + ': A - the barge lies at the west stop');
    ok(r.sent === 'sent' || r.sent === 'moving', hero + ': A - the west sluice sends it (nobody aboard)');
    ok(r.east === 'east', hero + ': A - it floats over the break and docks empty at the east stop');
    ok(r.back === 'west', hero + ': A - the bargeman poles it BACK to the hero stranded at the west end (it came back)');
    ok(r.boarded.on === 'barge', hero + ': A - boarded with a running jump and real keys (col ' + r.boarded.x + ', ' + r.tries + ' tr' + (r.tries === 1 ? 'y' : 'ies') + ')');
    ok(r.arrived === 'east' && r.rideX >= 270, hero + ': A - carried across the break (col ' + r.rideX + ')');
    ok(r.off >= 276, hero + ': A - walked off the east end (col ' + r.off + ')');
    ok(r.boss && r.dead && r.gateOpen, hero + ': B - the Fog Knight falls and the gate opens');
    ok(r.state === 'win' && r.x <= r.gateX + 3, hero + ': B - walked out of the boss room to the gate with RIGHT held: the level is won (' + r.walkedFrames + ' frames)');
  }
  if (pg.errors.length) throw new Error('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
console.log('towpath-exits: ' + n + ' checks ok');
