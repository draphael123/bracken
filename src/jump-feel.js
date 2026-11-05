// src/jump-feel.js - THE PER-HERO JUMP FEEL TABLE (claude/jumpfeel, Daniel-approved 11-03, scratch/lane-reports/jumpreview.md).
// VISUAL ONLY. Nothing here is read by physics: height, gravity, coyote, buffer, air control, JUMPV, landT and every pose timer are untouched.
// It scales the squash/stretch and the dust the shared jump already throws, so a hammer-bearer no longer jumps like the Pyromancer.
//   w       weight 1 = the old shared feel (the knight family's heavy end > 1, the light heroes < 1)
//   stretch multiplier on the launch stretch's DEVIATION from 1   (the old 0.8 / 1.2 at 1.0)
//   land    multiplier on the landing squash's deviation          (the old 1.15/0.86 hop ... 1.5/0.52 big drop at 1.0)
//   landT   multiplier on the landing squash's HOLD time (visual only; landT / landArt gameplay timers are not scaled)
//   dust    multiplier on the hop / takeoff dust
//   ant     depth of the 1-tick press squash (anticipation): the sprite is drawn wide and short for exactly one frame, THEN the stretch
export const JUMP_FEEL = {
  paladin:   { w: 1.30, stretch: 0.70, land: 1.30, landT: 1.40, dust: 1.35, ant: 0.10 },
  berserker: { w: 1.22, stretch: 0.74, land: 1.26, landT: 1.32, dust: 1.28, ant: 0.10 },
  knight:    { w: 1.12, stretch: 0.84, land: 1.16, landT: 1.18, dust: 1.14, ant: 0.09 },
  geomancer: { w: 1.10, stretch: 0.86, land: 1.14, landT: 1.18, dust: 1.12, ant: 0.09 },
  warden:    { w: 1.06, stretch: 0.90, land: 1.10, landT: 1.12, dust: 1.08, ant: 0.09 },
  reaper:    { w: 1.00, stretch: 1.00, land: 1.00, landT: 1.00, dust: 1.00, ant: 0.08 },   /* Blood Knight: medium (the greatsword drag already sells his weight) */
  pirate:    { w: 0.92, stretch: 1.12, land: 0.90, landT: 0.88, dust: 0.92, ant: 0.07 },
  ranger:    { w: 0.84, stretch: 1.22, land: 0.82, landT: 0.82, dust: 0.84, ant: 0.06 },
  rimebinder: { w: 0.9, stretch: 1.12, land: 0.9, landT: 0.9, dust: 0.8, ant: 0.07 },   /* (claude/rimebinder: the Geomancer's robe, lighter) */
  pyro:      { w: 0.80, stretch: 1.26, land: 0.78, landT: 0.78, dust: 0.80, ant: 0.06 },
};
const NEUTRAL = { w: 1, stretch: 1, land: 1, landT: 1, dust: 1, ant: 0.08 };
export const feel = (hero) => JUMP_FEEL[hero] || NEUTRAL;
const dev = (v, m) => 1 + (v - 1) * m;
/** the launch stretch [sx, sy] for a hero (the old shared value is 0.8 / 1.2) */
export const stretchOf = (hero, sx = 0.8, sy = 1.2) => { const f = feel(hero); return [dev(sx, f.stretch), dev(sy, f.stretch)]; };
/** the 1-tick anticipation squash [sx, sy]: wide and short */
export const antOf = (hero) => { const f = feel(hero); return [1 + f.ant * 1.4, 1 - f.ant]; };
/** a landing squash [sx, sy, t] scaled for the hero */
export const landOf = (hero, sx, sy, t) => { const f = feel(hero); return [dev(sx, f.land), dev(sy, f.land), t * f.landT]; };
/** extra side-puff dust for a landing: hops get a real puff (they had 4 flat), scaled by the fall speed and the weight */
export const hopDust = (hero, fallV, tier) => { const f = feel(hero); if (tier > 0) return Math.round((f.dust - 1) * 4); return Math.max(1, Math.round((2 + Math.min(3, Math.max(0, (fallV - 60) / 70))) * f.dust)); };
/** the takeoff puff: more when running (dragged back), scaled by the weight */
export const takeoffDust = (hero, vx) => { const f = feel(hero); return Math.max(1, Math.round((1 + Math.min(2, Math.abs(vx) / 60)) * f.dust)); };
