# claude/underwell - THE UNDERWELL, the Opus greybox (2026-10-05)

Base: master 2423ff42 (batch68). Master did not move during the lane. Brief + structure: docs/concepts/the-underwell.md (the as-built and the
notes for the reviewer and the art pass are at its end).

## What it is
The old cistern tunnels under THE WELL TOWN, on the main road between the town and THE RED GORGE (LEVELS: appended; welltown > underwell >
redgorge by `needs`; a map node at (140,156) on the desert road). Boss: THE CISTERN QUEEN (src/cistern-queen.js, as WELLTOWN5 benched her).

THE RULE (src/level.js rule line): OIL SEEPS DOWN HERE. A TORCH SETS IT BURNING, THE BROOD WILL NOT CROSS FIRE, AND ONLY WATER PUTS IT OUT.
Two verbs change its state: LIGHT (strike a wall torch, or THE GREAT LAMP's chain) and POUR (the Well Town's skin, carried down by `L.skinRule`):
a pour puts fire out, and oil poured BEFORE it burns is wet and will not catch (a firebreak). The state is drawn per cell (oil / burning /
wet / spent). Fire burns a brood nest away, boils a drip dry, burns a rope to ash (hung again on a respawn), drives a sandworm under, holds
the brood back and burns them, and burns you. A blade on a nest turns off it: the nest spits venom and spills its brood.

Sections: THE DRY WELL (teach: climb down, torch -> nest, drip -> old oil fire) / THE BROOD HALL (THE GREAT LAMP set piece, the brood chamber,
checkpoint one + spring) / THE OIL WORKS (the firebreak: the rope up stands in the oil the torch lights; a fire scorpion beside it; the back
scaffolds if the rope burns; the upper works, THE DRY FOUNTAIN, an old oil fire) / THE SILTED SUMP (THE BURNING GUTTER set piece over three
sandworm beds; checkpoint two) / THE LAMP STAIR (the exam: drip, torch, gutter over a worm bed, nest, oiled brood room, two old oil fires,
a spitter; checkpoint three + spring) / THE QUEEN'S CISTERN (drop down the old shaft).

Themed key: three BRASS TAPS (HUD TAPS n/3) -> THE DRY FOUNTAIN runs (a spring from then on) and its vault pays a silver. Silvers: 3.

