# claude/canal5 - THE LEGGING TUNNEL HOTFIX (Opus, 2026-10-06/07)

Base: origin/master b00de8b6 (batch74 live). Brief: Daniel, live play: "the tunnel isn't really working right - glitchy, awkward. There's a LADDER -
I jumped out of the area and the RAFT DIDN'T FOLLOW ME... I COULDN'T GET TO THE BOSS." Built the coordinator's recommended design. Jenny's fight is untouched.

## The glitches found (each reproduced headless first, then fixed at the cause)
| # | glitch | cause | fix |
|---|---|---|---|
| 1 | **Out of the moon shaft and over the hill** (the ladder Daniel took, most likely). Up its ladder, a jump from the top rung went to y -50, above the map, onto the hill's top. The barge never followed. You could walk on over the hill and drop into the basin ahead of her. Her basin lock is the only way to Jenny's door, so the run was over. | `air(307, 308, 0, 13)` opened the shaft to row 0. The art drew a grating there, but the grating was not solid. | The grating (rows 0-1) is solid. The niche and its coins are kept. Measured: the lowest y is now 46. |
| 2 | **"The raft didn't follow me."** Off her deck in the tunnel (a ledge, a ladder, the gallery, the summit bank), she never moved again. | canal4's tunnel moved her only by legging. `comeBack` was switched off in the tunnel (`!tun`). | **THE CALL**: nobody aboard and a hero off her in the tunnel on footing (a ledge, a ladder, the gallery, the moon shaft), she GLIDES (`RIG.glide`) to put her deck under him, either way. Her water still decides: never through planks that are down or a shut gate. A bell and a told line ("YOUR SHOUT RINGS DOWN THE TUNNEL..."). A hero behind the mouth on the summit bank brings her back to the mouth. |
| 3 | **A fall handed you back to a ledge she could not reach.** Examples: the far side of the stop-planks, and the deep lock's gallery after it drained. That meant a loop of bites. | The canal's hand-back point (`P.safe`) was the last ground stood on. | **In the tunnel a fall puts you back ON HER DECK, amidships**, wherever she is. It is amidships, not her end, because her end was right under the bargee's hook: that was a death loop the route bot found. |
| 4 | **The deep lock's paddle shut her out.** Struck with her outside the chamber, it drained and the upper gate shut with her behind it in the pound. You could not get back to her. | The paddle drained whatever she was doing. | Reach option `needsHer`. Struck with her outside, THE PADDLE IS SET (told): she glides into the chamber first, then it drains. While she is in the chamber, the call keeps her there, so walking back to the paddle does not pull her out. |
| 5 | **DOWN on her deck took the deep lock's ladder.** Legging was DOWN held, so legging into the lock under its ladder grabbed the ladder. You climbed down off her into the water while she stopped. | main.js ladder grab: `keys.down && below`, with an exception only for the lifeboat. | main.js (one condition): DOWN on any canal mover never takes a ladder. Legging no longer uses DOWN anyway. |
| 6 | **A ladder rung stood you BESIDE her.** Every NET rung is a foothold (`isOneWay(NET)`). The deep lock's ladder runs down through her water, and the rung 2 px under her deck held a hero off her, at her bow, while she went on. | The deep lock's ladder ran under her bow. | A hero standing within 6 px under her deck, inside her length, is put on her (`tunnelHands`). A hero climbing DOWN a ladder onto her deck lands on it and never goes through it. |
| 7 | **The leggers' ledge gap could not be jumped.** A hero on a ledge had 2 px of headroom under the vault, so his jump had no height and he fell in. Every time, that meant back to a ledge or the water. | The ledges (row 15) sat right under the tunnel's roof (row 13). | **THE LEGGERS' RECESS**: the vault stands 3 rows higher over the stop-planks' ledges (`air(279, 298, 11, 13)`, with its own brick room, the dark and the fog). Measured with every hero, every one clears the 2-tile gap, even from a tile short. |
| 8 | **The deep lock's lower-gate slot drowned you.** Off the basin's west bank, a hero fell down the open G8 slot and stood on its sill under the water, outside every pool. He was never handed back (in god mode he drowned for 500 s). | A gate column lies between two pools. | **An open gate's slot is water**: bitten and handed back (`gateWater`, for every gate in the level). It is never a hand-back point. |
| 9 | **Legging was awkward.** DOWN held, a snap to full speed and a dead stop. | - | **LEFT / RIGHT legs her** (Daniel's pick). You walk her deck as anywhere. At her END (her bow holding RIGHT, her stern holding LEFT) you put your legs to the wall: she gathers way (`RIG.legAcc` 150 px/s/s), and when you stop she glides on a few px (`RIG.legDrag` 110) and stands. The legger is pinned at her end, lying low (the duck), so the beams go over him. In the tunnel her end holds you whatever you do (a guard, a swing): the way off her is a jump, never a step into the water. The speeds are unchanged: 56 lit, 32 dimmed. |
| 10 | **A beam hurt a hero who only stood still under it**, every second. | The beam test ignored motion. | A tunnel beam finds you only as she carries you into it, or as you walk into it. |
| 11 | **No windlass glint.** She coasted into the stop-planks with nobody pushing, so nothing ever said what held her. | The hold was told only on a push. | Holding the way at her end registers the hold, so the windlass glints. |
| 12 | **Readability.** Dimmed, the beams "vanished" (the art pass's rule). The ledges and gaps read only inside the lantern. | - | **The dark's own read** (`tunnelReads`, drawn over the dark): the beams' hazard bars, the ledges' lips with their ENDS marked (a gap is the dark between two ends), and the stop-planks' banded top while they are down. All of it is brighter lit and dimmer (never gone) dimmed. The lit/dim choice keeps its risk: dimmed you lose the brood, not the way. Stills: work/claude/lane-done/canal4art/canal5/ (compare with /after). |

**Deaths and respawn.** A death in the tunnel wakes you at checkpoint two. The summit mooring puts her there, she comes up the flight under you, and she carries you to the mouth. The bot's death runs prove it for every hero.
- The stop-planks are down again after a death. That is the death cost, and it is a question below.

## THE REAL-PLAYER TEST: tools/canal-tunnel-route.mjs (new; added to tools/check.mjs, see Checks)
- **Setup:**
  - Every hero (HERO_IDS, all 7), a fresh save, god off in the tunnel, dice seeded per hero and seed.
  - It wakes at checkpoint two by a real death, and plays with REAL KEYS: LEFT/RIGHT legging, jumps, UP/DOWN on ladders, real swings at the windlass, the paddle and her lantern.
  - It guards a told `!!` and takes level-up cards.
- **The STRAY plan (odd seeds) loses her every way a player could:**
  - back onto the summit bank (she comes back to the mouth);
  - off the ledge into the water (back on her deck);
  - waiting on the far ledge (she glides to it);
  - up the moon shaft's ladder, trying to jump out of its top (the grating holds), and down onto her;
  - off early onto the gallery, striking the paddle with her outside (she glides in, then it drains);
  - down the deep lock's ladder onto her.
- **Deaths:** one run in three DIES mid-tunnel and must reunite at the summit.
- **The RIDE plan (even seeds)** dims her lantern for the nest and goes the intended way.
- **The basin:** after the tunnel come the basin exam (god on: it is not the subject) and the corridor to her west door.
- **PASS:** her arena with no lift, never out of the moon shaft, and never parted from her for more than 12 s with nowhere to go.
- **Its careless-hand flask:** a heal when it is under 35%, counted. The subject is the barge, not a plain-swinging bot against the bargee and the watchman.

RESULT (final tree, `--seeds=3`, 21 runs): see the table below.

| hero | seed | plan | reached her arena | deaths in the tunnel | game s | longest parted, nowhere to go |
|---|---|---|---|---|---|---|
| knight | 1 | stray lit + death | yes | 1 | 291 | 3.4 s |
| knight | 2 | ride dim | yes | 0 | 226 | 4.9 s |
| knight | 3 | stray lit | yes | 0 | 254 | 3.7 s |
| pyro | 1 | stray lit + death | yes | 1 | 270 | 3.5 s |
| pyro | 2 | ride dim | yes | 0 | 211 | 6.2 s |
| pyro | 3 | stray lit | yes | 0 | 192 | 3.4 s |
| paladin | 1 | stray lit + death | yes | 1 | 340 | 3.6 s |
| paladin | 2 | ride dim | yes | 0 | 205 | 6.0 s |
| paladin | 3 | stray lit | yes | 0 | 274 | 2.0 s |
| pirate | 1 | stray lit + death | yes | 1 | 270 | 3.6 s |
| pirate | 2 | ride dim | yes | 0 | 180 | 3.8 s |
| pirate | 3 | stray lit | yes | 0 | 195 | 3.6 s |
| reaper | 1 | stray lit + death | yes | 1 | 1717 | 3.0 s |
| reaper | 2 | ride dim | yes | 0 | 239 | 3.2 s |
| reaper | 3 | stray lit | yes | 0 | 275 | 3.0 s |
| warden | 1 | stray lit + death | yes | 1 | 269 | 2.7 s |
| warden | 2 | ride dim | yes | 0 | 182 | 2.0 s |
| warden | 3 | stray lit | yes | 0 | 200 | 2.6 s |
| geomancer | 1 | stray lit + death | yes | 1 | 282 | 2.6 s |
| geomancer | 2 | ride dim | yes | 0 | 189 | 3.3 s |
| geomancer | 3 | stray lit | yes | 0 | 201 | 3.5 s |

**21/21 reached Jenny's arena.** There were no lifts. Nobody got out of the moon shaft. The longest anyone was parted from her with nowhere to go was 6.2 s (waiting on the gallery for the lock).
- Two paladin runs needed the basin's foreman taken out by the tool: the bargee-foreman's hook throws a plain-swinging hand into the canal over and over. That is the basin exam, outside this lane: see the questions.
- In the suite: tools/check.mjs runs `canal-tunnel-route` for knight, warden and pyro x 2 seeds.

## Checks (PORT 8690), on the final tree
canal (pure + page: smooth legging, the call, the grating, the ladder rung, DOWN takes no ladder, the paddle never shuts her out, the gate slot, a fall back onto her deck), canal-water, canal-aloft, greenteeth (every hero), signs, hint-shown, level-quality (every gated level clears the bar), stuck (static + runtime), mash-gate, mash-carry, canal-tunnel-route.
- **Re-stamped, level THEN boss** via tools/mash-bot.mjs:
  - Mash level: knight 0% lowest health and 5 deaths; warden 7 deaths; pyro 5 deaths.
  - Mash boss: 0/6. Jenny was left on 91% (knight), 95% (warden) and 86% (pyro).
- **Level-1 pilot:** 95 blows taken and 12 deaths. Curve: 436% lost a run, 12 deaths, inside the act-4 band.
- Jenny's fight is unchanged: no greenteeth file was touched, and greenteeth is green.

**Tests changed because the design changed** (Daniel's legging change and the coordinator's design). They were replaced, not weakened:
- **tools/canal.mjs:**
  - The legging keys are RIGHT, not DOWN.
  - The pure test measures the steady speeds after a second's way, and adds smoothness (she gathers way, glides a little, stands) and legging west to the mouth.
  - The sign must name HOLD LEFT OR RIGHT.
  - "Her light draws the brood": lit, the mouth's grindylow must COME FOR HER. That means aboard, or up at her end for the legger's ankle, because a legger now lies at her end over the water. Dimmed, it still must not.
  - "A fall off the ledge" is now handed back ONTO HER DECK amidships, not to the ledge.
- **src/canal-hands.js:** the canal-water source promise (`!atWater(H, P)) P.safe =`) is kept as written.

## Not done / reds
- **Not run:** slopes-trace, textfit, or the full suite (the coordinator runs suites).
  - Slopes-trace may want canal rebased. The tunnel's recess is new geometry under the summit, and slopes-trace runs the canal. The legging verb changed too.
- **Co-op is untested.** Two leggers: their directions sum (opposed = no way). The call, the pin and the hand-back loop over the players.
- tools/canal-pilot.mjs, canal-map.mjs and canal-shots.mjs still script the old weir (left as canal4 left them).

## QUESTIONS FOR DANIEL (recommendation first; built)
1. **The legger lies at her END** (her bow holding RIGHT), over the water. The brood's grabs from the water find him there, and he meets the bargees' hooks first. Rec: keep. It is the legging verb's own risk, and lying low ducks the beams. Alt: legging pinned where you stand mid-deck (it felt like ice-walking in tests).
2. **THE CALL is automatic** (a bell and a told line after 0.35 s off her): there is no shout key. Rec: keep, no new key. Alt: a deliberate shout (UP + attack).
3. **A death in the tunnel lowers the stop-planks again** (redo the windlass). Rec: keep, as the death cost (Salt & Sanctuary direction). Alt: the planks stay up once wound.
4. **The legging pace is unchanged** (56 lit, 32 dimmed: about 34 and 19 px a second at the default game speed 0.6). Rec: playtest. If it feels slow, 64 and 36 is the next step.
5. **The basin exam is outside this lane, and it was left as it was.** Its horn window is tight for slower hands: the bot needed the horn twice on some seeds. The deck foreman can also walk off the island across the bridge while his elite gate keeps her door shut. His hook throws a plain swinger into the canal again and again: the paladin bot could not cut him down twice. Rec: playtest it before changing anything. If it is a wall, the next lever is his hook's throw, not his health.
