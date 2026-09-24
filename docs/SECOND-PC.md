# BRACKEN on a second computer

This computer runs the lanes. Your main PC only checks each finished lane and deploys it. **Run at most 3 lanes at once on it**, the same limit as your main PC.

## One-time setup (about 15 minutes)

1. **Install Git:** https://git-scm.com/downloads (keep the default options).
2. **Install Node.js 24 (LTS):** https://nodejs.org
3. **Install Google Chrome** if it isn't already. The lanes use it to take pictures of the game.
4. **Install the Claude desktop app:** https://claude.ai/download. Sign in with your account and open the **Code** tab.
5. **Sign in to GitHub** so the lanes can save their work. Open a terminal and run the commands below. It opens a browser window: sign in as `draphael123` and approve.

   ```bash
   git config --global user.name "Daniel"
   git config --global user.email "draphael123@users.noreply.github.com"
   git credential-manager github login
   ```

   On a Mac, where that last command doesn't exist, run `gh auth login` instead, after installing the GitHub CLI from https://cli.github.com.
6. **Make a folder for the game**, for example `Documents/bracken-lanes`. In the Code tab, pick that folder as the working folder.

## Running a lane

- Start a **new session** for each lane in the Code tab, with the folder from step 6 as its working folder.
- Paste one lane block from below into it and let it run.
- **Start 3 lanes** (1, 2 and 3). **Start lane 4 when one of them finishes.**
- Each lane clones the game into its own sub-folder and saves (pushes) to its own branch on GitHub after every green step.
- None of them touch the live game. When one finishes, tell me in the main session: *"lane X is done"*. I'll pull its branch, run the full check, and deploy.
- If the PC gets slow, stop one session. Its work up to the last push is safe on GitHub.

## Lane 1: Hero poses

Paste this whole block into a new Claude Code session on the second PC:

