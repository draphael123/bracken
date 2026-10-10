// tools/duneworm-shots.mjs — THE DUNE WORM in the real page: one picture a beat of his fight, rendered with BK.step (BK.sim does not draw),
// saved at 2x into docs/duneworm/ (SHOTS=<dir> for somewhere else). Each beat is FORCED from his machine's own chain (the harness way, A3), the
// hero put where a player would stand. Reworked by claude/caravan2 (the ledges, the stun, the ward, the sand breath). Not in the suite:
// pictures are for eyes. usage: node tools/duneworm-shots.mjs [name ...]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const out = join(ROOT, process.env.SHOTS || 'docs/duneworm'); mkdirSync(out, { recursive: true });
const want = process.argv.slice(2);
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js'); const want = ${JSON.stringify(want)}, res = [];
    const i = LEVELS.findIndex(l => l.id === 'caravan');
    const snap = (name, note) => { if (want.length && !want.includes(name)) return; const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); res.push([name, c.toDataURL('image/png'), note]); };
    const boot = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.start(); BK.god = true; BK.sim(420); for (const e of BK.enemies()) if (e !== BK.boss && !e.maxHp) e.alive = false; };
    const until = (fn, n = 400) => { for (let k = 0; k < n && !fn(); k++) BK.step(1); };
    boot(); const A = BK.L.arena, P = BK.P, lx = A.x0 + 20 * 16;
    /* 00 the hollow before him */
    BK.tp(Math.round(A.x0 / 16) + 2, Math.round(A.floor / 16) - 1); for (let k = 0; k < 240; k++) BK.step(1); snap('hollow', 'the rim: the sign, the overhang, his quicksand');
    /* 01 he wakes */
    BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); until(() => BK.boss.mode === 'wake', 60); for (let k = 0; k < 40; k++) BK.step(1); snap('wake', 'the name card: he heaves up out of the middle of the hollow');
    const b = BK.boss; until(() => !!b.st && b.mode !== 'wake', 300); const W = b.st;
    /* 02-03 THE LEDGES rising, and standing */
    until(() => W.ledges.some(l => l.state === 'rise' && l.t < 0.55), 200); snap('ledgeRise', 'A LEDGE RISES: the sand cracks along it and it comes up, told, a second long');
    until(() => W.ledges.filter(l => l.state === 'up').length >= 2, 300); W.mode = 'under'; W.t = 5; for (let k = 0; k < 20; k++) BK.step(1); snap('ledges', 'two ledges up: footing, shade, and his opening');
    const force = (idx, stand) => { W.ward = 0; W.mode = 'under'; W.t = 0; W.i = idx; W.order = ['breath', 'lunge', 'swallow', 'sweep']; W.ripples = []; P.hp = P.maxHp; if (stand !== undefined) { P.x = stand; P.y = A.floor; P.vx = 0; } };
    const oneLedge = () => { W.ledgeT = 999; for (const l of W.ledges) if (l.state === 'up') l.t = 0; BK.step(2); W.ledges = [{ id: 501, x0: lx, x1: lx + 48, state: 'rise', t: 0.02, life: 40 }]; BK.step(4); };
    /* 04-06 THE RIPPLE: tracking, committed (the dome), the breach in open sand */
    force(0, A.x0 + 470); until(() => W.mode === 'rippleTell' && W.t < 1.1); snap('ripple', 'THE RIPPLE (!!): the sand runs at you');
    until(() => W.mode === 'rippleTell' && W.ripples.some(q => q.commit) && W.t < 0.25); snap('commit', 'COMMITTED: the dome rises where it locked - move now');
    P.x += 50; until(() => W.mode === 'breach', 60); BK.step(3); snap('breach', 'THE BREACH: up in a column on the locked spot');
    /* 07-08 THE OPENING: the same breach at a ledge's edge - his head hits it: STUNNED; then the ward */
    until(() => W.mode === 'under', 400); oneLedge(); force(0, lx + 10); until(() => W.mode === 'rippleTell' && W.ripples.some(q => q.commit)); P.x = lx - 40; until(() => W.mode === 'stunned', 90); BK.step(30); P.x = W.x - 16; P.face = 1; BK.press('atk'); BK.step(6); snap('stunned', 'THE OPENING: his head hits the ledge - STUNNED, the gold ring and the bar, x1.5');
    until(() => W.mode !== 'stunned', 300); BK.step(20); snap('ward', 'he shakes it off: WARDED (B3), and the cracked ledge goes down');
    /* 09 HIS HIDE: a blow up out of the sand */
    force(1, A.x0 + 400); until(() => W.mode === 'surfaced', 200); BK.step(4); P.x = W.x - 16; P.face = 1; BK.press('atk'); BK.step(8); snap('hide', 'HIS HIDE: a blow clanks - HIDE TOO THICK, MAKE HIM HIT A LEDGE');
    /* 10-11 THE SAND BREATH */
    until(() => W.mode === 'breathTell', 200); P.x = W.x + (W.breathFace || 1) * 70; BK.step(30); snap('breathTell', 'THE SAND BREATH (!): he draws it in, the cone it will take on the sand');
    until(() => W.mode === 'breath', 60); BK.step(16); snap('breath', 'the breath: sand out of his mouth to the floor - a shield takes it, grit in your eyes if not');
    /* 12-13 THE LUNGE */
    force(3, A.x0 + 250); until(() => W.mode === 'lungeTell', 200); BK.step(30); snap('lungeTell', 'THE LUNGE (!!): coiled (+50% longer), his shadow and the count under it');
    until(() => W.mode === 'lunge', 90); BK.step(24); snap('lunge', 'the arc across the hollow, the head coming down on the shadow');
    /* 14 THE SWALLOW */
    force(5, A.x0 + 300); until(() => W.mode === 'swallowTell', 200); BK.step(40); snap('swallow', 'THE SWALLOW (!!): the sinkhole opens under you');
    /* 15-16 PHASE TWO: the storm, and the false ripple */
    until(() => W.mode === 'under', 400); b.hp = Math.floor(b.maxHp * 0.45); force(0, A.x0 + 330); BK.step(2); const cv = BK.caravan();
    until(() => cv.stormNow && cv.stormNow.phase === 'warn' && cv.stormNow.warnLeft < 0.9, 600); snap('stormWarn', 'PHASE TWO: THE STORM, and a third ledge');
    force(0, A.x0 + 330); until(() => cv.stormNow && cv.stormNow.phase === 'gust' && W.mode === 'rippleTell', 900); BK.step(12); snap('stormGust', 'a gust, and the false ripple running beside the real one');
    /* 17 he is dead, and the gate is open */
    until(() => W.mode === 'surfaced' || W.mode === 'breathTell', 600); W.mode = 'stunned'; W.t = 9; b.inv = 0; BKT.hurtEnemy(b, 99999, b.x - 10, false); for (let k = 0; k < 50; k++) BK.step(1); snap('dead', 'THE SAND LIES STILL: the body, and the gate across the hollow open');
    return res;
  })()`, 900000);
  r.forEach(([name, d, note], j) => { writeFileSync(join(out, String(j).padStart(2, '0') + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(String(j).padStart(2, '0') + '-' + name, '-', note); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
