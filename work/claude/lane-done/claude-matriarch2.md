# claude/matriarch2 - OLD PLUME, bigger, harder, three new told attacks (Opus, 2026-10-06/07, overnight)

Daniel, live 10-06: "a lot better, core design is good; animations a bit stiff; she should be BIGGER and more DISTINCT; MORE DIFFICULT - quite
easy compared to the boss before; give her two or three MORE ATTACKS." This lane did the size, the attacks, the numbers and the bot. The look
and the animation are the MATRIARCH2 ART lane's. The pose keys it has to draw are listed at the end.

## Base
- Prompt base: origin/claude/botreads 2dbafe77. **I fast-forwarded to origin/claude/batch75 089ebfd5** (it contains botreads). That was the
  only way to get the WARDEN KIT (claude/wardenkit). It is merged in batch75 and was not on botreads. Without it, the warden's number
  would not be the one that ships.
- batch75 was still in integration when I did this. Four checks are red on it **with and without my changes** (listed under REDS).

## What changed (src/raptor-matriarch.js, -hands.js, redraw/matriarch_cast.js; small hooks in main.js, red-gorge-hands.js, lab.js)
1. **SIZE x1.35 (MAT.scale).**
   - Body: hitbox 44x34 -> 60x46; down on her side 52x22 -> 70x30; mark 56 -> 76 px up.
   - Reach: rake 54 -> 70, rake range 72 -> 92, tail sweep 78 -> 100. The sweep stays 24 px high, so a jump still clears it.
   - Landing boxes: pounce and dive 18 -> 22. The pounce box stays 40 px tall, so a jump over her landing still clears it.
   - The read: the OPEN, beat and ward rings are 36/32/39 px; her shadow, guard flash and stars are scaled too.
   - The sprite is the art pass's frames drawn up nearest-neighbour at 1.35. The art lane repaints them at this size.
   - **The ledge geometry did not change.** Pillars, levers and bridges are where they were, and every top still holds her (a narrow top is
     32 px, she is 60 wide). B12: every opening is still on a top or the channel floor. She is stunned or thrown where a hero can walk or
     hop to, and the young land on your spot.
