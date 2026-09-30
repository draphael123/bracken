/* tools/queen-court-shots.mjs [out.png] - THE GOBLIN QUEEN'S COURT, PHOTOGRAPHED IN THE REAL PAGE (docs/briefs/goblin-queen-court.md). One contact
   sheet of six frames of the page's own 320x180 buffer (BK.step, so it is drawn): her leap told (her shadow where she lands), her holding court
   beside a pillar with its crack at one blow, at two blows, tottering after the third, pinned under it, and her round-two plate shattering.
   Saved at 2x, 3 x 2 frames, to work/gqueen2/court-sheet.png (or the path given). Not in the suite. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

const file = join(ROOT, process.argv[2] || 'work/gqueen2/court-sheet.png'); mkdirSync(dirname(file), { recursive: true });
const pg = await openPage();
try {
  const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js');
    const sheet = document.createElement('canvas'); sheet.width = 1920; sheet.height = 720; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false; let n = 0;
    const snap = (label) => { const x = (n % 3) * 640, y = Math.floor(n / 3) * 360; sg.drawImage(BK.buf, x, y, 640, 360); sg.fillStyle = 'rgba(0,0,0,0.6)'; sg.fillRect(x, y, 640, 22); sg.fillStyle = '#ffd36b'; sg.font = '16px monospace'; sg.fillText((n + 1) + '. ' + label, x + 8, y + 16); n++; };
    BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.setHero('knight'); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.god = true; BK.sim(60);
    const A = BK.L.arena, q0 = () => BK.boss; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); for (let k = 0; k < 300; k++) { BK.P.hp = BK.P.maxHp; BK.step(1); }
    const q = q0(), p = BK.props().filter(pp => pp.t === 'qpillar').sort((a, b) => a.x - b.x)[1];
    const only = keep => { q.slamT = q.sweepT = q.chandT = q.decreeT = q.throwT2 = q.gLeapT = q.shadowT = q.courtT = q.hLeapT = 99; for (const k of keep) q[k] = 0; q.mode = 'stand'; q.modeT = 0; q.vx = 0; };
    const hold = () => { BK.P.x = p.x - 15; BK.P.vx = 0; BK.P.face = 1; BK.P.hp = BK.P.maxHp; };
    const blow = () => { const n0 = p.blows || 0; for (let i = 0; i < 40 && (p.blows || 0) === n0 && !(p.totter > 0); i++) { hold(); if (BK.P.atk < 0 && i % 2 === 0) BK.press('atk'); BK.step(1); } for (let i = 0; i < 16; i++) { hold(); BK.step(1); } };
    /* 1: her court leap, told: the !! and her shadow beside the pillar */
    q.x = p.x - 150; q.y = A.floor; only(['courtT']); for (let k = 0; k < 60 && q.mode !== 'hallLeapTell'; k++) { hold(); BK.step(1); } for (let k = 0; k < 20; k++) { hold(); BK.step(1); } snap('her leap told: !! and her shadow');
    for (let k = 0; k < 200 && q.mode !== 'point'; k++) { hold(); BK.step(1); } for (let k = 0; k < 20; k++) { hold(); BK.step(1); }
    blow(); snap('she holds court - one blow'); blow(); snap('two blows'); blow(); for (let k = 0; k < 30; k++) { hold(); BK.step(1); } snap('three: it totters');
    for (let k = 0; k < 200 && q.mode !== 'pinned'; k++) { hold(); BK.step(1); } for (let k = 0; k < 30; k++) { hold(); BK.step(1); } snap('it comes down on her: pinned');
    /* round two: her plate, chipped to the last piece, then struck off */
    for (let k = 0; k < 300 && q.mode === 'pinned'; k++) { hold(); BK.step(1); } q.hp = Math.floor(q.maxHp * 0.62); only([]); q.mode = 'rec'; q.modeT = 1; BK.step(2);
    only([]); q.mode = 'point'; q.modeT = 9; q.volleyT = 9; q.x = A.x0 + 260; BK.P.x = q.x - 40; BK.step(1); while (q.plate > 1) { q.chipCd = 0; BK.combat2().strike(q, 'light', 20); }
    q.chipCd = 0; BK.combat2().strike(q, 'light', 20); for (let k = 0; k < 36; k++) { BK.P.x = q.x - 40; BK.P.hp = BK.P.maxHp; BK.step(1); } snap('round two: HER PLATE IS OFF');
    return { png: sheet.toDataURL('image/png'), mode: q.mode, plateOff: !!q.plateOff }; })()`);
  writeFileSync(file, Buffer.from(d.png.split(',')[1], 'base64')); console.log(file, d.mode, d.plateOff);
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
