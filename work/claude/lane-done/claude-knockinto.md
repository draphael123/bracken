# claude/knockinto: KNOCK FOES INTO THE LEVEL + THE ANTI-PLUNGE FIX (Opus core, 2026-10-11)

Brief: scratch/brief-combat2.md section 1 and section 4 with its '!! UPDATE'. Base: origin/claude/riposteart 866bfb9e. Port 8840.

## WHAT IS BUILT

### 1. Knock-into (new module src/knock-into.js)
**What throws.** A **HEAVY cut**, a **RIPOSTE cut** and the **FINISHER-ON-BREAK** throw the foe along the blow. The finisher-on-break is the combo's finishing cut into a foe that is already broken. The blow that broke him does not throw, so his opening is kept.

**How far, by weight** (`weightOf`; measured on the flat with a heavy cut):

| Foe | Distance |
|---|---|
| Small | ~124 px |
| Mid: shield, soldier, hound... | ~74 px |
| Brute | ~25 px, a step |
| Elite | x0.6 on top |

- **Bosses and minis are never thrown**; `knockFoe` refuses them, as before.
- **A guard toward the blow means a slide.** A raised mashed guard, a cover kind's front or an elite's guard makes the foe **slide** (no lift, x0.65 speed). A heavy that breaks the guard throws normally.
- **A broken foe that is thrown flies first**, still broken, and stands where it lands. Before this, broken froze it in place and it flew only when the break ran out.

**What it lands in.** `hazardAt` / `killAt` / `thrownAt` read only what levels already carry; there is no per-level code.
- **Killing hazards** (the existing `hazardFoe` rules): spike tiles, the drop under the world, and deep non-swim pools.
- **Thrown-only hazards:**
  - fires, lit firepits, firevent gouts, hot plates and lit braziers
  - harm swim pools: foul or poison
  - the crusher in tell/drop, which holds the foe under the slab; the slab's own PRESSED 40 does the damage
  - **`L.knockHazards` rows** `{kind, x0, x1, y0, y1}` in px, for the Sonnet data pass
- **Reads**, said as it goes in: INTO THE SPIKES / OFF THE EDGE / INTO THE WATER / INTO THE FIRE / INTO THE MIRE / INTO THE POISON / UNDER THE PRESS / INTO THE LAVA. They are added to MOVE_WORDS.
- **A ledge over a death drop** is told OFF THE EDGE the moment the foe drops below its ledge. In the test that was frame 30, and the death came at frame 53.
- **A foe that walked in rather than being thrown** keeps its old word (IMPALED / DROWNED / OVER THE EDGE).

**What each hazard does to a thrown foe:**

| Hazard | Common foe | Elite |
|---|---|---|
| Spikes, drop, water, lava | Dies | **Never killed by a throw**: 25% of his bar, then put back where he was thrown from |
| Fire | 45% of its bar and burn 2 s | 15% |
| Foul pool | 35% | 12% |
| Poison pool | 45% | 15% |

- **The sun is not a hazard to a foe** (question 2).
- **Co-op:** the thrower is `e.kiBy`, and every read and every number is the world's, not one hero's.
- **The knight's third cut and THIRD_PAY are unchanged.** When his third-cut word is said, the knock-into word is skipped, so the two don't stack.

### 2. THORNED elite (src/anti-plunge.js)
- **The spines are drawn on his body** (`drawSpines`) along his top and back. They rise with every cut of a mash, but only while the flurry is live; before, the dots stayed up forever after a single cut.
- They stand full and shiver through the red !!, and the **!! word stays**.
- **The burst fires the spines off his body as particles** (`spineBurst`). The ring that was flung round him and the orbiting dots are gone.
- **A plunge never counts toward his mash.** elite-kit `take` treats any blow tagged 'plunge' as not a blade.
- **While his spines are down he is plunged like anyone. While they are up he is SPIKED** for his thorns' damage.
- It stays the anti-mash answer.

