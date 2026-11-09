// src/beasts-hands.js - THE WOLF PAIR AND THE BEAR's HANDS (claude/beastsbones). src/beasts.js is the rules (pure); this binds them to the game: the body (gravity, ledges, the leap and the
// pounce's arc and landing), the told blows ('!' over a snap / bite / maul, '!!' over a throat leap / pounce / charge), the pack (one runner bites at a time, the others orbit; they hold while
// Greymane pounces; they hesitate when he dies; in co-op they SPREAD over the heroes), THE PIN (0.6 s, mash or an ally's blow frees), the poise rules, and the drawing of the ring and the lane.
// main.js calls: owns, step (per foe), tick (once a frame: the pack's bookkeeping and the pins), take (a blow on it), parried (a hero parried its blow), drawFx (per foe), frameOf.
// Its teaching lines go through ctx.callout. Bruin is always alone and at most 3 beasts stand on screen: PLACEMENT rules (the mountain lanes), not the hands'.
import * as K from './beasts.js';

const NEW = { snowrunner: K.newSnowrunner, greymane: K.newGreymane, bruin: K.newBruin };
const NAME = { snowrunner: 'SNOWRUNNER', greymane: 'GREYMANE', bruin: 'BRUIN' };
const TEACH = { snowrunner: 'SNOWRUNNER: BLOCK THE SNAP, DUCK THE THROAT LEAP - IT RUNS OUT AFTER A BITE',
  greymane: 'GREYMANE: BLOCK THE BITE (A PARRY STAGGERS HIM) - ROLL OUT OF THE FROST RING OR HE PINS YOU', bruin: 'BRUIN: BLOCK THE MAUL AFTER HIS ROAR - ROLL THROUGH THE CHARGE, HE IS TOO TALL TO JUMP' };
const G = 900;

