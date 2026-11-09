/* src/conductor.js - THE CONDUCTOR, THE GHOST TRAIN's boss (claude/ghosttrain, the OPUS GREYBOX; brief section 1, Daniel Q1 = A). THE FIGHT, PURE: no canvas, no page,
   no main.js. src/conductor-hands.js binds it to the world (the tiles he punches out, the vans he uncouples, the heroes he hurts) and draws it; tools/ghosttrain.mjs fights it.
   He keeps the timetable of the dead: a tall ghost in a railwayman's coat, a lantern in one hand and a ticket punch in the other. He glides - through a roof, through a floor.
   THE ARENA: the front of the train, west to east - THE MAIL VAN, THE CONDUCTOR'S VAN, THE TENDER, THE ENGINE. It SHRINKS: he uncouples the vans one by one.
   P1 (100% -> 50%), on the cars:
     LANTERN SWING   told 0.55 s (the lantern drawn back, a yellow mark), a short swing - blockable
     TICKET PUNCH    told 0.8 s (the punch raised, its double clack): three holes punched in the deck you stand on, told 0.9 s (red), then THE BOARDS GO for 3 s.
                     A hole in a roof drops you into the car; a hole in a floor drops you on THE TRACKS (hurt, put back - src/ghost-train-hands.js)
     TUNNEL AHEAD!   told 1.8 s (he cups his hands and calls it, the whistle answers): a tunnel's mouth sweeps down the train from the engine; anyone standing on top is hit -
                     DUCK FLAT or GET INSIDE. He calls it when someone is up top, and every CD.tunnel.every s regardless
     UNCOUPLING!     at 80% and at 60%: told 1.6 s at the pin (chain rattle), the gangway goes, 1.2 s to JUMP FORWARD, then the van is left on the line - the arena moves on
   THE EMERGENCY BRAKE (THE KEY - B14): a red handle in each car. Strike it while its gauge is full: THE TRAIN LURCHES, HE IS THROWN, and he lies OPEN x2 for 3.2 s.
     It builds pressure again over CD.brake.charge s (one gauge for the train). A van's handle goes with its van.
   P2 (50% -> 0), FUSED WITH THE FIREBOX: at 50% he rises, glides to the engine and feeds himself to the fire (told, 2.6 s; still x0.45 - never untouchable). Then he is the firebox:
     THE FIREBOX     told 0.9 s (the door glows, roars): a jet of fire low along the footplate and the tender's plate - jump it
     STACK SPARKS    told 1.0 s (the stack chuffs, red marks where they will fall): five embers on the tender, the cab roof, the boiler
     THE FIRE REACHES told 0.6 s: a hand of fire out of the door at whoever stands at it
     TUNNEL AHEAD!   the whistle, told 1.4 s
     THE BRAKE in the cab and on the tender: the lurch blows the fire back and throws him OUT of the firebox onto the footplate - OPEN x2 for 3.2 s - and he crawls back in.
   B15: x0.45 outside an opening (P1 and P2, and through the fuse), x2 in an opening (capped at CD.openCap of his health per opening); never untouchable. P1 cannot go
   under 50% (the floor holds only until his move in hand is done). Every move: its own windup pose, its own release pose, its own sound (POSE, src/conductor-hands.js). */

