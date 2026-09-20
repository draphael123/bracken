# Boss pilots use their earned tools

This pass changes lab inputs, not class damage, enemy health, cooldowns, ammunition costs or level geometry. The gameplay redesign remains review-only.

The generic Pyromancer boss pilot previously kept a full heat bank until it expired. It now presses C toward an aligned target between committed swings. A real-input regression observed three Pyres from earned heat and a Herald kill in 110.6 seconds. Fresh-page sampling across all 24 bosses gives 22 kills (previously 19), with 8 in the 90–150-second range. Roc 104.5 seconds and Quartermaster 96.6 seconds also replace prior timeouts. Reefmaw and Kraken remain unfinished. Some other fights are now too short: correcting the pilot is not equivalent to passing balance acceptance.

Freebooter's Herald pilot uses his loaded pistol from its range and the short C-release parry against yellow tells. The isolated complete-kit candidate finished in 148 seconds; a parry-only candidate did not. The broader candidate regressed Quartermaster and was not retained. The correction is restricted to Herald. The retained runtime repeat finished in 148 seconds with eight shots and two parries; it never restores ammo or stamina.

The private held-jump Herald navigation candidate failed for every hero and was not retained. The unused explicit Black Flag branch was removed; no new meter behavior was introduced.

Evidence: 35-pyro-a.json and 35-pyro-b.json provide all 24 fresh seeded Pyromancer rows; 35-pyre-runtime.log records actual casts; 35-herald-pirate-final.log records the retained Freebooter response. Labs restore health and retain ordinary XP gains during combat. They do not establish survival or a complete human campaign.

A full regression run is required before this pass is committed. The previous verified checkpoint c09ac494d78242023137c27e5004ad873087e81f remains saved locally, pushed and archived. Daniel's midnight shutdown deadline is recorded in the continuation note and follow-up prompt.

Final verification: `npm run check` ran alone and passed all 66 checks with direct exit 0 (`35-check.log`, `35-check.exit`). The merged report records 131/144 boss kills and 59/144 within the target; ambush evidence remains 108/108 clears and 87/108 within target. Overall acceptance remains partial.
