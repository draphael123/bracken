# claude/weakboss — lane report (2026-09-29): THE WEAK BOSSES GET CAUSED OPENINGS

Daniel's HANDOFF item 15. The problem was the same in all three minis: the opening came on its own, they did almost no harm,
and phase two was only faster. For each one I made the opening something the player CAUSES, added told attacks that hurt,
and gave phase two something that changes the fight. None of them got more health.
Then, with credit left, I tuned THE DEATH KNIGHT.

The fights stay in `src/main.js`. Moving them into their own modules was not cheap: `tools/tells.mjs` (and the MARK table
it writes) reads the tells only out of `update*` functions in `src/main.js`. A module would have needed hand rows in BY_HAND,
and those rows lose the audit. Every edit stays inside the three fights: their update functions, their hurt lines, their
frame lines, their draw hooks and their bestiary rows.

## What changed

### THE LAMPREEVE (the Lamplit Street's market hall)
- **The opening is caused: strike the lamp he is hooding.**
  - He walks to the nearest burning lamp. The callout is `HOODING IT: STRIKE THE LAMP`.
  - He hoods it for 0.5 s of tell, then holds the hood on it for 1.2 s while it gutters.
  - A blow on that lamp in that window flares it into his face. He is **BLINDED**: open for 1.9 s (1.6 s in phase two), and
    a blow lands x1.4. The lamp stays lit.
  - If you leave the lamp, it goes out and he walks on, whole.
  - He always leaves the last lamp in the hall burning, so the opening can never run out.
  - The old "reach" window, which opened him every time he hooded a lamp, is gone.
- **Out of the flare his wet coat takes three quarters of a blow** (x0.25). A hint names the lamp the first two times.
- **New told blow: THE LUNGE FROM THE DARK** (`lungeTell`, red `!!`, unblockable, 24 damage).
  - He only does it while you stand out of the light (`litNear` 110 px).
  - He sinks back into the dark (he fades), then drives the pole across the floor.
  - Rolling through it avoids it. It never comes at a hero in the light.
  - New frames 12 lunge tell, 13 lunge and 14 blinded, in `src/redraw/city.js`.
- **Phase two (half health): HE TAKES YOUR LIGHT.**
  - `takeTell` is quiet: no mark, and nobody is struck.
  - The fire in your hand goes out, and your light (`playerLight`) shrinks to 10 px until you stand at a burning lamp. The
    callouts are `YOUR LIGHT IS OUT: RELIGHT IT AT A LAMP` and then `YOUR LIGHT AGAIN`.
  - Out of the light he lunges sooner and more often (every 3.6 s, reaching 240 px).
  - It only applies while the mini fight is live, and it resets on load.
- The door sign reads: `HE HOODS THE LAMPS ONE BY ONE. STRIKE THE LAMP UNDER HIS HOOD: ITS FLARE BLINDS HIM.` The bestiary is rewritten.

### THE HEADLESS PLOUGHMAN (the Hexed Fields' furrows)
- **The opening is caused: bait the plough.**
  - His field now has a stone trough (col 303) and a rail fence (col 320): `L.mini.baits` in `src/level.js`.
  - They are drawn from the fields' own art: the hex trough (ghost green, which is the level's "you can use this" colour)
    and the crooked fence. A baited one rings green while his charge tell points at it.
  - The charge now runs 72 px past where you stood, not the length of the field. It sticks ONLY if a trough or fence is in
    its path: 1.8 s open (1.5 s in phase two) at x1.4.
  - A charge over open ground runs out and he turns it (`turn`, no opening). He comes again sooner, so a charge you did not
    bait costs you, not him.
  - He was moved from col 320 to col 316, off the fence.
- **Behind the plough he takes x0.4** (was x0.6). Stuck he took x1.8, and now takes x1.4.
- **THE HEAD is a real told blow.**
  - It is red `!!` and unblockable (16 damage). Before, it was a yellow `!` that a shield turned.
  - A red ring on the ground follows you until the arm comes back. Then the head lands on the ring and burns there.
  - Leaving the ring late avoids it.