export function makeBeastsHands(ctx) {
  const H = { pins: [], n: { snaps: 0, leaps: 0, bites: 0, pounces: 0, pins: 0, frees: 0, mauls: 0, charges: 0, crashes: 0, parries: 0, hits: 0, hesitates: 0, winded: 0 } }, said = {};
  const once = k => { if (said[k]) return false; said[k] = 1; return true; };
  let tickAt = -1, greyWas = 0;
  H.owns = e => !!e && !!NEW[e.t];
  const init = e => { if (!e.st) e.st = NEW[e.t](e.x, e.y, e.face || -1); return e.st; };
  H.reset = () => { for (const p of H.pins) ctx.unpin(p.pp); H.pins = []; tickAt = -1; greyWas = 0; };
  const heroes = () => ctx.heroes().map(h => ({ ...h, id: h.id }));
  const upright = () => ctx.players().filter(pp => ctx.upright(pp) && !pp.dead);
  const world = e => {
    const mine = ctx.enemies().filter(q => q !== e && q.alive && H.owns(q)), attacking = q => q.st && /^(snapTell|snap|leapTell|leap|biteTell|bite|pounceTell|pounce|maulTell|maul|chargeTell|charge)$/.test(q.st.mode);
    const hs = heroes(); hs.forEach((h, i) => { h.id = i; });
    return { heroes: hs, canStep: (x, dir) => ctx.canStep(e, dir), wallAhead: (x, dir) => ctx.wallAhead(e, dir),
      /* the pack: ONE RUNNER BITES AT A TIME (the purse); runners hold while Greymane tells his pounce; in co-op each takes a hero another has not */
      canAttack: e.t === 'snowrunner' ? !mine.some(q => q.t === 'snowrunner' && attacking(q)) : true,
      hold: e.t === 'snowrunner' && mine.some(q => q.t === 'greymane' && q.st && (q.st.mode === 'pounceTell' || q.st.mode === 'pounce')),
      taken: mine.filter(q => q.t === e.t && q.st && q.st.tid >= 0).map(q => q.st.tid) };
  };

  /* ONE FRAME OF ONE BEAST */
  H.step = (e, dt) => {
    const s = init(e), P = ctx.hero(); if (!P) return;
    const g = () => { if (s.air) return; e.vy = Math.min(360, (e.vy || 0) + 1000 * dt); const r = ctx.move(e, 0, e.vy * dt, false); if (r && (r.ground || r.hitY)) e.vy = 0; };
    if (e.hp0 === undefined) e.hp0 = e.hp; e.hp0 = e.hp;
    if (!s.air && Math.abs(e.x - P.x) > 540) { e.mode = s.mode; e.open = !!s.open; g(); return; }
    if (Math.abs(e.x - P.x) < 240) { ctx.seen(e.t); if (once('seen:' + e.t)) ctx.callout(TEACH[e.t]); }
    if (e.t !== 'snowrunner' && s.mode !== 'stunned') e.stagger = 0;   /* the medium and heavy bars: a light cut does not flinch them (K.beastStruck says what does) */
    if (s.air) e.stagger = 0;
    if (e.stagger > 0 && !s.air) { e.mode = s.mode; g(); return; }
    s.x = e.x; s.y = e.y;
    const x0 = e.x, hs = heroes(), evs = K.beastStep(s, world(e), dt);
    if (s.hesitate > 0 && e.t === 'snowrunner') e.hesitating = true; else e.hesitating = false;
    /* the arc of a leap or a pounce: the host integrates gravity and says when the body touched down */
    if (s.air) {
      e.airT = (e.airT || 0) + dt; s.vy += G * dt; e.vy = s.vy;
      const rx = ctx.move(e, s.vx * dt, 0, false), ry = ctx.move(e, 0, s.vy * dt, false);
      if (rx && rx.hitX) s.vx *= 0.2;
      if (e.t === 'snowrunner') { const h = K.airHit(s, hs); if (h) { const pp = ctx.players()[h.id]; const res = ctx.hit(pp, e.x - Math.sign(s.vx || 1) * 6, K.SNOW.leapDmg, e, NAME[e.t], { unblockable: true }); s.hit = !!res.landed; if (res.landed) { H.n.hits++; ctx.chill(pp, K.SNOW.chill); } } }
      if (ry && ry.ground && s.vy >= 0 && e.airT > 0.08) { e.airT = 0; e.vy = 0; handle(e, s, K.beastLanded(s, hs)); }
    } else {
      if (s.vx) ctx.move(e, s.vx * dt, 0, false);
      g();
      if (s.mode === 'charge' && !s.hit) { const h = K.chargeHit(s, hs); if (h) { const pp = ctx.players()[h.id]; const res = ctx.hit(pp, e.x - s.face * 6, K.BRUIN.chargeDmg, e, NAME[e.t], { unblockable: true }); s.hit = !!res.landed; if (res.landed) { H.n.hits++; ctx.down(pp, K.BRUIN.chargeDown, s.face); } } }
    }
    s.x = e.x; s.y = e.y; e.face = s.face || e.face; e.mode = s.mode; e.open = !!s.open; e.vx = (e.x - x0) / Math.max(dt, 1e-4); e.anim = (e.anim || 0) + dt;
    handle(e, s, evs);
  };
  function handle(e, s, evs) {
    for (const v of evs) {
      if (v.t === 'snapTell') { ctx.mark(e, '!', '#ffd36b'); ctx.sfx('snapTell'); }
      else if (v.t === 'snap') { H.n.snaps++; ctx.sfx('snap'); melee(e, s, v, K.SNOW.chill); }
      else if (v.t === 'leapTell') { ctx.mark(e, '!!', '#ff6b6b'); ctx.sfx('leapTell'); ctx.burst(e.x + s.face * 8, e.y - 9, 4, ['#e8f6ff', '#cfe0ee'], 25, 0.4, -20); }
      else if (v.t === 'leap') { H.n.leaps++; e.air = true; ctx.sfx('leap'); }
      else if (v.t === 'skid') { ctx.burst(e.x - s.face * 4, e.y - 1, 6, ['#e8f6ff', '#9aa8b8'], 40, 0.4); ctx.sfx('skid'); ctx.number(e.x, e.y - e.h - 8, K.BEAST_SAY.dazed, '#ffd36b'); }
      else if (v.t === 'biteTell') { ctx.mark(e, '!', '#ffd36b'); ctx.sfx('biteTell'); }
      else if (v.t === 'bite') { H.n.bites++; ctx.sfx('bite'); melee(e, s, v, 0); }
      else if (v.t === 'pounceTell') { ctx.mark(e, '!!', '#ff6b6b'); ctx.sfx('pounceTell'); }
      else if (v.t === 'pounce') { H.n.pounces++; e.air = true; ctx.sfx('pounce'); }
      else if (v.t === 'pounceHit') {
        ctx.sfx('thump'); ctx.shake(3); ctx.burst(s.landX, e.y - 2, 12, ['#e8f6ff', '#9aa8b8', '#cfe0ee'], 70, 0.5);
        for (const id of v.heroes) { const pp = ctx.players()[id]; if (!pp) continue; const res = ctx.hit(pp, s.landX, v.dmg, e, NAME[e.t], { unblockable: true });
          if (res.landed) { H.n.hits++; H.n.pins++; H.pins.push({ pp, e, t: v.pin }); ctx.number(pp.x, pp.y - 24, K.BEAST_SAY.pinned, '#ff6b6b'); if (once('pinTold')) ctx.callout('PINNED: MASH TO THROW HIM OFF - OR HAVE A FRIEND HIT HIM'); } } }
      else if (v.t === 'winded') { H.n.winded++; ctx.sfx('winded'); ctx.number(e.x, e.y - e.h - 8, K.BEAST_SAY.winded, '#ffd36b'); if (once('windedTold')) ctx.callout('A MISSED POUNCE LEAVES HIM WINDED: STRIKE NOW'); }
      else if (v.t === 'maulTell') { ctx.mark(e, '!', '#ffd36b'); ctx.sfx('roar'); ctx.burst(e.x + s.face * 12, e.y - 26, 5, ['#ffffff', '#e8f0f8'], 25, 0.5, -15); }
      else if (v.t === 'maul') { H.n.mauls++; ctx.sfx('maul'); melee(e, s, v, 0); }
      else if (v.t === 'chargeTell') { ctx.mark(e, '!!', '#ff6b6b'); ctx.sfx('chargeTell'); }
      else if (v.t === 'charge') { H.n.charges++; ctx.sfx('charge'); }
      else if (v.t === 'crash') { H.n.crashes++; ctx.sfx('thud'); ctx.shake(4); ctx.number(e.x, e.y - e.h - 8, K.BEAST_SAY.dazed, '#ffd36b'); ctx.burst(e.x + s.face * 12, e.y - 12, 10, ['#cfd4da', '#8a8e96'], 60, 0.5); if (once('crashTold')) ctx.callout('HE CRASHED: HIT HIM NOW'); }
    }
  }
  /* a melee blow with a box: the first hero in it, once; a PARRY staggers the beast; a block pushes the hero back */
  function melee(e, s, v, chill) {
    const [l, r, t, b] = v.box;
    for (const pp of upright()) { const hb = ctx.hurtBox(pp); if (!(l < hb.r && r > hb.l && t < hb.b && b > hb.t)) continue;
      const res = ctx.hit(pp, e.x, v.dmg, e, NAME[e.t], {}); if (res.landed) { H.n.hits++; if (chill) ctx.chill(pp, chill); }
      if (res.parried) H.parried(e); else if (res.blocked && v.push) ctx.push(pp, s.face, v.push);
      s.hit = s.hit || !!res.landed; break; }
  }
  H.parried = e => { const s = init(e); if (K.beastParried(s)) { H.n.parries++; e.mode = s.mode; ctx.number(e.x, e.y - e.h - 8, e.t === 'snowrunner' ? K.BEAST_SAY.yelp : K.BEAST_SAY.dazed, '#ffd36b'); ctx.sfx('open'); } };

  /* ONCE A FRAME: the pack's bookkeeping (Greymane's death: the runners hesitate, told) and the pins (mash or an ally's blow frees; his death frees) */
  H.tick = (dt, time) => {
    if (time === tickAt) return; tickAt = time;
    const live = ctx.enemies().filter(q => q.alive && H.owns(q)), grey = live.filter(q => q.t === 'greymane').length;
    if (greyWas > 0 && grey === 0) for (const q of live) if (q.t === 'snowrunner') { K.beastHesitate(init(q)); H.n.hesitates++; ctx.number(q.x, q.y - q.h - 8, K.BEAST_SAY.hesitate, '#9aa8b8'); }
    greyWas = grey;
    H.pins = H.pins.filter(p => {
      const s = p.e.st; let free = !p.e.alive || !s || s.mode !== 'pin' || p.pp.dead; p.t -= dt;
      if (!free && ctx.mashed(p.pp)) p.t -= 0.18;
      if (!free) for (const q of upright()) if (q !== p.pp) { const sb = ctx.strikeBox(q); if (sb && sb.l < p.e.x + 13 && sb.r > p.e.x - 13 && sb.t < p.e.y && sb.b > p.e.y - 15) { free = true; break; } }
      if (p.t <= 0) free = true;
      if (free) { ctx.unpin(p.pp); if (s && s.mode === 'pin') { s.mode = 'recover'; s.t = K.GREY.pounceRecover; s.cd = K.GREY.cd; p.e.mode = s.mode; } if (p.e.alive && p.t > 0) { H.n.frees++; ctx.number(p.pp.x, p.pp.y - 24, K.BEAST_SAY.freed, '#8fd160'); } return false; }
      ctx.pin(p.pp, 0.1); return true; });
  };

  /* A BLOW ON IT. b = { fromX, heavy, plunge }. Returns the damage to take (always whole: the bars decide who flinches, not the damage) */
  H.take = (e, dmg, b) => {
    const s = init(e), r = K.beastStruck(s, { dmg, heavy: !!b.heavy }, K.BEAST_HP[e.t]);
    if (e.t === 'bruin' && s.mode === 'charge' && !(e.bracedSaid > ctx.time())) { e.bracedSaid = ctx.time() + 2; ctx.number(e.x, e.y - e.h - 8, K.BEAST_SAY.braced, '#c8ccd4'); }
    if (r === 'cancel') { e.mode = s.mode; e.open = !!s.open; if (e.t === 'snowrunner') ctx.sfx('yelp'); }
    if (r === 'flinch' && e.t !== 'snowrunner') { e.mode = s.mode; }
    return dmg;
  };

  /* THE FROST RING (Greymane's pounce) and THE LANE (Bruin's charge), drawn on the floor under the foe */
  H.drawFx = (g, e, cx, cy, time) => {
    const s = e.st; if (!s || !e.alive) return;
    if (e.t === 'greymane' && (s.mode === 'pounceTell' || s.mode === 'pounce')) { const x = Math.round(s.landX - cx), y = Math.round(e.y - cy), k = s.mode === 'pounceTell' ? 1 - s.t / K.GREY.pounceTell : 1, r = K.GREY.pounceR;
      g.fillStyle = 'rgba(200,232,255,' + (0.25 + 0.4 * k) + ')'; g.fillRect(x - r, y - 1, r * 2, 2); g.fillRect(x - r + 4, y - 3, r * 2 - 8, 1); g.fillStyle = 'rgba(255,107,107,' + (0.3 + 0.5 * k) + ')'; g.fillRect(x - r, y, 2, 1); g.fillRect(x + r - 2, y, 2, 1); }
    if (e.t === 'bruin' && s.mode === 'chargeTell') { const k = 1 - s.t / K.BRUIN.chargeTell, x0 = Math.round(Math.min(s.laneX0, s.laneX1) - cx), x1 = Math.round(Math.max(s.laneX0, s.laneX1) - cx), y = Math.round(e.y - cy);
      g.fillStyle = 'rgba(255,107,107,' + (0.2 + 0.4 * k) + ')'; for (let x = x0; x < x1; x += 8) g.fillRect(x, y - 1, 5, 1); g.fillStyle = 'rgba(207,212,218,0.7)'; g.fillRect(Math.round(e.x - cx) - s.face * 14, y - 1, 6, 1); }
    if (e.t === 'snowrunner' && (s.hesitate > 0)) { g.fillStyle = '#9aa8b8'; g.fillRect(Math.round(e.x - cx) - 2, Math.round(e.y - e.h - 4 - cy), 4, 1); }
    if ((e.t === 'greymane' || e.t === 'bruin') && s.open && (s.mode === 'winded' || s.mode === 'dazed')) { for (let i = 0; i < 3; i++) { const a = time * 5 + i * 2.1, x = Math.round(e.x - cx + Math.cos(a) * 9), y = Math.round(e.y - e.h - 6 - cy + Math.sin(a) * 2); g.fillStyle = '#ffd36b'; g.fillRect(x, y, 2, 2); } }
  };
  H.read = () => ({ ...H.n, pins: H.pins.length });
  return H;
}

