# claude/poses2 — lane P, done (2026-09-24)

The job (approved by Daniel): give the other four heroes' abilities bodies of their own, as the Knight and the Warden already
had; give each hero's actives distinct poses; give all four the starters' take-off frame and three-beat landing; take the
KNOWN_POSELESS ratchet to 0. Poses only — no box, cost or cooldown is touched anywhere on this branch.

## Commits

| sha | what |
|---|---|
| `e5f22fc` | WIP (integrator save): `tools/pose-sheet.mjs` learns `others`; `docs/pose2-before.png` |
| `77b0f5b` | WIP (integrator save): **PALADIN + PYROMANCER** (and the Freebooter's/Death Knight's) pose timings in `src/hero-poses.js`, the `kitPose` calls in `src/main.js`, POSE_PICK (Hammer Leap follows his arc), POSE_DASH (Holy Charge / Cinder Step draw ahead of the roll) |
| `cd9fee1` | WIP (integrator save): **PALADIN + PYROMANCER** frames in `src/chars.js`; ability-poses holds them |
| `501aeab` | **FREEBOOTER**: every active a body of its own; take-off + three-beat landing |
| `2325407` | **DEATH KNIGHT**: five distinct casts (Summon Skeleton alone keeps RAISE); KNOWN_POSELESS reaches 0; every hero HELD; distinct-pose rule with SHARED_OK; jump arc asserted for every hero |
| `c32137e` | merge origin/master (the Geomancer): both sides kept in all three conflicts; she is HELD too |
| `4ff9a04` | before/after pose sheets; the sheet holds the invulnerability blink off before each capture |
| `a4978c4` | merge origin/master (clean) |
| `fba5387` | **follow-up 1**: a posed dodge is not blinked out; ability-poses asserts it (proved red first) |
| `e180d51` | **follow-up 2**: real-page screenshots, one per hero, `tools/pose-shots.mjs` |

The Paladin and the Pyromancer have no commit of their own: the previous run was stopped mid-work and the integrator saved it
as WIP (`77b0f5b`, `cd9fee1`). That history was already pushed, so it was verified in place (node --check, then the full
keep-green list) rather than rewritten.

## The ratchet

`tools/ability-poses.mjs`: `KNOWN_POSELESS = {}` (13 on 2026-09-23). All seven heroes are HELD
(`knight, warden, geomancer, paladin, pyro, pirate, reaper`): 52 of 52 actives have a body of their own, each a pose no other
active of that hero uses. SHARED_OK has one entry — HARRIER is the Warden's vault, as Pole Spring's is. Every hero is held to a
take-off frame, four or more air poses and an impact/settle/stand landing.

## Follow-up (Daniel's answers)

1. **The blink.** Holy Charge and Cinder Step set the dodge's invulnerability, and its blink left the hero undrawn on 12 of
   the 24 frames of the grace. While a dodge whose pose is in POSE_DASH plays, its grace is copied to `P.poseInv` and runs
   down beside `P.inv`; the draw leaves the blink off until it is out. `P.inv`, its length and every box are untouched; the
   grace after being struck still blinks. The assertion (in ability-poses): every POSE_DASH active draws the hero on every
   frame of its grace, at least two such actives exist (so it cannot pass on nothing), and a struck grace still leaves frames
   out. RED on the old draw (`PYRO CINDERSTEP is blinked out on 12 of the 24 frames`), green on the new (24/24 each; struck
   grace 19/36).
2. **Screenshots**, headless Chrome on the real page, BK.step: `docs/poses2/paladin.png`, `docs/poses2/pyro.png`,
   `docs/poses2/pirate.png`, `docs/poses2/reaper.png`. Six captures across each active, then the jump and landing.
   Before/after sheets: `docs/pose2-before.png` (master 341cb78), `docs/pose2-after.png`.

## Checks (subset, each run alone — never the full suite)

ability-poses, starter-kits, attack-animation, combat-feel, render-layers, skill-menu, tells, textfit, comments, syntax: green
after each merge and after `fba5387`. No re-runs were needed. `dangling-paths` (not on the keep-green list) is RED after
`a4978c4`, and not from this lane: `docs/SECOND-PC.md` and `docs/INTEGRATOR.md`, which came in from master, cite 10 files
other lanes have not landed yet. That failure is on master, not on this branch, and it is left for the integrator.

## What looked wrong in the real page

- **Effects bury the body.** Vent's first frames (+2, +5) are a white disc with the pyromancer inside it; CINDER STEP from about
  +9 on is fire and smoke with her barely visible; Holy Charge +14, Gravecall +2 to +9, Summon Skeleton and Rum are similar.
  The poses are drawn, but the particle bursts sit over them. Worth a look at effect alpha or layer order — not done here
  (poses only).
- **Blessed Hammer** draws the paladin whitened for most of the throw — it looks like a hit flash. Not investigated.
- **Landing within 7 frames** shows land:0, land:0, land:1 — the three beats exist (the check sees them over 24 frames) but the
  settle is short enough to be easy to miss.
- The capture level (level 0) puts its title banner and an NPC in the first frames; the Death Knight's jump has the
  "HOLD C WARD" hint over it. Scenery, not poses.

## Parked

- Whether to lower the effect alpha or reorder layers so the bodies read through the bursts (above).
- The Blessed Hammer whitening.
- The clone lives at `C:\Users\Daniel Raphael\.claude\bracken-poses2` (the lane said "the current directory"); other lanes
  live under `bracken-work\`.
