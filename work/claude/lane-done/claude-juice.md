# claude/juice - game feel pass (one juice table)

## What changed
- New `src/juice.js`: ONE table every landed blow and every blow the hero takes goes through. No per-hero rows.
  - Hit-stop on a LANDED blow: light 40 ms, heavy / third cut / dash cut / poise break / big number 90 ms, the killing blow 90 ms (big bosses keep their 250 ms), a boss's opening hit x1.25 on top of its class (a boss otherwise x0.8, as before). A blow that does 0 damage and a whiff freeze nothing.
  - Foe: white flash (0.07 light / 0.10 heavy), squash, and a draw-only screen recoil eased back over 140 ms (moves nothing, so AI and knockback numbers are untouched).
  - Hero hurt: 80 ms freeze, shake 5 (heavy blow, 20+ damage: shake 7, longer flash, deeper sound), a squash, the red flash, kick nudge.
  - Block: light 50 ms / heavy 80 ms with heavier shake and sound.
  - Shake budget: one cap (10). Shakes top each other up by 30% of the smaller, never past the cap; the kick nudge is clamped to +-8. Reduce motion (existing setting) now means NO shake, no zoom kick and no screen flashes.
  - Sounds: new `SFX.hitHeavy`, `hitFinish`, `blockHeavy`, `pHurtHeavy` (synth, src/audio.js) layered with the existing foe voice / block / pHurt.
  - Knockback curve `knockCurve` (fast out, eased stop) is in the table and drives the foe's on-screen recoil; the real foe knock speeds are unchanged (AI).
  - The hero's hurt throw goes through `safeKnock`: on the ground, if the landing (a drop of 5+ rows, spikes, deadly water, the level edge) is not safe he is thrown a shorter way, or rocks in place. Mid-air is unchanged.
- Damage, hp, attack timings and AI are untouched.
- New check `juice` (tools/juice.mjs, in tools/check.mjs): the table (scaling, boss opening, 0 damage = 0, budget cap, reduce-motion), the wiring, the four SFX exist, and in the page: light 40 ms / heavy 90 ms, glance 0, twenty heavy blows cap at 10, reduce-motion shake 0, a whiff freezes nothing, a hit at the lip of a pit does not fall in. Red on the base (glance froze 25 ms, reduce-motion left shake 3, hero fell 118 px into the pit, no juice import); green now.

## Checks
Green: juice, combat-feel, combat-replay, combat-results-test, attack-tokens, boss-fight-end (45 fights), architecture, npc-removal, finishers, audio-assets, skins, boss-openings, foe-tactics (see below), slopes-trace (rebased), plus the rest of the list in the final message.
- foe-tactics: a dice check (held tells are 35% rolls); it failed once in the suite run, passed on 3 reruns and with the same code otherwise. Base also passes. Not a juice effect.
- boss-openings: my first hurt-heavy stop of 100-120 ms made the test's 7-frame step land inside the freeze; the hero's hurt stop stays 80 ms (same as before) and heavy is told apart by shake, flash and sound.
- slopes-trace: kings and burial DIFFERED, because their scripted walks land blows and the hit-stop lengths changed. Proved: with the old blowStop pasted back both are identical again. So they were rebased (`--rebase=kings`, `--rebase=burial`, docs/slopes-trace.json); wood and keep unchanged.

## Not run
- No bot pilots: the freezes are the same size as before (old ~30-100 ms per blow depending on damage, new 32-90 ms), boss hits x0.8 as before, so no fight's timing changes meaningfully.
- Not looked at by eye in a real play session (feel is a taste call).

## QUESTIONS FOR DANIEL
1. The old hero-weapon multiplier on hit-stop (paladin/reaper x1.35, pirate x0.8) is gone so every hero feels the same, as you asked. Keep, or put a weapon weight back? Recommendation: keep it gone.
2. Reduce motion now turns off shake, zoom kicks and screen flashes but NOT hit-stop (that has its own "Hit stop" setting). Should reduce motion also cut the freeze? Recommendation: no.
3. Heavy hits on the hero freeze 80 ms like a light one (the test suites time their steps to it); heavier hits are told by shake, flash and sound. Want a longer freeze (100-120 ms) and the tests re-timed? Recommendation: not now.
4. Light blows now have no camera shake, only a small nudge (they used to shake 1.5). Say if you want the tap to shake.
