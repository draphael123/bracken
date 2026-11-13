// tools/cf4-stills.mjs - CF4 proof stills (claude/cf4proof). node tools/cf4-stills.mjs <outdir>
// Wood level, knight: damage-number pop frames, heavy + gold kill number, chip bar mid-drain, low HP at 20% (two pulse phases), heal flash + green lead, a number at the view's right edge.
// Each still = the 320x180 frame x3 (no smoothing) plus an x8 crop of the interesting corner. Lab only; not in the suite.
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2] || 'work/cf4-stills'; mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
const E = (e, t = 120000) => pg.evalp(e, t);
const shot = async (name, crop) => { const url = await E(`(() => { const b = BK.view.buf, k = ${crop ? 8 : 3}, r = ${JSON.stringify(crop || [0, 0, 320, 180])}, c = document.createElement('canvas'); c.width = r[2] * k; c.height = r[3] * k; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(b, r[0], r[1], r[2], r[3], 0, 0, c.width, c.height); return c.toDataURL('image/png'); })()`);
  writeFileSync(OUT + '/' + name + '.png', Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + name); };
const setup = on => E(`(async () => { const C = await import('/src/cf-hud.js'); C.setCF4(${on}); const { LEVELS } = await import('/src/level.js'); BK.SET.flashes = true; BK.SET.vignette = true; BK.SET.reduceMotion = false; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.start(); BK.sim(420); BK.step(2); BK.P.inv = 0; return { ships: C.CF4_SHIPS, hp: BK.P.hp, max: BK.P.maxHp }; })()`);
const foe = () => E(`(() => { const d = BK.dk2(); const e = d.enemies.find(q => q.alive); if (!e) return null; d.spawn && 0; return { t: e.t, x: e.x, y: e.y, hp: e.hp }; })()`);
try {
  for (const on of [false, true]) {
    const tag = on ? 'on' : 'off'; console.log(tag, JSON.stringify(await setup(on)), 'foe', JSON.stringify(await foe()));
    /* numbers: a light hit, a heavy hit, a kill, via the real hurtEnemy path; frames 0, 2, 4, 7 after the first hit */
    await E(`(() => { const d = BK.dk2(), P = BK.P, es = d.enemies.filter(q => q.alive); BK.__es = es; const e = es[0]; e.hp = 9999; P.x = e.x - 18; P.y = e.y - 4; P.vx = P.vy = 0; P.inv = 99; BK.step(90); P.x = e.x - 18; BK.env().hurt(e, 12, P.x); BK.step(1); })()`);
    const cam = await E(`(() => ({ cx: BK.camX && BK.camX(), px: BK.P.x, py: BK.P.y }))()`); console.log(JSON.stringify(cam));
    await shot(tag + '-num-f1-full'); await shot(tag + '-num-f1-crop', [80, 80, 120, 70]);
    await E(`BK.step(2)`); await shot(tag + '-num-f3-crop', [80, 80, 120, 70]);
    await E(`BK.step(4)`); await shot(tag + '-num-f7-crop', [80, 80, 120, 70]);
    await E(`(() => { const e = BK.__es[0]; BK.env().hurt(e, 30, BK.P.x); BK.step(1); })()`); await shot(tag + '-heavy-f1-crop', [80, 80, 120, 70]);
    await E(`BK.step(10)`); await shot(tag + '-heavy-f11-crop', [80, 80, 120, 70]);
    await E(`(() => { const e = BK.__es[0]; e.hp = 5; BK.env().hurt(e, 20, BK.P.x); BK.step(1); })()`); await shot(tag + '-kill-f1-crop', [80, 80, 120, 70]); await E('BK.step(11)'); await shot(tag + '-kill-f12-crop', [80, 80, 120, 70]); await E('BK.step(12)'); await shot(tag + '-kill-f24-crop', [80, 80, 120, 70]);
    /* chip bar: lose 40% at once, frames 1 / 30 (held) / 45 (draining) */
    await setup(on);
    await E(`(() => { BK.P.hp = BK.P.maxHp; BK.step(3); BK.P.hp = BK.P.maxHp * 0.55; BK.step(1); })()`); await shot(tag + '-chip-f1-crop', [0, 0, 100, 24]);
    await E(`BK.step(30)`); await shot(tag + '-chip-f31-crop', [0, 0, 100, 24]);
    await E(`BK.step(15)`); await shot(tag + '-chip-f46-crop', [0, 0, 100, 24]);
    /* low HP 20%, two phases of the pulse */
    await E(`(() => { BK.P.hp = BK.P.maxHp * 0.2; BK.step(10); })()`); await shot(tag + '-low-a-full'); await E(`BK.step(25)`); await shot(tag + '-low-b-full');
    /* heal: green lead + flash frame */
    await E(`(() => { BK.P.hp = Math.min(BK.P.maxHp, BK.P.hp + BK.P.maxHp * 0.4); BK.step(1); })()`); await shot(tag + '-heal-f1-crop', [0, 0, 100, 24]); await E(`BK.step(6)`); await shot(tag + '-heal-f7-crop', [0, 0, 100, 24]);
    /* a number at the right view edge */
    await setup(on);
    await E(`(() => { const e = BK.dk2().enemies.find(q => q.alive); e.hp = 9999; const P = BK.P; P.inv = 99; P.x = e.x + 18; P.y = e.y - 4; BK.step(90); BK.env().hurt(e, 30, P.x); BK.step(1); })()`); await shot(tag + '-edge-full');
  }
} finally { console.log('errors', JSON.stringify(pg.errors.slice(0, 5))); pg.close(); }
