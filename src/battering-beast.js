// src/battering-beast.js - THE BATTERING BEAST, THE PALISADE WOOD's boss (claude/palisadewood, the OPUS GREYBOX, 2026-10-24; brief scratch/brief-palisadewood-1015.md, Daniel's pick).
// REWORKED (claude/palisade2, 10-25; scratch/brief-palisade2-1025.md, Daniel 10-25 07:40: "at least one more attack in each phase" + "it feels like the first boss with goblins on him").
// The overlap was OLD TUSKER (the Lumber Trail, the game's first boss): charge / tusk sweep / thrown clods / stomp waves / a felled thing on him. The beats that echoed him are
// recast so the two phases are two different fights:
//   P1 = THE SIEGE ENGINE. The HANDLERS drive and the beast is the engine. Every attack is a HANDLER'S ORDER, told by a FLAG raised on the gantry and the order shouted
//        (RAM IT / SWING THE RAM / STAKES / PITCH / BATTER THE SCAFFOLD) before his own windup pose.
//   P2 = THE BEAST UNCHAINED. At half he rears and the chains SNAP: he bucks the handlers off (they fight on foot - two, low health), bolts into the palisade's end and
//        smashes it (LOOSE, a short opening), and from then on nobody steers him: no flags, no orders, wild and fast, his broken chain dragging.
// This file is the fight, PURE (his moves, his two phases, the clearing's two scaffolds, what a blow does to him, and the bot's plan);
// src/battering-beast-hands.js binds it to the world (main.js) and draws him. tools/palisadewood.mjs checks it.
// HEADER (design-standard B11 / B14 / B15): A BEAST BOSS WITH A RULE OPENING. He is ALWAYS HITTABLE, never invulnerable:
//   HIS ARMOUR TURNS A CUT: a blow lands at BB.armour (0.4, the B15 floor; told: a clank and ARMOURED). COME DOWN ON HIS BACK (a plunge) and it lands whole.
//   THE LEVEL'S RULE IS HIS OPENING (B1): "knock out a prop and what it holds comes down". Two SCAFFOLDS stand in the clearing, each on a PROP at its inner foot;
//     ONE BLOW knocks the prop out and the scaffold TIPS INTO THE CLEARING (its fall line drawn on the floor - gold, red while he stands in it):
//       ON HIM            he is tangled in the timber: STUCK (the shared OPEN read, B10: gold ring + timer), blows x BB.stuck.mul for BB.stuck.t
//       IN HIS PATH       the wreck lies across the floor - a wall to him; a CHARGE that meets it RAMS INTO IT and STICKS (the same STUCK)
//       a wreck he rams or heaves off is spent; the crew props the scaffold back up BB.scaf.rearm s later (told: a creak, the frame rising)
//   HE CRASHES INTO WHAT IS BEHIND YOU: a charge that meets the wall or THE OLD GATE jars him - DAZED (short, x BB.daze.mul).
//   THE WARD (B3): when STUCK ends he tears out of the timber - a told ~3 s ward (a pale ring, WARDED on every blow, a scaffold dropped on him bounces off).
//   EVERY MOVE TOLD with its own windup and release pose (B16) and its own sound:
//     P1 (100-50%)  1 RAM IT        (horn + red flag: the charge - jump onto a deck, step aside, or have a wreck between you)
//                   2 SWING THE RAM (whip + yellow flag: the ram swings OUT on its chains and BACK - two low passes, jump both; a block holds but jars)
//                   3 STAKES        (the handlers stand and throw stakes - red rings where they land: move off)
//                   4 PITCH  (NEW)  (a handler lights a pot and lobs two - they burst into BURNING PITCH on the floor for a few seconds: keep off it)
//                   5 BATTER THE SCAFFOLD (NEW) (you stand on a deck: he rams its posts, it SHAKES for a told beat and COLLAPSES - get off it; knock its prop
//                                    while he batters and it comes down ON HIM instead)
//     P2 (50-0%)    THE CHAINS SNAP (the set piece): the handlers are thrown off (two on foot), he smashes into the palisade (LOOSE), then:
//                   1 THE CHARGE, wilder (shorter tell, faster)   2 THE TRAMPLE (he rears and stamps: a shockwave runs out both ways - jump the ring)
//                   3 THE CHAIN FLAIL (NEW) (the broken ram chain whips a wide arc in front of him: LOW = jump it; HIGH = stay on the ground)
//                   4 THE BUCK (NEW) (hug his flank and he turns his rump on you and kicks: back off, block, or jump)
//                   + THE HANDLERS ON FOOT (NEW): the goblins are a problem he made, not riders.
export const BB = {
  hp: 1350, w: 56, h: 40, markH: 60,
  walk: 46, rest: [0.7, 0.45],
  armour: 0.4, above: 1, wardMul: 0.4,
  p2: 0.5,
  charge: { tell: [1.0, 0.8], speed: 280, sp2: 1.08, dmg: 12, hitH: 24, minD: 110 },
  daze: { t: [1.7, 1.4], mul: 1.25 },
  stuck: { t: 3.0, mul: 2, cap: 0.11, ward: 3, wreckBlow: 0.03 },
  sweep: { tell: [0.78, 0.62], t: 0.42, mid: 0.3, reach: 50, h: 14, dmg: 15, chip: 0.8, rec: 0.6, range: 80 },
  volley: { tell: [0.95, 0.8], n: 3, flight: 1.0, r: 16, dmg: 12, rec: 0.6, spread: 62 },
  pots: { tell: 0.95, n: 2, flight: 0.95, r: 18, life: 2.6, tick: 0.45, dmg: 5, spread: 58, rec: 0.6 },
  batter: { tell: 0.8, shake: 1.25, dmg: 14, reach: 96 },
  trample: { tell: 0.85, sp: 150, life: 1.9, dmg: 14, rec: 0.8, w: 7 },
  flail: { tell: 0.85, t: 0.36, reach: 132, low: 14, hiTop: 40, hiBot: 18, dmg: 13, rec: 0.7 },
  kick: { tell: 0.6, t: 0.22, reach: 46, dmg: 14, chip: 0.6, rec: 0.5, range: 44 },
  scaf: { fall: 0.5, len: 6, heroDmg: 10, lie: 16, rearm: 11 },
  unchain: { tell: 1.0, adds: 2, addHp: 2.4 },
  harness: { loose: 2.6, mul: 2, cap: 0.08 },
  bz: { hurt: 1.6 },
};
export const BB_SAY = { wake: 'THE BATTERING BEAST', rule: 'KNOCK OUT A SCAFFOLD PROP: ON HIM, OR IN HIS PATH, HE STICKS IN THE WRECK.', p2: 'THE CHAINS SNAP',
  stuck: 'STUCK IN THE WRECK', dazed: 'HE CRASHES INTO THE WALL', gate: 'THE OLD GATE HOLDS', bounce: 'IT BOUNCES OFF HIM: WARDED', ward: 'HE TEARS OUT OF THE TIMBER',
  jarred: 'JARRED: JUMP THE RAM', creak: 'THE SCAFFOLD TIPS', rebuilt: 'THE CREW PROPS IT BACK UP', loose: 'HE BUCKS THEM OFF AND SMASHES THE PALISADE',
  oRam: 'RAM IT!', oSwing: 'SWING THE RAM!', oStakes: 'STAKES!', oPitch: 'PITCH!', oBatter: 'BATTER THE SCAFFOLD!',
  shake: 'THE SCAFFOLD SHAKES: GET OFF', collapse: 'THE SCAFFOLD COLLAPSES', burn: 'BURNING PITCH', thrown: 'THE HANDLERS FIGHT ON FOOT',
  flailLo: 'THE CHAIN: LOW - JUMP', flailHi: 'THE CHAIN: HIGH - STAY DOWN', buck: 'HE BUCKS' };
