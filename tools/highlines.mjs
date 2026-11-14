/* tools/highlines.mjs - THE HIGH LINES greybox + THE HOOKJACK, proven in NODE (no page, no browser). claude/highlines1, 11-05.
   src/highlines.js (HL_DATA + the builder), src/line-kit.js (the engine), src/hookjack.js (the foe). The body physics is tools/line-kit.mjs's (the heroes' own
   arc, src/hero-move.js) plus the shaft's two cliff walls.
     1  lintLines: the level is clean (every line anchored, every winch tops onto a landing, every cut line has a catch, the gondola lands, winds told + lee,
        checkpoints on landings out of the wind, the exit on a landing)
     2  the built grid agrees with the data: every landing/net is a deck row with room over it; no rider's path runs through rock; 3 checkpoints; 2 silvers
     3  the bands are all there (Daniel 11-05 15:27): grip winches over nets, points + glide + a kick gap, wind boxes with lee, cut lines + hookjacks,
        the on-foot interlude with no line over it, the counterweight, the gondola, the exam (winch in exam wind, hookjacks, no nets), the cave mouth stub
     4  every drop from every hand line (every 16 px, calm + gust) lands on something (a line, a net, a landing) - never the pit
     5  THE SWEEP: every hero (HERO_MOVE_IDS) x 1 seat, and the knight x 2-4 seats: from every checkpoint the exit is reached; no soft-lock, no stuck state;
        both silvers reached
     6  THE HOOKJACK: guard x0.4 from the front / whole from behind; the tell (>= 0.6 s, told) is open and a blow drops him off the line; a parry spins him
        and one blow drops him; a hit knocks the rider off; a held guard keeps the grip and pushes back; never two swipes inside HK.noStack; the cutter
        saws only while a hero rides his line, told >= 2 s, a blow stops it; the cut drops the rider a level (not the pit); then he rides the line;
        on foot he fights with the same told hook; he falls into the void and is gone; THE COUNTER ROW: his tell stands inside every hero's shortest reach
   Usage: node tools/highlines.mjs [--quick]   (--quick: the sweep for the knight x1 only) */
import assert from 'node:assert/strict';
import { LK, TS, lineInit, switchConfigs, setSwitches, riderStep, kitStep, kitStrike, windPush, platforms, lintLines, lineY, lineCut, foeRide, riderHit, catchBelow } from '../src/line-kit.js';
import { HL_DATA, HL_DATA_SW, HL_DATA_FX, HL_DATA_SW_FX, HL_SWITCH, HL, applySwitchPatch, applyFix3Patch, buildHighLines } from '../src/highlines.js';
import { HK, newHook, hookStep, hookTake, hookOpen } from '../src/hookjack.js';
import { MOVE, HERO_MOVE_IDS, heroRunMul } from '../src/hero-move.js';
import { T } from '../src/level.js';

const QUICK = process.argv.includes('--quick'), ONLY = (process.argv.find(a => a.startsWith('--hero=')) || '').slice(7);
const DT = 1 / 60;
/* (claude/hlswitch) --sw: the same proof on the flag-ON level (HL_DATA_SW: the switch rule, levers, the new lines) - every section below runs on DATA, and the sweep runs once per lever configuration (init, each lever thrown, all thrown).
   No flag: exactly the flag-off proof as before. */
/* (claude/hlfix3) --fx: the same proof on the HL_FIX3 level (nets at every section, five shrines, carts that wait; combine with --sw for the shipping rule). No flag: exactly the flag-off proof as before. */
const FX = process.argv.includes('--fx');
const SW = process.argv.includes('--sw'), DATA = FX ? (SW ? HL_DATA_SW_FX : HL_DATA_FX) : (SW ? HL_DATA_SW : HL_DATA); let SWCFG = null;
const lvl = () => JSON.parse(JSON.stringify(DATA));
const kitNew = () => { const k = lineInit(lvl()); if (SWCFG) setSwitches(k, SWCFG); return k; };
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const t0 = Date.now();
const WALL_L = 1 * TS + 5, WALL_R = (HL.W - 1) * TS - 5;

/* ---------- the body physics (tools/line-kit.mjs + the walls) ---------- */
function statics(L) { return [...L.landings, ...(L.nets || [])].map((b, i) => ({ i, x0: b[0] * TS, x1: (b[2] + 1) * TS, top: b[1] * TS })); }
function mkBody(hero, x, y) { return { hero, x, y, vx: 0, vy: 0, ground: true, face: 1, atk: -1, dead: false, on: null }; }
function surfaces(kit, S) { return S.concat(platforms(kit).map(p => ({ i: p.id, x0: p.x0, x1: p.x1, top: p.top, plat: true }))); }
function phys(kit, b, inp, all) {
  if (b.lk || b.dead) return;
  const want = (inp.right ? 1 : 0) - (inp.left ? 1 : 0), cap = MOVE.RUN * heroRunMul(b.hero, b.ground);
  if (want) b.face = want;
  if (b.ground && inp.jumpPress) { b.vy = MOVE.JUMPV; b.ground = false; b.on = null; }
  const acc = b.ground ? MOVE.ACC_GROUND : MOVE.ACC_AIR, fr = b.ground ? MOVE.FRIC_GROUND : MOVE.FRIC_AIR;
  if (want) { const tg = want * cap; if (Math.abs(b.vx) > cap && Math.sign(b.vx) === want) b.vx -= Math.sign(b.vx) * Math.min(Math.abs(b.vx) - cap, MOVE.OVER_BLEED * DT); else b.vx += Math.sign(tg - b.vx) * Math.min(Math.abs(tg - b.vx), acc * DT); }
  else b.vx -= Math.sign(b.vx) * Math.min(Math.abs(b.vx), fr * DT);
  if (!b.ground) { const g = MOVE.GRAV * (Math.abs(b.vy) < MOVE.APEX_VY ? MOVE.APEX_G : b.vy > 0 ? MOVE.FALL_G : 1); b.vy = Math.min(MOVE.MAX_FALL, b.vy + g * DT); windPush(kit, b, DT); }
  const oy = b.y; b.x += b.vx * DT; if (!b.ground) b.y += b.vy * DT;
  if (b.x < WALL_L) { b.x = WALL_L; b.vx = Math.max(0, b.vx); } if (b.x > WALL_R) { b.x = WALL_R; b.vx = Math.min(0, b.vx); }   /* THE CLIFF WALLS */
  if (!b.ground && b.vy >= 0) for (const s of all) if (b.x >= s.x0 && b.x < s.x1 && oy <= s.top + 0.5 && b.y >= s.top) { b.y = s.top; b.vy = 0; b.ground = true; b.on = s; break; }
  if (b.ground) { const s = all.find(q => b.x >= q.x0 && b.x < q.x1 && Math.abs(b.y - q.top) <= 1); if (!s) { b.ground = false; b.on = null; } else b.on = s; }
  if (b.y > kit.pitY) b.dead = true;
}
const hbOf = b => ({ l: b.face > 0 ? b.x : b.x - 26, r: b.face > 0 ? b.x + 26 : b.x, t: b.y - 22, b: b.y - 2 });
function tick(kit, bodies, inpOf, S, evs) {
  const ev = kitStep(kit, bodies, DT); const all = surfaces(kit, S);
  for (const b of bodies) { if (b.dead) continue; const inp = inpOf(b) || {};
    if (inp.strike) { inp.hb = hbOf(b); if (!b.lk) { const p = kitStrike(kit, inp.hb); if (p) ev.push({ t: 'strike', post: p.kind }); } }
    for (const e of riderStep(kit, b, inp, DT)) ev.push({ ...e, seat: bodies.indexOf(b) });
    phys(kit, b, inp, all); }
  if (evs) evs.push(...ev); return ev;
}
const run = (kit, bodies, s, inpOf, S, evs) => { for (let i = 0; i < Math.round(s / DT); i++) tick(kit, bodies, inpOf || (() => ({})), S, evs); };
const onLine = (kit, id, x, hero = 'knight') => { const z = kit.lines[id], b = mkBody(hero, x, lineY(z, x) + z.hang); b.ground = false; b.lk = { id, x, dir: z.dir, haul: 0, buf: 0, sway: 0, swayV: 0, v: 0 }; return b; };

