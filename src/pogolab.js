// src/pogolab.js — CAN THIS HERO GET OVER IT OFF THE BACKS OF THE THINGS IN THE AIR?
// Every crossing in the campaign that is built out of a creature to come down on: the wasp pit, the tarn under the felled
// pine, the wasps up to a silver, the drowned village's roofs. Each one is flown by a small in-page pilot - take off from
// the bank, come down on whatever is under you, steer at the next one - over a grid of take-off points, steering and
// held-jump choices, and a route counts as CROSSED if ANY of them lands on the far footing without touching the ground in
// between. The same grid for every hero, so a route one hero crosses and another does not is the hero, not the pilot.
//   node tools/headless.mjs expr "import('/src/pogolab.js').then(m => m.pogoLab(BK, { heroes: ['knight', 'warden'] }))"
// (PORT=<your port> in front of it.) Nothing here changes a level: what a flight kills is put back before the next.
const TS = 16;
/* A ROUTE, in the level's FINAL tiles (node tools/map.mjs <id> ...): the standing tile to take off from and the way to go,
   the box of standing tiles that counts as over (x0..x1, rows y0..y1), and the row below which you have fallen. Standing on
   anything else after the take-off is a failure to pogo, even where the level has stumps to fall back on. A crossing with
   no bounce in it is counted apart (plainJumps): that route did not need the creature. */
export { fly };
export const POGO_ROUTES = [
  { id: 'wood pit', lvl: 'wood', from: [106, 21], dir: 1, goal: [124, 132, 0, 21], fall: 22, note: 'four wasps over the pond; stumps under them' },
  { id: 'wood tarn', lvl: 'wood', from: [404, 14], dir: 1, goal: [424, 432, 0, 14], fall: 16, note: 'three wasps; or fell the pine' },
  { id: 'wood silver shaft', lvl: 'wood', from: [452, 8], dir: 1, goal: [465, 470, 0, 4], fall: 9, note: 'two wasps up the shaft to the silver on the boards' },
  { id: 'marsh west roof', lvl: 'marsh', from: [344, 15], dir: -1, goal: [334, 338, 0, 10], fall: 16, note: 'the wasp by the west hut up to its archer' },
  { id: 'marsh east roof', lvl: 'marsh', from: [352, 14], dir: 1, goal: [350, 354, 0, 10], fall: 16, note: 'the wasp by the east hut up to the silver' },
  { id: 'marsh east roof, from the east', lvl: 'marsh', from: [361, 15], dir: -1, goal: [350, 354, 0, 10], fall: 16, note: 'the same wasp, taken off the far planks' },
];

const P0dead = BK => !!(BK.P.dead || BK.P.down > 0);
const yieldNow = () => new Promise(r => setTimeout(r, 0));

