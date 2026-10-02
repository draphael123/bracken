# claude/redgorge - THE RED GORGE FIX (Opus, 2026-10-02)

The review's work list (scratch review of claude/redgorge 87f983ac): all P1 and P2, UPGRADE D, the gorge's own music, THE GREAT RED CRAB's theme, and Daniel's mid-lane playtest stall. Branch `claude/redgorge`; merged origin/master 52d768d1 first (only the geomancer airUp line).

## What changed

### P1-1 The real-keys route pilot: `tools/redgorge-route.mjs` (new, not in the suite)
- A scripted hand, as tools/welltown-route.mjs: a fresh-save LEVEL-1 knight, god off, every foe alive. It holds a direction, hops ledges, holds UP on a rope, stands on a basket and waits for the water, presses E at a wheel, swings at what is in its way. It never blocks or dodges.
- Every leg prints health left and DAMAGE BY SOURCE (flood, burst, slinger, raptor, cutthroat, scorpion...).
- A death or a miss takes the hand back to the leg's foot (a RETRY, counted). A leg failed three times is LIFTED past (a teleport, counted and named).
- Two plans: `gate` (shut the falls' and narrows' gates first) and `race` (race the next flood up both ropes).
- `node tools/redgorge-route.mjs [gate,race] [hero] [god] [--dbg]`

### P1-2 The danger moved to the peaks (`src/red-gorge.js`)
- THE JAM:
  - the jam-lip SLINGER stands ON the jam's east end, seven rows over the wheel;
  - the east overhang now starts at col 34, so cols 27-33 over the wheel and bridge four are open to him;
  - he is dug in over the water line, so a natural flood leaves him and only the burst that breaks the jam takes him.
  - Two KNIVES wait on the overhang's top and leap down the slot when the jam's gate is shut (`squad 'jamDrop'`, src/red-gorge-hands.js).
  - A raptor keeps bridge four (guard row 68; raptorBridge3 moved here, so bridge three has none).
  - The review's west-face niche was measured and rejected: every arc from there breaks on the jam's own top.
- THE NARROWS (the exam):
  - the basket stops at row 65 on a LANDING under the west mass, which holds the top wheel and its two knives;
  - bridge five is four rows higher (46 -> 42), so the rope is TWENTY rows (43-62);
  - the rope's foot is still eight rows over bridge four, out of the highest jump (tools/redgorge.mjs asserts it), so the basket stays required;
  - raptorsB guards row 58 and hunts the rope's lower half;
  - the narrows slinger's shelf moved up with the bridge (48).
  - The summit section shrinks to rows 22-42; its ledges, foes and raptor are re-spaced.
- THE FALLS: the step scorpion (30,138) is deleted.

### P1-3 THE RAPTOR'S PLUME is cut (Daniel)
- The four-feather vault pays ONE SILVER.
- RELICS.plume, its icon and `bakePlumeIcon` are gone.
- The relic multiplier in the flood is gone.
- tools/redgorge.mjs asserts the vault's silver sits behind the woven door, and that the gorge has no relic.
- The concept doc is updated.

### P2 fixes
- **The crab's phase two:**
  - his line is trimmed to `HE SMELLS THE HELD WATER`;
  - at the bank, while the held water stops him, he REARS (the claws-up pose, no mark) and hisses, and the water over the dam's gate drips (at most once per 3 s);
  - his first phase-two scuttle that ends in the channel throws dust and draws a ring.
- **The bridges draw as rope and plank:** `L.ledgeZones` on every bridge and the old nest's bridge -> `LEDGE_SETS.lashed`. The climbing ledges stay rock.
  - The review said `L.timberPlanks`, but that only covers PLANK tiles; the bridges are ONEWAY.
- **Slingers off-screen:** in the gorge a slinger throws only at what the camera shows under him: 120 px, or 168 px while the camera looks up a climb (`w.rise`, src/desert-foes.js; any other level is unchanged).
- **The flood takes foes:** a common foe the water catches near a hero is dropped through the bridge, pushed to the bank and loses half his life; a burst takes him outright. Elites, flyers and the boss stand it.
  - Idle foes moved into channel spans: mouthTop -> bridge one's span, the caveLedge pair -> bridge three's span, one summit knife -> the old nest's bridge.

### UPGRADE D: the look-up camera
- On a rope, or on a gorge basket, the camera looks 48 px up the climb.
- It reuses STORMHOLD's `L.climbLook` flag, so only the gorge and STORMHOLD (unchanged) use it. Every other level's camera is untouched.

