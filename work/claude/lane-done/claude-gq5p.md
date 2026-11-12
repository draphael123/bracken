# GQ5P (slice S1) - Princess melee, bell retired. Branch claude/gq5p, sha a46d1e592 (on top of claude/gq5fix 2b48084aa). Flag GQ5P_SHIPS = false; ?gq5p=1 / BRACKEN_GQ5P=1. Not merged, not deployed, flag not flipped. Code-only, no browser.

## Built (file:line)
- src/gq5p.js (new): flag + G5 numbers + GAP5. Same override rules as src/gq4p.js (page ?gq5p=1, globalThis.BRACKEN_GQ5P, env BRACKEN_GQ5P=1).
- src/goblin-princess.js: import l.18; GP.gap uses GAP5 (l.~24, same [0.5,0.4]); GP.stumbleMul 1.15 (l.23); CHAINS P5 set (l.44); GP_MODES + heelTell '!!', curtsyTell '!', tantrumTell '!', overTell '!!' (l.55); gpOpen/gpMul know 'stumble' (l.57-58); gpPlan answers (l.69); next() dispatch (l.159-161) + heelBegin (l.167); states heelTell/heel/stumble/curtsyTell/curtsy1/curtsy2/tantrumTell/tantrumA/tantrumB/overTell/overhead (l.~355-375); bell retired: stepRelease + stepBell not called (l.339), no RING plate, bell hangs still (no rope, no cord, no winch box, no glow), labDuty has no bolt/bell duty; drawOver adds the heel dust line + gold glint; barName 'STUMBLING'; counters heels/heelHits/stumbles/curtsies/tantrums/overheads in F.n (read by boss-run).
- src/redraw/goblin_princess_art.js: P5 sheet = 57 frames (hurt 55, body 56; OFF stays 47 / 45 / 46). Frames 45-54: heelTell (stamp, steam, heel dust), heel (flat-out lean, dust line), curtsyTell (deep curtsy, skirt flared), curtsyLow (blade along the floor), curtsyRise (blade sweeping up), tantrumTell (both fists up, red cross marks), slashA, slashB, overTell (rapier straight up, gold glint), overhead (chop, gold streaks). pose5 l.329, drawHeelDust l.475, drawGoldGlint l.483. Still: work/claude/lane-done/gq5p-sheet.png (tools/gq5p-sheet.mjs).
- src/marks.js: 4 table rows (BY_HAND, MARK, ANSWER heel/tantrum/overhead 'block' curtsy 'jump', HEIGHT 'low'). Bestiary / What's New untouched.
- tools/gq5p.mjs, tools/gq5p-sheet.mjs.

## Numbers (px; tile 16) = plan section 2
- HEEL DASH: tell 0.6 s ('!!', 'HMPH!'), dust line along the path; 5 tiles at 300 px/s (0.28 s); box 16 x 24 (1 x 1.5 tiles); 18 dmg, blockable, knockback push 120; parry = STAGGER 1.0 s; miss = STUMBLE 0.8 s, x1.15 (an opening, 10% cap). Only when you are > 4 tiles (64 px) away, else the chain skips it. Reach 93 px max, so beyond ~5.8 tiles it just misses.
- CURTSY CUT: tell 0.5 s ('!', 'HOW DO YOU DO?'). Hit 1 low sweep 32 x 10 px, 12, NOT blockable (jump). Hit 2 0.3 s later rising 24 x 32, 16, blockable, parry = STAGGER 1.5 s.
- TANTRUM COMBO (P2): tell 0.5 s ('!', 'TANTRUM!'); slash 24 px reach 10 + slash 10, 0.25 s apart; OVERHEAD tell 0.35 s ('!!', 'NOT FAIR!', gold glint) 24 x 32, 22, blockable, parry = STAGGER 1.5 s; unparried = 0.6 s recovery.
- Chains ON: P1 [lunge curtsy flurry key trinket] [fan curtsy lunge heel] [flurry trinket key lunge curtsy fan]; P2 [lunge curtsy tiara pirouette flurry stomp] [trinket tantrum tiara pirouette heel] [stomp lunge curtsy tantrum flurry tiara trinket]. No hop, no perch, no bell. (Interpretation: the plan's 'replaces FAN in two P2 chains' - P2 had one fan, so the 2nd tantrum is added after the curtsy in chain 3; fan leaves P2.) hp 1080, gap [0.5,0.4], resist 0.4 all unchanged; the add-phase hop to the landing (ALL GATES shimmer) is kept (not a chain move).

## Node proofs (all green)
- node tools/gq5p.mjs: OFF half 8 ok (47 frames, chains = gq5fix exactly, hop in, rope still rings) + gprincess.mjs and gq4p.mjs flag OFF 'all ok' + ON half (BRACKEN_GQ5P=1) 70 ok: chains; plan numbers; every tell >= 0.35 s (measured 0.60/0.52/0.52/0.37); resist 0.4x on all 10 move modes, stumble 1.15; art distinct; bell/rope/winch blows do nothing; bot answers; 4 x 600 s simulated fights (P1/P2, hero near/far, rolls and parries thrown in): longest state 2.3 s, no hop/bolt/perch, all 3 moves + stumble seen; every new state exits.
- Also OFF-green: gprincess, gq4p, gq5fix, gq3art-sheet, gq4art-sheet, hc3art-sheet, bell-winch, tells, gqueen3, answer-tags. With the flag ON gprincess/gq4p (and the bell proofs) fail by design (bell retired) - they must be run OFF.
- Not run: mark-integrity (needs a browser; crashed harmlessly, no browser on this laptop).

## BROWSER OWED (desktop)
1. crown mini win rate with the flag on: n=6 per hero, then n=36 knight/warden/pyro: BRACKEN_GQ5P=1 (cdp env) or ?gq5p=1 on the lab URL - same boss-run command as the gq4p tune (crown:mini). Target 70% (was 69% n=36; plan expects 52-58% before tuning).
2. cast-poses / mark-integrity for gprincess: every new tell shows its pose (45-54) and lands: node tools/mark-integrity.mjs with the flag on.
3. Tells by eye: heel dust line + HMPH, curtsy flare then low sweep then rise, tantrum fists then 2 slashes then gold glint; stills for Daniel (hero + her, each pose).
4. Bell: confirm the tower bell hangs still, no rope / winch box art, grate does nothing; the guard-call 'GUARDS!' + gates unaffected.
5. Check the jump on curtsy hit 1 clears (a standing jump rises 49 px; box is 10 high) and hit 2 (32 high) is not hit at the apex.

## Tune-back order (plan)
G5.heel.dmg 18 -> 14; G5.curtsy.dmg2 16 -> 13; GAP5 [0.5,0.4] -> [0.6,0.5]; GP.hp 1080 -> 980 last. If instead too easy: tantrum overDmg 22 -> 26 or minDist 64 -> 48.

## Questions (recommendation built)
1. Curtsy hit 2 comes at the same instant a jumper lands (jump hit 1, hit 2 0.3 s later): REC keep the 0.3 s as planned; watch the knight in the bot run.
2. Heel dash on a hero within 4 tiles is skipped (chain moves on) - REC keep (plan says far only).
3. ALL GATES shimmer-hop to the landing still exists (add phase) - REC keep.
