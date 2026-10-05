// src/moor-rocks-hands.js - GALE MOOR's WIND ROCKS and GOBLIN SCAFFOLDS (claude/moor2, scratch/brief-moor2.md, Daniel 2026-10-03).
// The kite ride (THE KITE POST & THE SKY ROAD) is gone: flight belongs to the Sky Road now. The moor stays a GROUND level of sideways told gusts,
// and these are the two new things the wind does on it. src/level.js galeMoor() builds them; this binds them to the game:
//   - A CREVICE (and the GUST SHAFT under a scaffold deck): a 'vent' ent with crevice: true. It WHISTLES (the moor's own gust whistle, SFX.gustRise)
//     CREVICE.tell s before it blows, the crack draws the air gathering, and then ONE short burst throws a hero standing in its mouth straight up -
//     a timed bounce up a rock face, never a column you ride (the Sky Road's thermals carry you; a crevice kicks you once). The reach model reads
//     it as a vent whose h is the burst's height (src/reachcore.js).
//   - THE WIND AS A WEAPON: a foe struck while a SCAFFOLD gust (gust zone with scaffold: true) is blowing over it is taken by the wind - carried
//     off the deck the way the gust blows, down through the planks into the tarn under the scaffold (main.js hazardFoe drowns it). The foe's own
//     AI is untouched (COMBAT PART 2 owns foe behaviour): while the wind has it, main.js hands its body here instead (blow()).
//   - THE HALF-BUILT FRAME (ent 'gustframe'): the goblins' windmill frame stands on the top deck on one guy-rope. Cut the rope as a scaffold gust
//     blows EAST over it and the wind lays the frame down across the gap to the landing - a bridge (its span turns to planks). Struck in the still
//     air it only sways back. The frame is the way on (src/stuck-spots.js glints the rope); a fallen frame is read off the grid, so a respawn
//     after it fell keeps it down.
// main.js calls: reset, on, crevice (from the vent update), update, strike, blow, props (the guide's extra props), drawCrevice, drawWorld.
// Every teaching line goes through ctx.number with a line listed in src/hint-lines.js.

export const CREVICE = { tell: 1.2, near: 260, mouth: 3 };   /* s of whistle before a burst; px within which you hear it; rows over the crack that count as standing in it */
export const BLOWN = { secs: 1.4, push: 170, up: 150, holdPlanks: 0.3 };   /* a foe the wind takes: how long, how fast with the gust, the hop it starts with, and how long before it drops through the planks */
export const FRAME = { fall: 1.1 };   /* s for the frame to go over */

