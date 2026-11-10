# traitdata-b - READY (node-checked; dark behind TRAITS_SHIP=false)
Branch claude/traitdata-b off claude/traitframe (f00464b6c). Pyromancer, Freebooter, Blood Knight, Berserker split per passiveplan sec 2.

## Built
- NEW src/traits-b.js: TRAIT_SPLIT_B rows (core/traits/merged/folded/shared/cut/defaults/learnAt/tags/names); traits.js does Object.assign(TRAIT_SPLIT, TRAIT_SPLIT_B) (A's rows never share a line with these). New optional split fields: cut:[] (deliberate cuts; tools/traits.mjs now allows 'cut' only if listed), names:{}, tags:{}; helpers nameOf/tagOf; traitRows/traitUpText/slot header use nameOf.
- Counts (core/traits/merged ids/folded): pyro 5/10/6/2, pirate 5/10/0/4 (+shared swash, cut sunder rollCut paidInGold), reaper 5/10/2/1 (+shared winnow, cut sunder), berserker 5/10/4/2.
- Defaults: pyro emberSkin/heatShield, pirate longBarrel/secondBarrel, reaper deepRed/longPassing, berserker bzHot/bzIronBrace; each arrives L2-L7. All slottables learnAt L2..L18.
- Rename: bzPrice -> RED FEAST (flag on only).
- Rank numbers (RANK I/II/III = 0.70/0.85/1.0 x the ONE number; III = today, flag off = exactly today since trk=1):
  PYRO emberSkin burn time; heatShield cut 25%; brand +50%; emberHeart +50%; wildfire leap range; phoenix revive hp; longFlame reach (+searing time); jetWalk walk pace (slowdown at I/II); updraft fall cap; scatter blast dmg; twin 2nd ember dmg (b.tk); stoke refund+heat; blaze full-heat time; inferno length.
  PIRATE longBarrel reach; powderBurn burn time; looter coin chance; shareOut hp per coin; deadEye x; ransom wind back; pieces bonus coins; runThrough guard strip share; secondBarrel reload time; hotBarrel hot window; longLine reach+dmg; turncoat x; noQuarter plunder.
  REAPER gleaner worm wait; press 3rd worm dmg; secondDeath burst radius; longPassing distance; fullCircle volley dmg; dueRites heart chance; lastRites all five numbers; deepRed heal; coldComfort +25%; gripAll row cap 2/3/all; overflow 2nd nova strength.
  BERSERKER (berserker.js K()/lerp via bzTal.rk, crouch-c.js) bzLong frenzy time (+bzMist), bzBraceLong beat, bzBraceBack knock, bzHot rage fill (+bzBurn coil/whetstone), bzScar, bzWide reach, bzPrice heal, bzIronBrace share of a red blow taken (P.bzHalfK), bzHaft, bzStagger, bzUnbowed rage refill, bzHide, bzSplit x.
- Rankless (documented in tools/traits.mjs): phoenixTrail, skip, pyro sunder, ossuary, graveProvides, bzSpinChop (booleans riding a host); parryCut (shares counterLand with knight COUNTERSTROKE).

## Tests (node only)
tools/traits.mjs extended (rows, defaults by L10, merged rides host, nameOf, every non-exempt id has a trk/K/rk site) ok; talents ok; hero-ledger ok; skill-passives ok; progression ok; coop-progress ok; architecture ok; node --check on all touched files. NOT run: any browser tool (berserker.mjs is a browser tool; started by mistake and stopped, no orphans), check.mjs, boss-rates.

## Owed
1. SHARED lane: swash (pirate) and winnow (reaper) are in `shared`: while the flag is on they are OFF until the airRoll legacy row gets pirate:'swash' and the shared roll/execute paths are hero-agnostic (main.js ~11487 reads tal('airRoll')||tal('swash'); ~9383 reads tal('winnow')).
2. parryCut rank: add c.k in counterCut and `swordDmg() * (c.k ?? 1)` in counterLand after TRAITDATA-A merges (shared function).
3. Row tag display ('NEEDS THE JET' / 'NEEDS BLOODWORMS'): data is in split.tags and traitRows rows carry .tag; the menu lane draws it.
4. Browser verify (later gate): jetWalk pace at rank I/II (damping P.vx by trk^(dt*20) after the rootT line), looter/dueRites random chances, textfit for RED FEAST / tags, worm radius scale.
5. Fork-side names for folded ids ('heat:WHITE HEAT' etc.) are placeholders for the fork lanes.

## Questions (rec first)
1. Rank-I looter/dueRites as a % chance (70/85/100) rather than a size? REC keep (the only per-kill number they have).
2. Pyro heatShield defaults slot 2 learned L6 though today L12: REC keep (default must exist by L20, earlier is harmless).
