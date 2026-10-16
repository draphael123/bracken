# claude/heropassa - HERO PASS A (Opus lane, overnight 10-15/16)

Base: origin/claude/batch95 835128a2 (origin/master did not contain it yet). Port 8951. Brief: scratch/lane-heropassa-1015.md + scratch/brief-heroidentity.md item 1 (read through scratch/audit-hero-identity.md), the '!! 10-14 LATE' knight/warden lines, '!! 10-15' ranger, '!! 10-15 ~12:40' warden tip. The paladin is NOT touched (PALADIN 4 owns him).

## WHAT IS BUILT (numbers in src/hero-pass.js HP / TIP, src/ranger.js RG.snatch / RG.kneel)
| Item | What it does |
|---|---|
| DODGES, one budget | Same input. On the GROUND each hero's own move; in the AIR the shared air dodge is untouched (no gap/route changes, A7) - except the geomancer. Grace never over 0.26 s, the shared wind cost, the 0.5 s cooldown |
| Knight SHIELD-STEP | 0.24 s step at 230, grace 0.14; shield up through it + 0.12 s: a yellow front blow is turned at blockCost (never a perfect guard, no riposte), red/bolt not; out of wind = GUARD BREAK. The shield stays on the NEAREST FOE within 90 px (a step away = a step back, shield on him, no dash); nobody near = faces the way he steps |
| Warden LOW HOP | Forward double tap on the ground: drawn 5 px hop; a LOW blow (duck.js blowLow or `low`) passes under her, red or yellow. Physically still on the ground, so the jump out is still THE VAULT. Back-step unchanged |
| Pyro EMBER BLINK | 0.16 s at 375 (~60-90 px), grace 0.12 from the start, none on landing, not drawn mid-flash, no trail alight (-8 heat kept; PHOENIX TRAIL still drops fire). Air = the old cinder roll |
| Freebooter POWDER FLASH | The roll + a black-powder puff where he stood: what was in front (46 px) is DAZZLED (common 0.6 s, its tell lost; elite 0.3; boss/mini only FLINCHES 0.12). The freebooter exists in code (id 'pirate') so it is built |
| DK SHADOW-STEP | 0.2 s at 350 (~70 px), grace 0.14 (the tail is hittable), drawn as his shadow, THE WAKE decoy left as before |
| Geomancer STONE SHRUG | AIR dodge only: she does not move, no grace; the first blow in 0.4 s is shrugged off whole. Floor = BURROW unchanged |
| Berserker SHOULDER BARGE | His shoulder roll +20% (BZ.roll.speed 250 -> 300); shoves only the small. berserker.js commit record fixed to match commit.js (22 / 0.26 - the live numbers) |
| Ranger | Backflip untouched |
| Knight SHIELD BASH | **UP+C tap** (C = guard/perfect guard, DOWN+C low guard, C at full bar = last charge; UP+C was free). 12 wind, 0.55 s cd, a half step in, hits 0.08-0.16 s, reach 26. A foe in its wind-up LOSES the blow (flinch, 'INTERRUPTED', stagger 0.9; elite 0.45); a boss/mini is never interrupted - poise lean + 'BRACED'. No shield is raised by it (no free perfect guard); never spends the bar |
| Knight VALIANT STRIKE | Full RESOLVE + a heavy cut (any stage): spends the bar; a guarding common/elite has its guard broken before the cut lands (GUARD BROKEN), elites stagger 0.8; a duelist boss's wall does not turn it (+30% poise lean). Open foes take the cut as it is (no free x1.5) |
| Warden COUNTER-THRUST | Deflect ON THE BEAT -> the next thrust is the riposte (shared tag) and DRIVES the foe back out to tip range (34 px, slide; never a boss/mini/KNOCK_SKIP) - 'COUNTER-THRUST' |
| Warden WALL PLANT | In the air, holding INTO a wall within 8 px, tap C: a 14 px spear foothold at her feet, 2.2 s; a jump off it / X / time pulls it free. Once per landing, 10 wind. Run-time only - no reach tool sees it (A7) |
| Warden TIP UP TO 2x | tipPay: x1.6 at the point rising to x2.0 at full extension (12 px ramp; DEEP SET 6 px - replaces its +20%), opening (TIP_GAP) 1.5 -> 2.0, middle 0.75 -> 0.7, FULL STRETCH = the ramp (min 1.6, was flat 1.5), a 0.035 s tip hitstop + bigger spark/ring. Base damage NOT trimmed |
| Ranger ARROW SNATCH | Bow-bash ON THE BEAT vs a yellow projectile (seeds; not chains / red / noBlock) in front within 18 px: nothing taken, +1 arrow; quiver FULL = flung straight back as a free riposte-tagged arrow ('FLUNG BACK') |
| Ranger KNEELING DRAW | Crouched still 0.15 s, then X held: draw wind x0.7, arrow vx x1.15, vy x0.45, g x0.85, sweet-spot Focus x1.5, loosed low; the crouch keeps her ducked (high blows go over). A tap from the kneel is a quick shot; DOWN+X pressed together (not yet knelt) is still the knife sweep. Restock unchanged |
| Yards | Knight: shield-step text, KBASH, VALIANT (bar filled). Warden: COUNTER, PLANT (at the gate). Ranger: SNATCH, KDRAW. Pyro/DK/freebooter/berserker dodge lines reworded |
| Bot (src/lab.js) | Knight bashes yellow wind-ups of commons/elites in reach (foe hands); valiant at a duelist's wall with a full bar (boss hands, else the last charge as before); ranger snatches incoming projectiles (foe + boss hands) and kneels before a heavy draw (foe hands). Counter-thrust comes from the existing deflect-then-thrust; wall plant is not taught (traversal, never needed) |

