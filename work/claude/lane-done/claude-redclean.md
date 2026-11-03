# claude/redclean - red cleanup (textfit + small bot fixes), from master ca825000

## textfit (red since BATCH137): GREEN alone, scoped --strict rc=0 (3866 screens, 0 issues, 1043 s)
- Cause: the page crash (Inspector.targetCrashed) is memory. The SHORT scopes shared one page (bestiary 343 + store 828 screens baked first, died 12 s into 'opening', which passes alone); the long scopes' batches (talk 12 levels, plates 6, boss 4, levelcard 10) had outgrown the levels (talk[knight] batch crashed twice in a row; nearly every long scope crashed once beside other lanes' browsers).
- Fix (tools/textfit.mjs): short-scope page reopened after every scope; batches halved (boss 3, plates 4, talk 6, levelcard 6); a scope whose page crashes is rerun on a fresh page up to 3 tries and says so (a 3rd crash, or any other failure, still fails the run); page boot gets 3 tries; shot fetch is inside the retry.
- With the crash gone the run found REAL text problems (QUICK `textfit` includes bossfix + whatsnew): fixed:
  - flat fill under 25% effective alpha is a tint, not a plate (a lantern's 38px halo square read as a plate under flotilla 'OPEN: RELOADING', 'PISTOL: ROLL IT', hurricane 'THE MAINMAST TOP'): tool only.
  - flotilla 'OPEN: RELOADING' x '!!': drawTells now keeps its marks off tell words the hands modules draw (wordRects, src/main.js).
  - witchlight '-20' x '+20': damage numbers pushed under the HUD plate landed on one spot; numbers now set below one already placed (numBoxes).
  - whatsnew: the '^' scroll mark covered the first row's last word; moved into the gap under the title.
- Scoped `textfit`, `bossfix`, `whatsnew,hints` all rc=0 after the fixes.

## visible-supports-strict (scree + spire): GREEN (spire 32 -> 0)
- Real finding was a TOOL rule, not art: 'its drawn post never reaches the deck' required ink in rows 0-15 of the sheet (the deck tile). Church/monastery piers start at (y+1)*16, flush under the deck's underside, so every one failed. Now first ink at row 16 abuts the deck (accepted); a gap (first ink > 16) or no ink still fails. hanging 15 and kings 1 findings unchanged (report-only backlog, same as before).

## BOT lane
- fire-room (warden): PASSES alone on this branch, all 7 heroes (batch131's 14 px tile-edge rule fixed it; earlier red was load).
- canal-tunnel-route ranger windlass: FIXED in the bot. A bow stance looses an arrow, which strikes nothing; the windlass needs the knife (H.attackBox). strike() now swaps to the knife stance for a ranger in bow stance and back. ranger 3 seeds stray+ride all reach Jenny's arena. (Level is fine.) knight/pyro/paladin ok in the earlier run.

## Owed / not run
- canal-tunnel-route for pirate, reaper, warden, geomancer, berserker not re-run (a 'fresh lab page did not initialize' flake ended the all-heroes run after paladin; ~14 min a hero).
- NIGHTLY textfit-full (talk + boss scopes, unscoped --strict) still reports REAL issues (pre-existing, not in the QUICK scoped run): talk kitchengate sign@3,40 '0/3' OFFSCREEN (knight/warden); talk fallingtower sign@34,300 and fair sign@405,12 hint box COVERS the hero; boss fight fallingtower 'E' OFFSCREEN (qpillar glyph y -555); rookery arena THE DIVER/SHRIEKER/SNATCHER name labels OFFSCREEN and THE DIVER x timer / SNATCHER x '0/217' COLLIDE (new Rookery 4); rookery 'THE SISTERS' CRAG' OVERDRAWN. Not touched (need an art/level lane); the full run now completes in ~65 min without crashing (rc 0 in report mode).
- Textfit runs slower now (more page boots): scoped 17 min alone.

## Questions (rec first)
1. textfit-full nightly: fix the 9 residual issues in a small polish lane, or add them to a known-list? Rec: fix (kitchengate sign position, fair/fallingtower sign spots, rookery name labels).
2. The tint rule (flat fill < 25% alpha is not a plate) is a tool judgement; OK? Rec: yes (a gradient was already exempt).
