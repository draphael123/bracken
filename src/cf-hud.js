// src/cf-hud.js - CF4 HUD FEEL (claude/cf4, 11-11): number pop, lagging HP chip bar, low-HP edge pulse + heartbeat, hero-hit edge flash, heal and pickup feedback
// (plan scratch/lane-reports/cf-plan-1111.md sec. 5). ONE FLAG. CF4_SHIPS false = batch158 behaviour byte for byte: every main.js call is `CF4.CF4_SHIPS`-guarded.
// FEEL ONLY: no damage, hp, AI or tuning. Numbers keep going through num-display.js (shownDmg / shownHp): this module never builds a health string.
// Preview: ?cf4=on / ?cf4=off in the URL (lab only; the flag stays false in the file). No new settings rows: the pulse and flashes ride Vignette / Flashes / Reduce motion.
// HP units here are the INTERNAL ones (a knight starts at 110; the HUD shows them / 10). Pure functions below take plain state objects so tools/cf4.mjs can run them.
export let CF4_SHIPS = true;
export const setCF4 = on => { CF4_SHIPS = !!on; };

export const CF4 = {
  pop: { from: 1.6, over: 0.08, merge: 1.3, heavy: 1.25, heavyDmg: 20, step: 0.25 },        // 1. spawn scale 1.6 -> 1.0 over 0.08 s; a merged add re-pops at 1.3; heavy class 1.25x; drawn on a 0.25 scale step (pixel type)
  kill: { col: '#ffd36b' },                                                                  //    a kill number draws gold (NOT #ffd34a: that is the coin gold num-display leaves undivided)
  chip: { hold: 0.4, drain: 0.6, healLead: 0.15 },                                            // 2. the lost chunk stays white 0.4 s, drains at 60% of the bar per second; a heal's green runs 0.15 s ahead of the red
  low: { on: 0.25, off: 0.30, aMin: 0.10, aMax: 0.22, hz: 1.2, still: 0.16, beat: 1.0, db: -18 },   // 3. below 25% of max (off again past 30%); alpha 0.10 <-> 0.22 at 1.2 Hz, still 0.16 under Reduce motion; a heartbeat every 1.0 s
  hit: { dur: 0.12, durHeavy: 0.2, heavyDmg: 20, a: 0.30 },                                   // 4. hero hit: a red edge flash 0.12 s (0.2 s for 20+), peak alpha 0.30 x Flashes
  heal: { flashFrames: 1 },                                                                   // 5. the bar flashes white 1 frame on a flask
  coin: { arcPx: 8, arcT: 0.36, bump: 1.2, bumpFor: 0.1, window: 0.4, maxSemi: 8 },           // 6. coin pop 8 px up over the first 0.15 s of its flight (flight t runs at 2.4/s); HUD counter 1.2x for 0.1 s; coins inside 0.4 s climb a semitone each, cap +8
};
const clamp01 = x => Math.max(0, Math.min(1, x));

/* 1. NUMBER POP. age = seconds since the number spawned (or last merged); k0 = the scale it starts from. Quantised to the 0.25 step so pixel type stays crisp. */
export const isHeavyNum = txt => typeof txt === 'number' && Math.abs(txt) >= CF4.pop.heavyDmg;
export function popScale(age, k0 = CF4.pop.from) { const P = CF4.pop; return age >= P.over ? 1 : k0 + (1 - k0) * Math.max(0, age) / P.over; }
export function numScale(n, now, reduce = false) {
  const P = CF4.pop, pop = reduce ? 1 : popScale(now - (n.popAt ?? -9), n.popK || P.from), s = pop * (isHeavyNum(n.txt) ? P.heavy : 1);
  return Math.round(s / P.step) * P.step;
}
export const numColor = n => n.kill ? CF4.kill.col : n.col;
export function popNum(n, now, merged = false) { n.popAt = now; n.popK = merged ? CF4.pop.merge : CF4.pop.from; n.fresh = !merged; return n; }
/* a fresh number (n.fresh) whose target died in the same frame turns gold: dead = [{x, y, h}] bodies / enemies that are no longer alive */
export function markKills(nums, dead) {
  for (const n of nums) { if (!n.fresh) continue; n.fresh = false;
    if (typeof n.txt !== 'number') continue;
    for (const e of dead) if (Math.abs(n.x - e.x) < 14 && n.y <= e.y + 4 && n.y >= e.y - (e.h || 16) - 30) { n.kill = true; break; } }
}

