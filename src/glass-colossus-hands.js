// src/glass-colossus-hands.js - THE GLASS COLOSSUS's HANDS (claude/glasssea, the greybox). src/glass-colossus.js is the fight (pure: its three phases,
// its moves, its openings, the bot's reading); this binds it to the world: its told blows on the heroes (keyed once a blow; a shield turns only the
// yellow ones), THE SHELF-MIRRORS (E turns one: FACING THE GIANT / TO THE FIRE / TO THE SKY), the swarm out of the crack under it (THE CRACK SWARM's
// skitters, src/glass-foes.js) and the firelight that holds it, THE SHAKE that throws a climber who does not grip (hold DOWN: never a death - a blow and
// the floor), and the drawing (GREYBOX: plain shapes - the art pass paints it once Daniel approves the concept).
// THE SHARED READ (design standard B10): OPEN = a gold ring round the weak point and a timer bar; WARDED = a pale glass shell and the word; a blow that does
// nothing CLANKS, flashes and says why (SHUT / GLAZED / WARDED / HIGHER / LOWER).
// main.js calls: spawnBoss, owns, on, update, take, interact, drawBack, drawBoss, drawOver, barName, end, read, show, clear, phase, gazeOn.
import * as CG from './glass-colossus.js';
import { BOSS_PHASE } from './boss-music.js';
const { COL } = CG;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), lanceTell: s => (s.charge || s.hiss || s.tell)(), lance: s => (s.zap || s.fireWhoosh || s.heavy)(),
  reflect: s => { (s.crack || s.clank)(); }, stomp: s => (s.heavy || s.thud)(), shards: s => (s.crack || s.thud)(), shake: s => { (s.rumble || s.heavy)(); }, swarm: s => (s.hiss || s.thud)(),
  wave: s => (s.rubble || s.heavy)(), open: s => (s.crack || s.clank)(), ward: s => (s.clank || s.thud)(), phase: s => (s.roar || s.heavy)() };

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
    if (!S.told.mirror && e.mode !== 'wake' && S.ph === 1) { S.told.mirror = 1; ctx.number(S.G.cx, S.G.crownY - 50, 'ITS LANCE IS THE SUN: A MIRROR FACING IT THROWS IT BACK', '#ffd36b'); }
  };
  /* E AT A SHELF-MIRROR: the next notch */
  H.interact = P => { if (!S || !ctx.bossActive || !A()) return false; const m = S.mirrors.find(q => Math.abs(q.x - P.x) <= 22 && Math.abs(S.G.floor - P.y) <= 20); if (!m) return false;
    const n = CG.turnMirror(S, m.i); ctx.sfx.clank && ctx.sfx.clank(); ctx.number(m.x, S.G.floor - 44, 'THE MIRROR: ' + CG.NOTCH_WORD[n], '#fff6c8'); return true; };
  /* A BLOW ON IT (src/glass-colossus.js takeBlow): the zone by the striker's feet */
  H.take = (e, dmg, fromX, plunge) => { if (!S) return dmg; const P = ctx.hero(), o = {}; const d = CG.takeBlow(e, S, dmg, P.y, !!plunge, o);
    if (o.word) { e.guardFx = 0.3; e.guardWord = o.word; e.guardY = P.y; }
    if (d <= 0) { e.chipHit = ctx.time(); ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(fromX + (Math.sign(e.x - fromX) || 1) * 10, P.y - 12, -(Math.sign(e.x - fromX) || 1), 4); }
    return d; };
  H.barName = e => 'THE GLASS COLOSSUS' + (e.mode === 'cracked' ? '  CHEST CRACKED' : e.mode === 'blazing' ? '  SHOULDERS BLAZE' : e.mode === 'dazzled' ? '  DAZZLED' : S && S.ward > 0 ? '  WARDED' : '');
  H.end = e => { if (S) { S.rings = []; S.marks = []; S.wave = null; S.lance = null; } for (const q of swarm()) { q.alive = false; ctx.burst(q.x, q.y, 6, ['#5a4a8a', '#e8dcb0'], 40, 0.5); } BOSS_PHASE.colossus = 1; if (ctx.L) ctx.L.gsColossusDown = true; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, n: JSON.parse(JSON.stringify(S.n)), mirrors: S.mirrors.map(m => m.notch), ward: S.ward, legPurse: Math.round(S.legPurse), hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (GREYBOX) ---------- */
  /* its holds (glass ledges), the shelf-mirrors with their notch, the relayed firelight and the dawn's beam */
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G, e = ctx.boss;
    for (const l of [...G.knee, ...G.hip, ...G.shoulder]) { g.fillStyle = 'rgba(160,230,210,0.85)'; g.fillRect(R(l.l - cx), R(l.y - cy), R(l.r - l.l), 3); g.fillStyle = '#f0fff8'; g.fillRect(R(l.l - cx), R(l.y - cy), R(l.r - l.l), 1); }
    for (const m of S.mirrors) { const x = R(m.x - cx), y = R(G.floor - cy); g.fillStyle = '#6a5a4a'; g.fillRect(x - 1, y - 30, 3, 30);
      g.save(); g.translate(x, y - 30); g.rotate(m.notch === 'face' ? Math.PI / 2 : m.notch === 'fire' ? (m.x < G.cx ? -0.5 : 0.5) : 0); g.fillStyle = '#c8f0ff'; g.fillRect(-12, -2, 24, 4); g.restore();
      ctx.text(CG.NOTCH_WORD[m.notch], x, y - 50, m.notch === 'face' ? '#e8f4f8' : m.notch === 'fire' ? '#ffb050' : '#ffd36b', 'center', 5); }
    if (S.ph === 2) for (const m of S.mirrors) if (m.notch === 'fire') { const fx = m.x < G.cx ? G.fires[0] : G.fires[1], cr = m.x < G.cx ? G.crack[0] : G.crack[1];
      g.strokeStyle = 'rgba(255,170,80,0.5)'; g.lineWidth = 4; g.beginPath(); g.moveTo(R(fx - cx), R(G.floor - 10 - cy)); g.lineTo(R(m.x - cx), R(G.floor - 30 - cy)); g.lineTo(R(cr - cx), R(G.floor - 8 - cy)); g.stroke(); g.lineWidth = 1; }
    if (S.ph === 3) for (const m of S.mirrors) if (m.notch === 'sky') { g.strokeStyle = 'rgba(255,240,180,0.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(R(m.x - cx), R(G.floor - 30 - cy)); g.lineTo(R(G.cx - cx), R(G.crownY - cy)); g.stroke(); g.lineWidth = 1; }
    /* the crack under its feet (the swarm's) */
    g.fillStyle = S.ph === 2 ? (CG.relaying(S) ? '#ffb050' : '#9a7ad8') : '#3a6a62'; g.fillRect(R(G.crack[0] - cx), R(G.floor - cy), R(G.crack[1] - G.crack[0]), 2);
    if (e && e.mode === 'swarm') { g.fillStyle = '#5a4a8a'; for (let i = 0; i < 10; i++) g.fillRect(R(G.crack[0] + ((i * 29 + time * 50) % (G.crack[1] - G.crack[0])) - cx), R(G.floor - 4 - ((i * 7 + time * 40) % 20) - cy), 3, 2); }
  };
  /* IT: legs, trunk, shoulders, head of lightning-glass (GREYBOX shapes); its cracks by state */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const G = S.G, x = R(e.x - cx), fy = R(G.floor - cy), flash = (e.hurtT || 0) > 0, ts = ctx.TS;
    const glass = flash ? '#ffffff' : S.ph === 2 ? '#4a6a9a' : S.ph === 3 ? '#b8e8f0' : '#8ac8c8', dark = S.ph === 2 ? '#22304a' : '#3a6a6a';
    const sway = e.mode === 'shake' ? R(Math.sin(time * 40) * 3) : e.mode === 'shakeTell' ? R(Math.sin(time * 14) * 1) : 0;
    g.fillStyle = dark; g.fillRect(x - 3 * ts, fy - 6 * ts, 2 * ts, 6 * ts); g.fillRect(x + 1 * ts, fy - 6 * ts, 2 * ts, 6 * ts);   /* the legs */
    g.fillStyle = glass; g.fillRect(x - 3 * ts + 2, fy - 6 * ts, 2 * ts - 4, 6 * ts); g.fillRect(x + 1 * ts + 2, fy - 6 * ts, 2 * ts - 4, 6 * ts);
    g.fillStyle = glass; g.fillRect(x - 2 * ts + sway, fy - 9 * ts, 4 * ts, 3 * ts + 4);                                         /* the trunk */
    g.fillRect(x - 4 * ts + sway, fy - 10 * ts, 8 * ts, ts + 4);                                                                  /* the shoulders */
    g.fillRect(x - ts + sway, fy - 12 * ts, 2 * ts, 2 * ts);                                                                       /* the head */
    g.fillStyle = S.ph === 2 ? '#9ae8ff' : '#fff2c0'; g.fillRect(x - 10 + sway, fy - 11 * ts - 6, 5, 2); g.fillRect(x + 5 + sway, fy - 11 * ts - 6, 5, 2);   /* the eyes */
    /* THE KNEE CRACKS: gold while their purse lasts, glazed pale after */
    const kc = S.legPurse > 0 ? '#ffd36b' : '#c8d8e8'; g.fillStyle = kc; g.fillRect(x - 2 * ts - 2, fy - 2 * ts, 4, 10); g.fillRect(x + 2 * ts - 2, fy - 2 * ts, 4, 10);
    /* THE CHEST: dark glass, cracked gold when the lance came back */
    g.fillStyle = e.mode === 'cracked' ? '#ffd36b' : '#2a4a5a'; g.fillRect(x - 10 + sway, fy - 8 * ts, 20, 14);
    if (e.mode === 'lanceTell') { g.globalAlpha = 0.5 + 0.5 * Math.sin(time * 18); g.fillStyle = '#fff6c8'; g.fillRect(x - 8 + sway, fy - 8 * ts + 2, 16, 10); g.globalAlpha = 1; }
    /* THE SHOULDER CRACKS (P2) and THE CROWN (P3) */
    if (S.ph === 2) { g.fillStyle = e.mode === 'blazing' ? '#ffb050' : '#5a4a8a'; g.fillRect(x - 3 * ts + sway, fy - 10 * ts + 2, 10, 4); g.fillRect(x + 3 * ts - 10 + sway, fy - 10 * ts + 2, 10, 4); }
    if (S.ph === 3) { g.fillStyle = e.mode === 'dazzled' ? '#ffffff' : '#ffd36b'; g.fillRect(x - 6 + sway, fy - 12 * ts - 4, 12, 4); }
    if (e.mode === 'stompTell') { g.fillStyle = '#ffd36b'; g.fillRect(x - 3 * ts, fy - 2, 6 * ts, 2); }
    if (e.mode === 'swarmTell') { g.fillStyle = '#ff6b6b'; g.fillRect(x - 4 + sway, fy - 9 * ts - 10, 8, 8); }
  };
  /* OVER EVERYTHING: the lance's line and its end, the rings, the shard marks, the wave, and THE READ (open ring + timer, ward shell, the word) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'colossus') return; const G = S.G, ts = ctx.TS;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    if (S.lance && (e.mode === 'lanceTell' || e.mode === 'lance')) { const x0 = R(G.cx - cx), x1 = R(S.lance.end.x - cx), y = R(G.floor - 16 - cy);
      if (e.mode === 'lanceTell') { g.fillStyle = blink; for (let x = Math.min(x0, x1); x < Math.max(x0, x1); x += 6) g.fillRect(x, y, 3, 1);
        g.strokeStyle = blink; g.beginPath(); g.moveTo(x1 - 5, y - 6); g.lineTo(x1 + 5, y + 4); g.moveTo(x1 + 5, y - 6); g.lineTo(x1 - 5, y + 4); g.stroke();
        if (S.lance.end.mirror >= 0) ctx.text('THE MIRROR', x1, y - 14, '#ffd36b', 'center', 5); }
      else { g.fillStyle = 'rgba(255,240,180,0.55)'; g.fillRect(Math.min(x0, x1), R(G.floor - COL.lanceBand[0] - cy), Math.abs(x1 - x0), COL.lanceBand[0] - COL.lanceBand[1]); g.fillStyle = '#fffbe0'; g.fillRect(Math.min(x0, x1), y - 1, Math.abs(x1 - x0), 3); } }
    for (const r of S.rings) { const x = R(r.x - cx), y = R(G.floor - cy); g.fillStyle = '#9ae8d0'; for (let i = 0; i < 4; i++) g.fillRect(x - 6 + i * 4, y - 4 - (i % 2) * 6, 2, 4 + (i % 2) * 6); }
    for (const m of S.marks) { const x = R(m.x - cx), y = R(m.y - 2 - cy); g.fillStyle = e.mode === 'shardTell' ? blink : '#9ae8d0'; g.fillRect(x - COL.shardR, y, COL.shardR * 2, 2);
      if (e.mode === 'shardTell') { const k = Math.max(0, e.modeT / COL.shardTell); g.fillStyle = '#e8fff8'; g.fillRect(x - 2, R(y - 60 * k - 8), 4, 6); } }
    if (S.wave) { const x = R(S.wave.x - cx), y = R(G.floor - cy); g.fillStyle = '#9ae8d0'; g.fillRect(x - 14, y - COL.waveH, 28, COL.waveH); g.fillStyle = '#f0fff8'; g.fillRect(x - 14, y - COL.waveH, 28, 2); }
    if (e.mode === 'waveTell') { const fromW = S.waveDir > 0, x = R((fromW ? G.x0 + 12 : G.x1 - 12) - cx), y = R(G.floor - 24 - cy); g.fillStyle = blink; g.fillRect(x - 2, y, 4, 16); ctx.text('!! JUMP', x, y - 8, '#ff6b6b', 'center', 6); }
    if (e.mode === 'shakeTell') { for (const l of [...G.hip, ...G.shoulder]) { g.globalAlpha = 0.5 + 0.5 * Math.sin(time * 20); g.fillStyle = '#ffe9a0'; g.fillRect(R(l.l - cx), R(l.y - 2 - cy), R(l.r - l.l), 3); g.globalAlpha = 1; }
      ctx.text('HOLD! (DOWN)', R(G.cx - cx), R(G.crownY - 40 - cy), '#ff6b6b', 'center', 7); }
    /* THE READ (B10) */
    const zoneY = e.mode === 'cracked' ? G.hipY - 20 : e.mode === 'blazing' ? G.shoulderY - 8 : G.crownY - 4;
    if (CG.colOpen(e)) { const k = Math.max(0, e.open / (e.openT0 || COL.openT)), x = R(G.cx - cx), y = R(zoneY - cy);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 22, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      if (e.mode === 'blazing') { g.strokeStyle = '#ffd36b'; for (const sx of [-3 * ts + 5, 3 * ts - 5]) { g.beginPath(); g.arc(x + sx, y, 12, 0, Math.PI * 2); g.stroke(); } }
      const by = y - 34; ctx.text('OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * k), 3); }
    if (S.ward > 0) { const x = R(G.cx - cx); g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, R(G.hipY - 30 - cy), 46, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, R(G.crownY - 26 - cy), '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, R(G.cx - cx), R((e.guardY || G.floor) - 40 - cy) - R((0.3 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#c8d8e8', 'center', 6);
  };
  return H;
}
