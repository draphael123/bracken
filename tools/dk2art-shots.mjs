// tools/dk2art-shots.mjs - THE DEATH KNIGHT 2's art in the real page (claude/dk2art), for eyes: the boss's price glow + dashed crescent, the crescent, the drain, the
// chapel standards (up / cut / risen), the gold OPEN read, the hook; and the hero's rhythm, kneel, held price and crescent, and the lingering dead.
// -> work/claude/shots/dk2art/*.png. Not in the suite.   PORT=<port> node tools/dk2art-shots.mjs
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/shots/dk2art'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BKT.setHeroLevel('knight', 40); BK.setHero('knight'); BK.reset({ fresh: false }); BK.applyUpgrades && BK.applyUpgrades(); BK.load(LEVELS.findIndex(l => l.id === 'unburied')); BK.state = 'play'; BK.god = true; try { BK.SET.hud = 'off'; } catch (e) {}
    BK.sim(60); const L = BK.L, A = L.arena, P = BK.P;
    const e = BK.dk2().enemies.find(q => q.t === 'bloodknight'); if (!e) return { err: 'no boss' };
    const snap = (name, zoom = 3) => { BK.step(1); const c = document.createElement('canvas'); const W = 200, H = 112; c.width = W * zoom; c.height = H * zoom; const g = c.getContext(' 2d'.trim()); g.imageSmoothingEnabled = false;
      const bw = BK.buf.width, bh = BK.buf.height, sx = window.__sx !== undefined ? window.__sx : Math.round((bw - W) / 2 + 30), sy = Math.round(bh - H - 75);
      g.drawImage(BK.buf, sx, sy, W, H, 0, 0, W * zoom, H * zoom); g.fillStyle = '#fff'; g.font = '12px monospace'; g.fillText(name, 4, 12); res.push([name, c.toDataURL('image/png'), c]); };
    P.x = e.x - 55; P.y = e.y; P.hp = P.maxHp; e.mode = 'stalk'; e.cd = 99; e.face = -1;
    const hold = (mode, o = {}) => { Object.assign(e, { mode, modeT: 5, cd: 99, ...o }); P.hp = P.maxHp; e.hp = Math.max(e.hp, e.maxHp * 0.7); for (let k = 0; k < 8; k++) BK.step(1); Object.assign(e, { mode, modeT: 5, ...o }); BK.step(1); };
    for (let n = 0; n < 6; n += 2) { hold('priceTell', { paidN: n }); snap('boss-price-' + n); }
    hold('crescent', { modeT: 0.3 }); snap('boss-crescent'); hold('crescent', { modeT: 0.2 }); snap('boss-crescent-late');
    hold('spent', { modeT: 1.0, open: 1.0 }); snap('boss-spent-open');
    e.heroX = P.x; e.heroY = P.y; hold('drain', { drinking: true, drainHits: 0, heroX: P.x, heroY: P.y }); snap('boss-drain');
    hold('swingTell', { cutN: 1 }); snap('boss-hook-tell'); hold('cleaveTell', { committed: true }); snap('boss-drag-tell'); hold('cleave'); snap('boss-drag');
    hold('ward', { wardFace: -1, wardFill: 2 }); snap('boss-ward-standards');
    if (e.stds) { const sd = e.stds[0]; window.__sx = 0; P.x = sd.x + 40; P.y = e.y; for (let k = 0; k < 200; k++) { P.x = sd.x + 40; BK.step(1); } hold('ward', { wardFace: -1, wardFill: 2 }); sd.up = true; sd.ft = 9; snap('std-up-feeding', 3); sd.up = false; sd.ft = 0.12; snap('std-falling', 3); sd.ft = 0.3; snap('std-falling2', 3); sd.ft = 2; snap('std-cut', 3); sd.up = true; sd.rose = true; sd.ft = 0.12; snap('std-rising', 3); }
    const cols = 2, cw = res[0][2].width, ch = res[0][2].height, sheet = document.createElement('canvas'); sheet.width = cw * cols; sheet.height = ch * Math.ceil(res.length / cols); const sg = sheet.getContext('2d'); res.forEach((r, i) => sg.drawImage(r[2], (i % cols) * cw, Math.floor(i / cols) * ch)); return { res: res.map(r => [r[0], r[1]]), sheet: sheet.toDataURL('image/png'), stds: !!e.stds, errs: [] }; })()`, 600000);
  if (r.err) throw new Error(r.err);
  for (const [n, d] of r.res) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  writeFileSync(join(out, '_sheet.png'), Buffer.from(r.sheet.split(',')[1], 'base64')); console.log(r.res.length + ' shots, stds ' + r.stds, 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
