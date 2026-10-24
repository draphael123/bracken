// src/potion-hands.js - UNDERLEAF 3: HER JARS (the level's rule) and THE GRANDMOTHER 3 (its boss) - claude/underleaf3, the OPUS GREYBOX, 2026-10-24.
// Brief scratch/brief-underleaf3-1015.md (Daniel's 10-15 interview, all recs). src/underleaf3.js builds the level; this binds it to the game.
// main.js owns the world and calls: reset (spawnEntities), update, interact (INTERACT before a sign), take (every hit on her / a thorn-beast),
// fix (the purse), props (the stuck guide's), drawWorld / drawOver, granStep / drawGran (her AI and read), read / walkHint / bot (tools and bots).
//
// THE RULE: HER JARS CHANGE WHAT THEY BREAK ON. A jar is the carry-throw POT (src/throwables.js THROW_KIND.pot + src/carry-throw.js KINDS.pot -
// the told arc is the arc flown; UP lobs, DOWN tosses it at your feet) with a colour:
//   GREEN  on a SEED BED (L ent 'vinebed') its vine grows - a LADDER (T.NET rungs up the wall) or a BRIDGE (T.ONEWAY across the ditch) - and stays grown
//          for the attempt (a death lays it again). Elsewhere a SNARE of vines roots the foes in it (JAR.snare s).
//   BLUE   a BUBBLE wobbles where it breaks (JAR.hover s). A hero who steps in is LIFTED (JAR.rise px/s, up to a float well's height or JAR.riseMax);
//          JUMP pops it. A foe it meets is lifted off its feet, helpless (JAR.foeFloat s). On THE GRANDMOTHER (brood dead) it is her OPENING.
//   RED    it BURNS where it breaks (main.js fires, the hero's own: foes catch, webs burn): a THORN HEDGE in reach burns away (and stays gone), the
//          THORN-BEAST's coat burns off (until then a blade does x0.4: BURN IT).
// Shelves REFILL (THROW_KIND.pot.respawn). Every jar at rest is highlighted in its colour (A6); the bed, the hedge and the well glint through the shared
// stuck guide (src/stuck-spots.js underleaf), which reads this module's props().
//
// THE GRANDMOTHER 3 (act I: B17 exempt, given depth anyway) - the goblins' old witch-matriarch, bent, hooded, a gnarled staff and a witch-fire lantern.
//   HER BROOD   she SUMMONS a brood of small goblins (GM.brood / GM.brood2 in phase two) that crowd round her; while one stands she is WARDED x GM.ward
//               (a clank and WARDED: never wholly invulnerable, B15). Kill the brood and the ward breaks: blows land whole.
//   THE OPENING a BLUE jar on her with the brood dead lifts her helpless off her feet: OPEN x GM.openMul for GM.float s (the gold ring and bar, B10),
//               the purse GM.purse of her (one opening is never the fight); then a told GM.after s ward (x GM.ward, no bubble holds her: B3).
//   HER MOVES   (each told: a word or mark, its own windup - B5/B16): THE STAFF (staffTell, a shield turns it); THE FIREBALLS (fireballTell: arcing to
//               spots marked on the floor - move off them); A HURLED JAR (jarTell: her own jars on you - GREEN sprouts THORNS where it lands,
//               RED leaves BURNING GROUND; the spot is marked); THE BROOD (broodTell: no blow). PHASE TWO (GM.p2): she STIRS THE CAULDRON - a
//               bigger brood, and the cauldron SPITS FIRE (stirTell: gouts on marked spots across the room) - five told moves in all.
import * as CTW from './carry-throw.js';

export const JAR = { brew: 0.8, burnR: 40, bedR: 30, snare: 1.6, snareR: 28, hover: 2.4, rise: 92, riseMax: 7 * 16, foeFloat: 2.6, foeRise: 34, bubbleR: 13, fireLife: 2.6, hedgeBurn: 0.45, coatR: 34 };
export const GM = { hp: 980, ward: 0.4, openMul: 2, float: 3.2, purse: 0.15, after: 3, p2: 0.55, brood: 3, brood2: 4, broodCd: 11, broodCd2: 9, broodHp: 1,
  walk: 34, walk2: 42, sweepAt: 48, sweepCd: 2.6, sweepTell: 0.55, fireCd: 8, fireCd2: 6.5, fireTell: 0.85, fireN: 2, fireN2: 3, fireR: 20, fireFly: 0.9,
  farAt: 110, farK: 0.9, hurlCd: 7, hurlTell: 0.6, hurlFly: 0.8, patchR: 22, patchLife: 2.8, patchTick: 0.7, stirCd: 8.5, stirTell: 1.0, stirN: 3, broodTell: 1.0, kick: 1.2,
  dmg: { sweep: 22, fire: 20, thorns: 9, burn: 9, gout: 22 } };
export const PO_SAY = {
  take: 'INTERACT TAKES HER JAR. ATTACK THROWS IT. UP LOBS, DOWN AT YOUR FEET.',
  ladder: 'THE VINE GROWS: A LADDER', bridge: 'THE VINE GROWS: A BRIDGE', snare: 'THE VINES HOLD THEM',
  bubble: 'THE BUBBLE LIFTS YOU', floated: 'OFF HIS FEET', burnt: 'THE THORNS BURN AWAY', coat: 'THE COAT BURNS OFF', burnIt: 'BURN IT',
  brood: 'SHE CALLS HER BROOD', bare: 'THE BROOD IS DOWN: A BLUE JAR LIFTS HER', holds: 'THE BROOD HOLDS HER DOWN', open: 'SHE FLOATS: CUT HER',
  stir: 'SHE STIRS THE CAULDRON', spit: 'THE CAULDRON SPITS', thorns: 'THORNS', burning: 'BURNING GROUND',
};
const COL = { green: ['#5fae3a', '#9be06a', '#2e5a1c'], blue: ['#4a8fd8', '#a8d8ff', '#24406a'], red: ['#d8502a', '#ffb070', '#6a2014'] };

