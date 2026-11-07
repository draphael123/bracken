# claude/frogking2 (11-07) - FROG KING 2: THE BULLFROG KING rework (opus lane)

Spec: scratch/priority-1016.md '!! 11-07 08:23 Daniel APPROVED FROG KING 2' (and the 08:21 playtest line above it).
Branch: claude/frogking2. The old 10-21 claude/frogking2 branch was already fully merged into master, so it was fast-forwarded to master 95bc267a4 (no history lost) and this work sits on top.
Worktree: C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-frogking2. NOT merged, NOT deployed. No browsers were run (Daniel was playtesting on this PC).

## What I found first (this changes how to read the tune)
- **Outside his openings the King took x0.05, not x1.** `frog` was on the global boss chip (src/boss-greed.js OPEN_RULE, not in chipBy or FULL_DAMAGE), so a hero's sword on his pad did a twentieth. The header's "always hittable on his pad" was only true for non-hero damage, which is what tools/firsthour measures (`hurtEnemy` with no blow). This is probably the real reason for "no obvious way to make him vulnerable".
- The tongue was spawned once at `e.x + face*22` **at the hero's height** (`P.y - 8`) and never moved after that. Any hero who was not level with his mouth (in the water, on a pad lower down, or in the air) saw a pink bar floating off him.

## Changes (numbers live in src/frog-king.js FK)
**(a) THE BELLOW, his break.** It is a new told move: a yellow `!`, his croak, the words 'HIS THROAT SWELLS', and its own windup pose (frame 20: the sac swells past his chin and glows cream-gold with a white core, orange veins and light thrown off it). FCA sacFx adds a pulsing gold halo that speeds up as the sac fills.
- **The break:** three blows on the sac (from his face side, at least 0.1 s apart) during `tell` (1.6 s in P1, 1.35 s in P2) BURST it. Each blow flashes the sac white, adds a crack and lights one of three pips over it ('THE SAC 1/3', '2/3').
- **The burst:** 'THE SAC BURSTS', a flash, shards, gold rings, a hitstop and a shake. He flops **BELLY-UP for 3.0 s at x2** (frame 22: turned over, legs kicking, the sac in rags, stars, the crown under his head).
- **Break cap:** the break pays at most `bellow.take` = 12% of him (frogTake). Dazed and winded keep their 4.5% cap. 'HE SHAKES IT OFF' and the per-hit spill-over logic are unchanged, they just read the per-mode cap.
- **Unburst:** frame 21 (slammed down, mouth wide, gold rings) plays with SFX.bellow and 'HE BELLOWS'. A **croak ring** runs out both ways along the ground (waves with `bellow`, 150 px/s, 1.8 s, 16 dmg). You jump it or shield it. If it hits you it knocks you back (vx 190, vy -170); a shielded ring only pushes you 70.
- **How often:** bellow is in both move pools, and he bellows at least every **12 s (10 s in P2)**.
- **Damage floor:** outside openings a hero's blade now lands at **x0.6** (`GREED.chipBy.frog = 0.6`, was x0.05). In the air it is still 0.4, so it never goes below the 0.4 floor. Greed reprisal is unchanged.
- **Boss-read word** on a chipped blow: 'IN THE AIR' during a leap, 'HIT THE SAC' while the sac is up, 'BURST HIS SAC' otherwise.
- **Hint card rewritten** (src/first-cards.js), 9 of 12 lines: "WHEN HIS THROAT SAC GLOWS, HIT THE SAC THREE TIMES: IT BURSTS AND HE FLOPS BELLY-UP. CUT HIM THEN." plus the ring, the tongue and the flies. tools/first-cards CLAIMS now checks BELLOW, sac, BELLY-UP and stamina against frog-king.js.

**(b) Hoppers called from the water** (frogCallAdds):
- **Count:** 2 per unburst bellow (3 in P2), at most 4 alive. Each full extra seat adds +1 to both numbers (an AI partner is half a seat, so +0). Hard cap 6.
- **Spawn:** they leap out of the lane nearest the hero onto the royal pad nearest him. HP is HOP x coopMul.
- **On the court:** they ride the court's lily pads like a raft. A leaf going under drops them in the water, where they drown.
- **No farming:** they have no xpKey and no drops (the Hornet Queen drone precedent), so no XP or salt. They die with him (queenDies, `e.frogAdd`).
- **AI:** they use the ordinary told hopper AI (squat, `!`, leap), not the drones' untold darts.

**(c) Flies drain stamina.**
- **Drain:** while the cloud is within 16 px of your chest you lose **20 stamina/s**. Regen is held (stDelay) and the bar flickers red (stFlash).
- **Feedback:** 'THE FLIES SAP YOUR STAMINA' is shown once per swarm.
- **Getting out:** you can walk out of the cloud, because it trails 0.5 s behind you. The self-bite daze lure is unchanged.

