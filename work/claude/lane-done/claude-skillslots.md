# claude/skillslots - ONE ability slot, a second at LEVEL 30, max 2 (Daniel 11-01)

## What changed
- src/progression.js: SLOT_LEVELS [0,30], MAX_SLOTS 2, SECOND_SLOT_LEVEL 30 (third slot gone). equipSkill on slot 2 below 30 says "A second skill slot opens at level 30".
- trimSlots (runs before validation on every load/import/co-op snapshot): below L30 keeps the FIRST equipped ability, moved into slot 1 if slot 1 was empty ([null,x] -> [x]); extras stay owned (skillOwned), only unequipped. L30+ keeps two in place, drops a third/fourth. Idempotent, never throws.
- src/main.js: skills screen shows a locked "G - SECOND SLOT AT LEVEL 30" box; HUD no longer draws slots 3/4; hero card G row says AT LEVEL 30; level-up line adds "A SECOND SKILL SLOT." when a level crosses 30; Death Knight key text; skillAt: a trial's lent skills now fill G after the hero's own single F skill (before, a 1-skill hero could never do the yard's G step).
- Text: controls card ("skill two (FROM LEVEL 30)", "THE ONE EQUIPPED"), co-op help, hero-trial F/G step, store footer.
- Bots: tools/boss-run + campaign-kit already slice TYPICAL_SKILLS by slotsAt(lvl), so pilots take the best unlocked single skill below 30.
- Tests: tools/leveling.mjs ('slots' incl. migration cases: 4/3/2-slot saves, [null,x], L31 keeps two, idempotent, odd loadouts do not throw) and tools/progression.mjs updated; PASS (node). skill-menu (L30), skill-passives, skill-balance-probe adjusted to one slot.

## Milestone replacement
The L16 third slot was never a banner/card reward (L16 is not a milestone), so there is nothing to replace; L15/L20 small perks and every-level stat card remain. L30 (already a big milestone) now also carries the slot, told in the level-up line.

## Checks
- RUN (node): tools/leveling.mjs PASS, tools/progression.mjs PASS (incl. new save-migration cases), node --check on all touched src.
- NOT RUN: every browser check (skills/skill-menu, hud, settings-tabs/keys, textfit, hero-trials, touch, boss-rates sample, curve/pilot). scratch\GATE-RUNNING.flag (batch136 gate, since 07:04) stayed up for the whole lane, so this lane stayed code-only per the rules.
## Boss rates before/after
Not measured (browser blocked). Follow-up: run tools/boss-rates.mjs --profile=human on 6-8 bosses across acts, all 9 heroes, n=12, on this branch vs master 0fe14c26; list any leaving 60-70%.
Expect the biggest drops for heroes whose pilots relied on 2-3 skills (reaper, pyro, warden).
## QUESTIONS FOR DANIEL
1. Nothing replaced the L16 slot (it was never a reward). Rec (built): none. Alternative: a free stat-card pick at L16.
2. Trial yards still LEND two skills so the F and G step is doable (built; text says so). Rec: keep.
3. Death Knight F is now his one slot (hold at full vitae still = frenzy). Rec: keep.

# RATES LANE (browser work, 11-01 afternoon) - INTERIM
Worktree claude/skillslots; baseline worktree bracken-skillslots-base @ 0fe14c26. Gate flag was down. The PC was saturated all afternoon (free RAM 300-1800 MB, memguard KILLing test Chromes every minute or two), so many pages died with Inspector.targetCrashed - environment, not the change.

## Checks (headless, node tools/X.mjs on this branch)
GREEN: skill-menu, skill-passives, skill-icons, skill-balance-probe, hud-default, ui-hud, keys, hero-keys-sheet, hero-keys-strip, settings-tabs, hero-trials, ai-companion, curve-gate, curve-shape, coop-progress, save-slots, death-cost (+ leveling, progression in the code lane).
RED, caused by the change, FIXED (bf3fa4da): tools/touch.mjs 'defend-skill' wheel test needed 2 equipped skills and set a 4-skill loadout on a level-1 hero; trimSlots now keeps one. Fixture now levels the hero to L30 (second slot open). The test's assertions are untouched.
  NOT YET RE-VERIFIED: after the fix three full reruns of touch all died to memguard kills (targetCrashed on every section). Pre-fix the only real FAILs were defend-skill (+ the 1.2-radii ATTACK-hit step that follows it).
NOT CLEAN (crashed under memory pressure, no assertion failure seen): textfit scoped run (hints and bestiary scopes passed; 'plates' scope crashed, rest not reached), online-coop (page crashed). Reruns queued.
hero-keys-strip rewrote tracked work/claude/herokeys/strips/* (sub-frame noise only); reverted, not committed.

## Boss rates
See the bottom of this file / scratch\lane-reports\skillslots-rates.md for the final table, or "NOT MEASURED" if the PC never had headroom.

## RATES LANE - FINAL (stopped 14:30, no more browsers running)
- Boss rates: NOT MEASURED. Free RAM sat at 300-1800 MB all afternoon (the 1500 MB gate was met only at launch; memguard then killed the Chrome within minutes); no boss-rates fight ran. The whole 'built' column is the only one the change can move (practiced/first are bare builds with no skills). Table: none; out-of-band bosses: unknown.
- Re-run recipe (needs ~3 GB free and no other lane): work/tmp-skillslotsrates/second.sh (uncommitted helper) = per boss row, base vs branch: `node tools/boss-rates.mjs <row> --ways=built --built-seeds=6 --heroes=knight,pyro,paladin,pirate,reaper,warden,geomancer,berserker,ranger --profile=human --jobs=1`, rows marsh (Frog King), fenroad, stockade (Chieftain), underleaf (King Gorm), crown, reef, skyroad, sealedpyramid; base = detached worktree bracken-skillslots-base @ 0fe14c26.
- READY for BATCH137: NO, not yet. Code + node tests green and 17 browser checks green, but touch (fixed, unverified), textfit (plates scope onward) and online-coop were not completed, and rates are unmeasured. Recommendation: run touch + textfit + online-coop + the rates in the nightly full suite when the PC is quiet, merge only if green; the change only removes slots so boss rates can only drop for 'built' heroes (expect reaper, pyro, warden most).
## QUESTIONS FOR DANIEL (rec first)
1. Ship BATCH137 with rates unmeasured, or hold one night for the measured run? Rec: hold one night (the nightly suite will have the RAM), since 'built' bosses are tuned to 60-70% and this removes 1-2 skills from every hero below L30.
2. If bosses fall below band after measuring: retune with a follow-up lane (do not hand the slots back). Rec: yes.
