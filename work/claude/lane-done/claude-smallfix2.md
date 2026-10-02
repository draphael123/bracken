# SMALLFIX2 lane (Sonnet)

1. Reaper BLOOD HARVEST blade planted (src/chars.js harvest: greatsword y +2/+2 -> +1/+2 relative to the shoulder, its underside now on the boots' row; a guard pixel sits 1 row under, inside crouch-feet's limit of 2). Paladin idle maul untouched. Captures: work/claude/smallfix2/harvest-before.png / harvest-after.png (idle, crouch, harvest x2).
2. Text fits: bossjump list columns re-split (name 138 -> 126, level 112 -> 130) so MASKWRIGHT'S THEATRE is no longer cut (src/main.js drawBossJump). Captures bossjump-before.png / bossjump-after.png. `bossjump` added to the suite's textfit scopes (tools/check.mjs).
   - Bestiary names and hero-pick GEOMANCER: in the scoped run (bestiary,pick,bossjump) they are already OVERFLOW 0 on this base (fitName/fitSize handle them); only the TRUNCATED bossjump was live. The un-scoped full run never finishes here (hangs >15 min), so the "+7 px / +13 px" from the earlier lane could not be re-measured; the suite scopes bestiary and pick are 0 --strict.
   - textfit bestiary,pick,bossjump --strict: before TRUNCATED 1; after all 0 (253 screens).
## Checks green
crouch-b, crouch-feet, ability-poses, skins, pixels, architecture, dangling-paths, textfit (bestiary,pick,bossjump).
## UNVERIFIED
Not viewed in live play; the full un-scoped textfit.
