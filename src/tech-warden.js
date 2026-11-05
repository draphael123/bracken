// src/tech-warden.js - THE WARDEN'S L25-L50 KIT (claude/wardenpack, Daniel 11-04 11:24 + 11-05 12:16): three fixed techniques (L25, L35, L45) and three PICK-1-OF-2 forks
// (L30, L40 and the L50 CAPSTONE pair). Pure data (progression.js imports it; the numbers and rules are src/warden-tech.js, the effects hang off main.js through tech() / upg()).
// Her identity is REACH: the point (X, the last third of the spear pays), the turn (tap C), the throw (hold C) and the REACH BAND (P.vigil, never spent until the
// ultimate). The capstones both spend the band through the one ultimate input (UP+C at a FULL band): A is WARDEN'S REACH made long, B throws the great javelin instead.
// Every number is swordDmg x k x amul (src/warden-tech.js): k is a multiplier, never a flat hit. Bosses take damage and the resist floor, never a free stagger, a pin or an immunity.
//   input   where the player does it     k  damage multiplier (null: none)     cd / cost  seconds / stamina     teach  the line the unlock banner says
export const WARDEN_TECH = {
  25: { id: 'wpoint', name: 'POINTED', input: 'X, THE POINT', k: 1.2, cd: 0, cost: 0,
    what: 'A HIT WITH THE POINT MARKS THE FOE: THE NEXT BLOW ON IT, ANYWHERE ALONG THE SPEAR, LANDS A FIFTH HARDER',
    teach: 'HIT WITH THE LAST THIRD OF THE SPEAR AND THE FOE IS POINTED FOR TWO AND A HALF SECONDS: YOUR NEXT BLOW ON IT LANDS A FIFTH HARDER, EVEN FROM THE SHAFT' },
  30: { fork: [
    { role: 'defence', trade: 'KEEP OFF OR LOOSE', id: 'wkeep', name: 'KEEP-OFF', input: 'TAP C ON THE BEAT', k: null, cd: 0, cost: 0,
      what: 'A BLOW TURNED ON THE BEAT SHOVES THE ONE THAT THREW IT BACK OUT TO THE POINT AND FILLS THE BAND',
      teach: 'TURN A YELLOW BLOW ON THE BEAT: THE ATTACKER IS DRIVEN BACK OUT TO THE POINT AND POINTED, AND THE REACH BAND FILLS A LITTLE. A BOSS GIVES YOU A STEP OF GROUND INSTEAD' },
    { id: 'wtwin', name: 'TWIN JAVELIN', input: 'HOLD C, THE QUICK THROW', role: 'offence', trade: 'KEEP OFF OR LOOSE', k: 0.6, cd: 0, cost: 6,
      what: 'THE QUICK THROW LOOSES A SECOND, LIGHTER SPEAR A BEAT BEHIND THE FIRST',
      teach: 'HOLD C FOR THE QUICK THROW: A SECOND SPEAR FOLLOWS THE FIRST A BEAT LATER AT SIX TENTHS THE BLOW. THE SECOND COSTS A LITTLE MORE WIND' } ] },
  35: { id: 'wfar', name: 'FAR POINT', input: 'HOLD C, THEN THROW FAR', k: 1.3, cd: 0, cost: 0,
    what: 'A JAVELIN THAT STRIKES FROM FAR OFF FLIES FURTHER, HITS 30% HARDER AND FILLS THE REACH BAND',
    teach: 'THROW THE JAVELIN AT A FOE A GOOD WAY OFF: THE SPEAR CARRIES A FIFTH FURTHER, STRIKES 30% HARDER AND FEEDS THE REACH BAND. CLOSE IN IT IS THE OLD THROW' },
  40: { fork: [
    { role: 'control', trade: 'HOLD THE GROUND OR SPRING', id: 'wring', name: 'ROUND ROW', input: 'THE PHALANX SKILL', k: 1.3, cd: 0, cost: 0,
      what: 'THE PHALANX SETS A SHORT ROW BEHIND YOU TOO: NOTHING CLOSES IN ON YOUR BACK',
      teach: 'CALL THE PHALANX AND A SHORT ROW OF POINTS RISES BEHIND YOU AS WELL AS THE LONG ONE AHEAD. WHAT WALKS INTO EITHER IS HIT AND TRIPPED' },
    { id: 'wspring', name: 'SPRING POINT', input: 'THE POLE-VAULT SKILL', role: 'mobility', trade: 'HOLD THE GROUND OR SPRING', k: 0.8, cd: 0, cost: 0,
      what: 'THE POLE-VAULT IS BACK TWICE AS SOON AND ITS LANDING STABS THE WHOLE KNOT, NOT ONE FOE, AND FILLS THE BAND',
      teach: 'THE POLE-VAULT RECHARGES IN HALF THE TIME. WHEN YOU COME DOWN THE POINT FALLS ON EVERY FOE AROUND THE ONE YOU WENT OVER, AND THE LANDING FILLS THE REACH BAND' } ] },
  45: { id: 'wthrough', name: 'RUN THROUGH', input: 'THE THIRD CUT (THE LONG THRUST)', k: 0.6, cd: 0, cost: 0,
    what: 'THE LONG THRUST CARRIES ON PAST THE FOE IT DRIVES: THE ONE BEHIND IT TAKES THE POINT TOO',
    teach: 'THE LONG THRUST NOW KEEPS GOING: THE FIRST FOE IS DRIVEN BACK AS BEFORE AND THE ONE STANDING BEHIND IT TAKES THE POINT AT SIX TENTHS. A LINE OF FOES IS A LINE OF TARGETS' },
  50: { fork: [
    { role: 'close', trade: 'CLOSE OR FAR', capstone: true, id: 'wlongline', name: 'THE LONG LINE', input: 'UP+C AT A FULL BAND', k: 0.8, cd: 0, cost: 0,
      what: 'WARDEN\'S REACH LASTS HALF AGAIN AS LONG, THE SPEAR STRETCHES FURTHER AND THE CLOSING THRUST GOES THE LENGTH OF THE ROOM',
      teach: 'UP+C AT A FULL BAND: THE GHOST SPEAR STANDS NINE SECONDS, NOT SIX, STRETCHED 2.4 TIMES. EACH HIT IS A LITTLE LIGHTER, AND THE CLOSING THRUST IS WIDER AND HEAVIER' },
    { id: 'wgreat', name: 'THE GREAT JAVELIN', input: 'UP+C AT A FULL BAND', role: 'far', trade: 'CLOSE OR FAR', capstone: true, k: 5.0, cd: 0, cost: 0,
      what: 'THE FULL BAND IS SPENT ON ONE THROW: THE GREAT SPEAR FLIES THE ROOM AND BURSTS ON THE FIRST FOE IT MEETS',
      teach: 'UP+C AT A FULL BAND NOW HURLS THE GREAT JAVELIN DOWN THE ROOM: IT STRIKES THE FIRST FOE OR WALL IT MEETS WITH A HEAVY BLOW, AND THE BURST THROWS BACK WHAT STANDS AROUND IT. THE SPEAR COMES HOME AT ONCE' } ] },
};
// Upgrades: ranked I / II (II needs I). 'what' is [rank I text, rank II text].
export const WARDEN_UPGRADES = [
  { id: 'uband', name: 'DEEP BAND', what: ['THE REACH BAND FILLS 20% FASTER', 'AND 40% FASTER'] },
  { id: 'uhaft', name: 'HAFT KEEPER', what: ['THE BAND HOLDS HALF A SECOND LONGER WITH A FOE ON THE SHAFT', 'AND A FULL SECOND'] },
  { id: 'utip', name: 'SWEET POINT', what: ['THE POINT STRIKES 6% HARDER', 'AND 12% HARDER'] },
  { id: 'ushaft', name: 'STEADY SHAFT', what: ['THE DEFLECT COSTS 15% LESS WIND', 'AND 25% LESS'] },
  { id: 'ujav', name: 'JAVELIN+', what: ['THROWN SPEARS HIT 20% HARDER', 'AND 40% HARDER'] },
  { id: 'urow', name: 'ROW DRILL', what: ['THE PHALANX IS BACK 15% SOONER', 'AND 30% SOONER'] },
  { id: 'uvault', name: 'VAULT DRILL', what: ['THE POLE-VAULT IS BACK 15% SOONER', 'AND 30% SOONER'] },
  { id: 'ulong', name: 'LONG THRUST+', what: ['THE LONG THRUST HITS 12% HARDER', 'AND 24% HARDER'] },
];
