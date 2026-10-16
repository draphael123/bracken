# claude/difficulty - DIFFICULTY CORE + ANTI-MASH (Opus lane, 10-16 overnight)

Branch `claude/difficulty`, cut from `origin/claude/batch96` (adfca0be). Port 8965. No full suite was run (one was already running); every check below was run alone.

## What's built

### Anti-mash inside openings (`src/anti-mash.js`, Daniel 10-15 ~12:55, all recs)
The hooks sit in the shared damage path (`main.js` hurtEnemy0 / addPoise), so they apply to every hero with no hero-specific branches.
1. **Stale blows.** Inside one opening (his told window, a riposte opening, or BROKEN), landing the same verb again pays x1 / 0.85 / 0.7 / 0.55, and 0.55 is the floor. A different verb resets the count, and so does a new opening.
   - The verbs come from riposte.js `verbOf`: cut, heavy, plunge, sweep, rise, dash, shot, riposte, skill.
   - A room's blow (a throw or a reflect) is never stale, and neither is a burn.
   - How the player reads it: a dull thud (`SFX.hitDull`) in place of the hurt cry and heavy ring, and 40% of the sparks. No floating word.
2. **Universal break bar.** `poiseMax` now gives every boss and mini a bar: 100 for a boss, 70 for a mini.
   - **Fill per hit inside an opening:** cut 3, shot 4, sweep 7, rise 7, dash 12, plunge 22, heavy 26, skill 28, riposte 32. A mini's bar fills a little faster.
   - **Fill outside an opening:** heavy, plunge, riposte and ability fill at x0.6. Cut, shot, sweep and rise add nothing outside an opening.
   - **Also feeding the bar:** the level-verb lean already in riposte.js (35), the hammer, the berserker's chop, MIGHT and the mix-up chain still add. The mode's `poise` multiplier scales the total.
   - **When the bar is full (BROKEN):**
     - He is broken for 3.2 s (boss) or 2.8 s (mini), lengthened by his damage % and multiplied by the mode's `open`.
     - Every hero blow lands x2 (the old poise break paid x1.5).
     - ONE FINISHER: the next heavy, ability, plunge or riposte (not the blow that broke him) lands a further x1.5, with a 0.16 s hitstop, shake, zoom and a FINISHER word.
   - The gold bar under his health now drains as the break's timer.
   - **Soft break:** bosses that were on the old `POISE_SKIP` list now get the bar, but their break does not stand them still; their own AI keeps running. They still get the x2 and the finisher. These are the puzzle and flying bosses, which the old bar left out on purpose; freezing them broke the Hedge Warden's stump state machine in boss-openings.
   - `BREAK_SKIP` (no bar at all): mother, kraken, krakenarm, undeadmage (the B15 exception), heart, gill.
3. **Varied hits refill abilities.** A landed blow on a boss or mini whose verb differs from the last one takes 0.25 s off every ability's wait.
4. **The lab bot rotates** (`src/lab.js`, v2 profiles, `prof.rotate=false` turns it off). Inside an opening, after two cuts, the bot's next attack press becomes a held HEAVY. It also winds a heavy when a finisher is waiting.
   - The knight lets go at his guard-break cut.
   - The pirate and reaper are excluded.
   - Rotation counts show in boss-run rows (`rot {...}`), and the anti-mash counts in `am {...}`.

### Difficulty modes (`src/difficulty.js`)
- **Modes:** story (VERY EASY), normal, master. NORMAL is the identity, so every existing tune and row holds.
- **One table, read through `DFM.df(key)`.** It sits on top of the old per-wood dial and the act pressure dial.

| key | Very Easy | Normal | Master | hook |
|---|---|---|---|---|
| take | 0.5 | 1 | 1.35 | damagePlayer0 (and the hazard % share) |
| stagger | 1.35 | 1 | 0.8 | hurtEnemy0 hitstun |
| poise | 1 | 1 | 0.75 | break bar fill |
| flinch | yes | yes | no flinch mid-swing from a light hit | small-foe flinch |
| parry | 1.4 | 1 | 0.8 | perfectWindow, the tap beat (warden / berserker / ranger api) |
| open | 1.35 | 1 | 0.8 | boss/mini clock x1/open while OPEN and not winding up; also break secs |
| gap | 1 | 1 | 1.15 | multiplies the act dial's idle-only gap |
| flaskAdd | +1 | 0 | -1 (min 1) | survival.js flaskMax |
| shrine | all | one | none | shrineFill |
| death | 0 (keep silver) | 1 | 1.5 (x bank stake, never above the bank) | deathCost |
| punish | - | - | yes | **Master punishes greed:** a flask drink, or a heavy that whiffs, in a boss's or mini's reach starts his told greed reprisal (`boss-greed.js punish`). |
| stale | shared | shared | [1, .8, .65, .5] | anti-mash |

