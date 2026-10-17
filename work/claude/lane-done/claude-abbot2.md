# claude/abbot2: THE FALSE ABBOT 2 - the bell rope, false light, and a rite you can spoil

Brief: `scratch/lane-abbot2-1015.md` (Daniel 10-15). Base: origin/master 7ade0605 (BATCH96).

## What changed
- **THE BELL ROPE replaces THE PROCESSION** (`src/false-abbot.js`). The tell: the rope jerks, its bell clangs (SFX tollBell), and a red ring marks the spot you are standing on (`!!`, 0.8 s). He leaps, swings across the roof (0.8 s, 56 px up, on one of three belfry ropes, `ABBOT_ROPES` in main.js), and lands on the mark with a CENSER SLAM (24, unblockable). Then he recovers for 0.7 s. He always swings TOWARD you, 90-380 px, and lands only between the two thorn beds. So standing just past the great bell still baits him under it. While he is on the rope he is NOT under the bell. He uses the rope when you are far (more than 150 px) or when the order calls for it. Walking is only for short steps now.
- **FALSE LIGHT** (new ranged move, `gleamTell`, yellow `!`, 0.8 s). He raises the censer and it flares a sickly gold. A mark follows you until he throws. The lob takes 0.8 s and bursts on the marked spot (16 damage, blockable). Move off the mark, or face him with a shield. (The mode is called `gleam` because `lightTell` is already used by an inline foe in the marks table.)
- **THE RITE is a kneeling prayer.** He kneels in a ring of candles for 2.4 s, and a SANCTUS BELL on a post BEHIND him glows. He does not turn while kneeling, so you go round him or plunge onto him. Left alone, the prayer heals him **8%** (was 4%) and keeps the ward and the congregation blessing. There are three ways to spoil it: strike the sanctus bell (`updateMonkProps`), PLUNGE on him (`wardedDamage`), or stagger him (the old way, kept). A spoiled rite means "RITE SPOILED", no heal, no ward, a 1.2 s stagger, and **no new rite for 9 s**, so he fights unwarded. After the bell's window he also waits 4 s before he can kneel again.
- **B15/B10:** the ward was x0.2, below the floor. It is now **x0.4**, and every warded blow clanks with WARDED (`BR.turned`).
- **His kit is the threat, not his congregation:** 2 adds in phase one (3 in phase two, every 7.5 s), and only 25% of them are archers (was 3 adds, 40% archers). The probe showed the knight was dying to arrows and sprigs.
- **Numbers:** hp 1900 -> **3000**; his own blows BOSS_HIT 1.5 -> **1.35**.
- **Art (greybox, B16):** 21 frames, up from 18. The procession frames are gone. New frames: 8 rope tell, 9 swinging, 10 slam, 13 prayer kneel, 18 false light tell, 19 false light throw, 20 spoiled. The ropes, mark rings, candles, sanctus post and orb are drawn in canvas (`drawAbbotRopes`, `drawFalseAbbot`). `docs/false-abbot.png` was re-rendered.
- **Bot (`src/lab.js`):** it steps off the rope mark, moving away from where he leapt, so the bait holds. It steps off the false light's mark, or blocks if shielded. While he prays, it goes behind him and strikes the sanctus bell. It no longer rings the bell while he is mid-swing. If an add is standing on top of it, it steps off before cutting. The small-foe ledger skips swings aimed at the sanctus.
- Also updated: the bell hint text, the bestiary text, the marks (BY_HAND, regenerated with `tells.mjs --write`), and the DMG keys (abbotSlam / abbotLight).
- **Tests:** `tools/false-abbot.mjs` was rewritten for the new design (a stated design change, not a weakened test). The procession bait checks are now rope bait checks: he swings toward you, lands on the mark, and standing past the bell puts him under it. The red/yellow marks, false light, the 8% heal, the ward at 0.4 or more, the sanctus/plunge/stagger spoils and their cooldown, and the B16 poses are all checked. The "bell is worth double" check holds at 39 s vs 181 s. `tools/false-abbot-art.mjs` now checks `ABBOT_FRAMES`.

## Rates (boss-rates spire, practiced, campaign L9)
| run | hp | knight | warden | pyro | total |
|---|---|---|---|---|---|
| master baseline, with flasks, n=12 | 1900 | 1/4 | 4/4 | 4/4 | 75% |
| **final, with flasks, 12 seeds** | **3000** | **3/12** | **11/12** | **8/11** | **63% in band** |
| dry (human+dry), 12 seeds | 3050 | 2/12 | 5/12 | 4/12 | 31% |
| mash bot | 3050 | 0/2 | 0/2 | 0/2 | 0/6 (stamped docs/mash-bot.json) |

Fight lengths (final run): knight 66-126 s, warden 86-109 s, pyro 57-74 s. **The pyro is under the 90-150 s target.** Other runs, all with flasks n=36: hp 2850 = 72%, 2950 = 71%, 3050 = 61% (58% after the bot fix). The dry run and the mash run were done at hp 3050, before the final hp 3000 and the bot step-off fix. The mash bot dealt the boss 0-1% damage, so 0/6 holds.

## Checks
Green: false-abbot, false-abbot-art, tells, untold-told, boss-read, boss-greed, belfry, gob-priest, small-adds (after the bot fix: worst row 14%), boss-fight-end, weak-bosses, damage-caps, mash-gate, touch, flip-actions, mark-integrity (MI_ONLY=abbot), blow-tags, ability-poses, comments.

Red, not from this lane:
- **no-hidden-hits:** canal legging tunnel, an archer/watchman shooting from off screen. Not the abbot.
- **mark-integrity (full run):** `undeadmage|markTell` PHANTOM POSE. Not the abbot.

Neither was checked against master. The full suite was not run.

## QUESTIONS FOR DANIEL (rec first; built = the rec)
1. **The knight is at 3/12 while the warden is at 11/12.** Rec: leave it to the sonnet re-tune or a knight-shield bot pass. The knight's losses come from the congregation and the coals, not the Abbot's own moves (this was already in morning-questions #4). Built: fewer archers. No hero is at 0.
2. **The pyro wins in about 60 s**, below the 90-150 s target. Rec: accept for now. Her burst in the bell's window is the cause. A later fix could cap how much of his health one window can take (like the Coffin King's cap). Not built.
3. **The ward went from x0.2 to x0.4 (B15).** Rec: keep it. It is told with WARDED, and the bell is still worth about five times the fight time without it (39 s vs 181 s in the harness). Built.

## Art list for the sonnet pass
- Frame 8 (rope tell): the raised arms read as a staff through the mitre. Show both hands reaching for a rope.
- Frame 9 (swinging): it still reads as standing. He should hang from his hands with the hem lifted and the legs tucked, and the grip should show where the world rope meets his hands (about 52 px above his feet).
- Frames 10 (slam), 13 (prayer kneel), 18/19 (false light), 20 (spoiled): polish and outline.
- Belfry ropes (`drawAbbotRopes`): replace the plain lines with level art (a sally and tail, small bells on the beam, maybe a deco kind) so they show even when he is dead.
- Sanctus bell post, candle ring, false-light orb and burst (it only has dust now, it needs a sickly-gold flash), and the slam ring: all canvas primitives at the moment.
- A sanctus-bell strike sound of its own (it uses mummerBell now).
