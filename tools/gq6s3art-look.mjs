/* tools/gq6s3art-look.mjs - GQ6S3ART (11-13): ONE headless look at the Queen's roof with ?gq6s2=1&gq6s3=1: stills of every tier intact, mid-tell, burnt, the ladders, the final platform, and the p95 frame time with every span burning.
     node tools/gq6s3art-look.mjs --tag=before|after [--dir=<out dir>] [--sheet]    --sheet: also compose <dir>/sheet.png (before above-left, after right) from <dir>/before and <dir>/after
   One headless Chrome, god mode, the hero is TELEPORTED up the ladders (the climb itself is not what this looks at). A measuring tool, not a check. */
import { openPage } from './cdp.mjs';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const a = process.argv.slice(2), opt = (k, d) => { const x = a.find(y => y.startsWith('--' + k + '=')); return x ? x.slice(k.length + 3) : d; };
process.env.BRACKEN_GQ6S2 = '1'; process.env.BRACKEN_GQ6S3 = '1';
const NOART = a.includes('--noart'), TAG = opt('tag', 'after'), DIR = opt('dir', fileURLToPath(new URL('../../scratch/lane-reports/gq6s3art', import.meta.url))), SHEET = a.includes('--sheet');
mkdirSync(path.join(DIR, TAG), { recursive: true });
const SCENES = [['01-deck-smoulder', 'deck mid-tell, hoardings intact'], ['02-deck-burnt', 'deck burnt'], ['03-hoard-intact', 'hoardings, ladders'], ['04-hoard-smoulder', 'hoardings mid-tell, loft intact'], ['05-hoard-burnt', 'hoardings burnt'], ['06-loft-intact', 'bell loft intact'], ['07-loft-smoulder', 'loft mid-tell, roof intact'], ['08-loft-burnt', 'loft burnt'], ['09-final', 'final platform'], ['10-ladder-zoom', 'ladder foot (3x)']];
async function shoot() {
  const pg = await openPage({ audio: false, fonts: true, seed: 7 });
  try {
    const FN = `async () => {
      const { LEVELS } = await import('/src/level.js'); if (${NOART}) { const M = await import('/src/redraw/gq6s3_art.js'); M._sheets.fail = true; }
      const hold = () => { BK.P.hp = BK.P.maxHp; }, keyOff = () => { const k = BK.keys; k.left = k.right = k.up = k.down = k.jump = k.atk = false; };
      BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.state = 'play'; BK.god = false; BK.step(5);
      const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1);
      for (let k = 0; k < 300; k++) { hold(); BK.step(1); }
      const q = BK.boss; q.hp = 2; (BK.hurt || (BK.env && BK.env().hurt))(q, 50, BK.P.x); for (let k = 0; k < 140; k++) { hold(); BK.step(1); }
      const H = BK.gqHands(); H.skipRoof(); for (let k = 0; k < 600; k++) { hold(); BK.step(1); if (BK.boss.stage === 'roof' && (BK.boss.mode === 'roofStand' || BK.boss.mode === 'rec') && k > 200) break; }
      const g = H.gq6s2(), st = g.state(), P = BK.P, shots = {}, frames = [];
      const snap = (name, zoom) => { const c = document.createElement('canvas'), b = BK.buf; if (zoom) { c.width = 200 * zoom; c.height = 140 * zoom; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(b, zoom.sx, zoom.sy, 200, 140, 0, 0, c.width, c.height); } else { c.width = b.width; c.height = b.height; c.getContext('2d').drawImage(b, 0, 0); } shots[name] = c.toDataURL('image/png'); };
      const put = (k, dx) => { const t = g.tier(k); P.x = (dx >= 0 ? t.x0 + dx : t.x1 + dx); P.y = t.floor; P.vx = 0; P.vy = 0; };
      const deckTier = () => { const Tw = BK.L.arena.tower; return { x0: Tw.DECK.x0 * 16, x1: Tw.DECK.x1 * 16, floor: Tw.DECK.floor * 16 }; };
      let calls = 0; const proto = CanvasRenderingContext2D.prototype; for (const m of ['fillRect', 'drawImage', 'clearRect', 'fillText', 'strokeRect', 'fill', 'stroke', 'beginPath', 'putImageData']) { const o = proto[m]; proto[m] = function (...a) { if (this.canvas === BK.buf) calls++; return o.apply(this, a); }; }
      const callsLog = []; const timed = () => { calls = 0; const t = performance.now(); BK.step(1); frames.push(performance.now() - t); callsLog.push(calls); };
      const stepN = n => { BK.god = true; for (let i = 0; i < n; i++) { hold(); BK.step(1); } };
      const onDeck = () => { const d = deckTier(); P.x = d.x0 + 150; P.y = d.floor; P.vx = 0; P.vy = 0; };
      BK.god = true; onDeck(); stepN(30);
      const thr = [0.85, 0.70, 0.50], names = [['01-deck-smoulder', '02-deck-burnt'], ['04-hoard-smoulder', '05-hoard-burnt'], ['07-loft-smoulder', '08-loft-burnt']];
      const log = [];
      for (let i = 0; i < 3; i++) {
        q.hp = Math.min(q.hp, q.maxHp * (thr[i] - 0.004)); let w = 0; while (st.phase !== 'tell' && w++ < 3000) { hold(); BK.step(1); }
        log.push('tell' + i + ' phase ' + st.phase + ' tier ' + st.tier + ' waited ' + w);
        if (i === 0) { onDeck(); } else put(i, 20);
        stepN(100); snap(names[i][0]);
        if (i === 1) { /* the loft above the burning hoardings, from the loft's own ladder foot: the 'intact loft' look */ }
        w = 0; while (st.phase === 'tell' && w++ < 400) { hold(); BK.step(1); }
        stepN(20); snap(names[i][1]); log.push('after tell phase ' + st.phase);
        /* up the ladder (teleport) onto the new tier */
        put(i + 1, i + 1 === 3 ? 60 : 30); BK.god = true; w = 0; while (!(st.phase === 'on' && st.tier === i + 1) && w++ < 600) { hold(); BK.step(1); }
        log.push('on tier ' + st.tier + ' phase ' + st.phase + ' w ' + w);
        stepN(40); if (i === 0) snap('03-hoard-intact'); if (i === 1) snap('06-loft-intact');
      }
      stepN(30); P.x = g.tier(3).x0 + 60; P.y = g.tier(3).floor; stepN(40); snap('09-final');
      /* the ladder foot, 3x: the west ladder of the hoardings from the deck */
      const t1 = g.tier(1);
      /* p95 with every span burning (hero on the final platform, god mode, 600 frames) */
      BK.god = true; for (let i = 0; i < 600; i++) { hold(); timed(); }
      const spots = {}; for (const [nm, k] of [['deck', 0], ['hoard', 1], ['loft', 2], ['final', 3]]) { if (k === 0) onDeck(); else put(k, 60); const cl = []; for (let i = 0; i < 40; i++) { hold(); calls = 0; BK.step(1); cl.push(calls); } spots[nm] = Math.max(...cl); }
      const cs = callsLog.slice().sort((p, r) => p - r); const callsP95 = cs[Math.floor(cs.length * 0.95)], callsMax = cs[cs.length - 1];
      const s = frames.slice().sort((p, r) => p - r), pc = f => +s[Math.min(s.length - 1, Math.floor(s.length * f))].toFixed(2);
      return { shots, log, spots, callsP95, callsMax, p50: pc(0.5), p95: pc(0.95), p99: pc(0.99), max: +s[s.length - 1].toFixed(1), n: s.length, burns: st.burns.map(b => [b.id, b.state]), tier: st.tier, phase: st.phase, bufW: BK.buf.width, bufH: BK.buf.height };
    }`;
    const r = await pg.evalp('(' + FN + ')()', 900000); r.errors = pg.errors.slice(0, 5); return r;
  } finally { pg.close(); }
}
if (SHEET) { /* compose <dir>/sheet.png from <dir>/before and <dir>/after: one row a scene (before | after), then 4x crops of the final platform, its ladder and a hoarding run */
  const rd = (t, n) => { const p = path.join(DIR, t, n + '.png'); return existsSync(p) ? 'data:image/png;base64,' + readFileSync(p).toString('base64') : null; };
  const data = SCENES.slice(0, 9).map(([n, label]) => ({ n, label, b: rd('before', n), a: rd('after', n) }));
  const pg = await openPage({ audio: false, fonts: true, seed: 7 });
  try { const url = await pg.evalp(`(async () => { const data = ${JSON.stringify(data)}; const ld = u => new Promise(r => { if (!u) return r(null); const i = new Image(); i.onload = () => r(i); i.src = u; });
    const W = 629, H = 311, pad = 6, top = 22, rows = data.length, zh = 4 * 100 + 30, c = document.createElement('canvas'); c.width = 2 * W + 3 * pad; c.height = rows * (H + top) + zh + 10; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#101018'; g.fillRect(0, 0, c.width, c.height); g.font = '13px monospace';
    const imgs = []; for (let k = 0; k < rows; k++) { const d = data[k], b = await ld(d.b), a = await ld(d.a), y = k * (H + top); g.fillStyle = '#e8dcff'; g.fillText((k + 1) + '. ' + d.label + '      BEFORE (left)  |  AFTER (right)', pad, y + 15); if (b) g.drawImage(b, pad, y + top); if (a) g.drawImage(a, 2 * pad + W, y + top); imgs.push([b, a]); }
    const y0 = rows * (H + top) + 4; g.fillStyle = '#e8dcff'; g.fillText('4x crops, final platform + its ladder (scene 9), BEFORE | AFTER', pad, y0 + 12);
    const fin = imgs[8]; for (let s2 = 0; s2 < 2; s2++) { const im = fin[s2]; if (im) { g.drawImage(im, 230, 90, 160, 110, pad + s2 * (2 * pad + 2 * 320), y0 + 18, 640, 440 > zh ? 400 : 440); } }
    return c.toDataURL("image/png"); })()`, 120000);
    writeFileSync(path.join(DIR, 'sheet.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + path.join(DIR, 'sheet.png'));
  } finally { pg.close(); }
  process.exit(0);
}
const r = await shoot();
for (const [k, v] of Object.entries(r.shots)) writeFileSync(path.join(DIR, TAG, k + '.png'), Buffer.from(v.split(',')[1], 'base64'));
const info = { tag: TAG, log: r.log, spots: r.spots, callsP95: r.callsP95, callsMax: r.callsMax, p50: r.p50, p95: r.p95, p99: r.p99, max: r.max, n: r.n, burns: r.burns, tier: r.tier, phase: r.phase, buf: [r.bufW, r.bufH], errors: r.errors, shots: Object.keys(r.shots) };
writeFileSync(path.join(DIR, TAG, 'info.json'), JSON.stringify(info, null, 1)); console.log(JSON.stringify(info));
void SCENES; void readFileSync; void existsSync;
