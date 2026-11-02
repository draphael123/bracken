# claude/pyrokit2 - PYRO KIT 2 (sonnet, 11-01) - off origin/master 0fe14c26 + origin/claude/pyrocontrols + origin/claude/skillslots (both merged clean). Pushed, NOT merged/deployed.
STATUS: code + static + pyro-kit/ember-flare/hero-trials/keys/hint-shown/lategame/textfit(5 scopes + tree) green BEFORE the UP+C change. BROWSER-HOLD (11-01 ~14:40) stopped the re-run: PENDING = settings-tabs, textfit hud/card/hints after UP+C text, pack-clear sanity, boss rates (n=6 x 7 bosses + baseline). Scripts are ready (see "To finish").

## Built
- LIVING BOMB = core passive from L1 (main.js pyStack / pyDetonate / pyBombTick; replaces burn marks `pyMarkAt`, old name `pyroMarked` kept as "has a pip" so tools/ward parry still read it). Pips (e.pyStk, 3 small flames over the foe, fade 6 s after the last): staff cut / tapped ball / ward contact / ward parry = 1; charged ball step 3+ = 2; a skill's tick = 1 (max one per 0.5 s). Gap 0.18 s between pips from her blows. 3rd pip -> 0.1 s fuse (pips flash white) -> BURST: swordDmg x K.livingBomb 1.2 x amul x heat, passes 1 pip to every foe in R (chains: chained fuse 0.16 s so it reads), 2 s no-restack after a burst, bursts never refill the bar (PY_NOHEAT; burn ticks still give normal heat).
- Bosses/minis: burst k 0.7 (not 1.2: stacks come every ~3 hits, 1.2 would be a +40% boss rider), CAP 3% of max HP per burst (4.5% at L40), only every 3rd burst staggers (0.5 s, never in a ward/break), resist floors untouched (a pip needs the blow to take health).
- Growth (by hero level, automatic): L14 CINDER SPREAD (same id 'conflagration', desc rewritten) spread R 46->66; L25 R 84; L40 neighbours get 2 pips + boss cap 4.5%. Level-up line adds "LIVING BOMB GROWS." at 25/40; L14 shows the passive's name as before.
- METEOR FALL (meter spender, **UP + C at a full bar** per the coordinator's input rule; plain C stays ward/fireball, card UP+C waits until the bar is spent): target = most-pipped foe in front within 230 px, else nearest, else 90 px ahead; red flattened ring on the ground + closing gold ring + falling whistle for 0.9 s (ring fixed: walking out spares you), then blast R 56: swordDmg x K.meteorFall **3.0** x amul x heat (x1.4 at a full bar = 4.2 sword per foe, then each foe is lit to THREE pips -> chain bursts ~1.7 sword each). Boss capped at 4% max HP, mini 10%. Meter gain unchanged. k reasoning: knight LAST CHARGE = 2.5 sword through a pack / 3 on a boss; old Conflagration 4.0x1.4 per marked foe. (First built at 5.0, cut to 3.0 after reading the knight's.)
- Art (pyro-art.js, drawn in this lane): pips (lit/off/hot), flattened meteor ring, meteor body + tail, scaled blast, glyphs M E V B for the word METEOR FALL; the burst reuses the 'erupt' column + ring. Sound: bombPip, bombBoom, meteorWhistle, meteorBoom (audio.js, synth).
- Text: hero card desc, controls card row "full bar: UP + C: METEOR FALL", HUD prompt "METEOR FALL: UP + C", trial text (ember trial: "THREE HITS BURST THE STRAW MAN"; meter trial: UP + C), catalog desc for CINDER SPREAD, trialName. Bots: lab.js + lab-mother.js press UP+C at a full bar.
- Tests: tools/pyro-kit.mjs rewritten for LIVING BOMB (pip counts, gap, fuse, burst dmg, 2 s no-restack, chain, boss cap + 3rd-stagger, staff pips) and METEOR FALL (aim, 0.9 s tell, k, bar empty, no ward, 90 px fallback; UP+C). tools/hint-shown-silent.txt rewritten (CONFLAGRATION/NOTHING MARKED/SCORCHED OPEN gone). settings-tabs row updated. mark-integrity (stockade, burning) green. Save migration: id 'conflagration' kept, no pyro-mark fields in saves -> nothing to migrate.