- **Mode in force:** `?difficulty=easy|normal|master` (dev flag) wins over the save's `PROG.mode` (set in `progDefaults`), which wins over normal.
- **Master unlock:** device-wide (`localStorage bracken.masterUnlocked`). It is set when the final main-road boss (`CAMPAIGN_END`) dies on Normal, outside a rush or boss-jump.
- **`canSwitch` rules:**
  - Very Easy and Normal can switch either way at any time.
  - Master can be picked only at save creation, once unlocked.
  - A Master save can drop to Normal, never back.
- **Tools:** `--difficulty=easy|normal|master` on `tools/boss-rates.mjs`, `tools/mash-bot.mjs` (where `--write` only stamps Normal) and `tools/level-walk.mjs`. The default is normal.

### NOT built (left for the Sonnet / tune lanes)
- The picker UI at save creation, the Story <-> Normal menu switch, the Master badge, per-level Master clear marks and the Master weapon skin. The brief gives these to the Sonnet picker lane; `canSwitch` / `unlockMaster` / `PROG.mode` are ready for it.
- **Master group 3, per boss:**
  - COMBO TAILS (one extra told follow-up) need each boss's own code.
  - EARLIER PHASES: `phase: 0.1` is in the table, but each boss reads his own hp thresholds, so nothing reads it yet.
- Master phase 2 (an extra elite at section exams).

### Art list for a Sonnet pass (greybox now)
- The BROKEN state: today it is a gold bar draining under his health plus a ring; it needs a proper broken pose and a timer read.
- A finisher flash or impact frame.
- A stale-hit spark tint.
- A pose for Master's punish: today it uses the greed reprisal's `!!` and closing ring, not a per-boss windup pose (B16).
- The mode picker, the badge, the clear marks and the Master weapon skin.

## Rate shift
3 seeds, practiced, human profile, kit flasks, knight / warden / pyro (each cell is knight/warden/pyro wins):

| boss | before (batch96) | after, Normal | Master | Very Easy (2 seeds) |
|---|---|---|---|---|
| wood (Hornet Queen) | 2/3 2/3 2/3 = 67% | 2/3 1/3 2/3 = 56% | 0/9 = 0% | 83% |
| marsh (Bullfrog) | 3/3 2/3 3/3 = 89% | 3/3 3/3 3/3 = 100% | 0/3 2/3 1/3 = 33% | 100% |
| burning (Pyromancer) | 3/3 2/3 2/3 = 78% | 3/3 3/3 3/3 = 100% | 0/9 = 0% | 100% |
| spire (False Abbot) | 1/3 3/3 3/3 = 78% | 3/3 3/3 3/3 = 100% | 2/3 2/3 2/3 = 67% | 100% |
| overall | 78% | 89% (+11) | 25% | 96% |

- **The rotating bot is stronger on Normal.** The break bar (x2, a longer break, the finisher) pays more than stale cuts cost it. The weekend re-tune sweep should expect roughly +10 points on Normal. Before the rotation fix, a bot that did not rotate fell to 33% on the Pyromancer (pyro 0/3); that is the "rotate or rates drop" effect.
- **Mash bot:** 0/24 on the four bosses (arena, k/w/p x 2 seeds, boss left 71-100%). `mash-gate` is green.
- **Master is far below its 35-45% target**, with every hero at 0/N on the Queen and the Pyromancer. The Master tune lane must loosen it. Likely levers: `take`, `gap`, `open`, the flask -1 at low depth.
- **Very Easy is about 96%** against a ~90% target.

## Checks (all green on the final tree, run one at a time on port 8965)
- **New:** `anti-mash` (Node + page: stale table, bar on 47 bosses and 16 minis, finisher once, break pays more, varied refill) and `difficulty` (identity, every key hooked, Master keeps tells and the floor, picker rules, per-mode damage / flasks / shrines / opening length in the page).
- **Listed checks, all green:** mash-gate, boss-openings, boss-read, boss-fight-end, commitment, flip-actions, blow-tags, riposte, normal-health, damage-pct, damage-caps, combat-feel, finishers, attack-tokens, hero-trials, textfit, mobile-perf, plus boss-greed.
- **Flakes, not code:**
  - textfit's boss scope timed out once (481 s, while a suite was running) and passed on a rerun.
  - mobile-perf had one 2.8 s frame in redgorge once (machine load) and passed on a rerun.

