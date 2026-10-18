# follyfix (Mage's Folly QUICK FIX, item 1) - claude/follyfix
Base origin/claude/batch97 a0bd2c1a.
DONE
- 5 own Archmage cast poses (crush, books, glyph, pair, ward) in src/redraw/mage_foes.js (frames 11-15) wired in MAGE_FRAME (main.js); images share the table. Checked on a baked sheet.
- Knight retune: per-hero ARCH_TUNE (main.js: hp / spell dmg / opening blow value / per-opening cap / ward reseal). Walkers were short of damage, pyro cut the runes from range.
- Themed EXIT GATE: the OBSERVATORY DOOR (exit-gates kind 'mage', barriers TABLE 'mage', ent gate at col 643 in the study, gateAfterBoss), opens onto a dawn glow.
- docs/level1-pilot.json re-stamped for the new hash.
RATES (profile human, flasks kit, L33, practiced, same seeds): BEFORE knight 5/12 42%, warden 5/11 45%, pyro 12/12 100% (63% pooled, hid it).
 AFTER (16 seeds) knight 12/16 75%, warden 11/16 69%, pyro 7/16 44% -> final pyro hp 1.45 (a 16-seed run at 1.45 gave 9/16 56%); noise is about +-14 points per hero at 16 seeds.
CHECKS: level-quality mage ok, stuck --static ok, damage-caps ok (knight cap kept at 0.18), boss-openings ok, reach-heroes mage ok. Not run: full suite, mash-bot/boss mash rows (hash changed: re-stamp level THEN boss), tools/cast-poses gate.
SKIPPED (items 2-5 redo them): no new moves, no stage-1/arena rebuild, no overlap/punish-camping, no fire+ice pair, no orrery phase; numbers are tuned on today's fight, so item 4 must re-tune all three heroes.
QUESTIONS (rec first)
1. Keep per-hero ARCH_TUNE as the pattern? Rec yes until item 4 rebuilds the fight; then fold it into the new stages.
2. Pyro rate sits low 44-56%: rec accept for now, bump hp to 1.6 if Daniel feels it is too hard.
3. Exit gate door uses the shared lantern/dawn glow; rec the item 5 art pass adds the far-layer dawn behind it.
pyro 1.55 unmeasured -> re-measure in BATCH99 integ
