// tools/towpath-art-sheet.mjs - THE TOWPATH 2's CAST SHEETS (claude/towpath2art; not in the suite): every pose of THE FOG KNIGHT 2 and THE FOG WRAITH, drawn from the art modules on a dark
// ground at 3x and written to work/claude/towpath2art/knight-sheet.png and wraith-sheet.png (the B16 review: every move its own windup and release pose).
//   PORT=8923 node tools/towpath-art-sheet.mjs [knight|wraith|fx]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const which = process.argv[2] || 'all', SC = +(process.argv[3] || 2), PICK = (process.argv[4] || '').split(',').filter(Boolean);   /* e.g. knight 5 'walk high,cut,empty (open)' */
const pg = await openPage({ audio: false, fonts: false });
try {
  const out = await pg.evalp(`(async()=>{
    const SC = ${SC}, PICK = ${JSON.stringify(PICK)}; const K = await import("/src/redraw/fog_knight_art.js"), W = await import("/src/redraw/fog_wraith_art.js");
    const sheet = (cells, cw, ch, cols, S) => { const rows = Math.ceil(cells.length / cols), c = document.createElement('canvas'); c.width = cw * cols * S; c.height = (ch + 12) * rows * S; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      const cell = document.createElement('canvas'); cell.width = cw; cell.height = ch + 12; const cg = cell.getContext('2d'); cg.imageSmoothingEnabled = false;
      cells.forEach((q, i) => { cg.setTransform(1,0,0,1,0,0); const gr = cg.createLinearGradient(0, 0, 0, ch); gr.addColorStop(0, '#16242c'); gr.addColorStop(1, '#0a1014'); cg.fillStyle = gr; cg.fillRect(0, 0, cw, ch + 12); cg.fillStyle = '#243238'; cg.fillRect(0, ch - 6, cw, 18);
        q.draw(cg, cw, ch - 6); cg.fillStyle = '#c8d8e0'; cg.font = '8px monospace'; cg.fillText(q.name, 3, ch + 8);
        g.drawImage(cell, (i % cols) * cw * S, Math.floor(i / cols) * (ch + 12) * S, cw * S, (ch + 12) * S); }); return c.toDataURL('image/png'); };
    const res = {};
    const kn = (name, o, f = 1) => ({ name, draw: (g, w, y) => K.drawKnight(g, w / 2 - 6, y, f, { stance: 'high', alpha: 1, visor: 1, sag: 0, p: 0.6, ...o }, 1.3) });
    const kcells = [kn('walk high', { mode: 'walk', stance: 'high' }), kn('walk low', { mode: 'walk', stance: 'low' }), kn('walk full', { mode: 'walk', stance: 'full' }), kn('stanceTell', { mode: 'stanceTell', stance: 'low' }),
      kn('cutTell', { mode: 'cutTell' }), kn('cut', { mode: 'cut' }), kn('cutRec', { mode: 'cutRec' }), kn('lungeTell', { mode: 'lungeTell' }), kn('lunge', { mode: 'lunge' }), kn('lungeRec', { mode: 'lungeRec' }),
      kn('lashTell', { mode: 'lashTell' }), kn('lash', { mode: 'lash' }), kn('lashRec', { mode: 'lashRec' }), kn('surgeTell', { mode: 'surgeTell' }), kn('surge', { mode: 'surge' }), kn('surgeRec', { mode: 'surgeRec' }),
      kn('spearTell', { mode: 'spearTell' }), kn('spears', { mode: 'spears' }), kn('spearRec', { mode: 'spearRec' }), kn('sinkTell', { mode: 'sinkTell', p: 0.55 }), kn('plunge', { mode: 'plunge' }), kn('plungeRec', { mode: 'plungeRec' }),
      kn('shroudTell', { mode: 'shroudTell' }), kn('stepTell', { mode: 'stepTell' }), kn('stepCut', { mode: 'stepCut' }), kn('doubleTell', { mode: 'doubleTell' }), kn('MIST DOUBLE', { mode: 'walk', double: true, alpha: 0.62, visor: 0 }),
      kn('empty (open)', { mode: 'empty' }), kn('reel', { mode: 'reel' }), kn('sleep', { mode: 'sleep' }), kn('wake', { mode: 'wake', p: 0.6 }), kn('dissolve', { mode: 'walk', alpha: 0.4 }), kn('hit flash', { mode: 'walk', flash: true }),
      { name: 'death 0.2', draw: (g, w, y) => K.drawDeadPlate(g, w / 2, y, 1, 0.2, 1) }, { name: 'death 0.6', draw: (g, w, y) => K.drawDeadPlate(g, w / 2, y, 1, 0.6, 1) }, { name: 'death heap', draw: (g, w, y) => K.drawDeadPlate(g, w / 2, y, 1, 2, 2) },
      { name: 'chain+hook', draw: (g, w, y) => K.drawChain(g, 10, y - 38, w - 10, y - 20, 1, false) }, { name: 'wave', draw: (g, w, y) => K.drawWave(g, 30, y, 70, 26, 1) }, { name: 'gate crest', draw: (g, w, y) => K.drawGateCrest(g, w / 2, y, 0.6, 1, 70) },
      { name: 'lance + spot', draw: (g, w, y) => { K.drawLance(g, 30, y, 46, 1); K.drawSpearSpot(g, 70, y, 0, 1); K.drawSpearSpot(g, 100, y, 0.5, 1); } }, { name: 'plunge shadow', draw: (g, w, y) => K.drawPlungeShadow(g, w / 2, y, 0.7, 1) }];
    if (${which === 'all' || which === 'knight' || which === 'fx' ? 'true' : 'false'}) res.knight = sheet(PICK.length ? kcells.filter(c => PICK.includes(c.name)) : kcells, 124, 96, PICK.length ? Math.min(4, PICK.length) : 6, SC);
    const wr = (name, o) => ({ name, draw: (g, w, y) => W.drawWraith(g, { hard: 0, face: 1, anim: 0.5, mode: 'drift', ...o }, w / 2 - 4, y, 1) });
    const wcells = [wr('drift A (fog)', { anim: 0.2 }), wr('drift B (fog)', { anim: 1.9 }), wr('hardened A', { hard: 1, anim: 0.2 }), wr('hardened B', { hard: 1, anim: 1.9 }), wr('smother windup 0.2', { hard: 1, mode: 'smotherTell', modeT: 0.64 }), wr('smother windup 0.8', { hard: 1, mode: 'smotherTell', modeT: 0.16 }),
      wr('smother release', { hard: 1, rel: 0.2 }), wr('recoil', { hard: 1, recoil: 0.3, recoil0: 0.6 }), wr('recoil (shielded)', { hard: 1, recoil: 0.6, recoil0: 1.2, shielded: true }), wr('recoil (fog)', { hard: 0, recoil: 0.3, recoil0: 0.6 }),
      ...[0.12, 0.38, 0.62, 0.86].map(u => ({ name: 'death ' + u, draw: (g, w, y) => W.drawDeath(g, w / 2 - 4, y, 1, u) })), { name: 'chill on hero', draw: (g, w, y) => { g.fillStyle = '#7a8aa0'; g.fillRect(w / 2 - 3, y - 20, 6, 20); g.fillStyle = '#c8a070'; g.fillRect(w / 2 - 3, y - 26, 6, 6); W.drawChill(g, w / 2, y, 0.9, 1); } }];
    if (${which === 'all' || which === 'wraith' ? 'true' : 'false'}) res.wraith = sheet(PICK.length ? wcells.filter(c => PICK.includes(c.name)) : wcells, 64, 56, PICK.length ? Math.min(5, PICK.length) : 7, SC > 2 ? SC : 3);
    return res; })()`);
  const dir = join(ROOT, 'work', 'claude', 'towpath2art'); mkdirSync(dir, { recursive: true });
  for (const [k, v] of Object.entries(out)) { writeFileSync(join(dir, k + '-sheet.png'), Buffer.from(v.split(',')[1], 'base64')); console.log('sheet', k); }
  const errs = pg.errors || []; if (errs.length) console.log('PAGE ERRORS', errs.slice(0, 4).join(' | '));
} finally { pg.close(); }
