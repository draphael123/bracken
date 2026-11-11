# claude/palrework-d - THE PALADIN REWORK brought to master, browser-checked (desktop lane PALREWORK-d, 11-11)

Branch `claude/palrework-d` = origin/claude/palrework (255a28b0e) + origin/master (c395681de, newer than the a7c067880 the brief named) + fixes. Not merged to master, not deployed. `PAL_MACE` stays ON (src/holy-ground.js `PAL_MACE_SHIP = true`).
Ship dark: set `PAL_MACE_SHIP = false` (one line). For A/B on one checkout: `?palmace=0|1` in the page, `BRACKEN_PALMACE=0|1` in a node tool, `BRACKEN_QS='?palmace=0'` puts it on every tool page (tools/cdp.mjs).

## Merge
Only 3 textual conflicts, all "keep both": src/lab.js imports (master's gqueen + nighthands imports, palrework's PAL_MACE import); main.js move gate (master's WALKING FLAME rank line + palrework's `!P.wardWalk`); main.js heavySwing stagger (master's `trk('momentum')` + palrework's `P.palSmite3 ? HG.smite3.stagger`). Master had not touched castHammer/convictionTap/lightWardTakes/castJudgement/holy-*.js since batch151, so no semantic conflict there. Air-motion (batch157) is a draw-time transform of the whole baked frame, so the mace and sun shield ride along in jump/hurt/skid/crouch (seen in the live stills). node --check on every touched file: OK.

## Bugs found by the browser and FIXED (the rework had never been run)
1. HOLY HAMMER died on flat ground at 0.22 s / ~30 px: the wall test used the loop point, whose low point dips 2 px into the floor. Now the loop CENTRE meets walls (main.js holyHammerStep).
2. HOLY HAMMER flew OVER short foes: the loop is tall and narrow, a sprig passed while the hammer was at the top took 0 (paladin-kit: dmg 0). Now whatever the centre column passes is struck once; the loop gives the rehits.
3. Ward walk (P.wardWalk, the Bulwark replacement) had NO speed cap: he walked at full pace (73 px/s) behind the ward. Now capped at 26 like master's bulwark walk.
4. Art: the mace head sat ON HIS FACE in wind-ups (vWind 0, smiteB 0, ripo 0, leap 0, wrath 0, radiance) and was CUT IN HALF at the frame edge in THE OVERHEAD (atkC 1-2), the low mace (dashAtk 1), riposte, wrath. chars.js now moves the head along the haft (14 -> out to 20 / in to 3) to the nearest spot clear of the helm and inside the frame; if none, it is drawn behind the helm.
5. Lab bot threw the hammer at every third pip, so it never reached SUNFALL (0 a fight on warcairn/crown vs 2.3/1.2 for the old paladin). Now it throws from range only (64-140 px) and holds pips up close.
Also: flotilla TUNE.paladin now follows the switch (mace 1/1, maul 1.45/0.42 unchanged); measurement-only `globalThis.__palCasts` counters (trialEvent + boss hammer damage; boss-run `PAL_CASTS=1`), `BK.hammers()`.

## Checks (run one at a time, standalone; tools/check.mjs and gates NOT run)
PAL_MACE OFF (= master paladin): paladin-kit PASS, pal-smite PASS, hero-trials PASS, hint-shown PASS, mash-gate PASS, ability-poses PASS, attack-animation PASS, hero-keys-sheet written. paladin-hammer FAILS off by design (it asserts the mace).
PAL_MACE ON: paladin-kit PASS (updated: tap@5 = RADIANCE+, UP+C@5 = SUNFALL, +1 pip every absorbed blow, perfect guard +1 pip, no bulwark shove/shuffle <= 30 px/s), paladin-hammer PASS, palrework-bake PASS, pal-smite PASS, hero-trials PASS, hint-shown PASS, mash-gate PASS, ability-poses PASS, attack-animation PASS.
NOT finished: textfit (hero-card blurb) - killed by my 25-min timeout mid-run (no failure printed before that); OWED, run `node tools/textfit.mjs` alone. Not run: paladin3/4 art sheets (superseded by the stills), mash-bot, tutorial guard counts (no separate tool exists; hero-trials covers the yard), co-op browser checks.

