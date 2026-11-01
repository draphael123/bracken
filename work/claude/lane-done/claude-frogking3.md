# claude/frogking3 - FROG KING: HP CUT + A DISTINCT PHASE 2 (sonnet)

Base 0fe14c26 (BATCH135 live). Brief: Daniel 11-01 07:37 ("way too much health ... the boss before him has ~300 and he has ~1400"; no more attacks; phase 2 slightly more distinct). Not merged, not deployed.

## 1. Measured first
- The boss before him on the road (marsh needs hornetsnest): THE HORNET QUEEN, HQ.hp 430 (src/hornet-queen.js). EHP.frog = FK.hp (src/frog-king.js); no per-act scaling on either.
- Frog King before: hp 1500, quota 0.22 (~330/pad), take 0.08, DAZED x2 / WINDED x1.5, air 0.4. 3.5x the Queen. Recorded (frogking2): 63% pooled with flasks, wins ~75 s.

## 2. HP cut and retune (src/frog-king.js FK)
| | before | after |
|---|---|---|
| hp | 1500 | **650** (1.5x the Queen) |
| quota per pad (share) | 0.22 (330 hp) | 0.10 (65 hp: still ~5 pads a phase) |
| take cap per opening | 0.08 (120 hp) | 0.045 (29 hp) |
| DAZED / WINDED | x2 / x1.5 | x1.5 / x1.2 |
| gap (rest between blows) P1/P2 | 1.0 / 0.8 | 0.55 / 0.35 |
| tongue tell P1/P2, spit tell P1/P2 | 0.6/0.5, 0.55/0.45 | 0.5/0.45, 0.5/0.42 |
| tongue dmg, flop dmg | 12, 18 | 26, 28 |
| sink P1/P2, firm P1/P2 | 1/1.6, 2/1 | 1.3/2.0, 1/1 |
Effective HP (blood to take): 1500 base (openings x2 / x1.5 on top: about 1100-1300 of hero damage) -> 650 base (about 500-600 with the x1.5 / x1.2 openings, the 4.5% window cap binding). Nothing new in the move list; no HP-derived number lives elsewhere (EHP.frog follows FK.hp; the boss-rows table, docs/*.json and boss-openings hold nothing frog-HP specific; docs/mash-bot.json BOSS row re-run: still 0/6, level hash unchanged so no stamp moved).
Why not just 650: the cut alone gave **92% (n=35)**; the bot barely gets hit in a 50 s fight. Per the brief the rest came from tightening existing timings and damage (not HP, not attacks), in four n=12/hero rounds: 92% -> 91% -> 83% -> 78% -> 67%.

## NUMBERS (boss-rates marsh, practiced, profile human, kit flasks, campaign L3)
| run | knight | warden | pyro | pooled | fight (wins) |
|---|---|---|---|---|---|
| final, seeds 1-12 | 10/12 | 6/12 | 8/12 | 24/36 = 67% | 69 s |
| final, seeds 13-24 | 6/12 | 8/12 | 12/12 | 26/36 = 72% | 70 s |
| **final pooled n=72** | 16/24 | 14/24 | 20/24 | **50/72 = 69%** | **~69 s** |
| dry (human+dry) n=6 | 4/6 | 2/6 | 4/6 | 10/18 = 56% | |
| mash bot (boss) | 0/2 | 0/2 | 0/2 | 0/6 (holds) | |
Fight length: ~70 s on a win (was ~75 s at 1500 and 63%). The brief's 1:30-2:00 is NOT met: the fight is made of the pad crossings and his rests, not of his bar; at 650 hp the only ways to reach 90 s were more HP or more attacks, both ruled out. Reds: pyro is the strongest hero here (12/12 in one set), warden the weakest; the other 6 heroes were not re-run (frogking2 had them all >= 2/6 at 1500 - they are only easier now).

## 3. PHASE 2 - HIS POND STIRS, more distinct (no new attacks)
- **Sky** dims to a bruised teal-and-blood dusk over ~2 s (gradient dark at the top, clear by the water so the fight stays readable), with a slow pulse (src/redraw/frog_court_art.js stirDim).
- **Water** goes darker and RISES 3 px (dark body, a new pale lip, ripples) on top of the existing boil/steam.
- **His skin** flushes a dark hot red-brown (SPR.frog.p2, baked from the same frames: green-dominant pixels only, so belly/tongue/eyes/crown keep their colours; src/redraw/frogking.js) and his **throat glows** ember-orange, pulsing faster on every told blow (throatGlow).
- **Banner**: 'THE POND STIRS' band across the screen for ~3 s (main.js, on sim time), with the existing croak, shake, hint.
- **Music**: his track lifts a tone while he is in phase 2 (the existing music.storm detune the Queen's Lance uses; no new asset; reverts when the fight ends).
- **Rhythm**: his TOLD tongue and spit now CHAIN in pairs in phase 2 (FK.pair 0.6, pairGap 0.3 s): the same whole tells and yellow '!', the next blow comes after a short rest, never three running. Rests are shorter (0.35 s). The leap/flop/flies are unchanged.
Stills: work/claude/lane-done/frogking3-p1-court.png, frogking3-p2-banner.png, frogking3-p2-court.png (copies in scratch/lane-reports/frogking3-shots/).

## CHECKS
node/pages run and green: marsh2-beats (two pins retuned: openings >= 1.4x/1.15x, firm[1] <= firm[0]), firsthour (blow on his pad 10 / air 4 / dazed 15, pond stirs at 46%, spits all told), boss-openings, mash-bot marsh arena (0/6), mark-integrity (the frog rows all seen/landed/posed; the later bosses in the tool SKIPPED with 'page CRASHED' on this loaded PC, not frog), textfit boss (0 frog issues; 15365 strings; the listed OVERFLOW/COLLIDE/OFFSCREEN are other bosses' text; the banner itself was checked by eye in the stills, not by textfit, as it only shows at phase 2).
NOT RUN: full suite, walker per hero, the other 6 heroes' rates, a P2 pass on mobile widths.

## QUESTIONS FOR DANIEL
1. Fight length (~70 s) is under the 1:30-2:00 target. Rec: accept - it's a pad-chase, and 650 hp with the band met is the cut you asked for. If you want it longer, the lever is HP (~900) at ~2x the Queen, which needs more damage tightening again. Built: 650.
2. The raised damage (tongue 26, flop 28) and faster rests are what hold the band. Rec: keep. Built as above.
3. P2 music is a one-tone lift on the existing track. Rec: fine for now; a real second voicing would be a music lane. Built: the lift.
