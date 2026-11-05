// src/tech-ranger.js - THE RANGER'S L25-L50 KIT (claude/rangerpack, Daniel 11-04 11:24 + 11-05): three fixed techniques (L25, L35, L45) and three PICK-1-OF-2 forks
// (L30, L40 and the L50 CAPSTONE pair). Pure data (progression.js imports it; the numbers and rules are src/ranger-tech.js, the effects hang off ranger.js / main.js through tech() / upg()).
// Her identity is THE ARROW AND THE EYE: the quiver (a few arrows she must keep), the steady window (let go while the bow is still), the distance bonus, the bow-bash turn (tap C),
// and HUNTER'S FOCUS (filled from sweet-spot hits, spent by UP+C). Both capstones are the one ultimate input (UP+C at a FULL Focus) and reshape/replace THE GREAT ARROW.
// Every number is swordDmg x k (x amul for a skill): k is a multiplier, never a flat hit. Bosses take damage and the resist floor, never a free stagger, a pin or an immunity.
//   input   where the player does it     k  damage multiplier (null: none)     cd / cost  seconds / stamina     teach  the line the unlock banner says
export const RANGER_TECH = {
  25: { id: 'rtrue', name: 'TRUE FLIGHT', input: 'LET GO IN THE STEADY WINDOW', k: null, cd: 0, cost: 0,
    what: 'A STEADY SHOT THAT FINDS ITS MARK COMES HOME TO THE QUIVER AT ONCE AND FEEDS FOCUS',
    teach: 'LET GO IN THE STEADY WINDOW AND HIT: THE ARROW RETURNS TO YOUR QUIVER AT ONCE, NO WALK TO PICK IT UP, AND YOUR FOCUS FILLS A LITTLE' },
  30: { fork: [
    { role: 'defence', trade: 'TURN IT OR SPLIT IT', id: 'rnock', name: 'COUNTER-NOCK', input: 'TAP C ON THE BEAT', k: null, cd: 0, cost: 0,
      what: 'A BLOW TURNED WITH THE BOW-BASH ON THE BEAT GIVES AN ARROW BACK AND FILLS FOCUS',
      teach: 'TURN A YELLOW BLOW WITH THE BOW-BASH ON THE BEAT: AN ARROW FLIES BACK INTO THE QUIVER AND YOUR FOCUS FILLS. A BOSS BLOW PAYS THE SAME: ARROW AND FOCUS, NO STAGGER' },
    { id: 'rsplit', name: 'SPLIT SHOT', input: 'HOLD X, FULL DRAW', role: 'offence', trade: 'TURN IT OR SPLIT IT', k: 0.6, cd: 0, cost: 6,
      what: 'A FULL DRAW LOOSES A SECOND, LIGHTER ARROW A BEAT BEHIND THE FIRST, FROM NO ARROW OF YOURS',
      teach: 'LET GO OF A FULL DRAW AND A SECOND ARROW FOLLOWS THE FIRST A BEAT LATER AT SIX TENTHS THE BLOW. IT COSTS NO ARROW BUT A LITTLE WIND, AND IT IS NOT YOURS TO PICK UP' } ] },
  35: { id: 'rfar', name: 'LONG EYE', input: 'AN ARROW FROM FAR OFF', k: 1.2, cd: 0, cost: 0,
    what: 'AN ARROW THAT FINDS A FOE FROM FAR OFF HITS 20% HARDER AND FEEDS FOCUS, WHERE ONLY THE MIDDLE RANGE DID BEFORE',
    teach: 'THE FAR SHOT NOW COUNTS: AN ARROW LANDING FROM A GOOD WAY OFF HITS 20% HARDER AND FILLS FOCUS LIKE THE SWEET SPOT DOES. UP CLOSE IT IS THE OLD ARROW' },
  40: { fork: [
    { role: 'control', trade: 'PIN THEM OR FLIT', id: 'rbarb', name: 'BARBED VOLLEY', input: 'THE VOLLEY SKILL', k: 1.0, cd: 0, cost: 0,
      what: 'THE VOLLEY\'S ARROWS STAGGER AND MARK THE SMALL FOES THEY STRIKE',
      teach: 'THE VOLLEY\'S ARROWS NOW STAGGER A COMMON FOE AND MARK IT FOR YOUR NEXT SHOTS, ELITE OR NOT. A BOSS OR MINI TAKES THE ARROWS AND NOTHING MORE' },
    { id: 'rpart', name: 'PARTING SHOT', input: 'X IN THE BACKFLIP', role: 'mobility', trade: 'PIN THEM OR FLIT', k: 0.9, cd: 0, cost: 0,
      what: 'THE BACKFLIP GOES A THIRD FURTHER AND THE SHOT LOOSED IN IT IS A REAL ARROW, NOT A TAP',
      teach: 'PRESS X IN THE BACKFLIP: THE FLIP CARRIES A THIRD FURTHER AND THE ARROW YOU LOOSE FROM IT HITS NEARLY AS HARD AS A FULL SHOT, KNOCKING A SMALL FOE BACK A BEAT' } ] },
  45: { id: 'rbreath', name: 'STEADY BREATH', input: 'HOLD X', k: null, cd: 0, cost: 0,
    what: 'THE STEADY WINDOW STAYS OPEN A FIFTH OF A SECOND LONGER AND THE STEADY SHOT FLIES A QUARTER FURTHER',
    teach: 'HOLD X AND LET GO WHILE THE BOW IS STILL: THE WINDOW STAYS OPEN 0.2 SECONDS LONGER NOW, AND THE STEADY SHOT CARRIES A QUARTER FURTHER THROUGH THE LINE' },
  50: { fork: [
    { role: 'far', trade: 'FAR OR WIDE', capstone: true, id: 'rlong', name: 'THE LONG DRAW', input: 'UP+C AT A FULL FOCUS', k: 6.0, cd: 0, cost: 0,
      what: 'THE GREAT ARROW IS DRAWN A BEAT LONGER AND FLIES TWICE AS FAR, PAYING MORE THE FURTHER IT GOES',
      teach: 'UP+C AT A FULL FOCUS: THE GREAT ARROW IS DRAWN 0.2 SECONDS LONGER, FLIES TWICE AS FAR THROUGH EVERYTHING IN ITS LINE, AND PAYS UP TO A THIRD MORE AT THE END OF ITS FLIGHT' },
    { id: 'rstorm', name: 'THE ARROW STORM', input: 'UP+C AT A FULL FOCUS', role: 'wide', trade: 'FAR OR WIDE', capstone: true, k: 0.8, cd: 0, cost: 0,
      what: 'FULL FOCUS IS SPENT ON A SKY OF ARROWS THAT FALLS ACROSS THE GROUND AHEAD OF YOU: A CROWD KILLER, LESS ON ONE BIG FOE',
      teach: 'UP+C AT A FULL FOCUS NOW LOOSES TWELVE ARROWS INTO THE SKY: THEY FALL ACROSS THE GROUND A SHORT WAY AHEAD OF YOU OVER A SECOND AND A HALF, EACH AT EIGHT TENTHS A BLOW. SMALL FOES ARE STAGGERED' } ] },
};
// Upgrades: ranked I / II (II needs I). 'what' is [rank I text, rank II text].
export const RANGER_UPGRADES = [
  { id: 'uquiver', name: 'DEEP QUIVER', what: ['THE QUIVER HOLDS ONE ARROW MORE', 'AND ANOTHER'] },
  { id: 'ufletch', name: 'FAST FLETCH', what: ['ARROWS GROW BACK 15% SOONER', 'AND 30% SOONER'] },
  { id: 'ufocus', name: 'KEEN EYE', what: ['FOCUS FILLS 15% FASTER', 'AND 30% FASTER'] },
  { id: 'ustead', name: 'STILL HAND', what: ['THE STEADY WINDOW STAYS OPEN 0.05 S LONGER', 'AND 0.1 S LONGER'] },
  { id: 'udist', name: 'LONG SIGHT', what: ['THE FAR BONUS PAYS 6% MORE', 'AND 12% MORE'] },
  { id: 'ubash', name: 'BASH DRILL', what: ['THE BOW-BASH COSTS 15% LESS WIND', 'AND 25% LESS'] },
  { id: 'uvolley', name: 'VOLLEY DRILL', what: ['THE VOLLEY IS BACK 15% SOONER', 'AND 30% SOONER'] },
  { id: 'uhead', name: 'SHARP HEADS', what: ['EVERY ARROW HITS 5% HARDER', 'AND 10% HARDER'] },
];