- **Phase two (half health): HIS FURROWS WAKE.**
  - Every run of the plough leaves a furrow of turned earth, drawn on the ground and lasting 22 s.
  - In phase two they smoulder, and he calls them up (`furrowTell`, red `!!`, 1.0 s). The furrows glow red, then burst along
    their whole length: 20 damage, unblockable.
  - Being off the furrows, or over them, avoids it. So the ground you bait him across is the ground that will burn you.
  - New frames 10 furrowTell and 11 furrow in `src/redraw/strawking.js`. Hurt is still the last frame, now 12.
- The door sign reads: `THE PLOUGHMAN. JUMP HIS PLOUGH INTO THE TROUGH OR THE FENCE: IT STICKS THERE, AND ONLY THERE.` The bestiary is rewritten.

### THE HOMUNCULUS (the Mage's Folly, the lab cell)
- **The opening is caused: a trick that misses you breaks its jar.**
  - Its five tricks are SCUTTLE `!!` (jump), FLASK `!!` (leave the ring), POUNCE `!`, POUND `!!` (jump) and SWIPE `!`.
  - A trick counts as missed when it is jumped, rolled, turned on a shield, or thrown at a place you have left.
  - A miss costs it the bell jar. The jar smashes on the floor **where you were** (the trick's aim), and the callout there is
    `MISSED: ITS JAR BREAKS`.
  - It is then **BARE**: open for 1.3–2.2 s by trick, at x1.6. There is a new `bare` frame: no jar, broth running off its head.
  - A trick that lands costs it nothing: it gloats (0.55 s) and comes again.
  - The old "spent after every trick" is gone.
- **In its jar it takes x0.35** (was x0.55). Bare it takes x1.6 (was x2).
- **Every trick hits harder:** swipe 14→16, scuttle 18→22, pounce 16→20, pound 20→22, flask 14→18.
- **Phase two (half health): its tricks come in PAIRS, and it hides in the smoke of its broken jar.**
  - The second trick is told as the first ends, with a 0.75x tell.
  - Only the second trick's miss breaks the jar.
  - A jar broken in phase two leaves a cloud of smoke where it smashed.
  - When its bare window ends, it hides in that smoke for at most 1.4 s: nearly invisible, and a blow does nothing. Then it
    comes out on a told scuttle.
  - It hides at most once between pairs.
- **Hurt frame bug fixed.** Its hurt frame was not the last one: the flask frames came after it, so `HAS_HURT` showed its
  lob pose when it was struck. Hurt is last again (15).
- The door sign reads: `IT WEARS ITS JAR. MAKE A TRICK MISS YOU AND THE JAR BREAKS: CUT IT THEN.` The bestiary is rewritten.

### THE DEATH KNIGHT (credit left over)
- The stuck blade now holds him **1.5 s** (was 2.0).
- His phase two comes at **three-fifths** health (was half), via `UNB.bk.p2At`.
- His health is unchanged at 950.
- `tools/boss-openings.mjs`'s "open ~2 s" assertion now asks for ~1.5 s (at least 1.3). That is the approved new window, not
  a weaker test.

### The bot (`src/lab.js`)
- **Lampreeve:** when he goes for a lamp, the bot goes to that lamp's far side and strikes it while the hood is on. When he
  is blinded, it cuts him. In phase two it walks to a burning lamp to get its light back.
- **Ploughman:** the bot stands just beyond the trough or fence furthest from him, on the far side, so his plough goes into it.
- **Homunculus:** the bot stands a stride out of its swipe and answers every trick: red ones rolled, yellow ones guarded, the
  pound's wave jumped. It cuts only while the Homunculus is bare.
- `BK.bossOpen` now answers `e.open > 0` for the Lampreeve and the Homunculus. Before, the lab treated both as always open.
- Nothing is flared, dropped or broken for the bot: every opening comes from a real swing, dodge or position.

### Marks, answers, heights
- `tells --write` added `lampreeve|lungeTell !!`, `lampreeve|takeTell ''` (in QUIET), `ploughman|furrowTell !!` and
  `ploughman|headTell !!` (the head is in THROWN).
- ANSWER and HEIGHT rows now exist for every told blow of the three minis:
  - the lunge: dodge / low
  - the plough and the furrows: jump / low
  - the head: dodge / low
  - the goad: block / low
  - the Homunculus's five tricks: scuttle and pound jump, flask dodge, pounce and swipe block (all low)

## Pilots
Boss lab, refill health, one pinned seed per hero, a 240 s cap: `node tools/weakboss-pilot.mjs 240 lamplit,fields,mage,unburied`.
BEFORE was run on the base (5b0ec84) and AFTER on this branch. Logs: `work/weakboss/pilot-before.txt` and `work/weakboss/pilot-after.txt`.

| boss | hero | before: secs / hp taken / opened | after: secs / hp taken / opened |
|---|---|---|---|
| Lampreeve | knight | 12.1 / 0 / 1 | 33.3 / 38 / 2 |
| Lampreeve | warden | 11.1 / 0 / 1 | 20.9 / 20 / 1 |
| Lampreeve | pyro | 9.4 / 0 / 1 | 25.5 / 0 / 0 (won through the coat, never flared a lamp) |
| Ploughman | knight | 34.0 / 58 / 1 | 49.4 / 106 / 5 |
| Ploughman | warden | 33.7 / 101 / 1 | 57.0 / 184 / 6 |
| Ploughman | pyro | 20.2 / 48 / 1 | 30.7 / 39 / 3 |
| Homunculus | knight | 35.4 / 62 / 1 | 63.6 / 0 / 11 |
| Homunculus | warden | 24.4 / 43 / 1 | 39.5 / 138 / 3 |
| Homunculus | pyro | 16.1 / 0 / 1 | 30.6 / 41 / 3 |
| Death Knight | knight | 111.0 / 45 / – | 117.2 / 101 / – |
| Death Knight | warden | 125.2 / 41 / – | 139.1 / 92 / – |
| Death Knight | pyro | 38.1 / 0 / – | 47.8 / 30 / – |

- All 12 fights are won, before and after.
- Every AFTER fight is longer than its BEFORE.
- The hero took more damage in 8 of 12 fights. The exceptions:
  - Ploughman pyro took about the same (48 → 39).
  - The Lampreeve pyro still took nothing: it killed him through his coat without flaring a lamp.
  - The Homunculus knight's guard turned every trick, which is the design working: 0 taken, 11 openings.
- The page is not perfectly deterministic. A second after-run gave Homunculus knight 68.5 s / 82 taken and Ploughman knight
  58.8 s / 187 taken.
- The "opened" column counts entries into the open window as the lab sees it. The Death Knight's shows 1 because his
  opening is `stuck`, which the lab reads through its own branch.

## Checks
- **New: `tools/weak-bosses.mjs`**, in `tools/check.mjs`. In the page it asks, for each boss:
  - **Lampreeve:** a hood left alone opens nothing and the lamp goes out; the struck lamp flares and blinds him; the blow is
    bigger blind and smaller through the coat; the lunge is told `!!`, hurts a hero who stands and misses one who rolls; he
    never lunges into the light; phase two takes the light and a lamp gives it back.
  - **Ploughman:** a charge over open ground turns and opens nothing; baited into the trough or the fence it sticks and opens
    him; a charge leaves a furrow; he takes more stuck than behind the plough; the head is `!!`, lands on its ring and misses
    a hero who leaves late; phase one never wakes the furrows; in phase two the furrows are told `!!` and hurt a hero on
    one, not a hero off them.
  - **Homunculus:** each of the five tricks, landed, opens nothing, and missed or turned, leaves it bare and open; each wears
    its mark; the flask smashes where you were; it takes more bare than in its jar; in phase two a second trick is told
    before the jar breaks, and the broken jar leaves smoke it hides in (untouchable) and comes out of on a told scuttle.
  - **Death Knight:** stuck 1.5 s, phase two at 0.6, health 950.
  - **It is red on the base:** `work/weakboss/weak-bosses-red-on-5b0ec84.txt`. Every Lampreeve, Homunculus and Death Knight
    item fails there, and the Ploughman section throws (his field has no baits).
- **Green on this branch after the merge** (`work/weakboss/checks-2.txt`): weak-bosses, boss-openings (A11), unburied-fights,
  unburied, tells, answer-tags, comments, signs, dangling-paths, homepaths, checkpoints, npc-removal, architecture, syntax.
- **Green earlier on this branch** (`work/weakboss/checks-1.txt`, before the last Ploughman tuning and the merge):
  boss-fight-end, boss-jump, skins, slopes-trace (unchanged for every level, no rebase), folly-runtime, courtyard,
  archmage-folly, folly-library.
- **Also green:** untold-told, attack-tokens and textfit, run after the answer rows went in.
- **Re-run after the merge** (`work/weakboss/checks-3.txt`): boss-fight-end (46 fights end), boss-jump (46 load), skins and slopes-trace (unchanged, no rebase). All four are green.
- **The 7 REQUIRED CHECKS:** architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace and npc-removal.
  All seven are green.
- The full suite was NOT run.

## UNVERIFIED
- **Not played by hand.** Nobody has judged by eye in motion whether the lamp flare, the fading lunge, the baits' green ring,
  the furrow glow or the smoke read. The six new frames were only looked at as a still sheet (`work/weakboss/new-frames.png`).
  The Lampreeve's lunge frame shows the pole short and tipped up, and could be better.
- The Lampreeve pyro row wins through the coat without once flaring a lamp. The bot's lamp strike misses for that hero
  (its blow's reach), so the pilot does not show the pyro's opening.
- The Homunculus's smoke is drawn in the Mage overlay, over the hero. That is meant to hide it, but it has not been seen.
- The Ploughman's baits are level data (`L.mini.baits`), not props. So the prop audits (floaters, pixels) do not see them.
  They are drawn at floor level from the fields' own art.

## QUESTIONS FOR DANIEL
1. **Lampreeve: the last lamp.** He never puts the last lamp in the hall out, so the opening can never run out. I built that.
   *Recommendation: keep it.* The alternative is to let him darken the whole hall and have phase two relight one lamp.
2. **Lampreeve: is the flare's reach too generous?** A swing at him while he stands under the lamp usually catches the lamp's
   box too, so "strike the lamp" and "strike him at the lamp" overlap. *Recommendation: keep it* (you still have to be at
   the lamp in the hood window). Or narrow the lamp's box to its hood.
3. **Ploughman: two baits, the plough runs 72 px past you.** *Recommendation: keep it.* A third bait (a hay cart mid-field)
   would make baiting easier if play says it is too fiddly.
4. **Homunculus: a guarded yellow trick counts as a miss** (the pounce, the swipe). That is why the knight pilot opened it 11
   times and took nothing. *Recommendation: keep it* (turning a blow is answering it). The harsher option is that only
   dodged tricks count.
5. **Death Knight:** I did both levers, the 1.5 s stuck window and phase two at three-fifths. *Recommendation: play it.* If it
   is now too hard, put phase two back at half first.
6. **The multipliers, not health, carry the difficulty** (Lampreeve x1.4 / x0.25, Ploughman x1.4 / x0.4, Homunculus x1.6 /
   x0.35). *Recommendation: tune these after a hand playtest,* never their health.
