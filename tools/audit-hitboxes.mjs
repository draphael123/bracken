// tools/audit-hitboxes.mjs — THE CREATURE SWEEP: hitboxes against sprites, frame data, animation coverage and silhouettes, measured in the page.
// FINDINGS ONLY: it measures and writes JSON and PNG sheets; it changes nothing in the game.
// Each creature is stood up in its own level (a boss in its arena) with a passive hero pinned beside it (health and invulnerability reset every
// frame, so a live blow lands on every frame it is live). For each one:
//   1. every frame of its sprite set is read: opaque box, pixel hash, and for frame 0 a 16x16 silhouette grid, mean colour and mirror asymmetry;
//   2. it is WATCHED at five placements (close, mid, far, behind-then-in-front for the turn, above) and every mode change, ! / !! mark and blow
//      on the hero is written down with the frame, and the frame it is drawn with (every third frame, and every frame round a turn);
//   3. every windup (every mode it showed ending in Tell, and every *Tell mode its update function names) is FORCED with the hero at 32 places
//      round it, and the places the game's own damagePlayer says yes are its measured reach; the best place is run again drawn frame by frame;
//   4. it is hit once by the hero (the recoil frames) and killed once (does it leave a body or vanish);
//   5. its real drawn pixels are read off the canvas against the ground behind it: edge contrast, drawn box, a crop at 1x and 3x.
// The hero side (--hero) runs every blow of every hero (and every knight blade) and reads attackBox() each frame against the frame the weapon is drawn on.
//   node tools/audit-hitboxes.mjs                 every creature, then the heroes -> SCRATCH/creatures.json, OUT/<creature>.png, OUT/silhouettes.png
//   node tools/audit-hitboxes.mjs cutlass,troll   those creatures only (a key is the type, or type:big)
//   node tools/audit-hitboxes.mjs --hero          the heroes only
//   OUT=<dir> SCRATCH=<dir> PORT=5908 node tools/audit-hitboxes.mjs
// The findings are computed by tools/audit-report.mjs from the JSON. Exit 0 unless the page cannot be opened.
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { openAudit, savePng, OUT, SCRATCH, ROOT } from './audit-lib.mjs';

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const HERO_ONLY = process.argv.includes('--hero'), FOES_ONLY = process.argv.includes('--foes');
const only = args[0] ? args[0].split(',') : null;
mkdirSync(OUT, { recursive: true }); mkdirSync(SCRATCH, { recursive: true });

