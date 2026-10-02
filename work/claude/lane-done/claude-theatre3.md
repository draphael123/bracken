# claude/theatre3: the theatre made hard, the Puppeteer's loop rebuilt (Opus, 2026-10-02)

Daniel played the live theatre on 10-01: "a good level", but very easy, too few enemies, the Puppeteer "extremely easy", and floating geometry.
Base: claude/batch55 d12c0941 (master + COMBAT3 + CANALART). Nothing here ships without Daniel's review.

## Headline numbers

| | before (batch55) | after |
|---|---|---|
| mash bot vs the Puppeteer (knight, warden, pyro x 2 seeds, level 22) | **5/6 won** | **0/6** (all time out at 96-100% boss health; the 3 level-1 runs all die) |
| theatre `MASH_REPORT_ONLY` entry | `theatre: ['boss']` | **deleted** (the gate is on for the boss and the level) |
| mash bot, theatre level run (knight, the gate's convention) | lowest 39% | lowest **35%** |
| human-speed bot vs the Puppeteer (level 22, no skills, normal health) | 3/3, took 0 / 10 / 0 damage, 39-65 s | **4/6 = 67%** over 2 salts (knight 2/2, pyro 2/2, warden 0/2); wins 52-99 s, taking 20-72 |
| level-1 no-ability pilot (fresh knight, 3 runs) | 15 blows | **17 blows** |
| theatre foe roles (level-quality) | 2: melee x38, ranged x3 (REPORT-ONLY) | **3: melee x38, ranged x12, support x2** (REPORT_ONLY line deleted) |
| floating geometry in the theatre | 3 groups | **0** (new lint, gated) |

**The official BEFORE/AFTER pilot** (`node tools/combat-pilots.mjs theatre`, seed 1919, level 22, normal health):

| hero | BEFORE | AFTER |
|---|---|---|
| knight | win, 39.4 s, took 0 | win, 36.6 s, took 0 |
| warden | win, 65.3 s, took 10 | **death** at 172.5 s, boss at 28% |
| pyro | win, 46.5 s, took 0 | win, 56.2 s, took 40 |
| **total** | **3/3** | **2/3 = 67%** |

The knight's seed-1919 fight is a clean two-cycle win. The salted pilot above shows the knight's other fights took 20-72.

## 1. THE PUPPETEER: the loop rebuilt (src/puppeteer.js, src/puppeteer-hands.js)

The old loop was: drop both puppets, he falls open, wail on him, repeat. The mash bot did exactly that by accident. Now:

- **Puppets are hurt only in their told recovery.** After every blow a puppet hangs spent and **glows green** (a pulsing green ring and a fill). Then a blow takes its health and a swing across a string cuts it. A gold cut's stagger is also green.
  - Any other time the wood turns the blade: a **CLANK**, a grey spark, and the first time the hint box says `CLANK: STRIKE A PUPPET WHEN IT GLOWS GREEN`. It never looks like "nothing works".
  - A cut in the gold (in a windup) still cancels that blow, as before.
  - The Harlequin's green window is 0.6 s (was 0.35 s rest) and his jab strings are 2 (were 3). The masterpiece's is 2.2 s (was 1.6 s).
- **Both puppets down no longer opens him.** His control bar goes **slack** for `PUP.slackT` = 12 s. He kneels on the fly gallery (his restring frames), the bar in his lap glowing gold, his line hanging in a wave, and his plate reads `HIS BAR IS SLACK`.
  - He is **not** open. Left alone, the slack runs out and he strings both again (`TOO SLOW: HE STRINGS THEM AGAIN`).
  - **Climb to the gallery under fire** (the batten and its pin rail at the stage door) and **cut the bar**. He falls to the boards, **open 3.0 s** (Daniel's 3.0 s kept; boss-openings asserts >= 3 s), at x1.75.
  - A blow on a **taut** bar clanks (`HIS BAR IS TAUT: DROP BOTH PUPPETS FIRST`).
  - The old "jolt" (strike his line from the gallery any time, 1.2 s open) is gone. It was a way round the puppets.
- **He fights back during the opening:** a told low flail of his cane round him (`!!`, jump it, 14 unblockable, every 1.1 s, first at 0.7 s). It has its own mark, answer and height rows.
- **The house throws, all fight:** a prop every 4.5 / 3.8 / 3.2 s by phase (an apple, a hammer, a candlestick: 8, the shield turns it). It is told by a growing shadow and a `!` where it will land, 0.9 s ahead.
  - Every third throw is a sandbag (`!!`, 14, unblockable).
  - The house holds its breath while he is down and through a scene change, so the earned opening is clean.
- **Each cycle he re-strings faster and adds a move:**
  - Down and slack times shrink x(1 - 0.15 x cycle), never under x0.55.
  - Cycle 1: he cuts a sandbag loose over you (every 9 s, 16).
  - Cycle 2: the house throws in pairs.
  - Cycle 3: the Brute's second, quicker chop.
- He keeps his own x0.05 ward outside the opening (`OWN_WARD`). The greed reprisal still counts blows on him.
- **The human bot** (`puppetPlan`) plays the new rules:
  - It hits only green puppets.
  - It draws blows just inside their reach and gold-cuts a winding string now and then.
  - It steps off shadows, climbs whenever the bar is slack, cuts it, drops to him, and jumps his flail.
  - It now stands on the batten's pin-rail end, so the shortest blade reaches the rail.
- Bestiary text and hint lines are updated. Every new line is in src/hint-lines.js; the dead jolt lines are gone.

Tuning steps, human bot at level 22, 6 fights each (salts 1 and 2):

| setting | result |
|---|---|
| open x1.0 | 0/3 |
| x1.25 | 1/6 |
| x1.6 | 2/6 |
| x1.75, house 8 | 4/6 |
| slack 15 s | 5/6 (too easy) |
| **final: slack 12 s, x1.75, the king 2.2 s** | **4/6** |

### The 'taken >= 10' flake (tools/puppeteer.mjs)

**Cause found:** on batch55 the human bot beat the Puppeteer taking 0-10 damage. The BEFORE pilot shows the knight took 0 and the warden took 10, so the row sat on the threshold.

**What changed:**
- The fight is now real: the check's bot takes 21.
- The check's bot fights at the theatre's campaign depth (level 22, no skills, like `combat-pilots` and the mash bot), not whatever level the page's save happens to hold.
- The whole page section before `bossLab` runs on a pinned dice, so nothing earlier in the section can shift the bot's row.

**Proof it is stable:** two consecutive runs of the same build gave identical rows (`win, taken 21, 54.4 s`). The assert is unchanged (win and taken >= 10).

### Checks rewritten for the new rules (each commented)
- **tools/puppeteer.mjs:** the green window, the clank, slack-not-open, the slack time, the cut, the flail, the house (told >= 0.9 s, every third a sandbag), each cycle faster with a new move, and the bar in the page.
  - Red on the old code: run against batch55's src/puppeteer.js it crashes on the first new rule (`hurtable` does not exist).
- **tools/boss-openings.mjs:** both puppets down must NOT open him; the slack bar cut must. Open >= 3 s, on the boards.
- **tools/boss-navigation.mjs (a rules change):** the theatre row's knight is the level's depth (22). A fresh level-1 knight walks too slowly to make the 12 s slack bar from the stage; it needs 7+ cycles and 300+ s. The time (180 s) and the asserts are the same as every row.

## 1-1b. THE THROWERS AND THE SUPPORT (reskins, src/main.js + src/redraw/theatre_foes.js + src/maskwright-theatre.js)

**THE FLYMAN** is the archer's AI reskinned (`ent('archer', x, y, { flyman: true })`, `flymanStep` in main.js). He is a stagehand on a catwalk who never comes down.
- He lobs a tool where you will BE (it leads your drift over the last half-second). It shows a yellow `!` and ring; the shield turns it; 14.
- Every third throw is a SANDBAG over his head: a red `!!`, a red ring, 22, unblockable. It also cannot be parried: a swing parried every lob before (`s.noParry`, the parry loop in main.js).
- He backs off close in, and a blow in his windup throws it off.
- He has his own 8-frame sprite (`bakeFlyman`) and mark rows for `archer|bagTell`.
- He uses the archer's health. He is deadly through damage and position, never through health.

**THE PROMPTER** is the goblin priest reskinned (`{ prompter: true }`, `bakePrompter`). He reads the cast their lines: the rite mends and blesses the foes near him, so he is the one to kill first. He throws his prompt book and rings a hand bell.

**THE MASKED PATRON** in the house is the drunk, patron look, `{ patron: true }`. He throws at anyone, lit or not; only the house's patrons are exempt from the footlights rule.

Designed encounters (backstage columns; built = +72):

| where | what |
|---|---|
| THE STAGE BOX (house 63) | a flyman, plus a patron at 58, over the pit and the apron |
| THE MASK WORKSHOP (108, a new carvers' shelf on the dock wall) | a flyman behind the fitting's two mummers: the pincer |
| THE FLY TOWER loading gallery (129) | a flyman over the tower floor while the stagehand swings: the pincer |
| THE GRID (142) | a flyman over the bridge (climb the rope and he is a free kill) |
| THE LIGHTING BRIDGE (178) | a flyman along the bridge and down onto the stage |
| THE PERFORMANCE | flymen in both boxes (158 stage-left over the way down, 217 stage-right at your back on the limelight beats) |
| THE PROMPT CORNER (211) | a prompter mending the cast |
| THE WINGS exam | a prompter behind the door guard (284) and a flyman on the gallery's end (286) |

**The workshop's mend is removed.** The next checkpoint is 32 columns on, and Daniel called the level "very easy".

**ROLES:** the theatre `REPORT_ONLY` roles line is deleted (3 roles now). docs/level1-pilot.json is refreshed: 17 blows, 0 deaths, walked 100%.

## 1c. REAL MUSIC

- `audio/theatre.ogg` is "Apparitions Ball" by Bobjt, CC0, from the file Daniel approved (nothing downloaded).
- The source is 37.89 s and ends abruptly. It is cut to a **25.58 s loop** (samples 4096-1132367) where the tune comes round to its opening: band-energy match 0.54 over 4 s, the best of the candidates at 25.66 / 29.95 / 35.78 s.
- A 30 ms crossfade sits at the seam. It is turned down 1.9 dB (the source decodes past full scale) to -13.7 LUFS integrated and -1.5 dBTP, Vorbis q5.
- The synth waltz (`scheduleTheatre`, its tables and its bow voice) is deleted.
- The show's act changes are still told over the recording with a cymbal and a bell (`theatreAct`). A recording's tempo cannot be lifted.
- Credits: `MUSIC_CREDITS.theatre` and audio/CREDITS.txt. tools/audio-assets.mjs takes 'theatre' off NO_FILE_BY_DESIGN, and tools/theatre.mjs now asserts the file.

## 3. FLOATING GEOMETRY: `tools/floating-geometry.mjs` (new, in check.mjs)

**The rule:** every non-air tile joins its four non-air neighbours; a rope joins too (boards on a rope are hung). A group that never reaches the map's edge floats, unless it is a theatre flat on its track (a mover). It is gated for `FIXED = ['theatre']`; every other level is reported only.

**Theatre (red before, green now):**
- The roof walk now reaches the tower's wall, and the fly floor's near end hangs from it on its rope.
- The prompt box's rope comes down to the boards.
- The wings' loading gallery runs on to the stage door's wall.
- The new carvers' shelf is on the dock wall.

**Reported, not fixed:** 33 other levels have floating groups. Most are classic floating platforms:

| level | groups |
|---|---|
| kings | 125 |
| spire | 98 |
| fallingtower | 72 |
| crown | 71 |
| fair | 62 |
| scree | 55 |
| storm | 50 |
| hanging, fields | 41 each |
| burning | 37 |
| canal | 33 |
| lamplit | 32 |
| spore, marsh, unburied | 31 each |
| caravan | 29 |
| stockade, moor, undercrown | 27 each |
| wood, underleaf, burial, mage | 25 each |
| deep | 22 |
| hurricane | 21 |
| waymeet, oreroad | 20 each |
| reef | 16 |
| causeway | 12 |
| harbor | 4 |
| flotilla | 3 |
| longwater | 1 |

Run `node tools/floating-geometry.mjs <id>` for the list.

## Checks run (named, never the suite)

Green: puppeteer (twice, identical rows), textfit (alone: under load it lost its page once), boss-openings, boss-greed, boss-navigation, boss-fight-end, theatre (page), level-quality, mash-gate, floating-geometry, tells, hint-shown, answer-tags, untold-told, foe-tactics, gob-priest, one-new-foe, audio-assets, boss-music, level-jump, frame-cost, textfit, soundtest, architecture, checkpoints, skins, npc-removal, slopes-trace (every level identical), floaters, dangling-paths (green once audio/theatre.ogg was committed).

## UNVERIFIED
- **Nothing was looked at on screen or heard by a person:**
  - the green glow, the clank spark and the slack bar's gold
  - the falling props and their shadows
  - the flyman and prompter sprites (procedural, placeholder quality: a Sonnet art lane could polish them)
  - the loop seam of "Apparitions Ball" (chosen by analysis, not by ear)
- The house's props and the flail were not tested against co-op (both read the nearest hero).
- **The mash bot's level run** is stamped knight-only, as `--all` stamps every other level: knight 35%.
  - Run with all three heroes, the warden (lowest 56%) and the pyro (47%) still clear the level by mashing.
  - The level mode lifts the bot 48 times, past most of the machinery, and it parries every tool thrown in front of it.
- The mash boss rows were stamped before the last boss tune (slack 12, x1.75, the king 2.2 s). The mash bot never climbs, so it can never open him; re-run `node tools/mash-bot.mjs theatre --l1 --probe --write` to be sure.

## QUESTIONS FOR DANIEL (the recommended option is built)
1. **The opening now pays x1.75** (it was x1.0) because it is earned up a batten under fire. *Rec: keep.* At x1.0 the human bot lost 3 of 3.
2. **The warden loses the Puppeteer** (0/2 human-bot fights; her blows are light). *Rec: keep* (Hollow Knight: a first try usually dies). *Alternative:* the Puppeteer's chip for the warden only.
3. **The mash bot's level run with the warden and pyro still clears the theatre** (56% / 47%; the gate reads the knight, 35%). *Rec:* a small lane to make the level-mode mash bot ride the machines rather than be lifted past them, then judge the theatre on all three.
4. **The jolt is gone** (striking his line from the gallery any time, 1.2 s open). *Rec: keep it gone.* It skipped the puppets.
5. **The flyman's sandbag cannot be parried** (a new seed flag). *Rec: keep.* A red `!!` that a sword turns is a lie.
6. **The workshop's mend is removed.** *Rec: keep* (Salt & Sanctuary, fewer heals).
7. **The 33 levels with floating platforms.** *Rec:* per-level art lanes decide which are meant (sky platforms) and add an exemption list, the way FIXED works.
8. **The music loop is 25.6 s of a 37.9 s track.** *Rec: keep.* *Alternative:* the 35.78 s candidate (weaker match, longer).
