// PAGE TOOL: opens a headless Chrome (cdp.mjs). Flag ON (run with BRACKEN_OWL4=1). claude/owl4-d, OWL4-LOOK: the greybox stills + the in-page behaviour of the OWL4 owed list.
//   node tools/owl4-look.mjs <outdir> [scene,scene,...]       scenes: perch stoop net bag lamps cord shadow all
// Each scene reloads the page (one browser, one page at a time), plays the real fight/level code (no stubs of the new moves beyond choosing WHICH move she draws next),
// takes the page's own 320x180 buffer at 3x, writes <outdir>/NN-name.png and prints what it measured. Nothing is written into the repo.
import { openPage } from './cdp.mjs';
import { campaignLevel } from './boss-level.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2], want = (process.argv[3] || 'all').split(',');
mkdirSync(out, { recursive: true });
let n = +(process.env.SHOT0 || 0);
const save = (name, png) => { const f = String(++n).padStart(2, '0') + '-' + name + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); console.log('  still', f); };
const HL = campaignLevel('hanging');
const PRE = `
  const { LEVELS } = await import('/src/level.js'); const O4 = await import('/src/owl4.js');
  const K = BK.keys, none = () => { for (const k of ['left','right','up','down','jump','block','atk','dodge']) K[k] = false; };
  const SEEN = {}; const harvest = () => { for (const o of rec()) SEEN[o.s] = o; window.__textRec.length = 0; };
  const snap = (z) => { z = z || 2; BK.step(1); harvest(); const c = document.createElement('canvas'); c.width = BK.buf.width * z; c.height = BK.buf.height * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); return c.toDataURL('image/png'); };
  const snapAt = (wx, wy, hw, hh, z) => { BK.step(1); harvest(); const cam = BK.cam, W = BK.buf.width, H = BK.buf.height; let x0 = Math.round(wx - cam[0] - hw), y0 = Math.round(wy - cam[1] - hh); x0 = Math.max(0, Math.min(W - 2 * hw, x0)); y0 = Math.max(0, Math.min(H - 2 * hh, y0)); const c = document.createElement('canvas'); c.width = 2 * hw * z; c.height = 2 * hh * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, x0, y0, 2 * hw, 2 * hh, 0, 0, c.width, c.height); return c.toDataURL('image/png'); };
  const rec = () => { const r = window.__textRec || []; return r.filter(o => o.kind === 'text' && o.s).map(o => ({ s: o.s, x0: Math.round(o.x0), y0: Math.round(o.y0), w: Math.round(o.w), h: Math.round(o.h) })); };
  const labels = () => { const seen = {}; for (const o of Object.values(SEEN)) if (/^[A-Z0-9 :!'.,?-]{6,}$/.test(o.s)) seen[o.s] = o; return seen; };
  const untilText = (re, max) => { for (let k = 0; k < max; k++) { BK.step(1); const hit = BK.textLab.nums().some(n => re.test(String(n.txt))) || rec().some(o => re.test(o.s)); harvest(); if (hit) return k; } return -1; };
  const strike = (x, y, face) => { BK.P.x = x; BK.P.y = y; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = face; BK.P.inv = 0; for (let k = 0; k < 40 && BK.P.atk >= 0; k++) BK.sim(1); BK.sim(2); BK.press('atk'); };
  const fitCheck = lab => Object.values(lab).filter(o => o.x0 < 0 || o.x0 + o.w > BK.buf.width || o.y0 < 0 || o.y0 + o.h > BK.buf.height).map(o => o.s + ' @' + o.x0 + ',' + o.y0 + ' w' + o.w);
  const arenaOn = (hero) => { BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero(hero || 'knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hanging')); BK.state = 'play'; BK.start(); BK.god = true; BK.sim(5); BK.reset();
    const A = BK.L.arena, FL = A.floor; BK.tp(Math.round(A.trigger / 16) + 4, Math.round(FL / 16) - 1); BK.sim(150); none();
    const owl = BK.enemies().find(e => e.t === 'owl' && e.alive); return { A, FL, owl }; };
  const levelOn = (tx, ty, hero) => { BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero(hero || 'knight'); BK.reset({ fresh: true }); BKT.setHeroLevel(hero || 'knight', ${HL}); BK.load(LEVELS.findIndex(l => l.id === 'hanging')); BK.state = 'play'; BK.start(); BK.god = true; BK.sim(900); BK.tp(tx, ty); BK.sim(30); none(); };
  const calm = owl => { for (const e of BK.enemies()) if (e !== owl) e.alive = false; };
  const phase2 = owl => { owl.hp = Math.floor(owl.maxHp * 0.49); owl.phase = 2; };
  const force = (owl, move, p2) => { if (p2) phase2(owl); owl.bag = [move]; owl.bagPh = p2 ? 2 : 1; owl.lastMove = ''; Object.assign(owl, { mode: 'sit', modeT: 0, hits: 0, ward: 0 }); const i = owl.perchI ?? 1; owl.x = owl.perches[i].x; owl.y = owl.perches[i].y; };
  const until = (pred, max) => { for (let k = 0; k < max; k++) { if (pred()) return k; BK.sim(1); } return -1; };
`;
const scene = async (name, body, timeout = 120000) => {
  if (!(want.includes('all') || want.includes(name))) return;
  console.log('SCENE ' + name);
  const pg = await openPage({ audio: false, fonts: false });
  try {
    await pg.evalp(`window.__textRec = []; true`);
    const r = await pg.evalp(`(async()=>{ ${PRE} window.__textRec = []; const R = { owl4: O4.owl4On(), shots: [] }; ${body}; return R; })()`, timeout);
    if (!r.owl4) console.log('  !! owl4 OFF in the page');
    for (const s of r.shots || []) save(s.name, s.png);
    delete r.shots; console.log('  ' + JSON.stringify(r)); if (pg.errors.length) console.log('  page errors', JSON.stringify(pg.errors.slice(0, 4)));
  } catch (e) { console.log('  SCENE FAILED', String(e.message || e).slice(0, 300)); } finally { pg.close(); }
};

