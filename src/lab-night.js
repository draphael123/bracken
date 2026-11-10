// src/lab-night.js - THE NIGHT ROAD'S BOSS BOT HANDS (claude/nighthands): THE CRYPT MOTHER, THE HEADMISTRESS and THE LANTERN WIDOW played the way a competent player plays them.
// Nothing is opened, lit, cut or answered FOR the bot: it reads only what a player's screen shows (the glinting knot, her shadow, the flying glob, the circles of chalk, the
// lit lectern, the shield books, the dark glade and the pale tiers that are real only where a light reaches) and answers the TOLD cue with the verb the cue names.
// Pattern: src/lab-mother.js (a hands function per boss, one branch each in src/lab.js runbossLab). The three share ONE small PLATFORM NAVIGATOR (navStep): it reads the live grid
// (so a spectral tier that is lit, a conjured step, a floor strand that has fallen, are all seen as they are THIS frame), finds the way by 3-row hops and spring webs, and walks it.
// cryptMotherHands(c) / headmistressHands(c) / lanternWidowHands(c) -> { swing, struck }; c = { BK, boss, P, k, A, h, f, reach, T, strike, keyVerb, shielded }
import { CM } from './crypt-mother.js';
import { HM } from './headmistress.js';
import { WD, lanternAt } from './lantern-widow.js';
const TS = 16;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* the jump held through its rise: ONE count a frame however many branches ask (a double count cut every jump to half: 42 px against the 49 a 3-row hop needs) */
export const holdJump = c => { const P = c.P; if (P.labJump > 0) { if (P.labHF !== c.f) { P.labHF = c.f; P.labJump--; } c.k.jump = true; } };

