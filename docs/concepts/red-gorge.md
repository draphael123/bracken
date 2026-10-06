# THE RED GORGE - CONCEPT (the desert-arc concept confirmed in Daniel's interview, 2026-10-01)

New-level process step 1, written down by the greybox lane (claude/redgorge) from the older brief (`docs/briefs/red-gorge.md`) and the
desert-arc concept of 2026-10-01, which wins where the two differ. The greybox is `src/red-gorge.js`. The draft it grew from is
`src/draft/red-gorge.js`, which `node tools/draft-level.mjs red-gorge` still measures.

## What the desert-arc concept says about the gorge (copied here from the confirmed concept, which lives outside the repo)

- Order on the main road: caravan > welltown > **redgorge** > glasssea (> suntemple, optional) > buriedcity > sealedpyramid > kingspyramid.
- Every level goes concept -> Opus greybox (from the draft) -> reviewer vs THE MAGE'S FOLLY -> fixes -> Sonnet art and music. Level-quality gates it.
- RANGED: one RESKINNED shooter per level from a proven ranged AI, placed to hit you while you handle the level's rule. For L3 that means
  **bandit slingers on the gorge ledges**.
- NEW FOES: at most ONE new type per level. The gorge's signature is the **raptor**. The rest are reskins of proven AIs. Role mix >= 3.
- COLLECTIBLES UNLOCK, with a themed key per level and a HUD line that says what it opens. Each vault holds a silver (relics cut 10-02). For L3:
  **feathers -> the nest vault**.
- MUSIC: a unique downloaded CC0 track per level (Daniel gives the go before each download, all in one batch). Bosses get synth themes composed in code.
- BOSSES: one per level, NO MINIS. L3 gets a **NEW GROUND BOSS (not the Roc - THE SKY ROAD KEEPS THE ROC) tied to the flood**, "e.g. a giant
  canyon crab / sluice warden the flood washes off its perch = the opening". The boss lessons apply.

