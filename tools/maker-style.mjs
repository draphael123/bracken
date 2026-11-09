/* tools/maker-style.mjs (claude/maker) - THE LEVEL STYLE, THE ONE SLOPE PIECE AND THE TABS BY ROLE.
   1. STYLE: every plain ground cell wears the level's style (in the editor and in play); a SHIFT-stamped cell keeps its own
      when the style changes; save/load keeps the style.
   2. SLOPE: a drag builds steep or gentle slopes, rising either way, standing on filled ground; a click makes one ramp.
   3. TABS: every tab item is a real piece, and every piece the palette used to show is still on some tab (except the old
      per-material grounds and the six slope tiles, which the STYLE swatches and SLOPE replace).   node tools/maker-style.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(12), audio: false, seed: 5 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'), U = await import('/src/maker-ui.js'); MKR.enter(); U.closePanel(); const r = {};
    const { T } = await import('/src/level.js'), { SLOPE } = await import('/src/slopes.js');
    // 1. style
    const d = MKR.blank(60, 28); d.ents = [{ t: 'gate', x: 55, y: 19 }]; d.style = 'masonry'; d.mat = { '10,20': 'deck' }; MKR.doc = d; MKR.mount();
    const m = P.engineMat(d), solids = [...d.grid].map((v, i) => [v, i]).filter(([v]) => v === T.SOLID).map(([, i]) => i);
    r.allStyled = solids.every(i => m[i] === (i === 20 * 60 + 10 ? 'deck' : 'masonry'));
    d.style = 'city'; r.stampKept = P.engineMat(d)[20 * 60 + 10] === 'deck' && P.engineMat(d)[21 * 60 + 30] === 'city';
    d.style = null; r.bgOwn = Object.keys(P.engineMat(d) || {}).length === 1;
    d.style = 'shore'; MKR.play(); BK.step(10); r.playStyled = !!(BK.L.mat && BK.L.mat[21 * 60 + 30] === 'shore'); MKR.resume();
    const t = P.terrainOf(d), d2 = MKR.blank(60, 28); P.setTerrain(d2, JSON.parse(JSON.stringify(t))); r.saved = d2.style === 'shore';
    // 2. slopes (floor top row 20 in a blank level: you stand on row 19)
    const e = MKR.blank(80, 28), at = (x, y) => e.grid[y * 80 + x];
    let c = P.rampCells(e, { x: 10, y: 19 }, { x: 13, y: 16 }); r.steepR = c.filter(q => q[2] === SLOPE.R1).length === 3 && c.some(q => q[0] === 13 && q[1] === 17 && q[2] === T.SOLID);
    c = P.rampCells(e, { x: 40, y: 19 }, { x: 34, y: 16 }); r.gentleL = c.filter(q => q[2] === SLOPE.L2A).length === 3 && c.filter(q => q[2] === SLOPE.L2B).length === 3;
    c = P.rampCells(e, { x: 50, y: 19 }, { x: 56, y: 16 }); r.gentleR = c.filter(q => q[2] === SLOPE.R2A).length === 3 && c.filter(q => q[2] === SLOPE.R2B).length === 3 && c.every(q => q[0] >= 50);
    c = P.rampCells(e, { x: 60, y: 16 }, { x: 66, y: 19 }); r.highFirst = c.filter(q => q[2] === SLOPE.L2A).length === 3 && c.every(q => q[0] <= 66);   /* dragged from the top: still climbs toward the top end */
    c = P.rampCells(e, { x: 30, y: 19 }, { x: 30, y: 19 }); r.click = c.length === 1 && c[0][2] === SLOPE.R1;
    P.rampStart({ x: 10, y: 19 }); const ch = P.rampEnd(e, { x: 13, y: 16 }); r.applied = ch.length > 0 && at(10, 19) === SLOPE.R1 && at(12, 17) === SLOPE.R1 && at(12, 18) === T.SOLID && at(12, 19) === T.SOLID && !P.rampActive();
    MKR.doc = e; MKR.play(); BK.god = true; BK.tp(5, 19); BK.step(20); const y0 = BK.P.y; for (let i = 0; i < 90; i++) { dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); BK.step(1); } dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));
    r.walkedUp = BK.P.x > 13 * 16 && BK.P.y < y0 - 40; MKR.resume(); BK.god = false;
    // 3. tabs
    const shown = new Set(), bad = []; for (const g of U.GROUPS) for (const q of g.items || []) { const ok = q.i >= 0 && (q.cat === 3 ? true : q.cat === 0 ? q.i < P.TILES.length : q.cat === 1 ? q.i < P.FOES.length : q.i < P.THINGS.length); if (!ok) bad.push(g.name); shown.add(q.cat + ':' + q.i); }
    const missing = []; P.TILES.forEach((tt, i) => { const v = tt[1]; if (typeof v === 'string' && v.startsWith('mat:')) return; if (v >= 20 && v <= 25) return; if (!shown.has('0:' + i)) missing.push(tt[0]); });
    P.FOES.forEach((f, i) => { if (!shown.has('1:' + i)) missing.push(f); }); P.THINGS.forEach((f, i) => { if (!shown.has('2:' + i) && !P.HIDDEN_THINGS.includes(f)) missing.push(f); });
    r.badItems = bad; r.missing = missing;
    // 4. one piece per idea: a moving platform turns into a lift and back; the key and gate show one name; START is on a tab
    const mv = P.entFor('mover', 5, 5), vr = P.pieceRows(mv).find(q => q.key === 'vert'); P.stepRow(d, mv, vr, 1); r.toLift = mv.vert === true && mv.rise === 4 && P.pieceRows(mv).some(q => q.key === 'rise');
    P.stepRow(d, mv, P.pieceRows(mv).find(q => q.key === 'vert'), 1); r.backToSlide = mv.vert === false && mv.range === 4;
    r.oneKey = P.paletteName('key:brass') === 'KEY' && P.settingLabels('key:brass').includes('METAL') && P.settingLabels('lockgate:brass').includes('OPENS WITH');
    r.startOnTab = U.GROUPS.some(g => g.name === 'START/GOAL' && g.items.some(q => q.cat === 3 && q.i === 0));
    // 5. FIND: typing narrows every piece to the matches
    const kd = k => { dispatchEvent(new KeyboardEvent('keydown', { key: k })); dispatchEvent(new KeyboardEvent('keyup', { key: k })); };
    MKR.mount(); U.openFind(null); for (const k of 'gob') kd(k); r.findTyped = U.browseOpen() && U.findText() === 'gob'; kd('Escape'); r.findCleared = U.browseOpen() && U.findText() === ''; kd('Escape'); r.findClosed = !U.browseOpen();
    return r;
  })()`, 200000);
  console.log(JSON.stringify(r));
  for (const k of ['allStyled', 'stampKept', 'bgOwn', 'playStyled', 'saved', 'steepR', 'gentleL', 'gentleR', 'highFirst', 'click', 'applied', 'walkedUp', 'toLift', 'backToSlide', 'oneKey', 'startOnTab', 'findTyped', 'findCleared', 'findClosed']) assert(r[k], 'maker style: ' + k + ' failed ' + JSON.stringify(r));
  assert.deepEqual(r.badItems, [], 'tab items that are not pieces');
  assert.deepEqual(r.missing, [], 'pieces on no tab');
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-style: the level style dresses all its ground (stamped cells keep theirs, save keeps it), the SLOPE drag builds walkable steep and gentle slopes either way, and every piece is on a tab.');
} finally { pg.close(); }
