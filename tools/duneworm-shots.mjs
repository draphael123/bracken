// tools/duneworm-shots.mjs — THE DUNE WORM in the real page: one picture a beat of his fight, rendered with BK.step (BK.sim does not draw),
// saved at 2x into docs/duneworm/. Each beat is FORCED from his machine's own chain (the harness way, A3), the hero put where a player would
// stand. Not in the suite: pictures are for eyes. usage: node tools/duneworm-shots.mjs [name ...]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const out = join(ROOT, 'docs/duneworm'); mkdirSync(out, { recursive: true });
const want = process.argv.slice(2);
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js'); const want = ${JSON.stringify(want)}, res = [];
    const i = LEVELS.findIndex(l => l.id === 'caravan');
    const snap = (name, note) => { if (want.length && !want.includes(name)) return; const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); res.push([name, c.toDataURL('image/png'), note]); };
    const boot = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.start(); BK.god = true; BK.sim(420); for (const e of BK.enemies()) if (e !== BK.boss && !e.maxHp) e.alive = false; };
    const until = (fn, n = 400) => { for (let k = 0; k < n && !fn(); k++) BK.step(1); };
    boot(); const A = BK.L.arena, P = BK.P, w = BK.caravan().winches.find(q => q.hollow), mid = (w.canopy.x0 + w.canopy.x1 + 1) * 8;
    /* 00 the hollow before him: the winch, the great shade rolled out, the sign on the rim */
    BK.tp(Math.round(A.x0 / 16) + 2, Math.round(A.floor / 16) - 1); for (let k = 0; k < 240; k++) BK.step(1); snap('hollow', 'the rim: the sign, the shade out over the middle of the hollow');
    /* 01 he wakes */
    BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); until(() => BK.boss.mode === 'wake', 60); for (let k = 0; k < 40; k++) BK.step(1); snap('wake', 'the name card: he heaves up out of the middle of the hollow');
    const b = BK.boss; until(() => !!b.st && b.mode !== 'wake', 300); const W = b.st;
    const force = (idx, stand) => { W.mode = 'under'; W.t = 0; W.i = idx; W.order = ['spit', 'lunge', 'swallow']; W.ripples = []; P.hp = P.maxHp; if (stand !== undefined) { P.x = stand; P.y = A.floor; P.vx = 0; } };
    /* 02-04 THE RIPPLE: tracking, committed (the dome), the breach */
    force(0, A.x0 + 110); w.out = w.k = 0; until(() => W.mode === 'rippleTell' && W.t < 1.1); snap('ripple', 'THE RIPPLE (!!): the sand runs at you');
    until(() => W.mode === 'rippleTell' && W.ripples.some(q => q.commit) && W.t < 0.25); snap('commit', 'COMMITTED: the dome rises where it locked - move now');
    P.x += 50; until(() => W.mode === 'breach', 60); BK.step(3); snap('breach', 'THE BREACH: up in a column on the locked spot');
    /* 05 THE OPENING: the same breach under the rolled-out shade */
    until(() => W.mode === 'under', 400); w.out = w.k = 1; force(0, mid); until(() => W.mode === 'rippleTell' && W.ripples.some(q => q.commit)); P.x = mid + 50; until(() => W.mode === 'tangled', 90); BK.step(20); snap('tangled', 'THE OPENING: up into the canvas - TANGLED, double damage, and the awning is down');
    /* 06 the winch wound out again */
    until(() => W.mode === 'under', 400); P.x = w.x - 10; P.face = 1; BK.press('atk'); for (let k = 0; k < 40; k++) BK.step(1); snap('winch', 'THE HOLLOW WINCH: strike it and the shade rolls out again');
    /* 07-08 THE SPIT */
    force(1, A.x0 + 400); until(() => W.mode === 'spitTell', 200); P.x = W.x + 60; BK.step(18); snap('spitTell', 'THE SPIT (!): reared back, throat lit');
    until(() => W.mode === 'spit', 60); BK.step(10); snap('spit', 'the fan of sand clots: a shield takes it');
    /* 09-10 THE LUNGE */
    force(3, A.x0 + 250); until(() => W.mode === 'lungeTell', 200); BK.step(20); snap('lungeTell', 'THE LUNGE (!!): coiled, and his shadow where he will land');
    until(() => W.mode === 'lunge', 60); BK.step(24); snap('lunge', 'the arc across the hollow, the head coming down on the shadow');
    /* 11 THE SWALLOW */
    force(5, A.x0 + 300); until(() => W.mode === 'swallowTell', 200); BK.step(30); snap('swallow', 'THE SWALLOW (!!): the sinkhole opens under you');
    /* 12-13 PHASE TWO: the storm, and the false ripple */
    until(() => W.mode === 'under', 400); b.hp = Math.floor(b.maxHp * 0.45); force(0, A.x0 + 330); BK.step(2); const cv = BK.caravan();
    until(() => cv.stormNow && cv.stormNow.phase === 'warn' && cv.stormNow.warnLeft < 0.9, 600); snap('stormWarn', 'PHASE TWO: THE STORM. The warning: the arrow, THE WIND and the count');
    force(0, A.x0 + 330); until(() => cv.stormNow && cv.stormNow.phase === 'gust' && W.mode === 'rippleTell', 900); BK.step(12); snap('stormGust', 'a gust, and the false ripple running beside the real one');
    /* 14 he is dead, and the gate is open */
    until(() => W.mode === 'surfaced' || W.mode === 'spitTell', 600); b.inv = 0; BKT.hurtEnemy(b, 99999, b.x - 10, false); for (let k = 0; k < 50; k++) BK.step(1); snap('dead', 'THE SAND LIES STILL: the body, and the gate across the hollow open');
    return res;
  })()`, 900000);
  r.forEach(([name, d, note], j) => { writeFileSync(join(out, String(j).padStart(2, '0') + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(String(j).padStart(2, '0') + '-' + name, '-', note); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
