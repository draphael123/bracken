# GREATHOUND lane (11-05) - Kingswood's Great Hound + King Gorm P2 music
Branch claude/greathound off master 42a1d4cd. NOT merged, NOT deployed.

## TIPS
- **GROUP A tip: tag `greathound-A` = 11c309721** (bd65a01c8 music + 11c309721 hound). Merge this for BATCH145 once its browser checks pass.
- **GROUP B tip: tag `greathound-B` = 226fd600f** (one commit on top of A). Also behind `KENNEL_B` in src/kingswood.js (set it false to keep the code but switch B off). Needs its art pass before live (SAT cut).

## BROWSER: OWED (coordinator 08:15: RAM critical, no headless in this lane)
Nothing here is browser-proven. Proof lane, one page at a time, on tag greathound-A first:
1. `node tools/boss-rates.mjs kings:mini --ways=practiced --seeds=6 --heroes=knight,warden,pyro --jobs=1` (flasks = kit, the default). Add geomancer,ranger if time.
2. `node tools/level1-pilot.mjs kings --write` and `node tools/mash-bot.mjs kings --level kings --write` (level-quality says the kings hash moved: the gallery plank + the glade's track name).
3. textfit, hint-shown, mark-integrity (new leapTell), boss-greed, boss-openings, rule-openings, arena-shut, gate-openers, boss-jump, boss-select, boss-fight-end, `audio-assets --decode` (decode audio/gorm-glade.ogg).
4. Eyes/ears: the wake beat, the bite's green-gold ring, the landing window, the gallery leap, the P2 PACK BLOOD beat + double pounce; Gorm hall -> glade: the track should crossfade (0.22 s) into the glade cut, no gap.
5. Then the same on tag greathound-B (cage + boar), and 2-4 seats once.
Accident to own: two tools I took for node-only opened headless pages briefly - mark-integrity (~60 s, ran to a partial pass) and boss-fight-end (stopped by my 300 s timeout). Both exited; no PID of mine left (checked).

## RATE TABLE (with flasks)
| fight | n | knight | warden | pyro | pooled |
|---|---|---|---|---|---|
| Great Hound, master (sweep1, before the combat changes) | 4 each | 4/4 | 1/4 | 4/4 | 75% |
| Great Hound, greathound-A | owed | - | - | - | - |
| Great Hound, greathound-B | owed | - | - | - | - |

I expect A to come out higher than 75% (the bite pays, every landing opens him, the gallery) with some of that taken back by the P2 double pounce, the gallery leap and boughs that reach the gallery. The levers are all in src/great-hound.js GH.bite / GH.land / GH.leap (and GH.cage / GH.horn for B).

## WHAT CHANGED
### Group A
1. **The chain post is taught, and the bite pays.** A sign by the post (col 194): "THE KENNEL HOUND IS CHAINED HERE. CUT ITS CHAIN: IT BITES HIM." The bite is still a 1.6 s stun, and now it is followed by a 2.0 s window where blows land x1.25 from any side. A green-gold ring and a short bar show the window, and the call reads "THE KENNEL HOUND BITES: HIT HIM". He is bitten every 4.5 s (was 3.5). Fix: the cut post used to be marked for good, so one death lost the kennel hound for the rest of the attempt. In Kingswood the post now re-chains after a death.
2. **Shieldless heroes get openings.** Every pounce landing is now a told 1.2 s window at x1.25 from any side (was a 0.8 s stagger). It is not an `e.open`, so no ward follows and his third-per-opening cap is not spent; during his ward it is the plain stagger again. **The kennelmen's feeding gallery:** a plank over the yard (cols 185-188, row 23) built from the hunting stands' own deck tiles, so it is not generic wood. A blow struck from it lands whole (from above). The boughs reach it, and if you stand on it over him he LEAPS AT THE GALLERY (a told '!' with its own mark, 'block' answer, a snap). So it is not a safe spot.
3. **P2 double pounce and wake beats.** At the start he lies by the gate and RISES (1.5 s, a roar, "HE RISES"). At half blood he stops for THE PACK BLOOD (1.0 s, a red ring, "THE PACK BLOOD: HE POUNCES TWICE"), and his next move is the double pounce. In P2 every pounce comes twice: the tell says POUNCE TWICE, the first landing gives no opening ("AGAIN" and a second '!!' tell), and the second landing does. He can be hit during both beats (front guard as usual), so he is never invulnerable.
All of this is gated on `L.mini.hound2` (Kingswood only). The Quarry Dog and the old kennel fight are unchanged.
4. **King Gorm P2 music, more intense** (see below).

### Group B (tag greathound-B, KENNEL_B)
5. **The kennel cage.** One royal rope over mid-yard (cage at cols 189-190, peg at col 183 on the floor, within reach). Drop it on him as he crosses and he is CAGED for 2.4 s. That counts as a real opening: x1.5, the third-of-him cap, the ward after. During his ward it glances off. It is optional, one use per attempt, and hangs again after a death. Wired through a new `cageBig` hook in src/kingswood-hands.js land().
6. **THE KING'S HORN (P2).** The first horn comes 3 s after PACK BLOOD, then one every 15 s, at most 2 per fight and one boar at a time. It is told: "THE KING'S HORN: A BOAR COMES", a gold ring at the far wall and a horn draw for 1.1 s. Then a ROYAL BOAR (the meadow's own foe, not a new type) charges the yard once and bolts. Jump it, or bait it into him: it GORES him, giving a 1.4 s stun plus the short window. The boar's room is now the kennel while the mini is active (an RBC getter). His death clears it.

Art owed for B: a kennel beam or gibbet for the rope to hang from (the yard is open sky), his CAGED pose, and posts under the gallery. The horn boar reuses the boar's art.

## MUSIC CHANGE (A4)
- **How the boss music works:** these are recorded tracks. src/audio.js TRACKS points at a file, and `music.play(arena.music)` switches tracks with a 0.22 s gain crossfade. Loops are chained sources with a LOOP_XF overlap. Gorm's hall and glade both played 'gorm' (audio/gorm.ogg, "Determined Pursuit" by Emma_MA, CC0). The only change in the glade was the x1.06 rage lift.
- **New:** `audio/gorm-glade.ogg` is a cut of the same CC0 recording (no new download, no new licence). It is a whole tone up and 12% faster, with a low layer of its own drums and bass (low-passed at 170 Hz, compressed hard) doubled under it and +2.5 dB of presence. Loudness is -11.7 LUFS against the hall's -12.5, so it is a little hotter on purpose. Peak is -0.5 dBFS. To make the seam the recording's own, I rendered three looped passes and kept the middle one, so the file loops cleanly. Length 96.2 s.
- It plays as 'gormglade', which is now the glade's arena.music (src/kingswood.js). The switch is the glade fight's own start, through the normal crossfade. The track is preloaded 100 tiles out like every boss track, and the rage lift still rides on top. It follows the same music gain path, so the volume slider and mute are respected. Nothing in the iOS unlock was touched.
- Credits: audio/CREDITS.txt entry, MUSIC_CREDITS / MUSIC_CREDITS_ROW, and a Sound Test row (MUSIC_NAMES). The credits screen's existing 'gorm' row already credits the piece.
- tools/gorm2.mjs now expects the glade on 'gormglade'.

## CHECKS RUN (node only; each file on its own)
Green: great-hound (extended with the new rules), tells, signs, kingswood2, gorm2, gorm3, boss-music, audio-assets, boss-read, anchor-lint (kings 39 listed, none new at the kennel; gate is rookery only).
level-quality kings: pilot and mash are STALE (the hash moved). Re-run owed, see above. Everything else in it is ok.

## NOT DONE
- Audit rec 1's "re-arm after a bough slam" (unclear what re-arms). Rec: leave it out.
- Audit rec 6 (order the howl) and rec 8 (P2 embers look) were not in scope.

## QUESTIONS FOR DANIEL (rec first; I built the rec)
1. **Win band for the Great Hound.** The brief says 60-70% with flasks, but tools/boss-rates.mjs uses 75-85% for minis. Rec: the mini band, 75-85%. He is the area exam, not the level boss. Tune GH.bite.mul / GH.land.t once the n=6 numbers are in.
2. **Gorm P2 music.** Rec: keep the "whole tone up + 12% faster + its own low drums" cut of the same CC0 track. The alternative is a different, more aggressive CC0/CC-BY track for the glade (needs a download OK).
3. **Should the landing window also be given to shield heroes?** Built: yes, everyone gets it (simpler, and the knight also has the skid). Rec: keep it, and trim it only if the knight's rate goes past the band.
4. **Group B's cage peg is on the floor at the west end (col 183).** Rec: keep it there (in reach from the floor). The alternative is a peg on the gallery, so cutting it means standing where he leaps.
