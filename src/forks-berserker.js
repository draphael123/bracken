// src/forks-berserker.js - THE BERSERKER'S COMPLETE FORK ROAD (claude/bersfork; forkplan sec 4 BERSERKER table + passiveplan sec 4 + sec 7 row 8). Pure data + the numbers the effect code reads.
// 11 rungs: dash L21 (the barge), THE SPIN L22, chain L24, take-it L27, BATTLE ROAR L29, hold-X wind-up L32, frenzy L36, GREAT CLEAVE L38, hatchet L43, LAST STAND L48, capstone L50
// (the ultimate: UP+C at a FULL rage bar), and ten trait pairs (open at L20 while the trait is WORN). His identity word: MOMENTUM COSTS (rage is earned by staying in it and spent on it).
// Built on MASTER'S Berserker (claude/berserkerid is NOT merged): card words say CHOP / AXE / BAR / RAGE, never name the old three-tier ladder or the cross-chop, so berserkerid needs no text change.
// A skill fork's key is 'skill:<catalog id>' (it applies while the skill is slotted); a trait fork's key is 'trait:<id>'. Effect code: src/berserker.js (reads F('<side id>') = tal().fk(id)) and a few
// one-line sites in src/main.js; main.js answers fk() from forks.js forkOn (false while FORKS_SHIP is off, for another hero, and in an EVEN-L1 duel).
// BOSS LAW: no side pins or immunes a boss; reel / stagger / push sides skip bosses and minis (smallFoe); every blow is swordDmg x k x amul; no heal above 3% of max hp from one trigger.
// TRAIT RANK: every trait fork opens at L20, where a worn trait is already RANK III (100%). A side REPLACES the rank-III number, so the pairs need no rank scaling (below L20 no fork is active: the plain trait plays).
export const BF = {
  barge: { shove: 1.5, down: 1.0, rage: 8, slipLen: 0.7, slipRage: 5, slipCd: 0.7 },                      /* L21 A BULL BARGE: shove x1.5, foes down 1 s, +8 rage each | B SLIP: roll x0.7 long, no shove, +5 rage for a blow that finds air */
  spin:  { wide: { dur: 0.8, n: 2, r: 50, k: 1.2 }, quick: { dur: 0.5, n: 4, r: 36, k: 0.6 }, base: { dur: 0.5, n: 2, r: 36, k: 1.15 } },   /* L22 A WIDE SPIN: slow, r50, 2 x1.2 | B QUICK SPINS: four fast turns x0.6 each */
  chain: { scentMul: 1.2, scentT: 4, veinsAt: 50 },                                                        /* L24 A BLOOD SCENT: a kill, the next chop x1.2 within 4 s | B OPEN VEINS: REND stacks from half a bar */
  take:  { roarR: 60, roarReel: 0.8, spiteShare: 0.5, spiteCap: 0.8, spiteT: 6 },                          /* L27 A BRACED ROAR: a parry reels small foes within 60 | B SPITE: a parry banks half the blow for the next chop (cap 0.8 of a chop, 6 s) */
  roar:  { wide: { r: 100, rage: 15, small: 1.2, push: 200 }, gut: { r: 40, rage: 45, small: 0.3, push: 0 }, base: { r: 70, rage: 25, small: 0.6, push: 110 } },   /* L29 A WIDE ROAR | B GUT ROAR */
  wind:  { deepQ: 1.25, deepMul: 1.2, shallowQ: 0.7, shallowMul: 0.85 },                                   /* L32 A DEEP WIND: tiers arrive 25% later, blow x1.2 | B SHALLOW WIND: 30% sooner, x0.85 */
  frenzy:{ chainT: 0.5, chainCap: 6, fuseAt: 67, fuseT: 5, hide: 1.1 },                                   /* L36 A CHAINED RAGE: a kill in a frenzy +0.5 s (cap 6 s) | B SHORT FUSE: frenzy at 2/3 bar, 5 s, takes x1.1 (THICK HIDE baked) */
  cleave:{ overR: 40, overMul: 2.2, overPoise: 50, brokenMul: 2, sweepR: 80, sweepBack: 36, sweepMul: 1.0, sweepGap: 0.17, baseR: 62, baseMul: 1.8, basePoise: 30 },   /* L38 A OVERHEAD (SPLITTER baked) | B SIDE SWEEP: two passes x1.0 */
  axe:   { armMul: 1.4, armFar: 1.25, armRage: 12, splN: 2, splK: 0.25, splLife: 0.5 },                    /* L43 A AXE ARM: x1.4, flies further, pick-up pays 12 rage | B SPLINTERING: two chips x0.25 fly on from the first hit */
  stand: { holdT: 5, holdSwing: 0.85, roarT: 3, roarRageMul: 2, roarEnd: 25, baseT: 4 },                   /* L48 A THE LONG STAND: 5 s, no flinch, chops x0.85 pace | B ROARING STAND: 3 s, rage from blows x2, +25 rage when it ends */
  tide:  { frenzyT: 10, burstK: 1.5, burstR: 110, reel: 0.8 },                                             /* L50 A THE RED TIDE: UP+C at a full bar: a 10 s frenzy opening with a ring x1.5 within 110 | B */
  great: { t: 8, reach: 1.6, dmg: 1.4, swing: 0.85 },                                                      /* L50 B THE GREAT AXE: UP+C at a full bar: 8 s, chops reach x1.6, hit x1.4, pace x0.85 */
  trait: { longA: 5, longB: 2, mistB: 70, braceA: 1.6, braceB: 1.15, braceBcost: 0.6, backAvx: 300, backAknock: 1.6, backBk: 0.5, hotA: 1.6, hotB: 1.15, hotBburn: 3,
           scarAhp: 0.5, scarAmul: 0.9, scarBhp: 0.25, scarBmul: 0.72, wideAr: 16, wideBr: 4, wideBback: 22, wideBback2: 20, priceA: 0.06, priceB: 0.03, priceBkill: 0.015,
           ironA: 1.2, ironBrage: 20, haftAfar: 1.7, haftAdmg: 1.33, haftBfar: 1.15, haftBdmg: 1.15, unbowBhp: 0.08, unbowBrage: 60 },
};
/* pure reads for the tools */
export const BF_BURN_RK = BF.trait.hotBburn;   /* SLOW BURN: the coil and the whetstone read rk('bzBurn') = 3 (x4) */
export const spinCfg = side => side === 'A' ? BF.spin.wide : side === 'B' ? BF.spin.quick : BF.spin.base;
export const roarCfg = side => side === 'A' ? BF.roar.wide : side === 'B' ? BF.roar.gut : BF.roar.base;

