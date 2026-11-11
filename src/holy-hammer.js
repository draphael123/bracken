// src/holy-hammer.js - THE HOLY HAMMER's flight, pure and node-testable (claude/palrework, paladinplan.md s5). No game state in here: main.js owns the list of hammers, the hits and the walls,
// and asks hammerPath(mode, t, origin, face, cfg) for where the hammer is at time t. Only 'corkscrew' exists now (the Diablo-2 side view of the Blessed Hammer: the centre advances
// at cfg.speed for cfg.life s while the hammer loops round it at radius cfg.loopR, cfg.loops turns). The L22 forks add 'spiral' (round HIM) and 'homecoming' (out and back) here.
export const MODES = ['corkscrew', 'spiral', 'homecoming'];   // (claude/repoint) the L22 forks: SPIRAL = round HIM, HOMECOMING = straight out and back
export function hammerPath(mode, t, origin, face, cfg) {
  if (mode === 'spiral') {   // SPIRAL (pspiral): two turns round him (origin = his live centre), out to r and in again, an ellipse in the side view
    const lf = cfg.life, uu = Math.max(0, Math.min(1, t / lf)), ang = uu * cfg.turns * Math.PI * 2, rr = cfg.r * Math.min(1, uu * 5) * Math.min(1, (1 - uu) * 5 + 0.15);
    return { cx: origin.x, cy: origin.y, x: origin.x + Math.cos(ang) * rr, y: origin.y + Math.sin(ang) * rr * 0.5, ang, adv: 0 };
  }
  if (mode === 'homecoming') {   // HOMECOMING (phomeward): out to cfg.reach and home again on one sine, the same small loop riding it
    const lf = cfg.life, uu = Math.max(0, Math.min(1, t / lf)), adv = cfg.reach * Math.sin(uu * Math.PI), ang = uu * cfg.loops * Math.PI * 2, cx = origin.x + face * adv;
    return { cx, cy: origin.y, x: cx + Math.sin(ang) * cfg.loopR * 0.55 * face, y: origin.y - Math.cos(ang) * cfg.loopR, ang, adv };
  }
  const life = cfg.life, u = Math.max(0, Math.min(1, t / life)), adv = cfg.speed * Math.min(t, life);
  const ang = u * cfg.loops * Math.PI * 2;                       // the loop's phase: 2.5 turns over its whole life
  const cx = origin.x + face * adv, cy = origin.y;                // the centre of the loop
  return { cx, cy, x: cx + Math.sin(ang) * cfg.loopR * 0.55 * face, y: cy - Math.cos(ang) * cfg.loopR, ang, adv };   // an ellipse in the side view: tall and a little narrow, ankle to head
}
/* the band of height (px above/below the centre) the hammer sweeps: the loop radius plus its own box */
export const hammerBand = cfg => cfg.loopR + (cfg.box || 6);
/* the damage law: swordDmg x k x amul, rounded, never under 1 */
export const hammerDmg = (sword, cfg, amul = 1) => Math.max(1, Math.round(sword * cfg.k * amul));
/* the input tiers by pips at an UP+C press: 0-2 nothing (a buzz), 3-4 the hammer, 5 SUNFALL */
export function upCTier(pips, cfg) { return pips >= 5 ? 'sunfall' : pips * 20 >= cfg.need ? 'hammer' : 'none'; }
/* a tap of C by pips under PAL_MACE: at 5 it spends 4 (RADIANCE+), the ultimate being UP+C now */
export function tapTier(pips, palMace) { if (pips >= 5) return palMace ? 'radiancePlus' : 'sunfall'; return pips >= 4 ? 'radiancePlus' : pips >= 3 ? 'radiance' : pips >= 2 ? 'twin' : pips >= 1 ? 'smite' : 'none'; }
