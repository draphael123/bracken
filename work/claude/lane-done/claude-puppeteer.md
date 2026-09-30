# claude/puppeteer - THE PUPPETEER, the boss of THE MASKWRIGHT'S THEATRE (new boss lane, 2026-09-30)

Branch `claude/puppeteer`, based on `claude/housekeep` a6d58b4 (master 5d25df0 + the Maypole Ribbon). origin/master was fetched before this
report: nothing new, it is already in. I didn't touch master, deploy, or run the full suite.

## What he is

He works marionettes from the fly gallery over the stage. The fight has one rule: **CUT THE STRINGS.** The design record is the header of
`src/puppeteer.js`.

- **The rule.** His puppets are wood: a blow on a body clacks and does nothing ("WOOD: CUT THE STRINGS" in the hint box). Each puppet hangs on
  strings that run up to the bar in his hands. A string can be cut only while it is **taut**, which is exactly when the puppet is doing something:
  through every windup and every blow, and while it is being flown up or let down. A taut string is drawn straight, glowing gold and pulsing;
  a slack one hangs grey with a sag. Cutting a string during a windup **cancels that blow** and staggers the puppet. **One string per puppet per
  swing**: a small puppet has two strings, so it takes two blows, and the second drops it in a heap.
- **Phase 1, THE PLAY.**
  - Two marionettes on the stage floor:
    - THE SOLDIER: a chop, `!` (block it).
    - THE HARLEQUIN: a spinning kick along the boards, `!!` (jump it).
  - THE DROP, `!!`: every third blow, he hoists a puppet over you and lets it fall. Its shadow grows red on the boards under you first.
  - With both cut down, he rides his fly line to the stage and kneels to re-string them. That is the opening: **OPEN** for 2.8 s at x1.25.
    You see a gold ring round him, OPEN over him with a bar running down, the boss bar reading "THE PUPPETEER  OPEN", and the hint box saying
    "HE IS RE-STRINGING THEM: CUT HIM".
  - If one puppet is down and the other still dancing, after 6.5 s he lowers a new string to the heap. It glows and can be cut on the way down.
