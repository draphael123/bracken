// tools/ft2-shots.mjs — THE FALLING TOWER, ROUND 2 (docs/briefs/falling-tower-round2.md): before/after pictures of the places the
// round touches, rendered with BK.step (BK.sim does not draw) and saved at 2x into work/ft2/<tag>/. God mode; the hero stood at each
// spot and given a second and a half to settle. The last pictures are of the sky fight (the carpet boarded, the Archmage awake) and,
// when the level has one, of where the portal puts you once he is down. Not in the suite: pictures are for eyes.
// usage: node tools/ft2-shots.mjs <tag> [name ...]      e.g.  node tools/ft2-shots.mjs before
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const tag = process.argv[2] || 'after', want = process.argv.slice(3);
const out = join(ROOT, 'work/ft2', tag); mkdirSync(out, { recursive: true });
/* [name, column, row the hero stands on, what the picture is for] */
const SPOTS = [
  ['library', 30, 299, 'the library floor: the ledges, the windows'], ['library-stair', 27, 293, 'the stair and the lesson ledge'],
  ['reading', 24, 263, 'the Reading Room'], ['orrery-gallery', 24, 218, 'the observers\' gallery'], ['orrery-high', 44, 214, 'the failing stair'],
  ['pendulum', 44, 191, 'the pendulum gallery'], ['cistern', 14, 149, 'the cistern'], ['loft-deck', 36, 117, 'the Sexton\'s deck, a ringers\' walk'],
  ['loft-pier', 22, 117, 'the Sexton\'s deck, the left walk'], ['loft-high', 30, 98, 'the upper loft'], ['crown', 30, 83, 'the crown'], ['crown-high', 30, 62, 'the crown, high'],
  ['parapet', 31, 50, 'the parapet and the door'],
];
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js'); const want = ${JSON.stringify(want)}, res = [];
    const snap = (name, note) => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); res.push([name, c.toDataURL('image/png'), note]); };
    const ok = n => !want.length || want.includes(n);
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'fallingtower')); BK.start(); BK.god = true; for (let k = 0; k < 300; k++) BK.step(1);
    for (const [name, x, row, note] of ${JSON.stringify(SPOTS)}) { if (!ok(name)) continue;
      BK.tp(x, row - 1); BK.P.face = 1; for (let k = 0; k < 90; k++) BK.step(1); snap(name, note);
      for (const A of (BK.ambushes ? BK.ambushes() : [])) if (A.st && A.st !== 'done') { for (const e of A.foes || []) e.alive = false; A.st = 'done'; } }
    /* THE SKY FIGHT: through the door on the parapet, the fight started, a look low in the room and a look high */
    if (ok('fight') || ok('fight-low') || ok('after-portal')) {
      BK.tp(36, 49); for (let k = 0; k < 20; k++) BK.step(1); BK.board && BK.board(); for (let k = 0; k < 150; k++) BK.step(1); snap('fight', 'the sky fight, the carpet boarded');
      for (let k = 0; k < 90; k++) { BK.keys.down = true; BK.step(1); } BK.keys.down = false; for (let k = 0; k < 10; k++) BK.step(1); snap('fight-low', 'the bottom of his room');
      for (let k = 0; k < 70; k++) { BK.keys.up = true; BK.keys.right = true; BK.step(1); } BK.keys.up = BK.keys.right = false; for (let k = 0; k < 30; k++) BK.step(1); snap('fight-mid', 'mid-fight');
      const b = BK.boss; if (b) { BK.god = true; b.hp = 1; BKT.hurtEnemy(b, 50, b.x - 10, false); } for (let k = 0; k < 240; k++) BK.step(1); snap('portal-open', 'he is down: the way out opens');
      const S = BK.L.sanctum, o = S && S.out; if (o) { BK.P.x = o.x; BK.P.y = o.y; } for (let k = 0; k < 150; k++) BK.step(1); snap('after-portal', 'through the way out');
      for (let k = 0; k < 120; k++) { BK.keys.right = true; BK.step(1); } BK.keys.right = false; for (let k = 0; k < 30; k++) BK.step(1); snap('after-walk', 'walking on');
    }
    return res;
  })()`, 900000);
  r.forEach(([name, d, note], j) => { writeFileSync(join(out, String(j).padStart(2, '0') + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(tag + '/' + String(j).padStart(2, '0') + '-' + name, '-', note); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
