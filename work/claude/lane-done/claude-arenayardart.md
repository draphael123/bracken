# ARENA YARD ART lane - claude/arenayardart (11-03), off claude/arenayard d928ad1d
Worktree bracken-lanes\bracken-arenayardart. Not merged, not deployed. Screenshots: scratch\lane-reports\arenayard\art-*.png (station-gate/straw/steps/gap/climb/guard/slow/flash/archer, board-near, door-near, cheer-1, cheer-2, calm-after, tile-closeup). Make them with `node tools/arena-art-shots.mjs` (uses BK.draw1(); the old build-lane station shots were taken without a redraw and show the title / list - these replace them).

## What is drawn (src/redraw/arena_*.js, no ad-block words; all baked once via px.js)
- arena_pal.js `AP`: sand, ashlar, oak (the inn's ramp), crimson / royal blue / gold, iron, crowd skin/hair/cloth.
- arena_tiles.js `arenaTile(t,x,y,at,T,L)`: raked sand top (2 plain + a footprint variant, lit lip), packed sand pad, coursed ashlar (3 variants, lit wall inner faces), stone cap (pillar heads / wall head), darker pit sand, oak plank one-way on brackets, rope-net-over-stone climbing face. Reads the floor row from `L.arenaYard.floor` (or `L.arenaKit.floor`).
- arena_backdrop.js `drawArenaBack(g,cx,cy,VW,VH,time,o)`: banded sky + slow clouds, far towers, the CROWD STAND (4 tiers, ~90 seated figures per 128 px, awning, painted podium, stair aisles, aisle pennon poles, drapes), optional gatehouse over the gate station. Crowd = 2-frame bob out of step; CHEER (o.cheer 0..1): arms up, little flags, the cheer rolls along the stand in 32 px slices, pennons snap faster, confetti. `YARD.st.cheer` (set to 1 on a PERFECT, decays over 1 s) drives it.
- arena_props.js `drawArenaProps`: arenaBarrier (2 variants), weaponRack, pennonPole (live cloth), brazier (live flame + glow), moveBoard (oak + chalk slate; brightens when a hero is at it), trialsDoor (arched stone surround, iron-strapped door, lamplight), leaveGate (arch onto daylight, raised portcullis, blue pennants).
- Cheer sound: new `SFX.cheer()` (one synth line in src/audio.js beside sting; crowd swell), played with the sting on PERFECT (src/arena-yard.js grade). NOTE the music lane may touch src/audio.js: my line sits at `sting()`, far from TRACKS - a textual merge only if they edit the same line.

## Wiring (small, all behind L.arenaYard)
main.js: one import line; tile bake line (before the tavern one); backdrop call before the sealed-pyramid line + `!L.arenaYard` on the generic forest parallax and the near-tree line; drawYardProps now calls ARP.drawArenaProps (placeholder rails/board/door/gate deleted; the 'UP: ...' prompt kept); footsteps 'sand' for palette.set 'arena'; falling leaves become sand/chaff colours in the yard. arena-yard.js (data only): palette set 'arena', dress 'arena', near 'none', noFg/noNear (no forest bough/grass strip), stone dirt colours; `arenaYard.floor` and `.gate: [2,13]`; deco ents: 5 pennonPole, 5 weaponRack, 2 brazier (no collision, no stations/dummies/collision moved).

## REUSE for a boss arena / arena mode (data only)
1. Level: `palette: { set: 'arena', dress: 'arena', near: 'none', noFg: true, noNear: true }`, `arenaKit: { floor: <floor row> }` (any level with `L.arenaKit` gets the tile kit) - but main.js's three hooks currently test `L.arenaYard`; for a boss arena change them to `(L.arenaYard || L.arenaKit)` (3 tokens) and pass opts: `ARB.drawArenaBack(g,cx,cy,VW,VH,time,{ floor: row*TS, crowd: true|false, density: 0..1, cheer, tint: {col,a}, gate: [x0px,x1px] })`.
2. Place props as `{ t:'deco', kind: 'arenaBarrier'|'weaponRack'|'pennonPole'|'brazier'|'moveBoard'|'trialsDoor'|'leaveGate', v }`; `ARP.ARENA_KINDS` lists them.
3. Boss cheer: set the same `cheer` 0..1 from the fight (a phase change, a big hit).

## Checks (all green)
tools/arena-yard.mjs build,board,safe,perfect,arrows,zone,coop,entry: 77 ok, 0 fail, no page errors (log scratch\lane-reports\arenayard\arena-yard-art-run.log); tools/textfit.mjs arena (27 screens) and practice (10): 0 issues; tools/tavern.mjs stations,fixes: OK. No Python on the box, so tools/art-rules.py not run. Full suite / QUICK gate NOT run (per brief). One browser at a time, >5.8 GB free each time.

## Owed / not done
- STRAW CAST skins (strawSword / strawBow via cnSkin) from the plan section 2: not drawn (not in this brief's file list). The dummies, soldier/shield and the archer (a green goblin-archer sheet on the stand) still use the game's own art. The archer is a goblin: after the Goblin Queen rule he should be a straw bowman - recommend a follow-up art lane.
- Plan lists a 'flavour: arena' option in arena-polish.js: not added (that file is the boss-arena framework; the reuse path above needs only data + 3 `||` tokens).
- Tile sheet for the pit's inner side faces uses the ashlar; the pit back wall is flat dark stone (palette dirt colours), not drawn masonry.
- tools/reach.mjs not rerun (no collision touched).

## Questions (recommended answers; built as recommended)
1. Add the straw-cast skins (straw swordsman / bowman, incl. replacing the goblin archer) as a next small art lane? REC: yes.
2. Make the three main.js hooks accept `L.arenaKit` now so a boss arena opts in with data only? REC: yes, when the first boss arena is briefed (3 tokens).
