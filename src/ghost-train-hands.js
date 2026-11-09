// src/ghost-train-hands.js - THE GHOST TRAIN's HANDS (claude/ghosttrain, the OPUS GREYBOX). src/ghost-train.js lays the train; this runs it: THE MOTION (the wind on the
// roofs, the told low bridges and tunnels sweeping down the train, the gusts, the stack's sparks), THE LAMPS (lit / out / guttering; a tunnel puts the draughty ones out),
// THE GHOST PASSENGERS (asleep in a lamp's light, awake in the dark: their own small machine), THE COUPLINGS (a pin struck from the car ahead leaves the car behind on the
// line), THE POINTS (a lever: straight on into the tunnel, or the branch), and THE TRACKS (a hero who falls between cars is hurt and put back on the train, never killed).
// GREYBOX DRAWING (the sonnet art lane draws the final): flat shapes in the act's palette. main.js calls (one tagged line each): spawn, ghost, takeGhost, on, reset, update,
// strike, drawBack, drawOver, drawGhost, read. Pure enough for node: tools/ghosttrain.mjs drives it with a fake ctx.
import { GT } from './ghost-train.js';
import { GT_SAY } from './gt-lines.js';

export const GHOST = { hp: 34, stokerHp: 50, speed: 42, wake: 0.6, settle: 0.5, sense: 220, senseY: 120, graspTell: 0.5, grasp: 0.2, reach: 22, dmg: 12, stokerDmg: 14, cd: 1.1, darkFor: 0.25 };
export const MOTION = { bridgeDmg: 18, tunnelDmg: 22, again: 0.9, flicker: 1.2, tracks: 20, cutTell: 0.5, recede: 2.2, sparkR: 13 };
const SOUND = { low: s => (s.whistle || s.tell)(), tunnel: s => (s.whistle || s.tell)(), gust: s => (s.gust || s.whoosh || s.tell)(), lit: s => (s.ui || s.tell)(), out: s => (s.puff || s.thud || s.tell)(),
  wake: s => (s.ghostWake || s.moan || s.tell)(), graspTell: s => (s.tell)(), grasp: s => (s.whoosh || s.tell)(), pin: s => (s.clank || s.thud)(), part: s => (s.crack || s.clank || s.thud)(),
  points: s => (s.clank || s.ui || s.thud)(), tracks: s => (s.thud)(), ember: s => (s.sizzle || s.puff || s.thud)(), sparksTell: s => (s.tell)() };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };

