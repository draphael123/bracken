# traitdata-a - READY (node-checked) branch claude/traitdata-a (off claude/traitframe f00464b6c)
Dark behind TRAITS_SHIP=false: flag off is today's game (tools/traits.mjs asserts passiveOn identical for 9 heroes; every rank site is written so trk=1 gives the old number exactly: trm/mulK = 1+(x-1)*k, asserted exact for every x used).

## Tables as built (src/traits.js TRAIT_SPLIT)
- KNIGHT (seed verified, unchanged): core thirdCut parry sunder holdLine bulwark | traits plated vengeance evasion bleed bash bounding flurry unbroken counterstroke endlessSky | folded riposte (block:A) | shared six. Default vengeance/bash. learnAt kept (vengeance 2 ... endlessSky 18, riposte 6).
- WARDEN: core keenPoint wideGuard standFast ringing sendBack | traits vaulter(+longVault) throughAndThrough(+driveHome) giveGround exact widerRow everReady pinTwist freeHand(+airPoint) skirmisher spitted | folded openPoint counterpoise spearhead holdTheLine | retired(CUT) deepSet. Default vaulter/everReady. learnAt vaulter2 tAT4 giveGround5 exact7 widerRow8 everReady10 pinTwist12 freeHand14 spitted16 skirmisher18; folded 6/13/17/18.
- RANGER: core rgDeep rgFletch rgSteady rgFar rgBashLong | traits rgKeen rgLongMark(+rgTrail) rgBashBack rgToothed rgSoftStep rgBodkin rgCover rgKill rgEagle rgLast | folded rgSnares rgHighFlip rgAirDraw rgTwin | CUT rgApex. Default rgKill/rgCover. Defaults arrive early (rgKill 2, rgCover 10), others in today's order (keen 5, longMark 4, bashBack 7, softStep 8, toothed 12, bodkin 14, eagle 16, last 18).
- GEOMANCER: core geoLasting geoReturn geoHardLand geoTall | traits geoRumble(+geoWideQuake) geoAftershock geoShrapnel geoBulwark(card DEEP ROOTS) geoFourth + NEW geoGravel geoLode geoScree geoMoss. Default geoAftershock/geoShrapnel. learnAt aftershock2 rumble4 shrapnel5 gravel7 moss8 lode10 scree12 bulwark14 fourth16.
- Cuts sit in `retired` (framework test refuses an unlisted id). Fork keys on folded rows are provisional strings ('L24:POINTED').
- New mechanisms in traits.js: NEW_TRAITS (not in the catalog, so flag off cannot see them), isNewTrait, traitWord (rename only while the flag is on), rankLack.

## Rank numbers (I 0.70 / II 0.85 / III = today)
knight: PLATED back-cover wind +40/+20/0%; VENGEANCE cap 30*rank; EVASION refund 20*rank; OPEN WOUND bleed 3 s*rank; BULL RUSH extra tiles, stagger x1.6/x2, rush tile all scaled; BOUNDING per-pogo step and cap and refund; FLURRY third-cut cost (1-rank); UNBROKEN hold 1.2 s*rank; COUNTERSTROKE dmg = rank*swing; ENDLESS SKY extra jump height*rank; RIPOSTE x2 bonus scaled.
warden: VAULTER wind 13-7*rank (8/7/6); LONG VAULT 300+80r; T&T +16r; DRIVE HOME 220+160r; GIVE GROUND stagger 0.6r; EXACTNESS rank I commons only; WIDER ROW 5r/90r; EVER READY leftover recovery (1-r); TWIST IT hold x1.5 bonus, bleed 3r, 4th stab from rank II; FREE HAND refund 20r + recovery (1-r); AIR POINT jump only at rank I; SKIRMISHER hurl/stagger*r; SPITTED x1.5 bonus; OPENED/COUNTERPOISE mark 2.5r; SPEARHEAD windup 0.04+0.28(1-r); HEDGE x2.6 bonus.
ranger (rgTal now hands the RANK scale, 0 unworn): keen +25% bonus, long mark +50%, trail mark time, bash-back, toothed, soft step walk, bodkin leaves (1-r) of guard, cover cd 3/r, kill arrows round(2r)+focus 20r, eagle bonus, last arrow x2 bonus, snares life*r, high flip, air draw fall cap, twin 2nd arrow *r.
geomancer (geoTal hands rank): shrapnel shards round(4r); DEEP ROOTS 'deep' result = blow x(1-0.5r); rumble/wide quake bonuses (+ wide quake rock count); AFTERSHOCK now WIRED (it read nothing before): floor time x1.5 bonus, only while flag on; GRAVEL slow 25%*r (main.js updateEnemies stamp), LODESTONE drag TS*r, SCREE ripple 0.4*r sword, MOSSBACK 3 hp/s*r internal (=0.3 shown), cap 3% max hp per stone. Rank-flat on purpose: geoFourth (boolean).
Also: tal() and passiveOn() know NEW traits (flag on only); crouch-a api gets trk/trLack; skill-glyphs rows for the 4 new ids.

## Checks (node only)
traits.mjs (extended: table shape, no id twice, defaults by L10, merged/retired/new traits, DEEP ROOTS, rank-site presence for every ranked id, L24 = core+2 worn, flag-off new traits never on, rank arithmetic exact) ok; talents ok; hero-ledger ok; progression ok; coop-progress ok; architecture ok; node --check on all touched files; crouch-a.mjs ok (flag off). tools/geomancer.mjs was started and killed (browser-weight; owed).
## Owed
Browser: geomancer.mjs + a ranger/warden/knight smoke with ?traits=on; TRAITS tab text fit for DEEP ROOTS and the 4 new rows; boss-rates trait on/off (TRAITTUNE). Merge conflict expected with TRAITDATA-B on the `pyro: null,...` line in traits.js and near trk() in main.js (trm/trLack/trOn helpers are mine; B may reuse them).
## Questions (rec first)
1. MOSSBACK 0.3 read as SHOWN hp (3 internal/s), cap 3% max hp per stone per cast. REC keep; tune lane may raise.
2. geoFourth stays rank-flat. REC yes (a 3.5th stone is meaningless).
3. AFTERSHOCK was dead code; wired behind the flag only. REC yes.
4. Folded fork keys are placeholders until FORKFRAME. REC fine.
5. Knight learnAt kept (vengeance L2 default early). REC yes.
