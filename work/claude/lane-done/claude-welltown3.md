# claude/welltown3 - THE WELL TOWN: the Cistern Queen, the Gang Leader, well clarity, the art pass

Opus, 2026-10-02. Branch `claude/welltown`, from f7684bf8 (batch55 in). origin/master (theatre3, canalfix3, the weighty retirement) is merged in.
The spec was Daniel's WELL TOWN BOSS CHANGE and CISTERN QUEEN MOVESET (10-02). It is copied with the as-built into `docs/concepts/the-well-town.md`.
The art pass ran as a Sonnet sub-lane on `claude/welltown3-art` and is merged here. Nothing ships without Daniel's play.

## What changed

### 1. THE CISTERN QUEEN, the town's boss
Files: `src/cistern-queen.js` (the fight, pure), `src/cistern-queen-hands.js` (its hands) and `src/redraw/cistern_queen_art.js` (her drawing).

**Her arena.** Past the courtyard, THE OLD WELL (515-527) drops down a shaft into THE QUEEN'S CISTERN:
- 528-567, fifteen rows high, under the street.
- A stone ledge and a rope ladder on each wall.
- A spring basin under each ledge.
- THE WINDLASS on the floor. Struck, it drops the shaft's great bucket into the sump; it rewinds in 7 s.
- A grated sump under the shaft.
- When she dies, her east wall opens onto the old outflow and the level's gate.
- Checkpoint five stands at the old well's head (a door checkpoint). Two of her brood hold the well's mouth.

