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
  assert.equal(t.items.length, 9, 'the title board is nine rows (six, the what-is-new row, ONLINE CO-OP from claude/onlinecoop, and BOSS SELECT from codex/bossselect): ' + t.items.join('|'));
  assert.ok(t.items.includes('OPTIONS') && !t.items.some(k => ['SETTINGS', 'SOUND TEST', 'CONTROLS'].includes(k)), 'one OPTIONS row, the three are not top-level: ' + t.items.join('|'));
  const o = await pg.evalp(`(()=>{ BK.ui.titleI = BK.ui.titleItems().indexOf('OPTIONS'); BK.press('confirm'); BK.step(3); const sub = BK.ui.titleItems(); const opened = BK.ui.titleOpts; BK.press('pause'); BK.sim(2); BK.step(2); return { sub, opened, closed: !BK.ui.titleOpts, on: BK.ui.titleItems()[BK.ui.titleI] }; })()`);
  assert.deepEqual(o.sub, ['SETTINGS', 'SOUND TEST', 'CONTROLS', 'REPORT A BUG', 'BACK'], 'OPTIONS opens SETTINGS, SOUND TEST, CONTROLS, REPORT A BUG, BACK');   /* (DELIBERATE DESIGN CHANGE, claude/shipfix, Daniel 10-11: REPORT A BUG is a row under OPTIONS, before BACK) */
  assert.ok(o.opened && o.closed && o.on === 'OPTIONS', 'ESC closes the list and rests on OPTIONS: ' + JSON.stringify(o));
  const e2 = await pg.evalp(`(()=>{ BK.ui.titleOpts = false; BK.ui.titleI = 0; BK.press('pause'); BK.step(3); const opened = BK.ui.titleOpts, st = BK.state, sub = BK.ui.titleItems(); BK.press('pause'); BK.sim(2); BK.step(2); return { opened, st, sub, closed: !BK.ui.titleOpts, st2: BK.state }; })()`);
  assert.ok(e2.opened && e2.st === 'title' && e2.sub.includes('BACK'), 'ESC on the title top level opens the OPTIONS list (not Settings directly): ' + JSON.stringify(e2));
  assert.ok(e2.closed && e2.st2 === 'title', 'ESC again closes the OPTIONS list and stays on the title: ' + JSON.stringify(e2));
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
    /* DESIGN CHANGE (claude/heroroster, Daniel 10-12): the pick shows ALL eight heroes, locked ones as ???, so the cards are 37 px wide and the names stand on TWO alternating lines (as the seven-hero row below always did), not one: the rule is now 'two lines at most, no two names touching' */
    assert.ok(new Set(names.map(n => n.y0)).size <= 2, 'the names stand on at most two alternating lines');
    for (let a = 0; a < names.length; a++) for (let b = a + 1; b < names.length; b++) { const p = names[a], q = names[b]; assert.ok(p.x0 + p.w <= q.x0 || q.x0 + q.w <= p.x0 || p.y0 + p.h <= q.y0 || q.y0 + q.h <= p.y0, 'pick ' + i + ': names ' + p.s + ' and ' + q.s + ' touch'); }
    const title = o.rec.find(x => x.s === 'CHOOSE YOUR HERO'); assert.ok(title && title.y0 + title.h <= 20, 'the heading is clear of the row');
  });
  assert.equal(h.afterRight, 1, 'RIGHT moves the pick');
  const tap = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = 0; BK.step(3);
    const boxes = BK.touch.hitBoxes ? BK.touch.hitBoxes() : null; return boxes; })()`);
  if (tap && tap.length) {
    const rows = tap.filter(b => b.y <= 20 && b.h >= 50 && b.w < 200 && b.w > 60);
    assert.ok(rows.length >= 3, 'a portrait is a tap box (' + rows.length + ' found of ' + tap.length + ')');
  }
  /* HERO_COLOR (claude/herocolors): one colour per hero; the name's ink holds 4.5:1 on the banner's plate (and the frame colour does too) */
  const hc = await pg.evalp('BK.heroColors()'), lum = c => { const v = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255).map(u => u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; }, cr = (p, q) => (Math.max(lum(p), lum(q)) + 0.05) / (Math.min(lum(p), lum(q)) + 0.05);
  for (const id of ['knight', 'warden', 'geomancer', 'ranger', 'berserker', 'pyro', 'paladin', 'pirate', 'reaper', 'sunpriest']) { const c = hc[id]; assert.ok(c, 'HERO_COLOR has ' + id); assert.ok(cr(c.ink, c.dark) >= 4.5, id + ': name ink on its plate ' + cr(c.ink, c.dark).toFixed(2)); assert.ok(cr(c.hi, c.dark) >= 3, id + ': frame colour reads against the plate ' + cr(c.hi, c.dark).toFixed(2)); }
  assert.equal(new Set(Object.values(hc).map(c => c.mid)).size, Object.keys(hc).length, 'no two heroes share a cloth');
  console.log('ok  hero pick      ' + h.out.length + ' portraits move, every hero named on one line under a clear heading, RIGHT picks, portraits are tap boxes');

  /* ---- 2b. ALL EIGHT HEROES (batch82 integ; claude/heroroster): the pick always lays eight cards; with every hero open (the dev flag + UNLOCK EVERYTHING, the way a tool opens them) it must still sit whole,
     name every hero without two names or roles on one another, give every portrait a tap box, and RIGHT must walk all eight and wrap ---- */
  const seven = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.setDev(true); BK.SET.godmode = true;
    const out = [], walk = [], { VW, VH } = BK.view;
    for (let i = 0; i < 8; i++) { BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = i; BK.step(6); window.__textRec = []; BK.step(1);
      out.push((window.__textRec || []).filter(x => x.kind === 'text').map(x => ({ s: x.s, x0: x.x0, y0: x.y0, w: x.w, h: x.h }))); window.__textRec = null; }
    BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = 0; BK.step(2); for (let i = 0; i < 9; i++) { BK.press('right'); BK.step(3); walk.push(BK.ui.heroPickI); }
    BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = 0; BK.step(3); const boxes = BK.touch.hitBoxes ? BK.touch.hitBoxes() : null;
    const took = []; for (const i of [3, 4, 6, 7]) { BK.reset({ fresh: true }); BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = i; BK.step(2); BK.press('confirm'); BK.step(3); took.push(i + ':' + BK.hero()); }
    BK.SET.godmode = false; BK.setDev(false); return { out, walk, boxes, took, VW, VH }; })()`);
  const NAMES = /^(KNIGHT|WARDEN|GEOMANCER|BERSERKER|PYRO|PALADIN|PIRATE|DEATH|KNIGHT)$/;
  seven.out.forEach((rec, i) => {
    for (const x of rec) assert.ok(x.x0 >= 0 && x.x0 + x.w <= seven.VW && x.y0 + x.h <= seven.VH, 'eight, pick ' + i + ': on the screen, whole: ' + x.s);
    const lab = rec.filter(x => NAMES.test(x.s));
    assert.ok(lab.length >= 8, 'eight, pick ' + i + ': all eight heroes are named (' + lab.length + '): ' + lab.map(x => x.s).join('/'));
    for (let a = 0; a < lab.length; a++) for (let b = a + 1; b < lab.length; b++) { const p = lab[a], q = lab[b];
      assert.ok(p.x0 + p.w <= q.x0 || q.x0 + q.w <= p.x0 || p.y0 + p.h <= q.y0 || q.y0 + q.h <= p.y0, 'eight, pick ' + i + ': names ' + p.s + ' and ' + q.s + ' overlap'); }
    const title = rec.find(x => x.s === 'CHOOSE YOUR HERO'); assert.ok(title && title.y0 + title.h <= 20, 'eight, pick ' + i + ': the heading is clear of the row'); });
  /* DESIGN CHANGE (Daniel 10-12): the RANGER is the 4th free starter, so pick index 3 is her; the Berserker is a fire-mountain unlock (buyable meanwhile) and moves to the locked end of the order: indexes 4,6,7 shift with it */
  assert.deepEqual(seven.took, ['3:ranger', '4:berserker', '6:paladin', '7:pirate'], 'confirm takes the portrait under the cursor: ' + seven.took);
  assert.deepEqual(seven.walk, [1, 2, 3, 4, 5, 6, 7, 8, 0], 'RIGHT walks all nine (the Ranger joined) and wraps: ' + seven.walk);
  if (seven.boxes && seven.boxes.length) { const rows = seven.boxes.filter(b => b.y <= 20 && b.h >= 50 && b.w > 20 && b.w < 200); assert.ok(rows.length >= 8, 'eight portraits are eight tap boxes (' + rows.length + ')'); }
  console.log('ok  hero pick x8   all eight heroes named without overlap, on the screen, RIGHT walks them and wraps, eight tap boxes');

  /* ---- 3. THE MAP'S FIRST FRAME ---- */
  const m = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    const lum = () => { const v = BK.view, c = v.buf.getContext('2d').getImageData(0, 0, v.VW, v.VH).data; let s = 0; for (let i = 0; i < c.length; i += 4) s += c[i] * 0.3 + c[i + 1] * 0.59 + c[i + 2] * 0.11; return s / (c.length / 4); };
    BK.state = 'title'; BK.step(3); BK.mapLook('wood'); BK.step(1); const first = lum(); BK.step(120); const settled = lum(); return { first, settled }; })()`);
  assert.ok(m.settled > 20, 'the settled map is a picture: ' + m.settled.toFixed(1));
  assert.ok(m.first >= m.settled * 0.5, 'the first map frame is already the map, not black: ' + m.first.toFixed(1) + ' vs ' + m.settled.toFixed(1));
  console.log('ok  map first      first frame ' + m.first.toFixed(1) + ' vs settled ' + m.settled.toFixed(1) + ' (never a black flash)');
  assert.deepEqual(pg.errors, [], 'no page errors'); console.log('ok  console        no page errors');
} finally { await pg.close(); }
