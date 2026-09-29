# claude/followups - four small decided follow-ups (Sonnet lane)

Branch claude/followups, based on claude/batch44 (ed4b0e7). origin/master merged: already up to date.

## What changed
1. Death cost softened (src/main.js deathCost). A second death only destroys the existing bundle if THAT death drops something (gold, purse or XP > 0).
   Dying carrying nothing leaves the bundle where it lies and it can still be picked up. tools/death-cost.mjs: case D (drop something -> old bundle gone)
   kept, new case D2 (die with nothing -> bundle unchanged, still recoverable). D2 failed on the base main.js, passes now.
2. Hedge warden hint cap. "GREEN WOOD: DRIVE HIM TO THE FIRE" (the hint banner, not the floating word) shows at most 2 times per save: PROG.hedgeHint,
   defaulted to 0 in progDefaults (old saves migrate to 0). tools/boss-openings.mjs asserts: 1st and 2nd fell show it, 3rd and 4th do not, counter = 2.
   The new assertion failed on the base (hint showed all 4 times).
3. Folly Archmage eased: ARCH.openMul 3 -> 4 (src/main.js). Stage 3 keeps its 3.2.
4. Gorm's litter prop widened: PROP.palanquin baked 64x30 (was 48x30) and drawn 96x45 (was 72x45, same 1.5x scale, same style); all four draw sites re-centred. Art only.
   The 4-tile solid throneBlock hitbox is unchanged (64 px).

## Folly Archmage pilot (tools/folly-pilot.mjs, salt 1, normal health, 240 s cap)
- Before (x3): knight death 72.7 s, warden death 37.6 s, pyro death 52.1 s = 0/3
- After (x4): knight death 46.8 s, warden WIN 94 s, pyro death 33.9 s = 1/3 (target met: >= 1/3). Not tuned further.

## Checks (all green)
death-cost, archmage-folly, boss-openings (hedge warden), progression, progression-runtime, architecture, checkpoints, skins, dangling-paths,
boss-fight-end, slopes-trace, npc-removal. textfit runs to completion (exit 0, 912 s); its 11 findings are all pre-existing hints/strings in other places
(none is the hedge hint, Gorm, or death-cost text).
Note: textfit takes > 10 min here, so it needs a long timeout.

## UNVERIFIED
- Gorm's new litter was not looked at in a screenshot; only the suite and boss-fight-end (King's fight included) ran.
- The pilot is 1 seed x 3 heroes, so 1/3 is a small sample.

## QUESTIONS FOR DANIEL
- Archmage is still hard for knight and pyro at 1/3. Recommendation: leave it, watch the wider release pilot before another nudge.
- Litter hitbox (64 px solid block) is now visibly narrower than the 96 px picture. Recommendation: leave, it is the old 72 vs 64 relation stretched a little.
