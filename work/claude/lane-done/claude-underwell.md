# claude/underwell - THE UNDERWELL, the Opus greybox (2026-10-05)

Base: master 2423ff42 (batch68). Master did not move during the lane. Brief + structure: docs/concepts/the-underwell.md (the as-built and the
notes for the reviewer and the art pass are at its end).

## What it is
The old cistern tunnels under THE WELL TOWN, on the main road between the town and THE RED GORGE (LEVELS: appended; welltown > underwell >
redgorge by `needs`; a map node at (140,156) on the desert road). Boss: THE CISTERN QUEEN (src/cistern-queen.js, as WELLTOWN5 benched her).

THE RULE (as first built; see FIX PASS below for the line now): OIL SEEPS DOWN HERE. A TORCH SETS IT BURNING, THE BROOD WILL NOT CROSS FIRE, AND ONLY WATER PUTS IT OUT.
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

## FIX PASS (after the read-only review, scratch/review-underwell.md) - 2026-10-05
MUST FIX, all built:
1. RULE LINE (src/level.js, src/underwell.js header): "STRIKE A TORCH AND THE OIL BURNS - THE BROOD WON'T CROSS FIRE. POUR WATER WHERE THE FIRE MUST NOT GO."
   (lit oil burns itself out; only the old oil fires need water). tools/underwell.mjs holds it.
2. TWO REQUIRED REMIXES:
   - THE OIL WORKS: a brood nest (223-224) seals the upper works' way east; its only fire is the lower works' torch (176), whose floor oil runs up an
     old pipe in the east wall (216) to it. The rope up (160) and the drip (152) stand in that floor oil west of the torch: POUR AT THE ROPE'S FOOT
     FIRST or the rope burns (the back scaffolds, or a spare rope lowered after 30 s, are the cost). The fire scorpion by the rope is gone (moved
     upstairs, off the oil).
   - THE SILTED SUMP: no rest mounds; five FAST sandworms share the floor (src/desert-foes2.js FAST_WORM: the ripple outruns a walker and domes up
     where he will be - told !! 0.5 s). Measured (page, a hero walking the sump cold): 76 health lost to the worms; with the gutter lit, none.
3. THE EXAM IS THE PEAK: floor A's rope (356) is the only way up to the gallery and her door and stands in the torch's oil (a REQUIRED firebreak);
   the torch burns the exam's nest and lights the gutter (the worm under, the nest room's brood burn); THE SPRING is in the nest room past the
   worm bed (cross, fill, come back while the gutter burns, climb). Gallery: dust + thirsty + oil scorpions, THE OLD STINGER (moved from the sump),
   two spitters, two old oil fires (14 -> 18 heat at their face). Route pilot (level 1, careful hand, all foes): damage by leg - works 18,
   sump 18, EXAM 64-70 (it was 18 while the works were 90-298).
4. WATER: the spring in the nest room (a full skin) + a drip on the gallery after the thirsty scorpion and before the two fires.
5. THE QUEEN GETS THE RULE: lamp oil streaked down both walls of her hall (it burns while she clings there alight in P2 - drawn), floor oil both
   sides with a torch over each (hung high: a jump strike lights one, a floor swing in the fight does not); her P3 brood (scorpions) obey the
   fire rule (won't cross, burn).
SHOULD FIX, built: verbs on the lamp ("STRIKE ITS RUSTED CHAIN") and gutter ("STRIKE THE TORCH: THE HEAT DRIVES THE WORMS UNDER") signs, an exam sign,
a nest warning sign at the hall chamber + a nest QUIVERS when a hero is near; the gutter torch struck from the bare stone (seep moved to 257-261);
the sump sign spaced; THE TOLD ANTI-SPAM WARD (B3: after every opening ends, 3 s - a line, a pale ring; a pour finds nothing, the shell turns the
stinger too); her cast husk by her door (foreshadow); sandworms 4 -> 6 (the heavy role).
DANIEL'S ANSWERS, built: THE DJINN has his own composed theme ('djinn', D Hijaz, doumbek, ney; :p2 fire, :p3 flood - src/boss-music.js) and the Queen
plays hers ('cisternqueen' + her p2/p3) in the Underwell. Punishments kept.
NUMBERS (BKT.setHeroLevel at the campaign depth, L31 - the combat-pilots standard): with the ward the Queen fell to 3/18, so hp 1400 -> 1250:
knight 3/6, warden 1/6, pyro 5/6 = 9/18 = 50% (no hero at 0; 18 seeds a hero spent this pass; the warden spread is HERO KIT's). Mash: boss 0/6,
level knight 38% / warden 23% / pyro 31% lowest. Level-1 pilot 21 blows, 3 deaths. level-quality: clears. Route: all 7 heroes walk it on base
movement; level-1 knight/warden/pyro with every foe alive walk it with 0 deaths (careful hand).
Checks green: underwell, level-quality (all gated), mash-gate, boss-fight-end, boss-openings, cistern-queen, boss-music, audio-assets, desert-foes2,
corpses, goblin-lint, stuck (static + runtime), welltown, redgorge, steam-works, boss-greed, checkpoints, architecture, skins, dangling-paths,
npc-removal, slopes-trace, one-new-foe, hint-shown, tells, answer-tags, threat-holes, sprinkle-cap, signs, map-spacing, map-grammar, homepaths,
comments. Red, not mine: djinn (marks row djinn|upsurgeTell missing - red on 2423ff42).
MUSIC PICKS for the level (to verify the licence on its page - NOT downloaded): Kevin MacLeod "Desert City" (incompetech, CC-BY 4.0); Kevin MacLeod
"Ossuary 6 - Air" (CC-BY 4.0, a dark cave bed); OpenGameArt "Cave Theme" by Brandon Morris (CC0). Rec: "Ossuary 6 - Air" for the tunnels.
STILL OPEN: the dust scorpion's twist is not rule-tied (grit, not oil); no per-act band for the level-1 pilot until COMBAT PART 2 lands.
