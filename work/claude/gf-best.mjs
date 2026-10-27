import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const tag = process.argv[2] || 'before'; const out='work/claude/shots-gormfinish';
const pg = await openPage({ audio: false, fonts: true });
try {
  const r = await pg.evalp(`(async () => {
    const src = await (await fetch('/src/main.js')).text(); const body = src.slice(src.indexOf('const BEASTS = ['), src.indexOf('const BOSS_T'));
    const ts = []; { const re = new RegExp("\{ t: '([a-z0-9]+)', name:", 'g'); let m; while ((m = re.exec(body))) ts.push(m[1]); } const k0 = src.indexOf('const BOSS_T = ['), bt = src.slice(k0 + 16, src.indexOf(']', k0)).split(',').map(x => x.trim().replace(/'/g, ''));
    const list = ts.filter(t => bt.includes(t)), i = list.indexOf('king');
    BKT.PROG.beasts = BKT.PROG.beasts || {}; for (const q of ts) BKT.PROG.beasts[q] = { seen: true, slain: 3 };
    const shots = [];
    BK.state = 'bestiary'; BK.step(2); BK.ui.bestTab = 1; BK.ui.bestI = i; for (let k = 0; k < 40; k++) BK.step(1);
    const grab = () => { const c = document.createElement('canvas'); c.width = 330; c.height = 120; c.getContext('2d').drawImage(BK.view.buf, 0, 0, 330, 120, 0, 0, 330, 120); return c; };
    for (let n = 0; n < 4; n++) { for (let k = 0; k < 9; k++) BK.step(1); const c = document.createElement('canvas'); c.width = BK.view.VW; c.height = BK.view.VH; c.getContext('2d').drawImage(BK.view.buf, 0, 0); shots.push(c.toDataURL('image/png')); }
    return { i, n: list.length, shots }; })()`, 120000);
  console.log(r.i, r.n); r.shots.forEach((d, k) => writeFileSync(out + '/bestiary-king-' + tag + '-' + k + '.png', Buffer.from(d.split(',')[1], 'base64')));
} finally { await pg.close(); }
