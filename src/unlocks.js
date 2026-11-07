// src/unlocks.js - THE UNLOCKS SCREEN and THE PLAIN WORDS every lock line is built from (claude/unlocks, Daniel 11-07 08:48).
//   the old Burning Village lock (beat Gorm "without falling") was unclear and cut off on the map panel. Every lock line in the game now comes from THIS file's phrases (reqText / heroHow / featHow),
//   in plain words, and every place that shows one WRAPS it (the map panel's strip, the swap-hero panel, this screen) - a lock line is never cut.
//   THE SCREEN: tabs LEVELS / HEROES / SKINS / OTHER; a row = name, how to get it, your progress, a tick when it is yours. Read-only. Reachable from the title menu, the pause
//   menu and THE UNLOCKS BOARD in the inn (src/tavern.js). Under the demo flag it lists only the demo slice (buildTabs: facts.demo + facts.inSlice).
// Pure: no page, no game (tools/unlocks.mjs holds the rows, the demo filter and the wording fits in Node). main.js supplies the facts (see makeUnlocks' api).
import * as SC from './secrets.js';

export const TABS = ['LEVELS', 'HEROES', 'SKINS', 'OTHER'];
export const GORM_WANT = 'BEAT KING GORM WITHOUT DYING';
export const NOTHING = 'NOTHING HERE YET';

/* KING GORM'S ROW: what the player has done so far. 'beaten, but you died - try again' is the case a clear that did not count. */
export const gormProgress = ({ kingsCleared, burningOpen }) => burningOpen ? 'DONE' : kingsCleared ? 'BEATEN, BUT YOU DIED - TRY AGAIN' : 'NOT BEATEN YET';

/* THE LEVEL A FEAT NAMES (for the demo filter): 'boss:warcairn' -> 'warcairn', a level id -> itself, medals / iron / flask -> null */
export const featLevel = feat => { const f = String(feat || ''); if (!f) return null; if (f.startsWith('boss:')) return f.slice(5) || null; if (f === 'iron' || f.startsWith('medals:') || f.startsWith('flask:')) return null; return f; };

/* ===== LEVELS: what a level asks, as data (levelReq), then the words (reqText / reqProgress) ===== */
/* lv: a LEVELS entry. prog: the save. h: { nameOf(id), fmt(secs), medalsFor(id) -> [bronze, silver, gold] secs, killPct(lv) -> 0..1 } (main.js) */
export function levelReq(lv, prog, h) {
  const p = id => (prog && prog[id]) || {}, o = lv.opensOn, sec = SC.forLevel(lv.id), cleared = id => !!p(id).cleared;
  if (sec) { const st = SC.stateOf(sec, prog), told = sec.kind === 'told';
    return { kind: 'pieces', hidden: !told && st === 'unknown', n: SC.count(sec, prog), total: SC.total(sec), many: sec.pieces.many, line: SC.progressLine(sec, prog), where: told ? sec.host : null, hostName: told ? h.nameOf(sec.host) : '' }; }
  if (o && o.gorm) return { kind: 'gorm', kingsCleared: cleared('kings'), burningOpen: !!(prog && prog.burningOpen) };
  if (lv.needsTime) return { kind: 'time', level: h.nameOf(lv.needsTime.id), secs: h.fmt(lv.needsTime.t), best: p(lv.needsTime.id).best !== undefined && p(lv.needsTime.id).best !== null ? h.fmt(p(lv.needsTime.id).best) : null };
  if (lv.needsKills) return { kind: 'kills', level: h.nameOf(lv.needsKills.id), pct: Math.round(lv.needsKills.pct * 100), have: Math.round(h.killPct(lv) * 100) };
  if (o) {
    const best = p(o.level).best !== undefined && p(o.level).best !== null ? h.fmt(p(o.level).best) : null, lvName = h.nameOf(o.level);
    if (o.time) return { kind: 'time', level: lvName, secs: h.fmt(o.time), best, cleared: cleared(o.level) };
    if (!o.medal) return { kind: 'clear', level: lvName, cleared: cleared(o.level) };
    const names = ['', 'BRONZE', 'SILVER', 'GOLD'], rank = typeof o.medal === 'number' ? o.medal : ({ bronze: 1, silver: 2, gold: 3 }[o.medal] || 1);
    return { kind: 'medal', level: lvName, medal: names[rank], secs: h.fmt((h.medalsFor(o.level) || [300, 450, 660])[3 - rank]), best, cleared: cleared(o.level) };
  }
  if (lv.needs) return { kind: 'clear', level: h.nameOf(lv.needs), cleared: cleared(lv.needs) };
  if (lv.locked) return { kind: 'shut' };
  return { kind: 'free' };
}
/* HOW TO OPEN IT, one line, plain words (the map panel's strip wraps it; the screen's row wraps it) */
export function reqText(r) {
  switch (r.kind) {
    case 'free': return 'OPEN FROM THE START';
    case 'clear': return 'CLEAR ' + r.level;
    case 'gorm': return GORM_WANT;
    case 'time': return 'BEAT ' + r.level + ' IN ' + r.secs + ' OR LESS';
    case 'kills': return 'DEFEAT ' + r.pct + '% OF THE FOES IN ' + r.level;
    case 'medal': return 'WIN A ' + r.medal + ' MEDAL IN ' + r.level + ' (UNDER ' + r.secs + ')';
    case 'pieces': return r.hidden ? 'A HIDDEN WAY. LOOK OFF THE ROAD.' : r.where ? 'LIGHT ALL ' + r.total + ' ' + r.many + ' IN ' + r.hostName : 'FIND ALL ' + r.total + ' ' + r.many;
    default: return 'NOT OPEN YET';
  }
}
/* YOUR PROGRESS TOWARD IT (a short line, or '' when there is nothing to say) */
export function reqProgress(r) {
  switch (r.kind) {
    case 'free': return '';
    case 'clear': return r.cleared ? 'CLEARED' : 'NOT CLEARED YET';
    case 'gorm': return gormProgress(r);
    case 'time': case 'medal': return r.best ? 'YOUR BEST: ' + r.best : 'NOT CLEARED YET';
    case 'kills': return 'YOU HAVE DEFEATED ' + r.have + '%';
    case 'pieces': return r.hidden ? 'NOT FOUND YET' : r.line;
    default: return 'COMING LATER';
  }
}
/* the map panel's strip for a SHUT road: a road behind another one first says to clear that one (the strip shows only the next step) */
export function stripLine(r, prevName, prevCleared) { return prevName && !prevCleared ? 'CLEAR ' + prevName + ' FIRST' : reqText(r); }
export function levelRow(lv, name, r, done) { return { name, how: reqText(r), progress: done ? 'UNLOCKED' : reqProgress(r), done: !!done, level: lv.id }; }