## Shared code touched (for the batch merge / pyroboss2)
main.js: PYRO_KIT (cf removed; lb + mf added), hurtFire (stacks opt; same signature + FIRE_BLOW), fbHit, hurtEnemy hook line (`pyBlowStack`), gainHeat (PY_NOHEAT guard), pyro block of updatePlayer (call site + pyBombTick), HUD label, levelUpLine, BK exports (pyStacks, pyStack, meteorNow, lbTier, render). skill-k.js (K_PYRO), audio.js, pyro-art.js, controls.js, level.js (2 trial lines), lab.js, lab-mother.js, progression-catalog.js (1 desc). The Pyromancer boss was NOT touched.

## Numbers
stack dmg 1.2 x sword (boss 0.7, cap 3% / 4.5% L40); meteor k 3.0 (boss cap 4%, mini 10%); pip life 6 s; no-restack 2 s; radii 46/66/84/84.
Test sample L10: burst 23 incl. burn (1.2 x 11 sword + 5 burn ticks); meteor+chain on 3 foes ~114 hp each at L14, sword 11.

## Rates (pyro, human, flasks, practiced, campaign level) - PARTIAL, run before the UP+C change (bot cast on plain C then; same effect)
| boss | this branch | master (pyrocontrols table) |
| marsh (Frog King) | 6/6 | pending |
| fenroad (Bog Troll) | 4/6 | pending |
| stockade | 0/3 so far (run stopped) | 3/6 |
| rookery, underleaf (King Gorm), warcairn, burning | pending | 5/6, -, 5/6, 4/6 |
Stockade 0/3 is a RED to re-measure: with ball/ward now giving 1 pip each and no mark-eruption the kit has less boss burst; suspect the bot not spending the meteor in the window. If it stays low: raise boss burst k 0.7 -> 1.0 or the 3% cap, one constant each (PYRO_KIT.lb, SKK.K.livingBombBig).

## Stills (scratch\lane-reports\pyrokit2-shots\): 1-pips, 2/3 burst + chain, 4 cast, 5 ring, 6 meteor falling, 7 impact, 8 chain, 9 after.

## To finish (browser, when BROWSER-HOLD lifts, one at a time, >=1500 MB)
node tools/settings-tabs.mjs; node tools/textfit.mjs <hints|hud|card|pick|practice> --strict; node tools/hero-trials.mjs; node tools/_pk2pack.mjs buriedcity (+ sealedpyramid; kept local, 6 foes of the 3 commonest types, full-bar meteor -> dead count / hp left); node tools/boss-rates.mjs marsh,fenroad,stockade,rookery,underleaf,warcairn,burning --heroes=pyro --ways=practiced --seeds=6 --profile=human --jobs=1 (and the same from bracken-pyrocontrols for baseline). hero-keys-strip crashed the page twice (RAM) - not a code failure.

## Art polish for a later pass
pips are 5x5 and small at 1x; burst reuses the eruption column (a dedicated round burst + shrapnel would read better); the meteor is one frame with a pixel tail (no spin); METEOR FALL word is the 5x7 face.

## QUESTIONS FOR DANIEL (built as rec)
1. CINDER SPREAD still sits in the skill tree as a node but its effect is automatic at L14 (a point spent on it does nothing extra). Rec built: automatic at L14/L25/L40 by level, node text says so; alt: drop the node.
2. Boss burst k 0.7 + 3% cap (stagger every 3rd). Keep, or tune after the rates?
3. Meteor k 3.0 (4.2 sword per foe at a full bar + chain). Keep, or 4.0 like the old Conflagration?
4. UP+C meteor means her L10 JET/EMBER cards (UP+C) fire only when the bar is not full. OK?