2. **THREE NEW TOLD MOVES, one per phase (B5).** Each has a sound, a word (the first three times, in colour), a mark, and a row in MARK,
   ANSWER and HEIGHT. One windup at a time.
   - **P1 THE FOLLOW-UP** (`followTell` !!, dodge, low; "SHE FOLLOWS YOUR ROLL", red).
     - Trigger: her two-slash rake found nothing (you rolled, or stepped out of its reach). She then pounces where you went: a 0.5 s crouch,
       with the mark dropped on your spot for its last 0.3 s.
     - Stand and turn it (shield or deflect), or take it, and she breathes instead (the rake's beat, now 1.0 s).
     - A whiff of the follow-up leaves her skidding, which is a beat.
     - Read her: rolling away is now the move she punishes.
   - **P2 THE BROOD CALL** (`broodTell` !, a screech; "SHE CALLS HER YOUNG OFF THE NEST", yellow).
     - Two of her YOUNG come off the canyon walls, 240 px either side of you. They are a reskin of the cliff raptor: 0.72 scale, 35% of
       its health, quicker. They hover low, mark your spot (the raptor's `watch` !!), and dart.
     - On the ground after a dart, a young one is open.
     - She circles the walls while they live, up to 9 s, with no other attack.
     - Kill both and she drops to them: "HER YOUNG ARE DOWN", GUARD DOWN for 3 s, a beat.
     - Out of time, they fly home and she carries on.
     - The young are counted on their own, not against the screech's cap of 2 cliff raptors.
   - **P3 THE FLOOD RIDER** (`riderTell` !!, dodge, low; "SHE RIDES THE SURGE: WATCH THE FOAM", blue).
     - She dives into the cracked dam's water. A white FOAM LINE runs at 190 px/s to the edge of the top you stand on (the edge nearer
       you), then boils there for 0.5 s with a blinking "FOAM!".
     - Then she bursts up: a column 14 px either side of that edge, reaching 44 px over the tops. A jump's top clears it.
     - She rises onto your top. The rise is a beat, so a blow from the air lands whole: meet her in the air.
     - A narrow top throws her (the level's rule): open 4.4 s.
     - Under the water nothing reaches her. A blow there CLANKS and says "UNDER THE WATER" (B10).
3. **HARDER.**
   - Quicker:
     - stalk 80 -> 96 px/s, rest between moves 0.5 -> 0.4 s;
     - tells: pounce 0.8 -> 0.72, rake 0.45 -> 0.4, sweep and scree 0.7 -> 0.62, dive 1.0 -> 0.9;
     - wall runs 1.6-2.6 -> 0.9-1.6 s at 150 -> 170 px/s, perch 3.6 -> 3.0 s.
   - Heavier: pounce 25 -> 31, dive 26 -> 29, rake 15 -> 16, sweep 17 -> 18. The follow-up hits 28 and the rider 26.
   - **Tighter openings, more of them.**
     - One opening pays at most 4.5% of her (was 6%), and one beat 4% (was 5%).
     - The windows are longer: stun and narrow-top throw 4.4 s (3.2), tangle 5 s (4.5), skid 1.6 s (1.5), the rake's breath 1.0 s (0.8),
       grief 3 s.
     - Fast blades hit the cap and the window closes ("SHE GATHERS HERSELF"). The warden's slow spear gets the time it needs.
   - hp 1075 -> 1000. With the tighter caps that is still more openings than before.
4. **THE HONEST BOT, v2 only** (src/raptor-matriarch.js matPlan; the legacy branches are untouched apart from answering `followTell` like a pounce).
   - The new moves: the follow-up is answered like a pounce (off the mark). While she circles, the bot goes to a young one on the ground
     and cuts it. The foam is read once it closes on your top or boils there: off that edge, to the far side of the top.
   - **THE WARDEN** (she was at 0). Her kit is the batch75 WARDEN KIT. These are bot fixes found by tracing her fights frame by frame:
     - *Tip distance.* `s.tip` is a near-EDGE distance (lab.js WARDEN_TIP). The plan stood her that far from the Matriarch's CENTRE, inside
       the bigger body: haft blows. She now stands off the edge, and her tip rate went from about 60% to 80%+.
     - *Rake deflect.* She swept early, which left the second slash inside her recovery. The bot now makes one late sweep that covers
       both slashes (src/lab.js passes `deflectT` into the plan). If the spear is still out, she steps out of reach instead, and the
       follow-up is the price.
     - *Taller rake.* Her rake now reaches up onto a pillar top from the channel, and the answer checks her real height.
     - *Tail sweep from below.* Down in the channel under her rock, the tail goes over you. The bot used to jump up into it. It now stays down.
     - *Blows outside openings (behind, under, across).* She cuts the Matriarch's BACK during the scree kick. She pokes UNDER the talons
       when both stand on the same rock while the water runs. At a narrow-top throw she pokes ACROSS THE GAP from the next top, at tip
       range, not with the haft from beside her.
     - *Phase-three landings* are answered as in phases one and two: on a pillar the roll has no room, so she jumps over the landing.
       This applies to every hero.

## Numbers (tools/boss-rates.mjs redgorge, profile human, practiced, campaign level L33, normal health)
| | knight | warden | pyro | all | fight (s) |
|---|---|---|---|---|---|
| base (batch75, before this lane), n=8 | 6/8 | **0/8** | 8/8 | 58% | 94-179 |
| **final, n=16** | **9/16 (56%)** | **5/16 (31%)** | **13/16 (81%)** | **56% - in band** | knight 95-135 (mean 119), warden 65-191 (149), pyro 92-150 (126) |
- No hero is at 0. Each loss is close for the knight (0-18% of her left) and the pyro (3-13%). The warden's losses run 1-62%.
- How I got there, n=8 each: scale and moves alone gave 6/1/8 = 63%. Heavier pounces 6/1/8. Tight caps at hp 1000 gave 4/1/7.
  Longer windows gave 5/0/6. A denser phase two gave 4/3/6. The final n=16 is above.
- Per hero over 16 seeds, I stopped once in band and did not use the full 20-seed cap.
- In probes, every new move fires in a real fight: about 1-2 follow-ups, 1-2 brood calls (young killed, grief taken) and 1-3 flood riders.
  There were no page errors.
- **Mash bot:** boss 0/6. All six die in 56-68 s; she keeps 91-100%.
- **Mash re-stamped** with tools/mash-bot.mjs, LEVEL first then BOSS (docs/mash-bot.json). Level: knight/warden/pyro all reach 0% hp,
  1-2 deaths, walk 100%.

## Checks (PORT 8691)
- **Green:** raptor-matriarch, redgorge2-aloft, boss-read, tells, boss-openings, boss-greed, boss-fight-end, comments, level-quality
  ("every gated level clears the quality bar"), mash-bot --assert redgorge, textfit bestiary/hints/boss (0 of every kind but ERROR 1, the
  same on base).
- `node tools/tells.mjs --write` was run ONCE, after the rows went in (787 rows).
- **Test edits.** The assertions are unchanged; the setup changed and new checks were added:
  - tools/raptor-matriarch.mjs: the narrow-pillar burst test now puts her in the channel standing (`recover`), not walking. Her quicker
    stalk reached the bank in the burst's 0.4 s. The assertion is the same.
  - tools/raptor-matriarch.mjs: the world mock gains `spawnYoung` / `young` / `dismissYoung`.
  - tools/raptor-matriarch.mjs: SIX NEW asserts. The follow-up after a rolled rake, and the beat after a turned one. The brood (two young,
    she circles, the grief beat; out of time, they go home). The rider (the foam to the edge, the burst hits on the edge and misses off
    it, guard down in the air, the narrow top throws her).
  - tools/boss-openings.mjs: the same setup change (`recover`, not `walk`) in its Matriarch block. Assertions unchanged.

## REDS (all also red on batch75 089ebfd5 untouched, checked side by side in a clean worktree - not this lane's)
- redgorge: "it has its node on the desert map, and the road runs to it (through THE UNDERWELL's node)". This is the map order from batch75.
- answer-tags: about 12 elite `ek*Tell` rows have no ANSWER row (elitemoves).
- duck: `*|eliteLungeTell` / `*|eliteSlamTell` HEIGHT rows have no MARK.
- hint-shown: main.js HOOKED (x3), PLATE and WARD are unrouted. My five new lines are routed in src/hint-lines.js.

## UNVERIFIED
- **No Daniel playtest** (her gate, B9).
- The new moves are seen in stills and probes, not by a person's eye in play. The foam line and the young are drawn with plain shapes.
- The bot never works the SLUICE LEVERS. It had 0-1 pulls a fight before this lane and still does, so her designed P1 opening goes
  unmeasured.
  - The bot stands at a lever for about 8 s, and she is in the channel then for 3-14 frames.
  - Her P1 damage on the bot comes from skids, the rake's breath and her back.
  - A player who uses the levers will find P1 shorter than the bot does.
- Not run: the full suite.

## QUESTIONS FOR DANIEL (recommendation first; the recommendation is what is built)
1. **The spread: pyro 81%, warden 31%** (knight 56%, all 56%). Rec: ship it and let your playtest decide. If she still feels easy, raise
   hp 1000 -> 1100 (my n=8 estimate is about 48%, and it costs the warden). Alt: a pyro-side look (she rolls through everything); that is
   a hero question, not a Matriarch one.
2. **The per-opening cap (4.5% of her, beats 4%) over longer windows.** This is what lifted the warden without lifting the knight. Fast
   blades cap and the window closes, while the slow spear uses it all. Rec: keep. Alt: the old 6%/5% with short windows (the warden
   goes back to about 0).
3. **The follow-up punishes a whiffed rake** (you rolled away or stepped out). It does not punish a turned or a taken rake. Rec: keep (it
   is "read her": turn the rake, do not run from it). Alt: rolls only.
4. **While her young live she circles and does not attack** (9 s at most). They are the threat, and killing both gives the grief beat.
   Rec: keep (B13: the time is yours to act in, not to wait out). Alt: she dives as well (two windups at once - against B5).
5. **The flood rider's burst column is 44 px over the tops,** so a jump at the right time clears it. Rec: keep ("meet her in the air").
6. **Her bestiary card** is rewritten for the new moves ("twice a man's height"). Rec: keep.
7. **The bot and the levers** (UNVERIFIED above). Rec: a small bot lane for the lever bait before the next Matriarch retune. Your
   playtest is the real number for P1.

## FOR THE MATRIARCH2 ART LANE - pose keys (src/redraw/matriarch_cast.js POSES; keep every key, poseOf maps modes to them)
She is drawn at MAT.scale 1.35 from an 80x68 frame (anchor AX 40, GY 64). Draw her natively at about 108x92, or keep the frame and the scale.
- Existing (the art pass; stiff, one frame each - Daniel wants 4-6 frame cycles, anticipation and follow-through):
  - walkA, walkB (the stalk);
  - sleep, wake;
  - crouch (the pounce tell), leap (the pounce and every flight), skid (guard down);
  - rakeTell, rake (also the rake's breath, rakeBeat);
  - sweepTell, sweep, screeTell, screech (also the debris surge's tell);
  - wobble (also the P3 narrow-top throw), down (staggered / stunned / tangled / falling);
  - wall (the wall run), divetell, dive, perch, volley, crack.
- **NEW (stand-ins built from the old parts - please draw them):**
  - P1 THE FOLLOW-UP: `follow` - the windup: a twisted crouch after your roll, wings out, eye red. The strike flies on `leap` and lands
    on `skid` (whiff) or the stalk. Ideally a follow-strike frame and a recovery.
  - P2 THE BROOD CALL: `broodcall` - the windup: on the wall, head back, ruff and tail fanned, the screech. Then `circle` - circling the
    walls over her young, ideally a run cycle. Then `grieve` - down off the wall to them, head low, guard down (the recovery beat).
  - P3 THE FLOOD RIDER: `riderTell` - the windup: coiled on the top, about to dive into the water. Then nothing while she is under the
    water: only the foam line and the boil are drawn (src/raptor-matriarch-hands.js drawOver). Then `riderBurst` - the strike: erupting
    out of the water, wings spread, beak open (it is clipped at the frame's top now). She lands on `wobble` (thrown) or the stalk (the
    recovery).
  - HER YOUNG: today they are the cliff raptor's sprite at 0.72 (main.js bigF, `e.young`). They need their own small, downy, rust-and-cream
    look, with frames for circle, watch (red eye), dive, perched (open) and climb.

## Commits
294d7834 (size + three moves + marks + bot answers), 515df6f6 (harder + warden), and the report commit (bestiary card, mash re-stamp).

# ART (claude/matriarch2 art lane, Sonnet) - OLD PLUME redrawn, animated; her young
Art only: no behaviour, number or hitbox moved. Sheets: docs/redgorge2-art/matriarch2-cycles.png (one row a pose key, its frames left to right; `node tools/redgorge2-cast-sheet.mjs [out] [scale] [keys]`), docs/redgorge2-art/matriarch2-young.png.
- DRAWN NATIVELY at her size (src/redraw/matriarch_cast.js; frame 138x108, drawn at scale 1; the nearest-neighbour x1.35 is gone). A TALL CRIMSON CREST (seven plumes, gold and cream tips, curled), WAR-PAINT (crimson bands across the back and flank, thigh and tail-root bands, a cream-over-crimson cheek stripe, brow chevron), SCARRED FLANKS (three pale claw scars with dark lips, a hip rake, a scar through the brow), a HEAVY TAIL (thick banded root, a broad crimson-and-rust barred fan), a bigger CREAM RUFF with ragged points.
- EVERY pose key kept and now a cycle (C.frames[key]; C.R/L/white[key] = frame 0): walkA/walkB 6 (stride, body dip, head nod, tail + crest sway), idle 4 (breathing; new), sleep 4, wake 3, crouch 4 (settle, coil, shiver), follow 4, leap 5 (launch, rise, apex tuck, fall, reach), land 3 (squat, balance flap, settle; new), skid 3, rakeTell 4 (head bob, arm cocks back, weight sits back), rake 3 (strike, full arc, follow-through), rakeRec 3 (the breath; new), sweepTell 3, sweep 3 (whip, fan, return), screeTell 3 (foot strokes), screech 3, wobble 4 (flap and balance), down 3, wall 4, divetell 3, dive 3, perch 3, volley 3, crack 3, broodcall 4, circle 6 (run cycle), grieve 4 (sway), riderTell 3, riderBurst 4 (rising wet, full spread, apex, fall; no longer clipped).
- poseOf keeps its old keys; frameOf(e, S, t, A) picks { key, i } from the mode and the time in it (tells walk their frames then shiver, strikes run fast and hold, the rest cycle, a stalk by whether she moves, a landing by the time since a flight). Wired in raptor-matriarch-hands.js drawBoss (e.artA tracks the mode clock); frames bake lazily, spawnBoss warms them all. B10 reads (OPEN ring, ward shell, guard words) untouched and still drawn over her.
- HER YOUNG: src/redraw/matriarch_young.js, SPR.raptorYoung (main.js), drawn at scale 1: a downy buff-and-cream juvenile, rust patches, big round head, short orange beak, two stubby crimson tufts, long clumsy feet; frames 0-2 circle/flap, 3 watch (red eye), 4 dive, 5 perched, 6 climb (new: used when the young's machine is in 'climb').
- Checks (PORT 8693): raptor-matriarch ok, redgorge2-aloft ok; redgorge has its one pre-existing red (the desert-map node order). See the final message for textfit / render-layers / floaters.
- UNVERIFIED: no human eye in play; stills of the sheet only. Leg/arm joints in a few airborne frames are plain stick-limbs at 1x.
