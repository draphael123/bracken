// tools/paladin-art-shots.mjs - THE PALADIN's fight pictures (claude/churchart; not in the suite): god mode, the hero stands in the sanctuary and the fight runs; a crop round him every 0.25 s.
//   usage: PORT=8742 node tools/paladin-art-shots.mjs <tag> [seconds]   -> work/claude/church-art/<tag>/pal-NN-<mode>.png (2x crops) and pal-sheet.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'pal', secs = +(process.argv[3] || 16);
const out = join(ROOT, 'work/claude/church-art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'church')); BK.state = 'play'; BK.god = true; BK.sim(4); BK.tp(248, 40); for (let i = 0; i < 40; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); }
    const sheet = document.createElement('canvas'); const N = ${secs} * 4, cols = 6, cw = 200, ch = 150; sheet.width = cols * cw; sheet.height = Math.ceil(N / cols) * ch; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false; sg.fillStyle = '#222'; sg.fillRect(0, 0, sheet.width, sheet.height);
    for (let n = 0; n < N; n++) { for (let i = 0; i < 15; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1);
      const b = BK.boss; if (!b) continue; const Pp = BK.P, cx = Math.round(BK.view.VW / 2 + (b.x - Pp.x)), cy = Math.round(BK.view.VH * 0.6 + (b.y - Pp.y)); const sx = Math.max(0, Math.min(BK.view.VW - 100, cx - 50)), sy = Math.max(0, Math.min(BK.view.VH - 75, cy - 62));
      sg.drawImage(BK.buf, sx, sy, 100, 75, (n % cols) * cw, Math.floor(n / cols) * ch, cw, ch); sg.fillStyle = '#ffd36b'; sg.font = '10px monospace'; sg.fillText(String(b.mode), (n % cols) * cw + 4, Math.floor(n / cols) * ch + 12); }
    res.push(['pal-sheet', sheet.toDataURL('image/png')]); return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/church-art/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
