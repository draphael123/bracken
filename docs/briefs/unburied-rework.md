# THE UNBURIED FIELD — the rework (lane claude/unburied2)

Approved by Daniel, 24 Sept 2026, as a list; ship-when-green, one commit per item. This file is that list, plus what the
lane decided inside it. It is kept current as the items land: a decision that changes is changed here first.

Level `unburied` (`src/unburied-field.js`, the fight and the battle in `src/unburied-foes.js`); boss `deathknight` = THE
FIRST DEATH KNIGHT; the mini was `standardbearer` = THE STANDARD-BEARER and becomes `barrowrider` = THE BARROW RIDER.

## The list as approved

1. **The ambush is unwinnable** - its elite spawns behind a wall where the hero cannot reach him. Fix the rule, not the
   row: an assertion that every foe an ambush requires you to kill is reachable (the reach model the other checks use),
   proved red on the Unburied Field, every hit elsewhere fixed; then this room made winnable and re-measured against Q.
2. **Remove the Standard-Bearer completely** and put **THE BARROW RIDER** in his place: an undead knight on a ghost horse,
   the old banner for a lance. The ride-through (red, through you, he does not stop), the rearing trample (yellow), the
   grave-fire (yellow, 2-3 slow green bolts), the lance line (red), and phase two: the horse falls apart, he fights on
   foot, the bones crawl back together and he remounts. Every move told, forced in the harness, his own sprite.
3. **The First Death Knight fights with the Death Knight hero's kit**, boss-sized, keeping a phase-two change.
4. **More theming and unique art** as scenery: planted spears and broken shields, a wrecked catapult and a battering ram,
   burial mounds with grave markers, crows that fly up as you pass, low ground mist, tattered banners of two old armies,
   and a trench line you run through (real level shape). Tells and hazards stay readable over the mist.
5. **INDEX** (`tools/curve.mjs`) before and after.

## 1. The ambush (decided and built)

**What was wrong, exactly.** THE SEALED CRYPT (walls 318 and 346) had the chapel's arrow-peg wall standing in the middle of
it: a PALISADE at 330-331 from row 26 to the floor, on solid ground. The wave named a wight "THE CRYPT WARDEN" as its
captain, but a wight is not an ambush leader, so `singleAmbush` made the **husk at 338** the elite - east of the wall - and
the room locks at 321, west of it. A room only opens when its captain is down (Q3). The arrow pegs are on the WEST face
only, every six seconds, so a hero could sometimes climb over, but never back, and the bot opened it in 1 of 6 runs.

**Why no tool saw it.** `src/reachcore.js` only stops a walk at SOLID: it walks through PALISADE (and PORT). So
`tools/unburied.mjs`'s "delete every peg wall and the field is still crossed" passed, and so would any reachability
check - the model never saw the wall at all. The chapel's wall was on the ONLY way on for as long as the level existed.

