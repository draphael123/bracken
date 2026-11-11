# WARDENULT2 (claude/wardenult, tip = see git log; merged master 6743648c2). Not merged to master, not deployed. Pushed.
GATE NOTE: gate151/batch151 has claude/wardenult at b9aa51442 (or earlier). Commits it should have had, in order: 8ade2e059 (merge of master 6743648c2; one conflict, the HEROES blurb block in src/main.js, took master's text + my warden blurb with "10 health"), ada8f2805 (warden-id assertion), 1b8cc8529 (stills tool), a9d5f90da (boss-run measuring flag, tool only). None change game code beyond the merge itself; follow-up pick-up = a9d5f90da.

## Done
- Merge master 6743648c2 -> conflict only in src/main.js HEROES (health numbers were rewritten on master, my warden desc edit on the other side): resolved. main.js parses; tools/warden-id.mjs 40/40, tools/warden-reach.mjs 39/39 GREEN after the merge.
- warden-id: the four stale 'no warden row' assertions (DUEL_HERO/CAP_HERO/ARCH_TUNE/LP_HERO) became 'every warden row is documented' (the table's line carries a (claude/lane) provenance comment).
- Tools opened before running: boss-rates/boss-run/cdp (launch Chrome via openPage, one browser, --jobs=1), my new tools/wardenult-stills.mjs (one Chrome). Never ran check.mjs. Never more than one Chrome of mine at a time; RAM was 4.4-5.1 GB free before each run; gate flag appeared mid-way, I kept >= 3 GB free after it.

## Stills (scratch\wardenult2\*.png, 4-7x crops, god mode, flat floor, one sprig as a target)
Looked at 03 hold, 04 run, 05 jump, 06 thrust A/B/C beats, 07 throw wind, 08 throw flight, 09 pips (3 tiers out of the ult), 10 tether. Findings: no fix needed.
- She holds the shaft with the forward arm on it at chest height, hold/run/jump all keep the spear (run and jump only change legs); the point sits at about 88-100 px with the glowing leaf head; thrust beats show the 3 green afterimages, ring and hit numbers at the tip; C beat leans furthest/longest. Reads as wielding.
- Nit (not fixed, art taste): the forward arm bakes as a fairly thick grey block; at 1x it reads as a gauntlet.
- Pips: out of the ult three pips fill pale/green/gold with PIN THROW hint; in the ult they fill across 0.20 s to gold with the ring. The tier word is small 5px text above the pips; in my crop it was clipped at the top of the frame so I could not read it in the ult still (code at main.js wthPipsDraw draws it for ult too).
- JAVELIN/TETHER SPEAR is clearly different from the ult throw: thin brown shaft with a tether line and a SKEWERED tag vs a giant leaf-head ghost spear in the ult.
- Page-view caveats: the little bars above the head in thrust B/C stills are the existing run-of-three pips (not throw pips).
Files: 02-ult-cast ... 10-tether-f22 (43 pngs), run script tools/wardenult-stills.mjs.

## Boss check (warden only, built way, n=6 a boss, bot STANDARD profile, flasks kit, NORMAL; logs scratch\wardenult2\{rates,ult}-{master,branch}.log/json)
FINDING: the bot never pressed the warden's ult (it is not in the src/ultimate.js registry, so the generic ult hand skips her): every warden row ever measured had NO ult, and the plain master-vs-branch run (casts show no ult) is only a control. I added a measuring flag WARDEN_ULT_HAND=1 (tools/boss-run.mjs) that registers a ready-only shim so the hand presses UP+C at a full band; ult fired 42 times on master (the old x1.0/x2.5 ult) and 38 on the branch across 30 fights each.

| boss (row, level) | master no-ult | branch no-ult (control) | master + ult | branch + ult | delta ult (branch - master) |
|---|---|---|---|---|---|
| Old Tusker (wood L3) | 6/6 | 6/6 | 5/6 | 6/6 | +1 |
| Goblin Chieftain (stockade L4) | 3/6 | 4/6 | 1/6 | 2/6 | +1 |
| Frog King (marsh L3) | 5/6 | 5/6 | 4/6 | 4/6 | 0 |
| Bog Troll (fenroad L3) | 3/6 | 3/6 | 3/6 | 3/6 | 0 |
| King Gorm (kings L9) | 2/6 | 4/6 | 3/6 | 5/6 | +2 |
| total | 19/30 63% | 22/30 73% | 16/30 53% | 20/30 67% | +4/30 = +13 pts |
Each cell has a 95% interval of about +-30 points; the bot is deterministic so steps of 1-2 fights are noise. The control (branch no-ult vs master no-ult) already moves King Gorm by +2 and Chieftain by +1 with no ult cast, so the ult delta is the same size as run-to-run drift from the code change (+3 in the control, +4 with ult).
Reading: with the stronger ult the warden is at 83% on Tusker/Gorm only where master was already 83-100% (Tusker) or within noise (Gorm 83% vs control 67%); the others sit at 100/33/67/50. No boss shows a clear push above 75% that master did not already have. The only cell over 75% that master did not have is King Gorm 5/6 (CI 44-97). Note the warden bot is weak and casts the ult ~1.3 times a fight, so this is a floor on the effect.

## Verdict for Sunday: SHIP.
Reasons: stills read right, tests green after merge, no clear boss push beyond noise. Worth watching, not blocking: King Gorm warden (5/6); rec = if Daniel wants certainty, one --seeds=12 run of kings,stockade with WARDEN_ULT_HAND=1 (about 10 min) after the gate.

## Owed / questions (recs built)
1. The bot-side gap: warden ult is outside the ult registry, so the bot (and the generic cue "ULT READY: UP+C") ignore her. Rec: register her properly in main.js (ready = vigil>=100, fire = wardenReachCast) after Sunday; then WARDEN_ULT_HAND is not needed. Not done: touches the HUD cue and live input path.
2. Ult stamina/cd spam (earlier lane question): no melt seen in n=6; keep 12 / 0.35 s.
3. textfit for the new hint text not run (starts Chrome).