export const OPEN_NAME = { stuck: 'STUCK', dazed: 'DAZED', loose: 'LOOSE' };
/* THE ORDERS (P1): the flag the handlers raise and the word they shout, per move - drawn by the hands over his gantry (src/battering-beast-hands.js) */
export const ORDER = { chargeTell: { say: 'oRam', flag: '#ff4a2a' }, sweepTell: { say: 'oSwing', flag: '#ffd36b' }, volleyTell: { say: 'oStakes', flag: '#ff9a5c' },
  potTell: { say: 'oPitch', flag: '#ff6a1a' }, batterTell: { say: 'oBatter', flag: '#c83a2a' } };
export const bbOpen = e => !!e && (e.mode === 'stuck' || e.mode === 'dazed' || e.mode === 'loose');
const TELLS = new Set(['chargeTell', 'sweepTell', 'sweepMid', 'volleyTell', 'trampleTell', 'potTell', 'batterTell', 'flailTell', 'kickTell', 'unchain']);
export const bbTelling = e => TELLS.has(e.mode);
/* THE CLEARING (px): x0/x1 inside the walls, floorY, and the scaffolds: arena.scaffolds = [{ x0, x1, row, prop, dir }] (tile columns; dir: the way it tips, +1 east) */
export function geom(A, TS = 16) {
  const scafs = (A.scaffolds || []).map((s, i) => ({ id: i, x0: s.x0 * TS, x1: (s.x1 + 1) * TS, deckY: s.row * TS, x: s.prop * TS + 8, dir: s.dir, cols: [s.x0, s.x1, s.row] }));
  return { x0: A.x0, x1: A.x1, floorY: A.floor, mid: (A.x0 + A.x1) / 2, scafs, gateX: A.x0, TS };
}
/* a scaffold's fall line on the floor (px): from its prop, BB.scaf.len tiles into the clearing */
export const lineOf = s => { const a = s.x + s.dir * 4, b = s.x + s.dir * (4 + BB.scaf.len * 16); return [Math.min(a, b), Math.max(a, b)]; };
export const underLine = (s, x, half = 0) => { const [lo, hi] = lineOf(s); return x + half > lo && x - half < hi; };
/* the standing scaffold a hero stands on (its deck), or null */
export const deckUnder = (S, h) => S.scafs.find(s => s.st === 'stand' && h && h.ground && Math.abs(h.y - s.deckY) < 4 && h.x > s.x0 - 2 && h.x < s.x1 + 2) || null;
/* where he stands to batter a scaffold: against its posts, on its inner (clearing) side */
export const batterX = s => s.dir > 0 ? s.x1 + BB.w / 2 - 6 : s.x0 - BB.w / 2 + 6;
export function newFight(G) {
  return { G, ph: 1, ward: 0, act: 0, last: [], walkT: 0, restT: 1, stakes: [], pots: [], fires: [], waves: [], adds: [], told: {}, harness: { hits: 0, cut: false },
    n: { charge: 0, sweep: 0, volley: 0, trample: 0, pots: 0, batter: 0, collapse: 0, flail: 0, kick: 0, stuck: 0, dazed: 0, bounced: 0, knocks: 0, wreckRams: 0, loose: 0 },
    scafs: G.scafs.map(s => ({ ...s, st: 'stand', t: 0, shake: 0 })) };
}
export const wrecks = S => S.scafs.filter(s => s.st === 'down');
export const wreckEnd = (s, dir) => { const [lo, hi] = lineOf(s); return dir > 0 ? lo : hi; };
/* what stops his charge (and his walk), going dir from x: the nearest wreck whose near end is ahead of him, else the wall */
export function chargeStop(S, x, dir) {
  const half = BB.w / 2, G = S.G; let best = null, bd = Infinity;
  for (const s of wrecks(S)) { const d = (wreckEnd(s, dir) - x) * dir; if (d > half - 6 && d < bd) { best = s; bd = d; } }
  if (best) return { x: wreckEnd(best, dir) - dir * (half + 3), scaf: best };
  return { x: dir > 0 ? G.x1 - half - 2 : G.x0 + half + 2, scaf: null };
}
export const wreckBetween = (S, x, hx) => { const dir = Math.sign(hx - x) || 1; return wrecks(S).find(s => { const n = wreckEnd(s, dir); return (n - x) * dir > BB.w / 2 - 6 && (hx - n) * dir > 0; }) || null; };
/* A HERO'S BLOW on a prop: the scaffold tips */
export function knockProp(S, s, w) {
  if (!s || s.st !== 'stand') return false;
  s.st = 'fall'; s.t = BB.scaf.fall; s.shake = 0; S.n.knocks++; w.sound('creak'); w.deck(s.id, false);
  if (!S.told['knock' + s.id]) { S.told['knock' + s.id] = 1; w.number(s.x, S.G.floorY - 70, BB_SAY.creak, '#ffd36b'); }
  return true;
}
/* THE FLAIL's band (px): in front of him, LOW (jump it) or HIGH (stay on the ground under it) */
export function flailBox(e, S) { const f = e.face || 1, half = BB.w / 2, fy = S.G.floorY, a = e.x + f * (half - 10), b = e.x + f * (half + BB.flail.reach);
  return S.flailHigh ? [Math.min(a, b), Math.max(a, b), fy - BB.flail.hiTop, fy - BB.flail.hiBot] : [Math.min(a, b), Math.max(a, b), fy - BB.flail.low, fy]; }