export const BERSERKER_RUNG_FORKS = {
  dash: { slot: 'dash', ability: 'dash', name: 'THE BARGE', trade: 'SHOVE IT OR SLIP IT',
    A: { id: 'bfbull', name: 'BULL BARGE', input: 'DODGE',
      what: 'THE ROLL SHOVES SMALL FOES HALF AGAIN AS FAR, PUTS THEM DOWN A SECOND AND FEEDS YOUR RAGE',
      teach: 'THE SHOULDER BARGE SHOVES SMALL FOES 1.5 TIMES AS FAR AND LEAVES THEM DOWN FOR A SECOND. EACH ONE IT MOVES GIVES 8 RAGE' },
    B: { id: 'bfslip', name: 'SLIP', input: 'DODGE',
      what: 'A QUICK SHORT ROLL, NO SHOVE. A BLOW THAT FINDS ONLY AIR FEEDS YOUR RAGE',
      teach: 'THE ROLL IS 30% SHORTER AND SHOVES NOTHING. A BLOW THAT LANDS ON AN UNTOUCHABLE ROLL GIVES 5 RAGE, AT MOST EVERY 0.7 S' } },
  'skill:bzSpin': { slot: 'skill1', ability: 'skill:bzSpin', name: 'THE SPIN', trade: 'ONE WIDE OR FOUR FAST',
    A: { id: 'bfwidespin', name: 'WIDE SPIN', input: 'F',
      what: 'A SLOWER, WIDER TURN: BOTH AXES OUT TO FIFTY PIXELS, TWO PASSES AT 120%',
      teach: 'THE SPIN TAKES 0.8 S AND REACHES 50 PIXELS NOT 36. EACH OF ITS TWO PASSES HITS 120% OF A CHOP' },
    B: { id: 'bfquickspin', name: 'QUICK SPINS', input: 'F',
      what: 'FOUR FAST TURNS IN THE SAME HALF SECOND, EACH AT 60%',
      teach: 'THE SPIN IS FOUR QUICK TURNS IN 0.5 S, EACH HITTING AT 60% OF A CHOP, SAME REACH. A FOE CAUGHT IN IT TAKES FOUR BITES' } },
  chain: { slot: 'chain', ability: 'chain', name: 'THE FLURRY', trade: 'SCENT OR VEINS',
    A: { id: 'bfscent', name: 'BLOOD SCENT', input: 'X, X, X, X',
      what: 'A KILL MAKES YOUR NEXT CHOP LAND 20% HARDER, IF IT FALLS WITHIN FOUR SECONDS',
      teach: 'WHEN A FOE DIES TO YOU THE NEXT CHOP THAT LANDS WITHIN 4 S HITS 20% HARDER' },
    B: { id: 'bfveins', name: 'OPEN VEINS', input: 'X, X, X, X',
      what: 'FROM HALF A BAR OF RAGE YOUR CHOPS STACK REND, AND THE FOURTH CRACKS THE ARMOUR',
      teach: 'WITH HALF A BAR OF RAGE OR MORE, EVERY CHOP ON ONE FOE STACKS A REND LIKE A FRENZY DOES. THE FOURTH CRACKS ITS ARMOUR AND IS A HEAVY BLOW' } },
  block: { slot: 'block', ability: 'block', name: 'TAKE IT', trade: 'ROAR IT OR BANK IT',
    A: { id: 'bfbraced', name: 'BRACED ROAR', input: 'TAP C ON THE BEAT',
      what: 'A PARRY ON THE AXES ENDS IN A SHOUT: SMALL FOES NEAR YOU REEL BACK A BEAT',
      teach: 'RAISE THE AXES AS A BLOW LANDS: BESIDE THE PARRY YOU SHOUT, AND EVERY SMALL FOE WITHIN 60 PIXELS REELS 0.8 S. BOSSES ARE NOT MOVED' },
    B: { id: 'bfspite', name: 'SPITE', input: 'TAP C ON THE BEAT',
      what: 'A PARRY BANKS HALF THE BLOW: YOUR NEXT CHOP LANDS WITH IT ADDED, UP TO ONE CHOP MORE',
      teach: 'A PARRY ON THE AXES BANKS HALF OF THE BLOW YOU TURNED. THE NEXT CHOP THAT LANDS WITHIN 6 S ADDS IT, UP TO 80% OF A CHOP' } },
  'skill:bzRoar': { slot: 'skill2', ability: 'skill:bzRoar', name: 'BATTLE ROAR', trade: 'WIDE OR DEEP',
    A: { id: 'bfwideroar', name: 'WIDE ROAR', input: 'F',
      what: 'THE ROAR REACHES A HUNDRED PIXELS AND DRIVES SMALL FOES BACK AND DOWN, FOR LESS RAGE',
      teach: 'THE ROAR REACHES 100 PIXELS AND STAGGERS SMALL FOES 1.2 S, DRIVEN BACK. IT GIVES 15 RAGE NOT 25. BOSSES TAKE A SHORT STAGGER ONLY' },
    B: { id: 'bfgutroar', name: 'GUT ROAR', input: 'F',
      what: 'A SHORT ROAR THAT STIRS ALMOST NOTHING AROUND YOU BUT FILLS YOUR RAGE',
      teach: 'THE ROAR REACHES 40 PIXELS AND ONLY SHAKES SMALL FOES FOR 0.3 S. IT GIVES 45 RAGE NOT 25. YOUR PARTNERS STILL QUICKEN' } },
  heavy: { slot: 'heavy', ability: 'heavy', name: 'THE WIND-UP', trade: 'DEEP OR SHALLOW',
    A: { id: 'bfdeep', name: 'DEEP WIND', input: 'HOLD X',
      what: 'EVERY STEP OF THE WIND-UP COMES A QUARTER LATER, AND THE BLOW LANDS 20% HARDER',
      teach: 'THE HELD BLOW REACHES EACH OF ITS STEPS 25% LATER AND LANDS 20% HARDER AT EVERY STEP' },
    B: { id: 'bfshallow', name: 'SHALLOW WIND', input: 'HOLD X',
      what: 'EVERY STEP COMES 30% SOONER, AND THE BLOW LANDS 15% LIGHTER',
      teach: 'THE HELD BLOW REACHES EACH OF ITS STEPS 30% SOONER AND LANDS 15% LIGHTER AT EVERY STEP, SO YOU CAN WIND IT BETWEEN THREATS' } },
  spender: { slot: 'spender', ability: 'frenzy', name: 'THE FRENZY', trade: 'FEED IT OR LIGHT IT EARLY',
    A: { id: 'bfchained', name: 'CHAINED RAGE', input: 'DOWN+C AT A FULL BAR',
      what: 'EVERY KILL IN A FRENZY ADDS HALF A SECOND TO IT, UP TO SIX SECONDS A FRENZY',
      teach: 'A FOE THAT DIES TO YOU DURING A FRENZY ADDS 0.5 S TO IT, UP TO 6 S IN ALL PER FRENZY' },
    B: { id: 'bffuse', name: 'SHORT FUSE', input: 'DOWN+C AT TWO THIRDS',
      what: 'THE FRENZY LIGHTS AT TWO THIRDS OF A BAR, LASTS FIVE SECONDS, AND HURTS YOU LESS',
      teach: 'DOWN+C WORKS FROM TWO THIRDS OF THE BAR. THE FRENZY LASTS 5 S AND YOU TAKE ONLY 10% MORE IN IT, NOT A QUARTER' } },
  'skill:bzCleave': { slot: 'skill3', ability: 'skill:bzCleave', name: 'GREAT CLEAVE', trade: 'DOWN OR ACROSS',
    A: { id: 'bfoverhead', name: 'OVERHEAD', input: 'F',
      what: 'A SHORT, STEEP CUT THAT LEANS HARD ON THE POISE AND LANDS DOUBLE ON A BROKEN FOE',
      teach: 'THE CLEAVE REACHES 40 PIXELS, HITS AT 220% OF A CHOP AND LEANS 50 ON POISE. A BROKEN FOE TAKES DOUBLE' },
    B: { id: 'bfsweep', name: 'SIDE SWEEP', input: 'F',
      what: 'TWO WIDE SWEEPS A BEAT APART, 80 PIXELS AHEAD AND 36 BEHIND, EACH AT 100%',
      teach: 'THE CLEAVE IS TWO SIDEWAYS SWEEPS A BEAT APART, EACH HITTING 100% OF A CHOP, 80 PIXELS AHEAD AND 36 BEHIND YOU' } },
  sig: { slot: 'sig', ability: 'hatchet', name: 'THE HATCHET', trade: 'ONE HARD OR ONE SPLIT',
    A: { id: 'bfarm', name: 'AXE ARM', input: 'UP+C',
      what: 'THE THROWN AXE FLIES A QUARTER FURTHER AND HITS 40% HARDER. PICKING IT UP PAYS RAGE',
      teach: 'THE THROWN AXE FLIES 25% FURTHER AND HITS 40% HARDER. WHEN YOU PICK IT UP OR CALL IT BACK YOU GAIN 12 RAGE' },
    B: { id: 'bfsplinter', name: 'SPLINTERING', input: 'UP+C',
      what: 'THE AXE BURSTS ON ITS FIRST HIT: TWO CHIPS FLY ON, EACH AT A QUARTER OF A CHOP',
      teach: 'THE THROWN AXE SPLINTERS ON THE FIRST FOE IT HITS: TWO CHIPS FLY ON, ONE HIGH AND ONE LOW, EACH HITTING 25% OF A CHOP' } },
  'skill:bzStand': { slot: 'skill4', ability: 'skill:bzStand', name: 'LAST STAND', trade: 'LONG OR LOUD',
    A: { id: 'bfholdstand', name: 'THE LONG STAND', input: 'F',
      what: 'FIVE SECONDS OF NOT FALLING AND NOT FLINCHING, BUT YOUR CHOPS COME 15% SLOWER',
      teach: 'LAST STAND LASTS 5 S AND NOTHING KNOCKS YOU OUT OF A SWING, BUT YOUR CHOPS RUN 15% SLOWER WHILE IT HOLDS' },
    B: { id: 'bfroarstand', name: 'ROARING STAND', input: 'F',
      what: 'THREE SECONDS WHERE BLOWS YOU DEAL FILL TWICE THE RAGE, AND IT ENDS WITH A SHOUT OF MORE',
      teach: 'LAST STAND LASTS 3 S. BLOWS YOU DEAL IN IT FILL TWICE THE RAGE, AND WHEN IT ENDS YOU GAIN 25 MORE' } },
  ult: { slot: 'ult', ability: 'ult', capstone: true, name: 'THE CAPSTONE', trade: 'A TIDE OR ONE GREAT AXE',
    A: { id: 'bftide', name: 'THE RED TIDE', input: 'UP+C AT A FULL BAR',
      what: 'A WAR CRY THAT BREAKS OVER THE ROOM: A RING OF BLOWS, THEN A TEN-SECOND FRENZY',
      teach: 'UP+C AT A FULL BAR OF RAGE: A RING OF 150% BLOWS WITHIN 110 PIXELS, SMALL FOES REEL, AND A 10 S FRENZY BEGINS' },
    B: { id: 'bfgreataxe', name: 'THE GREAT AXE', input: 'UP+C AT A FULL BAR',
      what: 'BOTH AXES BECOME ONE GREAT AXE FOR EIGHT SECONDS: CHOPS REACH FAR AND LAND HARD, SLOWER',
      teach: 'UP+C AT A FULL BAR OF RAGE: FOR 8 S YOUR CHOPS REACH 60% FURTHER AND HIT 40% HARDER, 15% SLOWER. THE BAR IS SPENT' } },
};

