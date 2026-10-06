# claude/herobots - PALADIN + DEATH KNIGHT HERO bot gaps (base claude/bot2 38fe2c46)

Measured with `PORT=8661 node tools/boss-rates.mjs <rows> --ways=practiced --heroes=paladin|reaper --seeds=6 --jobs=2` (profile human, normal health,
campaign level). The Death Knight's hero id is **reaper**. Per-hit ledger: `tools/hero-hurt-trace.mjs <row> <hero> 1,2,3` (new, a measuring tool).
All fixes are in src/lab.js, v2 profiles only (`LABP.v2`), Death Knight only; the legacy bot is byte-identical (burning + unburied, 2 seeds, reaper,
`--profile=legacy`: same outcomes, seconds and damage on 38fe2c46 and on this branch).

## 0. Headline
- **Paladin: no bot gap left.** The 0/6 rows from HERO KIT's table came from its old harness. On BOT2's standard the paladin wins Fair 4/6 (was 0/6), the
  Archmage 2/6 (was 0/6; the knight is 3/4 on the same seeds), and everything else 2/6 to 6/6. The one zero left, the Gang Leader mini (welltown:mini),
  is **zero for every hero** (BOT2 section 4: 0/12), so it is not a paladin gap: it belongs to the lane that is on that row (a welltown:mini trace was running on this PC).
