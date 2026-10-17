# claude/hintlevel - Settings > Gameplay > Helpers > Hints (NONE / LOW / MEDIUM / HIGH)

Built on origin/claude/storyremove (the level-start story intro is already gone).

- src/hints.js: the one gate. hintAllowed(tier, id); tiers mechanic / tip / reminder / stall; stall timing 10 / 20 / 45 s / never; glint gate.
- main.js: hintSay(tier, seconds, text) is the only way a hint box line is set (82 call sites + the number() -> callout() path, tier tip or stall). Notices (level up, XP catch-up, gate open, FIELD REMEMBERS, store refusal, trial gate) are not hints and are untouched.
- Inventory by tier (hintSay call sites): mechanic 47, tip 31, reminder 3, stall 1 (+ the 10 hands modules, hush, glass colossus, canal on the shared stall clock; callout lines are tip, or stall when they come from the stall clock).
- HIGH = today (the gate returns true, nothing recorded). MEDIUM = mechanic + tip once per save (PROG.hintSeen, only written below HIGH), 1 reminder a level, nudge 20 s. LOW = mechanic once, glint and nudge after 45 s. NONE = nothing; signs still read on talk.
- Default: NEW profile (no settings file, no save in any slot) MEDIUM; existing settings file HIGH (SET.hintsV1 migration).
- tools/cdp.mjs pins hints:'high' for every tool page (like the game speed pin; opts.hints overrides) so tools keep the calibration they were written on.
- tools/hintlevel.mjs is the new check. tools/textfit.mjs now also reads hintSay(...) lines (it only read `hintMsg =` before; without this 60 hints dropped out of the fit check).
- Base reds, not touched: hint-shown (25 number() literals in hero-pass.js / ranger.js / geomancer.js / main.js; routing them through hintSay does not fix it - they are floating-word flavour that needs MOVE_WORDS or hint-lines.js, a design call), signs (6 trial signs run 3 lines), crouch-hint (paladin PRAYER line preempts the first-crouch line), textfit settings/menu COLLIDE 1 (controls [paladin]).
