// src/rootway-hands.js - THE ROOTWAY's rule and machines (claude/rootway, the GREYBOX, 2026-10-07; brief .claude/briefs/brief-rootway.md).
// src/rootway.js builds the level; this binds it to the game. main.js owns the world and calls:
//   reset (spawnEntities), on, update, strike (a blow's box), interact (E at the loft), props (the guide's), hunterStep (THE TROPHY-HUNTER, a CV machine),
//   newHunter (his spawn), cutHoist / dropOn / bossHoists (src/huntmaster.js), drawWorld, read (tools).
// THE RULE (L.rule): THE CAPS GROW INTO STEPS; THE GOBLINS' HOISTS DROP WHAT THEY HOLD. STOP ON A BUD TO GROW IT; CUT A HOIST'S ROPE TO DROP ITS LOAD.
//   The buds are main.js's growcap movers (Sporewood's). A HOIST (L.hoists) hangs its load on a rope tied off at a CLEAT; a blow on the cleat (or an
//   arrow struck back through an `arrow` hoist's tie-off) cuts it and the load DROPS: a SPAN lands across its gap and stays (one-way cells), a CAGE crushes
//   what is under it and stays as a 2x2 step (solid cells) - a boss cage is winched back up after HOIST.winch s - and a HUNTER falls dazed.
//   What a hoist drops STAYS for the attempt: a death keeps the spans and the cages (the road you opened stays open); its hunters come back with the rest.
// Every capital line it says goes through ctx.number with a line listed in src/hint-lines.js.
export const HOIST = { g: 900, vmax: 520, crush: 30, cageDmg: 16, caged: 1.0, winch: 8, winchV: 60, hunterFall: 8, daze: 1.8, dropTell: 0.45, under: 28 };
export const HUNTER = { hp: 26, w: 10, h: 16, walk: 46, keep: 24, jabAt: 34, jabTell: 0.42, jab: 0.16, jabReach: 30, jabDmg: 10, lungeAt: 96, lungeFar: 200, lungeTell: 0.55, lunge: 0.42, lungeV: 230, lungeDmg: 12, recover: 0.5, cd: 1.3, lungeCd: 2.4 };
export const LOOKOUT = { respawn: 4 };

