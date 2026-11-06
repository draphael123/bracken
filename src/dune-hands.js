/* src/dune-hands.js - THE GREAT DUNE's hands (claude/greatdune, 11-06, OPUS greybox): binds the level's pure rules to the world and draws them in greybox.
   Only a level with L.greatdune (behind ?gd=1, src/great-dune.js gdOn) wakes it; every main.js hunk asks on() first, so no other level pays anything.
     THE BOARD     src/shield-board.js in updatePlayer (board): mount / ride / air / land / the bowl; the Sun Scarab's speed and PLOUGH
     STILL SAND    soft sand and sinkhole swirls take what stands still: a quicksand patch carved under the feet (src/quicksand.js holds you - jump, and keep
                   jumping; never a kill), refilled once you are out; a swirl opens into its cave instead (the crust comes back after STILL.holeOpen s)
     SCARABS       pick-up -> SCARAB.t s of everything: no hurt, plough (every non-boss foe you touch takes a double cut and is thrown), the board faster
     SKIFFS        THE SAND-SKIFF BANDIT and THE SKIFF CHIEF (src/sand-skiff.js): their sails, sweeps, pots (told marks, the arc, the burst, the SAND TRAP)
     THE RACE      the chief's start, his rubber band, cut him down or beat him to the obelisk: THE CHIEF'S PURSE (spilled coins); lose and he takes it
     THE OBELISK   the height you strike it at pays (OBELISK.bands)
   ctx (main.js): { L, players, TS, T, sfx, hero, enemies, time, keys, tileAt, cellSet, number, text, damagePlayer, asPlayer, overlap, box, hurtFoe, knockFoe,
                    poiseMax, swordDmg, dust, ring, sparks, hitstop, shake, spill } */
import { newBoard, boardStep, boardUpdate, boardZoneAt, surfaceOf } from './shield-board.js';
import { SKIFF, RACE, newSkiff, skiffStep, newChief, chiefStep, chiefStruck, potAt } from './sand-skiff.js';
import { STILL, SCARAB, obeliskBonus } from './great-dune.js';