export function makeGhostTrainHands(ctx) {
  const H = {}; let S = null;
  const TS = ctx.TS, L = () => ctx.L, gt = () => (L() && L().gt) || null;
  const snd = k => { const f = SOUND[k]; if (f && ctx.sfx) try { f(ctx.sfx); } catch {} };
  const say = (x, y, t, col) => ctx.number && ctx.number(x, y, t, col || '#ffd36b');
  H.on = () => !!(L() && L().ghostTrain);
  H.show = () => S;
  const fresh = () => ({ t: 0, cells: new Map(), cut: new Set(), fired: new Set(), zoneT: {}, tun: null, gust: 0, gustTell: 0, events: [], embers: [], sparkT: {}, recede: [], pend: [], queue: [], told: {}, n: { bridges: 0, tunnels: 0, gusts: 0, hits: 0, snuffed: 0, lit: 0, out: 0, cuts: 0, points: 0, caught: 0, woke: 0, embers: 0 } });
  /* ---------------- THE TILES this level changes (a cut car, a gangway, a punched hole): every original kept, every one put back on a reset ---------------- */
  H.setCell = (x, y, t) => { if (!S) S = fresh(); const L0 = L(); if (x < 0 || y < 0 || x >= L0.W || y >= L0.H) return; const k = y * L0.W + x; if (!S.cells.has(k)) S.cells.set(k, L0.grid[k]); ctx.cellSet(x, y, t); };
  H.restoreCell = (x, y) => { const L0 = L(), k = y * L0.W + x; if (S && S.cells.has(k)) { ctx.cellSet(x, y, S.cells.get(k)); S.cells.delete(k); } };
  H.reset = () => { if (S) for (const [k, v] of S.cells) { const L0 = L(); ctx.cellSet(k % L0.W, Math.floor(k / L0.W), v); }
    S = fresh(); const G = gt(); if (!G) return;
    for (const lp of G.lamps) { lp.on = lp.lit; lp.oilT = lp.lit ? 0 : 0; lp.flick = 0; }
    for (const p of G.points) p.set = 'straight';
    for (const c of G.couplings) c.cut = false; };
  /* ---------------- WHERE THINGS ARE ---------------- */
  const carAt = x => { const G = gt(); if (!G) return null; const tx = Math.floor(x / TS); return G.cars.find(c => tx >= c.x0 && tx <= c.x1 && !(S && S.cut.has(c.i))) || null; };
  H.carAt = carAt;
  const gapAt = x => { const G = gt(); const tx = Math.floor(x / TS); return G ? G.couplings.find(c => tx >= c.g0 && tx <= c.g1) : null; };
  /* EXPOSED: on top of the train, in the wind and under the bridges (a roof, a heap over a truck's sides, the boiler; the end decks of the well wagon) */
  H.exposed = p => { const c = carAt(p.x); if (c) return p.y <= c.expose; return !!gapAt(p.x) && p.y <= GT.ROOF * TS + 2; };
  const lampLights = (lp, x, y) => lp.on && Math.abs(lp.x - x) <= lp.r && y > (GT.ROOF - 1) * TS;   /* a lamp lights its own car, not the sky over it */
  H.litAt = (x, y) => { const c = carAt(x), G = gt(); if (!c || !G) return false; return G.lamps.some(lp => lp.car === c.i && lampLights(lp, x, y) && (y <= GT.FLOOR * TS + 2)) && y > c.expose - 2; };
  const heroes = () => (ctx.players() || []).filter(p => p && !p.dead);
  const lead = () => heroes().reduce((m, p) => Math.max(m, p.x), -1e9);
  /* ---------------- THE MOTION ---------------- */
  const front = () => L().W * TS;
  /* A BRIDGE OR A TUNNEL is met by the train at its front and passes down it at the train's speed: its mouth reaches the lead hero `tell` s after it is called (the told beat is the hero's,
     not the engine's), then sweeps on back over the rest of the train. The span it covers is [mouth, mouth + len] */
  const tunSpan = () => { const T0 = S.tun; if (!T0) return null; const m = T0.m0 - GT.speed * T0.t; return [m, m + T0.len]; };
  const told = () => !!S.tun && S.tun.t < S.tun.tell;
  H.tunSpan = () => (S ? tunSpan() : null);
  function fire(ev, src) {
    if (!ev || ev.kind === 'open') return;
    const x = lead();
    if (ev.kind === 'bridge' || ev.kind === 'tunnel') { if (S.tun) { if (String(src || '').startsWith('j')) S.queue.push([ev, src]); return; }   /* a junction's tunnel waits for the one in hand to pass (a zone's bridge is simply skipped) */ S.tun = { kind: ev.kind, t: 0, tell: ev.tell || 1.4, m0: Math.min(front(), x + GT.speed * (ev.tell || 1.4) + 8), len: ev.len, key: ev.kind + (++S.n[ev.kind === 'bridge' ? 'bridges' : 'tunnels']), last: new Map(), snuffed: false, src };
      say(x, (GT.ROOF - 3) * TS, ev.kind === 'bridge' ? GT_SAY.low : GT_SAY.tunnel, '#ff9a5c'); snd(ev.kind === 'bridge' ? 'low' : 'tunnel'); if (!S.told.duck) { S.told.duck = 1; ctx.hint && ctx.hint(GT_SAY.duck); } return; }
    if (ev.kind === 'gust') { S.gustTell = ev.tell || 1.2; S.gustDur = ev.dur || 3; S.n.gusts++; say(x, (GT.ROOF - 3) * TS, GT_SAY.gust, '#bfe6f5'); snd('gust'); }
  }
  H.fire = fire;
  function stepMotion(dt) {
    const G = gt(), lx = lead();
    for (const j of G.track) if (!S.fired.has(j.id) && lx >= j.at * TS) { S.fired.add(j.id); const p = G.points.find(q => q.id === j.points); fire(p && p.set === 'branch' ? j.branch : j.straight, j.id); S.lastJunction = { id: j.id, set: p ? p.set : 'straight' }; }
    for (const z of G.zones) { if (lx < z.x0 * TS || lx > (z.x1 + 1) * TS) continue; S.zoneT[z.id] = (S.zoneT[z.id] ?? (z.every - (z.phase || 0))) + dt; if (S.zoneT[z.id] >= z.every && !S.tun) { S.zoneT[z.id] = 0; fire(z.ev, z.id); } }
    if (S.gustTell > 0) { S.gustTell -= dt; if (S.gustTell <= 0) S.gust = S.gustDur; } else if (S.gust > 0) S.gust -= dt;
    const T0 = S.tun;
    if (T0) { T0.t += dt; const sp = tunSpan();
      if (sp && T0.kind === 'tunnel') { let n = 0; for (const lp of G.lamps) if (lp.on && lp.draught && !S.cut.has(lp.car) && lp.x >= sp[0] && lp.x <= sp[1]) { lp.on = false; n++; } S.n.snuffed += n; if (n && !T0.snuffed) { T0.snuffed = true; say(lx, (GT.ROOF + 2) * TS, GT_SAY.snuffed, '#bfe6f5'); } }   /* a tunnel puts each draughty lamp out as it reaches it */
      if (sp && sp[1] < 0) { S.tun = null; if (S.queue.length) fire(...S.queue.shift()); }
      else if (sp) for (const p of heroes()) { if (!H.exposed(p) || p.ducking || !(ctx.upright ? ctx.upright(p) : true) || p.x < sp[0] || p.x > sp[1]) continue;
        const last = T0.last.get(p); if (last !== undefined && T0.t - last < MOTION.again) continue; T0.last.set(p, T0.t); S.n.hits++;
        ctx.asPlayer(p, () => ctx.damage(p.x + 20, T0.kind === 'bridge' ? MOTION.bridgeDmg : MOTION.tunnelDmg, { name: T0.kind === 'bridge' ? 'THE LOW BRIDGE' : 'THE TUNNEL', unblockable: true, low: false })); p.vx = -140; p.vy = Math.min(p.vy || 0, -60); } }
    /* THE WIND: an exposed hero on his feet is pushed toward the back (a ducked one braces) */
    const w = GT.wind + (S.gust > 0 ? GT.gust : 0);
    for (const p of heroes()) if (H.exposed(p) && !p.ducking && !p.zip) { if (ctx.moveBody) ctx.moveBody(p, -w * dt, 0); else p.x -= w * dt; }
    /* THE STACK'S SPARKS over the coal trucks (not in a tunnel: no sky) */
    for (const z of G.sparks) { if (lx < z.x0 * TS || lx > (z.x1 + 1) * TS || S.tun) continue; S.sparkT[z.id] = (S.sparkT[z.id] || 0) + dt;
      if (S.sparkT[z.id] >= z.every) { S.sparkT[z.id] = 0; const hs = heroes().filter(p => p.x >= z.x0 * TS && p.x <= (z.x1 + 1) * TS);
        for (let i = 0; i < z.n; i++) { const h = hs[i % Math.max(1, hs.length)], x = h ? h.x + (i < hs.length ? 0 : (i % 2 ? 1 : -1) * 28 * Math.ceil(i / 2)) : (z.x0 + (z.x1 - z.x0) * (i + 0.5) / z.n) * TS;
          S.embers.push({ x, y: h ? h.y : GT.TUB * TS, t: z.tell + 0.3, tell: z.tell, dmg: z.dmg, key: z.id + ':' + S.t.toFixed(2) + ':' + i }); } snd('sparksTell'); } }
    for (const m of S.embers) { const was = m.t; m.t -= dt; if (was > 0.3 && m.t <= 0.3) { m.hot = true; snd('ember'); S.n.embers++; }
      if (m.hot && m.t > 0) for (const p of heroes()) if (Math.abs(p.x - m.x) < MOTION.sparkR && Math.abs(p.y - m.y) < 40 && !(p.embers || (p.embers = new Set())).has(m.key)) { p.embers.add(m.key); if (p.embers.size > 60) p.embers.clear(); ctx.asPlayer(p, () => ctx.damage(m.x, m.dmg, { name: 'SPARKS', unblockable: false, fire: true })); } }
    S.embers = S.embers.filter(m => m.t > 0);
  }
  /* ---------------- THE LAMPS ---------------- */
  function stepLamps(dt) { for (const lp of gt().lamps) { if (!lp.on || !lp.oil) { lp.flick = 0; continue; } lp.oilT -= dt; lp.flick = lp.oilT < MOTION.flicker ? 1 : 0;
    if (lp.oilT <= 0) { lp.on = false; S.n.out++; say(lp.x, lp.y + 8, GT_SAY.out, '#8a8aa0'); snd('out'); } } }
  H.toggleLamp = lp => { if (S.cut.has(lp.car)) return; lp.on = !lp.on; if (lp.on) { lp.oilT = lp.oil || 0; S.n.lit++; say(lp.x, lp.y + 8, GT_SAY.lit, '#ffe9a0'); snd('lit'); } else { S.n.out++; say(lp.x, lp.y + 8, GT_SAY.out, '#8a8aa0'); snd('out'); } };
  /* ---------------- THE COUPLINGS: the pin, struck from the car ahead; everything behind it is left on the line ---------------- */
  H.cut = (cp, by) => { const G = gt(); if (cp.cut || cp.arena || S.cut.has(cp.ahead)) return 'no';
    if (by && by.x < (cp.g1 + 1) * TS - 6) { say(cp.pinX, cp.pinY - 10, 'FROM THE CAR AHEAD', '#bfe6f5'); return 'side'; }
    if (heroes().some(p => p.x < cp.g0 * TS)) { say(cp.pinX, cp.pinY - 10, GT_SAY.friend, '#ff9a5c'); return 'friend'; }
    cp.cut = true; S.pend.push({ cp, t: MOTION.cutTell }); snd('pin'); say(cp.pinX, cp.pinY - 14, GT_SAY.cut, '#ffd36b'); void G; return 'cut'; };
  function part(cp) { const G = gt(), L0 = L(); S.n.cuts++;
    for (let x = cp.g0; x <= cp.g1; x++) for (let y = 0; y < L0.H; y++) if (L0.grid[y * L0.W + x] !== 0) H.setCell(x, y, ctx.T.AIR);
    const behind = G.cars.filter(c => c.i <= cp.behind && !S.cut.has(c.i));
    for (const c of behind) { S.cut.add(c.i); leaveCar(c); }
    for (const e of (ctx.enemies() || [])) if (e.alive && e.x < cp.g0 * TS && !e.boss) { e.alive = false; e.hp = 0; e.gtLeft = true; }
    say(cp.pinX - 40, (GT.ROOF - 2) * TS, GT_SAY.cutBehind, '#bfe6f5'); snd('part'); }
  /* a car left on the line (a hero's cut, or the Conductor's uncoupling): its tiles go, a drawing of it falls back */
  function leaveCar(c) { const L0 = L(); for (let x = c.x0; x <= c.x1; x++) for (let y = 0; y < L0.H; y++) if (L0.grid[y * L0.W + x] !== 0) H.setCell(x, y, ctx.T.AIR);
    S.recede.push({ x0: c.x0 * TS, x1: (c.x1 + 1) * TS, kind: c.kind, t: 0 }); }
  H.leaveCar = i => { const c = gt().cars[i]; if (!c || S.cut.has(i)) return; S.cut.add(i); leaveCar(c); };
  H.gangway = (g0, g1, solid) => { for (let x = g0; x <= g1; x++) for (const y of [GT.STEP, GT.FLOOR]) { if (solid) H.restoreCell(x, y); else H.setCell(x, y, ctx.T.AIR); } };
  /* ---------------- THE POINTS ---------------- */
  H.throwPoints = p => { p.set = p.set === 'straight' ? 'branch' : 'straight'; S.n.points++; say(p.x, p.y - 26, p.set === 'branch' ? GT_SAY.pointsBranch : GT_SAY.pointsStraight, '#ffd36b'); snd('points'); };
  /* ---------------- THE TRACKS: never a death - hurt, and put back on the nearest car still on the train ---------------- */
  function stepTracks() { for (const p of heroes()) { if (p.y <= GT.catchY) continue; S.n.caught++;
    const G = gt(), live = G.cars.filter(c => !S.cut.has(c.i)); const best = live.sort((a, b) => Math.abs((a.x0 + a.x1) / 2 * TS - p.x) - Math.abs((b.x0 + b.x1) / 2 * TS - p.x))[0];
    if (best) { const lo = (best.body ? best.body[0] : best.x0) + 1, hi = best.x1 - 1; p.x = Math.max(lo * TS + 8, Math.min(hi * TS + 8, p.x)); p.y = best.kind === 'coal' || best.kind === 'tender' || best.kind === 'engine' ? Math.min(best.expose, p.y) : GT.FLOOR * TS; if (best.kind === 'coal') p.y = (GT.TUB) * TS; }
    p.vx = 0; p.vy = 0; say(p.x, p.y - 30, GT_SAY.tracks, '#ff6b6b'); snd('tracks');
    ctx.asPlayer(p, () => ctx.damage(p.x, MOTION.tracks, { name: 'THE TRACKS', unblockable: true, spare: true, noKnock: true })); } }
  /* ---------------- THE STEP ---------------- */
  H.update = dt => { if (!H.on()) return; if (!S) H.reset(); S.t += dt;
    for (const q of S.pend) { q.t -= dt; if (q.t <= 0) part(q.cp); } S.pend = S.pend.filter(q => q.t > 0);
    for (const r of S.recede) r.t += dt; S.recede = S.recede.filter(r => r.t < MOTION.recede);
    stepMotion(dt); stepLamps(dt); stepTracks(); };
  /* ---------------- A HERO'S BLOW: a lamp, a pin, the points ---------------- */
  const hitBox = (hb, x, y, r) => hb.l < x + r && hb.r > x - r && hb.t < y + r && hb.b > y - r;
  H.strike = (hb, by) => { if (!H.on() || !hb) return; if (!S) H.reset(); const G = gt(), once = o => !ctx.hitOnce || ctx.hitOnce(o), who = by || (ctx.hero && ctx.hero());
    for (const lp of G.lamps) if (!S.cut.has(lp.car) && hitBox(hb, lp.x, lp.y, 9) && once(lp)) H.toggleLamp(lp);
    for (const cp of G.couplings) if (!cp.cut && !cp.arena && hitBox(hb, cp.pinX, cp.pinY, 10) && once(cp)) H.cut(cp, who);
    for (const p of G.points) if (hitBox(hb, p.x, p.y - 10, 10) && once(p)) H.throwPoints(p); };
  /* ---------------- THE GHOST PASSENGERS ---------------- */
  H.spawn = (e, base) => { if (e.t !== 'gtghost') return null; const hp = e.stoker ? GHOST.stokerHp : GHOST.hp;
    return { ...base, t: 'gtghost', w: 10, h: 14, hp, maxHp: hp, noGrav: true, mode: 'sleep', modeT: 0, hx: base.x, hy: base.y, car: e.car, stoker: !!e.stoker, seat: !!e.seat, darkT: 0, squad: e.squad }; };
  H.asleep = e => e && e.t === 'gtghost' && (e.mode === 'sleep' || e.mode === 'settle');
  H.takeGhost = (e, dmg) => { if (!H.asleep(e)) return dmg; if (!S.told.sleeps) { S.told.sleeps = 1; ctx.hint && ctx.hint('THE DEAD SLEEP IN THE LIGHT: PUT THE LAMP OUT TO FIGHT THEM, OR LET THEM SLEEP.'); } say(e.x, e.y - 22, GT_SAY.sleeps, '#bfe6f5'); return 0; };
  H.ghost = (e, dt) => { if (!S) H.reset(); e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.vx = (e.vx || 0) * Math.pow(0.02, dt); e.x += e.vx * dt;
    const lit = H.litAt(e.x, e.y - 4);
    if (e.mode === 'sleep') { e.darkT = lit ? 0 : e.darkT + dt; e.y += (e.hy - e.y) * Math.min(1, dt * 2) * (Math.abs(e.x - e.hx) < 4 ? 1 : 0); if (e.darkT >= GHOST.darkFor) { e.mode = 'wake'; e.modeT = GHOST.wake; S.n.woke++; snd('wake'); if (!S.told['woke' + e.car]) { S.told['woke' + e.car] = 1; say(e.x, e.y - 24, GT_SAY.wakes, '#ff9a5c'); } } return; }
    if (e.mode === 'settle') { if (!lit) { e.mode = 'drift'; e.modeT = 0; } else if (e.modeT <= 0) e.mode = 'sleep'; return; }
    if (lit && e.mode !== 'grasp') { e.mode = 'settle'; e.modeT = GHOST.settle; e.darkT = 0; return; }
    if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'drift'; e.modeT = 0; } return; }
    const tgt = heroes().filter(p => Math.abs(p.x - e.x) < GHOST.sense && Math.abs(p.y - e.y) < GHOST.senseY).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
    if (e.mode === 'graspTell') { if (e.modeT <= 0) { e.mode = 'grasp'; e.modeT = GHOST.grasp; snd('grasp');
        for (const p of heroes()) if (Math.sign(p.x - e.x) === e.face && Math.abs(p.x - e.x) < GHOST.reach + 6 && Math.abs(p.y - e.y) < 18) ctx.asPlayer(p, () => ctx.damage(e.x, e.stoker ? GHOST.stokerDmg : GHOST.dmg, { who: e, name: e.stoker ? 'A DEAD FIREMAN' : 'A GHOST PASSENGER' })); } return; }
    if (e.mode === 'grasp') { if (e.modeT <= 0) { e.mode = 'drift'; e.modeT = GHOST.cd; } return; }
    if (!tgt) return;
    const dx = tgt.x - e.x, dy = (tgt.y) - e.y; e.face = Math.sign(dx) || e.face || 1;
    if (Math.abs(dx) < GHOST.reach && Math.abs(dy) < 16 && e.modeT <= 0) { e.mode = 'graspTell'; e.modeT = GHOST.graspTell; snd('graspTell'); ctx.number && ctx.number(e.x, e.y - 22, '!', '#ffd36b'); return; }
    const d = Math.hypot(dx, dy) || 1, v = GHOST.speed * (e.stoker ? 0.85 : 1); e.x += dx / d * v * dt; e.y += dy / d * v * dt; };
  /* ---------------- WHAT A TOOL READS ---------------- */
  H.read = () => S && { t: +S.t.toFixed(2), tun: S.tun ? { kind: S.tun.kind, t: +S.tun.t.toFixed(2), tell: S.tun.tell, told: told(), span: tunSpan() } : null, gust: S.gust > 0, cut: [...S.cut], fired: [...S.fired], lastJunction: S.lastJunction || null,
    lamps: gt().lamps.map(lp => ({ id: lp.id, on: lp.on, flick: lp.flick })), points: gt().points.map(p => ({ id: p.id, set: p.set })), embers: S.embers.length, n: { ...S.n } };
  /* ================= THE GREYBOX DRAWING ================= */
  const X = cx => v => R(v - cx), Y = cy => v => R(v - cy);
  /* behind the tiles: the night, THE GROUND STREAMING PAST under and behind the train (sleepers, telegraph poles, the hexed fields' fences), a tunnel's walls */
  H.drawBack = (g, cx, cy, VW, VH, time) => { if (!H.on() || !S) return; const x = X(cx), y = Y(cy), G = gt(), sp = GT.speed;
    const groundY = y((GT.FLOOR + 3) * TS);
    rect(g, 0, groundY, VW, VH - groundY, '#1c1824'); rect(g, 0, groundY, VW, 2, '#4a4458');
    for (let k = 0, off = ((time * sp) % 24); k < VW / 24 + 2; k++) rect(g, R(k * 24 - off), groundY + 3, 12, 3, '#3a3040');          /* the sleepers, flying back */
    for (let k = 0, off = ((time * sp * 0.45) % 140); k < VW / 140 + 2; k++) { const px = R(k * 140 - off); rect(g, px, groundY - 70, 3, 70, '#2a2436'); rect(g, px - 8, groundY - 66, 19, 2, '#2a2436'); }   /* telegraph poles */
    for (let k = 0, off = ((time * sp * 0.2) % 60); k < VW / 60 + 2; k++) rect(g, R(k * 60 - off), groundY - 14, 2, 14, '#28222e');    /* the fields' fences, far */
    const tsn = tunSpan(); if (tsn && S.tun.kind === 'tunnel' && !told()) { const a = Math.max(0, x(tsn[0])), b = Math.min(VW, x(tsn[1])); if (b > a) { rect(g, a, 0, b - a, VH, 'rgba(6,6,12,0.86)'); rect(g, a, y((GT.ROOF - 2) * TS), b - a, 6, '#3a3444'); } }
    for (const r of S.recede) { const dx = -r.t * r.t * 90; rect(g, x(r.x0 + dx), y(GT.ROOF * TS), r.x1 - r.x0, (GT.FLOOR - GT.ROOF + 2) * TS, 'rgba(60,56,80,' + (1 - r.t / MOTION.recede).toFixed(2) + ')'); }
    /* the wheels under every car still on the train */
    for (const c of G.cars) { if (S.cut.has(c.i)) continue; for (const wx of [c.x0 + 2, c.x0 + 4, c.x1 - 4, c.x1 - 2]) { const cxp = x(wx * TS + 8), cyp = y((GT.FLOOR + 3) * TS) - 6; g.fillStyle = '#4a4458'; g.beginPath(); g.arc(cxp, cyp, 6, 0, Math.PI * 2); g.fill(); rect(g, cxp - 6 + ((time * 30) % 12 < 6 ? 0 : 6), cyp - 1, 6, 2, '#8a849a'); } } };
  /* over the tiles: the dark in a dark car, the lamps and their light, the coupling pins, the points, a bridge / tunnel tell, the sparks' marks */
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!H.on() || !S) return; const x = X(cx), y = Y(cy), G = gt();
    for (const c of G.cars) { if (S.cut.has(c.i) || !c.closed) continue; const a0 = (c.body ? c.body[0] : c.x0) + 1;
      for (let tx = a0; tx < c.x1; tx++) for (let sx = 0; sx < 2; sx++) { const px = tx * TS + sx * 8 + 4; if (x(px) < -8 || x(px) > VW + 8) continue; if (G.lamps.some(lp => lp.car === c.i && lp.on && Math.abs(lp.x - px) <= lp.r)) continue;
        const top = c.kind === 'dining' && tx > c.x0 + 4 && tx < c.x1 - 4 ? GT.CLER + 1 : GT.ROOF + 1; rect(g, x(tx * TS + sx * 8), y(top * TS), 8, (GT.FLOOR - top) * TS, 'rgba(4,4,14,0.62)'); } }
    for (const lp of G.lamps) { if (S.cut.has(lp.car)) continue; const lx = x(lp.x), ly = y(lp.y); if (lx < -40 || lx > VW + 40) continue; rect(g, lx - 1, ly - 10, 2, 6, '#5a5266');
      const on = lp.on && !(lp.flick && (time * 14) % 2 < 1); rect(g, lx - 3, ly - 5, 6, 7, on ? '#ffe9a0' : '#3a3444'); rect(g, lx - 4, ly - 6, 8, 1, '#8a849a');
      if (on) { g.fillStyle = 'rgba(255,220,140,0.10)'; g.beginPath(); g.arc(lx, ly, lp.r * 0.6, 0, Math.PI * 2); g.fill(); } }
    for (const cp of G.couplings) { if (cp.cut || S.cut.has(cp.ahead)) continue; rect(g, x(cp.pinX) - 2, y(cp.pinY) - 8, 4, 10, cp.arena ? '#6a6480' : '#c8a040'); rect(g, x(cp.g0 * TS), y(GT.FLOOR * TS) + 2, (cp.g1 - cp.g0 + 1) * TS, 3, '#5a5266'); }
    for (const p of G.points) { const px = x(p.x), py = y(p.y); rect(g, px - 4, py - 3, 8, 3, '#5a5266'); const lean = p.set === 'branch' ? 5 : -5; g.strokeStyle = '#c8a040'; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py - 3); g.lineTo(px + lean, py - 16); g.stroke(); rect(g, px + lean - 2, py - 19, 4, 4, p.set === 'branch' ? '#8fd160' : '#ff6b6b'); }
    const T0 = S.tun; if (T0 && told()) { const k = T0.t / T0.tell; rect(g, VW - 10, 0, 10, VH, 'rgba(255,90,60,' + (0.15 + 0.35 * Math.max(0, k)).toFixed(2) + ')'); }
    if (T0 && T0.kind === 'bridge') { const sp = tunSpan(); if (sp) { rect(g, x(sp[0]), y((GT.ROOF - 2) * TS) + 4, Math.max(4, sp[1] - sp[0]), 10, '#4a4458'); } }
    for (const m of S.embers) { const mx = x(m.x), my = y(m.y); if (!m.hot) { const k = 1 - Math.max(0, m.t - 0.3) / m.tell; rect(g, mx - 6, my - 1, 12, 2, 'rgba(255,90,60,' + (0.3 + 0.5 * k).toFixed(2) + ')'); rect(g, mx - 1, my - 40 + 34 * k, 2, 3, '#ffd36b'); } else { rect(g, mx - 4, my - 6, 8, 6, '#ff9a3c'); } } };
  /* A GHOST PASSENGER (greybox): a pale hooded shape, its eyes shut asleep, open and red awake, its hands out on the grasp's windup */
  H.drawGhost = (g, e, cx, cy, time) => { const ex = R(e.x - cx), ey = R(e.y - cy), bob = Math.sin(time * 3 + e.hx) * 1.5, asleep = H.asleep(e);
    const a = asleep ? 0.45 : 0.85; g.fillStyle = (e.stoker ? 'rgba(200,170,150,' : 'rgba(200,214,240,') + a + ')'; g.fillRect(ex - 5, R(ey - 14 + bob), 10, 12); g.fillRect(ex - 4, R(ey - 2 + bob), 2, 2); g.fillRect(ex + 2, R(ey - 2 + bob), 2, 2);
    g.fillStyle = asleep ? '#5a6078' : '#ff6b6b'; g.fillRect(ex - 3 + (e.face > 0 ? 1 : 0), R(ey - 11 + bob), 2, asleep ? 1 : 2); g.fillRect(ex + 1 + (e.face > 0 ? 1 : 0), R(ey - 11 + bob), 2, asleep ? 1 : 2);
    if (e.mode === 'graspTell' || e.mode === 'grasp') { g.fillStyle = '#e8ecff'; const reach = e.mode === 'grasp' ? 12 : 4; g.fillRect(ex + e.face * (5 + reach) - 2, R(ey - 9 + bob), 4, 3); }
    if (asleep) { g.fillStyle = 'rgba(191,230,245,0.7)'; g.fillRect(ex + 6, R(ey - 18 + Math.sin(time * 2) * 2), 2, 2); } };
  return H;
}
