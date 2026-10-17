# claude/flotilla2 - THE FLOTILLA 2 + THE ADMIRAL'S CHAMPION (Opus greybox, 2026-10-17)

Base: origin/claude/batch97 (a0bd2c1a). Brief: scratch/brief-flotilla2.md, including the '!! 10-16' section (the Champion replaces the Quartermaster, who is benched).
Ports: 6891-6894 only. Every process I started has exited. No suite was run. **NOT LIVE-READY: the ART pass (list at the end) must merge first.**

## What was built

### THE ADMIRAL'S CHAMPION

Files:
- src/admirals-champion.js: the fight, pure.
- src/admirals-champion-hands.js: binds him to the world.
- src/redraw/champion_art.js: greybox art.
- src/boss-music.js 'champion' / 'champion:p2': his theme, composed in code.

**Who he is.** A huge, salt-crusted, LIVING plate knight with a boarding greatsword. He is a B11 duelist: always hittable, never invulnerable (B15).

**What a blow does to him:**

| His state | Damage taken |
|---|---|
| On guard | x0.5, a told clank: HIS PLATE |
| In the recovery after each committed blow | x1 |
| Blade or anchor stuck in the deck (step out of his slam) | x1.5, gold ring and timer |
| KNOCKED FLAT | x2, capped at 9% of his health per knockdown, gold ring and timer, 3.0 s |
| Told ward after a knockdown (3 s) | blades x0.4; a ball glances off |

**The key (B14).** Strike a DECK GUN's breech while he stands in its line. The round shot knocks him flat. In the air it passes under him. A knockdown heats both arena guns for 10 s. The ranger strikes a breech with her knife's low sweep (DOWN+X).

**Moves (B17: seven told attacks; B16: each has its own pose key).**
- **Phase 1, the greatsword:**
  - COMBO: 2 or 3 cuts, yellow !. A shield turns it.
  - OVERHEAD SLAM: !!. Step out and the blade sticks.
  - LUNGING THRUST: !!. Roll through it.
  - LEAP: !!. A mark shows where he lands. He always leaps to the hull you stand on (the level rule).
- **Phase 2, at half health:** he tears THE ANCHOR off the rail (told).
  - ANCHOR SWEEP: one pass round him at the knees. Jump it.
  - CHAIN HOOK: hooks you and hauls you in.
  - ANCHOR SLAM: the anchor bites the deck (an opening). THE DECK TILTS toward the lashing for 2.2 s and you slide unless you walk against it. THE HULLS ROCK APART: the lashing gap widens by a column on each side, then closes once nobody is in it.

**The arena, THE LASHINGS (52 columns).** The Powder Ship's stern is lashed to the Flagship's waist. A 3-column gap of foul harbour lies between, with a gun at each end laid inward. A hero who falls into the gap pays the hazard share of health and is HAULED OUT onto his deck (A10).

**The bot.** chPlan reads drawn state only:
- It jumps the anchor as it comes and rolls the thrust.
- It goes to a cool gun when he is in its line.
- It walks up the tilting deck.

The lab.js branch adds climbing out of the harbour.

### The Quartermaster: benched
- Her update, decks, line cuts and falling deck are now src/benched/quartermaster.js, verbatim and unwired. A header explains how to re-wire her.
- Her sprites (pirates.js bakeQuarter) and the 'quartermaster' music key stay. The Champion does not use that key.
- Her wiring was removed from: main.js, boss-read GUARD, boss-greed, threat, marks, RUSH, bestiary, BOSS_T and BOSS_FELL.
- Tests were re-pointed rule for rule: blow-tags, boss-greed, boss-navigation, lab-reach, newlevel.
- New check: tools/admirals-champion.mjs (pure + page, 5 heroes), registered in check.mjs.

### THE FLOTILLA 2 (theFlotilla in src/level.js, rebuilt; src/flotilla2.js; 604 columns, about twice the old route)
- **The rule line is kept.** Still FOUR hulls (galley, hulk, powder ship, flagship).
- **Seven named sections in L.sections:** THE ROCK, THE GALLEY, THE GALLEY HULL, THE HULK, THE RIGGING RUN, THE POWDER SHIP, THE LASHINGS.
- **THE GALLEY HULL (97-208):**
  - Four wells hold 10 ROWING BENCHES that pump up and down over the foul bilge.
  - 9 PRESSED FISHERFOLK row them. Strike a rower's chain and his BENCH STOPS where it is (the verb).
  - Order: teach, then test, then remix (stop the tall bench high to reach the raised STERN CASTLE), then the exam (with one rowerless bench). The galley hull's shrine closes it.
- **THE RIGGING RUN (289-385):** there is no deck between the hulk and the powder ship.
  - Climb the masts, then ride YARDS ON THEIR STAYS that rock out and back with the hulls. Walk THE LASHING (a hawser) and take a swing line.
  - Order: teach (with a catch-net), then test, then remix under marine fire, then the exam with petrels.
  - Then down the Powder Ship's foremast to its shrine.
