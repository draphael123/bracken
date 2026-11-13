// src/kraken3-hands.js - THE KRAKEN 3 IN THE GAME (claude/kraken3, OPUS greybox 2026-11-07). src/kraken3.js is the raft's state (pure); this binds it to
// the world: the end of phase 1 (main.js hands him over at KR3.p2At), the reach going into the sea, the raft as plank MOVERS on his sea, the heroes on
// it (the blows that land on them, the shoves, the sea and the way back), his face as the boss's own hit box, his arms and the kraklings as 'krakenarm'
// ents (k3arm / k3krak: every skip-list that knows his arms knows them), the lab's advice, and the draw (his head and arm discs from src/redraw/kraken.js,
// the raft / kraklings / barnacles / wreckage / rock from src/redraw/kraken3_art.js).
// ONLY Causeway 2 (L.cw3) with k3On(): inert everywhere else - on() is false and main.js's hooks do nothing, so master's Kraken is untouched.
// main.js calls: on, owns(e), p2At, begin(e), resume(e), bossTick(e, dt), hurt(e, dmg, fromX), strike(hb), advice(), clear, drawSky, drawBack, drawBoss, drawOver, read.
import { KR3, k3On, k3New, k3Step, k3HitFace, k3HitArm, k3HitKrak, k3PopBarn, k3Advice, k3Read, inkSpans, extent, faceX, faceHittable, plankX, rawW } from './kraken3.js';
import { bakeRaft, bakeKrakling, bakeBarnacle, bakeWreck, bakeRock } from './redraw/kraken3_art.js';
const R = Math.round, TS = 16;
export const K3_MARK = 'k3:raft';

