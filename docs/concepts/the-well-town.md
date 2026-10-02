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

BOSS - THE BANDIT KING (the Kasbah courtyard, 40 tiles, the courtyard well in the middle, two troughs a row up)
His moves are the desert engine's (`src/desert-bosses.js` BANDIT_KING): SCIMITAR SWEEP (!), KNIFE FAN (!), OIL JAR (a red mark where you
stand, then a burning patch), THE CHARGE (red, shoulder first). THE OPENING IS CAUSED BY THE LEVEL'S VERB: he walks through his own fire and
BURNS; pour your skin on him while he burns and the steam blinds him - OPEN for 3.0 s at x2.6 (tuned with the human-bot pilot: 15/21 = 71%). A pour while he does not burn runs off him.
x0.05 chip otherwise (the global rule: A SCRATCH: WAIT FOR HIS OPENING). He always fights; EVERY CYCLE CHANGES (each pass of his chain is a new order: jar first, knives
first with a charge after the jar, a charge into a jar). PHASE TWO (half health): two jars at once, and THE LIEUTENANTS - two cutthroats take
the courtyard well (win it back to refill). The trough fire of the old brief is NOT built (Daniel: no). Pilot target: the human bot (~250 ms) wins 60-75% with knight, warden, pyromancer; the mash bot loses.

MUSIC: Daniel's pick, "Desert Calmness and Fighting (Orchestral)" by Dizzy Crow, CC0 (`audio/welltown.ogg`: its intro once, then its loop).
The boss plays his own synth theme ('banditking', `src/boss-music.js`): 6/8 war drums, a Phrygian-dominant drone, a zurna; faster in phase two.
BACKDROP: the caravan's sky and far ruins for now; the art lane gives it whitewash, blue doors, the wells' blue, the dovecote and the Kasbah.

SIZE / RULES: 522 columns, 44 rows; four checkpoints (the market shrine, past the cistern's well, roof A outside the dovecote's window, the
courtyard door), one per ~128 route tiles, and a respawn refills the skin (Daniel 10-02); three silvers and one relic; no mini (desert concept: one boss per level, no minis); the level's own checks
`tools/welltown.mjs` and `tools/welltown-pilot.mjs`, and `level-quality` gates it.

PROCESS: concept (this page) -> Opus greybox (claude/welltown) -> reviewer against THE MAGE'S FOLLY -> fixes -> Sonnet art and music.
Nothing ships without Daniel's playtest.