/* THE BUCK's box (px): behind him (he turned his rump on you) */
export function kickBox(e, S) { const f = e.face || 1, half = BB.w / 2, fy = S.G.floorY, a = e.x - f * (half - 8), b = e.x - f * (half + BB.kick.reach); return [Math.min(a, b), Math.max(a, b), fy - 30, fy]; }
/* ---------- ONE FRAME OF HIM. heroes: [{ x, y, ground, alive, pp }]; w: the world (src/battering-beast-hands.js world()) ---------- */
export function stepBeast(e, S, dt, heroes, w) {
  const G = S.G, ph = S.ph, i = ph - 1, P = heroes.find(h => h.alive) || heroes[0];
  S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  stepScafs(e, S, dt, heroes, w);
  stepStakes(S, dt, w); stepPots(S, dt, heroes, w); stepWaves(S, dt, heroes, w);
  S.adds = S.adds.filter(a => a && a.alive);
  if (e.mode === 'sleep') return;
  e.modeT -= dt;
  const dx = P ? P.x - e.x : 0, ad = Math.abs(dx);
  S.deck = P ? deckUnder(S, P) : null;
  if (S.ph < 2 && e.hp <= e.maxHp * BB.p2 && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = 2; e.phase = 2; w.number(e.x, e.y - BB.h - 30, BB_SAY.p2, '#ff6b6b'); w.sound('rear'); w.shake(6); w.music(2);
    e.mode = 'unchain'; e.modeT = BB.unchain.tell; w.mark('!!'); S.act++; S.pots = []; return; }
  const face = () => { if (P) e.face = Math.sign(dx) || e.face; };
  const half = BB.w / 2, floor = G.floorY;
  const slide = vx => { if (!vx) return; const sg = Math.sign(vx); let x = Math.max(G.x0 + half + 2, Math.min(G.x1 - half - 2, e.x + vx * dt));
    const st = chargeStop(S, e.x, sg); if (st.scaf && (x - st.x) * sg > 0) x = (e.x - st.x) * sg > 0 ? e.x : st.x; e.x = x; };
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0; S.restT = 0.6; } return;
    case 'walk': {
      face(); S.restT -= dt;
      const goal = S.deck && ph < 2 ? batterX(S.deck) : null;   /* you stand on a deck: he comes to its posts */
      if (goal != null) slide(Math.abs(goal - e.x) > 6 ? Math.sign(goal - e.x) * BB.walk * 1.2 : 0);
      else slide(ad > BB.sweep.range - 10 ? Math.sign(dx) * BB.walk * (ph > 1 ? 1.25 : 1) : 0);
      S.walkT += dt;
      if (S.restT > 0 || !P || !P.alive) return;
      S.coverP = P && wreckBetween(S, e.x, P.x) ? 1 : 0;
      pick(e, S, ad, dx, w); return; }
    case 'chargeTell':
      if (e.modeT > BB.charge.tell[i] * 0.45) face();
      if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 4; e.hitKey = 'ch' + S.act; w.sound('charge'); }
      return;
    case 'charge': {
      const sp = BB.charge.speed * (ph > 1 ? BB.charge.sp2 : 1), st = chargeStop(S, e.x, e.face);
      const nx = e.x + e.face * sp * dt; w.dust(e.x - e.face * half, floor, 1);
      w.hit([e.x - half + 4, e.x + half + 6 * e.face, floor - BB.charge.hitH, floor], BB.charge.dmg, 'charge', { key: e.hitKey, knock: e.face * 240 });
      if ((st.x - nx) * e.face <= 0 || e.modeT <= 0) { e.x = st.x; w.shake(7); w.sound('ram'); w.dust(e.x + e.face * half, floor - 10, 10);
        if (st.scaf) { const s = S.scafs[st.scaf.id]; s.st = 'spent'; s.t = BB.scaf.rearm; S.n.wreckRams++; w.splinter(s); stick(e, S, w); return; }
        e.mode = 'dazed'; e.modeT = BB.daze.t[i]; e.openT0 = e.modeT; S.n.dazed++; w.number(e.x, e.y - BB.h - 24, e.face < 0 ? BB_SAY.gate : BB_SAY.dazed, '#ffd36b'); if (e.face < 0) w.gate(); return; }
      e.x = nx; return; }
    case 'dazed': if (e.modeT <= 0) { e.mode = 'walk'; S.restT = BB.rest[i] * 0.6; } return;
    /* SWING THE RAM: OUT on its chains (the front), a beat, and BACK (behind him and through the front again) - two low passes */
    case 'sweepTell': if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = BB.sweep.t; e.hitKey = 'sw' + S.act; w.sound('sweep'); } return;
    case 'sweep': case 'sweepBack': {
      const back = e.mode === 'sweepBack', f = back ? -e.face : e.face, a = e.x - half - BB.sweep.reach * 0.5, b = e.x + half + BB.sweep.reach * 0.5;
      const lo = f > 0 ? e.x - half : a, hi = f > 0 ? b : e.x + half;
      const k = 1 - e.modeT / BB.sweep.t, l2 = k < 0.5 ? lo : a, h2 = k < 0.5 ? hi : b;
      w.hit([l2, h2, floor - BB.sweep.h, floor], BB.sweep.dmg, 'sweep', { key: e.hitKey + (back ? 'b' : ''), blockable: true, blockChip: BB.sweep.chip, knock: f * 160 });
      if (e.modeT <= 0) { if (!back) { e.mode = 'sweepMid'; e.modeT = BB.sweep.mid; } else { e.mode = 'recover'; e.modeT = BB.sweep.rec; } } return; }
    case 'sweepMid': if (e.modeT <= 0) { e.mode = 'sweepBack'; e.modeT = BB.sweep.t; w.sound('sweep'); } return;
    case 'volleyTell': if (e.modeT <= 0) { e.mode = 'volley'; e.modeT = 0.35; w.sound('throw'); const px = P ? P.x : e.x, py = P && P.ground ? P.y : floor, sp = BB.volley.spread;   /* (they throw at where you STAND - a scaffold deck too) */
        const ts = [px, px - sp, px + sp].slice(0, BB.volley.n).map(x => Math.max(G.x0 + 10, Math.min(G.x1 - 10, x)));
        for (const tx of ts) S.stakes.push({ x0: e.x, y0: floor - BB.h - 10, tx, ty: Math.abs(tx - px) < 4 ? py : floor, t: 0, T: BB.volley.flight, key: 'vs' + S.act + '.' + tx.toFixed(0) }); }
      return;
    case 'volley': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = BB.volley.rec; } return;
    /* PITCH: a handler lights a pot and lobs two at the floor round you; each bursts into a pool of BURNING PITCH (zone control) */
    case 'potTell': if (e.modeT <= 0) { e.mode = 'pot'; e.modeT = 0.35; w.sound('throw'); const px = P ? P.x : e.x, sp = BB.pots.spread, sd = Math.sign(e.x - px) || 1;
        const ts = [px, px + sd * sp].slice(0, BB.pots.n).map(x => Math.max(G.x0 + 14, Math.min(G.x1 - 14, x)));
        for (const tx of ts) S.pots.push({ x0: e.x - 6, y0: floor - BB.h - 16, tx, ty: floor, t: 0, T: BB.pots.flight, key: 'pt' + S.act + '.' + tx.toFixed(0) }); }
      return;
    case 'pot': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = BB.pots.rec; } return;
    /* BATTER THE SCAFFOLD: he puts the ram to its posts; it SHAKES (told) and then COLLAPSES under whoever is on it - unless its prop is knocked first (then it tips ON him) */
    case 'batterTell': { const s = S.scafs[e.batterId]; if (s) { const gx = batterX(s); e.face = Math.sign(s.x0 + (s.x1 - s.x0) / 2 - e.x) || e.face; if (Math.abs(gx - e.x) > 3) slide(Math.sign(gx - e.x) * BB.walk * 2.2); }
      if (e.modeT <= 0) { e.mode = 'batter'; e.modeT = BB.batter.shake; w.sound('ram'); w.shake(5); if (s && s.st === 'stand') { s.shake = BB.batter.shake; w.number(s.x0 + (s.x1 - s.x0) / 2, s.deckY - 20, BB_SAY.shake, '#ff9a5c'); } }
      return; }
    case 'batter': { const s = S.scafs[e.batterId];
      if (e.modeT <= 0) { if (s && s.st === 'stand') { s.st = 'spent'; s.t = BB.scaf.rearm; s.shake = 0; w.deck(s.id, false); w.splinter(s); w.sound('timber'); w.shake(7); S.n.collapse++; w.number(s.x0 + (s.x1 - s.x0) / 2, s.deckY - 20, BB_SAY.collapse, '#ff6b6b');
          for (const h of heroes) if (h.alive && Math.abs(h.y - s.deckY) < 6 && h.x > s.x0 - 4 && h.x < s.x1 + 4) w.hitHero(h, BB.batter.dmg, 'batter', 'bt' + S.act); }
        e.mode = 'recover'; e.modeT = BB.sweep.rec; }
      return; }
    case 'trampleTell': if (e.modeT <= 0) { e.mode = 'trample'; e.modeT = 0.3; w.sound('stomp'); w.shake(8); w.dust(e.x, floor, 14);
        for (const d of [-1, 1]) S.waves.push({ x: e.x + d * (half - 6), dir: d, life: BB.trample.life, key: 'wv' + S.act + d }); }
      return;
    case 'trample': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = BB.trample.rec; } return;
    /* THE CHAIN FLAIL (P2): the broken ram chain whipped in a wide arc in front of him - LOW (jump) or HIGH (stay on the ground) */
    case 'flailTell': if (e.modeT > BB.flail.tell * 0.5) face(); if (e.modeT <= 0) { e.mode = 'flail'; e.modeT = BB.flail.t; e.hitKey = 'fl' + S.act; w.sound('sweep'); } return;
    case 'flail': { const bx = flailBox(e, S); w.hit(bx, BB.flail.dmg, 'flail', { key: e.hitKey, knock: e.face * 180 }); if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = BB.flail.rec; } return; }
    /* THE BUCK (P2): close to his flank he turns his rump on you and kicks */
    case 'kickTell': if (e.modeT <= 0) { e.mode = 'kick'; e.modeT = BB.kick.t; e.hitKey = 'kk' + S.act; w.sound('stomp'); } return;
    case 'kick': { w.hit(kickBox(e, S), BB.kick.dmg, 'buck', { key: e.hitKey, blockable: true, blockChip: BB.kick.chip, knock: -e.face * 220 }); if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = BB.kick.rec; } return; }
    case 'recover': if (e.modeT <= 0) { e.mode = 'walk'; S.restT = BB.rest[i]; } return;
    case 'stuck': if (e.modeT <= 0) { e.mode = 'tear'; e.modeT = 0.5; w.sound('roar'); w.shake(5); } return;
    case 'tear': if (e.modeT <= 0) { e.mode = 'walk'; S.restT = 0.4; S.ward = BB.stuck.ward; e.ward = S.ward; w.fx('ward', e.x, e.y); w.number(e.x, e.y - BB.h - 24, BB_SAY.ward, '#c8d8e8');
        for (const s of S.scafs) if (s.st === 'pin') { s.st = 'spent'; s.t = BB.scaf.rearm; w.splinter(s); } }
      return;
    /* THE CHAINS SNAP (the phase change): he rears, the chains part, he bucks the handlers off (they fight on foot) and bolts for the palisade */
    case 'unchain': if (e.modeT <= 0) { S.harness.cut = true; S.n.loose++; S.stakes = []; w.loose();
        const n = BB.unchain.adds; for (let k = 0; k < n; k++) { const a = w.add(e.x + (k ? 1 : -1) * 22, floor, k ? 1 : -1); if (a) S.adds.push(a); }
        if (!S.told.thrown) { S.told.thrown = 1; w.number(e.x, e.y - BB.h - 44, BB_SAY.thrown, '#ff9a5c'); }
        e.mode = 'loose'; e.modeT = BB.harness.loose + 0.8; e.openT0 = e.modeT; S.purse = e.maxHp * BB.harness.cap; w.number(e.x, e.y - BB.h - 30, BB_SAY.loose, '#ffd36b'); w.sound('roar'); w.shake(8); w.fx('open', e.x, e.y); }
      return;
    case 'loose': {   /* THE SET PIECE: he bolts at the palisade (the east wall) and batters it; he stands there, open, till it ends */
      const tx = G.x1 - half - 2; if (Math.abs(e.x - tx) > 4) { e.face = 1; e.x = Math.min(tx, e.x + 200 * dt); w.dust(e.x - half, floor, 1); } else if (!e.smashed) { e.smashed = true; w.shake(9); w.sound('ram'); w.palisade(); }
      if (e.modeT <= 0) { e.mode = 'tear'; e.modeT = 0.5; e.smashed = false; } return; }
    default: e.mode = 'walk';
  }
}
function stick(e, S, w) { e.mode = 'stuck'; e.modeT = BB.stuck.t; e.openT0 = e.modeT; S.purse = e.maxHp * BB.stuck.cap; S.n.stuck++; w.number(e.x, e.y - BB.h - 24, BB_SAY.stuck, '#ffd36b'); w.fx('open', e.x, e.y); w.trunkBlow(Math.max(1, Math.round(e.maxHp * BB.stuck.wreckBlow))); }
/* WHICH MOVE. P1 (the handlers' orders): on a deck, BATTER IT; close, SWING THE RAM; at range RAM IT, STAKES or PITCH. P2 (unchained): hugging him, THE BUCK; close, the flail
   or the trample; at range the charge, the flail or the trample. Never the same move three times running. */
