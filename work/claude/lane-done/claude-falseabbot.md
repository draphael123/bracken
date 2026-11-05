# FALSE ABBOT rework + rooftop finale (lane claude/falseabbot, 11-05, Opus, code-only)

Branch `claude/falseabbot`, off `claude/monastery3-1105`, in worktree `bracken-lanes/bracken-falseabbot`. It is pushed, but nothing is merged or deployed.
- **Behind MON3 only.** With the flag off, master is unchanged: the spire hash is `ec117fb3f7fb` (534 ents), the same as master's. The old fight's proof, `tools/false-abbot.mjs`, still passes 86 ok.
- **No browser was opened.**

## PLAN (short, written first)
- **Daniel's 11-02 15:55 brief:**
  - #4: the False Abbot uses the building. P1 in the chapel, P2 in the bell tower, the floor collapses between phases, bell shockwaves along the beams, he lights braziers, he calls the congregation.
  - #6: a rooftop climb outside, under the bells, into the fight.
- **Openings:** one clear main opening and one second opening, the same in both phases. The chair and basket go, because P2 was unclear after about 100 kills (10-29 and 10-30).
- **Main opening:** strike the bell while he is on its bridge. This is the P1 that Daniel called "perfectly fine".
- **Second opening:** he lights a brazier to pray. Ride its smoke up and come down on him.

## BUILT
### THE BUILDING (rows 0-31, `src/abbot-chapel.js`, called from `src/monastery3.js`)
- **THE WEST FRONT, outside (x1-47): the rooftop climb.**
  - The last wheel's trapdoor (35-45 @30) now comes up OUTSIDE, on the aisle's leads.
  - You climb four stone string-courses, 3 rows apart, to the bell-cote's SILL (40-47 @14). The sill stands on a buttress, and the arch into the belfry is beside it.
  - **Shortcut:** a bell on the sill lets a rope down the front (`tbell rope [39,14,28]`), so a retry is the trapdoor and then the rope.
  - One harpy (birds stay outside).
  - Two secrets off the route:
    - the top silver, two courses over the bell-cote
    - the relic vault's spot, moved to a mason's niche off the first course
- **THE BELFRY (x49-93, floor 19): P2.**
  - Two towers and the great bell's gallery at deck 13.
  - Two bridges, each hung from its tower's bell.
  - The great bell (70,18), and two braziers in the open bays.
  - On the way in you drop through it and climb down THE GREAT BELL'S ROPE (x92) into the chapel.
- **THE ABBOT'S CHAPEL (x49-93, floor 30): P1.**
  - THE ROOD (60-80 @24) on two piers, hung from two bells.
  - Three pews.
  - The altar, with two braziers.
  - The exit gate.
- **During the fight:** the arch and the rope's hole are barred while he fights (`house.bars`). They open again on a death or a win. No sprinkled garrison up here (`calm`).

### THE FIGHT (`src/false-abbot.js`, only where `house.m3`)
- **P1, the chapel (above 50%).** His kit as before (censer, chain, rope swing, false light, coals). Added:
  - **THE CONGREGATION CALL.** Told for 0.9 s. Two foes come up out of the pews, never more than 3 of his at once. It replaces the silent timed summons.
- **THE FLOOR GOES (at 50%).** It waits until his hands are free, never in the middle of a fall or a downing.
  - **Told for 1.6 s:** a red mark on the chapel floor, cracks in the vault, falling grit.
  - The belfry floor over the nave (77-80 @19) falls into the chapel as rubble steps.
  - He takes the rope up and the rood is hauled back.
  - **The way up:** rubble, then the rood, then rubble under the hole, then the belfry floor. Every step is 3 rows, and every hero's rise is 3 rows.
  - He gets a 6 s rite cooldown on arrival, so the climb is not a race against a heal.
- **P2, the belfry (below 50%).** Adds:
  - **THE PEAL** (red, told 0.9 s). He strikes a bell and a ring runs both ways along the boards he stands on, at 230 px/s for 16 damage. It cannot be blocked, so you jump it. It stops at the hole.
  - **THE KNELL.**
- **If you stay below him in P2:** he lobs false light and calls the congregation, and does not come down. Every 7 s he says "UP THE FALLEN FLOOR", and you get a one-time hint.
- **Openings (both phases).** His rite takes turns, bridge then brazier:
  - **MAIN:** he kneels on the rood or a belfry bridge. A bell struck under it drops it with him: he is downed for 4.2 s at 2x damage.
  - **SECOND:** he LIGHTS a brazier and kneels by it. Its smoke lifts you, and a plunge on him while he prays is THE OPENING. The brazier keeps smoking while it wards him, so a plunge while he is warded also opens him.
- **Resist floor:** warded is 0.4x and unwarded is 1x. He is never invulnerable. No falling-pillar openings: both openings are bells and smoke.
- **Finale:** kept. Beaten down at 5% (P2), the great bell is the last blow.
- **Bestiary card:** under MON3 it describes this fight.

### MAIN.JS HANDS
- Stage houses: each storey in the shape `false-abbot.js` reads.
- ctx getters for `floor`, `house`, `ropes` and `landing`, so they follow the storey he is in.
- `abbotCollapse`, `abbotBars`, the call from the pews, both storeys drawn.
- The bells and the smoke are read on the active storey.
- The braziers are drawn cold until he lights one.
- The wave and the collapse tell are drawn in `drawFalseAbbot`.