/* 1. LINT */
{ const bad = lintLines(lvl()); ok(bad.length === 0, 'the level lints clean:\n  ' + bad.join('\n  ')); }

/* 2. THE GRID AGREES WITH THE DATA */
{ const painter = (W, H) => { const grid = new Uint8Array(W * H), ents = []; const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
    return { W, H, grid, ents, set, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); }, ent: (t, x, y, o = {}) => ents.push({ t, x, y, ...o }) }; };
  const B = buildHighLines({ painter, T, TS, sw: SW, fx: FX }), at = (x, y) => B.grid[y * B.W + x];
  ok(B.W === HL.W && B.H === HL.H && B.lineKit && B.lineKit.lines.length === DATA.lineKit.lines.length, 'the builder hands main.js the line kit (' + B.lineKit.lines.length + ' lines)');
  for (const [x0, top, x1] of DATA.landings.concat(DATA.nets)) for (let x = x0; x <= x1; x++) { ok(at(x, top) === T.ONEWAY || at(x, top) === T.SOLID, 'deck at ' + x + ',' + top); ok(at(x, top - 1) !== T.SOLID && at(x, top - 2) !== T.SOLID, 'room to stand over ' + x + ',' + top); }
  const kit = kitNew(); let through = [];
  for (const z of kit.list) for (let x = z.xa + 4; x <= z.xb - 4; x += 4) for (const dy of [-8, 0, 8, 12]) { const tx = Math.floor(x / TS), ty = Math.floor((lineY(z, x) + dy) / TS); if (at(tx, ty) === T.SOLID) { through.push(z.id + '@' + tx + ',' + ty); break; } }
  ok(!through.length, 'no line or rider runs through rock: ' + through.slice(0, 6).join(' '));
  ok(B.ents.filter(e => e.t === 'check').length === (FX ? 5 : 3), FX ? 'five checkpoints (Daniel 11-14: none seen while playing; this level only)' : 'three checkpoints (Daniel: fewer)'); ok(B.ents.filter(e => e.t === 'silver').length === 2, 'two silvers (secrets) off the route');
  ok(B.ents.some(e => e.t === 'gate'), 'the way on (the gate) at the cave mouth');
  ok(!B.ents.some(e => /gob|goblin/.test(e.t) || ['archer', 'shield', 'spear', 'slinger', 'miner', 'sprig', 'brute'].includes(e.t)), 'no goblins (theme): ' + [...new Set(B.ents.map(e => e.t))].join(' '));
  for (const e of B.ents.filter(q => ['goat', 'crossbow', 'check', 'silver', 'gate', 'sign'].includes(q.t))) { const fy = e.y + 1; const on = DATA.landings.some(b => fy === b[1] && e.x >= b[0] && e.x <= b[2]) || at(e.x, fy) === T.SOLID;
    ok(on, e.t + ' at ' + e.x + ',' + e.y + ' stands on a deck'); }
  for (const hj of B.ents.filter(e => e.t === 'hookjack')) ok(DATA.lineKit.lines.some(d => d.id === hj.line), 'a hookjack on a real line (' + hj.line + ')');
  ok(B.ents.filter(e => e.t === 'hookjack').length === DATA.hookjacks.length && B.moversExtra.length === 3 && B.moversExtra.every(m => m.lk), 'the hookjacks are foes in the level; the cab and the weights are movers');
  ok(B.music === 'skysail' && B.arena && B.arena.boss === 'skyhook' && B.ents.filter(e => e.t === 'skyhook').length === 1, 'its own music (skysail, free since the Sky Ship left); THE HEAD STATION is the arena of SKYHOOK (claude/skyhook), his ent on his gallery');
  { const A = B.arena; for (const c of [A.wallL, A.wallR]) for (let y = 30; y <= 41; y++) ok(at(c, y) === T.SOLID, 'the head station: arch over the wall column ' + c + ' at row ' + y);
    for (let x = A.wallL; x <= A.wallR; x++) ok(at(x, A.floor / TS) === T.SOLID, 'the head station: floor is rock at ' + x + ' (no dropping out of the fight)'); }
}

