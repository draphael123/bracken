# claude/canal4 - THE LEGGING TUNNEL + JENNY'S RAFT DUEL (Opus, overnight 2026-10-05/06)

Base: master 85e13368 (batch71). Master did not move during the lane (fetched before this report). Brief: the lane brief brief-canal4 (Daniel's 10-05 live playtest of THE FOG CANAL and JENNY3). Daniel was asleep: every open choice was built as the recommendation and
is listed under QUESTIONS.

## 1. The weir is gone: THE LEGGING TUNNEL (cols 248-345)
The weir chase (the old cols 248-325, "really glitchy") is removed: no chase, no flood, no loose run, no booms, no tiller window.
`L.chases` is empty, and the rig's weir code (weirStep, the head race, the flood laps) is deleted.

The summit pound runs on into a long, pitch-dark canal tunnel under the hill.
- **No current.** She moves only while a rider LEGS her: he lies on her deck (DOWN held) and walks her along the walls.
- **Her lantern is the rule's second half.** Strike it (on its stern pole, in the tunnel only) to DIM it, and strike again to LIGHT it.
  - Lit: you leg her at 56 px/s. The light shows the low beams, the leggers' ledges and the gaps. It also draws the brood: grindylows come aboard, wisps come for her, and the watchmen's bows see her (fogSight in the tunnel's dark).
  - Dimmed: nothing sees her, and you leg her blind at 32 px/s.
- **Teach, test, remix, exam inside it:**
  - **THE MOUTH (teach, 248-272).** Two signs at the portal: HOLD DOWN / LEG HER, and STRIKE her lantern. Two low beams. One grindylow that comes only to her light.
  - **THE STOP-PLANKS (test, 273-298).** Planks across the water hold her. You go up on the leggers' ledge and over a gap. A ledge lantern shows the gap, and a watchman's bow sees you there. Past a bargee, a WINDLASS winds the planks up. Then you go back along the ledge to her.
  - **THE NEST (remix, 299-318).** A run of low beams over four grindylows: dim her and slip past slowly. But THE MOON SHAFT lights her whatever her lantern says, so what is under it comes aboard. There is also a wisp, and a pocket of coins up the shaft.
  - **THE DEEP LOCK (exam, 319-345).** A lamplighter keeps the ledge lantern lit for a watchman. Then comes a lock 26 rows deep, draining at 52 px/s in about 8 s. Its paddle is back on the ledge, so she goes down without you, and a ladder goes down after her. The brood on its steps is stranded as it drains. You leg her out of its lower gate into the basin.
- **Fights during the rule:** every tunnel encounter stands in the dark, under the lantern rule.
- **Glint and 10 s nudge:**
  - The windlass glints while the planks hold her: STOP-PLANKS HOLD HER: FIND THE WINDLASS.
  - Her deck glints while a rider stands on her in the tunnel: THE TUNNEL HAS NO CURRENT: SHE GOES ONLY IF YOU LEG HER. It also glints while a hero has left her: SHE WAITS IN THE DARK: GET BACK ON HER DECK.
  - The deep lock's paddle glints through the existing gate nudge.
  - The hint-box lines are told once where they first matter.
- **Every hero with base movement:**
  - The deck to a ledge is the towpath hop (46 px).
  - The ledge gap is 2 tiles.
  - The ladders are ladders.
  - Legging is the universal duck.
- **Checkpoints are unchanged.** There are three, with 153 columns from the summit to her door (checkRun 200).
- **The level is 20 columns longer** (W 432 to 452). The basin and Jenny's lock are moved +20 as they were; she is at sx 396.
- ARCS has a new `tunnel` arc. MACHINES gains 'tunnel'. SECTIONS has THE LEGGING TUNNEL at 248, the basin at 346, and her lock at 390.
- New prop `stopwinch` (main.js: one case added to the canal machine list), an L.unlocks row, and the tunnel's brick room (`cnTunnel`).
- main.js CNFX gains `lampDraws` and `blind` for the grindylow and the wisp.

## 2. JENNY: THE RAFT DUEL + KELP ARMOUR (src/jenny-greenteeth.js, -hands.js rewritten)
The lock's paddles, drain, flood, culverts, fog, lure, sunken boat, weed lawn, and her grab, lash, reach, bite, tear and surge are gone.

**The stage.** Her chamber has a stone landing inside each door and her water, 5 rows deep, between them. The last barge, widened with the lock's timbers, becomes a 224 px RAFT. It waits at the west landing. Step on and she wakes: she hauls herself aboard at its far end, and the raft goes out to the middle. A fall into her water bites and hands you back onto the raft. When she dies, the raft drifts to the east landing and the way on.

**Kelp guards by angle (B11). She is always hittable.**
- **Phase 1, kelp on her body:** HIT HIGH (a jump attack, the rising cut, the air up-swing, a plunge).
- **Phase 2, she pulls it over her head:** HIT LOW (the low sweep, the knight's trip, the warden's low poke).
- **Phase 3:** it shifts every 13 s, told.
- **The read:**
  - The bare part wears a gold outline and an arrow (the shared OPEN read, B10). The bar says HIT HIGH or HIT LOW.
  - A blow on the kelp CLANKS, sparks and says KELP - HIT HIGH or KELP - HIT LOW, and lands at x0.05.
  - A plain standing swing is always on the kelp.
  - A blow at the bare angle is not greed (`OPEN_RULE greenteeth: gtOpen || e.bareHit`), so the mash bot's plain swings clank into greed reprisals.

**Her four blows, kept:**
- **THE SLAM** (phase 1). Step out and her claws STICK in the raft: OPEN for 3.2 s, every angle at x1.25 up to 10% of her. Then she is WARY for 3 s (told, kelp everywhere: B3).
- **THE CHARGE** (phase 2). She goes under the raft and a bow-wave runs along the deck (jump it); she hauls herself aboard at the far end.
- **THE NET** (phase 3).
- **THE VINE** (every phase).

**Fiercer each phase:**
- Gaps 1.0, 0.8, then 0.62 s.
- Walk 42, 54, then 66.
- Tells x1, x0.92, then x0.85, every one at least 0.5 s.
- **Phase 2:** she HEAVES the raft. It is told first ("SHE HEAVES THE RAFT: KEEP YOUR FEET" and red deck arrows), then it tips toward her and you slide to her.
- **Phase 3:** she DRAGS THE RAFT LOWER. It is told 2.2 s first, with red marks on the ends. Then the deck narrows from 224 to 160 px.
- One windup at a time.

**Numbers:** health 755 to 2100. Damage: slam 82, charge 72, net 55, vine 85.

**The human bot** (src/jenny-greenteeth.js PLAN):
- It reads her tells late and misses some.
- It swings at the wrong angle 12% of the time.
- It waits out a told slam clear of the mark.
- It strikes high (a rising cut or a jump attack) at the body kelp, and low (a sweep) under the hood.
- Its rolls are now a hash per key: the lab's seeded Math.random repeated frame to frame, and its misses came in runs.

## Numbers
**Jenny at campaign level** (`PORT=8640 node tools/harnesscard-rates.mjs canal --mode=new --seeds=6 --secs=300`, L21, no skills):

| hero | wins | fights (s) |
|---|---|---|
| knight | 2/6 | 51-68 |
| warden | 4/6 | 59-103 |
| pyro | 6/6 | 61-79 |
| **total** | **12/18 = 67%** | no hero at 0 |

- That is ABOVE the 50-60% band. See question 1.
- About 40 seeds a hero were spent tuning, which is over the ~20 cap. I stopped there.

**Mash bot** (re-stamped via tools/mash-bot.mjs, level THEN boss):
- Boss 0/6: knight dead with her at 84% left, warden 97%, pyro 86%.
- Level: every hero dies (5 deaths, lowest health 0%).

**Level-1 pilot and curve re-stamped:** 90 blows, 12 deaths. The curve has 429% lost and 12 deaths, inside the act-4 band of 120-600% and 1-12.

## Checks (named, on the final tree), all green
canal (pure + page), greenteeth (pure + page, every hero), canal-water, chase, goblin-lint, hint-shown, tells, answer-tags, boss-greed,
boss-openings, boss-fight-end, boss-navigation, stuck, architecture, checkpoints, skins, dangling-paths, npc-removal, signs, corpses,
one-new-foe, checkpoint-gaps, threat-holes, audio-assets (no new SFX: the tunnel and the raft reuse canal and gt* sounds), textfit,
weapon-skins, tower-chase, mash-carry, mash-gate, level-quality (every gated level clears the bar), slopes-trace.

- **slopes-trace:** I rebased canal (the tunnel is new geometry). I also rebased **welltown**, which needs explaining:
  - Its first frame is the momentum the canal's last lip probe leaves on the hero. The trace runs the levels in one page, with the canal just before welltown.
  - Welltown was identical on master 85e13368, checked in a throwaway worktree.
  - No welltown file changed. Wood, kings, keep and burial are untouched.

**Tests changed because the design changed** (Daniel's pick). These are replaced, not weakened:
- **tools/canal.mjs:** the weir and flood assertions became tunnel assertions:
  - pure: legging lit and dark, the stop-planks and windlass, the deep lock under 10 s, her lantern;
  - level: teach, test, remix and exam contents, no chase, a checkpoint before it;
  - page: a rider who stands is not moved and one who legs is; the lantern dims and lights to a real swing; light draws the brood and the dark does not; the beams never hit a legger; the planks wind up to a real swing; a fall off the ledge is handed back to the ledge.
  - Her footprint asserts follow the new stage.
- **tools/greenteeth.mjs:** rewritten for the raft duel. It has a per-hero page check: for all 7 heroes, a real jump attack lands whole, a plain swing clanks, and a real low sweep lands whole under the hood.
- **tools/boss-openings.mjs** canal row: left alone she opens nothing, and a slam stepped out of sticks her for 3 s or more.
- **tools/boss-navigation.mjs** canal row: the pilot must fight on the raft. It was "swim the lock and climb the walers".
- **tools/chase.mjs:** the chase levels list is now [fallingtower, fair].
- **tools/canal-water.mjs:** her water is at one level now.

## UNVERIFIED
- Nothing was played by hand. **Daniel's playtest gate on Jenny is open.**
- The art is greybox: the stop-planks, the windlass, the raft, the kelp and the tunnel's dark are plain shapes. A Sonnet art pass should dress them.
- Co-op is untested. The lantern, the raft slide and the hand-back all loop over the players.
- tools/canal-pilot.mjs, tools/canal-shots.mjs and tools/canal-map.mjs still script the old weir. They are tools, not checks, and are left as they were.

## QUESTIONS FOR DANIEL (recommendation first; built)
1. **Jenny is at 67% (12/18), above the 50-60% band.**
   - The pyromancer never lost (6/6). Four of its wins ended at exactly 20 health, which looks like a hero-side floor or heal at her death.
   - The knight is at 2/6. He loses to her claws while committed to a swing.
   - More health made her easier: the phase timings shift and the outcome is not monotonic.
   - Rec: let your playtest set it. If she is too easy, the next lever is her charge and vine damage (what the pyromancer takes), not her health.
   - I stopped at about 40 seeds a hero: the cap is ~20.
2. **A plain standing swing always meets kelp** (MID is neither high nor low). Rec: keep. It is what makes the mash bot lose (0/6) and makes the angle a real verb. Alt: let a standing swing count as LOW under the hood.
3. **The 3 s WARY ward after her opening** (kelp everywhere, no slam) follows B3. B13 warns against waiting-room immunity. Rec: keep, because it is 3 s and told. Alt: wary only stops the slam.
4. **Fights run 51-103 s**, under the 90-150 s target. Rec: playtest first.
5. **Legging is "hold DOWN on her deck"** (the universal duck, so it also passes the low beams). Rec: keep. Alt: hold DOWN plus a direction to leg backwards too.
6. **Her lantern dims only in the tunnel.** Outside it, it always burns, so the fog sections are unchanged. Rec: keep.
7. **slopes-trace welltown was rebased** (an order artifact, see Checks). Rec: accept.
8. **Music:** no new track. Jenny keeps her composed synth theme and the tunnel plays the canal's own. No picks are needed.
