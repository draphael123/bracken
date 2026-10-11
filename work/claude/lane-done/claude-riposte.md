# claude/riposte: UNIVERSAL PARRY -> RIPOSTE, THE POISE BAR, THE MIX-UP CHAIN (Opus core, 2026-10-11)

Brief: scratch/brief-riposte.md (with the POISE BAR, KIT AUDIT and MIX-UP CHAIN addenda). Base: origin/claude/batch85 (master + the Berserker).
Branch: claude/riposte. Port 8831. Art is still placeholder; the list for the Sonnet art lane is below.

## WHAT IS BUILT
The shared logic is in a new module, **src/riposte.js** (`makeRiposte`). It holds one constant table (`PARRY`), the duelist set, `PARRY_LOOK` (each hero's look, input and colour, which the moves list can read), `MIX` and `VERB_OF`. main.js gets only one-line hooks, each commented `(claude/riposte)`. Nothing runs as a second parry system: every hero's existing answer is now the entry point to the shared parry.

| Hero | Parry look (existing answer, unified) | Beat |
|---|---|---|
| Knight | shield perfect guard (his heavy riposte cut kept on top) | `perfectWindow()` |
| Paladin | aegis raised on the beat. **Every paladin now has this; it was MOVING FORTRESS only.** The talent widens it to 0.22 s. | `perfectWindow()` |
| Freebooter | tapped parry (`parryW`) | tap (0.2 s) |
| Warden | deflect. Only the first `PARRY.tap` of the sweep is a parry; later in the sweep it still turns the blow, with a short flinch. | tap |
| Berserker | brace (live 0.3 s, takes one blow) | brace window |
| Pyromancer | ember flare (catches blows and seeds) | flare window |
| Geomancer | rune-ward on the beat (`wardPerfect`) | her own beat |
| Death Knight | ward let go as the blow lands (`wardReturn`) | `WARD_BEAT` |

No hero needed a new input: all 8 already had a guard or parry key.

- **The hero's payoff.** A parry sets `P.riposteT = PARRY.window` (0.6 s), `P.ripSrc = 'parry'`, a placeholder catch pose (squash plus `P.rpPoseT`) and teaches `lessonHint('parry')`. The next cut is tagged `[verb, 'riposte']`, as before.
- **Common foes** (one reaction, `RP.react`, no per-kind code). The foe reels for `foeHold` 0.6 s: its AI waits, its token is released, and a mid-tell windup is retold. You see a gold ring, `RIPOSTE` and `SFX.riposte`, plus the shared recoil pose (poise-break `staggerPose`). The riposte cut into it pays **x2 once** (`RP.payoff`).
- **Elites.** The stagger is shorter (0.35 s) and the riposte still pays x2. The **second riposte breaks his guard**: his poise is emptied into the existing `breakBeat -> EK.broke` opening. While parried, `elite-kit guarding()` is off so the riposte goes in.
- **Bosses and minis.**
  - A parry gives a **short told opening**: 0.5 s, or 0.9 s for a duelist (`DUELISTS` = closedhelm (the Crusader), paladinboss, fogknight, bloodknight, deathknight, pyromancer).
  - Inside it, every hero blow lands x1.5. boss-greed `openOf`/`ruleOpen` treat it as open, so there is no chip, no greed reprisal and no wall turn.
  - When it ends comes a **3 s B3 ward**. A parry in the ward turns the blow but opens nothing and says WARDED. It is told by a pale ring and bar (`RP.drawRead`), the shared B10 read: a gold ring plus timer bar while open.
  - Blades are never made immune: the B13/B15 floor is untouched.
- **Red (!!) blows and bolts.** A red blow, or a piercing **projectile** (no melee attacker), met on the beat is not parried. It lands and says **TOO STRONG** (`rpAnswerUp` + `RP.tooStrong`). A melee pierce, i.e. the Crusader's follow-up, is still parryable on its own glint, as his design requires.
- **The poise bar.** It is the existing `addPoise` number; there is no parallel one.
  - Shown thin and gold **under the boss/mini HUD health bar** in every BAR/%/NUMBERS mode, and **under an elite's plate health bar**. It flashes white while broken and goes grey in the ward. The overhead bar is suppressed for those.
  - The riposte cut now really leans on it. The old `P.riposteT > 0` +16 never fired, because the window is spent as the cut starts; it is now `rpCut()`.
  - **The level's verb leans most** (+35). The rising edge of an OPEN_RULE opening that is not a break or a parry is that boss's verb: bell, water, cage and so on.
  - A boss's **break** gets the same gold read, then the same 3 s told ward (`poiseCd` already forbade a second break).
- **The mix-up chain** (per hero object, so per player in co-op).
  - Each **landed** blow with a different verb than the last adds a pip, up to 5. Verbs: cut, heavy, sweep, rise, plunge, throw, dash, shot, riposte, skill, from the blow tag.
  - Each pip is +6% damage, and the same multiplier applies to poise wear in `addPoise`.
  - Repeating a verb does nothing. Taking a hit, or 3 s idle, resets it.
  - Gold pips are drawn beside the HP bar in both HUD modes, steady under reduce-motion, with a rising `SFX.mixPip` chime.
- **The teach.** The wood's lesson sign now has a line for all 8 heroes naming their parry and the riposte; geomancer and berserker had none, and the pyro/reaper lines were the outdated "roll through". The lesson hint names the riposte. The moves-list rows were appended to scratch/brief-moves.md (data: `PARRY_LOOK`).
- **The riposte is paid once.** Before this, a common foe took the riposte x2 (`swingMul`) times the finisher's `finishMul` x2.2 (about 4.4x), and the knight took heavy x OPENED UP x2.2 (about 5x). Now:
  - A parry riposte pays the shared x2 and skips `finishMul`; it still finishes a low foe.
  - The knight's OPENED UP x1.5, and its forced poise fill, are folded into the shared x2. The knight keeps his heavy third cut on top, about 3x total.
  - The RIPOSTE talent's plain-block x2 is unchanged.

## HOOKS (file:line, at a1eb0e50+)
- src/main.js:113 import. 7346-7360: install, `rpBreak`, `rpLean`, `rpCut`, `rpAnswerUp`, `rpSkillBlow`. 916: `P.skillAt`. 6433: `rpFoe`.
- damagePlayer0:
  - 6461: TOO STRONG
  - 6492: paladin
  - 6505: freebooter
  - 6521: warden
  - 6549: the bolt pierces even a perfect guard
  - 6559: knight
  - 6606: a hit resets the chain
- 7099: chain on poise. 7185: `deflectAt`. 7566-7567: payoff and chain in hurtEnemy0. 7572: finisher paid once. 8627: hint.
- 24408: Death Knight `wardReturn`. 24891: parried recoil pose. 25054: `RP.tick` in updateEnemies, before BROKEN. 25777/25810/25818: berserker, geomancer and ember apis. 26472-26474: `swingMul` and the RIPOSTE word.
- Drawing: 29343-29344 overhead poise bar and boss read; 3908 elite plate poise bar; 6363 every hero's riposte glint; 31500 pips; 31702 boss/mini HUD poise bar. 31945: `BK.riposte`.
- Other files:
  - src/boss-greed.js:175, 194
  - src/elite-kit.js:181
  - src/geomancer.js:226
  - src/berserker.js:99
  - src/ember-ward.js:93
  - src/poise-break.js:31
  - src/audio.js:344 (`mixPip`)
  - src/level.js:321 (sign)
  - tools/boss-run.mjs (rows report riposte stats)
  - tools/check.mjs (adds riposte)

## CHECKS (all green, PORT 8831, sequential)
- **New: tools/riposte.mjs** (added to `npm run check`).
  - All 8 heroes parry through their real input, and the foe reels. Riposte ratio vs the plain first cut: knight 3.6 (heavy on top), pyro 2.57, paladin 2.0, freebooter 2.0, death knight 2.0, warden 2.0, geomancer 2.46, berserker 2.0.
  - A red blow on the beat lands and says TOO STRONG, for all 8.
  - Elite: stagger 0.35, one riposte does not break him, the second does.
  - Chief: open 0.5 s; Fog Knight (duelist): open 0.9 s. Both have `openOf` true, then a 3 s ward; a parry in the ward reopens nothing; the poise bar draws; a break ends in the ward.
  - Chain: mash gives 0 pips; mixed verbs give 0,1,2,3,4,5,5 pips with damage 100 to 130; a hit resets; 3 s idle resets; poise wear x1.3 at 5 pips.
- Existing checks:
  - knight-rework: riposte 30 vs 10, was 51 (see "paid once")
  - geomancer
  - berserker
  - ember-flare
  - hero-trials
  - reaper-input
  - combat-part2 (foe-react)
  - elites
  - boss-openings
  - boss-read
  - blow-tags
  - untold-told
  - tells
  - mark-integrity
  - finishers
  - commitment
  - talents
- **Mash bot, 3 levels, boss fights** (knight/warden/pyro x2): stockade 0/6 (6 timeouts, 0 blows landed: the bot never reached the chief, so this is not a stress test of the chief), towpath 0/6 (dead), ksar 0/6 (dead).
- **Not run:** the full suite and textfit. The HUD poise bar sits under the boss bar at y VH-4..VH-2 inside the plate, and the pips are at x70 y6, clear of the meter-prompt strip; both deserve a textfit/uihud pass in integration.

## 3-SEED SANITY: human profile, campaign level, kit flasks, practiced (knight/warden/pyro)
No tuning, as the brief says; the flask sweep tunes after.

| Boss | Before (batch85) | After | Shift |
|---|---|---|---|
| stockade (chief) L3 | 2/3 3/3 3/3 = 89% | 1/3 3/3 3/3 = 78% | -11 (knight s1: one fight) |
| towpath (Fog Knight, duelist) L25 | 9/9 = 100% | 9/9 = 100% | 0 |
| marsh (frog) L3 | 2/3 3/3 2/3 = 78% | 9/9 = 100% | +22 |
| ksar (Hawk-Mistress) L39 | 3/3 1/3 3/3 = 78% | 3/3 1/3 2/3 = 67% | -11 |

At n=9 every shift is one or two fights, i.e. noise; all four were already HIGH before this lane.

**Does the human bot parry and mix verbs?**
- It **rarely parries**: 0-1 parries a fight on stockade, towpath and marsh. On ksar the knight parried 3-5 times a fight and opened the Hawk-Mistress 2-4 times (1 opening hit landed).
- It **mixes some verbs**: max 0-4 pips a fight, mostly "cut", with sweep/plunge/shot/dash/rise. Towpath runs got the most pips (7-16 a fight).
- So bot rates understate what a player who parries and mixes will get. The flask sweep should add a parry/mix habit to the human profile, or tune with that in mind.

## ART NEEDS (Sonnet art lane)
1. **A PARRY POSE (the catch) per hero, x8**, 0.24 s, keyed off `P.rpPoseT` (set by `RP.parried`): knight shield catch, warden spear deflect, berserker axe brace, paladin light-ward, pyro flame-catch, geomancer stone-skin, freebooter cutlass bind, death knight blade bind. Today it is only a squash.
2. **A RIPOSTE STRIKE per hero, x8**, 2-3 keyframes (step-in, the cut/thrust, follow-through), keyed off `P.swingRiposte && P.atk >= 0`. Today it reuses the normal swing; the knight's reuses his heavy third cut.
3. **The riposte glint per weapon**: `drawRiposteGlint` (main.js ~6360) now draws for all 8, with the knight's sword-hand offset (`P.face*7`, -12) for everyone. It needs a hand/weapon offset per hero and the `PARRY_LOOK` colour.
4. **A gold flash and sound per hero** for the parry. Today it is each hero's existing parry SFX plus a shared `SFX.riposte` on the foe.
5. **The foe's PARRIED stagger pose** for the common kinds (sprig/soldier/cutlass/zombie/husk/goblins first). Today it is the shared poise-break recoil (`staggerPose`, driven by `e.rpHold`).
6. **The boss read** (`RP.drawRead`): a placeholder 1 px gold ring plus a 26 px timer bar over the head, pale for the ward. It should match the per-boss B10 reads.
7. **The poise bar art**: a 120x1 HUD bar under the boss bar and a 28x1 bar under the elite plate. Possibly a notch or glow when near full.
8. **Mix-up pips**: five 3x3 gold squares at HUD x70 y6. A small pip sprite, and the co-op P2 plate's pips (not drawn yet).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **Was the riposte too rich?** Before this lane a parry riposte on a common foe paid ~4.4x (x2 swing x finisher 2.2) and the knight's ~5x.
   - Rec: **~2x as the brief says** (built). The knight is ~3x because his heavy third cut stays on top.
   - Alternative: let the finisher's x2.2 stack again.
2. **Off-beat warden deflect.** It used to stagger a foe 1.1 s, more than the new 0.6 s parry reel.
   - Rec: **the off-beat deflect turns the blow with a 0.4 s flinch** and only the beat parries (built).
   - Alternative: keep 1.1 s.
3. **Paladin parry without MOVING FORTRESS.**
   - Rec: **every paladin parries on the beat** (`perfectWindow`); the talent widens it to 0.22 s (built).
4. **The boss ward after an opening.**
   - Rec: **the ward blocks only the reopen**, so a parry in the ward turns the blow but opens nothing; blades still land at his normal value, per B13/B15 (built).
   - Alternative: make the ward immune to blades, as B3 literally says. I didn't, because it would make a parry a net damage loss.
5. **Puzzle bosses on `POISE_SKIP`** (the Winchmaster, Djinn, Colossus...) still have no poise bar or break.
   - Rec: **keep them off**; their rule is their opening (built). They do get the riposte opening.
6. **The old MIXED UP** (three verbs in 4 s means the next blow x1.5 and a break, commons only) still runs beside the new chain.
   - Rec: **fold MIXED UP into the chain at 3 pips** in a small follow-up. Not done here: the brief didn't ask, and it touches the knight-rework and finishers checks.
7. **Melee pierce.** The Crusader's pierce follow-up stays parryable on its own glint; only projectile bolts are TOO STRONG.
   - Rec: keep (built).