/* 3. THE BANDS ARE ALL THERE (Daniel 11-05 15:27) */
{ const D = DATA, K = D.lineKit, L = id => K.lines.find(d => d.id === id), kit = kitNew();
  ok(['W1', 'W2'].every(id => L(id).kind === 'winch' && (L(id).drive || 'grip') === 'grip') && D.nets.length >= 2, '1 FOOTHOLD: grip winches over cargo nets');
  ok(K.lines.some(d => d.points && d.points.length) && K.lines.some(d => d.kind === 'glide') && L('F1') && L('F2'), '2 JUNCTIONS: points, fast glides, a kick gap (F1 -> F2)');
  ok(K.winds.filter(w => !w.exam).length >= 2 && K.lee.length >= 2, '3 THE WIND GORGE: told crosswind sections with lee rocks');
  ok(K.lines.filter(d => d.cut).length >= 3 && D.hookjacks.some(h => h.role === 'cutter') && D.hookjacks.filter(h => !h.role).length >= 3, '4 THE AMBUSH: cuttable lines, a cutter and riders');
  { const hut = D.landings[14], top = D.landings[22]; const over = kit.list.filter(z => z.xb > 55 * TS && z.xa < 78 * TS && Math.min(z.y0, z.y1) < (hut[1] - 2) * TS && Math.max(z.y0, z.y1) > top[1] * TS);
    ok(!over.length, '5 THE LEE HUT: the crevice climb has no line over it (on foot): ' + over.map(z => z.id)); }
  ok(K.weights.length === 1 && K.weights[0].hopper, '6 THE COUNTERWEIGHT: a cage, a weight, a hopper');
  ok(L('GD').cab && L('GD').snap, '7 THE GONDOLA: the cab snaps and falls onto the glide below');
  { const ex = K.winds.find(w => w.exam); ok(ex && ['E1', 'E2', 'E3'].every(id => L(id).kind === 'winch') && D.hookjacks.filter(h => /^E/.test(h.line)).length >= 3, '8 THE EXAM: winches in an exam wind, hookjacks');
    const netTop = Math.min(...D.nets.map(nb => nb[1])); if (FX) ok(D.nets.length >= 8 && netTop < 100, 'and (HL_FIX3) a net at every section, up to the cave mouth'); else ok(netTop > 200, 'and no nets above the foothold'); }
  ok(D.arena && D.arena.boss === 'skyhook' && D.exit, 'THE CAVE MOUTH: SKYHOOK at the head station and the exit'); }

/* 4. EVERY DROP LANDS ON SOMETHING */
{ const S = statics(lvl()), kit0 = kitNew(); let drops = 0, far = 0;
  for (const z of kit0.list) { if (z.cabLine || z.d.pitOk) continue;
    for (let x = z.xa + 12; x <= z.xb - 12; x += 16) for (const ph of [0, 1]) { const kit = kitNew(); for (const w of kit.winds) w.t = ph ? 0.01 : w.on + 0.01;
      const b = onLine(kit, z.id, x); const y0 = b.y; run(kit, [b], 1 / 60, () => ({ down: true }), S); let caught = false;
      for (let i = 0; i < 60 * 8 && !b.dead && !caught; i++) { tick(kit, [b], () => ({}), S); if (b.lk || b.ground) caught = true; }
      ok(caught && !b.dead, 'a drop off ' + z.id + ' at x ' + (x / TS).toFixed(1) + ' lands on something'); drops++; if (b.y - y0 > 40 * TS) far++; } }
  console.log('  drops: ' + drops + ' (every hand line, every 16 px, calm + gust); ' + far + ' fall more than 40 rows (the exam\'s cost)'); }

