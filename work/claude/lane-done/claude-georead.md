# claude/georead - GEOMANCER READABILITY (Daniel 11-02 21:14)
Branch claude/georead off claude/rel140 (f263c7cb). Worktree bracken-georead. Readability only: no damage/timing/physics change, no new attack.
## Changed (src/geomancer.js, src/main.js, tools/geomancer-read.mjs)
1. Early teach: GEO_TEACH/geoTeach in main.js (PROG.geoWardTold / geoBeatTold, max 2 each, also in her trial). First plain WARDED block: "TAP C THE MOMENT A BLOW LANDS: A PERFECT WARD BOUNCES IT AND POWERS YOU UP." First perfect ward: "ON THE BEAT: BOUNCED BACK. YOUR NEXT BLOWS HIT HARDER FOR A FEW SECONDS." (a perfect one also retires the first line). Hooks: api.teach from wardTakes.
2. Stone count + timers: three pips under her feet (cap, oldest on the left with a red tick when the board is full - that is the next to go). Pip fill = stone hp (or time left for a timed stone: EARTHFALL step etc.); under a third it goes orange then blinks red. Timed stones also get a thin bar on their own top. Shown only while a stone is within 200 px or one just came/went (2.2 s), so no clutter at rest.
3. Tiers: the existing meter/rings/note stay. Added a halo on the geode stepping per tier: T0 dim amber dot, T1 grey ring + 1 pebble, T2 amber ring + 2 diamonds, T3 ember ring + pulse + 3 square stones. Release sfx per tier: T2 also geoQuake, T3 also geoRise (T1 shard keeps geoShard, T0 geoThud). The tier-up notes (SFX.geoTier) were already distinct per tier; unchanged.
## Checks
- node --check main.js/geomancer.js OK.
- tools/textfit.mjs hints: 106 screens, 0 on every counter (OFFCENTRE/OVERFLOW/OFFSCREEN/CLIPPED/TRUNCATED/COVERS/COLLIDE/OVERDRAWN/LONGHINT/SMUDGE/ERROR).
- tools/geomancer-read.mjs (new): 4 tier cells, 3-stone pips, cracked-stone pip, both hints fire (counters 2/1), 0 page errors.
- tools/check.mjs NOT run (release gate). Existing tools/geomancer.mjs NOT rerun (gate; owed).
## Pictures (scratch\lane-reports\georead\)
tiers-and-pips.png (T0..T3, 3 pips, cracked pip), hint-warded.png, hint-perfect.png (the hint box only reads at 5 s; the second shows EMPOWERED). No before shots: before = same cells without the halo/pips (the meter/ring were already there).
## Owed
tools/geomancer.mjs + geomancer-shots regression run after the gate; a real-play look at pip placement on slopes/water; sound check by ear (T2/T3 reuse existing sfx, nothing new recorded).
## Questions (rec first)
- Q1 pips below her feet vs on the hero meter: built below (the tier meter owns the space above her head). Rec: keep.
- Q2 teach twice per save each: rec keep (matches the ranger/berserker teach pattern).
