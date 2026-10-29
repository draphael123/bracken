# claude/windcaller4 - THE WINDCALLER 4 + THE GALE STAIR (OPUS greybox; brief scratch/brief-windcaller4-1026.md)

Base: claude/batch125 a36bf11c. Worktree bracken-lanes/bracken-windcaller4, PORT 8793. Not merged, not deployed.
**GALE HARPY**: the base lacked it - src/gale-harpy.js and src/redraw/gale_harpy_art.js are COPIED verbatim from claude/rookery2 (6a85587a), plus
src/rookery-anchors.js + tools/anchor-lint.mjs (also rookery2). The main.js/marks/death-fx/threat/told-attacks wiring lines are the rookery2 lines
where possible (spawn, EHP, bestiary, frame, sets) so the batch merge should take them as identical hunks; mine adds `galeWorld()` (she is stepped by
her own module away from the rookery: `if (e.t === 'galeharpy' && !(RKH && RKH.on()))` in updateHarpy) and `SPR.galeharpy = bakeGaleSheet()`
(imported straight from gale_harpy_art.js; rookery2 gets it through rookery_foes RKF.bakeGaleHarpy). **Merge note: if rookery2 lands first, keep
its wiring and drop my duplicate import/SPR line; keep galeWorld.**

## What was built
### THE BOSS (src/main.js updateWindcaller + helpers; constants block CALLER_*)
1. HP 1300 -> **1000** (-23%).
2. **No thorns in his room** (thorn strip + field removed). Thorns only in the FAR EAST CORNER (o+43..45) + **a PIT** (o+35..37, east of the east
   ledge): fall in and its wind throws you back out toward the middle (`callerPitStep`, 5% chip, a 0.45 s held throw so the stick cannot carry you
   on into the corner). West corner: NO thorns (see Q2).
3. **THE LOOP**: three blows beside him on his ledge (`CALLER_HITS`, `callerHitCounts`: up close and level, not warded, not mid-gather) and **HE
   FALLS** to the floor = the opening (gold ring + clock, x2), share capped at 10% of him (blows past the share are cut to it - x2 blows overshot by
   half again), told ward, one blink back up. Counter shown: HE REELS / HE TOTTERS: ONE MORE / THREE BLOWS: HE FALLS - CUT HIM. His bolt blocked
   back up close, his howl braced and every hero's own way home (fire/snatch/aegis/ward) still drop him (big fall 15%).
   His defence on the ledge: the blow before the last makes him GATHER THE WIND at once (his blast, red !!, 0.4x guard + STEP BACK while he
   gathers) - step back, then finish him. Stood beside him 0.8/0.7/0.6 s does the same.
4. **NO ATTACKS WHILE THE WIND BLOWS** (`callerStill`): a move or bolt only STARTS when the summit gust is not blowing (0.2 s after it) and will not
   blow before it finishes (it may overlap the build-up, when the hero still walks). His hurl walls and devils still rolling when the gust comes
   are scattered. The summit gust in the air now carries only a RIDER (lifted by an updraft in the last 1.4 s): stepping off a ledge just falls.
5. **HIS KIT (7 told moves, random pick among the ones that fit the still)**: WIND BOLT (kept; blockable/returnable) - GUST HURL (wall of wind
   along the floor: jump it or brace; 20 + big shove) - DUST DEVIL (rolls at you: on foot it lifts/spins/drops you, 14; JUMP INTO IT and it carries
   you up ~120 px, no harm - a ride to his ledge) - HIS BLAST (kept) - HIS HOWL (kept, shortened to fit a still: brace it -> big fall) -
   DOWNDRAFT (P2+: red ring on your spot, 1.0 s, slam 24 + pin 0.6 s) - GALE BLADES (P3: three crescents, each shown HIGH (duck) / LOW (jump) over
   his head in the tell and named in the line, 20 each). Stone and hail wall retired; the GALE HOME retired (no thorns to reset you over).
