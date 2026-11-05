# THE DEMON HUNTER - kit design (claude/demonhunter, 11-05, code-only lane)

Source of truth: Daniel's 10-01 interview (scratch/arc-mountain-demon.md): DUAL BLADES + DASH; the dash passes THROUGH foes and cuts them
(i-frames on the pass); chained hits build FURY, spent on a finisher; bonus vs demons/corrupted; guard = a short BACKSTEP. Unlock: the knights'
hidden temple off THE DEMON CITY (demon act level 4), demons vs knights, the hunter is its boss; then bought (coins). Reflect-kit row
(claude/reflectkit): his power return = THE DASH ON THE BEAT (an i-frame pass through the bolt). House rules: tap C = the guard; UP+C at a full
meter = the ultimate; skill damage = swordDmg x k.

## Identity: "HE MARKS THEM AS HE PASSES, THEN HE COLLECTS."
His resource lives on the FOES, not only on him - nobody else's does:
- **BRANDS** (silver, on a foe): placed by the DASH-THROUGH (every foe he passes), the third blade cut, the backstep SLIP. 6 s (a demon 9 s).
  A brand is not a damage mark (that is the Ranger's quarry mark): it is what feeds FURY and what his finishers TARGET. On a DEMON it bites (x1.3).
- **FURY** (on him, 0..10 pips): a TEMPO chain, not a rage bar. +1 a blade/dash hit, +2 on a branded foe. It KEEPS only 1.6 s between hits,
  then bleeds a pip every 0.25 s; a blow on him HALVES it. (Berserker's rage fills from blows taken and drains slowly out of a fight; the
  Knight's 3 links are a guard chain. Fury is fast hands on marked targets.)
Overlap check (11 heroes + Desert Priest + Rimebinder): no other hero stores a resource on foes that a finisher then collects; no other hero's
dash is an attack that passes through; the backstep guard is the Warden's back-step SHAPE but his is a parry on the beat, hers is spacing.

## Verbs (built)
| input | verb | rule |
|---|---|---|
| X x3 | THE BLADES | quick light cuts (commit 0.072); the third = THE SCISSOR, x1.35, brands, +1 fury |
| hold X | the shared heavy | the cross-cut (no special code) |
| dodge | THE HUNTER'S DASH | a short fast dash THROUGH foes (roll grace = i-frames), cuts each foe passed k 0.6 and BRANDS it. In its first 0.2 s a bolt it passes through is a POWER return (boltHome), later ones pass harmlessly. |
| dash+X | THE THROUGH-CUT | DASH_STRIKE.demonhunter |
| tap C | THE BACKSTEP | a short hop back. On the beat of a YELLOW blow from the front = THE SLIP, his parry (RP.parried): the striker branded, +2 fury. Off the beat: spacing only. Red = TOO STRONG. |
| DOWN+C | BANISH | 5 fury: the nearest BRANDED foe in 6 tiles. A small DEMON under 40% is banished (gone); anything else k 1.5 (demon x1.5), brand spent. A boss: k 1.5 only - never removed, never stunned. |
| UP+C full | THE RECKONING (ult) | 10 fury: he blinks to each branded foe on screen in turn (max 6, i-frames), a cut each k 2.0 (demon x1.5), brands spent; a boss once at k 2.5. No brands: one cut on the nearest. |
Demons/corrupted: x1.15 always, x1.3 branded. Tag hook = `e.demon || e.corrupted || e.dkSkin === 'demon' || /demon|fiend|infernal|corrupt|^(fire|venom)?imp$/` (the demon act tags its foes `demon: true`).

## Ladder (L1-L25), level-up perks, L25-50
- 10 actives on the starters' levels (1 SILVER KNIVES, 3 CHAIN HOOK, 4 HOLY OIL, 5 OVER THE HORNS, 7 BLADE STORM, 9 WARDING SIGIL, 12 HUNTER'S CALL,
  14 SILVER RAIN, 17 THE CHASE, 20 THE SENTENCE) + 21 passives in THE BLADES / THE BRAND / THE CHASE, capstones 22/23/24.
- Hero perks: HOT BLOOD (fury keeps longer), DEEP SILVER (brands last longer).
- L25 SILVER WAKE; L30 fork REND THE BRAND (offence) / SILVER CHAINS (control) "TEAR IT OR BIND IT"; L35 THE LONG HUNT; L40 fork BLINK BACK
  (mobility) / SILVER WARD (defence) "GO THROUGH OR STAND OFF"; L45 FURY SURGE; L50 capstones THE CULLING (close) / THE SILVER STORM (far)
  "CUT THEM DOWN OR RAIN ON THEM". 8 upgrades. Flat fallback (each fork's A) until claude/kfork merges.

## Alternatives (not built)
1. hold C = a SILVER CHAIN (pull small / pulled to big) as a base verb - rec: no, it is the L3 active; hold C stays free (fewer inputs).
2. Fury as a plain rage-style bar from any blow - rec: no (Berserker overlap); brands keep him distinct.
3. Backstep with i-frames - rec: no; the dash is his i-frame verb, the backstep is timing (Daniel: "a short backstep").
4. Unlock for silver only (no boss) - rec: no, Daniel's 10-01: beat him in the temple, then buy.
