// tools/cart-pilot.mjs - THE CART PILOT (claude/minecart; DEEP RAILS 2, claude/deeprails2): a hand that RIDES, for THE DEEP RAILS (tools/level1-pilot.mjs walks).
// CART_PILOT is page source: makeCartPilot(BK, plan) returns { step(), why } and step() sets BK.keys for ONE frame, reading only what a player sees -
// the rail ahead, the gaps (a long one: pump first), each crusher's and gate's drawn state, the rockfall's dust and shadow, the beams, the levers' arrows,
// the goblin carts and their runes, a thrower's MARK on the rail (brake off it), a ramp's kicker (pump, and let it throw you), a rail breaking behind (pump),
// a foe on the line (pump and ram him), THE FOREMAN's cart (pump and ram it), and the two ON-FOOT stretches (walk, fight, ride the lift, walk into the cart).
// Real keys only: RIGHT pumps, LEFT brakes, JUMP (held for a full jump), DOWN ducks, DOWN + JUMP drops, E throws a lever, X strikes.
// plan: { points: { id: 'set' | 'open' }, lines: [[c0, c1, row], ..] (the line to be on there), fight: true (strike what is near) }.
export const CART_PILOT = `
function makeCartPilot(BK, plan) {
  const TS = 16, k = BK.keys, MCH = BK.minecart();
  let jumpHold = 0, dropT = 0, talkCd = 0, atkCd = 0, why = '', airBoost = false;
  const L = () => BK.L, P = () => BK.P;
  const tile = (x, y) => { const Lv = L(); if (x < 0 || y < 0 || x >= Lv.W || y >= Lv.H) return 1; return Lv.grid[y * Lv.W + x]; };
  const stand = t => t === 1 || t === 14 || t === 2 || (t >= 20 && t <= 25);
  /* the floor under column c near row r (a slope one up or down counts): its row, or -1 */
  const floorAt = (c, r) => { for (const y of [r, r - 1, r + 1]) if (stand(tile(c, y)) && !(tile(c, y - 1) === 1)) return y; return -1; };
  const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
  const pilot = {};
  pilot.why = () => why;
  /* ON FOOT: walk on, hop what is in the way, strike what stands in front, ride the lift up (wait for the cage at the bottom, stand on it, step off at the top) */
  /* (claude/forgemaster) THE SMELTER FLOOR and THE FORGE (src/forge-rails.js), on foot: a cart rolling at me along my floor - jump it; a slag plug shut ahead - to its
     junction lever, E, and wait for the cart; THE FORGEMASTER - off his ingots' marks, back from a blow he winds up close, at a lever west of him when a cart comes over its
     points (it drops and rolls into him: OPEN), at him when he is open, else close and strike. Everything read is drawn (the carts, the levers, his marks) */
  function forgeStep(p) { const FR = BK.forgeRails && BK.forgeRails(); if (!FR || !FR.on()) return false; const rd = FR.read(); if (!rd) return false;
    const go = gx => { if (gx > p.x + 6) k.right = true; else if (gx < p.x - 6) k.left = true; };
    const inc = rd.carts.find(c => (c.hurled || c.loader) && Math.abs(c.y - p.y) < 6 && (p.x - c.x) * c.vx > 0 && Math.abs(p.x - c.x) < 54);
    if (inc && p.ground && jumpHold <= 0) { BK.press('jump'); jumpHold = 20; why = 'smelter: jump the cart'; return true; }
    if (jumpHold > 0 && !p.ground && inc) return true;
    const e = BK.enemies().find(q => q.t === 'forgemaster' && q.alive && q.rails);
    if (e && BK.miniActive) { const open = e.mode === 'stun' || e.mode === 'scald', dx = e.x - p.x;
      const marks = e.mode === 'ladleTell' ? (e.ingots || []) : e.mode === 'ladle' ? (e.blobs || []).filter(b => b.t > 0).map(b => b.x) : [];
      if (marks.some(x => Math.abs(x - p.x) < 24)) { const m0 = marks.find(x => Math.abs(x - p.x) < 24); go(p.x + (m0 > p.x ? -44 : 44)); why = 'smith: off the ingots'; return true; }
      if (open) { go(e.x - 26); if (Math.abs(dx) < 42 && atkCd <= 0) { p.face = Math.sign(dx) || 1; BK.press('atk'); atkCd = 12; } why = 'smith: open - strike'; return true; }
      if (/Tell$/.test(e.mode || '') && Math.abs(dx) < 110 && e.mode !== 'dragTell' && e.mode !== 'ladleTell') { go(e.x - 124); why = 'smith: back off his blow'; return true; }
      if (!(e.ward > 0)) { const pt = rd.points.filter(q => (q.x1 + 1) * TS + 10 < e.x - 20).sort((a, b) => Math.abs(a.x * TS - p.x) - Math.abs(b.x * TS - p.x))[0];
        if (pt && Math.abs(pt.x * TS + 8 - p.x) < 170) { const lx = pt.x * TS + 8; go(lx - 8); if (Math.abs(lx - p.x) < 18 && pt.state === 'set' && FR.etaAt(pt.id) < 2.6 && talkCd <= 0) { BK.press('talk'); talkCd = 20; } why = 'smith: the lever'; return true; } }
      go(e.x - 34); if (Math.abs(dx) < 42 && atkCd <= 0) { p.face = Math.sign(dx) || 1; BK.press('atk'); atkCd = 14; } why = 'smith: close'; return true; }
    const pl = rd.plugs.find(q => !q.broken && q.x0 * TS - p.x > -8 && q.x0 * TS - p.x < 260);
    if (pl) { const pt = rd.points.filter(q => q.x1 + 1 < pl.x0).sort((a, b) => b.x - a.x)[0];
      if (pt) { const lx = pt.x * TS + 8; if (Math.abs(lx - p.x) > 10) { if (lx < p.x - 10 || !BK.enemies().some(q => q.alive && !q.boss && Math.abs(q.y - p.y) < 30 && q.x - p.x > -10 && q.x - p.x < 34)) { go(lx); why = 'smelter: to the lever'; return true; } return false; }
        if (pt.state === 'set' && talkCd <= 0) { BK.press('talk'); talkCd = 30; why = 'smelter: throw the points'; } else why = 'smelter: wait for the cart'; return true; } }
    return false; }
  function onFoot(p, f) {
    if (forgeStep(p)) { if (jumpHold > 0) { jumpHold--; k.jump = true; } return; }   /* (claude/forgemaster) */
    const col = Math.floor(p.x / TS), row = Math.round(p.y / TS); let go = true, jump = false;
    const mv = (typeof BK.movers === 'function' ? BK.movers() : (BK.movers || [])).find(m => m.vert && m.x > f.x0 * TS && m.x < f.board * TS);
    if (mv) { const onIt = p.onMover === mv, x0 = mv.x, x1 = mv.x + mv.w;
      if (onIt) { go = mv.y > mv.y0 - mv.rise + 4 ? false : true; if (!go) { why = 'lift: riding up'; } else why = 'lift: off at the top'; if (go) jump = true; }
      else if (p.x < x0 && p.x > x0 - 40 && p.y > mv.y0 - 8) { if (mv.y < mv.y0 - 6) { go = false; why = 'lift: waiting for the cage'; } else why = 'lift: on'; } }
    const ahead = Math.floor((p.x + 10) / TS); if (go && p.ground && (stand(tile(ahead, row - 1)) || tile(ahead, row - 1) === 1)) { jump = true; why = 'on foot: up a step'; }
    /* (claude/deeprails5) THE SPOIL PITS: spoil (spikes) on the walk ahead - jump it; a crusher over my line ahead - wait for its lift */
    if (go && p.ground && [ahead, ahead + 1].some(c => tile(c, row - 1) === 3)) { jump = true; why = 'on foot: jump the spoil'; }
    { const M = MCH.state(), now = typeof BK.time === 'function' ? BK.time() : BK.time; for (const kq of (M && M.crushers) || []) { if (kq.row !== row || !MCH.crushPhase) continue; const d = kq.x * TS - p.x; if (d < -8 || d > 46) continue; const ph = MCH.crushPhase(kq, now); if (ph.state !== 'up' || ph.k > 0.55) { go = false; jump = false; why = 'on foot: wait for the crusher'; } } }
    /* (claude/deeprails5 #4) THE PARKED CART: jump into it (walking up to it does not board it - its gate holds the line) */
    { const cx0 = f.board * TS + 8; if (p.ground && cx0 - p.x > 6 && cx0 - p.x < 40 && Math.abs(p.y - (MCH.cartRow ? MCH.cartRow(f) : row) * TS) < 6) { jump = true; why = 'on foot: jump into the cart'; } }
    if (go && p.ground && floorAt(ahead + 1, row) < 0 && floorAt(ahead + 1, row + 1) < 0 && floorAt(ahead + 1, row + 2) < 0 && !(mv && Math.abs(mv.x - (ahead + 1) * TS) < 50)) { jump = true; why = 'on foot: a gap'; }
    if (plan.fight) { const e = BK.enemies().filter(q => q.alive && !q.boss && Math.abs(q.y - p.y) < 30 && q.x - p.x > -10 && q.x - p.x < 34).sort((a, b) => a.x - b.x)[0];
      if (e) { go = Math.abs(e.x - p.x) > 18 && go; if (atkCd <= 0) { p.face = e.x >= p.x ? 1 : -1; BK.press('atk'); atkCd = 16; why = 'on foot: strike ' + e.t; } } }
    if (jump && p.ground && jumpHold <= 0) { BK.press('jump'); jumpHold = 22; }
    if (jumpHold > 0) { jumpHold--; k.jump = true; }
    if (go) k.right = true;
  }
  /* THE FOREMAN's LOOP (src/foreman.js): what a player reads - his mode (the brake sparks, the !, the red shoes), the gap between his cart and mine */
  function foreman(p) { const F = MCH.foreman(), S = F.S, G = S.G, FM = { driftV: 72, ramV: 250, ramT: 0.5, halfW: 15 }, fx = G.x0 + S.R, dx = fx - p.x, low = Math.abs(p.y - G.lowY) < 6, hold = gx => { if (gx < p.x - 6) k.left = true; else if (gx > p.x + 6) k.right = true; };
    if (!p.ground) { if (jumpHold > 0) { jumpHold--; k.jump = true; } if (dropT > 0) { dropT--; k.down = true; } why = 'foreman: in the air'; return; }
    if (S.mode === 'boom' || (S.mode === 'boomTell' && S.mT < 0.28)) { k.down = true; why = 'foreman: duck the boom'; return; }   /* (claude/deeprails5) HIS BOOM: duck in the tub */
    { const lp = (S.lumps || []).find(q => q.x - p.x > 6 && q.x - p.x < 30); if (lp && low && jumpHold <= 0) { BK.press('jump'); jumpHold = 20; why = 'foreman: jump his ore'; k.jump = true; return; } }   /* HIS TIPPED ORE: jump it */
    if (!low) { if (S.ward <= 0 && Math.abs(dx) < 10 && S.mode !== 'ram' && S.mode !== 'ramTell') { k.down = true; BK.press('jump'); dropT = 6; why = 'foreman: drop on him'; } else hold(fx); return; }
    for (const o of (MCH.state().lobs || [])) { if (o.t <= 0 || Math.abs(o.tx - p.x) > 34) continue; k.left = true; why = 'foreman: off the mark'; return; }
    if (S.mode === 'ramTell' || S.mode === 'ram') { const reach = FM.ramV * FM.ramT + FM.halfW + 34; if (dx < 60 && jumpHold <= 0) { BK.press('jump'); jumpHold = 26; why = 'foreman: up from the ram'; } else if (dx < reach) { k.left = true; why = 'foreman: brake from the ram'; } if (jumpHold > 0) { jumpHold--; k.jump = true; } return; }
    if (S.mode === 'drift' && S.ward <= 0 && dx > (S.dv || 72) * 0.55 - 10 && dx < (S.dv || 72) * 0.55 + 4 && jumpHold <= 0) { BK.press('jump'); jumpHold = 26; why = 'foreman: jump on him'; }
    if (jumpHold > 0) { jumpHold--; k.jump = true; }
    if (S.mode === 'drift' || S.mode === 'driftTell') { hold(Math.min(p.x, fx - 30)); why = why.startsWith('foreman: jump') ? why : 'foreman: wait for him'; return; }
    hold(S.ward > 0 ? G.x0 + 90 : Math.min(G.x0 + 150, fx - 90)); why = 'foreman: hold'; }
  pilot.step = () => {
    const p = P(), M = MCH.state(), now = typeof BK.time === 'function' ? BK.time() : BK.time; clear(); why = 'cruise';
    if (!M || p.dead) return;
    talkCd = Math.max(0, talkCd - 1); atkCd = Math.max(0, atkCd - 1);
    const f = MCH.onFoot ? MCH.onFoot(p) : MCH.footAt ? MCH.footAt(p.x) : null; if (f) { onFoot(p, f); return; }
    /* (deeprails3) THE FOREMAN: on his cart, strike him; in his loop, ride his shuttle - jump on him as he drops back, brake out of his ram, off his pick's mark */
    if (p.mcBoard) { if (atkCd <= 0) { p.face = 1; BK.press('atk'); atkCd = 14; } why = 'aboard: strike'; return; }
    if (MCH.foremanOn && MCH.foremanOn() && MCH.treadmill(p)) { foreman(p); return; }
    const col = Math.floor(p.x / TS), row = Math.round(p.y / TS), v = MCH.cart(p).v, ahead = d => Math.floor((p.x + d) / TS);
    let brake = false, boost = false, jump = false, duck = false, drop = false;
    /* THE LINE WANTED HERE */
    const want = (plan.lines || []).find(([a, b]) => col >= a && col <= b);
    if (want && p.ground) { if (want[2] < row && floorAt(col + 2, want[2]) === want[2]) { jump = true; why = 'up a line'; } else if (want[2] > row && tile(col, row) === 14 && floorAt(col, want[2]) >= 0) { drop = true; why = 'down a line'; } }
    /* THE POINTS: E at a lever that is not where the plan wants it */
    for (const pt of M.points) { const wantS = (plan.points || {})[pt.id]; if (!wantS || pt.state === wantS) continue; const lx = pt.x * TS + 8;
      if (pt.hang) { if (Math.abs(lx - p.x) < 40 && p.ground && p.y > pt.row * TS) { jump = true; if (!p.ground && p.vy > -60 && atkCd <= 0) { k.atk = true; BK.press('atk'); atkCd = 12; } why = 'hidden lever'; } if (!p.ground && Math.abs(lx - p.x) < 30 && atkCd <= 0 && p.vy > -150) { BK.press('atk'); atkCd = 12; } }
      else if (Math.abs(lx - p.x) < 26 && Math.abs(p.y - pt.row * TS) < 20 && talkCd <= 0) { BK.press('talk'); talkCd = 20; why = 'points ' + pt.id; }
      else if (lx - p.x > 0 && lx - p.x < 70 && Math.abs(p.y - pt.row * TS) < 20) brake = v > 90; }
    /* A RAMP ahead on this line: pump, and do not jump its pit (it throws you) */
    const ramp = (M.ramps || []).find(r => Math.abs(r.row - row) <= 1 && (r.x + 1) * TS - p.x > -8 && (r.x + 1) * TS - p.x < 230);
    if (ramp) { boost = true; why = 'pump for the ramp'; }
    /* A RAIL THAT BREAKS under or just ahead: pump out of it */
    const brk = (M.breaks || []).find(b => Math.abs(b.row - row) <= 1 && col >= b.x0 - 10 && col <= b.x1 + 1);
    if (brk) { boost = true; why = 'pump: the rail breaks'; }
    /* THE GAP AHEAD on this line: its lip and its width (a points gap the plan wants open is a drop, not a gap; a ramp's pit is flown) */
    let lipNear = false, lipX = 0;
    if (p.ground && !ramp) { let lip = -1, w = 0;
      for (let d = 0; d <= 14; d++) { const c = ahead(d * TS + 6); if (floorAt(c, row) < 0) { lip = c; break; } }
      if (lip >= 0) { while (w < 16 && floorAt(lip + w, row) < 0 && floorAt(lip + w, row + 1) < 0 && floorAt(lip + w, row + 2) < 0) w++;
        const opened = M.points.some(pt => pt.state === 'open' && (plan.points || {})[pt.id] === 'open' && lip >= pt.x0 && lip <= pt.x1 + 1 && pt.prow === row);
        const lowFloor = floorAt(lip, row + 3) >= 0 || floorAt(lip, row + 4) >= 0 || floorAt(lip + 1, row + 3) >= 0;
        const dx = lip * TS - p.x; lipNear = dx < 70 && w >= 7; lipX = lip * TS;
        if (!opened && !(lowFloor && w > 6)) { if (w >= 7) { boost = true; why = 'pump for a gap of ' + w; } if (dx < 7) { jump = true; why = 'jump a gap of ' + w; airBoost = w >= 7; } } } }
    if (!p.ground && (airBoost || (ramp && p.vy < 200))) boost = true; if (p.ground && !jump) airBoost = false;
    /* CRUSHERS and GATES on this line ahead: go only if it will be clear while I pass */
    const tTo = d => { if (d <= 0) return 0; const a = 260, vm = 230, v0 = Math.min(v, vm), tA = (vm - v0) / a, dA = v0 * tA + 0.5 * a * tA * tA; return d <= dA ? (-v0 + Math.sqrt(v0 * v0 + 2 * a * d)) / a : tA + (d - dA) / vm; };
    const passOk = (x0, x1, clearAt) => { const tIn = tTo(x0 - 10 - p.x), tOut = tTo(x1 + 10 - p.x); for (let t = Math.max(0, tIn); t <= tOut + 0.05; t += 0.04) if (!clearAt(now + t)) return false; return true; };
    for (const c of M.crushers) { if (c.row !== row) continue; const x0 = c.x * TS, x1 = (c.x + c.w) * TS; if (x1 < p.x - 4 || x0 - p.x > 90) continue;
      if (x0 - p.x > 14 && !passOk(x0, x1, t => BK.minecart().crushPhase(c, t).state === 'up')) { brake = true; boost = false; why = 'crusher ' + c.id; } else if (x0 - p.x < 90) { boost = true; why = 'go under ' + c.id; } }
    for (const g of M.gates) { if (g.row !== row) continue; const gx = g.x * TS + 6; if (gx < p.x - 4 || gx - p.x > 90) continue;
      if (gx - p.x > 14 && !passOk(gx, gx + 6, t => BK.minecart().gateOpen(g, t))) { brake = true; boost = false; why = 'gate ' + g.id; } else { boost = true; why = 'through gate ' + g.id; } }
    /* ROCK: a shadow on this line - be short of it, or past it, when it lands */
    for (const r of M.rocks) { if (r.row !== row || !(r.fallT > 0)) continue; const x0 = r.x * TS - 12, x1 = (r.x + r.w) * TS + 12, at = p.x + v * r.fallT;
      if (at > x0 && at < x1 && p.x < x1) { const fast = p.x + 230 * r.fallT; if (fast > x1 + 6 && p.x > x0 - 60) { boost = true; why = 'pump past rock'; } else { brake = true; boost = false; why = 'brake for rock'; } } }
    /* BEAMS: duck under */
    for (const b of M.beams) { if (b.row !== row) continue; const x0 = b.x0 * TS - 26, x1 = (b.x1 + 1) * TS + 6; if (p.x > x0 && p.x < x1) { duck = true; why = 'duck'; } }
    /* RUNES and THROWN MARKS on this line ahead: change pace off them */
    for (const r of M.runes) { if (Math.abs(r.y - p.y) > 10 || r.t < 0) continue; const at = p.x + v * r.t; if (Math.abs(at - r.x) < 26 && r.x > p.x - 10) { const fast = p.x + Math.min(230, v + 130 * r.t) * r.t; if (fast > r.x + 30) { boost = true; why = 'pump past rune'; } else if (r.x - p.x < 60) { if (lipNear && v >= 215) { boost = true; if (lipX - p.x <= 46) { jump = true; airBoost = true; } why = 'rune on the lip: jump it early'; } else if (r.t < 0.5) jump = true; else { brake = true; boost = false; } why = why.startsWith('rune on') ? why : 'rune'; } } }   /* (a rune on a deep gap's lip at full pump: no braking - take off early, in the last 46 px, over the rune and the gap) */
    for (const o of (M.lobs || [])) { if (o.t <= 0 || Math.abs(o.ty - p.y) > 10) continue; const at = p.x + v * o.t; if (Math.abs(at - o.tx) < 30 && o.tx > p.x - 10) { const fast = p.x + Math.min(230, v + 130 * o.t) * o.t; if (fast > o.tx + 34 && !brk) { boost = true; why = 'pump past the mark'; } else { brake = true; boost = false; why = 'brake off the mark'; } } }
    /* FOES: strike what is near; RAM what stands on the line at full pump (jump it if I cannot get the pace up) */
    if (plan.fight) { const e = BK.enemies().filter(q => q.alive && !q.boss && Math.abs(q.y - p.y) < 20 && q.x - p.x > -6 && q.x - p.x < 40).sort((a, b) => a.x - b.x)[0];
      if (e && atkCd <= 0 && !(e.mcCart && e.mcCart.foreman) && !jump && !lipNear && !airBoost) { p.face = 1; BK.press('atk'); atkCd = 18; why = 'strike ' + (e.t); } }   /* (never a blow on the lip of a gap: a swing's recovery can eat the jump) */
    const onLine = BK.enemies().find(q => q.alive && !q.boss && !q.mcCart && q.t !== 'bat' && q.t !== 'tippler' && Math.abs(q.y - p.y) < 6 && q.x - p.x > 4 && q.x - p.x < 140);
    if (onLine && p.ground) { if (v >= 196 || onLine.x - p.x > 40) { if (!brake) boost = true; why = 'ram ' + onLine.t; } else if (onLine.x - p.x < 26) jump = true; }
    /* THE FOREMAN's cart ahead on my line: pump and ram it (again after every bounce) */
    /* (deeprails3) A CHOP COMING DOWN ACROSS MY LINE - the perched goblin, the rider with the hook: duck it */
    for (const c of M.carts) { if (!(c.perch || c.swing) || !(c.tell > 0 || c.chopT > 0) || !c.e.alive) continue; const ly = c.line ? c.line * TS : c.y + 3 * TS; if (Math.abs(ly - p.y) > 6) continue; const d = c.x - p.x; if (d > -26 && d < 90) { duck = true; why = 'duck the chop'; } }
    /* A LEAPING GOBLIN's SHADOW on my line: off it (brake), as off a thrown mark */
    for (const sh of (M.shadows || [])) { if (Math.abs(sh.y - p.y) > 10) continue; const at = p.x + v * sh.t; if (Math.abs(at - sh.x) < 24 && sh.x > p.x - 10) { brake = true; boost = false; why = 'brake off his landing'; } }
    /* the goblin carts on my line ahead: ram them at pump, or jump into them */
    for (const c of M.carts) { if (c.state !== 'roll' || c.foreman || c.ledge || Math.abs(c.y - p.y) > 6) continue; if (c.x - p.x > 0 && c.x - p.x < 120) { if (v >= 196) { boost = true; why = 'ram the cart'; } else if (c.x - p.x < 30 && p.ground) { jump = true; why = 'into the cart'; } else boost = true; } }
    if (drop) { k.down = true; BK.press('jump'); dropT = 6; jumpHold = 0; }
    else if (jump && p.ground && jumpHold <= 0) { BK.press('jump'); jumpHold = 26; }
    if (jumpHold > 0) { jumpHold--; k.jump = true; }
    if (dropT > 0) { dropT--; k.down = true; }
    if (duck && !jump && p.ground) { k.down = true; return; }
    if (brake) k.left = true; else if (boost) k.right = true;
  };
  return pilot;
}`;
/* THE PLAN THE ROUTE PILOT RIDES (every required lever SET; the risky lines optional by plan) */
export const ROUTE_PLAN = { points: { yard: 'set', cavein: 'set', exam: 'set', yardSw: 'set', driftSw: 'set', worksSw: 'set', examSw: 'set' }, lines: [[492, 552, 27]] };   /* (deeprails3: and every SWITCH's bridge laid) */
