// src/grubbag-hands.js - LORD GRUBBAG THE GLUTTON's HANDS (claude/kitchengate). src/grubbag.js is the fight (pure); this binds it to the world: his told blows on the heroes
// (keyed once a blow; a shield turns only the yellow fork, and jars), THE PIE OVEN's bellows (a hero's blow on it stokes it: strike(hb)), THE SERVING LINE's dishes (a
// jumping blow knocks one off: strike(hb)), the gravy's slow floor - and the drawing.
// GREYBOX ART (readable shapes; the sonnet art lane draws him - see the lane report's ART NOTES): every move its OWN windup and release pose (B16, POSE below) - the belch's
// windup (head thrown back, belly swelling) and the belch (jaw dropped at you, rings), the throw's windup (a drumstick cocked over his shoulder) and the throw (arm flung
// forward), the fork's windup (the fork drawn back low under his arm) and the stab (fork thrust long along the floor), the slam's windup (both fists up over the table) and
// the slam (fists down, plates flying), the flood's windup (a hand on the gravy cauldron's lip) and the tip (cauldron over), the grab's windup (leaning out of the chair,
// arm drawn back, fingers spread) and the grab (arm flung out along the floor), EATING (a dish to his mouth), CHOKING (eyes bulging, hands at his throat, smoke), the cough.
// THE SHARED READ (B10): OPEN = a gold ring and a timer bar (CHOKING); WARDED = a pale ring and the word; WELL FED = a turned blow slaps dull and says so.
// main.js calls: spawnBoss, owns, on, update, take, strike, drawBack, drawBoss, drawOver, barName, end, read, show, clear.
import * as GBM from './grubbag.js';
import { BOSS_PHASE } from './boss-music.js';
import { canvas, flipX, whiten } from './px.js';
const { GB } = GBM;

const SOUND = { belchTell: s => (s.charge || s.tell)(), belch: s => (s.boreRoar || s.roar || s.thud)(), throwTell: s => (s.gobShout || s.tell)(), throw: s => (s.throwWhoosh || s.whoosh || s.tell)(),
  forkTell: s => (s.charge || s.tell)(), stab: s => (s.slash || s.tell)(), slamTell: s => (s.gobShout || s.roar || s.tell)(), slam: s => { (s.heavy || s.thud)(); (s.crack || s.thud)(); },
  floodTell: s => (s.tell)(), flood: s => (s.splash || s.thud)(), grabTell: s => (s.roar || s.tell)(), grab: s => (s.whoosh || s.throwWhoosh || s.tell)(),
  roar: s => (s.boreRoar || s.roar)(), chew: s => (s.thud || s.tell)(), boom: s => { (s.boom || s.heavy || s.thud)(); (s.puff || s.thud)(); }, cough: s => (s.gobDieLow || s.thud)(),
  pie: s => (s.clank || s.thud)(), smash: s => (s.crack || s.glass || s.thud)(), plate: s => (s.crack || s.thud)(), thud: s => (s.thud)(), clank: s => (s.clank || s.thud)() };
const C = { skin: '#7a8a52', skinD: '#4e5a32', skinL: '#a0b070', robe: '#6a2a3a', robeD: '#3e1622', gold: '#ffd36b', goldD: '#b08a30', chair: '#4a3020', chairL: '#6e4a2e', iron: '#3a3a42', ironL: '#7a7a86',
  fork: '#c8ccd4', forkD: '#8a8e96', eye: '#ffe9a0', red: '#ff4a2a', mouth: '#2a0e0e', tooth: '#efe6cf', dish: '#c8ccd4', food: '#a0602a', pie: '#c0302a', pieL: '#ff8a5c', gravy: '#7a4a22', gravyL: '#a8743a', copper: '#b8673a' };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