/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------
   THE NAVIGATOR. Platforms are runs of standable cells (head clear) in one row; a spring web is its own platform (web: true). A hop is a 3-row jump (the game's jump is 49 px) over
   a gap of up to 2-5 cells (less the higher it goes), a drop, or a spring throw (7 rows with jump held). The hero's jump: hold it the whole way up. */
export function platformsOf(BK, T, x0c, x1c, y0c, y1c) {
  const L = BK.L, W = L.W, out = [];
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H ? T.SOLID : L.grid[y * W + x]);
  const blocks = t => t === T.SOLID || t === T.ONEWAY || t === T.BOUNCER || t === T.PLANK;
  for (let y = y0c; y <= y1c; y++) { let run = null;
    for (let x = x0c; x <= x1c + 1; x++) {
      const t = x <= x1c ? at(x, y) : T.AIR, ok = x <= x1c && blocks(t) && !blocks(at(x, y - 1)) && at(x, y - 2) !== T.SOLID, web = t === T.BOUNCER;
      if (ok && run && run.web === web) { run.x1 = x; }
      else { if (run) out.push(run); run = ok ? { x0: x, x1: x, row: y, web } : null; } }
    if (run) out.push(run); }
  for (const p of out) { p.px0 = p.x0 * TS; p.px1 = (p.x1 + 1) * TS; p.y = p.row * TS; p.key = p.row + ':' + p.x0; p.cx = (p.px0 + p.px1) / 2; }
  return out;
}
const hopCost = (a, b, walls) => {   /* can a hero go from platform a to platform b in one move? a cost, or 0 for no */
  if (a === b) return 0; if (walls && walls.some(w => (a.x1 < w && b.x0 > w) || (b.x1 < w && a.x0 > w))) return 0;   /* (a ward rail is a wall: no hop across it)*/
  const up = a.row - b.row, gap = Math.max(0, b.x0 - a.x1 - 1, a.x0 - b.x1 - 1), over = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) + 1;
  if (a.web) { const near = b.x0 <= a.x1 + 2 && b.x1 >= a.x0 - 2; return up >= 2 && up <= 9 && near ? (up >= 7 ? 3 : 2) : up <= 1 && up >= -8 && gap <= 4 ? 2 : 0; }   /* (7 rows: a held spring; 8-9: the plunge onto it first - the throw is -560, 157 px)*/
  if (b.web) return b.row > a.row ? 0 : gap <= 1 && up <= 1 ? 1 : gap <= 3 && up <= 0 ? 2 : 0;   /* (a web below us is not stepped onto: it would throw us back up) */
  if (gap === 0 && a.row === b.row) return 1;   /* touching on one row: walk */
  if (up >= 4) return 0; const gmax = up >= 3 ? 3 : up >= 1 ? 3 : up >= -1 ? 4 : 5;   /* (3 rows up over three cells: a held run-and-jump just clears it - the Widow's left tier to her top one)*/
  if (over > 0) return up >= 1 ? 2 : 3;   /* above or below with a shared span: jump up / step off the end and drop */
  return gap <= gmax ? 2 + gap : 0;
};
function route(plats, from, to, walls) {
  if (from === to) return [from]; const prev = new Map([[from, null]]), q = [from];
  for (let i = 0; i < q.length; i++) { const a = q[i]; if (a === to) break;
    for (const b of plats) { if (prev.has(b) || !hopCost(a, b, walls)) continue; prev.set(b, a); q.push(b); } }
  if (!prev.has(to)) return null; const path = []; for (let p = to; p; p = prev.get(p)) path.unshift(p); return path;
}
const platUnder = (plats, P) => { let best = null, bd = 1e9; for (const p of plats) { const dy = Math.abs(p.y - P.y); if (dy > 4) continue; const dx = P.x < p.px0 ? p.px0 - P.x : P.x > p.px1 ? P.x - p.px1 : 0; if (dx > 4) continue; if (dy + dx < bd) { bd = dy + dx; best = p; } } return best; };
/* the platform a spot belongs to: the surface at (or just under) y, and the run nearest x */
export function goalPlat(plats, gx, gy) { let best = null, bd = 1e9; for (const p of plats) { const dy = Math.abs(p.y - gy), dx = gx < p.px0 ? p.px0 - gx : gx > p.px1 ? gx - p.px1 : 0, d = dy * 3 + dx; if (d < bd) { bd = d; best = p; } } return best; }
/* ONE FRAME of getting to (gx, gy) - gy is the SURFACE y the spot stands on. Sets the walking and jumping keys. Returns { onGoal, air, stuck, plat, goal, hop } */
export function navStep(c, gx, gy, o = {}) {
  const { BK, P, k, T, A } = c, nv = P.labNav || (P.labNav = { hop: null, tries: 0, lastPlat: null }), tol = o.tol || 2.5;
  const x0c = Math.floor(A.x0 / TS) - 1, x1c = Math.ceil(A.x1 / TS) + 1, y0c = o.y0 !== undefined ? o.y0 : Math.floor(((A.y0 !== undefined ? A.y0 : A.floor - 400)) / TS), y1c = Math.floor(A.floor / TS) + 4;
  const plats = platformsOf(BK, T, x0c, x1c, y0c, y1c), goal = goalPlat(plats, gx, gy), go = x => { if (Math.abs(x - P.x) > tol) k[x > P.x ? 'right' : 'left'] = true; };
  const jump = n => { if ((P.ground || P.onMover) && !(P.labJump > 0)) { BK.press('jump'); P.labJump = n; } };
  if (!P.ground && !P.onMover) {   /* IN THE AIR: steer at what the hop was for (or the spot), keep the jump held */
    const hop = nv.hop, tgt = hop ? hop.to : goal;
    if (hop && hop.plunge && hop.stage < 2) {   /* THE PLUNGE-BOUNCE: from the first throw's top, over the web, down and attack - it throws the harder (-560) */
      const v = hop.via, lo = v.px0 + 4, hi = v.px1 - 4;
      if (hop.stage === 0) { if (P.x < lo) k.right = true; else if (P.x > hi) k.left = true; if (P.vy > 15 && P.y < v.y - 20 && !P.plunge && P.atk < 0 && P.x >= lo - 4 && P.x <= hi + 4) { k.down = true; BK.press('atk'); hop.stage = 1; } }
      else { k.down = true; if (P.vy < -50) hop.stage = 2; }
      return { air: true, plat: null, goal }; }
    if (tgt) { const lo = tgt.px0 + 6, hi = tgt.px1 - 6; if (P.x < lo) k.right = true; else if (P.x > hi) k.left = true; else if (o.centre) go(clamp(gx, lo, hi)); }
    holdJump(c); return { air: true, plat: null, goal };
  }
  const cur = platUnder(plats, P); holdJump(c);
  if (!cur) { if (!o.noWalk) go(gx); return { stuck: true, plat: null, goal }; }
  if (nv.hop && cur.key === nv.hop.to.key) nv.hop = null;
  if (nv.lastPlat !== cur.key) { nv.lastPlat = cur.key; nv.tries = 0; }
  if (!goal) { go(gx); return { stuck: true, plat: cur }; }
  if (cur.key === goal.key) { const x = clamp(gx, cur.px0 + 6, cur.px1 - 6); go(x); return { onGoal: Math.abs(P.x - x) <= tol + 1, plat: cur, goal }; }
  const path = route(plats, plats.find(p => p.key === cur.key), plats.find(p => p.key === goal.key), o.walls);
  if (!path) { go(clamp(goal.cx, cur.px0 + 8, cur.px1 - 8)); return { stuck: true, plat: cur, goal }; }   /* (no way: toward it, but never off the platform's end - the dark mere is under it) */
  const nxt = path[1], after = path[2], up = cur.row - nxt.row, over = Math.min(cur.x1, nxt.x1) - Math.max(cur.x0, nxt.x0) + 1, right = nxt.cx > cur.cx;
  if (nxt.web) {   /* a spring web: step onto the part of it that lies under where we want to land, then the throw takes us */
    const lt = after || goal; nv.hop = { to: lt, via: nxt, plunge: nxt.row - lt.row >= 7, stage: 0 }; const wx = clamp(lt.cx, nxt.px0 + 6, nxt.px1 - 6); go(wx); k.jump = true; return { hop: 'web', plat: cur, goal };
  }
  if (cur.web) { if (!nv.hop || nv.hop.to.key !== nxt.key) nv.hop = { to: nxt, via: cur, plunge: cur.row - nxt.row >= 7, stage: 0 }; if (!(P.labJump > 0)) { BK.press('jump'); P.labJump = 26; } k.jump = true; return { hop: 'web', plat: cur, goal }; }   /* (standing ON a web throws nothing: a jump, then the landing throws) */
  if (nxt.row === cur.row && Math.max(0, nxt.x0 - cur.x1 - 1, cur.x0 - nxt.x1 - 1) === 0) { go(right ? nxt.px0 + 8 : nxt.px1 - 8); return { hop: 'walk', plat: cur, goal }; }   /* touching: walk on */
  nv.hop = { to: nxt };
  if (over > 0 && up >= 1) {   /* straight up through the shared span (a held jump) */
    const ox0 = Math.max(cur.px0, nxt.px0) + 8, ox1 = Math.min(cur.px1, nxt.px1) - 8, tx = clamp(P.x, ox0, Math.max(ox0, ox1)); go(tx);
    if (Math.abs(P.x - tx) < 5 && Math.abs(P.vx) < 40) { jump(26); k.jump = true; } return { hop: 'up', plat: cur, goal }; }
  if (over > 0) { go(goal.cx < cur.cx ? cur.px0 - 6 : cur.px1 + 6); return { hop: 'drop', plat: cur, goal }; }   /* a drop onto a platform under part of this one: off the end that leads out over it */
  const gapC = Math.max(0, nxt.x0 - cur.x1 - 1, cur.x0 - nxt.x1 - 1);
  if (up < -1 && gapC <= 1) { go(right ? cur.px1 + 6 : cur.px0 - 6); return { hop: 'drop', plat: cur, goal }; }
  /* a gap: to the edge of ours that faces it, then jump (up to three rows: held) */
  const edge = right ? cur.px1 - 4 - nv.tries * 6 : cur.px0 + 4 + nv.tries * 6;
  go(edge); if ((right ? P.x >= edge - 3 : P.x <= edge + 3) && P.ground) { jump(up >= 2 ? 30 : 24); k.jump = true; nv.tries++; }
  return { hop: 'gap', plat: cur, goal };
}

