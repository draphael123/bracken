# claude/bloodknight - THE BLOOD KNIGHT (opus, 10-20)

Base: live master 2a360cc5 (BATCH107). Brief: scratch/brief-bloodknight-1017.md sections 2-5 + the 10-17 / 10-19 lines (section 1, the ward-release parry
and the greatsword weight, was already live from claude/foepass - built on, not redone).

## WHAT CHANGED

One new module holds every number and pure rule: **src/blood-kit.js** (`BLOOD`). main.js binds it (hooks tagged `claude/bloodknight`).

| brief item | what is in the game now |
|---|---|
| 2 RENAME | Hero 'reaper' and boss 'bloodknight' are **THE BLOOD KNIGHT** - hero row + feat line, pick cards (HERO_SHORT + card names), bestiary, BEAST_SHORT, boss bar (`THE BLOOD KNIGHT  OPEN`), unlock line (`THE BLOOD KNIGHT CAN BE HAD IN THE SHOP`), trial (`THE BLOOD KNIGHT'S TRIAL`, "greatsword and blood"), What's New (new entry + the three old Death Knight lines). **Ids unchanged** ('reaper', 'bloodknight', the 'unburied' level, every skill id) - saves, hashes and rows hold. |
| 2 CRIMSON | Sprite palette (src/chars.js REAP_PAL): crimson helm lights (were green), dried-blood black plate, deeper red surcoat - the boss is baked from the same kit so he changes too. The up-air rise (poses + FX), the plunge (THE CULL shade + landing) and the grave burst are crimson now; the grave burst is a **BLOOD BURST** (crimson spikes and shockwave - no bone spikes, no risen hands). |
| 2 DRINK | Landed hits drink only through BLOOD DEBT (below): modest, capped, never above pre-hit. |
| 2 BLOOD PRICE | **DOWN+C** (on his knee): pays 10% max hp (never his last point) **onto the bar as debt**, blade BLOOD-EDGED x1.2 for 6 s, 1.2 s between prices. Pay, then win it back by hitting - or spend it on T4/T5. Free in the trial (shown, not taken). |
| 2 BLEED ON HEAVIES | Every heavy tier bleeds what it lands on (2-4 s; x2 stacks from T4). |
| 2 GEAR | OSSUARY MAIL -> **BLOOD MAIL** ("his own blood hardens over the plate"), THE REAPING -> **BLOODLETTING**; FX recoloured crimson. Heavy skill row renamed THE FIVE-TIER HEAVY; longHaft / LAID OPEN / MARKED IN BLOOD / THE RED VOLLEY descriptions follow the new kit (THE RED VOLLEY now fires off a landed EXSANGUINATE or BLOOD MOON). |
| 3 CROUCH (option 1) | **Corpse harvesting removed** (crouch-b.js harvest, its teach line, the bot's walk-to-body plan, the 45 s linger + red glow - the dead lie 24 s as normal). Crouch stays the low block (planted greatsword, read now `LOW GUARD`). **BLOOD SPIKE**: a low blow blocked within 0.22 s of the kneel starting = crimson spikes round the blade: 1.2x sword damage + 0.8 s stagger + knock (a boss/mini: 0.35 s, no knock - B15 untouched), 12 wind refund, **all debt reclaimed**, own clang + flash + `BLOOD SPIKE` read. First-crouch hint: "DOWN: A LOW GUARD. KNEEL AS IT LANDS: BLOOD SPIKE." |
| 4 BLOOD DEBT | A hit leaves 50% of what it took as a red segment past his health on the HUD bar; held 0.45 s, drained by 3 s; capped 25% max hp and at the health lost. Each landed blow reclaims 45% of its damage (min 1) into the segment, never above pre-hit. Any other heal fills the segment first. The debt does not drain while a heavy is wound (the blade holds the blood). Ward-release parry and Blood Spike reclaim ALL. T4/T5 SPEND it. No other passive heal: the drag's drink and the crescent's double drink-back are gone. Cleared on death. |
| 5 FIVE-TIER HEAVY | HOLD X, let go any time past T1: **REND** 0.3 s (x1.5 fast low cleave), **SUNDER** 0.6 s (x1.8 overhead, GUARD CRACKED / poise bite on a big one), **CRIMSON CRESCENT** 1.0 s (x2.0 + a travelling blood wave ~110 px, stops at walls), **EXSANGUINATE** 1.4 s (needs 6% debt; x2.4 x spend, a lunge driven with the live box that stops when the point goes in, impales), **BLOOD MOON** 1.9 s (needs 14% debt; x2.6 x spend, slam + geysers both sides 58 px that bleed all they hit). Spend = x(1 + 4 x spent/maxHp). Blade glow deepens each tier (white-hot at T5) with the knight's stage tick (+ a blood draw at T4/T5); `NEEDS BLOOD DEBT` when the hold is long enough but the debt is not. Auto at 2.5 s (best tier allowed). The heavy node's rank quickens the tiers 10% a point like the knight's. |

Trial (level.js trial_reaper): station texts follow the kit; a new BLOOD PRICE station (DOWN+C, shown not taken); the kneel station teaches the low guard + spike (any low turn counts); THE CULL station is THE BLOOD BURST.

Other: What's New list never draws half of a wrapped line at its top/bottom edge (src/whatsnew.js cont/more + drawWhatsNew) - the list growing made textfit see CLIPPED.

## CHECKS (PORT 8781, one headless Chrome at a time, RAM-gated after the coordinator's 10:28 note)

NEW: **blood-kit** (tools/blood-kit.mjs, registered in check.mjs): pure debt/tier/price rules + in the page: real blow -> debt = 50% of loss, drains to 0; cuts reclaim, never above pre-hit; no debt = no heal; T1/T2/T3 by hold (each bleeds), T3 wave, T4 refused with no debt, T4/T5 on debt spend it, auto-fire; DOWN+C price = 10 hp as debt + edge, no ward; kneel-on-the-beat = BLOOD SPIKE (blocked, foe hurt, all debt back), long kneel = plain guard; no harvest; names. GREEN.

Moved to the approved design (each assertion of the old kit replaced by its new rule, said in the file): **dk2** (held price/crescent/drink-back asserts removed - blood-kit owns them; the drag must NOT heal; linger 24 s), **crouch-b** (the harvest asserts inverted: a body gives nothing; bot walks to no body), **crouch-hint** (spikeTold flag). hint-shown: the renamed shop line in its silent baseline, the harvest's routed 'BLOOD' removed.

GREEN: blood-kit, dk2, crouch-b, crouch-hint, foe-pass, foe-pass-page (the reaper yard's ward release), hero-roster, save-safety, deathknight-unlock, talents, progression, skill-icons, whatsnew, unburied, unburied-fights, boss-openings, boss-greed, weak-bosses, duck, hint-shown, reaper-input, commitment, verb-matrix, riposte, ability-poses, juice, store, hero-pass, attack-animation, hero-trials, comments, modulepreload,
**textfit --strict** (hints, bestiary, store, tree, menu, hud, pick, opening, press, title, mapcard, death, results, card, practice, bossjump, bossselect, plates, bossfix, soundtest, whatsnew; + trial): 0 everywhere after the What's New fix.

Flaky under PC load (memguard was killing headless Chrome at 10:26-10:34): textfit 'card' scope, commitment, verb-matrix and riposte timed out once each with no verdict, then passed on rerun.

## RATES
Boss the Blood Knight appears in - THE UNBURIED FIELD (`unburied`, L33), boss-rates practiced, profile human, kit flasks, 12 seeds, jobs 1:

| | knight | warden | pyro | k/w/p | BLOOD KNIGHT (hero) |
|---|---|---|---|---|---|
| lane | 2/12 | 12/12 | 9/12 | **23/36 = 64% (in band 60-70)** | 4/12 |
| base 2a360cc5 (same run, temp worktree, removed) | 2/12 | 12/12 | 9/12 | 23/36 = 64% | 3/12 |

The boss row is identical (this lane changes only his colours), so the band holds; KNIGHT at 2/12 is the standing gap (dk2tune had him 2/8) - not this lane's, reported. The hero with the new kit: 3/12 -> 4/12 against his own mirror (BLOOD DEBT in place of the drag drink + harvest is about even for the bot, which never uses BLOOD PRICE, T4/T5 or the spike - Q7).

Act I pilot - tools/level-walk.mjs stockade (campaign L3, human+first, 2 seeds):

| | deaths (haz/elite) | arrive% mean/min | kills | verdict |
|---|---|---|---|---|
| reaper lane | 1.5 (1.0/0) | 58 / 10 | 54 | on target |
| reaper base | 0.0 | 50 / 14 | 42 | MISS (deaths 0 < 0.5) |
| knight (both) | 0.5 (0.5/0) | 49 / 9 | 34 | on target |

Two seeds is noise-level; the lane reaper kills more (the tiers) and arrives a little healthier (debt reclaimed); his extra deaths are hazard deaths.

## REDS
None open that are mine. Not run: the full suite (coordinator's nightly), mash-gate / level rows (no lever here touches a foe, level or boss number).

## QUESTIONS FOR DANIEL (rec first; what I built)

1. **BLOOD PRICE's key.** REC + BUILT: DOWN+C (on his knee - the crouch is his blood stance; C alone stays the ward). ALT: F on its own (F is SUMMON SKELETON once the Gravelord tree has it) or UP+C.
2. **THE SUMMONING TREE (GRAVELORD).** The brief says "drop the bone/summoning flavour". REC: keep the mechanics, reflavour skeletons as crimson BLOOD THRALLS (art + names) in the art lane, rename the tree THE RED HOST. BUILT: only Ossuary Mail / The Reaping renamed and the bone/green FX gone; SUMMON SKELETON, GRAVE TIDE, GRAVE CHAIN, UNHOLY GROUND and the tree name are unchanged (renaming ~14 skills touches skill-icons/talents baselines - one call for you).
3. **NUMBERS.** debt 50% of a hit / 3 s / cap 25% / reclaim 45% of a landed blow; price 10% for x1.2 over 6 s; T4 needs 6% debt, T5 14%; spend x(1 + 4 x spent/max). REC + BUILT as listed; tune after you play him.
4. **WARD BLOOD AS DEBT.** The ward's blood cost lands as ordinary hp loss, so half of it becomes debt like any hit (and the nova's heal fills it first). REC + BUILT: yes. ALT: the full ward cost as debt (stronger with ward-release parries).
5. **BLOOD SPIKE ON A BOSS.** Damage + a short 0.35 s stagger, no knock, B15 resist untouched. REC + BUILT.
6. **NAMES KEPT.** REAPER'S RHYTHM (X) and GRAVE KNEEL (pose key; the read is now LOW GUARD) kept; the bot-facing 'reaper' id everywhere. REC: rename REAPER'S RHYTHM to THE RED RHYTHM with the art lane. Not built.
7. **THE BOT** does not use BLOOD PRICE, T4/T5 or the spike timing (its heavy logic excluded the reaper before this lane too), so the rates below are the hero's floor with the new sustain, not his ceiling. REC: a sonnet lane teaches the lab hands the price + tiers if you want him measured with the whole kit.

## ART NOTES (for the crimson art sonnet lane)

- Full crimson pass on bakeReaper (src/chars.js): plate, pauldrons, horns, surcoat trim; the palette swap here is a stopgap (REAP_PAL b/B/r/y). The boss uses the same bake (SPR.bloodknight) - check him at 1.5x in the Unburied Field.
- Tier poses (B16: own windup + release each). main.js bkWindPose/bkReleasePose pick `rendWind/rend`, `sunderWind/sunder`, `crescentWind/crescent`, `exsWind/exsanguinate`, `moonWind/bloodMoon` when drawn (3 beats each release: anticipation, strike, extended); until then: wind = priceHold beats, release = atkB (REND), atkC (SUNDER, BLOOD MOON), crescent (T3), dashAtk (EXSANGUINATE).
- BLOOD SPIKE pose: key `bloodSpike` (2 beats, crouch-b.js pose) - kneeling, blade planted, spikes erupting round it; today it shows graveKneel beat 3.
- BLOOD PRICE pose: today the kneel's third beat (P.dkKneelHit) - a palm drawn along the blade would read better (kitPose key 'price').
- The blade's per-tier glow (drawPriceBlade) and the T3 wave (drawBkWaves) are procedural greybox - a crimson wave sprite and a geyser for BLOOD MOON (dkGraves draw with b.reach 58) want art.
- HUD BLOOD DEBT segment (drawDebt): dark red + pulsing edge; check it reads against the low-health flash. Co-op player plates (line ~1717) do not draw the debt yet.
- Skeleton/summon art is still bone/green (Q2).
- Blood Mail (kitPose 'bone') and Bloodletting (kitPose 'reap') poses still describe bone plates / a green crescent in their comments and draw with the old glow colours where hard-coded in chars.js ~2150-2170.
