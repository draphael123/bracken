// src/grubbag-hands.js - LORD GRUBBAG THE GLUTTON's HANDS (claude/kitchengate; REWORKED by claude/kitchengate2, Daniel 10-27). src/grubbag.js is the fight (pure); this binds it to the
// world: his told blows on the heroes (keyed once a blow), THE SERVING LINE (the conveyor carries whoever stands on it; a hero's blow knocks a dish or a chilli off it, or bats a
// bomb along it: strike(hb)), the pepper stove's bellows (strike(hb)), the bell's attendants (ctx.spawnFoe) - and the drawing.
// GREYBOX (the sonnet art lane draws the final): he SITS - no fork, no tureen in front of him, nothing that crosses his chair. Every move its OWN windup and release pose (B16, POSE):
// the lob (a ham hoisted over his head -> flung up), the fling (a plate drawn back by his ear -> flung flat), the belch (head back, belly swelling -> jaw dropped), the sweep (arm
// drawn back across his belly -> swept out along the platter), the grease (a fist up on the cauldron's chain -> yanked down), the bell (a hand bell lifted -> rung), the grab
// (leaning out, arm drawn back, fingers spread -> flung out over the floor and the line); eating, gulping, STUNNED (the bomb gone off in him: eyes bulging, smoke), TOO HOT (red,
// steam, fanning his mouth), the cough. THE SHARED READ (B10): OPEN = a gold ring and a timer bar; WARDED = a pale ring and the word; WELL FED = a turned blow slaps dull and says so.
// ART HOOKS for the art lane (src/redraw/grubbag_art.js): drawGrubbagArt (POSE contract), drawBelt, drawHatch, drawOven (the pepper stove), drawBellows, drawPlatter, drawCauldron,
// dish(kind: dish | bomb | chilli). main.js calls: spawnBoss, owns, on, update, take, strike, drawBack, drawBoss, drawOver, barName, end, read, show, clear, camY.
import * as GBM from './grubbag.js';
import { BOSS_PHASE } from './boss-music.js';
import { canvas, flipX, whiten } from './px.js';
import * as GA from './redraw/grubbag_art.js';
import { lineY as zLineY, norm as zNorm } from './zipline.js';
const { GB } = GBM;

const SOUND = { lobTell: s => (s.gobShout || s.tell)(), throw: s => (s.throwWhoosh || s.whoosh || s.tell)(), flingTell: s => (s.charge || s.tell)(), fling: s => (s.throwWhoosh || s.whoosh || s.tell)(),
  belchTell: s => (s.charge || s.tell)(), belch: s => (s.boreRoar || s.roar || s.thud)(), sweepTell: s => (s.tell)(), sweep: s => { (s.crack || s.thud)(); (s.whoosh || s.thud)(); },
  greaseTell: s => (s.gobShout || s.roar || s.tell)(), grease: s => { (s.splash || s.thud)(); (s.fireWhoosh || s.whoosh || s.thud)(); }, bellTell: s => (s.tell)(), bell: s => (s.bell || s.clank || s.tell)(),
  grabTell: s => (s.roar || s.tell)(), grab: s => (s.whoosh || s.throwWhoosh || s.tell)(), roar: s => (s.boreRoar || s.roar)(), chew: s => (s.thud || s.tell)(),
  boom: s => { (s.boom || s.heavy || s.thud)(); (s.puff || s.thud)(); }, hot: s => (s.sizzle || s.puff || s.thud)(), cough: s => (s.gobDieLow || s.thud)(), hatch: s => (s.clank || s.thud)(),
  bat: s => (s.clank || s.thud)(), smash: s => (s.crack || s.glass || s.thud)(), thud: s => (s.thud)(), clank: s => (s.clank || s.thud)() };
const C = { red: '#ff4a2a', dish: '#c8ccd4', food: '#a0602a', tooth: '#efe6cf', grease: '#c88a2a', fire: '#ff9a3c', fireL: '#ffe9a0', fireD: '#c0401a' };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
/* THE POSE A MODE WEARS (local px, facing right, his seat at 0,0): head [dx, dy], belly swell, near hand [x, y], far hand, lean, eyes, mouth, what he holds (item), and flags.
   NO FORK, NO TUREEN (Daniel 10-27: they clipped); every hand stays in front of the chair or over his head (the chair's arms are at x 86..120, y -70). */
