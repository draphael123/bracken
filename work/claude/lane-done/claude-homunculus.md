# claude/homunculus - THE HOMUNCULUS: shorter openings, B15 floor (Daniel 10-07, 10-08)

## What changed (src/main.js HOM table, homHurt, EHP; src/boss-greed.js chipBy)
- Opening (bare window): 3.0 s floor on every trick -> 2.0 s (flask 2.2 s); phase 2 2.0 s. Its purse per opening 0.20 -> 0.06 of his health.
  Bare pays x1.15 -> x1.6 (B15: openings 1.5-2x).
- Outside the window: x0.05 chip (jar x0.3 under it) -> x0.4 (HOM.jarTake, GREED.chipBy.homunculus 0.4) with a told clank:
  SFX.clank + sparks + "JAR TURNS IT" (once per 0.6 s). Smoke (hidden) still takes nothing - nothing is there.
- Health 600 -> 2400 (the bare x1.6 and the smaller purse made the 600 one a 25 s fight); trick gap after a window / a gloat
  2.4/2.2 s -> 1.85 s (phase 2 1.6 -> 1.2 s).
- docs/mash-bot.json: only the Homunculus mini row re-stamped (mash 0/6: dead in 33-37 s, boss left 91-98%).

## Numbers (BOT_PROFILE=human+dry, mini fight, campaign level, healthMode normal, 6 pinned seeds x knight/warden/pyro)
- BEFORE (refill health, so it could not lose): 18/18 wins, 19-41 s. All wins were 3-5 openings.
- AFTER: knight 4/6, warden 3/6, pyro 5/6 = 12/18 (67%); wins 52-119 s (median ~80 s). No hero below 3/6, mash 0/6.
  Slightly over the 50-60 band and under the 90-150 s band: the bot fills each window in a couple of hits, so the purse and
  health barely move the time; more length would need more windows to a player (grind) rather than more danger.
- The pilot used for this is not committed (the weakboss-pilot has no seeds / normal-health mode).

## QUESTIONS FOR DANIEL
1. Rate 67% vs 50-60 and 80 s vs 90-150: I stopped here (each further notch swung warden 1/6..5/6 - its dodge reads are the noisy hero). Want it harder (e.g. DMG x1.15)?