## SHARED FUNCTIONS / LINES TOUCHED (for the merge with claude/paladin4)
src/main.js: import line (new) | `let HPK` after `const hero = ...` | makeHeroPass block before `function rangerKit` | RGK makeRanger (+ `get seeds()`) | damagePlayer0: one new line right after `if (P.dead || invulnerable()) return false;` (paladin4 edits the aegis line further down) | the DODGE block: `const face0` on the `P.dbuf = 0` line, `HPK.start(...)` line before `trialEvent('dodge')`, the pyro `P.alight` line - the paladin branch is untouched | updatePlayer: `HPK.update` after `geoBurrowStep` | knight C block (UP+C line) + the P.block line | warden C block (plant) | heavyCut (valiantArm) | heroCut | the duelist WALL line in hurtEnemy0 | tipPay + TIP_GAP | heavyWind (ranger kneel) | `RGK.snatchSeeds()` before EMBER.catchSeeds | mover landing (footLand) | player draw: the `vis` line, a pose line BEFORE the rgFlip line (paladin4 inserts his sStep line AFTER it - adjacent, check), the kneel-draw pose line before the generic `P.charge > 0` line, the dY line, `HPK.draw` beside RGK.draw | TRIAL_NAME/TRIAL_SAY via a new `Object.assign` line (the paladin edits those two lines) | window.BK.hpass.
Other files: src/hero-pass.js (new), src/ranger.js, src/hero-poses.js (POSE_ALIAS + kitPoseFrame alias), src/commit.js (regenPaused: P.ownDodge), src/berserker.js, src/level.js (yard rows + a valiant fill line after the forEach - the paladin edits the fill line itself), src/lab.js, tools/hero-pass.mjs (new, in check.mjs), tools/hero-trials.mjs (NEWP + drivers; paladin4 also edits), tools/one-dodge.mjs, tools/commitment.mjs (same row paladin4 edits - mine is generic and covers his 0.26 s step), tools/blow-tags.mjs.

