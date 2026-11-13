/* tools/bc5-art-lint.mjs - BURIED CITY 5's ART, node-only lint (claude/bc5art, 2026-11-13). No page, no browser, no real canvas: a recording 2d-context stub stands in for the canvas.
     node tools/bc5-art-lint.mjs
   A  THE GLASSBLOWER: every pose the sim can emit has a drawing; every pose draws clean (no NaN rect, no bad colour) facing both ways, in P1 and P2, flashed; every windup differs from its release and
      from idle; every windup CHANGES with its progress (the tell is told over time); the face is there (eye + mouth rects in the head's box); a pose stays in a 100 x 95 box round his feet; mirrors;
      buried / ward / death fall draw and the fall changes over its 2.4 s
   B  THE SAND GRASPER: every pose draws; the boil is a TELL (ripple rings, a mound, a hand, two hands): each step of the boil differs from the last and the picture gains rects; wind (arms up) differs
      from walk, grab from wind, hold from grab; the rise changes over its half second
   C  THE KIT: the race door (shut / half / open, running, warning), the race marker, the hall kilns (3 rows and 2), the hall floor, the gob (flying / hot / cooled / clouding), the blast cone, the shards, the glint
   D  palette discipline: every #rrggbb the art module fills with is one of its PAL literals; no ad-block words in the new filenames
   E  wiring + draw-only: the hands, the flip and the level hands call the art; the sim files (glassblower.js, sand-grasper.js, buried-city5.js) are byte-identical to the branch's base; the hands smoke draws all
      the poses through the real drawFoe; the level pushes the kiln rows and the hall floor as decor only (the grid hash is buried-city5.mjs's) */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const ROOTD = fileURLToPath(new URL('..', import.meta.url));
let n = 0, bad = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('  FAIL ' + m); } };
const URLS = f => new URL('../' + f, import.meta.url);
const COLS = new Map(); let REC = null, BAD = [];
function makeCtx() {
  return { fillStyle: '#000000', strokeStyle: '#000000', globalAlpha: 1, lineWidth: 1, imageSmoothingEnabled: false, globalCompositeOperation: 'source-over',
    fillRect(x, y, w, h) { const c = String(this.fillStyle); COLS.set(c, (COLS.get(c) || 0) + 1); if (![x, y, w, h].every(Number.isFinite)) BAD.push('NaN rect ' + [x, y, w, h] + ' ' + c); if (/undefined|NaN|null/.test(c)) BAD.push('bad colour ' + c);
      if (!Number.isFinite(this.globalAlpha) || this.globalAlpha < 0 || this.globalAlpha > 1) BAD.push('bad alpha ' + this.globalAlpha); if (REC) REC.push([Math.round(x), Math.round(y), w, h, c, this.globalAlpha]); },
    clearRect() {}, drawImage() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, fill() {}, stroke() {}, arc() {}, ellipse() {}, save() {}, restore() {}, setLineDash() {}, getImageData: () => ({ data: new Uint8ClampedArray(4) }) };
}
const rec = fn => { REC = []; BAD = []; const g = makeCtx(); fn(g); const r = REC; REC = null; return r; };
const sig = r => createHash('md5').update(r.map(a => a.join(',')).join(';')).digest('hex').slice(0, 10);
const bbox = r => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y, w, h] of r) { x0 = Math.min(x0, x); x1 = Math.max(x1, x + w); y0 = Math.min(y0, y); y1 = Math.max(y1, y + h); } return { x0, x1, y0, y1 }; };
const A = await import(URLS('src/redraw/buried_city_bc5_art.js').href);
const GBM = await import(URLS('src/glassblower.js').href), SGM = await import(URLS('src/sand-grasper.js').href);
const FX = 0, FY = 0;   /* the feet at the origin */
const gb = (o, f = 1) => rec(g => A.drawGlassblower(g, { x: FX, y: FY, f, t: 0.4, ph: 1, p: 0.8, ...o }));