/* ===== HEROES: a hero's row, from facts (main.js heroFacts) ===== */
/* f: { name, owned, starter, hidden (a secret's hero, the secret not found), feat (words, 'beat the Blood Knight in the Unburied Field' | null), featDone, silver, coin, coinLevel, coinCleared } */
export function heroHow(f) {
  if (f.starter) return 'YOU START WITH HIM';
  const price = (f.silver ? f.silver + ' SILVER' : '') + (f.coin ? (f.silver ? ' OR ' : '') + f.coin + ' GOLD' : '');
  if (f.feat) return (f.hidden ? 'FIND HIS HIDDEN PATH AND BEAT HIM' : String(f.feat).toUpperCase()) + ', THEN BUY HIM: ' + price;
  return 'BUY HIM AT THE STORE: ' + price + (f.coin && f.coinLevel ? ' (GOLD ONLY AFTER ' + String(f.coinLevel).toUpperCase() + ')' : '');
}
export function heroProgress(f) {
  if (f.owned) return 'YOURS';
  if (f.feat) return f.featDone ? 'BEATEN - NOW YOU CAN BUY HIM' : 'NOT BEATEN YET';
  if (f.coin && f.coinLevel) return f.coinCleared ? String(f.coinLevel).toUpperCase() + ' CLEARED' : String(f.coinLevel).toUpperCase() + ' NOT CLEARED YET';
  return 'NOT BOUGHT YET';
}
export const heroRow = f => ({ name: f.hidden && !f.owned ? '? ? ?' : f.name, how: heroHow(f), progress: heroProgress(f), done: !!f.owned, hero: f.id });

/* ===== SKINS / OTHER: a feat the game counts (src/store.js lockOf's feats: 'boss:<id>', 'medals:N', 'iron', a level id) ===== */
export function featHow(words) { return String(words || '').toUpperCase(); }
/* feat: the feat string; s: { medals (the count), done (featDone) } */
export function featProgress(feat, s) {
  const f = String(feat || '');
  if (f.startsWith('medals:')) return Math.min(s.medals | 0, +f.slice(7)) + ' OF ' + +f.slice(7) + ' MEDALS';
  return s.done ? 'DONE' : f.startsWith('boss:') ? 'NOT BEATEN YET' : f === 'iron' ? 'NOT DONE YET' : 'NOT CLEARED YET';
}
/* a row of the SKINS / OTHER tabs: level = a level id the demo filter checks; demoHide = never in the demo */
export const perk = (name, how, progress, done, extra) => ({ name, how, progress, done: !!done, ...(extra || {}) });

