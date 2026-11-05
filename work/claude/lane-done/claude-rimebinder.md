STATUS: CODE-ONLY BUILD DONE behind RIME_SHIPS=false - THE RIMEBINDER is wired end to end (kit, shared CHILL, corpses/thralls, 9 actives + 21 passives,
L25-L50 fork pack, pick/store gate, co-op fields, save ids, ult, lab hands). Branch claude/rimebinder (off master 42a1d4cd), pushed. NOT merged, NOT deployed.
NO BROWSER WAS OPENED (release gate running): every page check is OWED (list below).

# RIMEBINDER lane (claude/rimebinder, 11-05)

## Kit summary (src/rimebinder.js, numbers in RIME)
- FREEZE, THEN RAISE. Her frost CHILLS (new shared status, src/chill.js). A weak foe at full chill FREEZES (the existing e.frozen + stagger, so every system that already
  reads a frozen foe reads hers); elites and bosses only CHILL (clock slowed, never frozen - B15; boss chill capped at 0.6 -> clock >= ~0.89).
- A foe that dies chilled (by her) lies as a RIME CORPSE: main.js's own corpse, made still, ~12 s, crust + glint drawn. Bosses/minis/harmless never leave one.
- TAP X = FROST BOLT (flat, 170 px, 0.55 x swordDmg, chill 0.36: three freeze a weak foe; 5 wind; 0.34 s). Point-blank / DOWN / UP / in a dash = the shared staff swing,
  sweep, rising blow, plunge. HOLD X = RIME LANCE on the 3-tier charge: T1 lance (1.5x), T2 PIERCING (1.8x), T3 RIME-MAKER (2.0x, pierces, a kill leaves a corpse even warm).
- C held = ICE WALL (front yellow blows + shots stop, block price x0.8 / x0.3 for shots; RED and bolts go through; rooted). C TAPPED on the beat = RIME PARRY (shared
  riposte via RP.parried): weak attacker FROZEN 1.4 s, elite/boss chilled (never frozen).
- UP+C = RAISE nearest corpse (a third of the bar): a THRALL in the foe's own sprite, ghost-tinted, ~40% hp / 50% blow, 10 s, CAP 2 (a third melts the oldest).
  Blades walk in and strike; shooters (RANGED_T list) stand and loose ice shards. Not a party seat, no body, no parry/stagger - cannot block a boss opening.
- DOWN+C = SHATTER nearest corpse (or own thrall): 44 px burst, 1.2x, chill 0.6, x1.25 on frozen.
- DODGE = MIST STEP (the roll + a frost cloud that chills what stands in it). PLUNGE = FROSTFALL (shared plunge + a chill ring on landing).
- RIME BAR (own meter): +22 a corpse made, +6 a freeze, +5 a shatter; raise 34; FULL + UP+C = THE LONG WINTER (ultRegister): r 110 blizzard, chill to full (weak frozen
  2.5 s), 1.6x, raises up to 2 corpses WHOLE (16 s, 75% blow). Bar does not refill off its own winter.
- 9 actives (L1-L17): HAILSTONE, GRAVE FROST, COLD CALL, FROST NOVA, RIME HARVEST, WINTER SHROUD, THE KEEPING, GLACIER LANCE, THE LONG NIGHT.
  21 passives in 3 branches (THE FROST / THE RAISED / THE WALL), capstones at 22/23/24. Hero perks DEEP WINTER / LONG RIME.
- L25-L50 (src/tech-rimebinder.js, kfork shape): 25 BRITTLE BLOW, 30 fork COLD WARDEN | SLEET, 35 HOARFROST, 40 fork BOUND IN ICE | GRAVE CHARGE, 45 WHITEOUT,
  50 fork THE FROZEN COURT | GLACIATE (capstones). 8 ranked upgrades (all 8 read in the kit). Master gets flatTech (option A each fork) until claude/kfork merges.

