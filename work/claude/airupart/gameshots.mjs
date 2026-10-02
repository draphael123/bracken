// work/claude/airupart/gameshots.mjs <out.png> - THE REAL GAME: each hero's air up-slash at four beats (atk ~0.03 / 0.08 / 0.13 / 0.20 s), the 320x180 buffer
// cropped round him at 4x, 7 heroes x 4 beats, the crescent smear included.
import { openPage } from '../../../tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const [out = 'game.png'] = process.argv.slice(2);
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1;
    const yard = LEVELS.findIndex(l => l.id === 'trial_open'), none = () => { for (const k in BK.keys) BK.keys[k] = false; };
    const heroes = ['knight','warden','pyro','paladin','pirate','reaper','geomancer'], beats = [0.03, 0.08, 0.13, 0.2], Z = 4, CW = 96, CH = 84;
    const cv = document.createElement('canvas'); cv.width = beats.length * CW * Z; cv.height = heroes.length * CH * Z; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#222'; g.fillRect(0, 0, cv.width, cv.height);
    for (let r = 0; r < heroes.length; r++) { const hero = heroes[r];
      none(); BK.setHero(hero); BK.load(yard); BK.state = 'play'; BK.god = true; for (const e of BK.enemies()) e.alive = false; BK.tp(10, 21); BK.sim(40); BK.reset(); BK.sim(5);
      const P = BK.P; P.face = 1; P.st = P.maxSt; P.vx = 0; BK.press('jump'); BK.keys.jump = true; BK.sim(16); BK.keys.up = true; BK.press('atk');
      let b = 0; for (let i = 0; i < 30 && b < beats.length; i++) { BK.step(1); if (P.atk >= beats[b] && P.swingKind === 'airUp') {
        const px = Math.round(P.x - BK.view.x), py = Math.round(P.y - BK.view.y);
        g.drawImage(BK.view.buf, px - CW / 2, py - CH + 20, CW, CH, b * CW * Z, r * CH * Z, CW * Z, CH * Z); b++; } }
      none(); }
    return cv.toDataURL('image/png'); })()`);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote', out);
  if (pg.errors.length) console.log(pg.errors.slice(0, 3));
} finally { pg.close(); }