export const POSE = {
  sleep: { head: [4, 10], belly: 1, hand: [40, -50], far: [-50, -50], eyes: 'shut', mouth: 'shut', zzz: true },
  wake: { head: [0, -4], belly: 1, hand: [66, -130], far: [-70, -126], eyes: 'red', mouth: 'open' },
  sit: { head: [0, 0], belly: 1, hand: [58, -70], far: [-62, -66], eyes: 'open', mouth: 'chew' },
  eat: { head: [0, -4], belly: 1.05, hand: [40, -118], far: [-62, -66], eyes: 'shut', mouth: 'chew', item: 'dish' },
  eatSwell: { head: [0, -8], belly: 1.2, hand: [40, -118], far: [-70, -80], eyes: 'shut', mouth: 'chew', item: 'dish', tilt: -0.1 },   /* (claude/kitchengate4) THE FOOD BONUS: the belly swells the first GB.swell s of a dish (drawn over the eat pose) */
  gulp: { head: [-4, -10], belly: 1.06, hand: [34, -124], far: [-62, -66], eyes: 'bulge', mouth: 'wide', item: 'dish', tilt: -0.2 },
  lobTell: { head: [-4, -6], belly: 1, hand: [12, -174], far: [-62, -66], eyes: 'red', mouth: 'open', item: 'ham', lean: -6 },
  lob: { head: [6, -2], belly: 1, hand: [96, -166], far: [-62, -66], eyes: 'open', mouth: 'open', lean: 8 },
  flingTell: { head: [-2, 0], belly: 1, hand: [-26, -128], far: [-62, -66], eyes: 'red', mouth: 'shut', item: 'plate', lean: -8 },
  fling: { head: [8, 2], belly: 1, hand: [116, -62], far: [-62, -66], eyes: 'red', mouth: 'open', lean: 12 },
  belchTell: { head: [-6, -8], belly: 1.1, hand: [52, -92], far: [-64, -90], eyes: 'red', mouth: 'shut', tilt: -0.3 },
  belch: { head: [8, 4], belly: 0.96, hand: [66, -66], far: [-64, -64], eyes: 'red', mouth: 'wide', rings: true },
  sweepTell: { head: [0, 0], belly: 1, hand: [-34, -56], far: [-62, -66], eyes: 'red', mouth: 'shut', lean: -8, fingers: true },
  sweep: { head: [8, 4], belly: 1, hand: [128, -38], far: [-62, -66], eyes: 'red', mouth: 'open', lean: 16, fingers: true },
  greaseTell: { head: [4, -6], belly: 1.02, hand: [76, -188], far: [-62, -66], eyes: 'red', mouth: 'wide', lean: 4, chain: true },
  grease: { head: [6, 2], belly: 1, hand: [84, -116], far: [-62, -66], eyes: 'red', mouth: 'open', lean: 10, chain: true },
  bellTell: { head: [0, -4], belly: 1, hand: [34, -170], far: [-62, -66], eyes: 'red', mouth: 'open', item: 'bell' },
  bell: { head: [6, 0], belly: 1, hand: [62, -150], far: [-62, -66], eyes: 'open', mouth: 'wide', item: 'bell', ring: true },
  grabTell: { head: [10, 6], belly: 1, hand: [-10, -96], far: [-62, -66], eyes: 'red', mouth: 'wide', lean: 18, fingers: true },
  grab: { head: [16, 10], belly: 1, hand: [92, -30], far: [-62, -66], eyes: 'red', mouth: 'wide', lean: 24, arm: true },
  stun: { head: [0, -6], belly: 1.12, hand: [30, -112], far: [0, -114], eyes: 'bulge', mouth: 'wide', smoke: true, shake: true },
  hot: { head: [4, -4], belly: 1.04, hand: [70, -134], far: [-20, -128], eyes: 'bulge', mouth: 'wide', smoke: true, steam: true, red: true, fingers: true },
  recover: { head: [4, 4], belly: 1, hand: [52, -88], far: [-62, -72], eyes: 'open', mouth: 'open', cough: true },
};
function drawGrubbag(g, p, flash, time, holding) { GA.drawGrubbagArt(g, p, flash, time, holding); }