- **Phase 2, THE LOFT (2/3).**
  - He cuts his own fly line and won't come down again.
  - THE COUNTERWEIGHT comes free. The pin rail at the stage door was locked with an iron band (a strike says "THE PIN RAIL IS LOCKED"); now it
    glows. Stand on the batten, strike the rail, and the sandbag drops while the batten flies you up to the gallery. It holds there 4.5 s, then
    comes down.
  - In the loft, his puppets are flown up to your floor.
  - He fights with the strings:
    - THE WHIP, `!!`: low (jump it) or high (duck it), told as a red band along the catwalk with an arrow at your hero.
    - THE SNARE, `!!`: a glowing loop drawn tight at your feet. Step out, or be caught (it uses the game's existing breakable `P.snare`).
  - Cut both puppets down up there and he re-strings them where he stands: open. If he re-strings while you are still on the stage, the hint
    says "HE RE-STRINGS THEM IN THE LOFT: CLIMB".
- **Phase 3, THE MASTERPIECE (1/3).**
  - He packs the two puppets away and lowers a carved wooden king twice a man's height on four strings from a great crossbar. Its moves:
    - THE SWAT, `!` (block it).
    - THE STOMP, `!!`: a red mark on the boards where its foot will land.
    - THE REACH, `!!`: only while you are in the loft. Its arm sweeps the catwalk at head height (duck it).
  - Its hand strings can be cut from the stage with a jump. Its head and back strings can only be cut from the gallery, where they pass the
    catwalk.
  - Cut all four and it falls, and the crossbar drags him off the gallery. He lands on the stage, **OPEN** for 4 s at x1.4, then climbs back and
    rigs it again.
- **The rest of the time** his hands on the bars guard him: a blow that reaches him does x0.2, and the hint box says once "THE BARS TAKE IT: CUT
  HIS STRINGS FIRST". So he is never untouchable (rule A5), and every window is caused (rule A11).
- **Health is not the lever.** 720 base (648 at normal). The levers are the window lengths in `PUP`.
- **His death:** every puppet drops where it hangs and a red curtain comes down over the stage ("THE CURTAIN FALLS").

## Phase 3: why the giant marionette, not stringing the hero

I built the masterpiece. Stringing the hero (the controls tugged, told and short) is Question 1.

- **It keeps the fight's one rule and raises it.** It is still "cut the glowing strings", now on two floors: the hand strings from the boards,
  the head and back only from the loft.
- **Your controls stay yours.** A tug on your controls reads as a bug in a platformer, it is hard to tell fairly, and a bot pilot can't measure
  whether it is fair.
- **It gives the fight a physical climax:** his own crossbar pulls him down to you.

## Files

- **New:**
  - `src/puppeteer.js`: the fight. It is pure (no DOM). It also holds the stage builder `stagePuppeteer`, the standalone `buildPuppetStage`,
    and the bot's `puppetPlan`.
  - `src/puppeteer-hands.js`: binds the fight to the world, and draws the rig, the strings, the tells, the batten, OPEN and the curtain.
  - `src/redraw/puppeteer_art.js`: all four sprites, px.js only. The Puppeteer has 13 frames, the Soldier and the Harlequin 9 each, the
    Masterpiece 11.
  - `tools/puppeteer.mjs`: the check.
  - `tools/puppeteer-pilot.mjs` and `tools/puppeteer-shots.mjs`: not in the suite.
- **`src/main.js`: 28 small, local edits** on the A8 wiring points:
  - the import, EHP and COLS, the spawn cases, and the update dispatch (placed before the 420 px freeze and the attack tokens);
  - the frame, the sprites, bossEnd, the corpse frame, the bestiary rows (him and his three), BOSS_T and BEAST_SHORT;
  - POISE_SKIP and KNOCK_SKIP (added after the existing first names, never at the front), windingUp, BOSS_FELL, the boss-bar name, bossOpen and
    wardedDamage;
  - a blow on a puppet body goes to `hurtEnemy0` (wood); a swing goes to `updateProps` (strings and pin rail);
  - the batten goes into `updateMovers` and the mover draw;
  - two draw hooks, the camera (the whole stage floor to grid when the view is tall enough), the wake sound, `BK.puppeteer()` and
    `BK.puppeteerHands()`, and the hands' construction;
  - the show is cleared in `spawnEntities`.
- **Also changed:**
  - `src/lab.js`: the bot block, which calls `puppetPlan`.
  - `src/marks.js`: BY_HAND, ANSWER and HEIGHT rows, then `tells.mjs --write`.
  - `src/hint-lines.js`: 10 teaching lines, appended at the end.
  - `src/audio.js`: 9 `pup*` sounds, his hurt and death voices, and his music.
  - `src/threat.js`: puppeteer 6, puppets 0.
  - `src/level.js`: the hidden standalone level.
  - `tools/check.mjs`: `puppeteer` added to the list.
  - `tools/boss-openings.mjs`: his probe.
  - `tools/boss-navigation.mjs`: a `puppetstage` row that asserts the pilot rode the batten up and stood on the gallery.
- **Music:** his own synth track, `puppeteer`. No file and nothing downloaded: a D-minor march for a toy theatre (a music box over an organ
  bass, timpani on the bar, 132 bpm). `arena.music` is `'puppeteer'`.

## For the theatre lane (claude/theatre) and the merge

- In the theatre's builder, lay the main stage with `const { arena, movers } = stagePuppeteer({ set, block, plat, ent }, T, TS, sx, R)`:
  - `sx` is the stage's west wall column, and the stage is 40 columns wall to wall;
  - `R` is its floor row, and rows `R-16` to `R+1` must be free;
  - put `arena` in the level's return and add `movers` (the batten) to its `moversExtra`;
  - a checkpoint should stand outside the west door.

  The theatre may override `arena.music` (default `'puppeteer'`) and the tint.
- **When the theatre lands, delete the hidden `puppetstage` row** at the end of LEVELS in `src/level.js`, and pass the theatre's id to
  `tools/puppeteer-pilot.mjs`. Two lines also need re-pointing: the boss-openings probe (`boot('puppetstage')`) and the boss-navigation row.
  `tools/puppeteer.mjs`'s STAGE block reads `puppetstage` too.
  - If the theatre merges first, `puppetstage` lands after it. Taking it out then moves no index as long as it is the last row.
- `?boss=puppeteer` works now: the boss table reads the levels, and the hidden stage is one of them. It is not in Boss Rush or the Level
  Editor (both parked).

## Checks (each run by name)

**Green:**
- puppeteer (new);
- boss-fight-end (47 fights, his included);
- boss-openings (his probe: left alone for a minute 0 open; cut down he comes down open 2.8);
- boss-navigation (4 rows; the puppeteer knight wins and stands on the gallery);
- tells;
- architecture;
- skins;
- dangling-paths;
- hint-shown (130 routed, none new silent);
- audio-assets;
- attack-tokens;
- npc-removal;
- also checkpoints, checkpoint-rule, checkpoint-gaps and comments.

**Re-run alone after a failure under load:**
- **boss-navigation** failed once with "Runtime.enable did not answer" while other Chrome runs were going. It passed alone.
- **attack-tokens** failed once with "only 3 red !! blows". The threshold is fewer than 4, and the base a6d58b4 gets exactly 4 on both runs,
  so the check sits on its edge. It passed alone with 4.
- **dangling-paths** failed on my own comment, which cited the theatre's file (not on this branch). I reworded the comment and it is green.

**slopes-trace** wasn't run: it traces four fixed shipped levels and I changed none of them. The hidden stage isn't in it.

**The new check goes red:**
- On a6d58b4 (`ERR_MODULE_NOT_FOUND`: there is no fight module).
- On all six mutations of `src/puppeteer.js`, each caught by its own assertion:
  - strings always taut;
  - open while working;
  - a cut doesn't cancel the blow;
  - phase 2 frees nothing;
  - no descent;
  - no yank.

## Pilots (AFTER only: he is new)

`node tools/puppeteer-pilot.mjs 1 knight,warden,pyro`: normal health, one life, the standalone stage, seed salt 1.

| hero | outcome | seconds | damage taken | strings cut | comes down / re-strung in loft / fell with the masterpiece |
|---|---|---|---|---|---|
| knight | win | 83.8 | 0 | 24 | 2 / 2 / 2 |
| warden | win | 113.0 | 0 | 36 | 4 / 3 / 2 |
| pyro | win | 97.5 | 14 | 28 | 3 / 2 / 2 |

- **3 of 3 wins, median win 97.5 s.** That is inside the house band for time (90-150 s), and it sits past the Wicker Queen's pilot (61 s).
- **The bot reads perfectly.** It knows every string's crossing point to the pixel and cuts every windup at once, so almost no blow lands
  (chop 0, spin 0-1). For a player the tell is 0.7-0.85 s.
- **Tuning so far:** the first version gave 5 s windows at x1.35, and the knight won in 43-54 s. It is now 2.8 s at x1.25 on the stage and in
  the loft, and 4 s at x1.4 for the fall.
- **A bug the first pilot found:** `bossLab` (and boss-fight-end) kill every non-boss foe without `maxHp`, and that killed his puppets. The
  puppets now carry `maxHp`, and anything that puts a puppet away some other way only makes a heap he re-strings.
- **Another the pilots found:** the soldier's strings attached at 17 px, above the warden's point and the pyromancer's staff (15-16 px). Both
  lost in phase 1. The hands now sit at 8-12 px.

## Captures

`node tools/puppeteer-shots.mjs` played one bot fight and saved stills to `work/claude/puppeteer/`, one per beat:
- 2: the drop's shadow;
- 3: he kneels re-stringing, OPEN;
- 4: the batten flying the hero up;
- 5: the flown puppets in the loft;
- 6: the whip told along the catwalk;
- 7: the snare;
- 8: the masterpiece's reach, told;
- 9: he fell with it, OPEN;
- 10: the curtain.

There is no still of a soldier's chop windup, because the bot cuts it before the frame is taken. Stills 2-7 were taken before I added the
stage's indoor backdrop, so the town and its clouds show through them. Stills 8-10 have the backdrop.

## UNVERIFIED

- **Nobody has played him with hands.** Untested: whether the glowing string reads as the thing to hit in a 0.7 s windup, whether the pin rail
  and batten are found without being told twice, the snare's mash-out, and the masterpiece's head and back strings seen from the loft.
- **The audio has not been heard.** The sounds and the overture were written by numbers.
- **Only the knight, the warden and the pyromancer were piloted.** Paladin, pirate, reaper and geomancer have not fought him.
- **Co-op was not tested.** The hands loop over every player, and the nearest hero is the one targeted.
- **The standalone stage is not the theatre.** Its backdrop is a plain interior on the village palette, and the look is the theatre lane's.
- **The stage and gallery only fit on screen in the zoomed boss view.** In the plain 320x180 view the camera follows you and leans toward him.
- **Only melee cuts strings.** A thrown javelin, an ember or a pistol ball does not.

## QUESTIONS FOR DANIEL (recommendation first; the recommended option is built)

1. **Phase 3.** Built: the giant marionette (reasons above). The alternative is stringing the hero for a moment. Recommend keeping the
   masterpiece.
2. **The facing rule.** Not tied in. The theatre comes before the Harvest Fair, so a puppet that moves only when unwatched would teach the
   fair's rule before its level does. Recommend leaving it out. A late option is a harlequin that turns its head to watch you, as foreshadowing
   only.
3. **Music.** Built: his own synth overture, `puppeteer`. It is not in the Sound Test (that would need a credit line and textfit), and
   `tools/audio-assets.mjs` doesn't read the hidden stage's music. The alternative is to let the theatre's own track carry into the fight
   (set `arena.music`). Recommend keeping the overture, and a CC0 file later if you want one (a download needs your yes).
4. **One string per swing.** Built: a small puppet takes two blows, in two windups. The alternative is a swing through both hands cutting both,
   which drops a puppet in one blow and halves phase 1. Recommend one per swing.
5. **Should shots and throws cut strings too** (the javelin, embers, the pistol)? Recommend yes, as a small follow-up, if playtests find the
   ranged heroes struggle. Right now it is melee only, and all three piloted heroes win.
6. **TIER.** The standalone stage has no TIER. The theatre level's TIER is the theatre lane's call, the same as the fair's question 4.
   Recommend no TIER, and tune by the windows.
7. **His reward.** None built. A relic slot is the level's to decide. Recommend that the theatre lane decide it.
8. **Difficulty.** The bot won 3/3 with a median of 97.5 s. Recommend playing him first. If he is too easy, shorten the re-string window
   (2.8 s) or lengthen the gap before the next string comes down (6.5 s); never raise his health.

---

# PUPPETEER2 (2026-09-30, after Daniel played it: "cool concept but repetitive and very easy", and the gallery was "a wood platform that doesn't quite fit")

This round builds everything he approved, on `claude/puppeteer` in the same worktree. His health is unchanged (720 base, 648 at normal). All
of this lives in `src/puppeteer.js`, `src/puppeteer-hands.js` and `src/redraw/puppeteer_art.js`.

## 1. Every cycle changes

A cycle ends when he re-strings, and each new cycle changes three things.

- **The pairing (`PAIRINGS`).**
  - Cycle 1: the Soldier and the Harlequin.
  - Cycle 2: the Harlequin and **THE ACROBAT**, a new third puppet (a tumbler in a teal-striped leotard). It is the "Drop" of your list: it is
    hoisted over you and dropped. As it lands its strings jerk taut for 1.1 s, and that is its cut window.
  - Cycle 3 on: all three.
  - A puppet not in the current act waits in the flies. One coming in is lowered from the gallery.
- **One new move (`MOVES`, by `lvl`).** A puppet that comes back re-strung learns a HIGH move:
  - the Soldier's **THRUST**, a head-high lunge;
  - the Harlequin's **HIGH KICK**;
  - the Acrobat's **SWING**, a head-high pendulum sweep across both sides of it.

  All three are `!!` and answered by ducking. None of them fires in the first cycle.
- **A told scene change (`SCENES`, `sceneOf`).**
  - The lights drop and the scene's name is said ("SCENE CHANGE: WATCH THE BOARDS", in the hint box).
  - Over 1.8 s the new painted flats ride in on their tracks (the tracks glow gold) and the old ones ride off, while the boards that will open
    flash red.
  - Then the layout lands. **Flats** are ONEWAY ledges 3-5 rows up with a painted canvas under them. **Trapdoors** open two-deep pits in the
    boards (you jump out).
  - The scenes are THE BARE STAGE, THE FOREST, THE CASTLE and THE STORM AT SEA. Two cycles in a row never share a layout.
  - A trapdoor with a hero in its pit stays open until he is out.
  - Puppets are flown to whatever height you stand at: a flat, the gallery, or a pit.
  - Phase 3 changes the scene too, before each re-rig of the masterpiece.

## 2. He fights too, and puppets pair

- **His own blows from the loft**, when you are below. He rotates through three, one every 7 / 6 / 5 s by phase:
  - **SANDBAG** (`!!`, dodge): its shadow follows you, then stops, then the bag falls. 16 damage.
  - **SPOTLIGHT** (no mark; it throws no blow): a beam swings onto you and settles. If you are standing in it when it lands you are DAZZLED for
    2.2 s: a white glare over the view, and **the strings' gold glow is lost in it**.
  - **SCENERY** (`!!`, dodge): he frays a line and a painted flat hangs over a red band, then falls. 22 damage.
- **One told threat at a time.** None of his blows begins over a puppet's windup, and no puppet begins over one of his. He also never starts
  one while a puppet is half-cut, so your finishing window stays yours.
- **PAIRS.** Every third turn, once the stage holds a high move and a low one on two different puppets, two puppets wind up together.
  - **The high blow lands first; the low one 0.55 s later.** You duck, then jump (or step out of the drop's shadow), or cut one of them in its
    glow, which cancels only that one.
  - A pair's low half is always the spin or the drop, never the chop, so it never needs a block and a jump at once.
  - The check proves it: a hero who ducks then jumps takes 0 damage, and one who stands still is hit.

## 3. Harder cuts

- **The glow is short.** A windup's strings are gold only for its **last 0.4 s** (`PUP.glowT`), not the whole windup. A swing before the gold
  cuts nothing.
- **Grey decoys** (from the second cycle, one per small puppet). A dull grey string with red tags that never glows. It runs from the middle of
  the bar to the puppet's belt, between its two real strings, so a swing thrown before the gold crosses it.
  - A swing that cuts nothing real and crosses a decoy **snares you** for 1.0 s ("A DECOY: IT SNARES. WAIT FOR THE GOLD").
  - A swing that does cut a real string never springs the decoy.
  - The decoy itself does no damage; what hurts is whatever lands while you are held.
- **Re-tie.** A half-cut puppet ties its cut string back **3.5 s** after the cut unless you finish it. A ring closes over the knot and goes red
  near the end. The masterpiece's strings re-tie too, 7 s after each cut.
  - To make finishing it possible: the half-cut puppet takes the next turn at once (a 0.6 s stagger, then its next windup), and no pair or
    blow of his starts meanwhile. That second glow is a chance, never a sure one.
- **Also:** one string per puppet per swing; the lowering new string is still gold and can be cut.

## 4. Tighter numbers (health unchanged)

| number | before | now |
|---|---|---|
| re-string window, stage and loft | 2.8 s | **1.8 s** |
| the king's fall | 4 s | **3 s** |
| warded chip on him | x0.2 | **x0.05** |
| chop / spin / drop / stomp / swat / reach | 16 / 18 / 22 / 26 / 20 / 20 | **18 / 20 / 22 / 28 / 22 / 22** |

- The new blows: thrust 20, kick 20, swing 20, sandbag 16, scenery 22.
- These sit with the Wicker Queen's lash (20) and sickle (26). The game's normal difficulty multiplies what you take by 0.8.
- **Change beyond the brief:** a window is worth more.
  - Being open while he re-strings is now **x3.0** (it was x1.25), and the fall is **x3.2** (it was x1.4).
  - With 1.8 s windows at the old value, the pilots needed 8+ cycles and 200-400 s per fight.
  - He has fewer windows now, each shorter, and each is the whole of a cycle's work (Question 3).

## 5. The human bot (`PLAN` and `puppetPlan` in `src/puppeteer.js`, used by `src/lab.js`)

- **Reaction:** it sees a tell or a glow 0.25 s after it begins.
- **Decided once per windup:** it goes for the string or answers the blow, and it **lets 25% of glows go**.
- **It misreads 12% of tells**, and **swings too early 8% of the time** (so it finds decoys).
- **It can't see the gold while dazzled.**
- **It anticipates like a player:**
  - steps in toward a windup's string before the gold;
  - runs to where he will land when he starts down;
  - waits just outside a puppet's reach;
  - stays on a half-cut puppet;
  - jumps out of a pit.
- The bot's dice are the boss lab's seeded row dice.

## 6. The iron fly gallery, and nothing left reading as generic wood

- **The gallery** now wears an iron grating tile: a warm lit lip, grating gaps, a channel stringer with rivets, and a truss under it
  (`bakeStageSkins`). A glowing line along its edge makes the footing read against the flies.
- **Behind it** runs a **fly rail**: an iron pipe on posts, brass belaying pins with coiled lines, and each line running up to the grid.
- **The batten** is an **iron pipe on steel lines with a painted sky flat hung under it** (only the part above the boards shows).
- **The pin rail** is iron with brass pins. The gallery's hangers are steel.
- The control bars stay wood, because marionette controls are wood.
- **One bug found and fixed:** a pilot bounced for a minute on a flown puppet's head (the game's stomp). He and his puppets are now outside the
  touch-and-stomp contact loop in `src/main.js`.

## The theatre lane: footprint change

- `stagePuppeteer(W, T, TS, sx, R)` keeps its **signature**: it returns `{ arena, movers }`, still 40 columns, stage rows R-16..R+1.
- **New:** **row R+2 must be SOLID under the whole stage.** Trapdoors open rows R and R+1, and the pit's floor is R+2.
- **New:** the stage now places **three** puppet entities: marionette, harlequin and acrobat. The acrobat waits in the flies until its act.
- The scene changes write into the level grid. A fresh attempt puts the boards back from the level's own cells.

## Checks (each run by name)

**Green:** `puppeteer` (rewritten), boss-fight-end (47 fights), boss-openings, boss-navigation (the puppeteer knight wins in refill mode and
stands on the gallery), tells, hint-shown (132 routed, none new silent), audio-assets, architecture, skins, dangling-paths, npc-removal,
attack-tokens, checkpoints, comments.

**Test changes:**
- `tools/boss-openings.mjs`: his open window must now be at least 1.7 s (it was more than 2 s), because the window is now 1.8 s.
- `tools/puppeteer.mjs` asserts the new design and is **red on each of fourteen sabotages** of it:
  - glow from the start of a windup;
  - a decoy never springs;
  - a decoy springs on a real cut too;
  - no re-tie;
  - the pairings never change;
  - no new move;
  - the scene change untold;
  - the same layout every cycle;
  - a trapdoor closes on a hero;
  - a pair lands together;
  - his blows start over a puppet's windup;
  - the spotlight dazzles anyone;
  - the old 2.8 s window;
  - the gallery left as wood.
- **One sabotage that could not go red:** skipping my own restore of the boards on a fresh attempt. The game's own death reload already rebuilds
  the grid, so the page assertion ("a fresh attempt puts the boards back") holds either way; my restore is only a second safety net.

**Flakes:** one sabotage run failed with "the page never put up window.BK" while other lanes were loading the PC, and passed on a re-run.

## Pilots (normal health, one life; knight / warden / pyro)

**BEFORE** (e13f1b1, the first build, perfect-reader bot): 3/3 wins.

| hero | outcome | seconds | damage taken |
|---|---|---|---|
| knight | win | 83.8 | 0 |
| warden | win | 113.0 | 0 |
| pyro | win | 97.5 | 14 |

**AFTER** (this build, the human bot):

| seed salt | knight | warden | pyro |
|---|---|---|---|
| 1 | win 81.5 s, took 16 | win 137.8 s, took 18 | win 145.0 s, took 79 |
| 2 | death 138.3 s (him at 93/648) | death 211.4 s (156/648) | win 105.5 s, took 50 |
| 3 | win 100.8 s, took 52 | win 130.3 s, took 41 | death 144.8 s (7/648) |

- **6 of 9 wins (67%), median win 130 s, and 16-79 damage taken on the wins.** That is inside the band (60-75% wins, median 90-150 s). Salt 1
  is the brief's one-seed pilot; salts 2 and 3 are extra.
- It takes about 3-5 cycles, and every cycle changes the pairing and the layout.
- **How the tuning went:** the first cut of PUPPETEER2 killed every bot in phase 1 within 40-100 s. The fixes, in order:
  - an acrobat that could not be cut (its only move hoisted it out of reach), fixed with the landing's taut strings;
  - a drop that tracked faster than a hero can run, now slower and let go at half its windup;
  - re-ties before a second glow could come, fixed with the half-cut turn priority;
  - a turn held by a puppet out of range;
  - he re-strung at the far end of the gallery, so in the loft he now works within reach;
  - the flown-puppet head bounce.
- **Bot calibration stages:** 0% wins → 50% (median 172 s) → 100% (median 128 s) → 22% → 67% (median 130 s).

## Captures

`node tools/puppeteer-shots.mjs` saved 16 stills in `work/claude/puppeteer/`: stills 1-10 from before (now with the iron gallery), plus 11 the
scene change told, 12 a new layout (the forest flats and an open trapdoor), 13 a pair, 14 the spotlight, 15 the scenery, and 16 gold strings
beside a grey decoy.

## UNVERIFIED (PUPPETEER2)

- **Nobody has played this build with hands.** Untested:
  - whether 0.4 s of gold after a visible windup reads as fair;
  - whether the decoy's red tags read against the gold;
  - the dazzle glare's strength;
  - a pair's 0.55 s gap for a human (the check proves ducking then jumping clears it, but a person's hands decide);
  - whether the flats' tops read as ledges.
