// THE WEIGHT IS SHARED: a stronger blow stops and throws harder; a chain spends the breath a fresh jump saved.
export const COMBAT = { garrison: .75, commonDamage: 1.25, flinch: .12, stagger: .42, staggerDamage: 18, corpseLinger: .65, finishHealth: .35, finishMul: 2.2 };
export const CHAIN_MULT = [1, 1.6, 2.5];
export const chainCost = (base, count=0) => Math.ceil(base*CHAIN_MULT[Math.min(CHAIN_MULT.length-1,Math.max(0,count))]);
export const impactPause = damage => .025 + Math.min(.085,Math.max(0,damage)/360);
export const hitStagger = (damage,heavy=false) => heavy||damage>=COMBAT.staggerDamage?COMBAT.stagger:COMBAT.flinch;
export const COMMON_BLOWS = ['sprig','shield','archer','spit','wasp','hound','sapper','sporeling','lurker','spitcap','weaver','thief','pike','harpy','goat','miner','bat','cutter','snuffer','sailer','wight','rockgoblin','marine','cutlass','boarder','soldier','javelin','courtier','swornCut','runnerStab','scarecrow','farmhand'];
