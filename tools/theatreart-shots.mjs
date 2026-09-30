// tools/theatreart-shots.mjs - THE MASKWRIGHT'S THEATRE after its art pass (claude/theatreart): stills, in-motion strips and the full-level image, into work/claude/theatreart/.
//   node tools/theatreart-shots.mjs [--only=name,name]      (no --only: every still and strip; the full-level image is --only=full-level)
//   STILLS  one moment a section, rendered with BK.step at 2x (god mode: a picture, not a playtest)
//   STRIPS  a few frames of one moment side by side, each frame labelled with its second: curtain-up, ride-the-weight, the chandelier drop, a scene change in act two, the trap
// Not in the suite. Nothing is downloaded; the page is the game's own.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/theatreart'); mkdirSync(out, { recursive: true });
const only = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const { HOUSE } = await import('/src/maskwright-theatre.js'); const TS = 16, res = [], want = ${JSON.stringify(only)}, all = !want.length;
    const X = x => x + HOUSE;
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'theatre'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const TH = () => BK.theatre(), P = BK.P;
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const cvs = () => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); return c; };
    const on = name => all ? name !== 'full-level' : want.includes(name);
    const snap = (name, note) => { res.push([name, cvs().toDataURL('image/png'), note]); };
    const strip = (name, note, n, every, after1) => { const W = BK.view.VW, H = BK.view.VH, cols = Math.min(n, 3), rows = Math.ceil(n / cols); const big = document.createElement('canvas'); big.width = W * cols + (cols - 1) * 3; big.height = H * rows + (rows - 1) * 3; const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.fillStyle = '#000'; bg.fillRect(0, 0, big.width, big.height); bg.font = 'bold 9px monospace'; bg.textBaseline = 'top';
      let t = 0; for (let i = 0; i < n; i++) { if (i === 1 && after1) after1(); if (i > 0) { for (let k = 0; k < every; k++) { BK.sim(1); if (k % 3 === 0) BK.step(1); t += 1 / 60; } } BK.step(1); const cx0 = (i % cols) * (W + 3), cy0 = Math.floor(i / cols) * (H + 3); bg.drawImage(BK.buf, 0, 0, W, H, cx0, cy0, W, H); bg.fillStyle = 'rgba(0,0,0,0.6)'; bg.fillRect(cx0, cy0, 30, 10); bg.fillStyle = '#ffe08a'; bg.fillText(t.toFixed(1) + 's', cx0 + 2, cy0 + 1); }
      res.push([name, big.toDataURL('image/png'), note]); };
    if (on('full-level') || (all && false)) { fresh(); const S = TH().show; S.on = true; S.lift = 1; for (const s of TH().spots) s.off = false; BK.sim(30);
      const L = BK.L, W = L.W * TS, H = L.H * TS, big = document.createElement('canvas'); big.width = W / 2; big.height = H / 2 + 28; const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false;
      bg.fillStyle = '#0c0a10'; bg.fillRect(0, 0, big.width, big.height); const VW = BK.view.VW, VH = BK.view.VH;
      for (let y = 0; y < H + VH; y += VH - 20) for (let x = 0; x < W + VW; x += VW - 20) { const v = BK.look(Math.min(L.W - 2, Math.floor((x + VW / 2) / TS)), Math.min(L.H - 2, Math.floor((y + VH * 0.6) / TS))); bg.drawImage(BK.buf, 0, 0, VW, VH, v.cx / 2, v.cy / 2 + 28, VW / 2, VH / 2); }
      bg.fillStyle = '#0c0a10'; bg.fillRect(0, 0, big.width, 28); bg.font = 'bold 11px monospace'; bg.textBaseline = 'top';
      const secs = [['THE HOUSE', 0], ['STAGE DOOR / STORE', X(0)], ['DRESSING ROOMS / WORKSHOP', X(34)], ['DOCK', X(111)], ['FLY TOWER', X(128)], ['FLY FLOOR / PERFORMANCE / UNDER-STAGE', X(158)], ['THE WINGS', X(225)], ['MAIN STAGE (the Puppeteer)', X(300)]];
      for (const [n, x] of secs) { bg.fillStyle = '#4a7ad0'; bg.fillRect(x * 8, 0, 2, big.height); bg.fillStyle = '#e8dcc0'; bg.fillText(n, x * 8 + 4, 8); }
      res.push(['full-level', big.toDataURL('image/png'), 'the whole level after art, the show running']); }
    if (on('0-the-house')) { fresh(); BK.tp(30, 23); P.face = 1; run(40); snap('0-the-house', 'THE HOUSE: the dress circle, the usher, the raked stalls, the boxes behind'); }
    if (on('0a-the-foyer')) { fresh(); BK.tp(6, 33); P.face = 1; run(20); snap('0a-the-foyer', 'THE FOYER'); }
    if (on('0b-the-pit')) { fresh(); BK.tp(50, 41); P.face = 1; run(30); snap('0b-the-pit', 'THE PIT: music stands, the kettle drums'); }
    if (on('1-costume-store-teach')) { fresh(); BK.enemies().filter(e => e.t === 'mummer' && e.x < X(50) * TS).forEach(e => e.alive = false); BK.tp(X(49), 33); P.face = -1; run(60); snap('1-costume-store-teach', 'THE COSTUME STORE: the limelight holds the masked player in its pool'); }
    if (on('1b-the-dressing-room')) { fresh(); BK.tp(X(40), 24); P.face = 1; run(60); snap('1b-the-dressing-room', 'THE DRESSING ROOMS and the wardrobe'); }
    if (on('2-the-chorus-lock')) { fresh(); BK.tp(X(52), 24); P.face = 1; run(260); snap('2-the-chorus-lock', 'LOCK ONE, THE CHORUS'); }
    if (on('2b-the-mirror-room')) { fresh(); BK.tp(X(76), 24); P.face = -1; run(60); snap('2b-the-mirror-room', 'THE MIRROR ROOM'); }
    if (on('2c-the-fitting-lock')) { fresh(); BK.tp(X(88), 24); P.face = 1; run(40); snap('2c-the-fitting-lock', 'LOCK TWO, THE FITTING'); }
    if (on('2d-the-mask-workshop')) { fresh(); BK.tp(X(100), 33); P.face = 1; run(40); snap('2d-the-mask-workshop', 'THE MASK WORKSHOP: masks on the walls'); }
    if (on('3-fly-tower-teach')) { fresh(); BK.tp(X(133), 32); run(10); TH().lines.find(l => l.id === 'A').out = true; TH().lines.find(l => l.id === 'B').out = false; run(70); snap('3-fly-tower-teach', 'THE FLY TOWER: batten A going up, B coming in; every line has its colour'); }
    if (on('4-fly-floor-twist')) { fresh(); BK.tp(X(143), 15); P.face = 1; TH().lines.find(l => l.id === 'D').out = true; run(45); snap('4-fly-floor-twist', 'THE FLY FLOOR: the batten as a bridge, its sandbag on the crew'); }
    if (on('4b-the-curtain-from-the-fly-floor')) { fresh(); BK.tp(X(180), 15); P.face = 1; run(50); snap('4b-the-curtain-from-the-fly-floor', 'THE CURTAIN seen from the fly floor, before it rises'); }
    if (on('5-the-performance')) { fresh(); BK.tp(X(200), 33); P.face = -1; run(200); snap('5-the-performance', 'THE PERFORMANCE, ACT ONE'); }
    if (on('5b-act-two-the-cloth')) { fresh(); BK.tp(X(214), 33); run(20); while (TH().show.t < 17) { P.hp = P.maxHp; BK.sim(10); } BK.tp(X(176), 33); run(20); snap('5b-act-two-the-cloth', 'ACT TWO: the cloth flown in'); }
    if (on('6-under-stage-twist')) { fresh(); BK.tp(X(183), 43); P.face = 1; run(80); snap('6-under-stage-twist', 'THE UNDER-STAGE: the floor flat on its cue'); }
    if (on('7-the-wings-exam')) { fresh(); BK.tp(X(240), 33); P.face = 1; run(60); snap('7-the-wings-exam', 'THE WINGS'); }
    if (on('8-the-cast')) { const F = await import('/src/redraw/theatre_foes.js'); const sets = [['STAGEHAND', F.bakeStagehand(), [0, 1, 3, 4, 5, 6]], ['USHER', F.bakeUsher(), [0, 1, 2, 3, 4, 5]], ['PATRON', F.bakeTheatreCast().patron, [0, 2, 4, 5, 6, 9]], ['GHOST', F.bakeGhost(), [0, 1, 2, 3, 4]], ['FLYING PROP', F.bakeHauntProp(), [0, 1, 2, 3, 4]]];
      const Z = 3, cw = 52 * Z, big = document.createElement('canvas'); big.width = cw * 6 + 90; big.height = sets.length * 50 * Z + 4; const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.fillStyle = '#2a2034'; bg.fillRect(0, 0, big.width, big.height); bg.font = 'bold 10px monospace'; bg.textBaseline = 'top';
      sets.forEach(([nm, S, fr], r) => { bg.fillStyle = '#ffe08a'; bg.fillText(nm, 4, r * 50 * Z + 4); fr.forEach((f, i) => { const c = S.R[f]; bg.drawImage(c, 90 + i * cw, r * 50 * Z + 50 * Z - c.height * Z - 6, c.width * Z, c.height * Z); }); });
      res.push(['8-the-cast', big.toDataURL('image/png'), 'THE CAST: the stagehand, the usher, the masked patron, the house ghost, the flying prop (their frames, 3x)']); }
    if (on('8b-lit-hero')) { fresh(); BK.enemies().filter(e => e.t === 'mummer' && e.x < X(60) * TS).forEach(e => e.x -= 400); BK.tp(X(54), 33); P.face = -1; run(40); snap('8b-lit-hero', 'THE HERO IN A POOL: the ring at his feet and the eye over his head say SEEN'); }
    if (false) { fresh(); BK.tp(X(8), 33); P.face = 1; run(4); const E = BK.enemies(); const pick = f => E.find(f);
      const cast = [pick(e => e.t === 'drunk'), pick(e => e.t === 'stagehand'), pick(e => e.t === 'mummer' && e.usher), pick(e => e.t === 'mummer' && !e.usher), pick(e => e.t === 'boo'), pick(e => e.t === 'haunt'), pick(e => e.t === 'bat')].filter(Boolean);
      cast.forEach((e, i) => { e.x = (X(8) + 2 + i * 2.2) * TS; e.y = 33 * TS + 16; e.vx = 0; e.vy = 0; e.stagger = 10; if (e.t === 'boo' || e.t === 'haunt' || e.t === 'bat') e.y -= 26; e.hx = e.x; e.hy = e.y; }); P.x = (X(8) - 2) * TS; run(6); snap('8-the-cast', 'THE CAST: patron, stagehand, usher, mummer, ghost, flying prop, bat'); }
    if (on('strip-curtain-up')) { fresh(); BK.tp(X(156), 33); P.face = 1; run(40); strip('strip-curtain-up', 'CURTAIN UP: the hero steps onto the stage, the curtain rises, the lamps come on, the house starts to throw', 6, 12, () => BK.tp(X(160), 33)); }
    if (on('strip-ride-the-weight')) { fresh(); BK.tp(214.5, 16); P.face = 1; run(40); TH().lines.find(l => l.id === 'A').out = true; strip('strip-ride-the-weight', 'RIDE THE WEIGHT: the hero on sandbag A (red tag) as line A runs and the sack carries him down to the stage', 6, 14); }
    if (on('strip-chandelier-drop')) { fresh(); BK.tp(44, 35); P.face = 1; run(40); TH().lines.find(l => l.id === 'CH').out = true; strip('strip-chandelier-drop', 'THE CHANDELIER DROP: struck, it comes down over the stalls and lies there as a step', 6, 34); }
    if (on('strip-scene-change-act-two')) { fresh(); BK.tp(X(214), 33); run(20); while (TH().show.t < 13) { P.hp = P.maxHp; BK.sim(10); } BK.tp(X(171), 33); P.face = 1; run(12); strip('strip-scene-change-act-two', 'A SCENE CHANGE, ACT TWO: the bell, the track glows amber and runs, the cloth flies in over the flat that stays down', 6, 26); }
    if (on('strip-trap')) { fresh(); BK.tp(X(157), 33); P.face = 1; { const S = TH().show; S.on = true; S.lift = 1; for (const s of TH().spots) s.off = false; S.t = 0.2; } run(30); strip('strip-trap', 'THE TRAP: the hatch pulses red and sparks, then the boards drop', 6, 14); }
    return res; })()`, 900000);
  for (const [name, d, note] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/theatreart/' + name + '.png  -  ' + note); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
