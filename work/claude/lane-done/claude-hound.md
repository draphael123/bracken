# claude/hound - THE GREAT HOUND is never invulnerable (Daniel's live feedback, 2026-10-07)

Base: master 56c2cf92. Branch claude/hound. Port 8728.

Daniel: "too difficult simply because he's invincible outside of very small windows. There's no reason for that. He should NOT be
invincible. You can give him a little more health, give him one more attack, but he shouldn't be invincible."

## What changed

- **Always hittable for real damage (B11/B13).** He is off the mini chip (src/boss-greed.js: out of CHIP_MINI, on FULL_DAMAGE as a
  beast duelist). Outside his openings a blow used to land at a twentieth; now every hero blow takes real health.
- **Guard by angle.** His head and jaws turn PART of a blow struck into his face at his height: it lands at x0.4 with a CLANK, a
  flash and the word GO ROUND (src/boss-read.js turned()). From behind him, or from the air over him, it lands whole, and such a blow
  never counts as greed.
- **Bonus openings kept.** The lunge taken on a shield (IT SKIDS) and the pups killed in time (IT WHINES) still stand him still
  for 3 s - now with a gold ring on the floor and a gold timer bar over him, and every blow in them lands x1.5 from any side (a third
  of him at most per opening, as before). When one ends his WARD is told (B3): "HIS WARD: HE SHAKES IT OFF", a pale ring, 3 s in
  which nothing gives a new bonus opening (a blocked lunge just skids). He is still hit for real during the ward.
- **The pups are KEPT** (Daniel, via the coordinator: "the Great Hound KEEPS his pup summons"). The howl, the pups and the whine are
  unchanged; the brief's cut was never built.
- **One new told move: THE BOUGHS** (B5). He rears and slams the old oak: three red rings on the floor (where you stand and a stride
  either side) with leaves shaken loose over them for the whole tell (0.95 s, 0.8 s past half his blood), the dead wood seen falling
  for the last 0.4 s, then it lands on the rings (16, no shield turns a bough). Mark red !! (marks.js BY_HAND + MARK via
  tells --write), ANSWER dodge (the bot rolls out), HEIGHT low, the word "THE BOUGHS: GET CLEAR" in the hint box (hint-lines.js),
  SFX roar + his howl sound + a small shake. He stands in his rear while it falls: it is also a window to cut him. One windup at a
  time; after it his lunge and pounce wait at least 1.2 s. Every 7.5 s (5.5 s in phase 2).
  (Pounce-and-pin was the other rec, but he already has a pounce; the bough-fall fits the Kingswood and gives a new answer shape.)
- **Health and bite.** hp 220 -> 765 (src/great-hound.js GH.hp) and BOSS_HIT 1.3 -> 1.5. See the QUESTION below about "a little more health".
- New module src/great-hound.js (his take, ward clock, bough spots, drawing). main.js edits are small and local: import, EHP row,
  spawn timer, updateGreatHound (ward step, skid/whine under the ward, boughTell pick + resolve), frame 5 for the rear, the take in
  hurtEnemy0, one draw call, the bestiary line, BOSS_HIT row.
- New Node check tools/great-hound.mjs (added to check.mjs's list): never on the chip, every side takes real health (front >= x0.3),
  behind/above whole, open x1.5, the told ward, the pups kept, THE BOUGHS marked/answered/worded/resolving, floor between the rings.

## Tests changed as Daniel's design change (same strictness)

- tools/boss-greed.mjs: DUELISTS (the FULL_DAMAGE allow-list) gains 'greathound'. The check still demands FULL_DAMAGE be exactly the
  named list and that each has an opening rule. No other test pinned his chip/invulnerability/pups (rule-openings' MINI_OWN_CAP row
  still holds unchanged).

## Measures

kings:mini, tools/boss-rates.mjs --profile=human (practiced, campaign L4, dry), shipped hp 765 / BOSS_HIT 1.5:
- **knight 6/8, warden 6/8, pyro 7/8 = 79% (n=24)**; the 740-770 settings pooled = 72/96 = **75%**. The bot is noisy at this n
  (770 alone gave 63%, 740 and 755 79%). No hero at 0.
- Duel length (wins): knight 42-55 s (mean 47), warden 26-55 s (mean 38), pyro 17-33 s (mean 26).
- Tuning path: 250 hp/1.3 = 100% in 12 s (the old chip number was the whole fight); 700/1.3 = 78%; 800/1.3 = 72% but the WARDEN
  MASHER beat him (0% left, 97% lost); 900/1.3 = 56%; 800/1.6 = 56%; 650/1.5 = 83%; 720/1.5 = 83%.
- **Mash 0/6** (tools/mash-bot.mjs kings --mini-only --write, the mini row only; the level hash did not move, so no level row):
  knight 78%/80% left, warden 46%/46%, pyro 65%/89%.

Checks run green (PORT 8728): great-hound, tells, answer-tags, hint-shown, rule-openings, boss-greed, boss-read, boss-openings,
mash-gate (40/40), boss-fight-end (54/54). Screenshots of THE BOUGHS' rings and the open ring/timer checked by eye at the boss zoom.

## Anything red

Nothing red from this lane. Amber: the pyro's duel is short (~26 s mean, under the ~40 s mini duel) - her burn is not turned by his
jaws (the guard is for a hero's blow, as for every duelist), and she breaks him often.

## QUESTIONS FOR DANIEL

1. **Health: 220 -> 765 is not "a little more".** On master he had 220 hp but outside two 3 s windows a blow took a twentieth, so the
   220 was really "220 in the windows". Hit for real at 250 hp the bot killed him in 12 s, every hero. 765 (with his bite 1.3 -> 1.5,
   which is what keeps a pure masher losing) is what puts him in the mini band. Rec (built): keep 765. Alternative: a lower number
   with a stronger frontal guard (x0.25) - fewer hit points, more "go round".
2. **Frontal guard x0.4 (GO ROUND).** Rec (built): keep it - it makes jumping him / getting behind after a lunge the right play
   without ever being a wall. Or drop it (full damage from every side) and raise hp further.
3. **The pyro is quick against him** (~26 s). Rec: leave it (she is the fire hero and the Kingswood is early); or let his jaws turn
   part of her burn too (a balance call for every duelist, not only him).
4. **THE BOUGHS** as his new move (red rings, roll out) vs the pounce-and-pin rec - built THE BOUGHS since he already has a pounce.
