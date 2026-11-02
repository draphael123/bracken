# HORNET'S NEST 2 ART - lane report (branch claude/hornetsnest2art, from claude/hornetsnest2 03e7aa31) 11-02

ART ONLY: no tuning, hitbox or telegraph change (drip tell 0.7 s, comb count 2 s / back 4 s, stun, fog numbers all untouched).

## BAKED / REDRAWN (all in the hive's own kit; no generic wood)
1. SAGGING COMBS (new src/redraw/hornets_nest_sag.js sagComb): whole = honey strings + beads under the lip and seams on the face; counting = the belly bows down (up to 9 px), the face warms amber -> red in the last second, wax drops pinch off, the count digits kept; down = a dashed ghost that fills with wax as the 4 s run out, seep sparks. main.js: the stone-grey crack overlay / dust / debris no longer draw on nest combs (honey-coloured trickle + a wax-and-honey burst + squelch on the fall).
2. HONEY DRIP: the string (knots + a gliding glint), a baked nub, the bead swelling on a thinning neck over 8 baked steps (the neck pinches in the last 12%, a flicker of glint), the neck snapping back at release, then the old glossy glob falling.
3. HONEY BEDS (sump + well, long wax runs on rows >= 44): glossy honey skin over the wax tiles, a sheen sliding across, bubbles that swell/ring/pop, short threads.
4. HONEY WALLS: the sump and the well get a capped-cell wall (capped / honey-filled / empty cells, honey-stained toward the bed), baked once per chamber (hiveWall in the backdrop). First draft cost ~20 fps on the phone run; baked, it is a blit.
5. SMOKE STAND empty / regrowing: a new bare tripod (scorched sticks, cord sling for the cradle, ash heap with live embers, a thread of smoke); embers flare as the pot comes back.
6. HALL FOG: the pot's BURST on her (white shock ring, flash, clay shards and ember specks over a cloud's first 0.4 s).
7. HORNET QUEEN: new POSE.grounded (face-down, legs splayed, wings sprawled and twitching, head dropped) + a skirt of fog creeping along the floor; the FOG FALL tumbles (roll about her middle, wings folded) with a fog column and wing dust streaming off her (fogfall fx).
8. L1 walk-out: nothing new to draw (as the build report said).

## SHOTS  scratch\lane-reports\hornetsnest2art-shots\before + \after (tools/hornetsnest2art-shots.mjs: sag-whole/-count1/-count2/-hot/-gone/-back, drip-wait/-s1..-s4/-fall; plus the earlier tool's gallery-in, well-bed/-in/-rungs, fog-hit/-fall/-grounded/-burst/-stand-empty/-stand-regrown)

## CHECKS
GREEN: hornets-nest 267 | hornetsnest-fog 15 | hornetsnest-perf (phone 4x: gallery 51.2, well rungs 46.8, well overhang 52.0; all >= 40) | skins | page console clean (shot tools: errors []) | boss sanity knight n=3 (human, flasks): 2/3 practiced, 1/2 built = in band.
RED / OWED: none from the art. Full suite not run (gate's).

## !! FINDING FOR THE TUNE LANE / DANIEL (gameplay, NOT changed here): THE SAGGING COMBS NEVER SAG
main.js only runs crumbleInit / updateCrumbles for levels with their own flag (FAIR, caravan, keepCrumbles, BCH, SKY ...). The nest's L.crumbles (the 3 gallery combs, kind 'comb', AND the falling nest's ledges) are never initialised (c.st undefined) and never stepped: standing on them does nothing. tools/hornets-nest.mjs only asserts they EXIST. So the gallery is easier than designed and the curve / pilot / mash numbers were all measured with inert combs. Fix is two lines (init on load next to line ~23854: `L.hornetsNest ||` in the `caravanCrumbles || kwoodCrumbles` condition; and `if (L.hornetsNest && L.crumbles && L.crumbles.length && state === 'play') updateCrumbles(dt);` beside the caravan call at ~23904) but it turns on untuned gameplay (and re-opens the restamp), so I did NOT make it: the tune lane should wire it and re-stamp. The sag art is ready and was verified by FORCING the crumble states in tools/hornetsnest2art-shots.mjs. A comb that is down also needs the hero not standing in it (crumbleStep handles that).

## NOTES FOR THE TUNE LANE
- Drip art reads the same 0.7 s tell: the bead is visibly swelling from ~0.1 s, neck thin at ~0.6 s.
- Grounded pose is lower (y +5) than the old dazed; her hurtbox is unchanged.
- hiveWall sprites: 800x704 + 544x192 GPU canvases (about 2.7 MB), baked on first draw in those chambers.

## QUESTIONS (rec first)
1. Wire the crumbles (above) in the tune lane and re-stamp? REC: yes, before ship.
2. The grounded / fall art is a sprite pose + fx, not a new hand-animated tumble. REC: ship; revisit only if playtests say it is hard to read.
