/* src/airship-hands.js - THE DESERT AIRSHIP's hands (claude/airship, 11-06, OPUS greybox): binds the level's pure rules to the world and draws them in greybox.
   Only a level with L.airship (behind ?airship=1, src/airship.js asOn) wakes it; every main.js hunk asks on() / owns() first, so no other level pays anything.
     THE SHIP      src/airship.js newShip/shipStep: the burners' fuel, the LIFT, the ALTITUDE; HOLD E (or UP) at a burner = STOKE, at a valve = VENT
     THE BANDS     HIGH spars / LOW gangways are laid (one-way planks) while their band holds and taken up when it goes - BLINKING first (ALT.warnT, told)
     THE COLD      src/drain.js (the shared A13 drain, its 2nd environment source): HIGH and not warm fills the COLD bar; full, it drains (floor 1 hp)
     THE KEEL      LOW: the dunes brush the keel through the hold's breaches (a shadow, then the sand: a told unblockable blast)
     THE BROOD     src/wyrmling.js: the wyrmlings' blows and their element on a hero (SHOCK: jitter + stamina sap; a roll or warmth cleanses)
     THE WYRM      src/thunder-wyrm.js on the storm deck: his marks, bolts, coils, roar, tail, brood; the lure onto a stoked burner; THE CRASH after
   ctx (main.js): { L, players, TS, T, sfx, hero, enemies, boss, bossActive, time, keys, EHP, cellSet, tileAt, number, text, damagePlayer, asPlayer, upright,
                    overlap, box, burst, dust, ring, shake, sparks, drain(rate, o), drainStop(), music(name), spawnFoe(t, tx, ty, o), VW(), VH() } */
import { newShip, shipStep, holdAt, bandLeaving, coldStep, brushStep, STOKE, COLD, BRUSH, band as bandOf } from './airship.js';
import { WYRMLING, ELEMENT, newWyrmling, wyrmStep, wyrmStagger, elementApply, elementStep, elementOf } from './wyrmling.js';
import { TW, newFight, stepWyrm, twTake, twBarName, MOVE_NAME } from './thunder-wyrm.js';

