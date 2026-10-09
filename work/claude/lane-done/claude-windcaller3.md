# claude/windcaller3 - THE WINDCALLER 3 (Gale Moor boss): the wind is the fight

Brief: scratch/brief-windcaller3.md (Daniel 10-08). Target per design-standard B6 amended: WITH FLASKS (profile `human`), campaign
level, 60-70% k/w/p, no hero at 0/N, dry reported alongside, mash 0/6.

## What is in the branch
Earlier (918de6e3, 951da736 - the first lane's session):
- THE ROOM: a thorn strip across the summit floor (A10 27% + safe return) between the west lip (HOME) and the fall stone; two WIDE
  ledges six rows up (no hero jumps them); two updrafts that blow only in the summit's TOLD GUST (flags + whistle) and carry you
  downwind onto a ledge. Per-hero real-key test: tools/windcaller-gusts.mjs (every hero rides every ledge on the gust, none without).
- ON HIS LEDGE HE IS A DUELIST (B11): whole damage, steps away when struck; his bolt blocked/struck back UP CLOSE knocks him to
  the floor = the BIG opening (gold ring + clock, x2), told ward after (B3); his howl braced through = the small fall.
- THE RESET: after an opening, one blink back up and a told GALE HOME that sets you on the lip (never the thorns).
- PHASES CHANGE THE WIND: P1 east only; P2 alternating + the hail wall; P3 the storm (faster gusts) + the east ledge crumbles.

This session (resume after the lane died):
- a8d883d3 (the uncommitted diff, read and kept): his thorns hand you back to a FLOOR (callerFallX), never a ledge's end with the
  gust still blowing (that was a second and third thorn); bot run-up at the thorn strip, bot braces stood on his ledge; big fall 10%.
- ed78fc43 - the tuning. With the thorn bug gone the shield heroes were untouched (6/6 6/6, 19-60 hp taken): beside him on his
  ledge he never threw anything (his bolt and stone are never point-blank), so a blocker stood there and cut him safely.
  - HIS BLAST (new, base kit): stood within 46 px of him for 1.4/1.1/0.9 s (by phase) he GATHERS THE WIND - red `!!`, swirl,
    word "HE GATHERS THE WIND: STEP BACK", gust whistle, 0.75 s - then blows you off his ledge (22, unblockable, knocked off).
    Rest 5/4/3.5 s. Answer: step back out of it (or be off the ledge). marks.js `windcaller|blastTell: '!!'`.
  - HIS STANDING STONE is now red and no shield turns it (`noBlock`, 28; marks `!!`, registered in marks.js THROWN for the
    tells audit). Bolt 18 -> 22 (blocked/struck back as before).
  - BOT (src/lab.js, windcaller only): stays inside the updraft column while it lifts (a bolt dropped a pyro back into the vent
    late and the gust carried it short into the thorns); never rolls where the roll ends off his ledge or in the thorns
    (callerRollBad on BK.press and the human delayed roll; roll length 96 px, was 56 - a pyro rolled off the lip from 76 px);
    steps back out of the blast after the profile's reaction time (rtMode).
- e3157bd3: moor mash rows re-stamped (level, then boss); his teaching lines routed to the hint box (hint-shown was red since
  918de6e3: 'THE WIND TURNS: READ THE FLAGS', 'THE STORM: THE EAST LEDGE GIVES', 'HE STEPS AWAY', 'HE BLOWS YOU HOME',
  'THE GALE TAKES YOU HOME', 'THE LEDGE FALLS', 'HIS OWN BOLT: HE FALLS - CUT HIM', + the blast line); 'BLOWN OFF' dropped;
  'GONE' / 'THE SKY DARKENS' (no longer said) left the silent list (--write, removals only).

## Numbers (L9 campaign level, normal health, practiced)
| profile | knight | warden | pyro | all |
|---|---|---|---|---|
| human (WITH FLASKS), 12 seeds | 8/12 | 12/12 | 5/12 | **69%** (in 60-70) |
| human+dry, 6 seeds | 2/6 | 5/6 | 0/6 | 39% |
| mash bot (boss) | 0/2 | 0/2 | 0/2 | **0/6** (dies ~11 s) |
Fights 96-167 s (a few knight/pyro deaths at 60-90 s). Mash level mode: every hero dies repeatedly (gate holds).
Tuning trail (flasks, 6 seeds): resumed diff 78% (6/6 6/6 2/6) -> +red stone/bolt 26 83% -> +blast 56% -> bolt 22 57% ->
+bot answers blast 53% (pyro 0/6: rolled into thorns) -> roll guard 96 px 71% -> blast 58 px 42% (back to 46) -> blast tell 0.85 50%
(reverted; 6-seed samples swing +-15%, so the committed config was confirmed on 12 seeds).

## Checks run (PORT 8774)
windcaller-gusts (all heroes) OK; tells, boss-openings, boss-fight-end, boss-read, boss-greed, moor-gusts, moor-wind, moor-rocks,
moor-aloft, answer-tags, untold-told, weak-bosses, mash-gate, level-quality, hint-shown, signs, comments: ok. Wider subset
(boss-jump, boss-navigation, stuck, architecture, death-cost, checkpoints, combat-part2, curve-gate, rule-openings, lab-reach,
mash-carry, threat-holes, one-new-foe, verb-matrix, playrec, dangling-paths, homepaths, windcaller-gusts, boss-read): 20/20 ok.
Not run: the full suite (40 min; the machine is heavily loaded - pages time out "did not initialize" at jobs=3; jobs=2 works).

## QUESTIONS FOR DANIEL
1. HIS BLAST is a base-kit move I added (not a phase move): without it a shield hero stood beside him on his ledge in total
   safety (he never throws point-blank) and won 6/6. Rec: keep it (it is the wind - he blows you off his ledge - and it makes the
   ledge a place you visit, not a place you stand). Built: kept.
2. THE STONE IS RED NOW (unblockable): a menhir turned on a shield read wrong and gave blockers a free pass. Rec: keep. Built: kept.
3. PER-HERO SPREAD: warden 12/12, pyro 5/12 (dry 0/6). In band overall and no hero at 0 with flasks, but the warden's long reach
   fights from just outside the blast. Rec: accept for now and look again in a per-hero balance pass (a blast that reaches the
   warden - 58 px - dropped pyro to 0/4 and knight to 3/6). Built: blast 46 px.
4. DRY 39% (pyro 0/6 dry). B6 amended says report dry alongside; no dry target now. Rec: fine as is. Built: nothing.
