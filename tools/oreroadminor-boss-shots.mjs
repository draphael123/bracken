// tools/oreroadminor-boss-shots.mjs - THE WINCHMASTER's ORE ARMOUR and his SEND tell, close up (lane claude/oreroadminor, Daniel 10-26: "redraw the ore armour so it sits on his body as real armour, cracks + plates falling as it breaks;
// the launched platform rush ~30% slower with a longer, clearer tell"). usage: PORT=6604 node tools/oreroadminor-boss-shots.mjs <tag> [before]
//   pictures to work/oreroadminor/<tag>/  ('before' takes only the armoured + plating frames, the ones master has)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'boss', before = process.argv[3] === 'before';
const out = join(ROOT, 'work/oreroadminor', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
let n = 0;
const crop = (r = 7) => `(() => { BK.step(1); const v = BK.view, b = BK.boss; const c = document.createElement('canvas'); const W = 150, H = 110; c.width = W * ${r}; c.height = H * ${r}; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const sx = Math.max(0, Math.min(v.VW - W, Math.round(b.x - v.x - W / 2))), sy = Math.max(0, Math.min(v.VH - H, Math.round(b.y - v.y - H * 0.72))); g.drawImage(v.buf, sx, sy, W, H, 0, 0, c.width, c.height); return c.toDataURL('image/png'); })()`;
const save = async (name, r) => { const png = await pg.evalp(crop(r)); const f = String(++n).padStart(2, '0') + '-' + name + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); console.log('shot', 'work/oreroadminor/' + tag + '/' + f); };
const frames = k => pg.evalp(`(async () => { for (let i = 0; i < ${k}; i++) { BK.P.hp = BK.P.maxHp; BK.P.inv = 9; BK.sim(1); } return true; })()`);
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__i = M.LEVELS.findIndex(l => l.id === 'oreroad'); return true; })`);
  await pg.evalp(`(async () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(window.__i); BK.start(); BK.god = true; BK.sim(10); BK.reset();
    const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); for (let k = 0; k < 300 && !BK.bossActive; k++) { BK.P.hp = BK.P.maxHp; BK.sim(1); }
    for (let k = 0; k < 260; k++) { BK.P.hp = BK.P.maxHp; BK.P.inv = 9; const b = BK.boss, d = b ? b.x - BK.P.x : 0; BK.keys.right = d > 60; BK.keys.left = d < -60; BK.sim(1); } BK.keys.right = BK.keys.left = false; return BK.bossActive; })()`);
  /* pin him still on his housing for the pictures: no attacks, no walking */
  const pin = `(() => { const b = BK.boss; b.cd = 99; b.sendCd = b.hookCd = b.leverCd = b.tossCd = b.spillCd = b.revCd = b.leapCd = 99; return b.mode; })()`;
  await pg.evalp(pin); await frames(40); console.log('mode', await pg.evalp(`BK.boss.mode + ' armour=' + BK.boss.armour`));
  await save('armoured');
  await pg.evalp(`(() => { const b = BK.boss; b.armour = false; b.mode = 'plating'; b.modeT = 0.55; return true; })()`); await pg.evalp(`(() => { BK.sim(2); return true; })()`);
  await save('plating-half');
  await pg.evalp(`(() => { const b = BK.boss; b.mode = 'stalk'; b.armour = true; b.armHit = 0; b.cd = 99; return true; })()`); await frames(30);
  if (!before) {
    await pg.evalp(`(() => { BK.boss.armHit = 4; return true; })()`); await frames(20); await save('cracked-1');
    await pg.evalp(`(() => { BK.boss.armHit = 9; return true; })()`); await frames(20); await save('cracked-3');
    await pg.evalp(`(() => { const b = BK.boss; b.armour = false; b.shatT = 0.18; b.shatF = b.face || 1; return true; })()`); await pg.evalp(`(() => { BK.sim(1); return true; })()`); await save('shatter-a');
    await pg.evalp(`(() => { const b = BK.boss; b.shatT = 0.5; return true; })()`); await pg.evalp(`(() => { BK.sim(1); return true; })()`); await save('shatter-b');
    await pg.evalp(`(() => { const b = BK.boss; b.shatT = 0.85; return true; })()`); await pg.evalp(`(() => { BK.sim(1); return true; })()`); await save('shatter-c');
    await pg.evalp(`(() => { const b = BK.boss; b.shatT = 9; b.armour = false; b.mode = 'sendTell'; b.modeT = 0.3; return true; })()`); await pg.evalp(`(() => { BK.sim(1); return true; })()`); await save('send-tell-late', 4);
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
