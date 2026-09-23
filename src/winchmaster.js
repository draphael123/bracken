// winchmaster.js — THE WINCHMASTER, the Ore Road's boss (2026-09-23). The level is src/ore-road.js; the pitch is
// work/claude/KICKOFF.md 4@ (Daniel agreed it 2026-09-22).
// A heavy goblin in a leather apron and a counterweight belt, all shoulders and iron, on the housing of the great drum that
// hauls the whole road. EVERY ATTACK IS HIS JOB - he never does anything a winchman would not do:
//   REVERSE THE DRUM     the brake thrown and the drum driven back: the bucket you are riding goes the WRONG WAY, and faster.
//                        It throws no blow, so it wears no mark (the QUIET list) - it is his answer to a rider, not an attack
//   SEND A BUCKET    X   a loaded one let go down the line at speed: it takes anyone at the line's height, and no shield turns
//                        a ton of ore. Be on a catwalk, or be in the air
//   CUT A SPAN       X   the catwalk you are on, cut from its hangers: that footing is gone for good. He never cuts the LAST one
//   THE BRAKE LEVER  !   the iron bar, brought down on anyone who reaches his ledge without jamming the drum: a shield turns it
// THE OPENING IS YOURS TO MAKE (tools/boss-openings.mjs proves it is caused): RIDE A BUCKET INTO THE DRUM. It jams, the cable
// locks, and he is thrown off the housing onto his own ledge - DOWNED, and double. He stands on a housing no jump reaches, so
// there is no other way to put a blade in him, and the fight is about getting a bucket there: he reverses any rider he sees
// coming, so BAIT THE REVERSE, and while the brake cools drop onto a bucket from the far catwalk - the one he wants to cut.
// Touching him never hurts (the touch rule).
//
// PURE: no DOM, no main.js. Everything the world does is a call on `c`. Proved by tools/ore-road.mjs.
import { OR } from './ore-road.js';   /* the bucket he sends is the road's own bucket: one width, so what hurts is what is drawn (C1) */
export const WINCH = {
  hp: 520, pace: 26,
  tell: { reverse: 0.45, send: 0.8, cut: 1.0, lever: 0.55 },
  cd: 1.4, cdP2: 1.0,
  /* THE BRAKE COOLS LONGER THAN THE LONGEST RIDE. Baited, a reverse holds 3 s and cools for 11: with every catwalk but the first cut,
     the ride from it to the drum is 19 tiles, about 6 s - at 8 s of cooldown there was no window at all (the lab measured it: he
     reversed every rider a tile short of the drum, forever). The opening must be there for a player who reads him */
  revT: 3.0, revMul: 1.6, revCd: 11.0, revCdP2: 9.0,
  /* sendR IS HALF A BUCKET. It was 14 against a 26 px drawing of a 24 px bucket; the bucket is 46 now and a thing that hurts
     must be the size it looks (C1), so this follows the road's own width instead of being a number of its own */
  sendV: 300, sendCd: 5.0, sendCdP2: 3.6, sendR: OR.BUCKET.w / 2,
  cutCd: 7.0,
  leverCd: 2.2, leverReach: 30,
  thrownT: 0.7, downT: 4.5, climbT: 0.8, downMul: 2,
  dmg: { send: 22, lever: 20 },
};
const SAY = { reverseTell: 'HE THROWS THE BRAKE', sendTell: 'HE SENDS ONE DOWN', cutTell: 'HE CUTS THE SPAN', leverTell: 'THE BRAKE LEVER' };
const RED = new Set(['sendTell', 'cutTell']);
export const winchOpen = e => e.mode === 'downed';
export const winchTake = e => winchOpen(e) ? WINCH.downMul : 1;
/* the frames of bakeWinchmaster: 0 idle | 1,2 pace | 3 lever tell (bar up) | 4 lever (bar down) | 5 reverse (hauling the brake)
   | 6 send tell (boot on the release) | 7 cut tell (hatchet up) | 8 cut (hatchet through) | 9 thrown | 10 downed | 11 climb | 12 hurt */
export function winchFrame(e) {
  switch (e.mode) {
    case 'leverTell': return 3; case 'lever': return 4;
    case 'reverseTell': case 'reverse': return 5;
    case 'sendTell': case 'send': return 6;
    case 'cutTell': return 7; case 'cut': return 8;
    case 'thrown': return 9; case 'downed': return 10; case 'climb': return 11;
    case 'sleep': case 'wake': return 0;
  }
  if (e.hurtT > 0) return 12;
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 5) % 2 : 0;
}
function begin(e, what, c, arg) {
  e.mode = what + 'Tell'; e.modeT = WINCH.tell[what]; e.arg = arg;
  e.face = Math.sign(c.P.x - e.x) || e.face || -1;
  c.say(SAY[e.mode], RED.has(e.mode), what === 'reverse');
}
/* THE JAM: main.js calls this the frame a bucket with a rider in it reaches the drum. The cable locks (the world's job) and he
   goes off the housing. Returns true if it took him (it does not while he is already down or on his way back up) */
