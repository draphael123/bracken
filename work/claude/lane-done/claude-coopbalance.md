# claude-coopbalance (sonnet) - co-op balance pass (brief 10-21), base master 7cc06bae

## What changed
- **Flasks for every seat**: each human seat carries its own save's flask count (a guest with no save: the host's max). Start of a wood, shrine (refills every seat by ITS save's count), wipe/back-to-shrine (deathRefill for every seat, as a solo death does), seat join. Drinking was already per-body; the seat plate (P2..P4) now shows a little bottle + count on its first line.
- **Split multiplier** (src/ai-companion.js `COOP`, `coopMulOf` = foes' hp, new `coopTakeOf` = blow on each hero, main.js `coopMul`/`coopTake`): hp x2 / x2.6 / x3.2 (2/3/4 seats, as approved); blow on each hero **x1.25 / x1.38 / x1.50** (measured, see below). The blow table covers damagePlayer, the breath, the ward's price, takeScale, the 29232 hit. An AI is a partial seat (AI_WEIGHT 0.5): a party's worth = people + 0.5/AI, the tables interpolate (one AI = hp x1.5 as before, blow x1.125); AI-only parties keep the old cap (worth <= 2).
- Tools: `tools/coop-boss-rates.mjs` (co-op boss rates: lab human bot on seat 1 + the co-op AI hands on the other seats, counted as people via `COOP.aiAsHuman`, or `--ai` for an AI party; `--dmg= --hp=` sweep the tables), `tools/coop-flasks.mjs` (new check: tables + 2 and 3 human seats: start flasks, a second seat drinks, shrine and wipe refill every seat, scale), `tools/level-walk.mjs --coop=N`, ai-companion.mjs scaling cases rewritten for the split.

## Rates (act I-II bosses: wood L3, kings L6, hanging L9, spore L4; knight/warden/pyro; campaign level, flask kit, profile human; win = boss down, no wipe; 480-720 s cap)
| party | blow x | wood | kings | hanging | spore | ALL |
|---|---|---|---|---|---|---|
| solo (8 seeds/hero) | 1 | 63% | 83% | 75% | 71% | **73%** (70/96) |
| 2p (hp x2) | 1.35 | 50% | 50% | 42% | 83% | 56% (27/48) |
| 2p | **1.25** | 58% | 75% | 42% | 92% | **67%** (32/48; re-run at the committed value: identical) |
| 3p (hp x2.6) | 1.45 | 33% | 50% | 50% | 67% | 50% (24/48) |
| 3p | 1.30 | 67% | 92% | 58% | 100% | 79% (38/48) |
| 3p | **1.38** | 58% | 75% | 50% | 92% | **69%** (33/48) |
| 4p (hp x3.2) | 1.35 | 83% | 100% | - | 100% | 94% (34/36) |
| 4p | **1.50** | 75% | 83% | - | 100% | **86%** (31/36) - still easy |
| 4p, hp x3.8 | 1.50 | 42% | 92% | - | 100% | 78% (28/36) |
| AI party (1 human + 1 AI, hp x1.5, blow x1.175 before / 1.125 now) | | 58% | 83% | - | 92% | 78% (28/36) |
Per hero (committed values): solo kn 26/32 wa 26/32 py 18/32; 2p kn 11/16 wa 12/16 py 9/16; 3p kn/wa/py 11/16 each; 4p kn 12/12 wa 11/12 py 8/12. No hero at 0 except wood warden 0/4 once at 4p hp 3.8.
Method caveat: the second/third seats are the co-op AI hands (the lab's duel hands), NOT the boss bot: they deal ~37% of the damage in 2p (wood knight+warden: 1.4k vs 0.5k) and the boss-specific plans are P1 only. A real human partner is stronger than this partner, so real co-op should land at or above these rates. Pyro+paladin is the weakest pair (the paladin AI contributes little).
**AI party**: kept the lighter scale. 78% vs solo 72% on the same bosses (wood/kings/spore) - not trivial, so no change.

## Checks (all on claude/coopbalance)
coop-progress GREEN, online-coop GREEN, tavern GREEN, hint-shown GREEN, save-slots GREEN, textfit party hud --strict GREEN (0 everything), coop-flasks GREEN (pure + page), ai-companion GREEN (one 'AI ended beside him 6.9 tiles' FAIL on the first run while the gate was loading the PC; the follow section alone passes twice, 0.7/0.8 tiles, and the full run was green on re-run).
mash-gate: 1 FAIL, **oreroad level hash changed since the mash bot ran - identical on plain master 7cc06bae** (not mine; solo is untouched by this lane).

## Level walks
Solo walks of marsh/kings (knight, pyro, 2 seeds) ran: 0-1 deaths. The `--coop=2` walker ends LOCKED at ~66% of marsh (the walker's raft/gate logic needs the whole party to ride; not worked on), so there is no co-op death count - the walker needs co-op hands before it can say anything. Not trusted, not used for the tuning.

## QUESTIONS FOR DANIEL
1. **4 players are still easy** (86% even at the top of the approved blow range x1.5, 78% with foe hp x3.8). Rec: leave 4p at hp x3.2 / blow x1.5 as built (the AI partner is weaker than a human, so the real 4p is harder than measured... but also three AI hands are not four coordinated people) and re-measure by hand with real players; if it plays too easy, raise 4p hp to ~x4 (not x3.8's 78% yet). Built: x3.2 / x1.5.
2. Pyro+paladin is weak as a bot pair (the paladin AI). Rec: a small AI pass on the paladin hands in a later lane. Built: nothing.
3. A co-op level walker (ferry/raft gates need the party) would let us read co-op deaths. Rec: separate lane. Built: `--coop=N` flag only.