/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------
   THE CRYPT MOTHER (src/crypt-mother.js, silk). The way a player plays her: she HANGS from one knot - CUT IT (the one that glints) and she falls on her back: strike her while she is
   open; the knot she climbs to next is the one farthest from you. Her told moves: spit (a glob, aimed where you stood - step aside), pounce (her shadow and a thread under you - leave the
   shadow), sweep (a leg along the strand - be in the air when it lands), clutch (a sac, three spiderlings - cut them as they come), and in P2 a strand flashes red and falls - leave it. */
export function cryptMotherHands(c) {
  const { BK, boss: e, P, k, h, f, reach, T } = c, NH = BK.nightHands && BK.nightHands(), CMH = NH && NH.CMH, S = CMH && CMH.show(); if (!S || !S.G) return { swing: false };
  const G = S.G, m = e.mode || '', floorY = G.floorY, kn = G.knots[S.knot] || G.knots[0], tired = P.labRest || (P.st || 0) < 14, open = m === 'fallen' && e.modeT > 0;
  const go = x => { if (Math.abs(x - P.x) > 2.5) k[x > P.x ? 'right' : 'left'] = true; };
  const jump = n => { if ((P.ground || P.onMover) && !(P.labJump > 0)) { BK.press('jump'); P.labJump = n; } };
  const hold = () => holdJump(c);
  let swing = false, dbg = ''; const done = () => { hold(); return { swing, dbg }; };
  const secAt = x => G.secs.findIndex(q => x >= q.px0 && x < q.px1), secDown = x => { const i = secAt(x); return i >= 0 && S.fallen.has(i); };
  /* ---- A SPIT GLOB: its line is on the screen; step out of it ---- */
  for (const g of S.globs) { if (!g.vy || g.vy <= 0) continue; const t = (P.y - 10 - g.y) / g.vy; if (t < 0 || t > 1.1) continue; const px = g.x + g.vx * t; if (Math.abs(px - P.x) < 24) { const s = px >= P.x ? -1 : 1; k[s > 0 ? 'right' : 'left'] = true; return done(); } }
  /* ---- THE POUNCE: her shadow is on the floor under you; leave it (she lands on it at the end of the tell) ---- */
  if (S.shadow && (m === 'pounceTell' || m === 'pounce') && P.y > floorY - 30 && Math.abs(P.x - S.shadow.x) < 56) { const s = P.x >= S.shadow.x ? 1 : -1, tx = clamp(S.shadow.x + s * 84, G.x0 + 24, G.x1 - 24); go(tx); return done(); }
  /* ---- THE SWEEP: a leg along the strand under her; airborne when it lands ---- */
  if (m === 'sweepTell' && P.ground && Math.abs(P.x - e.x) < CM.sweep.reach + 12 && P.y > e.y + 20) { if (e.modeT < 0.3) jump(22); return done(); }
  /* ---- P2: a strand that flashes red falls; get off it ---- */
  if (S.flash) { const s = G.secs[S.flash.i]; if (s && P.ground && P.y > floorY - 6 && P.x > s.px0 - 8 && P.x < s.px1 + 8) { const l = s.px0 - 20, r = s.px1 + 20, lok = l > G.x0 && !secDown(l), rok = r < G.x1 && !secDown(r), tx = lok && (!rok || P.x - l < r - P.x) ? l : r; go(tx); return done(); } }
  /* ---- HER BROOD: spiderlings cut as they close ---- */
  const ling = BK.enemies().filter(q => q.alive && q !== e && !q.maxHp && Math.abs(q.y - P.y) < 24 && Math.abs(q.x - P.x) < 46).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  const bossNear = Math.abs(e.x - P.x) < reach + 34 && Math.abs((e.y + 8) - P.y) < 44 && !open;   /* (she is beside us on the floor - landed, climbing: a blow on her now is outside an opening: a twentieth, and the greed reprisal) */
  if (ling && !open && P.ground && !bossNear) { P.face = Math.sign(ling.x - P.x) || P.face; if (Math.abs(ling.x - P.x) > reach - 2) go(ling.x - (Math.sign(ling.x - P.x) || 1) * (reach - 4)); else if (P.atk < 0 && !tired) { swing = true; if (c.keyVerb && c.keyVerb(BK, h, ling) === 'sweep') k.down = true; } return done(); }
  /* ---- HER BACK IS TURNED: she is on the floor, open. Down to her and cut ---- */
  if (open) {
    const side = P.x < e.x ? -1 : 1, fr = platformsOf(BK, T, Math.floor(G.x0 / TS), Math.ceil(G.x1 / TS), Math.floor(floorY / TS), Math.floor(floorY / TS)).filter(p => !p.web), want0 = e.x + side * 18;
    /* the floor that is still there: she may have fallen over a strand that is gone - the nearest standing floor to her is where to stand */
    let spot = want0, bd = 1e9; for (const p of fr) { const x = clamp(want0, p.px0 + 6, p.px1 - 6), d = Math.abs(x - want0); if (d < bd) { bd = d; spot = x; } }
    if (!P.ground && !P.onMover) { go(spot); if (Math.abs(P.x - e.x) < reach + 12 && Math.abs(P.y - e.y) < 30 && P.atk < 0 && !tired) { P.face = -side; swing = true; } return done(); }
    const near = Math.abs(P.x - e.x) < reach + 16 && Math.abs(P.y - e.y) < 26;
    if (!near && P.ground && P.y < floorY - 24 && !secDown(P.x)) { k.down = true; BK.press('jump'); go(spot); return done(); }   /* (on a strand or a tier above her: DOWN + JUMP lets you through a one-way floor - and fall at her) */
    if (!near) { const r = navStep(c, spot, floorY); if (r.stuck) go(spot); return done(); }
    P.face = -side;
    if (c.strike) { const st = c.strike(BK, h, e, f), want = Math.max(14, Math.min(st.want || 0, 40)), sp = e.x + side * want; if (Math.abs(P.x - sp) > 6 && !(P.charge > 0)) go(sp); return { swing: false, struck: st.swing }; }
    go(e.x + side * 18); if (P.atk < 0 && !tired) swing = true; return done();
  }
  if (m === 'lament' || m === 'wake' || m === 'sleep' || m === 'fallen') return done();
  /* ---- THE KNOT SHE HANGS FROM: stand under it and cut (it sits 24 px over a hero's feet: a standing cut reaches it) ---- */
  const plats = platformsOf(BK, T, Math.floor(G.x0 / TS), Math.ceil(G.x1 / TS), Math.floor((G.hangY + 20) / TS), Math.floor(floorY / TS));
  const perch = plats.filter(p => !p.web && p.y > kn.y + 10 && p.y < kn.y + 40 && kn.x >= p.px0 - 2 && kn.x <= p.px1 + 2).sort((a, b) => a.y - b.y)[0];
  if (!perch) { go(kn.x); return done(); }
  const spotX = clamp(kn.x, perch.px0 + 14, perch.px1 - 14), face = Math.sign(kn.x - spotX) || (kn.x < perch.cx ? -1 : 1);
  const atSpot = P.x >= perch.px0 && P.x <= perch.px1 && Math.abs(P.x - spotX) < 9 && (P.ground ? Math.abs(P.y - perch.y) < 3 : P.y < perch.y + 4 && P.y > perch.y - 80);
  if (atSpot) { dbg = 'knot' + S.knot + ' AT';
    const near = Math.abs(e.x - kn.x) < 120; P.labKnotW = near ? 0 : (P.labKnotW || 0) + 1;   /* (she walks her line toward you: cut when she is over the perch, not at the far end of the cave - she would fall out of reach; a player waits a few seconds) */
    if (P.ground) { P.face = face; if (P.atk < 0 && !tired && !bossNear && (near || P.labKnotW > 420)) swing = true; }   /* (the knot sits 24 px over a hero's feet - inside the reach of a swing from the ground; at the top of a jump it is BELOW the blow) */
    else if (P.vy > 0 && P.y > kn.y + 4 && P.atk < 0 && !tired && Math.abs(P.x - kn.x) < reach + 8) { P.face = face; swing = true; } }
  else { const r = navStep(c, spotX, perch.y, { centre: true, tol: 3 }); dbg = 'knot' + S.knot + ' ' + (r.hop || (r.onGoal ? 'ON' : r.air ? 'air' : r.stuck ? 'STUCK' : '?')) + ' ' + (r.plat ? r.plat.key : '-') + '>' + (r.goal ? r.goal.key : '-'); }
  return done();
}