/* HIS TEN TRAIT FORKS (passiveplan sec 4: a worn trait opens an A/B pair from L20; sides are SMALL, axis MORE / DIFFERENT). Key 'trait:<id>'. FOLDED: bzHide (THICK HIDE) is baked into SHORT FUSE
   (frenzy B) and bzSplit (SPLITTER) into OVERHEAD (cleave A): with FORKS_SHIP on the two old traits retire (src/traits-b.js). */
const TF = (id, name, trade, a, b) => ({ trait: id, ability: 'trait:' + id, name, trade, A: { input: 'TRAIT', ...a }, B: { input: 'TRAIT', ...b } });
export const BERSERKER_TRAIT_FORKS = {
  'trait:bzLong': TF('bzLong', 'BURNING LONG', 'LONGER OR LEAVE EMBERS',
    { id: 'bflonga', name: 'LONG BURN', what: 'THE FRENZY LASTS FIVE SECONDS LONGER AND LEAVES NOTHING BEHIND', teach: 'A FRENZY LASTS 5 S LONGER THAN IT DOES UNTRAINED. WHEN IT ENDS THE BAR IS EMPTY' },
    { id: 'bflongb', name: 'AFTERGLOW', what: 'THE FRENZY LASTS TWO SECONDS LONGER AND LEAVES THE BAR AT SEVENTY', teach: 'A FRENZY LASTS 2 S LONGER, AND WHEN IT ENDS THE RAGE BAR STANDS AT 70, NOT EMPTY' }),
  'trait:bzBraceLong': TF('bzBraceLong', 'WIDE BRACE', 'LONG BEAT OR CHEAP BRACE',
    { id: 'bfbracea', name: 'LONG BEAT', what: 'THE PARRY BEAT OF TAKE IT RUNS SIXTY PERCENT LONGER', teach: 'THE BEAT WHERE TAKE IT IS A PARRY IS 60% LONGER THAN NORMAL' },
    { id: 'bfbraceb', name: 'CHEAP BRACE', what: 'THE BEAT IS A LITTLE LONGER AND TAKING A BLOW COSTS 40% LESS STAMINA', teach: 'THE PARRY BEAT IS 15% LONGER, AND A BLOW THE AXES TAKE COSTS 40% LESS STAMINA' }),
  'trait:bzBraceBack': TF('bzBraceBack', 'BRACED BACK', 'THROWN OR PUNISHED',
    { id: 'bfbacka', name: 'HARD BACK', what: 'A PARRIED FOE IS THROWN FAR BACK AND LEFT DOWN LONGER', teach: 'A SMALL FOE YOU PARRY IS THROWN BACK AT 300 AND LEFT DOWN 1.6 S' },
    { id: 'bfbackb', name: 'PUNISHING', what: 'NO THROW: A PARRIED FOE TAKES A FREE HALF CHOP ON THE SPOT, BOSSES TOO', teach: 'A FOE YOU PARRY IS NOT THROWN BACK BUT TAKES AN AT-ONCE CHOP AT 50%. BOSSES TAKE IT TOO' }),
  'trait:bzHot': TF('bzHot', 'HOT BLOOD', 'HOTTER OR SLOW BURN',
    { id: 'bfhota', name: 'HOTTER', what: 'BLOWS YOU DEAL FILL RAGE SIXTY PERCENT FASTER', teach: 'BLOWS YOU DEAL FILL RAGE 60% FASTER THAN NORMAL' },
    { id: 'bfhotb', name: 'SLOW BURN', what: 'BLOWS FILL A LITTLE FASTER, BUT THE COIL AND THE WHETSTONE FILL IT FOUR TIMES AS FAST', teach: 'BLOWS FILL RAGE 15% FASTER, AND THE COIL AND THE WHETSTONE FILL IT FOUR TIMES AS FAST' }),
  'trait:bzScar': TF('bzScar', 'SCARRED', 'EARLY OR DEEP',
    { id: 'bfscara', name: 'EARLY SCAR', what: 'BELOW HALF YOUR HEALTH EVERY BLOW LANDS A TENTH LIGHTER', teach: 'BELOW HALF YOUR HEALTH EVERY BLOW ON YOU LANDS 10% LIGHTER' },
    { id: 'bfscarb', name: 'DEEP SCAR', what: 'BELOW A QUARTER YOUR HEALTH EVERY BLOW LANDS A QUARTER LIGHTER', teach: 'BELOW A QUARTER OF YOUR HEALTH EVERY BLOW ON YOU LANDS 28% LIGHTER' }),
  'trait:bzWide': TF('bzWide', 'WIDE CROSS', 'FAR OR ALL ROUND',
    { id: 'bfwidea', name: 'FAR REACH', what: 'THE DOUBLE CHOP REACHES SIXTEEN PIXELS FURTHER, NOTHING BEHIND YOU', teach: 'THE HELD DOUBLE CHOP REACHES 16 PIXELS FURTHER AHEAD AND NO LONGER REACHES BEHIND YOU' },
    { id: 'bfwideb', name: 'ALL ROUND', what: 'A LITTLE FURTHER AHEAD AND A LONG WAY BEHIND: THE DOUBLE CHOP CUTS BOTH SIDES', teach: 'THE HELD DOUBLE CHOP REACHES 4 PIXELS FURTHER AHEAD AND 22 PIXELS BEHIND YOU' }),
  'trait:bzPrice': TF('bzPrice', 'RED FEAST', 'RICH BLOWS OR RICH KILLS',
    { id: 'bfpricea', name: 'FEAST', what: 'IN A FRENZY EVERY BLOW HEALS YOU SIX PERCENT OF WHAT IT DEALT', teach: 'IN A FRENZY EVERY BLOW HEALS YOU 6% OF THE DAMAGE IT DEALT, NOT 5%' },
    { id: 'bfpriceb', name: 'THIRST', what: 'BLOWS HEAL LESS, BUT EVERY KILL IN A FRENZY HEALS YOU A LITTLE EXTRA', teach: 'IN A FRENZY BLOWS HEAL 3% OF THEIR DAMAGE, AND EVERY KILL HEALS YOU 1.5% OF YOUR HEALTH' }),
  'trait:bzIronBrace': TF('bzIronBrace', 'IRON BRACE', 'DEEPER OR ANSWERED',
    { id: 'bfirona', name: 'DEEP BRACE', what: 'A RED BLOW ON THE AXES LANDS AT TWO FIFTHS OF ITS FORCE, NOT HALF', teach: 'A RED BLOW YOU TAKE ON THE CROSSED AXES LANDS AT 40% OF ITS FORCE INSTEAD OF HALF' },
    { id: 'bfironb', name: 'ANSWERED', what: 'THE RED BLOW STILL LANDS AT HALF, AND YOU GAIN TWENTY RAGE FOR HOLDING', teach: 'A RED BLOW ON THE CROSSED AXES LANDS AT HALF FORCE AND GIVES YOU 20 RAGE' }),
  'trait:bzHaft': TF('bzHaft', 'HEAVY HAFT', 'FAR OR STAGGERING',
    { id: 'bfhafta', name: 'LONG HAFT', what: 'THE THROWN AXE FLIES SEVENTY PERCENT FURTHER AND LANDS A THIRD HARDER', teach: 'THE THROWN AXE FLIES 70% FURTHER AND HITS 33% HARDER, BUT NO LONGER STAGGERS' },
    { id: 'bfhaftb', name: 'STAGGER HAFT', what: 'THE AXE FLIES A LITTLE FURTHER AND ALWAYS STAGGERS WHAT IT HITS', teach: 'THE THROWN AXE FLIES 15% FURTHER, HITS 15% HARDER AND STAGGERS WHAT IT HITS. A BIG FOE TAKES POISE' }),
  'trait:bzUnbowed': TF('bzUnbowed', 'UNBOWED', 'RED OR STANDING',
    { id: 'bfunbowa', name: 'GOES RED', what: 'THE BLOW THAT WOULD KILL YOU STARTS A FRENZY AT ONCE, ON ONE HEALTH', teach: 'ONCE A FIGHT, A BLOW THAT WOULD KILL YOU LEAVES YOU ON ONE HEALTH AND STARTS A FRENZY AT ONCE' },
    { id: 'bfunbowb', name: 'STANDS', what: 'THE BLOW THAT WOULD KILL YOU LEAVES YOU ON EIGHT PERCENT HEALTH AND SIXTY RAGE', teach: 'ONCE A FIGHT, A BLOW THAT WOULD KILL YOU LEAVES YOU ON 8% OF YOUR HEALTH AND 60 RAGE' }),
};
export const BERSERKER_FORKS = { ...BERSERKER_RUNG_FORKS, ...BERSERKER_TRAIT_FORKS };
