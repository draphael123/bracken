# claude/bztune - BERSERKER 2 TUNE (Sonnet, 2026-10-12) - off claude/bzart 2310dc6d

## Bot (src/lab.js, before the 'BANKED PYRE' line) - the measure now reflects real play
- FRENZY: at rage >= 100, grounded, no tell/rush, boss within 150: DOWN held + C pressed (edge, not held). Plain C stays TAKE IT (the beat taps).
- POUNCE (COIL, then let go of DOWN with a way held): gap > 110 px, no tell, grounded, st >= 36, 15 s apart. Needed BK.unpress() each coil frame (the stuck-hop press was jumping him out of the duck) and a 38-frame coil (0.3 s min at 100 fps).
- tools/boss-run.mjs prints a `bz {...}` stats block per berserker fight (fr, rend, crack, heal, abs, par, pn).
- Verified in a probe: stockade fight = 2 frenzies (~18 s of 56 s), 21 rends, 3 cracks, 9 pounces / 6 hits (before the pounce was rarer).

## Numbers changed (the berserker's own, src/berserker.js BZ)
- swing.frenzy 1.6 -> 1.5. Nothing else. (rage swing stays 1.38, frenzy takeMul 1.25 / heal 2.5% unchanged.)
- Tried and rejected: takeMul 1.1 + heal 2% (underleaf 4->6 of 12, but tools/berserker.mjs FAILS: it encodes x1.25 and the "never kills himself" floor left him on 3 hp, not 1 - a test I will not weaken; see QUESTIONS); swing.frenzy 1.4 + rage 1.3 (stockade/underleaf/ksar 5/3/7 - too weak, mage unmoved at 12/12).

## RATES (boss-rates --profile=human --flasks=kit, practiced, 12 seeds, campaign level; wins /12)
| boss (L) | knight | berserker | b-k |
|---|---|---|---|
| stockade (3) | 4 | 10 | +6 |
| underleaf (6) | 8 | 4 | -4 |
| reef (17) | 6 | 10 | +4 |
| hanging (8) | 10 | 12 | +2 |
| mage (32) | 7 | 12 | +5 |
| ksar (39) | 10 | 8 | -2 |
| total | 45/72 | 56/72 | +11 (+1.8 a boss) |
- Noise is large (12 seeds, SE ~1.5): earlier runs of the same config gave underleaf 2-6, stockade 8-10, reef 8-10. Overall he is level with the knight (+1.8/boss); per boss he is NOT within 2 on stockade, reef, mage (high) and underleaf (low).
- Why I stopped: the spread is boss-specific, not a global number. Mage is 12/12 at every setting I tried (knight 7/12) - the pounce/frenzy suits the Archmage's room; underleaf is the one he loses (many small hits; frenzy x1.25 and pounce landing). A global nerf pushes underleaf to 25-33% while mage stays 100%. Tuning to the 6 rows would be fitting noise.
- Knight in band on only these (human+kit makes most bosses 100% for him; screen of 20 more at 4 seeds: all 75-100% except scree 1/2, reef 1/4, underleaf 1/4).
- Mash bot: berserker 0/6 (stockade 3x TIMEOUT 0 blows - never reaches the chief, as in earlier lanes; underleaf 3x DEAD 31 s).

## Checks (PORT 8856)
- GREEN: berserker (with takeMul 1.25, final config), riposte, ability-poses 69/69, dances, pixels (46 levels, 2963 sprites), mash 0/6.
- mark-integrity: 1 phantom undeadmage|markTell - the same flaky one base and bzart report; not his.

## QUESTIONS FOR DANIEL (rec first; built as noted)
1. Frenzy takes x1.25 vs x1.1 (and heal 2.5% vs 2%): x1.1 lifts him on the hard fights (underleaf) but tools/berserker.mjs encodes x1.25. Rec: keep x1.25 (BUILT), accept underleaf-type fights being his weak spot; if you want him safer, a lane updates the test with the number.
2. Mage/stockade/reef run +4..+6 over the knight at human+kit (spread, not a mean problem). Rec: leave; Daniel's playtest decides - he is not a boss-breaker on average (+1.8/boss). If a nerf is wanted, the one lever that moved mage is none of swing/heal/take: it is the pounce/rend (REND n 4 -> 5) - untested.
3. Lab-bot pounce is conservative (15 s apart, gap > 110). Rec: keep; a player pounces more but also eats the landing recovery.