/* ===== THE TABS (pure): facts -> { LEVELS, HEROES, SKINS, OTHER }; under the demo only what the slice holds ===== */
/* facts: { demo, inSlice(levelId) -> bool, levels: rows, heroes: rows, skins: rows, other: rows } (rows from levelRow / heroRow / perk) */
export function buildTabs(f) {
  const keep = r => !f.demo || (!r.demoHide && (!r.level || f.inSlice(r.level)));
  return { LEVELS: (f.levels || []).filter(keep), HEROES: (f.heroes || []).filter(keep), SKINS: (f.skins || []).filter(keep), OTHER: (f.other || []).filter(keep) };
}
export const countOf = rows => ({ done: rows.filter(r => r.done).length, of: rows.length });

/* ===== LAYOUT (pure; the screen and the tool use the same functions) ===== */
export const LH = 7, NAME_H = 8, GAP = 4;
/* a row's lines, wrapped to the inner width: wrapFn(s, maxW, size) -> [lines] */
export function rowLines(row, wrapFn, w) { return { name: wrapFn(row.name, w, 6), how: wrapFn(row.how || '', w, 6), progress: row.progress ? wrapFn(row.progress, w, 6) : [] }; }
export const rowHeight = ln => NAME_H * ln.name.length + LH * (ln.how.length + ln.progress.length) + GAP;
export const heightsOf = (rows, wrapFn, w) => rows.map(r => rowHeight(rowLines(r, wrapFn, w)));
/* the first visible row such that row `sel` is wholly inside a view `viewH` tall */
export function fixTop(heights, sel, top, viewH) {
  if (!heights.length) return 0;
  sel = Math.max(0, Math.min(heights.length - 1, sel)); top = Math.max(0, Math.min(sel, top));
  const used = () => { let s = 0; for (let i = top; i <= sel; i++) s += heights[i]; return s; };
  while (top < sel && used() > viewH) top++;
  return top;
}
/* how many rows (from top) fit whole in viewH */
export function fitCount(heights, top, viewH) { let s = 0, n = 0; for (let i = top; i < heights.length; i++) { if (s + heights[i] > viewH) break; s += heights[i]; n++; } return n; }
export const stepIndex = (i, dir, n) => n ? ((i + dir) % n + n) % n : 0;

/* ===== THE SCREEN =====
   api: g(), VW(), VH(), time(), text(s, x, y, col, align, size), panel(x, y, w, h), hit(x, y, w, h, fn), sfx(k), wrap(s, w, size) -> [lines], tabs() -> buildTabs(...) result */
