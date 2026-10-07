// tools/colossus-art-shots.mjs - THE GLASS COLOSSUS's MOTION as pictures (claude/colossus3 ART lane; not in the suite). god mode, hero hidden, the boss forced into a move and then PLAYED (the real sim, 60 steps a second).
//   usage: PORT=8719 node tools/colossus-art-shots.mjs <outdir> [name-filter,...]   -> <outdir>/sheet-<move>.png (a strip of crops of the giant, each labelled with the seconds since the move began)
//                                                                              and <outdir>/still-<name>.png (the whole game view, 2x, for a few moments)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
const out = resolve(ROOT, process.argv[2] || 'work/claude/colossus-art'), filt = process.argv[3] || ''; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const filt = ${JSON.stringify(filt)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'glasssea');
    const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); BK.tp(612, 33); for (let i = 0; i < 90; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } };
    const CW = 250, CH = 252, PER = 6;
    const TT = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.1, 2.6];
    /* a move: { name, ph, mode, dur (its tell, for modeT), pre(e,S), times: [s] } */
    const MOVES = [
      { name: 'idle', ph: 1, mode: 'idle', times: [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 3.6, 4.0, 4.4] },
      { name: 'wake', ph: 1, mode: 'wake', dur: 1.6, sleep: 1, times: TT },
      { name: 'lanceWind', ph: 1, mode: 'lanceTell', dur: 1.65, pre: (e, S) => { e.face = -1; S.lance = { dir: -1, end: { x: S.G.x0 + 4, mirror: -1 } }; }, times: [0, 0.15, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.62, 1.66, 1.7] },
      { name: 'lanceFire', ph: 1, mode: 'lanceTell', dur: 1.65, pre: (e, S) => { e.face = -1; S.lance = { dir: -1, end: { x: S.G.x0 + 4, mirror: -1 } }; }, times: [1.62, 1.68, 1.75, 1.85, 2.0, 2.2, 2.5, 2.9, 3.3, 3.7, 4.2, 4.8] },
      { name: 'stomp', ph: 1, mode: 'stompTell', dur: 0.72, pre: (e) => { e.face = -1; }, times: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.72, 0.77, 0.85, 1.0, 1.25, 1.6] },
      { name: 'sweep', ph: 1, mode: 'sweepTell', dur: 0.75, pre: (e, S) => { e.face = -1; S.sweep = { dir: -1, x: S.G.x0 + 6, id: 1, live: false }; }, times: [0, 0.2, 0.4, 0.6, 0.74, 0.85, 1.0, 1.15, 1.3, 1.5, 1.7, 2.1] },
      { name: 'shards', ph: 1, mode: 'shardTell', dur: 0.85, pre: (e, S) => { S.marks = [-60, 0, 60].map(d => ({ x: S.G.cx + 170 + d, y: S.G.floor })); }, times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 0.88, 0.95, 1.05, 1.2, 1.5, 2.0] },
      { name: 'quake', ph: 2, mode: 'quakeTell', dur: 0.9, pre: (e, S) => { S.plates = [-76, 0, 76].map(d => ({ x: S.G.cx - 150 + d, dir: -1 })); }, times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.88, 0.93, 1.0, 1.1, 1.4, 2.0] },
      { name: 'crack', ph: 2, mode: 'crackTell', dur: 1.15, pre: (e, S) => { e.face = -1; S.crack = { dir: -1, from: S.G.cx - 30, to: S.G.cx - 200, id: 1, front: null }; }, times: [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.14, 1.2, 1.3, 1.5, 1.9, 2.5] },
      { name: 'shake', ph: 1, mode: 'shakeTell', dur: 0.85, pre: (e, S) => { S.shakeCd = 99; }, times: [0, 0.2, 0.4, 0.6, 0.8, 0.88, 1.0, 1.2, 1.5, 1.75, 2.0, 2.5] },
      { name: 'wave', ph: 3, mode: 'waveTell', dur: 0.85, pre: (e, S) => { S.waveDir = 1; }, times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0, 1.15, 1.3, 1.6, 2.0, 2.6] },
      { name: 'phase-night', ph: 2, mode: 'phase', dur: 2.2, prev: 1, times: [0, 0.2, 0.4, 0.7, 1.0, 1.3, 1.6, 1.9, 2.15, 2.4, 2.9, 3.4] },
      { name: 'phase-dawn', ph: 3, mode: 'phase', dur: 2.2, prev: 2, times: [0, 0.2, 0.4, 0.7, 1.0, 1.3, 1.6, 1.9, 2.15, 2.4, 2.9, 3.4] },
      { name: 'open-chest', ph: 1, mode: 'cracked', open: 5.2, pre: (e, S) => { S.mirrors[0].notch = 'face'; S.lastReflect = 0; }, times: [0, 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1.5, 3.0, 5.0] },
      { name: 'open-shoulders', ph: 2, mode: 'blazing', open: 5.6, pre: (e, S) => { S.mirrors[0].notch = 'fire'; }, times: [0, 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1.5, 3.0, 5.0] },
      { name: 'open-crown', ph: 3, mode: 'dazzled', open: 5.4, pre: (e, S) => { S.mirrors[1].notch = 'sky'; }, times: [0, 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1.5, 3.0, 5.0] },
      { name: 'palettes', ph: 1, mode: 'idle', palettes: [1, 2, 3] },
    ];
    const snapFull = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push(['still-' + name, c.toDataURL('image/png')]); };
    const STILLS = { lanceWind: [1.3], lanceFire: [1.75], stomp: [0.77], sweep: [1.0], crack: [1.2], quake: [0.93], 'phase-night': [0.7], shards: [0.95], 'open-chest': [0.5] };
    const crop = (e, S) => { const camx = BK.cam[0], camy = BK.cam[1], c = document.createElement('canvas'); c.width = CW; c.height = CH; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#000'; g.fillRect(0, 0, CW, CH);
      g.drawImage(BK.buf, Math.round(e.x - camx - CW / 2), Math.round(S.G.floor - camy - CH + 10), CW, CH, 0, 0, CW, CH); return c; };
    const compose = (name, frames, labels) => { const rows = Math.ceil(frames.length / PER), sheet = document.createElement('canvas'); sheet.width = CW * Math.min(PER, frames.length); sheet.height = (CH + 14) * rows; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false; sg.fillStyle = '#10141c'; sg.fillRect(0, 0, sheet.width, sheet.height); sg.font = '11px monospace';
      frames.forEach((c, i) => { const x = (i % PER) * CW, y = Math.floor(i / PER) * (CH + 14); sg.drawImage(c, x, y + 14); sg.fillStyle = '#ffd36b'; sg.fillText(name + ' ' + labels[i], x + 4, y + 11); }); res.push(['sheet-' + name, sheet.toDataURL('image/png')]); };
    for (const m of MOVES) { if (filt && !filt.split(',').some(q => m.name.includes(q))) continue;
      fresh(); BK.hideHero = true; BK.look(612, 33);
      const CO = BK.colossusHands(), S = CO.show(), e = BK.boss, setPh = p => { S.ph = p; e.phase = p; };
      e.mode = 'idle'; S.cd = 99; for (let i = 0; i < 150; i++) { BK.sim(1); if (i % 10 === 0) BK.step(1); } BK.step(1);   /* the arena camera settles, the wake is over */
      if (m.palettes) { const frames = [], labels = []; for (const p of m.palettes) { setPh(p); e.mode = 'idle'; S.cd = 99; for (let i = 0; i < 40; i++) BK.sim(1); BK.step(1); frames.push(crop(e, S)); labels.push('phase ' + p); } compose(m.name, frames, labels); continue; }
      setPh(m.ph); S.cd = 99;
      if (m.sleep) { e.mode = 'sleep'; for (let i = 0; i < 20; i++) BK.sim(1); BK.step(1); }
      if (m.prev) { setPh(m.prev); e.mode = 'idle'; for (let i = 0; i < 40; i++) BK.sim(1); BK.step(1); setPh(m.ph); }
      if (m.ph > 1 && !m.prev) { for (let i = 0; i < 240; i++) { BK.sim(1); S.cd = 99; if (i % 20 === 0) BK.step(1); } }   /* the hour's light settles first */
      e.mode = m.mode; if (m.dur) e.modeT = m.dur; if (m.open) { e.open = m.open; e.openT0 = m.open; } if (m.pre) m.pre(e, S); S.cd = 99;
      const frames = [], labels = [], t0 = S.t; let guard = 0;   /* the move's own clock (S.t), not the frame count: the fight runs on its own time scale */
      for (const tt of m.times) { while (S.t - t0 < tt - 0.009 && guard++ < 6000) { BK.sim(1); S.cd = 99; } BK.step(1); frames.push(crop(e, S)); labels.push((S.t - t0).toFixed(2) + 's ' + e.mode); if ((STILLS[m.name] || []).includes(tt)) snapFull(m.name + '-' + tt.toFixed(2)); }
      compose(m.name, frames, labels); }
    return res; })()`, 1800000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(join(out, name + '.png')); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
