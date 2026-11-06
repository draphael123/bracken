PRIESTART DONE 11-06 READY (code-only; browser look owed)

Branch `claude/priestart` off claude/desertpriest a604edc2d, worktree `bracken-priestart`. NOT merged, NOT deployed. No browser, check.mjs not run. Tip sha: see `git log -1` on the branch (WIP-free single commit "priestart: the desert priest's own art").

## What was drawn (new files, no ad-block words)
- `src/redraw/sun_priest_rig.js`: HIS OWN BODY on the Pyromancer's pose geometry (bakeSunPriest in chars.js flips a PRIEST flag so pyroFrame draws priestFrame): bare head in a lapis/gold striped nemes with diadem, gold sun-NIMBUS ring behind the head, long ivory robe + lapis tabard stripe + gold sash + lapis/gold collar + gold-banded hem, gold cuffs/bronze hands, sandals, staff tipped with a SUN-DISC (rays grow with flame/flick/flare). Every baked key of the pyro set (65 keys, 257 frames: idle/run/jump/atk x3/heavy/hurt/swim/dance/slump/roll/riposte...) is his. Plus 15 OWN POSES: spShard, spStep, spLamp, spWard, spPillar, spMercy, spGlare, spWind, spHalo, spEye (the 10 actives), spBeam (hold X), spDisc (tap C), spFlare (hold C), spConsec (DOWN+C), spRise (SUNRISE). Beats added to hero-poses.js POSE_BEATS; desert-priest.js now calls kitPose with these names (step/ward/mercy/glare/wind/halo/eye had none before).
- `src/redraw/sun_priest_fx.js`: beam (haze/body/hot band/core/white line, riding motes, burning disc at the staff, starburst at the target; wide for SUNRISE), hallowed patch (glow, sun-glyph per tile, rising motes, end posts), sun-lamp (rayed orb turning, bronze dish, gutters at the end), sun shard (diamond + tail), pillar (telegraph then column + floor splash), burning eye (almond eye sprite + dotted line + target burst), flare burst, disc shield arc, halo ring, ward ring, mercy motes, sunrise tint + shafts. desert-priest.js draw() uses them (rect placeholders gone).
- `src/redraw/sun_priest_icons.js`: 10 active icons (10x12 pixIcon style); main.js skillIcon tries SP_ICONS first (was the flame fallback).
- Wiring: chars.js (import, PRIEST flag, 3 small hunks, export bakeSunPriest), main.js (3 call sites bakePyro(SP_PAL) -> bakeSunPriest, SPI import, skillIcon), tools/desert-priest.mjs (one string updated). SP_PAL const left in main.js, now unused.

## Sheets (node software raster, no browser): `scratch\lane-reports\priestart-art\`
rig.png (all frames x3), poses.png (15 own poses x3), compare.png (Pyromancer above him), closeup.png (x10), fx.png (beam/patch/lamp/eye/shard/pillar/flare/ward/sunrise on dune + night), icons.png (x8). Regenerate: `node tools/sun-priest-art-sheet.mjs [outdir]` (also asserts beats == frames-1 for the 15 poses, 10 icons non-blank and matching the catalog actives).

## Node results
node --check on main, chars, desert-priest, hero-poses, the 3 redraw files, the sheet tool: OK. tools/desert-priest.mjs 82 ok. sun-priest-art-sheet ART OK.
NOT run: every browser tool (skill-icons, ability-poses, textfit, hero-roster, pixels, the suite), tech-cards/progression (untouched files).

## Browser look owed
1. Idle/run/atk at game size: face is small (4x4) and the nimbus gold sits close to the gold cloth stripes - check he does not read as a gold blob; compare against the Pyromancer. 2. ability-poses.mjs (each active now has its own pose key) + skill-icons. 3. Beam/patch/flare/sunrise on a real desert level and a dark level (alpha stack, sunrise tint cost; draw uses g.canvas size). 4. Pick-card/store preview (bakeSunPriest(previewOnly) path). 5. Gear tiers (cape/aura) are NOT drawn on him (priestFrame ignores GEAR); weapon skins ignored.

## Still owed
Trial yard art (trial_sunpriest does not exist - not a small add), voice + SFX (own sounds), ABSOLVED finisher sig, SIG preview clip, bestiary/pick portrait beyond the baked card, gear-tier look, `desert-priest` + `sun-priest-art-sheet` registration in check.mjs (one-line adds at integ), main.js `SP_PAL` const can be deleted.

## Questions (rec first, built)
1. Share the Pyromancer's pose geometry (BUILT: identical silhouettes of staff/arm motion, own body + 15 own poses). Alt: fully separate pose tables for run/jump/attacks (more work; do only if the browser look says the motion reads as hers).
2. Palette: ivory + gold + lapis (BUILT). Alt: ochre/turquoise to tie to the desert tiles.
3. Face size: rec leave; if it reads blank, enlarge the head grid to 12 wide in a follow-up.
