# claude/hedgewarden3: THE HEDGE WARDEN, green wood that chips and a stump that never heals him

Daniel's playtest (2026-09-28): he felled the Warden on the open lawn. The stump took no damage from his hits and then REGREW,
so it looked like the boss heals for no reason. What was decided: "Teach it + chip damage".

## What changed (src/hedge-warden.js, with two hooks and the bestiary line in src/main.js)

1. **Green wood chips.** A stump felled on the open lawn now takes **a quarter** of each blow (`HEDGE.greenMul: 0.25`, at least 1).
   It used to take nothing.
2. **Nothing grows back. Damage done stays done: his bar never goes up.**
   - A stump left alone still stands him up again. It used to set him back to the top of the growth, and that was the "heal".
     Now he stands up with the health he had, on what is left of his root. He says HE STANDS AGAIN; it used to be HE GROWS BACK.
   - While he is back up on a green root, a blow on the lawn still takes only a quarter and does **not** fell him again.
     A blow **beside a brazier** fells him there, and the fire takes the stump.
   - If the quarters wear the root down to nothing, while he is a stump or while he is standing, that growth is gone and he wakes on the next one.
     This is the same "ROOTED OUT" as before; it moved into one shared function, `rootedOut`.
   - There was a `Math.max` that lifted his health back up to the root line whenever he was felled. It is gone:
     a bleed that took him under the line stays taken.
3. **The brazier is still the big payoff.** A burning stump takes a blow twice over, as before. His hp (486), attacks, tells and damage are unchanged.
4. **Teaching it:**
   - When he is felled on the open lawn, the hint box says **GREEN WOOD: DRIVE HIM TO THE FIRE**. This is a `hintMsg`, so `textfit hints` measures it.
     The over-head line on a green hit says the same words; it used to say "FELL HIM BY THE FIRE".
   - A blow on green wood puffs grey smoke off it (main.js `smoke()`).
   - **His two braziers call while he is up.** They show a slow bright pulse and a pale ring going out along the lawn.
     They go back to their normal glow while he is a stump. This is `brazierCall(e)` plus `drawBrazier`'s `call` argument.
   - The bestiary line was reworded to the new rule: "a stump that stands him up again ... green wood a blow only chips". The old "and only then can you cut the root out" was dropped.

## Numbers (from the checks)

- A blow of 30 on a lawn stump takes **8**. It took 0 on master. On a burning stump the same blow takes **60**, as before.
- Up again on a green root, the same blow on the lawn takes 8 and he stays up. Beside a brazier it fells him burning (open 2.9 s).
- **Route to his death, with the same blow every third of a second (tools/witchlight.mjs):**
  - On the lawn alone: **54 blows**. On master he never died: 1,800 blows, and his bar went up 54 times.
  - At a brazier: **21 blows**, the same as master. The fire is about 2.6 times quicker than the lawn.
  - His bar never rose on either route.

## Pilot (normal health, 1 seed; `node tools/hedge-warden-pilot.mjs 1 knight,warden,pyro`)

| | knight | warden | pyro |
|---|---|---|---|
| BEFORE (a840ae8) | win 60.8 s, took 0 | **died** at 98.9 s, him at 29% (cut 42, thorns 18, rush 18, roots 16) | win 47.5 s, took 12 (roots 12) |
| AFTER | win 71.7 s, took 16 (roots 16) | **died** at 57.3 s, him at 42% (cut 42, roots 32, thorns 26) | win 41.6 s, took 12 (roots 12) |

- Wins were 2 of 3 both times. His stump burned at a brazier 3, 2 and 3 times before (knight, warden, pyro), and 3, 3 and 3 times after.
  The bot fells him at the fire, so the lawn rule barely comes into its fights.
- With one seed the times and deaths swing with the dice. The warden bot died sooner after the change, but it took the same kinds of hits. Nothing here says he got easier or harder.

## Checks

- **witchlight**: green. New assertions: the lawn route and the fire route, and his bar never rising.
- **boss-openings**: green. It has new and changed assertions:
  - a lawn stump chips 5-10 from a blow of 30;
  - it stands up with no health back;
  - the lawn hint;
  - smoke on a green hit;
  - the braziers call while he is up and not while he is a stump;
  - up on a green root he is chipped, not felled, on the lawn, and felled burning at a brazier.
- **textfit** `hints,bestiary --strict`: green (0 issues; LONGHINT 7 is report-only, and none of them is this hint).
- `npm run check -- boss-fight-end,mini-walls,tells,answer-tags,architecture,checkpoints,skins,dangling-paths,slopes-trace,npc-removal`: all green.
  - boss-fight-end: all 45 fights end. mini-walls ran the hedgewarden too.
  - slopes-trace: every frame identical, so no rebase was needed.
  - tells: I added no new attack, so no mark rows changed.

**Proved red on master first.** I made a throwaway `git worktree` at a840ae8, copied in the new boss-openings.mjs and witchlight.mjs, and ran them there:
- boss-openings failed at "a stump left alone ... no health grows back". Its data also fails every other new assertion:
  - the hint was another level's;
  - smoke was 0;
  - there was no `brazierCall`;
  - the lawn bite was 0;
  - he grew back to full, 689 of 689;
  - up again, a lawn blow took 30;
  - at the fire he was not felled.
- witchlight failed at "on the open lawn alone ... he still comes down in the end": he did not die in 1,800 blows, and his bar rose 54 times.
- The worktree was removed afterwards.

**Assertions I changed, and why:**
- boss-openings, "a stump left alone grows him back whole" (`grew.hp === full`): this is the exact behaviour Daniel called a bug.
  It now asserts the reverse, just as strictly: he stands up at exactly the health the stump was left on, and below full.
- boss-openings, "a stump on the open lawn is green wood no blow bites" (`lawn.bite === 0`): now `5 <= bite <= 10` for a blow of 30.
  A quarter is 7.5. The burning stump still has to take at least 50.
- boss-fight-end and witchlight's gate check were **not** changed. They kill him on a burning stump, which is still right.

## UNVERIFIED

- Nobody has played it with real keys. I did not capture a frame of the brazier pulse, the smoke or the hint box. The checks prove that the hooks fire, not that they read well on screen.
- Whether the hint box (4.5 s) gets in the way mid-fight. It shows every time he is felled on the lawn, not once per save.

## QUESTIONS FOR DANIEL (my recommendation first; what's built is the conservative reading of the brief)

1. **When he stands up on a green root, what fells him again?** Built: only a blow beside a brazier fells him, and on the lawn a blow chips a quarter and he fights on.
   Letting any blow fell him again would put him back on the floor at once, again and again, and he would stop fighting.
   I recommend keeping what's built.
2. **The hint every lawn felling, or only the first two per save** (like the other lesson hints)? I recommend the first two per save once you've seen it work.
3. **A quarter (built)** is slow but it gets there: 54 blows against 21 at the fire in the test. If the lawn still feels like a wall, a third would do it.
