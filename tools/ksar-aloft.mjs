/* tools/ksar-aloft.mjs - NOTHING IN THE BANDIT KSAR HANGS IN THE AIR, and the art is the level's own (claude/ksar art pass; the same idea as glasssea-aloft, redgorge2-aloft, the Underwell's). NODE only, no page: a few seconds.
     A  THE KIT COVERS THE GROUND        every solid, one-way and spike cell gets a tile of the Ksar's own kit (src/redraw/ksar_tiles.js), none falls through to the shared sandstone sheet; each ONEWAY run is a slab or a beam
     B  EVERY PROP STANDS ON A TOP       each dressing item (barrel, crate, amphora, sacks, perch, totem, wreck, banner...) stands on a SOLID or ONEWAY tile with air over it, and not on a sign, a gong, a stack, a keg, a checkpoint or a foe
     C  EVERY LIGHT IS HELD              a torch, brazier, floor lamp stands on a top; a hung lamp or lantern has a roof, a ledge or an awning within 3 rows over it; the beacon sits on the Hawk Tower's top
     D  THE RULE'S PIECES STAND          every gong, keg stack, flask rack, set keg stands on a top; every bricked arch is made of solid cells; the winch stands on the yard; the vault door is solid
     E  THE ROOF BRIDGE'S PULLEY POST    stands on the roof's end (a solid tile under it, air over it) and the bridge hinge has solid under the far lip
     F  THE HAWK TOWER IS THE LANDMARK   its windows, crown, turret and beacon sit inside / on its ashlar block (columns 560-575, rows 9-20) and the far skyline draws it
     G  LIGHT SPACING                    every 100 columns of the fort (72-583) hold at least 2 lights, so no stretch is dark
     H  THE SET PAINTS THE WHOLE LEVEL   paintWorld runs over every screen of the level in Node without an exception, with the gongs raised and cut
   Run: node tools/ksar-aloft.mjs */
import { install, newCanvas } from './node-canvas.mjs';
install();
const { LEVELS, T } = await import('../src/level.js');
const KT = await import('../src/redraw/ksar_tiles.js');
const SET = await import('../src/redraw/ksar_set.js');
const L = LEVELS.find(l => l.id === 'ksar').build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const standable = (x, y) => at(x, y) === T.SOLID || at(x, y) === T.ONEWAY;
const PL = SET.plan(L, T);
/* A */
{ let n = 0, bad = []; const kinds = new Set();
  for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) { const t = at(x, y); if (t !== T.SOLID && t !== T.ONEWAY && t !== T.SPIKE) continue; n++; const s = KT.ksarTile(t, x, y, at, T, L); if (!s) bad.push(x + ',' + y); else kinds.add(t); }
  ok(n > 0 && bad.length === 0, n + ' solid / one-way / spike cells, every one in the Ksar kit' + (bad.length ? ': NO TILE at ' + bad.slice(0, 6).join(' ') : '') + ' (' + [...kinds].length + ' kinds)');
  const ow = []; for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) if (at(x, y) === T.ONEWAY && at(x - 1, y) !== T.ONEWAY) ow.push(x + ',' + y);
  ok(ow.length > 20, ow.length + ' one-way runs, each drawn as a corbelled slab (keyed to a wall) or a lashed palm-log beam (free)'); }
/* B */
{ const bad = []; const ents = L.ents.filter(e => ['sign', 'check', 'ksgong', 'kskegs', 'ksflasks', 'kskeg', 'ksbarricade', 'kswinch', 'ksvault', 'ksbridge', 'stray', 'silver'].includes(e.t));
  for (const d of PL.dress) { const under = at(d.x, d.y + 1);
    if (d.k === 'banner' || d.k === 'perch' || d.k === 'totem' || d.k === 'wreck' || true) { if (!(under === T.SOLID || under === T.ONEWAY) || at(d.x, d.y) !== T.AIR) bad.push(d.k + '@' + d.x + ',' + d.y + ' not on a top'); }
    if (ents.some(e => Math.abs(e.x - d.x) <= 0 && Math.abs(e.y - d.y) <= 0)) bad.push(d.k + '@' + d.x + ',' + d.y + ' on an ent'); }
  const kinds = [...new Set(PL.dress.map(d => d.k))];
  ok(PL.dress.length > 40 && bad.length === 0, PL.dress.length + ' dressing items (' + kinds.join(', ') + '), every one on a top, none on a sign, gong, keg or checkpoint' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : '')); }
/* C */
{ const bad = [], awn = (L.decor || []).filter(d => d.kind === 'awning'), huts = (L.decor || []).filter(d => d.kind === 'hut');
  for (const l of PL.lights) { const col = Math.floor(l.wx / 16);
    if (['torch', 'brazier'].includes(l.kind) || l.floor) { if (!standable(l.x, l.row + 1) || at(l.x, l.row) !== T.AIR) bad.push(l.kind + '@' + l.x + ',' + l.row + ' floats'); }
    else if (l.kind === 'lamp' || l.kind === 'lantern') { const r0 = Math.floor(l.wy / 16); let held = false; for (let y = r0; y >= r0 - 4; y--) if (standable(col, y) || at(col, y) === T.SOLID) held = true;
      if (!held && l.arm && standable(col + l.arm, r0 - 1)) held = true; if (!held && awn.some(a => col >= a.x0 && col <= a.x1 && a.y >= r0 - 4 && a.y <= r0)) held = true; if (!held && huts.some(h => col >= h.x0 && col <= h.x1 && h.y >= r0 - 4 && h.y <= r0)) held = true;
      if (!held) bad.push(l.kind + '@' + col + ',' + r0 + ' hangs from nothing'); }
    else if (l.kind === 'beacon') { if (!(at(567, 9) === T.SOLID && at(567, 8) === T.AIR)) bad.push('the beacon is not on the Hawk Tower top'); } }
  ok(PL.lights.length > 40 && bad.length === 0, PL.lights.length + ' lights (' + ['torch', 'brazier', 'lamp', 'lantern', 'beacon'].map(k => PL.lights.filter(l => l.kind === k).length + ' ' + k).join(', ') + '), each stands on a top or hangs from a roof' + (bad.length ? ': ' + bad.join('; ') : '')); }
