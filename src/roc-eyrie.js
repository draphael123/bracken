// src/roc-eyrie.js - THE ROC on her EYRIE (claude/skyroad, the GREYBOX; brief docs/concepts/sky-road.md). She has had no level since the Monastery's
// rework (main.js updateRoc is her belfry fight, kept and unplaced); this is her fight rebuilt round THE SKY ROAD's rule - she is the rising air,
// personified: the mother of harpies who rides the thermals and drags the clouds over them. main.js hands her body here when L.arena.eyrie (ROCE.on()).
//
// HER KIT, KEPT: in the air nearly always (a blow there lands at the global twentieth, src/boss-greed.js); THE DIVE - a shadow marks the spot, and onto
// the nest's woven boards her talons STICK (open), onto stone she skids and is up again; THE GALE (wingbeats walk you toward the thorny rim, red !!);
// SHED FEATHERS; THE SNATCH (as her harpies: her talons spread is the tell, red !!; struggle free).
// NEW, FROM THE LEVEL: THE THERMAL PLUNGE (her main opening) - ride a rim thermal up over her and PLUNGE onto her back: she drops to the nest, open.
//   Her answer to your verb: she DRAGS A CLOUD over the thermal nearest you (its shadow told, src/sky-road-hands.js draws it as the rule's own).
// PHASE TWO (half her blood): THE STORM ROLLS IN - the rim thermals die (only the nest's own sun-stone thermal still rises); lightning finds the iron
//   kite-masts (a told crackle at the mast); a strike while she perches on a mast knocks her down. ONE NEW MOVE: the storm dive (two shadows).
// ANTI-SPAM WARD: after every opening a told 3 s ward (feathers bristle, a ring): no plunge opens her, and the dive skids. STAGGER = STILL: open, she lies.
// The bot plan is src/lab.js (rocEyriePlan). Numbers: EYRIE.
export const EYRIE = {
  hp: 1100, flyY: 128, circleR: 150, stuck: 3.6, downed: 3.6, ward: 3.0, openMul: 1.5,
  diveTell: 1.0, diveV: 420, gustTell: 0.8, gust: 2.2, gustPush: 230, shedTell: 0.7, grabTell: 0.85, grab: 0.6, carry: 1.6, mash: 0.3,
  cloud: 5, cloudTell: 0.9, perch: 2.6, boltTell: 1.3, boltEvery: 5.5, boltReach: 22, rest: [1.4, 1.1],
};
const CYCLE = [['diveTell', 'gustTell', 'shedTell', 'cloudTell', 'grabTell'], ['grabTell', 'diveTell', 'cloudTell', 'shedTell', 'gustTell'], ['shedTell', 'cloudTell', 'diveTell', 'grabTell', 'gustTell']];
const CYCLE2 = [['stormTell', 'perch', 'diveTell', 'grabTell', 'perch', 'shedTell'], ['perch', 'gustTell', 'stormTell', 'perch', 'grabTell', 'diveTell']];
export const rocEyrieOpen = e => e.mode === 'stuck' || e.mode === 'downed';