/* the sprite frame of each beast (src/redraw/beasts_art.js): idle 0,1 | walk 2-5 | the tells and blows | hurt | (the last frame is the death) */
export function beastFrame(e) {
  const s = e.st || e, m = s.mode || e.mode, walk = 2 + Math.floor((e.anim || 0) * (e.t === 'snowrunner' ? 14 : 7)) % 4, idle = Math.floor((e.anim || 0) * 2) % 2, moving = Math.abs(e.vx || 0) > 6;
  if (e.t === 'snowrunner') return e.hurtT > 0 ? 11 : ({ snapTell: 6, snap: 7, leapTell: 8, leap: 9, skid: 10, stunned: 10 })[m] ?? (moving ? walk : idle);
  if (e.t === 'greymane') return e.hurtT > 0 ? 12 : ({ biteTell: 6, bite: 7, pounceTell: 8, pounce: 9, pin: 10, winded: 11, stunned: 11 })[m] ?? (moving ? walk : idle);
  return e.hurtT > 0 && m !== 'charge' ? 14 : m === 'maulTell' ? (s.t > 0.55 ? 6 : 7) : m === 'stunned' ? 7 : m === 'charge' ? 10 + Math.floor((e.anim || 0) * 12) % 3 : ({ maul: 8, chargeTell: 9, dazed: 13 })[m] ?? (s.open && m === 'recover' ? 12 : moving ? walk : idle);
}