export const CD = {
  hp: 2900, w: 14, h: 30, markH: 46, speed: 64,
  resist: 0.45, openMul: 2, openCap: 0.12, floorP1: 0.5,
  swing: { tell: 0.55, act: 0.16, reach: 34, dmg: 14, cd: 1.2 },
  punch: { tell: 0.8, act: 0.2, reach: 24, dmg: 16, holes: 3, step: 44, w: 2, holeTell: 0.9, open: 3.0, cd: 5.0, range: 150 },
  tunnel: { tell: 1.8, len: 720, speed: 360, dmg: 24, every: 15, again: 0.9, cdUp: 6.5 },
  uncouple: { at: [0.8, 0.6], tell: 1.6, part: 1.2 },
  brake: { charge: 10, first: 3, open: 3.2, throw: 64, thrownT: 0.45, lurch: 26 },
  fuse: { rise: 0.6, glide: 1.0, fuse: 2.0 },
  blast: { tell: 0.9, act: 0.6, len: 260, h: 18, dmg: 20, cd: 4.2 },
  sparks: { tell: 1.0, act: 0.3, n: 5, r: 13, dmg: 14, cd: 5.5 },
  grasp: { tell: 0.6, act: 0.25, reach: 44, dmg: 18, cd: 2.4 },
  p2tunnel: { tell: 1.4, every: 13 },
  refuse: 0.9,
};
const OPEN_MODES = new Set(['down']);
export const cdOpen = e => !!e && OPEN_MODES.has(e.mode) && e.modeT > 0;
export const OPEN_NAME = { down: 'THROWN' };

/* THE ARENA'S GEOMETRY from the built level (src/ghost-train.js): his four cars (px), the two couplings he cuts, the brakes, the firebox */
export function geom(L, TS = 16) {
  const A = L.arena, gt = L.gt, ROOF = 12, FLOOR = 18;
  const cars = A.cars.map(i => { const c = gt.cars[i]; return { i, kind: c.kind, x0: c.x0 * TS, x1: (c.x1 + 1) * TS, top: c.kind === 'engine' ? 11 * TS : c.closed ? ROOF * TS : 14 * TS, floor: FLOOR * TS, closed: c.closed }; });
  const cuts = A.cuts.map(id => { const cp = gt.couplings.find(q => q.id === id); return { id, behind: cp.behind, x: cp.pinX, y: cp.pinY, g0: cp.g0, g1: cp.g1 }; });
  const brakes = gt.brakes.map(b => ({ ...b }));
  const eng = cars[cars.length - 1];
  return { cars, cuts, brakes, firebox: { ...A.firebox }, x0: A.x0, x1: A.x1, front: eng.x1, floorY: A.floor, cab: [A.cab[0] * TS, (A.cab[1] + 1) * TS], TS };
}
export function newFight(G) {
  return { G, ph: 1, x0: G.x0, gone: [], press: 1 - CD.brake.first / CD.brake.charge, holes: [], tunnel: null, unc: null, k: 0, cd: { swing: 0.6, punch: 2.0, tunnel: 6, blast: 2.0, sparks: 3.5, grasp: 1.5 },
    told: {}, openDealt: 0, opens: 0, fx: [], blasts: [], embers: [], n: { swings: 0, punches: 0, holes: 0, tunnels: 0, tunnelHits: 0, uncouples: 0, brakes: 0, opens: 0, openHits: 0, coatHits: 0, blasts: 0, sparks: 0, grasps: 0, fused: 0 }, hurt: {}, fused: false, won: false };
}
export const carAt = (G, x) => G.cars.find(c => x >= c.x0 && x < c.x1) || null;
export const liveCars = S => S.G.cars.filter(c => !S.gone.includes(c.i));
export const brakeLive = (S, b) => !S.gone.includes(b.car);
const near = (heroes, x) => heroes.filter(h => h.alive).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;
const setMode = (e, m, t) => { e.mode = m; e.modeT = t; e.modeT0 = t; };

