// src/crossroads.js - THE CROSSROADS BOARD (claude/forkframe; forkplan sec 1 'THE INN', passiveplan sec 4): a signpost by the inn's hearth where every unlocked A/B fork of the
// current hero is swapped for free, unlimited. Two tabs: ABILITIES (his ladder forks + the L50 capstone) and TRAITS (the A/B pair of each worn trait, L20+).
// A locked rung shows '?' and its level; a fork whose skill is not slotted / trait not worn is marked (the pick is kept and plays the moment it applies).
// Same shape as src/unlocks.js: pure (no page, no game), main.js passes the facts and the drawing helpers through makeCrossroads(api). The board only exists while
// FORKS_SHIP is on (the inn station is not dealt otherwise: src/tavern.js STATIONS).
//   api: g() VW() VH() text(s,x,y,col,align,size) panel(x,y,w,h) hit(x,y,w,h,fn) sfx(name) wrap(s,w,size) fit(s,w,size)
//        data() -> { hero, level, tabs: { ABILITIES: rows, TRAITS: rows } } (src/forks.js boardRows)    set(key, side) -> null | refusal text
export const TABS = ['ABILITIES', 'TRAITS'];
export const NOTHING = { ABILITIES: 'NO PATHS TO CHOOSE FOR THIS HERO YET', TRAITS: 'PATHS OPEN WITH THIS HERO\'S ROAD' };   /* dim, never an error: a hero without fork data (passiveplan sec 4) */
export const ROW_H = 24;
const step = (i, d, n) => n ? (i + d + n) % n : 0;