## CHILL as a shared status (src/chill.js) - built cleanly for foes to use later
chill(e, amt, by) / tick / clock(e) / chilled(e); weak/elite/boss tiers; freeze immunity 2.5 s after a thaw (no freeze-lock). main.js updateEnemies runs the clock
beside the hasted foe's (faDt door, the other way) and tints chilled foes paler the colder. HERO SIDE ready for the frost foes: chillHero(p, s) / heroTick / heroClock(p)
- NOT wired into any foe or the hero's run yet (the mountain-arc foe lane calls chillHero and multiplies the run by heroClock).

## Wiring checklist
- [x] roster (hero-roster.js HERO_IDS + RIME_SHIPS=false + HOW 'BEAT HER ON THE FROZEN PATH, THEN BUY'), progression.js HERO_IDS/hp 92/HERO_PERKS/TECHNIQUES/UPGRADES
- [x] select: PICK + store tab show her only if RIME_SHIPS or ?dev=1; pick LINES/ROLE/preview/name/SIG; HEROES desc; HERO_LOOP; TBR/TREE_WHO
- [x] kit + distinct resource (RIME BAR, HUD bar with the raise third marked + thrall pips; hudMeter 'UP+C: RAISE'), ultRegister + ultimate.js names
- [x] L1-L24 actives/passives (catalog), CD_MAX, icons (RM_ICONS), skill glyphs, bot-profile skills/reach, ULT_RANGE
- [x] level-up cards L25-L50 (kit hero), skill slots: generic (1 default, 2nd at L30, max 2 - nothing hero-specific to do)
- [x] co-op: every field on the hero or owned by it (thralls/mists/shards carry o); COOP_TAG/HERO_SHORT; heroOf reads p.hero
- [x] save: ids in both HERO_IDS lists; tools/progression.mjs + tech-cards.mjs pass
- [x] per-hero tables: commit, ROLL_COST/LEN, hero-move, jump-feel, finishers, flask-art, riposte (look + art), ability-preview, controls card rows, crouch-hint, audio
      (voice f3 low, swing, steps, parry tone, fanfare, 10 synth SFX)
- [x] bossLab hooks: LAB_REACH 90 (bolt range), DEFLECTS (tap parry), BUSY_C, ULT_BOT, RIME_BOT (raise when affordable + room, else shatter) at both hands sites;
      BK.rm() / BK.rmk() / BK.chillOf(e)
- [ ] trial yard (trialYard('rimebinder')) - not built (yards were retired to retiredYard for others; rec: skip)
- [ ] DASH_STRIKE / DOWN_STRIKE rows - none (falls back to the generic dash cut / plunge; FROSTFALL rides the plunge landing)

## Node results (one at a time, no browser)
- node tools/rimebinder.mjs: PASS 90/90 (chill tiers, freeze, boss/elite never frozen, thaw, bolt/lance/pierce/T3 rime, corpse rules, raise cost/cap 2/melt,
  thrall strikes, shatter, parry freeze vs boss chill, red too strong, wall front-only, ult, mist, FROZEN COURT, HOARFROST, GRAVE CHARGE, BOUND IN ICE, upgrades,
  fork pack shape, 9+21 catalog, ids, RIME_SHIPS false, not a starter)
- tools/progression.mjs PASS, tools/tech-cards.mjs PASS, tools/talents.mjs PASS (293 consumers), tools/keys.mjs PASS; node --check on every src file OK.
- NOT run (open a browser via tools/cdp.mjs): hero-roster, riposte, lab-reach, skill-icons, skill-passives, save-slots, progression-economy, textfit, hero-keys-sheet.