export function makeDuneHands(ctx) {
  const H = {}; let S = null;
  const TS = ctx.TS, R = Math.round;
  H.on = () => !!(ctx.L && ctx.L.greatdune);
  H.state = () => S;
  const surfY = x => { const tx = Math.max(0, Math.min(ctx.L.W - 1, Math.floor(x / TS))), y = ctx.L.dune.ground[tx], t = ctx.tileAt(tx, y);   /* the dune's own surface (L.dune.ground: under any outcrop) */
    if (t >= 20 && t <= 25) { const k = x - tx * TS; return y * TS + { 20: TS - k, 21: k, 22: TS - k / 2, 23: TS / 2 - k / 2, 24: TS / 2 + k / 2, 25: k / 2 }[t]; } return y * TS; };
  H.surfY = surfY;
  function restoreAll() {
    if (!S || S.L !== ctx.L) return;
    for (const p of S.patches) refill(p);
    for (const h of S.holes) for (const [x, y, t] of h.keep) ctx.cellSet(x, y, t);
    S.patches = []; S.holes = [];
  }
  function refill(p) { for (const [x, y, t] of p.keep) ctx.cellSet(x, y, t); const L = ctx.L; if (L.quicksand) L.quicksand = L.quicksand.filter(q => q !== p.q); }
  function fresh(keepRace) {
    const L = ctx.L, race = keepRace && S && S.L === L ? S.race : null;
    S = { L, scarabs: L.dune.scarabs.map(s => ({ ...s, got: false, px: s.x * TS + 8, py: (s.y + 1) * TS - 6 })), patches: [], holes: [], pots: [], traps: [], struck: false, payout: null, race, said: {} };
  }
  /* a respawn (spawnEntities): the sand is whole again, the scarabs back, nothing in the air; a race already WON stays won */
  H.clear = () => {
    if (!H.on()) { S = null; return; }
    restoreAll(); fresh(true);
    if (S.race && S.race.result !== 'won') S.race = null;
    for (const pp of ctx.players) { pp.dBoard = null; pp.stillT = 0; pp.scarabT = 0; pp.stillWarned = false; }
  };
  H.owns = e => e && (e.t === 'sandskiff' || e.t === 'skiffchief');
  /* the spawn case: base is main.js's enemy base */
  H.spawnFoe = (base, e) => {
    if (!S || S.L !== ctx.L) fresh(false);
    if (e.t === 'sandskiff') { const bed = e.bed ? [e.bed[0] * TS + 8, e.bed[1] * TS + 8] : null, st = newSkiff(base.x, base.y, bed);
      return { ...base, t: 'sandskiff', w: SKIFF.w, h: SKIFF.h, hp: SKIFF.hp, big: true, noGrav: true, st, face: -1 }; }
    if (e.t === 'skiffchief') {
      if (S.race && S.race.result === 'won') return null;   /* beaten: he does not come back */
      const st = newChief(base.x, base.y, (e.finishX || 0) * TS + 8); st.startX = (e.startX || 0) * TS + 8;
      const c = { ...base, t: 'skiffchief', w: SKIFF.w + 6, h: SKIFF.h + 6, hp: RACE.hp, maxHp0: RACE.hp, big: true, noGrav: true, st, face: 1 };
      S.race = { e: c, result: null }; return c; }
    return null;
  };
  /* ---------- THE BOARD (updatePlayer, after the butt-slide's step, before its hit) ---------- */
  H.board = (P, dt, o) => {
    const L = ctx.L; if (!L.boardZones) return;
    const b = P.dBoard || (P.dBoard = newBoard()), keys = ctx.keys(), ss = P.sandSlide;
    const zone = boardZoneAt(L, P.x, TS), move = keys.left ? -1 : keys.right ? 1 : 0;
    const wall = b.on && !b.air && P.ground && b.t > 0.12 && b.lastX !== undefined && Math.abs(P.x - b.lastX) < Math.abs(b.vx) * (b.lastDt || dt) * 0.25;
    const busy = o.swim || o.climb || P.qsDepth > 0 || P.flatT > 0;
    const ev = busy ? (b.on ? (b.on = false, b.why = 'busy', 'end') : null)
      : boardStep(b, dt, { kind: o.kind, ground: P.ground, down: keys.down, move, jumped: o.jumped, vx: P.vx, zone, hurt: o.hurt, attack: o.attack, block: o.block, wall });
    b.lastX = P.x; b.lastDt = dt;
    if (ev === 'mount') { ctx.sfx.slide && ctx.sfx.slide(); if (!S.said.board) { S.said.board = 1; ctx.number(P.x, P.y - 26, 'RIDE YOUR SHIELD!', '#ffd36b'); } }
    if (ev === 'land') ctx.dust(P.x, P.y, 3);
    if (ev === 'end' && b.why === 'wall') { ctx.number(P.x, P.y - 24, 'BONK', '#e8d0a0'); ctx.dust(P.x, P.y, 5); }
    if (!b.on) { P.dBoardOn = false; return; }
    if (P.scarabT > 0) { const top = surfaceOf(b.surface).topSteep * SCARAB.speedMul, sg = Math.sign(b.vx) || P.face || 1; if (Math.abs(b.vx) < top) b.vx += sg * 240 * dt; }
    P.dBoardOn = true; P.vx = b.vx; if (Math.abs(b.vx) > 20) P.face = Math.sign(b.vx);
    if (ss) { ss.sliding = false; ss.carry = false; ss.vx = b.vx; }   /* the board owns the speed: the butt-slide stands down this frame */
    /* THE SAND TRAPS (a pot's burst): a board that crosses one loses half its speed */
    for (const tr of S.traps) if (P.ground && !tr.hit.has(P) && P.x > tr.x0 && P.x < tr.x1 && Math.abs(P.y - tr.y) < 10) { tr.hit.add(P); b.vx *= 0.5; P.vx = b.vx; ctx.number(P.x, P.y - 24, 'SAND TRAP', '#e8b060'); ctx.dust(P.x, P.y, 6); }
    if (P.ground) boardUpdate({ P, b, enemies: ctx.enemies(), box: ctx.box, overlap: ctx.overlap, poiseMax: ctx.poiseMax, swordDmg: ctx.swordDmg, hurtEnemy: ctx.hurtFoe, knockFoe: ctx.knockFoe,
      plough: P.scarabT > 0, SFX: ctx.sfx, sparks: ctx.sparks, hitstop: ctx.hitstop, shakeCam: ctx.shake, dust: ctx.dust });
    if (!b.on) P.dBoardOn = false; else P.vx = b.vx;
  };
  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!H.on()) return;
    if (!S || S.L !== ctx.L) fresh(false);
    const L = ctx.L, D = L.dune;
    for (const pp of ctx.players) { if (pp.dead) continue; still(pp, dt, D); scarabs(pp, dt); obelisk(pp); }
    /* the patches refill once nobody is in them; the holes close */
    for (const p of S.patches) { p.t += dt; if (p.t > STILL.refill && !ctx.players.some(pp => !pp.dead && pp.x > p.q.x0 - 8 && pp.x < p.q.x1 + 8 && pp.y > p.q.y - 4 && pp.y < p.q.y + 20)) { refill(p); p.done = true; } }
    S.patches = S.patches.filter(p => !p.done);
    for (const h of S.holes) { h.t -= dt; if (h.t <= 0 && !ctx.players.some(pp => !pp.dead && Math.abs(pp.x - h.x) < 24 && pp.y > h.y - 4 && pp.y < h.y + 40)) { for (const [x, y, t] of h.keep) ctx.cellSet(x, y, t); h.done = true; } }
    S.holes = S.holes.filter(h => !h.done);
    /* pots in the air */
    for (const p of S.pots) { p.t += dt; if (p.t >= p.fly) { p.done = true; burstPot(p); } }
    S.pots = S.pots.filter(p => !p.done);
    for (const tr of S.traps) tr.t -= dt; S.traps = S.traps.filter(tr => tr.t > 0);
  };
  function still(pp, dt, D) {
    if (pp.qsDepth > 0 || !pp.ground || (pp.dBoard && pp.dBoard.on)) { pp.stillT = 0; pp.stillWarned = false; return; }
    const tx = Math.floor(pp.x / TS), row = Math.floor((pp.y + 1) / TS);
    const soft = D.sinkSand.find(s => tx >= s.x0 && tx <= s.x1 && row === s.row), cave = D.caves.find(c => tx >= c.swirl[0] && tx <= c.swirl[1] && row === c.row);
    if ((!soft && !cave) || Math.abs(pp.vx || 0) >= STILL.speed) { pp.stillT = 0; pp.stillWarned = false; return; }
    pp.stillT = (pp.stillT || 0) + dt;
    if (pp.stillT >= STILL.warn && !pp.stillWarned) { pp.stillWarned = true; ctx.ring(pp.x, pp.y, 14, '#e8c080'); ctx.dust(pp.x, pp.y, 4); if (!S.said.shiver) { S.said.shiver = 1; ctx.number(pp.x, pp.y - 26, 'THE SAND SHIVERS', '#e8c080'); } }
    if (pp.stillT < STILL.sink) return;
    pp.stillT = 0; pp.stillWarned = false;
    if (cave) {   /* THE SWIRL OPENS: down into the cave */
      const keep = []; for (let x = cave.swirl[0]; x <= cave.swirl[1]; x++) { keep.push([x, cave.row, ctx.tileAt(x, cave.row)]); ctx.cellSet(x, cave.row, ctx.T.AIR); }
      S.holes.push({ keep, t: STILL.holeOpen, x: (cave.swirl[0] + 1) * TS, y: cave.row * TS });
      ctx.number(pp.x, pp.y - 26, 'THE SAND TAKES YOU DOWN', '#ffd36b'); ctx.sfx.squelch && ctx.sfx.squelch(); ctx.dust(pp.x, pp.y, 8); return;
    }
    /* SOFT SAND: a quicksand patch carved under the feet (the hold is src/quicksand.js's: main.js's quicksand step finds it in L.quicksand) */
    const c0 = Math.max(soft.x0, tx - 1), c1 = Math.min(soft.x1, tx + 1), keep = [];
    for (let x = c0; x <= c1; x++) { keep.push([x, soft.row, ctx.tileAt(x, soft.row)]); ctx.cellSet(x, soft.row, ctx.T.AIR); }
    const q = { x0: c0 * TS, x1: (c1 + 1) * TS, y: soft.row * TS, dune: true };
    (ctx.L.quicksand = ctx.L.quicksand || []).push(q); S.patches.push({ keep, q, t: 0 });
    if (!S.said.sink) { S.said.sink = 1; ctx.number(pp.x, pp.y - 26, 'THE DUNE TAKES YOU', '#ff9a5c'); }
  }
  function scarabs(pp, dt) {
    for (const s of S.scarabs) if (!s.got && Math.abs(pp.x - s.px) < 12 && Math.abs(pp.y - 7 - s.py) < 14) {
      s.got = true; pp.scarabT = SCARAB.t; ctx.number(s.px, s.py - 16, 'SUN SCARAB!', '#ffe27a'); ctx.ring(s.px, s.py, 26, '#ffe27a'); ctx.sfx.scarab ? ctx.sfx.scarab() : ctx.sfx.coin && ctx.sfx.coin(); }
    if (!(pp.scarabT > 0)) return;
    pp.scarabT -= dt; pp.inv = Math.max(pp.inv || 0, 0.06);   /* nothing hurts you while it glows */
    /* PLOUGH on foot too: every non-boss foe you touch takes a double cut and is thrown */
    const hb = ctx.box(pp);
    for (const e of ctx.enemies()) { if (!e.alive || e.harmless || (e.maxHp && !e.mini) || e.t === 'skiffchief' || (e.ploughT && e.ploughT > ctx.time())) continue;
      if (!ctx.overlap(hb, ctx.box(e))) continue; e.ploughT = ctx.time() + 0.4; const d = Math.sign(e.x - pp.x) || 1;
      ctx.asPlayer(pp, () => ctx.hurtFoe(e, ctx.swordDmg() * 2, pp.x)); if (e.alive) ctx.knockFoe(e, d, 240); ctx.sparks(e.x, e.y - 6, d, 6); }
  }
  function obelisk(pp) {
    if (S.struck) return; const ob = ctx.L.dune.obelisk, ox = ob.x * TS + 8;
    if (Math.abs(pp.x - ox) > 8 + (pp.w || 10) / 2 + 2 || pp.y > ob.foot * TS + 1 || pp.y < (ob.foot - ob.h) * TS - 4) return;
    S.struck = true; const hgt = ob.foot * TS - pp.y, b = obeliskBonus(hgt);
    S.payout = { obelisk: b, h: R(hgt) };
    ctx.number(ox, pp.y - 22, b.name + ' +' + b.coins, '#ffe27a'); ctx.ring(ox, pp.y - 8, 30, '#ffe27a'); ctx.shake(3); ctx.spill(ox - 12, pp.y, b.coins, 'gdob');
    if (S.race && !S.race.result) raceWon('obelisk');
  }
  function burstPot(p) {
    ctx.ring(p.to.x, p.to.y, p.ring, '#e8b060'); ctx.dust(p.to.x, p.to.y, 8); ctx.sfx.potBurst ? ctx.sfx.potBurst() : ctx.sfx.thud && ctx.sfx.thud();
    for (const pp of ctx.players) if (!pp.dead && Math.abs(pp.x - p.to.x) < p.ring && Math.abs(pp.y - p.to.y) < 22) ctx.asPlayer(pp, () => ctx.damagePlayer(p.to.x, p.dmg, { name: 'SAND POT' }));
    S.traps.push({ x0: p.to.x - SKIFF.trapW / 2, x1: p.to.x + SKIFF.trapW / 2, y: p.to.y, t: SKIFF.trapT, hit: new Set() });
  }
  function raceWon(how) {
    const r = S.race; if (!r || r.result) return; r.result = 'won'; const e = r.e;
    if (e) { e.harmless = true; e.st.result = 'won'; }
    const x = how === 'down' && e ? e.x : ctx.L.dune.obelisk.x * TS - 8, y = how === 'down' && e ? e.y : ctx.L.dune.obelisk.foot * TS;
    ctx.number(x, y - 34, how === 'down' ? 'THE CHIEF IS DOWN: HIS PURSE IS YOURS' : "YOU BEAT HIM THERE: THE CHIEF'S PURSE", '#ffe27a'); ctx.spill(x, y, RACE.purse, 'gdpurse');
    S.payout = Object.assign(S.payout || {}, { race: how });
  }
  /* ---------- THE FOES (updateEnemies: an owned foe is stepped here, nothing else moves it) ---------- */
  H.foeUpdate = (e, dt) => {
    if (!S || S.L !== ctx.L) fresh(false);
    const P = ctx.hero(), s = e.st;
    if (e.t === 'sandskiff') {
      if (e.stagger > 0) { e.stagger -= dt; return; }
      if (Math.abs(e.x - P.x) > 520) return;
      const evs = skiffStep(s, dt, { px: P.x, py: P.y, groundY: surfY });
      e.x = s.x; e.y = s.y; e.face = s.dir; e.mode = s.mode;
      for (const v of evs) foeEvent(e, v);
      return;
    }
    if (e.t === 'skiffchief') {
      const r = S.race;
      if (s.mode === 'down' || (r && r.result === 'won')) { e.vx = 0; return; }
      if (s.result === 'lost') { e.x += 220 * dt; e.y = surfY(e.x); if (e.x > ctx.L.W * TS - 40) { e.alive = false; } return; }
      const done = !!S.struck || P.x >= s.finishX - 8;
      const evs = chiefStep(s, dt, { px: P.x, py: P.y, startX: s.startX, groundY: surfY, heroDone: done });
      e.x = s.x; e.y = s.y; e.face = 1; e.mode = s.mode;
      for (const v of evs) {
        if (v.ev === 'start') { ctx.number(e.x, e.y - 30, 'THE RACE IS ON!', '#ffd36b'); ctx.sfx.skiffSail && ctx.sfx.skiffSail(); }
        else if (v.ev === 'won') raceWon(v.how);
        else if (v.ev === 'lost') { if (r) r.result = 'lost'; ctx.number(e.x, e.y - 30, 'HE TAKES THE PURSE', '#ff9a5c'); S.payout = Object.assign(S.payout || {}, { race: 'lost' }); }
        else foeEvent(e, v);
      }
    }
  };
  function foeEvent(e, v) {
    if (v.ev === 'tell') { ctx.number(e.x, e.y - 30, v.mark, v.mark === '!!' ? '#ff6b6b' : '#ffd34a'); if (ctx.sfx[v.sound]) ctx.sfx[v.sound](); else ctx.sfx.tell && ctx.sfx.tell(false); }
    else if (v.ev === 'release') { if (ctx.sfx[v.sound]) ctx.sfx[v.sound](); e.st.hitDone = null; }
    else if (v.ev === 'hit') { e.st.hitDone = e.st.hitDone || new Set();
      for (const pp of ctx.players) if (!pp.dead && !e.st.hitDone.has(pp) && ctx.overlap(v.box, ctx.box(pp))) { e.st.hitDone.add(pp); ctx.asPlayer(pp, () => ctx.damagePlayer(e.x, v.dmg, { low: !!v.low, name: 'SPEAR SWEEP' })); } }
    else if (v.ev === 'pot') { S.pots.push({ from: v.from, to: { x: v.to.x, y: v.to.y }, fly: v.fly, t: 0, dmg: v.dmg, ring: v.ring }); if (ctx.sfx[v.sound]) ctx.sfx[v.sound](); }
  }
  /* a blow on one of ours (main.js's take hook, before the hp moves): every blow lands in full - the chief has no armour, no ward (never invulnerable) */
  H.take = (e, dmg) => {
    if (e.t === 'skiffchief' && S && S.race && !S.race.result) { const r = chiefStruck(e.st, e.hp - dmg, e.maxHp0 || RACE.hp); if (r) { raceWon('down'); return Math.min(dmg, Math.max(0, e.hp - 1)); } }
    return dmg;
  };
  /* ---------- GREYBOX DRAWING (the art lane redraws all of it: plan s4 gold dunes, heat shimmer, the obelisk) ---------- */
  H.draw = (g, cx, cy, time) => {
    if (!H.on() || !S) return; const D = ctx.L.dune, VW = g.canvas ? g.canvas.width : 640;
    const vis = (x0, x1) => x1 - cx > -40 && x0 - cx < VW + 40;
    g.save();
    for (const s of D.sinkSand) { const x0 = s.x0 * TS, x1 = (s.x1 + 1) * TS; if (!vis(x0, x1)) continue; g.fillStyle = 'rgba(214,160,86,0.55)'; g.fillRect(R(x0 - cx), R(s.row * TS - cy), x1 - x0, 3);
      g.fillStyle = 'rgba(120,80,40,0.35)'; for (let x = x0 + 4; x < x1; x += 9) g.fillRect(R(x - cx + Math.sin(time * 2 + x) * 1.5), R(s.row * TS - cy + 1), 3, 1); }
    for (const c of D.caves) { const x = c.swirl[0] * TS, y = c.row * TS; if (!vis(x, x + 32)) continue; g.strokeStyle = 'rgba(150,100,50,0.5)'; g.beginPath(); g.ellipse(R(x + 16 - cx), R(y - cy + 1), 11, 2.5, 0, time % (2 * Math.PI), time % (2 * Math.PI) + 4.5); g.stroke(); }
    for (const p of S.patches) { g.fillStyle = 'rgba(140,96,48,0.8)'; g.fillRect(R(p.q.x0 - cx), R(p.q.y - cy), p.q.x1 - p.q.x0, 6); }
    for (const tr of S.traps) { g.fillStyle = 'rgba(190,130,60,' + Math.min(0.8, tr.t) + ')'; g.fillRect(R(tr.x0 - cx), R(tr.y - cy - 3), tr.x1 - tr.x0, 3); }
    for (const s of S.scarabs) { if (s.got || !vis(s.px - 8, s.px + 8)) continue; const k = 1 + Math.sin(time * 6) * 0.15; g.fillStyle = '#ffe27a'; g.beginPath(); g.ellipse(R(s.px - cx), R(s.py - cy + Math.sin(time * 3) * 2), 5 * k, 4 * k, 0, 0, 7); g.fill(); g.fillStyle = '#4a7ab0'; g.fillRect(R(s.px - cx - 1), R(s.py - cy - 3), 2, 6); }
    const ob = D.obelisk, ox = ob.x * TS; if (vis(ox, ox + 16)) { g.fillStyle = 'rgba(255,226,122,0.6)'; for (const [at] of [[150], [110], [64]]) g.fillRect(R(ox - cx - 2), R(ob.foot * TS - at - cy), 20, 1); g.fillStyle = '#ffe27a'; g.fillRect(R(ox - cx), R((ob.foot - ob.h) * TS - cy - 4), 16, 4); }
    for (const p of S.pots) { const q = potAt(p, p.t); g.fillStyle = '#b07840'; g.fillRect(R(q.x - cx - 3), R(q.y - cy - 3), 6, 6); mark(g, p.to.x - cx, p.to.y - cy, time); }
    for (const e of ctx.enemies()) if (H.owns(e) && e.alive && e.st && e.st.mark && (e.st.mode === 'potTell')) mark(g, e.st.mark.x - cx, e.st.mark.y - cy, time);
    for (const pp of ctx.players) { if (pp.dead) continue;
      if (pp.dBoardOn) { g.fillStyle = '#c8a040'; g.beginPath(); g.ellipse(R(pp.x - cx), R(pp.y - cy - 1), 9, 2.5, 0, 0, 7); g.fill(); g.fillStyle = '#8a6a1a'; g.fillRect(R(pp.x - cx - 7), R(pp.y - cy - 1), 14, 1); }
      if (pp.scarabT > 0) { g.strokeStyle = 'rgba(255,226,122,' + (0.4 + 0.3 * Math.sin(time * 20)) + ')'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(pp.x - cx), R(pp.y - cy - 8), 11, 13, 0, 0, 7); g.stroke(); g.lineWidth = 1; } }
    const r = S.race; if (r && r.e && r.e.st && r.e.st.mode !== 'wait' && !r.result && ctx.text) { const P = ctx.hero(), gap = Math.round((r.e.x - P.x) / TS); ctx.text(gap > 0 ? 'THE CHIEF +' + gap : 'YOU LEAD ' + (-gap), Math.round(VW / 2), 22, gap > 0 ? '#ff9a5c' : '#8fd160', 'center', 6, 'outline'); }
    g.restore();
  };
  function mark(g, x, y, time) { if (Math.floor(time * 8) % 2) return; g.strokeStyle = '#ff6b6b'; g.beginPath(); g.moveTo(R(x - 5), R(y - 4)); g.lineTo(R(x + 5), R(y)); g.moveTo(R(x + 5), R(y - 4)); g.lineTo(R(x - 5), R(y)); g.stroke(); }
  H.drawFoe = (g, e, cx, cy, time) => {
    const x = R(e.x - cx), y = R(e.y - cy), chief = e.t === 'skiffchief', d = e.face || 1, s = e.st || {};
    g.save();
    g.fillStyle = chief ? '#7a4a2a' : '#8a6a3a'; g.fillRect(x - 15, y - 5, 30, 5); g.fillRect(x - 15 + (d > 0 ? 26 : 0), y - 7, 4, 2);   /* the hull, its nose */
    g.fillStyle = '#5a4a3a'; g.fillRect(x - 1, y - (chief ? 34 : 28), 2, chief ? 29 : 23);                                                  /* the mast */
    g.fillStyle = chief ? '#c03a2a' : '#e8dcb4'; g.beginPath(); g.moveTo(x + 1, y - (chief ? 33 : 27)); g.lineTo(x + 1 - d * (chief ? 16 : 12), y - 8); g.lineTo(x + 1, y - 8); g.fill();   /* the sail */
    if (s.mode !== 'down') { g.fillStyle = e.flash > 0 ? '#fff' : chief ? '#6a2a1a' : '#4a3a2a'; g.fillRect(x + d * 6 - 3, y - 17, 6, 12); g.fillStyle = '#d8b090'; g.fillRect(x + d * 6 - 2, y - 21, 4, 4); }   /* the rider */
    else { g.fillStyle = '#6a2a1a'; g.fillRect(x + 8, y - 5, 10, 5); }
    if (s.pose && s.pose !== 'ride' && s.pose !== 'race' && s.pose !== 'wait' && ctx.text) ctx.text(s.pose, x, y + 6, '#c8c0b0', 'center', 4);
    if (chief && s.mode === 'race' && Math.abs(e.vx || 0) > 200) { g.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 3; i++) g.fillRect(x - 24 - i * 6, y - 12 + i * 4, 5, 1); }
    g.restore();
  };
  return H;
}
