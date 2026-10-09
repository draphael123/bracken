/* tools/lit-church-aloft.mjs - NOTHING IN THE LIT CHURCH HANGS IN THE AIR, and the art is the level's own (claude/churchart; the same idea as ksar-aloft / underwell-aloft). NODE only, no page.
     A  THE KIT COVERS THE GROUND       every solid, one-way and spike cell gets a tile of the church's own kit (src/redraw/church_tiles.js); the kit has its own materials
     B  EVERY PROP STANDS ON A TOP      each dressing item (headstone, cross, bones, coffin, sarcophagus, font, confessional, banner, candle rack) stands on a SOLID or ONEWAY tile with air over it, not on an ent
     C  EVERY LIGHT IS HELD             a candle rack stands on a top; a chandelier hangs from a solid within 16 rows; the rule's lamps / fires / bellows / desks stand on a top
     D  THE LANDMARKS                   the rose windows and the lancets overlap no solid cell; the backdrop draws at six camera stops
     E  LIGHT SPACING                   every 100 columns of the church (56-240) hold at least 2 lights (lamps, fires, dressing candles)
     F  THE SET PAINTS THE WHOLE LEVEL  drawBackdrop and paintWorld and every rule piece run over every screen in Node without an exception, rooms lit and dark
     G  THE CAST                        the six skins bake with the base's frame count; THE PALADIN's rig glides through every mode (no pose number jumps) and every pose bakes
   Run: node tools/lit-church-aloft.mjs */
import { install, newCanvas } from './node-canvas.mjs';
install();
const { LEVELS, T } = await import('../src/level.js');
const KT = await import('../src/redraw/church_tiles.js');
const SET = await import('../src/redraw/church_set.js');
const L = LEVELS.find(l => l.id === 'church').build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const standable = (x, y) => at(x, y) === T.SOLID || at(x, y) === T.ONEWAY;
const PL = SET.plan(L, T);
/* A */
{ let n = 0; const bad = [];
  for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) { const t = at(x, y); if (t !== T.SOLID && t !== T.ONEWAY && t !== T.SPIKE) continue; n++; if (!KT.churchTile(t, x, y, at, T, L)) bad.push(x + ',' + y); }
  ok(n > 0 && bad.length === 0, n + ' solid / one-way / spike cells, every one in the church kit' + (bad.length ? ': NO TILE at ' + bad.slice(0, 6).join(' ') : ''));
  const kinds = new Set(); for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) if (at(x, y) === T.SOLID) kinds.add(KT.matOf(x, y)); ok(['ash', 'crypt', 'marble', 'earth'].every(k => kinds.has(k)), 'the kit has its own materials: ' + [...kinds].join(', ')); }
/* B */
{ const bad = [], ents = L.ents.filter(e => e.t !== 'check' && e.t !== 'coin');
  for (const d of PL.dress) { const under = at(d.x, d.y + 1); if (!(under === T.SOLID || under === T.ONEWAY) || at(d.x, d.y) !== T.AIR) bad.push(d.k + '@' + d.x + ',' + d.y + ' not on a top'); if (ents.some(e => e.x === d.x && e.y === d.y)) bad.push(d.k + '@' + d.x + ',' + d.y + ' on an ent'); }
  const kinds = [...new Set(PL.dress.map(d => d.k))]; ok(PL.dress.length >= 15 && bad.length === 0, PL.dress.length + ' dressing items (' + kinds.join(', ') + '), every one on a top, none on an ent' + (bad.length ? ': ' + bad.slice(0, 5).join('; ') : '')); }
/* C */
{ const bad = [];
  for (const l of PL.lights) { if (l.kind === 'rack') { if (!standable(l.x, l.row + 1) || at(l.x, l.row) !== T.AIR) bad.push('rack@' + l.x + ',' + l.row); }
    else if (l.kind === 'chandelier') { let held = false; for (let y = l.row; y >= Math.max(0, l.row - 16); y--) if (at(l.x, y) === T.SOLID) held = true; if (!held) bad.push('chandelier@' + l.x + ',' + l.row + ' hangs from nothing'); }
    else if (l.kind === 'sconce') { if (at(l.x, l.row) !== T.AIR) bad.push('sconce@' + l.x + ',' + l.row + ' inside a solid'); }
    else if (l.kind === 'grave') { if (!standable(l.x, l.row + 1)) bad.push('grave candle@' + l.x); } }
  for (const l of L.lamps) { if (l.kind === 'sconce' || l.kind === 'rood' || l.kind === 'seal') continue; if (!standable(l.x, l.y + 1)) bad.push('lamp ' + l.id + '@' + l.x + ',' + l.y); }
  for (const s of L.sources) if (!standable(s.x, s.y + 1)) bad.push('fire ' + s.id); for (const b of L.bellows) if (!standable(b.x, b.y + 1)) bad.push('bellows ' + b.id); for (const d of L.desks) if (!standable(d.x, d.y + 1)) bad.push('desk ' + d.id);
  ok(bad.length === 0, PL.lights.length + ' dressing lights, ' + L.lamps.length + ' lamps, ' + L.sources.length + ' fires, ' + L.bellows.length + ' bellows and the key desk all stand on a top or hang from a ceiling' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : '')); }
