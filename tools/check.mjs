// tools/check.mjs — ONE COMMAND BEFORE EVERY COMMIT: npm run check
// Every audit that answers yes or no, in one pass, with one exit code. A convention nothing checks is a wish; a
// check nobody remembers to run is the same wish with extra steps.
//   npc-removal no npc with dialogue stands outside a shop (Daniel, 2026-09-26: "they don't add much"); the marsh
//             ferryman and the burning village captives are mechanics without dialogue; no relic is placed anywhere
//             (relics are cut, Daniel 10-02: a former relic cache pays a silver; tools/relics.mjs owns that rule)
//   syntax    every source file parses
//   tells     every ! and !! agrees with the blow behind it
//   mark-integrity every boss and mini PLAYED: each marked windup is drawn on the body and lands something (claude/mothermarks)
//   comments  no code swallowed by a // comment
//   homepaths no tool defaults a path into somebody's home directory: green on one machine is not green
//   dangling-paths every repo path a document or a comment cites is one a FRESH CLONE can open - asked of git and
//             not of the disk, because a file that is present here and ignored is absent everywhere else
//   shop-gates every store lock and hero unlock names a real LEVEL ID: a gate on anything else never opens, and
//             the shop tells the player to go and clear a place that does not exist
//   occluders what crosses the lens is the place's own (no forest tree in a village or a desert) and never drawn indoors
//   swim-shrines a swimmer lights the shrines the main route swims over, as a walker lights the ones it passes
//   underwater out of breath is a QUIET drain on every water level (no stagger, knock, hurt flash or mercy window) and a flask can be drunk swimming at 1.5x (claude/underwater, tools/underwater.mjs)
//   ground-depth the ground is shaded from the shallowest surface near it: no dark stripe down from every raised step
//   camera-fill  the follow camera's flat-ground foot line (CAM_FOOT), the ground's fade-to-dark by depth, and the
//             Hornet Queen's and the Grandmother's arenas framing without the boss plate over a fighter
//   gob-priest the goblin priest's rite, censer and bell each fire when forced, each told, and every priest has a flock
//   architecture nothing a level says was BUILT (laid stone, a wall face, a post, a house) stands on nothing: a load path from
//             the bottom up, a lintel carries four tiles, an arch stands on its two springings (tools/architecture.mjs)
//   floaters  no prop standing on nothing
//   temple-guardian  THE TEMPLE GUARDIAN 2: its raised blocks are solid (no fall-through), a bell in reach or its own thrown stone staggers it, its ward, B15 damage
//   monk-machines  every prayer-wheel stair can be stood on and climbed, no bare SOLID slab in a monk level's sky
//   solid-islands  no loose board / slab in the air without a DRAWN support (post, hanger, frame, machine) or a reasoned allowance (tools/solid-islands.mjs);
//                  a post only counts when it starts under its slab and its foot reaches a solid within 8 px (POST_REACH_PX, claude/screefix)
//   visible-supports-strict  (headless) scree + spire: every overhang has a support whose INK a player can see, deck to ground (tools/visible-supports.mjs --strict)
//   audit     signs, NPCs and ledges on ground; no one-way ledge no jump can reach
//   content   the gaps that fail silently (sprites, tables, names)
//   talents   every talent node is read somewhere
//   traps     you can always get back out
//   signs     no sign longer than two lines on the reading panel
//   killzones no reachable tile kills a hero who stands on it
//   collectables every silver, key and quest item can be picked up from some ground
//   level-walk-selftest the campaign-level LEVEL WALKER (tools/level-walk.mjs) runs one short marsh walk and reports (not a difficulty gate)
//   walk-controls the walker's HANDS (claude/walkerctl): the key up a tower, the zigzag one-way stair, out of a chimney slot, a kennel winch left alone - four short Stormhold walks + the movement graph (src/walk-graph.js)
//   keys      every key comes before the gate it opens: each lock gate is rock until its key has been reached
//   ambush-listed every ambush's own wave table lists exactly what singleAmbush() (src/ambush.js) actually spawns: it keeps 1 elite + the
//             first three non-elite, non-overlapping foes in source order and silently drops the rest of whatever the table lists (claude/
//             hanging2, 2026-09-28: the Hanging Village's archer + cutter never spawned in the live game because of exactly this)
//   ambush-reach every captain an ambush makes you kill can be reached from where the room shuts you in (stake walls and gates are rock)
//   elites    every elite can be reached, and every gate it holds is reached with it shut and really holds the route
//   spawns    no creature starts inside the rock, no eel, angler or urchin starts out of the water
//   feel-speed    (headless) Game speed 50..200%: the nine steps, 100% default for a fresh profile, the one-time speedV3 migration, sub-steps above 100% (claude/feelplatform)
//   feel-platform (headless) camera lookahead (eased, ~1/6 screen, off with Reduce motion), landings by height, the world's small reactions (claude/feelplatform)
//   pixels    (headless) no sprite floats, hangs from nothing or runs through a ledge, by its own pixels; no water
//             creature leaves its water over a tide (src/floatlab.js)
//   deadends  every dead end pays: loot, a heart or a coin cache at the far end of every pocket (land, water, up high)
//   blood-kit (node+headless) THE BLOOD KNIGHT (claude/bloodknight, src/blood-kit.js): BLOOD DEBT (half a blow as a red segment, drained in ~3 s, won back by his landed
//             blows, never above pre-hit), the five-tier heavy (T4/T5 need + spend the debt), BLOOD PRICE (DOWN+C), BLOOD SPIKE (the low parry), no harvest, the names
//   foe-pass  (node) THE FOE PASS CORE (claude/foepass): the break bar's varied / stale fill + the finisher refund, every act I-II family's told attack (SIG / TOLD_TODO, may only shrink),
//             the four affixes (never immune, one a foe, from act II), pursuit + the lead + squad roles, the tell colours, the Death Knight's ward-release parry, every hook in main.js
//   foe-pass-page (headless) the same in the page: stale mashes never break and varied runs do, the refund, the plunge finisher, each affix, pursuit and the lead on a live level only, a jumped pounce overreaches, the reaper's yard
//   told-sweep12 (headless) the seven new told attacks (thief swipe, spitcap spit, sapper shove, wisp dart, shaman jab, clinger lash, shardling flick) each show their windup and are answered: jump / duck / a held shield (claude/sweepact12)
//   leveling  (node) THE LEVELING LANE (2026-10-03): the curve to fifty never rises, the level-up card and its milestones, the soft XP cap,
//             a third slot at 16 (three at most), heroes for silver and co-op with the second, the old-save migrations (tools/leveling.mjs)
//   textfit   (headless) no text runs past its plate or off the screen, is cut, clipped, smeared, overprinted or laid over the hero,
//             and no meter is drawn across a word (every boss plate is drawn in its fight: 'plates')
//   textfit-full (headless, ~8 min, 10 min budget) the unscoped textfit --strict: every talk page of every level for every hero, every boss fight
//   blow-tags (node) B14 KEYS-CORE (claude/keyscore): every boss hook in hurtEnemy0/wardedDamage receives the blow TAG (the firedrop is a plunge by
//             its tag, a thrown prop a throw, a seed sent back a reflect, a cut out of a parry a riposte), no boss gates on the bare plunge boolean,
//             and src/boss-read.js's eight-key table (words, glyphs, keyed(), takes/turnedKey/drawKey) - no boss keyed yet
//   rafts     an empty raft returns slowly, keeps its toll and passengers, and can cross again
//   raft-recall  (claude/frogking2) out of the water on a raft's dock side, or a death mid-crossing: every raft is AT her dock that frame (marsh x4, long water)
//   bells     every signed bell is live: a sentry runs for it, it drops its hall's gate (never on a lock gate), turns out the watch, and the gate lifts
//   arena-supplies a fight written for height is fought in a room that has some: every boss attack that only lands
//             within N px of the floor has ground in its own arena to stand above (A12)
//   buriedcity-exit (headless, batch91) the King down through his three phases, the sand banks gone from the exit gate, the hero walks out to the win card and the map, and the Sealed Pyramid opens (campaign + level select)
//   burial-geometry the lower crypt and the Bone Stairs climb are the only ways on; pits poison; vents hurt only when puffing
//   undercrown-variety the Glitter Vein (crystal that breaks and grows back) and the Goblin Barrow are on the route; the Prince is a goblin
//   one-dodge the double tap and V are ONE dodge: its grace, its way, one cost, once in the air, the dash attack out of it
//   hero-pass (claude/heropassa) HERO PASS A: each hero's own dodge on one budget, the knight's shield bash + valiant strike, the warden's counter-thrust + wall plant + tip up to 2x, the ranger's arrow snatch + kneeling draw
//   checkpoint-gaps no level walks more than 150 route tiles between checkpoints, measured along the route you walk (B6); the
//             filler keys a tall level on its rows and a switchback hid 162 tiles from it
//   hanging-hoist THE HANGING VILLAGE's machine: every hoist's well on the far side of its deck from its loads, its rules run, and the
//             Owl Reeve cuts the crown's rope once, told and fair, in phase two only (docs/briefs/hanging-village-rework.md)
//   moor-gusts GALE MOOR's wind is a mechanic: every gust told, one rhythm for the ones that shove, a ride wider than a jump and
//             inside its carry, a headwind crossing of stones to brace on, taught over the bog first (docs/briefs/gale-moor-rework.md)
//   windcaller-gusts THE WINDCALLER 3's summit per hero with real keys (claude/windcaller3): every ledge reached on the told gust off an updraft, none
//             without it (no gust, a plain jump, upwind), and his gale home always sets you down on the lip unhurt
//   moor-rocks GALE MOOR's WIND ROCKS and GOBLIN SCAFFOLDS (claude/moor2): every crevice a short told burst to footing a jump cannot reach,
//             every route need needed, the frame's gap wider than any jump and its gust no carry across, a struck goblin taken into the tarn
//   rootway   THE ROOTWAY (claude/rootway, Node): on the road (Sporewood > Rootway > Kingswood), every checkpoint, silver, tag, the loft and the gate reached; every required bud and hoist a LOCK; the high cleat struck only from its cap, the lookout cleat by no blade; every well climbs back to its near lip
//   kingswood2 KINGSWOOD 2, THE KING'S HUNTING WOOD (claude/kingswood2, Node): five named areas, the oak drawn, every required rope a LOCK, the log traps' roads, the shrines at the exams, the procession's road and boughs, the hands in a fake world (replaces kings2-beats: the old wood's beats)
//   gorm2      KING GORM 2 (claude/gorm2, Node): his hall's ropes and two-sided pegs, the rafter archers' LOCK, the rocks' lob, the flee (spared, healed, persist), the fire's rubber band, the burning wood's floors/boughs/branches/torches/shrine, the glade's hangings (held / knocked down / stung, his ward), every P1/P2 move told then released, B15 0.4, THE ROYAL BOAR
//   rootway-probe (headless) THE ROOTWAY in the page: a bud grows, a cleat drops its span and its cage, a hunter rides his hoist down (or falls dazed), an arrow struck back cuts the lookout rope; THE HUNTMASTER guards his front, his gold arrow struck home opens him, his ward, a red arrow no blade turns, his cage catches him
//   rootway-aloft THE ROOTWAY's art (claude/rootway art pass): every ledge is let into a root wall, held by a lashed root post or roped to a peg; every pulley hangs from a limb and every cleat sits in a root wall or on a post; every prop is held up; the exam's floorless gaps are drawn as a drop
//   skyroad-aloft THE SKY ROAD's art (claude/skyroadart): every ledge is keyed to rock, held by a pier, stayed to a ring in the rock or carried by a girder; every prop is held up; every grounded thing has a foothold
//   skyroad-stuck THE SKY ROAD's DEAD-AIR TRAPS (claude/skyroad2, Daniel 10-08): every footing whose only way out is a dead thermal is in L.airOnly, and off it the cloud sea throws every hero back to live footing
//   moor-aloft GALE MOOR's new sections (claude/moor2art): every grounded thing has a foothold, every scaffold post runs to rock or the tarn bed, every tarn has a bed
//   redgorge2-aloft RED GORGE 2's new ground (claude/redgorge2 art pass): every Climb ledge is keyed or held by a rock spur to rock, every prop stands on a top, the kit covers every solid cell of the Rapids and the nest ledge
//   glasssea-slide THE GLASS SEA's slide gap per hero with real keys (claude/slickslope): a plain jump falls in; the slide-jump clears it with a tile to spare, a human's window wide
//   lit-church-aloft THE LIT CHURCH's art pass (claude/churchart): the church's own kit on every cell, props and lights on a top, windows in air, the set paints every screen lit and dark, the six skins and THE PALADIN's rig
//   reach-heroes   EVERY HERO, HIS OWN LEGS (claude/reachcore): the reach model per hero matches the game's jump, fails the Slick Slope as it stood and passes it now, and every level's route in each hero's legs is the shared fill's or a KNOWN tight crossing
//   ksar-aloft THE BANDIT KSAR's set (claude/ksar art pass): the Ksar's own tile kit on every solid, one-way and spike cell, every prop and light on a top (or hung from a roof), the rule's pieces and the roof bridge's pulley post on solid, the Hawk Tower an ashlar landmark, no dark stretch, the set paints every screen
//   glasssea-aloft THE GLASS SEA's set (claude/glasssea art pass): every glass shelf and fused span keyed, posted or arched, every hanging mass held to the ground, every prop on a top, the Colossus's holds growing out of its body, the glass kit on every cell
//   lit-church THE LIT CHURCH (claude/litchurch, Node): the spur and the Paladin's price, the Crusader, the rule line, each verb required (the west door, the rood
//            screen, the seal, the bellows, the broken loft, lamp three), the light rule in the hands, the cast, THE PALADIN (aegis, starve, falter, ward, phases)
//   sun-floor THE SUN NEVER KILLS (claude/ksarfix, Node): 30 s in open sun at low hp leaves 1 hp and no death (src/drain.js floor, src/sun-hands.js), shade drains nothing, and an unfloored source (OUT OF BREATH) still kills
//   ksar     THE BANDIT KSAR (claude/ksar, Node): the rule line is the code's, each verb required once (the great gong empties the gatehouse off the winch's brake, the store's chain
//            blows the arch), the gong rule in the hands (a ring calls its earshot and no one else, a cut gong never rings), the sun's walks, the cast, the checkpoints, THE HAWK-MISTRESS's openings, ward and guard
//   caravan   THE SUNKEN CARAVAN 2 + THE DUNE WORM (claude/caravan2, Node): sunstroke, quicksand, the worm's state machine and fight rules (A1/A3/A5/A6)
//   caravan-level  the Sunken Caravan's level data (caravan2; wired by batch83 integ)
//   caravan-slides the caravan's slides, in the page (caravan2; wired by batch83 integ)
//   caravan-worms  the Dune Worm's ledge / hide / sand rules in the page (caravan2; wired by batch83 integ). tools/minecart-route.mjs is wired (claude/deeprails3: its flake fixed - see its header; the suite runs its probe and the knight's base-input ride)
//   minecart-aloft THE DEEP RAILS' art (claude/minecartart): every trestle bent stands on rock, every lamp post on a rail bed, every lip lamp on its lip, every gate / crusher / beam / lever on its line, the drill's chute from the roof and its mast on the floor (--page: it is not the crag's dusk sky, the smelter's glow, no grass)
//   minecart  THE DEEP RAILS (claude/minecart): the rule line, the required forks and their fall-ins, every boost gap between a cruising and a boosted jump,
//             the exams' deep gaps, the riders are existing foes on their lines, ten ore / eight for the smelter / three silvers, THE GREAT DRILL's jam, ward and points
//   bandits  THE SUNKEN CARAVAN's three bandits (Node): every told blow fires, the feint is told and throws nothing, the slingstone
//             lands on the spot it marked, the ambusher is harmless and untouchable buried, and each one is wired (docs/briefs/caravan-ruins-bandits.md)
//   dune-worm THE DUNE WORM in the page: his four tells forced and landed, the breach true to its spot, the storm his and phase two's,
//             the sun in his hollow, the gate after his death (docs/briefs/dune-worm.md)
//   sporewood2 SPOREWOOD 2, THE MOTHER'S KNOT + THE MOTHER CAP 2 (claude/sporewood2, Node): the road, the rule line, the six areas, the knot drawn, every REQUIRED use a LOCK (buds, bounce caps, dark buds, lean caps, the seed stair), the spores that help, the debuffers cut and answered, shrines at the exams, her hollow's seed pairs and knot, the hands and her in a fake world (replaces spore-caps, spore-exam, spore-loop, mother-cap, mother-pilot)
//   sporewood2-probe (headless) SPOREWOOD 2 in the page: a bud, a dark bud lit by its lantern, a dazzled lurker, a mend puff, a spring spore, a seed pair, the root knot, the banners, her waking
//             into the bog, the pillars' floor caps webbed with a lurker among them, and the last stretch before her door growing a
//             cap both ways under a fall and a foe - reachable throughout
//   underleafart (headless) UNDERLEAF 3 + THE GRANDMOTHER 3's ART PASS (claude/underleafart): the level hash is the greybox's, the goblin sheets are reskinned (a sheet, a card, a body each), every move of hers has its own baked pose, phase two wears its own set
//   sporewood2art (headless) SPOREWOOD 2 + THE MOTHER CAP 2's ART PASS (claude/sporewood2art): the level hash is the greybox's, the goblin heavies are reskinned (a sheet, a card, a body each), every windup and release of hers is its own baked frame
//   marsh2-beats (claude/marsh2) MARSH WOOD's targeted fixes and the reworked BULLFROG KING pinned: the rule line names the pads, the sluice house is the
//             channel's third and required use (a gate up a ladder draining the far basin to mud, the route sent through it), signs unstacked, guides on
//             crank / ferryman / sluices, ranged under 30%, and his five new told moves (tongue grab, belly-flop, fly swarm + snap, croak ripple, slap) with marks and poses
//   firsthour (headless) THE FIRST HOUR'S BOSSES: the Hornet Queen's sting sticks only in wood (bare earth skims), her comb phase;
//             the Bullfrog King's spit told, his leap opening caused (left late or shielded), his hide, and his pit at half
//   death-cost (headless) THE DEATH COST: what a hero picks up between shrines drops when he dies (a foe that killed him carries it, glowing, and returns it when it falls;
//             a pit or spikes leave it on his last safe footing; a boss leaves it at his arena door), a second death loses it, a shrine banks it, co-op has one each,
//             the save holds it, and an old save migrates as all banked
//   deep-rework THE DEEP: each depth's holds their own room, every deck on a strake, the tribute ship's hot hatches and their stones, the
//             knights by the ways down, the Bell Grave's hung racks, and a Diving Bell that opens only to a stone on his crown (docs/briefs/deep-rework-2.md)
//   longwater-river THE LONG WATER is a river to Saltreach: nothing of the sea in its fresh water, the Bore told before it is met and
//             a stone near every dry tile it runs over, the first swim pool empty, one thing to a rock, checkpoints 40-100 apart
//   deep-descent (headless) THE DEEP played down with the real keys, no god mode, knight and warden: every throat, and the tribute ship's
//             three hot hatches carried down with a stone, to the Glowing Drop (Daniel, 2026-09-25: "there is no way down")
//   answer-tags every told blow of a common foe is answered block, dodge, jump or duck (src/marks.js ANSWER, a ! is a block and a
//             !! never is), and each level's foe mix is reported against three answers (the offenders are listed, not failed)
//   attack-tokens (headless) a crowd of six never has more than two attacking one hero at once, and the ones waiting move
//             (src/attack-tokens.js), and nobody else winds up under a red !! (part 2: heavies come alone)
//   sprinkle-cap (node) THE SPRINKLE CUT: no screen holds more than 2 sprinkled (grid-filled) foes, no level averages more than 1 a screen, and every level section
//             stands at least one DESIGNED encounter (a squad: shield over a bow, a priest, a hornblower, a lone heavy); no sprinkled topiary (src/foe-tactics.js SPRINKLE)
//   duck      (headless) THE UNIVERSAL DUCK: down held ducks every hero to DUCK_H, a high arrow, bolt and head-high swing go over,
//             a low swipe still lands, brace, drop-through and the lookout's hide are kept, every answered blow has a HEIGHT row,
//             and the marks show the DUCK and JUMP lanes (src/duck.js, src/marks.js HEIGHT)
//             Queen is always hittable, a swing commits, her dive holds and feints, her mark comes after the pose, and in
//             Kingswood a brute breaks, a shield parries and counters, a brute feints, a pike lunges and an archer backs off
//   foe-tactics (headless) held wind-ups are only ever longer and keep their mark, a waiting archer backs off to bow range, a waiting
//             shield brings its shield round at its own pace, and a brute covers up against a flurry (src/foe-tactics.js)
//   finishers (headless) every common foe breaks with its own beat and stands open, and each of the seven heroes finishes a broken
//             one with one press - and not an unbroken one (src/poise-break.js, src/finishers.js)
//   pogo-chain (headless) every hero comes back up off a head, plunge or stomp, and two heads without the ground are a chain of two
//             (the Warden vaults off a head over a drop: she never bounces) (src/pogo-chain.js)
//   untold-told (headless) every common foe that used to hurt with no windup (the old UNTOLD list) winds up on a mark beside a
//             standing hero, and none of them hurts him without one (the combat pass, part 2: no untold hits)
//   riposte   (claude/riposte) all 8 heroes parry -> riposte (x2, red = TOO STRONG), elites break on two ripostes, a boss opens short then wards, the poise bar, the mix-up chain (src/riposte.js)
//   order-knights (claude/order) THE ROAD WARDENS: the table (bodies, chapters, twists, one affix, replace-not-add, the marks), every move told, one windup at a time, the four bodies' anti-plunge poses and guards, the three twists, the three exams' knights in their skins holding their gates (tools/order-knights.mjs)
//   damage-pct (claude/damagepct) DAMAGE % STAGGER: a hero blow builds a foe's % (mashing slowly, mixed / heavy play fast), the throw / arc / hitstun grow with it (a launch tumbles; weight classes and the elite's never-killed kept), a boss's break grows with it (capped, B3 ward unchanged), the readout (src/damage-pct.js)
//   ki-follow (claude/kifollow) the knock-into follow-up: spines drawn per body and keyed, the armed-only touch (spitter off the list; urchin / jelly / grub / marshlight hurt only when their drawn state is full), the hop / wobble / tumble / slide poses, an entry burst per hazard kind, the Deep Rails' lava and every quicksand patch as knockHazards rows (src/ki-art.js, src/knock-data.js)
//   knock-into (claude/knockinto) a heavy / riposte / finisher-on-break throws the foe along the blow, weight-scaled, a boss never; into the spikes, a drop, the fire it is said and dealt (an elite is never killed by a throw); the Spike Goblin's and a THORNED elite's spines are drawn and told; the spitter sidesteps; the a-d reactions (src/knock-into.js, src/anti-plunge.js)
//   riposte-shots (claude/riposteart) every hero's parry and riposte are DRAWN from their own keys: the catch from 'parry', the strike through 'ripo' frames 0-1-2 (tools/riposte-shots.mjs)
//   knight-rework the perfect guard opens a heavy riposte, the third cut pays for where it throws, and holding the shield costs (docs/briefs/knight-rework.md)
//   stockade-horns THE STOCKADE's four audit beats, pinned: tower 3's blower runs and climbs a real net under a second
//             archer's fire; the kennel horn's pack (not a static hound) waits behind its crank gate; the rafters
//             archer's sapper wave fires for the Chieftain's phase two ONLY (a different boss's phase two does not);
//             the bridge sapper and the second lift's hound (work/claude/lane-done/claude-stockade.md)
//   stockade2  THE STOCKADE 2's new beats, pinned: the Watchtowers (the dozing blower's horn taken and blown, the cooks run under the log pile and are
//             crushed, the barred gate opens to the horn, climbing the first tower winds all three exam horns - their packs, never the camp squad -
//             the crow's nest silver off the route), the named areas, and the Chieftain's war tower (climbed at his second wind, 0.4 up there,
//             both lashings cut: down in the wreck, x2) on the B15 floor (work/claude/lane-done/claude-stockade2.md)
//   chief3     THE CHIEFTAIN'S HORN AND POWDER (claude/chief3): his war horn silenced by two blows = open, sounded = his crew, answered by yours = none;
//             his kegs heaved, struck back, a blast that knocks him down open or takes his tower's lashings; the barrel taught, the kennel lookout on
//             stakes brought down by a blast, the powder store before the hall (work/claude/lane-done/claude-chief3.md)
//   throwables CARRY & THROW (src/throwables.js, 2026-09-28): the table itself is sane (arcs, respawns, hits a fire foe
//             harder), no fire a bucket is the only way past is out of a short carry from a rack, and in the page: walk
//             onto it and INTERACT takes it, ATTACK throws it in an arc, it douses a kind tools/burning-village.mjs's own
//             bucket section does not (the barn roof), a death mid-carry drops it, and it is back at its rack ~3s later
//   pyro-duel THE PYROMANCER as a mirror duel (2026-09-28): her run of three and her Bellows on her own frames, one spell, hops
//             onto your stall, the third light blow in a row turned (a heavy goes through), a thrown bucket douses him OPEN (no
//             lock while he is wet), racks in reach of every tile of his square, ~15% more health, a landed cut ends his run
//   zipline  THE ZIP LINE, WITH REAL KEYS (claude/zipline, src/zipline.js): in the page every one of the seven heroes takes Stormhold's tower ropes at the top end with UP, mid-line from the floor under
//             it with UP, and from a jump that touches it; rides them downhill (and two lines laid for the test, one down to the east and one to the west); lets go part-way with JUMP and with DOWN
//             and is not caught again on the way down (tools/watchtowers.mjs proves the geometry and one step in Node; tools/harvest-fair.mjs still has the Fair's frayed rope snap)
//   online-coop (headless, two browsers) ONLINE CO-OP phase 1 (src/online.js, src/online-guest.js): a guest joins a host BY CODE over a local
//             signalling stub (tools/online-stub.mjs) and real WebRTC; his keys (his own bindings) and touch buttons move player two, the stream is
//             crisp 2x pixels with sound, host pause shows on the guest, focus loss lets go, a disconnect drops player two, his save is untouched
//   tavern (headless) THE CROSSROADS INN, co-op phase 2 (src/tavern.js, src/party.js): title LOCAL/ONLINE CO-OP and the map's F lead in; a free pad walks a new player in through
//             the door (up to four); every station (door, invite board, campaign table, wardrobe, drills, bell + revive, team hit, throw, practice, arena COMING SOON); the party view
//             steps out a little; the leash pulls a stranded player along; floor rings + tags in seat colours; old and broken saves fine
//   ai-companion  AI COMPANIONS core (src/ai-companion.js + main.js allyTick): the behaviours, the lighter scaling, the party board's AI PARTNER (linked / default), a linked companion's XP-only credit, the follow through the Lumber Trail, the marsh raft, Old Tusker's fight start (--rates: knight + AI vs solo)
//   coop-progress (node) CO-OP PROGRESSION step 1 (src/coop-save.js): a partner's own hero from his own slot (the host trusts none of the snapshot), credits of XP, silver and level clears (cumulative, never double, a lost one covered, a fresh save, migrations, damaged/newer/full told), one character one place (locks), the local slot pick
//   save-safety (headless) A SAVE IS NEVER LOST IN SILENCE (src/save-safety.js): a corrupt slot reads CORRUPT (not empty) with FIX IT (restore the last good copy / export / erase), a later-version save is NEWER SAVE, a damaged text is kept, a failed write says SAVE FAILED - STORAGE FULL and retries, one migration backup
//   hero-roster (headless) THE DEVICE-LEVEL HERO ROSTER + NO UNLOCK-ALL (claude/heroroster, src/hero-roster.js): seeded from every slot at boot, a hero bought in one slot is open in another's new game, locked heroes are black silhouettes named ??? with a how-to line (Z refused), co-op follows the roster, UNLOCK EVERYTHING only with ?dev=1, a damaged roster is restored
//   bug-report (headless) REPORT A BUG = a BRK1- code (src/bug-report.js), no email: the pause + title rows, the board, the code under 1500 chars, and the round trip through tools/bug-decode.mjs (note, level, hero, hp, settings, errors, events; never the save)
//   ending (headless) END OF THE ROAD - FOR NOW after the last main-road level (src/ending.js), solo and co-op; the Mage's Folly is a plain win card
//   ship-fixes the Berserker's voice, the CC0 authors on the credits page, no 'first draft', the favicon + icons, the build line
//   deploy-surface .vercelignore hides tools/ docs/ work/ audits/ src/benched and keeps everything the game loads (docs/updates.json, tools/fixtures/campaign-xp.json, src/draft)
// The labs (fight and boss) need the page: run BK.bossLab() in the browser after a combat change.
import { execSync, spawn, spawnSync } from 'child_process';
import { readFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

import { portFor, newRunTag } from './ports.mjs';
import { runPool } from './check-pool.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url));   /* not .pathname: a space in the folder name arrives as %20 */
/* A SUBSET, FOR THE BUILD LOOP. `npm run check` with no arguments is the GATE and is unchanged - all of it, and the
   only thing that may be called green. `npm run check -- tower,tome,elites` runs just the checks whose names contain
   one of those, which is seconds instead of half an hour, so a batch can be checked three times while it is being
   written instead of once when it is finished. A subset PRINTS THAT IT IS ONE, every time, and never says the suite
   passed: "8 of 101" is not a pass, and the difference between those two is the whole reason the gate exists. */
const argv = process.argv.slice(2), option = (key, fallback) => { const inline = argv.find(a => a.startsWith('--' + key + '='));
  if (inline) return inline.slice(key.length + 3); const i = argv.indexOf('--' + key); return i < 0 ? fallback : argv[i + 1]; };
/* SERIAL BY DEFAULT (Daniel 10-15): a plain `npm run check` - the release gate - stays one job, one browser, until a parallel run
   on the release PC matches a serial verdict. Parallel is opt-in: --jobs=3 --max-browsers=1 (or BRACKEN_JOBS / BRACKEN_MAX_BROWSERS). */
const JOBS = +option('jobs', process.env.BRACKEN_JOBS || 1);
const MAX_BROWSERS = +option('max-browsers', process.env.BRACKEN_MAX_BROWSERS || 1), shardArg = option('shard', '');
if (!Number.isInteger(JOBS) || JOBS < 1 || JOBS > 10 || !Number.isInteger(MAX_BROWSERS) || MAX_BROWSERS < 1 || MAX_BROWSERS > JOBS)
  throw new Error('--jobs must be 1..10 and --max-browsers must be 1..jobs (one port per worker in this checkout)');
const shardMatch = shardArg && String(shardArg).match(/^(\d+)\/(\d+)$/), SHARD = shardMatch ? [+shardMatch[1], +shardMatch[2]] : null;
if (shardArg && (!SHARD || SHARD[0] < 1 || SHARD[1] < 2 || SHARD[0] > SHARD[1])) throw new Error('--shard must be i/n, with 1 <= i <= n');
const WANT = argv.filter((a, i) => !a.startsWith('--') && !['--jobs', '--max-browsers', '--shard'].includes(argv[i - 1]))
  .flatMap(a => a.split(',')).map(x => x.trim()).filter(Boolean);
const SUBSET = WANT.length > 0 || !!SHARD, wanted = name => !WANT.length || WANT.some(w => name.includes(w));
/* The committed durations are the SAME map on both PCs. Largest first, then name, to the shortest shard; a new check
   absent from the map still goes somewhere stable until its first timed run updates the map. */
const timings = JSON.parse(readFileSync(join(ROOT, 'tools/check-timings.json'), 'utf8'));
const assigned = new Map(), load = SHARD ? Array(SHARD[1]).fill(0) : [];
if (SHARD) for (const [name, ms] of Object.entries(timings).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  const i = load.indexOf(Math.min(...load)); assigned.set(name, i + 1); load[i] += Math.max(1, ms); }
const belongs = name => !SHARD || (assigned.has(name) ? assigned.get(name) === SHARD[0]
  : [...name].reduce((h, c) => (Math.imul(h, 33) + c.charCodeAt(0)) >>> 0, 5381) % SHARD[1] + 1 === SHARD[0]);
let skipped = 0; const take = name => { const y = wanted(name) && belongs(name); if (!y) skipped++; return y; };
/* LIVE LOG (10-16, after a runaway browser took the PC down and the end-of-run summary could not say which check did it): one line per check
   AS IT FINISHES, flushed at once, with the peak working set of this run's test browsers while it ran. The lines start with '[live]', never
   ' ok' or 'FAIL', so scratch/release.sh's greps of the summary below are untouched. Peak = sampled every 3 s by tools/rss-sampler.ps1
   (Windows); parallel hands overlap, so there it is the peak while the check ran, not the check's alone. */
const RSS_FILE = join(tmpdir(), 'bracken-rss-' + process.pid + '.txt');
let sampler = null;
const startSampler = () => { if (process.platform !== 'win32' || sampler) return;
  try { sampler = spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(ROOT, 'tools/rss-sampler.ps1'), '-Out', RSS_FILE, '-Tag', process.env.BRACKEN_RUN, '-ParentPid', String(process.pid)], { stdio: 'ignore', windowsHide: true });
    sampler.on('error', () => { sampler = null; }); sampler.unref();   /* the sampler waits for check.mjs to die, so it must not keep check.mjs alive (batch97 integ 10-17: every run hung after its last line) */
    process.on('exit', () => { try { if (sampler && sampler.pid) spawnSync('taskkill', ['/PID', String(sampler.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {} try { unlinkSync(RSS_FILE); } catch {} }); } catch { sampler = null; } };
const PEAKS = new Map();
const peakBetween = (t0, t1) => { let tot = 0, max = 0, any = false;
  try { for (const line of readFileSync(RSS_FILE, 'utf8').split(String.fromCharCode(10))) { const [t, a, b] = line.split(' ').map(Number); if (t >= t0 - 3500 && t <= t1 + 500) { any = true; tot = Math.max(tot, a || 0); max = Math.max(max, b || 0); } } } catch {}
  return any ? { tot, max } : null; };
const live = (name, ok, ms) => { const t1 = Date.now(), pk = peakBetween(t1 - ms, t1); PEAKS.set(name, pk);
  console.log('[live] ' + (ok ? 'ok  ' : 'FAIL') + ' ' + name + ' ' + (ms / 1000).toFixed(1) + 's' + (pk ? ' peak-rss total=' + pk.tot + 'MB biggest-process=' + pk.max + 'MB' : ' peak-rss n/a')); };
const runSync = (name, cmd, args, env) => {
  const t0 = Date.now(), r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', env: env ? { ...process.env, ...env } : process.env });
  const out = ((r.stdout || '') + (r.stderr || '')).trim().split('\n');
  const ms = Date.now() - t0; live(name, r.status === 0, ms);
  return { name, ok: r.status === 0, ms, last: out[out.length - 1] || '', out };
};
const run = (name, cmd, args, env) => JOBS === 1 ? runSync(name, cmd, args, env) : { name, cmd, args, env };
const files = [];
const walk = d => { for (const f of readdirSync(join(ROOT, d))) { const p = join(d, f); if (statSync(join(ROOT, p)).isDirectory()) walk(p); else if (/\.(m?js)$/.test(f)) files.push(p); } };
walk('src'); walk('tools');
/* ON A SUBSET, SYNTAX-CHECK ONLY WHAT CHANGED. The sweep spawns `node --check` once per file, and across ~150 files
   that was 55 of the 60 seconds a two-check subset took - the checks themselves were four and a half. The FULL run
   still parses everything, because that is the gate; a subset parses what git says you touched. */
if (WANT.length) { const ch = spawnSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
  const norm = f => f.replace(/\\/g, '/');
  const touched = new Set((ch.stdout || '').split(String.fromCharCode(10)).map(l => norm(l.slice(3).trim())).filter(f => /\.(js|mjs)$/.test(f)));
  for (let i = files.length - 1; i >= 0; i--) if (!touched.has(norm(files[i]))) files.splice(i, 1); }

let results = [];
/* THE TEMP FOLDER, before and after: abandoned BRACKEN browser profiles (idle 30 min, no live process on them) go first, and at
   the end anything THIS run made and did not take away again is a leak and fails the suite (tools/profile-sweep.mjs) */
/* THIS RUN'S OWN TAG. Children inherit it, browser-profile.mjs writes it into every profile directory name, and the
   leak check below counts only profiles wearing it - so another session's crashed browser can no longer be reported
   as this run's leak, which is exactly the false red that threw away a full run on 2026-09-22. */
process.env.BRACKEN_RUN = process.env.BRACKEN_RUN || newRunTag();
const SUITE_T0 = Date.now(); startSampler(); runSync('profile-sweep', process.execPath, ['tools/profile-sweep.mjs', '--kill-orphans', '--run', process.env.BRACKEN_RUN]);
if ((WANT.length && !SHARD) || take('syntax')) { const t0 = Date.now(); const bad = files.map(f => [f, spawnSync(process.execPath, ['--check', f], { cwd: ROOT, encoding: 'utf8' })]).filter(([, r]) => r.status !== 0);
  live('syntax', !bad.length, Date.now() - t0); results.push({ name: 'syntax', ok: !bad.length, ms: Date.now() - t0, last: bad.length ? bad.map(([f]) => f).join(', ') : files.length + ' files parse', out: bad.map(([f, r]) => f + ': ' + r.stderr) }); }
for (const t of ['tells', 'hornsman', 'underleaf', 'shake-mode', 'hero-trials', 'ore-road', 'ore-ride', 'scree-rework', 'village-stakes', 'comments', 'homepaths', 'dangling-paths', 'shop-gates', 'floaters', 'redgorge2-aloft', 'audit', 'content-audit', 'talents', 'progression', 'progression-runtime', 'skill-menu', 'skill-passives', 'skill-icons', 'skill-balance-probe', 'starter-kits', 'reaper-input', 'traps', 'signs', 'killzones', 'collectables', 'keys', 'elites', 'spawns', 'deadends', 'rafts', 'raft-call', 'raft-recall', 'render-layers', 'room-patterns', 'heat', 'queen-comb', 'crown-route', 'crown-requests', 'gallery-runtime', 'waterfall-joins', 'paladin-enrage', 'map-grammar', 'map-forks', 'under-order', 'checkpoints', 'additional-areas', 'additional-areas-runtime', 'keep', 'keep-runtime', 'keep-expansion', 'keep-passages', 'keep-expansion-runtime', 'storm-ship', 'storm-ship-runtime', 'haunted-coast', 'haunted-coast-runtime', 'tome', 'false-abbot', 'tower-ascent', 'archmage-room', 'skins', 'threat-holes', 'one-new-foe', 'folly-runtime', 'deadly-water', 'burning-village', 'witchlight', 'sea-requests', 'sea-runtime', 'shop-theme', 'store-preview', 'dressing', 'runtime-footing', 'bridge-props', 'light-support', 'readability', 'town-live', 'waymeet-cleanup', 'owl-lamps', 'belfry', 'moor-wind', 'watchtowers', 'salvage-captain', 'harbor-expansion', 'harbor-route', 'buried-dead', 'burial-route', 'burial-geometry', 'burial-rework', 'undercrown-variety', 'boss-openings', 'arena-supplies', 'undead-foes', 'buried-attacks', 'combat-feel', 'attack-animation', 'attack-buffer', 'normal-health', 'ambush-single', 'reed-island', 'lab-clock', 'combat-replay', 'combat-results-test', 'pilot-actions', 'pyre-pilot', 'herald-pirate', 'boss-navigation', 'cdp-recovery', 'swim-chain', 'temperer', 'unburied', 'unburied-fights', 'ability-poses', 'knight-rework', 'riposte', 'crouch-hint', 'knock-into', 'order-knights', 'riposte-shots', 'levelling', 'levelling-runtime', 'leveling', 'boss-fight-end', 'geomancer', 'berserker', 'ranger', 'dk2', 'blood-kit', 'burial-variety', 'buried-dead-art', 'mini-names', 'slopes', 'one-dodge', 'queen-chandelier', 'ambush-reach', 'small-adds', 'occluders', 'swim-shrines', 'ground-depth', 'hanging-hoist', 'checkpoint-gaps', 'dune-worm', 'architecture', 'gob-priest', 'ore-work', 'bells', 'moor-gusts', 'tower-collapse', 'sexton', 'lance3', 'footing-art', 'reefmaw-land', 'buriedcity-exit', 'reefmaw-art', 'reef-hulk', 'drowned-knights', 'whirlpools', 'keep-rework', 'deep-rework', 'deep-descent', 'longwater-river', 'bandits', 'class-spurs', 'mini-walls', 'checkpoint-stand', 'tower-cutouts', 'archmage-rings', 'kraken-rework', 'uphill', 'desert-ledge-art', 'gargoyle-smash', 'deathknight-unlock', 'camera-fill', 'lab-reach', 'burial2', 'burial-vents', 'whelps', 'npc-removal', 'relics', 'gargoyle-stomp', 'burial3', 'burial3-keys', 'zoom-coverage', 'tower-hall', 'tower-flyers', 'gate-alpha', 'ram-bank', 'stormhold2', 'audio-assets', 'marsh-exam', 'stockade-horns', 'gargoyle-playtest', 'answer-tags', 'attack-tokens', 'untold-told', 'foe-tactics', 'finishers', 'pogo-chain', 'hanging-exam', 'monastery3-beats', 'kingswood2', 'gorm2', 'wood2-beats', 'lumber-trail', 'ore-exam', 'ambush-listed', 'courtyard', 'throwables', 'pyro-duel', 'push-blocks', 'crown-exam', 'highcrown2', 'boss-jump', 'archmage-folly', 'tower-chase', 'dances', 'firsthour', 'death-cost', 'sprinkle-cap', 'juice', 'folly-library', 'undead-realms', 'undead-moves', 'duck', 'chase', 'harvest-fair', 'wicker-queen', 'ember-flare', 'queen-court', 'crouch-b', 'settings-tabs', 'crouch-a', 'hint-shown', 'weak-bosses', 'crouch-feet', 'store-ui', 'store', 'loading-screen', 'boss-music', 'level-quality', 'theatre', 'level-jump', 'puppeteer', 'frame-cost', 'load-leak', 'slide', 'canal', 'boss-greed', 'foe-tempo', 'verb-matrix', 'mash-gate', 'floating-geometry', 'goblin-lint', 'canal-water', 'map-spacing', 'save-slots', 'weapon-skins', 'welltown', 'djinn', 'djinn-pail', 'cistern-queen', 'redgorge', 'raptor-matriarch', 'touch', 'corpses', 'modulepreload', 'mobile-perf', 'tile-chunks', 'gorge-basket', 'desert-foes2', 'stuck', 'ambient-landmarks', 'mash-carry', 'commitment', 'unburied-look', 'unburied-engines', 'steam-works', 'combat-part2', 'curve-gate', 'unburied-aloft', 'unburied-bailey', 'fair-folk', 'wicker-man', 'moor-rocks', 'moor-aloft', 'rule-openings', 'underwell', 'underwell-aloft', 'gear-tiers', 'ui-hud', 'uiscreens', 'death-screen', 'level-complete', 'playrec', 'canal-aloft', 'skyroad', 'skyroad-probe', 'skyroad-aloft', 'boss-read', 'glasssea', 'glasssea-aloft', 'glasssea-slide', 'level-walk-selftest', 'ksar-aloft', 'ksar', 'sun-floor', 'lantern-eater', 'level-reach', 'rootway', 'rootway-probe', 'rootway-aloft', 'caravan', 'caravan-level', 'caravan-slides', 'caravan-worms', 'minecart', 'minecart-aloft', 'railsparallax', 'mark-integrity', 'gate-openers', 'great-hound', 'godmode', 'skyroad-stuck', 'village-water', 'blow-tags', 'firedrop-plunge', 'lit-church-aloft', 'lit-church', 'church3-foes', 'towpath', 'scree-chase', 'ram-lord', 'zipline', 'owl-swoop', 'temple-guardian', 'monk-machines', 'solid-islands', 'no-hidden-hits', 'unburied-secret', 'fonts', 'hud-default', 'map-scale', 'flasks2', 'titlescene', 'reach-heroes', 'gargoyle-spikes', 'flip-actions', 'windcaller-gusts', 'kraken-reach', 'buried-city', 'buried-city-levers', 'survival', 'fire-room', 'archmage-interrupt', 'fallingtower2', 'fallingtower2-keys', 'walk-controls', 'whatsnew', 'ki-follow', 'damage-pct', 'damage-caps', 'online-coop', 'tavern', 'drawn-solids', 'minecart-route', 'save-safety', 'bug-report', 'ending', 'ship-fixes', 'deploy-surface', 'sealed-pyramid', 'hero-roster', 'hero-pass', 'owl-gust', 'lethal-water', 'church-road', 'towpath-exits', 'underwater', 'lamplit2', 'lamplit3', 'admirals-champion', 'boss-select', 'curve-shape', 'act-cards', 'audio-mix', 'voices-check', 'footsteps-check', 'foe-pass', 'foe-pass-page', 'stockade2', 'lumber-vanish', 'marsh2-beats', 'tavern-menu', 'coop-progress', 'old-tusker', 'hornets-nest', 'ai-companion', 'told-sweep12', 'fen-road', 'bog-troll', 'structure-stable', 'chief3', 'sporewood2', 'sporewood2-probe', 'sporewood2art', 'underleafart', 'village-hands', 'kings2-beats', 'secrets', 'rookery-probe', 'rookeryart', 'admiral']) if (take(t)) results.push(run(t, process.execPath, ['tools/' + t + '.mjs']));
/* THE LAB DOES NOT REMEMBER THE FIGHT BEFORE (claude/harness): a seeded bossLab row is the same alone and after a batch in one page (tools/lab-order.mjs) */
/* Whole-game geometry inventory while the art lanes clear the backlog. The existing Buried City drawn-solids gate above
   stays a gate: adding a report-only sweep must not turn a shipped assertion off. Each name is a standalone tool so the
   release script can rerun a reported failure by the same check-name field it has always used. */
for (const t of ['drawn-solids-sweep', 'visible-supports']) if (take(t)) results.push(run(t, process.execPath, ['tools/' + t + '.mjs']));
/* THE SCREE PATH AND THE MONASTERY ARE A GATE (claude/screefix, Daniel 2026-10-15: floating slabs on thin posts, floating architecture): every overhang of the two has a VERIFIED visible
   support - the strict run, on a port of its own so it never shares the report-only sweep's server. Other levels stay report-only until their art lanes clear the backlog. */
if (take('visible-supports-strict')) results.push(run('visible-supports-strict', process.execPath, ['tools/visible-supports.mjs', 'scree', 'spire', '--strict'], { PORT: String(portFor(1)) }));
if (take('lab-order')) results.push(run('lab-order', process.execPath, ['tools/lab-order.mjs']));
/* THE PIXELS NEED THE PAGE: a headless Chrome on a port of its own, so a dev server left running from another checkout is never the one measured */
/* THE ROOKERY and THE SHRIEK SISTERS (claude/rookery, Node): the road and the old-save unlock, the five areas, every required cracked rock a LOCK, the hands in a fake world
   (bait, aim, dive, break; a dead roost sends another; the shrieker's mark), the sisters pure (B15 floors, the stun off a dive into cracked rock, the team changing) */
if (take('rookery')) results.push(run('rookery', process.execPath, ['tools/rookery.mjs']));
/* A FOE THE ROOM KILLS GOES DOWN (claude/flotilla4, Daniel 10-27 'dead foes stand there'): every common foe on the build killed by an untagged hurt, a blast and a round shot - dead, never alive at hp <= 0, and its body says how it goes down (c.fall; the common fall tips it onto its back) */
if (take('room-kills')) results.push(run('room-kills', process.execPath, ['tools/room-kills.mjs']));
/* THE POWDER MONKEY (claude/flotilla4, a shared foe: src/powder-monkey.js): small and quick, his told lob, the teach placed alone, struck back he goes down, a struck blast fires a deck gun and a keg */
if (take('powder-monkey')) results.push(run('powder-monkey', process.execPath, ['tools/powder-monkey.mjs']));
if (take('pixels')) results.push(run('pixels', process.execPath, ['tools/headless.mjs', 'floats'], { PORT: String(portFor(3)) }));
/* PLATFORM FEEL (claude/feelplatform, Daniel 10-12): the Game speed range + sub-steps + migration (feel-speed), and the camera lookahead, landings by height and the world's small reactions (feel-platform) */
/* THE PALISADE WOOD and THE BATTERING BEAST (claude/palisadewood, Node): the road and the old-save unlock, the five areas, every required prop a LOCK, the stake rolls, the shrines,
   the hands and the stake-setter in a fake world, the beast's openings / armour floor / ward / phase two / harness (its own line: the big list is edited by every lane) */
if (take('palisadewood')) results.push(run('palisadewood', process.execPath, ['tools/palisadewood.mjs']));
/* THE KITCHEN GATE and LORD GRUBBAG THE GLUTTON (claude/kitchengate, Node): the road and the old-save unlock, the five areas, every required machine a LOCK (each copper, great spit,
   tallow door and hook rail), a cold great spit no stair, the hands in a fake world (the roar, the steam, the turn, the trail to the door, the butcher, the pot, the pages), his B15 floors,
   the pie and the choke, the dishes, the phases, the poses (its own line: the big list is edited by every lane); and its page smoke */
if (take('kitchengate')) results.push(run('kitchengate', process.execPath, ['tools/kitchengate.mjs']));
if (take('kitchengate-probe')) results.push(run('kitchengate-probe', process.execPath, ['tools/kitchengate-probe.mjs'], { PORT: String(portFor(7)) }));
/* (claude/palisadeart, headless) THE ART PASS: the level hash is the greybox's, the TIMBER table lies on solid blocks, the setter / lantern-hand / maul crew wear their own sheets, every windup and release of the beast is its own baked frame, his body and card, the palisade ambient bed (its own line) */
if (take('palisadeart')) results.push(run('palisadeart', process.execPath, ['tools/palisadeart.mjs'], { PORT: String(portFor(6)) }));
if (take('feel-speed')) results.push(run('feel-speed', process.execPath, ['tools/feel-speed.mjs'], { PORT: String(portFor(4)) }));
if (take('feel-platform')) results.push(run('feel-platform', process.execPath, ['tools/feel-platform.mjs'], { PORT: String(portFor(5)) }));
/* THE SLOPES SWAP, PROVED IN THE PAGE (docs/slopes-integration.md §8.3). tools/slopes.mjs above proves the two movers equal in Node;
   this one drives the real knight over four shipped levels and compares every frame with the trace recorded before the swap. It is the
   check standing between the slopes work and the thirty levels that ship on the old mover, so it runs in the suite, not by hand. */
if (take('slopes-trace')) results.push(run('slopes-trace', process.execPath, ['tools/slopes-trace.mjs'], { PORT: String(portFor(7)) }));
/* THE WORDS FIT: every hint, the bestiary, the store, the talent trees, the pause menu and every hero's HUD, drawn and measured (tools/textfit.mjs;
   the talk pages of every level and the boss fights are the long run: node tools/textfit.mjs --strict) */
/* THE LEVEL TITLE CARD on every level (claude/storyremove): its own page, so the long textfit run's leftovers never slow it (~2 min alone) */
if (take('textfit-levelcard')) results.push(run('textfit-levelcard', process.execPath, ['tools/textfit.mjs', 'levelcard', '--strict'], { PORT: String(portFor(4)) }));
if (take('textfit')) results.push(run('textfit', process.execPath, ['tools/textfit.mjs', 'hints,bestiary,store,tree,menu,hud,worldplates,pick,opening,press,title,mapcard,death,results,card,practice,bossjump,bossselect,secrets,plates,bossfix,soundtest,whatsnew', '--strict'], { PORT: String(portFor(4)) }));
/* THE FULL WORDS RUN, UNSCOPED AND STRICT: every sign and NPC page of every level for every hero, every boss fight. ~8 min, so it has its
   own step and its own 10 minute budget (a hang is a FAIL by name, not a stalled release). It runs in the full gate only: a subset runs it
   when it is NAMED exactly ('textfit-full'), never because 'textfit' matched (Daniel, 2026-10-03: the strict run found what the scoped one cannot) */
if ((!WANT.length || WANT.includes('textfit-full')) && take('textfit-full')) {
  if (JOBS > 1) results.push({ name: 'textfit-full', cmd: process.execPath, args: ['tools/textfit.mjs', '--strict'], env: { PORT: String(portFor(5)) }, timeout: 600000 });
  else { const t0 = Date.now(), r = spawnSync(process.execPath, ['tools/textfit.mjs', '--strict'], { cwd: ROOT, encoding: 'utf8', timeout: 600000, env: { ...process.env, PORT: String(portFor(5)) } });
    const out = ((r.stdout || '') + (r.stderr || '')).trim().split(String.fromCharCode(10)), timedOut = r.error && r.error.code === 'ETIMEDOUT';
    live('textfit-full', r.status === 0 && !timedOut, Date.now() - t0);
    results.push({ name: 'textfit-full', ok: r.status === 0 && !timedOut, ms: Date.now() - t0, last: timedOut ? 'TIMED OUT after 10 min' : out[out.length - 1] || '', out }); }
} else if (WANT.length && !WANT.includes('textfit-full')) skipped++;
/* THE SOUND TEST'S LOCK, in the page (docs: a song unlocks on being heard in play, never by browsing the menu itself;
   sound effects are always open): tools/soundtest.mjs */
if (take('map-footer')) results.push(run('map-footer', process.execPath, ['tools/map-footer.mjs'], { PORT: String(portFor(9)) }));
if (take('soundtest')) results.push(run('soundtest', process.execPath, ['tools/soundtest.mjs'], { PORT: String(portFor(8)) }));
if (take('music-start')) results.push(run('music-start', process.execPath, ['tools/music-start.mjs'], { PORT: String(portFor(8)) }));
/* THE BOSS TRACK ARRIVES (claude/marsh3, Daniel 10-20: the Frog King played the synth arpeggio): cold into the Croaking Court on a 1.6 Mbit/s line, frogking plays within 15 s and the synth never fills the gap */
if (take('music-priority')) results.push(run('music-priority', process.execPath, ['tools/music-priority.mjs'], { PORT: String(portFor(8)) }));
/* THE LEGGING TUNNEL WITH REAL KEYS (claude/canal5, Daniel 10-06: "the raft didn't follow me... I couldn't get to the boss"): the boss heroes, a stray run
   (leaves her at every ledge and ladder, falls in, dies mid-tunnel) and a ride run each, from the summit to Jenny's arena. All seven heroes x 3 seeds by hand:
   node tools/canal-tunnel-route.mjs --seeds=3 */
if (take('canal-tunnel-route')) results.push(run('canal-tunnel-route', process.execPath, ['tools/canal-tunnel-route.mjs', '--heroes=knight,warden,pyro', '--seeds=2'], { PORT: String(portFor(6)) }));
if (!WANT.length && take('profile-cleanup')) results.push(run('profile-cleanup', process.execPath, ['tools/profile-cleanup.mjs']));   /* every way a tool can end leaves nothing in Temp */
if (!WANT.length && take('profile-leaks')) results.push(run('profile-leaks', process.execPath, ['tools/profile-sweep.mjs', '--kill-orphans', '--since', String(SUITE_T0), '--run', process.env.BRACKEN_RUN, '--check']));

if (JOBS > 1) results = await runPool(results, { ROOT, jobs: JOBS, maxBrowsers: MAX_BROWSERS, portFor, onDone: r => live(r.name, r.ok, r.ms) });

let failed = 0;
for (const r of results) { if (!r.ok) failed++; console.log((r.ok ? ' ok  ' : 'FAIL ') + r.name.padEnd(14) + ' ' + String(r.ms).padStart(6) + 'ms  ' + r.last.slice(0, 110)); }
/* A release reader takes the SECOND word of each ^FAIL line as the check name. Child output can itself begin FAIL,
   and a long check name can fill the old padding exactly; indent every diagnostic line and always leave a real separator
   before the time. Parallel hands print each check's WHOLE buffered answer here, one check at a time. */
for (const r of results) if (JOBS > 1 || !r.ok) { console.log('\n---- ' + r.name + ' ----'); console.log((JOBS > 1 ? r.out : r.out.slice(-30)).map(line => '  ' + line).join('\n')); }
console.log(failed ? '\n' + failed + ' check(s) failed.'
  : SUBSET ? '\n' + results.length + ' of ' + (results.length + skipped) + ' checks pass - ' + (SHARD ? 'SHARD ' + SHARD.join('/') : 'A SUBSET (' + WANT.join(', ') + ')') + ', NOT THE SUITE.'
      + '\nRun `npm run check` with no arguments before a commit that matters, and before any deploy.'
  : '\nall checks pass.');
process.exitCode = failed ? 1 : 0;



