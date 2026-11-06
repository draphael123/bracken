// src/thunder-wyrm.js - THE THUNDER WYRM, the Desert Airship's boss (claude/airship, 11-06, the OPUS greybox; brief-desertairship-1104 s4, plan-desert-1105 s1.12 + s2).
// Pure: no DOM, no main.js. src/airship-hands.js binds it to the storm deck (the burners are the level's stations, the brood are src/wyrmling.js) and draws it.
//
// A STORM SERPENT IN THE CLOUD BANK, coiled round the ship: the camera sees his HEAD over the rail and a COIL across the deck, never all of him.
// THE CENTRAL MECHANIC (B17, from the level's verb): LURE A STRIKE ONTO A STOKED BURNER. His bolts are drawn to the HOT burners: a mark within TW.lureR of a
//   stoked burner sends its bolt into the burner instead of you - it OVERLOADS (spent: stoke it again), the charge GROUNDS through the hull and into him:
//   he REELS = OPEN TW.openT s (x TW.openMul; at most TW.openCap of him a window), a gold ring + a timer (B10). Then a told WARD (B3: a pale shell, TW.wardT s).
// THE STANCE (brief Q3 rec, the concept option): the burners are the ship's lift too. Two hot = the ship rides HIGH: his COIL SLAM cannot reach the deck -
//   his HEAD RISES over the rail instead (TW.headT s at x1.0: strike down at it) - but the COLD bites. None/one hot = LOW: in his coils, warm, and he is
//   faster (rests x TW.lowRest, a tail sweep after every slam).
// NEVER INVULNERABLE (B15): every blow outside an opening lands at TW.floor (0.45x) with a clank and a word. No waiting room (B13): he always comes at you.
// MOVES (each: own windup pose + release pose + own sound; every one answerable):
//   STRIKE   strikeTell 0.9 s: sparks gather on 2-3 deck spots (one under each hero) - '!!' step off; a hot burner beside a mark takes its bolt (the opening)
//   SLAM     slamTell 1.0 s: a coil rises over the rail and slams the deck width-wise - '!!' jump it / stand on the mast stump (HIGH: the head rises instead)
//   ROAR     roarTell 0.8 s (P2): a shove-wave across the deck - '!' block it or brace behind the mast stump
//   TAIL     tailTell 0.7 s: the tail sweeps along the rail - '!!' jump it; it knocks you toward the rail, never off (the rail holds)
//   BROOD    broodTell 0.9 s (P2): he spits two wyrmlings onto the rigging (cap TW.broodCap alive)
// PHASES: P1 (100-55%) strike / slam / strike / tail. P2 (55-0%) the storm builds (darker, rain, music 'thunderwyrm:p2'): two burners FAIL at once and one
//   gutters every TW.gutterT s unless re-stoked; roar + brood join. He dies with a told finisher (his own lightning, then THE CRASH: src/airship-hands.js).
// POSES (B16, art owed ~14): twIdle, twStrikeWind, twStrikeRel, twSlamWind, twSlamRel, twRoarWind, twRoarRel, twTailWind, twTailRel, twBroodWind, twBroodRel,
//   twReel (open), twWard, twHeadUp, twDie. SOUNDS: twStrikeTell, twBolt, twGround, twSlamTell, twSlam, twRoarTell, twRoar, twTailTell, twTail, twBrood, twReel, twWard, twDie.

export const TW = { hp: 2800, w: 40, h: 30, markH: 64, floor: 0.45, openMul: 1.8, openCap: 0.09, openT: 4.0, wardT: 2.5, headT: 1.6, headMul: 1.0, p2At: 0.55,
  lureR: 44, markR: 18, strikeTell: 0.9, slamTell: 1.0, roarTell: 0.8, tailTell: 0.7, broodTell: 0.9, act: 0.3, tailRun: 0.55, rest: [1.1, 0.8], lowRest: 0.7,
  slamH: 16, tailH: 12, broodCap: 2, gutterT: 14, headOff: 72,
  dmg: { strike: 52, slam: 58, roar: 30, tail: 44 } };
