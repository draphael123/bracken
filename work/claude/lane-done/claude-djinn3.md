# claude/djinn3 - THE DJINN, after Daniel played him (2026-10-04 evening)

Base: master 9c23c182 (DJINN2 live) + claude/weight 25fd7a87 (WEIGHT-T + HARNESSCARD). Merge conflicts: tools/check.mjs (union of both
lists), src/main.js (BKT keeps master's `lights` and weight's `setHeroLevel`), docs/mash-bot.json (the unburied rows kept from master:
they match the current unburied hash). Owned files only: Well Town, the Djinn, the bandit mystics' level, the new lesser djinn.

## What changed, per item

1. THE BINDING WORKS - longer and wetter (src/well-town.js:44-50, 319-360; src/well-town-hands.js:17-20, 60-70, 81, 106-112, 148-170, 254-260;
   src/redraw/welltown_props.js drawVent/drawPool). 94 -> 134 columns (+43%): THE STEAM WORKS (578-617) between the sluice and the conduit:
   - TEACH: two flame vents on a 3.6 s rhythm, out of turn - a told GLOW (0.8 s) then a JET (1.1 s, 10 a tick + a shove); a sign at the point
     of use ("FLAME VENTS. POUR ON ONE TO CAP IT."); a POUR caps a vent for 5 s; a bandit-mystic caster at the corridor's end.
   - THE FLOODED TROUGH: standing water (drawn), two STEAM vents under it (bubbles tell, then a scalding column; nothing caps a vent under water:
     time it).
   - THE BELLOWS: a low tunnel (stone over it), one vent on its rhythm, then THE BELLOWS VENT that never stops - lit, its cells are a wall of
     fire; a pour caps it (the cells open) and it never relights on top of anyone. The steam works' one REQUIRED pour.
   - A drip-spring at the sluice's foot fills the skin first. Seals/cracks/tremors carried through. The conduit, seal hall, his hall, the exit
     moved 40 east (W 664 -> 704); the checkpoint stays at his door (645); courtyard door (470) -> his door = 179 walked route tiles (>=90, <=200).
   - Glint + nudge: wt-bellows spot (glints until you are past it), wt-sluice / wt-seal-door moved (src/stuck-spots.js:15-17).
