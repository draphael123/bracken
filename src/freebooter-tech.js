// src/freebooter-tech.js - THE FREEBOOTER'S L25-L50 TECHNIQUES, numbers and pure rules (claude/freebooterpack; the data and card text are src/tech-freebooter.js). No world in here: main.js owns the frame
// and calls these where his own code already is (swingDmg's powder mark, hookCatchRaise / catchVerdict, throwHook, firePistol, the heavy-seas and boarding skills, updateKegs, the ultimate).
// THE LAW (brief-l50abilities sec 4): every new blow is swordDmg x k x amul (the old pistol ball keeps its own number and only ever gets a multiplier); a boss takes the damage and its resist
// floor, never a free stagger, a pin or an immunity; a foe takes at most one hit of a technique per use; nothing here heals; FX dice are Math.random on particles only. His resource is the PURSE
// (P.plunder): both capstones are the one ultimate input (UP+C at a FULL purse; a plain C is still the hook catch) and a pick replaces BLACK FLAG; both empty the purse.
export const FT = {
  steel: { mul: 1.2, plunder: 6 },                         /* L25 STEEL AFTER SMOKE: the first cut into a ball-marked foe (POWDER AND STEEL is x1.5 already) is x1.2 more and pays 6 plunder, once per mark */
  slip: { cd: 0.55, perfect: 0.28 },                       /* L30 A SLIPKNOT: the next catch in 0.55 s (was 0.85); the perfect beat 0.28 s (was 0.2) */
  haul: { k: 0.6, mark: 2.5 },                             /* L30 B HAUL AND BALL: a hauled foe is cut at x0.6, powder-marked 2.5 s, and the next ball is instant + point-blank */
  long: { from: 80, mul: 1.3, plunder: 10 },               /* L35 LONG SHOT: a ball from 80+ px: x1.3, +10 plunder */
  tide: { reach: 1.5, stagger: 2.0, coin: 3, cap: 3 },     /* L40 A HIGH TIDE: heavy seas reach x1.5 (160 -> 240), small foes down 2.0 s (was 1.3), +3 plunder for each of up to 3 knocked over */
  quick: { cdMul: 0.5, reach: 40, plunder: 8 },            /* L40 B QUICK BOARD: boarding cd x0.5, +40 px reach, the first foe cut pays 8 plunder */
  splinter: { k: 0.6, r: 36, cap: 3, stagger: 0.5 },       /* L45 SPLINTER SHOT: up to 3 foes within 36 px of the one the ball hit take x0.6 and 0.5 s stagger (a boss/mini is never the splinter's target) */
  raid: { t: 7, mul: 1.25, reload: 0.35, wind: 10 },       /* L50 A THE RAIDING HOUR: 7 s, cutlass x1.25, the ball reseats 0.35 s after it is spent, each kill 10 wind */
  keg: { k: 4.0, shotK: 5.5, fuse: 2.0, r: 80, shotR: 110, speed: 90, roll: 1.2, knock: 320, stagger: 1.5 },   /* L50 B THE GREAT KEG: rolled lit, blows in 2 s (4.0 swords, r80) or shot (5.5, r110); small foes thrown and staggered, a boss: damage only */
};
/* upgrade multipliers by rank 0 / I / II */
export const UP = { purse: [1, 1.2, 1.4], catchw: [1, 0.85, 0.75], ball: [1, 1.08, 1.16], load: [1, 0.85, 0.7], hook: [1, 1.2, 1.4], keg: [1, 0.85, 0.7], broad: [1, 1.12, 1.24], cut: [1, 1.06, 1.12] };
const rank = r => Math.max(0, Math.min(2, r | 0));
export const upMul = (key, r) => UP[key][rank(r)];
/* L25 STEEL AFTER SMOKE: the multiplier on the FIRST cut into a ball-marked foe (the x1.5 POWDER AND STEEL stays main.js's own); `fresh` = this mark's first cut has not landed yet */
export const steelCut = (owned, marked, fresh) => owned && marked && fresh ? { mul: FT.steel.mul, plunder: FT.steel.plunder } : { mul: 1, plunder: 0 };
/* L30 A SLIPKNOT: the catch's own numbers (cd = the wait to the next press, perfect = the beat, in s) */
export const catchNums = (owned, base) => owned ? { cd: FT.slip.cd, perfect: FT.slip.perfect } : { cd: base.cd, perfect: base.perfect };
/* STEADY CATCH: the wind a plain catch costs */
export const catchCost = (bc, r) => Math.max(1, bc * upMul('catchw', r));
/* L30 B HAUL AND BALL: what the hauled foe takes, and whether the next ball is seated instant + point-blank */
export const haulNums = owned => owned ? { k: FT.haul.k, mark: FT.haul.mark, ball: true } : { k: 0, mark: 0, ball: false };
/* L35 LONG SHOT (+ HOT BALL): the ball's multiplier and plunder for a mark `d` px away */
export const shotFar = (owned, d) => owned && d >= FT.long.from ? { mul: FT.long.mul, plunder: FT.long.plunder } : { mul: 1, plunder: 0 };
export const ballMul = (r, far) => upMul('ball', r) * far.mul;
/* L45 SPLINTER SHOT: up to `cap` small foes within `r` px of the one hit (candidates {x, y, big}); never the first foe, never a boss/mini */
export function splinterTargets(foes, hit, owned) {
  if (!owned || !hit) return [];
  return foes.filter(e => e !== hit && !e.big && Math.abs(e.x - hit.x) <= FT.splinter.r && Math.abs(e.y - hit.y) <= 40).sort((a, b) => Math.abs(a.x - hit.x) - Math.abs(b.x - hit.x)).slice(0, FT.splinter.cap);
}
/* L40 A HIGH TIDE: the wave's reach, the small foes' stagger, the knocked-over count that pays */
export const tideNums = (owned, base) => owned ? { reach: Math.round(base * FT.tide.reach), stagger: FT.tide.stagger, coins: FT.tide.cap } : { reach: base, stagger: 1.3, coins: 0 };
/* L40 B QUICK BOARD: cd and reach */
export const boardCd = (base, owned) => base * (owned ? FT.quick.cdMul : 1);
export const boardReach = (base, owned) => owned ? base + FT.quick.reach : base;
/* the other cooldown upgrades, the purse, the reload */
export const kegCd = (base, r) => base * upMul('keg', r);
export const purseGain = (n, r) => n * upMul('purse', r);
export const reloadOf = (base, r, raiding) => raiding ? Math.min(base, FT.raid.reload) : base * upMul('load', r);
export const hookReach = (base, r) => Math.round(base * upMul('hook', r));
/* L50 A THE RAIDING HOUR: the cutlass multiplier while it runs */
export const raidMul = raiding => raiding ? FT.raid.mul : 1;
/* L50 B THE GREAT KEG: the blast for how it went off (shot = the pistol set it off), and whether a keg is in the ball's line (kegs = [{x, y, great, boom}], from the muzzle, facing f, reach px) */
export const kegBlast = (shot, big) => ({ k: shot ? FT.keg.shotK : FT.keg.k, r: shot ? FT.keg.shotR : FT.keg.r, knock: big ? 0 : FT.keg.knock, stagger: big ? 0 : FT.keg.stagger });
export function kegInLine(kegs, x0, y0, f, reach) {
  let best = null, bd = 1e9;
  for (const k of kegs) { if (!k.great || k.boom) continue; const d = (k.x - x0) * f; if (d < -6 || d > reach || Math.abs((k.y - 6) - y0) > 14) continue; if (d < bd) { bd = d; best = k; } }
  return best;
}
/* a rolling keg keeps rolling for FT.keg.roll s unless a wall is in front of it */
export const kegRolling = (t, blocked) => t < FT.keg.roll && !blocked;
