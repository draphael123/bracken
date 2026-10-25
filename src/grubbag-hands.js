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
import * as GA from './redraw/grubbag_art.js';   /* (claude/kitchengateart) him, his chair, the oven, the table, the dishes */
const { GB } = GBM;

const SOUND = { belchTell: s => (s.charge || s.tell)(), belch: s => (s.boreRoar || s.roar || s.thud)(), throwTell: s => (s.gobShout || s.tell)(), throw: s => (s.throwWhoosh || s.whoosh || s.tell)(),
  forkTell: s => (s.charge || s.tell)(), stab: s => (s.slash || s.tell)(), slamTell: s => (s.gobShout || s.roar || s.tell)(), slam: s => { (s.heavy || s.thud)(); (s.crack || s.thud)(); },
  floodTell: s => (s.tell)(), flood: s => (s.splash || s.thud)(), flopTell: s => (s.boreRoar || s.roar || s.tell)(), flopUp: s => (s.whoosh || s.throwWhoosh || s.thud)(), flop: s => { (s.heavy || s.thud)(); (s.boom || s.thud)(); (s.crack || s.thud)(); }, grabTell: s => (s.roar || s.tell)(), grab: s => (s.whoosh || s.throwWhoosh || s.tell)(),
  roar: s => (s.boreRoar || s.roar)(), chew: s => (s.thud || s.tell)(), boom: s => { (s.boom || s.heavy || s.thud)(); (s.puff || s.thud)(); }, cough: s => (s.gobDieLow || s.thud)(),
  pie: s => (s.clank || s.thud)(), smash: s => (s.crack || s.glass || s.thud)(), plate: s => (s.crack || s.thud)(), thud: s => (s.thud)(), clank: s => (s.clank || s.thud)() };
const C = { skin: '#7a8a52', skinD: '#4e5a32', skinL: '#a0b070', robe: '#6a2a3a', robeD: '#3e1622', gold: '#ffd36b', goldD: '#b08a30', chair: '#4a3020', chairL: '#6e4a2e', iron: '#3a3a42', ironL: '#7a7a86',
  fork: '#c8ccd4', forkD: '#8a8e96', eye: '#ffe9a0', red: '#ff4a2a', mouth: '#2a0e0e', tooth: '#efe6cf', dish: '#c8ccd4', food: '#a0602a', pie: '#c0302a', pieL: '#ff8a5c', gravy: '#7a4a22', gravyL: '#a8743a', copper: '#b8673a' };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
/* THE POSE A MODE WEARS (local px, facing right, his seat at 0,0): head [dx, dy] (his head's own offset), belly swell, near arm's hand [x, y], far arm's hand, the fork [x, y, angle, shaft]
   (null: set down out of sight), lean, eyes, mouth, what he holds. (claude/grubbagbig, Daniel 10-25 "enormous, double the queen, extremely fat": REDRAWN BIG - every number here is at his new
   size, ~225 x 157 px seated in a chair 180 high; the fork's stab ends where GB.fork.reach says it does: 50 + 156 = GB.w / 2 + GB.fork.reach.) */
