// tools/desert-art.mjs — THE SUNKEN CARAVAN's art, rendered in Node (tools/node-canvas.mjs): a composed scene at the game's
// 320x180 buffer (sky, far mesas, mid dunes, sand and rock slopes, quicksand, a sandfall, the props), then a contact sheet of
// every baked canvas and animation frame. usage: node tools/desert-art.mjs [out.png]   (default docs/desert-art.png)
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const D = await import('../src/redraw/desert.js'), S = await import('../src/redraw/slopes.js'), { SLOPE } = await import('../src/slopes.js');
const sky = D.bakeDesertSky(180), far = D.bakeFarMesas(320, 70), mid = D.bakeMidDunes(480, 80);
const sand = S.bakeSandSlopes(), rock = D.bakeRockSlopes(), qs = D.bakeQuicksand(), sf = D.bakeSandfall();
const wagon = [D.bakeWagonWreck(0), D.bakeWagonWreck(1)], awn = [D.bakeAwning(0), D.bakeAwning(1)], bones = D.bakeBones(), cargo = D.bakeCargo();
const scrub = [D.bakeScrub(0), D.bakeScrub(1)], tree = D.bakeDeadTree(), std = D.bakeStandard();

// ---- the scene: 20 columns x 11 rows of tiles on a 320x180 buffer ----
const W = 320, H = 180, scene = newCanvas(W, H), g = scene.getContext('2d');
for (let x = 0; x < W; x += 16) g.drawImage(sky, x, 0);
g.drawImage(far, -40, 58); g.drawImage(far, 280, 58);
g.drawImage(mid, -120, 96);
// ground: a list of columns: [kind, rowOfTile] where kind is 'top' | slope id | 'qs' (quicksand) | 'rock' (a rock ledge top)
const base = 9, cols = [['top', 9], ['top', 9], ['qs', 9], ['qs', 9], ['top', 9], [SLOPE.R2A, 8], [SLOPE.R2B, 8], [SLOPE.R1, 7], ['top', 7], ['top', 7], ['top', 7], [SLOPE.L1, 7], [SLOPE.L2B, 8], [SLOPE.L2A, 8], ['top', 9], ['rock', 5], ['rock', 5], ['rock', 5], ['rockR1', 4], ['rock', 4]];
cols.forEach(([k, r], i) => { const x = i * 16, v = i % 3;
  if (k === 'top') { g.drawImage(sand.top[v], x, r * 16); for (let y = r + 1; y < 12; y++) g.drawImage(sand.fill[(i + y) % 3], x, y * 16); }
  else if (k === 'qs') { g.drawImage(qs[i % 4], x, r * 16); for (let y = r + 1; y < 12; y++) g.drawImage(sand.fill[(i + y) % 3], x, y * 16); }
  else if (k === 'rock' || k === 'rockR1') { const t = k === 'rock' ? rock.top[v] : rock[SLOPE.R1][v]; g.drawImage(t, x, r * 16); for (let y = r + 1; y < 12; y++) g.drawImage(y === r + 1 && k === 'rockR1' ? rock.under[SLOPE.R1][v] : rock.fill[(i + y) % 3], x, y * 16); }
  else { g.drawImage(sand[k][v], x, r * 16); g.drawImage(sand.under[k][v], x, (r + 1) * 16); for (let y = r + 2; y < 12; y++) g.drawImage(sand.fill[(i + y) % 3], x, y * 16); } });
// the sandfall off the rock ledge's lip, down to the floor, and its foot
for (let y = 5 * 16; y < 9 * 16; y += 16) g.drawImage(sf.fall[1], 14 * 16 + 4, y); g.drawImage(sf.foot[1], 14 * 16, 9 * 16 - 8);
// props, bottoms on their ground
const put = (c, cx, groundY) => g.drawImage(c, Math.round(cx - c.width / 2), groundY - c.height);
put(std, 12, 9 * 16 + 2); put(bones.skull, 70, 9 * 16 + 2); put(awn[0], 140, 7 * 16 + 1); put(cargo.amphora, 128, 7 * 16); put(cargo.sack, 160, 7 * 16);
put(wagon[0], 40, 9 * 16 + 6); put(scrub[0], 92, 8 * 16 + 9); put(tree, 300, 4 * 16); put(cargo.chest, 272, 5 * 16);

// ---- the contact sheet ----
const frames = [...Object.values(SLOPE).flatMap(k => [sand[k][0], rock[k][0]]), sand.top[0], rock.top[0], sand.fill[0], rock.fill[0], ...qs, ...sf.fall, ...sf.foot,
  ...wagon, ...awn, bones.skull, bones.ribs, bones.horn, ...Object.values(cargo), ...scrub, tree, std, far, mid];
const sh = sheet(frames, { maxW: 320, bg: '#6fa3cf' });
const out = newCanvas(W, H + sh.height), o = out.getContext('2d'); o.drawImage(scene, 0, 0); o.drawImage(sh, 0, H);
const big = newCanvas(out.width * 3, out.height * 3); big.getContext('2d').drawImage(out, 0, 0, big.width, big.height);
savePNG(big, process.argv[2] || new URL('../docs/desert-art.png', import.meta.url));
console.log('desert-art: scene 320x180 + sheet of', frames.length, 'canvases, x3');
