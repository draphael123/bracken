// src/war-cairn-hands.js - THE WAR CAIRN: the level's rule and its one new foe (claude/warcairn, the OPUS GREYBOX, 2026-10-29; scratch/brief-crownpath-1028.md section 2).
// src/war-cairn.js builds the level; this binds it to the game. main.js owns the world and calls:
//   reset (spawnEntities), update, strike (a hero's blow: a drum), drummer (THE DRUMMER's frame: his own machine), raging / rageMul (war-rage on a hero), surging (a clansman
//   in a surge: no flinch), props (the guide's), hoist / read (tools, the pilot bot), arenaDrums / takeDrum (THE BERSERKER CHIEFTAIN's ring), drawWorld (GREYBOX shapes).
// THE RULE (L.rule): THE CLAN FIGHTS TO ITS DRUMS. STRIKE A DRUM AND THE BEAT IS YOURS.
//   A blow that LANDS on a drum (a blade's box, a ranger's arrow in flight, the berserker's thrown axe) is a BEAT, unless the drum is SPENT (WC.beat.spent s after a beat):
//     a) every clansman within WC.beat.r tiles STUMBLES WC.beat.stumble s (e.broken: his surge and his guard broken - src/main.js reads both);
//     b) the striker takes WAR-RAGE for WC.rage.t s (x WC.rage.dealt dealt, x WC.rage.taken taken, no flinch: src/main.js hurtEnemy / damagePlayer0);
//     c) the drum's GATES swing open (WC.gate.open s: T.PORT -> AIR; they will not shut on a body), its SLABS swing level (WC.slab.level s: AIR -> ONEWAY), its CORNICES crack
//        (WC.cornice.crack s, told) and fall away (WC.cornice.gone s), then settle back.
//   THE DRUMMER's beat is the clan's: the clansmen in earshot SURGE (WC.surge.t s: x WC.surge.speed on foot, no flinch); it also works the drum's machines (the cornice over the pit).
// THE DRUMMER (e.t 'drummer', the level's ONE new foe): small, light, no weapon - he runs to his drum, beats it on a told two-count ('1' .. '2' over him), and when you come at
//   him he shoves you off (a told '!', a small push) and runs for his other drum. Cut him down and that stretch is quiet.
// Every capital line it says is a WC_SAY line (src/hint-lines.js lists them).
export const WC = {
  beat: { r: 8, stumble: 1.0, spent: 6, box: 12, arenaSpent: 6 },
  rage: { t: 5, dealt: 1.25, taken: 1.25 },
  surge: { t: 4, speed: 1.4 },
  gate: { open: 5 }, slab: { level: 4 }, cornice: { crack: 0.6, gone: 3.5 },
  drummer: { hp: 22, speed: 74, count: 0.9, every: 4.2, near: 26, shoveTell: 0.4, shove: 6, shoveV: 190, flee: 60 },
};
export const WC_SAY = {
  beat: 'THE BEAT IS YOURS', rage: 'WAR-RAGE', spent: 'THE HIDE IS SLACK', surge: 'THE CLAN SURGES', stumble: 'THEY STUMBLE', gate: 'THE DRUM GATE SWINGS OPEN',
  shut: 'THE GATE SWINGS SHUT', slab: 'THE SLABS SWING LEVEL', cornice: 'THE SNOW CRACKS', drummer: 'THE DRUMMER: STRIKE HIS DRUM FIRST', shove: 'HE SHOVES YOU OFF', his: 'HIS DRUM',
};
/* who counts as the clan (stumbles on a beat, surges on the drummer's) */
export const CLAN = new Set(['soldier', 'javelin', 'shield', 'heavy', 'berserker', 'drummer']);