/* 5. THE SWEEP (tools/line-kit.mjs's, on the level, with the walls) */
function analyze(edges, seen, exitKey) {
  const canExit = new Set([exitKey]); let grew = true;
  while (grew) { grew = false; for (const [k, s] of edges) if (!canExit.has(k) && [...s].some(t => canExit.has(t))) { canExit.add(k); grew = true; } }
  const canPit = new Set(); grew = true; while (grew) { grew = false; for (const [k, s] of edges) if (!canPit.has(k) && [...s].some(t => t === 'pit' || canPit.has(t))) { canPit.add(k); grew = true; } }
  return { canExit, lock: [...seen].filter(k => k !== exitKey && !canExit.has(k) && !canPit.has(k)), deathOnly: [...seen].filter(k => k !== exitKey && !canExit.has(k) && canPit.has(k)) };
}
function sweep(hero, seats) {
  const L0 = lvl(), S = statics(L0), edges = new Map(), seen = new Set(), queue = [], stuck = [];
  const exitI = L0.landings.findIndex(b => b[1] >= L0.exit[1] && b[1] <= L0.exit[3] + 1 && b[0] <= L0.exit[2] && b[2] >= L0.exit[0]);
  const add = (from, to) => { if (!edges.has(from)) edges.set(from, new Set()); edges.get(from).add(to); if (to !== 'pit' && to !== 'stuck' && !seen.has(to)) { seen.add(to); queue.push(to); } };
  const phases = (kit, k) => { for (const w of kit.winds) w.t = k ? 0.01 : w.on + 0.01; };
  function simulate(start, script, ph) {
    const kit = kitNew(); phases(kit, ph); const bs = start(kit);
    const st = { t: 0, armed: false }; let ground = 0;
    for (let i = 0; i < 60 * 30; i++) {
      st.t = i * DT; tick(kit, bs, (b) => script(b, st, kit, bs), S); const lead = bs[0];
      if (lead.dead) return 'pit';
      if (st.armed) { if (lead.lk) return 'Z:' + lead.lk.id + ':' + Math.floor(lead.lk.x / 32);
        if (lead.ground && lead.on && Math.abs(lead.vx) < 1 && (!lead.on.plat || lead.y === st.py)) { if (++ground > 15) { if (!lead.on.plat) return 'L:' + lead.on.i;
          const o = lead.on, j = S.findIndex(q => Math.abs(q.top - o.top) <= 1 && q.x0 <= o.x1 + 16 && q.x1 >= o.x0 - 16); if (j >= 0) return 'L:' + S[j].i; if (ground > 600) return 'stuck'; } } else ground = 0; st.py = lead.y; }
    }
    return 'stuck';
  }
  const party = (mk) => (kit) => { const bs = []; for (let s = 0; s < seats; s++) bs.push(mk(kit, s)); return bs; };
  function expandLanding(i) {
    const b = L0.landings[i] || L0.nets[i - L0.landings.length];
    const y = b[1] * TS, xs = []; for (let x = b[0] * TS + 4; x < (b[2] + 1) * TS - 2; x += 16) xs.push(x);
    const startAt = (x) => party((kit, s) => mkBody(hero, Math.min((b[2] + 1) * TS - 2, x + s * 3), y));
    const scripts = [
      () => (q, st) => { st.armed = true; return st.t < 0.3 ? { up: true } : {}; },
      () => (q, st) => { st.armed = st.t > 0.05; return { up: !q.ground, jumpPress: st.t === 0 }; },
      () => (q, st) => { st.armed = st.t > 0.05; const air = st.t <= 0.05 || !q.ground || (q.on && q.on.plat); return { up: air && st.t > 0, left: air, jumpPress: st.t === 0 }; },   /* a run-jump: the stick held till he lands (a player stops on the lip) */
      () => (q, st) => { st.armed = st.t > 0.05; const air = st.t <= 0.05 || !q.ground || (q.on && q.on.plat); return { up: air && st.t > 0, right: air, jumpPress: st.t === 0 }; },
      () => (q, st) => { st.armed = !q.ground || st.t > 4; return st.t < 4 && q.ground ? { left: true } : {}; },
      () => (q, st) => { st.armed = !q.ground || st.t > 4; return st.t < 4 && q.ground ? { right: true } : {}; },
    ];
    for (const ph of [0, 1]) for (const x of xs) for (const [si, mk] of scripts.entries()) { const r = simulate(startAt(x), mk(), ph); if (process.env.HL_LAND && +process.env.HL_LAND === i) console.log('   L' + i + ' x' + (x / TS).toFixed(2) + ' s' + si + ' ph' + ph + ' -> ' + r); add('L:' + i, r); }
    const kitR = kitNew();
    for (const p of platforms(kitR)) { if (Math.abs(p.top - y) > 1 || !(p.x1 >= b[0] * TS - 16 && p.x0 <= (b[2] + 1) * TS + 16)) continue;
      const cx = (p.x0 + p.x1) / 2, ex = cx < b[0] * TS ? b[0] * TS + 4 : (b[2] + 1) * TS - 4;
      const post = kitR.posts.find(o => o.x > p.x0 - 48 && o.x < p.x1 + 48 && Math.abs(o.y - (p.top - 12)) < 40);
      for (const strike of post ? [false, true] : [false]) for (const wait of [1, 6, 12]) for (const out of ['L', 'R', 'jL', 'jR']) {
        const sc = (q, st, kit, bs) => { const P = platforms(kit).find(z => z.id === p.id); const pc = P ? (P.x0 + P.x1) / 2 : cx;
          const striker = strike && q === bs[seats - 1] && post, tx = striker ? Math.max(P.x0 + 3, Math.min(P.x1 - 3, post.x - Math.sign(post.x - pc) * 14)) : pc;
          if (!st.on) { if (bs.every(z => z.on && z.on.plat) && Math.abs(bs[seats - 1].x - (strike && post ? Math.max(P.x0 + 3, Math.min(P.x1 - 3, post.x - Math.sign(post.x - pc) * 14)) : bs[seats - 1].x)) <= 4) { st.on = st.t; } else { const d = tx - q.x; return Math.abs(d) > 3 ? (d > 0 ? { right: true } : { left: true }) : {}; } }
          const el = st.t - st.on; if (strike && el > 0.2 && el < 0.3) { if (striker) q.face = Math.sign(post.x - q.x) || 1; return { strike: !!striker }; }
          if (el < wait) return {}; st.armed = true; const side = out.endsWith('L') ? 'left' : 'right';
          return { [side]: el - wait < 0.6, up: true, jumpPress: out.startsWith('j') && Math.abs(el - wait) < DT / 2 }; };
        { const r = simulate(startAt(ex), sc, 0); if (process.env.HL_LAND && +process.env.HL_LAND === i) console.log('   L' + i + ' plat ' + p.id + ' strike ' + strike + ' wait ' + wait + ' ' + out + ' -> ' + r); add('L:' + i, r); } } }
  }
  function expandLine(key) {
    const [, id, bk] = key.split(':'); const kit0 = kitNew(), z = kit0.lines[id]; const x0 = Math.max(z.xa + 9, Math.min(z.xb - 9, +bk * 32 + 16));
    const remain = Math.max(0, z.dir > 0 ? z.xb - LK.END_PAD - x0 : x0 - z.xa - LK.END_PAD);
    const start = party((kit, s) => onLine(kit, id, x0 - z.dir * s * 3, hero));
    const pts = z.points.length && !SW ? [false, true] : [false];   /* (hlswitch) under the switch rule UP does nothing at a board: the lever configuration picks the branch */
    const post = z.d.drive === 'post';
    const hauls = (st) => SW ? st.t < DT * 3 : (z.kind === 'winch' && !post && (Math.round(st.t * 60) % 9 === 0)) || (post && Math.round(st.t * 60) % 30 === 0);
    for (const ph of [0, 1]) for (const up of pts) {
      for (const f of [0, 0.25, 0.5, 0.75]) for (const act of ['kick', 'kickB', 'kickF', 'drop']) {
        const sc = (q, st, kit, bs) => {
          if (!st.done) { const lead = bs[0]; const gone = !lead.lk || lead.lk.id !== id ? 1e9 : Math.abs(lead.lk.x - x0);
            if (gone >= f * remain || st.t > 20) { st.done = st.t; } else return { up, strike: hauls(st) }; }
          const el = st.t - st.done; st.armed = el > 0.05; const fwd = (q.lk ? q.lk.dir : z.dir) > 0 ? 'right' : 'left', back = fwd === 'right' ? 'left' : 'right';
          if (act === 'drop') return el < DT / 2 ? { down: true } : {};
          const o = { up: true, jumpPress: el < DT / 2 }; if (act === 'kickB') o[back] = true; if (act === 'kickF') o[fwd] = true; return o; };
        add(key, simulate(start, sc, ph)); }
      const ride = (q, st) => { st.armed = !q.lk || q.lk.id !== id; return { up, strike: hauls(st) }; };
      add(key, simulate(start, ride, ph)); }
  }
  for (const c of L0.checkpoints) { const i = L0.landings.findIndex(b => c.x >= b[0] && c.x <= b[2] && c.y === b[1]); seen.add('L:' + i); queue.push('L:' + i); }
  while (queue.length) { const k = queue.shift(); if (k.startsWith('L:')) expandLanding(+k.slice(2)); else expandLine(k); }
  for (const [k, s] of edges) if (s.has('stuck')) stuck.push(k);
  const { canExit, lock, deathOnly } = analyze(edges, seen, 'L:' + exitI);
  const cps = L0.checkpoints.map(c => 'L:' + L0.landings.findIndex(b => c.x >= b[0] && c.x <= b[2] && c.y === b[1]));
  const secretI = L0.secrets.map(([sx, sy]) => 'L:' + L0.landings.findIndex(b => sx >= b[0] && sx <= b[2] && Math.abs(sy - b[1]) <= 2));
  return { nodes: seen.size, exitFrom: cps.filter(k => canExit.has(k)).length, cps: cps.length, lock, deathOnly, stuck, secrets: secretI.filter(k => seen.has(k)).length, nSecrets: secretI.length, secretSeen: secretI.filter(k => seen.has(k)), edges, seen, canExit };
}
{ const rows = [], runs = ONLY ? [[ONLY.split('x')[0], +(ONLY.split('x')[1] || 1)]] : QUICK ? [['knight', 1]] : [...HERO_MOVE_IDS.map(h => [h, 1]), ['knight', 2], ['knight', 3], ['knight', 4]];
  /* (claude/hlswitch) flag on: the knight x1 sweeps EVERY lever configuration (init, each lever thrown, all thrown); every other row sweeps init + all thrown. Each must reach the exit from every checkpoint with no soft-lock;
     the silvers are asserted over the union of a row's configurations (a silver line may need its lever) */
  const cfgAll = SW ? switchConfigs(lvl()) : [null], combos = !SW ? [] : switchConfigs(lvl()).length ? (() => { const sws = DATA.lineKit.switches; let out = [{ label: '', state: {} }]; for (const sw of sws) out = out.flatMap(o => Array.from({ length: sw.states ?? 2 }, (_, k) => ({ label: o.label + (o.label ? ' ' : '') + sw.id + '=' + k, state: { ...o.state, [sw.id]: k } }))); return out; })() : [],
    cfgsFor = (h, s) => (!SW ? [null] : h === 'knight' && s === 1 ? combos : [cfgAll[0], cfgAll[cfgAll.length - 1]]);   /* the knight x1 sweeps the FULL product of the levers (3 levers = 8; the plan's 16 was for 4) */
  const unionS = new Map(), runs2 = runs.flatMap(([h, s]) => cfgsFor(h, s).map(c => [h, s, c]));
  for (const [hero, seats, cfg] of runs2) { SWCFG = cfg ? cfg.state : null; const lab = cfg ? ' [' + cfg.label + ']' : ''; const ts = Date.now(), R = sweep(hero, seats); rows.push(hero + 'x' + seats + lab + ' ' + R.nodes + 'n ' + ((Date.now() - ts) / 1000).toFixed(0) + 's');
    if (process.env.HL_DEBUG) { const miss = DATA.landings.map((b, i) => 'L:' + i).filter(k => !R.seen.has(k)); console.log('  unreached landings: ' + miss.join(' ')); console.log('  can-not-exit: ' + [...R.seen].filter(k => !R.canExit.has(k)).join(' ')); }
    if (process.env.HL_DEBUG) console.log('  edges: ' + [...R.edges].filter(([k]) => k.startsWith('L:')).map(([k, s]) => k + '>' + [...s].filter(t => t.startsWith('L:') || t.startsWith('Z:')).map(t => t.replace(/:d+$/, '')).filter((t, i, a) => a.indexOf(t) === i).join(',')).join('  '));
    ok(R.exitFrom === R.cps, hero + ' x' + seats + lab + ': the exit from every checkpoint (' + R.exitFrom + '/' + R.cps + ')');
    ok(!R.lock.length, hero + ' x' + seats + lab + ': no soft-lock (' + R.lock.join(' ') + ')'); ok(!R.stuck.length, hero + ' x' + seats + lab + ': no stuck state (' + R.stuck.join(' ') + ')');
    if (!SW) ok(R.secrets === R.nSecrets, hero + ' x' + seats + ': both side lines reach their silver (' + R.secrets + '/' + R.nSecrets + ')');
    else { const k = hero + 'x' + seats, u = unionS.get(k) || new Set(); R.secretSeen.forEach(q => u.add(q)); unionS.set(k, u); const last = runs2.filter(q => q[0] === hero && q[1] === seats).pop(); if (last[2] === cfg) ok(u.size === R.nSecrets, hero + ' x' + seats + ': both side lines reach their silver over the lever configurations (' + u.size + '/' + R.nSecrets + ')'); }
    if (R.deathOnly.length) console.log('  note ' + hero + ' x' + seats + ': states whose only way on is a pit (respawn): ' + R.deathOnly.join(' ')); }
  console.log('  sweep: ' + rows.join(', ')); }

