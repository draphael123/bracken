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
  function onFoot(p, f) {
    const col = Math.floor(p.x / TS), row = Math.round(p.y / TS); let go = true, jump = false;
    const mv = (typeof BK.movers === 'function' ? BK.movers() : (BK.movers || [])).find(m => m.vert && m.x > f.x0 * TS && m.x < f.board * TS);
    if (mv) { const onIt = p.onMover === mv, x0 = mv.x, x1 = mv.x + mv.w;
      if (onIt) { go = mv.y > mv.y0 - mv.rise + 4 ? false : true; if (!go) { why = 'lift: riding up'; } else why = 'lift: off at the top'; if (go) jump = true; }
      else if (p.x < x0 && p.x > x0 - 40 && p.y > mv.y0 - 8) { if (mv.y < mv.y0 - 6) { go = false; why = 'lift: waiting for the cage'; } else why = 'lift: on'; } }
    const ahead = Math.floor((p.x + 10) / TS); if (go && p.ground && (stand(tile(ahead, row - 1)) || tile(ahead, row - 1) === 1)) { jump = true; why = 'on foot: up a step'; }
    if (go && p.ground && floorAt(ahead + 1, row) < 0 && floorAt(ahead + 1, row + 1) < 0 && floorAt(ahead + 1, row + 2) < 0 && !(mv && Math.abs(mv.x - (ahead + 1) * TS) < 50)) { jump = true; why = 'on foot: a gap'; }
    if (plan.fight) { const e = BK.enemies().filter(q => q.alive && !q.boss && Math.abs(q.y - p.y) < 30 && q.x - p.x > -10 && q.x - p.x < 34).sort((a, b) => a.x - b.x)[0];
      if (e) { go = Math.abs(e.x - p.x) > 18 && go; if (atkCd <= 0) { p.face = e.x >= p.x ? 1 : -1; BK.press('atk'); atkCd = 16; why = 'on foot: strike ' + e.t; } } }
    if (jump && p.ground && jumpHold <= 0) { BK.press('jump'); jumpHold = 22; }
    if (jumpHold > 0) { jumpHold--; k.jump = true; }
    if (go) k.right = true;
  }
  pilot.step = () => {
    const p = P(), M = MCH.state(), now = typeof BK.time === 'function' ? BK.time() : BK.time; clear(); why = 'cruise';
    if (!M || p.dead) return;
    talkCd = Math.max(0, talkCd - 1); atkCd = Math.max(0, atkCd - 1);
    const f = MCH.footAt ? MCH.footAt(p.x) : null; if (f) { onFoot(p, f); return; }
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
    if (p.ground && !ramp) { let lip = -1, w = 0;
      for (let d = 0; d <= 14; d++) { const c = ahead(d * TS + 6); if (floorAt(c, row) < 0) { lip = c; break; } }
      if (lip >= 0) { while (w < 16 && floorAt(lip + w, row) < 0 && floorAt(lip + w, row + 1) < 0 && floorAt(lip + w, row + 2) < 0) w++;
        const opened = M.points.some(pt => pt.state === 'open' && (plan.points || {})[pt.id] === 'open' && lip >= pt.x0 && lip <= pt.x1 + 1 && pt.prow === row);
        const lowFloor = floorAt(lip, row + 3) >= 0 || floorAt(lip, row + 4) >= 0 || floorAt(lip + 1, row + 3) >= 0;
        const dx = lip * TS - p.x;
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
    for (const r of M.runes) { if (Math.abs(r.y - p.y) > 10 || r.t < 0) continue; const at = p.x + v * r.t; if (Math.abs(at - r.x) < 26 && r.x > p.x - 10) { const fast = p.x + Math.min(230, v + 130 * r.t) * r.t; if (fast > r.x + 30) { boost = true; why = 'pump past rune'; } else if (r.x - p.x < 60) { if (r.t < 0.5) jump = true; else { brake = true; boost = false; } why = 'rune'; } } }
    for (const o of (M.lobs || [])) { if (o.t <= 0 || Math.abs(o.ty - p.y) > 10) continue; const at = p.x + v * o.t; if (Math.abs(at - o.tx) < 30 && o.tx > p.x - 10) { const fast = p.x + Math.min(230, v + 130 * o.t) * o.t; if (fast > o.tx + 34 && !brk) { boost = true; why = 'pump past the mark'; } else { brake = true; boost = false; why = 'brake off the mark'; } } }
    /* FOES: strike what is near; RAM what stands on the line at full pump (jump it if I cannot get the pace up) */
    if (plan.fight) { const e = BK.enemies().filter(q => q.alive && !q.boss && Math.abs(q.y - p.y) < 20 && q.x - p.x > -6 && q.x - p.x < 40).sort((a, b) => a.x - b.x)[0];
      if (e && atkCd <= 0 && !(e.mcCart && e.mcCart.foreman)) { p.face = 1; BK.press('atk'); atkCd = 18; why = 'strike ' + (e.t); } }
    const onLine = BK.enemies().find(q => q.alive && !q.boss && !q.mcCart && q.t !== 'bat' && q.t !== 'tippler' && Math.abs(q.y - p.y) < 6 && q.x - p.x > 4 && q.x - p.x < 140);
    if (onLine && p.ground) { if (v >= 196 || onLine.x - p.x > 40) { if (!brake) boost = true; why = 'ram ' + onLine.t; } else if (onLine.x - p.x < 26) jump = true; }
    /* THE FOREMAN's cart ahead on my line: pump and ram it (again after every bounce) */
    for (const c of M.carts) { if (!c.foreman || c.state !== 'roll' || Math.abs(c.y - p.y) > 6 || c.x < p.x) continue; if (c.x - p.x < 260 && !(brake && why.startsWith('brake off'))) { boost = true; brake = false; why = 'ram the foreman'; } }
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
export const ROUTE_PLAN = { points: { yard: 'set', cavein: 'set', exam: 'set' }, lines: [[492, 552, 27]] };
