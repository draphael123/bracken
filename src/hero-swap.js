// src/hero-swap.js - THE SWAP HERO PANEL (claude/hubpolish, Daniel 11-01: "make it easier to swap heroes in the store, tavern" ).
// One row of portraits, every hero of the roster: the ones you own lit, with their own level and the first skill they carry; the ones you do not own
// greyed, and the line under the row says how you get them. One press opens it (F / the pad's throw / a tap on SWAP HERO in the store; H on the map;
// the pause menu's Swap hero), LEFT and RIGHT walk the row, the confirm key takes the hero, back closes. A swap is the game's own one (main.js
// swapHeroTo -> the same setEquip + applySkin + applyUpgrades the store's HEROES tab does): each hero keeps his own level, skills, charm and gear,
// and nothing here writes a save by itself.
//
// This file is the panel and its rules with no game in them (tools/hero-swap.mjs holds them without a page). main.js supplies the facts:
//   api.rows()          [{ id, name, owned, level, why }]   in roster order; `why` is the sentence for a hero not owned yet
//   api.frame(id)       an idle frame canvas of the hero (his own skin and gear), or null
//   api.icon(id)        the picture of the first skill he carries (a 9 x 9 canvas), or null
//   api.active()        the hero being played
//   api.choose(id)      do the swap; returns a line to say, or null for 'refused'
//   api.sfx(k), api.text(...), api.panel(x, y, w, h), api.hit(x, y, w, h, fn), api.g(), api.VW(), api.VH(), api.time()

export const CELL_H = 52;
const bboxOf = new WeakMap();
/* where the painted pixels of a frame are (cached on the canvas): the portrait is centred on them, not on the padded canvas */
export function bbox(c) {
  let b = bboxOf.get(c); if (b) return b;
  b = { x: 0, y: 0, w: c.width, h: c.height };
  try { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 >= 0) b = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }; } catch { /* a tainted canvas: the whole frame */ }
  bboxOf.set(c, b); return b;
}
/* the cell a press lands on: LEFT / RIGHT wrap round the roster */
export const stepIndex = (i, dir, n) => ((i + dir) % n + n) % n;
/* WHICH HERO the panel opens on: the one you are playing */
export const startIndex = (rows, active) => Math.max(0, rows.findIndex(r => r.id === active));
/* WHAT A PRESS DOES: 'swap' (an owned hero other than the active one), 'same' (the one you are already), 'locked' */
export const pressOn = (row, active) => !row ? 'none' : !row.owned ? 'locked' : row.id === active ? 'same' : 'swap';

