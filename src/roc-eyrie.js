// src/roc-eyrie.js - THE ROC on her EYRIE (claude/skyroad, the GREYBOX; brief docs/concepts/sky-road.md). She has had no level since the Monastery's
// rework (main.js updateRoc is her belfry fight, kept and unplaced); this is her fight rebuilt round THE SKY ROAD's rule - she is the rising air,
// personified: the mother of harpies who rides the thermals and drags the clouds over them. main.js hands her body here when L.arena.eyrie (ROCE.on()).
//
// WHAT SHE IS (design standard B11/B13, claude/roc2, Daniel 10-06: "you can jump on the gliding platforms / thermals and actually hit her, so she
// DOESN'T NEED TO BE INVULNERABLE BY DEFAULT"): A BEAST, ALWAYS HITTABLE, AND SHE GUARDS BY HEIGHT. Her talons guard LOW: a blow from the floor as she
// swoops in lands at EYRIE.lowK and says GUARDS LOW (src/boss-read.js); a hop at her lands at EYRIE.hopK; a blow from THE AIR THE LEVEL GIVES YOU - riding
// a thermal, gliding on the cloak, or from above a plain jump's reach (a roost, a crest) - lands WHOLE and a little more (EYRIE.airK): the level's verb is
// the way in. Striking the nest's sun-stone to wake a thermal under her is the play. She is on FULL_DAMAGE (src/boss-greed.js: no chip; greed still counts).
// HER KIT, KEPT: in the air nearly always; THE DIVE - a shadow marks the spot, and onto the nest's woven boards her talons STICK (open), onto stone she
// skids and is up again; THE GALE (wingbeats walk you toward the thorny rim); SHED FEATHERS; THE SNATCH (her talons spread, red !!; struggle free).
// THE BIG OPENING, FROM THE LEVEL: THE THERMAL PLUNGE - ride a thermal up over her and PLUNGE onto her back: she drops to the nest, open (x EYRIE.openK).
//   Her answer to your verb: she DRAGS A CLOUD over the thermal you came down off (its shadow told, src/sky-road-hands.js draws it as the rule's own).
// THREE PHASES, ONE NEW MOVE EACH (B5; she is ~15% faster than the greybox, EYRIE.spd, every tell still >= 0.5 s):
//   I   THE OPEN SKY (to two thirds): the kit above.
//   II  THE DEAD AIR (to a third): NEW - she drags a STORM CLOUD over YOUR thermal (the rule, 'a cloud on it kills it', turned on you): a red !! and the
//       cloud gathering over the column, then the thermal dies under you and the cloud's underside is ELECTRIFIED - step out of the column in the tell
//       (drop out, glide away).
//   III THE STORM: the rim thermals die (only the nest's sun-stone thermal still rises); lightning finds the iron kite-masts (a told crackle at the mast;
//       a strike while she perches on that mast knocks her down); the storm dive comes in twos. NEW - CHAIN LIGHTNING: every mast CHARGES (it glows,
//       crackles and hums, a charge level climbing each one, a red !!), then an arc jumps mast to mast along the line and runs the floor between them -
//       be off the mast floor or in the air.
//   THE MASTS LIGHT UP (Daniel 10-06): their charge glows, sparks and throws a light pool on the floor; in the storm they burn at a glance.
// ANTI-SPAM WARD (B3): after every opening a told 3 s ward (HER FEATHERS BRISTLE, a ring): no blow and no plunge lands (WARDED), and the dive skids.
// STAGGER = STILL: open, she lies. The bot plan is below (rocEyriePlan, src/lab.js). Numbers: EYRIE.
export const EYRIE = {
  hp: 1200, hitK: 1.9, dropK: 2.0,   /* (FIX PASS: dropK 1.3 -> 2.0 - her snatch drop is unblockable, so it reaches the shield) */
  spd: 1.15,   /* (claude/roc2) she moves ~15% faster than the greybox: her flight, her dive, her rests and her tells (never under 0.5 s) */
  flyY: 128, circleR: 150, stuck: 3.4, downed: 3.2, ward: 3.0,
  diveTell: 0.87, diveV: 483, gustTell: 0.7, gust: 2.2, gustPush: 230, shedTell: 0.61, grabTell: 0.74, grab: 0.52, carry: 1.6, mash: 0.3,
  cloud: 5, cloudTell: 0.78, perch: 2.4, boltTell: 1.13, boltEvery: 5.0, boltReach: 22, rest: [1.2, 1.05, 0.95],
  /* HOW A BLOW LANDS (B11/B13): openK in an opening; airK from the air the level gives (a thermal, the cloak, above a plain jump: airH px over the floor);
     hopK from a plain hop; lowK from the floor (GUARDS LOW) */
  openK: 1.5, airK: 1.15, hopK: 0.6, lowK: 0.25, airH: 60,
  phase: [2 / 3, 1 / 3],
  /* THE DEAD AIR (phase II): the told gathering, how long its underside bites, how long the thermal stays dead, the box under it, the bite */
  deadTell: 0.95, deadLive: 1.5, deadShade: 4.5, deadW: 34, deadDown: 64, deadUp: 14, deadDmg: 18,
  /* CHAIN LIGHTNING (phase III): the masts' charge, the hop mast to mast, how long each stretch of floor stays live, how high is clear of it, the bite */
  chainTell: 1.45, chainHop: 0.2, chainLive: 0.3, chainAir: 22, chainDmg: 20, chainPad: 26,
};
const CYCLE = [['diveTell', 'gustTell', 'shedTell', 'cloudTell', 'grabTell'], ['grabTell', 'diveTell', 'cloudTell', 'shedTell', 'gustTell'], ['shedTell', 'cloudTell', 'diveTell', 'grabTell', 'gustTell']];
const CYCLE2 = [['deadAirTell', 'diveTell', 'gustTell', 'shedTell', 'grabTell'], ['grabTell', 'deadAirTell', 'diveTell', 'shedTell', 'gustTell'], ['shedTell', 'diveTell', 'deadAirTell', 'grabTell', 'gustTell']];
const CYCLE3 = [['stormTell', 'perch', 'diveTell', 'chainTell', 'grabTell', 'perch', 'shedTell'], ['perch', 'gustTell', 'chainTell', 'perch', 'grabTell', 'diveTell']];
export const rocEyrieOpen = e => e.mode === 'stuck' || e.mode === 'downed';
const NOT_FLYING = ['wake', 'sleep', 'dive', 'carry'];

