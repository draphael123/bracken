# claude/glasssea - THE GLASS SEA + THE GLASS COLOSSUS, the Opus greybox (2026-10-06, overnight)

Base: master 85e13368 (batch71). Brief: the overnight glass-sea brief (scratch, written WITHOUT Daniel's concept interview - every RECOMMENDED option is
built, the open choices are listed below as built). House rules: the design standard (A1-A12, B1-B13). Greybox art only (no art pass before Daniel
approves the concept).

## What it is
Desert arc level 4, `glasssea`, THE GLASS SEA, `needs: 'redgorge'` (APPENDED to LEVELS; map node at (60,130) on the desert sheet after THE RED GORGE).
Welltown's `needs` was already 'caravan' (the stale link the brief names is fixed on master). The fork to THE SUN TEMPLE is a sealed door + sign at the
obelisk ("THE SUN TEMPLE. THE WAY IS SHUT."): 4b is built later.

THE RULE (the LEVELS rule line, asserted equal to the code's header): "TURN THE MIRRORS TO AIM THE SUN; SHADE BY DAY, FIRE BY NIGHT."
- THE VERB is TURN (E at a mirror; three told notches: TO THE SKY / one way / the other, a dial under the glass and a callout naming where it now throws).
  A mirror catches its source - the sun overhead, the low SUNSET RAY at the obelisk, a CAMPFIRE under a polished hood, or THE COLOSSUS's GAZE down its
  steps - and throws it as a DRAWN beam (src/light.js whole-tile trace, 90-degree turns) ending in a TARGET RING.
- A DAY beam (sun / sunset / gaze) on a SAND HEAP fuses its bed to glass from the near end (the beam walking across, ~1.2 s); turned away, it crumbles.
  A day beam DAZZLES a glass scorpion. A FIRE beam on a crack's ring HOLDS its swarm (a crack near a campfire is held anyway); an unheld night crack BOILS
  (the swarm stands five rows over it: a push and a blow - no crossing) and spews skitters.
- THE BACKDROP: the sun sets at THE FORK OBELISK (L.sunsetX = 334). West of it SUNSTROKE (the caravan's src/sunstroke.js, shade is life); east of it THE
  COLD: a frost meter in the sun meter's place (fill 6 s like the sun's, ticks 3/5/8), cooled by firelight. Sky gold -> violet -> night blue; the night's
  dark has a hole at every fire and along every fire beam.
- THE SLICK GLASS: a slide down any glass slope runs faster (src/glass-sea-hands.js slide: +300 px/s/s, 1.3x the hill's top speed).

## The level (src/glass-sea.js, 648 columns, route 630 tiles)
1. THE GLASS EDGE (0-95) TEACH: the first screen is a slick gentle slope down into a skiff's shade; THE FIRST MIRROR fuses the stair up a 5-row dune cliff
   (REQUIRED, no risk); a spire overhang, a vulture, a glass scorpion, a sentinel.
2. THE FULGURITE FIELD (96-195): an optional mirror fuses a stair to a spire's ledge (a silver + shard one); a glass scorpion in its beam row (dazzle,
   taught); THE SLIDE GAP (REQUIRED): measured, every one of the 7 heroes FALLS IN with a plain run jump and CLEARS it with the slide (hold down) + leap.
3. THE BONE CROSSING (196-295) SET PIECE ONE, THE SUN-MIRROR BRIDGE (REQUIRED, a 12-wide crack): two glass sentinels guard the mirror, a thrower on the
   terrace behind you, two on the far lip, vultures whose shadow is the only shade on the bridge; shard two in a skiff.
4. THE FORK OBELISK (296-359) REMIX, THE TWO-MIRROR CHAIN (REQUIRED - the one the brief names): the low sunset ray -> mirror A (up) -> mirror B on the
   board shelf (east) -> through the obelisk's EYE -> onto the heap set in the giant's cheek: the bridge over THE SUNKEN HEAD's gap fuses. Either mirror
   alone reaches nothing (asserted). The sun goes down here.
5. THE SUNKEN HEAD (360-399) SET PIECE TWO, THE CLIMB: the cheek, three holds glinting in turn (the glow marks the holds), the ear (shard three), the
   crown (a fire, a night hunter); then a long steep slick slide down the back of the skull into the night.
6. THE COLD FLATS (400-571) REMIX (night): fires and held cracks; a hunting pack with skitters in the dark between two fires; THE DARK CUT (REQUIRED relay):
   a crack boils across a cut through a glass ridge with no fire in it - turn the hood mirror over the fire and the firelight runs down the cut onto
   its ring (held, and the cut is warm; the two hunters in it freeze); shard four on a shelf, shard five past the boiling crack.
7. THE COLOSSUS STEPS (572-603) EXAM: three steep slick steps, a hunter, THE GAZE (bend the Colossus's own eye-light down onto the heap: the bridge fuses)
   AND THE RELAY (the steps' fire onto the crack's ring: the swarm held) - both or no crossing - under two throwers and a scorpion; the gaze mirror's
   third notch is stuck until you carry FIVE GLASS SHARDS: then it fuses THE VAULT STAIR to THE SILVER VAULT (a silver, no relic).
Checkpoints: start, 165, 300, 446, 600 (one per 158 route tiles; none closer than 90). Silvers: 3 (spire ledge, flats' shelf, the vault).
Glass terraces (a high road over the low one) and low glass dunes (the post-pass) keep every stretch from being long level ground.

The cast (no type over ~35%; roles melee / ranged / heavy / runner): GLASS SCORPION (scorpion + cnSkin: a day beam dazzles it, it shatters into a shard
patch), SHARD THROWER (slinger + cnSkin, THE RANGED ONE: placed where you turn a mirror or cross; its shard cuts as a gorge stone, 14), NIGHT HUNTER
(cutthroat + cnSkin: freezes in firelight), GLASS SENTINEL (the shield guard's AI + cnSkin: front guard, go round), VULTURE, and the ONE NEW FOE: THE
SKITTER (src/glass-foes.js, the crack swarm: runs and nips, a told '!' a shield turns; will not step into firelight). No living goblins (goblin-lint).

## THE GLASS COLOSSUS (src/glass-colossus.js pure + bot plan; src/glass-colossus-hands.js world + greybox drawing)
A PUZZLE BOSS (B11): a giant of lightning-glass rooted on its steps; you climb its holds (one-way glass ledges at its knees, hips and shoulders).
B10 read: OPEN = a gold ring on the weak point + a timer bar; WARDED = a pale shell + the word; every turned blow clanks and says why (SHUT / GLAZED /
WARDED / HIGHER / LOWER). B13: its KNEE CRACKS take a hero's blow whole from a purse per phase (15% / 9% / 7%), then GLAZE (told) until the next phase.
- P1 DUSK: SUN LANCE (!!: a line along the ground to where it ends, its end marked "THE MIRROR" when a facing mirror will take it - jump it, stand on a
  hold, or get behind a mirror), STOMP (!!: a shard ring running out both ways - jump it), SHARD RAIN (!: marks, a 1.0 s tell - block or step off).
  OPENING: bait the lance into a shelf-mirror FACING it -> its chest CRACKS (5.2 s): climb to the hip holds and strike. NEW MOVE: THE SHAKE (told HOLD!,
  the holds flash): a climber who does not hold DOWN is thrown off (a blow and the floor, never a death).
- P2 NIGHT (55%): no lance; THE SWARM CALL (new): skitters pour from the crack under it unless a shelf-mirror is turned TO THE FIRE - the edge campfire's
  light is laid along the floor onto the crack (skitters will not step into it) -> its SHOULDERS BLAZE (5.6 s): climb and strike or PLUNGE (x2.4).
- P3 DAWN (25%): the lance returns (the chest again); NEW: a mirror TO THE SKY throws the dawn on its CROWN -> DAZZLED (5.4 s). DESPERATION: THE SHARD
  WAVE (!!, jump it).
- B3: every opening ends in a told 3 s ward, then it KNOCKS THE MIRROR that opened it back to FACING (each opening wants a fresh TURN); B12: no lance and no
  swarm for 1.5 s after a ward; B4: open, it stands still. An opening pays x2, at most 9% of it per opening. Boss-greed: OPEN_RULE colossus = colOpen;
  OWN_WARD (its legs' purse and its shut cracks are its own number; greed still counted).
- Theme: 'colossus' composed in code (src/boss-music.js: B minor glass chimes over a drone; :p2 the cold sub pulse; :p3 rising brass, doubled pulse).
  Level bed: 'glasssea' (composed-in-code greybox bed until Daniel picks a track).

## Numbers
- THE GLASS COLOSSUS, human bot at CAMPAIGN level (tools/harnesscard-rates.mjs glasssea --mode=new, L33, BKT.setHeroLevel, no skills), FINAL setting
  (hp 2000 = about 2950 on the bar at its tier, lance 56, stomp 22, shards 16, shake 16, wave 29, cap 9%): knight 3/3, WARDEN 1/3, pyro 3/3 = 7/9 = 78% - ABOVE THE BAND,
  no hero at 0. Fights 80-108 s. The 20-seed cap per hero is spent (I stopped there). The settings passed through: 100% (hp 1500); 9/9 at hp 2100;
  knight 3/3 warden 0/3 pyro 3/3 at x1.25 damage. The spread is the hero: the warden takes every '!' the knight's shield turns, and her spear deals
  about half the knight's per opening (the bot stands her at her tip, WARDEN_TIP, as the house plans do).
- Mash bot (tools/mash-bot.mjs, stamped LEVEL then BOSS, L33): boss 0/6 (dead 67-80 s, the Colossus keeps 82-90%); level lowest health knight 37%,
  warden 34%, pyro 34% (it cannot turn a mirror: lifted over every crack; what it walks through is the crossing's guards and throwers, the night's
  pack, the cold, the sun). The margins are thin (one run read knight 46%): the level-mash numbers moved a lot with one foe added or taken away.
- Level-1 pilot (tools/level1-pilot.mjs --write, knight, 3 runs): 45 hits taken, 0 deaths, 95 lifts (it cannot turn mirrors either).
- Route pilot (tools/glasssea-route.mjs, real keys, god + no foes = base movement): ALL 7 heroes walk the whole route, 0 lifts.
- The slide gap: all 7 heroes fall in with a run jump and clear it with the slide (measured).
- level-quality glasssea: CLEARS THE BAR (flat / ground / bands / mechanics (gsmirror, gscampfire, gsheap, gscrack, colmirror) / music / secrets /
  checks one per 158 route tiles / 1.7 encounters a screen / slopes drawn / ranged / roles 4 / unlocks / pilot / mash / route); GATE += glasssea.

## Checks run
glasssea (new, 69 asserts, in check.mjs), level-quality (all gated), mash-gate, boss-greed, boss-openings, boss-fight-end, boss-music, audio-assets,
desert-foes2, corpses, goblin-lint, one-new-foe (glasssea = [skitter]), threat-holes, sprinkle-cap, answer-tags, hint-shown, stuck (static + runtime),
checkpoints, architecture, skins, npc-removal, slopes-trace (unchanged; glasssea is not in its trace list, no rebase), map-grammar, map-spacing,
dangling-paths, homepaths, comments, signs. Route pilot (all 7 heroes, base movement) and the slide-gap probe.
RED, NOT MINE: tells - updateScalder ladleTell wants ! (red on the base sha 85e13368 too, checked in a throwaway worktree; tells --write reflowed
src/marks.js MARK as the tool does - only the Colossus and skitter rows changed in value, checked key by key).
HOUSEKEEPING: the C: drive had 300 MB free mid-lane (hundreds of abandoned bracken-look browser profiles in the temp folder): I ran the repo's own
tools/profile-sweep.mjs (idle >= 30 min, no live process) - about 4 GB back.

## UNVERIFIED
- No Daniel playtest (THE GLASS COLOSSUS's gate). No human eye on the greybox art beyond my own frame grabs.
- Night hunters freeze in firelight and glass scorpions are dazzled by a beam (src/glass-sea-hands.js hold, through main.js updateDesertFoe); the glass
  sentinel's dazzle (a beam on its back) is NOT built (it goes round / plunge, as the shield guard does).
- The route pilot was run god + no foes (base movement); a level-1 careless-hand run with every foe was not part of this pass.

## OPEN DESIGN CHOICES, AS BUILT (the brief's list; each the RECOMMENDED option, easy to change)
1. THE RULE'S VERB: (a) built - TURN mirrors (sun by day, relayed firelight by night). The notches live in L.mirrors[].notches; sources in L.sources.
2. THE NEW FOE: (a) built - the crack swarm's SKITTER (src/glass-foes.js). one-new-foe pins glasssea to ['skitter'].
3. THE CLIMB DEPTH: (a) built - knees always hittable (a purse per phase) + climb for chest / shoulders / crown, three phases (dusk / night / dawn).
4. HOW THE CLIMB IS CONTROLLED: (a) built - one-way glass holds (the house's ledge climb) + the told SHAKE; the grip is HOLD DOWN (the brief said
   down+interact: down alone is the grip here - E turns the shelf-mirrors in the same fight).
5. THE BONE CROSSING MINI: (a) built - cut; the crossing is a fight during the rule.
6. THE LEVEL MUSIC: synth bed 'glasssea' for the greybox; the pick is Daniel's (below).
7. THE SUN TEMPLE FORK: (a) built - a shut door and a sign at the obelisk (4b later).
Also as built (my calls, all small): the arena floor is plain glass, not slick (it fought the read); the STOMP is !! (jump it), not ! (the brief's word
was "jump the ring"); the cold fills in 6 s, the sun meter's own number.

## QUESTIONS FOR DANIEL (recommendation first; the recommendation is what is built)
1. THE COLOSSUS IS EASY FOR THE KNIGHT AND THE PYRO (3/3 each), HARD FOR THE WARDEN (1/3): 78% overall. Rec: a small bot/hero lane on the warden
   against '!' blows first (the Queen and the Matriarch show the same spread), then lift its damage ~x1.15 for ~55%; your playtest decides.
   Alt: lift its damage now (the warden would fall to 0).
2. THE STOMP as !! (unblockable, jump the ring) - the brief wrote '!'. Rec: keep (the ring runs along the ground; a shield answer made the knight immune).
3. THE GRIP is hold DOWN (not down+E). Rec: keep.
4. CHECKPOINTS: four after the start (165, 300, 446, 600). Rec: keep (the brief's ~6 would put two under 90 route tiles apart).
5. Level music - three candidates (licence to be re-read on each page, NOTHING downloaded): (REC) "Eastern Arctic Dubstep" - VishwaJai, CC0,
   https://opengameart.org/node/97673; "Night in the Desert Remixed (Tausdei vs Hitctrl)" - glitchart, CC-BY 3.0,
   https://opengameart.org/content/night-in-the-desert-remixed-tausdei-vs-hitctrl; "Ibn Al-Noor" - Kevin MacLeod, CC BY 4.0,
   https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100706.
6. THE SENTINEL'S DAZZLE is not built (the shield guard's AI has no hold hook). Rec: leave it (go round / plunge) unless the reviewer wants the beam on
   its back.

## FIX PASS (2026-10-06, after scratch/review-glasssea.md; Daniel approved the concept with every recommended option)
First I merged origin/claude/bot2 (the calibrated standard bot). There was one conflict, in tools/check.mjs's list; I kept both sides (glasssea + playrec). The boss
standard is now `PORT=8669 node tools/boss-rates.mjs glasssea --ways=practiced --profile=human` (campaign level L33, normal health, no skills).

### MUST-FIX
1. THE WARDEN vs THE SHARD RAIN, then the band. I followed the reviewer's order, then went one step further because I found a bot gap:
   - shardSpread 44 -> 60. This leaves a 42 px lane between the marks (asserted in tools/glasssea.mjs). Re-measured over 3 seeds: knight 3/3, warden 2/3, pyro 3/3.
   - stomp 22 -> 28: knight 6/6, warden 3/6, pyro 6/6 = 83%. A damage-by-source probe (it reads S.hurt; the probe lives in my scratchpad) showed that THE STOMP caused
     all of the knight's losses. The bot ignored the stomp's TELL. It answered only the running ring, and the ring starts 30 px from the giant's feet,
     exactly where a melee hero stands to cut its knees. A player reads the 0.85 s '!!' tell, so I made the bot read it too (src/glass-colossus.js colPlan: once it
     has seen a stomp tell, it jumps each ring as the ring arrives; it misses one tell in eight). With that fix the fight measured 93% (9/10, 9/10, 10/10).
     The bot had been losing to its own gap, not to the boss.
   - Then I tuned TEMPO rather than scaling damage:
     - idle gaps 0.9/0.8/0.7 -> 0.65/0.55/0.45
     - the night chain is two stomps longer (swarm, stomp, shards, stomp, swarm, shards, stomp)
     - stomp 34 (unblockable, so it hits everyone)
     - rain 16 -> 20 over the widened lane (the knight blocks it; the warden and the pyro step out of it)
     The opening cap stays at 9% and hp at 2000.
   - FINAL (boss-rates, practiced, human, L33, 10 seeds a hero): knight 5/10, warden 4/10, pyro 9/10 = 60%. That is IN BAND, with no hero at 0. Fights ran 81-194 s
     (most 85-140 s, inside the B6 window). Mash boss 0/6 (dead in 44-75 s; the Colossus keeps 83-91%).
   - Settings tried, each a full 3-hero sweep:
     - 89% (spread 60)
     - 83% (stomp 28)
     - 78% and 61% (stomp 34; noisy)
     - 33% (gaps 0.6 + shake 22 + ring speed 280): too far, reverted
     - 78% (gaps 0.75)
     - 63% (gaps 0.7, then 0.65)
     - 63% (rain 18)
     - 60% (rain 20)
2. THE NIGHT AMBIENT is now the Glass Sea's own. I added two synth beds in src/audio.js SYNTH_BEDS:
   - glassday: dry wind over glass dunes, a thin whistle over the fulgurite, a shard chiming, sand hissing.
   - glassnight: a hushed low wind, glass ticking as it cools, a far glass chime, a low moan through the ridges. No drips, no chains.
   AMBIENT_NAMES and AMBIENT_SOURCES list both. L.ambient plays glassday west of the obelisk and glassnight east of it. Asserted (no 'cistern').
   The art pass may replace them with a composed bed; the music track is still Daniel's pick.
3. THE SLIDE GAP: the stall nudge now reads "THE SLICK SLOPE: HOLD DOWN TO SLIDE, THEN JUMP AT THE FOOT" (asserted: it contains HOLD DOWN and SLIDE).
   The sign moved from column 130 to the crest (135), where the slick run starts.

### SHOULD-FIX (the cheap ones)
4. First screen: I moved the skiff before the mirror from 35 to 37. Its shade (35-39) now covers the hero at the first mirror, so the first TURN happens out of
   the sun. The scorpion stays at 31. I tried two other places, past the stair at 77 and in the first shade at 25. Both cost the level's mash margin
   (warden 40% and 46%, a fail). The scorpion takes about 10 s to walk up, and the turn takes 2 s.
5. (not done) The Crossing's "don't turn it back while you cross" line is left as built (the crumble line exists).
6. ARENA STALL NUDGE: if no mirror sits on a notch that can open the giant this phase for 10 s, a line shows and repeats every 10 s:
   - "TURN A MIRROR BACK TO FACE THE GIANT"
   - "TURN A MIRROR TO THE FIRE: ITS LIGHT HOLDS THE SWARM"
   - "TURN A MIRROR TO THE SKY, OR TO FACE ITS LANCE"
   The lines are routed in src/hint-lines.js, and a check asserts that the nudge repeats.
7. THE STEPS' PERCH: a one-way glass step at 583-584 (row 29) turns the one 3-row hop into two 2-row hops. The route pilot (real keys, god, no foes):
   knight, warden and pyro all walk the whole route again, 0 deaths, 0 lifts.
8. THE CURVE ROW: I added glasssea to the desert act in src/foe-react.js ACTS. In game its depth already placed it in act 5, but level-quality read it as act 1.
   node tools/level1-pilot.mjs glasssea --curve: act 5, 254% health lost a run, 3 deaths in 3 runs (band 150-700%, 2-12 deaths): IN BAND.
9. MASH MARGIN: NOT WIDENED.
   - The level lows are 37 / 34 / 34% again (re-stamped LEVEL, then BOSS).
   - I traced the warden's and the pyro's health along the route with a throwaway copy of the mash bot, since deleted. The lows come from the places where the
     masher is HELD (the Crossing's lip, the skull's foot): sun and cold while he is held, then a lift. They do not come from foes.
   - I tried five extra foes, one at a time: a third far-lip thrower, a spire thrower, a second near-terrace thrower, a third Crossing scorpion, and a hunter at
     the skull's foot. None of them changed the trace at all.
   - The same build read pyro 45% on one run and 34% on the next, so the row is noisy by about 10 points.
   - Kept: one extra hunter at the skull's foot (434). It adds night pressure for a person and does not change the row.
   - A masher cannot turn the first mirror, so he cannot finish the level at all.
10. FIGHT LENGTH: now 81-194 s (it was 78-108 s).

### LEGS (the brief said always full damage; what is built is a purse per phase)
I kept the purse. B13 asks that no immunity be a waiting room. A glazed knee is never something you wait out here:
- The opening is always a thing you DO, and it is never more than one move away.
- P1 and P3 open on the lance (chain slots 0 and 3). P2 opens on the swarm call (slots 0 and 4). P3 can also open on a mirror turned TO THE SKY at any moment.
- The bot spends only 220-560 of the 620 hp in the purse, so in practice the knees take whole blows for most of the fight.
This is asked below.

### CHECKS (this pass)
- glasssea: 75 asserts, 6 new (own beds, slide nudge + sign, rain lane, the stall nudge).
- level-quality: every gated level clears; glasssea clears, curve included.
- stuck --static (785 checks), mash-gate, curve-gate, hint-shown (page), signs, ambient-landmarks, audio-assets.
- boss-openings, boss-greed, boss-fight-end, boss-music, boss-jump.
- one-new-foe, goblin-lint, sprinkle-cap, desert-foes2, threat-holes, answer-tags, combat-part2, rule-openings, checkpoints, map-grammar.
- The route pilot (3 heroes, base movement).
- Not run: the 40-minute suite, stuck runtime.

### QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. THE COLOSSUS is 60% overall, but the PYRO wins 9/10 (knight 5, warden 4). She dodges the rain and the stomps from range, and her level card takes about 20% less
   from each blow. Rec: keep (overall in band, no hero at 0) and let your playtest decide. Alt: a pyro-only answer (a move that reaches range).
2. Fixing the bot's stomp-tell gap moved the fight 15-30 points easier before the retune. Rec: keep (a player reads the '!!' tell). Other boss plans may have the
   same kind of gap (the bot answers a hazard only once it runs, not from its tell); worth a bot2 look.
3. LEGS: keep the glazing purse (rec), or make the knees always take full damage? If the knees always take full damage, the opening cap must drop so the legs
   are not the whole fight.
4. MASH LEVEL ROW: 34-37% against the 40% limit. It is noisy by about 10 points and is driven by the sun and cold at the held/lift points, not by foes.
   Rec: accept it as is (a masher cannot turn the first mirror). Alt: make the cold one point heavier (risk: the careless hand already takes 31-63 cold ticks).
5. The tempo retune (gaps 0.65/0.55/0.45, two more night stomps) made the fight busier rather than deadlier per blow. Rec: keep, and tell me if it feels frantic.

# ART PASS (claude/glasssea, Sonnet, 2026-10-06) - the Glass Sea's own look, its set, its sky, and THE GLASS COLOSSUS
Art and music only: no geometry, route, foe, rule or number moved. The one level-data edit is `shadeArt` (main.js's flat violet tint is off; the art paints the same shade boxes soft-edged). Base b6b055c2. Stills: docs/glasssea-art (before-*, the after set, cast-sheet.png, colossus-sheet.png, set-sheet.png). Tools: tools/glasssea-art-shots.mjs (page), tools/glasssea-art-sheet.mjs (Node), tools/glasssea-art-cost.mjs (frame cost), tools/glasssea-aloft.mjs (Node check, in check.mjs).

## What I found first
THE GREYBOX SKY NEVER RAN. `GSH.drawBack` was called from inside main.js's `if (L.dark)` branch and the level is not dark, so the Glass Sea has been showing the caravan's stock dusk sky (L.duskStart -1 = always dusk) and its stock far mesas, plus fireflies, crickets and green leaves. The review's "sky is strong" was the stock sky. The hook now runs first (`if (L.glasssea && GSH.on()) GSH.drawBack`), the leaves are glass flakes, and the glass sea has no fireflies or crickets.

## MUSIC (Daniel's pick, the coordinator's download)
- audio/glasssea.ogg = "Eastern Arctic Dubstep" by VishwaJai, credited "Vishwa Jay" (CC0, https://opengameart.org/node/97673): THE GLASS SEA's level track. Credited the 'Ossuary 6 - Air' way: audio/CREDITS.txt, MUSIC_CREDITS (the full line), MUSIC_CREDITS_ROW (the Sound Test row is `"Arctic Dubstep" - Vishwa Jay`: the full title truncated the row and textfit caught it) and src/credits.js (a CC_BY-format entry with its own four lines; CC0 asks for none, Daniel does). 'glasssea' is in MUSIC_NAMES; tools/audio-assets.mjs no longer lists it as no-file-by-design.
- The greybox's synth level bed 'glasssea' is deleted from src/boss-music.js (nothing plays it now). THE GLASS COLOSSUS keeps 'colossus' (composed in code, three phases, untouched).
- The glassday / glassnight ambient beds stay UNDER the track (wind, shard chimes, hush: no drums), a notch quieter (0.24 -> 0.20, 0.26 -> 0.22) so the track leads. Not heard by me (no audio device): worth one listen.

## What changed
- THE KIT (src/redraw/glasssea_tiles.js, hooked in main.js's tile pass ahead of the caravan's sand skin): lightning-fused glass. A white-hot lit skin, a mint-to-teal body that goes to near-black obsidian with depth, slanting refraction streaks, trapped bubbles and violet fulgurite veins (all laid by WORLD position so they run on from tile to tile), a lit rim on cliff faces, glass icicles under an undercut. THREE GLASSES: sea-green (the edge and the field), CLEAR cyan-ice (the Bone Crossing's reach), violet-blue with cyan lightning (the cold flats, past the sunset), blended over six columns at each seam. THE SLICK SLOPES are their own diagonals (src/redraw/slopes.js baked with the glass palette: a hard specular edge, a lit and a shaded face). SHELVES (the one-way ledges) are polished slabs with chipped ends and a glass drip: no planks anywhere. The first 12 columns stay the caravan's SAND, and the sand heaps the beams land on are sand, so sand and glass read apart. THE FORK OBELISK is carved sandstone (a band of old script every few rows, a pale capstone, a gold-tipped pyramid on top); THE SUNKEN HEAD's mass is black polished obsidian with violet veins.
- THE SKY AND LIGHT (src/redraw/glasssea_art.js): a bleached blue day with a white sun and wisps -> the sun slides down the west to the glass horizon, violet dusk -> night with stars, a cold moon and an aurora over the sea. The hour is the camera's column, eased in the arena (dusk, night, dawn come over a second or two; a walk or a respawn is simply the hour it is). A dusk grade (amber, then a cold blue wash). THE HORIZON: two far dune layers, a mirage shimmer, THE COLOSSUS's silhouette that grows as the road goes (one flat colour per hour, eyes alight at night; it is NOT drawn in the arena, where the real one stands) and the BONE CROSSING's leviathan ribcage half sunk in the far glass.
- THE RULE: MIRRORS are a bronze hood on a post (a tripod over a fire for a relay) with a polished disc by its notch (flat to the sky = an eye-shaped disc, '/' and '\' = a slanted strip) and a brass dial of three studs (the lit one is where it throws; the stuck one is dark red with a keyhole). BEAMS: a warm halo, a saturated edge (so it reads on the pale day sky), a pale middle, a white-hot core, motes running down it; the sunset ray orange, fire amber, the gaze cyan. TARGET RINGS are crisp pixel rings (searching: a pulsing ring and four ticks; locked on: a double ring, a bloom, a white heart). HEAPS are a pile of pale sand, white-hot and sparking while a beam is on one. A bed that is still sand shows the GHOST of the glass it will be (dotted, faint, brighter while a beam is on its heap). FUSED GLASS is the polished slab, scorched white at the leading edge while the beam walks it, and it stands on its own posts (an ARCH under a long span).
- CRACKS: a dark fissure with strata and broken teeth. HELD by firelight = the whole fissure glows amber, a warm sheen on the lip, the swarm curled asleep far down; BOILING = violet glow, a roiling haze, the swarm standing up out of it (shells, red eyes), sparks off the lip; a night crack far from you is a faint teal.
- CAMPFIRES: a pit ringed with glass lumps, BLEACHED BONES laid crossed (no logs), a three-layer flame, sparks, and a pool of warm light on the glass; the night's dark has a pool at every fire and every fire beam.
- THE SET (src/redraw/glasssea_props.js bakes and plans, glasssea_set.js draws): BONE SKIFFS (a hide awning on a bone mast over a rib hull, glass shards set in the hide, a horned skull at the bow; the odd ones are WRECKS, half the hide gone, the mast snapped), FULGURITE SPIRES (a twisted glass tube with a violet lightning core; the hoodoos' flared tops are the shade), fused ridges with a crest of glass spikes, THE DARK CUT (a colonnade of fused ribs under the ridge, cold and dark), THE FORK OBELISK (capstone, a carved eye bezel, the slit filled by a glass lens with a gold iris so the upper block rests on it, plinth piers), THE SEALED SUN TEMPLE stub (a half-buried facade, the sun-disc door melted shut under a plug of glass, a chain across it; the sign 'THE WAY IS SHUT' stands on it), THE SUNKEN HEAD (a carved face over the wall: heavy brow, a closed eye with a breathing amber gleam, cheek lines, lips, a diadem of gold studs; the ear alcove framed; the nose-ridge, cheek and brow holds GLOW in turn), and the DRESSING: 51 props by section (sand drifts on the glass, shard clusters, fulgurite stumps, bones, a skull, the leviathan's ribs, hide pennants, shard chimes, frost-rimed crystals past the sunset).
- THE CAST (src/redraw/glasssea_foes.js): the GLASS SCORPION is desert_glass.js's own pale glass scorpion (the scorpion's frame table); the SHARD THROWER is the slinger in sea-green rags with a teal headscarf and a glittering pouch; the NIGHT HUNTER is the cutthroat gone frost-blue with a bone-white mask, cyan eyes and a green glass blade; the GLASS SENTINEL is the shield guard in black obsidian plate behind a great green glass shield; THE SKITTER has a violet-black shell, a spiked crystal back, six legs and red eyes (14 x 10, 5 frames). Exact-colour remaps of each machine's own sheet, so every pose, tell and hit box is the machine's.
- THE GLASS COLOSSUS (src/redraw/glass_colossus_art.js; the hands keep the B10 read, untouched): a glass golem baked in three palettes (DUSK sea-green with a sun-warmed rim, NIGHT deep blue with cyan veins, DAWN pale rose), 216 x 224: broad splayed feet, thick legs with a knee knob each, a pelvis, an hourglass torso, great faceted pauldrons, arms hanging outside the legs to fists planted in the glass, a heavy brow, slit eyes, a diadem of glass spikes; lit from the upper left, every edge bevelled. ITS CRACKS are the read language, live each frame: the KNEES gold while the leg purse lasts, a pale glazed seam once it is spent; the CHEST CORE (a prism window) gathers white light before the lance and opens as a gold wound when cracked; the SHOULDER CRACKS go violet at night and blaze cyan-white when open; the CROWN GEM burns white when dazzled. THE HOLDS are crystal slabs with a lit tooth on the free end, glowing, flashing gold at the shake's tell; the shelf-mirrors are bronze hoods with a notch dial; the relayed firelight and the dawn's beam are drawn as beams; the gaze shows as a cyan ray from its eyes to the wall.
- AMBIENT: no crickets, no fireflies, green leaves -> glass flakes, glass underfoot rings as stone (the shelves used to ring as planks: main.js surface()).
- NOTHING FLOATS: tools/glasssea-aloft.mjs (Node, in check.mjs): 31 one-way runs (the terraces, the Head's holds, every fused bed) each keyed or posted, every post lands, no two supports of a run more than 8 tiles apart, a span over 11 tiles held by an arch lip to lip (the two crack bridges), every ledge-landing chain reaching rock in <= 10 hops; the 7 hanging masses (four spire hoodoos, the Dark Cut's ridge, the obelisk's lower block and its upper block on the lens) held; 51 props each on a top and none on a sign, mirror, fire or checkpoint; the 6 Colossus holds each growing out of the body's silhouette; the glass kit on all 8498 glass cells, the sand edge kept sand.

## Identity re-score /18 (the review's greybox: 13)
KIT 2, PAL 2, PLAT 2, LMK 2, SET 2, DRESS 1, LIGHT 2, AMB 2, THEME 2 = 17/18 on my reading of the stills. I would not claim above 16 until someone plays it (DRESS 1: 51 props across 600 columns, the Crossing's ground is still mostly bare between its foes; AMB is the beds and the file, which I could not hear).

## Checks (PORT 8678, all green)
glasssea (75), glasssea-aloft (new), level-quality (glasssea clears: mash boss 0/6, level lows 37%, curve act 5 254% / 3 deaths), signs, hint-shown, audio-assets, boss-music, textfit credits + plates + soundtest (strict: 0 of everything), corpses, desert-foes2, comments, architecture, skins, one-new-foe, goblin-lint, ambient-landmarks, floaters, threat-holes, sprinkle-cap, answer-tags, render-layers, boss-openings, stuck --static (785). Frame cost (tools/glasssea-art-cost.mjs, a busy PC, ms per drawn frame): edge 3.3, field 2.9, crossing 3.2, obelisk 3.6, head 4.0, flats 3.2, cut 3.7, steps 3.9, arena 3.4; level load 442 ms.

## REDS / UNVERIFIED
- No human eye in play: stills only; no audio device (the track and the two beds are unheard).
- The far silhouette is a haze-tinted flat shape; the real Colossus is one baked pose per palette (the cracks and glows animate; no breathing or sway beyond the shake).
- The fused beds' ghost (the dotted outline of the glass to come) is information the greybox did not show; if it gives away the two-mirror chain, remove that block in src/glass-sea-hands.js drawWorld.
- The tile bake is lazy: the first visit to a section bakes a few dozen tiles; not measured on a phone.
- Not run: the 40-minute suite, the boss rates (no number moved), stuck runtime, the route pilot.

## QUESTIONS FOR DANIEL (recommendation first; the recommendation is what is built)
1. THE FUSED BEDS SHOW A DOTTED GHOST of the glass they will become. Rec: keep (it shows where the bridge goes); alt: draw it only once a beam has touched the heap.
2. THE FLATS' GLASS IS VIOLET-BLUE and the Crossing's CLEAR cyan (the field and the edge sea-green). Rec: keep (the brief's clear / green / violet refraction); alt: one green for the whole level.
3. THE COLOSSUS IS ONE BAKED BODY PER PHASE. Rec: ship; a breathing / stepping cycle is a small later lane if the playtest wants it livelier.
4. THE SUN TEMPLE STUB is a facade with the door melted shut. Rec: keep; 4b builds the real door behind it.
