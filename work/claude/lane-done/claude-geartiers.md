# GEARTIERS (Sonnet art lane) - visual gear tiers per hero

Built: CAPE at L10, CRESTED HELM + gold trim at L20, faint AURA at L30, FULL SET at L50, on all 7 heroes (knight, warden, pirate, paladin, geomancer, reaper, pyro), every pose, through the bake pipeline.

- `src/gear-tiers.js`: ONE table `GEAR_TIERS` and `gearTier(level, hidden)` (0..4; hidden = 0), plus `gearAtLevel(level)` for a level-up card. LEVELING2 hooks milestones by editing the table / calling this.
- `src/chars.js`: `withGear(tier, fn)` (ambient like `withWeapon`), hooks in `knightFrame` (knight, warden, pirate, paladin, geomancer, reaper rigs) and `pyroFrame`. Cape drawn behind the body, gold pieces in front of the body but behind arms/weapon, aura after the outline on empty pixels only, masked from the body (never the weapon). Edits are one self-contained block + 4 small hooks (heroposes-safe).
- `src/main.js`: `heroSet(..., tier)` wraps the bake in withGear; tier defaults to the hero's level tier for the game's own bakes (you, co-op partner, title camp) and 0 for store previews; `regear()` re-bakes after a level-up / the setting; save-slot card now bakes through heroSet with the slot's tier (also fixes pirate/reaper slots drawing the knight).
- Setting: Settings > Display > LOOK > "Gear tiers" ON/OFF (SET.gear; hides all gear incl. partner's).
- Check: `tools/gear-tiers.mjs` (in check.mjs list): table, 7 heroes x 5 tiers bake with same pose keys/sizes, each tier shows on every non-white pose, weapon pixels identical at tier 0 vs 4 and weapon skins change only weapon pixels, hide + regear, slot-card bake.
- Sheets: `work/claude/lane-done/geartiers/gear-tiers-idle.png`, `gear-tiers-poses.png` (tools/gear-sheet.mjs). No "before" sheet needed: tier 0 is the first column and is the unchanged hero.

Green: gear-tiers, weapon-skins, skins, save-slots, settings-tabs, store-preview, ability-poses (60/60). No reds. Full suite not run (coordinator).

## QUESTIONS FOR DANIEL
1. Partner view uses the partner hero's own level (co-op lends player one's level), so both see the same tier; rec: keep.
2. Gear colours follow the hero's skin cloth + one shared gold; rec: keep (weapon-only skins untouched).
3. Aura is faint gold for every hero; rec: later per-hero tint if wanted.
4. Level-up card line for gear levels (use gearAtLevel) left for LEVELING2.
