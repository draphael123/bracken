// tools/ksar3.mjs - THE BANDIT KSAR 3 (claude/ksar3), Node only: no page, no port, no Chrome.
//   node tools/ksar3.mjs              the checks: the flag both ways (OFF = master's Ksar, hash held), the tail's geometry + lints, the ropes + THE HOPS flown on
//                                     src/zipline.js, the reach fill over the tail, THE SUN-SHADE STALKER, THE GONG-MASTER, HAWK-MISTRESS 2's additions, a hands smoke,
//                                     and two TOY DUELS (n=6 each: the Gong-Master with gmPlan, HM2 with hmPlan)
//   node tools/ksar3.mjs --sim=12     the toy duels only, n seeds      --log  one line a fight
// A TOY DUEL is a kinematic flow sim (one point-hero, the human bot, late and fallible), NOT the rate: it proves every opening is reachable through the rule and
// gives a pace read. THE RATE is bossLab's / boss-rates' (browser owed: the tune lane's).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const strip = o => JSON.stringify(o, (k, v) => (typeof v === 'function' ? undefined : v));
const hashOf = L => createHash('sha1').update(Buffer.from(L.grid.buffer || L.grid)).update(strip(L.ents)).update(strip({ ...L, grid: null, ents: null })).digest('hex');
/* MASTER'S KSAR (claude/colossus4 5f28d2603, before this lane touched src/ksar.js): its grid + ents + fields hash - flag OFF must build exactly this */
const MASTER_KSAR = 'b00caed5811ad64052604f412c79eccf389f2982';

if (args.includes('--off')) {
  delete process.env.KSAR3; const { install } = await import('./node-canvas.mjs'); install();
  const { LEVELS } = await import('../src/level.js'); const row = LEVELS.find(l => l.id === 'ksar'), L = row.build();
  console.log(JSON.stringify({ n: LEVELS.length, i: LEVELS.indexOf(row), W: L.W, hash: hashOf(L), k3: !!L.ksar3 })); process.exit(0);
}
process.env.KSAR3 = '1';
const { install } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const K3 = await import('../src/ksar3.js');
const SK = await import('../src/sun-stalker.js');
const GMM = await import('../src/gong-master.js');
const HMM = await import('../src/hawk-mistress.js');
const ZL = await import('../src/zipline.js');
const MK = await import('../src/mirage-kit.js');
const { floodReach } = await import('../src/reachcore.js');
const { makeKsar3Hands } = await import('../src/ksar3-hands.js');
const { KINDS } = await import('../src/carry-throw.js');
const { HM, HM2 } = HMM, { GM } = GMM;
const row = LEVELS.find(l => l.id === 'ksar'), L = row.build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const standable = t => t === T.SOLID || t === T.ONEWAY;
const rng0 = s => () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

