# claude/archfix - BOTH ARCHMAGES, after Daniel played them (2026-09-29)

Branch `claude/archfix`, off master d78b15e (batch46), origin/master (batch47) merged in at the end with no conflicts.

## A. THE UNDEAD ARCHMAGE: the realm openings read on the screen (src/mage-realms.js, src/main.js)

Daniel: "these need to be more obvious". He was in the FIRE realm under the pillars and could not tell how to hurt him.

**A finding first.** The realm's teaching lines (`c.say`: "HIS REALM WARDS HIM: FIND ITS OPENING", "IT ROLLS BACK FOR YOU...", the realm's
name on the pull) went through `number()`, and `number()` drops every capitalised string that is not one of its MOVE_WORDS. None of them was
ever on the screen. The only teaching that reached the player was the bestiary card. Everything below is drawn directly, not through `number()`.

The mechanics and numbers are unchanged, except the ice homing (A2 below, Daniel's second round). No new blow; every blow is still told.

1. **A banner for each realm, every time.** The realm's name and its opening in Daniel's words:
   - FIRE: LET HIS FIRE WALL PASS, THEN PUT HIM BETWEEN YOU AND IT
   - ICE: STRIKE THE ICICLE ABOVE HIM
   - POISON: WHEN HE CASTS, STRIKE THE VENT

   It is a HUD band of its own (`drawRealmBanner`). It is not the hint box, so there is no 2-per-save cap and it does not wait for tells.
   It shows for 4.5 s (`REALM.cueLen`) each time you are pulled in, and for 2.5 s (`REALM.cueAgain`) after any blow his ward turns. Like the
   hint, it moves to the foot of the screen when the hero is up in its band.
2. **Cues in the world, at the moment they matter** (`realmCue` says what they are; `drawRealmFx` draws them):
   - **FIRE.** Coming BACK, the wall changes from red to white-hot gold, with chevrons on it pointing the way it runs. A dotted line runs
     from it to the first body in its road:
     - gold to him, with IT WILL BURN HIM, when you are behind him;
     - red to you, with IN ITS ROAD: DODGE THROUGH IT, when you are in the way.
   - **ICE.** The icicle over his shell pulses gold-white inside a flashing strike box, with STRIKE IT under it and a dotted line down to him.
   - **POISON.** The vent is DARK while he feeds: a shut black mouth with a slow seep. While the beam is cut it is LIT: gold, pulsing and
     ringed, with STRIKE THE VENT over it and a bar showing how long it stays lit.
3. **WARDED, never silent.** A blow his ward turns does four things:
   - plays a clang;
   - flares his ward in the realm's colour;
   - puts WARDED over him;
   - brings the banner back.

   The rest of the time a ring of his ward's runes turns round him, with WARDED dim at his feet, and his whole sprite is tinted cold grey.
4. **OPEN, unmistakable.** While he is open:
   - his whole sprite flashes gold;
   - he visibly burns (flames), shatters (the shell flies off in pieces) or chokes (green gas);
   - a bold OPEN x2 sits over him, with HE BURNS, HIS SHELL SHATTERS or HE CHOKES above it;
   - a bar under OPEN x2 shows the 3 s x2 window running out;
   - the banner turns to HE IS OPEN: STRIKE HIM, x2, with the same bar.

   A sting plays as he opens and a chime as the window shuts.

**A2. Daniel's second round (from the coordinator, same lane):**
- **ICE is easier.** An icicle struck within 40 px of his middle homes onto him as it falls (at 240 px/s). Its hit on him is 22 px either
  side of his middle; it was 16 px, and only an icicle directly over him counted. The icicle the cue marks is the nearest one within 40 px.
  With the icicles 60 px apart, one or two of them are usually "right".
- **The open state** is item 4 above: the sprite colour, the bold OPEN with its countdown bar, and the sting and the chime. The warded look is
  item 3 above.
- **The spiral stair and its brazier fire walls are untouched.**

## B. THE FOLLY ARCHMAGE (src/main.js, updateArchmage and ARCH)

1. **The book-stack rune is gone.** His ward is **3 plain runes standing round the room**. They are not on a stack and they do not circle
   him. The design:
   - Five posts, 120 px apart, start 90 px from the room's left wall (one of them is on his dais).
   - He wards on the three posts nearest him, so the runes span 240 px.
   - Each rune is 16 px over its floor, where a sword reaches it. A thread of light runs down from it to a ring on the floor, so it can be
     seen across the room.
   - The 6 s / 4 s reseal is unchanged.

   Removed cleanly:
   - `archStackRaise`, `archStackGone`, `archStackTick`, `archStackTop` and `archStackCells`;
   - `ARCH.stackH` and `ARCH.slide`;
   - the stack's drawing and the "sealed in the books" rune;
   - the two `archStackGone` call sites (his death, and the reset on the hero's death);
   - the stack branches of the reseal, the portal and the bot's advice;
   - the hint and the bestiary card.

   The **Rune Library's own book-stack rune puzzle is untouched**, and folly-library is green.
2. **He attacks faster.** The gaps between his casts are `ARCH.pace` = 0.83 of what they were, for the bolt (3.4 s), the rend (4.5 s), the
   pair and the room's attacks. No tell is shorter: bolt 0.8 s and rend 0.85 s, measured. Measured tell to tell, with the tells in, his
   bolts come every 4.18 s against 4.77 s on the base.
3. **He teleports round the room.**
   - He blinks every 4.8 s ± 0.5 s after he lands, which is every 5.0-5.7 s tell to tell (measured). Before, he only blinked when you were
     within 60 px of him.
   - He blinks in the duel and in the mirrors (stages 1 and 3). The rooms of stage 2 place him themselves.
   - He goes to six spots spread across the room (x0 +70 / 160 / 250 / 340 / 430 px and his dais); there were four before.
   - Where he will stand is chosen as `blinkTell` starts. A column of his light and an outline of him flash there for the whole 0.5 s tell,
     brightening as he comes.
   - The spot is never within 56 px of the hero. If the hero walks onto the flash during the tell, he lands 32 px beside it, on the side
     away from the hero, so never on the hero.
   - The mirror images blink with him, as today.
   - **Warded, he still blinks, but only among his runes** (within 40 px of their span). He then goes back into his ward, with its time
     kept. This keeps the last rune you cut from leaving him a room away while he is open for 2.6 s. The first after-pilot showed openings
     with no blow landed; after this fix every opening landed a blow.
   - The mark table keeps `archmage|blinkTell` (no mark).

## Numbers - bot pilots, 1 seed, BEFORE (d78b15e) / AFTER

The Undead Archmage (`STAIR=0 node tools/archmage-pilot.mjs 1 knight,warden,pyro`, REFILL health, 150 s cap):

| hero   | before                                   | after                                    |
|--------|------------------------------------------|------------------------------------------|
| knight | win 95.3 s, 9 openings, all 3 realm openings | win 89.6 s, 9 openings, all 3 realm openings |
| warden | win 137.4 s, 12 openings, all 3              | win 133.9 s, 13 openings, all 3              |
| pyro   | win 91.2 s, 9 openings, all 3                | win 108.5 s, 9 openings, all 3               |

The Folly Archmage (`node tools/folly-pilot.mjs 1 knight,warden,pyro`, NORMAL health, 240 s cap; the bot has never won him at normal health):

| hero   | before                                     | after (final)                                         |
|--------|--------------------------------------------|-------------------------------------------------------|
| knight | death 44.2 s, he had 66% left, 3 openings (1,1,1) | death 61.4 s, he had 66% left, 3 openings (1,1,1), 11 blinks |
| warden | death 51.4 s, he had 66% left, 4 openings         | death 40.4 s, he had 67% left, 3 openings, 8 blinks          |
| pyro   | death 38.4 s, he had 66% left, 3 openings         | death 35.4 s, he had 66% left, 2 openings, 6 blinks          |

The first AFTER run, before the warded-blink fix, had knight 73.5 s (openings 0,0,0,1), warden 122 s reaching THE MIRRORS with 16% left,
and pyro 43.7 s. The bot's advice now cuts the rune nearest him last (src/lab.js reads `mageAdvice`). The realm bot now strikes any icicle
within 30 px of him (src/lab.js).

## Checks

- **undead-realms, extended.** It asserts:
  - Daniel's words per realm, and a banner on entry that runs for its time and then goes;
  - WARDED and the cue come back on a warded blow;
  - the returning wall's road reads 'you' in its way and 'him' behind him;
  - the icicle cue, including one 26 px beside him that homes onto him and opens him;
  - the vent lit only while the beam is cut;
  - a sting on open and a chime at the close.

  In the page, for each realm:
  - the banner is drawn with its text (textRec);
  - WARDED is drawn after a warded blow;
  - the cue is drawn in the window;
  - open, `open:<mode>` is drawn with OPEN x2 and the open banner;
  - the sprite is tinted warded, then open.

  **RED on the base** ("fire: the realm does not name its opening in plain words").
- **archmage-folly, extended.** It asserts:
  - 3 plain runes, no stack rune, no stack;
  - the runes are reachable and spread at least 160 px, and they stay put;
  - no `archStack` or `stackH` in the code, and no stack on the bestiary card;
  - the count, the reseal and the opening;
  - a blink cadence of 4.4-7 s with at least 5 blinks in 34 s;
  - every blink told by `blinkTo` for its whole tell, landing on the flash;
  - never onto the hero, even one standing on the flash;
  - blink spots spread at least 300 px;
  - warded blinks among his runes;
  - pace between 0.8 and 0.85, with bolts tell to tell 3.6-4.25 s;
  - the bolt and rend tells unshortened.

  **RED on the base** with 14 fails.
- **Green on this branch:**
  - the 7 required checks: architecture, checkpoints, skins, dangling-paths, boss-fight-end (45 fights), slopes-trace (unchanged, no
    rebase), npc-removal;
  - undead-realms, archmage-folly, tower-chase, tower-ascent, folly-runtime, folly-library;
  - boss-openings, tells (607 rows after the merge), untold-told, boss-jump (all 45), textfit.

  After the merge of origin/master I re-ran tells, undead-realms, archmage-folly, folly-runtime, folly-library, tower-ascent,
  dangling-paths, architecture, checkpoints, npc-removal and skins; all are green.
- Pictures: `node tools/realm-shots.mjs <dir>` now also renders:
  - each realm's banner;
  - the ice cue;
  - a warded blow;
  - each realm's open state.

## UNVERIFIED

- No hands on either fight.
- The Folly bot has never won him at normal health, before or after, so the pilots measure survival, not a win.
- The Folly rune posts depend on where he stands. Near the dais, the posts are x0+330 / 450 / 570 (the last one is on the dais); I checked
  that this set is reachable only by the rule (16 px over the dais top), not in a run.
- I did not look at co-op.

## QUESTIONS FOR DANIEL (the recommendation is built in each case)

1. **Does the Rune Library's book-stack rune stay, now that the boss has none?** Recommendation: keep it. It is the library's own timed
   puzzle and folly-library holds it; built: kept.
2. **The Folly ward: 3 runes standing round the room** (built), or orbiting him as before the stack? Recommendation: standing. With him
   blinking every ~5 s, runes that follow him would be a chase. The room is walked instead, 240 px end to end, inside the 4 s reseal.
3. **He blinks while warded, but only among his runes** (built). The other option is no blink while warded, which leaves 22 s of him
   standing still. Recommendation: keep.
4. **"Casts 17% faster" is on the gaps, not tell to tell.** The idle gaps are x0.83; tell to tell, a bolt comes 12% sooner (4.77 s to
   4.18 s), because the tells keep their length. If he still feels slow, 0.76 on the gaps makes it 17% tell to tell.
5. **Stage 2 (the rooms) keeps its own placement, with no periodic blink** (built). Recommendation: keep; each room puts him where its way
   through leads.
6. **The realm lines that `number()` drops** (see "A finding first" in A). I replaced them with the banner and the drawn cues rather than
   add them to MOVE_WORDS, since that list is shared by every foe. Other bosses may have the same silent sentences; worth a sweep?
   Recommendation: yes, a small lane.
7. **The ice homing range, 40 px** (about two and a half tiles, measured from his middle). Tighter if it now reads as too easy?
   Recommendation: keep.