export function makeSwap(api) {
  const S = { open: false, i: 0, msg: '', msgT: 0, openedAt: 0, count: 0, swaps: 0 };
  const rows = () => api.rows();
  function open() { const r = rows(); if (!r.length) return false; S.open = true; S.i = startIndex(r, api.active()); S.msg = ''; S.msgT = 0; S.count++; api.sfx('menuOpen'); return true; }
  function close(quiet) { if (!S.open) return; S.open = false; if (!quiet) api.sfx('menuClose'); }
  function confirm() {
    const r = rows(), row = r[S.i], what = pressOn(row, api.active());
    if (what === 'swap') { const say = api.choose(row.id); if (say === null || say === undefined || typeof say === 'object') { api.sfx('buzz'); S.msg = say && say.no ? say.no : 'NOT NOW'; S.msgT = 2.4; return; } S.swaps++; S.msg = say; S.msgT = 2.2; close(true); return say; }
    if (what === 'same') { close(); return; }
    api.sfx('buzz'); S.msg = row ? row.why : ''; S.msgT = 3;
  }
  /* one frame of input while it is open: p = { left, right, confirm, back } (the frame's presses); returns true when the panel ate them */
  function input(p, dt) {
    if (!S.open) return false;
    S.msgT = Math.max(0, S.msgT - (dt || 0));
    const n = rows().length;
    if (p.left) { S.i = stepIndex(S.i, -1, n); api.sfx('ui'); }
    if (p.right) { S.i = stepIndex(S.i, 1, n); api.sfx('ui'); }
    if (p.back) { close(); return true; }
    if (p.confirm) { const r = confirm(); S.said = r || null; }
    return true;
  }
  /* the line the caller shows after a swap (taken once) */
  const took = () => { const s = S.said; S.said = null; return s; };

  function draw() {
    if (!S.open) return;
    const g = api.g(), VW = api.VW(), VH = api.VH(), t = api.time(), r = rows(), n = r.length;
    g.fillStyle = 'rgba(6,5,10,0.78)'; g.fillRect(0, 0, VW, VH);
    const cw = Math.max(26, Math.min(34, Math.floor((VW - 16) / n))), w = cw * n + 12, h = CELL_H + 52, x = Math.round((VW - w) / 2), y = Math.max(4, Math.round((VH - h) / 2));
    api.panel(x, y, w, h);
    api.text('SWAP HERO', x + 6, y + 4, '#ffd36b', 'left', 8);
    api.hit(x + w - 28, y + 2, 26, 11, () => close());
    api.text('ESC', x + w - 6, y + 5, '#8a8f80', 'right', 6);
    const gx = x + 6, gy = y + 16, sc = 2;
    r.forEach((row, k) => {
      const cx = gx + k * cw, sel = k === S.i, act = row.id === api.active();
      api.hit(cx, gy, cw, CELL_H, () => { if (S.i === k) { const q = confirm(); S.said = q || null; } else { S.i = k; api.sfx('ui'); } });
      g.fillStyle = sel ? 'rgba(70,104,60,0.75)' : act ? 'rgba(70,64,40,0.55)' : 'rgba(34,30,46,0.7)'; g.fillRect(cx + 1, gy, cw - 2, CELL_H);
      if (sel) { g.strokeStyle = '#a8e06e'; g.lineWidth = 1; g.strokeRect(cx + 1.5, gy + 0.5, cw - 3, CELL_H - 1); }
      const f = api.frame(row.id);
      if (f) {
        const b = bbox(f), s = b.h * sc <= 34 ? sc : 1, dw = Math.min(b.w, Math.floor((cw - 4) / s)), sx = b.x + Math.floor((b.w - dw) / 2);
        const bob = sel && row.owned ? (Math.floor(t * 2.5) % 2 ? -1 : 0) : 0;
        g.save(); g.globalAlpha = row.owned ? 1 : 0.3; if (!row.owned) g.filter = 'grayscale(1) brightness(0.6)';
        g.drawImage(f, sx, b.y, dw, b.h, Math.round(cx + (cw - dw * s) / 2), gy + 38 - b.h * s + bob, dw * s, b.h * s); g.restore();
      }
      if (!row.owned) { const lx = cx + (cw >> 1) - 3, ly = gy + 14; g.fillStyle = '#8a8f80'; g.fillRect(lx, ly + 3, 7, 5); g.fillRect(lx + 1, ly, 1, 3); g.fillRect(lx + 5, ly, 1, 3); g.fillRect(lx + 1, ly, 5, 1); g.fillStyle = '#1b1626'; g.fillRect(lx + 3, ly + 5, 1, 2); }
      if (row.owned) {
        api.text('L' + Math.max(0, row.level), cx + 4, gy + 41, sel ? '#fff6e0' : '#c2c9c2', 'left', 6);
        const ic = api.icon(row.id); if (ic) g.drawImage(ic, 0, 0, ic.width, ic.height, cx + cw - 4 - Math.min(9, ic.width), gy + 41, Math.min(9, ic.width), Math.min(9, ic.height));
      }
      if (act) { g.fillStyle = '#ffd36b'; g.fillRect(cx + (cw >> 1) - 2, gy + 1, 5, 2); }   /* the one you play: a gold pip on top of his cell */
    });
    const row = r[S.i], ly = gy + CELL_H + 4;
    if (row) {
      const what = pressOn(row, api.active());
      api.text(row.name + (row.owned ? '   LEVEL ' + Math.max(0, row.level) : ''), x + w / 2, ly, row.owned ? '#fff6e0' : '#9aa39a', 'center', 6);
      const line = S.msgT > 0 && S.msg ? S.msg : what === 'locked' ? row.why : what === 'same' ? 'YOU PLAY HIM NOW' : 'CONFIRM: PLAY AS HIM. HE KEEPS HIS OWN LEVEL AND SKILLS.';
      api.lines(line, x + w / 2, ly + 9, w - 12, S.msgT > 0 && what === 'locked' ? '#ff9a5c' : what === 'locked' ? '#c9b892' : '#a8e06e');
    }
    api.text('LEFT / RIGHT  CONFIRM  ESC', x + w / 2, y + h - 9, '#8a8f80', 'center', 6);
  }
  return { open, close, input, draw, took, get isOpen() { return S.open; }, get index() { return S.i; }, set index(v) { S.i = v; }, state: S, confirm };
}
