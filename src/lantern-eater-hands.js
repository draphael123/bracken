// src/lantern-eater-hands.js - THE LANTERN-EATER'S HANDS (claude/lanterneater). src/lantern-eater.js is the fight, pure and proved in tools/lantern-eater.mjs;
// this binds it to the world: THE RAFT (a mover the heroes stand on, out on its water - claude/canal4's stage), its blows on the heroes (the gulp, the snap and
// the hunt in their zones, the swell along the deck, the water drawing you toward the lure), THE KEY (a blow at the keyed angle lands whole and snags the lure;
// the wrong one CLANKS and names it - TOO LOW / TOO HIGH, src/boss-read.js), the real lamp (it clanks: THAT IS A LAMP), the raft's lantern (phase three: struck,
// it dims or rises), the raft kept as the ground a hero is handed back to when he falls into its water, and the drawing: the basin's back wall and its lamps, the
// raft, its bulk under the water, the lights, the jaws, the tells, phase three's dark, OPEN and its clock, the grey ring of its ward.
// main.js calls: spawnBoss, owns, update, raftMover, strike, take, warded, cap, barName, camY, end, read, drawWall, drawBack, drawBoss, drawOver.
// Every teaching line goes through ctx.number with a line listed in src/hint-lines.js (the hint box).
import * as LM from './lantern-eater.js';
import * as LA from './redraw/lanterneater_art.js';
import { BOSS_PHASE } from './boss-music.js';   /* its theme's phases (the dark of phase three) */
const { LE } = LM;