### Test-expectation changes
- `tools/normal-health.mjs`: the WINNABLE row moved from the level-1 pyro to the warden on the same seed and boss (marsh).
  - With stale blows the pinned dice shift, and the pyro's 40 s win became a death.
  - The warden wins on both trees.
  - All assertions are unchanged; the row tests the health ledger.
- `tools/boss-greed.mjs`: `freeze()` also clears `b.stale`. No frame passes between its forced openings, so each one has to start fresh. The Puppeteer's "whole in his opening" blow read 27 of 40 because three forced openings had shared one stale count.

## Shared functions touched (for the batch merge)
- **`src/main.js`:**
  - Imports (AM, DFM), `perfectWindow`, the riposte `tap` api in two places plus `rpAnswerUp`.
  - `damagePlayer0` (the take line and the pct line), `shrineFill`, `deathCost`, `tryDrink`, `fireHeavy`.
  - `poiseMax`, `addPoise` (new `verb` param and boss branch), `rpBreak`, and new functions `bossBreakFill` / `bossBroken` / `antiMash` / `amFrame` / `punishGreed`.
  - In hurtEnemy0: the broken x1.5 line now has a bar-break x2, plus the `amV` verb, the `antiMash` call after `greedHit`, and the stale read in the hurt sound and sparks.
  - The small-foe flinch line.
  - updateEnemies: `amFrame` before `greedStep`, a soft-break branch on the BROKEN line, a mode `open` dt before `magechase` (non-Normal only), and the act-dial line.
  - `queenDies` (Master unlock), `progDefaults`, `BK.antiMash` / `BK.difficulty`, `BKT.shrineFill`.
- **`src/lab.js`:** the `bossLab` press / sim / step wrappers, new `rotateWanted` / `rotHold` / `ROT`, and the `ROWBOSS` line.
- **Other modules:**
  - `src/boss-greed.js`: new `punish`.
  - `src/survival.js`: `flaskMax`.
  - `src/riposte.js`: `drawPoiseBar` (broken branch).
  - `src/audio.js`: `hitDull`.
- **Tools:** `tools/boss-run.mjs` (`diffJs`, `am`, `rot`), `boss-rates.mjs`, `mash-bot.mjs`, `level-walk.mjs`.
- **Heropassa / paladin lanes:** none of their hero branches are touched. They will merge against `addPoise` / `hurtEnemy0` context lines only.

## QUESTIONS FOR DANIEL (my recommendation first; what I built)
1. **Soft break for puzzle and flying bosses.** These are the 50-odd on `POISE_SKIP`: Hornet Queen, Owl, Roc, Windcaller, King Gorm, the Pyromancer, the Abbot and others. Should BROKEN let their own AI keep running (x2 + finisher only), or stand them still like the others?
   - Rec and built: soft. Freezing them broke their own state machines (the Hedge Warden's stump).
2. **The break bar on B14 keyed and puzzle bosses gives a generic opening alongside their key.** Should these bosses keep it?
   - Rec and built: keep it, since the brief says every boss. The key bosses' level-verb openings fill it most (+35), so the verb is still the fastest way to break them.
3. **Two difficulty dials** now exist: the old per-wood easy/normal/hard/expert, and the new save mode.
   - Rec: retire the per-wood dial when the picker lane lands. Built: both coexist; the new mode multiplies on top.
4. **Master unlock.**
   - Rec and built: device-wide after a Normal kill of the current road-end boss; once unlocked it stays unlocked as acts are added.
   - A Master save can drop to Normal and never come back.
5. **Normal rates rose about 11 points** with the rotating bot (more breaks and finishers). Should the core take back some of the break payoff, or leave it for the weekend sweep?
   - Rec and built: keep your numbers (x2, a longer break, one finisher) and let the weekend sweep re-tune per boss. The alternative is a finisher of x1.25 or a break of 2.6 s.
6. **Master v1 is missing combo tails and earlier phases**, which need per-boss code.
   - Rec: a Master tune lane, by act, adds one told tail per boss and wires `phase`. Built: the table key and the TODO.
7. **Master's punish uses the greed reprisal's tell** (`!!` and a closing ring), not a per-boss windup pose.
   - Rec: accept it for v1, and have an art pass add one generic "punish" stance per boss family.