/* 1. the perch grips on drawn ropes: she sits on each perch; phase two, she goes for a rope (ropeGo -> ropeTell: her talons on the drawn rope) */
await scene('perch', `
  const { A, FL, owl } = arenaOn('knight'); calm(owl); BK.god = true;
  for (const i of [0, 1, 2]) { Object.assign(owl, { mode: 'sit', modeT: 99, perchI: i, hits: 0, ward: 0 }); owl.x = owl.perches[i].x; owl.y = owl.perches[i].y; BK.P.x = Math.max(A.x0 + 40, Math.min(A.x1 - 40, owl.x)); BK.P.y = FL; BK.sim(30); R['perch' + i] = { x: Math.round(owl.x), y: Math.round(owl.y) }; R.shots.push({ name: 'reeve-sits-perch-' + i, png: snap(2) }); }
  Object.assign(owl, { perchI: 1 }); force(owl, 'ropecut', true); BK.P.x = A.x0 + 60; BK.P.y = FL;
  const log = []; let last = '', got = 0;
  for (let k = 0; k < 900 && got < 2; k++) { BK.P.inv = 0; BK.sim(1); if (owl.mode !== last) { log.push(owl.mode + '@' + k); last = owl.mode; }
    if (owl.mode === 'ropeTell' && owl.modeT < 0.6 && !got) { BK.P.x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, owl.x)); BK.sim(3); R.shots.push({ name: 'reeve-grips-drawn-rope-tell', png: snap(2) }); got = 1; R.grip = { x: Math.round(owl.x), y: Math.round(owl.y) }; } }
  R.log = log.slice(0, 20); R.fit = fitCheck(labels());
`, 200000);