### 3. Spike Goblin ('thorn')
- **A TOLD BRISTLE:** a hero above him (within 14 px plus half his width, up to 130 px over his head) raises his back spikes over ~0.3 s.
- The rise starts with a clatter and is drawn as iron spikes.
- **Only a FULLY bristled back bites** a plunge or a stomp (the old 20, `DMG.spined`).
- Plunged before the spikes are up, he takes the plunge. There is no longer an untold 20.

### 4. Spitter (rule c)
- A plunge coming down on it makes it **hop aside 22 px**, but only if the step is safe (never off a ledge or into spikes).
- It then stands **OFF BALANCE for 0.6 s**: broken, so a quick cut finishes it.
- Cornered, it doesn't step: the plunge lands and the shooter family's glance stands.

### 5. Reactions a-d (src/foe-react.js, `REACT_AIR`)
This is the shared API for the BROKEN ORDER knights. State lives in `e.ra*` / `e.aa*` / `e.ss*` / `e.ct*`, never in `e.mode`, so no new marks rows are needed until a body uses it.
- **a, GUARDS HIGH:** `guardsHighTick` + `guardsHigh`. The guard pose rises in 0.15 s; a plunge is clanked and bounced, no damage either way.
- **b, ANTI-AIR:** `antiAirTick`. A told ! for 0.45 s, a thrust column, then a 0.75 s open recovery (`e.aaOpen`).
- **c, SIDESTEP:** `sidestepTick`. **This is the one live use, on the spitter.**
- **d, CATCH + THROW:** `catchThrowTick` with `safeThrowDir`. A told !! grab; the throw is never into a death drop or the spikes; with no safe side the hero is set down.

Demo uses: **only c (the spitter).** a, b and d have no existing foe that clearly fits under the update's rule; it reserves them for the order knights. 'PLUNGE THE HELM', the plate family and the wasp pogo are untouched.

## HOOKS (main.js at 17f966a8, each commented `(claude/knockinto)`)
- **113:** imports.
- **6209:** KI words shown.
- **7288-7293:** `knockFoe` (wt/slide option; a riposte may throw a parried elite).
- **7296:** KI install.
- **7300:** `RA_API`.
- **7311:** `hazardFoe`'s word and the elite spared.
- **7673:** the throw site in hurtEnemy0 (`kiWhy` + `KI.throwFoe`).
- **9683 / 9687:** the plunge branch (thorn / THORNED spiked only while bristled).
- **9763:** the stomp.
- **25061:** `thornTick`.
- **25063:** the spitter's sidestep.
- **25064:** broken no longer freezes a thrown foe.
- **25079:** `KI.flight`.
- **3842 / 3859:** the THORNED burst and spines.
- **29742:** the thorn's spines drawn.
- **Spitter hop lift:** the bob line in drawEnemies.
- **31961:** `BK.knockInto` / `BK.raApi`.
- **Other files:**
  - src/elite-kit.js:191 (a plunge is never a blade)
  - tools/check.mjs (adds knock-into)

## CHECKS (PORT 8840, sequential)
- **New: tools/knock-into.mjs** (added to `npm run check`): pure, throw, hazard and anti, about 50 assertions, all green.
- **Existing checks, all exit 0:**
  - combat-part2
  - elites
  - tells
  - untold-told
  - mark-integrity
  - boss-read
  - blow-tags
  - riposte
  - knight-rework
  - pogo-chain
  - finishers
  - firedrop-plunge
- **Mash bot, boss fights, knight/warden/pyro x2:** stockade 0/6 (the bot timed out without reaching the chief, as in the riposte lane), towpath 0/6, ksar 0/6.
- **level-quality on stockade, towpath and ksar:** identical to the base. towpath and ksar pass. stockade misses bands, mechanics, secrets and route, the same as before; it is not a gated level.

**3-seed sanity** (human profile, kit flasks, practiced; no tuning). "Before" is the riposte lane's "after".

