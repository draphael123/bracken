# GEOFIX lane report (11-04) - branch claude/geofix (worktree bracken-geofix), base claude/batch143 3bd984d6
Branch tip: `git -C bracken-geofix log -1` (committed together with this report). Not merged, not deployed.

## 1. KNEE STONE (and all her stones) never obstruct a hero
- main.js moveBody: for a hero body (P or a co-op player) a standing cell of hers is read as T.ONEWAY instead of T.SOLID (heroTileAt, only while GEO.hasStones()). Walk + dodge pass through the sides; the TOP still holds a foot (stand on a knee stone / pillar / step as before; DOWN+jump drops through like any ledge). Foes use the plain grid: they still bump, gnaw and ram. Arrows/seeds still die in rock (grid unchanged).
- geomancer.js RULE 4 (never a trap) no longer crumbles a stone for a HERO inside it; a FOE inside still crumbles it. freeCell still refuses to place a stone on any body.
- Choice: ALL her stones (board, knee, walls, arches, step) are hero-passable; platform use kept via the one-way top. Bots use the same moveBody (no change).
- Proof (tools/geofix-shots.mjs knee): BEFORE (batch143) hero stuck at x=235 against the stone (240-256), dodge stopped at 261; AFTER hero walks 212 -> 305 through it, a dodge from the right lands at 210, a hero dropped on it stands on top (y 336), a foe still stops at it (x 260).

## 2. AVALANCHE -> MOUNTAIN COLLAPSE (same UP+C at a full board, stones consumed)
- Sequence (GEO.collapse): hit-freeze 0.18 s + camera pull-back to 0.9x (new pullBack in main.js: eases in 0.25 s, out 0.5 s, dark border) -> stave slam at 0.1 s (gAval raised, then gHeave slam pose; ring + dust + shake) -> cracks race out from her across the ceiling / back wall (dark band + amber seam, grit falls from them) 0.2-0.85 s -> at 0.8 s a wave of boulders (4 per stone consumed = 12 at a full board) crashes down across the VISIBLE screen, outward from her; a floor shadow tells each landing (0.4 s); dust plume + chips + shake each; rubble piles -> dust haze clears by ~3.5 s. SFX layered from existing geoQuake / geoThud / geoRise / geoCrumble. Word 'MOUNTAIN COLLAPSE' (HUD ult name, tutorial sign, MOVE_WORDS updated).
- Reduce motion: no shake, no pull-back, steady seam (no flicker). No white flashes are used.
- Damage parity: a landing hits every foe within zone px (zone = n x spacing / 2, so any on-screen foe is under exactly n of the 4n boulders), once per boulder, for ONE old boulder's blow (boss/mini sword x 8.0, common x 2.0 + bowled over; wideQuake x1.5 kept). Nominal old full-reach = n x (8.0 | 2.0) + erupt 0.9 per stone in its column; new = n x (8.0 | 2.0): within ~-10% for a boss. MEASURED on Old Tusker (god mode, hp padded, same board, same spot): old 406 hp lost, new 393 (-3.2%). A small mini/common foe was knocked ahead of the old boulders (old mini took 1 hit = 205), the new wave cannot be outrun (3 hits = 552): small foes die more reliably, bosses do not move. RUMBLE talent (old: boulders roll 1.5x as far) now = the wave lasts 1.5x as long (no extra damage).
- lab bot (ULT_BOT, ad < 220 with a full board) unchanged and works. tools/geo-board.mjs topple assertion updated (stones spent + foe hurt) and green.

## 3. Old Tusker stomp wave -> SPLINTERED SHOCKWAVE (src/old-tusker-hands.js drawShock; art only)
Hitbox OT.stomp.w = 7 on the floor, speed 150, life 1.9 untouched. A low heaved ridge of cracked earth that settles behind the tip, kinked dark cracks, a scar band in the floor, 20 flecks (dirt clods, wood chips, long pale splinters) tumbling back, and a tall blinking cream/gold leading edge (the jump cue) with a light streak ahead. (The Lumber Trail boss is Old Tusker; its only ground-slam projectile is this wave.)

## 4. RECALL THE STONES replaces Stone Skin (coordinator message)
- A TAP of DOWN (released within GEO.recall.tap 0.22 s with nothing else pressed while it was down: no C / up / jump / attack / dodge; hero must be `free`) -> every capped stone (board + knee) leaves the grid and slides along the floor to her at 430 px/s (dust trail, furrow, grind = geoRise + geoQuake, geoThud on arrival). Once per foe per stone: common = sword x0.5 + knocked down (BOWLED OVER); boss/mini = sword x0.35 + 0.3 s stagger. Then each re-plants on the nearest free floor column beside her (the side it came from first; floorRow + freeCell: never in a body or a gate's reach, one stone per column; keeps height and knee look; if no column is free it crumbles, nothing is ever buried). cd 1.8 s.
- Tap vs hold: the press is decided on RELEASE; a hold (40 frames) recalls nothing and is the plain duck; DOWN+C still detonates (verified: detonating true, no recall); drop-through (down+jump) is untouched because jump marks the press dirty. The duck itself is unchanged.
- Stone Skin removed: pop.skin=false, crouch-b geomancer branch = plain duck (skin and Earth Sense both off; stamina boost, damage reduction, pose and UI gated off). First-crouch hint now: TAP DOWN: RECALL YOUR STONES TO YOUR FEET. tools/crouch-b.mjs geomancer sections rewritten to assert the retirement (green).
- NOTE: removing Stone Skin raises damage the Geomancer takes while crouching (it was x0.5 / x0.75 on yellow blows), so boss-check numbers measured on batch143 may run a little high for her. Recall adds a small boss chip (0.35 x sword per stone, 3 stones, 1.8 s cd): negligible.
- Proof (recall strip): stones at [264,328,392] -> re-planted at [232,200,248] around her x=216; foe hit; hold-recall 0.

## Shots (scratch/lane-reports/geofix-shots/)
knee-before.png, knee-after.png (7-frame walk-through); collapse-after.png (7 whole-screen frames), collapse-before.png (the OLD avalanche, same board); recall-after.png (7 frames); tusker-after.png (9 frames of the new wave). Tool: tools/geofix-shots.mjs <outdir> knee|collapse|recall|tusker|bosscol [tag].

## Checks run
node --check on every touched file (green). demo-cut green, demo-floats green. geo-board (real page) green after updating its topple assertion. crouch-b (real page) green after rewriting its geomancer sections. crouch-hint green. tools/geomancer.mjs CRASHES THE PAGE (Inspector.targetCrashed) ON batch143 TOO - pre-existing, not caused here; its old avalanche lines (rollers()/erupts()) need the same update as geo-board when it is repaired. textfit started for the changed strings (MOUNTAIN COLLAPSE sign + hint): result not awaited (no waiting loops) - owed.
Owed: tools/geomancer.mjs crash triage; geocrouch-gif / geomancer-shots (old skin/avalanche stills); Geomancer boss win-rate re-check after Stone Skin removal.

## Questions for Daniel (recommended first)
1. Keep ALL her stones hero-passable (walls and arches too)? Rec: yes (one rule, one-way top). Alt: only knee stones passable.
2. The collapse covers the whole visible screen and small foes cannot outrun it (bosses unchanged). OK? Rec: yes. Alt: cut commons' per-hit by 25%.
3. Pull-back is 0.9x with a dark border (the renderer only draws the 320x180 view). Rec: keep for the demo. Alt: widen the draw area later for a true zoom-out.
4. Recall tap window 0.22 s / cd 1.8 s: tune after play-feel? Rec: keep.
