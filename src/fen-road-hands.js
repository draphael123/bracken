// src/fen-road-hands.js - THE FEN ROAD's HANDS (claude/fenroad). src/fen-road.js lays the road; this works it:
//   THE BOWED SECTIONS (ents 'sag'): a hero's weight bows one (a creak, the boards drawn bending, a shiver at the end); held past its hold it GOES UNDER
//     (its cells are air for SAG.under s, then it floats back). A goblin is too light to bow it. Its LASHING (ents 'lashing', a post at its near end):
//     a hero's blow on the post parts it and the section goes at once - with whoever stands on it, and with any LOAD stacked on it (the crew's
//     barricade: gone for good). The rotten sections of THE TROLL'S CROSSING are the same machine (arena: a longer hold; the troll collapses them:
//     collapse(), and his phase two RIPS stretches of the road away: rip()).
//   THE CREW GAPS (ents 'crewgap'): open water in the road with piles in it; the crew's layer on the far bank lays the road plank by plank toward you
//     while you are near and he is alive and on his feet.
//   SOMETHING UNDER THE ROAD (ent 'undertow'): bubbles under the boards, then an arm out of the water takes the crewman there under (the troll, B8).
//   THE FOOTING: a fall into the fen's water hands you back to the last SOUND board you stood on (main.js keeps P.safe only off the water), never a
//     bowed or laid one, never a ripped one.
//   THE HORIZON: the Stockade's palisade grows on the skyline the further east you are, and its gate stands at the crossing's east wall; war horns
//     sound far off from the Palisade Road on.
//   (claude/fenroad2) LAY THE ROAD - the level's second verb (src/fen-planks.js carries the plank): THE SLOTS a carried plank can be laid across - a BROKEN
//     stretch of the road (ents 'broken': a PEAT HOLE, L.pools mud: the bog sucks you down and hands you back, no swimming across), a CREW GAP not yet laid,
//     or a bowed section that has GONE UNDER. slotAhead(P) is the one in front of a hero stood at its near edge; lay(slot) makes it road - a LAID section
//     that SAGS LIKE THE REST (a bowed section of its own, a longer hold: SAG.holdLaid). THE STILT-WALKER's STOMP (stomp(x, y)): each planted stilt bows
//     the section under it further, and one already bowing goes under. THE LEECHES (src/bog-leech.js) read astir(x, r): a section near them bowing under
//     a hero, or just gone under.
// GREYBOX ART (readable; the art lane draws it - see the lane report's ART NOTES). main.js calls: reset, on, update, strike, drawSky, drawWorld, read,
// and the troll's hands call sectionAt, collapse, rip, fixSafe.
import * as FRA from './redraw/fen_road_art.js';   /* (claude/fenroadart) the boardwalk kit's drawing */
export const SAG = { bow: 0.5, hold: 1.1, holdArena: 3.6, holdLaid: 2.2, under: 3.2, regrow: 14, rise: 0.6, droop: 4, stomp: 0.45, astir: 0.8, edge: 20 };
export const CREW = { every: 0.85, near: 260 };
export const UNDERTOW = { near: 150, bubble: 1.4, arm: 1.0 };
export const FR_SAY = { creak: 'THE BOARDS BOW: KEEP MOVING', under: 'IT GOES UNDER', cut: 'THE LASHING PARTS', barricade: 'THE BARRICADE GOES UNDER', crew: 'THE CREW LAYS THE ROAD', undertow: 'SOMETHING LIVES UNDER THE ROAD', stomped: 'HIS STOMP SINKS IT', hole: 'THE PEAT HOLE SUCKS YOU DOWN' };
export const FR_HINT = 'A BOWED SECTION GOES UNDER WITH WHOEVER STANDS ON IT. STRIKE ITS LASHING AND IT GOES AT ONCE.';
const R = Math.round;

