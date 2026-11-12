# DUELFOES (S1) - claude/duelfoes f7dc1fd53+report (11-12 15:48)  CODE-ONLY, node-proven, flag DUEL_FOES default OFF
Not merged, not deployed, flag not flipped. No browser opened.

## Built (file on the branch)
- src/duel-foes.js (new, pure, no imports): DUEL_FOES flag (DUEL_FOES_FLAG=false; ?duelfoes or window.__DUELFOES, same pattern as ?duelbeta); FOE numbers (FEW max 2 / 14 s, MANY max 4 / 8 s, first 10 s, tell 1.0 s, minSeat 6 tiles, blow 6%); FOE_ARENAS door data (Pit doors cols 2 and W-3, sprig 65% / shield 35%); foePlan (schedule); pickDoor / doorFree; foeWound (flat share, never below 1). No item/loot/drop hooks (asserted by the proof).
- src/pvp-duel.js: import; SETTING_CHOICES goblins + friendlyFire; cleanSettings (flag off forces 'off' / false, old saves load clean); friendly-fire branch in hit(); GOBLINS block before the settings section (foeTick spawner + told entry + banner, foeClear, foeFlee, foeBlow, foeDied); bot target hook in hands(); tick(): clear when not fighting + foeTick; results card GOBLINS column (finish + drawHud); '!' tell in drawWorld; tavern card rows + plain-words line; roster ctx foes()/ruleLine; debug().foe.
- src/duel-roster.js: RULES tab rows() = the 7 old rows, +GOBLINS +FRIENDLY FIRE only when ctx.foes(); plain-words line above the hint (VH-27).
- src/main.js (4 commented hooks, ~9 lines): damagePlayer first statement (duel goblin blow -> DUELO.foeBlow); updateEnemies (duelFlee -> foeFlee, skip AI); hurtEnemy (`e.hp<=0 && e.duelFoe` is its own branch BEFORE the normal death: no XP / heal / coin / drop / rites, only DUELO.foeDied); DUELO api foeSpawn (spawnEnt, noXp, no elite/affix) + foeProbe (damagePlayer0 on a full bar, spare:true). Pit level data untouched (door data lives in duel-foes.js).

## Numbers / rules as built
GOBLINS OFF/FEW/MANY remembered per slot; FEW 2 alive / 14 s, MANY 4 / 8 s, first entry at 10 s of the fight clock (tell at 9 s). Door = the farthest of cols 2 / 23 from every seat; needs >= 6 tiles from all seats (re-checked at the pop, retry 0.25 s x8). Told 1 s: '!' over the door + hornBlast; first of the match banner GOBLINS IN THE PIT. None in count / K.O. / winner / sudden death; at sudden death live ones flee to the nearest door (70 px/s); all cleared at every K.O. / time / draw / winner screen (clock back to 10 s next round). Goblin blow: through the seat's guard chain, then -6% of duel max (3 / 6 / 9 at HEALTH 50 / 100 / 150), floor 1 health, never a K.O.; duel grace 0.4 s + anti-juggle apply (spam every frame = 16 blows / 10 s, BREAK fires). Kill: nothing (no heal, no points, no rounds), +1 on the killer's GOBLINS count; results card shows POINTS / GOBLINS / DEALT / ROUNDS when goblins were on. Same ranking as any duel. Teams: goblins wound any seat; FRIENDLY FIRE row (default OFF = today) lets teammates hurt / K.O. each other.
Bots: a living goblin within 40 px (|dx|+0.5|dy|, same metric as the seat pick) and nearer than the nearest enemy seat becomes the target; easy ignores 50% (re-rolled each second).

## Node proofs
- tools/duel-foes.mjs: 135 checks, flag-on process + a spawned flag-OFF child. ALL OK. Covers: settings clean + remember + old-save load, schedule + caps (FEW 10/24, MANY 10/18/26/34), 20000 random seat layouts for doors, told spawn + banner once per match, nothing in count / K.O. / winner / sudden death, flee, cleared between rounds, blow 6% / HEALTH scaling / never <1 / never K.O. / grace / anti-juggle / blocked costs nothing, kill gives nothing + counts, main.js hooks present and the kill branch pays nothing (source check), teams neutral, friendly fire both ways, bots (normal / easy / hard), 20 long simulated matches (2/3/4 seats, teams, limit 0-120) all end, no seat downed by a goblin. Flag OFF: settings cleaned to off / false, a 120 s MANY duel spawns nothing, teammates cannot hurt, RULES tab keeps 7 rows.
- tools/pvp-duel.mjs (pure,sim) 100 ok and tools/duel-roster.mjs 60 ok, unchanged, flag OFF.
- Not registered in tools/check.mjs (new node tool; add to the suite list if wanted). node --check clean on main.js.

## Deviations
1. Round-start seats (cols 5 / 20) are inside 6 tiles of BOTH doors (2 and 23), so no goblin enters until a seat moves off its start (a second or two in practice). Rule kept literally; if it feels late, move the doors inward or lower minSeat.
2. Door data is in duel-foes.js (FOE_ARENAS), not duel-pit.js, so the Pit level / hash is unchanged.
3. A fleeing goblin is walked off by foeFlee (nearest door, no death effects); between rounds goblins are removed silently (no corpse).
4. A goblin kill uses its own small death (burst + SFX.kill), no corpse; the normal kill rites (pogo, light, heart charm heal, spoils) are skipped on purpose.
5. GOBLINS / FRIENDLY FIRE rows show on the RULES tab for every setting (friendly fire has no effect with teams off).

## BROWSER OWED (desktop; one browser at a time, >= 1500 MB free; open with ?duelfoes=1 or window.__DUELFOES)
- tools/pvp-duel.mjs duel section with the flag on and settings goblins 'many': PAIRS=knight:pyro,warden:ranger N=2 (2 seats); a 4-seat run and a teams run (friendlyFire off and on); then the 9-hero sweep N=2. Assert: every match ends inside the cap, no soft-lock, no seat downed by a goblin (debug().stats.foeBlows > 0, kos only by heroes), no flask, no XP / coins gained, debug().foe.alive <= 4.
- Archer-free Pit: every spawned enemy t is sprig or shield (BK.duel().D.st.foe.list).
- Stills: the '!' over a door (9-10 s), a goblin walking in, the GOBLINS IN THE PIT banner, the RULES tab with GOBLINS selected (plain-words line), the tavern card (?duelcard) GOBLINS row, the results card GOBLINS column at 4 seats.
- textfit for the new strings: 'GOBLINS: FEW - THEY HURT ANYONE, BUT ONLY A HERO CAN K.O. YOU.' (roster size 6; on the 196 px card at size 8 through fit), FRIENDLY FIRE row, banner, results header 'POINTS GOBLINS DEALT ROUNDS' on the 220 px board.
- Feel: do goblins pile on one seat; does the sprig/shield AI behave with no pack roles (foePassSpawn is not run for them).

## Questions (recommendation BUILT)
1. Should round-start seats clear the doors (doors inward / minSeat 4)? Rec: keep 6 tiles, judge on the desktop.
2. GOBLINS column only when goblins were on (built) or always? Rec: only when on.
3. Hide the FRIENDLY FIRE row unless TEAMS is on? Rec: show always for now.
Branch claude/duelfoes.
