// src/shriek-sisters-hands.js - THE SHRIEK SISTERS' HANDS (claude/rookery). src/shriek-sisters.js is the fight (pure); this binds it to the world: the boss is an ANCHOR
// (the game's one boss: its bar is the three sisters' health together, it dies when the last of them does) and the three SISTERS are bodies in the foe list a blow can
// find (main.js hurtEnemy0 hands their blows here: hit). Their told blows on the heroes (keyed once a blow; a shield turns the dive - she is knocked down - and the
// wave), the summit's cracked slabs, the stones, the rocks, the marks - and the drawing.
// GREYBOX ART (readable shapes; the sonnet art lane draws them - see the lane report's ART NOTES): every move its OWN windup and release pose (B16, POSE below): the dive's
// stoop (wings back, talons forward, head down) and the dive (folded, a spear), STUNNED (sprawled in rubble, wings splayed, stars), the tear (wings up, rubble flying),
// the scream's windup (head thrown back, wings wide) and the scream (beak at you, rings), the swoop (low, wings level), the wave's breath (chest out) and the wave
// (beak forward, a cone), the pick (head down to the rock on the shelf), the carry (rock in the talons), the drop's windup (talons open over the ring) and the drop
// (talons spread, empty), the snatch's windup (low, talons spread) and the snatch (flat out, talons first).
// THE SHARED READ (B10): OPEN = a gold ring and a timer bar (STUNNED / DOWN); WARDED = a pale ring and the word; ON THE WING = a turned blow sparks and says so.
// main.js calls: spawnBoss, owns, on, update, hit, drawBack, drawBoss, drawOver, barName, end, read, show, clear.
import * as SSM from './shriek-sisters.js';
import { BOSS_PHASE } from './boss-music.js';
import { canvas, flipX, whiten } from './px.js';
import { drawSister } from './redraw/shriek_sisters_art.js';
import { bakeSummitSlab, bakeSummitRubble, bakeSummitStone } from './redraw/rookery_world.js';   /* (claude/rookerypolish) the summit's slabs, rubble and stones in the Sisters' Crag stone */
const { SS, ROLES } = SSM;

const SOUND = { screech: s => (s.screech || s.tell)(), lock: s => (s.tell || s.clank)(), dive: s => (s.whoosh || s.throwWhoosh || s.screech || s.tell)(), smash: s => { (s.crack || s.stone || s.thud)(); (s.heavy || s.thud)(); },
  skid: s => (s.skid || s.stone || s.thud)(), screamTell: s => (s.screech || s.tell)(), scream: s => (s.queenShriek || s.screech)(), inhale: s => (s.tell)(), shriek: s => (s.queenShriek || s.screech)(),
  pick: s => (s.stone || s.thud)(), rockTell: s => (s.tell)(), drop: s => (s.throwWhoosh || s.tell)(), rockLand: s => { (s.heavy || s.thud)(); (s.crack || s.stone)(); }, snatchTell: s => (s.screech || s.tell)(),
  swoop: s => (s.whoosh || s.throwWhoosh || s.tell)(), crack: s => (s.crack || s.stone)(), fall: s => (s.queenShriek || s.screech)(), clank: s => (s.clank || s.thud)() };