export function makePotionHands(ctx) {
  const TS = ctx.TS, T = ctx.T, H = {}, R = Math.round;
  const L = () => ctx.L;
  let S = null;
  H.on = () => !!(L() && L().jars);
  const say = (x, y, k, c) => ctx.number(x, y, PO_SAY[k], c || '#ffd36b');
  const once = k => { if (!S || S.said.has(k)) return false; S.said.add(k); return true; };
  const hero = () => ctx.P();
  const ents = t => (L().ents || []).filter(e => e.t === t);

  /* ---------- RESET (every load and every respawn: what grew and what burnt stays for the attempt) ---------- */
  H.reset = () => {
    const lv = L(); if (!lv || !lv.jars) { S = null; return; }
    const keep = S && S.L === lv ? S : null;
    const jars = [...ents('jarshelf'), ...ents('brewpot')].map(e => ({ t: 'jar', col: e.col, brew: e.t === 'brewpot', hx: e.x * TS + 8, hy: (e.y + 1) * TS, x: e.x * TS + 8, y: (e.y + 1) * TS - (e.t === 'brewpot' ? 12 : 0), state: 'rest', retT: 0, thrKind: 'pot', vx: 0, vy: 0,
      launch: P0 => CTW.launchOf('pot', P0, ctx.keys()) }));
    const beds = ents('vinebed').map((e, i) => { const was = keep && keep.beds[i]; return { t: 'vinebed', i, ...e, x: e.x * TS + 8, y: (e.y + 1) * TS, tx: e.x, ty: e.y, grown: !!(was && was.grown), growT: was && was.grown ? 1 : 0 }; });
    const hedges = ents('thornhedge').map((e, i) => { const was = keep && keep.hedges[i]; return { t: 'thornhedge', i, x0: e.x0, x1: e.x1, y0: e.y0, y1: e.y1, x: e.x0 * TS + 8, y: (e.y1 + 1) * TS, burnt: !!(was && was.burnt), burnT: 0 }; });
    const wells = ents('floatwell').map((e, i) => { const was = keep && keep.wells[i]; return { t: 'floatwell', i, x: e.x * TS + 8, y: (e.y + 1) * TS, h: e.h, used: !!(was && was.used) }; });
    S = { L: lv, jars, beds, hedges, wells, bubbles: [], patches: [], said: keep ? keep.said : new Set(), sec: -1, banner: null, jumpWas: false,
      n: keep ? keep.n : { taken: 0, thrown: 0, breaks: { green: 0, blue: 0, red: 0 }, grown: 0, burnt: 0, lifts: 0, floated: 0, snared: 0, coats: 0 } };
    for (const b of beds) if (b.grown) layVine(b);
    for (const h of hedges) if (h.burnt) clearHedge(h);
    /* the foes the level marks: a thorn-beast's coat, a jar-thrower (greybox: the art lane draws him) */
    for (const d of (lv.ents || [])) { if (!d.thornCoat && !d.herb) continue; const e = ctx.enemies().find(q => q.alive && q.t === d.t && Math.abs(q.x - (d.x * TS + 8)) < 6 && Math.abs(q.y - (d.y + 1) * TS) < 20);
      if (e) { if (d.thornCoat) { e.thornCoat = true; e.coatOff = false; } if (d.herb) e.herb = d.herb; } }
  };

  /* ---------- THE VINE, THE HEDGE ---------- */
  function layVine(b) {
    if (b.grow === 'ladder') { for (let y = b.top; y <= b.ty; y++) ctx.cellSet(b.tx, y, T.NET); }
    else for (let x = b.x0; x <= b.x1; x++) ctx.cellSet(x, b.row, T.ONEWAY);
  }
  function grow(b) { if (b.grown) return; b.grown = true; b.growT = 0; layVine(b); S.n.grown++; ctx.sfx.creak && ctx.sfx.creak(); ctx.sfx.puff && ctx.sfx.puff();
    ctx.burst(b.x, b.y - 6, 14, COL.green, 60, 0.6, -40, 2); say(b.x, b.y - 30, b.grow === 'ladder' ? 'ladder' : 'bridge', '#9be06a'); }
  function clearHedge(h) { for (let y = h.y0; y <= h.y1; y++) for (let x = h.x0; x <= h.x1; x++) if (ctx.tileAt(x, y) === T.PORT) ctx.cellSet(x, y, T.AIR); }
  function burnHedge(h) { if (h.burnt) return; h.burnt = true; clearHedge(h); S.n.burnt++; ctx.sfx.hiss && ctx.sfx.hiss(); ctx.shake(2);
    for (let y = h.y0; y <= h.y1; y++) ctx.burst((h.x0 + h.x1 + 1) * TS / 2, y * TS + 8, 4, ['#ff9a5c', '#ffd36b', '#3a2a1a'], 60, 0.6, -60, 2);
    say(h.x, h.y0 * TS - 10, 'burnt', '#ff9a5c'); }
  const hedgeNear = (x, y, r) => S.hedges.filter(h => !h.burnt && x > h.x0 * TS - r && x < (h.x1 + 1) * TS + r && y > h.y0 * TS - r && y < (h.y1 + 1) * TS + r);
  function burnCoat(e) { if (!e.thornCoat || e.coatOff) return; e.coatOff = true; e.stagger = Math.max(e.stagger || 0, 1.0); S.n.coats++; ctx.sfx.hiss && ctx.sfx.hiss();
    ctx.burst(e.x, e.y - 10, 16, ['#ff9a5c', '#5a4a2a', '#ffd36b'], 70, 0.6, -40, 2); ctx.word(e.x, e.y - (e.h || 14) - 12, PO_SAY.coat, '#ff9a5c'); }

  /* ---------- A JAR BREAKS ---------- */
  function breakJar(j, x, y, hit) {
    const c = j.col; S.n.breaks[c] = (S.n.breaks[c] || 0) + 1;
    ctx.sfx.crack(); ctx.burst(x, y - 3, 10, COL[c], 70, 0.5, 400, 2);
    j.state = 'return'; j.retT = j.brew ? JAR.brew : ctx.respawn('pot');
    if (c === 'green') {
      const b = S.beds.filter(q => !q.grown && Math.abs(q.x - x) < JAR.bedR && Math.abs(q.y - y) < 26).sort((a2, b2) => Math.abs(a2.x - x) - Math.abs(b2.x - x))[0];
      if (b) { grow(b); return; }
      S.patches.push({ col: 'green', kind: 'snare', x, y, t: 0, life: JAR.snare });
      let n = 0; for (const e of ctx.enemies()) if (e.alive && !e.harmless && !e.maxHp && Math.hypot(e.x - x, e.y - y) < JAR.snareR) { e.stagger = Math.max(e.stagger || 0, JAR.snare); e.vx = 0; n++; }
      if (n) { S.n.snared += n; if (once('snare')) say(x, y - 30, 'snare', '#9be06a'); }
      return;
    }
    if (c === 'red') {
      for (const dx of [-12, 0, 12]) ctx.fire(x + dx, y, JAR.fireLife);
      S.patches.push({ col: 'red', kind: 'fire', x, y, t: 0, life: JAR.fireLife });
      for (const h of hedgeNear(x, y, JAR.burnR)) h.burnT = Math.max(h.burnT, JAR.hedgeBurn);
      for (const e of ctx.enemies()) if (e.alive && e.thornCoat && Math.hypot(e.x - x, e.y - y) < JAR.coatR) burnCoat(e);
      return;
    }
    /* blue: a bubble where it broke - or round what it hit */
    const bb = { x, y: y - 10, y0: y, t: 0, state: 'hover', rider: null, life: JAR.hover };
    S.bubbles.push(bb);
    if (hit) board(bb, hit);
  }
  /* WHO A BUBBLE TAKES: the hero rides it up; a foe is lifted off its feet; SHE floats only bare (her brood dead, no ward) */
  function board(bb, who) {
    if (who === 'P') { const P = hero(); bb.rider = 'P'; bb.state = 'rise'; bb.t = 0; bb.y0 = P.y;
      const w = S.wells.find(q => Math.abs(q.x - P.x) < 2.5 * TS && Math.abs(q.y - P.y) < 2 * TS); bb.max = w ? w.h * TS + 10 : JAR.riseMax; if (w && !w.used) w.used = true;
      S.n.lifts++; ctx.sfx.puff && ctx.sfx.puff(); if (once('bubble')) say(P.x, P.y - 36, 'bubble', '#a8d8ff'); return; }
    const e = who; if (!e.alive) return;
    if (e.t === 'grandmother') { bb.state = 'pop'; bb.t = 0; granBlue(e); return; }
    if (e.maxHp) { bb.state = 'pop'; bb.t = 0; return; }   /* a boss-sized thing is no foe to lift */
    bb.rider = e; bb.state = 'rise'; bb.t = 0; bb.y0 = e.y; e.floatT = JAR.foeFloat; S.n.floated++;
    if (once('floated')) ctx.word(e.x, e.y - (e.h || 14) - 12, PO_SAY.floated, '#a8d8ff');
  }
  function stepJar(j, dt) {
    CTW.stepArc(j, dt, CTW.KINDS.pot.g);
    for (const e of ctx.enemies()) { if (!e.alive || e.harmless) continue;
      if (ctx.overlap({ l: j.x - 4, r: j.x + 4, t: j.y - 6, b: j.y + 3 }, ctx.box(e))) { if (!(e.boss || e.maxHp) && j.col !== 'blue') ctx.hurt(e, 1, j.x); breakJar(j, j.x, j.y, e); return; } }
    const tx = Math.floor(j.x / TS), ty = Math.floor((j.y + 2) / TS);
    if (j.vy >= 0 && (ctx.isSolid(tx, ty) || ctx.oneWay(tx, ty))) { breakJar(j, j.x, ty * TS); return; }
    if (ctx.isSolid(Math.floor((j.x + Math.sign(j.vx || 1) * 4) / TS), Math.floor(j.y / TS))) { breakJar(j, j.x, j.y); return; }
    if (j.y > ctx.LH() * TS || j.x < 0 || j.x > ctx.LW() * TS) { j.state = 'return'; j.retT = 0.5; }
  }
  /* THE TOLD ARC of the jar in your hand (the same stepper: the arc you are shown is the arc it flies) */
  H.jarArc = j => { const P = hero(), v = CTW.launchOf('pot', P, ctx.keys());
    const solid = (px, py, falling) => { const tx = Math.floor(px / TS), ty = Math.floor(py / TS); return ctx.isSolid(tx, ty) || (falling && ctx.oneWay(tx, ty)); };
    const stop = (px, py) => ctx.enemies().find(e => e.alive && !e.harmless && ctx.overlap({ l: px - 4, r: px + 4, t: py - 6, b: py + 3 }, ctx.box(e))) || null;
    return CTW.predictArc('pot', j.x, j.y, v, solid, { stopAt: stop }); };
  /* INTERACT: the nearest jar at rest in reach is yours (main.js asks first, before a sign or a door) */
  H.interact = P => { if (!H.on() || !S || !P || P.carry || P.dead || !P.ground) return false;
    const j = S.jars.filter(q => q.state === 'rest' && Math.abs(q.x - P.x) < 18 && Math.abs(q.y - P.y) < 14).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (!j) return false; P.carry = j; j.state = 'held'; j.hurtWas = false; ctx.sfx.clank(); S.n.taken++;
    if (!(ctx.PROG().jarTold > 1)) { ctx.PROG().jarTold = (ctx.PROG().jarTold || 0) + 1; ctx.hint(PO_SAY.take, 5); } return true; };

  function updateJars(dt) {
    const P = hero();
    for (const j of S.jars) {
      if (j.state === 'return') { if (j.brew && (j.retT -= dt) <= 0) { j.state = 'rest'; j.x = j.hx; j.y = j.hy - 12; j.vx = j.vy = 0; continue; } if ((j.retT -= dt) <= 0) { j.state = 'rest'; j.x = j.hx; j.y = j.hy; j.vx = j.vy = 0; ctx.burst(j.x, j.y - 6, 4, COL[j.col], 20, 0.3); } continue; }
      if (j.state === 'held') {
        if (P.carry !== j || P.dead) { j.state = 'return'; j.retT = j.brew ? JAR.brew : ctx.respawn('pot'); if (P.carry === j) P.carry = null; continue; }
        j.x = P.x + P.face * 7; j.y = P.y - 3;
        if (P.hurt > 0 && !j.hurtWas) { P.carry = null; j.hurtWas = true; breakJar(j, P.x, P.y); continue; }   /* a blow drops it: it breaks at your feet */
        j.hurtWas = P.hurt > 0; continue; }
      if (j.state === 'fly') { if (!j.counted) { j.counted = true; S.n.thrown++; } stepJar(j, dt); if (j.state !== 'fly') j.counted = false; }
    }
  }
  function updateBubbles(dt) {
    const P = hero(), jump = !!ctx.keys().jump, press = jump && !S.jumpWas; S.jumpWas = jump;
    for (const bb of S.bubbles) { bb.t += dt;
      if (bb.state === 'pop') { bb.done = bb.t > 0.25; continue; }
      if (bb.state === 'hover') { bb.y -= 6 * dt;
        if (!P.dead && Math.hypot(P.x - bb.x, (P.y - 10) - bb.y) < JAR.bubbleR + 7) { board(bb, 'P'); continue; }
        const e = ctx.enemies().find(q => q.alive && !q.harmless && Math.hypot(q.x - bb.x, (q.y - (q.h || 14) / 2) - bb.y) < JAR.bubbleR + 6);
        if (e) { board(bb, e); continue; }
        if (bb.t > bb.life) { bb.state = 'pop'; bb.t = 0; ctx.sfx.puff && ctx.sfx.puff(); } continue; }
      /* rising */
      if (bb.rider === 'P') {
        const risen = bb.y0 - P.y, stuck = Math.abs((bb.lastY ?? P.y + 9) - P.y) < 0.05 && bb.t > 0.2;
        if (P.dead || risen >= bb.max || press || stuck || bb.t > 4) { bb.state = 'pop'; bb.t = 0; ctx.sfx.puff && ctx.sfx.puff(); if (press && !P.dead) P.vy = Math.min(P.vy, -180); continue; }
        P.vy = -JAR.rise; P.ground = false; P.plunge = false; bb.x = P.x; bb.y = P.y - 10; bb.lastY = P.y; continue; }
      const e = bb.rider; if (!e || !e.alive) { bb.state = 'pop'; bb.t = 0; continue; }
      if (e.t === 'grandmother') { bb.x = e.x; bb.y = e.y - 22; if (e.mode !== 'floated') { bb.state = 'pop'; bb.t = 0; } continue; }
      e.floatT -= dt; const lift = Math.min(JAR.foeRise, bb.t * 60); e.y = bb.y0 - lift; e.vy = 0; e.vx = 0; e.stagger = Math.max(e.stagger || 0, 0.15); bb.x = e.x; bb.y = e.y - 10;
      if (e.floatT <= 0) { bb.state = 'pop'; bb.t = 0; ctx.sfx.puff && ctx.sfx.puff(); e.stagger = Math.max(e.stagger || 0, 0.5); }
    }
    S.bubbles = S.bubbles.filter(b => !b.done);
  }
  function updateHedges(dt) {
    for (const h of S.hedges) { if (h.burnt) continue;
      if (ctx.fireNear((h.x0 + h.x1 + 1) * TS / 2, (h.y1 + 1) * TS, (h.x1 - h.x0 + 1) * TS / 2 + 14)) h.burnT = Math.max(h.burnT, 0.05) + dt;   /* any fire of yours at its foot (a pyro's too) */
      if (h.burnT > 0) { h.burnT += dt; if (Math.random() < dt * 30) ctx.part({ x: h.x0 * TS + Math.random() * (h.x1 - h.x0 + 1) * TS, y: h.y0 * TS + Math.random() * (h.y1 - h.y0 + 1) * TS, vx: 0, vy: -40, life: 0.4, max: 0.4, col: Math.random() < 0.5 ? '#ff9a5c' : '#ffd36b', size: 2, grav: -40 });
        if (h.burnT > JAR.hedgeBurn + 0.45) burnHedge(h); } }
    for (const e of ctx.enemies()) if (e.alive && e.thornCoat && !e.coatOff && (e.burn > 0 || ctx.fireNear(e.x, e.y, 12))) burnCoat(e);
    for (const p of S.patches) p.t += dt; S.patches = S.patches.filter(p => p.t < p.life);
    for (const b of S.beds) if (b.grown && b.growT < 1) b.growT = Math.min(1, b.growT + dt * 2);
  }
  /* THE NAMED AREAS: a banner as you come into one */
  function updateBanner(dt) { const P = hero(), lv = L(); if (!P || !lv.sections) return;
    const k = lv.sections.findIndex(s => P.x >= s.x0 * TS && P.x < s.x1 * TS); if (k >= 0 && k !== S.sec) { if (S.sec >= 0 || k === 0) S.banner = { name: lv.sections[k].name, t: 3.4 }; S.sec = k; }
    if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; } }

  H.update = dt => { if (!S || !H.on()) return; updateJars(dt); updateBubbles(dt); updateHedges(dt); updateBanner(dt); updateGranWorld(dt); };

  /* ---------- A HIT ON A THORN-BEAST OR ON HER (main.js hurtEnemy): the multiplier's result, or 0 ---------- */
  const purseOf = e => (e.purseLeft === undefined ? (e.purseLeft = Math.max(1, Math.round(e.maxHp * GM.purse))) : e.purseLeft);
  H.take = (e, dmg, fromX, blow) => {
    if (e.thornCoat && !e.coatOff) { ctx.turned(e, fromX, PO_SAY.burnIt, { stop: false }); return Math.max(1, Math.round(dmg * GM.ward)); }
    if (e.t !== 'grandmother' || !e.gm3) return dmg;
    if (e.mode === 'sleep' || e.mode === 'wake') return dmg;
    e.pursed = false;
    if (e.mode === 'floated') { const d = Math.round(dmg * GM.openMul), left = purseOf(e); e.pursed = true;
      if (d < left) { e.purseLeft -= d; return d; } e.purseLeft = 0; e.modeT = Math.min(e.modeT, 0.05); return Math.max(1, left); }   /* the purse emptied: she drops (her ward) */
    if (broodUp(e) || e.ward > 0) { ctx.turned(e, fromX, 'WARDED', { stop: false }); S && S.n && (S.n.warded = (S.n.warded || 0) + 1); return Math.max(1, Math.round(dmg * GM.ward)); }
    return dmg;
  };
  /* A BLOW THAT GREW AFTER IT WAS COUNTED: the purse pays only what it has left (src/boss-greed.js, claude/capsfix) */
  H.fix = (e, d0, d1) => { if (!e.pursed || e.purseLeft === undefined) return d1; const extra = Math.min(d1 - d0, Math.max(0, e.purseLeft)); e.purseLeft -= extra; if (e.purseLeft <= 0.5) { e.purseLeft = 0; e.modeT = Math.min(e.modeT, 0.05); } return d0 + extra; };

  /* ================= THE GRANDMOTHER 3 ================= */
  const brood = e => ctx.enemies().filter(q => q.alive && q.broodOf === e);
  const broodUp = e => brood(e).length > 0;
  H.granOpen = e => e.mode === 'floated';
  H.granWarded = e => !!e.gm3 && e.mode !== 'floated' && e.mode !== 'sleep' && (broodUp(e) || e.ward > 0);
  let marks = [], balls = [], pots = [], gpatches = [];
  function granInit(e) { e.gm3 = true; const k = ctx.baseHp && ctx.baseHp() > 0 && e.maxHp > 0 ? e.maxHp / ctx.baseHp() : 1; e.hp = e.maxHp = Math.round(GM.hp * k);   /* (the difficulty's and the tier's scaling of her spawn kept) */ e.phase = 1; e.ward = 0; e.broodT = 0.6; e.fireT = 3.2; e.hurlT = 5; e.sweepT = 1.5; e.stirT = 3; e.called = 0; marks = []; balls = []; pots = []; gpatches = []; }
  const A = () => L().arena;
  const clampX = x => Math.max(A().x0 + 18, Math.min(A().x1 - 18, x));
  function callBrood(e) {
    const n = (e.phase >= 2 ? GM.brood2 : GM.brood) - brood(e).length; if (n <= 0) return;
    const row = Math.round(A().floor / TS) - 1;
    for (let i = 0; i < n; i++) { const side = i % 2 ? 1 : -1, x = clampX(e.x + side * (26 + 14 * Math.floor(i / 2)));
      const made = ctx.spawn({ t: 'sprig', x: Math.floor(x / TS), y: row, face: -side }); for (const q of made) { q.broodOf = e; q.hp = Math.max(1, Math.round(q.hp * GM.broodHp)); q.woke = 1; q.sleeper = false; }
      ctx.burst(x, A().floor - 6, 8, ['#5a4a2a', '#8a7a4a', '#c9b27c'], 50, 0.5); }
    e.called++; ctx.sfx.whistleCall ? ctx.sfx.whistleCall() : ctx.sfx.charge(); say(e.x, e.y - e.h - 18, 'brood', '#c9b27c');
  }
  function granBlue(e) {
    if (e.mode === 'sleep' || e.mode === 'wake') return;
    if (broodUp(e)) { ctx.turned(e, hero().x, PO_SAY.holds, { stop: false }); return; }
    if (e.ward > 0 || e.mode === 'floated') { ctx.turned(e, hero().x, 'WARDED', { stop: false }); return; }
    e.mode = 'floated'; e.modeT = GM.float; e.floatLen = GM.float; e.vx = 0; e.vy = 0; e.floatY0 = e.y; e.purseLeft = undefined; e.pursed = false; S.n.opens = (S.n.opens || 0) + 1;
    marks = marks.filter(m => m.kind !== 'pot'); ctx.sfx.puff && ctx.sfx.puff(); ctx.ring(e.x, e.y - 20, 26, '#a8d8ff', 0.5);
    S.bubbles.push({ x: e.x, y: e.y - 22, y0: e.y, t: 0, state: 'rise', rider: e, life: GM.float + 1 });
    say(e.x, e.y - e.h - 24, 'open', '#8fd160');
  }
  function granWard(e) { e.ward = GM.after; e.mode = 'walk'; e.modeT = 0.5; e.purseLeft = undefined; e.pursed = false; e.stagger = 0;
    ctx.word(e.x, e.y - e.h - 18, 'WARDED', '#dfe8ff'); ctx.sfx.aegis ? ctx.sfx.aegis() : ctx.sfx.clank(); ctx.ring(e.x, e.y - 20, 22, '#dfe8ff', 0.35); }
  const mark = (x, kind, t, r) => { const m = { x, y: A().floor, kind, t: 0, life: t, r: r || GM.fireR }; marks.push(m); return m; };
  H.granStep = (e, dt) => {
    if (!S) return;
    if (!e.gm3) granInit(e);
    const P = hero(), d = P.x - e.x, ad = Math.abs(d), ph = e.phase;
    e.modeT -= dt; e.anim = (e.anim || 0) + dt; e.ward = Math.max(0, (e.ward || 0) - dt);
    e.sweepT -= dt; e.fireT -= dt; e.hurlT -= dt; e.stirT -= dt;
    if (ad > GM.farAt && e.mode !== 'floated') { e.fireT -= dt * GM.farK; e.hurlT -= dt * GM.farK * 0.6; }   /* a hero who keeps his distance gets her lantern sooner: she does not walk to you, she casts at you */ if (!broodUp(e)) e.broodT -= dt;
    if (e.mode !== 'floated') { e.vy = Math.min(300, (e.vy || 0) + 1000 * dt); }
    if (e.wasBrood && !broodUp(e) && e.mode !== 'sleep') { e.wasBrood = false; e.broodT = ph >= 2 ? GM.broodCd2 : GM.broodCd; say(e.x, e.y - e.h - 18, 'bare', '#8fd160'); }
    if (broodUp(e)) e.wasBrood = true;
    if ((e.burn || 0) > 0 && (broodUp(e) || e.ward > 0)) { e.burn = 0; ctx.sfx.hiss && ctx.sfx.hiss(); if (once('smother')) ctx.word(e.x, e.y - e.h - 12, 'WARDED', '#dfe8ff'); }   /* HER WARD SMOTHERS A FIRE too (B3): a burn bites her only bare */
    let want = 0;
    if (ph === 1 && e.hp <= e.maxHp * GM.p2 && e.mode === 'walk') { e.phase = 2; e.mode = 'kick'; e.modeT = GM.kick; e.vx = 0; ctx.sfx.roar && ctx.sfx.roar(); ctx.shake(5); say(e.x, e.y - e.h - 24, 'stir', '#ff9a5c'); e.broodT = 0.4; e.stirT = 2.5; }
    switch (e.mode) {
      case 'sleep': return;
      case 'wake': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.6; } break;
      case 'walk': {
        e.face = Math.sign(d) || e.face;
        const keep = ph >= 2 ? 70 : 84;   /* she keeps a staff's length and a little more: she casts, she does not chase */
        want = ad > keep ? e.face * (ph >= 2 ? GM.walk2 : GM.walk) : ad < 34 ? -e.face * 20 : 0;
        if (e.modeT > 0) break;
        if (e.broodT <= 0 && !broodUp(e)) { e.mode = 'broodTell'; e.modeT = GM.broodTell; e.vx = 0; ctx.number(e.x, e.y - e.h - 14, '', '#c9b27c'); }
        else if (ad < GM.sweepAt && Math.abs(P.y - e.y) < 26 && e.sweepT <= 0) { e.sweepT = GM.sweepCd - (ph - 1) * 0.4; e.mode = 'staffTell'; e.modeT = GM.sweepTell; ctx.number(e.x, e.y - e.h - 14, '!', '#ffd36b'); ctx.sfx.snort && ctx.sfx.snort(); }
        else if (ph >= 2 && e.stirT <= 0) { e.stirT = GM.stirCd; e.mode = 'stirTell'; e.modeT = GM.stirTell; ctx.number(e.x, e.y - e.h - 16, '!!', '#ff6b6b'); ctx.sfx.charge();
          const sp = (A().x1 - A().x0) / (GM.stirN * 2), off = (e.called % 2) * sp; for (let i = 0; i < GM.stirN; i++) mark(A().x0 + off + sp * (2 * i + 0.5), 'gout', GM.stirTell + 0.7, 22); }
        else if (e.fireT <= 0) { e.fireT = ph >= 2 ? GM.fireCd2 : GM.fireCd; e.mode = 'fireballTell'; e.modeT = GM.fireTell; ctx.number(e.x, e.y - e.h - 16, '!!', '#ff6b6b'); ctx.sfx.charge();
          const n = ph >= 2 ? GM.fireN2 : GM.fireN; e.fireAt = []; for (let i = 0; i < n; i++) { const x = clampX(P.x + (i - (n - 1) / 2) * 60); e.fireAt.push(x); mark(x, 'fire', GM.fireTell + GM.fireFly + 0.1); } }
        else if (e.hurlT <= 0) { e.hurlT = GM.hurlCd - (ph - 1) * 0.8; e.mode = 'jarTell'; e.modeT = GM.hurlTell; e.hurlCol = (e.hurls = (e.hurls || 0) + 1) % 2 ? 'green' : 'red'; ctx.number(e.x, e.y - e.h - 16, '!!', '#ff6b6b'); ctx.sfx.snort && ctx.sfx.snort();
          e.hurlX = clampX(P.x); mark(e.hurlX, 'pot', GM.hurlTell + GM.hurlFly + 0.1, GM.patchR).col = e.hurlCol; }
        break; }
      case 'broodTell': want = 0; if (e.modeT <= 0) { callBrood(e); e.mode = 'walk'; e.modeT = 0.8; } break;
      case 'staffTell': want = 0; e.face = Math.sign(d) || e.face;
        if (e.modeT <= 0) { e.mode = 'staff'; e.modeT = 0.32; ctx.sfx.slash && ctx.sfx.slash(); ctx.shake(3); e.vx = e.face * 60;
          if (!P.dead && Math.sign(d) === e.face && ad < GM.sweepAt + 8 && Math.abs(P.y - e.y) < 26) { const res = ctx.damage(e.x, GM.dmg.sweep, { who: e, blow: 'THE STAFF' }); if (res === 'hit') { P.vx = e.face * 220; P.vy = -140; } else if (res === 'blocked') { e.stagger = Math.max(e.stagger || 0, 0.45); P.vx = e.face * 110; } } } break;
      case 'staff': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; } break;
      case 'fireballTell': want = 0; e.face = Math.sign(d) || e.face;
        if (Math.random() < dt * 40) ctx.part({ x: e.x + e.face * 12 + (Math.random() - 0.5) * 8, y: e.y - 46 + (Math.random() - 0.5) * 8, vx: 0, vy: -20, life: 0.35, max: 0.35, col: Math.random() < 0.5 ? '#ffb347' : '#fff1a0', size: 1, grav: -30 });
        if (e.modeT <= 0) { e.mode = 'cast'; e.modeT = 0.5; ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh();
          for (const tx of (e.fireAt || [])) { const sx = e.x + e.face * 12, sy = e.y - 46, t = GM.fireFly, g = 600; balls.push({ x: sx, y: sy, vx: (tx - sx) / t, vy: (A().floor - 4 - sy) / t - 0.5 * g * t, g, tx, life: t + 0.4, who: e }); } } break;
      case 'cast': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; } break;
      case 'jarTell': want = 0; e.face = Math.sign((e.hurlX ?? P.x) - e.x) || e.face;
        if (e.modeT <= 0) { e.mode = 'hurled'; e.modeT = 0.45; ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh();
          const sx = e.x + e.face * 10, sy = e.y - 30, t = GM.hurlFly, g = 600; pots.push({ x: sx, y: sy, vx: (e.hurlX - sx) / t, vy: (A().floor - 4 - sy) / t - 0.5 * g * t, g, col: e.hurlCol, life: t + 0.4, who: e }); } break;
      case 'hurled': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; } break;
      case 'stirTell': want = 0; if (e.modeT <= 0) { e.mode = 'stir'; e.modeT = 0.6; say(e.x, e.y - e.h - 22, 'spit', '#ff9a5c'); ctx.sfx.boom && ctx.sfx.boom();
          const cx0 = cauldronX(); for (const m of marks.filter(q => q.kind === 'gout')) { const sy = A().floor - 40, t = 0.6, g = 600; balls.push({ x: cx0, y: sy, vx: (m.x - cx0) / t, vy: (A().floor - 4 - sy) / t - 0.5 * g * t, g, tx: m.x, life: t + 0.4, who: e, gout: true }); } } break;
      case 'stir': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.4; } break;
      case 'kick': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.3; } break;
      case 'floated': { want = 0; e.vx = 0; e.vy = 0; e.burn = 0;   /* the bubble keeps the fire off her: the opening is the purse, no more */
        const k = Math.min(1, (e.floatLen - e.modeT) * 3); e.y = e.floatY0 - 8 * k; e.stagger = 0;   /* STAGGER MEANS STILL (B4): she hangs where she was lifted */
        if (e.modeT <= 0) { e.y = e.floatY0; granWard(e); ctx.shake(3); ctx.dust && ctx.dust(e.x, e.y, 8); } return; }
    }
    if (e.stagger > 0) { want = 0; e.stagger -= dt; }
    e.vx += (want - e.vx) * Math.min(1, dt * 5);
    const r = ctx.moveBody(e, e.vx * dt, e.vy * dt); if (r && r.ground) e.vy = 0;
    e.x = clampX(e.x);
  };
  const cauldronX = () => (A().x0 + A().x1) / 2;
  /* her projectiles and her patches, every frame (with the world, so a death clears them) */
  function updateGranWorld(dt) {
    const e = ctx.boss(), on = e && e.t === 'grandmother' && e.alive && e.gm3 && ctx.bossActive();
    if (!on) { if (marks.length || balls.length || pots.length || gpatches.length) { marks = []; balls = []; pots = []; gpatches = []; } return; }
    const P = hero(), floor = A().floor;
    for (const m of marks) m.t += dt; marks = marks.filter(m => m.t < m.life);
    for (const b of balls) { b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (Math.random() < dt * 40) ctx.part({ x: b.x + (Math.random() - 0.5) * 6, y: b.y + (Math.random() - 0.5) * 6, vx: -b.vx * 0.2, vy: -20, life: 0.3, max: 0.3, col: Math.random() < 0.5 ? '#ff9a5c' : '#ffd36b', size: 2, grav: -40 });
      if (b.y >= floor - 4 || b.life <= 0) { b.dead = true; ctx.burst(b.x, floor - 4, 18, ['#ff6b2c', '#ff9a5c', '#ffd36b'], 110, 0.5, 200, 2); ctx.ring(b.x, floor - 4, GM.fireR + 4, '#ff9a5c', 0.35); ctx.shake(3); ctx.sfx.boom && ctx.sfx.boom();
        if (!P.dead && Math.abs(P.x - b.x) < GM.fireR + 4 && P.y > floor - 40) ctx.damage(b.x, b.gout ? GM.dmg.gout : GM.dmg.fire, { who: b.who, unblockable: true, blow: b.gout ? 'THE CAULDRON' : 'THE FIREBALL' }); } }
    balls = balls.filter(b => !b.dead);
    for (const p of pots) { p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.y >= floor - 4 || p.life <= 0) { p.dead = true; ctx.sfx.crack(); ctx.burst(p.x, floor - 4, 12, COL[p.col], 80, 0.5, 300, 2);
        gpatches.push({ x: p.x, col: p.col, t: 0, life: GM.patchLife, tick: 0.15 }); if (once('gp:' + p.col)) say(p.x, floor - 40, p.col === 'green' ? 'thorns' : 'burning', p.col === 'green' ? '#9be06a' : '#ff9a5c'); } }
    pots = pots.filter(p => !p.dead);
    for (const q of gpatches) { q.t += dt; q.tick -= dt;
      if (q.tick <= 0 && !P.dead && P.ground && Math.abs(P.x - q.x) < GM.patchR && Math.abs(P.y - floor) < 6) { q.tick = GM.patchTick; ctx.damage(q.x, q.col === 'green' ? GM.dmg.thorns : GM.dmg.burn, { who: e, unblockable: true, noStagger: true, blow: q.col === 'green' ? 'HER THORNS' : 'BURNING GROUND' }); } }
    gpatches = gpatches.filter(q => q.t < q.life);
  }

  /* ---------- WHAT THE GUIDE MAY GLINT (src/stuck-spots.js underleaf names them by type and tile) ---------- */
  H.props = () => (S ? [...S.beds, ...S.hedges, ...S.wells] : []);

  /* ---------- DRAWING ---------- */
  function drawJarShape(g, x, y, col) { const c = COL[col];
    g.fillStyle = c[2]; g.fillRect(x - 4, y - 8, 9, 8); g.fillStyle = c[0]; g.fillRect(x - 3, y - 7, 7, 6); g.fillStyle = c[1]; g.fillRect(x - 2, y - 6, 2, 3);
    g.fillStyle = '#5a3a1e'; g.fillRect(x - 2, y - 11, 5, 3); g.fillStyle = '#c9b27c'; g.fillRect(x - 1, y - 12, 3, 1); }
  function drawShelf(g, j, cx, cy, time) { const x = R(j.hx - cx), y = R(j.hy - cy);
    if (j.brew) { const c = COL[j.col]; g.fillStyle = '#1e1a14'; g.fillRect(x - 10, y - 12, 21, 12); g.fillStyle = '#2e2a22'; g.fillRect(x - 11, y - 13, 23, 3); g.fillStyle = c[0]; g.globalAlpha = 0.7 + 0.2 * Math.sin(time * 3 + x); g.fillRect(x - 9, y - 13, 19, 2); g.globalAlpha = 1;
      for (let k = 0; k < 2; k++) { const ph = (time * 0.9 + k / 2 + j.hx * 0.01) % 1; g.globalAlpha = 0.5 * (1 - ph); g.fillStyle = c[1]; g.fillRect(x - 4 + k * 7, y - 15 - R(ph * 14), 2, 2); } g.globalAlpha = 1;
      g.fillStyle = Math.floor(time * 9) % 2 ? '#ff9a5c' : '#ffd36b'; g.fillRect(x - 5, y - 2, 3, 2); g.fillRect(x + 3, y - 2, 3, 2); return; }
    g.fillStyle = '#4a3420'; g.fillRect(x - 7, y - 1, 15, 2); g.fillRect(x - 6, y + 1, 2, 3); g.fillRect(x + 5, y + 1, 2, 3); }
  function drawJar(g, j, cx, cy, time) {
    const x = R(j.x - cx), y = R(j.y - cy);
    if (j.state === 'rest') { g.save(); g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 4 + j.hx); g.fillStyle = COL[j.col][1]; g.fillRect(x - 5, y - 10, 11, 11); g.fillRect(x - 3, y - 13, 7, 3); g.restore(); }
    drawJarShape(g, x, y, j.col);
    const P = hero();
    if (j.state === 'rest' && !P.carry && Math.abs(j.x - P.x) < 48 && Math.abs(j.y - P.y) < 32) { g.globalAlpha = 0.3 + 0.2 * Math.sin(time * 5 + j.hx); g.strokeStyle = COL[j.col][1]; g.beginPath(); g.arc(x, y - 5, 10, 0, 7); g.stroke(); g.globalAlpha = 1; }
  }
  function drawBed(g, b, cx, cy, time) {
    const x = R(b.x - cx), y = R(b.y - cy);
    g.fillStyle = '#3a2a18'; g.fillRect(x - 7, y - 3, 15, 3); g.fillStyle = '#5a4026'; g.fillRect(x - 6, y - 4, 13, 1);
    if (!b.grown) { const s = Math.sin(time * 3 + b.x) * 0.5; g.fillStyle = '#6aa83a'; g.fillRect(x, y - 8, 1, 5); g.fillRect(x - 2 + R(s), y - 7, 2, 1); g.fillRect(x + 1, y - 6, 2, 1);
      g.globalAlpha = 0.25 + 0.15 * Math.sin(time * 4 + b.x); g.strokeStyle = '#9be06a'; g.beginPath(); g.ellipse(x, y - 2, 10, 3, 0, 0, 7); g.stroke(); g.globalAlpha = 1; return; }
    const k = b.growT;
    g.fillStyle = '#3e7a26';
    if (b.grow === 'ladder') { const top = R(b.top * TS - cy), bot = y, h = R((bot - top) * k);
      g.fillRect(x - 5, bot - h, 2, h); g.fillRect(x + 4, bot - h, 2, h); g.fillStyle = '#5fae3a'; for (let yy = bot - 4; yy > bot - h; yy -= TS / 2) { g.fillRect(x - 4, yy, 9, 1); g.fillRect(x + (yy % 32 ? 4 : -7), yy - 2, 3, 2); } }
    else { const bx0 = R(b.x0 * TS - cx), by = R(b.row * TS - cy), w = R((b.x1 - b.x0 + 1) * TS * k);
      g.fillRect(bx0, by, w, 3); g.fillStyle = '#5fae3a'; for (let xx = bx0 + 3; xx < bx0 + w; xx += 6) { g.fillRect(xx, by - 2, 3, 2); g.fillRect(xx + 2, by + 3, 1, 3); } }
  }
  function drawHedge(g, h, cx, cy, time) { if (h.burnt) return;
    const x0 = R(h.x0 * TS - cx), y0 = R(h.y0 * TS - cy), w = (h.x1 - h.x0 + 1) * TS, hh = (h.y1 - h.y0 + 1) * TS;
    g.fillStyle = '#2a3a1a'; g.fillRect(x0, y0, w, hh); g.fillStyle = '#3e5422'; for (let yy = 0; yy < hh; yy += 6) for (let xx = (yy / 6) % 2 ? 3 : 0; xx < w; xx += 7) g.fillRect(x0 + xx, y0 + yy, 4, 3);
    g.fillStyle = '#c9b27c'; for (let yy = 2; yy < hh; yy += 5) { g.fillRect(x0 - 2, y0 + yy, 2, 1); g.fillRect(x0 + w, y0 + yy + 2, 2, 1); }   /* the thorns */
    g.fillStyle = '#5a2a14'; g.fillRect(x0 + 2, y0 - 2, w - 4, 2);
    if (h.burnT > 0) { g.fillStyle = Math.floor(time * 14) % 2 ? '#ff9a5c' : '#ffd36b'; for (let k = 0; k < 5; k++) g.fillRect(x0 + (k * 7) % w, y0 + hh - 6 - ((k * 11 + R(time * 40)) % hh), 3, 4); } }
  function drawWell(g, w, cx, cy, time) { const x = R(w.x - cx), y = R(w.y - cy);
    g.fillStyle = '#2e4a3a'; g.beginPath(); g.ellipse(x, y - 1, 10, 3, 0, 0, 7); g.fill(); g.fillStyle = '#6a8a5a'; g.fillRect(x - 11, y - 3, 3, 2); g.fillRect(x + 9, y - 3, 3, 2);
    for (let k = 0; k < 4; k++) { const ph = (time * 0.6 + k / 4) % 1; g.globalAlpha = 0.5 * (1 - ph); g.fillStyle = '#a8d8ff'; g.fillRect(x - 6 + k * 4, y - 4 - R(ph * w.h * TS * 0.5), 1, 2); } g.globalAlpha = 1; }
  function drawBubble(g, b, cx, cy, time) { const x = R(b.x - cx), y = R(b.y - cy), r = b.state === 'pop' ? JAR.bubbleR + b.t * 30 : JAR.bubbleR + Math.sin(time * 6 + b.x) * 1.2;
    g.save(); g.globalAlpha = b.state === 'pop' ? Math.max(0, 0.6 - b.t * 2.4) : 0.55; g.strokeStyle = '#a8d8ff'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
    g.globalAlpha *= 0.3; g.fillStyle = '#4a8fd8'; g.fill(); g.globalAlpha = 0.8; g.fillStyle = '#ffffff'; g.fillRect(x - R(r * 0.5), y - R(r * 0.55), 2, 2); g.restore(); }
  function drawPatch(g, p, cx, cy, time) { const x = R(p.x - cx), y = R(p.y - cy), a = 1 - p.t / p.life;
    g.globalAlpha = 0.7 * a; if (p.col === 'green') { g.fillStyle = '#3e7a26'; for (let k = -3; k <= 3; k++) g.fillRect(x + k * 4, y - 2 - (k % 2 ? 4 : 2), 2, 5); }
    g.globalAlpha = 1; }
  function drawBanner(g, time) { if (!S.banner) return; const VW = ctx.VW(), a = Math.min(1, S.banner.t, 3.4 - S.banner.t); g.save(); g.globalAlpha = Math.max(0, a);
    g.fillStyle = 'rgba(20,24,14,0.7)'; g.fillRect(VW / 2 - 90, 22, 180, 15); g.fillStyle = '#c9b27c'; g.fillRect(VW / 2 - 90, 22, 180, 1); g.fillRect(VW / 2 - 90, 36, 180, 1);
    if (ctx.text) ctx.text(S.banner.name, VW / 2, 26, '#e8dcc0', 'center'); g.restore(); }
  /* her cottage: the great cauldron at the back of the room (her landmark's heart), her jar shelves' frames */
  function drawCottage(g, cx, cy, time) { const a = L().arena; if (!a) return; const x = R(cauldronX() - cx), y = R(a.floor - cy); if (x < -80 || x > ctx.VW() + 80) return;
    g.fillStyle = '#1e1a14'; g.fillRect(x - 22, y - 26, 44, 26); g.fillStyle = '#2e2a22'; g.fillRect(x - 24, y - 28, 48, 4);
    g.fillStyle = '#3a8a3a'; g.globalAlpha = 0.6 + 0.2 * Math.sin(time * 3); g.fillRect(x - 20, y - 27, 40, 2); g.globalAlpha = 1;
    for (let k = 0; k < 3; k++) { const ph = (time * 0.8 + k / 3) % 1; g.globalAlpha = 0.4 * (1 - ph); g.fillStyle = '#9be06a'; g.fillRect(x - 10 + k * 9, y - 30 - R(ph * 24), 2, 2); } g.globalAlpha = 1;
    g.fillStyle = Math.floor(time * 9) % 2 ? '#ff9a5c' : '#ffd36b'; for (let k = -2; k <= 2; k++) g.fillRect(x + k * 7, y - 3, 3, 3); }
  H.drawWorld = (g, cx, cy, time) => {
    if (!S || !H.on()) return;
    drawCottage(g, cx, cy, time);
    for (const w of S.wells) drawWell(g, w, cx, cy, time);
    for (const b of S.beds) drawBed(g, b, cx, cy, time);
    for (const h of S.hedges) drawHedge(g, h, cx, cy, time);
    for (const p of S.patches) drawPatch(g, p, cx, cy, time);
    for (const j of S.jars) { drawShelf(g, j, cx, cy, time); if (j.state !== 'return') drawJar(g, j, cx, cy, time); }
  };
  H.drawOver = (g, cx, cy, time) => {
    if (!S || !H.on()) return; const P = hero();
    for (const b of S.bubbles) drawBubble(g, b, cx, cy, time);
    if (P.carry && P.carry.t === 'jar' && !P.dead) CTW.drawArc(g, H.jarArc(P.carry), cx, cy, time, COL[P.carry.col][1]);
    /* HER MARKS (told on the floor where each will land) and her projectiles */
    for (const m of marks) { const x = R(m.x - cx), y = R(m.y - cy), p = 0.5 + 0.5 * Math.sin(time * 12), col = m.kind === 'pot' ? COL[m.col || 'red'][1] : '#ff9a5c';
      g.globalAlpha = 0.45 + 0.4 * p; g.strokeStyle = col; g.beginPath(); g.ellipse(x, y - 1, m.r, m.r * 0.32, 0, 0, 7); g.stroke(); g.globalAlpha = 0.18; g.fillStyle = col; g.fill(); g.globalAlpha = 1; }
    for (const b of balls) { const x = R(b.x - cx), y = R(b.y - cy), fl = Math.floor(time * 20) % 2; g.fillStyle = fl ? '#ff9a5c' : '#ffd36b'; g.fillRect(x - 4, y - 4, 8, 8); g.fillStyle = '#fff1a0'; g.fillRect(x - 2, y - 2, 4, 4); }
    for (const p of pots) drawJarShape(g, R(p.x - cx), R(p.y - cy) + 6, p.col);
    for (const q of gpatches) { const x = R(q.x - cx), y = R(A().floor - cy), a = 1 - q.t / q.life;
      if (q.col === 'green') { g.fillStyle = '#3e7a26'; g.globalAlpha = a; for (let k = -5; k <= 5; k++) { g.fillRect(x + k * 4, y - 6 + (k % 2 ? 2 : 0), 2, 6); g.fillStyle = '#c9b27c'; g.fillRect(x + k * 4, y - 7 + (k % 2 ? 2 : 0), 1, 1); g.fillStyle = '#3e7a26'; } }
      else { g.globalAlpha = a; g.fillStyle = Math.floor(time * 14 + k0(q)) % 2 ? '#ff9a5c' : '#ffd36b'; for (let k = -5; k <= 5; k++) g.fillRect(x + k * 4, y - 2 - (k % 2), 3, 2 + (k % 2)); }
      g.globalAlpha = 1; }
    drawBanner(g, time);
  };
  const k0 = q => Math.floor(q.x);
  /* HER READ (B10): OPEN = the gold ring and its bar (floated); WARDED = a pale shell and, while the brood stands, a line to each of them */
  H.drawGran = (g, e, cx, cy, time) => {
    if (!e.gm3) return; const x = R(e.x - cx), y = R(e.y - cy), pul = 0.5 + 0.5 * Math.sin(time * 10);
    if (e.mode === 'floated') { const k = Math.max(0, e.modeT / (e.floatLen || GM.float));
      g.globalAlpha = 0.5 + 0.35 * pul; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 1, 18 + pul * 2, 5, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      g.fillStyle = '#1b1626'; g.fillRect(x - 21, y - 62, 42, 5); g.fillStyle = '#ffd36b'; g.fillRect(x - 20, y - 61, R(40 * k), 3); return; }
    if (H.granWarded(e)) { g.globalAlpha = 0.28 + 0.15 * pul; g.strokeStyle = '#dfe8ff'; g.beginPath(); g.ellipse(x, y - 20, 16, 25, 0, 0, 7); g.stroke(); g.globalAlpha = 0.1; g.fillStyle = '#dfe8ff'; g.fill(); g.globalAlpha = 1;
      for (const q of brood(e)) { g.globalAlpha = 0.25; g.strokeStyle = '#c9b27c'; g.setLineDash && g.setLineDash([2, 3]); g.beginPath(); g.moveTo(x, y - 20); g.lineTo(R(q.x - cx), R(q.y - cy) - 6); g.stroke(); g.setLineDash && g.setLineDash([]); g.globalAlpha = 1; }
      if (e.ward > 0) { g.fillStyle = '#1b1626'; g.fillRect(x - 21, y - 62, 42, 5); g.fillStyle = '#dfe8ff'; g.fillRect(x - 20, y - 61, R(40 * Math.min(1, e.ward / GM.after)), 3); } }
  };
  /* her sprite's frame (main.js draws her with the old set until the art lane: B16 poses are its job) */
  H.granFrame = e => e.mode === 'sleep' ? 0 : e.mode === 'wake' ? 1 : (e.mode === 'fireballTell' || e.mode === 'cast') ? 8 : (e.mode === 'staff' || e.mode === 'staffTell') ? 5
    : (e.mode === 'jarTell' || e.mode === 'hurled') ? 6 : (e.mode === 'broodTell' || e.mode === 'kick') ? 7 : (e.mode === 'stirTell' || e.mode === 'stir') ? 8 : e.mode === 'floated' ? 4 : (Math.floor((e.anim || 0) * 4) % 2 ? 2 : 3);

  /* ---------- THE WALKER'S HANDS (tools/level-walk.mjs via src/walk-hints.js): the next jar the route needs, and where it is thrown from ---------- */
  const needs = () => [...S.hedges.filter(h => !h.burnt).map(h => ({ kind: 'red', x: h.x0 * TS, y: (h.y1 + 1) * TS, o: h })),
    ...S.beds.filter(b => !b.grown).map(b => ({ kind: 'green', x: b.x, y: b.y, o: b })), ...S.wells.map(w => ({ kind: 'blue', x: w.x, y: w.y, o: w }))];
  H.walkHint = P => {
    if (!S || !H.on() || !P || P.dead) return null;
    const bb = S.bubbles.find(b => b.state === 'hover' && Math.abs(b.x - P.x) < 80 && Math.abs(b.y - P.y) < 40);
    if (bb) return { x: bb.x, y: P.y, key: null, face: 0, r: 6 };
    if (S.bubbles.some(b => b.rider === 'P')) return { x: P.x + P.face * 30, y: P.y, key: null, face: P.face, r: 4 };
    /* the nearest need ahead on his floor (or the well under the ledge he cannot climb) */
    const nd = needs().filter(n => n.x > P.x - 2 * TS && n.x < P.x + 16 * TS && Math.abs(n.y - P.y) < 2 * TS && !(n.kind === 'green' && n.o.grow === 'ladder' && false)).sort((a, b) => a.x - b.x)[0];
    if (!nd) return null;
    if (nd.kind === 'blue' && nd.o.used && P.y < nd.y - 3 * TS) return null;
    const c = P.carry && P.carry.t === 'jar' ? P.carry.col : null;
    if (c === nd.kind) { const spot = nd.kind === 'red' ? nd.x - 40 : nd.kind === 'green' ? nd.x - 38 : nd.x - 38; return { x: spot, y: nd.y, key: 'atk', down: true, face: 1, r: 8 }; }
    if (c) return { x: P.x, y: P.y, key: 'atk', down: true, face: -1, r: 999 };   /* the wrong jar: break it behind him and fetch the right one */
    const j = S.jars.filter(q => q.state === 'rest' && q.col === nd.kind && Math.abs(q.y - P.y) < 2 * TS && Math.abs(q.x - nd.x) < 22 * TS).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    return j ? { x: j.x, y: j.y, key: 'talk', face: 0, r: 10 } : { x: P.x, y: P.y, key: null, hold: true, r: 14 };
  };
  /* ---------- TOOLS AND BOTS ---------- */
  H.read = () => (S ? { n: { ...S.n }, jars: S.jars.map(j => ({ x: j.x, y: j.y, col: j.col, state: j.state })), beds: S.beds.map(b => ({ x: b.tx, y: b.ty, grow: b.grow, grown: b.grown })),
    hedges: S.hedges.map(h => ({ x0: h.x0, x1: h.x1, burnt: h.burnt })), wells: S.wells.map(w => ({ x: w.x, used: w.used })), bubbles: S.bubbles.map(b => ({ x: b.x, y: b.y, state: b.state, rider: b.rider === 'P' ? 'P' : b.rider ? b.rider.t : null })),
    marks: marks.map(m => ({ x: m.x, r: m.r, kind: m.kind })), balls: balls.length, gpatches: gpatches.map(q => ({ x: q.x, col: q.col })) } : null);
  H.state = () => S; H.marks = () => marks; H.gpatches = () => gpatches; H.broodOf = e => brood(e);
  return H;
}
