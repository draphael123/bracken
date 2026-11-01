# SMALL FIX 7 (claude/smallfix7, off 0fe14c26) - Burning Village unlock on King Gorm in one life + doused fire goes out visibly

## 1. Burning Village unlock
- Rule built: the village opens when KING GORM dies in ONE LIFE (P1, the burning wood between the phases, and the glade). A shrine respawn inside the fight (die() / coopWatch wipe) sets `gormFell` for the run; a flask or a co-op lift is not a death. The fight counts as live once the King is awake in the court (boss alive + bossActive) or his flee/glade `persist` exists, so a death walking up to him does not count. Retry = a new run (startGame resets). Saved per slot as `PROG.burningOpen`.
- Code: src/main.js (gormFightLive / gormNoteDeath / gormBeaten, hook at his real death in hurtEnemy0 beside queenDies; opensLocked `o.gorm`; spurReqText 'BEAT KING GORM WITHOUT FALLING'; spurTip second line; side-panel detail strip; progDefaults `burningMig`); src/level.js burning row `opensOn: { level: 'stockade', gorm: true }` (the spur still hangs off the Stockade's node; `needs: 'stockade'` kept). Banner on open: 'THE BURNING VILLAGE IS OPEN: A NEW ROAD OFF THE STOCKADE'; if he falls but the run was tainted: 'YOU FELL TO GORM: THE BURNING VILLAGE STAYS SHUT'. Boss rush / boss-select never open it.
- Old saves: migration `burningMig` grants `burningOpen` to any save with the Stockade cleared OR the village cleared (they had it unlocked under the old rule).
- Tools updated: class-spurs.mjs, map-forks.mjs, level-reach.mjs (assert the shut road shows 'LOCKED: BEAT KING GORM WITHOUT FALLING'). NEW tools/gorm-unlock.mjs: clean opens; death in P1 / burning wood / glade does not; pre-fight death does not count; retry opens; old saves keep it; Stockade clear alone stays shut.
- Co-op: counts when the party never wiped to the shrine (a downed-and-lifted hero is not a fall). Written on the hosting save only (other seats' saves are not credited).

## 2. Doused fire still drawn
Causes found (state cleared, picture not), Burning Village:
1. Grid straw fire: `douse()` set cells UNLIT but the `fires` entry that hurts AND draws lived on until villageTick's next sync (a frame) and nothing showed it going out. Fix: fire-spread douse/quench record `G.out`; main.js `villageOut()` kills the entries in the same call and puffs steam + hiss (splash from trough/well/tank wave and the thrown bucket/jug).
2. Doused BEAM (bucket on a burning beam, 'THE BEAM HOLDS'): the beam kept painting orange flame teeth while its fuse was held. Now wet dark wood, no flame, steam.
3. FLAME PILLAR put out by a burst tank wave: its vent kept glowing and flickering the 'about to roar' warning for the whole 14 s. Now a cold wet vent; a steam puff when it goes out.
4. DOUSED BURNING GOBLIN (`e.doused`): kept its flame over its head though it lit nothing. Flame gone while doused.
5. Hung roof beam: embers painted even when the cell under it was not burning. Now only over a burning/burnt cell.
6. Barn-roof wall (bucket or splash): already hidden by delay, now with steam puffs at each flame.
- Reverse (damage with no flame): checked the fires loop - damage, draw, light holes and bloom all read the same `delay <= 0`; no flame-less damage found. SOAKED (deliberate, told: 'SOAKED: FIRE CANNOT BURN YOU', steam off the hero in a flame) still shows flames that do not hurt you for 10 s - this may be what Daniel saw after striking a trough/well; see questions.
- Other levels' water verbs audited by reading: desert-foes2 patches (p.out stops the draw), cistern queen / djinn pours (boss-state), Lamplit (water only takes the thrown flame) - no mismatch found.
- NEW tools/douse-agree.mjs: (A) page: light straw, splash, in the SAME frame no flame stands over a non-burning cell and vice versa, steam went up; (B) source guards at each draw site (beam wet, pillar outT, goblin doused, hung-beam embers, villageOut calls). Part B passes in node now.

## Checks run
- RED FLAG: I ran `node tools/burning-village.mjs` (it opens a headless browser) while scratch/GATE-RUNNING.flag existed (batch136 07:04); I had not noticed the tool uses the page. It ran alone, 7 GB free, closed itself, passed ("the burning village keeps its promises", incl. bucket/beam/door douse). No other browser run.
- Source-guard half of douse-agree: pass (node). `node --check` on main/level/fire-spread/village-hands: pass.
- NOT RUN (gate flag still up, code-only): tools/gorm-unlock.mjs, tools/douse-agree.mjs page half, class-spurs.mjs, map-forks.mjs, level-reach.mjs, textfit for the 2 new lines (map tip 'LOCKED: BEAT KING GORM WITHOUT FALLING' / 'ONE LIFE, BOTH PHASES: FIGHT HIM AGAIN IN KINGSWOOD', hint lines), hintlevel.mjs. Run each directly (node tools/<x>.mjs) one at a time with >= 1500 MB free. The two new page tools were written blind (hooks BKT.gormUnlock/gormDie/gormWin, BKT.vil/vilSplash/vilIgnite) and may need a tweak to their scripted setup (begin/enter/finish helpers copy boss-fight-end).

## QUESTIONS FOR DANIEL (rec / what I built)
1. Migration: should a save that cleared the Stockade (but never met Gorm) keep the village? Rec/built: yes (it was unlocked for them). Alternative: only saves that played the village.
2. The spur still hangs off the STOCKADE node on the map (Gorm is later, in Kingswood). Rec: move the spur node to hang off Kingswood so you walk to it where you earned it - not built (touches map geometry checks); say go and a small lane does it.
3. SOAKED: striking a trough/well makes you immune to the village's fire for 10 s with the flames still drawn. If that is the thing you saw, rec: keep the immunity but dim/steam the flames near a soaked hero, or drop the immunity. Built: unchanged (told mechanic).
4. Co-op credit: built hosting-save only; rec to credit every seat's save if you want it per player.
