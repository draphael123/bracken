// tools/theatre-shots.mjs - THE MASKWRIGHT'S THEATRE's pictures (claude/theatre, greybox), for Daniel's look before art. Not in the suite.
//   work/claude/theatre/full-level.png   the whole level drawn by the game itself (frames from BK.look stitched), half size, the sections named
//   work/claude/theatre/1-..7-*.png      one moment a section, rendered with BK.step at 2x
// God mode (a picture, not a playtest). usage: node tools/theatre-shots.mjs
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/theatre'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const TS = 16, res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'theatre'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const TH = () => BK.theatre(), P = BK.P;
    const snap = (name, note) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png'), note]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    // ---- THE WHOLE LEVEL: the show running (the curtain up, the lamps on), stitched from the game's own frames ----
    fresh(); const S = TH().show; S.on = true; S.lift = 1; for (const s of TH().spots) s.off = false; BK.sim(30);
    const L = BK.L, W = L.W * TS, H = L.H * TS, big = document.createElement('canvas'); big.width = W / 2; big.height = H / 2 + 28; const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false;
    bg.fillStyle = '#0c0a10'; bg.fillRect(0, 0, big.width, big.height);
    const VW = BK.view.VW, VH = BK.view.VH;
    for (let y = 0; y < H + VH; y += VH - 20) for (let x = 0; x < W + VW; x += VW - 20) { const v = BK.look(Math.min(L.W - 2, Math.floor((x + VW / 2) / TS)), Math.min(L.H - 2, Math.floor((y + VH * 0.6) / TS)));
      bg.drawImage(BK.buf, 0, 0, VW, VH, v.cx / 2, v.cy / 2 + 28, VW / 2, VH / 2); }
    bg.fillStyle = '#0c0a10'; bg.fillRect(0, 0, big.width, 28); bg.font = 'bold 11px monospace'; bg.textBaseline = 'top';
    const secs = [['THE STAGE DOOR', 0, 'teach: facing'], ['THE COSTUME STORE', 28, 'teach: the lamp'], ['THE MASK WORKSHOP', 65, 'develop: lamps'], ['DOCK', 111, 'teach: flat'], ['FLY TOWER', 128, 'teach+develop: lines'],
      ['FLY FLOOR / THE PERFORMANCE / UNDER-STAGE', 158, 'twist: lines, lamps, flats'], ['THE WINGS', 225, 'EXAM'], ['MAIN STAGE', 300, 'the Puppeteer']];
    for (const [n, x, b] of secs) { bg.fillStyle = '#4a7ad0'; bg.fillRect(x * 8, 0, 2, big.height); bg.fillStyle = '#e8dcc0'; bg.fillText(n, x * 8 + 4, 2); bg.fillStyle = '#ffd36b'; bg.fillText(b, x * 8 + 4, 14); }
    for (const e of L.ents) { const mk = e.t === 'check' ? '#40e060' : e.t === 'silver' ? '#ffd34a' : null; if (!mk) continue; bg.strokeStyle = mk; bg.lineWidth = 2; bg.strokeRect(e.x * 8 - 6, e.y * 8 + 28 - 10, 16, 16); }
    res.push(['full-level', big.toDataURL('image/png'), 'the whole level, the show running (checkpoints boxed green, silvers gold)']);
    // ---- THE SECTIONS ----
    fresh(); BK.enemies().filter(e => e.t === 'mummer' && e.x < 50 * TS).forEach(e => e.alive = false); BK.tp(49, 33); P.face = -1; run(60);
    snap('1-costume-store-teach', 'THE COSTUME STORE (teach): the limelight holds the masked player in its pool though the hero has his back to it');
    fresh(); BK.tp(80, 33); P.face = 1; run(60); snap('2-mask-workshop-develop', 'THE MASK WORKSHOP (develop): three players on two floors, the carvers\\' lamp on the mezzanine');
    fresh(); BK.tp(133, 32); run(10); TH().lines.find(l => l.id === 'A').out = true; TH().lines.find(l => l.id === 'B').out = false; run(70);
    snap('3-fly-tower-teach', 'THE FLY TOWER (teach + develop): riding batten A up while batten B comes in to meet it; the sandbags go the other way');
    fresh(); BK.tp(143, 15); P.face = 1; TH().lines.find(l => l.id === 'D').out = true; run(45); snap('4-fly-floor-twist', 'THE FLY FLOOR (twist): the batten flown into the gap is the bridge, and its sandbag comes down on the crew across it');
    fresh(); BK.tp(200, 33); P.face = -1; run(200); snap('5-the-performance', 'THE PERFORMANCE (the set piece): the curtain up, the lamps on their cues, the cast frozen in the light, the audience in the boxes');
    fresh(); BK.tp(183, 43); P.face = 1; TH().flats[2].to = TH().flats[2].b; run(80); snap('6-under-stage-twist', 'THE UNDER-STAGE (twist): the flat that is a floor, slid out over the spiked sump; the trap rooms overhead');
    fresh(); BK.tp(241, 33); P.face = 1; run(60); snap('7-the-wings-exam', 'THE WINGS (exam): the lamp under the prompt box, the flat door, batten G to the loading gallery');
    return res; })()`, 600000);
  for (const [name, d, note] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/theatre/' + name + '.png  -  ' + note); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