/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------
   shared: a safe x between the columns of a told danger (the Headmistress's chalk circles, the Widow's rising hands). cols: [{x}], w: how far from a column is clear. */
function safeX(P, cols, w, lo, hi) {
  const bad = x => cols.some(s => Math.abs(x - s.x) < w);
  if (!bad(P.x)) return null;
  for (let d = 4; d <= 80; d += 4) for (const s of [-1, 1]) { const x = P.x + s * d; if (x >= lo && x <= hi && !bad(x)) return x; }
  return null;
}
/* GREED (src/boss-greed.js): blows outside an opening feed a told reprisal. The hands stop one short of the count and stand clear of the ring while it closes (as the Mother Cap's and the ground hands do). Returns { hold, flee, out } */
const greedOf = (BK, e) => { const G = BK.greed; if (!G) return { hold: false, flee: false, out: 0 }; const out = (G.reach || 60) + (e.w || 20) / 2; return { hold: G.open(e) !== true && G.count(e) >= G.limit(e) - 1, flee: e.greedT > 0, out }; };
/* a blow that can be blocked: the shield heroes hold C toward it; the others step out of its reach */
const guardOrStep = (c, from) => { const { P, k } = c; if (c.shielded) { k.block = true; P.face = Math.sign(from - P.x) || P.face; return true; } k[P.x >= from ? 'right' : 'left'] = true; return false; };
const platAround = (c, A) => { const ps = platformsOf(c.BK, c.T, Math.floor(A.x0 / TS) - 1, Math.ceil(A.x1 / TS) + 1, Math.floor((A.y0 !== undefined ? A.y0 : A.floor - 400) / TS), Math.floor(A.floor / TS) + 4); return platUnder(ps, c.P); };