/* 2. the silent stoop: eyes in the dark + the dotted line, the red lock, the dive */
await scene('stoop', `
  const { A, FL, owl } = arenaOn('knight'); calm(owl); BK.god = true; force(owl, 'stoop', false);
  const hx = (A.x0 + A.x1) / 2 - 40; BK.P.x = hx; BK.P.y = FL; BK.sim(2);
  const log = []; let last = '', got = {};
  for (let k = 0; k < 600; k++) { BK.P.inv = 0; BK.P.x = hx; BK.P.y = FL; BK.sim(1); if (owl.mode !== last) { log.push(owl.mode + '@' + k); last = owl.mode; }
    if (owl.mode === 'stoopUp' && !got.u) { BK.sim(20); R.shots.push({ name: 'stoop-up-silent', png: snap(2) }); got.u = 1; }
    if (owl.mode === 'stoopTell' && !owl.stLock && !got.a && owl.modeT < 0.8) { BK.sim(3); R.shots.push({ name: 'stoop-tell-eyes-dotted-line', png: snap(2) }); got.a = 1; }
    if (owl.mode === 'stoopTell' && owl.stLock && !got.b) { BK.sim(2); R.shots.push({ name: 'stoop-tell-red-lock', png: snap(2) }); got.b = 1; }
    if (owl.mode === 'stoop' && !got.c) { BK.sim(6); R.shots.push({ name: 'stoop-dive', png: snap(2) }); got.c = 1; }
    if (got.c && owl.mode !== 'stoop') break; }
  R.log = log.slice(0, 20); R.fit = fitCheck(labels()); R.said = Object.keys(labels());
`);

/* 2b. the stoop met by a shield hero (guard in the last 0.12 s of the dive) - real blocks, real timing */
await scene('stoop-block', `
  const { A, FL, owl } = arenaOn('knight'); calm(owl); BK.god = false; BK.P.maxHp = 600; BK.P.hp = 600; force(owl, 'stoop', false);
  const hx = (A.x0 + A.x1) / 2 - 40; BK.P.x = hx; BK.P.y = FL; BK.sim(2); const log = []; let last = '', hits = 0;
  for (let k = 0; k < 600; k++) { BK.P.x = hx; BK.P.y = FL; K.block = (owl.mode === 'stoop' && Math.hypot(owl.x - hx, owl.y - FL) < 70) || (owl.mode === 'stoopTell' && owl.modeT < 0.1); const hp0 = BK.P.hp; BK.sim(1); if (BK.P.hp < hp0) hits++; if (owl.mode !== last) { log.push(owl.mode + '@' + k); last = owl.mode; } if (owl.mode === 'stoopDown') { BK.sim(10); R.shots.push({ name: 'stoop-parried-she-lies-open', png: snap(2) }); break; } if (owl.mode === 'takeoff') break; }
  none(); R.log = log.slice(0, 20); R.hits = hits; R.mode = owl.mode; R.said = Object.keys(labels());
`);

/* 3. the net cast: carried net, tell (mesh shadow + knot), the netted hero, the net heap */
await scene('net', `
  const { A, FL, owl } = arenaOn('knight'); calm(owl); BK.god = false; BK.P.maxHp = 600; BK.P.hp = 600; force(owl, 'net', true);
  const hx = (A.x0 + A.x1) / 2 + 50; BK.P.x = hx; BK.P.y = FL; BK.sim(2);
  const log = []; let last = '', got = {};
  for (let k = 0; k < 1200; k++) { if (!(BK.P.caged > 0)) { BK.P.hp = 600; } BK.sim(1); if (owl.mode !== last) { log.push(owl.mode + '@' + k); last = owl.mode; }
    if (owl.mode === 'netGo' && owl.netPh === 1 && !got.a) { BK.sim(25); R.shots.push({ name: 'net-pulled-and-carried', png: snap(2) }); got.a = 1; }
    if (owl.mode === 'netTell' && !got.b && owl.modeT < owl.netT0 - 0.25) { R.shots.push({ name: 'net-tell-mesh-shadow-knot-at-talons', png: snap(2) }); got.b = 1; }
    if (owl.mode === 'netTell' && !got.b2 && owl.modeT < 0.3) { R.shots.push({ name: 'net-tell-locked-red', png: snap(2) }); got.b2 = 1; }
    if (BK.P.caged > 0 && !got.d) { BK.sim(10); R.shots.push({ name: 'hero-netted-mash-to-tear-free', png: snap(2) }); got.d = 1; R.caged = BK.P.caged; }
    if (got.d && !(BK.P.caged > 0)) { R.shots.push({ name: 'net-heap-after', png: snap(2) }); break; } }
  R.log = log.slice(0, 20); R.fit = fitCheck(labels()); R.said = Object.keys(labels());
`, 200000);

