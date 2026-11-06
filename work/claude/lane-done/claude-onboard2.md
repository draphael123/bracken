# ONBOARD2 report (claude/onboard2, base origin/claude/onboard1 14448a92e)
STATUS: DONE (code + node checks). Tip 6ab3c1914, pushed. NOT merged, NOT deployed. Browser stills + runtime check OWED (gate was running).

## Built
- src/first-cards.js (new, pure): one card module for items (2) and (5). Once per save: PROG.firstCards[id]=1 (rides through migrateProgress like innTold; checked). Style = the first-death card's (same board 'iron', same Z CONTINUE footer armed after 0.9 s, world held still, tap on touch). Own keys: teachKeys() in main.js (opnWords + CTL.labelFor for skill one/two/skills menu; touch = button names).
- Wiring in src/main.js (~28 lines): teachTick (holds the world, pops next card; explainers wait for calm/no fight; boss hints show straight after the respawn), render branch, bossNoteDeath() in die(), level-up/shrine/drink/levelUp hooks. Suppressed in tool runs exactly like the salt card (saltDue: manualSimulation / noopening / webdriver), so no bot waits on a card. Nothing touches difficulty or numbers; no easy mode.
- (5) EXPLAINERS
  - levelup: first time the level-up choice card is owed, a card first ("EVERY LEVEL OWES YOU ONE PICK: VIGOR +8 HEALTH, ENDURANCE +12 STAMINA, MIGHT +1 DAMAGE (read from CARD) / LEFT RIGHT CHOOSE, Z TAKES IT, ESC LATER: PAUSE > LEVEL CARD / BIGGER PERK EVERY FIFTH LEVEL FROM 25"), then the choice card opens on dismiss.
  - flask: first shrine lit in a real level, or first time hurt (<=50%) holding a flask (whichever first): "<flask key> DRINKS A FLASK: ABOUT A QUARTER OF YOUR HEALTH / STAND STILL, A BLOW BEFORE THE SWALLOW SPILLS IT / A SHRINE GIVES ONE BACK, DYING REFILLS ALL / THE SMITH SELLS EXTRA FLASKS". (The roadside lesson already teaches the flask but is skippable; the old hint line still speaks twice after the card.)
  - skills: 7 s of calm play in the first real level: "<skill one key> USES YOUR EQUIPPED SKILL, ONE SLOT FOR NOW / SECOND SLOT AT LEVEL 30 (<skill two key>), TWO IS THE MOST / CHOOSE THEM IN THE SKILLS MENU (<key>), AT A MAP, SHOP OR SHRINE".
  - slot2: the level-up that crosses L30 (not Reaper) says the second slot opened.
- (2) BOSS HINTS: PROG.bossDeaths[bossId] counts deaths to the same ARENA boss (not beaten: PROG[level].cleared skips it); at 3 (BOSS_HINT_AT) ONE hint card after the respawn, once per boss per save. 11 demo bosses, text taken from each fight's own header and anchored by the node check: Old Tusker (hide turns a cut; plunge on his back / fell a marked pine on him), Hornet Queen (stand on comb, leave late as she dives; shielded dive winds her; smoke drops her), Frog King (hittable on royal pad, cross pads, shield/jump tongue, jump red flop), Bog Troll (rotten section, step off as bulge goes red, stuck), Chieftain (club/sword+shield/bow answers, broken rack removes a weapon), Mother Cap (seed cap steps, plunge on the knot, spring spores), Huntmaster (bow guards front; strike gold arrow back or spore pod), Potion Master (jar colour beats ward), Battering Beast (knock out scaffold prop, ram sticks him, plunge), King Gorm (drop the cage on him; hand unblockable; log roll / belly quake), Pyromancer (water, cancel the fireball charge, spent after gutter).

## Checks run (node only)
- node tools/first-cards.mjs ok (new, in check.mjs list): all 11 demo bosses covered and each id is a real arena boss in its level file; each hint's key words exist in the boss's own source; every card x 3 key sets (kb, touch, pad) wraps <= 12 lines at 6 px/char (widest line 264 of 266 px; most 8 lines), no lower case; once/threshold/beaten/non-demo logic; firstCards + bossDeaths survive migrateProgress.
- node --check on main.js, first-cards.js, tools, check.mjs; demo-cut (all green, incl. ad-block names), comments, homepaths ok. New filenames: first-cards, first-cards-run (no ad-word).
- NOT run: tools/textfit (real font widths), stills, tools/first-cards-run.mjs (written, browser runtime check: skills card by calm, KEY arming, ONCE, hint card, flask/slot2 queue; not in check.mjs until it has run once).
- Note: I started tools/salt-card.mjs by mistake (a browser tool) and killed it within the same command, before any browser started (no leftover processes found). No other browser use.

## Browser stills / checks owed (run once the gate is done and >= 1500 MB free)
1. node tools/first-cards-run.mjs
2. stills (one headless at a time): skills card (kb), flask card, level-up card, one boss hint (longest: hornetqueen / oldtusker) and touch-key variants; node tools/textfit.mjs on the card (6 px lines, card is min(VW-16,280) wide; the 264/266 px line must be checked with the real font).

## Questions for Daniel (rec first)
1. Boss hint threshold: 3 deaths to the same boss (built, REC; one constant, FC.BOSS_HINT_AT). 2 is a one-line change.
2. Hint card shows once per boss per save and is gone for good; no way to re-read it (REC for the demo). Alternative: put the hint text in the pause menu / bestiary.
3. Flask card also on the first shrine, not only when hurt (built, REC: the shrine is a calm moment).
4. Skills card timing: 7 s calm in the first real level after the lesson (built). Alternative: when the skills menu is first opened.
