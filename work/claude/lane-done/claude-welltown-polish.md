# claude/welltown-polish - THE WELL TOWN polish (Sonnet), 2026-10-02
Branch `claude/welltown` from bb37d3fd. Nothing was played by hand: stills and bot runs only. Captures in `work/claude/welltown-polish/` (before, after).

## 1. The Gang Leader moved to the MARKET COURTYARD
- I read "market courtyard" as the WELL SQUARE at the head of the market stair (152-191, floor row 26). His fight, numbers and extras are untouched (blade guard, red riposte, off balance, 1/5 burn cap). Only the stage moved: `src/gang-leader.js` STAGE (his wall at 151 shuts behind you, a solid wall at 192 against the fallen street's rubble, troughs and his start re-spaced).
- The great well (head and windlass) is inside his courtyard. While he lives the windlass is FOULED (a blow rings off it, line "THE WINDLASS IS FOULED: FINISH HIM FIRST"), so the shaft is not an escape and the mini is not skippable. The great well head is his courtyard well. The square's shade is a rect plus three awnings.
- The square's old squads (well-house bowman, two knives, the well-head thief) went to the KASBAH COURTYARD, now the garrison's: two knives and a thief in the yard, a bowman on each of two ledges, gateway arches at 473 and 514, no well (the exam's last well stays the last one). The "contested ride" (men follow you down the shaft) has no one left to follow; the code is still there, the probe now asserts the fouled windlass instead.
- Checkpoint SIX at 147, the square's door (a death used to send you 70 tiles back through the bazaar). 197 checkpoints in the game pass checkpoints/checkpoint-gaps; level-quality says one per 96 route tiles (bar 90).
- Pilots (`welltown-pilot --mini`, 4 salts x 3 heroes): Gang Leader 8/12 = 67%, median win 38.5 s (before 4/6 = 67%, 37-57 s); knight 4/4, pyro 4/4, warden 0/4 (swings a lot by seed, as before). Mash bot: mini 0 wins (all dead, boss left 36-49%), level: all three heroes under 40% (knight, warden, pyro each die once). docs/mash-bot.json and docs/level1-pilot.json re-stamped (level-1 pilot: 24 blows, 4 deaths, 9 kills). slopes-trace rebased for welltown only.

## 2. Cistern Queen art (`src/redraw/cistern_queen_art.js`, hitboxes and timings untouched)
Lighter chitin, thick two-pass legs (dark edge, lit top, knee, pale foot claw), a continuous rim light on carapace, head, tail and claws, bigger pale-rimmed claws with bright tips, a gradient-lit stinger (ringed and white-hot when told; green for the spit and the tidal tail). New told silhouettes: tail thrown back low (sweep low) and back and up (sweep high), tail arched forward over her head (venom spit), a crouch (lunge, pounce), claws up (wave, pounce, slam), a lean (roll). Sheet before/after: `work/claude/welltown-polish/{before,after}/queen-sheet.png` (`tools/cisternqueen-sheet.mjs`), in-hall stills `after/q01..q20`.

## 3. Venom HUD icon (`src/venom-hud.js`, drawn under the stamina bar)
A drop per stack (three slots, a drop empties over a stack's 6 s, the cap reads as dark slots) plus the slowdown ("-75%"); any other poison shows one draining drop and "POISON". Hidden HUD mode no longer hides it. Asserted in `tools/cistern-queen.mjs` (78 checks). Stills: `after/hud-*`.

## 4. Deleted
`bakeBanditKing`, `KING_F` and its palette from `src/redraw/welltown_art.js`; the probe's dead `keep` set; stale King text in welltown-route/level.js. LEFT (see questions): `bakeBanditKing` in `src/redraw/desert_west.js`, `BANDIT_KING` in `src/desert-bosses.js` (both unwired design stock still used by tools/desert-west-art, desert-bosses, sun-priest), and `boss: 'banditking'` in `src/draft/well-town.js` (a draft). The 'banditking' MUSIC name is the Gang Leader's theme and stays.

## Checks green (run by name)
welltown (40), welltown-probe, cistern-queen (78), level-quality, mash-gate, boss-greed, boss-openings, boss-fight-end (50 fights), tells, hint-shown, textfit (0 pictures), pixels, floaters, dressing, sprinkle-cap, checkpoints, checkpoint-gaps, skins, architecture, dangling-paths, slopes-trace (welltown rebased).

## UNVERIFIED
Not played by hand. The Gang Leader's feel in the square (the great well's pole and bucket stand mid-arena, the bucket is a platform to him) and the fouled windlass were only exercised by bots. `welltown-route.mjs` was edited for the new legs but not walked.

## QUESTIONS FOR DANIEL (recommended option built)
1. "Market courtyard" = the Well Square (the lower market itself has no 40-tile open stretch without moving the bazaar). Rec: keep. Alt: a new courtyard cut into the lower market (shifts every column after it).
2. Sixth checkpoint at 147. Rec: keep (a mini death should not run you back through the bazaar). Alt: drop checkpoint four at 470; the Roost-to-Old-Well gap becomes ~193 tiles.
3. Delete the unwired desert-west `bakeBanditKing` and the desert-bosses `BANDIT_KING` too? Rec: yes in a separate cleanup (they touch three other tools).
4. The square's shade is a tinted rect plus awnings (the old Kasbah courtyard used the same). Rec: keep.
