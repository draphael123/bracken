# BRACKEN: running the whole game from one computer

This computer now does everything for BRACKEN: it builds (the lanes), then checks, merges and deploys (the integrator). The old integrator PC has been retired. This file carries its rules and the current state. Read it all before doing anything.

Repo: https://github.com/draphael123/bracken (PUBLIC: never commit secrets, emails or personal data). Live game: https://bracken-nine.vercel.app. Plain JS, no build step, no dependencies. `npm run check` is the test suite.

## 1. Daniel's standing rules
- **Merge, push and deploy WITHOUT asking** when everything is green (his words: "I don't want you to ask me about merge/pushes since I may be busy and not respond. As long as everything is green/clear you can proceed."). "Green" means ONE full `npm run check` passed, with any failure re-run ALONE and passing. The change must also have no open design question and include nothing he rejected or parked. Tell him afterwards, in plain words, what went live and what to try.
- **ASK him about design decisions**: parked questions, anything ambiguous, anything that changes how the game plays beyond what he approved. Offer a recommendation with each question.
- **The Level Editor and Boss Rush are PARKED**: they're hidden from the menu (`MODES_PARKED`; `?modes=1` shows them). Keep their code, but never add new bosses, foes or tiles to them.
- **HELD until he says "ship"**: branches `claude/stormhold` (the castle town and the Scalder) and `claude/abbot` (the False Abbot's belfry). Don't merge them.
- **Downloading any file** (music, art, packages) needs his explicit yes first, every time.
- **Pronouns**: he doesn't mind; keep what the game uses.

## 2. Load limits (the old PC froze twice)
- **At most 3 lane agents at once**, and **at most 2 while a full suite is running**.
- **Only one full `npm run check` at a time, ever.** Several checks measure timing and give false failures under load. mother-pilot, boss-openings, undercrown-variety and herald-pirate have all done this.
- The full suite takes **50-80 minutes** now. Start it in the background.
- Don't leave extra Chrome windows open. If the PC gets slow, stop the newest lane; its pushed work is safe.

## 3. How a lane works
- Each lane is a background agent with its own folder (a clone or `git worktree`) and its own branch `claude/<name>`. It commits and pushes after every green step.
- A lane runs only the checks named in its prompt (`npm run check -- a,b,c`). It never runs the full suite, never touches master, never deploys.
- A lane's final report ends with its questions for Daniel. Pass those questions on to him; don't decide them yourself.
- The six lane prompts live in `docs/SECOND-PC.md` on branch `claude/second-pc`. Launch in this order: 1-3, then 4 (Polish), then 5 (Geomancer rework, after 4 has pushed), then 6 (One dodge, after 5).

## 4. How a release works (the integrator's job)
1. Make a batch branch from `origin/master` in its own folder, for example `git worktree add ../bracken-batch -B claude/batchN origin/master`.
2. Merge each finished lane branch into it. Conflicts:
   - `tools/check.mjs`: it's one long list of check names; keep EVERY name from both sides.
   - `src/marks.js`: its **top part (THROWN, QUIET, BY_HAND) is HAND-WRITTEN**; only the big MARK table below it is generated. Merge the hand-written part by hand, keeping every row from both sides, then run `node tools/tells.mjs --write` to regenerate MARK. Taking one side's file whole once dropped the Winchmaster's leap row.
   - Anything else: keep both sides' intent. Read both, don't just pick one.
3. `node --check src/main.js`, push the batch branch, then run the **full** `npm run check` in the background and save its log.
4. Handling failures: re-run each failing check ALONE (`node tools/<name>.mjs`).
   - If it passes alone, it was load. Note it and move on.
   - If it fails alone, it's real. Find which merge caused it: bisect across the batch's merge commits in a throwaway worktree. Then fix the cause, not the test.
   - Today's real failures had two causes:
     - **A rename that missed its readers** (`e.mark` → `e.deathMark`: `src/lab.js` and `tools/boss-openings.mjs` still read the old name).
     - **A shared flag changed for one feature** (EARTHSHAKER's new drop rule changed every hero's landing).
5. When green: fast-forward master to the batch (`git checkout master && git merge --ff-only origin/claude/batchN && git push origin master`).
6. **Deploy:** master does NOT auto-deploy. In the main repo folder, on master: `vercel deploy --prod --yes`. This needs the Vercel CLI logged in; Daniel does `npm i -g vercel` and `vercel login` once, then `vercel link` to the existing `bracken` project.
7. **Verify:**
   - sha1 of the changed files locally vs `https://bracken-nine.vercel.app/<path>` must MATCH.
   - Open the live site in a browser: it must reach the title screen with no console errors.
8. Tell Daniel what went live, in plain words, with what to try.

## 5. Where things stand (2026-09-24, ~14:00)
- **LIVE** (master `81927e9`, deployed and verified 2026-09-24 ~14:00):
  - the Geomancer (third starter);
  - the level-select list in road order;
  - the Unburied Field's own music and its graveyard look;
  - the Death Knight's music;
  - the Undead Archmage crash fix;
  - the silent boss windups, now heard;
  - the Great Hound's mini-boss flag;
  - the small fixes (Lunge nerf, renamed duplicate passives, REFLECTION at level 4, EARTHSHAKER needs a real drop);
  - **Ore Road round 3** (bigger platforms, a bigger Winchmaster who leaps when enraged, spike pit with updrafts and ladder, bats, bomb goblins).

  Daniel has not played Ore Road round 3 or the graveyard look yet.
- **Lanes running on this computer**: see `docs/SECOND-PC.md`.
- **Open questions for Daniel** (ask when relevant, one at a time, each with a recommendation):
  - A battlefield checkpoint marker for the Unburied Field (a planted war banner) instead of the Hexed Fields' stone lantern?
  - Ore Road: test bots beat the Winchmaster 88% of the time (target 60-75%). Recommendation: no tuning until Daniel plays it; if easy, raise hook/brake-bar damage, not his health. How often he leaps (5.5 s) needs a person's feel check.
  - Known text bug: in the Ore Road mine, the level catch-up banner says "THIS WOOD EXPECTS LEVEL 9".
  - The small-fixes lane's questions (INFERNO, HANGING CUT, THE WHOLE ROW, EARTHSHAKER on the Hurricane, METEOR): see its report, `claude/fixes` commit messages.
  - There's a duplicate Warden water-vault branch in `src/main.js` (~line 7082), noted by the small-fixes lane.
- **The ranking** (every level and boss scored the same way): `docs/audit/ranking-2026-09-24.md` on `claude/audit`.
  - Bottom bosses: Lampreeve, Diving Bell, Great Hound, Weaver, Ploughman.
  - Bottom levels: Burial Caverns, Stormhold, Gale Moor, Hanging Village, Falling Tower.
- **Queued after the six lanes**:
  - The desert arc's later levels (only level 1, the Sunken Caravan, is approved so far).
  - The bottom of the ranking.

## 6. Lessons that cost hours (read before changing anything)
- `docs/AGENT-HANDOFF.md` "EXPENSIVE LESSONS", and `RULES-LEVELS-AND-BOSSES.md` for every level and boss rule.
- **bossLab is seeded per row**, so fights are deterministic. A pilot that loops "passes" must pass `opts.salt`, or pass 2 is pass 1 again.
- **A number taken from a broken table is a confident wrong number.** If a score looks odd, check that every row was counted.
- **Fix the rule, not the row.** One reported bad cell usually means an unenforced rule; write the assertion and expect more hits.
- **Prove a new assertion fails on the old code before trusting that it passes.**
- Menus are laid out on a **320x180** buffer; measure text with `textW()`/`fitText()`.
