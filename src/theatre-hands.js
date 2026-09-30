// src/theatre-hands.js - THE MASKWRIGHT'S THEATRE's hands in the game (claude/theatre). src/theatre-rig.js is the machinery (pure); this runs it
// against the live level: it strikes the gadgets, slides the flats in the grid, flies the lines, drops the traps, runs the show's cues, crushes
// with the sandbags, and draws all of it (greybox: plain shapes the art lane replaces). src/main.js hands it a context object H (its own globals
// behind functions) and calls theatreReset / theatreUpdate / theatreMover / drawTheatre / drawTheatreMover / paintTheatreRoom - so main.js
// carries only a few one-line hooks. Brief: docs/briefs/maskwright-theatre.md.
import * as TR from './theatre-rig.js';
const TS = 16;
const GADGET = new Set(['spotlamp', 'flylock', 'flatwinch', 'cuelever']);

/* A NEW ATTEMPT: the machinery as the level was built, the flats put where they stand at load, the show not started */
export function theatreReset(H) {
  const L = H.L(); if (!L || !L.theatre) return null;
  const D = L.theatre, T = H.T;
  const st = { spots: D.spots.map(TR.newSpot), lines: D.lines.map(l => ({ ...l })), traps: D.traps.map(t => ({ ...t, state: 'shut' })),
    show: { ...D.show, on: false, t: 0, lift: 0, hold: false }, told: {}, props: [], flats: [], clock: 0, choruses: (D.choruses || []).map(c => ({ ...c, t: 0 })) };
  st.spots.forEach((s, i) => { s.off = !!s.show; s.light = { x: s.x, y: s.y, r: s.r * 1.25, warm: true, thSpot: i, lantern: { lit: false } };   /* an engine light: a dark pool is a lantern that is out */ H.lights().push(s.light); });
  for (const f0 of D.flats) {
    const f = { ...f0, base: new Map(f0.base.map(([x, y, t]) => [x + ',' + y, t])) };
    const tools = f.tools === 'A' ? f.a : f.b, init = f.init === 'A' ? f.a : f.b;
    for (const [x, y] of TR.flatCells(f, tools)) H.cellSet(x, y, f.base.get(x + ',' + y));
    for (const [x, y] of TR.flatCells(f, init)) H.cellSet(x, y, T.SOLID);
    f.at = f.to = init; f.t = 0; f.held = false; f.warn = false; st.flats.push(f);
  }
  for (const tr of st.traps) for (let x = tr.x0; x <= tr.x1; x++) H.cellSet(x, tr.row, T.ONEWAY);
  for (const e of L.ents) if (GADGET.has(e.t)) st.props.push({ t: e.t, e, x: e.x * TS + 8, y: (e.y + 1) * TS, hang: !!e.hang, spot: e.spot, line: e.line, flat: e.flat, flash: 0 });
  H.resolve();
  return st;
}

/* is (x, y), a figure's feet, standing in a lit pool? */
export const litAt = (st, H, x, y) => !!(st && TR.litBy(st.spots, x, y, (px, py) => H.isSolid(Math.floor(px / TS), Math.floor(py / TS))));

function hint(st, H, key, msg) { if (st.told[key]) return; st.told[key] = 1; H.hint(msg); }

/* a flat's next step: the cells it would fill must be clear of anybody it cannot shove (a body is shoved a column along; a flown shutter shoves nobody) */
function flatCanStep(st, H, f, next) {
  const now = new Set(TR.flatCells(f, f.at).map(([x, y]) => x + ',' + y)), fresh = TR.flatCells(f, next).filter(([x, y]) => !now.has(x + ',' + y));
  const dir = Math.sign(next - f.at);
  const hit = b => fresh.some(([x, y]) => b.r > x * TS && b.l < (x + 1) * TS && b.b > y * TS && b.t < (y + 1) * TS);
  for (const body of H.bodies()) { const b = H.box(body); if (!hit(b)) continue;
    if (f.axis === 'y') return false;
    const nx = body.x + dir * TS, nb = { l: b.l + dir * TS, r: b.r + dir * TS, t: b.t, b: b.b };
    const blocked = [Math.floor(nb.l / TS), Math.floor((nb.r - 1) / TS)].some(tx => [Math.floor(nb.t / TS), Math.floor((nb.b - 1) / TS)].some(ty => H.isSolid(tx, ty)));
    if (blocked || hit(nb)) return false;
    body.x = nx; }
  return true;
}
function flatMove(H, f, from, to) {
  const T = H.T, fill = new Set(TR.flatCells(f, to).map(([x, y]) => x + ',' + y));
  for (const [x, y] of TR.flatCells(f, from)) if (!fill.has(x + ',' + y)) H.cellSet(x, y, f.base.get(x + ',' + y));
  for (const [x, y] of TR.flatCells(f, to)) H.cellSet(x, y, T.SOLID);
}

