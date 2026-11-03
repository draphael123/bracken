# batch140 integ (11-03)
Branch claude/batch140 (pushed, NOT merged, NOT deployed). Worktree bracken-batch140. Tip: see last line (936ce796 (confirm = origin tip)).

## Build
claude/batch140 ALREADY EXISTED on origin (60adcba1 = smallfix10 + herofeel merged on an OLDER base, ded47924 not an ancestor). I did not force-push; I kept it and added: merge origin/claude/batch139 (ded47924, clean, 1 file), merge claude/redclean (dee059b3, clean). herofeel (c4799bbf) and smallfix10 (3e6d2c2f) were already in. All four heads are ancestors of the tip. No textual conflicts anywhere.
The worktree held uncommitted check output (docs/level1-*.json, mash-bot.json, heroblocksb-shots pngs) from an earlier attempt; discarded (regenerable).

## Known clash: canal bot vs Ranger
redclean's bot swapped the Ranger to knife stance (rgk().stance()/toggleStance()); herofeel made those no-ops, so a bare X looses an arrow and strikes nothing (ranger run: "MISS the windlass struck", did not reach arena). Fix, bot only: strike() now holds DOWN with the atk press for a ranger (DOWN+X on her feet before the kneel settles = the knife's low sweep, src/ranger.js press()). Ranger seeds 1+2 reach Jenny's arena.
OWED / question for Daniel: a REAL player who has arrows in the quiver can only operate a windlass/paddle via the obscure tap DOWN+X (or by being empty). Rec: small game change - ranger.js pointBlank() also counts a strikable gadget in knife reach, so plain X knifes it (not done: kept to the bot per brief).

## Signs ("HOLD C AND BRACE")
smallfix10's warden variants (moor wind: "CROUCH BEHIND ONE"; gale harpy: "HOLD C AND LET GO") still true: hold C = javelin wind-up, release throws, tap C deflects. WARDEN_KEYS.brace, HERO_LOOP.warden and the warden desc were already rewritten by herofeel. No remaining warden text says brace. Still owed (smallfix10 item): non-warden variants of those two signs (pyro/ranger/geomancer/freebooter hold C is not a brace; ranger hold C is nothing/ guard).
New red found + fixed: herofeel's trial_geomancer EARTHFALL sign went to 3 lines; shortened to "...THE LANDING IS A SHOCKWAVE. LAND IT TWICE." (src/level.js). signs.mjs now 17 of 1179 over 2 lines, all older signs (none of herofeel/smallfix10/ours).

## Checks (one headless at a time, >=3.3 GB free each, gate flag present)
- ranger.mjs OK
- heroblocks-b OK (warden tiers, ranger bash/guard)
- canal-tunnel-route --heroes=ranger,warden --seeds=2: warden ok x2; ranger ok x2 after fix (first run before fix: ranger 2 FAIL)
- signs.mjs: 17 old 3-line signs (known, not ours); no new
- hint-shown OK (2112 literals, 752 old silent, none new)
- warden-id 36 checks green
- geomancer OK
- textfit: touched scopes (hints,pick,store,trial,tree,card,bestiary) --strict: 1553 screens, all counts 0. (An unscoped run hit my 550 s timeout at scope 'party' with no failures reported, so the full scope list was not completed.)
Not run: full suite, art/bosses (per brief).
