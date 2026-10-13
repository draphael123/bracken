# claude/redgorgerework - RED GORGE rework (Raptor Matriarch + the Spillway climb)

Base: origin/master 7d920edb (batch90). claude/flasklever was not merged, so this is measured on that base. Daniel's three asks were built in his order and each was committed.

## What changed
1. **THE SLUICE STUN is the central mechanic (B17).**
   - A pulled lever sends one visible WAVE down the channel from its bank. If the wave reaches her while she is in the channel she is STUNNED: a big gold ring, `THE SLUICE STUNS HER: STRIKE`, and STUNNED on her bar and over her. The old narrow-or-broad pillar lottery is gone.
   - Every phase-one pass opens on THE LURE: she drops into the channel in front of your bank and crouches at you for 1.25-2.6 s. The crouch is longer the further you stand from a full lever. A lure never starts into the horn; one that can't start yet comes at her next move.
   - A full lever shows a bobbing gold marker with `LEVER` / `PULL (E)` above it. While she is in the channel, a dashed gold line runs from the lever along the channel to her.
   - The fight's rule line is said at the first beat (`THE LEVER STUNS HER: PULL IT WHILE SHE IS IN THE CHANNEL`).
   - THE HOLD forces the verb: until the sluice has stunned her once, her health stays at the phase-two line, and the game says `SHE WILL NOT BREAK: STUN HER WITH THE SLUICE`.
2. **THE STANDPIPE BASKETS (phase two).**
   - A lever pulled while she flies fills its standpipe with 8 s of pressure, shown on a draining gauge.
   - The basket beside that bank rises with a hero on it, up to her wall height.
   - A blow from the raised basket knocks her off the wall. She falls into the channel STUNNED and the pressure drops, so you come down with her.
   - While a hero rides a raised basket she runs instead of diving or firing quills, so she passes within reach.
3. **THE SPILLWAY, a new section (cols 49-94, rows 12-62) right before her.** Her ledge moved east to make room (`REDGORGE.matX` = 96).
   - Its channel is DAMMED: no flood comes down it on the horn. Its three gates start full, the horn refills them, and only a gate you release lets water down.
   - **Teach:** off the dam's crest, down a rope into the dry basin. Stand on the basket and press E at its wheel; the burst winds the basket up.
   - **Test/remix:** up the west ledges under a raptor, then across a bridge over the second gate's burst road (the burst sweeps away the knife standing on it). The second basket is on the far lip.
   - **Exam:** the third basket rides the sheer head under two raptors. A stoop that lands on you while you ride knocks you off the basket (new). Her elite guard (shield, SWIFT) waits on the head shelf with the drop behind him, and the shrine before her door is past him.
   - Glint and nudge steps are added for all three baskets and their wheels.
4. **The desertfix item, folded in.**
   - The rule line is now one sentence: `AT THE HORN THE FLOOD COMES DOWN THE GORGE: A SHUT GATE HOLDS IT, AND THE WATER YOU LET GO BREAKS JAMS AND LIFTS BASKETS.`
   - The shrines are spread up the climb: the climb's top (moved to 43,165), bridge four past the jam (40,69), and the spillway's head before her door (92,21). The bridge-two and summit shrines are gone. Gaps are now 142/146/162, so redgorge is off the A10b DENSE list.
5. **Tuning to 60-70% with flasks.** Every opening a player causes is still worth taking; the rest of her got tougher.
   - Her blows are about x2.4 (pounce 31→75, rake 16→37, tail 18→36, scree 16→50 with 5 rocks).
   - Her sweep, scree and dive tells are a little quicker. The pounce tell stays at 0.72 s with a 17 px landing box, because the warden's step needs it.
   - Stun windows are longer (5-6 s). A stun the sluice causes is worth up to 10% of her health; other openings up to 5%.
   - Outside her openings she has a TOUGH HIDE (B15): 0.5x round her talons and 0.4x into them. Before, a blow into her talons did nothing.
   - The water damps the pyromancer's fire on her (0.5x while she is soaked by the wave, or in the cracked dam's water), the same rule the crab had.
   - Her health is 900.
6. **The lab bot (human profile, human reaction):** pulls the lever on the lure, rides the standpipe baskets and strikes her off the wall, and stays on a raised basket even with water under it.

## Rates (human profile, campaign L37, --jobs=1, sha e4a74780)
- **With flasks (kit), 6 seeds:** knight 4/6, warden 3/6, pyro 5/6 = **67%**. In the 60-70% target; no hero at 0.
- **Dry (human+dry), 3 seeds:** knight 2/3, warden 0/3, pyro 0/3 = 22%. This is far below the band; see question 2.
- **Mash bot:** 0/6. Re-stamped level then boss; every hero dies in the level (3/3/2 deaths).
- **Fights:** knight about 100-130 s, pyro about 130-160 s, warden 150-230 s (some warden fights still time out).
- **Baseline before the lane:** 18/18 (100%).