/* THE POSE A MODE WEARS (local px, facing right, his seat at 0,0): head [dx, dy], belly swell, near arm's hand [dx, dy], far arm's hand, the fork [dx, dy, angle, length], lean, eyes, mouth, what he holds */
export const POSE = {
  sleep: { head: [2, 6], belly: 1, hand: [12, -14], far: [-10, -14], fork: [20, -6, 1.4, 30], eyes: 'shut', mouth: 'shut', zzz: true },
  wake: { head: [0, -4], belly: 1, hand: [16, -30], far: [-16, -30], fork: [22, -20, -0.3, 34], eyes: 'red', mouth: 'open' },
  sit: { head: [0, 0], belly: 1, hand: [14, -18], far: [-12, -18], fork: [22, -10, 1.2, 34], eyes: 'open', mouth: 'chew' },
  belchTell: { head: [-6, -6], belly: 1.25, hand: [10, -24], far: [-12, -24], fork: [22, -10, 1.2, 34], eyes: 'red', mouth: 'shut', tilt: -0.3 },
  belch: { head: [6, 2], belly: 0.95, hand: [16, -16], far: [-14, -16], fork: [22, -10, 1.2, 34], eyes: 'red', mouth: 'wide', rings: true },
  throwTell: { head: [-2, -2], belly: 1, hand: [-14, -46], far: [-12, -18], fork: [-20, -10, 1.3, 34], eyes: 'red', mouth: 'open', item: 'drumstick' },
  throw: { head: [4, 0], belly: 1, hand: [30, -30], far: [-12, -18], fork: [-20, -10, 1.3, 34], eyes: 'open', mouth: 'open', lean: 4 },
  forkTell: { head: [0, 0], belly: 1, hand: [-6, -14], far: [-12, -18], fork: [-14, -10, 0.05, 40], eyes: 'red', mouth: 'shut', lean: -3 },
  fork: { head: [6, 2], belly: 1, hand: [26, -10], far: [-12, -18], fork: [26, -8, 0.0, 60], eyes: 'red', mouth: 'open', lean: 6, long: true },
  slamTell: { head: [0, -6], belly: 1.05, hand: [14, -56], far: [-6, -56], fork: [-22, -8, 1.4, 34], eyes: 'red', mouth: 'wide' },
  slam: { head: [6, 4], belly: 1, hand: [30, -12], far: [22, -12], fork: [-22, -8, 1.4, 34], eyes: 'red', mouth: 'open', lean: 6, plates: true },
  floodTell: { head: [-4, 0], belly: 1, hand: [-30, -26], far: [-12, -18], fork: [22, -10, 1.2, 34], eyes: 'red', mouth: 'open', lean: -6, cauldron: 0.2 },
  flood: { head: [-4, 2], belly: 1, hand: [-34, -14], far: [-12, -18], fork: [22, -10, 1.2, 34], eyes: 'open', mouth: 'open', lean: -6, cauldron: 1.4 },
  grabTell: { head: [6, 4], belly: 1, hand: [-10, -24], far: [-12, -18], fork: [-22, -8, 1.4, 34], eyes: 'red', mouth: 'wide', lean: 10, fingers: true },
  grab: { head: [10, 6], belly: 1, hand: [30, -6], far: [-12, -18], fork: [-22, -8, 1.4, 34], eyes: 'red', mouth: 'wide', lean: 14, arm: true },
  eat: { head: [0, -2], belly: 1.05, hand: [10, -42], far: [-12, -18], fork: [22, -10, 1.2, 34], eyes: 'shut', mouth: 'chew', item: 'dish' },
  choke: { head: [0, -4], belly: 1.15, hand: [6, -38], far: [-6, -38], fork: [24, -2, 1.5, 34], eyes: 'bulge', mouth: 'wide', smoke: true, shake: true, red: true },
  recover: { head: [2, 2], belly: 1, hand: [12, -24], far: [-12, -20], fork: [22, -10, 1.2, 34], eyes: 'open', mouth: 'open', cough: true },
};
/* HIM (greybox): the chair behind, the body, the head and its gold circlet, the arms, the fork; local px facing right, his seat on the floor at 0,0 */
function drawGrubbag(g, p, flash, time, holding) {
  const lean = p.lean || 0, bk = p.belly || 1;
  /* the reinforced chair */
  rect(g, -30, -78, 54, 78, C.chair); rect(g, -30, -78, 54, 4, C.chairL); for (const y of [-64, -40, -16]) rect(g, -30, y, 54, 3, C.iron); rect(g, -34, -24, 8, 24, C.chairL); rect(g, 20, -24, 8, 24, C.chairL);
  g.save(); g.translate(lean, 0); if (p.tilt) g.rotate(p.tilt * 0.15);
  /* the far arm */
  const arm = (hx, hy, col) => { const sx = 0, sy = -40; g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.moveTo(sx, sy); g.lineTo(hx, hy); g.stroke(); g.lineWidth = 1; rect(g, hx - 4, hy - 4, 8, 8, col); };
  arm(p.far[0], p.far[1], flash ? '#ffffff' : C.skinD);
  /* the body: robe and the great belly */
  rect(g, -20, -50, 40, 42, flash ? '#ffffff' : C.robe); rect(g, -20, -50, 40, 3, C.robeD);
  const bw = 34 * bk, bh = 26 * bk; rect(g, -bw / 2 + 4, -12 - bh, bw, bh, flash ? '#ffffff' : (p.red ? '#a85a42' : C.skin)); rect(g, -bw / 2 + 6, -12 - bh, bw - 4, 3, C.skinL); rect(g, 2, -12 - bh / 2, 3, 3, C.skinD);
  rect(g, -18, -10, 14, 10, C.robeD); rect(g, 6, -10, 14, 10, C.robeD);   /* his legs, short under it */
  /* the head and the circlet */
  const [hx, hy] = p.head; const H0 = -66 + hy;
  rect(g, -10 + hx, H0, 22, 18, flash ? '#ffffff' : (p.red ? '#b05a42' : C.skin)); rect(g, -10 + hx, H0 + 14, 22, 6, C.skinD);   /* jowls */
  rect(g, -9 + hx, H0 - 4, 20, 4, C.gold); rect(g, -7 + hx, H0 - 7, 3, 3, C.gold); rect(g, 0 + hx, H0 - 8, 3, 4, C.gold); rect(g, 6 + hx, H0 - 7, 3, 3, C.gold);
  const ey = p.eyes; if (ey === 'shut') rect(g, 4 + hx, H0 + 5, 6, 1, C.skinD); else { rect(g, 4 + hx, H0 + 3, ey === 'bulge' ? 6 : 5, ey === 'bulge' ? 6 : 4, ey === 'red' ? C.red : C.eye); rect(g, 6 + hx, H0 + 4, 2, 2, '#1a1010'); }
  const mo = p.mouth; if (mo === 'wide') { rect(g, 2 + hx, H0 + 10, 12, 8, C.mouth); rect(g, 3 + hx, H0 + 10, 3, 2, C.tooth); rect(g, 10 + hx, H0 + 10, 3, 2, C.tooth); }
  else if (mo === 'open') rect(g, 4 + hx, H0 + 11, 9, 4, C.mouth); else if (mo === 'chew') rect(g, 4 + hx, H0 + 12 + (Math.floor(time * 6) % 2), 8, 2, C.mouth); else rect(g, 4 + hx, H0 + 12, 8, 1, C.skinD);
  /* the fork */
  const [fx, fy, fa, fl] = p.fork; g.save(); g.translate(fx, fy); g.rotate(fa); rect(g, 0, -1, fl, 3, C.forkD); rect(g, fl, -5, 2, 11, C.fork); for (const ty of [-5, -1, 3]) rect(g, fl + 2, ty, 9, 2, C.fork); g.restore();
  /* the near arm (the grab: flung out along the floor) */
  if (p.arm) { g.strokeStyle = flash ? '#ffffff' : C.skin; g.lineWidth = 8; g.beginPath(); g.moveTo(0, -40); g.lineTo(p.hand[0], p.hand[1]); g.stroke(); g.lineWidth = 1; }
  else arm(p.hand[0], p.hand[1], flash ? '#ffffff' : C.skin);
  if (p.fingers || p.arm) for (let k = 0; k < 4; k++) rect(g, p.hand[0] + 3, p.hand[1] - 6 + k * 3, 6, 2, C.skin);
  if (p.item === 'drumstick') { rect(g, p.hand[0] - 3, p.hand[1] - 12, 8, 8, C.food); rect(g, p.hand[0], p.hand[1] - 4, 2, 6, C.tooth); }
  if (p.item === 'dish' && holding) { rect(g, p.hand[0] - 8, p.hand[1] - 4, 16, 3, C.dish); rect(g, p.hand[0] - 5, p.hand[1] - 9, 10, 5, holding === 'pie' ? C.pie : C.food); }
  g.restore();
  /* the gravy cauldron at his side */
  g.save(); g.translate(-36, -2); g.rotate(-(p.cauldron || 0)); rect(g, -10, -16, 20, 16, C.copper); rect(g, -11, -17, 22, 3, '#e09a5c'); rect(g, -8, -14, 16, 3, C.gravy); g.restore();
  if (p.rings) { const k = (time * 3) % 1; g.strokeStyle = 'rgba(160,200,90,' + (1 - k).toFixed(2) + ')'; g.beginPath(); g.arc(16 + p.head[0], -56, 6 + k * 26, -0.8, 0.8); g.stroke(); }
  if (p.smoke) for (let k = 0; k < 4; k++) { const a = time * 3 + k * 1.6; rect(g, 8 + Math.cos(a) * 10, -80 - ((time * 20 + k * 9) % 30), 6, 5, 'rgba(70,64,60,0.7)'); }
  if (p.zzz) { const k = (time * 0.8) % 1; g.globalAlpha = 1 - k; rect(g, 12, -84 - k * 14, 5, 1, '#e8e0d0'); rect(g, 16, -84 - k * 14, 1, 4, '#e8e0d0'); rect(g, 12, -80 - k * 14, 5, 1, '#e8e0d0'); g.globalAlpha = 1; }
  if (p.cough) for (let k = 0; k < 2; k++) rect(g, 18 + k * 6, -58 - (time * 30 + k * 7) % 10, 3, 3, 'rgba(200,190,170,0.7)');
}