export function makeRocEyrie(ctx) {
  const H = {}, TS = ctx.TS; let F = null;
  const L = () => ctx.L, S = EYRIE.spd;
  H.on = () => !!(L() && L().arena && L().arena.eyrie);
  H.reset = () => { F = null; };
  const fight = e => { if (F && F.e === e) return F; const A = L().arena; e.hp = e.maxHp = EYRIE.hp;
    const masts = (L().ents || []).filter(q => q.t === 'mast').map(q => ({ x: q.x * TS + 8, top: (q.y + 1) * TS - 12 * TS, foot: (q.y + 1) * TS, k: 0 })).sort((a, b) => a.x - b.x);
    F = { e, A, cyc: 0, i: 0, clouds: [], bolt: null, boltT: EYRIE.boltEvery, masts, dead: null, chain: null, told: {}, n: { plunges: 0, sticks: 0, bolts: 0, opens: 0, snatches: 0, chains: 0, deads: 0, airHits: 0, hopHits: 0, lowHits: 0 } }; return F; };
  const tell = (e, mode, t, mark) => { e.mode = mode; e.modeT = t; if (mark) ctx.number(e.x, e.y - 40, mark, mark === '!!' ? '#ff6b6b' : '#ffd36b'); };   /* the mark is src/marks.js's: a red !! nothing turns, a yellow ! a shield turns, none for a windup that strikes nobody */
  const onNest = (x) => { const n = L().arena.nest; return n && x >= n[0] && x <= n[1]; };
  const fly = e => { e.mode = 'fly'; e.modeT = EYRIE.rest[(e.phase || 1) - 1]; };
  const open = (e, mode, t) => { e.mode = mode; e.modeT = t; e.vy = 0; e.ward = 0; F.n.opens++; ctx.shake(6); ctx.zoomKick && ctx.zoomKick(); ctx.sfx.queenShriek(); ctx.burst(e.x, e.y - 14, 18, ['#bfe6f5', '#eefaff', '#8a8478'], 90, 0.6); };
  const roomHurt = (e, d, x) => { F.room = true; try { ctx.hurt(e, d, x); } finally { F.room = false; } };   /* the lightning on her mast and the plunge's own knock are the ROOM's: they land whole */
  const arenaTherms = () => ctx.props().filter(p => p.t === 'vent' && p.thermal && p.arena);
  /* is the hero IN a thermal's column (riding it)? */
  const riding = (P, pr) => !!pr && (pr.k || 0) > 0.25 && Math.abs(P.x - pr.x) < (pr.w || 20) && P.y <= pr.y + 2 && P.y > (pr.top || 0) - 10;
  /* THE AIR THE LEVEL GIVES: where the hero strikes from - 'air' (a thermal, the cloak, above a plain jump), 'hop' (a plain jump), 'low' (the floor) */
  const heightOf = P => { const floor = F.A.floor;
    if (P.gliding || P.y < floor - EYRIE.airH || arenaTherms().some(pr => riding(P, pr) && !P.ground)) return 'air';
    return P.ground ? 'low' : 'hop'; };
  H.heightOf = P => (F ? heightOf(P) : 'low');
  /* clouds she drags: { x, until } - the thermal under one dies while it lasts (src/sky-road-hands.js rocShade) */
  H.shade = pr => { if (!F || !pr.arena) return false; const t = ctx.time();
    if (F.storm && !pr.src) return true;
    return F.clouds.some(c => t < c.until && Math.abs(c.x - pr.x) < 40); };
  H.read = () => F ? { mode: F.e.mode, phase: F.e.phase, ward: F.e.ward || 0, storm: !!F.storm, clouds: F.clouds.length, bolt: F.bolt,
    dead: F.dead ? { x: F.dead.x, top: F.dead.top, tl: F.dead.tl, live: F.dead.live > 0, x0: F.dead.x - EYRIE.deadW, x1: F.dead.x + EYRIE.deadW, y0: F.dead.top - EYRIE.deadUp, y1: F.dead.top + EYRIE.deadDown } : null,
    chain: F.chain ? { tl: F.chain.tl, x0: F.masts[0].x - EYRIE.chainPad, x1: F.masts[F.masts.length - 1].x + EYRIE.chainPad, dir: F.chain.dir, t: F.chain.t, zones: zones(F.chain) } : null,
    charge: F.masts.map(m => +m.k.toFixed(2)), n: { ...F.n } } : null;
  H.open = rocEyrieOpen;
  /* A HERO'S BLOW ON HER (main.js wardedDamage): B11, guard by height. Returns what comes off her bar. */
  H.take = (e, dmg, fromX) => {
    if (!F || F.e !== e || !(dmg > 0) || F.room) return dmg;
    if (rocEyrieOpen(e)) return Math.max(1, Math.round(dmg * EYRIE.openK));
    if (e.ward > 0) return 0;   /* HER FEATHERS BRISTLE (B3): nothing lands - main.js's turned blow says WARDED (src/boss-read.js TURN_WORD.roc) */
    const P = ctx.hero(), how = P ? heightOf(P) : 'low';
    if (how === 'air') { F.n.airHits++; e.angleHit = ctx.time(); if (!F.told.air) { F.told.air = 1; ctx.number(e.x, e.y - 48, 'FROM THE AIR: SHE TAKES IT WHOLE', '#8fd160'); } return Math.max(1, Math.round(dmg * EYRIE.airK)); }   /* the right blow: no greed (main.js greedHit) */
    if (how === 'hop') { F.n.hopHits++; return Math.max(1, Math.round(dmg * EYRIE.hopK)); }
    F.n.lowHits++; ctx.guardLow && ctx.guardLow(e, fromX); if (!F.told.low) { F.told.low = 1; ctx.number(e.x, e.y - 52, 'HER TALONS GUARD LOW: RIDE THE AIR TO HER', '#ffd36b'); }
    return Math.max(1, Math.round(dmg * EYRIE.lowK)); };
  /* a plunge's blow on her (main.js hurtEnemy0): the game turns it into a pogo off her back and staggers her in the same frame, so it is read here, at the blow */
  H.plungeHit = e => { if (!F || F.e !== e || rocEyrieOpen(e) || NOT_FLYING.includes(e.mode) || e.y > F.A.floor - 20) return;
    if (e.ward > 0) { if (!e.warnWard) { e.warnWard = true; ctx.number(e.x, e.y - 40, 'HER FEATHERS ARE UP', '#ffb070'); } return; }
    F.n.plunges++; open(e, 'downed', EYRIE.downed); ctx.number(e.x, e.y - 44, 'THE ROC  KNOCKED DOWN', '#8fd160');
    /* HER ANSWER: the thermal you came down off is the one she drags a cloud over as she goes down (its shadow is drawn): the next plunge wants another column */
    const P = ctx.hero(), th = P ? ctx.props().filter(p => p.t === 'vent' && p.thermal && p.arena && !p.src).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0] : null; if (th) F.clouds.push({ x: th.x, until: ctx.time() + EYRIE.cloud + EYRIE.downed }); };

  /* CHAIN LIGHTNING's stretches of floor, in the order the arc runs them: hop i strikes mast i and runs the floor back to mast i-1, live chainLive from
     its start (seconds after the tell ends) */
  const zones = c => { const ms = c.dir > 0 ? F.masts : F.masts.slice().reverse(), out = [];
    for (let i = 0; i < ms.length; i++) { const a = ms[i].x, b = i ? ms[i - 1].x : ms[i].x; out.push({ x0: Math.min(a, b) - EYRIE.chainPad, x1: Math.max(a, b) + EYRIE.chainPad, at: i * EYRIE.chainHop, m: ms[i] }); }
    return out; };
  /* the masts' charge: a low glow in the storm, climbing to full on a told bolt or the chain, nothing once it has gone down the mast */
  const chargeStep = (e, dt) => { for (const m of F.masts) { let want = F.storm ? 0.45 : e.phase === 2 ? 0.14 : 0.05;
      if (F.chain && F.chain.tl > 0) want = 0.45 + 0.55 * (1 - F.chain.tl / EYRIE.chainTell);
      if (F.bolt && F.bolt.m === m) want = 0.45 + 0.55 * (1 - F.bolt.t / EYRIE.boltTell);
      m.k += (want - m.k) * Math.min(1, dt * (want > m.k ? 9 : 3)); }
    if (F.chain && F.chain.tl > 0) { F.chain.humT = (F.chain.humT || 0) - dt; if (F.chain.humT <= 0) { const k = 1 - F.chain.tl / EYRIE.chainTell; F.chain.humT = 0.32 - 0.2 * k; ctx.sfx.mastHum ? ctx.sfx.mastHum(k) : ctx.sfx.spark && ctx.sfx.spark(); } }
    if (F.storm || (F.chain && F.chain.tl > 0)) for (const m of F.masts) if (Math.random() < dt * (2 + 26 * m.k * m.k)) ctx.parts.push({ x: m.x + (Math.random() - 0.5) * 8, y: m.top + Math.random() * (m.foot - m.top) * (0.25 + 0.75 * (1 - m.k)), vx: (Math.random() - 0.5) * 90, vy: -30 - Math.random() * 50, life: 0.25, max: 0.25, col: Math.random() < 0.5 ? '#eaf6ff' : '#9fd8ff', size: 1, grav: 0 }); };

  H.update = (e, dt) => {
    const f = fight(e), A = f.A, floor = A.floor, P = ctx.hero(), cx0 = (A.x0 + A.x1) / 2, t = ctx.time();
    e.modeT -= dt; e.anim = (e.anim || 0) + dt; e.ward = Math.max(0, (e.ward || 0) - dt); e.hitT = Math.max(0, (e.hitT || 0) - dt); e.vx = 0;
    if (!e.phase) e.phase = 1;
    if (e.phase === 1 && e.hp <= e.maxHp * EYRIE.phase[0] && !rocEyrieOpen(e) && !NOT_FLYING.includes(e.mode)) { e.phase = 2; f.cyc = 0; f.i = 0; tell(e, 'stillTell', 1.0, ''); ctx.number(e.x, e.y - 56, 'THE AIR GOES DEAD', '#bfe6f5'); ctx.sfx.thunder ? ctx.sfx.thunder() : ctx.sfx.crack(); }
    if (e.phase === 2 && e.hp <= e.maxHp * EYRIE.phase[1] && !rocEyrieOpen(e) && !NOT_FLYING.includes(e.mode) && !f.dead) { e.phase = 3; f.cyc = 0; f.i = 0; tell(e, 'stormTell', 1.2, ''); ctx.number(e.x, e.y - 56, 'THE STORM ROLLS IN', '#bfe6f5'); }
    chargeStep(e, dt);
    /* THE THERMAL PLUNGE: a plunge that comes down on her back in the air, out of her ward, knocks her down - the level's verb */
    if (!rocEyrieOpen(e) && !NOT_FLYING.includes(e.mode) && P && !P.dead && !P.ground && P.plunge && P.vy > 0 && Math.abs(P.x - e.x) < 30 && P.y < e.y + 8 && P.y > e.y - 40) {
      if (e.ward > 0) { if (!e.warnWard) { e.warnWard = true; ctx.number(e.x, e.y - 40, 'HER FEATHERS ARE UP', '#ffb070'); } }
      else { f.n.plunges++; P.vy = -200; P.plunge = false; roomHurt(e, 20, P.x); open(e, 'downed', EYRIE.downed); ctx.number(e.x, e.y - 44, 'THE ROC  KNOCKED DOWN', '#8fd160'); }
    }
    /* THE LIGHTNING (the storm): a told crackle at a mast, then the bolt down it - she is knocked down if she perches on it, and it bites you at its foot */
    if (e.phase === 3 && f.storm && !f.chain) { f.boltT -= dt;
      if (!f.bolt && f.boltT <= 0 && f.masts.length) { const m = e.mode === 'perch' && e.mast ? e.mast : f.masts[Math.floor(t * 7) % f.masts.length]; f.bolt = { m, t: EYRIE.boltTell }; ctx.sfx.crack && ctx.sfx.crack(); ctx.number(m.x, m.top - 10, '!!', '#ff6b6b'); }
      if (f.bolt) { f.bolt.t -= dt; if (f.bolt.t <= 0) { const m = f.bolt.m; f.bolt = null; f.boltT = EYRIE.boltEvery; f.n.bolts++; m.k = 0; ctx.shake(8); ctx.flash && ctx.flash(); ctx.sfx.thunder ? ctx.sfx.thunder() : ctx.sfx.crack();
          ctx.burst(m.x, floor - 10, 20, ['#ffffff', '#bfe6f5', '#ffe9a0'], 120, 0.6); f.lastBolt = { x: m.x, t };
          if (P && !P.dead && Math.abs(P.x - m.x) < EYRIE.boltReach && P.y > floor - 30) ctx.damage(m.x, Math.round(18 * EYRIE.hitK), { unblockable: true, name: 'THE LIGHTNING' });
          if (e.mode === 'perch' && e.mast === m && !(e.ward > 0)) { roomHurt(e, 20, m.x); open(e, 'downed', EYRIE.downed); ctx.number(e.x, e.y - 44, 'THE LIGHTNING HAS HER', '#8fd160'); } } } }
    /* THE DEAD AIR (phase II): the cloud gathers over the column (told), then the thermal dies and the cloud's underside bites */
    if (f.dead) { const d = f.dead, under = d.top - EYRIE.deadUp;
      /* the cloud caps the column: the air under it carries you up INTO its underside, no higher - out sideways, or plunge down out of it */
      if (P && !P.dead && !P.snatched && Math.abs(P.x - d.x) < 22 && P.y - 26 < under && P.y - 26 > under - 8) { P.y = under + 26; if (P.vy < 0) P.vy = 0; }
      if (d.tl > 0) { d.tl -= dt; if (d.tl <= 0) { d.live = EYRIE.deadLive; f.clouds.push({ x: d.x, until: t + EYRIE.deadShade }); ctx.sfx.stormZap ? ctx.sfx.stormZap() : ctx.sfx.crack(); ctx.shake(4); } }
      else { d.live -= dt;
        if (P && !P.dead && !d.hit && Math.abs(P.x - d.x) < EYRIE.deadW && P.y > d.top - EYRIE.deadUp && P.y - 20 < d.top + EYRIE.deadDown) { d.hit = true; ctx.damage(d.x, Math.round(EYRIE.deadDmg * EYRIE.hitK), { unblockable: true, name: 'THE DEAD AIR' }); }
        if (d.live <= 0) f.dead = null; } }
    /* CHAIN LIGHTNING (phase III): every mast charges (told), then the arc runs mast to mast and down the floor between them */
    if (f.chain) { const c = f.chain;
      if (c.tl > 0) { c.tl -= dt; if (c.tl <= 0) { c.t = 0; ctx.flash && ctx.flash(); ctx.sfx.thunder ? ctx.sfx.thunder() : ctx.sfx.crack(); ctx.shake(7); } }
      else { const z = zones(c), was = c.t; c.t += dt;
        for (const q of z) { if (was <= q.at && c.t > q.at) { q.m.k = 0; ctx.sfx.stormZap ? ctx.sfx.stormZap() : ctx.sfx.crack(); ctx.burst(q.m.x, floor - 8, 14, ['#ffffff', '#bfe6f5', '#9fd8ff'], 110, 0.5); }
          const live = c.t >= q.at && c.t < q.at + EYRIE.chainLive;
          if (live && P && !P.dead && !c.hit && P.x > q.x0 && P.x < q.x1 && P.y > floor - EYRIE.chainAir) { c.hit = true; ctx.damage(q.m.x, Math.round(EYRIE.chainDmg * EYRIE.hitK), { unblockable: true, name: 'CHAIN LIGHTNING' }); } }
        if (c.t > z[z.length - 1].at + EYRIE.chainLive) { f.chain = null; f.boltT = Math.max(f.boltT, 2); } } }
    const next = () => { const set = e.phase === 3 ? CYCLE3 : e.phase === 2 ? CYCLE2 : CYCLE, list = set[f.cyc % set.length]; const m = list[f.i % list.length]; f.i++; if (f.i % list.length === 0) f.cyc++; return m; };
    const tx = () => Math.max(A.x0 + 40, Math.min(A.x1 - 40, P ? P.x : cx0));
    switch (e.mode) {
      case 'sleep': return;
      case 'wake': e.y += ((floor - EYRIE.flyY) - e.y) * Math.min(1, dt * 2); if (e.modeT <= 0) fly(e); break;
      case 'fly': { e.a = (e.a || 0) + dt * 0.6 * S; const hx = cx0 + Math.cos(e.a) * EYRIE.circleR, hy = floor - EYRIE.flyY + Math.sin(e.a * 2) * 18; e.x += (hx - e.x) * Math.min(1, dt * 1.6 * S); e.y += (hy - e.y) * Math.min(1, dt * 1.6 * S); e.face = Math.sign((P ? P.x : cx0) - e.x) || 1;
        if (e.modeT <= 0) { const m = next(); e.tx = tx();
          if (m === 'diveTell') { tell(e, 'diveTell', EYRIE.diveTell, '!!'); e.dives = e.phase === 3 ? 2 : 1; }
          else if (m === 'gustTell') { tell(e, 'gustTell', EYRIE.gustTell, ''); e.side = (P && P.x < cx0) ? -1 : 1; }
          else if (m === 'shedTell') tell(e, 'shedTell', EYRIE.shedTell, '!');
          else if (m === 'grabTell') tell(e, 'grabTell', EYRIE.grabTell, '!!');
          else if (m === 'cloudTell') { tell(e, 'cloudTell', EYRIE.cloudTell, ''); }
          else if (m === 'stormTell') tell(e, 'stormTell', 1.0, '');
          else if (m === 'deadAirTell') { /* THE DEAD AIR: over the thermal you ride - or, off the air, the live one nearest you */
            const ths = arenaTherms(), mine = P ? ths.find(pr => riding(P, pr)) : null, th = mine || ths.filter(pr => (pr.k || 0) > 0.25).sort((a, b) => Math.abs(a.x - (P ? P.x : 0)) - Math.abs(b.x - (P ? P.x : 0)))[0];
            if (th) { tell(e, 'deadAirTell', EYRIE.deadTell, '!!'); const top = mine ? Math.max(72, Math.min(floor - 110, P.y - 46)) : floor - EYRIE.flyY - 40;   /* over YOUR head as you ride it (its underside 34 px over you; never up under the HUD at the crest - there it is under you, and the dead air drops you into it), else over her flight */
              f.dead = { x: th.x, top, tl: EYRIE.deadTell, live: 0, hit: false }; f.n.deads++; ctx.number(th.x, top - 24, '!!', '#ff6b6b'); ctx.sfx.crack && ctx.sfx.crack();
              if (!f.told.dead) { f.told.dead = 1; ctx.number(th.x, top - 40, 'A STORM CLOUD OVER YOUR AIR: OUT OF THE COLUMN', '#ff9a5c'); } }
            else fly(e); }
          else if (m === 'chainTell' && f.masts.length > 1) { tell(e, 'chainTell', EYRIE.chainTell, '!!'); f.chain = { tl: EYRIE.chainTell, dir: e.x < cx0 ? 1 : -1, t: -1, hit: false }; f.bolt = null; f.n.chains++; ctx.sfx.charge(); for (const q of f.masts) ctx.number(q.x, q.top - 10, '!!', '#ff6b6b');
            if (!f.told.chain) { f.told.chain = 1; ctx.number(cx0, floor - 40, 'THE MASTS CHARGE: OFF THE FLOOR', '#ff9a5c'); } }
          else if (m === 'perch' && f.masts.length) { e.mast = f.masts.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0]; e.mode = 'perch'; e.modeT = EYRIE.perch; }
          else fly(e); } break; }
      case 'diveTell': e.x += (e.tx - e.x) * Math.min(1, dt * 1.2 * S); e.y += ((floor - EYRIE.flyY - 20) - e.y) * Math.min(1, dt * 2 * S); if (e.modeT <= 0) { e.mode = 'dive'; e.vy = EYRIE.diveV; ctx.sfx.heavy(); } break;
      case 'dive': e.x += (e.tx - e.x) * Math.min(1, dt * 8); e.y += EYRIE.diveV * dt;
        if (P && !P.dead && e.hitT <= 0 && Math.abs(P.x - e.x) < 22 && Math.abs(P.y - e.y) < 26) { e.hitT = 1; ctx.damage(e.x, Math.round(ctx.DMG.rocRake * EYRIE.hitK), { unblockable: true, up: true, name: 'HER TALONS' }); }
        if (e.y >= floor) { e.y = floor; ctx.dust(e.x, floor, 14); ctx.shake(5);
          if (onNest(e.x) && !(e.ward > 0)) { f.n.sticks++; open(e, 'stuck', EYRIE.stuck); ctx.number(e.x, e.y - 44, 'HER TALONS ARE STUCK IN THE NEST', '#8fd160'); }
          else { e.mode = 'skidUp'; e.modeT = 0.6 / S; ctx.number(e.x, e.y - 40, e.ward > 0 ? 'HER FEATHERS ARE UP' : 'SHE SKIDS ON THE STONE', '#ffb070'); } } break;
      case 'skidUp': e.y -= 140 * S * dt; if (e.modeT <= 0) { if (e.dives > 1) { e.dives--; e.tx = tx(); tell(e, 'diveTell', Math.max(0.6, EYRIE.diveTell * 0.8), '!!'); } else fly(e); } break;
      case 'gustTell': e.x += ((cx0 - e.side * 120) - e.x) * Math.min(1, dt * 2 * S); if (e.modeT <= 0) { e.mode = 'gust'; e.modeT = EYRIE.gust; ctx.sfx.puff(); } break;
      case 'gust': if (P && !P.dead && !P.snatched) { P.vx += e.side * (P.ground ? EYRIE.gustPush : EYRIE.gustPush * 1.3) * dt; if (P.ground) ctx.moveHero(e.side * 70 * dt); }
        if (Math.random() < dt * 40) ctx.parts.push({ x: e.x, y: floor - 10 - Math.random() * 90, vx: e.side * 380, vy: 0, life: 0.6, max: 0.6, col: '#dce3ec', size: 1, grav: 0 });
        if (e.modeT <= 0) fly(e); break;
      case 'shedTell': if (e.modeT <= 0) { for (let k = 0; k < (e.phase === 3 ? 6 : 5); k++) { const a = Math.atan2((P ? P.y : floor) - 12 - e.y, (P ? P.x : cx0) - e.x) + (k - 2) * 0.2; ctx.seed({ x: e.x, y: e.y - 15, vx: Math.cos(a) * 190, vy: Math.sin(a) * 190, dead: false, life: 3, sunshard: true, rocFeather: true, g: 70 }); } ctx.sfx.throwWhoosh(); e.mode = 'shed'; e.modeT = 0.5 / S; } break;
      case 'shed': if (e.modeT <= 0) fly(e); break;
      case 'cloudTell': if (e.modeT <= 0) { /* SHE DRAGS A CLOUD over the thermal nearest you: its shadow kills it */
          const th = arenaTherms().sort((a, b) => Math.abs(a.x - (P ? P.x : 0)) - Math.abs(b.x - (P ? P.x : 0)))[0];
          if (th) { f.clouds.push({ x: th.x, until: t + EYRIE.cloud }); ctx.number(th.x, th.top + 20, 'SHE DRAGS A CLOUD OVER IT', '#bfe6f5'); }
          f.clouds = f.clouds.filter(c => t < c.until); fly(e); } break;
      case 'deadAirTell': e.y += ((floor - EYRIE.flyY - 24) - e.y) * Math.min(1, dt * 2 * S); if (e.modeT <= 0) { f.clouds = f.clouds.filter(c => t < c.until); fly(e); } break;
      case 'chainTell': e.y += ((floor - EYRIE.flyY - 30) - e.y) * Math.min(1, dt * 2 * S); if (e.modeT <= 0) { e.mode = 'chain'; e.modeT = F.masts.length * EYRIE.chainHop + EYRIE.chainLive; } break;
      case 'chain': if (e.modeT <= 0 || !f.chain) fly(e); break;
      case 'stillTell': e.y += ((floor - EYRIE.flyY - 30) - e.y) * Math.min(1, dt * 2); if (e.modeT <= 0) fly(e); break;
      case 'stormTell': e.y += ((floor - EYRIE.flyY - 30) - e.y) * Math.min(1, dt * 2); if (e.modeT <= 0) { f.storm = true; ctx.sfx.thunder ? ctx.sfx.thunder() : ctx.sfx.crack(); fly(e); } break;
      case 'perch': { const m = e.mast; if (!m) { fly(e); break; } e.x += (m.x - e.x) * Math.min(1, dt * 4 * S); e.y += (m.top - e.y) * Math.min(1, dt * 4 * S); e.face = Math.sign((P ? P.x : cx0) - e.x) || 1;
        e.shedT = (e.shedT || 1) - dt; if (e.shedT <= 0 && Math.abs(e.y - m.top) < 6) { e.shedT = 1.3 / S; for (let k = 0; k < 3; k++) { const a = Math.atan2((P ? P.y : floor) - 12 - e.y, (P ? P.x : cx0) - e.x) + (k - 1) * 0.18; ctx.seed({ x: e.x, y: e.y - 12, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, dead: false, life: 3, sunshard: true, rocFeather: true, g: 70 }); } ctx.sfx.throwWhoosh(); }
        if (e.modeT <= 0) { e.mast = null; fly(e); } break; }
      case 'grabTell': e.x += (e.tx - e.x) * Math.min(1, dt * 1.5 * S); e.y += ((floor - 70) - e.y) * Math.min(1, dt * 2 * S); if (e.modeT <= 0) { e.mode = 'grab'; e.modeT = EYRIE.grab; e.tx = tx(); ctx.sfx.charge(); } break;
      case 'grab': e.x += (e.tx - e.x) * Math.min(1, dt * 7 * S); e.y += ((floor - 16) - e.y) * Math.min(1, dt * 7 * S);
        if (P && !P.dead && !(P.dodge > 0) && Math.abs(P.x - e.x) < 20 && Math.abs(P.y - e.y - 10) < 30) { e.mode = 'carry'; e.modeT = EYRIE.carry; f.n.snatches++; P.snatched = e; ctx.number(P.x, P.y - 30, 'SHE HAS YOU: STRUGGLE', '#ff6b6b'); ctx.sfx.queenShriek(); }
        else if (e.modeT <= 0) fly(e); break;
      case 'carry': e.y -= 52 * dt; e.x += Math.sign(cx0 - e.x) * 20 * dt; if (P) { if (ctx.pressed()) e.modeT -= EYRIE.mash; P.x = e.x; P.y = e.y + 20; P.vx = 0; P.vy = 0; P.ground = false; P.onMover = null; }
        if (e.modeT <= 0 || !P || P.dead) { if (P && P.snatched === e) { P.snatched = null; P.vy = 60; if (!P.dead) { ctx.damage(e.x, Math.round(ctx.DMG.rocDive * EYRIE.dropK), { unblockable: true, up: true, name: 'THE DROP' }); ctx.number(P.x, P.y - 26, 'SHE LETS YOU FALL', '#ff9a5c'); } } fly(e); } break;
      case 'stuck': case 'downed': e.vy = Math.min(340, (e.vy || 0) + 900 * dt); e.y = Math.min(floor, e.y + e.vy * dt); if (e.y >= floor && !e.landed) { e.landed = true; ctx.sfx.heavy(); ctx.dust(e.x, floor, 16); }
        if (e.modeT <= 0) { e.landed = false; e.ward = EYRIE.ward; e.warnWard = false; e.mode = 'rise'; e.modeT = 0.9 / S; ctx.number(e.x, e.y - 40, 'HER FEATHERS BRISTLE', '#ffb070'); } break;
      case 'rise': e.y -= 160 * S * dt; if (e.modeT <= 0) fly(e); break;
      default: fly(e);
    }
    e.x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, e.x)); e.y = Math.min(floor, e.y);
  };
  /* her ward ring and her dragged clouds, the dead air's storm cloud, the masts and their charge, the bolt's crackle, the chain's arc */
  H.draw = (g, cx, cy, time) => {
    const lv = L(); if (!lv || !lv.arena || !lv.arena.eyrie) return; const A = lv.arena, floor = A.floor, fy = Math.round(floor - cy);
    const ms = F ? F.masts : (lv.ents || []).filter(q => q.t === 'mast').map(q => ({ x: q.x * TS + 8, top: (q.y + 1) * TS - 12 * TS, foot: (q.y + 1) * TS, k: 0 }));
    if (F && F.storm) { g.globalAlpha = 0.26; g.fillStyle = '#141a2c'; g.fillRect(0, 0, 2000, 2000); g.globalAlpha = 1;   /* the storm's dark, and a sheet of far lightning now and then */
      const sh = (time * 0.7) % 4.3; if (sh < 0.12) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.18 * (1 - sh / 0.12); g.fillStyle = '#9fb8ff'; g.fillRect(0, 0, 2000, 2000); g.restore(); } }
    for (const m of ms) { const x = Math.round(m.x - cx), y0 = Math.round(m.top - cy), y1 = Math.round(m.foot - cy), hgt = y1 - y0, k = m.k || 0;
      /* the light: a pool on the floor and a glow down the iron, brighter with the charge (additive) */
      if (k > 0.03) { const fl = 0.7 + 0.3 * Math.sin(time * 37 + m.x) * Math.sin(time * 23 + m.x * 0.3), a = Math.min(1, k * fl); g.save(); g.globalCompositeOperation = 'lighter';
        let gr = g.createRadialGradient(x, y0, 0, x, y0, 14 + 56 * k); gr.addColorStop(0, 'rgba(235,248,255,' + a.toFixed(3) + ')'); gr.addColorStop(0.3, 'rgba(140,200,255,' + (0.6 * a).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(60,110,255,0)');
        g.fillStyle = gr; g.fillRect(x - 72, y0 - 72, 144, 144);
        gr = g.createLinearGradient(x - 10 - 12 * k, 0, x + 10 + 12 * k, 0); gr.addColorStop(0, 'rgba(90,160,255,0)'); gr.addColorStop(0.5, 'rgba(150,210,255,' + (0.55 * a).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(90,160,255,0)');
        g.fillStyle = gr; g.fillRect(x - 10 - 12 * k, y0, 20 + 24 * k, hgt);   /* the halo down the iron */
        gr = g.createRadialGradient(x, y1, 0, x, y1, 24 + 70 * k); gr.addColorStop(0, 'rgba(180,220,255,' + (0.75 * a).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(60,110,255,0)');
        g.fillStyle = gr; g.save(); g.translate(x, y1); g.scale(1, 0.3); g.translate(-x, -y1); g.fillRect(x - 96, y1 - 96, 192, 192); g.restore();   /* the light pool on the floor */
        g.restore(); }
      /* the iron mast, its yard */
      g.fillStyle = '#3a3e48'; g.fillRect(x - 2, y0, 4, hgt); g.fillStyle = '#7a8090'; g.fillRect(x - 1, y0, 1, hgt); g.fillRect(x - 8, y0, 16, 2);
      /* THE CHARGE LEVEL: the mast's iron bands light from the foot up as it fills */
      const bands = 12, lit = Math.round(k * bands); for (let i = 0; i < bands; i++) { const by = y1 - Math.round((i + 0.5) * hgt / bands), on = i < lit, hot = k > 0.85 && Math.floor(time * 14) % 2; g.fillStyle = on ? (hot ? '#ffffff' : '#bfe8ff') : '#4a505c'; g.fillRect(x - 3, by, 6, 2); if (on) { g.fillStyle = hot ? '#ffffff' : '#7fc4ff'; g.fillRect(x - 5, by, 1, 2); g.fillRect(x + 4, by, 1, 2); } }
      /* the crackle at the top: St Elmo's fire, more and longer with the charge */
      if (k > 0.12) { g.strokeStyle = Math.floor(time * 20 + m.x) % 2 ? '#ffffff' : '#bfe6f5'; g.lineWidth = 1; g.beginPath(); const n = 2 + Math.floor(k * 8);
        for (let i = 0; i < n; i++) { let px = x, py = y0 + (i % 3 ? 0 : Math.random() * hgt * 0.5 * k); g.moveTo(px, py); for (let s = 0; s < 4; s++) { px += (Math.random() - 0.5) * 22 * k; py += (Math.random() - 0.65) * 12 * k; g.lineTo(Math.round(px), Math.round(py)); } } g.stroke(); } }
    /* the nest's woven boards, so the player can read where her dive sticks */
    if (A.nest) { const x0 = Math.round(A.nest[0] - cx), x1 = Math.round(A.nest[1] - cx); g.fillStyle = '#7a5a3a'; g.fillRect(x0, fy - 3, x1 - x0, 3); g.fillStyle = '#a8845a'; for (let x = x0; x < x1; x += 6) g.fillRect(x, fy - 3, 3, 1); }
    if (!F) return; const e = F.e, t = ctx.time();
    for (const c of F.clouds) if (t < c.until) { const x = Math.round(c.x - cx); g.globalAlpha = 0.22; g.fillStyle = '#28304a'; g.fillRect(x - 40, 0, 80, fy); g.globalAlpha = 1; g.fillStyle = '#d6dfec'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x - 30 + k * 20, 20 + (k % 2) * 4, 12, 0, 7); g.fill(); } }
    /* THE DEAD AIR: a black storm cloud gathering over the column (it darkens and crackles through the tell), its underside alive once it lands */
    if (F.dead) { const d = F.dead, x = Math.round(d.x - cx), y = Math.round(d.top - cy), k = d.tl > 0 ? 1 - d.tl / EYRIE.deadTell : 1, W = EYRIE.deadW;
      g.globalAlpha = 0.35 + 0.55 * k; g.fillStyle = '#2a2f40'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(x - W + i * (W / 2), y - EYRIE.deadUp - 4 + (i % 2) * 5, 9 + 5 * k, 0, 7); g.fill(); } g.globalAlpha = 1;
      g.fillStyle = '#4a5268'; g.fillRect(x - W, y - EYRIE.deadUp, W * 2, 3);
      if (d.tl > 0) { g.globalAlpha = 0.25 + 0.5 * k; g.fillStyle = '#ff6b6b'; g.fillRect(x - W, y - EYRIE.deadUp + 3, W * 2, 1); g.globalAlpha = 1; if (Math.random() < k) { g.strokeStyle = '#bfe6f5'; g.lineWidth = 1; g.beginPath(); let px = x + (Math.random() - 0.5) * W * 2, py = y - EYRIE.deadUp + 3; g.moveTo(px, py); for (let s = 0; s < 3; s++) { px += (Math.random() - 0.5) * 10; py += 4 + Math.random() * 6; g.lineTo(Math.round(px), Math.round(py)); } g.stroke(); } }
      else { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.16 + 0.1 * Math.sin(time * 40); g.fillStyle = '#9fd8ff'; g.fillRect(x - W, y - EYRIE.deadUp, W * 2, EYRIE.deadUp + EYRIE.deadDown); g.restore();
        g.strokeStyle = Math.floor(time * 24) % 2 ? '#ffffff' : '#bfe6f5'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 4; i++) { let px = x - W + Math.random() * W * 2, py = y - EYRIE.deadUp + 3; g.moveTo(px, py); while (py < y + EYRIE.deadDown) { px += (Math.random() - 0.5) * 12; py += 6 + Math.random() * 8; g.lineTo(Math.round(px), Math.round(py)); } } g.stroke(); } }
    /* CHAIN LIGHTNING: the arc between the masts as it runs, the live floor under it */
    if (F.chain) { const c = F.chain;
      if (c.tl > 0) { const k = 1 - c.tl / EYRIE.chainTell; g.globalAlpha = 0.15 + 0.4 * k * (Math.floor(time * 10) % 2 ? 1 : 0.6); g.fillStyle = '#ff6b6b'; const z = zones(c); g.fillRect(Math.round(z[0].x0 < z[z.length - 1].x0 ? z[0].x0 - cx : z[z.length - 1].x0 - cx), fy - 2, Math.round(Math.abs(z[z.length - 1].x1 - z[0].x0) + 0), 2); g.globalAlpha = 1; }
      else for (const q of zones(c)) { if (!(c.t >= q.at && c.t < q.at + EYRIE.chainLive)) continue; const x0 = Math.round(q.x0 - cx), x1 = Math.round(q.x1 - cx), mx = Math.round(q.m.x - cx), my = Math.round(q.m.top - cy);
        g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(0, fy, 0, fy - EYRIE.chainAir - 6); gr.addColorStop(0, 'rgba(190,230,255,0.75)'); gr.addColorStop(1, 'rgba(90,160,255,0)'); g.fillStyle = gr; g.fillRect(x0, fy - EYRIE.chainAir - 6, x1 - x0, EYRIE.chainAir + 6); g.restore();
        g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.moveTo(mx, my); let py = my, px = mx; while (py < fy) { py += 16; px = mx + (Math.random() - 0.5) * 12; g.lineTo(px, Math.min(fy, py)); } g.stroke();
        for (let w = 0; w < 3; w++) { g.lineWidth = w ? 1 : 2; g.strokeStyle = w === 1 ? '#9fd8ff' : '#ffffff'; g.beginPath(); g.moveTo(x0, fy - 3); for (let xx = x0; xx < x1; xx += 6) g.lineTo(xx, fy - 2 - Math.random() * (w ? 16 : 8)); g.stroke(); } } }
    if (F.bolt) { const m = F.bolt.m, x = Math.round(m.x - cx), k = Math.floor(time * 16) % 2; g.strokeStyle = k ? '#ffffff' : '#bfe6f5'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 6; i++) { g.moveTo(x + (Math.random() - 0.5) * 10, Math.round(m.top - cy) + i * 4); g.lineTo(x + (Math.random() - 0.5) * 10, Math.round(m.top - cy) + i * 4 + 4); } g.stroke();
      g.globalAlpha = 0.35; g.fillStyle = '#ff6b6b'; g.fillRect(x - 22, fy - 2, 44, 2); g.globalAlpha = 1; }
    if (F.lastBolt && t - F.lastBolt.t < 0.25) { const x = Math.round(F.lastBolt.x - cx); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); let y = 0; while (y < fy) { y += 20; g.lineTo(x + (Math.random() - 0.5) * 14, y); } g.stroke(); }
    if (e.alive && e.ward > 0) { const k = 0.5 + 0.5 * Math.sin(time * 12); g.globalAlpha = 0.3 + 0.3 * k; g.strokeStyle = '#ffb070'; g.lineWidth = 1; g.beginPath(); g.arc(Math.round(e.x - cx), Math.round(e.y - cy) - 14, 26, 0, 7); g.stroke(); g.globalAlpha = 1; }
    if (e.alive && e.mode === 'grabTell') { const k = Math.floor(time * 12) % 2; g.fillStyle = k ? '#ff6b6b' : '#f0d895'; const x = Math.round(e.x - cx), y = Math.round(e.y - cy); for (let i = -1; i <= 1; i++) g.fillRect(x + i * 8 - 1, y + 2, 3, 8); }
  };
  return H;
}

