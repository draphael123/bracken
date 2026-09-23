# THE ORE ROAD — the rework

Daniel, 2026-09-23, on the shipped level: *"Too short, really only one mechanic. Riding on lifts is boring. No new
enemies/idea other than riding lifts... The boss is terrible. He's 1) hard to hit due to the platform, 2) does
basically nothing. He needs at least 3-4 attacks... the current format does not work."* And separately: *"the level
has no music either."*

This is the brief. **Nothing here is built yet.** Read it, strike out what you don't want, and I'll build what's left.

---

## 1. What is measurably wrong

`tools/curve.mjs`, the shipped build:

| level | cols | foes | thr/100 | hazard | gap | INDEX |
|---|---|---|---|---|---|---|
| scree | 552 | 76 | 33.3 | 14 | 68 | 113 |
| moor | 996 | 81 | 18.2 | 235 | 73 | 108 |
| crown | 1150 | 116 | 29.2 | 0 | 28 | **120** |
| **oreroad** | **470** | **27** | **13.7** | **0** | **88** | **59** |

- **INDEX 59, walked straight after Highcrown's 120.** A −61 step where the campaign's own rule of thumb allows −8.
  The Scree Path was a problem at −32 and has just been rebuilt for it. This is twice that.
- **27 foes over 470 columns.** Less than half the threat density of every neighbour.
- **Hazard 0.** On a level whose whole premise is a cableway over a gorge. There is nothing to fall into that counts.
- **An 88-column gap** — the longest in the game. That is the ride Daniel calls boring, expressed as a number.
- **Nine foe kinds and exactly ONE of them is new** (the miner). The rest are crows, harpies, heavies: things you
  already fight standing still, placed near a cable.
- **Music is `mineworks`**, one of the two *synthesised* tracks — no audio file, a sparse ~48 BPM pattern. Every
  neighbour has a composed track (stormhold, highcrown, sunspire, theme4, adventure). Next to those it reads as
  silence, which is why Daniel hears none.

## 2. The root problem, stated once

**Riding has no verb.** You board, you wait, you get off. Falling rocks and bats — Daniel's own suggestions — fix this
by giving you something to do *during* the wait, and they should go in. But the deeper fix is to make the ride itself
a decision, so that the level's signature mechanic is something you *do* rather than something you *sit through*.

## 3. The ride becomes a verb

**THE ORE.** Buckets arrive loaded. Dump the ore and the bucket rides high on the cable; keep it and it rides low. One
button, no new art, and it is exactly what a loaded cableway does. Now every span is a decision about what you will
clear and what you will pass under — and the dumped ore falls on whatever is below.

**THE BRAKE.** A bucket you can stop. Moving is progress; stopped is where you can fight. This is what makes bats and
harpies real threats, because dealing with them costs you the thing you were doing.

**THE MINER BECOMES LOAD-BEARING.** He throws his pick and is helpless until he fetches it. On a cableway a pick that
lands in *your* bucket is a weapon you can throw back, and a disarmed miner stranded on a bucket is a passenger you
ride past or knock off. Right now he is an ordinary enemy with a gimmick attached.

**CUT THE CABLE.** A severed line drops everything on it. You use it on a bucket of his crew; he uses it on you.

**WIDER BUCKETS.** `OR.BUCKET.w` is 24 px and the knight is ~10–14 px wide. There is no room to dodge or swing, so no
fight can happen on one. **44–48 px** (about three tiles) is the number. Daniel identified this himself.

## 4. Places

Two new ones, and the ride stretches are broken up rather than lengthened. Target **~28–32 screens** (560–640 cols),
which puts it between the Scree Path and Gale Moor rather than at half their length.

