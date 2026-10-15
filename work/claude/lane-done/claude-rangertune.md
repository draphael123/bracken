# claude/rangertune - THE RANGER tune (sonnet, 2026-10-14)
Base claude/rangerart c336b3a9 + merge of rangerart aac73d17 (restock frames). Port 8915. Method: boss-rates, human profile, kit flasks, practiced, 12 seeds, --jobs=1. Knight column = paltune-logs/base.json (12 seeds, knight untouched) + a fresh marsh run.

## Numbers changed (HER numbers only)
src/ranger.js RG: hp 90 -> 110 (Daniel 10-14, final; mirrored in src/progression.js hp0 table), dmg 11 -> 16 (final), knife.dmg 0.75 -> 1.0, rise.dmg 0.8 -> 1.0, quiver.refill 6 -> 8 (coordinator), restock {delay 0.4, each 1.3}.
Why: her fights were the same LENGTH as the knight's when she won; she lost them by damage taken (canal/undercrown/burning/stockade 17-50%), and the bot spent most fights on the knife (cut 2500 vs shot 800 verbs).

## Before / after (ranger win rate and mean fight s; knight in brackets)
| boss | knight | ranger before | ranger after | after len vs knight |
|---|---|---|---|---|
| wood | 12/12, 86 s | 11/12, 72 s | 10/12, 55 s | -36% RED |
| marsh | 11/12, 19 s | 10/12, 25 s | 9/12, 39 s | +98% (tiny absolute) RED |
| stockade | 10/12, 39 s | 6/12, 33 s | 12/12, 30 s | -25% |
| canal (L26) | 12/12, 93 s | 2/12, 81 s | 5/12, 69 s | -26% RED, win rate LOW |
| undercrown | 12/12, 52 s | 5/12, 81 s | 8/12, 71 s | +37% RED |
| burning | 12/12, 104 s | 3/12, 114 s | 11/12, 93 s | -10% |
No 0/N anywhere. Run-to-run noise at 12 seeds is large (the same code moved wood 83-92%, marsh 75-100%). Lengths are means over all fights.
Canal is the hold-out: several deaths at 20-48 s with the boss at 80%+ (254 hp gone fast) - not a damage-race problem; looks like a hazard/flying-boss interaction with her stand-off. Needs a look at the canal fight, not another global knob.

## Bot hands (src/lab.js, bot only)
- PICKUP: with <=1 arrow, walks to an arrow lying/stuck within 150 px on her footing, never past the boss. Measured effect on its own: nil (rates and verb counts unchanged within noise) - arrows are mostly stuck in the boss/out of reach.
- RESTOCK: quiver empty (or filling, <4) and the boss >130 px away on the ground: stands still and holds DOWN until near full.

## Crouch to restock (coordinator request)
src/ranger.js restock(dt, keys), called from main.js right after P.ducking is known: DOWN held still on the ground 0.4 s, then 1 arrow per 1.3 s to full; moving/attacking/jumping/dodging/drawing/hurt resets. Does not recall stuck arrows. Trickle 1/8 s. Tick sound (SFX.rgTick), pose rgRestock0/1/2 (rangerart's frames) cycled over each arrow, HUD strokes appear per arrow. Hint: 'QUIVER EMPTY: CROUCH TO RESTOCK...'. Trial yard drill 'restock' (take two). Duck and DOWN+C snare unaffected (hero-trials, ranger.mjs snare still green). tools/ranger.mjs asserts: quick duck no restock, ~1 arrow by 2 s, full by ~7 s, move cancels and resets, trickle now ~8 s.

## Mash
Bosses wood/undercrown/canal x2 seeds: all DEAD (boss left 76-96%). Marsh level: 29 deaths, lowest hp 0%. Mash still loses.

## Checks (all green)
ranger.mjs, hero-trials (all 9 yards), ability-poses (78/78), skill-icons, titlescene (FIXED: pick 3 = ranger by design; the order is now 3 ranger / 4 berserker / 6 paladin / 7 pirate and RIGHT walks nine and wraps - a stated design change, comment in the test), textfit hints,pick,trial,tree,store,hud --strict: 1115 screens, 0 issues.

## QUESTIONS FOR DANIEL
1. Accept 5/6 near the knight's rate with canal at 5/12 (REC ship, then a canal-specific look)? BUILT: shipped the numbers.
2. hp 130 is the highest of the starters (knight 100). REC accept: she has no block and a rooted draw. Alternative: hp 115 with dmg 17.
3. The bot's pickup hand did nothing measurable; kept (harmless, a player would). Say if you want it removed.

## FINAL (Daniel's answers 10-14): hp 110, dmg 16; canal ships as it lands (separate lane); pickup hand kept
6-seed check, ranger only (knight column reused from the 12-seed base): wood 6/6 (48 s), stockade 4/6 (28 s wins), burning 5/6 (90 s). ranger.mjs, hero-trials, titlescene, textfit hud,pick --strict all green. The 12-seed table above was measured at hp 130 / dmg 15.