## BROWSER OWED (one at a time after the gate)
1. ?dev=1 pick her: boot, bake (placeholder rig), HUD bar, bolt/lance tiers, wall + parry, corpse glint, raise/shatter, thrall draw (drawTinted of the foe's set), ult.
2. tools/hero-roster.mjs, tools/textfit.mjs (pick card, HEROES desc length, HUD 'UP+C: RAISE', lance tier names, RIME PARRY / THE WALL BREAKS words), hero-keys-sheet,
   skill-icons, riposte.mjs, lab-reach.mjs (LAB_REACH 90 is a ranged stand, like the ranger's).
3. A 6-seed bossLab look (Act I bosses) once the hands are seen raising/shattering - BEFORE any rate is read (BKBOT lesson). No win-rate run was in scope.

## ART OWED (placeholder now)
Her whole rig (baked on the Geomancer's: own body/crown/palette + rmStaffAt staff of frozen bone); own keys rmBolt/rmLance/rmRaise/rmShatter/rmUlt (borrow cast/blast/heavy);
mist-step pose; plunge/up-air own poses; thrall look (now the foe's sprite tinted ice + eyes + crust pixels); corpse crust/glint; ice wall slab; bolt/lance/shard sprites;
9 skill icons; HUD bar art. AUDIO OWED: recorded takes for the 10 synth SFX.

## Balance (expected, not measured)
- Packs: strongest crowd control in the roster (freeze-lock of weak foes through bolts + mist + nova, plus 2 chip thralls ~+0.5 swordDmg/0.9 s each). Watch the Act I trash.
- Bosses: weaker than the ranger/geomancer one-on-one (no corpses from a boss; bolt 0.55x), BUT chill slows a boss's clock up to ~11% (cap 0.6 x slow 0.18) - that
  lengthens every tell. Rec band check first on bosses with adds (corpses) vs without.
- 92 hp (with the Pyromancer 88): frail, the wall is her defence.

## Questions for Daniel (rec first, built as rec)
1. UP+C clash: the brief made UP+C RAISE, the 11-01 rule makes UP+C at a full meter every hero's ultimate. BUILT: UP+C = RAISE below a full bar; at a FULL bar UP+C is
   THE LONG WINTER (which also raises, whole). Alt: ult on DOWN+C at full (shatter loses its slot at full).
2. Do foes attack thralls? BUILT (rec): no - thralls are untargeted chip/distraction (the risen rule: 'a distraction, not an army'); their hp field is kept for later.
   Alt: shooters can hit them (they would soak shots - check B-rules first).
3. Boss chill: BUILT clock >= ~0.89 at cap. Rec keep, read in the band check. Alt: bosses chill only visually (no slow) if the band drifts high.
4. T3 lance = RIME-MAKER (a corpse from a warm kill) - BUILT per the brief's rec. Alt: T3 freezes elites briefly (breaks the 'elites only chill' rule: not rec).
5. Trial yard: rec skip (yards retired); her teaching line rides RM_TEACH ('raise').
6. Forks with effects still OWED in code (data + card only): COLD WARDEN (30 A: thralls stop shots), WHITEOUT (45), GLACIATE (50 B). Built in code: BRITTLE BLOW,
   SLEET, HOARFROST, BOUND IN ICE, GRAVE CHARGE, THE FROZEN COURT, all 8 upgrades. Rec: finish the three with the art pass (they need a browser look).

## Files
src/chill.js (new), src/rimebinder.js (new), src/tech-rimebinder.js (new), tools/rimebinder.mjs (new); edits: src/main.js, chars.js, progression.js,
progression-catalog.js, hero-roster.js, lab.js, audio.js, commit.js, hero-move.js, jump-feel.js, finishers.js, flask-art.js, riposte.js, ability-preview.js,
skill-glyphs.js, controls.js, crouch-hint.js, bot-profile.js, ultimate.js. Filenames checked vs ad-block words (none). No git stash; no PIDs killed.

TIP: the first browser look is ?dev=1 -> pick THE RIMEBINDER -> any Act I road with sprigs: three taps of X freeze one, a fourth kills it -> RIME glint -> UP+C.
