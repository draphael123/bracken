// THE WEIGHT IS SHARED: a stronger blow stops and throws harder; a chain spends the breath a fresh jump saved.
/* commonDamage 1.25 -> 1.6 (claude/combat3, Daniel 2026-10-01: HOLLOW KNIGHT / SALT & SANCTUARY - "damage tuned so a level-1 hero must play carefully") */
export const COMBAT = { garrison: .75, commonDamage: 1.6, flinch: .12, stagger: .42, staggerDamage: 18, corpseLinger: .65, finishHealth: .35, finishMul: 2.2 };
/* FEWER HEARTS (claude/combat3, Daniel 2026-10-01): a crate holds a heart one time in ten (was 0.3), and an elite captain pays his gold and no
   heart (was a heart every time). The shut room's heart, the dead-end stash hearts and the heart for a boss stay: each is a designed reward. */
export const HEAL = { crate: 0.1, eliteHeart: false };
export const CHAIN_MULT = [1, 1.6, 2.5];
export const chainCost = (base, count=0) => Math.ceil(base*CHAIN_MULT[Math.min(CHAIN_MULT.length-1,Math.max(0,count))]);
export const impactPause = damage => .025 + Math.min(.085,Math.max(0,damage)/360);
export const hitStagger = (damage,heavy=false) => heavy||damage>=COMBAT.staggerDamage?COMBAT.stagger:COMBAT.flinch;
export const COMMON_BLOWS = ['sprig','shield','archer','spit','wasp','hound','sapper','sporeling','lurker','spitcap','weaver','thief','pike','harpy','goat','miner','bat','cutter','snuffer','sailer','wight','rockgoblin','marine','cutlass','boarder','soldier','javelin','courtier','swornCut','runnerStab','scarecrow','farmhand'];