/* THE HUMAN-SPEED BOT'S PLAN (src/lab.js, the boss lab; tools/combat-pilots.mjs): what a player reads - her mark a quarter-second late, the shadow of her
   dive, her spread talons, the gale's side, the bolt's crackle at a mast - and the level's verb: it turns the nest's stone when the storm leaves only that
   thermal, rides a live thermal up, glides over her and PLUNGES; on the nest it waits out her dive and rolls at the last beat so her talons stick; open,
   it cuts her. In: { P, e, R (ROCE.read()), A (the arena), therms: [{x, k, top}], stone: {x, on}, reach, shield, t, rng, mem }.
   Out: { gx, hold (jump held: rise and glide), plunge, atk, dodge, block, mash, jump, why }
   (claude/roc2, o.eyes only - the legacy plan is byte-identical: she is hittable from the air, so up a thermal it cuts her where she flies; it wakes the
   nest's stone under her; it steps out of the column under the dead air's cloud, and hops the chain lightning's floor as the arc comes) */
function planRaw(o) {
  const { P, e, R, A, therms, stone, reach, shield, t, rng, mem } = o, out = { gx: null, why: '' }, nest = A.nest || [0, 0], floor = A.floor;
  if (mem.seenMode !== e.mode) { mem.seenMode = e.mode; mem.seenAt = t; mem.lag = 0.2 + rng() * 0.15; }
  const seen = o.eyes || t - mem.seenAt >= mem.lag;   /* (a quarter-second, give or take, before it reacts to a new mode) */   /* (claude/botreads, o.eyes: the lab's eyes already see her a reaction late - no second lag on top, and none again as a read tell turns into its blow) */
  if (P.snatched) { out.mash = true; out.why = 'struggle'; return out; }
  const evx = mem.ex !== undefined ? (e.x - mem.ex) / Math.max(1e-3, t - mem.et) : 0; mem.ex = e.x; mem.et = t;
  const dx = e.x - P.x, lead = e.x + evx * Math.min(0.5, Math.max(0, (e.y - P.y) / 340));
  if (rocEyrieOpen(e)) { out.gx = e.x - (Math.sign(dx) || 1) * Math.max(14, reach * 0.6); if (Math.abs(dx) < reach + 14 && Math.abs(P.y - e.y) < 30 && P.ground) out.atk = true; out.why = 'cut her'; return out; }
  if (o.eyes) { const v = planEyes(o, out, dx); if (v) return v; }
  if (R && R.bolt && Math.abs(P.x - R.bolt.m.x) < 40 && P.ground) { out.gx = P.x + (P.x < R.bolt.m.x ? -50 : 50); out.why = 'off the mast'; return out; }
  if ((e.mode === 'grabTell' || e.mode === 'grab') && seen) { const d = Math.hypot(e.x - P.x, e.y - P.y); if (e.mode === 'grab' && d < 70) out.dodge = true; out.gx = P.x - (Math.sign(dx) || 1) * 40; out.why = 'roll the snatch'; return out; }
  if ((e.mode === 'diveTell' || e.mode === 'dive') && seen && P.ground) {
    const onNest = P.x > nest[0] + 6 && P.x < nest[1] - 6;
    if (onNest && !(e.ward > 0)) { out.gx = P.x; if (e.mode === 'dive' && e.y > floor - 70) out.dodge = true; out.why = 'let her dive on the nest'; return out; }
    out.gx = Math.abs(P.x - (e.tx || e.x)) < 40 ? P.x + (P.x < (e.tx || e.x) ? -60 : 60) : P.x; out.why = 'off the shadow'; return out; }
  if (e.mode === 'shedTell' && seen && P.ground) { if (shield) out.block = true; else if (e.modeT < 0.2) out.dodge = true; out.gx = P.x; out.why = 'the feathers'; return out; }
  if ((e.mode === 'gust' || e.mode === 'gustTell') && seen && P.ground) { out.gx = P.x - (o.eyes && e.mode === 'gustTell' ? (Math.sign(P.x - e.x) || 1) : (e.side || 1)) * 40; out.why = 'lean into the gale';   /* (claude/botreads, o.eyes: her gale's side is not drawn while she gathers it - she flies to the far side and it blows away from her) */ return out; }
  /* THE STORM: only the nest's stone thermal rises - turn it */
  const live = therms.filter(q => q.k > 0.5);
  if (!live.length && stone && !stone.on) { out.gx = stone.x - 12; if (Math.abs(P.x - (stone.x - 12)) < 6 && P.ground) { out.atk = true; out.face = 1; } out.why = 'turn the stone'; return out; }
  /* THE PLUNGE: up a live thermal, glide over her, come down on her back */
  if (!P.ground && P.y < e.y - 30 && (P.vy > -40 || mem.over)) { mem.over = true; out.gx = lead; out.hold = true; if (Math.abs(lead - P.x) < 14 && e.y - P.y < 120 && P.vy > -60) out.plunge = true; out.why = 'over her: plunge'; return out; }
  mem.over = false;
  const th = live.sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
  if (th) { out.gx = th.x; out.hold = !P.ground; if (!P.ground && P.y < th.top + 40) out.gx = e.x; out.why = 'ride the thermal'; return out; }
  out.gx = (nest[0] + nest[1]) / 2; out.why = 'wait on the nest'; return out;
}
/* (claude/roc2) the v2 plan's new reads - each one is drawn: the dead air's cloud and its red !!, the masts' charge and the arc as it runs, her body in the air */
function planEyes(o, out, dx) {
  const { P, e, R, reach, stone, rng, mem, t } = o, floor = o.A.floor;
  /* a drawn thing is SEEN a reaction after it first appears (its own die), as a player sees it - never on the frame it is born */
  const sees = (k, key) => { if (!key) { mem[k] = null; return false; } if (!mem[k] || mem[k].key !== key) mem[k] = { key, at: t, lag: 0.2 + rng() * 0.15 }; return t - mem[k].at >= mem[k].lag; };
  const deadSeen = sees('seeDead', R && R.dead ? R.dead.x + ':' + R.dead.top : null), chainSeen = sees('seeChain', R && R.chain ? 'c' + R.chain.dir + ':' + (R.n ? R.n.chains : 0) : null);
  /* THE DEAD AIR: the cloud gathers over a column - out of it, sideways (glide if aloft); never under its live underside */
  if (R && R.dead && deadSeen) { const d = R.dead, inBox = P.x > d.x0 - 8 && P.x < d.x1 + 8 && P.y > d.y0 - 30;
    if (inBox && P.y < d.y1 + 60) { const side = Math.sign(P.x - d.x) || (Math.sign(e.x - P.x) || 1); out.gx = P.x + side * 70; out.hold = !P.ground; out.why = 'out from under the dead air'; return out; } }
  /* CHAIN LIGHTNING: off the mast floor before it runs, or hop it as the arc reaches you */
  if (R && R.chain && chainSeen && P.ground) { const c = R.chain, inZ = P.x > c.x0 && P.x < c.x1;
    if (inZ) { const z = c.zones.filter(q => P.x > q.x0 && P.x < q.x1).map(q => q.at)[0] || 0, eta = (c.tl > 0 ? c.tl : 0) + z - Math.max(0, c.t);
      if (mem.chainJ === undefined || mem.chainKey !== mem.seeChain.key) { mem.chainJ = -0.03 + rng() * 0.22; mem.chainKey = mem.seeChain.key; }   /* (its hop timed by eye: sometimes a beat early, sometimes late) */
      if (eta < mem.chainJ + 0.02 && eta > -0.25) { out.jump = true; out.gx = P.x; out.why = 'hop the chain'; return out; }
      const exL = c.x0 - 10, exR = c.x1 + 10, ex = Math.abs(P.x - exL) < Math.abs(P.x - exR) ? exL : exR;
      if (eta > 0.9 && Math.abs(P.x - ex) < 90) { out.gx = ex; out.why = 'off the mast floor'; return out; }
      out.gx = P.x; out.why = 'wait to hop the chain'; return out; } }
  if (R && R.chain && !P.ground && P.y > floor - 40 && R.chain.tl <= 0) { out.hold = true; }
  /* IN THE AIR WITH HER: she takes a blow whole from the air - cut her where she flies (not into her feathers' ward) */
  if (!P.ground && !(e.ward > 0) && Math.abs(dx) < reach + 17 && Math.abs(P.y - e.y + 6) < 30 && !['dive', 'grab', 'carry'].includes(e.mode)) { out.atk = true; out.face = Math.sign(dx) || 1; out.gx = e.x - (Math.sign(dx) || 1) * Math.max(10, reach * 0.5); out.hold = true; out.why = 'cut her in the air'; return out; }
  /* RIDING UP AT HER HEIGHT: steer to her and glide */
  if (!P.ground && !(e.ward > 0) && P.y < e.y + 24 && P.y > e.y - 60 && Math.abs(dx) < 170 && !['dive', 'grab', 'carry', 'diveTell', 'grabTell'].includes(e.mode)) { out.gx = e.x; out.hold = true; out.why = 'glide to her'; return out; }
  /* THE PLAY: wake the nest's stone so a thermal rises under her (the rim's are hers to cloud) */
  if (stone && !stone.on && P.ground && !['diveTell', 'dive', 'grabTell', 'grab'].includes(e.mode) && !(R && (R.chain || R.bolt))) { out.gx = stone.x - 12; if (Math.abs(P.x - (stone.x - 12)) < 6) { out.atk = true; out.face = 1; } out.why = 'wake the stone under her'; return out; }
  return null;
}
/* (the plan never walks onto the thorny rim) */
export function rocEyriePlan(o) { const out = planRaw(o), A = o.A; if (out.gx != null) out.gx = Math.max(A.x0 + 52, Math.min(A.x1 - 52, out.gx)); return out; }
