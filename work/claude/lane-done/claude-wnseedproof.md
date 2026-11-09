# claude/wnseed browser proof (PROOF2, 11-04) - Sonnet
STATUS: MERGE-READY = YES (after the coordinator's one-line release.sh change in wnseed.md). Not merged, not deployed. Tip = `git log -1 claude/wnseed`, pushed.

## Merge
master 42a1d4cd merged in (9bdec1d8). One conflict, src/main.js line ~2184: kept my wnTab/wnFilter/wnPad vars + master's `demoCreditsBack`. Master's batch 143/144 lines in docs/updates.json were untagged strings, which the new guard (batch >= 143 must be tagged) rejects: tagged them (kings / hornetsnest / wood; hero, phone-title, sound and 'early bosses retuned' left lv:[] = general, because the bosses are not named).

## Checks (one headless Chrome at a time, >= 4.6 GB free every time)
- node --check src/main.js, whatsnew.mjs, textfit.mjs; wn-add check 144 on docs/updates.json: ok.
- node tools/whatsnew.mjs: GREEN after fix 1 (data 39 deploys + tab-2 steps: RIGHT opens, wood listed, locked levels hidden, filter cycles + wraps, rows inside panel, LEFT back, no console errors).
- node tools/textfit.mjs whatsnew --strict: GREEN after fixes 2-3 (9 screens, 0 findings).
- All-levels probe (SET.allLevels = 34 levels with history; scratch/wnseedproof-probe3.mjs): every filter chip (ALL + 34 levels, longest names included) and 58 scroll positions of tab 2 have all text inside the panel (24..296 x 6..174), console clean.
- Item 2 (seeded load): probe scratch/wnseedproof-probe4.mjs pins Math.random, loads stockade twice: the first draw after load is identical both times (0.0204...) and the foe count matches = load no longer consumes the pinned stream.
- tools/small-adds.mjs (on the re-pin list): GREEN (25 rows, 9/134 swings missed, worst 25% vs 33% limit). The other re-pin tools were NOT run (each is long; suite lane/nightly should show if any needs a restamp).

## Bugs found and fixed
1. whatsnew.mjs used Enter to step the level filter, but Enter is the ATTACK key = back to title (as before wnseed). Filter key is Z (as the footer says 'Z level'). Test now presses Z. (Game was right, test wrong.)
2. textfit CLIPPED false positive: the one-letter scroll arrow 'v' matched as the start of a wrapped line 'village...'. One-char strings now only exact-match.
3. REAL pre-existing bug the textfit exposed (list grew to 228 rows with 39 deploys): when the scroll landed inside a 3-line row, only its first continuation was skipped so the 3rd line showed alone; and wnLimit = rows - vis could stop short of the true end (date gaps cost 2px each, a wrapped row that does not fit whole is dropped). Fixed both in src/main.js drawWhatsNew: skip every leading continuation; wnLimit is the first scroll from which the whole tail lays out.

## Owed
- Phone-width / touch / pad pass by eye (tap tab, tap chip, LB/RB) - logic is in, no screenshots taken.
- Re-pin tools from wnseed.md not run beyond small-adds; restamp only what fails.
- release.sh one-line change (wnseed.md).

## Questions (rec first)
Unchanged from wnseed.md (1 hero/menu lines stay lv:[]; 2 unlocked level is enough; 3 keep spawn deterministic).
Q4. Enter in tab 2 = back (attack key), not filter step. Rec: leave (Z/Tab/E/T/LB/RB step it; Enter-as-attack is the menu convention).
