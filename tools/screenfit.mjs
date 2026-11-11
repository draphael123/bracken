// tools/screenfit.mjs - SCREEN FIT (SHARP / FILL) and RESOLUTION (claude/screenfit, Daniel 11-08). Node only, no browser.
//   1. SHARP is the old maths exactly (floor, >= 1, capped by Pixel scale); FILL is the exact float and fills the height or the width, 16:9 kept, centred
//   2. the drawn rect is whole canvas pixels and centred; the hit mapping inverts the draw for a float S (round trip within 1e-9)
//   3. RESOLUTION: the factor fits inside the chosen size, never above 1, keeps the aspect; NATIVE is exactly 1
//   4. SET defaults are SHARP / NATIVE, an old save (no keys) and garbage load to them, the rows are in PICTURE and in the tabs check's list
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as SF from '../src/screenfit.js';
import { TAB_ITEMS, tabOf } from '../src/settings-ui.js';
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

/* 1. the scale */
const oldS = (w, h, VW, VH, cap) => { let S = Math.max(1, Math.floor(Math.min(w / VW, h / VH))); if (cap !== 'auto') S = Math.min(S, cap); return S; };
for (const [w, h] of [[1280, 720], [1920, 1080], [3440, 1440], [2560, 1080], [800, 450], [300, 100], [3840, 2160], [1000, 1000]]) for (const [VW, VH] of [[320, 180], [640, 360], [400, 225]]) for (const cap of ['auto', 2, 3, 4])
  assert.equal(SF.pictureScale(w, h, VW, VH, 'sharp', cap), oldS(w, h, VW, VH, cap), `SHARP is the old maths at ${w}x${h} view ${VW}x${VH} cap ${cap}`);
assert.equal(SF.pictureScale(3440, 1440, 320, 180, 'sharp'), 8);
assert.equal(SF.pictureScale(3440, 1440, 320, 180, 'fill'), 8);   /* 1440/180 = 8 exactly: height-bound */
assert.equal(SF.pictureScale(3440, 1440, 320, 180, 'fill', 3), 8, 'FILL ignores the Pixel scale cap');
assert.equal(SF.pictureScale(2560, 1080, 320, 180, 'fill'), 6);
assert.equal(SF.pictureScale(1366, 768, 320, 180, 'sharp'), 4); assert.ok(Math.abs(SF.pictureScale(1366, 768, 320, 180, 'fill') - 4.26666) < 1e-3);
assert.ok(SF.pictureScale(1000, 1000, 320, 180, 'fill') - 3.125 < 1e-9, 'width-bound when the window is squarer than 16:9');
for (const [w, h] of [[3440, 1440], [1366, 768], [1000, 1000], [1920, 1200], [2560, 1080]]) {
  const S = SF.pictureScale(w, h, 320, 180, 'fill'), r = SF.pictureRect(w, h, 320, 180, S);
  assert(r.dw <= w && r.dh <= h, 'the picture fits'); assert(r.dw === w || r.dh === h || Math.abs(r.dw - w) <= 1 || Math.abs(r.dh - h) <= 1, `FILL touches an edge at ${w}x${h}`);
  assert(Math.abs(r.dw / r.dh - 16 / 9) < 0.02, '16:9 kept'); assert(r.offX >= 0 && r.offY >= 0 && Math.abs((w - r.dw) / 2 - r.offX) <= 0.5 && Math.abs((h - r.dh) / 2 - r.offY) <= 0.5, 'centred');
  assert(Number.isInteger(r.dw) && Number.isInteger(r.dh) && Number.isInteger(r.offX), 'whole canvas pixels');
  /* 2. the hit mapping: the picture's corners and centre map to the game's, with a float S */
  const [x0, y0] = SF.toGamePx(r.offX, r.offY, S, r.offX, r.offY), [x1, y1] = SF.toGamePx(r.offX + 320 * S, r.offY + 180 * S, S, r.offX, r.offY), [cx, cy] = SF.toGamePx(w / 2, h / 2, S, r.offX, r.offY);
  assert.deepEqual([x0, y0], [0, 0]); assert(Math.abs(x1 - 320) < 1e-9 && Math.abs(y1 - 180) < 1e-9); assert(Math.abs(cx - 160) <= 1 / S + 0.5 && Math.abs(cy - 90) <= 1 / S + 0.5, 'centre is the middle of the game');
}
assert.equal(SF.wholeScale(4.26), 4); assert.equal(SF.wholeScale(0.2), 1); assert.equal(SF.wholeScale(4.6), 5);
/* SHARP rect is the old rect exactly */
{ const S = 3, r = SF.pictureRect(1280, 720, 320, 180, S); assert.deepEqual(r, { dw: 960, dh: 540, offX: Math.floor((1280 - 960) / 2), offY: Math.floor((720 - 540) / 2) }); }

