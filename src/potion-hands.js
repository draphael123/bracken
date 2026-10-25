// src/potion-hands.js - UNDERLEAF 3: HER JARS (the level's rule) and THE POTION MASTER (its boss; was THE GRANDMOTHER 3) - claude/underleaf3, the OPUS GREYBOX, 2026-10-24.
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
// THE POTION MASTER (claude/underleaf4, Daniel 10-25; was THE GRANDMOTHER 3 - her t, save key and test ids stay 'grandmother'): THREE PHASES, ONE PER POTION.
//   P1 GREEN BRAMBLE (a thorn-hedge ward: RED burns it), P2 BLUE BUBBLES (aloft: GREEN under her snares her down), P3 RED CAULDRON (a fire ring: BLUE lifts
//   her out). Every guard is x0.4 (B15), every opening x2 on a purse, then a told re-form. The block "THE POTION MASTER" below says the rest.
import * as CTW from './carry-throw.js';
import * as UW from './redraw/underleaf3_world.js'; import * as UG from './redraw/underleaf3_gran.js'; import * as UB from './redraw/underleaf3_backdrop.js'; import * as UD from './redraw/underleaf3_dress.js'; import * as UT from './redraw/underleaf3_tiles.js';   /* (claude/underleafart) her jars, shelves, beds, hedges, wells, bubbles, marks and cauldron, drawn */

export const JAR = { brew: 0.8, burnR: 40, bedR: 30, snare: 1.6, snareR: 28, hover: 2.4, rise: 92, riseMax: 7 * 16, foeFloat: 2.6, foeRise: 34, bubbleR: 13, fireLife: 2.6, hedgeBurn: 0.45, coatR: 34 };
export const GM = { hp: 1600, ward: 0.4, openMul: 2, float: 3.2, open1: 3.2, open2: 3.2, purse: 0.11, after: 3, p2: 2 / 3, p3: 1 / 3,
  brood: 2, broodFirst: 6, broodCd: 14, broodHp: 1, broodBite: 0.6, broodTell: 1.0,
  walk: 34, walk2: 46, walk3: 40, sweepAt: 48, sweepCd: 2.6, sweepTell: 0.55, lashAt: 96, lashCd: 4.5, lashTell: 0.7,
  fireCd: 4.8, fireTell: 0.85, fireN: 2, fireR: 20, fireFly: 0.9, trapCd: 5.5, trapTell: 0.8, trapSpd: 38, trapLife: 4.5, trapLift: 1.1, trapRise: 34, trapR: 11,
  hover: 52, burnR: 48, snareR: 44, ringR: 40,
  farAt: 100, farK: 2.0, hurlCd: 5, hurlTell: 0.6, hurlFly: 0.8, patchR: 22, patchLife: 2.8, patchTick: 0.7, stirCd: 8, stirTell: 1.0, stirN: 3, kick: 1.2,
  dmg: { sweep: 36, lash: 32, fire: 40, thorns: 18, burn: 18, gout: 40, ring: 18, trap: 12 } };   /* (claude/underleaf4) THE POTION MASTER: three phases, one guard and one jar each (the block below) */
export const PO_SAY = {
  take: 'INTERACT TAKES HER JAR. ATTACK THROWS IT. UP LOBS, DOWN AT YOUR FEET.',
  ladder: 'THE VINE GROWS: A LADDER', bridge: 'THE VINE GROWS: A BRIDGE', snare: 'THE VINES HOLD THEM',
  bubble: 'THE BUBBLE LIFTS YOU', floated: 'OFF HIS FEET', burnt: 'THE THORNS BURN AWAY', coat: 'THE COAT BURNS OFF', burnIt: 'BURN IT',
  brood: 'SHE CALLS HER BROOD', open: 'SHE FLOATS: CUT HER', open1: 'THE HEDGE BURNS: CUT HER', open2: 'THE VINE PULLS HER DOWN: CUT HER',
  need1: 'HER HEDGE: A RED JAR BURNS IT', need2: 'SHE IS ALOFT: A GREEN JAR UNDER HER PULLS HER DOWN', need3: 'HER FIRE RING: A BLUE JAR LIFTS HER OUT',
  reform1: 'THE HEDGE GROWS BACK', reform2: 'SHE RISES AGAIN', reform3: 'THE RING RELIGHTS', phase2: 'SHE RISES ON HER BUBBLES', phase3: 'SHE LIGHTS THE CAULDRON RING',
  shelf2: 'HER SHELVES BREW GREEN NOW: GROW A VINE UNDER HER', shelf3: 'HER SHELVES BREW BLUE NOW: LIFT HER OUT OF THE FIRE', trap: 'HER BUBBLES COME FOR YOU', trapped: 'CAUGHT IN HER BUBBLE',
  stir: 'SHE STIRS THE CAULDRON', noBurn: 'HER OWN FIRE: IT DOES NOT TAKE', spit: 'THE CAULDRON SPITS', thorns: 'THORNS', burning: 'BURNING GROUND',
};
const COL = { green: ['#5fae3a', '#9be06a', '#2e5a1c'], blue: ['#4a8fd8', '#a8d8ff', '#24406a'], red: ['#d8502a', '#ffb070', '#6a2014'] };

