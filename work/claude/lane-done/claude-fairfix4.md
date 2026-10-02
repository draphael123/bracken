# claude/fairfix4: the fair's music, its bull's-eye floors, and the Wicker Queen reworked (Opus, 2026-10-02)

Base: claude/batch55 d12c0941 (master + COMBAT3 + CANALART). Brief: the coordinator's FAIRFIX4 brief (Daniel, 2026-10-01 evening). Nothing here ships without Daniel's review.

## Headline numbers

| | before (base d12c0941) | after |
|---|---|---|
| mash bot vs the Wicker Queen (L23, knight/warden/pyro x 2 seeds) | **1/6** (knight seed 1 won in 68.6 s) | **0/6** (boss left 75-90%) |
| mash bot, fresh level-1 heroes | - | 0/3 (boss left 92-97%) |
| mash bot, the fair's level run (knight) | died | died (hp lost 153%) |
| human bot, `node tools/combat-pilots.mjs fair` (normal health, L23) | **3/3** (combat3's after numbers; and 3/3 again on this branch before tuning, 26-56 s, 20-33 damage taken) | **2/3 = 67%** - knight win 60 s (31 taken), warden DEATH 109 s (boss at 10%), pyro win 130.6 s (90 of 172 taken) |
| her opening | 3.2 s (3.0 phase 3) | 3.0 s every phase, and now TWO ways to open it |

`fair: ['boss']` is deleted from `MASH_REPORT_ONLY` (tools/level-quality.mjs): the fair's boss row is ENFORCED now. Only the fair's rows in
docs/mash-bot.json were re-stamped (`node tools/mash-bot.mjs fair --probe --l1 --write`, then `--level fair --heroes=knight --write`).

## 1. Music: the music box is gone
- "The old music" Daniel heard was the synth MUSIC BOX (src/audio.js) playing over "Dark Carnival". Removed:
  - the box itself (`BOX_N`, `BOX_TUNE`, `boxStep`, `musicBox`) in src/audio.js;
  - the two hooks in src/main.js (the `musicBox.stop()` on leaving the fair and the per-frame `musicBox.wind(...)`), and the import;
  - its wind table (`WIND`, `windAt`) in src/redraw/fair_world.js, which nothing else used.
- tools/harvest-fair.mjs: the "music box winds down" asserts are replaced by asserts that it is gone (no `musicBox`/`BOX_TUNE` in the audio, no music box in
  main.js, no `windAt`), that both fair tracks are plain file entries with no synth layer keyed on them, and, in the page, that the road asks for
  `harvestfair` and her fight for `wickerqueen`.
- **Verified in a page with live audio** (a throwaway script, not committed): on the road `currentTrack` is `harvestfair` and it is a file; past the
  door, once she wakes, `currentTrack` is `wickerqueen`, a file; the audio module has no music box.

## 2. Bull's-eye tents: the floor stands from the start, the target opens the way in
- **The nest floors are built at level load** (src/harvest-fair.js): the crow's nest (176-181, row 13) and the shelf over the wheel (311-313, row 11)
  were plank runs a bull's-eye raised; they are `plat`s now. The yard's nest is the hall roof and was already there.
- **What the target opens is the WAY IN**: the step planks up to the nest. Shut, each one is drawn RAISED - a gangplank swung up on its hinge and
  roped, with the targets' red-and-cream bull's-eye painted on it, and a faint line where it will lie. Struck, it comes down as boards (src/redraw/fair_newrides.js
  `raised`, `drawNests`).
- **The tent floor is drawn always**: boards with a light top and a dark lip, posts, the striped awning and a lit lantern with a warm glow; the pennant is
  brass while the way in is shut and green once it is open.
- Tests (tools/harvest-fair.mjs): every gallery nest's floor exists at build and is not one of the planks a target raises; the crow's nest has its floor
  before the gallery opens (in the page). The wheel's bull's-eye now runs up one plank run, not two (its second run was the shelf's floor) - that row
  is a rules change, commented.
- Looked at on screen (scratch shots, not committed): the nest floor reads as a lit stall with boards; the raised gangplanks with their bull's-eyes are
  visible from the terrace. From the terrace itself the crow's nest is above the top of the frame (it was before too) - see UNVERIFIED.

## 3. The Wicker Queen
### a. Her own fire, struck back (src/wicker-queen.js, src/main.js `wqBallsStep`)
- Her burning WICKER BALL can be STRUCK BACK into her. A blow BEGUN while the ball is 6-32 px in front of you (`retLate`/`retReach`; about 0.17 s
  of its run) sends it back at 240 px/s. When it reaches her she CATCHES FIRE (`wqIgnite`): the same opening as the fire pits, and nothing is banked
  or spent. Up on a perch, it knocks her down onto the boards.
- **A mash cannot do it.** The blade must have been held `retSet` = 0.7 s before the blow. Every mashing hero begins a blow every 0.38-0.5 s
  (measured: knight/warden/pyro/geomancer 0.5, freebooter 0.38), so a masher only scatters sparks off it ("TOO WILD: WAIT, THEN STRIKE AS IT COMES")
  and the ball hits him.
- **The Pyromancer's EMBER FLARE returns it too** (`P.emberUp` with the ball within 34 px).
- **Told**: the tell line is THE WICKER BALL: STRIKE IT BACK; in your reach the ball has a flashing white ring; struck, STRUCK BACK; reaching her,
  HER OWN FIRE: SHE CATCHES (all in src/hint-lines.js).
- She bowls more often: every 8 / 7 / 6 s by phase (was 9 / 8 / 6.5), the first at 4 s (was 5.5).
- The fire pits stay as the second way.

### b. The copies (phases 2-3; the CROWNING calls them now)
- She lifts her crown and 2 (phase 2) or 3 (phase 3) wicker copies stand up out of the straw round the ring, 140 px apart. Two crownings in three she
  trades places with one of them.
- **The tells, always there**:
  - HER crown flickers with real fire, and her ribbons blow in the wind (src/redraw/wicker_fx.js `drawReal`) - held in a look her feet stop but these
    never do;
  - SHE casts the only shadow (src/main.js `drawWickerGround`);
  - in the full dark her burning crown is a light (`wqHoles`), the copies' straw crowns give none;
  - **THE COPIES FREEZE WHEN WATCHED**: a copy under a look is frozen dead (its anim stops, not a reed moves).
- A copy keeps the mummers' ways: it creeps at a turned back, glows (told, `!!`) and stabs for 20; a look cancels the glow.
- Struck, a copy bursts into burning straw: 8 to whoever stands within 30 px (`strikeCopy`, src/main.js `wqCopiesStep`). Her copies go up with her
  when she dies.

### c. Her summoned adds are gone
- The crowning no longer spawns mummers. `summon` and `adds` are gone from her hands, and the `crownCap` test is replaced.

### d. The Bonfire Ring (her one new fire attack, `ringTell` / `ring`)
- **Told 1.5 s**: a row of lanterns over the ring FLARES - all but the ones over the gap, which stay dark - and the gap is marked on the boards.
- **Then 2.8 s of fire**: a wall of fire 34 px high runs round the boards with ONE GAP, 60 px wide, that travels along the ring at 46 px/s (bouncing at
  the walls). Anything on the boards outside the gap burns 18 every 0.45 s. A rider on a horse is over it. A hop does not clear it.
- The gap is set 110-220 px from the nearest hero, on the side with room.
- **Marks**: `!!` / dodge / low in src/marks.js; `node tools/tells.mjs --write` was run.

### Kept
- Her spear (high/low thrust and the stab), the lashes, the ribbon sweep, the leaps, the burning floor, the fire pits and the ride.
- Every cycle changes (`WQ_CYCLES`), and the greed reprisal (combat pass).
- OWN_WARD stays in src/boss-greed.js (her own x0.05 outside the burn).

### SHE ALWAYS FIGHTS, and the tuning
- **Her clocks now run while she burns.** She comes up off the fire swinging; only her fling and her leap stop the clocks.
- **Her choice order**: the copies first (when she has fewer than her phase's count), then the spear, the burning floor, the bonfire ring, the ball,
  the lash, the sweep. Before, the ball and the crowning almost never got a turn: 1-2 balls in a 3-minute fight.
- **Tuning against the human bot at the fair's depth**:

| knob | before | after |
|---|---|---|
| health | 640 | 1100 |
| burnMul | 0.9 | 0.7 |
| burn length | 3.2 s (3.0 phase 3) | 3.0 s |
| ring pits she starts with | 2 | 1 (cap 4 as before) |
| floor | every 12 / 10 / 8 s | every 11 / 9.5 / 7 s |
| stab | 26 | 28 |
| lash | 20 | 24 |
| floor burn | 16 | 18 |
| thrust | 22 | 26 |
| ball | 18 | 22 |
| sweep | 18 | 22 |
| stomp | 18 | 20 |
| ring (new) | - | 18 |

  - Why: at hero level 23 a knight cut 640 health away in four or five burns. Every fight was 26-56 s, and the bot took 20-33 damage.
- **The lab bot (src/lab.js)** now plays the new fight as a human would:
  - It holds its blade and faces a ball coming at it. It begins one blow at a point of its own for each ball: 0-44 px off, so about 6 balls in 10 are
    met (deterministic, the row's dice untouched).
  - As the Pyromancer it flares.
  - It jumps a ball it did not meet.
  - It reads copies as it read her crowd: it looks at a glowing one and cuts a near one.
  - It takes the bonfire ring's gap, or a horse, whichever is nearer.

## Checks (named, never the suite)
**Green on the final branch**, run as one named batch (`npm run check -- harvest-fair,wicker-queen,boss-openings,boss-fight-end,level-quality,audio-assets,boss-music,soundtest,textfit,tells,hint-shown,architecture,dangling-paths,slopes-trace,mash-gate,boss-greed,checkpoints,skins,npc-removal`):
- wicker-queen, boss-fight-end (48 fights), level-quality (the fair gated, its pilot and mash rows fresh), mash-gate (21 levels with report-only parts, from 22), boss-greed
- audio-assets, boss-music, soundtest, textfit, tells, hint-shown
- architecture, dangling-paths, slopes-trace (every level identical, the fair included: no rebase), checkpoints, skins, npc-removal

Two were red in that batch and are green re-run alone:
- **boss-openings** was red for a real reason. Its Wicker Queen rig quiets her other blows but not the new bonfire ring, which fired over the lure. The rig now sets `ringCd` as it sets her other clocks: the same assertion, not weakened. Green.
- **harvest-fair** was red with a load flake ("Runtime.enable did not answer within 15000ms" while the batch ran). Green alone, as it was earlier on this branch.

- **New assertions.** Each fails on the base: the base has no `wqIgnite`, `strikeCopy`, `gapOf`/`ringCatches`, `ringTell` mark or `fakes`; its crowning
  summons; its music box exists; its nest floors are planks.
  - tools/wicker-queen.mjs, pure:
    - phase 1 never crowns; phase 2 stands up 2 copies after the tell, phase 3 stands up 3, with no crowd;
    - a watched copy is frozen dead (x and anim unchanged); an unwatched one creeps;
    - a copy at a turned back glows and then stabs, and a look cancels it; a struck copy bursts;
    - the ball struck back opens her for at least 3 s with nothing banked; it cannot relight her while she burns; it knocks her off the pole;
    - the strike-back is a held, short-window blow;
    - the bonfire ring is told, its gap is placed a run away and travels; it spares the gap and a rider and burns a hop.
  - tools/wicker-queen.mjs, in the page with real keys:
    - a blade held and begun as the ball reaches him sends it back and she catches (open 3.2 s);
    - a MASHED blade (10 presses) never returns it, and the ball hurts;
    - the ring hurts a hero outside the gap (55-77) and spares one in the gap or on a horse (0);
    - a struck copy bursts with a small hurt (6);
    - the crowning spawns no mummers.
- **Re-stamped**:
  - docs/mash-bot.json, the fair only;
  - docs/level1-pilot.json, the fair only (its level hash changed with the nest floors): 49 hits, 0 deaths, walked 100%. Before: 50 hits, 0 deaths.

## UNVERIFIED
- **No hands-on play.**
  - The strike-back window (about 0.17 s, after a 0.7 s held blade) is the thing I most want Daniel's hands on: it could be too tight. It is one
    number each (`WQ.retReach` / `WQ.retLate` / `WQ.retSet`).
  - Co-op is untested: each hero keeps his own swing clock, and either can return a ball.
- **The pictures were looked at** (scratch, not committed): the copies, the ring's tell and fire, the ripe ball, the nests.
  - The copies are the same baked sprite as her. Their difference is only her crown fire, her animated ribbons and her shadow - small, as asked. In
    the bright phase 3 picture the crown fire is easy to miss next to her burning body.
  - From the gallery's terrace the crow's nest is above the frame; the raised gangplanks are what you see from there.
- **Pilots: one seed per hero.**
  - The 2/3 sits on one death (the warden, boss at 10%). The knight still wins easily (60 s, 31 taken).
  - tools/wicker-queen-pilot.mjs (fresh level-0 heroes) was run once mid-tuning only: 1/3, 128-178 s.
- **The Pyromancer's ember projectiles do not burst a copy** (only a blade or a plunge does); she can still freeze copies with a look.
- `wqNearSight` and the `fromQueen` loops in src/main.js are now dead code: nothing is crowned into the crowd any more. They are left in place,
  harmless.

## QUESTIONS FOR DANIEL (the recommendation is what is built)
1. **Her health went 640 -> 1100 and a burn is worth 0.7 a blow (was 0.9).** Your brief said the ball's opening is "full damage". At the fair's
   campaign depth, full damage on 640 health ended every fight in 26-56 s with the human bot unhurt.
   - Rec: keep 1100 / 0.7 (human bot 2/3, 60-131 s).
   - Alternative: burnMul 1.0 with about 1500 health. That is the same fight length, and "full" is literally true.
2. **The strike-back needs the blade held for 0.7 s, then a blow begun 6-32 px before the ball reaches you.** That is what makes it mash-proof.
   - Rec: keep.
   - If it is too tight in your hands: widen `retReach` to 40. Do not lower `retSet` under 0.55: a masher swings every 0.5 s.
3. **Her copies hurt only from behind (the mummers' stab, 20) and burst for 8 when struck.**
   - Rec: keep. They are her pressure in place of the crowd.
   - Alternative: copies that also throw a weak ribbon lash when watched.
4. **The bonfire ring runs in all three phases** (every 16 / 13 / 11 s).
   - Rec: keep.
   - Alternative: phases 2-3 only, so phase one stays the teaching phase.
5. **The crow's nest is above the frame from the terrace**, even with its floor drawn.
   - Rec: leave it. The raised gangplanks with their bull's-eyes now show where the way in is.
   - Alternative: drop the nest two rows, which means re-routing the loft.