- **THE POWDER SHIP (386-539):** strike a DECK GUN's breech to use it.
  - Teach: a gun opens a COPPER DOOR.
  - Test: THE POWDER LINE (let them line up).
  - Remix 1: a ball (or a struck keg) blows the keg on the CRATE HATCH. The deck opens into the 'tween deck, under the mainmast wall.
  - Remix 2: one gun, two doors.
  - Exam: an UNSTOPPABLE heavy elite on the deck before the lashing. Only a round shot drops him (the key taught on an elite first).
  - Then the shrine before the boss.
- **Brief item 2 (no floating wood):** the bobbing crates in mid-air are gone. Every spar, boom, net and hawser is now joined to a hull or a mast (solid-islands allowance 2 -> 0). Flotilla movers now draw as benches or yards with their lines, never the default log.
- **Shrines:** 56 (ambush), 207, 390, 535. checkRun is 190 (fewer checkpoints).
- **Elites:** the hulk boarder (SWIFT, holds a gate) and the exam heavy (UNSTOPPABLE).
- **Stuck guide:** glints and nudges at every route need (src/stuck-spots.js).
- **Walk hints:** the walker now fires the guns at the doors and hatch (src/walk-hints.js).

### Shared changes (please read, integ lane)
- **main.js mover landing:** `prevY <= m.y + 1 + Math.abs(m.dy)`; it was `max(0, dy)`. A RISING platform now catches a falling hero. Before, he fell through it: tools/flotilla-route.mjs found this on the benches. Every vertical mover in the game gets the fix.
- **src/reachcore.js:** with L.flot2 only, a copper door that has a gun laid at it, and a keg on crates, are treated as opened. The Hurricane is unchanged.
- **src/storm-ship.js:** a swing may name its own boarding deck (`deck`).

## Boss rates (tools/boss-run fights, human profile, campaign L19, practiced)

| Profile | Knight | Warden | Pyro | Total |
|---|---|---|---|---|
| WITH FLASKS (kit) | 2/5 | 5/5 | 3/5 | **10/15 = 67%** (in band 60-70) |
| DRY (bare flask) | 1/2 | 0/2 | 2/2 | 3/6 = 50% |

- With flasks, winning fights lasted: knight 80-89 s, warden 49-85 s, pyro 122-165 s.
- Other heroes, with flasks: **ranger 0/2** (she died at 40-59 s with him on 87-89%), **paladin 1/2**.
- The split between heroes is wide: the warden wins every time and the knight 2 in 5.
- Tuning ran six rounds. Health 2300, damage +50% over the first cut, the flat cap 11% -> 9%, guns heated after a knockdown, a narrower arena, and the sweep changed from 'everywhere in its radius' to one visible pass.

**Mash bot:** the boss went 0/6 (heroes died in 21-28 s with him at 93-98%). In the level every hero dies (8 / 27 / 8 deaths). Both rows were re-stamped, level then boss.

## Checks run

**Passed:**
- New: admirals-champion (pure + page: knight / warden / pyro / ranger / paladin).
- Combat and marks: tells (`--write`: the MARK table regenerated), boss-greed, blow-tags, boss-read, boss-music (with the 'champion' / 'champion:p2' loops), boss-openings, boss-navigation (its flotilla row is now at campaign L19, the theatre precedent; he must take the lashing).
- Audio and files: audio-assets, dangling-paths.
- Geometry: storm-ship, floaters, solid-islands, killzones, traps, deadends.
- Checkpoints: checkpoint-gaps, -stand, -thin, checkpoints.
- Level contents: collectables, keys, spawns, elites, ambush-listed, ambush-reach.
- Guidance: stuck (static + runtime), content-audit.
- level-quality: flotilla is now in GATE and CLEARS THE BAR. It was re-run on the final geometry and still clears (5 height bands, 5 gadget kinds).
- level1-pilot row written.

**Pre-existing, not from this branch:**
- modulepreload: 26 other modules (anti-mash, church-supports...); mine are preloaded.
- signs: 6 trial-room signs.
- architecture: the church.
- hint-shown: 27 hero-pass lines.
- mark-integrity: an undeadmage phantom pose.

**Not completed:**
- corpses: the page evaluate timed out at 10 min on a loaded machine.
- tools/flotilla-route.mjs (new, a WIP tool, not in check.mjs).
  - It passes every bench and yard chain for knight, warden, ranger, reaper and geomancer.
  - **pyro:** one rigging-exam link fails. The bot jumped about 130 px in 4 frames: a controller artifact.
  - **paladin (0.9x movement):** 5 links fail.
- level-walk: the walker cannot ride the benches or yards. It swims the bilge and the harbour, as tools/pacing's route does, so it reports STUCK there. This is a tool limit, now covered by flotilla-route.

