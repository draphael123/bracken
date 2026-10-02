// src/jenny-greenteeth-hands.js - JENNY GREENTEETH'S HANDS (claude/lockkeeper). src/jenny-greenteeth.js is the fight, pure and proved in
// tools/greenteeth.mjs; this binds it to the world: the chamber's water (the pool's level), the bright weed (movers you stand on, that sag and give),
// her arms on the heroes (a grab is the game's own P.snare - mash out of it, or strike the arm), a swing on her arms, the paddles and the lamp hooks,
// and the drawing: the lock's back wall (behind the tiles), its gear, its culverts, its lamps (before the bodies), and over everything the weed on the
// water, her arms, the fog, her eyes and her tells (the rings, the bands, the surge's crest, the hand on the paddle, OPEN and its clock).
// main.js calls: spawnBoss, update, strike, weedMover, drawWall, drawBack, drawOver, camY, take, warded, barName, alpha, end, read.
// Every teaching line goes through ctx.number with a line listed in src/hint-lines.js (the hint box).
import * as GM from './jenny-greenteeth.js';
import { bakeLockSkins } from './redraw/greenteeth_art.js';
const { GT } = GM;

export function makeGreenteethHands(ctx) {
  let show = null, SK = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'greenteeth' ? ctx.L.arena : null);
  const pool = () => (ctx.L && ctx.L.pools || []).find(p => p.lock) || null;
  const skins = () => SK || (SK = bakeLockSkins());
  const R = Math.round;
  /* WHAT HURT: the health each of her blows took, by name (the pilots print it) */
  const hurt = (name, fn) => { const P = ctx.P, h0 = P.hp; fn(); if (show) { const k = String(name), lost = Math.max(0, h0 - Math.max(0, P.hp)); show.hurt = show.hurt || {}; show.hurt[k] = (show.hurt[k] || 0) + lost;
    if (lost > 0 && show.working) { const was = show.pad[show.working].work; GM.crankShaken(show); if (was > 0) ctx.number(P.x, P.y - 40, 'SHAKEN OFF THE PADDLE', '#ff6b6b'); } } };   /* (claude/canalfix3) her blow shakes you off the paddle you work */
  H.show = () => show;
  H.on = () => !!(show && A());
  H.clear = () => { show = null; };
  const cellI = (x, y) => y * ctx.LW() + x;
  /* THE LOCK WEARS ITS OWN SKINS: the gates' oak, the walers, the walkways, the bed's setts and silt, the narrowboat */
  function skinChamber(S) { const lk = S.lock, sx = lk.sx, Rw = lk.R, ex = sx + GM.STAGE.W - 1, T = ctx.T, K = skins();
    const put = (x, y, spr, t) => { const i = cellI(x, y), c = ctx.cellGet(i); if (t === undefined || c[0] === t) ctx.cellSet(i, c[0], spr); };
    for (let y = Rw - 16; y < Rw; y++) for (const x of [sx, ex]) put(x, y, K.gate[(y + (x === sx ? 0 : 1)) % 3 === 0 ? 1 : (y > Rw - 4 ? 2 : 0)], T.SOLID);
    for (const r of GM.STAGE.walers) for (let i = 0; i < 3; i++) { put(sx + 1 + i, Rw - r, K.waler, T.ONEWAY); put(ex - 3 + i, Rw - r, K.waler, T.ONEWAY); }
    for (let i = 0; i < 4; i++) { put(sx + 1 + i, Rw - GM.STAGE.walk, K.walk, T.ONEWAY); put(ex - 4 + i, Rw - GM.STAGE.walk, K.walk, T.ONEWAY); }
    for (let x = sx + 1; x < ex; x++) { put(x, Rw, K.bed[x % 3], T.SOLID); put(x, Rw + 1, K.bed2, T.SOLID); }
    for (let x = sx + GM.STAGE.wreck[0]; x <= sx + GM.STAGE.wreck[1]; x++) { put(x, Rw - 2, K.deck, T.SOLID); put(x, Rw - 1, K.hull, T.SOLID); }
    if (lk.quoins) for (const x of [sx - 1, sx + GM.STAGE.W]) for (let y = 0; y < Rw - 6; y++) put(x, y, K.quoin[y % 2], T.SOLID); }   /* (the standalone lock's own banks; THE FOG CANAL dresses its own) */
  /* THE ARENA WALLS the game closes when she wakes (setWall) wear the gate too */
  function skinDoors(S) { const lk = S.lock, K = skins(); for (const x of [S.wallL, S.wallR]) for (let y = lk.R - GM.STAGE.door; y < lk.R; y++) { const i = cellI(x, y), c = ctx.cellGet(i); if (c[0] === ctx.T.SOLID && c[1] !== K.gate[0] && c[1] !== K.gate[2]) ctx.cellSet(i, c[0], K.gate[y > lk.R - 4 ? 2 : 0]); } }
  /* SPAWNING: a fresh attempt is a fresh show, an empty lock, the weed lying on its bed */
  H.spawnBoss = base => { const S = A(); if (!S) return null;
    show = GM.newShow(GM.geom(S.lock.sx, S.lock.R, ctx.TS)); GM.startFight(show);
    const p = pool(); if (p) ctx.poolLevel(p, show.A.bed);
    skinChamber(S);
    for (const pp of ctx.players) { pp.gtKeys = null; }
    const e = GM.newGreenteeth({ ...base, t: 'greenteeth', w: GT.w, h: GT.h, hp: ctx.EHP.greenteeth, maxHp: ctx.EHP.greenteeth, noGrav: true, markH: GT.markH, face: -1 });
    e.x = show.A.mid; e.y = show.A.bed; return e; };
  H.owns = e => e.t === 'greenteeth';
  H.frame = e => GM.gtFrame(e);
  /* her body's alpha: a dark shape in the culvert's grate; in the fog the fog itself hides her (drawOver) */
  H.alpha = e => (e.mode === 'culvert' || (e.base === 'culvert' && !GM.special(e)) ? 0.3 : e.hidden ? 0.05 : 1);

  /* ---------- THE HEROES as the fight sees them ---------- */
  const weedOf = pp => { const m = pp.onMover; if (!m || !m.weed || !show) return -1; return show.weed.findIndex(q => q.m === m.wi && q.firm && !(q.broken > 0)); };
  function heroes() { return ctx.players.map(pp => ({ x: pp.x, y: pp.y, face: pp.face || 1, alive: ctx.upright(pp) && !pp.dead, ground: !!pp.ground, swim: !!pp.swim,
    onWeed: pp.ground ? weedOf(pp) : -1, onTile: !!pp.ground && !pp.onMover, pp })); }
  const keyed = (pp, key) => { pp.gtKeys = pp.gtKeys || new Map(); if (pp.gtKeys.size > 60) pp.gtKeys.clear(); if (pp.gtKeys.has(key)) return true; pp.gtKeys.set(key, 1); return false; };

  /* ---------- ONE FRAME OF HER ---------- */
  H.update = (e, dt) => {
    if (!show) return; const S = A(); if (!S) return;
    if (!show.skinnedDoors) { show.skinnedDoors = true; skinDoors(S); }
    const hs = heroes();
    const evs = GM.stepShow(e, show, dt, {
      heroes: hs,
      say: m => { if (m === '!' || m === '!!') ctx.number(e.x, e.y - 50, m, m === '!' ? '#ffd36b' : '#ff6b6b'); },
      number: (x, y, line, col) => ctx.number(x, y, line, col),
      sound: k => { const fn = SOUND[k]; if (fn) fn(); },
      water: d => { const p = pool(); if (p) ctx.poolLevel(p, show.A.bed - d); },
      /* a band along a height: LOW is judged against the body (a jump clears it), HIGH against the duck box (a duck goes under it) */
      band: (kind, [t, b], x0, x1, d, name, key, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead) return;
        if (P.x < x0 || P.x > x1) return; const hb = kind === 'high' ? ctx.duckBox(P) : ctx.box(P); if (!(hb.b > t && hb.t < b) || keyed(pp, key)) return;
        hurt(name, () => ctx.damagePlayer(o.from ?? e.x, d, { who: e, name, unblockable: true })); if (o.push && !P.dead) { P.vx = o.push; } }); },
      hit: (bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead) return;
        if (ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, o.duck ? ctx.duckBox(P) : ctx.box(P))) hurt(name, () => ctx.damagePlayer(o.from ?? e.x, d, { who: e, name, unblockable: !!o.unblockable })); }); },
      /* THE GRAB: the first hero in the arm's column who is in the water (or on the weed, or in the air over it) is held - the game's own snare */
      grab: (bx, d, arm) => { for (const h of hs) { const pp = h.pp; if (!h.alive || (pp.ground && !pp.onMover) || pp.snare > 0) continue; let got = null;
          ctx.asPlayer(pp, () => { const P = ctx.P; if (ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) { P.snare = GT.grabHold + 0.3; P.vx = 0;
            hurt('HER ARM', () => ctx.damagePlayer(arm.x, d, { who: e, name: 'HER ARM', unblockable: true, noKnock: true })); got = h; } });
          if (got) { if (pp.onMover && pp.onMover.weed) { pp.onMover = null; pp.ground = false; } return got; } } return null; },
      hold: (arm, dt2) => { const h = arm.held, pp = h && h.pp; if (!pp || pp.dead || !(pp.snare > 0)) return false;
        ctx.asPlayer(pp, () => { const P = ctx.P; P.vx = Math.max(-60, Math.min(60, (arm.x - P.x) * 4)); P.vy = 30; if (P.onMover && P.onMover.weed) { P.onMover = null; P.ground = false; } h.x = P.x; h.y = P.y; }); return true; },
      drag: (arm, d) => { const pp = arm.held && arm.held.pp; if (!pp) return; ctx.asPlayer(pp, () => { const P = ctx.P; P.inv = 0; hurt('DRAGGED UNDER', () => ctx.damagePlayer(P.x, d, { who: e, name: 'DRAGGED UNDER', unblockable: true, noKnock: true })); }); ctx.burst(arm.x, show.A.bed - show.water.depth, 4, ['#e8f4f0', '#7cc8c8'], 40, 0.4); },
      release: arm => { const pp = arm.held && arm.held.pp; if (pp && pp.snare > 0) pp.snare = 0; },
      cycle: C => { if (C.flood) ctx.number(show.A.W.paddle.x, show.A.walk - 40, 'THE UPPER PADDLE IS RUNNING: SHUT IT FIRST', '#ffd36b'); else if (C.knot) ctx.number(show.A.E.paddle.x, show.A.walk - 40, 'THE WEED CHOKES THE PADDLE: CUT IT', '#ffd36b'); },
    });
    for (const v of evs) {
      if (v.t === 'phase') ctx.enrage(e);
      if (v.t === 'stranded') { ctx.shakeCam(v.big ? 8 : 5); ctx.dust(e.x, show.A.bed, 10); ctx.burst(e.x, show.A.bed - 6, 14, ['#4a3a26', '#6a5a3a', '#3e6030'], 70, 0.6); }
      if (v.t === 'surge') ctx.shakeCam(3);
      if (v.t === 'held') ctx.shakeCam(2);
      if (v.t === 'grab' || v.t === 'bite') ctx.burst(v.t === 'grab' ? e.x : e.x + (e.face || 1) * 20, show.A.bed - show.water.depth, 8, ['#e8f4f0', '#7cc8c8', '#5e8a4a'], 70, 0.4);
      if (v.t === 'lampIn') ctx.burst(show.lamps[v.side].x, show.A.bed - show.water.depth, 10, ['#e8f4f0', '#ffd36b'], 60, 0.5);
      if (v.t === 'weedGive' || v.t === 'torn') SOUND.weed();
    }
    if (show.surgeFx) { show.surgeFx.t -= dt; if (show.surgeFx.t <= 0) show.surgeFx = null; }
    H.lastEvents = evs;
  };

  /* ---------- THE BRIGHT WEED: a mover you stand on, laid from the show's patches ---------- */
  H.weedMover = (m, dt) => {
    if (m.weedTeach) {   /* THE TEACHING DITCH's one bright mat: the same rule, in water that cannot hurt you */
      const on = ctx.players.some(pp => pp.onMover === m); if (m.regrow > 0) { m.regrow -= dt; if (m.regrow <= 0) { m.broken = false; m.sink = 0; } }
      else { m.sink = Math.max(0, Math.min(1, (m.sink || 0) + (on ? dt / GT.weedHold : -0.6 * dt))); if (m.sink >= 1) { m.broken = true; m.regrow = GT.weedRegrow; SOUND.weed(); for (const pp of ctx.players) if (pp.onMover === m) { pp.onMover = null; pp.ground = false; } } }
      m.y = m.y0 + Math.round((m.sink || 0) * 3); return; }
    if (!show) { m.broken = true; return; }
    const p = show.weed.find(q => q.m === m.wi);
    const live = p && p.firm && !(p.broken > 0);
    if (!live) { if (!m.broken) for (const pp of ctx.players) if (pp.onMover === m) { pp.onMover = null; pp.ground = false; } m.broken = true; if (p) { m.x = p.x0; m.w = p.x1 - p.x0; } return; }
    m.broken = false; m.x = p.x0; m.w = p.x1 - p.x0; m.y = p.y;
  };

  /* ---------- A HERO'S SWING: the arm that holds, her hand on the paddle, the paddles, the lamp hooks ---------- */
  H.strike = hb => {
    if (!show || !hb) return; const e = ctx.boss; if (!e || e.t !== 'greenteeth' || !e.alive || !ctx.bossActive) return;
    const P = ctx.P, res = GM.strikeAt(e, show, hb, P.hitSet), G = show.A;
    for (const r of res) {
      if (r.what === 'arm') { const pp = r.a.held && r.a.held.pp; if (pp) pp.snare = 0; r.a.st = 'back'; r.a.t = 0.3; show.n.freed++; SOUND.hiss(); ctx.hitstop && ctx.hitstop(0.05);
        ctx.burst(r.a.held ? r.a.held.x : r.a.x, (r.a.held ? r.a.held.y : G.bed) - 8, 8, ['#5e8a4a', '#86b060', '#e8f4f0'], 70, 0.4); }
      if (r.what === 'hand' && GM.handCut(e, show)) { SOUND.hiss(); ctx.hitstop && ctx.hitstop(0.05); ctx.number(G.E.paddle.x, G.walk - 40, 'SHE LETS GO', '#8fd160'); ctx.burst(G.E.paddle.x, G.E.paddle.y - 14, 8, ['#5e8a4a', '#86b060'], 60, 0.4); }
      if (r.what === 'paddle') { const pd = G[r.side].paddle;
        if (r.res === 'crank') { SOUND.paddle(); const p0 = show.pad[r.side]; ctx.burst(pd.x, pd.y - 18, 3, ['#9aa3b0', '#e8f4f0'], 30, 0.25); if (!show.told.crank) { show.told.crank = true; ctx.number(pd.x, pd.y - 40, 'WORK THE PADDLE: SHE COMES FOR YOU', '#ffd36b'); } void p0; }   /* (claude/canalfix3) */
        else if (r.res === 'knot') { SOUND.weed(); ctx.burst(pd.x, pd.y - 18, 6, ['#3e6030', '#9ac850'], 50, 0.4); ctx.number(pd.x, pd.y - 40, 'THE WEED CHOKES THE PADDLE: CUT IT', '#ffd36b'); }
        else if (r.res === 'knotCut') { SOUND.weed(); SOUND.paddle(); ctx.number(pd.x, pd.y - 40, 'THE PADDLE IS FREE', '#8fd160'); }
        else if (r.res === 'unjam') { SOUND.weed(); SOUND.paddle(); ctx.number(pd.x, pd.y - 40, 'THE UPPER PADDLE DROPS', '#8fd160'); }
        else if (r.res === 'drain' || r.res === 'drainBig') { SOUND.paddle(); SOUND.drain(); ctx.shakeCam(2); }
        else if (r.res === 'running') { SOUND.paddle(); }
        else if (r.res === 'flush' || r.res === 'flushBig') { SOUND.paddle(); SOUND.surge(); ctx.shakeCam(r.res === 'flushBig' ? 8 : 5); if (r.res === 'flushBig') ctx.number(e.x, G.walk - 40, 'SHE WILL NOT LEAVE THE LIGHT: CUT HER', '#ffd36b'); else ctx.number(e.x, G.walk - 40, 'THE CULVERT SPITS HER OUT: CUT HER', '#ffd36b');
          ctx.burst(G[r.side].face + G[r.side].dir * 20, G.bed - show.water.depth, 20, ['#e8f4f0', '#bfe6f5', '#7cc8c8'], 120, 0.7); }
        else if (r.res === 'notHere') { SOUND.paddle(); ctx.number(pd.x, pd.y - 40, 'SHE IS NOT IN THAT CULVERT', '#9aa39a'); }
        else if (r.res === 'flood') { SOUND.paddle(); SOUND.surge(); }
        else ctx.SFX.clank(); }
      if (r.what === 'hook') { if (r.res === 'hookKnot') { SOUND.weed(); ctx.burst(G[r.side].hook.x, G[r.side].hook.y, 6, ['#3e6030', '#9ac850'], 50, 0.4); if (!show.told.hookKnot) { show.told.hookKnot = true; ctx.number(G[r.side].hook.x, G.walk - 40, 'THE WEED BINDS THE LAMP: CUT IT', '#ffd36b'); } }
        else if (r.res === 'hookFree') { SOUND.weed(); SOUND.lampDrop(); ctx.number(G[r.side].hook.x, G.walk - 40, 'THE LAMP IS FREE', '#8fd160'); }
        else if (r.res === 'fast') { ctx.SFX.clank(); if (!show.told.fast) { show.told.fast = true; ctx.number(G[r.side].hook.x, G.walk - 40, 'THE LAMP IS HOOKED FAST', '#9aa39a'); } } else if (r.res === 'drop') { SOUND.lampDrop(); } }
    }
  };
  H.warded = e => { if (!(e.wardSaid > ctx.time)) { e.wardSaid = ctx.time + 5; ctx.number(e.x, e.y - 50, 'THE WATER TAKES IT: STRAND HER FIRST', '#9aa39a'); } };
  H.take = e => GM.gtTake(e);
  H.barName = b => (GM.gtOpen(b) ? (b.mode === 'flushed' ? 'JENNY GREENTEETH  OPEN' : 'JENNY GREENTEETH  STRANDED') : b.phase >= 3 ? 'JENNY GREENTEETH  THE FOG' : b.phase === 2 ? 'JENNY GREENTEETH  THE FLOOD' : 'JENNY GREENTEETH');
  H.camY = ty => { const S = A(); if (!S) return ty; const VH = ctx.VH(), top = S.y0 - 8, bot = S.floor + 2 * ctx.TS;
    if (bot - top <= VH) return (top + bot) / 2 - VH / 2;
    const P = ctx.P; return Math.max(P.y - VH + 50, Math.min(ty, P.y - 70)); };
  H.end = e => { if (!show) return; for (const a of show.arms) if (a.st === 'hold' && a.held && a.held.pp) a.held.pp.snare = 0; show.arms = []; show.surge = null; show.pad.E.open = false; show.pad.W.open = false;
    show.water.target = show.water.depth; show.fogTo = 0; show.dead = 0.001; e.y = show.A.bed - show.water.depth + 6; SOUND.die(); };
  H.read = () => show && { mode: ctx.boss && ctx.boss.mode, base: ctx.boss && ctx.boss.base, phase: ctx.boss && ctx.boss.phase, n: { ...show.n }, cycle: show.cycle, cyc: { ...show.cyc }, C: show.C && show.C.name,
    depth: Math.round(show.water.depth), pad: JSON.parse(JSON.stringify(show.pad)), hide: show.hide, fog: +show.fog.toFixed(2), lamps: JSON.parse(JSON.stringify(show.lamps)),
    weed: show.weed.map(p => ({ x0: p.x0, x1: p.x1, firm: p.firm, broken: +(p.broken || 0).toFixed(2), sink: +(p.sink || 0).toFixed(2), y: p.y })),
    arms: show.arms.map(a => ({ k: a.k, st: a.st, t: +a.t.toFixed(2), x: Math.round(a.x) })), surge: show.surge && { x: Math.round(show.surge.x), dir: show.surge.dir }, hurt: { ...(show.hurt || {}) } };

  /* ================= DRAWING ================= */
  const surfNow = () => show.A.bed - show.water.depth;
  /* THE LOCK'S BACK WALL (behind the tiles): coursed stone from the bed to the coping, darker and slimed below the high-water line, a green
     tide-mark where the water stands now, iron ladder rungs let into it, and over the coping the night */
  H.drawWall = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), G = show.A, TS = ctx.TS, x0 = R(G.x0 - cx), w = R(G.x1 - G.x0), top = R(G.walk - 2 * TS - cy), bed = R(G.bed - cy), hi = R(G.bed - GT.lv.high - cy);
    if (x0 > ctx.VW() || x0 + w < 0) return;
    g.fillStyle = '#34352f'; g.fillRect(x0, top, w, bed - top);
    for (let y = 0; y < bed - top; y += 8) { const row = (y / 8) | 0; g.fillStyle = '#26271f'; g.fillRect(x0, top + y, w, 1);
      for (let x = (row % 2) * 12; x < w; x += 24) g.fillRect(x0 + x, top + y, 1, 8); }
    g.fillStyle = 'rgba(20,34,22,0.45)'; g.fillRect(x0, hi, w, bed - hi);   /* below the high-water line: wet, dark */
    g.fillStyle = '#4e5a3a'; g.fillRect(x0, hi, w, 1);
    const s = R(surfNow() - cy); if (show.water.depth > 2) { g.fillStyle = 'rgba(90,130,60,0.55)'; g.fillRect(x0, s - 2, w, 2); }   /* the tide-mark where it stands */
    g.fillStyle = '#5a5850'; g.fillRect(x0, top - 3, w, 3); g.fillStyle = '#76746a'; g.fillRect(x0, top - 3, w, 1);   /* the coping */
    for (const col of [11, 28]) { const lx = R(GM.colX(G, col) - cx); for (let y = top + 6; y < bed - 4; y += 7) { g.fillStyle = '#1e1f1a'; g.fillRect(lx, y, 8, 2); g.fillStyle = '#6a6e70'; g.fillRect(lx, y, 8, 1); } }   /* recessed rungs */
    for (let i = 0; i < 14; i++) { const x = x0 + ((i * 97) % w), y = hi + 6 + ((i * 53) % Math.max(8, bed - hi - 10)); g.fillStyle = i % 2 ? '#3e6030' : '#2a4a22'; g.fillRect(x, y, 2 + (i % 3), 1); }   /* weed on the stones */
  };
  /* THE GEAR, THE CULVERTS, THE LAMPS (before the bodies) */
  H.drawBack = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), G = show.A, e = ctx.boss && ctx.boss.t === 'greenteeth' ? ctx.boss : null;
    for (const side of ['W', 'E']) { const Q = G[side], pd = show.pad[side], fx = R(Q.face - cx), dir = Q.dir;
      /* the culvert mouth at the gate's foot: a dark arch with an iron grate, foaming when its paddle runs */
      const mx = dir > 0 ? fx : fx - 26, my = R(G.bed - cy);
      g.fillStyle = '#0c0f0c'; g.fillRect(mx, my - 18, 26, 18); g.beginPath(); g.ellipse(mx + 13, my - 18, 13, 6, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#4a4e52'; for (let x = 3; x < 26; x += 5) g.fillRect(mx + x, my - 20, 1, 20); g.fillRect(mx, my - 12, 26, 1);
      if (pd.open || (show.surgeFx && show.surgeFx.side === side)) for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#e8f4f0' : '#bfe6f5'; g.fillRect(mx + ((i * 7 + time * 60) % 26), my - 6 - ((i * 5 + time * 40) % 14), 2, 1); }
      /* the paddle gear on the walkway: a cast-iron rack post, its pinion, the rack raised while the paddle is up; the weed knot on it */
      const px = R(pd === show.pad.W ? Q.paddle.x - cx : Q.paddle.x - cx), py = R(Q.paddle.y - cy), up = pd.open ? 8 : 0;
      g.fillStyle = '#2a2c30'; g.fillRect(px - 2, py - 22, 5, 22); g.fillStyle = '#5a6068'; g.fillRect(px - 2, py - 22, 1, 22);
      g.fillStyle = '#3a3e44'; g.fillRect(px + 3, py - 26 - up, 2, 20); for (let y = py - 26 - up; y < py - 6 - up; y += 3) { g.fillStyle = '#8a929c'; g.fillRect(px + 5, y, 1, 1); }
      g.fillStyle = '#4a4e52'; g.beginPath(); g.arc(px, py - 16, 4, 0, 7); g.fill(); g.fillStyle = '#9aa3b0'; g.fillRect(px - 1, py - 17, 2, 2);
      if (pd.work > 0) { const need = GT.crank[Math.max(0, Math.min(2, ((e && e.phase) || 1) - 1))]; for (let i = 0; i < need; i++) { g.fillStyle = i < pd.work ? '#8fd160' : '#1e1624'; g.fillRect(px - need * 2 + i * 4, py - 34, 3, 2); } }   /* (claude/canalfix3) how far the paddle is worked */
      if (pd.knot > 0) { for (let i = 0; i < 9; i++) { g.fillStyle = i % 3 ? '#2a4a22' : '#9ac850'; g.fillRect(px - 5 + (i * 3) % 11, py - 20 + (i * 5) % 10, 3, 2); } }
      const hot = e && ((show.hide === side && e.base === 'culvert') || (e.lured && GM.special && show.lamps[side].st === 'lit')) || (e && e.mode === 'handTell' && side === 'E') || (pd.knot > 0) || (side === 'E' && !pd.open && e && e.phase === 1 && Math.abs(e.x - Q.face) < 110);
      if (hot && !pd.open) { const k = 0.5 + 0.5 * Math.sin(time * 6); g.globalAlpha = 0.35 + 0.4 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(px - 6.5, py - 29.5, 14, 30); g.globalAlpha = 1; }
      /* the walkway's handrail: two iron posts and a rail */
      const w0 = dir > 0 ? R(Q.face - cx) : R(Q.face - 4 * ctx.TS - cx), w1 = w0 + 4 * ctx.TS;
      g.fillStyle = '#3a3e44'; g.fillRect(w0 + 1, py - 14, 1, 14); g.fillRect(w1 - 2, py - 14, 1, 14); g.fillRect(w0 + 1, py - 14, w1 - w0 - 2, 1);
      /* the lamp's iron bracket out over the water, and the lamp on its hook */
      const hx = R(Q.hook.x - cx), hy = R(Q.hook.y - cy); g.fillStyle = '#2a2c30'; g.fillRect(Math.min(hx, dir > 0 ? w1 - 2 : w0 + 1), hy - 2, Math.abs(hx - (dir > 0 ? w1 - 2 : w0 + 1)) + 1, 2); g.fillRect(hx, hy - 2, 1, 5);
      const L = show.lamps[side]; if (L.st === 'hook' || (L.st === 'none' && show.lampsHung !== false)) lamp(g, hx, hy + 10, time, L.st === 'hook' ? 1 : 0.55);
      if (L.st === 'hook' && L.knot > 0) for (let i = 0; i < 7; i++) { g.fillStyle = i % 3 ? '#2a4a22' : '#9ac850'; g.fillRect(hx - 4 + (i * 3) % 9, hy - 4 + (i * 5) % 8, 3, 2); }   /* (claude/canalfix3) the weed she bound the hook with */
    }
    /* the narrowboat's broken cabin and tiller, over its deck */
    const wx = R(G.wreck.x0 - cx), wy = R(G.wreck.y - cy); g.fillStyle = '#1e1a16'; g.fillRect(wx + 30, wy - 10, 56, 10); g.fillStyle = '#7a2e1e'; g.fillRect(wx + 30, wy - 10, 56, 2);
    g.fillStyle = '#0c0a08'; g.fillRect(wx + 42, wy - 7, 6, 5); g.fillRect(wx + 60, wy - 7, 6, 5); g.fillStyle = '#2a241c'; g.fillRect(wx + 150, wy - 14, 2, 14); g.fillRect(wx + 144, wy - 14, 8, 2);
    /* drained: the silt shines, and the weed lies in heaps on it */
    if (show.water.depth < 3) { g.fillStyle = 'rgba(160,150,110,0.25)'; for (let x = G.x0; x < G.x1; x += 22) g.fillRect(R(x - cx + ((x * 7) % 9)), R(G.bed - 1 - cy), 10, 1); }
  };
  function lamp(g, x, y, time, lit) { g.fillStyle = '#1e1f1a'; g.fillRect(x - 3, y - 9, 7, 2); g.fillRect(x - 3, y - 1, 7, 2); g.fillStyle = '#2a2c30'; g.fillRect(x - 3, y - 7, 1, 6); g.fillRect(x + 3, y - 7, 1, 6);
    if (lit > 0) { g.fillStyle = '#ffd36b'; g.fillRect(x - 2, y - 7, 5, 6); g.fillStyle = '#fff6c8'; g.fillRect(x, y - 5, 1, 2); g.globalAlpha = 0.15 * lit + 0.04 * Math.sin(time * 7); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y - 4, 16, 0, 7); g.fill(); g.globalAlpha = 1; }
    else { g.fillStyle = '#3a3424'; g.fillRect(x - 2, y - 7, 5, 6); } }
  /* ---------- OVER EVERYTHING: the weed on the water, her arms, the fog, her eyes, her tells ---------- */
  H.drawOver = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), G = show.A, e = ctx.boss && ctx.boss.t === 'greenteeth' && ctx.boss.alive ? ctx.boss : null, surf = surfNow(), sy = R(surf - cy), pulse = 0.5 + 0.5 * Math.sin(time * 18);
    /* the canal's water is green, not the sea's blue */
    if (show.water.depth > 2) { g.fillStyle = 'rgba(40,70,30,0.22)'; g.fillRect(R(G.x0 - cx), sy, R(G.x1 - G.x0), R(G.bed - surf)); }
    /* THE WEED: bright - a pale mat, flowers in it, a lit rim, sagging as it takes you; dark - glossy bottle-green, bubbles, a slow ring. Torn: it shivers dark */
    for (const p of show.weed) { const x0 = R(p.x0 - cx), w = R(p.x1 - p.x0), y = R(p.y - cy);
      if (x0 > ctx.VW() || x0 + w < 0) continue;
      if (p.broken > 0) { g.globalAlpha = 0.5; g.fillStyle = '#1e3418'; for (let x = 0; x < w; x += 5) g.fillRect(x0 + x, y + 1 + ((x * 3) % 4), 3, 1); g.globalAlpha = 1; continue; }
      if (p.firm) { const shiver = p.torn > 0 ? Math.round(Math.sin(time * 40) * 1) : 0, dark = p.torn > 0 ? 0.6 : 0;
        g.fillStyle = dark ? '#3a5a22' : '#7aa83a'; g.fillRect(x0 + shiver, y - 2, w, 4); g.fillStyle = dark ? '#4a6a2a' : '#b8d860'; g.fillRect(x0 + shiver, y - 3, w, 1);
        g.fillStyle = '#5a8a2a'; for (let x = 2; x < w - 1; x += 4) g.fillRect(x0 + x + shiver, y - 1 + (x % 3 === 0 ? 1 : 0), 2, 1);
        if (!dark) { g.fillStyle = '#f4f8e0'; for (let x = 5; x < w - 2; x += 11) g.fillRect(x0 + x, y - 3, 1, 1); }
        if (p.sink > 0.6) { g.fillStyle = '#e8f4f0'; for (let i = 0; i < 3; i++) g.fillRect(x0 + ((i * 13 + time * 20) % w), y - 4 - ((time * 30 + i * 7) % 6), 1, 1); } }
      else { g.fillStyle = '#1e3a1e'; g.fillRect(x0, y - 1, w, 3); g.fillStyle = '#2e5a2a'; g.fillRect(x0, y - 2, w, 1); g.fillStyle = 'rgba(200,255,220,0.35)'; for (let x = 3; x < w; x += 9) g.fillRect(x0 + x, y - 1, 2, 1);
        g.fillStyle = '#9ad0a0'; for (let i = 0; i < 2; i++) { const bx = x0 + ((i * 17 + ((time * 11) | 0) * 7) % Math.max(4, w)); g.fillRect(bx, y - 3 - ((time * 20 + i * 9) % 5), 1, 1); } } }
    /* THE TEACHING DITCH (the standalone lock): its dark mat, drawn as the chamber's is; its bright mat is a mover */
    const tw = S.lock.teach; if (tw) { const x0 = R(tw.x0 - cx), w = R(tw.x1 - tw.x0), y = R(tw.y - cy); g.fillStyle = '#1e3a1e'; g.fillRect(x0, y - 1, w, 3); g.fillStyle = '#2e5a2a'; g.fillRect(x0, y - 2, w, 1); g.fillStyle = '#9ad0a0'; g.fillRect(x0 + ((time * 11) | 0) % Math.max(4, w), y - 3 - ((time * 20) % 5), 1, 1); }
    for (const m of ctx.movers || []) if (m.weedTeach && !m.broken) { const x0 = R(m.x - cx), w = m.w, y = R(m.y - cy); g.fillStyle = '#7aa83a'; g.fillRect(x0, y - 2, w, 4); g.fillStyle = '#b8d860'; g.fillRect(x0, y - 3, w, 1); g.fillStyle = '#f4f8e0'; for (let x = 5; x < w - 2; x += 11) g.fillRect(x0 + x, y - 3, 1, 1); }
    /* HER ARMS: a grab's arm holding, her hand up the gate to the paddle, a lash along the water, a reach at a ledge */
    if (e) { for (const a of show.arms) armDraw(g, a, e, cx, cy, time, surf);
      if (e.mode === 'handTell') { const Q = G.E, k = 1 - Math.max(0, e.modeT) / GT.handTell, hx = Q.paddle.x, hy = Q.paddle.y - 14 + (1 - k) * (surf - Q.paddle.y + 14);
        limb(g, Q.face - 6 - cx, surf - cy, hx - cx, hy - cy, time); claw(g, hx - cx, hy - cy, 1); } }
    /* THE FOG (phase three): a wash over the lock with holes of light round the lamps and round you; her body is lost in it, her eyes are not */
    if (show.fog > 0.01) { const fa = 0.62 * show.fog, lights = [];
      for (const side of ['W', 'E']) { const L = show.lamps[side]; if (L.st === 'hook') lights.push([G[side].hook.x, G[side].hook.y + 6, 46]); if (L.st === 'lit' || L.st === 'fall') lights.push([L.x, L.y, 58]); }
      for (const pp of ctx.players) if (!pp.dead) lights.push([pp.x, pp.y - 10, 40]);
      const x0 = R(G.x0 - cx) - 32, y0 = R(G.top - cy) - 40, w = R(G.x1 - G.x0) + 64, hgt = R(G.bed - G.top) + 60;
      for (const [k, sc] of [[0.55, 1.0], [0.3, 0.7], [0.15, 0.45]]) { g.fillStyle = 'rgba(16,24,24,' + (fa * k * 1.35).toFixed(3) + ')'; g.beginPath(); g.rect(x0, y0, w, hgt);
        for (const [lx, ly, r] of lights) { g.moveTo(R(lx - cx) + r * sc, R(ly - cy)); g.arc(R(lx - cx), R(ly - cy), r * sc, 0, Math.PI * 2, true); } g.fill('evenodd'); }
      g.globalCompositeOperation = 'lighter'; for (const [lx, ly, r] of lights) { const gr = g.createRadialGradient(R(lx - cx), R(ly - cy), 2, R(lx - cx), R(ly - cy), r); gr.addColorStop(0, 'rgba(120,100,50,' + (0.35 * show.fog).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(R(lx - cx) - r, R(ly - cy) - r, r * 2, r * 2); } g.globalCompositeOperation = 'source-over';   /* the lantern light, warm in the fog */
      for (let i = 0; i < 6; i++) { const fx = x0 + ((i * 131 + time * 8 * (i % 2 ? 1 : -1)) % w + w) % w, fy = y0 + 40 + (i * 37) % (hgt - 60); g.globalAlpha = 0.08 * show.fog; g.fillStyle = '#c8d8d0'; g.fillRect(R(fx), R(fy), 60, 6); } g.globalAlpha = 1; }
    /* HER EYES: always, over the water, the weed and the fog - two points of yellow-green where her head is */
    if (e && !(e.hp <= 0)) { const hx = R(e.x + (e.face || 1) * 3 - cx), hy = R((e.mode === 'stranded' || e.mode === 'drag' ? e.y - 11 : e.mode === 'flushed' ? e.y - 8 : Math.max(e.y - 47, surf + 2)) - cy);   /* (claude/canalfix3) on her bigger head */
      const under = e.y - 47 > surf + 2 && !GM.gtOpen(e), fl = 0.75 + 0.25 * Math.sin(time * 3);
      g.globalAlpha = (under ? 0.7 : 1) * fl; g.fillStyle = '#e8ff7a'; g.fillRect(hx - 3, hy, 2, 1); g.fillRect(hx + 1, hy, 2, 1);
      g.globalAlpha = 0.22 * fl * (show.fog > 0.3 ? 1.6 : 1); g.fillStyle = '#e8ff7a'; g.beginPath(); g.arc(hx, hy, 5, 0, 7); g.fill(); g.globalAlpha = 1;
      if (e.base === 'culvert' || e.mode === 'shiftTell') { const Q = G[show.hide || 'W']; g.globalAlpha = 0.6 + 0.3 * pulse; g.fillStyle = '#e8ff7a'; const qx = R(Q.face + Q.dir * 13 - cx); g.fillRect(qx - 3, R(G.bed - 12 - cy), 2, 1); g.fillRect(qx + 1, R(G.bed - 12 - cy), 2, 1); g.globalAlpha = 1; } }
    /* THE LAMPS in the water: a floating light, and her circling under it */
    for (const side of ['W', 'E']) { const L = show.lamps[side]; if (L.st === 'fall' || L.st === 'lit') lamp(g, R(L.x - cx), R(L.y - cy), time, L.st === 'lit' ? Math.min(1, L.t / 1.5) : 1); }
    /* ---- THE TELLS (never under the fog) ---- */
    if (e) for (const a of show.arms) if (a.st === 'tell') tellDraw(g, a, e, cx, cy, time, surf, pulse);
    if (e && (e.mode === 'surgeTell')) { const Q = G[e.surgeSide || 'W'], k = 1 - Math.max(0, e.modeT) / GT.surgeTell;   /* the culvert boils, and a red crest line along the water, the length of the lock */
      g.globalAlpha = 0.35 + 0.5 * k * pulse; g.fillStyle = '#ff6b6b'; g.fillRect(R(G.x0 - cx), sy - 18, R(G.x1 - G.x0), 1); g.fillRect(R(G.x0 - cx), sy + 9, R(G.x1 - G.x0), 1);
      const ax = R(Q.face + Q.dir * 30 - cx); g.fillRect(ax, sy - 12, Q.dir * 10, 1); g.fillRect(ax + Q.dir * 7, sy - 14, 1, 5); g.globalAlpha = 1;
      g.fillStyle = '#e8f4f0'; for (let i = 0; i < 8; i++) g.fillRect(R(Q.face + Q.dir * (4 + i * 3) - cx), sy - 2 - ((time * 50 + i * 7) % 10), 2, 1); }
    if (show.surge) { const s = show.surge, x = R(s.x - cx); g.fillStyle = '#e8f4f0'; g.fillRect(x - 12, sy - 16, 24, 4); g.fillStyle = '#bfe6f5'; g.fillRect(x - 16, sy - 12, 32, 6); g.fillStyle = '#7cc8c8'; g.fillRect(x - 20, sy - 6, 40, 6);
      for (let i = 0; i < 6; i++) { g.fillStyle = '#ffffff'; g.fillRect(x - 10 + i * 4, sy - 18 - ((time * 40 + i * 5) % 5), 1, 1); } }
    if (e && e.oa) { const a = e.oa, k = 1 - Math.max(0, a.t) / a.len;   /* (claude/canalfix3) HER OPENING FIGHTS: the snap (yellow, at her jaws) and the swipe (a red low band) */
      if (a.k === 'snap') { const x = R(e.x + a.dir * 14 - cx), y = R(e.y - 26 - cy); g.globalAlpha = 0.5 + 0.4 * pulse; g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 6, 3, 1); g.fillRect(x - 3, y - 3, 7, 1); g.fillRect(x - 5, y, 11, 1); g.globalAlpha = 1; }
      else band(g, 'low', e.y, e.x - GT.oa.swipeR, e.x + GT.oa.swipeR, k, cx, cy, time); }
    if (e && e.mode === 'handTell') { const Q = G.E; g.globalAlpha = 0.5 + 0.4 * pulse; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(R(Q.paddle.x - cx) - 8.5, R(Q.paddle.y - cy) - 31.5, 18, 32); g.globalAlpha = 1; }
    if (show.water.depth > 0 && show.pad.E.open && e && e.phase < 4) { g.globalAlpha = 0.5; g.fillStyle = '#bfe6f5'; for (let i = 0; i < 5; i++) g.fillRect(R(G.x1 - 8 - i * 6 - cx), sy + 2 + ((time * 30 + i * 4) % 8), 3, 1); g.globalAlpha = 1; }   /* the water running out east */
    /* OPEN, and its clock */
    if (e && GM.gtOpen(e)) { const full = e.big ? GT.bigT : e.mode === 'flushed' ? GT.flushT : GT.strandT, k = Math.max(0, e.modeT) / full, ex = R(e.x - cx), ey = R(e.y - 10 - cy);
      g.globalAlpha = 0.5 + 0.4 * pulse; g.strokeStyle = e.big ? '#fff6c8' : '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.ellipse(ex, ey, e.big ? 24 : 20, 14, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#1e1624'; g.fillRect(ex - 14, ey + 16, 28, 3); g.fillStyle = e.big ? '#fff6c8' : '#ffd36b'; g.fillRect(ex - 13, ey + 17, R(26 * k), 1);
      ctx.text(e.big ? 'OPEN!' : 'OPEN', ex, ey - 26, pulse > 0.5 ? '#fff6c8' : '#ffd36b', 'center', 6); }
    /* her death: the water goes still and green, and she sinks in it */
    if (show.dead) { show.dead = Math.min(1, show.dead + 1 / 120); }
  };
  function limb(g, x0, y0, x1, y1, time) { const mx = (x0 + x1) / 2 + Math.sin(time * 5) * 3, my = (y0 + y1) / 2;
    g.strokeStyle = '#3e6030'; g.lineWidth = 3; g.beginPath(); g.moveTo(R(x0), R(y0)); g.quadraticCurveTo(R(mx), R(my), R(x1), R(y1)); g.stroke();
    g.strokeStyle = '#86b060'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0), R(y0) - 1); g.quadraticCurveTo(R(mx), R(my) - 1, R(x1), R(y1) - 1); g.stroke(); }
  function claw(g, x, y, dir) { g.fillStyle = '#5e8a4a'; g.fillRect(R(x) - 2, R(y) - 2, 5, 4); g.fillStyle = '#d0dcb0'; for (let i = -1; i <= 1; i++) g.fillRect(R(x) + i * 2, R(y) - 4, 1, 2); }
  function armDraw(g, a, e, cx, cy, time, surf) {
    if (a.st === 'hold' && a.held) { limb(g, e.x - cx, e.y - 12 - cy, a.held.x - cx, a.held.y - 6 - cy, time); claw(g, a.held.x - cx, a.held.y - 6 - cy, 1); return; }
    if (a.st === 'blow' && a.k === 'grab') { const k = 1 - Math.max(0, a.t) / GT.grabT; limb(g, a.x - cx, surf + 20 - cy, a.x - cx, surf - GT.armUp * k - cy, time); claw(g, a.x - cx, surf - GT.armUp * k - cy, 1); return; }
    if (a.st === 'blow' && a.k === 'lash') { const r = a.r || 0; limb(g, a.ox - cx, a.fy + 4 - cy, a.ox + a.dir * r - cx, a.fy - 6 - cy, time); claw(g, a.ox + a.dir * r - cx, a.fy - 6 - cy, a.dir); return; }
    if (a.st === 'blow' && a.k === 'reach') { const ox = a.gate ? a.ox : a.x - a.dir * 30, sy0 = a.gate ? Math.max(a.fy, surf) : surf; limb(g, ox - cx, sy0 - cy, a.x + a.dir * 20 - cx, a.fy - 17 - cy, time); claw(g, a.x + a.dir * 20 - cx, a.fy - 17 - cy, a.dir); return; }
    if (a.k === 'tear' && a.st === 'blow') { const p = show.weed[a.patch]; if (p) { limb(g, (p.x0 + p.x1) / 2 - cx, surf + 20 - cy, (p.x0 + p.x1) / 2 + 8 - cx, surf - 2 - cy, time); } }
  }
  function tellDraw(g, a, e, cx, cy, time, surf, pulse) {
    const k = 1 - Math.max(0, a.t) / a.len;
    if (a.k === 'grab') { const x = R(a.x - cx), y = R(surf - cy), rr = GT.grabR + 6 - 4 * k;   /* THE RING: bubbles boiling up in a ring on the water where the arm will come */
      g.globalAlpha = 0.45 + 0.45 * pulse; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, rr, 3, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#e8f4f0'; for (let i = 0; i < 6; i++) { const q = i / 6 * Math.PI * 2 + time * 3; g.fillRect(x + R(Math.cos(q) * rr), y + R(Math.sin(q) * 2) - ((time * 30 + i * 3) % (4 + 6 * k)), 1, 1); }
      g.globalAlpha = 0.2 + 0.3 * k; g.fillStyle = '#ff6b6b'; g.fillRect(x - GT.grabR, y - GT.armUp, 1, GT.armUp); g.fillRect(x + GT.grabR, y - GT.armUp, 1, GT.armUp); g.globalAlpha = 1; }
    if (a.k === 'lash') { const x0 = a.dir > 0 ? a.ox : a.ox - a.reach, x1 = a.dir > 0 ? a.ox + a.reach : a.ox; band(g, 'low', a.fy, x0, x1, k, cx, cy, time);
      g.fillStyle = '#e8f4f0'; for (let i = 0; i < 5; i++) g.fillRect(R(a.ox + a.dir * (8 + i * 10 * k) - cx), R(a.fy - cy) - 1, 3, 1); }
    if (a.k === 'reach') { const x0 = a.gate === 'W' ? show.A.x0 : a.x - GT.reachSpan, x1 = a.gate === 'E' ? show.A.x1 : a.x + GT.reachSpan; band(g, 'high', a.fy, x0, x1, k, cx, cy, time);
      const ox = a.gate ? a.ox : a.x; limb(g, ox - cx, Math.max(a.fy, surf) - cy, ox - cx + (a.gate ? show.A[a.gate].dir * 4 : 0), Math.max(a.fy, surf) - 10 * k - cy, time); }
    if (a.k === 'bite') { const x = R(e.x + a.dir * 12 - cx), y = R(surf - 6 - cy); g.globalAlpha = 0.5 + 0.4 * pulse; g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 6, 3, 1); g.fillRect(x - 3, y - 3, 7, 1); g.globalAlpha = 1; }
    if (a.k === 'tear') { const p = show.weed[a.patch]; if (p) { g.globalAlpha = 0.4 + 0.5 * pulse; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.strokeRect(R(p.x0 - cx) + 0.5, R(p.y - cy) - 4.5, R(p.x1 - p.x0) - 1, 7); g.globalAlpha = 1; } }
  }
  /* A BAND: LOW (jump it) or HIGH (duck it), with an arrow at every hero standing in it (as the Wicker Queen's ribbons) */
  function band(g, kind, fy, x0, x1, k, cx, cy, time) {
    const t = kind === 'low' ? fy - 14 : fy - 24, b = kind === 'low' ? fy + 6 : fy - 10;
    g.globalAlpha = 0.2 + 0.45 * k * (0.6 + 0.4 * Math.sin(time * 30)); g.fillStyle = '#ff6b6b';
    g.fillRect(R(x0 - cx), R(t - cy), R(x1 - x0), 1); g.fillRect(R(x0 - cx), R(b - 1 - cy), R(x1 - x0), 1);
    for (const pp of ctx.players) { if (Math.abs(pp.y - fy) > 12 || pp.x < x0 || pp.x > x1) continue; const px2 = R(pp.x - cx), py2 = R(pp.y - 32 - cy);
      g.fillRect(px2 - 2, py2, 5, 1); g.fillRect(px2 - 1, kind === 'low' ? py2 - 1 : py2 + 1, 3, 1); g.fillRect(px2, kind === 'low' ? py2 - 2 : py2 + 2, 1, 1); }
    g.globalAlpha = 1;
  }

  /* ---------- HER SOUNDS (src/audio.js: gt*) ---------- */
  const S_ = ctx.SFX, SOUND = {
    grabTell: () => S_.gtBubble(), grab: () => S_.gtBurst(), held: () => S_.gtGrip(), lashTell: () => S_.gtBubble(), lash: () => S_.gtLash(),
    reachTell: () => S_.gtDrip(), reach: () => S_.gtLash(), biteTell: () => S_.gtHiss(), bite: () => S_.gtBite(), tearTell: () => S_.gtWeed(), tear: () => S_.gtWeed(),
    surgeTell: () => S_.gtBoil(), surge: () => S_.gtSurge(), handTell: () => S_.gtDrip(), paddleShut: () => S_.gtPaddle(), stranded: () => S_.gtStrand(), drag: () => S_.gtDrag(),
    shiftTell: () => S_.gtBubble(), floodTell: () => { S_.gtSurge(); S_.gtBell(); }, fogTell: () => S_.gtBell(), drainDone: () => S_.gtDrain(),
    lampIn: () => S_.splash(), lightOut: () => S_.gtHiss(),
    hiss: () => S_.gtHiss(), paddle: () => S_.gtPaddle(), drain: () => S_.gtDrain(), weed: () => S_.gtWeed(), lampDrop: () => S_.gtPaddle(), die: () => S_.gtBell(),
  };
  return H;
}
