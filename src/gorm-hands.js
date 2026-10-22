// src/gorm-hands.js - KING GORM 2's HANDS (claude/gorm2, the OPUS boss lane, 2026-10-22; numbers src/gorm.js, his AI src/gorm-king.js, the boar src/royal-boar.js).
// main.js owns the world and calls: load (a level load), reset (after spawnEntities: every attempt), update, strike (a blow's box), interact (E),
// spare (his P1 bar has emptied: the flee instead of a death), kingStep (his frame while he flees), archerStep / torchStep (their frames), take (a blade's
// multiplier on him), drawBack (THE GREAT OAK of the glade, behind the tiles), drawWorld (everything else), drawKing (his poses), read / skipTo (tools).
//
// THE HALL (P1): five cages on ROPES (src/kingswood.js L.gorm.hall). One rope is LIVE at a time: two RAFTER ARCHERS file onto its deck and hold it -
//   LOCKED while either lives (a blow on the peg clanks: ITS ARCHERS HOLD THE ROPE). Cut them down (the scaffold) or knock them off (a ROCK from a heap:
//   E takes one, ATTACK throws, UP lobs - the told arc's ring goes gold on a bowman). Then the PEG on the floor drops the cage: on his head he is HELD.
//   A cage that caught him is spent and the next rope goes live (a new pair files in); one that missed comes back up, its rope still free.
//   The archers loose SLOW TOLD ARROWS: a yellow '!' over the bow and the arc drawn to where it will land, a second before it flies.
// THE BURNING WOOD (the escape): his bar empties - the court torches the wood, his bearers carry him off, you are FULLY HEALED. A wall of fire follows you
//   east (it never falls far behind: it hurries when you are far ahead); the floor under the canopy burns; branches burn and fall on the MARKED spots
//   (a creak and a red ring first); the torch goblins light the road in front of you ('!' and the patch flickers first). A shrine at its end.
// THE GLADE (P2): THE GREAT OAK half on fire (L.oakBurn), the hunting lodge, his stump throne; in the oak's boughs hang two CAGES, a LOG TRAP and a
//   BEEHIVE, each on a rope to a peg on the floor. Drop them on him: HELD (x2) / KNOCKED DOWN (x1.75) / STUNG (x1.5); then a told WARD (B3) for 3 s.
import { GORM, GORM_SAY, fireStep } from './gorm.js';
import { newRoyalBoar } from './royal-boar.js';
import * as CT from './carry-throw.js';
import * as KP from './redraw/kingswood_props.js';
CT.addKind('courtrock', { aims: { low: GORM.rock.low, mid: GORM.rock.mid, high: { vx: GORM.rock.vx, vy: GORM.rock.vy } }, g: GORM.rock.g, r: 3, ring: 9, dots: 16 });