export function makeKraken3Hands(ctx) {
  const H = {}; let ART = null, G = null, lightT = 0, lightK = 0;   /* G: the raft's place in the world, once it is built: { rx0, deckY, mid, sea } */
  const lv = () => ctx.L;
  const on = () => !!(lv() && lv().cw3 && lv().arena && lv().arena.boss === 'kraken' && k3On());
  const art = () => ART || (ART = { raft: bakeRaft(), krak: bakeKrakling(), barn: bakeBarnacle(), wreck: bakeWreck(), rock: bakeRock() });
  H.on = on;
  H.owns = e => on() && !!e && e.t === 'kraken' && !!e.k3;
  H.p2At = () => KR3.p2At;
  H.clear = () => { G = null; lightT = 0; };
  const heroes = () => (ctx.players || [ctx.hero()]).filter(Boolean);
  const wx = x => (G ? G.rx0 + x : x), wy = y => (G ? G.deckY + y : y);

  /* ---------- THE HAND-OVER: his bar at KR3.p2At (or the raft's checkpoint) ---------- */
  H.begin = (e, resume) => {
    ctx.p1Stop(e);   /* the tide out, every arm under, the cargo, ink, waves, rings and feelers gone (main.js) */
    e.k3 = k3New({ seats: heroes().length, maxHp: e.maxHp, hp: e.hp, resume: !!resume });
    e.mode = 'k3'; e.modeT = 99; e.stage = 4; e.phase = 3; e.stageFloor = 0; e.k3Ents = { arms: new Map(), kraks: new Map() }; e.sinkY = 0;
    hide(e);
  };
  H.resume = e => { if (e.k3 || !ctx.marks().has(K3_MARK)) return false; e.hp = Math.min(e.hp, R(e.maxHp * KR3.p2At)); H.begin(e, true); return true; };
  const hide = e => { const A = lv().arena; e.x = A.rest; e.y = A.floor + 900; e.w = 2; e.h = 2; };

  /* ---------- THE ROAD GOES, THE RAFT: at the fade's black ---------- */
  function board(e) {
    const L = lv(), A = L.arena, tc = Math.floor(A.tower / TS), c0 = tc + 3, c1 = A.wallR - 1, sea = (L.pools || []).find(p => p.krakenSea);
    const r0 = Math.max(1, Math.floor((A.y0 || 0) / TS)), r1 = Math.floor(((sea && sea.bottom) || 40 * TS) / TS) - 1;
    for (let y = r0; y <= r1; y++) for (let x = c0; x <= c1; x++) ctx.breakTile(x, y);
    ctx.tilesDone();
    ctx.dropThings(c0 * TS, (c1 + 1) * TS, (r1 + 1) * TS);   /* the props and dressing that stood on the road go with it */
    const surf = A.floor + 2 * TS, mid = R((c0 + c1 + 1) / 2 * TS), rx0 = R(mid - rawW() / 2), deckY = surf - 4;
    if (sea) ctx.poolLevel(sea, surf);
    G = { rx0, deckY, mid, sea, surf, movers: [] };
    for (let i = 0; i < KR3.planks; i++) { const m = { kind: 'lift', k3: true, i, x: rx0 + i * KR3.plankW, y: deckY, y0: deckY, y1: deckY, w: KR3.plankW, h: 8, speed: 0, dx: 0, dy: 0, broken: false }; G.movers.push(m); ctx.addMover(m); }
    heroes().forEach((pp, i) => { if (pp.dead) return; pp.x = mid - 20 + i * 14; pp.y = deckY; pp.vx = 0; pp.vy = 0; pp.ground = true; pp.swim = false; pp.onMover = G.movers[plankAtW(pp.x)] || null; pp.inv = Math.max(pp.inv || 0, 1); });
    const half = Math.max(ctx.VW() / 2 + 16, 180); ctx.lock(mid - half, mid + half, mid - ctx.VW() / 2);
    ctx.marks().add(K3_MARK);   /* A10: a death from here comes back to the raft */
    ctx.shake(10); ctx.sound('crack'); ctx.sound('slam');
  }
  const plankAtW = x => Math.floor((x - (G ? G.rx0 : 0)) / KR3.plankW);
  function syncPlanks(S) { if (!G) return; for (const m of G.movers) { const gone = S.planks[m.i].st === 'gone'; if (gone && !m.broken) { m.broken = true; for (const pp of heroes()) if (pp.onMover === m) { pp.onMover = null; pp.ground = false; pp.vy = Math.max(pp.vy || 0, 20); } } else if (!gone) m.broken = false; } }

  /* ---------- ONE FRAME OF HIM ---------- */
  H.bossTick = (e, dt) => {
    const S = e.k3; if (!S) return;
    if (!e.alive) return;   /* (dead: he stays where he fell - the win's drops come from there) */
    e.anim = (e.anim || 0) + dt; e.flash = Math.max(0, (e.flash || 0) - dt);
    const hs = heroes(), view = G ? hs.map((pp, i) => ({ i, x: pp.x - G.rx0, y: pp.y - G.deckY, air: !pp.ground, duck: !!pp.ducking, dead: !!pp.dead || (pp.down || 0) > 0, swim: !!pp.swim, hold: ctx.holding(pp) })) : [];
    if (S.st === 'sink') e.sinkY = Math.min(80, (e.sinkY || 0) + dt * 30);
    const ev = k3Step(S, dt, { heroes: view, hp: e.hp });
    for (const v of ev) event(e, S, v, dt);
    if (G && G.sea && Math.abs(G.sea.y - G.surf) > 0.5) ctx.poolLevel(G.sea, G.surf);
    syncPlanks(S); syncEnts(e, S);
    /* HIS FACE: the boss's own box while it can be struck; under the water (rising, going round) it is not there to strike */
    if (G && faceHittable(S)) { e.x = wx(faceX(S)); e.y = G.deckY + 8; e.w = 34; e.h = 34; e.face = -S.face.side; } else hide(e);
  };
  function heroAt(i) { return heroes()[i] || null; }
  function event(e, S, v, dt) {
    const pp = v.i !== undefined ? heroAt(v.i) : null;
    switch (v.t) {
      case 'say': { const P = ctx.hero(); ctx.number(v.x !== undefined && G ? wx(v.x) : (P ? P.x : lv().arena.rest), v.y !== undefined && G ? wy(v.y) : (P ? P.y - 46 : lv().arena.floor - 60), v.text, v.col); break; }
      case 'sound': ctx.sound(v.k); break;
      case 'board': board(e); break;
      case 'hint': ctx.hint(v.text); break;
      case 'hurt': if (pp && !pp.dead) { const from = pp.x - (Math.sign(v.knock || 0) || 1) * 10; ctx.hurtAs(pp, from, v.dmg, { unblockable: !!v.unblock, name: v.name }); if (v.knock) { pp.vx = v.knock; pp.vy = Math.min(pp.vy || 0, -90); pp.ground = false; } } break;
      case 'push': if (pp && !pp.dead) ctx.moveBody(pp, v.vx * dt, 0); break;
      case 'block': if (pp && !pp.dead && pp.ground) pp.x = wx(v.x); break;
      case 'sea': if (pp) ctx.splash(pp.x, G ? G.surf : pp.y, 14); break;
      case 'back': if (pp && !pp.dead && G) { pp.x = wx(v.x); pp.y = G.deckY; pp.vx = 0; pp.vy = 0; pp.swim = false; pp.ground = true; pp.onMover = G.movers[plankAtW(pp.x)] || null; pp.inv = Math.max(pp.inv || 0, 1);
        ctx.hurtAs(pp, pp.x, Math.max(1, R((pp.maxHp || 100) * v.cost)), { unblockable: true, spare: true, noKnock: true, name: 'THE SEA' }); ctx.splash(pp.x, G.surf, 10); } break;
      case 'gone': if (G) { ctx.splash(wx(plankX(v.i)), G.surf, 12); ctx.debris(wx(plankX(v.i)), G.deckY); } break;
      case 'crack': if (G) ctx.debris(wx(plankX(v.i)), G.deckY); break;
      case 'lashed': if (G) ctx.ring(wx(plankX(v.i)), G.deckY - 4, 16, '#8fd160'); break;
      case 'slam': if (G) { ctx.shake(5); ctx.splash(wx(v.x), G.deckY, 10); ctx.ring(wx(v.x), G.deckY - 2, 22, '#fff6e0'); } break;
      case 'cut': if (G) ctx.splash(wx(v.x), G.deckY, 12); break;
      case 'open': if (G) { ctx.ring(wx(v.x), G.deckY - 10, 30, '#ffd36b'); e.recoil = 1; ctx.shake(4); } break;
      case 'faceHit': e.flash = 0.12; if (G) ctx.number(e.x, e.y - 40, v.d, v.open ? '#ffd36b' : v.ward ? '#9aa39a' : '#fff6e0'); break;
      case 'bite': if (G) ctx.shake(6); break;
      case 'break': if (G) ctx.shake(8); break;
      default: break;
    }
  }
  /* his arms and the kraklings as ents: the blades, the shots and the skills find them the way they find his phase-1 arms */
  function syncEnts(e, S) {
    if (!G) return; const E = e.k3Ents;
    for (const a of S.arms) { const live = a.st === 'pin' || a.st === 'lashTell' || a.st === 'lash'; let n = E.arms.get(a.id);
      if (live && !n) { n = { t: 'krakenarm', k3arm: a.id, x: 0, y: 0, w: 14, h: KR3.arms.height, vx: 0, vy: 0, face: -1, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0, hp: a.hp, maxHp: a.max, arm: null, parent: e }; E.arms.set(a.id, n); ctx.addEnemy(n); }
      if (n) { n.x = wx(a.x); n.y = G.deckY; n.hp = Math.max(0, a.hp); n.alive = live && e.alive; n.flash = a.flash || 0; } }
    for (const [id, n] of E.arms) if (!S.arms.some(a => a.id === id)) { n.alive = false; E.arms.delete(id); }
    for (const k of S.kraks) { const live = k.st === 'climb' || k.st === 'pry'; let n = E.kraks.get(k.id);
      if (live && !n) { n = { t: 'krakenarm', k3krak: k.id, x: 0, y: 0, w: 14, h: 12, vx: 0, vy: 0, face: -1, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0, hp: k.hp, maxHp: k.max, arm: null, parent: e }; E.kraks.set(k.id, n); ctx.addEnemy(n); }
      if (n) { n.x = wx(k.x + k.side * 4); n.y = G.deckY + (k.st === 'climb' ? 6 : 0); n.hp = Math.max(0, k.hp); n.alive = live && e.alive; } }
    for (const [id, n] of E.kraks) if (!S.kraks.some(k => k.id === id)) { n.alive = false; E.kraks.delete(id); }
  }

  /* ---------- A BLOW (krakenHurt hands it here): his face takes it (returned to hurtEnemy); an arm or a krakling takes its own ---------- */
  H.hurt = (e, dmg, fromX) => {
    if (e.k3arm || e.k3krak) { const K = e.parent, S = K && K.k3; if (!S) return false;
      const d = e.k3arm ? k3HitArm(S, e.k3arm, dmg) : k3HitKrak(S, e.k3krak, dmg); if (!d) { ctx.sound('clank'); return false; }
      ctx.number(fromX + (Math.sign(e.x - fromX) || 1) * 12, (G ? G.deckY : e.y) - 26, d, '#fff6e0'); ctx.sparks(fromX + (Math.sign(e.x - fromX) || 1) * 12, (G ? G.deckY : e.y) - 10, Math.sign(e.x - fromX) || 1); ctx.sound('cut'); ctx.hitstop(0.035);
      return false; }
    const S = e.k3; if (!S) return false;
    if (!faceHittable(S)) { ctx.sound('clank'); return false; }
    const d = k3HitFace(S, dmg); for (const v of S.ev.splice(0)) event(e, S, v, 0);
    if (S.face.st !== 'reel') { ctx.sound('clank'); if (!(e.shutSaid > 0) || ctx.time() - e.shutSaid > 0.9) { e.shutSaid = ctx.time(); ctx.number(e.x, e.y - 52, S.face.st === 'ward' ? 'WARDED' : 'CUT HIS ARMS - THEN HIS FACE', '#9aa39a'); } }
    return d > 0 ? d : false;
  };
  H.strike = hb => { const e = ctx.boss(); if (!hb || !G || !H.owns(e) || !e.alive) return; if (hb.b < G.deckY - 30 || hb.t > G.deckY + 4) return; k3PopBarn(e.k3, hb.l - G.rx0, hb.r - G.rx0); };

  /* ---------- THE LAB (BK.krak while he is on the raft) ---------- */
  H.advice = () => { const e = ctx.boss(), P = ctx.hero(); if (!H.owns(e) || !e.alive || !P) return null; const S = e.k3;
    if (!G) return { goal: P.x, strike: null, kind: null, jump: false, mash: false, climb: false, mode: 'k3', stage: 4 };
    const i = heroes().indexOf(P), o = k3Advice(S, { i: i < 0 ? 0 : i, x: P.x - G.rx0, y: P.y - G.deckY, air: !P.ground, duck: !!P.ducking, dead: !!P.dead, swim: !!P.swim, hold: false });
    return { ...o, goal: o.goal === null ? null : wx(o.goal), strike: o.strike === null ? null : wx(o.strike), mode: 'k3', stage: 4, raft: S.st }; };

  /* ---------- THE DRAW ---------- */
  /* THE STORM NIGHT over the reach (causeway3w Q6, left to this lane): the sky only - the playfield stays lit so every tell reads; told lightning far off */
  H.drawSky = (g, cx, cy, time) => {
    const L = lv(), A = L.arena; if (!A || cx + ctx.VW() < A.x0 - 240) return; const VW = ctx.VW(), VH = ctx.VH();
    g.fillStyle = 'rgba(8,12,24,0.5)'; g.fillRect(0, 0, VW, VH);
    lightT -= 1 / 60; if (lightT <= 0) { lightT = 6 + ((time * 7.3) % 5); lightK = 1; ctx.sound('thunder'); } lightK = Math.max(0, lightK - 1 / 20);
    if (lightK > 0) { g.fillStyle = 'rgba(210,225,255,' + (lightK * 0.35).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); const bx = R(((time * 97) % 1) * VW); g.fillStyle = 'rgba(240,248,255,' + lightK.toFixed(3) + ')'; let x = bx; for (let y = 0; y < VH * 0.45; y += 4) { x += ((y * 13) % 7) - 3; g.fillRect(x, y, 1, 4); } }
    /* THE DRIFT: far rocks and a wreck's masts passing the other way - the raft is moving */
    const e = ctx.boss(); if (!G || !H.owns(e)) return; const hz = R(G.surf - cy) - 6;
    g.fillStyle = '#121a24'; for (let k = 0; k < 5; k++) { const x = (((k * 173 - time * 14) % (VW + 200)) + VW + 200) % (VW + 200) - 100; g.fillRect(R(x), hz - 10 - (k % 3) * 6, 26 + (k % 2) * 18, 12 + (k % 3) * 6); if (k === 2) { g.fillRect(R(x) + 8, hz - 46, 2, 36); g.fillRect(R(x) + 22, hz - 38, 2, 28); g.fillRect(R(x) + 2, hz - 40, 16, 1); } }
  };
  H.drawBack = (g, cx, cy, time) => {
    const e = ctx.boss(); if (!G || !H.owns(e)) return; const S = e.k3, A = art(), dy = G.deckY - cy;
    /* the sea running past the raft (it drifts): foam streaks along the water */
    g.fillStyle = 'rgba(223,240,245,0.55)'; for (let k = 0; k < 14; k++) { const x = (((k * 61 - time * 46) % (ctx.VW() + 60)) + ctx.VW() + 60) % (ctx.VW() + 60) - 30, y = R(G.surf - cy) + 3 + (k % 4) * 5; g.fillRect(R(x), y, 6 + (k % 3) * 3, 1); }
    /* the loose planks, adrift beside it */
    for (const l of S.loose) g.drawImage(A.raft.loose, R(wx(l.x) - cx - 8 + Math.sin(time * 1.3 + l.t) * 2), R(G.surf - cy - 3 + Math.sin(time * 2 + l.t) * 1.5));
    /* the raft */
    for (let i = 0; i < KR3.planks; i++) { const p = S.planks[i]; if (p.st === 'gone') continue; const c = p.flash > 0 && (p.flash * 20) % 2 < 1 ? A.raft.white : (p.st === 'cracked' ? A.raft.cracked : A.raft.whole)[i % 2];
      g.drawImage(c, R(G.rx0 + i * KR3.plankW - cx), R(dy) - 1); }
    /* THE DRIFT's hazards */
    for (const o of S.obst) {
      if (o.k === 'wreck') g.drawImage(A.wreck, R(wx(o.x) - cx - 22), R(dy) - 10);
      else if (o.k === 'rock') g.drawImage(A.rock, R(wx(o.x) - cx - 36), R(dy + KR3.rock.band[1]) - 64);
      else if (o.k === 'whirl') { const ex = extent(S), sx = wx(o.dir > 0 ? ex.x1 + 40 : ex.x0 - 40) - cx, sy = G.surf - cy + 6; g.strokeStyle = o.st === 'tell' ? 'rgba(191,230,245,0.6)' : 'rgba(223,240,245,0.9)'; g.lineWidth = 1;
        g.beginPath(); for (let a = 0; a < 14; a += 0.3) { const r = a * 2.2, an = a - time * (o.st === 'pull' ? 6 : 3); g.lineTo(R(sx + Math.cos(an) * r), R(sy + Math.sin(an) * r * 0.35)); } g.stroke(); }
    }
  };
  /* HIM: going down at the end of phase 1; on the raft, his face at the edge and his arms over the deck; the kraklings */
  H.drawBoss = (g, cx, cy, time) => {
    const e = ctx.boss(); if (!e || !e.k3) return; const S = e.k3, K = ctx.krkArt(), A = art(), Ah = lv().arena;
    if (!G) { /* THE SINK: the dome going under at the end of the road, eyes open */ const h = K.head, fr = h.R[8], k = Math.min(1, (e.sinkY || 0) / 80);
      g.globalAlpha = 1 - k * 0.8; g.drawImage(h.L[8], R(Ah.rest - cx - h.ax), R(Ah.floor + 2 * TS - cy - h.ay + (e.sinkY || 0))); g.globalAlpha = 1; if (fr) { /* (frame exists) */ } return; }
    const dead = !e.alive, deadK = dead ? Math.min(1, (ctx.time() - (e.deadAt || ctx.time())) / 3) : 0;
    /* his arms over the deck: a chain of his own arm discs from under the raft's edge, up, and down onto the plank they pin */
    for (const a of S.arms) drawArm(g, cx, cy, K, S, a, time, deadK);
    /* his face at the edge */
    const F = S.face, h = K.head, side = F.side, ex = extent(S);
    let fr = 0, rise = 0;
    if (F.st === 'rise') rise = Math.max(0, F.t / KR3.face.rise); else if (F.st === 'swap') rise = Math.min(1, (KR3.face.swapT - F.t) / (KR3.face.swapT * 0.5)); else if (F.st === 'under') rise = 1;
    if (S.st === 'drift') rise = 1;
    if (F.st === 'reel') fr = 6; else if (F.st === 'ward') fr = 5; else if (F.st === 'tell' || F.st === 'act') fr = F.mode === 'bite' || F.mode === 'snap' ? 3 : F.mode === 'spout' ? 10 : F.mode === 'ink' ? 7 : F.mode === 'lift' ? 2 : F.mode === 'barn' ? 2 : 0;
    else if (Math.floor(time * 0.7) % 5 === 0) fr = 1;
    if (dead) fr = 9;
    const fx = wx(side > 0 ? ex.x1 + KR3.face.reach - 6 : ex.x0 - KR3.face.reach + 6), fy = G.surf + 2 + rise * 60 + deadK * 40 + (F.mode === 'bite' && F.st === 'act' ? -6 : 0) + (F.mode === 'lift' && F.st === 'act' ? -8 : 0);
    const img = (e.flash > 0 ? h.white : h)[side > 0 ? 'L' : 'R'][fr] || h[side > 0 ? 'L' : 'R'][0];
    g.globalAlpha = rise > 0.95 && !dead ? 0 : 1 - deadK * 0.7; g.drawImage(img, R(fx - cx - (side > 0 ? img.width - h.ax : h.ax)), R(fy - cy - h.ay)); g.globalAlpha = 1;
    /* the sea round him: a white ring where he meets it */
    if (rise < 0.95) { g.fillStyle = 'rgba(223,240,245,0.7)'; for (let k = -3; k <= 3; k++) g.fillRect(R(fx - cx + k * 8 + Math.sin(time * 4 + k) * 2), R(G.surf - cy) + 1, 5, 1); }
    /* the kraklings */
    for (const k of S.kraks) { const fr2 = k.st === 'climb' ? 0 : k.st === 'dead' ? 3 : k.bite > 0 ? 2 : 1, set = k.flash > 0 ? A.krak.white : A.krak[k.side > 0 ? 'L' : 'R'], c = set[fr2];
      if (k.st === 'dead') g.globalAlpha = Math.max(0, k.t / 0.6); g.drawImage(c, R(wx(k.x + k.side * 4) - cx - A.krak.ax), R(G.deckY - cy - A.krak.ay + (k.st === 'climb' ? 4 : 0) + (k.st === 'dead' ? (0.6 - k.t) * 40 : 0))); g.globalAlpha = 1; }
  };
  function drawArm(g, cx, cy, K, S, a, time, deadK) {
    const side = a.x < (extent(S).x0 + extent(S).x1) / 2 ? -1 : 1, bx = wx(a.x), base = [bx + side * 10, G.surf + 34], rnd = (a.id * 37) % 7;
    let top, tip, alpha = 1;
    if (a.st === 'tell') { const k = Math.max(0, 1 - a.t / KR3.arms.tell); top = [bx + side * 18, G.surf - 10 - k * 46]; tip = [bx + side * 10, G.surf - 20 - k * 60]; }
    else if (a.st === 'slam') { top = [bx + side * 6, G.deckY - 26]; tip = [bx - side * 12, G.deckY - 3]; }
    else if (a.st === 'lashTell') { const k = 1 - a.t / KR3.arms.lashTell; top = [bx + side * 4, G.deckY - 30 - k * 14]; tip = [bx - side * (8 + k * 6), G.deckY - 16 - k * 22]; }
    else if (a.st === 'lash') { const k = 1 - a.t / KR3.arms.lashT; top = [bx, G.deckY - 26]; tip = [bx - side * (30 - k * 50), G.deckY - 8]; }
    else if (a.st === 'cut') { const k = 1 - a.t / KR3.arms.cut; alpha = 1 - k; top = [bx + side * 10, G.deckY - 10 + k * 40]; tip = [bx + side * 4, G.deckY + k * 50]; }
    else { const sw = Math.sin(time * 2 + rnd) * 2; top = [bx + side * 6 + sw, G.deckY - 26]; tip = [bx - side * 14, G.deckY - 3]; }
    const pts = []; for (let i = 0; i <= 22; i++) { const t = i / 22, u = 1 - t; const x = u * u * base[0] + 2 * u * t * top[0] + t * t * tip[0], y = u * u * base[1] + 2 * u * t * top[1] + t * t * tip[1]; pts.push([x, y, Math.max(1, 9 - t * 7.5)]); }
    const segs = a.flash > 0 ? K.arm.segW : K.arm.seg, inked = S.ink && inkSpans(S, heroes().map(p => p.x - G.rx0)).some(([s0, s1]) => a.x >= s0 && a.x <= s1);
    g.globalAlpha = alpha * (1 - deadK) * (inked ? 0.25 : 1);
    for (let i = pts.length - 1; i >= 0; i--) { const [x, y, r] = pts[i], c = K.arm.rim[R(r)]; if (c) g.drawImage(c, R(x - cx - c.width / 2), R(y - cy - c.height / 2)); }
    if (!inked) for (let i = pts.length - 1; i >= 0; i--) { const [x, y, r] = pts[i], c = segs[R(r)]; if (c) g.drawImage(c, R(x - cx - c.width / 2), R(y - cy - c.height / 2)); }
    if (!inked) for (let i = 2; i < pts.length - 1; i += 2) { const [x, y, r] = pts[i], c = K.arm.suck[R(r)]; if (c && r >= 3) g.drawImage(c, R(x - cx - c.width / 2), R(y + r * 0.6 - cy - c.height / 2)); }
    g.globalAlpha = 1;
  }
  /* THE TELLS, over everything: the marks on the deck, the ink, the jets, the barnacles, OPEN and its timer, the lashing, the fade */
  H.drawOver = (g, cx, cy, time) => {
    const e = ctx.boss(); if (!H.owns(e)) return; const S = e.k3, VW = ctx.VW(), VH = ctx.VH(), pulse = 0.5 + 0.5 * Math.sin(time * 14);
    if (S.st === 'road') { const k = Math.min(1, S.t / KR3.roadT), A = lv().arena; g.fillStyle = '#1a1414'; for (let c = 0; c < 26 * k; c++) { const x = R(A.x0 + ((c * 97) % (A.x1 - A.x0)) - cx), y = R(A.floor - cy); g.fillRect(x, y - 2, 1, 6); g.fillRect(x + 1, y + 2, 2, 1); } }
    if (S.st === 'fade' || (S.st === 'road' && S.t > KR3.roadT - 0.2)) { const k = S.st === 'fade' ? 1 - Math.abs(S.t - KR3.fadeT / 2) / (KR3.fadeT / 2) : 0.2; g.fillStyle = 'rgba(4,6,10,' + Math.max(0, Math.min(1, k)).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); }
    if (!G) return; const dy = R(G.deckY - cy), ex = extent(S);
    /* THE INK: black cloud over its stretch (soft blobs, not a band) - the arms in it only outlines (drawArm) */
    if (S.inkTell > 0) { const fx = wx(faceX(S)) - cx; g.fillStyle = 'rgba(22,16,24,0.7)'; for (let k = 0; k < 5; k++) g.fillRect(R(fx + Math.sin(time * 9 + k) * 6) - 3, dy - 30 + k * 3, 6, 3); }
    for (const [s0, s1] of inkSpans(S, heroes().map(p => p.x - G.rx0))) { for (let x = s0; x < s1; x += 6) for (let k = 0; k < 4; k++) { const r = 10 + ((x * 7 + k * 13) % 6); g.fillStyle = 'rgba(16,12,20,0.82)'; g.beginPath(); g.arc(R(wx(x) - cx), R(dy - 8 - k * 12 + Math.sin(time * 1.5 + x) * 2), r, 0, 7); g.fill(); } }
    /* an arm coming: its shadow on the plank and the water bulging beside it */
    for (const a of S.arms) { const x = R(wx(a.x) - cx);
      if (a.st === 'tell') { const k = 1 - a.t / (KR3.arms.tell + 0.4); g.globalAlpha = 0.3 + 0.4 * k; g.fillStyle = '#0a0608'; g.fillRect(x - 10, dy - 1, 20, 3); g.globalAlpha = 0.6 + 0.4 * pulse; g.fillStyle = '#ff6b6b'; g.fillRect(x - 1, dy - 22, 2, 8); g.fillRect(x - 1, dy - 12, 2, 2); g.globalAlpha = 1; }
      if (a.st === 'lashTell') { g.globalAlpha = 0.5 + 0.5 * pulse; g.fillStyle = '#ff6b6b'; g.fillRect(x - KR3.arms.lashR, dy - 1, KR3.arms.lashR * 2, 1); g.globalAlpha = 1; } }
    /* HIS MOVES' TELLS */
    const F = S.face;
    if (F.st === 'tell' && F.mode === 'spout') { const band = KR3.spout[F.height], y0 = dy + band[0], k = 1 - F.mt / KR3.spout.tell; g.globalAlpha = 0.35 + 0.5 * k; g.fillStyle = '#bfe6f5'; for (let x = ex.x0; x < ex.x1; x += 8) g.fillRect(R(wx(x) - cx), y0, 4, band[1] - band[0]); g.globalAlpha = 1; }
    for (const j of S.jets) { const x0 = R(wx(Math.min(j.x, j.dir > 0 ? j.x : faceX(S))) - cx), x1 = R(wx(Math.max(j.x, j.dir > 0 ? faceX(S) : j.x)) - cx); g.fillStyle = '#dff0f5'; g.fillRect(Math.min(x0, x1), dy + j.band[0], Math.abs(x1 - x0), j.band[1] - j.band[0]); g.fillStyle = '#ffffff'; g.fillRect(R(wx(j.x) - cx) - 2, dy + j.band[0] - 2, 4, j.band[1] - j.band[0] + 4); }
    if ((F.mode === 'bite' || F.mode === 'snap') && F.st === 'tell') { const ch = F.mode === 'bite' ? (F.chunk || []) : []; g.globalAlpha = 0.45 + 0.45 * pulse; g.fillStyle = '#ff6b6b';
      for (const i of ch) { const x = R(G.rx0 + i * KR3.plankW - cx); for (let k = 0; k < KR3.plankW; k += 4) g.fillRect(x + k, dy - 2 - ((k / 4) % 2), 2, 2); }
      if (F.mode === 'snap') { const nx = R(wx(faceX(S) - F.side * 14) - cx); g.fillRect(nx - KR3.snap.r, dy - 1, KR3.snap.r * 2, 1); } g.globalAlpha = 1; }
    if (F.mode === 'lift' && (F.st === 'tell' || F.st === 'act')) { const dir = -F.side, k = F.st === 'tell' ? 1 - F.mt / KR3.lift.tell : 1; g.globalAlpha = 0.5 + 0.4 * pulse; g.fillStyle = '#ffd36b';
      const mx = R(wx((ex.x0 + ex.x1) / 2) - cx); for (let q = -1; q <= 1; q++) { const ax = mx + q * 40; g.fillRect(ax - 6, dy - 30, 12, 2); g.fillRect(ax + dir * 6, dy - 32, 2, 6); } g.globalAlpha = 1;
      /* the water heaving on his side */ g.fillStyle = 'rgba(191,230,245,0.6)'; g.fillRect(R(wx(F.side > 0 ? ex.x1 : ex.x0 - 40) - cx), R(G.surf - cy) - R(10 * k), 40, R(10 * k)); }
    for (const b of S.barns) { const x = R(wx(b.x) - cx);
      if (b.st === 'tell') { g.globalAlpha = 0.5 + 0.5 * pulse; g.strokeStyle = '#d8d2bc'; g.beginPath(); g.arc(x, dy - 2, KR3.barn.r, Math.PI, 0); g.stroke(); g.globalAlpha = 1; }
      else if (b.st === 'fly') { const k = 1 - b.t / KR3.barn.fly, fx = wx(faceX(S)) - cx; g.drawImage(art().barn[0], R(fx + (x - fx) * k) - 3, R(dy - 30 - Math.sin(k * Math.PI) * 40 + k * 30) - 3); }
      else if (b.st === 'stuck') { const blink = b.t < 0.5 && Math.floor(time * 16) % 2; g.drawImage(art().barn[blink ? 1 : 0], x - 3, dy - 6); g.globalAlpha = 0.25 + 0.3 * (1 - b.t / KR3.barn.fuse); g.strokeStyle = '#ff9a6b'; g.beginPath(); g.arc(x, dy - 2, KR3.barn.r, Math.PI, 0); g.stroke(); g.globalAlpha = 1; }
      else if (b.st === 'burst') { g.fillStyle = '#fff6e0'; g.fillRect(x - KR3.barn.r, dy - 8, KR3.barn.r * 2, 2); } }
    for (const o of S.obst) if (o.k !== 'whirl') { const ex2 = o.dir > 0 ? ex.x0 : ex.x1, ahead = (ex2 - o.x) * o.dir; if (ahead > 0) { g.globalAlpha = 0.6 + 0.4 * pulse; g.fillStyle = o.k === 'wreck' ? '#ffd36b' : '#ff9a6b'; const x = R(wx(ex2) - cx) - o.dir * 6; g.fillRect(x - 1, dy - (o.k === 'rock' ? 40 : 22), 2, 8); g.fillRect(x - 1, dy - (o.k === 'rock' ? 30 : 12), 2, 2); g.globalAlpha = 1; } }
    for (const k of S.kraks) if (k.bite > 0) { g.fillStyle = '#ff6b6b'; g.fillRect(R(wx(k.x) - cx) - 1, dy - 22, 2, 6); }
    /* OPEN: the gold ring round his face and its timer; WARDED: grey */
    if (F.st === 'reel' || F.st === 'ward') { const fx = R(wx(faceX(S)) - cx), fy = dy - 14, open = F.st === 'reel', k = open ? Math.max(0, F.open / KR3.face.openT) : Math.max(0, F.t / KR3.face.wardT);
      g.strokeStyle = open ? '#ffd36b' : '#9aa39a'; g.globalAlpha = open ? 0.6 + 0.4 * pulse : 0.6; g.beginPath(); g.arc(fx, fy, 22, 0, 7); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#1b1626'; g.fillRect(fx - 16, fy - 32, 32, 3); g.fillStyle = open ? '#ffd36b' : '#9aa39a'; g.fillRect(fx - 15, fy - 31, R(30 * k), 1); }
    /* the lashing: a green bar over the hero at work, and the gaps a loose plank could fill */
    if (S.loose.length) for (let i = ex.lo; i <= ex.hi; i++) if (S.planks[i].st === 'gone') { g.globalAlpha = 0.35 + 0.3 * pulse; g.fillStyle = '#8fd160'; g.fillRect(R(G.rx0 + i * KR3.plankW - cx) + 2, dy + 1, KR3.plankW - 4, 1); g.globalAlpha = 1; }
    heroes().forEach((pp, i) => { const k = (S.rep[i] || 0) / KR3.repair.hold; if (k > 0) { g.fillStyle = '#1b1626'; g.fillRect(R(pp.x - cx) - 9, R(pp.y - cy) - 26, 18, 3); g.fillStyle = '#8fd160'; g.fillRect(R(pp.x - cx) - 8, R(pp.y - cy) - 25, R(16 * Math.min(1, k)), 1); } });
  };
  H.read = () => { const e = ctx.boss(); return H.owns(e) ? { ...k3Read(e.k3), raft: G ? { rx0: G.rx0, deckY: G.deckY } : null } : null; };
  return H;
}
