// src/cf-foe.js - CF3 FOES (claude/cf3, 11-11): the body that gets hit, staggers, tells and dies (plan scratch/lane-reports/cf-plan-1111.md sec. 4).
// ONE FLAG. CF3_SHIPS false = batch158 behaviour byte for byte: every main.js call is `if (CF3.CF3_SHIPS)`-guarded, so OFF runs none of this.
// FEEL ONLY: no damage, hp, AI, hit boxes, commit windows, knockback or boss numbers. It READS the fields hurtEnemy0 sets (e.flash, e.recD, e.stagger,
// e.broken, e.open, e.brokeAt) and never writes the hit branch. Boss resist floor untouched: a "resisted" blow is feedback only (a grey star), never a block.
// Preview: ?cf3=on / ?cf3=off in the URL (lab only; the flag stays false in the file). Player-facing words, if any, say THORNROAD (none here).
export let CF3_SHIPS = false;
export const setCF3 = on => { CF3_SHIPS = !!on; };

export const CF3 = {
  flash: { whiteFor: 0.05, tint: 0.4, minWhite: 0.1 },                 // 1. pure white silhouette 0.05 s, then a 40% white tint fading to 0 at the end of e.flash
  hurt: { dx: 4.0, sx: 1.12, sy: 0.90, rot: 0.22, ease: 0.12 },        // 2. generic hurt pose (foes with NO hurt frame): squash 1.12 x 0.9, lean 0.22 rad, eased over 0.12 s
  old: { dx: 3.4, sx: 1.13, sy: 0.89, rot: 0.16 },                     //    what poseOf's STRUCK block applies today (the delta is added on top of it)
  stagger: { swayPx: 1, swayHz: 6, pips: 3, pipR: 8, pipHz: 1.6, ring: 18, ringLife: 0.034, openPulseHz: 2 },   // 3.
  tell: { rise: 2, riseFor: 0.08, glintLife: 0.034 },                  // 4. common foes with no tell pose: 2 px rise + a 1-frame glint at the start of the windup
  pop: { scale: 1.15, bossScale: 1.05, frames: 2, bossFrames: 3, chips: 6, frameSec: 1 / 60 },   // 5. kill pop
  boss: { resistAt: 0.6, deathSlow: 0.35, deathSlowFor: 0.6, duck: 0.63, starLife: 0.1, resistSize: 8, openSize: 12 },   // 6. resisted = grey-white star; opening = gold star; death slow-mo
};

const clamp01 = x => Math.max(0, Math.min(1, x));

/* 1. THE FLASH CURVE. Called once per drawn frame per foe; it learns where a flash STARTED (e.flash rising) so it can tell its age (e.flash counts down; in a
   hit-stop it does not, so the white sits through the whole freeze). mode 'white' = draw the white silhouette; 'tint' = the body plus a white overlay of alpha a;
   null = nothing. K is the Flashes slider (0..1): at K >= 1 the first stage is the true silhouette, below it a stronger tint, at 0 the tint alone. */
export function flashPhase(e, K = 1) {
  const f = e.flash || 0;
  if (!(f > 0)) { e.cfF0 = 0; e.cfFp = 0; return null; }
  if (!e.cfF0 || f > (e.cfFp || 0) + 0.02) e.cfF0 = f;
  e.cfFp = f;
  const f0 = e.cfF0, age = f0 - f, C = CF3.flash;
  if (f0 >= C.minWhite && age < C.whiteFor && K > 0) return K >= 1 ? { mode: 'white', a: 1 } : { mode: 'tint', a: C.tint + (1 - C.tint) * K };
  const span = Math.max(0.001, f0 - (f0 >= C.minWhite ? C.whiteFor : 0));
  return { mode: 'tint', a: C.tint * clamp01(f / span) };
}

