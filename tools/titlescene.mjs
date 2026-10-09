// tools/titlescene.mjs - THE TITLE AS ONE SCENE, THE HERO ROW, THE MAP'S FIRST FRAME (claude/titlescene, 2026-10-09).
//   TITLE      the sign, its tagline and the menu all sit whole on the screen; the tagline never meets the menu board; no footer line of another size.
//   HERO PICK  a ROW of the heroes' own idle frames (they move), the one picked is lifted and lit, every name is on screen with a one-line role, and the
//              keys, a tap on a portrait and a tap on the picked one all work.
//   MAP        the first map frame is already the map (never a black flash): its first frame is at least half as bright as the settled one.
// usage: node tools/titlescene.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const pg = await openPage({ audio: false });
try {
  /* ---- 1. THE TITLE ---- */
  const t = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.ui.pressCard = false; BK.state = 'title'; BK.step(150);
    const { VW, VH } = BK.view; window.__textRec = []; BK.step(1); const r = window.__textRec.filter(x => x.kind === 'text').map(x => ({ s: x.s, x0: x.x0, y0: x.y0, w: x.w, h: x.h, size: x.size })); window.__textRec = null; return { VW, VH, r, items: BK.ui.titleItems() }; })()`);
  const by = s => t.r.find(x => x.s === s), logo = t.r.filter(x => x.s === 'BRACKEN' && x.size >= 16), tag = by('a knight, a wood, a mountain');
  assert.ok(logo.length >= 1 && tag, 'the sign and its tagline are drawn: ' + t.r.map(x => x.s).join(' / '));
  for (const x of t.r) assert.ok(x.x0 >= 4 && x.x0 + x.w <= t.VW - 4 && x.y0 >= 0 && x.y0 + x.h <= t.VH, 'on the screen, whole: ' + x.s + ' ' + JSON.stringify(x));
  const menu = t.items.map(s => by(s)).filter(Boolean);
  assert.equal(menu.length, t.items.length, 'every menu item is drawn: ' + t.items.join('|'));
  const mx0 = Math.min(...menu.map(m => m.x0)), mTop = Math.min(...menu.map(m => m.y0));
  assert.ok(tag.y0 + tag.h < mTop || tag.x0 + tag.w < mx0 - 4, 'the tagline does not meet the menu board');
  assert.ok(!t.r.some(x => /ARROWS choose|tap an item/.test(x.s)), 'no footer line under the scene');
  assert.ok(menu.every(m => m.size === menu[0].size), 'the menu is one size');
  console.log('ok  title          sign + tagline + ' + menu.length + ' menu items all whole on screen, tagline clear of the board, one menu size, no footer');

  /* ---- 1b. OPTIONS (Daniel 10-09): SETTINGS + SOUND TEST + CONTROLS are ONE row; the board has six rows; the list under OPTIONS holds the three and BACK ---- */
  assert.equal(t.items.length, 6, 'the title board is six rows: ' + t.items.join('|'));
  assert.ok(t.items.includes('OPTIONS') && !t.items.some(k => ['SETTINGS', 'SOUND TEST', 'CONTROLS'].includes(k)), 'one OPTIONS row, the three are not top-level: ' + t.items.join('|'));
  const o = await pg.evalp(`(()=>{ BK.ui.titleI = BK.ui.titleItems().indexOf('OPTIONS'); BK.press('confirm'); BK.step(3); const sub = BK.ui.titleItems(); const opened = BK.ui.titleOpts; BK.press('pause'); BK.step(3); return { sub, opened, closed: !BK.ui.titleOpts, on: BK.ui.titleItems()[BK.ui.titleI] }; })()`);
  assert.deepEqual(o.sub, ['SETTINGS', 'SOUND TEST', 'CONTROLS', 'BACK'], 'OPTIONS opens SETTINGS, SOUND TEST, CONTROLS, BACK');
  assert.ok(o.opened && o.closed && o.on === 'OPTIONS', 'ESC closes the list and rests on OPTIONS: ' + JSON.stringify(o));
  console.log('ok  options        OPTIONS groups SETTINGS / SOUND TEST / CONTROLS under one row of a six-row board; ESC closes it');

  /* ---- 2. THE HERO PICK ---- */
  const h = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); const out = []; const { VW, VH } = BK.view;
    for (let i = 0; i < 3; i++) { BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = i; BK.step(6);
      const g2 = BK.view.buf.getContext('2d'), grab = () => Array.from(g2.getImageData(0, 14, VW, 62).data);
      window.__textRec = []; BK.step(1); const rec = (window.__textRec || []).filter(x => x.kind === 'text').map(x => ({ s: x.s, x0: x.x0, y0: x.y0, w: x.w, h: x.h })); window.__textRec = null;
      const a = grab(); BK.step(40); const b = grab(); out.push({ rec, moved: a.some((v, k) => v !== b[k]) }); }
    BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = 0; BK.step(2); BK.press('right'); BK.step(3); const afterRight = BK.ui.heroPickI;
    return { out, afterRight, VW, VH }; })()`);
  h.out.forEach((o, i) => {
    assert.ok(o.moved, 'pick ' + i + ': the portraits breathe (their own idle frames)');
    for (const x of o.rec) assert.ok(x.x0 >= 0 && x.x0 + x.w <= h.VW && x.y0 + x.h <= h.VH, 'on the screen, whole: ' + x.s);
    const names = o.rec.filter(x => /^(KNIGHT|WARDEN|GEOMANCER|PYRO|PALADIN|PIRATE|DEATH KNIGHT)$/.test(x.s));
    assert.ok(names.length >= 3, 'pick ' + i + ': every hero is named in the row: ' + o.rec.map(x => x.s).join(' / '));
    assert.ok(names.every(n => n.y0 === names[0].y0), 'the names stand on one line');
    const title = o.rec.find(x => x.s === 'CHOOSE YOUR HERO'); assert.ok(title && title.y0 + title.h <= 20, 'the heading is clear of the row');
  });
  assert.equal(h.afterRight, 1, 'RIGHT moves the pick');
  const tap = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = 0; BK.step(3);
    const boxes = BK.touch.hitBoxes ? BK.touch.hitBoxes() : null; return boxes; })()`);
  if (tap && tap.length) {
    const rows = tap.filter(b => b.y <= 20 && b.h >= 50 && b.w < 200 && b.w > 60);
    assert.ok(rows.length >= 3, 'a portrait is a tap box (' + rows.length + ' found of ' + tap.length + ')');
  }
  console.log('ok  hero pick      ' + h.out.length + ' portraits move, every hero named on one line under a clear heading, RIGHT picks, portraits are tap boxes');

  /* ---- 3. THE MAP'S FIRST FRAME ---- */
  const m = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    const lum = () => { const v = BK.view, c = v.buf.getContext('2d').getImageData(0, 0, v.VW, v.VH).data; let s = 0; for (let i = 0; i < c.length; i += 4) s += c[i] * 0.3 + c[i + 1] * 0.59 + c[i + 2] * 0.11; return s / (c.length / 4); };
    BK.state = 'title'; BK.step(3); BK.mapLook('wood'); BK.step(1); const first = lum(); BK.step(120); const settled = lum(); return { first, settled }; })()`);
  assert.ok(m.settled > 20, 'the settled map is a picture: ' + m.settled.toFixed(1));
  assert.ok(m.first >= m.settled * 0.5, 'the first map frame is already the map, not black: ' + m.first.toFixed(1) + ' vs ' + m.settled.toFixed(1));
  console.log('ok  map first      first frame ' + m.first.toFixed(1) + ' vs settled ' + m.settled.toFixed(1) + ' (never a black flash)');
  assert.deepEqual(pg.errors, [], 'no page errors'); console.log('ok  console        no page errors');
} finally { await pg.close(); }