export function makeRocEyrie(ctx) {
  const H = {}, TS = ctx.TS; let F = null;
  const L = () => ctx.L;
  H.on = () => !!(L() && L().arena && L().arena.eyrie);
  H.reset = () => { F = null; };
  const fight = e => { if (F && F.e === e) return F; const A = L().arena; F = { e, A, cyc: 0, i: 0, clouds: [], bolt: null, boltT: EYRIE.boltEvery, masts: (L().ents || []).filter(q => q.t === 'mast').map(q => ({ x: q.x * TS + 8, top: (q.y + 1) * TS - 12 * TS })), n: { plunges: 0, sticks: 0, bolts: 0, opens: 0, snatches: 0 } }; return F; };
  const tell = (e, mode, t, mark) => { e.mode = mode; e.modeT = t; if (mark) ctx.number(e.x, e.y - 40, mark, mark === '!!' ? '#ff6b6b' : '#ffd36b'); };   /* the mark is src/marks.js's: a red !! nothing turns, a yellow ! a shield turns, none for a windup that strikes nobody */
  const onNest = (x) => { const n = L().arena.nest; return n && x >= n[0] && x <= n[1]; };
  const fly = e => { e.mode = 'fly'; e.modeT = EYRIE.rest[e.phase === 2 ? 1 : 0]; };
  const open = (e, mode, t, say) => { e.mode = mode; e.modeT = t; e.vy = 0; e.ward = 0; F.n.opens++; ctx.number(e.x, e.y - 44, say, '#8fd160'); ctx.shake(6); ctx.zoomKick && ctx.zoomKick(); ctx.sfx.queenShriek(); ctx.burst(e.x, e.y - 14, 18, ['#bfe6f5', '#eefaff', '#8a8478'], 90, 0.6); };
  /* clouds she drags: { x, t } - the thermal under one dies while it lasts (src/sky-road-hands.js rocShade) */
  H.shade = pr => { if (!F || !pr.arena) return false; const t = ctx.time();
    if (F.storm && !pr.src) return true;
    return F.clouds.some(c => t < c.until && Math.abs(c.x - pr.x) < 40); };
  H.read = () => F ? { mode: F.e.mode, phase: F.e.phase, ward: F.e.ward || 0, storm: !!F.storm, clouds: F.clouds.length, bolt: F.bolt, n: { ...F.n } } : null;
  H.open = rocEyrieOpen;

  H.update = (e, dt) => {
    const f = fight(e), A = f.A, floor = A.floor, P = ctx.hero(), cx0 = (A.x0 + A.x1) / 2;
    e.modeT -= dt; e.anim = (e.anim || 0) + dt; e.ward = Math.max(0, (e.ward || 0) - dt); e.hitT = Math.max(0, (e.hitT || 0) - dt); e.vx = 0;
    if (!e.phase) e.phase = 1;
    if (e.phase === 1 && e.hp <= e.maxHp / 2 && !rocEyrieOpen(e)) { e.phase = 2; f.cyc = 0; f.i = 0; tell(e, 'stormTell', 1.2, ''); ctx.number(e.x, e.y - 56, 'THE STORM ROLLS IN', '#bfe6f5'); }
    /* THE THERMAL PLUNGE: a plunge that comes down on her back in the air, out of her ward, knocks her down - the level's verb */
    if (!rocEyrieOpen(e) && !['wake', 'sleep', 'dive', 'carry'].includes(e.mode) && P && !P.dead && P.plunge && P.vy > 0 && Math.abs(P.x - e.x) < 30 && P.y < e.y + 8 && P.y > e.y - 40) {
      if (e.ward > 0) { if (!e.warnWard) { e.warnWard = true; ctx.number(e.x, e.y - 40, 'HER FEATHERS ARE UP', '#ffb070'); } }
      else { f.n.plunges++; P.vy = -200; P.plunge = false; ctx.hurt(e, 20, P.x); open(e, 'downed', EYRIE.downed, 'THE ROC  KNOCKED DOWN'); }
    }
    /* THE LIGHTNING (phase two): a told crackle at a mast, then the bolt down it - she is knocked down if she perches on it, and it bites you at its foot */
    if (e.phase === 2 && f.storm) { f.boltT -= dt;
      if (!f.bolt && f.boltT <= 0 && f.masts.length) { const m = e.mode === 'perch' && e.mast ? e.mast : f.masts[Math.floor(ctx.time() * 7) % f.masts.length]; f.bolt = { m, t: EYRIE.boltTell }; ctx.sfx.crack && ctx.sfx.crack(); ctx.number(m.x, m.top - 10, '!!', '#ff6b6b'); }
      if (f.bolt) { f.bolt.t -= dt; if (f.bolt.t <= 0) { const m = f.bolt.m; f.bolt = null; f.boltT = EYRIE.boltEvery; f.n.bolts++; ctx.shake(8); ctx.flash && ctx.flash(); ctx.sfx.thunder ? ctx.sfx.thunder() : ctx.sfx.crack();
          ctx.burst(m.x, floor - 10, 20, ['#ffffff', '#bfe6f5', '#ffe9a0'], 120, 0.6); f.lastBolt = { x: m.x, t: ctx.time() };
          if (P && !P.dead && Math.abs(P.x - m.x) < EYRIE.boltReach && P.y > floor - 30) ctx.damage(m.x, 18, { unblockable: true, name: 'THE LIGHTNING' });
          if (e.mode === 'perch' && e.mast === m && !(e.ward > 0)) { ctx.hurt(e, 20, m.x); open(e, 'downed', EYRIE.downed, 'THE LIGHTNING HAS HER'); } } } }
    const next = () => { const list = e.phase === 2 ? CYCLE2[f.cyc % CYCLE2.length] : CYCLE[f.cyc % CYCLE.length]; const m = list[f.i % list.length]; f.i++; if (f.i % list.length === 0) f.cyc++; return m; };
    const tx = () => Math.max(A.x0 + 40, Math.min(A.x1 - 40, P ? P.x : cx0));
    switch (e.mode) {
      case 'sleep': return;
      case 'wake': e.y += ((floor - EYRIE.flyY) - e.y) * Math.min(1, dt * 2); if (e.modeT <= 0) fly(e); break;
      case 'fly': { e.a = (e.a || 0) + dt * 0.6; const hx = cx0 + Math.cos(e.a) * EYRIE.circleR, hy = floor - EYRIE.flyY + Math.sin(e.a * 2) * 18; e.x += (hx - e.x) * Math.min(1, dt * 1.6); e.y += (hy - e.y) * Math.min(1, dt * 1.6); e.face = Math.sign((P ? P.x : cx0) - e.x) || 1;
        if (e.modeT <= 0) { const m = next(); e.tx = tx();
          if (m === 'diveTell') { tell(e, 'diveTell', EYRIE.diveTell, '!!'); e.dives = e.phase === 2 ? 2 : 1; }
          else if (m === 'gustTell') { tell(e, 'gustTell', EYRIE.gustTell, ''); e.side = (P && P.x < cx0) ? -1 : 1; }
          else if (m === 'shedTell') tell(e, 'shedTell', EYRIE.shedTell, '!');
          else if (m === 'grabTell') tell(e, 'grabTell', EYRIE.grabTell, '!!');
          else if (m === 'cloudTell') { tell(e, 'cloudTell', EYRIE.cloudTell, ''); }
          else if (m === 'stormTell') tell(e, 'stormTell', 1.0, '');
          else if (m === 'perch' && f.masts.length) { e.mast = f.masts.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0]; e.mode = 'perch'; e.modeT = EYRIE.perch; }
          else fly(e); } break; }
      case 'diveTell': e.x += (e.tx - e.x) * Math.min(1, dt * 1.2); e.y += ((floor - EYRIE.flyY - 20) - e.y) * Math.min(1, dt * 2); if (e.modeT <= 0) { e.mode = 'dive'; e.vy = EYRIE.diveV; ctx.sfx.heavy(); } break;
      case 'dive': e.x += (e.tx - e.x) * Math.min(1, dt * 8); e.y += EYRIE.diveV * dt;
        if (P && !P.dead && e.hitT <= 0 && Math.abs(P.x - e.x) < 22 && Math.abs(P.y - e.y) < 26) { e.hitT = 1; ctx.damage(e.x, ctx.DMG.rocRake, { unblockable: true, up: true, name: 'HER TALONS' }); }
        if (e.y >= floor) { e.y = floor; ctx.dust(e.x, floor, 14); ctx.shake(5);
          if (onNest(e.x) && !(e.ward > 0)) { f.n.sticks++; open(e, 'stuck', EYRIE.stuck, 'HER TALONS ARE STUCK IN THE NEST'); }
          else { e.mode = 'skidUp'; e.modeT = 0.6; ctx.number(e.x, e.y - 40, e.ward > 0 ? 'HER FEATHERS ARE UP' : 'SHE SKIDS ON THE STONE', '#ffb070'); } } break;
      case 'skidUp': e.y -= 140 * dt; if (e.modeT <= 0) { if (e.dives > 1) { e.dives--; e.tx = tx(); tell(e, 'diveTell', EYRIE.diveTell * 0.8, '!!'); } else fly(e); } break;
      case 'gustTell': e.x += ((cx0 - e.side * 120) - e.x) * Math.min(1, dt * 2); if (e.modeT <= 0) { e.mode = 'gust'; e.modeT = EYRIE.gust; ctx.sfx.puff(); } break;
      case 'gust': if (P && !P.dead && !P.snatched) { P.vx += e.side * (P.ground ? EYRIE.gustPush : EYRIE.gustPush * 1.3) * dt; if (P.ground) ctx.moveHero(e.side * 70 * dt); }
        if (Math.random() < dt * 40) ctx.parts.push({ x: e.x, y: floor - 10 - Math.random() * 90, vx: e.side * 380, vy: 0, life: 0.6, max: 0.6, col: '#dce3ec', size: 1, grav: 0 });
        if (e.modeT <= 0) fly(e); break;
      case 'shedTell': if (e.modeT <= 0) { for (let k = 0; k < (e.phase === 2 ? 7 : 5); k++) { const a = Math.atan2((P ? P.y : floor) - 12 - e.y, (P ? P.x : cx0) - e.x) + (k - 2) * 0.16; ctx.seed({ x: e.x, y: e.y - 15, vx: Math.cos(a) * 190, vy: Math.sin(a) * 190, dead: false, life: 3, sunshard: true, rocFeather: true, g: 70 }); } ctx.sfx.throwWhoosh(); e.mode = 'shed'; e.modeT = 0.5; } break;
      case 'shed': if (e.modeT <= 0) fly(e); break;
      case 'cloudTell': if (e.modeT <= 0) { /* SHE DRAGS A CLOUD over the thermal nearest you: its shadow kills it */
          const th = ctx.props().filter(p => p.t === 'vent' && p.thermal && p.arena).sort((a, b) => Math.abs(a.x - (P ? P.x : 0)) - Math.abs(b.x - (P ? P.x : 0)))[0];
          if (th) { f.clouds.push({ x: th.x, until: ctx.time() + EYRIE.cloud }); ctx.number(th.x, th.top + 20, 'SHE DRAGS A CLOUD OVER IT', '#bfe6f5'); }
          f.clouds = f.clouds.filter(c => ctx.time() < c.until); fly(e); } break;
      case 'stormTell': e.y += ((floor - EYRIE.flyY - 30) - e.y) * Math.min(1, dt * 2); if (e.modeT <= 0) { f.storm = true; ctx.sfx.thunder ? ctx.sfx.thunder() : ctx.sfx.crack(); fly(e); } break;
      case 'perch': { const m = e.mast; if (!m) { fly(e); break; } e.x += (m.x - e.x) * Math.min(1, dt * 4); e.y += (m.top - e.y) * Math.min(1, dt * 4); e.face = Math.sign((P ? P.x : cx0) - e.x) || 1;
        e.shedT = (e.shedT || 1) - dt; if (e.shedT <= 0 && Math.abs(e.y - m.top) < 6) { e.shedT = 1.3; for (let k = 0; k < 3; k++) { const a = Math.atan2((P ? P.y : floor) - 12 - e.y, (P ? P.x : cx0) - e.x) + (k - 1) * 0.18; ctx.seed({ x: e.x, y: e.y - 12, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, dead: false, life: 3, sunshard: true, rocFeather: true, g: 70 }); } ctx.sfx.throwWhoosh(); }
        if (e.modeT <= 0) { e.mast = null; fly(e); } break; }
      case 'grabTell': e.x += (e.tx - e.x) * Math.min(1, dt * 1.5); e.y += ((floor - 70) - e.y) * Math.min(1, dt * 2); if (e.modeT <= 0) { e.mode = 'grab'; e.modeT = EYRIE.grab; e.tx = tx(); ctx.sfx.charge(); } break;
      case 'grab': e.x += (e.tx - e.x) * Math.min(1, dt * 7); e.y += ((floor - 16) - e.y) * Math.min(1, dt * 7);
        if (P && !P.dead && !(P.dodge > 0) && Math.abs(P.x - e.x) < 20 && Math.abs(P.y - e.y - 10) < 30) { e.mode = 'carry'; e.modeT = EYRIE.carry; f.n.snatches++; P.snatched = e; ctx.number(P.x, P.y - 30, 'SHE HAS YOU: STRUGGLE', '#ff6b6b'); ctx.sfx.queenShriek(); }
        else if (e.modeT <= 0) fly(e); break;
      case 'carry': e.y -= 52 * dt; e.x += Math.sign(cx0 - e.x) * 20 * dt; if (P) { if (ctx.pressed()) e.modeT -= EYRIE.mash; P.x = e.x; P.y = e.y + 20; P.vx = 0; P.vy = 0; P.ground = false; P.onMover = null; }
        if (e.modeT <= 0 || !P || P.dead) { if (P && P.snatched === e) { P.snatched = null; P.vy = 60; if (!P.dead) { ctx.damage(e.x, ctx.DMG.rocDive, { unblockable: true, up: true, name: 'THE DROP' }); ctx.number(P.x, P.y - 26, 'SHE LETS YOU FALL', '#ff9a5c'); } } fly(e); } break;
      case 'stuck': case 'downed': e.vy = Math.min(340, (e.vy || 0) + 900 * dt); e.y = Math.min(floor, e.y + e.vy * dt); if (e.y >= floor && !e.landed) { e.landed = true; ctx.sfx.heavy(); ctx.dust(e.x, floor, 16); }
        if (e.modeT <= 0) { e.landed = false; e.ward = EYRIE.ward; e.warnWard = false; e.mode = 'rise'; e.modeT = 0.9; ctx.number(e.x, e.y - 40, 'HER FEATHERS BRISTLE', '#ffb070'); } break;
      case 'rise': e.y -= 160 * dt; if (e.modeT <= 0) fly(e); break;
      default: fly(e);
    }
    e.x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, e.x)); e.y = Math.min(floor, e.y);
  };
  /* her ward ring and her dragged clouds, the bolt's crackle at its mast, the masts themselves */
  H.draw = (g, cx, cy, time) => {
    const lv = L(); if (!lv || !lv.arena || !lv.arena.eyrie) return; const A = lv.arena, floor = A.floor;
    for (const q of (lv.ents || []).filter(q => q.t === 'mast')) { const x = Math.round(q.x * TS + 8 - cx), y = Math.round((q.y + 1) * TS - cy); g.fillStyle = '#3a3e48'; g.fillRect(x - 2, y - 12 * TS, 4, 12 * TS); g.fillStyle = '#7a8090'; g.fillRect(x - 1, y - 12 * TS, 1, 12 * TS); g.fillRect(x - 8, y - 12 * TS, 16, 2); }
    /* the nest's woven boards, so the player can read where her dive sticks */
    if (A.nest) { const x0 = Math.round(A.nest[0] - cx), x1 = Math.round(A.nest[1] - cx), y = Math.round(floor - cy); g.fillStyle = '#7a5a3a'; g.fillRect(x0, y - 3, x1 - x0, 3); g.fillStyle = '#a8845a'; for (let x = x0; x < x1; x += 6) g.fillRect(x, y - 3, 3, 1); }
    if (!F) return; const e = F.e, t = ctx.time();
    for (const c of F.clouds) if (t < c.until) { const x = Math.round(c.x - cx); g.globalAlpha = 0.22; g.fillStyle = '#28304a'; g.fillRect(x - 40, 0, 80, Math.round(floor - cy)); g.globalAlpha = 1; g.fillStyle = '#d6dfec'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x - 30 + k * 20, 20 + (k % 2) * 4, 12, 0, 7); g.fill(); } }
    if (F.storm) { g.globalAlpha = 0.10; g.fillStyle = '#1a2030'; g.fillRect(0, 0, 2000, 2000); g.globalAlpha = 1; }
    if (F.bolt) { const m = F.bolt.m, x = Math.round(m.x - cx), k = Math.floor(time * 16) % 2; g.strokeStyle = k ? '#ffffff' : '#bfe6f5'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 6; i++) { g.moveTo(x + (Math.random() - 0.5) * 10, Math.round(m.top - cy) + i * 4); g.lineTo(x + (Math.random() - 0.5) * 10, Math.round(m.top - cy) + i * 4 + 4); } g.stroke();
      g.globalAlpha = 0.35; g.fillStyle = '#ff6b6b'; g.fillRect(x - 22, Math.round(floor - cy) - 2, 44, 2); g.globalAlpha = 1; }
    if (F.lastBolt && t - F.lastBolt.t < 0.25) { const x = Math.round(F.lastBolt.x - cx); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); let y = 0; while (y < floor - cy) { y += 20; g.lineTo(x + (Math.random() - 0.5) * 14, y); } g.stroke(); }
    if (e.alive && e.ward > 0) { const k = 0.5 + 0.5 * Math.sin(time * 12); g.globalAlpha = 0.3 + 0.3 * k; g.strokeStyle = '#ffb070'; g.lineWidth = 1; g.beginPath(); g.arc(Math.round(e.x - cx), Math.round(e.y - cy) - 14, 26, 0, 7); g.stroke(); g.globalAlpha = 1; }
    if (e.alive && e.mode === 'grabTell') { const k = Math.floor(time * 12) % 2; g.fillStyle = k ? '#ff6b6b' : '#f0d895'; const x = Math.round(e.x - cx), y = Math.round(e.y - cy); for (let i = -1; i <= 1; i++) g.fillRect(x + i * 8 - 1, y + 2, 3, 8); }
  };
  return H;
}