**The rule, asserted.** `tools/ambush-reach.mjs` (in `npm run check` as `ambush-reach`): every ambush in every level is
shut the way `ambushShut` shuts it, the hero is put where the lock catches him, and the captain must be reachable -
with gates, stake walls and ice as rock. Red on the Unburied Field only; the other twenty rooms pass.
`tools/unburied.mjs` also crosses the field with every stake wall standing as rock and no peg in it (the trebuchet's
breach taken as done, like a laid gun's hole): red at column 329 before, green after.

**The fix.** The peg wall left the crypt for the nave, where it stands over THE CRYPT STAIR (360-367, four rows down and up
again) the way the other peg walls stand over trenches. The crypt is one floor wall to wall; the husk leads it honestly
(the unread wight tag is gone). Measured with `BK.ambushLab`: 1 of 6 heroes opened it before; 6 of 6 after, in
16.4-30.5 s, all inside Q's 15-35 s (`docs/unburied2/ambush-lab.json`).

**Left as a question, not changed:** reachcore walking through PALISADE/PORT is a model bug every reach tool inherits;
fixing it in the model changes a dozen checks' footing at once. See the lane report.

## 2. THE BARROW RIDER (decided)

A knight of the old order buried with his horse; the battle got him up and the horse came with him, as a ghost. The
banner he carried is his lance. He is not the Lancer (a charge the SHIELD stops, then he wheels) and not the Hound
Master (mounted, calls dogs, a yellow charge): the Rider's gallop is RED, goes THROUGH you and does not stop at you.

Mounted (phase one, and whenever he is back in the saddle):
- **THE RIDE-THROUGH `!!`** - he draws back to one wall, the horse paws, then gallops the arena's length; the ghost horse
  passes through you. Jump it or dodge through it. **THE CAUSED OPENING (A11):** strike HIM as he passes under you (a blow
  from the air, or a blow traded for the hit) and he is knocked out of the saddle: the horse runs on, he is on the ground,
  OPEN, until it comes back for him. Left alone the ride ends at the far wall and nothing opens.
- **REARING TRAMPLE `!`** - the horse rears over him and stamps the ground close round it; the shield turns it. It is for
  the hero who stands under him.
- **GRAVE-FIRE `!`** - from the saddle, two (three in phase two) slow green bolts thrown in an arc; the shield turns them.
- **THE LANCE LINE `!!`** - he drives the banner into the ground and spectral lances erupt in a row, one after another,
  toward you along the floor; step out of the line (or be over it).

Phase two (A10), at half health: **THE HORSE FALLS APART** under him. He fights ON FOOT with two moves:
- **THE BANNER THRUST `!`** - a long step and a thrust of the old banner; the shield turns it.
- **THE LANCE LINE `!!`** - the same line, driven from the ground.
After a while the bones crawl back together (**THE REMOUNT**, told: bones crawling across the floor to him - a quiet
windup, it strikes nobody) and he is back in the saddle for three moves before the horse comes apart again. **Break the
remount:** strike the crawling bones and they scatter - he is left OPEN on foot. The one sentence: *from half health his
horse keeps falling apart under him, and while it pulls itself back together you can stop it.*

The room: THE STANDARD (266-294) keeps its walls and gate; two low wreck ledges go in (A12: a jump answers the ride and
the lance line, and the room has ground off its floor). His own sprite: rider and horse per tell, the dismounted frames,
the remount; a sheet and a real-page capture under `docs/unburied2/`.

## 3. THE FIRST DEATH KNIGHT, with the hero's kit (decided)

The playable Death Knight: THE CLEAVE, the PLANTED BLADE, BLOOD WARD and its NOVA (a full ward struck again BREAKS), DEATH
GRIP, BLOOD BOIL, SUMMON SKELETON, GRAVECALL, BLOOD SURGE, THE LONG PASSING (the greatsword rush). The boss keeps his
scythe (the polish lane's silhouette) and fights with those, boss-sized:
- **THE CLEAVE `!`** - over the shoulder and down through what is in front of him: guard it. *(replaces THE SHORT CUT)*
- **DEATH GRIP `!!`** - a chain of runes along the floor; caught, you are dragged to his feet. Jump it. *(the drag of the
  old REAPING)*
- **BLOOD BOIL `!!`** - the ground boils up where you stand and cuts for as long as you stay in it. Step out. *(the ground
  of the old REAPING and the old PASSING's mark)*
- **THE LONG PASSING `!!`** - the hero's rush, boss-sized: he goes through you and a long way past. Jump or dodge it.
  *(was THE PASSING; the mark it left is BLOOD BOIL's job now)*
- **BLOOD WARD, then BLOOD NOVA `!!`** - he sets the scythe and the ward stands up in front of him; blows on its face are
  stopped and FILL it; then he lets go and the nova goes out, harder for every blow it kept. **THE CAUSED OPENING (A11),
  the hero's own rule: a FULL ward struck again BREAKS** - he reels OPEN. *(replaces THE SWATHE, and the Reaping-cuts-his-
  own-dead opening)*
- **SUMMON SKELETON** (quiet) - one of his dead stands up. *(was RAISE, two)*
Phase two (A10, the approved "he is the banner" kept): anything of his that falls in the chapel gets up again unless you
finish it on the floor or his own NOVA cuts it; SUMMON becomes **GRAVECALL** (three at once), and **BLOOD SURGE `!!`** joins
the rotation - the life pulled out of everything near him; get away from him.

## 4. Theming and art (decided as it lands; see the item's commit)

## 5. INDEX (recorded as it lands)

### Item 2 as built (2026-09-24)
- As designed above, plus: standing UNDER him (inside the trample's 42 px) always draws the trample - it is what the trample
  is for, and without it a hero who never came close never saw it (A3 caught this). The grave-fire is aimed to come down at
  chest height 1.5 s later: one where you stand, one a stride past you (and one a stride short in phase two).
- Numbers: 720 health; ride 290 px/s; lance line 8 lances 22 px apart, one every 0.07 s; on foot 7 s before the remount
  (2.2 s tell), two blows on the bones break it; 3 moves in the saddle before the horse comes apart again; open 3.2 s at x1.6.
- Pilot (`tools/unburied-pilot.mjs 4`, normal health, 4 salted passes): **13/24 = 54%**, median win 64.7 s; knight 4/4,
  pyro 4/4, pirate 4/4, reaper 1/4, warden 0/4, paladin 0/4. The fights are deterministic: the salt only changed the
  reaper's rows (`docs/unburied2/rider-pilot.txt`).
- Sheet and real-page shots: `docs/unburied2/rider-*.png`.

### Item 3 as built (2026-09-24)
- **Went, and why:** THE SWATHE (a scythe arc the hero's kit has no version of; its "close in" answer lives on in the
  CLEAVE's short reach), THE REAPING (its drag became DEATH GRIP, its ground BLOOD BOIL), THE SHORT CUT (became THE
  CLEAVE, the guardable blow), THE PASSING's delayed mark (BLOOD BOIL does that job, where you stand). RAISE became SUMMON
  SKELETON (one) and GRAVECALL (three, phase two). The old A11 (the Reaping cutting his own dead) went with the Reaping;
  the new one is the hero's own rule, the ward that breaks. THE PASSING stayed, as THE LONG PASSING: it now cuts (red).
- **Came in:** THE CLEAVE `!`, DEATH GRIP `!!` (and the cleave follows a catch, told again at 0.6 s), BLOOD BOIL `!!`,
  THE LONG PASSING `!!`, BLOOD WARD (quiet) then BLOOD NOVA `!!` (10 + 3 a kept blow), SUMMON SKELETON / GRAVECALL
  (quiet), BLOOD SURGE `!!` (phase two). His own pose for each on the polish lane's sprite (17 frames).
- **Tuned for a boss:** first pass 1/24 (4%) - the cleave did most of it; after lowering the cleave (12), the passing
  (12), the surge (10), the nova's growth (3 a blow) and his health (1150 -> 1000): **13/24 = 54%**, median win 74.6 s
  (warden, pyro, pirate 4/4; reaper 1/4; knight and paladin 0/4). Before the rework: **4/24 = 17%**, knight 4/4 only.
  The dice are pinned and the salt changes almost nothing: these fights are deterministic, so 24 rows are 6 fights x4.