/* 4. sandbags: cut the west deck's knot (the bag falls; she comes low under it: SLAMMED) */
await scene('bag-slam', `
  const { A, FL, owl } = arenaOn('knight'); calm(owl); BK.god = true; Object.assign(owl, { mode: 'sit', modeT: 999, perchI: 2, hits: 0, ward: 0 }); owl.x = owl.perches[2].x; owl.y = owl.perches[2].y;
  const BX = 49 * 16 + 8, KX = 47 * 16 + 8;
  BK.P.x = BX - 120; BK.P.y = FL; BK.sim(40); R.shots.push({ name: 'sandbag-tied-before', png: snap(2) });
  strike(KX + 16, FL, -1); BK.sim(1); const before = owl.hp, log = []; let slammed = false, at = -1, shot = 0;
  for (let k = 0; k < 400; k++) { if (k >= 15 && !slammed) { Object.assign(owl, { mode: 'stuckTalons', modeT: 3, ward: 0, hits: 0 }); owl.x = BX + 6; owl.y = FL - 8; owl.vx = 0; owl.vy = 0; } BK.sim(1);
    if (k === 30) R.shots.push({ name: 'sandbag-falling-deck-rising', png: snap(2) });
    if (!slammed && owl.mode === 'slammed') { slammed = true; at = k; BK.sim(20); R.shots.push({ name: 'reeve-slammed-by-sandbag', png: snap(2) }); BK.sim(70); R.shots.push({ name: 'reeve-slammed-lies-open', png: snap(2) }); break; } }
  R.slammed = slammed; R.at = at; R.hp = [before, owl.hp, owl.maxHp]; R.mode = owl.mode; R.fit = fitCheck(labels()); R.said = Object.keys(labels());
`, 200000);

/* 4b. sandbags: strike the hanging bag (it swings: gold dotted arc, creak), and she lands low under the swinging bag */
await scene('bag-swing', `
  const { A, FL, owl } = arenaOn('knight'); calm(owl); BK.god = true; Object.assign(owl, { mode: 'sit', modeT: 999, perchI: 2, hits: 0, ward: 0 }); owl.x = owl.perches[2].x; owl.y = owl.perches[2].y;
  const BX = 49 * 16 + 8, KX = 47 * 16 + 8, H = BK.hvrHands(), bagNow = () => (H.bags().find(b => b.id === 'cw-crown-w') || null);
  BK.P.x = BX - 120; BK.P.y = FL; BK.sim(40); strike(KX + 16, FL, -1); BK.sim(1); const tl = []; let lowAt = -1;
  for (let k = 0; k < 200; k++) { const b = bagNow(); if (b && lowAt < 0 && b.t >= 236) lowAt = k; if (k % 10 === 0) tl.push(b ? Math.round(b.t) + (b.armed ? 'A' : '') : null); if (lowAt >= 0) break; BK.sim(1); }
  R.timeline = tl; R.lowAt = lowAt; R.bag0 = bagNow(); R.shots.push({ name: 'sandbag-hanging-over-the-boards', png: snap(2) });
  let swung = false; R.tries = [];
  for (const [delay, dx] of [[8, 14], [10, 14], [6, 14], [12, 14], [9, 22], [11, 22]]) { if (swung) break; let apex = 9999; BK.P.x = BX - dx; BK.P.y = FL; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = 1; for (let k = 0; k < 30 && BK.P.atk >= 0; k++) BK.sim(1); BK.press('jump'); K.jump = true; BK.sim(delay); BK.press('atk');
    for (let k = 0; k < 22; k++) { BK.P.x = BX - dx; BK.sim(1); apex = Math.min(apex, BK.P.y); const b = bagNow(); if (b && b.swinging) { swung = true; R.tries.push({ delay, dx, k, apex: Math.round(apex) }); break; } } K.jump = false; if (!swung) R.tries.push({ delay, dx, apex: Math.round(apex), no: 1, bagT: Math.round((bagNow() || {}).t) }); for (let k = 0; k < 25 && !swung; k++) BK.sim(1); }
  R.swung = swung; R.bagSwing = bagNow();
  if (swung) { BK.sim(10); R.shots.push({ name: 'sandbag-struck-swinging-a', png: snap(2) }); BK.sim(18); R.shots.push({ name: 'sandbag-swinging-b', png: snap(2) }); }
  BK.P.x = BX - 90; BK.P.y = FL; Object.assign(owl, { mode: 'stuckTalons', modeT: 5, ward: 0, hits: 0 }); let slammed = false; R.hp0 = owl.hp; const xs = [];
  for (let k = 0; k < 120; k++) { const b = bagNow(); if (!slammed && b) { owl.x = b.x; owl.y = FL - 8; owl.mode = 'stuckTalons'; } BK.sim(1); xs.push(b ? Math.round(b.x - BX) : null); if (owl.mode === 'slammed') { slammed = true; break; } }
  R.slammedBySwing = slammed; R.bagX = xs.filter((v, i) => i % 10 === 0); R.fit = fitCheck(labels());
`, 200000);


