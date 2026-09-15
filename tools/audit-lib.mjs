// tools/audit-lib.mjs — WHAT THE COMBAT AND ANIMATION AUDITS SHARE. The page, headless, on its own port; a way to stand any creature in
// its own level (or a boss in its own arena) with a passive hero pinned beside it; the opaque boxes, hashes and masks of a sprite set;
// the real drawn pixels of a creature against the ground it stands on; and a PNG writer for the contact sheets. Nothing here changes
// the game: it reads it through window.BK (and BK.log, an array while a tool listens, written by damagePlayer and hurtEnemy).
//   import { openAudit, savePng, OUT, SCRATCH } from './audit-lib.mjs';
// PORT defaults to 5908. OUT (the sheets) defaults to audits/combat/; SCRATCH (the raw JSON) defaults to OUT.
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { openPage, ROOT } from './cdp.mjs';

export const OUT = process.env.OUT || fileURLToPath(new URL('../audits/combat/', import.meta.url));
export const SCRATCH = process.env.SCRATCH || OUT;
export { ROOT };

export async function openAudit() {
  if (!process.env.PORT) process.env.PORT = '5908';
  const pg = await openPage();
  await pg.evalp('(' + pageLib.toString() + ')()');
  return pg;
}

export function savePng(dataUrl, path) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
}

