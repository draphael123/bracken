# claude/plunges - the four NEW plunges (Sonnet, logic + art)

Each plunge owns ONE job and still lands its first blow as hurtAs('plunge', ...) (the B14 FROM ABOVE key). Rules and numbers: src/plunges.js. Proof: tools/plunges.mjs (page, headless).

- PALADIN HAMMER OF DAWN (poise breaker): the slam does x1.15, adds 34 poise (x1.4 on a boss or mini, x0.6 on an elite's bar) and breaks a guarded common foe's guard at once (soldier/shield-bearing COVER kinds; a Duelist's raised guard is broken, not bounced off). Holy light: while the maul falls and 0.9 s after, T.SPIKE tiles cannot bite him and a bristling spiked foe cannot (SAFE LANDING). The ground-landing waves carry the poise too. Still pogoes off a head.
- FREEBOOTER BOARDING (control): lands on a common ground foe (never boss, mini, elite, big, brute, flyer, pinned), hits for x0.4, then RIDES it 1.5 s: the stick walks it, it is "thrown" in knock-into's terms (INTO THE SPIKES / water / fire / OFF THE EDGE spoken by the shared helper; an elite is never killed). Jump, the time, or a ledge (foe airborne > 0.14 s) leaps him off at -350 (a second jump). Bosses/brutes: struck and pogoed off, with a TOO BIG / TOO HEAVY TO RIDE word.
- GEOMANCER EARTHFALL (terrain): a one-tile stone spike rises ahead of her (under the nearest foe within 44 px, beside the foe she came down on), hits as the plunge (tag 'plunge'), stands 3.5 s cracking at the end, one at a time, outside her cap of 3. Refused: a gate/door/plate/lever/exit within 3 tiles, under 4 tiles of ceiling, over a gap. wayBuild (the arrow's reach fill) now reads GEO.baseGrid(), the level without her stone; reach tools read nothing of it (reach-heroes section D). It replaces the STONEFALL ring.
- BERSERKER AXE SPIN (shred): the landing is stack 1 of REND (forced - works out of a frenzy), then 4 quick cuts (3 total on a boss/mini); the 4th stack cracks as a heavy; he pogoes off at the end (counts in the chain). Existing AXEFALL ground ring kept.
- Art (B16): own windup frames (plunge start) + release/ride/leap/spin frames per hero (chars.js: hammerWind/hammerHit, boardFall/boardRide/boardLeap, earthWind/earthHit, bzPlunge windup + bzAxeSpin + bzSpinEnd), hero-poses beats, FX words. tools/plunge-sheet.mjs -> docs/plunges/frames.png.
- Teaching: one hint line each on first plunge (PROG.lessons.plunge_<hero>); yard steps: paladin hammerfall (reworded), pirate NEW board, berserker NEW spin, geomancer stonefall (reworded EARTHFALL); controls card plunge row renamed per hero.

## Checks (PORT 8922, one page at a time)
green: tools/plunges.mjs (new), pogo-chain (now 8 heroes incl. berserker), firedrop-plunge, blow-tags, boss-read, knock-into, hero-trials (+ paladin/pirate/berserker stations played), reach-heroes (+D), ability-poses 67/67, hint-shown. textfit (scoped) and mash: see the lane's final message / below.

## QUESTIONS FOR DANIEL
1. EARTHFALL replaced the STONEFALL knockdown ring (one job per plunge). Rec built: replaced. Keep the ring too?
2. AXE SPIN on a boss/mini is 3 cuts, not 5 (the greed reprisal counts 4 blows in 2.5 s). OK?
3. BOARDING leap is -350 (second jump, canCut off). Tune up/down?
4. Berserker's, pirate's ground-landing rings (AXEFALL / boarding stomp) left as they were.
