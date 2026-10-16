# claude/lamplit2 - THE LAMPLIT STREET 2 (lane report, 2026-10-16)

Built `scratch/brief-lamplit2.md` in full, on `claude/lamplit2` off BATCH96 (7ade0605). Greybox: the art lane is listed at the end, and the level ships only after its art pass (art-before-live).

## Rates (campaign level L20, boss-rates `--profile=human`, 12 seeds a hero, knight/warden/pyro)

| row | with flasks (the band) | dry (human+dry) | fight length (wins, min / median / max) |
|---|---|---|---|
| THE LAMPREEVE (mini) | 11/12 7/12 12/12 = **83%** in band (75-85) | 7/12 5/12 9/12 = 58% | 29 / 58 / 73 s |
| THE TOLLMASTER | 8/12 8/12 9/12 = **69%** in band (60-70) | 4/12 4/12 8/12 = 44% | 44 / 87 / 133 s |

Mash (`tools/mash-bot.mjs`, re-stamped level then boss): the level fails all three heroes (each died at least once, 195-232% of a hero lost). The Tollmaster and the Lampreeve are each 0/6, and the hero dies in 19-31 s with 93-99% of the boss left.

## What I built

**1. THE LAMPREEVE (mini)**
- Cut the fast random AoE: his black-water DOUSE (a cone that blinded you and snuffed every lamp it reached).
- In its place, THE OIL FLASK (red !!). It is lobbed at you and its landing SHADOW follows you, then holds 0.28 s before the throw. You step off it. It leaves an oil SLICK, and a lamp relit beside a slick flares WIDE (150 px instead of 84; 'THE OIL CATCHES').
- His blows land a quarter lighter: sweep 31 to 23, lunge 42 to 32, hook 25 to 19, flask 19.
- RELIGHT = STUN: carry fire to a lamp he put out and relight it while he is beside it. The flare stuns him: blinded, the gold ring and a clock, 2.4 s, every blow x1.7.
- Striking the lamp he is hooding stays, as the smaller opening (1.2 s, x1.3).
- Every opening ends in a told 3 s WARD (B3).
- B15: out of his openings his coat takes 0.45 of a blow (it was 0.25).
- Health 560 to 2000. On the 0.45 coat and the stun, 560 died in 15-24 s and 1300 in 20-50 s, at 12/12.
- His flask also lands at your feet, so crowding him is no answer. Flask, lunge, hook and sweep cooldowns are shorter: the bot took no damage from him otherwise.

