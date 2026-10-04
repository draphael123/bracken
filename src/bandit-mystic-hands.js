// src/bandit-mystic-hands.js - THE BANDIT MYSTICS' HANDS (claude/djinn2). src/bandit-mystic.js is the rules (pure); this binds them to the game: each
// LAMP-BEARER's lamp (it follows his hand, it wards, it drops lit when he dies), THE WARD on a blow (main.js wardedDamage asks H.ward), THE POUR on a
// lamp (a pourable for src/well-town-hands.js), E on a lying lamp (H.take: it is carried - P.carry, src/throwables.js THROW_KIND.lamp - and main.js
// throwCarry throws it on ATTACK), the thrown lamp's flight and its burst (a blow, and a LAMP FIRE on the floor), and the drawing (the warm light, the
// lamp, the ward pips, the fires). The casters are the goblin mage's machine with nothing added here but their first line.
// main.js calls: reset, update, ward, onDeath, take, pourable, drawWorld, read. Every teaching line goes through ctx.number with a line listed in
// src/hint-lines.js.
import { MYSTIC, MYSTIC_SKIN, BEARER_SKIN, newLamp, lampPoint, wardOf, pourLamp, takeLamp, newFire, fireStep, lampWards } from './bandit-mystic.js';
import { THROW_KIND } from './throwables.js';
import { LAMP_AT, drawLamp, drawWardLight, drawWardPip } from './redraw/mystic_art.js';
import { drawPatch } from './redraw/desert_foes2.js';