export function makeGormHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null, persist = null;
  H.on = () => !!(L() && L().gorm);
  const say = (x, y, k, col = '#ffd36b') => ctx.number(x, y, GORM_SAY[k] || k, col);
  const once = k => { if (!S || S.said.has(k)) return false; S.said.add(k); return true; };
  const G = () => L().gorm;
  const king = () => ctx.enemies().find(e => e.t === 'king' && e.alive) || null;
  const pegBox = (x, y) => ({ l: x - 7, r: x + 7, t: y - 26, b: y + 2 });

  /* ---------------- LOAD / RESET ---------------- */
  H.load = () => { persist = null; S = null; };
  H.reset = () => {
    const lv = L(); if (!lv || !lv.gorm) { S = null; return; }
    const g = lv.gorm, keepSaid = S ? S.said : new Set();
    S = { said: keepSaid, ropes: [], act: -1, fileT: 0, ord: 0, arrows: [], rocks: [], took: 0, rockCd: 0, near: null, arc: null,
      run: { on: false, fireX: 0, t: 0, done: !!(persist && persist.runDone), lit: [], armed: false }, branches: (g.run.branches || []).map(b => ({ ...b, state: 'hang', t: 0 })),
      hangs: (g.glade.hangs || []).map(d => ({ d, state: 'hang', y: d.y0, vy: 0, lx: d.x, resetT: 0, hitK: false, heroHit: false, turn: 0 })),
      cones: [], logs: [], waves: [], swarms: [], n: { arrows: 0, arrowHits: 0, rocks: 0, knocked: 0, cut: 0, caught: 0, boars: 0, penned: 0, branch: 0, branchHits: 0, lit: 0, fireT: 0, cones: 0, logs: 0, quakes: 0, hangDrops: 0, held2: 0, downed: 0, stung: 0, glance: 0, fightAt: undefined } };
    /* the hall's ropes: one to each boss cage, by column */
    const cages = ctx.props().filter(p => p.t === 'dropcage' && p.boss).sort((a, b) => a.x - b.x);
    g.hall.ropes.forEach((r, i) => { const cage = cages.find(c => Math.abs(c.x - r.x) < 10); if (cage) S.ropes.push({ i, cage, x: r.x, pegs: r.pegs, pegY: g.hall.floor, deck: r.deck, archers: r.archers, free: false }); });
    lv.oakBurn = persist ? (persist.stage === 'glade' || persist.runDone ? 0.55 : 0.4) : 0;
    /* a death after his P1 bar emptied: P1 stays beaten (B18's rule for the King's court) - he waits in his glade, the hall is open, the wood burns again */
    if (persist) { const e = king(); if (e) toGlade(e);
      lv.arena = lv.glade;
      if (!S.run.done) S.run.armed = true; }
  };
  /* the King, set down on his stump throne in the glade, asleep until you come (bossStart wakes him there) */
  function toGlade(e) { const gl = L().glade, g = G(); e.stage = 'glade'; e.phase = 4; e.mode = 'sleep'; e.modeT = 0; e.x = g.glade.stumpX; e.y = gl.floor; e.vx = 0; e.vy = 0; e.h = 60; e.w = 68; e.open = 0; e.ward = 0; e.hidden = false;
    e.maxHp = e.maxHp2 || Math.round((e.maxHp || GORM.hp1) * GORM.hp2 / GORM.hp1); e.hp = e.maxHp; e.huntN = 0; e.clubT = 1.5; e.logT = 6; e.quakeT = 9; e.shakeT = 11; e.face = -1; if (ctx.bossActive()) { e.mode = 'wake'; e.modeT = 1.6; } }

  /* ---------------- THE HALL ---------------- */
  const hallOn = () => { const e = ctx.boss(); return !!(e && e.t === 'king' && e.alive && e.stage === 'court' && ctx.bossActive()); };
  const bows = () => ctx.enemies().filter(q => q.alive && q.gormBow);
  const ropeLocked = r => !r || S.act !== r.i || bows().some(q => q.rope === r.i);
  function nextRope() {
    const g = G(), order = g.hall.order || [0, 1, 2, 3, 4];
    let live = S.ropes.filter(r => !r.cage.spent);
    if (!live.length) {   /* AND WHEN THE LAST ONE IS SPENT, THE COURT WINCHES THEM BACK UP: every cage goes up again (only a cage brings his head down - no rack, no fight) */
      for (const r of S.ropes) { const c = r.cage; c.dropped = false; c.spent = false; c.landed = 0; c.y = c.y0; c.hit.clear(); r.free = false; r.counted = false; }
      const e = king(); if (e) ctx.number(e.x, e.y - e.h - 28, GORM_SAY.backUp, '#ffd36b'); ctx.sfx.stone && ctx.sfx.stone(); live = S.ropes.slice(); }
    for (let k = 0; k < order.length; k++) { const i = order[(S.ord + k) % order.length], r = S.ropes.find(q => q.i === i); if (r && !r.cage.spent) { S.ord = (S.ord + k + 1) % order.length; return r; } }
    return live[0];
  }
  function fileIn(r) {
    S.act = r.i; r.free = false;
    for (const [k, ax] of r.archers.entries()) { const y = r.deck[2];
      ctx.spawn({ t: 'archer', x: ax, y, vx: 0, vy: 0, w: 8, h: 10, hp: ctx.ehp('archer'), speed: 0, face: -1, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0, timer: 99, draw: 0, loose: 0,
        gormBow: true, rope: r.i, shotT: GORM.archers.firstFile + k * GORM.archers.every / 2, deckY: y, noGr: false });
      ctx.burst(ax, y - 6, 8, ['#c9b27c', '#8a5a32'], 60, 0.4); }
    const e = king(); say(r.x, r.deck[2] - 34, 'file', '#ff9a5c'); ctx.sfx.hornDraw && ctx.sfx.hornDraw();
    if (once('ropeHint')) ctx.hint('THE CAGE ROPE IS HELD BY THE ARCHERS ON ITS DECK. CLIMB TO THEM, OR THROW A ROCK (E AT A HEAP, UP LOBS). THEN STRIKE ITS PEG WHEN HE IS UNDER IT.');
    return e; }
  function hallStep(dt) {
    const e = ctx.boss(), on = hallOn();
    if (!on) { if (S.act >= 0 && !(e && e.stage === 'court' && e.alive)) { for (const q of bows()) q.alive = false; S.act = -1; } S.waitT = null; return; }
    if (e.mode === 'wake') return;
    const cur = S.act >= 0 ? S.ropes.find(r => r.i === S.act) : null;
    if (cur && cur.cage.spent && !cur.counted) { cur.counted = true; S.n.caught++; }
    if (!cur || cur.cage.spent) { if (S.waitT === null || S.waitT === undefined) S.waitT = cur ? GORM.archers.fileIn : GORM.archers.firstFile;
      S.waitT -= dt; if (S.waitT <= 0) { S.waitT = null; fileIn(nextRope()); } return; }
    if (!cur.free && !bows().some(q => q.rope === cur.i)) { cur.free = true; say(cur.x, cur.pegY - 40, 'free', '#8fd160'); ctx.sfx.medal && ctx.sfx.medal(); }
  }
  /* A RAFTER ARCHER's frame: no walking - he stands his deck, draws (the told arc), looses. main.js calls it instead of the archer's AI */
  H.archerStep = (e, dt) => {
    const P = ctx.P(), A = GORM.archers; e.anim += dt; e.loose = Math.max(0, (e.loose || 0) - dt);
    e.y = e.deckY; e.vy = 0; e.vx = 0;   /* he stands his deck (the rope is his to hold) */
    if (!hallOn() || !P || P.dead) { e.draw = 0; e.aim = null; return; }
    e.face = Math.sign(P.x - e.x) || e.face;
    if (e.aim) { e.draw = Math.max(0.001, e.aim.t); e.aim.t -= dt;
      if (e.aim.t <= 0) { const a = e.aim; S.arrows.push({ x: a.x0, y: a.y0, vx: a.vx, vy: a.vy, life: 3, dead: false }); S.n.arrows++; e.aim = null; e.draw = 0; e.loose = 0.3; e.shotT = A.every; ctx.sfx.bow && ctx.sfx.bow(); } return; }
    e.shotT -= dt;
    if (e.shotT <= 0 && Math.abs(P.x - e.x) > 26) {
      const x0 = e.x + e.face * 5, y0 = e.y - 8, tx = P.x + Math.max(-30, Math.min(30, (P.vx || 0) * 0.25)), ty = P.y - 6, dx = tx - x0, dy = ty - y0;
      const T = Math.max(0.7, Math.min(1.7, Math.hypot(dx, dy) / A.v)), vx = dx / T, vy = dy / T - 0.5 * A.g * T;
      const pts = []; for (let t = 0; t <= T + 0.001; t += T / 14) pts.push([x0 + vx * t, y0 + vy * t + 0.5 * A.g * t * t]);
      e.aim = { t: A.tell, x0, y0, vx, vy, pts, tx, ty }; e.draw = A.tell; ctx.number(e.x, e.y - 18, '!', '#ffd36b'); }
  };
  function arrowsStep(dt) {
    const P = ctx.P(), A = GORM.archers;
    for (const a of S.arrows) { if (a.dead) continue; a.vy += A.g * dt; a.x += a.vx * dt; a.y += a.vy * dt; a.life -= dt;
      if (a.life <= 0 || ctx.solid(Math.floor(a.x / TS), Math.floor(a.y / TS))) { a.dead = true; continue; }
      if (P && !P.dead && Math.abs(P.x - a.x) < 6 && a.y > P.y - (P.h || 18) && a.y < P.y + 2) { a.dead = true; const res = ctx.damage(a.x - Math.sign(a.vx) * 10, A.dmg, { name: 'A RAFTER ARCHER' }); if (res === 'hit') S.n.arrowHits++; } }
    S.arrows = S.arrows.filter(a => !a.dead);
  }
  /* ---------------- ROCKS ---------------- */
  const heldRock = P => (P && P.carry && P.carry.t === 'courtrock' ? P.carry : null);
  const heapNear = P => { if (!P || P.dead || !P.ground || P.carry || !hallOn()) return null; return (G().hall.heaps || []).find(x => Math.abs(P.x - x) < 16 && Math.abs(P.y - G().hall.floor) < 6) ?? null; };
  const rockTarget = (x, y) => bows().find(q => x > q.x - 8 && x < q.x + 8 && y > q.y - 16 && y < q.y + 6) || null;
  const handAt = P => ({ x: P.x + (P.face || 1) * 6, y: P.y - 18 });
  const arcFor = (P, aim) => { const h = handAt(P), a = CT.KINDS.courtrock.aims[aim], v = { vx: (P.face || 1) * a.vx, vy: a.vy };
    return CT.predictArc('courtrock', h.x, h.y, v, (px, py, f) => ctx.solidPx(px, py, f), { stopAt: rockTarget, maxT: 2.6 }); };
  H.aimAt = () => { const P = ctx.P(); if (!heldRock(P)) return null; for (const aim of ['high', 'mid', 'low']) { const r = arcFor(P, aim); if (r.land && r.land.hit) return aim; } return null; };
  H.interact = P => {
    if (!H.on() || !S || !P || P.dead) return false;
    const h = heldRock(P); if (h) { P.carry = null; h.state = 'gone'; return true; }
    const hx = heapNear(P); if (hx === null || S.rockCd > 0) return false;
    const q = { t: 'courtrock', thrKind: 'courtrock', state: 'held', holder: P, x: P.x, y: P.y - 18, vx: 0, vy: 0, hurtWas: P.hurt > 0, launch: PP => CT.launchOf('courtrock', PP, ctx.keys()) };
    S.rocks.push(q); P.carry = q; S.took++; S.rockCd = GORM.rock.every; ctx.sfx.stone && ctx.sfx.stone();
    if (once('rockSay')) say(P.x, P.y - 34, 'rock'); return true; };
  function rocksStep(dt) {
    const P = ctx.P(); S.rockCd = Math.max(0, S.rockCd - dt);
    for (const q of S.rocks) {
      if (q.state === 'held') { const Hh = q.holder; if (!Hh || Hh.dead || Hh.carry !== q || !hallOn()) { if (Hh && Hh.carry === q) Hh.carry = null; q.state = 'gone'; continue; }
        const h = handAt(Hh); q.x = h.x; q.y = h.y;
        if (Hh.hurt > 0 && !q.hurtWas) { Hh.carry = null; q.state = 'gone'; ctx.number(Hh.x, Hh.y - 34, GORM_SAY.dropRock, '#ff9a5c'); continue; }
        q.hurtWas = Hh.hurt > 0; continue; }
      if (q.state === 'fly') { if (!q.counted) { q.counted = true; S.n.rocks++; } const px = q.x, py = q.y; CT.stepArc(q, dt, GORM.rock.g); q.t0 = (q.t0 || 0) + dt;
        const tg = rockTarget(q.x, q.y); if (tg) { q.state = 'gone'; S.n.knocked++; say(tg.x, tg.y - 20, 'knocked', '#8fd160'); tg.knockedOff = true; ctx.hurt(tg, 999, q.x); continue; }
        const e = king(); if (e && Math.abs(q.x - e.x) < e.w / 2 && q.y > e.y - e.h && q.y < e.y) { q.state = 'gone'; ctx.sfx.clank && ctx.sfx.clank(); if (once('rockKing')) ctx.number(e.x, e.y - e.h - 10, GORM_SAY.throwBows, '#c9d1dc'); continue; }
        if (ctx.solidPx(q.x + Math.sign(q.vx) * 3, py, false) && !ctx.solidPx(px, py, false)) { q.state = 'gone'; ctx.burst(px, py, 6, ['#7a6a50', '#b09a5a'], 50, 0.4); continue; }
        if (q.vy < 0 && ctx.solidPx(q.x, q.y - 3, false)) q.vy = 0;
        if (q.vy >= 0 && ctx.solidPx(q.x, q.y + 3, true)) { q.state = 'gone'; ctx.burst(q.x, q.y, 6, ['#7a6a50', '#b09a5a'], 50, 0.4); ctx.sfx.stone && ctx.sfx.stone(); continue; }
        if (q.t0 > 4) q.state = 'gone'; } }
    S.rocks = S.rocks.filter(q => q.state !== 'gone');
    S.near = heapNear(P);
    if (S.near !== null && once('heapHint')) ctx.hint('E TAKES A ROCK FROM THE HEAP. ATTACK THROWS IT - UP LOBS IT TO THE DECKS. A ROCK KNOCKS A RAFTER ARCHER DOWN.');
    S.arc = heldRock(P) && !P.dead ? arcFor(P, CT.aimOf('courtrock', P.face || 1, ctx.keys()).aim) : null;
  }

  /* ---------------- A BLOW: the hall's pegs, the glade's pegs ---------------- */
  H.strike = hb => {
    if (!S || !hb) return;
    for (const r of S.ropes) { const px = r.pegs.find(x => ctx.overlap(hb, pegBox(x, r.pegY))); if (px === undefined) continue; const c = r.cage; if (c.dropped || c.spent) continue;
      if (!hallOn()) continue;
      if (ropeLocked(r)) { if ((S.clankT || 0) <= 0) { S.clankT = 0.5; ctx.sfx.clank && ctx.sfx.clank(); say(px, r.pegY - 34, S.act === r.i ? 'locked' : 'lashed', '#c9d1dc'); } continue; }
      c.dropped = true; c.landed = 0; c.hit.clear(); c.resetT = GORM.cageReset; S.n.cut++; ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(px, r.pegY - 12, 8, ['#c9b27c', '#a83a2a', '#ffe9a0'], 60, 0.5); say(c.x, c.y0 - 50, 'cagefall', '#ff9a5c'); }
    for (const h of S.hangs) { const d = h.d; if (h.state !== 'hang') continue; const px = d.pegs.find(x => ctx.overlap(hb, pegBox(x, d.pegY))); if (px === undefined) continue;
      h.state = 'fall'; h.vy = 0; h.hitK = false; h.heroHit = false; S.n.hangDrops++; ctx.sfx.crack && ctx.sfx.crack(); ctx.sfx.creak && ctx.sfx.creak(); ctx.burst(px, d.pegY - 12, 8, ['#c9b27c', '#a83a2a', '#ffe9a0'], 60, 0.5); }
  };

  /* ---------------- THE FLEE ---------------- */
  /* HIS P1 BAR HAS EMPTIED: no death - the court torches the wood, the bearers come for him, and you are healed. true = the death is spared */
  H.spare = e => {
    if (!S || !e || e.t !== 'king' || e.stage !== 'court') return false;
    const P = ctx.P(), A = L().arena, g = G();
    e.maxHp2 = Math.round((e.maxHp || GORM.hp1) * GORM.hp2 / GORM.hp1);
    e.stage = 'flee'; e.fleeT = 0; e.hp = e.maxHp2; e.maxHp = e.maxHp2; e.mode = 'fleeTell'; e.modeT = 1.7; e.open = 0; e.ward = 0; e.vx = 0; e.stagger = 0; e.thrown = null; e.alive = true; e.dying = 0;
    persist = { stage: 'flee', runDone: false }; S.n.p1At = Math.round(ctx.time() * 10) / 10;
    for (const q of bows()) { q.alive = false; ctx.burst(q.x, q.y - 6, 6, ['#c9b27c', '#8a5a32'], 40, 0.4); }
    for (const q of ctx.enemies()) if (q.alive && q.t === 'royalboar' && q.called) { q.mode = 'bolt'; q.modeT = 2; }
    S.arrows = []; S.act = -1;
    ctx.endFight(); L().arena = L().glade;   /* his hall is done: the arena is his glade now (nothing wakes him in the hall again) */
    if (P && !P.dead) { P.hp = P.maxHp; if (P.hpShown !== undefined) P.hpShown = P.maxHp; P.st = P.maxSt || P.st; say(P.x, P.y - 40, 'healed', '#8fd160'); ctx.sfx.heal && ctx.sfx.heal(); }
    say(e.x, e.y - e.h - 30, 'torch', '#ff6b5c'); ctx.sfx.roar && ctx.sfx.roar(); ctx.sfx.hornBlast && ctx.sfx.hornBlast(); ctx.shake(8); ctx.zoom(1.12, 0.5);
    S.run.on = true; S.run.done = false; S.run.t = 0; S.run.fireX = A.x0 - 24; S.run.armed = false;
    L().oakBurn = 0.4;
    ctx.hint('THE COURT HAS FIRED THE WOOD AND CARRIES THE KING TO HIS OAK. RUN EAST - THE FIRE FOLLOWS YOU.');
    return true;
  };
  /* his frame while he flees (the bearers run him out of the hall's east door and on into the wood, ahead of you) - true = handled */
  H.kingStep = (e, dt) => {
    if (!S || e.t !== 'king') return false;
    if (e.stage === 'flee') { const A0 = G().hall; e.modeT -= dt; e.anim = (e.anim || 0) + dt;
      if (e.mode === 'fleeTell') { e.y = A0.floor - 9; if (e.modeT <= 0) { e.mode = 'fleeCarried'; e.face = 1; ctx.sfx.rattle && ctx.sfx.rattle(1); } return true; }
      e.x += 150 * dt; e.y = A0.floor - 9; e.face = 1; if (Math.random() < dt * 20) ctx.dust(e.x - 30, A0.floor, 1); e.fleeT = (e.fleeT || 0) + dt;
      const P = ctx.P(); if (e.x > A0.x1 + 26 * TS || (P && e.x > P.x + 30 * TS) || e.fleeT > 3.2 || ctx.bossActive()) { toGlade(e); L().arena = L().glade; }
      return true; }
    return false;
  };
  H.persist = () => persist;
  function runStep(dt) {
    const P = ctx.P(), R = GORM.run, g = G(), run = S.run, lv = L();
    if (!persist) { ctx.drainStop('gormfire'); ctx.drainStop('gormground'); return; }
    if (run.armed && P && P.x > g.hall.x1 + 12) { run.armed = false; run.on = true; run.t = R.grace - 0.6; run.fireX = g.hall.x1 - 4 * TS; }
    if (run.on && !run.done) { run.t += dt;
      if (run.t > R.grace) run.fireX = Math.min(g.run.fireMax, fireStep(run.fireX, P ? P.x : run.fireX, dt));
      if (P && P.x >= g.run.cpX) { run.done = true; run.on = false; persist.runDone = true; lv.oakBurn = 0.55; ctx.number(P.x, P.y - 40, GORM_SAY.fireDies, '#8fd160'); }
      const inFire = P && !P.dead && P.x < run.fireX + 4;
      if (inFire) { ctx.drain('gormfire', R.drain, { name: GORM_SAY.burning, die: 'BURNED IN THE WOOD', tick: '#ff9a5c' }); S.n.fireT += dt; if (once('inFire')) say(P.x, P.y - 34, 'burning', '#ff6b5c'); }
      else ctx.drainStop('gormfire');
      for (const q of ctx.enemies()) if (q.alive && !q.maxHp && q.x < run.fireX - 4 && q.x > g.hall.x1 && !(q.fireT > 0)) { q.fireT = 0.5; ctx.hurt(q, 12, q.x - 20); }
      for (const q of ctx.enemies()) if (q.fireT > 0) q.fireT -= dt;
    } else ctx.drainStop('gormfire');
    /* THE BURNING GROUND: under the canopy (from the flee on), and whatever a torch goblin has lit */
    S.run.lit = S.run.lit.filter(z => (z.t -= dt) > -0.6);
    let onFire = false;
    if (P && !P.dead && P.ground) { const fy = P.y;
      for (const z of zones()) if (z.on && P.x > z.x0 - 3 && P.x < z.x1 + 3 && Math.abs(fy - z.y) < 3) { onFire = true; break; } }
    if (onFire) { ctx.drain('gormground', R.groundDrain, { name: 'BURNING GROUND', die: 'BURNED IN THE WOOD', tick: '#ff9a5c' }); if (once('ground')) ctx.number(P.x, P.y - 34, GORM_SAY.groundBurns, '#ff9a5c'); }
    else ctx.drainStop('gormground');
    /* BURNING BRANCHES on their marked spots */
    for (const b of S.branches) {
      if (b.state === 'hang' && P && !P.dead && P.x > b.x - 96 && P.x < b.x + 12 && Math.abs(P.y - b.y) < 70) { b.state = 'tell'; b.t = R.branchTell; ctx.sfx.creak && ctx.sfx.creak(); }
      else if (b.state === 'tell') { b.t -= dt; if (b.t <= 0) { b.state = 'fall'; b.t = 0.22; } }
      else if (b.state === 'fall') { b.t -= dt; if (b.t <= 0) { b.state = 'down'; b.t = 2.6; S.n.branch++; ctx.shake(3); ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(b.x, b.y - 4, 12, ['#ff9a5c', '#ffd36b', '#5a3a1a'], 80, 0.6);
        if (P && !P.dead && Math.abs(P.x - b.x) < 16 && P.y > b.y - 30 && P.y <= b.y + 2) { const res = ctx.damage(b.x, R.branchDmg, { up: true, unblockable: true, name: 'A BURNING BRANCH' }); if (res === 'hit') S.n.branchHits++; } } }
      else if (b.state === 'down') { b.t -= dt; if (b.t <= 0) b.state = 'gone'; } }
  }
  const zones = () => { const out = []; if (persist) for (const z of (G().run.burn || [])) out.push({ x0: z[0] * TS, x1: (z[1] + 1) * TS, y: z[2] * TS, on: true, fixed: true });
    for (const z of S.run.lit) if (z.t > 0) out.push({ x0: z.x0, x1: z.x1, y: z.y, on: z.t > 0 && z.lit, tell: !z.lit, t: z.t }); return out; };
  /* A TORCH GOBLIN (a court sprig with a torch, src/kingswood.js kw.torch): he lights the road in front of you once - told, then it burns */
  H.torchStep = (e, dt) => {
    if (!S || !e.torch || !e.alive) return false; const P = ctx.P(), R = GORM.run;
    if (!persist) return false;
    if (e.lightT > 0) { e.lightT -= dt; e.vx = 0; e.face = Math.sign(P.x - e.x) || e.face;
      if (e.lightT <= 0) { const z = e.lightZ; z.lit = true; z.t = R.torchBurn; S.n.lit++; ctx.sfx.fireWhoosh ? ctx.sfx.fireWhoosh() : ctx.sfx.crack && ctx.sfx.crack(); ctx.burst((z.x0 + z.x1) / 2, z.y - 4, 12, ['#ff9a5c', '#ffd36b'], 60, 0.5); }
      e.vy = Math.min(300, (e.vy || 0) + 1000 * dt); const r = ctx.moveBody(e, 0, e.vy * dt); if (r && r.ground) e.vy = 0; return true; }
    if (!e.lit && P && !P.dead && P.x < e.x && e.x - P.x < R.torchReach && Math.abs(P.y - e.y) < 40) {
      e.lit = true; e.lightT = R.torchTell; const fy = Math.floor((e.y + 1) / TS), x1 = e.x - 12, x0 = Math.max(P.x + 20, e.x - 60);
      e.lightZ = { x0, x1: Math.max(x0 + 16, x1), y: fy * TS, t: R.torchTell + R.torchBurn, lit: false }; S.run.lit.push(e.lightZ);
      ctx.number(e.x, e.y - 20, '!', '#ffd36b'); if (once('torchSay')) say(e.x, e.y - 34, 'lit', '#ff9a5c'); return true; }
    return false;
  };

  /* ---------------- THE GLADE ---------------- */
  const gladeOn = () => { const e = ctx.boss(); return !!(e && e.t === 'king' && e.alive && e.stage === 'glade' && ctx.bossActive()); };
  function hangStep(dt) {
    const P = ctx.P(), gl = L().glade, floor = gl ? gl.floor : 0, e = king(), T0 = GORM;
    for (const h of S.hangs) { const d = h.d;
      if (h.state === 'fall') { h.vy = Math.min(560, h.vy + 900 * dt); h.y += h.vy * dt;
        if (h.y >= floor) { h.y = floor; ctx.shake(4); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.dust(h.lx, floor, 10);
          if (d.kind === 'cage') { h.state = 'down'; h.resetT = T0.hangReset.cage;
            if (e && e.stage === 'glade' && Math.abs(e.x - h.lx) < 30 && Math.abs(e.y - floor) < 16) kingHit(e, 'held', h);
            for (const q of ctx.enemies()) if (q.alive && !q.maxHp && q !== e && Math.abs(q.x - h.lx) < 14 && Math.abs(q.y - floor) < 10) ctx.hurt(q, q.t === 'royalboar' ? 999 : 30, h.lx);
            if (P && !P.dead && Math.abs(P.x - h.lx) < 12 && Math.abs(P.y - floor) < 8) ctx.damage(h.lx, 14, { up: true, unblockable: true, name: 'THE CAGE' }); }
          else if (d.kind === 'log') { h.state = 'roll'; h.resetT = T0.hangReset.log; ctx.sfx.rumble && ctx.sfx.rumble(); say(h.lx, floor - 30, 'logfall', '#ff9a5c'); }
          else if (d.kind === 'hive') { h.state = 'down'; h.resetT = T0.hangReset.hive; S.swarms.push({ x: h.lx, y: floor, t: 5, hitK: false }); say(h.lx, floor - 30, 'hive', '#ffd36b'); ctx.sfx.buzz && ctx.sfx.buzz(); ctx.burst(h.lx, floor - 6, 16, ['#e0b040', '#5a3a1a', '#fff0a8'], 80, 0.6); } } }
      else if (h.state === 'roll') { const dir = d.roll || 1, nx = h.lx + dir * 175 * dt; h.turn += dt * 14;
        if (ctx.solid(Math.floor((nx + dir * 24) / TS), Math.floor((floor - 6) / TS)) || nx < gl.x0 + 8 || nx > gl.x1 - 8) { h.state = 'down'; ctx.burst(h.lx, floor - 6, 14, ['#8a5a32', '#c9a060', '#5c3a1d'], 90, 0.7); ctx.sfx.crack && ctx.sfx.crack(); continue; }
        h.lx = nx;
        if (e && e.stage === 'glade' && !h.hitK && Math.abs(e.x - h.lx) < 30 && Math.abs(e.y - floor) < 16) { h.hitK = true; kingHit(e, 'downed', h); }
        for (const q of ctx.enemies()) if (q.alive && !q.maxHp && q !== e && Math.abs(q.x - h.lx) < 20 && Math.abs(q.y - floor) < 10 && !(q.logHitAt === h)) { q.logHitAt = h; ctx.hurt(q, 30, h.lx - dir * 20); }
        if (P && !P.dead && !h.heroHit && Math.abs(P.x - h.lx) < 22 && P.y > floor - 14 && P.y <= floor + 2) { h.heroHit = true; ctx.damage(h.lx - dir * 20, 14, { up: true, unblockable: true, name: 'THE LOG TRAP' }); } }
      else if (h.state === 'down') { h.resetT -= dt; if (h.resetT <= 0) { h.state = 'hang'; h.y = d.y0; h.vy = 0; h.lx = d.x; h.hitK = false; h.heroHit = false; ctx.sfx.stone && ctx.sfx.stone(); } } }
    for (const s of S.swarms) { s.t -= dt;
      if (e && e.stage === 'glade' && !s.hitK && Math.abs(e.x - s.x) < GORM.hiveR && Math.abs(e.y - s.y) < 40) { s.hitK = true; kingHit(e, 'stung', s); }
      for (const q of ctx.enemies()) if (q.alive && !q.maxHp && q !== e && Math.abs(q.x - s.x) < GORM.hiveR && Math.random() < dt * 2) ctx.hurt(q, 3, s.x);
      if (P && !P.dead && Math.abs(P.x - s.x) < GORM.hiveR && Math.abs(P.y - s.y) < 40) { ctx.drain('gormbees', 0.05, { name: 'STUNG', tick: '#e0b040' }); s.stingP = true; } }
    S.swarms = S.swarms.filter(s => s.t > 0);
    if (!S.swarms.some(s => P && Math.abs(P.x - s.x) < GORM.hiveR && Math.abs(P.y - s.y) < 40)) ctx.drainStop('gormbees');
  }
  /* WHAT HANGS IN THE OAK LANDS ON HIM: the opening - or, inside his ward (B3), it glances off */
  function kingHit(e, how, src) {
    if (e.ward > 0 || e.mode === 'held' || e.mode === 'downed' || e.mode === 'stung' || e.mode === 'quakeAir' || e.mode === 'wake') { S.n.glance++; ctx.number(e.x, e.y - e.h - 12, GORM_SAY.warded, '#c9d1dc'); ctx.sfx.clank && ctx.sfx.clank(); return; }
    e.mode = how; e.modeT = how === 'held' ? GORM.heldT : how === 'downed' ? GORM.downedT : GORM.stungT; e.stagger = e.modeT; e.vx = 0; e.open = 0; e.club = null;
    if (how === 'held') { S.n.held2++; ctx.number(e.x, e.y - e.h - 12, GORM_SAY.caught, '#8fd160'); ctx.hurt(e, 40, e.x); ctx.sfx.bellow && ctx.sfx.bellow(); }
    else if (how === 'downed') { S.n.downed++; ctx.number(e.x, e.y - e.h - 12, GORM_SAY.downed, '#8fd160'); ctx.hurt(e, 30, e.x); ctx.sfx.roar && ctx.sfx.roar(); ctx.shake(6); }
    else { S.n.stung++; ctx.number(e.x, e.y - e.h - 12, GORM_SAY.stung, '#8fd160'); ctx.sfx.bellow && ctx.sfx.bellow(); }
    ctx.zoom(1.08, 0.3);
  }
  /* his P2 moves' world halves (src/gorm-king.js calls these at the release of each) */
  H.cones = (xs) => { const gl = L().glade; for (const x of xs) S.cones.push({ x, y: gl.floor, t: GORM.coneTell, state: 'tell', fy: 0 }); S.n.cones++; };
  H.rollLog = (x, dir) => { S.logs.push({ x, dir, y: L().glade.floor, hit: false, turn: 0 }); S.n.logs++; };
  H.quake = (x) => { const gl = L().glade; for (const dir of [-1, 1]) S.waves.push({ x: x + dir * 30, dir, y: gl.floor, life: 3 }); S.n.quakes++; };
  H.callBoar = (A, hall) => { const P = ctx.P(), far = P && P.x < (A.x0 + A.x1) / 2 ? 1 : -1, x = far > 0 ? A.x1 - 18 : A.x0 + 18;
    const b = newRoyalBoar(x, A.floor, { called: true, face: -far, hall: !!hall, hp: ctx.ehp('royalboar') }); ctx.spawn(b); S.n.boars++; ctx.burst(x, A.floor - 8, 10, ['#5c3c28', '#c9b27c'], 70, 0.5); return b; };
  H.hounds = (A, n) => { for (let k = 0; k < n; k++) { const x = k % 2 ? A.x1 - 14 : A.x0 + 14; ctx.spawn({ t: 'hound', x, y: A.floor, vx: 0, vy: -120, w: 12, h: 7, hp: ctx.ehp('hound'), speed: 105, face: k % 2 ? -1 : 1, alive: true, dying: 0, anim: Math.random(), flash: 0, stagger: 0.4, royalHunt: true }); } };
  function gladeFx(dt) {
    const P = ctx.P(), gl = L().glade; if (!gl) return;
    for (const c of S.cones) { c.t -= dt;
      if (c.state === 'tell' && c.t <= 0) { c.state = 'fall'; c.t = 0.25; }
      else if (c.state === 'fall' && c.t <= 0) { c.state = 'gone'; ctx.burst(c.x, c.y - 4, 10, ['#ff9a5c', '#ffd36b', '#5a3a1a'], 70, 0.5); ctx.sfx.thud && ctx.sfx.thud();
        if (P && !P.dead && Math.abs(P.x - c.x) < 13 && P.y > c.y - 40 && P.y <= c.y + 2) ctx.damage(c.x, GORM.coneDmg, { up: true, unblockable: true, name: 'A BURNING CONE' }); } }
    S.cones = S.cones.filter(c => c.state !== 'gone');
    for (const l of S.logs) { l.x += l.dir * GORM.logV * dt; l.turn += dt * 16; if (Math.random() < dt * 20) ctx.dust(l.x - l.dir * 10, l.y, 1);
      if (l.x < gl.x0 + 6 || l.x > gl.x1 - 6 || ctx.solid(Math.floor((l.x + l.dir * 12) / TS), Math.floor((l.y - 6) / TS))) { l.dead = true; ctx.burst(l.x, l.y - 6, 12, ['#8a5a32', '#ff9a5c', '#5c3a1d'], 80, 0.6); continue; }
      if (P && !P.dead && !l.hit && Math.abs(P.x - l.x) < 14 && P.y > l.y - 12 && P.y <= l.y + 2) { l.hit = true; ctx.damage(l.x - l.dir * 20, GORM.logDmg, { up: true, unblockable: true, name: 'A BURNING LOG' }); } }
    S.logs = S.logs.filter(l => !l.dead);
    for (const w of S.waves) { w.x += w.dir * GORM.quakeV * dt; w.life -= dt; if (Math.random() < dt * 30) ctx.part({ x: w.x, y: w.y - 2, vx: w.dir * 30, vy: -50 - Math.random() * 50, life: 0.35, max: 0.35, col: Math.random() < 0.5 ? '#c9b27c' : '#ff9a5c', size: 2, grav: 300 });
      if (w.x < gl.x0 + 4 || w.x > gl.x1 - 4) w.life = 0;
      if (P && !P.dead && P.ground && Math.abs(P.x - w.x) < 9 && P.y > w.y - 4) { w.life = 0; ctx.damage(w.x - w.dir * 20, GORM.quakeDmg, { up: true, unblockable: true, name: 'THE BELLY QUAKE' }); } }
    S.waves = S.waves.filter(w => w.life > 0);
    if (!gladeOn()) { S.cones = []; S.logs = []; S.waves = []; }
  }

  /* ---------------- EVERY FRAME ---------------- */
  H.update = dt => {
    if (!S) return; S.clankT = Math.max(0, (S.clankT || 0) - dt);
    if (hallOn() && S.n.fightAt === undefined) S.n.fightAt = Math.round(ctx.time() * 10) / 10;
    hallStep(dt); arrowsStep(dt); rocksStep(dt); runStep(dt); hangStep(dt); gladeFx(dt);
    const e = king(), lv = L();
    if (e && e.stage === 'glade' && ctx.bossActive() && S.n.p2At === undefined) S.n.p2At = Math.round(ctx.time() * 10) / 10;
    if (e && e.stage === 'glade' && ctx.bossActive()) lv.oakBurn = Math.min(1, 0.55 + 0.45 * (1 - e.hp / Math.max(1, e.maxHp)));
  };
  /* a blade on him: the multiplier his state pays, or null for the global chip (0.4) */
  H.skipTo = stage => {   /* TOOLS: 'glade' - his P1 is beaten and the wood has burned: he waits in his glade (the lab and the probe fight P2 alone) */
    if (!S) return false; const e = king(); if (!e) return false;
    persist = { stage: 'glade', runDone: true }; S.run.done = true; S.run.on = false; toGlade(e); L().arena = L().glade; L().oakBurn = 0.55; ctx.drainStop('gormfire'); return true; };
  H.forceFlee = () => {   /* TOOLS: as if his P1 bar had just emptied and the hero had died after (the walker walks the burning wood from his hall's door) */
    if (!S) return false; const e = king(); if (!e) return false; e.maxHp2 = e.maxHp2 || Math.round((e.maxHp || GORM.hp1) * GORM.hp2 / GORM.hp1);
    persist = { stage: 'flee', runDone: false }; toGlade(e); L().arena = L().glade; S.run.armed = true; S.run.on = false; S.run.done = false; L().oakBurn = 0.4; return true; };
  H.read = () => S ? { act: S.act, ropes: S.ropes.map(r => ({ i: r.i, x: r.x, pegs: r.pegs.slice(), free: !ropeLocked(r) && !r.cage.dropped && !r.cage.spent, dropped: r.cage.dropped, spent: !!r.cage.spent, landed: r.cage.landed })),
    bows: bows().map(q => ({ x: q.x, y: q.y, rope: q.rope, aim: q.aim ? { t: q.aim.t, tx: q.aim.tx, ty: q.aim.ty } : null })), arrows: S.arrows.map(a => ({ x: a.x, y: a.y, vx: a.vx, vy: a.vy })), rocks: S.rocks.map(q => ({ x: Math.round(q.x), y: Math.round(q.y), vx: Math.round(q.vx), vy: Math.round(q.vy), state: q.state })),
    heaps: G().hall.heaps.slice(), arc: S.arc ? { n: S.arc.pts.length, land: S.arc.land ? { x: Math.round(S.arc.land.x), y: Math.round(S.arc.land.y), hit: !!S.arc.land.hit } : null } : null, held: !!heldRock(ctx.P()), heapNear: S.near, aim: H.aimAt(),
    run: { on: S.run.on, done: S.run.done, fireX: S.run.fireX, armed: S.run.armed }, persist: persist ? { ...persist } : null, zones: zones().map(z => ({ x0: z.x0, x1: z.x1, y: z.y, on: z.on })),
    branches: S.branches.map(b => ({ x: b.x, y: b.y, state: b.state })),
    hangs: S.hangs.map(h => ({ kind: h.d.kind, x: h.d.x, lx: h.lx, pegs: h.d.pegs.slice(), state: h.state, roll: h.d.roll || 0 })), cones: S.cones.map(c => ({ x: c.x, t: c.t, state: c.state })),
    logs: S.logs.map(l => ({ x: l.x, dir: l.dir })), waves: S.waves.map(w => ({ x: w.x, dir: w.dir })), swarms: S.swarms.map(s => ({ x: s.x, t: s.t })), n: { ...S.n } } : null;

  /* ---------------- DRAWING (GREYBOX: the art lane repaints - see the lane report's art hooks) ---------------- */
  const R = Math.round, f = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  function flame(g, x, y, h, time, seed) { const k = Math.sin(time * 11 + seed) * 0.5 + 0.5, hh = h * (0.75 + 0.25 * k);
    f(g, '#a8301a', x - 3, y - hh, 6, hh); f(g, '#e0601a', x - 2, y - hh * 0.85, 4, hh * 0.85); f(g, '#ffb04a', x - 1, y - hh * 0.55, 2, hh * 0.55); f(g, '#fff0a8', x, y - hh * 0.3, 1, hh * 0.3); }
  /* THE GREAT OAK OF THE GLADE (behind the tiles): the trunk, the King's door, the boughs over the glade the hangings hang from, the crown - its right half burning */
  H.drawBack = (g, cx, cy, VW, VH, time) => {
    if (!S || !H.on()) return; const gd = G().glade, gl = L().glade; if (!gd || !gl) return;
    const tx = R(gd.trunkX - cx), fy = R(gl.floor - cy), burn = Math.max(0, Math.min(1, +L().oakBurn || 0));
    if (tx < -260 || tx > VW + 260) return;
    /* the crown (a dark mass of leaves over the glade, char on the right) */
    for (let i = 0; i < 26; i++) { const a = (i * 2.399) % 6.283, d = 40 + ((i * 37) % 120), x = tx + Math.cos(a) * d * 1.3, y = fy - 210 + Math.sin(a) * d * 0.35 - (i % 3) * 8, rx = 34 + (i * 13) % 24, ry = 16 + (i * 7) % 10;
      const burnt = burn > 0.3 && x > tx + 10 - burn * 30; g.fillStyle = burnt ? (i % 2 ? '#2a1410' : '#3a1e14') : (i % 3 === 0 ? '#7a2a1a' : i % 3 === 1 ? '#a83a2a' : '#5a1e14');
      g.beginPath(); g.ellipse(R(x), R(y), rx, ry, 0, 0, 6.283); g.fill();
      if (burnt && i % 2 === 0) flame(g, R(x), R(y) - ry + 4, 10 + (i % 4) * 3, time, i); }
    /* the boughs out over the glade */
    for (const [dx, y, len, dir] of gd.boughs) { const y0 = R(y - cy); for (let k = 0; k < len; k++) { const x = tx + dir * (14 + k), t = k / len, w = Math.max(3, 9 - t * 6), yy = y0 + Math.sin(t * 3) * 4 - t * 6;
      f(g, '#1a0e08', x, yy - w / 2 - 1, 1, w + 2); f(g, (dir > 0 && burn > 0.3) ? '#2a1612' : '#4a2a1e', x, yy - w / 2, 1, w); if (k % 5 === 0) f(g, '#7a4a34', x, yy - w / 2, 1, 1); }
      if (dir > 0 && burn > 0.3) for (let k = 10; k < len; k += 14) flame(g, tx + dir * (14 + k), y0 - 6, 8, time, k); }
    /* the trunk: ridged bark, the King's door in its foot (warm light), roots */
    for (let y = fy - 230; y < fy; y++) { const t = (y - (fy - 230)) / 230, w = R(26 + t * t * 18);
      for (let x = -w; x <= w; x++) { const n = (Math.abs(x * 7 + (y >> 3) * 13) % 11); g.fillStyle = x > w * 0.55 ? '#1a0c0a' : x < -w * 0.4 ? (n < 4 ? '#4a2a1e' : '#6a3e2c') : (n < 3 ? '#2a1410' : '#3e2218'); g.fillRect(tx + x, y, 1, 1); } }
    if (burn > 0.2) for (let i = 0; i < 6; i++) flame(g, tx + 14 + (i * 5) % 18, fy - 60 - i * 26, 12 + (i % 3) * 4, time, i * 3);
    { const dx = tx - 2, dy = fy - 46; for (let y = 0; y < 46; y++) { const w = y < 12 ? R(12 * Math.sqrt(1 - Math.pow((12 - y) / 12, 2))) : 12; f(g, '#0a0504', dx - w - 2, dy + y, w * 2 + 4, 1); f(g, '#1a0e08', dx - w, dy + y, w * 2, 1); }
      g.save(); g.globalAlpha = 0.5 + 0.15 * Math.sin(time * 3); f(g, '#ffb060', dx - 8, dy + 20, 16, 26); g.restore(); f(g, '#e0b040', dx - 1, dy - 6, 3, 6); }
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const len = 30 + k * 12; for (let i = 0; i < len; i++) { const x = tx + s * (24 + i), y = fy - 2 - (1 - i / len) * (16 - k * 4); f(g, '#2a1410', x, y - 3, 1, 4); } }
    /* the hunting lodge (left) and the stump throne */
    { const lx = R(gd.lodgeX - cx); if (lx > -80 && lx < VW + 80) { f(g, '#2a1a10', lx - 34, fy - 52, 68, 52); f(g, '#4a2e1c', lx - 32, fy - 50, 64, 50); for (let y = fy - 48; y < fy; y += 6) f(g, '#3a2214', lx - 32, y, 64, 1);
      f(g, '#5a1e14', lx - 40, fy - 66, 80, 14); f(g, '#7a2a1a', lx - 38, fy - 64, 76, 4); f(g, '#1a0e08', lx - 8, fy - 30, 16, 30); f(g, '#e0b040', lx - 2, fy - 40, 4, 4);
      for (const ax of [-24, 18]) { f(g, '#c9b27c', lx + ax, fy - 46, 8, 2); f(g, '#c9b27c', lx + ax + 1, fy - 50, 1, 4); f(g, '#c9b27c', lx + ax + 6, fy - 50, 1, 4); } } }
    { const sx = R(gd.stumpX - cx); f(g, '#2a1410', sx - 16, fy - 14, 32, 14); f(g, '#5a3a24', sx - 15, fy - 14, 30, 3); f(g, '#7a5236', sx - 13, fy - 14, 26, 1); f(g, '#a83a2a', sx - 12, fy - 11, 24, 5); f(g, '#e0b040', sx - 12, fy - 11, 24, 1); }
  };
  H.drawWorld = (g, cx, cy, time) => {
    if (!S || !H.on()) return; const VW = ctx.VW(), VH = ctx.VH(), P = ctx.P(), lv = L(), gd = G();
    /* THE HALL: the ropes, the pegs (locked: a lashing and a padlock; free: the gold glint), the heaps, the told arrows, the rocks */
    const fight = hallOn();
    for (const r of S.ropes) for (const pgx of r.pegs) { const px = R(r.x - cx), py = R(r.deck[2] + 16 - cy), gx = R(pgx - cx), gy = R(r.pegY - cy); if (Math.max(px, gx) < -60 || Math.min(px, gx) > VW + 60) continue;
      const c = r.cage, up = !c.dropped && !c.spent, locked = ropeLocked(r);
      const first = pgx === r.pegs[0]; if (first) KP.drawPulley(g, px, py - 4, time);
      KP.drawPeg(g, gx, gy, up, up && fight && !locked, time);
      if (up) { KP.ropeLine(g, px, py + 5, gx, gy - 13, 3);
        if (locked) { f(g, '#4a4a54', gx - 4, gy - 30, 8, 6); f(g, '#9a9aa6', gx - 4, gy - 30, 8, 1); f(g, '#1e1e26', gx - 1, gy - 28, 2, 3); f(g, '#9a9aa6', gx - 3, gy - 34, 1, 4); f(g, '#9a9aa6', gx + 2, gy - 34, 1, 4); f(g, '#9a9aa6', gx - 3, gy - 34, 6, 1);
          if (fight && first && S.act === r.i) { g.save(); g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 6); g.strokeStyle = '#ff9a5c'; g.lineWidth = 1; g.strokeRect(R(r.deck[0] - cx) - 2, R(r.deck[2] - cy) - 22, R(r.deck[1] - r.deck[0]) + 4, 24); g.restore(); } }
        else if (fight && first) { g.fillStyle = 'rgba(255,233,160,0.5)'; for (let y = R(c.y0 - cy) + 2; y < gy; y += 5) g.fillRect(R(c.x - cx), y, 1, 2); } } }
    for (const hx of gd.hall.heaps) { const x = R(hx - cx), y = R(gd.hall.floor - cy); if (x < -30 || x > VW + 30) continue;
      for (const [dx, dy, w] of [[-9, -4, 7], [-2, -5, 8], [5, -4, 6], [-5, -9, 6], [1, -10, 6], [-1, -13, 5]]) { f(g, '#2a2430', x + dx, y + dy, w, 5); f(g, '#7a6a50', x + dx + 1, y + dy + 1, w - 2, 3); f(g, '#b09a5a', x + dx + 1, y + dy + 1, w - 2, 1); }
      if (fight && S.near === hx && !heldRock(P) && ctx.text) ctx.text('E: A ROCK', x, y - 26, '#ffd36b', 'center');
      else if (fight && !heldRock(P)) { const k = 0.5 + 0.5 * Math.sin(time * 5 + hx); g.save(); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#ffd36b'; g.beginPath(); g.ellipse(x + 0.5, y - 6, 13 + k * 2, 6, 0, 0, 6.283); g.stroke(); g.restore(); } }
    /* THE BURNING WOOD: the burning ground, the branches (marked), the lit patches, and the wall of fire behind you */
    for (const z of zones()) { const x0 = R(z.x0 - cx), x1 = R(z.x1 - cx), y = R(z.y - cy); if (x1 < -20 || x0 > VW + 20) continue;
      if (z.tell) { g.save(); g.globalAlpha = 0.35 + 0.35 * Math.sin(time * 18); f(g, '#ff9a5c', x0, y - 2, x1 - x0, 2); g.restore(); continue; }
      f(g, '#5a1a0e', x0, y - 1, x1 - x0, 1); for (let x = x0 + 3; x < x1 - 2; x += 6) flame(g, x, y, 7 + ((x * 7) % 5), time, x); }
    for (const b of S.branches) { if (b.state === 'gone') continue; const x = R(b.x - cx), y = R(b.y - cy); if (x < -40 || x > VW + 40) continue;
      if (b.state === 'hang' || b.state === 'tell') { const k = b.state === 'tell' ? 0.5 + 0.5 * Math.sin(time * 24) : 0.5 + 0.5 * Math.sin(time * 4);
        g.save(); g.globalAlpha = (b.state === 'tell' ? 0.6 : 0.3) + 0.3 * k; g.strokeStyle = b.state === 'tell' ? '#ff4a3c' : '#ff9a5c'; g.beginPath(); g.ellipse(x + 0.5, y - 1.5, 13, 4, 0, 0, 6.283); g.stroke(); g.restore();
        const by = y - 74 + (b.state === 'tell' ? R(Math.sin(time * 40)) : 0); f(g, '#2a1410', x - 14, by, 28, 5); f(g, '#5a3a24', x - 13, by + 1, 26, 2); flame(g, x - 8, by, 8, time, b.x); flame(g, x + 6, by, 6, time, b.x + 3);
        if (b.state === 'tell') { if (ctx.text) ctx.text('!', x, by - 16, '#ff6b5c', 'center'); } }
      else if (b.state === 'fall') { const by = y - 74 * (b.t / 0.22) - 5; f(g, '#2a1410', x - 14, by, 28, 5); flame(g, x, by, 10, time, b.x); }
      else if (b.state === 'down') { f(g, '#2a1410', x - 14, y - 5, 28, 5); f(g, '#5a3a24', x - 13, y - 4, 26, 2); flame(g, x - 6, y - 4, 8 * Math.min(1, b.t), time, b.x); flame(g, x + 7, y - 4, 6 * Math.min(1, b.t), time, b.x + 1); } }
    /* THE GLADE: what hangs in the oak (ropes from the boughs, the pegs), the cones' marks, the logs, the quake, the swarm */
    const gl = lv.glade; if (gl) { const gOn = gladeOn();
      for (const h of S.hangs) for (const [pk, pgx] of h.d.pegs.entries()) { const d = h.d, px = R(d.x - cx), py = R(d.top - cy), gx = R(pgx - cx), gy = R(d.pegY - cy), lx = R(h.lx - cx), ly = R(h.y - cy); if (Math.max(px, gx, lx) < -60 || Math.min(px, gx, lx) > VW + 60) continue;
        const up = h.state === 'hang'; if (pk === 0) KP.drawPulley(g, px, py, time); KP.drawPeg(g, gx, gy, up, up && gOn, time);
        if (up) KP.ropeLine(g, px, py + 3, gx, gy - 13, 4);
        if (pk !== 0) continue;
        if (up) { KP.ropeLine(g, px, py + 11, lx, ly - (d.kind === 'cage' ? 36 : d.kind === 'hive' ? 22 : 16), 1);
          g.fillStyle = 'rgba(255,233,160,0.45)'; for (let y = ly + 2; y < R(gl.floor - cy); y += 5) g.fillRect(lx, y, 1, 2);
          if (d.kind === 'log') { g.fillStyle = 'rgba(255,154,92,0.5)'; const to = d.roll > 0 ? gl.x1 : gl.x0; for (let x = Math.min(lx, R(to - cx)); x < Math.max(lx, R(to - cx)); x += 6) g.fillRect(x, R(gl.floor - cy) - 3, 3, 1); } }
        if (d.kind === 'cage') KP.drawCage(g, lx, ly, h.state === 'down', time, up ? 1.2 : 0);
        else if (d.kind === 'log') { if (h.state !== 'down') KP.drawLog(g, lx, ly, 46, time, h.state === 'roll', h.turn); else if (h.resetT > GORM.hangReset.log - 1.2) KP.drawSplitLog(g, lx, ly, 46, GORM.hangReset.log - h.resetT); }
        else if (d.kind === 'hive') { if (h.state === 'down') { f(g, '#5a3a1a', lx - 9, ly - 6, 18, 6); f(g, '#c9a040', lx - 7, ly - 6, 6, 3); }
          else { f(g, '#5a3a1a', lx - 9, ly - 22, 18, 22); f(g, '#c9a040', lx - 8, ly - 21, 16, 20); for (let k = 0; k < 5; k++) f(g, '#8a6a20', lx - 8, ly - 19 + k * 4, 16, 1); f(g, '#1a0e08', lx - 2, ly - 8, 4, 4);
            for (let k = 0; k < 4; k++) { const a = time * 6 + k * 1.6; f(g, '#e0b040', lx + R(Math.cos(a) * 14), ly - 12 + R(Math.sin(a * 1.3) * 8), 2, 1); } } } }
    }
  };
  /* THE TOLD LAYER (after the foes, over the dark pass: main.js calls it where the winch rocks draw): the rafter archers' drawn arcs and their arrows, the rock in the air and its
     told arc, the wall of fire, the cones' marks, the rolling logs, the quake's crest, the swarm */
  H.drawFront = (g, cx, cy, time) => {
    if (!S || !H.on()) return; const VW = ctx.VW(), VH = ctx.VH(), P = ctx.P();
    for (const q of bows()) if (q.aim) { g.save(); g.fillStyle = '#ff4a3c'; const pts = q.aim.pts, n = pts.length, k = 1 - q.aim.t / GORM.archers.tell;
      for (let i = 1; i < n; i++) { if (i / n > 0.25 + k) break; g.globalAlpha = 0.6 + 0.4 * (i / n); g.fillRect(R(pts[i][0] - cx) - 1, R(pts[i][1] - cy) - 1, 3, 3); }
      g.globalAlpha = 0.6; g.strokeStyle = '#ff6b5c'; g.beginPath(); g.ellipse(R(q.aim.tx - cx) + 0.5, R(q.aim.ty + 6 - cy), 8, 3, 0, 0, 6.283); g.stroke(); g.restore(); }
    for (const a of S.arrows) { const x = R(a.x - cx), y = R(a.y - cy), an = Math.atan2(a.vy, a.vx); g.save(); g.translate(x, y); g.rotate(an); f(g, '#5a3a24', -6, 0, 10, 1); f(g, '#c9d1dc', 4, -1, 2, 3); f(g, '#e0e0e0', -7, -1, 2, 3); g.restore(); }
    for (const q of S.rocks) { const x = R(q.x - cx), y = R(q.y - cy); f(g, '#2a2430', x - 4, y - 4, 8, 7); f(g, '#7a6a50', x - 3, y - 3, 6, 5); f(g, '#b09a5a', x - 3, y - 3, 6, 1); }
    if (S.arc) CT.drawArc(g, S.arc, cx, cy, time, S.arc.land && S.arc.land.hit ? '#ffd36b' : '#eef2fa');
    if (persist && (S.run.on || S.run.armed) && !S.run.done) { const fx = R(S.run.fireX - cx); if (fx > -40) {
      g.save(); const gr = g.createLinearGradient(fx - 120, 0, fx + 30, 0); gr.addColorStop(0, 'rgba(160,30,10,0.85)'); gr.addColorStop(0.8, 'rgba(230,90,30,0.6)'); gr.addColorStop(1, 'rgba(255,160,60,0)'); g.fillStyle = gr; g.fillRect(Math.max(0, fx - 600), 0, Math.min(VW, fx + 30) - Math.max(0, fx - 600), VH); g.restore();
      for (let y = 0; y < VH; y += 12) flame(g, fx + R(Math.sin(time * 3 + y) * 4), y + 12, 18 + (y % 3) * 4, time, y);
      if (S.run.on && S.run.t < 4 && ctx.text) ctx.text('THE WOOD BURNS: RUN EAST', VW / 2, 34, Math.floor(time * 4) % 2 ? '#ff9a5c' : '#fff6e0', 'center'); } }
    if (L().glade) {
      for (const c of S.cones) { const x = R(c.x - cx), y = R(c.y - cy); if (c.state === 'tell') { const k = 0.5 + 0.5 * Math.sin(time * 20); g.save(); g.globalAlpha = 0.5 + 0.4 * k; g.strokeStyle = '#ff4a3c'; g.beginPath(); g.ellipse(x + 0.5, y - 1.5, 11, 4, 0, 0, 6.283); g.stroke(); g.restore();
          if (c.t < 0.5) { const yy = y - 20 - 160 * (c.t / 0.5); f(g, '#5a3a1a', x - 3, yy - 6, 6, 7); flame(g, x, yy - 5, 6, time, c.x); } }
        else { const yy = y - 20 * (c.t / 0.25); f(g, '#5a3a1a', x - 3, yy - 6, 6, 7); flame(g, x, yy - 5, 7, time, c.x); } }
      for (const l of S.logs) { const x = R(l.x - cx), y = R(l.y - cy); KP.drawLog(g, x, y, 28, time, true, l.turn); for (let k = 0; k < 4; k++) flame(g, x - 12 + k * 8, y - 12, 7, time, k + l.x); }
      for (const w of S.waves) { const x = R(w.x - cx), y = R(w.y - cy); f(g, '#5a3a24', x - 5, y - 8, 10, 8); f(g, '#c9b27c', x - 4, y - 10, 8, 3); flame(g, x - w.dir * 3, y - 6, 6, time, w.x); }
      for (const s of S.swarms) { const x = R(s.x - cx), y = R(s.y - cy); g.save(); g.globalAlpha = Math.min(0.25, s.t * 0.1); g.fillStyle = '#e0b040'; g.beginPath(); g.ellipse(x, y - 24, GORM.hiveR, 26, 0, 0, 6.283); g.fill(); g.restore();
        for (let k = 0; k < 18; k++) { const a = time * (3 + k % 4) + k * 0.9; f(g, k % 3 ? '#e0b040' : '#1a0e08', x + R(Math.cos(a) * (GORM.hiveR - 6) * ((k % 5) / 5 + 0.3)), y - 24 + R(Math.sin(a * 1.4) * 20), 2, 1); } }
    }
  };
  /* a torch goblin's torch, a rafter archer's deck mark (main.js calls it per foe after its sprite) */
  H.drawFoe = (g, e, cx, cy, time) => {
    if (e.torch && e.alive) { const x = R(e.x - cx) + (e.face || 1) * 5, y = R(e.y - cy) - 12 + (e.lightT > 0 ? 6 : 0); f(g, '#5a3a24', x - 1, y, 2, 7); flame(g, x, y + 1, e.lightT > 0 ? 10 : 7, time, e.x); }
  };
  return H;
}