/* one frame of the theatre */
export function theatreUpdate(st, H, dt) {
  if (!st) return; const L = H.L(), T = H.T, S = H.sfx;
  // ---- THE STRIKES: any hero's blow on a lamp, a rope-lock or a winch ----
  H.eachHero(P => { const hb = H.attackBox(); if (!hb || P.dead) return;
    for (const pr of st.props) { if (P.hitSet.has(pr)) continue;
      const top = pr.t === 'spotlamp' ? (pr.hang ? pr.y - 22 : pr.y - 30) : pr.y - 24, box = { l: pr.x - 11, r: pr.x + 11, t: top, b: pr.y + 2 };
      if (!H.overlap(hb, box)) continue; P.hitSet.add(pr); pr.flash = 0.25; H.sparks(pr.x, pr.y - 12, P.face || 1, 4);
      if (pr.t === 'spotlamp') { const s = st.spots[pr.spot]; if (s.off) { S.clank(); continue; } TR.strikeSpot(s); S.clank(); S.lampUp && S.lampUp();
        hint(st, H, 'lamp', 'THE LAMP SWINGS. WHATEVER STANDS IN ITS LIGHT IS SEEN: IT CANNOT MOVE, WHICHEVER WAY YOU FACE.'); }
      else if (pr.t === 'cuelever') { const sh = st.show; sh.hold = !sh.hold; for (const s of st.spots) if (s.cue && s.show) s.held = sh.hold; S.clank(); S.tollBell && S.tollBell();
        hint(st, H, 'cue', sh.hold ? 'THE PROMPT DESK: THE LAMPS HOLD WHERE THEY ARE.' : 'THE PROMPT DESK: THE LAMPS TAKE THEIR CUES AGAIN.'); }
      else if (pr.t === 'flylock' && pr.line !== undefined) { const ln = st.lines.find(l => l.id === pr.line); if (!ln) continue; ln.out = !ln.out; S.ratchet ? S.ratchet() : S.clank(); S.ropeHaul && S.ropeHaul();
        hint(st, H, 'line', 'THE LINE RUNS: THE BATTEN ONE WAY, ITS SANDBAG THE OTHER.'); }
      else { const f = st.flats[pr.flat]; if (!f) continue; if (f.cue) f.held = true; f.to = f.to === f.a ? f.b : f.a; S.chain ? S.chain() : S.clank(); S.gateLift();
        hint(st, H, f.axis === 'y' ? 'shutter' : 'flat', f.axis === 'y' ? 'SOMETHING PAINTED FLIES OUT. THE WALL WAS A SHUTTER.' : 'THE FLAT RUNS ALONG ITS TRACK.'); }
    } });
  for (const pr of st.props) if (pr.flash > 0) pr.flash -= dt;
  // ---- THE SHOW: the curtain goes up when a hero sets foot on the stage, and the prompt book runs from then on ----
  const sh = st.show;
  if (!sh.on) { H.eachHero(P => { if (!P.dead && P.x > sh.x0 && P.x < sh.x1 && P.y > sh.y0 && P.y <= sh.y1 + 2 && P.ground) sh.on = true; });
    if (sh.on) { for (const s of st.spots) if (s.show) s.off = false; S.sting(); S.calliope && S.calliope(); H.shake(3);
      H.hint('THE CURTAIN RISES. THE LAMPS KEEP THEIR CUES, THE CAST FREEZES IN THE LIGHT, AND THE AUDIENCE THROWS AT WHATEVER IS LIT.'); } }
  if (sh.on) { sh.t += dt; sh.lift = Math.min(1, sh.lift + dt / 1.6); }
  st.clock += dt;   /* the clock of the cues that run whether or not the show has started (the sump's flat, the far wing's follow spot) */
  // ---- THE CHORUS: the wardrobe sends them out after you ----
  for (const c of st.choruses) { const P = H.hero(), px = c.x * TS + 8, py = (c.y + 1) * TS;
    const near = !!P && !P.dead && P.x > px + 40 && Math.abs(P.x - px) < 420 && Math.abs(P.y - py) < 48;
    const mine = H.enemies().filter(e => e.alive && e.chorusOf === c), busy = H.enemies().some(e => e.alive && Math.abs(e.x - px) < 14 && Math.abs(e.y - py) < 12);
    if (TR.chorusStep(c, dt, near, mine.length, busy)) { const e = H.spawn('mummer', c.x, c.y, { face: 1, squad: c.squad }); if (e) { e.chorusOf = c; if (H.near(px, py, 300)) H.sfx.mummerBell && H.sfx.mummerBell(); } } }
  // ---- THE LAMPS ----
  const solidPx = (px, py) => H.isSolid(Math.floor(px / TS), Math.floor(py / TS));
  for (const s of st.spots) { TR.spotStep(s, dt, sh.on || s.always); const p = TR.poolOf(s), clear = !s.off && TR.beamClear(s, solidPx, p);
    s.clear = clear; s.light.x = p.x; s.light.y = p.y - 10; s.light.lantern.lit = clear; }
  // ---- THE FLATS ----
  for (const f of st.flats) {
    if (f.cue && (sh.on || f.cue.always) && !f.held) { const c = TR.flatCue(f, f.cue.always ? st.clock : sh.t); const want = c.posB ? f.b : f.a; if (c.warn && !f.warn && H.near(f.a * TS, f.y0 * TS, 300)) S.tollBell ? S.tollBell() : S.clank(); f.warn = c.warn; if (want !== f.to) f.to = want; }
    const from = f.at, r = TR.flatStep(f, dt, next => flatCanStep(st, H, f, next));
    if (r === 'step' || r === 'done') { flatMove(H, f, from, f.at); if (H.near((f.axis === 'y' ? f.x0 : f.at) * TS, (f.axis === 'y' ? f.at : f.y0) * TS, 320)) S.stone(); }
    if (r === 'done') { H.resolve(); S.thud(); H.shake(1); }
  }
  // ---- THE TRAPS: on the show's cue they drop; a trap with somebody in its boards stays open until they are through ----
  for (const tr of st.traps) { const ph = sh.on ? TR.trapPhase(tr, sh.t) : 'shut', was = tr.state;
    const busy = H.bodies().some(b => { const bx = H.box(b); return bx.r > tr.x0 * TS && bx.l < (tr.x1 + 1) * TS && bx.b > tr.row * TS + 2 && bx.t < (tr.row + 1) * TS; });
    const open = ph === 'open' || (was === 'open' && busy);
    tr.state = open ? 'open' : ph;
    if (open !== (was === 'open')) { for (let x = tr.x0; x <= tr.x1; x++) H.cellSet(x, tr.row, open ? T.AIR : T.ONEWAY); if (H.near(tr.x0 * TS, tr.row * TS, 300)) open ? S.gateDrop() : S.gateLand && S.gateLand(); } }
}

