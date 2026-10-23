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
export const SWARM = { hp: 16, w: 22, h: 18, wake: 64, leash: 104, speed: 36, drain: 0.04, rise: 0.6, calmK: 2, calmHold: 2.5, sink: 10, r: 13, home: 40, burst: 3.5, settle: 2.5 };   /* burst: s of stinging before it SETTLES (settle s, quiet, told) - a swarm comes in bursts */
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
const COL = { body: '#e8a418', bodyD: '#3a2410', band: '#1a1006', wing: '#d4dce8', red: '#ff5a3a', grey: '#9aa0a8', greyD: '#6a7078', out: '#1b1626' };
/* ONE HORNET of the cloud (art pass, claude/hornetsnestart): a 5 x 3 body - a dark head, an amber thorax, a banded abdomen with its sting - with two wing-flecks that beat. dir = which way it flies. */
function mote(g, px, py, dir, col, bandCol, beat, tint) {
  /* head (dark) - thorax (col, 2) - abdomen (band, col) : 5 px long, 1 high, a shadow under it, wings a flick above */
  const o = dir > 0 ? 1 : -1, x0 = dir > 0 ? px - 2 : px - 2;
  g.globalAlpha *= 0.55; g.fillStyle = COL.out; g.fillRect(x0, py + 1, 5, 1); g.globalAlpha = g.globalAlpha / 0.55;
  const seq = dir > 0 ? [bandCol, col, bandCol, col, COL.band] : [COL.band, col, bandCol, col, bandCol];   /* tail -> head, flipped */
  for (let k = 0; k < 5; k++) { g.fillStyle = seq[k]; g.fillRect(x0 + k, py, 1, 1); }
  g.fillStyle = col; g.fillRect(x0 + (dir > 0 ? 2 : 1), py - 1, 2, 1);                       /* the humped thorax */
  if (tint) { g.fillStyle = tint; g.fillRect(x0 + 1, py - 1, 3, 1); }
  g.fillStyle = COL.wing; if (beat) { g.fillRect(x0 + 1 + (o > 0 ? 1 : 1), py - 2, 2, 1); g.fillRect(x0 + 2, py - 3, 1, 1); } else g.fillRect(x0 + 1, py - 2, 3, 1);
}
export function drawSwarm(g, e, cx, cy, time) {
  const n = Math.round(swarmCount(e) * 1.7), x = e.x - cx, y = e.y - SWARM.h / 2 - cy, m = e.mode === 'settle' ? 'calm' : e.mode, R = SWARM.r * 1.25 * (m === 'rise' ? 0.65 : m === 'calm' ? 1.15 : 1);
  const hot = m === 'rise' || m === 'angry', flick = Math.floor(time * 10) % 2;
  /* the cloud's own shadow: a soft dark smudge, red-hot when it rises, grey-cool when quiet */
  g.globalAlpha = m === 'calm' ? 0.16 : hot ? 0.26 : 0.2; g.fillStyle = m === 'calm' ? '#4a5058' : hot ? (flick ? '#5a1408' : '#3a1008') : '#3a2410'; g.beginPath(); g.ellipse(Math.round(x), Math.round(y + (m === 'calm' ? 2 : 0)), R * 1.25, R * 0.85, 0, 0, 7); g.fill();
  if (m === 'rise') { g.globalAlpha = 0.45 + 0.3 * flick; g.strokeStyle = '#ff5a3a'; g.lineWidth = 1; g.beginPath(); g.ellipse(Math.round(x), Math.round(y), R * 1.5, R * 1.1, 0, 0, 7); g.stroke(); }   /* the tell: a hot ring closing in */
  g.globalAlpha = 1;
  for (let i = 0; i < n; i++) { const sp = m === 'calm' ? 0.6 : m === 'angry' ? 4.5 : m === 'rise' ? 6 : 2.2, dr = i % 2 ? 1 : -1, a = i * 2.39996 + time * sp * dr, rr = R * Math.sqrt((i + 0.5) / n);
    const px = Math.round(x + Math.cos(a) * rr), py = Math.round(y + Math.sin(a * 1.3) * rr * 0.7 + (m === 'calm' ? 2 + (i % 3) : 0)), dir = -Math.sin(a) * dr >= 0 ? 1 : -1;
    const col = m === 'calm' ? COL.grey : hot ? (flick ^ (i & 1) ? COL.red : COL.body) : COL.body, band = m === 'calm' ? COL.greyD : COL.band;
    if (m === 'angry') { g.globalAlpha = 0.35; g.fillStyle = COL.red; g.fillRect(px - dir * 3, py, 2, 1); g.globalAlpha = 1; }   /* streaming at you */
    mote(g, px, py, dir, col, band, m !== 'calm' && ((Math.floor(time * 22) + i) & 1), null); }
  if (m === 'calm') { for (let k = 0; k < 3; k++) { const ph = (time * 0.4 + k / 3) % 1; g.globalAlpha = 0.35 * (1 - ph); g.fillStyle = '#c8d0d8'; g.fillRect(Math.round(x - 6 + k * 6 + Math.sin(time + k) * 2), Math.round(y - R - ph * 10), 3, 2); } g.globalAlpha = 1; }   /* the smoke on it */
  if ((e.hurtT || 0) > 0) { g.globalAlpha = 0.5; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(Math.round(x), Math.round(y), R + 2, 0, 7); g.fill(); g.globalAlpha = 1; }
}
export function bakeSwarm(canvas, flipX, whiten) {
  const CW = 30, CH = 26, ax = 15, ay = 20, frames = [];
  for (const [mode, hurt] of [['idle'], ['rise'], ['angry'], ['calm'], ['idle', 1]]) { const [c, g] = canvas(CW, CH); g.imageSmoothingEnabled = false;
    drawSwarm(g, { x: ax, y: ay + 1, mode, hp: SWARM.hp, maxHp: SWARM.hp, hurtT: hurt ? 1 : 0 }, 0, 0, 0.35); frames.push(c); }
  const white = frames.map(c => whiten(c));
  return { R: frames, L: frames.map(flipX), white: { R: white, L: white.map(flipX) }, ax, ay, w: SWARM.w, h: SWARM.h };
}
