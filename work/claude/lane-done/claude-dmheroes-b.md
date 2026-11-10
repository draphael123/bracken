# DMHEROES-B - READY for node; browser proofs owed. Branch claude/dmheroes-b off claude/dmcharge ba13dd343. DM.on=false: off = today.

## Rows built (on DMCHARGE's grammar: one step, direction read at release, 33 st, tags ['rise','heavy'] / ['sweep','heavy'], launcher x2.0 / slam x1.6)
- PYROMANCER  UP FIRE PILLAR: geyser box at reach (24-52 px out, 64 tall), launches, +12 heat (gainHeat), flame column fx. DOWN FLOOR FIRE: one-sided 3-tile box (52 px), trips, fires.push x3 (2 s burning ground, own:true), +12 heat.
- GEOMANCER   UP STONE FIST: erupts from her nearest standing stone within 48 px (3 tiles) of her front point (box = that stone's column, ranged launch, stone stays as a step; 'FROM THE STONE'); no stone = at the staff. DOWN SLAB SLIDE: box rides out 10 -> 48 px along the floor (one side), trips; 0.3 s later plants ONE stone where it stopped (walks back toward her over a gap/occupied column; full board plants nothing, evicts nothing; 'STONE PLANTED' / 'SLAB CRUMBLES'). DOWN+C detonate untouched.
- BERSERKER   UP GUT HEAVE (tall box in front, 50 px lunge) / DOWN HAMSTRING CHOP (low box 38 px, 150 px lunge). Both stack REND on every foe struck, frenzy or not (BZK.rend forced via heroCut; the 3rd stack cracks as a heavy). Neutral T3 ground-splitter untouched.
- Code: src/dirmoves.js (DM.heroes table, chargeBox opt {ox}, CHARGE_NAME/MOVE rows, slabLen, geoStoneOrigin, slabStopX, fireLineXs, rendOnCharge, heatOnCharge); src/geomancer.js (stoneXs, plantAtX, fistSpike exported); src/main.js (dmHeroRow in fireCharged, dmHeroTick before updateCharge's early return, attackBox0 passes P.dmOx, heroCut forces rend).

## Tests (node only)
- tools/dirmoves-heroes.mjs NEW: 55 OK (per-hero boxes/names/moves/numbers, mirrored facing, stone origin nearest/behind/range edge, slab growth, a MOCK-API run of the real geomancer.js: plantAtX plants, 3-stone cap holds, stones then feed the fist, gap column walk-back, clear(); source wiring; DM.on false inert).
- dirmoves-charge 28 OK (one check retargeted: pyro is no longer 'generic'; paladin is), dirmoves 58 OK, dirmoves-foes 98 OK, blow-tags ok, answer-tags exit 0, dir-mix 7 misses (acts I-II 0; unchanged from DMCHARGE), node --check main/dirmoves/geomancer/audit-input.

## Owed (RAM: node only tonight)
- audit-input dmClash block (DM.on forced and off) for pyro / geomancer / berserker: needs a headless page - NOT run. It already covers hero charged probes (DMCHARGE ran them CLEAN for these 3 with the generic rows); re-run once the batch156 suite is done to prove the new rows keep the guards.
- Stills + Arena Yard: FIRE PILLAR geyser, FLOOR FIRE line, STONE FIST from a planted stone, SLAB SLIDE + planted stone, GUT HEAVE / CHOP rend ticks. Live probes: a foe launched by the geyser at reach; the slab plant on a real level (blockedAt / gate cells); REND crack count after two charged blows.
- Art: reuses rise/sweep crescents + particles; per-hero charged poses stay with the art lane before the flip.

## Questions (rec first)
1. Geomancer slab on a FULL board: plant nothing (rec, built) or evict the oldest like place() normally does? Evicting would let her cycle stones for free; rec keep no-evict.
2. Pyro +12 heat per charged blow (rec): same order as a heavy; raise only if a charged-heavy loop looks too weak vs her skills.
3. Berserker charged blows stack REND out of frenzy (rec): makes frenzy's mark learnable early; else restrict to frenzy only (one-line change in heroCut).
