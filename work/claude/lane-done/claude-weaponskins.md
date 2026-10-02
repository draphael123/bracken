# WEAPONSKINS lane (Sonnet) - a weapon skin is the weapon, not a character recolour

## What changed
- src/chars.js: a weapon palette ({s light, S dark}) now lives apart from the hero palette (WP, withWeapon(), WT/WL helpers). It is applied ONLY
  by the weapon-drawing code: knight blade (+ dark edge, + plunge spike), paladin maul head, warden spear head, geomancer geode, freebooter
  cutlass and pistol, reaper scythe blade, greatsword blade, pyromancer staff shaft/cage/flame (putW). STEEL = null = every weapon keeps its
  own colours (default look unchanged).
- src/main.js heroSet(): the skin dresses the hero, the sword pal goes to withWeapon() only (before: merged into the hero palette, so s/S
  recoloured the knight's helm, arms, legs and the pyromancer's whole robe; paladin/freebooter/reaper/warden/geomancer ignored weapons entirely
  and now show them). Store slot preview (~4376) goes through withWeapon too.
- tools/weapon-skins.mjs (in check.mjs list): 1022 hero x skin x weapon bakes. Diff vs STEEL must lie inside the weapon mask (pixels two
  throwaway weapon palettes both reach), a fixed head box (helm/cowl) must not change, and every weapon must change >= 6 px in the swing.
  Full combat set checked for the default skin (ember, moon).
- work/claude/weaponskins/before.png / after.png (+ capture.mjs): 7 heroes x steel/ember/frost/moon.

## Checks
weapon-skins (green; run on the base it fails: knight idle 837 changed px, none weapon pixels), plus the named list - see final message.

## UNVERIFIED
Base-fail proof used the base's heroSet, which ignores the sentinel object, so its failure is "all changed px are non-weapon"; the head probe
is the independent half. Swing arc / slash streak colours drawn in main.js were left alone (effects, not sprites).

## QUESTIONS FOR DANIEL
1. Pyromancer: ember/frost recolour her staff shaft, cage and flame. Recommend keep; alternative: flame only.
2. Hilts/guards/grips stay the hero's own (blade/head only). Recommend keep.
