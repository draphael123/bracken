# claude/moorpyro - THE WINDCALLER: the Pyromancer gets a verb that opens him (opus, small)

Base origin/claude/batch110 ca5c839e (carries curvec4a's moor bot fix). Daniel 10-21: the pyro could not dent him (0/12) -> give her a told verb, plus
CALLER_BLAST_TELL 0.75 -> 1.0 s. Profile human WITH flasks (kit), campaign level L10, practiced, Normal; PORT 8783.

## THE VERB: FIRE SENDS HIS BOLT HOME (src/main.js burnBoltHome, src/ember-ward.js catchSeeds)
- Her FLARE (down held still ~0.3 s - her guard/parry, src/ember-ward.js) that catches his bolt no longer melts it: the bolt is set alight and
  flies back at him (orange bolt, orange trail, the word BURNED BACK). Her EMBER (tap C) or the bellows meeting his bolt in the air does the same.
- A burning bolt is never turned TOO FAR (the struck/blocked bolt still must be sent back up close): it lands from ANY range. Warded, he still turns it (B3).
- It lands as the SMALL fall (CALLER_FALL 3.4 s, 16% cap) with "HIS BOLT BURNS HOME: HE FALLS - CUT HIM", and as a fire blow of CALLER_BURN_DMG = 60
  (x CALLER_OPEN_MUL = 120, ~10% of him) - she is usually far off when it lands, so the bolt itself is most of what she earns. The bolt blocked/struck
  back beside him stays the BIG fall (the bigger prize for the climbers).
- Told: as he wakes a pyro is told "YOUR FIRE SENDS HIS BOLT HOME" (hint box); bestiary adds "and fire sends one home from anywhere".
- Scope: pyro-only (fire), only his bolts (s.owner.t === 'windcaller'): the shaman/gobmage/priest bolts are untouched. RANGER/GEOMANCER: NOT given it -
  arrows/stones are not fire, the ranger already has ARROW SNATCH and the geomancer's walls stop shots; see Q2.
- B15 intact: CALLER_GUARD 0.4 unchanged, nothing made him invulnerable; the verb only adds an opening.

## OTHER CHANGES
- CALLER_BLAST_TELL 0.75 -> 1.0 s (longer tell, same 22 blow); e.blastLen carries it to the bot (lab.js read a hard-coded 0.75).
- EHP.windcaller 1400 -> 1150 (own dial line after EHP.lance): with the pyro able to open him the row sat at 50% (knight 2/12 dies to his thorns).
- 'BURNED BACK' added to MOVE_WORDS; the two new teaching lines routed in src/hint-lines.js.
- BOT (src/lab.js): burnFlare - the pyro holds down as his bolt comes (seen a reaction late, tc 0.28-0.42 s, misread share skipped); pyroPost - while
  he is up she does not climb: she keeps to the floor he falls to, 40 px in from its ends, 44 px clear of an updraft, ~110 px out from under him, crosses
  an updraft only in the still, braces near a thorn edge downwind; callerKeep - on his floor the stand-off spot is clamped off the thorn strip (all heroes;
  the pyro's reach-spacing stood her in the strip beside a fallen boss).

## RATES (moor, L10, human, flasks kit) - data work/tmp-moorpyro (uncommitted)
| config | knight | warden | pyro | all |
|---|---|---|---|---|
| before (curvec4a) n=12 | 3/11 | 12/12 | 0/12 | 43% |
| verb + bot, EHP 1400, n=12 | 2/12 | 11/12 | 5/12 | 50% |
| EHP 1200, n=12 | 6/12 | 11/12 | 5/12 | 61% |
| EHP 1200, n=24 (burn 50) | 12/24 | 22/24 | 7/24 | 57% |
| burn 60, EHP 1200, pyro n=24 | - | - | 9/24 | - |
| **COMMITTED: EHP 1150, burn 60, n=24** | **14/24** | **23/24** | **10/24** | **65% in band** |
(1120 at n=12 read 1/12 12/12 5/12 = 50%: the knight's rate is thorn noise; n=24 is the number to read.)
- DRY (human+dry, n=6): knight 1/6, warden 4/6, pyro 1/6 = 33% (was 22%, pyro 0/6).
- OTHER HEROES (flasks, n=6) - all route (reach him, fight, no stuck/err): paladin 0/6 (2 timeouts, boss left 10-34%), pirate 4/6, Blood Knight 0/6
  (left 37-64%), geomancer 4/6 (1 timeout), berserker 1/6, ranger 0/6 (left 18-59%). Not targeted (standard is k/w/p); no before row taken.
- MASH: node tools/mash-bot.mjs moor --write -> 0/6 (all DEAD ~11 s, 0 blows land); docs/mash-bot.json re-stamped.

## CHECKS (PORT 8783, one at a time; a full gate suite ran beside me)
ok: tells (--write: no table change), hint-shown, answer-tags, untold-told, mash-gate, boss-read, boss-read-audit, boss-openings, boss-greed, weak-bosses,
moor-aloft, moor-rocks, moor-gusts, moor-wind, curve-gate, combat-part2.
ok rerun alone (they timed out at 900 s beside the gate suite): windcaller-gusts (every hero rides every ledge on the told gust; all heroes route), boss-fight-end (64 fights end).
textfit hints,bestiary --strict: 0 of every class (the bestiary line and both hint lines).
RED, NOT MINE: rule-openings fails THE GARGOYLE + POISE identically with the base files (ca5c839e src checked out, same output) - pre-existing on batch110.
Not run: the full suite (the nightly), mash level mode for moor (no level change).

## ART / SFX NOTES
- The burning bolt is the bolt sprite recoloured orange (#ff9a5c) with an orange/gold trail; the catch reuses the flare's SFX (emberFlare) and the
  ember's crack. An art pass could give it a proper fire-wrapped bolt sprite and a short "whoomph" on the turn.

## QUESTIONS FOR DANIEL
1. THE VERB (rec, built): the pyro's FLARE (her guard) and her EMBER set his bolt alight and send it home from any range - small fall + a 60 fire blow
   (x2 down). Pyro 0/12 -> 10/24. If it should be the BIG fall, or need her up close like the others, say so (then the bot must climb, and she was 0).
2. HERO-GENERAL? (rec: no, built: pyro only). Ranger 0/6, paladin 0/6, Blood Knight 0/6 on him. Rec a follow-up per-hero pass on moor: e.g. the ranger's
   ARROW SNATCH returns his bolt "home" the same way, the paladin's guard on it counts as up close. Not built (each is its own told rule).
3. EHP 1400 -> 1150 (rec, built): needed because the knight still dies to the thorn strip (35-60% of his damage taken). A thorn/strip pass (wider
   floor ends, or the blast knocking you toward a floor not the strip) would let hp go back up. Rec: leave 1150 until a moor room pass.
4. THE BOT NOW PLAYS THE PYRO FROM THE FLOOR (she never climbs). That is what the told rule invites; a human pyro may still climb. Rec keep.