/* one flight. opts: { takeoff (px before the bank's edge to press jump), steer ('hold' | 'aim'), high (hold jump through it) } */
function fly(BK, r, o, maxF = 1000) {
  const P = BK.P, k = BK.keys, dir = r.dir;
  P.x = r.from[0] * TS + 8; P.y = r.from[1] * TS + TS; P.vx = 0; P.vy = 0; P.ground = true; P.face = dir; P.st = P.maxSt; P.hp = P.maxHp; P.inv = 0;
  for (const q of ['plunge', 'pinning']) P[q] = q === 'pinning' ? null : false; P.perch = 0;
  k.left = k.right = k.down = k.jump = k.up = false;
  const edgeX = (() => { let x = r.from[0]; while (BK.L.grid[(r.from[1] + 1) * BK.L.W + x + dir] && x > 0 && x < BK.L.W) x += dir; return x * TS + 8 + dir * 7; })();
  const jumpX = edgeX - dir * o.takeoff;
  let jumped = false, jumpHold = 0, bounces = 0, lastX = P.x, prevVy = 0, prevGround = true;
  const foes = () => BK.enemies().filter(e => e.alive && !e.harmless && !(e.gone > 0));
  for (let f = 0; f < maxF; f++) {
    if (P.dead || P.hp <= 0) return { ok: false, why: 'died', bounces, f };
    if (P.hp < P.maxHp) P.hp = P.maxHp;   /* a sting is not what is being measured: the knock is, so it stays */
    const inGoal = P.ground && P.x >= r.goal[0] * TS && P.x < (r.goal[1] + 1) * TS && P.y <= (r.goal[3] + 1) * TS + 1 && P.y >= r.goal[2] * TS;
    if (inGoal) return { ok: true, bounces, f };
    if (P.y > (r.fall + 1) * TS + 2) return { ok: false, why: 'fell', bounces, f, x: Math.round(P.x / TS) };
    if (jumped && P.ground && !P.onMover && Math.abs(P.vy) < 1 && f > 4) { return { ok: false, why: 'landed ' + Math.floor(P.x / TS) + ',' + Math.floor(P.y / TS - 1), bounces, f }; }
    // the stick
    let want = dir;
    if (jumped && o.steer === 'aim') {
      const ahead = foes().filter(e => (e.x - lastX) * dir > 16 && e.y > P.y - 70 && e.y < (r.fall + 1) * TS).sort((a, b) => (a.x - b.x) * dir);
      const next = ahead[0];
      const tx = next ? next.x : (r.goal[0] + r.goal[1] + 1) / 2 * TS;
      const d = tx - P.x; want = Math.abs(d) < 5 ? 0 : Math.sign(d);
      if (!next && P.y > (r.goal[3] + 1) * TS - 4 && P.vy > 0 && (r.goal[0] * TS - P.x) * dir > 0) want = dir;
    }
    k.left = want < 0; k.right = want > 0;
    if (!jumped && P.ground && (P.x - jumpX) * dir >= 0) { BK.press('jump'); jumped = true; jumpHold = 26; }
    k.jump = jumpHold > 0 || (jumped && o.high && !P.ground); if (jumpHold > 0) jumpHold--;
    // the plunge onto whatever is under you
    k.down = false;
    if (jumped && !P.ground && P.vy > 20 && !P.plunge) for (const e of foes()) { const dy = (e.y - (e.h || 8)) - P.y; if (Math.abs(e.x - P.x) < 12 && dy > -6 && dy < 44) { k.down = true; BK.press('atk'); break; } }
    if (P.plunge) k.down = true;
    if (P.perch > 0 && o.kick !== false) BK.press('jump');   /* ON THE SHAFT (a perch): the kick is the only way off it, pressed on the first frame of the window (kick: false leaves it) */
    if (jumped && !P.ground && !prevGround && prevVy >= 0 && P.vy < -200) { bounces++; lastX = P.x; }   /* thrown back up off something: a bounce, a vault or a kick */
    const prevVy0 = P.vy, prevGround0 = P.ground; if (o.trace && f % 6 === 0) o.trace.push([f, Math.round(P.x), Math.round(P.y), Math.round(P.vy), P.ground ? 'G' : '', P.plunge ? 'P' : '', k.left ? 'L' : k.right ? 'R' : '', k.jump ? 'J' : '', P.perch > 0 ? 'perch' : ''].join(' '));
    if (o.onFrame) o.onFrame(f); else BK.sim(1); prevVy = prevVy0; prevGround = prevGround0;   /* (onFrame: a harness that wants to draw the flight steps it itself) */
  }
  return { ok: false, why: 'timeout', bounces };
}

/* THE FOUR THINGS HER PLUNGE CAN DO, each forced once: VAULT off a wasp over the pond, PIN a sprig on the grass, PERCH on a
   spitter planted on its ledge (too awkward to hold, stood on the ground), and the knight's POGO off the same wasp, unchanged.
   Then her trial count: the knight's plunge station, three straw men, as the Warden (she has no yard of her own).
     node tools/headless.mjs expr "import('/src/pogolab.js').then(m => m.vaultChecks(BK))" */
