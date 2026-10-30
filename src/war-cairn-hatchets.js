// src/war-cairn-hatchets.js - THE WAR CAIRN's HATCHET (claude/warcairn2, the OPUS rework, scratch/brief-warcairn2-1030.md section 1; Daniel 10-30: "pick up a HATCHET and THROW
// it to knock things down in the level"). One more CARRY & THROW thing (P.carry, src/throwables.js THROW_KIND.hatchet; its told arc src/carry-throw.js KINDS.hatchet), made
// by src/war-cairn-hands.js and bound to the world through its ctx. NO PILLARS.
//   WHERE:   a HATCHET RACK (L.wcRacks: E takes one - it never runs out) or a CLANSMAN'S DROP (an axeman or a hatchet-thrower cut down lets his fall: it lies HATCHET.lie s).
//   CARRY:   E takes it; E again sets it down; a blow that lands on you knocks it out of your hand. Light: near a run, and you can climb with it.
//   THROW:   ATTACK (main.js throwCarry): no key flat and fast, UP a lob, DOWN a short toss - the arc you are shown is the arc it flies.
//   IT:      CUTS A HAULED BRIDGE's rope (kind 'bridge': the bridge swings down across the gap for the attempt - the gorge's is the route), DROPS A HANGING CAIRN STONE
//            (kind 'stone': it crushes what is under it and stays as a block), DROPS A HANGING TOTEM (kind 'totem': it crushes, shatters, and the clan in earshot quails),
//            KNOCKS DOWN A HARPY NEST (kind 'nest': its harpies reel and are hurt - while a nest stands, its harpies hatch again), STRIKES A DRUM (a beat, from range),
//            HITS A FOE (HATCHET.dmg and a stumble). THE CHIEFTAIN's OWN HATCHET (src/bzchief.js) is grabbed and thrown back the same way: it STAGGERS him.
// A blade knocks a nest down, or cuts a rope, where it can reach one - the hatchet is the reach.
// Every capital line is in WC_SAY (src/war-cairn-hands.js: the hint lines list it).
import * as CT from './carry-throw.js';
import * as WA from './redraw/warcairn_art2.js';   /* (claude/warcairn2art) the kit, painted */
export const HATCHET = { dmg: 24, stumble: 0.8, lie: 14, keep: 5, reachX: 16, reachY: 16, hand: 16, r: 3,
  crush: 70, crushElite: 0.3, crushHero: 12, stoneG: 900, totemR: 5, swing: 0.55,
  nestEvery: 12, nestNear: 22, nestDmg: 0.5, nestReel: 2.2 };
CT.addKind('hatchet', { aims: { low: { vx: 180, vy: -90 }, mid: { vx: 340, vy: -120 }, high: { vx: 260, vy: -380 } }, g: 520, r: 3, ring: 8, dots: 16 });
export const HATCHET_SAY = {
  rack: 'A HATCHET RACK: E TAKES ONE', take: 'A HATCHET', drop: 'HIS HATCHET FALLS', down: 'SET DOWN', lost: 'KNOCKED FROM YOUR HAND',
  cut: 'THE ROPE PARTS', bridge: 'THE BRIDGE SWINGS DOWN', stone: 'THE STONE FALLS', totem: 'THE TOTEM FALLS', quail: 'THE CLAN QUAILS', nest: 'THE NEST COMES DOWN',
  crushed: 'CRUSHED', hatch: 'A HARPY HATCHES', chief: 'HIS HATCHET: E TAKES IT', thrown: 'THROWN BACK',
};
/* who drops a hatchet when he falls (the clan's axemen and its hatchet-thrower) */
export const DROPS = new Set(['soldier', 'javelin']);

