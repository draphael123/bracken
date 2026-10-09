# claude/witchfix - WITCHLIGHT STAIR live fixes (Opus, resumed 2026-10-09)

Base: master 3595a284. Port 8777 only. This resumes the lane that died on 10-08 with 10 uncommitted files. I read its work, kept what held up,
finished it, and committed and pushed after every green step.

Daniel reported three bugs while playing THE WITCHLIGHT STAIR live on 10-08:
1. The Gate Gargoyle takes no damage, even on the spikes.
2. Slab blocks look stuck to him.
3. Flipped gravity takes away dodge, block, roll and attacks.

## 1. THE GATE GARGOYLE: stone everywhere, EVERY blow on the spikes (Daniel's call, a B15 exception for him only)
- **The cause.** `gargTake` let only the stomp's own call through. Any blade, shot or burn took 0. The plunge took 0 too, and then
  pogoed the player off his back before the stomp could land.
- **What he does now.**
  - Off the spikes he is invulnerable.
  - Down on the spikes, every blow lands (`GARG.openMul` 1). That covers blade, plunge, shot, skill and fire.
  - The stomp is still the big hit (`GARG.stompDmg` 69) and it still tears him free.
- **The B10 read while he is open:** a gold ring, an `OPEN` word, a timer bar that empties with the stun, and gold stars and an arrow.
- **The B3 ward afterwards:** after the stun he is WARDED for `GARG.ward` 3 s. It is shown by a stone shell and the word.
  While it holds, neither a dive-smash nor the rune can put him back on the spikes.
- **A blow that does nothing** clanks and says **DROP HIM ON THE SPIKES**, or **WARDED** while the ward holds (`src/boss-read.js`).
- **New this session: a plunge onto his back IS the stomp.**
  - Before, it hit for 10-20, pogoed you off, and lost you the 69.
  - That is why the pyromancer was 1/12 with flasks: the bot dives at him, as a player would.
- Files: `src/gate-gargoyle.js`, `src/main.js`, `src/boss-read.js`, `src/lab.js` (the bot plunges onto his back).

## 2. THE SLAB ON HIS BACK
- **The cause.** The broken slab's chunks were baked into his crash and stunned frames (10 and 11), and the old spit's masonry into
  frame 8. So the pieces rode down with him and lay glued to his sprite.
- **The fix.** His frames now carry no slab. A broken slab's pieces belong to the world: they are thrown from where it broke, fall,
  and shatter on the spikes within about 0.16 s (`slabShards` / `stepShards` / `drawShards`).
- The `wake` pose was also frame 0, which drew the gate's ledge under his feet as he flew off. It is now a flying frame.

## 3. TURNED OVER, EVERY HERO KEEPS HIS WHOLE KIT
- **The cause.** A flipped hero was run by `magePlayer`, a second, cut-down hero update. It kept:
  - the walk, the jump and a light swing;
  - the knight's shield only;
  - a floor roll and a plunge.

  It dropped everyone else's C, the heavy blows, the up-slash, the dash attack and every skill.
- **The fix: the flipped hero now runs the hero's own `updatePlayer`.**
  - `flipPlayer` runs it with `GS = -1`, and holds his vertical speed the way he feels it. So every jump, pogo, plunge, knock and
    rising cut is already the right way up.
  - `flipMove` moves him with the ceiling as his floor.
  - `attackBox` mirrors every blow about the middle of his body.
  - Things that only make sense on a floor wait for a floor: ladders, swimming, the cling, slides, the mantle, a mover's top,
    the duck, the safe spot and zip lines.
  - `flipTail` keeps what belongs to the ceiling alone: the glyph flare's slab underside, the room overhead running out, and the acid.
- **Found on the way (affects upright play too):** a skill key pressed during a hitstop was dropped. A swing or roll pressed then is
  buffered; F was not. It now goes into the existing skill buffer (`P.sbuf`), which already waits for the hitstop to end.