2. THE LESSER DJINN (src/lesser-djinn.js, src/lesser-djinn-hands.js, src/redraw/lesser_djinn_art.js; main.js 4440-4441 cards, 6198 take,
   23082 step, 23483 hands; well-town.js 307/314/333/348). SAND SPIRITS (the well's foot, the sluice): a blade passes through; POUR -> MUD on
   the floor, cut it; it dries and whirls up again after 5 s. FIRE SPIRITS (the bellows tunnel, the seal hall): fire turns the blade; POUR ->
   DOUSED, cut it. ONE-NEW-FOE: they run THE WILL-O'-THE-WISP's AI (src/canal-foes.js stepWisp - the canal's wisp, itself the ember wisp's
   body and AI). The ember wisp (Burning Village) comes AFTER the Well Town on the gate chain, so it would have been a second new foe
   (tools/one-new-foe.mjs failed on it); the canal comes before. Own sprites (6 frames), corpses in their skin (DF2_CORPSE + LDJ_F.dead),
   bestiary cards, goblin-lint clean.
3. HARDER TO MISS, EASIER TO PUNISH (src/djinn.js:37): x1.9 -> x2.5, mud 2.5 -> 3.5 s, douse 3.2 -> 4.0, bail 4.2 -> 5.5. The per-opening cap
   stays 5.25% for a mud/douse (x2.5 over a longer window fills it far sooner; a full one is never a one-shot); a BAIL (two steps to earn) takes
   up to 7% (bailCap, src/djinn-hands.js:109). The 3 s ward kept.
4. THE WATER PHASE (src/djinn.js:63-78, 86, 251-252, 313-318, 346-410; djinn_art.js 120-130, 148-152, 185-205):
   - THE TIDE: low (8 s) -> THE SURGE told (1.6 s: a !! mark, a blinking foam line where it will reach, bubbles, a roar) -> rises (1.4 s) OVER
     THE LEDGES -> high (5 s: the floor DEEP, 4 a tick; a ledge under it pays the flood's tick) -> ebbs (1.6 s, told once). A bail at high water
     takes the well down with it (it ebbs, you wade in).
   - HE STRIKES UP FROM BELOW (new P3 move 'upsurge', !!): bubbles boil under you - your ledge or the floor - 0.9 s, his fist bursts up and RESTS
     there 1.4 s (his hand: strike it).
   - THE COLUMN ROAMS between blows (toward you for the spout/upsurge/slam, to the shaft for the wave, the whirlpool and HIS DRAW - a new 2.2 s
     'well' beat under the shaft's light, once a cycle).
   - THE BAIL IS TWO STEPS: the bucket lies down in the flood - strike the windlass/crank to WIND it up (1.5 s, told), strike again to DROP it;
     it bails him only if he is UNDER THE SHAFT when it lands (a miss is told; the shaft's light brightens on him when he is).
   - No soft-lock (the bucket never sticks, he goes under the shaft every cycle), no untold death (surge told, deep water told on first tick).
5. SPEED: checked, not slowed - every P1/P2 tell is >= 0.5 s (lash 0.5, blast 0.5, devil 0.7, spears 0.75, breath 0.8, pillars 1.0, fire devil
   0.8), gaps >= 0.5 s; the bot reads them at 0.25 s and the lash cost the knight/warden 0-4 a fight. A check holds it (tools/djinn.mjs).
6. THE TURNS (src/djinn.js:148, 184-200; djinn-hands.js:48; djinn_art.js:82-100; main.js 23464 ctx.banner -> ambushSay): P1->P2 the sand
   COLLAPSES into a heap (1.3 s) and RE-FORMS as fire (1.7 s); P2->P3 the fire HISSES to steam (1.4 s) and he RISES from the water (2.2 s).
   Each: a banner ("THE SAND CATCHES FIRE / DOUSE HIM WITH WATER", "THE FIRE HISSES OUT / HE TAKES THE WELL: IT RISES AND FALLS"), camera
   shake, and a breather - nothing hits you and nothing takes on him while he turns (no heat, no flood tick).

## Numbers (corrected harness, tools/djinn-rates.mjs, 20 seeds a hero)
THE DJINN: knight 9/20 (110 s), warden 4/20 (114 s), pyro 19/20 (114 s) = 32/60 = 53% (target 50-60, no hero at 0/N). Baseline on the
corrected harness before this lane (8 seeds): knight 4/8, warden 3/8, pyro 7/8 = 58%. Tuning path: cap 7% -> 83%; 5.5% -> 72%; 5% + deep 5 -> 17%;
5% / bail 8% -> 39%; final 5.25% / bail 7% / deep 4 / bail 5.5 s / draw 2.2 s / rope 1.5 s. Gang Leader mini (tools/harnesscard-rates.mjs welltown:mini --mode=new --seeds=20):
knight 17/20, warden 6/20, pyro 19/20 = 70% - in band, not retuned. Mash: boss 0/6, mini 0/6, level: every hero dies (docs/mash-bot.json).
Level-1 pilot: 39 blows, 5 deaths, walked 100% (docs/level1-pilot.json).

## Tools
tools/steam-works.mjs (new, in check.mjs): the length, the vents (rhythm told, cap, bellows wall), the spirits (blade passes, pour opens, cut)
in Node and in the page. tools/djinn.mjs 80 checks (the turns, the tide, the blow from below, the roaming column, the two-step bail). tools/
boss-openings.mjs (the bail found through the two steps; openings >= 3.3/3.8/3.8 s). tools/corpses.mjs opens a lesser djinn before its blow.
tools/djinn3-shots.mjs (pictures, not in the suite).

## Questions (recommended answer first)
1. The per-hero spread on the Djinn is wide (pyro 95%, knight 45%, warden 20%) - and the warden is low on the Gang Leader too (6/20). Rec: a small bot lane on the warden (and the knight's P3 bail rate, 2.3-2.8 bails a fight vs the pyro's 3.2-3.3) before any hero-specific number; Daniel's playtest decides whether the Djinn is now right for a human.
2. Steam vents under the trough cannot be capped (timing only). Rec: keep - one verb, one exception taught by bubbles. Alt: let a pour cap them too.
3. At high tide nothing in the hall is dry (ledges pay the flood tick, the floor the deep tick). Rec: keep (the flood works against you). Alt: two high perches over the ledges.
4. The lesser djinn run on the canal's will-o'-the-wisp AI, not the ember wisp (later on the gate chain). Rec: keep.
5. Daniel's playtest gate: the reworked Djinn ships only after he plays it.
