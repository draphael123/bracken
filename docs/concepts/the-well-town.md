# THE WELL TOWN - CONCEPT (the desert-arc concept confirmed in Daniel's interview, 2026-10-01)
New-level process step 1, written down by the greybox lane (claude/welltown) from the original brief (`docs/briefs/well-town.md`) and the
desert-arc concept of 2026-10-01, which wins where the two differ. The greybox is `src/well-town.js`; the draft it grew from is
`src/draft/well-town.js` (still measured by `node tools/draft-level.mjs well-town`).

THEME: a whitewashed desert town where WATER IS CARRIED. You fill a skin at the wells (the only blue in the town) and spend it with your own
hands: POUR it on a mud-bricked door or a fire to open the way, or DRINK it to cure the sunstroke. Three sips - every sip is a choice.
PLACEMENT: `{ id: 'welltown', name: 'THE WELL TOWN', needs: 'caravan' }` (NOT the old brief's `'sunkencaravan'`). Desert sheet, the node after
THE SUNKEN CARAVAN; the arc's hub: THE WELL STORE (the desert's walk-in room, `shopWell`) is the node after it, and the town's MARKET SHRINE is a
shop while it is lit (the One Store's rule: buy at the map, a shop room or a lit shrine). Clearing it opens the road to THE RED GORGE.

THREE MECHANICS (each REQUIRED somewhere; the Kasbah exam combines them)
1. THE SKIN - fill (E at a well) / pour (E facing mud or fire) / drink (E with the sun on you). Taught at the gate (the first well in the open
   sun, an optional bricked house door with a water-skin inside); developed in the market (the bazaar's stall fire: pour it, or climb over
   the roof past its bowmen); REQUIRED in the mud quarter (two bricked lanes) and on the roost (the burning barricade under the parapet: no way
   round); twisted by the sun (on the roost the skin is drink AND pour: drink too much and you cannot open the way) and by the water-thieves.
2. THE GREAT WELL'S WINDLASS - the street past the well square is down (the rubble): strike the windlass and the bucket runs down the well
   with you on it into the cisterns; the bottom windlass winds it back up. The only way on (the set piece).
3. CLIMBING - the bazaar's posts, THE DOVECOTE (rungs up its middle: the only way up to the roofs), the roost's alley ladders, the dry
   cistern's ladder.
EXAM (the Kasbah): the last well held by two water-thieves under a bowman's ledge, then the Kasbah's bricked door and, behind it, a fire under
the gateway's lintel: two pours from a three-sip skin, in the open sun, under fire.

FOES (ranged present, role mix melee / ranged / runner; reuse first)
- REUSED: the CUTTHROAT (the caravan's bandit, melee: feint then cut) at the gate, in the bazaar, on the square, in the lanes and on the roofs;
  the SCORPION (the cisterns: cool and dark).
- RESKINNED SHOOTER: THE BANDIT BOWMAN - the archer's AI (draw, loose) on a man of the town (`archer` with `bandit: true`); on the gatehouse,
  the bazaar roof, the well-house, the balconies and the roost's perches - he shoots while you pour.
- THE ONE NEW FOE: THE WATER-THIEF (runner) - the cutthroat's proven AI RESKINNED in the wells' blue; his cut that lands opens your skin and he
  RUNS with the sip. Cut him down and the sip is back. He holds the wells.
- ELITE: THE OLD STINGER (the elite scorpion) holds the gate to the rungs up out of the cisterns.
- Every foe meets the rule: bandits hold the wells and the mud doors, thieves take water, bowmen punish standing still to pour.

ENCOUNTERS: 20 designed squads (two cutthroats on a floor, bowmen on a roof, a thief and a cutthroat under the bazaar, scorpions in the hall,
thieves at each well), none sprinkled.

SET PIECE - THE GREAT WELL (agency): the square's bandits and its bowman on the well-house; the player chooses when to strike the windlass and
ride, whether to fill at the well head first (a thief keeps it), and in the cisterns whether to cut through the sump's squad on the floor or
go ROUND over the pillars' caps (the gallery under the raised vault, 197-238: a ladder up, water-skin two at its end). THE RIDE IS CONTESTED
(claude/welltown-fix): when the bucket goes, the well head's thief and a square cutthroat come down the well after you, and the cistern's own
well is held by two scorpions. Nothing moves the bucket but a blow on a windlass. The exam's last well (448) is a DEEP WELL: strike its
windlass and its bucket winds up in 2 s, under the ledge bowman and two thieves, before you can fill.
THE SHADE PLAN (claude/welltown-fix, the review's P1): every fight stands in shade a prop casts - market awnings over the stair, the square,
the mud quarter's lanes and well, each roof (its bandits hold it) and the Kasbah street; the well-house roof is solid; the dovecote's inside is
shade. No open-sun walk on the route is longer than SUN.maxWalk (5 s); `tools/welltown.mjs` THE SUN holds it.

COLLECTIBLES (the themed key): four full WATER-SKINS (the gate house, the end of the cisterns' gallery, the dead street behind the rubble, the roost's
chimney ledge). The HUD counts them (WATER-SKINS n/4). Poured into THE DRY CISTERN under the Kasbah street (E at it), it fills and ITS VAULT
opens: the third silver and a purse of coins (no relic: Daniel 10-02, relics are leaving the game). Silvers: the bazaar roof walk, the dovecote's roof,
the vault.

BOSS - see THE WELL TOWN BOSS CHANGE below (the Bandit King of the greybox is now THE GANG LEADER, a mini; the boss is THE CISTERN QUEEN).

MUSIC: Daniel's pick, "Desert Calmness and Fighting (Orchestral)" by Dizzy Crow, CC0 (`audio/welltown.ogg`: its intro once, then its loop).
The Gang Leader plays the old King's synth theme ('banditking', `src/boss-music.js`); the Queen her own ('cisternqueen').
BACKDROP: its own (claude/welltown3-art: `src/redraw/welltown_backdrop.js`, domes, a minaret, the dovecote and the Kasbah on the skyline), and its own tile kit (`src/redraw/welltown_tiles.js`).

SIZE / RULES: 584 columns, 60 rows; five checkpoints (the market shrine, past the cistern's well, roof A outside the dovecote's window, the
courtyard door, the old well's head), one per ~115 route tiles, and a respawn refills the skin (Daniel 10-02); three silvers, no relic; one mini (THE GANG LEADER: Daniel's exception, 10-02); the level's own checks
`tools/welltown.mjs` and `tools/welltown-pilot.mjs`, and `level-quality` gates it.

PROCESS: concept (this page) -> Opus greybox (claude/welltown) -> reviewer against THE MAGE'S FOLLY -> fixes -> Sonnet art and music.
Nothing ships without Daniel's playtest.

THE WELL TOWN BOSS CHANGE (Daniel, 2026-10-02, after playing the greybox; copied here from the desert-arc concept brief, which is not in the repo)
- The Bandit King "feels like a mini" and is "way too easy". NEW BOSS: THE CISTERN QUEEN - a giant scorpion matriarch nested in the dry cistern
  (why the wells fail; the Old Stinger elite is her brood). P1 she burrows and strikes from the sand: flood her burrow (windlass / pour) -> she bursts
  out soaked and slow = a 3 s opening; P2 she climbs the well shaft, red-told tail sweeps on its walls; P3 the cistern floods and her brood pours in.
  Screen-filling silhouette, lit stinger.
- EXCEPTION to "no minis": the Bandit King becomes THE GANG LEADER, a MINI-BOSS: throws MOLOTOVS you can REFLECT (strike them back) to set him alight
  EASILY; TWO SWORDS (faster attacks); occasional DODGE; NO charge attack. He fights in the MARKET COURTYARD (where the King's arena was).
- Difficulty: new bosses target the human bot at 50-60%, plus Daniel's playtest gate (the bot over-rated the King at 71%).
- Well clarity: skin HUD (3 pips + 'E: FILL / POUR / DRINK'), glinting fillable wells, cracked dry walls and smouldering fires with a pour marker, a
  safe first lesson (the gate well + a wall, no foes), a pour-arc preview. With the art pass.
- CISTERN QUEEN MOVESET (Daniel: "she needs more attacks" -> expanded, 10-02):
  P1 SAND: Sand Strike (!! erupts from a bulging mound - roll off); Burrow Charge (!! dune wave ploughs at you - jump); Pincer Snap (! waist scissor -
  block); Snap-Snap-Lunge (! ! !! - roll the last); Tail Lance (!! stinger floor stab - jump); Sand Flick (! arcing stones - block/step out).
  OPEN: flood her burrow (pour on the mound / windlass) -> soaked 3 s.
  P2 WELL SHAFT: Venom Spit (! arc, poison puddle); Tail Sweep high/low (!! lit band - duck/jump); Drop Pounce (!! growing shadow); Skitter Ambush (!!
  from a side tunnel, dust trickle tells which); Wall Slam (!! rubble, ledge shadows); Stinger Pin (!! lunge - dodged, the stinger sticks briefly).
  OPEN: pour on the wall above her -> loses grip, on her back 3 s.
  P3 FLOOD: Wave Thrash (!! jump); Grab and Sting (!! strike the claw/mash or a heavy poison sting); Venom Bloom (!! claude/queen4, Daniel 10-07, for the old Death Roll: the stinger driven into the water, a green ring spreads and blooms - out of it or up on a ledge; the stinger exposed in the water meanwhile);
  Tidal Tail (!! venom-water whip - duck/get above). (The Brood Shield was cut 10-07: no add summons in her fight.)
  OPEN: a broken grab -> she rears flailing 3 s. ENRAGE < 15%: Snap-Snap-Sting into the Venom Bloom.
  ALWAYS: raised claws turn frontal hits outside openings (visible guard); venom stacks slow stamina regen; x0.05 chip + greed reprisal; mash bot 0/6;
  human bot 50-60%; screen-filling silhouette, lit stinger.

AS BUILT (claude/welltown3)
- THE GANG LEADER (`src/gang-leader.js`, a mini in the MARKET COURTYARD - the Well Square at the head of the market stair, 152-191, his wall at 151 shut behind you; moved from the Kasbah by claude/welltown-polish, Daniel 10-02. THE GREAT WELL's windlass stands in it and is FOULED until he falls. The Kasbah's courtyard (473-513) is the garrison's: two knives, a thief, a bowman on each of two ledges. A sixth checkpoint stands at the square's door, 147): DOUBLE CUT and CROSS CUT (! a
  shield turns them; his other blade guards while he cuts, so a blow from the front then is turned), THE WHIRL (!!), MOLOTOVS (!: strike one back and it
  flies home and sets him ALIGHT - open 3.2 s at x1.4, a fifth of him a burning at most, inside Daniel's third). He slips most blades while he stalks you
  and comes back with a RIPOSTE (!!); after each of his own blows he is OFF BALANCE (0.35 s, two clean cuts). No charge. The douse at the well is gone.
  He keeps the King's theme ('banditking', faster at half health).
- THE OLD WELL (515-527, checkpoint five at its head, two of her brood at its mouth) drops down a shaft into THE QUEEN'S CISTERN (`src/cistern-queen.js`
  stageCisternQueen): 528-567, fifteen rows high under the street, a stone LEDGE and rope ladder on each wall, a spring BASIN under each ledge, THE
  WINDLASS on the floor (it drops the shaft's great bucket into the sump), a grated SUMP under the shaft (deep water once she floods it). The way out
  (her east wall) opens on the cistern's old outflow and the level's gate.
- THE CISTERN QUEEN: all the moves above, by phase, every cycle a different order; her three openings (SOAKED, ON HER BACK, REARING) are 3.2 s at x1.9,
  one opening taking no more than 14% of her (about seven openings a fight). Her raised claws turn a frontal blow outside them (0); from behind, the
  global x0.05. Venom: a stack a sting/spit/lance/pin/tidal hit, each -25% stamina regen for 6 s (three at most). Her own synth theme ('cisternqueen':
  a low pulsing C# drone, scraping clicks, a hissing rising motif; ':p2' quicker and an octave up; ':p3' adds the surge and drips).
- Measured: human bot 7/12 = 58% on her, 4/6 on him; mash bot 0/6 on each; `tools/cistern-queen.mjs` holds the spec.

WELLTOWN POLISH (claude/welltown-polish): the Gang Leader moved to the market courtyard (above); the Cistern Queen's poses were hand-polished (lighter, thicker legs and claws, a rim light, a gradient-lit stinger, new told silhouettes: tail thrown back for the sweeps, arched forward and green for the spit and the tidal tail, a crouch for the lunge and the pounce); a VENOM ICON (`src/venom-hud.js`) shows a drop a stack under the stamina bar; the dead `bakeBanditKing` is gone from `src/redraw/welltown_art.js`.
