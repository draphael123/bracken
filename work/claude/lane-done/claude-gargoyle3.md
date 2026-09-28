# Lane claude/gargoyle3: THE GATE GARGOYLE, ROUND THREE (spikes, stomp, wind), done

Branch `claude/gargoyle3`, off master abcd773. The brief is `docs/briefs/gargoyle-spikes.md`. Nothing has been merged or deployed.

## What changed
- **The Gate Gargoyle** (`src/gate-gargoyle.js`)
  - **He is stone.** Blades, shots, spells and burns all do 0 to him. The only thing that damages him is a **stomp** while he lies stunned on the spikes. A stomp takes `GARG.stompDmg` (82), so five stomps kill him. The stun lasts 3.5 s (it was 2.5 s).
  - **The opening works as before, but ends on the spikes.** If you leave his slab late, he smashes through it and crashes onto the spikes, stunned.
  - **After a stomp:** you bounce, the wind lifts you to the nearest slab still standing, and he resets. That means he goes back up over the slabs and is untouchable for 1.4 s.
  - **A dive with no slab under him:** he pulls up. Nothing opens.
  - **Fire breath (new, a yellow "!" tell, replaces the rubble spit):**
    - He hovers level with you, off to one side, and his throat lights.
    - A dotted line follows you, then goes solid and locks for the last 0.25 s.
    - Then a jet of fire runs along that line. A slab or stone stops the jet, and a shield takes the hit.
    - In phase two the jet turns to chase you as it burns (A10).
  - **Other attacks** are unchanged: the dive, the wing gust, the glyph flare, and the shriek that calls whelps.
  - **Broken slabs** grow back in 4 s (5.5 s in phase two); they were 6 s and 11 s. At least 6 slabs always stand.
  - The bestiary entry is rewritten, and his world marks now include the breath line, the jet, and a green "jump on him" arrow while he is stunned.
- **His room**
  - The whole floor is spikes, with wind wells in it.
  - There are **13 slabs in two tiers**: 7 slabs 5 rows above the spikes, and 6 slabs 3 rows above those, each sitting over a gap in the lower tier. No gap on a tier is wider than 2 tiles. There used to be 6 slabs.
  - The rune columns are gone, because nothing can stand on spikes.
  - The arena trigger moved to x0+2, so he wakes as soon as you step onto his first slab.
  - `arena.start` tells the lab to start the bot on his first slab instead of on the spikes.
- **The spiked moat and its winds** (new file `src/spike-winds.js`, level data in `L.winds`)
  - **Falling onto a zone's spikes:** you take ONE bite, a fifth of your max health, and it can never take your last point (same as the Ore Road's pit rule).
  - **The wind** then carries you up, then along, to an exit at or behind where you fell. In his room the exit is the nearest slab still standing.
  - **Stomping** something stuck on the spikes also sends you up on the wind, with no bite.
  - **Wiring in `main.js`** is a thin hook: the two engine spike checks, `windWorld` in `updateMovers` (the rides and the regrowing slabs), a guard in `updatePlayer`, `stompStone`, and the draw call.
- **The whelps** (`gargoyle-whelp.js` and `updateWhelp`)
  - They are stone everywhere; `whelpTake` returns 0.
  - A whelp's dive goes through where you stood, then it **drops**. It passes through ledges, and a **cracked ledge breaks** under it and grows back in 4 s.
  - On the spikes it sticks, stunned, for 3.2 s, and one stomp breaks it. On bare stone it just lands. Either way it then flies home.
  - Whelps he summons in the arena follow the same rules.
- **The battlements** (`witchlight.js`): now columns 333-532, twice as long as before. Everything from the lip onward moved right by 100 columns, and the level width went from 495 to 595.
  - **TAUGHT:** a whelp above a cracked ledge over a shallow 3-tile spike trench, with a sign.
  - **DEVELOPED:** the existing breach and the narrow ledge between two spout whelps, now over spikes instead of ropes.
  - **TWISTED:** THE CRACKED CORNICE (new). The route itself is cracked ledges plus a slider, with whelps above.
  - **COMBINED:** THE RUNE TOWER (new). A rune column up to a high cornice, then down its broken ledges past two whelps.
  - **EXAMINED:** the old gatehouse-roof exam, now over spikes and with a cracked ledge.
  - Checkpoints are at 336, 395, 452, 495 (the exam) and 540 (outside the arena), so the gaps are 40 to 59 columns. No hearts were added.
