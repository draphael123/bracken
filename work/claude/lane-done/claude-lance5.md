# claude/lance5 - THE QUEEN'S LANCE 5 (boss rework, opus; spec = scratch/priority-1016.md '!! 10-31 18:36')

Branch `claude/lance5` off master 416af6c2 (BATCH133). Not merged, not deployed. **Level hash unchanged** (no tile / ent edit), so no level restamps; the mash boss row is restamped.

## What changed
1. **No backward charge.** In his guard he no longer snaps round. If you are behind him, or the bell he answers is behind him, he goes into a **PIVOT**: planted for 0.3 s with a stamp ring, dust and a clank, and only then turns (`LANCE4.pivot`). His tells now hold the facing they started with: the couch, thrust, sweep, volley, wall and pennant no longer re-aim mid-tell. So a charge always goes the way he faced, and rolling behind him during a tell makes it whiff. `lanceRest` no longer turns him either.
2. **RISING SKEWER** (P2+, MEDIUM). It fires when you are over him (|dx| < 24, 30-124 px up: a rope rider, a lookout, a jump).
   - Tell: a red `!!`, the word RISING SKEWER, and a red dashed column drawn straight up over him for 0.6 s.
   - Strike: 0.22 s, DMG.lanceSkewer 12, unblockable. It knocks you off a rope.
   - After a whiff he spends 0.9 s looking up (0.5 s after a hit). That is not an opening, but his helm is free for a drop (HELM RUNG). That makes riding a zip a timing choice: ride after the skewer, not into it.
3. **P2 = THE STORM ARRIVES** (it replaces HE STOPS THE BELLS).
   - Rain driven slant on the wind, with lightning that waits while a tell is on screen.
   - A darker sky: `arena.phaseTints`, drawing only, not in the level hash.
   - The rain ambient bed, and his track lifted a whole tone (`music.storm()` in src/audio.js, 200-cent detune on the loop copies).
   - The wind tears his pennant away: words and a burst of purple/gold cloth (the sprite still shows it: art need).
   - The pennant call becomes THE GATEHOUSE (same ballista / oil / stones).
4. **Knockback.** In P1 and P2 a landed hero blow pushes him about 8 px. Not while he is braced, pinned or in the air (`LANCE4.kb`, `lanceKnock`).
5. **Gaps with teeth + the UPDRAFT.**
   - The collapsing ledges stay. Charge cracks are now 3 planks wide, so his 26-px box can drop through a gap.
   - **Him:** knocked or gusted into a gap, he lands on the gorge's teeth for 5% of max hp. The damage lands whole and can never be his last hp. The UPDRAFT then lifts him out and throws him onto the nearer lip **TOSSED** (2.2 s, open x1.6). That opening is given at most once per 5 s; otherwise he just lands. A phase turn mid-fall is honoured on landing.
   - **You:** falling into a gap, the teeth bite (fallPct 12%, `spare`: never a death) and the updraft lifts you straight up past the deck and hops you onto the lip. There is no hand-back teleport.
   - Rising wisps are drawn in every gap while the storm blows.
6. **Bells + zips matter.**
   - P1 is unchanged: he answers the bell with a charge and the portcullis pins him or he overruns into it.
   - **P2:** a rung tower bell tolls 3 times (wind arrows run along the deck the way it will blow), then sends a **STORM GUST**. The gust takes him off his feet (**BUFFETED**, 1.6 s, open x1.5) and drives him toward the nearest gap at 165 px/s. Over the gap he falls: teeth, updraft, TOSSED. With no gap torn yet, it drives him toward the nearest span middle (just the buffeted opening). The bell winds back in 10 s.
   - **P3:** the tower bells are hauled up; the great bell's fight is unchanged.
   - Zips are unchanged: the way across the P2 gaps, the helm plunge (rung), and the post whip.
7. **Lighter on foot.**
   - `LANCE4.footMul` 0.88 on hero blows.
   - The devices (bars, teeth) now bypass heroDmg / footMul (`lanceHurtDev`) and land whole.
   - Resist floor unchanged: shield front x0.4, shieldless x0.7, openings 1.5-2x.
8. Bestiary text rewritten. The bot (src/lab.js lanceDuty) rings a nearby tower bell in P2 for the gust, then falls back to posts. Greybox poses come from the existing sheet (cap 120): pivot = turn, skewer = pennantTell / vaultUp, buffeted / tossed = stagger, updraft = whipped.
- Untouched: P3 (fallback, great bell pin x2, shield split, stones) and the death slam -> THE KITCHEN GATE (lance4.mjs asserts both).

## Numbers (final)
- EHP.lance 4850 -> **4650**
- LANCE4.heroDmg {knight 1.15 -> **1.3**, warden 1.05 -> **1.04**, pyro 0.65 -> **0.71**}, times footMul 0.88 (net k 1.14 / w 0.92 / p 0.62)
- DUEL_HERO.lance pyro 1.55 -> **1.42** (knight 0.85, warden 1.3 kept)

