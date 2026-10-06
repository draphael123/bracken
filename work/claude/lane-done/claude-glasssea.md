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
