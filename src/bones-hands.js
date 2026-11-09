// src/bones-hands.js - THE SKELETON SET's HANDS (claude/beastsbones). src/bones.js is the rules (pure); this binds them to the game: the body (gravity, ledges, the blink), the told
// blows ('!' over a thrust / an aimed shot / a wisp, '!!' over a rush / a volley / a grave row), the soldier's ward (x0.4 into his front, the three breaks), the archer's arrows
// (flat and lobbed, with the volley's three marks), the mage's wisp (weakly homing, popped by a blow) and grave row (a travelling line of bone hands), and the drawing of all of it.
// main.js calls: owns, step (per foe), tick (once a frame: arrows, wisps, rows), take (a blow on it), parried (a hero parried its blow), drawFx (per foe), drawAir (the projectiles).
// Its teaching lines go through ctx.callout. Max one mage per room and archers 1-2 are PLACEMENT rules (src/bones-placements.js), not the hands'.
import * as B from './bones.js';

const NEW = { skelsoldier: B.newSkelSoldier, skelarcher: B.newSkelArcher, skelmage: B.newSkelMage };
const NAME = { skelsoldier: 'SKELETON SOLDIER', skelarcher: 'SKELETON ARCHER', skelmage: 'SKELETON MAGE' };
const TEACH = { skelsoldier: 'SKELETON SOLDIER: HIS SHIELD TURNS A CUT - PARRY HIS THRUST, HIT HIM HEAVY, OR GET BEHIND HIM',
  skelarcher: 'SKELETON ARCHER: BLOCK OR DUCK THE AIMED SHOT - STEP OUT OF THE DUST MARKS', skelmage: 'SKELETON MAGE: STRIKE THE WISP, JUMP THE GRAVE ROW - HE BLINKS AWAY WHEN YOU CLOSE' };

