# claude/fatqueen - the Goblin Queen and King Gorm, much fatter

## What changed
- src/chars.js bakeGoblinQueen: every body shape spread 1.32x across her middle (canvas 96 to 128 wide), belly taller, arms fatter, a broad face (cheeks, jowls, second chin, wider eyes and mouth, wider crown). Heights unchanged (she is tall enough).
- src/chars.js bakeKingBig: robe half as wide again with a belly bulge over the belt, cheeks/jowls/second chin, wider boots and arms. Seated canvas 72 to 100, standing 64 to 92.
- src/main.js: Queen box w 52 to 68; Gorm box w 54 to 68 (all phases); the Queen's charge contact is now e.w/2 + 8 (was a flat 34, i.e. 26+8 at the old box). AI, damage numbers and timers untouched.
- tools/fat-sheet.mjs (capture sheet), tools/fat-pilot.mjs (before/after pilot). Not in the suite.

## Size (painted px, standing/idle frame; hitbox w)
- Queen: 78x65 before, 102x65 after (+31%); hitbox 52 to 68. Seated 82x57 to 107x59.
- Gorm seated: body 64 wide before, ~76 robe (94 with sceptre) after; hitbox 54 to 70 sprite / 68 entity. Standing 57x64 to 85x64 (robe 40 to 68 + belly); sprite box 44 to 58, entity 68.
- Sheets: work/fatqueen/before-sprites.png, after1.png (queen), after2.png (both).

## Pilot (knight/warden/pyro, seed s1, refill health, 300 s cap) - all wins
| fight | hero | before s / dmg per min | after s / dmg per min |
|---|---|---|---|
| Queen | knight | 76.7 / 202 | 89.9 / 272 |
| Queen | warden | 74.2 / 163 | 73.0 / 259 |
| Queen | pyro | 75.2 / 129 | 81.6 / 230 |
| Gorm | knight | 19.9 / 57 | 19.8 / 57 |
| Gorm | warden | 16.6 / 51 | 16.1 / 52 |
| Gorm | pyro | 17.6 / 65 | 20.4 / 56 |
Queen still dies in the same range; she hurts more per minute because her body is a bigger target for the bot to run into (more "pinned"/"slamRec" contact hits) and her charge contact is wider. Gorm unchanged.

## Checks green
queen-pillars, queen-chandelier, crown-requests, arena-supplies, king-refill (his cages still land on him and refill), boss-openings, boss-fight-end, queue-bosses (art), architecture, checkpoints, skins, dangling-paths, slopes-trace (unchanged), npc-removal. Full suite NOT run.

## UNVERIFIED
No in-game screenshot mid-fight (sprite sheets only). Gorm's seated belly overhangs the 72-wide palanquin prop by a few px each side; I judged that fine (he is too fat for it) but did not look in a live fight.

## QUESTIONS FOR DANIEL
1. Queen damage taken rose ~30-100% per minute in the pilot from the wider box alone. Recommend: accept (fatter = easier to hit and harder to dodge past); alternatively keep her hurtbox at 52 and only widen the drawn body. Built: box follows the body, as briefed.
2. Widen the palanquin prop (72) to match Gorm? Recommend yes in a small follow-up (it is shared by throne-throw and cage art, so I left it).
3. Still not fat enough? Queen is at 102 of her 65 px height; more would need a wider arena camera margin. Recommend stopping here.