/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------
   THE HEADMISTRESS (src/headmistress.js, academy). SHE MARKS ONLY WHAT USES THE LESSON: one lectern lights per phase - touch it (the cantrip) and answer with its verb:
   LEVITATION (P1)  float up to a gallery (hold JUMP) and strike her there, the shield books popped; BLINK (P2) stand out past her ward rail, blink THROUGH it (the dodge
   button), strike her back; CONJURE STEP (P3) jump off the rim, jump again in the air for a step, strike her from it; the finale calls them in turn. Her told moves: chalk rain
   (leave the circles), the ruler (block it or be out of reach), the bolt (jump it), the dispel (be in the air when the steps go). */
export function headmistressHands(c) {
  const { BK, boss: e, P, k, A, h, f, reach, T } = c, NH = BK.nightHands && BK.nightHands(), HDH = NH && NH.HDH, ACH = NH && NH.ACH, S = HDH && HDH.show(); if (!S || !S.G || !ACH) return { swing: false };
  const G = S.G, m = e.mode || '', ph = S.ph, floorY = G.floorY, rd = HDH.read() || {}, lesson = ph === 4 ? S.call : ph <= 3 ? S.lesson : null;
  const spell = ACH.spellOf(P), open = m === 'stagger' && e.modeT > 0, tired = P.labRest || (P.st || 0) < 14, L = BK.L;
  const chalkCols = S.sigils.filter(s => s.t > 0.04);
  const go = x => { if (Math.abs(x - P.x) > 2.5) { const d = x > P.x ? 1 : -1, nx = P.x + d * 8; if (chalkCols.some(s => Math.abs(nx - s.x) < 20 && Math.abs(P.x - s.x) >= 20)) return; k[d > 0 ? 'right' : 'left'] = true; } };   /* (never a step INTO a chalk circle) */
  const jump = n => { if ((P.ground || P.onMover) && !(P.labJump > 0)) { BK.press('jump'); P.labJump = n; } };
  const gr = greedOf(BK, e); let swing = false, dbg = '', answer = false; const done = () => { holdJump(c); return { swing: swing && !(gr.hold && !open && !answer), dbg }; };
  const rails = ACH.rails ? ACH.rails() : [], walls = rails.map(r => r.x);
  const lecs = (L.ac.lecterns || []).filter(l => L.arena.lecterns.includes(l.id)), lecOf = sp => lecs.find(l => l.spell === sp);
  const galleries = G.galleries.map(([a, b]) => ({ x0: a, x1: b, cx: (a + b) / 2 })), gal = galleries.slice().sort((a, b) => Math.abs(a.cx - e.x) - Math.abs(b.cx - e.x))[0];
  const inGal = galleries.find(g => P.ground && Math.abs(P.y - G.rafterY) < 4 && P.x >= g.x0 - 2 && P.x <= g.x1 + 2);
  const face = Math.sign(e.x - P.x) || P.face;
  const nv = o => navStep(c, o.x, o.y, { y0: 20, walls, tol: o.tol || 2.5 });
  /* ---------- the told dangers, first ---------- */
  { const cols = S.sigils.filter(s => s.t > 0.04); if (cols.length) { const pl = platAround(c, A), x = safeX(P, cols, 20, pl ? pl.px0 + 4 : A.x0 + 10, pl ? pl.px1 - 4 : A.x1 - 10); if (x !== null) { go(x); dbg = 'chalk'; return done(); } } }   /* chalk: out of the circles (their columns fall the height of the hall) */
  for (const b of S.bolts) if ((P.x - b.x) * b.dir > 0 && Math.abs(P.x - b.x) < 70 && Math.abs((P.y - 10) - b.y) < 22) { if (c.shielded && Math.abs(P.x - b.x) < 40) { k.block = true; P.face = -b.dir; } else jump(24); dbg = 'bolt'; return done(); }   /* the bolt: jumped as it comes, or blocked */
  if (m === 'rulerTell' && Math.abs(P.x - e.x) < HM.ruler.reach + 14 && Math.abs(P.y - e.y) < 40) { guardOrStep(c, e.x); dbg = 'ruler'; return done(); }
  if (gr.flee && !open && Math.abs(P.x - e.x) < gr.out + 18 && Math.abs(P.y - e.y) < 70) { go(e.x + (P.x >= e.x ? 1 : -1) * (gr.out + 30)); dbg = 'greed-ring'; return done(); }   /* the reprisal's ring is closing on her: stand clear */
  /* ---------- AN OPENING: strike her ---------- */
  if (open) {
    const side = P.x < e.x ? -1 : 1;
    if (c.strike && Math.abs(e.y - P.y) < 26 && Math.abs(P.x - e.x) < reach + 40) { P.face = -side; const st = c.strike(BK, h, e, f), want = Math.max(10, Math.min(st.want || 0, 36)); if (P.ground && !(P.charge > 0) && Math.abs(P.x - (e.x + side * want)) > 6) go(e.x + side * want); return { swing: false, struck: st.swing, dbg: 'open' }; }
    if (e.y > P.y + 30 && P.ground && P.y < floorY - 20) { k.down = true; BK.press('jump'); go(e.x); dbg = 'open-drop'; return done(); }   /* she fell to the floor: down through the gallery, at her */
    if (!P.ground) { go(e.x); if (Math.abs(P.x - e.x) < reach + 10 && Math.abs(P.y - e.y) < 30 && P.atk < 0 && !tired) { P.face = Math.sign(e.x - P.x) || P.face; swing = true; } dbg = 'open-air'; return done(); }
    if (e.y < P.y - 30 && spell === 'levitate' && P.ground) { P.labFloat = true; BK.press('jump'); k.jump = true; dbg = 'open-up'; return done(); }
    nv({ x: e.x + (P.x < e.x ? -16 : 16), y: Math.abs(e.y - floorY) < 8 ? floorY : P.y }); dbg = 'open-nav'; return done();
  }
  /* the bell between phases: the next lectern is lit the moment it rings, and its room is only whole for a moment (the rail, then the dismissed floor) - be standing at it (the order of the three is told by the book) */
  if (m === 'bell' && ph <= 3) { const lec = lecOf(ph === 1 ? 'blink' : ph === 2 ? 'conjure' : null); if (lec) { dbg = 'bell>' + lec.spell; const r = nv({ x: lec.x, y: lec.y, tol: 3 }); if (r.stuck && !r.air) go(lec.x); return done(); } }
  if (m === 'sleep' || m === 'wake' || m === 'bell' || m === 'recover') { dbg = m; return done(); }
  if (!lesson) { dbg = 'nolesson'; return done(); }
  /* ---------- LEARN THE LESSON: the lit lectern's cantrip ---------- */
  if (spell !== lesson) {
    const lec = lecOf(lesson); if (!lec) { dbg = 'nolec'; return done(); }
    if (rd.lit !== lesson) { dbg = 'lec-unlit ' + rd.lit; return done(); }
    dbg = 'learn ' + lesson; const r = nv({ x: lec.x, y: lec.y, tol: 3 }); if (r.stuck && !r.air) go(lec.x); return done();
  }
  /* ---------- ANSWER IT ---------- */
  if (lesson === 'levitate') {
    dbg = 'lev';
    if (ph === 4 && !inGal) { answer = true;   /* the finale: she waits at her station - float up BESIDE her from the floor under it (a blow in the air counts), no gallery needed */
      const tx = e.x + (P.x < e.x ? -1 : 1) * (reach - 8), dx = e.x - P.x;
      if (P.ground) { P.labFloat = false; if (P.y > e.y + 8) { go(tx); if (Math.abs(P.x - tx) < 8) { BK.press('jump'); P.labFloat = true; k.jump = true; } } else { P.face = Math.sign(dx) || P.face; go(tx); if (Math.abs(dx) < reach + 6 && P.atk < 0 && !tired) swing = true; } return done(); }
      k.jump = !!P.labFloat && P.y > e.y + 2; go(tx); if (Math.abs(dx) < reach + 8 && Math.abs(P.y - e.y) < 32 && P.atk < 0 && !tired) { P.face = Math.sign(dx) || P.face; swing = true; }
      return done(); }
    if (inGal) { P.labFloat = false; const dx = e.x - P.x; P.face = Math.sign(dx) || P.face;
      if (Math.abs(dx) > reach - 4) go(clamp(e.x - Math.sign(dx) * (reach - 6), inGal.x0 + 4, inGal.x1 - 4));
      answer = S.books.filter(b => !b.dead).length <= HM.shield.pass;   /* (two shield books or fewer: the next blow is the answer) */
      if (Math.abs(dx) < reach + 6 && Math.abs(e.y - P.y) < 30 && P.atk < 0 && !tired) swing = true;
      return done(); }
    if (P.ground) {
      P.labFloat = false; const g = gal, tx = clamp(P.x, g.x0 + 14, g.x1 - 14);
      if (P.y > G.rafterY + 8) { go(tx); if (Math.abs(P.x - tx) < 8) { BK.press('jump'); P.labFloat = true; P.labGal = g; k.jump = true; } }
      else nv({ x: g.cx, y: G.rafterY });
      return done(); }
    const g = P.labGal || gal; k.jump = !!P.labFloat && P.y > G.rafterY - 4;   /* hold JUMP (float) until over the gallery's surface, then let go and land on it */
    if (P.x < g.x0 + 10) k.right = true; else if (P.x > g.x1 - 10) k.left = true;
    if (P.y < G.rafterY - 6 && P.atk < 0 && Math.abs(P.x - e.x) < reach + 8 && Math.abs(P.y - e.y) < 30 && !tired) { P.face = Math.sign(e.x - P.x) || P.face; swing = true; }
    return done();
  }
  if (lesson === 'blink') {
    dbg = 'blink'; const rail = rails[0]; if (!rail) { go(G.mid); return done(); }
    const rx = rail.x * TS, front = e.face || 1, frontX = front > 0 ? rx + TS + 8 : rx - 8, back = Math.sign(P.x - e.x) === -front;   /* out past the rail, on the side she faces */
    if (back && Math.abs(P.x - e.x) < 70 && P.ground) { dbg = 'blink-hit'; answer = true; P.face = Math.sign(e.x - P.x) || P.face; const d = Math.abs(P.x - e.x);   /* behind her: her back, inside the window */
      if (d > reach - 6) go(e.x - front * (reach - 8)); else if (P.atk < 0 && !tired) swing = true; return done(); }
    const outside = front > 0 ? P.x > rx + TS : P.x < rx;
    if (!outside) { dbg = 'blink-to-front'; const r = nv({ x: frontX, y: floorY, tol: 3 }); if (r.stuck) go(frontX); return done(); }
    go(frontX); const there = Math.abs(P.x - frontX) < 10;
    if (there && P.ground && !(P.labBlinkF > f - 30) && !/Tell$|^(chalk|bolt|about|ruler)$/.test(m)) { P.labBlinkF = f; k[-front > 0 ? 'right' : 'left'] = true; k[-front > 0 ? 'left' : 'right'] = false; P.face = -front; (BK.labPressRaw || BK.press).call(BK, 'dodge'); dbg = 'BLINK'; }
    else if (there) P.face = -front;
    return done();
  }
  if (lesson === 'conjure') {
    dbg = 'conj'; answer = true; const stg = S.pitStage || 0, pit = G.pit[Math.max(0, Math.min(G.pit.length - 1, (stg || 1) - 1))], rimL = pit[0] * TS, rimR = (pit[1] + 1) * TS;
    const left = Math.abs(e.x - rimL) < Math.abs(e.x - rimR), rimX = left ? rimL - 8 : rimR + 8, onStepNow = ACH.onStep(P);
    if ((m === 'dispelTell' || m === 'dispel') && P.ground && onStepNow) { if (e.modeT < 0.3) jump(22); return done(); }   /* the dispel: in the air when the steps go */
    if (S.tellStage && P.ground && P.y > floorY - 6) { const p0 = G.pit[S.tellStage - 1]; if (P.x > p0[0] * TS - 4 && P.x < (p0[1] + 1) * TS + 4) { go(rimX); dbg = 'leave-floor'; return done(); } }   /* the floor that flickers goes: off it */
    const dxh = e.x - P.x, strikeOk = Math.abs(dxh) < reach + 6 && Math.abs(e.y - P.y) < 28;
    if (!P.ground) {   /* in the air: steer at her; at the top of a jump (or falling past her level) jump AGAIN: a step under the feet, then cut from it */
      go(e.x); if (Math.abs(dxh) > 8) k[dxh > 0 ? 'right' : 'left'] = true;
      if (P.vy > -40 && !(P.coyote > 0) && P.y > e.y - 40 && P.y < e.y + 34 && !(P.labConjF > f - 14)) { BK.press('jump'); P.labConjF = f; dbg = 'conj-step'; }
      if (strikeOk && P.atk < 0 && !tired) { P.face = Math.sign(dxh) || P.face; swing = true; }
      return done(); }
    if (onStepNow) { dbg = 'on-step'; P.face = Math.sign(dxh) || P.face;
      if (strikeOk) { if (P.atk < 0 && !tired) swing = true; if (Math.abs(dxh) > reach - 4) go(e.x); return done(); }
      if (e.y < P.y - 20) { jump(30); k.jump = true; return done(); }   /* she is higher: up, and a step at the top */
      go(e.x); k[dxh > 0 ? 'right' : 'left'] = true; return done(); }                  /* level with her: on toward her, off the step's edge (a step in the fall) */
    if (Math.abs(P.y - floorY) < 6 && pit && (stg > 0 || ph === 4) && P.x > rimL && P.x < rimR) { go(rimX); return done(); }
    if (Math.abs(P.y - floorY) < 6) {   /* at the rim: wait until she floats within a hop's reach, then off the edge toward her */
      const edgeX = left ? rimL - 6 : rimR + 6; go(edgeX); P.face = left ? 1 : -1;
      if (Math.abs(P.x - edgeX) < 6 && Math.abs(dxh) < 150 && !(P.labJump > 0)) { jump(30); k.jump = true; k[dxh > 0 ? 'right' : 'left'] = true; }
      return done(); }
    nv({ x: rimX, y: floorY }); return done();
  }
  dbg = 'idle'; return done();
}