export function makeCrossroads(api) {
  const S = { open: false, tab: 0, sel: [0, 0], cur: [0, 0], top: [0, 0], data: null, msg: '', msgT: 0, count: 0, from: '' };
  const rows = () => (S.data && S.data.tabs && S.data.tabs[TABS[S.tab]]) || [];
  const refresh = () => { S.data = api.data(); };
  function open(from) { refresh(); S.open = true; S.tab = 0; S.sel = [0, 0]; S.cur = [0, 0]; S.top = [0, 0]; S.msg = ''; S.msgT = 0; S.count++; S.from = from || ''; api.sfx('menuOpen'); return true; }
  function close() { if (!S.open) return; S.open = false; api.sfx('menuClose'); }
  const setTab = d => { S.tab = step(S.tab, d, TABS.length); api.sfx('ui'); };
  const move = d => { const n = rows().length; if (!n) return; S.sel[S.tab] = step(S.sel[S.tab], d, n); const r = rows()[S.sel[S.tab]]; S.cur[S.tab] = r && r.side === 'B' ? 1 : 0; api.sfx('ui'); };
  const say = (s, t) => { S.msg = s; S.msgT = t || 2; };
  /* write the side under the cursor (X / Z / a tap on a half): free, unlimited */
  function setAt(i, sideIdx) { const r = rows()[i]; if (!r) return null; const side = sideIdx ? 'B' : 'A';
    if (!r.open) { api.sfx('buzz'); say('LOCKED: LEVEL ' + r.level, 2); return 'locked'; }
    const err = api.set(r.key, side); if (err) { api.sfx('buzz'); say(String(err).toUpperCase(), 2.5); return err; }
    refresh(); api.sfx('equip'); say((side === 'A' ? r.A.name : r.B.name) + ' SET' + (r.note ? ' (' + r.note + ')' : ''), 1.8); return null; }
  /* one frame of input while it is open: p = { left, right, up, down, confirm, tab, back, dt } (the frame's presses); true = it ate them */
  function input(p) {
    if (!S.open) return false; S.msgT = Math.max(0, S.msgT - (p.dt || 0));
    if (p.tab) setTab(1);
    if (p.left || p.right) { if (rows().length) { S.cur[S.tab] = p.right ? 1 : 0; api.sfx('ui'); } }
    if (p.up) move(-1); if (p.down) move(1);
    if (p.confirm) setAt(S.sel[S.tab], S.cur[S.tab]);
    if (p.back) close();
    return true; }
  const geo = () => { const VW = api.VW(), VH = api.VH(), x = 4, y = 4, w = VW - 8, h = VH - 8, ly = y + 28, dh = 30, lh = h - 28 - 13 - dh; return { VW, VH, x, y, w, h, ly, lh, dh, dy: ly + lh }; };
  const visible = G => Math.max(1, Math.floor(G.lh / ROW_H));
  function draw() {
    if (!S.open) return; const g = api.g(), G = geo(), rs = rows(), n = rs.length, key = TABS[S.tab], sel = S.sel[S.tab];
    g.fillStyle = 'rgba(6,5,10,0.9)'; g.fillRect(0, 0, G.VW, G.VH); api.panel(G.x, G.y, G.w, G.h);
    api.text('THE CROSSROADS', G.x + 6, G.y + 4, '#ffd36b', 'left', 8);
    const hd = S.data ? (S.data.heroName || '') + ' LEVEL ' + (S.data.level | 0) : ''; api.text(hd, G.x + G.w - 36, G.y + 6, '#a8e06e', 'right', 6);
    api.hit(G.x + G.w - 32, G.y + 3, 30, 11, () => close()); api.text('BACK', G.x + G.w - 6, G.y + 6, '#8a8f80', 'right', 6);
    const tw = Math.floor((G.w - 8) / TABS.length);
    TABS.forEach((t, k) => { const tx = G.x + 4 + k * tw, on = k === S.tab; api.hit(tx, G.y + 16, tw - 2, 10, () => { if (S.tab !== k) { S.tab = k; api.sfx('ui'); } });
      g.fillStyle = on ? 'rgba(70,104,60,0.85)' : 'rgba(34,30,46,0.8)'; g.fillRect(tx, G.y + 16, tw - 2, 10); if (on) { g.strokeStyle = '#a8e06e'; g.lineWidth = 1; g.strokeRect(tx + 0.5, G.y + 16.5, tw - 3, 9); }
      api.text(t, tx + (tw - 2) / 2, G.y + 18, on ? '#fff6e0' : '#9aa39a', 'center', 6); });
    if (!n) api.text(NOTHING[key], G.x + G.w / 2, G.ly + 20, '#9aa39a', 'center', 6);
    else {
      const vis = visible(G); let top = S.top[S.tab]; if (sel < top) top = sel; if (sel >= top + vis) top = sel - vis + 1; top = Math.max(0, Math.min(top, Math.max(0, n - vis))); S.top[S.tab] = top;
      for (let i = top; i < Math.min(n, top + vis); i++) { const r = rs[i], y = G.ly + (i - top) * ROW_H, on = i === sel, bw = Math.floor((G.w - 22) / 2) - 2;
        if (on) { g.fillStyle = 'rgba(143,209,96,0.14)'; g.fillRect(G.x + 3, y - 1, G.w - 6, ROW_H - 1); }
        api.hit(G.x + 3, y - 1, G.w - 6, 10, () => { if (S.sel[S.tab] !== i) { S.sel[S.tab] = i; api.sfx('ui'); } });
        api.text(api.fit((r.open ? 'L' + r.level + ' ' : '? L' + r.level + ' ') + (r.open ? r.name : '') + (r.open && r.trade ? ' - ' + r.trade : ''), G.w - 12, 6), G.x + 6, y, r.open ? (r.capstone ? '#ffd36b' : '#fff6e0') : '#6a6a78', 'left', 6);
        ['A', 'B'].forEach((s, j) => { const bx = G.x + 6 + j * (bw + 4), picked = r.side === s, cur = on && S.cur[S.tab] === j;
          g.fillStyle = picked ? 'rgba(46,82,40,0.9)' : 'rgba(26,24,36,0.9)'; g.fillRect(bx, y + 8, bw, 11);
          g.strokeStyle = cur ? '#fff6e0' : picked ? '#8fd160' : 'rgba(255,255,255,0.16)'; g.lineWidth = 1; g.strokeRect(bx + 0.5, y + 8.5, bw - 1, 10);
          api.hit(bx, y + 8, bw, 11, () => { S.sel[S.tab] = i; S.cur[S.tab] = j; setAt(i, j); });
          api.text(api.fit((picked ? '> ' : '') + (r.open ? r[s].name : '?'), bw - 6, 6), bx + 3, y + 11, !r.open ? '#6a6a78' : picked ? '#a8e06e' : '#c9d1dc', 'left', 6); });
      }
      if (top > 0) { api.text('^', G.x + G.w - 10, G.ly, '#8a8f80', 'left', 6); api.hit(G.x + G.w - 14, G.ly - 2, 12, 12, () => move(-1)); }
      if (top + vis < n) { api.text('v', G.x + G.w - 10, G.ly + G.lh - 8, '#8a8f80', 'left', 6); api.hit(G.x + G.w - 14, G.ly + G.lh - 10, 12, 12, () => move(1)); }
      const r = rs[sel], s = r && r.open ? r[S.cur[S.tab] ? 'B' : 'A'] : null;   /* the detail: the side under the cursor, what it does, its input, and a note when it does not apply yet */
      if (s) { api.wrap(s.what, G.w - 12, 6).slice(0, 2).forEach((ln, j) => api.text(ln, G.x + 6, G.dy + 2 + j * 8, '#c9b892', 'left', 6)); api.text(api.fit((s.input ? s.input + '  ' : '') + (r.note || ''), G.w - 12, 6), G.x + 6, G.dy + 19, r.note ? '#ffb070' : '#8a8f80', 'left', 6); }
      else if (r) api.text('OPENS AT LEVEL ' + r.level, G.x + 6, G.dy + 2, '#9aa39a', 'left', 6); }
    api.text(api.fit(S.msgT > 0 ? S.msg : 'LEFT/RIGHT A OR B   Z SET IT   UP/DOWN   TAB: NEXT LIST   ESC BACK', G.w - 8, 6), G.x + G.w / 2, G.y + G.h - 9, S.msgT > 0 ? '#ffd36b' : '#8a8f80', 'center', 6); }
  return { open, close, input, draw, get isOpen() { return S.open; }, state: S, rows, geo, setTab, move, setAt, refresh };
}
