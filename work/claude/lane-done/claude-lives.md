# claude/lives - LIVES option (Daniel 11-07)
Branch claude/lives off master 95bc267a4. NOT merged, NOT deployed. Code-only: no browser was started.

## What changed
- src/lives.js (new, pure): PROG.lives 'off'|'on', lock rules (flag livesLocked at the first campaign entry, or any level record), 5 lives, +1 per 100 coins (coinTick), loseLife, slot-card tag.
- src/main.js:
  - NEW SAVE RULES CARD: a new heroPick stage 'rules' before the hero pick (once per save, LIVES: OFF pre-selected; left/right/tap toggles; Z / tap continues). Not shown to a save that already started, nor in tool runs (BK.manualSimulation); a tool shows it with BK.ui.heroPickStage = 'rules'.
  - Lock: startGame on a campaign wood sets PROG.livesLocked (saved); setLives refuses after that. Slot card shows LIVES (gold, read-only) for an ON save.
  - Existing `let lives = Infinity` was the Iron Knight (Settings) pool: 3 lives, gameover state, HUD row. REUSED: one `lifeRule()` (= LIVES ON on a campaign wood, or Iron Knight) now drives the death cost, the GAME OVER state and the HUD offset; Iron Knight itself is unchanged (3 lives, no coin lives, medal).
  - ON: lives = 5 at each campaign entry; livesCoin() at the 3 pickup sites (acorn pickup, collectAcorn, pieces of eight) -> +1 life per 100 picked up THIS level, '+1 LIFE' green word + SFX.sting + burst. A bag you win back is NOT a pickup.
  - die(): lifeRule -> lives-1 with the existing 'N LIVES LEFT' toast; deathCost (shrine respawn, salt) still runs. Last life -> existing 'gameover' state -> Z -> WORLD MAP (gotoLevelNode); re-entry restarts on 5.
  - HUD: hero-icon + 'x5' + 'LIVES' row only when ON on a campaign wood (red at 1); GAME OVER card text says GAME OVER / "enter the level again with 5 lives" when ON.
  - Excluded (livesWood): Boss Rush, Boss Select, trials, shops, tavern, duel pit, editor test, hidden non-secret woods (yard/arena). OFF = byte-for-byte today's rules.
- index.html: modulepreload for src/lives.js. tools/lives.mjs (new).

## Co-op decision
Local co-op: ONE shared pool for the party (5 per level, +1 per 100 coins picked up by anyone); each real fall (not a downed partner who gets revived) costs one; pool empty -> game over for the party. Online: the host's save rules and the host's pool (guests follow the host sim). Rec kept; flip to per-player later if Daniel prefers.

## Verified
- node --check src/main.js, src/lives.js, tools/lives.mjs: ok
- node tools/lives.mjs: GREEN (pick + lock, 5 lives, +1 per 100, game over -> map, OFF unchanged, saves carry the field, source-wiring greps)
- node tools/demo-save-carry.mjs: all green (demo export/import path unchanged; lives rides the save JSON, asserted in lives.mjs section D)
- NOT run (browser tools): tools/save-slots.mjs, save-safety.mjs, textfit (slot card / new card), lesson-opening, hero-roster. Run these when the machine is free.

## OWED browser stills
1. NEW SAVE rules card (OFF and ON states), touch + keyboard.
2. HUD heart row 'x5 LIVES' on a campaign wood (and absent with OFF, absent in Boss Rush/yard).
3. '+1 LIFE' on the 100th coin (word, sound, count goes x5 -> x6).
4. GAME OVER card with ON, Z -> world map, re-enter shows x5.
5. Slot card 'LIVES' tag (with and without COMPLETE), textfit slots check.
6. Co-op: two seats share the pool.

## Questions (rec first)
1. DIFFICULTY PICK DOES NOT EXIST on master (no UI sets PROG.mode; only src/difficulty.js). The card has LIVES only; rec: the difficulty-picker lane adds its row to the same card (it is rule 'newRulesDue' + the 'rules' stage). Say if you want me to add the difficulty row now.
2. Cap on lives? Rec: none (coins are the cost), HUD shows xN.
3. Iron Knight (Settings) overlaps with LIVES ON. Rec: leave it; when ON, ON wins (5 + coin lives).
4. Should GAME OVER also forfeit anything beyond the normal death cost? Rec: no (as you specified).