**(d) Tongue fixed to his mouth.**
- **Mouth table:** src/redraw/frogking.js now records each frame's lip point (set.mouth, from the same X/Y/tilt/rotation that draws the frame). Frames 7, 8 and 17 use explicit lip points.
- **Every frame:** main.js frogMouth(e) re-roots the tongue at his lips in his current pose. His facing is locked to the tongue while it is out, and the tongue is dropped the moment he leaves tongue/snap.
- **Drawing:** it runs from his lips toward the aimed height (a straight line at full reach) with a sag of up to 3 px. It is pink, 4 px thick (5 at the root) with a dark edge, a lit top, ribs and glints, a root tucked into his maw, and a sticky bulb at the tip.
- **Hit test:** it uses the same curve (FCA.tongueYAt), so what you see is what hits you.

**(e) More leaps:**
- quota 0.10/0.10 -> **0.08/0.07** of him per pad.
- stay (hero on his pad) 20/16 -> **12/9 s**.
- New roam timer: **13 s (10 s in P2)** on one pad and he leaps on even if nobody is touching him (it was never before).
- A leap cycle is still 0.65 tell + 1.2 air + 0.5 land, so it stays told and does not get frantic.

**(f)** src/level.js: removed the thorn goblin (338,17) and the yellow hopper (342,17) beside the Marsh Wood shrine (344). The crate and the exam are unchanged.

**Smaller changes:**
- The bestiary entry is rewritten to describe the sac.
- The bot (frogPlan) treats bellowTell and bellyUp as openings to cut, and it already jumps the ring (any wave).
- Belly-up is in FROG_OPEN, so boss-greed treats it as open.

## Tune, by arithmetic (n=6 OWED)
- **Old reference:** 900 hp at ~67% built (bosstune 11-04). All of that damage came from openings, because the rest was chipped to x0.05.
- **What the new changes add for the hero:**
  - x0.6 off-opening blows: about +3 hp/s.
  - Breaks: at ~50% burst success over ~7 bellows in an ~80 s fight, about 3.5 breaks x ~100 hp.
- **What they cost the hero:**
  - Bellow takes a sixth of his picks, so dazes and flops come about 1/6 less often.
  - Pressure: hoppers, the ring, the flies' drain, and about 10% less time on his pad because he leaps more.
- **Net:** the bar moves about 1.5x faster than at 900, so **HP 900 -> 1100** keeps the fight around 70-80 s with the extra pressure. Break cap 0.12 (132 hp, which ~6 hits at x2 just about fill in 3 s). Ring damage 16.
- **Levers for the browser tune:** FK.hp first, then bellow.take / bellow.every / adds.

## Checks run (node only, all exit 0)
- `node --check` on every touched file.
- tools/first-cards.mjs ok (widest line 264 of 266 px, 9 of 12 lines).
- tools/marsh2-beats.mjs ok.
- tools/marsh-exam.mjs ok.
- tools/demo-cut.mjs all green.
- tools/level-quality.mjs: every gated level clears the bar.
- **Art:** rendered in Node with tools/_fk2-sheet.mjs (node-canvas plus source-atop/rotate shims) to scratch/lane-reports/frogking2b-poses.png (frames 7, 8, 20, 21, 22, P1 and P2 skins).

## OWED
- **Browser checks:** tools/boss-greed.mjs (frog row now at chipBy 0.6), tools/firsthour.mjs, mark-integrity (bellow tell/pose/sound), and textfit for the new words.
- **Restamp:** the marsh level hash moved. `node tools/restamp.mjs --level marsh` shows pilot, curve and mash rows stale; it needs a browser.
- **Browser stills:** sac glowing with 1-2 cracks, the burst, belly-up, the ring, hoppers landing, and the tongue out to a hero in the water and on a lower pad.
- **n=6 boss-rates** (marsh, built, kit flasks) to the 60-70% band. The bot's sac play is untested.
- **Full suite:** not run (40 min; the gate owns it).

## Questions for Daniel (my recommendation was built)
1. **0.6x off-opening.** He was effectively at x0.05 before. REC: keep 0.6 as specified. It is the biggest single change to the tune, so expect the n=6 to move HP. Built: 0.6.
2. **Break worth.** The cap is 12% per burst (vs 4.5% for a daze). REC: keep. If testers say the burst feels cut short, raise it to 0.15. Built: 0.12.
3. **Sac hits.** They count only from his face side. He always turns to face you, so in practice any blow counts. REC: keep. Built.
4. **Hoppers.** They drown if they leap after you onto a sinking leaf. REC: keep, it reads as the marsh's rule biting his own court. Built.
5. **Belly-up pose.** It is his flat pose turned over, with legs and rags drawn on (Node render only). REC: an art lane polishes it after the browser stills. Built: v1.
