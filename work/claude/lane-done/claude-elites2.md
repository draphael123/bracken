# ELITES2 (claude/elites2) - every elite its own two moves, theme affixes, the poise opening

Base: master 85e13368 (batch71). Master had not moved at report time.

## What changed

### Moves (src/main.js, the elite block)
- **The shared rules are retired.** These were rally, wall, call, slam and lunge (updateEliteRule is deleted).
- **Every kind has its own two moves** in `updateElite<Kind>`, with one dispatch line per kind.
  - Each move is told: its mark, plus the JUMP/DUCK lane from HEIGHT.
  - One windup at a time.
  - Most moves end in a told recovery (`ekXOpen`), which is the small opening.
- Mode names follow `ekXTell` / `ekX` / `ekXOpen`.
- Thrown things fly inside the move (`e.shot`). Marked floor patches use `e.vol`, drawn red. This keeps every blow visible to tools/tells.mjs.

| kind | name | move 1 (answer) | move 2 (answer) |
|---|---|---|---|
| cutthroat | THE FIRST KNIFE | feint-cut: stamp, then the real cut (block the second) | thrown knife, chest height (block or duck) |
| scorpion | THE OLD STINGER | burrow: dust runs under the sand, bursts up (dodge) | tail sweep, both sides low (jump) |
| gaffer | THE DECK FOREMAN | pole hook, pulls you in (block) | haft spin (jump) |
| heavy | THE KING'S CHAMPION | leap onto your marked floor (dodge) | great cut (block) |
| hedgeknight | HEDGE KNIGHT CHAMPION | joust, a run with the lance (block; into a wall he is stunned) | briar cut at chest height (duck) |
| boarder | THE BOARDING MASTER | grapnel, hauls you in (block) | boarding leap onto your mark (dodge) |
| cutlass | THE FIRST MATE | lunge (block) | pistol, level (duck) |
| tideguard | THE TIDE CAPTAIN | spear step-thrust (block) | tide wave along the floor both ways (jump) |
| watch | THE WATCH SERJEANT | halberd chop (dodge) | double thrust (block x2) |
| hearthgob | THE HEARTH BOSS | boiling pot on your mark, scald patch (dodge) | cleaver (block) |
| thorn | THE IRONBACK | spiked roll (jump) | spine flicked at you (block) |
| goat | THE HERD BILLY | butt, throws you far (block) | stamp shock (jump) |
| scarecrow | THE TALL MAN | reap at the ankle (jump) | crow at your face (block or duck) |
| husk | THE GRAVE CAPTAIN | grave grasp on your mark, holds you (dodge) | claw lurch (block) |
| armour | THE WARDEN ARMOUR | whirl toward you (dodge) | gauntlet thrown (block) |
| apprentice | THE HEAD NOVICE | rune on your mark (dodge) | bolt (block) |
| hopper | THE OLD BULLFROG (placed nowhere) | belly-flop on your mark (dodge) | tongue pull (block) |
| pike | THE PIKE SERJEANT | (kept) sweep | NEW: long thrust (block) |
| troll | THE CRAG TROLL | (kept) slam | NEW: rockfall on your mark (dodge) |
| archer, shield, brute | - | kept | kept |

Notes on the table:
- The barker, the hobby-horse and the drowned captain keep the moves of their own modules (`mod: true`).
- Every elite also has the **riposte**: a told yellow `!` cut that answers a mash.
- A THORNED elite answers a mash with **the thorns** instead: a told red `!!` burst.
- A SUMMONER elite has **the call**: told, no mark.
- src/marks.js gets 43 new ANSWER and HEIGHT rows, and the MARK table is rewritten by `tools/tells.mjs --write`.
- answer-tags: every level now asks for three answers or more. Caravan, redgorge and underwell used to ask for 2.

### Affixes, guard, opening, escalation (src/elite-kit.js, new)
- **Affixes.** There is one hand-picked affix per placed elite and per ambush captain, in `AFFIX_AT`.
  - The key is level|kind, level|kind#n for the nth of a kind, or level|kind#amb for an ambush captain.
  - A level ent's own `affix` wins over the table.
  - The eight affixes are BURNING, VENOMOUS, SHIELDED, SWIFT, SUMMONER, UNSTOPPABLE, THORNED and WARDING.
  - What fits where: `AFFIX_FIT` by act, plus `LEVEL_FIT` (burning village and the crown kitchen may burn; the marsh and the sporewood may poison). There is no SUMMONER in an ambush room.
  - The affix name appears under the plate, with a coloured pip by the crown.