- **Only three heroes were piloted, over three seeds.** Paladin, pirate, reaper and geomancer have not fought this build.
- **The new sounds were written by numbers and never listened to:** `pupSpot` and `pupScene`.
- **The standalone stage's floor is still the village cobble.** The theatre lane owns the real floor.

## QUESTIONS FOR DANIEL (PUPPETEER2; recommendation first; the recommended option is built)

1. **"Harlequin + Drop"** I read as a third puppet whose move is the drop: THE ACROBAT. The alternative is two puppets plus his own drop.
   Recommend the Acrobat, because it gives the pairing progression a real third body.
2. **The one-new-move ladder** stops at one high move each. From the third cycle on, the "new thing" is the pairs and the layouts. Recommend
   keeping it; a third move each would be another round of tells to learn.
3. **The window multiplier (x3.0 open, x3.2 fall) went up while the windows got shorter.** Without it the fight ran 200-400 s. Recommend
   keeping it. The levers if he is too hard are the glow (0.4 s) and the re-tie (3.5 s), never his health.
4. **Should the decoy hurt?** It snares but does no damage now (the pilots were dying to decoy chip). Recommend no damage: the snare is the
   punishment.
5. **The spotlight** blinds the strings' glow. The alternative is darkening the view; the glow loss is the mechanical sting. Recommend the
   glow loss.

