// src/old-tusker-hands.js - OLD TUSKER's HANDS (claude/oldtusker). src/old-tusker.js is the fight (pure); this binds it to the world: his told blows on the heroes
// (keyed once a blow; a shield turns only the yellow sweep), THE CLEARING'S MARKED PINES (a hero's blow on one is a stroke: strike(hb); the ranger's arrow bites too),
// the trunk that pins him, the clods and the stomp's waves - and the drawing.
// GREYBOX ART (readable; the art lane draws it - see the lane report's ART NOTES): every move its OWN windup and release pose (B16) - the paw (head low, a fore hoof
// raking, dust) and the charge (long and low, legs flung), the ram (head into the trunk, reeling, stars), the sweep's cock (head swung back, tusks up) and the sweep
// (head hooked through, low), the root-up's dig (snout in the ground, rump up) and the fling (head thrown up), the rear (up on his hind legs) and the stomp (fore
// hooves down, flat), PINNED (on his side under the trunk, legs kicking), the thrash, the skid-turn, sleeping and waking. THE SHARED READ (B10): OPEN = a gold ring
// and a timer bar (PINNED / DAZED); WARDED = a pale ring and the word; THICK HIDE = a turned blow CLANKS, sparks and says so.
// main.js calls: spawnBoss, owns, on, update, take, strike, drawBack, drawBoss, drawOver, barName, end, read, show, clear.
import * as OTM from './old-tusker.js';
import { BOSS_PHASE } from './boss-music.js';
import { canvas, flipX, whiten } from './px.js';
const { OT } = OTM;

const SOUND = { snort: s => (s.boarSnort || s.snort || s.tell)(), charge: s => (s.boarCharge || s.badgerCharge || s.tell)(), ram: s => { (s.boarRam || s.heavy || s.thud)(); (s.crack || s.thud)(); },
  skid: s => (s.badgerSkid || s.thud)(), grunt: s => (s.boarGrunt || s.snort || s.tell)(), sweep: s => (s.boarSweep || s.slash || s.tell)(), dig: s => (s.boarDig || s.badgerHuff || s.tell)(),
  root: s => (s.boarFling || s.thud)(), clod: s => (s.thud || s.stone)(), rear: s => (s.boarSquealRoar || s.roar || s.tell)(), stomp: s => { (s.boarStomp || s.heavy)(); },
  roar: s => (s.boarSquealRoar || s.roar)(), thrash: s => (s.boarSquealRoar || s.roar)(), stroke: s => { (s.crack || s.thud)(); (s.creak || s.thud)(); }, creak: s => (s.creak || s.crack)(),
  timber: s => { (s.heavy || s.thud)(); (s.thud || s.heavy)(); }, clank: s => (s.clank || s.thud)() };

const C = { hide: '#5c3c28', hideD: '#3a2418', hideL: '#7c573a', bristle: '#22160e', grey: '#a89a88', greyD: '#7a6e60', tusk: '#f0e8d0', tuskD: '#c8bc9c', snout: '#9a6a56', snoutD: '#6a4232',
  hoof: '#1a120c', eye: '#ffcf6a', red: '#ff4a2a', bark: '#6a4428', barkD: '#3e2614', barkL: '#8e6440', blaze: '#e8dcc0', needle: '#2e5a34', needleD: '#1e3e24', needleL: '#4a7e4a', gold: '#ffd36b' };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const ell = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(R(x), R(y), Math.max(1, rx), Math.max(1, ry), rot, 0, 7); g.fill(); };
/* THE POSE A MODE WEARS (local px, facing right, his feet at 0,0): head [dx, dy, rot], rump (px the hind end rides up), legs, tusk angle, eye, lying - windup and release are never the same picture */
export const POSE = {
  sleep: { lying: true, eye: 'shut' }, wake: { head: [0, 2, 0.15], legs: 'stand', rump: -2 },
  walk: { head: [0, 0, 0], legs: 'walk' }, recover: { head: [0, 2, 0.1], legs: 'stand' },
  chargeTell: { head: [2, 5, 0.35], legs: 'paw', rump: 4, eye: 'red' }, charge: { head: [5, 3, 0.2], legs: 'run', stretch: 4, eye: 'red' }, turn: { head: [-2, 2, -0.1], legs: 'skid', eye: 'red' },
  rammed: { head: [-3, 4, -0.3], legs: 'splay', eye: 'shut', dazed: true },
  sweepTell: { head: [-6, -4, -0.55], legs: 'stand', tusk: -0.6, rump: 1 }, sweep: { head: [6, 4, 0.5], legs: 'lunge', tusk: 0.5 },
  rootTell: { head: [4, 9, 0.7], legs: 'stand', rump: 6 }, root: { head: [3, -6, -0.6], legs: 'stand', rump: -1 },
  stompTell: { rear: true, head: [-4, -10, -0.5], eye: 'red' }, stomp: { head: [3, 4, 0.25], legs: 'splay', rump: 2 },
  pinned: { lying: true, kick: true, eye: 'red' }, thrash: { head: [0, -2, -0.3], legs: 'splay', shake: true },
};

