# Stormwreck Harbor expansion

The harbor is now 1,080 tiles wide, up from 360. The original quays, customs hold, salvage cranes and Salvage Captain remain. The Captain now guards the inner harbor; the Breakwater Warden is the final boss.

## New route

- Storm market: elevated walkways over shield-and-shooter encounters, with a lower route through the stalls.
- Pump basin: a submerged route below sentries and an overhead maintenance walk. Permanent nets lead out of the water.
- Drydock ship: fixed stairs at both ends, a raised quarterdeck, masts and rigging, boarders and a silver reward.
- Cargo warehouse: two galleries, permanent stairs, an optional lift and interior shelter from the rain.
- Exposed breakwater: timed gusts, water gaps, birds and ranged threats, with nets for recovery.
- Lighthouse road: a climb to the last silver, a visible lighthouse and a checkpoint before the final arena.

There are 21 checkpoints across the complete built level; the largest gap is 72 tiles. The three silver rewards are at tiles 150, 624 and 974. The bronze/silver/gold time thresholds were extended for the longer journey (gold 850 seconds, silver 1,200, bronze 1,700).

## The Breakwater Warden

An armored harbor guardian with a unique brass-and-teal sprite, heavy anchor, harpoon, helmet vent, boss introduction, health bar, bestiary entry, voice and boss-rush registration.

Four regular attacks: guardable anchor sweep, jumpable low surge, aimed guardable harpoon, and marked pressure columns. At half health, a high surge makes the floor safe while threatening raised platforms, and twin pressure vents create a gap to stand in. Every attack has a warning and a recovery opening. The open helmet increases damage by 30%; blocking the anchor grants a longer opening. No summoned adds.

Two permanent raised platforms offer options against the low surge. The teaching sign and bestiary describe the responses. Defeating the Warden clears its projectiles, opens the arena and completes the level.

## Validation

All six classes climbed the drydock and lighthouse routes through actual movement/jump inputs with fresh progression. Static traversal reaches every checkpoint, silver and exit without requiring moving platforms. Unit probes verify warning delays, safe responses, phase-two attacks and recovery windows. Browser verification covers both Harbor encounters, final checkpoint retry, gate opening and completion. A retry now preserves the already-defeated Salvage Captain.

| Class | Normal-health clear | Health remaining | Refill timing |
|---|---:|---:|---:|
| Knight | 98.8 s | 35 | 97.5 s |
| Warden | 128.3 s | 47 | 131.2 s |
| Pyromancer | 137.2 s | 24 | 144.2 s |
| Paladin | 119.7 s | 100 | 117.2 s |
| Pirate | 93.3 s | 70 | 90.8 s |
| Reaper | 106.8 s | 19 | 106.8 s |

These are automated solo probes using a mechanic-aware pilot. They are not human/co-op acceptance tests or full campaign balance results. Refill timings measure fight duration separately from survival. Screenshots of all new sections and boss warning states were inspected; the boss screenshots use staged attack states.

The broader floating-object investigation remains open; this expansion does not establish that all scenery problems have been fixed. This change is local and has not been pushed or deployed.