- **Death Knight: three bot gaps fixed** (swinging into a tell, ward held through a string, walking away from the Queen's stab); marsh and stockade move
  to the band's edge, burning 0 -> 2/6. Fair and Unburied stay 0/6 and are **kit/boss gaps** (recs below).

## 1. Table (6 seeds each, wins/6)
| row | hero | before -> after | cause | fix / rec |
|---|---|---|---|---|
| fair (Wicker Queen, L25) | paladin | 4/6 (HERO KIT: 0/6) | none left | BOT2's standard already fixed it |
| fallingtower (Archmage, L29) | paladin | 2/6 | same as the knight (3/4) | none; the Archmage is being retuned (ARCHMAGE3+4) |
| welltown:mini (Gang Leader, L31) | paladin | 0/6 | **all six heroes 0**: he kills a hero in 17-36 s (cut 354, whirl 191, cross 177 in 3 fights) | not a hero gap: rec 4 |
| wood / marsh / stockade / harbor / burning / unburied / Djinn | paladin | 6 / 4 / 3 / 6 / 5 / 5 / 2 | - | none |
| marsh (frog, L3) | death knight | 3/6 -> 4/6 (a 6/6 run in between: noise is +-2) | BOT gap: he began a 0.9 s swing into the frog's leap and tongue | punish window (fix A) |
| stockade (chief, L3) | death knight | 1/6 -> 4/6 | BOT gap: swings begun into the chief's walk-in and slam | punish window (fix A) |
| burning (pyromancer, L3) | death knight | 0/6 -> 2/6 (3 more at 9-20% left) | BOT gap: the per-boss branch pressed ATTACK at the same moment as the guard for his cut tell, so every cut found him mid-swing | punish window in the pyromancer branch (fix A) |
| fair (Wicker Queen, L25) | death knight | 0/6 -> 0/6 (boss left 21-36% -> 18-33%) | BOT gap fixed (the stab: he was walking away from it, `transit`, so he never looked): -50 damage a fight. **KIT gap left**: the floor fire (66 of 217 hp a fight): her floorTell is 0.59 s, he sees it 0.3 s late, and his walk cannot reach a horse in the other 0.3 s | fix B; rec 1 |
| unburied (Bloodknight, L29) | death knight | 0/6 -> 0/6 (boss left 44-59% at death -> 5-71%, four of six under 45%) | BOT gaps fixed (A, C). **KIT gap**: a mirror match: his blows come every ~1 s (cd 0.56 + 0.47 tell), a Death Knight swing is 0.9 s and cannot be answered (no ward, no roll) | rec 2 |
| welltown (Djinn, L31) | death knight | 1/6 -> 1/6 (dies at 9-25% left) | damage spread over eight mechanics (walk contact 56 a fight, pillar, devil, breath, glide...), no single missing answer | none; the per-boss branch is the Djinn lane's |
| wood / harbor / fallingtower | death knight | 5/6 / 4/6 / 5/6 after (HERO KIT 4 / 6 / 6) | harbor is 4/6 with the new hands switched off too (`dkPunish:false`): the move is the base bot's, not mine | none |

## 2. Fixes (src/lab.js, the per-HERO hands)
A. **THE PUNISH WINDOW** (`dkSwingOK`, `dkS`, `DK_FREE`; knob `prof.dkPunish`, default on; `prof.dkWin` 0.25 s). A Death Knight swing is 0.9 s light / 1.75 s heavy
   (src/main.js: `P.atk += dt*0.34`, 0.24 heavy), armoured through, but the ward cannot come up and he cannot roll until it and its recovery are done.
   The bot swung whenever the boss was in reach, so a tell that began a reaction time later (0.3 s) always found him mid-swing. Now, once the boss has
   shown a tell (or hurt him mid-swing) in the last 6-8 s, he begins a swing only in the quarter second after a blow of the boss's has ended or has hurt
   him, or when the boss is truly open / in his rest, reel, stuck, down (`DK_FREE`; `dkOpen()` asks `BK.bossOpen`, because `OPEN()` is TRUE for any boss with no
   opening of its own). Outside the window he holds the ward in front of the boss. The tracker runs at the top of the frame, so every per-boss branch sees it;
   hooked into the generic swing and the pyromancer's branch (one line each). Window grid on stockade / marsh / unburied, 6 seeds: 0.15, 0.25, 0.35, 0.5, 1.0 s;
   0.25 won stockade 4/6 (0.5 and 1.0: 0/6) and marsh 6/6.
B. **THE STAB** (Wicker Queen, one line): `transit` (running for the far side) is off for the Death Knight; he looks at her stab like everyone else.
C. **THE WARD IS LET GO AFTER A WARDED CUT** (the Bloodknight's strings, `prof.dkRelease`): the generic branch released on `dkHold`, but the bloodknight's own
   `guard()` held C through all 1-3 cuts of a string, which fills the ward and BREAKS it. Now it lets go for 0.2 s after the ward took a blow (the nova: it hurts him and heals the blood back).

## 3. Kit gaps (recs; no kit or boss was changed)
1. **Fair floor fire vs the slowest hero.** floorTell 0.59 s, then 1.5 s of burning floor; the Death Knight sees it 0.3 s late and walks too slowly to reach a horse
   (66 of his 217 hp a fight, the biggest single cut in that row). Rec: floorTell 0.59 -> 0.75 s (all heroes get 0.15 s; the others already win it 100%), or
   space the horses <= 90 px. Expected: the Death Knight's 18-33% left at death becomes a win in roughly half the fights (3/6).
2. **Death Knight vs a fast boss (Unburied; the Djinn too).** Light swing 0.9 s + recovery against a boss that strikes every ~1 s: every swing
   overlaps the next tell. Rec (either): the ward may be raised out of the last 0.25 s of a swing's recovery (`CM.recoveryFor`), or the armoured swing takes x0.75
   damage ("armoured through" should mean something). Expected: Unburied 0/6 -> ~2-3/6 (the bot is at 5-30% left in half its deaths now).
3. **The Death Knight's skills are not in the built way.** `TYPICAL_SKILLS.reaper` is empty and `makeSkillHands` returns at once for the reaper (his F/G keys are
   skeleton / surge), so every "built" row for him is a bare run. Rec: give him BONE ARMOR (cast when a tell is seen in reach) and SOUL REAP (in reach); BOT2's built column would then mean something for him.
4. **Gang Leader mini (welltown:mini) is 0/12 for knight/warden/pyro and 0/6 paladin** (kills in 17-36 s). Not hero-specific; belongs to the lane that is on that row.

## 4. Not changed
Pyro/warden/knight/paladin hands, every boss branch except the two lines above (the Wicker Queen's `transit`, the pyromancer's swing), bossLab's legacy
path (normal-health, small-adds, boss-navigation... all use `legacy`), kits, bosses. `tools/hero-hurt-trace.mjs` is new (measuring only).

## 5. Checks
Run: import of src/lab.js, legacy byte-identity (above), the rates above. NOT run: the full suite and the bossLab suite checks (the coordinator runs suites; all new
behaviour is behind `LABP.v2` and `h === 'reaper'`). Noise: +-2 wins of 6; rows read as "moved" only where the boss-left numbers moved with them.

## QUESTIONS FOR DANIEL (recommendation first)
1. Fair: floorTell 0.59 -> 0.75 s (rec) or leave the Death Knight at 0/6 there.
2. Death Knight swing recovery: let the ward cut it short in its last 0.25 s (rec), or x0.75 damage while armoured, or leave him as the heavy-hero identity.
3. Add the Death Knight's skills to the built column and the skill hands (rec).
