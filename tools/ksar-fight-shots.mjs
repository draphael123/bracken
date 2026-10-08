// tools/ksar-fight-shots.mjs - THE HAWK-MISTRESS's body and hawk in her modes (claude/ksar art pass; not in the suite): god mode, forced modes, a picture not a fight.
//   usage: PORT=8704 node tools/ksar-fight-shots.mjs [tag]   -> work/claude/ksar-art/<tag>/fight-*.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'fight', out = join(ROOT, 'work/claude/ksar-art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'ksar'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4);
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    BK.tp(601, 33); run(200);
    const e = BK.boss, H = BK.hawkMistressHands(); if (!e || !H) return [['err', 'data:,no boss ' + !!e + !!H]];
    BK.god = true; const hold = (mode, name, f) => { e.mode = mode; e.modeT = 99; e.face = -1; if (f) f(); BK.state = 'play'; BK.tp(e.x / 16 - 4, 33); BK.look(e.x - 60, e.y - 10); run(3); e.modeT = 99; BK.state = 'play'; BK.look(e.x - 60, e.y - 10); run(2); snap(name); };
    hold('walk', 'fight-walk'); hold('lashTell', 'fight-lashTell'); hold('lash', 'fight-lash'); hold('cutTell', 'fight-cutTell'); hold('cut', 'fight-cut'); hold('whistle', 'fight-whistle', () => { e.open = 3; });
    hold('feintHold', 'fight-feint'); hold('recover', 'fight-recover');
    const S = H.show(); for (const m of ['circle', 'wheel', 'blind', 'home', 'dive', 'spot']) { S.hawk.mode = m; S.hawk.t = 99; e.mode = 'walk'; e.modeT = 99; BK.state = 'play'; BK.tp(e.x / 16 - 5, 33); BK.look(e.x - 80, e.y - 40); run(6); BK.state = 'play'; snap('hawk-' + m); }
    return res; })()`, 400000);
  for (const [name, d] of r) { if (name === 'err') { console.log(d); continue; } writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/ksar-art/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