export function makeMysticHands(ctx) {
  let M = null;
  const H = {};
  const R = Math.round;
  const once = k => { if (M.said[k]) return false; M.said[k] = 1; return true; };
  H.reset = () => { const L = ctx.L; if (!L) { M = null; return; }
    const keep = M && M.L === L ? M.said : {};
    M = { L, said: keep, lamps: [], fires: [], n: { wardHits: 0, doused: 0, dropped: 0, taken: 0, thrown: 0, bursts: 0, fireFoe: 0, fireHero: 0 } };
    if (window.BK) Object.assign(window.BK, { mystics: () => M, mysticHands: () => H }); };
  H.on = () => !!M;
  const bearers = () => ctx.enemies().filter(e => e.alive && e.cnSkin === BEARER_SKIN);
  const groundY = (x, y) => { const ts = ctx.TS; let ty = Math.floor((y - 2) / ts); for (let k = 0; k < 8; k++, ty++) if (ctx.standable(Math.floor(x / ts), ty)) return ty * ts; return null; };
  /* a bearer's lamp, made the first time he is seen (a respawn rebuilds them from the living) */
  const lampOf = e => { let l = M.lamps.find(q => q.bearer === e); if (!l) { l = newLamp(e); M.lamps.push(l); } return l; };

  /* THE WARD: a blow on a foe inside a lit lamp's light lands half (main.js wardedDamage) */
  H.ward = (e, dmg) => { if (!M || !M.lamps.length || !e || e.harmless) return dmg; const l = wardOf(M.lamps, e); if (!l) return dmg;
    M.n.wardHits++; ctx.burst(e.x, e.y - (e.h || 16) / 2, 4, ['#ffd36b', '#fff2c0'], 40, 0.3);
    if (once('wardHit')) ctx.number(e.x, e.y - (e.h || 16) - 18, 'THE LAMP WARDS IT: HALF A BLOW', '#ffd36b');
    return dmg * MYSTIC.wardMul; };
  /* A BEARER DIES: his lamp drops where it hung, still lit (still warding where it lies) */
  H.onDeath = e => { if (!M || e.cnSkin !== BEARER_SKIN) return; const l = M.lamps.find(q => q.bearer === e); if (!l) return;
    l.bearer = null; const gy = groundY(l.x, l.y + 4); l.state = 'rest'; l.y = gy === null ? e.y : gy; M.n.dropped++;
    ctx.burst(l.x, l.y - 6, 6, l.lit ? ['#ffd36b', '#ff9a3c'] : ['#9aa39a'], 40, 0.4); ctx.sfx.clank && ctx.sfx.clank();
    if (once('drop')) ctx.number(l.x, l.y - 30, 'THE LAMP FALLS: E TAKES IT, ATTACK THROWS IT', '#ffd36b'); };
  /* E ON A LYING LAMP: it is yours to carry (and to throw: main.js throwCarry, THROW_KIND.lamp) */
  H.take = P => { if (!M || P.carry || P.dead || !P.ground) return false; const l = takeLamp(M.lamps, P.x, P.y); if (!l) return false;
    l.state = 'carried'; l.holder = P; P.carry = l; M.n.taken++; ctx.sfx.clank && ctx.sfx.clank(); if (once('take')) ctx.number(P.x, P.y - 30, 'ATTACK THROWS THE LAMP', '#ffd36b'); return true; };
  /* THE POUR: the near lit lamp in front of you - held up or lying - goes out */
  H.pourable = {
    aim: P => { if (!M) return null; const l = pourLamp(M.lamps, P.x, P.y, P.face || 1); return l ? { x: l.x, y: l.y - 4 } : null; },
    pour: P => { if (!M) return false; const l = pourLamp(M.lamps, P.x, P.y, P.face || 1); if (!l) return false; l.lit = false; l.doused = true; M.n.doused++;
      ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(l.x, l.y - 6, 12, ['#e8f4f8', '#9aa39a', '#7ab8e8'], 50, 0.7); ctx.number(P.x, P.y - 30, 'THE LAMP GOES OUT: THEIR WARD IS GONE', '#8fd160'); return true; } };

  function burst(l) {
    l.state = 'gone'; M.n.bursts++; ctx.sfx.fireWhoosh ? ctx.sfx.fireWhoosh() : ctx.sfx.hiss && ctx.sfx.hiss(); ctx.sfx.crack && ctx.sfx.crack();
    for (const e of ctx.enemies()) if (e.alive && !e.harmless && Math.abs(e.x - l.x) < MYSTIC.splashR && Math.abs(e.y - (e.h || 16) / 2 - l.y) < MYSTIC.splashR + 8) ctx.hurtFoe(e, MYSTIC.hitDmg, l.x);
    if (l.lit) { const gy = groundY(l.x, l.y); if (gy !== null) { M.fires.push(newFire(l.x, gy)); ctx.burst(l.x, gy - 6, 18, ['#ff8a2a', '#ffd36b', '#c8281e'], 80, 0.7); } }
    else ctx.burst(l.x, l.y - 4, 8, ['#7a5a20', '#c9a44a'], 50, 0.4);
    if (once('burst')) ctx.number(l.x, l.y - 30, l.lit ? 'THE LAMP BURSTS: IT BURNS THEM' : 'THE LAMP BURSTS', '#ff9a5c');
  }
  H.update = dt => {
    if (!M) return;
    for (const e of bearers()) { const l = lampOf(e); if (l.state === 'held') { const p = lampPoint(e, LAMP_AT); l.x = p.x; l.y = p.y; } }
    const P0 = ctx.hero();
    for (const l of M.lamps) {
      if (l.state === 'held' && l.bearer && !l.bearer.alive) H.onDeath(l.bearer);
      if (l.state === 'carried') { const P = l.holder; if (!P || P.dead || P.carry !== l) { if (P && P.carry === l) P.carry = null; if (l.state === 'carried') { l.state = 'rest'; const gy = P ? groundY(P.x, P.y) : null; if (gy !== null) l.y = gy; } continue; }
        l.x = P.x + (P.face || 1) * 7; l.y = P.y - 4;
        if (P.hurt > 0 && !l.hurtWas) { P.carry = null; l.state = 'rest'; l.y = P.y; l.hurtWas = true; ctx.number(P.x, P.y - 30, 'DROPPED', '#ff9a5c'); continue; } l.hurtWas = P.hurt > 0; continue; }
      if (l.state === 'fly') { const k = THROW_KIND.lamp; l.vy += k.g * dt; l.x += l.vx * dt; l.y += l.vy * dt; M.n.thrown += l.counted ? 0 : 1; l.counted = true;
        const hitFoe = ctx.enemies().find(e => e.alive && !e.harmless && Math.abs(e.x - l.x) < (e.w || 10) / 2 + 4 && l.y > e.y - (e.h || 16) - 4 && l.y < e.y + 2);
        const tx = Math.floor(l.x / ctx.TS), ty = Math.floor((l.y + 2) / ctx.TS);
        if (hitFoe || (l.vy >= 0 && ctx.standable(tx, ty)) || ctx.solid(Math.floor((l.x + Math.sign(l.vx || 1) * 4) / ctx.TS), Math.floor(l.y / ctx.TS))) burst(l);
        else if (l.y > ctx.L.H * ctx.TS) l.state = 'gone'; continue; } }
    M.lamps = M.lamps.filter(l => l.state !== 'gone');
    /* THE LAMP FIRES: they burn foes and you; water puts them out (the pour, below) */
    const heroes = ctx.players.filter(pp => !pp.dead), foes = ctx.enemies().filter(e => e.alive && !e.harmless);
    for (const f of M.fires) { const r = fireStep(f, foes, heroes.map(q => ({ x: q.x, y: q.y, w: q.w || 10, pp: q })), dt);
      for (const e of r.foes) { M.n.fireFoe++; ctx.hurtFoe(e, MYSTIC.fire.foe, f.x); }
      for (const q of r.heroes) ctx.asPlayer(q.pp, () => { M.n.fireHero++; ctx.hurtHero(ctx.hero().x, MYSTIC.fire.hero, { unblockable: true, noKnock: true, name: 'THE LAMP FIRE' }); }); }
    M.fires = M.fires.filter(f => !f.out);
    /* THE FIRST SIGHT of each: a casters' line, a bearer's line */
    if (P0) for (const e of ctx.enemies()) { if (!e.alive || Math.abs(e.x - P0.x) > 170 || Math.abs(e.y - P0.y) > 90) continue;
      if (e.cnSkin === BEARER_SKIN && once('bearer')) ctx.number(e.x, e.y - 40, 'HIS LAMP WARDS THEM: POUR ON IT, OR KILL HIM', '#ffd36b');
      else if (e.cnSkin === MYSTIC_SKIN && once('mystic')) ctx.number(e.x, e.y - 40, 'BANDIT MYSTICS: THEY CHANT TO FREE HIM', '#ff9a5c'); }
  };
  /* THE POUR ON A LAMP FIRE too (one more pourable: the near fire in front) */
  H.firePourable = {
    aim: P => { if (!M) return null; const f = M.fires.find(q => !q.out && (q.x - P.x) * (P.face || 1) > -10 && (q.x - P.x) * (P.face || 1) < 56 && Math.abs(q.y - P.y) < 20); return f ? { x: f.x, y: f.y - 5 } : null; },
    pour: P => { if (!M) return false; const f = M.fires.find(q => !q.out && (q.x - P.x) * (P.face || 1) > -10 && (q.x - P.x) * (P.face || 1) < 56 && Math.abs(q.y - P.y) < 20); if (!f) return false; f.out = true;
      ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(f.x, f.y - 6, 10, ['#e8f4f8', '#9aa39a'], 50, 0.6); return true; } };

  /* DRAWING: the warm light under everything that stands in it, the lamp, the pip over each warded foe, the fires */
  H.drawWorld = (g, cx, cy, time) => { if (!M) return; const vw = ctx.VW(), on = x => x > cx - 90 && x < cx + vw + 90;
    for (const l of M.lamps) if (lampWards(l) && on(l.x)) drawWardLight(g, l.x - cx, l.y - cy, MYSTIC.wardR, time);
    for (const f of M.fires) if (on(f.x)) drawPatch(g, f.x - cx, f.y - cy, f.t / f.life, time, MYSTIC.fire.w);
    for (const l of M.lamps) if (on(l.x)) drawLamp(g, l.x - cx, l.y - cy + 9, l.lit, time);
    for (const e of ctx.enemies()) if (e.alive && on(e.x) && wardOf(M.lamps, e)) drawWardPip(g, e.x - cx, e.y - (e.h || 16) - 8 - cy, time);
    /* a lying lamp you could take: a ring round it while you are near */
    const P = ctx.hero(); if (P && !P.carry) for (const l of M.lamps) if (l.state === 'rest' && Math.abs(l.x - P.x) < 48 && Math.abs(l.y - P.y) < 32) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 5); g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.arc(R(l.x - cx), R(l.y - 5 - cy), 9, 0, 7); g.stroke(); g.globalAlpha = 1; } };
  H.read = () => M && { n: { ...M.n }, lamps: M.lamps.map(l => ({ x: R(l.x), y: R(l.y), lit: l.lit, state: l.state })), fires: M.fires.length };
  return H;
}
