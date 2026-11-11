/* tools/hc3art-shots.mjs [outDir] - HIGHCROWN 3 + THE GOBLIN PRINCESS ART, PHOTOGRAPHED IN THE REAL PAGE (claude/hc3art): the page's own 320x180 buffer at 2x to work/claude/shots/hc3art/ (or outDir)
   plus a contact sheet. SPOTS=a,b limits the walk spots; HC3_GROUPS=spots,rooms,chase,fight,cameo picks parts. One headless page. Not in the suite. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const dir = join(ROOT, process.argv[2] || 'work/claude/shots/hc3art'); mkdirSync(dir, { recursive: true });
const SPOTS = [['yard-oven', 264, 63, 'bakehouse oven + sacks'], ['yard-trough', 288, 55, 'quench trough, rack'], ['yard-oven2', 309, 55, 'oven on the upper ledge'], ['yard-sacks', 324, 61, 'sacks + rack'],
  ['stair', 526, 21, 'the stair onto the battlements'], ['walk1', 545, 21, 'wall walk, parapet, far wards'], ['tower1', 561, 21, 'alarm tower 1 passage: door, winch, bell'], ['tower1-roof', 559, 6, 'tower 1 roof: pennants, brazier, loops'],
  ['gap', 580, 21, 'the broken stretch'], ['walk3', 616, 21, 'last stretch to the bell tower'], ['tower2', 606, 21, 'alarm tower 2 passage'], ['tower2-roof', 604, 6, 'tower 2 roof'],
  ['belfry', 631, 21, 'her bell tower room: floor'], ['belfry-land', 636, 18, 'on the belfry landing under the tower bell'], ['belfry-east', 645, 21, 'her guardroom door + inner stair door']];
const GROUPS = process.env.HC3_GROUPS ? process.env.HC3_GROUPS.split(',') : ['spots', 'rooms', 'chase', 'fight', 'cameo'];
const ONLY = process.env.SPOTS ? process.env.SPOTS.split(',') : null; const SP = SPOTS.filter(s => !ONLY || ONLY.includes(s[0]));
const pg = await openPage();
try {
  const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const shots = {}; const G = ${JSON.stringify(GROUPS)};
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cg = cv.getContext('2d'); cg.imageSmoothingEnabled = false;
    const sheet = document.createElement('canvas'); sheet.width = 1920; sheet.height = 360 * 14; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false; let n = 0;
    const snap = (id, label) => { cg.drawImage(BK.buf, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); const x = (n % 3) * 640, y = Math.floor(n / 3) * 360; sg.drawImage(BK.buf, x, y, 640, 360);
      sg.fillStyle = 'rgba(0,0,0,0.6)'; sg.fillRect(x, y, 640, 22); sg.fillStyle = '#ffd36b'; sg.font = '15px monospace'; sg.fillText((n + 1) + '. ' + label, x + 6, y + 16); n++; };
    const fresh = () => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.setHero('knight'); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.god = true; BK.sim(30); for (let k = 0; k < 400; k++) { hold(); BK.step(1); } };
    const hold = () => { if (BK.state === 'card') BK.cardClose(); BK.P.hp = BK.P.maxHp; BK.P.vx = 0; };
    fresh();
    if (G.includes('rooms')) { for (const [id, x, y] of [['capt-a', 436, 19], ['capt-b', 455, 19], ['capt-c', 474, 19], ['banq-a', 483, 25], ['banq-b', 500, 25], ['banq-c', 516, 25]]) { BK.tp(x, y); for (let k = 0; k < 120; k++) { hold(); BK.step(1); } snap(id, id + ' hero ' + Math.round(BK.P.x / 16) + '/' + Math.round(BK.P.y / 16)); } }
    fresh();
    if (G.includes('spots')) for (const [id, x, y, label] of ${JSON.stringify(SP)}) { BK.tp(x, y); for (let k = 0; k < 45; k++) { hold(); BK.step(1); } snap(id, label); }
    if (G.includes('chase')) { fresh(); BK.tp(528, 21); let nn = 0;
      for (let i = 0; i < 60 * 45 && nn < 14; i++) { BK.P.hp = BK.P.maxHp; BK.P.x = Math.min(BK.P.x + 0.5, 600 * 16); BK.step(1); if (i % 150 === 60) { snap('chase-' + String(nn).padStart(2, '0'), 'chase +' + (i / 60).toFixed(1) + 's hero x ' + Math.round(BK.P.x / 16)); nn++; } } }
    if (G.includes('fight')) { fresh(); BK.tp(628, 21); for (let i = 0; i < 100; i++) { hold(); BK.step(1); }
      for (let n2 = 0; n2 < 9; n2++) { const e = BK.enemies().find(q => q.t === 'gprincess'); if (e) BK.P.x = e.x - 34; BK.P.y = 22 * 16; for (let i = 0; i < 40; i++) { BK.P.hp = BK.P.maxHp; BK.step(1); } snap('fight-' + n2, 'fight ' + n2 + ' mode ' + (e ? e.mode : '?')); } }
    if (G.includes('cameo')) { fresh(); const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); let k2 = 0;
      for (let i = 0; i < 170; i++) { BK.P.hp = BK.P.maxHp; BK.step(1); if ([5, 30, 60, 90, 115, 140, 155].includes(i)) { const q = BK.boss; snap('cameo-' + String(k2++).padStart(2, '0'), 'queen intro +' + i + ' mode ' + (q ? q.mode + ' ' + (q.modeT || 0).toFixed(2) : '?')); } } }
    return { shots, sheet: sheet.toDataURL('image/png'), n }; })()`);
  for (const [id, png] of Object.entries(d.shots)) writeFileSync(join(dir, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  writeFileSync(join(dir, 'sheet.png'), Buffer.from(d.sheet.split(',')[1], 'base64'));
  console.log(dir, Object.keys(d.shots).length, 'shots'); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
