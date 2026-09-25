# THE QUEEN'S PILLARS (Highcrown, the Goblin Queen)

Daniel, 2026-09-25: *"We need some way of damaging her rather than just having her run into walls. The pillars weren't
perfect - but we need some mechanic like that."* He chose three cracked, load-bearing stone pillars on her Great Hall
floor, broken by her own charge. Decided; this is how it is built.

## The rule
**Bait her charge into a pillar and it comes down on her.** She is PINNED, plate open, exactly as the chandelier pins
her (one shared `gqPin`: 4.6 s, 3.8 s in round three, 7% of her health, `gqOpen` true for all of it). A plain wall only
makes her stumble (`dazed`, no opening), as now. The chandeliers stay, as the second and optional way.

## The room (final columns; the hall floor is 890-918, her dais 919-933)
- Three pillars, `ent('qpillar')`, at 899, 904 and 911: between the chandeliers (896/902/908/914) and clear of the
  windows (894/906/918). A pillar is a prop, not tiles: you walk past it, and so does she when she only walks. Only a
  CHARGE breaks one. The 911 torch moves to 916 so it is not behind a pillar.
- A broken pillar leaves RUBBLE: a real low platform (one-way tiles on row 19, three wide, only where there was air),
  drawn as a heap of broken drums over the ledge art. It stands again when her ROUND changes (66% and 33%), and on a
  retry. The rubble goes when it stands.

## Telling it (C1: a thing about to change is told)
- Every pillar is drawn CRACKED: a dark split up its shaft, chips out of the drums, a capital pressed into the ceiling,
  and grit trickling from the cracks now and then. A whole hall of them reads as holding the roof up, just.
- When she winds up a charge (`chargeTell`, 0.8 s, the `!!` she already has), the first standing pillar in her line
  SHAKES and sheds dust for the whole tell: the player can see which pillar is about to go.
- The sign at the door (209 source / 891 final), in the game's voice:
  `HER PLATE TURNS BLADES. STAND A PILLAR BETWEEN YOU AND HER CHARGE: IT COMES DOWN ON HER. OR CUT A CHANDELIER DOWN.`
  (measured with `textfit`).

## Her side
- She must be able to charge into them from where a player stands. Her charge already runs at you when you are more
  than 100 px off (`chargeT`, 5.5 s). E2 says the thing the fight is about goes at the top of the chain, so when a
  standing pillar is BETWEEN her and you, the charge is asked for before the chandelier throw, the decree and the
  sceptre. Otherwise her chain is unchanged. Her numbers are not tuned.
- A pillar only breaks from a charge that started on the far side of it (she cannot break one she is standing in).

## The bot (src/lab.js)
Pinned: cut her (the `open` branch, as now). Otherwise, while a pillar stands, go and stand past the nearest one on
the side away from her, more than 100 px from her, and wait for the charge; jump if it would reach you. With no
pillar standing, the chandelier play as now. Separately, Daniel's standing decision "FIX THE BOT, not the Queen": the
shelf rule that stops the hands striking a boss more than 24 px below them is looked at for her.

## Proof
- `tools/queen-pillars.mjs` (new, in check.mjs), in the page: three pillars; every hero, from either side, baits a
  charge into a pillar and she is pinned 4.6 s for 7%; a charge into the hall's end only dazes her (no opening);
  rubble is floor and is drawn; the pillars stand again at her round change. RED FIRST on the build without them.
- A11 (the opening is caused) and `arena-supplies` stay green; `queen-chandelier` stays green.
- Re-pilot: bossLab crown, every hero, refill health, 300 s cap (6ac9c23's settings), before and after.