/* ---- what the source names: every *Tell mode of every creature update function, and which tell sites type their timing as a literal ---- */
export function sourceTells() {
  const src = readFileSync(join(ROOT, 'src/main.js'), 'utf8');
  const types = [...(src.match(/const EHP = \{([\s\S]*?)\};/) || [, ''])[1].matchAll(/(\w+):/g)].map(m => m[1]);
  const lower = new Map(types.map(t => [t.toLowerCase(), t]));
  const byType = {}, sites = [], re = /^function (update[A-Za-z0-9]+)\(/gm; let m;
  while ((m = re.exec(src))) { let d = 0, started = false, end = src.length;
    for (let k = m.index; k < src.length; k++) { const c = src[k]; if (c === '{') { d++; started = true; } else if (c === '}') { d--; if (started && d === 0) { end = k; break; } } }
    const body = src.slice(m.index, end), nm = m[1].slice(6).toLowerCase();
    const t = lower.get(nm) || null;
    const tells = [...new Set([...body.matchAll(/(?:case |e\.mode = |e\.mode === )'([A-Za-z0-9]+Tell)'/g)].map(q => q[1]))];
    if (t && tells.length) byType[t] = tells;
    /* every place a Tell is ENTERED: is its length a number typed there, or read from somewhere */
    const enter = /e\.mode = '([A-Za-z0-9]+Tell)'/g; let q;
    while ((q = enter.exec(body))) { const around = body.slice(Math.max(0, q.index - 90), q.index + 140); const mt = around.match(/e\.modeT = ([^;,)]+)/);
      const line = src.slice(0, m.index + q.index).split('\n').length;
      sites.push({ fn: m[1], t, mode: q[1], line, timing: mt ? mt[1].trim() : null, literal: mt ? /^[\d.]+$/.test(mt[1].trim()) : null }); } }
  /* THE TOUCH: the one damagePlayer call that is a creature's body, not its blow (updatePlayer's contact pass) */
  const contactLine = src.split('\n').findIndex(l => /damagePlayer\(e\.x, e\.t === 'hopper'/.test(l)) + 1;
  return { byType, sites, contactLine };
}

/* ---- THE CREATURE, in the page ---- */
async function CREATURE(o) {
  const A = window.__AUD, BK = window.BK, P = BK.P, key = o.key, hab = A.HAB[key], t = key.split(':')[0];
  if (!hab) return { key, skipped: 'no habitat' };
  let info; try { info = await A.stand(t, hab); } catch (err) { return { key, skipped: 'stand threw: ' + err.message }; }
  if (!info) return { key, skipped: 'did not spawn' };
  const e = A.e;
  if (!e.lastSet) return { key, skipped: 'not drawn through the creature draw (e.lastSet never set)' };
  const set = e.lastSet, bigF = e.lastBigF || 1, setName = A.sprName(set), boxes = A.frameBoxes(set, bigF);
  const hc = new Map(); const fh = (s, f) => { if (!s || !s.R) return 'none'; let arr = hc.get(s); if (!arr) { arr = []; hc.set(s, arr); } if (arr[f] === undefined) arr[f] = s === set && boxes[f] ? boxes[f].hash : A.hashCanvas(s.R[f]); return arr[f]; };
  const ex0 = e.x, ey0 = e.y, base = A.snap.mode, med = a => a && a.length ? a.slice().sort((p, q) => p - q)[a.length >> 1] : null;
  const face = dx => dx > 0 ? -1 : 1;
  /* 5. THE SILHOUETTE ON ITS OWN GROUND: the camera settled on it, the hero a little way off */
  for (let f = 0; f < 50; f++) { A.pin(ex0 - 56, ey0, 1); BK.sim(1); }
  A.restore(ex0, ey0, -1); A.pin(ex0 - 56, ey0, 1);
  let sil = null; BK.hideHero = true; try { sil = A.drawn({ contrast: true, crop: 3 }); } catch (err) { sil = { error: err.message }; } BK.hideHero = false;
  if (sil && sil.crop) { (window.__sil = window.__sil || {})[key] = { crop1: sil.crop1, crop: sil.crop, cw: sil.cw, ch: sil.ch, level: hab.level }; delete sil.crop; delete sil.crop1; }
  /* 2. WATCHED */
  const runs = [{ dx: -22 }, { dx: -46 }, { dx: -110 }, { dx: 34, turn: -34 }, { dx: -30, dy: -40 }];
  const tr = { modes: [], marks: [], hits: [], flips: [] }, frames = {}, modeT0 = {}, seen = new Set();
  let F = 0;
  for (let ri = 0; ri < runs.length; ri++) { const R = runs[ri];
    A.restore(ex0, ey0, R.dx > 0 ? 1 : -1); let lastMode = null, lastMark = null, lastFace = e.face, flipLeft = 0, prevHash = null;
    tr.modes.push([F, '#run' + ri]);
    for (let f = 0; f < o.watchF; f++, F++) {
      const dx = R.turn !== undefined && f > o.watchF / 2 ? R.turn : R.dx;
      A.pin(ex0 + dx, ey0 + (R.dy || 0), face(dx)); BK.log.length = 0; BK.sim(1);
      if (!e.alive) { tr.modes.push([F, '#died']); break; }
      if (e.mode !== lastMode) { tr.modes.push([F, e.mode]); seen.add(e.mode); (modeT0[e.mode] = modeT0[e.mode] || []).push(+(e.modeT || 0).toFixed(3)); lastMode = e.mode; }
      const mk = !!BK.telling(e); if (mk !== lastMark) { tr.marks.push([F, mk ? 1 : 0]); lastMark = mk; }
      for (const l of BK.log) if (l.k === 'dmgP') tr.hits.push([F, l.dmg, l.unblockable ? 1 : 0, A.stackLine(l.stack), e.mode]);
      const flipped = e.face !== lastFace && f > 0; lastFace = e.face;
      if (flipped) { flipLeft = 8; tr.flips.push({ F, mode: e.mode, before: prevHash, after: [] }); }
      if (flipLeft > 0 || f % 3 === 0) { BK.step(0); const s = e.lastSet, fr = e.lastFrame || 0, h = fh(s, fr);
        const md = (frames[e.mode] = frames[e.mode] || {}); if (!md[h]) md[h] = { n: 0, i: fr, set: s === set ? '' : A.sprName(s) }; md[h].n++;
        if (flipLeft > 0) { tr.flips[tr.flips.length - 1].after.push(h); flipLeft--; }
        prevHash = h; } } }
  /* 3. FORCED */
  const tells = [...new Set([...[...seen].filter(m => /Tell$/.test(m)), ...(o.srcTells || [])])];
  const sweeps = {};
  for (const m of tells) { const T0 = med(modeT0[m]) || 0.6; const grid = [];
    const one = (dx, dy, draw) => { A.restore(ex0, ey0, dx > 0 ? 1 : -1); e.mode = m; e.modeT = T0; const r = { dx, dy, hits: [], markF: null, modes: [], drawn: [] }; let lm = m;
      for (let f = 0; f < 150; f++) { A.pin(ex0 + dx, ey0 + dy, face(dx)); BK.log.length = 0; BK.sim(1);
        if (!e.alive) break;
        if (r.markF === null && BK.telling(e)) r.markF = f;
        if (e.mode !== lm) { r.modes.push([f, e.mode]); lm = e.mode; }
        if (BK.log.some(q => q.k === 'dmgP' && A.stackLine(q.stack) === o.contactLine)) r.touch = (r.touch || 0) + 1;
        const l = BK.log.find(q => q.k === 'dmgP' && A.stackLine(q.stack) !== o.contactLine);
        if (l) { r.hits.push(f); if (r.hits.length === 1) { r.first = { f, off: [Math.round(P.x - e.x), Math.round(P.y - e.y)], move: Math.round(e.x - ex0), line: A.stackLine(l.stack), dmg: l.dmg, unblockable: !!l.unblockable, mode: e.mode }; } r.lastOff = [Math.round(P.x - e.x), Math.round(P.y - e.y)]; }
        if (draw) { BK.step(0); r.drawn.push([f, e.lastFrame || 0, e.lastSet === set ? '' : A.sprName(e.lastSet), l ? 1 : 0, Math.round(e.x - ex0)]); }
        if (r.hits.length && f - r.hits[r.hits.length - 1] > 40) break;
        if (f > 6 && !r.hits.length && r.modes.length && e.mode === base) break; }
      return r; };
    for (const dy of [0, -24]) for (let dx = -64; dx <= 64; dx += 8) { if (!dx) continue; const r = one(dx, dy, false); grid.push({ dx, dy, n: r.hits.length, first: r.first || null, last: r.lastOff || null, markF: r.markF, span: r.hits.length ? r.hits[r.hits.length - 1] - r.hits[0] + 1 : 0, hitsF: r.hits.slice(0, 40), modes: r.modes.slice(0, 8) }); }
    const bestG = grid.filter(g => g.dy === 0 && g.n).sort((p, q) => q.n - p.n)[0] || grid.filter(g => g.n)[0];
    let best = null; if (bestG) { best = one(bestG.dx, bestG.dy, true); }
    let tellFrame = null; if (best && best.drawn.length) tellFrame = best.drawn[Math.min(best.drawn.length - 1, Math.max(0, (best.markF || 0) + 2))][1];
    sweeps[m] = { modeT: T0, forcedFrom: seen.has(m) ? 'seen' : 'source', grid, best: best ? { dx: best.dx, dy: best.dy, hits: best.hits, markF: best.markF, modes: best.modes, drawn: best.drawn, first: best.first } : null, tellFrame }; }
  /* 4. HIT ONCE, KILLED ONCE */
  const strike = (hp, kill) => { const out = { landed: null, frames: [], hurtT: null, alive: null, corpses: 0, bodies: 0 };
    for (const side of [-1, 1]) { A.restore(ex0, ey0, -side); e.hp = hp; const c0 = BK.corpses().length, b0 = BK.bossBodies().length;
      for (let f = 0; f < 80; f++) { P.x = e.x + side * (e.w / 2 + 12); P.y = e.y; P.vx = 0; P.vy = 0; P.face = -side; P.hp = P.maxHp; P.inv = 1; P.st = P.maxSt; P.hurt = 0; P.asleep = 0;
        if (f % 24 === 0) BK.press('atk'); BK.log.length = 0; BK.sim(1);
        const l = BK.log.find(q => q.k === 'dmgE' && q.e === e && q.hp < q.hp0);
        if (l) { out.landed = { side, f, dmg: l.dmg }; out.hurtT = e.hurtT || 0; out.alive = e.alive;
          for (let k = 0; k < (kill ? 40 : 14); k++) { if (!kill) { BK.step(0); out.frames.push([k, e.lastFrame || 0, e.lastSet === set ? '' : A.sprName(e.lastSet), fh(e.lastSet, e.lastFrame || 0), e.mode]); } BK.sim(1); }
          out.corpses = BK.corpses().length - c0; out.bodies = BK.bossBodies().length - b0; out.aliveAfter = e.alive; return out; }
        if (!e.alive) break; } }
    return out; };
  let hurt = null, death = null;
  try { hurt = strike(Math.max(A.snap.hp || 0, 80), false); } catch (err) { hurt = { error: err.message }; }
  try { death = strike(1, true); } catch (err) { death = { error: err.message }; }
  /* THE STAGGER POSE: e.stagger forced, drawn */
  let stagger = [];
  try { A.restore(ex0, ey0, -1); e.stagger = 0.8; for (let f = 0; f < 12; f++) { A.pin(ex0 - 60, ey0, 1); BK.sim(1); if (f % 3 === 0) { BK.step(0); stagger.push([e.lastFrame || 0, fh(e.lastSet, e.lastFrame || 0), e.mode]); } } } catch (err) { stagger = [['error', err.message]]; }
  return { key, info, setName, w: e.w, h: e.h, bigF, ax: set.ax, ay: set.ay, base, boxes, frames, modeT0, tr, sweeps, hurt, death, stagger, sil, seen: [...seen] };
}

/* ---- THE SHEET for one creature, in the page, from the JSON row ---- */
async function SHEET(r) {
  const BK = window.BK, set = BK.SPR[r.setName]; if (!set) return null;
  const Z = 3, boxes = r.boxes, FW = Math.max(...boxes.map(b => b ? b.W : 0)), FH = Math.max(...boxes.map(b => b ? b.H : 0));
  const cols = Math.min(boxes.length, 10), rows = Math.ceil(boxes.length / cols), cell = { w: Math.ceil(FW * r.bigF) * Z + 8, h: Math.ceil(FH * r.bigF) * Z + 22 };
  const tells = Object.keys(r.sweeps), tellH = 150;
  const c = document.createElement('canvas'); c.width = Math.max(cols * cell.w, 700) + 10; c.height = 24 + rows * cell.h + tells.length * tellH + 10;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#14121c'; g.fillRect(0, 0, c.width, c.height);
  g.font = '11px monospace'; g.fillStyle = '#e8e2cc'; g.fillText(r.key + '  hurt box ' + r.w + 'x' + r.h + ' (yellow)  opaque box (cyan)  ' + boxes.length + ' frames  scale ' + r.bigF + '  level ' + (r.info && r.info.maxHp ? 'boss' : 'foe'), 6, 15);
  const usedBy = {}; for (const m of Object.keys(r.frames)) for (const h of Object.keys(r.frames[m])) { const q = r.frames[m][h]; if (!q.set) (usedBy[q.i] = usedBy[q.i] || new Set()).add(m); }
  for (let i = 0; i < boxes.length; i++) { const b = boxes[i]; const ox = 5 + (i % cols) * cell.w, oy = 24 + Math.floor(i / cols) * cell.h;
    const ax = ox + Math.round(set.ax * r.bigF) * Z, ay = oy + 4 + Math.round(set.ay * r.bigF) * Z;
    g.fillStyle = '#1e1a2a'; g.fillRect(ox, oy, cell.w - 2, cell.h - 2);
    if (set.R[i]) g.drawImage(set.R[i], ax - set.ax * r.bigF * Z, ay - set.ay * r.bigF * Z, set.R[i].width * r.bigF * Z, set.R[i].height * r.bigF * Z);
    g.strokeStyle = '#ffd34a'; g.lineWidth = 1; g.strokeRect(ax - r.w / 2 * Z + 0.5, ay - r.h * Z + 0.5, r.w * Z - 1, r.h * Z - 1);
    if (b && !b.empty) { g.strokeStyle = '#5ad8ff'; g.strokeRect(ax + b.l * Z + 0.5, ay + b.t * Z + 0.5, (b.r - b.l) * Z - 1, (b.b - b.t) * Z - 1); }
    g.fillStyle = '#ff5a5a'; g.fillRect(ax - 1, ay - 1, 3, 3);
    g.fillStyle = '#c9d1dc'; g.font = '9px monospace'; g.fillText('f' + i + (usedBy[i] ? ' ' + [...usedBy[i]].join(',') : '').slice(0, Math.floor((cell.w - 6) / 5.5)), ox + 2, oy + cell.h - 6); }
  let ty = 24 + rows * cell.h;
  for (const m of tells) { const s = r.sweeps[m]; const hitsG = s.grid.filter(q => q.n);
    const fx = hitsG.map(q => q.first.off[0]);
    g.fillStyle = '#e8e2cc'; g.font = '10px monospace';
    g.fillText(m + ' (' + s.forcedFrom + ')  lands at ' + hitsG.length + '/' + s.grid.length + ' places' + (fx.length ? '  hero dx at impact ' + Math.min(...fx) + '..' + Math.max(...fx) : '  NEVER LANDED') + (s.best && s.best.first ? '  first blow f' + s.best.first.f + (s.best.markF !== null ? '  mark f' + s.best.markF : '  NO MARK') + '  main.js:' + s.best.first.line : ''), 6, ty + 12);
    const mx = 6, my = ty + 18; g.fillStyle = '#0c0a12'; g.fillRect(mx, my, 17 * 16 + 4, 2 * 16 + 4);
    for (const q of s.grid) { g.fillStyle = q.n ? '#7ad86a' : '#2a2436'; g.fillRect(mx + 2 + (q.dx + 64) / 8 * 16, my + 2 + (q.dy === 0 ? 16 : 0), 14, 14); }
    g.fillStyle = '#ffd34a'; g.fillRect(mx + 2 + 8 * 16 + 5, my + 2, 4, 30);
    g.fillStyle = '#c9d1dc'; g.font = '9px monospace'; g.fillText('hero at dx -64..64 (step 8), rows dy -24 / 0; green = the blow landed', mx, my + 48);
    if (s.best) { let x = 300; const seq = s.best.drawn.slice(0, 60); const fr = [...new Set(seq.map(q => q[1] + (q[2] ? '@' + q[2] : '')))];
      g.fillText('drawn frames f0..: ' + seq.map(q => (q[3] ? '*' : '') + q[1]).join(' ').slice(0, 120), x, my + 10);
      g.fillText('(* = a frame the blow was live on)', x, my + 22);
      const hitF = seq.filter(q => q[3] && !q[2]).map(q => q[1]); let px = x;
      for (const i of [...new Set(hitF)].slice(0, 6)) { const cv = set.R[i]; if (!cv) continue; g.drawImage(cv, px, my + 30, cv.width * 2, cv.height * 2); px += cv.width * 2 + 6; } }
    ty += tellH; }
  return c.toDataURL('image/png');
}

/* ---- THE HERO SIDE: each hero, each blow, the box the game tests each frame and the frame the weapon is drawn on ---- */
async function HERO(o) {
  const A = window.__AUD, BK = window.BK, P = BK.P, out = {}, lvm = await import('/src/level.js');
  const wood = lvm.LEVELS.findIndex(l => l.id === 'wood');
  for (const h of ['knight', 'pyro', 'paladin', 'pirate', 'reaper']) for (const sw of (h === 'knight' ? BK.SWORDS.map(s => s.id) : ['default'])) {
    BK.setHero(h); if (h === 'knight') { BK.PROG.sword = sw; BK.PROG.swords = BK.PROG.swords || {}; BK.PROG.swords[sw] = true; BK.applySkin(); BK.applyUpgrades(); }
    A.settings(); BK.load(wood); BK.state = 'play'; BK.god = false; BK.sim(3); for (const q of BK.enemies()) q.alive = false; A.clearKeys(); BK.sim(30); BK.reset();
    const K = BK.heroSet, hs = h === 'reaper' ? 1.22 : 1, x0 = P.x, y0 = P.y;
    const tal = BK.PROG.talents = BK.PROG.talents || {}; tal[h] = Object.assign(tal[h] || {}, { heavy: 1, risingCut: 1 });
    const setBox = (key, fr) => { const arr = K.R[key]; if (!arr) return null; const c = arr[((fr % arr.length) + arr.length) % arr.length]; if (!c) return null;
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 40) { if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; }
      return bx1 < 0 ? null : { l: +((bx0 - K.ax) * hs).toFixed(1), r: +((bx1 + 1 - K.ax) * hs).toFixed(1), t: +((by0 - K.ay) * hs).toFixed(1), b: +((by1 + 1 - K.ay) * hs).toFixed(1) }; };
    const blows = {};
    const run = (name, start, frames, keep) => { P.x = x0; P.y = y0; P.vx = 0; P.vy = 0; P.face = 1; P.st = P.maxSt; P.combo = 0; P.heavy = false; P.atk = -1; P.riposteT = 0; A.clearKeys(); BK.sim(40);
      const samples = []; start();
      for (let f = 0; f < frames; f++) { if (keep) keep(f); BK.sim(1); P.st = P.maxSt;
        const ab = BK.attackBox(); BK.step(0);
        samples.push({ f, atk: +P.atk.toFixed(3), heavy: !!P.heavy, combo: P.combo, kind: P.swingKind || null, ab: ab ? { l: +(ab.l - P.x).toFixed(1), r: +(ab.r - P.x).toFixed(1), t: +(ab.t - P.y).toFixed(1), b: +(ab.b - P.y).toFixed(1) } : null, key: P.lastKey, frame: P.lastFrame });
        if (f > 10 && P.atk < 0 && !ab && P.ground && !(P.riseT > 0) && !P.plunge && !(P.charge > 0) && !(P.rush > 0)) break; }
      blows[name] = samples; A.clearKeys(); };
    run('light1', () => BK.press('atk'), 50);
    run('light2', () => BK.press('atk'), 80, f => { if (P.atk < 0 && P.combo === 1 && !P.__p2) { P.__p2 = true; BK.press('atk'); } }); delete P.__p2;
    run('light3', () => BK.press('atk'), 110, f => { if (P.atk < 0 && P.combo === 1 && !P.__p2) { P.__p2 = true; BK.press('atk'); } else if (P.atk < 0 && P.combo === 2 && !P.__p3) { P.__p3 = true; BK.press('atk'); } }); delete P.__p2; delete P.__p3;
    run('heavy', () => { BK.keys.atk = true; BK.press('atk'); }, 150, f => { if (f > 70) BK.keys.atk = false; });
    run('rise', () => { BK.keys.up = true; BK.press('atk'); }, 70, f => { if (f > 4) BK.keys.up = false; });
    run('sweep', () => { BK.keys.down = true; BK.press('atk'); }, 60, f => { if (f > 4) BK.keys.down = false; });
    run('plunge', () => { BK.press('jump'); BK.keys.jump = true; }, 110, f => { if (f === 12) { BK.keys.down = true; BK.press('atk'); } if (f > 60) BK.keys.down = false; });
    const frames = {}; for (const key of Object.keys(K.R)) { frames[key] = []; for (let i = 0; i < K.R[key].length; i++) frames[key].push(setBox(key, i)); }
    out[h + (h === 'knight' ? ':' + sw : '')] = { hero: h, sword: sw, blows, frames };
  }
  return out;
}

