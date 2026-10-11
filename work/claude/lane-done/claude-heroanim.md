# claude/heroanim - hero dances + follow-through (art only)

Branch claude/heroanim off master ce20a08d. Contact sheets: work/claude/lane-done/heroanim-sheet/ (dance, dance2, dance3, follow; all 7 heroes, bracken + black skins; tools/dance-sheet.mjs --key=<k> --heroes=a,b).

## Done
1. DANCES, three per hero (chars.js F.dance / F.dance2 / F.dance3, baked into every skin, mirrored, whitened):
   - dance = the existing victory dance (card + first H press). dance2 = idle solo (long idle, ~14-18 frames). dance3 = boss-kill flourish (~13-18 frames).
   - knight: THE KATA / THE FLOURISH. pyro: THE JUGGLE / THE PYRE TURN. pirate: THE SEA-LEGS / THE BROADSIDE (pistol flash, cutlass toss).
     reaper: THE VIGIL / THE REAPING. warden: THE SENTRY'S DRILL / THE SPEARS RAISED. paladin: THE VESPER / THE HALLOWED STROKE.
     geomancer: THE CAIRN / THE UPHEAVAL.
   - Pick by context (main.js danceKeyFor): boss down = dance3 (every third time the salute), long idle = dance2, H key cycles dance -> dance2 -> dance3.
     No Math.random (sim rolls untouched). Reduce motion = one held pose (40% frame). Jingle: SFX.dance(h, v) v=1 idle solo a step down and softer, v=2 flourish a fourth up.
   - Victory card still shows dance. Not done: the co-op PAIRED beat.
2. FOLLOW-THROUGH: K.R.follow = 2 frames per hero, drawn inside the existing recovery (P.atkRec, now also kept in P.atkRecMax, read only) after atk/atkB/atkC
   light strikes (not heavy, not the finisher flourish hold, not air). Beat table is the comment at the top of src/attack-animation.js.
3. SKILL POSES: not touched. tools/ability-poses.mjs reports 60 of 60 actives already have their own body (src/hero-poses.js, earlier lanes); the drink frames are untouched.

## Proof art-only
- tools/hero-keys-strip.mjs timing fingerprints (attack box + stamina per tick, chain + heavy), 7 heroes: warden, paladin, pirate, reaper byte-identical before/after.
  knight, pyro, geomancer: the BASE tree differs from ITSELF between runs (before vs before2), so a byte compare is meaningless there. pyro and geomancer after == a base run;
  knight: every tick before ~41 (the whole swing window) is identical across all four runs (before, before2, after, after2); only the post-hit tail wanders, in base too.
- tools/boss-rates.mjs rootway,scree, knight/warden/pyro, practiced, 2 seeds: before and after identical (rootway 83% = 1/2 2/2 2/2, scree 67% = 1/2 1/2 2/2).
- Checks green: dances (existing, unweakened), skins, weapon-skins, tells, hero-trials, ability-poses, blow-tags, titlescene, mobile-perf. textfit/uiscreens not run.
- Gotcha for later art: a bit/pixel at negative y (above the frame) hangs the bake (page never loads). Keep every tip at y >= 1.

## QUESTIONS FOR DANIEL (rec first)
1. Co-op PAIRED beat on the victory card: rec yes next lane (a shared pose when both players are within 1 level); not built.
2. Skill poses: the 60 actives all have bodies; rec a targeted polish pass on the 5-6 you find weakest instead of redrawing all (tell me which).
3. Geomancer stones read small at 2-3 px; rec leave unless you want bigger.