/* 6. THE HOOKJACK */
function hkWorld(kit, heroes, o = {}) {
  const w = { kit, LK: { foeRide, lineY, lineCut, riderHit }, now: 0, last: -9, said: [], sounds: [], marks: [], hurts: [],
    heroes: () => heroes, time: () => w.now, lastSwipe: () => w.last, swiped: t => { w.last = t; w.swipes = (w.swipes || []).concat(t); },
    hurt: (h, d, x) => { const r = o.answer ? o.answer(h) : 'hit'; w.hurts.push(r); return r; },
    landingUnder: (x, y0, y1) => { for (const b of DATA.landings) { const top = b[1] * TS; if (x >= b[0] * TS && x < (b[2] + 1) * TS && y0 <= top && y1 >= top) return top; } return null; },
    pitY: kit.pitY, say: (x, y, t) => w.said.push(t), sound: k => w.sounds.push(k), mark: (e, m) => w.marks.push(m) };
  return w;
}
const stepN = (e, w, s, each) => { for (let i = 0; i < Math.round(s / DT); i++) { w.now += DT; hookStep(e, DT, w); if (each) each(i); } };
const hookOn = (kit, line, tx, dir) => { const z = kit.lines[line], e = newHook({ line, lx: tx * TS, dir }); e.x = tx * TS; e.y = lineY(z, e.x) + z.hang; return e; };
{ /* guard from the front, whole from behind */
  const kit = kitNew(), e = hookOn(kit, 'H2', 45, -1); e.face = -1;
  ok(Math.abs(hookTake(e, 10, e.x - 20) - 10 * HK.guard) < 1e-9, 'a blow from his front clanks off his hook: x' + HK.guard);
  ok(hookTake(e, 10, e.x + 20) === 10, 'from behind it is whole');
  ok(HK.guard >= 0.4, 'his guard never makes him immune (x' + HK.guard + ')'); }
{ /* he rides at a rider, stops at the tell distance, tells (told, >= 0.6 s), and in the tell a blow drops him off the line */
  const kit = kitNew(), r = onLine(kit, 'H2', 36 * TS), e = hookOn(kit, 'H2', 46, -1), w = hkWorld(kit, [r]);
  let tellAt = null, told = 0; stepN(e, w, 3, () => { if (e.mode === 'tell') { told += DT; if (tellAt === null) tellAt = Math.abs(e.x - r.x); } });
  ok(tellAt !== null && tellAt <= HK.tellAt + 3, 'he rides up the line at the rider and draws the hook at ' + (tellAt || 0).toFixed(0) + ' px');
  ok(w.marks.includes('!') && w.sounds.includes('tell'), 'the tell is told: a yellow ! and his own sound');
  ok(HK.tell >= 0.6 && told >= 0.6 - DT, 'the tell lasts ' + HK.tell + ' s');
  const k2 = kitNew(), r2 = onLine(k2, 'H2', 36 * TS), e2 = hookOn(k2, 'H2', 46, -1), w2 = hkWorld(k2, [r2]);
  stepN(e2, w2, 3, () => { if (e2.mode === 'tell' && hookOpen(e2) && !e2.struck) { e2.struck = true; ok(hookTake(e2, 10, r2.x, w2) === 10, 'in his tell a blow lands whole'); } });
  ok(e2.struck && (e2.mode === 'fall' || e2.mode === 'foot' || !e2.alive), 'and he LOSES HIS GRIP (mode ' + e2.mode + ')'); }
{ /* the swipe knocks the rider off; a held guard keeps the grip and pushes him back; a parry spins him and one blow drops him */
  for (const ans of ['hit', 'blocked', 'parried']) {
    const kit = kitNew(), r = onLine(kit, 'H2', 36 * TS), e = hookOn(kit, 'H2', 46, -1), w = hkWorld(kit, [r], { answer: () => ans }); const x0 = r.lk.x;
    let sawSpin = false; stepN(e, w, 3, () => { if (e.mode === 'spin') sawSpin = true; });
    if (ans === 'hit') ok(w.hurts[0] === 'hit' && !r.lk && r.lkHard, 'his swipe lands: the rider is KNOCKED OFF the line');
    if (ans === 'blocked') ok(w.hurts[0] === 'blocked' && r.lk && Math.abs(Math.abs(r.lk.x - x0) - LK.GUARD_PUSH) < 1, 'a held guard: no damage, the grip kept, pushed back ' + LK.GUARD_PUSH + ' px');
    if (ans === 'parried') { ok(sawSpin, 'a parry on the beat: he SPINS on his trolley'); const k3 = kitNew(), r3 = onLine(k3, 'H2', 36 * TS), e3 = hookOn(k3, 'H2', 46, -1), w3 = hkWorld(k3, [r3], { answer: () => 'parried' });
      stepN(e3, w3, 3, () => { if (e3.mode === 'spin' && !e3.struck) { e3.struck = true; hookTake(e3, 5, r3.x, w3); } }); ok(e3.struck && e3.mode !== 'spin' && e3.mode !== 'ride', 'and one blow in the spin drops him (' + e3.mode + ')'); } } }
{ /* never two swipes inside HK.noStack */
  const kit = kitNew(), r = onLine(kit, 'E2', 58 * TS), a = hookOn(kit, 'E2', 52, 1), b = hookOn(kit, 'E2', 64, -1), w = hkWorld(kit, [r], { answer: () => 'blocked' });
  for (let i = 0; i < 60 * 8; i++) { w.now += DT; hookStep(a, DT, w); hookStep(b, DT, w); }
  const sw = w.swipes || []; let minGap = 9; for (let i = 1; i < sw.length; i++) minGap = Math.min(minGap, sw[i] - sw[i - 1]);
  ok(sw.length >= 2 && minGap >= HK.noStack - 1e-6, 'two Hookjacks on one rider: ' + sw.length + ' swipes, never two inside ' + HK.noStack + ' s (min ' + minGap.toFixed(2) + ')'); }
{ /* THE CUTTER: waits; saws only while a hero rides his line, told >= 2 s; a blow stops it; the cut drops the rider a level; then he rides the line */
  const L = lvl(), S = statics(L), kit = lineInit(L), z = kit.lines.H2, e = newHook({ line: 'H2', role: 'cutter' }); e.x = 57 * TS + 8; e.y = 142 * TS; const w = hkWorld(kit, []);
  stepN(e, w, 3); ok(e.mode === 'perch', 'the cutter waits at his station while nobody rides his line');
  const r = onLine(kit, 'H2', 32 * TS); w.heroes = () => [r]; let sawT = 0, cutAt = -1;
  for (let i = 0; i < 60 * 6 && cutAt < 0; i++) { w.now += DT; hookStep(e, DT, w); if (e.mode === 'saw') sawT += DT; if (z.cut > 0) cutAt = w.now; }
  ok(w.marks.includes('!!') && w.sounds.includes('saw'), 'the saw is told: a red !! and the rasp');
  ok(sawT >= 2 - DT, 'the saw takes ' + sawT.toFixed(2) + ' s (>= 2 s to get off, top out or cut him down)');
  ok(cutAt > 0, 'left alone, the line PARTS'); const ev = []; run(kit, [r], 4, () => ({}), S, ev);
  ok(!r.dead && ev.some(q => q.t === 'parted') && (r.ground || r.lk), 'the rider drops a level, not the pit (' + (r.lk ? 'caught ' + r.lk.id : r.on ? 'landed on ' + r.on.i : '?') + ')');
  stepN(e, w, LK.RESTRING + 1, () => kitStep(kit, [], DT)); ok(e.mode === 'ride' || e.mode === 'recover' || e.mode === 'tell', 'when the line is strung again he hooks on and rides it (one cut only: ' + e.mode + ', cuts ' + e.cuts + ')');
  const k2 = kitNew(), e2 = newHook({ line: 'H2', role: 'cutter' }); e2.x = 57 * TS + 8; e2.y = 142 * TS; const r2 = onLine(k2, 'H2', 32 * TS), w2 = hkWorld(k2, [r2]);
  stepN(e2, w2, 1.5); ok(e2.mode === 'saw' && hookOpen(e2), 'while he saws he is open'); hookTake(e2, 10, e2.x - 10, w2); stepN(e2, w2, 1.2);
  ok(!(k2.lines.H2.cut > 0) && e2.mode !== 'saw', 'a blow (or a shot) stops the saw: the line holds');
  const k3 = kitNew(), e3 = newHook({ line: 'E1', role: 'cutter' }); e3.x = 76 * TS; e3.y = 92 * TS; const r3 = onLine(k3, 'E1', 67.6 * TS), w3 = hkWorld(k3, [r3]); const S3 = statics(lvl()); let topped = false;
  for (let i = 0; i < 60 * 4 && !topped; i++) { w3.now += DT; hookStep(e3, DT, w3); for (const q of tick(k3, [r3], () => ({ strike: i % 9 === 0 }), S3)) if (q.t === 'top') topped = true; }
  ok(topped && !(k3.lines.E1.cut > 0), 'THE EXAM RACE: striking hard, a rider tops E1 before the cutter\'s saw is through'); }
{ /* ON FOOT: the same told hook; into the void he is gone */
  const kit = kitNew(), h = mkBody('knight', 70 * TS, 134 * TS), e = newHook({ line: null }); e.mode = 'foot'; e.x = 76 * TS; e.y = 134 * TS; e.modeT = 0; const w = hkWorld(kit, [h]);
  let told = false; stepN(e, w, 4, () => { if (e.mode === 'footTell') told = true; }); ok(told && w.hurts.length > 0, 'on a landing he walks at you and swings the same told hook');
  const e2 = newHook({ line: null }); e2.mode = 'fall'; e2.x = 40 * TS; e2.y = 60 * TS; e2.vy = 0; const kit2 = lineInit({ ...lvl(), h: 70 }); const w2 = hkWorld(kit2, []); w2.landingUnder = () => null; w2.pitY = 80 * TS;
  stepN(e2, w2, 4); ok(!e2.alive && e2.gone, 'knocked off over the void, he is gone'); }
{ /* THE COUNTER ROW: every hero can hit him in his tell from where he hangs (the tell stands inside the shortest melee reach), and every hero has a tap C (parry) */
  const REACH = { knight: 26, warden: 15, pyro: 22, paladin: 24, pirate: 22, reaper: 24, geomancer: 24, berserker: 19, ranger: 17, rimebinder: 22, demonhunter: 22, desertpriest: 22 };   /* src/main.js attackBox0: the forward reach (px past his centre); the Warden's bare jab (javelin out) and the Ranger's knife are the shortest */
  const half = HK.w / 2;
  for (const h of Object.keys(REACH)) ok(HK.tellAt <= REACH[h] + half, h + ': his tell (' + HK.tellAt + ' px) is inside the reach (' + REACH[h] + ' + ' + half + ')');
  ok(HERO_MOVE_IDS.every(h => REACH[h] !== undefined), 'the row covers every hero on master (' + HERO_MOVE_IDS.join(' ') + ')');
  ok(HK.reach > HK.tellAt, 'his swipe reaches past where he tells (stand and fight: no free hit by backing off a step)'); }

