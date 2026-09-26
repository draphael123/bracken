# THE UNBURIED FIELD - THE DEATH KNIGHT (lane claude/unburied3)

Daniel, 2026-09-25. Five items, built in this order, each pushed when its checks are green. Level `unburied`
(`src/unburied-field.js`), its fights in `src/unburied-foes.js`. This file is the design; a decision that changes is
changed here first.

## 1. Music
The level plays `deathknight` (Night on Bald Mountain, `audio/deathknight.ogg`) from the first frame, and the arena names
the same track. `music.play` of the track already playing returns without touching it (`playFile`: `currentTrack === name`),
so walking into the chapel neither switches nor restarts the music. `unburied` leaves the level; `audio/unburied.ogg` and its
TRACKS row stay (the sound test still lists it).

## 2. Longer: THE BROKEN BRIDGES (a new section, 60 columns, between the tower and the Barrow Rider's barrow)
One sentence: *the old army's bridges over the ravine are broken, and the ridge's archers have the range on every plank.*
- Inserted with `grow()` at column 265 (the tower and everything before it keep their columns; the Rider's room, the chapel and
  the arena move 60 east). The level's own final-column geometry is exported as `UF` from `src/unburied-field.js`.
- THE RAVINE: nine rows deep, 48 wide. Stone PIERS (laid stone, standing on the ravine floor) carry plank spans flush with the
  field; the spans are BROKEN: the gaps are 2 and 3 tiles (S2: at least four of 3, nothing over 3.0). A miss drops you to the
  stream bed: stake rows under the widest gaps, and one way out - the ladder at the west wall, back to the bridgehead.
- THE TOLD VOLLEY (the bridges' own rule): a WHISTLE (arrows in the air), then SHADOWS on the planks where they will land - one
  on you and two either side - and 1.1 s later the arrows. Answers: step out of the shadow (often a jump), get behind COVER (a
  broken mantlet or an overturned cart on a pier), or RAISE A SHIELD (any guard held turns a blow from straight overhead: the
  knight's shield, the paladin's aegis, the reaper's ward, the geomancer's rune-ward, the warden's deflect and the pirate's parry
  on the beat; the pyromancer has cover only).
- Foes to S1, not more bodies: two bone archers on the far bridgehead covering the last gap, and one bone goblin on a pier.
- The broken tower (the grandfathered architecture): the chapel's arch block at 348-350 (now 408-410) hung two rows over the
  road; it comes down onto the nave floor as a two-row fallen block you step over. The timber peg wall at 363 stood over the
  crypt stair's pit on nothing; it goes (three peg walls remain), and its gallery and coins with it. `unburied` leaves the list.

## 3. THE DEATH KNIGHT (boss, `t: 'bloodknight'`)
The playable hero `reaper` as the boss: his own baked kit (`bakeReaper`) drawn at 1.5x and darkened, posed per move.
- THE CLEAVE `!` - slow, over the shoulder and down; a guard turns it. **THE OPENING (A11, caused):** he commits to where you
  stand 0.35 s before it lands; be in its reach when he commits and out of it (or dodging through it) when it lands, and the
  blade goes into the chapel floor and STICKS: he is OPEN 2.0 s at x1.6. Guarded, hit, or never in reach: nothing sticks.
- THE PLANTED BLADE `!!` - he drives the blade in and the ground throws a FAN OF BLOOD BOLTS at you (three; five and wider in
  phase two). Through any guard: stand in a gap of the fan, get close under it, or be up on a tomb ledge.
- THE BLOOD WARD (quiet) - the ward stands up in front of him for 2.4 s: blows on its FACE are stopped. Behind him it is open.
- THE GREATSWORD RUSH `!!` - the blade levelled at a dead run, the length of the room: jump it or get onto a ledge.
- RISE (quiet) - a few of the field's dead get up and join him: two at the wake, two more at phase two (never more than three).
- PHASE TWO (A10), BLOOD SURGE `!!`: at half health the surge rings out of him (get away), and from then on he is FASTER (tells
  x0.75, walk x1.3) and the bolts fan WIDER (five). The sentence: *at half health he surges, and every move comes sooner and
  wider.*
- Arena (A12): the two tomb ledges (G-2) are where the rush and the low bolts miss you.
- The bot (`src/playtest.js`): dodge the Cleave when it commits, then swing at the stuck blade.

## 4. Unlock
The shop's gold route for THE DEATH KNIGHT (800 coins; the silver price stays) opens on `PROG.unburied.dkDown`, set when he
dies - not on clearing the level (`coinNeeds: 'unburied'` stays the level id the shop-gates check reads; `coinBoss: true` asks
for the flag). A save that already owns him keeps him.

## 5. The old boss to THE BENCH
THE FIRST DEATH KNIGHT (the scythe, `t: 'deathknight'`) is renamed THE REAPER and benched (RULES section P): his code, sprite,
marks and bestiary row are kept, and he is placed in no level. Every check that expected him in this level asks for the new boss.