## The concept page

    # THE RED GORGE - CONCEPT
    THEME:        a canyon whose channel floods on a clock. The horn says when; a sluice gate holds a flood back, and lets it go when you say.
                  You climb between floods, you hold one to cross dry, and you release one on what is in its way.
    PLACEMENT:    `{ id: 'redgorge', name: 'THE RED GORGE', needs: 'welltown' }`, desert arc level 3, the map node after THE WELL TOWN at
                  (136,120) (docs/briefs/map-redesign.md 4.1). Clearing it opens the road on to THE GLASS SEA (not built yet).
    THREE MECHANICS (each REQUIRED somewhere; the narrows' exam combines them)
      1. THE FLOOD. One clock: dry 6 s, the HORN 2 s (a trickle down the channel, the HUD's HORN), the TORRENT 2.4 s. A hero in the channel is
         swept down through the bridge and hurt.
         TAUGHT on the gorge floor, where the channel crosses the floor at the start. DEVELOPED on the falls' face: a 17-row rope IN the channel,
         raced against the clock. TWISTED by the baskets. EXAMINED in the narrows. Every section ends on a rope bridge across the channel,
         because an overhang caps each climbing side.
      2. THE SLUICE GATE (E at its wheel). Shut, it HOLDS the next flood and the channel under it stays dry. Held, E RELEASES it: a burst down
         the channel below, at once. Only a released burst washes out a JAM, and only a released burst throws THE GREAT RED CRAB.
         TAUGHT at the falls, where it is optional: shut it and the falls' rope is dry. REQUIRED at THE JAM, which seals bridge four: shut,
         bank, release. EXAMINED in the narrows: hold the next flood off the rope. TWISTED into the boss's opening.
      3. THE BASKETS. A water-wheel at the channel's lip winds a basket up its shaft while water runs past it. The flood is the only lift up
         a sheer face. TAUGHT on the gorge floor, where it is optional (a silver). REQUIRED on the raptor ledges. EXAMINED in the narrows, where
         its gate must be OPEN so the basket can ride.
    THE EXAM (THE NARROWS): ride the basket up on a flood with the narrows' gate open, then shut that gate from the wheel at the top, wait for
                  the next horn to bank behind it, and climb the 16-row rope in the channel while a raptor stoops and a slinger throws. You
                  can also race the clock without the gate.
    FOES          (ranged present; role mix melee / ranged / runner; reuse first)
                  - REUSED: the CUTTHROAT (the caravan's bandit, melee: a feint, then a cut). They hold the floor, the basket's top, the cave
                    ledges and the summit.
                  - REUSED: the SCORPION (melee: a claw ! and a sting X). Plus THE FALLS' KEEPER, an elite scorpion that holds the gate to
                    the falls' foot.
                  - THE RESKINNED SHOOTER: the SLINGER (the caravan's slinger AI: a marked arc). He stands on the lips across the channel
                    and throws at you while you climb, ride or wait at a wheel.
                  - THE ONE NEW FOE: THE CLIFF RAPTOR (runner). It is the vulture's proven marked dive, reskinned. It keeps one bridge:
                    it hunts only a hero within ~9 rows of that bridge, and it stoops at you on the bridges, the basket and the ropes.
                  - Every foe meets the rule. Slingers punish waiting for a flood. Raptors strike where a flood is coming. A bandit on a
                    bridge in the channel is taken by the flood, and a release can wash him off.
    ENCOUNTERS    designed, nothing sprinkled:
                  - the mouth's two knives across the first crossing
                  - a slinger on each lip (mouth, falls, jam, narrows, summit)
                  - the falls' keeper at the rope's foot
                  - two knives waiting at the basket's top
                  - raptors over the basket shaft, bridge three, the narrows' rope and the summit
                  - the cave ledges' pair
                  - the summit pair
    SET PIECE     THE JAM. Agency: you choose when to shut its gate and when to release, under the jam-lip slinger. The burst also takes
                  any bandit on the bridge. Nothing moves the jam but your release.
    COLLECTIBLES  four RAPTOR FEATHERS (the falls' west nest, the nest pocket under bridge three, the Cave of Hands, the narrows' east
                  shelf). The HUD counts them (FEATHERS n/4). Laid in THE OLD NEST (E), they open its vault: a silver (THE RAPTOR'S
                  PLUME relic is CUT: Daniel 10-02, relics are cut game-wide; the four-feather vault pays ONE SILVER).
                  Silvers: the mouth basket's ledge, the Cave of Hands, the vault.
    BOSS          THE GREAT RED CRAB, on the old dam's plateau east of the summit. The old spillway's channel runs through it, its
                  gate high in the back cliff, a wheel each side.
                  His blows (the desert engine): THE PINCH (!), THE CRUSH (X, low), THE BOULDER (X, a red mark where you stand),
                  THE SCUTTLE (X, low and fast to where you stood; he digs in at its end).
                  THE OPENING (caused, told, >= 3 s): shut the gate, let a flood bank, and release it while he is IN the channel. He goes
                  on his back for 4.0 s (3.5 until the fix lane's pilot), and blows land x1.6. A natural flood never does it: he walks out at the horn. A release with him
                  out of the channel is water wasted. x0.05 chip otherwise (the global rule, src/boss-greed.js).
                  He always fights, and every pass of his chain is a new order.
                  PHASE TWO (half): the floods come faster, two boulders at once, and he will not walk into the channel while the gate
                  holds water. Only his scuttle carries him in: stand in the channel, make him scuttle, jump him, and run for a wheel.
                  Pilot target: human bot (~250 ms) 60-75% with knight, warden and pyro; the mash bot loses 0/6.
    MUSIC         PLACEHOLDER: the level plays THE SUNKEN CARAVAN's track until Daniel picks its own file (one batch, his go). The crab
                  has a synth theme of his own ('gorgecrab', src/boss-music.js), also a placeholder for a composed one.
    BACKDROP      the caravan's desert sky and mesas for now. The art lane gives it red-rock walls in strata, the channel's scoured pale
                  rock, the flotsam, the rope bridges, nests on the outer shelves, the Cave of Hands' painted hands, and the old dam.
    SIZE / RULES  96 x 170 (the gorge is 48 wide; the plateau east of its head). Six sections. The whole gorge is in the canyon's shadow
                  (no sun damage: a shade plan from the start). Two checkpoints (the terrace, the dam's door). Three silvers (no relic: cut 10-02).
                  No mini. Its own checks: tools/redgorge.mjs (node) and tools/redgorge-probe.mjs (page). The boss pilot is
                  tools/redgorge-pilot.mjs. level-quality gates it.
    PROCESS       concept (this page) -> Opus greybox (claude/redgorge) -> reviewer against THE MAGE'S FOLLY -> fixes -> Sonnet art and
                  music. Nothing ships without Daniel's playtest.

## RED GORGE 2 (claude/redgorge2, the Opus greybox, 2026-10-06) - brief: scratch/brief-raptormatriarch.md
    THE BOSS      THE RAPTOR MATRIARCH, "OLD PLUME" (src/raptor-matriarch.js pure + src/raptor-matriarch-hands.js) replaces THE GREAT RED CRAB,
                  who is BENCHED intact (src/gorge-crab.js, his art, his OPEN_RULE row and theme kept; unplaced). Her nest ledge is the old
                  dam's spillway: banks either end, three NARROW and two BROAD pillars two rows over the channel, a sluice lever on each bank,
                  two rope bridges. P1 pounce / rake / tail / scree / screech; the flood opening (a burst catches her in the channel, the
                  nearest pillar, a narrow one throws her). P2 (60%) the walls: wall run, dive at her shadow's mark (stuns her), bridge perch
                  (strike the post: tangled), feather volley. P3 (25%) the dam cracks: the pillar tops, pounce chains (a narrow landing staggers
                  her), the debris surge. A beast duelist (B11): always hittable, guards by angle; a told 3 s ward after every opening.
    THE RAPIDS    a new first section on the river under the canyon wall (start on the east bank): stone to stone, drifting timbers
                  (movers) over the reaches too wide to jump, faster in the horn's rapids; a fall in hurts and hands you back to the last
                  rock (L.waterHurts); raptors stoop at your spot and a stoop over the water knocks you in.
    THE CLIMB     up the canyon wall to the gorge's mouth: ledges under told rockfalls, a wall rope with a rock down it, THE SPILL CHUTE
                  (the gorge's flood comes down it; its basket rides the flood), told gusts over the chute at the top.

### RED GORGE 2 FIX PASS (claude/redgorge2, 2026-10-06)
- THE RULE LINE: "AT THE HORN THE FLOOD COMES DOWN THE GORGE AND THE RIVER RUNS WILD. A SHUT GATE HOLDS IT; LET IT GO TO BREAK WHAT BLOCKS YOU."
  The horn also turns the Rapids' calm to white water and runs the Spill Chute, so the first horn is told on the Rapids' first stone and on the chute's sign.
- A third checkpoint at the Climb's top (the gorge's mouth, col 46 row 165). The gust ledges have a sign and a glint + nudge; the Matriarch's two levers glint while a sluice is full.
- The Matriarch: pounce/dive marks 18 px; an out-of-reach rake or sweep closes in once then kicks scree (phase one); the walls' first pass is run + dive only;
  a volley off the wall ends in a beat; the knight's shield trip and the warden's low poke go UNDER her talons. See work/claude/lane-done/claude-redgorge2.md.