function drawBoar(g, p, flash, time, ph) {
  const f = flash ? '#ffffff' : null, col = c => f || c;
  if (p.lying) {   /* on his side: belly toward us, legs out; PINNED, they kick */
    ell(g, 0, -9, 22, 9, col(C.hide)); ell(g, -2, -12, 18, 5, col(C.hideL));
    for (let k = 0; k < 4; k++) { const kx = -12 + k * 7, kk = p.kick ? Math.sin(time * 22 + k * 1.7) * 3 : 0; rect(g, kx, -3 + kk * 0.3, 3, 6 + kk, col(C.hideD)); rect(g, kx, 2 + kk, 3, 2, col(C.hoof)); }
    ell(g, 20, -9, 8, 6, col(C.hide)); ell(g, 27, -8, 3, 3, col(C.snout)); rect(g, 22, -14, 2, 5, col(C.tusk));
    rect(g, 18, -11, 2, 2, p.eye === 'shut' ? col(C.hideD) : col(p.eye === 'red' ? C.red : C.eye)); return; }
  const [hx, hy, hr] = p.head || [0, 0, 0], rump = p.rump || 0, st = p.stretch || 0, walkK = p.legs === 'walk' ? Math.sin(time * 9) : p.legs === 'run' ? Math.sin(time * 22) : 0;
  g.save();
  if (p.rear) { g.translate(-14, 0); g.rotate(-0.55); g.translate(14, 0); }
  if (p.shake) g.translate(Math.sin(time * 50) * 1.5, 0);
  /* LEGS (far pair darker) */
  const leg = (x, sw, far) => { const lift = p.legs === 'paw' && !far && x > 0 ? Math.max(0, Math.sin(time * 14)) * 4 : 0, ang = p.legs === 'run' ? sw * 0.6 : p.legs === 'splay' ? (x > 0 ? 0.3 : -0.3) : p.legs === 'skid' ? (x > 0 ? -0.35 : -0.2) : p.legs === 'lunge' ? (x > 0 ? 0.35 : -0.15) : sw * 0.25;
    g.save(); g.translate(R(x), R(-9 - lift)); g.rotate(ang); rect(g, -2, 0, 4, 9, col(far ? C.hideD : C.hide)); rect(g, -2, 8, 4, 2, col(C.hoof)); g.restore(); };
  leg(-12 - st, walkK, true); leg(10 + st, -walkK, true); leg(-15 - st, -walkK, false); leg(13 + st, walkK, false);
  /* BODY: a deep barrel, high at the shoulder; the bristled ridge along the spine */
  ell(g, -1, -16 - rump * 0.3, 21 + st, 10, col(C.hide)); ell(g, -3, -19 - rump * 0.3, 17 + st, 5, col(C.hideL)); ell(g, 0, -10, 18 + st, 3, col(C.hideD));
  for (let k = 0; k < 9; k++) { const bx = -16 - st + k * (4 + st / 4), by = -25 - rump * 0.5 + Math.abs(k - 5) * 0.6 + (k > 5 ? rump * 0.2 : 0); g.fillStyle = col(C.bristle); g.beginPath(); g.moveTo(R(bx - 2), R(by + 3)); g.lineTo(R(bx), R(by - 3 - (ph > 1 ? 2 : 0))); g.lineTo(R(bx + 2), R(by + 3)); g.fill(); }
  rect(g, -23 - st, -20 - rump, 3, 2, col(C.hideD)); rect(g, -25 - st, -19 - rump, 2, 4, col(C.bristle));   /* the tail */
  for (let k = 0; k < 3; k++) rect(g, -10 + k * 7, -14, 3, 1, col(C.greyD));   /* old scars */
  /* HEAD: low and wedged, a grey old muzzle, the snout disc, the tusks curling up */
  g.save(); g.translate(R(16 + st + hx), R(-15 + hy)); g.rotate(hr);
  ell(g, 0, 0, 9, 8, col(C.hide)); ell(g, 3, 2, 7, 5, col(C.grey)); ell(g, 9, 3, 3, 4, col(C.snout)); rect(g, 10, 2, 1, 1, col(C.snoutD)); rect(g, 10, 4, 1, 1, col(C.snoutD));
  g.fillStyle = col(C.hideD); g.beginPath(); g.moveTo(-5, -6); g.lineTo(-2, -12); g.lineTo(1, -6); g.fill();   /* the ear */
  const ta = p.tusk || 0; g.save(); g.translate(6, 5); g.rotate(ta); g.fillStyle = col(C.tusk); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(5, -1, 4, -8); g.lineTo(2, -7); g.quadraticCurveTo(3, -2, -1, 1); g.fill(); g.restore();
  rect(g, 1, -3, 2, 2, p.eye === 'shut' ? col(C.hideD) : col(p.eye === 'red' ? C.red : C.eye));
  g.restore();
  if (p.dazed) for (let k = 0; k < 3; k++) { const a = time * 6 + k * 2.1; rect(g, 14 + Math.cos(a) * 8, -32 + Math.sin(a) * 3, 2, 2, C.gold); }
  g.restore();
}
/* A MARKED PINE: standing (leaning by its strokes, the woodsman's blaze, a pip a stroke), falling, down (a trunk across the floor), spent (a stump) */
function drawPine(g, p, x, y, time, lineCol) {
  if (p.st === 'spent') { rect(g, x - 5, y - 6, 10, 6, C.bark); rect(g, x - 4, y - 7, 8, 2, C.barkL); rect(g, x - 2, y - 6, 4, 1, C.barkD); return; }
  if (p.st === 'down' || p.st === 'pin') { const L = p.len * 16, x0 = p.dir > 0 ? x + 4 : x - 4 - L; rect(g, x0, y - 9, L, 8, C.bark); rect(g, x0, y - 9, L, 2, C.barkL); rect(g, x0, y - 3, L, 2, C.barkD);
    const cx = p.dir > 0 ? x0 + L - 26 : x0; for (let k = 0; k < 4; k++) ell(g, cx + 13 + (k - 1.5) * 7, y - 8 - (k % 2) * 3, 8, 5, k % 2 ? C.needle : C.needleD); rect(g, x - 5, y - 6, 10, 6, C.bark); return; }
  const k = p.st === 'fall' ? 1 - p.t / OT.pine.fall : 0, ang = p.dir * (p.lean + k * k * (Math.PI / 2 - p.lean)) + (p.shake > 0 ? Math.sin(time * 60) * 0.03 : 0);
  if (p.st === 'stand' && lineCol) { const [lo, hi] = OTM.lineOf(p); g.fillStyle = lineCol; for (let q = lo; q < hi; q += 8) g.fillRect(R(q), R(y - 1), 5, 2); }
  g.save(); g.translate(R(x), R(y)); g.rotate(ang);
  rect(g, -4, -96, 8, 96, C.bark); rect(g, -4, -96, 2, 96, C.barkL); rect(g, 2, -96, 2, 96, C.barkD);
  for (let q = 0; q < 6; q++) { const yy = -40 - q * 11, wd = 26 - q * 3; g.fillStyle = q % 2 ? C.needle : C.needleD; g.beginPath(); g.moveTo(-wd, yy + 8); g.lineTo(0, yy - 10); g.lineTo(wd, yy + 8); g.fill(); g.fillStyle = C.needleL; g.fillRect(-wd + 6, yy + 6, wd * 2 - 12, 1); }
  rect(g, -3, -30, 6, 8, C.blaze); rect(g, -2, -28, 4, 1, C.barkD);   /* THE WOODSMAN'S BLAZE */
  if (p.st === 'stand') for (let q = 0; q < OT.pine.strokes; q++) rect(g, -7 + q * 4, -20, 3, 3, q < OT.pine.strokes - p.hp ? C.gold : '#3a2a1a');   /* the stroke tally: notches cut */
  g.restore();
}

