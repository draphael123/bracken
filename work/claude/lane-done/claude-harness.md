# HARNESS report: claude/harness (base claude/batch74 0c0b69aa)

Brief: make a lab fight leave nothing behind for the next one. (1) BK.clearTellClock in every lab reset. (2) Find the other state that leaks between fights in one page, and prove it gone with an order test. (3) Keep the legacy suite numbers honest. (4) One boss-rates re-measure.

## 1. The tell clock (elitemoves' finding)
- **BK.clearTellClock()** is in src/main.js, byte-identical to origin/claude/elitemoves f7f2a85c. That includes the doubled block exactly as elitemoves has it, so the two merge cleanly.
  - Checked with `git merge-tree`: HEAD against elitemoves gives the same single pre-existing main.js and marks.js conflicts as 0c0b69aa against elitemoves, and nothing new.
- **BK.reset({ fresh: true }) now sets `lastTellT = -9` itself.** This is elitemoves' Q1 recommendation. Every multi-fight harness gets the fix, including the elite lab once it merges, and the ~70 pilots and tools that call reset({fresh}) between fights.
- **bossLab, fightLab and ambushLab also call `BK.clearTellClock()` explicitly**, in elitemoves' style, right after their reset.

## 2. What else leaked, and how it was found
### How
Each probe played the same seeded bossLab row twice in one page and diffed the two:
- the hero's and boss's fields frame by frame;
- every Math.random call site, from a getter on Math.random;
- a throwaway snapshot of all 1354 module-level bindings in main.js (not committed).

Each first divergence was traced to its cause.

### The mechanism
bossLab seeds Math.random per row. But the scenery draws on the same Math.random: ambient motes, fish, crickets, drips, leaves, sound pitch "vary", and footstep sounds. So any cosmetic state a fight left behind changed how many draws happened before the boss's first roll, and from then on the whole fight was different. The gameplay state below leaked too.

### What leaked, and the fix
| what leaked | where | fixed in |
|---|---|---|
| the one-windup clock `lastTellT` (elitemoves) | main.js | reset({fresh}) + BK.clearTellClock |
| move-word cooldowns `moveWordAt`, kept in absolute time | main.js | reset({fresh}) |
| `fishT`, `cricketT`, `dripT`, `heartT`, `airMotes`, `fish` (ambient clocks and pools, each drawing Math.random) | main.js | reset({fresh}) |
| footstep parity `stepN` (every other step calls vary() = Math.random) | src/audio.js | new `SFX.resetSteps()`, called from reset({fresh}) |
| a won fight's `bossFx`, `bossBodies`, `rings`, `ripples`, `impacts`, `deathFx`, `lvUpN` | main.js | reset({fresh}) |
| `hushT`, `slowT` (hush and slow-mo timers), `coinCombo`, `coinComboT`, `flyCoins` | main.js | reset({fresh}) |
| the attack-token board `TK` (frame counter, holds), the last `verbs`, the once-a-level lessons (`emberTaughtIn`, `duckTaughtIn`, `dashAtkShown`) | main.js | reset({fresh}) |
| **PROG, the save.** The XP a lab kill paid levelled the hero for the next row: the Stockade Chief alone is a pyro WIN at 65 s, and after a won fight it is a DEATH at 33 s. Also leaked: lessons told (chipTold, emberTold, ...), beasts seen, and fog. | the session's save | each bossLab row snapshots PROG and puts it back in its finally |

### Proof: tools/lab-order.mjs (new; in check.mjs as its own line)
- **What it does:** it plays 4 seeded targets in a reloaded page, alone. Then it plays each again after a 4-fight batch in the same page. The batch has a won fight, a mini, both profiles, and other heroes. It asserts the outcome, seconds, boss hp left, damage taken, swings and openings are all identical.
- **The targets:** Stockade pyro human 90 s, reef warden legacy, kings knight human, unburied knight legacy.
- **Cost:** about 2 min.
- **Base 0c0b69aa: 4/4 DIFF.** Examples:
  - stockade pyro: win 64.9 s alone vs win 37.8 s batched;
  - unburied knight: timeout vs death at 49.5 s.
- **This branch: 4/4 same.**
- Probes run by hand also came out identical (same Math.random call count and sequence, 120 s fights, legacy and human):
  - theatre, welltown, spore, fallingtower, hanging, kings, marsh, flotilla, storm, canal, harbor, witchlight;
  - crown, deep, undercrown, reef, unburied;
  - the kings, crown and waymeet minis.
- **Not seeded, so order-dependent by design:** fightLab and ambushLab use real Math.random. They get the reset fixes but are not order-proofed.