```text
You are a second-PC lane for BRACKEN (16-bit platformer, plain JS, no build step, no dependencies).
SETUP: this is a second computer (Windows or Mac; use its shell). In a fresh folder: `git clone https://github.com/draphael123/bracken.git bracken-poses2 && cd bracken-poses2 && git checkout claude/poses2 && git pull`. Node 24 and Chrome are installed; use Chrome for page checks (find its path; do not download anything). Other lanes run on this PC at the same time in their own folders, so keep it light: no more than one Chrome page at a time. PUSH to origin after every green commit so nothing is lost if the PC stops. Work and push ONLY on claude/poses2. NEVER touch master, NEVER run the full `npm run check`, never deploy. Editor/Boss Rush PARKED. Read docs/AGENT-HANDOFF.md "EXPENSIVE LESSONS". Patches: exact-match replacements; /* */ not // in patch strings; commit messages say WHY; re-run failing checks alone.
STATE: the branch has WIP commits saved when the previous run stopped the lane mid "art patch" (Paladin/Pyromancer first). Verify they parse (node --check) and pass `npm run check -- ability-poses,syntax` before building on them; then `git fetch origin && git merge origin/master`.
THE JOB (approved by Daniel): give the other four heroes' abilities bodies of their own, as the Knight and Warden already have (src/hero-poses.js; tools/ability-poses.mjs with its KNOWN_POSELESS ratchet). Poseless today: Pyromancer — Vent, Wisp, Fire Wall (idle), Cinder Step (dodge roll); Paladin — Divine Shield (idle), Holy Charge (dodge roll), Hammer Leap (plain jump); Freebooter (pirate) — Black Spot, Keelhaul (idle); Death Knight (reaper) — Blood Boil, Gravecall (idle). Also: where spells share one generic cast/blast frame, give each a distinct pose where it reads better (at least the Death Knight's five casts), and tighten the check so a hero's actives may not all share one pose (short allow-list with reasons). Give all four the take-off frame + 3-beat landing the starters have (extend the jump-arc assertion to every hero). Before/after pose sheets (tools/pose-sheet.mjs) committed under docs/. Poses only — no hitbox/cost/cooldown changes. KNOWN_POSELESS must reach 0. Commit per hero, green at every push.
Keep green: ability-poses, starter-kits, attack-animation, combat-feel, render-layers, skill-menu, tells, textfit, comments, syntax.
FINAL MESSAGE: shas per hero, before/after sheet paths (committed), the ratchet at 0, checks (+ re-runs), parked questions.
NOTE: the branch already has later commits (the Death Knight got his bodies at 2325407). Read `git log` first and continue from where it stopped; do not redo finished heroes.
```

## Lane 2: Desert level 1 (Sunken Caravan)

Paste this whole block into a new Claude Code session on the second PC:

```text
You are a second-PC lane for BRACKEN (16-bit platformer, plain JS, no build step, no dependencies).
SETUP: this is a second computer (Windows or Mac; use its shell). In a fresh folder: `git clone https://github.com/draphael123/bracken.git bracken-desert1 && cd bracken-desert1 && git checkout claude/desert1 && git pull`. Node 24 and Chrome are installed; use Chrome for page checks (find its path; do not download anything). Other lanes run on this PC at the same time in their own folders, so keep it light: no more than one Chrome page at a time. PUSH to origin after every green commit so nothing is lost if the PC stops. Work and push ONLY on claude/desert1. NEVER touch master, NEVER run the full `npm run check`, never deploy. Editor/Boss Rush PARKED: add nothing. Read docs/DESIGN.md, RULES-LEVELS-AND-BOSSES.md (A, B, C, F, Q, R), docs/AGENT-HANDOFF.md lessons. Patches: exact-match replacements; /* */ not // in patch strings; commit messages say WHY; re-run failing checks alone.
STATE: the branch holds early work plus a WIP commit saved when the previous run froze: it includes src/sunken-caravan.js and tools/caravan-shots.mjs (in progress) and some JUNK files committed by accident — probe.js, probe.tmp.mjs, check1.out: delete them. Check whether origin/claude/slopes was already merged (git log); if not, do step 1.
THE JOB (approved by Daniel: the desert arc's level 1 ONLY; do not build levels 2-8 or wire the Skeleton King):
1. MERGE SLOPES: merge origin/claude/slopes (far behind master: expect conflicts; keep both sides; tools/check.mjs keep every name) and re-verify its equivalence claim (the shipped levels' frames do not move) and its slopes checks. src/main.js must import src/slopes.js and T must have tile ids 20-25, or desert levels are ones the hero falls through. Then merge origin/master.
2. Read origin/claude/desert's notes; bring over only what the caravan needs.
3. BUILD THE SUNKEN CARAVAN from src/draft/sunken-caravan.js to docs/briefs/sunken-caravan-amendments.md (+ docs/desert-arc-brief.md): APPEND to LEVELS (never insert), TIER, MEDALS, needs: 'fallingtower'; its map node is the FIRST desert node at (248,158) on the desert sheet (docs/briefs/map-redesign.md §4.1; DESERT_NODES in src/main.js; the sand connector from THE FALLING TOWER meets it; map-grammar must pass); the Falling Tower's gold out-portal (src/sanctum.js) leads to it (a needs link + node, no fight change). A new foe from the desert roster (F10), an ambush room (Q), checkpoints, signs; music: if no track already in the repo fits, PARK it with a recommendation — do not download anything.
4. Walk it (F9) with the knight and warden (in-page bot / BK harness); INDEX (tools/curve.mjs on the needs chain).
Keep green: the slopes checks, map-grammar, additional-areas, keys, audit, traps, killzones, collectables, spawns, deadends, floaters, checkpoints, skins, dressing, signs, one-new-foe, threat-holes, tells, tower-ascent, archmage-room, textfit, comments, syntax, pixels.
FINAL MESSAGE: shas per step, the slopes-equivalence result, the level's one sentence + sections, new foe(s), INDEX, screenshots committed under docs/caravan/, checks (+ re-runs), parked questions with recommendations.
```

## Lane 3: Burial Caverns + Buried Dead

Paste this whole block into a new Claude Code session on the second PC:

```text
You are a second-PC lane for BRACKEN (16-bit platformer, plain JS, no build step, no dependencies).
SETUP: this is a second computer (Windows or Mac; use its shell). In a fresh folder: `git clone https://github.com/draphael123/bracken.git bracken-burial && cd bracken-burial && git checkout claude/burial && git pull`. Node 24 and Chrome are installed; use Chrome for page checks (find its path; do not download anything). Other lanes run on this PC at the same time in their own folders, so keep it light: no more than one Chrome page at a time. PUSH to origin after every green commit so nothing is lost if the PC stops. Work and push ONLY on claude/burial. NEVER touch master, NEVER run the full `npm run check`, never deploy. Editor/Boss Rush PARKED. Read docs/AGENT-HANDOFF.md "EXPENSIVE LESSONS", RULES-LEVELS-AND-BOSSES.md (A1-A12, B, C, F, R), docs/briefs/burial-caverns-rework.md (its problem is SHAPE: 1,386 columns, ~230 cols per place), docs/briefs/buried-dead-rotation.md (option A is live: sinkTell sixth in phase one; keep it). Patches: exact-match replacements; /* */ not // in patch strings; commit messages say WHY; re-run failing checks alone. Prove every new assertion red first.
STATE: the branch has a WIP commit saved when the previous run froze, with new files src/burial-variety.js, tools/burial-variety.mjs, tools/buried-dead-pilot.mjs, tools/mini-names.mjs and edits to src/additional-areas.js and src/main.js. Verify it parses and see how far it got; then `git fetch origin && git merge origin/master`.
DANIEL'S REQUESTS (all APPROVED; ship-when-green):
1. THE BURIAL CAVERNS ('burial') — MORE VARIETY: (a) DARK areas — lamp-lit pockets with darkness between, like the Ore Road's cavern (readable and fair: tells visible, lamps visible from the dark); (b) BRIDGES OVER POISON WATER that DISINTEGRATE — crack and crumble a moment after you step on them (told: cracks + a sound), with a climb-out if you fall (C5), rebuilding after a while or on respawn so the route is never cut (B4). Use them to break the long stretches into distinct places.
2. RENAME the Burial Caverns' mini-boss THE GRAVE WARDEN (id 'gravewarden') to "THE GRAVEYARD KEEPER": display name, bestiary, boss bar, signs, BEAST_SHORT; keep the id.
3. THE BURIED DEAD ('burieddead'): PLATFORMS to jump on in his arena (a real platforming fight; A12 stays true — his nova reaches 80 px above the floor, THE HANDS reach whatever you stood on, the arm-in-the-ground punish stays reachable; tools/arena-supplies.mjs and tools/buried-dead.mjs green); a UNIQUE SPRITE (today SPR.burieddead = bakeDead(true), the zombie's baker — bake a huge half-risen corpse-king with frames per tell; PNG sheet + real-page capture); a RANGED SKULL THROW when the player platform-camps or stays far away — told (pose, src/marks.js tell mark, sound), in windingUp(), shield rule by colour (say which and why), forced in the harness (A3).
4. Re-pilot him (bossLab, dice pinned) and INDEX (tools/curve.mjs) before/after.
Keep green: buried-dead, buried-attacks, burial-geometry, burial-route, burial-rework, additional-areas, additional-areas-runtime, arena-supplies, boss-openings, boss-fight-end, audit, traps, killzones, collectables, spawns, deadends, floaters, checkpoints, skins, dressing, signs, tells, one-new-foe, threat-holes, textfit, comments, syntax.
FINAL MESSAGE: shas per chunk, what changed, sprite sheet + screenshots committed under docs/burial/, pilot + INDEX before/after, checks (+ re-runs), parked questions.
```

## Lane 4: Polish

Paste this whole block into a new Claude Code session on the second PC:

```text
You are a second-PC lane (POLISH) for BRACKEN (16-bit platformer, plain JS, no build step, no dependencies).
SETUP: this is a second computer (Windows or Mac; use its shell). In a fresh folder: `git clone https://github.com/draphael123/bracken.git bracken-polish && cd bracken-polish && git checkout claude/polish && git pull`. Node 24 and Chrome are installed; use Chrome for page checks (find its path; do not download anything). Other lanes run on this PC at the same time in their own folders, so keep it light: no more than one Chrome page at a time. PUSH to origin after every green commit so nothing is lost if the PC stops. Push ONLY to claude/polish. NEVER touch master, NEVER run the full `npm run check`, never deploy. Level editor and Boss Rush are PARKED: add nothing. Read docs/AGENT-HANDOFF.md "EXPENSIVE LESSONS". Patches: exact-match replacements; /* */ not // in patch strings; commit messages say WHY and what is unverified; re-run failing checks alone. Node renders lie about light: capture the real page (BK.step renders) and COMMIT screenshots under docs/polish/ so the integrator can fetch them. Other lanes are working at the same time — notably THE UNBURIED FIELD's tile/scenery look (claude/unburied-look) — stay off level tiles/scenery.
ALL APPROVED BY DANIEL; ship-when-green. One commit per item, green at every push:
1. THE GEOMANCER'S ART: her moss-green hood reads like a GOBLIN at game scale (the goblins are green) — recolour it (e.g. grey-brown or stone-grey hood; keep moss/amber in the runes and trim) so she reads as a human mage, not a goblin; and her stave's stone head can read as a SHOVEL at 1x — reshape it to read as a raw standing stone lashed to a thick shaft (docs/briefs/geomancer.md "THE STAVE"). Her frames: src/chars.js / src/redraw/* (search 'geomancer'); tools/geomancer-sheet.mjs renders her. Before/after sheet + in-game capture.
2. PRACTICE YARDS for the WARDEN and the GEOMANCER: both show a "not built yet" message where the other heroes have a trial yard (search the hero trials: 'trial_knight', THE KNIGHT'S TRIAL, PRACTICE / heroTrial in src/main.js and the trials' level builders). Build each a short trial yard in the same pattern as the existing ones, teaching that hero's own verbs (Warden: tip hits/reach, the deflect on the beat, the run-through, the pin; Geomancer: Upheaval pillar, Raise Wall on the beat, Stonefall, the Quake). Keep the existing trial checks green and extend them to cover both.
3. THE UNBURIED FIELD'S CREATURES: the First Death Knight (boss, 'deathknight') and the Standard-Bearer (mini, 'standardbearer') have helms that read as BOXES (src/unburied-foes.js / their bakers; docs/unburied-foes.png). Give them proper silhouettes — a great helm with a crest/visor, a tattered cloak, the Death Knight's scythe/greatsword reading clearly, the Standard-Bearer's banner pole — frames for each tell unchanged in timing. Sheet + in-game capture.
4. THE HERO SELECT SCREEN: 'DEATH KNIGHT' is cut off at the right edge (it already was with six heroes; now there are seven). Fix the layout so every hero's name fits (textW/fitText; the buffer is 320x180); tools/textfit.mjs must check the pick screen (extend it if it doesn't) — prove it red first.
5. TWO DECISIONS FROM 24 SEPT — VERIFY FIRST, then build only if missing (docs/QUEUE.md §4, docs/DESIGN.md Part Three): (a) THE QUEEN'S WALKWAY GOES AND THE CHANDELIER REPLACES IT — the Goblin Queen ('gqueen', Highcrown) was pinned only by breaking her gallery's pillars (`gqOpen` is mode==='pinned'); cut the chandelier's chain to drop it on her and pin her exactly as the gallery did (she already has a chandelier attack, `chandTell`), then remove the walkway; keep A11/A12 and re-pilot her. (b) THE DEATH KNIGHT HERO'S ART GROWS TO MEET HIS HITBOX — his blade box reaches ~24 px past the blade drawn (28 on the planted heavy); lengthen the ART, not the box; his reach does not change. Report for each whether it was already built.
Keep green: textfit, skill-menu, starter-kits, ability-poses, attack-animation, combat-feel, render-layers, geomancer, unburied, unburied-fights, tells, boss-openings, arena-supplies, boss-fight-end, crown-route, gallery-runtime, queen-comb (if the Queen changes), progression, comments, syntax (`npm run check -- a,b,c`).
FINAL MESSAGE: shas per item, before/after paths (committed), what was already built in item 5, checks (+ re-runs), parked questions with recommendations.
NOTE: the Geomancer is now LIVE on master, and the Unburied Field look has been built (claude/unburied-look); run `git merge origin/master` first. Item 1 (the Geomancer art) was committed at 9a1c1a3 but never verified: check it, finish it, then carry on with items 2-5.
```
## Lane 5: The Geomancer rework

Start this after LANE 4 (Polish) has pushed its Geomancer art item, or instead of that item.

```text
You are a second-PC lane (GEOMANCER REWORK) for BRACKEN (16-bit platformer, plain JS, no build step, no dependencies).
SETUP: this is a second computer (Windows or Mac; use its shell). In a fresh folder: `git clone https://github.com/draphael123/bracken.git bracken-geo2 && cd bracken-geo2 && git checkout -b claude/geo2 origin/master && git merge origin/claude/polish` (keep the polish lane's Geomancer art if it is there). Node 24 and Chrome are installed; use Chrome for page checks (do not download anything). Other lanes run on this PC too: at most one Chrome page at a time. Push ONLY to claude/geo2 after every green commit. NEVER touch master, NEVER run the full `npm run check`, never deploy. Level editor and Boss Rush are PARKED: add nothing. Read docs/AGENT-HANDOFF.md "EXPENSIVE LESSONS", docs/briefs/geomancer.md, RULES-LEVELS-AND-BOSSES.md (A, C). Patches: exact-match replacements; /* */ not // in patch strings; commit messages say WHY; re-run failing checks alone; prove every new assertion red first. Keep the pronouns the game already uses.
The Geomancer (src/geomancer.js, isGeo() in src/main.js) is LIVE and Daniel played her. ALL FOUR ITEMS APPROVED BY DANIEL; one commit per item, green at every push; update docs/briefs/geomancer.md to match:
1. HEAVY (UPHEAVAL, hold X) - CHARGE SETS DISTANCE, AND CLOSE FOES MUST BE HITTABLE. Today upheavalX() = 26 + 40*wound px ahead, so even a tap lands a body-length away and a foe touching her is never hit. New: a quick release = a stone spike at her front foot that hits a foe in contact (it must not trap her in rock: A12/freeCell); holding walks the eruption point out to ~2x today's max; the floor marker keeps showing where it will come up while charging (C1). Assert: a foe at contact range is hit by a minimal charge; a full charge reaches the new max.
2. A UNIQUE SPRITE - she must read as a GEOMANCER, not a recoloured mage (and not a goblin): e.g. stone-grey robe, rune-carved stone plates on the shoulders, the standing-stone stave (docs/briefs/geomancer.md "THE STAVE"), pebbles/grit that float while she casts. All her frames and poses keep their timing (tools/ability-poses.mjs, tools/geomancer-sheet.mjs). Before/after sheet + in-game capture committed under docs/geomancer/.
3. THE GUARD BECOMES A ROCK SHIELD (replaces RAISE WALL as her C/guard). She raises a stone shield on her arm that moves with her:
   - it takes TWO hits; visibly cracked after the first; the second breaks it (burst of shards; the WALL passive's shrapnel applies here);
   - a RED blow shatters it at once, fresh or cracked (red still means move);
   - PERFECT BLOCK (raised as a blow lands): the attacker's weapon bounces off and it staggers, as today - and it costs NO hit;
   - NO STAMINA cost and NO passive refill: the ONLY refill is her striking the stave into the ground - a short, told, interruptible cast (a thud + dust ring, her silhouette) that restores it to full;
   - blocked hits fill her TREMOR meter as walls did;
   - the old free-standing wall is no longer her guard: keep it as a bought ability if a slot fits (report where), else park it with a recommendation; the WALL passive branch must still mean something - re-word it to the shield and report the new wording.
   Assert: two yellow hits break it, one red breaks it, a perfect block costs nothing, it never refills except by the cast, the cast restores it. Re-run her bot/lab checks and say what the new guard does to her numbers.
4. HER DODGE BECOMES BURROW: she sinks into the ground (invulnerable for the dodge's grace), travels a short way under the floor and bursts up ahead in a spray of rock. It passes UNDER ground-level attacks but NOT across pits or gaps (she travels through floor only: if there is no floor ahead she surfaces at the last solid cell), never surfaces inside rock or a foe (A12). X as she surfaces kicks the ROLLING STONE, as a dash-X does today. Told and readable (dust trail on the floor while under). Own pose frames (sink, under, burst). Assert the floor-only and never-inside-rock rules.
Keep green: geomancer, starter-kits, ability-poses, attack-animation, combat-feel, render-layers, skill-menu, skill-passives, talents, levelling, progression, tells, textfit, boss-openings, arena-supplies, comments, syntax.
FINAL MESSAGE: shas per item, before/after paths (committed), the new WALL-passive wording, where the old wall went, her lab numbers before/after, checks (+ re-runs), parked questions with recommendations.
```
