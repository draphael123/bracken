// src/lab-gorm.js - KING GORM 2 PLAYED (claude/gorm2): the boss lab's hands for his three acts, as a player plays them. Nothing is dropped or
// killed for the bot (the old lab dropped his plate-cages for it when he walked under one): it takes a rock off a heap, stands where the told
// arc's ring goes gold on a bowman and throws it UP; it stands at a free rope's peg on the side away from him, lets him come in under the cage
// and cuts the peg; in his glade it goes to the peg of whatever hangs nearest him (the log trap whenever he is downhill of it) and cuts it there.
// It answers his told moves the way their words say: the boar's lane is jumped, his hand is backed out of, the HIGH branch is ducked, the LOW
// one and the quake's crest and a rolling log are jumped, a cone's red ring is stepped off. Reaction comes from the profile (src/bot-profile.js)
// through the lab's own perception layer, like every other boss.
// gormHands(c) -> { goal, strike } (null goal = no opinion: the generic hands keep theirs), or null when it has nothing to say.
//   c = { BK, boss, P, k, A, h, f, reach, shielded, swing() }
export function gormHands(c) {
  const { BK, boss: e, P, k, A, f } = c, G = BK.gorm && BK.gorm(); if (!G) return null;
  const d = e.x - P.x, ad = Math.abs(d), floor = A.floor, onFloor = Math.abs(P.y - floor) < 6;
  const jump = (hold = 16) => { if (P.ground && !(P.labJump > 0)) { BK.press('jump'); P.labJump = hold; } };
  const open = e.mode === 'held' || e.mode === 'downed' || e.mode === 'stung' || e.open > 0;
  /* ---- THREATS FIRST ---- */
  /* the royal boar: jumped when it comes at you down its lane */
  const boar = BK.enemies().find(q => q.alive && q.t === 'royalboar' && (q.mode === 'charge' || q.mode === 'tell') && Math.abs(q.y - P.y) < 20 && (P.x - q.x) * q.face > 0);
  if (boar && boar.mode === 'charge' && Math.abs(P.x - boar.x) < 46) { jump(18); return { goal: null, strike: false }; }
  if (e.stage === 'court') {
    /* the litter's charge: jumped as it comes (it runs the hall's length: a roll through it or a jump over the bearers) */
    if (e.mode === 'charge' && Math.sign(P.x - e.x) === e.cdir && ad < 74 && ad > 20) { jump(18); return { goal: null, strike: false }; }
    /* his hand: out of its reach while it is told */
    if (e.mode === 'grabTell' && ad < 96) return { goal: e.x - (Math.sign(d) || 1) * 110, strike: false };
    /* an arrow's told ring on you: step off it */
    for (const q of G.bows) if (q.aim && q.aim.t < 0.45 && Math.abs(P.x - q.aim.tx) < 18) return { goal: P.x + (P.x >= q.aim.tx ? 34 : -34), strike: false };
    if (open) return { goal: e.x, strike: true };
    /* (claude/kingsfix2: every rope is free at any moment) the rope of the cage he is nearest: stand at its peg on the side away from him, let him come in under it and cut it.
       A held rock is set down - the archers are pressure the bot does not hunt. */
    if (G.held) { BK.press('talk'); return { goal: null, strike: false }; }
    const live = G.ropes.filter(r => !r.dropped && !r.spent && r.free).sort((p, q) => Math.abs(p.x - e.x) - Math.abs(q.x - e.x))[0];
    if (live) { const pg = live.pegs.slice().sort((p, q) => Math.abs(q - e.x) - Math.abs(p - e.x))[0], side = Math.sign(live.x - pg) || 1;
      if (Math.abs(e.x - live.x) < 36 && Math.abs(P.x - pg) < 16 && P.ground) { P.face = Math.sign(pg - P.x) || side; if (P.atk < 0 && f % 4 === 0) BK.press('atk'); return { goal: P.x, strike: false }; }
      return { goal: pg - side * 4, strike: false }; }
    return { goal: e.x, strike: ad < 140 };
  }
  if (e.stage !== 'glade') return null;
  /* ---- P2: THE GLADE ---- */
  if ((e.mode === 'clubHiTell' && e.modeT < 0.3 || e.mode === 'clubHi') && ad < 96 && Math.sign(P.x - e.x) === e.face) { k.left = k.right = false; k.down = true; return { goal: null, strike: false, duck: true }; }
  if ((e.mode === 'clubLoTell' && e.modeT < 0.12) && ad < 96) { jump(14); return { goal: null, strike: false }; }
  if (e.mode === 'quakeAir' && e.modeT < 0.16 && ad < 60) { jump(14); return { goal: null, strike: false }; }
  for (const w of G.waves) if (Math.abs(w.x - P.x) < 34 && (P.x - w.x) * w.dir > 0) { jump(14); return { goal: null, strike: false }; }
  for (const l of G.logs) if (Math.abs(l.x - P.x) < 40 && (P.x - l.x) * l.dir > 0) { jump(16); return { goal: null, strike: false }; }
  for (const h of G.hangs) if (h.kind === 'log' && h.state === 'roll' && Math.abs(h.lx - P.x) < 46 && (P.x - h.lx) * (h.roll || 1) > 0) { jump(18); return { goal: null, strike: false }; }
  for (const cn of G.cones) if (cn.state === 'tell' && cn.t < 0.7 && Math.abs(cn.x - P.x) < 15) return { goal: P.x + (P.x >= cn.x ? 30 : -30), strike: false };
  for (const s of G.swarms) if (Math.abs(s.x - P.x) < 50) return { goal: s.x + (P.x >= s.x ? 60 : -60), strike: open };
  if (e.mode === 'logTell' && ad > 40 && Math.sign(P.x - e.x) === e.face) return { goal: null, strike: false };   /* (it is jumped as it comes) */
  if (open) return { goal: e.x, strike: true };
  if (e.ward > 0) return { goal: e.x, strike: ad < 90 };
  /* what hangs over him: the log trap whenever he is downhill of it; else the cage or the hive he is nearest */
  const hs = G.hangs.filter(h => h.state === 'hang');
  const log = hs.find(h => h.kind === 'log' && (e.x - h.x) * (h.roll || 1) > 40);
  if (log && !['quakeTell', 'quakeAir', 'clubHiTell', 'clubLoTell'].includes(e.mode)) { const pg = log.pegs[0];
    if (Math.abs(P.x - pg) < 14 && P.ground) { P.face = Math.sign(pg - P.x) || 1; if (P.atk < 0 && f % 4 === 0) BK.press('atk'); return { goal: P.x, strike: false }; }
    return { goal: pg - 6, strike: false }; }
  const tr = hs.filter(h => h.kind !== 'log').sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
  if (tr) { const pg = tr.pegs.slice().sort((a, b) => Math.abs(b - e.x) - Math.abs(a - e.x))[0], side = Math.sign(tr.x - pg) || 1, R = tr.kind === 'hive' ? 34 : 22;
    if (Math.abs(e.x - tr.x) < R && Math.abs(P.x - pg) < 16 && P.ground) { P.face = Math.sign(pg - P.x) || side; if (P.atk < 0 && f % 4 === 0) BK.press('atk'); return { goal: P.x, strike: false }; }
    if (Math.abs(P.x - pg) < 120 || ad > 120) return { goal: pg - side * 4, strike: false }; }
  return { goal: e.x, strike: true };
}
/* THE ESCAPE, for the lab: his P1 bar has emptied - the run is a level's run (tools/gorm2.mjs walks it with the walker); the lab goes straight to his
   glade's door with the hero as the flee left him (fully healed, his flasks as he had them) */
export const RUN_ARRIVE = 0.55;   /* (the walker, 10-22: knight 50%, warden 47%, pyro 68% at the wood's shrine, 0 deaths, 0 drinks) */
export function gormSkipRun(BK) {
  const G = BK.gorm && BK.gorm(); if (!G) return false; const e = BK.enemies().find(q => q.t === 'king' && q.alive); if (!e || e.stage === 'court') return false;
  if (G.persist && G.persist.runDone && BK.L.arena === BK.L.glade && e.stage === 'glade') return false;
  /* the wood is not free: the walker (tools/level-walk.mjs kings --from=470 --setup) arrives at its shrine with RUN_ARRIVE of his health on the mean, having
     drunk nothing - so the lab's hero touches that shrine (the game's own refill: one flask) and goes into the glade with that share of his health */
  G.skipTo('glade'); const sh = G.persist ? null : null; BK.tp(635, 9); BK.sim(40); BK.P.hp = Math.min(BK.P.hp, Math.round(BK.P.maxHp * RUN_ARRIVE)); const A = BK.L.glade; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); return true;
}
