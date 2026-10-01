# claude/canalfix - THE FOG CANAL, the review's fixes and the four upgrades (Opus, 2026-10-01)

Branch `claude/canal` (worktree bracken-canal). Started at 39c03412, merged origin/master d87b209a first. Master did not move again before the report.

## What changed, in plain words

**The road.** It now runs Waymeet -> THE FOG CANAL -> the Maskwright's Theatre -> the Harvest Fair:
- the canal `needs` waymeet;
- the theatre `needs` canal;
- the fair `needs` theatre.

The map nodes are canal (48, 156) and theatre (60, 151). tools/canal.mjs, tools/theatre.mjs, tools/harvest-fair.mjs and tools/additional-areas.mjs all assert the new order.

**The review's fixes:**

- **1. Difficulty.** This was reached through the fixes below. No foe has more health.
- **2. Grindylows come aboard** (src/canal-foes.js `stepAboard`).
  - While she is HELD at a gate, a bridge or the fog, a grindylow at her hull with a rider on her deck does three things in turn:
    1. It rings the water at her near end (!!).
    2. It hauls itself aboard.
    3. It creeps at the rider, rings again (!!: jump it) and grabs, dragging him for her nearest end and the water.
  - Aboard, it is weak (it takes double damage).
  - It slips back into the water when nobody is aboard.
  - The one at the weir's junction (col 270) boards her while she runs loose.
- **3. The weir run.**
  - On the head race's steps she runs at 58 px/s.
  - The flood's front is held at her stern + 34 px, so a rider standing aft is in it and one standing forward is not.
  - The mixed reads:
    - a BOOM (a chained log at deck height that you JUMP) on the first step's flat;
    - the footbridge (you DUCK) on the second step, moved on 2 columns so a bow-rider can duck it;
    - each branch has both kinds: the cut has 2 booms and 2 beams, the weir has a boom and the cut shelf told as a beam.
  - The tiller answers only until col 268. After that you get "THE HELM IS SET".
  - The keeper-hut archer now stands on the footbridge, over the tiller's window.
  - The flood's `rubber.min` is 64.
- **4. The exam is two stops.**
  - The horn is on the west bank (329, 40) with its own 6.5 s of clear air.
  - The capstan stays on the island.
  - The lamplighter and the foreman are best killed first, in the dark.
- **5. The garrison.**
  - Its capstan is on the FAR bank (160, 29), and a lantern stands at the bridge's near end (152).
  - A LAMPLIGHTER relights the lantern and lights you for both bows.
  - The way through: kill him, douse the lantern, cross between the archers, then swing them into the canal.
  - Daniel's note said "douse post 157". 157 was on the bridge itself and could not be reached unseen, so the post now stands at 152.
- **6. The fog wall needs both horns.**
  - F2 now runs 165-190.
  - The bank horn clears 4 s, which takes her about two-thirds of the way in.
  - A long pier (175-185) carries the second horn (6 s). You stand on it with the footbridge archer and a bargee.
- **7. The arch.**
  - When her bow is at the mouth and nobody is aboard, she goes on through.
  - The hint shows at the mouth: "TOO LOW FOR ANYONE STANDING: SHE GOES ON ... WITHOUT YOU".
  - A striped "too low" sill is drawn on the arch.
- **8. The unreachable bargee at 426 is removed.**
- **9. Every foe now touches a machine.**
  - Thin fog F0 now lies over the warehouse and the Waymeet pound, so the roof archer (26) and the low-bridge archer (57) see only the lit. The roof has a lantern by the silver.
  - The warehouse bargee hooks from the second towpath.
  - The two mill bargees hook from the wharf floor.
  - The mill-top archer guards the mill bridge's capstan under its lantern (123).
  - The rooftop bargee stands on the light-well's lip, so his hook throws you down the well.
  - The flight-foot bargee guards the pier horn.
  - The keeper-hut archer moved to the head race footbridge.
  - **The LAMPLIGHTER (x2: the garrison and the island)** is the kill-first support. He is the proven SNUFFER AI reversed: `t: 'snuffer'` with `canal.lamplighter`, two small branches in `updateSnuffer`. He walks to a DOUSED post and relights it, and his own lantern (64 px) lights you for every archer near him. He is not a new foe type, so `one-new-foe` stays exactly grindylow + wisp.
- **10. Signs.**
  - The summit sign is now "THE SUMMIT POUND. THE KEEPER'S LAST PADDLE IS PAST THE BRIDGE."
  - Sign 119 now teaches dousing.
  - The wisp is named only AFTER its first lure, as a hint in src/canal-foes.js.
- **11. Checkpoints.** See QUESTION 1. Dropping the mill checkpoint fails `checkpoint-gaps`: start to summit is 262 route tiles, over the 200 ceiling. So it is MOVED to the arch's end (149, 29), with its own mooring. The route tiles are 176 / 262 / 402: gaps of 176, 86 and 140.
- **12. Drift 55 -> 72 px/s.**
- **13 and 14 (art).** These are left for the art lane, written in docs/briefs/fog-canal.md "Art notes": a canal parallax in place of 'town', soft fog edges, and how to dress the new greybox pieces.
- **15 (seeded music random).** This is MOOT: the music tool is deleted (see Music).
- **16. Numbers corrected.** The real numbers are below.

