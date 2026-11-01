# claude/pyroarttune - PYRO ART + TUNE (sonnet, 10-31) - on claude/pyrokit (off 7d14a9fc). Pushed, NOT merged/deployed.
## VERDICT: READY for integ WITH ONE CAVEAT - Stockade pyro is 58% (14/24 seeds), 2 points under the 60-70 band (see TUNE); the other three bosses are unchanged. Runs still needed: mark-integrity + textfit (page crashes, same on the 7d14a9fc base = machine/gate memory), the full suite at integ.
Worktree note: the untracked work/claude/herokeys/frames/*.png (the kit lane's hero-keys-sheet output, 2:54 PM) and work/tmp-pyrokit/ were NOT committed (kit-lane scratch). Mine: work/claude/herokeys/pyroarttune/ (pyro-frames.png, pyro-strip.png, pyro-timing.json).
## PART 1 ART (new src/pyro-art.js, hard-pixel sprites baked lazily on the pyro palette; ART ONLY, no number read)
- WARD DOME: 5 bloom radii (10..22 over the first 0.08 s), white-hot PARRY beat (2 px rim + 8 spokes), orange shell with licks + turning flame, red guttering end with rim gaps. fx: PARRY starburst+ring (5 frames), BLOCK ring with spark arc on the blow's side (4 frames), CONTACT spark on the foe (3 frames). (src/flame-ward.js draw/parry/block/contact/melt call PA.)
- FIREBALL: ball on the staff in 3 sizes (r3/5/8), a swell ring as the next step nears, READY pulse + rings + orbiting embers; in flight 3 sizes with tails (flipped by heading); hit pop; BLAST (5 frames, r~36) when the big one goes off.
- STOKE: flame crown on the staff head (3 sizes by heat) + halo + circling sparks.
- BURN MARK: outlined 7x10 flame brand (2 frames, whitens in its last 1.5 s), replaces the red rect.
- CONFLAGRATION: pixel-font banner CONFLAGRATION (fx 'word', honours the words setting) + blast on her + a flame column up every marked foe (3 sizes small / mini / boss).
- POSES (src/chars.js pyroKitPoses): wardUp x3 (parry-beat sleeves out / braced palm / ebb), holdStand x2, holdWalk x6, stoke x2 (staff planted, hem breath); main.js picks them (ward, hold ball stood/walking, stoke) instead of the cast/crouch placeholders; ball seat = pose staff tip (PA.TIP).
- Screenshots: scratch/lane-reports/pyroarttune-shots/{before,after}-{ward,parry,ball,stoke,brand,cf}.png (+ after-block, after-walk). Key sheet: work/claude/herokeys/pyroarttune/pyro-frames.png.
- Hero strip timing: boxes/stamina identical to base; heavy attack-clock phase differs by one tick (0.012 s) = harness phase, not a window. Nothing to restamp (no hash tool asserts the pyro frames; mash-bot/level1-pilot rows untouched).
## PART 1b RENAME: L14 passive 'CONFLAGRATION' -> 'CINDER SPREAD' (src/progression-catalog.js name; id stays 'conflagration' so saves/skill-glyphs/main.js tal('conflagration') keep working; docs/ability-audit.md). The meter spender keeps CONFLAGRATION. Note: a talent id 'stoke' also exists in the catalog (refund-on-lit) beside the new STOKE verb; left as is (see questions).
## PART 2 TUNE (pyro-side knobs only; pyro/--ways=practiced/--profile=human/flasks kit; same seeds 1-6 before/after)
| boss | before (kit 7d14a9fc) | after | band |
| stockade | 1/6 = 17% | 3/6 = 50% (12 seeds 7/12, seeds 13-24 7/12: 14/24 = 58%) | LOW -2 |
| burning | 4/6 = 67% | 4/6 = 67% | in |
| warcairn | 5/6 = 83% | 5/6 = 83% | HIGH (as before) |
| rookery | 5/6 = 83% | 5/6 = 83% | HIGH (as before) |
Knobs (src/flame-ward.js WARD): rec 0.4 -> 0.2 (the empty-ward root; main lever: 17 -> 50%), exposed 1.25 -> 1.1, new blockK 0.7 (late block stamina), cd 1.0 -> 0.75 (58%). Tried and rejected (no gain / worse): perfect 0.18, blockK 0.5, cd 0.6, contactK 0.8. Other heroes / boss numbers untouched. burning/warcairn/rookery did not move (the bot rarely hits the mistime there).
## TOOLS (PORT 8160, one at a time)
- Fixed: tools/ember-flare.mjs (cooldown assertion 0.8 -> 0.6, text 0.75 s) - the only restamp, because cd went 1.0 -> 0.75 on purpose.
- Green: ember-flare, pyro-kit, attack-animation, ability-poses (77/77), pyro-duel, ember-pilot (ward 7 wards / 6 parries), hero-pass, heat, dangling-paths, comments, homepaths, hero-keys-strip/sheet (regenerated).
- Measuring tools: pyromancer-pilot (pyro 1/4, dry, identical rows on base = unchanged), bot-calibrate --feel --seeds=1 (ran to a fit, no --write; residuals are the unburied/welltown/theatre bosses, not pyro).
- NOT clean: mark-integrity (most bosses SKIPPED: page CRASHED - the same 20 skips on the 7d14a9fc base) and textfit (a scope's page crashes: 'party' here, 'store' on the base) - machine memory with a gate running; rerun on a quiet PC.
## QUESTIONS (rec first)
1. Stockade 58% vs 60-70: accept (noise +-10 on 24 seeds) or take one more knob (rec: accept; next lever would be heatParry or the Stockade-specific bot plan in src/lab.js).
2. The ward cooldown is now 0.75 s (brief said ~1 s): keep (rec) - it was the second-biggest Stockade lever.
3. Talent id 'stoke' (refund on lit, L-tree) now shares a name with the STOKE crouch verb: rename the talent (rec CINDER REFUND?) in a follow-up - not done, saves key by id.
4. The ward banner words use SET.numbers; with words off she gets the old floating text only - fine?