function pick(e, S, ad, dx, w) {
  const ph = S.ph, i = ph - 1, last = S.last, twice = k => last.length >= 2 && last[0] === k && last[1] === k, r = Math.random();
  let k; const cover = S.coverP;
  if (ph < 2) {
    const dk = S.deck;
    if (dk && Math.abs(batterX(dk) - e.x) < 8 && !twice('batter')) k = 'batter';
    else if (dk) { if (S.walkT < 1.4) return; k = r < 0.5 ? 'volley' : 'pots'; }
    else if (cover) k = r < 0.35 && !twice('volley') ? 'volley' : r < 0.6 ? 'pots' : 'charge';
    else if (ad < BB.sweep.range) k = 'sweep';
    else if (ad > BB.charge.minD) k = r < 0.5 ? 'charge' : r < 0.78 ? 'volley' : 'pots';
    else { if (S.walkT < 1.1) return; k = r < 0.35 ? 'volley' : r < 0.65 ? 'pots' : 'charge'; }
    if (twice(k)) k = k === 'charge' ? 'volley' : k === 'sweep' ? 'charge' : k === 'pots' ? 'charge' : 'pots';
    if (k === 'charge' && ad < 54 && !cover) k = 'sweep';
  } else {
    if (cover) k = r < 0.5 ? 'trample' : 'charge';
    else if (ad < BB.kick.range) k = !twice('kick') ? 'kick' : 'trample';
    else if (ad < BB.sweep.range + 20) k = r < 0.55 ? 'flail' : 'trample';
    else if (ad > BB.charge.minD + 40) k = r < 0.45 ? 'charge' : r < 0.75 ? 'flail' : 'trample';
    else k = r < 0.55 ? 'flail' : r < 0.8 ? 'trample' : 'charge';
    if (twice(k)) k = k === 'flail' ? 'trample' : k === 'trample' ? 'flail' : k === 'charge' ? 'flail' : 'trample';
    if (k === 'charge' && ad < 54 && !cover) k = 'flail';
  }
  last.unshift(k); last.length = Math.min(last.length, 3); S.walkT = 0; S.act++; S.n[k]++;
  const order = m => { if (ph < 2 && ORDER[m]) { w.number(e.x - 10, e.y - BB.h - 40, BB_SAY[ORDER[m].say], ORDER[m].flag); w.sound('horn'); } };
  if (k === 'charge') { e.mode = 'chargeTell'; e.modeT = BB.charge.tell[i]; w.mark('!!'); w.sound('snort'); }
  else if (k === 'sweep') { e.mode = 'sweepTell'; e.modeT = BB.sweep.tell[i]; w.mark('!'); w.sound('grunt'); }
  else if (k === 'volley') { e.mode = 'volleyTell'; e.modeT = BB.volley.tell[i]; w.mark('!!'); w.sound('shout'); }
  else if (k === 'pots') { e.mode = 'potTell'; e.modeT = BB.pots.tell; w.mark('!!'); w.sound('shout'); }
  else if (k === 'batter') { e.mode = 'batterTell'; e.modeT = BB.batter.tell; e.batterId = S.deck.id; w.mark('!!'); w.sound('snort'); }
  else if (k === 'flail') { e.mode = 'flailTell'; e.modeT = BB.flail.tell; S.flailHigh = Math.random() < 0.5; w.mark(S.flailHigh ? '!!' : '!'); w.sound('grunt'); w.number(e.x, e.y - BB.h - 40, S.flailHigh ? BB_SAY.flailHi : BB_SAY.flailLo, S.flailHigh ? '#ff6b6b' : '#ffd36b'); }
  else if (k === 'kick') { e.mode = 'kickTell'; e.modeT = BB.kick.tell; e.face = -(Math.sign(dx) || e.face); w.mark('!'); w.sound('snort'); if (!S.told.buck) { S.told.buck = 1; w.number(e.x, e.y - BB.h - 40, BB_SAY.buck, '#ffd36b'); } }
  else { e.mode = 'trampleTell'; e.modeT = BB.trample.tell; w.mark('!!'); w.sound('rear'); }
  order(e.mode);
}
/* THE SCAFFOLDS: a knocked scaffold tips for BB.scaf.fall, then lands - on him (STUCK, unless warded: it bounces off), on a hero under its line (it hurts), or on the empty floor (a wreck) */
function stepScafs(e, S, dt, heroes, w) {
  for (const s of S.scafs) {
    if (s.shake > 0) s.shake = Math.max(0, s.shake - dt);
    if (s.st === 'fall') { s.t -= dt; if (s.t > 0) continue;
      s.st = 'down'; s.t = BB.scaf.lie; w.sound('timber'); w.shake(7); const [lo, hi] = lineOf(s); for (let k = 0; k < 6; k++) w.dust(lo + (hi - lo) * k / 5, S.G.floorY, 4);
      for (const h of heroes) if (h.alive && Math.abs(h.y - S.G.floorY) < 20 && underLine(s, h.x, 4)) w.hitHero(h, BB.scaf.heroDmg, 'scaffold');
      if (e.alive && e.mode !== 'sleep' && e.mode !== 'loose' && e.mode !== 'unchain' && underLine(s, e.x, BB.w / 2 - 6)) {
        if (S.ward > 0 || e.mode === 'tear' || e.mode === 'stuck') { S.n.bounced++; w.number(e.x, e.y - BB.h - 24, BB_SAY.bounce, '#c8d8e8'); w.sound('clank'); s.st = 'spent'; s.t = BB.scaf.rearm; w.splinter(s); }
        else { s.st = 'pin'; stick(e, S, w); } }
      continue; }
    if (s.st === 'down') { s.t -= dt; if (s.t <= 0) { s.st = 'spent'; s.t = BB.scaf.rearm; w.splinter(s); } continue; }
    if (s.st === 'spent') { s.t -= dt; if (s.t <= 0 && !(e.alive && e.x + BB.w / 2 > s.x0 && e.x - BB.w / 2 < s.x1)) { s.st = 'stand'; w.deck(s.id, true); w.sound('creak'); if (!S.told.rebuilt) { S.told.rebuilt = 1; w.number(s.x, S.G.floorY - 70, BB_SAY.rebuilt, '#c9b27c'); } } }
  }
}
function stepStakes(S, dt, w) {
  for (const c of S.stakes) { c.t += dt; if (c.t < c.T || c.done) continue; c.done = true; const ty = c.ty ?? S.G.floorY; w.dust(c.tx, ty, 6); w.sound('stake');
    w.hit([c.tx - BB.volley.r, c.tx + BB.volley.r, ty - 22, ty + 2], BB.volley.dmg, 'volley', { key: c.key }); }
  S.stakes = S.stakes.filter(c => !c.done);
}
/* THE PITCH POTS: in flight a red ring marks where each lands; landed, a pool of BURNING PITCH on the floor - it burns whoever stands in it every BB.pots.tick s */
function stepPots(S, dt, heroes, w) {
  for (const c of S.pots) { c.t += dt; if (c.t < c.T || c.done) continue; c.done = true; w.dust(c.tx, c.ty, 4); w.sound('burst');
    S.fires.push({ x: c.tx, life: BB.pots.life, key: c.key, tick: 0, n: 0 }); if (!S.told.burn) { S.told.burn = 1; w.number(c.tx, c.ty - 26, BB_SAY.burn, '#ff9a5c'); } }
  S.pots = S.pots.filter(c => !c.done);
  for (const f of S.fires) { f.life -= dt; f.tick -= dt; if (f.tick > 0) continue; f.tick = BB.pots.tick; f.n++;
    for (const h of heroes) if (h.alive && h.ground && Math.abs(h.y - S.G.floorY) < 6 && Math.abs(h.x - f.x) < BB.pots.r) w.hitHero(h, BB.pots.dmg, 'pitch', f.key + '.' + f.n); }
  S.fires = S.fires.filter(f => f.life > 0);
}
function stepWaves(S, dt, heroes, w) {
  for (const q of S.waves) { q.life -= dt; q.x += q.dir * BB.trample.sp * dt; if (q.x < S.G.x0 || q.x > S.G.x1) q.life = 0;
    for (const h of heroes) if (h.alive && h.ground && Math.abs(h.y - S.G.floorY) < 6 && Math.abs(h.x - q.x) < BB.trample.w) w.hitHero(h, BB.trample.dmg, 'trample', q.key); }
  S.waves = S.waves.filter(q => q.life > 0);
}
export function stakeAt(c, floorY) { const k = Math.min(1, c.t / c.T), ty = c.ty ?? floorY; return { x: c.x0 + (c.tx - c.x0) * k, y: c.y0 + (ty - c.y0) * k - Math.sin(k * Math.PI) * 60, k }; }
/* ---------- A BLOW ON HIM (B15) -> [what lands, the word or null] ---------- */
export function takeBlow(e, S, dmg, plunge) {
  if (S.ward > 0 || e.mode === 'tear') return [Math.max(1, Math.round(dmg * BB.wardMul)), 'WARDED'];
  if (e.mode === 'stuck' || e.mode === 'loose') { const mul = e.mode === 'loose' ? BB.harness.mul : BB.stuck.mul, d = Math.round(dmg * mul), left = S.purse ?? Infinity;
    if (d >= left) { S.purse = 0; e.modeT = Math.min(e.modeT, 0.01); return [Math.max(1, Math.round(left)), null]; } S.purse = left - d; return [d, null]; }
  if (e.mode === 'dazed') return [Math.round(dmg * BB.daze.mul), null];
  if (plunge) return [Math.round(dmg * BB.above), null];
  return [Math.max(1, Math.round(dmg * BB.armour)), 'ARMOURED'];
}

