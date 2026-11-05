// src/tech-freebooter.js - THE FREEBOOTER'S L25-L50 KIT (claude/freebooterpack, Daniel 11-04 11:24 + 11-05): three fixed techniques (L25, L35, L45) and three PICK-1-OF-2 forks
// (L30, L40 and the L50 CAPSTONE pair). Pure data (progression.js imports it; the numbers and rules are src/freebooter-tech.js, the effects hang off main.js through tech() / upg()).
// His identity is the HOOK (tap C catches, hold C throws), the BALL (hold X, the pistol: a mark the cutlass cashes) and PLUNDER (P.plunder, the purse bar, never spent until the ultimate).
// The capstones both spend a FULL purse through the one ultimate input (UP+C at a full purse; a plain C stays the hook catch): A is a seven-second raid, B rolls the great keg.
// Every number is swordDmg x k x amul (src/freebooter-tech.js): k is a multiplier, never a flat hit. Bosses take damage and the resist floor, never a free stagger, a pin or an immunity.
//   input   where the player does it     k  damage multiplier (null: none)     cd / cost  seconds / stamina     teach  the line the unlock banner says
export const FREEBOOTER_TECH = {
  25: { id: 'fsteel', name: 'STEEL AFTER SMOKE', input: 'X AFTER A BALL', k: 1.2, cd: 0, cost: 0,
    what: 'THE FIRST CUT INTO A FOE YOUR BALL MARKED LANDS A FIFTH HARDER STILL, AND PAYS SIX PLUNDER',
    teach: 'SHOOT A FOE, THEN CUT IT: THE FIRST BLOW OF THE CUTLASS INTO THE MARK IS POWDER AND STEEL AND A FIFTH HARDER BESIDES, AND IT SHAKES SIX PLUNDER LOOSE' },
  30: { fork: [
    { role: 'defence', trade: 'SLIP OR HAUL', id: 'fslip', name: 'SLIPKNOT', input: 'TAP C', k: null, cd: 0, cost: 0,
      what: 'THE HOOK CATCH IS BACK A THIRD SOONER AND THE PERFECT BEAT OF IT RUNS A THIRD LONGER',
      teach: 'THE GRAPNEL COMES BACK FASTER: THE NEXT CATCH IS READY IN HALF THE TIME, AND THE FIRST PART OF THE SNAP, THE PERFECT CATCH, RUNS 0.28 S INSTEAD OF 0.2' },
    { id: 'fhaul', name: 'HAUL AND BALL', input: 'HOLD C, THE HOOK THROW', role: 'offence', trade: 'SLIP OR HAUL', k: 0.6, cd: 0, cost: 0,
      what: 'A FOE HAULED IN IS CUT ON THE WAY, MARKED, AND THE NEXT BALL IS INSTANT AND POINT-BLANK',
      teach: 'HOOK A SMALL FOE AND IT IS HAULED IN AND CUT AT SIX TENTHS OF A BLOW. IT IS MARKED FOR THE CUTLASS, AND THE NEXT BALL YOU FIRE IS INSTANT AND POINT-BLANK' } ] },
  35: { id: 'flong', name: 'LONG SHOT', input: 'HOLD X, FIRE AT A FAR FOE', k: 1.3, cd: 0, cost: 0,
    what: 'A BALL THAT STRIKES FROM FAR OFF HITS 30% HARDER AND PAYS TEN PLUNDER',
    teach: 'FIRE THE PISTOL AT A FOE A GOOD WAY OFF: THE BALL STRIKES 30% HARDER AND FEEDS THE PURSE. POINT-BLANK IT IS THE OLD SHOT' },
  40: { fork: [
    { role: 'control', trade: 'SWELL OR SPRING', id: 'ftide', name: 'HIGH TIDE', input: 'THE HEAVY SEAS SKILL', k: null, cd: 0, cost: 0,
      what: 'HEAVY SEAS RUNS FURTHER, LEAVES THE SMALL ON THEIR BACKS LONGER AND SHAKES PLUNDER OUT OF THEM',
      teach: 'THE WAVE REACHES HALF AGAIN AS FAR AND THE SMALL STAY DOWN TWO SECONDS, NOT ONE AND A THIRD. EACH ONE IT KNOCKS OVER LOSES A COIN TO YOUR PURSE, UP TO THREE' },
    { id: 'fquick', name: 'QUICK BOARD', input: 'THE BOARDING SKILL', role: 'mobility', trade: 'SWELL OR SPRING', k: null, cd: 0, cost: 0,
      what: 'BOARDING IS BACK TWICE AS SOON, GOES FURTHER, AND THE FIRST FOE IT CUTS PAYS EIGHT PLUNDER',
      teach: 'THE BOARDING RUSH RECHARGES IN HALF THE TIME AND CARRIES FORTY PIXELS FURTHER. THE FIRST FOE IT CUTS PAYS EIGHT PLUNDER' } ] },
  45: { id: 'fsplinter', name: 'SPLINTER SHOT', input: 'HOLD X, THE PISTOL', k: 0.6, cd: 0, cost: 0,
    what: 'THE BALL SPLINTERS: UP TO THREE FOES NEXT TO THE ONE IT HITS TAKE A SPRAY, STAGGERED',
    teach: 'THE BALL BURSTS ON THE FOE IT HITS: UP TO THREE MORE WITHIN A STEP OF IT TAKE SIX TENTHS OF A BLOW AND ARE STAGGERED. A LONE FOE OR A BOSS TAKES THE BALL AS BEFORE' },
  50: { fork: [
    { role: 'close', trade: 'RAID OR KEG', capstone: true, id: 'fraid', name: 'THE RAIDING HOUR', input: 'UP+C AT A FULL PURSE', k: 1.25, cd: 0, cost: 0,
      what: 'THE PURSE IS SPENT ON SEVEN SECONDS OF RAID: THE CUTLASS LANDS A QUARTER HARDER, THE PISTOL IS ALWAYS LOADED AND EVERY KILL GIVES WIND BACK',
      teach: 'UP+C AT A FULL PURSE: SEVEN SECONDS IN WHICH EVERY CUT LANDS 25% HARDER, THE PISTOL IS SEATED THE MOMENT IT IS SPENT AND A FOE YOU KILL BUYS WIND BACK. TAP C STAYS THE HOOK CATCH' },
    { id: 'fkeg', name: 'THE GREAT KEG', input: 'UP+C AT A FULL PURSE', role: 'far', trade: 'RAID OR KEG', capstone: true, k: 4.0, cd: 0, cost: 0,
      what: 'THE PURSE IS SPENT ON ONE GREAT KEG, ROLLED LIT: IT BLOWS IN TWO SECONDS, OR AT ONCE AND BIGGER IF YOU SHOOT IT',
      teach: 'UP+C AT A FULL PURSE ROLLS THE GREAT KEG DOWN THE DECK. IT BLOWS IN TWO SECONDS WITH A HEAVY BLOW THAT KNOCKS THE SMALL FLAT; SHOOT IT WITH THE PISTOL AND IT GOES AT ONCE, WIDER AND HEAVIER. A BOSS TAKES THE BLOW ONCE' } ] },
};
// Upgrades: ranked I / II (II needs I). 'what' is [rank I text, rank II text].
export const FREEBOOTER_UPGRADES = [
  { id: 'upurse', name: 'FULL PURSE', what: ['THE PURSE FILLS 20% FASTER', 'AND 40% FASTER'] },
  { id: 'ucatchw', name: 'STEADY CATCH', what: ['A PLAIN HOOK CATCH COSTS 15% LESS WIND', 'AND 25% LESS'] },
  { id: 'uball', name: 'HOT BALL', what: ['THE PISTOL BALL HITS 8% HARDER', 'AND 16% HARDER'] },
  { id: 'uload', name: 'QUICK LOAD', what: ['THE PISTOL RELOADS 15% FASTER', 'AND 30% FASTER'] },
  { id: 'uhook', name: 'LONG GRAPNEL', what: ['THE HOOK THROW REACHES 20% FURTHER', 'AND 40% FURTHER'] },
  { id: 'ukeg', name: 'SHORT FUSE', what: ['THE POWDER KEG IS BACK 15% SOONER', 'AND 30% SOONER'] },
  { id: 'ubroad', name: 'BROADSIDE+', what: ['THE BROADSIDE HITS 12% HARDER', 'AND 24% HARDER'] },
  { id: 'ucut', name: 'SHARP STEEL', what: ['THE CUTLASS HITS 6% HARDER', 'AND 12% HARDER'] },
];
