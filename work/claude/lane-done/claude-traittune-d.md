# claude-traittune-d  (branch claude/traittune-d; TRAITS_SHIP=false, CHARMS2_SHIP=false in the final commit; nothing merged to master, nothing deployed)

## TOP: Daniel's two priority items

### 1. DEMO bosses, juice ON, TRAITS off vs on (+CHARMS2 on), knight/warden/pyro, kit flasks, NORMAL
Run in a throwaway worktree (claude/traittune-d + origin/claude/juice2 merged, JUICE2_SHIPS=true; never pushed, removed afterwards).
KING GORM is NOT the Frog King: he is the KINGSWOOD boss (level `kings`, L9). Frog King = MARSH WOOD (`marsh`, L3). CHIEFTAIN = `stockade` L4. PYROMANCER = THE BURNING VILLAGE `burning` L5.
Wins/n as kn/wa/py (n=6 per hero for Gorm, n=12 per hero for Chieftain and Pyromancer):

| boss | way | OFF | ON |
|---|---|---|---|
| KING GORM L9 | practiced | 3/6 6/6 4/6 = 13/18 72% | 4/6 6/6 5/6 = 15/18 83% |
| KING GORM L9 | built | 4/6 6/6 6/6 = 16/18 89% | 4/6 6/6 6/6 = 16/18 89% |
| CHIEFTAIN L4 | practiced | 7/12 4/12 9/12 = 20/36 56% | 7/12 4/12 7/12 = 18/36 50% |
| CHIEFTAIN L4 | built | 8/12 4/12 7/12 = 19/36 53% | 8/12 5/12 4/12 = 17/36 47% |
| PYROMANCER L5 | practiced | 4/12 12/12 12/12 = 28/36 78% | 2/12 12/12 11/12 = 25/36 69% |
| PYROMANCER L5 | built | 11/12 12/12 7/12 = 30/36 83% | 12/12 12/12 5/12 = 29/36 81% |

Reading: traits ON moves the three demo bosses by -9 to +11 points, all inside the 95% intervals (n=18-36). No demo boss needs a tune. Caveats that exist with the flag OFF too: Chieftain is below the 60-70 band for the bot (53-56%, warden 4/12), the Pyromancer is easy for warden/pyro and hard for the practiced knight bot (4/12 OFF), Gorm is high. At L3-5 the bot wears 1 trait (pyro emberSkin, knight vengeance), so the change is small, as the plan expected.
Raw: work/claude/traittune-d/demo-*.json and .log, demo-pooled.txt.

### 2. OLD (pre-traits v1) save with TRAITS_SHIP on: PASS
New tool `node tools/old-save-traits.mjs` (node only, committed). It loads tools/fixtures/progression-v1-passives.json (a real v1 save: knight L9, pyro L5) and a synthetic long v1 save (4 heroes: knight L52, pyro L39, warden L29, ranger L23) with TRAITS_SHIP on, and asserts: no throw; every field except `traits`/receipt/version identical to the flag-off migration (levels, xp, coins, done, talents, skillOwned, loadouts intact); load -> export -> load -> export is byte-stable (idempotent); `traits` survives the round trip. Output: both PASS (short save writes {"knight":["vengeance"],"pyro":["emberSkin"]}; long save writes 2 slots per hero). Also exit 0 with the flag OFF: progression (180 nodes / 36 legacy fixtures), talents, hero-ledger, save-safety, skill-passives, traits, charms2.
Expected behaviour, not a failure: an old save with many owned passives keeps core + only the worn slots (1 slot, 2 from L20); the rest of its owned passives are off until worn.
Not done: a real browser load of a localStorage v1 save (node round-trip only).

## Merge
`git merge origin/claude/batch157` (be938d79f) into 2f29b31a8: clean, no conflicts, result eb58027d7. node --check on the touched src files: ok. Pushed.

