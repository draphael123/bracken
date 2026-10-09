# THE DEATHLESS COURT - concept (APPROVED by Daniel 2026-10-02, all recs except names)
(gitignored brief - the build lane COMMITS this to docs/concepts/the-deathless-court.md)

Road: MAIN ROAD, Burial Caverns -> THE DEATHLESS COURT -> Witchlight Stair (needs 'burial'; witchlight then needs
'deathlesscourt'). Map: between burial (130,82) and witchlight (170,66); must pass tools/map-spacing.mjs.
Build: next week's main-road push (opus greybox -> reviewer vs Mage's Folly -> fixes -> art).

Premise: an undead CASTLE - a ruined, sunken keep where a dead king's court still holds its feast. Flesh and bone:
skeletons, zombies, undead knights, undead archers. (Distinct from THE HOLLOW MANOR = ghosts/possessed armour, from
HIGHCROWN = a living castle, from the LIT CHURCH = light + crypt.)

## THE RULE: THE DEAD GET BACK UP
Skeletons + undead knights fall into a BONE PILE that re-forms in ~6 s unless FINISHED: plunge/stomp the skull (uses
the combat3 plunge + up-slash verbs), knock the pile into the moat / a pit / a fire, or drop two near together.
Zombies stay down (slow, tanky, grab, hold doors). The boss is this rule's EXAM.

## SECTIONS (teach -> develop -> twist -> exam)
1. THE BONE MOAT + DRAWBRIDGE - teach: one skeleton re-forms; finish it. Winch the drawbridge under gatehouse archers.
2. THE GATEHOUSE - portcullis winches (raise one, another drops), murder holes, a zombie holding a door.
3. THE RAMPARTS - undead archers in arrow slits; knights knocked off the wall can't re-form.
4. THE GREAT HALL - SET PIECE "THE COURT RISES": the dead court frozen at its feast; take the jewel off the table and
   the hall rises - finish in pairs, drop the chandeliers onto the piles.
5. THE CHAPEL + OSSUARY - twist: bones re-form FASTER here; fight moving.
6. THE CRYPT -> THRONE ROOM - exam (everything at once) -> the throne room doors.

FOES: reuse bonearcher, zombie, wight, and bonegob skeleton goblins where they fit (Daniel: undead goblins are fine -
the no-goblins rule is for LIVING goblins). ONE NEW FOE:
THE DEATHLESS KNIGHT (shield, re-forms; the level's main threat). Ranged present; role mix.
COLLECTIBLES: the royal WEDDING RINGS / seals -> the royal vault + its relic (HUD says what they unlock).
MUSIC: a downloaded CC0/CC-BY level track (Daniel picks; search first, nothing downloaded until he picks) + a SYNTH
boss DUET in src/boss-music.js: King = low brass motif, Queen = strings motif; they merge in TILL DEATH.

## THE BOSS: THE DEAD KING + THE DEAD QUEEN (unnamed - title cards as written)
Arena: a tight one-room throne room, two thrones.
- THE DEAD KING: big, fat, slow MACE. Told slams + shockwaves, armoured. OPENING: a missed slam sticks the mace in the
  floor (3 s).
- THE DEAD QUEEN: SWORD + SHIELD, fast; lunges, blocks from the front, flanks while he pins. OPENING: guard broken by a
  held heavy, or baited lunge into a wall (3 s).
- ONE SPLIT HEALTH BAR: her half / his half, colour-coded + named.
- TILL DEATH RULE: when one falls, the survivor RAISES them - an 8 s timer shown on the bar, the survivor rages. Kill the
  survivor inside the window and both stay down. Miss it: the fallen one rises with HALF of their bar.
- Both down -> they FUSE: TILL DEATH (title card), one body, two heads, mace + sword + shield combined; short phase;
  its own told opening.
- combat3 rules: x0.05 chip outside openings (OPEN_RULE rows), greed reprisal, openings >= 3 s, mash bot must LOSE 0/6,
  human-speed bot 60-75%.
- vs the DEMON CITY duo (booked; winged duelist + bloated brute, kill-order relic): keep distinct - here the twist is
  the REVIVE WINDOW + FUSION; the demon duo keeps "survivor absorbs the fallen" + the kill-order relic.