export function makeBonesHands(ctx) {
  const H = { arrows: [], wisps: [], rows: [], motes: [], n: { thrusts: 0, rushes: 0, shots: 0, volleys: 0, wisps: 0, rows: 0, blinks: 0, wards: 0, breaks: 0, pops: 0, parries: 0, hits: 0 } }, said = {};
  const once = k => { if (said[k]) return false; said[k] = 1; return true; };
  let tickAt = -1;
  H.owns = e => !!e && !!NEW[e.t];
  const init = e => { if (!e.st) e.st = NEW[e.t](e.x, e.y, e.face || -1); return e.st; };
  H.reset = () => { H.arrows = []; H.wisps = []; H.rows = []; H.motes = []; tickAt = -1; };
  const world = (e, s) => ({ heroes: ctx.heroes(), canStep: (x, dir) => ctx.canStep(e, dir), floorAt: x => ctx.floorAt(x, e.y), wallBetween: (a, b) => ctx.wallBetween(a, b, e.y - 6), canAttack: true });
  const heroBoxes = () => ctx.players().filter(pp => ctx.upright(pp) && !pp.dead);

  /* ONE FRAME OF ONE SKELETON */
  H.step = (e, dt) => {
    const s = init(e), P = ctx.hero(); if (!P) return;
    const g = () => { e.vy = Math.min(360, (e.vy || 0) + 1000 * dt); const r = ctx.move(e, 0, e.vy * dt, false); if (r && (r.ground || r.hitY)) e.vy = 0; };
    if (e.hp0 === undefined) e.hp0 = e.hp; e.hp0 = e.hp;
    if (Math.abs(e.x - P.x) > 520) { e.mode = s.mode; e.open = s.open; g(); return; }
    if (Math.abs(e.x - P.x) < 240) { ctx.seen(e.t); if (once('seen:' + e.t)) ctx.callout(TEACH[e.t]); }
    if (e.t === 'skelsoldier') e.stagger = 0;   /* a shield does not flinch: only a broken guard or a parry opens him */
    if (e.stagger > 0) { e.mode = s.mode; g(); return; }
    s.x = e.x; s.y = e.y;
    const x0 = e.x, evs = B.bonesStep(s, world(e, s), dt);
    if (s.vx) ctx.move(e, s.vx * dt, 0, false);
    g(); s.x = e.x; s.y = e.y; e.face = s.face || e.face; e.mode = s.mode; e.open = !!s.open; e.vx = (e.x - x0) / Math.max(dt, 1e-4); e.anim = (e.anim || 0) + dt;
    e.guardBroken = e.t === 'skelsoldier' && s.guard > 0;
    /* a rush hits the first hero its shield meets, once */
    if (s.mode === 'rush' && !s.hit) for (const pp of heroBoxes()) { if (Math.abs(pp.x - (e.x + s.face * 6)) < 11 && Math.abs(pp.y - e.y) < 18) { const r = ctx.hit(pp, e.x, B.BONE_SOLDIER.rushDmg, e, NAME[e.t], { unblockable: true }); s.hit = true; if (r.landed) H.n.hits++; } }
    for (const v of evs) {
      if (v.t === 'thrustTell') { ctx.mark(e, '!', '#ffd36b'); ctx.sfx('thrustTell'); }
      else if (v.t === 'thrust') { H.n.thrusts++; ctx.sfx('thrust'); strikeBox(e, s, v); }
      else if (v.t === 'rushTell') { ctx.mark(e, '!!', '#ff6b6b'); ctx.sfx('rushTell'); }
      else if (v.t === 'rush') { H.n.rushes++; ctx.sfx('rush'); ctx.burst(e.x - s.face * 6, e.y - 2, 5, ['#8a7a5a', '#b8a888'], 50, 0.4); }
      else if (v.t === 'rushEnd') { if (!v.hit && once('rushTold')) ctx.callout('A JUMP CLEARS THE SHIELD RUSH - AND HIS BACK IS OPEN'); }
      else if (v.t === 'aimTell') { ctx.mark(e, '!', '#ffd36b'); ctx.sfx('aimTell'); }
      else if (v.t === 'aim') { H.n.shots++; ctx.sfx('aim'); H.arrows.push({ kind: 'flat', x: v.x, y: v.y, vx: v.vx, vy: v.vy, dmg: v.dmg, owner: e, name: NAME[e.t], t: 0, hitSet: new Set() }); }
      else if (v.t === 'volleyTell') { ctx.mark(e, '!!', '#ff6b6b'); ctx.sfx('volleyTell');
        for (const x of v.spots) H.motes.push({ x, y: ctx.floorY(x, e.y - 4), t: B.BONE_ARCHER.volleyTell + B.BONE_ARCHER.volleyFlight + B.BONE_ARCHER.volleyStagger * 2 + 0.2, owner: e }); }
      else if (v.t === 'volley') { H.n.volleys++; if (v.delay === 0) ctx.sfx('volley'); H.arrows.push({ kind: 'lob', x: v.x, y: v.y, toX: v.toX, floorY: ctx.floorY(v.toX, e.y - 4), delay: v.delay, flight: v.flight, dmg: v.dmg, owner: e, name: NAME[e.t], t: 0 }); }
      else if (v.t === 'wispTell') { ctx.mark(e, '!', '#ffd36b'); ctx.sfx('wispTell'); }
      else if (v.t === 'wisp') { H.n.wisps++; ctx.sfx('wisp'); H.wisps.push({ x: v.x, y: v.y, vx: v.vx, vy: v.vy, dmg: v.dmg, owner: e, name: NAME[e.t], t: 0, alive: true }); }
      else if (v.t === 'graveTell') { ctx.mark(e, '!!', '#ff6b6b'); ctx.sfx('graveTell'); }
      else if (v.t === 'grave') { H.n.rows++; ctx.sfx('grave'); const row = B.newGraveRow(v.x, v.dir); row.y = e.y; row.dmg = v.dmg; row.owner = e; row.name = NAME[e.t]; H.rows.push(row); }
      else if (v.t === 'backstepTell') { ctx.sfx('backstepTell'); ctx.burst(e.x, e.y - 10, 8, ['#9ff0c0', '#d8ffe8'], 40, 0.35, -40); }
      else if (v.t === 'blink') { H.n.blinks++; e.x = v.to; s.x = v.to; s.blinkAnim = e.anim || 0; ctx.burst(v.from, e.y - 10, 8, ['#9ff0c0', '#d8ffe8'], 40, 0.35, -40); ctx.burst(v.to, e.y - 10, 8, ['#9ff0c0', '#d8ffe8'], 40, 0.35, -40); ctx.number(e.x, e.y - e.h - 8, B.BONE_SAY.blink, '#9ff0c0'); }
    }
  };
  /* a melee blow with a box: the first hero in it, once; a PARRY opens the soldier */
  function strikeBox(e, s, v) {
    const [l, r, t, b] = v.box;
    for (const pp of heroBoxes()) { const hb = ctx.hurtBox(pp); if (!(l < hb.r && r > hb.l && t < hb.b && b > hb.t)) continue;
      const res = ctx.hit(pp, e.x, v.dmg, e, NAME[e.t], {}); if (res.landed) H.n.hits++; if (res.parried) H.parry(e); break; }
  }
  /* THE HERO'S PARRY of this foe's blow */
  H.parry = e => { const s = init(e); if (e.t === 'skelsoldier' && B.soldierParried(s)) { H.n.parries++; e.mode = s.mode; ctx.number(e.x, e.y - e.h - 8, B.BONE_SAY.open, '#ffd36b'); ctx.sfx('open'); } };
  H.parried = H.parry;

  /* ONCE A FRAME: arrows, wisps, the grave rows, the volley's marks */
  H.tick = (dt, time) => {
    if (time === tickAt) return; tickAt = time;
    H.motes = H.motes.filter(m => (m.t -= dt) > 0);
    H.arrows = H.arrows.filter(a => {
      if (a.kind === 'flat') {
        a.t += dt; a.x += a.vx * dt; a.y += a.vy * dt; if (a.t > 1.6 || ctx.solidAt(a.x, a.y)) { if (ctx.solidAt(a.x, a.y)) ctx.burst(a.x, a.y, 3, ['#d8d0b8', '#8a7a5a'], 40, 0.25); return false; }
        for (const pp of heroBoxes()) { const hb = ctx.hurtBox(pp); if (a.x > hb.l - 2 && a.x < hb.r + 2 && a.y > hb.t - 2 && a.y < hb.b + 2) { ctx.hit(pp, a.x - Math.sign(a.vx) * 8, a.dmg, a.owner, a.name, { pierce: false }); H.n.hits++; return false; } }
        return true; }
      a.t += dt; const tt = a.t - a.delay; if (tt < 0) return true;
      if (tt >= a.flight) {   /* the lobbed arrow lands: a small burst of bone dust, a blow on whoever stands in the mark */
        ctx.burst(a.toX, a.floorY - 2, 6, ['#d8d0b8', '#8a7a5a', '#b8a888'], 50, 0.4); ctx.sfx('arrowLand');
        for (const pp of heroBoxes()) if (Math.abs(pp.x - a.toX) <= 9 && Math.abs(pp.y - a.floorY) < 22) { ctx.hit(pp, a.toX, a.dmg, a.owner, a.name, { unblockable: true }); H.n.hits++; }
        return false; }
      return true;
    });
    H.wisps = H.wisps.filter(b => {
      if (!b.alive) return false;
      let tgt = null, bd = 1e9; for (const pp of heroBoxes()) { const d = Math.abs(pp.x - b.x) + Math.abs(pp.y - 8 - b.y); if (d < bd) { bd = d; tgt = { x: pp.x, y: pp.y - 8 }; } }
      B.wispStep(b, tgt, dt); if (!b.alive) { ctx.burst(b.x, b.y, 5, ['#9ff0c0', '#d8ffe8'], 40, 0.3); return false; }
      if (ctx.solidAt(b.x, b.y)) { ctx.burst(b.x, b.y, 5, ['#9ff0c0'], 40, 0.3); return false; }
      for (const pp of heroBoxes()) {
        const sb = ctx.strikeBox(pp); if (sb && b.x > sb.l - 3 && b.x < sb.r + 3 && b.y > sb.t - 3 && b.y < sb.b + 3) { H.n.pops++; ctx.burst(b.x, b.y, 8, ['#9ff0c0', '#ffffff'], 70, 0.35); ctx.number(b.x, b.y - 10, B.BONE_SAY.popped, '#9ff0c0'); ctx.sfx('wispPop'); return false; }
        const hb = ctx.hurtBox(pp); if (b.x > hb.l - 3 && b.x < hb.r + 3 && b.y > hb.t - 3 && b.y < hb.b + 3) { ctx.hit(pp, b.x - Math.sign(b.vx || 1) * 8, b.dmg, b.owner, b.name, {}); H.n.hits++; ctx.burst(b.x, b.y, 6, ['#9ff0c0'], 50, 0.3); return false; } }
      return true;
    });
    H.rows = H.rows.filter(r => {
      if (!r.alive) return false;
      B.graveStep(r, dt); const fy = ctx.floorY(r.x, r.y - 6); if (Math.abs(fy - r.y) > 14) { r.alive = false; return false; } r.y = fy;
      if (Math.random() < dt * 30) ctx.burst(r.x, r.y - 2, 1, ['#d8d0b8', '#8a7a5a'], 30, 0.3);
      for (const pp of heroBoxes()) { if (r.hit.has(pp)) continue; if (B.graveHits(r, pp, r.y)) { r.hit.add(pp); ctx.hit(pp, r.x - r.dir * 8, r.dmg, r.owner, r.name, { unblockable: true }); H.n.hits++; } }
      return r.alive;
    });
  };

  /* A BLOW ON IT: the soldier's ward (x0.4 into his front, clank, WARDED), the three breaks; an archer's or a mage's cast is cut by any blow. b = { fromX, heavy, plunge }. Returns the damage to take. */
  H.take = (e, dmg, b) => {
    const s = init(e);
    if (e.t === 'skelsoldier') { const r = B.soldierTake(s, b);
      if (r.why === 'front') { H.n.wards++; e.chipHit = ctx.time(); ctx.clank(e, b.fromX); if (!(e.wardSaid > ctx.time())) { e.wardSaid = ctx.time() + 1.4; ctx.number(e.x, e.y - e.h - 6, B.BONE_SAY.ward, '#c8ccd4'); } if (once('wardTold')) ctx.callout('HIS SHIELD TURNS A CUT: PARRY HIS THRUST, HIT HIM HEAVY, OR GET BEHIND HIM'); }
      else if (r.why === 'heavy') { H.n.breaks++; B.soldierStruck(s, 'heavy'); e.mode = s.mode; ctx.number(e.x, e.y - e.h - 6, B.BONE_SAY.broke, '#ffd36b'); ctx.sfx('open'); }
      else if (r.why === 'behind') ctx.number(e.x, e.y - e.h - 6, B.BONE_SAY.behind, '#ffd36b');
      return dmg * r.k; }
    if (B.bonesStruck(s) === 'cancel') e.mode = s.mode;
    return dmg;
  };

  /* THE SHOTS IN THE AIR (drawn over the level) and the marks on the floor */
  H.drawAir = (g, cx, cy, time) => {
    for (const m of H.motes) { const k = 0.5 + 0.5 * Math.sin(time * 14 + m.x), x = Math.round(m.x - cx), y = Math.round(m.y - cy); g.fillStyle = 'rgba(216,208,184,' + (0.45 + 0.4 * k) + ')'; g.fillRect(x - 5, y - 1, 10, 1); g.fillRect(x - 2, y - 4 - Math.round(2 * k), 1, 2); g.fillRect(x + 2, y - 5 - Math.round(2 * k), 1, 2); g.fillStyle = '#ff6b6b'; g.fillRect(x - 1, y - 1, 2, 1); }
    for (const a of H.arrows) { if (a.kind === 'flat') { const x = Math.round(a.x - cx), y = Math.round(a.y - cy), d = Math.sign(a.vx) || 1; g.fillStyle = '#d8d0b8'; g.fillRect(x - (d > 0 ? 6 : 0), y, 6, 1); g.fillStyle = '#6e4a2a'; g.fillRect(x - (d > 0 ? 6 : 0) + (d > 0 ? 0 : 4), y, 2, 1); }
      else if ((a.t - a.delay) > 0) { const p = B.lobAt(a, a.t - a.delay), x = Math.round(p.x - cx), y = Math.round(p.y - cy); g.fillStyle = '#d8d0b8'; g.fillRect(x - 1, y - 3, 1, 5); g.fillStyle = '#6e4a2a'; g.fillRect(x - 1, y - 4, 1, 1); } }
    for (const b of H.wisps) { const x = Math.round(b.x - cx), y = Math.round(b.y - cy), f = 0.5 + 0.5 * Math.sin(b.t * 18); g.fillStyle = '#9ff0c0'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#d8ffe8'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#1a1410'; g.fillRect(x - 2, y - 1, 1, 1); g.fillRect(x + 1, y - 1, 1, 1);
      g.globalAlpha = 0.5 * f; g.fillStyle = '#9ff0c0'; g.fillRect(x - 5, y - 1, 10, 2); g.fillRect(x - 1, y - 5, 2, 10); g.globalAlpha = 1; }
    for (const r of H.rows) { const x = Math.round(r.x - cx), y = Math.round(r.y - cy); g.fillStyle = '#7a6c52'; g.fillRect(x - 6 - r.dir * 3, y - 1, 12, 1);
      for (let i = 0; i < 3; i++) { const hx = x - r.dir * i * 4, hh = 8 - i * 2; g.fillStyle = '#e0d4b8'; g.fillRect(hx - 1, y - hh, 2, hh); g.fillStyle = '#b8a888'; g.fillRect(hx - 2, y - hh, 1, 2); g.fillRect(hx + 1, y - hh, 1, 2); } }
  };
  /* PER FOE: the archer's glint line along his aim, the mage's orb over the staff */
  H.drawFx = (g, e, cx, cy, time) => {
    const s = e.st; if (!s || !e.alive) return;
    if (e.t === 'skelarcher' && s.mode === 'aimTell') { const x0 = Math.round(e.x + s.face * 6 - cx), y0 = Math.round(e.y - 12 - cy), x1 = Math.round(s.aimX - cx), y1 = Math.round(s.aimY - cy), n = 14;
      g.fillStyle = 'rgba(159,240,192,' + (0.35 + 0.5 * (1 - s.t / B.BONE_ARCHER.aimTell)) + ')'; for (let i = 1; i <= n; i += 2) g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1); }
    if (e.t === 'skelmage' && s.mode === 'wispTell') { const k = 1 - s.t / B.BONE_MAGE.wispTell, x = Math.round(e.x + s.face * 9 - cx), y = Math.round(e.y - 28 - cy); g.fillStyle = '#9ff0c0'; g.fillRect(x - Math.round(1 + 3 * k), y - Math.round(1 + 3 * k), 2 + Math.round(6 * k), 2 + Math.round(6 * k)); }
    if (e.t === 'skelmage' && s.mode === 'graveTell') { const k = 1 - s.t / B.BONE_MAGE.graveTell, x = Math.round(e.x + s.face * 12 - cx), y = Math.round(e.y - cy); g.fillStyle = 'rgba(159,240,192,' + (0.3 + 0.5 * k) + ')'; for (let i = 0; i < 6; i++) g.fillRect(x + s.face * i * 6, y - 1, 3, 1); }
    if (e.t === 'skelsoldier' && s.guard > 0) { g.fillStyle = '#ffd36b'; g.fillRect(Math.round(e.x - cx) - 2, Math.round(e.y - e.h - 3 - cy), 4, 1); }
  };
  H.read = () => ({ ...H.n, arrows: H.arrows.length, wisps: H.wisps.length, rows: H.rows.length });
  return H;
}

/* the sprite frame of each skeleton (src/redraw/bones_art.js): idle 0,1 | walk 2-5 | the tells and blows | hurt | (the last frame is the collapse heap) */
export function boneFrame(e) {
  const s = e.st || e, m = s.mode || e.mode, walk = 2 + Math.floor((e.anim || 0) * 6) % 4, idle = Math.floor((e.anim || 0) * 1.5) % 2, moving = Math.abs(e.vx || 0) > 4;
  if (e.t === 'skelsoldier') return e.hurtT > 0 ? 11 : ({ thrustTell: 6, thrust: 7, rushTell: 8, rush: 9, stunned: 10 })[m] ?? (moving ? walk : idle);
  if (e.t === 'skelarcher') return e.hurtT > 0 ? 10 : ({ aimTell: 6, aim: 7, volleyTell: 8, volley: 9 })[m] ?? (moving ? walk : idle);
  return e.hurtT > 0 ? 12 : ({ wispTell: 6, wisp: 7, graveTell: 8, grave: 9, backstepTell: 10 })[m] ?? (s.blinked && (e.anim || 0) - (s.blinkAnim || -9) < 0.2 ? 11 : moving ? walk : idle);
}
