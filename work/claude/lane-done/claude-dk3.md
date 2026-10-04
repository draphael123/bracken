# claude/dk3 - THE DEATH KNIGHT, REBUILT FROM THE HERO'S KIT (Opus, 2026-10-04)

Brief: scratch/brief-dk3.md (Daniel 10-03: "his charge doesn't make sense... look at his kit"; "he shouldn't be invulnerable most of the
time, he should play like the player character"; interview: FULL DAMAGE, DEFENDS HIMSELF). Base: master 1dd5b181, then merged
origin/master 44c8e47d (batch64: the level-up card) and origin/claude/weight bb65aba7 (WEIGHT), and re-measured on top of both.

## What changed
- src/unburied-foes.js (updateBloodKnight, UNB.bk, drawBloodKnightWorld): every move is a named skill of the playable Death Knight
  (BK_KIT; the check asserts each name is in the hero's kit):
  - HIS GREATSWORD ! - a string of 1-3 cuts like the hero's combo (P1 lengths 1/2/2/3, P2 2/3/3); the last one is THE CLEAVE !.
  - THE CLEAVE ! - he commits it 0.32 s before it lands. Dodged after the commit, the blade sticks: open 1.5 s at x1.6 (as before).
  - THE PLANTED BLADE !! - the bolt fan (as before).
  - DEATH GRIP !! - a chain along the floor. Jump it or dodge through it; caught, you are dragged to his feet (not teleported) and cleaved.
  - BLOOD BOIL !! - a pool at your feet.
  - DEATH COIL ! - rises out of his hand, then seeks you. If it lands it HEALS him 40. A guard, a dodge or a blade stops it.
  - GRAVE TIDE !! (phase two) - hands come up out of the floor in a line toward you.
  - BLOOD WARD - its face stops a blow and FILLS (3 pips). FULL and struck again it BREAKS: he reels, open 1.8 s at x1.6. Left
    alone it pays out as BLOOD NOVA !!, bigger for each blow it kept. He raises it on his rotation, and when pressed (2+ blows outside an
    opening in about a second, 50%, 5 s cooldown).
  - THE PASSING (dodge) - he reads a heavy charged within 80 px (45%; 55% in P2), or the 2nd+ cut of your string / a cut from inside
    his guard (25%; 35% in P2). Cooldown 2.4 s (x0.8 in P2). He passes through you if there is floor past you, otherwise back off you,
    leaving a smear. Then a quick punish cut ! from where he lands.
  - SUMMON SKELETON (P1, one) / GRAVECALL (P2, up to three), never more than 3 standing. BLOOD SURGE !! at 60% and in P2's rotation.
  - Moves like the hero: walks 80 px/s (96 in P2; a hero runs ~92), holds 48 px off you (inside his reach, outside most heroes'), and
    backs off inside 30. In his reach he waits 0.3 s at most before he punishes.
  - THE GREATSWORD RUSH is deleted, with its tell, mark, frames and test.
  - B3: after each opening (stuck blade, broken ward) he raises a short GUARD: a ward that cannot break and has no nova, so he
    cannot be chain-locked.
- DAMAGE MODEL: src/boss-greed.js FULL_DAMAGE = { bloodknight } (it cites Daniel 10-03). chipped() is false for him, so every hero
  blow lands whole. His one immunity is the ward's face. OPEN_RULE still names his openings (stuck, reel), so the GREED REPRISAL
  still counts blows outside them. Nobody else is taken off the chip; tools/boss-greed.mjs asserts that.
- Art: the hero sprite at 1.5x, darkened (as before). Poses added from the hero's own kit: slide (THE PASSING), grip, boil, coil,
  tide, unholy (surge/nova), slump (wrench/reel). New floor marks: the cut's gold reach, the chain line, the boil ring, the coil and its
  tail, the tide's marks and hands, the ward's fill pips plus a green outline when full (grey when locked), the dodge smear.
- Words: his openings, the coil's heal, his dodge and the surge now show in the hint box (src/hint-lines.js SAY_LINES, read from
  BK_LINES). His tell names stay silent as before; the tells are carried by sound, the !/!! mark and the floor colour.
- Music: For the Black Lord (Ronhul Maggot, CC-BY 4.0) -> audio/blacklord.ogg (lowpass 9 kHz, loudness untouched -13.3 LUFS, loop
  82.5 s). Wired as arena.music 'blacklord'. Credited in MUSIC_CREDITS, MUSIC_NAMES (Sound Test), audio/CREDITS.txt, and the credits
  page CC_BY row. tools/boss-music.mjs asserts it.
- LEVEL FILE TOUCHED: src/unburied-field.js, one word (arena music 'deathknight' -> 'blacklord'). Nothing else in the level.
- src/lab.js: the boss lab's Death Knight branch was rewritten for the new kit. It reads each move ~250 ms late, holds the guard
  through a string, rolls the Cleave late (WEIGHT's roll is short and only safe early), jumps the chain, guards or dodges the coil,
  goes behind him for the tide, fills and breaks the ward, and steps out of nova/surge.
- main.js: unbC gives him heroWind (P.charge, P.atk, P.combo); the ward break gets a hitstop and burst; the bestiary line is rewritten.
- tools/deathknight-pilot.mjs (new, not in the suite): the human bot vs him at normal health, salts x heroes.

## Numbers (tools/deathknight-pilot.mjs, human bot, L27 even card spread, normal health, one life)
- Before (master, the chip): mash 0/6. The bot pilot was not re-run on the old boss (the chip boss is being replaced, not tuned).
- Pre-WEIGHT tuning (hp 2050): 9/18 = 50% (knight 5/6, warden 1/6, pyro 3/6), median win ~90 s.
- After merging master + WEIGHT the same boss went 0/18. Hero hp is 154 now (it was ~200) and the bot holds swings and rolls back.
  Retuned: hp first 1300, finally 1150, his blows about a seventh lighter, and the bot's Cleave roll made late.
- At hp 1300 that was 9/18 = 50% (knight 4/6, warden 1/6, pyro 4/6). Then two more WEIGHT commits landed (e1ce4523, e5387e1b: the bot rolls only in a tell's last 0.22 s) and it fell to 5/18 = 28%. hp 1100 gave 12/18, 1200 gave 8/18.
- FINAL (hp 1150, on master 44c8e47d + WEIGHT e5387e1b), 6 salts: **9/18 = 50%**. knight 3/6, warden 2/6, pyro 4/6. Median win 68.9 s (wins 53-73 s). Losses end with him on 1-36%.
  - Per fight he passes 0-6 times, sticks his blade 3-10 times, and has his ward broken 0-5 times.
- Mash bot (re-stamped by the bot: level, then boss): boss **0/6** (he is left on 96/96 vs the knight, 98/98 vs the warden, 80/84 vs the pyro, killing each in 25-34 s). Level: knight dies, warden dies, pyro ends on 1% with no death. The Barrow Rider mini now holds 0/6 as well, so mash-gate required its MASH_REPORT_ONLY entry to be removed (the list may only shrink).

## Checks run (named, not the suite)
green: unburied-fights (rewritten 4b: move list / no rush, damage model, strings, cleave/stuck, blade, grip, boil, coil heal, tide,
passing rate 20-80% and never always, pressed ward, raise/call cap, surge, both rotations, B3), boss-greed, boss-openings, boss-jump,
boss-fight-end, tells (--write), answer-tags, boss-music, hint-shown, audio-assets, deathknight-unlock, unburied, weak-bosses (WB_ONLY=dk),
goblin-lint, corpses, mash-gate and level-quality (after the re-stamp; unburied removed from MASH_REPORT_ONLY).
The new assertions fail on the old module: there is no BK_KIT, the rush is present, and a full ward did not break.

## UNVERIFIED
- Not looked at in a real browser by eye: the new poses (slide/coil/tide/unholy at 1.5x) and the new floor marks. Nobody has heard
  the track in game. No textfit run on the credits page: it gets a 4th CC-BY entry and fits on paper (y ~146 < 150).
  The unburied-art lane may add March of the Wizards as a 5th entry, which would overflow it.
- The median win is 69 s, a little short of the 90-120 s target.
- DANIEL'S PLAYTEST GATE: not passed yet. He ships live only after the bots pass; Daniel should still play him.

## QUESTIONS FOR DANIEL (recommendation first)
1. His health: 1150 (it was 950 when 19 blows in 20 were chipped). REC: keep 1150 for your playtest. Full damage is what makes him a
   duelist, and this is what puts the bot at 50% after WEIGHT. weak-bosses' "950" assert now holds 1150 + FULL_DAMAGE.
2. Dodge rate and speed. REC: as built - heavy read 45%/55% (P2), string read 25%/35%, 2.4 s cooldown, walk 80 (96 in P2). If he
   feels slippery, lower the string read first.
3. Raise in P1 or P2 only. REC: keep one SUMMON SKELETON in P1 (his wake and his rotation) and GRAVECALL in P2.
4. Warden 2/6 is the low hero (her deflect taps against his strings, his nova). REC: accept for the playtest. The other choice is to
   shorten his strings for everyone.
5. The tell words (HIS GREATSWORD: GUARD IT, etc.) are still silent, as they were. REC: keep them silent. The hint box would chatter
   every second; the openings/heal/dodge lines are shown.
