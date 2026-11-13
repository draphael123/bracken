/* tools/bc5-cam.mjs <outdir> - BC5 PROOF (claude/bc5proof): (1) the post-strike camera on a race glass: strike R2's glass with the knight, then every 6 frames for 1.2 s record the frame (strip PNG) and whether input still moves the hero
   (the camera look must be the short 0.6 s one, non-blocking); (2) the first 1.2 s after the Glassblower's kill: state, transition kind/value and a frame strip, to tell an iris/fade from a bug.
   node tools/bc5-cam.mjs ../scratch/lane-reports/bc5proof */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const out = process.argv[2] || 'bc5-cam'; mkdirSync(out, { recursive: true });
const pg = await openPage();
const strip = (name, d) => { writeFileSync(out + '/' + name + '.png', Buffer.from(d.png.split(',')[1], 'base64')); };
try {
  const A = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    const { LEVELS } = await import('/src/level.js'); BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.start(); BK.god = true; BK.reset(); BK.sim(900); for (const e of BK.enemies()) if (!e.boss) e.alive = false;
    const run = async (label, hold) => { BK.P.x = 599.7 * 16; BK.P.y = 33 * 16; BK.P.vx = BK.P.vy = 0; BK.P.face = 1; BK.sim(120);
      const frames = [], rows = [], sigs = []; let struck = -1; const sig = b => { const c = document.createElement('canvas'); c.width = b.width; c.height = 1; const g = c.getContext('2d'); g.drawImage(b, 0, 125, b.width, 12, 0, 0, b.width, 1); const d = g.getImageData(0, 0, b.width, 1).data, o = []; for (let i = 0; i < d.length; i += 4) o.push(d[i] + d[i + 1] + d[i + 2]); return o; };
      const shiftOf = (a, b) => { let best = 0, bs = 1e18; for (let k = -40; k <= 40; k++) { let e = 0, n = 0; for (let i = 60; i < a.length - 60; i++) { const j = i + k; if (j < 0 || j >= b.length) continue; e += Math.abs(a[i] - b[j]); n++; } e /= n; if (e < bs) { bs = e; best = k; } } return best; }; BK.keys.right = false;
      for (let f = 0; f < 150; f++) { if (f === 0) BK.press('talk'); if (f >= 30 && hold) BK.keys.right = true;   /* the hero is given the run at 0.5 s (hold) or never (stand) */
        BK.step(1); const g = BK.flip().glasses.find(q => q.id === "span"); if (struck < 0 && g && g.t > 0) struck = f; if (f % 6 === 0 && f <= 72) frames.push(BK.buf); if (f % 6 === 0 && f <= 120) sigs.push(sig(BK.buf)); rows.push([f, +(BK.P.x / 16).toFixed(2), +(BK.P.vx).toFixed(1)]); }
      BK.keys.right = false; const c = document.createElement('canvas'); c.width = 320 * 4; c.height = 180 * 3; const g2 = c.getContext('2d'); g2.imageSmoothingEnabled = false;
      frames.slice(0, 12).forEach((b, i) => g2.drawImage(b, (i % 4) * 320, Math.floor(i / 4) * 180)); return { label, struck, shifts: sigs.map((q, i) => (i * 0.1).toFixed(1) + 's:' + shiftOf(sigs[0], q)).join(' '), moved: rows.filter(r => r[0] % 15 === 0).map(r => r.join(':')).join(' '), png: c.toDataURL('image/png') }; };
    return [await run('stand', false), await run('run', true)]; })()`, 120000);
  for (const r of A) { strip('cam-' + r.label, r); console.log('cam', r.label, 'struck frame', r.struck, 'scroll px vs t0', r.shifts, 'f:x:vx', r.moved); }
  const B = await pg.evalp(`(async()=>{ const en = () => BK.enemies().find(e => e.t === 'glassblower'); BK.setHero('knight'); BK.reset({ fresh: true });
    const { LEVELS } = await import('/src/level.js'); BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.start(); BK.god = true; BK.reset(); BK.sim(900); if (${process.argv[3] === 'prelevel'}) { BK.gainXp(1e7); for (let i = 0; i < 20 && BK.state !== 'play'; i++) { BK.press('confirm'); BK.cardClose && BK.cardClose(); BK.sim(5); } BK.sim(300); } BK.tp(397, 32); BK.sim(60);
    let f = 0; for (; f < 3000; f++) { const e = en(); if (!e || !e.alive) break; if (BK.state === 'talk' || BK.state === 'card') BK.press('confirm'); if (f === 200) e.hp = 40; const d = e.x - BK.P.x; BK.P.face = Math.sign(d) || 1; if (Math.abs(d) > 30) BK.P.x += Math.sign(d) * 2; if (f % 8 === 0) BK.press('atk'); if (e.mode === 'buried' || e.hp < 41) e.hp = Math.max(1, e.hp); BK.sim(1); }
    const frames = [], log = []; for (let k = 0; k < 90; k++) { BK.step(1); const px = (() => { const c = document.createElement('canvas'); c.width = 16; c.height = 9; const g = c.getContext('2d'); g.drawImage(BK.buf, 0, 0, 16, 9); const d = g.getImageData(0, 0, 16, 9).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2]; return Math.round(s / (16 * 9 * 3)); })();
      log.push(k + ':' + BK.state + ':lum' + px); if (k % 6 === 0 && k <= 72) frames.push(BK.buf); }
    const c = document.createElement('canvas'); c.width = 320 * 4; c.height = 180 * 3; const g2 = c.getContext('2d'); g2.imageSmoothingEnabled = false; frames.slice(0, 12).forEach((b, i) => g2.drawImage(b, (i % 4) * 320, Math.floor(i / 4) * 180));
    return { diedAt: f, log: log.filter((x, i) => i % 3 === 0).join(' '), png: c.toDataURL('image/png') }; })()`, 300000);
  strip('gb-kill-strip' + (process.argv[3] === 'prelevel' ? '-prelevel' : ''), B); console.log('gb kill: died at frame', B.diedAt, '\n' + B.log);
  console.log('page errors:', JSON.stringify(pg.errors || []));
} finally { pg.close(); }
