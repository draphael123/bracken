# STARTERSKILL (11-07) - branch claude/starterskill, tip c1fa51831 (off master 95bc267a4), worktree bracken-starterskill
Daniel 11-07 08:02: every hero starts with his cheapest level-1 active skill OWNED + EQUIPPED; the YOUR SKILL first card only once one is equipped.

## Changes
- src/progression.js: starterSkillFor(h) (lowest-level active, then cheapest, then catalog order), STARTER_SKILLS, grantStarter(p,h), grantStarters(p). Called in BOTH branches of migrateProgress, so a fresh save (migrateProgress(null)), every old save on every load, an erased slot and co-op fresh seats all get it with no extra hook. A hero who owns NO active ability gets it owned + in slot 1; a hero who owns any active (equipped or not) is untouched; passives do not count; nothing removed, no refund, no gold charged; a hero who unequips his starter keeps owning it so it is never granted twice. Granted for all nine heroes whether owned yet or not, so an unlock (bought, boss-earned, account-wide roster) needs no hook.
- src/coop-save.js: cleanSnapshot grants the seat's hero his starter into the VIEW (snapshot from an older client); freshSeat/seatFromSlot already go through migrateProgress. A save is never written from the view.
- src/first-cards.js + src/main.js (~8290): FC.skillsReady(PROG, hero, lv); the calm timer for the skills card only runs while the current hero has an active equipped, else it waits.
- src/demo-save.js untouched (demo import not affected).
- Tests: new tools/starter-skill.mjs (choice per hero, fresh save, v2 migration cases incl. owns-but-unequipped left alone and passive-only, pre-v1 path, no double grant after unequip, bare-object grant, co-op fresh/old-client/old-slot seats, card gating + main.js wiring). Two existing tests adapted because the level-1 skill is now owned at birth: tools/progression.mjs line 21 buys the second-lowest knight skill instead; tools/coop-progress.mjs tamper case uses 'harrier' (a real warden skill not owned) instead of 'skewer'.

## Starter per hero (all L1, price 60)
knight SHIELD THROW (shieldThrow) | pyro VENT (vent) | paladin HAMMER LEAP (hammerLeap) | pirate GRAPESHOT (grapeshot) | reaper BLOODWORMS (summonSkeleton) | warden SKEWER (skewer) | geomancer STONE STEP (stoneStep) | berserker BATTLE ROAR (bzRoar) | ranger VOLLEY (rgVolley)
Poor fits (flagged): reaper BLOODWORMS is paid in blood debt on the bar - a new player pays HP-ish debt on the first press; geomancer STONE STEP is a movement/utility pillar, no damage; berserker BATTLE ROAR fills a quarter of RAGE and rocks small foes - a setup tool, not an attack; pyro VENT depends on heat built first. Knight, paladin, pirate, warden, ranger are straightforward attacks.

## Verified (node only, no browser)
node --check main.js, progression.js, first-cards.js, coop-save.js, starter-skill.mjs. Passing: tools/starter-skill.mjs, progression.mjs, coop-progress.mjs, first-cards.mjs, talents.mjs, progression-runtime.mjs, skill-menu.mjs; the wider batch result is at the bottom of this file.
Not runnable here: tools/progression-economy.mjs (needs a browser; ws error), not run.

## OWED browser stills
Fresh save in the knight's first wood: slot-1 icon shown on the HUD and the YOUR SKILL card appearing after the calm stretch; store SKILLS tab shows the starter as owned+equipped (not buyable); an old save with a hero that owned nothing; a co-op second seat showing his slot-1 icon.

## Questions (recs built)
1. Reaper / geomancer / berserker starters are weak first skills. Rec: ship as is (Daniel said cheapest existing L1 active, no new abilities); optionally pick each hero's cheapest L3-4 attack instead for those three.
2. Grants are for all nine heroes even before they are unlocked (invisible, makes unlock free of hooks). Rec: keep.

Wider batch (demo-save-carry, demo-cut, hero-roster, skill-passives, tech-cards, flasks2, store, store-ui, leveling*, coop-progress, first-cards, starter-skill) was still running at report time; demo-save-carry and demo-cut green. Log: /tmp/run.log (not scratch; rerun if gone).

## Wider batch result (final)
Green: demo-save-carry, demo-cut, hero-roster, skill-passives, tech-cards, store, coop-progress, first-cards, starter-skill, leveling, levelling (the last two adapted to buy from no starter; tip 23d2370b2+).
Browser-based, NOT run here (need a browser/RAM gate): flasks2, store-ui, leveling2-runtime, progression-economy. store-ui buys the tree's first ability and would hit 'Already owned' now; I edited its line 29 blind to clear that ownership first - rerun it at the gate. flasks2 and leveling2-runtime may need the same one-line adaptation if they buy a level-1 skill.
