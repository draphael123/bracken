# THE HARVEST FAIR - brief (L1: brief + greybox + the facing mechanic)

Status: L1 (greybox) approved by Daniel 2026-09-29; L2 (art, sound, real dressing) built on `claude/fair2`. L3 (THE WICKER QUEEN, the boss of the maypole green) built on `claude/fair3`. Design approved by Daniel; this file is the record of what was built and why.

## What it is

A village fair abandoned mid-festival as the sun goes down. It sits on the road inland **between WAYMEET and THE HEXED FIELDS** (the Fields' `needs`
is now `fair`; the fair `needs: 'waymeet'`; INDEX target about 117, smoothing Waymeet 106 -> Fields 128). The light goes section by section from warm
sunset to dusk (lanterns gutter, the music box winds down, the figures multiply: the tints and `duskStart/duskLen` are in the greybox, the rest is L2).
Bunting, stalls, a carousel you ride, haystacks you bounce off, a maypole green with a bonfire at the end.

**THE RULE (C2, F8): DON'T TURN YOUR BACK ON THEM.** Said three ways (C4): the level's rule line and the first signs, the bells that jingle when a player
moves and are silent when it stands, and the mask that glows red at arm's length. Nothing else in the level asks a different question.

## THE FACING MECHANIC (the engine; `src/mummer.js`, reusable by any level)

A hero **looks at** a foe when he is alive, on the same screen (300 px across, 120 px up or down) and his `face` points at its side.

- **THE MUMMER** (masked player: sackcloth, painted wooden mask, cap bells; hp 40, about three blows from a knight). It moves ONLY while no hero looks
  at it. Face it and it freezes where it stands. **A frozen mummer can be hit**: that is the whole answer to it. While it creeps (40 px/s; the hero runs
  92) its bells JINGLE (the audio tell, only while it moves). Within 22 px its mask GLOWS RED for 0.6 s (the visual tell; a `!`-style wind-up, so it plays
  the game's wind-up sound), then it strikes for 14. A look at any time during the glow cancels the strike. It is never faster than a walking hero.
- **THE HOBBY-HORSE** (the elite; a carved horse head on a pole, hp 96): the moment the hero's back is turned it rears for 0.45 s (red eye, a bell; a look
  cancels it), then CHARGES a straight run of 190 px at 230 px/s for 22, **committed even if the hero then turns**. It FREEZES where the charge ends (a
  haystack, a wall, a spike or a pit edge end it early) and will not charge again until it has been looked at once. Jump the charge or bounce over it.
- **THE CAROUSEL** (`L.carousels`): a hero standing on the ride is TURNED ROUND every 5 s (4.5 s on the small one) after a 1.3 s warning (a calliope
  phrase, "THE RIDE TURNS", the canopy bulbs go red) and cannot turn back for 0.5 s (less than the mask's 0.6 s glow, so a turn never lands a blow he could
  not answer). The ride is the twist: the one you were holding frozen is behind you now.
- **CO-OP: a foe is frozen if ANY hero faces it** (a dead or downed hero looks at nothing). It moves, and the horse charges, only when EVERY hero has his
  back to it. Said in the bestiary cards for both.
- Hooks: `src/main.js` `updateMummer` (its hands: gravity, edge/wall check, damage), `updateFair` (the carousel, the lock), `drawFair` (canopy, hay,
  maypole, bonfire), `windingUp` (the tell sound), the frame picks, the bestiary. Art: `src/redraw/fair_art.js` and `src/redraw/fair_world.js` (L2). Proved by
  `tools/harvest-fair.mjs` (pure rule + the level + the page).

## THE ARC (built: `src/harvest-fair.js`; W 672, placed wholly by hand, no garrison sprinkle, an encounter in every section, none of it filler)

| section | columns | beat | the encounter |
|---|---|---|---|
| THE GATE | 0-118 | TEACH | ONE mummer alone on a flat lane, three signs (the rule, "face one and it stops", "listen for the bells / a red mask"). Then a stall-roof hop and a 3-wide spike pit |
| THE STALL STAIR | 118-246 | DEVELOP | a PINCER on a climb: two mummers at the foot that you pass and that come up behind you, one at the top of the 12-tile slope stair where you stop for breath. Kill the front one while the ones behind close, or turn and hold them |
| THE CAROUSEL | 246-374 | TWIST | a 27-wide ride with a mummer at each end; it turns you (warned). The one you froze is behind you |
| THE HAYRICKS | 374-502 | COMBINE | two hobby-horses on the lane and three haystacks (the Sporewood cap bounce) each with 3 tiles of spikes past it: the hay is the way over, and the way out of a charge. Hold jump on the third and the high ledge pays a silver |
| THE LAST ROUND | 502-618 | EXAM | a mummer, a small carousel with a mummer AND a horse on it, a haystack over spikes, another mummer, the door guard |
| THE MAYPOLE GREEN | 622-672 | THE WICKER QUEEN (L3) | a door (the elite hobby-horse holds it), the checkpoint before it, the maypole, the bonfire and its embers, her; the gate at the far end opens when she falls |

Checkpoints: one per section at 8, 124, 252, 380, 508 and the door's at 614 (116-128 apart, none inside the green). Jumps: pits of 3 (the real jump is about
3.2), each with spikes two tiles down (a fall hurts and is jumped out of). Five facing encounters, ten mummers, three horses.

## Foes and the one-new-foe rule (F10)

Two new foes, neither a boss: THE MUMMER and THE HOBBY-HORSE. Both weighed in `src/threat.js`.

## Boss: THE WICKER QUEEN (L3, BUILT on claude/fair3, 2026-09-29)