---

# PUPPETEER3 (2026-09-30, after Daniel played PUPPETEER2)

Daniel: "Still really easy, and the enemies are just health sponges. How do I actually attack the boss? Cutting strings doesn't seem to do
anything. Why not make one puppet have fast, weak attacks and the other slow and heavy, and balance the fight around that?"

That was a core-loop failure, so this round rebuilds the fight around **his duo**. Readability came first, difficulty second. His own health is
unchanged (720 base, 648 at normal). The code is still `src/puppeteer.js` (the fight, rewritten), `src/puppeteer-hands.js` (rewritten) and
`src/redraw/puppeteer_art.js`.

## The duo

- **THE HARLEQUIN is fast and weak.**
  - Short strings of **jabs**: 10 each, a 0.36 s windup, `!`. Block them or step back.
  - A **low kick**: 12, a 0.5 s windup, `!!`. Jump it.
  - He runs at 130 px/s, **darts round to your other side** every couple of seconds, and **jumps a hero who stands still** (0.7 s still is
    enough).
  - Fragile: 40 health, and **one string: one cut drops him**.
- **THE BRUTE is slow and heavy.** He is the old soldier puppet, drawn at 1.5x.
  - A **HEAVY CHOP** (1.0 s windup, 32), a **GROUND SLAM** (1.15 s windup, 34; a shock along the boards, jump it) and a **GRAB** (1.0 s windup, 35,
    and it holds you). All three are `!!`: get out from under. After the game's damage scaling, two or three of them put you in trouble.
  - He walks steadily at 58 px/s. At first he hopped at 38, and the bot simply outpaced him: two fights saw no chop and no grab at all.
  - After every swing he stands **SPENT for 1.2 s**, shown by a green bar over him: that is the window to hit him or cut him.
  - 110 health. **Two strings**:
    - the **ARM** string: cut it and the chop and the grab are gone, and the arm hangs limp;
    - the **BACK** string: cut it and the slam is gone.