export function makeGrubbagHands(ctx) {
  let S = null; const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'grubbag' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'grubbag';
  H.clear = () => { S = null; BOSS_PHASE.grubbag = 1; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'grubbag' ? e : null; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.gbKeys = pp.gbKeys || new Map(); if (pp.gbKeys.size > 160) pp.gbKeys.clear(); if (pp.gbKeys.has(key)) return true; pp.gbKeys.set(key, 1); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = GBM.newFight(GBM.geom(Ar, ctx.TS)); BOSS_PHASE.grubbag = 1;
    const hp = ctx.EHP.grubbag || GB.hp;
    const e = { ...base, t: 'grubbag', w: GB.w, h: GB.h, hp, maxHp: hp, noGrav: true, markH: GB.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, ward: 0 };
    e.x = S.G.chairX; e.y = S.G.floorY; for (const pp of ctx.players) pp.gbKeys = null; return e; };
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, pp }));
  const bzD = d => Math.round(ctx.heroId && ctx.heroId() === 'berserker' ? d * GB.bz.hurt : d);
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.grubbag = ph; },
      mark: m => ctx.number(e.x, e.y - GB.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      dust: (x, y, n) => ctx.dust(x, y, n),
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - 30, 44, '#ffd36b'); ctx.burst(x, y - 50, 22, ['#ff9a3c', '#ffd36b', '#4a4440', '#fff6c8'], 140, 0.8); } else if (k === 'ward') ctx.ring(x, y - 30, 46, '#c8d8e8'); },
      oven: on => { if (on) ctx.burst(S.G.ovenX, S.G.floorY - 20, 14, ['#ffd36b', '#ff9a3c', '#fff6c8'], 90, 0.5); },
      burst: (x, y) => ctx.burst(x, y, 20, ['#ff9a3c', '#ffd36b', '#4a4440'], 130, 0.7),
      smash: (x, y) => ctx.burst(x, y, 14, ['#c8ccd4', '#a0602a', '#e8dcc0'], 110, 0.6),
      hit: (bx, d, name, o = {}) => { let out = null; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          let res = null; hurt(name, () => { res = ctx.damagePlayer(e.x, bzD(d), { who: e, name, unblockable: !o.blockable }); }); out = out || res;
          if (res === 'hit' && o.knock) { P.vx = o.knock; P.vy = Math.min(P.vy || 0, -140); }
          if (res === 'hit' && o.throwV) { P.vx = -o.throwV; P.vy = Math.min(P.vy || 0, -220); }
          if (res === 'blocked' && o.blockChip && !(P.parryT > 0.2)) { const c = Math.max(1, Math.round(d * o.blockChip)); P.hp = Math.max(1, P.hp - c); if (S) { S.hurt = S.hurt || {}; S.hurt[name + 'Chip'] = (S.hurt[name + 'Chip'] || 0) + c; } if (o.knock) P.vx = o.knock * 0.6; } });
        return out; },
      hitArea: (bx, d, name, key) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return; if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, key)) return; hurt(name, () => ctx.damagePlayer((bx[0] + bx[1]) / 2, bzD(d), { who: e, name, unblockable: true })); }); },
      hitHero: (h, d, name, key) => { const pp = h.pp; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return; if (key && keyed(pp, key)) return; hurt(name, () => ctx.damagePlayer(e.x, bzD(d), { who: e, name, unblockable: true })); }); },
    };
  }
  H.update = (e, dt) => {
    if (!S || !e.alive || !A()) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 96, GBM.GB_SAY.wake, '#ffd36b'); SOUND.roar(ctx.sfx); ctx.shake(5); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number(S.G.mid, S.G.floorY - 130, GBM.GB_SAY.rule, '#ffd36b'); ctx.hint && ctx.hint(GBM.GB_SAY.rule); }
    GBM.stepGrubbag(e, S, dt, heroes(), world(e));
    /* THE GRAVY on the floor: slow and slick behind its wave, and for GB.flood.lie s after */
    if (S.gravy > 0) { const from = GBM.gravyFrom(S); for (const pp of ctx.players) if (pp.ground && Math.abs(pp.y - S.G.floorY) < 3 && pp.x > from) { const cap = 92 * GB.flood.slow; if (Math.abs(pp.vx) > cap) pp.vx = Math.sign(pp.vx) * cap; } }
    e.phase = S.ph; e.open = GBM.gbOpen(e) ? Math.max(0, e.modeT) : 0; e.openKind = e.mode;
  };
  /* A HERO'S BLOW (main.js attackBox): on the oven's bellows it stokes the oven; on a dish riding the line it knocks it off */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e) return; const w = world(e), G = S.G;
    const bb = { l: G.bellowsX - 10, r: G.bellowsX + 10, t: G.floorY - 22, b: G.floorY };
    if (hb.l < bb.r && hb.r > bb.l && hb.t < bb.b && hb.b > bb.t && (!ctx.hitOnce || ctx.hitOnce(S.oven))) GBM.stokeOven(S, w);
    for (const it of S.items) { if (it.state !== 'ride') continue; const b = GBM.dishBox(G, it); if (hb.l < b.r && hb.r > b.l && hb.t < b.b && hb.b > b.t && (!ctx.hitOnce || ctx.hitOnce(it))) GBM.smashItem(S, it, w); } };
  H.take = (e, dmg, fromX, pl, tag) => { if (!S) return dmg; const [d, word] = GBM.takeBlow(e, S, dmg, pl);
    S.n[word === 'WARDED' ? 'wardHits' : word ? 'fedHits' : GBM.gbOpen(e) ? 'openHits' : 'fedHits']++;
    if (word) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && word === 'WARDED' ? ctx.sfx.clank() : (ctx.sfx.thud && ctx.sfx.thud()); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 20, e.y - 30, sd, 3);
      if (!S.told.fed && word === 'WELL FED') { S.told.fed = 1; ctx.hint && ctx.hint('WELL FED, HE BARELY FEELS A BLADE. STOKE THE PIE OVEN: HE EATS THE POWDER PIE AND CHOKES. KNOCK A DISH OFF THE LINE WITH A JUMPING BLOW: HE GOES HUNGRY.'); } }
    return d; };
  H.barName = e => 'LORD GRUBBAG' + (GBM.gbOpen(e) ? '  CHOKING' : S && S.ward > 0 ? '  WARDED' : S && S.hungry > 0 ? '  HUNGRY' : '');
  H.end = () => { if (S) { S.waves = []; S.throws = []; S.floods = []; S.items = []; S.gravy = 0; } BOSS_PHASE.grubbag = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, ward: S.ward, hungry: S.hungry, oven: { ...S.oven }, items: S.items.map(q => ({ kind: q.kind, x: Math.round(q.x), state: q.state })), n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };
  const X = cx => v => R(v - cx), Y = cy => v => R(v - cy);
  /* THE HALL: the kitchen hatch and the pie oven (its gauge), the oven's bellows, the serving line and its hooks, the high table */
  H.drawBack = (g, cx, cy, time) => { if (!S) return; const x = X(cx), y = Y(cy), G = S.G, fy = y(G.floorY);
    /* the hatch and the oven */
    const ox = x(G.ovenX); rect(g, ox - 20, fy - 44, 40, 44, '#5a4a40'); rect(g, ox - 20, fy - 44, 40, 4, '#7a6a5a'); rect(g, ox - 10, fy - 24, 20, 16, '#1a1010');
    const hot = S.oven.st === 'bake' || S.oven.st === 'out'; if (hot) { const k = 0.6 + 0.4 * Math.sin(time * 14); rect(g, ox - 8, fy - 22, 16, 12 * k, '#ff9a3c'); rect(g, ox - 5, fy - 18, 10, 6 * k, '#ffd36b'); } else if (S.oven.st === 'cold') rect(g, ox - 8, fy - 12, 16, 3, '#c0401a');
    rect(g, ox - 14, fy - 66, 28, 20, '#3a2c22'); rect(g, ox - 12, fy - 64, 24, 16, '#1a1010');   /* the hatch */
    const bx = x(G.bellowsX); rect(g, bx - 7, fy - 3, 14, 3, '#5a3a22'); rect(g, bx - 6, fy - 11, 12, 8, '#6a4228'); rect(g, bx - 6, fy - 11, 12, 2, '#8e5e3a'); rect(g, bx + 5, fy - 9, 6, 2, '#3a3a42');
    if (S.oven.st === 'cold') { g.strokeStyle = Math.floor(time * 3) % 2 ? '#ffd36b' : 'rgba(255,211,107,0.5)'; g.strokeRect(bx - 8.5, fy - 13.5, 17, 14); }
    const k = S.oven.st === 'bake' ? 1 - S.oven.t / GB.oven.bake : S.oven.st === 'cool' ? 1 - S.oven.t / GB.oven.cool : S.oven.st === 'cold' ? 1 : 0;
    rect(g, bx - 10, fy - 20, 20, 3, '#1b1626'); rect(g, bx - 10, fy - 20, R(20 * k), 3, S.oven.st === 'cold' ? '#ffd36b' : S.oven.st === 'cool' ? '#8a8a9a' : '#ff9a3c');
    /* the serving line under the roof */
    const L0 = G.line; g.strokeStyle = '#3a3a42'; g.lineWidth = 2; g.beginPath(); g.moveTo(x(L0.x0), y(L0.y0)); g.lineTo(x(L0.x1), y(L0.y1)); g.stroke(); g.lineWidth = 1;
    for (let q = L0.x0; q < L0.x1; q += 48) rect(g, x(q) - 1, y(GBM.lineY(G, q)) - 10, 2, 10, '#5a5a62');
    /* the high table */
    const t0 = x(G.table[0]), t1 = x(G.table[1]); rect(g, t0, fy - 18, t1 - t0, 4, '#6e4a2e'); rect(g, t0 + 2, fy - 14, 3, 14, '#4a3020'); rect(g, t1 - 5, fy - 14, 3, 14, '#4a3020');
    for (let q = t0 + 8; q < t1 - 8; q += 14) { rect(g, q, fy - 21, 10, 3, '#c8ccd4'); rect(g, q + 2, fy - 24, 6, 3, '#a0602a'); } };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const p = POSE[e.mode] || POSE.sit, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06, f = e.face || -1;
    g.save(); g.translate(R(e.x - cx + (p.shake ? Math.sin(time * 50) * 2 : 0)), R(e.y - cy)); g.scale(f, 1); drawGrubbag(g, p, flash, time, e.eating ? e.eating.kind : null); g.restore();
    /* THE GRAB's arm drawn the whole way out to his hand (it reaches along the floor) */
    if (e.mode === 'grab' && e.handX != null) { const hx = R(e.handX - cx), fy = R(e.y - cy) - 8; g.strokeStyle = flash ? '#ffffff' : C.skin; g.lineWidth = 8; g.beginPath(); g.moveTo(R(e.x - cx) + f * 10, fy - 30); g.lineTo(hx, fy); g.stroke(); g.lineWidth = 1;
      for (let k = 0; k < 4; k++) rect(g, hx + f * 4 - 3, fy - 6 + k * 3, 7, 2, C.skin); } };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const e = ctx.boss, G = S.G, x = X(cx), y = Y(cy), fy = y(G.floorY);
    /* the dishes on the line (and the powder pie, its fuse sparking) */
    for (const it of S.items) { const dy = y(GBM.dishY(G, it)), dx = x(it.x), hy = y(GBM.lineY(G, it.x)); rect(g, dx - 1, hy, 1, dy - hy - 4, '#5a5a62'); rect(g, dx - 3, dy - 6, 6, 2, '#7a7a86');
      rect(g, dx - 9, dy, 18, 3, C.dish); if (it.kind === 'pie') { rect(g, dx - 7, dy - 6, 14, 6, C.pie); rect(g, dx - 6, dy - 6, 12, 2, C.pieL); rect(g, dx + 3, dy - 10, 1, 4, '#3a3a42'); if (Math.floor(time * 12) % 2) rect(g, dx + 2, dy - 12, 3, 3, '#ffd36b'); }
      else { rect(g, dx - 6, dy - 7, 12, 7, C.food); rect(g, dx - 4, dy - 9, 3, 3, C.tooth); } }
    /* the gravy */
    if (S.gravy > 0) { const from = x(GBM.gravyFrom(S)), to = x(G.chairX); g.globalAlpha = Math.min(1, S.gravy / 1.5) * 0.8; rect(g, from, fy - 3, to - from, 3, C.gravy); g.globalAlpha = 1; }
    for (const q of S.floods) { const fx = x(q.x); rect(g, fx - 6, fy - 14, 14, 14, C.gravy); rect(g, fx - 4, fy - 16, 10, 3, C.gravyL); }
    if (!ctx.bossActive || !e || e.t !== 'grubbag') return;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    for (const c of S.throws) { const q = GBM.throwAt(c, G.floorY); if (c.t > 0) { g.save(); g.translate(x(q.x), y(q.y)); g.rotate(q.k * 7); if (c.plate) { rect(g, -6, -1, 12, 3, C.dish); } else { rect(g, -5, -3, 8, 6, C.food); rect(g, 3, -1, 4, 2, C.tooth); } g.restore(); }
      g.strokeStyle = blink; g.strokeRect(x(c.tx) - GB.food.r, fy - 3, GB.food.r * 2, 3); }
    for (const q of S.waves) { if (q.delay > 0) continue; for (let k = 0; k < 3; k++) { g.strokeStyle = 'rgba(160,200,90,' + (0.85 - k * 0.25).toFixed(2) + ')'; g.beginPath(); g.arc(x(q.x) - q.dir * k * 5, fy - 2, 7 + k * 2, Math.PI, 0); g.stroke(); } }
    /* the fork's reach and the grab's line, red while they are told */
    if (e.mode === 'forkTell') { g.globalAlpha = 0.35; g.fillStyle = '#ffd36b'; const a = e.x + e.face * GB.w / 2, b = a + e.face * GB.fork.reach; for (let q = Math.min(a, b); q < Math.max(a, b); q += 9) g.fillRect(x(q), fy - 2, 5, 1); g.globalAlpha = 1; }
    if (e.mode === 'grabTell') { g.globalAlpha = 0.4; g.fillStyle = '#ff6b6b'; const a = e.x + e.face * GB.w / 2, b = a + e.face * GB.grab.reach; for (let q = Math.min(a, b); q < Math.max(a, b); q += 9) g.fillRect(x(q), fy - 6, 5, 2); g.globalAlpha = 1; }
    if (e.mode === 'slamTell') { g.globalAlpha = 0.35; g.fillStyle = '#ff6b6b'; g.fillRect(x(G.table[0] - GB.slam.shock), fy - 2, x(G.x1) - x(G.table[0] - GB.slam.shock), 2); g.globalAlpha = 1; }
    const ex = x(e.x), ey = y(e.y - GB.h / 2 - 10);
    if (GBM.gbOpen(e)) { const kk = Math.max(0, e.modeT / (e.openT0 || 1)); g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.strokeRect(ex - 34, ey - 36, 68, 66); g.lineWidth = 1; g.globalAlpha = 1;
      const by = y(e.y - GB.h - 40); ctx.text(GBM.OPEN_NAME[e.mode] || 'OPEN', ex, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(ex - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(ex - 18, by, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.strokeRect(ex - 36, ey - 38, 72, 70); g.lineWidth = 1; g.globalAlpha = 1; ctx.text('WARDED', ex, y(e.y - GB.h - 44), '#c8d8e8', 'center', 5); }
    if (S.hungry > 0 && !GBM.gbOpen(e)) ctx.text(GBM.GB_SAY.hungry, ex, y(e.y - GB.h - 54), '#8fd160', 'center', 5);
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, ex, y(e.y - GB.h - 60) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
/* HIS BESTIARY CARD: two of his poses (sitting, the belch's windup) - main.js SPR.grubbagCard */
export function bakeGrubbagCard() {
  const fr = [0, 1].map(i => { const [c, g] = canvas(72, 60); g.imageSmoothingEnabled = false; g.save(); g.translate(40, 58); g.scale(-0.66, 0.66); drawGrubbag(g, POSE[i ? 'belchTell' : 'sit'], false, i * 0.3, null); g.restore(); return c; });
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 36, ay: 58, w: 64, h: 56 };
}
export const _drawGrubbag = drawGrubbag;