- **THE ORE CHUTE** — you ride a loaded bucket down a chute, steering rather than waiting.
- **THE COLLAPSED SPAN** — the cable is snapped; you climb through the fallen towers. On foot, to break the rhythm.
- **Falling rock over the spans** (Daniel's idea 1) — jump the rocks between lifts.
- **Bats and harpies over the gorge** (Daniel's idea 2) — now that a bucket is wide enough to fight on.

## 5. Targets

| | now | target | why |
|---|---|---|---|
| INDEX | 59 | **112–122** | sit with the crags, after crown's 120 |
| cols | 470 | 560–640 | between scree 552 and moor 996 |
| foes | 27 | ~60–70 | scree has 76 in 552 |
| thr/100 | 13.7 | ~28–32 | crown 29.2, scree 33.3 |
| hazard | 0 | **> 0** | it is a gorge |
| longest gap | 88 | **< 40** | crown's is 28 |
| new foe kinds | 1 | **3** | the miner plus two of the cableway's own |

## 6. The Winchmaster

**The reach problem is real and is horizontal, not vertical.** Standable rows in his arena are 8, 9, 12 and 22, and he
stands at row 8 — only one row above the catwalk. What keeps him away is a **six-tile gap past the last catwalk**, and
the knight's jump crosses about four. So you cannot reach him on foot at all; you depend on a bucket arriving. That is
why he feels untouchable, and it is arithmetic rather than taste.

**Three housings, not one corner.** He cuts his own line and swings to the next, so it is a circuit you chase him
around rather than a man backed into a wall. This is Daniel's "he jumps away, process repeats".

**Four attacks.**
1. **SEND** — loads a bucket and sends it down the line at you.
2. **THE HOOK** — a grapple on a chain that drags you toward the drop.
3. **THE BRAKE BAR** — a close sweep, and the one thing the shield answers. Every boss needs exactly one blockable.
4. **REVERSE** — he throws the great drum into reverse and the whole line runs backwards; you fight the current.

**The opening must be CAUSED, not waited for.** Jam the drum — ride a loaded bucket into it, or cut a cable so the
slack fouls it — and he hangs open. This converts "hard to hit" from a geometry complaint into a puzzle with an
answer, which is the difference between the False Abbot's bell working and not working.

**Three concurrent layers**, which is what makes the phases feel like escalation rather than a treadmill: the line
keeps delivering buckets, he attacks, and the drum's speed ramps each phase. That last one is Daniel's "gets faster as
it goes on".

## 7. Music

`mineworks` is a synth track and `tools/newlevel.mjs` requires a theme no other level uses. Cheapest honest fix: point
it at a composed track that fits the crags. A new one is better but is not something I should choose alone.

## 8. What I am NOT deciding without Daniel

### DECIDED — 2026-09-23/24. Build to these; they are not open any more.

- **THE FULL SECTION 3 GOES IN.** The ore verb, the brake, the load-bearing miner and cutting cables. All four, not
  a subset, and not "only falling rocks + bats".
- **THE WINCHMASTER KEEPS HIS SPRITE AND HIS NAME** and is reworked per section 6. His 13-frame sprite in
  `src/redraw/winchmaster.js` is reused as-is: this is a FIGHT rework, not an art job.
- **THE THREE FOES ARE BUILT AND DANIEL HAS SEEN THEM. APPROVED 2026-09-24.** He was sent all three rendered to
  PNG — ten frames each, hit-flash frames dropped — and said yes. So the two-versus-three question the build opened
  is settled at THREE, and they are no longer unreviewed work:
  | | size | what it is |
  |---|---|---|
  | **THE TIPPLER** | 14x13 | a rockfall with a mind. Threat 2.5, weighed against a rockfall at 2 and a javelineer at 2.5. |
  | **THE SHEARGOB** | 14x15 | takes the floor away: it cuts the line. Threat 3 — less damage than a soldier, but what it costs you is the ground. |
  | **THE GAFFER** | 18x13 | the one foe you cannot walk past. Threat 3.5, a brute's weight, because THE REACH IS THE CREATURE. |
  The gaffer is the widest by 4px and the pole IS the silhouette, which is C1 working: it tells you walking past is
  not an option before you are in range. All three are wired end to end — bakers in chars.js, weights in threat.js,
  tells in marks.js, voices and death/hurt sounds in audio.js.
  **STILL UNVERIFIED: none of them has been FOUGHT.** They pass tells, they have never been played. And Node
  renders lie about light, so anything on them meant to glow has to be looked at in the running game.

- **TWO NEW FOES ARE PRE-APPROVED, AND THEY MUST BE CABLEWAY-NATIVE.** Daniel, 2026-09-24: *"pre-approve the two new
  foes, just keep them cableway-native"*. So they do not need a brief of their own before they are built — but
  "cableway-native" is the whole condition and it is not decoration. A thing that would fight the same way on flat
  ground is not one of them. They must belong to the gorge and the line: something that owns the air over the drop,
  something that uses the buckets, something that answers a question the roster cannot currently ask (F10 says fill
  GAPS, not variety). The miner is the third kind and he already exists; these two are the ones being added.
  **A LEVEL'S OWN BOSS AND MINI CANNOT BE THE ANSWER** — `tools/one-new-foe.mjs` excludes them on purpose, because
  every level has a boss and a check that counts one can never fail. The Winchmaster is not one of the three.

### STILL OPEN — park these, do not guess

- **The music.** `mineworks` is one of the two synthesised tracks, no audio file, a sparse ~48 BPM pattern, and it
  is why Daniel hears none. `tools/newlevel.mjs` requires a theme no other level uses, so it cannot quietly borrow
  a neighbour's. Bring him the options; do not pick.
- **Whether the level stays where it is in the walk order**, given it follows Highcrown's 120.

## 9. Files (from the session that built it)

`src/ore-road.js` (level + cableway: `cableLines` / `makeCableway` / `bucketAt`; `OR.BUCKET.w` is the width),
`src/winchmaster.js` (pure fight, `c` contract), `src/redraw/winchmaster.js` (13-frame sprite), main.js hooks
(`oreBuild` / `updateBucket` / `winchC` / `winchJamWorld` / `updateWinchBoss`, search "THE ORE ROAD"), and the
`winchmaster` block in `src/lab.js`.

Tests: `tools/ore-road.mjs` (Node), `tools/ore-ride.mjs` (page — **keep every line's end 0.75 of a tile inside its
deck** or fast lines drop riders), `tools/winchmaster-pilot.mjs`. Trace before piloting: the bot needed seven pilots
and never converged. A held density pass sits in `work/claude/oreroad-density-HELD.patch`.

## 10. DECIDED BY DANIEL, 2026-09-23 (appended here, not in §8, so it cannot collide with claude/integ's §8 edit)

- **THE REWORK PROPOSAL AS WRITTEN IS APPROVED**, the Winchmaster section (§6) included. Build to it.
- **MUSIC: A NEW TRACK.** Not `mineworks` (a sparse synth track that plays as silence) and not a reused library
  track. Owned by the integrator, not lane A: lane A leaves `L.music` alone until the track lands.
- **WALK ORDER: UNCHANGED.** He answered every other question and did not ask for this one to move, so the level
  stays between STORMHOLD and HIGHCROWN. Re-ask only if the measured INDEX makes the slot indefensible.