## Checks
- **Pass:**
  - Node checks: tools/raptor-matriarch.mjs (new asserts: the lure, the wave stun, the hold, the standpipe and the knock), tools/redgorge.mjs, hint-shown, tells, boss-read, level-quality (CLEARS), checkpoint-gaps, stuck --static, reach-heroes (redgorge: 0 misses for every hero), elites, solid-islands for redgorge.
  - Page checks: boss-openings (matriarch row: alone 0, wasted 1, staggered open 5.5 s), boss-fight-end (62/62), untold-told, desert-foes2, level1-pilot `--write` + `--curve`, mash-bot.
  - Spillway route pilot (`tools/redgorge-route.mjs gate <hero> 0 --nofoes --spillway`): knight, warden and pyro each reach her door on base movement, 0 lifts.
- **Deliberate test updates:**
  - tools/redgorge.mjs: three checkpoints moved; spillway baskets added to the lock list; new spillway asserts.
  - tools/desert-foes2.mjs: the spillway's foes are counted apart (at most 5, one of them an elite); the old gorge still holds the 37 cap.
  - tools/redgorge-route.mjs: new spillway legs and a `--spillway` flag.
  - New tool: tools/redgorge-matprobe.mjs, which reads her counters per fight (`--trace` shows what the bot's hands were doing).
- **Reds that are not mine:**
  - curve-gate: wood and marsh are out of their act band.
  - mark-integrity: `undeadmage|markTell` PHANTOM POSE. All matriarch marks are posed and land.
  - The full careless-hand route pilot (L1, foes alive) still breaks after the first deaths in the middle gorge (the old harness); the spillway-only runs are clean.
- **textfit --strict:** see the addendum at the end.

## ART needs (sonnet art lane; every new piece is a readable placeholder now)
- The standpipe baskets on her ledge (cols 4-5 and 34-35 of the stage): the stone pipe, the water column, the deck in its rope cradle, the pressure gauge. Basket W rises past bridge A's post, so its look needs routing round the bridge.
- The sluice WAVE (a white bar) needs a foam wall. The lever marker (chevron + `PULL (E)`) and the dashed lever-to-her line need a polished look.
- Her knock-off-the-wall fall: today it uses her flight frame and then her down frame; it wants a tumble.
- The Spillway section:
  - Its own look: dam ashlar above row 32, red rock below. Today the backdrop only covers the gorge (cols 3-45), so the spillway shows the generic backdrop.
  - The dammed channel's dry, stained spillway face.
  - The crest and its rope.
  - Basket wheels drawn in the channel while the sp3 basket hangs off it at cols 80-81; it needs a chain or cable.
  - The head shelf.

## QUESTIONS FOR DANIEL
1. **THE HOLD.** She won't go below 60% until the sluice has stunned her once. This is how the first pass forces the lever.
   - Rec: keep. Built that way.
   - Alternative: a soft version, 0.4x past the line instead of a hard hold.
2. **Damage x2.4 and a 22% dry rate.** The human bot dodges so well with flasks that her blows needed about x2.4 to reach 60-70%. Dry she is 22% (warden and pyro both 0/3).
   - Rec: keep, and re-measure once claude/flasklever's bots land. She is exempt from its act dial.
   - Alternative: x1.9 damage with health 1150, which measured knight/warden/pyro 6/0/6.
3. **Warden vs knight and pyro.** Across every config the warden lags: his fights take 150-230 s against the others' 100-160 s. I worked round it (the pounce tell kept at 0.72 s, a smaller landing box, the 10% cap on sluice stuns).
   - Rec: keep. If the warden reads too hard in play, the warden kit or bot lane should look at his slower output against beasts.
4. **Water damps fire** (0.5x on her while she is soaked) slows the pyromancer, who was 6/6 in every other config.
   - Rec: keep. It is the crab's old rule.
5. **The Spillway is a descent then a climb.** You go down a 40-row rope or drop into the dry basin, then climb 40 rows on three baskets. This was the only way to place a real climb before her without shifting the whole level.
   - Rec: keep.
   - Alternative: rebuild the summit as the climb.
6. **Shrines:** the climb's top, bridge four and her door; the bridge-two and summit shrines were removed. A death in the spillway replays the narrows and the summit.
   - Rec: keep. This is the A10b spacing.
7. **A blow into her raised talons is now 0.4x, not 0** (B15 floor), and other blows outside openings are 0.5x ("TOUGH HIDE: STUN HER").
   - Rec: keep. It makes the lever the way to really hurt her.
