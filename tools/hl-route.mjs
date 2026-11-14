// tools/hl-route.mjs - THE HIGH LINES PLAYED IN THE PAGE WITH REAL KEYS (claude/hlproof, 11-12). tools/highlines.mjs + tools/line-kit.mjs prove the level in Node (a model of the
// body, the pure kit). The bots (level-walk / pilot / mash) have no line hook and are lifted past every winch, so nothing had ever ridden THIS level in the page. This does, for a
// hero (default knight; --heroes=a,b): from the start landing it works the route the level is built for, one section at a time, with BK.keys + BK.press (the keys a player has) and
// the engine's own loop (BK.sim); no god-mode shortcut except that the level's foes are cleared (the Hookjacks are tools/highlines.mjs' and the Skyhook tools') and BK.god so a
// stray hit does not end a ride. Each leg stands the hero where the previous one left him (he is NOT teleported between legs except with --reset-legs, which stands him on the
// leg's own landing - used to localise a failure and to keep one broken leg from hiding the next). Legs:
//   winch      UP on the landing under the rope takes it, ATTACK every 0.3 s cranks it up, the high end hops him onto its landing
//   glide      UP takes it, he rides to the low end and is set on its landing
//   kick       a glide that ends in the air (F1): JUMP near the end kicks him onto the next line (F2)
//   hop        on foot, a run-up and a jump from one rock lip to the next (the crevice, the cave mouth's steps)
//   weight     in cage B, strike the hopper: the cage rises to the station
//   gondola    board the cab: it creaks, snaps, falls, hooks onto the glide below and docks - he stays in it
// usage: PORT=8644 node tools/hl-route.mjs [--heroes=knight,warden,pyro] [--reset-legs] [--json=out.json]
import { openPage } from './cdp.mjs';
import { writeFileSync } from 'node:fs';
const arg = k => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : ''; };
const HEROES = (arg('heroes') || 'knight').split(',').filter(Boolean), RESET = process.argv.includes('--reset-legs');
const pg = await openPage({ audio: false, fonts: false, seed: 20261112 });
const PAGE = `(async (hero, reset) => {
  const lvm = await import('./src/level.js'), hlm = await import('./src/highlines.js'), LKT = await import('./src/line-kit.js');
  const TS = 16, rows = [], idx = lvm.LEVELS.findIndex(l => l.id === 'highlines'); if (idx < 0) return { err: 'no highlines level (road off?)' };
  const SW = !!hlm.HL_SWITCH, D = SW ? hlm.HL_DATA_SW : hlm.HL_DATA, LAND = D.landings, LINE = Object.fromEntries(D.lineKit.lines.map(d => [d.id, d]));
  const fresh = () => { BK.setHero(hero); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = true; BK.sim(5); for (const e of BK.enemies()) e.alive = false;
    const k = BK.keys; k.left = k.right = k.up = k.down = k.jump = false; return { L: BK.L, P: BK.P, k }; };
  const { L, P, k } = fresh(); const kit = () => BK.kit();
  const clr = () => { k.left = k.right = k.up = k.down = k.jump = false; };
  const stand = (x, feet) => { clr(); P.lk = null; P.lkHeld = false; P.x = x; P.y = feet; P.vx = 0; P.vy = 0; P.ground = false; BK.sim(6); };
  const info = () => ({ x: Math.round(P.x), y: Math.round(P.y), tx: +(P.x / TS).toFixed(1), ty: +(P.y / TS).toFixed(1), ground: !!P.ground, lk: P.lk ? P.lk.id : null, dead: !!(P.dead > 0), hp: Math.round(P.hp) });
  const landUnder = (tx, ty, maxRows = 4) => { let best = -1, bd = 1e9; LAND.forEach((b, i) => { if (tx >= b[0] && tx < b[2] + 1 && b[1] >= ty - 0.01 && b[1] - ty <= maxRows && b[1] - ty < bd) { best = i; bd = b[1] - ty; } }); return best; };
  const onLanding = i => P.ground && !P.lk && Math.abs(P.y - LAND[i][1] * TS) <= 3 && P.x >= LAND[i][0] * TS - 6 && P.x <= (LAND[i][2] + 1) * TS + 6;
  const row = (name, ok, why) => rows.push({ name, ok: !!ok, why: ok ? '' : why });
  const settle = (cap = 200) => { let f = 0; for (; f < cap && !(P.ground && !P.lk); f++) BK.sim(1); return f; };
  /* where the previous leg left him must be this leg's landing (or he is stood there under --reset-legs) */
  const walkTo = x => { const tx = x * TS; for (let f = 0; f < 900 && Math.abs(P.x - tx) > 5; f++) { k.left = P.x > tx; k.right = P.x < tx; BK.sim(1); } clr(); BK.sim(8); };
  const at = (li, x) => { if (!reset && onLanding(li)) walkTo(x); else { if (!reset) rows.push({ name: '  (stood on landing ' + li + ' - the last leg did not leave him there: ' + JSON.stringify(info()) + ')', ok: false, why: 'the previous leg ended off this landing', note: true }); stand(x * TS, LAND[li][1] * TS); } };
  const take = (id, cap = 40) => { const z = kit().lines[id]; k.up = true; let got = false; for (let f = 0; f < cap && !got; f++) { BK.sim(1); got = !!P.lk && P.lk.id === id; } k.up = false; return got; };
  const crank = (cap = 2400) => { let f = 0; for (; f < cap && P.lk; f++) { if (SW ? f === 0 : f % 18 === 0) BK.press('atk'); BK.sim(1); } return f; };   /* (batch188) the switch rule: ONE blow carries him (the kit's latch); the old rule cranks every 0.3 s */
  const rideOut = (cap = 1600) => { let f = 0; for (; f < cap && P.lk; f++) BK.sim(1); return f; };
  const takeHow = (id, from, x0) => { let got = take(id); if (got) return 'stand'; const z = kit().lines[id]; const A = LAND[from];
    for (let x = A[0] * TS + 6; x <= (A[2] + 1) * TS - 6 && !got; x += 4) { stand(x, A[1] * TS); got = take(id, 6); if (got) return 'sweep@' + (x / TS).toFixed(1); }
    for (let x = A[0] * TS + 6; x <= (A[2] + 1) * TS - 6 && !got; x += 8) { stand(x, A[1] * TS); k.up = true; k.jump = true; BK.press('jump'); for (let f = 0; f < 40 && !(P.lk && P.lk.id === id); f++) BK.sim(1); k.up = false; k.jump = false; got = !!P.lk && P.lk.id === id; if (got) return 'jump@' + (x / TS).toFixed(1); }
    return ''; };
  const winch = (id, from, to, xo) => { const d = LINE[id], ax = d.a[0], bx = d.b[0]; at(from, xo === undefined ? ax : xo);
    const how = takeHow(id, from); const got = !!how; row(id + ' winch: UP on landing ' + from + ' takes it' + (how && how !== 'stand' ? '  [ONLY BY ' + how + ': standing at the rope foot (x ' + ax + ') does not reach it]' : ''), got, 'not taken ' + JSON.stringify(info())); if (!got) return false;
    const y0 = P.y, f = crank(); const climbed = y0 - P.y; settle();
    row(id + ' winch: strikes haul him up (' + f + ' frames) and the top sets him on landing ' + to, onLanding(to) && !(P.dead > 0), 'ended ' + JSON.stringify(info()) + ' climbed ' + Math.round(climbed)); return onLanding(to); };
  const glide = (id, from, to, xo) => { const d = LINE[id]; at(from, xo === undefined ? d.a[0] : xo); const how = takeHow(id, from); const got = !!how; row(id + ' glide: UP on landing ' + from + ' takes it' + (how && how !== 'stand' ? '  [ONLY BY ' + how + ']' : ''), got, 'not taken ' + JSON.stringify(info())); if (!got) return false;
    if (SW && LINE[id].hold) BK.press('atk'); const f = rideOut(); settle(); row(id + ' glide: rides to the low end (' + f + ' frames) and is set on landing ' + to, onLanding(to) && !(P.dead > 0), 'ended ' + JSON.stringify(info())); return onLanding(to); };
  const hop = (from, to, label) => { /* a run-up and a jump from landing "from" toward landing "to": starts at the near edge, farther back, and under the target's own middle */
    const A = LAND[from], B = LAND[to], bc = ((B[0] + B[2] + 1) / 2) * TS, ac = ((A[0] + A[2] + 1) / 2) * TS, lo = A[0] * TS + 5, hi = (A[2] + 1) * TS - 5, cl = x => Math.max(lo, Math.min(hi, x)), dirTo = bc > ac ? 1 : -1, edge = dirTo > 0 ? hi : lo;
    const starts = [0, 24, 48, 80, 120].map(r => cl(edge - dirTo * r)).concat([bc - 40, bc - 12, bc + 12, bc + 40].map(cl)); let ok = false; const tried = [];
    if (!reset && !onLanding(from)) rows.push({ name: '  (hop start: stood on landing ' + from + ', he was not there: ' + JSON.stringify(info()) + ')', ok: false, why: 'previous leg ended off this landing', note: true });
    for (const sx of starts) { if (tried.includes(String(Math.round(sx)) + ':ok')) continue; const dir = bc > sx ? 1 : -1; stand(sx, A[1] * TS);
      k[dir > 0 ? 'right' : 'left'] = true; BK.sim(8); k.jump = true; BK.press('jump'); for (let f = 0; f < 90 && !onLanding(to); f++) { BK.sim(1); if (f === 20) k.jump = false; }
      clr(); BK.sim(30); const good = onLanding(to); tried.push(Math.round(sx / TS * 10) / 10 + ':' + (good ? 'ok' : 'miss(' + Math.round(P.x / TS) + ',' + Math.round(P.y / TS) + (P.lk ? ' on ' + P.lk.id : '') + ')')); if (good) { ok = true; break; } }
    row('hop ' + (label || from + '->' + to) + ': a run-up and a jump reaches it' + (ok && tried.length > 1 ? ' (start ' + tried[tried.length - 1].split(':')[0] + ' after ' + (tried.length - 1) + ' misses)' : ''), ok, 'tried ' + tried.join(' ') + ' ' + JSON.stringify(info())); return ok; };
  /* ---- the route ---- */
  winch('W1', 0, 1); winch('W2', 1, 2, 38.5);
  winch('W3', 2, 3, 69.5);
  /* F1 ends in the air; a kick near its end catches F2 */
  { at(3, 40); const got = take('F1'); row('F1 glide: UP on landing 3 takes it', got, JSON.stringify(info()));
    if (got) { const z = kit().lines.F1, endX = Math.min(z.xa, z.xb) * 1; let caught = null, tried = [];
      for (let f = 0; f < 700 && P.lk && P.lk.id === 'F1'; f++) { BK.sim(1); if (P.x <= (LINE.F1.b[0] + 1.4) * TS) break; }
      for (let attempt = 0; attempt < 1; attempt++) { BK.press('jump'); for (let f = 0; f < 80 && !(P.lk && P.lk.id === 'F2'); f++) BK.sim(1); caught = P.lk && P.lk.id === 'F2'; tried.push(JSON.stringify(info())); }
      row('F1 -> F2: a kick at the end of F1 catches F2 across the gap', caught, 'after the kick ' + tried.join(' '));
      if (caught) { rideOut(); settle(); row('F2 glide: rides to the low end and is set on landing 5', onLanding(5), 'ended ' + JSON.stringify(info())); } } }
  winch('W4', 5, 6, 4.5);
  winch('W5', 6, 7, 27.5);
  glide('G2', 7, 8, 11.5);
  winch('W6', 8, 9, 77.5);
  glide('G3', 9, 10, 60.5);
  winch('H1', 10, 11, 7.5);
  winch('H2', 11, 13, 28.5);
  winch('H3', 13, 14, 60.5);
  /* the crevice: on foot, rock lips up to the shelf */
  { const lips = [14, 15, 16, 17, 18, 19, 20, 21, 22]; for (let i = 0; i + 1 < lips.length; i++) { if (!hop(lips[i], lips[i + 1], 'crevice ' + lips[i] + '->' + lips[i + 1])) break; } }
  /* the counterweight: cage B at the shelf, strike the hopper */
  { const W = kit().weights[0]; at(22, 14); const cage = LKT.platforms(kit()).filter(p => /lift/.test(String(p.id))).map(p => ({ id: p.id, x0: Math.round(p.x0 / TS), x1: Math.round(p.x1 / TS), top: Math.round(p.top / TS) }));
    row('weight: the cage platforms exist', cage.length >= 2, JSON.stringify(cage));
    const B = LKT.platforms(kit()).filter(p => /lift/.test(String(p.id))).sort((a, b) => b.x0 - a.x0)[0];   /* the east one (cage B) is next to the hopper */
    if (B) { P.x = (B.x0 + B.x1) / 2 + 10; P.y = B.top; P.vx = 0; P.vy = 0; P.ground = false; P.face = 1; BK.sim(8);
      const top0 = B.top; for (let f = 0; f < 6; f++) { BK.press('atk'); BK.sim(2); } for (let f = 0; f < 400 && Math.abs(P.y - top0) < 100; f++) BK.sim(1); { let still = 0, last = -1; for (let f = 0; f < 900 && still < 40; f++) { BK.sim(1); const y = Math.round(LKT.platforms(kit()).find(p => p.id === B.id).top); still = y === last ? still + 1 : 0; last = y; } }
      const up = top0 - P.y; row('weight: a blow on the hopper lifts cage B (rose ' + Math.round(up) + ' px)', up > 200, 'he is at ' + JSON.stringify(info()) + ' platforms ' + JSON.stringify(LKT.platforms(kit()).map(p => [p.id, Math.round(p.top)]))); } }
  /* the gondola: board the cab at the station, wait it out */
  { stand(14 * TS, 102 * TS); const cab = () => { const c = kit().cabs[0]; return c; }; const c0 = cab(); const cp = LKT.platforms(kit()).find(p => p.cab);
    row('gondola: the cab waits at the station', !!cp && cab().st === 'rest', 'cab ' + JSON.stringify(cab() && { st: cab().st, x: Math.round(cab().x) }) + ' platform ' + JSON.stringify(cp && [Math.round(cp.x0), Math.round(cp.top)]));
    if (cp) { rows.push({ name: '  (cab platform x ' + Math.round(cp.x0) + '-' + Math.round(cp.x1) + ' top ' + Math.round(cp.top) + '; movers ' + JSON.stringify(BK.L.movers ? BK.L.movers.filter(m => m.lk).map(m => [m.lk, Math.round(m.x), Math.round(m.y), Math.round(m.w)]) : null) + ')', ok: true, note: true }); P.x = (cp.x0 + cp.x1) / 2 + 8; P.y = cp.top; P.vx = 0; P.vy = 0; P.ground = false; BK.sim(4); const seen = new Set(); let f = 0; let landed = -1, caughtE1 = ''; const trace = [];
      for (; f < 60 * 40; f++) { BK.sim(1); const s = cab().st; seen.add(s); if (f % 90 === 0) trace.push(s + '@' + Math.round(P.x / TS) + ',' + Math.round(P.y / TS) + (P.ground ? 'g' : '') + (P.lk ? 'L' : '')); if (s === 'dock' && P.ground && f > 120) { k.right = true; for (let g = 0; g < 80 && !P.lk; g++) BK.sim(1); k.right = false; BK.sim(20); if (P.lk) { caughtE1 = P.lk.id; k.down = true; BK.sim(3); k.down = false; settle(); } if (onLanding(26)) { landed = f; } break; } }
      row('gondola: boards, creaks, snaps, falls, hooks on and docks with him in it; he steps off onto the dock (' + [...seen].join('>') + ' ' + f + ' frames' + (caughtE1 ? '; walking off the cab onto the dock took E1 by itself, DOWN dropped him back' : '') + ')', landed > 0 && !(P.dead > 0), 'ended ' + JSON.stringify(info()) + ' states ' + [...seen].join('>') + ' cab ' + cab().st + ' trace ' + trace.join(' ')); } }
  /* the exam */
  winch('E1', 26, 27, 67.5); winch('E2', 27, 28, 74.5); winch('E3', 28, 29, 38.5);
  /* the cave mouth steps: on foot */
  { const steps = [29, 30, 31, 32, 33, 34]; for (let i = 0; i + 1 < steps.length; i++) { if (!hop(steps[i], steps[i + 1], 'steps ' + steps[i] + '->' + steps[i + 1])) break; } }
  /* ---- shrines and death: the three shrines, a death on a winch, a death on a glide in the gale, a death at the cave mouth: he wakes at the LAST lit shrine, whole, off any line, and the line he died on works again ---- */
  { fresh(); const SH = BK.shrines().slice().sort((a, b) => b.y - a.y); row('shrines: three, bottom to top (' + SH.map(q => Math.round(q.x / TS) + ',' + Math.round(q.y / TS)).join(' ') + ')', SH.length === 3, 'shrines ' + SH.length);
    const visit = q => { clr(); P.lk = null; P.x = q.x; P.y = q.y; P.vx = 0; P.vy = 0; BK.sim(4); };
    const die = () => { BK.god = false; P.inv = 0; BK.damagePlayer(P.x, 99999, { unblockable: true, name: 'TEST' }); let n = 0; while (n < 900 && (P.dead || P.hp <= 0)) { BK.sim(1); n++; } BK.god = true; BK.sim(30); return n; };
    const woke = (q, name) => { const dx = Math.abs(P.x - q.x), dy = Math.abs(P.y - q.y); row(name + ': wakes at the shrine (' + Math.round(P.x / TS) + ',' + Math.round(P.y / TS) + '), whole, off the line', dx < 40 && dy < 40 && !P.lk && P.hp >= P.maxHp - 1 && !(P.dead > 0), 'woke ' + JSON.stringify(info()) + ' want ' + Math.round(q.x / TS) + ',' + Math.round(q.y / TS)); };
    visit(SH[0]); row('shrine 1 lights the checkpoint', BK.checkpointAt().x === SH[0].x, 'cp ' + JSON.stringify(BK.checkpointAt()));
    /* die half-way up W1 */
    { walkTo(12.2); const got = take('W1'); for (let f = 0; f < 120 && P.lk; f++) { if (f % 18 === 0) BK.press('atk'); BK.sim(1); } const up = P.lk ? 'hanging at ' + Math.round(P.y / TS) : 'off the line'; die(); woke(SH[0], 'a death on W1 (' + up + ')');
      walkTo(12.2); const again = take('W1'); row('W1 works again after the death', again, JSON.stringify(info())); }
    visit(SH[1]); row('shrine 2 (L8) lights the checkpoint', BK.checkpointAt().x === SH[1].x, 'cp ' + JSON.stringify(BK.checkpointAt()));
    /* die riding G3 (the shrine's own glide) */
    { const got = take('G3'); for (let f = 0; f < 60 && P.lk; f++) BK.sim(1); die(); woke(SH[1], 'a death on G3 after shrine 2'); }
    /* die in the exam: stand at E2's foot, strike up it, die */
    { stand(74.5 * TS, LAND[27][1] * TS); const got = take('E2') || (stand(73.4 * TS, LAND[27][1] * TS), take('E2')); for (let f = 0; f < 150 && P.lk; f++) { if (f % 18 === 0) BK.press('atk'); BK.sim(1); } die(); woke(SH[1], 'a death on E2 in the exam gale (the last lit shrine is still shrine 2)'); }
    visit(SH[2]); row('shrine 3 (cave mouth) lights the checkpoint', BK.checkpointAt().x === SH[2].x, 'cp ' + JSON.stringify(BK.checkpointAt()));
    die(); woke(SH[2], 'a death at the cave mouth'); }
  return { rows, hero, hp: Math.round(P.hp) };
})(${JSON.stringify('HERO')}, ${RESET})`;
const out = {}; let bad = 0;
for (const h of HEROES) {
  const r = await pg.evalp(PAGE.replace('"HERO"', JSON.stringify(h)), 600000);
  if (r.err) { console.log('FAIL', h, r.err); bad++; continue; }
  const fails = r.rows.filter(x => !x.ok); out[h] = r.rows; bad += fails.length;
  console.log((fails.length ? 'FAIL' : ' ok ') + ' ' + h + '  ' + (r.rows.filter(x => !x.note).length - fails.length) + '/' + r.rows.filter(x => !x.note).length + ' legs pass');
  for (const x of r.rows) console.log('   ' + (x.ok ? '+' : 'X') + ' ' + x.name + (x.ok ? '' : '  <- ' + x.why));
}
if (arg('json')) writeFileSync(arg('json'), JSON.stringify(out, null, 1));
await pg.close();
process.exit(bad ? 1 : 0);