export function makeMoorRocksHands(ctx) {
  let F = null;   /* the frame */
  const TS = ctx.TS;
  const H = {};
  const L = () => ctx.L;
  H.on = () => !!(L() && L().moorRocks);
  H.reset = () => {
    F = null; const lv = L(); if (!lv || !lv.moorRocks) return;
    const e = (lv.ents || []).find(q => q.t === 'gustframe'); if (!e) return;
    F = { x: e.x * TS + 8, y: (e.y + 1) * TS, ax: e.anchor * TS + 8,   /* (y: the deck it stands on, as every ent's foot) */ len: e.len * TS, span: e.span, row: e.row, ang: 0, va: 0, sway: 0, fallT: -1, fallen: false };
  };
  const bridged = () => { const lv = L(); if (!F) return false; for (let x = F.span[0]; x <= F.span[1]; x++) if (lv.grid[F.row * lv.W + x] !== ctx.T.PLANK) return false; return true; };
  /* the scaffold gust over a point, and whether it blows now: { z, on, dir, tell } or null */
  const gustOver = (x, y) => { for (const z of (L().gusts || [])) if (z.scaffold && x > z.x0 && x < z.x1 && y > z.y0 && y <= z.y1 + 4) { const g = ctx.gustNow(z); return { z, on: g.on, dir: g.dir, tell: g.tell }; } return null; };

  /* ---------- A CREVICE: the whistle, then one burst ---------- */
  H.crevice = (pr, dt) => {
    const t = ctx.time(), ph = (t + pr.phase) % pr.period, P = ctx.hero(), toBurst = pr.period - ph;
    const near = P && Math.abs(P.x - pr.x) < CREVICE.near && Math.abs(P.y - pr.y) < CREVICE.near * 0.7;
    if (!pr.active && toBurst <= CREVICE.tell) { if (!pr.rose && near) { pr.rose = true; ctx.sfx.gustRise(); } }
    else if (pr.active) pr.rose = false;
    if (!pr.active) return;
    const n = Math.floor((t + pr.phase) / pr.period);   /* this burst's number: one throw per hero per burst */
    for (const p of ctx.players()) {
      if (!p || p.dead || p.mrBurst === pr.x + ':' + n) continue;
      if (Math.abs(p.x - pr.x) < (pr.w || 10) && p.y <= pr.y + 2 && p.y > pr.y - CREVICE.mouth * TS) {
        p.mrBurst = pr.x + ':' + n; p.vy = -pr.lift; p.ground = false; p.canCut = false; p.plunge = false; p.onMover = null; p.coyote = 0;
        ctx.sfx.gust(); ctx.dust(pr.x, pr.y, 8);
        if (!pr.said) { pr.said = true; ctx.number(pr.x, pr.y - 22, 'THE CREVICE THROWS YOU UP', '#bfe6f5'); }
      }
    }
  };

  /* ---------- THE WIND AS A WEAPON, and the frame's clock ---------- */
  H.update = dt => {
    const lv = L();
    for (const e of ctx.enemies()) {
      if (!e.alive || e.maxHp || e.mini || e.elite || e.gustBlown > 0) { if (e.alive) e.mrFlash = e.flash || 0; continue; }
      const f = e.flash || 0, was = e.mrFlash || 0; e.mrFlash = f;
      if (!(f > was + 0.005)) continue;   /* struck this frame */
      const G = gustOver(e.x, e.y); if (!G || !G.on) continue;
      e.gustBlown = BLOWN.secs; e.blowDir = G.dir; e.blowVy = -BLOWN.up; e.blowT = 0; e.knock = 0;
      ctx.sfx.gust(); ctx.burst(e.x, e.y - 8, 8, ['#eefaff', '#c8b089'], 70, 0.4);
      if (!lv.mrSaidBlow) { lv.mrSaidBlow = true; ctx.number(e.x, e.y - (e.h || 12) - 12, 'THE WIND TAKES HIM', '#bfe6f5'); }
    }
    if (!F) return;
    if (!F.fallen && bridged()) { F.fallen = true; F.ang = Math.PI / 2; }
    const G = gustOver(F.x, F.y - 24);
    F.sway += ((G && G.on ? G.dir * 0.05 : 0) - F.sway) * Math.min(1, dt * 3);
    if (F.fallT >= 0 && !F.fallen) {
      F.fallT += dt; F.ang = Math.min(Math.PI / 2, (F.fallT / FRAME.fall) ** 2 * Math.PI / 2);
      if (F.ang >= Math.PI / 2) { F.fallen = true; for (let x = F.span[0]; x <= F.span[1]; x++) ctx.cellSet(x, F.row, ctx.T.PLANK);
        ctx.shake(7); ctx.sfx.heavy(); ctx.sfx.crumble(); ctx.dust(F.x + F.len * 0.6, F.y, 18);
        ctx.number(F.x + F.len * 0.5, F.y - 30, 'THE WIND LAYS THE FRAME OVER THE GAP', '#8fd160'); }
    }
  };
  /* the guy-rope, struck: as an east gust blows, it parts and the frame goes over; in the still it only sways */
  H.strike = hb => {
    const P = ctx.hero(); if (!F || F.fallen || F.fallT >= 0 || !hb || !P || P.dead || P.hitSet.has(F)) return;
    const rope = { l: F.ax - 7, r: F.ax + 7, t: F.y - 30, b: F.y };
    if (!(hb.l < rope.r && hb.r > rope.l && hb.t < rope.b && hb.b > rope.t)) return;
    P.hitSet.add(F); const G = gustOver(F.x, F.y - 24);
    if (G && G.on && G.dir > 0) { F.fallT = 0; ctx.sfx.crack(); ctx.sfx.throwWhoosh(); ctx.burst(F.ax, F.y - 10, 10, ['#c9b27c', '#8b6a2a'], 70, 0.5); }
    else { F.sway = -0.08; ctx.sfx.clank(); ctx.number(F.ax, F.y - 30, 'IT SWAYS BACK: IT WANTS THE GUST', '#ffd36b'); }
  };
  /* a foe the wind has: carried with the gust, down through the planks after a moment, until the tarn takes it (main.js hazardFoe) or it lands */
  H.blow = (e, dt) => {
    e.gustBlown -= dt; e.blowT += dt; e.blowVy = Math.min(400, e.blowVy + 1000 * dt); e.vx = 0;
    const r = ctx.moveFoe(e, e.blowDir * BLOWN.push * dt, e.blowVy * dt, e.blowT > BLOWN.holdPlanks);
    if (ctx.hazard(e)) return true;
    if (r && r.ground && e.blowVy > 0) { e.blowVy = 0; if (e.blowT > BLOWN.holdPlanks) e.gustBlown = 0; }
    if (Math.random() < dt * 20) ctx.burst(e.x - e.blowDir * 6, e.y - 6, 1, ['#eefaff'], 30, 0.3);
    return e.gustBlown > 0;
  };
  H.props = () => (F ? [{ t: 'gustframe', x: F.x, y: F.y, fallen: F.fallen }] : []);
  H.read = () => ({ frame: F ? { fallen: F.fallen, falling: F.fallT >= 0, ang: F.ang } : null });

  /* ---------- DRAWING: the moor's own stone, heather and goblin-built timber (src/redraw/moor_tiles.js is the tile kit these stand on) ---------- */
  const hh = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
  const gustAt = x => { for (const z of (L().gusts || [])) if (z.x0 < x && x < z.x1) return ctx.gustNow(z); return null; };
  let off = 0;   /* how far the tarn's ruffle has drifted: with the gust over it, much faster */
  H.tick = dt => { const lv = L(); if (!lv || !lv.moorRocks) return; const G = gustAt((ctx.hero() ? ctx.hero().x : 0)); off += dt * (7 + (G && G.on ? 70 * G.dir : 0)); };
  const glow = (g, x, y, r, a) => { const k = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(255,170,70,' + a + ')'); gr.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.globalCompositeOperation = k; };
  const flame = (g, x, y, time, s) => { const f = Math.sin(time * 14 + s * 3) * 0.5 + 0.5, hgt = 6 + f * 3 + (hh(Math.floor(time * 12), s) % 3);
    g.fillStyle = '#c4501e'; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x - 1 + f, y - hgt); g.lineTo(x + 4, y); g.fill();
    g.fillStyle = '#ffb03a'; g.beginPath(); g.moveTo(x - 2.5, y); g.lineTo(x + f * 0.6, y - hgt * 0.72); g.lineTo(x + 2.5, y); g.fill();
    g.fillStyle = '#fff0b0'; g.fillRect(Math.round(x - 1), Math.round(y - hgt * 0.35), 2, 2); };

  /* A CREVICE: a dark fissure running up the tor's face with the wind-polished rock pale around it, grit heaped at its foot, a tied scrap of cloth that STREAMS toward the crack as it whistles
     and kicks up as it blows; in a scaffold's gust shaft, a gap between the sleepers with cord streamers. The whistle is seen three ways: grit sweeping in, wavy wind-lines rising, a chevron */
  H.drawCrevice = (g, pr, cx, cy, time) => {
    const lv = L(), TSZ = TS, T = ctx.T, gx = Math.floor(pr.x / TSZ), gy = Math.floor((pr.y - 1) / TSZ), solidAt = (a, b) => lv.grid[b * lv.W + a] === T.SOLID;
    const wall = pr.shaft ? 0 : (solidAt(gx + 1, gy) ? 1 : solidAt(gx - 1, gy) ? -1 : 0);
    const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy), ph = (time + pr.phase) % pr.period, toBurst = pr.period - ph, warm = !pr.active && toBurst <= CREVICE.tell ? 1 - toBurst / CREVICE.tell : 0, burst = pr.active ? 1 : 0;
    const rise = Math.min(pr.h || 100, 120);
    if (wall) {   /* THE FISSURE up the face: the tor's edge is at the tile boundary; a jagged dark crack with a light polished rim and a pale scoured streak that says wind has been here */
      const ex = (wall > 0 ? (gx + 1) * TSZ : gx * TSZ) - cx, dir = wall;
      g.fillStyle = 'rgba(210,225,245,0.16)'; g.fillRect(ex + (dir > 0 ? 0 : -9), y - rise, 9, rise);   /* the scoured streak */
      let cxp = ex + dir * 2; g.fillStyle = '#12151c';
      for (let yy = y - 1; yy > y - rise; yy -= 2) { const j = hh(gx, Math.floor(yy / 2) + gy) % 3 - 1; cxp = ex + dir * (2 + Math.abs(j)); g.fillRect(Math.round(cxp - (dir > 0 ? 0 : 1)), yy - 1, 2, 2); }
      g.fillStyle = '#9aa4b6'; for (let yy = y - 3; yy > y - rise; yy -= 6) g.fillRect(ex + dir * 4 - (dir > 0 ? 0 : 1), yy, 1, 2);   /* the lit lip */
      /* the tied cloth: a scrap of goblin-red cloth on a peg, hanging at rest, laid toward the crack as it whistles, flung up as it blows */
      const py = y - 30, lift = burst ? 1 : Math.min(1, 0.15 + warm * 0.85) + Math.sin(time * 9) * 0.08 * warm, len = 11;
      g.fillStyle = '#4a4036'; g.fillRect(ex + dir * 3 - 1, py - 1, 2, 2);
      g.strokeStyle = '#a3322a'; g.lineWidth = 2; g.beginPath(); g.moveTo(ex + dir * 3, py); g.lineTo(ex + dir * (3 + len * (1 - 0.6 * lift)), py + len * (0.9 - 1.7 * lift)); g.stroke();
    }
    /* the crack itself, at the hero's feet */
    if (pr.shaft) {   /* a gap between sleepers: two cross-timbers, dark between, hide streamers tied to the underside */
      g.fillStyle = '#12100e'; g.fillRect(x - 8, y - 2, 16, 3); g.fillStyle = '#4a4036'; g.fillRect(x - 10, y - 4, 3, 5); g.fillRect(x + 7, y - 4, 3, 5); g.fillStyle = '#8e8068'; g.fillRect(x - 10, y - 4, 3, 1); g.fillRect(x + 7, y - 4, 3, 1);
      for (const sx of [-6, 5]) { const lift = burst ? 1 : warm; g.strokeStyle = '#c0a878'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + sx, y - 4); g.lineTo(x + sx + (sx < 0 ? -1 : 1) * 2 * lift, y - 4 - (3 + 9 * lift)); g.stroke(); g.fillStyle = '#a3322a'; g.fillRect(Math.round(x + sx + (sx < 0 ? -2 : 1) * (1 + lift)), Math.round(y - 7 - 9 * lift), 2, 3); }
    } else {
      g.fillStyle = '#12151c'; g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x - 3, y - 7); g.lineTo(x + 3, y - 7); g.lineTo(x + 9, y); g.closePath(); g.fill();
      g.fillStyle = '#9aa4b6'; g.fillRect(x - 11, y - 1, 4, 1); g.fillRect(x + 7, y - 1, 4, 1); g.fillStyle = '#6e7686'; g.fillRect(x - 9, y - 2, 2, 1); g.fillRect(x + 7, y - 2, 2, 1);
      g.fillStyle = '#7a7060'; for (let k = 0; k < 5; k++) g.fillRect(x - 12 + k * 6 + (k % 2), y - 1 - (k % 2), 2, 2);   /* grit and heather-litter heaped at its foot */
    }
    if (warm > 0) {   /* THE WHISTLE, seen: grit and heather swept in toward the crack, wavy wind-lines climbing it, and a chevron blinking over it */
      g.fillStyle = '#dfe8c0';
      for (let k = 0; k < 8 + 12 * warm; k++) { const s = ((time * 2.4 + k * 0.37) % 1), side = k % 2 ? 1 : -1, px = x + side * (24 - 22 * s), py = y - 2 - (k * 5) % 14 * (1 - s);
        g.globalAlpha = 0.25 + 0.6 * warm; g.fillRect(Math.round(px), Math.round(py), 3, 1); }
      g.strokeStyle = '#eefaff'; g.lineWidth = 1; g.globalAlpha = 0.25 + 0.5 * warm;
      for (let j = 0; j < 3; j++) { const t0 = (time * 1.5 + j / 3) % 1, yy = y - 6 - t0 * 40; g.beginPath(); for (let q = -6; q <= 6; q++) { const px = x + q, py = yy + Math.sin(q * 0.9 + time * 12 + j) * 1.5; if (q === -6) g.moveTo(px, py); else g.lineTo(px, py); } g.stroke(); }
      if (Math.floor(warm * 6) % 2 === 0) { g.globalAlpha = 0.95; g.fillStyle = '#ffd36b'; g.beginPath(); g.moveTo(x, y - 34); g.lineTo(x - 6, y - 26); g.lineTo(x + 6, y - 26); g.closePath(); g.fill(); g.fillStyle = '#7a5a10'; g.fillRect(x - 1, y - 30, 2, 2); }
      g.globalAlpha = 1;
    }
    if (pr.active) {   /* THE BURST: a pale jet the height of the throw, gone in half a second, with streaks and a spray of grit at the mouth */
      const k = 1 - ((time + pr.phase) % pr.period) / pr.on, top = y - pr.h;
      g.globalAlpha = 0.2 + 0.2 * k; g.fillStyle = '#eefaff'; g.fillRect(x - 6, top, 12, y - top); g.globalAlpha = 0.12; g.fillRect(x - 9, top + 10, 18, y - top - 10);
      g.globalAlpha = 0.8; g.strokeStyle = '#ffffff'; g.lineWidth = 1;
      for (let j = 0; j < 7; j++) { const yy = y - ((time * 420 + j * pr.h / 7) % pr.h), xx = x - 6 + (j * 5) % 13; g.beginPath(); g.moveTo(xx + 0.5, yy); g.lineTo(xx + 0.5, yy - 14); g.stroke(); }
      g.globalAlpha = 1; g.fillStyle = '#c8b089'; for (let j = 0; j < 5; j++) g.fillRect(x - 8 + (j * 7) % 16, Math.round(y - 3 - ((time * 90 + j * 9) % 14)), 2, 1);
    }
  };

  /* THE TARN: deep, dark water. Pass 1 (under everything): a body that goes from teal to near-black, slow light shafts, silt drifting up. Pass 2 (the surface): a sky-coloured line, ruffle dashes that run the way the gust blows,
     the scaffold's posts going in dark with a foam ring, and their reflections wobbling under the surface */
  H.drawTarn = (g, p, x0, x1, y, h, cx, cy, time, surfaceOnly) => {
    const lv = L(), M = lv.moorRocks;
    if (!surfaceOnly) {
      const gr = g.createLinearGradient(0, y, 0, y + Math.max(30, h)); gr.addColorStop(0, '#1f4a58'); gr.addColorStop(0.18, '#12303c'); gr.addColorStop(0.55, '#09171f'); gr.addColorStop(1, '#03080c');
      g.fillStyle = gr; g.fillRect(x0, y, x1 - x0, h);
      g.globalAlpha = 0.07; g.fillStyle = '#bfe6f5';   /* the light that gets down: slanted bars, fading */
      for (let sx = Math.floor(p.x0 / 40) * 40; sx < p.x1; sx += 40) { const s2 = Math.round(sx + Math.sin(time * 0.3 + sx) * 3 - cx); if (s2 > x0 - 12 && s2 < x1) { g.beginPath(); g.moveTo(s2, y); g.lineTo(s2 + 6, y); g.lineTo(s2 + 22, y + Math.min(h, 80)); g.lineTo(s2 + 12, y + Math.min(h, 80)); g.closePath(); g.fill(); } }
      g.globalAlpha = 0.35; g.fillStyle = '#2e5a66';
      for (let k = 0; k < 6; k++) { const t2 = (time * 0.12 + k * 0.17) % 1, dx = p.x0 + 16 + ((k * 131) % Math.max(1, p.x1 - p.x0 - 32)) - cx, dy = y + h - 6 - t2 * Math.min(h - 8, 60); if (dx > x0 && dx < x1) g.fillRect(Math.round(dx), Math.round(dy), 2, 1); }   /* silt rising */
      g.globalAlpha = 1; return;
    }
    const G = gustAt((p.x0 + p.x1) / 2), on = G && G.on;
    for (const [d0, d1, row, wr] of (M && M.decks) || []) {   /* the scaffold in the water: each post goes in dark, with a foam ring, and its reflection wobbles under it */
      for (let xx = d0; xx <= d1 + 1; xx += 4) { const px = xx * TS - cx; if (px < x0 - 8 || px > x1 + 8 || xx * TS < p.x0 || xx * TS > p.x1) continue;
        g.globalAlpha = 0.55; g.fillStyle = '#05090d'; g.fillRect(px - 3, y + 1, 5, Math.max(2, h - 2));   /* the post, under water */
        g.globalAlpha = 0.28; g.fillStyle = '#4a3a2a'; for (let q = 0; q < 4; q++) g.fillRect(px - 2 + Math.round(Math.sin(time * 2 + q + xx) * 1.5), y + 2 + q * 5, 4, 2);   /* its reflection, wobbling */
        g.globalAlpha = 0.7; g.fillStyle = '#d4e8f0'; g.fillRect(px - 5, y, 10, 1); g.globalAlpha = 0.4; g.fillRect(px - 7, y + 1, 14, 1); } }
    g.globalAlpha = 1;
    g.fillStyle = '#a8c4d4'; g.fillRect(x0, y, x1 - x0, 1); g.fillStyle = '#4a7a8c'; g.fillRect(x0, y + 1, x1 - x0, 1); g.fillStyle = '#0a1e28'; g.fillRect(x0, y + 2, x1 - x0, 2);
    const span = Math.max(1, p.x1 - p.x0);   /* ruffle dashes: three rows, running with the gust, brighter and longer while it blows */
    for (let row = 0; row < 3; row++) for (let k = 0; k < span / 22; k++) { const sx = p.x0 + (((k * 22 + row * 9 + off * (1 + row * 0.35)) % span) + span) % span, w = (on ? 6 : 3) + (hh(k, row) % 4), s2 = Math.round(sx - cx);
      if (s2 + w < x0 || s2 > x1) continue; g.globalAlpha = on ? 0.7 : 0.4; g.fillStyle = row ? '#7fa8bc' : '#d4e8f0'; g.fillRect(s2, y + 1 + row * 3, Math.min(w, x1 - s2), 1); }
    g.globalAlpha = 1;
  };

  /* THE FAR LANDMARK: the goblins' windmill frame as a hazy shape on the horizon (parallax 0.3), so the Wind Rocks climb toward it and the scaffold stands under it */
  H.drawFar = (g, cx, cy, VW, VH, time) => {
    const ref = 590 * TS - VW / 2, sx = Math.round(VW * 0.78 + (ref - cx) * 0.3);
    if (sx < -90 || sx > VW + 90) return;
    const base = VH - 70 - Math.round(cy * 0.05), top = base - 98, sway = Math.sin(time * 0.6) * 1;
    g.save(); g.globalAlpha = 0.5; g.fillStyle = '#5a6678'; g.strokeStyle = '#5a6678'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(sx - 16, base); g.lineTo(sx - 5 + sway, top); g.moveTo(sx + 16, base); g.lineTo(sx + 5 + sway, top); g.stroke();
    g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 4; k++) { const y0 = base - k * 24, y1 = base - (k + 1) * 24, a = 16 - k * 2.8, b = 16 - (k + 1) * 2.8; g.moveTo(sx - a, y0); g.lineTo(sx + b, y1); g.moveTo(sx + a, y0); g.lineTo(sx - b, y1); } g.stroke();
    g.lineWidth = 2; const hx = sx + sway, hy = top; for (let q = 0; q < 4; q++) { const a = 0.5 + q * Math.PI / 2 + time * 0.05, len = q % 2 ? 40 : 48; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(a) * len, hy + Math.sin(a) * len); g.stroke(); if (q < 3) { g.fillRect(Math.round(hx + Math.cos(a) * len * 0.5), Math.round(hy + Math.sin(a) * len * 0.5), 3, 3); } }
    g.beginPath(); g.arc(hx, hy, 3, 0, 7); g.fill(); g.fillStyle = '#7a4a4a'; g.fillRect(Math.round(hx + 4), hy - 14, 10 + Math.round(Math.sin(time * 4) * 2), 5);   /* a banner at its head */
    g.restore();
  };

  /* the scaffold: lashed posts down to firm ground (a ballast cairn of stones at each foot) or into the tarn, rope-bound cross-braces, tall posts with a goblin banner and a lit fire basket,
     loose planks and the goblins' clutter on the deck; then the half-built frame and its rope */
  H.drawWorld = (g, cx, cy, time) => {
    const lv = L(), M = lv.moorRocks, VW = ctx.VW(), solidBelow = (tx, ty) => { const T = ctx.T; for (let y = ty; y < lv.H; y++) { const t = lv.grid[y * lv.W + tx]; if (t === T.SOLID) return y; } return lv.H; };
    for (const [x0, x1, row, waterRow] of M.decks) {
      if ((x1 + 1) * TS < cx - 40 || x0 * TS > cx + VW + 40) continue;
      const G = gustOver((x0 + x1) / 2 * TS, row * TS - 8), sway = G && G.on ? G.dir * 2 : 0, deckY = row * TS - cy;
      for (let x = x0; x <= x1 + 1; x += 4) {
        const px = x * TS - cx, footRow = solidBelow(Math.min(x, x1), row + 1), inWater = footRow > waterRow, foot = footRow * TS - cy, fh = foot - deckY - 4;
        if (px < -30 || px > VW + 30) continue;
        g.fillStyle = '#3a3026'; g.fillRect(px - 3, deckY + 4, 5, fh); g.fillStyle = '#6e6252'; g.fillRect(px - 3, deckY + 4, 1, fh); g.fillStyle = '#1c1612'; g.fillRect(px + 1, deckY + 4, 1, fh);   /* a squared, bleached post: lit west, dark east */
        for (let yy = deckY + 8; yy < foot - 6; yy += 14) { g.fillStyle = '#c0a878'; g.fillRect(px - 3, yy, 5, 2); g.fillStyle = '#7a6438'; g.fillRect(px - 3, yy + 2, 5, 1); }   /* hide-cord lashing bands */
        if (!inWater) { g.fillStyle = '#6e7686'; g.fillRect(px - 6, foot - 4, 11, 4); g.fillStyle = '#8d96a7'; g.fillRect(px - 5, foot - 6, 4, 2); g.fillRect(px, foot - 5, 4, 2); g.fillStyle = '#2e333f'; g.fillRect(px - 6, foot - 1, 11, 1); }   /* ballast stones heaped round the foot */
        else { g.fillStyle = '#3e6a46'; g.fillRect(px - 3, foot - 8, 5, 5); g.fillStyle = '#6a9a58'; g.fillRect(px - 3, foot - 8, 5, 1); }   /* slimed where the tarn has had it */
        if (x + 4 <= x1 + 1) {   /* the cross-braces: two thick timbers in an X, bound where they cross */
          const bx = px + 4 * TS, by = Math.min(foot - 4, deckY + 3 * TS);
          g.strokeStyle = '#1c1612'; g.lineWidth = 3; g.beginPath(); g.moveTo(px, deckY + 6); g.lineTo(bx, by); g.moveTo(bx, deckY + 6); g.lineTo(px, by); g.stroke();
          g.strokeStyle = '#6e6252'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px, deckY + 6); g.lineTo(bx, by); g.moveTo(bx, deckY + 6); g.lineTo(px, by); g.stroke();
          g.fillStyle = '#c0a878'; g.fillRect(Math.round((px + bx) / 2) - 2, Math.round((deckY + 6 + by) / 2) - 2, 4, 4); g.fillStyle = '#7a6438'; g.fillRect(Math.round((px + bx) / 2) - 2, Math.round((deckY + 6 + by) / 2) + 1, 4, 1); }
        if ((x - x0) % 8 === 0) {   /* a tall post: a goblin banner (tattered, with the black tusk), a bone totem bar, and a lit fire basket that throws light across the deck */
          const tx = px + sway, top = deckY - 40;
          g.fillStyle = '#3a3026'; g.fillRect(tx - 2, top, 4, 40); g.fillStyle = '#6e6252'; g.fillRect(tx - 2, top, 1, 40);
          g.fillStyle = '#d8d2bc'; g.fillRect(tx - 6, top + 14, 12, 2); g.fillRect(tx - 6, top + 12, 2, 2); g.fillRect(tx + 4, top + 12, 2, 2);   /* the bone bar */
          const d = G && (G.on || G.tell >= 0) ? G.dir : 1, flap = G && G.on ? 1 : 0.35, w = 14 + 4 * flap;
          g.fillStyle = '#a3322a'; g.beginPath(); g.moveTo(tx + d * 2, top + 2); g.lineTo(tx + d * w, top + 5 + Math.sin(time * (6 + 10 * flap) + x) * 2 * flap); g.lineTo(tx + d * (w - 3), top + 10); g.lineTo(tx + d * w * 0.7, top + 13 + Math.sin(time * 9 + x) * flap); g.lineTo(tx + d * 2, top + 16); g.closePath(); g.fill();
          g.fillStyle = '#1e1a18'; g.fillRect(Math.round(tx + d * 7 - 1), top + 6, 2, 5); g.fillRect(Math.round(tx + d * 5), top + 6, 1, 3);   /* the tusk */
          const fy = top - 4; g.fillStyle = '#3a3a42'; g.fillRect(tx - 5, fy, 10, 3); g.fillRect(tx - 4, fy + 3, 8, 2); g.fillStyle = '#6e6e7a'; g.fillRect(tx - 5, fy, 10, 1);
          flame(g, tx, fy, time, x); glow(g, tx, fy - 6, 40 + Math.sin(time * 11 + x) * 2, 0.34);
        }
      }
      for (const lx of [x0 + 5, x1 - 6]) { const lift = G && G.on ? 3 + Math.sin(time * 30 + lx) * 2 : 0, px = lx * TS - cx;   /* loose planks that lift and rattle in a gust */
        g.fillStyle = '#8e8068'; g.fillRect(px, deckY - 2 - lift, 14, 2); g.fillStyle = '#4a4036'; g.fillRect(px, deckY - lift, 14, 1); g.fillStyle = '#c0a878'; g.fillRect(px + 10, deckY - 2 - lift, 2, 2); }
      for (const [cl, kind] of [[x0 + 4, 0], [x1 - 13, 1], [x0 + 14, 2]]) { const px = cl * TS - cx; if (px < -20 || px > VW + 20) continue;   /* the goblins' clutter, low, on the boards: lashed bundles, a ballast basket, a coil of rope */
        if (kind === 0) { g.fillStyle = '#6e6252'; g.fillRect(px, deckY - 4, 11, 4); g.fillRect(px + 1, deckY - 8, 9, 4); g.fillStyle = '#c0a878'; g.fillRect(px + 3, deckY - 8, 1, 8); g.fillRect(px + 7, deckY - 8, 1, 8); g.fillStyle = '#4a4036'; g.fillRect(px, deckY - 1, 11, 1); }
        else if (kind === 1) { g.fillStyle = '#4a4036'; g.fillRect(px, deckY - 7, 9, 7); g.fillStyle = '#8e8068'; g.fillRect(px, deckY - 7, 9, 1); g.fillStyle = '#7a8a3a'; g.fillRect(px + 1, deckY - 9, 3, 2); g.fillStyle = '#8d96a7'; g.fillRect(px + 4, deckY - 9, 4, 2); g.fillStyle = '#2a2420'; g.fillRect(px, deckY - 3, 9, 1); }
        else { g.strokeStyle = '#c0a878'; g.lineWidth = 2; g.beginPath(); g.ellipse(px + 5, deckY - 3, 5, 2.5, 0, 0, 7); g.stroke(); g.strokeStyle = '#7a6438'; g.lineWidth = 1; g.beginPath(); g.ellipse(px + 5, deckY - 3, 3, 1.5, 0, 0, 7); g.stroke(); } }
    }
    if (!F) return;
    /* THE FRAME: a tapering A-frame of lashed timbers, rungs and cross-braces, a hub with four sail arms (two with strips of cloth, two bare: the goblins have not got to them), a banner at the head; it pivots on its foot */
    const ang = F.fallen ? Math.PI / 2 : F.ang + F.sway, fx = F.x - cx, fy = F.y - cy;
    if (fx < -F.len - 60 || fx > VW + F.len + 60) return;
    g.save(); g.translate(fx, fy); g.rotate(ang);
    const half = y => 10 - 5 * (y / F.len);   /* the legs close toward the head */
    for (const s of [-1, 1]) { g.strokeStyle = '#1c1612'; g.lineWidth = 5; g.beginPath(); g.moveTo(s * 10, 0); g.lineTo(s * 5, -F.len); g.stroke(); g.strokeStyle = '#6e6252'; g.lineWidth = 3; g.beginPath(); g.moveTo(s * 10 - s, 0); g.lineTo(s * 5 - s, -F.len); g.stroke(); g.strokeStyle = '#8e8068'; g.lineWidth = 1; g.beginPath(); g.moveTo(s * 10 - 2 * s, 0); g.lineTo(s * 5 - 2 * s, -F.len); g.stroke(); }
    for (let k = 10; k < F.len - 4; k += 14) { const hw = half(k); g.fillStyle = '#4a4036'; g.fillRect(-hw, -k - 2, hw * 2, 3); g.fillStyle = '#8e8068'; g.fillRect(-hw, -k - 2, hw * 2, 1); g.fillStyle = '#c0a878'; g.fillRect(-hw - 1, -k - 3, 3, 5); g.fillRect(hw - 2, -k - 3, 3, 5); }   /* rungs, bound at each leg */
    g.strokeStyle = '#3a3026'; g.lineWidth = 2; g.beginPath(); for (let k = 10; k + 14 < F.len; k += 28) { g.moveTo(-half(k), -k); g.lineTo(half(k + 14), -k - 14); g.moveTo(half(k), -k); g.lineTo(-half(k + 14), -k - 14); } g.stroke();
    g.fillStyle = '#1c1612'; g.beginPath(); g.arc(0, -F.len + 5, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6e6252'; g.beginPath(); g.arc(0, -F.len + 5, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#c0a878'; g.fillRect(-1, -F.len + 4, 2, 2);
    const spin = F.fallen ? 0 : time * 0.25;
    g.save(); g.translate(0, -F.len + 5); for (let q = 0; q < 4; q++) { g.save(); g.rotate(0.6 + spin + q * Math.PI / 2); const len = q < 2 ? 26 : 18;
      g.fillStyle = '#3a3026'; g.fillRect(-1, -len, 3, len); g.fillStyle = '#8e8068'; g.fillRect(-1, -len, 1, len);
      if (q < 2) { g.fillStyle = q ? '#d8d2bc' : '#a3322a'; for (let c2 = 0; c2 < 3; c2++) { g.fillRect(2, -len + 3 + c2 * 8, 6 - c2, 5); } }   /* cloth sail strips, half tied on */
      g.restore(); }
    g.restore();
    g.fillStyle = '#a3322a'; g.beginPath(); g.moveTo(5, -F.len - 2); g.lineTo(16 + Math.sin(time * 6) * 1.5, -F.len + 2); g.lineTo(5, -F.len + 8); g.closePath(); g.fill(); g.fillStyle = '#1e1a18'; g.fillRect(9, -F.len + 2, 2, 3);
    g.restore();
    if (!F.fallen && F.fallT < 0) {   /* THE GUY-ROPE, from its peg on the deck to the frame's shoulder: thick hide cord, pegged */
      const tx = fx + Math.sin(ang) * F.len * 0.8, ty = fy - Math.cos(ang) * F.len * 0.8;
      g.strokeStyle = '#1c1612'; g.lineWidth = 3; g.beginPath(); g.moveTo(F.ax - cx, fy - 4); g.quadraticCurveTo((F.ax - cx + tx) / 2, (fy + ty) / 2 + 6, tx, ty); g.stroke();
      g.strokeStyle = '#c0a878'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(F.ax - cx, fy - 4); g.quadraticCurveTo((F.ax - cx + tx) / 2, (fy + ty) / 2 + 6, tx, ty); g.stroke();
      g.fillStyle = '#3a3026'; g.fillRect(F.ax - cx - 3, fy - 8, 6, 8); g.fillStyle = '#8e8068'; g.fillRect(F.ax - cx - 3, fy - 8, 6, 1); g.fillStyle = '#c0a878'; g.fillRect(F.ax - cx - 3, fy - 5, 6, 2);
    }
  };
  return H;
}
