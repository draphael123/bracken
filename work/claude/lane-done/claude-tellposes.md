# claude/tellposes - TELLS-AS-POSES (art-direction fix lane 6)
Base batch80 36c83412. Strips: work/claude/tellposes/{before,after}/{sprig,soldier}.png (tool: tools/tellposes-strip.mjs).

## Converted
- SHARED foe tell (every foe/boss in windingUp): keyframed held poses (rise+breath -> lean back -> coil+shudder; poseOf/windKeys), a 1-2 frame white
  silhouette at the start of each wind-up (honours Flashes/Reduce motion), a hard-pixel 4-point glint on the weapon hand (white for !, red for !!).
  Draw-side clock only; no sim state. Excluded (their own lanes): duneworm, kraken, winchmaster, crusader, fallingtower, colossus (old squash kept).
- Shared decal helpers tellBar/tellRing/tellColumn/tellLine (dithered 2x2 hard pixels, colour meaning kept) replace red rect/ring/dashed tells at:
  elite volley + elite marks (drawEliteVolley, ~3145), apprentice/elite zone (~3796), ploughman furrow bar (12718) + head ring, homunculus flask rings (13884),
  smoke vent glow (20991), captive door glow (21075), golem sweep line, roc rake line + shriek boards, owl skim line, masthead boom line, lancer charge line,
  Hornet-queen/other dashed sweep lines (6 dashed lines in main.js), gqueen quake ring + point X, archmage circle/glyph/crush/blink.
- The existing !/!! mark badges (src/marks.js table) are untouched: the hard-pixel !! is the unblockable accent.

## Left (own rework lanes / per-module draw code, not touched)
Crusader, Caravan2/Dune Worm, Falling Tower 2 (told: hands off). Remaining red-box tells in boss modules: winchmaster, puppeteer-hands, unburied-foes (9),
hedge-warden, glass-colossus-hands, ksar-hands, roc-eyrie, huntmaster, gate-gargoyle, grave-warden, false-abbot, lantern-eater-hands, mage-realms, salvage-captain,
canal-hands, hawk-mistress-hands, minecart-hands, great-hound, spiral-chase; main.js ~14839-14923 (hawk/whelp marks), 16956-17304 (bash/line ring zones), 18022-18454,
20255, 20509-20628, 28135-28250 (ring zones). They need tellBar/tellRing exported from a shared module (currently in main.js) - next lane.
Elite per-move poses (ek*) already exist (eliteKitPose).

## Checks (all green, unchanged): tells, mark-integrity, boss-read, untold-told, answer-tags, combat-part2, threat-holes.
boss-rates (mage + fields:mini, practiced, 2 seeds x 3 heroes, human): before == after row for row (identical wins, times, damage) - no gameplay shift.

## QUESTIONS FOR DANIEL
- Accessibility: SET.boxes ('off') exists; rec: when on, also draw the old outlined ring/box under the decal (not built yet).
- Dithered decals are always red/amber by meaning, not biome accent; rec keep (colour meaning beats accent).