## 3. The legacy suite checks: what moved (all green now)
I ran these on base 0c0b69aa and on this branch (PORT 8683, 2 at a time):
- normal-health, small-adds, lab-clock, combat-replay, unburied-fights, puppeteer;
- boss-navigation, lab-reach, queen-court, pyre-pilot, mother-pilot, herald-pirate;
- lab-order.

Results:
- **Byte-identical output:** normal-health, combat-replay, boss-navigation, lab-reach, pyre-pilot, herald-pirate. Their rows are first-in-page, or no earlier row leaked into them.
- **Moved, still green:**
  - **mother-pilot:** every refill row after the first changed (e.g. the 2nd hero 108.3 s / 56 taken -> 103.7 s / 42 taken). In normal mode, row 1 went from killed at 107 s to not killed at 82 s.
  - **puppeteer:** bot taken 195 -> 148, secs 96 -> 101.4.
  - **queen-court:** the leap's landing tx 14446 -> 14428.
- **small-adds went RED with the fix. This is a real finding: the check was only green because of the leak.** With every row now playing as it would alone, two rows fail:
  - **spore/mother warden missed 12 of 17 swings at sporelings.** It is the same on base, played alone: `["win",115.4,457 swings,17,12]`.
    - Cause: the Mother pilot stands off (reach-2) from a sporeling. When the sporeling was inside the stand-off, the walk key pointed away from it, so she turned her back and swung at the air behind her.
    - Fix: src/lab.js, the Mother's add-swing branch releases left and right for that frame (`k.left=k.right=false`).
    - Now 4 small-foe swings, 0 missed, and a 110 s fight with 46 swings (was 457).
  - **underleaf/grandmother pyro missed 3 of 4.**
    - Cause: the generic swing cut a biting sprig whose foot was 14-16 px up. That shares only 0-2 px with the cut's band (feet-16 .. feet-1), so it met air.
    - Fix: src/lab.js `inCut` needs the foot at most 12 px up (was 16). Outside that, it holds the swing for a frame, as it already did when a foe was out of both bands.
    - Now 3 swings, 0 missed.
  - small-adds now passes at 11 of 101 missed (11%), worst judged row 27% (limit 33%). On base it showed 7/103 and 20%, which was the leaked, flattering version.
- The two bot fixes are in the legacy and v2 paths alike, because both use these branches. So the human-profile spore row sees the Mother fix: base batch74 spore is 33%, this branch 42%.
- **Not run here** (the coordinator runs suites): the rest of the ~130 suite checks that touch a lab or a fresh reset.

## 4. Re-measure
Full table: scratch/remeasure-harness.md (raw rows: scratch/remeasure-harness-rows.json).
- Run: `boss-rates --all --ways=practiced --seeds=4 --jobs=2`, human profile, campaign level: 624 fights, 68 min, 0 errors.
- **boss-rates was never hit by the leak.** tools/boss-run.mjs reloads the page per fight, so every boss-rates fight is a first fight. The sweeps' numbers stand as measured. 23 of 52 rows reproduce their before per-hero exactly.
- **11 rows left their band.** Most are within noise or come from the batch74 integration:
  - scree, reef, spore, stockade, burning, moor, undercrown, burial:mini, hanging:mini, all just outside;
  - waymeet and keep, now with a zero hero.
- **1 row entered the band:** burial.
- **Moved more than ±14:** caravan -59, theatre +34, causeway -25, witchlight:mini -25, mage -23, harbor -17, and canal, reef, spore, harbor:mini -16 each.
- No boss was retuned in this lane.

## Checks run (all exit 0 on 71ce5b78)
normal-health, small-adds, lab-clock, combat-replay, unburied-fights, puppeteer, boss-navigation, lab-reach, queen-court, pyre-pilot, mother-pilot, herald-pirate, lab-order, and `node --check` on every touched file.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. **The elite lab's PROG.** elitemoves' eliteLab (tools/elite-lab.mjs seeds each fight in one page per kind) gets every reset({fresh}) fix on merge. It does not get the per-row PROG restore, which lives in bossLab.
   - Rec: on merge, wrap `lab.eliteLab` in elite-lab.mjs's `window.__elite` with the same snapshot/restore of BK.PROG, then add an elite target to tools/lab-order.mjs.
   - Built: nothing in elitemoves' files, to keep the merge clean.
2. **The 11 rows that left their band.**
   - Rec: treat them as batch74 integration and noise, not a harness effect (see section 4).
   - Re-measure caravan, theatre, causeway, mage and witchlight:mini at n=24 before any retune lane takes them.
3. **Cosmetics share the gameplay RNG.** Ambient effects and sound draw on Math.random, so any new ambient pool that survives a fresh reset will bring the leak back.
   - Rec: keep tools/lab-order.mjs in the suite; it is the tripwire. Longer term, give the ambient and SFX draws their own stream.
   - Built: the tripwire only.

No music this lane.