### Daniel's playtest stall (fixed mid-lane)
- He stood on bridge two and could not see the way on. The way on is THE LEDGES BASKET: a 2-tile berth flush with the bridge, with its rope going up.
- Fix, the canal's approach:
  - a pulsing GLINT on what the climb needs next (the falls' rope, a basket, the jam's wheel, the narrows' rope), with a chevron when it is off the screen;
  - after 10 s without 3 rows of headway, a NUDGE naming it, e.g. `THE BASKET: STAND ON IT. THE FLOOD WINDS IT UP` (again after 25 s at most);
  - the basket is drawn as a woven basket with sides and a rim.
- No sign spoils it. The probe asserts the glint and the nudge on bridge two.
- **Stall points I found** (the glint and nudge cover each):
  - bridge two -> the ledges basket (Daniel's). A related trap: while the basket is up, its berth is a hole in the bridge, and you fall to the falls' west lip at row 128. The way back up is the falls' rope.
  - the falls' rope foot is in the channel;
  - THE JAM's wheel;
  - bridge four -> the narrows basket, which has the same berth hole: you fall to the west lip at row 80, and the way back is the rope at col 4;
  - the landing -> the narrows' rope. The basket's shaft is a 2-tile gap while the basket is down, so you must jump it, then hop up to the rope's foot.

### Music
- **THE RED GORGE plays "Old Road" by Kevin MacLeod** (CC BY 4.0, Daniel's pick; downloaded by him, the lane downloaded nothing).
  - `audio/redgorge.ogg`: the last 2 s crossfaded onto the first 2 s for a clean 111.95 s loop, +4.1 dB under a -1.5 dBFS limiter -> -12.4 LUFS, Vorbis q4.
  - The exact credit is in `MUSIC_CREDITS.redgorge`, in `audio/CREDITS.txt`, and whole on the credits page's CC-BY section (src/credits.js; the page now takes each licence's own URL and the licensor's own wording).
  - The Sound Test row cannot hold the exact credit (textfit TRUNCATED), so it shows `MUSIC_CREDITS_ROW.redgorge` (`"Old Road" — K. MacLeod, CC-BY`).
  - The REPORT_ONLY music row for redgorge is deleted. 'redgorge' and 'gorgecrab' are in the Sound Test.
- **THE GREAT RED CRAB's theme** (src/boss-music.js, replaces the placeholder):
  - A Phrygian, 110 bpm, 16 bars = 35 s;
  - stomping low toms, a claw clack on 2 and 4, hats on the off-beats;
  - a sub/saw drone that rubs up to Bb;
  - a stuttering syncopated bass;
  - a detuned brassy lead that sidesteps in half-steps;
  - every fourth bar STOPS on beat three.
  - PHASE TWO (BOSS_PHASE, set by src/gorge-crab-hands.js) doubles the hats and adds a flood-surge sweep.
  - tools/boss-music.mjs now checks it, including that phase two adds the clacks.

## Numbers before -> after

**Level-1 pilot row** (docs/level1-pilot.json, knight, 3 runs): 9 blows, 0 deaths, 48 lifts -> **12 blows, 3 deaths, 45 lifts**. The lifts are still the bot's teleports past ropes and baskets; the honest measure is the route pilot below.

**Mash level row** (L31): knight dies / warden 37% / pyro 33% -> **knight dies / warden 17% / pyro 23%** (29 lifts).

**Real-keys route** (tools/redgorge-route.mjs, L1 knight, god off; single runs, so timing varies):

| leg | review (before) | after, gate plan | after, race plan |
|---|---|---|---|
| the falls | race at the horn: swept 34; waiting in the channel: died | 0 (a careful wait) | 0 |
| the ledges basket | raptor 27 | raptor 133, cutthroat 14, slinger 19; 2 deaths | raptor 147, slinger 19; 2 deaths |
| THE JAM | **0** | 0-27 (raptor) | 0-27 (raptor) |
| THE NARROWS (basket + rope) | **0** (race cleared by 3 s) | raptor 27, flood 34; died, lifted once | raptor 27 + 91; one death |
| whole run | 9 blows (bot) | 2-3 deaths, under 40% 2-3 times | 2-3 deaths, under 40% 2-3 times |

- Targets met:
  - the narrows now costs the L1 knight well over 25% (it killed him in both plans);
  - the falls cost less than the narrows;
  - the run dips under 40% at least twice and dies.
- The jam is the weak one: 0 or 27 depending on how soon the flood comes. A careless hand still waits it out sheltered under the overhang's east end. See question 2.
- The ledges basket (the basket's teach) is the most expensive leg for a non-dodging hand: the shaft raptor stoops while it waits. See question 3.

**Boss pilot** (tools/redgorge-pilot.mjs, 21 fights, L31, human bot):
- Before (the build lane): 14/21 = 67% (knight 3/7, warden 4/7, pyro 7/7).
- Re-run on this branch before tuning, all fights in one page: 9/18 = 50% (knight 5/6, warden 1/6, pyro 3/6).
  - Every warden death had the crab at 0-2%.
  - The page then failed to reload ("fresh lab page did not initialize") at the same fight twice, while Daniel's playtest and other lanes loaded the PC.
- The knight's hitBy is NOT dominated by the pinch (crush and boulder tells, 52-119), so the review's pinch fix does not apply.
- Tried in 9-fight samples:
  - crush tell 0.95: 44%;
  - openMul 1.75: 44%;
  - the human bot stepping out of the spillway at the horn during the opening: no change;
  - all three reverted.
- **Built: the opening is 4.0 s** (from 3.5; no boss hp, no multiplier). Run ONE FIGHT A PAGE, salts 1-7: **14/21 = 67%** (knight 4/7, warden 4/7, pyro 6/7).
- Note: one-fight-a-page and all-in-one-page rows differ for the same salt, so the lane's old 67% was an all-in-one-page number.

## Checks (named, never the suite)
Green:
- redgorge, redgorge-probe (16 asserts), level-quality (redgorge clears, music now its own)
- mash-gate, boss-greed, boss-openings, audio-assets, boss-music, soundtest
- textfit (soundtest + credits, --strict: 0 truncated), tells, hint-shown
- architecture, checkpoints, checkpoint-gaps, skins, dangling-paths, npc-removal
- floaters, dressing, collectables, spawns, one-new-foe

- Also green: boss-fight-end, boss-openings (the crab's 4.0 s opening), slopes-trace (every traced level identical; redgorge is not traced), and redgorge-probe (all 16 asserts).
- The mash rows were re-stamped: boss 0/6 (every mash hero dies with the crab at 95-99%), level warden 17%, pyro 23%, knight dies.

## UNVERIFIED
- Nothing played by hand by me; Daniel was playtesting the worktree while I worked.
- The route pilot's legs are single runs; the jam's cost swings with the flood clock.
- The rear borrows the crush-tell pose (claws up) until the art lane draws its own; it carries no mark.
- The crab theme was heard by the scheduler test only, not by ear.
- The level-1 / mash rows still carry the bot's teleport lifts (45 / 29).

## Merge notes
- One `banditking` OPEN_RULE row kept, untouched.
- No welltown files touched. src/audio.js: redgorge sits on its own line at the end of TRACKS, and the names are at the end of MUSIC_NAMES. The welltown fix also edits those lines, so expect a trivial conflict.
- audio/CREDITS.txt: both lanes append a section at the end; keep both.
- The map node is unchanged at (136,120); it must pass the map-spacing check once claude/mapspace lands (that tool is not on this branch).
- Shared edits:
  - src/desert-foes.js: `w.rise` (optional, default unchanged);
  - main.js `lookingUp()`: STORMHOLD unchanged;
  - updateDesertFoe's grav: `e.rgFall`;
  - the credits page loop.

## QUESTIONS FOR DANIEL (the recommended option is built)
1. **The vault pays one silver** (your call). Is four feathers for one loose silver worth it? *Rec:* keep one silver. *Alternative:* move the Cave of Hands' silver into the vault, for 2.
2. **The jam is still cheap for a patient player:** the east end of bridge four is roofed. *Rec:* keep. The slinger, the leaping knives and the raptor make the wheel itself dangerous, and you must stand at it twice. *Stronger:* end the overhang at col 38, or add a second jam-lip slinger.
3. **The ledges basket costs the most for a careless hand** (the raptor stoops while you wait for a flood). *Rec:* keep. A player reads the red X and steps aside. *Softer:* raptorShaft hunts only while you are ON the basket.
4. **The narrows' rope is 20 rows because bridge five moved up four rows.** A rope foot lower than row 62 could be jumped to from bridge four, which would make the basket optional. *Rec:* keep.
5. **The Sound Test row cannot hold MacLeod's exact credit.** It shows a short row, and the exact wording lives in MUSIC_CREDITS, CREDITS.txt and the credits page. *Rec:* keep.
6. **The crab's opening is 4.0 s** (from 3.5) to even the heroes out without touching his hp. *Rec:* keep. *Alternative:* 3.5 s with the pyro's bank-side line of sight cut by the burst's spray (not built).
7. **The glint and stall nudge (the canal's approach).** *Rec:* keep in the gorge, and make it the house rule for the desert levels.
