/* tools/k2-art-lint.mjs - KEEP 2's ART, node-only lint (claude/k2art, 2026-11-12). No page, no browser: a recording 2d stub stands in for the canvas.   node tools/k2-art-lint.mjs
   A  every move mode of the king resolves to a pose; every pose draws a body with no NaN rect / bad colour, wet and dry; facing -1 mirrors +1 exactly
   B  POSE-DISTINCT: every pose's fingerprint differs from every other (wet and dry); every TELL's pose differs from its RELEASE's and from idle; a told move shows >= 0.3 s (K2_TELLS)
   C  every draw stays inside a box round his feet; the cursed model, shell states, curse progress, his fall and the trident variants draw clean
   D  the pieces (dial in 3 skins, lever, HUD gauge, floodgate, portcullis, trident states, prong, grasp, leech, dressing) draw clean
   E  palette discipline: distinct colours per module under a ceiling;  F  files + wiring (no ad-block words, main.js hooks, the greybox rectangles are gone) */
import { readFileSync } from 'node:fs';
let n = 0, bad = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('  FAIL ' + m); } };
const COLS = new Map(); let REC = null, BAD = []; const reset = () => { COLS.clear(); BAD = []; };
function makeCtx(w, h) {
  return { canvas: { width: w, height: h }, fillStyle: '#000000', globalAlpha: 1,
    fillRect(x, y, ww, hh) { const c = String(this.fillStyle); COLS.set(c, (COLS.get(c) || 0) + 1);
      if (![x, y, ww, hh].every(Number.isFinite)) BAD.push('NaN rect ' + [x, y, ww, hh] + ' ' + c); if (!/^#[0-9a-f]{6}$/i.test(c)) BAD.push('bad colour ' + c);
      if (REC) REC.push([x, y, ww, hh, c, this.globalAlpha].join(',')); } };
}
const KA = await import(new URL('../src/redraw/drowned_king2_art.js', import.meta.url).href), K2A = await import(new URL('../src/redraw/keep2_art.js', import.meta.url).href),
  SD = await import(new URL('../src/redraw/sea_dial.js', import.meta.url).href), K2M = await import(new URL('../src/drowned-king2.js', import.meta.url).href);
const print = (o, f = 1, t = 0.4, dry = false) => { reset(); REC = []; const g = makeCtx(200, 200); KA.drawKing2(g, 100, 100, f, { aim: -4, trAng: 0, k: 0.5, seed: 1, dry, ...o }, t); const r = REC; REC = null; return r; };
const fp = r => r.join('|');

/* ---- A ---- */
const MODES = ['sleep', 'wake', 'swim', 'walk', 'recover', 'thrustTell', 'thrust', 'recoil', 'sweepTell', 'sweep', 'hurlTell', 'hurl', 'recallTell', 'recall', 'decreeTell', 'decree', 'heave', 'pinned', 'curse', 'graspTell', 'grasp', 'leechTell', 'leech', 'prongTell', 'shellTell'];
for (const m of MODES) { const key = KA.poseOf(m, { dry: false, k: 1 }); ok(KA.K2_POSE_SET[key], m + ' -> pose ' + key); }
for (const m of Object.keys(K2M.K2_TELLS)) ok(KA.K2_POSE_SET[KA.K2_MODE_POSE[m]], 'tell ' + m + ' has its own pose');
for (const key of Object.keys(KA.K2_POSE_SET)) for (const dry of [false, true]) { const r = print({ pose: key }, 1, 0.4, dry); ok(r.length > 80, key + (dry ? ' dry' : ' wet') + ' draws a body (' + r.length + ' rects)'); ok(BAD.length === 0, key + ': no bad rects ' + BAD.slice(0, 2)); }
for (const key of ['idle', 'thrust', 'curse']) { const A = print({ pose: key }, 1), B = print({ pose: key }, -1); ok(A.length === B.length, key + ': both facings draw the same pieces');
  const mir = A.map(r => { const [x, y, w, h, c, a] = r.split(','); return [200 - (+x + +w), y, w, h, c, a].join(','); }); ok(fp(mir) === fp(B), 'facing -1 mirrors facing +1 exactly (' + key + ')'); }

/* ---- B ---- */
{ const keys = Object.keys(KA.K2_POSE_SET), seen = new Map();
  for (const dry of [false, true]) for (const k of keys) { const f = fp(print({ pose: k }, 1, 0.4, dry)); const pk = seen.get(f + dry); ok(!pk, (dry ? 'dry ' : 'wet ') + k + ' differs from ' + (pk || 'all others')); seen.set(f + dry, k); }
  const tells = Object.keys(K2M.K2_TELLS).filter(m => K2M.K2_TELLS[m].mark !== undefined && KA.K2_MODE_POSE[m]);
  for (const m of tells) { ok(K2M.K2_TELLS[m].t >= 0.3, m + ' shows ' + K2M.K2_TELLS[m].t + ' s (>= 0.3)'); const rel = m.replace(/Tell$/, ''); ok(fp(print({ pose: m })) !== fp(print({ pose: 'idle' })), m + ' differs from idle');
    if (KA.K2_POSE_SET[rel] && rel !== m) ok(fp(print({ pose: m })) !== fp(print({ pose: rel })), m + ' differs from its release ' + rel); }
  /* the trident leaves his hand for hurl; the cursed model differs from the living one; shell differs from none */
  ok(fp(print({ pose: 'idle', cursed: true })) !== fp(print({ pose: 'idle' })), 'the cursed model differs');
  ok(fp(print({ pose: 'idle', shell: true })) !== fp(print({ pose: 'idle' })), 'the shell differs'); ok(fp(print({ pose: 'idle', shellOpenT: 1 })) !== fp(print({ pose: 'idle', shell: true })), 'the split shell differs from the whole one');
  ok(fp(print({ pose: 'curse', k: 0 })) !== fp(print({ pose: 'curse', k: 1 })), 'the curse progresses'); }

/* ---- C: the box round his feet: x -70..+90 and y -110..+36 at feet (100,100) ---- */
{ let out = 0; for (const dry of [false, true]) for (const k of Object.keys(KA.K2_POSE_SET)) for (const o of [{}, { cursed: true }, { shell: true }]) for (const r of print({ pose: k, ...o }, 1, 0.4, dry)) { const [x, y, w, h] = r.split(',').map(Number); if (x < 30 || x + w > 190 || y < -10 || y + h > 136) out++; }
  ok(out === 0, 'every pose inside the box round his feet (' + out + ' rects outside)'); }
{ for (const kq of [0, 0.3, 0.6, 1]) for (const cu of [false, true]) { reset(); const g = makeCtx(200, 200); KA.drawDeadKing2(g, 100, 100, 1, kq, 0.3, { cursed: cu }); ok(BAD.length === 0, 'his fall ' + kq + (cu ? ' cursed' : '') + ' draws clean ' + BAD.slice(0, 2)); }
  for (const o of [{}, { cursed: true }, { split: 1 }]) { reset(); const g = makeCtx(200, 200); K2A.drawTrident2(g, 100, 100, -30, 8, { ...o, glint: true, tm: 0.2 }); ok(BAD.length === 0, 'trident ' + JSON.stringify(o) + ' draws clean'); } }

/* ---- D ---- */
{ reset(); const g = makeCtx(400, 300), gg = [{ k: 0, ph: 'low', coming: 'in' }, { k: 0.5, ph: 'warn', t: 1, coming: 'out', tell: true }, { k: 1, ph: 'high' }, { k: 0.3 }, undefined];
  for (const sk of ['brass', 'verdigris', 'flesh']) for (const q of gg) { SD.drawDial(g, 60, 60, q, 0.3, sk); SD.drawHud(g, 10, 10, q, 0.3, sk); }
  for (const sk of ['brass', 'verdigris', 'flesh']) for (const st of [{}, { thrown: true, swing: 0.5, near: true }]) SD.drawLever(g, 100, 100, st, 0.3, sk);
  ok(BAD.length === 0, 'dial / hud / lever in three skins draw clean ' + BAD.slice(0, 2)); ok(SD.SKINS.flesh.shape === 'lung' && SD.SKINS.brass.shape === 'dial', 'the skins are plain objects (lung / dial)'); }
{ reset(); const g = makeCtx(400, 300);
  for (const k of [0, 1]) K2A.drawFloodgate(g, 40, 100, 70, { k, t: 0.3 }); for (const k of [0.2, 1]) for (const pin of [false, true]) K2A.drawPortcullis(g, 100, 40, 190, { k, pin, t: 0.3 });
  K2A.drawGateHint(g, 100, 40, 190, 'decree', 0.3); K2A.drawGateHint(g, 100, 40, 190, 'under', 0.3); K2A.drawTridentFlight(g, 100, 100, 100, -20, 0.3); K2A.drawTridentStuck(g, 100, 100, -100, 10, 0.3, { ring: true, fresh: true });
  K2A.drawProng(g, 100, 100, 100, 20, 0.3); K2A.drawGrasp(g, 10, 90, 100, false, 0.3); K2A.drawGrasp(g, 10, 90, 100, true, 0.3); K2A.drawLeechLine(g, 10, 10, 200, 90, 0.3);
  for (const cx of [0, 333, 1000, 5000]) K2A.drawDressing(g, cx, 0, 320, 0, 6000, 28, 150, 0.7, {});
  ok(BAD.length === 0, 'the pieces draw clean ' + BAD.slice(0, 3)); }

/* ---- E ---- */
{ reset(); for (const k of Object.keys(KA.K2_POSE_SET)) for (const dry of [false, true]) print({ pose: k, cursed: dry, shell: !dry }, 1, 0.4, dry); const kingCols = COLS.size; ok(kingCols <= 190, 'the king drew ' + kingCols + ' distinct colours (his own ramps, tint aside)');
  const lit = f => new Set([...readFileSync(new URL('../src/redraw/' + f, import.meta.url), 'utf8').matchAll(/'(#[0-9a-fA-F]{6})'/g)].map(m => m[1].toLowerCase()));
  const all = new Set([...lit('drowned_king2_art.js'), ...lit('keep2_art.js'), ...lit('sea_dial.js')]); ok(all.size <= 170, 'the three modules write ' + all.size + ' literal colours'); }

/* ---- F ---- */
{ const files = ['redraw/drowned_king2_art.js', 'redraw/keep2_art.js', 'redraw/sea_dial.js']; ok(files.every(f => !/ad|admiral|banner|track/i.test(f.split('/')[1].replace(/drowned|keep2|dial|art|sea/gi, ''))), 'no ad-block words in the new filenames');
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), hands = readFileSync(new URL('../src/keep-floods-hands.js', import.meta.url), 'utf8');
  ok(/KFH\.drawsSelf\(e\)/.test(main) && /KFH\.drawDead\(/.test(main), 'main.js calls drawsSelf / drawDead (behind KFH, null when the flag is off)');
  ok(!/'#3f6f62'|'#3f8f7d', 0\.35/.test(hands), 'no greybox lever / floodgate rectangles left in the hands'); ok(/SD\.drawDial/.test(hands) && /SD\.drawLever/.test(hands) && /K2A\.drawFloodgate/.test(hands) && /K2A\.drawPortcullis/.test(hands), 'the hands draw the pieces');
  const kf = readFileSync(new URL('../src/keep-floods.js', import.meta.url), 'utf8'); ok(/KF_SHIPS = false/.test(kf), 'KF_SHIPS stays false (the flag is OFF)'); }
console.log('k2-art-lint: ' + n + ' checks, ' + (bad ? bad + ' FAILED' : 'all ok'));
process.exit(bad ? 1 : 0);