async function main() {
  const pg = await openAudit();
  const habPath = join(SCRATCH, 'habitats.json');
  const t0 = Date.now(), say = s => console.log('[' + Math.round((Date.now() - t0) / 1000) + 's] ' + s);
  try {
    let hab;
    if (existsSync(habPath)) { hab = JSON.parse(readFileSync(habPath, 'utf8')); await pg.evalp('window.__AUD.HAB = ' + JSON.stringify(hab)); }
    else { hab = await pg.evalp('(async () => { const h = await window.__AUD.habitats(); window.__AUD.HAB = h; return h; })()'); writeFileSync(habPath, JSON.stringify(hab)); }
    const { byType, sites, contactLine } = sourceTells();
    const jsonPath = join(SCRATCH, 'creatures.json');
    const results = existsSync(jsonPath) && (only || HERO_ONLY) ? JSON.parse(readFileSync(jsonPath, 'utf8')) : { creatures: {}, heroes: null };
    results.tellSites = sites; results.srcTells = byType; results.habitats = hab; results.contactLine = contactLine;   /* the report separates a body's touch from its blows by this line */
    if (!HERO_ONLY) {
      const keys = only || Object.keys(hab).filter(k => !NOT_A_FOE.has(k.split(':')[0])).sort();
      say(keys.length + ' creatures');
      for (const key of keys) { const t1 = Date.now(); let r;
        try { r = await pg.evalp('(' + CREATURE.toString() + ')(' + JSON.stringify({ key, watchF: +(process.env.WATCH || 720), srcTells: byType[key.split(':')[0]] || [], contactLine }) + ')'); }
        catch (err) { r = { key, skipped: 'threw: ' + err.message.split('\n')[0] }; }
        if (!r.skipped) { try { const png = await pg.evalp('(' + SHEET.toString() + ')(' + JSON.stringify(r) + ')'); if (png) savePng(png, join(OUT, key.replace(':', '_') + '.png')); } catch (err) { console.log('  sheet failed: ' + err.message.split('\n')[0]); } }
        results.creatures[key] = r;
        console.log(key.padEnd(16), r.skipped ? 'skipped: ' + r.skipped : ((r.seen || []).length + ' modes, tells ' + Object.entries(r.sweeps).map(([m, s]) => m + ':' + s.grid.filter(q => q.n).length).join(' ') + ', hits watched ' + r.tr.hits.length).slice(0, 150), ((Date.now() - t1) / 1000).toFixed(1) + 's');
        if (pg.errors.length) console.log('  page errors: ' + pg.errors.splice(0).slice(0, 3).join(' | ').slice(0, 300));
        writeFileSync(jsonPath, JSON.stringify(results)); }
      /* every silhouette at 1x and 3x on its own ground, one sheet */
      const silPng = await pg.evalp('(' + SILSHEET.toString() + ')()'); if (silPng) savePng(silPng, join(OUT, 'silhouettes.png'));
    }
    if (!FOES_ONLY && !only) { say('heroes'); results.heroes = await pg.evalp('(' + HERO.toString() + ')({})'); }
    writeFileSync(jsonPath, JSON.stringify(results));
    say('wrote ' + jsonPath);
  } finally { pg.close(); }
}
async function SILSHEET() {
  const S = window.__sil || {}, keys = Object.keys(S).sort((a, b) => (S[a].level + a).localeCompare(S[b].level + b)); if (!keys.length) return null;
  const imgs = await Promise.all(keys.map(k => Promise.all([S[k].crop1, S[k].crop].map(u => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = u; })))));
  const cellW = Math.min(420, Math.max(...keys.map(k => S[k].cw * 4)) + 20), cellH = Math.min(300, Math.max(...keys.map(k => S[k].ch * 3)) + 18), cols = 6;
  const c = document.createElement('canvas'); c.width = cols * cellW; c.height = Math.ceil(keys.length / cols) * cellH; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#101018'; g.fillRect(0, 0, c.width, c.height);
  keys.forEach((k, i) => { const x = (i % cols) * cellW, y = Math.floor(i / cols) * cellH, [a, b] = imgs[i]; g.fillStyle = '#e8e2cc'; g.font = '10px monospace'; g.fillText(k + ' @' + S[k].level, x + 4, y + 11);
    if (a) g.drawImage(a, x + 4, y + 16); if (b) g.drawImage(b, x + 8 + S[k].cw, y + 16, Math.min(b.width, cellW - S[k].cw - 12), Math.min(b.height, cellH - 18)); });
  return c.toDataURL('image/png');
}
/* the furniture and the townsfolk: not fought */
const NOT_A_FOE = new Set(['folk', 'dummy', 'mother', 'bearer', 'pad', 'deco', 'npc', 'sign', 'chest', 'lamplighter', 'keeper', 'bard', 'oldknight', 'barkeep', 'guests', 'guest', 'fisher', 'squirrel', 'bale', 'fox', 'hare', 'heart', 'gill', 'krakenarm', 'feeler']);
if (process.argv[1] && /audit-hitboxes\.mjs$/.test(process.argv[1])) main().catch(err => { console.error(err); process.exit(1); });