## Method (tool change only; flags untouched)
tools/boss-run.mjs: `BOSS_TRAITS=on|core|<id,id>` (off/unset = today) flips TRAITS_SHIP in the page before the fight (on = the bot wears its defaults) and CHARMS2_SHIP (`BOSS_CHARMS2=0` skips). Limitation: boss-run bots wear no charm, so CHARMS2_SHIP has no effect on these rows.
Protocol: tools/boss-rates.mjs, practiced + built, NORMAL, flasks=kit, human profile, seeds 1-6 per hero, widened with SEED0 for n=12. Rows: marsh (FROG KING L3), stockade (CHIEFTAIN L4), scree (RAM LORD L10), crown (GOBLIN QUEEN L21), causeway (KRAKEN L29; the Kraken's level is THE DROWNED CAUSEWAY), waymeet (CRUSADER L30), unburied (DEATH KNIGHT L41), mage (MAGE'S FOLLY L42). Ranger and geomancer added on crown/causeway/waymeet/mage/unburied. 0 errored fights in about 1,300 runs. Juice off for the main list (the sim does not depend on it).

## Full OFF vs ON table (wins/n per hero; before any tune, ON = old pyro defaults)
Hero order kn/wa/py/ra/ge (early bosses kn/wa/py). crown/causeway/waymeet n=12 per hero, stockade n=12, others n=6. Demo rows (Gorm, Chieftain, Pyromancer) are in section 1.

| boss L | way | OFF | ON |
|---|---|---|---|
| FROG KING marsh L3 | practiced | 3 1 5 /6 = 9/18 50% | 3 1 5 = 9/18 50% |
| FROG KING | built | 3 1 2 = 6/18 33% | 3 1 5 = 9/18 50% |
| RAM LORD scree L10 | practiced | 3 5 6 = 14/18 78% | 4 5 6 = 15/18 83% |
| RAM LORD | built | 3 3 6 = 12/18 67% | 5 2 6 = 13/18 72% |
| GOBLIN QUEEN crown L21 | practiced | 5 0 10 4 0 /12 = 19/60 32% | 5 0 6 4 0 = 15/60 25% |
| GOBLIN QUEEN | built | 11 1 11 8 5 = 36/60 60% | 9 4 10 5 5 = 33/60 55% |
| KRAKEN causeway L29 | practiced | 7 3 11 3 5 = 29/60 48% | 8 3 3 3 5 = 22/60 37% |
| KRAKEN | built | 9 4 12 5 7 = 37/60 62% | 10 5 12 6 8 = 41/60 68% |
| CRUSADER waymeet L30 | practiced | 4 11 10 3 0 = 28/60 47% | 1 10 11 0 0 = 22/60 37% |
| CRUSADER | built | 11 12 12 11 8 = 54/60 90% | 7 12 12 10 7 = 48/60 80% |
| DEATH KNIGHT unburied L41 | practiced | 0 6 5 3 4 /6 = 18/30 60% | 1 6 4 1 4 = 16/30 53% |
| DEATH KNIGHT | built | 30/30 100% | 30/30 100% |
| MAGE'S FOLLY mage L42 | practiced | 4 3 3 0 4 = 14/30 47% | 5 1 2 2 4 = 14/30 47% |
| MAGE'S FOLLY | built | 28/30 93% | 27/30 90% |

Early (L3-L10): about 0, as expected. Mid/late: mean about -4 points, inside noise except two heroes (below). The band is read on practiced, and most bosses already sit under 60% for the bot with the flag OFF (Goblin Queen practiced 32%, warden and geomancer 0/12 there), so that is not caused by traits and is not touched here. Full per-hero text: work/claude/traittune-d/final-tables.txt; raw JSON beside it.