**Her moves.** All the spec's moves, by phase. Each is told with a src/marks.js row (`!` yellow is blockable, `!!` red is not), and the high ones duck:
- **P1, the sand:** pincer `!`, snap-snap-lunge `! ! !!`, tail lance `!!`, sand flick `!`. Under the sand: sand strike `!!` (a bulging mound) and burrow charge `!!` (a dune wave).
- **P2, the walls and the shaft:** venom spit `!` (leaves a puddle), tail sweep high and low `!!` (a lit band), wall slam `!!` (rubble shadows, the ledges included), stinger pin `!!` (it sticks in the floor for 1.3 s), drop pounce `!!` (a growing shadow), skitter ambush `!!` (dust trickles over the tunnel she will come out of).
- **P3, the flood:** the hall floods and her brood comes. Wave thrash `!!`, grab and sting `!!`, death roll `!!`, tidal tail `!!` (high), brood shield (the sump's deep water drowns the brood).
- **Enraged under 15%:** snap-snap-sting into the death roll.

**How she fights.** Every cycle is a different order; P2 stays on a wall long enough to climb to its ledge. She always fights: never more than 1.6 s between blows.

**Her openings are all water, 3.2 s each:**
- **SOAKED:** pour on her mound, or bring the bucket down on it.
- **ON HER BACK:** pour down the wall above her from her wall's ledge, or bring the bucket down while she hangs in the shaft.
- **REARING:** break her grab, by striking the claw as it comes or mashing out.

**Damage rules.**
- Outside an opening, her raised claws turn a frontal blow (0, with a claw spark). From behind, the global x0.05 applies.
- In an opening a blow lands x1.9, and one opening takes at most 14% of her.
- Her `OPEN_RULE` row is in `src/boss-greed.js`.

**Venom.** A stack per hit from the lance, spit, puddle, pin, sting or tidal tail. Each stack cuts stamina regen by 25% for 6 s, up to three. It is read by main.js's regen line as `P.venomSlow`.

**Her look.** Drawn live from her pose: about 150 px long, three heroes tall to her tail, with a lit amber stinger that goes white-hot when told. She is turned on end on a wall and upside down in the shaft. Soaked, on her back, rearing and the roll each have their own pose. The bestiary card and her body come from the same drawing.

**Her theme.** `cisternqueen` in `src/boss-music.js`:
- C# Phrygian, a low pulsing drone, scraping clicks, and a hissing motif that rises.
- `:p2` is quicker, with the motif an octave up.
- `:p3` adds the surge and drips.
- Sound Test entry: "The Cistern Queen".

**Intro.** The boss card names her from the bestiary row: THE CISTERN QUEEN, the dry cistern under the Kasbah. The bar says SOAKED / ON HER BACK / REARING / BURROWED.

### 2. THE GANG LEADER, a mini in the Kasbah courtyard
Files: `src/gang-leader.js` and `src/redraw/gang_leader_art.js`. The Bandit King is gone; `src/bandit-king*.js` were deleted (the dangling-paths MISSING list says why).

**His kit:**
- Two swords: the double cut and the cross cut (`!`). His other blade guards while he cuts, so a frontal blow then is turned.
- The whirl (`!!`).
- Molotovs (`!`). Strike one back and it flies home and sets him ALIGHT: open 3.2 s at x1.4, a fifth of him per burning at most (inside Daniel's third).
- The dodge: he slips most blades while he stalks you and ripostes (`!!`).
- After each of his own blows he is OFF BALANCE for 0.35 s, for two clean cuts.
- No charge. The douse at the well is gone.

**Rules.** As a mini he keeps full damage, the mini greed and x1.3 hits. He keeps the King's theme (`banditking`, faster at half health). The Sound Test title is "The Gang Leader". His gate at 514 lifts when he falls.

### 3. Well clarity
- **The HUD skin:** 3 pips plus the live verb: `E: FILL` / `E: POUR` / `E: DRINK` / `E: POUR IN`, `STRIKE THE WINDLASS` at a deep well that is down, and `FILL AT A WELL` when empty.
- **Wells that can fill you GLINT.** The art sheen is the art lane's; the white star is mine.
- **Markers.** While you carry water, the near mud walls and fires show their cracks and smoulder (the art lane's `wet` state) and a bobbing POUR marker.
- **The pour arc.** A dotted arc from your hand to where a pour would land, on any pourable target: wall, fire, her mound, her wall.
- **The safe first lesson.** A mud postern in the outer wall at col 14, three steps from the first well, out of every bowman's sight. It is required.
- **Mobile.** At the coordinator's request, `WTH.welltownVerb()` is pushed onto `BK.touchVerbs` when that array exists, so claude/mobile's action button shows FILL / POUR / DRINK / WIND. It is untested until mobile merges.
- **Hint lines.** All in `src/hint-lines.js`. hint-shown is green.

### 4. The art pass (claude/welltown3-art, Sonnet)
- **Tile kit and backdrop.** Its own desert-town tile kit (`src/redraw/welltown_tiles.js`): sandstone, mudbrick with whitewash, flat roofs, palm boards, rope ladders, and blue-grey cistern stone keyed off `wtCistern` / `wtQueen`. Its own backdrop (`src/redraw/welltown_backdrop.js`): dunes, an oasis, domes, a minaret, the dovecote, and the Kasbah's towers ahead.
- **The water machines,** redrawn behind the same API (`src/redraw/welltown_props.js`).
- **The water-thief and the bowman,** redrawn.
- **Captures:** `work/claude/welltown3/before` and `/after` (level), and `/boss-after` (the bosses: `tools/cisternqueen-shots.mjs`).

### Other
- **Level.** W 522 to 584, H 44 to 60. Five checkpoints, one per 115 route tiles. Two brood scorpions were added on the cisterns' gallery so the round way is not free (density).
- **New check `tools/cistern-queen.mjs`** (72 asserts; it is in the check list):
  - the spec's moveset by phase, each told with its mark in src/marks.js
  - every cycle different, and she always fights
  - her openings, and the guard on the front only
  - the Gang Leader's kit
- **Tools updated:**
  - `tools/welltown.mjs`: the hall, her rule, his mini, his gate.
  - `tools/welltown-probe.mjs`: her guard, chip and opening x, the HUD verbs, the first lesson.
  - `tools/boss-openings.mjs`: her three openings and his burning cap.
  - `tools/welltown-pilot.mjs`: her, or `--mini` him.
  - `tools/boss-music.mjs`: her theme asserted.

## Numbers
| | before | after |
|---|---|---|
| boss, human bot (`combat-pilots`, 3 heroes x 1 seed) | Bandit King 3/3 (39-55 s) | Cistern Queen 1/3 (180 s cap; one timeout) |
| boss, human bot (`welltown-pilot`, 4 salts x 3 heroes) | King 71% | **Queen 7/12 = 58%**: knight 2/4, warden 2/4, pyro 3/4; wins 103-134 s, about 7-8 openings a win |
| mini, human bot (`welltown-pilot --mini`, 2 x 3) | (none) | **Gang Leader 4/6 = 67%**, wins 37-57 s; `combat-pilots --mini` 2/3 |
| mash bot, boss | 0/6 | **0/6** (she is left at 92-100%) |
| mash bot, mini | (none) | **0/6** |
| mash bot, level | knight dies; warden 22%, pyro 30% | knight dies; warden 22%, pyro 30% (all under 40%) |
| level-1 no-ability pilot (knight, 3 runs) | 33 blows, 0 deaths, 4 kills | **42 blows, 1 death**, 6 kills |
| level-quality | clears | **clears**; density 1.18 encounters a screen, 23% empty screens |

## Checks (run by name; green on the final merged branch)
- **Level and boss:** welltown, welltown-probe, cistern-queen, level-quality, mash-gate, boss-greed, boss-openings, boss-fight-end (50 fights).
- **Music and text:** boss-music, soundtest, audio-assets, tells, hint-shown.
- **Level rules:** one-new-foe, architecture, checkpoints, checkpoint-gaps, skins, dangling-paths, npc-removal, floaters, dressing, sprinkle-cap, slopes-trace.
- **Pixels:** `npm run check -- pixels`.
- **slopes-trace** was rebased for welltown only (the first lesson's wall and the new east end changed its walk). The other five levels are identical.
- **textfit** has no welltown items. Its OVERFLOW 1 (the fair's TICKETS sign) and TRUNCATED 1 (the theatre's bossjump title) are other lanes'.
- **one-new-foe accounting.** The rule counts common foes, not bosses or minis. The Queen's brood are the desert scorpion (not new), so welltown's one new foe is still the water-thief. The Queen and the Gang Leader are the level's boss and its one mini (Daniel's exception).

## UNVERIFIED
- Nothing was played by hand. Seen only as stills (`work/claude/welltown3/boss-after`, after) and bot runs.
- Her art is procedural and greybox-plus, though her SIZE reads. Her east-wall pose and the brood shield were not looked at on screen.
- **No venom HUD icon.** Venom shows as the stamina slowdown and a one-time line only.
- The music was not listened to.
- Co-op: E (fill, pour, drink) is still player 1's only. Her grab and blows do loop over both players.
- The human-bot numbers swing a lot with seeds: one more whirl moved the Gang Leader from 67% to 0%. Treat 58% and 67% as roughly in band, not precise.
- `combat-pilots` reported a 180 s warden timeout on her. `welltown-pilot` gives 300 s and he wins 2/4.
- The touch verb hook is untested (claude/mobile is not merged).

## QUESTIONS FOR DANIEL (the recommended option is built)
1. **Her frontal guard turns the blow fully (0); from behind it is the x0.05 chip.**
   - *Rec:* keep. The guard is visible and clanks, and the line says what to do: GET BEHIND, OR GET WATER ON HER.
   - *Alt:* front x0.05 too, with the guard only cosmetic.
2. **One opening takes at most 14% of her (x1.9 inside it), so every hero needs about seven.**
   - Without a cap the knight finished her in two openings.
   - *Rec:* keep.
3. **The Gang Leader has more than the spec, added to make him beat the mash bot:**
   - his second blade guards while he cuts
   - the riposte is a red `!!`
   - off balance after his blows
   - a burning caps at a fifth, not a third

   *Rec:* keep, since all are told and readable. *Alt:* drop the blade guard and let the mash bot win the mini sometimes.
4. **Her fight starts with your skin full**, as if you came down the old well with water.
   - *Rec:* keep. A checkpoint respawn fills it anyway.
   - *Alt:* make the player walk to a spring.
5. **The art lane's `bakeBanditKing` is left in `src/redraw/welltown_art.js`, unused.**
   - *Rec:* delete it in a small cleanup.
6. **Venom has no HUD icon.**
   - *Rec:* a small art follow-up adds green drops under the stamina bar.
7. **Her sprite is drawn live.**
   - *Rec:* a Sonnet art pass hand-polishes her poses: the legs read thin and the claws are dark on the dark hall.