export function makeFenRoadHands(ctx) {
  const H = {}; let S = null;
  const L = () => ctx.L;
  H.on = () => !!(L() && L().fenroad && S);
  H.reset = () => {
    const lv = L(); S = null; if (!lv || !lv.fenroad) return; const TS = ctx.TS;
    const sags = new Map(), lashes = [], gaps = [], tows = [], broken = [];
    for (const e of lv.ents) {
      if (e.t === 'sag' || e.t === 'rotten') sags.set(e.id, { id: e.id, x0: e.x, w: e.w, row: e.y, hold: e.arena ? SAG.holdArena : (e.hold || SAG.hold), arena: !!e.arena, load: e.load || [], loadGone: false, st: 'up', t: 0, vis: 1, told: false });
      else if (e.t === 'lashing') lashes.push({ x: e.x, row: e.y + 1, sag: e.sag, cut: false });
      else if (e.t === 'crewgap') gaps.push({ id: e.id, x0: e.x, w: e.w, dir: e.dir || -1, piles: e.piles || [], laid: 0, t: CREW.every, done: false, layerAt: null, layer: null });
      else if (e.t === 'undertow') tows.push({ x: e.x * TS + 8, st: 'wait', t: 0 });
      else if (e.t === 'broken') broken.push({ id: e.id, x0: e.x, w: e.w, row: e.y, look: e.look || 'hole', req: !!e.req, laid: false });
    }
    for (const g of gaps) { const lay = lv.ents.find(q => q.layer === g.id); if (lay) g.layerAt = { x: lay.x * TS + 8, y: (lay.y + 1) * TS }; }
    const cells = new Set(); for (const [x, y] of lv.sagCells || []) cells.add(y * lv.W + x);
    S = { clock: 0, laidAt: {}, sags, lashes, gaps, tows, broken, cells, ripped: new Set(), told: {}, hornT: 6, n: { sunk: 0, cut: 0, laid: 0, collapsed: 0, ripped: 0, barricade: 0, undertow: 0, planked: 0, stomps: 0, stompSunk: 0 } };
  };
  const cellsOf = s => { const out = []; for (let x = s.x0; x < s.x0 + s.w; x++) if (!(s.piles && s.piles.includes(x))) out.push([x, s.row]); return out; };   /* (a crew gap laid by you keeps its piles) */
  const setCells = (s, t) => { for (const [x, y] of cellsOf(s)) ctx.cellSet(x, y, t); };
  const say = (x, y, k, col = '#ffd36b') => ctx.number(x, y, FR_SAY[k], col);
  /* ONE BODY ON A SECTION: its feet on the section's row and inside its columns */
  const standsOn = (pp, s) => { if (!pp || pp.dead || !pp.ground || pp.onMover) return false; const TS = ctx.TS; if (Math.floor((pp.y + 1) / TS) !== s.row) return false;
    return pp.x + 3 > s.x0 * TS && pp.x - 3 < (s.x0 + s.w) * TS; };
  const splash = (s, n = 14) => { const TS = ctx.TS; for (let x = s.x0; x < s.x0 + s.w; x++) ctx.burst(x * TS + 8, (s.row + 1) * TS, Math.ceil(n / s.w), ['#9fb3a6', '#e6efe6', '#3e2c1c'], 80, 0.5); };
  /* A SECTION GOES UNDER: its boards are air, and what stood on it falls (a load stacked on it goes for good) */
  function sink(s, why) {
    if (s.st === 'under' || s.st === 'gone') return; const TS = ctx.TS, lv = L();
    /* the TROLL bursts up through the middle of a rotten section: the boards round him give way, the ones at its ends hang on (the wreck you strike him from) */
    if (why === 'troll' && s.w >= 4) { s.hole = [s.x0 + 1, s.x0 + s.w - 2]; for (let x = s.hole[0]; x <= s.hole[1]; x++) ctx.cellSet(x, s.row, ctx.T.AIR); } else { s.hole = [s.x0, s.x0 + s.w - 1]; setCells(s, ctx.T.AIR); }
    s.st = why === 'troll' ? 'gone' : 'under'; s.t = why === 'troll' ? SAG.regrow : SAG.under; S.n.sunk++; s.sunkAt = S.clock; s.fresh = false;
    if (s.load.length && !s.loadGone) { s.loadGone = true; for (const [x, y] of s.load) ctx.cellSet(x, y, ctx.T.AIR); S.n.barricade++; ctx.burst((s.x0 + s.w / 2) * TS, (s.row - 2) * TS, 24, ['#8a6a40', '#b08a5a', '#3e2c1c'], 110, 0.7); say((s.x0 + s.w / 2) * TS, (s.row - 5) * TS, 'barricade'); }
    for (const pp of ctx.players()) if (standsOn(pp, s) || (pp.x + 3 > s.x0 * TS && pp.x - 3 < (s.x0 + s.w) * TS && Math.abs(pp.y - s.row * TS) < 3)) { pp.ground = false; pp.vy = Math.max(pp.vy || 0, 40); }
    splash(s); snd('sink'); if (why !== 'troll' && !S.told.under) { S.told.under = 1; say((s.x0 + s.w / 2) * TS, (s.row - 3) * TS, 'under'); }
    if (why === 'stomp') { S.n.stompSunk++; if (!S.told.stomped) { S.told.stomped = 1; say((s.x0 + s.w / 2) * TS, (s.row - 4) * TS, 'stomped', '#ff9a5c'); } }
    for (const l of S.lashes) if (l.sag === s.id) l.cut = true; void lv;
  }
  const snd = k => { const f = ctx.sfx; try { if (k === 'creak') (f.creak || f.crack || f.thud)(); else if (k === 'sink') { (f.splash || f.thud)(); (f.crack || f.thud)(); } else if (k === 'cut') { (f.crack || f.thud)(); (f.clank || f.thud)(); } else if (k === 'lay') (f.stone || f.thud)(); else if (k === 'rise') (f.puff || f.thud)(); else if (k === 'gurgle') (f.splash || f.puff || f.thud)(); else if (k === 'grab') { (f.splash || f.thud)(); (f.boreRoar || f.roar || f.thud)(); } else if (k === 'horn') (f.farHorn || f.hornDraw || (() => {}))(); } catch {} };
  H.update = dt => {
    if (!H.on()) return; const lv = L(), TS = ctx.TS, T = ctx.T, players = ctx.players(); S.clock += dt;
    /* THE BOWED SECTIONS */
    for (const s of S.sags.values()) {
      if (s.st === 'up' || s.st === 'bow') {
        const w = players.some(pp => standsOn(pp, s));
        if (w) { if (s.st === 'up') { s.st = 'bow'; s.t = 0; snd('creak'); if (!S.told.creak) { S.told.creak = 1; say((s.x0 + s.w / 2) * TS, (s.row - 3) * TS, 'creak'); if (ctx.hint) ctx.hint(FR_HINT); } }
          s.t += dt; if (Math.random() < dt * 5) ctx.burst((s.x0 + Math.random() * s.w) * TS, (s.row + 1) * TS, 1, ['#9fb3a6'], 20, 0.3);
          if (s.t > s.hold * 0.6 && Math.random() < dt * 3) snd('creak');
          if (s.t >= s.hold) sink(s, 'weight'); }
        else if (s.st === 'bow') { s.t -= dt * 0.8; if (s.t <= 0) { s.st = 'up'; s.t = 0; } }
      } else if (s.st === 'under' || s.st === 'gone') {
        s.t -= dt; if (s.t > 0) continue;
        /* it floats back only where no hero is in its row (never up through a body) */
        const blocked = players.some(pp => !pp.dead && pp.x + 4 > s.x0 * TS && pp.x - 4 < (s.x0 + s.w) * TS && pp.y > s.row * TS && pp.y - 14 < (s.row + 1) * TS);
        if (blocked) { s.t = 0.2; continue; }
        if (cellsOf(s).some(([x]) => S.ripped.has(x))) { s.t = 1e9; continue; }
        setCells(s, T.PLANK); s.st = 'up'; s.t = 0; s.vis = 0; snd('rise');
        for (const l of S.lashes) if (l.sag === s.id) l.cut = false;
      }
      if (s.vis < 1) s.vis = Math.min(1, s.vis + dt / SAG.rise);
    }
    /* THE CREW GAPS: the layer lays the road toward you */
    for (const g of S.gaps) {
      if (g.done) continue;
      if (!g.layer && g.layerAt) { let best = null, bd = 64; for (const e of ctx.enemies()) { if (!e.alive || e.boss) continue; const d = Math.hypot(e.x - g.layerAt.x, e.y - g.layerAt.y); if (d < bd) { bd = d; best = e; } } if (best) g.layer = best; }
      const mid = (g.x0 + g.w / 2) * TS, near = players.some(pp => !pp.dead && Math.abs(pp.x - mid) < CREW.near);
      const working = g.layer && g.layer.alive && !(g.layer.stagger > 0) && !(g.layer.broken > 0);
      if (!near || !working) continue;
      g.t -= dt; if (g.t > 0) continue; g.t = CREW.every;
      const cols = []; for (let i = 0; i < g.w; i++) { const x = g.dir < 0 ? g.x0 + g.w - 1 - i : g.x0 + i; if (!g.piles.includes(x)) cols.push(x); }
      const x = cols[g.laid]; if (x === undefined) { g.done = true; continue; }
      if (ctx.tileAt(x, 18) === T.AIR) ctx.cellSet(x, 18, T.PLANK); g.laid++; S.n.laid++; S.laidAt[x] = S.clock; snd('lay'); ctx.dust(x * TS + 8, 18 * TS, 3);
      if (!S.told.crew) { S.told.crew = 1; say(x * TS + 8, 15 * TS, 'crew'); }
      if (g.laid >= cols.length) g.done = true;
    }
    /* SOMETHING UNDER THE ROAD */
    for (const u of S.tows) {
      if (u.st === 'done') continue;
      if (u.st === 'wait') { if (players.some(pp => !pp.dead && pp.x > u.x - UNDERTOW.near - 40 && pp.x < u.x + 40)) { u.st = 'bubble'; u.t = UNDERTOW.bubble; snd('gurgle'); } continue; }
      u.t -= dt;
      if (u.st === 'bubble' && u.t <= 0) { u.st = 'arm'; u.t = UNDERTOW.arm; snd('grab'); ctx.shake(4); S.n.undertow++;
        let v = null, bd = 56; for (const e of ctx.enemies()) { if (!e.alive || e.boss || e.elite) continue; const d = Math.abs(e.x - u.x); if (d < bd && Math.abs(e.y - 18 * TS) < 20) { bd = d; v = e; } }
        if (v) { u.victim = { x: v.x }; v.y = 21 * TS; v.vy = 0; v.x = u.x; }   /* (into the fen: main.js hazardFoe drowns it, no blow of yours) */
        ctx.burst(u.x, 19 * TS, 22, ['#9fb3a6', '#e6efe6', '#3e2c1c', '#4a5a3a'], 120, 0.7); say(u.x, 14 * TS, 'undertow', '#ff9a5c'); }
      else if (u.st === 'arm' && u.t <= 0) u.st = 'done';
    }
    /* THE FOOTING: a sound board you stood on is where the water hands you back */
    for (const pp of players) { if (pp.dead || !pp.ground || pp.onMover) continue; const tx = Math.floor(pp.x / TS), ty = Math.floor((pp.y + 1) / TS), t = ctx.tileAt(tx, ty);
      if ((t === T.PLANK || ctx.solidAt(tx, ty)) && !S.cells.has(ty * lv.W + tx) && !S.ripped.has(tx)) pp.safe = { x: pp.x, y: pp.y, L: lv }; }
    /* THE STOCKADE'S HORNS, far off, from the Palisade Road on */
    if (players[0] && players[0].x > 311 * TS) { S.hornT -= dt; if (S.hornT <= 0) { S.hornT = 10 + Math.random() * 7; snd('horn'); } }
  };
  /* A HERO'S BLOW (main.js attackBox): on a lashing's post, it parts */
  H.strike = hb => { if (!H.on() || !hb) return; const TS = ctx.TS;
    for (const l of S.lashes) { if (l.cut) continue; const s = S.sags.get(l.sag); if (!s || s.st === 'under' || s.st === 'gone') continue;
      const bx = { l: l.x * TS + 3, r: l.x * TS + 13, t: l.row * TS - 18, b: l.row * TS };
      if (hb.l < bx.r && hb.r > bx.l && hb.t < bx.b && hb.b > bx.t) { l.cut = true; S.n.cut++; snd('cut'); say(l.x * TS + 8, (l.row - 2) * TS, 'cut'); ctx.burst(l.x * TS + 8, l.row * TS - 10, 8, ['#c9b27c', '#8a6a40'], 70, 0.4); sink(s, 'lashing'); } } };
  /* ---------- LAY THE ROAD (claude/fenroad2) ---------- */
  /* THE SLOTS: every stretch a carried plank can go across now - a broken stretch not yet laid, a crew gap not yet laid, a bowed section gone under (never the crossing's) */
  const slotsNow = () => { if (!S) return []; const out = [];
    for (const b of S.broken) if (!b.laid) out.push({ id: b.id, kind: 'broken', x0: b.x0, x1: b.x0 + b.w - 1, row: b.row, req: b.req, ref: b });
    for (const g of S.gaps) if (!g.done) { const cols = []; for (let x = g.x0; x < g.x0 + g.w; x++) if (!g.piles.includes(x) && ctx.tileAt(x, g.row || 18) !== ctx.T.PLANK) cols.push(x); if (cols.length) out.push({ id: g.id, kind: 'crewgap', x0: g.x0, x1: g.x0 + g.w - 1, row: 18, ref: g }); }
    for (const s of S.sags.values()) if (!s.arena && s.st === 'under' && !s.load.length) out.push({ id: s.id, kind: 'sunk', x0: s.x0, x1: s.x0 + s.w - 1, row: s.row, ref: s });
    return out; };
  H.slots = () => slotsNow().map(({ ref, ...o }) => o);
  /* THE SLOT IN FRONT OF A HERO: footed on its row, at its near edge (within SAG.edge px of it, on his side), facing it */
  H.slotAhead = pp => { if (!H.on() || !pp || pp.dead || !pp.ground) return null; const TS = ctx.TS, f = pp.face || 1;
    for (const sl of slotsNow()) { if (Math.abs(pp.y - sl.row * TS) > 3) continue;
      const edge = f > 0 ? sl.x0 * TS : (sl.x1 + 1) * TS, d = (edge - pp.x) * f; if (d >= -4 && d <= SAG.edge) return sl; }
    return null; };
  /* LAY IT: the slot is road now - a LAID section that sags like the rest (a crew gap is finished, a sunk section floats up at once, laid) */
  H.lay = sl => { if (!H.on() || !sl) return false; const TS = ctx.TS, T = ctx.T, lv = L(); let s = null;
    if (sl.kind === 'sunk') { s = sl.ref; if (s.st !== 'under') return false; setCells(s, T.PLANK); s.st = 'up'; s.t = 0; s.vis = 1; for (const l of S.lashes) if (l.sag === s.id) l.cut = false; }
    else { const x0 = sl.x0, w = sl.x1 - sl.x0 + 1, id = 'laid:' + sl.id, piles = sl.kind === 'crewgap' ? sl.ref.piles : [];
      for (let x = x0; x < x0 + w; x++) if (!piles.includes(x)) { ctx.cellSet(x, sl.row, T.PLANK); S.cells.add(sl.row * lv.W + x); }
      s = { id, x0, w, row: sl.row, hold: SAG.holdLaid, arena: false, load: [], loadGone: false, st: 'up', t: 0, vis: 0.4, told: false, laid: true, piles };
      S.sags.set(id, s); if (sl.kind === 'broken') sl.ref.laid = true; else { sl.ref.done = true; sl.ref.laidByYou = true; } }
    s.fresh = true; s.laidAt = S.clock; S.n.planked++; ctx.burst((sl.x0 + sl.x1 + 1) / 2 * TS, sl.row * TS, 12, ['#c99a5a', '#a07a48', '#e6efe6'], 60, 0.5); ctx.dust(sl.x0 * TS + 8, sl.row * TS, 4); snd('lay');
    return true; };
  /* A STILT-WALKER'S STOMP at (x, y px - his feet): the section under it bows further; one already bowing past its hold goes under (with what stands on it) */
  H.stomp = (x, y, hard) => { if (!H.on()) return null; const TS = ctx.TS, tx = Math.floor(x / TS), row = Math.floor((y + 1) / TS); S.n.stomps++;
    for (const s of S.sags.values()) { if (s.arena || s.row !== row || tx < s.x0 || tx >= s.x0 + s.w) continue; if (s.st !== 'up' && s.st !== 'bow') return s;
      s.jolt = 0.25; if (s.st === 'up') { s.st = 'bow'; s.t = 0; } s.t += SAG.stomp * (hard ? 1.5 : 1); snd('creak'); if (s.t >= s.hold) sink(s, 'stomp'); return s; }
    return null; };
  /* THE LEECHES' WAKE: a section within r px of x bowing under a hero, or gone under in the last SAG.astir s */
  H.astir = (x, r) => { if (!H.on()) return false; const TS = ctx.TS, ps = ctx.players();
    for (const s of S.sags.values()) { if (s.arena) continue; const a = s.x0 * TS, b = (s.x0 + s.w) * TS; if (b < x - r || a > x + r) continue;
      if (s.st === 'bow' && ps.some(pp => standsOn(pp, s))) return true; if (s.sunkAt !== undefined && S.clock - s.sunkAt < SAG.astir) return true; }
    return false; };
  /* THE TROLL'S HANDS: the rotten section under x (px), collapse it, rip stretches of the road, and put a hero's footing back on sound boards */
  H.sectionAt = (x, arenaOnly = true) => { if (!S) return null; const TS = ctx.TS; for (const s of S.sags.values()) if ((!arenaOnly || s.arena) && x >= s.x0 * TS - 2 && x < (s.x0 + s.w) * TS + 2) return s; return null; };
  H.sections = () => (S ? [...S.sags.values()].filter(s => s.arena) : []);
  H.collapse = s => { if (!s || s.st === 'under' || s.st === 'gone') return false; sink(s, 'troll'); S.n.collapsed++; return true; };
  H.rip = ranges => { if (!S) return; const TS = ctx.TS, T = ctx.T;
    for (const [a, b] of ranges) for (let x = a; x <= b; x++) { S.ripped.add(x); ctx.cellSet(x, 18, T.AIR); ctx.burst(x * TS + 8, 18 * TS, 4, ['#8a6a40', '#b08a5a', '#3e2c1c', '#9fb3a6'], 120, 0.7); }
    S.n.ripped++; for (const pp of ctx.players()) H.fixSafe(pp); };
  H.ripped = x => !!(S && S.ripped.has(x));
  H.fixSafe = pp => { if (!S || !pp || !pp.safe) return; const TS = ctx.TS, tx = Math.floor(pp.safe.x / TS); if (!S.ripped.has(tx) && !S.cells.has(Math.floor((pp.safe.y + 1) / TS) * L().W + tx)) return;
    for (let d = 1; d < 30; d++) for (const s of [-1, 1]) { const x = tx + s * d; if (!S.ripped.has(x) && !S.cells.has(18 * L().W + x) && (ctx.tileAt(x, 18) === ctx.T.PLANK || ctx.solidAt(x, 18))) { pp.safe = { x: x * TS + 8, y: 18 * TS, L: L() }; return; } } };
  H.read = () => S && { slots: H.slots(), broken: S.broken.map(b => ({ id: b.id, x0: b.x0, w: b.w, row: b.row, req: b.req, laid: b.laid })), sags: [...S.sags.values()].map(s => ({ id: s.id, st: s.st, t: +s.t.toFixed(2), arena: s.arena, loadGone: s.loadGone, laid: !!s.laid })), lashes: S.lashes.map(l => ({ x: l.x, sag: l.sag, cut: l.cut })), gaps: S.gaps.map(g => ({ id: g.id, laid: g.laid, done: g.done, layer: !!g.layer })), tows: S.tows.map(u => u.st), ripped: [...S.ripped], n: { ...S.n } };
  H.sag = id => S && S.sags.get(id);
  /* THE GUIDE's props (src/stuck-spots.js reads `on`): a lashing is done once its section has dropped what it carried (or, with no load, once it is cut) */
  H.props = () => { if (!S) return []; const TS = ctx.TS, pp = ctx.players()[0], held = !!(pp && pp.carry && pp.carry.t === 'fplank');
    return S.lashes.map(l => { const s = S.sags.get(l.sag); return { t: 'lashing', x: l.x * TS + 8, y: l.row * TS, on: !!(s && (s.load.length ? s.loadGone : l.cut)) }; })
      .concat(S.broken.map(b => ({ t: 'broken', x: b.x0 * TS + 8, y: b.row * TS, on: b.laid, held })));   /* (claude/fenroad2) a peat hole is done once laid; held = a plank on the hero's shoulder (the guide's two steps: the bundle, then the edge) */ };

  /* ---------- DRAWING (greybox: the art lane draws it) ---------- */
  const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  /* THE SKYLINE: the Stockade's palisade grows the further east you are (behind everything; a parallax band at the horizon) */
  H.drawSky = (g, cx, cy, VW, VH, time) => {
    if (!H.on()) return; const lv = L(), TS = ctx.TS, k = Math.max(0, Math.min(1, cx / ((lv.W - 40) * TS)));
    FRA.drawSky(g, cx, cy, VW, VH, time, k);   /* THE SKYLINE: the Stockade's palisade grows the further east you are (behind everything; a parallax band at the horizon) */
  };
  H.drawWorld = (g, cx, cy, time) => {
    if (!H.on()) return; const lv = L(), TS = ctx.TS, X = v => R(v - cx), Y = v => R(v - cy), VWp = ctx.VW();
    /* THE STOCKADE'S GATE (the arrival): its palisade wall, horn tower and braziers behind the exit gate at the crossing's east end */
    FRA.drawGate(g, X(ARENA_GATE_X * TS), Y(18 * TS), time);
    /* THE LASHINGS: a stake, hemp coils, a red rag and the rope to the section's near board; a glint while a body stands on its section (cut NOW) */
    for (const l of S.lashes) { const x = X(l.x * TS + 8); if (x < -40 || x > VWp + 40) continue; const yb = Y(l.row * TS), s = S.sags.get(l.sag);
      const loaded = !!s && !l.cut && (ctx.enemies().some(e => e.alive && !e.boss && standsOnFoe(e, s)) || (s.load.length && !s.loadGone));
      FRA.drawLashing(g, x, yb, s ? X(s.x0 * TS + 1) : x, s ? Y(s.row * TS + 2) : yb, l.cut || !s, loaded, time); }
    /* THE BOWED SECTIONS: rotten boards that bend, shiver at the end, go under, and float back */
    /* (claude/fenroad2) THE BROKEN STRETCHES: snapped board-ends at either lip, the old road's boards sunk under the bog (GREYBOX: the art lane draws the peat hole) */
    for (const b of S.broken) { if (b.laid) continue; const x0 = X(b.x0 * TS), x1 = X((b.x0 + b.w) * TS); if (x1 < -20 || x0 > VWp + 20) continue; const y = Y(b.row * TS);
      g.fillStyle = '#3e2c1c'; g.fillRect(x0 - 2, y, 4, 5); g.fillRect(x1 - 2, y, 4, 5); g.fillStyle = '#8a6a40'; g.fillRect(x0, y + 1, 5, 2); g.fillRect(x1 - 5, y + 1, 5, 2);
      g.fillStyle = '#2a1e12'; for (let i = 1; i < b.w - 1; i += 2) g.fillRect(x0 + i * TS + 3, Y(19 * TS + 6) + (i % 3), 10, 2);
      g.globalAlpha = 0.35 + 0.15 * Math.sin(time * 2 + b.x0); g.fillStyle = '#1a140c'; g.fillRect(x0 + 2, Y(19 * TS), x1 - x0 - 4, 3); g.globalAlpha = 1; }
    for (const s of S.sags.values()) { const x0 = X(s.x0 * TS); if (x0 > VWp + 20 || x0 + s.w * TS < -20) continue; const y = Y(s.row * TS);
      if (s.jolt > 0) s.jolt -= 1 / 60;
      const up = s.st === 'up' || s.st === 'bow', b = s.st === 'bow' ? Math.min(1, s.t / SAG.bow) : 0, shiver = s.st === 'bow' && s.t > s.hold * 0.7 ? (Math.floor(time * 30) % 2) : 0;
      for (let i = 0; i < s.w; i++) { const wreck = s.st === 'gone' && s.hole && (s.x0 + i < s.hole[0] || s.x0 + i > s.hole[1]), u = (i + 0.5) / s.w * 2 - 1, off = up ? b * SAG.droop * (1 - u * u) + shiver : wreck ? 3 + (i ? 1 : 0) : 0, yy = up || wreck ? y + off + (up ? (1 - s.vis) * 8 : 0) : Y(19 * TS + 3);
        if (s.piles && s.piles.includes(s.x0 + i)) continue;
        FRA.drawBoard(g, x0 + i * TS, yy + (s.jolt > 0 && up ? 1 : 0), i, s.w, s.arena, up || wreck ? 1 : 0.4, wreck);
        if (s.laid && (up || wreck)) { g.fillStyle = '#e8c27a'; g.globalAlpha = 0.35; g.fillRect(x0 + i * TS, R(yy), TS, 1); g.globalAlpha = 1; } }   /* (claude/fenroad2) a LAID plank: fresh-cut, a pale top edge (the art lane draws it) */
      if (s.st === 'under' || s.st === 'gone') FRA.drawSunk(g, x0, s.w * TS, Y(19 * TS), time); else if (s.st === 'bow' && s.t > 0.2) FRA.drawDrips(g, x0, s.w * TS, y + 8, time);
      /* ITS LOAD (the crew's barricade): road-planks stacked on end, roped; and its foot in the section's own row */
      for (const [lx, ly] of [...s.load, ...s.load.filter(([, q]) => q === s.row - 1).map(([q]) => [q, s.row])]) { if (!ctx.solidAt(lx, ly)) continue;
        FRA.drawBarricadeCell(g, X(lx * TS), Y(ly * TS), !ctx.solidAt(lx, ly - 1), ly === s.row - 3 && lx === s.load[0][0], ly === s.row); }
    }
    /* THE CREW GAPS: the boards the crew has laid (fresh-cut, dropped in from a hand's height) */
    for (const gp of S.gaps) for (let i = 0; i < gp.w; i++) { const x = gp.x0 + i; if (ctx.tileAt(x, 18) !== ctx.T.PLANK) continue; const sx = X(x * TS); if (sx < -20 || sx > VWp + 20) continue;
      FRA.drawLaid(g, sx, Y(18 * TS), S.clock - (S.laidAt[x] === undefined ? -9 : S.laidAt[x])); }
    /* SOMETHING UNDER THE ROAD: the bubbles, then the arm */
    for (const u of S.tows) { const x = X(u.x), y = Y(19 * TS); if (x < -60 || x > VWp + 60) continue;
      if (u.st === 'bubble') for (let i = 0; i < 4; i++) { const q = (time * 3 + i * 0.37) % 1; g.globalAlpha = 1 - q; rect(g, x - 10 + i * 6, y - q * 8, 2, 2, '#cfe0d0'); g.globalAlpha = 1; }
      if (u.st === 'arm') { const k = Math.sin(Math.min(1, 1 - u.t / UNDERTOW.arm) * Math.PI); drawArm(g, x, y, k, time); } }
  };
  const standsOnFoe = (e, s) => { const TS = ctx.TS; return Math.floor((e.y + 1) / TS) === s.row && e.x + 3 > s.x0 * TS && e.x - 3 < (s.x0 + s.w) * TS; };
  /* the troll's arm out of the fen */
  function drawArm(g, x, y, k, time) { FRA.drawArm(g, x, y, k, time); }
  H.drawArm = drawArm;
  return H;
}
const ARENA_GATE_X = 451;   /* (the palisade round the Stockade's gate; the gate itself is the level's exit gate, src/exit-gates.js 'marsh') */
