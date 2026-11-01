# claude/rangerid - THE RANGER'S IDENTITY PASS, DEMO SCOPE (Daniel 10-31 Q6/Q9/Q11/Q12 + 11-01 jab combo)
Branch claude/rangerid off master 0fe14c26 + claude/skillslots (ff75cfdc). Commits 4108b890, 4643edbc. NOT merged, NOT deployed.
STATUS: kit BUILT and unit-checked in the real page (tools/ranger.mjs). BOSS RATES: OWED TO STARTER-HEROES TUNE (coordinator 11-01 13:xx stopped my runs for RAM).

## BEFORE / AFTER KIT
| piece | before | after |
|---|---|---|
| hold X | 3-TIER ladder: long shot -> piercing -> triple-shot fan | ONE DRAW + STEADY WINDOW. Full draw at 0.55 s (long shot). 0.12 s later the bow goes still for 0.4 s (0.6 s on a full FOCUS): let go inside = STEADY SHOT (flat pierce through the line, 2.0x, distance bonus doubled, 13 wind). Held past it: SHAKY (flies +-70 vy, x0.85) and it goes by itself 0.6 s later. Triple shot deleted. |
| focus | spent by a T2/T3 (FOCUSED x1.3) or UP+C mark | still filled by sweet-spot hits (steady shot now fills it too); UP+C mark unchanged; a FULL focus is NOT spent by the draw - it widens the steady window |
| distance | none | DISTANCE BONUS on every arrow: x0.8 under 36 px, x1.0 to 70 px, rising to x1.6 at 280 px; steady shot doubles the part over x1 (x2.2 max). "FAR x1.3" numbers float. |
| VOLLEY (skill) | free: 20 st, no cd, 3 free arrows | 6 s cooldown (CD_MAX.rgVolley), costs TWO arrows from the quiver (two of the three can be picked up again, one is free); "VOLLEY NEEDS 2 ARROWS" below that. HEARTSEEKER cd 14 s (brief table). |
| 3rd jab hit | same heavy shove as everyone | PUSH KICK: third knife cut in a run = lighter (x0.8 swing, was x1.5), longer reach (25 vs 17), steps in 70 px/s, shoves a common foe ~40-55 px OUT TO RANGE + 0.7 s stagger (room to shoot). Elite/mini/boss: 0.25 s stagger only, never thrown. Trade-off: less damage than any other hero's third hit. Pose placeholder = rgBash. |
| dash strike | 1.4x | 1.3x (Q5); knife-in kept (Q9); no extra rider (back-step shot not taken: Q9 keeps the knife) |
| dodge | backflip (no damage, X in it = quick shot) | unchanged - already plain (Q5/lane C) |
| text | three-tier wording | hero card, pick card, teaching lines, controls card (third-cut row = PUSH KICK, snare moved to crouch row), trial yard (heavyblow reworded + new 'third' step), catalog VOLLEY/HEARTSEEKER |
| bot (src/lab.js) | tier 1/2/3 by foe | lets go in the steady window on ~2 of 3 draws, plain full draw on ~1 of 3 (a human misses the window) |

## REMOVED HANDICAP ROWS (all ranger -> 1.0 / deleted; grep found no other ranger row)
flotilla-boss.js TUNE.ranger {1.2,0.9}; main.js CAP_HERO.ranger 0.4, CAP_OPEN.ranger 1.5 (deleted), LP_HERO tollmaster 0.85 + lampreeve 0.7 (deleted); admirals-champion.js TUNE.ranger {0.65, 2}; bzchief.js heroHp 1.55 and heroDmg 0.85. (DUEL_HERO, ARCH_TUNE, deacon, lance-support, paladin-boss had none.) Boss global dials NOT moved (owed to the tune lane). Merge care: CAP_HERO line, flotilla TUNE line are also edited by knightid/berserkerid.

## RATES (human profile, WITH flasks, campaign level, practiced)
- Old Tusker (row 'wood', L3): 7/7 wins (1 page crash excluded), most with <50 hp taken - HIGH (100%). Not a ranger row (no handicap there): the boss is easy for the bot; knight lane saw 5/5 too. Boss dial needed.
- Hornet Queen, Frog King, Bog Troll, Chieftain, Battering Beast, King Gorm: NOT RUN - OWED TO STARTER-HEROES TUNE. Expect her to FALL on bosses that used CAP/flotilla rows (the 0.4 mercy is gone); the distance bonus (up to x1.6 / x2.2 steady) is the lever, then boss dials.
- Bot draws a steady shot ~2/3 of draws - real players will hit the window less: tune to the bot with that in mind.

## CHECKS
tools/ranger.mjs: green first full run except kick assert (fixed in 4643edbc); final re-run + hero-pass/trials/keys/textfit/progression/curve-shape results appended below by the lane at finish (see FINAL section). Not run: mark-integrity, mash-gate, coop, pilots, full textfit, boss rows (RAM; owed to tune lane / gate).

## DEFERRED (after the demo)
L25-L50 ranger techniques (CARD v2 framework is on claude/knightid; she needs src/tech-ranger.js + 1 import + 2 rows in progression.js); the brief's HUNTER'S MARK as a cooldown skill (kept as the focus spend for now); boss-pressure ANTI-KITE clock (Warden lane); rgTwin/rgSteady/rgFar card wording re-read vs the new draw; steady-window stat card rework; ranger hero-identity.mjs entry (scaffold is the Knight lane's); fodder-tuning at L35.

## ART NOTES (placeholders in code)
Push-kick pose + leg trail (uses rgBash); steady-window cue: bow stillness/reticle ring + meter second segment (2 segments now, greybox colours); shake-hand pose for SHAKY; distance chevrons on hit numbers (text only now); volley cooldown rim on the skill icon; chars.js rgDraw3/rgKneelDraw3/rgLoose3 (triple shot) are now unused and can be dropped.

## QUESTIONS FOR DANIEL (built as recommended)
1. Window timing 0.12 s after full draw, 0.4 s long (0.6 with focus). REC keep; widen to 0.5 s if players miss it. 
2. Push kick pays x0.8 and does nothing to bosses but 0.25 s stagger. REC keep (it is a spacing tool, her answer to point-blank).
3. UP+C hunter's mark stays a focus spend (not a cooldown skill). REC keep for the demo.
4. Heartseeker cd 14 s added with the volley (brief table, not in Q9). REC keep.
5. Old Tusker is 100% for ranger/knight bots: REC the tune lane lowers the boss's tolerance, not hero rows.
