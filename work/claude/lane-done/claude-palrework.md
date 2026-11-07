# claude/palrework - PALADIN REWORK (lane 1 core + the art, code-only, no browsers)
Branch claude/palrework off claude/batch151 (7695092ef). Plan: scratch/lane-reports/paladinplan.md. Input per Daniel 11-06 21:19: HOLY HAMMER = UP+C at 3-4 pips, SUNFALL = UP+C at 5.
One switch: `PAL_MACE` (src/holy-ground.js, now true). Off = master paladin exactly.

## Built (vs the plan)
- Donor: palsmite3 src+tool cherry-applied (third blow smite); folded as THE OVERHEAD (+0.5 pip once, ripple r30 each way staggering small foes 0.8 s, FX on fxRand; boss chip/stagger rules from palsmite3 kept; no effect on a guarded boss).
- Mace numbers (HG.mace): clock 0.56 -> 0.72, per-swing mul 0.8 (swordDmg pinned 14), stamina already 22 on master, reach sweep 29->26, heavy 27->25, rise 24->23, CRUSHING = x1.25 poise lean on guarding/armoured foes (damage + boss resist floor untouched).
- HOLY HAMMER (HG.hammer, src/holy-hammer.js pure hammerPath, main.js castHolyHammer/holyHammerStep): corkscrew forward 150 px/s for 1.1 s, loop r16 x2.5 turns, pierces, stops at solid tiles, one in flight, 'light' class, dmg = swordDmg x 0.6 (skill-k K.holyHammer) x amul, rehit 0.3 s (2-3 hits/foe), small foes stagger 0.3 s, boss/mini/elite/guarded never staggered, burn only with BLESSED HAMMER (reach bonus removed). Tell: castT 0.3, root 0.12, hurlH pose, gold ring, whoosh. co-op: hammer carries owner.
- Input tiers: UP+C 3-4 pips hammer (spends 3), 5 = SUNFALL, 0-2 buzz 'HOLY HAMMER: 3 CONVICTION'; tap C at 5 = RADIANCE+ (spends 4). HUD labels updated, 3rd pip gold rim + 'HAMMER READY', empty pips flash red on a failed press, hint 'SUNFALL IS UP+C NOW' (up to 3 times until used).
- Conviction fill: absorbed blow on the ward +1 pip (heavy >=12% max hp +1.5), partner turned +1 pip, perfect guard 40 -> 20 (no timing bonus), mace hit 5 -> 3 Light, hallowed-ground trickle 1 pip / 12 s. Bulwark Advance + shove disabled (ward may shuffle slowly: P.wardWalk).
- Art (code-drawn, chars.js): one-hand flanged mace (7-across octagon head, steel core, flanges, gold stud, oak haft, gold pommel; only the head takes weapon skins) on every pose via knightFrame's maul slot; round 7x7 SUN SHIELD (steel rim, tabard-blue face, gold sun) on the off arm in every pose, raised on the ward pose. Light-hammer projectile 9x9, 4 spin frames, trail, end flare (holy-fx.js). Foe Paladins (Lit Church/Waymeet) keep the maul via bakePaladin(skin, preview, true).
- Texts: hero blurb, picker/ROLE, tree headline, MACEFALL rename, BLESSED HAMMER, mace wording in the catalog, THE LOW MACE (dash strike name/comment). lab bot: UP+C for SUNFALL (5) and hammer at 3 pips in line.

## Node results (no browser)
- node --check: main, chars, holy-ground, holy-fx, holy-hammer, lab, skill-k, hint-lines, progression-catalog OK.
- tools/paladin-hammer.mjs (new): PASS (tier routing 0-5, tap tiers, path coverage both facings, k law dmg 8 @14, rehit 2-3, fill numbers).
- tools/palrework-bake.mjs (new, in-memory canvas shim, no browser): 64 pose keys, 280 frames baked, 0 empty, mace/maul keys identical, 6 key poses differ; contact sheet work/claude/lane-done/palrework-sheet1.png (top mace, bottom maul).
- tools/pal-smite.mjs: PASS (updated to the new text).

## Deviations / not done
- Shield is 7x7 (plan said ~11): 11 hid the torso at 34x32 frames. Mace haft reads thin at 1x in places; eyeball.
- NOT done (belongs to later lanes): flotilla TUNE.paladin 1.45/0.42 -> 1/1 (retune lane, measured), forks (SPIRAL/HOMECOMING), HALLOW 3rd, HALLOWED STEEL re-point, Divine Shield. Ward walk is the old slow shuffle cap (32), not a tuned 40%.
- Existing browser tools (paladin-kit, paladin3/4, holy-ground, hero-trials, tutorial guard counts, mash-gate, hero-keys-sheet) not run and probably need updating (SUNFALL tap, hammer path).

## OWED browser checks
Stills of every move (idle/walk/jab1-2/overhead/rise/sweep/verdict/ward/hurlH/smite/radiance/sunfall/low mace/plunge/swim/kneel/hurt/death) x 4 skins (steel/ember/frost/moon) + knight-vs-paladin strip; hammer flight against a crowd + a wall + a boss; hero card textfit (blurb grew ~5%); hint-shown + textfit tools; paladin-kit/paladin4 updates; n=6 WITH flasks: Admiral (needs TUNE 1/1 first), Lit Church Paladin, Waymeet duel, Tollmaster, Warcairn Chieftain, Goblin Queen 2 (band 60-70%; read hammer casts 2-5/fight, hammer dmg share <=20%, pips/fight 6-12); mash-gate paladin.

## Questions for Daniel (recs BUILT)
All 13 of the plan: Q1 UP+C (confirmed 11-06 21:19); Q2 tap at 5 = RADIANCE+; Q3 forward corkscrew base; Q4 absorb-fill + trickle; Q5/Q6 fork re-points later; Q7 CONVICTION word kept; Q8 BLESSED = burn only; Q9 MACEFALL; Q10 TUNE row retires in the retune (NOT done here); Q11 foe Paladins keep mauls (done); Q12 Divine Shield untouched; Q13 whole rework behind PAL_MACE (now ON in this branch since art is included - set false to ship dark).