/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------
   THE LANTERN WIDOW (src/lantern-widow.js, wispwood). SHE TAKES YOUR LIGHT: every lantern and the rim lamps go out, the glade goes dark, she flies to a perch - the pale tiers are
   real only in her glow now. Climb to her and STRIKE HER LANTERN: every flame comes home and she reels (open). Between thefts the glade is lit and she only hurts: stay clear. Her told
   moves: the veil (block it or be out of reach), the wail (a ring along the ground - be in the air as its front reaches you), the hands (three ripples - leave them), the wedding
   march (jump it, or stand on a lit tier). The first perch she takes is the left tier, so between thefts the hero waits by the left bank's lamp. */
export function lanternWidowHands(c) {
  const { BK, boss: e, P, k, A, h, f, reach, T } = c, NH = BK.nightHands && BK.nightHands(), WDH = NH && NH.WDH, WWH = NH && NH.WWH, S = WDH && WDH.show(); if (!S || !S.G) return { swing: false };
  const G = S.G, m = e.mode || '', floorY = G.floorY, tired = P.labRest || (P.st || 0) < 14, open = m === 'reel' && e.modeT > 0, L = BK.L;
  const go = x => { if (Math.abs(x - P.x) > 2.5) k[x > P.x ? 'right' : 'left'] = true; };
  const jump = n => { if ((P.ground || P.onMover) && !(P.labJump > 0)) { BK.press('jump'); P.labJump = n; } };
  const gr = greedOf(BK, e); let swing = false, dbg = '', answer = false; const done = () => { holdJump(c); return { swing: swing && !(gr.hold && !open && !answer), dbg }; };
  const nv = (x, y, o = {}) => navStep(c, x, y, { y0: 6, ...o });
  const lp = lanternAt(e), perch = S.perchI >= 0 ? G.perches[S.perchI] : null;
  const lamps = (L.ww && L.ww.lamps || []).filter(l => G.lamps.includes(l.id));
  /* ---------- the told dangers, first ---------- */
  for (const r of S.rings) { const rad = WD.wail.r * Math.min(1, r.t / WD.wail.act), d = Math.abs(P.x - r.x); if (P.ground && d > rad - 12 && d < rad + 30 && Math.abs(P.y - r.y) < 130) { jump(22); dbg = 'ring'; return done(); } }   /* the wail: airborne as its front reaches you */
  if (m === 'wailTell' && P.ground && Math.abs(P.x - e.x) < 30 && e.modeT < 0.12) { jump(22); dbg = 'ring-pre'; return done(); }
  { const cols = S.spots.filter(s => s.t > 0.1); if (cols.length) { const pl = platAround(c, A), x = safeX(P, cols, 20, pl ? pl.px0 + 4 : A.x0 + 10, pl ? pl.px1 - 4 : A.x1 - 10); if (x !== null) { go(x); dbg = 'hands'; return done(); } } }   /* the hands: out of the ripples */
  for (const q of S.marches) if (P.ground && P.y > floorY - 22 && (P.x - q.x) * q.dir > -8 && Math.abs(P.x - q.x) < 64) { jump(24); dbg = 'march'; return done(); }   /* the march: jumped */
  if (m === 'veilTell' && Math.abs(P.x - e.x) < WD.veil.reach + 14 && Math.abs(P.y - e.y) < 50 && Math.sign(P.x - e.x) === (e.face || 1)) { guardOrStep(c, e.x); dbg = 'veil'; return done(); }
  if (gr.flee && !open && Math.abs(P.x - e.x) < gr.out + 18 && Math.abs(P.y - e.y) < 70) { go(e.x + (P.x >= e.x ? 1 : -1) * (gr.out + 30)); dbg = 'greed-ring'; return done(); }
  /* ---------- the stolen light: reel her in ---------- */
  if (open) {   /* RECLAIMED: she reels low - strike her */
    const side = P.x < e.x ? -1 : 1;
    if (c.strike && Math.abs(e.y - P.y) < 30 && Math.abs(P.x - e.x) < reach + 40) { P.face = -side; const st = c.strike(BK, h, e, f), want = Math.max(10, Math.min(st.want || 0, 32)); if (P.ground && !(P.charge > 0) && Math.abs(P.x - (e.x + side * want)) > 6) go(e.x + side * want); return { swing: false, struck: st.swing, dbg: 'open' }; }
    if (e.y > P.y + 30 && P.ground && P.y < floorY - 20) { k.down = true; BK.press('jump'); go(e.x); dbg = 'open-drop'; return done(); }
    if (!P.ground) { go(e.x); if (Math.abs(P.x - e.x) < reach + 10 && Math.abs(P.y - e.y) < 34 && P.atk < 0 && !tired) { P.face = Math.sign(e.x - P.x) || P.face; swing = true; } dbg = 'open-air'; return done(); }
    nv(e.x + (P.x < e.x ? -16 : 16), Math.abs(e.y - floorY) < 24 ? floorY : P.y); dbg = 'open-nav'; return done();
  }
  if (S.stolen && S.G) {
    dbg = 'stolen'; const gliding = m === 'glide' || m === 'perch', tx = gliding || !perch ? lp.x : lp.x, ty = m === 'glide' && perch ? perch.y : e.y;
    const on = P.x > lp.x - reach - 4 && P.x < lp.x + reach + 4 && Math.abs(lp.y - (P.y - 14)) < 26;
    if (on && P.atk < 0 && !tired) { P.face = Math.sign(lp.x - P.x) || P.face; swing = true; answer = true; dbg = 'reclaim'; return done(); }
    const gx = m === 'glide' && perch ? perch.x : lp.x, spot = gx + (P.x < gx ? -(reach - 8) : reach - 8);
    const r = nv(spot, ty, { tol: 4 }); if (r.stuck) { dbg += ' stuck'; }
    return done();
  }
  /* ---------- the glade is lit: wait for the theft by the left bank's lamp (a drowned lantern is lit again at a lit lamp) ---------- */
  dbg = 'lit'; const myL = WWH && WWH.lantern ? WWH.lantern(P) : null, litLamp = lamps.filter(l => WWH && WWH.lampOn(l.id)).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  const hubLamp = lamps.slice().sort((a, b) => a.x - b.x)[1] || lamps[0], hubX = hubLamp ? hubLamp.x - 24 : A.x0 + 200;
  if (myL && myL.st !== 'lit' && litLamp) { dbg = 'relight'; const r = nv(litLamp.x, litLamp.y, { tol: 4 }); return done(); }
  if (m === 'theftTell') { dbg = 'to-left-tier'; const tier = G.perches[2]; nv(tier.x, tier.y, { tol: 3 }); return done(); }   /* (the first perch she takes is the left tier: be standing on it) */
  nv(hubX, floorY, { tol: 3 }); return done();
}

export const LAB_NIGHT = { cryptMotherHands, headmistressHands, lanternWidowHands };