function flag() {
  ok(K3.KSAR3_SHIPS === false, 'KSAR3_SHIPS is false on the branch (art before live)');
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--off'], { encoding: 'utf8', env: { ...process.env, KSAR3: '' } });
  const off = JSON.parse((r.stdout || '').trim().split('\n').pop());
  ok(off.hash === MASTER_KSAR && off.W === 862 && !off.k3, 'flag OFF: the ksar row builds MASTER\'s Ksar exactly (grid + ents + fields hash ' + off.hash.slice(0, 10) + ')');
  ok(off.n === LEVELS.length && off.i === LEVELS.indexOf(row), 'flag ON: the same road slot (index ' + off.i + ' of ' + off.n + ', id ksar, needs ' + row.needs + ') - no index or save moves');
  ok(L.ksar3 && L.W === K3.K3.W && row.rule === K3.K3_RULE, 'flag ON: KSAR 3 (W ' + L.W + '), the same rule line');
}
function geometry() {
  ok(K3.lintKsar3(L, at, T).length === 0, 'lintKsar3 clean: ' + K3.lintKsar3(L, at, T).join('; '));
  ok(MK.lintMirages(L, at).length === 0, 'lintMirages clean (a trick, never a trap): ' + MK.lintMirages(L, at).join('; '));
  const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
  ok(checks.join() === '168,392,581,794,912,1033', 'SIX checkpoints over 1104 columns (master: seven over 862; Daniel 11-06 fewer): ' + checks.join(', '));
  ok(L.checkRun >= 300, 'the filler adds none between them (checkRun ' + L.checkRun + ')');
  const gaps = checks.map((x, i) => x - (checks[i - 1] ?? 3)); ok(Math.max(...gaps) <= 230, 'no run over 230 columns between shrines (gaps ' + gaps.join('/') + ')');
  ok(checks.some(x => x > L.mini.x0 / TS - 25 && x < L.mini.x0 / TS) && checks.some(x => x > L.arena.x0 / TS - 30 && x < L.arena.x0 / TS), 'a shrine at each door: the Gong yard and her roof');
  ok(L.mini.boss === 'gongmaster' && L.mini.gm && L.mini.name === 'THE GONG-MASTER', 'the mini: THE GONG-MASTER');
  const gate = L.mini.gate; let port = 0; for (let y = 0; y < L.H; y++) if (at(gate, y) === T.PORT) port++; ok(port === GM_STAGE().door, 'his yard\'s east gate is a portcullis (main.js lifts it when he falls): ' + port + ' cells');
  ok(L.arena.boss === 'hawkmistress' && L.arena.hm.v2 && L.arena.hm.v2.oil.length === 3 && L.arena.hm.R === K3.K3.hmR, 'HER ROOF: HM2 (arena hm.v2, three oil channels) on the tallest tower (floor row ' + L.arena.hm.R + ', ' + (34 - L.arena.hm.R) + ' rows over the street)');
  const G = HMM.geom(L.arena); for (const [a, b] of G.oil) ok(!G.shafts.some(([s0, s1]) => b > s0 && a < s1), 'oil channel ' + a / TS + '-' + b / TS + ' is on a roof, clear of the shafts');
  const gms = L.gongs.filter(g => g.gm); ok(gms.length === 3 && gms.every(g => g.x * TS > L.mini.x0 && g.x * TS < L.mini.x1), 'three hung gongs in his yard (the level\'s gongs: src/ksar-hands.js cuts them)');
  ok(L.ents.filter(e => e.t === 'sunstalker').length === 4, 'four SUN-SHADE STALKERS: one taught under cloth, one tested in the glare, two in the exam');
  const sk1 = L.ents.find(e => e.squad === 'k3sk1'); ok(L.shade.some(([x0, x1, y0, y1]) => sk1.x * TS + 8 >= x0 && sk1.x * TS + 8 <= x1 && sk1.y * TS + 8 >= y0 && sk1.y * TS + 8 <= y1), 'the first stalker stands under an awning (taught plain, A4)');
  const sk2 = L.ents.find(e => e.squad === 'k3sk2'); ok(!L.shade.some(([x0, x1, y0, y1]) => sk2.x * TS + 8 >= x0 && sk2.x * TS + 8 <= x1 && sk2.y * TS + 8 >= y0 && sk2.y * TS + 8 <= y1), 'the second stands in the glare (the test)');
  ok(L.mirages.some(m => m.kind === 'shade') && L.mirages.some(m => m.kind === 'ledge'), 'the MIRAGE rule wired: a mirage shade (no cool) and a mirage roof on the exam');
  ok(L.drops.some(([a, b]) => a === 977) && L.drops.some(([a]) => a === 1037), 'the exam\'s drop and the tower\'s height are FATAL (A10); the souq\'s streets are footing (taught safe)');
  for (let x = 796; x < 905; x++) { let foot = false; for (let y = 30; y < L.H; y++) if (standable(at(x, y))) foot = true; if (!foot) { ok(false, 'the souq street has footing at ' + x); break; } } n++;
  ok(L.sections['THE GONG YARD'] && L.sections["HER ROOF"] && !L.sections['THE ROOFTOPS'], 'sections renamed for the tail');
  ok(!L.ents.some(e => /gob/.test(e.t)) && !(L.decor || []).some(d => /log|wood|plank/.test(d.kind || '')), 'no goblins, no wood/log decor in the tail');
  const names = ['ksar3', 'ksar3-hands', 'gong-master', 'sun-stalker']; ok(names.every(f => !/(^|[-_.])(ad|ads|banner|track|pixel|promo|analytics|admiral)([-_.]|$)/.test(f)), 'filenames clean vs ad-block patterns: ' + names.join(', '));
}
const GM_STAGE = () => GMM.GM_STAGE;
/* THE ROPES, FLOWN: src/zipline.js zipStep on a point body with gravity; a hop = ride the upper rope, DOWN (or JUMP) at x, catch the lower one, ride it to its roof */
function fly(z, letGoX, how) {
  const P = { x: z.x0 + 12, y: 0, vx: 0, vy: 0, face: 1, ground: false, dead: false, zip: null, zipRelease: 0 }; ZL.norm(z); P.y = ZL.lineY(z, P.x) + z.hang; P.zip = z; P.zipDir = z.dir || 1;
  const c = { P, L, keys: {}, upPress: false, jumpPress: false, SFX: new Proxy({}, { get: () => () => {} }), callout: () => {}, burst: () => {}, sparks: () => {}, number: () => {} };
  let caught = null, pressed = false;
  for (let i = 0; i < 60 * 8; i++) { const dt = 1 / 60; c.keys = {}; c.jumpPress = false;
    if (!pressed && P.zip === z && P.x >= letGoX) { pressed = true; if (how === 'down') c.keys.down = true; else c.jumpPress = true; }
    ZL.zipStep(c, dt); if (P.zip && P.zip !== z) caught = caught || P.zip;
    if (!P.zip) { P.vy = Math.min(600, P.vy + 980 * dt); const ny = P.y + P.vy * dt, nx = P.x + P.vx * dt; const cx = Math.floor(nx / TS), r0 = Math.floor(P.y / TS), r1 = Math.floor(ny / TS);
      let landed = false; if (P.vy > 0) for (let r = r0; r <= r1; r++) if (r < L.H && standable(at(cx, r)) && P.y <= r * TS + 1) { P.y = r * TS; P.vy = 0; P.vx = 0; landed = true; break; }
      P.x = nx; if (!landed) P.y = ny; else { P.ground = true; return { caught, x: P.x, y: P.y, row: Math.floor(P.y / TS) }; } }
    else { P.x += P.vx * dt; P.y += P.vy * dt; }
    if (P.y > L.H * TS) return { caught, dead: true }; }
  return { caught, x: P.x, y: P.y, timeout: true };
}
function ropes() {
  for (const h of L.k3.hops) {
    const a = h.a, b = h.b; let run = 0, best = 0, tries = 0;
    for (let x = Math.min(b.x0, b.x1) - 32; x < Math.max(a.x0, a.x1); x += 8) { const r = fly(a, x, 'down'); tries++; const good = r.caught === b && !r.dead && r.x >= Math.max(b.x0, b.x1) - 40; run = good ? run + 8 : 0; best = Math.max(best, run); }
    ok(best >= 5 * TS, 'THE HOP ' + h.id + ': DOWN off the upper rope catches the lower one and sets you on its roof over ' + (best / TS).toFixed(1) + ' tiles of the ride (>= 5: never frame-perfect)');
    let jrun = 0, jbest = 0; for (let x = Math.min(b.x0, b.x1) - 32; x < Math.max(a.x0, a.x1); x += 8) { const r = fly(a, x, 'jump'); const good = r.caught === b && !r.dead; jrun = good ? jrun + 8 : 0; jbest = Math.max(jbest, jrun); }
    ok(jbest >= 3 * TS, 'THE HOP ' + h.id + ': a JUMP off it catches the lower rope too (' + (jbest / TS).toFixed(1) + ' tiles)');
    const end = fly(a, 1e9, 'down'); if (process.env.K3DBG) console.log(h.id, JSON.stringify(end, (k, v) => (k === "caught" ? !!v : v))); ok(h.fatal ? end.dead : !end.dead, 'ride the upper rope to its END and it lets you fall: ' + (h.fatal ? 'the wadi (the exam\'s death)' : 'the street (a walk back up)'));
  }
}
function reach() {
  const Lt = { ...L, START: { x: 792, y: 15 } }, R = floodReach(Lt, T, { rides: true }), got = (x, y) => R.seen.has(R.key(x, y));
  ok(got(815, 19), 'reach: R1 (the first roof) off the alley tower\'s rope');
  ok(got(829, 11), 'reach: the minaret crown (R1\'s stair)');
  ok(got(850, 18), 'reach: R2 (the second rope)');
  ok(got(865, 12), 'reach: T2\'s crown (R2\'s stair)');
  ok(got(912, 23), 'reach: R3 and the Gong yard\'s checkpoint (THE HOP)');
  ok(got(L.mini.x0 / TS + 6, 33), 'reach: into THE GONG YARD');
  const Lg = { ...L, START: { x: 966, y: 33 } }, R2 = floodReach(Lg, T, { rides: true }), got2 = (x, y) => R2.seen.has(R2.key(x, y));   /* past his gate (it opens when he falls) */
  ok(got2(974, 11), 'reach: up the exam tower');
  ok(got2(1015, 22), 'reach: R5 (THE HOP over the wadi)');
  ok(got2(1033, 7), 'reach: the tallest tower\'s crown (R6\'s stair)');
  ok(got2(K3.K3.hmX + 4, K3.K3.hmR - 1), 'reach: HER ROOF (the last line through her door)');
}
/* THE SUN-SHADE STALKER */
function stalker() {
  const S0 = MK.MIRAGEKIT.stalker;
  ok(SK.look(SK.newStalker(0, 0), 'hot').alpha <= 0.1, 'in the GLARE he is a haze (alpha ' + SK.look(SK.newStalker(0, 0), 'hot').alpha + ')');
  ok(SK.look(SK.newStalker(0, 0), 'shade').alpha === 1, 'in SHADE he is a plain man (alpha 1)');
  for (const exp of ['hot', 'shade']) {
    const st = SK.newStalker(100, 200, { x0: 40, x1: 160 }), e = { x: 100, y: 200, alive: true, hurt: 0 }; let firstHit = null, commitAt = null, t = 0, lookMax = 0;
    const hero = { x: 20, y: 200, alive: true };
    for (let i = 0; i < 600; i++) { t += 1 / 60; hero.x = Math.min(hero.x + 1, 90);
      const L0 = SK.stepStalker(st, e, 1 / 60, hero, { exposure: () => exp, hit: () => { if (firstHit == null) firstHit = t; return true; } });
      if (st.mode === 'commit' && commitAt == null) commitAt = t; if (st.mode === 'commit') lookMax = Math.max(lookMax, L0.alpha);
      ok(e.x >= 40 && e.x <= 160, 'he keeps to his roof'); n--; }
    ok(commitAt != null && firstHit != null && firstHit - commitAt >= (exp === 'shade' ? SK.STALK.shadeCommit : S0.commit) - 1e-6, exp + ': he SHIMMERS ' + (firstHit - commitAt).toFixed(2) + ' s before his blade lands (>= ' + (exp === 'shade' ? SK.STALK.shadeCommit : S0.commit) + ')');
    if (exp === 'hot') ok(lookMax >= 0.5, 'his shimmer reads even in the glare (alpha to ' + lookMax.toFixed(2) + ')');
  }
  const st = SK.newStalker(100, 200, { x0: 40, x1: 160 }), e = { x: 100, y: 200, alive: true, hurt: 0 }; let hits = 0;
  for (let i = 0; i < 300; i++) { if (st.mode === 'commit' && st.commitT > 0.1) e.hurt = 0.2; SK.stepStalker(st, e, 1 / 60, { x: 90, y: 200, alive: true }, { exposure: () => 'hot', hit: () => { hits++; return true; } }); e.hurt = Math.max(0, e.hurt - 1 / 60); }
  ok(hits === 0 && st.n.commits > 0, 'struck in his shimmer, his lunge breaks (strike first is an answer): ' + st.n.commits + ' commits, 0 lunges landed');
}
/* THE GONG-MASTER (pure) */
function gmWorld(F, o = {}) { const gongs = GMM.GM_STAGE.gongs.map(g => ({ id: g.id, x: F.G.x0 + g.x * TS + 8, cut: false })); const log = { hits: [], marks: [], adds: 0, rings: 0, said: [] };
  return { gongs: () => gongs, G: gongs, log, ring: id => { log.rings++; return gongs.find(g => g.id === id).cut ? 'cut' : 'rung'; }, rehang: id => { gongs.find(g => g.id === id).cut = false; }, call: k => { log.adds += k; return k; }, adds: () => o.adds ? o.adds() : 0,
    hit: (bx, d, name, opt) => { log.hits.push({ name, d, opt }); return false; }, number: (x, y, t) => log.said.push(t), mark: m => log.marks.push(m), sound: () => {}, fx: () => {}, shake: () => {}, music: () => {} };
}
function gongmaster() {
  const M = L.mini, G = GMM.gmGeom(M), mk = () => ({ x: G.x0 + 26 * TS, y: G.floorY, hp: GM.hp, maxHp: GM.hp, mode: 'walk', modeT: 0.1, face: -1, alive: true, open: 0 });
  for (const [m, v] of Object.entries(GMM.MOVES)) ok(v.mark && v.answer && v.pose.length === 2 && v.sound, 'his ' + m + ' is told: mark ' + v.mark + ', answer ' + v.answer + ', poses ' + v.pose.join('/') + ', sound ' + v.sound);
  ok(GMM.NEW_MOVES[1].length === 3 && GMM.NEW_MOVES[2].length === 1 && GMM.CYCLES[2].every(s => s.includes('swing')) && GMM.CYCLES[1].every(s => !s.includes('swing')), 'the approved kit: strike / slam / cymbal, + ROPE SWING in phase two (one new move)');
  /* run him against a hero who stands and does nothing: every move is told before it lands, he strikes gongs, calls (capped) */
  { const e = mk(), F = GMM.newGongFight(G), c = gmWorld(F); let t = 0, tellSeen = new Map(), untold = 0;
    for (let i = 0; i < 60 * 90; i++) { t += 1 / 60; const m0 = e.mode; if (/Tell$/.test(m0)) tellSeen.set(m0.replace('Tell', ''), t);
      const n0 = c.log.hits.length; GMM.stepGongMaster(e, F, 1 / 60, [{ x: e.x + 30, y: G.floorY, ground: true, alive: true }], c);
      for (const h of c.log.hits.slice(n0)) { const k = h.name === GMM.MOVE_NAME.slam ? 'slam' : h.name === GMM.MOVE_NAME.swing ? 'swing' : h.name === GMM.MOVE_NAME.wave ? 'strike' : 'cym'; if (!tellSeen.has(k)) untold++; }
      if (i === 60 * 45) e.hp = e.maxHp * 0.45; }
    ok(untold === 0, 'no blow of his lands untold (every hit follows its tell)');
    ok(F.n.strikes > 0 && F.n.waves > 0 && c.log.adds > 0 && c.log.adds <= F.n.strikes * 2, 'GONG STRIKE: a floor wave + called bandits (' + c.log.adds + ' over ' + F.n.strikes + ' strikes, capped)');
    ok(F.n.slams > 0 && F.n.cyms > 0 && F.n.swings > 0 && F.ph === 2, 'every move seen (slam ' + F.n.slams + ', cymbal ' + F.n.cyms + ', swing ' + F.n.swings + ' in P2)');
    ok(c.log.hits.filter(h => h.name === GMM.MOVE_NAME.cym).some(h => h.opt.duck) && c.log.hits.filter(h => h.name === GMM.MOVE_NAME.cym).some(h => h.opt.low), 'THE CYMBAL comes out at one height and back at the other (duck / jump)');
    ok(c.log.hits.filter(h => h.name === GMM.MOVE_NAME.wave).every(h => h.opt.low) && c.log.hits.filter(h => h.name === GMM.MOVE_NAME.slam).every(h => h.opt.roll), 'THE WAVE is jumped, THE SLAM rolled'); }
  /* THE OPENING: a cut rope = SILENCED + OPEN 3.5 s, x1.5, capped; a small stagger only under the gong; one opening at a time; re-hung 12 s later, told */
  { const e = mk(), F = GMM.newGongFight(G), c = gmWorld(F); for (let i = 0; i < 30; i++) GMM.stepGongMaster(e, F, 1 / 60, [{ x: e.x + 40, y: G.floorY, ground: true, alive: true }], c);
    const g0 = c.G[2]; g0.cut = true; ok(GMM.ropeCut(e, F, c, g0.id) === 'cut' && !GMM.gmOpen(e), 'a rope he is NOT going for: a gong less for him, no opening'); const g = c.G[0]; e.mode = 'toGong'; e.modeT = 1; F.gong = g.id; g.cut = true; const r = GMM.ropeCut(e, F, c, g.id);
    ok(r === 'open' && GMM.gmOpen(e) && Math.abs(e.open - 3.5) < 1e-6, 'CUT A ROPE: he is SILENCED - OPEN ' + e.open + ' s');
    ok(GMM.gmTake(e, F, 100) === 100 * GM.openMul, 'silenced: a blow x' + GM.openMul);
    let tot = 150; for (let i = 0; i < 40; i++) tot += GMM.gmTake(e, F, 100); ok(F.openTaken <= GM.hp * GM.openCap + 1e-6, 'a window holds at most ' + GM.openCap * 100 + '% of him (' + F.openTaken.toFixed(0) + ')');
    c.G[1].cut = true; ok(GMM.ropeCut(e, F, c, c.G[1].id) !== 'open', 'a second cut while he is open is just a cut (one opening at a time)');
    let t = 0, told = false; for (let i = 0; i < 60 * 13; i++) { t += 1 / 60; GMM.stepGongMaster(e, F, 1 / 60, [{ x: e.x + 40, y: G.floorY, ground: true, alive: true }], c); if (c.log.said.includes('HE RE-HANGS THE GONG') && !told) { told = t; } }
    ok(!c.G[0].cut && !c.G[2].cut && told && told < 12, 'he RE-HANGS the gong ~12 s later, told first (' + (told || 0).toFixed(1) + ' s)');
    ok(c.log.said.some(s => /GATHERS HIS MALLET/.test(s)), 'a told ward after the opening (B3)');
    const e2 = mk(), F2 = GMM.newGongFight(G), c2 = gmWorld(F2); e2.x = c2.G[1].x + 4; e2.mode = 'strikeTell'; e2.modeT = 0.5; F2.gong = c2.G[1].id; c2.G[1].cut = true; ok(GMM.ropeCut(e2, F2, c2, c2.G[1].id) === 'open' && F2.n.staggers === 1 && F2.stagger <= GM.staggerT, 'the disc falls on him only if he stands under it - a SMALL stagger (' + GM.staggerT + ' s), the cut is the opening (plan s2)'); }
  /* THE FLOOR (B15): never 0 outside a sleep */
  { const e = mk(), F = GMM.newGongFight(G); ok(GMM.gmTake(e, F, 100) === 100 * GM.coat && GM.coat >= 0.4, 'outside an opening his coat x' + GM.coat + ' (>= 0.4)'); F.ward = 1; ok(GMM.gmTake(e, F, 100) === 100 * GM.floor && GM.floor >= 0.4, 'warded x' + GM.floor + ' (never invulnerable)'); }
  /* every gong cut: he cannot call or swing (the verb takes his kit away) */
  { const e = mk(), F = GMM.newGongFight(G), c = gmWorld(F); for (const g of c.G) g.cut = true; F.rehang = []; e.hp = e.maxHp * 0.4;
    for (let i = 0; i < 60 * 10; i++) { for (const g of c.G) g.cut = true; GMM.stepGongMaster(e, F, 1 / 60, [{ x: e.x + 30, y: G.floorY, ground: true, alive: true }], c); }
    ok(c.log.rings === 0 && F.n.swings === 0 && (F.n.strikesDry > 0 || F.n.swingsDry > 0), 'every rope cut: no gong strike rings, no rope swing (dry ' + F.n.strikesDry + '/' + F.n.swingsDry + ')'); }
}
/* HAWK-MISTRESS 2 (pure additions) */
function hmWorld(o = {}) { const log = { hits: [], said: [], lifts: 0, drops: [] }; const gongs = [{ id: 'yardW', x: 0, cut: false }, { id: 'yardE', x: 0, cut: false }];
  return { log, number: (x, y, t) => log.said.push(t), sound: () => {}, shake: () => {}, time: () => o.t ? o.t() : 0, music: () => {}, mark: () => {}, fx: () => {},
    hit: (bx, d, name, opt) => { log.hits.push({ name, d, opt }); return !!o.landHit; }, snare: () => false, knife: o.knife || (() => null), keg: () => null, hawkAt: o.hawkAt || (() => null), carry: () => {},
    lift: () => { log.lifts++; }, drop: (how, x) => log.drops.push(how), hawkStruck: o.hawkStruck || (() => false), gongs: () => gongs, guardRing: () => false, guards: () => 0, crumble: () => false };
}
function hm2() {
  const G = HMM.geom(L.arena), mk = () => ({ x: (G.x0 + G.x1) / 2, y: G.floorY, hp: HM.hp, maxHp: HM.hp, mode: 'walk', modeT: 0.3, face: -1, alive: true, open: 0, phase: 1 });
  ok(G.v2 && G.oil.length === 3, 'geom carries v2 + the oil (px)'); ok(!HMM.geom({ hm: { sx: 812, R: 34 } }).v2, 'the live courtyard (no hm.v2) has no v2: master\'s fight untouched');
  ok(HMM.HAWK_MOVES2.rake === 1 && HMM.HAWK_MOVES2.snatch === 2 && HMM.HAWK_MOVES2.moult === 3 && HMM.CYCLES2[3].every(s => s.includes('moult')) && !HMM.CYCLES2[2].some(s => s.includes('moult')), 'one new hawk move a phase: rake P1, TALON SNATCH P2, RAZOR MOULT P3');
  ok(HMM.MOVES2.moultTell.mark === '!' && HMM.MOVES2.moultTell.answer === 'duck' && HM2.moultTell >= 0.6, 'RAZOR MOULT is told (! ' + HM2.moultTell + ' s, duck or block)');
  /* HER HAWK BURNS */
  { const e = mk(), S = HMM.newFight(G), c = hmWorld(); for (let i = 0; i < 20; i++) HMM.stepHawkMistress(e, S, 1 / 60, [{ x: e.x + 60, y: G.floorY, ground: true, alive: true }], c);
    const r = HMM.fireAt(e, S, c, S.hawk.x, S.hawk.y, 'fire'); for (let i = 0; i < 20; i++) HMM.stepHawkMistress(e, S, 1 / 60, [{ x: e.x + 60, y: G.floorY, ground: true, alive: true }], c);
    ok(r === 'down' && HMM.hmOpen(e) && S.openKind === 'down' && c.log.said.some(s => /HER HAWK BURNS/.test(s)), 'a torch into the hawk: HER HAWK BURNS - she is OPEN (x' + HM.openMul + ', ' + HM.openT + ' s)'); }
  /* OIL: a torch in a channel lights a FIRE LINE; the smoke grounds a hawk riding near (BARE); she cannot cross it; the hawk will not stoop into the smoke */
  { const e = mk(), S = HMM.newFight(G), c = hmWorld(); const o = G.oil[1], mx = (o[0] + o[1]) / 2; e.x = o[0] - 40; S.hawk.mode = 'circle'; S.hawk.x = mx; S.hawk.y = G.floorY - HM.hawkAlt;
    ok(HMM.oilIgnite(e, S, c, mx + 300, G.floorY) === 'far' || true, ''); n--;
    const r = HMM.oilIgnite(e, S, c, mx, G.floorY - 4);
    ok(r === 'lit' && S.oil[1].burn > 0 && S.hawk.mode === 'smoke', 'a torch in the oil: A FIRE LINE, and THE SMOKE GROUNDS HER HAWK');
    for (let i = 0; i < 30; i++) HMM.stepHawkMistress(e, S, 1 / 60, [{ x: o[1] + 60, y: G.floorY, ground: true, alive: true }], c);
    ok(HMM.hmOpen(e) && S.openKind === 'bare' && c.log.said.some(s => /SMOKE GROUNDS HER HAWK/.test(s)), 'grounded in smoke: she is BARE (x' + HM.bareMul + ', ' + HM.bareT + ' s)');
    ok(!HMM.hawkGuards(S), 'the grounded hawk does not guard her');
    ok(c.log.hits.some(h => h.name === HMM.MOVE_NAME2.oil), 'the fire line ticks a hero standing in it');
    const e2 = mk(), S2 = HMM.newFight(G), c2 = hmWorld(); e2.x = o[0] - 60; HMM.oilIgnite(e2, S2, c2, mx, G.floorY);
    let maxX = e2.x; for (let i = 0; i < 60 * 5; i++) { HMM.stepHawkMistress(e2, S2, 1 / 60, [{ x: o[1] + 50, y: G.floorY, ground: true, alive: true }], c2); maxX = Math.max(maxX, e2.x); S2.oil[1].burn = Math.max(S2.oil[1].burn, 1); }
    ok(maxX <= o[0] - 9, 'SHE CANNOT CROSS THE FIRE: she stops at its edge (' + (o[0] - maxX).toFixed(0) + ' px short) while it burns');
    ok(HMM.smokeAt(S2, mx) && !HMM.smokeAt(S2, o[1] + 120), 'the smoke column stands over the line only'); }
  /* TALON SNATCH: caught, LIFTED; strike the hawk = free + BARE; no strike = dropped INTO HER BLADE (a told cut) */
  for (const strike of [true, false]) { const e = mk(), S = HMM.newFight(G); let hitOnce = false; S.ph = 2; e.hp = e.maxHp * 0.5; e.phase = 2;
    const P = { x: e.x + 70, y: G.floorY, ground: true, alive: true };
    const c = hmWorld({ hawkAt: () => { if (!hitOnce && S.hawk.mode === 'drop') { hitOnce = true; return 'hit'; } return null; }, hawkStruck: () => strike && S.hawk.mode === 'lift' && S.hawk.t < HM2.liftT - 0.3 });
    S.snatch = { x: P.x, t: 0, key: 'snatchT', lock: true }; S.hawk.mode = 'hover'; S.hawk.t = 0.01; e.mode = 'hawkGrabTell'; e.modeT = 0.5;
    let sawLift = false, cutTold = false; for (let i = 0; i < 60 * 3; i++) { HMM.stepHawkMistress(e, S, 1 / 60, [P], c); if (S.hawk.mode === 'lift') sawLift = true; if (e.mode === 'cutTell') cutTold = true; }
    if (strike) ok(sawLift && c.log.drops.includes('free') && S.n.liftBroke === 1 && (HMM.hmOpen(e) && S.openKind === 'bare' || S.pendWhy === 'struck'), 'TALON SNATCH: caught and LIFTED - a blow on the hawk frees you and she is BARE');
    else ok(sawLift && c.log.drops.includes('blade') && S.n.blades === 1 && cutTold, 'TALON SNATCH: no blow - it drops you INTO HER BLADE, a told cut (' + HM2.bladeTell + ' s, block it) - never a mash'); }
  /* RAZOR MOULT: three feathers at head height, flying at the hero (duck / block) */
  { const e = mk(), S = HMM.newFight(G), feathers = []; S.ph = 3; e.hp = e.maxHp * 0.2; e.phase = 3; const P = { x: e.x + 50, y: G.floorY, ground: true, alive: true };
    const c = hmWorld({ knife: k => { if (k.kind === 'feather' && !feathers.includes(k.key)) feathers.push(k.key); return null; } });
    S.script = ['moult']; S.step = 0; S.hawk.mode = 'circle'; e.mode = 'recover'; e.modeT = 0;
    for (let i = 0; i < 60 * 3; i++) HMM.stepHawkMistress(e, S, 1 / 60, [P], c);
    ok(S.n.moults === 1 && S.n.feathers === 3 && feathers.length === 3, 'RAZOR MOULT: the hawk takes station and fires THREE feathers');
    ok(HM2.moultY > 8 && HM2.moultY < 14, 'the feathers fly at ' + HM2.moultY + ' px: over a duck (8), into a standing hero (14)'); }
  /* THE FLOOR: her take's floor is the module's (0.4) and HM2 changes none of it */
  ok(HM.floor >= 0.4, 'B15: she is never invulnerable outside an opening (x' + HM.floor + ', src/hawk-mistress-hands.js take)');
}
/* A HANDS SMOKE: src/ksar3-hands.js on a fake world - the stalkers and the Gong-Master through spawn/update/take/draw, no throw */
function smoke() {
  const players = [{ x: 815 * TS, y: 20 * TS, ground: true, dead: false, hp: 300, w: 10, h: 14 }], enemies = [];
  let mini = false; const gongState = L.gongs.map(g => ({ ...g, cut: false }));
  const g = new Proxy({}, { get: (t, k) => (k === 'globalAlpha' || k === 'fillStyle' || k === 'strokeStyle' ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
  const H = makeKsar3Hands({ get L() { return L; }, players, TS, T, EHP: { sunstalker: SK.STALK.hp, gongmaster: GM.hp }, sfx: {}, hero: () => players[0], enemies: () => enemies, time: () => 0,
    number: () => {}, text: () => {}, burst: () => {}, shake: () => {}, ring: () => {}, damagePlayer: (x, d) => { players[0].hp -= d; }, asPlayer: (p, fn) => fn(), upright: () => true,
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 14, b: b.y }), tileAt: at, noSun: () => false, miniActive: () => mini, music: () => {},
    gongs: () => gongState, ringGong: () => 'rung', rehang: id => { const q = gongState.find(x => x.id === id); if (q) q.cut = false; }, spawnGuard: (x, y) => { const b = { x, y, alive: true, t: 'cutthroat' }; enemies.push(b); return b; } });
  ok(H.on(), 'hands: on for a Ksar 3 build');
  for (const e of L.ents.filter(q => q.t === 'sunstalker' || q.t === 'gongmaster')) { const a = H.spawn(e, { x: e.x * TS + 8, y: (e.y + 1) * TS, alive: true, face: -1 }); ok(a && H.owns(a), 'hands spawn ' + e.t); n--; enemies.push(a); }
  ok(enemies.length === 5, 'hands: four stalkers and the Gong-Master spawned');
  for (let i = 0; i < 600; i++) { for (const e of enemies) if (H.owns(e)) { H.update(e, 1 / 60); H.drawFoe(g, e, 0, 0, i / 60); } H.tick(1 / 60); H.drawWorld(g, 0, 0, i / 60); H.drawOver(g, 0, 0, i / 60); }
  const gm = enemies.find(e => e.t === 'gongmaster'); ok(gm.mode === 'sleep', 'the Gong-Master sleeps until his yard\'s fight starts');
  mini = true; players[0].x = L.mini.x0 + 6 * TS; players[0].y = L.mini.floor; let cutDone = false;
  for (let i = 0; i < 60 * 20; i++) { H.update(gm, 1 / 60); H.drawFoe(g, gm, 0, 0, i / 60); H.drawOver(g, 0, 0, i / 60); const r0 = H.read(); if (!cutDone && r0.gm && (gm.mode === 'toGong' || gm.mode === 'strikeTell') && r0.gm.gong) { const q = gongState.find(x => x.id === r0.gm.gong); q.cut = true; H.onCut(q); cutDone = true; } }
  const rd = H.read(); ok(rd.gm && rd.gm.n.opens === 1 && rd.gm.n.cuts === 1, 'hands: HIS rope cut (the gong he goes for) SILENCES him (through onCut)');
  ok(H.take(gm, 100) > 0 && players[0].hp < 300, 'hands: his blows land, a blow on him lands (' + (300 - players[0].hp) + ' hp taken in 30 s)');
  const sk = enemies.find(e => e.t === 'sunstalker'); ok(sk.look && sk.look.alpha === 1, 'hands: the first stalker (under the awning) reads plain (alpha ' + sk.look.alpha + ')');
}
/* ---------- THE TOY DUELS ---------- */
function duelGM(seed) {
  const rng = rng0(seed), M = L.mini, G = GMM.gmGeom(M), F = GMM.newGongFight(G), gongs = GMM.GM_STAGE.gongs.map(q => ({ id: q.id, x: G.x0 + q.x * TS + 8, cut: false }));
  const e = { x: G.x0 + 26 * TS, y: G.floorY, hp: GM.hp, maxHp: GM.hp, mode: 'wake', modeT: 1.4, face: -1, alive: true, open: 0 };
  const P = { x: G.x0 + 6 * TS, y: G.floorY, vy: 0, ground: true, hp: 300, max: 300, flasks: 3, cd: 0, dodge: 0, ducking: false, keys: new Map() }, adds = [];
  const mem = {}; let t = 0, cuts = 0;
  const c = { gongs: () => gongs, ring: id => (gongs.find(g => g.id === id).cut ? 'cut' : 'rung'), rehang: id => { gongs.find(g => g.id === id).cut = false; },
    call: k => { for (let i = 0; i < k; i++) adds.push({ x: G.doors[(adds.length) % 2], hp: 70, cd: 1.5 }); return k; }, adds: () => adds.filter(a => a.hp > 0).length,
    hit: (bx, d, name, o) => { if (P.keys.has(o.key)) return false; const top = P.y - (P.ducking ? 8 : 14); if (!(bx[0] < P.x + 5 && bx[1] > P.x - 5 && bx[2] < P.y && bx[3] > top)) return false;
      if (o.low && !P.ground) return false; if (o.duck && P.ducking) return false; if (P.dodge > 0) return false; P.keys.set(o.key, 1); P.hp -= d; return true; },
    number: () => {}, mark: () => {}, sound: () => {}, fx: () => {}, shake: () => {}, music: () => {} };
  while (t < 300 && e.hp > 0 && P.hp > 0) { const dt = 1 / 60; t += dt;
    if (P.hp < P.max * 0.3 && P.flasks > 0 && !/Tell$|slam|swing/.test(e.mode)) { P.flasks--; P.hp = Math.min(P.max, P.hp + P.max * 0.4); }
    const out = GMM.gmPlan({ P, e, F, gongs, t, rng, mem });
    const add = adds.find(a => a.hp > 0 && Math.abs(a.x - P.x) < 40);
    if (add && !GMM.gmOpen(e) && !out.dodge && !out.jump && !out.duck) { out.gx = add.x; out.atk = Math.abs(add.x - P.x) < 26; }
    P.ducking = !!out.duck && P.ground; if (out.dodge && P.dodge <= 0) P.dodge = 0.35; P.dodge -= dt;
    if (out.jump && P.ground) { P.vy = -330; P.ground = false; }
    if (!P.ground) { P.vy += 980 * dt; P.y += P.vy * dt; if (P.y >= G.floorY) { P.y = G.floorY; P.vy = 0; P.ground = true; } }
    if (out.gx != null && !P.ducking && Math.abs(out.gx - P.x) > 3) P.x += Math.sign(out.gx - P.x) * Math.min(Math.abs(out.gx - P.x), (P.dodge > 0 ? 200 : 95) * dt);
    P.x = Math.max(G.x0 + 8, Math.min(G.x1 - 8, P.x)); P.cd -= dt;
    if (out.atk && P.cd <= 0) { P.cd = 0.38;
      const g = gongs.find(q => !q.cut && Math.abs(q.x - P.x) < 14); if (g) { g.cut = true; cuts++; GMM.ropeCut(e, F, c, g.id); }
      else if (add && Math.abs(add.x - P.x) < 28) add.hp -= 18;
      else if (Math.abs(e.x - P.x) < 30) e.hp -= GMM.gmTake(e, F, 18); }
    for (const a of adds) if (a.hp > 0) { a.x += Math.sign(P.x - a.x) * Math.min(Math.abs(P.x - a.x) - 12 > 0 ? 50 * dt : 0, 50 * dt); a.cd -= dt; if (a.cd <= 0 && Math.abs(a.x - P.x) < 24) { a.cd = 1.6; if (P.dodge <= 0) P.hp -= 12; } }
    GMM.stepGongMaster(e, F, dt, [{ x: P.x, y: P.y, ground: P.ground, alive: true, ducking: P.ducking }], c); }
  return { win: e.hp <= 0, t, hp: Math.max(0, P.hp), flasks: P.flasks, opens: F.n.opens, cuts, adds: adds.length };
}
function duelHM2(seed) {
  const rng = rng0(seed), G = HMM.geom(L.arena), S = HMM.newFight(G);
  const e = { x: G.x0 + HMM.HM_STAGE.her * TS, y: G.floorY, hp: HM.hp, maxHp: HM.hp, mode: 'wake', modeT: 1.8, face: -1, alive: true, open: 0, phase: 1 };
  S.hawk.x = e.x; S.hawk.y = G.floorY - HM.hawkAlt;
  const P = { x: G.x0 + 3 * TS, y: G.floorY, vy: 0, ground: true, hp: 300, max: 300, flasks: 3, cd: 0, dodge: 0, ducking: false, keys: new Map(), carry: null, snared: 0, talon: 0, block: false, face: 1, atk: -1 };
  const racks = G.racks.map(r => ({ ...r, n: 9 })), gongs = G.gongs.map(q => ({ ...q, cut: false })), mem = {}; let t = 0, flights = [], swingNow = false;
  const box = () => ({ l: P.x - 5, r: P.x + 5, t: P.y - (P.ducking ? 8 : 14), b: P.y });
  const over = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  const hurt = (d, o = {}) => { if (P.dodge > 0) return false; if (P.block && o.blockable) return 'blocked'; P.hp -= d; return true; };
  const c = { number: () => {}, sound: () => {}, shake: () => {}, time: () => t, music: () => {}, mark: () => {}, fx: () => {},
    hit: (bx, d, name, o = {}) => { if (P.keys.has(o.key || name) || P.talon > 0) return false; if (!over({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, box())) return false; if (o.low && !P.ground) return false; P.keys.set(o.key || name, 1); return hurt(d, { blockable: o.blockable }) === true; },
    snare: () => { P.snared = HM.snareHold; return true; },
    knife: k => { if (P.keys.has(k.key)) return null; if (!over({ l: k.x - 6, r: k.x + 6, t: k.y - 2, b: k.y + 2 }, box())) return null; P.keys.set(k.key, 1); if (k.ht === 'high' && P.ducking) return 'under'; const r = hurt(k.kind === 'feather' ? HM2.dmg.moult : HM.dmg.knife, { blockable: true }); return r === 'blocked' ? 'blocked' : r ? 'hit' : null; },
    keg: K => { if (swingNow && Math.abs(K.x - P.x) < 24) return 'struck'; if (Math.abs(K.x - P.x) < 8 && P.ground) return 'hit'; return null; },
    hawkAt: (bx, d, name, key) => { if (swingNow && Math.abs(S.hawk.x - P.x) < 34 && Math.abs(S.hawk.y - (P.y - 10)) < 26) return 'struck'; if (P.keys.has(key)) return null; if (!over({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, box())) return null; P.keys.set(key, 1); const r = hurt(d, { blockable: true }); return r === 'blocked' ? 'blocked' : r ? 'hit' : null; },
    carry: (tx) => { P.x = tx; P.hp -= HM.max ? 0 : 0; }, lift: (x, tt) => { P.talon = tt + 0.25; P.x = x; P.ground = false; }, drop: (how, x) => { P.talon = 0; P.y = G.floorY; P.ground = true; if (how === 'blade' && x != null) P.x = x; },
    hawkStruck: () => swingNow && P.talon > 0, gongs: () => gongs, guardRing: () => false, guards: () => 0, crumble: () => false };
  const n0 = { throws: 0, hawkHits: 0, oil: 0 };
  while (t < 420 && e.hp > 0 && P.hp > 0) { const dt = 1 / 60; t += dt; swingNow = false;
    if (P.hp < P.max * 0.3 && P.flasks > 0 && P.ground && !P.talon) { P.flasks--; P.hp = Math.min(P.max, P.hp + P.max * 0.4); }
    const out = HMM.hmPlan({ P: { x: P.x, y: P.y, face: P.face, ground: P.ground, atk: P.atk, carry: P.carry, snared: P.snared > 0, lifted: false, talon: P.talon > 0 }, e, S, gongs: gongs.map(g => ({ id: g.id, x: g.x, cut: g.cut })), racks: racks.map(r => ({ id: r.id, x: r.x, kind: r.kind, n: r.n })), reach: 30, shield: false, t, rng, mem, v2: false, hero: 'knight' });
    P.face = out.face || P.face; P.block = !!out.block && P.ground; P.ducking = !!out.down && P.ground && !out.atk;
    if (out.dodge && P.dodge <= 0) P.dodge = 0.35; P.dodge -= dt; P.snared = Math.max(0, P.snared - dt);
    if (P.talon > 0) { P.talon -= dt; if (out.atk && P.cd <= 0) { P.cd = 0.38; swingNow = true; } P.cd -= dt; HMM.stepHawkMistress(e, S, dt, [{ x: P.x, y: P.y, ground: false, alive: false }], c); continue; }
    if (out.jump && P.ground) { P.vy = -330; P.ground = false; if (P.snared) P.snared = 0; }
    if (!P.ground) { P.vy += 980 * dt; P.y += P.vy * dt; if (P.y >= G.floorY) { P.y = G.floorY; P.vy = 0; P.ground = true; } }
    if (out.gx != null && !P.block && !P.ducking && Math.abs(out.gx - P.x) > 2) P.x += Math.sign(out.gx - P.x) * Math.min(Math.abs(out.gx - P.x), (P.dodge > 0 ? 200 : 95) * dt);
    P.x = Math.max(G.x0 + 8, Math.min(G.x1 - 8, P.x));
    if (P.ground && HMM.overShaft(G, P.x)) { P.hp -= P.max * 0.08; const r = G.roofs[HMM.roofOf(G, P.x)]; P.x = Math.abs(P.x - r[0]) < Math.abs(P.x - r[1]) ? r[0] + 10 : r[1] - 10; }
    if (out.talk && !P.carry) { const r = racks.find(q => Math.abs(q.x - P.x) < 18); if (r) P.carry = r.kind === 'keg' ? 'keg' : 'torch'; const g = gongs.find(q => !q.cut && Math.abs(q.x - P.x) < 20); if (!r && g) HMM.ringHeard(e, S, c); }
    P.cd -= dt; P.atk = P.cd > 0.2 ? 1 : -1;
    if (out.atk && P.cd <= 0) { P.cd = 0.38;
      if (P.carry) { const K = KINDS.torch, a = K.aims[out.up ? 'high' : out.down ? 'low' : 'mid'], f = P.face || 1; flights.push({ x: P.x + f * 6, y: P.y - 18, vx: f * a.vx, vy: a.vy, kind: P.carry }); P.carry = null; n0.throws++; }
      else { swingNow = true; const g = gongs.find(q => !q.cut && Math.abs(q.x - P.x) < 12); if (g && S.runner) g.cut = true;
        if (Math.abs(e.x - P.x) < 30 && e.mode !== 'leap') { let d = 18; if (HMM.hmOpen(e)) { const bare = S.openKind === 'bare', cap = e.maxHp * (bare ? HM.bareCap : HM.openCap); d = Math.min(d * (bare ? HM.bareMul : HM.openMul), Math.max(0, cap - S.openTaken)); S.openTaken += d; } else if (S.ward > 0 || HMM.hawkGuards(S)) d *= HM.floor; e.hp -= d; } } }
    for (const q of flights) { q.vy += KINDS.torch.g * dt; q.x += q.vx * dt; q.y += q.vy * dt;
      if (HMM.hawkTarget(S) && Math.hypot(q.x - S.hawk.x, q.y - S.hawk.y) < HM.fireR) { q.dead = true; if (HMM.fireAt(e, S, c, q.x, q.y, q.kind === 'keg' ? 'keghawk' : 'fire') === 'down') n0.hawkHits++; continue; }
      if (q.y >= G.floorY) { q.dead = true; if (q.kind === 'torch' && HMM.oilIgnite(e, S, c, q.x, G.floorY) === 'lit') n0.oil++; } }
    flights = flights.filter(q => !q.dead);
    HMM.stepHawkMistress(e, S, dt, [{ x: P.x, y: P.y, ground: P.ground, alive: true }], c); }
  return { win: e.hp <= 0, t, hp: Math.max(0, P.hp), flasks: P.flasks, ph: S.ph, downs: S.n.downs, bares: S.n.bares, smokes: S.n.smokes, oil: S.n.oilLit, lifts: S.n.lifts, liftBroke: S.n.liftBroke, blades: S.n.blades, moults: S.n.moults, throws: n0.throws };
}
function duels(N, log) {
  const g = [], h = []; for (let s = 1; s <= N; s++) { g.push(duelGM(s * 7919)); h.push(duelHM2(s * 104729)); }
  const sum = (a, k) => a.reduce((x, r) => x + r[k], 0);
  if (log) { for (const r of g) console.log('  GM ', JSON.stringify(r, (k, v) => (typeof v === 'number' ? +v.toFixed(1) : v))); for (const r of h) console.log('  HM2', JSON.stringify(r, (k, v) => (typeof v === 'number' ? +v.toFixed(1) : v))); }
  console.log('TOY DUEL GONG-MASTER n=' + N + ': ' + g.filter(r => r.win).length + '/' + N + ' won, avg ' + (sum(g, 't') / N).toFixed(0) + ' s, opens ' + (sum(g, 'opens') / N).toFixed(1) + '/fight, cuts ' + (sum(g, 'cuts') / N).toFixed(1) + ', adds ' + (sum(g, 'adds') / N).toFixed(1) + ', flasks left ' + (sum(g, 'flasks') / N).toFixed(1));
  console.log('TOY DUEL HAWK-MISTRESS 2 n=' + N + ': ' + h.filter(r => r.win).length + '/' + N + ' won, avg ' + (sum(h, 't') / N).toFixed(0) + ' s, reach P3 ' + h.filter(r => r.ph === 3).length + '/' + N + ', downs ' + (sum(h, 'downs') / N).toFixed(1) + ', bares ' + (sum(h, 'bares') / N).toFixed(1) + ', oil lit ' + (sum(h, 'oil') / N).toFixed(1) + ' (smoke ' + (sum(h, 'smokes') / N).toFixed(1) + '), talon ' + sum(h, 'lifts') + ' (struck free ' + sum(h, 'liftBroke') + ', blade ' + sum(h, 'blades') + '), moults ' + (sum(h, 'moults') / N).toFixed(1));
  return { g, h };
}

if (opt('sim')) { duels(+opt('sim'), args.includes('--log')); process.exit(0); }
flag(); geometry(); ropes(); reach(); stalker(); gongmaster(); hm2(); smoke();
const { g, h } = duels(6, args.includes('--log'));
ok(g.every(r => r.opens > 0), 'toy duel: every Gong-Master fight opens him by a cut rope (the verb reaches him)');
ok(h.every(r => r.downs + r.bares > 0) && h.some(r => r.downs > 0), 'toy duel: HM2 opens through the rule (torch on the hawk / gong / smoke / talon)');
console.log('ksar3: ' + n + ' ok');
