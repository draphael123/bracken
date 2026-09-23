# THE MOTHER CAP, HARDER — small batch brief (queued after THE BURNING VILLAGE, before the Burial rework; Daniel 2026-09-21)

## What Daniel said
"It is way, way too easy... I like the general design, it just needs challenge." He approved all six changes below.

## Why it is easy (read from src/main.js updateMother ~16447, motherPattern, motherZones)
- ONE attack then an idle of 2.5 s (phase 2: 1.7 s): most of the fight she is doing nothing.
- A FIXED rotation: `turn=(attackN-1)%(phase===2?9:7)` - learnable in one cycle.
- Tells 0.8-1.15 s. Nothing ever overlaps. Phase 2 only adds two patterns and a shorter idle.
- Evidence: the pilot's last run was 6/6 normal-health clears with ZERO damage taken (99-113 s).

## The six changes (keep her design, her tells and marks, and the touch rule)
1. **Cut the downtime.** Idle 2.5 -> ~1.2 s (phase 2: ~0.7 s); tells 15-25% shorter, still readable.
2. **She reads you.** Replace the fixed rotation with a no-immediate-repeat shuffle weighted by position: high on the
   shelves -> capClap / sporeSweep; on the floor -> rootStab / floorSurge; far back -> sporeVolley. No safe spot to wait in.
3. **Layers in phase 2** (memory lesson: bosses need concurrent layers): a floor pattern paired with a projectile at once
   (floorSurge + sporeVolley, rootColumns + seedRain), and her gills drop 2-3 SPORELINGS (adds) so there is always
   something between her attacks. Cap the adds (never more than 3 alive).
4. **The creeping floor.** Phase 2: poison mycelium spreads slowly in from the arena edges (standing on it = P.venomT);
   it tightens the longer the fight runs and is pushed back when she dies. Never covers the centre where the node/opening is.
5. **Phase 3 under 25%.** Desperation: background seed rain throughout, roots faster, her opening window shorter.
6. **Hits hurt a little more.** Root zones 16 -> 22, cap clap 18 -> 24 (pressure does most of the work, not numbers).

## Done means
- The mother-cap / mother-pilot tools updated (they pin her current timings), tells.mjs marks for any new tell, `!` vs red ✕ kept.
- Pilot at NORMAL health, >= 21 runs: she now lands real damage and wins sometimes - target ~60-75% bot wins, not 6/6 untouched.
- ONE `npm run check`, commit, push, deploy, verify (KICKOFF credit rules). No screenshot needed unless the mycelium art is new.
