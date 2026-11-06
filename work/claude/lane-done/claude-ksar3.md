KSAR3 DONE 11-06 10:50 READY (code-only greybox behind its flag; browser / art / tune owed - listed below)

# claude/ksar3 - THE BANDIT KSAR 3 "THE FORT ANSWERS ITS GONGS" + THE SUN-SHADE STALKER + THE GONG-MASTER + HAWK-MISTRESS 2 (OPUS greybox, code-only, 11-06)

Branch `claude/ksar3` off `claude/colossus4` 5f28d2603 (contains claude/desertkit). Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-ksar3`. Pushed. NOT merged, NOT deployed.
Sources: plan-desert-1105 s1.7 / s2 / s3c / s4 / s6 (Daniel approved 11-05 14:07), briefs ksar3-1016, hawkmistress2-1014, ksarfix-1014, newminis-1015 (!! 10-15 approved Gong-Master kit). Plan overrides applied: RAZOR MOULT name, TALON SNATCH strike-answerable, HER HAWK BURNS + oil fire-lines.
Everything was built FULL: the level, the foe, the mini and the boss (no stubs). None of it has been played in a browser (none allowed during the gate).

## FLAG / URL
`src/ksar3.js` `KSAR3_SHIPS = false`. **OFF: the 'ksar' row builds master's Ksar exactly.** Proof: `tools/ksar3.mjs` builds the level in a clean child process and checks its grid + ents + fields hash against master's (b00caed58...). `tools/ksar.mjs` (flag off) still passes all 259 checks.
**ON** (`?ksar3=1`, `globalThis.BRACKEN_KSAR3`, or `KSAR3=1` for Node tools) the **same road slot** builds Ksar 3: id 'ksar', index 55, needs 'glasssea', so no index or save moves. Play it at `?ksar3=1&level=ksar`.
Decision (the rec): new level data in the same slot. Master's Ksar 0-795 is kept as it is (the road, the walls, the gate winch, the souq, the powder store, the hawk-tower roofs, the powder quarter, the keg alley and its tower). Master's line to the courtyard and the courtyard itself are replaced by the new tail (796-1103). The tail is hooked in through one optional `k3` argument on `buildKsar`; with no `k3`, every line runs exactly as on master.

## What was built
| file | what |
|---|---|
| `src/ksar3.js` (new) | flag, `K3` layout numbers, `ksar3Tail` (the new tail), `buildKsar3`, `lintKsar3` |
| `src/sun-stalker.js` (new, pure) | THE SUN-SHADE STALKER (the one new foe, own AI). It wires the MIRAGE rule: it looks the way `mirage-kit.stalkerLook` says - alpha 0.08 in glare, 1 in shade. It shimmers 0.4 s before it commits (0.55 s in shade), then lunges, then recovers in plain sight. A blow that lands during the shimmer breaks the lunge. It keeps to its own roof. |
| `src/gong-master.js` (new, pure) | THE GONG-MASTER mini: stage (3 gongs on ropes from a mud-brick arch, 2 side doors, a portcullis gate) and the approved kit, every move told: GONG STRIKE !! (floor wave: jump it; calls 1-2 bandits, capped at 2), MALLET SLAM !! (roll), THROWN CYMBAL ! (goes out high and comes back low, or the reverse: duck, then jump), ROPE SWING !! (P2 only: he marks your spot, swings and crashes there; move off). **The opening: cut HIS rope**, meaning the gong he is walking to or winding up at, or the rope he is swinging on. That silences him: OPEN x1.5 for 3.5 s, at most 12% of his hp per window, then a 2 s ward that is told. If the gong drops on him it only staggers him for 0.6 s (plan s2). Cutting any other rope just takes that gong away from him. He re-hangs a gong 12 s after it is cut, with a 1.5 s warning. Damage floor: coat x0.75, ward x0.4, never 0. `gmPlan` = the bot. |
| `src/hawk-mistress.js` | **HM2, active only when the arena has `hm.v2`** (only her new roof does; master's courtyard does not, so her live fight is untouched): (a) HER HAWK BURNS - a new line for the existing torch DOWN opening. (b) OIL FIRE-LINES - a torch landing in one of 3 roof channels lights a line for 6 s. She cannot cross it (walk, cut and leap stop at its edge). The hawk will not stoop at a hero standing in its smoke. Lit while the hawk is near, the smoke grounds the hawk and she is BARE. A hero standing in the fire takes ticks. (c) TALON SNATCH - when the snatch catches you, the hawk lifts you 34 px for 1.0 s. Strike it: you drop free and she is BARE. Don't: it drops you in front of her and she makes a told 0.45 s cut (block it). No mash. (d) RAZOR MOULT (P3, the hawk's new move): a told '!' 0.9 s station, then 3 feathers at head height (duck or block). One new hawk move per phase: rake P1, talon P2, moult P3. HM2's rows live in their own tables (`MOVES2`, `MOVE_NAME2`, `CYCLES2`, `HM2`); master's tables are untouched. |
| `src/hawk-mistress-hands.js` | v2 only: feathers hit as feathers; `lift` / `hawkStruck` / `drop(how, x)`; `onIgnite`; greybox drawing (oil glint, fire line, smoke column, GROUNDED / STRIKE IT! / moult pose names) |
| `src/ksar3-hands.js` (new) | binds the stalker (exposure = shade boxes + roof over head; otherwise glare), the Gong-Master (his yard's gongs, called bandits, ropes re-hung), and **L.mirages** (desert kit `mirageStep`, wired for the first time). Greybox drawing. |
| `src/ksar-hands.js` | 2 hooks: a cut on one of his yard's gongs calls `ctx.bossCut`, a torch's `ignite` calls `ctx.bossIgnite`; plus `rehangGong` (works only on his yard's gongs) |
| `src/main.js` | 11 one-line hunks, all inert unless the level has `L.ksar3`, the ent is `sunstalker`/`gongmaster`, or the arena has `hm.v2`: import, clear, spawn case, take, update, draw, tick, drawWorld, drawOver, the KSH ctx hooks, the constructor + EHP rows |
| `src/ksar.js` | the optional `k3` hook: W, a `check()` helper (k3 keeps 3 of master's 7 shrines), master's line-to-courtyard + courtyard moved into `else` branches, `fix(out)` |
| `src/level.js` | `build: () => ksar3On() ? buildKsar3(...) : buildKsar(...)` (same row) |
| `src/marks.js` | MARK / ANSWER / HEIGHT rows: `sunstalker|commit`, the four `gongmaster|*Tell`, `hawkmistress|moultTell` |
| `tools/ksar3.mjs` (new) | **93 ok** node proofs + two toy duels (`--sim=N`, `--log`) |

### The tail (columns)
- **796-904 THE LINES OVER THE SOUQ (teach, then test):** Zip lines: alley tower -> R1 -> minaret (stair on the roof) -> R2 -> T2, then **THE HOP**. Z3 ends in mid-air and Z4 hangs under its last stretch. DOWN or JUMP off Z3 lands you on Z4: flown on `zipline.js`, with a 9+ tile window for DOWN and 3+ for JUMP, so it is never frame-perfect. The streets below are solid ground (a miss means climbing a stair back up). A silver is on the street under the hop. Stalker 1 is taught under an awning (seen plain), stalker 2 is tested in the glare. The street has 2 bandits and stalls.
- **905-923** the roof over the Gong yard, with a shrine (a door shrine).
- **924-963 THE GONG YARD:** the Gong-Master mini (L.mini, a portcullis gate that lifts when he falls).
- **964-1030 THE HIGH LINES (the exam):** up a tower where a LOOKOUT runs for the exam gong. A rung gong sends 2 RAIDERS down a raider line onto R5 (cut the gong first, or the line's post on R5). THE HOP repeats over a FATAL wadi drop. Two stalkers wait in the glare. A MIRAGE SHADE (gives no cooling; stalkers stay invisible under it) and a MIRAGE ROOF (a trick, not a trap: you drop 3 rows onto R6). A plated bandit and a keg stack at the tower's foot.
- **1031-1036 THE TALLEST TOWER:** the stair, a shrine on the crown, then THE LAST LINE through her door (the tower's height below it is a fatal drop).
- **1052-1101 HER ROOF:** HM2 on the tower top (floor 10 rows above the street, open sky either side). Master's 3-roof + 2-shaft stage is kept; the shafts read as the tower's stairwells, whose updraft throws you back out.
- **Checkpoints: 6** (master had 7 over a level 28% shorter): master's 168 / 392 / 581, plus three new ones - the alley tower's crown, the Gong yard door, the tallest tower's crown. Every gap is inside the A10b band (140-260 route tiles), but two gaps break the older hard MAX of 200 (see Q1).
- **Shade:** awnings on the crowns, minaret/tower shadows over the stairs, CLOTH LINES strung over the ropes. `ksar-sun` reports 0 stretches over 2 s (same as master). The stalkers' own spots stay in the glare.
- Theme: mud-brick, minarets, striped awnings, brass gongs, cloth lines (greybox colours). No wood, no logs, no goblins.

## Node results (one at a time; no browser, no tools/check.mjs)
- `node tools/ksar3.mjs` **93 ok**:
  - flag both ways (hash, same slot);
  - `lintKsar3` + `lintMirages` clean;
  - checkpoints;
  - portcullis gate;
  - HM2 oil channels clear of the shafts;
  - **both hops flown** (DOWN 9+ tiles, JUMP 3+, riding Z3 to the end drops you to the street or, on the exam, the wadi);
  - **reach fill** (zipTransfer) reaches R1 -> minaret -> R2 -> T2 -> R3 -> the yard, and from past his gate the exam tower -> R5 -> the crown -> HER ROOF;
  - the stalker (alpha in glare vs shade; the shimmer always comes before the blade, >= 0.4 s / 0.55 s; a strike breaks the shimmer; stays on its roof);
  - the Gong-Master (every move told, no untold hit, the cymbal's two heights, cutting his rope vs another rope, the open window cap, one opening at a time, the told re-hang, the told ward, the stagger only when the gong is over him, the floors, all ropes cut = no call and no swing);
  - HM2 (master's courtyard has no v2, HER HAWK BURNS, the oil grounds the hawk -> BARE, she can't cross the fire, smoke only over the line, talon struck free -> BARE / not struck -> blade drop + told cut, moult fires 3 feathers);
  - a hands smoke (spawn, update, draw and the onCut path on a fake world).
- **TOY DUELS (flow sims, NOT the rate), n=6:**
  - GONG-MASTER: 6/6 won, avg 58 s, 4.7 openings per fight (his rope cut), 2.7 flasks left. **Too short and too easy as a flow sim** (REC Q4: hp 1400 -> ~2000).
  - HAWK-MISTRESS 2: 3/6 won, avg 169 s, all reach P3. Per fight: 11.3 downs, 8.2 bares, 1.3 oil lit (0.5 smoke). Talon: 2 lifts, both struck free. 0.7 moults. **Long** (REC Q5).
- `KSAR3=1 node tools/level-quality.mjs ksar`:
  - Passes flat, bands 9, mechanics 12 kinds / 7 in 3+ places, music, secrets 2, checks (6, one per 177 tiles), encounters, density 1.47, ranged, roles 4, ruleFight, route.
  - **FAIL pilot + mash** (the level hash changed; both need page tools, owed). Blocking is WARN only (report-only for ksar).
  - Flag off: exit 0.
- Flag ON, passing: `ksar-sun` (0 stretches over 2 s, longest 1.7 s), ksar-aloft, ksar-locks, mirage-kit, one-new-foe, goblin-lint, answer-tags, desert-bosses, foe-glue, dangling-paths, comments, boss-checkpoint, checkpoint-stand, checkpoints, floaters, floating-geometry.
  - `anchor-lint` lists ksar at 89 (master 44): the tail's one-way stair boards and roof perches. Listed, not gated; the art lane anchors them.
- Flag ON, failing: **`checkpoint-gaps`: ksar TOO SPARSE 227** (168 -> 392) (Q1). Passes A10b. Flag off it passes (the suite doesn't move).
- Flag ON, failing: `tools/ksar.mjs` asserts master's sections/rooftops (expected). It needs a k3 branch at the flip.
- Flag OFF: `tools/ksar.mjs` 259 ok, `answer-tags` ok, `checkpoint-gaps` ok, `level-quality ksar` ok.
- `node --check` passed on every touched file. Filenames (ksar3, ksar3-hands, gong-master, sun-stalker) are clean vs ad/banner/track/pixel/promo/analytics/admiral.

## Browser owed (one at a time, >= 1500 MB, memguard first; all with ?ksar3=1&level=ksar)
1. Walk the tail with knight + reaper + a ranged hero: each rope take; **both hops (DOWN and JUMP)**; the stairs (two-row steps); falling to the street and climbing back up; the stalkers' look (glare haze vs awning) and their shimmer read; the mirage shade and roof; the exam gong -> raiders on R5 and cutting the line's post; the last line through her door (the hero's head clears the wall by about 10 px in the model); co-op seats.
2. Gong-Master:
   - his wake on the mini trigger, the wall, the portcullis lifting on his death;
   - a cut through `ksar-hands` reaching `onCut`;
   - re-hang drawing;
   - called bandits spawning at the doors;
   - can a hero cut a rope while he swings on it?
   - Then the bossLab hook for `gongmaster` (none yet: a tune-lane line driving `gmPlan`), then `boss-rates` n=6 WITH flasks (70-80%), mash 0/6.
3. HM2:
   - **can a hero attack while `hmCarry.lift` holds him** (the strike-free answer depends on it);
   - torch arcs into the oil;
   - the fire line stopping her;
   - the smoke grounding the hawk;
   - feather height vs duck;
   - then `boss-rates ksar` n=6 WITH flasks (60-70%), mash 0/6;
   - boss-openings / untold-told / mark-integrity / hint-shown.
4. `level1-pilot ksar --write` + `mash-bot ksar --write` (flag on), reach-heroes, the QUICK gate on the branch.
5. **Seen while reading the code (not changed):** her existing 'high' knife flies at 24 px, while a hero's box is 14 px tall (P.h = 14), so a standing hero may never be hit by it. Check in the browser. Also, main.js calls `KSH.update(dt)` twice per frame (lines ~24681/24683); that predates this lane.

## Art owed (art before live)
- Tail kit: the rooftops (pisé red), minarets, towers, the tallest tower, cloth lines, the shadows, stair boards in mud-brick; the street stalls.
- HER ROOF reading as high up: sky and the town far below (`arena.high`), parapets, wind, flags.
- THE SUN-SHADE STALKER: sprite, the glare haze, the commit shimmer, `skCommit` / `skLunge`; bestiary card.
- THE GONG-MASTER: sprite and mallet; poses gmStrikeWind/Rel, gmSlamWind/Rel, gmCymWind/Rel, gmSwingWind/Rel, gmSilenced, gmStagger; the cymbal; the floor wave; the re-hang; bestiary card.
- The yard's arch and the gongs on ropes; the portcullis.
- HM2: oil channels, the fire line, smoke, the grounded hawk, the talon lift (hawkTalonLift/Drop), the moult (hawkMoultWind/Rel), the feathers.
- Mirage shade and mirage roof.
- Music: the yard borrows banditking; her roof keeps hawkmistress.

## Questions for Daniel (recommended answer first; each built as the rec)
1. **Checkpoints: 6 (master 7)** at 168 / 392 / 581 / alley crown / Gong door / tower crown. Every gap is in the A10b band (140-260), but 168->392 (227 tiles) and 581->crown (210) break the older hard MAX of 200. REC keep 6 and add a ksar KNOWN line in checkpoint-gaps at the art merge, like warcairn and FT4. It cannot be added before then: with the flag off ksar passes, so the line would be stale. Alt: 7 shrines that pass MAX 200 (168/276/392/581/702 + the two doors).
2. **Replace vs new id:** REC the same 'ksar' slot. Ksar 3 replaces the Ksar at the flip, saves keep their place, and master's courtyard fight retires. Alt: a new id 'ksar3' with its own map node (one more desert level).
3. **The Gong-Master opens only when you cut HIS rope** (the gong he goes for or swings on), not any rope. Any-rope cutting gave the bot 7 openings in 53 s. REC keep it. Alt: any rope.
4. **Gong-Master length:** toy duel 58 s with 2.7 flasks left. REC hp 1400 -> ~2000 before bossLab (mini band 70-80%, 90-150 s).
5. **HM2 length:** toy duel 169 s (target 90-150). REC hp 3200 -> ~2700 for the roof, and/or oil lines lasting 6 -> 5 s, then boss-rates n=6.
6. **HM2 keeps master's 3-roof + 2-shaft stage on the tower top** (the shafts become stairwells with an updraft). REC keep it (proven, tuned layout). Alt: one open roof with parapets (a new stage; re-tune).
7. **Mirages:** REC two light touches on the exam (a fake shade where the stalker stays hidden, and a fake roof that drops you 3 rows). Alt: none (keep the mirage for the Great Dune).

## Final tip
claude/ksar3 - see `git log -1` (pushed). Not merged, not deployed. Play: ?ksar3=1&level=ksar. Proofs: `node tools/ksar3.mjs` (93 ok, ~1 min).
