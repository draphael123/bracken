// tools/audit-anim.mjs — ANIMATION COVERAGE FOR THE FIVE HEROES: which state draws its own frames and which borrows another's. Findings only.
// Each hero is stood on Bracken Wood's ground and put into every state the draw can show - idle, run, skid, jump, apex, fall, land, crouch,
// dodge, dash, block, parry, climb, swim, each blow of the three-cut run through its whole length, the air swing, the heavy, the brace, the
// rising cut, the low sweep, the dash attack, the plunge, the hurt, cast and blast - by writing the fields the draw reads, then ONE frame is
// drawn (BK.step(0): no update runs, so nothing else moves) and the key and frame the hero draw chose are read back (P.lastKey/P.lastFrame),
// and that frame's pixels hashed. Two states whose hashes are the same set share their frames. Every key's frames are also compared with
// every other key's, pixel for pixel. A contact sheet of every baked frame of every hero is written.
// The creature half of the matrix comes from tools/audit-hitboxes.mjs (SCRATCH/creatures.json) and is tabled by tools/audit-report.mjs.
//   node tools/audit-anim.mjs            -> SCRATCH/anim.json, OUT/heroes-<hero>.png
//   OUT=<dir> SCRATCH=<dir> PORT=5908 node tools/audit-anim.mjs
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { openAudit, savePng, SCRATCH } from './audit-lib.mjs';

const OUTA = process.env.OUT || SCRATCH;
mkdirSync(OUTA, { recursive: true }); mkdirSync(SCRATCH, { recursive: true });