/* 4. R5, the Reeve's foot on the boards: grounded at mid arena, a 6x crop of her and the board under her */
await scene('perch-foot', `
  const { A, FL, owl } = arenaOn('knight'); calm(owl); BK.god = true;
  const xs = []; for (let x = A.x0 + 80; x <= A.x1 - 80; x += 8) { const d = (A.drops || []).some(([a, b]) => x > a * 16 - 40 && x < (b + 1) * 16 + 40); if (!d) xs.push(x); }
  const x1 = xs[Math.floor(xs.length / 2)];
  Object.assign(owl, { mode: 'grounded', modeT: 80, x: x1, y: FL - 8, vx: 0, vy: 0, ward: 0 }); BK.P.x = x1 - 90; BK.P.y = FL - 12; BK.P.inv = 0; BK.sim(60);
  R.owl = { x: Math.round(owl.x), y: Math.round(owl.y), mode: owl.mode, h: owl.h, w: owl.w, FL };
  R.shots.push({ name: 'reeve-grounded-foot-crop', png: snapAt(owl.x, FL - 14, 40, 30, 8) });
  R.shots.push({ name: 'reeve-grounded', png: snapAt(owl.x, FL - 30, 120, 70, 4) });
`);
/* 5. the village: the mill floor lamp dark and lit, the Shadow Goblin unlit (it slips the blow), revealed, hit */
await scene('shadow', `
  levelOn(24, 65);
  const lamp = BK.props().find(p => p.t === 'lantern' && p.hv && Math.abs(p.x - 328) < 4), gob = BK.enemies().find(e => e.t === 'shadowgob' && Math.abs(e.y - 1056) < 4);
  for (const e of BK.enemies()) if (e !== gob && Math.hypot(e.x - 340, e.y - 1056) < 400) e.alive = false;
  R.start = { lamp: lamp && { x: lamp.x, y: lamp.y, lit: lamp.lit }, gob: gob && { x: Math.round(gob.x), y: Math.round(gob.y), lit: gob.shadow && gob.shadow.lit } };
  BK.P.x = 330 - 60; BK.P.y = 1056; BK.P.face = 1; BK.P.inv = 0; gob.x = 330 + 80; gob.vx = 0; BK.sim(20);
  R.shots.push({ name: 'mill-lamp-dark', png: snap(2) });
  /* the goblin, unlit: a blow slips (the words and the hint) */
  const hp0 = gob.hp;
  const strikeGob = () => { BK.textLab.hint('', 0); gob.x = 400; gob.vx = 0; gob.stagger = 0; strike(376, 1056, 1); let msg = null; for (let k = 0; k < 12; k++) { BK.step(1); if (BKT.hintNow.t > 0.4 && BKT.hintNow.msg) { msg = BKT.hintNow.msg; break; } } for (let k = 0; k < 14; k++) BK.step(1); return msg; };   /* (the hint box fades in) */
  const away = () => { for (let k = 0; k < 300; k++) { BK.P.x = 150; BK.P.y = 1056; gob.x = 400; gob.vx = 0; BK.step(1); } };
  R.strikes = [strikeGob().slice(0, 36)]; away();   /* the 1st blow: the goblin's own first-sight tip holds the hint box */
  const s2 = strikeGob(); R.strikes.push(s2); R.shots.push({ name: 'shadowgob-unlit-hint-bring-it-into-the-light', png: snap(2) }); away();
  const s3 = strikeGob(); R.strikes.push(s3); R.shots.push({ name: 'shadowgob-unlit-it-slips-the-blow', png: snap(2) });
  R.slip = { hp0, hp1: gob.hp, lit: gob.shadow.lit, said: Object.keys(labels()) };
  for (let k = 0; k < 20; k++) BK.sim(1);
  /* the lamp struck: it lights, the goblin close to it is lit and REVEALED */
  gob.x = 330 + 44; gob.vx = 0; gob.hurtT = 0; gob.stagger = 0; strike(330 - 16, 1056, 1);
  let lampAt = -1; for (let k = 0; k < 60; k++) { BK.sim(1); if (lamp.lit) { lampAt = k; break; } } R.lampLitAfter = lampAt;
  R.revAt = untilText(/REVEALED/, 30); R.shots.push({ name: 'shadowgob-revealed-lamp-lit', png: snap(2) });
  R.lit = { lamp: lamp.lit, gob: gob.shadow.lit, stagger: gob.stagger };
  for (let k = 0; k < 50; k++) BK.sim(1);
  gob.x = 330 + 36; gob.vx = 0; const hp1 = gob.hp; strike(gob.x - 22, 1056, 1); BK.sim(8); R.hitLit = { hp1, hp2: gob.hp, alive: gob.alive }; R.shots.push({ name: 'shadowgob-lit-takes-the-blow', png: snap(2) });
  R.fit = fitCheck(labels());
`, 200000);
/* 6. the rookery's hung lamp: strike it from the floor, cut the cord lit (oil pool, burns the goblin) and dark (shatters) */
await scene('cord', `
  levelOn(44, 51);
  const lamp = BK.props().find(p => p.t === 'lantern' && p.hv && p.cord === 'lamp-rook'), gob = BK.enemies().find(e => e.t === 'shadowgob' && Math.abs(e.y - 832) < 4);
  for (const e of BK.enemies()) if (e !== gob && Math.hypot(e.x - 780, e.y - 832) < 400) e.alive = false;
  R.lamp = lamp && { x: lamp.x, y: lamp.y, y0: lamp.y0, lit: lamp.lit, cordState: lamp.cordState };
  const cord = (BK.L.ropes || []).find(r => r.id === 'lamp-rook'); R.cord = cord;
  gob.x = 776 + 10; gob.vx = 0; BK.P.x = 776 - 90; BK.P.y = 832; BK.P.inv = 0; BK.sim(30);
  R.shots.push({ name: 'rookery-hung-lamp-and-gallows', png: snap(2) });
  /* A: dark cord cut -> shatters */
  const kx = cord.knot[0] * 16 + 8, ky = cord.knot[1] * 16 + 8; R.knotAt = [kx, ky];
  const hit = (x, y, f) => { strike(x, y, f); };
  hit(kx - 16, 832, 1); for (let k = 0; k < 12; k++) BK.sim(1);
  R.afterDark = { state: lamp.cordState, gone: !!lamp.gone, y: lamp.y };
  R.shatterAt = untilText(/SHATTERS|FALLS/, 40); R.shots.push({ name: 'cord-cut-dark-lamp-shatters', png: snap(2) });
  for (let k = 0; k < 900; k++) BK.sim(1);   /* re-hung after 12 s */
  R.rehung = { state: lamp.cordState, gone: !!lamp.gone, y: lamp.y };
  /* B: strike it lit (from the floor, then the jump), then cut the cord onto the goblin standing in its width */
  gob.x = 776; gob.vx = 0; gob.hp = gob.maxHp || gob.hp; strike(776 - 14, 832, 1); for (let k = 0; k < 20; k++) BK.sim(1); R.strikeFloor = lamp.lit;
  if (!lamp.lit) { BK.P.x = 776 - 14; BK.P.y = 832; BK.P.vy = -230; BK.sim(8); BK.press('atk'); for (let k = 0; k < 20; k++) BK.sim(1); R.strikeJump = lamp.lit; }
  R.shots.push({ name: 'rookery-hung-lamp-lit', png: snap(2) });
  gob.x = 776; gob.vx = 0; hit(kx - 16, 832, 1); for (let k = 0; k < 14; k++) BK.sim(1);
  R.afterLit = { state: lamp.cordState, y: lamp.y, lit: lamp.lit };
  untilText(/OIL BURNS|LAMP FALLS/, 30); for (let k = 0; k < 20; k++) BK.sim(1); const hp = gob.hp; R.shots.push({ name: 'cord-cut-lit-oil-pool-burns-goblin', png: snap(2) });
  for (let k = 0; k < 60; k++) BK.sim(1); R.gobAfter = { hp0: hp, hp: gob.hp, alive: gob.alive, burn: gob.burn };
  R.fit = fitCheck(labels());
`, 200000);
/* 7. every new line, through number() in the real page: the hint box (teaching lines) or a floating word; where it is drawn, and does it fit the buffer */
await scene('lines', `
  BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero('knight'); BK.reset({ fresh: true }); BKT.setHeroLevel('knight', ${HL});
  const LV = LEVELS.findIndex(l => l.id === 'hanging'); const fresh = () => { BK.load(LV); BK.state = 'play'; BK.god = true; BK.sim(120); };
  const CALL = ['THE STOOP: OFF THE LINE', 'PARRIED: HIT HER', 'SLAMMED: HIT HER', 'SHE GOES FOR THE NET', 'SHE PULLS THE NET', 'THE NET: OUT FROM UNDER', 'HIT THE KNOT AT HER TALONS', 'THE NET FALLS ON HER', 'NETTED: MASH TO TEAR FREE', 'THE SANDBAG HANGS OVER HER: CUT THE DECK', 'BRING IT INTO THE LIGHT', 'IT SLIPS THE BLOW', 'THE LAMP FALLS', 'THE OIL BURNS', 'THE LAMP SHATTERS', 'RE-HUNG'];
  const FLOAT = ['THE NET MISSES', 'THE STOOP IS TURNED', 'REVEALED'];
  const SHOW = { 'THE SANDBAG HANGS OVER HER: CUT THE DECK': 'hint-sandbag-hangs-over-her', 'NETTED: MASH TO TEAR FREE': 'hint-netted-mash', 'THE STOOP: OFF THE LINE': 'hint-the-stoop-off-the-line', 'BRING IT INTO THE LIGHT': 'hint-bring-it-into-the-light', 'THE OIL BURNS': 'hint-the-oil-burns' };
  R.rows = {};
  for (const k of CALL.concat(FLOAT)) { fresh(); window.__textRec = []; BKT.number(BK.P.x, BK.P.y - 40, k, '#ffd36b'); const h = BKT.hintNow; let drawn = false, box = null;
    for (let i = 0; i < 12 && !drawn; i++) { window.__textRec = []; BK.step(1); const t = window.__textRec.filter(o => o.kind === 'text' && (o.s === k || (h.msg && o.s === h.msg))); if (t.length) { drawn = true; box = t.map(o => [Math.round(o.x0), Math.round(o.y0), Math.round(o.w), Math.round(o.h)]); } else if (!SHOW[k] && !FLOAT.includes(k)) {} }
    if (SHOW[k] && drawn) R.shots.push({ name: SHOW[k], png: snap(2) });
    R.rows[k] = { hint: h.msg === k, t: +(h.t || 0).toFixed(1), drawn, box, fits: box ? box.every(b => b[0] >= 0 && b[0] + b[2] <= BK.buf.width) : null }; }
  R.bad = Object.entries(R.rows).filter(([k, v]) => !v.drawn || v.fits === false).map(([k]) => k);
`, 300000);
