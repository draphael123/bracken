/* tools/highcrown2-shots.mjs [outDir] - HIGHCROWN 2 (claude/highcrown2), PHOTOGRAPHED IN THE REAL PAGE: the new pieces of the level and the Queen's new
   move, one frame each of the page's own 320x180 buffer (BK.step, so it is drawn), saved at 2x to work/claude/shots/highcrown2/ (or outDir) with a
   contact sheet. For the art lane (what it has to draw) and the report. Not in the suite. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const dir = join(ROOT, process.argv[2] || 'work/claude/shots/highcrown2'); mkdirSync(dir, { recursive: true });
const SPOTS = [['start', 8, 63, 'the gatehouse passage: the start, the kitchen port shut behind'], ['winch-gate', 18, 63, 'a) the bailey gate on its winch, the hound behind it'],
  ['ward-bell', 64, 63, 'c) the ward bell, the grate arch, the barracks door'], ['barracks', 84, 63, 'the barracks: the watch, the ward key, the bunk silver'],
  ['crag-walk', 143, 47, 'the crag walk: its sentry and bell; the tower gate past the breach'], ['vestibule', 242, 63, 'b) the vestibule: two gate towers, the champion, the bell'],
  ['hall-floor', 372, 63, 'd) the tall hall: the floor and its chandeliers'], ['hall-gallery', 404, 45, 'the east gallery, the ladder, the hung landings'],
  ['hall-landings', 380, 41, 'the hung landings to the west balcony'], ['stair-head', 358, 31, 'the stair head: the hall bell and its grate']];
const pg = await openPage();
try {
  const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const shots = {};
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cg = cv.getContext('2d'); cg.imageSmoothingEnabled = false;
    const sheet = document.createElement('canvas'); sheet.width = 1920; sheet.height = 1440; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false; let n = 0;
    const snap = (id, label) => { cg.drawImage(BK.buf, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); const x = (n % 3) * 640, y = Math.floor(n / 3) * 360; sg.drawImage(BK.buf, x, y, 640, 360);
      sg.fillStyle = 'rgba(0,0,0,0.6)'; sg.fillRect(x, y, 640, 22); sg.fillStyle = '#ffd36b'; sg.font = '15px monospace'; sg.fillText((n + 1) + '. ' + label, x + 6, y + 16); n++; };
    BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.setHero('knight'); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.god = true; BK.sim(30);
    for (const [id, x, y, label] of ${JSON.stringify(SPOTS)}) { BK.tp(x, y); for (let k = 0; k < 45; k++) { BK.P.hp = BK.P.maxHp; BK.P.vx = 0; BK.step(1); } snap(id, label); }
    /* THE GOBLIN QUEEN RINGS HER BELL: forced in round two, the hero by the grate - the tell, then the grate down */
    const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); for (let k = 0; k < 300; k++) { BK.P.hp = BK.P.maxHp; BK.step(1); }
    const q = BK.boss, b = BK.props().find(p => p.t === 'winch' && p.bell && p.bossGate), gx = b.gate * 16 + 8;
    q.phase = 2; q.plate = 6; q.plateOff = false; q.hp = Math.floor(q.maxHp * 0.6); q.x = gx + 130; q.mode = 'stand'; q.modeT = 0; q.ringT = 0;
    for (const k of ['slamT', 'sweepT', 'chandT', 'decreeT', 'throwT2', 'gLeapT', 'shadowT', 'courtT', 'hLeapT']) q[k] = 99;
    for (let i = 0; i < 120 && q.mode !== 'ringTell'; i++) { BK.P.x = gx - 20; BK.P.vx = 0; BK.P.hp = BK.P.maxHp; BK.step(1); } for (let i = 0; i < 30; i++) { BK.P.x = gx - 20; BK.P.hp = BK.P.maxHp; BK.step(1); } snap('gq-ring-tell', 'the Queen rings her bell: told (the grate glows)');
    for (let i = 0; i < 60 && !(b.open > 0); i++) { BK.P.x = gx - 20; BK.P.hp = BK.P.maxHp; BK.step(1); } for (let i = 0; i < 12; i++) { BK.P.hp = BK.P.maxHp; BK.step(1); } snap('gq-ring-down', '...and the grate comes down by the hero');
    return { shots, sheet: sheet.toDataURL('image/png') }; })()`);
  for (const [id, png] of Object.entries(d.shots)) writeFileSync(join(dir, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  writeFileSync(join(dir, 'sheet.png'), Buffer.from(d.sheet.split(',')[1], 'base64'));
  console.log(dir, Object.keys(d.shots).length, 'shots'); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
