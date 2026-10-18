# claude/actcards - ACT CARDS (B4) + BOSS-KILL BEAT (B3)
Built static-only (no browser run; PC memory rule). `node tools/act-cards.mjs` = 16 green (logic + source wiring).

## What was built
- `src/act-cards.js` (pure): act table lookup from `foe-react.js ACTS` (act number + name), card timing, beat curve/plan.
- ACT CARD: "ACT II" over "THE CRAGS", 2.0 s (0.35 in / 0.5 out), drawn at 22% height over the level's iris-in, above the existing level-name banner. `startActCard()` runs at the end of `startGame`. Never modal: no state change, no stop, no key eaten.
  - Save field: `PROG.actSeen = { 1: 1, 2: 1, ... }` (whole PROG is saved, so it rides the slot). Written the moment the card shows.
  - Never on replay/death-retry (flag set). Skipped for rush, trial, shop, boss-jump, editor test, levels in no act. A save that has already cleared any level of the act is treated as seen (no card for veterans on first load).
- BOSS-KILL BEAT: `startBossBeat()` fires on the first frame `bossWon > 0` (every boss death routine funnels into bossWon), guarded by `bossBeat` (cleared only on level load: cannot double-fire; co-op is one level/one boss so one beat). 0.5 s: `slowT = max(slowT, 0.5)` (existing 0.3x slow-mo path) + camera eases toward the body (45% of the gap, easing at dt*8) + bossZoom +0.18 at the peak. Existing death FX, `bossWon` timer (2.2-4.2 s) and win card/gate are untouched, the beat runs INSIDE that window, so nothing waits on it.
  - Stinger: existing `SFX.bossDown` (synth + recorded layer). It was only called by queenDies/chiefDies/rush, so I moved queenDies' call into the beat (no double). AUDIOCOMBAT could supply a bespoke stinger per major boss (hook: `SFX.bossDown()` in `startBossBeat`).
  - Reduce motion: stinger kept, slow-mo/push/zoom dropped. Test bypass: `?nobeat=1` does the same (stinger only).
  - Not covered: the Chieftain (`chiefDies`, escape sequence, no bossWon; it keeps its own SFX.bossDown + slowT 1.0) and minis (no bossWon; skipped, not trivial).
- Hooks for tests: `BK.actCard`, `BK.bossBeat`, `BK.forceActCard()`.

## Checks run
node --check src/main.js, src/act-cards.js, tools/act-cards.mjs; `node tools/act-cards.mjs` (16 green).

## Browser checks for the integ
1. `node tools/act-cards.mjs --browser` (written, NOT yet run: card on first entry, input moves during the card, gone at 2 s, none on replay, other act gets its card, beat fires once normal and reduce-motion, win card still reached, no page errors; it uses BK.slay on wood - adjust if wood's boss needs another level).
2. `node tools/textfit.mjs` (card text "ACT III"/"THE OLD KINGDOM" is the longest name; check it fits 320 wide at size 10 and does not collide with the level banner; the card is NOT yet in a textfit screen - add one if textfit flags nothing because it never shows).
3. Eyeball: the slow-mo + push on Queen / Archmage / a desert boss; push never clips outside the arena (clamped by camLock x0/x1).

## QUESTIONS
- Q1 Stinger: reuse SFX.bossDown (built) vs bespoke per major boss (rec once AUDIOCOMBAT lands). Built: reuse.
- Q2 Chieftain (escape finale) and minis get no beat. Rec: leave (chief already has its own). Built: skipped.
- Q3 Veterans: built = no card for acts they have cleared. Rec same.