/* 3. resolution */
assert.equal(SF.resFactor('native', 3440, 1440), 1); assert.equal(SF.resFactor(undefined, 3440, 1440), 1);
assert.equal(SF.resFactor('1920x1080', 1280, 720), 1, 'never larger than native');
assert.equal(SF.resFactor('1920x1080', 3840, 2160), 0.5);
{ const f = SF.resFactor('1280x720', 3440, 1440); assert.ok(f < 1); const bw = Math.round(3440 * f), bh = Math.round(1440 * f); assert(bw <= 1280 && bh <= 720, 'backing fits inside the resolution'); assert(Math.abs(bw / bh - 3440 / 1440) < 0.01, 'window aspect kept'); }
{ const f = SF.resFactor('2560x1440', 2560 * 2, 1440 * 2); assert.equal(f, 0.5); }
for (const r of SF.RESES) { const f = SF.resFactor(r, 5000, 3000); assert(f > 0 && f <= 1); }
/* it composes with FILL: the picture still fills the (smaller) backing canvas's height/width */
{ const f = SF.resFactor('1280x720', 3440, 1440), bw = Math.round(3440 * f), bh = Math.round(1440 * f), S = SF.pictureScale(bw, bh, 320, 180, 'fill'); assert(Math.abs(S - bh / 180) < 1e-9); }

/* 4. defaults, migration, rows */
assert.equal(SF.cleanFit(undefined), 'sharp'); assert.equal(SF.cleanFit('nonsense'), 'sharp'); assert.equal(SF.cleanFit('fill'), 'fill');
assert.equal(SF.cleanRes(undefined), 'native'); assert.equal(SF.cleanRes('640x480'), 'native'); assert.equal(SF.cleanRes('1600x900'), '1600x900');
assert.deepEqual(SF.RESES, ['native', '1280x720', '1600x900', '1920x1080', '2560x1440', '3840x2160']);
assert.equal(SF.cycle(SF.FITS, 'sharp', 1), 'fill'); assert.equal(SF.cycle(SF.FITS, 'fill', 1), 'sharp'); assert.equal(SF.cycle(SF.RESES, 'native', -1), '3840x2160'); assert.equal(SF.cycle(SF.RESES, '3840x2160', 1), 'native');
const main = src('src/main.js');
assert(/scale: 'auto', fit: 'sharp', res: 'native',/.test(main), 'SET defaults: fit sharp, res native');
assert(main.includes('SET.fit = SF.cleanFit(SET.fit); SET.res = SF.cleanRes(SET.res);'), 'readSettings cleans both keys (an old save has neither)');
assert(!/VW \* S, VH \* S/.test(main), 'no draw still sizes the picture VW*S (use PW/PH, the rounded size)');
assert(main.includes('if (!lowRes()) DPR *= SF.resFactor'), 'the phone half-res path wins: RESOLUTION is skipped when lowRes()');
for (const k of ['Screen fit', 'Resolution', 'Pixel scale']) assert.equal(tabOf(k), 'display', k + ' is on DISPLAY');
{ const d = TAB_ITEMS.display, p = d.indexOf('- PICTURE -'), n = d.indexOf('- LOOK -'); for (const k of ['Screen fit', 'Resolution']) { const i = d.indexOf(k); assert(i > p && i < n, k + ' is in PICTURE'); } }
assert(/'Screen fit': '/.test(main) && /'Resolution': '/.test(main), 'both rows have a tooltip line');
assert(src('docs/updates.json').includes('New in Settings > Picture: Screen fit (Sharp/Fill) and Resolution.'), 'the What\'s New line');
assert(src('src/touch.js').includes('Math.round(gm.S * 100)'), 'touch.js layout key survives a float S');
console.log('screenfit: ok');