// ---------- A. THE GLASSBLOWER ----------
{ const sim = new Set(['gbWalk', 'gbIdle', 'gbStagger']); for (const m of Object.values(GBM.MOVES)) for (const p of m.pose) sim.add(p);
  for (const p of sim) ok(A.GB_POSES.includes(p), 'a drawing for the sim pose ' + p);
  const src = readFileSync(URLS('src/glassblower.js'), 'utf8'); for (const m of src.matchAll(/'(gb[A-Z][A-Za-z]+)'/g)) ok(A.GB_POSES.includes(m[1]) || ['gbNotYet', 'gbIntro', 'gbGob', 'gbBlast', 'gbFlip', 'gbBulb', 'gbGlint', 'gbWard', 'gbP2'].includes(m[1]), 'the sim names a pose with no drawing: ' + m[1]);
  const idle = sig(gb({ pose: 'gbIdle' }));
  for (const pose of A.GB_POSES) { if (pose === 'gbDead') continue;
    for (const f of [1, -1]) for (const ph of [1, 2]) for (const flash of [false, true]) { const r = gb({ pose, f, ph, flash, open: pose === 'gbBuried', openK: 0.5 }); ok(r.length > 40 && BAD.length === 0, pose + ' f' + f + ' P' + ph + (flash ? ' flash' : '') + ' draws clean (' + r.length + ' rects) ' + BAD.slice(0, 2)); }
    if (pose !== 'gbIdle') ok(sig(gb({ pose, p: 0.9 })) !== idle, pose + ' is not the idle picture');
    const r = gb({ pose, p: 0.9, openK: 0.5, open: pose === 'gbBuried' }), b = bbox(r); ok(b.x0 >= -50 && b.x1 <= 64 && b.y0 >= -95 && b.y1 <= 8, pose + ' stays in the box round his feet: ' + JSON.stringify(b)); }
  for (const [w, r] of Object.values(GBM.MOVES).map(m => m.pose)) { ok(sig(gb({ pose: w, p: 0.9 })) !== sig(gb({ pose: r })), 'windup ' + w + ' differs from release ' + r);
    const s = new Set([0, 0.3, 0.6, 1].map(p => sig(gb({ pose: w, p })))); ok(s.size >= 3, w + ' CHANGES over its windup (the tell is told over time): ' + s.size + ' distinct of 4'); }
  const tells = Object.values(GBM.MOVES).map(m => sig(gb({ pose: m.pose[0], p: 0.9 }))); ok(new Set(tells).size === 4, 'the four windups are four different pictures');
  { const r = gb({ pose: 'gbIdle' }), eyes = r.filter(a => a[4] === A.PAL.sclera).length, mouth = r.filter(a => a[4] === A.PAL.mouth).length; ok(eyes >= 2 && mouth >= 1, 'the face is drawn: ' + eyes + ' eye rects, ' + mouth + ' mouth rects');
    const o1 = gb({ pose: 'gbBlastWind', p: 1 }); ok(o1.filter(a => a[4] === A.PAL.mouth).length >= 1, 'the blowpipe wind keeps the mouth round the pipe'); }
  { const a = bbox(gb({ pose: 'gbIdle' }, 1)), b = bbox(gb({ pose: 'gbIdle' }, -1)); ok(Math.abs(a.x0 + b.x1) <= 2 && Math.abs(a.x1 + b.x0) <= 2, 'facing left mirrors facing right: ' + JSON.stringify([a, b])); }
  { const p1 = sig(gb({ pose: 'gbBlastWind', p: 0.9, ph: 1 })), p2 = sig(gb({ pose: 'gbBlastWind', p: 0.9, ph: 2 })); ok(p1 !== p2, 'phase two is drawn differently (glowing goggles and hem)'); }
  ok(gb({ pose: 'gbIdle', ward: 1.2 }).length > gb({ pose: 'gbIdle' }).length + 20, 'the ward draws a dome round him');
  for (const f of [1, -1]) for (const t of [0, 0.1, 0.4, 0.8, 1.2, 1.6, 2.0, 2.3, 2.5]) { const r = rec(g => A.drawGlassblowerDeath(g, { x: 0, y: 0, f, t, time: 0.4 })); ok(r.length > 10 && BAD.length === 0, 'death fall at ' + t + ' draws clean'); }
  { const s = new Set([0.05, 0.5, 1.0, 1.6, 2.2].map(t => sig(rec(g => A.drawGlassblowerDeath(g, { x: 0, y: 0, f: 1, t, time: 0.4 }))))); ok(s.size === 5, 'the death fall changes through its 2.4 s'); } }