export function makePotionHands(ctx) {
  const TS = ctx.TS, T = ctx.T, H = {}, R = Math.round;
  const L = () => ctx.L;
  let S = null, warmed = false;
  H.on = () => !!(L() && L().jars);
  const say = (x, y, k, c) => ctx.number(x, y, PO_SAY[k], c || '#ffd36b');
  const once = k => { if (!S || S.said.has(k)) return false; S.said.add(k); return true; };
  const hero = () => ctx.P();
  const ents = t => (L().ents || []).filter(e => e.t === t);

  /* ---------- RESET (every load and every respawn: what grew and what burnt stays for the attempt) ---------- */
  H.reset = () => {
    const lv = L(); if (!lv || !lv.jars) { S = null; return; }
    if (!warmed) { warmed = true; UW.warm(); UD.warmDress(); UT.warmTiles(); try { const cv = document.createElement('canvas'); cv.width = 320; cv.height = 180; const gg = cv.getContext('2d'), plan = UD.planDress(lv, T); for (const tx of [10, 60, 130, 180, 230, 270, 320, 360, 400, 425, 450]) { const cx0 = tx * 16 - 160; UB.drawBackdrop(gg, cx0, 0, 320, 180, lv, 0, 0, true); UB.drawNear(gg, cx0, 0, 320, 180, lv, 0, 0); UD.drawDress(gg, cx0, 400, 320, 0, plan); } } catch (err) { /* the warm-up is a nicety */ } }   /* (claude/underleafart) bake the level's pictures at the load, not in the first frames */
    const keep = S && S.L === lv ? S : null;
    const jars = [...ents('jarshelf'), ...ents('brewpot')].map(e => ({ t: 'jar', col: e.col, brew: e.t === 'brewpot', hx: e.x * TS + 8, hy: (e.y + 1) * TS, x: e.x * TS + 8, y: (e.y + 1) * TS - (e.t === 'brewpot' ? 12 : 0), state: 'rest', retT: 0, thrKind: 'pot', vx: 0, vy: 0,
      launch: P0 => CTW.launchOf('pot', P0, ctx.keys()) }));
    { const ar = lv.arena; if (ar) for (const j of jars) if (j.hx >= ar.x0 && j.hx <= ar.x1) { j.arena = true; j.col = 'red'; } }   /* (claude/underleaf4) HER ROOM's shelves brew the jar her phase needs: red first (src arenaCol) */
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
  function burnCoat(e) { if (!e.thornCoat || e.coatOff) return; e.coatOff = true; e.skinNow = 'thornbare'; e.coatBurn = 1.6; e.stagger = Math.max(e.stagger || 0, 1.0); S.n.coats++; ctx.sfx.hiss && ctx.sfx.hiss();
    ctx.burst(e.x, e.y - 10, 16, ['#ff9a5c', '#5a4a2a', '#ffd36b'], 70, 0.6, -40, 2); ctx.word(e.x, e.y - (e.h || 14) - 12, PO_SAY.coat, '#ff9a5c'); }

  /* ---------- A JAR BREAKS ---------- */
  function breakJar(j, x, y, hit) {
    const c = j.col; S.n.breaks[c] = (S.n.breaks[c] || 0) + 1;
    ctx.sfx.crack(); ctx.burst(x, y - 3, 10, COL[c], 70, 0.5, 400, 2);
    j.state = 'return'; j.retT = j.brew ? JAR.brew : ctx.respawn('pot'); j.retMax = j.retT;
    if ((c === 'green' || c === 'red') && granJar(c, x, y, hit)) { if (c === 'red') { for (const dx of [-12, 0, 12]) ctx.fire(x + dx, y, 0.8); } return; }   /* (claude/underleaf4) THE POTION MASTER's guard */
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
    if (j.y > ctx.LH() * TS || j.x < 0 || j.x > ctx.LW() * TS) { j.state = 'return'; j.retT = j.retMax = 0.5; }
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
        if (P.carry !== j || P.dead) { j.state = 'return'; j.retT = j.brew ? JAR.brew : ctx.respawn('pot'); j.retMax = j.retT; if (P.carry === j) P.carry = null; continue; }
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
    if (isOpen(e) && e.purseLeft === 0) { ctx.turned(e, fromX, 'GUARDED'); return 0; }   /* the purse spent this frame: her guard re-forms (the next frame) - the opening is over */
    if (isOpen(e)) { const d = Math.round(dmg * GM.openMul), left = purseOf(e); e.pursed = true;
      if (d < left) { e.purseLeft -= d; return d; } e.purseLeft = 0; e.modeT = Math.min(e.modeT, 0.05); return Math.max(1, left); }   /* the purse emptied: the opening ends */
    if (guarded(e)) { ctx.turned(e, fromX, 'GUARDED', { stop: false }); S && S.n && (S.n.warded = (S.n.warded || 0) + 1); return Math.max(1, Math.round(dmg * GM.ward)); }
    return dmg;
  };
  /* A BLOW THAT GREW AFTER IT WAS COUNTED: the purse pays only what it has left (src/boss-greed.js, claude/capsfix) */
  H.fix = (e, d0, d1) => { if (!e.pursed || e.purseLeft === undefined) return d1; const extra = Math.min(d1 - d0, Math.max(0, e.purseLeft)); e.purseLeft -= extra; if (e.purseLeft <= 0.5) { e.purseLeft = 0; e.modeT = Math.min(e.modeT, 0.05); } return d0 + extra; };

  /* ================= THE POTION MASTER (claude/underleaf4, Daniel 10-25: "the Potion Master, not the Grandmother; three phases, one per potion type")
     Her save key, her `t` and her test ids stay 'grandmother' (saves, bestiary ticks, rows); every word on screen says THE POTION MASTER.
     ONE PHASE PER POTION. In each phase ONE guard covers her (x GM.ward = 0.4 and GUARDED - never wholly invulnerable, B15), and ONE jar breaks it:
       P1 GREEN BRAMBLE  she stands in a THORN-HEDGE ward. RED on (or by) her burns it: OPEN on the ground (GM.open1 s). Her moves are green: her STAFF,
                         the VINE LASH along the floor, a GREEN JAR that sprouts THORNS where it lands (the spot marked), and a small BROOD (two, no ward)
       P2 BLUE BUBBLES   she floats up out of reach on her bubbles. GREEN on her (or broken on the floor under her) grows a vine that SNARES HER DOWN:
                         OPEN on the ground (GM.open2 s). Her moves: FIREBALLS on marked spots, and BUBBLE TRAPS that drift at you and LIFT YOU, helpless
       P3 RED CAULDRON   she stands in a RING OF CAULDRON FIRE (it burns a hero beside her). BLUE on her lifts her OUT of it, helpless: OPEN (the float).
                         Her moves: her STAFF, a RED JAR that leaves BURNING GROUND, and the CAULDRON SPITS gouts on marked spots
     Each opening pays its purse (GM.purse of her) at x GM.openMul, then a told re-form (GM.after s: the hedge grows back / she rises / the ring relights),
     still x0.4. Her shelves in the room brew the colour the phase needs (drawn, and said when the phase turns). */
  const PH_COL = { 1: 'red', 2: 'green', 3: 'blue' };
  const brood = e => ctx.enemies().filter(q => q.alive && q.broodOf === e);
  const isOpen = e => e.mode === 'floated' || e.mode === 'opened';
  const guarded = e => !!e.gm3 && !isOpen(e) && e.mode !== 'sleep' && e.mode !== 'wake';
  H.granOpen = e => isOpen(e);
  H.granWarded = e => guarded(e);
  H.phaseCol = e => PH_COL[(e && e.phase) || 1];
  let marks = [], balls = [], pots = [], gpatches = [], traps = [];
  const A = () => L().arena;
  const floorY = () => A().floor;
  const clampX = x => Math.max(A().x0 + 18, Math.min(A().x1 - 18, x));
  function arenaCol(ph) { if (!S) return; const c = PH_COL[ph]; for (const j of S.jars) if (j.arena && j.col !== c) { j.col = c; if (j.state === 'rest') ctx.burst(j.x, j.y - 6, 6, COL[c], 30, 0.4); } }
  function granInit(e) { e.gm3 = true; const k = ctx.baseHp && ctx.baseHp() > 0 && e.maxHp > 0 ? e.maxHp / ctx.baseHp() : 1; e.hp = e.maxHp = Math.round(GM.hp * k);   /* (the difficulty's and the tier's scaling of her spawn kept) */
    e.phase = 1; e.ward = 0; e.hedge = true; e.aloft = false; e.ring = false; e.broodT = GM.broodFirst; e.fireT = 2.5; e.hurlT = 2.6; e.sweepT = 1.2; e.stirT = 3; e.lashT = 3.6; e.trapT = 2; e.called = 0;
    marks = []; balls = []; pots = []; gpatches = []; traps = []; arenaCol(1); }
  function callBrood(e) {
    const n = GM.brood - brood(e).length; if (n <= 0) return;
    const row = Math.round(floorY() / TS) - 1;
    for (let i = 0; i < n; i++) { const side = i % 2 ? 1 : -1, x = clampX(e.x + side * (26 + 14 * Math.floor(i / 2)));
      const made = ctx.spawn({ t: 'sprig', x: Math.floor(x / TS), y: row, face: -side, cnSkin: 'grandbrood' }); for (const q of made) { q.broodOf = e; q.nip = GM.broodBite; q.hp = Math.max(1, Math.round(q.hp * GM.broodHp)); q.woke = 1; q.sleeper = false; }
      ctx.burst(x, floorY() - 6, 8, ['#5a4a2a', '#8a7a4a', '#c9b27c'], 50, 0.5); }
    e.called++; ctx.sfx.whistleCall ? ctx.sfx.whistleCall() : ctx.sfx.charge(); say(e.x, e.y - e.h - 18, 'brood', '#c9b27c');
  }
  /* A JAR OF YOURS NEAR HER: is it the one this phase's guard breaks on? (breakJar asks before a jar does its ordinary work) */
  function granJar(col, x, y, hit) {
    const e = ctx.boss(); if (!e || e.t !== 'grandmother' || !e.gm3 || !e.alive || !ctx.bossActive()) return false;
    if (e.mode === 'sleep' || e.mode === 'wake') return false;
    const fy = floorY(), dx = Math.abs(x - e.x);
    const near = hit === e || (e.phase === 1 && dx < GM.burnR && y > e.y - 60) || (e.phase === 2 && dx < GM.snareR && y > fy - 20) || (e.phase === 3 && dx < 18 && y > e.y - 50);
    if (!near) return false;
    if (col !== PH_COL[e.phase]) { if (hit === e || dx < 24) { ctx.turned(e, hero().x, 'GUARDED', { stop: false }); if (once('wrong' + e.phase)) say(e.x, e.y - e.h - 30, 'need' + e.phase, COL[PH_COL[e.phase]][1]); } return false; }
    if (e.mode === 'kick' || e.mode === 'reform' || isOpen(e)) { ctx.turned(e, hero().x, 'GUARDED', { stop: false }); return true; }
    granOpenUp(e); return true;
  }
  function granOpenUp(e) {
    e.purseLeft = undefined; e.pursed = false; e.vx = 0; S.n.opens = (S.n.opens || 0) + 1; marks = marks.filter(m => m.kind !== 'pot'); ctx.shake(3);
    if (e.phase === 1) { e.hedge = false; e.hedgeBurn = 0.7; e.mode = 'opened'; e.modeT = e.openLen = GM.open1; ctx.sfx.hiss && ctx.sfx.hiss();
      ctx.burst(e.x, e.y - 20, 22, ['#ff9a5c', '#ffd36b', '#3a2a1a'], 90, 0.7, -60, 2); say(e.x, e.y - e.h - 24, 'open1', '#8fd160'); return; }
    if (e.phase === 2) { e.aloft = false; e.vine = 1; e.mode = 'opened'; e.modeT = e.openLen = GM.open2; e.vy = 260; ctx.sfx.creak && ctx.sfx.creak(); ctx.sfx.puff && ctx.sfx.puff();
      ctx.burst(e.x, floorY() - 8, 16, COL.green, 70, 0.6, -40, 2); say(e.x, e.y - e.h - 24, 'open2', '#8fd160'); return; }
    e.ring = false; e.mode = 'floated'; e.modeT = GM.float; e.floatLen = e.openLen = GM.float; e.vy = 0; e.floatY0 = e.y; ctx.sfx.puff && ctx.sfx.puff(); ctx.ring(e.x, e.y - 20, 26, '#a8d8ff', 0.5);
    S.bubbles.push({ x: e.x, y: e.y - 22, y0: e.y, t: 0, state: 'rise', rider: e, life: GM.float + 1 });
    say(e.x, e.y - e.h - 24, 'open', '#8fd160');
  }
  /* a BLUE jar's bubble reaches her (board()): only her third phase opens on it */
  function granBlue(e) {
    if (e.mode === 'sleep' || e.mode === 'wake') return;
    if (e.phase !== 3) { ctx.turned(e, hero().x, 'GUARDED', { stop: false }); if (once('wrong' + e.phase)) say(e.x, e.y - e.h - 30, 'need' + e.phase, COL[PH_COL[e.phase]][1]); return; }
    if (e.mode === 'kick' || e.mode === 'reform' || isOpen(e)) { ctx.turned(e, hero().x, 'GUARDED', { stop: false }); return; }
    granOpenUp(e);
  }
  /* the opening over: her guard RE-FORMS, told (GM.after s, still x0.4, no jar opens her in it: B3) */
  function granReform(e) { e.mode = 'reform'; e.modeT = GM.after; e.purseLeft = undefined; e.pursed = false; e.stagger = 0; e.vine = 0;
    if (e.phase === 2) e.aloft = true;   /* she rises through the re-form */
    say(e.x, e.y - e.h - 18, 'reform' + e.phase, e.phase === 1 ? '#9be06a' : e.phase === 2 ? '#a8d8ff' : '#ff9a5c'); ctx.sfx.aegis ? ctx.sfx.aegis() : ctx.sfx.clank(); ctx.ring(e.x, e.y - 20, 22, '#dfe8ff', 0.35); }
  function guardUp(e) { e.hedge = e.phase === 1; e.aloft = e.phase === 2; e.ring = e.phase === 3; }
  const mark = (x, kind, t, r) => { const m = { x, y: floorY(), kind, t: 0, life: t, r: r || GM.fireR }; marks.push(m); return m; };
  H.granStep = (e, dt) => {
    if (!S) return;
    if (!e.gm3) granInit(e);
    const P = hero(), d = P.x - e.x, ad = Math.abs(d), ph = e.phase, fy = floorY();
    e.modeT -= dt; e.anim = (e.anim || 0) + dt; e.ward = 0; e.hedgeBurn = Math.max(0, (e.hedgeBurn || 0) - dt);
    for (const k of ['sweepT', 'fireT', 'hurlT', 'stirT', 'lashT', 'trapT']) e[k] -= dt;
    if (ad > GM.farAt && !isOpen(e)) { e.fireT -= dt * GM.farK; e.hurlT -= dt * GM.farK * 0.6; e.trapT -= dt * 0.5; }   /* a hero who keeps his distance gets her lantern sooner */
    if (!brood(e).length) e.broodT -= dt;
    if ((e.burn || 0) > 0) { e.burn = 0; if (once('smother')) { ctx.sfx.hiss && ctx.sfx.hiss(); ctx.word(e.x, e.y - e.h - 12, PO_SAY.noBurn, '#ff9a5c'); } }   /* SHE IS THE WITCH-FIRE'S MISTRESS: a fire never takes on her */
    const up = e.aloft && e.mode !== 'opened';
    if (!up && e.mode !== 'floated') e.vy = Math.min(300, (e.vy || 0) + 1000 * dt);
    let want = 0;
    /* THE PHASE TURNS (on her feet, between moves): the next potion's guard; her shelves brew its colour */
    const next = ph === 1 && e.hp <= e.maxHp * GM.p2 ? 2 : ph === 2 && e.hp <= e.maxHp * GM.p3 ? 3 : 0;
    if (next && e.mode === 'walk') { e.phase = next; e.mode = 'kick'; e.modeT = GM.kick; e.vx = 0; if (next === 3) e.skinNow = 'grandmother2'; guardUp(e); arenaCol(next); for (const q of brood(e)) { q.hp = 0; q.alive = false; }
      ctx.sfx.roar && ctx.sfx.roar(); ctx.shake(5); say(e.x, e.y - e.h - 24, 'phase' + next, next === 2 ? '#a8d8ff' : '#ff9a5c'); ctx.hint(PO_SAY['shelf' + next], 4);
      e.fireT = 2.2; e.trapT = 3.4; e.hurlT = 2.4; e.stirT = 3.6; e.sweepT = 1.5; }
    switch (e.mode) {
      case 'sleep': return;
      case 'wake': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.6; guardUp(e); } break;
      case 'walk': {
        e.face = Math.sign(d) || e.face;
        if (ph === 2) { want = ad > 26 ? e.face * GM.walk2 : 0; }   /* aloft she drifts over you */
        else { const keep = ph === 3 ? 60 : 78; want = ad > keep ? e.face * (ph === 3 ? GM.walk3 : GM.walk) : ad < 34 ? -e.face * 20 : 0; }
        if (e.modeT > 0) break;
        if (ph === 1 && e.broodT <= 0 && !brood(e).length) { e.mode = 'broodTell'; e.modeT = GM.broodTell; e.vx = 0; e.broodT = GM.broodCd; }
        else if (ph !== 2 && ad < GM.sweepAt && Math.abs(P.y - e.y) < 26 && e.sweepT <= 0) { e.sweepT = GM.sweepCd; e.mode = 'staffTell'; e.modeT = GM.sweepTell; ctx.number(e.x, e.y - e.h - 14, '!', '#ffd36b'); ctx.sfx.snort && ctx.sfx.snort(); }
        else if (ph === 1 && ad < GM.lashAt && Math.abs(P.y - e.y) < 26 && e.lashT <= 0) { e.lashT = GM.lashCd; e.mode = 'lashTell'; e.modeT = GM.lashTell; e.vx = 0; ctx.number(e.x, e.y - e.h - 14, '!', '#ffd36b'); ctx.sfx.creak && ctx.sfx.creak(); }
        else if (ph === 3 && e.stirT <= 0) { e.stirT = GM.stirCd; e.mode = 'stirTell'; e.modeT = GM.stirTell; ctx.number(e.x, e.y - e.h - 16, '!!', '#ff6b6b'); ctx.sfx.charge();
          const sp = (A().x1 - A().x0) / (GM.stirN * 2), off = (e.called++ % 2) * sp; for (let i = 0; i < GM.stirN; i++) mark(A().x0 + off + sp * (2 * i + 0.5), 'gout', GM.stirTell + 0.7, 22); }
        else if (ph === 2 && e.fireT <= 0) { e.fireT = GM.fireCd; e.mode = 'fireballTell'; e.modeT = GM.fireTell; ctx.number(e.x, e.y - e.h - 16, '!!', '#ff6b6b'); ctx.sfx.charge();
          const n = GM.fireN; e.fireAt = []; for (let i = 0; i < n; i++) { const x = clampX(P.x + (i - (n - 1) / 2) * 64); e.fireAt.push(x); mark(x, 'fire', GM.fireTell + GM.fireFly + 0.1); } }
        else if (ph === 2 && e.trapT <= 0 && traps.length < 2) { e.trapT = GM.trapCd; e.mode = 'trapTell'; e.modeT = GM.trapTell; ctx.number(e.x, e.y - e.h - 16, '!!', '#ff6b6b'); ctx.sfx.puff && ctx.sfx.puff(); }
        else if (ph !== 2 && e.hurlT <= 0) { e.hurlT = GM.hurlCd; e.mode = 'jarTell'; e.modeT = GM.hurlTell; e.hurlCol = ph === 1 ? 'green' : 'red'; ctx.number(e.x, e.y - e.h - 16, '!!', '#ff6b6b'); ctx.sfx.snort && ctx.sfx.snort();
          e.hurlX = clampX(P.x); mark(e.hurlX, 'pot', GM.hurlTell + GM.hurlFly + 0.1, GM.patchR).col = e.hurlCol; }
        break; }
      case 'broodTell': want = 0; if (e.modeT <= 0) { callBrood(e); e.mode = 'walk'; e.modeT = 0.8; } break;
      case 'staffTell': want = 0; e.face = Math.sign(d) || e.face;
        if (e.modeT <= 0) { e.mode = 'staff'; e.modeT = 0.32; ctx.sfx.slash && ctx.sfx.slash(); ctx.shake(3); e.vx = e.face * 60;
          if (!P.dead && Math.sign(d) === e.face && ad < GM.sweepAt + 8 && Math.abs(P.y - e.y) < 26) { const res = ctx.damage(e.x, GM.dmg.sweep, { who: e, blow: 'THE STAFF' }); if (res === 'hit') { P.vx = e.face * 220; P.vy = -140; } else if (res === 'blocked') { e.stagger = Math.max(e.stagger || 0, 0.45); P.vx = e.face * 110; } } } break;
      case 'staff': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; } break;
      case 'lashTell': want = 0; e.face = Math.sign(d) || e.face;
        if (e.modeT <= 0) { e.mode = 'lash'; e.modeT = 0.4; ctx.sfx.slash && ctx.sfx.slash();
          ctx.burst(e.x + e.face * GM.lashAt * 0.6, fy - 4, 12, COL.green, 80, 0.4, 200, 2);
          if (!P.dead && Math.sign(d) === e.face && ad < GM.lashAt + 6 && Math.abs(P.y - e.y) < 26) { const res = ctx.damage(e.x, GM.dmg.lash, { who: e, blow: 'THE VINE LASH' }); if (res === 'hit') { P.vx = e.face * 160; P.vy = -100; } else if (res === 'blocked') { e.stagger = Math.max(e.stagger || 0, 0.35); } } } break;
      case 'lash': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; } break;
      case 'fireballTell': want = 0; e.face = Math.sign(d) || e.face;
        if (Math.random() < dt * 40) ctx.part({ x: e.x + e.face * 12 + (Math.random() - 0.5) * 8, y: e.y - 46 + (Math.random() - 0.5) * 8, vx: 0, vy: -20, life: 0.35, max: 0.35, col: Math.random() < 0.5 ? '#ffb347' : '#fff1a0', size: 1, grav: -30 });
        if (e.modeT <= 0) { e.mode = 'cast'; e.modeT = 0.5; ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh();
          for (const tx of (e.fireAt || [])) { const sx = e.x + e.face * 12, sy = e.y - 46, t = GM.fireFly, g = 600; balls.push({ x: sx, y: sy, vx: (tx - sx) / t, vy: (fy - 4 - sy) / t - 0.5 * g * t, g, tx, life: t + 0.4, who: e }); } } break;
      case 'cast': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; } break;
      case 'trapTell': want = 0; e.face = Math.sign(d) || e.face;
        if (e.modeT <= 0) { e.mode = 'trap'; e.modeT = 0.45; ctx.sfx.puff && ctx.sfx.puff();
          traps.push({ x: e.x + e.face * 14, y: e.y - 20, vx: e.face * GM.trapSpd, t: 0, life: GM.trapLife, rider: null, liftT: 0 }); if (once('trap')) say(e.x, e.y - e.h - 30, 'trap', '#a8d8ff'); } break;
      case 'trap': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; } break;
      case 'jarTell': want = 0; e.face = Math.sign((e.hurlX ?? P.x) - e.x) || e.face;
        if (e.modeT <= 0) { e.mode = 'hurled'; e.modeT = 0.45; ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh();
          const sx = e.x + e.face * 10, sy = e.y - 30, t = GM.hurlFly, g = 600; pots.push({ x: sx, y: sy, vx: (e.hurlX - sx) / t, vy: (fy - 4 - sy) / t - 0.5 * g * t, g, col: e.hurlCol, life: t + 0.4, who: e }); } break;
      case 'hurled': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; } break;
      case 'stirTell': want = 0; if (e.modeT <= 0) { e.mode = 'stir'; e.modeT = 0.6; say(e.x, e.y - e.h - 22, 'spit', '#ff9a5c'); ctx.sfx.boom && ctx.sfx.boom();
          const cx0 = cauldronX(); for (const m of marks.filter(q => q.kind === 'gout')) { const sy = fy - 40, t = 0.6, g = 600; balls.push({ x: cx0, y: sy, vx: (m.x - cx0) / t, vy: (fy - 4 - sy) / t - 0.5 * g * t, g, tx: m.x, life: t + 0.4, who: e, gout: true }); } } break;
      case 'stir': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.4; } break;
      case 'kick': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.3; } break;
      case 'reform': want = 0; if (e.modeT <= 0) { guardUp(e); e.mode = 'walk'; e.modeT = 0.4; } break;
      case 'opened': want = 0; e.vx = 0; e.stagger = 0; e.burn = 0; if (e.modeT <= 0) { granReform(e); ctx.dust && ctx.dust(e.x, e.y, 8); } break;   /* STAGGER MEANS STILL (B4): she stands in the ash of her hedge / in the vine's grip */
      case 'floated': { want = 0; e.vx = 0; e.vy = 0; e.burn = 0;   /* the bubble keeps the fire off her: the opening is the purse, no more */
        const k = Math.min(1, (e.floatLen - e.modeT) * 3); e.y = e.floatY0 - 8 * k; e.stagger = 0;
        if (e.modeT <= 0) { e.y = e.floatY0; granReform(e); ctx.shake(3); ctx.dust && ctx.dust(e.x, e.y, 8); } return; }
    }
    if (e.stagger > 0) { want = 0; e.stagger -= dt; }
    e.vx += (want - e.vx) * Math.min(1, dt * 5);
    if (up) { const ty = fy - GM.hover; e.vy = 0; e.y += (ty - e.y) * Math.min(1, dt * 2.5); e.x = clampX(e.x + e.vx * dt); return; }   /* ALOFT: she hangs on her bubbles over the room */
    const r = ctx.moveBody(e, e.vx * dt, e.vy * dt); if (r && r.ground) e.vy = 0;
    if (e.y > fy) { e.y = fy; e.vy = 0; }
    e.x = clampX(e.x);
  };
  const cauldronX = () => (A().x0 + A().x1) / 2;
  /* her projectiles, her patches, her traps and her ring, every frame (with the world, so a death clears them) */
  function updateGranWorld(dt) {
    const e = ctx.boss(), on = e && e.t === 'grandmother' && e.alive && e.gm3 && ctx.bossActive();
    const P = hero();
    if (!on) { if (marks.length || balls.length || pots.length || gpatches.length || traps.length) { if (P) P.trapped = 0; marks = []; balls = []; pots = []; gpatches = []; traps = []; } return; }
    const floor = floorY();
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
    /* HER RING OF CAULDRON FIRE (P3, her guard): it burns a hero who stands beside her on the floor */
    if (e.ring && e.mode !== 'floated') { e.ringTick = (e.ringTick || 0) - dt;
      if (e.ringTick <= 0 && !P.dead && P.ground && Math.abs(P.x - e.x) < GM.ringR && Math.abs(P.y - floor) < 6) { e.ringTick = GM.patchTick; ctx.damage(e.x, GM.dmg.ring, { who: e, unblockable: true, noStagger: true, blow: 'HER FIRE RING' }); } }
    /* HER BUBBLE TRAPS (P2): they drift at you along the floor; one that meets you LIFTS YOU, helpless, a moment - then lets you fall */
    for (const q of traps) { q.t += dt;
      if (q.rider === 'P') { q.liftT -= dt; const rise = Math.min(GM.trapRise, (GM.trapLift - q.liftT) * 60); P.x = q.x; P.vx = 0; P.y = q.y0 - rise; P.vy = 0; P.ground = false; q.y = P.y - 10;
        if (q.liftT <= 0 || P.dead) { q.dead = true; P.trapped = 0; ctx.sfx.puff && ctx.sfx.puff(); ctx.burst(q.x, q.y, 8, COL.blue, 50, 0.4); } continue; }
      const ty = floor - 14; q.y += (ty - q.y) * Math.min(1, dt * 3); q.vx += (Math.sign(P.x - q.x) * GM.trapSpd - q.vx) * Math.min(1, dt * 0.8); q.x += q.vx * dt;
      if (!P.dead && !P.trapped && Math.abs(P.x - q.x) < GM.trapR + 5 && Math.abs((P.y - 10) - q.y) < GM.trapR + 6) { q.rider = 'P'; q.liftT = GM.trapLift; q.y0 = P.y; P.trapped = 1; ctx.sfx.puff && ctx.sfx.puff();
        ctx.damage(q.x, GM.dmg.trap, { who: e, unblockable: true, noStagger: true, blow: 'HER BUBBLE' }); if (once('trapped')) say(P.x, P.y - 36, 'trapped', '#a8d8ff'); continue; }
      if (q.t > q.life || q.x < A().x0 + 4 || q.x > A().x1 - 4) { q.dead = true; ctx.sfx.puff && ctx.sfx.puff(); } }
    traps = traps.filter(q => !q.dead);
  }

  /* ---------- WHAT THE GUIDE MAY GLINT (src/stuck-spots.js underleaf names them by type and tile) ---------- */
  H.props = () => (S ? [...S.beds, ...S.hedges, ...S.wells] : []);

  /* ---------- DRAWING ---------- */
  /* (claude/underleafart) the drawing is src/redraw/underleaf3_world.js: jars, shelves that visibly refill, brewpots, seed beds, thorn hedges, float wells, bubbles, patches, her cauldron */
  function drawJarShape(g, x, y, col) { UW.drawHeldJar(g, col, x, y, 0); }
  function drawShelf(g, j, cx, cy, time) { UW.drawShelf(g, j, cx, cy, time); }
  function drawJar(g, j, cx, cy, time) {
    UW.drawJar(g, j, cx, cy, time);
    const P = hero(), x = R(j.x - cx), y = R(j.y - cy);
    if (j.state === 'rest' && !P.carry && Math.abs(j.x - P.x) < 48 && Math.abs(j.y - P.y) < 32) { g.globalAlpha = 0.3 + 0.2 * Math.sin(time * 5 + j.hx); g.strokeStyle = COL[j.col][1]; g.beginPath(); g.arc(x, y - (j.brew ? 18 : 20), 10, 0, 7); g.stroke(); g.globalAlpha = 1; }
  }
  function drawBed(g, b, cx, cy, time) { UW.drawBed(g, b, cx, cy, time); }
  function drawHedge(g, h, cx, cy, time) { UW.drawHedge(g, h, cx, cy, time); }
  function drawWell(g, w, cx, cy, time) { UW.drawWell(g, w, cx, cy, time); }
  function drawBubble(g, b, cx, cy, time) { UW.drawBubble(g, b, cx, cy, time, JAR.bubbleR); }
  function drawPatch(g, p, cx, cy, time) { UW.drawPatch(g, p, cx, cy, time); }
  function drawBanner(g, time) { if (!S.banner) return; UW.drawBanner(g, S.banner.name, ctx.VW(), Math.min(1, S.banner.t, 3.4 - S.banner.t), ctx.text); }
  /* her cottage: the great cauldron at the back of the room (her landmark's heart): green and calm, boiling red in phase two */
  function drawCottage(g, cx, cy, time) { const a = L().arena; if (!a) return; const e = ctx.boss(), on = e && e.t === 'grandmother' && e.alive && e.gm3;
    const fury = !on ? 0 : e.mode === 'stirTell' || e.mode === 'stir' ? 1 : e.phase >= 3 ? 0.55 : 0; UW.drawCauldron(g, cauldronX(), a.floor, cx, cy, time, fury, on && e.mode === 'stir'); }
  H.drawWorld = (g, cx, cy, time) => {
    if (!S || !H.on()) return;
    UD.drawDress(g, cx, cy, ctx.VW(), time, UD.planDress(L(), T));   /* (claude/underleafart) what stands on her ground and hangs from her boards */
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
    for (const e of ctx.enemies()) if (e.alive && e.coatBurn > 0) { e.coatBurn -= 0.016; UW.drawCoatFire(g, e, cx, cy, time); }   /* the thorn-beast's coat burning off */
    for (const m of marks) UW.drawMark(g, m, cx, cy, time);
    for (const b of balls) UW.drawBall(g, b, cx, cy, time);
    for (const p of pots) UW.drawHurledJar(g, p, cx, cy, time);
    for (const q of gpatches) UW.drawGranPatch(g, q, A().floor, cx, cy, time);
    for (const q of traps) UW.drawBubble(g, { x: q.x, y: q.y, state: q.rider ? 'rise' : 'hover', t: q.t }, cx, cy, time, GM.trapR + (q.rider ? 6 : 0));   /* (claude/underleaf4) HER BUBBLE TRAPS */
    drawBanner(g, time);
  };
  const k0 = q => Math.floor(q.x);
  /* HER READ (B10): OPEN = the gold ring and its bar (floated); WARDED = a pale shell and, while the brood stands, a line to each of them */
  H.drawGran = (g, e, cx, cy, time) => {
    if (!e.gm3) return; const x = R(e.x - cx), y = R(e.y - cy), pul = 0.5 + 0.5 * Math.sin(time * 10), fy = R(A().floor - cy);
    { const lp = UG.LANTERN[UG.frameOf(e)]; if (lp) UW.glowAt(g, e.phase >= 3 ? "255,154,92" : e.phase === 2 ? "168,216,255" : "184,240,112", e.x - cx + e.face * (lp[0] - 28), e.y - cy - (60 - lp[1]), 54, 54, 0.38 + 0.12 * Math.sin(time * 7)); }   /* her witch-fire lantern lights her */
    /* (claude/underleaf4) HER GUARD, DRAWN: P1 a thorn hedge either side of her (burning when it goes), P2 the bubbles she hangs on, P3 her ring of cauldron fire */
    if (e.hedge || e.hedgeBurn > 0) { const tx = Math.floor(e.x / TS), ty = Math.round(A().floor / TS);
      for (const hx of [tx - 2, tx + 1]) UW.drawHedge(g, { x0: hx, x1: hx, y0: ty - 3, y1: ty - 1, burnt: false, burnT: e.hedge ? 0 : 0.6 - (e.hedgeBurn || 0) }, cx, cy, time); }
    if (e.aloft && e.mode !== 'opened') for (const k of [-1, 0, 1]) UW.drawBubble(g, { x: e.x + k * 12, y: e.y + 6 - (k ? 0 : 4), state: 'hover', t: time + k }, cx, cy, time, k ? 9 : 12);
    if (e.ring && e.mode !== 'floated') for (const k of [-2, -1, 0, 1, 2]) UW.drawGranPatch(g, { x: e.x + k * GM.ringR / 2, col: 'red', t: (time * 0.7 + k * 0.2) % 1 * 2, life: GM.patchLife }, A().floor, cx, cy, time);
    if (e.mode === 'opened' && e.phase === 2) { g.fillStyle = '#2e5a1c'; g.fillRect(x - 2, y - 24, 5, fy - y + 24); g.fillStyle = '#5fae3a'; g.fillRect(x - 1, y - 24, 3, fy - y + 24);
      for (let k = 0; k < 4; k++) { g.fillStyle = '#9be06a'; g.fillRect(x + (k % 2 ? 2 : -5), y - 20 + k * 8, 4, 2); } }   /* the vine that snared her down */
    if (e.mode === "floated") UW.drawBubble(g, { x: e.x, y: e.y - 24 + cy * 0, state: "hover", t: 0 }, cx, cy, time, 27);   /* the bubble she hangs in */
    if (isOpen(e)) { const k = Math.max(0, e.modeT / (e.openLen || GM.float));
      g.globalAlpha = 0.5 + 0.35 * pul; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 1, 18 + pul * 2, 5, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      g.fillStyle = '#1b1626'; g.fillRect(x - 21, y - 62, 42, 5); g.fillStyle = '#ffd36b'; g.fillRect(x - 20, y - 61, R(40 * k), 3); return; }
    if (guarded(e)) { g.globalAlpha = 0.22 + 0.12 * pul; g.strokeStyle = '#dfe8ff'; g.beginPath(); g.ellipse(x, y - 20, 16, 25, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      const c = COL[PH_COL[e.phase]]; g.fillStyle = '#1b1626'; g.fillRect(x - 5, y - 70, 10, 9); g.fillStyle = c[0]; g.fillRect(x - 3, y - 68, 6, 6); g.fillStyle = c[1]; g.fillRect(x - 2, y - 67, 2, 2);   /* the jar her guard breaks on, over her head */
      if (e.mode === 'reform') { g.fillStyle = '#1b1626'; g.fillRect(x - 21, y - 58, 42, 5); g.fillStyle = '#dfe8ff'; g.fillRect(x - 20, y - 57, R(40 * Math.max(0, e.modeT / GM.after)), 3); } }
  };
  /* her sprite's frame (main.js draws her with the old set until the art lane: B16 poses are its job) */
  H.granFrame = e => UG.frameOf(e);   /* (claude/underleafart) her own sheet: a pose for every move (src/redraw/underleaf3_gran.js) */

  /* ---------- THE WALKER'S HANDS (tools/level-walk.mjs via src/walk-hints.js): the next jar the route needs, and where it is thrown from ---------- */
  const needs = () => [...S.hedges.filter(h => !h.burnt).map(h => ({ kind: 'red', x: h.x0 * TS, y: (h.y1 + 1) * TS, o: h })),
    ...S.beds.filter(b => !b.grown).map(b => ({ kind: 'green', x: b.x, y: b.y, o: b })), ...S.wells.map(w => ({ kind: 'blue', x: w.x, y: w.y, o: w }))];
  H.walkHint = P => {
    if (!S || !H.on() || !P || P.dead) return null;
    const bb = S.bubbles.find(b => b.state === 'hover' && Math.abs(b.x - P.x) < 80 && Math.abs(b.y - P.y) < 40);
    if (bb) return { x: bb.x, y: P.y, key: null, face: 0, r: 6 };
    { const rb = S.bubbles.find(b => b.rider === 'P');   /* (claude/underleaf4) RIDING: steer to the nearest footing ahead the bubble rises past (a rack, a ledge, a lip) - not a blind run */
      if (rb) { const tx = Math.floor(P.x / TS), ty = Math.floor(P.y / TS), topRow = Math.floor((rb.y0 - (rb.max || JAR.riseMax)) / TS);
        const stand = (x, r) => { const u = ctx.tileAt(x, r + 1), a = ctx.tileAt(x, r); return (u === T.ONEWAY || u === T.SOLID) && a === T.AIR; };
        for (let dx = 0; dx <= 7; dx++) for (const sgn of dx ? [P.face || 1, -(P.face || 1)] : [1]) { const x = tx + dx * sgn; for (let r = ty - 1; r >= topRow; r--) if (stand(x, r)) return { x: x * TS + 8, y: r * TS, key: null, face: sgn, r: 4 }; }
        return { x: P.x + P.face * 30, y: P.y, key: null, face: P.face, r: 4 }; } }
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
    marks: marks.map(m => ({ x: m.x, r: m.r, kind: m.kind })), balls: balls.length, gpatches: gpatches.map(q => ({ x: q.x, col: q.col })), traps: traps.map(q => ({ x: q.x, y: q.y, rider: q.rider === 'P' })) } : null);
  H.state = () => S; H.marks = () => marks; H.gpatches = () => gpatches; H.traps = () => traps; H.broodOf = e => brood(e);
  return H;
}