## Stills (bracken-scratch/desktop-out/palrework-stills/, CONTACT-SHEET.png; tool tools/palrework-stills.mjs)
Every baked key x steel/ember/frost/moon (frames-*-R.png, steel also L and 4x in 8 parts), live moves both facings with air-motion (live-moves-R/L.png), knight-vs-paladin strip, hammer vs crowd / wall / boss.
What I see: the mace is on every pose, skins colour only the head (ember orange, frost cyan, moon pale) - good. The head reads as a big round ball (7 across) and the haft is 1-2 px brown: at 1x it reads more "ball on a stick / flail" than flanged mace. The sun shield is the tabard's blues with a gold boss, and in most poses it sits over the tabard's cross - at 1x it MERGES with the tabard (reads as his chest emblem, not a shield) except in the ward pose where it is raised. Flipped (L) frames are clean mirrors; nothing on the wrong arm. Hurt/skid/crouch/jump: mace and shield present with the air-motion lean and squash. THE OVERHEAD (atkC) is a forward jab with the head now at his fist - reads as a punch, not an overhead. Rise/sweep/airUp show the full 14 px haft (long next to idle's short one). Dances (dance2 27-30, dance3 1-3/8): the head still covers most of his helm / clips - the emote canvas has no headroom; LEFT. The hammer in flight is a faint glow at game scale: readable as light, not as a hammer. Hammer-wall still: my test wall tile did not draw, so it proves nothing visually (paladin-kit + probe prove it stops at walls by centre).

## Old vs new (practiced bot, kit flasks, master flags, paladin only, same seeds; new = bot v2)
| boss | row | old (PAL_MACE off) | new (on) | new bot v1 |
|---|---|---|---|---|
| THE ADMIRAL | flotilla | 4/6 (TUNE 1.45/0.42) | 6/6 (TUNE 1/1) | 6/6 |
| LIT CHURCH PALADIN | church | 5/6 | 4/6 | 4/6 |
| CRUSADER (Waymeet) | waymeet | 0/6 | 0/6 | 0/6 |
| TOLLMASTER | lamplit | 6/6 | 6/6 | 6/6 |
| WARCAIRN CHIEFTAIN | warcairn | 6/6 | 4/6 | 5/6 |
| GOBLIN QUEEN | crown | 3/12 | 1/12 | 0/6 |
| total (crown n=6 s1-6) | | 23/36 | 21/36 | 21/36 |
Casts a fight (new v2): hammer 0-3.8, SUNFALL 0.2-1.7, RADIANCE+ 0.8-4.7; old SUNFALL 1-5.5. Hammer damage on bosses is tiny (0-57 hp a fight, well under the 20% ceiling - more like 1-2%).
Reading: excluding the Admiral (different TUNE), old 19/30 vs new 15/30 (crown n=6) - the mace paladin leans ~1 fight in 6 weaker on the duel bosses (church, warcairn, crown), never stronger there; inside n=6 noise per row, so I did NOT change his numbers. On the Admiral the mace at 1/1 is stronger than the maul at its old row (6/6, wins in 64 s vs 97 s). Waymeet 0/6 for BOTH: the paladin bot's Crusader row is broken or far out of band independent of the rework (not mine to tune). Old crown at 3/12 is also far under band. Raw rows: bracken-scratch/desktop-out/palrework-rates/*.log/json.
Numbers changed: none of HG.mace / hammer k / fill. TUNE.paladin (Admiral) 1.45/0.42 -> 1/1 for the mace only.

## What the fork merge (palfork / forkmerge) will hit
As palfork's report says, all in src/main.js: (1) castHammer -> castHolyHammer/holyHammerStep (its SPIRAL/HOMECOMING fields go on the holy hammer; note my two fixes in holyHammerStep: centre wall test + centre-column first hit); (2) lightWardTakes fill lines (absorb +1, perfect parryMace 20); (3) convictionTap / palUpC (SUNFALL caller moved); (4) heavySwing / THE OVERHEAD third blow; (5) bulwark gone (P.wardWalk, now capped 26 in the cap chain). Also: src/flotilla-boss.js TUNE row, src/lab.js palHallow (bot hammer range), src/chars.js mace head placement (fits/behind).

## Questions for Daniel (recommendation BUILT where code)
1. Ship the mace paladin now (PAL_MACE on)? REC: yes after textfit passes - every paladin tool is green on and off, the two hammer bugs and the ward-walk bug are fixed. If you want it dark until the art pass: PAL_MACE_SHIP = false.
2. He leans ~1 in 6 weaker on duel bosses. REC: accept for now; if the laptop's n=12 confirms, raise HG.mace.mul 0.8 -> 0.9 (not built: unmeasured).
3. Admiral row for the mace: 1/1 gives 6/6. REC: keep 1/1 here; the Admiral's own band tune belongs to the retune lane (built: 1/1).
4. Shield merges with the tabard at 1x. REC: give the sun shield a steel-grey face (keep the gold sun) so it reads apart from the blue tabard - NOT built (art call).
5. Mace head reads as a ball. REC: flatten to 5x7 with visible flanges, thicken the haft to 2 px - NOT built (art call).
6. Bot: hammer only from range. REC: keep (built) - otherwise the measured paladin never uses his ultimate.
