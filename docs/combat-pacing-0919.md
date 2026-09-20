# Combat pacing and swimming recovery

This pass remains partial. Timing audits are separate from structural regression checks. The labs replenish health; they do not establish survival, human difficulty, or a complete campaign playthrough.

## Retained game changes

- Each ambush captain has a room-specific health budget, shared by all six heroes. The captain still enters immediately, and defeating it opens the one-wave room; there is no minimum-duration timer or hero-specific health.
- The Owl Reeve has more health so her lamp and dazzle loop lasts beyond the former 29.5–44.6-second fight. At 1450 base health, the six-class measurement was 89.3–137 seconds: all six kills, five within 90–150 seconds. The 1460 and 1475 candidates worsened Warden timing and were reverted; 1450 remains.
- A swimming hero whose downstroke has ended releases the airborne plunge-chain stamina lock. Previously Paladin could remain at 2.26 stamina indefinitely despite a zero regeneration delay, no active plunge, and active swimming. The real-input regression performs an underwater downstroke, cancels upward, and verifies recovery from 72 to 100 stamina for all six heroes. Paladin's focused Keep run now finishes in 136.3 seconds instead of leaving 83% boss health.

Airborne plunge costs remain 28 / 45 / 70, with no regeneration during an airborne chain. No new bucking, stagger cap, grounded recovery penalty or damage reduction was applied.

## Pilot and measurement corrections

Freebooter chooses his blade when the pistol is empty or an enemy is too close to wind a shot. A loaded pistol uses its actual range. The co-op pilot uses the same action selector. A regression covers these loaded, empty and close-range decisions.

The Lance pilot descends shelves instead of repeatedly jumping above the opening. All six heroes finish the current focused run, but only three meet the time range. Reefmaw's pilot now descends toward its actual hole; four heroes finish, three in range. Warden and Pyromancer still need work there.

The acceptance CLI accepts a validated hero subset for focused recovery. Browser protocol waits and startup requests are bounded. Fresh-page readiness must identify a new document, not merely observe an old page's BK object during navigation. Interrupted audits retain completed rows and never mark themselves complete.

## Evidence and unfinished acceptance

- The room-budget tuning matrices cleared 108/108 combinations; the subsequent eight-room adjustment raised the merged in-range count from 79 to 87. The repeat after the swimming correction also cleared all 108 combinations, with 87 in range. `33-ambush-verified-combined.json` records the unique rows and batch provenance.
- `33-swim-chain.log`: six real-input swimming recovery cases passed.
- `33-paladin-water-fix.json`: Keep/Paladin killed in 136.3 seconds; Mage/Paladin still unfinished.
- `33-final-owl.json`, `33-final-lance.json`, `33-final-reef.json`: focused boss measurements described above.
- `33-audit-snapshot.json`: game-source hashes for the wider fixed-source audit. Browser-runner recovery changes are tracked separately from game code.
- Some long audits stopped during browser reload/startup. Their reports retain `complete:false`; these are diagnostic rows, not successful batches.

A larger airborne-chain cost experiment still left plunge damage dominant in two of four mixed-strategy samples and was not applied. Its separate route trial covered only Knight and Warden, not all six heroes. Any change to grounded plunge recovery or plunge damage awaits Daniel's scope decision.

Broad class, level and combat redesign proposals are in the user-facing improvement review. They have not been implemented. The temporary Reefmaw bait strategy, general navigation candidate, Herald lure, general heavy-attack candidate and nearest-forward Mage landing experiment were not retained. The increased Stockade chief health was also reverted while its longer-fight navigation issue remains unresolved.

The full fresh-page boss snapshot completed all 144 samples: 126 kills, 60 in the 90–150-second target. Tide Herald did not finish for any hero; Quartermaster did not finish for five. These are still acceptance failures, not hidden by aggregate coverage. `33-boss-verified.json` preserves each row and its source report.

The Mage flood pilot now uses the existing double-tapped air dash to cross book stacks. The private six-hero candidate finished all six; the final fresh-page repeat also finished all six (Paladin 132.2 seconds), with three in range. `34-mage-owl-final.json` records it; its Owl rows were an unretained 1475-health candidate. This changes pilot inputs, not movement stats, collision geometry or class skills.

Final merged evidence: 127/144 boss kills, 60/144 in range, with the retained 1450-health Owl and corrected Mage pilot. Full regression remains required before commit.

The first full regression attempt passed 63 checks but timed out in the new browser-recovery check. That check now pauses the unattended animation loop between navigation controls, retains the short unresolved-promise deadline, and allows a bounded ten seconds for ordinary control reads. Cycle logging identifies the failing reload if it recurs. A focused repeat and a fresh full regression are required; the failed attempt is preserved as `34-check-attempt1.log`.

Final verification: the focused recovery repeat passed, and the second `npm run check` completed alone with all 64 checks passing, direct exit 0 (`34-check.log`, `34-check.exit`). The first failed run is preserved separately. Combat acceptance remains partial as stated above.
