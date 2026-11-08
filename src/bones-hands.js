// src/bones-hands.js - THE SKELETON SET's HANDS (claude/foes). src/bones.js is the rules (pure); this binds them to the game:
//   their bodies (spawn, the brain each frame, gravity and the ledge), the blow ON them (take: the soldier's SHIELD GUARD x0.4 and its three breaks), their blows ON the heroes (every seat,
//   once per attack, through damagePlayer), and THEIR OWN THINGS IN FLIGHT in arrays of their own (never `seeds`: the pyro's ember ward, the pirate's hook catch and the ranger's snatch
//   eat seeds): the archer's arrows and the volley's lobs, the mage's WISPS, the GRAVE ROW's bone hands, and the told fx (the aim line, the dust motes, the blink puff).
// main.js calls: owns, spawn, foeUpdate, take, frame, update, drawWorld, clear.
import { BONE_BODY, BONE_IDS, newBone, boneStep, boneStruck, boneParried, soldierTake, wispStep, graveStep, boneFrame, boneBusy, MAGE } from './bones.js';
import { makeKit } from './foe-hands-kit.js';

export function makeBoneHands(ctx) {
  const H = {}, K = makeKit(ctx);
  let arrows = [], wisps = [], graves = [], fx = [];
  const isMine = q => BONE_IDS.includes(q.t);
  H.owns = e => !!e && BONE_IDS.includes(e.t);
  H.on = () => ctx.enemies().some(isMine) || arrows.length > 0 || wisps.length > 0 || graves.length > 0;
  H.clear = () => { arrows = []; wisps = []; graves = []; fx = []; };

  H.spawn = (base, ent) => {
    const C = BONE_BODY[ent.t], hp = (ctx.EHP && ctx.EHP[ent.t]) || C.hp, s = newBone(ent.t, base.x, base.y, ent.face || -1);
    return { ...base, t: ent.t, w: C.w, h: C.h, markH: C.h + 14, hp, maxHp0: hp, speed: 0, face: s.face, mode: s.mode, st: s, bone: true, ...(ent.cnSkin ? { cnSkin: ent.cnSkin } : {}) };
  };

  /* THE BLOW ON IT. The soldier's round shield: the front is warded x0.4 (never immune), until a HEAVY blow knocks it aside, a parry of his thrust opens him, or the blow comes from behind or above */
  H.take = (e, dmg, fromX, tag, plunge) => {
    const s = e.st; if (!s || s.kind !== 'skelsoldier') return dmg;
    const heavy = !!(tag && (tag === 'heavy' || (Array.isArray(tag) && tag.includes('heavy')))) || !!ctx.heavyBlow && ctx.heavyBlow();
    const r = soldierTake(s, fromX, { heavy, plunge: !!plunge || !!(ctx.plungeBlow && ctx.plungeBlow()) });
    if (r.warded) { K.sfx('clank'); ctx.number(e.x, e.y - e.h - 14, 'WARDED', '#c9d1dc'); ctx.sparks && ctx.sparks(e.x + s.face * 6, e.y - 10, s.face, 3); if (ctx.once && ctx.once('bonesWard')) ctx.hint && ctx.hint('HIS SHIELD WARDS THE FRONT: HIT HIM FROM BEHIND, FROM ABOVE, WITH A HEAVY BLOW - OR PARRY HIS THRUST'); }
    else if (r.say) ctx.number(e.x, e.y - e.h - 14, r.say, '#ffd36b');
    return Math.max(1, Math.round(dmg * r.k));
  };

  H.frame = e => (e.st ? boneFrame(e.st, e.anim || 0, e.hurtT > 0 && !/Tell$/.test(e.mode || '')) : 0);

  const floorOkFor = e => (x) => {   /* a floor under x on this foe's own row, and no wall between him and it */
    const TS = ctx.TS, tx = Math.floor(x / TS), ty = Math.floor((e.y + 2) / TS);
    if (!ctx.isSolid(tx, ty) || ctx.isSolid(tx, Math.floor((e.y - 6) / TS)) || ctx.isSolid(tx, Math.floor((e.y - 14) / TS))) return false;
    const dir = x > e.x ? 1 : -1; for (let px = e.x; dir > 0 ? px < x : px > x; px += dir * 8) { if (ctx.isSolid(Math.floor(px / TS), Math.floor((e.y - 6) / TS)) || !ctx.isSolid(Math.floor(px / TS), ty)) return false; }
    return true;
  };

  H.foeUpdate = (e, dt) => {
    const s = e.st; if (!s) return;
    const C = BONE_BODY[e.t];
    if (e.hp0 === undefined) e.hp0 = e.hp;
    const struck = e.hp < e.hp0 || e.stagger > 0; e.hp0 = e.hp;
    const heroes = K.heroes(), nearest = heroes.reduce((m, h) => Math.min(m, Math.abs(h.x - e.x)), 1e9);
    if (nearest > 560) { e.mode = s.mode; K.grav(e, dt); return; }
    if (nearest < 240) ctx.beastSeen(e.t);
    if (e.tokOut && /Tell$/.test(s.mode)) { s.mode = 'stand'; s.spots = null; s.aim = null; }
    if (struck) { const c = boneStruck(s); if (c) { ctx.number(e.x, e.y - e.h - 12, 'CUT SHORT', '#ffd36b'); K.sfx('clatter'); if (c === 'volleyTell' || c === 'aimTell') fx = fx.filter(f => f.o !== e); } }
    if (e.stagger > 0 && (s.mode === 'stand' || /Tell$/.test(s.mode))) { e.mode = s.mode; K.grav(e, dt); return; }
    s.x = e.x; s.y = e.y;
    const pack = K.pack(e, isMine);
    const world = { heroes, canStep: (x, dir) => ctx.fairStep(e, dir), floorOk: floorOkFor(e), rand: Math.random, busy: pack.some(q => boneBusy(q.st)), tokWait: !!e.tokWait };
    const x0 = e.x, evs = boneStep(s, world, dt);
    if (s.vx) ctx.moveBody(e, s.vx * dt, 0, false);
    K.grav(e, dt);
    s.y = e.y; e.face = s.face || e.face; e.mode = s.mode; e.open = s.open > 0 ? s.open : 0; e.vx = (e.x - x0) / Math.max(dt, 1e-4); e.anim = (e.anim || 0) + dt;
    for (const v of evs) onEvent(e, s, v);
    if (!evs.some(v => v.t === 'blink')) s.x = e.x;
  };

  function onEvent(e, s, v) {
    if (v.t === 'tell') {
      ctx.number(e.x, e.y - e.h - 8, v.mark, v.mark === '!!' ? '#ff6b6b' : '#ffd36b'); K.sfx(s.kind === 'skelsoldier' ? 'clatter' : s.kind === 'skelarcher' ? 'hornDraw' : 'hiss');
      if (v.move === 'aimTell') fx.push({ k: 'aim', o: e, t: 0, life: v.dur });
      if (v.move === 'volleyTell') for (const x of v.spots) fx.push({ k: 'mote', o: e, x, y: e.y, t: 0, life: v.dur + 1.1 });
      if (v.move === 'graveTell') fx.push({ k: 'crack', o: e, x: e.x, dir: e.face, t: 0, life: v.dur });
    } else if (v.t === 'strike') {
      if (s.struckThis !== s.atk) { s.struckThis = s.atk; K.sfx('strike'); }
      const dmg = (ctx.DMG && ctx.DMG[v.key]) || v.dmg;
      const verdict = K.strike(e, { ...v, dmg }, {});
      for (const r of verdict) if (r.parried) { boneParried(s); ctx.number(e.x, e.y - e.h - 12, 'SHIELD ARM WIDE', '#ffd36b'); K.sfx('clank'); ctx.ring && ctx.ring(e.x, e.y - 10, 14, '#ffd36b', 0.3); }
    } else if (v.t === 'shot') {
      arrows.push({ x: v.x, y: v.y, vx: v.vx, vy: v.vy, g: 0, dmg: (ctx.DMG && ctx.DMG[v.key]) || v.dmg, life: v.life, owner: e, flat: true, high: true, name: 'THE AIMED SHOT', atk: v.atk }); K.sfx('leap');
    } else if (v.t === 'lob') {
      arrows.push({ x: v.x, y: v.y, vx: v.vx, vy: v.vy, g: v.g, dmg: (ctx.DMG && ctx.DMG[v.key]) || v.dmg, life: v.life, owner: e, flat: false, high: false, name: 'THE ARC VOLLEY', unblock: true, spot: v.spot, floorY: e.y - 2, atk: v.atk }); K.sfx('leap');
    } else if (v.t === 'wisp') {
      wisps.push({ x: v.x, y: v.y, ang: v.dir > 0 ? 0 : Math.PI, life: v.life, dmg: (ctx.DMG && ctx.DMG[v.key]) || v.dmg, owner: e, atk: v.atk }); K.sfx('zap');
    } else if (v.t === 'grave') {
      graves.push({ x0: v.x, dir: v.dir, run: 0, len: v.len, dmg: (ctx.DMG && ctx.DMG[v.key]) || v.dmg, owner: e, hit: new Set(), y: e.y, atk: v.atk }); K.sfx('crumble'); ctx.shake && ctx.shake(0.8);
    } else if (v.t === 'blinkTell') { fx.push({ k: 'puff', x: v.x, y: e.y - 10, t: 0, life: 0.5 }); K.sfx('puff'); ctx.number(e.x, e.y - e.h - 8, 'BACKSTEP', '#8fd160');
    } else if (v.t === 'blink') { e.x = v.x1; s.x = v.x1; e.vx = 0; fx.push({ k: 'puff', x: v.x1, y: e.y - 10, t: 0, life: 0.5 }); K.sfx('puff'); }
  }

  /* things in flight */
  const hitSeats = (box, high, fn) => K.seats((P, pp) => { const hb = high ? ctx.duckBox(P) : ctx.box(P); if (ctx.overlap(box, hb)) fn(P, pp); });
  H.update = dt => {
    const solid = (x, y) => ctx.isSolid(Math.floor(x / ctx.TS), Math.floor(y / ctx.TS));
    for (const a of arrows) {
      a.life -= dt; a.vy += a.g * dt; a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.life <= 0 || solid(a.x, a.y)) { a.dead = true; if (!a.flat) ctx.dust(a.x, a.floorY || a.y, 3); continue; }
      if (!a.flat && a.vy > 0 && a.y >= (a.floorY || a.y + 1)) { a.dead = true; ctx.dust(a.x, a.floorY, 4); }
      hitSeats({ l: a.x - 3, r: a.x + 3, t: a.y - 2, b: a.y + 2 }, a.high && a.flat, (P, pp) => {
        if (a.dead) return; a.dead = true;
        const res = ctx.damagePlayer(a.x - Math.sign(a.vx), a.dmg, { who: a.owner, name: a.name, unblockable: !!a.unblock, pierce: false });
        if (!res || res === 'blocked') ctx.sparks && ctx.sparks(a.x, a.y, -Math.sign(a.vx), 3);
      });
    }
    arrows = arrows.filter(a => !a.dead);
    for (const w of wisps) {
      if (!wispStep(w, K.heroes(), dt)) { w.dead = true; ctx.burst && ctx.burst(w.x, w.y, 6, ['#9ff0c0', '#d7fff0'], 40, 0.4); continue; }
      if (solid(w.x, w.y)) { w.dead = true; ctx.burst && ctx.burst(w.x, w.y, 6, ['#9ff0c0', '#d7fff0'], 40, 0.4); continue; }
      if (K.struckBy(w.x, w.y, MAGE.wispR + 4)) { w.dead = true; ctx.burst && ctx.burst(w.x, w.y, 10, ['#9ff0c0', '#d7fff0', '#ffffff'], 70, 0.45); K.sfx('puff'); ctx.number(w.x, w.y - 8, 'POPPED', '#9ff0c0'); continue; }
      hitSeats({ l: w.x - MAGE.wispR, r: w.x + MAGE.wispR, t: w.y - MAGE.wispR, b: w.y + MAGE.wispR }, false, (P) => {
        if (w.dead) return; w.dead = true; const res = ctx.damagePlayer(w.x - Math.cos(w.ang) * 4, w.dmg, { who: w.owner, name: 'THE BONE WISP' });
        ctx.burst && ctx.burst(w.x, w.y, 8, ['#9ff0c0', '#d7fff0'], 60, 0.4); if (res === 'blocked') K.sfx('clank'); });
    }
    wisps = wisps.filter(w => !w.dead);
    for (const g of graves) {
      const x = graveStep(g, dt); if (x === null) { g.dead = true; continue; }
      g.cx = x; if (Math.floor(g.run / 14) !== Math.floor((g.run - 180 * dt) / 14) && ctx.dust) ctx.dust(x, g.y, 2);
      K.seats((P, pp) => { if (g.hit.has(pp)) return;
        if (ctx.overlap({ l: x - 6, r: x + 6, t: g.y - MAGE.graveH, b: g.y }, ctx.box(P))) { g.hit.add(pp); const res = ctx.damagePlayer(x, g.dmg, { who: g.owner, name: 'THE GRAVE ROW', unblockable: true });
          if (res && res !== 'blocked') { P.vy = Math.min(P.vy || 0, -140); P.ground = false; } } });
    }
    graves = graves.filter(g => !g.dead);
    for (const f of fx) f.t += dt; fx = fx.filter(f => f.t < f.life && (!f.o || f.o.alive));
  };

  H.drawWorld = (g, cx, cy, time) => {
    for (const f of fx) {
      const k = f.t / f.life;
      if (f.k === 'aim' && f.o) { const o = f.o, s = o.st, a = s && s.aim; if (!a) continue; const x0 = Math.round(o.x + o.face * 8 - cx), y0 = Math.round(o.y - 13 - cy), dx = a.x - (o.x + o.face * 8), dy = a.y - (o.y - 13), len = Math.hypot(dx, dy) || 1, n = Math.min(60, len);
        g.save(); g.globalAlpha = 0.25 + 0.5 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0); g.lineTo(Math.round(x0 + dx / len * n), Math.round(y0 + dy / len * n)); g.stroke(); g.restore(); }
      else if (f.k === 'mote') { const x = Math.round(f.x - cx), y = Math.round(f.y - cy); g.save(); g.globalAlpha = 0.45 + 0.35 * Math.sin(time * 18 + f.x); g.fillStyle = '#ff6b6b'; g.beginPath(); g.ellipse(x, y - 1, 9, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#d9d6c0';
        for (let i = 0; i < 3; i++) g.fillRect(x - 4 + i * 4, y - 4 - Math.floor((time * 12 + i * 3) % 4), 2, 2); g.restore(); }
      else if (f.k === 'crack' && f.o) { const o = f.o; g.save(); g.globalAlpha = 0.3 + 0.4 * k; g.fillStyle = '#ff6b6b'; const x0 = Math.round(o.x + o.face * 8 - cx), len = Math.round(60 * k); g.fillRect(o.face > 0 ? x0 : x0 - len, Math.round(o.y - cy) - 1, len, 2); g.restore(); }
      else if (f.k === 'puff') { const x = Math.round(f.x - cx), y = Math.round(f.y - cy); g.save(); g.globalAlpha = 0.7 * (1 - k); g.fillStyle = '#8fd160'; g.beginPath(); g.arc(x, y, 3 + k * 9, 0, Math.PI * 2); g.fill(); g.restore(); }
    }
    for (const a of arrows) { const x = Math.round(a.x - cx), y = Math.round(a.y - cy), d = Math.atan2(a.vy, a.vx); g.save(); g.translate(x, y); g.rotate(d); g.fillStyle = '#d9d6c0'; g.fillRect(-5, -1, 8, 1); g.fillStyle = '#7a5230'; g.fillRect(-5, 0, 2, 1); g.restore(); }
    for (const w of wisps) { const x = Math.round(w.x - cx), y = Math.round(w.y - cy), p = 0.5 + 0.5 * Math.sin(time * 14); g.save(); g.globalAlpha = 0.45; g.fillStyle = '#9ff0c0'; g.beginPath(); g.arc(x, y, 4 + p, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; g.fillStyle = '#d7fff0'; g.fillRect(x - 1, y - 1, 3, 3); g.fillStyle = '#233a30'; g.fillRect(x - 1, y - 1, 1, 1); g.restore(); }
    for (const gr of graves) { const x = Math.round((gr.cx ?? gr.x0) - cx), y = Math.round(gr.y - cy); g.save(); g.fillStyle = '#d9d6c0'; for (let i = 0; i < 3; i++) { const h = 5 + ((i + Math.floor(gr.run / 8)) % 3) * 3; g.fillRect(x - 5 + i * 4, y - h, 2, h); g.fillRect(x - 6 + i * 4, y - h - 1, 4, 1); } g.restore(); }
  };
  H.drawOver = () => {};
  return H;
}
