# TOKENSFIX (Sonnet)

Verdict: attack-tokens was FLAKY, not red by design, and the cause was the test, not the token system.

- Before: 4 plain runs on master 52d768d1 gave red/red/green/red-ish: "only 3 red !! blows" (x3), one run "hedgeknight stood still", one green. Red count varied 3, 3, 9, 3, attacks 11, 15, 23, 12 for the same seed.
- Cause: the test seeds Math.random but never resets the game clock. The page's `time` (src/main.js) keeps ticking from the reload until the test block starts, so its value at frame 0 depends on how loaded the PC is. The crowd paces round the ring by sin(time * 1.6 + phase) (src/attack-tokens.js waitMove), so the whole 40 s fight shifted. A MD5 of the sampled foe state over two runs differed for waymeet before, identical after.
- Fix (tools/attack-tokens.mjs only): BK.reset({ fresh: true }) before BK.load, with a comment. No assertion or threshold changed. combat3's tempo/rest/reload numbers are not the cause; the "red !!" floor of 4 is unchanged.
- After: 3/3 identical runs. stockade reds 4, waymeet reds 2 (6 total, floor 4), maxA 2, no still foes.
- Green alone: attack-tokens, foe-tempo, foe-tactics, tells, untold-told, answer-tags, architecture, dangling-paths.
- Margin note: 6 vs a floor of 4 is deterministic now, so it only moves if the game changes.

QUESTIONS FOR DANIEL: none. (Side observation, not touched: in stockade the sprig/shield foes spawn with x = NaN for the first frames of the test, apparently placed by spawnFoe's own logic; the test still counts them alive.)
