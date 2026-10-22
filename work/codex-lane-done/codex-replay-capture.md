# codex/replay-capture

Status: Partial. Input capture and offline PNG export are implemented; real-page proof is pending.
Base: origin/master BATCH112 5e44cddd.

In a fresh game page, open the developer console and run:

    await BK.replay.record({level:'wood',hero:'knight',seed:1919,hud:true,namecards:true,debug:false})

Play with the usual keyboard, touch or gamepad. Then run BK.replay.pause(); BK.replay.download().
Recording starts at the selected level's beginning, preserving the current build/settings in the file.
The active session is isolated from saveProgress; reload to leave capture mode. No data is sent.
For a new recording or replay use a fresh page to isolate transient level state and cached art.

    node tools/capture.mjs path/to/session.replay.json --level=wood --out=frames --scale=2 --nohud --nonamecards

The output is a numbered PNG sequence at exactly 60 logical frames per second. Scale must be integer
2 or 3; smoothing is off. HUD, name cards and debug overlays have separate options. Sound prompt is
always hidden in capture. A receipt records completed frames and SHA-256 image hashes. An existing
sequence is never overwritten. A missing/divergent frame stops capture with a partial receipt.

The input file retains all held logical keys and one-shot flags before each 60 Hz step, plus a state
fingerprint after each step/draw. Simulation, draw and audio have independent seeded random streams
only while capture is active. The normal game keeps its original Math.random calls and save behavior.
Fresh-page proof covers actual keyboard inputs, frame hashes, exact pixels, altered-input detection,
persisted-save isolation and 3x CLI output. Mode-off before/after proof remains required.

## QUESTIONS FOR DANIEL

- Recommend PNG sequences for deterministic trailer editing. Built 2x/3x integer PNG output with
  per-frame receipts; video encoding can use the editor's 60 fps image-sequence import.
- Recommend starting each take in a fresh page at the level's beginning. Built seeded inputs and
  copied in-memory build/settings; arbitrary mid-fight state import is not claimed.
