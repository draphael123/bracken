# claude/sporewood — lane report (2026-09-25)

SPOREWOOD rebuilt around its own rule, **THE CAPS GROW INTO STEPS**, as Daniel approved from the level review's "needs work".
Everything is on `claude/sporewood` and pushed. I did not touch master, deploy, or run the full suite. Design:
`docs/briefs/sporewood-rebuild.md`.

## Commits

| sha | what |
|---|---|
| `249d908` | the brief, before any build |
| `d599af8` | **1/3 the rule**: root step, leaning caps, dripping stair, the Gills' sign, her jam; before-captures |
| `3ac8edd` | **2/3 the empty sections and the signs** (+ the one-sentence-one-sign rule in `tools/signs.mjs`) |
| `c929ebc` | **3/3 the look**: shelf fungus, own canopy and ambient, no dead trees, tint to the end; after-captures |
| `c2b1477` | F9 fixes: the play bot boards and leaves buds; no shield on the leaning cap's landing |
| `328b3d1` | merge origin/master. Only conflict was `tools/check.mjs`: kept every name and added `spore-caps` |

## How it was stripped

`288263e` (playtest item 12, 2026-09-19) simplified the wood with a strip pass at the end of the builder. It removed every
puffball, roller, nest, shaman, drone, gill, sleep zone and the spore storm. It also rewrote every sign that mentioned them to
"FOLLOW THE CAPS...". The sections built around those things were left standing empty. `tools/spore-loop.mjs` enforces that
removal, and it still holds: none of those things came back.

## The rule, in route order

0. **THE ROOT STEP** (glade, col 37). A root 4 rows high stands before the canyon, with a bud at its foot. Stop on the bud and it
   rises; step off onto the root. Nothing else is on that stretch. The rule's sign moved here from the terrace (285), where no cap
   ever grew.
1. **THE LEANING CAPS** (the old vent marsh, 175-209). There are two gaps with a stump between them. The gaps have a floor with
   springs back out. A bud on each lip leans over its gap at walking pace and sets you down on the far side. If you stay on it,
   it withers back and carries you home. A spitcap on the stump shoots at you while you ride.
2. **THE DRIPPING STAIR** (the old Tumble, 245-284). There are two tiers, each 4 rows high, with a bud at each foot. A spore fall
   hangs over each bud: it uses the rockfall's ring tell and hits for 10. Grow your step between clumps. If you ride up in the
   column, the clump hits you. A grown cap is also a roof: a hero standing under it is not hit.
3. **THE DEEP GILLS** (449, 455), as before. Striking a glowbud wakes the sprouts beside it. Their sign now says this.
4. **THE PAYOFF: HER CAP JAMS ON YOURS.** Her room has 2 buds, 5-6 tiles either side of her, inside her fold's reach. They are
   clear of the springs, the shelves and all four knot anchors. Stop on one and it lifts you 64 px, which is the height she answers
   with THE CAP CLAP (`!!`, 0.9 s tell). Drop off during the tell: her cap jams on the grown one and her heart opens. It is the same
   window, spring and single cut as the knot. Her seeds and the phase-3 rain also burst on a grown room cap.
   - **Exactly what changed in her kit:** one call, `motherJam(e)`, after the clap's damage check, which is unchanged. It finds a
     fully grown room bud within 110 px of her, crushes it, and opens her heart, but only when the knot's rest has run out. So it
     is a second key to the same lock, not an extra opening.
   - **Why:** A11 asks for an opening the player causes, and A12 asks that the room supply what the clap assumes. The jam saves
     the walk to a far knot (−16 / +17, about 300 px), which is the walk the Death Knight could not make in time.
   - **Not changed:** her attacks, timings, weights and health.
   - **Also:** the knot never grows a room bud. `src/lab.js` (the pilot) is untouched.

The shared mechanics changed to support this:
- A bud now grows only under a hero who **stops** on it. Brushing it in passing does nothing, so a room bud cannot rise behind
  the pilot.
- New per-sprout settings: `lean`, `growT` and `hold`.
- `src/reachcore.js` now lets you ride a leaning cap over its whole footprint.
- The play bot now hops onto a bud with a held jump, waits, and walks off a grown one.

## What was cut or refilled (chunk 2)

- **Vent marsh:** the 5 vents, 4 snapping shelves and the vent ledge are cut. The leaning caps replace them.
- **Tumble:** the 2-row steps are gone; the dripping stair replaces them. The rollers stay out (spore-loop forbids them).
- **Puffball Bog:** the two geysers that lifted you over nothing are cut. The crossing is now under fire: a weaver over the
  middle sink and a spitcap on the near bank. The garrison already puts one on the far bank.
