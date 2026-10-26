// src/captain3-plan.js - THE CAPTAIN 3's HUMAN BOT (claude/hurricane3): what a player reading his fight on the mainmast top does (src/lab.js plays it; the fight is
// src/main.js updateCaptain). Pure: it reads what is on the screen - his tells a reaction late (some misread), the BRACE! call, the rod's column, the ring where he
// comes up out of the sea - and the yards and lines (BK.cap3()). It:
//   - TAKES A LINE when he calls BRACE! (the nearest on its yard; his own when it can be first to it - then he is the one swept), holds it through the sweep;
//   - BAITS THE ROD: in its told tail, stands past the column from him so his own approach and lunge carry him into it - and is out of it itself;
//   - follows him yard to yard: UP by the shrouds at the yards' ends (or the mast to the royal), DOWN by dropping through (down + jump);
//   - gets out of the sea (up the nearest line), off the water-lunge's ring, jumps his keg, rolls or jumps his pistol, blocks or backs off his sabre;
//   - cuts him OPEN (struck, flat, turned) and otherwise duels: in on his recovery, a cut from over him now and then (his front is a wall: 0.4).
// s = { P: { x, y, face, ground, atk, climb, swim, hp, maxHp }, e: the boss, G: BK.cap3(), reach, shield, hero, t, rng, mem, v2, rest, noRoll }
//  -> { gx, face, atk, jump, dodge, block, down, up, hold, drop, why }
const TS = 16;
export const CPLAN = { react: 0.24, miss: 0.1, baitFrom: 0.55, baitAt: 40, lineTake: 0.6 };
export const cpOpen = e => !!e && (e.mode === 'beach' || e.mode === 'reel');
const COMMIT = new Set(['sabre1', 'sabre2', 'shoot', 'hook', 'keg', 'surge', 'surgeRec', 'climb', 'call']);
export function cpPlan(s) {
  const { P, e, G } = s, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, up: false, hold: false, drop: false, hop: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0, T = G.tiers;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : CPLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const dry = i => !(e.phase >= 2 && i === 0) && !(e.phase >= 3 && i === 1);
  const near = y => { let b = -1, bd = 1e9; for (let i = 0; i < T.length; i++) { if (!dry(i)) continue; const d = Math.abs(y - T[i].row * TS); if (d < bd) { bd = d; b = i; } } return b; };
  const onTier = i => i >= 0 && Math.abs(P.y - T[i].row * TS) < 6 && P.ground;
  const my0 = near(P.y); if (P.ground && Math.abs(P.y - T[Math.max(0, my0)].row * TS) < 6) mem.lastTier = my0;
  const my = !P.ground && !P.climb && mem.lastTier !== undefined && dry(mem.lastTier) ? mem.lastTier : my0, hisT = e.tier ?? near(e.y), tl = T[Math.max(0, my)];   /* (in the air: still the yard it jumped from) */
  const clamp = (x, i = my) => { const q = T[Math.max(0, i)]; return Math.max(q.x0 * TS + 10, Math.min((q.x1 + 1) * TS - 10, x)); };
  const kx = e.x, dx = Math.abs(kx - P.x), side = Math.sign(P.x - kx) || 1, same = hisT === my && onTier(my) && e.mode !== 'dive' && e.mode !== 'climb', hitR = s.reach + 9 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  /* the lines on my yard (px) and which way to grab each (a net rising over it: up; one hanging from it: down) */
  const linesOn = i => { const r = T[i].row, q = T[i], o = []; for (const [x0, x1, y0, y1] of G.nets) { if (x0 < q.x0 - 1 || x1 > q.x1 + 1) continue; const x = (x0 + 1) * TS; if (y0 <= r - 1 && y1 >= r - 1) o.push({ x, up: true }); else if (y0 <= r && y1 >= r + 1) o.push({ x, up: false }); } return o; };
  /* climb UP to yard b: a net whose TOP is b's row (it stands you on it) and that reaches down to my hands */
  const upNet = b => { let best = null, bd = 1e9; for (const [x0, x1, y0, y1] of G.nets) { if (y0 !== T[b].row || (y1 + 1) * TS < P.y - 10) continue; const x = (x0 + 1) * TS, d = Math.abs(x - P.x); if (d < bd) { bd = d; best = x; } } return best; };
  /* 0. ON A LINE: hold it through a sweep; otherwise climb on to where it goes, or off */
  const sweepOn = e.mode === 'braceTell' || (e.sweepCD > 0) || !!e.sweep;
  if (P.climb) { if (sweepOn) { out.hold = true; out.why = 'hold on: the sweep'; return out; }
    if (mem.after === 'hop') { out.hop = true; out.gx = e.x; out.why = 'off the line: hop down onto the yard'; return out; }
    out.up = true; out.why = 'up the line'; return out; }
  if (P.ground) mem.after = null;
  /* 0b. THE ROD's told tail: never in its column (off a line in it with a hop) */
  const k0 = G.rod ? G.rod.charge : 0, told0 = G.told(k0); if (told0 && Math.abs(P.x - G.rodX) < G.CAP3.rodCol + 6) { const out0 = Math.sign(P.x - G.rodX) || (Math.sign(P.x - e.x) || 1);
    if (P.climb) { out.hop = true; out.gx = G.rodX + out0 * 60; out.why = 'off the line: the rod'; return out; } out.gx = G.rodX + out0 * (G.CAP3.rodCol + 26); out.why = 'out of the rod column'; return out; }
  /* 1. IN THE SEA: up the nearest line out of it */
  if (P.swim || (G.seaY && P.y > G.seaY - 4)) { const hand = P.y - 8; let best = null, bd = 1e9;   /* a line my hands reach from the water */
    for (const [x0, , y0, y1] of G.nets) { if (y0 * TS > hand || (y1 + 1) * TS < hand) continue; const x = (x0 + 1) * TS, d = Math.abs(x - P.x); if (d < bd) { bd = d; best = x; } }
    if (best !== null) { out.gx = best; out.up = Math.abs(best - P.x) < 6; mem.after = 'up'; out.why = 'out of the sea: up a line'; return out; }
    /* or a yard or the main top just over the surface: under it and LEAP (a jump at the surface) */
    let plat = null; for (const q of (G.plats || [])) { const top = q.row * TS; if (top > G.seaY || G.seaY - top > 56) continue; const cx = (q.x0 + q.x1 + 1) / 2 * TS, d = Math.abs(cx - P.x); if (!plat || d < plat.d) plat = { d, x0: q.x0 * TS + 12, x1: (q.x1 + 1) * TS - 12 }; }
    if (plat) { const inside = P.x > plat.x0 && P.x < plat.x1; out.gx = inside ? P.x : Math.max(plat.x0 + 8, Math.min(plat.x1 - 8, P.x)); out.jump = inside; out.swimJump = inside; out.why = 'out of the sea: leap onto the yard'; return out; }
    out.gx = G.rodX; out.why = 'out of the sea: to the mast'; return out; }
  /* 1b. UNDER MY YARD (on the main top, or knocked down): up the net whose top is it */
  if (my >= 0 && P.ground && P.y > T[my].row * TS + 8) { let x = upNet(my); if (x === null) { let bd = 1e9; for (const [x0, , y0, y1] of G.nets) { if ((y1 + 1) * TS < P.y - 10 || y0 * TS >= P.y - 20) continue; const nx = (x0 + 1) * TS, d = Math.abs(nx - P.x); if (d < bd) { bd = d; x = nx; } } }   /* (none straight to it: any line up from here - the main shrouds to the top, then the top's own to the yard) */
    if (x !== null) { out.gx = x; if (Math.abs(x - P.x) < 5) { out.up = true; mem.after = 'up'; } out.why = 'up to the yard'; return out; } }
  /* 2. BRACE!: to a line on my yard and take hold (his own when I am nearer it than he is) */
  if (sweepOn && my >= 0 && onTier(my) && seenFor('br' + Math.floor((e.braceN || 0)) + '.' + (e.line ?? 'x'), s.v2 ? 0 : 0.18)) { const L0 = linesOn(my);
    let pick = null, pd = 1e9; for (const l of L0) { const d = Math.abs(l.x - P.x); if (d < pd) { pd = d; pick = l; } }
    if (e.line != null && hisT === my) { const his = L0.find(l => Math.abs(l.x - e.line) < 4); if (his && Math.abs(his.x - P.x) < Math.abs(his.x - kx) - 10 && roll('take' + e.line + '.' + Math.floor(t / 8), CPLAN.lineTake)) pick = his; }
    if (pick) { out.gx = pick.x; if (Math.abs(pick.x - P.x) < 5) { if (pick.up) out.up = true; else out.down = true; mem.after = pick.up ? 'hop' : 'up'; } out.why = 'BRACE!: take a line'; return out; } }
  if (e.sweep && !P.climb && P.ground && Math.abs(e.sweep.x - P.x) < 60 && (e.sweep.dir > 0 ? e.sweep.x < P.x : e.sweep.x > P.x) && !s.noRoll) { out.dodge = true; out.gx = P.x - e.sweep.dir * 20; out.why = 'roll under the crest'; return out; }
  /* 3. THE WATER-LUNGE: off the ring */
  if ((e.mode === 'dive' || e.mode === 'surgeTell') && seenFor('dv' + Math.floor(t / 3))) { const rx = e.mode === 'surgeTell' ? e.surgeX : kx; if (Math.abs(rx - P.x) < 54) { const away = clamp(rx + (Math.sign(P.x - rx) || 1) * 70); out.gx = Math.abs(away - rx) < 50 ? clamp(rx - (Math.sign(P.x - rx) || 1) * 70) : away;
      if (e.mode === 'surgeTell' && P.ground) { if (s.noRoll) out.jump = true; else out.dodge = true; out.why = 'roll off the ring'; return out; } out.why = 'off the ring'; return out; } out.gx = P.x; out.why = 'watch the ring'; return out; }
  /* 4b. THE BOLT IS COMING AND HE IS IN ITS COLUMN: hold (guard up) and let it fall on him */
  { const k1 = G.rod ? G.rod.charge : 0; if (G.told(k1) && Math.abs(kx - G.rodX) < G.CAP3.rodCol && Math.abs(P.x - G.rodX) > G.CAP3.rodCol + 4 && same) { out.gx = P.x; out.face = -side; if (s.shield) out.block = true; out.why = 'let the bolt fall on him'; return out; } }
  /* 4. HIS KEG (a bomb on my yard coming at me): jump it */
  for (const b of (s.bombs || [])) if (b.capKeg && !b.dead && Math.abs(b.y - P.y) < 24 && Math.abs(b.x - P.x) < 44 && Math.sign(P.x - b.x) === Math.sign(b.vx || 1) && P.ground) { out.jump = true; out.gx = P.x; out.why = 'jump the keg'; return out; }
  /* 5. HIS BLOWS (a reaction late, some misread) */
  if (/Tell$/.test(e.mode) && e.mode !== 'braceTell' && same) {
    const miss = s.v2 ? false : roll('m' + Math.floor(t * 4) + e.mode, CPLAN.miss);
    if (seenFor('a' + Math.floor(t * 2) + e.mode) && !miss) {
      if (e.mode === 'shootTell' && Math.sign(P.x - kx) === (e.face || 1)) { if (e.modeT < 0.16 && P.ground) { if (s.noRoll || rng() < 0.35) { out.jump = true; out.gx = P.x; out.why = 'jump the shot'; } else { out.dodge = true; out.gx = clamp(P.x + side * 30); out.why = 'roll the shot'; } return out; } out.gx = P.x; out.face = -side; out.why = 'watch the pistol'; return out; }
      if ((e.mode === 'sabreTell' || e.mode === 'swayTell') && dx < 110) { if (s.shield) { out.block = true; out.face = -side; out.why = 'block the sabre'; return out; }
        if (dx < 80 && P.ground) { if (s.noRoll) { out.jump = true; out.gx = clamp(kx + side * 120); out.why = 'jump back off the sabre'; } else { out.dodge = true; out.gx = clamp(kx + side * 120); out.why = 'roll back off the sabre'; } return out; }
        out.gx = clamp(kx + side * 120); out.why = 'back off the sabre'; return out; }
      if (e.mode === 'hookTell') { const L0 = linesOn(my); const l = L0.find(q => Math.abs(q.x - P.x) < 20); if (l) { out.gx = l.x; if (Math.abs(l.x - P.x) < 5) { if (l.up) out.up = true; else out.down = true; mem.after = l.up ? 'hop' : 'up'; } out.why = 'a line beats his grapnel'; return out; } if (s.shield) { out.block = true; out.face = -side; out.why = 'block the grapnel'; return out; } }
      if (e.mode === 'kegTell') { out.gx = P.x; out.face = -side; out.why = 'watch the keg'; return out; }
    } }
  if ((e.mode === 'sabre1' || e.mode === 'sabre2') && same && dx < 70) { if (s.shield) { out.block = true; out.face = -side; out.why = 'block the cut'; return out; } }
  /* 6. OPEN: cut him */
  if (cpOpen(e)) { if (!same) return follow('to him: he is open'); out.gx = clamp(kx + side * Math.min(hitR - 6, 14)); if (dx < hitR + 4) swing(kx); out.why = 'cut him: ' + (e.mode === 'beach' ? 'flat' : e.struck ? 'struck' : 'turned'); return out; }
  if (e.ward > 0) { if (!same) return follow('his ward: follow'); out.gx = clamp(kx + side * 90); out.face = -side; out.why = 'his ward: off him'; return out; }
  /* 7. THE ROD: its tail - be out of the column, and have him come into it */
  const k = G.rod ? G.rod.charge : 0, told = G.told(k), rx = G.rodX, col = G.CAP3.rodCol;
  if (k > CPLAN.baitFrom && my === hisT && onTier(my)) { const far = Math.sign(rx - kx) || 1, spot = clamp(rx + far * CPLAN.baitAt);
    if (Math.abs(P.x - rx) < col + 6 && told) { out.gx = spot; out.why = 'out of the column'; return out; }
    if (Math.abs(kx - rx) > col - 4 || !told) { out.gx = spot; out.face = Math.sign(kx - P.x) || 1; out.why = 'bait the rod: past the column from him'; if (dx < hitR && !COMMIT.has(e.mode)) swing(kx); return out; } }
  if (s.rest) { out.gx = same ? clamp(kx + side * 90) : P.x; out.why = 'winded: off him'; return out; }
  /* 8. ON ANOTHER YARD: follow him (on its feet: in the air it only steers) */
  if (!P.ground && !P.climb) { out.gx = same ? clamp(kx + side * (hitR - 6)) : P.x; out.why = 'in the air'; return out; }
  if (!same) return follow('to his yard');
  /* 9. THE DUEL */
  if (COMMIT.has(e.mode)) { if (dx < hitR) { swing(kx); out.gx = P.x; out.why = 'cut him in his recovery'; return out; } out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in on his recovery'; return out; }
  if (dx > hitR + 26) { out.gx = clamp(kx + side * (hitR - 6)); out.face = -side; out.why = 'in to him'; return out; }
  out.face = -side;
  if (e.mode === 'stride' && roll('chip' + Math.floor(t * 2), 0.22) && dx < hitR) { swing(kx); out.gx = P.x; out.why = 'a cut into his guard'; return out; }
  out.gx = clamp(kx + side * (hitR + 10)); out.why = 'on his guard: wait for his blow'; return out;
  function follow(why) {
    if (hisT > my) { const x = upNet(my + 1); if (x !== null) { out.gx = x; if (Math.abs(x - P.x) < 5 && P.ground) { out.up = true; mem.after = 'up'; } out.why = why + ': up'; return out; } }
    if (hisT < my && hisT >= 0) { const q = T[hisT]; out.gx = Math.max(q.x0 * TS + 12, Math.min((q.x1 + 1) * TS - 12, P.x)); out.drop = P.ground; out.why = why + ': drop through'; return out; }
    if (P.ground && my >= 0 && P.y < T[my].row * TS - 6) { out.gx = clamp(P.x + (Math.sign(kx - P.x) || 1) * 40); out.why = why + ': step off the line onto the yard'; return out; }
    out.gx = clamp(kx + side * (hitR - 6)); out.why = why; return out; }
}
