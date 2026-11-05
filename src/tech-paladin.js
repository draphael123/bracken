// src/tech-paladin.js - THE PALADIN'S L25-L50 KIT (claude/paladinpack, Daniel 11-04 11:24 + 11-05): three fixed techniques (L25, L35, L45) and three PICK-1-OF-2 forks
// (L30, L40 and the L50 CAPSTONE pair). Pure data (progression.js imports it; the numbers and rules are src/paladin-tech.js, the effects hang off main.js through tech() / upg()).
// His identity is CONVICTION: blows landed and blows turned fill five pips, a tap of C spends them, the hallowed aura lights where he spends. Every new blow is swordDmg x k
// (the hammer keeps its shipped flat-by-level damage; HAMMER+ and the homecoming only scale it). The capstones both spend a FULL FIVE PIPS: A is THE LONG NOON (the tap of C that
// is SUNFALL also opens a noon on his own ground), B is HEAVEN'S LANCES (UP+C at five pips: five lances out of the sky on the foes ahead).
// NOT here: the 3rd-hit COMBO FINISHER SMITE (claude/palsmite, claude/palsmite3) is the shared base kit and not a technique. Divine Shield (a slot skill) is untouched.
//   input   where the player does it     k  damage multiplier (null: none)     cd / cost  seconds / stamina     teach  the line the unlock banner says
export const PALADIN_TECH = {
  25: { id: 'ppsteel', name: 'HALLOWED STEEL', input: 'PARRY, THEN X', k: 1.3, cd: 0, cost: 0,
    what: 'A PERFECT GUARD HALLOWS THE MAUL: YOUR NEXT SWING WITHIN THREE SECONDS LANDS A THIRD HARDER, ONCE',
    teach: 'RAISE THE LIGHT-WARD ON THE BEAT AND THE PARRY LEAVES LIGHT ON THE MAUL. SWING WITHIN THREE SECONDS AND THAT BLOW LANDS A THIRD HARDER' },
  30: { fork: [
    { role: 'defence', trade: 'WARD OR BRAND', id: 'ppnova', name: 'WARD NOVA', input: 'HOLD C: EVERY THIRD BLOW TURNED', k: 0.5, cd: 0, cost: 0,
      what: 'EVERY THIRD BLOW THE LIGHT-WARD TURNS BURSTS OUT AS A RING OF LIGHT: SMALL FOES NEAR STAGGER AND TAKE HALF A BLOW',
      teach: 'HOLD THE LIGHT-WARD: THE THIRD BLOW IT TURNS RINGS OUT. SMALL FOES WITHIN ARM AND HAMMER REACH STAGGER AND TAKE HALF A BLOW. A BOSS TAKES THE HALF BLOW AND NOTHING ELSE' },
    { id: 'ppbrand', name: 'BRANDING LIGHT', input: 'SMITE (TAP C, 1-2 PIPS)', role: 'offence', trade: 'WARD OR BRAND', k: 1.25, cd: 0, cost: 0,
      what: 'SMITE AND TWIN SMITE BRAND WHAT THEY STRIKE: YOUR NEXT MAUL BLOW ON IT WITHIN FOUR SECONDS FALLS A QUARTER HARDER',
      teach: 'SMITE A FOE AND IT IS BRANDED FOR FOUR SECONDS. THE NEXT MAUL BLOW ON A BRANDED FOE LANDS A QUARTER HARDER, AND THE BRAND IS SPENT' } ] },
  35: { id: 'pphome', name: 'HAMMER HOMECOMING', input: 'UP+C (3 PIPS)', k: 1.3, cd: 0, cost: 0,
    what: 'THE THROWN HAMMER HITS A THIRD HARDER ON ITS WAY HOME, AND IF IT STRUCK ANYTHING THE CATCH PAYS BACK A PIP',
    teach: 'THE HAMMER YOU THROW HITS 30% HARDER ON THE WAY BACK. CATCH IT AFTER IT STRUCK A FOE AND THE LIGHT RETURNS: ONE PIP OF CONVICTION' },
  40: { fork: [
    { role: 'mobility', trade: 'STEP OR STAND', id: 'ppsun', name: 'SUNSTEP', input: 'DODGE (SANCTUARY STEP)', k: null, cd: 0, cost: 0,
      what: 'THE SANCTUARY STEP IS A QUARTER FASTER AND ITS PATCH OF LIGHT STANDS ONE AND THREE QUARTERS AS LONG',
      teach: 'YOUR SANCTUARY STEP CARRIES YOU A QUARTER FARTHER AND THE PATCH OF LIGHT YOU LEAVE LASTS NEARLY TWICE AS LONG TO SLOW FOES AND MEND A PARTNER' },
    { id: 'ppdawn', name: 'PILLAR UNBOUND', input: 'PLUNGE (DAWNFALL)', role: 'offence', trade: 'STEP OR STAND', k: 0.9, cd: 0, cost: 0,
      what: 'THE PILLAR OF LIGHT THE PLUNGE LANDS IS WIDER AND HITS HALF AGAIN HARDER, AND LIGHTS THE AURA TWICE AS LONG',
      teach: 'THE PLUNGE PILLAR OF LIGHT REACHES FURTHER, STRIKES HALF AGAIN AS HARD AND KEEPS YOUR HALLOWED AURA LIT FOUR SECONDS. A BOSS TAKES THE BLOW, NEVER THE STAGGER' } ] },
  45: { id: 'ppeye', name: 'JUDGE EYE', input: 'HOLD X (VERDICT)', k: null, cd: 0, cost: 0,
    what: 'VERDICT SEES FURTHER AND MARKS SIX FOES, AND A SIGIL THAT LANDS ON A BOSS PAYS BACK A PIP',
    teach: 'HOLD X: THE SIGILS REACH 160 PIXELS AND SIX FOES CAN BE MARKED. THE STRIKE THAT FALLS ON A BOSS OR A BIG FOE RETURNS ONE PIP OF CONVICTION, ONCE A CAST' },
  50: { fork: [
    { role: 'close', trade: 'CLOSE OR FAR', capstone: true, id: 'ppnoon', name: 'THE LONG NOON', input: 'TAP C AT FIVE PIPS', k: 1.25, cd: 0, cost: 0,
      what: 'SUNFALL OPENS A NOON: EIGHT SECONDS ON HIS OWN GROUND, HIS BLOWS A QUARTER HARDER AND THE BLOWS ON HIM A FIFTH LIGHTER',
      teach: 'TAP C AT FIVE PIPS: SUNFALL AS EVER, AND THEN A NOON OF EIGHT SECONDS. YOUR AURA STAYS LIT, YOUR BLOWS LAND A QUARTER HARDER AND BLOWS ON YOU LAND A FIFTH LIGHTER. IT NEVER MAKES YOU UNTOUCHABLE' },
    { id: 'pplance', name: 'HEAVEN LANCES', input: 'UP+C AT FIVE PIPS', role: 'far', trade: 'CLOSE OR FAR', capstone: true, k: 1.5, cd: 0, cost: 0,
      what: 'FIVE PIPS CALL FIVE LANCES OUT OF THE SKY ON THE FOES AHEAD, EACH A BLOW AND A HALF, ONE FOE TAKING THREE AT MOST',
      teach: 'UP+C AT FIVE PIPS: FIVE LANCES OF LIGHT FALL ON THE FOES AHEAD, SPREAD AMONG THEM, EACH A BLOW AND A HALF. NO FOE TAKES MORE THAN THREE. A BOSS TAKES THE BLOWS BUT IS NEVER PINNED. UP+C AT THREE OR FOUR PIPS IS STILL THE HAMMER' } ] },
};
// Upgrades: ranked I / II (II needs I). 8 for the Paladin. 'what' is [rank I text, rank II text].
export const PALADIN_UPGRADES = [
  { id: 'pufaith', name: 'KINDLED FAITH+', what: ['CONVICTION FILLS 10% FASTER', 'AND 20% FASTER'] },
  { id: 'puward', name: 'LIGHT WARD+', what: ['THE LIGHT-WARD COSTS 15% LESS WIND TO HOLD', 'AND 30% LESS'] },
  { id: 'putrue', name: 'TRUE GUARD+', what: ['A PERFECT GUARD PAYS HALF A PIP MORE', 'AND A WHOLE PIP MORE'] },
  { id: 'puhammer', name: 'HAMMER+', what: ['THE THROWN HAMMER HITS 20% HARDER', 'AND 40% HARDER'] },
  { id: 'pusmite', name: 'SMITE+', what: ['SMITE AND TWIN SMITE HIT 15% HARDER', 'AND 30% HARDER'] },
  { id: 'pulong', name: 'LONG AURA', what: ['THE HALLOWED AURA STAYS LIT A SECOND LONGER', 'AND TWO SECONDS LONGER'] },
  { id: 'pustep', name: 'STEP+', what: ['THE PATCH OF LIGHT YOUR STEP LEAVES STANDS 25% LONGER', 'AND 50% LONGER'] },
  { id: 'pucool', name: 'COOL', what: ['YOUR SKILLS WAIT 0.5 S LESS', 'AND 1 S LESS'] },
];
