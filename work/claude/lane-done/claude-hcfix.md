# HCFIX - Highcrown fixes after HCPROOF (opus, 11-08) - claude/hcship

Worktree bracken-lanes\bracken-hcship, branch claude/hcship, pushed (head bbe70ceb3). NOT merged to master, NOT deployed, tools/check.mjs NOT run, nothing stashed, only my own node/Chrome (one headless Chrome at a time, 6-7 GB free at each start). Several boss-rate runs lost 1-2 pages to Inspector.targetCrashed (shown as ERR, left out of the rates).

## Merges (all clean except as noted)
1. origin/master 85d152eb8 (batch154): one conflict, docs/updates.json. Our Highcrown entry is now **batch 155**, on top of master's 154.
2. origin/claude/gpart (the fat, ugly Princess): clean.
3. origin/claude/gobgeo (the Goblin Geomancer, five reflect-rock rooms): clean.
4. origin/claude/itchurl 5d24ae6be: clean. `node tools/demo-cut.mjs`: **all green** (FOLLOW_URL is the itch page).
5. origin/claude/logo e03a8c41a: one conflict in tools/check.mjs (the list of node checks). I took the union and added title-mark. queen-court and queen-chandelier stay retired, because gqueen3 replaced them on our side. Checks: demo-cut green, title-mark green, deploy-surface green, itch-build-check green. **modulepreload was RED**: 37 modules were imported but not preloaded. That is master's batch154 (attract.js and others) plus our set. I ran `--write`, and it is green now (776 modules).
6. origin/claude/speedlabel e382fec48: clean. `node tools/feel-speed.mjs`: **ok** (the range, default, migration and sub-steps all hold).

## Goblin Princess: the structural fix (both parts)
- **a) A ranged hit is a blow.** An arrow, the berserker's thrown axe or a pyro ember in flight that meets the bell rope, a winch (her guardroom winch, the tower alarm winches, the banquet's winch) or one of her gems counts as a blow on it. Each shot counts once, and an arrow drops where it hits. This is in src/goblin-princess.js (`shotOn`) and main.js (`ctx.shots`).
- **b) The pin is a TIMED winch blow.** Ringing the rope still makes her bolt under the grate, but the grate no longer drops by itself. The winch holds it. The column glows, then BLAZES ("NOW!" over the winch) for 0.6 s, starting 3.4 s after the ring, which is time to run from the rope to the winch.
  - Strike the winch in the blaze: she is PINNED.
  - Strike it too soon: the grate drops, she sees it and ducks (no pin).
  - Let the blaze pass: she slips out from under it.
  - The hint and the sign at col 620 say this: "RING ITS BELL, THEN STRIKE THE WINCH AS THE GRATE BLAZES."