## Music (brief A4)
**Why the old boss music sounded wrong.** 'quartermaster' maps to audio/quartermaster.ogg, "Sailors Battle - Midi Theme" by Doge. Decoded in the page:
- It is 58 s long, at 44.1 kHz, in stereo.
- RMS is -13.4 dB, with peaks at -0.1 dBFS (hot).
- It is very wide and hard-panned: its left/right difference is 0.17, against 0.01-0.12 for every other track.
- It is a General-MIDI render.
- **The main fault:** the level bed 'flotilla.ogg' sits at -32.5 dB RMS with gain 1.0. So the boss track came in about 19 dB louder than the level, then hard-panned and MIDI-timbred.

**What the Champion plays now.** His own composed theme ('champion': D Dorian, 6/8, a war shanty with a ship's bell; ':p2' adds the chain on the off-beats). It is in the Sound Test.

## QUESTIONS FOR DANIEL (each has a recommendation; I built the recommended option)
1. **Music.** Pick a track for him. Recommended first: "Pirate Indenture" (Eldritch Grim, **CC0**, a fast orchestral loop). Other picks:
   - "Blackmoor Tides - Epic Pirate Battle Theme" (Matthew Pablo, **CC-BY 3.0**, has a no-vocals version): https://opengameart.org/content/blackmoor-tides-epic-pirate-battle-theme
   - "Pirate's Orchestra" (Dizzy Crow, **CC0**, lighter): https://opengameart.org/content/pirates-orchestra-208

   Nothing has been downloaded; that waits for your yes.

   Also recommended: raise TRACK_GAIN.flotilla (its bed is about 19 dB under the library). I left it alone.
2. **Per-hero split.** With flasks the warden wins 5/5 and the knight 2/5. The total is in band.
   - Recommendation: the tune lane checks the warden's reach against the plate (her 40 px reach lands most cuts from outside the combo).
   - The ranger's 0/2 needs her bot (or her damage on plate) looked at before ship.
3. **The rising-mover landing fix** in main.js changes every vertical mover. I recommend keeping it. Ask the integ suite to watch the vertical-mover levels.
4. **Should the paladin's slower movement pass the galley-hull benches?** Recommendation: run tools/flotilla-route.mjs by hand. If a person fails it too, widen the two wells' gaps.
5. **Are three or four named benches without rowers wanted?** I built one, the exam's, as a "never stops" read. Recommendation: keep one.
6. **Should the Champion be a parry/riposte duelist** (src/riposte.js DUELISTS)? I left him out. Recommendation: no; the gun is his key.

## ART LIST (the SONNET art lane, brief B; nothing goes live before this merges)

**THE ADMIRAL'S CHAMPION** (replace src/redraw/champion_art.js; the pose keys in its header are the contract; draw him at about 1.5x the Crusader):
1. **The knight:**
   - huge, salt-crusted plate: a barrel breastplate, broad round pauldrons, a closed sallet with a crest of salt;
   - a sea-green surcoat in rags and barnacled greaves;
   - LIVING: a warm eye glint in the slit, not drowned.
2. **The P1 greatsword**, every move with its own windup and release pose:
   - comboTell / combo / comboRec;
   - slamTell / slam / STUCK (hauling at the buried blade);
   - thrustTell / thrust / thrustRec;
   - leapTell / leap / landRec.
3. **KNOCKED FLAT:** on his back, the blade loose. Then getting up into the grey WARDED guard.
4. **The P2 anchor on its chain:**
   - tearTell (wrenching it off the rail);
   - sweepTell / sweep (the hands draw the anchor's pass);
   - hookTell / hook / hookRec;
   - tiltTell / tilt / STUCK-A;
   - the death on the lashings;
   - the bestiary card.
5. **The anchor and chain sprites;** FX: the slam mark, the leap mark, the sweep arc, the deck tilt, the lashing lines (taut and stretched), the hulls parting, the HAULED OUT splash.

**THE FLOTILLA 2** (greybox today in src/flotilla2.js and the ship kit):

6. **The galley hull:**
   - rowing benches on frames, with oar looms through her side;
   - PRESSED FISHERFOLK rowing (a chained cycle), and FREED (standing, the chain broken);
   - charred deck edges over the wells;
   - the raised stern castle with its rib ladder, and the mizzen.
7. **The rigging run:**
   - yards on their stays (spar, two lines, footropes);
   - masts stepped on sunken wreck bones;
   - the walkable hawser and the catch-net;
   - petrels.
8. **The powder ship:**
   - COPPER DOORS (today they draw as the Hurricane's iron);
   - the CRATE HATCH and its blown-open state;
   - the mainmast partners wall;
   - the 'tween-deck magazine and the fighting top.
9. **The lashings:**
   - the Powder Ship's stern and the Flagship's waist;
   - the gap, with its nets and lashing lines;
   - the two end guns;
   - the flagship's tail and gate.

   Keep the decks clear: a round shot runs their length.
10. **Spars that read as spars:** the bowsprit (27-30, row 24), the galley stern boom (209), the hulk bow boom (220), all stayed to a mast. No logs.