export function makeOldTuskerHands(ctx) {
  let S = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'oldtusker' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'oldtusker';
  H.phase = () => (S ? S.ph : 1);
  H.clear = () => { S = null; BOSS_PHASE.oldtusker = 1; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'oldtusker' ? e : null; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.otKeys = pp.otKeys || new Map(); if (pp.otKeys.size > 120) pp.otKeys.clear(); if (pp.otKeys.has(key)) return true; pp.otKeys.set(key, 1); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = OTM.newFight(OTM.geom(Ar, ctx.TS)); BOSS_PHASE.oldtusker = 1;
    const hp = ctx.EHP.oldtusker || OT.hp;
    const e = { ...base, t: 'oldtusker', w: OT.w, h: OT.h, hp, maxHp: hp, noGrav: true, markH: OT.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, ward: 0 };
    e.x = base.x; e.y = S.G.floorY; for (const pp of ctx.players) pp.otKeys = null; return e; };
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, pp }));
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.oldtusker = ph; },
      mark: m => ctx.number(e.x, e.y - OT.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      dust: (x, y, n) => ctx.dust(x, y, n),
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - 14, 34, '#ffd36b'); ctx.burst(x, y - 16, 14, ['#8e6440', '#c9b27c', '#2e5a34'], 100, 0.7); } else if (k === 'ward') ctx.ring(x, y - 14, 36, '#c8d8e8'); },
      splinter: q => { const p = S.pines[q.id]; if (!p) return; const [lo, hi] = OTM.lineOf(p); ctx.burst((lo + hi) / 2, S.G.floorY - 6, 16, ['#8e6440', '#c9b27c', '#3e2614', '#2e5a34'], 110, 0.7); },
      trunkBlow: d => { e.hp = Math.max(1, e.hp - d); e.flash = 0.15; ctx.number(e.x, e.y - OT.h - 10, '-' + d, '#ff6b6b'); },
      hit: (bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          let res = null; hurt(name, () => { res = ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable }); });
          if (res === 'hit' && o.knock) { P.vx = o.knock; P.vy = Math.min(P.vy || 0, -140); }
          if (res === 'blocked' && o.blockChip && !(P.parryT > 0.2)) { const c = Math.max(1, Math.round(d * o.blockChip)); P.hp = Math.max(1, P.hp - c); if (S) { S.hurt = S.hurt || {}; S.hurt[name + 'Chip'] = (S.hurt[name + 'Chip'] || 0) + c; } if (o.knock) P.vx = o.knock * 0.7; ctx.number(P.x, P.y - 30, OTM.OT_SAY.jarred, '#ff9a5c'); } }); },   /* (a plain block of the tusk sweep still jars you: his tusks are a parry's, or a jump's - Daniel's brief) */
      hitHero: (h, d, name, key) => { const pp = h.pp; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return; if (key && keyed(pp, key)) return; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: true })); }); },
    };
  }
  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 70, OTM.OT_SAY.wake, '#ffd36b'); SOUND.roar(ctx.sfx); ctx.shake(5); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number(S.G.mid, S.G.floorY - 120, OTM.OT_SAY.rule, '#ffd36b'); }
    /* THE RANGER's arrow bites a marked pine (every hero can fell one) */
    const w = world(e);
    for (const pp of ctx.players) for (const a of (pp.rgArrows || [])) { if (a.state !== 'fly') continue; const p = S.pines.find(q => q.st === 'stand' && Math.abs(a.x - q.x) < 8 && a.y > S.G.floorY - 60 && a.y < S.G.floorY); if (p) { a.state = 'drop'; a.vx *= -0.1; a.vy = -40; OTM.strokePine(S, p, w); } }
    OTM.stepTusker(e, S, dt, heroes(), w);
    e.phase = S.ph; e.open = OTM.otOpen(e) ? Math.max(0, e.modeT) : 0; e.openKind = e.mode;
  };
  /* A HERO'S BLOW (main.js attackBox): on a marked pine, a stroke */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e) return; const w = world(e);
    for (const p of S.pines) { if (p.st !== 'stand') continue; const box = { l: p.x - 7, r: p.x + 7, t: S.G.floorY - 60, b: S.G.floorY };
      if (hb.l < box.r && hb.r > box.l && hb.t < box.b && hb.b > box.t && ctx.hitOnce(p)) OTM.strokePine(S, p, w); } };
  /* A BLOW ON HIM (B15; src/old-tusker.js takeBlow) - the turned share clanks and says why */
  H.take = (e, dmg, fromX, pl) => { if (!S) return dmg; const [d, word] = OTM.takeBlow(e, S, dmg, pl);
    if (word) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 16, e.y - 16, sd, 4);
      if (!S.told.hide && word === 'THICK HIDE') { S.told.hide = 1; ctx.hint && ctx.hint('HIS HIDE TURNS A CUT. COME DOWN ON HIS BACK - OR LURE HIS CHARGE INTO A MARKED PINE AND FELL IT ON HIM.'); } }
    return d; };
  H.barName = e => 'OLD TUSKER' + (OTM.otOpen(e) ? '  ' + (OTM.OPEN_NAME[e.mode] || 'OPEN') : S && S.ward > 0 ? '  WARDED' : '');
  H.end = e => { if (S) { S.clods = []; S.waves = []; S.trunk = null; } BOSS_PHASE.oldtusker = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, ward: S.ward, pines: S.pines.map(p => ({ id: p.id, x: p.x, st: p.st, hp: p.hp })), n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };
  /* the pines stand behind him; a trunk down (or on him) is drawn over him (drawOver) */
  H.drawBack = (g, cx, cy, time) => { if (!S) return; const e = live();
    for (const p of S.pines) { if (p.st === 'down' || p.st === 'pin') continue; const x = p.x - cx; if (x < -140 || x > ctx.VW() + 140) continue;
      const hot = e && ctx.bossActive && p.st === 'stand' && OTM.underLine(p, e.x, OT.w / 2 - 6), lineCol = !ctx.bossActive ? null : hot ? (Math.floor(time * 8) % 2 ? '#ff6b6b' : '#ffd36b') : 'rgba(255,211,107,0.55)';
      drawPine(g, p, x, S.G.floorY - cy, time, lineCol); } };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const f = e.face || 1, m = e.mode, x = e.x - cx, y = e.y - cy, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06, p = POSE[m] || POSE.walk;
    g.globalAlpha = 0.3; ell(g, x, y, 22, 3, '#10060a'); g.globalAlpha = 1;
    g.save(); g.translate(R(x), R(y)); g.scale(f, 1); const bob = m === 'walk' ? (Math.floor(time * 6) & 1) : 0; g.translate(0, -bob); drawBoar(g, p, flash, time, S.ph); g.restore();
    if (m === 'chargeTell' && Math.random() < 0.5) ctx.dust(e.x + f * 16, e.y, 1);
  };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const e = ctx.boss; const G = S.G, X = v => R(v - cx), Y = v => R(v - cy);
    for (const p of S.pines) if (p.st === 'down' || p.st === 'pin') drawPine(g, p, X(p.x), Y(G.floorY), time, null);
    if (!ctx.bossActive || !e || e.t !== 'oldtusker') return;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    for (const c of S.clods) { const q = OTM.clodAt(c, G.floorY); ell(g, X(q.x), Y(q.y), 4, 3, '#4a3020'); rect(g, X(q.x) - 1, Y(q.y) - 2, 2, 1, '#2e5a34');
      g.strokeStyle = blink; g.beginPath(); g.ellipse(X(c.tx), Y(G.floorY) - 1, OT.root.r, 3, 0, 0, 7); g.stroke(); }
    for (const q of S.waves) for (let k = 0; k < 3; k++) rect(g, X(q.x) - q.dir * k * 6 - 3, Y(G.floorY) - 5 - (k % 2) * 3, 6, 5, k ? '#6a4a2a' : '#8e6a40');
    if (e.mode === 'chargeTell' || e.mode === 'turn') { const st = OTM.chargeStop(S, e.x, e.face || 1); g.globalAlpha = 0.35; g.fillStyle = '#ff6b6b'; for (let q = Math.min(e.x, st.x); q < Math.max(e.x, st.x); q += 10) g.fillRect(X(q), Y(G.floorY) - 1, 6, 1); g.globalAlpha = 1; }
    /* THE READ (B10) */
    const x = X(e.x), y = Y(e.y - OT.h / 2);
    if (OTM.otOpen(e)) { const kk = Math.max(0, e.modeT / (e.openT0 || 1));
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = Y(e.y - 48); ctx.text(OTM.OPEN_NAME[e.mode] || 'OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 32, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, Y(e.y - OT.h - 26), '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, Y(e.y - OT.h - 40) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
/* HIS BESTIARY CARD: two of his poses (walk, the charge's paw) - main.js SPR.oldtuskerCard (the bestiary reads SPR[t + 'Card'].R) */
export function bakeOldTuskerCard() {
  const fr = [POSE.walk, POSE.chargeTell].map((p, i) => { const [c, g] = canvas(64, 40); g.save(); g.translate(28, 38); drawBoar(g, p, false, i * 0.3, 1); g.restore(); return c; });
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 28, ay: 38, w: 46, h: 26 };
}