/* D */
{ const bad = []; const wins = [[78, 22, 3, 9], [98, 22, 3, 9], [118, 22, 3, 9], [138, 22, 3, 9], [169, 21, 3, 7], [190, 23, 3, 9], [222, 23, 3, 9]];
  for (const [x, y, w, h] of wins) for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (at(xx, yy) === T.SOLID) bad.push('window ' + x + ',' + y + ' overlaps solid ' + xx + ',' + yy);
  for (const [x, y, r] of [[164, 24, 20], [208, 27, 22], [261, 28, 40]]) { for (let yy = Math.floor((y * 16 - r) / 16); yy <= Math.floor((y * 16 + r) / 16); yy++) for (let xx = Math.floor((x * 16 - r) / 16); xx <= Math.floor((x * 16 + r) / 16); xx++) if (at(xx, yy) === T.SOLID && Math.hypot(xx * 16 + 8 - x * 16, yy * 16 + 8 - y * 16) < r - 4) bad.push('rose ' + x + ',' + y + ' overlaps solid ' + xx + ',' + yy); }
  ok(bad.length === 0, 'the lancets and the three rose windows (north transept, south transept, over the sanctuary altar) sit in air' + (bad.length ? ': ' + bad.slice(0, 5).join('; ') : ''));
  const c = newCanvas(320, 180), g = c.getContext('2d'); const er = []; for (const cx of [100, 600, 1500, 2400, 3200, 4000]) { try { SET.drawBackdrop({ g, cx, cy: 100, vw: 320, vh: 180, time: 1, L, T, noGlow: true, lit: () => true }); } catch (e) { er.push(cx + ': ' + e.message); } }
  ok(er.length === 0, 'the backdrop (sky and spire, far walls, windows, roses, pillars, organ, tower, crypt, sanctuary) draws at six camera stops' + (er.length ? ': ' + er.join('; ') : '')); }
/* E */
{ const bad = []; const all = [...PL.lights.filter(l => !l.yard).map(l => l.x), ...L.lamps.map(l => l.x), ...L.sources.map(s => s.x)];
  for (let x0 = 56; x0 + 100 <= 241; x0 += 46) { const n = all.filter(x => x >= x0 && x < x0 + 100).length; if (n < 2) bad.push(x0 + '-' + (x0 + 99) + ': ' + n); }
  ok(bad.length === 0, 'every 100 columns of the church hold 2 or more lights' + (bad.length ? ': ' + bad.join('; ') : '')); }
/* F */
{ const errs = []; const c = newCanvas(320, 180), g = c.getContext('2d');
  for (const lit of [true, false]) for (let x = 0; x < L.W * 16 - 320; x += 192) for (const y of [0, 240, 480, 700]) { const V = { g, cx: x, cy: y, vw: 320, vh: 180, time: x / 100, L, T, noGlow: true, lit: () => lit, glow: lit ? 1 : 0, stubs: 3, paladinLight: lit ? 1 : 0 };
    try { SET.drawBackdrop(V); SET.paintWorld(V, PL); for (const l of L.lamps) SET.drawLamp(V, { ...l, lit }); for (const s of L.sources) SET.drawSource(V, s); for (const b of L.bellows) SET.drawBellows(V, { ...b, air: lit ? 1 : 0 }); for (const d of L.desks) SET.drawDesk(V, { ...d, tell: lit ? 1 : 0, on: 0 }); for (const q of L.grates) SET.drawGrate(V, { ...q, glow: lit ? 1 : 0 }); for (const d of L.doors) SET.drawDoor(V, d); } catch (e) { errs.push('x=' + x + ',y=' + y + ': ' + e.stack.split('\n').slice(0, 2).join(' ')); break; } }
  ok(errs.length === 0, 'the whole set paints every screen of the level, lit and dark, in Node without an exception' + (errs.length ? ': ' + errs[0] : '')); }
/* G */
{ const C = await import('../src/chars.js'), M = await import('../src/redraw/mystic_art.js'), ART = await import('../src/redraw/church_art.js'), PA = await import('../src/redraw/paladin_art.js');
  const SPR = { banditmystic: M.bakeBanditMystic(), runner: C.bakeRunner(), swornsword: C.bakeSwornSword(), hedgeknight: C.bakeHedgeKnight(), crossbow: C.bakeCrossbowman() }, S = ART.bakeChurchSkins(SPR);
  const want = { priest: 'banditmystic', archdeacon: 'banditmystic', acolyte: 'runner', chapelknight: 'swornsword', templar: 'hedgeknight', chapelbow: 'crossbow' };
  ok(Object.entries(want).every(([k, b]) => S[k] && S[k].R.length === SPR[b].R.length && S[k].ax === SPR[b].ax && S[k].w === SPR[b].w), 'the six skins bake with their base machine\'s frame count, anchor and box');
  const modes = ['sleep', 'wake', 'walk', 'kindleWalk', 'recover', 'chainTell', 'chainBeatTell', 'chain', 'bashTell', 'bash', 'mendTell', 'kindleTell', 'radTell', 'rad', 'leapTell', 'leap', 'land', 'reel', 'falter'];
  const p = PA.newPose(); let worst = 0; const bad = []; let prev = { ...p };
  for (const m of modes.concat(modes)) for (let i = 0; i < 40; i++) { PA.stepPose(p, m, 1 / 60, 0); for (const k of ['crouch', 'lean', 'hamA', 'shReach', 'kneel']) { const d = Math.abs(p[k] - prev[k]); if (d > worst) worst = d; if (d > (k === 'hamA' ? 52 : 8)) bad.push(m + ' ' + k + ' ' + d.toFixed(1)); } prev = { ...p }; if (i % 20 === 0) PA.bakeFigure(p, { light: 0.6 }); }
  ok(bad.length === 0, 'THE PALADIN\'s rig glides through all ' + modes.length + ' modes (no pose number jumps more than 8 px or 52 degrees in a frame; worst step ' + worst.toFixed(1) + ') and every pose bakes' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : '')); }
console.log(fails ? fails + ' FAILED' : 'ok  lit-church-aloft  the church stands on its own kit and nothing hangs in the air');
process.exit(fails ? 1 : 0);