export async function vaultChecks(BK) {
  const lvm = await import('./level.js'), out = {};
  const at = (h, lvl) => { BK.setHero(h); BK.load(lvm.LEVELS.findIndex(l => l.id === lvl)); BK.state = 'play'; BK.god = true; BK.sim(2); };
  const dropOn = (e, held = false) => { const P = BK.P, k = BK.keys; BK.sim(30); P.vaultCarry = 0; P.vaultT = 0; P.x = e.x; P.y = e.y - (e.h || 8) - 30; P.vx = 0; P.vy = 40; P.ground = false; P.plunge = false; P.pinning = null; P.perch = 0; P.st = P.maxSt; P.face = 1;
    k.left = k.right = false; k.jump = held; k.down = true; BK.press('atk');
    let seen = null, went = false; for (let f = 0; f < 60 && !seen; f++) { BK.sim(1); if (P.plunge) went = true; else if (went) seen = { f, vy: Math.round(P.vy), vx: Math.round(P.vx), pinning: !!P.pinning, perch: P.perch > 0, carry: +(P.vaultCarry || 0).toFixed(2), vaultT: +(P.vaultT || 0).toFixed(2), alive: e.alive }; }
    k.down = false; return seen; };
  const nearest = (t, x, y) => BK.enemies().filter(e => e.t === t && e.alive).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
  at('warden', 'wood'); out.vaultOffWasp = dropOn(nearest('wasp', 113 * TS, 19 * TS));
  at('warden', 'wood'); { const P = BK.P; const e = nearest('wasp', 113 * TS, 19 * TS); out.vaultHeldJump = dropOn(e, true); BK.keys.jump = false; }
  at('warden', 'wood'); { const sp = BK.enemies().filter(e => e.t === 'sprig' && e.alive)[0]; if (sp) sp.hp = 999; out.pinSprigOnGround = sp ? dropOn(sp) : 'no sprig'; }   /* (tough enough to live through the landing: a dead one is not pinned) */
  at('warden', 'wood'); { const s = nearest('spit', 85 * TS, 21 * TS); out.perchSpitOnGround = s ? dropOn(s) : 'no spitter'; }
  at('knight', 'wood'); out.knightPogoWasp = dropOn(nearest('wasp', 113 * TS, 19 * TS));
  /* the trial: the knight's yard, its plunge station, as her */
  { at('warden', 'trial_knight'); const L = BK.L, st = L.trial.find(q => q.kind === 'pogo'); const P = BK.P;
    const dummies = () => BK.enemies().filter(e => e.t === 'dummy' && e.x > st.x0 * TS && e.x < st.gate * TS);
    for (const d of dummies()) { dropOn(d); for (let f = 0; f < 200 && (P.pinning || P.perch > 0 || !P.ground); f++) { if (P.pinning && f % 20 === 10) BK.press('jump'); BK.sim(1); } }
    out.trialPogoAsWarden = { got: st.got || 0, n: st.n, done: !!st.done, dummies: dummies().length }; }
  BK.god = false;
  return out;
}

export async function pogoLab(BK, opts = {}) {
  const lvm = await import('./level.js');
  const heroes = opts.heroes || ['knight', 'warden'], routes = POGO_ROUTES.filter(r => !opts.routes || opts.routes.includes(r.id));
  const takeoffs = opts.takeoffs || Array.from({ length: 16 }, (_, i) => i * 4), rows = [];
  for (const r of routes) for (const h of heroes) {
    let best = null, tries = 0, wins = 0, plain = 0, whys = {};
    BK.setHero(h); BK.load(lvm.LEVELS.findIndex(l => l.id === r.lvl)); BK.state = 'play'; BK.god = true; BK.sim(2);
    for (const steer of ['hold', 'aim']) for (const high of [false, true]) for (const takeoff of takeoffs) {
      for (const e of BK.enemies()) e.alive = false; BK.respawnEnemies(); BK.sim(1);   /* the wasps a flight killed are put back, where they were built */
      const res = fly(BK, r, { takeoff, steer, high, kick: opts.kick }); tries++;
      if (res.why === 'died' || P0dead(BK)) { BK.load(lvm.LEVELS.findIndex(l => l.id === r.lvl)); BK.state = 'play'; BK.god = true; BK.sim(2); }
      if (res.ok && !res.bounces) plain++;
      else if (res.ok) { wins++; if (!best) best = { steer, high, takeoff, bounces: res.bounces, secs: +(res.f * (BK.SET.speed || 1) / 60).toFixed(2) }; }
      else whys[res.why] = (whys[res.why] || 0) + 1;
      await yieldNow();
    }
    BK.god = false;
    rows.push({ route: r.id, hero: h, crossed: !!best, wins: wins + '/' + tries, plainJumps: plain, best, fails: whys });
  }
  return rows;
}