const FORK_REST = [130, -40, -1.42, 76];   /* stuck upright in the table's end while both hands are busy */
export const POSE = {
  sleep: { head: [4, 10], belly: 1, hand: [40, -50], far: [-50, -50], fork: [60, -6, 0.02, 120], eyes: 'shut', mouth: 'shut', zzz: true },
  wake: { head: [0, -4], belly: 1, hand: [66, -130], far: [-70, -126], fork: [66, -130, -1.25, 80], eyes: 'red', mouth: 'open' },
  sit: { head: [0, 0], belly: 1, hand: [58, -70], far: [-62, -66], fork: [58, -70, -1.48, 80], eyes: 'open', mouth: 'chew' },
  belchTell: { head: [-6, -8], belly: 1.1, hand: [52, -92], far: [-64, -90], fork: [52, -92, -1.48, 72], eyes: 'red', mouth: 'shut', tilt: -0.3 },
  belch: { head: [8, 4], belly: 0.96, hand: [66, -66], far: [-64, -64], fork: [66, -66, -1.3, 80], eyes: 'red', mouth: 'wide', rings: true },
  throwTell: { head: [-4, -4], belly: 1, hand: [-20, -158], far: [-62, -66], fork: FORK_REST, eyes: 'red', mouth: 'open', item: 'drumstick' },
  throw: { head: [8, 0], belly: 1, hand: [104, -96], far: [-62, -66], fork: FORK_REST, eyes: 'open', mouth: 'open', lean: 8 },
  forkTell: { head: [0, 0], belly: 1, hand: [10, -46], far: [-62, -66], fork: [-40, -34, 0.06, 120], eyes: 'red', mouth: 'shut', lean: -6 },
  fork: { head: [8, 4], belly: 1, hand: [86, -28], far: [-62, -66], fork: [50, -26, 0.08, 120], eyes: 'red', mouth: 'open', lean: 12, long: true },
  slamTell: { head: [0, -8], belly: 1.04, hand: [46, -180], far: [-36, -182], fork: FORK_REST, eyes: 'red', mouth: 'wide' },
  slam: { head: [8, 8], belly: 1, hand: [104, -46], far: [80, -48], fork: FORK_REST, eyes: 'red', mouth: 'open', lean: 12, plates: true },
  floodTell: { head: [-2, 0], belly: 1, hand: [96, -72], far: [-62, -66], fork: null, eyes: 'red', mouth: 'open', lean: 6, cauldron: 0.2 },
  flood: { head: [6, 4], belly: 1, hand: [120, -58], far: [-62, -66], fork: null, eyes: 'open', mouth: 'open', lean: 10, cauldron: 1.2 },
  grabTell: { head: [10, 6], belly: 1, hand: [-10, -96], far: [-62, -66], fork: FORK_REST, eyes: 'red', mouth: 'wide', lean: 18, fingers: true },
  grab: { head: [16, 10], belly: 1, hand: [92, -30], far: [-62, -66], fork: FORK_REST, eyes: 'red', mouth: 'wide', lean: 24, arm: true },
  eat: { head: [0, -4], belly: 1.05, hand: [40, -118], far: [-62, -66], fork: FORK_REST, eyes: 'shut', mouth: 'chew', item: 'dish' },
  choke: { head: [0, -6], belly: 1.1, hand: [30, -112], far: [0, -114], fork: [70, -6, 0.02, 120], eyes: 'bulge', mouth: 'wide', smoke: true, shake: true, red: true },
  recover: { head: [4, 4], belly: 1, hand: [52, -88], far: [-62, -72], fork: [52, -88, -1.48, 76], eyes: 'open', mouth: 'open', cough: true },
  /* THE BELLY FLOP (claude/grubbagbig, Daniel 10-25): the heave (both fists on the chair's arms, up off the seat, belly swelling, mouth wide), up and over (out of the chair, fists
     flung up), belly down on the boards (sunk to the floor line, the belly spread wide, arms splayed flat, eyes bulging), and the roll back up (half up, pushing off the floor) */
  flopTell: { head: [6, -10], belly: 1.08, hand: [116, -66], far: [-124, -64], fork: FORK_REST, eyes: 'red', mouth: 'wide', lean: 14, lift: 20 },
  flop: { head: [4, -6], belly: 1.04, hand: [86, -160], far: [-80, -156], fork: null, eyes: 'red', mouth: 'wide', lean: 6, noChair: true },
  flopDown: { head: [8, 14], belly: 1.1, wide: 1.22, tall: 0.86, hand: [132, -40], far: [-134, -40], fork: null, eyes: 'bulge', mouth: 'wide', lean: 4, noChair: true, sink: 30 },
  flopRoll: { head: [0, 6], belly: 1.04, wide: 1.1, hand: [104, -30], far: [-108, -32], fork: null, eyes: 'open', mouth: 'open', lean: -8, noChair: true, sink: 14, cough: true },
};
/* HIM (claude/kitchengateart: src/redraw/grubbag_art.js draws him; POSE above is still the contract) */
function drawGrubbag(g, p, flash, time, holding) { GA.drawGrubbagArt(g, p, flash, time, holding); }

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
  const bzD = d => Math.round((ctx.heroId && ctx.heroId() === 'berserker' ? d * GB.bz.hurt : d) * (GB.dmgMul || 1));
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.grubbag = ph; },
      mark: m => ctx.number(e.x, e.y - GB.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      dust: (x, y, n) => ctx.dust(x, y, n),
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - GB.h / 2, GB.w * 0.6, '#ffd36b'); ctx.burst(x - e.face * 30, y - GB.h, 34, ['#ff9a3c', '#ffd36b', '#4a4440', '#fff6c8'], 170, 0.9); } else if (k === 'ward') ctx.ring(x, y - GB.h / 2, GB.w * 0.62, '#c8d8e8');
        else if (k === 'flop') { ctx.ring(x, y - 10, GB.flop.crush + 20, '#c9a878'); ctx.burst(x, y - 6, 40, ['#8a7a64', '#c9b28c', '#5a4a3a', '#e8dcc0'], 220, 0.8); } },
      oven: on => { if (on) ctx.burst(S.G.ovenX, S.G.floorY - 26, 20, ['#ffd36b', '#ff9a3c', '#fff6c8'], 90, 0.5); },
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
    if (!S.warm) S.warm = !GA.warmOne(POSE);   /* (claude/grubbagbig) bake his poses one a frame */
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - GB.markH - 16, GBM.GB_SAY.wake, '#ffd36b'); SOUND.roar(ctx.sfx); ctx.shake(5); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number(S.G.mid, S.G.floorY - 130, GBM.GB_SAY.rule, '#ffd36b'); ctx.hint && ctx.hint(GBM.GB_SAY.rule); }
    GBM.stepGrubbag(e, S, dt, heroes(), world(e));
    /* THE GRAVY on the floor: slow and slick behind its wave, and for GB.flood.lie s after */
    if (S.gravy > 0) { const from = GBM.gravyFrom(S); for (const pp of ctx.players) if (pp.ground && Math.abs(pp.y - S.G.floorY) < 3 && pp.x > from) { const cap = 92 * GB.flood.slow; if (Math.abs(pp.vx) > cap) pp.vx = Math.sign(pp.vx) * cap; } }
    e.phase = S.ph; e.open = GBM.gbOpen(e) ? Math.max(0, e.modeT) : 0; e.openKind = e.mode;
  };
  /* A HERO'S BLOW (main.js attackBox): on the oven's bellows it stokes the oven; on a dish riding the line it knocks it off */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e) return; const w = world(e), G = S.G;
    const bb = { l: G.bellowsX - GB.oven.box, r: G.bellowsX + GB.oven.box, t: G.floorY - 30, b: G.floorY };
    if (hb.l < bb.r && hb.r > bb.l && hb.t < bb.b && hb.b > bb.t && (!ctx.hitOnce || ctx.hitOnce(S.oven))) GBM.stokeOven(S, w);
    for (const it of S.items) { if (it.state !== 'ride') continue; const b = GBM.dishBox(G, it); if (hb.l < b.r && hb.r > b.l && hb.t < b.b && hb.b > b.t && (!ctx.hitOnce || ctx.hitOnce(it))) GBM.smashItem(S, it, w); } };
  H.take = (e, dmg, fromX, pl, tag) => { if (!S) return dmg; const [d, word] = GBM.takeBlow(e, S, dmg, pl);
    S.n[word === 'WARDED' ? 'wardHits' : word ? 'fedHits' : GBM.gbOpen(e) ? 'openHits' : 'fedHits']++;
    if (word) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && word === 'WARDED' ? ctx.sfx.clank() : (ctx.sfx.thud && ctx.sfx.thud()); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * GB.w / 2, e.y - GB.h / 2, sd, 4);
      if (!S.told.fed && word === 'WELL FED') { S.told.fed = 1; ctx.hint && ctx.hint('WELL FED, HE BARELY FEELS A BLADE. STOKE THE PIE OVEN: HE EATS THE POWDER PIE AND CHOKES. KNOCK A DISH OFF THE LINE WITH A JUMPING BLOW: HE GOES HUNGRY.'); } }
    return d; };
  /* THE CAMERA (the boss camera: the whole of him in the picture, and your feet): he stands ~200 px from the floor in his chair and the belly flop lifts him higher - so the
     camera holds the hall from the floor up to his top (and a margin) when the view is tall enough, and never loses the floor */
  H.camY = (ty, VH) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive || !ctx.boss || !ctx.boss.alive || ctx.boss.t !== 'grubbag') return ty; const top = S.G.floorY - GB.markH - GB.flop.rise + 8; return Math.max(S.G.floorY + 28 - VH, Math.min(ty, top)); };
  H.barName = e => 'LORD GRUBBAG' + (GBM.gbOpen(e) ? '  CHOKING' : S && S.ward > 0 ? '  WARDED' : S && S.hungry > 0 ? '  HUNGRY' : '');
  H.end = () => { const e = ctx.boss; if (e && e.t === 'grubbag') { e.w = GB.w; e.h = GB.h; } if (S) { S.waves = []; S.throws = []; S.floods = []; S.items = []; S.gravy = 0; } BOSS_PHASE.grubbag = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, ward: S.ward, hungry: S.hungry, oven: { ...S.oven }, items: S.items.map(q => ({ kind: q.kind, x: Math.round(q.x), state: q.state })), n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };
  const X = cx => v => R(v - cx), Y = cy => v => R(v - cy);
  /* THE HALL: the kitchen hatch and the pie oven (its gauge), the oven's bellows, the serving line and its hooks, the high table */
  H.drawBack = (g, cx, cy, time) => { if (!S) return; const x = X(cx), y = Y(cy), G = S.G, fy = y(G.floorY), L0 = G.line;
    GA.drawLine(g, x(L0.x0), y(L0.y0), x(L0.x1), y(L0.y1), qs => y(GBM.lineY(G, qs + cx)), 48);
    GA.drawOven(g, x(G.ovenX), fy, S.oven.st, time, G.floorY - L0.y0);
    const bx = x(G.bellowsX); GA.drawBellows(g, bx, fy, S.oven.st === 'cold', time, 0);
    const k = S.oven.st === 'bake' ? 1 - S.oven.t / GB.oven.bake : S.oven.st === 'cool' ? 1 - S.oven.t / GB.oven.cool : S.oven.st === 'cold' ? 1 : 0;
    rect(g, bx - 15, fy - 36, 30, 6, '#1a1410'); rect(g, bx - 14, fy - 35, 28, 4, '#1b1626'); rect(g, bx - 14, fy - 35, R(28 * k), 4, S.oven.st === 'cold' ? '#ffd36b' : S.oven.st === 'cool' ? '#8a8a9a' : '#ff9a3c'); rect(g, bx - 15, fy - 36, 30, 1, '#c9a040');
    GA.drawTable(g, x(G.table[0]), x(G.table[1]), fy, time); };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const p = POSE[e.mode] || POSE.sit, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06, f = e.face || -1;
    if (p.noChair) { g.save(); g.translate(R(S.G.chairX - cx), R(S.G.floorY - cy)); g.scale(e.chairFace || -1, 1); GA.drawChairArt(g); g.restore(); }   /* (the belly flop) his chair, empty */
    g.save(); g.translate(R(e.x - cx + (p.shake ? Math.sin(time * 50) * 2 : 0)), R(e.y - cy)); g.scale(f, 1); drawGrubbag(g, p, flash, time, e.eating ? e.eating.kind : null); g.restore();
    /* THE GRAB's arm drawn the whole way out to his hand (it reaches along the floor) */
    if (e.mode === 'grab' && e.handX != null) { const el = POSE.grab.hand, ex = R(e.x - cx + f * el[0]), ey = R(e.y - cy + el[1]), hx = R(e.handX - cx), hy = R(e.y - cy) - 12; GA.drawGrabArm(g, ex, ey, hx, hy, flash); } };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const e = ctx.boss, G = S.G, x = X(cx), y = Y(cy), fy = y(G.floorY);
    /* the dishes on the line (and the powder pie, its fuse sparking) */
    for (const it of S.items) GA.drawHooked(g, x(it.x), y(GBM.lineY(G, it.x)), y(GBM.dishY(G, it)), it.kind, time);
    /* the gravy */
    if (S.gravy > 0) { const from = x(GBM.gravyFrom(S)), to = x(G.chairX - GB.flood.from * (e && e.face ? -e.face : 1)); g.globalAlpha = Math.min(1, S.gravy / 1.5) * 0.8; rect(g, from, fy - 3, to - from, 3, C.gravy); g.globalAlpha = 1; }
    for (const q of S.floods) { const fx = x(q.x); rect(g, fx - 9, fy - 16, 20, 16, C.gravy); rect(g, fx - 6, fy - 19, 14, 4, C.gravyL); rect(g, fx + 9, fy - 8, 8, 8, C.gravy); }
    if (!ctx.bossActive || !e || e.t !== 'grubbag') return;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    for (const c of S.throws) { const q = GBM.throwAt(c, G.floorY); if (c.t > 0) { g.save(); g.translate(x(q.x), y(q.y)); g.rotate(q.k * 7); if (c.plate) { rect(g, -6, -1, 12, 3, C.dish); } else { rect(g, -5, -3, 8, 6, C.food); rect(g, 3, -1, 4, 2, C.tooth); } g.restore(); }
      g.strokeStyle = blink; g.strokeRect(x(c.tx) - GB.food.r, fy - 3, GB.food.r * 2, 3); }
    for (const q of S.waves) { if (q.delay > 0) continue; if (q.kind === 'flop') { for (let k = 0; k < 4; k++) { g.strokeStyle = 'rgba(201,178,140,' + (0.9 - k * 0.2).toFixed(2) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(x(q.x) - q.dir * k * 7, fy - 1, 9 + k * 4, Math.PI, 0); g.stroke(); } g.lineWidth = 1; rect(g, x(q.x) - 3, fy - 22, 6, 4, '#8a7a64'); continue; }
      for (let k = 0; k < 3; k++) { g.strokeStyle = 'rgba(160,200,90,' + (0.85 - k * 0.25).toFixed(2) + ')'; g.beginPath(); g.arc(x(q.x) - q.dir * k * 5, fy - 2, 7 + k * 2, Math.PI, 0); g.stroke(); } }
    /* the fork's reach and the grab's line, red while they are told */
    if (e.mode === 'forkTell') { g.globalAlpha = 0.35; g.fillStyle = '#ffd36b'; const a = e.x + e.face * GB.w / 2, b = a + e.face * GB.fork.reach; for (let q = Math.min(a, b); q < Math.max(a, b); q += 9) g.fillRect(x(q), fy - 2, 5, 1); g.globalAlpha = 1; }
    if (e.mode === 'grabTell') { g.globalAlpha = 0.4; g.fillStyle = '#ff6b6b'; const a = e.x + e.face * GB.w / 2, b = a + e.face * GB.grab.reach; for (let q = Math.min(a, b); q < Math.max(a, b); q += 9) g.fillRect(x(q), fy - 6, 5, 2); g.globalAlpha = 1; }
    /* THE BELLY FLOP: his shadow on the floor where he will land (darker as he comes), the crush's two ends blinking red; the shock's dust */
    if ((e.mode === 'flopTell' || e.mode === 'flop') && e.landX != null) { const F = GB.flop, k = e.mode === 'flopTell' ? 0.35 + 0.25 * (1 - Math.max(0, e.modeT) / F.tell[0]) : 0.6 + 0.35 * (1 - Math.max(0, e.modeT) / F.air), lx = x(e.landX);
      g.globalAlpha = k; g.fillStyle = '#120a10'; g.beginPath(); g.ellipse(lx, fy - 1, F.crush * (0.7 + 0.3 * k), 7, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      g.fillStyle = blink; for (const sd of [-1, 1]) { const ex2 = lx + sd * F.crush; g.fillRect(ex2 - (sd > 0 ? 2 : 0), fy - 14, 2, 14); g.fillRect(ex2 - (sd > 0 ? 8 : 0), fy - 14, 8, 2); }
      g.globalAlpha = 0.22 + 0.2 * Math.sin(time * 14); g.fillStyle = '#ff4a2a'; g.fillRect(lx - F.crush, fy - 5, F.crush * 2, 5); g.globalAlpha = 0.6; g.fillStyle = blink; for (let q = lx - F.crush; q < lx + F.crush; q += 10) g.fillRect(q, fy - 2, 6, 2); g.globalAlpha = 1; }
    if (e.mode === 'flopDown') ctx.text(GBM.GB_SAY.winded, x(e.x), y(e.y - 178), '#ffd36b', 'center', 6);
    if (e.mode === 'slamTell') { g.globalAlpha = 0.35; g.fillStyle = '#ff6b6b'; g.fillRect(x(G.table[0] - GB.slam.shock), fy - 2, x(G.x1) - x(G.table[0] - GB.slam.shock), 2); g.globalAlpha = 1; }
    const ex = x(e.x);
    const bw = (e.w || GB.w) + 12, bh = (e.h || GB.h) + 12, by0 = y(e.y - (e.h || GB.h) - 8);
    if (GBM.gbOpen(e)) { const kk = Math.max(0, e.modeT / (e.openT0 || 1)); g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.strokeRect(ex - bw / 2, by0, bw, bh); g.lineWidth = 1; g.globalAlpha = 1;
      const by = y(e.y - GB.h - 40); ctx.text(GBM.OPEN_NAME[e.mode] || 'OPEN', ex, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(ex - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(ex - 18, by, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.strokeRect(ex - bw / 2 - 2, by0 - 2, bw + 4, bh + 4); g.lineWidth = 1; g.globalAlpha = 1; ctx.text('WARDED', ex, y(e.y - GB.h - 44), '#c8d8e8', 'center', 5); }
    if (S.hungry > 0 && !GBM.gbOpen(e)) ctx.text(GBM.GB_SAY.hungry, ex, y(e.y - GB.h - 54), '#8fd160', 'center', 5);
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, ex, y(e.y - GB.h - 60) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
/* HIS BESTIARY CARD (claude/grubbagbig): a portrait - his head, chins, collar, chest and the top of the belly, two poses (sitting, the belch's windup) - drawn at full size and halved
   (the whole of him would be a smudge in the card's 64 px), the halving's soft edges cut back to hard alpha */
export function bakeGrubbagCard() {
  const CW = 72, CH = 60, fr = [0, 1].map(i => { const [big, bg] = canvas(CW * 2, CH * 2); bg.translate(CW + 4, 194); bg.scale(-1, 1); drawGrubbag(bg, POSE[i ? 'belchTell' : 'sit'], false, i * 0.3, null);
    const [c, g] = canvas(CW, CH); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(big, 0, 0, CW, CH);
    const d = g.getImageData(0, 0, CW, CH); for (let q = 3; q < d.data.length; q += 4) d.data[q] = d.data[q] > 110 ? 255 : 0; g.putImageData(d, 0, 0); return c; });
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 36, ay: 58, w: 64, h: 56 };
}
export const _drawGrubbag = drawGrubbag;
