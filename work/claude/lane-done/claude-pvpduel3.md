PVPDUEL3 DONE 11-06 READY (node checks green; NO browser run yet - see "browser owed")
Tip: b0fa6d605 on claude/pvpduel3 (off claude/pvpduel2 c2c72eb20), pushed. Worktree bracken-pvpduel3. Not merged, not deployed. Teams and time limit were NOT cut: both built and node-tested.

## What changed (src/pvp-duel.js, src/duel-pit.js, src/main.js, tools/pvp-duel.mjs)
1. PVP_SHIP_FLAG = true (DUEL (BETA) public); ?duelbeta switch kept.
2. Arena planks: 3 oak planks, each a jump from the one below (the old ones were 5 and 9 tiles up; a jump peaks 3.2 tiles). Low left row 14 x3-7, low right row 14 x18-22, high middle row 11 x10-15. No hazards.
3. Skill-slot abilities off in duels: main.js skillAt() returns null while a duel is on. Basic moveset, meter and spender untouched.
4. Match options (all in the settings object): LIVES 1-5 (per round; a K.O. with lives left respawns after 1.6 s at the farthest spot, 1.5 s grace), HEALTH 50/100/150%, STAMINA normal/unlimited, ROUNDS 1/3/5, TEAMS 2v2 (seats 1+2 vs 3+4; teammates' blows do nothing; match counts teams), LEVEL even (default, today's normalised duel) / your (norm 1; bots lifted to the highest human's level via api.hand), ROUND TIME 60/90/120/OFF then SUDDEN DEATH (everyone on 1 health = one hit; OFF = no sudden death, round capped at 240 s on health), BOT DIFFICULTY easy/normal/hard per bot seat (think rate, swing gap, block/dodge odds, reaction delay; normal = the old bot exactly), RANDOM HERO ('random' per seat), REMEMBER LAST SETTINGS (per save slot, device localStorage key bracken.duelSettings, never inside a save file).
5. Settings card (tavern pit, existing board style): FIGHT, LIVES, HEALTH, STAMINA, ROUNDS, ROUND TIME, LEVEL, TEAMS, FIGHTERS, BOT SKILL, BOT HERO, RANKINGS, CLOSE; UP/DOWN walk (scrolling 8-row window), LEFT/RIGHT change, JUMP selects. HUD shows lives (xN), team tags and team round pips, sudden-death banner.
Bot duels stay unranked practice. Rematch keeps the settings and the resolved heroes.

## SETTINGS API FOR DUELROSTER (src/pvp-duel.js; runtime = BK.duel().D, i.e. what makeDuel returns)
Pure exports: cleanSettings(raw), defaultSettings(), loadSettings(ls,key), saveSettings(ls,key,S), SETTING_CHOICES, matchOpts(S), BOT_HEROES, BOT_DIFF.
Settings object: { v:1, lives 1-5, health 50|100|150, stamina 'normal'|'unlimited', rounds 1|3|5, teams bool, level 'even'|'your', timeLimit 0|60|90|120, botDifficulty 'easy'|'normal'|'hard', seats:[{ hero: id|'random'|'' (''= as he is), isBot, botDifficulty, team 1|2 }] } - 2-4 seats, humans first, seat 0 always human, teams forces 4 seats and repairs an all-one-team list.
Runtime (D): getSettings() (deep copy, loads the remembered one for the current save slot), setSettings(patch) (merge+clean+REMEMBER, returns clean), setSeat(k, patch), setSeats(list), setSeatCount(n) (2-4, never below humans, 4 when teams), seatList(), defaultSettings(), cycleOpt(id, dir), openCard(p)/cardOpen()/cardHands (the interim card), begin({ settings }) (starts the match from a settings object; seat heroes of bots resolve 'random' to a hero nobody wears; humans' heroes via api.setSeatHero where owned), debug() (now has cfg, lives, team, max, diff).
Enter from outside: BK.duel().enter(botHero, settings) (loads the pit then begin({settings})). main.js hooks added: api.hand(p), api.setSeatHero(p,h) (player one: only an owned hero, via swapHeroTo, which saves the equipped hero; other seats any hero), api.enter(bot, settings). To skip the interim card the roster should call D.setSettings(...) then enter(bot, D.getSettings()) (the card's FIGHT does exactly that: st.want={k:'enter',settings}).

## Checks run
node tools/pvp-duel.mjs pure,sim: all ok, 100 checks (new: flag on, settings clean/clamp/junk/store-per-slot, match opts, time limit off/60, teams on the match machine, bot difficulty ordering over a minute, plank reach + count + no hazards, and a MOCK-GAME runtime test of lives/respawn, health 150, unlimited stamina, level even/your, 2v2 friendly-fire + team win, one-hit sudden death, per-seat bot difficulty, random heroes, API round-trip). node --check on main.js (as .mjs): ok.
NOT run: tavern.mjs station run, the browser 'duel' section, DEMOAUDIT walk, any real-game check.

## Browser owed (GATE-RUNNING.flag exists, so no browser touched; 4.9 GB free)
Stills: settings card (1 human + bots, scroll window, 150% / teams on), the planks (can a hero jump up to each), a 2v2 with HUD, lives pips + respawn, sudden-death banner. Real-game checks: skills really off (F/G do nothing for several heroes, meters/spenders still work), reaper/warden spender still works with skillAt null, tools/pvp-duel.mjs duel with N=1 (flag on), tavern.mjs station run, setSeatHero swap, level your with a lvl-30 save, unlimited stamina with winded states.

## Known limits / risks
- Team targeting: kits that auto-aim hit the nearest proxy including a teammate's (no damage, but a wasted shot); bots skip teammates.
- LEVEL 'your' for bots: bots take the highest human's hand additively (base+top)/(base+their add); a 2nd human's own-save level is read through asSeat/profile. EVEN mode does not lock techniques (as today). 'Your level' does not change the PvP health pool.
- A human's hero choice for player one needs an owned hero (else ignored). Swapping saves the new equipped hero to his save.
- Balance untouched (heroMul entries from pvpduel2 kept).
- Sudden death 1-health also applies to bots/humans respawned in it (respawn at 1).

## Questions (rec first)
1. Remember-settings lives in device localStorage per save slot, not inside the save file (no schema/validator risk before the demo). REC: yes; move into the save later if wanted.
2. Should LIVES carry over the whole match instead of per round? REC: per round (built); matches stay short.
3. Player one's roster hero swap saves the new equipped hero. REC: ok for the demo; a duel-only temporary hero is a bigger change.