- **Found while measuring:** her PREEN was the one opening without the cap. One riposte heavy took 340 of her bar, and the warden ended her in 12 s (2 of 6 warden wins, already in hcproof's v5). The preen is now capped like every other opening.
- **Ranged niche:** while she is up on the belfry landing, a SHOT hits her at x0.85. That is above the 0.4 floor. A blade has to jump up to her and still gets 0.4x.
- **Bot only (src/lab.js, labDuty):**
  - The duty run drops the guard.
  - The ranger walks her own duty. Before this, the restock crouch held her at the rope through every blaze.
  - She shoots the winch from 70 px when she has arrows.
  - She shoots incoming gems.
  - She jumps up to the landing to shoot the Princess when she is pinned, stunned or perched there.
- **Numbers now:** hp 1200 (was 1600), resist 0.4 (unchanged), an opening takes 10% of her bar (was 12%), lunge stagger 1.0, preen 1.2. Her blows are x1.1 of v5: lunge 31, pokes 13, trinkets 9, tiara 18, stomp 20, fan 6.

## Goblin Queen: parry stuns
The paladin's aegis, the geomancer's rune-ward and the reaper's ward-return **already call RP.parried on their beat**, so the game needed no rerouting. The miss was in the bot: src/lab.js parryAt raised every SHIELDED hero's guard 0.06 s before impact.
- The paladin's aegis only comes up after C is held for 0.16 s.
- The geomancer's ward takes 0.1 s to stand.
- The reaper parries by letting go of the ward as the blow lands.

The fix is in the bot only: `GQ_OWN` gives each of them their own beat (paladin holds from 0.25 s, geomancer holds from 0.15 s, reaper taps at 0.1 s). This is the same as gobgeo's LEAD table. **gqueen3-page is now green: a crown parried on the beat stuns her for all nine heroes**, and a plain block stuns none.

Two fixes to that page tool's own set-up: the flee used `BK.hurt`, which does not exist (it is `BK.env().hurt`), and it now reads the best hp over the 2 s, because the escape's burning floor ticks right after the heal.

Queen numbers now: crown stun 3.0 s (was 3.5) and tower-top bar 1750 (was 1600). I also tried two more versions:
- v4: tower-top bar 1900 and lash 21.
- v5: crown stun 2.6 s and bell cooldown 13 s.

Neither moved her rate, so I reverted them. She loses in the hall, not on the tower top.

## Rates (built way, WITH flasks, L21; heroes: knight, warden, geomancer, ranger, berserker, pyro, paladin, pirate, reaper)

| boss, version | per hero (wins/fights) | pooled [95%] | avg win |
|---|---|---|---|
| Princess, hcproof v5 (start) | 6 5 5 **2** 6 6 5 3 5 /6 | 80% | 104 s |
| P v-a: timed winch + shots (bot never reached the winch: 0 pins) | 3/4 5 5 1 6 6 5 5 3 | 75% | - |
| P v-b: lead 3.4 s, hp 1450, stagger/preen eased | 5 5 3 1 6 6 6 3 5 | 74% | 95 s |
| P v-d: ranger up to the landing, hp 1350, cap .10 | 5 6 6 3 6 6 6 4 4/5 | 87% | 95 s |
| P v-e: preen capped | 4 6 4 1/4 4/4 6 6 2/5 3/4 | 77% | 121 s |
| P v-f: hp 1200, blows x1.25, shot on landing x0.75 | 3/5 5 2 1 6 6 4 2 3 | 60% | 106 s |
| **P v-g (KEPT): blows x1.1, shot x0.85, n=12** | **6/12 10/12 7/12 2/12 11/12 12/12 7/10 5/12 11/11** | **68% [59-77] IN BAND** | **117 s** (median 108) |
| Queen, hcproof v2 (start) | 5 4 4 5 6 4 **2** 3 3 /6 | 67% | - |
| Q v3: parry fix in the bot, n=6 | 6 4/5 5 2 6 5 3 4 5/5 | 77% | - |
| **Q v3 (KEPT): crown stun 3.0, tower top 1750, n=12** | **10/12 6/12 11/12 7/12 12/12 11/12 6/12 7/12 11/12** | **75% [67-83] HIGH** | 157 s |
| Q v4: tower top 1900, lash 21, n=12 | 8/10 6 10/11 7 12 12 6 7 11 | 75% | 159 s |
| Q v5: stun 2.6, bell cooldown 13, n=12 | 10 6 9 9 12 12 7 8/11 10 | 78% | 161 s |

Logs and JSON: scratch\lane-reports\hcfix-princess1..9.*, hcfix-queen1..5.*. Each row of the boss-run output now also prints `gpn`: her per-move tally, including pins, slips, early drops, shots, bar lost outside take (`bypass`) and the biggest blow (`bigD`).

**Princess:** in band pooled. The spread is still wide.
- The ranger is at 2/12. The bot ranger empties her quiver on volley skills and then stands to restock, and she takes the generic greed reprisal (56-168 a fight).
- Fights average 117 s, against the 60-90 s target.
- The pirate is at 5/12.

**Queen:** 75% pooled at n=12, which is **over the band**. The parry fix is real: the paladin went from 2/6 to 6/12, and every hero is now at 6/12 or better. The two hall levers I tried (crown stun, bell cooldown) did not bring her down.

## Fixes to the page tools
- **rule-openings, the bell-pins-her red:** this was the test set-up. Since GQ2-MECH, the bell is a lure: she storms to it, the grate is told for 0.9 s, then it drops. The test only ran 0.5 s, and then read "open" after her 4 s pin had ended. It now runs 5 s, reads while she is pinned, and accepts `pinBy 'lure'`. **Green.**
- **textfit:** ran to the end with each scope's own 480 s timeout (2298 s in all). **Exit 0.** It found one OFFSCREEN in our set: the rope's "RING" label in the Princess's room. That label now draws only while the rope is on screen. The rest is outside Highcrown: Rookery and Palisadewood labels, two What's New lines clipped, one credits line truncated.

## Stills (I looked at each one)
Saved in scratch\lane-reports\hcfix-stills\ and work/claude/shots/hcfix/. The tool is tools/hcproof-shots.mjs, with real swings.
- **Gate:** the old stills were taken after the horn had run out, so "rising" was already DOWN. The tool now waits for tower 1's real alarm.
  - gate-0-rising: the open door, lit red, the horn bar, the raised leaf.
  - gate-4-down: a new KEPT state. The grate reaches the floor on a foot rail, and helmeted guards with red eyes stand behind thinner bars.
  - zoom-gate-rising-vs-kept.png shows the two side by side. **DOWN is now clearly different from rising.**
- **Hatch:** hatch-0-shut shows the wooden hatch. hatch-open-7 and -9 show the open shaft with its ladder and light, and her going up through it. zoom-hatch-shut-vs-open.png compares them.
- **Murder hole:** the hero now stands on the stone over slot #1 (he was being dropped into the hall below), and DOWN is held so the camera looks down the fall line. hole-1-fall-17 and -18 show the **stone mid-fall under the slot**. hole-1-spent shows the slot after it has dropped.

## Both fights, for Daniel
**scratch\lane-reports\hcfix-fights-sheet.png**: 17 labelled stills from one headless Chrome, each taken after about 60 settling frames. The tool is tools/hcfix-fights-sheet.mjs; individual stills are in scratch\lane-reports\stills\.
- **Queen:** intro (the Princess's MOTHER! cameo), the bell lure, the grate pin, the west gate rising at 66%, the crown toss and portal tells, and on the tower top: lash high, lash low, ambush, rubble geyser, leap-and-quake, and the crown toss.
- **Princess (the fat art):** intro, an arrow ringing the rope, the blaze ("NOW!"), an arrow in the winch giving the PIN, and an arrow knocking a gem away.
- One weakness: the geyser's marked tiles are faint in its still.

## Chrome-free checks, all exit 0 at the end
level-quality crown, gprincess (with the new timed-pin, ranged-blow and early/slip asserts), gobgeo (96), gq2mech, blow-tags, tells, gqueen3, bell-winch, hc3art-sheet, demo-cut, title-mark, deploy-surface, modulepreload, itch-build-check, comments. gq2-lab passes, but it is still flaky about 1 run in 3 on the co-op shard assert (known; hcproof question 7).

## Verdict: NOT READY for a full gate
- **Queen:** 75% at n=12, above 60-70%.
- **Princess:** in band at 68%, but the ranger is at 2/12 and fights average 117 s.

Everything else hcproof said was owed is done: merges, structural fix, parry stuns, rule-openings, textfit, the gate/hatch/murder-hole stills, the node checks, and the sheet.

## Questions for Daniel (recommended answer first)
1. **The Queen at 75%:** what next? REC: one short lane that adds a per-move damage tally for her (like the Princess's `gph`/`gpn`), so we can see which hall opening the bots use, then tune that. The stun and bell levers did nothing. Alternative: take her P1 hall bar down by 10%.
2. **The ranger on the Princess (2/12):** REC: fix the bot's arrow budget (the volley skill empties her quiver) in a small lab lane, then re-run n=12. Do not tune the Princess further for a bot habit.
3. **Princess fight length (117 s average, target 60-90 s):** REC: accept it for now. A lower HP put her at 87%, and with the cap on all her openings the bar has to be worked down blow by blow.
4. **The 3.4 s blaze lead and the 0.6 s window:** REC: keep. A hero who rings the rope and runs straight to the winch arrives with about 1 s to spare. A masher loses the pin.
