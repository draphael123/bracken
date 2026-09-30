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
    const { HOUSE } = await import('/src/maskwright-theatre.js'); const X = x => x + HOUSE;
    const secs = [['THE HOUSE', 0, 'teach: facing; the chandelier'], ['STAGE DOOR / STORE', X(0), 'teach: the lamp'], ['DRESSING ROOMS / WORKSHOP', X(34), 'LOCKS: chorus, mirror, fitting'], ['DOCK', X(111), 'teach: flat'], ['FLY TOWER', X(128), 'teach+develop: lines'],
      ['FLY FLOOR / THE PERFORMANCE (in acts) / UNDER-STAGE', X(158), 'twist: lines, lamps, flats'], ['THE WINGS', X(225), 'EXAM (combined)'], ['MAIN STAGE', X(300), 'the Puppeteer']];
    for (const [n, x, b] of secs) { bg.fillStyle = '#4a7ad0'; bg.fillRect(x * 8, 0, 2, big.height); bg.fillStyle = '#e8dcc0'; bg.fillText(n, x * 8 + 4, 2); bg.fillStyle = '#ffd36b'; bg.fillText(b, x * 8 + 4, 14); }
    for (const e of L.ents) { const mk = e.t === 'check' ? '#40e060' : e.t === 'silver' ? '#ffd34a' : null; if (!mk) continue; bg.strokeStyle = mk; bg.lineWidth = 2; bg.strokeRect(e.x * 8 - 6, e.y * 8 + 28 - 10, 16, 16); }
    res.push(['full-level', big.toDataURL('image/png'), 'the whole level, the show running (checkpoints boxed green, silvers gold)']);
    // ---- THE SECTIONS ----
    fresh(); BK.tp(30, 23); P.face = 1; run(40); snap('0-the-house', 'THE HOUSE (THEATRE2): the dress circle and the usher, the chandelier over the raked stalls, the pit beyond');
    fresh(); BK.tp(44, 35); P.face = 1; TH().lines.find(l => l.id === 'CH').out = true; run(200); snap('0b-the-chandelier', 'THE CHANDELIER, struck down on the stalls (it lands on whoever stands under it and stays as a step)');
    fresh(); BK.enemies().filter(e => e.t === 'mummer' && e.x < X(50) * TS).forEach(e => e.alive = false); BK.tp(X(49), 33); P.face = -1; run(60);
    snap('1-costume-store-teach', 'THE COSTUME STORE (teach): the limelight holds the masked player in its pool beside the rope, though the hero has his back to it');
    fresh(); BK.tp(X(52), 24); P.face = 1; run(260); snap('2-the-chorus-lock', 'LOCK ONE, THE CHORUS: the wardrobe keeps sending them out after you, until a lamp on its door plugs it');
    fresh(); BK.tp(X(76), 24); P.face = -1; run(60); snap('2b-the-mirror-room', 'THE MIRROR ROOM: the dresser cannot move while you are in the room with it, whichever way you face');
    fresh(); BK.tp(X(88), 24); P.face = 1; run(40); snap('2c-the-fitting-lock', 'LOCK TWO, THE FITTING: the drop into the workshop between two players; the carvers\' lamp hangs over it');
    fresh(); BK.tp(X(133), 32); run(10); TH().lines.find(l => l.id === 'A').out = true; TH().lines.find(l => l.id === 'B').out = false; run(70);
    snap('3-fly-tower-teach', 'THE FLY TOWER (teach + develop): riding batten A up while batten B comes in to meet it');
    fresh(); BK.tp(X(143), 15); P.face = 1; TH().lines.find(l => l.id === 'D').out = true; run(45); snap('4-fly-floor-twist', 'THE FLY FLOOR (twist): the batten flown into the gap is the bridge, and its sandbag comes down on the crew across it');
    fresh(); BK.tp(X(200), 33); P.face = -1; run(200); snap('5-the-performance', 'THE PERFORMANCE, ACT ONE: the curtain up, the lamps on their cues, the strings on the cast, the audience in the boxes');
    fresh(); BK.tp(X(214), 33); run(20); while (TH().show.t < 17) { P.hp = P.maxHp; BK.sim(10); } BK.tp(X(176), 33); run(20); snap('5b-act-two-the-cloth', 'ACT TWO: the painted cloth flown in as a platform, the scene flat down as a wall, a fuller house');
    fresh(); BK.tp(X(183), 43); P.face = 1; run(80); snap('6-under-stage-twist', 'THE UNDER-STAGE (twist): the floor flat out over the spiked sump on its own cue, an understudy standing on it');
    fresh(); BK.tp(X(240), 33); P.face = 1; run(60); snap('7-the-wings-exam', 'THE WINGS (exam): the prompt box and its floor lamp, the player under it, the flat, the follow spot on the fly rail');
    return res; })()`, 600000);
  for (const [name, d, note] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/theatre/' + name + '.png  -  ' + note); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
