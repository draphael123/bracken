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

  /* ---------- DRAWING (greybox-plus: plain shapes in the moor's own stone, heather and timber) ---------- */
  H.drawCrevice = (g, pr, cx, cy, time) => {
    const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy), ph = (time + pr.phase) % pr.period, toBurst = pr.period - ph, warm = !pr.active && toBurst <= CREVICE.tell ? 1 - toBurst / CREVICE.tell : 0;
    /* the crack in the rock at the hero's feet: a dark wedge with a lighter rim */
    g.fillStyle = '#2a2a33'; g.beginPath(); g.moveTo(x - 8, y); g.lineTo(x - 2, y - 6); g.lineTo(x + 2, y - 6); g.lineTo(x + 8, y); g.closePath(); g.fill();
    g.fillStyle = '#8a8a98'; g.fillRect(x - 10, y - 1, 3, 1); g.fillRect(x + 7, y - 1, 3, 1);
    if (pr.shaft) { g.fillStyle = '#6b4a2a'; g.fillRect(x - 9, y - 3, 2, 3); g.fillRect(x + 7, y - 3, 2, 3); }   /* a gust shaft between the scaffold's sleepers */
    if (warm > 0) {   /* THE WHISTLE, seen: heather and grit drawn in toward the crack, more and faster as it comes, and a chevron blinking up */
      g.fillStyle = '#dfe8c0';
      for (let k = 0; k < 6 + 10 * warm; k++) { const s = ((time * 2 + k * 0.37) % 1), side = k % 2 ? 1 : -1, px = x + side * (22 - 20 * s), py = y - 2 - (k * 5) % 12 * (1 - s);
        g.globalAlpha = 0.25 + 0.6 * warm; g.fillRect(Math.round(px), Math.round(py), 3, 1); }
      if (Math.floor(warm * 6) % 2 === 0) { g.globalAlpha = 0.9; g.fillStyle = '#ffd36b'; g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x - 5, y - 23); g.lineTo(x + 5, y - 23); g.closePath(); g.fill(); }
      g.globalAlpha = 1;
    }
    if (pr.active) {   /* THE BURST: a short white jet the height of the throw, gone in half a second */
      const k = 1 - ((time + pr.phase) % pr.period) / pr.on, top = y - pr.h;
      g.globalAlpha = 0.18 + 0.2 * k; g.fillStyle = '#eefaff'; g.fillRect(x - 6, top, 12, y - top);
      g.globalAlpha = 0.7; g.strokeStyle = '#ffffff'; g.lineWidth = 1;
      for (let j = 0; j < 6; j++) { const yy = y - ((time * 420 + j * pr.h / 6) % pr.h), xx = x - 5 + (j * 5) % 11; g.beginPath(); g.moveTo(xx + 0.5, yy); g.lineTo(xx + 0.5, yy - 14); g.stroke(); }
      g.globalAlpha = 1;
    }
  };
  /* the scaffold: posts down to firm ground, cross-braces, goblin banners on the tall posts; loose planks that lift in a gust; the frame and its rope */
  H.drawWorld = (g, cx, cy, time) => {
    const lv = L(), M = lv.moorRocks, VW = ctx.VW(), solidBelow = (tx, ty) => { const T = ctx.T; for (let y = ty; y < lv.H; y++) { const t = lv.grid[y * lv.W + tx]; if (t === T.SOLID) return y; } return lv.H; };
    for (const [x0, x1, row, waterRow] of M.decks) {
      if ((x1 + 1) * TS < cx - 40 || x0 * TS > cx + VW + 40) continue;
      const G = gustOver((x0 + x1) / 2 * TS, row * TS - 8), sway = G && G.on ? G.dir * 2 : 0, deckY = row * TS - cy;
      for (let x = x0; x <= x1 + 1; x += 4) {
        const px = x * TS - cx, foot = Math.min(solidBelow(Math.min(x, x1), row + 1), waterRow + 3) * TS - cy;
        g.fillStyle = '#4a3220'; g.fillRect(px - 2, deckY + 4, 3, foot - deckY - 4); g.fillStyle = '#6b4a2a'; g.fillRect(px - 2, deckY + 4, 1, foot - deckY - 4);
        if (x + 4 <= x1 + 1) { g.strokeStyle = '#5a3e26'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, deckY + 6); g.lineTo(px + 4 * TS, Math.min(foot, deckY + 3 * TS)); g.moveTo(px + 4 * TS, deckY + 6); g.lineTo(px, Math.min(foot, deckY + 3 * TS)); g.stroke(); }
        if ((x - x0) % 8 === 0) {   /* a tall post with a goblin banner: red cloth with the black tusk, streaming the way the wind goes */
          g.fillStyle = '#4a3220'; g.fillRect(px - 1 + sway, deckY - 34, 2, 34);
          const d = G && (G.on || G.tell >= 0) ? G.dir : 1, flap = G && G.on ? 1 : 0.35, w = 12 + 4 * flap;
          g.fillStyle = '#a3322a'; g.beginPath(); g.moveTo(px + sway, deckY - 33); g.lineTo(px + sway + d * w, deckY - 30 + Math.sin(time * (6 + 10 * flap) + x) * 2 * flap); g.lineTo(px + sway, deckY - 24); g.closePath(); g.fill();
          g.fillStyle = '#1e1a18'; g.fillRect(Math.round(px + sway + d * 4), deckY - 30, 2, 3);
        }
      }
      /* loose planks: two per deck, that lift and rattle as the gust goes over */
      for (const lx of [x0 + 5, x1 - 6]) { const lift = G && G.on ? 3 + Math.sin(time * 30 + lx) * 2 : 0, px = lx * TS - cx;
        g.fillStyle = '#9a7a4a'; g.fillRect(px, deckY - 2 - lift, 14, 2); g.fillStyle = '#6b4a2a'; g.fillRect(px, deckY - lift, 14, 1); }
    }
    if (!F) return;
    /* THE FRAME: two uprights and their rungs, a hub and the stubs of two sails at the top; it pivots on its foot */
    const ang = F.fallen ? Math.PI / 2 : F.ang + F.sway, fx = F.x - cx, fy = F.y - cy;
    if (fx < -F.len - 40 || fx > VW + F.len + 40) return;
    g.save(); g.translate(fx, fy); g.rotate(ang);
    g.fillStyle = '#4a3220'; g.fillRect(-7, -F.len, 3, F.len); g.fillRect(4, -F.len, 3, F.len);
    g.fillStyle = '#7a5a34'; for (let k = 8; k < F.len; k += 12) g.fillRect(-7, -k, 14, 2);
    g.strokeStyle = '#5a3e26'; g.lineWidth = 1; g.beginPath(); for (let k = 8; k + 12 < F.len; k += 24) { g.moveTo(-6, -k); g.lineTo(6, -k - 12); g.moveTo(6, -k - 12); g.lineTo(-6, -k - 24); } g.stroke();
    g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(0, -F.len + 6, 5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7a5a34'; g.save(); g.translate(0, -F.len + 6); g.rotate(0.6 + time * (F.fallen ? 0 : 0.2)); g.fillRect(-1, -22, 3, 22); g.rotate(Math.PI); g.fillRect(-1, -14, 3, 14); g.restore();
    g.fillStyle = '#a3322a'; g.fillRect(6, -F.len + 14, 8, 5);
    g.restore();
    if (!F.fallen && F.fallT < 0) {   /* THE GUY-ROPE, from its peg on the deck to the frame's shoulder */
      const tx = fx + Math.sin(ang) * F.len * 0.8, ty = fy - Math.cos(ang) * F.len * 0.8;
      g.strokeStyle = '#c9b27c'; g.lineWidth = 1; g.beginPath(); g.moveTo(F.ax - cx, fy - 4); g.quadraticCurveTo((F.ax - cx + tx) / 2, (fy + ty) / 2 + 6, tx, ty); g.stroke();
      g.fillStyle = '#4a3220'; g.fillRect(F.ax - cx - 2, fy - 7, 4, 7);
    }
  };
  return H;
}
