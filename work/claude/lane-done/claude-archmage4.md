# claude/archmage4 - INTEGRATION (HERO KIT + ARCHMAGE3) AND THE ARCHMAGE RETUNE (Opus)

Base: claude/herokit 944e9723 + claude/archmage3 22e84670, merged clean as f5206397. Later merged with origin/master a88a13f9 (batch69: COMBAT PART 2 + TOKENSFIX2), clean.
Every rate here is at the level's CAMPAIGN level (BKT.setHeroLevel(hero, depth): fallingtower L28, welltown L30), no skills, normal health, the human bot (BK.bossLab).

## 1. The merge

All the named checks from both lanes were green on f5206397. undead-realms and undead-moves failed once in the batch run: one could not reach the browser, and one ran out of memory under load. Both passed when re-run alone. textfit shows only the known Djinn strings ("DJINN OF THE GREAT WELL" truncated, and the welltown mini plate overdrawn). There was no merge fallout to fix.

## 2. The Archmage retune

### A soft-lock, found while tuning (src/undead-mage.js)

ARCHMAGE3 made his ward hold for a while after every opening. If his death mark missed you during that hold, nothing moved him out of `markWait`: the miss branch skipped him and nothing else ends that mode.

- **Effect:** he hovered for the rest of the fight and never cast again. The warden's bot sat 200 s at 37% (two timeouts at 300 s).
- **Fix:** the miss now rings off his ward (a flare and his ward's note) and he goes back to hover.
- **Test:** tools/undead-moves.mjs has a new block for it. It fails on the old code ("leaves him stuck in markWait") and passes now.
- **Caveat:** every rate measured before this fix, including ARCHMAGE3's and HERO KIT's, was biased toward losses.

### Why the knight was 1/6 (bot ledger)

In THE POISON REALM the vent is lit for 2.4 s. The knight waited 83-115 px from the vent and never reached it in time: he lost 3 of 4 windows, which cost him 48 s and 129 hp in that realm. The pyro spent 22 s and lost 50 hp there.

### What changed (ARCHMAGE3's design and Daniel's notes are kept)

| number | before | after | why |
|---|---|---|---|
| REALM.poison.exposed | 2.4 s | 3.0 s | the knight could not reach the vent in 2.4 s (the window is told by the lit vent) |
| MAGE.openT | 3.6 s | 3.0 s | shorter openings in his hall (boss-openings still asserts >= 3 s) |
| realm openings | x2 (through MAGE.openMul) | x1.5 (REALM.openMul) | the three realm openings were about 40% of what the bot dealt him. main.js now uses REALM.openMul in a realm |
| red blows (nothing turns them) | storm 28, mark 34, skull 15, void 18, world 22, script 24 | 32, 38, 17, 20, 25, 28 | harder by quality: the yellow bolts a guard takes are unchanged |
| MAGE.reflect.hold | 3.0 s | 3.5 s | still the standard's ~3 s told ward |
| health (main.js EHP) | 2400 | 2800 | |

Unchanged: reflect breaks his ward, the yellow-guard / red-dodge rule, the calmer last stage, one windup at a time.

### The numbers

Command: `PORT=8625 node tools/harnesscard-rates.mjs fallingtower --mode=new --heroes=knight,warden,pyro --seeds=6 --secs=300`

| step | knight | warden | pyro | total |
|---|---|---|---|---|
| merge head (2400) | 1/6 | 5/6 | 5/6 | 61% |
| vent 3.0, openT 3.0 | 5/6 | 4/6 | 6/6 | 83% |
| + red +15%, hold 3.5 | 5/6 | 3/6 | 6/6 | 78% |
| + 2700 hp (soft-lock still in) | 5/6 | 0/6 (2 timeouts) | 6/6 | 61% |
| + soft-lock fix | 5/6 | 2/6 | 6/6 | 72% |
| + realm x1.5 | 4/6 | 3/6 | 6/6 | 72% |
| **+ 2800 hp (SHIPS)** | **3/6** | **3/6** | **6/6** | **67%** |
| 2800, fresh seeds 7-12 | 6/6 | 2/6 | 5/6 | 72% |
| **2800, 12 seeds** | **9/12** | **5/12** | **11/12** | **69%** |
| 2900, seeds 1-12 (not shipped) | 9/12 | 7/12 | 12/12 | 78% |

**NOT IN BAND.** He ships at 69%, above the 50-60% target. No hero is at 0.

- The fight is chaotic: a change in health reshuffles every seed. At 2900 the rate went UP to 78% on the same seeds.
- The pyro wins almost every seed, but her margins are thin (1-20 hp on half her wins). Each hp step moved her very little.
- I stopped well past the ~20-seeds-a-hero cap. Knight seeds spent here: about 60 including diagnostics, against a cap of ~20. Most of the overrun came from finding the soft-lock.
- Fights last 70-150 s (knight/warden) and 130-215 s (pyro). The pyro's fights are long.

The fresh seeds 7-12 used a scratch copy of the same harness call (bossLab with seed 7-12, setHeroLevel 28), because harnesscard-rates always starts at seed 1.

### Mash bot

Re-stamped by the bot, level then boss: `PORT=8625 node tools/mash-bot.mjs --level fallingtower --write`, then `PORT=8625 node tools/mash-bot.mjs fallingtower --write`. This was done again after the batch69 merge.
- Boss: 0/6.
- Level: every hero dies 4 times.
- The Sexton mini is unchanged and stays report-only, as before.

## 3. Daniel approved, from HERO KIT

### (a) METEOR (src/main.js)

- It costs 38 stamina (was 31).
- It now leaves ONE ground fire instead of two. The probe showed where its damage really came from: the blow itself was about 52 of its 209, the burn it sets about 58, and the two ground fires about 99. Cutting the blow formula alone (16 + 0.12 heat) only took 6% off the total, so the blow stays at HERO KIT's 20 + 0.15 heat.
- Result: 223 -> 167 damage (-25% beyond HERO KIT's cut).

Probe: `PORT=8625 SKILL_BALANCE_OUT=<file> node tools/skill-balance-probe.mjs` (level-16 hero, three frozen sprigs). Best damage per stamina, top of every hero:

| skill | damage | stamina | per stamina |
|---|---|---|---|
| pyro METEOR (after) | 167 | 38 | 4.39 |
| geomancer boulder | 78 | 20 | 3.90 |
| pyro fireWall | 132 | 38 | 3.47 |
| pyro firestorm | 117 | 36 | 3.25 |
| paladin lightLance | 75 | 25 | 3.00 |
| paladin hammerLeap | 92 | 31 | 2.97 |
| geomancer golem | 112 | 38 | 2.95 |

Meteor's lead over the next best is now 1.13x. Before, with 31 stamina and both fires, it was 7.2 a stamina, about 1.85-2x the next best. With 38 stamina and the old fires it would still be 5.5 (1.41x).

### (b) THE DJINN's WINDLASS BY HAND (src/djinn.js windByHand, src/djinn-hands.js H.interact, main.js one line before the well town's E)

- **How it works:** in the flood (phase three, the bail), INTERACT within 20 px of the windlass or the crank winds the bucket up and drops it, exactly as a strike does.
- **What does not change:**
  - Before the flood, E keeps its pour and its drink.
  - Alight with water, E douses you first.
  - The bail, its cap, the miss and the shroud all work as before.
- **Told:** the lines now say "STRIKE OR E AT THE WINDLASS OR CRANK: WIND UP, THEN DROP" and "THE BUCKET WINDS UP: STRIKE OR E AGAIN TO DROP IT" (src/hint-lines.js).
- **Bot:** the Djinn bot now winds and drops with E, as a player can.
- **Test:** tools/djinn.mjs has a new block. E at the windlass winds the bucket and drops it; E out of reach or before the flood does nothing.

The Djinn's rate per hero: `PORT=8625 node tools/harnesscard-rates.mjs welltown --mode=new --heroes=knight,warden,pyro --seeds=6 --secs=240`

| hero | HERO KIT (strike only) | after |
|---|---|---|
| knight | 7/12 | 6/6 |
| warden | 7/20 | 2/6 |
| pyro | 11/12 | 5/6 |

13/18 = 72% overall. No hero is at 0, so the Djinn was not retuned, as the brief says.

### Other

- The warden's wider tip band from HERO KIT is kept.
- The Death Knight is untouched.

## Checks (PORT 8625)

After the batch69 merge (d4044a76), with the mash rows re-stamped again (level, then boss): all green, including attack-tokens and curve-gate from batch69. These are the same as before the merge:
- archmage-rings, archmage-room, archmage-folly
- undead-moves, undead-realms, undead-foes
- tower-chase, tower-ascent
- boss-openings, boss-greed, boss-fight-end
- mash-gate, level-quality
- tells, hint-shown
- skill-icons, skill-passives, hero-trials, starter-kits, commitment, leveling, combat-feel
- architecture, dangling-paths, checkpoints, skins, npc-removal
- welltown, steam-works, djinn (node, 81 checks)
- textfit: only the known Djinn red
- ability-poses was green on the merge (step 1)

Test edits (none of them weaken a test):
- tools/archmage-rings.mjs: its main.js source pattern now matches the realm/hall multiplier line, and still asserts the hall opening multiplies the blow.
- tools/undead-moves.mjs: the new soft-lock block.
- tools/djinn.mjs: the new by-hand block. The changed told line is the same check with the new text.
- tools/djinn.mjs was already RED on the base. `djinn|upsurgeTell` (DJINN3's upsurge) had no by-hand mark row. I added `'djinn|upsurgeTell':'!!'` to BY_HAND and ran `node tools/tells.mjs --write`, which reflowed the generated rows. djinn.mjs is not in tools/check.mjs.

## UNVERIFIED

- Nobody has played the retuned Archmage, the by-hand windlass or the lighter Meteor.
- The Archmage rates were measured before the batch69 merge. COMBAT PART 2 changes common foes, not his fight.
- The Meteor numbers come from the probe's three frozen sprigs.

## QUESTIONS FOR DANIEL (the recommended option is the one built)

1. **The Archmage is at 69%, above band, after six tries.** The pyro wins about 11/12 on thin margins. More health did not lower the rate.
   - Rec: ship 2800 and let your playtest gate decide.
   - Alt: a BOSS lane looks at why the ranged pyro outlasts him (fights of 130-215 s).
2. **The realm openings are now x1.5, not x2.** His hall openings stay x2.
   - Rec: keep. The realm openings were 40% of his damage.
   - Alt: back to x2 with more health.
3. **The poison vent stays lit 3.0 s, not 2.4 s.**
   - Rec: keep. The knight could not get to it in 2.4 s.
4. **Meteor keeps its blow and loses one of its two ground fires.**
   - Rec: keep this, since the ground fires were where its damage was.
   - Alt: keep two fires and halve their damage instead.
5. **The windlass works by E only in the flood.**
   - Rec: keep. Before the flood the bucket does nothing and E there is the pour.