/* A BAT IN THE THEATRE (THEATRE2): it goes for whoever stands in the light, and otherwise to a lit pool; the dark is where you are safe from it */
export function batTarget(st, H, e) {
  const P = H.hero(); if (P && !P.dead && Math.abs(P.x - e.x) < 220 && Math.abs(P.y - e.y) < 300 && litAt(st, H, P.x, P.y)) return { x: P.x, y: P.y - 8, who: 'P' };
  let best = null, bd = 190; for (const s of st.spots) { if (s.off || !s.clear) continue; const p = TR.poolOf(s), d = Math.hypot(p.x - e.x, p.y - 12 - e.y); if (d < bd) { bd = d; best = { x: p.x, y: p.y - 14, who: null }; } }
  return best;
}

/* one frame of a fly line's mover (a batten or a sandbag): toward its stop; a sandbag coming down lands on whatever foe is under it */
export function theatreMover(st, H, m, dt) {
  if (!st) { m.dx = 0; m.dy = 0; return true; }
  const ln = st.lines.find(l => l.id === m.line); const out = ln ? ln.out : false;
  const step = TR.flyStep(m, out, dt); m.dx = 0; m.dy = step;
  if (m.role === 'bag' && step > 0) { for (const e of H.enemies()) { if (!e.alive || (m.hit && m.hit.has(e))) continue;
      if (TR.bagLands(m, H.box(e), step)) { (m.hit = m.hit || new Set()).add(e); H.hurt(e, TR.RIG.bagDmg, m.x + m.w / 2); H.sfx.sackThud ? H.sfx.sackThud() : H.sfx.thud(); H.shake(3); H.dust(e.x, e.y, 8); } } }
  if (step === 0 && m.moving) { m.moving = false; if (m.hit) m.hit.clear(); if (H.near(m.x, m.y, 300)) (m.role === 'bag' ? (H.sfx.sackThud || H.sfx.thud) : H.sfx.thud)(); }
  if (step !== 0) m.moving = true;
  return true;
}

