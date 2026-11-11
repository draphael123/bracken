# academy: THE MAGE ACADEMY + THE HEADMISTRESS'S FINAL EXAM (opus greybox, behind ACADEMY_SHIPS)
Branch `claude/academy` (off master 067c6de7e), pushed. Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-academy`. Not merged, not deployed.
Plan: scratch/lane-reports/academy-plan.md. Brief: scratch/brief-academy-1016.md.
Verdict: READY AS A GREYBOX. Code only, node-checked. Not browser-walked, no art, boss not tuned.

## Placement (checked against the '!! ' lines)
- THE WITCHLIGHT STAIR -> THE MAGE ACADEMY -> THE MAGE'S FOLLY, as the brief says. Daniel's 11-08 16:57 rule (no level between the Folly and the Falling
  Tower) is about the seam AFTER the Folly; the Academy sits BEFORE it, so the rule holds (tools/academy.mjs asserts the Falling Tower still needs the Folly).
- 11-08 09:17 pulled the fantasy greyboxes forward; this is the Academy's night.

## Built
- **Flag:** `src/ac-flag.js` ACADEMY_SHIPS = false. `acOn()` = the flag, `?ac=1`, or `globalThis.__AC` (`tools/ac-on.mjs`). Flag off = master exactly (proved).
- **Road:** master's ONE road-insert rule (src/route-insert.js applyInserts / roadMigrate / roadKept) with the Academy's own one-row table (`AC_INSERT`),
  so there is NO levelLocked edit, NO new PROG flag and the desert table / tools/route-insert.mjs are untouched. LEVELS row APPENDED only while acOn();
  the Folly then needs the Academy; an old save past the Stair keeps the Folly open (PROG.roadOpen.mage, once). Map node (184,58), between the Stair and the Folly.
- **Level** `src/academy.js` (340 x 48, floor row 40), rule 'THE LESSONS ARE STILL BEING TAUGHT. LEARN THE SPELL AT THE LECTERN; IT LASTS THE LESSON.'
  - 0-17 THE ACADEMY STEPS: up from the Stair's road, the rule.
  - 18-99 THE LIBRARY (teach LEVITATION): stacks rising to the reading gallery; the only way on is the high door (legs alone cannot reach the next room:
    proved); the archive pit + a drifting reading desk; two SPELLBOOK FLOCKS; SILVER 1 on the tallest stack; a rune carrel.
  - 100-179 THE LECTURE HALL (develop BLINK): tiered benches down from the door, three WARD RAILS floor to ceiling, an apprentice duel between them, the
    orchestra pit (jump + blink), a rune trapdoor cellar; SHRINE 1 (col 172).
  - 180-249 THE CONJURATION YARD (twist CONJURE STEP): the summoning well (46 tiles, no floor), floating stones, a bobbing stone, the far bank 4 rows up;
    SILVER 2 on a high summoned stone (climb your own steps: jump off one, conjure at the top); a rune cellar.
  - 250-299 THE EXAM HALL (exam): three lecterns in quick succession - float over a 12-row wall, blink a rail, build over a 10-tile gap; SHRINE 2 (col 296).
  - 300-339 THE EXAMINATION: the boss. Checkpoints START + 2 (checkRun 200). Placed by hand (calm). No goblins: apprentice, broom, armour, imp, bat + the flock.
- **The cantrips** `src/academy-hands.js` (every hero the same, no new buttons):
  - A LECTERN (touch or strike) teaches its room's spell; leaving the room ends it ('THE LESSON ENDS'); another lectern swaps it.
  - LEVITATION: hold JUMP in the air = float up at 112 px/s, 1.4 s per airtime (refilled on landing). A held jump rises 3.1 rows on legs, 12.9 with it.
  - BLINK: the DODGE button = an 80 px teleport the way you hold/face; passes ward rails, NEVER stone (fizzles), hangs a beat in the air, cooldown 0.45 s.
  - CONJURE STEP: JUMP in the air = a 3-cell ONEWAY step under the feet, 2.2 s (flickers the last 0.6 s), 2 a hero.
  - PITS: no floor; a fall is filed back to the last firm footing for 14 (spare, never a death).
  - SHORTCUT RUNES: struck, a shutter lifts into a cellar/alcove that pays (open in the built grid so reach/quality see it; shut in play).
  - Every changed cell (steps, rails, the dismissed floor, shutters) is kept and put back on a reset.
- **New foe: THE SPELLBOOK FLOCK** `acbooks` (30 hp, flies, runner): five books wheel round a shelf; told GATHER (0.7 s, yellow !, MARK/ANSWER/HEIGHT rows),
  then they STREAM through where you were (8, blockable). A block SCATTERS it (1.5 s, x2). It looks 150 px up but only 84 down: it hunts floating heroes.
  (Id note: a kind with 'lock' in it trips level-quality's gadget regex, so it is 'acbooks', not 'acflock'.)
- **Boss THE HEADMISTRESS** `headmistress`: fight pure in `src/headmistress.js`; world, POSE table, greybox in `src/headmistress-hands.js`.
  - 2600 hp, x0.4 outside openings ('SHOW YOUR WORK' clank + guard fx), CORRECT = OPEN x2 for 3 s (capped 12%); finale openings 1.8 s, 6%. Phase floors 70/45/20%.
  - One of the three Examination lecterns is lit per phase (touch = that cantrip). A blow that USES THE LESSON stamps CORRECT and she staggers.
  - P1 LEVITATION: she lectures from the rafters (out of jump reach) inside 4 SHIELD BOOKS (a blow through one pops it; they regrow); CHALK RAIN (told 0.9 s,
    3 circles per hero, 14), THE RULER (told 0.6 s, blockable 16). CORRECT = a blow while floating (or from a gallery) with <= 2 shield books left: she drops, open.
  - P2 BLINK: on the floor behind a WARD RAIL on her facing side, floor to ceiling; CHALK BOLT (told 0.7 s, blockable 16, through the rail); ABOUT FACE (told 0.8 s,
    every 5.5 s or when someone lingers behind: the rail turns with her); THE RULER at her back (18). CORRECT = a blow on her BACK within 1.5 s of a blink THROUGH a rail.
  - P3 CONJURE STEP: THE FLOOR IS DISMISSED in two told stages (1.5 s flicker; the side ledges stay); she floats at her desk over the void; DISPEL (told 1.0 s, red !!:
    every step vanishes); chalk rain. CORRECT = a blow from a conjured step. The void files you back to a ledge (14, spare).
  - FINALE (last 20%): rapid calls LEVITATE! / BLINK! / CONJURE! (never the same twice running) - she takes that lesson's station (rafters / floor behind a rail /
    over a pit) and lights its lectern; each answer = a short opening; unanswered in 7 s she calls the next.
  - Every move has its own windup pose, release pose and sound (B16).
- **main.js:** 20 single tagged lines `(claude/academy)`, every one behind acOn()/ACH/HDH/its ents: import, roadMigrate line, reset, spawn case, map node, EHP literal
  rows, take, bossEnd, level update, boss update, flock AI, construct (TIER 2.72 / TIER_BOSS 2.32, between the Stair and the Folly), strike, drawBack, enemy draw,
  drawOver, barName, dev entry, BLINK before the dodge, LEVITATE/CONJURE after gravity (the Sky Road cloak's spot).
  Dev URLs: `?ac=1&dev=1`, `&acsec=1..5`, `&acboss=1`, `?ac=1&boss=headmistress`.
- **Shared one-liners:** src/level.js (import + guarded push/insert after applyInserts), src/threat.js, src/marks.js (BY_HAND row + Object.assign),
  tools/level-quality.mjs (GATE, REPORT_ONLY music/pilot/mash/curve, ROLES runner), tools/additional-areas.mjs (the road pairs).

## Node checks (no browser, no check.mjs, no map-scale; free RAM 2.8-4.5 GB before each batch)
- **tools/academy.mjs: all ok, flag off and flag on.**
  - Flag off: LEVELS, the Stair and the Folly have master 067c6de7e's signature; fake saves untouched; 20 hooks all guarded; the desert insert table untouched.
  - Flag on: road + old saves (3 cases), build, the fill reaches every shrine/silver/lectern/rune/the boss, legs alone do NOT reach the Lecture Hall.
  - With a copy of the game's arc (src/hero-move.js numbers): levitation's rise, lectern teach/forget/swap/dark arena lecterns, blink through a rail / over the pit /
    fizzle at stone / plain dodge without the lesson, the step's cells/life/cap, A BOT CROSSES THE SUMMONING WELL on 8 steps in 8.5 s (without: filed back),
    the pit, the runes, the reset, the flock (gather, stream 8, scattered x2, ignores a hero 18 rows under it).
  - **The Headmistress, bot with a 40 sword and a 640 hp pool:** PASSES in 87 s with 580/640 left; all four phases; every lesson answered
    (levitate 4, blink 3, conjure 4; 11 CORRECT, 5 finale calls; 2476 dealt open vs 124 as SHOW YOUR WORK); every move out of its own windup; the floor dismissed
    in 2 stages; the win drops her rail and recalls the floor. A bot that never uses a lesson never opens her and runs out of time (500 s).
  - B15 maths: a 40 blow lands 16 outside, 80 when correct; three shield books block the P1 answer; the opening cap holds; P1 holds at 70%.
- **level-quality academy (flag on): CLEARS THE BAR** - bands 5 / 54% multi-height, 5 gadget kinds / 4 developed (lectern x7, pit x4, rail x4, rune x3, mover x2),
  secrets 2, checks 2 (1 per 92 route tiles), density 1.42 / 1 empty screen, 4 roles, route 18 rows / 4 pockets.
  WARN (report-only): music, pilot, mash, blocking (18%). The full gate passes with the flag on and off (every gated level clears).
- **ok flag on AND off (23 tools):** checkpoint-gaps, solid-islands, signs, spawns, killzones, checkpoint-stand, boss-read, answer-tags, deadends (4, all pay),
  map-grammar, map-spacing, map-roads, additional-areas, tells, blow-tags, foe-pass, one-new-foe (the flock is the Academy's new foe; the Folly still passes), death-fx,
  threat-holes, goblin-lint, comments, architecture, route-insert.
- **Listed only (as for wispwood/ghosttrain):** floating-geometry 5 groups (the summoned stones and the two galleries), anchor-lint 3 cantilevers.

## Owed
- **Browser walk** (dev URLs above). Watch: the float feel (rise speed, meter), blink through each rail and the fizzle at stone, conjured steps under a falling hero
  (the snap is up to 6 px), the summoning well chain and the high silver stair, the exam hall's three swaps, the flock's stream vs a floating hero, every Headmistress
  move, the rail turning with ABOUT FACE, the floor's two stages and the recall (no hero trapped in a recalled cell), the finale's calls, the win; a co-op still.
- **Art lane (sonnet):** all greybox - the academy kit (lecterns per spell, bookstacks, reading gallery, chalkboards, house banners, ward rails, conjured steps,
  the summoning well, the exam hall), the flock, THE HEADMISTRESS sheet (`src/redraw/headmistress_art.js` to come, POSE table is the brief), map node art + blurb,
  transition rows (Stair -> Academy -> Folly), music (Daniel picks).
- **Tune (n=6, with flasks, to 60-70%):** boss-run / boss-rates need an `--ac` flag (sets `globalThis.__AC` in the page) and lesson pilots (the page bot never
  floats/blinks/conjures: hooks `ACH.teach`, `ACH.blink`, and the step for P3). The node bot passes in 87 s, below the 90-150 s band: hp likely ~3000.
- **Page tools not run:** level1-pilot (pilot + curve rows), mash-bot, map-scale, map-forks, reach-heroes, stuck, textfit (ac-lines), hint-shown, mobile-perf,
  boss-openings, boss-greed.
- **Not built:** bestiary cards (acbooks, headmistress), a boss-rush row, MARK rows for her tells (she wears her own !/!! via ctx.number), SAY_LINES routing of
  ac-lines, tools/academy.mjs not wired into check.mjs.

## Questions (rec = what I built; none block)
1. **Placement:** Stair -> Academy -> Folly, node (184,58). **Rec: keep** (the 11-08 seam after the Folly is untouched). With Wispwood also live the road is
   Caverns -> Wispwood -> Stair -> Academy -> Folly - two new levels on that stretch; if that is too dense, the Academy can wait for Wispwood's ship batch.
2. **Inputs:** levitation = hold JUMP in the air, blink = the DODGE button, conjure = JUMP in the air (no new buttons, every hero the same). **Rec: keep.**
   Alternative: all three on the skill key.
3. **"A few uses / until you leave the room":** I built ROOM-ONLY (no use counter) with per-use limits instead (1.4 s float per airtime, blink cooldown 0.45 s,
   2 steps a hero). **Rec: keep** - a counter strands a player mid-room; the alternative is 3-5 charges refilled at the lectern.
4. **Pits never kill** (filed back, 14). **Rec: keep** (fewer checkpoints; the death cost is the death, not the pit). Alternative: pits are death.
5. **Shortcut runes are secret cellars** (they pay coins), not road shortcuts - the road never doubles back. **Rec: keep.**
6. **P3 without the lesson she cannot be reached** (over the void); x0.4 applies whenever she is reached. **Rec: keep** - the lesson IS the guard-break, as the
   Widow's tiers are lit only in her glow.
7. **Headmistress 2600 hp:** node bot 87 s. **Rec: the tune lane sets it at n=6 with flasks** (probably ~3000 for 90-150 s).
8. **Music:** borrows the benched 'cave' and the pool's 'boss3' (report-only). **Rec: Daniel picks** (a cloistered study theme; a stern chamber-organ exam theme).
9. **Merge with silk / wispwood / tourney:** the shared one-liners (level.js after applyInserts, level-quality GATE/REPORT_ONLY/ROLES, additional-areas' road
   line, the EHP literal's head, marks/threat tails) will conflict textually; each side keeps both. **Rec: the integrator keeps both lines.**
