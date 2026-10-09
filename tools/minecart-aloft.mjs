/* tools/minecart-aloft.mjs - NOTHING IN THE DEEP RAILS HANGS IN THE AIR, AND IT IS A MINE (claude/minecartart; the same idea as the underwell / unburied / moor lanes' aloft checks).
   The art pass drew trestle bents, lamp posts, lip lamps, crushers, gates, duck beams, the points mast and the drill's chute; each is held by something.
   NODE (no page):
     A  EVERY TRESTLE BENT STANDS ON SOMETHING   from each RAIL deck cell the leg runs down through air to the first solid / ledge (<= 40 rows), or off the bottom of the level: it never ends in the air
     B  EVERY LAMP POST STANDS ON A RAIL BED       src/redraw/minecart_art.js lampPlan(): a SOLID or RAIL cell under it, four cells of air over it, never at a gadget; and its wire runs to a post 6 tiles on that stands too
     C  EVERY LIP LAMP STANDS ON THE LIP           both lamps of each pump gap stand on a solid / rail cell (the last tile before the gap, the first after it), air over them; a LAUNCH
                                                   RAMP's kicker stands on its lip and its pit has a landing (claude/deeprails2)
     D  EVERY GATE, CRUSHER AND POINTS LEVER STANDS ON ITS LINE   a solid / rail cell under the gate's posts, under both of a crusher's ends, under a lever's mast (a HANGING lever hangs under a solid / rail cell)
     E  THE DRILL'S ARENA                          (GREAT DRILL 2: the endless tunnel) a solid roof over it and a solid floor line under it, every lane's cells RAIL over air the whole width
   PAGE (PORT=<yours> node tools/minecart-aloft.mjs --page):
     F  IT IS NOT THE CRAG'S DUSK SKY             stills at eight places along the line: almost no pixel is sky (blue / dusk purple, bright); the picture is dark, warm, with lit lamps
     G  THE LANDMARKS ARE THERE                    the smelter's orange chimney glow reaches the right of the picture from the cave-in on (and not in the yard), the bore's mouth from the exam on
     H  THE KIT IS THE MINE'S                      the ground under the rail is the tile kit's rock (no green grass pixels in a row of ground), and the foreground carries no grass strip
   Run: node tools/minecart-aloft.mjs [--page] */
import { install } from './node-canvas.mjs';
install();
const { LEVELS, T } = await import('../src/level.js');
const { lampPlan } = await import('../src/redraw/minecart_art.js');
const L = LEVELS.find(l => l.id === 'minecart').build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W ? T.SOLID : y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const stands = v => v === T.SOLID || v === T.RAIL || v === T.ONEWAY || (v >= 20 && v <= 25);
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
/* A */
{ const bad = []; let n = 0, floor = 0, bottom = 0;
  for (const [a, b, row] of L.mcTrestles) for (let x = a; x <= b; x += 3) { if (at(x, row) !== T.RAIL) continue; n++; let y = row + 1; while (y < row + 40 && y < L.H && at(x, y) === T.AIR) y++;
    if (y >= L.H) bottom++; else if (stands(at(x, y))) floor++; else bad.push(x + ',' + row + ' ends on ' + at(x, y)); }
  ok(n > 0 && !bad.length, n + ' trestle bents: ' + floor + ' stand on rock, ' + bottom + ' run off the bottom of the level' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : '')); }
/* B */
{ const plan = lampPlan(L, at, T, 0, L.W), bad = [];
  for (const [x, row, nx] of plan) { if (!(at(x, row) === T.SOLID || at(x, row) === T.RAIL)) bad.push('post ' + x + ',' + row + ' on ' + at(x, row)); for (let k = 1; k <= 4; k++) if (at(x, row - k) !== T.AIR) bad.push('post ' + x + ',' + row + ' has ' + at(x, row - k) + ' ' + k + ' over it');
    if (nx && !plan.some(([x2, r2]) => x2 === x + 6 && r2 === row)) bad.push('wire ' + x + ',' + row + ' runs to no post'); }
  ok(plan.length > 40 && !bad.length, plan.length + ' lamp posts, every one on a rail bed with clear air over it' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : '')); }
/* C */
{ const bad = []; for (const g of L.mcBoost) for (const [lx, side] of [[g.x0 - 1, 'lip'], [g.x1 + 1, 'far lip']]) { if (!stands(at(lx, g.row))) bad.push(side + ' ' + lx + ',' + g.row + ' is ' + at(lx, g.row)); if (at(lx, g.row - 1) !== T.AIR) bad.push(side + ' ' + lx + ' has no air over it'); }
  const gaps = L.mcBoost.filter(g => !g.ramp); for (const r of L.mcRamps || []) { if (!stands(at(r.x, r.row)) || at(r.x, r.row - 1) !== T.AIR) bad.push('ramp ' + r.x + ' has no lip'); if (!stands(at(r.x1 + 1, r.row))) bad.push('ramp ' + r.x + ' has no landing'); }
  ok(gaps.length >= 6 && !bad.length, gaps.length + ' pump gaps, both lamps of each on a lip; ' + (L.mcRamps || []).length + ' ramp(s) on a lip with a landing' + (bad.length ? ': ' + bad.join('; ') : '')); }
