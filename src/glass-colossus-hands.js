// src/glass-colossus-hands.js - THE GLASS COLOSSUS's HANDS (claude/glasssea; drawn by src/redraw/glass_colossus_art.js since the art pass). src/glass-colossus.js is the fight (pure: its three phases,
// its moves, its openings, the bot's reading); this binds it to the world: its told blows on the heroes (keyed once a blow; a shield turns only the
// yellow ones), THE SHELF-MIRRORS (E turns one: FACING THE GIANT / TO THE FIRE / TO THE SKY), the swarm out of the crack under it (THE CRACK SWARM's
// skitters, src/glass-foes.js) and the firelight that holds it, THE SHAKE that throws a climber who does not grip (hold DOWN: never a death - a blow and
// the floor), and the drawing (src/redraw/glass_colossus_art.js: its body, holds and shelf-mirrors; this file keeps the B10 read).
// THE SHARED READ (design standard B10): OPEN = a gold ring round the weak point and a timer bar; WARDED = a pale glass shell and the word; a blow that does
// nothing CLANKS, flashes and says why (SHUT / GLAZED / WARDED / HIGHER / LOWER).
// main.js calls: spawnBoss, owns, on, update, take, interact, drawBack, drawBoss, drawOver, barName, end, read, show, clear, phase, gazeOn.
import * as CG from './glass-colossus.js';
import { BOSS_PHASE } from './boss-music.js';
import * as COA from './redraw/glass_colossus_art.js';
const { COL } = CG;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), lanceTell: s => (s.charge || s.hiss || s.tell)(), lance: s => (s.zap || s.fireWhoosh || s.heavy)(),
  reflect: s => { (s.crack || s.clank)(); }, stomp: s => (s.heavy || s.thud)(), shards: s => (s.crack || s.thud)(), shake: s => { (s.rumble || s.heavy)(); }, swarm: s => (s.hiss || s.thud)(),
  wave: s => (s.rubble || s.heavy)(), sweep: s => (s.rubble || s.heavy)(), quake: s => { (s.heavy || s.thud)(); (s.crack || s.clank)(); }, open: s => (s.crack || s.clank)(), ward: s => (s.clank || s.thud)(), phase: s => (s.roar || s.heavy)() };

