// src/fallen-sun-hands.js - THE FALLEN SUN PRIEST's HANDS (claude/suntemple, 11-06, the OPUS GREYBOX). src/fallen-sun.js is the fight (pure); this binds it to the
// world: his told blows on the heroes (keyed once a blow; a shield turns the yellow ones), THE SANCTUM's LIGHT (an L.sunRooms room, 'sanctum', run and drawn by
// src/sunroom-hands.js: his SHUTTERS set its window sources `off`, he turns its MIRRORS back), the CORDS (a hero's blow on one drops its shutter: strike()), and the
// drawing: HIS BODY is the hero's own sheet (main.js SPR.fallensun, the generic enemy draw x FS.scale, frame = fsFrame); over it his beam (src/beam-path.js: dotted
// while told, solid while it burns), the flare, his consecrated ground, the sunfall ring, SUNRISE, the shutters and cords, HIS RADIANCE (a sun over him filling and
// draining - the read of the rule) and the B10 read (OPEN = a gold ring + timer; WARDED = a pale ring and the word).
// THE BEAT (plan s5): he falls, his sun-disc rolls to your feet, the windows relight; 'THE DESERT PRIEST WILL WALK WITH YOU' (main.js's boss-down case calls end()).
// main.js calls: spawnBoss, owns, on, update, take, frame, drawOver, barName, end, read, show, clear, strike.
import * as FSM from './fallen-sun.js';
import * as BP from './beam-path.js';
import { BOSS_PHASE } from './boss-music.js';
const { FS } = FSM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), swing: s => (s.slash || s.swing || s.heavy)(), slam: s => (s.heavy || s.slash)(),
  glow: s => (s.chime || s.bell || s.tell)(false), beam: s => (s.lightFull || s.judgement || s.chime || s.bell)(), flare: s => (s.judgement || s.aegis || s.chime || s.bell)(),
  leap: s => (s.pJump || s.whoosh || s.slash)(), falter: s => (s.crack || s.clank)(), shutter: s => (s.clank || s.thud)(), rise: s => (s.judgement || s.roar || s.bell)() };

