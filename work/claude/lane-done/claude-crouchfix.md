# claude/crouchfix - CROUCH FIX (Sonnet lane, 2026-10-11)

Brief: scratch/brief-crouchfix.md. Base: origin/claude/riposteart 866bfb9e. Branch claude/crouchfix. Port 8828.

## WHAT IS BUILT
1. **PALADIN: kneel at holy lights only** (src/crouch-b.js).
   - The Light fills only while he is down, still, and within **HOLY.R = 32 px (2 tiles)** of a holy light. Elsewhere the kneel is the plain duck (no prayer, no chant, no glow, no kneel pose, hurt box still DUCK_H).
   - **One table, `HOLY`**: any unbroken shrine; a lit, un-tipped `brazier` prop; the `grancandle` prop; `candelabra` and `candle` dressing; plus `api.extraHoly()`.
   - **LIT CHURCH 2 hook**: `H.holyLights()` in src/lit-church-hands.js returns every lit lamp and always-burning source (brazier, votive stands, vigil candle, sanctuary lamps once lit). main.js passes it as `extraHoly`, so the sanctuary lamps feed his Light with no more work.
   - **Shown**: the light he is near pulses gold (faint walking up, strong while he kneels, with a thread to him while it fills). The chant and the gold pool round him are only for a prayer that actually fills.
   - **Rate** 25 to 30 a second (3.3 s empty to full), a little faster since he must now walk to a light. A hit still stands him up.
   - **Teach**: the calm teach now only fires by a holy light, with new text "KNEEL BY A SHRINE OR A FLAME...".
   - **Bot** (src/lab.js crouchBPlan): kneels by a light, walks to one within 160 px, plans nothing with none near.
2. **PYROMANCER: flare on a 0.3 s DOWN hold** (src/ember-ward.js, `EMBER.hold = 0.3`).
   - Down held on the ground, stood still, 0.3 s opens the flare; once per hold. Let go and hold again to flare again.
   - A shorter hold is just the duck.
   - The hold clock does not run with jump, attack or a way held. So drop-through (down+jump), the low sweep (down+swing) and walking never flare.
   - Cooldown, window (0.25 s), mistime, heat and the weak guard are unchanged. A slope still wins (the slide).
   - Texts updated: hero card, the "YELLOW MARK" teach, the wood's parry sign, the riposte moves list.
   - Bot (lab.js): holds down EMBER_LEAD = 0.1 + 0.3 s before a blow (was 0.1 s) and keeps holding until the window opens; the wicker-ball flare holds down and starts 0.3 s sooner.
3. **First-crouch hint** (new src/crouch-hint.js, `FIRST` table, one line per hero, PROG.crouchFirst[hero] per save slot).
   - Lines: knight "HOLD DOWN: YOUR SHIELD GOES LOW. X FROM THERE TRIPS."; warden "...SPEAR IS SET AGAINST A CHARGE"; pirate "...WHEN EMPTY TO RELOAD TWICE AS FAST"; paladin "KNEEL BY A HOLY LIGHT TO FILL YOUR LIGHT."; pyro "HOLD DOWN TO FLARE."; geomancer; reaper; berserker.
   - Fires after a 0.2 s real crouch. **It waits until the hint box AND the toast queue are empty** (the marsh's stacked toasts), then shows; a 12 s cap sends it into the queue anyway.
   - A hero whose own contextual line was already said is not told twice. The berserker's calm-standing "WORKING UP" line comes first for him, by design.
   - tools/textfit.mjs reads the FIRST table.

## THE PYRO + RIPOSTE DECISION
The flare window IS her parry (a blow caught in it goes through the shared parry to riposte, claude/riposte), so the hold and the parry beat do not compete: **the hold OPENS the window and the window is the beat**. Nothing is a second system.
- A windup tells for 0.4 s or more, so she holds down at the tell and the 0.25 s window opens about 0.3 s later, over the blow. The old "press on the beat" is gone; the beat is the window.
- Considered and not built: parry on the bare PRESS when a blow is imminent. It would bring back the accidental flare on every duck near a foe, which is what the brief removes.
- The cost is real: a duck held 0.3 s with a threat within 160 px now flares and may mistime (rooted, exposed 0.5 s), as a press did before. If that bites in play, the cheap fix is a longer hold or no mistime on a first hold.
- The bot got the longer lead (above).

## CHECKS (PORT 8828, sequential)
- GREEN: ember-flare (rewritten, see below), riposte (the pyro answer now holds down until the flare opens, then the blow lands 0-24 frames later: parry, ratio 2.57, red = TOO STRONG, elite, chief, fog knight, chain all as before), duck, crouch-a, crouch-b (rewritten for holy lights), crouch-feet, slide, pyro-duel, wicker-queen, **new tools/crouch-hint.mjs** (added to check.mjs), textfit hints --strict (0 issues, 90 hints incl. the 8 new), mash-gate (46 hold), modulepreload.
- **Tests I changed (design change, reason stated, none weakened)**:
  - ember-flare.mjs: "press" now means "the frame the flare opens", reached by holding down (`openFlare`). Added: a 20-frame hold and a tap do not flare; the flare opens by about 30 frames; one flare per hold; a second hold flares again; down+jump and down+swing never flare; a blow on a short hold lands; a new full hold begun inside a mistime's recovery does not flare (a real check, not vacuous).
  - riposte.mjs: the `down` answer holds down until the flare opens.
  - crouch-b.mjs: a brazier is laid at his feet. Added: no prayer with no light, 80 px off, 40 px off, a tipped brazier or an unlit one; prayer by a brazier at 24 px and by a shrine at 20 px; the bot walks to a light 4 tiles off and kneels, and plans nothing with none.
  - slide.mjs: the pyro's flat flare now needs a 45-frame hold. The slope still wins (flare 0, slide 45).
  - docs/mash-bot.json: the wood row re-stamped (the wood's pyro parry sign text changed the level hash). Result is unchanged: 0 wins.
- **RED, PRE-EXISTING (not mine)**: hint-shown fails on base 866bfb9e: `src/riposte.js` "TOO STRONG" is a number() literal that nothing routes. I did not route it (it would put a hint box on every red blow); it needs a decision.
- **boss-rates spot** (human profile, campaign level, kit flasks, practiced; my branch vs the base, same seeds):
  - Pyro: stockade 3/3 vs 3/3; church (the Paladin boss) 3/3 vs 3/3.
  - Paladin on church: 3/3 vs 3/3.
  - **Paladin on stockade: 8 seeds, 5/8 (63%) vs 8/8 (100%)**. This is a real shift from the design, not noise: the boss bot used to kneel for free in the arena before the fight, and now has no holy light there. A player kneels at the shrine before the boss. Nothing was retuned. Stockade is still in band (HIGH +3 vs HIGH +40), so if anything the bot is closer to the target.

## QUESTIONS FOR DANIEL (rec first)
1. Pyro mistime on a plain duck near a foe: keep it as built, or make a hold that opens a flare with nothing mid-windup free of the mistime? Rec: keep, watch the playtest.
2. Paladin: should a lit SHRINE count before it is lit (built: any unbroken shrine)? Rec: yes, so the shrine before each boss is a prayer stop.
3. hint-shown red on base ("TOO STRONG"): route it as a callout, or add it to MOVE_WORDS so it floats? Rec: MOVE_WORDS (a floating word like OPEN), by the riposte owner.