export function makeColossusHands(ctx) {
  let S = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'colossus' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'colossus';
  H.clear = () => { S = null; BOSS_PHASE.colossus = 1; };
  H.phase = () => (S && ctx.bossActive && ctx.boss && ctx.boss.t === 'colossus' && ctx.boss.alive ? S.ph : 0);
  /* the firelight a shelf-mirror TO THE FIRE lays along the floor in phase two (skitters will not step into it: src/glass-sea-hands.js fear) */
  H.relayAt = (x, y) => { if (!S || S.ph !== 2 || !A()) return false; const G = S.G; if (Math.abs(y - G.floor) > 24) return false; return S.mirrors.some(m => m.notch === 'fire' && (m.x < G.cx ? x >= G.fires[0] - 10 && x <= G.crack[0] + 8 : x <= G.fires[1] + 10 && x >= G.crack[1] - 8)); };
  H.gazeOn = () => !!(ctx.L && ctx.L.arena && ctx.L.arena.boss === 'colossus' && !ctx.L.gsColossusDown);   /* its eyes shine down the steps until it falls */
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.coKeys = pp.coKeys || new Map(); if (pp.coKeys.size > 120) pp.coKeys.clear(); if (pp.coKeys.has(key)) return true; pp.coKeys.set(key, 1); return false; };

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = CG.newFight(CG.geom(Ar, ctx.TS)); BOSS_PHASE.colossus = 1;
    const e = { ...base, t: 'colossus', w: COL.w, h: COL.h, hp: ctx.EHP.colossus, maxHp: ctx.EHP.colossus, noGrav: true, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    e.x = S.G.cx; e.y = S.G.floor; S.legPurse = e.maxHp * COL.legPurse[0]; for (const pp of ctx.players) pp.coKeys = null; return e; };

  /* ---------- THE WORLD AS IT SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, grip: ctx.down(pp), pp }));
  const swarm = () => ctx.enemies().filter(q => q.alive && q.coSwarm);
  function world(e) {
    const G = S.G;
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.colossus = ph; if (ctx.music) ctx.music(ph > 1 ? 'colossus:p' + ph : 'colossus'); },
      fx: (k, x, y) => { if (k === 'open') ctx.ring(x, y - 100, 34, '#ffd36b'); else if (k === 'ward') ctx.ring(x, y - 100, 40, '#c8d8e8'); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable })); if (P.hp < hp0) any = true; }); return any; },
      surface: (x, y) => { const ts = ctx.TS, tx = Math.floor(x / ts); for (let ty = Math.floor((y - 2) / ts); ty < G.F + 1; ty++) if (ctx.standable(tx, ty)) return ty * ts; return G.floor; },
      throwOff: (h, dir) => { const pp = h.pp; if ((pp.coThrown || 0) > ctx.time()) return; pp.coThrown = ctx.time() + 1.0;
        ctx.asPlayer(pp, () => { const P = ctx.hero(); hurt('THE SHAKE', () => ctx.damagePlayer(P.x, COL.shakeDmg, { who: e, name: 'THE SHAKE', unblockable: true, noKnock: true })); if (P.dead) return; P.vx = dir * 170; P.vy = -120; P.ground = false; P.drop = 0.45; P.climb = false; });
        ctx.burst(pp.x, pp.y - 8, 8, ['#e8fff8', '#9ae8d0'], 60, 0.5); if (!S.told.thrown) { S.told.thrown = 1; ctx.number(pp.x, pp.y - 40, 'THROWN OFF: HOLD DOWN TO GRIP WHEN IT SAYS HOLD', '#ffd36b'); } },
      swarm: n => { let k = 0; for (let i = 0; i < n; i++) { const b = ctx.spawnSkitter(G.cx + (i % 2 ? 1 : -1) * (20 + Math.random() * 18), G.floor - 1); if (b) { b.coSwarm = true; k++; } } return k; },
      swarmAlive: () => swarm().length,
      held: () => CG.relaying(S),
      /* (claude/glasssea2) THE GLASS QUAKE's slick plates slide a hero outward: moved by hand, never into a wall or past the arena's */
      push: (h, vx, dt) => { const pp = h.pp; ctx.asPlayer(pp, () => { const P = ctx.hero(), nx = P.x + vx * dt, ts = ctx.TS; if (nx < G.x0 + 10 || nx > G.x1 - 10) return;
        if (ctx.standable(Math.floor((nx + Math.sign(vx) * 7) / ts), Math.floor((P.y - 8) / ts))) return; P.x = nx; }); if (!S.told.slick) { S.told.slick = 1; ctx.number(pp.x, G.floor - 40, 'THE GLASS IS SLICK: IT SLIDES YOU', '#c8d8e8'); } },
      slap: i => { const m = S.mirrors[i]; ctx.sfx.clank && ctx.sfx.clank(); ctx.number(m.x, G.floor - 40, 'IT KNOCKS THE MIRROR ROUND', '#9aa39a'); },
    };
  }

  /* ---------- ONE FRAME OF IT ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; ctx.number(e.x, S.G.crownY - 30, 'THE GLASS COLOSSUS WAKES', '#ffd36b'); ctx.shake(6); }
    CG.stepColossus(e, S, dt, heroes(), world(e));
    e.phase = S.ph;
    /* the swarm will not cross firelight: the edges' campfires, and in phase two a relayed beam along the floor (src/glass-sea-hands.js fear asks warmAt;
       the arena's fires are ents of the level's hands too) */
    if (S.ph !== 2) for (const q of swarm()) if (q.alive && (e.mode !== 'swarm')) { q.coLeft = (q.coLeft || 6) - dt; if (q.coLeft <= 0) { q.alive = false; ctx.burst(q.x, q.y, 4, ['#5a4a8a', '#e8dcb0'], 30, 0.4); } }
    if (!S.told.mirror && e.mode !== 'wake' && S.ph === 1) { S.told.mirror = 1; ctx.number(S.G.cx, S.G.crownY - 50, 'TURN THE MIRROR TO HIM: HIS LANCE COMES BACK INTO HIS CHEST', '#ffd36b'); }   /* (= CG.MIRROR_LINE; a literal for tools/hint-shown) */
  };
  /* E AT A SHELF-MIRROR: the next notch */
  H.interact = P => { if (!S || !ctx.bossActive || !A()) return false; const m = S.mirrors.find(q => Math.abs(q.x - P.x) <= 22 && Math.abs(S.G.floor - P.y) <= 20); if (!m) return false;
    const n = CG.turnMirror(S, m.i); ctx.sfx.clank && ctx.sfx.clank(); const told = 'THE MIRROR: ' + CG.NOTCH_WORD[n]; ctx.number(m.x, S.G.floor - 44, told, '#fff6c8'); return true; };
  /* A BLOW ON IT (src/glass-colossus.js takeBlow): the zone by the striker's feet */
  H.take = (e, dmg, fromX, plunge) => { if (!S) return dmg; const P = ctx.hero(), o = {}; const d = CG.takeBlow(e, S, dmg, P.y, !!plunge, o);
    if (o.word) { e.guardFx = 0.3; e.guardWord = o.word; e.guardY = P.y; }
    if (d <= 0) { e.chipHit = ctx.time(); ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(fromX + (Math.sign(e.x - fromX) || 1) * 10, P.y - 12, -(Math.sign(e.x - fromX) || 1), 4); }
    return d; };
  H.barName = e => 'THE GLASS COLOSSUS' + (e.mode === 'cracked' ? '  CHEST CRACKED' : e.mode === 'blazing' ? '  SHOULDERS BLAZE' : e.mode === 'dazzled' ? '  DAZZLED' : S && S.ward > 0 ? '  WARDED' : '');
  H.end = e => { if (S) { S.rings = []; S.marks = []; S.wave = null; S.lance = null; } for (const q of swarm()) { q.alive = false; ctx.burst(q.x, q.y, 6, ['#5a4a8a', '#e8dcb0'], 40, 0.5); } BOSS_PHASE.colossus = 1; if (ctx.L) ctx.L.gsColossusDown = true; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, n: JSON.parse(JSON.stringify(S.n)), mirrors: S.mirrors.map(m => m.notch), ward: S.ward, legPurse: Math.round(S.legPurse), hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (src/redraw/glass_colossus_art.js: its own body; the holds and the shelf-mirrors; the relayed light) ---------- */
  /* its holds (glass crystal ledges growing out of it, glowing), the shelf-mirrors with their notch, the relayed firelight and the dawn's beam */
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G, e = ctx.boss;
    /* the gaze: its eyes' light shining west to the wall, where the steps' mirror takes it (until it falls) */
    if (e && H.gazeOn() && e.mode !== 'sleep') { const ex = R(G.cx - cx) - 14, ey = R(G.floor - 178 - cy), wx = R(G.x0 - cx), wy = R(G.floor - 128 - cy); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(150,230,255,0.28)'; g.lineWidth = 4; g.beginPath(); g.moveTo(ex, ey); g.lineTo(wx, wy); g.stroke(); g.strokeStyle = 'rgba(230,252,255,0.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(ex, ey); g.lineTo(wx, wy); g.stroke(); g.lineWidth = 1; g.globalCompositeOperation = 'source-over'; }
    for (const m of S.mirrors) { const x = R(m.x - cx), y = R(G.floor - cy), w0 = CG.NOTCH_WORD[m.notch], hw = w0.length * 4 + 4; if (x - hw < 0 || x + hw > ctx.VW()) continue; /* (batch75: a label for a mirror off the screen was drawn off it - tools/textfit.mjs OFFSCREEN) */ ctx.text(w0, x, y - 62, m.notch === 'face' ? '#e8f4f8' : m.notch === 'fire' ? '#ffb050' : '#ffd36b', 'center', 5); }
    if (S.ph === 2) for (const m of S.mirrors) if (m.notch === 'fire') { const fx = m.x < G.cx ? G.fires[0] : G.fires[1], cr = m.x < G.cx ? G.crack[0] : G.crack[1];
      g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,150,60,0.32)'; g.lineWidth = 6; g.beginPath(); g.moveTo(R(fx - cx), R(G.floor - 10 - cy)); g.lineTo(R(m.x + (m.x < G.cx ? 1 : -1) * 5 - cx), R(G.floor - 38 - cy)); g.lineTo(R(cr - cx), R(G.floor - 6 - cy)); g.stroke();
      g.strokeStyle = 'rgba(255,230,170,0.9)'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(fx - cx), R(G.floor - 10 - cy)); g.lineTo(R(m.x + (m.x < G.cx ? 1 : -1) * 5 - cx), R(G.floor - 38 - cy)); g.lineTo(R(cr - cx), R(G.floor - 6 - cy)); g.stroke(); g.lineWidth = 1; g.globalCompositeOperation = 'source-over'; }
    if (S.ph === 3) for (const m of S.mirrors) if (m.notch === 'sky') { g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,230,150,0.3)'; g.lineWidth = 6; g.beginPath(); g.moveTo(R(m.x - cx), R(G.floor - 42 - cy)); g.lineTo(R(G.cx - cx), R(G.crownY - cy)); g.stroke(); g.strokeStyle = 'rgba(255,252,220,0.95)'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(m.x - cx), R(G.floor - 42 - cy)); g.lineTo(R(G.cx - cx), R(G.crownY - cy)); g.stroke(); g.lineWidth = 1; g.globalCompositeOperation = 'source-over'; }
    for (const m of S.mirrors) COA.drawShelfMirror(g, m, G, cx, cy, time, S.ph);   /* (claude/glasssea2) AFTER the beams: a beam starts at the disc's face, it never crosses the bronze */
    /* the crack under its feet (the swarm's): a dark seam, violet at night, gold when the relay holds it */
    const cw = R(G.crack[1] - G.crack[0]); g.fillStyle = '#04080e'; g.fillRect(R(G.crack[0] - cx), R(G.floor - cy), cw, 3); g.fillStyle = S.ph === 2 ? (CG.relaying(S) ? '#ffb050' : '#9a7ad8') : '#3a9a92'; g.fillRect(R(G.crack[0] - cx), R(G.floor - cy), cw, 1);
    if (e && e.mode === 'swarm') { for (let i = 0; i < 12; i++) { const sx = R(G.crack[0] + ((i * 29 + time * 50) % (G.crack[1] - G.crack[0])) - cx), sy = R(G.floor - 4 - ((i * 7 + time * 40) % 22) - cy); g.fillStyle = '#2a1e50'; g.fillRect(sx, sy, 4, 3); g.fillStyle = '#ff5a5a'; g.fillRect(sx + 3, sy + 1, 1, 1); } }
  };
  /* IT: the body, drawn by src/redraw/glass_colossus_art.js; its cracks by state */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    COA.drawBody(g, e, S, S.G, cx, cy, time, (e.hurtT || 0) > 0, S.pose || CG.poseOf(e, S, time));   /* (claude/glasssea2) its POSE CLOCK: src/glass-colossus.js poseOf */
    COA.drawHolds(g, e, S, S.G, cx, cy, time);   /* the holds grow out of it, so they are drawn on it (the heroes are drawn after) */
  };
  /* OVER EVERYTHING: the lance's line and its end, the rings, the shard marks, the wave, and THE READ (open ring + timer, ward shell, the word) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'colossus') return; const G = S.G, ts = ctx.TS;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    const dotted = (x0, y0, x1, y1, col) => { const n = Math.max(2, R(Math.hypot(x1 - x0, y1 - y0) / 6)), off = (time * 3) % 1; g.fillStyle = col; for (let i = 0; i < n; i++) { const f = (i + off) / n; g.fillRect(R(x0 + (x1 - x0) * f - cx), R(y0 + (y1 - y0) * f - cy), 2, 2); } };
    /* the lance thrown back: a hot beam from the mirror's face up into its chest core */
    const bounce = (i, a) => { const m = S.mirrors[i], fx = R(m.x + (m.x < G.cx ? 1 : -1) * 6 - cx), fy = R(G.floor - 38 - cy), tx = R(G.cx - cx), ty = R(G.hipY - 20 - cy);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.strokeStyle = 'rgba(255,236,170,0.5)'; g.lineWidth = 6; g.beginPath(); g.moveTo(fx, fy); g.lineTo(tx, ty); g.stroke(); g.strokeStyle = '#fffbe0'; g.lineWidth = 2; g.beginPath(); g.moveTo(fx, fy); g.lineTo(tx, ty); g.stroke();
      g.lineWidth = 1; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; };
    if (S.lance && (e.mode === 'lanceTell' || e.mode === 'lance')) { const x0 = R(G.cx - cx), x1 = R(S.lance.end.x - cx - (S.lance.end.mirror >= 0 ? S.lance.dir * 6 : 0)), y = R(G.floor - 16 - cy);
      if (e.mode === 'lanceTell') { g.fillStyle = blink; for (let x = Math.min(x0, x1); x < Math.max(x0, x1); x += 6) g.fillRect(x, y, 3, 1);
        g.strokeStyle = blink; g.beginPath(); g.moveTo(x1 - 5, y - 6); g.lineTo(x1 + 5, y + 4); g.moveTo(x1 + 5, y - 6); g.lineTo(x1 - 5, y + 4); g.stroke();
        if (S.lance.end.mirror >= 0) ctx.text('THE MIRROR', x1, y - 14, '#ffd36b', 'center', 5); }
      if (e.mode === 'lance' && S.lance.end.mirror >= 0) bounce(S.lance.end.mirror, 1);
      else { g.fillStyle = 'rgba(255,240,180,0.55)'; g.fillRect(Math.min(x0, x1), R(G.floor - COL.lanceBand[0] - cy), Math.abs(x1 - x0), COL.lanceBand[0] - COL.lanceBand[1]); g.fillStyle = '#fffbe0'; g.fillRect(Math.min(x0, x1), y - 1, Math.abs(x1 - x0), 3); } }
    for (const r of S.rings) { const x = R(r.x - cx), y = R(G.floor - cy); g.fillStyle = '#9ae8d0'; for (let i = 0; i < 4; i++) g.fillRect(x - 6 + i * 4, y - 4 - (i % 2) * 6, 2, 4 + (i % 2) * 6); }
    for (const m of S.marks) { const x = R(m.x - cx), y = R(m.y - 2 - cy); g.fillStyle = e.mode === 'shardTell' ? blink : '#9ae8d0'; g.fillRect(x - COL.shardR, y, COL.shardR * 2, 2);
      if (e.mode === 'shardTell') { const k = Math.max(0, e.modeT / COL.shardTell); g.fillStyle = '#e8fff8'; g.fillRect(x - 2, R(y - 60 * k - 8), 4, 6); } }
    if (S.wave) { const x = R(S.wave.x - cx), y = R(G.floor - cy); g.fillStyle = '#9ae8d0'; g.fillRect(x - 14, y - COL.waveH, 28, COL.waveH); g.fillStyle = '#f0fff8'; g.fillRect(x - 14, y - COL.waveH, 28, 2); }
    if (e.mode === 'waveTell') { const fromW = S.waveDir > 0, x = R((fromW ? G.x0 + 12 : G.x1 - 12) - cx), y = R(G.floor - 24 - cy); g.fillStyle = blink; g.fillRect(x - 2, y, 4, 16); ctx.text('!! JUMP', x, y - 8, '#ff6b6b', 'center', 6); }
    if (e.mode === 'shakeTell') { for (const l of [...G.hip, ...G.shoulder]) { g.globalAlpha = 0.5 + 0.5 * Math.sin(time * 20); g.fillStyle = '#ffe9a0'; g.fillRect(R(l.l - cx), R(l.y - 2 - cy), R(l.r - l.l), 3); g.globalAlpha = 1; }
      ctx.text('HOLD! (DOWN)', R(G.cx - cx), R(G.crownY - 40 - cy), '#ff6b6b', 'center', 7); }
    /* (claude/glasssea2) THE SHARD SWEEP: its told line along the floor on your side (!! red and white), then the glass arm dragging in */
    if (S.sweep && e.mode === 'sweepTell') { const d = S.sweep.dir, xa = R(S.sweep.x - cx), xb = R(G.cx + d * COL.sweepIn - cx), y = R(G.floor - 3 - cy); g.fillStyle = blink; for (let x = Math.min(xa, xb); x < Math.max(xa, xb); x += 8) g.fillRect(x, y, 4, 2);
      ctx.text('!! JUMP THE SWEEP', xa - d * 30, y - 26, '#ff6b6b', 'center', 6); g.fillStyle = '#ff6b6b'; g.fillRect(xa - 1, y - 18, 3, 16); }
    if (S.sweep && S.sweep.live) { const x = R(S.sweep.x - cx), y = R(G.floor - cy), d = S.sweep.dir, ax = R(G.cx + d * 44 - cx);
      g.fillStyle = '#5cc8b4'; g.fillRect(Math.min(x, ax), y - 12, Math.abs(ax - x), 4); g.fillStyle = '#b4f4de'; g.fillRect(Math.min(x, ax), y - 12, Math.abs(ax - x), 1);
      for (let i = 0; i < 5; i++) { const sx = x - d * (i * 4) - 2, h = COL.sweepH - (i % 2) * 6; g.fillStyle = i % 2 ? '#7adcc4' : '#e8fff8'; g.fillRect(sx, y - h, 3, h); } }
    /* THE GLASS QUAKE: the marked plates (!! red and white) heave; after, the slick tilted shards with the way they slide you */
    if (e.mode === 'quakeTell') { const k = Math.max(0, Math.min(1, 1 - e.modeT / COL.quakeTell)); for (const p of S.plates) { const x = R(p.x - cx), y = R(G.floor - cy); g.fillStyle = blink; g.fillRect(x - COL.quakeW, y - 2, COL.quakeW * 2, 2); g.fillRect(x - COL.quakeW, y - 2 - R(4 * k), 2, R(4 * k)); g.fillRect(x + COL.quakeW - 2, y - 2 - R(4 * k), 2, R(4 * k)); }
      if (S.plates.length) ctx.text('!! OFF THE PLATES', R(S.plates[0].x - cx), R(G.floor - 30 - cy), '#ff6b6b', 'center', 6); }
    for (const q of S.slick) { const x = R(q.x - cx), y = R(G.floor - cy), a = Math.min(1, q.t / 0.5); g.globalAlpha = a; for (let i = 0; i < COL.quakeW * 2; i += 2) { const h = 2 + R(((q.dir > 0 ? i : COL.quakeW * 2 - i) / (COL.quakeW * 2)) * 6); g.fillStyle = '#7adcc4'; g.fillRect(x - COL.quakeW + i, y - h, 2, h); g.fillStyle = '#e8fff8'; g.fillRect(x - COL.quakeW + i, y - h, 2, 1); }
      g.fillStyle = '#c8d8e8'; const ax = x + q.dir * 4; g.fillRect(ax - 4, y - 14, 8, 1); g.fillRect(ax + q.dir * 3, y - 15, 1, 3); g.globalAlpha = 1; }
    /* THE MIRROR READ: the chest's target ring, a guide line from every mirror FACING it, and over the mirror to turn: TURN THE MIRROR TO HIM */
    if (!CG.colOpen(e) && S.ward <= 0 && e.mode !== 'phase' && (S.ph === 1 || S.ph === 3)) { const cxp = R(G.cx - cx), cyp = R(G.hipY - 20 - cy), faced = S.mirrors.filter(m => m.notch === 'face');
      g.globalAlpha = faced.length ? 0.85 : 0.4; g.strokeStyle = '#ffd36b'; g.beginPath(); g.arc(cxp, cyp, 9, 0, Math.PI * 2); g.stroke(); g.fillStyle = '#ffd36b'; g.fillRect(cxp - 1, cyp - 1, 2, 2); g.globalAlpha = 1;
      for (const m of faced) dotted(m.x + (m.x < G.cx ? 1 : -1) * 6, G.floor - 38, G.cx, G.hipY - 20, 'rgba(255,211,107,0.7)');
      if (!faced.length && S.ph === 1) { const P = ctx.hero(), m = S.mirrors.reduce((a, b) => Math.abs(b.x - P.x) < Math.abs(a.x - P.x) ? b : a), x = R(m.x - cx), y = R(G.floor - 84 - cy) + R(Math.sin(time * 6) * 2);
        ctx.text('TURN THE MIRROR TO HIM', x, y - 8, Math.floor(time * 4) % 2 ? '#ffd36b' : '#fff6c8', 'center', 6); ctx.text('(E)', x, y + 2, '#fff6c8', 'center', 5); g.fillStyle = '#ffd36b'; for (let i = 0; i < 4; i++) g.fillRect(x - 3 + i, y + 10 + i, 7 - 2 * i, 1);
        dotted(m.x, G.floor - 38, G.cx, G.hipY - 20, 'rgba(255,211,107,0.3)'); } }
    if (S.ph === 2 && !CG.colOpen(e) && S.ward <= 0) for (const sx of [-1, 1]) dotted((G.crack[0] + G.crack[1]) / 2, G.floor - 4, G.cx + sx * 44, G.shoulderY - 10, CG.relaying(S) ? 'rgba(255,176,80,0.7)' : 'rgba(168,136,255,0.35)');
    if (S.ph === 3 && !CG.colOpen(e) && S.ward <= 0 && !S.mirrors.some(m => m.notch === 'sky')) for (const m of S.mirrors) dotted(m.x, G.floor - 42, G.cx, G.crownY - 4, 'rgba(255,240,190,0.3)');
    /* the reflected lance: from the mirror's face back into its chest, in the moment it cracks it */
    if (e.mode === 'cracked' && (e.openT0 || 0) - e.open < 0.5 && S.lastReflect >= 0 && S.mirrors[S.lastReflect]) bounce(S.lastReflect, 1 - ((e.openT0 || 0) - e.open) / 0.5);
    /* THE READ (B10) */
    const zoneY = e.mode === 'cracked' ? G.hipY - 20 : e.mode === 'blazing' ? G.shoulderY - 8 : G.crownY - 4;
    if (CG.colOpen(e)) { const k = Math.max(0, e.open / (e.openT0 || COL.openT)), x = R(G.cx - cx), y = R(zoneY - cy);
      /* (claude/glasssea2, Daniel: "a VERY clear read") the gold ring is big and doubled, the bar long and thick, OPEN: STRIKE over it, and gold chevrons on the holds that reach it */
      g.globalAlpha = 0.7 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.strokeStyle = '#fff6c8'; g.beginPath(); g.arc(x, y, 26 + 2 * Math.sin(time * 8), 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
      if (e.mode === 'blazing') { g.strokeStyle = '#ffd36b'; g.lineWidth = 2; for (const sx of [-3 * ts + 5, 3 * ts - 5]) { g.beginPath(); g.arc(x + sx, y, 14, 0, Math.PI * 2); g.stroke(); } g.lineWidth = 1; }
      const by = y - 44; ctx.text('OPEN: STRIKE', x, by - 7, '#ffd36b', 'center', 7); g.fillStyle = '#1b1626'; g.fillRect(x - 31, by - 1, 62, 6); g.fillStyle = '#ffd36b'; g.fillRect(x - 30, by, R(60 * k), 4); g.fillStyle = '#fff6c8'; g.fillRect(x - 30, by, R(60 * k), 1);
      const holds = e.mode === 'cracked' ? G.hip : G.shoulder, bob = R(Math.sin(time * 8) * 2);
      for (const l of holds) { const hx = R((l.l + l.r) / 2 - cx), hy = R(l.y - 12 - cy) + bob; g.fillStyle = '#ffd36b'; for (let i = 0; i < 4; i++) g.fillRect(hx - 3 + i, hy + i, 7 - 2 * i, 1); g.fillRect(hx - 3, hy - 5, 7, 1); for (let i = 0; i < 4; i++) g.fillRect(hx - 3 + i, hy - 5 + i, 7 - 2 * i, 1); } }
    if (S.ward > 0) { const x = R(G.cx - cx); g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, R(G.hipY - 30 - cy), 46, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, R(G.crownY - 26 - cy), '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, R(G.cx - cx), R((e.guardY || G.floor) - 40 - cy) - R((0.3 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#c8d8e8', 'center', 6);
  };
  return H;
}
