# ELITEMOVES (claude/elitemoves) - one meaner move each for the six easy elites

Base: claude/elitetune 111bbe43. The hard three (the first mate, the hobby-horse, the archer) are untouched.

Every new move is told the same way:
- a red `!!` mark called as it starts;
- a word and a colour (EK.say);
- its own sound;
- at least 0.5 s, enforced with `Math.max(0.5, elTell(...))`, so SWIFT and TUNE can never shorten it;
- ANSWER and HEIGHT rows in src/marks.js, and the MARK table rewritten by `tools/tells.mjs --write`.

Every hero can answer every new move with a jump or a step.

## The moves (src/main.js, the elite block)

| kind | new move | answer | how it is meaner |
|---|---|---|---|
| troll (CRAG TROLL) | **AFTERSHOCK** | jump as it reaches you | After the slam he slams again. The second shock RUNS along the floor both ways (210 px/s, about 170 px), so a roll thrown at the end of the windup is spent before it arrives. |
| tideguard (TIDE CAPTAIN) | **UNDERTOW** | jump again | The tide wave comes back from where it spent itself to his feet, and drags you to his spear. He may now raise the tide from close in. The tide comes back 65% of the time (seeded). |
| hearthgob (HEARTH BOSS) | **AND ANOTHER** (the second pot) | change your step | As the first pot bursts, the second is lobbed where you are GOING: your speed times the time to landing, at most 80 px. |
| watch (WATCH SERJEANT) | **HOOK** | jump it | Replaces the second thrust. The halberd hook grows out low along the floor (up to 96 px over 0.3 s) and hauls you in to his feet. |
| hedgeknight | **LOW** (the briar cut comes back) | stand up and jump | After the high flat cut (duck), the blade returns at the ankles with a step in: a high-low mix-up. |
| cutthroat (FIRST KNIFE) | **LOW** (the skimmer) | jump it | A knife skimmed flat at your feet, under the shield. It comes 3 times in 5, after his thrown knife or after his riposte, so it punishes a mash. |

Drawing changes:
- The wave takes a colour (`W.col`), so the troll's ridge of rock is grey, not water.
- The watch's hook is drawn low (`ekReachLow`).

## A lab bug, fixed for the elite lab (main.js BK.clearTellClock + src/lab.js eliteLab)

`BK.reset({ fresh })` set `time` back to 0 but left `lastTellT` where the page's last fight ended. In every lab fight after the first in a page, `time - lastTellT` was negative, which did two things:
- **eliteMay was false.** No elite started a move until the clock passed the old fight's last tell. Most measured fights had the elite using NO moves of his own: seeds 1-3 came out identical, and he only riposted.
- **Every windup in reach was stretched by +0.35 s**, through the token rule at main.js ~23481.

This is a big part of why "the easy six sit at 100%". eliteLab now calls `BK.clearTellClock()` after its reset. The other labs (boss-level, harnesscard, fightLab, ambushLab) still have the bug: see Q1.

## Before -> after (tools/elite-lab.mjs, human bot, knight/warden/pyro)

The before column is the old moves with the fixed clock, 2 seeds (6 fights). The after column is 4 seeds (12 fights) plus mash x3.

| kind | doc before (buggy lab) | before, fixed clock | after, alone | after, final combined `--write` pass | mash | TUNE row (dmg / hp) |
|---|---|---|---|---|---|---|
| troll | 100 | 100 | 83 | **83** | 0/3 | dmg 2.8 -> 1.3, hp 1.2 -> 1.0 |
| hearthgob | 100 | 83 | 83 | 92 | 0/3 | dmg 1.5 -> 2.2 |
| tideguard | 100 | 100 | 75 | **75** | 0/3 | dmg 1.5 -> 2.6, hp 1.2 -> 1.3 |
| watch | 100 | 100 | 83 | 100 | 0/3 | dmg 1.5 -> 3.5 |
| hedgeknight | 100 | 83 | 75 | 67 | 0/3 | dmg 2.6 -> 1.8 |
| cutthroat | 100 | 100 | 75 | **83** | 0/3 | dmg 2.6 -> 3.7 |

docs/elite-lab.json is stamped from the final combined pass, the six kinds only. Fights run 25-38 s.

## Checks (all exit 0)
- elites (48 elites ok, mash 0 for all placed kinds bar the two report-only)
- tells (the only findings are the two pre-existing updateScalder unmarked windups)
- answer-tags
- combat-part2
- curve-gate (the same pre-existing "stale" rows: storm, crown, witchlight, unburied, fair)
- mash-gate

## Reds / UNVERIFIED
- **The elite lab is ORDER-SENSITIVE.** Measured alone or in a different batch, a kind moves by one or two heroes: watch 83 alone vs 100 combined, hedge knight 75 vs 67, hearthgob 83 vs 92.
  - Something else still carries over between fights in one page, beyond lastTellT.
  - The per-hero outcome is near-deterministic, so 83% is one hero dying about half the time, which is a knife edge.
  - Final combined pass: 3 kinds in band (troll, tideguard, cutthroat). All 6 were in band measured alone.
- Nothing has been checked on screen: the grey rock ridge, the low hook, the skimmed knife, the second pot's mark, or the words over the plate.
- The other 15 kinds' rows in docs/elite-lab.json and their TUNE rows were measured with the buggy clock. They are stale now, and I have not re-measured them.
- During the run, someone else edited src/elite-kit.js in this worktree: TUNE values I had not set appeared between two of my runs, probably the restarted session. I measured and committed what was actually in the file.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. **The lastTellT reset in the other labs.**
   - Rec: put `lastTellT = -9` into `BK.reset({ fresh })` itself, so every lab gets it.
   - Then re-measure the bosses, minis and elites in one coordinator pass, because their numbers were tuned under 0.35 s-longer tells and passive elites.
   - What is built: only the elite lab uses it, so no other lane's numbers move under them.
2. **The elite lab's order sensitivity.**
   - Rec: a short harness lane to find the remaining leaked state, or run each kind in its own page (one openPage per kind; slower, but honest).
   - Until then, read 67-92 as "near band".
3. **The 15 other kinds.**
   - Rec: re-measure them once with the fixed clock before any more tuning. The hard three may now read harder than before.
4. **Seeded chance in two moves** (the undertow 65%, the skimmer 60%).
   - These were added so the bot's near-deterministic outcome can land at 75-85.
   - Rec: keep them. Each is still fully told when it comes, and "watch whether it comes back" is a fair read.

No music this lane.
