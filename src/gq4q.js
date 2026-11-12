// src/gq4q.js - GQ4Q: THE GOBLIN QUEEN, PASS 4 (Daniel 11-10 07:45 + 08:15, scratch gq4-plan.md sections 4 + 5). One switch, default OFF: OFF = master's Queen cell for cell.
// ON: P1 gets THE HEARTH JET + THE SCEPTRE REACH in THE GEODE THRONE hall, her geode and portal shards can be knocked out by ANY blow or hero shot (src/hero-strikes.js),
// and P2 is rebuilt Gorm-like: stone shards knocked home are the damage (3% each, 6 inside 10 s = DAZED then a ward), shard volley / portal boulder / rockfall / bombardment, blink = movement only,
// an ENRAGE at 25% (THE MOUNTAIN FALLS). The override for review and the lanes: ?gq4q=1 on the page, globalThis.BRACKEN_GQ4Q = true (tools/cdp.mjs forwards BRACKEN_GQ4Q=1), or BRACKEN_GQ4Q=1 in a Node tool's env.
export const GQ4Q_SHIPS = false;
export function gq4qOn() {
  if (GQ4Q_SHIPS) return true;
  try { if (globalThis.BRACKEN_GQ4Q === true || globalThis.BRACKEN_GQ4Q === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gq4q=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_GQ4Q === '1') return true; } catch { /* no node */ }
  return false;
}
export const Q4 = gq4qOn();
/* the numbers (starting values for the tune lane) */
export const Q4N = {
  hearth: { tell: 1.0, jet: 0.6, dmg: 12 /* (GQ4TUNE r1: 16 -> 12; baseline crown n=6/hero 0/18) */, cd: 12, knee: 14, firstCd: 6 },
  reach: { tell: 0.8, jab: 0.25, dmg: 14, cd: 8, minDist: 100, behind: 30, stagger: 1.5, mul: 1.15, cap: 0.08, hw: 20 },
  p1: { dmgK: 0.65, knockChip: 0.02 },   /* r4: dmgK 0.7 -> 0.65 */   /* (GQ4TUNE r3) x on every hall blow she throws through gqHit */
  shardHurt: 9,                                            // blow hurtbox r for a shard (was 6)
  p2: { dmgK: 0.6, hp: 1000 /* (GQ4TUNE-t: 1200 -> 1000, n=12/hero) r3: 1500 -> 1200 */, chip: 0.5 /* (GQ4TUNE-t: 0.4 -> 0.5, GQ3's own 0.5x; above the 0.4 floor) */, shardPct: 0.08 /* (GQ4TUNE-t: 0.05 -> 0.08) r4: 0.03 -> 0.05; r3 crown P2 bars 50-85% at death: her bar drained ~5 hp/s, a standard bot homes ~1 shard in 6 s */, flinch: 0.4, dazeN: 4 /* r4: 6 -> 4 in 10 s */, dazeWin: 10, daze: 2.5, dazeMul: 1.25, dazeCap: 0.08, ward: 3.0, capLive: 9, home: 320,
    volley: { tell: 0.6, v: 240, dmg: 4, cd: 2.5 /* r3: back to the plan (4 / 2.5 s): fewer shards = fewer homes = a slower kill; the P2 dmgK carries the easing */, cdRage: 1.9, n: 3, vSlow: 160 },
    boulder: { tell: 0.8, air: 0.75, dmg: 9, cd: 7, hang: 1.0, r: 18 },
    rockfall: { tell: 0.8, n: 6, shadow: 1.0, dmg: 6, cd: 10, r: 12 },
    bombard: { at: [0.7, 0.45], dur: 6.0 },
    addAt: [0.8, 0.55], bayEvery: 12,
    rage: { at: 0.25, tell: 2.0, tempo: 1.2 /* r4: 1.35 -> 1.2 */, mtn: { tell: 1.5, cols: 26, gap: 36, sweep: 1.4, dmg: 4 /* r4: 6 -> 4 */, cd: 14, geode: 12, hang: 1.5, shards: 6 } } },
};