SWCFG = null;   /* the sweep left its last lever configuration set */
/* 7. (claude/hlswitch) FLAG-OFF PARITY (always): the patch is a copy - HL_DATA, the live level, has no rule, no lever, no new line, and builds no lever prop */
{ const before = JSON.stringify(HL_DATA); applySwitchPatch(HL_DATA); ok(JSON.stringify(HL_DATA) === before, 'applySwitchPatch works on a copy: HL_DATA (the flag-off level) is untouched');
  ok(HL_DATA.lineKit.rule === undefined && HL_DATA.lineKit.switches === undefined && !HL_DATA.lineKit.lines.some(d => d.hold || ['S5', 'EL', 'EG'].includes(d.id)) && HL_DATA.landings.length === 37, 'flag off: no rule, no switches, no hold glide, no S5 / EL / EG, no new landing');
  ok(HL_DATA.lineKit.lines.every(d => (d.points || []).every(p => p.sw === undefined)), 'flag off: every points board is still hold-UP');
  const painter = (W, H) => { const grid = new Uint8Array(W * H), ents = []; const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
    return { W, H, grid, ents, set, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); }, ent: (t, x, y, o = {}) => ents.push({ t, x, y, ...o }) }; };
  const off = buildHighLines({ painter, T, TS, sw: false, fx: false });
  ok(!off.ents.some(e => e.t === 'hllever') && off.lever === undefined && off.lineKit.rule === undefined && off.points.every(p => p.sw === undefined), 'flag off: the built level has no lever prop, no lever list, no rule');
  ok(off.ents.some(e => e.t === 'sign' && /HOLD UP AS YOU PASS THE BOARD/.test(e.text)) && off.unlocks.some(u => u.hud === 'HOLD UP AT THE BOARD') && off.unlocks.some(u => u.hud === 'STRIKE TO HAUL'), 'flag off: the signs and the callouts are the stroke rule\'s'); }

