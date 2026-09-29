# claude/duck - THE UNIVERSAL DUCK (game-wide engine)

Base: claude/batch45 1900ae1 (master + sprinklecut + followups + orevalue + juice). origin/master merged: already contained.

## What changed
- **Crouch is a duck, for every hero.** Hold DOWN on the ground, standing still, with nothing else asked (no walk, swing, guard,
  roll, climb, swim): `P.ducking` is set and the hero's hurt box drops from 14 px to `DUCK_H` = 8 px. The crouch pose now follows
  the same flag, so what you see is the box.
- **Every blow has a height.** `src/marks.js` has a new hand-kept `HEIGHT` table beside `ANSWER`: one row per answered blow (every
  told blow of every common foe, 295, plus the Queen's Lance's thrust and sweep) - `high` (goes over a ducker) or `low` (reaches the
  floor). 26 are high: arrows (archer, bone archer), bolts (crossbow and the three `aim` rows), the gob mage's bolt, the ship crews'
  pistol shots and thrown grapples, the merrow harpoon, the tide marauder's harpoon jab, the watchman's halberd thrust, the haunted
  armour's flat swing, the farmhand's scythe, the crow's dive at the face, the gaffer's hook, the horn's gust (crouch braces), and
  the Lance's thrust. Everything else is low (sweeps, waves, rolls, slams, lobs, dives from above, bites, grabs).
- **How a high blow goes over.** Melee: `damagePlayer` asks whether the attacking creature's last told windup is a high row and is
  still landing (`blowHigh`: 0.9 s after the windup, or while the creature stays in the blow's own mode - a crow's whole flight);
  if the hero is ducked the blow passes, exactly like a roll's grace (the Lance whiffs and stands open). Seeds: whatever a creature
  throws on a high tell is stamped `s.high`; it flies over a ducker only while near level (|vy| <= 0.8 |vx|), so **an archer on a
  ledge shooting down still finds you**. Low blows hit a ducker exactly as before.
- **The tell says which.** Beside the ! or the !! a second small sign is drawn: a DOWN arrow over a floor line (duck it) on high
  blows, an UP arrow off a floor line (jump it) on blows answered `jump`. Nothing beside the mark = block it or get out of it.
- **Taught early.** The first high tell near the hero in a level (a crow on the Greenwood road, an archer's draw) raises the hint
  "THE DOWN ARROW BY A MARK: HOLD DOWN AND THAT BLOW GOES OVER YOU." - twice per save, once per level.
- **Kept as they were:** brace (down braces in a gust), the low sweep (down + swing: a swing is not a duck), drop-through (down +
  jump on a board), the slope slide (a slide is moving, not a duck), the cart and boat beams (still read the down key).
- **The hide now works.** The harbour lookout's "cannot see a crouching hero" read `P.crouch`, which nothing ever set (dead code on
  the base). `P.crouch` is now the duck, so a ducked hero in front of a lookout is not spotted. See QUESTIONS.
- **The bot ducks.** `src/lab.js duckNow`: a high blow told at the hands is ducked from the last 0.3 s of its windup until it has
  gone over - red high blows by every hero, yellow ones by the heroes with no held guard (warden, pyromancer, freebooter); the
  knight, paladin, death knight and geomancer keep blocking yellow ones (a guard turned is the knight's opening). Used by the common
  foe frame (fightLab/ambushLab) and the generic bossLab frame.

## API for the CHASE engine and the minecart / Rockslide levels (src/duck.js)
- `P.ducking` - true this frame when the hero is ducked (reset at the top of `updatePlayer`, so flying, carpets, rides are never ducked).
- `DUCK_H` (8) - the ducked hurt-box height; `duckBox(P)` - the hurt box as it stands now.
- `duckClears(P, y)` - true when a beam / bar / hazard whose LOWEST point is at world y goes over the ducked hero. Use this for beams
  instead of reading `keys.down` (the two existing beams - the cart beam and the boat beam - still read `keys.down` and were left alone;
  moving them to `duckClears` means P.ducking must allow a moving mover, which it does: on a mover the speed test is skipped).
- `blowHigh(e, now)`, `seedOver(P, s)` - the creature and seed rules above. `BK.duck()` for tools: `{ H, ducking, box, ducked, tells, braced, clears(y), high(e), lane(e), height(e) }`.
- A new creature: give its told blow an ANSWER row and a HEIGHT row; `tools/answer-tags.mjs` fails until it has both.

## Numbers
- Queen's Lance pilot (tools/duck-pilot.mjs: bossLab, Stormhold, refill health, 150 s cap, salt duck-1), BEFORE (base) -> AFTER:
  - knight: win 66.1 s, taken 129 -> win 66.1 s, taken 129 (identical: he blocks the thrust)
  - warden: win 102 s, taken 206 (thrust 96) -> win 57.2 s, taken 149 (thrust 0)
  - pyromancer: win 46.3 s, taken 117 (thrust 24) -> win 67.0 s, taken 163 (thrust 0; taken per minute 152 -> 146)
- answer-tags coverage report: levels asking for fewer than three answers 14 of 32 -> 2 of 32 (a level with a high yellow blow now
  also asks for the duck). Left: mage (block + duck), caravan (block + dodge: no high blow there).

## Checks (all green, run by name)
duck (new; red on the base: it cannot import src/duck.js there), answer-tags, tells, untold-told, attack-tokens, combat-feel, juice,
boss-fight-end, architecture, checkpoints, skins, dangling-paths, slopes-trace (unchanged for every level), npc-removal, lance-support,
firsthour, moor-gusts, comments, homepaths, content-audit.

## UNVERIFIED
- Pilots: one seed per hero, as the cost rules say. The pyromancer's slower win is single-seed variance or the duck costing her the
  roll that used to carry her past him - not separated.
- Not played by hand. The lane glyph was checked as drawn (BK.duck().tells), not looked at in a screenshot.
- Co-op: each hero carries his own `P.ducking`; not exercised with two heroes.

## QUESTIONS FOR DANIEL
1. **The hide.** The lookout's "a crouching hero is out of sight" never worked (nothing set `P.crouch`). It is live now: duck in front
   of a harbour lookout and he does not see you. Rec: keep (it was clearly meant). Alternative: leave it dead.
2. **Which melee is high.** Built: arrows, bolts, shots, thrown lines, and a few long head-high weapons (halberd thrust, armour's flat
   swing, farmhand's scythe, harpoon jab, gaffer's hook). Ordinary sword slashes stay LOW so the duck is not an answer to everything.
   Rec: keep this narrow set; add more per level when a design lane wants a duck beat.
3. **The teach.** A hint on the first high tell (twice a save), not a sign in the Greenwood. Rec: keep the hint; a painted sign by the
   first crow string can follow in a Greenwood lane if you want it in the world.
4. **Caravan has no high blow** (the slingers lob). Rec: leave; the desert lane can give a cutthroat or an archer a level shot if you
   want a duck there.
5. **The cart and boat beams** still read the down key (unchanged). Rec: move them to `duckClears` in the minecart/chase lanes that
   own them.