async function HEROANIM(o) {
  const BK = window.BK, P = BK.P, A = window.__AUD, lvm = await import('/src/level.js');
  const wood = lvm.LEVELS.findIndex(l => l.id === 'wood'), h = o.hero;
  BK.setHero(h); A.settings(); BK.load(wood); BK.state = 'play'; BK.god = true; BK.sim(3); for (const q of BK.enemies()) q.alive = false; A.clearKeys(); BK.sim(20); BK.reset();
  /* a key is a list of frames, or ONE canvas (pickFrame hands a lone canvas back whatever the frame number: crouch, plunge, skid, apex, brace) */
  const K0 = BK.heroSet, K = { R: Object.fromEntries(Object.entries(K0.R).map(([k, v]) => [k, Array.isArray(v) ? v : v && v.width ? [v] : null]).filter(([, v]) => v)), ax: K0.ax, ay: K0.ay }, hashes = {};
  for (const key of Object.keys(K.R)) hashes[key] = K.R[key].map(c => A.hashCanvas(c));
  const base = { vx: 0, vy: 0, ground: true, atk: -1, heavy: false, combo: 0, swingKind: null, dodge: 0, dash: 0, dashAtk: 0, block: false, parryT: 0, climb: false, swim: false, plunge: false, hurt: 0, riseT: 0, charge: 0, castT: 0, blastT: 0, landT: 0, skidT: 0, flourishT: 0, fidgetT: 0, dance: 0, jet: false, aegis: false, warding: false, anim: 0, inv: 0, face: 1, lastFace: 1, rush: 0 };
  const saved = { x: P.x, y: P.y };
  const draw = (fields, keysDown) => { Object.assign(P, base, fields); P.x = saved.x; P.y = saved.y; A.clearKeys(); if (keysDown) for (const k of keysDown) BK.keys[k] = true; BK.step(0); A.clearKeys();
    const k = P.lastKey, f = P.lastFrame; return { key: k, frame: f, hash: K.R[k] ? hashes[k][((f % K.R[k].length) + K.R[k].length) % K.R[k].length] : 'none' }; };
  const T5 = [0.01, 0.07, 0.13, 0.2, 0.27], anims = [0, 0.15, 0.3, 0.45, 0.6, 0.75];
  const states = {
    idle: anims.map(a => [{ anim: a }]), run: anims.map(a => [{ vx: 120, anim: a }]), skid: [[{ vx: 80, skidT: 0.1 }]], jump: [[{ ground: false, vy: -220 }], [{ ground: false, vy: -100 }]],
    apex: [[{ ground: false, vy: -10 }]], fall: [[{ ground: false, vy: 100 }], [{ ground: false, vy: 300 }]], land: [[{ landT: 0.08 }], [{ landT: 0.03 }]], crouch: [[{}, ['down']]],
    dodge: [[{ dodge: 0.25 }], [{ dodge: 0.1 }]], dash: [[{ dash: 0.1, vx: 215 }]], block: [[{ block: true }], [{ block: true, anim: 0.6 }]], parry: [[{ block: true, parryT: 0.2 }]],
    climb: [[{ climb: true, climbA: 0 }], [{ climb: true, climbA: 8 }]], swim: [[{ swim: true }], [{ swim: true, vx: 60, anim: 0.3 }]],
    'light 1': T5.map(t => [{ atk: t, combo: 1 }]), 'light 2': T5.map(t => [{ atk: t, combo: 2 }]), 'light 3': T5.map(t => [{ atk: t, combo: 3 }]), 'air swing': T5.map(t => [{ atk: t, combo: 1, ground: false, vy: 50 }]),
    heavy: [0.02, 0.1, 0.19, 0.3].map(t => [{ atk: t, heavy: true }]), brace: [[{ charge: 0.3 }]], 'shield rush': [[{ rush: 0.1, vx: 230 }]],
    'rising cut': [[{ atk: 0.05, swingKind: 'rise', riseT: 0.25, ground: false, vy: -300 }], [{ atk: 0.12, swingKind: 'rise', riseT: 0.1, ground: false, vy: -100 }], [{ riseT: 0.25, ground: false, vy: -300 }]],
    'low sweep': [0.03, 0.08, 0.13].map(t => [{ atk: t, swingKind: 'sweep' }]), 'dash attack': [0.03, 0.1, 0.18].map(t => [{ atk: t, dashAtk: 0.2, combo: 1 }]),
    plunge: [[{ plunge: true, ground: false, vy: 300 }]], hurt: [[{ hurt: 0.25 }], [{ hurt: 0.1 }]], cast: [[{ castT: 0.2 }], [{ castT: 0.05 }]], blast: [[{ blastT: 0.25 }], [{ blastT: 0.1 }]],
  };
  const rows = {};
  for (const [name, list] of Object.entries(states)) { const seen = []; for (const [f, k] of list) { try { seen.push(draw(f, k)); } catch (err) { seen.push({ key: 'error', frame: err.message }); } } rows[name] = seen; }
  Object.assign(P, base); P.x = saved.x; P.y = saved.y; BK.god = false; BK.step(0);
  /* pixel-identical frames across keys */
  const byHash = {}; for (const [k, arr] of Object.entries(hashes)) arr.forEach((hh, i) => (byHash[hh] = byHash[hh] || []).push(k + ':' + i));
  const dupes = Object.values(byHash).filter(v => new Set(v.map(s => s.split(':')[0])).size > 1);
  /* the sheet: every key, every frame, 3x */
  const keys = Object.keys(K.R), Z = 3, cw = Math.max(...keys.flatMap(k => K.R[k].map(c => c.width))) * Z + 6, ch = Math.max(...keys.flatMap(k => K.R[k].map(c => c.height))) * Z + 16, cols = Math.max(...keys.map(k => K.R[k].length));
  const c = document.createElement('canvas'); c.width = 70 + cols * cw; c.height = keys.length * ch; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#14121c'; g.fillRect(0, 0, c.width, c.height);
  keys.forEach((k, r) => { g.fillStyle = '#e8e2cc'; g.font = '10px monospace'; g.fillText(k, 4, r * ch + 20); K.R[k].forEach((cv, i) => { g.fillStyle = '#1e1a2a'; g.fillRect(70 + i * cw, r * ch, cw - 2, ch - 2); g.drawImage(cv, 72 + i * cw, r * ch + 2, cv.width * Z, cv.height * Z); g.fillStyle = '#9aa39a'; g.fillText(String(i), 72 + i * cw, r * ch + ch - 4); }); });
  return { hero: h, keys: Object.fromEntries(keys.map(k => [k, K.R[k].length])), rows, dupes, png: c.toDataURL('image/png') };
}

async function main() {
  const pg = await openAudit(); const out = [];
  try {
    for (const h of ['knight', 'pyro', 'paladin', 'pirate', 'reaper']) { const r = await pg.evalp('(' + HEROANIM.toString() + ')(' + JSON.stringify({ hero: h }) + ')');
      savePng(r.png, join(OUTA, 'heroes-' + h + '.png')); delete r.png; out.push(r);
      console.log('== ' + h + ' keys ' + JSON.stringify(r.keys));
      for (const [s, seen] of Object.entries(r.rows)) console.log('  ' + s.padEnd(12) + [...new Set(seen.map(q => q.key + ':' + q.frame))].join(' '));
      console.log('  identical frames across keys: ' + r.dupes.map(d => d.join('=')).join('  ').slice(0, 400));
      if (pg.errors.length) console.log('  page errors: ' + pg.errors.splice(0).slice(0, 3).join(' | ').slice(0, 300)); }
    writeFileSync(join(SCRATCH, 'anim.json'), JSON.stringify(out, null, 1)); console.log('wrote ' + join(SCRATCH, 'anim.json'));
  } finally { pg.close(); }
}
main().catch(err => { console.error(err); process.exit(1); });