- **Bot** (`src/lab.js`)
  - Never swings at him.
  - Leaves a slab late onto the same tier.
  - Gets off the breath line (or blocks it with a shield).
  - When he is stunned, steps off any slab above him and lands on his back.
  - Keeps its jump target while in the air.
- **Reach model** (`src/reachcore.js`): a slab mover that never moves (no range, not vertical, not sinking) now counts as a ledge. Before this, the model only boarded a mover from 2 tiles away, which made valid 2-tile jumps look impossible. Only witchlight has slab movers, so no other level is affected.
- **Marks and audio:** `gargoyle|breathTell` replaces `spitTell` (`tells.mjs --write` rerun), and there is a new `SFX.gargFire`.

## Checks (each run on its own; the full suite was not run)
- **New check:** `gargoyle-stomp`, added inside `check.mjs`'s list before `]) if (take(t))`. It is green: 36 assertions covering stone vs. stomp, the smash onto the spikes, the stomp dealing 82 plus the wind ride with no bite plus his reset, regrow in about 3.8 s, one arena fall costing exactly one bite (20) and landing on a slab, the breath being told and landing with a shield taking it, a moat fall returning you to x 372 (at or behind where you fell), and the whelp diving through the cracked ledge, sticking, being immune to blades, dying to a stomp, and the ledge regrowing.
- **The new check fails on the old code:** on abcd773 it fails 14 Node assertions, then throws on `whelpTake` before the page part.
- **Updated to the new design and green:**
  - `gargoyle-smash`: the floor is no longer walked and no hero can stand under a slab, so those two asks were replaced. The wind replaces the rune columns. "Every blow counts twice" became "stone, stunned or not". The phase-two regrow margin is now 0.8 s.
  - `whelps`: ropes became spiked moats with winds; "soft where it lands" became "stone"; the crumble and the Gargoyle kill now go through a stomp.
  - `witchlight`: 13 slabs in two tiers, a spike floor with wind, the breath mark, the kill by stomp, and the lip row taken from `TOP`.
  - `boss-openings`: a low slab and a high slab left late, and one left early.
- **Also green:** tells, comments, lab-reach, camera-fill, traps, deadends (0 dead ends in witchlight), signs, newlevel, reach, audit, content-audit, quality, floaters, killzones, collectables, curve, threat-holes, mini-walls, additional-areas, class-spurs.

## Pilot (`tools/gargoyle-pilot.mjs 1 --heroes knight,pyro,pirate`, normal health)
- **Before:** 1 of 3 wins. Knight died at 53.8 s; Pyromancer won at 76.5 s with 6 openings; Freebooter died at 63.4 s. Median damage taken 90, median openings 3. Files: `work/gargoyle3/pilot-before.*`.
- **After:** 2 of 3 wins. Knight won at 111.4 s taking 76; Pyromancer won at 66.4 s taking 50; Freebooter died at 78.9 s (78 of its damage from the breath). Median damage taken 76, median openings 8, 5 stomps per kill. Files: `work/gargoyle3/pilot-after.*`.

## Commits
1ea4383, ac5bade, c3d5388, plus the report commit. All pushed to `origin claude/gargoyle3`.

## QUESTIONS FOR DANIEL
1. **Can a spike fall kill you?** Right now the one bite (a fifth of max health) never takes your last point, which is the Ore Road's rule. *Recommendation: keep it.* The fight's danger is his attacks, and the spikes are a setback.
2. **The glyph flare is still in his kit** (the red tell that flips you onto the underside of a slab). With spikes below, that is still a real threat. *Recommendation: keep it for now and judge it after you play;* dropping it makes the fight simpler.
3. **Five stomps to kill him, 3.5 s stun.** The bot takes about 8 openings to land 5 stomps. *Recommendation: play it before tuning.* If it drags, go to 4 stomps rather than making the stun shorter.
4. **The breath hit the bot's Freebooter hardest** (no shield). It is dodged by moving up or down a tier, or by standing behind a slab. *Recommendation: no change until you have played it;* if it feels unfair, make the lock window longer (0.25 to 0.35 s).
5. **Cracked ledges in the battlements regrow in 4 s,** and the route waits on them if a whelp breaks one ahead of you. *Recommendation: keep 4 s.*

Follow-up: boss-fight-end
