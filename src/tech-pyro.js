// src/tech-pyro.js - THE PYROMANCER'S L25-L50 KIT (claude/pyropack, Daniel 11-04 11:24 + 11-05): three fixed techniques (L25, L35, L45) and three PICK-1-OF-2 forks
// (L30, L40 and the L50 CAPSTONE pair). Pure data (progression.js imports it; the numbers and rules are src/pyro-tech.js, the effects hang off main.js's pyro block through tech() / upg()).
// Her identity is HEAT AND THE LIVING BOMB: the heat bar (filled by hits, parries and STOKE), the pips a third of which bursts a foe, the flame ward's parry, the held fireball.
// Both capstones are the one ultimate input (UP+C at a FULL heat bar) and reshape (A) or replace (B) METEOR FALL; the bar empties either way. They are NOT the Little Sun (hold C ~10 s).
// Every number is swordDmg x k (x amul x heat): k is a multiplier, never a flat hit. Bosses take capped damage and the resist floor, never a free stagger, a pin or an immunity.
//   input   where the player does it     k  damage multiplier (null: none)     cd / cost  seconds / stamina     teach  the line the unlock banner says
export const PYRO_TECH = {
  25: { id: 'pkindle', name: 'KINDLING', input: 'A LIVING BOMB GOES OFF', k: null, cd: 0, cost: 0,
    what: 'EVERY FOE THAT BURSTS FROM THE THIRD PIP FEEDS YOUR HEAT BAR, WHERE IT NEVER DID BEFORE',
    teach: 'WHEN A FOE BURSTS FROM ITS THIRD PIP THE FIRE COMES BACK TO YOU: YOUR HEAT FILLS A LITTLE FOR EACH BURST, SO A PACK THAT GOES UP ONE AFTER ANOTHER FEEDS THE BAR' },
  30: { fork: [
    { role: 'defence', trade: 'TURN IT OR TRAIL IT', id: 'pnova', name: 'WARD NOVA', input: 'TAP C ON THE BEAT', k: 0.8, cd: 0, cost: 0,
      what: 'A BLOW TURNED WITH THE FLAME WARD ON THE BEAT BLOWS OUT A RING OF FIRE THAT BURNS AND MARKS THE SMALL FOES AROUND YOU',
      teach: 'TURN A YELLOW BLOW WITH THE WARD ON THE BEAT AND A RING OF FIRE LEAPS OUT AROUND YOU: SMALL FOES IN IT TAKE EIGHT TENTHS A BLOW AND A PIP. A BOSS OR MINI TAKES THE PIP AND NOTHING MORE' },
    { id: 'ptrail', name: 'TRAILING EMBER', input: 'HOLD C, LET GO AT STEP 3+', role: 'offence', trade: 'TURN IT OR TRAIL IT', k: 0.9, cd: 0, cost: 0,
      what: 'A CHARGED FIREBALL IS FOLLOWED A BEAT LATER BY A SMALL FREE EMBER FROM THE SAME STAFF',
      teach: 'LET GO OF A FIREBALL AT STEP THREE OR MORE AND A SMALL EMBER FOLLOWS IT A QUARTER SECOND LATER, AT NINE TENTHS A BLOW, FOR NO STAMINA. IT COUNTS FOR THE ONE-IN-THE-AIR LIMIT' } ] },
  35: { id: 'pwhite', name: 'WHITE HEAT', input: 'A FULL HEAT BAR', k: null, cd: 0, cost: 0,
    what: 'A FULL HEAT BAR HOLDS THREE SECONDS LONGER BEFORE IT STARTS TO FALL',
    teach: 'WHEN THE BAR FILLS IT STAYS FULL THREE SECONDS LONGER: MORE TIME TO FIND THE RIGHT FOES FOR YOUR UP+C, OR TO FIRE BALLS AT FULL HEAT' },
  40: { fork: [
    { role: 'control', trade: 'STUN THEM OR SLIP THEM', id: 'pconc', name: 'CONCUSSIVE BURST', input: 'A LIVING BOMB GOES OFF', k: null, cd: 0, cost: 0,
      what: 'A LIVING BOMB BURST STAGGERS THE COMMON AND ELITE FOES IT BURSTS, A HALF SECOND',
      teach: 'A FOE THAT BURSTS FROM ITS THIRD PIP IS STAGGERED HALF A SECOND, ELITE OR NOT, SO A CHAIN OF BURSTS HOLDS A PACK STILL. A BOSS OR MINI KEEPS ITS OWN EVERY-THIRD-BURST RULE' },
    { id: 'pstep', name: 'PHOENIX STEP', input: 'THE DODGE', role: 'mobility', trade: 'STUN THEM OR SLIP THEM', k: null, cd: 0, cost: 0,
      what: 'YOUR DODGE GOES A QUARTER FURTHER AND LEAVES A WAKE OF FIRE THAT GIVES A PIP TO SMALL FOES YOU PASS',
      teach: 'THE DODGE CARRIES A QUARTER FURTHER AND THE SMALL FOES YOU SLIP PAST CATCH A PIP AND A BURN FROM THE WAKE. A BOSS IS NOT MARKED BY IT' } ] },
  45: { id: 'pfuse', name: 'SLOW FUSE', input: 'LIVING BOMB PIPS', k: null, cd: 0, cost: 0,
    what: 'PIPS STAY ON A FOE TEN SECONDS INSTEAD OF SIX AND EVERY BURST REACHES A LITTLE FURTHER',
    teach: 'THE PIPS ON A FOE BURN FOR TEN SECONDS BEFORE THEY FADE, AND A BURST PASSES ITS FIRE ON TO FOES A LITTLE FURTHER AWAY' },
  50: { fork: [
    { role: 'one', trade: 'ONE STAR OR A SHOWER', capstone: true, id: 'pstar', name: 'STAR FALL', input: 'UP+C AT A FULL HEAT BAR', k: 4.5, cd: 0, cost: 0,
      what: 'METEOR FALL BECOMES ONE GREAT STAR: A SLOWER, WIDER, HARDER FALL ON THE SAME MARK',
      teach: 'UP+C AT A FULL HEAT BAR: THE METEOR IS A GREAT STAR NOW. IT TAKES A BEAT LONGER TO LAND, FALLS ON A MUCH WIDER RING AND HITS ONE AND A HALF TIMES AS HARD. A BOSS TAKES A LITTLE MORE, STILL CAPPED' },
    { id: 'pshower', name: 'METEOR SHOWER', input: 'UP+C AT A FULL HEAT BAR', role: 'many', trade: 'ONE STAR OR A SHOWER', capstone: true, k: 1.0, cd: 0, cost: 0,
      what: 'FULL HEAT IS SPENT ON FIVE SMALL METEORS FALLING ACROSS THE GROUND AHEAD OF YOU: A CROWD KILLER, LESS ON ONE BIG FOE',
      teach: 'UP+C AT A FULL HEAT BAR: FIVE SMALL METEORS FALL ONE AFTER ANOTHER ACROSS THE GROUND AHEAD, EACH LANDING ON A FOE NEAR ITS SPOT, EACH AT A BLOW AND GIVING TWO PIPS. A BOSS TAKES A SMALL CAPPED SHARE FROM EACH THAT FINDS HIM' } ] },
};
// Upgrades: ranked I / II (II needs I). 'what' is [rank I text, rank II text].
export const PYRO_UPGRADES = [
  { id: 'ustoke', name: 'DEEP STOKE', what: ['STOKING FILLS THE BAR 15% FASTER', 'AND 30% FASTER'] },
  { id: 'uparry', name: 'WARD HEAT', what: ['A PARRY GIVES 3 MORE HEAT', 'AND 6 MORE'] },
  { id: 'ucost', name: 'EASY CHARGE', what: ['THE FIREBALL COSTS 10% LESS STAMINA', 'AND 20% LESS'] },
  { id: 'uburn', name: 'LONG BURN', what: ['BURNS LAST 20% LONGER', 'AND 40% LONGER'] },
  { id: 'uheat', name: 'QUICK HEAT', what: ['HITS GIVE 10% MORE HEAT', 'AND 20% MORE'] },
  { id: 'ufire', name: 'HOT FIRE', what: ['YOUR FIRE HITS 5% HARDER', 'AND 10% HARDER'] },
  { id: 'ureach', name: 'WIDE BURST', what: ['A LIVING BOMB BURST REACHES 8 PX FURTHER', 'AND 16 PX FURTHER'] },
  { id: 'ufuel', name: 'BANKED COALS', what: ['THE BAR FALLS 15% SLOWER', 'AND 30% SLOWER'] },
];