export function makeLanternEaterHands(ctx) {
  let show = null, SK = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'lanterneater' ? ctx.L.arena : null);
  const skins = () => SK || (SK = LA.bakeBasinSkins());
  const R = Math.round;
  /* WHAT HURT: the health each of its blows took, by name (the pilots print it) */
  const hurt = (name, fn) => { const P = ctx.P, h0 = P.hp; const r = fn(); if (show) { const k = String(name), lost = Math.max(0, h0 - Math.max(0, P.hp)); show.hurt = show.hurt || {}; show.hurt[k] = (show.hurt[k] || 0) + lost; } return r; };
  H.show = () => show;
  H.on = () => !!(show && A());
  H.clear = () => { show = null; BOSS_PHASE.lanterneater = 1; };
  const raftMover = () => (ctx.movers || []).find(m => m.leRaft) || null;
  const cellI = (x, y) => y * ctx.LW() + x;
  /* THE CHAMBER WEARS THE BASIN'S STONE: the gates' oak, the landings' quoins, the bed's setts */
  function skinChamber(S) { const lk = S.lock, sx = lk.sx, Rw = lk.R, ex = sx + LM.STAGE.W - 1, T = ctx.T, K = skins(), D = LM.STAGE.depth;
    const put = (x, y, spr, t) => { const i = cellI(x, y), c = ctx.cellGet(i); if (t === undefined || c[0] === t) ctx.cellSet(i, c[0], spr); };
    for (let y = Rw - LM.STAGE.top; y < Rw; y++) for (const x of [sx, ex]) put(x, y, K.gate[(y + (x === sx ? 0 : 1)) % 3 === 0 ? 1 : (y > Rw - 4 ? 2 : 0)], T.SOLID);
    for (let i = 1; i <= LM.STAGE.land; i++) for (let y = Rw; y <= Rw + D; y++) { put(sx + i, y, y === Rw ? K.walk : K.quoin[y % 2], T.SOLID); put(ex - i, y, y === Rw ? K.walk : K.quoin[y % 2], T.SOLID); }
    for (let x = sx + 1; x < ex; x++) { put(x, Rw + D, K.bed[x % 3], T.SOLID); put(x, Rw + D + 1, K.bed2, T.SOLID); } }
  function skinDoors(S) { const lk = S.lock, K = skins(); for (const x of [S.wallL, S.wallR]) for (let y = lk.R - LM.STAGE.door; y < lk.R; y++) { const i = cellI(x, y), c = ctx.cellGet(i); if (c[0] === ctx.T.SOLID && c[1] !== K.gate[0] && c[1] !== K.gate[2]) ctx.cellSet(i, c[0], K.gate[y > lk.R - 4 ? 2 : 0]); } }
  /* SPAWNING: a fresh attempt is a fresh show, the raft moored at the west landing, the beast asleep under its water */
  H.spawnBoss = base => { const S = A(); if (!S) return null;
    show = LM.newShow(LM.geom(S.lock.sx, S.lock.R, ctx.TS)); LM.startFight(show); BOSS_PHASE.lanterneater = 1;
    skinChamber(S);
    const m = raftMover(); if (m) { m.x = show.raft.x; m.y = show.A.deck; m.w = show.raft.w; m.broken = false; }
    const e = LM.newLanternEater({ ...base, t: 'lanterneater', hp: ctx.EHP.lanterneater, maxHp: ctx.EHP.lanterneater, noGrav: true, markH: LE.markH, face: -1 });
    e.x = show.A.mid; e.y = show.A.surf + 30; return e; };
  H.owns = e => e.t === 'lanterneater';

  /* ---------- THE HEROES as the fight sees them ---------- */
  function heroes() { const m = raftMover(); return ctx.players.map(pp => ({ x: pp.x, y: pp.y, face: pp.face || 1, alive: ctx.upright(pp) && !pp.dead, ground: !!pp.ground, swim: !!pp.swim, onRaft: !!m && pp.onMover === m, pp })); }
  const keyed = (pp, key) => { pp.leKeys = pp.leKeys || new Map(); if (pp.leKeys.size > 60) pp.leKeys.clear(); if (pp.leKeys.has(key)) return true; pp.leKeys.set(key, 1); return false; };
  const SAYS = { '!': '#ffd36b', '!!': '#ff6b6b' };
  const C = (e, dt = 1 / 60) => ({
    heroes: heroes(),
    say: mk => { if (SAYS[mk]) ctx.number(e.x, e.y - e.h - 18, mk, SAYS[mk]); },
    number: (x, y, line, col) => ctx.number(x, y, line, col),
    sound: k => { const fn = SOUND[k]; if (fn) fn(); },
    raft: r => { const m = raftMover(); if (m) { m.x = r.x; m.w = r.w; m.y = show.A.deck + Math.round(r.bob); m.broken = false; } },
    /* a zone on the deck (the gulp, the hunt, the snap): a hero in it is hurt (no shield turns it); one rolling through is not under it */
    zone: ([x0, x1], [t, b], d, name, key) => { let n = 0; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead || P.dodge > 0) return;
      const hb = ctx.box(P); if (!(hb.r > x0 && hb.l < x1 && hb.b > t && hb.t < b) || keyed(pp, key)) return; n++;
      hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: true })); }); return n; },
    /* a band along the deck: LOW (a jump clears it) */
    band: (kind, [t, b], x0, x1, d, name, key, o = {}) => { let n = 0; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead) return;
      if (P.x < x0 || P.x > x1) return; const hb = ctx.box(P); if (!(hb.b > t && hb.t < b) || keyed(pp, key)) return;
      const res = hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: true })); if (res === 'hit') n++; if (o.push && !P.dead) P.vx = o.push; }); return n; },
    /* the water drawing toward its mouth: a hero on the raft near the lure is pulled toward it (he can walk against it) */
    pull: (x, r, sp) => { const m = raftMover(); for (const pp of ctx.players) if (m && pp.onMover === m && !pp.dead && Math.abs(pp.x - x) < r && Math.abs(pp.x - x) > 4) { pp.x += Math.sign(x - pp.x) * sp * dt; show.n.pulled = (show.n.pulled || 0) + 1; } },
  });

  /* ---------- ONE FRAME OF IT ---------- */
  H.update = (e, dt) => {
    if (!show) return; const S = A(); if (!S) return;
    if (!show.skinnedDoors) { show.skinnedDoors = true; skinDoors(S); }
    e.keyHit = false;   /* (the angle of a blow is read as it lands: src/boss-greed.js asks it in the same frame) */
    for (const pp of ctx.players) { if (pp.atk < 0) pp.leAirSwing = false; else if (pp.atk < 0.06 && !pp.ground && !pp.swim) pp.leAirSwing = true; }   /* a swing begun in the air stays a jump attack */
    const evs = LM.stepShow(e, show, dt, C(e, dt));
    for (const v of evs) {
      if (v.t === 'phase') { ctx.enrage(e); BOSS_PHASE.lanterneater = v.ph; }
      if (v.t === 'open') { ctx.shakeCam(5); ctx.hitstop && ctx.hitstop(0.06); ctx.burst(e.x, e.y - 8, 12, ['#ffd36b', '#e8b860', '#fff2b0'], 70, 0.5); }
      if (v.t === 'gulp' || v.t === 'hunt') { ctx.shakeCam(v.hit ? 6 : 4); ctx.burst(e.x, show.A.surf, 16, ['#e8f4f0', '#bfe6f5', '#1e2a30'], 110, 0.6); }
      if (v.t === 'snap') { ctx.shakeCam(4); ctx.burst(e.x, show.A.deck - 4, 10, ['#7a6440', '#d8c898', '#e8e4d0'], 80, 0.5); }
      if (v.t === 'surface') ctx.burst(show.jaws.x, show.A.surf, 14, ['#e8f4f0', '#bfe6f5'], 70, 0.5);
      if (v.t === 'swell') ctx.burst(show.swell ? show.swell.x : e.x, show.A.surf, 10, ['#e8f4f0', '#7cc8c8'], 70, 0.4);
      if (v.t === 'decoy') ctx.burst(v.x, show.A.surf, 8, ['#e8f4f0', '#bfe6f5'], 60, 0.4);
    }
    /* THE RAFT IS THE GROUND A FALL IN ITS WATER HANDS YOU BACK TO (main.js L.waterHurts reads P.safe) */
    const r = show.raft, m = raftMover(); for (const pp of ctx.players) if (m && pp.onMover === m && !pp.dead) pp.safe = { x: Math.max(r.x + 16, Math.min(r.x + r.w - 16, pp.x)), y: show.A.deck - 2, L: ctx.L };
    H.lastEvents = evs;
  };

  /* ---------- THE RAFT: main.js moves the leRaft mover through here; the show says where it is ---------- */
  H.raftMover = (m, dt) => { if (!show) { m.broken = false; return; } const r = show.raft;
    if (show.dead) { const d = r.to - r.x; if (Math.abs(d) > 0.5) r.x += Math.sign(d) * Math.min(Math.abs(d), LE.raftSpeed * dt); }   /* (after its death: to the east landing) */ m.x = r.x; m.w = r.w; m.y = show.A.deck + Math.round(r.bob); m.broken = false; };

  /* ---------- A HERO'S SWING ON THE REAL LAMP (it clanks) OR THE RAFT'S LANTERN (phase three: dim it or raise it) ---------- */
  H.strike = hb => {
    if (!show || !hb) return; const e = ctx.boss; if (!e || e.t !== 'lanterneater' || !e.alive || !ctx.bossActive) return;
    for (const q of LM.strikeAt(e, show, hb, ctx.P.hitSet)) {
      if (q.what === 'lamp') { ctx.SFX.clank(); ctx.sparks(q.x, q.y - 10, -(ctx.P.face || 1), 4); ctx.word(q.x, q.y - 34, 'A LAMP', '#d8e2ee');
        if (!show.told.lamp) { show.told.lamp = true; ctx.number(q.x, q.y - 40, 'THAT IS A LAMP: IT FLICKERS. THE LURE SWAYS', '#9aa39a'); } }
      if (q.what === 'lantern' && LM.blowAngle(ctx.P) !== 'high') { const r = LM.strikeLantern(e, show, C(e));   /* (a blow from the deck: a jump or the rising cut at the lure over it never dims it by chance) */ if (r) { const lx = LM.lanternX(show); ctx.burst(lx, show.A.deck - 26, 6, r === 'raise' ? ['#ffcf6a', '#fff2b0'] : ['#5a5048', '#7a3a1a'], 40, 0.3); } }
    }
  };
  /* ---------- THE KEY: what a blow takes off it, by its angle; the right one in reach lands whole (and snags the lure); the wrong one CLANKS and says so ---------- */
  H.take = (e, blow) => { if (!show || !blow) return LM.leTake(e);   /* (a burn tick, or anything not a hero's blow: open or warded, never the key) */
  const ang = LM.blowAngle(ctx.P), k = LM.leTakeAt(e, show, ang); e.lastAngle = ang;
    if (k >= 1 && !LM.leOpen(e)) { e.keyHit = true; show.n.keyHits = (show.n.keyHits || 0) + 1; if (LM.snag(e, show) === 'jerk') { SOUND.jerk(); ctx.burst(e.x, e.y - 12, 6, ['#ffd36b', '#e8b860'], 50, 0.3); if (!show.told.jerk) { show.told.jerk = true; ctx.number(e.x, e.y - 40, 'IT JERKS ON ITS STALK: AGAIN, BEFORE IT BITES', '#ffd36b'); } } } return k; };
  H.warded = e => { if (!show) return; show.n.clank++; const keyed2 = LM.keyedNow(e), word = keyed2 ? LM.KEY_WORD[LM.keyOf(e)] : 'WARDED';
    ctx.turned(e, ctx.P.x, word);
    if (keyed2 && !show.told['turn' + e.phase]) { show.told['turn' + e.phase] = true; ctx.number(e.x, e.y - 50, LM.keyOf(e) === 'high' ? 'TOO LOW: STRIKE THE LURE HIGH - JUMP, OR UP AND STRIKE' : 'TOO HIGH: SWEEP ITS GUMS LOW - DOWN AND STRIKE', '#ffd36b'); } };
  H.cap = (e, dmg) => { const d = LM.leCap(e, dmg); if (d < dmg && !(e.capSaid > ctx.time)) { e.capSaid = ctx.time + 3; ctx.number(e.x, e.y - 60, 'THAT OPENING IS SPENT: IT TEARS FREE', '#9aa39a'); } return d; };
  H.barName = b => { const N = 'THE LANTERN-EATER'; if (!show) return N; if (LM.leOpen(b)) return N + '  OPEN'; if (b.mode === 'ward') return N + '  WARDED';
    if (b.phase === 3 && !show.lantern.lit) return N + '  YOUR LIGHT IS DIM'; return N + '  ' + (LM.keyOf(b) === 'high' ? 'HIT HIGH' : 'HIT LOW'); };
  H.camY = ty => { const S = A(); if (!S) return ty; const VH = ctx.VH(), top = S.y0 - 8, bot = (S.lock.R + LM.STAGE.depth + 1) * ctx.TS;
    if (bot - top <= VH) return (top + bot) / 2 - VH / 2;
    return Math.max(bot - VH, Math.min(ty, top)); };
  /* ITS DEATH: it sinks under the raft, the lamps come back, and the raft drifts to the east landing (the way on) */
  H.end = e => { if (!show) return; show.lights = []; show.jaws = null; show.snap = null; show.swell = null; show.gulp = null; show.raft.to = show.A.moorE; show.dead = 0.001; show.lantern.lit = true; e.y = show.A.surf + 30; SOUND.die(); };
  H.read = () => show && { mode: ctx.boss && ctx.boss.mode, phase: ctx.boss && ctx.boss.phase, part: ctx.boss && ctx.boss.part, n: { ...show.n }, cycle: show.cycle, lit: show.lantern.lit, dark: +show.dark.toFixed(2),
    lights: show.lights.map(L => ({ kind: L.kind, x: Math.round(L.x), y: Math.round(L.y) })), jaws: show.jaws && { ...show.jaws }, snap: show.snap && { x: Math.round(show.snap.x), fixed: show.snap.fixed },
    raft: { x: Math.round(show.raft.x), w: show.raft.w }, hurt: { ...(show.hurt || {}) } };

  /* ================= DRAWING ================= */
  const lampXs = G => [G.x0 + 40, G.mid - 70, G.mid + 70, G.x1 - 40];
  /* THE BASIN'S BACK WALL (behind the tiles): coursed stone, slimed below the water, the night over the coping, and the basin's own lamps on their posts */
  H.drawWall = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), G = show.A, TS = ctx.TS, x0 = R(G.x0 - cx), w = R(G.x1 - G.x0), top = R(G.top + 2 * TS - cy), bed = R(G.bed - cy), sf = R(G.surf - cy);
    if (x0 > ctx.VW() || x0 + w < 0) return;
    g.fillStyle = '#2c3034'; g.fillRect(x0, top, w, bed - top);
    for (let y = 0; y < bed - top; y += 8) { const row = (y / 8) | 0; g.fillStyle = '#1e2226'; g.fillRect(x0, top + y, w, 1); for (let x = (row % 2) * 12; x < w; x += 24) g.fillRect(x0 + x, top + y, 1, 8); }
    g.fillStyle = 'rgba(14,24,30,0.5)'; g.fillRect(x0, sf - 24, w, bed - sf + 24); g.fillStyle = 'rgba(90,130,120,0.45)'; g.fillRect(x0, sf - 2, w, 2);   /* the tide-mark */
    g.fillStyle = '#4a4c50'; g.fillRect(x0, top - 3, w, 3); g.fillStyle = '#6a6c70'; g.fillRect(x0, top - 3, w, 1);
    const out = show.dark > 0.5 || (ctx.boss && ctx.boss.phase === 3 && ctx.boss.alive && !show.dead); for (const lx of lampXs(G)) LA.drawBasinLamp(g, lx - cx, sf - 26, out, time); };
  /* THE RAFT (before the bodies) and its bulk under the water */
  H.drawBack = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), G = show.A, r = show.raft, y = R(G.deck + r.bob - cy), x = R(r.x - cx), w = r.w;
    if (x > ctx.VW() + 40 || x + w < -40) return;
    const e = ctx.boss && ctx.boss.t === 'lanterneater' && ctx.boss.alive ? ctx.boss : null;
    if (e && !show.dead) { const near = ['surface', 'jaws', 'snapTell', 'swellTell', 'swell', 'gulpTell', 'huntTell'].includes(e.mode) ? 1 : e.mode === 'sleep' ? 0.1 : 0.4;
      LA.drawBulk(g, (e.part === 'lure' ? (show.lure ? show.lure.x : e.x) : e.x) - cx, G.surf - cy, near, e.face || 1, time); }
    LA.drawRaft(g, x, y, w);
    const lx = LM.lanternX(show) - cx; LA.drawRaftLantern(g, lx, y, show.lantern.lit, time, show.dark > 0.3);
  };
  /* THE BEAST'S VISIBLE PART (in the bodies' pass): the jaws at the rail, clamped on the timber, snapping up */
  H.drawBoss = (g, e, cx, cy, time) => {
    if (!show || !e.alive) return; const G = show.A, dy = R(G.deck + show.raft.bob - cy), m = e.mode;
    if (show.jaws && (m === 'jaws' || m === 'snapTell')) { const gape = m === 'snapTell' ? 1 - 0.6 * Math.max(0, e.modeT) / (e.modeLen || 1) : 0.6 + 0.1 * Math.sin(time * 3); LA.drawJaws(g, show.jaws.x - cx, dy, show.jaws.side, gape, time, m === 'jaws'); }
    if (m === 'surface' && show.jaws) { const k = 1 - Math.max(0, e.modeT) / LE.surfaceT; LA.drawBoil(g, show.jaws.x - cx, G.surf - cy, 18, k, time); }
    if (m === 'open' && e.part === 'jaws') LA.drawClamped(g, e.x - cx, dy, time);
    if ((m === 'gulp' || m === 'hunt' || (m === 'snapTell' && false))) LA.drawGulp(g, e.x - cx, dy + 4, 1 - Math.max(0, e.modeT) / (e.modeLen || 0.3), time);
    if (m === 'snap' || (m === 'sink' && e.modeT > LE.sinkT - 0.15)) LA.drawGulp(g, e.x - cx, dy + 4, 0.5, time);
  };
  /* ---------- OVER EVERYTHING: phase three's dark, the lights, the tells, the key, OPEN and its clock, the ward ---------- */
  let DARK = null;
  H.drawOver = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), G = show.A, e = ctx.boss && ctx.boss.t === 'lanterneater' && ctx.boss.alive ? ctx.boss : null, pulse = 0.5 + 0.5 * Math.sin(time * 18), dy = R(G.deck + show.raft.bob - cy), sf = R(G.surf - cy);
    g.fillStyle = 'rgba(16,30,40,0.25)'; g.fillRect(R(G.pool.x0 - cx), sf, R(G.pool.x1 - G.pool.x0), R(G.bed - G.surf));   /* its water is black-green */
    if (!e) return;
    /* PHASE THREE'S DARK: every lamp snuffed; your lantern's light the only hole in it (wide lit, an ember dimmed) */
    if (show.dark > 0.02) { const VW = ctx.VW(), VH = ctx.VH(); if (!DARK || DARK.width !== VW || DARK.height !== VH) DARK = ctx.makeCanvas(VW, VH);
      if (DARK) { const dg = DARK.getContext('2d'); dg.globalCompositeOperation = 'source-over'; dg.clearRect(0, 0, VW, VH); dg.fillStyle = 'rgba(2,4,8,' + (0.88 * show.dark).toFixed(3) + ')'; dg.fillRect(0, 0, VW, VH);
        dg.globalCompositeOperation = 'destination-out'; const hole = (x, y, r) => { const gr = dg.createRadialGradient(x, y, r * 0.3, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); dg.fillStyle = gr; dg.fillRect(x - r, y - r, r * 2, r * 2); };
        hole(LM.lanternX(show) - cx, dy - 16, show.lantern.lit ? 120 : 34); for (const pp of ctx.players) if (!pp.dead) hole(pp.x - cx, pp.y - 10 - cy, 22);
        for (const L of show.lights) hole(L.x + (L.sway || 0) - cx, L.y - 11 - cy, 30); dg.globalCompositeOperation = 'source-over'; g.drawImage(DARK, 0, 0); } }
    /* THE LIGHTS: the lamp on its chain (it flickers), the lure on its stalk (it sways) - and under each, while they dangle, the UP chevrons (the key: HIT HIGH) */
    const stalkX = L => { const [x0, x1] = LM.raftEnds(show); return L.x < (x0 + x1) / 2 ? Math.max(G.pool.x0 + 6, x0 - 26) : Math.min(G.pool.x1 - 6, x1 + 26); };
    for (const L of show.lights) { const x = L.x - cx, y = L.y - cy;
      if (L.kind === 'lamp') LA.drawLamp(g, x, y, L.flick ?? 1, time); else LA.drawLure(g, x, y, L.sway || 0, stalkX(L) - cx, sf, time, e.mode === 'open', e.mode === 'open' || e.mode === 'ward' || (show.snagHits > 0 && e.mode === 'gulpTell'));
      if ((e.mode === 'gulpTell' || e.mode === 'huntTell') && e.part === 'lure') LA.drawKey(g, x + (L.kind === 'lure' ? L.sway : 0), y + 8, -1, time); }
    /* THE GULP / THE HUNT coming: the water boils under it, a red zone on the deck */
    if (e.mode === 'gulpTell' && show.gulp) { const k = 1 - Math.max(0, e.modeT) / (e.modeLen || 1); LA.drawBoil(g, show.gulp.x - cx, sf, LE.gulpR, k, time); LA.drawZone(g, show.gulp.x - LE.gulpR - cx, show.gulp.x + LE.gulpR - cx, dy, k, time); }
    if (e.mode === 'huntTell' && show.hunt) { const k = 1 - Math.max(0, e.modeT) / (e.modeLen || 1); LA.drawBoil(g, show.hunt.x - cx, sf, LE.huntR, k, time); LA.drawZone(g, show.hunt.x - LE.huntR - cx, show.hunt.x + LE.huntR - cx, dy, k, time); }
    /* THE SNAP's mark: it follows you, then fixes (brighter) */
    if (e.mode === 'snapTell' && show.snap) { const k = show.snap.fixed ? 1 : 0.3; LA.drawZone(g, show.snap.x - LE.snapR - cx, show.snap.x + LE.snapR - cx, dy, k, time);
      g.globalAlpha = 0.5 + 0.4 * pulse; g.fillStyle = '#ff6b6b'; const jx = show.jaws.x - cx, sx = show.snap.x - cx; g.fillRect(R(Math.min(jx, sx)), dy - 12, R(Math.abs(sx - jx)), 1); g.globalAlpha = 1; }   /* the line of its lunge */
    /* THE SWELL told: red lines along the deck from where it comes, then the swell humping the deck */
    if (show.swell) { const s = show.swell, x = R(s.x - cx);
      if (s.st === 'tell') { const k = 1 - Math.max(0, e.modeT) / (e.modeLen || 1), len = 40 + 120 * k; g.globalAlpha = 0.4 + 0.45 * pulse * k; g.fillStyle = '#ff6b6b'; g.fillRect(s.dir > 0 ? x : x - R(len), dy - 14, R(len), 1); g.fillRect(s.dir > 0 ? x : x - R(len), dy + 3, R(len), 1); g.globalAlpha = 1; }
      else { g.fillStyle = '#e8f4f0'; g.fillRect(x - 10, dy - 14, 20, 4); g.fillStyle = '#bfe6f5'; g.fillRect(x - 14, dy - 10, 28, 6); g.fillStyle = '#7cc8c8'; g.fillRect(x - 18, dy - 4, 36, 4); } }
    /* THE COPIES of your light it bites at, dimmed */
    for (const d of show.decoys) LA.drawDecoy(g, d.x - cx, sf, d.t, time);
    /* OPEN, and its clock: the gold ring and the timer bar (B10), the green line the opening's share left */
    if (LM.leOpen(e)) { const full = e.openLen || LE.openT, k = Math.max(0, e.modeT) / full, ex = R(e.x - cx), oy = R(e.y - cy - e.h / 2);
      g.globalAlpha = 0.5 + 0.4 * pulse; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(ex, oy, 20, 20, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = R(e.part === 'lure' ? e.y - cy + 8 : dy + 10); g.fillStyle = '#1e1624'; g.fillRect(ex - 16, by, 32, 5); g.fillStyle = '#ffd36b'; g.fillRect(ex - 15, by + 1, R(30 * k), 1); g.fillStyle = '#8fd160'; g.fillRect(ex - 15, by + 3, R(30 * Math.max(0, e.capLeft || 0) / Math.max(1, e.capLen || 1)), 1);
      ctx.text('OPEN', ex, oy - 28, pulse > 0.5 ? '#fff6c8' : '#ffd36b', 'center', 6); }
    /* ITS WARD (B3): a slow grey ring where it drew back */
    if (e.mode === 'ward') { const k = Math.max(0, e.modeT) / LE.wardT, ex = R(e.x - cx), oy = R(e.part === 'lure' ? e.y - cy - e.h / 2 : sf); g.globalAlpha = 0.25 + 0.4 * k; g.strokeStyle = '#9aa39a'; g.lineWidth = 1; g.beginPath(); g.ellipse(ex, oy, 18, e.part === 'lure' ? 18 : 6, 0, time * 2, time * 2 + Math.PI * 2 * k); g.stroke(); g.globalAlpha = 1; }
    if (show.dead) show.dead = Math.min(1, show.dead + 1 / 120);
  };

  /* ---------- ITS SOUNDS (src/audio.js: le*) ---------- */
  const S_ = ctx.SFX, SOUND = {
    lights: () => S_.leLure(), jerk: () => S_.leSnag(), gulpTell: () => S_.leBoil(), gulp: () => S_.leGulp(), snag: () => S_.leSnag(), stuck: () => S_.leSnag(), ward: () => S_.leSink(),
    surface: () => S_.leBoil(), snapTell: () => S_.leTeeth(), snap: () => S_.leSnap(), huntTell: () => { S_.leBoil(); S_.leGrowl(); }, hunt: () => S_.leGulp(),
    swellTell: () => S_.leGrowl(), swell: () => S_.leSwell(), decoy: () => S_.leDecoy(), dim: () => S_.leLantern(), raise: () => S_.leLantern(),
    phase: () => { S_.leGrowl(); S_.leBoil(); }, snuff: () => S_.leSnuff(), wake: () => { S_.leGrowl(); S_.leLure(); }, die: () => S_.leSink(),
  };
  return H;
}