/* D */
{ const bad = [];
  for (const g of L.mcGates) for (const dx of [-1, 0, 1]) if (!stands(at(g.x + dx, g.row))) bad.push('gate ' + g.id + ' post ' + (g.x + dx) + ' on ' + at(g.x + dx, g.row));
  for (const k of L.mcCrushers) for (const dx of [0, k.w - 1]) if (!stands(at(k.x + dx, k.row))) bad.push('crusher ' + k.id + ' end ' + (k.x + dx) + ' on ' + at(k.x + dx, k.row));
  for (const b of L.mcBeams) for (const dx of [b.x0, b.x1]) if (!stands(at(dx, b.row))) bad.push('beam post ' + dx + ' on ' + at(dx, b.row));
  for (const p of L.mcPoints) { const x = p.x; if (p.hang) { if (!stands(at(x, p.row - 1)) && !stands(at(x, p.row - 2)) && !stands(at(x, p.row - 3))) bad.push('hung lever ' + p.id + ' hangs from ' + at(x, p.row - 1)); } else if (!stands(at(x, p.row)) && !stands(at(x, p.row + 1))) bad.push('lever ' + p.id + ' on ' + at(x, p.row)); }
  ok(!bad.length, L.mcGates.length + ' gates, ' + L.mcCrushers.length + ' crushers, ' + L.mcBeams.length + ' beams, ' + L.mcPoints.length + ' levers, every one stands on its line' + (bad.length ? ': ' + bad.slice(0, 8).join('; ') : '')); }
/* E */
{ const A = L.arena.drill, { DRILL_STAGE: S } = await import('../src/great-drill.js'), bad = [];
  for (let x = A.sx; x < A.sx + S.W; x++) { if (at(x, A.F - S.ceil - 1) !== T.SOLID) bad.push('the roof at ' + x + ' is ' + at(x, A.F - S.ceil - 1)); if (at(x, A.F) !== T.SOLID) bad.push('the floor at ' + x + ' is ' + at(x, A.F)); }
  for (const ln of S.lanes) if (ln) for (let x = A.sx; x < A.sx + S.W; x++) if (at(x, A.F - ln) !== T.RAIL) bad.push('lane ' + ln + ' cell ' + x + ' is ' + at(x, A.F - ln));
  ok(!bad.length, "the drill's arena: a roof over it, a floor under it, the lines laid the whole width (" + S.W + ')' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : '')); }

if (process.argv.includes('--page')) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false });
  try {
    const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const out = [];
      BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
      BK.load(LEVELS.findIndex(l => l.id === 'minecart')); BK.state = 'play'; BK.god = true; BK.sim(60);
      const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
      const rowAt = x => { let best = null; for (const [a, b, row] of BK.L.mcTrack) if (x >= a && x <= b && (best === null || row > best)) best = row; return best; };
      for (const x of [24, 150, 215, 350, 490, 650, 800, 925]) { const rw = rowAt(x); BK.tp(x, rw - 1); BK.minecart().cart(BK.P).v = 0; run(10); BK.look(x, rw - 1);
        const W = BK.view.VW, H = BK.view.VH, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(BK.buf, 0, 0, W, H); const d = g.getImageData(0, 0, W, H).data;
        let sky = 0, lum = 0, warm = 0, green = 0, orangeR = 0, n = 0, rbR = 0, rbN = 0; const rows = Math.floor(H * 0.55);
        for (let y = 0; y < rows; y++) for (let xx = 0; xx < W; xx++) { const i = (y * W + xx) * 4, r = d[i], gg = d[i + 1], b = d[i + 2], l = (r + gg + b) / 3; n++; lum += l; if (b > r + 12 && l > 95) sky++; if (r > b + 20) warm++; if (xx > W * 0.62) { rbR += Math.max(0, r - b); rbN++; } }
        let gr = 0, gn = 0; const gy0 = Math.min(H - 1, Math.round((rw * 16 - BK.view.y) + 6)); for (let y = gy0; y < Math.min(H, gy0 + 30); y++) for (let xx = 0; xx < W; xx++) { const i = (y * W + xx) * 4, r = d[i], gg = d[i + 1], b = d[i + 2]; gn++; if (gg > r + 18 && gg > b + 18 && gg > 70) gr++; }
        out.push({ x, sky: sky / n, lum: lum / n, warm: warm / n, glowR: rbR / rbN, grass: gn ? gr / gn : 0 }); }
      return out; })()`, 600000);
    const by = x => r.find(o => o.x === x);
    ok(r.every(o => o.sky < 0.02), 'F  no dusk sky: ' + r.map(o => o.x + ':' + (o.sky * 100).toFixed(1) + '%').join(' '));
    ok(r.every(o => o.lum < 90 && o.warm > 0.15), 'F  dark and warm at every stop (mean luma <90, warm share >15%): ' + r.map(o => o.x + ':' + Math.round(o.lum) + '/' + Math.round(o.warm * 100)).join(' '));
    ok(by(490).glowR > by(24).glowR + 8 && by(650).glowR > by(24).glowR + 8 && by(925).glowR > by(24).glowR + 8, "G  the smelter's glow warms the right of the frame from the cave-in on (mean red-over-blue): " + [24, 150, 215, 350, 490, 650, 800, 925].map(x => x + ':' + by(x).glowR.toFixed(1)).join(' '));
    ok(r.every(o => o.grass < 0.01), 'H  no grass in the ground or the foreground: ' + r.map(o => o.x + ':' + (o.grass * 100).toFixed(1) + '%').join(' '));
    if (pg.errors.length) { console.log('page errors: ' + pg.errors.slice(0, 3).join(' | ')); fails++; }
  } finally { pg.close(); }
}
console.log(fails ? fails + ' FAILED' : 'ok  minecart-aloft  the Deep Rails hang from nothing' + (process.argv.includes('--page') ? ' and read as a mine' : ''));
process.exit(fails ? 1 : 0);
