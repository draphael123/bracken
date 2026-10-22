# codex/replay-capture

Status: Success. Input replay, exact pixel proof, mode-off equivalence, save isolation and 3x PNG export verified.
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
persisted-save isolation and 3x CLI output. Mode-off before/after proof passed in run 39822264600 on d62d90a4 at 2026-10-22T17:25:48.855Z.
All built level data and tells, Wood/Spire/Canal gameplay/enemy traces and exact pixels match master.
Combined before/after SHA-256: c4c899f061182905a4f10fbfab70059aa0d5d3d52296ddfeba1f798ab94e1627. The real-keyboard recorder/replayer
passed 180 frames in each of those three levels, with four exact PNG comparisons per level and
altered-input rejection. The CLI wrote 180 3x frames at 60 fps, completed 2026-10-22T17:28:13.840Z.
Source/PID logs, replay fixtures, receipts and PNGs are in the run artifact and work/replay-final-proof
outside git. This bounded proof does not claim that the separate full release gate is green.

## QUESTIONS FOR DANIEL

- Recommend PNG sequences for deterministic trailer editing. Built 2x/3x integer PNG output with
  per-frame receipts; video encoding can use the editor's 60 fps image-sequence import.
- Recommend starting each take in a fresh page at the level's beginning. Built seeded inputs and
  copied in-memory build/settings; arbitrary mid-fight state import is not claimed.

The dedicated capture-proof.yml workflow is registered and independently passed (39829908764).
The temporary standingreds-proof.yml fallback was removed to avoid an add/add conflict with Task 3.
The dedicated workflow now runs the same mode-off equivalence step as well. Gameplay/tool source is unchanged.