6. Phases kept: P1 east, P2 alternating, P3 storm + east ledge falls (fair now: floor under it).
7. Sign + hint lines updated ('THE UPDRAFTS BLOW ONLY IN THE GUST: RIDE ONE UP. THREE BLOWS ON HIS LEDGE AND HE FALLS.'; the Landing sign:
   'HE ATTACKS ONLY IN THE STILL...'). marks.js BY_HAND rows for the new tells (tools/tells.mjs --write), boss-read STEP BACK, hint-lines CALL_LINES.
8. Bot (src/lab.js): drops to him through the ledge when he falls; never walks through a live updraft; keeps one ride plan in the alternating
   phases; reads hurl/devil/blades after the profile's reaction time; jumps into devils (rides), ducks/jumps blades, steps out of rings.

### THE LEVEL - THE GALE STAIR (647-695, 49 new columns before the Landing; landing 696-703, summit 704-751, W 752)
TEACH: the shelf where the scaffold frame lands, a GALE UPDRAFT that blows only in the told gust (the summit's own updraft, taught where a miss is
free) and THE CRAG six rows up - the ride is the one required use (A4). TEST: crag top with GALE HARPY 1 beating back at you (hit her in the tell or
brace), then THE GAP: a tailwind jump crosses nine tiles, a fall in is a ride back up its own gale updraft (the boss's pit, foreshadowed), and a
paid pocket (THE WIND HOLE cave, 5 coins). REMIX/EXAM: two bracing stones over a thorn gully in the SAME gust turned back off the summit wall (a
headwind as the stair blows east - one beat, 5/1.8 - so a ride over the gap comes down on the far rock, never over the exam), GALE HARPY 2 on the
far rock. No checkpoint added (Landing's is next; 6 checkpoints, one per 125 tiles). Stuck spots + glints on both stair updrafts. Rock to the
bottom everywhere (anchor-lint clean on the new columns); the summit ledges stand on drawn pillars (routeSupports kind 'pile', caller:true).

## Numbers
L13 campaign level, normal health, practiced, profile **human (WITH FLASKS, campaign kit)**, n=12 per hero (tools/boss-rates.mjs):

| hero | wins | fights |
|---|---|---|
| knight | 11/12 | 70-131 s |
| warden | 6/12 | 59-105 s |
| pyro | 6/12 | 66-240 s (1 timeout) |
| **all** | **23/36 = 64% (in band 60-70, no hero at 0)** | wins 80-131 s |

Dry (human+dry, n=4): knight 2/4, warden 0/4, pyro 2/4 = 33% (no dry target since 10-08; windcaller3 was 39% dry).
**Mash bot (boss, --arena-only): 0/6** (dies at 28-33 s, 0-4% of him). Mash LEVEL mode: every hero dies 3-5 times (lowest hp 0%). Both rows
stamped in docs/mash-bot.json, level then boss (--assert passes).
Tuning trail (n=4-6 unless said): first build 33% (bot could not climb) -> bot fixes 100% (knight took 0, 48 s) -> ledge defence + damage x1.35 +
random move pick 78% -> fall share 12% -> 10%: **64% (n=12)**. The knight is the strongest (his shield turns bolt, blades and hurl): Q4.

## Checks (PORT 8793; no full suite)
- tools/windcaller-gusts.mjs (all 9 heroes, real keys): every ledge ridden on the gust; none without it / by a jump / upwind; THE PIT throws you
  out (chip, toward the middle); THREE BLOWS drop him - **OK** (updated: gale-home checks -> pit + loop; stair vents excluded).
- tools/gale-stair.mjs (NEW, all 9 heroes, real keys): shelf updraft in the gust onto the crag; not in the still; not by a jump; the tailwind
  jump over the gap; the gap floor's updraft carries you out - **OK**.
- Node: level-quality moor (route now OK, 2 pockets; **bands still FAIL, 11% second height - pre-existing**, moor not gated, Q1); anchor-lint
  moor (new columns clean; 6 PRE-EXISTING faults listed: causeway boards 28-37/48-52/65-91, wind-rocks ridge 551-562, scaffold decks 596-637);
  reach-heroes moor (9 heroes, 0 crossings); solid-islands OK; signs OK; stuck --static OK; moor-gusts OK (one beat 5/1.8 incl. the stair);
  moor-wind OK; moor-aloft OK; tells OK (marks.js re-written by --write); answer-tags red only on pre-existing forgemaster rows.
- Page: boss-openings windcaller OK (howl left: no fall; braced: falls, 3.7 s open; casting: not open); hint-shown: none of mine left (the 30
  base literals + 4 stale routed lines of other bosses were red on the base already); untold-told OK; boss-rates; mash-bot.
- NOT run: the full suite; level1-pilot/curve restamps (level-quality's pilot/curve rows say re-run - informational).

## ART / MUSIC NEEDS (SONNET art lane)
- WINDCALLER own poses (B16): hurlTell (staff swept low, robes billowing), devilTell (staff spun overhead), draftTell (staff pointed down),
  bladeTell (staff drawn back across body), blastTell, howlTell, fallen/reel-hit (a stagger per counted blow), rise. Greybox reuses frames 1/3.
- His attacks (all placeholder streaks in `callerAttacksDraw`): the hurl's wall of wind + dust streaks, the dust devil whirlwind (and its ride),
  the downdraft ring + slamming column, the gale blade crescents + the HIGH/LOW glyphs over his head, the pit's updraft and its throw.
- Summit: the PIT (rock lip, wind streaks rising), the EAST CORNER thorns, the ledge pillars (wind-carved stone, routeSupports caller:true;
  the east ledge's pillars must fall with it in P3), flags/updrafts readable.
- THE GALE STAIR: tor-country tiles already apply (moorRocks x0..703); the CRAG face, the WIND HOLE cave, the far rock, the gully stones, the
  two stair gale updrafts (their own vent art), flags. GALE HARPY uses rookery2art's sheet as is.
- Music: none new (the moor's Northumberland + his windcaller boss theme stay). Optional: a gust whoosh for the hurl and a devil spin loop.

## QUESTIONS FOR DANIEL (each built as the rec)
1. LEVEL-QUALITY 'bands' (11% of the width offers a second height; the bar is 40%) was red before this lane - it is the old moor's ground walk;
   fixing it is a rework of the existing sections, which the brief forbade. Rec: leave moor ungated; a later polish pass adds upper routes.
   Built: the stair adds a paid pocket (the route row is now OK) and nothing else.
2. WEST CORNER THORNS: built with both corners first, but the west updraft stands by that wall and a P2 west gust blew its rider straight onto
   them (windcaller-gusts 'not upwind' hurt every hero). Rec: thorns in the EAST corner + the pit only. Built: that (main.js callerCorners
   still grows arena.cornerRise thorns at the fight's start if they are wanted back).
3. THE GALE HOME, the standing stone and the hail wall are retired (no thorn strip to reset you over; hurl/devil and the P2 downdraft replace
   the stone and the wall). Rec: keep retired. Built: retired.
4. KNIGHT 11/12 vs warden/pyro 6/12: his shield turns three of the seven moves. Rec: accept (in band, no hero at 0) and look again in the
   SONNET tune lane at n=12 after art (e.g. the hurl braced only by crouching). Built: as measured.
5. ON-LEDGE DEFENCE: three blows landed in under a second and the hero was never touched. Added: the blow before the last makes him GATHER THE
   WIND at once (red !!, 0.4x while he gathers, STEP BACK) - "two, step back, one". Rec: keep. Built: kept.
6. ATTACKS ONLY IN THE STILL leave him ~2.6 s of every 5 (1.7 of 3.6 in the storm), so each blow was raised ~x1.35 to hold the band (bolt 30,
   blast 34, hurl 20, devil 14, downdraft 24, blades 20). Rec: keep; tune in the sonnet lane. Built: as listed.
7. The summit gust IN THE AIR now carries only a hero an updraft lifted (last 1.4 s): stepping off a ledge just drops you (it used to carry
   you 7 tiles into the middle updraft or the pit). Rec: keep. Built: kept.
8. GALE HARPY merge order with ROOKERY 2 (copied, see top). Rec: merge rookery2 first, then this; on conflict keep rookery2's lines + galeWorld.
9. The stair's gully is a BACKWIND (same beat as the stair, blowing west), not the alternating wind I first built: an alternating gust carried
   a gap ride clean over the exam. Rec: keep. Built: backwind.