export const TW_CYCLE = { 1: ['strike', 'slam', 'strike', 'tail'], 2: ['strike', 'roar', 'slam', 'brood', 'strike', 'tail'] };
export const MOVE_NAME = { strike: 'THE LIGHTNING STRIKE', slam: 'THE COIL SLAM', roar: 'THE THUNDER ROAR', tail: 'THE TAIL SWEEP', brood: 'THE BROOD CALL' };
export const TW_POSES = { idle: 'twIdle', strikeTell: 'twStrikeWind', strike: 'twStrikeRel', slamTell: 'twSlamWind', slam: 'twSlamRel', roarTell: 'twRoarWind', roar: 'twRoarRel',
  tailTell: 'twTailWind', tail: 'twTailRel', broodTell: 'twBroodWind', brood: 'twBroodRel', open: 'twReel', ward: 'twWard', headUp: 'twHeadUp', die: 'twDie' };
export const TW_SOUNDS = { strikeTell: 'twStrikeTell', strike: 'twBolt', ground: 'twGround', slamTell: 'twSlamTell', slam: 'twSlam', roarTell: 'twRoarTell', roar: 'twRoar',
  tailTell: 'twTailTell', tail: 'twTail', broodTell: 'twBrood', open: 'twReel', ward: 'twWard', die: 'twDie' };
const TELL = { strike: 'strikeTell', slam: 'slamTell', roar: 'roarTell', tail: 'tailTell', brood: 'broodTell' };

/* G = { x0, x1, floorY, burners: [{ id, x }], stump: { x0, x1, top } } (px) */
export function newFight(G) {
  return { G, ph: 1, i: 0, mode: 'rest', t: 1.2, move: null, marks: [], head: { x: (G.x0 + G.x1) / 2 + 80, y: G.floorY - 26, tx: (G.x0 + G.x1) / 2 + 80 }, headUp: 0, open: 0, ward: 0,
    openTaken: 0, tail: null, gutter: TW.gutterT, told: {}, n: { strikes: 0, grounded: 0, opens: 0, slams: 0, headUps: 0, roars: 0, tails: 0, broods: 0, warded: 0, floored: 0, gutters: 0 } };
}
export const twOpen = S => S.open > 0;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* w = { heroes(): [{ x, y, ground, alive }], hot(id), spend(id), fail(id), band(): 'high'|'mid'|'low', hit(box, dmg, name, o) -> bool,
         roar(fromX, dmg) (the hands shove whoever is not braced), brood(x, y) -> bool, broodAlive() -> n, say(x, y, text, col), sound(k), fx(k, x, y), music(ph) }
   -> nothing; e.mode is the told mode (marks.js rows 'thunderwyrm|<mode>') */