/* 2. GENERIC HURT POSE: o is poseOf's pose AFTER its STRUCK block (3.4 px, 0.16 rad, 0.89 x 1.13). For a foe with no hurt frame this adds the delta to the plan's
   numbers (4 px, 0.22 rad, 1.12 x 0.90). Under Reduce motion the lean and the shove go to 0 (the squash stays, halved). Held while flash is frozen by the stop. */
export function hurtPose(o, e, reduce, hasHurt) {
  if (hasHurt || !(e.flash > 0)) return o;
  const k = Math.min(1, e.flash / CF3.hurt.ease), d = e.hitDir || -(e.face || 1), H = CF3.hurt, O = CF3.old;
  if (reduce) { o.dx -= d * O.dx * k; o.rot = (o.rot || 0) - d * O.rot * k; o.sx *= (1 + (H.sx - 1) * 0.5 * k) / (1 + (O.sx - 1) * k); o.sy *= (1 - (1 - H.sy) * 0.5 * k) / (1 - (1 - O.sy) * k); return o; }
  o.dx += d * (H.dx - O.dx) * k; o.rot = (o.rot || 0) + d * (H.rot - O.rot) * k;
  o.sx *= (1 + (H.sx - 1) * k) / (1 + (O.sx - 1) * k); o.sy *= (1 - (1 - H.sy) * k) / (1 - (1 - O.sy) * k);
  return o;
}

/* 3. STAGGER: +-1 px sway at 6 Hz while e.stagger > 0 (not while broken: staggerPose owns that). Reduce motion = none. */
export const swayDx = (e, now, reduce) => (reduce || !(e.stagger > 0) || e.broken > 0 || !e.alive) ? 0 : Math.round(Math.sin(now * Math.PI * 2 * CF3.stagger.swayHz) * CF3.stagger.swayPx);
/* the dizzy pips: 3 orbiting over the head (static under Reduce motion). Not drawn for a broken common foe (drawOpen's stars already ride there). */
export function pipPoints(x, y, now, reduce) {
  const S = CF3.stagger, out = [];
  for (let i = 0; i < S.pips; i++) { const a = (reduce ? 0 : now * Math.PI * 2 * S.pipHz) + i * (Math.PI * 2 / S.pips); out.push([Math.round(x + Math.cos(a) * S.pipR), Math.round(y + Math.sin(a) * S.pipR * 0.35)]); }
  return out;
}
export const openPulseAlpha = (now, reduce) => reduce ? 1 : 0.65 + 0.35 * (0.5 + 0.5 * Math.sin(now * Math.PI * 2 * CF3.stagger.openPulseHz));

/* 4. TELL RISE / GLINT: for a COMMON foe (no maxHp, not a mini) whose windup used the fallback keys (no told pose). tellRise(true) every windup frame;
   tellEnd() on the first frame it is not winding. Returns nothing; sets e.cfTellAt on the first frame. */
export function tellRise(o, e, now, reduce) {
  if (e.maxHp || e.mini) return o;
  if (!e.cfInWind) { e.cfInWind = true; e.cfTellAt = now; }
  if (!reduce && now - e.cfTellAt < CF3.tell.riseFor) o.dy -= Math.round(CF3.tell.rise * (1 - (now - e.cfTellAt) / CF3.tell.riseFor));
  return o;
}
export const tellEnd = e => { e.cfInWind = false; };
export const glintOn = (e, now) => !!(e.cfInWind && e.cfTellAt !== undefined && now - e.cfTellAt <= CF3.tell.glintLife);

/* 5/6. THE SMALL FX LIST: kill-pop silhouettes, break rings, hit stars. Ticked by world dt, drawn after the corpses (main.js beside drawDeathFx). */
export const FX = [];
export const clearFx = () => { FX.length = 0; };
export function tick(dt) { for (let i = FX.length - 1; i >= 0; i--) { FX[i].t -= dt; if (FX[i].t <= 0) FX.splice(i, 1); } }