| Boss | Before | After | Shift |
|---|---|---|---|
| stockade (chief) L3 | 78% | 1/3 3/3 3/3 = 78% | 0 |
| towpath (Fog Knight) L25 | 100% | 9/9 = 100% | 0 |
| marsh (frog) L3 | 100% | 8/8 = 100% | 0 (one pyro run errored: "lab page did not initialize") |
| ksar (Hawk-Mistress) L39 | 67% | 2/3 1/3 2/3 = 56% | -11, one fight: noise |

## EXAMS A THROW EASES OR TRIVIALISES (tools/knock-into-exams.mjs, report only, no edits)

| Level | What a throw does to the exam |
|---|---|
| **towpath** | **The LAST LOCK spike exam [268,301] is TRIVIAL**: both its common foes stand within a heavy throw of the irons. Its elite gaffer is beside the water: **EASED** (25% a throw). |
| **canal** | The elite gaffer beside the water: **EASED**. The canal already put an elite back at his post. |
| **spire** | The nest-stair thorn pit [38,40]: 3 of its 10 foes can be thrown in. |
| **fair** | The LAST ROUND spike yard: 1 of 5. |

- **No elite exam is trivialised any more.** Before this lane, a heavy throw into the spikes KILLED an elite. Now it never does.
- **Caveat:** the lister walks each foe's floor row from the built data, so it is approximate on moving platforms and in rooms built at runtime.

## ART FOR A SONNET LANE
1. **THORNED spines per elite body** (husk, thorn, shield, hearthgob, troll, brute, scarecrow, armour): rise keyframes (0 / 1 / 2 / full) and a fire frame. Today they are pixel lines from `drawSpines`.
2. **The Spike Goblin's bristle:** 3 frames of his back plate's spikes rising (`e.brK`). Today it is 4 iron pixel spikes over chars.js bakeThornback.
3. **The spitter's sidestep hop** (2 frames, `e.ssT` / `e.ssLift`) and an **OFF BALANCE wobble pose**.
4. **Thrown-foe tumble** for small foes in flight (`e.kiT`, `e.knock`), and a **slide pose with the guard up** (`e.kvy === 0` while thrown).
5. **Hazard entry FX per kind:** a spike impale burst, a fire catch, a mire splash, the press pin, and a lava sizzle once the data lands.
6. **Poses for reactions a, b and d** come with the order-knight bodies (scratch/brief-elite-order.md).

**Also the SONNET DATA PASS, per act:** `L.knockHazards` rows for hazards the shared tables don't hold. Examples: the Deep Rails' lava (`decor kind 'lava'` 615-624), and any vat, acid or kiln a level draws itself.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **An elite thrown into a killing hazard:**
   - Rec: **never a kill. He takes 25% and is put back at his post** (built), so a section exam stays a fight.
   - Alternative: kill him, as the code did before this lane.
2. **The sun as a hazard to a foe:**
   - Rec: **none**; the desert's men live in it (built).
   - Alternative: a thrown foe that lands out of shade is 'SUNSTRUCK' for 0.6 s with no damage.
3. **Towpath's LAST LOCK exam is trivial to a heavy throw.**
   - Rec: leave it. Using the irons is the point of knock-into.
   - Alternative: the towpath lane swaps one foe for a brute or a shield, which only steps or slides.
4. **A guard that holds versus one that breaks.**
   - Rec: **a heavy that does not break the guard makes it slide; one that breaks it throws** (built).
5. **The spitter still hurts on touch** (TOUCH_ALWAYS), though it isn't spiked.
   - Rec: drop it from TOUCH_ALWAYS in a small follow-up. Not done here: it is outside this brief, and touch audits read it.
6. **The urchin, jelly, grub, marshlight and wisp** (the audit's other 'e' kinds) are unchanged.
   - Rec: a Sonnet pass gives each one a drawn bristle or flare state, and limits its touch damage to that state, as the Spike Goblin's is now.