### LAB HOOK (for the tune lane)
- `MON3=1` in the environment makes `tools/cdp.mjs` open every tool page with `?mon3=1`. So the tune lane can run: `MON3=1 PORT=<free> node tools/boss-rates.mjs spire --seeds=6`
- `src/lab.js` has the m3 hands:
  - it reads the storey's floor
  - it climbs after him (`house.climb`)
  - it jumps the peal
  - the existing branches already strike the bridge bells and ride the smoke and plunge
- **Not yet run:** it is a browser run (see BROWSER OWED).

## NODE RESULTS (MON3=1, each tool run on its own; tools/check.mjs not run)
- **`tools/false-abbot3.mjs` (new): 44 checks, all pass.** It runs on the house the level really builds:
  - the building's geometry
  - both openings in both phases
  - the turn-about
  - the call and its cap
  - the floor going, then the belfry
  - staying below him
  - the peal: it hits on the ground, misses in the air, and stops at the hole
  - the 0.4 floor all fight
  - the scripted fight ends at the great bell in about 120 s with 10 openings
- **`tools/false-abbot.mjs` (old fight, flag off):** 86 ok, unchanged.
- **Green:**
  - level-quality spire CLEARS
  - architecture: everything stands
  - solid-islands ok
  - reach-heroes spire: 0 new, 0 known
  - monk-machines: 111 ok
  - stuck --static OK (a new spot for the bell-cote bell)
  - checkpoints, floaters, elites, ambush-listed, boss-read: ok
- **RED, and the same red as the base branch:**
  - checkpoint-gaps spire: "no shrine before the room". Daniel 11-05 09:24 gave this check's fix to the MONASTERY 3 art/finish lane.
- **Listed only:** anchor-lint and floating-geometry list the hung bridges and corbels. They are not gated.

## BROWSER OWED (none opened)
1. **Win rate:** `MON3=1 PORT=.. node tools/boss-rates.mjs spire --seeds=6` (practiced; n=6 first; band 60-70% with flasks). This is the joint tune lane's.
2. **Play `?mon3=1` with 1 seat and with 4 seats, every hero.** Hero spots:
   - the west front climb and the rope shortcut (strike it, die, and check it is still down)
   - the arch, the drop into the belfry, and the climb down the rope (the trigger is at y0 row 22)
   - the bars shutting with nobody inside a barred cell
3. **The read:**
   - rood bell to drop
   - brazier smoke ride to plunge (the column is 150 px, from the chapel floor to about row 21)
   - the floor going: the tell, the rubble climb with the rood up, landing beside the hole
   - the peal's jump timing
   - the 7 s nudge
4. **4 seats:** the call cap (3), the bars, and a co-op seat left below in P2.
5. **The rest:**
   - stuck runtime
   - floats-in-page
   - mark-integrity
   - boss-fight-end
   - boss-openings
   - re-pilot: `level1-pilot spire --curve`; level-quality says the curve row is stale

## ART OWED (art before live)
- **The building:**
  - the west front's wall face, with the string-course corbels, the buttress and the sill
  - the bell-cote with its bells over the sill (bellFrame decos for now)
  - the belfry's arch
  - the belfry floor's hole and the rubble steps (tiles today)
  - the chapel's piers and stone caps
  - the pews (`deco pew`)
  - the altar
- **The Abbot's poses:** the PEAL, the CALL and the FLOOR GOES use the knell and rite-flare frames for now. Each needs its own pose.
- **Fx:** a lighting flare for the brazier (only a burst for now). Draw the peal's ring as bronze on the boards.
- **His fall in the belfry:** off a bridge over the hole, he is set down beside the hole (a ≤2-tile shift). The art pass may want an angled fall instead.
- **Interiors reused at new sizes:** monkTower and monkChapel. Check they read.

## QUESTIONS (recommendation first; the rec is built)
1. **"Floor collapses between phases" while the fight goes UP (chapel, then belfry).**
   - **Rec (built): the BELFRY floor over the nave comes down into the chapel as the stair up.** It is told and does no damage.
   - Alternative: the chapel floor drops into the crawl. But that sends you down, away from the bells.
2. **Two chapels in one level:** the congregation's nave at 59-84, and his own chapel under the bells.
   - **Rec: keep both.** His is the "Abbot's chapel". Rename the lower one "the nave" in signs if you like.
3. **The congregation the call raises is still sprig/archer** (the old summon pool), so the tune lane keeps continuity.
   - **Rec: swap to rockgoblin/sentry after the foecast pass** (goblin priests and mages lead the cast).
4. **The rooftop climb is now on every retry.**
   - **Rec: keep it, with the bell-rope shortcut.** It is about 16 rows, and the rope makes a retry the trapdoor and then the rope.
   - Alternative: a 4th checkpoint on the sill, which works against the ~3 checkpoints.
5. **A plunge while he is warded by the lit brazier's smoke is also an opening.** This widens the second opening.
   - **Rec: keep it, and let the tune lane narrow it** (praying only) if the rate runs HIGH.

## TIP
- `node tools/false-abbot3.mjs` proves the whole m3 fight on the real house in about 2 s. It sets MON3 itself.
- `MON3=1 node work/mon3/dump.mjs 0 37` shows the new top rows.