A tall wicker effigy crowned in wheat, on the maypole green at nightfall. The fight is `src/wicker-queen.js` (pure), her hands are `updateWickerQueen` in
`src/main.js`, her art `src/redraw/wicker_queen.js` (the fair2 style), and `tools/wicker-queen.mjs` proves all of it (in Node and in the page).

- **THE RULE**: she moves ONLY while no hero looks at her (the mummers' facing rule, `src/mummer.js`; co-op: any hero facing her freezes her). Her MAYPOLE
  RIBBONS keep turning while she is frozen. While she moves the wicker creaks (her audio tell, like the mummers' bells).
- **RIBBON LASH** (red `!!`, told 1.0 s): the ribbons fly out from the maypole across the whole green, LOW (jump it) or HIGH (duck it, `src/duck.js`), in a
  mixed order so the height is read, not remembered. Told by the mark and the word over her, a red band drawn across the green at the height it will fly and
  an arrow over each hero, a swish and the calliope's three notes; all drawn over the dark.
- **THE SICKLE** (red `!!`, the mummers' 0.6 s red glow): if she reaches you unseen she lifts it; nothing turns a blow from behind; a LOOK during the glow
  freezes her and cancels it (or outrun it: she is slower than a running hero).
- **THE CROWNING** (no mark, it throws no blow): she lifts her wheat crown and the crowd sends in mummers, one behind the hero and one ahead, never more than
  two of hers alive.
- **THE OPENING, THE BONFIRE** (A11, caused): turn your back to draw her across the green, turn round while she stands on the embers (40 px each side of the
  bonfire) and the look FREEZES HER ON THEM: the wicker catches (0.4 s) and burns open for 2.8 s, a blow worth 1.35x; the rest of the time the wicker takes a
  quarter. Then she is flung back off the embers the way she came and they are BANKED (grey) for 6 s. Crossing them unseen, or frozen short of them, does
  nothing.
- **PHASE 2, FULL DARK** (at 2/3): the bonfire gutters and the green goes black; your look freezes her (and her crowd) only NEAR you - a RADIUS of 96 px on the
  side you face, drawn as the light of your look. She must be let close before she can be frozen on the embers.
- **PHASE 3, ALIGHT** (at 1/3): she catches for good and lights the green: the look reaches across it again, but she creeps half as fast again (88 px/s,
  still under a running hero's 92) and leaves FIRE behind her. The embers still flare her open (2.4 s).
- 640 health (her base; no scaling added). The fair's one relic (the FELTED SOLES) is her reward: it lies hidden in the green and appears where she burns (the
  roof cache over the gate lane that held it pays a purse of coins now). The gate opens after her death and walking to it clears the level (`gateAfterBoss`).
  Music: `houndmaster` ("Boss Fight 2", the benched Hound Master's track, which no live fight plays). In the boss-jump list as `?boss=wickerqueen`.

## Art and sound (L2, BUILT on claude/fair2, 2026-09-29)

L1 was approved by Daniel with all recommendations (keep the carousel's 0.5 s facing lock, the unblockable back strikes, the elite on the door, the look that re-arms the horse). Difficulty: the fair read INDEX 34 against ~117 and no bodies are to be added, so the mummer is weighed 5 and the hobby-horse 6 in `src/threat.js` (the index is now about 43); tuning happens by play. Layout and the facing rule's numbers are unchanged.

- **Foes** (`src/redraw/fair_art.js`, the L1 greybox file renamed): the mummer (patched sackcloth, rope belt, straw, a painted wooden mask with white-ringed eyes and red cheeks, a floppy three-bell cap; frames 0 frozen mid-step, 1-2 creep, 3 GLOW (arms up, the mask burning red, white-hot eyes), 4 strike, 5 hurt) and the hobby-horse (a red and cream skirt over a masked player, a carved horse head on a pole with pegged teeth, a straw mane, brass bells; 0 stand, 1 rear, 2-3 charge, 4 skid, 5 hurt). The glow also lays an additive red halo behind the mask (`FAW.drawGlow`) so it reads against the dusk, and the mark above a windup is lifted clear of the taller art (`e.markH`).
- **The world** (`src/redraw/fair_world.js`, drawn by `drawFair` in src/main.js): baked round haystacks (a squash and a rustle when they throw you), the carousel (a painted skirt over the deck, painted horses going round on brass poles, a scalloped striped canopy with pennants and a flag; it spins faster and the bulbs beat red when it is about to turn you), the lamps (real engine lights that gutter: steady at the gate, more of them out the further along, the last ones before the door guttering), the maypole green (a ribboned pole with a wreath, a ring of trampled flowers, a wicker and marigold arch over the door, a big animated bonfire) and the crowd (dark figures at the edge of the light on a parallax layer, none at the gate and more of them the later it gets). Sections keep L1's tints (sunset to dusk).
- **Furniture**: three silvers (the hayrick ledge, a roof over the stall lane, a hop before the last pit), the relic (the felted soles) on a three-roof stair over the gate's flat lane, three hearts (after the pincer's terrace, after the horses, before the door guard), six shrines (the checkpoints). No NPCs; no quest strays (Waymeet and the Fields have none).
- **Sound**: the cap bells are a shaken cluster of three (the creep cue, only while it moves); the horse's bridle bells on the rear; a haystack rustle; a lantern's flutter. THE MUSIC BOX is a synth tune (`musicBox` in src/audio.js) played over the level's track that winds down section by section (`windAt` in fair_world.js): a note every 0.3 s at the gate, later, flatter and quieter with more missing teeth each section, one note into the quiet by the green. The base track is still `marketday` (Waymeet's neighbour); the level has no track of its own.


## Questions for Daniel

See the lane report (`work/claude/lane-done/claude-fair1.md`).
