// src/well-town-hands.js - THE WELL TOWN's HANDS (claude/welltown, the greybox). src/well-town.js builds the level; this binds its rule to the game:
// THE SKIN (fill at a well, pour on mud and fire and the burning king, drink for the sun), THE MUD WALLS and THE FIRES (barricades: solid until
// poured), THE GREAT WELL's WINDLASS (the bucket moves only when a windlass is struck), THE DRY CISTERN and its vault, and THE WATER-THIEF
// (the cutthroat's AI, src/desert-foes.js, with a cut that takes a sip and a run for a well). main.js calls: reset, update, interact, bucket,
// thiefStep, stole, drawWorld, drawHud, read. Every teaching line goes through ctx.number with a line listed in src/hint-lines.js (the hint box).
import { cutthroatStep } from './desert-foes.js';

export const SKINMAX = 3, WELL_R = 24, POUR_R = 30, DRINK_AT = 0.2;
export const BUCKET = { down: 80, up: 64 };                      /* px/s: the brake off, it runs down; wound, it comes up slower */
export const THIEF = { hp: 26, run: 96, runT: 3.5, dmg: 6 };     /* THE WATER-THIEF: lighter than the cutthroat, and quicker away */
export const FIRE = { tick: 0.7, dmg: 3, reach: 6 };             /* a barricade's heat, a tick at its face */

