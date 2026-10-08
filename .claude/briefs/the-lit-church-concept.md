# THE LIT CHURCH + THE PALADIN - CONCEPT (approved by Daniel in interview, 2026-10-01)
Supersedes the open "PROPOSED" items in the-lit-church.md; that brief still holds the detail. New-level process step 1.

THEME: an optional cruciform church where LIGHT is the level. Lit rooms make the clergy strong; dark rooms let the
crypt's dead up. You raise the danger with your own hands to open the way.
PLACEMENT: `{ id: 'church', name: 'THE LIT CHURCH', needs: 'waymeet' }` - optional spur off Waymeet (inland sheet).
Waymeet's closedhelm boss is renamed THE CRUSADER (bestiary, BEAST_SHORT, plate lines, boss rush, signs).
UNLOCK: clearing it sells the Paladin hero for 800 coins (`coinPrice: 800, coinNeeds: 'church'`), beside his 10 silver.

THREE MECHANICS (each REQUIRED somewhere; combined in the south-transept exam)
1. LIGHT - lamps lit with a carried flame (14 s) / snuffed with a blow. Lit: priests heal x1.5, bolts +30%.
   Dark: priests weaker, haunts/boos/wights rise into the room. Three chapel lamps open the rood screen.
2. ORGAN GALLERY - climb the pipes, bellows lift you, a held chord = a told gust across the gallery. Lamp two.
3. CRYPT - the dark the church keeps down; snuffing is a trade (weaker priests, more dead). Sealed-crypt ambush.

FOES (ranged + role mix covered; reuse first)
- PRIEST = an existing caster AI RESKINNED + heal (told, interruptible) + RE-LIGHT (1.5 s rite). Light bolt = ranged role.
- ACOLYTE = the ONE new foe: taper runner, relights faster, can't fight - a runner to catch.
- Escorts: swornsword + hedgeknight (reused). Crypt: haunts, boos, wights (reused).
- ELITE: THE ARCHDEACON (priest captain, room-wide heal), south transept.
- Encounters of 3-5 round each lamp, quiet between; no even sprinkle. Every foe interacts with light.

SET PIECE - THE DARK RISES (agency): lighting lamp three cracks the crypt; the dark floods up the nave behind you.
Carry a flame back to the rood screen choosing which sconces to light: each lit sconce holds the dead back but
wakes priests. Pays off the light rule; nothing resolves itself.

COLLECTIBLES: hidden CANDLE STUBS (~5) each light a side-altar candle; all lit opens the RELIQUARY behind the altar
= a RELIC + a shortcut. HUD names what they're for. 3 silvers separate.

BOSS - THE PALADIN (in the sanctuary, lit by the lamps you lit)
Light bar over him (visible, drains with clear feedback). Aegis: blows into his guard FEED his light. Hammer chain (!),
shield bash (!), MEND (no mark, 1.0 s, interruptible - light stays spent), RADIANCE columns (red cross, 3 marked spots).
Phase 2 (<50%): radiance pairs, JUDGEMENT leap slam lighting the floor, priests come to re-light the arena lamps.
OPENING = STARVE THE LIGHT: go round the aegis (bait, riposte, behind) until the bar is empty -> FALTER 3.0 s, full
damage; hammering his guard opens nothing. Snuffing an arena lamp (standing in the open) shrinks his radiance.
Puppeteer lessons: he always fights, every cycle changes, x0.05 chip otherwise, human bot (~250 ms), readability first.
Pilots >= 21 runs, 60-75% human-bot win rate.

MUSIC: own synth 'litchurch' (pipe organ + plainchant drone; dark rooms add a low choir); boss 'paladin' = the same
theme as a march. No downloads.
BACKDROP: nave vaults; ROSE WINDOW that brightens as lamps light; moonlit graveyard through the windows; crypt in
cold blue.

SIZE/RULES: ~360 cols cruciform (nave spine, transepts, gallery up, crypt down); checkpoints per the 200-route-tile
rule (~3, fewer is fine); 3 silvers; one ambush (crypt); no walk-right opener; signs never spoil; slopes draw;
level-quality gated; LEVEL-1 NO-ABILITY pilot must take real damage; tools/lit-church.mjs in check.mjs.
PROCESS: Opus greybox -> reviewer vs Mage's Folly -> fixes -> Sonnet art/music. Paladin boss = Opus lane alongside.
SCHEDULE: build after FAIRFIX2 + the canal land (not today). Worktrees bracken-church / bracken-paladinboss to be
recreated off master.

## SETTLED 2026-10-07 (Daniel, the coordinator's HANDOFF 12:30 / 12:55 / 13:00) - these supersede the lines above where they differ
- STRUCTURE (approved as presented): cruciform - graveyard / west door TEACH -> nave + north transept TEST -> ORGAN GALLERY (bellows + chord gust: KEPT)
  -> crypt -> THE DARK RISES -> south transept EXAM with THE ARCHDEACON elite (KEPT) -> sanctuary: THE PALADIN.
- THE RELIQUARY pays a SILVER and opens a SHORTCUT (no relic). Built to difficulty v2 (scratch/brief-levelsweep.md).
- THE PALADIN is a B11 DUELIST (always hittable, guards by angle, NOT the x0.05 chip) with a LIGHT BAR; 'starve the light' -> a 3 s FALTER is the big
  told opening; an anti-spam ward after it; one new move per phase. New boss: human bot 50-60% dry, mash 0/6, Daniel's playtest gate.
- THE ROAD: an OPTIONAL SPLIT PATH - the church's fork stands at the start of THE TOWPATH (its lychgate: the hill path to the church, the river path to
  the canal). Until the Towpath lands the church hangs off WAYMEET (src/lit-church.js FORK names the hook for the integrator).
- Waymeet's boss is renamed THE CRUSADER (names and strings only). Clearing the church sells the Paladin hero for 800 coins.
- Built by claude/litchurch (2026-10-08): src/lit-church.js, src/lit-church-hands.js, src/paladin-boss.js, src/paladin-boss-hands.js, tools/lit-church.mjs;
  the lane report is work/claude/lane-done/claude-litchurch.md.