## Boss rates (boss-rates storm --ways=practiced --profile=human, flasks kit, L18)
| setting | n | knight | warden | pyro | all |
|---|---|---|---|---|---|
| first build (lance4 numbers + footMul) | 36 | 4/12 | 9/12 | 5/12 | 50% |
| heroDmg k1.32 w1.0 p0.76, DUEL p1.42 | 35 | 7/11 | 6/12 | 6/12 | 54% |
| + HP 4500 | 36 | 11/12 | 7/12 | 7/12 | 69% |
| k1.2 w1.06 p0.8 (s1-12 / s13-24) | 36+36 | 7/12, 10/12 | 7/12, 9/12 | 9/12, 12/12 | 64% / 86% |
| HP 4650, p0.72 | 72 | 11/24 | 18/24 | 18/24 | 65% |
| k1.3 w1.0 p0.68 | 71 | 15/23 | 12/24 | 10/24 | 52% |
| **FINAL k1.3 w1.04 p0.71, HP 4650** | **72** | **15/24 = 63%** | **16/24 = 67%** | **14/24 = 58%** | **45/72 = 63%, in band** |

- FINAL wins: 86-167 s, median 120 s, 39 of 45 within 90-150 s.
- Steep per-hero cliffs: warden 1.0 -> 1.06 moved 50% -> 75%, pyro 0.68 -> 0.72 moved 42% -> 75%. The seed-to-seed spread is large (the same build gave 64% on seeds 1-12 and 86% on seeds 13-24). Pyro sits at 58%, at the edge of the band and inside the noise.
- Mash (`mash-bot storm --arena-only --write`): **0/6**, dead in 24-36 s with the boss at 96-99%. The row is restamped (docs/mash-bot.json, storm row only).

## Checks
- **Node:** lance4 node part, tells (the skewer is marked `!!`), answer-tags, boss-read, combat-feel, goblin-lint, dangling-paths, one-new-foe, stormhold4, watchtowers: all green.
- **Page** (one browser at a time, free RAM 5.0-7.2 GB; GATE-RUNNING.flag was present):
  - **lance4: GREEN**, including the new rows: pivot 15 frames before he faces you; charge forward; kb 13 px; P2 storm with rain + torn pennant + bells still live; gust -> buffeted -> updraft -> tossed 2.2 s open on the deck; hero falls 217 px, bitten 12, lifted onto the lip alive; skewer told + hits; P3 towers hauled up; great bell + split + stones + slam.
  - rule-openings GREEN, hint-shown GREEN, mark-integrity MI_ONLY=lance GREEN, textfit bestiary+hints --strict GREEN.
  - boss-openings: GREEN on the third try. The first try was a harness page crash (Inspector.targetCrashed); the second had no clean read.
- Restamps: mash boss row only. Level hash unchanged, so no pilot / curve / pixels / campaign-xp restamp. tools/check.mjs was not run (as instructed).
- Not eyeballed in a screenshot: the storm look (the art lane's job).

## ART NEEDS (LANCE 5 ART, sonnet)
- **Storm sky:** clouds over the castle and a lightning silhouette in the backdrop. Today it is the tint veil plus the shared rain.
- **Rain** fine as shared drops. Maybe a wind-sheet layer.
- **Spikes** under the gaps: the gorge's teeth are generic SPIKE tiles 13 rows down. They want rock teeth with storm spray.
- **Updraft:** a rising column in each gap (today: pale streaks), plus a lift pose for the hero (generic air today).
- **Gust:** a told wind front along the deck (today: arrows, then streaks), dust or rain sheets in the gust direction, and a bell-rope sway.
- **Rising skewer pose set:** a braced crouch with the lance vertical (tell, 2), an upward thrust with smear (release), and a looking-up recovery (2). Greybox uses pennantTell / vaultUp / thrustRec.
- **Pivot:** a 2-frame plant-and-turn with the pennant (or bare shaft) swing. Greybox uses 'turn'.
- **Pennant torn:** a P2+ pennant-less variant of the sheet. The 120-frame cap means either a separate set or banner drawn at runtime. Also a better cloth-tear FX.
- **Buffeted / tossed / updraft** poses: greybox stagger and whipped.
- **Music:** the storm currently pitches his file track +2 semitones. A real storm variant or a second CC0 track is Daniel's pick.

## QUESTIONS FOR DANIEL (rec built)
1. **Skewer phases.** REC (built): P2+ only, so P1 lookouts stay safe for the bell skill shot. ALT: from P1 too.
2. **Pivot scope.** REC (built): every turn in his guard is a told 0.3 s pivot, and all tells keep their facing (getting behind him pays). ALT: pivot only before charges (closer to the old feel, harder).
3. **P2 bells.** REC (built): a gust only, with no portcullis drop or charge answer in P2, plus a buffeted opening even when no gap is torn. ALT: the gust only when a gap exists.
4. **P3 tower bells.** REC (built): hauled up (P3 is the great bell). ALT: gusts in P3 too (he would be shoved off his gate).
5. **Storm music.** REC (built): his own track a tone higher plus the rain bed. ALT: a separate storm track (needs a CC0 pick and download).
6. **Pennant calls after the storm.** REC (built): kept, worded THE GATEHOUSE. ALT: none in P2 (an easier P2).
7. **The 5 s tossed limit.** REC (built): the updraft always lifts him, but TOSSED (the opening) at most every 5 s. ALT: always open.
