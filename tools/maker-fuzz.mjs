/* tools/maker-fuzz.mjs (claude/maker) - THE MAKER UNDER A THOUSAND RANDOM HANDS. A seeded run of random editor actions (any piece
   anywhere, erase, box erase, undo / redo, styles, slopes, warps, tracks, wider / taller, copy / paste, goals, a boss linked, PLAY
   for a moment and back, MY LEVELS open). After every action the level must still be a level: the grid the right size, every
   piece and the START inside it, no NaN anywhere; in play no platform or foe at NaN; and the page logs no errors.
   node tools/maker-fuzz.mjs [ops=400] [seed=1] */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const OPS = +(process.argv[2] || 400), SEED = +(process.argv[3] || 1);
const pg = await openPage({ port: portFor(17), audio: false, seed: SEED });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'), U = await import('/src/maker-ui.js'), LIB = await import('/src/maker-library.js'); MKR.enter(); U.closePanel();
    let s = ${SEED} * 2654435761 >>> 0; const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }, ri = n => Math.floor(rnd() * n), pick = a => a[ri(a.length)];
    const items = U.GROUPS.flatMap(g => g.items || []); window.confirm = () => true; window.prompt = () => 'FUZZ';
    const d0 = MKR.blank(90, 28); d0.name = 'FUZZ'; d0.hero = 'knight'; MKR.doc = d0; MKR.mount();
    const bad = [], log = [];
    const check = (op) => { const d = MKR.doc, why = [];
      if (!d || d.grid.length !== d.W * d.H) why.push('grid ' + (d && d.grid.length) + ' != ' + (d && d.W * d.H));
      for (const e of d.ents) if (!(e.x >= 0 && e.x < d.W && e.y >= 0 && e.y < d.H) || !isFinite(e.x) || !isFinite(e.y)) why.push('piece out ' + e.t + ' ' + e.x + ',' + e.y);
      if (d.start && !(d.start.x >= 0 && d.start.x < d.W && d.start.y >= 0 && d.start.y < d.H)) why.push('start out');
      for (const w of d.water || []) if (!(w.x0 <= w.x1 && w.y0 <= w.y1)) why.push('water box flipped');
      if (why.length) bad.push(op + ': ' + why.join('; ')); };
    const cell = () => ({ x: 1 + ri(MKR.doc.W - 2), y: 1 + ri(MKR.doc.H - 2) });
    const ops = {
      place() { const it = pick(items); if (it.cat === 3) return; MKR.select(it.cat, it.i); const c = cell(); MKR.place(c.x, c.y); return 'place ' + it.cat + ':' + it.i + ' @' + c.x + ',' + c.y; },
      stroke() { const it = pick(items.filter(q => q.cat === 0)); MKR.select(0, it.i); const c = cell(); for (let k = 0; k < 6; k++) MKR.place(Math.min(MKR.doc.W - 2, c.x + k), c.y); return 'stroke ' + it.i; },
      erase() { const c = cell(); MKR.select(0, 0); U.setEraseMode(false, pick(['all', 'ground', 'pieces', 'foes'])); MKR.place(c.x, c.y); return 'erase'; },
      box() { const a = cell(), b = cell(); MKR.eraseBox(a, b, pick(['all', 'ground', 'pieces', 'foes'])); return 'box erase'; },
      undo() { MKR.undo(); return 'undo'; }, redo() { MKR.redo(); return 'redo'; },
      style() { MKR.act({ act: 'style', style: pick(P.STYLES) }); return 'style'; },
      ramp() { const a = cell(), b = cell(); P.rampStart(a); P.rampEnd(MKR.doc, b); MKR.mount(); return 'ramp'; },
      size() { MKR.act({ act: pick(['width+', 'width-', 'height+', 'height-']) }); return 'size'; },
      paste() { const a = cell(), b = cell(); P.selStart(a); P.selMove(b); P.selEnd(); P.copySel(MKR.doc); P.startPaste(); P.pasteAt(MKR.doc, cell()); P.selClear(); MKR.mount(); return 'paste'; },
      track() { const m = MKR.doc.ents.find(e => e.t === 'mover'); if (!m) return; const say = () => {}; P.trackClick(MKR.doc, { x: m.x, y: m.y }, say); for (let k = 0; k < 1 + ri(4); k++) P.trackClick(MKR.doc, cell(), say); P.trackClick(MKR.doc, { x: m.x, y: m.y }, say); P.trackEnd(); MKR.mount(); return 'track'; },
      link() { const b = MKR.doc.ents.find(e => P.isBoss(e.t)), g = MKR.doc.ents.find(e => e.t === 'gate'); if (!b || !g) return; P.linkClick(MKR.doc, b, () => {}); P.linkClick(MKR.doc, g, () => {}); return 'link boss'; },
      goal() { MKR.doc.goal = pick(P.GOALS); return 'goal'; },
      start() { const c = cell(); MKR.startAt(c.x, c.y); return 'start'; },
      play() { const d = MKR.doc; if (!d.start || !d.ents.some(e => e.t === 'gate')) { d.start = d.start || { x: 3, y: 2 }; d.ents.push({ t: 'gate', x: d.W - 4, y: 2 }); MKR.mount(); }
        MKR.play(); if (BK.state !== 'play') return 'play refused'; BK.god = true; BK.step(60); BK.god = false;
        const nanM = BK.movers().filter(m => !isFinite(m.x) || !isFinite(m.y)).length, nanE = BK.enemies().filter(e => e.alive && (!isFinite(e.x) || !isFinite(e.y))).length;
        if (nanM || nanE || !isFinite(BK.P.x)) bad.push('play: NaN movers ' + nanM + ' foes ' + nanE + ' knight ' + BK.P.x);
        MKR.resume(); U.closePanel(); return 'play'; },
      library() { MKR.autosave(true); const L = LIB.list(); if (L.length) MKR.act({ act: 'libOpen', id: pick(L).id }); U.closePanel(); return 'library'; },
    };
    const W = { place: 8, stroke: 4, erase: 4, box: 2, undo: 3, redo: 2, style: 1, ramp: 2, size: 1, paste: 1, track: 1, link: 1, goal: 1, start: 1, play: 2, library: 1 }, bag = Object.entries(W).flatMap(([k, n]) => Array(n).fill(k));
    for (let n = 0; n < ${OPS}; n++) { const k = pick(bag); let label = k; try { label = ops[k]() || k; } catch (e) { bad.push(k + ' threw: ' + String(e && e.message || e).slice(0, 160)); } log.push(label); check(label); if (bad.length > 12) break; }
    return { ran: log.length, bad, ents: MKR.doc.ents.length, W: MKR.doc.W, H: MKR.doc.H };
  })()`, 900000);
  console.log(JSON.stringify(r).slice(0, 3000));
  assert.deepEqual(r.bad, [], 'the fuzz broke the level: ' + r.bad.join(' | '));
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.slice(0, 8).join(' | '));
  console.log('maker-fuzz: ' + r.ran + ' random actions (seed ' + SEED + ') and the level stayed whole, played without NaN, and the page logged nothing.');
} finally { pg.close(); }
