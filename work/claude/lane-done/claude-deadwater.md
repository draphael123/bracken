# claude/deadwater - DEADLY WATER IS A QUIET DRAIN (Daniel 10-18; brief-flotilla3 section A only)

## Design change (state it)
While the hero is in a lethal / poison / foul pool he LOSES health fast: WATER_DRAIN = 0.11 of max hp per world second, divided by Game speed, through the difficulty chain
= about 8.5-9% of max hp per REAL second at Normal (a 2 s dip = ~17%, a ~12 s stay kills). It runs on the shared environment drain (src/drain.js, A13 - same as the breath and the sun):
NO knockback, NO stagger, NO hurt pose, NO mercy window, NO hand-back to the bank. Kept: grey-green splash + "SPLASH" on entry, a splash/hiss and a red "-n" tick each second. Death is named DROWNED (lethal) / THE WATER (foul).

## What changed (src/main.js)
- Lethal-look pools (no swim flag, not shallow; DEAD_SWIM: wood 5, marsh 9, canal 11, towpath 13, crown, undercrown poison) are now SWUM IN and CLIMBED OUT OF like any pool (swim finder uses inPoolAt for their bottom). No breath counted in them (the drain is the cost). The old fall-in loop (hurt shake + 27% hit + hand-back / death) no longer applies to them.
- Foul / poison swim pools (flotilla harbour, waymeet, fields, burial): the 9-hp knocking blow every 1.1 s is now the 'foul' drain; poison no longer carries venom out (venom ticks as a blow).
- Splash shake lost its 'hurt' tag (tools/shake-mode.mjs now wants THREE hurt-tagged sites, was four).
- Unchanged on purpose: fire pools, DEADLY pools (Falling Tower trap, instant kill, sign says so), mud, tarn, rapids, capped (still fall hazards with hand-back); the Admiral's Champion gap haul (champion hands, "haul back onto your deck") is the gap's own rule; the ceiling-acid (already no-knock).
- Tools: tools/lethal-water.mjs gained a page half (drain %, no hurt/inv/shove, climb-out, long dip kills by name); tools/shake-mode.mjs 4 -> 3; tools/canal.mjs three hand-back assertions rewritten to "bitten, not thrown elsewhere".

## Checks (PORT 8731, one at a time)
lethal-water ok (static + page), shake-mode ok, deadly-water ok, towpath 323 ok, canal-water ok, canal ok (after rewriting 3 hand-back asserts), underwater ok, swim-chain ok, marsh-exam ok, village-water ok, towpath-exits 27 ok, church-road 41 ok. No reds left. Not run: full suite, level-walk/reach tools.

## QUESTIONS FOR DANIEL (rec + what I built)
1. DEADLY (Falling Tower cistern) pools still kill on entry - rec: keep (they are a trap you cannot climb out of; a drain would only delay it). Built: kept.
2. Rapids / tarn / mud / capped pools still hit 27% and hand back - rec: keep (falls, not poison). Built: kept.
3. Dead pools with no climb-out (canal tunnel ledge, lock slots) now strand a hero who cannot jump out -> he drains to death (~12 s) instead of being handed back. Rec: add an exit ledge where the walker finds one; I did not move level geometry. Built: nothing.
4. Rate 0.11 base (~9%/s Normal; Master ~12%, Very Easy ~4.5%) - rec: keep.