export function makeFallenSunHands(ctx) {
  let S = null, beat = null;
  const H = {}, R = Math.round;
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'fallensun' ? ctx.L.arena : null);
  const room = () => (ctx.srh && ctx.srh() ? ctx.srh().room('sanctum') : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'fallensun';
  H.clear = () => { S = null; beat = null; BOSS_PHASE.fallensun = 1; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.fsKeys = pp.fsKeys || new Map(); if (pp.fsKeys.size > 80) pp.fsKeys.clear(); if (pp.fsKeys.has(key)) return true; pp.fsKeys.set(key, 1); return false; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'fallensun' ? e : null; };

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = FSM.newFight(FSM.geom(Ar, ctx.TS)); BOSS_PHASE.fallensun = 1; beat = null;
    const hp = Math.round(ctx.EHP.fallensun || FS.hp);
    const e = { ...base, t: 'fallensun', w: FS.w, h: FS.h, hp, maxHp: hp, noGrav: true, markH: FS.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, rad: S.rad, vx: 0 };
    e.y = S.G.floorY; for (const pp of ctx.players) pp.fsKeys = null; return e; };

  /* ---------- THE WORLD AS HE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, air: !pp.ground && !pp.climb, alive: ctx.upright(pp) && !pp.dead, swinging: (pp.atk || 0) > 0 || (pp.charge || 0) > 0, pp }));
  function world(e) {
    const rm = room();
    return {
      lit: b => (ctx.srh && ctx.srh() ? ctx.srh().litBox(b, 'sanctum') : true),
      mirrors: () => (rm ? rm.mirrors.map((m, i) => ({ i, x: (m.x + 0.5) * ctx.TS, state: m.state, init: rm.def.mirrors[i].state })) : []),
      setMirror: (i, st) => { if (rm && rm.mirrors[i]) rm.mirrors[i].state = st; },
      number: (x, y, t, col) => ctx.number(x, y, t, col), word: t => (ctx.say ? ctx.say(t, 'THE FALLEN SUN PRIEST', '#ffd36b', 1.8) : null),
      sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), music: ph => { BOSS_PHASE.fallensun = ph; },
      mark: m => ctx.number(e.x, e.y - FS.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'), rng: Math.random,
      fx: (k, x, y, r) => {
        if (k === 'open') { ctx.ring(x, y - 22, 34, '#ffd36b'); ctx.burst(x, y - 20, 14, ['#ffd36b', '#8a7a5a', '#3a3040'], 70, 0.6); }
        else if (k === 'ward') ctx.ring(x, y - 22, 38, '#c8d8e8');
        else if (k === 'flare') { ctx.ring(x, y - 14, r || FS.flare.r, '#ffffff'); ctx.burst(x, y - 14, 18, ['#ffffff', '#fff6c8', '#ffd36b'], 110, 0.5); }
        else if (k === 'consec' || k === 'pillar') ctx.burst(x, y - 4, 14, ['#fff6c8', '#ffd36b'], 80, 0.6);
        else if (k === 'turn') ctx.burst(x, y, 8, ['#fff6c8', '#c89a4a'], 60, 0.4);
        else if (k === 'rise') ctx.burst(x, y - 30, 30, ['#ffffff', '#fff6c8', '#ffd36b'], 140, 0.9);
        else if (k === 'ring') ctx.ring(x, y - 4, r || FS.fall.r, '#ff6b6b'); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (o.who && o.who.pp !== pp) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp; let res; hurt(name, () => { res = ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock }); }); if (P.hp < hp0) any = true;
          if (o.blockable && ctx.answered && ctx.answered(res)) FSM.blowTurned(e, S, world(e), true); }); return any; },
    };
  }
  /* THE SHUTTERS ARE THE ROOM'S SOURCES: a shut window is a source `off` (src/light.js trace skips it) */
  const syncShutters = () => { const rm = room(); if (!rm || !S) return; rm.def.sources.forEach((s, i) => { s.off = (S.shut[i] || 0) > 0; }); };

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; ctx.number(e.x, e.y - 84, 'THE FALLEN SUN PRIEST', '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 140, 'THE LIGHT IS HIS: SHUT A WINDOW, TURN A MIRROR - PUT HIM IN SHADE', '#ffd36b'); }
    syncShutters();
    FSM.stepFallen(e, S, dt, heroes(), world(e));
    syncShutters();
    e.phase = S.ph; e.rad = S.rad;
  };
  /* A HERO'S BLOW on a CORD (main.js passes every landed blow box, any seat): its shutter falls */
  H.strike = hb => { const e = live(); if (!S || !e || !ctx.bossActive || !hb) return;
    for (const cd of S.G.cords) if (hb.l < cd.r && hb.r > cd.l && hb.t < cd.b && hb.b > cd.t && FSM.cordStruck(e, S, world(e), cd.i)) { ctx.sparks(cd.x, cd.t + 6, 1, 4); syncShutters(); } };
  /* A BLOW ON HIM: src/fallen-sun.js blowOn - his disc by angle on guard (x0.4), whole committed, x1.7 open, x0.4 in the ward */
  H.take = (e, dmg, blow) => { if (!S) return dmg; const P = ctx.hero(), t = ctx.time();
    const r = FSM.blowOn(e, S, world(e), dmg, P.x);
    if (r.read === 'guard') { e.guardFx = 0.25; e.guardWord = S.n.guarded < 6 ? ['HIS DISC', 'PUT HIM IN SHADE'][S.n.guarded % 2] : 'HIS DISC'; ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x + (Math.sign(P.x - e.x) || 1) * 12, e.y - 22, Math.sign(P.x - e.x) || 1, 5); }
    else if (r.read === 'ward') { e.guardFx = 0.25; e.guardWord = 'WARDED'; ctx.sfx.clank && ctx.sfx.clank(); }
    else e.angleHit = t;
    return r.dmg; };
  H.frame = e => FSM.fsFrame(e);
  H.barName = e => 'THE FALLEN SUN PRIEST' + (FSM.fsOpen(e) ? '  OPEN' : S && S.ward > 0 ? '  WARDED' : S && S.sunrise > 0 ? '  SUNRISE' : '');
  /* THE BEAT: he falls; his sun-disc rolls to your feet; the windows relight; the card */
  H.end = e => { if (!S) return; S.beam = null; S.leap = null; S.patches = []; S.sunrise = 0; S.shut = S.shut.map(() => 0); syncShutters();
    const rm = room(); if (rm) rm.mirrors.forEach((m, i) => { m.state = rm.def.mirrors[i].state; });
    const P = ctx.hero(); beat = { t: ctx.time(), x0: e.x, x1: P ? P.x : e.x, y: S.G.floorY };
    if (ctx.say) ctx.say('THE DESERT PRIEST WILL WALK WITH YOU', 'THE SUN-DISC IS YOURS: HE WAITS IN THE STORE', '#ffd36b', 4);
    BOSS_PHASE.fallensun = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, rad: +S.rad.toFixed(2), lit: S.lit, shut: S.shut.map(t => +t.toFixed(1)), sunrise: +S.sunrise.toFixed(1), ward: S.ward, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (over him and the room; the sanctum's sun itself is src/sunroom-hands.js's) ---------- */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G, e = ctx.boss;
    const fy = R(G.floorY - cy), blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    /* THE WINDOWS' SHUTTERS (a dark slab in a shut window, its countdown) and THE CORDS (a tassel on a line from the roof: strike it) */
    G.windows.forEach((wx, i) => { const x = R(wx - cx), y = R(G.roofY - ctx.TS - cy), sh = S.shut[i] || 0;
      if (sh > 0) { g.fillStyle = '#2a2230'; g.fillRect(x - 8, y, 16, ctx.TS); g.fillStyle = sh <= FS.shut.warn && Math.floor(time * 10) % 2 ? '#ff9a5c' : '#5a4a3a'; g.fillRect(x - 8, y + ctx.TS - 2, R(16 * Math.min(1, sh / FS.shut.t[0])), 2); }
      const cd = G.cords[i], cxp = R(cd.x - cx); g.fillStyle = '#8a6a3a'; g.fillRect(cxp, R(G.roofY - cy), 1, R(cd.t - G.roofY) + 2);
      g.fillStyle = sh > 0 ? '#5a4a3a' : '#c8a050'; g.fillRect(cxp - 2, R(cd.t - cy) + 2, 5, 7); g.fillStyle = '#fff6c8'; if (sh <= 0 && Math.sin(time * 4 + i) > 0.6) g.fillRect(cxp, R(cd.t - cy) + 3, 1, 1); });   /* (a glint on a cord you can pull) */
    /* HIS CONSECRATED GROUND */
    for (const p of S.patches) { const x = R(p.x - cx); g.globalAlpha = 0.25 + 0.1 * Math.sin(time * 6); g.fillStyle = '#ffd36b'; g.fillRect(x - p.r, fy - 3, p.r * 2, 3); g.globalAlpha = 1;
      for (let k = -p.r; k <= p.r; k += 8) { g.fillStyle = '#fff6c8'; g.fillRect(x + k, fy - 4 - R(((time * 20 + k) % 8)), 1, 2); } }
    if (!e || e.t !== 'fallensun' || !e.alive) { drawBeat(g, cx, cy, time); return; }
    const x = R(e.x - cx), y = R(e.y - cy), m = e.mode;
    /* THE SUNBEAM: told = a dotted line along his row to where it ends; released = the beam */
    if (S.beam && (m === 'beamTell' || m === 'beam')) { const by = e.y - (FS.beam.y0 + FS.beam.y1) / 2, p = BP.path([[e.x + (S.beam.dir) * 8, by], [S.beam.end, by]]);
      BP.drawBeam(g, p, cx, cy, time, m === 'beam' ? { kind: S.sunrise > 0 ? 'dawn' : 'sun', lit: true, ring: true } : { kind: 'sun', preview: true, a: 0.5 + 0.5 * (1 - e.modeT / FS.beam.tell) }); }
    if (m === 'flareTell') { const k = 1 - e.modeT / FS.flare.tell; g.globalAlpha = 0.3 + 0.5 * k; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(x, y - 14, FS.flare.r * (0.4 + 0.6 * k), 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    if (S.leap && (m === 'fallTell' || m === 'fall')) { const lx = R(S.leap.x - cx); g.strokeStyle = blink; g.beginPath(); g.ellipse(lx, fy - 2, FS.fall.r, 4, 0, 0, Math.PI * 2); g.stroke(); }
    if (m === 'riseTell' || S.sunrise > 0) { g.globalAlpha = S.sunrise > 0 ? 0.1 + 0.04 * Math.sin(time * 4) : 0.15 * (1 - e.modeT / FS.rise.tell); g.fillStyle = '#ffe8a0'; g.fillRect(R(G.x0 - cx), R(G.roofY - cy), R(G.x1 - G.x0), R(G.floorY - G.roofY)); g.globalAlpha = 1;
      if (S.sunrise > 0) ctx.text('SUNRISE ' + Math.ceil(S.sunrise), R((G.x0 + G.x1) / 2 - cx), R(G.roofY - cy) + 6, '#ff6b6b', 'center', 6); }
    if (m === 'turnTell') ctx.text('HE TURNS THE LIGHT', x, y - 78, '#ffd36b', 'center', 6);
    if (m === 'seek') ctx.text('HE SEEKS THE LIGHT', x, y - 78, '#fff6c8', 'center', 5);
    if (m === 'sleep') ctx.text('Z', x + 8 * (e.face || 1), y - 54 - R((time * 8) % 8), '#c8d8e8', 'center', 6);
    if (e.guardFx > 0) e.guardFx = Math.max(0, e.guardFx - 1 / 60);
    /* HIS RADIANCE: a sun over him - the disc fills gold in the light and greys as it drains; a LIT / SHADE word under it (the rule's read) */
    const by = R(e.y - FS.h * FS.scale - 16 - cy), bx = Math.max(30, Math.min(ctx.VW() - 30, x)), rr = 6;
    g.fillStyle = '#1b1626'; g.beginPath(); g.arc(bx, by, rr + 1, 0, Math.PI * 2); g.fill();
    g.fillStyle = S.rad > 0.33 ? '#ffd36b' : '#b0a080'; g.beginPath(); g.moveTo(bx, by); g.arc(bx, by, rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * S.rad); g.closePath(); g.fill();
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + time * (S.lit ? 1.2 : 0.2); g.fillStyle = S.lit ? '#fff6c8' : '#5a5060'; g.fillRect(R(bx + Math.cos(a) * (rr + 3)), R(by + Math.sin(a) * (rr + 3)), 1, 1); }
    ctx.text(S.sunrise > 0 ? 'SUNRISE' : S.lit ? 'IN HIS LIGHT' : 'IN SHADE', bx, by + 9, S.lit ? '#ffd36b' : '#9aa3c0', 'center', 5);
    /* THE READ (B10) */
    const yy = R(e.y - FS.h * FS.scale / 2 - cy);
    if (FSM.fsOpen(e)) { const kk = Math.max(0, e.open / FS.open.t);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, yy, 28, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('HIS LIGHT FAILS', x, by - 14, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by - 7, 36, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 18, by - 7, R(36 * kk), 3); }
    else if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, yy, 30, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, by - 14, '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, by - 24 - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  /* THE BEAT's drawing: his sun-disc rolling from where he fell to your feet, rays turning */
  function drawBeat(g, cx, cy, time) { if (!beat) return; const k = Math.min(1, (time - beat.t) / 1.4); if (time - beat.t > 6) { beat = null; return; }
    const x = R(beat.x0 + (beat.x1 - beat.x0) * (1 - (1 - k) * (1 - k)) - cx), y = R(beat.y - 6 - cy) - R(Math.abs(Math.sin(k * Math.PI * 3)) * 6 * (1 - k));
    g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff6c8'; g.fillRect(x - 1, y - 1, 2, 2);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + time * 3 * (1 - k * 0.8); g.fillRect(R(x + Math.cos(a) * 8), R(y + Math.sin(a) * 8), 1, 1); } }
  return H;
}
