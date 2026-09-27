# THE DUNE WORM — the Sunken Caravan's boss (brief, 2026-09-25)

Approved by Daniel as a lane task (claude/duneworm): "build THE DUNE WORM, the Sunken Caravan's boss, in the worm's hollow at the
level's end". This brief is written FROM the desert notes (`.claude/briefs/sunken-caravan.md` "THE DUNE WORM", `docs/desert-arc-brief.md`
row 1, `docs/briefs/sunken-caravan-amendments.md`, `docs/caravan-mechanics.md`) and AMENDS them in three places, each marked
**AMENDED** below with the reason. Everything not amended stands as those notes wrote it.

## Where he lives

THE WORM'S HOLLOW, the last forty columns of THE SUNKEN CARAVAN (A7: forty tiles, entered from the left, I). Today it is built and
empty and the level ends at a gate beyond a sign that says NOT TODAY. With him in it:

| columns (from the hollow's left wall) | what | why |
|---|---|---|
| +2 .. +8 | THE RIM'S OVERHANG (the sandstone lintel, already built) | the one shade he can never take: the level's rule still answerable in there (Daniel, 2026-09-23) |
| +8, +32 | two wagon wrecks | dressing, and shade from the sun (the middle wreck of the greybox goes: the awning stands there now) |
| +12 | THE HOLLOW WINCH | the level's machine again (F5), a second time: strike it and the awning rolls out |
| +14 .. +26 | THE GREAT SHADE: the traders' second awning on two posts, 5 rows up | THE OPENING (below), and shade from the sun while it is out |
| +37 | the level's GATE | shut while he lives; it ends the level after his death (walk to it), as the Falling Tower's gate does |

## THE RULE HE PAYS OFF

The level's one sentence is **THE SUN IS OUT HERE. SHADE IS LIFE.** The level teaches its machine at THE TRADERS' CAMP: strike the
winch and the great awning rolls out over the yard and the yard is shade. His fight is that sentence turned round: **the shade you
roll out is the one place he cannot come up out of.**

## HIS OPENING: THE ROLLED-OUT SHADE (A11, caused, never waited for)

**AMENDED** (was: bait the breach into a wagon WRECK). Daniel asked for the level's awning machine to BE the opening. So:

- Strike THE HOLLOW WINCH: the great shade rolls out over the middle of the hollow (1.2 s, the camp winch's own number).
- Stand under it when the ripple comes for you, and leave the spot LATE (after it commits). He bursts up where he locked - into the
  canvas. It wraps his head: **TANGLED**, blind in the dark cloth, head down, for **2.5 s at double damage.**
- He tears free and **the awning comes down off its rollers** (rolled in): wind it out again before the next ripple. So the machine is
  worked every cycle, and the fight is a loop the player drives: wind, bait, dodge late, cut.
- A breach in the open sand opens nothing: he comes up, shakes the sand off and spits. A breach under a ROLLED-IN awning opens
  nothing. (Proved by `tools/boss-openings.mjs` and `tools/caravan.mjs`: the same breach, awning in, never tangles.)
- Why a breach and not every attack: the breach is his signature, it comes FROM BELOW, and the awning is OVER you. One rule, one
  read: "he comes up under you - make him come up into the shade".

## HIS FOUR TOLD ATTACKS (A1), every one a `...Tell` mode in `windingUp()` (A2), each forced in the harness (A3)

Colour by the shield rule (rule H: a yellow `!` the shield turns it, a red `!!` nothing does).

| move | mark | colour and why | tell (pose, mark, sound) | numbers |
|---|---|---|---|---|
| **THE RIPPLE, then THE BREACH** | `!!` | **red**: a column of sand and teeth from under your feet - a shield faces forward, and nothing faces down | the sand BULGES and runs at you (a moving ripple with the mark over it and a low rumble); it tracks 1.0 s, then COMMITS - it locks where you stand, a dome rises there, and 0.45 s later he bursts up in a column | 30, knocks you up. The ripple is his signature: FIRST in the chain and every other turn (E2) |
| **THE SPIT** | `!` | **yellow**: grit thrown from the front, and a shield takes grit | surfaced, he rears back and his throat lights (the spit-tell frame, a wet gurgle); then a fan of seven clots of sand, landing 35-145 px in front of him: the shield, or behind him | 9 a clot, blockable |
| **THE LUNGE AND DIVE** | `!!` | **red**: his whole weight coming down | he surfaces 140 px off you on the side with room, coils low (the lunge-tell frame, a hiss, 0.7 s) and his SHADOW marks where he will land; he arcs out of the sand across the hollow and back in, and only the head COMING DOWN hurts, onto the shadow | 30. Never lands within 48 px of a wall, so a hero in a corner can always stand clear |
| **THE SWALLOW** | `!!` | **red**: it comes from below | the sand turns in a ring under you (a sinkhole, the mark over it, a sucking hiss), 0.9 s; then it drags you toward the mouth - the level's QUICKSAND verb: jump, and keep jumping. Still in the mouth when it closes and he bites | 32 (the bite) |

THE ORDER: the ripple every other turn (his signature first, E2), and between the ripples the other three in a fresh order each round,
on the world's dice (all three every round, so every attack fires, A3). He stays under 0.25-0.55 s between moves, on the same dice.

He is never touched for more than about two seconds (A5): under the sand at most 0.55 s plus the ripple's 1.45 s is his longest. Every
untouchable stretch is followed by a touchable one of at least a second (A6): he surfaces after every breach, spit, lunge and
swallow. Every timer he has is a number at spawn (A3). Touching him never hurts (the touch rule).

## PHASE TWO (A10): THE STORM, and only in his hollow

**AMENDED** (was: decoy ripples, "the level's gusts", and each wreck he sticks in SMASHED). The arc gave the storm to THE SEALED
PYRAMID and the Skeleton King, and Daniel said: no storm in the level itself. So the storm is HIS - it comes up in the hollow at half
health and nowhere else, and goes when he dies.

**The one sentence a player can say:** *at half he calls the storm into his hollow - the sun goes in, the wind shoves you off your
spot on a counted warning, and every ripple brings a false one.*

- **THE SUN GOES IN.** No sunstroke under the storm. The room changes what it asks: in phase one the shade is life AND the trap; in
  phase two it is only the trap.
- **THE GUSTS**, on the storm's own clock (`src/desert-rules.js` `STORM`: calm 3.2 s, WARN 1.4 s, GUST 1.6 s), concurrent with his
  attacks (DESIGN.md: layers, not a sequence). TOLD: the hollow browns, the sand hisses, a big arrow at the edge of the screen and
  "THE WIND" say which way and when. A gust shoves you along the sand at 100 px/s (the pyramid's storm is 150: this is a hollow, not
  the open desert); **hold block to brace** and it barely moves you. It can carry you out from under your awning as a ripple commits.
  No damage. The view hazes but never hides a ripple or a mark: they are drawn over the storm.
- **THE FALSE RIPPLE**: every ripple brings a decoy running beside it. Only the real one rises at the commit (readable, late).
- The spit, the lunge and the swallow are unchanged, on purpose: the storm is the new question, not a faster rotation.

## Wiring (A8, the twelve points)

Spawn case `duneworm` (a boss), `EHP`/`DMG`/`COLS`, `updateDuneWormBoss` driving the pure machine `src/dune-worm.js`, his own
frames (`bakeDuneWorm` in `src/redraw/desert_foes.js`), `bigF` (drawn by his own draw call), the death case, the corpse case, the
bestiary row, `BEAST_SHORT`, the hurt and death voices (`src/audio.js`), the boss death (he is `boss`, so the fight ends), the boss
bar (it asks the bestiary). Marks by hand in `src/marks.js` (`BY_HAND`), then `node tools/tells.mjs --write`. THREAT 6
(`src/threat.js`). NOT in Boss Rush (parked).

## Music

No desert track exists in `audio/` and nothing is downloaded. **Reuse `boss2.ogg`** (Juhani Junkala's "Level 2", CC0), the track
the greybox already named for the hollow. It is the Goblin Chieftain's too, but the Stockade is a whole act away; `boss3` is the
Winchmaster's, the Deep's and the Drowned King's, and `boss4` is the Archmage's next door at the Mage's Folly. Parked for Daniel
with a recommendation in the lane report.

## Health

1100 (the game scales a boss to the hero; his phase two is half of whatever he was given).

## Balance target

In line with THE FALLING TOWER's boss (the Undead Archmage, measured the same way the same day) and the arc brief (pilot >= 21 runs
at normal health). The house band is 60-75% wins with the median win at 90-150 s. Measured with `BK.bossLab`, dice pinned per row,
salts 1-3, all seven heroes including the Geomancer.
