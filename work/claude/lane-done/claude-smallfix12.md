# smallfix12 - branch claude/smallfix12 (off claude/batch141 39a76e32)
Tip: see `git log -1` on claude/smallfix12 (4 code commits + this report). Not merged, not deployed, no gate, check.mjs not run.

## 1. RANGER vs WINDLASS - DONE
src/ranger.js pointBlank now also returns true when api.gadgetNear(p, knife reach) says a strikable gadget is in knife reach; src/main.js gadgetInKnifeReach (the Fog Canal's props, i.e. the stop-planks windlass / paddles / capstans / horns / posts, minus the lantern; the Underwell's qwindlass) feeds it.
Proof: new tools/ranger-windlass-probe.mjs (canal, ranger, quiver full, X beside the stop-planks windlass).
- BEFORE (ranger.js reverted): near the windlass X looses an arrow (arrows 1, flash 0, not struck).
- AFTER: near: windlass struck (flash 0.23, hitSet true, arrows 0); 70 px back: arrow loosed (arrows 1, not struck).
## 2. TOOLS skill-icons - DONE
Counts now derive from the catalog (r.total, r.actives): pinned only that every passive is a table row or reported missing, and the catalog is non-empty. The RESOLVE assert already passes on this tip (the knight card no longer says RESOLVE); the script exits 0 (77 actives, 186 passives, 263 skills).
## 3. TEXTFIT - mostly done
Full `talk` scope (all 6 heroes, strict, 946 s): 3 findings, all fixed:
- OFFSCREEN "0/3" (kitchengate, x28): src/kitchen-hands.js drew the Spice Vault's recipe count even with the vault off screen; now only while its position is on screen.
- COVERS x2 (fallingtower sign, fair sign): FALSE POSITIVES of the tool's matcher (talk box was at the bottom, hero clear; the matcher counted HUD digits like "1" as part of "12 TICKETS" / "3, 2, 1"). Fix is in tools/textfit.mjs: the cover matcher ignores drawn strings under 4 chars (2 lines, talk + arena). This IS a tool edit (a false-positive fix, not a loosening of a real check) - flagged, see Q1.
- whatsnew CLIPPED (older docs/updates.json line straddled the scroll): shortened to "Late game: sea guards, scouts, zombies, shields each learn a move".
Re-runs: talk on kitchengate,fallingtower,fair: 0 findings (462 screens); whatsnew: 0; boss scoped to minecart: 0 (the Minecart '!' is already gone).
OWED: levelcard (hang/109 s, not run), full unscoped `boss` (Champion tell offscreen not re-checked; >110 s), a final full talk re-run (only the three levels re-run). Logs: scratch\lane-reports\smallfix12\textfit-talk.log.
## 4. POTION MASTER (underleaf) rate - report only
knight, human profile, practiced, flasks kit, normal, n=6, L7: 2/6 = 33% (LOW, band 60-70). Wins s1, s6; deaths left 11/27/36/9% at 107-170 s. Knight only (RAM/time: warden + pyro not run) - rec: boss lane / gate runs warden + pyro before any retune; no retune here. Log: scratch\lane-reports\smallfix12\potionmaster-rates.log/.json.

## Checks
node --check ranger.js/skill-icons.mjs; ranger-windlass-probe; skill-icons.mjs exit 0; textfit scopes as above. RAM was 4-7 GB free throughout, one browser at a time, no kills.

## Questions (recs built)
1. The COVERS matcher edit in tools/textfit.mjs (ignore strings < 4 chars). Rec: keep - the match was a substring test on HUD digits.
2. Potion Master 33% knight-only. Rec: measure warden + pyro at n=6 in the next boss lane before touching the fight.
3. Windlass knife also covers any canal prop (paddles, capstans, horns): rec keep (all are X-struck gadgets).