## The two real drops (n=12) and what was done
1. PYRO, practiced, from L16-20 up (old defaults emberSkin + heatShield): KRAKEN 11/12 -> 3/12, GOBLIN QUEEN 10/12 -> 6/12. Trait probes at the Kraken (practiced, n=12): core only 3/12, brand+wildfire 3, longFlame+scatter 3, jetWalk+inferno 3, twin+blaze 5, phoenix+emberHeart 7, emberSkin+phoenix 8, heatShield+phoenix 10. The loss is the old stack of about 20 passives going to 2 slots, and the one that carries the bare pyro is PHOENIX (the revive).
   TUNE (src/traits-b.js, no value raised above today): pyro `defaults ['emberSkin','heatShield'] -> ['emberSkin','phoenix']`, and `learnAt.phoenix 16 -> 10` (tools/traits.mjs asserts every default arrives by L10; slot 2 opens at L20 anyway, so the only side effect is a pyro may wear phoenix in slot 1 from L10).
   After, pyro practiced ON n=12: Kraken 8/12 (67%), Goblin Queen 10/12 (83%), Crusader 11/12, Death Knight 12/12, Mage 8/12; built 11-12/12 everywhere except Goblin Queen 8/12. Early bosses unchanged (slot 1 is emberSkin before and after). tools/traits.mjs, progression, talents, hero-ledger, save-safety, skill-passives, charms2 and old-save-traits all exit 0 after the change.
2. KNIGHT, built, THE CRUSADER (L30): 92% OFF (22/24) -> 50% ON (12/24); practiced 4/12 -> 1/12. Goblin Queen knight built 11/12 -> 9/12. NOT FIXED (see question 1). Probes at the Crusader (built, n=12): riposte+counterstroke 8/12, vengeance+riposte 7/12, plated+unbroken 6/12; none clearly beats the default (5/12 on the second seed block), and counterstroke arrives at L16 so it cannot be a default under the L10 rule. The remaining lever is (c): move RIPOSTE (or counterstroke) into knight core, a design call (the Crusader is a parry duelist).
Warden/ranger/geomancer: no drop outside noise (ranger practiced 3/12 -> 0/12 at the Crusader only; geomancer 0/12 both).
Levers not used: boss damage/tells (no boss touched), no resist changed (0.4x floor intact), no rank above today (RANK stays 0.70/0.85/1.0), forks off, paladin unsplit.

## Flip (exact one-liners; left OFF in this commit)
- src/traits.js line 26: `export const TRAITS_SHIP = false;` -> `true`
- src/charms2.js line 16: `export const CHARMS2_SHIP = false;` -> `true`
Paladin stays unsplit (all passives on) while TRAITS_SHIP is on.

## Playtest on the flipped build (the bot never pogos, air-rolls or plays the purse)
1. GOBLIN QUEEN (crown, L21, first fight with the second trait slot): bot -7 points practiced; check slot choice by swapping a trait.
2. MAGE'S FOLLY (L42): bot parity (47% / 90%) says nothing about whether the movement traits (air-roll, pogo, jetWalk, vaulter) earn a slot; only a human reads that.
3. DEATH KNIGHT (L41, duelist): bot knight 0-1/6 practiced either way; the knight trait choice (riposte/counterstroke) is what to feel here. If time, also play THE CRUSADER (waymeet) as the knight, where the bot fell 92% -> 50%.
The L3-L10 bosses read the same within noise.

## What is owed
- Browser smoke items from traitbatch: geomancer.mjs, berserker.mjs, textfit for the TRAITS tab and CHARMS rows, level-up line wrap, feel, co-op/PvP flag-on smoke, store-ui, "best pair is not two shared traits". Not run (browser budget went to the rate matrix).
- A real-browser load of an old localStorage save with the flag on.
- Goblin Queen and Chieftain are under band for the bot with the flag OFF (separate lane). progression-economy.mjs crash still owed. tools/check.mjs not run (per brief).

## Questions for Daniel (rec first)
1. Knight at THE CRUSADER lost about 40 points (built bot) under traits. REC: move RIPOSTE to knight core (the parry answer to a parry duelist; core is on at its level, no slot), keep vengeance+bash as defaults, re-run waymeet and crown knight built at n=12 before the flip. Alternative: accept it (L30 boss, not on the demo path).
2. Pyro defaults are now emberSkin + phoenix with phoenix learned at L10 (was L16). REC: keep. Alternative: make PHOENIX pyro core (every pyro gets the revive).
3. Flip order: TRAITS_SHIP after Daniel plays the 3 bosses above; CHARMS2_SHIP independent. REC: yes.