/* ---------- THE BOT (src/lab.js): what a player reads - his tells a reaction late, the stakes' and pots' rings, the burning pitch, the waves, the scaffolds' lines - and THE RULE:
   knock a prop so the wreck lies between him and you (stand on the wall side of it), or knock it when he stands under its line; strike him stuck; off a deck he batters ---------- */
export const PLAN = { react: 0.25, miss: 0.12, missKnock: 0.2 };
export const bbHazards = S => [...S.stakes.map(c => [c.tx, BB.volley.r + 12, c.ty]), ...S.pots.map(c => [c.tx, BB.pots.r + 12, c.ty]), ...S.fires.map(f => [f.x, BB.pots.r + 8, S.G.floorY]),
  ...S.scafs.filter(s => s.st === 'fall').map(s => { const [lo, hi] = lineOf(s); return [(lo + hi) / 2, (hi - lo) / 2 + 10]; })];
export function bbPlan(s) {
  const out = bbPlan0(s), S = s.S, P = s.P, hz = bbHazards(S);
  if (out.gx != null && !out.jump && P.ground) { const bad = x => hz.some(([hx, r]) => Math.abs(x - hx) < r);
    if (bad(out.gx) && !bad(P.x)) { out.gx = P.x; out.atk = out.atk && Math.abs(P.x - s.e.x) < s.reach + BB.w / 2; out.why += ' (waits: the spot is under a mark)'; } }
  if (globalThis.__bbWhy) { const k = out.why.replace(/ \(.*/, ''); globalThis.__bbWhy[k] = (globalThis.__bbWhy[k] || 0) + 1; }
  return out;
}
/* where a hero stands to knock a prop: on the wall side of it (out of its fall line) */
export const propSpot = sc => sc.x - sc.dir * 12;
function bbPlan0(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const half = BB.w / 2, lo = G.x0 + 10, hi = G.x1 - 10, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), hitR = reach + half - 4;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const hazards = bbHazards(S), inHaz = x => hazards.some(([hx, r]) => Math.abs(x - hx) < r);
  const safeX = x => { let q = clamp(x); for (let k = 0; k < 3; k++) for (const [hx, r] of hazards) if (Math.abs(q - hx) < r) q = clamp(q < hx ? hx - r - 4 : hx + r + 4); return q; };
  const deck = deckUnder(S, P);
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.5) { out.gx = mem.jumpX; out.why = 'in the air'; if (mem.plunge && Math.abs(P.x - kx) < half && P.y < e.y - BB.h && P.vy > -40) { out.down = true; out.atk = P.atk < 0; out.why = 'plunge his back'; } return out; }
  /* ON A DECK HE BATTERS (or a flag goes up for it): off it, to its prop's spot - then the prop (1b) drops it on him */
  if (deck && (e.mode === 'batterTell' || e.mode === 'batter') && seenFor('bt' + S.act, 0.1)) { const sp = propSpot(deck); out.gx = sp; out.why = 'off the deck he batters'; return out; }
  if (inHaz(P.x) && P.ground) { const [hx, r] = hazards.find(([x0, r0]) => Math.abs(P.x - x0) < r0); out.gx = safeX(P.x + (P.x < hx ? -r - 8 : r + 8)); out.why = 'off the mark'; return out; }
  const wave = S.waves.find(q => (P.x - q.x) * q.dir > 0 && Math.abs(P.x - q.x) < 40);
  if (wave && P.ground && seenFor('wv' + wave.key, 0.1)) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; mem.plunge = false; out.why = 'jump the ring'; return out; }
  const between = wreckBetween(S, kx, P.x);
  /* 1b. HE IS UNDER A STANDING SCAFFOLD'S LINE and busy: knock its prop */
  for (const sc of S.scafs) { if (sc.st !== 'stand' || S.ward > 0) continue; const spot = propSpot(sc);
    const busy = e.mode === 'dazed' ? e.modeT > 0.6 : e.mode === 'recover' ? e.modeT > 0.3 : e.mode === 'batter' ? e.modeT > 0.5 : bbTelling(e) && e.modeT > 0.45;
    if (busy && underLine(sc, kx, half - 8) && Math.abs(P.x - spot) < 10 && P.ground && !roll('k' + S.act + sc.id, PLAN.missKnock)) { out.gx = spot; out.face = sc.dir; out.atk = P.atk < 0; out.why = 'knock the prop: he is under it'; return out; } }
  /* 2. HIS TELLS */
  const moving = ['charge', 'sweep', 'sweepBack', 'trample', 'flail', 'kick'];
  if (bbTelling(e) || moving.includes(e.mode)) {
    const key = 'a' + S.act + e.mode, miss = s.v2 ? false : roll(key + 'm', PLAN.miss), seen = seenFor('a' + S.act + (e.mode === 'charge' ? 'chargeTell' : e.mode));
    if (seen && !miss) {
      if ((e.mode === 'chargeTell' || e.mode === 'charge') && !between) {
        const toward = (P.x - kx) * e.face > 0, gap = Math.abs(P.x - kx) - half;
        if (e.mode === 'charge' && toward && gap < 52 + (s.v2 ? 0 : 6)) { if (s.dodge && !roll(key + 'd', 0.5)) { out.dodge = true; out.gx = P.x - e.face * 30; out.why = 'roll the charge'; return out; }
          out.jump = P.ground; out.gx = P.x + e.face * 6; mem.jumpT = t; mem.jumpX = out.gx; mem.plunge = false; out.why = 'jump the charge'; return out; }
        out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'his charge: ready to jump it'; return out; }
      if ((e.mode === 'chargeTell' || e.mode === 'charge') && between) { out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'behind the wreck: let him ram it'; return out; }
      if (['sweepTell', 'sweep', 'sweepMid', 'sweepBack'].includes(e.mode) && dx < half + BB.sweep.reach + 14) {
        if ((e.mode === 'sweepTell' || e.mode === 'sweepMid') && e.modeT < 0.17 && P.ground) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; mem.plunge = true; out.why = 'jump the ram'; return out; }
        if (s.shield && !roll(key + 'b', 0.6)) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the ram'; return out; }
        out.gx = safeX(kx + side * (half + BB.sweep.reach + 26)); out.why = 'out of the ram\'s swing'; return out; }
      if ((e.mode === 'flailTell' || e.mode === 'flail') && (P.x - kx) * (e.face || 1) > 0 && dx < half + BB.flail.reach + 12) {
        if (S.flailHigh) { out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'the chain high: stay down'; if (dx < hitR && e.mode === 'flailTell') swing(kx); return out; }
        if (e.mode === 'flailTell' && e.modeT < 0.17 && P.ground) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; mem.plunge = dx < half + 10; out.why = 'jump the chain'; return out; }
        out.gx = P.x; out.why = 'the chain low: ready to jump'; return out; }
      if ((e.mode === 'kickTell' || e.mode === 'kick') && dx < half + BB.kick.reach + 12) {
        if (s.shield && !roll(key + 'b', 0.5)) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the buck'; return out; }
        out.gx = safeX(kx + side * (half + BB.kick.reach + 24)); out.why = 'out of the buck'; return out; }
      if (e.mode === 'trampleTell' && dx < 70) { out.gx = safeX(kx + side * 90); out.why = 'back off the trample'; return out; }
      if (e.mode === 'volleyTell' || e.mode === 'potTell') { out.gx = safeX(P.x + (P.x < G.mid ? 30 : -30)); out.why = 'the throw: keep moving'; return out; }
      if (e.mode === 'unchain') { out.gx = safeX(kx + side * 90); out.why = 'the chains snap: off him'; return out; }
    }
  }
  /* 3. OPEN: strike him; WARDED: off him */
  if (bbOpen(e) && !(e.mode === 'dazed' && dx - half > e.modeT * 110 + 10)) { const sx = kx + side * (s.tip ? 30 : 8 + half); out.gx = safeX(sx);
    if (dx < hitR + 4) swing(kx); out.why = 'strike him: ' + (OPEN_NAME[e.mode] || 'open').toLowerCase(); return out; }
  /* THE HANDLERS ON FOOT: one in reach, cut it down */
  const add = (S.adds || []).filter(a => a && a.alive && Math.abs(a.y - P.y) < 20).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (add && Math.abs(add.x - P.x) < reach + 10) { swing(add.x); out.gx = P.x; out.why = 'cut down a handler'; return out; }
  if (S.ward > 0 || e.mode === 'tear') { out.gx = safeX(kx + side * 100); out.why = 'his ward: off him'; return out; }
  if (s.rest) { const wr = wrecks(S)[0];
    if (wr) { const d = Math.sign((lineOf(wr)[0] + lineOf(wr)[1]) / 2 - kx) || 1; out.gx = safeX(wreckEnd(wr, d) + d * 40); out.face = -d; out.why = 'winded: behind the wreck'; return out; } out.gx = safeX(kx + side * 130); out.why = 'winded: off him'; return out; }
  /* 4. A WRECK LIES: stand just past its near end (his side), facing him - his charge rams it */
  const wr = wrecks(S).filter(q => { const d = Math.sign((lineOf(q)[0] + lineOf(q)[1]) / 2 - kx) || 1; return (wreckEnd(q, d) - kx) * d > half - 6; }).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (wr) { const d = Math.sign((lineOf(wr)[0] + lineOf(wr)[1]) / 2 - kx) || 1, spot = safeX(wreckEnd(wr, d) + d * 12);
    out.face = -d; if (Math.abs(P.x - spot) > 6) { out.gx = spot; out.why = 'behind the wreck'; return out; }
    if (dx < hitR && (e.mode === 'recover' || e.mode === 'walk')) { swing(kx); out.why = 'a cut over the wreck'; return out; }
    out.why = 'behind the wreck: wait for his charge'; return out; }
  /* 5. THE RULE: go to a standing scaffold on MY side of him, stand at its prop (wall side), and knock it when he comes into its line - or as a wall when he is far */
  const cand = S.scafs.filter(q => q.st === 'stand');
  if (cand.length) {
    const mine = q => Math.sign(propSpot(q) - kx) === side, near = cand.filter(mine), pool = near.length ? near : cand;
    const kept = mem.scaf !== undefined && pool.find(q => q.id === mem.scaf), target = kept || pool.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; mem.scaf = target.id;
    const spot = propSpot(target);
    if (Math.abs(P.x - spot) > 6) { out.gx = spot; out.why = 'to the scaffold prop'; if (dx < hitR && e.mode === 'recover') swing(kx); return out; }
    out.face = target.dir;
    if (underLine(target, kx, half - 6) && !roll('k' + S.act + target.id, PLAN.missKnock)) { out.atk = P.atk < 0; out.why = 'knock it on him'; return out; }
    if (dx > 110 && !underLine(target, kx, half + 20) && !roll('wall' + target.id + Math.floor(t / 2), 0.3)) { out.atk = P.atk < 0; out.why = 'knock it as a wall in his path'; return out; }
    if (dx < hitR && e.mode === 'recover') { swing(kx); out.why = 'a cut while he recovers'; return out; }
    out.why = 'at the prop: wait for him'; return out;
  }
  if (dx < hitR + 30 && (e.mode === 'recover' || e.mode === 'walk') && P.ground && roll('pl' + S.act, 0.6)) { out.jump = true; out.gx = kx; mem.jumpT = t; mem.jumpX = kx; mem.plunge = true; out.why = 'jump to plunge his back'; return out; }
  if (dx < hitR && e.mode === 'recover') { swing(kx); out.gx = P.x; out.why = 'cut him in his recovery'; return out; }
  out.gx = safeX(kx + side * Math.max(hitR + 10, 70)); out.face = Math.sign(kx - P.x) || 1; out.why = 'stand off him'; return out;
}