**2. THE LEVEL: the lamps are used more** (all three of Daniel's picks)
- **LIGHT THE WAY:** `wayLamp` adds four dead street lamps under the water: fish market 166, counting house 318, procession road 498 and 516. Each holds a vault POCKET (`L.airRooms` with a lamp column) that exists only while the lamp burns ("THE AIR COMES BACK UP THE MAIN"). Two pockets have silver up under the vault.
- **YOUR FLAME DROWNS:** under the water and out of a lamp's air, carried fire lasts 5 s instead of 14 (`WICK_WET`). A fuse ring is drawn on the flame.
- **THE WATCH HATE LIGHT:** relighting a lamp beside a drowned watchman blinds him for 2.6 s and drops his guard. It is taught on the fish-market roofs: a dead lamp at 116 with a watchman beside it, and a sign.
- **Teach -> test -> remix -> exam:**
  - Teach (fish market): the watch, the flame-drowns sign, the 166 pocket.
  - Test (counting house, the required swim to the bone gate): lamp 318, between the vault pockets, is now dead and is the middle of the swim.
  - Remix (the Lampreeve): his relight stun.
  - Exam (procession road): two pocket lamps beside the watch. Light the way, or work the beam.
  - One REQUIRED use (A4): THE TOLL GATE. A PORT now closes the hall door at 575, and it lifts when the lamp at 570 is lit. Fire comes from the burning lamp at 560. There is a glint + stall nudge spot `lp-tollgate`, and the gate stays open by mark.
- **Braziers:** the Tollmaster's braziers are `city` braziers. They give fire, and they never tip. A blow used to spill them as 'OIL!'.

**3. THE TOLLMASTER REDESIGN** (puzzle boss on the level's verb, B1/B17)
- **THE TOLL IS YOUR LIGHT:** a lamp relit BESIDE him (76 px) flares into his robes. He is STUNNED and BURNING: the gold ring and a clock, 2.8 s, x2, plus 1.2% of him per 0.5 s while he burns. Then a told 3 s WARD.
- **CUT:** THE DARK (the room AoE), the coin weight, and the blackout.
- **Kept:** LEDGER LASH (a parry opens him x2 for 2 s) and the ROD OF OFFICE (jump).
- **New told moves, one per phase after the first:**
  - COLLECT THE TOLL (P1; quiet, no mark): the nearest lamp's flame streams to his box over 1.5 s, drawn. Stand in the stream (it burns, 8) or strike the box, and the lamp keeps its flame. Otherwise it goes dark.
  - THE SCALES (P1; red !!): a pendulum on a 110 px chain. Swung LOW, you jump it; swung HIGH, you duck it. The two alternate.
  - SEAL OF DEBT (P2; red !!): the shadow follows you, holds and stamps, and leaves WAX for 4.5 s that slows you to a crawl.
  - WRIT OF DROWNING (P3; quiet): for 4.5 s the water stands up in the lamp hoods on YOUR half of the flooded square, and those lamps hold no air.
- **THE BIER (P1):** three blows on one corner within 4 s fell its bearer. The bier TILTS and he is open x1.5 for 1.3 s.
- **P2 (62%):** set down. The bearers are part of him, so there are no adds now (four watchmen used to spawn).
- **P3 (30%):** the square floods to its roof, and the lit lamps are its only air.
- **Phase changes** wait for his blow, never for an opening. An opening crossed into the next phase ends there.
- **B15:** he was still on the retired x0.05 chip. Now `GREED.chipBy.tollmaster = 0.4`, and outside his openings blows clank.
- **Numbers:** health 980 to 2850. Ledger 22 to 17, and it strikes at body height only (a hero on a cornice is over the book; the knight was 2/12 before this). Scales 20, seal 19.
- **Move mix** over a probe fight: ledger ~30%, rod ~20%, collect ~15%, scales ~15%, seal ~12%, writ ~8%. None is over ~35%.

**The bot (src/lab.js `lampPlan` / `lampAirFor`)**
- It plays the verb the way a player does: it takes fire, stands at a dead lamp on the far side from him, and swings at the lamp when he is beside it.
- In the flooded square it strokes DOWN to him, and below half a breath it goes up under the nearest lamp the writ has not drowned.
- Nothing is flared for the bot: every relight is a real swing.

## Checks
- **New:** `tools/lamplit2.mjs` (added to check.mjs), green. It covers every point above: stun/ward/far, coat 0.45, flask stay/leave + slick, douse gone; collect alone/struck, 0.4 shut, relit x2 + burn + ward, tilt, scales stand/duck, seal + wax, no P2 adds, P3 flood + lamp air + writ; pockets, toll gate, watch flare, flame fuse.
- **Green:** tells (MARK table re-written by `--write`), boss-read, mark-integrity, untold-told, answer-tags, weak-bosses, boss-greed, boss-fight-end, boss-openings, signs, solid-islands, checkpoints, keys, floaters, goblin-lint, sea-requests, dangling-paths.
- Page, green: reach-heroes (lamplit, all 9 heroes, 0 crossings), stuck (static + runtime, with the new lp-tollgate spot), mobile-perf (inside budget).
- visible-supports lamplit: REPORT-ONLY, 33/69 overhangs unverified (the old street arcade; not new from this lane).
- textfit: the talk[knight]/talk[warden] scopes TIMED OUT (480 s) on the loaded PC (suite + PC reset), not a clip. My new sign lines are held by signs (every one fits on 2 lines).
- level-walk pilot/curve: NOT re-stamped (machine time; the PC hard-reset 15:10). level-quality says the curve row is stale: re-run node tools/level1-pilot.mjs lamplit --curve on integ.
- **Tests changed for the approved design (deliberate design changes, not weakened):**
  - weak-bosses: the hood strike is now the smaller opening (>= 1.0 s, was > 1.5). The relight stun, the big one, is held by lamplit2.
  - boss-greed: the Tollmaster's shut state is on his feet. Carried, three blows tilt him open by design.
  - sea-requests: the old "no Tollmaster flooding" request is superseded by the 10-08 brief, which floods P3 with lamp air. The check now holds: no dark, no weight, a told flood.
- **level-quality lamplit** (not on the GATE list): MISSES bands 3/5, mechanics 4/5 (lamps are not counted as a gadget kind), secrets 1/2. These are reported, not fixed: bands would need a geometry pass.

## Greybox grade (honest)
- **Mechanics: B.** Every verb is drawn and told, with its own windup and release frame (B16) on both bosses.
- **Art: D.**
  - The stream, the scales' weight, the seal shadow, the wax, the oil, the writ water, the fuse and the pockets are canvas primitives.
  - The new poses are frame-DSL greybox.
  - The tilt has one frame (it does not flip by side).
  - The watch has no blinded pose: he uses his stagger.
- **Overall C+.** Not for live until the art pass.

## ART LIST (for a SONNET art lane)
- **Lampreeve:** flaskTell (frame 15), flaskThrow (16); the flask in flight + its landing shadow; the oil SLICK (and the slick catching fire); the relit-stun blinded variant vs the hood flare.
- **Tollmaster:**
  - collectTell (13) and collect (14), with the TOLL BOX and its flame stream (lamp to box); the lamp's flame shrinking as it streams.
  - scalesLowTell (15), scalesHighTell (16) and scalesSwing (17), with the brass COUNTERWEIGHT and chain.
  - sealTell (18) and sealHit (19), with the SEAL, its told shadow ring and the WAX patch.
  - writTell (20) and writRead (21), with the scroll and the risen water in the hoods.
  - flared on the bier (22) and on foot (23), the robes burning.
  - The bier tilt (24), both sides.
  - The bearers stepping back at set-down: the bier left on the stones.
- **Watch:** a blinded pose (the WATCH HATE LIGHT).
- **Level:**
  - The pocket (air under the vault) when lit vs absent; the 'way lamp' dark/lit distinction.
  - The TOLL GATE portcullis + its gate lamp.
  - The city brazier as a fire source (a glow when you take fire).
  - The fuse ring on a flame under water.
  - The dashed flare-reach ring on a dead lamp.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. Should breath run on the A13 no-stagger drain game-wide? **Rec: yes, in its own lane.** It is still the old 4-damage tick every 1.3 s (noKnock) on every water level, the Lamplit Street included. drain.js landed (the sun uses it), but no Long Water lane wired breath into it. I left it untouched to keep this lane off other levels' rows.
2. Is the Lampreeve "too powerful" still? **Rec: play it.**
   - His blows are 25% lighter and the random douse is gone.
   - To reach the bot band (75-85), his flask also comes at your feet and his moves come oftener.
   - He is 2000 health on a 0.45 coat. The bot at the campaign's L20 took nothing from the old kit.
   - If he feels unfair, lower the flask cadence first (`e.flaskT` 4.4 / 3.4), not his damage.
3. Is the full-roof flood in P3 the right call? **Rec: yes, as briefed.** The lamps are the only air, so a relight is breath and an opening. It undoes the older "no Tollmaster flooding" request (sea-requests updated). If it reads as too much underwater, flood only to the lamp hoods' height.
4. Should Lamplit go on the level-quality GATE now? **Rec: yes, after a geometry pass** for bands (3/5) and a second off-route secret. Mechanics would pass if lamps counted as a gadget kind.
