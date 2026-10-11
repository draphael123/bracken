// src/anti-plunge.js - THE DRAWN SPIKES (rule e) AND THE SPITTER'S SIDESTEP (rule c) (claude/knockinto, scratch/brief-combat2.md section 4 '!! UPDATE').
//
// Daniel, 10-11: 'replace the generic RED DAMAGE AURA with readable reactions'. There was no aura in the code (scratch/audit-antiplunge.md):
// what he met was the THORNED elite's spine burst - green dots orbiting the man and a ring flung out round him, and a plunge that could land
// in it - and the SPIKE GOBLIN's back plate that bit a plunge for 20 with nothing to say it would. Both keep their rule; both now SHOW it:
//   THORNED (elite affix)  his spines are DRAWN ON HIS BODY (no floating ring) and RISE with every cut of a mash (thornedBristle 0..1), stand
//                          full and shiver through the red !! (the !! word stays), and FIRE OUTWARD from where they stood (spineBurst - the
//                          particles leave the spines, no ring). A PLUNGE never counts toward his mash (elite-kit take: a plunge is not a
//                          blade) and lands like any plunge while his spines are down; while they are UP (bristled) it is SPIKED.
//                          It stays the anti-mash answer.
//   THE SPIKE GOBLIN       a TOLD BRISTLE: a hero above him and his back spikes rise (thornTick, ~0.3 s, a clatter as they start) - only a
//   ('thorn')              FULLY bristled back bites a plunge or a stomp (thornSpiked). Come down on him before they are up and he is
//                          plunged like anyone (no untold 20).
//   THE SPITTER ('spit')   rule c from src/foe-react.js (sidestepTick): a plunge coming down on it and it hops aside, then stands OFF BALANCE.
//
// main.js hooks (each commented `(claude/knockinto)`): the plunge and stomp branches (thornSpiked, thornedBristle), the thorn's update
// (thornTick), the spitter's update (FR sidestepTick), drawEliteKit's spines + the burst, and the per-foe draw (drawThornSpines).

export const SPINES = {
  thorn: { rise: 0.3, fall: 0.45, above: { dx: 14, dy: 130 }, base: '#6a7280', tip: '#e8eef6', n: 4 },   /* THE SPIKE GOBLIN's iron back spikes */
  thorned: { base: '#5a7a32', tip: '#e8e2cc', n: 5, burstN: 3 },                                         /* a THORNED elite's bone spines */
};

/* THORNED: how far his spines are up, 0..1. A mash's cuts raise them (only while the flurry is live - mashWindow), the !! stands them
   full, the burst is them firing. K = elite-kit's K (thornAt, thornRoused, mashWindow) */
export function thornedBristle(e, now, K) {
  if (!e || e.affix !== 'THORNED' || !e.alive) return 0;
  if (e.mode === 'ekThornsTell' || e.mode === 'ekThorns') return 1;
  if (!(e.ekCuts > 0) || !(now - (e.ekCutAt ?? -99) < K.mashWindow)) return 0;
  const at = e.ekRoused ? K.thornRoused : K.thornAt; return Math.min(0.8, 0.25 + 0.55 * (e.ekCuts / Math.max(1, at)));
}

/* THE SPIKE GOBLIN's bristle: e.brK 0..1, up while a hero is over him. Returns true on the frame it starts to rise (the caller's clatter) */
export function thornTick(e, heroes, dt, heroAbove) {
  const S = SPINES.thorn, was = e.brK || 0, up = e.alive && !(e.broken > 0) && (heroes || []).some(h => h && heroAbove(e, h, S.above));
  e.brK = Math.max(0, Math.min(1, was + (up ? dt / S.rise : -dt / S.fall)));
  return was === 0 && e.brK > 0;
}
export const thornSpiked = e => !!e && e.t === 'thorn' && (e.brK || 0) >= 1;

/* THE SPINES, DRAWN ON THE BODY: along its top and down its back (the side away from where it faces), each a short pixel line pointing out
   of the body, as long as k (0..1) lets it (1 px down, 5 px up). x, y = the foot centre on the screen; shake: they shiver (the !! held) */
export function drawSpines(g, x, y, w, h, k, face, look, time, shake) {
  if (!(k > 0)) return; const S = SPINES[look] || SPINES.thorned, L = Math.max(1, Math.round(1 + k * 4)), f = face || 1;
  const j = shake ? ((Math.floor(time * 24) & 1) ? 1 : -1) : 0, top = Math.round(y - h), n = S.n;
  for (let i = 0; i < n; i++) {   /* along the top, leaning back */
    const px = Math.round(x - w / 2 + 2 + i * (w - 4) / Math.max(1, n - 1)) + (i & 1 ? j : 0), lean = -f * (i < n / 2 ? 0 : 1);
    for (let s = 0; s < L; s++) { g.fillStyle = s >= L - 1 ? S.tip : S.base; g.fillRect(px + Math.round(lean * s * 0.5), top - 1 - s, 1, 1); } }
  const bx = Math.round(x - f * (w / 2)) ;   /* down the back, pointing out behind */
  for (let i = 0; i < 2; i++) { const py = Math.round(top + 3 + i * (h * 0.3)) + (i & 1 ? j : 0);
    for (let s = 0; s < L - 1; s++) { g.fillStyle = s >= L - 2 ? S.tip : S.base; g.fillRect(bx - f * (1 + s), py - Math.round(s * 0.4), 1, 1); } }
}
/* THE BURST: the spines fly off where they stood (particles out along each spine's line) - no ring flung round him */
export function spineBurst(e, look = 'thorned') {
  const S = SPINES[look] || SPINES.thorned, w = e.w || 12, h = e.h || 16, f = e.face || 1, out = [], top = e.y - h;
  for (let i = 0; i < S.n; i++) { const px = e.x - w / 2 + 2 + i * (w - 4) / Math.max(1, S.n - 1);
    for (let b = 0; b < S.burstN; b++) out.push({ x: px, y: top, vx: (px - e.x) * 9 - f * 20 * (i >= S.n / 2), vy: -170 - b * 40, life: 0.35, max: 0.35, col: b ? S.base : S.tip, size: 1, grav: 200 }); }
  for (const sd of [-1, 1]) for (let b = 0; b < 3; b++) out.push({ x: e.x + sd * w / 2, y: e.y - h * (0.3 + 0.25 * b), vx: sd * (190 + b * 30), vy: -40 + b * 30, life: 0.3, max: 0.3, col: b ? S.base : S.tip, size: 1, grav: 120 });
  return out;
}