// ---------- B. THE SAND GRASPER ----------
{ const sim = new Set(); for (const m of readFileSync(URLS('src/sand-grasper.js'), 'utf8').matchAll(/'(gr[A-Z][A-Za-z0-9]+)'/g)) sim.add(m[1]); for (const p of sim) if (p !== 'grHurt') ok(A.SG_POSES.includes(p), 'a drawing for the grasper pose ' + p);
  const gr = o => rec(g => A.drawGrasper(g, { x: 0, y: 0, f: 1, t: 0.5, ...o }));
  for (const pose of A.SG_POSES) for (const f of [1, -1]) for (const flash of [false, true]) { const r = rec(g => A.drawGrasper(g, { x: 0, y: 0, f, pose, mode: pose === 'grBoil' ? 'boil' : 'walk', p: 0.5, t: 0.5, flash })); ok(r.length > 15 && BAD.length === 0, pose + ' f' + f + ' draws clean (' + r.length + ') ' + BAD.slice(0, 2)); }
  const buried = gr({ mode: 'buried', pose: 'grBoil' }); ok(buried.length > 5 && BAD.length === 0, 'the buried grasper shows only a faint ripple (' + buried.length + ' rects)');
  const steps = [0.05, 0.2, 0.4, 0.6, 0.8, 1], sg = steps.map(p => gr({ mode: 'boil', pose: 'grBoil', p, t: 0.5 + p }));
  ok(new Set(sg.map(sig)).size === steps.length, 'every step of the boil is a different picture (the tell)'); ok(sg[0].length > buried.length, 'the boil is louder than the buried ripple'); ok(sg[5].length > sg[1].length + 30, 'the boil grows: a mound, a hand, two hands (' + sg.map(r => r.length).join(',') + ')');
  { const sk = sg.map(r => r.filter(a => a[4] === A.PAL.dead).length); ok(sk[0] === 0 && sk[2] > 0 && sk[5] > sk[3], 'a hand claws up through the sand mid-boil and a second follows (dead-skin rects per step ' + sk.join(',') + ')'); }
  { const bb = bbox(gr({ mode: 'boil', pose: 'grBoil', p: 1 })); ok(bb.y0 <= -30, 'the boiling sand reaches up (' + bb.y0 + ' px over the floor): it can be seen coming'); }
  const wind = sig(gr({ pose: 'grWind', mode: 'grabTell' })), walk = sig(gr({ pose: 'grWalk', mode: 'walk' })), grab = sig(gr({ pose: 'grGrab' })), hold = sig(gr({ pose: 'grHold' })), rec2 = sig(gr({ pose: 'grRecover' }));
  ok(new Set([wind, walk, grab, hold, rec2]).size === 5, 'wind / walk / grab / hold / recover are five pictures'); ok(sig(gr({ pose: 'grWalk' })) !== sig(gr({ pose: 'grWalk2' })), 'the two walk frames differ');
  { const w = bbox(gr({ pose: 'grWind' })); ok(w.y0 <= -45 && w.x0 <= -14 && w.x1 >= 14, 'wind: both arms up and wide (' + JSON.stringify(w) + ')'); const g2 = bbox(gr({ pose: 'grGrab' })); ok(g2.x1 >= 24, 'grab: arms thrust out (x1 ' + g2.x1 + ')'); }
  ok(new Set([0.1, 0.5, 0.9].map(p => sig(gr({ mode: 'rise', pose: 'grRise', p })))).size === 3, 'the rise changes over its half second');
  { const o = gr({ pose: 'grRecover' }); ok(o.some(a => a[4] === A.PAL.gold), 'its open moment is marked in gold'); }
  for (const p of sim) void p; }