export function makeGrubbagHands(ctx) {
  let S = null; const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'grubbag' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'grubbag';
  const calm = () => { if (S) for (const z of S.G.rails) if (z.gbBase !== undefined) z.speed = z.gbBase; };   /* (claude/kitchengate4) the hook rails back to their own pace */
  H.clear = () => { calm(); S = null; BOSS_PHASE.grubbag = 1; };
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
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - GB.h / 2, GB.w * 0.6, '#ffd36b'); ctx.burst(x - 30, y - GB.h, 34, ['#ff9a3c', '#ffd36b', '#4a4440', '#fff6c8'], 170, 0.9); }
        else if (k === 'ward') ctx.ring(x, y - GB.h / 2, GB.w * 0.62, '#c8d8e8'); else if (k === 'heal') { ctx.ring(x, y - GB.h / 2, GB.w * 0.55, '#8fd160'); ctx.burst(x - 20, y - GB.h, 14, ['#8fd160', '#c8f0a0'], 60, 0.7); } },
      stove: on => { if (on) ctx.burst(S.G.ovenX, S.G.floorY - 26, 20, ['#ff6b2c', '#ff9a3c', '#fff6c8'], 90, 0.5); },
      burst: (x, y) => ctx.burst(x, y, 22, ['#ff9a3c', '#ffd36b', '#4a4440'], 140, 0.7),
      smash: (x, y) => ctx.burst(x, y - 3, 14, ['#c8ccd4', '#a0602a', '#e8dcc0'], 110, 0.6),
      spawnAdd: (x, y, delay, k) => { if (!ctx.spawnFoe) return null; const RA = S.G.rails.find(z => z.hand);
        if (RA) { zNorm(RA); x = RA.x0 + 6; y = zLineY(RA, x) + RA.hang; }   /* (claude/kitchengate4) ORDER UP: the attendants RIDE DOWN THE HOOKS from the hatch (H.ride) */
        const a = ctx.spawnFoe('attendant', x, y, 1); if (a) { a.gbAdd = true; a.delayT = 0; a.face = 1; if (RA) { a.gbRide = { z: RA, wait: (k || 0) * GB.bell.ride, hp: a.hp }; a.x = x; a.y = y; } } return a; },
      hit: (bx, d, name, o = {}) => { let out = null; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          let res = null; hurt(name, () => { res = ctx.damagePlayer(e.x, bzD(d), { who: e, name, unblockable: !o.blockable }); }); out = out || res;
          if (res === 'hit' && o.throwV) { P.vx = o.throwV; P.vy = Math.min(P.vy || 0, -220); } });
        return out; },
      hitArea: (bx, d, name, key) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return; if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, key)) return; hurt(name, () => ctx.damagePlayer((bx[0] + bx[1]) / 2, bzD(d), { who: e, name, unblockable: true })); }); },
      hitHero: (h, d, name, key, o = {}) => { const pp = h.pp; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return; if (key && keyed(pp, key)) return; hurt(name, () => ctx.damagePlayer(e.x, bzD(d), { who: e, name, unblockable: !o.blockable, fire: name === 'grease' || !!o.fire, spare: !!o.spare, noKnock: !!o.noKnock })); }); },
    };
  }
  H.update = (e, dt) => {
    if (!S || !e.alive || !A()) return;
    if (!S.warm) S.warm = !GA.warmOne(POSE);   /* bake his poses one a frame */
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - GB.markH - 16, GBM.GB_SAY.wake, '#ffd36b'); SOUND.roar(ctx.sfx); ctx.shake(5); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number(S.G.mid, S.G.floorY - 130, GBM.GB_SAY.rule, '#ffd36b'); ctx.hint && ctx.hint(GBM.GB_SAY.rule); }
    GBM.stepGrubbag(e, S, dt, heroes(), world(e));
    /* THE SERVING LINE carries whoever stands on it toward him (the level's conveyors) */
    if (e.mode !== 'sleep') { const v = GBM.lineV(S), B = S.G.belt; S.scroll = (S.scroll || 0) + v * dt; for (const pp of ctx.players) if (!pp.dead && GBM.onBelt(S.G, pp) && !pp.zip) pp.x = Math.min(B.x1 + 6, pp.x + v * dt * (S.G.trench && (pp.vx || 0) < -20 ? 0.5 : 1)); }   /* (claude/kitchengate4) walking back against it over the trench it carries you half as hard: the line is the way back to the hatch now */
    /* (claude/kitchengate4) THE HOOK RAILS: ORDER UP runs them fast (their pace is read each ride frame: src/zipline.js) - and THE PLATTER DROP: a hero let go of an arena rail who
       lands on his platter knocks the food flying and him off his feet (src/grubbag.js platterDrop); a hero left standing on the platter is tipped off it toward him */
    for (const z of S.G.rails) { if (z.gbBase === undefined) z.gbBase = z.speed || 200; z.speed = z.gbBase * (S.rush > 0 ? GB.bell.hook : 1); }
    if (e.mode !== 'sleep') { const w = world(e), G = S.G, t = ctx.time();
      for (const pp of ctx.players) { if (pp.dead) { pp.gbRail = null; continue; }
        if (pp.zip && G.rails.includes(pp.zip)) { pp.gbRail = pp.zip; pp.gbRailT = t; continue; }
        if (pp.gbRail && pp.ground) { pp.gbRail = null;
          if (t - pp.gbRailT < 1.6 && GBM.onPlatter(G, pp)) { const r = GBM.platterDrop(e, S, w, pp.x); if (r) { S.dropFx = { x: pp.x, t: 0.8 }; if (r === 'open' && !S.told.dropOpen) { S.told.dropOpen = 1; ctx.hint && ctx.hint(GBM.GB_SAY.drop + ': THE FOOD GOES FLYING. CUT HIM NOW.'); } } }
        }
        if (pp.ground && GBM.onPlatter(G, pp)) { pp.gbPlatT = (pp.gbPlatT || 0) + dt; if (pp.gbPlatT > GB.drop.shove) pp.x = Math.min(G.platter.x1 + 10, pp.x + GB.drop.shoveV * dt); } else pp.gbPlatT = 0; }
      /* an attendant off the hooks and down on the coals: the coals take him */
      const T = G.trench; if (T) for (const a of S.adds) if (a && a.alive && !a.gbRide && Math.abs(a.y - T.y) < 5 && a.x >= T.x0 - 8 && a.x <= T.x1 + 8) { a.hp = 0; a.alive = false; S.n.addFalls++; ctx.burst(a.x, a.y - 8, 16, ['#ff6b2c', '#ffd36b', '#4a4440'], 90, 0.6); ctx.number(a.x, a.y - 30, GBM.GB_SAY.addFall, '#ff9a5c'); } }
    if (S.dropFx) { S.dropFx.t -= dt; if (S.dropFx.t <= 0) S.dropFx = null; }
    e.phase = S.ph; e.open = GBM.gbOpen(e) ? Math.max(0, e.modeT) : 0; e.openKind = e.mode;
  };
  /* (claude/kitchengate4) AN ATTENDANT ON THE HOOKS (main.js updateEnemies, one guarded line: while a.gbRide is set his own machine waits): he waits his turn at the hatch, rides the
     lower rail, swings across to the upper where it starts and rides it to its end over the platter, and drops off there. A blow knocks him off (he falls: over the trench the coals
     take him). Returns true while he rides */
  H.ride = (a, dt) => { const R0 = a.gbRide; if (!R0 || !S) { if (a) a.gbRide = null; return false; }
    if (!a.alive) { a.gbRide = null; return false; }
    if (a.hp < R0.hp) { a.gbRide = null; a.vy = 0; a.vx = 0; ctx.number(a.x, a.y - 30, GBM.GB_SAY.addFall, '#ff9a5c'); return false; }   /* knocked off his hook */
    a.anim = (a.anim || 0) + dt; a.mode = 'walk'; a.vx = 0; a.vy = 0; a.face = 1;
    if (R0.wait > 0) { R0.wait -= dt; a.x = R0.z.x0 + 6; a.y = zLineY(R0.z, a.x) + (R0.z.hang ?? 12); return true; }
    const z = R0.z; zNorm(z); a.x += z.speed * dt; const ty = zLineY(z, a.x) + (z.hang ?? 12);
    a.y += (ty - a.y) * Math.min(1, dt * 14);
    if (z.hand && a.x >= z.hand.x0 + 10) { R0.z = z.hand; return true; }   /* the swing across to the upper rail */
    if (a.x >= z.xb - 8) { a.gbRide = null; a.vy = 0; a.vx = 40; return false; }   /* its end: he drops (on the platter) */
    return true; };
  /* A HERO'S BLOW (main.js attackBox): on the stove's bellows it roasts a chilli; on an item riding the line it knocks it off (a dish, a chilli) or bats it along (a bomb) */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e) return; const w = world(e), G = S.G;
    const bb = { l: G.bellowsX - GB.stove.box, r: G.bellowsX + GB.stove.box, t: G.floorY - 30, b: G.floorY };
    if (hb.l < bb.r && hb.r > bb.l && hb.t < bb.b && hb.b > bb.t && (!ctx.hitOnce || ctx.hitOnce(S.stove))) GBM.stokeStove(S, w);
    const px = ctx.hero().x;
    for (const it of S.items) { if (it.state !== 'ride' && it.state !== 'bat') continue; const b = GBM.itemBox(G, it); if (hb.l < b.r && hb.r > b.l && hb.t < b.b && hb.b > b.t && (!ctx.hitOnce || ctx.hitOnce(it))) GBM.strikeItem(S, it, w, px); } };
  H.take = (e, dmg) => { if (!S) return dmg; const [d, word] = GBM.takeBlow(e, S, dmg);
    S.n[word === 'WARDED' ? 'wardHits' : word ? 'fedHits' : GBM.gbOpen(e) ? 'openHits' : 'hungryHits']++;
    if (word) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && word === 'WARDED' ? ctx.sfx.clank() : (ctx.sfx.thud && ctx.sfx.thud()); ctx.sparks(e.x - GB.w / 2, e.y - GB.h / 2, -1, 4);
      if (!S.told.fed && word === 'WELL FED') { S.told.fed = 1; ctx.hint && ctx.hint('WELL FED, HE BARELY FEELS A BLADE. KNOCK THE DISHES OFF THE LINE: HE GOES HUNGRY. LET A BOMB OR A RED-HOT CHILLI REACH HIM: HE IS STUNNED.'); } }
    return d; };
  /* THE CAMERA: the whole of him in the picture, and your feet */
  H.camY = (ty, VH) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive || !ctx.boss || !ctx.boss.alive || ctx.boss.t !== 'grubbag') return ty; const top = S.G.floorY - GB.markH + 8; return Math.max(S.G.floorY + 28 - VH, Math.min(ty, top)); };
  H.barName = e => 'LORD GRUBBAG' + (GBM.gbOpen(e) ? '  ' + GBM.OPEN_NAME[e.mode] : S && S.ward > 0 ? '  WARDED' : S && S.hungry > 0 ? '  HUNGRY' : '');
  H.end = () => { const e = ctx.boss; if (e && e.t === 'grubbag') { e.w = GB.w; e.h = GB.h; }
    calm(); if (S) { for (const a of S.adds) if (a && a.alive) { a.hp = 0; a.alive = false; } S.waves = []; S.throws = []; S.flings = []; S.sweeps = []; S.burns = []; S.items = []; S.adds = []; } BOSS_PHASE.grubbag = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, ward: S.ward, hungry: S.hungry, rush: S.rush, stove: { ...S.stove }, items: S.items.map(q => ({ kind: q.kind, x: Math.round(q.x), state: q.state, fuse: +(q.fuse || 0).toFixed(2) })),
    adds: S.adds.length, burning: GBM.burning(S), n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) },
    coal: GBM.coalState(S), dropCd: +S.cd.drop.toFixed(2), second: S.second, secondOn: S.secondOn, riding: S.adds.filter(a => a && a.gbRide).length, railSpeed: S.G.rails.map(z => z.speed) };
  const X = cx => v => R(v - cx), Y = cy => v => R(v - cy);
  /* THE HALL: the hatch and its chute, THE SERVING LINE (the conveyor, its slats running), his platter at its end, the pepper stove and its bellows (the gauge), the grease cauldron on its chain */
  H.drawBack = (g, cx, cy, time) => { if (!S) return; const x = X(cx), y = Y(cy), G = S.G, fy = y(G.floorY), B = G.belt;
    GA.drawOven(g, x(G.ovenX), fy, S.stove.st === 'roast' ? 'bake' : S.stove.st, time, 0);
    const bx = x(G.bellowsX); GA.drawBellows(g, bx, fy, S.stove.st === 'cold', time, 0);
    const k = S.stove.st === 'cool' ? 1 - S.stove.t / GB.stove.cool : S.stove.st === 'cold' ? 1 : 0;
    rect(g, bx - 15, fy - 36, 30, 6, '#1a1410'); rect(g, bx - 14, fy - 35, 28, 4, '#1b1626'); rect(g, bx - 14, fy - 35, R(28 * k), 4, S.stove.st === 'cold' ? '#ffd36b' : S.stove.st === 'cool' ? '#8a8a9a' : '#ff6b2c'); rect(g, bx - 15, fy - 36, 30, 1, '#c9a040');
    GA.drawHatch(g, x(B.x0), y(B.y), time);
    GA.drawBelt(g, x(B.x0), x(B.x1), y(B.y), fy, S.scroll || 0, time);
    GA.drawPlatter(g, x(G.table[0]), x(G.table[1]), y(B.y), fy, time);
    const cz = G.cauldron, e = ctx.boss, tip = S.tipT > 0 ? Math.min(1, (2.2 - S.tipT) * 3) * (S.tipT > 0.4 ? 1 : S.tipT / 0.4) : 0;
    GA.drawCauldron(g, x(cz.x), y(cz.y), y(A().y0), tip, time);
    /* the cauldron's chain down to his hand while he holds it (the grease) */
    if (e && e.alive && POSE[e.mode] && POSE[e.mode].chain) { const p = POSE[e.mode], hx = x(e.x - p.hand[0]), hy = y(e.y + p.hand[1]); GA.drawChain(g, x(cz.x) + 14, y(cz.y) - 6, hx, hy); }
    /* (claude/kitchengate4) THE COAL TRENCH (greybox - the art lane draws the final): the coal bed (banked embers; the grease's glow; lit) and the chain-link steps out of it */
    const T = G.trench; if (T) { const by = y(T.y), st = GBM.coalState(S), k = st === 'glow' ? 0.5 + 0.5 * Math.sin(time * 20) : 0;
      rect(g, x(T.x0), by, x(T.x1) - x(T.x0), 6, '#1a0e0a'); for (let q = T.x0 + 3; q < T.x1 - 3; q += 7) { const f = (Math.sin(q * 0.37 + time * 2.3) + 1) / 2; rect(g, x(q), by + 1 + ((q / 7) | 0) % 2, 4, 2, st === 'lit' ? (f > 0.5 ? '#ffd36b' : '#ff6b2c') : st === 'glow' ? (f > 0.4 ? '#ff4a2a' : '#8a2a1a') : (f > 0.75 ? '#ff6b2c' : '#5a2a1a')); }
      if (k) { g.globalAlpha = 0.18 + 0.25 * k; rect(g, x(T.x0), by - 18, x(T.x1) - x(T.x0), 18, '#ff4a2a'); g.globalAlpha = 1; }
      for (const [a, b] of T.steps) { const sy = y(T.stepY); for (let q = sy; q < by; q += 4) { rect(g, x(a) + 4, q, 4, 3, '#8a8a9a'); rect(g, x(a) + 5, q + 1, 2, 1, '#2a2420'); }   /* the chain-link step */
        rect(g, x(a), sy, x(b) - x(a), 2, st === 'lit' ? '#ff9a3c' : '#9a8a7a'); } } };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const p = (e.mode === 'eat' && S.swellT > 0 ? POSE.eatSwell : POSE[e.mode]) || POSE.sit, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06;   /* (claude/kitchengate4) the belly swells as he eats */
    g.save(); g.translate(R(e.x - cx + (p.shake ? Math.sin(time * 50) * 2 : 0)), R(e.y - cy)); g.scale(-1, 1); drawGrubbag(g, p, flash, time, e.eating ? e.eating.kind : null); g.restore();
    /* THE GRAB's arm drawn the whole way out to his hand (over the floor and the line) */
    if (e.mode === 'grab' && e.handX != null) { const el = POSE.grab.hand, ex = R(e.x - cx - el[0]), ey = R(e.y - cy + el[1]), hx = R(e.handX - cx), hy = R(e.y - cy) - 22; GA.drawGrabArm(g, ex, ey, hx, hy, flash); } };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const e = ctx.boss, G = S.G, x = X(cx), y = Y(cy), fy = y(G.floorY), B = G.belt;
    /* THE ITEMS on the line (and knocked off it): a dish, a bomb (its fuse burning down: the bar over it), a red-hot chilli */
    for (const it of S.items) { const ix = x(it.x), iy = y(GBM.itemY(G, it)); GA.dish(g, false, ix, iy - 4, it.kind, time);
      if (it.kind === 'bomb' && it.state !== 'fall') { const k = Math.max(0, it.fuse / GB.line.fuse); rect(g, ix - 10, iy - 28, 20, 3, '#1b1626'); rect(g, ix - 10, iy - 28, R(20 * k), 3, k < 0.3 ? (Math.floor(time * 10) % 2 ? '#ff4a2a' : '#ffd36b') : '#ff9a3c');
        if (it.state === 'bat') for (let q = 1; q < 4; q++) rect(g, ix - q * 8, iy - 10, 5, 1, 'rgba(255,211,107,' + (0.8 - q * 0.2).toFixed(2) + ')'); } }
    /* (claude/kitchengate4) THE COALS LIT: flames up off the bed (the climb out is hot) */
    if (G.trench && GBM.coalState(S) === 'lit') { const T = G.trench; for (let q = T.x0 + 4; q < T.x1 - 4; q += 9) { const hh = 10 + 8 * Math.abs(Math.sin(q * 0.21 + time * 9)); rect(g, x(q), y(T.y) - R(hh), 4, R(hh), '#ff6b2c'); rect(g, x(q) + 1, y(T.y) - R(hh * 0.6), 2, R(hh * 0.6), '#ffd36b'); } }
    /* THE BURNING FLOOR (the grease spill) */
    for (const [a, b] of GBM.burning(S)) GA.drawBurn(g, x(a), x(b), fy, time);
    if (!ctx.bossActive || !e || e.t !== 'grubbag') return;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    /* the lobs (a ring blinking on the surface each lands on) */
    for (const c of S.throws) { const q = GBM.throwAt(c); if (c.t > 0) GA.drawHam(g, x(q.x), y(q.y), q.k * 7);
      g.strokeStyle = blink; g.strokeRect(x(c.tx) - GB.lob.r, y(c.ty) - 3, GB.lob.r * 2, 3); }
    for (const f of S.flings) GA.drawPlateFlat(g, x(f.x), y(f.y), time);
    /* the belch's rings on the floor; the sweep's plates along the line */
    for (const q of S.waves) { if (q.delay > 0) continue; for (let k = 0; k < 3; k++) { g.strokeStyle = 'rgba(160,200,90,' + (0.85 - k * 0.25).toFixed(2) + ')'; g.beginPath(); g.arc(x(q.x) - q.dir * k * 5, fy - 2, 7 + k * 2, Math.PI, 0); g.stroke(); } }
    for (const q of S.sweeps) for (let k = 0; k < 3; k++) GA.drawPlateFlat(g, x(q.x) + k * 9, y(B.y) - 3 - k, time + k);
    /* the tells drawn where they will land: the grab's reach (red), the sweep along the line, the grease's floor (red, blinking) */
    if (e.mode === 'grabTell') { g.globalAlpha = 0.4; g.fillStyle = '#ff6b6b'; const a = e.x - GB.w / 2, b = a - GB.grab.reach; for (let q = b; q < a; q += 9) { g.fillRect(x(q), fy - 6, 5, 2); g.fillRect(x(q), y(B.y) - 6, 5, 2); } g.globalAlpha = 1; }
    if (e.mode === 'sweepTell') { g.globalAlpha = 0.45; g.fillStyle = '#ffd36b'; for (let q = B.x0; q < B.x1; q += 10) g.fillRect(x(q), y(B.y) - 3, 6, 1); g.globalAlpha = 1; }
    if (e.mode === 'greaseTell') { g.globalAlpha = 0.25 + 0.2 * Math.sin(time * 14); g.fillStyle = '#ff4a2a'; g.fillRect(x(G.x0), fy - 4, x(G.chairX - GB.w / 2) - x(G.x0), 4); g.globalAlpha = 1; }
    if (e.mode === 'flingTell') { const P = ctx.hero(); if (P) { const sy = P.ground ? P.y : GBM.surfaceY(G, P.x, P.y); g.globalAlpha = 0.35; g.fillStyle = '#ffd36b'; for (let q = G.x0; q < G.chairX - 116; q += 12) g.fillRect(x(q), y(sy - GB.fling.lift), 6, 1); g.globalAlpha = 1; } }
    const ex = x(e.x);
    const bw = GB.w + 12, bh = GB.h + 12, by0 = y(e.y - GB.h - 8);
    if (GBM.gbOpen(e)) { const kk = Math.max(0, e.modeT / (e.openT0 || 1)); g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.strokeRect(ex - bw / 2, by0, bw, bh); g.lineWidth = 1; g.globalAlpha = 1;
      const by = y(e.y - GB.h - 40); ctx.text(GBM.OPEN_NAME[e.mode] || 'OPEN', ex, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(ex - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(ex - 18, by, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.strokeRect(ex - bw / 2 - 2, by0 - 2, bw + 4, bh + 4); g.lineWidth = 1; g.globalAlpha = 1; ctx.text('WARDED', ex, y(e.y - GB.h - 44), '#c8d8e8', 'center', 5); }
    if (S.hungry > 0 && !GBM.gbOpen(e)) ctx.text(GBM.GB_SAY.hungry, ex, y(e.y - GB.h - 54), '#8fd160', 'center', 5);
    if (S.rush > 0) ctx.text('ORDER UP', x(B.x0 + 60), y(B.y) - 40, Math.floor(time * 6) % 2 ? '#ffd36b' : '#fff6e0', 'center', 5);
    /* (claude/kitchengate4) THE SECOND HELPING on his windup: a gold-red rim round his throwing hand, and the words; THE FOOD BONUS: the big green heal and MORE!; THE DROP: the platter splatter */
    if (S.secondOn && GBM.gbTelling(e)) { const p = POSE[e.mode] || POSE.sit, hx = x(e.x - p.hand[0]), hy = y(e.y + p.hand[1]), kk = 0.6 + 0.4 * Math.sin(time * 16);
      g.globalAlpha = kk; g.strokeStyle = Math.floor(time * 10) % 2 ? '#ff4a2a' : '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy, 13, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text(GBM.GB_SAY.second, ex, y(e.y - GB.h - 70), '#ff9a3c', 'center', 6); }
    if (S.heal) { const up = R((1.3 - S.heal.t) * 18); if (S.heal.n > 0) ctx.text('+' + S.heal.n, ex - 30, y(e.y - GB.h - 30) - up, '#8fd160', 'center', 10); ctx.text(GBM.GB_SAY.more, ex + 30, y(e.y - GB.h - 34) - up, Math.floor(time * 8) % 2 ? '#c8f0a0' : '#8fd160', 'center', 8); }
    if (S.dropFx) { const k = 1 - S.dropFx.t / 0.8, dx = x(S.dropFx.x), dy = y(G.platter.y); g.globalAlpha = 1 - k; for (let q = 0; q < 8; q++) { const a = q / 8 * Math.PI, rr = 6 + k * 30; rect(g, dx + R(Math.cos(a) * rr) - 1, dy - R(Math.sin(a) * rr * 0.7) - 1, 3, 3, q % 2 ? '#a0602a' : '#c8ccd4'); } g.globalAlpha = 1; }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, ex, y(e.y - GB.h - 60) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
/* HIS BESTIARY CARD: a portrait - his head, chins, collar, chest and the top of the belly, two poses (sitting, the belch's windup) - drawn at full size and halved, the halving's
   soft edges cut back to hard alpha */
export function bakeGrubbagCard() {
  const CW = 72, CH = 60, fr = [0, 1].map(i => { const [big, bg] = canvas(CW * 2, CH * 2); bg.translate(CW + 4, 194); bg.scale(-1, 1); drawGrubbag(bg, POSE[i ? 'belchTell' : 'sit'], false, i * 0.3, null);
    const [c, g] = canvas(CW, CH); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(big, 0, 0, CW, CH);
    const d = g.getImageData(0, 0, CW, CH); for (let q = 3; q < d.data.length; q += 4) d.data[q] = d.data[q] > 110 ? 255 : 0; g.putImageData(d, 0, 0); return c; });
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 36, ay: 58, w: 64, h: 56 };
}
export const _drawGrubbag = drawGrubbag;
