# claude/pyrocontrols - PYRO CONTROLS (sonnet, 11-01) - off 0fe14c26, pushed, NOT merged/deployed
Daniel 11-01 07:37: "TAP = block, HOLD = charged fireball" + scope add: charge goes to 5 steps.

## Finding
Master (BATCH135) ALREADY had tap C = FLAME WARD on press, hold C = held fireball (ward folds into the ball at 0.35 s). The change is the threshold + five steps; every text (controls card "TAP C WARD, HOLD FIREBALL", trial, tutorial sign, hero desc, touch/gamepad = same block button) already said it, so no text edits were needed. Crouch = STOKE untouched. Button C keeps both jobs (no empty slot).

## Built
- TAP/HOLD threshold 0.35 -> 0.18 s (WARD.fold = PYRO_KIT.fb.steps[0]). Ward is raised on the PRESS (instant, parry timing unchanged, same 0.45 s / burn / 0.75 s cd); holding past 0.18 s folds it into the charge (no extra cost); a press in ward cooldown goes straight to charging. Parry beat (0.15 s) is untouched.
- FIVE charge steps: hold 0.18 / 0.9 / 1.5 / 2.0 / 2.5 s (1-3 as before except step 1 earlier). Damage = swordDmg x k x heat, k 0.9 / 1.6 / 2.4 / 3.3 / 4.6 (step 5 ~1.9x the old max; per-second still under the staff chain). Stamina 18/26/34/42/50. Burn 1.4/1.8/2.4/2.8/3.2. Steps 3,4,5 explode: splash k 1.2/1.6/2.2, radius 34/42/54, more hit-stop/shake with size. Ball radius 3/5/8/10/13 (sprites + tails), steps 3-4 show a steady ring, step 5 = READY pulse + "READY" (step 4 says "ALMOST"); step tick pitch extended. Held-ready 4 s, slow walk, one-in-air rule unchanged. Recoil on 3+.
- Bot: pyro bot still wards on a one-frame tap (unchanged). New opt-in charge policy in src/lab.js: profile mod `human+x_pyroCharge_N` holds C to step N in a real boss opening (range 70-200, no tell), drops on a tell. OFF by default.
- Tests: tools/ember-flare.mjs (fold at ~0.18 s; 0.15 s hold is still a full ward, no ball), tools/pyro-kit.mjs (steps 1-5 damage/class, per-second cap, wait for embers to clear before the card test).

## Pyro boss rates (flasks, human, practiced, n=6, same seeds)
| boss | master | this branch | + charge bot (step 2) |
| warcairn | 5/6 | 5/6 | 5/6 |
| rookery | 4/5 | 5/6 | 5/6 |
| stockade | 3/6 | 3/6 | 2/6 |
| burning | 4/6 | 4/6 | 4/6 |
No drop. Charge bot not better (stockade 3->2, noise at n=6) so it stays opt-in. Stockade 50% is below band on master too (TUNE lane).

## Checks run (all green)
ember-flare, pyro-kit, settings-tabs, hero-keys-sheet, hero-keys-strip, hero-trials, keys, textfit (hints,hud,card,pick,practice - 0 issues; a first multi-scope run crashed the page once, passed on rerun), mark-integrity (stockade, burning). Not run: touch/gamepad checks (mappings unchanged, same block button), full suite.

## QUESTIONS FOR DANIEL (built as rec)
1. Brief rec said the charge rolls in after the ward ends; I fold at 0.18 s instead (steps keep counting from the press, so a hold never feels slower than before). Keep? (yes; the alternative makes step 1 arrive ~0.8 s in.)
2. Tap = under 0.18 s. A slow 0.2 s press now lobs a small ball (18 stamina) instead of a ward. Wider (0.25) is one constant (WARD.fold). Keep 0.18?
3. Step 5 k 4.6 (not 4.8) so it stays under the staff's damage per second. OK?
4. Charge bot stays off until a tune lane wants it.
## Art needed
Sprites for ball sizes 4 and 5 and the held glow are generated placeholders from the same routine; a sonnet art pass can restyle.