// ---------- C. THE KIT ----------
{ const V = g => ({ g, time: 0.5 });
  for (const open of [0, 0.25, 0.5, 0.75, 1]) for (const [run, warn, moving] of [[false, false, false], [true, false, true], [true, true, true]]) { const r = rec(g => A.drawRaceDoor(V(g), { l: 10, top: 20, w: 32, hh: 64, open, run, warn, moving })); ok(r.length > 20 && BAD.length === 0, 'race door open ' + open + (run ? ' running' : '') + (warn ? ' warn' : '') + ' draws clean ' + BAD.slice(0, 2)); }
  { const s = new Set([0, 0.5, 1].map(o => sig(rec(g => A.drawRaceDoor(V(g), { l: 10, top: 20, w: 32, hh: 64, open: o, run: true })))) ); ok(s.size === 3, 'the door shut / half / open are three pictures'); ok(sig(rec(g => A.drawRaceDoor(V(g), { l: 10, top: 20, w: 32, hh: 64, open: 1, run: true }))) !== sig(rec(g => A.drawRaceDoor(V(g), { l: 10, top: 20, w: 32, hh: 64, open: 1, run: true, warn: true }))), 'the door warns red in the last seconds'); }
  for (const [run, warn] of [[false, false], [true, false], [true, true]]) { const r = rec(g => A.drawRaceMarker(V(g), 30, 40, { run, warn })); ok(r.length > 20 && BAD.length === 0, 'race marker ' + run + warn + ' draws clean'); }
  ok(sig(rec(g => A.drawRaceMarker(V(g), 30, 40, { run: true }))) !== sig(rec(g => A.drawRaceMarker(V(g), 30, 40, { run: false }))), 'the pennant waves while the glass runs and hangs when it has not');
  for (const rows of [2, 3]) { const r = rec(g => A.drawHallKiln(V(g), 0, 0, 32, rows * 16)); ok(r.length > 40 && BAD.length === 0, 'hall kiln ' + rows + ' rows draws clean'); const b = bbox(r); ok(b.y0 >= -26 && b.y1 <= rows * 16 + 1 && b.x0 >= -2 && b.x1 <= 34, 'kiln ' + rows + ' rows stays on its stub ' + JSON.stringify(b)); }
  ok(sig(rec(g => A.drawHallKiln(V(g), 0, 0, 32, 48))) !== sig(rec(g => A.drawHallKiln(V(g), 0, 0, 32, 32))), 'the 2-row kiln is its own look');
  { const r = rec(g => A.drawHallFloor(V(g), 0, 0, 288)); ok(r.length > 30 && BAD.length === 0, 'hall floor draws clean'); const b = bbox(r); ok(b.y1 <= 1 && b.y0 >= -10, 'the hall floor dressing sits ON the floor line ' + JSON.stringify(b)); }
  const gobs = [{ fly: true, x: 40, y: -30, x0: 10, tx: 80, t: 0.35 }, { hot: 2, x: 30 }, { cooled: true, cool: 2.5, x: 30 }, { cooled: true, cool: 0.5, x: 30 }];
  gobs.forEach((gb2, i) => { const r = rec(g => A.drawGob(V(g), gb2, 0, 16, 0.3, 0, 0)); ok(r.length > 5 && BAD.length === 0, 'gob state ' + i + ' draws clean'); }); ok(new Set(gobs.map(gb2 => sig(rec(g => A.drawGob(V(g), gb2, 0, 16, 0.3, 0, 0))))).size === 4, 'gob: flying / hot / cooled / clouding are four pictures');
  { const b = bbox(rec(g => A.drawGob(V(g), { cooled: true, cool: 2.5, x: 30 }, 0, 16, 0.3, 0, 0))); ok(b.y0 <= -16 && b.y1 <= 1, 'the cooled glass step is one tile tall (16 px): what you stand on is what you see ' + JSON.stringify(b)); }
  for (const dir of [1, -1]) { const r = rec(g => A.drawBlast(V(g), { x: 10, far: 10 + dir * 112, dir }, 0, 24, 0.2, 0, 0)); ok(r.length > 30 && BAD.length === 0, 'blast cone dir ' + dir + ' draws clean'); const b = bbox(r); ok(b.y1 <= 1 && b.y0 >= -26, 'the cone keeps to the floor (24 px) ' + JSON.stringify(b)); }
  for (const ht of ['low', 'high']) for (const dir of [1, -1]) ok(rec(g => A.drawShard(V(g), { x: 20, y: -5, dir, ht }, 0, 0, 0.1)).length > 5 && BAD.length === 0, 'shard ' + ht + dir + ' draws clean');
  ok(rec(g => A.drawGlint(V(g), 20, -20, 0.5, 0.3)).length > 20 && BAD.length === 0, 'the glint ring draws clean'); }