export function makeWarCairnHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null;
  H.on = () => !!(L() && L().warcairn);
  const R = Math.round;
  const say = (x, y, k, col = '#ffd36b') => ctx.number(x, y, WC_SAY[k], col);
  const once = k => { if (S.said.has(k)) return false; S.said.add(k); return true; };
  const sfx = (...ks) => { for (const k of ks) { const f = ctx.sfx && ctx.sfx[k]; if (f) { try { f(); } catch {} return; } } };
  const cells = (d, t) => { for (let y = d.y0; y <= d.y1; y++) for (let x = d.x0; x <= d.x1; x++) ctx.cellSet(x, y, t); };
  const row = (x0, x1, y, t) => { for (let x = x0; x <= x1; x++) ctx.cellSet(x, y, t); };
  const drumX = d => d.x * TS + 8, drumY = d => (d.f + 1) * TS;
  const now = () => ctx.time();

  /* ---------- RESET (every load and every respawn: the grid was laid again, the foes spawned again) ---------- */
  H.reset = () => {
    const lv = L(); if (!lv || !lv.warcairn) { S = null; return; }
    const keep = S && S.L === lv ? S : null;
    const drums = new Map(), gates = new Map(), slabs = new Map(), cornices = new Map();
    for (const d of lv.wcDrums || []) drums.set(d.id, { d, spentT: 0, beatT: 0, by: null, his: false, count: 0 });
    for (const g of lv.wcGates || []) gates.set(g.id, { d: g, openT: 0, open: false });
    for (const s of lv.wcSlabs || []) slabs.set(s.id, { d: s, levelT: 0, level: false });
    for (const c of lv.wcCornices || []) cornices.set(c.id, { d: c, state: 'whole', t: 0 });
    S = { L: lv, drums, gates, slabs, cornices, said: keep ? keep.said : new Set(), sec: -1, banner: null, answer: 0,
      n: keep ? keep.n : { beats: 0, heroBeats: 0, drummerBeats: 0, stumbles: 0, surges: 0, gates: 0, slabs: 0, cornices: 0, rages: 0, shoves: 0, arrows: 0, axes: 0 } };
  };

  /* ---------- A BEAT ---------- */
  function beat(dr, by, who) {
    if (!dr || dr.spentT > 0) return false;
    const d = dr.d, x = drumX(d), y = drumY(d), arena = !!d.arena;
    dr.spentT = arena ? WC.beat.arenaSpent : WC.beat.spent; dr.beatT = 0.5; dr.by = by; S.n.beats++;
    sfx('drum', 'thud', 'heavy'); ctx.ring(x, y - 10, WC.beat.r * TS, by === 'hero' ? '#ffd36b' : '#ff4a3a'); ctx.shake(2);
    if (by === 'hero') { S.n.heroBeats++;
      /* a) THEY STUMBLE: every clansman in earshot (his surge and his guard broken) */
      let n = 0; for (const e of ctx.enemies()) { if (!e.alive || e.boss || !CLAN.has(e.t) || Math.hypot(e.x - x, (e.y - y) * 1.5) > WC.beat.r * TS) continue;
        e.broken = Math.max(e.broken || 0, WC.beat.stumble); e.bkSoft = false; e.wcSurge = 0; e.vx = 0; if (e.mode && /Tell$/.test(e.mode)) { e.mode = 'walk'; e.modeT = 0.3; } n++; }
      if (n) { S.n.stumbles += n; if (once('stumble')) say(x, y - 50, 'stumble', '#8fd160'); }
      /* b) WAR-RAGE on the striker */
      const p = who || ctx.hero(); if (p && !p.dead) { p.wcRageT = now() + WC.rage.t; S.n.rages++; if (once('rage')) say(p.x, p.y - 40, 'rage', '#ff6b3c'); }
      if (once('beat')) say(x, y - 64, 'beat', '#ffd36b');
      if (arena && ctx.bossBeat) ctx.bossBeat(d.id, 'hero'); }
    else if (by === 'drummer') { S.n.drummerBeats++;
      let n = 0; for (const e of ctx.enemies()) { if (!e.alive || e.boss || !CLAN.has(e.t) || e.t === 'drummer' || Math.hypot(e.x - x, (e.y - y) * 1.5) > WC.beat.r * TS) continue; e.wcSurge = now() + WC.surge.t; n++; }
      if (n) { S.n.surges += n; if (once('surge')) say(x, y - 50, 'surge', '#ff6b6b'); } }
    /* c) THE BEAT MOVES THINGS */
    for (const id of d.gates) { const g = S.gates.get(id); if (!g) continue; if (!g.open) { cells(g.d, ctx.T.AIR); g.open = true; S.n.gates++; } g.openT = WC.gate.open; }
    if (d.gates.length && once('gate')) say(x, y - 40, 'gate', '#8fd160');
    for (const id of d.slabs) { const s = S.slabs.get(id); if (!s) continue; if (!s.level) { row(s.d.x0, s.d.x1, s.d.y, ctx.T.ONEWAY); s.level = true; S.n.slabs++; } s.levelT = WC.slab.level; }
    if (d.slabs.length && once('slab')) say(x, y - 40, 'slab', '#8fd160');
    for (const id of d.cornices) { const c = S.cornices.get(id); if (!c || c.state !== 'whole') continue; c.state = 'crack'; c.t = WC.cornice.crack; S.n.cornices++; if (once('cornice')) say((c.d.x0 + c.d.x1) / 2 * TS + 8, c.d.y * TS - 20, 'cornice', '#c8d8e8'); }
    return true;
  }
  H.beat = (id, by = 'hero') => { const dr = S && S.drums.get(id); return dr ? beat(dr, by, null) : false; };

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!S) return; const lv = L(), ps = ctx.players(), P = ps[0], t = now();
    for (const dr of S.drums.values()) { dr.spentT = Math.max(0, dr.spentT - dt); dr.beatT = Math.max(0, dr.beatT - dt); }
    /* THE GATES swing shut when their time is up - never on a body */
    for (const g of S.gates.values()) { if (!g.open) continue; g.openT -= dt; if (g.openT > 0) continue;
      const d = g.d, x0 = d.x0 * TS - 6, x1 = (d.x1 + 1) * TS + 6, y0 = d.y0 * TS - 2, y1 = (d.y1 + 1) * TS + 18;
      const inIt = ps.some(p => p && !p.dead && p.x > x0 && p.x < x1 && p.y > y0 && p.y - 14 < y1) || ctx.enemies().some(e => e.alive && e.x > x0 && e.x < x1 && e.y > y0 && e.y - (e.h || 12) < y1);
      if (inIt) { g.openT = 0.15; continue; }
      cells(d, ctx.T.PORT); g.open = false; sfx('thud', 'clank'); if (once('shut')) say((d.x0 + 0.5) * TS, d.y0 * TS - 14, 'shut', '#c8b8a8'); }
    /* THE SLABS swing back on their chains (and whoever was on one goes with it) */
    for (const s of S.slabs.values()) { if (!s.level) continue; s.levelT -= dt; if (s.levelT > 0) continue; row(s.d.x0, s.d.x1, s.d.y, ctx.T.AIR); s.level = false; sfx('clank', 'thud'); }
    /* THE CORNICES: crack -> gone -> settle back */
    for (const c of S.cornices.values()) { if (c.state === 'whole') continue; c.t -= dt;
      if (c.state === 'crack' && c.t <= 0) { c.state = 'gone'; c.t = WC.cornice.gone; row(c.d.x0, c.d.x1, c.d.y, ctx.T.AIR); sfx('puff', 'thud'); ctx.dust((c.d.x0 + c.d.x1) / 2 * TS + 8, c.d.y * TS, 10); }
      else if (c.state === 'gone' && c.t <= 0) { const bx0 = c.d.x0 * TS, bx1 = (c.d.x1 + 1) * TS, by = c.d.y * TS;
        if (ps.some(p => p && !p.dead && p.x > bx0 - 4 && p.x < bx1 + 4 && p.y > by - 4 && p.y < by + 20)) { c.t = 0.1; continue; }   /* (not into a body) */
        c.state = 'whole'; row(c.d.x0, c.d.x1, c.d.y, ctx.T.ONEWAY); } }
    /* A RANGER'S ARROW or A THROWN AXE in flight through a drum is a beat (any blow that lands - the brief: every hero can use it) */
    for (const p of ps) { if (!p || p.dead) continue;
      for (const a of p.rgArrows || []) { if (a.state !== 'fly') continue; for (const dr of S.drums.values()) { if (dr.spentT > 0) continue; const x = drumX(dr.d), y = drumY(dr.d);
        if (Math.abs(a.x - x) < WC.beat.box && a.y > y - 22 && a.y < y + 2 && !(a.wcHit && a.wcHit.has(dr))) { (a.wcHit || (a.wcHit = new Set())).add(dr); if (beat(dr, 'hero', p)) S.n.arrows++; } } }
      const ax = p.bzAxe; if (ax && ax.state === 'fly') for (const dr of S.drums.values()) { if (dr.spentT > 0) continue; const x = drumX(dr.d), y = drumY(dr.d);
        if (Math.abs(ax.x - x) < WC.beat.box + 2 && ax.y > y - 24 && ax.y < y + 4 && !(ax.wcHit && ax.wcHit.has(dr))) { (ax.wcHit || (ax.wcHit = new Set())).add(dr); if (beat(dr, 'hero', p)) S.n.axes++; } } }
    /* THE CLAN's SURGE: quicker on foot while it lasts */
    for (const e of ctx.enemies()) { if (!e.alive || !CLAN.has(e.t)) continue; const on = (e.wcSurge || 0) > t;
      if (on && !e.wcSpd0 && e.speed) { e.wcSpd0 = e.speed; e.speed = Math.round(e.speed * WC.surge.speed); } else if (!on && e.wcSpd0) { e.speed = e.wcSpd0; e.wcSpd0 = 0; } }
    /* THE NAMED AREAS: the banner when you come into one */
    if (P && lv.sections) { const k = lv.sections.findIndex(s => P.x >= s.x0 * TS && P.x < s.x1 * TS); if (k >= 0 && k !== S.sec) { S.banner = { name: lv.sections[k].name, t: 3.4 }; S.sec = k; } }
    if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; }
    if (S.answer > 0) S.answer = Math.max(0, S.answer - dt);
  };

  /* ---------- A HERO'S BLOW (main.js attackBox): a drum it lands on is a beat ---------- */
  H.strike = hb => { if (!S || !hb) return;
    for (const dr of S.drums.values()) { const d = dr.d, x = drumX(d), y = drumY(d), box = { l: x - WC.beat.box, r: x + WC.beat.box, t: y - 22, b: y };
      if (hb.l < box.r && hb.r > box.l && hb.t < box.b && hb.b > box.t && (!ctx.hitOnce || ctx.hitOnce(dr))) { if (dr.spentT > 0) { if (once('spent')) say(x, y - 34, 'spent', '#c8b8a8'); continue; } if (dr.his) { say(x, y - 34, 'his', '#ff6b6b'); continue; } beat(dr, 'hero', ctx.hero()); } } };

  /* ---------- WAR-RAGE on a hero (src/main.js) ---------- */
  H.raging = p => !!(S && p && (p.wcRageT || 0) > now());
  H.surging = e => !!(S && e && (e.wcSurge || 0) > now());

  /* ---------- THE DRUMMER (main.js updateEnemies: his own machine) ---------- */
  H.drummer = (e, dt) => {
    const D = WC.drummer, P = ctx.players()[0], t = now();
    if (!S) return false;
    e.vy = Math.min(270, (e.vy || 0) + 1000 * dt); e.modeT = (e.modeT || 0) - dt; e.anim = (e.anim || 0) + dt;
    const dr = S.drums.get(e.drum) || null, dx = dr ? drumX(dr.d) - e.x : 0, pd = P && !P.dead ? P.x - e.x : 9999, near = Math.abs(pd) < D.near && P && Math.abs(P.y - e.y) < 30;
    if (ctx.seen && P && Math.abs(pd) < 200) ctx.seen('drummer');
    let want = 0;
    if (e.stagger > 0 || e.broken > 0) { if (e.mode === 'count') { e.mode = 'walk'; e.modeT = 0.5; } }
    else if (e.mode === 'shoveTell') { if (e.modeT <= 0) { e.mode = 'flee'; e.modeT = 2.2; S.n.shoves++;
        if (P && near) { let res = null; ctx.asPlayer(P, () => { res = ctx.damage(e.x, D.shove, { who: e, name: 'THE SHOVE' }); }); if (res !== 'blocked') { P.vx = (Math.sign(pd) || 1) * D.shoveV; P.vy = Math.min(P.vy || 0, -90); } if (once('shove')) say(e.x, e.y - 30, 'shove', '#ffd36b'); }
        const ds = (e.drums || []).filter(id => id !== e.drum); if (ds.length) e.drum = ds[0]; } }
    else if (e.mode === 'count') { e.vx = 0; const k = e.modeT <= D.count / 2 ? 2 : 1; if (k !== e.countK) { e.countK = k; ctx.number(e.x, e.y - 22, String(k), '#ff6b6b'); sfx('tell'); }
      if (e.modeT <= 0) { if (dr && beat(dr, 'drummer', null)) { e.beatAt = t; } e.mode = 'walk'; e.modeT = D.every; } }
    else {   /* walk / flee: to his drum; at it, beat it on his count when it is ready; a hero on him - the shove */
      if (near && e.mode !== 'flee') { e.mode = 'shoveTell'; e.modeT = D.shoveTell; e.face = Math.sign(pd) || e.face; ctx.number(e.x, e.y - 24, '!', '#ffd36b'); sfx('tell'); }
      else if (dr && Math.abs(dx) > 10) { want = Math.sign(dx) * D.speed * (e.mode === 'flee' ? 1.25 : 1); e.face = Math.sign(dx) || e.face; }
      else { if (e.mode === 'flee' && e.modeT > 0) e.mode = 'walk'; e.face = P ? Math.sign(pd) || e.face : e.face;
        if (dr && dr.spentT <= 0 && e.modeT <= 0 && P && Math.abs(pd) < 260) { e.mode = 'count'; e.modeT = D.count; e.countK = 0; if (once('drummer')) say(e.x, e.y - 40, 'drummer', '#ff9a5c'); } } }
    e.vx += (want - (e.vx || 0)) * Math.min(1, dt * 8);
    const r = ctx.moveBody(e, e.vx * dt, e.vy * dt); if (r && r.ground) e.vy = 0;
    return true;
  };

  /* ---------- THE ARENA'S DRUMS (src/bzchief-hands.js) ---------- */
  H.arenaDrums = () => S ? [...S.drums.values()].filter(dr => dr.d.arena).map(dr => ({ id: dr.d.id, x: drumX(dr.d), spent: dr.spentT > 0 })) : [];
  H.takeDrum = id => { if (!S) return; for (const dr of S.drums.values()) if (dr.d.arena) dr.his = dr.d.id === id; const dr = S.drums.get(id); if (dr) { dr.beatT = 0.5; sfx('drum', 'thud', 'heavy'); ctx.ring(drumX(dr.d), drumY(dr.d) - 10, 40, '#ff4a3a'); } };
  H.drumsAnswer = k => { if (S) S.answer = 2.5; };
  H.clearArena = () => { if (S) for (const dr of S.drums.values()) if (dr.d.arena) { dr.his = false; dr.spentT = 0; } };

  /* ---------- THE GUIDE's props (src/stuck-spots.js reads `on`), the tools, the pilot bot ---------- */
  const drumDone = dr => dr.spentT > 0 || dr.d.gates.some(id => { const g = S.gates.get(id); return g && g.open; }) || dr.d.slabs.some(id => { const s = S.slabs.get(id); return s && s.level; });
  H.props = () => { if (!S) return []; const out = []; for (const dr of S.drums.values()) if (!dr.d.arena) out.push({ t: 'wcdrum', id: dr.d.id, x: drumX(dr.d), y: drumY(dr.d), on: drumDone(dr) }); return out; };
  H.hoist = id => { const dr = S && S.drums.get(id); return dr ? { state: drumDone(dr) ? 'cut' : 'hang', d: (L().hoists || []).find(h => h.id === id) } : null; };
  H.read = () => S ? { drums: [...S.drums.values()].map(dr => ({ id: dr.d.id, spent: +dr.spentT.toFixed(2), his: dr.his })), gates: [...S.gates.values()].map(g => ({ id: g.d.id, open: g.open, t: +g.openT.toFixed(2) })),
    slabs: [...S.slabs.values()].map(s => ({ id: s.d.id, level: s.level })), cornices: [...S.cornices.values()].map(c => ({ id: c.d.id, state: c.state })), banner: S.banner ? S.banner.name : null, sec: S.sec,
    n: JSON.parse(JSON.stringify(S.n)) } : null;

  /* ---------- DRAWING (GREYBOX: flat granite and war-paint red; ART TODO - src/redraw/warcairn_art.js) ---------- */
  const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  H.drawWorld = (g, cx, cy, VW, VH, time) => {
    if (!S) return; const lv = L(), inX = (x, m = 80) => x - cx > -m && x - cx < VW + m;
    /* THE DRUM GATES: hide on a bone frame (closed), swung open (a thin edge) */
    for (const gt of S.gates.values()) { const d = gt.d, x = d.x0 * TS - cx, y = d.y0 * TS - cy, w = (d.x1 - d.x0 + 1) * TS, h = (d.y1 - d.y0 + 1) * TS; if (!inX(d.x0 * TS, 120)) continue;
      if (!gt.open) { rect(g, x, y, w, h, '#a88a64'); rect(g, x, y, w, 2, '#e8dcc0'); rect(g, x, y + h - 2, w, 2, '#e8dcc0'); for (let k = 3; k < w - 2; k += 6) rect(g, x + k, y + 2, 1, h - 4, '#7a2420'); }
      else { rect(g, x, y, 2, h, '#a88a64'); g.globalAlpha = Math.min(1, gt.openT / 1.2); rect(g, x, y - 3, w, 2, '#ffd36b'); g.globalAlpha = 1; } }
    /* THE CHAINED SLABS: hanging on their chains (tilted), or swung level */
    for (const s of S.slabs.values()) { const d = s.d, x = d.x0 * TS - cx, y = d.y * TS - cy, w = (d.x1 - d.x0 + 1) * TS; if (!inX(d.x0 * TS, 200)) continue;
      g.strokeStyle = '#4a4744'; g.beginPath(); g.moveTo(x + 2, y - 40); g.lineTo(x + 2, y); g.moveTo(x + w - 2, y - 40); g.lineTo(x + w - 2, s.level ? y : y + 24); g.stroke();
      if (s.level) { rect(g, x, y, w, 6, '#7a8494'); rect(g, x, y, w, 1, '#c8d0dc'); }
      else { g.fillStyle = '#5a6270'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + 24); g.lineTo(x + w, y + 30); g.lineTo(x, y + 6); g.closePath(); g.fill(); } }
    /* THE SLATE SPANS' CARVED POSTS (L.structures 'cairnArch': the second heights stand on them - greybox: flat granite posts at each end and every few tiles) */
    for (const z of lv.structures || []) { if (z.kind !== 'cairnArch' || !inX(z.x0 * TS, 260)) continue; const y0 = z.top * TS - cy, y1 = z.floor * TS - cy, n = z.x1 - z.x0 + 1, step = Math.max(2, Math.ceil(n / 3));
      const xs = []; for (let x = z.x0; x <= z.x1; x += step) xs.push(x); if (xs[xs.length - 1] !== z.x1) xs.push(z.x1);
      for (const x of xs) { rect(g, x * TS - cx + 5, y0 + 2, 6, y1 - y0 - 2, '#6e6a62'); rect(g, x * TS - cx + 5, y0 + 2, 1, y1 - y0 - 2, '#8e8a84'); }
      rect(g, z.x0 * TS - cx, y0, n * TS, 3, '#8e98a8'); }
    /* THE CORNICES: old snow (whole, cracking - a seam and a puff - or gone) */
    for (const c of S.cornices.values()) { if (c.state === 'gone') continue; const d = c.d, x = d.x0 * TS - cx, y = d.y * TS - cy, w = (d.x1 - d.x0 + 1) * TS; if (!inX(d.x0 * TS, 120)) continue;
      rect(g, x, y, w, 5, '#e8eef4'); rect(g, x + 2, y + 5, w - 4, 3, '#c8d4e0');
      if (c.state === 'crack') { const sh = Math.sin(time * 60) * 1; for (let k = 4; k < w; k += 11) rect(g, x + k + sh, y + 1, 1, 4, '#4a5a6a'); } }
    /* THE DRIVEN HATCHETS (footholds) */
    for (const h of lv.wcHolds || []) { const x = h.x * TS - cx, y = h.y * TS - cy; if (!inX(h.x * TS)) continue; rect(g, x + (h.dir > 0 ? 6 : 0), y + 1, 10, 3, '#6a4428'); rect(g, x + (h.dir > 0 ? 12 : 0), y - 2, 4, 6, '#c8ccd4'); }
    /* THE DRUMS: hide on a stone-and-antler frame, war-paint red; the earshot ring as it beats; slack (dim) while spent; HIS drum burns red */
    for (const dr of S.drums.values()) { const d = dr.d, x = drumX(d) - cx, y = drumY(d) - cy; if (!inX(drumX(d))) continue;
      rect(g, x - 8, y - 4, 2, 4, '#8a8478'); rect(g, x + 6, y - 4, 2, 4, '#8a8478');
      rect(g, x - 9, y - 18, 18, 14, dr.his ? '#c8281e' : dr.spentT > 0 ? '#7a6a58' : '#b89a72'); rect(g, x - 9, y - 18, 18, 2, '#e8dcc0'); rect(g, x - 2, y - 15, 4, 8, '#9a2a24');
      g.strokeStyle = '#d8d0c0'; g.beginPath(); g.moveTo(x - 9, y - 18); g.lineTo(x - 12, y - 25); g.moveTo(x + 9, y - 18); g.lineTo(x + 12, y - 25); g.stroke();   /* the antlers */
      if (dr.spentT > 0 && dr.spentT < 1.2) { g.globalAlpha = 1 - dr.spentT / 1.2; rect(g, x - 9, y - 18, 18, 2, '#ffd36b'); g.globalAlpha = 1; }   /* (it tightens: a glow) */
      if (dr.beatT > 0) { g.globalAlpha = dr.beatT * 2; g.strokeStyle = dr.by === 'drummer' ? '#ff4a3a' : '#ffd36b'; g.beginPath(); g.arc(R(x), R(y - 10), R((0.5 - dr.beatT) * 2 * WC.beat.r * TS) + 4, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
      if (d.arena && S.answer > 0) { g.globalAlpha = Math.min(1, S.answer); rect(g, x - 9, y - 20 - R(Math.abs(Math.sin(time * 9)) * 3), 18, 2, '#ff4a3a'); g.globalAlpha = 1; } }
    /* THE AREA BANNER */
    if (S.banner && ctx.text) { const a = Math.min(1, S.banner.t / 0.6, (3.4 - S.banner.t) / 0.4); g.globalAlpha = Math.max(0, a); ctx.text(S.banner.name, R(VW / 2), 34, '#ffe0c8', 'center', 8); g.globalAlpha = 1; }
  };
  /* OVER a hero in WAR-RAGE: a red edge (main.js calls it after the heroes) */
  H.drawOver = (g, cx, cy, time) => { if (!S) return; for (const p of ctx.players()) { if (!p || p.dead || !((p.wcRageT || 0) > now())) continue;
    g.globalAlpha = 0.35 + 0.2 * Math.sin(time * 12); g.strokeStyle = '#ff4a3a'; g.strokeRect(R(p.x - cx) - 7, R(p.y - cy) - 22, 14, 22); g.globalAlpha = 1; } };
  /* THE DRUMMER, greybox: a hide drum on his back, sticks (main.js draws his body: SPR.drummer) */
  H.drummerOver = (g, e, cx, cy, time) => { if (!e.alive) return; const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1; rect(g, x - f * 6 - 3, y - 12, 6, 7, '#b89a72'); rect(g, x - f * 6 - 3, y - 12, 6, 1, '#e8dcc0');
    if (e.mode === 'count') { const k = Math.floor(time * 8) % 2; rect(g, x + f * 3, y - 16 - k * 2, 1, 6, '#e8dcc0'); } };
  return H;
}
