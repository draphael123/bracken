# claude/djinn6 - THE DJINN, after Daniel played DJINN5 (2026-10-06: "the Djinn is TOO HARD still")

Base: origin/claude/botreads 2dbafe77 (batch74 live + HARNESS + BOT READS, the honest bot). Owned files only: src/djinn.js, src/djinn-hands.js,
src/redraw/djinn_art.js, src/hint-lines.js (the Djinn's block), tools/djinn.mjs, tools/djinn-pail.mjs, docs/mash-bot.json (welltown rows via the tool).
Daniel's report: he dies most in P1-P2 (dust devils, fire lash, sand blasts), the fight feels too long, and it's hard to tell when to hit him.
He picked LESS DAMAGE + MORE / EASIER OPENINGS (not an hp cut, not a closer checkpoint).

## The finding that shaped the build
The honest bot is far better at the Djinn's P1/P2 opening loop than a person. Every lever that gives P1/P2 MORE openings sends it to 96-100%,
because it pours the frame his ward falls:
| config (8 seeds a hero unless noted; logs work/claude/djinn6/rN.log) | kn / wa / py | all | mean taken (of 250) | mean fight |
|---|---|---|---|---|
| r0: DJINN5 base, measured here | 5/8 7/8 6/8 | 75% | 202 | 112 s |
| r1: the full package (P1-P2 -20%, P3 -14%, ward 2.5 s, pour 80 px, caps +30%, the pail, longer tells) | 8/8 8/8 8/8 | 100% | ~100 | 89 s |
| r6: openings only (DJINN5 damage; ward 2.5, pour 80, cap 0.066) | 7/8 8/8 8/8 | 96% | 135 | 92 s |
| r11: ward 2.5, cap 0.056, named damage cuts | 8/8 8/8 8/8 | 100% | 148 | 105 s |
| r12: ward 3.0, pour 80, cap 0.056, named damage cuts | 7/8 8/8 8/8 | 96% | 157 | 110 s |
| r13: pour 72, cap 0.054, named damage cuts (12 seeds) | 12/12 11/12 12/12 | 97% | 169 | 110 s |
| **r14 SHIPPED (12 seeds)** | **12/12 7/12 12/12** | **86%** | **187** | **113 s** |
So the relief ships where a PERSON is losing and the bot is not: the damage of the three blows Daniel named, the tells on them, the pail, and the read.
The opening values, the ward and the pour's reach stay DJINN5's (Q1 has the alternative).

## What changed (shipped)
1. **Less damage from the blows he dies to** (src/djinn.js DJ.dmg): dust devil 24 -> 18, sand lash and fire lash 17 -> 14, sand blast 8 -> 6 (each
   about -20%). Everything else, and all of P3, is DJINN5's. Cutting those too sent the bot to 100%.
2. **Their tells a little longer**: lash and fire lash 0.5 -> 0.6 s, sand blast 0.5 -> 0.6, dust devil 0.7 -> 0.8.
3. **The pail is easier** (src/djinn.js refillPail / throwPail; src/djinn-hands.js):
   - It comes up FULL when the flood comes ("A PAIL FLOATS UP, FULL: E THROWS IT AT HIM").
   - It **refills itself 0.6 s after every throw**, wherever you stand ("THE PAIL FILLS ITSELF AGAIN", told once). E still scoops it in the water.
   - A throw reaches 230 -> 300 px.
   - His surfacing **reel lasts 1.2 -> 1.6 s**.
   - What a reel, a choke and a bail take is DJINN5's. The 3 s shroud after each still stops a stun-lock.
4. **"When to hit" is obvious** (B10; src/redraw/djinn_art.js, src/djinn-hands.js drawOver, src/djinn.js openUp):
   - Every opening (mud, douse, bail, choke, reel) starts on a **bright rising sting** (SFX.sting).
   - The gold ring is bigger and brighter: a warm glow inside, a 3 px ring, and a pulsing outer ring.
   - The clock bar is wider (60 px).
   - **OPEN** is drawn at twice the size, white-gold, with **NOW: STRIKE** under it.
   - **Warded**: the shell is drawn as before, and the word **WARDED** now stands over him while the ward lasts (its colour per phase).
   - Every blade on the ward now **clanks** (plus BR.auto's ring and word).
5. **Mash**: re-stamped via tools/mash-bot.mjs, LEVEL then BOSS:
   - boss 0/6 (he was left at 100% every time);
   - mini (the Gang Leader) 0/6;
   - level: every hero dies (lowest hp 0%).
   - mash-gate green (39 levels).

## Test changes (design changes from Daniel's brief, said here)
- tools/djinn-pail.mjs:
  - "the flood brings him an EMPTY pail" is now "a FULL pail".
  - New per-hero check: thrown, the pail fills itself again within pailRefill.
  - The scoop is still checked, from an emptied pail.
- tools/djinn.mjs:
  - The reel's ceiling is raised from <= 1.5 s to <= 2.0 s (Daniel: "a little longer").
  - New checks: the named blows each hit at least 15% softer and nothing else hits harder; the tells are no shorter; the openings are no smaller, the reel is longer and his health is unchanged; the pail refills itself.
  - Earlier assertions unchanged. 123 checks.

## Checks run (green, PORT 8692)
djinn (123, node), djinn-pail (43, page, 7 heroes), welltown (42), boss-read, boss-openings, boss-greed, boss-fight-end, tells, answer-tags,
hint-shown (I removed the stale line 'A PAIL FLOATS UP: E SCOOPS THE FLOOD' from src/hint-lines.js), mash-gate. No reds.

## QUESTIONS FOR DANIEL (recommendation first; the recommended option is built)
1. **More P1/P2 openings is on the shelf.** The 2.5 s ward, the 80 px pour and the bigger opening caps put the honest bot at 96-100%, so they did not
   ship. Rec: play this build first. If it still feels long or hard, turn on the 80 px pour reach alone (r12-like, the bot ~96%) and judge by your feel,
   not the bot's. Alt: ship the full package now (bot 100%, fight about 89 s instead of about 113 s).
2. **The warden is lowest (7/12); knight and pyro are 12/12.** She dies late in P3 at 3-6% boss health. Rec: leave it for your playtest. Alt: the
   flood's slam/wave about -10% for everyone.
3. **The pail comes up full and refills itself in 0.6 s** (no scoop needed). Rec: keep. Alt: a 1.0 s refill, so a missed throw costs a little more.
4. **The fight is not shorter on the bot** (113 s vs 112 s): the brief's "~20-25% shorter" came only with the caps that broke the band. Rec: your
   playtest decides. A person who now reads the openings and keeps a full pail should spend less time waiting. Alt: Q1's caps.

No music this lane.
