// src/tech-priest.js - THE DESERT PRIEST'S L25-L50 KIT (claude/desertpriest, 11-05). The KNIGHT'S FORK PATTERN (src/tech-knight.js on claude/kfork, proven by
// claude/forkproof 11-04): six tech levels, a pick-1-of-2 FORK at 30, 40 and 50 ({fork: [A, B]}: A and B differ in ROLE and share one TRADE line; both L50
// options carry capstone:true), and eight ranked upgrades (I then II). Pure data: progression.js imports it; src/desert-priest.js reads tech(id) / upg(id).
// Every number is swordDmg x k x amul (the late-game law): k is the multiplier here, never a flat hit.
//   input  where the player does it      k  damage multiplier (or null)      cd / cost  seconds / stamina      teach  the one line the unlock banner says
// MASTER HAS NO FORK FRAMEWORK YET (it is on claude/kfork, merge-ready after the SAT 11-07 cut). Master's techniqueFor() returns a level's entry as is, so a
// {fork} entry would be read as a technique with no id. Until kfork merges, progression.js registers PRIEST_TECH_FLAT (each fork's A = the RECOMMENDED pick,
// exactly what kfork's techniqueFor returns for a fork); at the kfork merge change that ONE line to PRIEST_TECH and the B options become pickable.
export const PRIEST_TECH = {
  25: { id: 'spspear', name: 'THE SUN SPEAR', input: 'X x3 (THE THIRD BLOW)', k: 1.4, cd: 0, cost: 0,
    what: 'THE THIRD BLOW\'S FLASH FLIES ON AS A LANCE OF LIGHT, FOUR TILES ALONG THE ROW',
    teach: 'THE THIRD BLOW OF A RUN NOW THROWS ITS FLASH AHEAD: A LANCE OF LIGHT FOUR TILES LONG, AS STRONG AS YOUR RADIANCE' },
  30: { fork: [
    { role: 'offence', trade: 'THE BEAM OR THE GROUND', id: 'spprism', name: 'PRISM BEAM', input: 'HOLD X', k: 0.6, cd: 0, cost: 0,
      what: 'THE SUNBEAM BURNS 60% HARDER',
      teach: 'HOLD X: THE SUNBEAM NOW BURNS 60% HARDER, THE LIVING AND THE DEAD' },
    { role: 'defence', trade: 'THE BEAM OR THE GROUND', id: 'sphalo', name: 'HALLOWED GROUND', input: 'DOWN+C', k: null, cd: 0, cost: 0,
      what: 'A CONSECRATED PATCH BURNS OUT THE SHOTS THAT CROSS IT',
      teach: 'DOWN+C: WHAT IS THROWN OR SHOT ACROSS YOUR CONSECRATED GROUND BURNS OUT IN THE AIR' } ] },
  35: { id: 'spzenith', name: 'ZENITH', input: 'UP + HOLD X', k: null, cd: 0, cost: 0,
    what: 'THE BEAM UP A COLUMN BURNS AT FULL STRENGTH, FOR HALF THE WIND',
    teach: 'HOLD UP AND X: THE BEAM GOES UP THE COLUMN AT FULL STRENGTH NOW, AND COSTS HALF THE WIND TO HOLD' },
  40: { fork: [
    { role: 'control', trade: 'BLIND IT OR BURN IT', id: 'spblind', name: 'BLINDING FLARE', input: 'HOLD C', k: null, cd: 0, cost: 0,
      what: 'THE FLARE DAZZLES TWO AND A HALF TIMES AS LONG',
      teach: 'HOLD C: THE FLARE NOW LEAVES THE LIVING BLIND TWO AND A HALF TIMES AS LONG. A BOSS IS ONLY LEANED ON' },
    { role: 'offence', trade: 'BLIND IT OR BURN IT', id: 'spsolar', name: 'SOLAR RETURN', input: 'HOLD C AS A BLOW LANDS', k: 2.0, cd: 0, cost: 0,
      what: 'A BLOW TURNED BY THE FLARE IS SENT BACK AS LIGHT INTO THE ONE WHO STRUCK',
      teach: 'LET THE FLARE GO OFF AS A BLOW LANDS: THE BLOW IS TURNED AND ITS STRIKER TAKES A BURST OF LIGHT, TWICE YOUR BLOW' } ] },
  45: { id: 'spnoon', name: 'HIGH NOON', input: 'ALWAYS ON', k: null, cd: 0, cost: 0,
    what: 'RADIANCE NEVER DRAINS UNDER A QUARTER, AND CONSECRATED GROUND LASTS HALF AGAIN',
    teach: 'IN THE DARK YOUR RADIANCE STOPS AT A QUARTER NOW, AND A CONSECRATED PATCH LASTS HALF AS LONG AGAIN' },
  50: { fork: [
    { role: 'close', trade: 'HOLD THE DAY OR DROP THE SUN', capstone: true, id: 'spdawn', name: 'ENDLESS DAY', input: 'UP+C AT A FULL BAR', k: null, cd: 0, cost: 0,
      what: 'SUNRISE LASTS TEN SECONDS, AND ITS GROUND MENDS TWICE AS FAST',
      teach: 'UP+C AT A FULL BAR: SUNRISE NOW LASTS TEN SECONDS, AND YOUR CONSECRATED GROUND MENDS TWICE AS FAST WHILE IT DOES' },
    { role: 'far', trade: 'HOLD THE DAY OR DROP THE SUN', capstone: true, id: 'spfallsun', name: 'THE FALLING SUN', input: 'UP+C AT A FULL BAR', k: 3.0, cd: 0, cost: 0,
      what: 'SUNRISE ENDS IN A SUN DROPPED ON THE ROOM: EVERY FOE IN SIGHT TAKES IT',
      teach: 'WHEN SUNRISE ENDS, THE SUN FALLS: EVERY FOE ON THE SCREEN TAKES THREE OF YOUR BLOWS (A BOSS ONE AND A HALF), THE DEAD TWICE' } ] },
};
// Upgrades: ranked I / II (II needs I). Eight, the thin-hero rule (as the Knight's). 'what' is [rank I text, rank II text]. Read in src/desert-priest.js as U(id).
export const PRIEST_UPGRADES = [
  { id: 'urays', name: 'BRIGHTER RAYS', what: ['THE BEAM BURNS 15% HARDER', 'AND 30% HARDER'] },
  { id: 'uhallow', name: 'LONG HALLOW', what: ['CONSECRATED GROUND LASTS 1 S LONGER', 'AND 2 S LONGER'] },
  { id: 'uwell', name: 'WELLSPRING', what: ['RADIANCE FILLS 15% FASTER', 'AND 30% FASTER'] },
  { id: 'ustill', name: 'STILL FLAME', what: ['THE DARK DRAINS IT 20% SLOWER', 'AND 40% SLOWER'] },
  { id: 'uquick', name: 'QUICK FLARE', what: ['THE FLARE COSTS 5% LESS OF THE BAR', 'AND 10% LESS'] },
  { id: 'udisc', name: 'WIDE DISC', what: ['THE DISC\'S BEAT IS 10% LONGER', 'AND 20% LONGER'] },
  { id: 'umend', name: 'DEEP MENDING', what: ['CONSECRATED GROUND MENDS 25% MORE', 'AND 50% MORE'] },
  { id: 'ufall', name: 'SUNFALL+', what: ['THE SUNFALL RING HITS 20% HARDER', 'AND 40% HARDER'] },
];
/* each fork's A (its first): what kfork's techniqueFor returns for a fork, and what master can read today */
export const flatTech = T => Object.fromEntries(Object.entries(T).map(([n, e]) => [n, Array.isArray(e && e.fork) ? e.fork[0] : e]));
export const PRIEST_TECH_FLAT = flatTech(PRIEST_TECH);
