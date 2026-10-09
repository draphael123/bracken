# claude/crusader - THE CRUSADER (Waymeet boss, t 'closedhelm') rework

Base: origin/claude/batch81 a41b1f60 (keyscore + litchurch already in). Re-merged batch81 at the end: no new commits on it.
Brief: scratch/brief-crusader.md (Daniel 10-08).

## What changed
1. **Tighter parry, ~0.2 s, on the GLINT** (`CRUS_BEAT = 0.2`, was PAL_BEAT 0.45). `crusOpened()` uses the same clocks palOpened reads
   (guard raised, parry, aegis, ward let go, roll started) but at 0.2 s. The warden's deflect is live 0.5 s, so hers counts only if it
   went out in the last 0.25 s. The death knight's WARD_BEAT_PAL is 0.2 too. The trial yard / sworn-sword lesson keeps PAL_BEAT 0.45 (teaching).
   A plain guard held from before the glint just HOLDS the blow ("TOO EARLY: AT THE GLINT").
2. **A missed parry is punished**: a held-early guard or a roll started too soon sets up THE FOLLOW-UP (followTell, a yellow `!`, 0.42 s):
   a quick backhand that goes **through a held shield** (pierce). A guard raised on its own glint still turns it and breaks the ward. It never chains.
3. **Souls wind-ups, drawn as poses** (src/redraw/waymeet.js, frames 14-30): anticipation (the weight goes back, the blade comes up) -> the held
   pose -> **the GLINT** (its own frame: the edge goes white plus a 4-point star on the point, with the white flash and a sound, `CRUS_GLINT = 0.32 s` before
   the release) -> the swing (a smear frame) -> **a punishable recovery** (cutRec / thrustRec 0.6/0.5 s, bent over the blade). While he
   recovers, his ward does not face you: front blows land whole (1x, not x2). This is in src/boss-greed.js OPEN_RULE, so there's no greed and no wall then.
   Each move has its own silhouette: the cut (blade up behind), the thrust (low, point back), the delayed overhead (coiled low, blade flat behind the helm,
   shield up), the grab (low and wide, sword hung at the hip, open hand), the brand (sword reversed and raised, point down, lit), the follow-up (backhand cocked).
4. **CRUSADER'S GRAB** (red `!!`, phase 1 on; 1.0/0.9 s tell; 7 s first, 7.5/6 s cooldown, sooner if you hold a guard in his reach).
   He lunges with an open hand (~95 px). If he catches you, he lifts you over his head (0.75 s) and hurls you down, unblockable (DMG.palGrab 26).
   You can roll through it or step out of reach. If he whiffs, he stumbles ("HE GRASPS AIR: STRIKE", 1 s, whole damage).
5. **HOLY BRAND** (red `!!`): this is a NEW PHASE THREE, entered under 30% of his health ("HE TAKES UP THE BRAND", B5: one new move a phase).
   He drives the sword into the floor and two lines of holy fire run out along it to both walls (210 px/s, 14 px high). You jump them.
   During the tell, the path shows as a dithered gold floor decal (not a box). The sword then stays in the floor for 1 s (punishable).
6. **THE DELAYED OVERHEAD** (yellow `!`, after his first cut: a 30%/40% chance per cut). It is held 1.75/1.55 s, a beat past the 1.15 s cut. The glint always comes
   CRUS_GLINT before the true release (fair). DMG.palDelay 24.
7. Tuning: BOSS_HIT closedhelm 1.4 -> 1.55 (HP 2800 unchanged). Bestiary line and wall hint updated (GLINT / GRAB / BRAND).
8. Bot (src/lab.js): it jumps the brand's fire whatever he is doing. For the grab it walks out of the hand's reach during the tell, then rolls through as the hand comes.
   It leaves the oath ring or hops it, stands in a radiance gap, waits out the brand tell, and taps the warden's sweep inside the 0.2 s beat.
   The aegis and blood ward are raised inside the beat. OPEN0 counts his recoveries.