// ---------- D. PALETTE + FILES ----------
{ const src = readFileSync(URLS('src/redraw/buried_city_bc5_art.js'), 'utf8'), lit = new Set([...src.matchAll(/'(#[0-9a-fA-F]{6})'/g)].map(m => m[1].toLowerCase())), pal = new Set(Object.values(A.PAL).filter(v => /^#/.test(v)).map(v => v.toLowerCase()));
  const used = [...COLS.keys()].filter(c => !/^rgba?\(/.test(c)); const stray = used.filter(c => !lit.has(c.toLowerCase()) && c.toLowerCase() !== '#000000'); ok(stray.length === 0, 'every colour drawn is a literal of the kit: ' + stray.slice(0, 5));
  ok(used.filter(c => pal.has(c.toLowerCase())).length >= 45, 'the kit palette is what draws (' + used.length + ' colours used)'); ok(pal.size <= 110, 'a kit, not a rainbow: ' + pal.size + ' palette colours');
  for (const f of ['src/redraw/buried_city_bc5_art.js', 'tools/bc5-art-lint.mjs', 'tools/bc5-art-sheet.mjs']) ok(!/(^|[\/_-])(ad|ads|admiral|banner|track|tracker|sponsor)([._-]|$)/i.test(f), 'no ad-block word in ' + f); }

// ---------- E. WIRING + DRAW-ONLY ----------
{ const rd = f => readFileSync(URLS(f), 'utf8'), hands = rd('src/glassblower-hands.js'), flip = rd('src/buried-city-flip.js'), bch = rd('src/buried-city-hands.js'), lvl = rd('src/buried-city.js');
  ok(/import \* as A5 from '\.\/redraw\/buried_city_bc5_art\.js'/.test(hands) && /A5\.drawGlassblower\(/.test(hands) && /A5\.drawGrasper\(/.test(hands) && /A5\.drawGlassblowerDeath\(/.test(hands) && /A5\.drawGob\(/.test(hands) && /A5\.drawBlast\(/.test(hands) && /A5\.drawShard\(/.test(hands) && /A5\.drawGlint\(/.test(hands), 'the hands draw through the art (no greybox left)');
  ok(!/ctx\.text\(pose,/.test(hands), 'the pose-name debug text is gone from the Glassblower');
  ok(/A5\.drawRaceDoor\(/.test(flip) && /A5\.drawRaceMarker\(/.test(flip) && /K\.L\.bc5 && RACE_GLASSES\.includes\(gq\.id\)/.test(flip), 'the flip draws the race door and (bc5 only) the race marker');
  ok(/kind === 'kiln'/.test(bch) && /kind === 'gbhall'/.test(bch) && /A5\.drawHallKiln/.test(bch) && /A5\.drawHallFloor/.test(bch), 'the level hands draw the hall kilns and floor');
  ok(/kind: 'gbhall'/.test(lvl) && /rows \}\); \}\);/.test(lvl), 'the level carries the hall decor (draw only)');
  let base = null; try { base = process.env.BC5ART_BASE || '1d437c254'; execSync('git cat-file -e ' + base, { cwd: ROOTD, stdio: 'ignore' }); } catch { base = null; }
  if (base) for (const f of ['src/glassblower.js', 'src/sand-grasper.js', 'src/buried-city5.js']) { let d = execSync('git diff ' + base + ' -- ' + f, { cwd: ROOTD }).toString(); if (f === 'src/buried-city5.js') d = d.split(String.fromCharCode(10)).filter(l => /^[+-][^+-]/.test(l) && !/BC5_SHIPS|BRACKEN_BC5|bc5=0/.test(l)).join('');   /* (claude/prepbc5) the ships flag + ?bc5=0 override lines are the only allowed change */ ok(d === '', f + ' (the sim, the numbers, the hitboxes) is untouched vs ' + base); }
  else console.log('  (base commit not found: sim-untouched check skipped)');
  ok(GBM.GB.hp === 1500 && GBM.GB.blastTell === 1.2 && GBM.GB.openT === 4.5 && SGM.GRASP.hp === 170 && SGM.GRASP.boil === 1.2, 'the tuned numbers read as the fix lane left them (hp 1500, tells, openT 4.5, grasper boil 1.2)');
  /* the hands smoke: the real drawFoe over every pose with a fake world */
  const { makeGlassblowerHands } = await import(URLS('src/glassblower-hands.js').href); const texts = [];
  const L = { bc5: true, mini: { gb: { sx: 389, R: 33 } } };
  const ctx = { TS: 16, get L() { return L; }, text: (...a) => texts.push(a), players: [], time: () => 1, EHP: {}, VW: () => 400, VH: () => 240 };
  const H = makeGlassblowerHands(ctx);
  for (const pose of A.GB_POSES) for (const mode of ['walk', 'sleep', 'wake', 'gobTell', 'blastTell', 'flipTell', 'bulbTell', 'buried']) { const e = { t: 'glassblower', x: 100, y: 200, face: -1, mode, modeT: 0.4, pose, phase: 2, open: mode === 'buried' ? 2 : 0, alive: true, flash: 0 }; const r = rec(g => H.drawFoe(g, e, 0, 0, 0.7)); ok(r.length > 30 && BAD.length === 0, 'drawFoe ' + pose + '/' + mode + ' draws clean'); }
  for (const [mode, pose] of [['buried', 'grBoil'], ['boil', 'grBoil'], ['rise', 'grRise'], ['walk', 'grWalk'], ['grabTell', 'grWind'], ['grab', 'grGrab'], ['hold', 'grHold'], ['recover', 'grRecover']]) { const e = { t: 'sandgrasper', x: 100, y: 200, face: 1, mode, pose, hurt: 0, st: { pose, t: 0.5, mode } }; const r = rec(g => H.drawFoe(g, e, 0, 0, 0.7)); ok(r.length > 5 && BAD.length === 0, 'drawFoe grasper ' + mode + ' draws clean'); }
  ok(texts.some(t => t[0] === 'BURIED') && texts.some(t => t[0] === 'OPEN'), 'the words stay (BURIED, OPEN): the reads are unchanged'); }

// ---------- F. (bc5art2) the sign, the finish line, the rise has no slab, the wiring ----------
{ globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => makeCtx() }) };
  const sg = rec(g => { g.drawImage(A.signArt(), 0, 0); }); ok(typeof A.signArt === 'function' && A.signArt().width === 18, 'the BC5 sign bakes 18 x 18');
  for (const run of [false, true]) for (const warn of [false, true]) { const r = rec(g => A.drawFinishLine({ g, time: 0.5 }, 0, 0, { run, warn })); ok(r.length > 40 && BAD.length === 0, 'the finish line draws clean (run ' + run + ' warn ' + warn + ')'); }
  { const r = rec(g => A.drawGrasper(g, { x: 0, y: 0, f: 1, pose: 'grRise', mode: 'rise', p: 0.3, t: 0.5 })), b = bbox(r); ok(b.y1 <= 2, 'the rising grasper draws nothing below the floor line (no slab): y1 ' + b.y1); }
  const m = readFileSync(URLS('src/main.js'), 'utf8'), fl = readFileSync(URLS('src/buried-city-flip.js'), 'utf8');
  ok(m.includes('L.bc5 ? BC5SIGN()') && m.includes('signArt as BC5SIGN'), 'main.js skins the signs of an L.bc5 level with the BC5 tablet');
  ok(fl.includes('K.L.bc5) { const fin') && fl.includes('drawFinishLine'), 'the flip draws the finish lines under L.bc5 only'); }
console.log(bad ? bad + ' FAILED of ' + n : 'bc5-art-lint: ' + n + ' ok');
process.exit(bad ? 1 : 0);
