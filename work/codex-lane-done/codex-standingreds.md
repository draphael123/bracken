# Task C — standing reds (in progress)

Base: `origin/claude/codexmerge` (`2b06d610`); `origin/master` did not yet contain it when this branch was made. Branch: `codex/standingreds`. This is a saved handoff, **not a release-ready verdict**.

## Changes and evidence

- `no-hidden-hits`: the Hurricane cutlass hit frame could be covered by the optional full-screen red hit flash, making the pixel oracle report `0px` for a visible foe. The check now disables that optional flash before comparing foe pixels; hit visibility thresholds and assertions are unchanged. Before: `Hurricane cutlass slash ... 0px` in the full standalone sweep; after: five consecutive full standalone passes (`work/standingreds-hidden-after-{1..5}.log`, outside this checkout). Committed and pushed as `48194e54`.
- `mark-integrity`: the undead mage hurt pose overrode a marked spell tell, including `poisonTell`, creating a phantom pose. Spell tell poses now take priority over the hurt pose. Before: `undeadmage|poisonTell PHANTOM POSE 0px`; after: one full standalone pass, including `poisonTell 1464px` and `every mark seen belongs to a windup that is drawn and lands`. Two more passes remain.
- `textfit --strict`: the full baseline reported 2 What's New clips, 2 sign covers, 1 Hurricane death-recap collision, and 1 Weaver title overdraw. The game now wraps and keeps update lines together, hides the sea message during death recap, and places the intro card below the HUD. The sign-cover check now identifies the actual sign draw site, preventing a one-character HUD label from masquerading as sign text. Focused What's New: `0 issues, 3 screens`; focused talk sweep: `0 issues, 210 screens`. The full strict sweep remains unverified after these edits.
- `slopes-trace`: the first full standalone run passed all six traces, including kings (`1900` frames). No trace was changed. Two more passes remain.
- `curve-gate`: three runs exited successfully but reported 17 stale curve rows and one report-only undercrown row. The stored curves still need comparison against the game-change history and either a justified re-recording or a game fix.

## Checks and remaining work

`git diff --check` passed before this handoff. Run syntax checks, the remaining standalone repetitions, the full strict textfit, and a serial `npm run check` before claiming Task C done. Do not merge this branch yet. Tasks D, E, F, H, I, J, and optional G have not started in this handoff.

## QUESTIONS FOR DANIEL

- Recommendation: keep this branch out of the coordinator's merge batch until the pending Task C checks pass. I built and saved the hit-visibility, undead-mage, and layout fixes; the curve baseline still needs an evidence-backed decision.