## Numbers (L23 campaign level, NORMAL, 2800 HP)
| run | knight | warden | pyro | all | fight s |
|---|---|---|---|---|---|
| batch81 before, WITH flasks (6 seeds) | 3/6 | 6/6 | 6/6 | 83% | 66-171 |
| **after, WITH flasks (12 seeds, final)** | **6/12** | **9/12** | **9/12** | **67%** | 59-161 (most 90-150) |
| after, DRY (human+dry, 6 seeds) | 1/6 | 4/6 | 3/6 | 44% | 67-151 |
| mash bot (boss) | 0/2 | 0/2 | 0/2 | 0/6 | DEAD 36-56 s, boss left 82-96% |
Intermediate 6-seed samples swung 56-83% on the same build (+-15%). The 12-seed final is the number to read. Mash rows were re-stamped level THEN boss:
the level mash bot died with all three heroes (docs/mash-bot.json).

## Checks run
node: tells (every mark agrees; grab/brand `!!`, delay/follow `!`), boss-read, blow-tags, comments, paladin-enrage (+ new asserts: the glint,
the 0.2 s beat, the follow-up through the shield, grab caught/hurled vs rolled/whiffed, brand jumped vs branded, phase three), node --check.
page (PORT 8793): mark-integrity MI_ONLY=closedhelm, 90 s (cut, delay, grab, bash, judge all posed + landed; brand/follow not reached in 90 s god-mode - covered by paladin-enrage),
boss-greed (green), mash-bot level + arena (0/6), textfit bestiary,hints (0 issues; 1 ERROR `bestiary tab1 #21 ... reading 'R'` is
PRE-EXISTING - same on a clean batch81 worktree). The full suite was not run (the machine was busy with batch81's).
Reds: none from this lane.

## QUESTIONS FOR DANIEL
1. **HOLY BRAND as a new phase three (under 30%)**, keeping RADIANCE and the OATH in phase two. Rec + built: yes (B5, one new move a phase).
   Alt: the brand replaces RADIANCE in phase two (radiance and judgement are both lit marks from above), with no phase three.
2. **Recoveries land whole (1x) from the front**, through his ward. The ward-break stays x2. Rec + built: keep. This is "a punishable recovery" without making
   the parry pointless.
3. **The follow-up pierces a held shield** (only a fresh guard on its own glint turns it). Rec + built: keep. Alt: blockable, at a big stamina cost.
4. **The grab hits a held guard sooner** (once its clock is under 3 s, if you turtle in his reach). Rec + built: keep. It's the anti-turtle.
5. **The knight trails** (6/12 vs 9/12), as on keyscore. Rec: leave it to the per-act lane (keyscore's Q1: give the shield a wall answer). Not built.
6. **The trial yard's beat stays 0.45 s**. Only the Crusader is 0.2. Rec + built: keep (the yard teaches the beat; the boss tests it).

## Pose-polish list (for a Sonnet pass on src/redraw/waymeet.js bakePaladinBoss; sheet: work/claude/crusader-sheet.png, tools/crusader-sheet.mjs)
- 22-26 GRAB: the sword "hung at the hip" is a 2-line scabbard. Draw a proper scabbard and hilt. Draw an open gauntlet with fingers (it's a blob now).
  Frame 24 (hold) wants the arm visibly up over the helm, plus a fist where the hero is held.
- 27 BRAND tell: the reversed blade reads thin against the tabard. Give both hands on the grip (the shield let down) and a lit outline on the blade.
- 28 BRAND strike: make the blade vanishing into the floor obvious (a crack or dust baked in), and the knees wider.
- 20/21 DELAYED overhead: push the coil further (a lower crouch, the back knee bent) so it's unmistakably not the cut at a glance.
- 14 / 17 anticipation frames: a held 2nd frame (2-3 held frames per the style guide) - now one frame each.
- 16 / 19 recoveries: add a bowed helm plus the shield arm dropping lower, so "open" reads at a glance.
- 29 / 30 follow-up: the backhand is close to the cut tell; angle the blade lower across the body.
- The old tells still use flat red rings/lines (the bash line, the leap ring, the oath ring, radiance columns): convert them to dithered floor decals per the style guide.