Cast (Daniel 10-05/approved: scorpions and sandworms in elements; no new AI): venom 11 (34%), oil 4, dust 3, thirsty 3, fire 3, spitting 4
(the slinger's AI: the reskinned ranged foe), sandworm 4, THE OLD STINGER (elite). New skins: OIL (its sting and death leave a slick that
joins the oil), DUST (a claw that lands: grit in your eyes, the screen closes in 2.2 s), THIRSTY (drawn to your skin from 260 px; a sting
that lands drinks a sip), SPITTING (a venom glob, 12 in the Underwell, a venom stack). Each has its recolour (src/redraw/underwell_art.js),
corpse skin (DF2_CORPSE), bestiary card and name, and the scorpion's / slinger's marks rows (the AI's own tells).

## Files
New: src/underwell.js (builder), src/underwell-hands.js (the rule, the cast's twists, glint + nudge), src/redraw/underwell_art.js (greybox
art), tools/underwell.mjs (the level's check, in check.mjs), tools/underwell-route.mjs (real-keys route pilot, not in the suite).
Small edits: src/main.js (import, TIER, corpse map, 4 bestiary rows, sprites, spawn no-ops, hooks in updateDesertFoe: preStep / fear / heat /
onBlow / onHit / the glob, onDeath, pourables, the hands' ctx, reset/update/draw/interact calls, tap icon, backdrop, map node + path,
spitter size, spitter glob dmg), src/level.js (import + LEVELS row; redgorge needs underwell), src/well-town-hands.js (on for L.skinRule,
drip line, the Underwell's oil fires scorch 14), src/cistern-queen.js (hp 1000 -> 1400, every blow x1.43), src/cistern-queen-hands.js
(her phase music only in a hall on her own theme), src/stuck-spots.js (STUCK_HANDS.underwell), src/hint-lines.js, src/threat.js (four
gadget rows at 0), tools/level-quality.mjs (GATE += underwell; roles read a reskin by its own skin when listed; thirstscorpion runs),
tools/one-new-foe.mjs (NEW_EXACTLY: underwell sandworm, redgorge raptor), tools/redgorge.mjs (road), tools/boss-openings.mjs (finds her
level), tools/boss-fight-end.mjs (holds her soaked), tools/check.mjs (+underwell), docs/level1-pilot.json + docs/mash-bot.json (stamped).

## Numbers
- THE CISTERN QUEEN, human bot (tools/harnesscard-rates.mjs underwell --mode=new, L31, 20 seeds a hero spent in all):
  hp1000 x1.0: 12/12 (100%) -> hp1300 x1.3: 8/12 -> hp1400 x1.3: 13/18 -> FINAL hp1400 x1.43: knight 3/6, warden 1/6, pyro 6/6 = 10/18 = 56%.
  Fights 76-124 s. Mash bot 0/6 (dead every time, boss left 81-98%).
- Level mash bot (L31, machines on): knight lowest 19%, warden 25%, pyro 28% (before the nest venom / oil heat: 54-70%).
- Level-1 pilot (knight, 3 runs): 35 blows, 3 deaths, 78 lifts (welltown 42/4, redgorge 12/3).
- Real-keys route pilot (tools/underwell-route.mjs): ALL 7 HEROES walk the whole route on base movement (god, no foes, 0 lifts).
  Level 1, every foe alive, a careless hand: knight 1 death, pyro 1 death, warden 3 deaths in the oil works (that leg lifted once), lowest 0%.
- level-quality underwell: CLEARS THE BAR (flat 12%/terrain under 60%, 10 bands, 6+ gadget kinds, 3 checkpoints at one per 176 route tiles,
  1.11 encounters a screen, roles melee/ranged/runner, pilot + mash ok).

## Checks run (all green unless said)
underwell, level-quality (all gated), mash-gate, architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace (unchanged
for every level; the Underwell is not in its trace list, so no rebase), npc-removal, cistern-queen, boss-openings, desert-foes2, corpses,
goblin-lint, stuck (static + runtime), welltown, redgorge, steam-works, boss-greed, map-spacing, map-grammar, one-new-foe, hint-shown, tells,
answer-tags, threat-holes, sprinkle-cap, signs, boss-music, audio-assets, comments, homepaths.
RED, NOT MINE: djinn ("djinn|upsurgeTell wears !! (src/marks.js agrees)" - red on the base sha 2423ff42 too, checked in a throwaway worktree:
src/marks.js has no djinn|upsurgeTell row).

## UNVERIFIED
- No Daniel playtest (the Queen's gate). No human eye on the greybox art. The level-1 band per act is COMBAT PART 2's (not on this base):
  the pilot row is compared with the desert's (above), not a band.
- tools/combat-pilots.mjs not run (harnesscard-rates is the boss bot used); welltown-route / redgorge-route not re-run (their levels' data did
  not change; welltown's oil-fire heat is unchanged there).
- claude-welltown5.md, cited in my prompt, is not on master or its branch (only the commits are) - I read the commit messages instead.

## QUESTIONS FOR DANIEL (recommendation first; the recommendation is what is built)
1. THE QUEEN'S MUSIC: her composed theme 'cisternqueen' plays in the Djinn's hall now (welltown5), so her hall plays the pool's 'boss3'.
   Rec: compose the Djinn his own synth theme and give hers back (an art/music lane). Alt: she keeps a pool track.
2. LEVEL MUSIC: 'cave' is a stand-in. Rec: the art lane lists three CC0/CC-BY cave/cistern tracks for your pick.
3. THE QUEEN'S SPREAD: pyro 6/6, knight 3/6, warden 1/6 (the Djinn's shape too). Rec: a small bot lane on the warden before any
   hero-specific number; your playtest decides. Her numbers moved for everyone (hp 1400, blows x1.43) - she is only placed here.
4. THE SANDWORM is met first in the Underwell now (it stands before the gorge): one-new-foe says the gorge brings the raptor only. Rec: keep.
5. A BLADE ON A NEST spits venom (8, unblockable) and spills brood; the Underwell's old oil fires scorch 14 at their face; burning oil 13 a
   tick. These are what make the mash bot lose the level. Rec: keep (all told; a careful player pours from a step away and burns nests).
6. OIL TIMING: floor oil burns 6 s, gutter oil 16 s; spent/wet oil back in 25 s; a struck torch has a flame again in 12 s. Rec: keep.
7. A BURNT ROPE is hung again on a respawn (the back scaffolds are the way up meanwhile). Rec: keep. Alt: it re-hangs on a timer.
8. The exam's firebreak saves a drip (useful, not required); the required firebreak is the oil works' rope. Rec: keep - the reviewer may ask
   for a harder exam. Alt: make the exam's rope/stair burnable too.