export function makeAirshipHands(ctx) {
  const H = {}; let S = null, F = null;   /* S: the ship and the level's state; F: the wyrm's fight */
  const TS = ctx.TS, R = Math.round;
  H.on = () => !!(ctx.L && ctx.L.airship);
  H.state = () => S;
  H.fight = () => F;
  const snd = k => { const f = ctx.sfx && ctx.sfx[k]; if (typeof f === 'function') try { f.call(ctx.sfx); } catch { /* a sound the art lane owes */ } };
  const px = s => ({ x: s.x * TS + 8, y: (s.y + 1) * TS });
  function fresh() {
    const L = ctx.L, A = L.airship;
    S = { L, ship: newShip(A.stations.map(s => ({ ...s, ...px(s), tx: s.x, ty: s.y }))), laid: {}, brush: A.keelBrush.map(z => ({ ...z, ph: 'rest', t: BRUSH.rest })), said: {}, crash: 0 };
    for (const b of A.bandDecks) layBand(b, false);
  }
  function layBand(b, on) { const k = b.x0 + ':' + b.row; if (!!S.laid[k] === on) return; S.laid[k] = on; for (let x = b.x0; x <= b.x1; x++) ctx.cellSet(x, b.row, on ? ctx.T.ONEWAY : ctx.T.AIR); }
  H.clear = () => { if (!H.on()) { S = null; F = null; return; } if (S && S.L === ctx.L) for (const b of ctx.L.airship.bandDecks) layBand(b, false); fresh(); F = null;
    for (const pp of ctx.players) { pp.asCold = { v: 0 }; pp.wlEl = null; pp.asKeys = null; } ctx.drainStop && ctx.drainStop(); };
  const ensure = () => { if (!S || S.L !== ctx.L) fresh(); };
  const hot = id => { const s = S.ship.stations.find(q => q.id === id); return !!(s && s.fuel > 0); };
  const warmAt = (x, y) => S.ship.stations.some(s => s.kind === 'stoke' && s.fuel > 0 && Math.hypot(s.x - x, s.y - y) < COLD.warmR) || (ctx.L.airship.braziers || []).some(b => Math.hypot(b.x * TS + 8 - x, (b.y + 1) * TS - y) < COLD.warmR);
  H.band = () => (S ? bandOf(S.ship.alt) : 'low');
  const keyed = (pp, key) => { pp.asKeys = pp.asKeys || new Set(); if (pp.asKeys.size > 120) pp.asKeys.clear(); if (pp.asKeys.has(key)) return true; pp.asKeys.add(key); return false; };

  /* ---------- THE LEVEL'S FRAME (updateProps) ---------- */
  H.update = dt => {
    ensure(); const P = ctx.hero(), keys = ctx.keys(), ship = S.ship;
    /* STOKE / VENT: hold E (talk) or UP, on your feet, at a station */
    const held = (keys.talk || keys.up) && P.ground && !P.dead && !(P.atk >= 0);
    let at = null; if (held) at = ship.stations.find(s => Math.abs(s.x - P.x) < STOKE.reach && Math.abs(s.y - P.y) < 20);
    for (const s of ship.stations) if (s !== at) s.prog = 0;
    if (at) { const r = holdAt(ship, at, dt);
      if (r === 'stoked') { snd('stoke'); ctx.burst(at.x, at.y - 14, 10, ['#ff9a3c', '#ffd36b', '#fff1c8'], 60, 0.5); ctx.number(at.x, at.y - 30, 'STOKED', '#ffd36b');
        if (!S.said.stoke) { S.said.stoke = 1; ctx.number(P.x, P.y - 48, 'SHE CLIMBS', '#ffd36b'); } }
      if (r === 'vented') { snd('steam'); ctx.burst(at.x, at.y - 12, 14, ['#e8f4ff', '#bfe6f5'], 80, 0.6); ctx.number(at.x, at.y - 30, 'VENTED - SHE SINKS', '#bfe6f5'); } }
    /* THE ALTITUDE and its told edges */
    for (const v of shipStep(ship, dt)) {
      if (v.ev === 'high') { ctx.number(P.x, P.y - 52, 'THE CLOUD LINE - THE SPARS MEET', '#bfe6f5'); ctx.shake && ctx.shake(2); snd('creak'); }
      else if (v.ev === 'unhigh') { ctx.number(P.x, P.y - 52, 'SHE SINKS OUT OF THE CLOUD', '#9ab0c0'); snd('creak'); }
      else if (v.ev === 'low') { ctx.number(P.x, P.y - 52, 'SHE RIDES LOW - THE DUNES TOUCH THE KEEL', '#e0c090'); snd('creak'); }
      else if (v.ev === 'unlow') snd('creak');
      else if (v.ev === 'out') { const s = ship.stations.find(q => q.id === v.id); if (s && Math.abs(s.x - P.x) < 320) ctx.number(s.x, s.y - 26, 'BURNER OUT', '#9a8a7a'); } }
    for (const b of ctx.L.airship.bandDecks) layBand(b, b.band === 'high' ? ship.bands.high : ship.bands.low);
    /* THE KEEL BRUSH (LOW): a shadow, then the sand */
    for (const z of S.brush) { const e = brushStep(z, dt, ship.bands.low);
      if (e === 'hit') { const bx = { l: z.x0 * TS, r: (z.x1 + 1) * TS, t: (z.row - 1) * TS, b: (z.row + 1) * TS };
        ctx.burst((z.x0 + z.x1) / 2 * TS, z.row * TS, 16, ['#e0c090', '#c8a070', '#8a6a3a'], 90, 0.5); snd('sandBlast');
        for (const pp of ctx.players) ctx.asPlayer(pp, () => { const Q = ctx.hero(); if (Q.dead || !ctx.overlap(bx, ctx.box(Q))) return; ctx.damagePlayer(z.x0 * TS, BRUSH.dmg, { unblockable: true, name: 'THE KEEL BRUSH' }); }); } }
    /* THE COLD (the lead hero: the shared drain is his - co-op seats owed) and THE ELEMENT on him */
    const c = P.asCold || (P.asCold = { v: 0 }), warm = warmAt(P.x, P.y), rate = coldStep(c, dt, { high: ship.bands.high, warm });
    if (rate > 0) ctx.drain(rate, { name: 'THE COLD', die: 'THE COLD', col: '#bfe6f5', floor: COLD.floor }); else ctx.drainStop();
    if (c.v >= 1 && !S.said.cold && ship.bands.high) { S.said.cold = 1; ctx.number(P.x, P.y - 40, 'THE COLD BITES - STAND BY A STOKED BURNER', '#bfe6f5'); }
    const el = elementStep(P, dt, { roll: P.dodge > 0, warm });
    if (el) { if (el.cleansed) ctx.number(P.x, P.y - 30, el.cleansed === 'roll' ? 'SHAKEN OFF' : 'THE WARMTH CLEARS IT', '#8fd160');
      if (el.jitter) P.vx *= 0.35; if (el.sap && P.maxSt) P.st = Math.max(0, (P.st || 0) - P.maxSt * el.sap);
      if (el.slow) P.vx *= el.slow; }   /* (FIRE's burn dps: the mountain lane's, with its skin) */
    if (S.crash > 0) { S.crash -= dt; if (Math.random() < dt * 8) ctx.shake && ctx.shake(3); }
  };

  /* ---------- THE FOES ---------- */
  H.owns = e => !!e && (e.t === 'wyrmling' || e.t === 'thunderwyrm');
  H.spawnFoe = (base, e) => { ensure();
    if (e.t === 'wyrmling') { const st = newWyrmling(base.x, base.y - 8, e.el || 'shock'); return { ...base, t: 'wyrmling', w: WYRMLING.w, h: WYRMLING.h, hp: WYRMLING.hp, maxHp: WYRMLING.hp, noGrav: true, st, face: -1, mode: 'idle', brood: !!e.brood }; }
    return null; };
  H.spawnBoss = base => { ensure(); const A = ctx.L.arena; if (!A || A.boss !== 'thunderwyrm') return null; const q = A.tw;
    const G = { x0: A.x0, x1: A.x1, floorY: A.floor, burners: q.burners.map((x, i) => ({ id: 'storm' + i, x: x * TS + 8 })), stump: { x0: q.stump * TS, x1: (q.stump + 1) * TS, top: (q.D - 3) * TS } };
    F = newFight(G); const hp = (ctx.EHP && ctx.EHP.thunderwyrm) || TW.hp;
    return { ...base, t: 'thunderwyrm', w: TW.w, h: TW.h, hp, maxHp: hp, noGrav: true, markH: TW.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, x: F.head.x, y: F.head.y + TW.h / 2 }; };
  const wlHit = (e, box, dmg, name, key, el, blockable) => { let landed = false;
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !ctx.upright(pp) || !ctx.overlap({ l: box[0], r: box[1], t: box[2], b: box[3] }, ctx.box(P)) || keyed(pp, key)) return;
      const hp0 = P.hp, r = ctx.damagePlayer(e.x, dmg, { who: e, name, unblockable: !blockable });
      if (r !== 'blocked' && P.hp < hp0) { landed = true; if (el) { elementApply(P, el); const E = elementOf(el); ctx.number(P.x, P.y - 34, E.word, E.col); snd('shock'); } } });
    return landed; };
  H.foeUpdate = (e, dt) => { ensure(); const P = ctx.hero();
    if (e.t !== 'wyrmling') return; const s = e.st;
    if (Math.abs(e.x - P.x) > 480) return;
    for (const v of wyrmStep(s, dt, { px: P.x, py: P.y, time: ctx.time() })) {
      if (v.ev === 'tell') { ctx.number(s.x, s.y - 18, v.move === 'spitTell' ? '!!' : '!', v.move === 'spitTell' ? '#ff6b6b' : '#ffd36b'); snd(v.move === 'spitTell' ? 'wyrmSpitTell' : 'wyrmCoil'); }
      else if (v.ev === 'spit') snd('wyrmSpit');
      else if (v.ev === 'glob') { if (wlHit(e, v.box, v.dmg, 'A WYRMLING\'S SPARK', v.key, null, false) && s.glob) s.glob = null; }
      else if (v.ev === 'bite') wlHit(e, v.box, v.dmg, 'A WYRMLING\'S BITE', v.key, v.el, true);
      else if (v.ev === 'pop') ctx.burst(v.x, v.y, 6, [ELEMENT[s.el].col, ELEMENT[s.el].glow], 50, 0.3); }
    e.x = s.x; e.y = s.y + WYRMLING.h / 2; e.face = s.face; e.mode = s.mode; };
  H.stomped = e => { if (e && e.t === 'wyrmling') wyrmStagger(e.st); };
  H.broodAlive = () => ctx.enemies().filter(q => q.alive && q.t === 'wyrmling' && q.brood && q.x >= (ctx.L.arena ? ctx.L.arena.x0 : 0)).length;

  /* ---------- THE WYRM ---------- */
  function world(e) {
    const ship = S.ship, st = id => ship.stations.find(q => q.id === id);
    return {
      heroes: () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, pp })),
      hot, spend: id => { const s = st(id); if (s) { s.fuel = 0; s.overload = 0.6; } }, fail: id => { const s = st(id); if (s) { s.fuel = 0; ctx.burst(s.x, s.y - 12, 8, ['#9ab0c0', '#5a6a7a'], 40, 0.5); } },
      band: () => bandOf(ship.alt),
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp; ctx.damagePlayer(o.toRail ? (P.x < (F.G.x0 + F.G.x1) / 2 ? P.x + 20 : P.x - 20) : e.x, d, { who: e, name, unblockable: !o.blockable, low: !!o.low }); if (P.hp < hp0) any = true; }); return any; },
      roar: (fromX, d) => { const G = F.G; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead || !P.ground) return;
          const braced = (fromX < G.stump.x0 && P.x > G.stump.x1 && P.x - G.stump.x1 < 40) || (fromX > G.stump.x1 && P.x < G.stump.x0 && G.stump.x0 - P.x < 40);
          if (braced) { if (!S.said.brace) { S.said.brace = 1; ctx.number(P.x, P.y - 30, 'BRACED', '#8fd160'); } return; }
          const r = ctx.damagePlayer(fromX, d, { who: e, name: MOVE_NAME.roar }); if (r !== 'blocked') P.vx = Math.sign(P.x - fromX || 1) * 260; }); },
      brood: (x, y) => !!ctx.spawnFoe('wyrmling', Math.floor(x / TS), Math.floor(y / TS), { el: 'shock', brood: true }),
      broodAlive: () => H.broodAlive(),
      say: (x, y, t, c) => ctx.number(x, y, t, c), sound: k => snd('tw' + k[0].toUpperCase() + k.slice(1)),
      fx: (k, x, y) => {
        if (k === 'ground') { ctx.burst(x, y - 20, 26, ['#e8f6ff', '#9ad8ff', '#ffd36b'], 160, 0.6); ctx.ring(x, y - 10, 40, '#9ad8ff'); ctx.shake && ctx.shake(5); }
        else if (k === 'bolt') { ctx.burst(x, y - 10, 14, ['#e8f6ff', '#9ad8ff'], 120, 0.4); ctx.ring(x, y - 4, TW.markR, '#9ad8ff'); }
        else if (k === 'open') ctx.ring(x, y, 34, '#ffd36b');
        else if (k === 'ward') ctx.ring(x, y, 36, '#9ab0c0');
        else if (k === 'slam') { ctx.shake && ctx.shake(6); ctx.dust(x, y, 10); }
        else if (k === 'headUp') ctx.ring(x, y, 28, '#bfe6f5');
        else if (k === 'roar') { ctx.ring(x, y, 80, '#c8b0ff'); ctx.shake && ctx.shake(4); } },
      music: ph => { if (ctx.music) ctx.music(ph > 1 ? 'boss3' : 'boss3'); },   /* (music owed: 'thunderwyrm' / 'thunderwyrm:p2' once the track exists) */
    };
  }
  H.bossUpdate = (e, dt) => { ensure(); if (!F || !e.alive) return;
    if (e.mode === 'wake') { e.modeT -= dt; if (!F.woke) { F.woke = true; ctx.number(F.head.x, F.G.floorY - 90, 'THE THUNDER WYRM', '#c8b0ff'); snd('twRoarTell'); } if (e.modeT <= 0) { e.mode = 'rest'; F.t = 0.6; } }
    else stepWyrm(e, F, dt, world(e));
    e.x = F.head.x; e.y = F.head.y + TW.h / 2; e.phase = F.ph; e.open = F.open; };
  H.take = (e, dmg) => {
    if (e.t === 'wyrmling') return dmg;
    if (e.t !== 'thunderwyrm' || !F) return dmg;
    const r = twTake(e, F, dmg);
    if (r.word) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = r.word; ctx.sfx.clank && ctx.sfx.clank(); }
    return r.dmg; };
  H.barName = e => twBarName(e, F);
  H.end = e => { for (const q of ctx.enemies()) if (q.alive && q.t === 'wyrmling' && q.brood) q.alive = false;
    S.crash = 3.2; ctx.number(e.x, e.y - 70, 'HIS OWN LIGHTNING TAKES HIM', '#c8b0ff');
    ctx.number(e.x, e.y - 40, 'THE HULL BREAKS - SHE FALLS THROUGH THE CLOUD', '#ffd36b');
    ctx.number(e.x, e.y - 10, 'THE ROAD CONTINUES - FROSTFALL PASS (COMING SOON)', '#e8f4ff'); };
  H.read = () => F && { mode: ctx.boss && ctx.boss.mode, ph: F.ph, n: { ...F.n }, open: F.open, ward: F.ward, headUp: F.headUp, band: H.band() };

  /* ---------- DRAWING (GREYBOX) ---------- */
  const flick = (time, hz = 8) => Math.floor(time * hz) % 2 === 0;
  H.draw = (g, cx, cy, time) => { if (!S) return; const A = ctx.L.airship;
    /* THE BURNERS (brass pots; the flame's height is the fuel; dims under STOKE.dimAt) and THE VENTS (brass valves) */
    for (const s of S.ship.stations) { const x = R(s.x - cx), y = R(s.y - cy);
      if (s.kind === 'vent') { g.fillStyle = '#b08a3a'; g.fillRect(x - 3, y - 12, 6, 12); g.fillStyle = '#e8c860'; g.fillRect(x - 6, y - 14, 12, 3); if (s.prog > 0) { g.fillStyle = '#e8f4ff'; g.fillRect(x - 6, y - 18, R(12 * s.prog / STOKE.ventHold), 2); } continue; }
      g.fillStyle = '#7a5a2a'; g.fillRect(x - 6, y - 10, 12, 10); g.fillStyle = '#d8b050'; g.fillRect(x - 7, y - 11, 14, 2); g.fillRect(x - 7, y - 5, 14, 1);
      const k = s.fuel / STOKE.fuel, h = s.fuel > 0 ? 6 + 14 * Math.min(1, k * 1.4) * (s.fuel < STOKE.dimAt ? 0.6 + 0.4 * Math.sin(time * 9) : 1) : 2;
      g.fillStyle = s.fuel > 0 ? '#ff8a2a' : '#4a3a2a'; g.fillRect(x - 3, y - 11 - h, 6, h); if (s.fuel > 0) { g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 11 - h * 0.7, 2, h * 0.7); }
      if (s.overload > 0) { s.overload -= 1 / 60; g.fillStyle = '#e8f6ff'; g.fillRect(x - 8, y - 30, 16, 20); }
      if (s.prog > 0) { g.fillStyle = '#ffd36b'; g.fillRect(x - 8, y - 36, R(16 * s.prog / STOKE.hold), 2); } }
    /* THE BANDED DECKS: laid = a brass-shod spar / gangway; taken up = a ghost line; leaving = blinking */
    for (const b of A.bandDecks) { const on = !!S.laid[b.x0 + ':' + b.row], leaving = on && bandLeaving(S.ship, b.band), x0 = R(b.x0 * TS - cx), x1 = R((b.x1 + 1) * TS - cx), y = R(b.row * TS - cy);
      if (on && !(leaving && flick(time, 10))) { g.fillStyle = b.band === 'high' ? '#8a6a4a' : '#6a4a3a'; g.fillRect(x0, y, x1 - x0, 5); g.fillStyle = '#d8b050'; for (let x = x0; x < x1; x += 16) g.fillRect(x, y, 2, 5); }
      else if (!on) { g.fillStyle = b.band === 'high' ? 'rgba(191,230,245,0.35)' : 'rgba(224,192,144,0.35)'; for (let x = x0; x < x1; x += 6) g.fillRect(x, y + 2, 3, 1); } }
    /* THE KEEL BRUSH: the dune's shadow under the breach (tell), the sand (hit) */
    for (const z of S.brush) { const x0 = R(z.x0 * TS - cx), w = (z.x1 - z.x0 + 1) * TS, y = R((z.row + 1) * TS - cy);
      g.fillStyle = '#3a3020'; g.fillRect(x0, y - 2, w, 2);
      if (z.ph === 'tell') { g.fillStyle = 'rgba(40,30,10,' + (0.25 + 0.25 * (1 - z.t / BRUSH.tell)) + ')'; g.fillRect(x0, y - 18, w, 18); if (flick(time)) ctx.text('!!', x0 + w / 2, y - 26, '#ff6b6b'); }
      else if (z.ph === 'hit') { g.fillStyle = 'rgba(224,192,144,0.8)'; g.fillRect(x0, y - 24, w, 24); } }
    /* THE WYRM: his marks (sparks gather), the coil over the rail (slam tell), the tail on the rail */
    if (F && ctx.bossActive) { const G = F.G, fy = R(G.floorY - cy), m = ctx.boss ? ctx.boss.mode : '';
      if (m === 'strikeTell') for (const mk of F.marks) { const x = R(mk.x - cx), r = TW.markR * (0.6 + 0.4 * (1 - F.t / TW.strikeTell)); g.strokeStyle = flick(time, 12) ? '#9ad8ff' : '#e8f6ff'; g.strokeRect(x - r, fy - 3, r * 2, 3);
        const b = G.burners.find(q => hot(q.id) && Math.abs(q.x - mk.x) <= TW.lureR); if (b) { g.strokeStyle = '#ffd36b'; g.beginPath(); g.moveTo(x, fy - 40); g.lineTo(R(b.x - cx), fy - 20); g.stroke(); } }
      if (m === 'strike') for (const mk of F.marks) { const x = R((mk.to ?? mk.x) - cx); g.fillStyle = '#e8f6ff'; g.fillRect(x - 2, fy - 200, 4, 200); }
      if (m === 'slamTell' || m === 'slam') { const up = m === 'slam' ? 0 : 1 - F.t / TW.slamTell; g.fillStyle = H.band() === 'high' ? 'rgba(80,60,130,0.35)' : '#5a4a8a'; g.fillRect(R(G.x0 - cx), fy - R(10 + 30 * up), G.x1 - G.x0, 14); if (m === 'slamTell' && flick(time)) ctx.text('!!', R((G.x0 + G.x1) / 2 - cx), fy - 60, '#ff6b6b'); }
      if (F.tail) { g.fillStyle = '#5a4a8a'; g.fillRect(R(F.tail.x - 20 - cx), fy - TW.tailH, 40, TW.tailH); }
      if (m === 'tailTell' && flick(time)) ctx.text('!!', R((G.x0 + G.x1) / 2 - cx), fy - 50, '#ff6b6b');
      if (m === 'roarTell') { g.strokeStyle = '#c8b0ff'; g.strokeRect(R(F.head.x - 30 - cx), R(F.head.y - 30 - cy), 60, 60); if (flick(time)) ctx.text('!', R(F.head.x - cx), R(F.head.y - 44 - cy), '#ffd36b'); }
      /* P2: the storm (darker, rain) */
      if (F.ph === 2) { const VW = ctx.VW(), VH = ctx.VH(); g.fillStyle = 'rgba(20,10,40,0.25)'; g.fillRect(0, 0, VW, VH); g.fillStyle = 'rgba(190,210,255,0.5)'; for (let i = 0; i < 40; i++) { const rx = (i * 97 + time * 300) % VW, ry = (i * 53 + time * 600) % VH; g.fillRect(R(rx), R(ry), 1, 6); } } }
    /* THE CLOUD BANK (the sandstorm's visibility rule, reused as cloud): a veil when the hero is in it; lightning flickers far off (told, no hit) */
    const P = ctx.hero(); for (const v of A.visZones) if (P.x > v.x0 * TS && P.x < v.x1 * TS) { const VW = ctx.VW(), VH = ctx.VH(), fl = Math.sin(time * 0.7) > 0.97;
      g.fillStyle = fl ? 'rgba(232,240,255,0.5)' : 'rgba(220,226,240,' + v.k * 0.6 + ')'; g.fillRect(0, 0, VW, VH);
      const gx = R(P.x - cx), gy = R(P.y - 12 - cy); g.globalCompositeOperation = 'destination-out'; const gr = g.createRadialGradient ? g.createRadialGradient(gx, gy, 20, gx, gy, 110) : null;
      if (gr) { gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(gx - 110, gy - 110, 220, 220); } g.globalCompositeOperation = 'source-over'; }
  };
  H.drawFoe = (g, e, cx, cy, time) => {
    if (e.t === 'wyrmling') { const s = e.st, E = ELEMENT[s.el], x = R(s.x - cx), y = R(s.y - cy), tell = s.mode === 'spitTell' || s.mode === 'coilTell';
      for (let i = 4; i >= 0; i--) { const sx = x - s.face * i * 4, sy = y + Math.sin(time * 6 + i) * 2; g.fillStyle = i ? '#4a5a8a' : '#6a7ab0'; g.fillRect(sx - 3, sy - 3, 6, 6); }
      g.fillStyle = tell ? E.glow : E.col; g.fillRect(x + s.face * 3 - 2, y - 3, 3, 2);
      if (s.mode === 'coilTell') { g.strokeStyle = '#ffd36b'; g.strokeRect(x - 10, y - 8, 20, 14); }
      if (s.glob) { g.fillStyle = flick(time, 16) ? E.glow : E.col; g.fillRect(R(s.glob.x - cx) - 3, R(s.glob.y - cy) - 3, 6, 6); }
      return; }
    if (e.t === 'thunderwyrm' && F) { const x = R(F.head.x - cx), y = R(F.head.y - cy), G = F.G;
      g.fillStyle = '#3a2a5a'; for (let i = 0; i < 3; i++) g.fillRect(R(G.x1 - cx) - 10 - i * 22, R(G.floorY - cy) - 40 - i * 18, 18, 18);   /* coils over the rail */
      g.fillStyle = F.open > 0 ? '#8a7ab0' : '#5a4a8a'; g.fillRect(x - TW.w / 2, y - TW.h / 2, TW.w, TW.h); g.fillStyle = '#9ad8ff'; g.fillRect(x + e.face * 12 - 2, y - 6, 4, 3);
      if (F.open > 0) { g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.fillStyle = '#ffd36b'; g.fillRect(x - 20, y - 36, R(40 * F.open / TW.openT), 3); }
      else if (F.ward > 0) { g.strokeStyle = '#9ab0c0'; g.beginPath(); g.arc(x, y, 32, 0, Math.PI * 2); g.stroke(); }
      else if (F.headUp > 0) { g.strokeStyle = '#bfe6f5'; g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.stroke(); } }
  };
  /* THE HUD: the LIFT gauge + the altitude arrow, and THE COLD BAR (under the health) */
  H.drawHud = (g, P) => { if (!S) return; const ship = S.ship, x = 4, y = 64;
    g.fillStyle = 'rgba(10,8,20,0.55)'; g.fillRect(x - 2, y - 4, 100, 22);
    g.fillStyle = '#3a3a4a'; g.fillRect(x, y, 44, 4); g.fillStyle = '#ffd36b'; g.fillRect(x, y, R(44 * ship.target), 4); g.fillStyle = '#e8f4ff'; g.fillRect(x + R(44 * ship.alt), y - 2, 1, 8);
    const d = ship.target - ship.alt; ctx.text(d > 0.01 ? '^' : d < -0.01 ? 'v' : '-', x + 50, y + 4, '#e8f4ff'); ctx.text(bandOf(ship.alt).toUpperCase(), x + 72, y + 4, '#bfe6f5');
    const c = (P.asCold && P.asCold.v) || 0; g.fillStyle = '#2a3a4a'; g.fillRect(x, y + 9, 44, 3); g.fillStyle = c >= 1 ? '#ffffff' : '#9ad8ff'; g.fillRect(x, y + 9, R(44 * c), 3);
    if (P.wlEl) ctx.text(ELEMENT[P.wlEl.el].name, x + 50, y + 13, ELEMENT[P.wlEl.el].col); };
  return H;
}
