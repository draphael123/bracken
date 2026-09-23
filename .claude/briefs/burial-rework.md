# THE BURIAL CAVERNS, REWORKED — brief (queued AFTER THE BURNING VILLAGE; agreed with Daniel 2026-09-21)

## What Daniel said
"The burial caverns still needs work. It's mostly just walk right." He approved all five changes below and the Grave Warden.

## The numbers that prove it (2026-09-21, after the batch-1 geometry pass)
- 1140 wide x 60 tall, but everything you can stand on sits in a band ~17 rows deep (rows 22-39 over most of the level).
- 3.6 foes/screen, 27% flat screens, 7 poison pools; NO mini, NO ambush rooms, NO movers, NO doors, NO quest.
- 59 of ~170 creatures are zombies (walk-at-you fodder: reinforces the corridor).
Re-measure before and after with `work/claude/shape.mjs burial` AND a height-band profile (the reach fill's min-max row per 60 columns).

## The five changes (existing verbs only)
1. **A DESCENT, three depths.** THE BARROW (under the hill) -> THE CHARNEL GALLERIES -> THE DROWNED OSSUARY, then the
   climb back UP to the Buried Dead's tomb (the level's own rule: "THE LOWER ROAD ALWAYS LEADS BACK UP"). Drop through
   rotten crypt floors (the Undercrown's timber-roof mechanic). Target: most screens ask up-or-down, not just right; the
   reachable band should span 40+ rows. The level probably grows taller (H ~110): tall:{} like the Undercrown.
2. **THE GRAVE CANDLES quest.** Three unlit grave candles in side vaults (Undercrown lamp system: `quest` + lamps); the
   three silvers down the same side routes.
3. **Two sealed-crypt AMBUSHES** (L.ambushes: the doors seal, the dead rise in waves) + **THE GRAVE WARDEN mini** in the
   ossuary, halfway down (see below).
4. **Enemy mix.** Replace ~half the zombies with bone archers on ledges, bone goblins throwing skulls across the pits,
   ceiling spiders. GARRISON row stays; no blanket calm; ELITES coords rewritten (lengthening/reshaping shifts them).
5. **Movement.** Coffin lifts / chain platforms (movers) and swinging lanterns (swings) in the deep sections.

## THE GRAVE WARDEN (mini-boss)
The ossuary's keeper: huge, slow, armoured skeleton; a gravedigger's spade; a heavy bell-lantern on a chain. Fought in a
round bone vault with OPEN GRAVES in the floor.
- **SPADE CLEAVE** `!` — wide overhead chop, long windup (spade behind his head). Block or step back.
- **GRAVE TOSS** `!` — scoops grave dirt, flings three arcing clods. Block, or jump between them.
- **LANTERN SWING** red ✕ — the chained lantern whirled in a low circle round him, twice. Too heavy to block: jump it.
- **DIG AND RISE** red ✕ — spade into the floor; a dead hand bursts up under where you WERE (cracking earth marks it first). Move off.
- **TOLL THE DEAD** — rings the lantern; 2-3 skeletons climb out of the open graves (only while graves are open).
- **THE OPENING (player-made):** his dig aims at you. Stand beside an open grave and dodge late: the spade goes into the
  grave, the soft ground gives, he pitches to his knees - ~3 s, double damage. A miss on solid floor opens NOTHING
  (tools/boss-openings.mjs must prove it is caused).
- **PHASE 2 (<50%):** the bone walls shed rolling skulls (jump them); the lantern swings three times; every TOLL seals
  one open grave for good - fewer places to make the opening, so use them early.
- Rules: touching him never hurts (the touch rule); blockable = `!`, unblockable = red ✕ (marks.js rows); one clear answer
  per attack. New baker (not a recolour). Pilot >= 21 runs at normal health.

## Build order (one session, KICKOFF credit rules)
1. `tools/burial-rework.mjs` first (built + reach + page), added to check.mjs; retire/rewrite what pins the old shape
   (`tools/burial-route.mjs`, `burial-geometry.mjs`, `buried-dead` checks that use coordinates) in the same commit.
2. The descent geometry (numbers before/after). 3. Quest + ambushes + mix + movers. 4. The Warden (baker, one cropped
   screenshot, fight, opening, pilot). 5. ONE `npm run check`, commit, push, deploy, verify.
