# Item 1 — the raft returns for a living swimmer

Branch: `codex/playtest-0919`, based on master `648a0c9`.

An empty moving raft, or an empty raft docked at its far bank, now turns home after 1.2 seconds and poles to `x0` at 60% speed. The grace period allows the normal jumps over Long Water's rocks. It announces COMING BACK, trails a wake in the return direction, then docks and waits. Boarding during the return finishes the homeward trip before starting another crossing.

Payment/free passage, existing frog passengers, and bore state survive a living return. The existing respawn reset also clears the new return flag and absence timer. No level geometry or water rules changed.

## Verification

- `node tools/rafts.mjs`: real mover-update regression checks for idle dock, short jump, return timing/speed, reboarding, second crossing, occupied/empty far dock, unpaid/paid/free ferry, frogs, bore state and dead rider. Included in `npm run check`.
- `node tools/rafts-live.mjs <screenshot-directory>`: headless Chrome; knight walks off Long Water's raft, swims alive to its starting bank, jumps out, boards the returned raft and reaches the far dock over all four rocks with 100 HP. Real keyboard input, current and bore enabled; foes removed to isolate locomotion, no god mode. All three rafts also pass a forced-death respawn reset in the real game.
- Screenshots inspected: COMING BACK while swimming, returning to the starting bank, reboarded, and far dock.
- Only Long Water's raft pool is swimmable. The two Marsh raft pools retain their existing lethal-water rules and respawn recovery; no new swimming exit is required there.
- Syntax checks and `git diff --check` pass.
- Full `npm run check`: exit **0**, run alone on 2026-09-19; all 18 checks pass, including 104 source/tool syntax checks, 23-level pixel audit and text-fit.

Not verified: an enemy-populated human playthrough or multiplayer. No boss behavior changed.
