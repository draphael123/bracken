// src/forks-pyro.js - THE PYROMANCER'S COMPLETE FORK ROAD (claude/pyrofork; forkplan sec 4 PYROMANCER table + passiveplan sec 4 + sec 7 row 8). Pure data + the numbers the effect code reads.
// 11 rungs: dash L21, FIRE WALL L22, staff chain L24, flame ward L27, WISP L29, carried ball L32, living-bomb pips L36, FIRESTORM L38, heat bar L43, FLASHOVER L48, capstone L50 (METEOR FALL),
// and ten trait pairs (open at L20 while the trait is WORN). Her identity word: HEAT AND THE LIVING BOMB. Every side is fire: staff x k x heat, pips, burn, heat bar, nothing else.
// A skill fork's key is 'skill:<catalog id>' (it applies while the skill is slotted); a trait fork's key is 'trait:<id>'. Effect code: src/main.js behind pb('<side id>'), which reads
// forks.js forkOn from the pick, the level, the slot / the worn trait (false while FORKS_SHIP is off, for another hero, and in an EVEN-L1 duel).
// BOSS LAW: no side pins or immunes a boss; stagger sides skip bosses and minis; bursts and meteors keep their health caps; nothing here heals; every blow is swordDmg x k x amul x heat.
export const PF = {
  step:   { far: 1.25, burn: 1.5, near: 14, shortLen: 0.8, shortInv: 0.1 },        /* L21 A PHOENIX STEP: x1.25 pace, small foes in the wake get a pip + 1.5 s burn | B SMOKE STEP: x0.8 long, +0.1 s untouchable, one shot cleared */
  wall:   { rampLife: 4, rampRows: 2, rollLife: 1.5, rollV: 80 },                   /* L22 A RAMPART: two rows tall, 4 s | B ROLLING WALL: it walks 120 px in 1.5 s */
  chain:  { bellows: 5, sparkMul: 0.85, sparkPips: 2 },                             /* L24 A BELLOWS: the third cut +5 heat | B SPARK STAFF: every cut two pips, x0.85 */
  ward:   { nova: { k: 0.8, R: 70, pips: 1 }, swallowT: 6, swallowSteps: 1 },       /* L27 A WARD NOVA: a parry bursts a ring r70 | B WARD SWALLOW: a parried shot is eaten, the next ball +1 size (6 s) */
  wisp:   { greatK: 1.5, greatSpeed: 1.2, greatReach: 125, threeK: 0.5, extra: 2 }, /* L29 A GREAT WISP x1.5, seeks further | B THREE WISPS x0.5 each (the lead + two) */
  ball:   { trailWait: 0.25, trailMinStep: 3, trailMaxStep: 5, greatSlow: 0.8, greatUp: 1 },   /* L32 A TRAILING EMBER: a free step-1 ember 0.25 s behind a step 3-5 ball | B GREAT BALL: +1 size step, pays for it, x0.8 speed */
  fuse:   { slowLife: 10, slowReach: 16, shortNeed: 2, shortMul: 0.7, shortReach: -14, shortStagger: 0.5 },   /* L36 A SLOW FUSE: pips last 10 s, bursts +16 px | B SHORT FUSE: a burst at 2 pips, x0.7, -14 px, staggers a common 0.5 s */
  storm:  { life: 3, tick: 0.5, R: 90, anchorK: 1, walkK: 0.7 },                    /* L38 A ANCHORED STORM: it stands where she cast it | B WALKING STORM: it follows her at x0.7 */
  heat:   { whiteHold: 3, fill: 1.25, fall: 1.25 },                                 /* L43 A WHITE HEAT: a full bar holds +3 s | B BELLOWED: heat comes 25% faster and falls 25% faster */
  flash:  { searingReach: 90, searingMul: 1.5, chainReach: 120, chainMul: 0.8, chainR: 60, chainBurn: 4 },   /* L48 A SEARING FLASH: reach 90, the pop x1.5 | B CHAIN FLASH: each pop lights the foes within 60 px of it */
  star:   { tell: 1.2, R: 88, mul: 1.5, capPct: 0.05, capMini: 0.12 },              /* L50 A STAR FALL: one great meteor (tell 1.2 s, R 88, x1.5, boss cap 5%, mini 12%) */
  shower: { n: 5, from: 60, to: 300, gap: 0.3, tell: 0.7, R: 34, k: 1.0, capPct: 0.014, capMini: 0.035, pips: 2, snap: 40 },   /* L50 B METEOR SHOWER: five small meteors, a boss 1.4% each */
  trait:  { skinA: 4, skinB: 1.5, skinShove: 140, shieldAheat: 25, shieldBheat: 75, shieldBcut: 0.4, brandA: 1, brandBmul: 0.8, heartAhp: 0.5, heartAmul: 0.3, heartBhp: 0.25, heartBmul: 1.0,
           wildAreach: 1.6, phxAhp: 1.5, phxBhp: 0.7, longA: 1.35, longBlen: 0.9, longBtick: 0.28, jetwA: 1, jetwB: 0.7, hoverFall: 20, scatAr: 50, scatBk: 2, twinAk: 1.5, twinBk: 0.6 },
};
/* a pure read for the tools: the stagger a SHORT FUSE burst adds (a boss / mini: none) */
export const shortStagger = big => big ? 0 : PF.fuse.shortStagger;
/* a showerPlan (ported from claude/pyropack, pure): n spots from..to px ahead, each with its own start inside n x gap; a foe within snap px of a spot pulls it onto that foe (xs = the x of each foe in front) */
export function showerPlan(face, x0, xs) { const S = PF.shower, out = [];
  for (let i = 0; i < S.n; i++) { const x = x0 + face * (S.from + (S.to - S.from) * (i / (S.n - 1))); let best = null;
    for (const fx of xs || []) if (Math.abs(fx - x) <= S.snap && (best === null || Math.abs(fx - x) < Math.abs(best - x))) best = fx;
    out.push({ x: best === null ? x : best, snapped: best !== null, at: i * S.gap, done: false }); }
  return out; }