/* A BLOW ON HIM: [damage, word]. Open x2 (capped per opening), x0.45 otherwise; P1 cannot pass 50% */
export function takeBlow(e, S, dmg) {
  let d, word = null;
  if (cdOpen(e)) { const cap = CD.openCap * e.maxHp; d = Math.min(dmg * CD.openMul, Math.max(dmg * CD.resist, cap - S.openDealt)); S.openDealt += d; S.n.openHits++; }
  else { d = dmg * CD.resist; word = 'COAT'; S.n.coatHits++; }
  if (S.ph === 1 && e.hp - d < e.maxHp * CD.floorP1) { d = Math.max(0, e.hp - e.maxHp * CD.floorP1); if (!S.told.holds) { S.told.holds = 1; word = 'HOLDS'; } }
  return [Math.round(d * 100) / 100, word];
}
/* THE EMERGENCY BRAKE, pulled (a hero's blow on a live handle). Returns 'thrown' | 'charging' | 'gone' */
export function pullBrake(e, S, id, W) {
  const b = S.G.brakes.find(q => q.id === id); if (!b || !brakeLive(S, b)) return 'gone';
  if (S.press < 1) { W.say && W.say('pressure', b.x, b.y); return 'charging'; }
  S.press = 0; S.n.brakes++; W.lurch && W.lurch(CD.brake.lurch); W.sound('brake'); W.shake && W.shake(7);
  if (e.mode === 'fuse' || e.mode === 'rise' || e.mode === 'glide') return 'lurched';   /* mid-change he holds on: the lurch is spent, no opening (told: HE HOLDS) */
  S.holes.forEach(h => { if (h.st === 'tell') h.st = 'gone'; }); S.blasts = []; S.embers = S.embers.filter(m => m.t > 0);   /* the lurch throws his tells away with him */
  const dir = 1; e.thrownFrom = e.x; e.vx = dir * CD.brake.throw / CD.brake.thrownT; setMode(e, 'thrown', CD.brake.thrownT); S.openDealt = 0; S.k = 0;
  if (S.fused) { e.x = S.G.firebox.x - 30; e.vx = -CD.brake.throw / CD.brake.thrownT; S.fused = false; }
  W.say && W.say('thrown', e.x, e.y); return 'thrown';
}
const exposedIn = (S, h) => h.exposed && h.alive && !h.ducking;
/* ONE STEP. heroes: [{ x, y, alive, ground, ducking, exposed, pp }]. W: the world (src/conductor-hands.js, or the test's fake) */
export function step(e, S, dt, heroes, W) {
  if (!e.alive) return;
  S.press = Math.min(1, S.press + dt / CD.brake.charge);
  for (const k in S.cd) S.cd[k] = Math.max(0, S.cd[k] - dt);
  e.modeT -= dt;
  stepHoles(S, dt, heroes, W); stepTunnel(e, S, dt, heroes, W); stepUncouple(e, S, dt, heroes, W); stepBlasts(e, S, dt, heroes, W); stepEmbers(S, dt, heroes, W);
  const tgt = near(heroes, e.x);
  switch (e.mode) {
    case 'sleep': return;
    case 'wake': if (e.modeT <= 0) setMode(e, 'walk', 0.4); return;
    case 'thrown': e.x += e.vx * dt; e.x = Math.max(S.x0 + 12, Math.min(S.G.front - 20, e.x)); if (e.modeT <= 0) { e.vx = 0; S.opens++; S.n.opens++; S.openDealt = 0; setMode(e, 'down', CD.brake.open); W.sound('thud'); W.fx && W.fx('open', e.x, e.y); } return;
    case 'down': if (e.modeT <= 0) { if (S.ph === 2) setMode(e, 'refuse', CD.refuse); else setMode(e, 'walk', 0.5); W.sound('rise'); } return;
    case 'refuse': e.x += (S.G.firebox.x - e.x) * Math.min(1, dt * 4); if (e.modeT <= 0) { e.x = S.G.firebox.x; S.fused = true; setMode(e, 'fire', 0.8); } return;
    case 'rise': if (e.modeT <= 0) setMode(e, 'glide', CD.fuse.glide); return;
    case 'glide': { const k = 1 - Math.max(0, e.modeT) / CD.fuse.glide; e.x = e.gx0 + (S.G.firebox.x - e.gx0) * k; e.y = e.gy0 + (S.G.floorY - e.gy0) * k; if (e.modeT <= 0) { e.x = S.G.firebox.x; e.y = S.G.floorY; setMode(e, 'fuse', CD.fuse.fuse); W.sound('fuse'); W.say && W.say('fuse', e.x, e.y); } return; }
    case 'fuse': if (e.modeT <= 0) { S.fused = true; S.n.fused++; setMode(e, 'fire', 1.0); W.say && W.say('fused', e.x, e.y); W.music && W.music(2); } return;
  }
  if (/Tell$|^swing$|^punch$|^blast$|^sparks$|^grasp$|^call$/.test(e.mode)) { if (e.modeT <= 0) stepMove(e, S, dt, heroes, W); return; }
  /* P1 -> P2: at the floor, once the move in hand is done */
  if (S.ph === 1 && e.hp <= e.maxHp * CD.floorP1 + 0.01) { S.ph = 2; e.phase = 2; S.cd.blast = 1.2; S.cd.sparks = 3; S.cd.tunnel = CD.p2tunnel.every * 0.6;
    for (const c of S.G.cuts) if (!S.gone.includes(c.behind) && !S.unc) { beginUncouple(S, c, W, true); break; }
    e.gx0 = e.x; e.gy0 = e.y; setMode(e, 'rise', CD.fuse.rise); W.sound('rise'); return; }
  if (S.ph === 1) return thinkP1(e, S, dt, heroes, tgt, W);
  return thinkP2(e, S, dt, heroes, tgt, W);
}
function thinkP1(e, S, dt, heroes, tgt, W) {
  /* UNCOUPLING at 80% / 60% (one at a time, never during a tunnel) */
  const want = CD.uncouple.at.filter(a => e.hp <= e.maxHp * a).length;
  if (!S.unc && !S.tunnel && S.n.uncouples < want) { const c = S.G.cuts.find(q => !S.gone.includes(q.behind)); if (c) { beginUncouple(S, c, W, false); setMode(e, 'callTell', 0.6); return; } }
  if (!tgt) { setMode(e, 'walk', 0.3); return; }
  /* glide toward the target (a ghost: through roofs and floors) */
  const dx = tgt.x - e.x, ad = Math.abs(dx); e.face = Math.sign(dx) || e.face || 1;
  e.x += Math.sign(dx) * Math.min(ad, CD.speed * dt); e.x = Math.max(S.x0 + 10, Math.min(S.G.front - 20, e.x));
  e.y += (tgt.y - e.y) * Math.min(1, dt * 3);
  const someoneUp = heroes.some(h => h.alive && h.exposed);
  if (!S.tunnel && S.cd.tunnel <= 0 && (someoneUp || S.cd.tunnel <= -CD.tunnel.every + CD.tunnel.cdUp)) { S.cd.tunnel = CD.tunnel.every; startTunnel(e, S, W, CD.tunnel.tell, 'call'); return; }
  if (ad < CD.swing.reach + 4 && S.cd.swing <= 0 && Math.abs(tgt.y - e.y) < 30) { setMode(e, 'swingTell', CD.swing.tell); e.face = Math.sign(dx) || e.face; W.sound('swingTell'); W.mark && W.mark('!', e); return; }
  if (ad < CD.punch.range && S.cd.punch <= 0) { setMode(e, 'punchTell', CD.punch.tell); e.punchAt = { x: tgt.x, y: tgt.y }; W.sound('punchTell'); W.mark && W.mark('!!', e); return; }
  if (e.mode !== 'walk') setMode(e, 'walk', 0.3);
}
function thinkP2(e, S, dt, heroes, tgt, W) {
  e.x = S.G.firebox.x; e.y = S.G.floorY; e.face = -1;
  if (!S.tunnel && S.cd.tunnel <= 0) { S.cd.tunnel = CD.p2tunnel.every; startTunnel(e, S, W, CD.p2tunnel.tell, 'whistle'); return; }
  if (tgt && Math.abs(tgt.x - e.x) < CD.grasp.reach + 6 && S.cd.grasp <= 0) { setMode(e, 'graspTell', CD.grasp.tell); W.sound('graspTell'); W.mark && W.mark('!', e); return; }
  if (S.cd.blast <= 0) { setMode(e, 'blastTell', CD.blast.tell); W.sound('blastTell'); W.mark && W.mark('!!', e); return; }
  if (S.cd.sparks <= 0) { setMode(e, 'sparksTell', CD.sparks.tell); W.sound('sparksTell');
    const spots = []; const alive = heroes.filter(h => h.alive);
    for (let i = 0; i < CD.sparks.n; i++) { const h = alive[i % Math.max(1, alive.length)]; const x = h && i < alive.length * 2 ? h.x + (i >= alive.length ? (i % 2 ? 40 : -40) : 0) : S.x0 + 30 + ((S.G.front - S.x0 - 60) * (i + 0.5)) / CD.sparks.n;
      spots.push({ x: Math.max(S.x0 + 12, Math.min(S.G.front - 12, x)), y: h ? h.y : S.G.floorY, t: CD.sparks.tell + CD.sparks.act }); }
    S.embers.push(...spots); return; }
  if (e.mode !== 'fire') setMode(e, 'fire', 0.4);
}
/* a move in hand: its windup runs out, it lands */
function stepMove(e, S, dt, heroes, W) {
  if (e.modeT > 0) return;
  switch (e.mode) {
    case 'swingTell': setMode(e, 'swing', CD.swing.act); W.sound('swing'); S.n.swings++;
      for (const h of heroes) if (h.alive && Math.sign(h.x - e.x) === e.face && Math.abs(h.x - e.x) < CD.swing.reach && Math.abs(h.y - e.y) < 28) W.hitHero(h, CD.swing.dmg, 'swing', 'swing' + S.n.swings, { blockable: true }); return;
    case 'swing': S.cd.swing = CD.swing.cd; setMode(e, 'walk', 0.2); return;
    case 'punchTell': { setMode(e, 'punch', CD.punch.act); W.sound('punch'); S.n.punches++;
      for (const h of heroes) if (h.alive && Math.abs(h.x - e.x) < CD.punch.reach && Math.abs(h.y - e.y) < 28) W.hitHero(h, CD.punch.dmg, 'punch', 'punch' + S.n.punches, {});
      const at = e.punchAt || { x: e.x, y: e.y }, dir = Math.sign(at.x - e.x) || e.face || 1, cells = [];
      for (let k = 0; k < CD.punch.holes; k++) { const x = at.x - dir * CD.punch.step + dir * CD.punch.step * k; cells.push(...(W.holeCells ? W.holeCells(x, at.y, CD.punch.w) : [])); }
      if (cells.length) { S.holes.push({ cells, st: 'tell', t: CD.punch.holeTell }); S.n.holes++; W.say && W.say('punched', at.x, at.y); }
      return; }
    case 'punch': S.cd.punch = CD.punch.cd; setMode(e, 'walk', 0.3); return;
    case 'callTell': setMode(e, 'call', 0.5); return;
    case 'call': setMode(e, S.ph === 2 ? 'fire' : 'walk', 0.3); return;
    case 'graspTell': setMode(e, 'grasp', CD.grasp.act); W.sound('grasp'); S.n.grasps++;
      for (const h of heroes) if (h.alive && Math.abs(h.x - e.x) < CD.grasp.reach && Math.abs(h.y - e.y) < 30) W.hitHero(h, CD.grasp.dmg, 'grasp', 'grasp' + S.n.grasps, { fire: true }); return;
    case 'grasp': S.cd.grasp = CD.grasp.cd; setMode(e, 'fire', 0.3); return;
    case 'blastTell': setMode(e, 'blast', CD.blast.act); W.sound('blast'); S.n.blasts++; S.blasts.push({ x1: e.x - 6, x0: Math.max(S.x0, e.x - 6 - CD.blast.len), y: S.G.floorY, t: CD.blast.act, key: 'blast' + S.n.blasts }); return;
    case 'blast': S.cd.blast = CD.blast.cd; setMode(e, 'fire', 0.3); return;
    case 'sparksTell': setMode(e, 'sparks', CD.sparks.act); W.sound('sparks'); S.n.sparks++; return;
    case 'sparks': S.cd.sparks = CD.sparks.cd; setMode(e, 'fire', 0.3); return;
  }
}
/* THE TUNNEL: its mouth reaches the engine's front after the tell and sweeps west down the train; it covers [mouth, mouth + len] */
function startTunnel(e, S, W, tell, how) { S.tunnel = { t: -tell, len: CD.tunnel.len, key: 'tn' + (++S.n.tunnels), last: new Map() }; setMode(e, how === 'call' ? 'callTell' : 'callTell', Math.min(tell, 0.9)); W.sound(how === 'call' ? 'call' : 'whistle'); W.say && W.say('tunnel', e.x, e.y); }
export const tunnelSpan = S => { const T0 = S.tunnel; if (!T0 || T0.t < 0) return null; const m = S.G.front - CD.tunnel.speed * T0.t; return [m, m + T0.len]; };
function stepTunnel(e, S, dt, heroes, W) {
  const T0 = S.tunnel; if (!T0) return; T0.t += dt; const sp = tunnelSpan(S); if (!sp) return;
  if (sp[1] < S.x0) { S.tunnel = null; W.tunnelEnd && W.tunnelEnd(); return; }
  for (const h of heroes) { if (!exposedIn(S, h) || h.x < sp[0] || h.x > sp[1]) continue; const id = h.id ?? 0, last = T0.last.get(id);
    if (last !== undefined && T0.t - last < CD.tunnel.again) continue; T0.last.set(id, T0.t); S.n.tunnelHits++; W.hitHero(h, CD.tunnel.dmg, 'tunnel', T0.key + ':' + T0.t.toFixed(2), { knock: true }); }
}
function stepHoles(S, dt, heroes, W) {
  for (const h of S.holes) { h.t -= dt; if (h.st === 'gone') continue;
    if (h.st === 'tell' && h.t <= 0) { h.st = 'open'; h.t = CD.punch.open; W.boards && W.boards(h.cells, false); W.sound('boards'); }
    else if (h.st === 'open' && h.t <= 0) { h.st = 'mended'; W.boards && W.boards(h.cells, true); } }
  S.holes = S.holes.filter(h => h.st === 'tell' || h.st === 'open');
}
function beginUncouple(S, c, W, forced) { S.unc = { c, st: 'tell', t: forced ? 1.0 : CD.uncouple.tell }; W.sound('chain'); W.say && W.say('uncouple', c.x, c.y); }
function stepUncouple(e, S, dt, heroes, W) {
  const U = S.unc; if (!U) return; U.t -= dt; if (U.t > 0) return;
  if (U.st === 'tell') { U.st = 'part'; U.t = CD.uncouple.part; W.gangway && W.gangway(U.c, false); W.say && W.say('uncoupled', U.c.x, U.c.y); W.sound('clank'); return; }
  S.gone.push(U.c.behind); S.n.uncouples++; const next = S.G.cars.find(q => !S.gone.includes(q.i)); S.x0 = next.x0;
  W.leave && W.leave(U.c, next); S.unc = null; if (e.x < S.x0 + 12) e.x = S.x0 + 24;
}
function stepBlasts(e, S, dt, heroes, W) {
  for (const b of S.blasts) { b.t -= dt; for (const h of heroes) if (h.alive && h.x >= b.x0 && h.x <= b.x1 && h.y > b.y - CD.blast.h && h.y <= b.y + 2) W.hitHero(h, CD.blast.dmg, 'blast', b.key, { fire: true }); }
  S.blasts = S.blasts.filter(b => b.t > 0);
}
function stepEmbers(S, dt, heroes, W) {
  for (const m of S.embers) { const was = m.t; m.t -= dt; if (was > CD.sparks.act && m.t <= CD.sparks.act) { m.hot = true; W.sound('ember'); }
    if (m.hot && m.t > 0) for (const h of heroes) if (h.alive && Math.abs(h.x - m.x) < CD.sparks.r && Math.abs(h.y - m.y) < 40) W.hitHero(h, CD.sparks.dmg, 'sparks', 'em' + S.n.sparks + ':' + m.x.toFixed(0), { fire: true }); }
  S.embers = S.embers.filter(m => m.t > 0);
}
