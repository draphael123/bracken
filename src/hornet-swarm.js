// src/hornet-swarm.js - THE SWARM (claude/hornetsnest; scratch/brief-hornetsnest-1022.md). THE HORNET'S NEST's one new foe: a cloud of hornets that keeps a post
// over a ledge, a rung or a gap. ent('swarm', x, y) - the cell its cloud hangs in. PURE: main.js gives it X (below) and runs it.
//   IT KEEPS ITS POST: a loose cloud drifting over its home, a low hum.
//   IT RISES WHEN YOU COME NEAR (or when it is struck): TOLD - the cloud bunches and goes red, the hum climbs, a red !! (SWARM.rise s) - then it is ANGRY: it drifts
//     after you (slowly: you can walk out of it) as far as its leash, and while you are IN it, it STINGS: a QUIET DRAIN (A13: the shared drain - health off the bar,
//     no stagger, no knock). It goes home when you are past its leash.
//   SMOKE QUIETS IT: a carried smoke pot near it, a set-down pot or a cloud of smoke (src/hornets-nest-hands.js calm) - it goes grey, sinks, stops stinging and
//     drifts home, quiet, for SWARM.calmHold s after the smoke has left it. Struck while it is quiet it scatters easily (x SWARM.calmK).
//   A BLADE THINS IT: it has health like anything else (never an immune body); a thinner cloud is drawn thinner.
// X = { heroes(), calm(x, y) -> bool, drainOn(e, pp), drainOff(e, pp), mark(e, txt, col), sfx, hint(id, msg) }
export const SWARM = { hp: 16, w: 22, h: 18, wake: 60, leash: 90, speed: 30, drain: 0.028, rise: 0.6, calmK: 2, calmHold: 2.5, sink: 10, r: 13, home: 40, burst: 3.5, settle: 2.5 };   /* burst: s of stinging before it SETTLES (settle s, quiet, told) - a swarm comes in bursts */
export const SWARM_SAY = { rise: '!!', calm: 'THE SWARM GOES QUIET', stung: 'THE SWARM IS ON YOU: WALK OUT, OR SMOKE IT', scatter: 'SCATTERED', settle: 'THE SWARM SETTLES' };
export const SWARM_HINT = 'A SWARM STINGS WHILE YOU STAND IN IT. WALK OUT OF IT - IT IS SLOW - OR CARRY A SMOKE POT THROUGH IT: IT GOES QUIET.';
/* THE POSE IDS (the art lane's contract): 0 IDLE (a loose cloud) 1 RISE (bunched, red - the tell) 2 ANGRY (streaming at you) 3 CALM (grey, sunk, slow) 4 hurt */
export const SWARM_POSE = { idle: 0, rise: 1, angry: 2, calm: 3, hurt: 4, settle: 3 };
/* e.x, e.y are the engine's (its box's bottom middle: what a blow and a mark measure from); the CLOUD's centre is cy(e) = e.y - SWARM.h / 2, and hx / hy its home centre */
export const cy = e => e.y - SWARM.h / 2;
export const newSwarm = e => Object.assign(e, { hx: e.x, hy: e.y - 8, y: e.y + 1, mode: 'idle', modeT: 0, noGrav: true, vx: 0, vy: 0, calmT: 0, tgt: null, onHero: null, phase: (Math.floor(e.x) % 7) * 0.9 });
const inCloud = (e, H) => Math.abs(H.x - e.x) < SWARM.r + 4 && H.y - 26 < cy(e) + SWARM.r && H.y > cy(e) - SWARM.r;
const toC = (e, x, c) => { e.x = x; e.y = c + SWARM.h / 2; };
/* ONE FRAME. Everything it does to a hero goes through X */
export function stepSwarm(e, dt, X) {
  const S = SWARM, sfx = X.sfx || {}; e.modeT -= dt; e.phase += dt;
  const quiet = X.calm(e.x, cy(e)); let c = cy(e);
  if (quiet) { if (e.mode !== 'calm') { e.mode = 'calm'; X.mark(e, SWARM_SAY.calm, '#c8d0d8'); X.hint('calm', 'SMOKE QUIETS A SWARM: WHILE IT IS GREY IT DOES NOT STING, AND A CUT SCATTERS IT.'); } e.calmT = S.calmHold; }
  /* off whoever it was on, if it is not on them now */
  const drop = () => { if (e.onHero) { X.drainOff(e, e.onHero); e.onHero = null; } };
  const heroes = X.heroes().filter(H => !H.dead);
  switch (e.mode) {
    case 'calm': {   /* QUIET: grey, sunk a little, drifting home; it stings nobody */
      drop(); e.calmT -= dt; toC(e, e.x + (e.hx - e.x) * Math.min(1, dt * 0.8), c + (e.hy + S.sink - c) * Math.min(1, dt * 1.2));
      if (e.calmT <= 0 && !quiet) { e.mode = 'idle'; e.modeT = 0.8; }
      break; }
    case 'rise': {   /* THE TELL: bunched, red, the hum climbing */
      drop(); toC(e, e.x, c + (e.hy - 4 - c) * Math.min(1, dt * 4));
      if (e.modeT <= 0) { e.mode = 'angry'; sfx.buzz && sfx.buzz(); }
      break; }
    case 'angry': {   /* AFTER YOU, slowly, as far as its leash; IN it, you are stung (the drain) */
      let T = e.tgt && !e.tgt.dead ? e.tgt : null; if (!T) T = heroes.sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || null; e.tgt = T;
      if (!T || Math.hypot(T.x - e.hx, T.y - 12 - e.hy) > S.leash) { drop(); e.mode = 'home'; break; }
      const tx = T.x, ty = T.y - 12, dx = tx - e.x, dy = ty - c, d = Math.hypot(dx, dy) || 1;
      toC(e, e.x + dx / d * Math.min(S.speed, d * 4) * dt, c + dy / d * Math.min(S.speed, d * 4) * dt); e.face = Math.sign(dx) || e.face;
      const on = heroes.find(H => inCloud(e, H)) || null;
      if (on !== e.onHero) { drop(); if (on) { e.onHero = on; X.drainOn(e, on); X.hint('stung', SWARM_HINT); } }
      if (on) { e.burstT = (e.burstT || 0) + dt; if (e.burstT >= S.burst) { drop(); e.burstT = 0; e.mode = 'settle'; e.modeT = S.settle; X.mark(e, SWARM_SAY.settle, '#c8d0d8'); } }
      break; }
    case 'settle': {   /* SPENT: it settles a while (grey, low, harmless), then keeps its post again */
      drop(); toC(e, e.x + (e.hx - e.x) * Math.min(1, dt * 0.6), c + (e.hy + S.sink - c) * Math.min(1, dt * 1.2)); if (e.modeT <= 0) { e.mode = 'home'; }
      break; }
    case 'home': { drop(); toC(e, e.x + (e.hx - e.x) * Math.min(1, dt * 1.5), c + (e.hy - c) * Math.min(1, dt * 1.5)); if (Math.hypot(e.hx - e.x, e.hy - cy(e)) < 3) { e.mode = 'idle'; e.modeT = 1; } break; }
    default: {   /* IDLE: a loose cloud over its post; it rises at a hero who comes near */
      e.mode = 'idle'; drop(); toC(e, e.hx + Math.sin(e.phase * 0.8) * 4, e.hy + Math.sin(e.phase * 1.3) * 3);
      if (e.modeT > 0) break;
      const T = heroes.find(H => Math.hypot(H.x - e.x, H.y - 12 - cy(e)) < S.wake);
      if (T) { e.mode = 'rise'; e.modeT = S.rise; e.tgt = T; X.mark(e, SWARM_SAY.rise, '#ff6b6b'); sfx.buzz && sfx.buzz(); }
    }
  }
}
/* A BLOW ON A SWARM: the damage multiplier. A quiet one scatters easily; an idle one is roused (told) */
export function swarmTake(e) {
  if (e.mode === 'calm' || e.mode === 'settle') return SWARM.calmK;
  if (e.mode === 'idle' || e.mode === 'home') { e.mode = 'rise'; e.modeT = SWARM.rise; }
  return 1;
}
export const swarmFrame = e => e.hurtT > 0 ? SWARM_POSE.hurt : SWARM_POSE[e.mode] ?? 0;
/* HOW MANY HORNETS ARE DRAWN in the cloud (a cut thins it) */
export const swarmCount = e => Math.max(4, Math.round(18 * Math.max(0, e.hp) / (e.maxHp || SWARM.hp)));
/* ---------- GREYBOX: the cloud is drawn live (drawSwarm, a dot a hornet); the sheet (5 poses) is for the bestiary card and the art lane's contract ---------- */
const COL = { body: '#d08a1a', bodyD: '#5a3a10', wing: '#e8eef4', red: '#ff5a3a', grey: '#9aa0a8', out: '#1b1626' };
export function drawSwarm(g, e, cx, cy, time) {
  const n = swarmCount(e), x = e.x - cx, y = e.y - SWARM.h / 2 - cy, m = e.mode === 'settle' ? 'calm' : e.mode, R = SWARM.r * (m === 'rise' ? 0.65 : m === 'calm' ? 1.15 : 1);
  const col = m === 'calm' ? COL.grey : m === 'rise' || m === 'angry' ? (Math.floor(time * 10) % 2 ? COL.red : COL.body) : COL.body;
  for (let i = 0; i < n; i++) { const a = i * 2.39996 + time * (m === 'calm' ? 0.6 : m === 'angry' ? 4.5 : 2.2) * (i % 2 ? 1 : -1), rr = R * Math.sqrt((i + 0.5) / n);
    const px = Math.round(x + Math.cos(a) * rr), py = Math.round(y + Math.sin(a * 1.3) * rr * 0.7 + (m === 'calm' ? 2 : 0));
    g.fillStyle = COL.out; g.fillRect(px - 1, py - 1, 3, 3); g.fillStyle = col; g.fillRect(px, py, 2, 1); g.fillStyle = COL.bodyD; g.fillRect(px, py + 1, 2, 1);
    if (m !== 'calm' && (Math.floor(time * 20) + i) % 2) { g.fillStyle = COL.wing; g.fillRect(px, py - 1, 1, 1); } }
  if ((e.hurtT || 0) > 0) { g.globalAlpha = 0.5; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(Math.round(x), Math.round(y), R + 2, 0, 7); g.fill(); g.globalAlpha = 1; }
}
export function bakeSwarm(canvas, flipX, whiten) {
  const CW = 30, CH = 26, ax = 15, ay = 20, frames = [];
  for (const [mode, hurt] of [['idle'], ['rise'], ['angry'], ['calm'], ['idle', 1]]) { const [c, g] = canvas(CW, CH); g.imageSmoothingEnabled = false;
    drawSwarm(g, { x: ax, y: ay + 1, mode, hp: SWARM.hp, maxHp: SWARM.hp, hurtT: hurt ? 1 : 0 }, 0, 0, 0.35); frames.push(c); }
  const white = frames.map(c => whiten(c));
  return { R: frames, L: frames.map(flipX), white: { R: white, L: white.map(flipX) }, ax, ay, w: SWARM.w, h: SWARM.h };
}