export function makeUnlocks(api) {
  const S = { open: false, tab: 0, sel: [0, 0, 0, 0], top: [0, 0, 0, 0], data: null, count: 0, from: '' };
  const rowsNow = () => (S.data && S.data[TABS[S.tab]]) || [];
  function open(from) { S.data = api.tabs(); S.open = true; S.tab = 0; S.sel = [0, 0, 0, 0]; S.top = [0, 0, 0, 0]; S.count++; S.from = from || ''; api.sfx('menuOpen'); return true; }
  function close() { if (!S.open) return; S.open = false; api.sfx('menuClose'); }
  const setTab = d => { S.tab = stepIndex(S.tab, d, TABS.length); api.sfx('ui'); };
  const move = d => { const n = rowsNow().length; if (!n) return; S.sel[S.tab] = stepIndex(S.sel[S.tab], d, n); api.sfx('ui'); };
  /* one frame of input while it is open: p = { left, right, up, down, back } (the frame's presses); true = it ate them */
  function input(p) {
    if (!S.open) return false;
    if (p.left) setTab(-1); if (p.right) setTab(1);
    if (p.up) move(-1); if (p.down) move(1);
    if (p.back) close();
    return true;
  }
  const geo = () => { const VW = api.VW(), VH = api.VH(), x = 4, y = 4, w = VW - 8, h = VH - 8, ly = y + 27, lh = h - 27 - 13, tx = x + 18, tw = w - 18 - 12; return { VW, VH, x, y, w, h, ly, lh, tx, tw }; };
  function draw() {
    if (!S.open) return;
    const g = api.g(), G = geo(), rows = rowsNow(), key = TABS[S.tab];
    g.fillStyle = 'rgba(6,5,10,0.9)'; g.fillRect(0, 0, G.VW, G.VH);
    api.panel(G.x, G.y, G.w, G.h);
    api.text('UNLOCKS', G.x + 6, G.y + 4, '#ffd36b', 'left', 8);
    const c = countOf(rows); api.text(c.done + ' OF ' + c.of + ' UNLOCKED', G.x + G.w - 36, G.y + 6, '#a8e06e', 'right', 6);
    api.hit(G.x + G.w - 32, G.y + 3, 30, 11, () => close()); api.text('BACK', G.x + G.w - 6, G.y + 6, '#8a8f80', 'right', 6);
    const tw4 = Math.floor((G.w - 8) / TABS.length);
    TABS.forEach((t, k) => { const tx = G.x + 4 + k * tw4, on = k === S.tab;
      api.hit(tx, G.y + 16, tw4 - 2, 10, () => { if (S.tab !== k) { S.tab = k; api.sfx('ui'); } });
      g.fillStyle = on ? 'rgba(70,104,60,0.85)' : 'rgba(34,30,46,0.8)'; g.fillRect(tx, G.y + 16, tw4 - 2, 10);
      if (on) { g.strokeStyle = '#a8e06e'; g.lineWidth = 1; g.strokeRect(tx + 0.5, G.y + 16.5, tw4 - 3, 9); }
      api.text(t, tx + (tw4 - 2) / 2, G.y + 18, on ? '#fff6e0' : '#9aa39a', 'center', 6); });
    if (!rows.length) { api.text(NOTHING, G.x + G.w / 2, G.ly + 20, '#9aa39a', 'center', 6); }
    else {
      const hs = heightsOf(rows, api.wrap, G.tw), sel = S.sel[S.tab];
      S.top[S.tab] = fixTop(hs, sel, S.top[S.tab], G.lh);
      let top = S.top[S.tab], yy = G.ly;
      const cnt = fitCount(hs, top, G.lh);
      for (let i = top; i < top + Math.max(1, cnt) && i < rows.length; i++) {
        const r = rows[i], ln = rowLines(r, api.wrap, G.tw), h = hs[i], on = i === sel;
        api.hit(G.x + 2, yy, G.w - 14, h, () => { if (S.sel[S.tab] !== i) { S.sel[S.tab] = i; api.sfx('ui'); } });
        if (on) { g.fillStyle = 'rgba(143,209,96,0.16)'; g.fillRect(G.x + 3, yy - 1, G.w - 16, h); }
        g.fillStyle = r.done ? '#2f4a2a' : '#1b1626'; g.fillRect(G.x + 6, yy, 8, 8); g.strokeStyle = r.done ? '#8fd160' : '#6a6a78'; g.lineWidth = 1; g.strokeRect(G.x + 6.5, yy + 0.5, 7, 7);
        if (r.done) { g.fillStyle = '#a8e06e'; g.fillRect(G.x + 8, yy + 4, 2, 2); g.fillRect(G.x + 10, yy + 3, 1, 2); g.fillRect(G.x + 11, yy + 1, 1, 3); }
        let ty = yy;
        ln.name.forEach(s => { api.text(s, G.tx, ty, r.done ? '#a8e06e' : '#fff6e0', 'left', 6); ty += NAME_H; });
        ln.how.forEach(s => { api.text(s, G.tx, ty, '#c9b892', 'left', 6); ty += LH; });
        ln.progress.forEach(s => { api.text(s, G.tx, ty, r.done ? '#8fd160' : '#ffb070', 'left', 6); ty += LH; });
        yy += h;
      }
      const rx = G.x + G.w - 10;
      if (top > 0) { api.text('^', rx, G.ly, '#8a8f80', 'left', 6); api.hit(rx - 4, G.ly - 2, 12, 14, () => move(-1)); }
      if (top + cnt < rows.length) { api.text('v', rx, G.ly + G.lh - 8, '#8a8f80', 'left', 6); api.hit(rx - 4, G.ly + G.lh - 10, 12, 14, () => move(1)); }
    }
    api.text('LEFT/RIGHT TABS   UP/DOWN   ESC BACK', G.x + G.w / 2, G.y + G.h - 9, '#8a8f80', 'center', 6);
  }
  return { open, close, input, draw, get isOpen() { return S.open; }, state: S, rows: rowsNow, geo, setTab, move };
}
