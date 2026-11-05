// src/tech-hunter.js - THE DEMON HUNTER'S L25-L50 KIT (claude/demonhunter, 11-05). The KNIGHT'S FORK PATTERN (src/tech-knight.js on claude/kfork, proven by
// claude/forkproof 11-04; the Desert Priest's src/tech-priest.js is the same shape): six tech levels, a pick-1-of-2 FORK at 30, 40 and 50 ({fork: [A, B]}: A and B
// differ in ROLE and share one TRADE line; both L50 options carry capstone:true), and eight ranked upgrades (I then II). Pure data: progression.js imports it;
// src/demon-hunter.js reads tech(id) / upg(id). Every number is swordDmg x k x amul (the late-game law): k is the multiplier here, never a flat hit.
// MASTER HAS NO FORK FRAMEWORK YET (claude/kfork). Until it merges progression.js registers HUNTER_TECH_FLAT (each fork's A = the RECOMMENDED pick, exactly what
// kfork's techniqueFor returns for a fork); at the kfork merge change that ONE line to HUNTER_TECH and the B options become pickable.
export const HUNTER_TECH = {
  25: { id: 'dhwake', name: 'SILVER WAKE', input: 'DASH', k: 0.4, cd: 0, cost: 0,
    what: 'THE DASH LEAVES A LINE OF SILVER FOR A SECOND THAT CUTS WHAT CROSSES IT',
    teach: 'YOUR DASH NOW LEAVES A SILVER WAKE BEHIND IT: FOR A SECOND IT CUTS WHATEVER WALKS INTO IT' },
  30: { fork: [
    { role: 'offence', trade: 'TEAR IT OR BIND IT', id: 'dhrend', name: 'REND THE BRAND', input: 'X x3 ON A BRANDED FOE', k: 1.2, cd: 0, cost: 0,
      what: 'THE THIRD CUT ON A BRANDED FOE TEARS THE BRAND OUT: A BURST OF SILVER AND TWO FURY',
      teach: 'THE THIRD CUT OF A RUN ON A BRANDED FOE NOW TEARS THE BRAND OUT OF IT: A BURST OF SILVER, AND TWO FURY' },
    { role: 'control', trade: 'TEAR IT OR BIND IT', id: 'dhchain', name: 'SILVER CHAINS', input: 'DOWN+C ON A BIG FOE', k: null, cd: 0, cost: 0,
      what: 'BANISH BINDS A BIG FOE: ITS BRAND HOLDS TEN SECONDS, ITS POISE IS LEANED ON, AND EVERY HIT ON IT IS ONE MORE FURY',
      teach: 'DOWN+C ON A BIG FOE NOW BINDS IT IN SILVER: THE BRAND HOLDS TEN SECONDS AND EVERY HIT ON IT FEEDS ONE MORE FURY' } ] },
  35: { id: 'dhhunt', name: 'THE LONG HUNT', input: 'ALWAYS ON', k: null, cd: 0, cost: 0,
    what: 'A BRAND ON A DEMON NEVER FADES',
    teach: 'A DEMON YOU HAVE BRANDED STAYS BRANDED NOW, UNTIL YOU SPEND IT' },
  40: { fork: [
    { role: 'mobility', trade: 'GO THROUGH OR STAND OFF', id: 'dhblink', name: 'BLINK BACK', input: 'TAP C JUST AFTER A DASH', k: null, cd: 0, cost: 0,
      what: 'TAP C RIGHT AFTER A DASH: A SECOND PASS BACK THROUGH THEM, FREE',
      teach: 'TAP C THE MOMENT A DASH ENDS: YOU BLINK BACK THROUGH THEM - A SECOND PASS, NO WIND' },
    { role: 'defence', trade: 'GO THROUGH OR STAND OFF', id: 'dhward', name: 'SILVER WARD', input: 'TAP C ON THE BEAT', k: null, cd: 0, cost: 0,
      what: 'A SLIP LEAVES A WARD FOR A SECOND: THE NEXT BLOW LANDS AT HALF',
      teach: 'SLIP A BLOW (TAP C ON THE BEAT) AND FOR A SECOND THE NEXT BLOW THAT FINDS YOU LANDS AT HALF' } ] },
  45: { id: 'dhsurge', name: 'FURY SURGE', input: 'ALWAYS ON', k: 0.15, cd: 0, cost: 0,
    what: 'AT FULL FURY HIS BLOWS LAND 15% HARDER AND THE DASH COSTS NO WIND',
    teach: 'WHILE YOUR FURY IS FULL YOUR BLADES LAND 15% HARDER AND YOUR DASH COSTS NOTHING' },
  50: { fork: [
    { role: 'close', trade: 'CUT THEM DOWN OR RAIN ON THEM', capstone: true, id: 'dhcull', name: 'THE CULLING', input: 'UP+C AT FULL FURY', k: 2.0, cd: 0, cost: 0,
      what: 'THE RECKONING STRIKES EVERY BRAND TWICE',
      teach: 'UP+C AT FULL FURY: THE RECKONING NOW CUTS EVERY BRANDED FOE TWICE BEFORE YOU LAND' },
    { role: 'far', trade: 'CUT THEM DOWN OR RAIN ON THEM', capstone: true, id: 'dhvolley', name: 'THE SILVER STORM', input: 'UP+C AT FULL FURY', k: 1.5, cd: 0, cost: 0,
      what: 'THE RECKONING IS A KNIFE AT EVERY FOE IN SIGHT: EACH STRUCK AND BRANDED, AND HALF HIS FURY KEPT',
      teach: 'UP+C AT FULL FURY: YOU STAND AND THROW - A SILVER KNIFE INTO EVERY FOE ON THE SCREEN (A BOSS HARDER), EACH ONE BRANDED, AND HALF YOUR FURY KEPT' } ] },
};
// Upgrades: ranked I / II (II needs I). Eight, the thin-hero rule (as the Knight's). 'what' is [rank I text, rank II text]. Read in src/demon-hunter.js as U(id).
export const HUNTER_UPGRADES = [
  { id: 'ublade', name: 'WHETTED', what: ['THE BLADES CUT 5% HARDER', 'AND 10% HARDER'] },
  { id: 'udash', name: 'KEEN PASS', what: ['THE DASH CUTS 10% HARDER', 'AND 20% HARDER'] },
  { id: 'ubrand', name: 'DEEP SILVER', what: ['BRANDS LAST 15% LONGER', 'AND 30% LONGER'] },
  { id: 'ufury', name: 'HOT BLOOD', what: ['FURY KEEPS 0.2 S LONGER', 'AND 0.4 S LONGER'] },
  { id: 'ubanish', name: 'HEAVY BANISH', what: ['BANISH STRIKES 15% HARDER', 'AND 30% HARDER'] },
  { id: 'uslip', name: 'LIGHT FEET', what: ['THE SLIP\'S BEAT IS 10% LONGER', 'AND 20% LONGER'] },
  { id: 'ureck', name: 'RECKONER', what: ['THE RECKONING CUTS 10% HARDER', 'AND 20% HARDER'] },
  { id: 'uknife', name: 'BALANCED KNIVES', what: ['SILVER KNIVES STRIKE 20% HARDER', 'AND 40% HARDER'] },
];
/* each fork's A (its first): what kfork's techniqueFor returns for a fork, and what master can read today */
export const flatTech = T => Object.fromEntries(Object.entries(T).map(([n, e]) => [n, Array.isArray(e && e.fork) ? e.fork[0] : e]));
export const HUNTER_TECH_FLAT = flatTech(HUNTER_TECH);
