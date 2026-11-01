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