const COL = { diver: { body: '#6a7890', dark: '#3e4a5e', light: '#9aaac4', crest: '#c8d4e8' }, shrieker: { body: '#7a4a5a', dark: '#4a2634', light: '#b0707e', crest: '#e04a3a' }, snatcher: { body: '#7a6448', dark: '#4a3a26', light: '#a88c64', crest: '#d8b070' } };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
/* THE POSE A MODE WEARS (local px, facing right, her talons at 0,0): wing angle (rad, up is negative), body pitch, head [dx, dy], beak (open), talons (spread / fwd), rock */
export const POSE = {
  sleep: { wing: 0.9, pitch: 0, head: [6, 2], fold: true }, wake: { wing: -0.6, pitch: 0, head: [8, -6], beak: true },
  hover: { wing: -0.4, flap: true, pitch: 0, head: [8, -2] }, rise: { wing: -0.7, flap: true, pitch: -0.2, head: [8, -4] }, fly: { wing: -0.3, flap: true, pitch: 0.1, head: [9, -1] },
  diveTell: { wing: -1.2, pitch: 0.35, head: [9, 4], talon: 'fwd', eye: 'red' }, dive: { wing: 0.15, pitch: 0.9, head: [11, 2], fold: true, talon: 'fwd', eye: 'red' },
  land: { wing: -0.2, pitch: 0.1, head: [8, 0], talon: 'spread' }, downed: { wing: 0.6, pitch: 0.5, head: [7, 4], sprawl: true, stars: true },
  stuck: { wing: 0.8, pitch: 0.6, head: [6, 6], sprawl: true, stars: true, rubble: true }, tear: { wing: -1.3, pitch: -0.2, head: [8, -6], beak: true, rubble: true },
  screamTell: { wing: -1.5, pitch: -0.35, head: [4, -9], beak: true, eye: 'red' }, scream: { wing: -0.9, pitch: 0.15, head: [12, -2], beak: true, rings: true },
  swoop: { wing: -0.05, pitch: 0.05, head: [10, 0] }, waveTell: { wing: -1.0, pitch: -0.3, head: [5, -6], chest: true, eye: 'red' }, wave: { wing: -0.6, pitch: 0.2, head: [13, 0], beak: true, cone: true },
  pick: { wing: 0.4, pitch: 0.5, head: [9, 6], talon: 'grip', rock: true }, carry: { wing: -0.5, flap: true, pitch: 0, head: [8, -2], rock: true, talon: 'grip' },
  dropTell: { wing: -1.1, pitch: -0.1, head: [7, 2], rock: true, talon: 'open', eye: 'red' }, drop: { wing: -0.8, pitch: 0, head: [8, -2], talon: 'spread' },
  snatchTell: { wing: -1.0, pitch: 0.3, head: [10, 2], talon: 'spread', eye: 'red' }, snatch: { wing: 0.1, pitch: 0.15, head: [13, 1], talon: 'fwd', fold: true },
};
/* A SISTER is drawn by src/redraw/shriek_sisters_art.js (claude/rookeryart: three different birds, baked per pose; the greybox's rectangles are gone) */

