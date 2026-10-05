// src/jenny-greenteeth-hands.js - JENNY GREENTEETH'S HANDS (claude/lockkeeper; claude/jenny2). src/jenny-greenteeth.js is the fight, pure and proved in
// tools/greenteeth.mjs; this binds it to the world: the chamber's water (the pool's level), the bright weed (movers you stand on, that sag and give),
// her blows on the heroes (a grab is the game's own P.snare - mash out of it, or strike the arm; her weed net tangles: P.rootT), a bite MET (blocked,
// flared, rolled through) that dazes her, a swing on her stuck arm or on the paddles, and the drawing: the lock's back wall (behind the tiles), its gear,
// its culverts, its lamps (before the bodies), and over everything the weed on the water, her arms, the fog, her eyes and her tells (the rings, the
// bands, the slam's mark on the timber, the charge's bow-wave, the net's throw, OPEN and its clock, the ring of her wariness).
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
  const hurt = (name, fn) => { const P = ctx.P, h0 = P.hp; const r = fn(); if (show) { const k = String(name), lost = Math.max(0, h0 - Math.max(0, P.hp)); show.hurt = show.hurt || {}; show.hurt[k] = (show.hurt[k] || 0) + lost; } return r; };
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
  /* her body's alpha: a dark shape in the culvert's grate, a shadow under the water as she charges */
  H.alpha = e => (e.mode === 'culvert' || e.base === 'culvert' ? 0.3 : e.hidden ? 0.12 : 1);

  /* ---------- THE HEROES as the fight sees them ---------- */
  const weedOf = pp => { const m = pp.onMover; if (!m || !m.weed || !show) return -1; return show.weed.findIndex(q => q.m === m.wi && q.firm && !(q.broken > 0)); };
  function heroes() { return ctx.players.map(pp => ({ x: pp.x, y: pp.y, face: pp.face || 1, alive: ctx.upright(pp) && !pp.dead, ground: !!pp.ground, swim: !!pp.swim,
    onWeed: pp.ground ? weedOf(pp) : -1, onTile: !!pp.ground && !pp.onMover, pp })); }
  const keyed = (pp, key) => { pp.gtKeys = pp.gtKeys || new Map(); if (pp.gtKeys.size > 60) pp.gtKeys.clear(); if (pp.gtKeys.has(key)) return true; pp.gtKeys.set(key, 1); return false; };
  const boxOf = bx => ({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] });

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
      /* HER VINE (claude/jenny3): a band at your feet like the lash - and a hero it catches is YANKED off his footing toward her, through the air
         (P.hurt holds his legs while he flies; a throw, never a teleport). Jumped, rolled through or not there: nothing */
      vine: ([t, b], x0, x1, d, key, toX) => { let got = null; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead) return;
        if (P.x < x0 || P.x > x1) return; const hb = ctx.box(P); if (!(hb.b > t && hb.t < b) || keyed(pp, key)) return;
        const res = hurt(MOVE_NAME.vine, () => ctx.damagePlayer(toX, d, { who: e, name: MOVE_NAME.vine, unblockable: true, noKnock: true }));
        if (res !== 'hit' || P.dead) return; got = pp;
        P.vx = (Math.sign(toX - P.x) || 1) * GT.vinePull; P.vy = -GT.vineLift; P.ground = false; P.onMover = null; P.hurt = Math.max(P.hurt || 0, GT.vineHurt);
        ctx.burst(P.x, P.y - 4, 8, ['#3e6030', '#7aa83a', '#9ac850'], 60, 0.4); SOUND.weed();
        if (!show.told.vined) { show.told.vined = true; ctx.number(P.x, P.y - 40, 'HER VINE HAS YOU', '#ff6b6b'); } }); return got; },
      /* a blow in a box. meet: says whether it was MET - blocked (a shield, a deflect, the ember flare) or rolled through - for THE BITE's daze */
      hit: (bx, d, name, o = {}) => { let out = null; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead) return;
        if (!ctx.overlap(boxOf(bx), o.duck ? ctx.duckBox(P) : ctx.box(P))) return; const rolling = P.dodge > 0;
        const res = hurt(name, () => ctx.damagePlayer(o.from ?? e.x, d, { who: e, name, unblockable: !!o.unblockable }));
        if (o.meet && (res === 'blocked' || (res === false && rolling))) out = 'met'; else if (!out && res === 'hit') out = 'hit'; }); return out; },
      /* HER SLAM: a hero under her claws is hurt (no shield turns it); one rolling through it is not under them - the claws go into the timber */
      slam: (bx, d) => { let hit = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead || P.dodge > 0) return;
        if (!ctx.overlap(boxOf(bx), ctx.box(P))) return; hit = true; hurt(MOVE_NAME.slam, () => ctx.damagePlayer(e.x, d, { who: e, name: MOVE_NAME.slam, unblockable: true })); }); return hit; },
      /* HER WEED NET: caught, a hero is tangled a moment (rooted) */
      net: (bx, d, root) => { let n = 0; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead || P.dodge > 0) return;
        if (!ctx.overlap(boxOf(bx), ctx.box(P))) return; n++; hurt(MOVE_NAME.net, () => ctx.damagePlayer(e.x, d, { who: e, name: MOVE_NAME.net, unblockable: true, noKnock: true }));
        P.rootT = Math.max(P.rootT || 0, root); P.vx = 0; ctx.burst(P.x, P.y - 8, 10, ['#3e6030', '#7aa83a', '#9ac850'], 50, 0.5);
        if (!show.told.netted) { show.told.netted = true; ctx.number(P.x, P.y - 40, 'TANGLED IN THE WEED', '#ff6b6b'); } }); return n > 0; },
      /* THE GRAB: the first hero in the arm's column who is in the water (or on the weed, or in the air over it) is held - the game's own snare */
      grab: (bx, d, arm) => { for (const h of hs) { const pp = h.pp; if (!h.alive || (pp.ground && !pp.onMover) || pp.snare > 0) continue; let got = null;
          ctx.asPlayer(pp, () => { const P = ctx.P; if (ctx.overlap(boxOf(bx), ctx.box(P))) { P.snare = GT.grabHold + 0.3; P.vx = 0;
            hurt('HER ARM', () => ctx.damagePlayer(arm.x, d, { who: e, name: 'HER ARM', unblockable: true, noKnock: true })); got = h; } });
          if (got) { if (pp.onMover && pp.onMover.weed) { pp.onMover = null; pp.ground = false; } return got; } } return null; },
      hold: (arm, dt2) => { const h = arm.held, pp = h && h.pp; if (!pp || pp.dead || !(pp.snare > 0)) return false;
        ctx.asPlayer(pp, () => { const P = ctx.P; P.vx = Math.max(-60, Math.min(60, (arm.x - P.x) * 4)); P.vy = 30; if (P.onMover && P.onMover.weed) { P.onMover = null; P.ground = false; } h.x = P.x; h.y = P.y; }); return true; },
      drag: (arm, d) => { const pp = arm.held && arm.held.pp; if (!pp) return; ctx.asPlayer(pp, () => { const P = ctx.P; P.inv = 0; hurt('DRAGGED UNDER', () => ctx.damagePlayer(P.x, d, { who: e, name: 'DRAGGED UNDER', unblockable: true, noKnock: true })); }); ctx.burst(arm.x, show.A.bed - show.water.depth, 4, ['#e8f4f0', '#7cc8c8'], 40, 0.4); },
      release: arm => { const pp = arm.held && arm.held.pp; if (pp && pp.snare > 0) pp.snare = 0; },
      cycle: () => {},
    });
    for (const v of evs) {
      if (v.t === 'phase') ctx.enrage(e);
      if (v.t === 'stranded') { ctx.shakeCam(v.big ? 7 : 5); ctx.dust(e.x, e.y, 10); ctx.burst(e.x, e.y - 6, 14, ['#4a3a26', '#6a5a3a', '#3e6030'], 70, 0.6); }
      if (v.t === 'stuck') { ctx.shakeCam(5); ctx.hitstop && ctx.hitstop(0.06); if (e.claw) { ctx.burst(e.claw.x, e.claw.y - 2, 12, ['#6a5030', '#a08050', '#d8c890'], 80, 0.5); ctx.dust(e.claw.x, e.claw.y, 6); } }
      if (v.t === 'slamHit' || v.t === 'slam') ctx.shakeCam(3);
      if (v.t === 'dazed') { ctx.shakeCam(4); ctx.burst(e.x, e.y - GT.h + 8, 10, ['#e8ff7a', '#fff6c8'], 60, 0.5); }
      if (v.t === 'surge' || v.t === 'charge') ctx.shakeCam(3);
      if (v.t === 'held') ctx.shakeCam(2);
      if (v.t === 'grab' || v.t === 'bite') ctx.burst(v.t === 'grab' ? e.x : e.x + (e.face || 1) * 20, show.A.bed - show.water.depth, 8, ['#e8f4f0', '#7cc8c8', '#5e8a4a'], 70, 0.4);
      if (v.t === 'weedGive' || v.t === 'torn') SOUND.weed();
    }
    if (show.surgeFx) { show.surgeFx.t -= dt; if (show.surgeFx.t <= 0) show.surgeFx = null; }
    H.lastEvents = evs;
  };
  const MOVE_NAME = GM.MOVE_NAME;

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

  /* ---------- A HERO'S SWING: the arm that holds, her stuck arm, the paddles ---------- */
  H.strike = hb => {
    if (!show || !hb) return; const e = ctx.boss; if (!e || e.t !== 'greenteeth' || !e.alive || !ctx.bossActive) return;
    const P = ctx.P, res = GM.strikeAt(e, show, hb, P.hitSet), G = show.A;
    for (const r of res) {
      if (r.what === 'arm') { const pp = r.a.held && r.a.held.pp; if (pp) pp.snare = 0; r.a.st = 'back'; r.a.t = 0.3; show.n.freed++; SOUND.hiss(); ctx.hitstop && ctx.hitstop(0.05);
        ctx.burst(r.a.held ? r.a.held.x : r.a.x, (r.a.held ? r.a.held.y : G.bed) - 8, 8, ['#5e8a4a', '#86b060', '#e8f4f0'], 70, 0.4); }
      if (r.what === 'claw' && ctx.hurtBoss && ctx.hurtBoss(e)) { ctx.burst(e.claw ? e.claw.x : e.x, (e.claw ? e.claw.y : e.y) - 6, 6, ['#5e8a4a', '#86b060'], 60, 0.35); }   /* a blow along her stuck arm lands on her */
      if (r.what === 'paddle') { const pd = G[r.side].paddle;
        if (r.res === 'drain') { SOUND.paddle(); SOUND.drain(); ctx.shakeCam(3); ctx.number(pd.x, pd.y - 40, 'THE WATER RUNS OUT FROM UNDER HER', '#8fd160'); }
        else if (r.res === 'flush') { SOUND.paddle(); SOUND.surge(); ctx.shakeCam(6); ctx.number(e.x, G.walk - 40, 'THE CULVERT SPITS HER OUT: CUT HER', '#ffd36b');
          ctx.burst(G[r.side].face + G[r.side].dir * 20, G.bed - show.water.depth, 20, ['#e8f4f0', '#bfe6f5', '#7cc8c8'], 120, 0.7); }
        else if (r.res === 'wait') { ctx.SFX.clank(); ctx.number(pd.x, pd.y - 40, 'NOT YET: SHE IS NOT AT THE GATE', '#9aa39a'); }
        else if (r.res === 'notHere') { SOUND.paddle(); ctx.number(pd.x, pd.y - 40, 'SHE IS NOT IN THAT CULVERT', '#9aa39a'); }
        else if (r.res === 'spent') { ctx.SFX.clank(); if (!show.told.spent) { show.told.spent = true; ctx.number(pd.x, pd.y - 40, 'THE PADDLE IS DONE: FIGHT HER', '#9aa39a'); } }
        else ctx.SFX.clank(); }
    }
  };
  H.warded = e => { if (!(e.wardSaid > ctx.time)) { e.wardSaid = ctx.time + 5; ctx.number(e.x, e.y - 50, 'THE WATER TAKES IT: MAKE HER OPEN FIRST', '#9aa39a'); } };
  H.take = e => GM.gtTake(e);
  H.cap = (e, dmg) => { const d = GM.gtCap(e, dmg); if (d < dmg && !(e.capSaid > ctx.time)) { e.capSaid = ctx.time + 3; ctx.number(e.x, e.y - 50, 'THAT OPENING IS SPENT: THE WATER TAKES IT', '#9aa39a'); } return d; };   /* (claude/jenny3: an opening takes its share of her, no more) */
  const OPEN_NAME = { stranded: 'STRANDED', flushed: 'OPEN', stuck: 'STUCK', dazed: 'DAZED' };
  H.barName = b => (GM.gtOpen(b) ? 'JENNY GREENTEETH  ' + OPEN_NAME[b.mode] : b.phase >= 3 ? 'JENNY GREENTEETH  THE FOG' : b.phase === 2 ? 'JENNY GREENTEETH  THE FLOOD' : 'JENNY GREENTEETH');
  H.camY = ty => { const S = A(); if (!S) return ty; const VH = ctx.VH(), top = S.y0 - 8, bot = S.floor + 2 * ctx.TS;
    if (bot - top <= VH) return (top + bot) / 2 - VH / 2;
    const P = ctx.P; return Math.max(P.y - VH + 50, Math.min(ty, P.y - 70)); };
  H.end = e => { if (!show) return; for (const a of show.arms) if (a.st === 'hold' && a.held && a.held.pp) a.held.pp.snare = 0; show.arms = []; show.surge = null; show.charge = null; show.pad.E.open = false; show.pad.W.open = false;
    show.water.target = show.water.depth; show.fogTo = 0; show.dead = 0.001; e.claw = null; e.y = show.A.bed - show.water.depth + 6; SOUND.die(); };
  H.read = () => show && { mode: ctx.boss && ctx.boss.mode, base: ctx.boss && ctx.boss.base, phase: ctx.boss && ctx.boss.phase, n: { ...show.n }, cycle: show.cycle, cyc: { ...show.cyc }, C: show.C && show.C.name,
    depth: Math.round(show.water.depth), pad: JSON.parse(JSON.stringify(show.pad)), hide: show.hide, fog: +show.fog.toFixed(2), beat: { ...show.beat }, wary: show.wary && show.wary.t > 0 ? show.wary.k : null,
    weed: show.weed.map(p => ({ x0: p.x0, x1: p.x1, firm: p.firm, broken: +(p.broken || 0).toFixed(2), sink: +(p.sink || 0).toFixed(2), y: p.y })),
    arms: show.arms.map(a => ({ k: a.k, st: a.st, t: +a.t.toFixed(2), x: Math.round(a.x) })), surge: show.surge && { x: Math.round(show.surge.x), dir: show.surge.dir }, charge: show.charge && { x: Math.round(show.charge.x), dir: show.charge.dir }, hurt: { ...(show.hurt || {}) } };

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
  /* is this paddle the beat right now (its glow): the drain with her at its gate, her culvert's paddle while she hides */
  const beatPad = (e, side) => !!e && ((e.phase === 1 && side === 'E' && show.beat[1] === 'ready' && GM.atGate(e, show, 'E')) || (e.phase === 2 && show.beat[2] === 'ready' && (e.base === 'culvert' || e.base === 'shift') && show.hide === side));
  /* THE GEAR, THE CULVERTS, THE LAMPS (before the bodies) */
  H.drawBack = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), G = show.A, e = ctx.boss && ctx.boss.t === 'greenteeth' ? ctx.boss : null;
    for (const side of ['W', 'E']) { const Q = G[side], pd = show.pad[side], fx = R(Q.face - cx), dir = Q.dir;
      /* the culvert mouth at the gate's foot: a dark arch with an iron grate, foaming when its paddle runs */
      const mx = dir > 0 ? fx : fx - 26, my = R(G.bed - cy);
      g.fillStyle = '#0c0f0c'; g.fillRect(mx, my - 18, 26, 18); g.beginPath(); g.ellipse(mx + 13, my - 18, 13, 6, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#4a4e52'; for (let x = 3; x < 26; x += 5) g.fillRect(mx + x, my - 20, 1, 20); g.fillRect(mx, my - 12, 26, 1);
      if (pd.open || (show.surgeFx && show.surgeFx.side === side)) for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#e8f4f0' : '#bfe6f5'; g.fillRect(mx + ((i * 7 + time * 60) % 26), my - 6 - ((i * 5 + time * 40) % 14), 2, 1); }
      /* the paddle gear on the walkway: a cast-iron rack post, its pinion, the rack raised while the paddle is up */
      const px = R(Q.paddle.x - cx), py = R(Q.paddle.y - cy), up = pd.open ? 8 : 0;
      g.fillStyle = '#2a2c30'; g.fillRect(px - 2, py - 22, 5, 22); g.fillStyle = '#5a6068'; g.fillRect(px - 2, py - 22, 1, 22);
      g.fillStyle = '#3a3e44'; g.fillRect(px + 3, py - 26 - up, 2, 20); for (let y = py - 26 - up; y < py - 6 - up; y += 3) { g.fillStyle = '#8a929c'; g.fillRect(px + 5, y, 1, 1); }
      g.fillStyle = '#4a4e52'; g.beginPath(); g.arc(px, py - 16, 4, 0, 7); g.fill(); g.fillStyle = '#9aa3b0'; g.fillRect(px - 1, py - 17, 2, 2);
      if (beatPad(e, side)) { const k = 0.5 + 0.5 * Math.sin(time * 6); g.globalAlpha = 0.35 + 0.45 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(px - 6.5, py - 29.5, 14, 30);
        g.fillStyle = '#fff6c8'; g.fillRect(px - 1, py - 36 - R(2 * k), 3, 3); g.globalAlpha = 1; }   /* NOW: the one strike the lock takes this phase */
      /* the walkway's handrail: two iron posts and a rail */
      const w0 = dir > 0 ? R(Q.face - cx) : R(Q.face - 4 * ctx.TS - cx), w1 = w0 + 4 * ctx.TS;
      g.fillStyle = '#3a3e44'; g.fillRect(w0 + 1, py - 14, 1, 14); g.fillRect(w1 - 2, py - 14, 1, 14); g.fillRect(w0 + 1, py - 14, w1 - w0 - 2, 1);
      /* the lamp's iron bracket out over the water, and the lamp on its hook (in the fog, the light she cannot see you by) */
      const hx = R(Q.hook.x - cx), hy = R(Q.hook.y - cy); g.fillStyle = '#2a2c30'; g.fillRect(Math.min(hx, dir > 0 ? w1 - 2 : w0 + 1), hy - 2, Math.abs(hx - (dir > 0 ? w1 - 2 : w0 + 1)) + 1, 2); g.fillRect(hx, hy - 2, 1, 5);
      lamp(g, hx, hy + 10, time, 1);
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
    /* the narrowboat's back in the shallows: a ripple line where the water breaks over it */
    if (GM.wreckShallow(show)) { g.fillStyle = 'rgba(232,244,240,0.55)'; for (let x = G.wreck.x0 + 4; x < G.wreck.x1 - 4; x += 9) g.fillRect(R(x - cx + Math.sin(time * 2 + x) * 2), sy - 1, 4, 1); }
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
    /* HER ARMS: a grab's arm holding, a lash along the water, a reach at a ledge, her claws stuck in the timber */
    if (e) { for (const a of show.arms) armDraw(g, a, e, cx, cy, time, surf);
      if (e.mode === 'stuck' && e.claw) { const sx2 = e.x + Math.sign(e.claw.x - e.x) * 6 - cx, sy2 = e.y - GT.h + 14 - cy; limb(g, sx2, sy2, e.claw.x - cx, e.claw.y - 3 - cy, time * 0.2); claw(g, e.claw.x - cx, e.claw.y - 2 - cy, 1);
        g.fillStyle = '#d8c890'; g.fillRect(R(e.claw.x - cx) - 3, R(e.claw.y - cy), 7, 1); g.fillStyle = '#1c150e'; g.fillRect(R(e.claw.x - cx) - 2, R(e.claw.y - cy) + 1, 5, 1); } }   /* the splintered timber round her claws */
    /* THE FOG (phase three): a wash over the lock with holes of light round the lamps and round you; her body is lost in it, her eyes are not */
    if (show.fog > 0.01) { const fa = 0.62 * show.fog, lights = [];
      for (const side of ['W', 'E']) lights.push([G[side].hook.x, G[side].hook.y + 6, 46]);
      for (const pp of ctx.players) if (!pp.dead) lights.push([pp.x, pp.y - 10, 44]);
      if (e && GM.gtOpen(e)) lights.push([e.x, e.y - GT.h / 2, 40]);   /* (open, she is seen: the opening must show) */
      if (e && (GM.lureLive(e, show) || e.mode === 'fogTell')) lights.push([(G.wreck.x0 + G.wreck.x1) / 2, G.wreck.y - 6, 70]);   /* (claude/jenny3: the lit boat burns a hole in the fog) */
      const x0 = R(G.x0 - cx) - 32, y0 = R(G.top - cy) - 40, w = R(G.x1 - G.x0) + 64, hgt = R(G.bed - G.top) + 60;
      for (const [k, sc] of [[0.55, 1.0], [0.3, 0.7], [0.15, 0.45]]) { g.fillStyle = 'rgba(16,24,24,' + (fa * k * 1.35).toFixed(3) + ')'; g.beginPath(); g.rect(x0, y0, w, hgt);
        for (const [lx, ly, r] of lights) { g.moveTo(R(lx - cx) + r * sc, R(ly - cy)); g.arc(R(lx - cx), R(ly - cy), r * sc, 0, Math.PI * 2, true); } g.fill('evenodd'); }
      g.globalCompositeOperation = 'lighter'; for (const [lx, ly, r] of lights) { const gr = g.createRadialGradient(R(lx - cx), R(ly - cy), 2, R(lx - cx), R(ly - cy), r); gr.addColorStop(0, 'rgba(120,100,50,' + (0.35 * show.fog).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(R(lx - cx) - r, R(ly - cy) - r, r * 2, r * 2); } g.globalCompositeOperation = 'source-over';   /* the lantern light, warm in the fog */
      for (let i = 0; i < 6; i++) { const fx = x0 + ((i * 131 + time * 8 * (i % 2 ? 1 : -1)) % w + w) % w, fy = y0 + 40 + (i * 37) % (hgt - 60); g.globalAlpha = 0.08 * show.fog; g.fillStyle = '#c8d8d0'; g.fillRect(R(fx), R(fy), 60, 6); } g.globalAlpha = 1; }
    /* HER EYES: always, over the water, the weed and the fog - two points of yellow-green where her head is (dim and crossed while dazed) */
    if (e && !(e.hp <= 0) && e.mode !== 'charge') { const prone = e.mode === 'stranded' || e.mode === 'drag', hx = R(e.x + (e.face || 1) * (prone ? 14 : 3) - cx), hy = R((prone ? e.y - 9 : e.mode === 'flushed' ? e.y - 8 : e.mode === 'stuck' ? e.y - GT.h + 7 : Math.max(e.y - GT.h + 7, surf + 2)) - cy);
      const under = e.y - GT.h + 7 > surf + 2 && !GM.gtOpen(e), fl = e.mode === 'dazed' ? 0.4 : 0.75 + 0.25 * Math.sin(time * 3);
      g.globalAlpha = (under ? 0.7 : 1) * fl; g.fillStyle = '#e8ff7a'; g.fillRect(hx - 3, hy, 2, 1); g.fillRect(hx + 1, hy, 2, 1);
      g.globalAlpha = 0.22 * fl * (show.fog > 0.3 ? 1.6 : 1); g.fillStyle = '#e8ff7a'; g.beginPath(); g.arc(hx, hy, 5, 0, 7); g.fill(); g.globalAlpha = 1;
      if (e.base === 'culvert' || e.base === 'shift') { const Q = G[show.hide || 'W']; g.globalAlpha = 0.6 + 0.3 * pulse; g.fillStyle = '#e8ff7a'; const qx = R(Q.face + Q.dir * 13 - cx); g.fillRect(qx - 3, R(G.bed - 12 - cy), 2, 1); g.fillRect(qx + 1, R(G.bed - 12 - cy), 2, 1); g.globalAlpha = 1; }
      if (e.mode === 'dazed') for (let i = 0; i < 3; i++) { const q = time * 5 + i * 2.1; g.fillStyle = i % 2 ? '#fff6c8' : '#e8ff7a'; g.fillRect(R(e.x - cx + Math.cos(q) * 9), R(e.y - GT.h - 2 - cy + Math.sin(q) * 3), 2, 2); } }   /* the stars of her daze */
    /* THE LIT BOAT and THE GLINTS (claude/jenny3, over the fog): the boat glows while the lure is live - rising with the fog in its teach beat - and a
       glint (a chevron when off screen) marks the paddle that is the beat right now */
    if (e) { const lit = GM.lureLive(e, show) ? 1 : e.mode === 'fogTell' ? Math.max(0, Math.min(1, 1.4 * (1 - e.modeT / GT.fogTell) - 0.2)) : 0; if (lit > 0) boatGlow(g, cx, cy, time, lit);
      for (const side of ['W', 'E']) if (beatPad(e, side)) glint(g, G[side].paddle.x, G[side].paddle.y - 44, cx, cy, time, '#ffd36b'); }
    /* ---- THE TELLS (never under the fog) ---- */
    if (e) for (const a of show.arms) if (a.st === 'tell') tellDraw(g, a, e, cx, cy, time, surf, pulse);
    if (e && (e.mode === 'surgeTell')) { const Q = G[e.surgeSide || 'W'], k = 1 - Math.max(0, e.modeT) / GT.surgeTell;   /* the culvert boils, and a red crest line along the water, the length of the lock */
      g.globalAlpha = 0.35 + 0.5 * k * pulse; g.fillStyle = '#ff6b6b'; g.fillRect(R(G.x0 - cx), sy - 18, R(G.x1 - G.x0), 1); g.fillRect(R(G.x0 - cx), sy + 9, R(G.x1 - G.x0), 1);
      const ax = R(Q.face + Q.dir * 30 - cx); g.fillRect(ax, sy - 12, Q.dir * 10, 1); g.fillRect(ax + Q.dir * 7, sy - 14, 1, 5); g.globalAlpha = 1;
      g.fillStyle = '#e8f4f0'; for (let i = 0; i < 8; i++) g.fillRect(R(Q.face + Q.dir * (4 + i * 3) - cx), sy - 2 - ((time * 50 + i * 7) % 10), 2, 1); }
    if (show.surge) crest(g, show.surge.x, show.surge.dir, sy, cx, time);
    if (show.charge) { crest(g, show.charge.x + show.charge.dir * 8, show.charge.dir, sy, cx, time);   /* her charge: the bow-wave, and her shadow and eyes under it */
      const x = R(show.charge.x - cx); g.globalAlpha = 0.35; g.fillStyle = '#16301a'; g.beginPath(); g.ellipse(x - show.charge.dir * 6, sy + 10, 16, 5, 0, 0, 7); g.fill(); g.globalAlpha = 0.9; g.fillStyle = '#e8ff7a'; g.fillRect(x - 3, sy + 6, 2, 1); g.fillRect(x + 1, sy + 6, 2, 1); g.globalAlpha = 1; }
    if (e && e.oa) { const a = e.oa, k = 1 - Math.max(0, a.t) / a.len;   /* HER OPENING FIGHTS: the snap (yellow, at her jaws) and the swipe (a red low band) */
      if (a.k === 'snap') { const x = R(e.x + a.dir * 14 - cx), y = R(e.y - 26 - cy); g.globalAlpha = 0.5 + 0.4 * pulse; g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 6, 3, 1); g.fillRect(x - 3, y - 3, 7, 1); g.fillRect(x - 5, y, 11, 1); g.globalAlpha = 1; }
      else band(g, 'low', e.y, e.x - GT.oa.swipeR, e.x + GT.oa.swipeR, k, cx, cy, time); }
    /* SHE IS WARY: a slow ring of weed about her, the trick that opened her will not work again until it fades */
    if (e && show.wary && show.wary.t > 0 && !GM.gtOpen(e) && e.mode !== 'charge') { const k = show.wary.t / GT.wardT, ex = R(e.x - cx), ey = R(e.y - GT.h / 2 - cy);
      g.globalAlpha = 0.25 + 0.35 * k; g.strokeStyle = '#7aa83a'; g.lineWidth = 1; g.beginPath(); g.ellipse(ex, ey, 22, 16, 0, time * 2, time * 2 + Math.PI * 2 * k); g.stroke(); g.globalAlpha = 1; }
    if (show.water.depth > 0 && show.pad.E.open && e) { g.globalAlpha = 0.5; g.fillStyle = '#bfe6f5'; for (let i = 0; i < 5; i++) g.fillRect(R(G.x1 - 8 - i * 6 - cx), sy + 2 + ((time * 30 + i * 4) % 8), 3, 1); g.globalAlpha = 1; }   /* the water running out east */
    /* OPEN, and its clock */
    if (e && GM.gtOpen(e) && e.mode === 'stranded' && e.lure) { const full = e.openLen || 3, k = Math.max(0, e.modeT) / full, ex = R(e.x - cx), ey = R(e.y - 10 - cy);   /* (claude/jenny3) AGROUND ON THE BOAT: a BIG gold ring, a wide clock under it */
      g.globalAlpha = 0.6 + 0.4 * pulse; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(ex, ey, 36, 22, 0, 0, 7); g.stroke(); g.strokeStyle = '#fff6c8'; g.lineWidth = 1; g.beginPath(); g.ellipse(ex, ey, 41, 26, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#1e1624'; g.fillRect(ex - 25, ey + 28, 50, 7); g.fillStyle = '#ffd36b'; g.fillRect(ex - 24, ey + 29, R(48 * k), 3); g.fillStyle = '#8fd160'; g.fillRect(ex - 24, ey + 33, R(48 * Math.max(0, e.capLeft || 0) / Math.max(1, e.capLen || 1)), 1);
      ctx.text('STRANDED!', ex, ey - 36, pulse > 0.5 ? '#fff6c8' : '#ffd36b', 'center', 6); }
    else if (e && GM.gtOpen(e)) { const full = e.openLen || 3, k = Math.max(0, e.modeT) / full, ex = R(e.x - cx), ey = R(e.y - (e.mode === 'stranded' ? 8 : GT.h / 2) - cy);
      g.globalAlpha = 0.5 + 0.4 * pulse; g.strokeStyle = e.big ? '#fff6c8' : '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.ellipse(ex, ey, e.big ? 26 : 22, 16, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#1e1624'; g.fillRect(ex - 14, ey + 18, 28, 5); g.fillStyle = e.big ? '#fff6c8' : '#ffd36b'; g.fillRect(ex - 13, ey + 19, R(26 * k), 1); g.fillStyle = '#8fd160'; g.fillRect(ex - 13, ey + 21, R(26 * Math.max(0, e.capLeft || 0) / Math.max(1, e.capLen || 1)), 1);   /* (claude/jenny3: the green line under the clock is the opening's share of her left) */
      ctx.text(e.big ? 'OPEN!' : 'OPEN', ex, ey - 28, pulse > 0.5 ? '#fff6c8' : '#ffd36b', 'center', 6); }
    /* her death: the water goes still and green, and she sinks in it */
    if (show.dead) { show.dead = Math.min(1, show.dead + 1 / 120); }
  };
  function crest(g, wx, dir, sy, cx, time) { const x = R(wx - cx); g.fillStyle = '#e8f4f0'; g.fillRect(x - 12, sy - 16, 24, 4); g.fillStyle = '#bfe6f5'; g.fillRect(x - 16, sy - 12, 32, 6); g.fillStyle = '#7cc8c8'; g.fillRect(x - 20, sy - 6, 40, 6);
    for (let i = 0; i < 6; i++) { g.fillStyle = '#ffffff'; g.fillRect(x - 10 + i * 4, sy - 18 - ((time * 40 + i * 5) % 5), 1, 1); } }
  function limb(g, x0, y0, x1, y1, time) { const mx = (x0 + x1) / 2 + Math.sin(time * 5) * 3, my = (y0 + y1) / 2;
    g.strokeStyle = '#3e6030'; g.lineWidth = 3; g.beginPath(); g.moveTo(R(x0), R(y0)); g.quadraticCurveTo(R(mx), R(my), R(x1), R(y1)); g.stroke();
    g.strokeStyle = '#86b060'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0), R(y0) - 1); g.quadraticCurveTo(R(mx), R(my) - 1, R(x1), R(y1) - 1); g.stroke(); }
  function claw(g, x, y, dir) { g.fillStyle = '#5e8a4a'; g.fillRect(R(x) - 2, R(y) - 2, 5, 4); g.fillStyle = '#d0dcb0'; for (let i = -1; i <= 1; i++) g.fillRect(R(x) + i * 2, R(y) - 4, 1, 2); }
  function armDraw(g, a, e, cx, cy, time, surf) {
    if (a.st === 'hold' && a.held) { limb(g, e.x - cx, e.y - 12 - cy, a.held.x - cx, a.held.y - 6 - cy, time); claw(g, a.held.x - cx, a.held.y - 6 - cy, 1); return; }
    if (a.st === 'blow' && a.k === 'grab') { const k = 1 - Math.max(0, a.t) / GT.grabT; limb(g, a.x - cx, surf + 20 - cy, a.x - cx, surf - GT.armUp * k - cy, time); claw(g, a.x - cx, surf - GT.armUp * k - cy, 1); return; }
    if (a.st === 'blow' && a.k === 'lash') { const r = a.r || 0; limb(g, a.ox - cx, a.fy + 4 - cy, a.ox + a.dir * r - cx, a.fy - 6 - cy, time); claw(g, a.ox + a.dir * r - cx, a.fy - 6 - cy, a.dir); return; }
    if (a.st === 'blow' && a.k === 'reach') { const ox = a.gate ? a.ox : a.x - a.dir * 30, sy0 = a.gate ? Math.max(a.fy, surf) : surf; limb(g, ox - cx, sy0 - cy, a.x + a.dir * 20 - cx, a.fy - 17 - cy, time); claw(g, a.x + a.dir * 20 - cx, a.fy - 17 - cy, a.dir); return; }
    if (a.st === 'blow' && a.k === 'slam') { limb(g, e.x - cx, e.y - GT.h + 12 - cy, a.x - cx, a.fy - 4 - cy, time); claw(g, a.x - cx, a.fy - 3 - cy, 1); return; }
    if (a.st === 'blow' && a.k === 'net') { const k = 1 - Math.max(0, a.t) / GT.netT, nx = e.x + (a.x - e.x) * k, ny = e.y - GT.h + (a.fy - 10 - (e.y - GT.h)) * k - Math.sin(k * Math.PI) * 30; netBlob(g, nx - cx, ny - cy, 6 + 10 * k, time); return; }
    if (a.st === 'blow' && a.k === 'vine') { const r = a.r || 0, tx = a.ox + a.dir * r; vineRope(g, e.x - cx, e.y - GT.h + 12 - cy, tx - cx, a.fy - 4 - cy, time, 1); claw(g, tx - cx, a.fy - 5 - cy, a.dir); return; }   /* (claude/jenny3: her vine whipping out along the ledge) */
    if (a.k === 'tear' && a.st === 'blow') { const p = show.weed[a.patch]; if (p) { limb(g, (p.x0 + p.x1) / 2 - cx, surf + 20 - cy, (p.x0 + p.x1) / 2 + 8 - cx, surf - 2 - cy, time); } }
  }
  /* HER VINE: a long rope of weed, a darker twist down its length and leaves along it (k: how much of it is drawn) */
  function vineRope(g, x0, y0, x1, y1, time, k) { const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 18 - Math.sin(time * 6) * 3, ex = x0 + (x1 - x0) * k, ey = y0 + (y1 - y0) * k;
    g.strokeStyle = '#2e4a22'; g.lineWidth = 3; g.beginPath(); g.moveTo(R(x0), R(y0)); g.quadraticCurveTo(R(x0 + (mx - x0) * k), R(y0 + (my - y0) * k), R(ex), R(ey)); g.stroke();
    g.strokeStyle = '#7aa83a'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0), R(y0) - 1); g.quadraticCurveTo(R(x0 + (mx - x0) * k), R(y0 + (my - y0) * k) - 1, R(ex), R(ey) - 1); g.stroke();
    g.fillStyle = '#9ac850'; for (let i = 1; i < 8; i++) { const q = i / 8 * k, lx = (1 - q) * (1 - q) * x0 + 2 * (1 - q) * q * (x0 + (mx - x0) * k) + q * q * ex, ly = (1 - q) * (1 - q) * y0 + 2 * (1 - q) * q * (y0 + (my - y0) * k) + q * q * ey; g.fillRect(R(lx), R(ly) - 2 - (i % 2) * 2, 2, 1); } }
  /* THE GLINT (the house rule, claude/jenny3): a pulsing diamond over what the fight needs next - and, when it is off the screen, a chevron at the
     screen's edge pointing to it */
  function glint(g, wx, wy, cx, cy, time, col) { const x = R(wx - cx), y = R(wy - cy), VW = ctx.VW(), VH = ctx.VH(), p = 0.5 + 0.5 * Math.sin(time * 6);
    if (x < 6 || x > VW - 6 || y < 6 || y > VH - 6) { const qx = Math.max(8, Math.min(VW - 8, x)), qy = Math.max(10, Math.min(VH - 10, y)), dx = Math.sign(x - qx), dy = Math.sign(y - qy);
      g.globalAlpha = 0.55 + 0.4 * p; g.fillStyle = col; for (let i = 0; i < 4; i++) { if (dx) g.fillRect(qx - dx * i, qy - 3 + i, 1, 7 - 2 * i); if (dy) g.fillRect(qx - 3 + i, qy - dy * i, 7 - 2 * i, 1); } g.globalAlpha = 1; return; }
    const by = y - R(3 * p); g.globalAlpha = 0.6 + 0.4 * p; g.fillStyle = col; for (let i = 0; i < 4; i++) { g.fillRect(x - i, by - 3 + i, 2 * i + 1, 1); g.fillRect(x - i, by + 4 - i, 2 * i + 1, 1); }
    g.fillStyle = '#fff6c8'; g.fillRect(x, by, 1, 1); g.globalAlpha = 1; }
  /* THE LIT BOAT (claude/jenny3): while the lure is live the narrowboat's back GLOWS gold through the fog - a lit rim along its deck, a warm wash over
     it and the glint over it. k: how lit (the teach beat raises it with the fog) */
  function boatGlow(g, cx, cy, time, k) { const G = show.A, x0 = R(G.wreck.x0 - cx), w = R(G.wreck.x1 - G.wreck.x0), y = R(G.wreck.y - cy), p = 0.5 + 0.5 * Math.sin(time * 5);
    g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(0, y - 26, 0, y + 4); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(255,200,90,' + (0.32 * k * (0.7 + 0.3 * p)).toFixed(3) + ')');
    g.fillStyle = gr; g.fillRect(x0 - 4, y - 26, w + 8, 30); g.globalCompositeOperation = 'source-over';
    g.globalAlpha = k * (0.6 + 0.4 * p); g.fillStyle = '#ffd36b'; g.fillRect(x0, y - 1, w, 1); g.fillRect(x0, y, 1, 4); g.fillRect(x0 + w - 1, y, 1, 4); g.fillStyle = '#fff6c8'; for (let i = 6; i < w - 4; i += 14) g.fillRect(x0 + i + R(2 * Math.sin(time * 3 + i)), y - 2, 2, 1); g.globalAlpha = 1;
    if (k > 0.5) glint(g, (G.wreck.x0 + G.wreck.x1) / 2, G.wreck.y - 30, cx, cy, time, '#ffd36b'); }
  function netBlob(g, x, y, r, time) { for (let i = 0; i < 14; i++) { const q = i / 14 * Math.PI * 2 + time * 2; g.fillStyle = i % 3 ? '#3e6030' : '#9ac850'; g.fillRect(R(x + Math.cos(q) * r), R(y + Math.sin(q) * r * 0.5), 2, 1); g.fillRect(R(x + Math.cos(q) * r * 0.5), R(y + Math.sin(q * 1.3) * r * 0.3), 1, 1); } }
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
    if (a.k === 'slam') { const x = R(a.x - cx), y = R(a.fy - cy), fixed = k >= GT.slamFollow;   /* THE SLAM: a red mark on the timber where her claws will come - it follows you, then it is fixed (brighter); her arms raised over it */
      g.globalAlpha = (fixed ? 0.6 : 0.3) + 0.35 * pulse; g.fillStyle = '#ff6b6b'; g.fillRect(x - GT.slamR, y, GT.slamR * 2 + 1, 1); g.fillRect(x - GT.slamR, y - 3, 1, 3); g.fillRect(x + GT.slamR, y - 3, 1, 3);
      for (let i = 0; i < 3; i++) g.fillRect(x - 4 + i * 4, y - 26 + R(12 * k), 1, 4); g.globalAlpha = 1;
      limb(g, e.x - cx, e.y - GT.h + 12 - cy, (e.x + a.x) / 2 - cx, Math.min(e.y - GT.h - 20, a.fy - 40) - cy, time); claw(g, (e.x + a.x) / 2 - cx, Math.min(e.y - GT.h - 20, a.fy - 40) - cy, 1); }
    if (a.k === 'charge') { const dir = a.dir, x0 = R(e.x - cx), y = sy0(surf, cy);   /* THE CHARGE: she sinks, the water humps ahead of her and a red arrow runs along it */
      g.globalAlpha = 0.4 + 0.45 * pulse * k; g.fillStyle = '#ff6b6b'; const len = 40 + 80 * k; g.fillRect(dir > 0 ? x0 : x0 - R(len), y - 14, R(len), 1); g.fillRect(dir > 0 ? x0 : x0 - R(len), y + 7, R(len), 1);
      const ax = x0 + dir * R(len); g.fillRect(ax - dir * 6, y - 8, 1, 9); g.fillRect(ax - dir * 3, y - 6, 1, 5); g.fillRect(ax, y - 4, 1, 1); g.globalAlpha = 1;
      g.fillStyle = '#e8f4f0'; for (let i = 0; i < 6; i++) g.fillRect(x0 + dir * (6 + i * 5), y - 2 - ((time * 40 + i * 5) % (3 + 5 * k)), 2, 1);
      if (GM.lureLive(e, show)) { const G = show.A, edge = e.x < G.wreck.x0 ? G.wreck.x0 + 6 : G.wreck.x1 - 6, ex = R(edge - cx);   /* (claude/jenny3) THE LURE'S CHARGE LINE: a gold dashed line across the shallows from her to the boat's edge, where she will run aground */
        g.globalAlpha = 0.55 + 0.4 * pulse; g.fillStyle = '#ffd36b'; for (let xx = Math.min(x0, ex); xx < Math.max(x0, ex); xx += 6) g.fillRect(xx, y - 3, 3, 1);
        g.fillRect(ex - 1, y - 12, 3, 12); g.fillRect(ex - 4, y - 12, 9, 1); g.globalAlpha = 1; } }
    if (a.k === 'vine') { const x0 = a.dir > 0 ? a.ox : a.ox - a.reach, x1 = a.dir > 0 ? a.ox + a.reach : a.ox; band(g, 'low', a.fy, x0, x1, k, cx, cy, time);   /* (claude/jenny3) HER VINE: the red band at your feet, the rope traced out along the ledge to you, the coil in her hand */
      g.globalAlpha = 0.5 + 0.4 * pulse; g.fillStyle = '#7aa83a'; const len = a.reach * Math.min(1, k * 1.25); for (let i = 0; i < len; i += 5) g.fillRect(R(a.ox + a.dir * i - cx), R(a.fy - 3 - cy) + ((i / 5) & 1), 3, 1); g.globalAlpha = 1;
      netBlob(g, e.x - (e.face || 1) * 8 - cx, e.y - GT.h - 2 - cy, 4 + 3 * k, time); }
    if (a.k === 'net') { const x = R(a.x - cx), y = R(a.fy - cy), fixed = k >= GT.netFollow;   /* THE NET: a green dotted arc from her hand to where it will land, and the patch it will cover */
      g.globalAlpha = (fixed ? 0.6 : 0.3) + 0.3 * pulse; g.fillStyle = '#ff6b6b'; for (let i = -GT.netR; i <= GT.netR; i += 3) g.fillRect(x + i, y + ((i / 3) & 1), 2, 1);
      g.fillStyle = '#9ac850'; const hx = e.x - cx, hy = e.y - GT.h - cy; for (let i = 1; i < 10; i++) { const q = i / 10; g.fillRect(R(hx + (x - hx) * q), R(hy + (y - 10 - hy) * q - Math.sin(q * Math.PI) * 30), 1, 1); } g.globalAlpha = 1;
      netBlob(g, hx + (e.face || 1) * -8, hy - 4, 5, time); }
  }
  const sy0 = (surf, cy) => R(surf - cy);
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
    slamTell: () => { S_.gtDrip(); S_.gtHiss(); }, slam: () => S_.gtBurst(), stuck: () => { S_.gtPaddle(); S_.gtGrip(); }, wrench: () => S_.gtWeed(), dazed: () => { S_.gtBell(); S_.gtHiss(); },
    chargeTell: () => S_.gtBoil(), charge: () => S_.gtSurge(), netTell: () => S_.gtWeed(), net: () => S_.gtLash(),
    vineTell: () => { S_.gtWeed(); S_.gtHiss(); }, vine: () => S_.gtLash(), lureLit: () => S_.gtBell(),   /* (claude/jenny3: her vine; the boat lighting) */
    surgeTell: () => S_.gtBoil(), surge: () => S_.gtSurge(), stranded: () => S_.gtStrand(), drag: () => S_.gtDrag(),
    floodTell: () => { S_.gtSurge(); S_.gtBell(); }, fogTell: () => { S_.gtBell(); S_.gtDrain(); }, drainDone: () => S_.gtDrain(),
    hiss: () => S_.gtHiss(), paddle: () => S_.gtPaddle(), drain: () => S_.gtDrain(), weed: () => S_.gtWeed(), die: () => S_.gtBell(),
  };
  return H;
}