- **Guard by angle (B11), in hurtEnemy0, so every blade path meets it.**
  - Standing about, or telling a move, his front is guarded. It is drawn as a steel edge.
  - A light cut off his front is turned: clank, COVERED, and GUARDED over the plate.
  - A held heavy goes through at half.
  - A sweep, a plunge, a hit from behind, or a hit during the blow or recovery of his own move lands whole.
  - His guard turns to you after 0.35 s.
  - SHIELDED is guarded through his moves as well, and says GO ROUND.
- **The opening.** His poise fills only from a held heavy, a riposte, a dash attack or the right tool.
  - When it breaks he is OPEN for 3.0 s: a gold ring, a gold timer under the plate, and the first blow is a RIPOSTE (x1.35 on top of broken x1.5).
- **The escalation.** Once, at half health, he is ROUSED. This is told with a red ring, a roar and a word.
  - His moves come round x0.7 sooner.
  - His affix intensifies: faster fire, longer venom, a second call, a wider ward, spines after 2 cuts, shorter swift tells.
- **Other main.js rules:**
  - An elite is not a step: a stomp on his head is shrugged off.
  - Only a heavy blow throws him.
  - The warden's point stops his charge but does not break him.
  - Pulls stay on the floor.
  - Decks and planks count as footing.
  - His move may cut in on a windup of his kind's own that has only just begun. Without this, the first mate and the deck foreman never got a move in.
  - Attack tokens skip an elite while he is in his own move.
  - Elite damage is x1.25 (`EL.dmg`).
  - An ambush captain keeps the old x3 health at most (`EL.ambCap`).

### Tools
- **tools/elite-lab.mjs** (new, by hand) drives `src/lab.js eliteLab`.
  - Each kind is fought at its first placement, at the level's hero level.
  - Heroes: knight, warden, pyro.
  - Two bots: the mash bot (1 seed) and the human-speed bot (2 seeds).
  - `--write` stamps docs/elite-lab.json.
- **tools/elites.mjs** (in the suite) now also FAILS on:
  - a kind with no own dispatch line, or fewer than 2 moves;
  - a placed elite or ambush captain with no affix, or one that does not fit its level;
  - the opening or escalation not being wired;
  - a mash-bot win in docs/elite-lab.json.
  - `LAB_REPORT_ONLY` (may only shrink): drownedcaptain and barker.
- **tools/ambush-single.mjs**: the assertion that captains use the shared lunge/slam alternation became "every ambush-leader kind has its own updateElite dispatch". See Q2.

## Numbers (docs/elite-lab.json; mash x3, human x6 per kind)

| kind | level | affix | hp mult before -> after | mash wins | human wins | human secs |
|---|---|---|---|---|---|---|
| shield | wood | WARDING | 3 -> 6.3 | 0/3 | 6/6 | 37 |
| thorn | marsh | THORNED | 4 -> 6.8 | 0/3 | 3/6 | 20 |
| brute | stockade | SUMMONER | 2.5 -> 8.5 | 0/3 | 6/6 | 35 |
| troll | scree | UNSTOPPABLE | 3 -> 6.2 | 0/3 | 6/6 | 38 |
| goat | spire | SUMMONER | 5 -> 14.2 | 0/3 | 4/6 | 31 |
| pike | storm | SHIELDED | 3 -> 20 | 0/3 | 5/6 | 28 |
| heavy | crown | UNSTOPPABLE | 1.5 -> 2.3 | 0/3 | 6/6 | 36 |
| hearthgob | crown | BURNING | 4 -> 13.5 | 0/3 | 6/6 | 23 |
| tideguard | longwater | SHIELDED | 2.2 -> 7.5 | 0/3 | 6/6 | 20 |
| boarder | flotilla | SWIFT | 3 -> 10 | 0/3 | 6/6 | 28 |
| cutlass | hurricane | SWIFT | 3 -> 3 | 0/3 | 4/6 | 12 |
| watch | lamplit | WARDING | 1.8 -> 6 | 0/3 | 6/6 | 22 |
| hedgeknight | waymeet | SHIELDED | 1.6 -> 5.5 | 0/3 | 6/6 | 29 |
| scarecrow | fields | SUMMONER | 3 -> 10 | 0/3 | 5/6 | 20 |
| husk | burial | VENOMOUS | 3 -> 4.7 | 0/3 | 4/6 | 40 |
| armour | mage | WARDING | 3 -> 6.6 | 0/3 | 6/6 | 26 |
| cutthroat | caravan | SWIFT | 2.2 -> 7.4 | 0/3 | 6/6 | 31 |
| hobbyhorse | fair | SWIFT | 1 -> 9 | 0/3 | 3/6 | 32 |
| gaffer | canal | UNSTOPPABLE | 2 -> 6.5 | 0/3 | 6/6 | 21 |
| scorpion | welltown | VENOMOUS | 2.5 -> 11 | 0/3 | 4/6 | 25 |
| archer | stockade (spawned) | SWIFT | 17 -> 8 | 0/3 | 2/6 | 41 |
| apprentice | fallingtower (spawned) | WARDING | 3 -> 10 | 0/3 | 4/6 | 34 |
| drownedcaptain | keep | SHIELDED | 1 -> 4 | 2/3 (report-only) | 0/6 | - |
| barker | fair | WARDING | 1 -> 5 | 1/3 (report-only) | 2/6 | 42 |

