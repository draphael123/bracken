// src/bell-gate.js - STORMHOLD 4's BELL-GATES (claude/lance4, lane 2 STORMHOLD 4 LEVEL; scratch/brief-lance4-1029.md s4).
// The gatehouse TEACHES the Queen's Lance's P1 opening before his bridge does: "RING THE BELL: THEY RUN TO IT, AND THE GATE DROPS ON
// WHOEVER IS UNDER IT." A bell hangs over a portcullis; strike it and it tolls three times over 1.2 s (the gate towers' own bell,
// src/lance-support.js bellStrike/bellStep - the same numbers, LANCE4.bell). The foes it calls (each ent says `answers: <the bell's id>`)
// RUN TO IT - to the gate's column - and on the third toll the portcullis drops on whoever stands under it. Then it winds back up
// (hold s), and the bell winds back (rewind s) before it rings again.
//   - THE GATEHOUSE BELL (teach): one pike answers it.
//   - THE BRIDGEHEAD EXAM: two pikes and the shielded captain charge at the rung bell - the P1 opening, exactly.
// Pure of main.js: the page hands its own io (tools/stormhold4.mjs hands stubs and drives the same code in Node).
import { LANCE4, bellStrike, bellStep } from './lance-support.js';

export const BELLGATE = { answer: 2.4, run: 96, hold: 6, catchX: 12 };
/* WHAT IT SAYS (src/hint-lines.js routes these to the hint box; 'THE BELL-GATE TAKES n' is a CALL_COUNTS pattern there) */
export const BELLGATE_SAY = { rung: 'THE BELL: THEY RUN TO IT', drop: 'THE BELL-GATE DROPS', takes: n => 'THE BELL-GATE TAKES ' + n };   // s a called foe runs for (it gives up after), px/s it runs at, s the gate stays down, px either side of the gate's column the bars find

/* the prop, from its level ent: { t: 'gatebell', x, y, id, gate, gy0, gy1 } (tiles) */
export function makeGateBell(e, px, py, TS) {
  return { t: 'gatebell', x: px, y: py, id: e.id, gate: e.gate, gx: e.gate * TS + 8, gy0: e.gy0, gy1: e.gy1, ringT: -1, tolled: 0, rewind: 0, rings: [], down: 0, up: false, took: 0 };
}
/* is this foe under the gate's column (its feet in the gate's rows)? */
export const underGate = (e, pr, TS) => !!e && e.alive && Math.abs(e.x - pr.gx) < BELLGATE.catchX + (e.w || 10) / 2 && e.y > pr.gy0 * TS && e.y - (e.h || 12) < (pr.gy1 + 1) * TS;

/* ONE FRAME. io = { TS, hb (the hero's blow box or null), P, enemies, hitSet, overlap, closeGate(col, y0, y1), openGate(col, y0, y1), crush(e, gx), say(x, y, text, col), sfx(name) } */
export function gateBellStep(pr, dt, io) {
  const { TS } = io;
  /* struck: it rings (unless it is still winding back - a dull clank says so) */
  if (io.hb && !io.hitSet.has(pr) && io.overlap(io.hb, { l: pr.x - 8, r: pr.x + 8, t: pr.y - 26, b: pr.y })) { io.hitSet.add(pr);
    if (pr.down <= 0 && bellStrike(pr, LANCE4)) { io.sfx('seaBell'); io.say(pr.x, pr.y - 36, BELLGATE_SAY.rung, '#ffd36b');
      for (const e of io.enemies) if (e.alive && e.answers === pr.id) { e.answerX = pr.gx; e.answerT = BELLGATE.answer; e.face = Math.sign(pr.gx - e.x) || e.face; } }
    else io.sfx('clank'); }
  for (const ev of bellStep(pr, dt, LANCE4)) {
    if (ev === 'toll') { io.sfx('seaBell'); continue; }
    /* THE THIRD TOLL: the gate drops on whoever stands under it. Not on you - you rang it: a hero in its column is put beside it */
    const P = io.P; if (P && !P.dead && Math.abs(P.x - pr.gx) < 12 && P.y > pr.gy0 * TS && P.y - 14 < (pr.gy1 + 1) * TS) P.x = pr.gx + (P.x < pr.gx ? -13 : 13);
    io.closeGate(pr.gate, pr.gy0, pr.gy1); pr.down = BELLGATE.hold; let n = 0;
    for (const e of io.enemies) if (!e.maxHp && underGate(e, pr, TS)) { io.crush(e, pr.gx); n++; }
    for (const e of io.enemies) if (e.answerX === pr.gx) e.answerT = Math.min(e.answerT || 0, 0.4);   /* the bell is done: the rest stop running and turn on you */
    pr.took += n; io.sfx('crack'); io.say(pr.gx, pr.gy0 * TS - 20, n ? BELLGATE_SAY.takes(n) : BELLGATE_SAY.drop, n ? '#8fd160' : '#ffd36b');
  }
  if (pr.down > 0) { pr.down -= dt; if (pr.down <= 0) { pr.down = 0; io.openGate(pr.gate, pr.gy0, pr.gy1); } }
}

/* A CALLED FOE RUNS TO THE BELL (main.js updateEnemies, before its own AI): straight for the gate's column at BELLGATE.run, its own
   gravity, and it stops there (under the bars) - unless it is staggered. Returns true when it did the moving this frame. */
export function answerRun(e, dt, moveBody) {
  if (!(e.answerT > 0) || e.stagger > 0) { if (e.answerT > 0) e.answerT -= dt; return false; }
  e.answerT -= dt; const d = e.answerX - e.x, step = Math.sign(d) * Math.min(Math.abs(d), BELLGATE.run * dt);
  if (Math.abs(d) > 1) e.face = Math.sign(d);
  e.vx = Math.abs(d) > 2 ? Math.sign(d) * BELLGATE.run : 0; e.vy = Math.min(270, (e.vy || 0) + 1000 * dt); e.anim = (e.anim || 0) + dt;
  const r = moveBody(e, step, e.vy * dt, false); if (r && r.ground) e.vy = 0;
  if (r && r.hitX) e.answerT = Math.min(e.answerT, 0.2);   /* the gate is already down in its way: it gives up */
  return true;
}
