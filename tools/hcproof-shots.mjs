/* tools/hcproof-shots.mjs [outDir] - HCPROOF: the three things hc3art never drew IN-GAME, photographed in the real page with REAL swings (BK.press('atk')): the guardroom
   gate DOWN after three timed winch blows, the bell tower's hatch (shut / open on her escape), and the murder holes (loaded / mid-fall / spent). One headless page, not in the suite.
   Writes work/claude/shots/hcproof/ (or outDir) one PNG each (640x360, the page's 320x180 buffer at 2x) and sheet.png. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const dir = join(ROOT, process.argv[2] || 'work/claude/shots/hcproof'); mkdirSync(dir, { recursive: true });
const pg = await openPage();
try {
  const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const shots = {}; const log = [];
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cg = cv.getContext('2d'); cg.imageSmoothingEnabled = false;
    const sheet = document.createElement('canvas'); sheet.width = 1920; sheet.height = 360 * 8; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false; let n = 0;
    const snap = (id, label) => { cg.drawImage(BK.buf, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); const x = (n % 3) * 640, y = Math.floor(n / 3) * 360; sg.drawImage(BK.buf, x, y, 640, 360);
      sg.fillStyle = 'rgba(0,0,0,0.6)'; sg.fillRect(x, y, 640, 22); sg.fillStyle = '#ffd36b'; sg.font = '15px monospace'; sg.fillText((n + 1) + '. ' + label, x + 6, y + 16); n++; };
    const hold = () => { if (BK.state === 'card') BK.cardClose(); BK.P.hp = BK.P.maxHp; };
    const fresh = () => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.setHero('knight'); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.god = true; BK.sim(30); for (let k = 0; k < 400; k++) { hold(); BK.step(1); } };
    const run = k => { for (let i = 0; i < k; i++) { hold(); BK.step(1); } };
    const swing = () => { BK.press('atk'); run(14); };
    /* 1. THE GUARDROOM GATE: start the chase on the wall walk, wait for tower 1's alarm, stand at its winch, three blows 1 s apart */
    fresh(); BK.tp(528, 21); let alarm = false;
    for (let i = 0; i < 60 * 40 && !alarm; i++) { BK.P.hp = BK.P.maxHp; BK.P.x = Math.min(BK.P.x + 0.5, 556 * 16); BK.step(1); const nums = (BK.numbers && BK.numbers()) || []; if (i > 60 && i % 30 === 0) { alarm = !!(window.__gpTW && window.__gpTW()); } if (i % 60 === 0) log.push('chase x ' + Math.round(BK.P.x / 16)); if (BK.P.x >= 556 * 16) alarm = true; }
    BK.tp(559, 21); BK.P.face = -1; run(20); snap('gate-0-alarm', 'tower 1: her alarm rung, the guardroom door RISING, hero at the winch');
    for (let b = 1; b <= 3; b++) { BK.P.face = -1; BK.P.x = 559 * 16 + 8; swing(); run(40); snap('gate-' + b + '-blow', 'winch blow ' + b + ' of 3 (real swing)'); }
    run(30); snap('gate-4-down', 'after the third blow: the gate DOWN, guards kept in');
    /* 2. THE HATCH: shut in the fight, open on her escape */
    fresh(); BK.tp(628, 21); run(100);
    const gp = () => BK.enemies().find(q => q.t === 'gprincess'); BK.P.x = (gp() ? gp().x : 636 * 16) - 40; run(20);
    const hx = gp() ? 0 : 0; snap('hatch-0-shut', 'bell tower: the roof hatch SHUT (she is up and fighting)');
    const e = gp(); if (e) { e.hp = Math.round(e.maxHp * 0.13); BK.P.x = e.x - 30; BK.P.y = e.y; for (let i = 0; i < 400 && gp() && gp().mode !== 'escape'; i++) { hold(); BK.P.x = gp().x - 24; BK.P.y = gp().y; BK.P.face = 1; BK.P.vx = 0; BK.P.vy = 0; BK.press('atk'); run(10); } }
    const ee = gp(); log.push('princess mode ' + (ee ? ee.mode : 'gone')); for (const k of [4, 20, 20, 30]) { run(k); snap('hatch-' + n, 'her escape: mode ' + (gp() ? gp().mode : 'gone') + ' (hatch open as she goes)'); }
    /* 3. THE MURDER HOLES: all six loaded; #1 struck for real (mid-fall, spent) */
    fresh(); const holes = BK.props().filter(p => p.t === 'murderhole').sort((a, b) => a.n - b.n); log.push('holes ' + holes.map(h => h.n + '@' + Math.round(h.x / 16) + '/' + Math.round(h.y0 / 16)).join(' '));
    for (const h of holes) { BK.tp(Math.round(h.x / 16), Math.round(h.y0 / 16) - 1); run(30); snap('hole-' + h.n + '-loaded', 'murder hole #' + h.n + ' LOADED'); }
    const h1 = holes[0]; if (h1) { BK.tp(Math.round(h1.x / 16), Math.round(h1.y0 / 16) - 1); BK.P.x = h1.x; BK.P.y = h1.y0; BK.P.vy = 0; run(6); log.push('hero ' + Math.round(BK.P.x) + '/' + Math.round(BK.P.y) + ' slot ' + Math.round(h1.x) + '/' + h1.y0 + ' ground ' + BK.P.ground); swing(); log.push('after swing loaded ' + h1.loaded + ' stone ' + !!h1.stone); for (const k of [3, 6]) { run(k); snap('hole-1-fall-' + k, 'hole #1 struck: stone ' + (h1.stone ? 'mid-fall y ' + Math.round(h1.stone.y / 16) : 'gone')); } run(120); snap('hole-1-spent', 'hole #1 SPENT (reloading ' + h1.reload.toFixed(1) + ' s)'); }
    return { shots, sheet: sheet.toDataURL('image/png'), n, log }; })()`);
  for (const [id, png] of Object.entries(d.shots)) writeFileSync(join(dir, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  writeFileSync(join(dir, 'sheet.png'), Buffer.from(d.sheet.split(',')[1], 'base64'));
  console.log(dir, Object.keys(d.shots).length, 'shots'); console.log(d.log.join('\n')); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
