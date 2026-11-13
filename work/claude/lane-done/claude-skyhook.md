# SKYHOOK lane report (claude/skyhook, 11-05) - THE HIGH LINES' boss, greybox
Branch `claude/skyhook` (worktree bracken-skyhook), off `claude/highlines1` 31e372e15. Code tip fe98648b5 (+ this report commit).
POST-DEMO and CODE-ONLY: no browser opened, no Chrome started, no PIDs left. NOT merged, NOT deployed. The level stays dev-only (`?level=highlines`).
Accepted highlines1's 5 recs: Hookjack is a human rigger, the cutter cuts once, exam misses are long falls, no winches in wind boxes outside the exam, the arena stub (shrunk to 32 x 18).

## What he is
**SKYHOOK, MASTER OF THE HEAD STATION.** A human rigger, the line crews' captain (the Hookjacks are his crew), in a long tarred coat and a red knitted cap, with an iron boat-hook on a chain.
The cave mouth is the ropeway's **head station**, where the Ore Road runs into the mountain. That is the castle's supply line, and he guards it.
He works his own **HIGH LINE** across the station on a crank trolley, between two **galleries**. There are no goblins and no kite (a kite does not fit in a cave; the plan's kite and wind clutch were dropped).

## Files
- `src/skyhook.js` (new, pure): the SH numbers table, the 2 phases, every move, takeBlow (B15), leverStruck, and the bot's plan (skyPlan).
- `src/skyhook-hands.js` (new): binds the fight to main.js and to the line kit's lines (it cuts HL/SW/SE through `lineCut`). It also does the greybox drawing (a pose per mode, plus the overlay), the hooks in flight, and the two levers as props.
- `src/highlines.js`: THE HEAD STATION replaces the stub.
  - Cols 8-39, floor row 48 (32 x 18). The floor is solid rock, so you cannot drop out of the fight. Cols 1-6 stay a deck: the way up from the steps.
  - A rock arch at cols 7 and 40 runs rows 30-41; the walls close rows 42-47 under it.
  - Two gallery decks (landings 35 and 36).
  - Three line-kit lines: **HL** (his high line, a glide west that players may ride too), and **SW** / **SE** (grip winches from the floor up to each gallery). All three are `cut: true`, with the floor catching the fall.
  - The `skyhook` ent and the arena object (perches, levers, line ends, winch ids, swing anchor; music `masthead`, CC0 and unused).
- `src/main.js`: 13 one-line hooks tagged `claude/skyhook`: import, EHP, clear, the spawn case (boss + levers), the hurtEnemy0 lever route, take, the death case, update, draw, drawOver, barName, BK accessors, and construction.
- `src/lab.js`: the `skyhook` bossLab branch (skyPlan), plus the labRest exclusion.
- Registry rows:
  - `src/boss-greed.js`: skyOpen, OWN_WARD.
  - `src/boss-read.js`: RIGGER'S COAT.
  - `src/marks.js`: BY_HAND, ANSWER, HEIGHT; the MARK table was rewritten by `tells.mjs --write`, and the only additions are the 10 skyhook rows.
  - `src/hint-lines.js`: SKY_SAY.
- `tools/skyhook.mjs` (new, node, 173 checks, 0.3 s). `tools/check.mjs` gains `take('skyhook')`. `tools/highlines.mjs` now checks the real arena instead of the stub (arch, rock floor, his ent).

## Moveset by phase (placeholder HP 1100, the Roc's neighbour; a tune lane sets the band)
**Damage taken:**
- **Coat:** x0.5 outside openings, told by a clank and "RIGGER'S COAT".
- **Ward:** x0.4.
- He is never invulnerable: every mode was checked at 40 or more out of 100.

**Opening 1, DOWN (the level's verb):**
- He rides HL; the levers glow amber.
- While he is over the **middle third** of the line (red rag markers on the rope; the levers blink gold), strike either **tension lever** on the floor (any blow, any shot) and **THE LINE SLIPS**.
- He falls **44 px from the lever that slipped it** (the slack end swings him down), so the striker is beside him.
- DOWN lasts 3.6 / 3.0 s. Blows land x2, up to a purse of 20% of his health.
- Then he RISES: a yellow `!`, a white ring, a 6-damage push. After that come a 2.5 s ward and a grapple back up.
- A lever struck off the line, or on it but not yet over the middle, only clanks, and the game says why once.

**Opening 2, JARRED:**
- Step out of his drop's set ring and he lands on nothing.
- JARRED lasts 1.2 / 1.0 s at x1.5, with a purse of 8%.

| move | phase | mark | tell (P1/P2) | answer | dmg |
|---|---|---|---|---|---|
| RIDE (hook on, cross the high line) | both | none (the levers glow) | 0.6 / 0.5 | the lever, over the middle; riders on HL in his way are knocked off | 10 (trolley) |
| HOOK (thrown on its chain from a gallery; aim line amber, then red) | both | ! | 0.75 / 0.65 | block / parry, roll, jump; it pulls you in | 12 |
| LEVER HOOK (riding, at whoever waits within 64 px of a lever) | both | ! over the lever | 0.7 / 0.6 | answer it, then strike the lever when the window opens (it lands first) | 12 |
| DROP (stops on the line over you; the ring follows, then SETS) | both | !! | 0.95 / 0.85 (lock 0.55 / 0.45) | step out (a whiff gives JARRED) or jump; a lever slips him mid-drop | 20 |
| SWEEP (on the floor after a landed drop) | both | !! | 0.75 / 0.65 | jump | 15 |
| SHOVE (a hero beside him on his gallery) | both | ! | 0.6 | block, or get off | 12 |
| HE DRAWS HIS CUTTER (phase change, warded) | 50% | none | 1.4 | - | - |
| HE CUTS YOUR LINE (the winch under his gallery while you haul up it; fray bar) | P2 | !! | 1.4 | top out first (a race), kick off, or drop; no damage | 0 |
| LOW SWING (the hanging rope, gallery to gallery; red arc) | P2 | !! | 0.9 | jump him at the bottom (his top 38 px, a jump clears 51), roll, or stand near a wall | 18 |

**How melee and ranged get at him:**
- Melee heroes climb a winch to his gallery to chip him, and get him on the floor (DOWN, JARRED, landed, climbing).
- Ranged heroes chip him anywhere and work the levers from range.
- Co-op: the nearest seat is his target, each blow is keyed once per hero per move, any seat's lever works, and the purse is shared.

## Checks (node only, one at a time)
- `node tools/skyhook.mjs`: **173 OK.** It covers:
  - B15 in every mode.
  - DOWN and JARRED in both phases; the clank off the line and outside the window.
  - Tells before hits: 18 runs (P1/P2 x 1/2/4 seats x 3 seeds). Every blow lands at least 0.5 s after its own tell.
  - No soft-lock: 6 runs of 400 s. No mode lasts 9 s, at least 20 rides per run, and the longest gap between rides is under 20 s.
  - The P2-only moves, the cut race, the lever hook landing before the window opens, the shove.
  - Every hero: on the floor in the open modes; the levers stand on rock; the swing clears under a jump; the ring can be left in its lock time.
  - A full plan-driven fight per hero (all 9 on master, melee and ranged) brings him down in 47-60 s with a crude body and infinite hp. This is **not** a win rate.
  - Co-op 1-4 seats.
  - Reset: the kit's lineRespawn, the hands' end and clear, spawnBoss again with his levers.
  - B16 pictures, lines routed, and the greybox drawn against a stub canvas without throwing.
  - Arena geometry.
- `node tools/highlines.mjs` (full): **1899 OK** (60 s). It includes the 12-row sweep with the arena lines, no soft-lock, and 876 drops landing.
- `node tools/line-kit.mjs`: **648 OK.**
- `tells.mjs`: ok after `--write` (the only additions are skyhook rows). `boss-read`, `foe-glue`, `zoom-coverage`, `goblin-lint`, `one-new-foe`, `foe-footing highlines`, `foe-pass`, `checkpoint-gaps`, `anchor-lint highlines` (listed, not failed) and `dangling-paths`: all ok.
- **Pre-existing reds from highlines1, not mine:**
  - `answer-tags`: "hookjack: a common foe that harms you with no told blow".
  - `blow-tags`: `HLX.hookTake(e, dmg, fromX)` gets no blow tag. My `SKYH.take` now passes the tag.
  - `level-quality highlines`: misses `secrets` (known from that lane).
- NOT run: tools/check.mjs (the full suite).

## Browser owed
1. **boss-openings**, **boss-navigation**, **win-rate n=6** (`bossLab(BK, { bosses: ['highlines'] })` with flasks, mash 0/6, band 60-70%). The crude node fights are fast (about 50 s), so expect the tune lane to raise HP or narrow the lever window.
2. **Arena in the page**: the trigger at col 11 on the floor, the walls closing under the arch, the camera lock, `masthead` music, and the gate after the kill.
3. **The levers as foe-list props** (needs a look):
   - aim-assist or lock-on choosing a lever over him;
   - a burn or bleed tick on a lever working it;
   - a stray HP bar or mark;
   - whether every hero's shot type actually reaches them.
4. **Fighting on lines**: whether a swing starts while hanging (highlines1's open item), riders knocked off by the trolley, hook and swing, and the cut dropping a rider onto the rock.

## Art owed (art before live)
- **Skyhook sheet** (about 20x34): perch, wake, hook-on, ride, hook draw and throw, drop tell and fall, landed, jarred, sweep tell and sweep, grapple tell and climb, slip, DOWN (on his back), rise, shove tell and shove, cutter phase tell, cut tell and cut, swing tell and swing, beaten.
- **His trolley and his hook and chain.**
- **The two tension levers**: drum, pawl, a lever with three states.
- **The head station**: arch rock, iron gallery decks, the swing rope, the red rag markers on HL, and the station backdrop.
- **Sounds**: trolley ratchet, hook whistle and chain, slip crack, drop slam, cutter rasp, swing whoosh. Fallbacks are used now.
- Integ when it goes live: EHP tuned, a bestiary card plus `beastSeen('skyhook')` (not called yet), a bossStart roar row, the BOSS_PHASE music swap, the boss rush row, and the threat.js row.

## Questions for Daniel (recommended answer first; the lane built the rec)
1. **The opening:** REC strike a floor lever while he rides over the middle third, which slips his line and drops him beside you. It works for every hero. ALT: the plan's "clutch in a gust". That needs wind in the arena, which your accepted answer #4 rules out beside winches.
2. **His title:** REC "SKYHOOK, MASTER OF THE HEAD STATION". ALT: keep the plan's "CAPTAIN OF THE KITE-WATCH" and give him a kite outside the cave mouth (a bigger arena rework).
3. **Phase two:** REC the cutter (he cuts the winch you climb) plus the low swing. ALT: he cuts his own high line into a pendulum that he swings on for the whole of phase two (more spectacle, more engine work).
4. **Beaten:** REC he goes down on the station rock and the high line hangs still ("THE LINE GOES QUIET"), and the Ore Road opens through the gate. ALT: he survives and flees down the ore chute, for a cameo on the Ore Road.
5. **Music:** REC `masthead.ogg` ("Slay The Evil", CC0, already in the repo, unused). ALT: pick a new CC0 track (downloaded only on your yes).