export function makeHatchets(ctx, hook) {
  const TS = ctx.TS, R = Math.round, H = {};
  let axes = [], cuts = new Map(), racks = [], arc = null, inited = null;
  const L = () => ctx.L;
  const say = (x, y, k, col = '#ffd36b') => ctx.number(x, y, HATCHET_SAY[k], col);
  const sfx = (...ks) => { for (const k of ks) { const f = ctx.sfx && ctx.sfx[k]; if (f) { try { f(); } catch {} return; } } };
  const held = P => (P && P.carry && P.carry.t === 'wchatchet' ? P.carry : null);
  const handAt = P => ({ x: P.x + (P.face || 1) * 6, y: P.y - HATCHET.hand });
  const keys = () => (ctx.keys ? ctx.keys() : {});
  H.n = { taken: 0, thrown: 0, drops: 0, cuts: 0, bridges: 0, stones: 0, totems: 0, nests: 0, crushed: 0, hatched: 0, beats: 0, foes: 0, chief: 0, back: 0, lost: 0 };

  /* ---------- RESET: every load and respawn (the grid is laid again: the bridges are hauled up, the stones and totems hang, the nests stand) ---------- */
  H.reset = (keepN) => {
    /* a RESPAWN does not lay the grid again (main.js respawn): what the hatchet changed is put back first - the bridge hauled up again (air), a fallen stone's block taken up */
    if (inited && inited === L()) for (const c of cuts.values()) { const d = c.d;
      if (d.kind === 'bridge' && (c.st === 'down' || c.st === 'swing')) for (let x = d.x0; x <= d.x1; x++) ctx.cellSet(x, d.y, ctx.T.AIR);
      for (const [x, y] of c.cells || []) ctx.cellSet(x, y, ctx.T.AIR); }
    const lv = L(); axes = []; cuts = new Map(); racks = []; arc = null; inited = lv;
    if (!lv || !lv.warcairn) return;
    racks = (lv.wcRacks || []).map(r => ({ ...r, px: r.x * TS + 8, py: (r.f + 1) * TS }));
    for (const c of lv.wcCuts || []) cuts.set(c.id, { d: c, st: 'hang', t: 0, y: c.y0 * TS, vy: 0, cells: null, foes: [], hatchT: 0 });
    /* a NEST's harpies: the ones spawned where the nest says (bound by their spawn spot) */
    for (const c of cuts.values()) if (c.d.kind === 'nest') for (const e of ctx.enemies()) { if (!e.alive || e.t !== 'harpy') continue;
      if ((c.d.foes || []).some(([x, y]) => Math.abs((e.hx ?? e.x) - (x * TS + 8)) < 4 && Math.abs((e.hy ?? e.y) - (y + 1) * TS) < 4)) { e.wcNest = c.d.id; c.foes.push(e); } }
    if (!keepN) for (const k in H.n) H.n[k] = 0;
  };
  H.held = P => !!held(P || ctx.hero());

  /* ---------- THE TARGETS ---------- */
  const cutBox = c => { const d = c.d;
    if (d.kind === 'bridge') { const [px, py] = d.post; return { l: px * TS - 4, r: px * TS + 20, t: (py - 4) * TS, b: (py + 1) * TS }; }   /* (its haul rope's tie post on the far bank, and the rope's knot over it: a generous box - reviewer 10-30) */
    if (d.kind === 'nest') return { l: d.x0 * TS - 2, r: (d.x1 + 1) * TS + 2, t: d.y0 * TS - 4, b: (d.y1 + 1) * TS };
    return { l: d.x0 * TS - 2, r: (d.x1 + 1) * TS + 2, t: (d.y0 - (d.rope || 1)) * TS, b: c.y + (d.y1 - d.y0 + 1) * TS }; };   /* a stone / totem: it and its rope */
  /* the bridge's haul rope: from the raised bridge's top to the tie post (px) */
  const ropeOf = d => { const len = (d.x1 - d.x0 + 1) * TS; return { ax: d.x0 * TS + 2, ay: d.y * TS - len, bx: d.post[0] * TS + 8, by: (d.post[1] - 1) * TS }; };
  const segHit = (s, x, y, r) => { const vx = s.bx - s.ax, vy = s.by - s.ay, q = Math.max(0, Math.min(1, ((x - s.ax) * vx + (y - s.ay) * vy) / (vx * vx + vy * vy))); return Math.hypot(s.ax + vx * q - x, s.ay + vy * q - y) < r; };
  const inBox = (b, x, y) => x > b.l && x < b.r && y > b.t && y < b.b;
  const cutAt = (x, y) => { for (const c of cuts.values()) { if (c.st !== 'hang') continue; if (inBox(cutBox(c), x, y) || (c.d.kind === 'bridge' && segHit(ropeOf(c.d), x, y, 5))) return c; } return null; };
  const landRow = c => { const d = c.d, rows = d.y1 - d.y0 + 1, Hh = L().H; for (let y = Math.floor((c.y + rows * TS) / TS); y < Hh; y++) for (let x = d.x0; x <= d.x1; x++) if (ctx.footAt(x, y)) return y - rows; return Hh - rows; };
  H.landRow = id => { const c = cuts.get(id); return c ? landRow(c) : null; };

  /* CUT: the rope parts (or the nest is knocked off) */
  function cut(c, why) {
    if (!c || c.st !== 'hang') return false; const d = c.d; H.n.cuts++; sfx('crack', 'clank');
    const mx = (d.x0 + d.x1 + 1) * TS / 2;
    if (d.kind === 'bridge') { c.st = 'swing'; c.t = HATCHET.swing; say(d.post[0] * TS, (d.post[1] - 2) * TS, 'cut', '#ffd36b'); if (hook.told && !hook.told('bridge')) hook.tell('bridge'); }
    else if (d.kind === 'nest') { c.st = 'fall'; c.vy = -60; H.n.nests++; say(mx, d.y0 * TS - 8, 'nest', '#8fd160');
      for (const e of c.foes) if (e.alive) { ctx.hurtFoe(e, Math.max(1, Math.round((e.maxHp || e.hp || 20) * HATCHET.nestDmg)), mx); if (e.alive) { e.broken = Math.max(e.broken || 0, HATCHET.nestReel); e.stagger = Math.max(e.stagger || 0, HATCHET.nestReel); } }
      ctx.burst(mx, d.y0 * TS + 6, 12, ['#6a4a2a', '#c8b89a', '#e8e0d0'], 70, 0.7); }
    else { c.st = 'fall'; c.vy = 0; say(mx, d.y0 * TS - 14, d.kind === 'totem' ? 'totem' : 'stone', '#ffd36b'); }
    return true; }
  H.cut = id => cut(cuts.get(id), 'test');

  /* A STONE / TOTEM lands; A NEST lands (it is only twigs) */
  function land(c) {
    const d = c.d, rows = d.y1 - d.y0 + 1, top = landRow(c), mx = (d.x0 + d.x1 + 1) * TS / 2; c.y = top * TS; c.vy = 0;
    if (d.kind === 'nest') { c.st = 'gone'; ctx.burst(mx, (top + rows) * TS - 4, 10, ['#6a4a2a', '#c8b89a'], 60, 0.6); sfx('puff', 'thud'); return; }
    const box = { l: d.x0 * TS, r: (d.x1 + 1) * TS, t: top * TS - 6, b: (top + rows) * TS };
    ctx.shake(d.kind === 'stone' ? 5 : 3); sfx('heavy', 'thud'); ctx.dust(mx, (top + rows) * TS, 14);
    for (const e of ctx.enemies()) { if (!e.alive || e.boss || e.harmless) continue; const w = (e.w || 12) / 2;
      if (e.x + w > box.l - 2 && e.x - w < box.r + 2 && e.y > box.t && e.y - (e.h || 10) < box.b + 2) { H.n.crushed++;
        const dmg = e.elite || e.maxHp > 200 ? Math.round((e.maxHp || e.hp) * HATCHET.crushElite) : HATCHET.crush; ctx.hurtFoe(e, dmg, mx); if (e.alive) { e.broken = Math.max(e.broken || 0, 1.4); e.stagger = Math.max(e.stagger || 0, 1.0); }
        ctx.number(e.x, e.y - 30, HATCHET_SAY.crushed, '#ffd36b'); } }
    for (const pp of ctx.players()) { if (!pp || pp.dead) continue; if (pp.x + 5 > box.l && pp.x - 5 < box.r && pp.y > box.t + 6 && pp.y - 24 < box.b) ctx.shoveHero(pp, box.t + 6, HATCHET.crushHero); }
    if (d.kind === 'stone') { c.st = 'down'; c.cells = []; for (let y = top; y < top + rows; y++) for (let x = d.x0; x <= d.x1; x++) { ctx.cellSet(x, y, ctx.T.SOLID); c.cells.push([x, y]); } H.n.stones++;
      for (const q of axes) if (q.state === 'rest' && q.x > box.l - 4 && q.x < box.r + 4 && q.y > top * TS - 2 && q.y <= (top + rows) * TS + 2) { q.y = top * TS; q.vy = 0; } }   /* (a hatchet lying under it is pushed up on top, never lost in the block) */
    else { c.st = 'gone'; H.n.totems++; ctx.burst(mx, (top + rows) * TS - 8, 18, ['#e8e0d0', '#c8b89a', '#c8281e', '#6a5a4a'], 110, 0.8);
      let n = 0; for (const e of ctx.enemies()) { if (!e.alive || e.boss || !hook.clan.has(e.t) || Math.hypot(e.x - mx, (e.y - box.b) * 1.5) > HATCHET.totemR * TS) continue; e.broken = Math.max(e.broken || 0, 1.2); e.wcSurge = 0; n++; }
      if (n) say(mx, box.t - 24, 'quail', '#8fd160'); }
  }

  /* ---------- E: take one (a rack, a lying hatchet, HIS hatchet in the ring), or set yours down ---------- */
  const lying = P => axes.find(q => q.state === 'rest' && Math.abs(P.x - q.x) < HATCHET.reachX && Math.abs(P.y - q.y) < HATCHET.reachY) || null;
  const rackAt = P => racks.find(r => Math.abs(P.x - r.px) < HATCHET.reachX + 2 && Math.abs(P.y - r.py) < HATCHET.reachY) || null;
  const chiefAt = P => { const ch = hook.chief && hook.chief(); if (!ch) return null; const a = ch.axe(); return a && a.grab && Math.abs(P.x - a.x) < HATCHET.reachX + 6 && Math.abs(P.y - a.y) < 30 ? a : null; };
  H.canTake = P => { P = P || ctx.hero(); return !!(P && !P.dead && !P.carry && (chiefAt(P) || lying(P) || rackAt(P))); };
  const give = (P, o) => { const q = Object.assign({ t: 'wchatchet', thrKind: 'hatchet', state: 'held', holder: P, x: P.x, y: P.y - HATCHET.hand, vx: 0, vy: 0, lie: HATCHET.lie, hurtWas: P.hurt > 0,
    launch: PP => CT.launchOf('hatchet', PP, keys()) }, o || {}); axes.push(q); P.carry = q; P.hatchetPose = 'carry'; H.n.taken++; sfx('clank'); return q; };
  H.interact = P => {
    if (!P || P.dead || !L() || !L().warcairn) return false;
    const h = held(P);
    if (h) { if (!P.ground) return false; P.carry = null; P.hatchetPose = null; h.state = 'rest'; h.x = P.x + (P.face || 1) * 10; h.y = P.y; h.vx = 0; h.vy = 0; h.lie = HATCHET.lie; h.holder = null;
      if (h.chief) { const ch = hook.chief && hook.chief(); if (ch) ch.dropped(h.x); h.state = 'gone'; }
      say(P.x, P.y - 34, 'down', '#c8b8a8'); return true; }
    if (P.carry || !P.ground) return false;
    const a = chiefAt(P); if (a) { const ch = hook.chief(); if (ch.grab()) { give(P, { chief: true }); say(P.x, P.y - 34, 'chief', '#ffd36b'); return true; } }
    const q = lying(P); if (q) { q.state = 'gone'; give(P); say(P.x, P.y - 34, 'take', '#e8e0d0'); return true; }
    const r = rackAt(P); if (r) { give(P); say(P.x, P.y - 34, 'take', '#e8e0d0'); if (hook.told && !hook.told('rack')) { hook.tell('rack'); if (hook.hint) hook.hint('A HATCHET: ATTACK THROWS IT, HOLD UP TO LOB IT, DOWN TO TOSS IT SHORT. IT CUTS ROPES, DROPS STONES, KNOCKS DOWN NESTS AND BEATS A DRUM.'); } return true; }
    return false; };

  /* ---------- A CLANSMAN FALLS: his hatchet with him ---------- */
  const dropAt = (x, y) => { axes.push({ t: 'wchatchet', thrKind: 'hatchet', state: 'rest', x, y, vx: 0, vy: 0, lie: HATCHET.lie }); H.n.drops++;
    const rest = axes.filter(q => q.state === 'rest'); if (rest.length > HATCHET.keep) rest[0].state = 'gone'; };

  /* ---------- A FLYING HATCHET meets something ---------- */
  function strikeAt(q, x, y) {
    /* a DRUM: a beat */
    const dr = hook.drumAt(x, y); if (dr) { if (hook.beat(dr, q.thrower)) H.n.beats++; return 'drum'; }
    const c = cutAt(x, y); if (c) { cut(c, 'hatchet'); return 'cut'; }
    /* THE CHIEFTAIN */
    const ch = hook.chief && hook.chief(); if (ch && ch.hits(x, y)) { ch.struck(q, x); H.n.chief++; if (q.chief) H.n.back++; return q.chief ? 'gone' : 'chief'; }
    for (const e of ctx.enemies()) { if (!e.alive || e.harmless || e.boss) continue; const w = (e.w || 12) / 2 + 3, h = (e.h || 14) + 3;
      if (x > e.x - w && x < e.x + w && y > e.y - h && y < e.y + 3) { H.n.foes++; ctx.hurtFoe(e, HATCHET.dmg, x); if (e.alive) e.broken = Math.max(e.broken || 0, HATCHET.stumble); return 'foe'; } }
    return null; }
  const restAt = (q, x, y) => { q.state = 'rest'; q.x = x; q.y = y; q.vx = 0; q.vy = 0; q.lie = HATCHET.lie; sfx('clank', 'thud');
    if (q.chief) { const ch = hook.chief && hook.chief(); q.state = 'gone'; if (ch) ch.dropped(x); } };

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    const lv = L(); if (!lv || !lv.warcairn) return; if (inited !== lv) H.reset();
    const P = ctx.hero();
    /* the clan's dead drop their hatchets */
    for (const e of ctx.enemies()) if (!e.alive && !e.wcDrop && DROPS.has(e.t) && !e.harmless) { e.wcDrop = true; dropAt(e.x, e.y); if (hook.told && !hook.told('drop')) { hook.tell('drop'); say(e.x, e.y - 30, 'drop', '#e8e0d0'); } }
    for (const q of axes) {
      if (q.state === 'held') { const Hd = q.holder;
        if (!Hd || Hd.dead || Hd.carry !== q) { if (Hd && Hd.hatchetPose) Hd.hatchetPose = null; if (q.chief) { const ch = hook.chief && hook.chief(); if (ch) ch.dropped(Hd ? Hd.x : q.x); } q.state = 'gone'; continue; }
        const h = handAt(Hd); q.x = h.x; q.y = h.y;
        if ((Hd.hurt > 0 && !q.hurtWas) || Hd.swim) { Hd.carry = null; Hd.hatchetPose = null; H.n.lost++; say(Hd.x, Hd.y - 34, 'lost', '#ff9a5c'); restAt(q, Hd.x - (Hd.face || 1) * 8, Hd.y); continue; }
        q.hurtWas = Hd.hurt > 0; continue; }
      if (q.state === 'fly') { if (!q.counted) { q.counted = true; H.n.thrown++; q.thrower = q.holder || P; if (q.holder) { q.holder.hatchetPose = 'throw'; q.holder.hatchetPoseT = 0.25; } } q.holder = null;
        q.spin = (q.spin || 0) + dt * 22 * Math.sign(q.vx || 1); const k = CT.KINDS.hatchet, px = q.x, py = q.y; CT.stepArc(q, dt, k.g);
        const hit = strikeAt(q, q.x, q.y);
        if (hit === 'drum' || hit === 'cut' || hit === 'foe' || hit === 'chief') { q.state = 'drop'; q.vy = -60; q.vx = -q.vx * 0.15; continue; }   /* (it glances off and drops: where it comes to rest it lies, to be taken up again) */
        if (hit === 'gone') { q.state = 'gone'; continue; }
        if (ctx.solidPx(q.x + Math.sign(q.vx) * k.r, py, false) && !ctx.solidPx(px, py, false)) { q.state = 'drop'; q.x = px; q.vx = -q.vx * 0.15; q.vy = 0; sfx('clank'); continue; }   /* a wall: it bounces off and drops */
        if (q.vy < 0 && ctx.solidPx(q.x, q.y - k.r, false)) q.vy = 0;
        if (q.vy >= 0 && ctx.solidPx(q.x, q.y + k.r, true)) { restAt(q, q.x, Math.floor((q.y + k.r) / TS) * TS); continue; }
        if (q.y > lv.H * TS) { if (q.chief) { const ch = hook.chief && hook.chief(); if (ch) ch.dropped(null); } q.state = 'gone'; }
        continue; }
      if (q.state === 'drop') { q.vy = Math.min(320, q.vy + 700 * dt); q.x += q.vx * dt; q.y += q.vy * dt;
        if (ctx.solidPx(q.x, q.y + 2, true)) { restAt(q, q.x, Math.floor((q.y + 2) / TS) * TS); continue; } if (q.y > lv.H * TS) { if (q.chief) { const ch = hook.chief && hook.chief(); if (ch) ch.dropped(null); } q.state = 'gone'; } continue; }
      if (q.state === 'rest') { q.lie -= dt; if (q.lie <= 0) { q.state = 'gone'; continue; }
        if (!ctx.solidPx(q.x, q.y + 2, true)) { q.vy = Math.min(300, (q.vy || 0) + 640 * dt); q.y += q.vy * dt; if (q.y > lv.H * TS) q.state = 'gone'; } else q.vy = 0; }
    }
    axes = axes.filter(q => q.state !== 'gone');
    for (const pp of ctx.players()) if (pp && pp.hatchetPoseT > 0) { pp.hatchetPoseT -= dt; if (pp.hatchetPoseT <= 0) pp.hatchetPose = held(pp) ? 'carry' : null; }
    /* THE CUTS: a bridge swinging down, a stone or totem falling, a nest falling */
    for (const c of cuts.values()) { const d = c.d;
      if (c.st === 'swing') { c.t -= dt; if (c.t <= 0) { c.st = 'down'; for (let x = d.x0; x <= d.x1; x++) ctx.cellSet(x, d.y, ctx.T.PLANK); H.n.bridges++; ctx.shake(3); sfx('heavy', 'thud'); ctx.dust((d.x1) * TS, d.y * TS, 10); say((d.x0 + d.x1) / 2 * TS, d.y * TS - 20, 'bridge', '#8fd160'); } continue; }
      if (c.st === 'fall') { c.vy = Math.min(520, c.vy + HATCHET.stoneG * dt); const top = landRow(c), ny = c.y + c.vy * dt; if (ny >= top * TS && c.vy > 0) land(c); else c.y = ny; continue; }
      /* A NEST THAT STANDS hatches again: one harpy at a time, while a hero is near */
      if (d.kind === 'nest' && c.st === 'hang' && P && !P.dead) { const nx = (d.x0 + d.x1 + 1) * TS / 2, ny = d.y0 * TS;
        c.foes = c.foes.filter(e => e.alive); const want = (d.foes || []).length;
        if (c.foes.length < want && Math.abs(P.x - nx) < HATCHET.nestNear * TS && Math.abs(P.y - ny) < 16 * TS) { c.hatchT += dt;
          if (c.hatchT >= HATCHET.nestEvery && ctx.spawnFoe) { c.hatchT = 0; const made = ctx.spawnFoe('harpy', (d.x0 + d.x1) >> 1, d.y0 - 2) || []; for (const e of made) { e.wcNest = d.id; c.foes.push(e); }
            if (made.length) { H.n.hatched++; say(nx, ny - 14, 'hatch', '#ff9a5c'); sfx('screech', 'tell'); } } }
        else c.hatchT = Math.min(c.hatchT, HATCHET.nestEvery * 0.5); } }
    /* THE TOLD ARC of the one in your hand */
    const h = held(P);
    arc = h && !P.dead ? (() => { const hp = handAt(P), a = CT.aimOf('hatchet', P.face || 1, keys());
      return CT.predictArc('hatchet', hp.x, hp.y, { vx: a.vx, vy: a.vy }, ctx.solidPx, { stopAt: (x, y) => (hook.drumAt(x, y) ? 'drum' : null) || (cutAt(x, y) ? 'cut' : null) || (hook.chief && hook.chief() && hook.chief().hits(x, y) ? 'chief' : null) }); })() : null;
  };

  /* ---------- A BLADE (main.js attackBox): a nest knocked down, a rope cut, where it reaches ---------- */
  H.strike = hb => { if (!hb) return; for (const c of cuts.values()) { if (c.st !== 'hang') continue; const b = cutBox(c);
    if (c.d.kind !== 'bridge' && hb.l < b.r && hb.r > b.l && hb.t < b.b && hb.b > b.t) cut(c, 'blade');
    else if (c.d.kind === 'bridge') { const s = ropeOf(c.d); for (let k = 0; k <= 8; k++) { const x = s.ax + (s.bx - s.ax) * k / 8, y = s.ay + (s.by - s.ay) * k / 8; if (x > hb.l && x < hb.r && y > hb.t && y < hb.b) { cut(c, 'blade'); break; } } } } };

  /* ---------- the tools, the bots, the guide ---------- */
  H.arc = () => arc;
  H.read = () => ({ axes: axes.map(q => ({ state: q.state, x: R(q.x), y: R(q.y), chief: !!q.chief })), cuts: [...cuts.values()].map(c => ({ id: c.d.id, kind: c.d.kind, st: c.st })),
    racks: racks.map(r => ({ id: r.id, x: r.px, y: r.py })), held: H.held(), n: { ...H.n } });
  H.props = () => [...cuts.values()].filter(c => c.d.kind === 'bridge').map(c => ({ t: 'wcrope', id: c.d.id, x: c.d.post[0] * TS + 8, y: c.d.post[1] * TS + 16, on: c.st !== 'hang' }));
  H.state = id => { const c = cuts.get(id); return c ? c.st : null; };

  /* ---------- DRAWING (claude/warcairn2art: src/redraw/warcairn_art2.js paints every piece; the logic above is untouched) ---------- */
  H.draw = (g, cx, cy, VW, time) => {
    const lv = L(); if (!lv || !lv.warcairn) return; const inX = (x, m = 80) => x - cx > -m && x - cx < VW + m, P = ctx.hero(), holding = !!held(P);
    for (const c of cuts.values()) if (c.artSt !== c.st) { c.artSt = c.st; c.artT = time; }   /* (when each target changed: the shards and dust are drawn off it) */
    /* RACKS: a carved slate post, three hatchets on an antler bar */
    for (const r of racks) { if (!inX(r.px)) continue; WA.rack(g, r.px - cx, r.py - cy, !holding && P && Math.abs(P.x - r.px) < 60 && Math.abs(P.y - r.py) < 40, time); }
    /* THE CUTS */
    for (const c of cuts.values()) { const d = c.d; if (!inX(d.x0 * TS, 300)) continue; const x0 = d.x0 * TS - cx, w = (d.x1 - d.x0 + 1) * TS, rows = d.y1 - d.y0 + 1, mx = x0 + w / 2;
      if (d.kind === 'bridge') { const len = w, px0 = x0, py0 = d.y * TS - cy, s = ropeOf(d), [pxp, pyp] = d.post;
        if (c.st === 'hang' || c.st === 'swing') { const ang = c.st === 'hang' ? -Math.PI / 2 : -Math.PI / 2 * Math.max(0, c.t / HATCHET.swing);
          WA.bridge(g, { x: px0, y: py0 - 5, len, ang });
          if (c.st === 'hang') WA.haulRope(g, s.ax - cx, s.ay - cy, s.bx - cx, s.by - cy, 0);
          else { const tx = px0 + Math.cos(ang) * len, ty = py0 + 8 + Math.sin(ang) * len; WA.haulRope(g, tx, ty, tx + 8, ty + 24, 0); } }
        if (c.st === 'down') WA.bridge(g, { x: px0, y: py0 - 5, len, ang: 0 });   /* (the swung-down bridge: the PLANK cells are set by the logic, but the tile layer is not re-baked, so it is drawn here) */
        WA.tiePost(g, pxp * TS - cx + 4, (pyp - 2) * TS - cy, 3 * TS, c.st !== 'hang', time);
        if (c.st === 'down' && time - c.artT < 0.8) { g.globalAlpha = Math.max(0, 1 - (time - c.artT) / 0.8); for (let i = 0; i < 6; i++) WA.shards(g, px0 + len - 8 - i * 6, py0 + 4, time - c.artT, 'stone'); g.globalAlpha = 1; }
        if (c.st === 'hang' && holding) WA.glint(g, pxp * TS - cx + 8, (pyp - 1) * TS - cy, time, '#ffd36b');
        continue; }
      const y = c.y - cy;
      if (c.st === 'gone') { if (time - c.artT < 1.0) WA.shards(g, mx, y + rows * TS - 4, time - c.artT, d.kind); continue; }
      if (c.st === 'down' && d.kind !== 'stone') continue;
      const ropeTop = (d.y0 - (d.rope || 1)) * TS - cy;
      if (d.kind === 'stone') { WA.hangStone(g, x0, y, w, rows * TS, c.st === 'hang', ropeTop, time); if (c.st === 'down' && time - c.artT < 0.7) WA.shards(g, mx, y + rows * TS - 2, time - c.artT, 'stone'); }
      else if (d.kind === 'totem') WA.hangTotem(g, x0, y, w, rows * TS, c.st === 'hang', ropeTop, time);
      else if (d.kind === 'nest') WA.nest(g, x0, y + rows * TS, w, time);
      if (c.st === 'hang' && holding) WA.glint(g, mx, y + rows * TS / 2, time, '#ffd36b'); }
    /* THE HATCHETS: lying (glinting), flying (spinning, trailing), held (over the shoulder) */
    for (const q of axes) { if (!inX(q.x)) continue; const x = q.x - cx, y = q.y - cy;
      if (q.state === 'rest') { WA.hatchet(g, x, y - 4, 1.2); if (!holding && P && Math.abs(P.x - q.x) < 50 && Math.abs(P.y - q.y) < 30) WA.glint(g, x, y - 6, time, q.chief ? '#ffd36b' : '#fff6c8'); }
      else if (q.state === 'fly' || q.state === 'drop') { for (let k = 3; k >= 1; k--) { g.globalAlpha = 0.14 * (4 - k); WA.hatchet(g, x - (q.vx || 0) * 0.012 * k, y - (q.vy || 0) * 0.012 * k, (q.spin || 0) - 0.5 * k * Math.sign(q.vx || 1)); } g.globalAlpha = 1; WA.hatchet(g, x, y, q.spin || 0); }
      else if (q.state === 'held') { const f = (q.holder && q.holder.face) || 1; WA.carryPose(g, x, y, f, !!(q.holder && q.holder.hatchetPose === 'throw'), time); } }
    if (arc) CT.drawArc(g, arc, cx, cy, time, '#ffd36b');
  };
  return H;
}
