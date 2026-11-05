# claude/demonhunter - THE DEMON HUNTER, wired as a playable hero (code-only lane, 11-05)

Branch `claude/demonhunter` off master 42a1d4cd, worktree `bracken-demonhunter`. NOT merged, NOT deployed. Code only: no browser opened (release gate running), tools/check.mjs not run.
Hero id `demonhunter` (the reflect-kit row's id). Flag `HUNTER_SHIPS = false` (src/hero-roster.js). Lab unlock: `?hunter=1`, or `?level=<id>&hero=demonhunter` / `?boss=<id>&hero=demonhunter`.

## Design (docs/demon-hunter-design.md - written here, no kit design existed beyond Daniel's 10-01 interview)
Daniel 10-01: dual blades + a dash THROUGH foes that cuts (i-frames on the pass); chained hits build FURY spent on a finisher; bonus vs demons/corrupted; guard = a short backstep; unlocked by beating him in the knights' hidden temple off THE DEMON CITY, then bought.
Identity: **HE MARKS THEM AS HE PASSES, THEN HE COLLECTS.** The resource no one else has: **BRANDS live on the foe** (silver; placed by the dash, the third cut, the slip), and **FURY** is a fast tempo chain (0..10, +2 on a branded foe, keeps 1.6 s then bleeds, halved when he is hit) - not the Berserker's rage bar, not the Knight's links, not the Ranger's damage mark.
| verb | input | rule (numbers in `DH`, src/demon-hunter.js; first picks, untuned) |
|---|---|---|
| THE BLADES | X x3 | 10 dmg, commit light 0.072 (quickest in the game); third = THE SCISSOR x1.35, brands, +1 fury |
| heavy | hold X | the shared heavy (no special code) |
| THE HUNTER'S DASH | dodge | ROLL_LEN 0.24, cost 20, speed 300; passes through, cuts each foe once (k 0.6), brands it. First 0.2 s: a bolt it passes = POWER return (boltHome/reflect) |
| THE THROUGH-CUT | dash+X | DASH_STRIKE.demonhunter |
| THE BACKSTEP / THE SLIP | tap C | hop back; on the beat (RP_K.tap) of a yellow front blow = parry (RP.parried), striker branded, +2 fury. Red = TOO STRONG |
| BANISH | DOWN+C | 5 fury, nearest branded foe in 6 tiles: a small demon <= 40% is gone; else k 1.5 (demon x1.5); a boss k only (never removed) |
| THE RECKONING (ult) | UP+C, full fury | blinks to each branded foe in sight (max 6, i-frames), k 2.0 each, boss k 2.5; no brands = one cut on the nearest |
| vs demons | - | x1.15 always, x1.3 branded. Tag: `e.demon / e.corrupted / dkSkin 'demon' / name ~ demon|fiend|infernal|corrupt|imp` - THE DEMON ACT's foes should carry `demon: true` |

L1-L25: 10 actives (1 SILVER KNIVES, 3 CHAIN HOOK, 4 HOLY OIL, 5 OVER THE HORNS, 7 BLADE STORM, 9 WARDING SIGIL, 12 HUNTER'S CALL, 14 SILVER RAIN, 17 THE CHASE, 20 THE SENTENCE) + 21 passives in THE BLADES / THE BRAND / THE CHASE, capstones L22 UNENDING / L23 JUDGEMENT / L24 GHOST STEP. Hero perks RELENTLESS, SILVER-SWORN.
L25-50 (src/tech-hunter.js, kfork's shape): 25 SILVER WAKE; 30 REND THE BRAND (offence) / SILVER CHAINS (control) "TEAR IT OR BIND IT"; 35 THE LONG HUNT; 40 BLINK BACK (mobility) / SILVER WARD (defence) "GO THROUGH OR STAND OFF"; 45 FURY SURGE; 50 capstones THE CULLING (close) / THE SILVER STORM (far) "CUT THEM DOWN OR RAIN ON THEM". 8 upgrades I/II. FLAT fallback: progression.js registers `HUNTER_TECH_FLAT`; AT THE KFORK MERGE change `demonhunter: HUNTER_TECH_FLAT` to `HUNTER_TECH` (one line).

## Wiring checklist
- [x] roster: hero-roster.js HERO_IDS + `HUNTER_SHIPS = false` + HOW line; progression.js HERO_IDS, hp 95, HERO_PERKS, TECHNIQUES/UPGRADES
- [x] unlock: `DH_OPEN` = HUNTER_SHIPS || ?hunter=1 || ?hero=demonhunter (page only, never saved); PICK / store / co-op list (coopPickList reads PICK) skip him otherwise. HEROES row: feat `boss:huntertemple` then 10 silver / 800 gold (BZ_WIN's rule; level not built -> coin road shut)
- [x] HEROES desc, HERO_LOOP, TREE_WHO/TBR, HERO_SHORT, COOP_TAG, pick LINES/ROLE, both pick previews, HERO_ARMS, HERO_COLOR (oxblood + silver)
- [x] kit + resource + C verbs + ult + HUD bar (fury + keep line) + meter prompt + draw + clear on load + blow mul + third cut + dash pass + DASH_STRIKE
- [x] save: validateProgress accepts him (node); co-op: all hero state on P (P.dh*), brands on foes (two hunters share them)
- [x] skill slots: unchanged shared rule (1 slot, 2nd at L30, max 2) - his actives go through skillPress like everyone's
- [x] bots: lab.js LAB_REACH 22, DEFLECTS (taps the backstep on the beat), ULT_BOT (RECKONING), BK.dhk()/BK.dh(); bossLab `?boss=<id>&hero=demonhunter`
- [x] satellites: commit.js light/roll cost/roll len, hero-move, riposte PARRY_LOOK/ART, finishers HUNTED, controls row, voice (freebooter's), skill-glyphs, leveling.mjs perk count 18 -> 20
- [x] reflect-kit row: `REFLECT_ROW = { id: 'demonhunter', beat: 0.2 }` + P.dhDashAt; the dash's pass in its first 0.2 s returns a bolt (boltHome, else reflect) = POWER. Owed at the reflectkit/demonking integ: demon-king-hands calls `RP.parried` on 'power' for `DHK.dashAge() <= 0.2`; the slip is a normal parry (RP.parried)
- [ ] the hidden temple + his boss fight (the unlock), trial yard, SIG preview clip, own SFX/voice, own rig/poses/icons - owed

## Node results
- NEW tools/demon-hunter.mjs: **99 ok** (dash pass/brand/fury/power-return beat, fury keep/bleed/halve/full, scissor, demon tag + mults, backstep/slip incl. red/behind/off-beat, banish small/boss/chains, reckoning + culling + silver storm, all 10 actives, ladder shape, fork pack shape + every technique/upgrade/passive has a rule, flag/roster/save/commit, every hook once). Not registered in check.mjs (one-line add at integ).
- tech-cards PASS, progression PASS, coop-progress OK, talents OK (294 priced skills have consumers), keys OK, architecture OK, leveling OK (perk count 20). node --check on every changed src file OK.
- NOT run (open a browser): commitment, store, hero-roster, skill-icons, skill-passives, textfit, the suite.

## Browser owed
1. `?hunter=1`: pick + store card (textfit heropick/store: desc, LOOP, LINES 'DASH THROUGH: BRAND THEM'), HUD fury bar row (y vs level timer).
2. `?level=<any>&hero=demonhunter`: the dash really passes through bodies at speed 300 (main's roll may fight the vx override), the backstep hop distance (main's run code may eat vx), slip timing feel, brand chevrons readable, RECKONING blinks never into a wall.
3. commitment.mjs / store.mjs / hero-roster.mjs / skill-icons / skill-passives with his rows (actives fall back to the default icon).
4. bossLab n=6 on two bosses with the bot (watch dash i-frame spam).
5. co-op P2 hunter.

## Art owed
His own rig (now: bakeBerserkerHero in DH_PAL oxblood/silver - axes, not blades), dash/scissor/slip/reckoning poses (kitPose keys 'brace','throw','whirl','ring' are fallbacks), brand chevron, knives, sigil, rain, wake sprites (rect placeholders), 10 active icons, voice + SFX (freebooter's now), HUNTED finisher sig, trial yard art, the temple + his boss version.

## Expected balance
95 hp (mid-low), blade 10 x quick commit 0.072 (~14% more cuts than the knight's 11 x 0.084) -> about knight DPS off demons, ~+15-30% on demons. The DASH is the risk: a cut + brand + i-frames for 20 stamina, five passes from a full bar; vs a boss each pass is k 0.6 and two fury. If bossLab shows dash-spam above the band, first dial: dash k 0.6 -> 0.4 on bosses, or brands from the dash only on non-bosses. RECKONING on a boss = one k 2.5 cut (~25 at L0): modest by design.

## Questions (rec first, built)
1. Fury vs the Berserker's rage: BUILT fury as a fast tempo chain fed by BRANDS on foes (distinct). Alt: Daniel's plain "chained hits build fury" with no brands (simpler, overlaps rage).
2. Guard: BUILT tap C = backstep, a parry only on the beat (no i-frames; the dash is the i-frame verb). Alt: give the backstep a few i-frames.
3. Finisher: BUILT the ultimate THE RECKONING (UP+C, full fury) + a half-bar BANISH (DOWN+C). Alt: one finisher only.
4. Unlock: BUILT beat him in the hidden temple (feat boss:huntertemple), then 10 silver / 800 gold. Alt: coins only after the boss (no silver).
5. Placeholder rig = the Berserker's (two hands). Rec: keep until the art lane; the brief art should be two short blades.