/* 7b. (claude/hlfix3) FLAG-OFF PARITY: the fix patch is a copy too - HL_DATA / HL_DATA_SW have no fix3 key, three shrines, two nets, and the flag-off build has none of its signs */
{ const b1 = JSON.stringify(HL_DATA), b2 = JSON.stringify(HL_DATA_SW); applyFix3Patch(HL_DATA); applyFix3Patch(HL_DATA_SW); ok(JSON.stringify(HL_DATA) === b1 && JSON.stringify(HL_DATA_SW) === b2, 'applyFix3Patch works on a copy: the flag-off data is untouched');
  ok(HL_DATA.lineKit.fix3 === undefined && HL_DATA_SW.lineKit.fix3 === undefined && HL_DATA.nets.length === 2 && HL_DATA.checkpoints.length === 3 && HL_DATA_FX.nets.length === 11 && HL_DATA_FX.checkpoints.length === 5 && HL_DATA_FX.lineKit.fix3 === true, 'flag off: no fix3 key, two nets, three shrines; the patched copy has ten nets, five shrines'); }

/* 8. (claude/hlswitch) THE SWITCH RULE ON THE LEVEL (--sw): one hit starts every line, levers (never UP) set the points, the lamps, the new lines, the props */
if (SW) {
  const K = DATA.lineKit, L = id => K.lines.find(d => d.id === id), S = statics(lvl());
  ok(K.rule === 'switch' && ['J1', 'J3', 'J4'].every(id => K.switches.some(s => s.id === id)), 'the switch rule is on with the levers J1, J3, J4');
  ok(K.lines.every(d => (d.points || []).every(p => p.sw !== undefined)) && !K.lines.some(d => d.drive), 'every board reads a lever (hold-UP retired) and no line is post-driven');
  ok(L('W3').points[0].sw === 'J1' && L('H2').points[0].sw === 'J3' && L('E2').points[0].sw === 'J4' && L('E2').points[0].to === 'EL', 'J1 sets W3 at 58 (silver line), J3 sets H2 at 40 (S4, off the cutter), J4 sets E2 at 64 (the lee branch EL)');
  ok(L('G2').hold && L('G3').hold && L('EG').hold && L('EG').kind === 'glide' && L('EL').kind === 'winch' && L('S5').kind === 'winch', 'G2, G3, EG are held glides; EL and S5 are winches (S5 climbs east: a glide there would ride the wrong way)');
  /* (claude/hlswitchproof) EVERY LINE RIDES THE WAY IT IS DRAWN a -> b: the kit's downhill is by slope, so a glide must fall a -> b and a winch must rise a -> b (the browser caught S5 drawn rising as a glide: L11 -> Ls4, the J3 branch a dead end) */
  { const wrong = K.lines.filter(d => d.kind !== 'free' && Math.abs(d.a[1] - d.b[1]) * TS >= 2 && (d.kind === 'glide' ? !(d.a[1] < d.b[1]) : !(d.a[1] > d.b[1]))).map(d => d.id); ok(!wrong.length, 'every glide falls and every winch rises a -> b (' + wrong.join(',') + ')'); }
  ok(L('EG').a[1] < L('EG').b[1] && L('EG').a[0] > L('EG').b[0], 'EG runs DOWNHILL west (a glide runs downhill: LE stands above L17)');
  ok(DATA.landings.length === 38 && DATA.landings[37][0] === 71 && K.lee.some(b => b[0] === 71 && b[1] <= DATA.landings[37][1] - 1), 'the new landing LE stands in the (extended) east lee');
  { const bad = lintLines(lvl()); ok(!bad.length, 'the patched level lints clean (' + bad.join('; ') + ')'); }
  const painter = (W, H) => { const grid = new Uint8Array(W * H), ents = []; const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
    return { W, H, grid, ents, set, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); }, ent: (t, x, y, o = {}) => ents.push({ t, x, y, ...o }) }; };
  const B = buildHighLines({ painter, T, TS, sw: true, fx: FX });
  ok(B.ents.filter(e => e.t === 'hllever').length === 3 && K.switches.every(s => B.ents.some(e => e.t === 'hllever' && e.sw === s.id && e.x === s.at[0] && e.y === s.at[1])), 'each lever is a prop entity at its post (hllever)');
  ok(B.lever.length === 3 && B.points.every(p => p.sw) && B.lineKit.rule === 'switch' && B.unlocks.some(u => u.hud === 'A LEVER SETS THE POINTS') && B.unlocks.some(u => u.hud === 'STRIKE ONCE TO RIDE'), 'the level data names the levers, the points read them, the callouts are the switch rule\'s');
  ok(!B.ents.some(e => e.t === 'sign' && /HOLD UP|EVERY BLOW HAULS/.test(e.text)) && B.ents.some(e => e.t === 'sign' && /LEVER SETS THE POINTS/.test(e.text)), 'no sign teaches hold-UP or the stroke; the lever sign stands on L2');
  for (const e of B.ents.filter(q => q.t === 'hllever' && q.from === 'foot')) { const fy = e.y + 1; ok(DATA.landings.some(b => fy === b[1] && e.x >= b[0] && e.x <= b[2]), 'foot lever ' + e.sw + ' stands on a deck'); }
  /* ONE HIT STARTS A LINE: every grip winch, one blow at the foot and he rides to the top with no more input */
  { let n0 = 0; for (const d of K.lines.filter(q => q.kind === 'winch')) { const kit = kitNew(), z = kit.lines[d.id], x0 = z.dir > 0 ? z.xa + 6 : z.xb - 6, b = onLine(kit, d.id, x0), ev = [];
      const secs = (z.xb - z.xa) / LK.LATCH_SPEED + 3; for (let i = 0; i < Math.round(secs / DT) && !ev.some(q => q.t === 'top'); i++) tick(kit, [b], () => (i === 0 ? { strike: true } : {}), S, ev);
      ok(ev.some(q => q.t === 'latch') && ev.some(q => q.t === 'top' && q.id === d.id), d.id + ': ONE blow and the winch carries him to the top'); n0++; }
    ok(n0 === K.lines.filter(q => q.kind === 'winch').length && n0 >= 15, 'every winch (' + n0 + ') is one hit'); }
  { const kit = kitNew(), b = onLine(kit, 'W1', 12 * TS + 6); run(kit, [b], 2, () => ({}), S); ok(Math.abs(b.lk.x - (12 * TS + 6)) < 1e-6, 'no blow yet: he hangs still (the ratchet holds)'); }
  /* HELD GLIDES: parked until one blow */
  for (const id of ['G2', 'G3', 'EG']) { const kit = kitNew(), z = kit.lines[id], x0 = z.dir > 0 ? z.xa + 6 : z.xb - 6, b = onLine(kit, id, x0); run(kit, [b], 2, () => ({}), S); const still = !!b.lk && Math.abs(b.lk.x - x0) < 1e-6;
    const ev = []; tick(kit, [b], () => ({ strike: true }), S, ev); run(kit, [b], 1, () => ({}), S, ev); ok(still && (!b.lk || Math.abs(b.lk.x - x0) > 100), id + ': a held glide is parked until one blow, then runs'); }
  /* LEVERS PICK THE BRANCH; UP never does */
  for (const [line, sw, to, x0] of [['W3', 'J1', 'S2', 69.5 * TS], ['H2', 'J3', 'S4', 29 * TS], ['E2', 'J4', 'EL', 73.5 * TS]]) for (const thrown of [0, 1]) {
    const kit = kitNew(); setSwitches(kit, { [sw]: thrown }); const b = onLine(kit, line, x0), ev = []; for (let i = 0; i < 60 * 40 && !ev.some(q => q.t === 'top'); i++) tick(kit, [b], () => (i === 0 ? { strike: true, up: true } : { up: true }), S, ev);
    const took = ev.some(q => q.t === 'points' && q.to === to); ok(took === !!thrown, line + ' with ' + sw + '=' + thrown + ' (UP held the whole way): ' + (took ? 'takes ' + to : 'stays on ' + line)); }
  /* A LEVER THROWN BY A BLOW: a foot blow on J1 / J4 from their deck, a line swing on J3 from H2 - the geometry reaches */
  for (const [sw, lx, ly, face] of [['J1', 64.5 * TS, 208 * TS, 1], ['J4', 73.5 * TS, 92 * TS, 1]]) { const kit = kitNew(), b = mkBody('knight', lx, ly); b.face = face; const post = kit.posts.find(p => p.sw === sw), ev = [];
    tick(kit, [b], () => ({ strike: true }), S, ev); kitStep(kit, [], DT); ok(kit.sw[sw].state === 1 && post, 'a foot blow on the deck throws ' + sw); }
  { const kit = kitNew(), b = onLine(kit, 'H2', 28 * TS + 6), ev = []; let swung = false;
    for (let i = 0; i < 60 * 14 && !ev.some(q => q.t === 'top' || q.t === 'points'); i++) { const near = b.lk && b.lk.x > 33 * TS && b.lk.x < 36 * TS; tick(kit, [b], () => (i === 0 ? { strike: true } : near && !swung ? (swung = true, { strike: true }) : {}), S, ev); }
    ok(swung && kit.sw.J3.state === 1 && ev.some(q => q.t === 'points' && q.to === 'S4'), 'riding H2, ONE line swing at the lever beside the line throws J3 and the points take him onto S4 (before the board)'); }
  { const kit = kitNew(), b = onLine(kit, 'H2', 28 * TS + 6), ev = [];
    for (let i = 0; i < 60 * 14 && !ev.some(q => q.t === 'top' || q.t === 'points'); i++) tick(kit, [b], () => (i === 0 ? { strike: true } : {}), S, ev);
    ok(ev.some(q => q.t === 'top') && kit.sw.J3.state === 0, 'riding H2 without striking the lever: he stays on H2 (the cutter\'s line)'); }
  /* a foot lever ignores a line swing */
  { const kit = kitNew(), post = kit.posts.find(p => p.sw === 'J1'); ok(post.from === 'foot', 'J1 is a foot lever'); const hb = { l: post.x - 8, r: post.x + 8, t: post.y - 8, b: post.y + 8 };
    ok(kitStrike(kit, hb, 'line') === null && kit.sw.J1.state === 0 && !!kitStrike(kit, hb, 'foot') && (kitStep(kit, [], DT), kit.sw.J1.state === 1), 'a line swing does not throw a foot lever; a foot blow does'); }
}

console.log('highlines: ' + n + ' checks OK (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)' + (QUICK ? ' [--quick: knight x1 sweep only]' : ''));
// batch189: touched so the QUICK gate runs this check beside the cave-backdrop draw change
