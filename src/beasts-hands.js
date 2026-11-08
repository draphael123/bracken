// src/beasts-hands.js - THE FROST BEASTS' HANDS (claude/foes). src/beasts.js is the rules (pure); this binds them to the game:
//   their bodies (spawn, the brain each frame, gravity and the ledge), the blow ON them (take: a pinned hero is freed by a hit on the greymane; a charging bruin is braced, full damage),
//   their blows ON THE HEROES (every seat, once per attack, through damagePlayer: the mark and HEIGHT row are read off the foe), and their drawing (the sheet's frame, the pounce RING,
//   the charge LANE, the frost breath).
// main.js calls: owns, spawn, foeUpdate, take, frame, update, drawWorld, clear, pen.   ctx: see src/foe-hands-kit.js + the list in main.js where makeBeastHands is called.
import { BEAST_BODY, BEAST_IDS, newBeast, beastStep, beastStruck, beastParried, greymanePinned, greymaneFreed, beastFrame, beastBusy } from './beasts.js';
import { makeKit } from './foe-hands-kit.js';

export function makeBeastHands(ctx) {
  const H = {}, K = makeKit(ctx);
  let fx = [];   /* {k:'ring'|'lane'|'puff', x, y, t, life, ...} */
  const isMine = q => BEAST_IDS.includes(q.t);
  H.owns = e => !!e && BEAST_IDS.includes(e.t);
  H.on = () => ctx.enemies().some(isMine);
  H.clear = () => { fx = []; };

  H.spawn = (base, ent) => {
    const C = BEAST_BODY[ent.t], hp = (ctx.EHP && ctx.EHP[ent.t]) || C.hp, s = newBeast(ent.t, base.x, base.y, ent.face || -1);
    return { ...base, t: ent.t, w: C.w, h: C.h, markH: C.h + 14, hp, maxHp0: hp, speed: 0, face: s.face, mode: s.mode, st: s, ...(ent.cnSkin ? { cnSkin: ent.cnSkin } : {}) };
  };

  /* THE BLOW ON IT: whole, as every common foe takes it, except the greymane's pin (any hit on him frees the held hero) */
  H.take = (e, dmg, fromX, tag) => {
    const s = e.st; if (!s) return dmg;
    if (s.kind === 'greymane' && s.mode === 'pin') { greymaneFreed(s); K.seats((P) => { if (P.snare > 0.1) P.snare = 0.1; }); ctx.number(e.x, e.y - e.h - 14, 'FREED', '#8fd160'); }
    return dmg;
  };

  H.frame = e => (e.st ? beastFrame(e.st, e.anim || 0, e.hurtT > 0 && !/Tell$/.test(e.mode || '')) : 0);

  H.foeUpdate = (e, dt) => {
    const s = e.st; if (!s) return;
    const C = BEAST_BODY[e.t];
    if (e.hp0 === undefined) e.hp0 = e.hp;
    const struck = e.hp < e.hp0 || e.stagger > 0; e.hp0 = e.hp;
    e.leapY = s.lift || 0;
    const heroes = K.heroes(), nearest = heroes.reduce((m, h) => Math.min(m, Math.abs(h.x - e.x)), 1e9);
    if (nearest > 560) { e.mode = s.mode; K.grav(e, dt); return; }
    if (nearest < 240) ctx.beastSeen(e.t);
    /* the token purse turned its windup away (src/attack-tokens.js): the tell is taken back, as the host puts the mode back */
    if (e.tokOut && /Tell$/.test(s.mode)) { s.mode = 'stand'; s.ringX = null; s.up = false; }
    if (struck) { const c = beastStruck(s); if (c) { ctx.number(e.x, e.y - e.h - 12, 'CUT SHORT', '#ffd36b'); K.sfx('yelp'); fx = fx.filter(f => f.o !== e); } }
    if (e.stagger > 0 && (s.mode === 'stand' || /Tell$/.test(s.mode))) { e.mode = s.mode; K.grav(e, dt); return; }
    s.x = e.x; s.y = e.y;
    const pack = K.pack(e, isMine), leader = pack.find(q => q.t === 'greymane') || null;
    const taken = pack.filter(q => q.t === 'snowrunner' && q.st && q.st.hunt).map(q => q.st.hunt);
    const world = { heroes, canStep: (x, dir) => ctx.fairStep(e, dir), rand: Math.random, busy: pack.some(q => beastBusy(q.st)), tokWait: !!e.tokWait, leader, taken };
    const x0 = e.x, evs = beastStep(s, world, dt);
    if (s.vx) ctx.moveBody(e, s.vx * dt, 0, false);
    K.grav(e, dt);
    s.x = e.x; s.y = e.y; e.face = s.face || e.face; e.mode = s.mode; e.open = s.open > 0 ? s.open : 0; e.vx = (e.x - x0) / Math.max(dt, 1e-4); e.anim = (e.anim || 0) + dt;
    e.leapY = s.lift || 0; e.h = s.up && C.hUp ? C.hUp : C.h;
    for (const v of evs) onEvent(e, s, v, heroes);
  };

  function onEvent(e, s, v, heroes) {
    if (v.t === 'tell') {
      ctx.number(e.x, e.y - e.h - 8, v.mark, v.mark === '!!' ? '#ff6b6b' : '#ffd36b'); K.sfx(s.kind === 'bruin' ? 'snort' : 'bark');
      if (v.move === 'snapTell' || v.move === 'leapTell') fx.push({ k: 'puff', o: e, x: e.x + e.face * 10, y: e.y - 10, t: 0, life: 0.4 });
      if (v.move === 'chargeTell') fx.push({ k: 'scrape', o: e, t: 0, life: v.dur });
    } else if (v.t === 'ring') { fx.push({ k: 'ring', o: e, x: v.x, y: e.y, r: v.r, t: 0, life: 0.95 });
    } else if (v.t === 'lane') { fx.push({ k: 'lane', o: e, x0: v.x0, x1: v.x1, y: e.y, t: 0, life: 0.85 });
    } else if (v.t === 'roar') { K.sfx('roar'); ctx.shake && ctx.shake(1.2); fx.push({ k: 'breath', o: e, t: 0, life: 0.9 });
    } else if (v.t === 'strike') {
      if (!s.struckThis || s.struckThis !== s.atk) { s.struckThis = s.atk; K.sfx(s.kind === 'bruin' ? 'haft' : 'strike'); }
      const dmgKey = v.key, dmg = (ctx.DMG && ctx.DMG[dmgKey]) || v.dmg;
      const verdict = K.strike(e, { ...v, dmg }, {});
      for (const r of verdict) {
        if (r.parried) { const w = beastParried(s); ctx.number(e.x, e.y - e.h - 12, s.kind === 'snowrunner' ? 'YELPS' : s.kind === 'greymane' ? 'STAGGERED' : 'ON HIS BACK LEGS', '#ffd36b'); K.sfx('yelp'); ctx.ring && ctx.ring(e.x, e.y - 8, 14, '#ffd36b', 0.3); }
        else if (r.blocked && v.push && s.kind !== 'bruin') { ctx.number(e.x, e.y - e.h - 12, 'BLOCKED', '#c9d1dc'); }
        if (v.pin && r.hit) greymanePinned(s);
        if (v.pin && r.hit) ctx.number(r.P.x, r.P.y - 26, 'PINNED: MASH', '#ff6b6b');
      }
    } else if (v.t === 'land') { K.sfx('thud'); ctx.dust(v.x, e.y, 6); ctx.shake && ctx.shake(s.kind === 'greymane' ? 1.5 : 0.6);
    } else if (v.t === 'wall') { K.sfx('thud'); ctx.shake && ctx.shake(2.4); ctx.dust(v.x + s.face * 14, e.y, 10); ctx.number(e.x, e.y - e.h - 12, 'DAZED', '#ffd36b');
    } else if (v.t === 'open') { if (v.mode === 'winded') ctx.number(e.x, e.y - e.h - 12, 'WINDED', '#ffd36b'); }
    else if (v.t === 'hesitate') { ctx.number(e.x, e.y - e.h - 12, 'HESITATES', '#9aa39a'); }
  }

  /* the frost ring on the floor where Greymane will land, the lane Bruin will run, the breath of the roar (all told on the floor) */
  H.update = dt => { for (const f of fx) f.t += dt; fx = fx.filter(f => f.t < f.life && (!f.o || f.o.alive)); };
  H.drawWorld = (g, cx, cy, time) => {
    for (const f of fx) {
      const k = f.t / f.life;
      if (f.k === 'ring') { const x = Math.round(f.x - cx), y = Math.round(f.y - cy), a = 0.35 + 0.35 * Math.sin(time * 22); g.save(); g.globalAlpha = a; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2;
        g.beginPath(); g.ellipse(x, y - 1, f.r, 5, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = a * 0.5; g.fillStyle = '#bfe8ff'; g.beginPath(); g.ellipse(x, y - 1, f.r * (0.4 + 0.6 * k), 3.5, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
      else if (f.k === 'lane') { const a = Math.round(Math.min(f.x0, f.x1) - cx), b = Math.round(Math.max(f.x0, f.x1) - cx), y = Math.round(f.y - cy) - 1; g.save(); g.globalAlpha = 0.3 + 0.3 * Math.sin(time * 20);
        g.fillStyle = '#ff6b6b'; g.fillRect(a, y, b - a, 2); g.restore(); }
      else if (f.k === 'puff' || f.k === 'breath') { const o = f.o, x = Math.round((o ? o.x + o.face * (o.w / 2 + 3) : f.x) - cx), y = Math.round((o ? o.y - o.h + 3 : f.y) - cy); g.save(); g.globalAlpha = 0.6 * (1 - k); g.fillStyle = '#e8f4ff';
        for (let i = 0; i < 3; i++) g.fillRect(x + (o ? o.face : 1) * (2 + k * 8 + i * 3), y - Math.round(k * 5) - i, 3 - (i > 1 ? 1 : 0), 2); g.restore(); }
      else if (f.k === 'scrape') { const o = f.o, x = Math.round(o.x - o.face * 4 - cx), y = Math.round(o.y - cy); g.save(); g.globalAlpha = 0.7; g.fillStyle = '#c9b27c'; if (Math.floor(time * 18) % 2) { g.fillRect(x, y - 2, 2, 1); g.fillRect(x - o.face * 3, y - 3, 1, 1); } g.restore(); }
    }
  };
  H.drawOver = () => {};
  return H;
}
