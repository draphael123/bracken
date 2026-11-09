# HCQUEEN - the Goblin Queen (Highcrown GQ2) into band (opus, 11-08) - claude/hcship

**Outcome: the Queen is at 70% [61-78] at n=108, down from 75%. Every hero is at 6/12 or better, and the parry stun still works for all nine heroes.** That is the top edge of the 60-70% band. All four tries landed at 69-70%. Pooled over all four tries (432 fights), her rate is about 69.5%.

- Worktree bracken-lanes\bracken-hcship, branch claude/hcship, pushed. Head: see the last line.
- NOT merged to master. NOT deployed. tools/check.mjs NOT run. Nothing stashed.
- Only my own node and headless Chrome ran, one Chrome at a time, with 5.5-6.3 GB free at each start.

## 1. The tally (new): `gqt` on every Queen boss-run row
- **Where it lives:** src/lab-gqueen.js (gqTally) puts it in the row's `gq.tally`, and tools/boss-run.mjs prints it as `gqt`.
- **What it counts:** her hp change from frame to frame, sorted by stage and by what she was doing. This catches every source: blades, skills, and the pin's and stun's own chunk.
- **Format:** `class: [hp lost, seconds spent, openings entered]`.
- **Classes:**
  - `hall.pinL`: pinned under the grate she was lured to
  - `hall.pin`: any other pin
  - `hall.stun`: a parried crown or shard
  - `hall.out`: outside an opening, on her 0.4 plate
  - `roof.open`: the tower top
  - `roof.stun`
- **Hall bar:** 2862 hp at L21 (EHP 2400 scaled).

**Findings** (start state = hcfix v3, sample of 9 heroes x 2 seeds, scratch\lane-reports\hcqueen-tally0.*):

| class | mean hp a fight | share of the hall bar |
|---|---|---|
| hall.pinL | 1343 (2-5 pins, about 4 s each) | **47%**, and 50-80% in most wins |
| hall.out | 1103 | 39% |
| hall.stun | 210 | 7% |
| roof.open | the whole 1750 bar in every win | - |

- **The lured pin was the fight.** One pin took 650-1220 hp: 23-43% of her hall bar in 4 s. The pyro took 1222 per pin and the geomancer 1045. The paladin and pirate took 200-340 per pin.
- **Every loss is a death in the hall.** The tower top never loses a hero who reaches it, which is why hcfix's tower-top and crown-stun levers did nothing.
- **The crown stun is small.** It averages 200-300 hp a fight.

## 2. Tries (built way, WITH flasks, L21, seeds 1-12 in one run, --jobs=1, n=108, 0 ERR rows each)
Command: `PORT=8673 node tools/boss-rates.mjs crown --ways=built --heroes=knight,warden,geomancer,ranger,berserker,pyro,paladin,pirate,reaper --seeds=12 --jobs=1 --level=21 --out=...`

| version | kn wa ge ra be py pa pi re (/12) | pooled [95%] | lowest hero |
|---|---|---|---|
| hcfix v3 (start) | 10 6 11 7 12 11 6 7 11 | 75% [67-83] HIGH | 6 |
| try 1: lured pin 4.0 s x1.35 -> 3.5 s x1.1 | 11 5 8 7 10 10 6 7 10 | 69% [59-77] | 5 |
| **try 2 (KEPT): try 1 + one pin's blows at most 15% of her bar** | **10 6 8 6 11 9 6 10 10** | **70% [61-78]** | **6** |
| try 3: try 2 + hall bar 2400 -> 2600 | 11 4 8 6 12 11 5 8 11 | 70% [61-78] | 4 |
| try 4: try 2 with the cap at 12%, hall bar back to 2400 | 8 5 11 6 12 9 4 9 10 | 69% [59-77] | 4 |

Logs and JSON: scratch\lane-reports\hcqueen-try1..4.{log,json}.

**What the tries showed:**
- **Try 1:** the pin dropped to 1032 hp a fight, and the pooled rate moved 75 -> 69%.
- **Try 2:** the pyro's pin went from 1039 to 468 hp an opening. The cap is a fairness fix (it hits the burst heroes, not the paladin or warden) more than a rate lever. The bots then do the work on her plate: `hall.out` rose to 1435 a fight.
- **Try 3:** a bigger hall bar only sank the weak heroes (warden 4/12, paladin 5/12). The berserker went to 12/12. Reverted.
- **Try 4:** a tighter cap only moved noise and put the paladin at the 4/12 floor. Reverted to 15%.