export const PYRO_RUNG_FORKS = {
  dash: { slot: 'dash', ability: 'dash', name: 'THE DODGE', trade: 'FAR AND BURNING OR SHORT AND SAFE',
    A: { id: 'pyphoenix', name: 'PHOENIX STEP', input: 'DODGE',
      what: 'THE DODGE RUNS A QUARTER FURTHER AND SMALL FOES IT BRUSHES CATCH A PIP AND BURN',
      teach: 'THE DODGE GOES 25% FURTHER. SMALL FOES WITHIN A STEP OF YOUR BODY AS YOU PASS GET A BOMB PIP AND A 1.5 S BURN. BOSSES ARE NOT MARKED' },
    B: { id: 'pysmoke', name: 'SMOKE STEP', input: 'DODGE',
      what: 'A SHORT DODGE THAT STAYS UNTOUCHABLE A BEAT LONGER AND LEAVES A PUFF THAT EATS ONE SHOT',
      teach: 'THE DODGE IS A FIFTH SHORTER AND YOU ARE UNTOUCHABLE 0.1 S LONGER. A PUFF OF SMOKE STAYS WHERE YOU STARTED AND CLEARS THE FIRST SHOT THAT CROSSES IT' } },
  'skill:fireWall': { slot: 'skill1', ability: 'skill:fireWall', name: 'FIRE WALL', trade: 'STANDING OR ROLLING',
    A: { id: 'pyrampart', name: 'RAMPART', input: 'F',
      what: 'THE WALL STANDS TWO ROWS TALL AND BURNS FOUR SECONDS',
      teach: 'THE FIRE WALL IS DOUBLE HEIGHT AND STANDS FOR 4 S INSTEAD OF 2.5. IT STAYS WHERE YOU PUT IT' },
    B: { id: 'pyrolling', name: 'ROLLING WALL', input: 'F',
      what: 'THE WALL WALKS FORWARD, A TILE AND A HALF A SECOND, AND BURNS WHAT IT ROLLS OVER',
      teach: 'THE FIRE WALL ROLLS AWAY FROM YOU 120 PX IN 1.5 S, BURNING WHAT IT MEETS. IT DOES NOT STAND' } },
  chain: { slot: 'chain', ability: 'chain', name: 'THE STAFF RUN', trade: 'HEAT OR PIPS',
    A: { id: 'pybellows', name: 'BELLOWS', input: 'X, X, X',
      what: 'THE THIRD CUT OF THE RUN BLOWS THE COALS: FIVE HEAT',
      teach: 'THE THIRD CUT OF A RUN OF THE STAFF PAYS FIVE HEAT ON TOP OF WHAT A HIT GIVES' },
    B: { id: 'pyspark', name: 'SPARK STAFF', input: 'X',
      what: 'EVERY CUT THROWS TWO PIPS, NOT ONE, BUT LANDS A LITTLE LIGHTER',
      teach: 'EACH STAFF CUT LEAVES TWO BOMB PIPS INSTEAD OF ONE, SO A FOE GOES UP ON THE SECOND CUT. THE CUTS LAND 15% LIGHTER' } },
  block: { slot: 'block', ability: 'block', name: 'THE FLAME WARD', trade: 'BURST OR SWALLOW',
    A: { id: 'pynova', name: 'WARD NOVA', input: 'PARRY WITH C',
      what: 'A PARRIED BLOW BLOWS A RING OF FIRE AROUND YOU: SMALL FOES TAKE A BLAST AND A PIP',
      teach: 'A PERFECT WARD BLOWS A RING 70 PX WIDE. SMALL FOES TAKE 0.8 OF A STAFF BLOW AND A PIP; A BOSS ONLY A PIP' },
    B: { id: 'pyswallow', name: 'WARD SWALLOW', input: 'PARRY A SHOT WITH C',
      what: 'A SHOT YOU PARRY IS EATEN, AND YOUR NEXT FIREBALL IS ONE SIZE BIGGER',
      teach: 'PARRY A SHOT WITH THE WARD AND IT FEEDS THE FLAME: THE NEXT BALL YOU THROW WITHIN 6 S IS ONE STEP BIGGER AT THE COST OF THE SMALLER' } },
  'skill:wisp': { slot: 'skill2', ability: 'skill:wisp', name: 'WISP', trade: 'ONE GREAT OR THREE SMALL',
    A: { id: 'pygreatwisp', name: 'GREAT WISP', input: 'F',
      what: 'ONE FAT WISP THAT SEEKS FURTHER AND DIVES AT HALF AGAIN THE WEIGHT',
      teach: 'THE WISP HITS HALF AGAIN AS HARD, FLIES A FIFTH FASTER AND SEEKS A FOE FROM FURTHER OFF' },
    B: { id: 'pythreewisp', name: 'THREE WISPS', input: 'F',
      what: 'THREE SMALL WISPS CIRCLE YOU AND DIVE ONE BY ONE, EACH AT HALF',
      teach: 'THREE WISPS INSTEAD OF ONE. EACH HITS AT HALF THE WEIGHT AND DIVES ON ITS OWN, SO THEY LIGHT THREE FOES' } },
  heavy: { slot: 'heavy', ability: 'heavy', name: 'THE CARRIED BALL', trade: 'A BALL BEHIND OR A BIGGER BALL',
    A: { id: 'pytrail', name: 'TRAILING EMBER', input: 'HOLD C, RELEASE',
      what: 'A CHARGED BALL IS FOLLOWED A BEAT LATER BY A FREE SMALL EMBER',
      teach: 'RELEASE A BALL OF STEP 3 TO 5 AND A SMALL EMBER FOLLOWS 0.25 S BEHIND IT, FREE. IT COUNTS TOWARD THE TWO IN THE AIR' },
    B: { id: 'pygreatball', name: 'GREAT BALL', input: 'HOLD C, RELEASE',
      what: 'THE BALL FLIES ONE SIZE BIGGER, SLOWER, WITH THE WIDER BURST, AND COSTS WHAT THAT SIZE COSTS',
      teach: 'THE BALL YOU RELEASE IS ONE STEP BIGGER THAN YOU HELD, FLIES A FIFTH SLOWER AND BURSTS WIDER. IT COSTS THE STAMINA OF THE BIGGER STEP' } },
  spender: { slot: 'spender', ability: 'pips', name: 'THE LIVING BOMB', trade: 'LONG FUSE OR SHORT',
    A: { id: 'pyslowfuse', name: 'SLOW FUSE', input: 'PIPS',
      what: 'PIPS BURN TEN SECONDS BEFORE THEY GO OUT, AND A BURST REACHES A LITTLE FURTHER',
      teach: 'BOMB PIPS LAST 10 S INSTEAD OF 6 AFTER THE LAST ONE, AND A BURST REACHES 16 PX FURTHER' },
    B: { id: 'pyshortfuse', name: 'SHORT FUSE', input: 'PIPS',
      what: 'A FOE GOES UP ON ITS SECOND PIP: A SMALLER BURST THAT STAGGERS THE SMALL',
      teach: 'A FOE BURSTS ON THE SECOND PIP, NOT THE THIRD. THE BURST IS 30% LIGHTER, 14 PX NARROWER, AND STAGGERS A COMMON FOE 0.5 S. BOSSES JUST TAKE THE BLOW' } },
  'skill:firestorm': { slot: 'skill3', ability: 'skill:firestorm', name: 'FIRESTORM', trade: 'ROOTED OR WALKING',
    A: { id: 'pyanchor', name: 'ANCHORED STORM', input: 'F',
      what: 'THE STORM STANDS WHERE YOU CAST IT FOR THREE SECONDS, BURNING EVERYTHING IN IT',
      teach: 'AFTER THE BURST, A STORM OF FIRE STANDS WHERE YOU CAST IT FOR 3 S, BURNING EVERY FOE IN ITS RING EVERY HALF SECOND' },
    B: { id: 'pywalking', name: 'WALKING STORM', input: 'F',
      what: 'THE STORM WALKS WITH YOU FOR THREE SECONDS, ONE THIRD LIGHTER',
      teach: 'AFTER THE BURST, THE STORM FOLLOWS YOU FOR 3 S AT 70% OF THE WEIGHT, BURNING WHAT YOU WALK INTO' } },
  sig: { slot: 'sig', ability: 'heat', name: 'THE HEAT BAR', trade: 'HOLD THE FIRE OR FEED IT',
    A: { id: 'pywhite', name: 'WHITE HEAT', input: 'FULL HEAT BAR',
      what: 'A FULL BAR HOLDS THREE SECONDS LONGER BEFORE IT FALLS',
      teach: 'WHEN THE HEAT BAR FILLS IT HOLDS FOR 3 S MORE (8 S, OR 13 S WITH BLAZE), SO THE ULTIMATE IS EASIER TO LAND' },
    B: { id: 'pybellowed', name: 'BELLOWED', input: 'HEAT BAR',
      what: 'HEAT COMES A QUARTER FASTER, AND FALLS A QUARTER FASTER',
      teach: 'EVERY HIT, STOKE AND PARRY FILLS THE BAR 25% FASTER, AND IT COOLS 25% FASTER WHEN YOU STOP' } },
  'skill:flashover': { slot: 'skill4', ability: 'skill:flashover', name: 'FLASHOVER', trade: 'HARD OR CATCHING',
    A: { id: 'pysearing', name: 'SEARING FLASH', input: 'F',
      what: 'THE FLASH IS TIGHT, AND A BURNING FOE POPS HALF AGAIN AS HARD',
      teach: 'FLASHOVER REACHES 90 PX, NOT 120, BUT A FOE ALREADY BURNING POPS 50% HARDER' },
    B: { id: 'pychainflash', name: 'CHAIN FLASH', input: 'F',
      what: 'EVERY FOE THAT POPS LIGHTS THE FOES NEXT TO IT FOR FOUR SECONDS',
      teach: 'THE POP IS 20% LIGHTER, BUT EACH FOE THAT POPS SETS ALIGHT ANY FOE WITHIN 60 PX OF IT (FOUR SECONDS AND A PIP)' } },
  ult: { slot: 'ult', ability: 'ult', capstone: true, name: 'METEOR FALL', trade: 'ONE OR MANY',
    A: { id: 'pystar', name: 'STAR FALL', input: 'UP+C AT A FULL BAR',
      what: 'ONE GREAT METEOR: A LONGER TELL, A WIDER RING, A HEAVIER BLOW',
      teach: 'THE METEOR TAKES 1.2 S TO FALL, LANDS IN A RING 88 PX WIDE AND HITS HALF AGAIN AS HARD. A BOSS TAKES AT MOST 5%' },
    B: { id: 'pyshower', name: 'METEOR SHOWER', input: 'UP+C AT A FULL BAR',
      what: 'FIVE SMALL METEORS FALL ACROSS THE ROOM AHEAD OF YOU, EACH LEAVING TWO PIPS',
      teach: 'FIVE SMALL METEORS FALL 60 TO 300 PX AHEAD, 0.3 S APART, EACH ONE SNAPPING TO A FOE NEAR ITS SPOT. A BOSS TAKES AT MOST 1.4% FROM EACH' } },
};