## CHECKS (port 8951, one at a time) - all GREEN (hero-pass, one-dodge, commitment, blow-tags, boss-openings re-run after the last src fix 5a13bad3: regen pause for short own dodges + the shadow-step grace; the rest ran on 56f93185, before it)
hero-pass (NEW: dodges, knight, warden, tip, ranger, bot) | one-dodge | ability-poses | skill-icons | hero-trials (full) | attack-animation | commitment | flip-actions | blow-tags | riposte | normal-health | mash-gate | boss-openings | mobile-perf | textfit hints,hud,practice,pick,tree,store --strict.
boss-openings: the hedge warden's "beside a brazier" assertion is FLAKY ON BASE too (failed 1 of 3 runs on the untouched batch95 base, 1 of 3 here; green 2 of 3) - pre-existing, not this lane.
TEST-EXPECTATION CHANGES (design changes, nothing weakened):
- one-dodge: the geomancer's AIR dodge is the stone shrug (no dash, no grace) - was "a plain dash".
- commitment: a dodge shorter than 0.28 s (shield-step 0.24, blink 0.16, shadow-step 0.2) has its tail sampled in its own last ~0.03 s (was always 0.28 s, past their end); the tail is still required to be hittable.
- blow-tags: the duelist-wall line regex accepts `!(P.valiant && P.heavy)` (VALIANT STRIKE is unblockable by brief).
- hero-trials: added (knight + ranger new stations played, warden counter + plant played).

## RATES - 3-SEED SANITY vs the L3 bosses (boss-rates practiced, profile human, flasks kit) - NOT TUNED
| Boss | before kn/wa/ra | after kn/wa/ra |
|---|---|---|
| wood | 2/3 2/3 3/3 | 3/3 2/3 3/3 |
| stockade | 1/3 3/3 1/3 | 3/3 3/3 1/3 |
| marsh | 3/3 2/3 3/3 | 3/3 2/3 3/3 |
| burning | 3/3 2/3 2/3 | 2/3 3/3 2/3 |
| total | 9/12 9/12 9/12 | **knight 11/12, warden 10/12, ranger 9/12** |
Cistern Queen (welltown, L35) warden: 4/4 before AND after the tip 2x - already over band (100%) on the base, so the tip did not push it over; it was over already. The L3 rows are all over band before and after (3 seeds is a sanity, not a tune). Knight +2 (the step's shield + the bash) is the one to watch in the tune lane (12 seeds).
MASH 0/6: mash-bot (arena) wood, stockade, marsh, burning, welltown x knight/warden/ranger x 2 seeds: lost every fight (warden at the burning village left the boss at 56-69%).

## ART LIST (greybox now - for a Sonnet art pass; POSE_ALIAS borrows these until the key is baked)
kStep (borrows block), kBash (toss), wHop (vault), wPlant + a perched-on-the-shaft pose (plant/skewer), the spear-in-the-wall sprite (drawn as a line), eBlink out/in (cinder; she is hidden mid-blink - wants an ember streak sprite), powder (roll; the puff is particles), shadowStep (run + the reaper's shadow tint), gShrug (ward/block/cast/jump) + a stone-skin overlay (now a grey ring), bzBarge (bzRoll/rush/roll), rgSnatch (rgBash/parry), rgKneelDraw 3 beats (her crouch), VALIANT blade glow (a 2 px mark now), the knight step's shield edge (a 1 px line now).

## QUESTIONS FOR DANIEL (rec first = what is built)
1. SHIELD BASH input: rec UP+C (built). Alt: forward+C, or X while the shield is held (that one collides with the riposte).
2. VALIANT STRIKE spends the full RESOLVE (the bar is the last charge OR valiant). Rec: keep. Alt: valiant keeps the bar (both from one bar).
3. Shield-step facing: rec the shield stays on the nearest foe within 90 px (built) - otherwise a held key turns him and the shield faces away. Alt: he faces the way he steps (plain).
4. ARROW SNATCH with a full quiver flings the arrow back as a free riposte arrow (built). Alt: the quiver may hold one over its max.
5. KNEELING DRAW needs her knelt 0.15 s first, so DOWN+X together stays the knife sweep. Rec: keep. Alt: DOWN+hold X always kneels (the sweep becomes tap-only).
6. Air dodges: rec every hero keeps the shared air dodge except the geomancer (her stone shrug) - no route/gap changes. Alt: the blink / shadow-step in the air too (gaps must be re-walked).
7. Paladin: no brace was built (the 10-15 ~17:20 line supersedes it; PALADIN 4's Sanctuary Step is his).
8. Knight bot now bashes nearly every yellow sword wind-up (22-25 in a 30 s duel): strong. Rec: let the 12-seed tune lane judge (cd 0.55 s / 12 wind are the dials).
