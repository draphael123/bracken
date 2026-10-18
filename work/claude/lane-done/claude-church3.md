# claude/church3 - LIT CHURCH 3: flames in the Deacon + Paladin fights, the Paladin re-pointed to the Paladin 4 kit, UNDEAD PALADIN + UNDEAD PRIEST (Opus, 2026-10-18)

Brief: scratch/brief-church3-1017.md (Daniel 10-17, all recs) + brief-church2.md + brief-crusader2-1016.md item 2. Base: master e0436ee8. Branch claude/church3, port 8736.
Music (brief item 1) was already done by claude/musicchurch (BATCH99), so it isn't part of this lane. Lit Church is ACT IV (src/foe-react.js ACTS), so the boss band is **57-63% with flasks** (the approved rising band). The mini band stays 75-85%.

## WHAT CHANGED

### Shared flame verb (src/flame.js)
`FIGHT` (`beside` 64 px, `scare` 72 px), `carrying(pp)`, `flameBy(players, x, y, r)`, `beside(lampX, foeX)`. All four readers use these: the Deacon, the Paladin, the undead priest and the undead paladin.

### THE DEACON (mini) - two ways (src/deacon.js, deacon-hands.js, lit-church-hands.js, lit-church.js)
- **P2 (THE FLAME END DOWN) DOUSE**: a quiet told move with its own windup and release (the snuffer cap raised over a lamp, then brought down; greybox drawn in deacon-hands). It targets the lit floor lamp in his reach that's nearest you. A blow cuts it ("THE DOUSING IS CUT"). In P2 he stops kindling.
- **Relight a lamp he doused** with a flame and he FALTERS. This reuses the grope's open (ring and timer, x1.8, capped, still), then a told ward. Dousing costs him no light, and your snuffs still starve him, so the two openings sit side by side.
- **The dark crossing raises ghosts**: when all four of his lamps are out, two new crossing grates bring up a haunt every 8 s, at most 1 up at a time. Lit again, the room burns them (the level's rule). The rood-screen wall sconces don't count as lighting the room.
- **Fires**: a new votive stand by the parclose (col 161). His FLAME ARC's patches are fires too (E beside one takes a flame).
- **Bot**: with no flame it goes to a fire (never into the arc), then carries the flame to the doused lamp and presses E. The lab's Deacon branch now presses E.
- **Tune**: hp 1650 -> 1150, sweep 47 -> 36, jab 42 -> 32, arc 15 -> 10 / life 3.2 -> 2.4. Per-hero hp scale `DC.heroHp { knight 1.35, warden 0.85 }`, the same pattern wardgap used, which the coordinator accepted.
- **Baseline drift**: master's own Deacon already measured 5/6 3/6 2/5 (about 59%) in an A/B on a temp master worktree (since removed), so the 83% in the 10-16 tune had already drifted.

### THE PALADIN - re-pointed to the PALADIN 4 kit and the brazier rule (src/paladin-boss.js, paladin-boss-hands.js rewritten)
- **Conviction** (5 pips, the hero's rule) replaces the Light bar. He earns pips when his hammer lands, when his ward turns your blow, when you block his blow, and by PRAYER (x3 at a lit brazier).
- **Spends**, each lighting his **HALLOWED AURA** (walks with him; he hits x1.3 in it, you burn in it):
  - SMITE (1 pip)
  - TWIN SMITE (2)
  - RADIANCE (3), RADIANCE+ (4, from P2: bigger, mends him)
  - SUNFALL (5, the finisher)
- **LIGHT-WARD**: all round (the Paladin 4 ward). On guard it turns blows x0.4 from any side, burns included, and feeds him. Committed, everything lands whole.
- **THE CENTRAL MECHANIC**: the sanctuary has three DARK BRAZIERS and two fires that always burn (a votive stand at the door, the altar fire). **Light a brazier BESIDE HIM** (within 64 px) and he FALTERS: 3.4 s open, x1.7, capped at 15%, still, then a 3 s told ward. Lit far from him it's a light he prays at.
- **Phases**:
  - P2 (Bastion): he SNUFFS lit braziers (told move, a blow stays it), so the dark brazier at his feet is the next one to light, under his hammer. He also takes the SANCTUARY STEP off a dark brazier when a hero with a flame closes in (40%, 3.5 s cooldown).
  - P3 (Earthbreaker): DAWNFALL.
- **Moves, each with its own windup and release frame off the hero's sheet (PAL_POSES 37 rows, PAL_IDX names the falter/hurt rows)**:

| Move | Mark | Phase | Notes |
|---|---|---|---|
| War hammer chain | ! | all | |
| Smite / Twin smite | ! | all | |
| Spear of Light | ! | all | at range; stops at the first hero |
| Heaven's Arc | ! | all | his answer to a hero hanging over his head |
| Radiance / Radiance+ / Sunfall | !! | all | |
| Verdict | !! | P2 new | sigils fall where you stood, three, then the light |
| Dawnfall | !! | P3 new | ring, leap, pillar, quakes, aura lit where he lands |
| Prayer, snuff, ward stance, step | told stances | | |

- **FX**: the hero's own src/holy-fx.js (radiance, sunfall, verdict, sigil, dawn, spear, ward dome). Conviction pips over him are greybox.
- **Gone** from the old fight: aegis by angle, hammer throw, consecrate circle, empower, judgement, holy charge, hammer leap, vigil, rose window.
- **Bot (pbPlan)**:
  - Fetches a flame, carries it to the dark brazier nearest itself (not past him), and waits there.
  - Presses E when he's beside it; steps off a choir stall first.
  - Breaks his prayer, keeps off his hammer and reads every new tell.
- **Layout**: the votive stand sits at col 1 and the altar fire at col 40, out from under the choir stalls. The bots got stranded on a stall top otherwise.
- **Tune**: hp 2100. Per-hero duel scales: `heroHp { knight 1.4, warden 0.72, pyro 1.5 }`, `heroDmg { knight 2.0, pyro 1.35 }`.

### NEW FOES (reusable; src/order-paladin.js, src/undead-priest.js, src/redraw/church3_foes_art.js greybox)

**ORDER PALADIN / UNDEAD PALADIN** (`orderpaladin` / `deadpaladin`): one AI, two skins.
- **Look**: shield-and-mace knight of the order under a divine-shield dome. Living: polished plate, blue tabard. Undead: grey rotted plate, cracked blue dome, glowing eyes.
- **Behaviour**: closes to mace reach. SHIELD BASH (!, a shield turns it). THE GLEAM (!): a white star on his shield before the overhead mace, every 2nd blow and at least every 6 s.
- **Counter**:
  - PARRY the gleamed strike and the shield SHATTERS for 4.5 s (whole damage, staggered 1 s), then a told mend (0.9 s). A plain block breaks nothing.
  - Undead only: a blow struck with a flame in your hand cracks the shield too.
- **Resist**: living shield x0 (the Crusader-family exception, always offering the gleam). Undead cracked x0.4 (B15).
- **Reuse**: living - Waymeet, the church road, Stormhold, Highcrown (not placed: that's the Crusader 2 lane's). Undead - Burial Caverns 3, Buried City, Silk Undercroft, the haunted manor.

**UNDEAD PRIEST** (`deadpriest`):
- **Look**: dead cleric in a rotted chasuble, a bone censer with cold blue smoke.
- **Behaviour**: keeps 96-150 px off you. RAISES a wight (told, 1.4 s; at most 2 of his up, every 12 s). MENDS nearby dead (told, +30%). SNUFFS a lit lamp within 140 px (told pinch). GRAVE BOLT (!, a slow bolt at the chest - jump it or block it).
- **Counter**: bring a FLAME within 72 px and he breaks off any cast and FLEES (2.2 s), casting nothing while it's near. A blow cuts a cast.
- **Reuse**: any undead level. His snuff hook is optional (`X.lights`: the church's lamps today), so in a level with no lamps he just raises, mends and bolts.

**Placed in Lit Church**: ossuary - an undead priest (col 92) and an undead paladin (col 86), plus a sign "THE DEAD PRIEST FEARS A FLAME. PARRY THE DEAD KNIGHT'S GLEAM." Crypt altar - an undead paladin (col 157). Two wights were replaced. A second priest by lamp three was tried and removed for the curve.

**Wiring**: main.js has bestiary cards, short names, COLS, sheets, update/take/frame/contact hooks, and C3X (their world). Every mark is in src/marks.js (BY_HAND/ANSWER/duck; the MARK table was regenerated). Every line is routed in src/hint-lines.js.

## RATES (tools/boss-rates.mjs, practiced, profile human, campaign L26)

| Fight | Flasks (kit) | Dry (human+dry, 6 seeds) | Other heroes (6 seeds, with flasks) | Average length |
|---|---|---|---|---|
| THE PALADIN (12 seeds) | knight 7/12, warden 8/12, pyro 7/12 = **61%** (act IV band 57-63) | 1/6 1/6 1/6 = 17% | ranger 5/6, paladin 4/6 | knight 129 s, warden 193 s, pyro 192 s |
| THE DEACON (12 seeds) | knight 12/12, warden 8/12, pyro 8/12 = **78%** (mini band 75-85) | 6/6 2/6 0/6 = 44% (pyro 0 dry) | ranger 5/5, paladin 3/6 | knight 40 s, warden 70 s, pyro 67 s |

The Paladin's warden and pyro fights run over the 90-150 s target. Mash: boss 0/6, mini 0/6 (re-stamped; docs/mash-bot.json). The level mash was re-stamped too (masher still dies in the church).

## CHECKS (port 8736, one page at a time)
**Green**:
- paladin-boss (rewritten, 170 checks: the kit is the hero's Paladin 4 HG, B16 own windup+release per move, brazier rule, all-round ward >= 0.4, falter/B4/B3, prayer, tiers, sunfall/aura, arc, spear, verdict, dawnfall, the Bastion's snuff + step, the bot, tables)
- lit-church (369; +11 new Deacon two-way checks, 1 replaced: "pole keeps light" -> "douse costs no light")
- church3-foes (NEW, 35)
- tells (MARK --write)
- hint-shown (24 stale paladin lines removed, new ones routed)
- boss-greed, boss-read (Paladin's turned word is now HIS LIGHT-WARD), boss-openings, blow-tags, boss-fight-end (64 fights end on the kill)
- goblin-lint, solid-islands, signs
- textfit bestiary,boss --strict (0 overflow; the 2 OFFSCREEN are flotilla/hurricane, not this lane)
- live probes: priest flees a carried flame; a flame blow shatters the undead shield; raise/bolt work in the crypt; no page errors

**Not run**: the full suite, corpses (the new foes aren't reskins; they die on their own sheets via HAS_HURT), reach-heroes/level-reach (no geometry changed except two sources and two grate ents).

## REDS
1. **level-quality church: curve FAIL** - a level-1 knight takes 14 deaths in 3 runs (act IV wants <= 12) and loses 616% hp (band <= 600). A/B pilot with my crypt foes removed gave 13 deaths, so master's church already sits over the line. The new foes add about 1-3 deaths (pilot noise is +-3). The curve and pilot rows are stamped with the current numbers. For the curve-fix / integ lane.
2. mark-integrity: 1 phantom (undeadmage|markTell). It was already there before this lane and isn't mine.
3. Two of the 12-seed fights hung for 20 min ("Runtime.evaluate did not answer") while the BATCH101 gate shared the PC. Re-run alone, both finished normally (knight s10 won in 101 s), so I count it as load, not a code loop.

## ART LIST (for claude/church3art, sonnet). Everything new here is GREYBOX.
- **THE PALADIN** (body = the hero sheet):
  - His conviction pips over him: greybox squares -> the hero's HUD suns.
  - The light-ward: the hero's dome scaled x1.5 -> a boss-size dome, plus a WARD BROKEN shatter when a brazier breaks it.
  - The three BRAZIERS: today the chantry's relay brazier -> their own sanctuary brazier, dark/lit plus a "breaking" flare of holy fire into him.
  - The votive stand by the door and the ALTAR FIRE at the east end (the altar fire uses the sexton's brazier today).
  - Verdict sigils' red floor ellipse.
  - Dawnfall's ring.
  - A SNUFF pose pair (today the hero's heavy[0]/[2]).
  - A PRAYER-at-a-brazier light rising off the fire.
  - A bestiary card pose (unchanged from church2art).
- **THE DEACON**:
  - DOUSE windup + release folded into his sheet (today a greybox cap-and-pole drawn over him in deacon-hands).
  - A doused-lamp read (a cold blue smoke curl so you know it's HIS to relight).
  - The crossing's two new grates and the votive stand (generic grate/votive art today).
  - The ghosts rising there.
- **ORDER PALADIN / UNDEAD PALADIN** (10 frames each): idle, walk x2, bash windup/release, gleam windup (mace up, star on the shield)/release, shattered, mending, hurt. Plus their divine-shield dome (whole gold / cracked blue), the gleam star, a death/corpse, both bestiary cards.
- **UNDEAD PRIEST** (13 frames): idle, walk x2, bolt windup/release, raise windup/release, mend windup/release, snuff windup/release, flee, hurt. Plus the grave bolt sprite, the cast glow, the risen wight's claw-up, the corpse, the card.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **Paladin's rule**:
   - Built: he falters ONLY when you light a brazier beside him. The old "starve his Light" falter is gone, because the Paladin 4 hero has no Light bar to starve.
   - Rec: keep. One clear, flame-shaped opening.
2. **Light-ward**:
   - Built: all round, the Paladin 4 hero's rule, so "go round him" no longer works. You hit him committed, or break the ward with fire. It also turns his burns x0.4.
   - Rec: keep.
3. **Per-hero duel scales** on both fights (Paladin hp knight 1.4 / warden 0.72 / pyro 1.5, dmg knight 2.0 / pyro 1.35; Deacon hp knight 1.35 / warden 0.85):
   - Built: the scales, following the wardgap lane's accepted pattern. It was the only way to get every hero into band: the shield knight turns every yellow blow and the pyro's fire ignored the ward.
   - Rec: keep, and revisit when the curve-fix lands.
4. **Paladin fight length**: warden and pyro fights average about 190 s, over the 90-150 s target.
   - Rec: a tune lane after art tries a shorter falter ward (3 -> 2 s) and slightly lower hp with more damage.
5. **The Deacon's dark-crossing ghosts**: built at 1 ghost every 8 s. 2 every 5.5 s took the mini to 31%.
   - Rec: keep as is.
6. **Living Order Paladin**: built with a whole shield (x0) that always offers the gleam, but NOT placed.
   - Rec: the Crusader 2 lane places him in Waymeet and on the church road to teach the parry before the Crusader.
7. **Lit Church curve red**: master's church was already over the act-IV deaths line.
   - Rec: the curve-fix lane (C-series) handles church with the act-IV foe pass. I kept my foes light (undead paladin 64 hp, bash 12 / gleam 18; one priest).