**The 4-try cap is reached.** Try 2 is kept: it has the best spread, and its pooled rate is in band (at the edge).

## 3. What changed in the game (final)
- **gqueen-hands.js GQ3.mech:** `pin` 4.0 -> 3.5 s, `pinMul` 1.35 -> 1.1, and a new `pinCap` of 0.15.
- **main.js:** reads `GQ3.mech.pinMul`; it was hard-coded at 1.35. New `gqPinCap`:
  - A lured pin's blows land at most 15% of her bar. The cap counts what lands, after the riposte, the chain and so on.
  - The blow that reaches the cap lands only what is left (at least 1).
  - She then "HEAVES AT THE GRATE" and is free 0.3 s later. Damage never goes to zero: past the cap she is back on her 0.4 plate.
  - `e.gqPinTaken` resets on every pin.
- **Not changed:** the 0.4x floor, the bell lure, the grate pin and the winch gate.
- **The pin's 7% chunk is unchanged.** It is shared with the old pin path.
- **tools/gq2mech.mjs:** reads the multiplier from the hands, checks the pin window is 3.5-4.5 s, and asserts the cap's wiring and range.

## 4. Merge (coordinator, Daniel-approved): origin/claude/screenfit 9d6f08fcb
Merged at a clean point (after try 2). It had three conflicts, all resolved keeping both sides:
- **main.js settings rows:** kept our SPEED_DEFAULT game-speed labels and added screenfit's Screen fit / Resolution rows and value labels.
- **check.mjs:** the union of the two lists. Ours plus `screenfit`; queen-court and queen-chandelier stay retired, as hcfix decided.
- **docs/updates.json:** the screenfit line is kept inside our batch 155 entry, for the coordinator to fold in at deploy.

Checks after the merge:
- `node tools/screenfit.mjs` ok, demo-cut all green, deploy-surface ok, itch-build-check ok.
- **modulepreload:** 1 module was missing (src/screenfit.js). After `--write` it lists 777 modules, green.
- sw.js has no per-module list, so it needed no change.

## 5. Checks on the final code (all exit 0)
- **Chrome-free:** gq2mech (all ok, with the new cap assert), gqueen3, tells, level-quality crown, comments, demo-cut, modulepreload (777), blow-tags. Also screenfit, deploy-surface and itch-build-check, run after the merge.
- **Page checks (one headless Chrome each):**
  - **gqueen3-page ok:** a crown parried on the beat stuns her for all nine heroes (stunned 1 each), and a plain block stuns none.
  - **rule-openings ok:** the bell pins her, `pinBy 'lure'`.
- **Not run:** tools/check.mjs (forbidden); gq2-lab and textfit (not in the brief).

## 6. Secondary (Princess ranger 2/12, 117 s fights): NOT DONE
There was no time after the four Queen runs. Each n=108 run took 28-42 min on this machine. Still owed: the bot's arrow budget (the volley skill empties her quiver), as hcfix question 2 said.

## Questions for Daniel (recommended answer first)
1. **The Queen at 70% [61-78], the band's top edge. Ship it?** REC: yes, ship. Four tries agree on about 69.5% over 432 fights. Further hall levers only trade the weak heroes' rate for the strong ones' (try 3, try 4). If you want her centred at 65%, the next lever is the bot rather than the boss: the strong heroes (berserker 11-12/12, reaper, knight) take her on the 0.4 plate at 1400-1900 hp a fight.
2. **The lured pin is now 3.5 s, x1.1, capped at 15% of her bar. Keep it?** REC: keep. It still pays (x1.1 plus the 7% chunk), and it is still the biggest single opening. It just no longer lets a pyro take 40% of her hall bar in one pin.

**READY for a full gate:** READY for the Queen (in band, no hero under 6/12, parry stun green for all nine, floor intact). The Princess ranger (2/12) is still owed, as hcfix noted; her pooled 68% is in band.

Head: code d4ee8a4f4 (KEEP try 2 + checks); this report is the commit on top of it (hcqueen: lane report).
