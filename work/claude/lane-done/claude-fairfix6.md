# FAIRFIX6 - the fair's goblin-looking foes, and THE WICKER MAN

Branch `claude/fairfix6` (Opus). Base: master 2423ff42 (batch68). Master had not moved at the end of the lane.
Brief: scratch/brief-fairfix6.md (Daniel's 10-05 live playtest of the Harvest Fair).

The Wicker Queen is not touched. `src/wicker-queen.js` is unchanged, and so are her numbers. The Wicker Man reads her strike-back numbers (`WQ.retReach`, `retLate`, `retSet`) and never writes them. The `wicker-queen` check is green.

## 1. THE ORANGISH GOBLINS NEAR THE START

**What it was.** The fair's STRONGMAN (the brute AI, `cnSkin: 'strongman'`) was not drawn as a man:
- His sheet was the goblin brute's own sheet, recoloured from green to tan (src/redraw/variety_skins.js).
- So every frame kept the goblin's hunched body, its ears and its face, in an orange-tan skin.
- In every state (walk, the raised club, the swing, hurt) and as a corpse, he was an orange goblin.
- The first one stands in the stall row's pincer (col 140), right after the gate.

A second, smaller one: the coconut-shy stallholder's two "down" frames (knocked down and getting up) had no boater. Bare-headed, the drunk's spiky hair read as ears on an orange head. The knocked-down frame is also his corpse.

**What changed:**
- NEW src/redraw/fair_folk.js `bakeStrongman()` draws a real fairground strongman in the brute's five frames (stand, walk, raise, swing, hurt):
  - a bald head with a waxed black moustache and a bull neck;
  - a red-and-cream hooped singlet, bare arms, and a belt with a brass buckle;
  - a long-handled maul banded in iron.
- The AI, the frame picks and the hit box are unchanged. main.js bakes `SPR.strongman` from it, and the recolour row is gone from variety_skins.js.
- src/redraw/waymeet.js: the stallholder keeps his boater on in the down and get-up frames.
- Sheets: scratch/fairfix6/before/sheets.png, then scratch/fairfix6/after1/sheets.png and scratch/fairfix6/z1/sheets.png.

**The new check:** `tools/fair-folk.mjs` (in tools/check.mjs).
- For every kind of foe in the fair, it draws the foe beside the hero:
  - alive, unwoken and woken;
  - forced through each of its modes;
  - flashing from a blow;
  - then killed, with its body drawn.
- It collects every set drawn, then compares every frame of each set, alpha mask against alpha mask, with every frame of every goblin sheet (`GOBLIN_KINDS`, read from tools/goblin-lint.mjs).
- It fails when a goblin sheet is drawn, or when a frame's silhouette matches a goblin frame on 93% or more of its pixels.
- **RED on master 2423ff42:** strongman frames 0-4 are the goblin brute's frames 0-4 at 100% (work/claude/fairfix6/logs/fair-folk-red-master.log). **GREEN** on the branch: 11 kinds, the Wicker Man and the Queen among them.
- tools/goblin-lint.mjs: `fair` joins `FIXED`, so a living goblin AI with no skin now fails there too.

## 2. THE WICKER MAN (the fair's one new foe)

It is a tall effigy of woven willow stuffed with straw, with a small crown of three wheat ears: the Queen's lesser echo. Files:
- src/wicker-man.js: the rules, pure;
- src/wicker-man-hands.js: the binding, the ball and the strike-back;
- src/redraw/wicker_man_art.js: 13 frames, with its own death frame.

**How it behaves:**
- **The fair's rule.** Its feet move only while no hero looks at it. Its arms do not care whether it is looked at.
- **Its fire.** The tell is 1.0 s: a bundle of its own straw lit over its head, with a red `!!`. Then it bowls the bundle along the ground (110 px/s, 15 damage). It rolls down ramps and stops at walls (the game's own moveBody).
  - Answer: jump it, or strike it back.
  - The strike-back is the Queen's rule: a blow begun as the ball enters your reach, after the blade was held 0.7 s, sends it back. The ball flashes white in that window. The Pyromancer's ember flare also sends it back.
  - A mashed blade only scatters sparks off it, with the line "TOO WILD".
- **Its arms.** In reach, both arms go up for 0.9 s (yellow `!`), then come down for 19 damage. The shield takes it.
- **The opening.** The returned ball catches it. It burns for 3.0 s and throws nothing, and a blow lands whole. Then it stamps the fire out (0.9 s, told by smoke and a line) and fights on.
- **Outside the fire,** a blow is worth x0.05 (the Queen's ward), with the line "THE WICKER SHRUGS IT OFF: STRIKE ITS FIRE BACK".
- **Health:** 150 base (135 at the fair).
  - Measured at L23, one 3 s fire cut point-blank takes 50 (warden) to 211 (pirate).
  - So it falls in 1 to 3 fires: knight 2, warden 3, paladin 2, the others 1.
  - It is deadly through its fire and its arms, not its health.

**Where it stands: three designed encounters, all squads.**
1. **TEACH (col 207, `wicker1`).** Alone on the flat road, three steps past the second shrine (199), in front of the swingboat's boarding stair. The sign at 198 says: "IT THROWS ITS OWN FIRE. HOLD YOUR BLADE, THEN STRIKE THE FIRE BACK INTO IT."
2. **REMIX (col 391, `foot2`, on the hill).** It replaces the strongman that stood there. The hobby-horse under the slide is at your back: face the Wicker Man to strike its fire back and the horse charges; turn to hold the horse and its fire rolls down the hill into you.
3. **EXAM (col 568, `wickerPad`).** At the spike yard's lip, over the tall striker's pad. You land off the rick into its fire, and its arms reach the pad. Facing it puts your back to the knife juggler on the roof behind (557).

**Everything else it needed:**
- Marks by hand in src/marks.js: `!!` over the throw, `!` over the swing, then `tools/tells.mjs --write`. Also ANSWER (jump / block) and HEIGHT rows.
- A bestiary card: THE WICKER MAN, "strike its fire back".
- A corpse in its own skin: the burnt heap, as the last frame and through HAS_HURT.
- THREAT 7 (src/threat.js).
- Roles in level-quality: ranged and heavy.
- Its own death colours.
- Its sounds reuse the Queen's and the fair's (no new SFX entries).
- Teaching lines go straight to `callout()`. Listing them in src/hint-lines.js failed hint-shown, because no `number()` call says them.
- Pictures: scratch/fairfix6/enc/ (each encounter with a fire in flight, and burning) and scratch/fairfix6/z2/sheets.png.

**The new check:** `tools/wicker-man.mjs` (in tools/check.mjs).
- **Node:**
  - the facing rule on its feet;
  - a throw while looked at, told 0.9 s or more;
  - the swing told 0.8 s or more;
  - caught, then burns 3 s or more, then stamps it out, and never catches twice;
  - ward at or under `WQ.ward`, whole in the fire;
  - the strike-back numbers are the Queen's, and the judge's five cases;
  - its marks;
  - three in the fair, each in a squad, before the green.
- **Page,** with real keys, `BKT.setHeroLevel` at the fair's depth (L23) and no skills, for knight, warden, pyro, paladin, pirate, reaper and geomancer:
  - a held blade begun as the fire reaches him sends it back, and it catches and burns;
  - for the pyro, the ember flare does it too;
  - a mashed blade never sends it back, and the fire hurts (9-12 hp);
  - a uniform blow is 20 in its fire and 1 outside;
  - it is cut down in 3 fires or fewer;
  - its body lies down in its own burnt heap.
- All seven heroes are green.

## 3. NUMBERS, BEFORE -> AFTER

- **Fair foes:** 16 mummers, 5 strongmen and 0 wicker men before. Now 16 mummers, 4 strongmen and 3 wicker men. Horses, string-jacks, barkers, the shy and the jugglers are unchanged.
- **Fair INDEX:** about 123 before, 130 now. See Q1.
- **Mash bot, level** (`--level fair --write`, L23):
  - knight: 2 deaths (it was 3);
  - warden: 0 deaths, lowest 2% hp;
  - pyro: 1 death.
  - Every hero ends below MASH_HP 40, so the gate holds.
- **Mash bot, boss** (`fair --write`, re-stamped after the level, Queen unchanged): 0/6. The Queen was left at 54-87%.
- **Level-1 pilot** (`level1-pilot fair --write`): 34 hits, 0 deaths, 100% of waypoints walked (FAIRFIX5 had 38 hits, 0 deaths).

## 4. CHECKS

**Green:**
- fair-folk (new), wicker-man (new), harvest-fair, wicker-queen, goblin-lint, corpses
- level-quality, mash-gate
- architecture, checkpoints, checkpoint-gaps, dangling-paths, npc-removal, skins, slopes-trace (identical: no rebase)
- tells, hint-shown, answer-tags, audio-assets, one-new-foe, sprinkle-cap, stuck
- boss-greed, boss-openings
- signs, render-layers, occluders, dressing, footing-art, ground-depth, push-blocks, frame-cost, modulepreload (4 unlisted, within the budget of 15), elites, killzones
- boss-fight-end: all 51 boss and mini fights end when the boss dies.

**Test changes (deliberate, with reasons in the files):**
- harvest-fair: the foe count is now 4 strongmen plus 3 wicker men, the designed-encounter list includes `wickerman`, and the INDEX ceiling went from 125 to 135 (Q1).
- level-quality ROLES: `wickerman` is added to ranged and heavy.
- goblin-lint: `fair` is added to FIXED. This makes the check stricter.

**UNVERIFIED:**
- Headless only: its sounds were not heard.
- No human-speed bot ran: the Queen did not change.
- The fair-pilot level-1 legs were not re-run; level1-pilot, which gates level-quality, is green.

## QUESTIONS FOR DANIEL (the recommended option is built)

1. **The fair's difficulty INDEX is 130, over the old 125 ceiling.** The new kind and its three encounters add about 9; swapping the hill strongman out took off about 2. Built: the ceiling raised to 135.
   - Rec: keep, and judge it in your playtest.
   - Alternative: take out the exam's Wicker Man (index 128), or two more filler foes.
2. **Wicker Man health 150** (1-3 fires to kill at L23; the warden's slow cuts need 3). Rec: keep. The ward makes it a puzzle-foe rather than a wall, and a fight runs 10-25 s.
3. **The hill strongman (col 392) is now a Wicker Man.** Rec: keep. The remix pairs its fire with the horse at your back, and it keeps "fewer, better foes".
4. **The harvest mummer's green husk cap** could also read a little goblin-ish at a glance in the dusk. It is not a goblin silhouette (fair-folk: 0%). Not changed. Rec: leave it unless you saw it as one.

## 5. DANIEL'S 10-05 ANSWERS (second pass, commit b9d15bae and after)

These supersede the matching lines above. Q1 is answered: a harder fair is fine, and the ceiling stays at 135. I did not raise it again.

- **The fair's difficulty index is now 131.** The hill strongman is back: 5 strongmen and 3 Wicker Men.

**1. The Wicker Man is tougher: every hero now needs 2 or 3 struck-back fires.**
- Health alone could not do this. One 3 s fire, cut at point-blank range at the fair's depth (L23), takes 50 (warden) to 211 (pirate). That 4x spread cannot fit into 2-3 fires by health.
- So there are two changes:
  - **Health is 160** (144 at the fair). That is three of the warden's fires.
  - **New `WM.fireCap` 0.55:** one fire can take at most 55% of its health. At that cap the wicker beats the flames out early, told with "IT STAMPS ITS FIRE OUT". So no hero kills it in one fire.
- About 220 health, as suggested, would have needed 4 fires for the warden.
- **Checked per hero** in `tools/wicker-man.mjs`, which now fails at 1 fire or at 4:

  | Hero | Fires to kill |
  |---|---|
  | knight | 2 |
  | warden | 3 |
  | pyro | 2 |
  | paladin | 2 |
  | pirate | 2 |
  | reaper | 2 |
  | geomancer | 2 |

- A Node assert covers the cap: it stamps out at the cap, and every new fire starts its cap afresh.

**2. The hill strongman is kept (col 392, in his new art).**
- The remix Wicker Man moved to the chair-o-plane's bank (col 446, squad `stairfoot`).
- You come down the corn maze's stair toward it, and the strongman at the stair's foot (col 440) walks into your back whether you look or not.
- Face the Wicker Man to strike its fire back, and the strongman is behind you. Turn on him, and its fire rolls into your back.
- Picture: scratch/fairfix6/enc2/wm1.png.

**3. The harvest mummer's cap.**
- The olive-green husk cap is now dry corn husk, in straw and gold (src/redraw/fair_art.js `HARVEST`).
- The mask's shading is no longer greenish.
- fair-folk is green. Sheet: scratch/fairfix6/z3/sheets.png.

**4. THE MIME (src/mummer.js `MIME` and `watcherOf`, pure; its hand is in main.js `updateMummer`).**
- **Where:** fair mummers only (`w.mime`). The Theatre's mummers and the Queen's crowd still just freeze.
- **The facing rule is unchanged:** a watched mummer never creeps.
- **It copies its watcher** (the nearest hero looking at it, the nearest of them in co-op), in the mirror:
  - **His steps:** his vx flipped, at most 30 px/s. It never closes inside 30 px on its own.
  - **His swing:** a blow he begins within 72 px is answered.
    - The tell is 0.42 s: a yellow `!` with the sickle-tell sound (marks row `mummer|mimeTell`, answer `block`).
    - Then it swings back for 9 damage. The shield turns it; it is never unblockable.
    - It recovers for 0.55 s.
    - Your own blow does not cancel its answer.
- So you time your cut between its swings.
- **Unwatched it is unchanged:** it creeps, its bells ring, and the red glow comes before its strike.
- **Asserts:**
  - harvest-fair (pure): the mirrored step, the keep distance, the told 0.35-0.5 s swing that is weaker than its strike and whose box reaches the hero, the yellow mark, a guardable hit in main.js, no mime without the flag (the Theatre), and unwatched behaviour identical with or without the mime.
  - wicker-man (page, knight): a mummer held in the look answers the knight's swing with mimeTell then mimeSwing, and never creeps.

**Re-stamped, level then boss:**
- **Mash level:**
  - knight: 2 deaths;
  - warden: 0 deaths, lowest 1% hp;
  - pyro: 1 death.
  - All are under the gate (MASH_HP 40).
- **Mash boss:** 0/6; the Queen was left at 54-87%.
- **Level-1 pilot:** 43 hits, 0 deaths, 100% of the route walked.

**Green on this pass:**
- **The fair and its foes:** harvest-fair, wicker-man, fair-folk, tells, theatre.
- **Level and mash gates:** level-quality, mash-gate, one-new-foe, sprinkle-cap, stuck.
- **Level structure:** checkpoint-gaps, architecture, checkpoints, npc-removal, elites.
- **Text and skins:** goblin-lint, hint-shown.
- **Not yet in:** wicker-queen and boss-fight-end (see the next section).

**Remaining question:**
- **The mime damage is 9 and its tell 0.42 s, picked by hand.** It has no bot measure of its own; the level-1 pilot rose from 34 to 43 hits.
  - Rec: judge it in your playtest.