/* THE HUMAN-SPEED BOT'S PLAN (src/lab.js, the boss lab; tools/combat-pilots.mjs): what a player reads - her mark a quarter-second late, the shadow of her
   dive, her spread talons, the gale's side, the bolt's crackle at a mast - and the level's verb: it turns the nest's stone when the storm leaves only that
   thermal, rides a live thermal up, glides over her and PLUNGES; on the nest it waits out her dive and rolls at the last beat so her talons stick; open,
   it cuts her. In: { P, e, R (ROCE.read()), A (the arena), therms: [{x, k, top}], stone: {x, on}, reach, shield, t, rng, mem }.
   Out: { gx, hold (jump held: rise and glide), plunge, atk, dodge, block, mash, why } */
export function rocEyriePlan(o) {
  const { P, e, R, A, therms, stone, reach, shield, t, rng, mem } = o, out = { gx: null, why: '' }, nest = A.nest || [0, 0], floor = A.floor;
  if (mem.seenMode !== e.mode) { mem.seenMode = e.mode; mem.seenAt = t; mem.lag = 0.2 + rng() * 0.15; }
  const seen = t - mem.seenAt >= mem.lag;   /* (a quarter-second, give or take, before it reacts to a new mode) */
  if (P.snatched) { out.mash = true; out.why = 'struggle'; return out; }
  const evx = mem.ex !== undefined ? (e.x - mem.ex) / Math.max(1e-3, t - mem.et) : 0; mem.ex = e.x; mem.et = t;
  const dx = e.x - P.x, lead = e.x + evx * Math.min(0.5, Math.max(0, (e.y - P.y) / 340));
  if (rocEyrieOpen(e)) { out.gx = e.x - (Math.sign(dx) || 1) * Math.max(14, reach * 0.6); if (Math.abs(dx) < reach + 14 && Math.abs(P.y - e.y) < 30 && P.ground) out.atk = true; out.why = 'cut her'; return out; }
  if (R && R.bolt && Math.abs(P.x - R.bolt.m.x) < 40 && P.ground) { out.gx = P.x + (P.x < R.bolt.m.x ? -50 : 50); out.why = 'off the mast'; return out; }
  if (e.mode === 'grabTell' && seen) { if (e.modeT < 0.32) out.dodge = true; out.gx = P.x; out.why = 'roll the snatch'; return out; }
  if ((e.mode === 'diveTell' || e.mode === 'dive') && seen && P.ground) {
    const onNest = P.x > nest[0] + 6 && P.x < nest[1] - 6;
    if (onNest && !(e.ward > 0)) { out.gx = P.x; if (e.mode === 'dive' && e.y > floor - 70) out.dodge = true; out.why = 'let her dive on the nest'; return out; }
    out.gx = Math.abs(P.x - (e.tx || e.x)) < 40 ? P.x + (P.x < (e.tx || e.x) ? -60 : 60) : P.x; out.why = 'off the shadow'; return out; }
  if (e.mode === 'shedTell' && seen && P.ground) { if (shield) out.block = true; else if (e.modeT < 0.2) out.dodge = true; out.gx = P.x; out.why = 'the feathers'; return out; }
  if ((e.mode === 'gust' || e.mode === 'gustTell') && seen && P.ground) { out.gx = P.x - (e.side || 1) * 40; out.why = 'lean into the gale'; return out; }
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