**Daniel's four upgrades:**
- **A. A draining lock.** The flight's first chamber (L2) starts FULL, so its lower gate is shut on her.
  - You drain it from a new paddle on that gate's face, at her bow (197, 32).
  - Draining strands the grindylow in it ("STRANDED", weak).
  - The stranding test was also a latent bug: it compared frame to frame, so a lock draining at its real speed could never strand anything. It is now measured against the water the grindylow settled in.
  - src/reachcore.js L.noWade now keeps her deck's band as footing, so a lock that starts full does not drown its own low stop. This applies to the canal only.
- **B. The tiller taught early.**
  - On the Waymeet pound her helm puts her on the TOWPATH side (arrow down: the towpath bargees can hook you) or the OFFSIDE (arrow up: out of their reach, but under the low bridge's timbers).
  - A sign at 44 says "THE TILLER AMIDSHIPS STEERS HER: STRIKE IT TO TURN HER HELM."
  - At the weir, the same strike picks the cut or the weir.
  - See QUESTION 2.
- **C. The boarding gang.** Three bargees wait unseen in the fog wall. When she is held at its edge with you aboard or beside her, a skiff comes out and they leap onto her deck. They ride pinned to her deck and fight there: hooks that throw you into the canal, and the haft.
- **D. More pockets.** Pockets went from 2 to 4 by the `route` measure: the light-well (deeper, with its silver), the mill attic (a loft floor with 4 coins), the loading bay and the gorge ledge. The keeper's loft (a ladder at 243, with coins) is built, but the dead-end finder does not count it.

**Music (the coordinator's addition, Daniel approved).**
- `audio/canal.ogg` is now "Lanterns in the Hollowed Forest" by Tsorthan Grove, CC0 (https://opengameart.org/node/181239), made from the loop FLAC the coordinator fetched. I downloaded nothing.
- Conversion: local ffmpeg, Vorbis q4, 44.1 kHz stereo, +8 dB. That gives mean -16.4 dB and peak -1.4 dB; Waymeet is -15.9 and witchlight -15.2.
- The loop seam is continuous: 38.40 s, exactly 1,693,440 samples, and the step across the seam is 0.003 against a largest in-file step of 0.129.
- It is credited in MUSIC_CREDITS and audio/CREDITS.txt (URL and licence).
- `tools/canal-music.mjs` is deleted. Its citations in the old lane report and the brief are reworded.
- level-quality `music` passes: an own track, borrowed by nobody.

**The gate.** 'canal' is added to GATE in tools/level-quality.mjs. `grindylow` is added to ROLES.runner (a grab). `L.unlocks` declares the paddle, capstan, foghorn and lantern post, each with its hint line. docs/level1-pilot.json has the canal's row.

**tools/canal-pilot.mjs**
- It now keeps the review's tally: damage taken per leg, the lowest health, and the dips under 40%.
- It plays the new level: it kills the lamplighter, douses the lantern, uses the far-bank capstan, fights the gang on her deck, uses both horns, drains L2, strikes the tiller in its window, stands at the bow, and jumps the booms.
- `from=2|3` starts it at a checkpoint.
- `TRACE=n` prints a trace every n frames.

## Numbers, before and after

**level-quality canal** (before -> after):

| measure | before | after |
|---|---|---|
| verdict (gated) | not gated | CLEARS THE BAR |
| flat empty / level ground | 13% / 13% | 13% / 13% |
| bands / second height | 7 / 59% | 7 / 59% |
| gadget kinds / in 3+ places | 6 / 3 | 6 / 4 |
| secrets off route | 2 | 3 |
| checkpoints / route tiles each | 3 / 134 | 3 / 134 |
| density / empty screens | 2.06 / 11% | 1.94 / 17% |
| roles | 3: heavy, melee, ranged | 5: heavy, melee, ranged, runner, support |
| pockets | 2 | 4 (Folly 5) |
| pilot | not run | 65 blows, 6 deaths, 3 runs |
| foes | 41 built, 40 reachable | 46: archer 12, gaffer 14 (3 of them the gang, 1 the elite foreman), grindylow 12, wisp 6, lamplighter 2; all reachable |

The density figure here is the encounters measure; the review's 2.28 was taken under an older measure.

**The level-1 no-ability scripted pilot** (fresh save, god off, tools/canal-pilot.mjs):

| run | result | deaths | damage | lowest health | dips under 40% | weir + basin |
|---|---|---|---|---|---|---|
| BEFORE, knight (the review) | win | 0 | 66 | 74/100 | 0 | 0 damage |
| AFTER, knight | win | 1 | 395 | 2/107 | 3 | dies once in the basin first try; then 44 on the cut, fell off at 316 and was handed to the basin bank |
| AFTER, pyro | win | 0 | 211 | 4/99 | 2 | - |

For the knight AFTER, the damage by stretch was:
- 23 on the mill climb;
- 14 at the mill bridge;
- 98 at the garrison;
- 43 at the fog wall;
- 49 in the flight;
- the weir and basin as in the table.

**The target (two dips under 40%, or a death) is MET for both heroes.** I have no per-foe attribution like the review's (bargee 52 / archer 14). The tally is per leg.

**The generic level-1 pilot** (tools/level1-pilot.mjs, the bot, 3 runs summed):

| | hits | deaths | lifts |
|---|---|---|---|
| BEFORE (old code, same tool) | 82 | 9 | 93 |
| AFTER (written to docs/level1-pilot.json) | 65 | 6 | 91 |

The bot cannot work the machines and is lifted about 30 times a run. Its deaths are mostly falls into the water that hurts, so the numbers are noisy.

## Checks

GREEN (each run alone or as one `npm run check` subset, after the last level edit):
canal (with the page), level-quality (all gated levels), theatre, harvest-fair, additional-areas, architecture, checkpoints, checkpoint-gaps, skins, dangling-paths, slopes-trace, npc-removal, hint-shown, audio-assets, tells, chase (+ tower-chase), elites, one-new-foe, ore-road (the ducked-hook rule), signs, deadends.

- **slopes-trace:** the canal's own trace changed, because the level changed (the keeper's loft wall at col 235 is where the lip probe now differs). I rebased only the canal (`--rebase=canal`). wood, kings, keep and burial keep the old baseline and are unchanged.
- **Tests proven against the old code:** the new tools/canal.mjs assertions were run against the pre-fix tree (de4baa24) and 17 of them fail there: the two horns, the head race speed, the tiller window, the mixed reads, rubber 64, boarding, stranding, the set lock, the two-stop exam, the far-bank capstan and the lamplighter, the lamplighters, the gang, the tiller teach, the arch data, the spoiler signs, and the foe past the end gate. The four new page probes are the low bridge on the towpath side, a grindylow aboard a held barge, the gang aboard at the fog wall, and the flood at the stern but not the bow.
- **Wording changes in old tests:**
  - "one horn carries her through" became "one horn is NOT enough, and the pier horn is";
  - the exam's "horn past the bridge" became "horn on the west bank, 6-7 s";
  - checking the LOCK requirement against the mill top now uses its coordinates (the mill checkpoint is gone);
  - the fog test's "out of the fog" point moved to the street, because the warehouse is in thin fog now.

## UNVERIFIED

- The pilots and checks were run on the knight and the pyro only. The Freebooter and the other heroes were not walked.
- No playtest by hand. Nothing was checked by screenshots:
  - the offside barge's look;
  - the skiff;
  - the booms' !! mark;
  - the arch sill;
  - the lamplighter's lantern.
- The pyro's leg "off at the loading step" logged a MISS (it recovered and went on over the roofs).
- On the weir run, the pilot is sometimes thrown off and wades or is handed to the basin bank. A human holding forward on a jump does better.
- The boarding gang and the deck grindylows were seen working in page probes and pilot runs. A fight with all three boarders and a held-barge grindylow at once was not stress-tested.
- The keeper's loft does not count as a pocket.
- I did not run the music's decode check (`audio-assets --decode`).

## QUESTIONS FOR DANIEL (each built as recommended; nothing waited)

1. **The mill checkpoint.** Dropping it leaves 262 route tiles from the start to the summit, and `checkpoint-gaps` fails anything over 200. My recommendation, which is BUILT: move it, not drop it, to the arch's end (149, 29), before the garrison, the gang and the fog wall. Gaps are 176 / 86 / 140, still three checkpoints. The other option is for you to lift the 200 ceiling for the canal: a KNOWN entry in tools/checkpoint-gaps.mjs, which that list's rule forbids lanes to add.
2. **The early tiller (upgrade B).** It is built as "her side of the Waymeet pound": the towpath's hooks or the offside's timbers. It is a real, harmless fork, but the side is drawn only as a shade and a wake line. My recommendation: keep it, and have the art lane set her visibly further off on the offside. The alternative is a true small height fork, which needs a descent before the weir that the route does not have.
3. **The garrison's post** stands at the bridge's near end (152), not at 157. You cannot reach 157 unseen, because it stood on the bridge between the archers. Recommendation: keep it at 152.
4. **Dousing is required by pressure, not by a hard lock.** You CAN fight across the garrison lit, and the pilot knight lost 98 there. Recommendation: keep it. A hard lock (for example, the archers holding the bridge while they can see you) is possible if you want one.
5. **The weir run is now harsh at level 1.** The knight died once in the weir+basin and was thrown off on the cut. Recommendation: keep it until your playtest. The first knobs to ease are the flood's lap (34 px) and the boom damage (14).

Final commit: see the lane's last push on `claude/canal`.
