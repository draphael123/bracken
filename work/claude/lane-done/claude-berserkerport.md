# claude/berserkerport - THE BERSERKER merged onto batch84 master (73a8e1ad)

Branch claude/berserkerport (merge of origin/claude/berserker 0ff182f4 + fixes). Not deployed, master untouched.

## Conflicts (15 files) and how
- main.js (18 hunks): kept master's side everywhere (flasks2, minimal HUD + meterPrompt, pick portraits row, gear tiers, STAM.rollInv) and re-added his lines: imports, HEROES entry, BZ_ICONS, CD_MAX, death-reset clears, MOVE_WORDS, damagePlayer (frenzy iron, lethal, took), dodge/brace guards, roll speed, haste run cap, RAGE bar in the minimal HUD (HY row, 45 wide), BK getters (bz/bzKit/crouchC). Pick: roles/names/blurb for him; 8 fit (role text shortened: knight 'sword, kite', geomancer 'staff, stone', him 'axes, rage').
- commit.js: master's WEIGHT-T numbers; his row scaled x0.6/x0.9 like everyone's (light .084 / third .12 / heavy .162; roll cost 22, len .28; brace pauses regen). His old CM.ROLL_INV reads were already STAM.rollInv after merge.
- lab.js / tools: master's bot plans + his DEFLECTS/BUSY_C brace taps; lists extended (commitment, skill-passives, leveling, textfit, ability-poses, check list, skill-icons 69 actives/165 passives).
- dressing.js (whole-file EOL conflict): master's file + his trial_berserker kit; progression.js: master's TOP_PRICE rule; catalog: both.
- Enemy goblin t:'berserker' vs hero id 'berserker': no collision (hero ids/skills/SPR separate; HERO_SHORT has the hero, bestiary entry untouched).

## Added for master's new features
- Flask drink frames (flask-art SPEC + flasks2 MOUTH). Dances: dance2 THE WHETSTONE, dance3 THE WAR CRY, F.follow. Smear: axe hand/head kept as c.wp, smearPass(steel). Finisher CLEAVED. hero-move HERO_RUN/IDS (knight legs). Hero perks STOKED / STOUT BRACE (LEVELING2 needs two per hero). Cross-chop poise lean re-applied inside bosswave2's heroes-only branch (check berserker failed 38 < 60 without it).

## Decisions kept
Throw = THROW key + UP+C; working-up cap 75; brace = parry (DEFLECTS); cross-chop poise; Battle Roar. Unlock: current rules - DEFAULT_HEROES = knight, warden, geomancer, berserker (a new game picks ONE free; the other defaults and all heroes are 10 silver each in the hero store). Not coin-routed.

## Checks green (own runs)
syntax, berserker, hero-trials, skins, weapon-skins, dances, flasks2, titlescene, textfit (all scopes incl pick/tree/store/hud: 0 truncated), touch, store-ui, tells, blow-tags, modulepreload, leveling, commitment, ability-poses, skill-passives, skill-icons, progression(+runtime), talents, content-audit, attack-animation, mash-gate/carry, reach-heroes (witchlight 463,26 TIGHT added to KNOWN for him: same legs as knight), settings-tabs, hint-shown.
mash-bot as berserker: wood/marsh/stockade/spore boss x2 seeds all non-wins (timeout/dead); level mode wood/marsh dies (3 / 29 deaths). 
hero-keys (strip fingerprints, 7 other heroes, master vs branch): warden identical; others differ only by run-to-run noise - the same tool gives two variants on master itself and on the branch (pyro 3+3 runs, both trees show both variants).
Not run: full suite (npm run check) - run before deploy.

## Spot check (profile human, flasks kit, practiced, 2 seeds, NOT tuned)
wood L3: berserker 2/2, knight 2/2. marsh L3: berserker 2/2, knight 1/2. He is not weaker than the knight; tune lane to measure properly.

## QUESTIONS FOR DANIEL (rec first)
1. New-game pick now offers 4 free defaults (rec: yes, per week note). 2. Knight pick label changed to 'sword, kite' for width (rec: ok; alt shrink all roles).

## TUNE (berserker vs knight, boss-rates --profile=human, kit flasks, practiced, campaign level, 12 seeds each)
| boss (L) | knight | berserker before | after |
|---|---|---|---|
| wood (3) | 10/12 | 12/12 | no change |
| marsh (3) | 11/12 | 12/12 | no change |
| stockade (3) | 7/12 | 9/12 | no change |
| spire (9) | 8/12 | 7/12 | no change |
| caravan (34) | 10/12 | 9/12 | no change |
| moor (10) | 10/12 | 11/12 | no change |
| hurricane (19) | 12/12 | 11/12 | no change |
| fallingtower (33) | 11/12 | 12/12 | no change |
| welltown / buriedcity / church / skyroad / underwell | 12/12 each | 12/12 each | no change (saturated for both, uninformative) |
Total over the 8 informative bosses: knight 79/96 (82%), berserker 83/96 (86%): +4 points; biggest single gap +2 wins (17 pts at n=12, within noise), and he is behind on 3 of 8. Never 0/N, never an outlier.
Mash-bot as berserker: stockade boss timeout 100% left (x2), spire boss + mini dead (x2), stockade LEVEL 6 deaths: all loses. tools/berserker.mjs: ok.
CHANGES: none. No number of his was touched, so hero-trials/leveling/commitment were not re-run (nothing changed since the port's green runs).
