# BRACKEN

A 16-bit forest platformer vertical slice: a knight, a sword, a shield, and a plunge.

    node serve.mjs      →  http://localhost:5860

No dependencies. Plain canvas 2D at 320×180, integer-scaled, every sprite baked at load.

## Controls

| Action | Keys |
|---|---|
| Move | Arrows / WASD |
| Jump (hold for height) | Z / Space / W / K |
| Swing | X / J / Enter |
| Block (hold; drains stamina, slow walk, no jumping) | C / L |
| Dodge roll | V / Shift |
| Plunge | Down + X while airborne |
| Drop through a log | Down + jump |
| Settings / pause | Esc / P |
| Music toggle | M |
| Restart at shrine | R |

## Health and stamina

Health is a 100-point bar. Stamina is spent by swinging, plunging, dodging, holding the shield up,
and taking a hit on it. It regenerates after half a second of not spending. Run the bar dry while
blocking and the arm drops for a moment ("TIRED"); take a hit on the shield with too little
stamina and it's a **guard break**: half damage and a stagger. With the shield up you walk slowly
and cannot jump.

## The hook

The sword does one thing the jump can't: **the plunge**. Down + X in the air drives the blade
down. Landing it on a foe or a crate bounces you higher than a jump, so a row of wasps over a
pit is a bridge, a shieldbearer is safest from above, and crates are springs.

Not everything can be plunged. The **Thornback** has a spined back. The blade skates off, you
eat the spines, and only the sword will do.

## Enemies (each demands a different answer)

- **Sprig** — goblin walker. Swing, or block and shove.
- **Shieldbearer** — blocks anything from the front with a clank. He turns slowly, so cross
  behind him and strike, or plunge from a log above.
- **Spitter** — toadstool on a ledge. Spits a seed straight at your chest. Step aside, jump,
  block, or slash it out of the air.
- **Wasp** — hovers over pits. Pogo fodder.
- **Thornback** — armoured beetle. Winds up with a "!" and charges. Block the charge to stagger
  it, or dodge through and hit it while it rests. Sword only.

## Level

Glade → pits and crates → spitter ledge and shieldbearer step → shrine → wasp pit (pogo chain)
→ thorn climb on logs → plateau with a moving log → arena → the hollow (drop, stream, shrine) →
the ridge (log climb under fire, wasp gap, last stand) → gate at dusk. Shrines are checkpoints
and heal. Gold coins are the collectible.

## Files

- `src/level.js` — the map, painted with `floor / block / plat / spikes / crate / ent`.
- `src/main.js` — physics, combat, enemies, camera, render, intro, menu, screens.
- `src/chars.js` — knight frames (text grids + drawn sword) and enemy sprites.
- `src/art.js` — tiles, props, parallax layers.
- `src/audio.js` — synth SFX; plays `audio/theme.ogg` (CC0, see `audio/CREDITS.txt`) with the synth loop as fallback.

## Debug

`window.BK` exposes `P` (player), `step(n)` (deterministic sim steps), `tp(tx, ty)`, `reset()`,
`respawnEnemies()`, `enemies()`, `stats()`, `god`, `SET`, and `sheet` (sprite sheet view).
`?tx=N&ty=M` starts at a tile and skips the intro.
