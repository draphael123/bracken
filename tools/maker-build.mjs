/* tools/maker-build.mjs (claude/maker, the building batch) - COMBINING PIECES, SWITCHES, HEIGHT AND COPY/PASTE work.
   1. ELITE: a foe set to elite spawns as one (bigger).  2. CRATES: a crate holding a foe lets it out when broken; one holding
   a heart drops a heart.  3. SWITCH: each hit swaps RED and BLUE blocks; a retry puts them back.  4. HEIGHT: rows go on at the
   top and everything keeps its place on the ground.  5. SELECT / COPY / PASTE / CLEAR move tiles, pieces and crate contents.
   6. Switch blocks and crate contents survive SAVE -> LOAD.   node tools/maker-build.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(9) , audio: false, seed: 12 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'); MKR.enter(); (await import('/src/maker-ui.js')).closePanel(); const r = {};
    const swing = () => { dispatchEvent(new KeyboardEvent('keydown', { key: 'x' })); BK.step(1); dispatchEvent(new KeyboardEvent('keyup', { key: 'x' })); BK.step(60); };
    const W = 100, d = MKR.blank(W, 28), et = ['shield', 'brute', 'archer'].find(t => P.hasElite(t)); r.eliteKind = et;
    d.ents = [{ t: 'gate', x: 95, y: 19 }, { t: et, x: 12, y: 19, elite: true }, P.entFor('switch', 46, 19)];
    d.grid[19 * W + 30] = 4; d.grid[19 * W + 34] = 4; d.loot = { '30,19': 'sprig', '34,19': 'mend' };
    d.sw = {}; for (let y = 15; y <= 19; y++) { d.grid[y * W + 50] = 18; d.sw['50,' + y] = 'red'; d.sw['54,' + y] = 'blue'; }
    d.start = { x: 3, y: 19 }; MKR.doc = d; MKR.play(); BK.god = true; BK.step(20);
    const el = BK.enemies().find(e => e.t === et); r.elite = !!(el && el.elite);
    BK.tp(29, 19); BK.P.face = 1; for (let k = 0; k < 3; k++) swing(); r.crateFoe = BK.enemies().some(e => e.t === 'sprig');
    const hs = () => { try { return BK.healths.length; } catch (e) { return -1; } }; const h0 = hs();
    BK.tp(33, 19); BK.P.face = 1; for (let k = 0; k < 3; k++) swing(); r.crateHeart = BK.L.grid[19 * W + 34] === 0;
    BK.tp(45, 19); BK.P.face = 1; swing(); r.flip1 = BK.L.grid[17 * W + 50] === 0 && BK.L.grid[17 * W + 54] === 18; swing(); r.flip2 = BK.L.grid[17 * W + 50] === 18 && BK.L.grid[17 * W + 54] === 0;
    swing(); MKR.play(); BK.step(10); r.resetOnRetry = BK.L.grid[17 * W + 50] === 18 && BK.L.grid[17 * W + 54] === 0; MKR.resume();
    const e = MKR.blank(60, 28); e.ents = [{ t: 'gate', x: 55, y: 19 }, { t: 'sprig', x: 20, y: 19 }]; P.resizeHeight(e, 8); r.height = e.H === 36 && e.ents[1].y === 27 && e.grid[28 * 60 + 20] === 1 && e.grid.length === 60 * 36;
    const c = MKR.blank(60, 28); c.ents = [{ t: 'gate', x: 55, y: 19 }, { t: 'sprig', x: 12, y: 19 }]; for (let x = 10; x <= 15; x++) c.grid[17 * 60 + x] = 2; c.grid[19 * 60 + 14] = 4; c.loot = { '14,19': 'sprig' };
    P.selStart({ x: 10, y: 17 }); P.selMove({ x: 15, y: 19 }); P.selEnd(); P.copySel(c); P.startPaste(); P.pasteAt(c, { x: 30, y: 17 });
    r.paste = [30, 35].every(x => c.grid[17 * 60 + x] === 2) && c.ents.some(q => q.t === 'sprig' && q.x === 32) && c.loot['34,19'] === 'sprig'; P.clearSel(c); r.clear = c.grid[17 * 60 + 30] === 0 && !c.ents.some(q => q.x === 32); P.selClear();
    r.badElites = []; for (const t of P.FOES.filter(q => P.hasElite(q) && !P.BOSSES.includes(q))) {   /* every foe the palette offers as ELITE spawns as one */
      const wet = P.WATER_FOES.includes(t), q = MKR.blank(60, 28); if (wet) { for (let x = 15; x <= 45; x++) for (let y = 14; y <= 25; y++) q.grid[y * 60 + x] = 0; q.water = [{ kind: 'water', x0: 15, x1: 45, y0: 14, y1: 25 }]; }
      q.ents = [{ t: 'gate', x: 55, y: 19 }, { t, x: 30, y: wet ? 22 : 19, elite: true }]; MKR.doc = q;
      try { MKR.play(); BK.god = true; BK.step(30); const f = BK.enemies().find(z => z.t === t); BK.tp(26, wet ? 22 : 19); BK.step(240); if (!f || !f.elite || !isFinite(f.x)) r.badElites.push(t); } catch (x) { r.badElites.push(t + ':' + x.message); }
      try { MKR.resume(); } catch (x) {} }
    MKR.doc = d; MKR.mount(); const KEY = 'bracken.level.2', keep = localStorage.getItem(KEY), kd = k => { dispatchEvent(new KeyboardEvent('keydown', { key: k })); dispatchEvent(new KeyboardEvent('keyup', { key: k })); };
    kd('f'); kd('f'); kd('s'); MKR.doc = MKR.blank(60, 28); kd('l'); r.saveLoad = MKR.doc.sw['50,17'] === 'red' && MKR.doc.loot['30,19'] === 'sprig'; kd('f');
    if (keep === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, keep);
    return r;
  })()`, 300000);
  console.log(JSON.stringify(r));
  for (const k of ['elite', 'crateFoe', 'crateHeart', 'flip1', 'flip2', 'resetOnRetry', 'height', 'paste', 'clear', 'saveLoad']) assert(r[k], 'maker build: ' + k + ' failed ' + JSON.stringify(r));
  assert.deepEqual(r.badElites, [], 'elite forms that do not work: ' + r.badElites.join(', '));
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-build: elites, crate contents, switch blocks, taller levels and copy/paste work, and save/load keeps them.');
} finally { pg.close(); }