/* 2. HP CHIP BAR. st lives on the thing (P, boss). fill = the red bar, chip = the white lost chunk, green = a heal's lead. All fractions 0..1. */
export function barStep(st, hp, max, dt) {
  const C = CF4.chip, f = max > 0 ? clamp01(hp / max) : 0;
  if (!st.init) { st.init = true; st.fill = st.chip = st.green = st.last = f; st.hold = 0; st.healT = 0; }
  if (f < st.last - 1e-6) { st.hold = C.hold; st.chip = Math.max(st.chip, st.fill, st.last); st.fill = f; st.green = f; st.healT = 0; }
  else if (f > st.last + 1e-6) { st.green = f; st.healT = C.healLead; if (st.chip < f) st.chip = f; }
  st.last = f;
  if (st.healT > 0) { st.healT -= dt; if (st.healT <= 0) { st.healT = 0; st.fill = f; } } else st.fill = f;
  if (st.hold > 0) st.hold -= dt; else if (st.chip > st.fill) st.chip = Math.max(st.fill, st.chip - C.drain * dt);
  if (st.chip < st.fill) st.chip = st.fill;
  return st;
}
export const ghostOf = (st, frac) => st && st.init ? Math.max(st.chip, frac) : null;   // boss bar: bar(..., frac, col, ghost) draws a ghost only above frac

/* 3 + 4. LOW HP and HERO HIT. ok false = menu / boss intro card / Blood Knight / dead: the pulse and the beat stop. lowStep returns true on a heartbeat. */
export function lowStep(st, hp, max, dt, ok = true) {
  const L = CF4.low, f = max > 0 ? hp / max : 1; let beat = false;
  if (!ok || !(hp > 0)) st.low = false;
  else if (!st.low && f < L.on) { st.low = true; st.hb = 0; st.ph = 0; }
  else if (st.low && f > L.off) st.low = false;
  if (st.low) { st.ph = (st.ph || 0) + dt; st.hb = (st.hb || 0) - dt; if (st.hb <= 0) { st.hb = L.beat; beat = true; } } else { st.hb = 0; st.ph = 0; }
  return beat;
}
export function hitStep(st, hp, dt, ok = true) {
  const H = CF4.hit; if (st.hpLast === undefined) st.hpLast = hp;
  const loss = st.hpLast - hp; st.hpLast = hp;
  if (ok && loss > 0.5) { st.hitDur = loss >= H.heavyDmg ? H.durHeavy : H.dur; st.hitT = st.hitDur; }
  else if (st.hitT > 0) st.hitT = Math.max(0, st.hitT - dt);
  return st;
}
/* the edge alpha right now: o = { vignette, flashAmt, reduce }. Low-HP follows Vignette (and Flashes); Reduce motion = a still 0.16; the hit flash follows Flashes only. */
export function lowAlpha(st, o) {
  if (!st.low || !o.vignette) return 0;
  const L = CF4.low; if (o.reduce) return L.still;
  const K = clamp01(o.flashAmt ?? 1), s = 0.5 + 0.5 * Math.sin(2 * Math.PI * L.hz * (st.ph || 0) - Math.PI / 2);
  return (L.aMin + (L.aMax - L.aMin) * s) * K;
}
export function hitAlpha(st, o) { if (o.reduce || !(st.hitT > 0)) return 0; return CF4.hit.a * clamp01(o.flashAmt ?? 1) * (st.hitT / st.hitDur); }
export function edgeAlpha(st, o) { return Math.max(lowAlpha(st, o), hitAlpha(st, o)); }
export function drawEdge(g, VW, VH, st, o) {
  const a = edgeAlpha(st, o); if (!(a > 0.004)) return 0;
  const gr = g.createRadialGradient(VW / 2, VH / 2, 70, VW / 2, VH / 2, 200); gr.addColorStop(0, 'rgba(180,20,20,0)'); gr.addColorStop(1, 'rgba(180,20,20,' + a.toFixed(3) + ')');
  g.fillStyle = gr; g.fillRect(0, 0, VW, VH); return a;
}
export const heartGain = () => Math.pow(10, CF4.low.db / 20);   // -18 dB = 0.126: audio.js lowHeart scales its tones by it

/* 5. HEAL: the bar flashes white for one frame */
export const healFlash = st => { st.flashN = CF4.heal.flashFrames; return st; };
export function takeFlash(st) { if (st.flashN > 0) { st.flashN--; return true; } return false; }

/* 6. PICKUPS */
export function ladderStep(st, now) {
  const C = CF4.coin; st.n = (now - (st.at ?? -9) <= C.window) ? Math.min(C.maxSemi, (st.n || 0) + 1) : 0; st.at = now; return st.n;
}
export const semitone = n => Math.pow(2, n / 12);
export const coinArc = t => t < CF4.coin.arcT ? Math.sin(Math.PI * t / CF4.coin.arcT) * CF4.coin.arcPx : 0;
export const bumpScale = (now, at) => now >= at && now - at < CF4.coin.bumpFor ? CF4.coin.bump : 1;
