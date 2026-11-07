KRAKEN3 DONE 11-07 READY (code-only OPUS boss rework behind the Causeway 2 flag; browser proof / lab bot / n=6 / art polish owed) - tip: see the last line

# claude/kraken3 - THE KRAKEN 3: THE RAFT (phase 2 of the Drowned Causeway 2 boss)

Branch `claude/kraken3` off `claude/causeway3w` aa0c3a114. Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-kraken3`. Pushed. NOT merged, NOT deployed.
Sources: scratch/brief-kraken3-1014.md (Daniel 10-14, all recs) + its 10-16 '!!' (take the EYE out of the causeway half; the raft's face is the big-face moment);
scratch/plan-water-1105.md item 10 + s2 boss rules (Daniel took the s6 recs 11-05); the causeway3w report (its Q6, the reach's light, was left to this lane);
the kraken2 + causeway2 reports. GATE-RUNNING.flag was up: no browser, no CDP/puppeteer. Every tools/*.mjs I ran was grepped for puppeteer/chrome first. tools/check.mjs was not run.

## FLAG
Same flag as the level: only Causeway 2 (`L.cw3`, `?cw3=1`) runs it. `K3H.on()` is false on master's Causeway, and every main.js hook is a no-op there, so the live Kraken is untouched.
tools/causeway3.mjs still hashes the flag-off build the same: 98 ok.
`globalThis.BRACKEN_K3 = false` turns the raft off under ?cw3=1 too. That gives the old three-stage fight on the new road, for an A/B.

## THE DESIGN
| part | what happens |
|---|---|
| **PHASE 1** | Today's Kraken, stages 1-2 (THE ARMS, AT SEA), unchanged. At **50% of his bar** (`KR3.p2At`) he **SINKS**. The arms slacken and the sea goes quiet; it looks like you are safe. Stage 3 never comes under the flag: no maw, no climb, **no EYE** (Daniel 10-16). |
| **THE ROAD GOES** | The reach cracks (told 1.4 s), then a 0.9 s fade. At the black, the reach is broken into his sea. The tiles go through `mending`, so `mendAll` lays them again on a respawn. The bell tower and the seabed stay. The wreck's deck is now **THE RAFT**: 16 plank movers on his sea. Every living seat is put on it, the camera is held to it, and a mark is set. |
| **CHECKPOINT (A10)** | After a death from here, he comes back with his bar at 50% and goes straight to the road breaking (`K3H.resume`). |
| **THE DRIFT** (20.5 s) | **WRECKAGE** comes across the deck at ankle height (jump it; told 1.4 s, seen coming plus a mark at the edge). A **ROCK** overhang comes at head height (duck it; told 1.5 s). A **WHIRLPOOL** pulls the deck one way at 50 px/s; the slowest walker, 73.6 px/s, can walk against it. **KRAKLINGS** climb the edges (told by their hands on the plank, 1.2 s) and pry the plank they hold (3.6 s). Cut them first or the plank goes. His **return is told four ways**: bubbles, a shadow under the raft, a quiet beat, then the deck shakes. |
| **PHASE 2** | **HIS FACE** surfaces at one edge. It can **always be struck at x0.4** (B15 floor). His **ARMS** slam onto the deck (told 1.1 s: a shadow plus a red mark) and **STAY PINNED**. A pinned arm blocks the deck (you go over it, not through it) and lashes anyone beside it (told 0.7 s). **CUT EVERY PINNING ARM and HE REELS.** The face is then **OPEN** for 4.2 s at x2.5 (gold ring plus timer), up to 12% of him. After that comes a told **WARD** (2.6 s, x0.4). He goes under, comes up at the other edge, and slams the next arms. |
| **HIS MOVES** (while the arms pin) | **WATER SPOUT**: a jet across the deck; low means jump, high means duck. It shoves you toward the far edge. **BITE**: a marked chunk of two edge planks; step back, because it takes the planks. **TIDAL LIFT**: he heaves his side and you slide toward the far water at 60 px/s. **INK CLOUD**: from 2/3 of his raft bar; black blobs over 5 planks, and the arms inside show only as outlines. It is never over a hero's own plank or the planks either side. **BARNACLE VOLLEY**: 3 + seats-1 barnacles stick and burst 1 s later. A blade knocks a stuck one off first. **THE SNAP** (new; the answer to a mash): stand in his face between moves and he snaps (told 0.5 s), and his next move is the BITE. |
| **THE RAFT** | Slams crack planks. A bite or a pry takes them. At 2/3 and 1/3 of his raft bar, a 2-plank section on his side falls away. There are **NEVER fewer than 9 of 16 planks**. If its plank is lost, an arm loses its grip, so no arm is ever left pinning open water. **LOOSE PLANKS** drift off every break (up to 4). **Stand at a gap and HOLD UP for 1.1 s** to lash one back on. A blow on you resets the lashing. |
| **THE SEA** | Falling in is told ("THE SEA HAS YOU"). 0.8 s later you are lifted onto the nearest free plank for 12% of your health. It is a `spare` blow, so it never kills. |
| **SCALES PER SEAT** | His bar carries the co-op multiplier, and arm and krakling health are shares of it. Arms per wave by seats: 2/3/3/4, plus 1 in the last third. Kraklings per wave: 1/1/2/2. Barnacles: 3-6. |
| **STORM NIGHT** (causeway3w Q6) | Over the reach the **sky** goes storm-night, with told far-off lightning and thunder. The playfield stays lit so every tell reads. The far rocks and a wreck's masts slide past to show the raft drifting. |

Openings come from the fight's own verb (cut the pinning arms), not from a pillar or wall slam. The lab bot is wired: `BK.krak` hands the lab the raft's advice through `K3H.advice()`, and `src/lab.js` now ducks on `KA.duck`.

## FILES
| file | what |
|---|---|
| `src/kraken3.js` (new) | `KR3`, the numbers. The pure state: `k3New`, `k3Step` (the events), `k3HitFace` / `k3HitArm` / `k3HitKrak` / `k3PopBarn`, `inkSpans`, `k3Advice` (the lab), `k3Read`. No canvas and no main.js. |
| `src/kraken3-hands.js` (new) | The world binding. The hand-over and its checkpoint resume, the road break, plank movers, seats on the raft, the camera, the mark. Arms and kraklings are `krakenarm` ents (`k3arm`/`k3krak`), so every skip list that knows his phase-1 arms knows them. The face is the boss's own hit box. Also the hurts, shoves, blocks, sea and back, the lab advice in world coordinates, the draw, and `window.BK_K3`. |
| `src/redraw/kraken3_art.js` (new) | Art in code. A raft plank of tarred, rope-lashed, barnacled ship's timber, with a pale top so it reads over his sea; it has whole, cracked and loose frames. Krakling frames: climb, pry, bite tell, dead. Barnacle frames: stuck, swelling. The wreckage spar, and the rock overhang. His **face** is his own head bake (src/redraw/kraken.js frames: rest/blink, ROAR for the lift and barnacles, LUNGE for the bite and snap, BREATH for the spout, INK, KNELLED for the reel, hurt for the ward, dead). His **arms** are his own arm discs, laid as a chain from under the edge onto the plank. |
| `src/main.js` | 14 one-line hooks, all inert without `L.cw3`: import, construction (ctx + `p1Stop`), clear, updateKraken (tick/resume, then the hand-over before stage 3), krakenHurt, drawKraken, krakenAdvice, the mover update and draw skip, updateProps strike, drawSky, drawBack, drawOver. Patch script: `work/claude/kraken3/wire-main.cjs` (asserted, CRLF-aware, idempotent). |
| `src/lab.js` | One line: `KA.duck` means DOWN, standing still. |
| `tools/kraken3.mjs` (new) | **217 ok**, Node only, about 20 s. |

## NODE RESULTS (one at a time, 4.3-4.5 GB free; log: work/claude/kraken3/node-checks.log)
- `node tools/kraken3.mjs` **217 ok**:
  - The drift's order and its four-way told return.
  - A standing hero is hit by the wreckage and the rock; one who jumps and ducks is not.
  - Kraklings pry planks, but never below the floor.
  - Per seat: arm counts, and health as a share of the seat-scaled bar.
  - The opening comes only when every pinning arm is cut. It is capped, then warded; the floor is x0.4 and the ward x0.4.
  - The other edge, and the next wave.
  - An arm still coming down cannot be cut.
  - The raft floor holds at 9. A loose plank is lashed with HOLD UP; letting go early does nothing.
  - The sea gives a told return as a spare blow, onto a standing plank.
  - The ink stays off the heroes' planks.
  - Every tell is at least 0.5 s, and every blow is named.
  - Determinism holds.
  - **The hands in a stub world**:
    - inert without cw3 or with BRACKEN_K3 false;
    - begin, sink, the road broken with the tower and seabed standing, 16 plank movers;
    - the hero on the raft, the mark, the camera lock;
    - the face as hit box, the hint card, the arms as krakenarm ents, x0.4 to REEL to x2.5;
    - advice in world coordinates, the sea and back as a spare blow;
    - A10 resume (with the mark it starts at the road at 50%; without it, phase 1).
  - **main.js wiring asserted from source.** The hand-over runs before stage 3. lab.js ducks.
- **The stub fight** (raft half only, 1-D hero driven by `k3Advice`, swing 16 every 0.45 s, 3 flasks): **advice wins 24/24** across seats 1-4 and 6 seeds each. The raft half lasts 27-36 s. Every win takes 3 openings. The slowest walker (74 px/s) wins 3/3. **A mash** (stand at his face and swing) **loses 6/6** and is dead at 23-27 s, mostly from 'HIS BEAK': the snap and the bite. The bot reacts perfectly, so it takes only about 50 damage. These are rules checks, NOT the win band: the 60-70% tune is the page lab's.
- Also green (exit 0): tools/causeway3.mjs (98 ok, flag-off hash unchanged), homepaths, comments, dangling-paths, blow-tags, anchor-lint. `node --check` passes on every touched file. New filenames (kraken3, kraken3-hands, kraken3_art) are clean of ad, banner, track, pixel and promo.
- NOT run (page or suite tools, under GATE-RUNNING): check.mjs, kraken-rework, kraken-reach, kraken-pilot, boss-rates, mash-bot, tells, boss-read, boss-openings, boss-fight-end, sea-runtime, normal-health.

## OWED
1. **Browser proof** (one browser at a time, memguard, at least 1500 MB free, `?cw3=1&level=causeway`, then the boss door). Things to confirm:
   - **The hand-over and the board**: the hand-over at 50%; the sink draw; the road cracks, fade, tiles gone and **re-laid on a respawn** (mendAll); props and dressing on the road dropped; the tower left standing.
   - **The raft and the camera**: the plank movers carry heroes and drop them when a plank goes (`m.broken`); the camera holds to the raft (`camLock` plus the P.x clamp); the sea's level stays put.
   - **Hit routing**:
     - blades, shots and skills on the face box and on the k3 `krakenarm` ents;
     - anything after `krakenHurt` in hurtEnemy0 (anti-mash, caps) that changes the face's number;
     - the death fx at his face, and the level win;
     - the A10 resume after a death on the raft;
     - P1 leftovers cleared by `p1Stop`, including a hero held in the grab at the hand-over.
   - **Inputs and look**: HOLD UP to lash (co-op seat 2 uses `b.hold`, as CW3 does); his head frames reading at the edge; the arm chains; the ink blobs; storm-night sky and lightning.
   - **Lab**: `BK.bossLab({ bosses: ['causeway'] })` with cw3 on, the raft advice, and the duck.
2. **Lab bot + tune**: **THE KRAKEN PAIR n=6 WITH flasks**, in band 60-70% (plan s2), 12 seeds to sign; mash 0/6; and `boss-rates` / `mash-bot causeway` with CW3. The knobs are all in `KR3`: `p2At`, `face.take` / `openMul` / `openT`, arm `hpShare`, `moves.gap`, `snap`, the drift's length. P1's numbers are untouched.
3. **Art polish (art before live; a sonnet art lane after the proof)**: the plan's 11-19 'Causeway 2 + Kraken 3 art' slot. The pieces here are drawn in code and use his real head and arm bakes. They want:
   - a proper SURFACING frame and a REEL face with the gold eye glow;
   - spout, ink and bite frames on the face's flip side;
   - a krakling sheet with animation;
   - a tilt pose for the lift;
   - the spout jet as water (not a band);
   - the whirlpool spiral;
   - the far drift silhouettes.
   Also the bestiary card (`sub` and `desc` still describe the climb and the EYE), and the music (lane-musickraken's pick for the raft).
4. **At the flip**: retire the stage-3 climb, ramp and EYE code (krakenEyeW, krakenRampMake, KRK_EYE_*, bakeKrakenEye, KRK_CLIMB_Q) once master's causeway is the new one (Daniel 10-16). Until then the eye lives only on master's old Causeway.

## QUESTIONS FOR DANIEL (recommended answer first; each built as the rec)
1. **Phase 1 ends at 50% of his bar** (the brief: "P1 = today's"). The raft is the other half; at 35% the raft half was so short that standing in his face and mashing beat cutting the arms. REC keep. Alt: 35% (phase 1 nearer today's length, and the raft a short finale).
2. **The drift is 20.5 s with him under the water** (not struck: he has sunk; the kraklings and the hazards are the fight). REC keep, and let the tune lane trim it to about 15 s if it drags. Alt: his arms take swipes from the water during it.
3. **The checkpoint at the raft (A10)** brings him back at 50%, straight to the road breaking. REC keep (brief). Alt: no raft checkpoint, so a death redoes both phases (harsher; the 10-16 'fewer checkpoints' direction).
4. **Storm night** (causeway3w Q6): the reach's SKY goes storm-night with far lightning, and the playfield stays lit so his tells read. REC keep. Alt: the act-III darkZone (0.64) over the fight as well.
5. **THE SNAP + the hug-bite** (new, not in the brief): his answer to standing in his face between moves. REC keep (it is what makes the openings the way to win). Alt: no snap, and phase 2 longer instead.
6. **Cuts on his arms do not hurt him on the raft**: the face is the target, "clear the deck, punish the face". REC keep. Alt: a cut passes 0.25 to him.
7. **The INK is back on the raft** (the brief asks for it) though P1's ink was hotfixed off on 09-26 ("looks weird"). It is drawn as cloud blobs now, not a band, and only from 2/3 of the raft bar. REC keep for your playtest. Alt: cut it.
8. **The EYE comes out only under the flag**: master's live Causeway keeps it until Causeway 2 ships, then the code goes (OWED 4). REC keep (no live change from a code-only lane). Alt: a small master hotfix that ends master's fight at stage 2 now.
9. **New music for the raft half**: lane-musickraken holds the candidates. REC wire your pick in the art or tune lane. Alt: keep 'kraken' for both halves.

## Final tip
claude/kraken3 FINAL TIP: the commit after 75fa5ec91 that adds this report (`git log -1 origin/claude/kraken3`).