export function makeShriekSistersHands(ctx) {
  let S = null, A0 = null; const H = {}, bodies = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'shrieksisters' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'shrieksisters' || e.t === 'shrieksister';
  H.clear = () => { S = null; A0 = null; BOSS_PHASE.shrieksisters = 1; };
  const anchor = () => { const e = ctx.boss; return e && e.t === 'shrieksisters' ? e : null; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.ssKeys = pp.ssKeys || new Map(); if (pp.ssKeys.size > 160) pp.ssKeys.clear(); if (pp.ssKeys.has(key)) return true; pp.ssKeys.set(key, 1); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = SSM.newFight(SSM.geom(Ar, ctx.TS)); BOSS_PHASE.shrieksisters = 1;
    const hp = ROLES.reduce((n, r) => n + S.sis[r].maxHp, 0);
    const e = { ...base, t: 'shrieksisters', w: 2, h: 2, hp, maxHp: hp, noGrav: true, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, ward: 0 };
    e.x = S.G.mid; e.y = S.G.floorY - 15 * ctx.TS; A0 = e;
    for (const r of ROLES) { const s = S.sis[r]; const b = { t: 'shrieksister', role: r, x: s.x, y: s.y, w: SS.sister.w, h: SS.sister.h, hp: s.hp, maxHp: s.maxHp, alive: true, dying: 0, noGrav: true, face: -1, anim: 0, flash: 0, stagger: 0, vx: 0, vy: 0, mode: 'sleep', boss: false };
      bodies[r] = b; ctx.addEnemy(b); }
    for (const pp of ctx.players) pp.ssKeys = null; return e; };
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, pp }));
  function world() {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.shrieksisters = Math.min(3, ph); },
      mark: (s, m) => ctx.number(s.x, s.y - 34, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      dust: (x, y, n) => ctx.dust(x, y, n),
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - 10, 34, '#ffd36b'); } else if (k === 'ward') ctx.ring(x, y - 10, 36, '#c8d8e8'); },
      rubble: x => { ctx.burst(x, S.G.floorY - 4, 18, ['#e8e4d8', '#8a8478', '#5e594f'], 120, 0.8); },
      hit: (s, bx, d, name, o = {}) => { let out = null; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          let res = null; hurt(name, () => { res = ctx.damagePlayer(s.x, d, { who: A0, name, unblockable: !o.blockable }); }); out = out || res;
          if (res === 'hit' && o.knockUp) { P.vy = Math.min(P.vy || 0, -220); P.vx = (P.x < s.x ? -1 : 1) * 120; } });
        return out; },
      hitArea: (bx, d, name, key) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return; if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, key)) return; hurt(name, () => ctx.damagePlayer((bx[0] + bx[1]) / 2, d, { who: A0, name, unblockable: true })); }); },
      hitHero: (h, d, name, key, blockable) => { const pp = h.pp; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return; if (key && keyed(pp, key)) return; hurt(name, () => ctx.damagePlayer(P.x - 10, d, { who: A0, name, unblockable: !blockable })); }); },
    };
  }
  H.update = (e, dt) => {
    if (!S || !e.alive || !A()) return; const w = world();
    /* THE GAME'S SCALING (the road's tier, the difficulty) is on the anchor's health: share it out to the three, once */
    if (!S.scaled) { S.scaled = true; const sum0 = ROLES.reduce((n, r) => n + S.sis[r].maxHp, 0), k = (e.maxHp || sum0) / sum0;
      for (const r of ROLES) { const s = S.sis[r]; s.maxHp = s.hp = Math.round(s.maxHp * k); if (bodies[r]) bodies[r].maxHp = bodies[r].hp = s.hp; } e.maxHp = ROLES.reduce((n, r) => n + S.sis[r].maxHp, 0); e.hp = e.maxHp; }
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(S.G.mid, S.G.floorY - 120, SSM.SS_SAY.wake, '#ffd36b'); SOUND.scream(ctx.sfx); ctx.shake(4);
      ROLES.forEach((r, i) => { const s = S.sis[r]; s.mode = 'wake'; s.modeT = 1.2 + i * 0.35; }); }
    if (S.woke && !S.told.rule && e.modeT <= 0.2) { S.told.rule = 1; ctx.number(S.G.mid, S.G.floorY - 104, SSM.SS_SAY.rule, '#ffd36b'); ctx.hint && ctx.hint(SSM.SS_SAY.rule); }
    if (!S.woke) return;
    SSM.stepSisters(S, dt, heroes(), w);
    /* the bodies follow the sisters; a sister at 0 falls */
    let sum = 0;
    for (const r of ROLES) { const s = S.sis[r], b = bodies[r]; if (!b) continue;
      if (s.alive && s.hp <= 0) { s.alive = false; b.alive = false; b.dying = 0; ctx.burst(s.x, s.y - 10, 26, [COL[r].body, COL[r].light, '#e6dcc0'], 140, 0.9); SSM.fell(S, r, w); }
      if (s.alive) { b.x = s.x; b.y = s.y; b.face = s.face || b.face; b.mode = s.mode; b.hp = s.hp; b.ward = s.ward; b.open = SSM.sisOpen(s) ? Math.max(0, s.modeT) : 0; sum += s.hp; } }
    e.hp = Math.max(sum, ROLES.some(r => S.sis[r].alive) ? 1 : 0); e.phase = S.ph; e.mode = SSM.ssOpen(S) ? 'open' : e.mode === 'wake' && e.modeT > 0 ? 'wake' : 'fight';
    e.open = SSM.ssOpen(S) ? 1 : 0; e.ward = ROLES.some(r => S.sis[r].alive && S.sis[r].ward > 0) ? 1 : 0;
    if (!ROLES.some(r => S.sis[r].alive) && e.alive) { e.hp = 1; e.ssPass = true; ctx.killBoss(e); }
  };
  /* A BLOW ON A SISTER (main.js hurtEnemy0): her own number (B15), shown on her, then off the anchor's bar */
  H.hit = (b, dmg, fromX, pl) => { if (!S || !b || !b.alive) return; const s = S.sis[b.role]; if (!s || !s.alive || s.mode === 'sleep') return;
    const [d, word] = SSM.takeBlow(s, dmg, pl); s.hp = Math.max(0, s.hp - d); b.hp = s.hp; b.flash = 0.12; b.hurtT = 0.12;
    if (word) { S.n[word === 'WARDED' ? 'wardHits' : 'wingHits']++; b.guardFx = 0.3; b.guardWord = word; ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(fromX - s.x) || 1; ctx.sparks(s.x + sd * 10, s.y - 10, -sd, 4);
      if (!S.told.wing && word === 'ON THE WING') { S.told.wing = 1; ctx.hint && ctx.hint('ON THE WING A BLOW BARELY LANDS. STAND ON A CRACK, LET HER DIVE, STEP OFF: SHE LIES STUNNED IN THE RUBBLE. CUT THEM WHEN THEY COME LOW.'); } }
    else S.n[SSM.sisOpen(s) ? 'openHits' : 'lowHits']++;
    ctx.number(s.x, s.y - 26, d, SSM.sisOpen(s) ? '#ffd36b' : word ? '#9aa39a' : '#fff6e0'); ctx.hitstop && ctx.hitstop(0.03);
    const e = anchor(); if (e) e.hp = Math.max(1, ROLES.reduce((n, r) => n + (S.sis[r].alive ? S.sis[r].hp : 0), 0)); };
  H.barName = () => { if (!S) return 'THE SHRIEK SISTERS'; const left = ROLES.filter(r => S.sis[r].alive), open = left.find(r => SSM.sisOpen(S.sis[r]));
    return 'THE SHRIEK SISTERS' + (open ? '  ' + SSM.NAME[open] + ' ' + SSM.OPEN_NAME[S.sis[open].mode] : left.length < 3 ? '  ' + left.length + ' LEFT' : ''); };
  H.end = () => { if (S) { S.rocks = []; S.waves = []; S.marks = []; } BOSS_PHASE.shrieksisters = 1; for (const r of ROLES) if (bodies[r]) bodies[r].alive = false; };
  H.read = () => S && { ph: S.ph, dead: { ...S.dead }, sis: Object.fromEntries(ROLES.map(r => [r, { mode: S.sis[r].mode, hp: S.sis[r].hp, alive: S.sis[r].alive, ward: S.sis[r].ward, x: S.sis[r].x, y: S.sis[r].y }])),
    slabs: S.G.slabs.map(s => ({ x: s.x, st: s.st })), stones: S.stones.length, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };
  const X = cx => v => R(v - cx), Y = cy => v => R(v - cy);
  /* THE SUMMIT: the slabs (cracked, or rubble growing back), the stones the snatcher left, the shelves' guano, the Roc's peak beyond */
  H.drawBack = (g, cx, cy, time) => { if (!S) return; const x = X(cx), y = Y(cy), G = S.G, fy = y(G.floorY);
    for (const sl of G.slabs) { const sx = x(sl.x) - SS.slab.w / 2;
      if (sl.st === 'crack') { g.drawImage(bakeSummitSlab(SS.slab.w), sx, fy - 1);
        g.strokeStyle = Math.floor(time * 3) % 2 ? '#ffd36b' : 'rgba(255,211,107,0.5)'; g.strokeRect(sx + 0.5, fy - 2.5, SS.slab.w - 1, 5); }
      else { g.drawImage(bakeSummitRubble(SS.slab.w), sx, fy - 4); const k = 1 - sl.t / SS.slab.regrow[0]; rect(g, sx, fy + 3, R(SS.slab.w * Math.max(0, k)), 1, '#c8d8e8'); } }
    for (const q of S.stones) { const sx = x(q.x), a = q.t < 2 ? (Math.floor(time * 8) % 2 ? 0.4 : 1) : 1; g.globalAlpha = a; g.drawImage(bakeSummitStone(), sx - 10, fy - 11); g.strokeStyle = '#ffd36b'; g.strokeRect(sx - 10.5, fy - 10.5, 21, 11); g.globalAlpha = 1; } };
  H.drawBoss = (g, b, cx, cy, time) => { if (!S || !b || b.t !== 'shrieksister') return; const s = S.sis[b.role]; if (!s) return; b.guardFx = Math.max(0, (b.guardFx || 0) - 1 / 60);
    const p = POSE[s.mode] || POSE.hover, flash = (b.hurtT || 0) > 0 || (b.flash || 0) > 0.06; b.hurtT = Math.max(0, (b.hurtT || 0) - 1 / 60);
    g.globalAlpha = 0.25; g.fillStyle = '#10060a'; g.fillRect(R(s.x - 12 - cx), R(S.G.floorY - 2 - cy), 24, 2); g.globalAlpha = 1;
    g.save(); g.translate(R(s.x - cx), R(s.y - cy)); g.scale(s.face || -1, 1); drawSister(g, b.role, p, flash, time, b.role === 'snatcher' ? undefined : false); g.restore(); };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const G = S.G, x = X(cx), y = Y(cy), fy = y(G.floorY);
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    /* the rocks falling, and the red ring where each will land */
    for (const c of S.rocks) { const q = SSM.rockAt(c, G.floorY); rect(g, x(q.x) - 6, y(q.y) - 8, 12, 9, '#8a8478'); g.strokeStyle = blink; g.strokeRect(x(c.x) - SS.rock.r, fy - 3, SS.rock.r * 2, 3); }
    for (const r of ROLES) { const s = S.sis[r]; if (s.alive && s.mode === 'dropTell') { g.strokeStyle = blink; g.strokeRect(x(s.dropX) - SS.rock.r, fy - 3, SS.rock.r * 2, 3); } }
    /* the marks */
    for (const m of S.marks) { const mx = x(m.x), k = m.t / m.T; g.globalAlpha = 0.5 + 0.5 * k; g.strokeStyle = '#ff5a4a'; g.lineWidth = 2; g.strokeRect(mx - 14, fy - 4, 28, 5); g.lineWidth = 1; rect(g, mx - 1, fy - 14, 2, 10, '#ff5a4a'); g.globalAlpha = 1; }
    /* the waves */
    for (const q of S.waves) for (let k = 0; k < 3; k++) { g.strokeStyle = 'rgba(255,211,107,' + (0.8 - k * 0.25) + ')'; g.beginPath(); g.arc(x(q.x) - q.dir * k * 6, fy - 12, 10 + k * 3, q.dir > 0 ? -1 : 2.1, q.dir > 0 ? 1 : 4.2); g.stroke(); }
    /* every aim: the red line from her to her spot - dotted while it follows you, SOLID once it LOCKS */
    for (const r of ROLES) { const s = S.sis[r]; if (!s.alive) continue; const sx = x(s.x), sy = y(s.y - 8);
      if (s.mode === 'diveTell' && s.aim) { const tx = x(s.aim.x), n = Math.max(2, Math.floor(Math.hypot(tx - sx, fy - sy) / 7));
        g.fillStyle = s.aim.lock ? '#ff3a2a' : blink; for (let i = 1; i < n; i++) g.fillRect(R(sx + (tx - sx) * i / n), R(sy + (fy - sy) * i / n), s.aim.lock ? 3 : 2, s.aim.lock ? 3 : 2);
        g.strokeStyle = '#ff3a2a'; g.strokeRect(tx - 12, fy - 3, 24, 4); }
      if (s.mode === 'snatchTell') { g.fillStyle = 'rgba(255,90,74,0.35)'; for (let q = G.x0; q < G.x1; q += 12) g.fillRect(x(q), y(G.floorY - SS.snatch.h) - 1, 7, 2); }
      /* the shared read (B10): OPEN gold ring + bar, WARDED pale ring, a turned blow's word */
      if (SSM.sisOpen(s)) { const kk = Math.max(0, s.modeT / (s.openT0 || 1)); g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.strokeRect(sx - 20, sy - 18, 40, 30); g.lineWidth = 1; g.globalAlpha = 1;
        ctx.text(SSM.OPEN_NAME[s.mode] || 'OPEN', sx, sy - 30, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(sx - 16, sy - 24, 32, 3); g.fillStyle = '#ffd36b'; g.fillRect(sx - 16, sy - 24, R(32 * kk), 3); }
      if (s.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.strokeRect(sx - 21, sy - 19, 42, 32); g.lineWidth = 1; g.globalAlpha = 1; ctx.text('WARDED', sx, sy - 30, '#c8d8e8', 'center', 5); }
      const b = bodies[r]; if (b && b.guardFx > 0 && b.guardWord) ctx.text(b.guardWord, sx, sy - 40 - R((0.3 - b.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#c8d8e8', 'center', 5);
      /* her name over her the first seconds, and a pip of her health */
      if (S.woke && (ctx.time() < (S.nameT || (S.nameT = ctx.time() + 6)))) ctx.text(SSM.NAME[r], sx, sy - 48, '#ece8dc', 'center', 5);
      g.fillStyle = '#1b1626'; g.fillRect(sx - 12, sy + 14, 24, 2); g.fillStyle = COL[r].crest; g.fillRect(sx - 12, sy + 14, R(24 * s.hp / s.maxHp), 2); }
  };
  return H;
}
/* THEIR BESTIARY CARD: the three, small (main.js SPR.shrieksistersCard) */
function bakeCardLedge(g) { const S = ['#1c161e', '#30242c', '#4e3c46', '#725a62', '#98807f', '#bf9fa0', '#e4c8c4'];   /* (claude/rookerypolish) the Sisters' Crag shelf they roost on */
  rect(g, 1, 37, 62, 3, S[2]); rect(g, 1, 36, 62, 1, S[5]); rect(g, 1, 35, 62, 1, S[6]); rect(g, 1, 39, 62, 1, S[1]); for (const [x, w] of [[5, 9], [22, 7], [38, 12], [53, 6]]) { rect(g, x, 35, w, 1, '#f8f6f0'); rect(g, x + 1, 34, Math.max(2, w - 3), 1, '#e6e4e0'); } for (const x of [14, 31, 49]) rect(g, x, 37, 1, 3, '#1c1a22'); rect(g, 9, 37, 2, 1, '#e6e4e0'); rect(g, 27, 38, 2, 1, '#e6e4e0'); }
export function bakeShriekSistersCard() {
  const fr = [0, 1].map(i => { const [c, g] = canvas(64, 40); g.imageSmoothingEnabled = false; bakeCardLedge(g);
    ROLES.forEach((r, k) => { g.save(); g.translate(12 + k * 20, 26 + (k % 2) * 8); g.scale(0.55, 0.55); drawSister(g, r, POSE[i ? (r === 'diver' ? 'diveTell' : r === 'shrieker' ? 'screamTell' : 'carry') : 'hover'], false, i * 0.3, undefined); g.restore(); }); return c; });
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 32, ay: 38, w: 56, h: 36 };
}
export const _drawSister = drawSister;
