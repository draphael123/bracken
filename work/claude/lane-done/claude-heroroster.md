# claude/heroroster - HERO ROSTER + NO UNLOCK-ALL (sonnet lane, 10-12)

Base 1e461b4c (batch88 live). Branch claude/heroroster. Port 8875.

## Where UNLOCK ALL / UNLOCK EVERYTHING lived
- `SET.godmode` (src/main.js): `godMode()` (owns everything, opens every wood/store/co-op/hero list, rush), the settings row `Unlock everything`
  (src/settings-ui.js TESTING block + main.js toggle + SETTING_TIPS), the HUD text `UNLOCK ALL` (the row in Daniel's photo), `assistOn()`.
- No hotkey, title option or pause-menu entry exists for it (grepped main.js, settings-ui.js, store.js, touch.js, title-*.js).
- Tools that set it: tools/godmode.mjs, touch.mjs, touch-shots.mjs, hanging-hoist-walk.mjs (+ settings-tabs.mjs asserts the row list).

## Built
- **Dev flag** `src/dev-flag.js`: `?dev=1` (BK.setDev = test hook). `godMode()` is `isDev() && SET.godmode`; the settings row is filtered out of
  `tabRows` without it; the HUD row reads `godMode()`; a saved `godmode:true` setting is cleared at boot without the flag.
  Tools updated (never weakened): godmode.mjs navigates with `?dev=1`; touch / touch-shots / hanging-hoist-walk call `BK.setDev(true)` first;
  settings-tabs.mjs now asserts the row is ABSENT without the flag and the whole old list is present WITH it (stated design change).
- **Device roster** `src/hero-roster.js`: localStorage `bracken.roster`, four starters always in it. Seeded ONCE at boot from every slot (incl. legacy
  `bracken.progress`); every `saveProgress` / `loadSlot` adds heroes the slot owns. Save safety like the slots: written with `safeSet`, last clean text in
  `.lastgood`, a damaged text kept in `.corrupt` then restored from `.lastgood` or REBUILT from the slots; a full disk never touches a slot.
- **Hero pick** shows all 8: roster heroes (and starters) open as before; locked = black silhouette of the real idle frame (`src/hero-silhouette.js`,
  faint cool rim), name `???`, one how-to line (`BUY IN THE STORE - 10 SILVER`; the Death Knight says `BEAT HIM IN THE UNBURIED, THEN BUY: 10 SILVER`),
  Z on it = new soft `SFX.deny()` + the line pulses, nothing taken. A new game still owns ONLY the hero it takes (silver stays per slot).
- **Hook**: `HERO_RULE_SHIPS` in hero-roster.js (false). Flip it when the Pirate Fleet + Lit Church 2 are live: every non-starter then reads
  `BEAT HIM, THEN 10 SILVER`; the "beaten + bought" roster rule itself is not shipped.
- **Co-op / online**: `coopPickList` = slot's heroes + roster (+ legacy starters); the online guest's pick is that list (host's roster until portable guest saves).
- New `tools/hero-roster.mjs`, wired into tools/check.mjs.

## Checks (all green, port 8875, one page at a time)
hero-roster, godmode, settings-tabs, store, progression, uiscreens, titlescene, textfit (pick, trial, title, menu, settings, slots, store --strict: 0 on all),
berserker, touch, save-slots, save-safety, online-coop. Not run: hanging-hoist-walk (edited only to call BK.setDev), the full suite.
Screenshot: work/claude/heroroster/hero-pick-locked-selected.png (+ hero-pick-open-selected.png).

## Design changes to existing tests (stated, not weakened)
- titlescene 'hero pick': the pick now always lays 8 cards of 37 px, so names stand on two alternating lines (as the old 7-card row did) -> rule is
  'at most two lines, no two names touching' instead of 'one line'. The '7 heroes' test became '8 heroes' and opens them with dev flag + godmode instead
  of mutating DEFAULT_HEROES (which the pick no longer reads). textfit 'pick' scope measures 8 screens instead of 3.
- settings-tabs: UNLOCK EVERYTHING row is dev-only (above).

## QUESTIONS FOR DANIEL (recs as built)
1. A new game on a roster hero owns only him, so buying another hero in that slot still costs silver again (rec, as built: silver is per slot).
2. Co-op's gate stays "this slot owns two heroes" (rec, as built); the co-op list itself follows the roster. Show locked silhouettes on the co-op pick too? (not built)
3. The old URL cheats (?unlock, ?rush) and God Mode were left as they are (Daniel 10-11 'cheats as is').
4. Death Knight how-to line today says to beat him in the Unburied then buy; flip HERO_RULE_SHIPS when the Pirate Fleet + Lit Church 2 ship.
