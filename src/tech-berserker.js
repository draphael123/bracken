// src/tech-berserker.js - THE BERSERKER'S L25-L50 KIT (claude/berserkerid, Daniel 10-31 18:07 + 11-01): six fixed techniques, one per tech level, and
// eight ranked upgrades (I then II). Pure data (progression.js imports it; main.js / berserker.js read the numbers through tech() / upg()).
// brief-l50abilities-1101.md sec 7.3, rewritten for the identity pass (brief-heroidentity-1101.md sec 2.8): the wind-up COMMIT replaces the tier ladder
// (so GROUND-SPLITTER+ became WIND-UP+), the AoEs cost stamina, and LAST STAND is his ONE "do not die" card. Every number is swordDmg x k x amul (the
// late-game law): k is the multiplier here, never a flat hit. The Berserker's dodge stays his BARGE (the one damaging dodge); none of these touch a dodge.
//   input   where the player does it     k  damage multiplier (or null)     cd / cost  seconds / stamina     teach  the one line the unlock banner says
export const BERSERKER_TECH = {
  25: { id: 'bzcatch', name: 'AXE CATCH', input: 'UP+C AS THE HATCHET COMES BACK', k: 0.8, cd: 0, cost: 0,
    what: 'CATCH THE RETURNING HATCHET ON THE BEAT: RAGE BACK, AND IT FLIES AGAIN',
    teach: 'RECALL THE HATCHET, THEN PRESS UP+C AS IT REACHES YOU: YOU CATCH IT, GAIN RAGE, AND IT IS THROWN AGAIN FOR FREE' },
  30: { id: 'bzwarcry', name: 'WARCRY CHARGE', input: 'HOLD C AT FULL RAGE, THEN TAP X', k: null, cd: 14, cost: 0,
    what: 'A WIDE SHOUT: EVERY FOE NEAR LOSES POISE, AND YOU CANNOT BE FLINCHED FOR TWO SECONDS',
    teach: 'WITH A FULL BAR OF RAGE, HOLD C AND TAP X: A WAR SHOUT THAT BREAKS POISE ON ALL NEAR AND KEEPS YOU STANDING FOR TWO SECONDS. IT SPENDS HALF THE BAR' },
  35: { id: 'bzreckless', name: 'RECKLESS BLOW', input: 'HOLD X IN A FRENZY', k: 1.8, cd: 0, cost: 0,
    what: 'IN A FRENZY THE WIND-UP CHOP FALLS HARDER, AT THE COST OF 4% OF YOUR HEALTH',
    teach: 'IN A FRENZY THE HELD CHOP LANDS A QUARTER HARDER AND LEANS HARDER ON POISE. IT COSTS 4% OF YOUR HEALTH (NEVER YOUR LAST POINT)' },
  40: { id: 'bzchained', name: 'CHAINED RAGE', input: 'KILL IN A FRENZY', k: null, cd: 0, cost: 0,
    what: 'EVERY KILL IN A FRENZY EXTENDS IT HALF A SECOND (SIX SECONDS AT MOST)',
    teach: 'EVERY FOE YOU KILL DURING A FRENZY ADDS HALF A SECOND TO IT, UP TO SIX SECONDS A FRENZY' },
  45: { id: 'bzleap', name: 'BERSERK LEAP', input: 'HOLD X, THEN LET GO WHILE HOLDING UP', k: 0.7, cd: 0, cost: 12,
    what: 'LET A COMMITTED WIND-UP GO UPWARD: A LEAP THAT LANDS IN A GROUND-SPLITTER ALL ROUND YOU',
    teach: 'WIND UP PAST COMMITTED, THEN LET GO OF X WHILE HOLDING UP: HE LEAPS AND LANDS IN A SPLIT THAT HITS EVERYTHING ROUND HIM. 12 STAMINA' },
  50: { id: 'bzrampage', name: 'UNBOWED RAMPAGE', input: 'TAP C AT FULL RAGE DURING LAST STAND', k: null, cd: 40, cost: 0,
    what: 'LAST STAND BECOMES A RAMPAGE: QUICKER AND HITTING A QUARTER HARDER FOR FOUR SECONDS, THEN A QUARTER MORE TAKEN AS DEBT',
    teach: 'DURING LAST STAND WITH A FULL BAR, TAP C: FOUR SECONDS OF RAMPAGE (QUICKER, A QUARTER HARDER), THEN SIX SECONDS TAKING A QUARTER MORE. FORTY SECONDS BEFORE AGAIN' },
};
// Upgrades: ranked I / II (II needs I). 8 for the Berserker (the thin-hero rule gives the priority five ten). 'what' is [rank I text, rank II text].
export const BERSERKER_UPGRADES = [
  { id: 'ubstoke', name: 'STOKED+', what: ['RAGE FILLS 10% FASTER', 'AND 20% FASTER'] },
  { id: 'ubtake', name: 'TAKE IT+', what: ['THE PARRY BEAT IS 0.03 S LONGER', 'AND 0.06 S LONGER'] },
  { id: 'ubsplit', name: 'SPLITTER+', what: ['THE CHOP ON A BROKEN FOE HITS 15% HARDER', 'AND 30% HARDER'] },
  { id: 'ubcool', name: 'COOL', what: ['YOUR SKILLS WAIT 0.5 S LESS', 'AND 1 S LESS'] },
  { id: 'ubthick', name: 'THICK SKIN+', what: ['A FRENZY COSTS 5 POINTS LESS EXTRA DAMAGE TAKEN', 'AND 10 POINTS LESS'] },
  { id: 'ubstorm', name: 'AXE STORM+', what: ['A FIFTH HATCHET IN THE STORM', 'AND A SIXTH, 20% HARDER'] },
  { id: 'ubwind', name: 'WIND-UP+', what: ['THE WIND-UP CHOP REACHES 20% FURTHER', 'AND 40% FURTHER'] },
  { id: 'ubprice', name: 'BLOOD PRICE+', what: ['A FRENZY HEALS A QUARTER MORE PER BLOW', 'AND HALF AGAIN MORE'] },
];
