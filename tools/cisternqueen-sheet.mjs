// tools/cisternqueen-sheet.mjs - THE CISTERN QUEEN's poses on one sheet, every told move, on the cistern's own dark floor (claude/welltown-polish). Not in the suite.
// drawQueen (src/redraw/cistern_queen_art.js) is pure on (e, S): this builds a fake e and S per pose and draws it, so no fight has to be waited for.
//   node tools/cisternqueen-sheet.mjs [tag=after] [cols=3] [sel]   -> work/claude/welltown-polish/<tag>/queen-sheet-N.png (2 x scale; sel = comma list of pose names to render alone)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', cols = +(process.argv[3] || 3), sel = (process.argv[4] || '').split(',').filter(Boolean);
const out = join(ROOT, 'work/claude/welltown-polish', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{ const A = await import('/src/redraw/cistern_queen_art.js'); const sel = ${JSON.stringify(sel)}, cols = ${cols}, res = [];
    const base = { x: 100, y: 0, face: 1, flash: 0, guardFx: 0, gone: 0, mode: 'walk', modeT: 0.6 };
    const S0 = () => ({ pose: 'floor', wall: 'W', flood: false, cur: {}, water: 0, bands: [], rubble: [], shots: [], puddles: [], claw: null, mound: null });
    const P = [
      ['01 guard (walk)', {}, {}], ['02 pincer told', { mode: 'pincerTell' }, {}], ['03 pincer', { mode: 'pincer' }, {}],
      ['04 snap told', { mode: 'snapTell' }, {}], ['05 lunge told', { mode: 'lungeTell' }, {}], ['06 lunge', { mode: 'lunge' }, {}],
      ['07 tail lance told', { mode: 'lanceTell' }, {}], ['08 tail lance', { mode: 'lance' }, { cur: { x: 160 } }], ['09 sand flick told', { mode: 'flickTell' }, {}],
      ['10 sting told', { mode: 'barbTell' }, {}], ['11 venom spit told', { mode: 'spitTell' }, {}], ['12 sweep low told', { mode: 'sweepLowTell' }, {}],
      ['13 sweep high told', { mode: 'sweepHighTell' }, {}], ['14 sweep', { mode: 'sweepLow' }, {}], ['15 wall slam told', { mode: 'slamTell' }, {}],
      ['16 stinger pin told', { mode: 'pinTell' }, {}], ['17 stinger stuck', { mode: 'pinned' }, {}], ['18 pounce told', { mode: 'pounceTell', gone: 0 }, {}],
      ['19 on the wall (W)', { mode: 'cling' }, { pose: 'wall', wall: 'W' }], ['20 on the wall (E) spit told', { mode: 'spitTell' }, { pose: 'wall', wall: 'E' }],
      ['21 in the shaft', { mode: 'cling' }, { pose: 'shaft' }], ['22 grab told', { mode: 'grabTell' }, {}], ['23 grab', { mode: 'grab' }, { claw: { reach: 14 } }],
      ['24 wave told', { mode: 'waveTell' }, {}], ['25 tidal tail told', { mode: 'tidalTell' }, {}], ['26 death roll told', { mode: 'rollTell' }, {}],
      ['27 death roll', { mode: 'roll' }, {}], ['28 soaked (open)', { mode: 'soaked', open: 3 }, {}], ['29 on her back (open)', { mode: 'fallen', open: 3 }, {}],
      ['30 rearing (open)', { mode: 'rear', open: 3 }, {}], ['31 recover', { mode: 'recover' }, {}], ['32 flooded guard', { mode: 'walk' }, { flood: true }],
    ].filter(p => !sel.length || sel.some(s => p[0].includes(s)));
    const CW = 300, CH = 190, rows = Math.ceil(P.length / cols), sc = document.createElement('canvas'); sc.width = CW * cols; sc.height = CH * rows; const g = sc.getContext('2d'); g.imageSmoothingEnabled = false;
    P.forEach(([name, eo, so], i) => { const cx = (i % cols) * CW, cy = Math.floor(i / cols) * CH, fy = cy + CH - 30;
      /* the cistern's own dark: a blue-grey hall, a darker floor, the arch's stone */
      g.fillStyle = '#16202c'; g.fillRect(cx, cy, CW, CH); g.fillStyle = '#1d2a38'; for (let k = 0; k < 6; k++) g.fillRect(cx + 10 + k * 50, cy + 10, 26, CH - 50); g.fillStyle = '#26323f'; g.fillRect(cx, fy, CW, CH - (fy - cy));
      g.fillStyle = '#323f4d'; g.fillRect(cx, fy, CW, 2);
      const e = Object.assign({}, base, eo), S = Object.assign(S0(), so);
      g.save(); g.beginPath(); g.rect(cx, cy, CW, CH); g.clip();
      A.drawQueen(g, e, S, cx + 130, fy, 1.3 + i * 0.07, 0, 0); g.restore();
      g.fillStyle = '#e8e0cc'; g.font = '10px monospace'; g.fillText(name, cx + 6, cy + 14); });
    const so = document.createElement('canvas'); so.width = sc.width * 2; so.height = sc.height * 2; const og = so.getContext('2d'); og.imageSmoothingEnabled = false; og.drawImage(sc, 0, 0, so.width, so.height); res.push(['queen-sheet', so.toDataURL('image/png')]);
    /* her bestiary card frames, on the dark */
    const set = A.bakeCisternQueen(), cc = document.createElement('canvas'); cc.width = 200 * 3; cc.height = 130 * 2; const cg = cc.getContext('2d'); cg.imageSmoothingEnabled = false; cg.fillStyle = '#16202c'; cg.fillRect(0, 0, cc.width, cc.height);
    set.R.forEach((f, i) => cg.drawImage(f, i * 200, 0)); const co = document.createElement('canvas'); co.width = cc.width * 2; co.height = cc.height * 2; const cog = co.getContext('2d'); cog.imageSmoothingEnabled = false; cog.drawImage(cc, 0, 0, co.width, co.height); res.push(['queen-card-frames', co.toDataURL('image/png')]);
    return res; })()`, 300000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/welltown-polish/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
