# THE LIT CHURCH — build brief (from the-lit-church-pitch.md, written up 2026-09-22; decisions marked PROPOSED are Daniel's to change)

## In one line
An optional cruciform church where LIGHT is the level: lit rooms make the clergy strong, dark ones let the crypt up, the
player lights three chapel lamps to open the rood screen (raising the danger with their own hands), priests re-light what
you snuff, and THE PALADIN fights on light. Clearing it sells the Paladin for ~800 coins beside his 10 silver.

## Placement and names (PROPOSED - pitch open question 1)
A road off WAYMEET on the inland sheet, opened by beating Waymeet's boss: `{ id: 'church', name: 'THE LIT CHURCH',
needs: 'waymeet' }`, appended to LEVELS. Rename Waymeet's `closedhelm` THE PALADIN -> THE CRUSADER (bestiary card,
BEAST_SHORT, the boss plate lines "THE PALADIN  THE WARD IS DOWN" / "... HIS OATH", the boss-rush entry, Waymeet signs);
the church's boss is THE PALADIN. Hero entry: `coinPrice: 800, coinNeeds: 'church'` on 'paladin'.

## The rule: LIGHT, two states, the switch in your hand
Every room is LIT or DARK (a room = a zone the level lists). Lit: priests heal x1.5, light bolts +30%, more of the
congregation awake. Dark: priests heal x0.5 and bolt weaker - and the crypt's tenants (haunts, boos, wights) come up into
it. LAMPS ('altarlamp'): lit with a carried flame (the game's lantern-carry: take a light off a burning lamp, 14 s), snuffed
with a blow. PRIESTS walk to a snuffed lamp in their room and re-light it (a 1.5 s rite, interruptible).

## The places (about 360 columns; the cross gives the verticality)
1. THE NAVE (the spine): pews to hop, pillars, the congregation; the ROOD SCREEN barred at the east end with three empty
   lamp sconces over it. Teaches lit/dark on one lamp.
2. THE NORTH TRANSEPT CHAPEL: LAMP ONE on its altar; a priest pair and chapel knights; the first "light it and they get
   stronger" beat.
3. THE ORGAN GALLERY (above the nave, from the north transept): climb the PIPES (ledges), the BELLOWS lift you (vents), and
   a held chord pushes you (a told gust across the gallery). LAMP TWO at the console.
4. THE CRYPT (below, from the south transept): the dark the church keeps down; ossuary shelves, a sealed-crypt ambush (the
   one ambush), a silver on a tomb. Its tenants are what the dark sends up everywhere else.
5. THE SOUTH TRANSEPT CHAPEL: LAMP THREE; the hardest lit room (priests + knights + acolytes), the way back to the nave.
6. THE SANCTUARY: behind the rood screen, lit by the three lamps you lit: THE PALADIN.
Landmarks: the rood screen, the organ's pipes, the crypt's ossuary, the rose window over the sanctuary.

## Enemies (PROPOSED - pitch open questions 2 and 3)
- THE PRIEST (new): light bolt (`!`, blockable), heal an ally (told, interruptible, no mark), RE-LIGHT a lamp (the real
  threat - kill him first). Lit/dark scales him.
- THE ACOLYTE (new, weak): carries a taper; relights faster than a priest but cannot fight - a runner to catch.
- Chapel knights: the existing swornsword and hedgeknight, as the priests' escort (PROPOSED yes).
- The crypt: the existing haunts, boos and wights (PROPOSED - no new crypt enemy).
Encounters of 3-5 round each room's lamp, quiet between; no even sprinkle (Daniel, 2026-09-22). ELITE: THE ARCHDEACON (a
priest captain whose heal reaches the whole room) in the south transept.

## THE PALADIN (boss) - the class's own economy, LIGHT
A light bar over him. Touch rule; one clear answer per attack.
- HIS AEGIS: blows into his guard feed his light (the class's trade).
- HAMMER CHAIN (`!`): the class's blows, a shield turns them. SHIELD BASH (`!`).
- MEND (no mark): spends light to heal (1.0 s, interruptible - a blow cuts it and he keeps the light spent).
- RADIANCE (red cross): spends light for columns on marked spots (3, shown first).
- JUDGEMENT (red cross, phase two): a leaping slam that lights the floor where he lands.
- THE OPENING (player-made): STARVE THE LIGHT - go round the aegis (bait, riposte, from behind) so no blow feeds him; with
  his bar empty he FALTERS (2.5 s, open, double). Hammering his guard all fight opens nothing (boss-openings.mjs: blows into
  the aegis -> no falter; blows round it until empty -> falter).
- THE LAMPS YOU LIT light his arena: snuff one mid-fight (standing in the open to do it) and his radiance shrinks; his
  priests come in to re-light them in phase two.
- Phase two (<50%): radiance in pairs, judgement, the priests' re-lighting - NOT faster tells.
Pilot >= 21 runs at normal health, 60-75%, randomness in his choices.

## Rules
GARRISON row (thin) + no blanket calm, ELITES row, checkpoints per place, 3 silvers, one ambush (the crypt), dead ends paid,
its OWN music (CC0, Daniel's go before download), `tools/lit-church.mjs` in check.mjs, route-breaks clean. The Crusader
rename lands with it. Size: two sessions (the church + light + priests; the Paladin + the unlock). No deploy without Daniel.