export function stepWyrm(e, S, dt, w) {
  const G = S.G, hs = w.heroes().filter(h => h.alive), lead = hs[0] || { x: (G.x0 + G.x1) / 2, y: G.floorY };
  S.t -= dt; if (S.open > 0) S.open = Math.max(0, S.open - dt); if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); if (S.headUp > 0) S.headUp = Math.max(0, S.headUp - dt);
  /* the head drifts to its spot over the rail (a reach from the hero, on his far side) */
  S.head.x += (S.head.tx - S.head.x) * Math.min(1, dt * 2.5); S.head.y = G.floorY - 26 - (S.headUp > 0 ? 10 : 0) + Math.sin(S.t * 3) * 2;
  /* PHASE TWO at TW.p2At: the storm builds, two burners fail */
  if (S.ph === 1 && e.hp <= e.maxHp * TW.p2At) { S.ph = 2; S.i = 0; w.music(2); w.say((G.x0 + G.x1) / 2, G.floorY - 120, 'THE STORM BUILDS - HE COILS THE WHOLE SHIP', '#c8b0ff');
    let k = 0; for (const b of G.burners) if (k < 2 && w.hot(b.id)) { w.fail(b.id); k++; } if (k < 2) for (const b of G.burners) if (k < 2) { w.fail(b.id); k++; }
    w.sound('roarTell'); S.n.gutters += 2; }
  if (S.ph === 2) { S.gutter -= dt; if (S.gutter <= 0) { S.gutter = TW.gutterT; const hot = G.burners.filter(b => w.hot(b.id)); if (hot.length) { const b = hot[(S.n.gutters++) % hot.length]; w.fail(b.id); w.say(b.x, G.floorY - 40, 'THE RAIN GUTTERS A BURNER', '#9ab0c0'); } } }
  if (S.open > 0) { e.mode = 'open'; return; }
  if (e.mode === 'open') { e.mode = 'ward'; S.ward = TW.wardT; S.openTaken = 0; w.sound('ward'); w.fx('ward', S.head.x, S.head.y); S.t = TW.wardT * 0.5; return; }
  if (S.t > 0 && (e.mode === 'rest' || e.mode === 'ward')) return;
  const tellOf = m => TELL[m];
  switch (e.mode) {
    case 'rest': case 'ward': case 'sleep': case 'idle': {   /* PICK THE NEXT MOVE */
      const cyc = TW_CYCLE[S.ph]; let m = cyc[S.i % cyc.length]; S.i++;
      if (m === 'brood' && w.broodAlive() >= TW.broodCap) m = 'strike';
      S.move = m; e.mode = tellOf(m); S.t = TW[m + 'Tell']; w.sound(e.mode);
      S.head.tx = clamp(lead.x + (lead.x < (G.x0 + G.x1) / 2 ? TW.headOff : -TW.headOff), G.x0 + 24, G.x1 - 24);
      if (m === 'strike') { S.marks = hs.map(h => ({ x: h.x })); const extra = S.ph === 1 ? 1 : 2; for (let k = 0; k < extra; k++) S.marks.push({ x: clamp(lead.x + (k % 2 ? -1 : 1) * (60 + 30 * k), G.x0 + 16, G.x1 - 16) });
        if (!S.told.lure) { S.told.lure = 1; w.say((G.x0 + G.x1) / 2, G.floorY - 100, 'HIS BOLTS FIND THE HOTTEST THING ON DECK: STAND BY A STOKED BURNER', '#ffd36b'); } }
      if (m === 'slam' && w.band() === 'high' && !S.told.high) { S.told.high = 1; w.say((G.x0 + G.x1) / 2, G.floorY - 100, 'SHE RIDES HIGH: HIS COILS FALL SHORT - HIS HEAD RISES', '#bfe6f5'); }
      if (m === 'tail') { const fromL = lead.x > (G.x0 + G.x1) / 2; S.tail = { x: fromL ? G.x0 : G.x1, dir: fromL ? 1 : -1 }; }
      return; }
    case 'strikeTell': if (S.t <= 0) { e.mode = 'strike'; S.t = TW.act; S.n.strikes++; w.sound('strike');
        let grounded = false;
        for (const mk of S.marks) {
          const b = G.burners.filter(q => w.hot(q.id) && Math.abs(q.x - mk.x) <= TW.lureR).sort((p, q) => Math.abs(p.x - mk.x) - Math.abs(q.x - mk.x))[0];
          if (b) { mk.to = b.x; w.spend(b.id); w.fx('ground', b.x, G.floorY); grounded = true; continue; }
          mk.to = mk.x; w.fx('bolt', mk.x, G.floorY); w.hit([mk.x - TW.markR, mk.x + TW.markR, G.floorY - 60, G.floorY], TW.dmg.strike, MOVE_NAME.strike, { key: 'tws' + S.n.strikes });
        }
        if (grounded) { S.n.grounded++; if (S.ward > 0) { S.n.warded++; w.say(S.head.x, S.head.y - 30, 'HE IS WARDED - THE BOLT DIES IN THE HULL', '#9ab0c0'); }
          else { S.open = TW.openT; S.openTaken = 0; S.n.opens++; e.mode = 'open'; w.sound('open'); w.fx('open', S.head.x, S.head.y); w.say(S.head.x, S.head.y - 34, 'GROUNDED! HE REELS', '#ffd36b'); } } }
      return;
    case 'slamTell': if (S.t <= 0) { e.mode = 'slam'; S.t = TW.act; S.n.slams++; w.sound('slam');
        if (w.band() === 'high') { S.headUp = TW.headT; S.n.headUps++; w.fx('headUp', S.head.x, S.head.y); }
        else { w.fx('slam', (G.x0 + G.x1) / 2, G.floorY); w.hit([G.x0, G.x1, G.floorY - TW.slamH, G.floorY], TW.dmg.slam, MOVE_NAME.slam, { key: 'twc' + S.n.slams, low: true }); } }
      return;
    case 'roarTell': if (S.t <= 0) { e.mode = 'roar'; S.t = TW.act; S.n.roars++; w.sound('roar'); w.fx('roar', S.head.x, S.head.y); w.roar(S.head.x, TW.dmg.roar); } return;
    case 'tailTell': if (S.t <= 0) { e.mode = 'tail'; S.t = TW.tailRun; S.n.tails++; w.sound('tail'); } return;
    case 'tail': { const q = S.tail; if (q) { q.x += q.dir * (G.x1 - G.x0) / TW.tailRun * dt; w.hit([q.x - 20, q.x + 20, G.floorY - TW.tailH, G.floorY], TW.dmg.tail, MOVE_NAME.tail, { key: 'twt' + S.n.tails, low: true, toRail: true }); }
      if (S.t <= 0) { S.tail = null; rest(e, S, w); } return; }
    case 'broodTell': if (S.t <= 0) { e.mode = 'brood'; S.t = TW.act; S.n.broods++; w.sound('brood'); const n = TW.broodCap - w.broodAlive(); for (let k = 0; k < n; k++) w.brood(S.head.x + (k ? 30 : -30), G.floorY - 70); } return;
    case 'strike': case 'roar': case 'brood': if (S.t <= 0) { S.marks = []; rest(e, S, w); } return;
    case 'slam': if (S.t <= 0) { if (w.band() === 'low') S.extraTail = true; rest(e, S, w); } return;   /* LOW: in his coils - a tail sweep follows every slam */
  }
}
function rest(e, S, w) {
  e.mode = 'rest'; S.t = TW.rest[S.ph - 1] * (w.band() === 'low' ? TW.lowRest : 1);
  if (S.extraTail) { S.extraTail = false; const G = S.G, lead = w.heroes()[0] || { x: (G.x0 + G.x1) / 2 }; const fromL = lead.x > (G.x0 + G.x1) / 2; S.move = 'tail'; e.mode = 'tailTell'; S.t = TW.tailTell; S.tail = { x: fromL ? G.x0 : G.x1, dir: fromL ? 1 : -1 }; w.sound('tailTell'); }
}
/* A BLOW ON HIM -> { dmg, word } : open x openMul (capped a window), head up x headMul, else the floor (warded or his scales) - never 0 once the fight is on */
export function twTake(e, S, dmg) {
  if (e.mode === 'sleep' || e.mode === 'wake') return { dmg: 0, word: '' };
  if (S.open > 0) { const cap = e.maxHp * TW.openCap, d = Math.min(dmg * TW.openMul, Math.max(dmg * TW.floor, cap - S.openTaken)); S.openTaken += d; return { dmg: d, word: '' }; }
  if (S.headUp > 0) return { dmg: dmg * TW.headMul, word: '' };
  S.n.floored++; if (S.ward > 0) S.n.warded++;
  return { dmg: dmg * TW.floor, word: S.ward > 0 ? 'WARDED' : S.n.floored < 6 ? 'HIS SCALES: BOLT HIM INTO A STOKED BURNER' : 'HIS SCALES' };
}
export const twBarName = (e, S) => 'THE THUNDER WYRM' + (!S ? '' : S.open > 0 ? '  OPEN' : S.headUp > 0 ? '  HEAD UP' : S.ward > 0 ? '  WARDED' : '');