/* HER TEN TRAIT FORKS (passiveplan sec 4: a worn trait opens an A/B pair from L20; sides are SMALL). Key 'trait:<id>'; a side reads only while the trait is WORN. FOLDED: blaze and inferno go
   into the L43 heat-bar fork (WHITE HEAT / BELLOWED) and are retired while FORKS_SHIP is on (src/traits-b.js); phoenixTrail is PHOENIX fork B. */
const TF = (id, name, trade, a, b) => ({ trait: id, ability: 'trait:' + id, name, trade, A: { input: 'TRAIT', ...a }, B: { input: 'TRAIT', ...b } });
export const PYRO_TRAIT_FORKS = {
  'trait:emberSkin': TF('emberSkin', 'EMBER SKIN', 'LONG BURN OR A SHOVE',
    { id: 'pyskina', name: 'LONG EMBERS', what: 'WHAT STRIKES YOU BURNS FOUR SECONDS, NOT TWO AND A HALF', teach: 'THE FOE THAT STRIKES YOU BURNS 4 S INSTEAD OF 2.4' },
    { id: 'pyskinb', name: 'COAL SHOVE', what: 'WHAT STRIKES YOU BURNS ONLY A SECOND AND A HALF, BUT IS SHOVED BACK', teach: 'THE FOE THAT STRIKES YOU BURNS 1.5 S AND IS THROWN BACK A STEP (A BOSS IS NOT MOVED)' }),
  'trait:heatShield': TF('heatShield', 'HEAT SHIELD', 'EARLY OR DEEP',
    { id: 'pyshielda', name: 'EARLY SHIELD', what: 'THE SHIELD WORKS FROM A QUARTER OF THE BAR, NOT HALF', teach: 'HEAT SHIELD CUTS INCOMING BLOWS FROM 25 HEAT UP, NOT 50' },
    { id: 'pyshieldb', name: 'DEEP SHIELD', what: 'ONLY ON A HOT BAR, THREE QUARTERS UP, BUT IT CUTS 40%', teach: 'HEAT SHIELD WORKS ONLY FROM 75 HEAT UP, AND CUTS BLOWS BY 40% INSTEAD OF 25%' }),
  'trait:brand': TF('brand', 'BRAND', 'ANY MARK OR ONLY FIRE',
    { id: 'pybranda', name: 'MARKED TOO', what: 'A FOE CARRYING A BOMB PIP COUNTS AS BURNING FOR THE BONUS', teach: 'A FOE WITH A BOMB PIP TAKES THE BRAND BONUS AS IF IT BURNED' },
    { id: 'pybrandb', name: 'SEARING BRAND', what: 'ONLY A BURNING FOE, BUT THE BONUS IS HALF AGAIN AS BIG', teach: 'BRAND NEEDS A FOE THAT IS BURNING, BUT THE BONUS GROWS FROM 50% TO 80%' }),
  'trait:emberHeart': TF('emberHeart', 'EMBER HEART', 'EARLY OR DESPERATE',
    { id: 'pyhearta', name: 'CORNERED', what: 'THE FIRE ANSWERS FROM HALF HEALTH, A LITTLE HARDER', teach: 'BELOW HALF HEALTH YOUR BLOWS LAND 30% HARDER' },
    { id: 'pyheartb', name: 'LAST EMBER', what: 'ONLY BELOW A QUARTER HEALTH, BUT TWICE AS HARD', teach: 'BELOW A QUARTER HEALTH YOUR BLOWS LAND TWICE AS HARD' }),
  'trait:wildfire': TF('wildfire', 'WILDFIRE', 'FAR OR TWICE',
    { id: 'pywilda', name: 'FAR LEAP', what: 'THE EMBER LEAPS TO A BURNING FOE A THIRD AGAIN AS FAR OFF', teach: 'THE EMBER LEAPS TO A BURNING FOE UP TO 60% FURTHER AWAY' },
    { id: 'pywildb', name: 'DOUBLE LEAP', what: 'THE EMBER LEAPS TWICE, TO TWO BURNING FOES IN A ROW', teach: 'THE EMBER LEAPS A SECOND TIME, FROM THE FIRST BURNING FOE TO THE NEXT' }),
  'trait:phoenix': TF('phoenix', 'PHOENIX', 'HIGH RISE OR A TRAIL',
    { id: 'pyphxa', name: 'HIGH RISE', what: 'YOU RISE WITH HALF AGAIN THE HEALTH, AND THE DODGE LEAVES NO TRAIL', teach: 'THE REVIVAL RETURNS 50% MORE HEALTH. THE DODGE LEAVES NO FIRE BEHIND IT' },
    { id: 'pyphxb', name: 'PHOENIX TRAIL', what: 'YOU RISE WITH LESS HEALTH, BUT THE DODGE LEAVES ITS FIRE BEHIND IT', teach: 'THE REVIVAL RETURNS 30% LESS HEALTH, BUT EVERY DODGE LEAVES A TRAIL OF FIRE' }),
  'trait:longFlame': TF('longFlame', 'LONG FLAME', 'LONG OR HOT',
    { id: 'pylonga', name: 'LONG JET', what: 'THE JET REACHES A THIRD FURTHER', teach: 'THE JET OF FLAME (UP+HOLD C) IS 35% LONGER THAN LONG FLAME MADE IT' },
    { id: 'pylongb', name: 'HOT JET', what: 'A SHORTER JET THAT BITES TWICE AS OFTEN', teach: 'THE JET IS 10% SHORTER BUT HITS EVERY 0.28 S INSTEAD OF EVERY 0.4' }),
  'trait:jetWalk': TF('jetWalk', 'WALKING FLAME', 'SURE FOOT OR HOVER',
    { id: 'pyjwa', name: 'SURE FOOT', what: 'WALK AT YOUR FULL PACE WITH THE JET LIT', teach: 'WITH THE JET LIT YOU WALK AT FULL SPEED, WHATEVER THE RANK' },
    { id: 'pyjwb', name: 'HOVER', what: 'THE JET HOLDS YOU UP IN THE AIR MUCH LONGER, BUT YOU WALK SLOWER', teach: 'THE JET HOLDS YOUR FALL TO A CRAWL IN THE AIR, BUT ON THE GROUND YOU WALK 30% SLOWER WITH IT LIT' }),
  'trait:scatter': TF('scatter', 'SCATTER', 'WIDE OR HEAVY',
    { id: 'pyscata', name: 'WIDE SCATTER', what: 'THE EMBER\'S BLAST REACHES ALMOST TWICE AS FAR', teach: 'THE SPARKS OF AN EMBER SHOT REACH 50 PX, NOT 30' },
    { id: 'pyscatb', name: 'HEAVY SCATTER', what: 'THE SAME REACH, BUT THE SPARKS HIT TWICE AS HARD', teach: 'THE SPARKS OF AN EMBER SHOT HIT TWICE AS HARD, ON THE SAME SMALL REACH' }),
  'trait:twin': TF('twin', 'TWIN EMBER', 'HARDER OR THREE',
    { id: 'pytwina', name: 'LONG TWIN', what: 'THE SECOND EMBER HITS HALF AGAIN AS HARD', teach: 'THE HIGH EMBER THAT FOLLOWS THE LOW ONE HITS 50% HARDER' },
    { id: 'pytwinb', name: 'THREE EMBERS', what: 'THREE EMBERS, LOW, MIDDLE AND HIGH, THE EXTRA TWO AT 60%', teach: 'THE EMBER SHOT THROWS A MIDDLE EMBER TOO. THE TWO EXTRA EMBERS EACH HIT AT 60%' }),
};
export const PYRO_FORKS = { ...PYRO_RUNG_FORKS, ...PYRO_TRAIT_FORKS };
