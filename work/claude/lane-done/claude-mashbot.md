# claude-mashbot (Sonnet), 2026-10-01 - the MASH BOT, the gate, and the campaign audit

## What changed
- `tools/mash-bot.mjs` (new): a player who only mashes attack. It walks at the boss and presses the basic attack every free frame; never blocks, dodges, jumps, uses a heavy blow, a skill, a mechanic or an opening. One life, normal health, no god mode, the boss lab's setup (src/lab.js bossLab) with the lab's own bot removed. Knight, warden, pyro x 2 seeds at the level's expected hero level (its depth on the gate chain, no skills), plus a level-1 variant (`--l1`, 1 seed). `--level` is LEVEL mode: head for each waypoint of the main route with attack mashed, lifted where stuck (counted). `--probe` measures the chip multiplier (a 40-point blow on the boss while not open, given back) and the share of damage that arrives right after the bot's own blow (reprisal). `--assert <id>` reads the cache and exits 1 if the mash bot did not lose.
- `tools/level-quality.mjs`: a `mash` row for GATED levels (theatre, fair) reading the new hash-stamped cache `docs/mash-bot.json`; REPORT-ONLY (WARN) while `MASH_ENFORCE` is false. The rule it asserts: the mash bot loses to the level's boss and mini with all three heroes AND dies or drops under 40% health in the level. `mashVerdict(lv)` is exported for boss checks.
- `tools/mash-audit.mjs` writes `docs/BOSS-AUDIT.md` from the cache. `docs/LEVEL-QUALITY.md` and `docs/NEW-LEVEL-CHECKLIST.md` state the target rule and that it is report-only until the combat pass and boss fixes turn it on.
- Nothing about any foe or boss was changed. Measurement only.

## Numbers (docs/BOSS-AUDIT.md has the full tables)
- 34 bosses and 13 minis audited (every arena and mini in LEVELS; the Boss Rush list is the same bosses). The mash bot BEATS 18 of 34 bosses with at least one hero and 12 of 13 minis. Beaten by all heroes on both seeds: the Captain (hurricane), the Blood Knight (unburied).
- Levels: 34 mashed (knight, expected level). It clears 5 without dying or dropping under 40% hp: storm, keep, causeway, theatre (49% low), longwater (44%). The rest drop to 0-26%.
- The two gated levels today: Puppeteer is beaten (5 of 6 fights; the 6th timed out); the Wicker Queen is beaten by knight and pyro (4/6). Theatre level: mash clears it (lowest hp 49%); fair level does not (died once). So both gated levels WARN on the mash row.

## Caveats (be honest about what the bot can and cannot say)
- The bot cannot jump, so several bosses (King, Gargoyle, Closed Helm, Chief, Winchmaster, Archmage, Strawking, Herald, Quartermaster) read "mash loses" simply because the bot cannot reach or engage them (landed 2 or fewer blows). That is a pass of the rule but not evidence of a well-built boss. They are marked UNREACHABLE in the audit.
- Chip multiplier is the boss's own gate at the moment of the probe (4 samples in the knight's seed-1 fight); x1 means a full-damage hit with no gate at all outside an opening. Many bosses read x1 (the rule is x0.05; only the Puppeteer reads x0.05). Greed punish is a heuristic (a quarter of damage arriving within half a second of the bot's own blow on a boss that was not mid-attack): only the Homunculus, Spider, Sexton, Abbot, Forgemaster and Owl show it.
- Level mode lifts the hero past gaps/walls/machines it cannot cross (30-100 lifts), so its hp numbers are a floor on the danger.
- The cache is stamped with the level's data hash; a boss-module edit does not stale it. Re-run after a boss change.
- Many fights are fully deterministic, so seed 1 and 2 give the same row.
- Hero level: the depth rule means the wood is level 1 and the last levels about 28; hero hp at those levels is large, which flatters the mash bot late.

## Checks run
level-quality, architecture, dangling-paths, comments, homepaths, boss-fight-end, boss-openings: see the final message for the result.

## UNVERIFIED
- `mash` row for theatre/fair reads the committed cache; after any later edit to either level it goes stale (WARN) until `node tools/mash-bot.mjs <id> --level <id> --write`.
- Greed-punish column is a heuristic.

## QUESTIONS FOR DANIEL (recommendation first)
1. Turn the mash gate ON (MASH_ENFORCE = true) when? Rec: only after the combat pass lands, since 18 of 34 bosses and both gated levels fail today. Built report-only.
2. Should "expected hero level" be depth, or depth+1 (hero has finished the level's predecessors AND levelled in it)? Rec: keep depth (stricter on the boss, since hp is lower).
3. Should an UNREACHABLE boss (the bot lands 2 or fewer blows) count as the mash bot losing? Rec: yes for the gate (it is a pass), but flag them for a human-bot (pilot) audit; the real worry is the opposite: bosses that read x1 chip.
4. Should the mash bot be extended to roll/jump at random (a "panicking player" variant), to reach the flyers? Rec: no; keep it pure mash, it is a floor.