How the health was set:
- At x2 the human bot killed most elites in **3-13 s**, because the hero is at the level's depth level.
- I re-measured per kind (as the brief says) toward about 28 s. Most fights are now 20-40 s.
- The mash bot loses to every kind except the two report-only ones.

The human-bot rate is not in the 75-85% band for most kinds:
- 13 kinds are at 100%: too easy.
- 7 kinds are at 33-67%: too hard.
- Pike is at 83%.

The levers are the per-kind `hp` and `EL.dmg`, and every change needs a re-measure (about 1 h per full pass on this PC). I stopped once mash was 0.

## Checks (all green, run named)
- elites (new rows)
- tells
- answer-tags
- combat-part2
- curve-gate
- mash-gate
- hint-shown
- corpses
- skins
- ambush-single
- ambush-listed
- attack-tokens
- untold-told
- architecture
- dangling-paths

### Curve and mash rows
- **Curve-gate** is unchanged: no level data changed, and nothing was re-stamped.
- **Level-1 curve sample** (`--curve --runs=1`, measured and then the file restored):

  | level | before (lost% / deaths) | now (lost% / deaths) |
  |---|---|---|
  | wood | 86 / 0 | 88 / 0 |
  | stockade | 116 / 1 | 120 / 1 |
  | caravan | 198 / 3 | 219 / 1 |

  All three are in band. The play pilot is lifted past elite gates (30+ lifts a run), so the curve hardly sees elites.
- **Mash rows:** none re-stamped. No level numbers changed, and the mash bot already fights an elite gate for 60 s, which elites only make harder.

## Reds / UNVERIFIED
- Nothing was seen on screen: the poses (generic lean, sink, curl, whirl), the shot sprites, the guard edge, the gold opening ring and timer, and the affix line and pip under the plate. Draw code exists; no screenshot was taken.
- The drowned captain and the barker: the lab bots cannot fight them the way a player would (see LAB_REPORT_ONLY).
- The ambush captains were not lab-measured. Their health is capped at the old x3.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. **Health went UP per kind, not down to x2.** At the level's hero level, x2 elites died in 3-13 s against the human bot.
   - Rec (built): per-kind health measured to 20-45 s fights, with the defence carrying the challenge (guard by angle, a weight-only opening, the riposte to a mash). The baseline `EL.hp` stays 2.
   - Alternative: keep x2 and accept 5-10 s fights.
2. **ambush-single's lunge/slam assertion was replaced.** It now asserts that every captain kind has its own moves. This is the brief's "retire the shared rules".
   - Rec: keep the new assertion.
3. **The human-bot band.** 13 kinds are at 100% and 7 at 33-67%.
   - Rec: a short tuning lane, `EL.dmg` per kind plus hp, about 2 h of CPU. Or your playtest first.
4. **LAB_REPORT_ONLY for drownedcaptain and barker.**
   - Rec: the KEEP/FAIR owners give their module moves a reason to engage at close range, or teach the lab bot to swim-fight and climb the crate.
5. **Affix picks.** All are in src/elite-kit.js AFFIX_AT; a few were judgement calls (spire goat SUMMONER, redgorge scorpion BURNING douses in the flood, keep captain SHIELDED).
   - Rec: play one per act and swap rows freely. tools/elites.mjs checks the fit.

No music this lane.