/* ================= THE LOOK (greybox: plain shapes; the art lane replaces them) ================= */
export function drawTheatreMover(g, m, cx, cy, time) {
  const x = Math.round(m.x - cx), y = Math.round(m.y - cy), w = m.w, top = Math.round(4 * TS - cy);
  g.fillStyle = '#b8a888'; g.fillRect(x + 3, top, 1, y - top); g.fillRect(x + w - 4, top, 1, y - top);   /* the lines up to the grid */
  if (m.role === 'bag') { g.fillStyle = '#5a4630'; g.fillRect(x + 1, y + 2, w - 2, m.h - 2); g.fillStyle = '#7a6040'; g.fillRect(x + 1, y, w - 2, 3); g.fillStyle = '#3a2c1e'; g.fillRect(x + w / 2 - 1, y + 3, 2, m.h - 4); return; }
  g.fillStyle = '#2a2420'; g.fillRect(x, y, w, m.h); g.fillStyle = '#8a7a5a'; g.fillRect(x, y, w, 2); g.fillStyle = '#c0a060'; for (let k = 4; k < w - 2; k += 12) g.fillRect(x + k, y + 3, 4, 1);
}

export function drawTheatre(st, g, H, cx, cy, VW, VH, time) {
  if (!st) return; const L = H.L();
  // ---- the beams and the pools of light ----
  for (const s of st.spots) { if (s.off) continue; const p = TR.poolOf(s); if (p.x < cx - 80 || p.x > cx + VW + 80) continue;
    const lx = s.x - cx, ly = s.y - cy, px = p.x - cx, py = p.y - cy;
    if (s.clear) { g.globalAlpha = 0.16; g.fillStyle = '#fff2b0'; g.beginPath(); g.moveTo(lx - 2, ly); g.lineTo(lx + 2, ly); g.lineTo(px + p.r, py); g.lineTo(px - p.r, py); g.closePath(); g.fill();
      g.globalAlpha = 0.34; g.beginPath(); g.ellipse(px, py - 1, p.r, 4, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    else { g.globalAlpha = 0.5; g.strokeStyle = '#a08850'; g.setLineDash && g.setLineDash([2, 3]); g.beginPath(); g.moveTo(lx, ly); g.lineTo(px, py - 12); g.stroke(); g.setLineDash && g.setLineDash([]); g.globalAlpha = 1; } }
  // ---- the flats: a painted canvas over the rock the grid holds for them, and the track under a moving or cued one ----
  for (const f of st.flats) { const cells = TR.flatCells(f, f.at); if (!cells.length) continue;
    const x0 = Math.min(...cells.map(c => c[0])), x1 = Math.max(...cells.map(c => c[0])), y0 = Math.min(...cells.map(c => c[1])), y1 = Math.max(...cells.map(c => c[1]));
    const sx = x0 * TS - cx, sy = y0 * TS - cy, w = (x1 - x0 + 1) * TS, h = (y1 - y0 + 1) * TS; if (sx > VW || sx + w < 0 || sy > VH || sy + h < 0) continue;
    if (f.axis === 'y') { g.fillStyle = '#4a3e3a'; g.fillRect(sx, sy, w, h); g.fillStyle = '#5a4c46'; for (let k = 3; k < h; k += 8) g.fillRect(sx + 1, sy + k, w - 2, 1); continue; }   /* the prop store's shutter is painted as the wall it hides */
    g.fillStyle = '#2a2230'; g.fillRect(sx, sy, w, h); g.fillStyle = f.cue ? '#7a3a4a' : '#3a5a7a'; g.fillRect(sx + 2, sy + 2, w - 4, h - 4);
    g.fillStyle = f.cue ? '#b06070' : '#6a90b0'; for (let k = 6; k < h - 4; k += 10) g.fillRect(sx + 4, sy + k, w - 8, 2);
    if (f.warn || f.at !== f.to) { const tx0 = Math.min(f.a, f.b) * TS - cx, tx1 = (Math.max(f.a, f.b) + f.w) * TS - cx, ty = (f.y1 + 1) * TS - cy;
      g.globalAlpha = 0.5 + 0.5 * Math.sin(time * 18); g.fillStyle = '#ffd36b'; g.fillRect(tx0, ty - 2, tx1 - tx0, 2); g.globalAlpha = 1; } }
  // ---- the traps: the edges glow before they drop ----
  for (const tr of st.traps) { if (tr.state !== 'warn') continue; const sx = tr.x0 * TS - cx, w = (tr.x1 - tr.x0 + 1) * TS, sy = tr.row * TS - cy;
    g.globalAlpha = 0.5 + 0.5 * Math.sin(time * 20); g.fillStyle = '#ff6b4a'; g.fillRect(sx, sy, w, 2); g.fillRect(sx, sy, 2, 6); g.fillRect(sx + w - 2, sy, 2, 6); g.globalAlpha = 1; }
  // ---- the lamps, the rope-locks and the winches ----
  for (const pr of st.props) { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); if (x < -20 || x > VW + 20 || y < -40 || y > VH + 40) continue;
    const fl = pr.flash > 0;
    if (pr.t === 'spotlamp') { const s = st.spots[pr.spot]; const hy = Math.round(s.y - cy);
      if (!pr.hang) { g.fillStyle = '#3a3440'; g.fillRect(x - 1, hy + 4, 2, y - hy - 4); g.fillRect(x - 5, y - 2, 10, 2); } else { g.fillStyle = '#3a3440'; g.fillRect(x - 1, hy - 8, 2, 6); }
      g.fillStyle = fl ? '#ffffff' : '#50485a'; g.fillRect(x - 5, hy - 3, 10, 8); g.fillStyle = s.off ? '#5a5040' : s.clear ? '#fff2b0' : '#c0a060'; const d = Math.sign(TR.poolOf(s).x - s.x) || 1; g.fillRect(x + (d > 0 ? 3 : -5), hy - 2, 2, 6); }
    else if (pr.t === 'flylock') { const ln = pr.line !== undefined ? st.lines.find(l => l.id === pr.line) : null, out = ln ? ln.out : (st.flats[pr.flat] || {}).to === (st.flats[pr.flat] || {}).b;
      g.fillStyle = '#5a4430'; g.fillRect(x - 1, y - 22, 3, 22); g.fillStyle = fl ? '#ffffff' : out ? '#ff9a3c' : '#c8a040'; g.fillRect(x - 4, y - 18, 9, 4); g.fillStyle = '#d8c8a0'; g.fillRect(x - 3, y - 13, 7, 3); }
    else if (pr.t === 'cuelever') { g.fillStyle = '#4a3a2a'; g.fillRect(x - 7, y - 14, 14, 14); g.fillStyle = fl ? '#ffffff' : st.show.hold ? '#ff6b4a' : '#8fd160'; g.fillRect(x - 2, y - 20, 4, 6); }
    else { g.fillStyle = '#3a3a48'; g.fillRect(x - 6, y - 12, 12, 12); g.fillStyle = fl ? '#ffffff' : '#6a90b0'; g.fillRect(x - 4, y - 10, 8, 8); g.fillStyle = '#d0d8e0'; const a = time * 3; g.fillRect(x + Math.round(Math.cos(a) * 5) - 1, y - 7 + Math.round(Math.sin(a) * 5), 2, 2); }
  }
  // ---- THE CURTAIN: red over the stage until the show starts, and it rises when it does ----
  const [x0, x1, y0, y1] = st.show.curtain, k = st.show.lift, sx = x0 * TS - cx, w = (x1 - x0 + 1) * TS, full = (y1 - y0 + 1) * TS, h = Math.round(full * (1 - k)), sy = y0 * TS - cy;
  if (h > 0 && sx < VW && sx + w > 0) { g.fillStyle = '#7a1a24'; g.fillRect(sx, sy, w, h); g.fillStyle = '#9a2a30'; for (let q = 0; q < w; q += 12) g.fillRect(sx + q, sy, 4, h); g.fillStyle = '#c8a040'; g.fillRect(sx, sy + h - 3, w, 3); }
}

/* the rooms, greybox: a colour a room and a few lines, so the spaces read apart */
const ROOM = { thPassage: ['#2a2430', '#322a38'], thCostume: ['#35283a', '#3e2e44'], thWorkshop: ['#3a2c2a', '#443430'], thDock: ['#2c2a34', '#34323e'], thFly: ['#221c28', '#2a2230'],
  thStage: ['#1e1822', '#261e2a'], thUnder: ['#161218', '#1c171e'], thWings: ['#262030', '#2e2638'], thMain: ['#1a1420', '#241a2a'] };
export function paintTheatreRoom(g, st, sx, sy, w, h) {
  const c = ROOM[st]; if (!c) return false;
  g.fillStyle = c[0]; g.fillRect(sx, sy, w, h); g.fillStyle = c[1]; for (let x = sx; x < sx + w; x += 32) g.fillRect(x, sy, 2, h);
  if (st === 'thStage' || st === 'thMain') { g.fillStyle = '#2e2436'; g.fillRect(sx, sy + h - 40, w, 40); }   /* the cyclorama's foot */
  return true;
}