export function makeRootwayHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null;
  H.on = () => !!(L() && L().rootway);
  /* the state of every hoist (by id), kept across a death on the same load of the level */
  H.reset = () => {
    const lv = L(); if (!lv || !lv.rootway) { S = null; return; }
    const keep = S && S.L === lv ? S : null;
    const hs = new Map();
    for (const d of (lv.hoists || [])) { const was = keep && keep.hs.get(d.id);
      const stay = was && !d.boss && d.load !== 'hunter' && was.state !== 'hang';   /* a span or a cage already down stays down (its cells are in the grid) */
      hs.set(d.id, stay ? was : { d, id: d.id, state: 'hang', ly: (d.hang + 1) * TS, vy: 0, t: 0, hunter: null, tellT: 0 }); }
    const lo = (lv.ents || []).find(e => e.t === 'loft');
    S = { L: lv, hs, loft: lo ? { x: lo.x * TS + 8, y: (lo.y + 1) * TS, open: keep ? keep.loft && keep.loft.open : false } : null, lookT: 0, said: keep ? keep.said : new Set(), n: keep ? keep.n : { cuts: 0, arrowCuts: 0, crushed: 0, hunterDrops: 0, hunterCut: 0, lookouts: 0 } };
    /* the hunters on their hoists, and the lookout's scout */
    for (const e of ctx.enemies()) { if (!e.alive) continue;
      if (e.t === 'trophyhunter' && e.st && e.st.hang) { const h = hs.get(e.st.hang); if (h && h.state === 'hang') h.hunter = e; else { e.st.hang = null; e.st.mode = 'fall'; e.noGrav = false; } }
      if (e.t === 'archer') { const d = (lv.hoists || []).find(q => q.post && Math.abs(q.post[0] * TS + 8 - e.x) < 3 * TS && Math.abs((q.post[1] + 1) * TS - e.y) < 2 * TS); if (d) e.rwLookout = d.id; } }
    if (S.loft && S.loft.open) for (const v of (lv.vaultDoors || [])) for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) ctx.cellSet(x, y, ctx.T.AIR);
  };
  H.load = () => { S = null; H.reset(); };
  const say = (k, x, y, line, col) => { if (k && S.said.has(k)) return; if (k) S.said.add(k); ctx.number(x, y, line, col || '#ffd36b'); };
  const cleatBox = d => ({ l: d.cleat[0] * TS + 2, r: d.cleat[0] * TS + 14, t: (d.cleat[1] - 1) * TS, b: (d.cleat[1] + 1) * TS });
  const loadW = d => d.load === 'span' ? (d.span[1] - d.span[0] + 1) * TS : d.load === 'cage' ? 2 * TS : 12;
  const loadX = d => d.load === 'span' ? (d.span[0] * TS + (d.span[1] + 1) * TS) / 2 : d.x * TS;   /* the centre of what hangs */
  const standAt = (tx, ty) => ctx.solidAt(tx, ty) || ctx.tileAt(tx, ty) === ctx.T.ONEWAY || ctx.tileAt(tx, ty) === ctx.T.PLANK;

  /* CUT: the rope goes, the load falls (a hunter falls DAZED) */
  function cut(h, how) {
    if (!S || h.state !== 'hang') return false; const d = h.d; S.n.cuts++; if (how === 'arrow') S.n.arrowCuts++;
    ctx.sfx.crack && ctx.sfx.crack(); ctx.sfx.clank && ctx.sfx.clank(); ctx.burst(d.cleat[0] * TS + 8, d.cleat[1] * TS, 8, ['#c9b27c', '#8a6a48', '#ffe9a0'], 60, 0.5);
    if (d.load === 'hunter') { h.state = 'down'; const e = h.hunter; h.hunter = null;
      if (e && e.alive && e.st) { e.st.hang = null; e.st.mode = 'fall'; e.st.daze = HOIST.daze; e.noGrav = false; S.n.hunterCut++; ctx.hurt(e, HOIST.hunterFall, e.x);
        say(null, e.x, e.y - 30, 'HE FALLS: CUT HIM WHILE HE IS DOWN', '#8fd160'); }
      return true; }
    h.state = 'fall'; h.vy = 0;
    if (how === 'arrow') say(null, d.cleat[0] * TS + 8, d.cleat[1] * TS - 20, 'THE ARROW CUTS THE ROPE', '#8fd160');
    else if (!d.boss) say('cut:' + d.load, d.cleat[0] * TS + 8, d.cleat[1] * TS - 20, 'THE HOIST DROPS WHAT IT HOLDS', '#ffd36b');
    return true;
  }
  H.cutHoist = id => { const h = S && S.hs.get(id); return h ? cut(h, 'boss') : false; };
  /* the boss's hoists, for src/huntmaster.js: where each cage hangs and whether it is up */
  H.bossHoists = () => S ? [...S.hs.values()].filter(h => h.d.boss).map(h => ({ id: h.id, x: loadX(h.d), cleat: h.d.cleat, up: h.state === 'hang', state: h.state, ly: h.ly })) : [];
  /* a cage on the hero (or the Huntmaster): box of a 2x2 cage at its centre x, bottom y */
  const cageBox = (x, b) => ({ l: x - TS, r: x + TS, t: b - 2 * TS, b });

  /* LANDING */
  function land(h) {
    const d = h.d, x = loadX(d); h.state = 'down'; h.t = 0; ctx.shake(d.load === 'span' ? 3 : 4); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.dust(x, h.ly, 10);
    if (d.load === 'span') { for (let cx = d.span[0]; cx <= d.span[1]; cx++) ctx.cellSet(cx, d.span[2], ctx.T.ONEWAY);
      say('land:span', x, h.ly - 24, 'THE SPAN LANDS: A BRIDGE', '#8fd160'); return; }
    /* a cage: what is under it is crushed (a foe takes HOIST.crush; the hero the cage's blow and a moment caged) */
    const bx = cageBox(x, h.ly);
    for (const e of ctx.enemies()) if (e.alive && !e.maxHp && ctx.overlap(bx, ctx.box(e))) { ctx.hurt(e, d.land ? 999 : HOIST.crush, x); S.n.crushed++; ctx.number(e.x, e.y - 20, 'CRUSHED', '#8fd160'); }
    for (const p of ctx.players()) if (p && !p.dead && ctx.overlap(bx, ctx.boxOf(p))) ctx.asPlayer(p, () => { ctx.damage(x, HOIST.cageDmg, { up: true, unblockable: true, name: 'THE CAGE' }); p.caged = HOIST.caged; ctx.number(p.x, p.y - 24, 'CAUGHT', '#ff6b6b');
      if (d.land) { p.y = d.land[1] * TS; p.vy = 0; } });   /* (a hero under a cage that stays is set on its top: never inside the rock it becomes) */
    if (d.land) { for (let y = d.land[1]; y <= d.land[1] + 1; y++) for (let cx = d.land[0]; cx <= d.land[0] + 1; cx++) ctx.cellSet(cx, y, ctx.T.SOLID);
      say('land:cage', x, h.ly - 40, 'THE CAGE LANDS: A STEP', '#8fd160'); }
    if (d.boss && ctx.bossCage) ctx.bossCage(h.id, x, h.ly);   /* THE HUNTMASTER under it is CAUGHT (src/huntmaster.js) */
  }

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!S) return; const P = ctx.players()[0];
    /* AN ARROW STRUCK BACK cuts the rope of an `arrow` hoist it flies through (THE LOOKOUT) */
    for (const s of ctx.seeds()) { if (s.dead || !s.reflected || !s.arrow) continue;
      for (const h of S.hs.values()) { const d = h.d; if (!d.arrow || h.state !== 'hang') continue; const cx = d.cleat[0] * TS + 8;
        if (Math.abs(s.x - cx) < 10 && s.y > (d.cleat[1] - 2) * TS && s.y < (d.cleat[1] + 3) * TS) cut(h, 'arrow'); } }
    for (const h of S.hs.values()) { const d = h.d;
      if (h.state === 'fall') { h.vy = Math.min(HOIST.vmax, h.vy + HOIST.g * dt); h.ly += h.vy * dt;
        const target = d.load === 'span' ? (d.span[2] + 1) * TS : d.land ? (d.land[1] + 2) * TS : null;
        if (target !== null) { if (h.ly >= target) { h.ly = target; land(h); } }
        else { const x = loadX(d), ty = Math.floor(h.ly / TS); if (standAt(Math.floor((x - 8) / TS), ty) || standAt(Math.floor((x + 8) / TS), ty) || ty >= L().H - 1) { h.ly = ty * TS; land(h); } } }
      else if (h.state === 'down' && d.boss) { h.t += dt; if (h.t >= HOIST.winch) { h.state = 'winch'; ctx.sfx.clank && ctx.sfx.clank(); } }
      else if (h.state === 'winch') { h.ly -= HOIST.winchV * dt; if (h.ly <= (d.hang + 1) * TS) { h.ly = (d.hang + 1) * TS; h.state = 'hang'; } }
      /* A HUNTER ON THE HOIST: he rides it down onto you as you pass under (told), unless the rope is cut first */
      if (d.load === 'hunter' && h.state === 'hang') { const e = h.hunter;
        if (!e || !e.alive) { h.state = 'down'; h.hunter = null; continue; }
        const s = e.st; s.x = e.x = d.x * TS; s.y = e.y = h.ly; e.vy = 0;
        if (s.mode === 'hang' && P && !P.dead && Math.abs(P.x - d.x * TS) < HOIST.under && P.y > h.ly + 8 && P.y - h.ly < 15 * TS) { s.mode = 'dropTell'; s.t = HOIST.dropTell; ctx.sfx.clank && ctx.sfx.clank(); ctx.number(e.x, e.y - 26, '!', '#ffd36b'); }
        if (s.mode === 'dropTell') { h.tellT = s.t; if (s.t <= 0) { s.hang = null; s.mode = 'fall'; e.noGrav = false; h.state = 'down'; h.hunter = null; S.n.hunterDrops++; say('hunterDrop', e.x, e.y - 30, 'THE HUNTER DROPS ON YOU', '#ff9a5c'); } } } }
    /* THE LOOKOUT IS MANNED: if its scout falls before its span is down, another takes the post (never a soft-lock) */
    for (const h of S.hs.values()) { const d = h.d; if (!d.post || h.state !== 'hang') continue;
      if (ctx.enemies().some(e => e.alive && e.rwLookout === h.id)) { S.lookT = 0; continue; }
      S.lookT += dt; if (S.lookT >= LOOKOUT.respawn) { S.lookT = 0; const got = ctx.spawn({ t: 'archer', x: d.post[0], y: d.post[1], face: -1 }); for (const e of got) e.rwLookout = h.id; S.n.lookouts++;
        ctx.number(d.post[0] * TS + 8, d.post[1] * TS - 10, 'ANOTHER SCOUT TAKES THE POST', '#ff9a5c'); } }
  };

  /* ---------- A BLOW ON A CLEAT ---------- */
  H.strike = hb => { if (!S || !hb) return; for (const h of S.hs.values()) { const d = h.d; if (d.arrow || h.state !== 'hang') continue; if (ctx.overlap(hb, cleatBox(d))) cut(h, 'blade'); } };
  /* ---------- E AT THE LOFT: the tags ---------- */
  H.interact = p => {
    if (!S || !S.loft || S.loft.open || !p) return false; const lo = S.loft; if (Math.abs(p.x - lo.x) > 22 || Math.abs(p.y - lo.y) > 24) return false;
    if (ctx.questGot() < ctx.questN()) { ctx.number(lo.x, lo.y - 30, 'THE LOFT WANTS FOUR TAGS', '#ffb070'); return true; }
    lo.open = true; for (const v of (L().vaultDoors || [])) for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) ctx.cellSet(x, y, ctx.T.AIR);
    ctx.sfx.sting && ctx.sfx.sting(); ctx.burst(lo.x - 30, lo.y - 30, 18, ['#e8dcc0', '#c9a060', '#ffd36b'], 80, 0.8); ctx.number(lo.x, lo.y - 30, 'THE TROPHY LOFT OPENS', '#8fd160'); return true;
  };

  /* ---------- THE GOBLIN TROPHY-HUNTER (the one new foe): a CV-style machine (main.js updateDesertFoe runs it; s = e.st) ----------
     hang       on his hoist (the hands carry him); dropTell: a yellow ! and the creak - he lets go
     fall       down off the hoist (dazed if his rope was cut: daze, HOIST.daze s, every blow lands)
     walk       at you; far off (HUNTER.lungeAt..lungeFar) he gathers for the LUNGE (lungeTell, a yellow !: a shield turns it), close in he JABS (jabTell, a yellow !) */
  H.newHunter = (x, y, hang) => ({ kind: 'trophyhunter', x, y, hang: hang || null, mode: hang ? 'hang' : 'walk', t: 0, cd: 0.6 + (Math.floor(x) % 5) * 0.2, face: -1, frame: 0, daze: 0 });
  H.hunterStep = (s, w, dt) => {
    const out = [], ev = (t, o) => out.push({ t, ...(o || {}) }); s.t -= dt; s.cd -= dt;
    const dx = w.px - s.x, dy = w.py - s.y, ad = Math.abs(dx), fwd = s.face || -1;
    switch (s.mode) {
      case 'hang': s.frame = 0; break;
      case 'dropTell': s.frame = 0; break;   /* (the hands count his tell down and let him go) */
      case 'fall': s.frame = 2; if (w.ground) { if (s.daze > 0) { s.mode = 'daze'; s.t = s.daze; s.daze = 0; ev('land', { x: s.x, y: s.y }); } else { s.mode = 'walk'; s.t = 0.2; ev('land', { x: s.x, y: s.y }); } } break;
      case 'daze': s.frame = 7; if (s.t <= 0) { s.mode = 'walk'; s.cd = 0.6; } break;
      case 'walk': s.frame = 4 + (Math.floor(w.time * 7) % 2); s.face = Math.sign(dx) || s.face;
        if (s.cd <= 0 && ad > HUNTER.lungeAt && ad < HUNTER.lungeFar && Math.abs(dy) < 30) { s.mode = 'lungeTell'; s.t = HUNTER.lungeTell; s.frame = 3; ev('tell', { what: 'lunge', mark: '!' }); break; }
        if (s.cd <= 0 && ad < HUNTER.jabAt && Math.abs(dy) < 24) { s.mode = 'jabTell'; s.t = HUNTER.jabTell; s.frame = 3; ev('tell', { what: 'slash', mark: '!' }); break; }
        if (ad > HUNTER.keep && ad < 260 && Math.abs(dy) < 60) s.x += s.face * HUNTER.walk * dt; break;
      case 'lungeTell': s.frame = 3; if (s.t <= 0) { s.mode = 'lunge'; s.t = HUNTER.lunge; } break;
      case 'lunge': s.frame = 6; s.x += fwd * HUNTER.lungeV * dt; ev('hit', { what: 'lunge', box: fwd > 0 ? [s.x - 4, s.x + 18, s.y - 14, s.y] : [s.x - 18, s.x + 4, s.y - 14, s.y], dmg: HUNTER.lungeDmg, blockable: true });
        if (s.t <= 0) { s.mode = 'recover'; s.t = HUNTER.recover + 0.2; s.cd = HUNTER.lungeCd; } break;
      case 'jabTell': s.frame = 3; if (s.t <= 0) { s.mode = 'jab'; s.t = HUNTER.jab; } break;
      case 'jab': s.frame = 6; ev('hit', { what: 'jab', box: fwd > 0 ? [s.x, s.x + HUNTER.jabReach, s.y - 14, s.y - 2] : [s.x - HUNTER.jabReach, s.x, s.y - 14, s.y - 2], dmg: HUNTER.jabDmg, blockable: true });
        if (s.t <= 0) { s.mode = 'recover'; s.t = HUNTER.recover; s.cd = HUNTER.cd; } break;
      case 'recover': s.frame = 4; if (s.t <= 0) s.mode = 'walk'; break;
      default: s.mode = 'walk';
    }
    return out;
  };

  /* ---------- THE GUIDE's props (src/stuck-spots.js reads `on`) ---------- */
  H.props = () => { if (!S) return []; const out = [];
    for (const h of S.hs.values()) { const d = h.d; if (d.boss) continue; out.push({ t: 'hoist', id: h.id, x: d.cleat[0] * TS + 8, y: (d.cleat[1] + 1) * TS, on: h.state !== 'hang' }); }
    if (S.loft) out.push({ t: 'loft', x: S.loft.x, y: S.loft.y, on: S.loft.open }); return out; };
  H.read = () => S ? { hoists: [...S.hs.values()].map(h => ({ id: h.id, state: h.state, ly: h.ly })), loft: !!(S.loft && S.loft.open), n: { ...S.n } } : null;
  H.hoist = id => S && S.hs.get(id);

  /* ---------- DRAWING (greybox: plain shapes; the Sonnet art pass replaces them) ---------- */
  const R = Math.round;
  const ROPE = '#c9b27c', ROPED = '#8a7448', WOOD = '#6a4a32', WOODL = '#8a6a48', IRON = '#4a4a52', BONE = '#e8dcc0';
  const dots = (g, x, y0, y1, col) => { g.fillStyle = col; for (let y = y0; y < y1; y += 5) g.fillRect(x, y, 1, 2); };
  H.drawWorld = (g, cx, cy, VW, VH, time) => {
    if (!S) return; const lv = L();
    /* the level's own furniture: the larder's gallows, the lookout's hut, his gold arrows in the roots */
    for (const dc of (lv.decor || [])) {
      if (dc.kind === 'larder') { const x0 = R(dc.x0 * TS - cx), x1 = R((dc.x1 + 1) * TS - cx), y = R(dc.y * TS - cy); if (x1 < -20 || x0 > VW + 20) continue; g.fillStyle = WOOD; g.fillRect(x0, y, x1 - x0, 4); g.fillStyle = WOODL; g.fillRect(x0, y, x1 - x0, 1); }
      else if (dc.kind === 'lookout') { const x0 = R(dc.x0 * TS - cx), x1 = R((dc.x1 + 1) * TS - cx), y = R(dc.y * TS - cy); if (x1 < -20 || x0 > VW + 20) continue;
        g.fillStyle = WOOD; g.fillRect(x0, y - 40, 2, 40); g.fillRect(x1 - 2, y - 40, 2, 40 + 3 * TS); g.fillStyle = '#5a3a22'; g.beginPath(); g.moveTo(x0 - 6, y - 38); g.lineTo((x0 + x1) / 2, y - 54); g.lineTo(x1 + 6, y - 38); g.closePath(); g.fill(); }
      else if (dc.kind === 'goldArrow') { const x = R(dc.x * TS + 8 - cx), y = R((dc.y + 1) * TS - cy); if (x < -10 || x > VW + 10) continue; g.fillStyle = WOODL; g.fillRect(x, y - 10, 1, 10); g.fillStyle = '#ffd36b'; g.fillRect(x - 2, y - 12, 2, 3); g.fillRect(x + 1, y - 12, 2, 3); } }
    for (const h of S.hs.values()) { const d = h.d, lx = loadX(d), px = R(d.x * TS - cx), py = R(d.top * TS - cy), lxs = R(lx - cx), ly = R(h.ly - cy);
      const ccx = R(d.cleat[0] * TS + 8 - cx), ccy = R((d.cleat[1] + 1) * TS - cy);
      if (Math.max(px, ccx, lxs) < -60 || Math.min(px, ccx, lxs) > VW + 60) continue;
      /* the pulley and its beam */
      g.fillStyle = WOOD; g.fillRect(px - 8, py - 3, 16, 3); g.fillStyle = IRON; g.beginPath(); g.arc(px, py + 2, 3, 0, 7); g.fill();
      /* the cleat: a peg in the root, a rope wound on it; it glints while the load hangs (a cleat an arrow must cut glints gold round its rope) */
      g.fillStyle = WOOD; g.fillRect(ccx - 2, ccy - 12, 4, 6); g.fillStyle = ROPE; g.fillRect(ccx - 3, ccy - 10, 6, 2);
      const up = h.state === 'hang' || h.state === 'winch';
      if (h.state === 'hang' && !d.boss) { const k = 0.5 + 0.5 * Math.sin(time * 5 + d.cleat[0]); g.globalAlpha = 0.35 + 0.4 * k; g.strokeStyle = d.arrow ? '#ffd36b' : '#fff6c8'; g.lineWidth = 1; g.beginPath(); g.arc(ccx, ccy - 9, d.arrow ? 9 : 6, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (up) { /* the tie-off: pulley down to the cleat, and the rope down to the load */
        g.strokeStyle = ROPE; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py + 2); g.lineTo(ccx, ccy - 10); g.stroke();
        g.beginPath(); g.moveTo(px, py + 2); g.lineTo(lxs, ly - (d.load === 'cage' ? 2 * TS : d.load === 'span' ? TS : 18)); g.stroke(); }
      else { g.strokeStyle = ROPED; g.beginPath(); g.moveTo(px, py + 2); g.lineTo(px + 2, py + 18); g.stroke(); g.beginPath(); g.moveTo(ccx, ccy - 10); g.lineTo(ccx + 3, ccy - 2); g.stroke(); }
      /* A3: where it will land - a dotted plumb line from what hangs */
      if (h.state === 'hang' && d.load !== 'hunter') { const to = d.load === 'span' ? d.span[2] * TS : d.land ? d.land[1] * TS : lv.arena ? (d.boss ? lv.arena.floor : ly) : ly; dots(g, lxs, ly + 2, R(to - cy), 'rgba(255,233,160,0.45)'); }
      if (h.state === 'hang' && d.load === 'hunter') dots(g, lxs, ly + 2, ly + 6 * TS, 'rgba(255,154,92,0.35)');
      /* the load */
      if (d.load === 'span' && h.state !== 'down') { const w = loadW(d), x0 = R(lx - w / 2 - cx), y = ly - TS; g.fillStyle = WOOD; g.fillRect(x0, y + 4, w, 8); g.fillStyle = WOODL; g.fillRect(x0, y + 4, w, 2); g.fillStyle = ROPE; for (let x = x0 + 6; x < x0 + w - 2; x += 18) g.fillRect(x, y + 3, 2, 10); }
      else if (d.load === 'span') { const w = loadW(d), x0 = R(d.span[0] * TS - cx), y = R(d.span[2] * TS - cy); g.fillStyle = ROPE; for (let x = x0 + 6; x < x0 + w - 2; x += 18) g.fillRect(x, y, 2, 6); }
      if (d.load === 'cage' && (h.state !== 'down' || !d.land)) drawCage(g, lxs, ly, time, h.state === 'down');
      else if (d.load === 'cage') drawCage(g, R(d.land[0] * TS + TS - cx), R((d.land[1] + 2) * TS - cy), time, true);
      if (d.load === 'hunter' && h.state === 'hang' && h.tellT > 0) { g.fillStyle = Math.floor(time * 12) % 2 ? '#ffd36b' : '#fff6c8'; g.fillRect(lxs - 1, py + 4, 2, Math.max(0, ly - 24 - py - 4)); }
    }
    if (S.loft && !S.loft.open) for (const v of (lv.vaultDoors || [])) { const x = R(v.x0 * TS - cx), y0 = R(v.y0 * TS - cy), y1 = R((v.y1 + 1) * TS - cy); g.fillStyle = '#4a3a2a'; g.fillRect(x, y0, TS, y1 - y0); g.fillStyle = BONE; for (let y = y0 + 4; y < y1; y += 8) g.fillRect(x + 4, y, 8, 3); }
  };
  function drawCage(g, x, b, time, down) { const w = 2 * TS, t = b - 2 * TS; g.fillStyle = 'rgba(30,24,20,0.35)'; g.fillRect(x - w / 2 + 1, t + 1, w - 2, w - 2);
    g.fillStyle = IRON; g.fillRect(x - w / 2, t, w, 2); g.fillRect(x - w / 2, b - 2, w, 2); for (let k = 0; k <= 4; k++) g.fillRect(x - w / 2 + k * 7 + (k === 4 ? -1 : 0), t, 2, w);
    g.fillStyle = BONE; g.fillRect(x - 3, t + 8, 6, 5); g.fillStyle = '#2a2018'; g.fillRect(x - 2, t + 10, 1, 1); g.fillRect(x + 1, t + 10, 1, 1);   /* a trophy skull inside */
    if (!down) { g.fillStyle = IRON; g.fillRect(x - 1, t - 4, 2, 4); } }
  return H;
}
