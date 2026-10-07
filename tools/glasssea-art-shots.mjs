// tools/glasssea-art-shots.mjs - THE GLASS SEA's art-pass pictures (claude/glasssea). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8678 node tools/glasssea-art-shots.mjs <before|after> [name-filter]   -> work/claude/glasssea-art/<tag>/*.png (frames from the game's own canvas, 2x)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', filt = process.argv[3] || '';
const out = join(ROOT, 'work/claude/glasssea-art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const filt = ${JSON.stringify(filt)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'glasssea'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = (name, z) => { const c = document.createElement('canvas'); const k = z ? 6 : 2; c.width = (z ? z[2] : BK.view.VW) * k; c.height = (z ? z[3] : BK.view.VH) * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; if (z) g.drawImage(BK.buf, z[0], z[1], z[2], z[3], 0, 0, c.width, c.height); else g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const at = (name, x, y, f, z) => { if (filt && !filt.split(',').some(f => name.includes(f))) return; fresh(); BK.tp(x, y); run(20); if (f) f(); BK.look(x, y); run(2); snap(name, z); };
    const turn = (id, n) => { const H = BK.glassSeaHands(), S = H.state(); const m = S.mirrors.find(q => q.id === id); for (let i = 0; i < n; i++) { m.n = (m.n + 1) % m.notches.length; m.state = m.notches[m.n]; } };
    at('g1-start', 6, 29);
    at('g2-first', 42, 33);
    at('g2b-first-fused', 44, 33, () => { turn('first', 1); run(120); });
    at('g3-field', 112, 33);
    at('g4-slide', 136, 31);
    at('g5-cross', 226, 33);
    at('g5b-cross-fused', 236, 33, () => { turn('bridge', 1); run(160); });
    at('g6-obelisk', 322, 33);
    at('g6b-temple', 309, 33);
    at('g7-head', 366, 27);
    at('g7c-head2', 372, 22);
    at('g7b-crown', 376, 16);
    at('g8-flats', 470, 33);
    at('g9-cut', 515, 33);
    at('g9b-cut-relay', 515, 33, () => { turn('relay', 1); run(60); });
    at('g10-steps', 585, 30);
    at('z1-relay', 585, 30, null, [90, 40, 80, 80]);
    at('z2-mirror', 42, 33, null, [55, 60, 70, 60]);
    at('z3-hunter', 470, 33, null, [0, 60, 120, 60]);
    at('z4-notch0', 42, 33, null, [100, 66, 56, 56]);
    at('z5-notch1', 42, 33, () => { turn('first', 1); run(10); }, [100, 66, 56, 56]);
    at('z6-notch2', 42, 33, () => { turn('first', 2); run(10); }, [100, 66, 56, 56]);
    at('g11-arena', 612, 33);
    /* (glasssea2) the mirrors and their light: every kind of source, bounce and stop */
    at('m1-chain', 318, 27, () => { turn('chainA', 1); turn('chainB', 1); run(120); });
    at('m1z-chain', 318, 27, () => { turn('chainA', 1); turn('chainB', 1); run(60); }, [70, 20, 90, 120]);
    at('m2-gaze', 586, 27, () => { turn('gaze', 1); turn('stepsRelay', 1); run(120); });
    at('m2z-relay', 586, 27, () => { turn('stepsRelay', 1); run(30); }, [40, 40, 120, 100]);
    at('m3z-first', 42, 33, () => { turn('first', 1); run(60); }, [70, 0, 140, 130]);
    at('m4z-sky', 42, 33, null, [70, 0, 140, 130]);
    at('p1-pulseA', 174, 33, () => { turn('pulseA', 1); run(40); });
    at('p1b-pulseA-off', 174, 33, () => { turn('pulseA', 1); run(300); });
    at('p2-hawk', 268, 33, () => { turn('hawkX', 1); turn('hawkY', 1); run(40); });
    at('p2b-hawk', 274, 33, () => { turn('hawkX', 1); turn('hawkY', 1); run(220); });
    at('k1-stir', 321, 33, () => { run(70); });
    at('k2-swarm', 321, 33, () => { run(240); });
    at('k3z-skitter', 321, 33, () => { run(240); }, [150, 70, 120, 50]);
    /* THE COLOSSUS in its states: forced modes on the arena (a picture, not a fight) */
    { const col = (name, ph, mode, f, hx, hy, hx2, hy2) => { if (filt && !filt.split(',').some(q => name.includes(q))) return; fresh(); BK.tp(hx || 612, hy || 33); run(90); const CO = BK.colossusHands(), S = CO && CO.show(), e = BK.boss; if (!S || !e) return; S.ph = ph; e.phase = ph; e.mode = mode; e.modeT = 99; if (f) f(e, S); BK.god = true; BK.sim(2); run(260); S.ph = ph; e.phase = ph; e.mode = mode; e.modeT = 99; if (f) f(e, S); BK.look(hx2 || 624, hy2 || 22); run(2); e.mode = mode; snap(name); };
      col('a1-dusk', 1, 'idle');
      col('a2-chest', 1, 'cracked', (e, S) => { e.open = 4; e.openT0 = 5.2; S.mirrors[0].notch = 'face'; S.mirrors[1].notch = 'face'; }, 612, 33, 621, 27);
      col('a3-night', 2, 'blazing', (e, S) => { e.open = 4; e.openT0 = 5.6; S.mirrors[0].notch = 'fire'; }, 612, 33, 620, 24);
      col('a4-dawn', 3, 'dazzled', (e, S) => { e.open = 4; e.openT0 = 5.4; S.mirrors[1].notch = 'sky'; }, 612, 33, 622, 26);
      col('a5-lance', 1, 'lanceTell', (e, S) => { S.lance = { end: { x: 620 * 16, mirror: 0 } }; }); }
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/glasssea-art/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