- **Signs:** all 14 are different and true:
  - the glade now says the wood sickens as you go (its old "the rot runs downhill" described a puffball cloud);
  - the spitcap sign explains its stamina cloud;
  - the canyon sign covers the vent and the plunge;
  - the fork sign says the cellar shuts behind you;
  - the terrace now teaches the lurker;
  - the pillars' sign moved from 328 (45 columns early since the bog grew) to 369;
  - the Gills and door signs cover the rule.
- **Fix the rule:** `tools/signs.mjs` now fails any level that uses the same sentence on two signs. It found one other: the
  Hurricane repeats "THE DECK IS SPLITTING..." at 88, 235 and 570. It is on a KNOWN list that can only shrink.

## Look (chunk 3). Levelfix had already removed the stranded spitcap

- **Orange board ledges → shelf fungus.** One `shelfSpr()` now draws both the laid shelf and the regrown one; they used to be two
  copies of the same ternary. `bakeShelfFungus` draws a pale lip, a violet body and gills, on the same rows as before.
- **Canopy:** it was the Marsh's, byte for byte; it is violet now.
- **Ambient:** it was `hive` (the Hornet Queen's buzz); it is `drip` now.
- **Dead trees:** the 7 are now roots and spore pods, and the dress roster's `deadTree` slot is now `mushroom`.
- **REVIEW tint:** it stopped at 504; it now runs to `L.W`.

## Numbers

| | before | after |
|---|---|---|
| INDEX (`tools/curve.mjs`) | 76 (60 foes, threat 134, 8 kinds) | **83** (65 foes, threat 145, 9 kinds). The Kingswood wall shrinks from 43 to 36, still over RAMP_WALL 26 |
| mother-pilot refill (90-150 s every hero, tool unmodified) | 104.1-115.9, all killed | **106.4-119.6, all killed** (final, merged tree) |
| mother-pilot normal | 5/6 won | 6/6 won |
| mother-hard-pilot, 2 pinned salts (3031, 3228) | 10/12 (83 %), median win 109.9 s, 63 dmg/fight | **10/12 (83 %), median 110.5 s, 66 dmg/fight** (reaper 0/2 both times) |

**F9 walk** (`tools/spore-walk.mjs`, knight and warden, no god mode, section by section):
- The leaning caps leg arrives for both (26 s / 25 s), and so does the dripping stair leg (35 s / 73 s).
- Where legs stop, they stop where they did before the rebuild: the canyon at 60, the pillars at 399 (warden; the knight arrived
  on one run) and the larder spider at 484.
- The bot's play pass: 0 bugs, reach 97 %.

**Captures:** `docs/sporewood/<place>-before.png` / `-after.png` for the glade step, shelf climb, vent marsh, tumble, terrace,
bog, pillars, gills and the Mother's room. There are also two after-only shots of the rule in motion: `lean-ride-after.png`
(halfway over the gap) and `jam-after.png` (her fold jammed, heart open).

## Checks

- **Green on the merged tree** (one subset run, nothing needed a re-run): audit, traps, killzones, collectables, spawns,
  deadends, floaters, checkpoints, skins, dressing, signs, pixels, map-grammar, one-new-foe, threat-holes, elites,
  ambush-single, ambush-reach, occluders, ground-depth, mother-cap, small-adds, tells, boss-openings, boss-fight-end,
  arena-supplies, textfit, comments, homepaths, dangling-paths, keys, content-audit, spore-loop, spore-caps.
- **Also green:** checkpoint-gaps (from master), run alone; `node tools/newlevel.mjs spore`; mother-pilot; mother-hard-pilot.
- **Not run:** `architecture` is not on master yet (it lives on `claude/monastery2`). Sporewood has no masonry for it to judge.
- **New or extended checks, each proved red on the previous commit's code:**
  - `spore-loop`: rule taught before column 60, three uses, room buds in reach, the jam in code, no idle vents, the bog under
    fire, and its own look;
  - `signs`: one sentence, one sign;
  - `spore-caps` (new, headless, in the list): drives every use in the page for knight and warden.

## Questions for Daniel

1. **Should the jam also open her while the knot is resting?** Right now it doesn't, so the pace of her fight is unchanged.
   *Recommendation:* keep it gated until you have played it. If the jam is fun and rarely used, ungate it for phase 3 only.
2. **AMBUSH_HEALTH.spore is 6**; every other room is 1-3.3 (review item 4). *Recommendation:* bring it to 2.5 and measure all
   heroes with `BK.ambushLab`. It is a balance number, so I did not change it without you.
3. **The Kingswood wall is still 36.** *Recommendation:* no ramp tuning on Sporewood until you have played this. The next cheapest
   lift is another authored fight in the terrace, rather than more hazard.
4. **The Hurricane's triple "THE DECK IS SPLITTING" sign.** Is it a refrain on purpose? *Recommendation:* give each split its
   own line (for the Hurricane's owner).
5. **The canyon at col 60 has stopped the play bot since before this lane.** *Recommendation:* a person should check the climb
   by hand; the bot cannot ride the mover-cap there.
