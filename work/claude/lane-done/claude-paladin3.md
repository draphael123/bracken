# claude/paladin3 - PALADIN 3: CONVICTION, THE HALLOWED AURA, VERDICT, HEAVEN'S ARC, THE GUARD (Opus kit, 10-15; Daniel wants it live today for a playthrough)

Base: origin/master c33c3204 (BATCH93). Brief: scratch/brief-paladin3-1014.md. Port 8931. Greybox where art is needed (the Sonnet art lane follows; list below).

## WHAT IS BUILT (src/main.js, src/holy-ground.js, src/lab.js, src/level.js, src/controls.js)
| Input | Paladin 2 | Paladin 3 |
|---|---|---|
| the meter | the LIGHT bar 0-100 | **CONVICTION: 5 pips** (the same store underneath: HG.conv.pip = 20 Light a pip, so shrines, kneeling at holy lights, MARTYR, BEACON, the church hooks keep working) |
| earned by | blows landing, the aegis turning (+5), a parry (+10) | blows landing (unchanged), **a BLOCK +1 pip**, **a PERFECT GUARD (aegis on the beat) +2 pips + a HOLY FLASH** that staggers the attacker (bosses: the parry's own opening) |
| tap C | plant / move the circle; in it EMPOWER or JUDGEMENT | **by tier**: 1-2 pips = **SMITE** (1: a quick holy strike in front, x1.6), 3-4 = **RADIANCE** (3: a burst all round him, r 56), 5 = **SUNFALL** (all: the old Judgement, renamed) |
| UP + C | the hammer throw (25 Light) | the HAMMER THROW, **3 pips** (too few: nothing, told 'THROW: 3 CONVICTION') |
| holy ground | a circle planted with C, 9 s | the **HALLOWED AURA**: every spend lights it at his feet and it **TRAVELS WITH HIM** for 2 s + 0.8 s a pip spent (+1.5 s / +6 px per HALLOWED GROUND rank); same mend / burn / x1.3 / partner aegis. The planted circle and the plunge's free plant are gone |
| hold X | the overhead (SMITE in the circle) | **VERDICT**: a gold SIGIL on the nearest foe ahead, one more every 0.5 s up to 4 (110 px, through foes, not through walls); release = light strikes every marked foe at once (swordDmg x heavyMul x1.15, tagged HEAVY), no hammer swing; nothing marked = a strike just ahead. Held up to 2.4 s, then it goes |
| up + X in the air | the air up-slash | **HEAVEN'S ARC**: a golden ring, TWO hits (the hit set clears at atk 0.09), a slight float. (Up + X in the first 0.18 s of a jump is still the rising cut, as for every hero: up is a jump key) |
| hold C | AEGIS | AEGIS, and **BULWARK ADVANCE**: aegis held + pressing ahead = he walks behind it at 26 px/s and SHOVES: a common foe is knocked (into hazards too - the knock rules), an ELITE only staggers back a little (never knocked into a hazard by it), a boss or mini is never moved |

- Hitboxes: unchanged (the maul's). The WAR HAMMER is ART ONLY for now - see the art list; when it is drawn ~70% of the maul, the swing box should shrink with it (state then).
- Names: CONSECRATE / JUDGEMENT / EMPOWER are gone from what he shows. SUNFALL (5), RADIANCE (3), SMITE (1), VERDICT (hold X), HEAVEN'S ARC, HALLOWED AURA. (Talent ids kept for saves; their card words were not WoW names.)
- The yard (trial_paladin) teaches the tiers: SMITE (filled 1), RADIANCE (filled 3), the HAMMER (3), VERDICT, SUNFALL (filled 5). Hero card, pick line, controls card, practice line reworded.
- The lab bot (src/lab.js palHallow) spends Conviction: SUNFALL at 5 pips near the boss, RADIANCE at 3 when close.
- HUD: five pips (greybox squares, ticks over 1/3/5, the next pip filling under its slot); the C prompt says what a tap spends now.

## CHECKS (port 8931, one page run at a time) - all GREEN
paladin-kit (REWRITTEN for Paladin 3 - the old one tested the planted circle: tiers, aura travels / mends / burns / goes out, throw 3 pips, block +1, perfect guard +2 + flash,
bulwark, verdict x3, heaven's arc x2, the partner aegis under the aura, no page error) | riposte | blow-tags | skill-icons | boss-read | hero-trials | ability-poses (76/76) |
crouch-b (kneeling by a holy light still fills him) | talents | skill-menu | progression | settings-tabs | textfit hints,hud,practice,store,tree,pick,menu --strict (1134 screens, 0 of every class).
mash: the paladin is not in the mash bot's heroes (knight/warden/pyro) and the bot never presses C - unchanged.

## 3-SEED SANITY (boss-rates practiced, profile human, paladin vs knight) - NOT TUNED
| Boss (L3) | PALADIN 3 wins / fights | KNIGHT wins / fights |
|---|---|---|
| wood | 3/3 (51-92 s) | 2/3 (74-85 s) |
| stockade | 2/3 (28-37 s; the loss at 95% left, 29 s) | 1/3 (21-50 s) |
| marsh | 3/3 (18-21 s) | 3/3 (20-45 s) |
| burning | 3/3 (55-63 s) | 3/3 (68-89 s) |

Paladin 11/12, knight 9/12. Close to Paladin 2 (wood was 38 s on its circle burn, 64-92 now: the aura is shorter). The tune lane does 12 seeds.

## ART LIST (the Sonnet art lane)
1. THE WAR HAMMER (~70% of the maul: long haft, compact square head, two-handed) in every pose and FX that shows the maul (src/chars.js paladin poses, the hammer throw's projectile).
2. CONVICTION HUD: five proper pips (a small sun / cross each), lit / unlit / filling, the tier ticks.
3. THE HALLOWED AURA: a soft ring of light at his feet that moves with him (now: the old circle's ellipse + posts following him) - lighter than the old circle, a flare when lit.
4. SMITE (1): its own quick pose (now 'hallowQ') + the light column; RADIANCE (3): the 'sanctify' pose + a burst; SUNFALL (5): a finisher pose (now 'sanctify') + the falling light.
5. VERDICT: windup/hold/release poses (now 'sanctify' on release), the SIGILS (now a gold diamond with a cross), the strike columns.
6. HEAVEN'S ARC: the overhead whirl frames + a golden arc trail (now a ring of motes over the air up-slash).
7. THE PERFECT GUARD's HOLY FLASH (now two rings + motes); BULWARK ADVANCE: a walking-behind-the-aegis pose.

## FOR THE CHURCH 2 LANE (brief item 5)
The Paladin HERO-BOSS on master does not use holy-ground.js; when church2 re-points him: HG.conv / HG.aura / HG.smiteQ / HG.burst / HG.verdict / HG.arc are the numbers, the
owner API (plant / follow / spendLight / pipsOf) works on any body with { x, y, light }; HG.throw.cost is now 60 (3 pips); HG.empower is unused by the hero now.

## QUESTIONS FOR DANIEL (rec first = what is built)
1. A tap of C with 4 pips spends 3 (RADIANCE), not waiting for 5. Rec: keep (spend early or hold to 5 is your choice by when you tap). Alt: 4 pips = RADIANCE + a bigger aura.
2. A BLOCK +1 pip every blow is generous (blocking a combo fills him fast). Rec: keep for your playthrough, tune lane watches it. Alt: +1 per blocked string (0.5 s apart).
3. The hitboxes stay the maul's until the hammer is drawn. Rec: shrink the swing box ~15% with the art. Alt: keep the reach (the hammer is a long haft).

**Daniel 10-15 ~11:45: "Yes this works" - all three recs kept (4 pips taps RADIANCE; +1 pip a block; the reach shrinks ~15% with the hammer art).**