/* a kill: returns what main.js should do. o = { boss, mini, flashK, hitstop, reduce, final }. The white pop needs Flashes > 0. */
export function onKill(e, dir, o) {
  const big = !!(o.boss || o.mini || e.big || e.elite), P = CF3.pop, B = CF3.boss, out = { chips: big ? P.chips : 0, slow: null, duck: 0 };
  if (o.flashK > 0 && e.lastSet && e.lastFrame !== undefined && FX.length < 24) {
    FX.push({ kind: 'pop', t: (o.boss ? P.bossFrames : P.frames) * P.frameSec, x: e.x, y: e.y, face: e.face || 1, set: e.lastSet, frame: e.lastFrame, s: (e.lastBigF || 1) * (o.boss ? P.bossScale : P.scale) });
  }
  if (o.boss && o.final && o.hitstop && !o.reduce) { out.slow = { t: B.deathSlowFor, k: B.deathSlow }; out.duck = B.duck; }
  return out;
}

/* 6. A BLOW ON A BOSS, after hurtEnemy0 (the wrapper reads hp before / after; dealt = what really came off). A blow that did <= 60% of its nominal outside an
   opening reads as RESISTED (grey-white star, never the clink); an opening (e.open / e.broken) gets the gold star. Never a guard (e.glancedAt === now). */
export function bossHitKind(e, dealt, dmg, now) {
  if (!e || !(e.maxHp > 0) || !(dmg > 0) || e.glancedAt === now) return null;
  if (e.open > 0 || e.broken > 0) return 'open';
  return dealt <= dmg * CF3.boss.resistAt ? 'resist' : null;
}
export function bossStar(e, kind, dir) {
  if (!kind || FX.length >= 24) return;
  const B = CF3.boss;
  FX.push({ kind: 'star', t: B.starLife, life: B.starLife, x: e.x - dir * Math.min((e.w || 12) / 2, 8), y: e.y - (e.h || 16) / 2, col: kind === 'open' ? '#ffd36b' : '#d8dde4', r: kind === 'open' ? B.openSize / 2 : B.resistSize / 2, dull: kind === 'resist' });
}
/* a poise break (rising edge of e.broken): a 1-frame white ring 18 px wide */
export function breakRing(e, K) {
  if (!(e.broken > 0)) { e.cfBrk = false; return; }
  if (e.cfBrk) return; e.cfBrk = true;
  if (K > 0 && FX.length < 24) FX.push({ kind: 'ring', t: CF3.stagger.ringLife, x: e.x, y: e.y - (e.h || 16) / 2, r: CF3.stagger.ring / 2, a: K });
}

export function drawFx(g, cx, cy, drawSet) {
  for (const f of FX) {
    const x = Math.round(f.x - cx), y = Math.round(f.y - cy);
    if (f.kind === 'pop') drawSet(f.set, null, f.frame, x, y, f.face, true, f.s, f.s, 1, 0);
    else if (f.kind === 'ring') { g.save(); g.globalAlpha = f.a; g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, f.r, 0, Math.PI * 2); g.stroke(); g.restore(); }
    else if (f.kind === 'star') { const r = Math.max(2, Math.round(f.r * (0.6 + 0.4 * f.t / f.life))); g.fillStyle = f.col; g.fillRect(x - r, y, r * 2 + 1, 1); g.fillRect(x, y - r, 1, r * 2 + 1); if (f.dull) { g.fillStyle = '#7d8590'; g.fillRect(x - r - 1, y - 2, 1, 1); g.fillRect(x + r + 1, y + 2, 1, 1); } else { g.fillStyle = '#fff6c8'; g.fillRect(x - 1, y - 1, 3, 3); } }
  }
}
export function drawPips(g, pts, ready) { g.fillStyle = ready ? '#ffffff' : '#e8e0f0'; for (const [x, y] of pts) { g.fillRect(x, y, 2, 2); } }
export function drawGlint(g, x, y) { g.fillStyle = '#ffffff'; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }
