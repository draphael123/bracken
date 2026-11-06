// src/deep3-hands.js - THE DEEP 3's HANDS (claude/deep3): binds src/deep3.js's level (L.deep3), THE WALL EEL (src/wall-eel.js) and THE SUNKEN CREW -> THE CURSED
// SAILOR (src/sunken-crew.js) to the world. Only a level with L.deep3 (behind ?deep3=1 / DEEP3_SHIPS) wakes it; every main.js hunk is inert without it.
//   THE CRACKS: a cracked slab or stair step is laid as stone at load; a HEAVY hero (a stone in his hands) standing on it makes it creak (told), then it gives.
//     A slab that gave STAYS given for the level (a death keeps the way you made); a stair step settles back DEEP3 step.back s after (never a soft lock: a hero
//     who fell in the rot pit has the stair again), and on a death.
//   THE SETTLING STONES: a block on a chain under a ceiling. A hero under it wakes it: grit runs (told), it falls, it breaks whatever crack it lands on and keeps
//     falling, and it is laid as stone where it rests (F3's stays; F4's is hung again on a death).
//   THE ROT: each wall vent bubbles (told), breathes rot out of the wall, rests; the pit at the stair's foot is always rot. Both hurt by the tick.
//   THE BELL: master's lift mover (kind 'lift', d3bell) rides while a hero stands on it - and only weight keeps a swimmer on its deck. The air under her rim is a
//     deep air box that rides with her (src/main.js deepAir: 'AIR UNDER HER RIM').
//   THE WALL EELS and THE CREW are foes in the list; their blows on the heroes are told and keyed once per blow (the shriek sisters' pattern).
// GREYBOX ART: plain shapes in the Deep's colours; the sonnet art lane draws them (lane report: ART OWED).
// main.js calls: clear, spawn, owns, on, update, hit, tick, drawBack, drawFoe, drawOver, barName.
import * as WE from './wall-eel.js';
import * as SC from './sunken-crew.js';
import { crewStage } from './deep3.js';
import { BOSS_PHASE } from './boss-music.js';

export const DEEP3 = { step: { back: 8 }, tick: 0.5 };
const COL = { cutlass: '#5e7a86', shield: '#6e6a58', harpoon: '#4e6a5a', heavy: '#6a5a66', sailor: '#3e5a64', rot: '#7aa04a', eel: '#4a5e3a', lantern: '#7ff0e0', crack: '#1a2228', stone: '#4a5058' };
const SOUND = { bubble: s => (s.splash || s.tell)(), strike: s => (s.whoosh || s.throwWhoosh || s.tell)(), back: s => (s.splash || s.thud)(), creak: s => (s.stone || s.thud)(), give: s => { (s.crack || s.stone)(); (s.heavy || s.thud)(); },
  grit: s => (s.stone || s.tell)(), settle: s => { (s.heavy || s.thud)(); (s.crack || s.stone)(); }, rot: s => (s.puff || s.splash || s.tell)(),
  lungeTell: s => (s.tell)(), lunge: s => (s.whoosh || s.tell)(), flurryTell: s => (s.tell)(), flurry: s => (s.whoosh || s.tell)(), bashTell: s => (s.clank || s.tell)(), bash: s => (s.thud || s.heavy)(),
  guardTell: s => (s.clank || s.tell)(), guard: s => (s.aegis || s.clank || s.tell)(), throwTell: s => (s.tell)(), throw: s => (s.throwWhoosh || s.whoosh || s.tell)(), reelTell: s => (s.rattle ? s.rattle(0.5) : s.tell()),
  reel: s => (s.throwWhoosh || s.tell)(), slamTell: s => (s.bellow || s.heavy || s.tell)(), slam: s => { (s.heavy || s.thud)(); (s.crack || s.stone)(); }, chargeTell: s => (s.bellow || s.tell)(), charge: s => (s.whoosh || s.thud)(),
  fall: s => (s.splash || s.thud)(), raiseTell: s => (s.lampUp || s.tell)(), raise: s => (s.lampUp || s.tell)(), broke: s => (s.clank || s.thud)(), merge: s => (s.queenShriek || s.bellow || s.tell)(),
  swapTell: s => (s.tell)(), swap: s => (s.clank || s.tell)(), stuck: s => (s.clank || s.thud)() };

export function makeDeep3Hands(ctx) {
  const H = {}; let per = null, S = null, A0 = null; const bodies = {}; let sailorBody = null, bellBox = null;
  const L = () => ctx.L, D = () => (ctx.L && ctx.L.deep3) || null, TS = ctx.TS;
  const sound = k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch { /* a missing sound is not a missing move */ } };
  H.on = () => !!D();
  H.owns = e => e.t === 'walleel' || e.t === 'sunkencrew' || e.t === 'crewman' || e.t === 'cursedsailor';
  H.show = () => ({ per, S });
  /* ---- THE WORLD'S CELLS (cracks, steps, stones). per = the level's own record: what gave, where the stones came to rest. A new level (a new L) starts it again ---- */
  const cell = (x, y, t) => { if (ctx.cellSet) ctx.cellSet(x, y, t); };
  const layRect = (r, t) => { for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) cell(x, y, t); };
  function fresh() {
    const d = D(); per = { L: L(), broken: new Set(), cracks: [], stones: [], rot: [], t: 0, keys: new Map() };
    for (const s of d.slabs) per.cracks.push({ ...s, mode: 'whole', t: 0, back: 0 });
    for (const s of d.steps) per.cracks.push({ ...s, mode: 'whole', t: 0, back: 0 });
    for (const c of d.settle) per.stones.push({ ...c, mode: 'hang', t: 0, y: c.y0 * TS, vy: 0, rest: null, keep: c.onto.startsWith('f') });
    for (const r of d.rot) per.rot.push({ ...r, cd: 0 });
  }
  /* (spawnEntities: a load or a death) */
  H.clear = () => {
    S = null; A0 = null; sailorBody = null; for (const k of Object.keys(bodies)) delete bodies[k]; BOSS_PHASE.sunkencrew = 1;
    if (!D()) { per = null; return; }
    if (!per || per.L !== L()) fresh();
    for (const c of per.cracks) {
      if (c.kind === 'step') { c.mode = 'whole'; c.t = 0; c.back = 0; }
      layRect(c, c.mode === 'gone' ? ctx.T.AIR : ctx.T.SOLID); }
    for (const s of per.stones) { if (!s.keep && s.rest) { layRect(s.rest, ctx.T.AIR); s.rest = null; s.mode = 'hang'; s.y = s.y0 * TS; s.vy = 0; }
      if (s.mode !== 'rest' && s.mode !== 'hang') { s.mode = 'hang'; s.y = s.y0 * TS; s.vy = 0; }
      if (s.rest) layRect(s.rest, ctx.T.SOLID); }
    for (const pp of ctx.players || []) { pp.d3Pull = null; pp.d3Keys = null; }
  };
  const heroes = () => (ctx.players || []).map(pp => ({ x: pp.x, y: pp.y, vx: pp.vx || 0, vy: pp.vy || 0, alive: ctx.upright(pp) && !pp.dead && pp.hp > 0, ground: !!pp.ground, heavy: !!pp.ballast, pp }));
  const keyed = (pp, key) => { pp.d3Keys = pp.d3Keys || new Map(); if (pp.d3Keys.size > 200) pp.d3Keys.clear(); if (pp.d3Keys.has(key)) return true; pp.d3Keys.set(key, 1); return false; };
  const hurt = (pp, fromX, dmg, o) => { let r = null; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return; r = ctx.damagePlayer(fromX, dmg, o); }); return r; };

  /* ---- SPAWN ---- */
  H.spawn = (e, base) => {
    if (e.t === 'walleel') { const st = WE.newEel(e, TS); if (e.shaft) st.shaft = true;
      return { ...base, t: 'walleel', x: st.hx, y: st.hy + 5, w: WE.EEL.w, h: WE.EEL.h, hp: ctx.EHP.walleel, maxHp: ctx.EHP.walleel, noGrav: true, face: st.dx || 1, mode: 'hidden', st, speed: 0 }; }
    if (e.t === 'sunkencrew') { if (!L().arena || L().arena.boss !== 'sunkencrew') return null;
      S = SC.newFight(SC.geom(crewStage(TS)), (e.x * 31 + 7) >>> 0); BOSS_PHASE.sunkencrew = 1;
      const hp = ctx.EHP.sunkencrew;
      A0 = { ...base, t: 'sunkencrew', w: 2, h: 2, hp, maxHp: hp, noGrav: true, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, x: S.G.mid, y: S.G.top - 40 };
      for (const r of SC.ROLES) { const c = S.crew[r]; const b = { t: 'crewman', role: r, x: c.x, y: c.y, w: SC.CREW.w, h: SC.CREW.h, hp: c.hp, maxHp: c.maxHp, alive: true, noGrav: true, face: -1, anim: 0, flash: 0, vx: 0, vy: 0, mode: 'sleep' };
        bodies[r] = b; ctx.addEnemy(b); }
      return A0; }
    return null;
  };

  /* ---- THE FOES' STEP (main.js updateEnemies hands every one of ours here) ---- */
  H.update = (e, dt) => {
    if (!e.alive) return;
    if (e.t === 'walleel') { const s = e.st; WE.stepEel(s, dt, heroes(), {
        sound: k => { if (onScreen(s.hx, s.hy)) sound(k); },
        bubble: (x, y) => { if (ctx.bubble) ctx.bubble(x, y); },
        strike: (s2, bx, d, key) => { let hit = false; for (const h of heroes()) { if (!h.alive) continue; const B = ctx.box(h.pp); if (!(bx.l < B.r && bx.r > B.l && bx.t < B.b && bx.b > B.t) || keyed(h.pp, key + ':' + s2.hx + ',' + s2.hy)) continue;
          const r = hurt(h.pp, s2.hx, d, { who: e, name: 'THE WALL EEL', unblockable: false }); if (r === 'hit') { hit = true; if (h.pp.ballast && ctx.dropBallast) ctx.asPlayer(h.pp, () => ctx.dropBallast()); } } return hit; } });
      const bx = WE.eelBox(s) || { l: s.hx - 6, r: s.hx + 6, t: s.hy - 6, b: s.hy + 6 };
      e.x = (bx.l + bx.r) / 2; e.y = bx.b; e.w = Math.max(8, bx.r - bx.l); e.h = Math.max(8, bx.b - bx.t); e.mode = s.mode; return; }
    if (e.t === 'sunkencrew') { if (!S || !ctx.bossActive || e !== ctx.boss) return; stepAnchor(e, dt); return; }
    /* the crew's bodies and the Sailor's are moved by the anchor */
  };
  const onScreen = (x, y) => { const P = ctx.hero(); return !P || (Math.abs(P.x - x) < 360 && Math.abs(P.y - y) < 240); };
  function world() {
    return {
      hit: (h, dmg, name, key, o = {}) => { const pp = h.pp; if (!pp || keyed(pp, key)) return null; const r = hurt(pp, A0 ? (S.ph === 2 && S.sailor ? S.sailor.x : pp.x - (o.knock || 0) * 10) : pp.x, dmg, { who: A0, name, unblockable: !o.blockable });
        return r === 'hit' || r === 'blocked' ? r : null; },
      pull: (h, x, y, v) => { if (h.pp) h.pp.d3Pull = { x, y, t: 0.45, v: v / 0.45 }; },
      say: (x, y, t, c) => ctx.number(x, y, t, c), mark: (who, m) => ctx.number(who.x, who.y - (who.sailor ? 58 : 36), m, m === '!!' ? '#ff6b6b' : '#ffd36b'),
      sound, shake: n => ctx.shake(n), music: ph => { BOSS_PHASE.sunkencrew = Math.min(3, ph); },
      fx: (k, x, y) => { if (k === 'open') ctx.ring(x, y, 34, '#ffd36b'); else if (k === 'ward') ctx.ring(x, y, 36, '#c8d8e8'); else if (k === 'raise') ctx.burst(x, y, 18, ['#7ff0e0', '#bfe6f5'], 80, 0.7); },
      slamAt: (x, y) => ctx.burst(x, y - 2, 14, ['#8a919c', '#5e6a72'], 110, 0.6),
    };
  }
  function stepAnchor(e, dt) {
    if (!S.scaled) { S.scaled = true; const k = (e.maxHp || ctx.EHP.sunkencrew) / ctx.EHP.sunkencrew; SC.scale(S, k); e.maxHp = SC.totalHp(S); e.hp = e.maxHp;
      for (const r of SC.ROLES) { bodies[r].maxHp = bodies[r].hp = S.crew[r].hp; } }
    if (e.mode === 'wake' && !S.woke) { SC.wake(S); ctx.number(S.G.mid, S.G.floor - 110, SC.SAY.wake, '#ffd36b'); sound('merge'); ctx.shake(3); }
    if (S.woke && !S.told.rule && S.t > 1.6) { S.told.rule = 1; ctx.number(S.G.mid, S.G.floor - 96, SC.SAY.rule, '#7ff0e0'); if (ctx.hint) ctx.hint(SC.SAY.rule + '. A SOUL LANTERN BURNS TEN SECONDS OVER A FALLEN SAILOR - CHIP THEM ALL LOW, THEN FELL THEM IN A ROW. STRIKE A MATE WHO STOOPS TO RAISE HIM.'); }
    const w = world(), ph0 = S.ph;
    SC.stepFight(S, dt, heroes(), w);
    if (ph0 === 1 && S.ph === 2) { for (const r of SC.ROLES) bodies[r].alive = false; e.phase = 2;
      sailorBody = { t: 'cursedsailor', x: S.sailor.x, y: S.sailor.y, w: SC.CREW.sailor.w, h: SC.CREW.sailor.h, hp: S.sailor.hp, maxHp: S.sailor.maxHp, alive: true, noGrav: true, face: -1, vx: 0, vy: 0, mode: 'merge' }; ctx.addEnemy(sailorBody); }
    if (S.ph === 1) for (const r of SC.ROLES) { const c = S.crew[r], b = bodies[r]; if (c.alive) { b.x = c.x; b.y = c.y; b.face = c.face; b.mode = c.mode; b.hp = c.hp; b.maxHp = c.maxHp; b.open = SC.crewOpen(c) ? 1 : 0; } else { b.x = -9999; b.y = -9999; } }
    else if (sailorBody && S.sailor) { const s = S.sailor; sailorBody.x = s.x; sailorBody.y = s.y; sailorBody.face = s.face; sailorBody.mode = s.mode; sailorBody.hp = s.hp; sailorBody.open = SC.sailorOpen(s) ? 1 : 0; }
    e.hp = Math.max(1, SC.totalHp(S)); e.open = S.ph === 2 && SC.sailorOpen(S.sailor) ? 1 : 0; e.mode = e.mode === 'wake' && e.modeT > 0 ? 'wake' : 'fight';
    if (S.ph === 2 && S.sailor && S.sailor.hp <= 0 && e.alive) { e.hp = 1; e.d3Pass = true; if (sailorBody) sailorBody.alive = false; ctx.killBoss(e); }
  }
  /* ---- A BLOW (main.js hurtEnemy0): true = taken here (nothing more to do), false = let the game's own path take it ---- */
  H.hit = (e, dmg, fromX, pl) => {
    if (e.t === 'walleel') { if (WE.eelBare(e.st)) return false; if (!(e.wallSaid > ctx.time())) { e.wallSaid = ctx.time() + 1.2; ctx.number(e.st.hx, e.st.hy - 12, WE.EEL_SAY.wall, '#9aa39a'); if (ctx.sfx.clank) ctx.sfx.clank(); } return true; }
    if (e.t === 'sunkencrew') { if (e.d3Pass) { e.d3Pass = false; return false; } return true; }   /* THE ANCHOR: no blade reaches it; the Sailor's fall is handed through so it dies the way every boss does */
    if (!S) return true;
    if (e.t === 'crewman') { const c = S.crew[e.role]; if (!c || !c.alive || c.mode === 'sleep') return true;
      const [d, word] = SC.takeCrew(S, c, dmg, fromX); c.hp = Math.max(0, c.hp - d); e.hp = c.hp; e.flash = 0.12; e.hurtT = 0.12;
      ctx.number(c.x, c.y - 30, d, SC.crewOpen(c) ? '#ffd36b' : word ? '#9aa39a' : '#fff6e0'); if (word) { if (ctx.sfx.clank) ctx.sfx.clank(); ctx.number(c.x, c.y - 42, word, '#c8d8e8'); }
      SC.struck(S, c, world()); if (c.hp <= 0) SC.fall(S, c, world()); if (A0) A0.hp = Math.max(1, SC.totalHp(S)); if (ctx.hitstop) ctx.hitstop(0.03); return true; }
    if (e.t === 'cursedsailor') { const s = S.sailor; if (!s || s.hp <= 0) return true; const [d, word] = SC.takeSailor(S, dmg, fromX); s.hp = Math.max(0, s.hp - d); e.hp = s.hp; e.flash = 0.12; e.hurtT = 0.12;
      ctx.number(s.x, s.y - 50, d, SC.sailorOpen(s) ? '#ffd36b' : word ? '#9aa39a' : '#fff6e0'); if (word) { if (ctx.sfx.clank) ctx.sfx.clank(); ctx.number(s.x, s.y - 62, word, '#c8d8e8'); }
      if (A0) A0.hp = Math.max(1, SC.totalHp(S)); if (ctx.hitstop) ctx.hitstop(0.03); return true; }
    return false;
  };
  H.barName = b => { if (!S) return 'THE SUNKEN CREW'; return (S.ph === 1 ? 'THE SUNKEN CREW  ' : 'THE CURSED SAILOR  ') + SC.barWord(S); };

  /* ---- THE LEVEL'S STEP (main.js updateDeep) ---- */
  H.tick = dt => {
    const d = D(); if (!d || !per) return; per.t += dt; const hs = heroes(), t = ctx.time();
    /* the reel's drag */
    for (const h of hs) { const q = h.pp.d3Pull; if (!q) continue; q.t -= dt; if (q.t <= 0 || !h.alive) { h.pp.d3Pull = null; continue; }
      const dx = q.x - h.x, dy = (q.y - 8) - h.y, n = Math.hypot(dx, dy); if (n > 20 && ctx.moveBody) ctx.asPlayer(h.pp, () => ctx.moveBody(ctx.hero(), Math.round(dx / n * q.v * dt), Math.round(dy / n * q.v * dt), false)); }
    /* THE CRACKS */
    for (const c of per.cracks) {
      if (c.mode === 'gone') { if (c.kind === 'step') { c.back -= dt; if (c.back <= 0 && !hs.some(h => h.alive && h.x > c.x0 * TS - 8 && h.x < (c.x1 + 1) * TS + 8 && h.y > c.y0 * TS - 20 && h.y < (c.y1 + 1) * TS + 4)) {
          c.mode = 'whole'; layRect(c, ctx.T.SOLID); ctx.burst((c.x0 + c.x1 + 1) / 2 * TS, c.y0 * TS, 8, ['#8a919c', '#5e6a72'], 40, 0.4); sound('settle'); } } continue; }
      const top = c.y0 * TS, on = !c.stoneOnly && hs.some(h => h.alive && h.heavy && h.x > c.x0 * TS - 2 && h.x < (c.x1 + 1) * TS + 2 && Math.abs(h.y - top) < 3);
      const T0 = c.kind === 'step' ? { stand: 0.45, crumble: 0.25 } : { stand: 0.8, crumble: 0.35 };
      if (c.mode === 'whole') { if (on) { c.mode = 'creak'; c.t = T0.stand; sound('creak'); if (!per.told) { per.told = 1; ctx.number((c.x0 + c.x1 + 1) / 2 * TS, top - 26, 'IT CREAKS', '#ffd36b'); } } }
      else if (c.mode === 'creak') { c.t -= dt; if (Math.random() < dt * 20) ctx.dust((c.x0 + Math.random() * (c.x1 - c.x0 + 1)) * TS, top, 1); if (!on && c.kind === 'slab' && c.t > T0.stand * 0.5) { c.mode = 'whole'; }
        else if (c.t <= 0) give(c); }
    }
    /* THE SETTLING STONES */
    for (const s of per.stones) stepStone(s, dt, hs);
    /* THE ROT */
    for (const r of per.rot) { const cyc = 0.8 + 1.6 + 2.6, ph = r.kind === 'pit' ? 'on' : (() => { const k = ((t + r.ph) % cyc + cyc) % cyc; return k < 0.8 ? 'tell' : k < 2.4 ? 'on' : 'off'; })();
      if (ph === 'tell' && r.state !== 'tell') { r.state = 'tell'; if (onScreen(r.x * TS, r.y0 * TS)) sound('rot'); }
      r.state = ph; r.cd -= dt;
      if (ph !== 'on') continue; const box = rotBox(r);
      for (const h of hs) { if (!h.alive) continue; const B = ctx.box(h.pp); if (!(box.l < B.r && box.r > B.l && box.t < B.b && box.b > B.t)) continue;
        if ((h.pp.d3RotT || 0) > t) continue; h.pp.d3RotT = t + DEEP3.tick; hurt(h.pp, (box.l + box.r) / 2, 4, { unblockable: true, noKnock: true, name: 'THE ROT' });
        if (!per.rotSaid) { per.rotSaid = 1; ctx.number(h.x, h.y - 30, 'THE ROT', '#9ad060'); } } }
    /* THE BELL's air rides with her */
    const bell = ctx.movers ? ctx.movers().find(m => m.d3bell) : null, boxes = ctx.deepBoxes ? ctx.deepBoxes() : null;
    if (bell && boxes) { if (!bellBox) bellBox = { l: 0, r: 0, t: 0, b: 0, kind: 'bell' }; if (!boxes.includes(bellBox)) boxes.push(bellBox);
      bellBox.l = bell.x + 6; bellBox.r = bell.x + bell.w - 6; bellBox.t = bell.y - 40; bellBox.b = bell.y; bell.d3Ride = !!(ctx.hero() && ctx.hero().onMover === bell); }
  };
  const rotBox = r => r.kind === 'pit' ? { l: r.x0 * TS, r: (r.x1 + 1) * TS, t: r.y0 * TS, b: (r.y1 + 1) * TS }
    : r.dir > 0 ? { l: r.x * TS, r: (r.x + 3) * TS, t: r.y0 * TS, b: (r.y1 + 1) * TS } : { l: (r.x - 2) * TS, r: (r.x + 1) * TS, t: r.y0 * TS, b: (r.y1 + 1) * TS };
  function give(c) {
    c.mode = 'gone'; c.back = DEEP3.step.back; layRect(c, ctx.T.AIR); if (c.kind === 'slab') per.broken.add(c.id);
    sound('give'); ctx.shake(3); ctx.burst((c.x0 + c.x1 + 1) / 2 * TS, c.y0 * TS + 8, 22, ['#8a919c', '#5e6a72', '#3a4048'], 110, 0.8);
    if (c.kind === 'slab' && !per.gaveSaid) { per.gaveSaid = 1; ctx.number((c.x0 + c.x1 + 1) / 2 * TS, c.y0 * TS - 20, 'THE FLOOR GIVES', '#ffd36b'); }
  }
  function stepStone(s, dt, hs) {
    const x0 = s.x0 * TS, x1 = (s.x0 + s.w) * TS, Sx = 2 * TS;
    if (s.mode === 'hang') { if (hs.some(h => h.alive && h.x > x0 - Sx && h.x < x1 + Sx && h.y > s.y + s.h * TS && h.y < s.y + 18 * TS)) { s.mode = 'tell'; s.t = 0.85; sound('grit'); ctx.shake(1); } return; }
    if (s.mode === 'tell') { s.t -= dt; if (Math.random() < dt * 30) ctx.dust(x0 + Math.random() * (x1 - x0), s.y + s.h * TS, 1); if (s.t <= 0) { s.mode = 'fall'; s.vy = 520; } return; }
    if (s.mode !== 'fall') return;
    const ny = s.y + s.vy * dt, rowB = Math.floor((ny + s.h * TS) / TS);
    let landed = false;
    for (let x = s.x0; x < s.x0 + s.w && !landed; x++) if (ctx.solidAt(x, rowB)) {
      const c = per.cracks.find(q => q.mode !== 'gone' && x >= q.x0 && x <= q.x1 && rowB >= q.y0 && rowB <= q.y1);
      if (c) give(c); else landed = true; }
    if (!landed) { s.y = ny;
      for (const h of hs) { if (!h.alive) continue; const B = ctx.box(h.pp); if (B.l < x1 && B.r > x0 && B.t < s.y + s.h * TS && B.b > s.y && !keyed(h.pp, 'stone:' + s.id + ':' + Math.floor(per.t / 4))) {
        hurt(h.pp, (x0 + x1) / 2, 14, { unblockable: true, name: 'A SETTLING STONE' }); } } return; }
    s.y = rowB * TS - s.h * TS; s.mode = 'rest'; s.rest = { x0: s.x0, x1: s.x0 + s.w - 1, y0: rowB - s.h, y1: rowB - 1 };
    /* never lay stone over a hero (he would be inside it): he is pushed out first */
    for (const h of hs) { const B = ctx.box(h.pp); if (B.l < x1 && B.r > x0 && B.t < s.y + s.h * TS && B.b > s.y) ctx.asPlayer(h.pp, () => { const P = ctx.hero(); P.x = P.x < (x0 + x1) / 2 ? x0 - 6 : x1 + 6; }); }
    layRect(s.rest, ctx.T.SOLID); sound('settle'); ctx.shake(4); ctx.burst((x0 + x1) / 2, s.y + s.h * TS, 20, ['#8a919c', '#5e6a72'], 100, 0.7);
  }

  /* ---- DRAWING (GREYBOX) ---- */
  const R = Math.round, rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  H.drawBack = (g, cx, cy, time) => {
    const d = D(); if (!d || !per) return;
    for (const c of per.cracks) { if (c.mode === 'gone') continue; const x = c.x0 * TS - cx, y = c.y0 * TS - cy, w = (c.x1 - c.x0 + 1) * TS;
      g.strokeStyle = c.mode === 'creak' ? '#ffd36b' : COL.crack; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < w; i += 7) { g.moveTo(x + i + 0.5, y + 1); g.lineTo(x + i + 4.5, y + 5 + (i % 3)); g.lineTo(x + i + 2.5, y + 10); } g.stroke();
      if (c.stoneOnly) { rect(g, x, y + 13, w, 1, '#2a3238'); } }
    for (const s of per.stones) { if (s.mode === 'rest') continue; const x = s.x0 * TS - cx, y = s.y - cy, w = s.w * TS, h = s.h * TS, sh = s.mode === 'tell' ? (Math.random() - 0.5) * 2 : 0;
      if (s.mode !== 'fall') { rect(g, x + w / 2 - 1, s.y0 * TS - cy - 6, 2, 6, '#6a6e72'); }
      rect(g, x + sh, y, w, h, COL.stone); rect(g, x + sh, y, w, 2, '#6a7078'); if (s.mode === 'tell') { g.globalAlpha = 0.5; rect(g, x - 8, y + h, w + 16, 12 * TS, '#ffd36b'); g.globalAlpha = 1; } }
    for (const r of per.rot) { const b = rotBox(r); const a = r.state === 'on' ? 0.32 : r.state === 'tell' ? 0.14 + 0.1 * Math.sin(time * 18) : 0.05;
      g.globalAlpha = a; rect(g, b.l - cx, b.t - cy, b.r - b.l, b.b - b.t, COL.rot); g.globalAlpha = 1;
      if (r.kind === 'vent') { rect(g, (r.dir > 0 ? r.x - 1 : r.x) * TS - cx, r.y0 * TS - cy, TS, (r.y1 - r.y0 + 1) * TS, '#24301c'); } }
    const bell = ctx.movers ? ctx.movers().find(m => m.d3bell) : null;
    if (bell) { const x = R(bell.x - cx), y = R(bell.y - cy), w = bell.w, top = d.shaft ? R(d.bell.y0 * TS - cy - 200) : y - 200;
      rect(g, x + w / 2 - 1, top, 2, y - 40 - top, '#6a6e72');   /* her chain */
      g.fillStyle = '#8a6a3a'; g.beginPath(); g.moveTo(x + 2, y); g.lineTo(x + 8, y - 34); g.quadraticCurveTo(x + w / 2, y - 48, x + w - 8, y - 34); g.lineTo(x + w - 2, y); g.lineTo(x + w - 6, y); g.lineTo(x + w - 11, y - 31); g.quadraticCurveTo(x + w / 2, y - 42, x + 11, y - 31); g.lineTo(x + 6, y); g.closePath(); g.fill();
      rect(g, x, y, w, 4, '#5a4630'); rect(g, x, y + 4, w, 2, '#3a2e20');
      if (bell.d3Ride) { g.globalAlpha = 0.25; rect(g, x + 8, y - 34, w - 16, 30, '#bfe6f5'); g.globalAlpha = 1; } }
    if (S) for (const l of S.lanterns) { const f = S.crew[l.role]; drawCorpse(g, f, cx, cy); }
  };
  function drawCorpse(g, c, cx, cy) { const x = R(c.x - cx), y = R(c.y - cy); g.globalAlpha = 0.7; rect(g, x - 12, y - 6, 24, 6, COL[c.role]); g.globalAlpha = 1; }
  H.drawFoe = (g, e, cx, cy, time) => {
    if (!e.alive) return;
    if (e.t === 'walleel') { const s = e.st; const h = WE.eelHead(s), hx = R(s.hx - cx), hy = R(s.hy - cy);
      rect(g, s.dy ? hx - 5 : (s.dx > 0 ? hx - 3 : hx - 7), s.dy ? hy - 4 : hy - 5, 10, 10, '#0c1418');   /* the hole */
      if (s.mode === 'bubble') { g.fillStyle = '#e8f4f0'; for (let i = 0; i < 4; i++) { const k = (time * 3 + i * 0.27) % 1; g.fillRect(hx + s.dx * 3 + Math.sin(time * 9 + i) * 3, hy - k * 16, 2, 2); } }
      if (s.ext > 0.02) { g.strokeStyle = COL.eel; g.lineWidth = 6; g.beginPath(); g.moveTo(hx, hy); g.lineTo(R(h.x - cx), R(h.y - cy)); g.stroke(); g.lineWidth = 1;
        rect(g, R(h.x - cx) - 5, R(h.y - cy) - 4, 10, 8, s.mode === 'hang' ? '#6a8a4a' : '#5a7a3a'); rect(g, R(h.x - cx) + (s.dx >= 0 ? 2 : -4), R(h.y - cy) - 2, 2, 2, '#ffd36b');
        if (s.mode === 'hang' && !e.saidCut) { e.saidCut = 1; ctx.number(h.x, h.y - 14, WE.EEL_SAY.cut, '#ffd36b'); } }
      if (e.flash > 0) { g.globalAlpha = 0.6; rect(g, R(h.x - cx) - 6, R(h.y - cy) - 5, 12, 10, '#ffffff'); g.globalAlpha = 1; }
      return; }
    if (e.t === 'crewman' && S) { const c = S.crew[e.role]; if (!c || !c.alive) return; drawSailorShape(g, c, cx, cy, time, 1, COL[c.role], e.flash > 0);
      const x = R(c.x - cx), y = R(c.y - cy), mx = SC.CREW.hp[c.role] * (S.k || 1), k = Math.max(0, c.hp / Math.max(1, c.maxHp));
      rect(g, x - 12, y - 36, 24, 3, '#1a1a22'); rect(g, x - 12, y - 36, R(24 * k), 3, SC.crewOpen(c) ? '#ffd36b' : '#c84848');   /* his own bar */
      if (c.role === 'shield' && c.mode === 'guard' && c.guarding) { const m = S.crew[c.guarding]; if (m && m.alive) { g.strokeStyle = '#c8d8e8'; g.globalAlpha = 0.6; g.beginPath(); g.moveTo(x, y - 14); g.lineTo(R(m.x - cx), R(m.y - cy) - 14); g.stroke(); g.globalAlpha = 1;
        g.strokeStyle = '#c8d8e8'; g.beginPath(); g.arc(R(m.x - cx), R(m.y - cy) - 14, 16, 0, 7); g.stroke(); } }
      if (c.mode === 'raise') { g.strokeStyle = '#ff9a5c'; g.beginPath(); g.arc(x, y - 14, 14 + 4 * Math.sin(time * 10), 0, 7); g.stroke(); }
      void mx; return; }
    if (e.t === 'cursedsailor' && S && S.sailor) { const s = S.sailor; drawSailorShape(g, s, cx, cy, time, SC.CREW.p2.scale, COL.sailor, e.flash > 0);
      if (SC.sailorOpen(s)) { const t0 = s.mode === 'swap' ? SC.CREW.p2.swap : s.mode === 'stuck' ? SC.CREW.p2.stuck : 1.2; const x = R(s.x - cx), y = R(s.y - cy); g.strokeStyle = '#ffd36b'; g.beginPath(); g.arc(x, y - 24, 30, 0, 7); g.stroke();
        rect(g, x - 16, y - 66, R(32 * Math.max(0, s.modeT) / t0), 2, '#ffd36b'); }
      else if (s.ward > 0) { const x = R(s.x - cx), y = R(s.y - cy); g.strokeStyle = '#c8d8e8'; g.globalAlpha = 0.6; g.beginPath(); g.arc(x, y - 24, 32, 0, 7); g.stroke(); g.globalAlpha = 1; }
      return; }
  };
  /* a sailor (greybox): body, head, the weapon of his role / stance, the pose's lean (windup back, release forward) */
  function drawSailorShape(g, c, cx, cy, time, sc, col, flash) {
    const x = R(c.x - cx), y = R(c.y - cy), w = R(SC.CREW.w * sc), h = R(SC.CREW.h * sc), f = c.face || 1, tell = /Tell$/.test(c.mode), act = c.move && c.mode === c.move;
    const lean = tell ? -f * 3 : act ? f * 4 : 0, bob = Math.sin(time * 2 + c.x * 0.01) * 1.5;
    rect(g, x - w / 2 + lean, y - h + bob, w, h - 4, flash ? '#ffffff' : col); rect(g, x - w / 2 + 2 + lean, y - 4 + bob, w - 4, 4, '#2a3238');   /* body, legs trailing */
    rect(g, x - 5 * sc + lean + f * 2, y - h - 8 * sc + bob, 10 * sc, 9 * sc, '#8aa0a0'); rect(g, x + lean + f * 4 * sc, y - h - 5 * sc + bob, 2, 2, c.mode === 'raise' ? '#ff9a5c' : '#7ff0e0');   /* the drowned head, its eye */
    const role = c.sailor ? ({ cutlass: 'cutlass', shield: 'shield', harpoon: 'harpoon', anchor: 'heavy' })[c.stance] : c.role, hx = x + f * (w / 2 + 2) + lean, hy = y - h / 2 + bob;
    if (role === 'cutlass') { const a = tell ? -1.2 : act ? 0.4 : -0.4; g.strokeStyle = '#c8d0d8'; g.lineWidth = 2; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + f * Math.cos(a) * 14 * sc, hy + Math.sin(a) * 14 * sc); g.stroke(); g.lineWidth = 1; }
    else if (role === 'shield') { rect(g, hx - (f > 0 ? 0 : 6 * sc), hy - 10 * sc, 6 * sc, 18 * sc, c.mode === 'broken' ? '#5a5048' : c.mode === 'guard' ? '#c8d8e8' : '#8a8270'); }
    else if (role === 'harpoon') { g.strokeStyle = '#b0a080'; g.lineWidth = 2; g.beginPath(); g.moveTo(hx - f * 6, hy + (tell ? -6 : 0)); g.lineTo(hx + f * 18 * sc, hy - (tell ? 10 : 2)); g.stroke(); g.lineWidth = 1; }
    else if (role === 'heavy') { const up = c.mode === 'slamTell' ? -18 : c.mode === 'slam' ? 8 : 0; rect(g, hx - 4, hy + up - 4, 9 * sc, 9 * sc, '#4a4e56'); }
    if (c.mode === 'staggered' || c.mode === 'broken' || c.mode === 'reeling' || c.mode === 'swap' || c.mode === 'stuck') { g.fillStyle = '#ffd36b'; for (let i = 0; i < 3; i++) g.fillRect(x - 6 + i * 6, y - h - 14 * sc + Math.sin(time * 8 + i) * 2, 2, 2); }
  }
  H.drawOver = (g, cx, cy, time) => {
    if (!S) return;
    for (const l of S.lanterns) { const x = R(l.x - cx), y = R(l.y - cy), k = l.t / SC.CREW.lantern.t;
      rect(g, x - 3, y - 5, 6, 8, COL.lantern); g.strokeStyle = k < 0.3 ? '#ff6b6b' : COL.lantern; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 1, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.stroke(); g.lineWidth = 1;
      g.fillStyle = '#e8f4f0'; g.font = '8px monospace'; g.fillText(String(Math.ceil(l.t)), x - 3, y - 16); }
    for (const q of S.shots) { const x = R(q.x - cx), y = R(q.y - cy), a = Math.atan2(q.vy, q.vx); g.strokeStyle = q.kind === 'reel' ? '#d8b070' : '#c8d0d8'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - Math.cos(a) * 10, y - Math.sin(a) * 10); g.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6); g.stroke(); g.lineWidth = 1;
      if (q.kind === 'reel') { g.strokeStyle = '#8a7a5a'; g.beginPath(); g.moveTo(R(q.by.x - cx), R(q.by.y - cy) - 16); g.lineTo(x, y); g.stroke(); } }
    for (const v of S.waves) { const x = R(v.x - cx), y = R(S.G.floor - cy); g.globalAlpha = 0.6; rect(g, x - 8, y - 16 * v.sc, 16, 16 * v.sc, '#bfe6f5'); g.globalAlpha = 1; }
    const actors = S.ph === 1 ? SC.living(S) : S.sailor ? [S.sailor] : [];
    for (const a of actors) if (a.move === 'throw' && a.mode === 'throwTell' && a.aim) { g.strokeStyle = '#ff6b6b'; g.globalAlpha = 0.5; g.setLineDash && g.setLineDash([3, 3]); g.beginPath(); g.moveTo(R(a.x - cx), R(a.y - cy) - 16); g.lineTo(R(a.aim.x - cx), R(a.aim.y - cy)); g.stroke(); g.setLineDash && g.setLineDash([]); g.globalAlpha = 1; }
    for (const a of actors) if (a.mode === 'slamTell') { g.strokeStyle = '#ff6b6b'; g.globalAlpha = 0.5; g.beginPath(); g.ellipse(R(a.x - cx), R(S.G.floor - cy) - 2, 90, 7, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
    /* THE FOUR BARS + THE TOTAL (screen space, under the boss plate): each sailor's own, a lit lantern's ring on a fallen man's */
    if (S.ph === 1 && ctx.VW) { const VW = ctx.VW(), bw = 46, gap = 6, x0 = R(VW / 2 - (bw * 4 + gap * 3) / 2), y0 = 30;
      SC.ROLES.forEach((r, i) => { const c = S.crew[r], x = x0 + i * (bw + gap), k = c.alive ? c.hp / Math.max(1, c.maxHp) : 0, l = S.lanterns.find(q => q.role === r);
        rect(g, x, y0, bw, 5, '#1a1a22'); rect(g, x, y0, R(bw * k), 5, c.alive ? (SC.crewOpen(c) ? '#ffd36b' : COL[r]) : '#333'); if (l) rect(g, x, y0 + 6, R(bw * l.t / SC.CREW.lantern.t), 2, COL.lantern);
        g.fillStyle = '#c8d0d8'; g.font = '7px monospace'; g.fillText(SC.NAME[r].replace('THE ', ''), x, y0 - 2); }); }
  };
  return H;
}