export function winchJam(e, c) {
  if (!e || !e.alive || e.mode === 'thrown' || e.mode === 'downed' || e.mode === 'climb' || e.mode === 'sleep') return false;
  e.mode = 'thrown'; e.modeT = WINCH.thrownT; e.fromY = e.y; e.fromX = e.x; e.vx = 0;
  c.say('THE DRUM JAMS: HE GOES OFF THE HOUSING', false, true); c.sound('crash'); c.shake(7);
  return true;
}
export function updateWinchmaster(e, dt, c) {
  const { P, A } = c;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt;
  for (const k of ['revCd', 'sendCd', 'cutCd', 'leverCd']) e[k] = Math.max(0, (e[k] ?? 0) - dt);
  const p2 = e.hp <= e.maxHp * 0.5;
  if (p2 && e.phase !== 2) { e.phase = 2; c.say('HE DRIVES THE DRUM HARDER', true); c.sound('roar'); }
  /* THE REVERSE runs out on its own clock, whatever he is doing */
  if (e.revT > 0) { e.revT -= dt; if (e.revT <= 0) c.drive(1, 1); }
  /* THE RUNAWAY BUCKET, once let go, goes down the line whatever becomes of him */
  if (e.runaway) { const r = e.runaway; if (r.delay > 0) r.delay -= dt; else { r.x -= WINCH.sendV * dt;
      const ly = c.lineY(r.x);
      if (ly === null) { c.crash(r.x); e.runaway = r.next || null; }
      else if (!r.hit && !P.dead && Math.abs(P.x - r.x) < WINCH.sendR && Math.abs(P.y - ly) < 14) { r.hit = true;
        const res = c.hit(r.x, WINCH.dmg.send, true, 'A LOADED BUCKET'); if (res) c.shove(-190, -200); } } }
  const top = A.housingY;
  if (e.mode === 'wake') { e.y = top; if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 1.0; } return; }
  // ---- THE OPENING, and the way back up ----
  if (e.mode === 'thrown') { const k = 1 - Math.max(0, e.modeT) / WINCH.thrownT;   /* an arc off the housing onto his own ledge */
    e.x = e.fromX + (A.ledgeX - e.fromX) * k; e.y = e.fromY + (A.deckY - e.fromY) * k - Math.sin(k * Math.PI) * 28;
    if (e.modeT <= 0) { e.mode = 'downed'; e.modeT = WINCH.downT; e.x = A.ledgeX; e.y = A.deckY; c.shake(4); c.sound('thud'); } return; }
  if (e.mode === 'downed') { e.vx = 0; e.open = Math.max(0, e.modeT); if (e.modeT <= 0) { e.open = 0; e.mode = 'climb'; e.modeT = WINCH.climbT; c.say('HE HAULS HIMSELF BACK UP', false); } return; }
  e.open = 0;
  if (e.mode === 'climb') { const k = 1 - Math.max(0, e.modeT) / WINCH.climbT; e.x = A.ledgeX + (A.homeX - A.ledgeX) * k; e.y = A.deckY + (top - A.deckY) * k - Math.sin(k * Math.PI) * 18;
    if (e.modeT <= 0) { e.mode = 'stalk'; e.y = top; e.x = A.homeX; e.cd = 0.8; } return; }
  e.y = top;
  // ---- the windups ----
  if (e.mode.endsWith('Tell')) {
    if (e.modeT > 0) return;
    if (e.mode === 'reverseTell') { e.mode = 'reverse'; e.modeT = 0.4; e.revT = WINCH.revT; e.revCd = p2 ? WINCH.revCdP2 : WINCH.revCd; c.drive(-1, WINCH.revMul); c.sound('clank'); c.shake(3); return; }
    if (e.mode === 'sendTell') { e.mode = 'send'; e.modeT = 0.4; e.sendCd = p2 ? WINCH.sendCdP2 : WINCH.sendCd; c.sound('heavy');
      const x0 = A.drumX; e.runaway = { x: x0, delay: 0, next: p2 ? { x: x0, delay: 0.5 } : null }; return; }
    if (e.mode === 'cutTell') { e.mode = 'cut'; e.modeT = 0.4; e.cutCd = WINCH.cutCd; c.cut(e.arg); c.sound('crack'); c.shake(4); return; }
    if (e.mode === 'leverTell') { e.mode = 'lever'; e.modeT = 0.35; e.leverCd = WINCH.leverCd; c.sound('whoosh');
      if (!P.dead && c.onLedge()) { const r = c.hit(e.x, WINCH.dmg.lever, false, 'THE BRAKE LEVER'); if (r === 'hit') c.shove(-200, -160); }
      return; }
  }
  if (e.mode === 'reverse' || e.mode === 'send' || e.mode === 'cut' || e.mode === 'lever') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = p2 ? WINCH.cdP2 : WINCH.cd; } return; }
  // ---- ON THE HOUSING: he paces by his lever and watches the line ----
  const want = Math.abs(e.x - A.homeX) > 20 ? Math.sign(A.homeX - e.x) : (Math.sin(e.anim * 0.7) > 0.6 ? -1 : 0);
  e.x += want * WINCH.pace * dt; e.vx = want * WINCH.pace; e.face = Math.sign(P.x - e.x) || e.face;
  if (e.cd > 0 || P.dead) return;
  /* WHAT HE DOES IS WHAT HE SEES. A rider coming at the drum is reversed; a hero at his ledge gets the bar; anyone on the line or at
     its mouth gets a bucket; a hero on a catwalk loses it (never the last) */
  const riding = c.riding(), span = c.playerSpan(), spans = c.spansLeft();
  if (c.onLedge() && e.leverCd <= 0) { begin(e, 'lever', c); return; }
  if (riding && riding.coming && e.revCd <= 0 && !(e.revT > 0)) { begin(e, 'reverse', c); return; }
  if ((riding || c.atLineMouth()) && e.sendCd <= 0 && !e.runaway) { begin(e, 'send', c); return; }
  if (span !== null && spans.length > 1 && e.cutCd <= 0) { begin(e, 'cut', c, span); return; }
  if (e.sendCd <= 0 && !e.runaway && Math.random() < 0.5) { begin(e, 'send', c); return; }
  e.cd = 0.4;
}
/* the runaway bucket, the span he is about to cut, the line's direction while it is reversed, and the ring while he is down */
export function drawWinchFx(g, e, c, cx, cy, time) {
  if (!e?.alive) return;
  const r = e.runaway;
  const hw = OR.BUCKET.w / 2;
  for (let q = r; q; q = q.next) { if (q.delay > 0) continue; const ly = c.lineY(q.x); if (ly === null) continue; const x = Math.round(q.x - cx), y = Math.round(ly - cy);
    g.fillStyle = '#2a2a30'; g.fillRect(x - hw - 1, y - 1, hw * 2 + 2, 13); g.fillStyle = '#6a6a74'; g.fillRect(x - hw, y, hw * 2, 10); g.fillStyle = '#b09a5a'; g.fillRect(x - hw + 3, y - 3, hw * 2 - 6, 3);
    g.fillStyle = '#2a2a30'; g.fillRect(x - 1, y - 30, 2, 29);
    g.globalAlpha = 0.5; g.fillStyle = '#fff0d0'; for (let k = 1; k < 5; k++) g.fillRect(x + hw + k * 6, y + 2 + k, 4, 1); g.globalAlpha = 1; }
  if (e.mode === 'sendTell') { const k = 1 - Math.max(0, e.modeT) / WINCH.tell.send; g.globalAlpha = 0.25 + 0.5 * k; g.fillStyle = '#ff6b6b';
    for (let x = c.lineX0; x < c.drumX; x += 6) { const ly = c.lineY(x); if (ly !== null) g.fillRect(Math.round(x - cx), Math.round(ly - cy) - 2, 3, 2); } g.globalAlpha = 1; }
  if (e.mode === 'cutTell' && e.arg != null) { const s = c.span(e.arg); if (s) { const k = 1 - Math.max(0, e.modeT) / WINCH.tell.cut; g.globalAlpha = 0.3 + 0.5 * k * (0.5 + 0.5 * Math.sin(time * 30));
      g.fillStyle = '#ff6b6b'; g.fillRect(Math.round(s.x0 - cx), Math.round(s.y - cy) - 1, s.x1 - s.x0, 3); g.globalAlpha = 1; } }
  if (e.revT > 0) { g.globalAlpha = 0.5; g.fillStyle = '#ffd36b'; const ph = (time * 60) % 24;
    for (let x = c.lineX0 + ph; x < c.drumX; x += 24) { const ly = c.lineY(x); if (ly === null) continue; const X = Math.round(x - cx), Y = Math.round(ly - cy) - 40; g.fillRect(X, Y, 5, 1); g.fillRect(X, Y - 1, 1, 3); } g.globalAlpha = 1; }
  if (e.mode === 'downed') { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - cy) - 2, 26 + k * 3, 6, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
}
