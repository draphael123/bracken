// src/gq5p.js - GQ5P: THE GOBLIN PRINCESS FIGHTS WITH HER BLADE (Daniel 11-12 14:04; scratch gq5-plan.md section 2). One switch, default OFF: OFF = claude/gq5fix's Princess move for move.
// ON: her bell mechanic is retired (no rope, no bell ring, no bolt for the hatch, no grate pin, no RING plate; the bell stays as silent dressing; HOP + perch leave her chains)
//     and three melee moves join them: HEEL DASH, CURTSY CUT, TANTRUM COMBO (phase two only). Resist floor 0.4x untouched.
// The override: ?gq5p=1 on the page, globalThis.BRACKEN_GQ5P = true (tools/cdp.mjs sets it from the env BRACKEN_GQ5P=1), or BRACKEN_GQ5P=1 in a Node tool's env.
export const GQ5P_SHIPS = false;
export function gq5pOn() {
  if (GQ5P_SHIPS) return true;
  try { if (globalThis.BRACKEN_GQ5P === true || globalThis.BRACKEN_GQ5P === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gq5p=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_GQ5P === '1') return true; } catch { /* no node */ }
  return false;
}
export const P5 = gq5pOn();
/* the plan's numbers (px; 1 tile = 16). Tune back in the plan's order: heel.dmg 18 -> 14; curtsy.dmg2 16 -> 13; gap [0.5,0.4] -> [0.6,0.5] (GAP5); hp 1080 -> 980 last. */
export const G5 = {
  heel: { tell: 0.6, tiles: 5, speed: 300, boxW: 16, boxH: 24, dmg: 18, stumble: 0.8, minDist: 64 /* 4 tiles: she dashes only when you are further than this */, stagger: 1.0, push: 120 },
  curtsy: { tell: 0.5, dmg1: 12, w1: 32, h1: 10, t1: 0.3 /* hit 1 -> hit 2 */, dmg2: 16, w2: 24, h2: 32, t2: 0.3, stagger: 1.5 },
  tantrum: { tell: 0.5, dmg: 10, reach: 24, gap: 0.25, overTell: 0.35, overDmg: 22, overW: 24, overH: 32, overT: 0.2, recover: 0.6, stagger: 1.5 },
};
export const GAP5 = [0.5, 0.4];   /* (the plan keeps her gap; the first tune-back lever is [0.6, 0.5]) */