- **The fight is balanced around the pair.** The Harlequin may strike during the Brute's recovery, so punishing the Brute means handling the
  Harlequin. **Kill order is a real choice:** a dropped Harlequin is down only 4 s, the Brute 6 s, and he comes down only when both are down at
  once.
- **The Acrobat is dropped**, along with the paired high/low blows, the decoys, the re-ties, the spotlight, the sandbag and the scenery. Fewer,
  clearer threats. The scene changes stay: they only bring new flats, during his haul back up. The trapdoors now come only from the Brute's slam.

## Damage is readable

- **Puppets take normal damage.** A blow lands with a flash, a knock, the number and a sound, and takes their health. A health bar sits under
  every standing puppet (green, then yellow, then red, in quarters).
- **Strings are always drawn**, bright, with a knot at the limb, and **cut whenever a blow crosses them**. They attach 13-15 px up, where every
  hero's blade reaches from the boards: the knight's reaches 17 and the pyromancer's staff 15. The masterpiece's high strings need a jump.
- **A cut in the GOLD** (during a windup or a blow) also **cancels that blow** and staggers the puppet: a bonus, not the only moment a cut works.
- **A CUT FEELS HUGE:**
  - a double snap sound;
  - an 80-120 ms hit-stop and a shake;
  - the cut length whips away into the flies;
  - the limb it held falls limp (the Brute's pose sags);
  - the hint box says which limb and which attack is gone ("THE ARM GOES LIMP: NO MORE CHOP OR GRAB").
- **A dropped puppet** lies in a heap with a ring counting out its down time.

## How to hurt him is obvious from the first minute

- He **hangs from his control bar** on a thick line from the grid.
- **Each puppet you drop lowers his bar** by 56 px: you can see him sink, and he is still out of reach. The hint box says "ONE DOWN: HIS BAR
  DROPS".
- **With both down he is dragged to the boards.** You get a gold ring, a big **OPEN**, a timer bar and "HE'S DOWN - STRIKE HIM", for **3.0 s at
  x1.0**: every blow counts in full.
- The first thing said on waking is "DROP BOTH PUPPETS AND HE COMES DOWN". A blow on him while he hangs does x0.05, and says "OUT OF REACH: DROP
  HIS PUPPETS FIRST".
- **The hard way, always there:** the batten and pin rail are free from the start. From the gallery, **strike the line he hangs from** (a jump
  reaches it; it glows while you are up there and it is ready). He is **jolted** down onto the gallery boards, open for 1.2 s, and it can't be
  done again for 12 s.
- **The PUPPETEER2 multipliers (x3.0 / x3.2) are gone.** The opening is x1.0 and the jolt x1.0. The fight is paced by how quickly you drop the duo,
  and the open window's length is the lever.

## The phases now change how the duo combines

1. **One at a time.** They never start a windup on the same frame. The Harlequin may come in while the Brute is well into a windup or spent.
2. **Together** ("TOGETHER NOW: HIS SLAM BREAKS THE BOARDS").
   - Both strike freely.
   - The Brute's **slam breaks the boards** where it lands: a trapdoor pit, three columns wide, for 4 s, told by the red crack in its windup.
   - A hero on a flat or down in a pit is still reached: the slam shakes the boards he stands on.
   - A hero on the gallery gets the Harlequin flown up to him, plus the Puppeteer's whip.
3. **The masterpiece** takes the Brute's place: the wooden king, 150 health, four strings, swat `!` / stomp `!!` / reach `!!`. The Harlequin stays
   at your heels. "DROP THE KING AND THE HARLEQUIN: HE FALLS."

## The bot

It is the same human bot, retuned for the duo:
- 0.25 s reaction;
- misreads 20% of tells;
- goes for a string half the time and the body otherwise;
- works the Brute's recovery first;
- waits out his windups;
- runs to where he lands when dragged down;
- drops off a flat to reach a target below;
- jumps out of pits;
- **and takes the hard way now and then.** A 30% roll per cycle sends it up the batten: strike the pin rail, ride up, step off, chase his line
  and jump-cut it, then drop back to the stage after the jolt. On the gallery it jumps his low whip and ducks the high one.

The loft route came back because `boss-navigation` (the check from round 1) demands that the pilot stands on the fly gallery, and the first
PUPPETEER3 bot never climbed. I fixed the bot, not the check. It also made the fight easier, which is why the jolt got shorter and the Brute got
heavier (next section).

## Checks (each run by name)

- **Green:** `puppeteer` (rewritten; it now also plays one whole knight fight and requires a win with at least 10 damage taken), tells,
  hint-shown, audio-assets, architecture, skins, dangling-paths, npc-removal, checkpoints, comments, boss-openings (updated: drop both, then he is
  down and open for at least 3 s), boss-fight-end, boss-navigation (with the bot now climbing: see above), attack-tokens (alone).
- **The new check is red on each of fifteen sabotages:**
  - health does not drop a puppet;
  - only a gold string can be cut;
  - a gold cut does not cancel;
  - a cut limb keeps its attack;
  - the Harlequin needs two cuts;
  - a dropped puppet is strung again at once;
  - his bar does not sink;
  - both down do not drag him down;
  - the jolt has no cooldown;
  - phase 1 starts the duo together;
  - phase 2's slam breaks nothing;
  - a flat is out of the Brute's reach;
  - the Harlequin hits hard;
  - the Brute recovers at once;
  - a body blow takes no health.
- **attack-tokens failed twice under load** with "only 3 red !! blows over both crowds". It sits on its own edge: the base gets exactly 4, and the threshold is fewer than 4. I checked that the marks table differs from the base only in the puppet rows. It passed alone.
- **A local-server note:** another checkout was serving on this worktree's default port 6670 (without the puppet stage), and `tools/cdp.mjs` can't
  tell, because it compares `lookpass.js`, which is identical everywhere. I ran every page check with `PORT=6689`.

## Pilots (knight / warden / pyro x 3 seeds, normal health, one life, human bot)

**BEFORE** (82c60e6, PUPPETEER2): 6/9 wins (67%), median win 130 s.

| seed salt | knight | warden | pyro |
|---|---|---|---|
| 1 | win 81.5 s, took 16 | win 137.8 s, took 18 | win 145.0 s, took 79 |
| 2 | death 138.3 s | death 211.4 s | win 105.5 s, took 50 |
| 3 | win 100.8 s, took 52 | win 130.3 s, took 41 | death 144.8 s |

**AFTER** (PUPPETEER3, final numbers, **6 seeds** because 3 seeds swing by a whole fight): **14/18 wins (78%), median win 113 s**. That is **just
above the 60-75% band**, and the swing between runs is about ±10% (see below). Damage taken is real: up to 98 of 100 on a win. "Him at" is his
health left when the hero died.

| seed salt | knight | warden | pyro |
|---|---|---|---|
| 1 | death 82.6 s (him at 13%) | death 187.5 s (him at 31%) | win 102.0 s, took 8 |
| 2 | win 96.1 s, took 28 | win 207.6 s, took 98 | win 106.1 s, took 8 |
| 3 | win 62.9 s, took 27 | death 171.1 s (him at 4%) | win 127.9 s, took 39 |
| 4 | win 74.1 s, took 51 | win 211.2 s, took 93 | win 128.1 s, took 37 |
| 5 | win 85.0 s, took 38 | death 186.4 s (him at 3%) | win 118.4 s, took 54 |
| 6 | win 100.7 s, took 33 | win 200.1 s, took 64 | win 112.9 s, took 27 |

- **What hurt them:** the slam, the masterpiece's swat and stomp, and the Harlequin, in that order. The warden's fights run 170-210 s, over the
  median band.
- **The hero split is uneven:** knight 5/6, pyro 6/6, warden 3/6.
- **Noise:** the same build gave 7/9, then 9/9, then 8/9 on different runs, so a single 9-fight sample can't tell 67% from 89%.
- **How the tuning went:**
  - 100% at first;
  - 67% (6/9) before the bot could climb;
  - 78-89% once it took the loft;
  - then these changes, which brought it to 78% on 18 fights:
    - the open window 3.4 → 3.0 s;
    - the jolt 1.6 → 1.2 s, and its cooldown 8 → 12 s;
    - the Brute's blows 28/30/32 → 32/34/35;
    - the Brute walks at 58 instead of hopping at 38.
- **Not the levers:** health, and the Brute's 1.2 s spent window (the check holds it at 1.2 s or more: it is his punish window).

## Captures

`node tools/puppeteer-shots.mjs` (the human-bot fight, one still per beat) saved to `work/claude/puppeteer/`:
- `1-a-cut.png`: the Brute's arm cut, "THE ARM GOES LIMP: NO MORE CHOP OR GRAB", the flash and the number.
- `2-the-brute-winds-up.png`: his slam band along the boards, `!!`, his line gold.
- `3-the-harlequin-mid-combo.png`: phase 2, jabs in, `!`.
- `4-the-brute-spent.png`: the green recovery bar.
- `5-one-down-his-bar-sinks.png`.
- `6-he-is-down-open.png`: dragged to the boards, the gold ring, OPEN, "HE'S DOWN - STRIKE HIM", the boss bar reading OPEN.
- `7-phase2-together.png`.
- `8-phase2-the-slam-breaks-the-boards.png`.
- `9-phase3-the-masterpiece.png`.
- `10-the-curtain-falls.png`.

I checked the four the brief asked for by eye: the cut, both down with him OPEN, the Brute's windup, and the Harlequin mid-combo.

## UNVERIFIED (PUPPETEER3)

- **Nobody has played this build with hands.** In particular, untested: whether the cut reads as huge, whether his sinking bar reads, and whether
  the jolt route is found.
- **Only three heroes were piloted.** paladin, pirate, reaper and geomancer are untested.
- **The Brute is the soldier's art at 1.5x**, with a sagging pose for a limp limb. There is no dedicated limp-arm frame.

## QUESTIONS FOR DANIEL (PUPPETEER3; recommendation first; the recommended option is built)

1. **Phase 3:** the masterpiece king replaces the Brute, not "the Brute rebuilt huge". Recommend **keeping the king for now**. The rebuilt Brute
   would need new art: the same heavy three at 2x, with his limp-limb rules.
2. **The warden is the hard hero here** (3/6 by the bot, 170-210 s fights: its line-shaped thrust drops puppets slowly), while the knight and pyro win 11/12. Recommend
   **playing it as the warden first**. If it's too hard, give the Harlequin 35 health rather than easing the whole fight.
3. **Should the Brute's chop be blockable?** It is `!!` now, because a shield made it trivial. Recommend **keeping `!!`**: the Brute is answered
   by reading and dodging, and the Harlequin's jabs are the blockable ones.
4. **The bot lands at 78%, three points over the band.** Recommend **playing it before tuning further**. If it is still easy, the next lever is the
   open window, 3.0 → 2.6 s: `boss-openings` would need its floor of 3 s lowered, and that is your call.
5. **Is the gallery-line jolt too hidden** as the "always there, hard" route? Recommend **keeping it hard**. A sign by the pin rail could say it
   if playtests show nobody finds it.