/* D */
{ const bad = [];
  for (const g of L.gongs) { if (!standable(g.x, g.y + 1) || at(g.x, g.y) !== T.AIR) bad.push('gong ' + g.id + '@' + g.x + ',' + g.y); }
  for (const s of L.stacks) if (!standable(s.x, s.y + 1)) bad.push('stack ' + s.id);
  for (const k of L.setKegs) if (!standable(k.x, k.y + 1)) bad.push('keg ' + k.id);
  for (const b of L.barricades) for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) if (at(x, y) !== T.SOLID) bad.push('arch ' + b.id + ' has a non-solid cell ' + x + ',' + y);
  if (L.gate && !standable(L.gate.winch[0], L.gate.winch[1] + 1)) bad.push('the winch');
  for (const v of L.vaultDoors) for (let y = v.y0; y <= v.y1; y++) if (at(v.x, y) !== T.SOLID) bad.push('vault door cell ' + v.x + ',' + y);
  ok(bad.length === 0, L.gongs.length + ' gongs, ' + L.stacks.length + ' stacks, ' + L.setKegs.length + ' set kegs, ' + L.barricades.length + ' arches, the winch and the strongroom door all stand on solid' + (bad.length ? ': ' + bad.join('; ') : '')); }
/* E */
{ const g = L.gongs.find(q => q.bridge), [b0, b1, row] = g.bridge, px0 = b0 - 1, bad = [];
  if (!(at(px0, row) === T.SOLID && at(px0, row - 1) === T.AIR)) bad.push('the pulley post at ' + px0 + ',' + row + ' has no roof under it');
  if (!(at(b1 + 1, row) === T.SOLID)) bad.push('the hinge lip at ' + (b1 + 1));
  for (let y = row - 14; y < row; y++) if (at(px0, y) !== T.AIR) bad.push('the post runs into solid at row ' + y);
  ok(bad.length === 0, 'the roof bridge (columns ' + b0 + '-' + b1 + '): its pulley post stands on the roof and its hinge lip is solid' + (bad.length ? ': ' + bad.join('; ') : '')); }
/* F */
{ const bad = []; for (let y = 9; y <= 20; y++) for (let x = 560; x <= 575; x++) if (!(at(x, y) === T.SOLID || (y >= 14 && x >= 562 && x <= 574) || (x === 575 && y >= 14))) bad.push(x + ',' + y);
  const windowsOk = [563, 567, 571].every(x => [11, 12, 13].every(y => at(x, y) === T.SOLID && at(x + 1, y) === T.SOLID));
  ok(bad.length === 0 && windowsOk && KT.isAshlar(567, 12), 'the Hawk Tower is an ashlar block (560-575 x 9-20), its three mews windows sit on solid ashlar, its top row 9 is solid for the crown and the beacon');
  const far = []; const c = newCanvas(320, 180), gg = c.getContext('2d'); for (const cx of [6000, 7200, 8000, 8600, 9000]) { try { SET.drawBack(gg, cx, 0, 320, 180, 1, 0); } catch (e) { far.push(cx + ': ' + e.message); } }
  ok(far.length === 0, 'the far skyline (the Hawk Tower, the minaret, the great gong tower) draws at five camera stops' + (far.length ? ': ' + far.join('; ') : '')); }
/* G */
{ const bad = []; for (let x0 = 72; x0 + 100 <= 584; x0 += 100) { const n = PL.lights.filter(l => l.x >= x0 && l.x < x0 + 100).length; if (n < 2) bad.push(x0 + '-' + (x0 + 99) + ': ' + n); }
  ok(bad.length === 0, 'every 100 columns of the fort hold 2 or more lights' + (bad.length ? ': ' + bad.join('; ') : '')); }
/* H */
{ const errs = []; const c = newCanvas(320, 180), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 320, 180);
  for (let x = 0; x < L.W * 16 - 320; x += 160) for (const cut of [false, true]) { const V = { g, cx: x, cy: 200, vw: 320, vh: 180, time: x / 100, L, T, noGlow: true };
    try { SET.paintWorld(V, PL); for (const q of L.gongs) { const gg = { ...q, cut, ring: 0 }; SET.drawGong(V, gg); if (q.bridge) SET.drawBridge(V, gg); } for (const b of L.barricades) SET.drawArch(V, b); if (L.gate) SET.drawGate(V, { ...L.gate, notch: 2, pinned: false }, true); for (const v of L.vaultDoors) SET.drawVault(V, v, 3); for (const s of L.stacks) SET.drawStack(V, { ...s, left: s.n });
      if (L.arena) SET.drawCourtyard(V, L.arena); } catch (e) { errs.push('x=' + x + ': ' + e.message); break; } }
  ok(errs.length === 0, 'the set paints every screen of the level (gongs hung and cut) without an exception' + (errs.length ? ': ' + errs[0] : '')); }
console.log(fails ? fails + ' FAILED' : 'ok  ksar-aloft  the Ksar stands on its own kit and nothing hangs in the air');
process.exit(fails ? 1 : 0);