/* THE PAGE SIDE. Sent as source (no closures over this file); everything hangs off window.__AUD. */
export function pageLib() {
  const BK = window.BK, A = window.__AUD = {}, TS = 16;
  A.SKIP_LEVELS = new Set(['shop', 'shopCrag', 'shopSea', 'custom', 'trial_open', 'trial_knight', 'trial_pyro', 'trial_paladin', 'trial_pirate', 'trial_reaper']);
  /* every placed creature, by type: the first level that places one and where. Bosses come from L.arena / L.mini. */
  A.habitats = async function () {
    const lvm = await import('/src/level.js'); A.LEVELS = lvm.LEVELS; const out = {};
    for (let i = 0; i < lvm.LEVELS.length; i++) { const l = lvm.LEVELS[i]; if (A.SKIP_LEVELS.has(l.id) || /^trial/.test(l.id)) continue;
      try { BK.load(i); } catch (e) { continue; } BK.state = 'play'; const L = BK.L; if (!L) continue;
      if (L.arena && L.arena.boss && !out[L.arena.boss]) out[L.arena.boss] = { level: l.id, i, arena: true };
      if (L.mini && L.mini.boss && !out[L.mini.boss]) out[L.mini.boss] = { level: l.id, i, mini: true };
      for (const e of (L.ents || [])) { if (!e || !e.t) continue; const key = e.t + (e.big ? ':big' : ''); if (!out[key]) out[key] = { level: l.id, i, ent: JSON.parse(JSON.stringify(e)) }; } }
    return out;
  };
  A.pin = function (x, y, face) { const P = BK.P; P.x = x; P.y = y; P.vx = 0; P.vy = 0; if (face) P.face = face; P.hp = P.maxHp; P.inv = 0; P.grace = 0; P.hurt = 0; P.dead = 0; P.block = false; P.dodge = 0; P.stagger = 0; P.plunge = false; P.atk = -1; P.riseT = 0; P.knock = 0; P.asleep = 0; P.st = P.maxSt; };
  A.clearKeys = function () { const k = BK.keys; for (const n of Object.keys(k)) k[n] = false; };
  A.settings = function () { const S = BK.SET; S.numbers = true; S.rim = false; S.shakeAmt = 1; S.hitstop = true; S.flashes = true; S.speed = 1; S.assist = false; S.boxes = 'off'; S.impact = true; S.reduceMotion = false; S.weather = false; };
  /* stand a creature up: a foe is spawned from its own placement in its own level beside the hero; a boss is met in its arena */
  A.stand = async function (t, hab, opts = {}) {
    const P = BK.P; BK.setHero(opts.hero || 'knight'); A.settings();
    BK.load(hab.i); BK.state = 'play'; BK.god = false; BK.sim(3); A.clearKeys();
    const L = BK.L; let e = null;
    if (hab.arena || hab.mini) { const Ar = hab.mini ? L.mini : L.arena;
      e = BK.enemies().find(q => q.t === t && q.alive && (!hab.mini || q.mini)) || BK.enemies().find(q => q.t === t && q.alive);
      for (const q of BK.enemies()) if (q !== e && !(q.t === 'krakenarm' || q.t === 'feeler' || q.t === 'gill' || q.t === 'heart')) q.alive = false;
      BK.tp(Math.round(Ar.trigger / TS) + 1, Math.round(Ar.floor / TS) - 1); BK.sim(2);
      for (let i = 0; i < 240 && e && /^(sleep|wake|rise|sunk|buried|intro|enter|appear|dormant|wait)$/.test(e.mode); i++) { A.pin(P.x, P.y); BK.sim(1); }
      A.ar = { x0: Ar.x0, x1: Ar.x1, floor: Ar.floor, trigger: Ar.trigger };
    } else { const d = hab.ent; for (const q of BK.enemies()) q.alive = false;
      BK.tp(d.x - 4, d.y); BK.sim(2); const n0 = BK.enemies().length;
      BK.spawnEnt(Object.assign({}, d, { face: -1 })); e = BK.enemies().length > n0 ? BK.enemies()[BK.enemies().length - 1] : null; A.ar = null;
      if (e) BK.sim(20); }
    if (!e) return null;
    /* THE CAMERA ON IT: the follow camera eases from wherever the level started, and a creature off the frame is never drawn */
    { const v = BK.view, tx = Math.floor(P.x / TS), ty = Math.floor(P.y / TS) - 1, px = P.x, py = P.y; BK.look(tx, ty); P.x = px; P.y = py; }
    A.e = e; BK.log = []; A.pin(P.x, P.y, 1); BK.step(1); A.snap = Object.assign({}, e); A.t = t; A.hab = hab;
    return { t: e.t, w: e.w, h: e.h, x: Math.round(e.x), y: Math.round(e.y), mode: e.mode, maxHp: e.maxHp || 0, big: !!e.big, mini: !!e.mini, harmless: !!e.harmless };
  };
  /* put the creature back as it stood: every field it grew since is dropped, the spawn fields restored */
  A.restore = function (x, y, face) { const e = A.e; for (const k of Object.keys(e)) if (!(k in A.snap)) delete e[k]; Object.assign(e, A.snap); e.alive = true; e.x = x === undefined ? A.snap.x : x; e.y = y === undefined ? A.snap.y : y; e.vx = 0; e.vy = 0; e.stagger = 0; e.flash = 0; e.face = face || e.face; e.modeT = A.snap.modeT; };
  A.hashCanvas = function (c) { if (!c || !c.width) return 0; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 2166136261 ^ c.width ^ (c.height << 12);
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 40) { h = Math.imul(h ^ 0x55, 16777619); continue; } h = Math.imul(h ^ d[i], 16777619); h = Math.imul(h ^ d[i + 1], 16777619); h = Math.imul(h ^ d[i + 2], 16777619); } return (h >>> 0).toString(36); };
  A.sprName = function (set) { if (!A.__sprNames) { A.__sprNames = new Map(); for (const k of Object.keys(BK.SPR)) if (BK.SPR[k] && BK.SPR[k].R) A.__sprNames.set(BK.SPR[k], k); } return A.__sprNames.get(set) || '?'; };
  /* the opaque box, the pixel hash and (for frame 0) the silhouette mask of every frame of a set, in world pixels about the creature's (x, y), facing right */
  A.frameBoxes = function (set, bigF) { const out = []; bigF = bigF || 1;
    for (let i = 0; i < set.R.length; i++) { const c = set.R[i]; if (!c || !c.width) { out.push(null); continue; }
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 40) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      const hash = A.hashCanvas(c);
      if (x1 < 0) { out.push({ empty: true, W: c.width, H: c.height, hash }); continue; }
      const b = { l: (x0 - set.ax) * bigF, r: (x1 + 1 - set.ax) * bigF, t: (y0 - set.ay) * bigF, b: (y1 + 1 - set.ay) * bigF, W: c.width, H: c.height, n, hash };
      if (i === 0) { /* THE SILHOUETTE of the standing frame: a 16x16 coverage grid of the opaque bbox, its mean colour, and how unlike its own mirror it is */
        const bw = x1 - x0 + 1, bh = y1 - y0 + 1, grid = new Array(256).fill(0); let r = 0, g2 = 0, bl = 0, diff = 0;
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const j = (y * c.width + x) * 4; if (d[j + 3] <= 40) continue;
          r += d[j]; g2 += d[j + 1]; bl += d[j + 2]; grid[Math.min(15, Math.floor((y - y0) / bh * 16)) * 16 + Math.min(15, Math.floor((x - x0) / bw * 16))]++;
          const mx = x1 - (x - x0); if (d[(y * c.width + mx) * 4 + 3] <= 40) diff++; }
        const cell = (bw / 16) * (bh / 16); b.grid = grid.map(v => +(v / Math.max(1, cell)).toFixed(2)); b.col = [Math.round(r / n), Math.round(g2 / n), Math.round(bl / n)]; b.asym = +(diff / n).toFixed(3); b.bw = bw * bigF; b.bh = bh * bigF; }
      out.push(b); }
    return out; };
  A.cam = function () { const v = BK.view, L = BK.L; return [Math.round(Math.max(0, Math.min(L.W * TS - v.VW, v.x))), Math.round(Math.max(0, Math.min(L.H * TS - v.VH, v.y)))]; };
  /* THE CREATURE'S REAL PIXELS, NOW: the frame drawn with it and without it (moved off the picture), in a window round it only, so a
     sparkle or a mote elsewhere on the screen is not counted. Returns its drawn box about (e.x, e.y), its edge contrast against the
     ground behind it, and a crop. */
  A.drawn = function (opt = {}) { const e = A.e, v = BK.view, buf = v.buf, g = buf.getContext('2d'), VW = v.VW, VH = v.VH;
    const nums = BK.textLab.nums(); for (const n of nums) n.life = 0;
    BK.step(0); const [cx, cy] = A.cam(); const img = g.getImageData(0, 0, VW, VH), a = img.data;
    const ox = e.x; e.x += 100000; BK.step(0); const b = g.getImageData(0, 0, VW, VH).data; e.x = ox;
    const sx = Math.round(e.x - cx), sy = Math.round(e.y - cy), hw = Math.max(40, e.w * 2 + 24), up = Math.max(56, e.h * 2.5 + 24);
    const X0 = Math.max(0, sx - hw), X1 = Math.min(VW - 1, sx + hw), Y0 = Math.max(0, Math.round(sy - up)), Y1 = Math.min(VH - 1, sy + 12);
    const W = X1 - X0 + 1, H = Y1 - Y0 + 1; if (W < 4 || H < 4) return null;
    const m = new Uint8Array(W * H); let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
    for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) { const i = (y * VW + x) * 4; if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 30) { m[(y - Y0) * W + (x - X0)] = 1; n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    BK.step(0);
    if (x1 < 0) return null;
    const out = { l: x0 + cx - e.x, r: x1 + 1 + cx - e.x, t: y0 + cy - e.y, b: y1 + 1 + cy - e.y, n };
    if (opt.contrast) { /* WCAG contrast of every edge pixel of the body against the ground pixel just outside it (from the picture without it) */
      const lum = (d, i) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2]); };
      const ratios = [];
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { if (!m[y * W + x]) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (m[(y + dy) * W + x + dx]) continue;
          const i = ((y + Y0) * VW + x + X0) * 4, j = ((y + dy + Y0) * VW + x + dx + X0) * 4, la = lum(a, i), lb = lum(b, j);
          ratios.push((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)); break; } }
      ratios.sort((p, q) => p - q);
      out.edge = ratios.length; out.contrastMed = ratios.length ? +ratios[ratios.length >> 1].toFixed(2) : null; out.lowEdge = ratios.length ? +(ratios.filter(r => r < 1.5).length / ratios.length).toFixed(2) : null; }
    if (opt.crop) { const pad = 6, cw = x1 - x0 + 1 + pad * 2, ch = y1 - y0 + 1 + pad * 2, src = document.createElement('canvas'); src.width = cw; src.height = ch; src.getContext('2d').putImageData(img, -(x0 - pad), -(y0 - pad));
      const z = opt.crop, cc = document.createElement('canvas'); cc.width = cw * z; cc.height = ch * z; const gg = cc.getContext('2d'); gg.imageSmoothingEnabled = false; gg.drawImage(src, 0, 0, cw * z, ch * z);
      out.crop1 = src.toDataURL('image/png'); out.crop = cc.toDataURL('image/png'); out.cw = cw; out.ch = ch; out.anchor = [Math.round(e.x - cx - (x0 - pad)), Math.round(e.y - cy - (y0 - pad))]; }
    return out; };
  A.stackLine = function (st) { if (!st) return null; const m = st.split('\n').map(l => l.match(/main\.js:(\d+)/)).filter(Boolean).map(q => +q[1]); return m.length > 1 ? m[1] : m[0] || null; };   /* [0] is the hook itself */
  return 'lib';
}