## Tests (real keys)
- **`tools/gargoyle-spikes.mjs` (new), knight/warden/pyro.** On the spikes, a swing lands, a plunge is the stomp, and a plain stomp
  is still 69 and tears him free. The ward is told, and the rune can't flip him while it holds. The stun runs out into the ward. Off
  the spikes the same swing does nothing and is turned. No slab pixel is left on frames 8, 10 or 11, and the pieces fall and are gone.
  **Green.**
- **`tools/flip-actions.mjs` (new), all 7 heroes x every reverse-gravity section** (Witchlight 147/173/198, Folly 607/651, Falling
  Tower 46), plus the Gargoyle's glyph flare for knight/warden/pyro. Flipped, each hero rolls, raises his own guard, swings, winds and
  lets go a heavy, casts his skill, and plunges at the ceiling, and is still on it afterwards. **Green.**
- Both are added to `tools/check.mjs`.
- **Changed old assertions (Daniel's design change, at the same or a stricter level):**
  - `gargoyle-smash`: the stunned blade now takes `10 * openMul`, and 0 while he hovers.
  - `gargoyle-stomp`: `gargTake` stunned = `50 * openMul`; the other three calls are unchanged.
- **Measurement fixes in the dead lane's flip-actions draft.** None of these weakens what is asked:
  - It now also samples a tap's answer just after release. The pirate's parry opens on release, upright as well.
  - It lets the Gargoyle's flare tell resolve before holding him. `hold()` was resetting him to hover.
  - It allows `settle(240)` before F. The death knight's heavy runs about 3 s, upright as well.
- **Regression set, all green:** gargoyle-smash, gargoyle-stomp, boss-read, rule-openings, boss-openings, whelps, archmage-folly,
  archmage-room, folly-runtime, folly-library, tower-ascent, tower-hall, witchlight, courtyard, attack-buffer, one-dodge, pogo-chain,
  reaper-input, skill-menu, underwell-aloft, gargoyle-playtest, combat-feel.
  - whelps and attack-buffer each failed once on page boot (a CDP navigate timeout and "window.BK never put up") and passed on rerun.
- **Not run: the full 40-minute suite.**

## Rates: the Gargoyle is the level's BOSS (target 60-70% with flasks, campaign L27)

| profile | knight | warden | pyro | total |
|---|---|---|---|---|
| human (flasks), 12 seeds | 10/12 | 9/12 | 5/12 | **67%, in band** |
| human+dry, 6 seeds | 3/6 | 3/6 | 2/6 | 44% |
| mash bot | 0/2 | 0/2 | 0/2 | **0/6** |

- In the mash runs every hero died, the boss kept 88-100% of his health, and at most 1 blow landed.
- Before the plunge-is-stomp fix, with flasks it was 12/12, 11/12 and 1/12 (67% overall, but lopsided).
- No GARG number was changed: hp 410, 6 stomps, stun 3.5 s, openMul 1.
- Pyro is the weakest of the three, but she is off zero and the spread is much better.

## For WITCHLIGHT 2 (runs next)
- Merge origin/claude/witchfix.
- The flipped hero now goes through `updatePlayer`. Anything new on a ceiling (glyph-sentinels, flips mid-air onto a drifting slab's
  underside) gets the full kit for free. `P.flareSlab` + `flipTail` is the pattern for standing under a mover.
- `GS` (-1 inside the flipped call) is the switch for anything that belongs only to a floor.

## QUESTIONS FOR DANIEL
1. **A plunge onto his back counts as the stomp** (built; the recommended option). Otherwise diving at him loses you the big hit. OK?
2. **On the spikes every blow lands at full value** (openMul 1), as you asked. We are in band at 67%, so nothing is reduced.
   If he dies too fast live, the recommended first lever is a shorter stun (3.5 s to 3.0 s), not a reduced multiplier.
3. **Whelps (from reading the code, not tested).** A plunge onto a stuck whelp looks like it is still a 0-damage pogo; only a
   plain stomp breaks it. Recommendation: same rule as him
   (plunge = stomp). It is a one-line change; I didn't build it, because whelps weren't in the brief.
