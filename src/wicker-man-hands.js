// src/wicker-man-hands.js - THE WICKER MAN's HANDS (claude/fairfix6). src/wicker-man.js is the rules (pure); this binds them to the game:
//   its body (the fair's look - the host says whether a hero faces it; gravity; its feet on the fair's ground), its told blows ('!!' over the fire it lights,
//   '!' over its arms), ITS FIRE - a burning bundle bowled along the ground (the game's own moveBody, so it rolls down a ramp and stops at a wall), which hurts
//   once what stands in it and is STRUCK BACK by the Queen's own rule (a blow begun as it comes into your reach with a held blade, or the ember flare) - and,
//   struck back, catching it (its opening: a blow lands whole in its fire, a scratch on the standing wicker), its fire drawn on it, and its balls drawn.
// main.js calls: owns, step (per foe), tick (once a frame: the swing clock and the balls), take (a blow on it), drawBalls. Its teaching lines go through
// ctx.callout and are listed in src/hint-lines.js.
import { WM, wickerManStep, wmIgnite, wmTake, wmOpen, strikeJudge, newWickerMan } from './wicker-man.js';

export function makeWickerManHands(ctx) {
  const H = { balls: [], n: { throws: 0, struck: 0, wild: 0, caught: 0, burns: 0, ballHits: 0, swings: 0, scratches: 0 } }, said = {};
  const once = k => { if (said[k]) return false; said[k] = 1; return true; };
  let serial = 0, tickAt = -1;
  H.owns = e => !!e && e.t === 'wickerman';
  const init = e => { if (!e.st) e.st = newWickerMan(e.x, e.y, e.face || -1); return e.st; };
  H.reset = () => { H.balls = []; tickAt = -1; };
  /* ONE FRAME OF ONE WICKER MAN */
  H.step = (e, dt) => {
    const s = init(e), P = ctx.hero(); if (!P || Math.abs(e.x - P.x) > 420) return;
    if (Math.abs(e.x - P.x) < 240) { ctx.seen('wickerman'); if (once('seen')) ctx.callout('THE WICKER MAN: STRIKE ITS FIRE BACK'); }
    e.stagger = 0;   /* a scratch does not rock a wicker effigy: a blow never cuts its tell short (only its own fire, struck back, stops it) */
    s.x = e.x; s.y = e.y;
    const x0 = e.x, evs = wickerManStep(s, { heroes: ctx.heroes(), seen: ctx.watched(e), canStep: dir => ctx.canStep(e, dir) }, dt);
    if (s.vx) ctx.move(e, s.vx * dt, 0);
    e.vy = Math.min(360, (e.vy || 0) + 1000 * dt); const r = ctx.move(e, 0, e.vy * dt); if (r && (r.ground || r.hitY)) e.vy = 0;
    s.x = e.x; s.y = e.y; e.face = s.face || e.face; e.mode = s.mode; e.vx = (e.x - x0) / Math.max(dt, 1e-4); e.wmOpen = wmOpen(s);
    for (const v of evs) {
      if (v.t === 'throwTell') { ctx.mark(e, '!!', '#ff6b6b'); ctx.sfx('throwTell'); }
      else if (v.t === 'throw') { H.n.throws++; const b = { x: v.x, y: e.y - 1, w: 8, h: 8, vy: 0, dir: v.dir, t: 0, n: ++serial, owner: e, ret: false, ripe: false, wild: false };
        H.balls.push(b); ctx.sfx('throw'); ctx.burst(v.x, e.y - 10, 6, ['#ffc850', '#f08a28'], 50, 0.3); }
      else if (v.t === 'swingTell') { ctx.mark(e, '!', '#ffd36b'); ctx.sfx('swingTell'); }
      else if (v.t === 'swing') { H.n.swings++; ctx.sfx('swing'); ctx.hitBox(v.box, v.dmg, e, 'THE WICKER MAN'); }
      else if (v.t === 'burn') { H.n.burns++; ctx.callout('IT BURNS: CUT IT'); ctx.sfx('burn'); }
      else if (v.t === 'stamp') { ctx.callout('IT STAMPS ITS FIRE OUT'); ctx.sfx('stamp'); ctx.burst(e.x, e.y - 6, 10, ['#5a5048', '#8a7a6a', '#3a3230'], 40, 0.7); }
    }
    if (s.mode === 'burn' || s.mode === 'catch') { if (Math.random() < dt * 40) ctx.flame(e.x + (Math.random() - 0.5) * 14, e.y - 6 - Math.random() * 34); }
    else if (s.mode === 'throwTell' && Math.random() < dt * 20) ctx.flame(e.x - (s.face || -1) * 4, e.y - WM.h - 2);
  };
  /* ONCE A FRAME: the swing clock (a blow BEGUN this frame, and whether the blade had been held RET.set s before it) and every ball in flight */
  H.tick = (dt, time) => {
    if (time === tickAt) return; tickAt = time;
    for (const pp of ctx.players()) { const a = pp.atk ?? -1, st = a >= 0 && (!(pp.wmAtkP >= 0) || a < pp.wmAtkP); pp.wmAtkP = a; pp.wmStart = st;
      if (st) { pp.wmFresh = time - (pp.wmSwingAt ?? -99) >= ctx.retSet; pp.wmSwingAt = time; } }
    if (!H.balls.length) return;
    H.balls = H.balls.filter(b => {
      b.t += dt; const e = b.owner, sp = b.ret ? WM.retSpeed : WM.ballSpeed;
      if (Math.random() < dt * 30) ctx.flame(b.x, b.y - 6);
      const r = ctx.move(b, b.dir * sp * dt, 0); b.vy = Math.min(400, b.vy + 900 * dt); const r2 = ctx.move(b, 0, b.vy * dt); if (r2 && (r2.ground || r2.hitY)) b.vy = 0;
      const gone = () => { ctx.burst(b.x, b.y - 6, 10, ['#ffc850', '#f08a28', '#4e3a1a'], 70, 0.5); ctx.sfx('fizz'); return false; };
      if (b.ret) {   /* STRUCK BACK: home along the ground into the wicker, and it catches. A struck-back ball hurts nobody */
        if (e && e.alive && Math.abs(b.x - e.x) < WM.retHit && Math.abs(b.y - e.y) < 30) { if (wmIgnite(init(e))) { H.n.caught++; e.mode = e.st.mode; ctx.callout('ITS OWN FIRE: IT CATCHES'); ctx.sfx('catch'); ctx.burst(e.x, e.y - 20, 14, ['#ffc850', '#f08a28', '#fff0b0'], 90, 0.5); ctx.shake(3); return false; } return gone(); }
        if ((r && r.hitX) || b.t > WM.ballLife || b.vy > 300) return gone(); return true; }
      b.ripe = false;
      for (const pp of ctx.players()) { if (!ctx.upright(pp) || pp.dead) continue;
        const low = pp.y > b.y - 24 && pp.y < b.y + 12 && !pp.onMover;
        const j = strikeJudge({ x: pp.x, y: pp.y, face: pp.face || 1, low, begun: !!pp.wmStart, fresh: !!pp.wmFresh, flare: ctx.flareUp(pp) }, b);
        if (j === 'back') { b.ret = true; b.dir = -b.dir; b.t = 0; b.by = pp; H.n.struck++; ctx.sfx('struck'); ctx.burst(b.x, b.y - 8, 8, ['#fff0b0', '#ffc850'], 80, 0.3); ctx.callout('STRUCK BACK'); return true; }
        if (j === 'wild' && !b.wild) { b.wild = true; H.n.wild++; ctx.burst(b.x, b.y - 8, 5, ['#c9d1dc', '#ffc850'], 60, 0.25); ctx.callout('TOO WILD: WAIT, THEN STRIKE AS IT COMES'); }
        if (j === 'ripe') b.ripe = true;
        if ((pp.wmBall || -1) === b.n) continue;
        const hb = ctx.hurtBox(pp); if (Math.abs(pp.x - b.x) < 10 && hb.b > b.y - WM.ballTop && hb.t < b.y) { pp.wmBall = b.n; H.n.ballHits++; ctx.hurt(pp, b.x, WM.ballDmg, e, 'THE WICKER MAN\'S FIRE'); } }
      if ((r && r.hitX) || b.t > WM.ballLife || b.vy > 300) return gone();
      return true; });
  };
  /* A BLOW ON IT: whole in its fire; a scratch on the standing wicker (told, once in a while) */
  H.take = (e, dmg) => { const s = init(e), k = wmTake(s); if (k >= 1) return dmg * k;
    H.n.scratches++; ctx.sparks(e); if (!(e.wmSaid > ctx.time())) { e.wmSaid = ctx.time() + 4; ctx.callout('THE WICKER SHRUGS IT OFF: STRIKE ITS FIRE BACK'); }
    return dmg * k; };
  /* ITS FIRE, rolling: a ball of its own burning straw (white-ringed while it is in your reach to strike back) */
  H.drawBalls = (g, cx, cy, time) => {
    for (const b of H.balls) { const x = Math.round(b.x - cx), y = Math.round(b.y - cy) - 5, rot = Math.floor(time * 12) % 4;
      if (b.ripe) { g.globalAlpha = 0.5 + 0.4 * Math.sin(time * 30); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); g.globalAlpha = 1; }
      g.fillStyle = '#1b1626'; g.fillRect(x - 5, y - 4, 10, 8); g.fillRect(x - 4, y - 5, 8, 10);
      g.fillStyle = '#8a5a26'; g.fillRect(x - 4, y - 3, 8, 6); g.fillRect(x - 3, y - 4, 6, 8);
      g.fillStyle = '#d8b050'; for (let i = 0; i < 3; i++) { const a = (rot + i * 1.3) * 1.2; g.fillRect(x + Math.round(Math.cos(a) * 2) - 1, y + Math.round(Math.sin(a) * 2), 3, 1); }
      g.globalCompositeOperation = 'lighter'; const f = 0.5 + 0.5 * Math.sin(time * 20 + b.n); g.fillStyle = 'rgba(255,' + (140 + 70 * f | 0) + ',40,0.7)'; g.fillRect(x - 3, y - 7 - Math.round(2 * f), 6, 4); g.fillRect(x - 1, y - 9 - Math.round(2 * f), 2, 2);
      g.globalCompositeOperation = 'source-over'; }
  };
  H.read = () => ({ ...H.n, balls: H.balls.length });
  return H;
}
