// src/tech-berserker.js - THE BERSERKER'S L25-L50 KIT (claude/berserkerpack, Daniel 11-04 11:24 + 11-05): three fixed techniques (L25, L35, L45) and three PICK-1-OF-2 forks
// (L30, L40 and the L50 CAPSTONE pair). Pure data (progression.js imports it; the numbers and rules are src/berserker-tech.js, the effects hang off src/berserker.js and main.js through tech() / upg()).
// His identity is RAGE: blows dealt and taken fill it, TAKE IT turns blows into it, FULL, DOWN+C is the FRENZY; UP+C throws the hatchet. The capstones both spend a FULL bar: A is the
// RED TIDE (a longer, harder, riskier frenzy), B is the GREAT AXE (UP+C at a full bar). Every number is swordDmg x k: k is a multiplier here, never a flat hit.
// NOTE: claude/berserkerid carries an older fixed six-technique list (its own src/tech-berserker.js, ids bzcatch...). THIS file replaces it at merge (ids here are bp*; its upgrades are bu*).
//   input   where the player does it     k  damage multiplier (null: none)     cd / cost  seconds / stamina     teach  the line the unlock banner says
export const BERSERKER_TECH = {
  25: { id: 'bpscent', name: 'BLOOD SCENT', input: 'KILL, THEN X', k: 1.2, cd: 0, cost: 0,
    what: 'A KILL OUT OF A FRENZY PAYS 15 RAGE, AND YOUR NEXT CHOP WITHIN THREE SECONDS FALLS A FIFTH HARDER',
    teach: 'EVERY KILL OUTSIDE A FRENZY PAYS 15 RAGE. CUT AGAIN WITHIN THREE SECONDS AND THAT CHOP LANDS A FIFTH HARDER' },
  30: { fork: [
    { role: 'defence', trade: 'ROAR OR RIP', id: 'bproar', name: 'BRACED ROAR', input: 'TAP C ON THE BEAT', k: null, cd: 0, cost: 0,
      what: 'A PERFECT TAKE IT SHOUTS: SMALL FOES NEAR REEL, AND YOU CANNOT BE FLINCHED FOR A SECOND AND A HALF',
      teach: 'PARRY ON THE BEAT: THE AXES RING AND A WAR SHOUT KNOCKS THE SMALL FOES NEAR BACK ON THEIR HEELS. YOU STAND UNFLINCHING FOR 1.5 SECONDS' },
    { id: 'bprend', name: 'OPEN VEINS', input: 'X AT HALF A BAR', role: 'offence', trade: 'ROAR OR RIP', k: null, cd: 0, cost: 0,
      what: 'REND STACKS FROM HALF A BAR OF RAGE, NOT ONLY IN A FRENZY: THE FOURTH BLOW ON ONE FOE CRACKS IT',
      teach: 'WITH HALF A BAR OF RAGE EVERY BLOW ON ONE FOE STACKS A REND, AND THE FOURTH CRACKS ITS ARMOUR LIKE A HEAVY. NO FRENZY NEEDED' } ] },
  35: { id: 'bparm', name: 'AXE ARM', input: 'UP+C', k: 1.3, cd: 0, cost: 0,
    what: 'THE THROWN HATCHET HITS A THIRD HARDER, AND PICKING IT UP PAYS 15 RAGE',
    teach: 'THE HATCHET YOU THROW HITS 30% HARDER. WALK OVER IT OR CALL IT HOME: THE CATCH IS WORTH 15 RAGE' },
  40: { fork: [
    { role: 'mobility', trade: 'BARGE OR BLEED', id: 'bpbull', name: 'BULL BARGE', input: 'DODGE INTO FOES', k: null, cd: 0, cost: 0,
      what: 'THE SHOULDER BARGE SHOVES THE SMALL FOES HALF AGAIN FURTHER AND LEAVES THEM DOWN A SECOND. EACH ONE PAYS 8 RAGE',
      teach: 'THE BARGE SENDS EVERY SMALL FOE IT MEETS HALF AGAIN AS FAR AND KEEPS IT DOWN FOR A SECOND. EACH PAYS 8 RAGE. BOSSES AND BIG ONES STILL STAND' },
    { id: 'bpchain', name: 'CHAINED RAGE', input: 'KILL IN A FRENZY', role: 'offence', trade: 'BARGE OR BLEED', k: null, cd: 0, cost: 0,
      what: 'EVERY KILL IN A FRENZY EXTENDS IT HALF A SECOND, UP TO SIX SECONDS A FRENZY',
      teach: 'EVERY FOE YOU KILL IN A FRENZY ADDS HALF A SECOND TO IT. SIX SECONDS IS THE MOST ONE FRENZY CAN BE STRETCHED' } ] },
  45: { id: 'bpsplit', name: 'SPLINTERING HATCHET', input: 'UP+C AT A CROWD', k: 0.5, cd: 0, cost: 0,
    what: 'THE HATCHET THROWS SPLINTERS OF ITSELF: TWO SMALL FOES NEXT TO THE ONE IT HIT TAKE HALF A BLOW AND ARE KNOCKED DOWN',
    teach: 'THROW THE HATCHET AT A CROWD: UP TO TWO SMALL FOES BESIDE THE ONE IT STRIKES TAKE HALF A BLOW AND FALL. A BOSS IS NEVER SPLINTERED' },
  50: { fork: [
    { role: 'close', trade: 'CLOSE OR FAR', capstone: true, id: 'bptide', name: 'THE RED TIDE', input: 'DOWN+C AT A FULL BAR', k: 1.25, cd: 0, cost: 0,
      what: 'THE FRENZY RUNS TEN SECONDS AND EVERY CHOP FALLS A QUARTER HARDER. YOU TAKE A THIRD MORE, AND REND CRACKS ON THE THIRD BLOW',
      teach: 'DOWN+C AT A FULL BAR IS NOW THE RED TIDE: A TEN SECOND FRENZY, CHOPS A QUARTER HARDER, REND CRACKING ON THE THIRD BLOW. BLOWS ON YOU HURT 35% MORE FOR ITS LENGTH' },
    { id: 'bpgreat', name: 'THE GREAT AXE', input: 'UP+C AT A FULL BAR', role: 'far', trade: 'CLOSE OR FAR', capstone: true, k: 3.0, cd: 0, cost: 0,
      what: 'A FULL BAR HURLS A GREAT AXE DOWN THE ROOM THROUGH EVERY FOE IT MEETS, THEN IT COMES HOME THROUGH THEM AGAIN',
      teach: 'UP+C AT A FULL BAR: THE BAR GOES INTO A GREAT AXE THAT FLIES THE ROOM THROUGH EVERY FOE, THREE BLOWS DEEP, AND RETURNS TO YOUR HAND HITTING ONCE MORE. A BOSS TAKES THE BLOWS BUT IS NEVER PINNED' } ] },
};
// Upgrades: ranked I / II (II needs I). 8 for the Berserker. 'what' is [rank I text, rank II text].
export const BERSERKER_UPGRADES = [
  { id: 'bustoke', name: 'STOKED+', what: ['RAGE FILLS 10% FASTER', 'AND 20% FASTER'] },
  { id: 'butake', name: 'TAKE IT+', what: ['THE PARRY BEAT IS 0.03 S LONGER', 'AND 0.06 S LONGER'] },
  { id: 'busplit', name: 'SPLITTER+', what: ['THE CHOP ON A BROKEN FOE HITS 15% HARDER', 'AND 30% HARDER'] },
  { id: 'bucool', name: 'COOL', what: ['YOUR SKILLS WAIT 0.5 S LESS', 'AND 1 S LESS'] },
  { id: 'buthick', name: 'THICK SKIN+', what: ['A FRENZY TAKES 5 POINTS LESS EXTRA DAMAGE', 'AND 10 POINTS LESS'] },
  { id: 'buaxe', name: 'HATCHET+', what: ['THE THROWN HATCHETS HIT 20% HARDER', 'AND 40% HARDER'] },
  { id: 'buprice', name: 'BLOOD PRICE+', what: ['A FRENZY HEALS A QUARTER MORE PER BLOW', 'AND HALF AGAIN MORE'] },
  { id: 'budrain', name: 'BANKED RAGE', what: ['RAGE DRAINS 20% SLOWER OUT OF A FIGHT', 'AND 40% SLOWER'] },
];