export function makeWellTownHands(ctx) {
  let WT = null;
  const H = {};
  const cellsOf = m => { const out = []; for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) out.push([x, y]); return out; };
  const skinOf = pp => (pp.skin || (pp.skin = { sips: 0, max: SKINMAX }));
  const maxOf = pp => (pp.relic === 'gourd' ? SKINMAX + 1 : SKINMAX);   /* THE WELL-KEEPER'S GOURD: a fourth sip */

  /* ---------- RESET: a fresh load is a fresh town; a respawn keeps what was poured (the walls stay open, the cistern stays full) ---------- */
  H.reset = () => {
    const L = ctx.L; if (!L || !L.welltown) { WT = null; return; }
    if (!WT || WT.L !== L) {
      const TS = ctx.TS, ents = L.ents;
      WT = { L, said: {}, n: { fills: 0, pours: 0, drinks: 0, walls: 0, fires: 0, stolen: 0, back: 0, rides: 0 },
        wells: ents.filter(e => e.t === 'skinwell').map(e => ({ x: e.x * TS + 8, y: (e.y + 1) * TS, arena: !!e.arena })),
        walls: (L.mudWalls || []).map(m => ({ ...m, open: false })),
        fires: [], cistern: null, vault: (L.vaultDoors || []).map(m => ({ ...m, open: false })), windlasses: [], carriers: new Set() };
      /* A FIRE IS A BARRICADE: a burning column across the way, solid until it is poured out */
      for (const e of ents.filter(q => q.t === 'oilfire')) { let y0 = e.y; while (y0 > 0 && ctx.cellGet(e.x, y0 - 1) === ctx.T.AIR) y0--;
        const f = { x0: e.x, x1: e.x, y0, y1: e.y, lit: true, cd: 0, kind: e.barricade ? 'barricade' : e.gateway ? 'gateway' : 'stall' }; WT.fires.push(f);
        for (const [x, y] of cellsOf(f)) ctx.cellSet(x, y, ctx.T.SOLID); }
      const c = ents.find(e => e.t === 'cistern'); if (c) WT.cistern = { x: c.x * TS + 8, y: (c.y + 1) * TS, full: false };
      WT.windlasses = ents.filter(e => e.t === 'windlass').map(e => ({ x: e.x * TS + 8, y: (e.y + 1) * TS, top: !!e.top, bucket: e.bucket, cd: 0 }));
    }
    for (const pp of ctx.players) { skinOf(pp); pp.skin.max = maxOf(pp); }
    const m = ctx.movers().find(q => q.windlass); if (m) { m.locked = true; if (WT.bucketY !== undefined) m.y = WT.bucketY; m.dir = 0; }
    if (window.BK) Object.assign(window.BK, { welltown: () => WT, welltownHands: () => H });
  };
  H.on = () => !!WT;
  H.state = () => WT;

  /* ---------- INTERACT (E): fill at a well, fill the dry cistern, pour on what is in front, or drink ---------- */
  const nearWell = (x, y) => WT.wells.find(w => Math.abs(w.x - x) <= WELL_R && Math.abs(w.y - y) <= 20);
  H.interact = pp => {
    if (!WT) return false; const P = pp, sk = skinOf(P); sk.max = maxOf(P);
    const w = nearWell(P.x, P.y);
    if (w) { if (sk.sips >= sk.max) { ctx.sfx.ui && ctx.sfx.ui(); return true; } sk.sips = sk.max; WT.n.fills++; ctx.sfx.splash && ctx.sfx.splash(); ctx.burst(w.x, w.y - 12, 8, ['#7ab8e8', '#e8f4f8'], 50, 0.5);
      if (!WT.said.full) { WT.said.full = 1; ctx.number(P.x, P.y - 30, 'YOUR SKIN IS FULL: E POURS, E DRINKS', '#7ab8e8'); } return true; }
    const c = WT.cistern;
    if (c && !c.full && Math.abs(c.x - P.x) <= WELL_R && Math.abs(c.y - P.y) <= 20) {
      if (ctx.questGot() >= ctx.questN()) { c.full = true; for (const v of WT.vault) { v.open = true; for (const [x, y] of cellsOf(v)) ctx.cellSet(x, y, ctx.T.AIR); }
        ctx.sfx.splash && ctx.sfx.splash(); ctx.shake(3); ctx.burst(c.x, c.y - 10, 18, ['#7ab8e8', '#e8f4f8', '#3a7ab8'], 70, 0.8); ctx.number(c.x, c.y - 34, 'THE CISTERN FILLS: THE VAULT OPENS', '#8fd160'); }
      else ctx.number(c.x, c.y - 34, 'THE DRY CISTERN WANTS FOUR WATER-SKINS', '#ffd36b');
      return true; }
    if (sk.sips <= 0) { ctx.number(P.x, P.y - 30, 'YOUR SKIN IS EMPTY: FILL IT AT A WELL', '#ff9a5c'); ctx.sfx.buzz && ctx.sfx.buzz(); return true; }
    /* POUR: in front of you, the nearest thing water changes */
    const face = P.face || 1, hx = P.x + face * POUR_R;
    const hits = m => hx >= m.x0 * 16 - 6 && hx <= (m.x1 + 1) * 16 + 6 && P.y > m.y0 * 16 && P.y - 14 <= (m.y1 + 1) * 16;
    const wall = WT.walls.find(m => !m.open && hits(m));
    if (wall) { sk.sips--; WT.n.pours++; WT.n.walls++; wall.open = true; for (const [x, y] of cellsOf(wall)) ctx.cellSet(x, y, ctx.T.AIR);
      ctx.sfx.splash && ctx.sfx.splash(); ctx.dust(wall.x0 * 16 + 8, (wall.y1 + 1) * 16, 10); ctx.burst(wall.x0 * 16 + 8, wall.y0 * 16 + 20, 12, ['#7a5a3a', '#4e3622', '#7ab8e8'], 60, 0.6);
      ctx.number(P.x, P.y - 30, 'THE MUD GIVES WAY', '#8fd160'); return true; }
    const f = WT.fires.find(m => m.lit && hits(m));
    if (f) { sk.sips--; WT.n.pours++; WT.n.fires++; f.lit = false; for (const [x, y] of cellsOf(f)) ctx.cellSet(x, y, ctx.T.AIR);
      ctx.sfx.hiss ? ctx.sfx.hiss() : ctx.sfx.splash && ctx.sfx.splash(); ctx.burst(f.x0 * 16 + 8, f.y0 * 16 + 10, 16, ['#e8f4f8', '#9aa39a', '#7ab8e8'], 50, 0.9);
      ctx.number(P.x, P.y - 30, 'THE FIRE IS OUT - GO', '#8fd160'); return true; }
    const k = ctx.king && ctx.king.pour(P);
    if (k) { sk.sips--; WT.n.pours++; ctx.burst(P.x + face * 24, P.y - 16, 10, ['#7ab8e8', '#e8f4f8'], 60, 0.5); return true; }
    /* nothing to pour on: DRINK, when the sun is on you (a sip spent on nothing is not taken) */
    if (P.sun && P.sun.v > DRINK_AT) { sk.sips--; WT.n.drinks++; P.sun.v = 0; P.sun.tick = 0.7; P.sun.n = 0; ctx.sfx.splash && ctx.sfx.splash(); ctx.burst(P.x, P.y - 18, 6, ['#7ab8e8', '#e8f4f8'], 30, 0.4); ctx.number(P.x, P.y - 30, 'THE SUN LETS GO OF YOU', '#7ab8e8'); return true; }
    return false;
  };

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!WT) return;
    const hb = ctx.attackBox();
    /* THE WINDLASSES: a blow on one sends the bucket the other way (with whoever stands on it) */
    for (const w of WT.windlasses) { w.cd = Math.max(0, w.cd - dt);
      if (hb && w.cd <= 0 && ctx.overlap(hb, { l: w.x - 14, r: w.x + 14, t: w.y - 28, b: w.y })) { const m = ctx.movers().find(q => q.windlass === w.bucket); if (!m || m.dir) continue;
        w.cd = 0.8; const atTop = m.y <= m.y0 + 1; m.dir = atTop ? 1 : -1; WT.n.rides++; ctx.sfx.clank && ctx.sfx.clank(); ctx.sfx.ropeHaul && ctx.sfx.ropeHaul(); ctx.sparks(w.x, w.y - 14, ctx.hero().face || 1, 4);
        ctx.number(w.x, w.y - 34, atTop ? 'STRIKE THE WINDLASS: THE BUCKET GOES DOWN' : 'THE BUCKET GOES UP', '#ffd36b'); } }
    /* THE FIRES' HEAT: a tick at a burning barricade's face */
    for (const f of WT.fires) { if (!f.lit) continue; f.cd = Math.max(0, f.cd - dt);
      for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || f.cd > 0) return; const l = f.x0 * 16 - FIRE.reach, r = (f.x1 + 1) * 16 + FIRE.reach;
        if (P.x + 5 > l && P.x - 5 < r && P.y > f.y0 * 16 && P.y - 14 < (f.y1 + 1) * 16) { f.cd = FIRE.tick; ctx.hurtHero(P.x - (P.face || 1) * 8, FIRE.dmg, { unblockable: true, noKnock: true, name: 'THE FIRE' });
          if (!WT.said['f' + f.x0]) { WT.said['f' + f.x0] = 1; ctx.number(P.x, P.y - 30, 'IT BURNS: POUR YOUR SKIN ON IT', '#ff9a5c'); } } }); }
    /* THE MUD WALLS: say what they want, once each, the first time one is in front of you */
    const P = ctx.hero();
    for (const m of WT.walls) if (!m.open && !WT.said['m' + m.x0] && Math.abs(m.x0 * 16 + 8 - P.x) < 40 && P.y > m.y0 * 16 && P.y - 14 <= (m.y1 + 1) * 16) { WT.said['m' + m.x0] = 1; ctx.number(P.x, P.y - 30, 'MUD: POUR YOUR SKIN ON IT', '#ffd36b'); }
    /* THE SUN AND THE SKIN: the first time the sun has you and there is water, say so */
    if (!WT.said.sun && P.sun && P.sun.v > 0.6 && skinOf(P).sips > 0) { WT.said.sun = 1; ctx.number(P.x, P.y - 30, 'THE SUN IS OUT: DRINK FROM YOUR SKIN (E)', '#ffd36b'); }
    /* A THIEF CUT DOWN gives back what he took; one who got away with it (his run done) has drunk it */
    const live = new Set(ctx.enemies());
    for (const e of [...WT.carriers]) { if (e.alive && live.has(e) && e.st.mode === 'flee') continue; WT.carriers.delete(e);
      if (e.alive && live.has(e)) { e.st.carry = 0; continue; }
      const pp = e.st.from || P, sk = skinOf(pp); sk.sips = Math.min(sk.max || SKINMAX, sk.sips + e.st.carry); e.st.carry = 0; WT.n.back++;
      ctx.burst(e.x, e.y - 12, 8, ['#7ab8e8', '#e8f4f8'], 50, 0.5); ctx.number(e.x, e.y - 30, 'THE SIP IS BACK', '#8fd160'); }
  };

  /* ---------- THE BUCKET: called from updateMovers before the generic lift (it moves only on the windlass) ---------- */
  H.bucket = (m, dt) => {
    const oy = m.y; m.dx = 0;
    if (m.dir) { m.y += m.dir * (m.dir > 0 ? BUCKET.down : BUCKET.up) * dt; if (m.y >= m.y1) { m.y = m.y1; m.dir = 0; ctx.sfx.thud && ctx.sfx.thud(); } else if (m.y <= m.y0) { m.y = m.y0; m.dir = 0; ctx.sfx.clank && ctx.sfx.clank(); } }
    m.dy = m.y - oy; if (WT) WT.bucketY = m.y; return true;
  };

  /* ---------- THE WATER-THIEF (the cutthroat's machine, src/desert-foes.js, plus the run) ---------- */
  H.thiefStep = (s, w, dt) => {
    if (s.mode === 'flee') { s.t -= dt; s.x += s.face * THIEF.run * dt; s.frame = Math.floor(w.time * 10) % 2;
      if (s.t <= 0) { s.mode = 'walk'; s.cd = 0.9; s.face = -s.face; } return []; }
    return cutthroatStep(s, w, dt);
  };
  /* his cut landed on a hero: a sip goes with him, and he runs (away from you, for a well) */
  H.stole = (e, pp) => { if (!e.st || e.st.carry) return; const sk = skinOf(pp); if (sk.sips <= 0) return;
    sk.sips--; e.st.carry = 1; e.st.from = pp; e.st.mode = 'flee'; e.st.t = THIEF.runT; e.st.face = Math.sign(e.x - pp.x) || 1; if (WT) { WT.n.stolen++; WT.carriers.add(e); }
    ctx.burst(pp.x, pp.y - 14, 6, ['#7ab8e8', '#e8f4f8'], 60, 0.5); ctx.number(pp.x, pp.y - 30, 'HE CUT YOUR SKIN: CATCH HIM', '#ff9a5c'); };

  /* ---------- DRAWING (greybox) ---------- */
  H.drawWorld = (g, cx, cy, time) => {
    if (!WT) return; const R = Math.round, vw = ctx.VW();
    const on = x => x > cx - 40 && x < cx + vw + 40;
    /* THE WELLS: the only blue in the town */
    for (const w of WT.wells) { if (!on(w.x)) continue; const x = R(w.x - cx), y = R(w.y - cy);
      g.fillStyle = '#d8ccb0'; g.fillRect(x - 10, y - 9, 20, 9); g.fillStyle = '#a89878'; g.fillRect(x - 10, y - 9, 20, 2); g.fillStyle = '#3a7ab8'; g.fillRect(x - 8, y - 8, 16, 3);
      g.fillStyle = '#7ab8e8'; g.fillRect(x - 6 + (Math.floor(time * 2) % 3), y - 8, 3, 1); g.fillStyle = '#6a4426'; g.fillRect(x - 10, y - 22, 2, 13); g.fillRect(x + 8, y - 22, 2, 13); g.fillRect(x - 11, y - 23, 22, 2); }
    /* THE MUD WALLS: dark brown, cracked where the water would take them; opened, a heap of mud on the floor */
    for (const m of WT.walls) { const x = R(m.x0 * 16 - cx), y = R(m.y0 * 16 - cy), w = (m.x1 - m.x0 + 1) * 16, h = (m.y1 - m.y0 + 1) * 16; if (!on(m.x0 * 16)) continue;
      if (!m.open) { g.fillStyle = '#5e3a1c'; g.fillRect(x, y, w, h); g.fillStyle = '#3a2410'; for (let k = 0; k < h; k += 7) g.fillRect(x + 2 + (k % 5), y + k + 3, w - 5, 1); g.fillStyle = '#2a1a0a'; g.fillRect(x + w / 2 - 1, y + 2, 1, h - 4); g.fillRect(x + 3, y + h / 2, w - 6, 1); }
      else { g.fillStyle = '#5e3a1c'; g.fillRect(x - 2, y + h - 4, w + 4, 4); } }
    /* THE FIRES: flames over a burning barricade; out, charred timber */
    for (const f of WT.fires) { if (!on(f.x0 * 16)) continue; const x = R(f.x0 * 16 - cx), y = R(f.y0 * 16 - cy), h = (f.y1 - f.y0 + 1) * 16;
      g.fillStyle = f.lit ? '#5a3a1a' : '#2a2018'; g.fillRect(x + 3, y, 10, h);
      if (f.lit) for (let k = 0; k < h; k += 6) { const fl = Math.sin(time * 14 + k) * 2; g.fillStyle = k % 12 ? '#ff9a3c' : '#ffd36b'; g.fillRect(x + 1 + fl, y + k, 14, 5); g.fillStyle = '#d84a14'; g.fillRect(x + 4 - fl, y + k + 2, 8, 3); } }
    /* THE WINDLASSES and the rope down to the bucket */
    const m = ctx.movers().find(q => q.windlass);
    for (const w of WT.windlasses) { if (!on(w.x)) continue; const x = R(w.x - cx), y = R(w.y - cy);
      g.fillStyle = '#6a4426'; g.fillRect(x - 7, y - 18, 2, 18); g.fillRect(x + 5, y - 18, 2, 18); g.fillStyle = '#8a5a32'; g.fillRect(x - 6, y - 16, 12, 6); g.fillStyle = '#c9b27c'; g.fillRect(x - 6, y - 14, 12, 2);
      g.fillStyle = '#3a2a1a'; g.fillRect(x + 6, y - 13, 5, 2); }
    if (m && on(m.x)) { const top = WT.windlasses.find(w => w.top); const x = R(m.x - cx), y = R(m.y - cy);
      if (top) { g.fillStyle = '#c9b27c'; g.fillRect(x + 15, R(top.y - 14 - cy), 1, Math.max(0, y - R(top.y - 14 - cy))); }
      g.fillStyle = '#6a4426'; g.fillRect(x, y, m.w, 6); g.fillStyle = '#8a5a32'; g.fillRect(x + 1, y + 1, m.w - 2, 2); g.fillStyle = '#3a7ab8'; g.fillRect(x + 4, y + 4, m.w - 8, 1); }
    /* THE DRY CISTERN: a stone basin, blue when it is full; THE VAULT's door while it is shut */
    const c = WT.cistern; if (c && on(c.x)) { const x = R(c.x - cx), y = R(c.y - cy); g.fillStyle = '#b8a888'; g.fillRect(x - 14, y - 10, 28, 10); g.fillStyle = c.full ? '#3a7ab8' : '#6a5a40'; g.fillRect(x - 12, y - 9, 24, 4);
      if (!c.full) { g.fillStyle = '#7ab8e8'; for (let i = 0; i < ctx.questGot(); i++) g.fillRect(x - 10 + i * 6, y - 15, 4, 3); } }
    for (const v of WT.vault) if (!v.open && on(v.x0 * 16)) { const x = R(v.x0 * 16 - cx), y = R(v.y0 * 16 - cy), h = (v.y1 - v.y0 + 1) * 16; g.fillStyle = '#8a7a5a'; g.fillRect(x, y, 16, h); g.fillStyle = '#c9962a'; g.fillRect(x + 6, y + h / 2 - 3, 4, 6); }
    /* A THIEF RUNNING WITH YOUR SIP: a blue drop over him */
    for (const e of ctx.enemies()) if (e.alive && e.t === 'waterthief' && e.st && e.st.carry && on(e.x)) { const x = R(e.x - cx), y = R(e.y - (e.h || 18) - 12 - cy) + Math.round(Math.sin(time * 8) * 1.5); g.fillStyle = '#7ab8e8'; g.fillRect(x - 2, y, 4, 4); g.fillRect(x - 1, y - 2, 2, 2); }
  };
  /* THE SKIN on the HUD, under the sun meter: a drop a sip */
  H.drawHud = (g, P) => {
    if (!WT || !P) return; const sk = skinOf(P), x = 22, y = 64;
    ctx.text('SKIN', x - 12, y + 2, '#7ab8e8', 'left', 6);
    for (let i = 0; i < (sk.max || SKINMAX); i++) { const dx = x + 12 + i * 8; g.fillStyle = 'rgba(20,20,40,0.6)'; g.fillRect(dx - 1, y - 1, 7, 8); g.fillStyle = i < sk.sips ? '#3a7ab8' : '#1a2430'; g.fillRect(dx, y, 5, 6); if (i < sk.sips) { g.fillStyle = '#7ab8e8'; g.fillRect(dx + 1, y + 1, 2, 2); } }
  };
  H.read = () => WT && { n: { ...WT.n }, walls: WT.walls.map(m => m.open), fires: WT.fires.map(f => f.lit), cistern: WT.cistern && WT.cistern.full, vault: WT.vault.map(v => v.open), sips: skinOf(ctx.hero()).sips };
  return H;
}
