// src/tech-bloodknight.js - THE BLOOD KNIGHT'S L25-L50 KIT (claude/bkpack, Daniel 11-04 11:19 + 11:24, brief-l50abilities-1101 sec 6.5, brief-lategame2-1104 sec 3): three fixed techniques
// (L25, L35, L45) and three PICK-1-OF-2 forks (L30, L40, and the L50 CAPSTONE pair). Pure data (progression.js imports it; the numbers and pure rules are in src/bk-tech.js, the effects
// in src/main.js beside the bkrework blood code, read through tech() / upg()). His hero id is 'reaper' (saves, hashes). His identity is "pay in blood, spend the debt": the techniques turn
// DEBT and VITAE into power; NONE adds a heal (the debt reclaim stays the only one; MORTGAGE and PAY IT FORWARD burn debt, PLANT THE BLADE's fast reclaim is capped at 3% of max health).
// bkrework changed three of the brief's premises, and this file follows the build, not the brief:
//   - CRIMSON FRENZY (HOLD F) is gone: RED REQUIEM (UP+C at FULL VITAE, then 8 s of HEMORRHAGE) is his ultimate. BLOOD ECHO therefore rides the HEMORRHAGE window, and the capstones
//     reshape that window (REQUIEM UNBOUND) or replace the cast (THE RECKONING).
//   - the third cut is DEBT DRAIN (the lash) and the blood guard's release is a no-heal nova, so WARD LANCE turns the chip the ward drank into the lance.
//   - the debt caps at 40% of max health (the brief assumed 60%): PAY IT FORWARD's scale is tuned to that.
// Every number is swordDmg x k (src/bk-tech.js dmg(); no flat damage). k below is the multiplier of ONE hit; `par` is the parity sheet tools/bk-tech.mjs reads.
//   input   where the player does it     k  damage multiplier (null: none)     cd / cost  seconds / stamina     teach  the line the card / banner says
export const BK_TECH = {
  25: { id: 'breap', name: 'REAP THE BLEED', input: 'REND (HOLD X, LET GO AT T1) ON A BLEEDING FOE', role: 'offence', k: 1.2, cd: 0, cost: 0,
    what: 'A QUICK HEAVY CUT ON A BLEEDING FOE POPS WHAT IS LEFT OF THE BLEED AT ONCE, AS A BLOW',
    teach: 'LET GO OF X AT THE FIRST TIER ON A FOE THAT IS BLEEDING: THE BLEED IS REAPED, ALL THE REST OF IT AS ONE HARD BLOW. THE MORE BLEED LEFT, THE HARDER' },
  30: { fork: [
    { role: 'control', trade: 'DRAW THEM OR SPEND THE GUARD', id: 'breach', name: 'CRIMSON REACH', input: 'THE THIRD CUT (THE LASH)', k: 0.5, cd: 0, cost: 0,
      what: 'THE LASH IS A LONG WHIP THAT HOOKS UP TO THREE SMALL FOES AND DRAWS THEM INTO A HEAP BEFORE YOU',
      teach: 'THE THIRD CUT NOW LASHES FAR: UP TO THREE FOES IT FINDS ARE HOOKED AND DRAWN IN TO A STEP FROM YOU. THE FAR END OF THE WHIP HITS HALF AS HARD. BOSSES AND THE HEAVY ARE NEVER HOOKED' },
    { role: 'defence', trade: 'DRAW THEM OR SPEND THE GUARD', id: 'blance', name: 'WARD LANCE', input: 'LET GO OF THE BLOOD WARD', k: 0.6, cd: 0, cost: 0,
      what: 'LETTING GO OF THE WARD FIRES A CRIMSON LANCE: THE MORE BLOOD THE GUARD DRANK, THE HARDER IT FLIES',
      teach: 'HOLD C TO GUARD, LET GO: THE NOVA IS JOINED BY A LANCE OF BLOOD THAT FLIES AHEAD THROUGH EVERYTHING IN A LINE. IT HITS WITH THE BLOOD THE GUARD DRANK: AN EMPTY GUARD, A WEAK LANCE' } ] },
  35: { id: 'bplant', name: 'PLANT THE BLADE', input: 'HOLD DOWN+C 0.6 S', role: 'control', k: null, cd: 25, cost: 0,
    what: 'DRIVE THE GREATSWORD INTO THE FLOOR: A BLOOD RITE FOR SIX SECONDS THAT BLEEDS FOES INSIDE AND DRAINS YOUR DEBT TWICE AS FAST',
    teach: 'HOLD DOWN+C: THE GREATSWORD GOES INTO THE FLOOR AND A RED RITE SPREADS ROUND IT FOR SIX SECONDS. FOES IN IT BLEED; STANDING IN IT, YOUR DEBT DRAINS TWICE AS FAST (A LITTLE OF IT COMES BACK AS HEALTH). TAP DOWN+C IS STILL BLOOD PRICE. TWENTY-FIVE SECONDS TO PLANT AGAIN' },
  40: { fork: [
    { role: 'offence', trade: 'BURN IT OR BORROW MORE', id: 'bforward', name: 'PAY IT FORWARD', input: 'UP+C WITH DEBT AT 30% OR MORE', k: 1.76, cd: 14, cost: 0,
      what: 'SPEND ALL YOUR DEBT AS A RED WAVE THAT PIERCES FAR. THE DEBT IS BURNED, NOT HEALED: THE MORE YOU OWE, THE HARDER IT HITS',
      teach: 'OWING AT LEAST A THIRD OF YOUR HEALTH IN DEBT, PRESS UP+C WITHOUT A FULL VITAE BAR: ALL THE DEBT LEAVES YOU AS A WAVE THROUGH EVERYTHING AHEAD. NOTHING COMES BACK. FOURTEEN SECONDS TO CALL IT AGAIN' },
    { role: 'risk', trade: 'BURN IT OR BORROW MORE', id: 'bmort', name: 'MORTGAGE', input: 'DOWN+C TWICE QUICKLY', k: null, cd: 8, cost: 0,
      what: 'PAY BLOOD PRICE A SECOND TIME AT ONCE: MORE DEBT, AND YOUR NEXT THREE BLOWS LAND 40% HARDER. NO HEAL',
      teach: 'TAP DOWN+C, AND AGAIN WITHIN A BREATH: A SECOND VEIN OPENS (A SIXTH OF YOUR HEALTH AS MORE DEBT) AND YOUR NEXT THREE BLOWS LAND 40% HARDER. IT HEALS NOTHING: WIN THE DEBT BACK BY CUTTING. EIGHT SECONDS TO TAKE ANOTHER' } ] },
  45: { id: 'becho', name: 'BLOOD ECHO', input: 'EVERY CUT IN HEMORRHAGE', role: 'offence', k: 0.4, cd: 0, cost: 0,
    what: 'IN THE HEMORRHAGE AFTER A REQUIEM, EACH CUT LEAVES A RED AFTERIMAGE THAT REPEATS IT A BEAT LATER AT 40%',
    teach: 'WHILE A RED REQUIEM\'S HEMORRHAGE RUNS, EACH CUT OF YOURS IS REPEATED A QUARTER SECOND LATER BY A RED AFTERIMAGE, AT 40%. THE ECHO DRINKS NOTHING BACK' },
  50: { fork: [
    { role: 'sustain', trade: 'UNBOUND OR RECKONED', capstone: true, id: 'bunbound', name: 'REQUIEM UNBOUND', input: 'UP+C AT FULL VITAE', k: 0.9, cd: 40, cost: 0,
      what: 'THE REQUIEM\'S HEMORRHAGE LASTS AS LONG AS YOU KEEP LANDING BLOWS (UP TO TWELVE SECONDS) AND ENDS IN A BLOOD NOVA. YOU TAKE A QUARTER MORE THROUGHOUT',
      teach: 'RED REQUIEM NOW FEEDS ON YOU CUTTING: EVERY BLOW ON A BRANDED FOE ADDS FOUR TENTHS OF A SECOND, UP TO TWELVE, AND WHEN IT ENDS A BLOOD NOVA GOES OFF. THROUGHOUT YOU TAKE A QUARTER MORE DAMAGE' },
    { role: 'defence', trade: 'UNBOUND OR RECKONED', capstone: true, id: 'breckon', name: 'THE RECKONING', input: 'UP+C AT FULL VITAE', k: 0.8, cd: 40, cost: 0,
      what: 'EIGHT SECONDS: EVERY BLOW YOU TAKE IS RETURNED TO ITS ATTACKER AS A BLEED, AND THE DEBT DOES NOT DRAIN. IT ENDS BY REPAYING HALF THE DEBT AT ONCE',
      teach: 'UP+C AT FULL VITAE NOW CALLS THE RECKONING INSTEAD OF THE RED REQUIEM: EIGHT SECONDS IN WHICH EACH BLOW THAT FALLS ON YOU BLEEDS ITS ATTACKER FOR A SHARE OF IT, AND YOUR DEBT STAYS ON THE BAR. AT THE END HALF OF IT IS REPAID AS HEALTH (THE OTHER HALF IS BURNED)' } ] },
};
// PARITY SHEET (tools/bk-tech.mjs): dps = k x hits (the most one foe can take from one use) / cycle seconds (the use + what it costs to bring back). The L50 pair deal damage in
// different shapes (A a nova and a longer window of full blows, B a returned bleed); they are compared on the one-foe burst of one use.
export const BK_PAR = {
  bforward: { hits: 1, k: 1.76, cycle: 14 },     // the full 40% debt: 0.8 + 2.4 x 0.4 (a typical 20% debt is 1.28)
  bmort: { hits: 3, k: 0.4, cycle: 8 },          // three blows at +40% = 1.2 sword-hits of extra damage per 8 s, no heal
  bunbound: { hits: 1, k: 0.9, cycle: 40 },      // the nova; the extension is more of the window's own x1.25 HEMORRHAGE blows, counted in the sheet's note
  breckon: { hits: 1, k: 6, cycle: 40 },         // the returned bleed is capped at 6 sword-hits per foe per Reckoning
};
// Upgrades: ranked I / II (II needs I). Eight for the Blood Knight (the brief's ten minus two it could not honour in the rework: KEEN HEAVY (T2 SUNDER on elites is a guard
// rule the foe pass owns) and CRIMSON PARRY+ (the parry's window is the shared 0.22 s of the rework, not a tunable here)). Every one is wired in src/main.js; none is a card that does nothing.
export const BK_UPGRADES = [
  { id: 'ubdrink', name: 'BLADE DRINKS+', what: ['TWO NOTCHES LIFT THE NEXT HEAVY A TIER, NOT THREE', 'AND A NOTCH LASTS 20 S, NOT 12'] },
  { id: 'ulash', name: 'DEEP LASH', what: ['THE LASH BLEEDS 1 S LONGER', 'AND MARKS WHAT IT LANDS ON (YOUR NEXT BLOW HITS IT HARDER)'] },
  { id: 'ugblood', name: 'GUARD BLOOD', what: ['THE BLOOD GUARD DRINKS A FIFTH LESS BLOOD', 'AND A THIRD LESS'] },
  { id: 'udebt', name: 'LONG DEBT', what: ['THE DEBT WAITS 1 S LONGER BEFORE IT DRAINS', 'AND 2 S LONGER'] },
  { id: 'ucres', name: 'WIDE CRESCENT', what: ['THE CRIMSON CRESCENT TRAVELS 20% FURTHER', 'AND 40% FURTHER'] },
  { id: 'uwell', name: 'WELL OF BLOOD', what: ['RED GROUND LASTS 20% LONGER', 'AND 40% LONGER'] },
  { id: 'umail', name: 'THIN BLOOD', what: ['BLOOD MAIL WAITS 15% LESS TO RETURN', 'AND 30% LESS'] },
  { id: 'ulast', name: 'LAST DRINK', what: ['KILLING A BLEEDING FOE REFILLS 10 VITAE', 'AND 20'] },
];
