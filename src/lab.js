// src/lab.js — THE FIGHT LAB and THE BOSS LAB.
// The playtest bot walks levels. These FIGHT, and measure what a player feels: how long a foe or a boss takes to
// kill, and how much of your health it costs. Both yield between fights, so a page can be polled while they run.
//   await BK.fightLab({ levels: ['wood', 'spire', 'waymeet'], heroes: [...], foes: [...], reps: 2 })   -> window.__lab
//   await BK.bossLab({ bosses: ['wood', 'kings', ...], heroes: [...] })                                -> window.__bossLab

// each hero's real reach (attackBox in main.js), so the bot swings from where the blow actually lands
export const LAB_REACH = { knight: 22, pyro: 30, paladin: 24, pirate: 20, reaper: 34 };
export const LAB_FOES = ['sprig', 'shield', 'swornsword', 'archer', 'hedgeknight', 'cutlass', 'harpy', 'crab', 'tideguard', 'scout'];
const HEROES = ['knight', 'pyro', 'paladin', 'pirate', 'reaper'];
const threatOf = e => e.alive && ((e.mode && /Tell|tell|wind|aim|draw|charge|lunge|raise/.test(e.mode)) || e.draw > 0 || e.liftT > 0);
const yieldNow = () => new Promise(r => setTimeout(r, 0));
const SHIELDED = h => h === 'knight' || h === 'paladin' || h === 'reaper';   // C holds a guard; the others roll

// Every hero against the common foes, one at a time, in an early, a middle and a late level (so the tier scaling of
// hp and damage is in it). The bot closes to its reach and swings; when the foe winds up it defends the way its hero
// does: the knight, the paladin and the death knight hold C, the freebooter taps it to parry, the pyromancer rolls.
export async function fightLab(BK, opts = {}) {
  const lvm = await import('./level.js');
  const heroes = opts.heroes || HEROES, foes = opts.foes || LAB_FOES;
  const levels = opts.levels || ['wood', 'spire', 'waymeet'], reps = opts.reps || 2, maxF = opts.maxF || 1800;
  const rows = [], out = { rows, started: Date.now(), progress: 0, total: levels.length * heroes.length * foes.length };
  if (typeof window !== 'undefined') window.__lab = out;
  for (const lvId of levels) for (const h of heroes) for (const t of foes) {
    const fights = [];
    for (let rep = 0; rep < reps; rep++) {
      BK.setHero(h); BK.load(lvm.LEVELS.findIndex(l => l.id === lvId)); BK.state = 'play'; BK.god = false;
      for (const e of BK.enemies()) e.alive = false; BK.sim(20);
      const P = BK.P, k = BK.keys; P.hp = P.maxHp; P.st = P.maxSt; P.inv = 0;
      const before = BK.enemies().length; BK.spawnEnt({ t, x: Math.round(P.x / 16) + 5, y: Math.round(P.y / 16) - 1 });
      const e = BK.enemies()[BK.enemies().length - 1];
      if (BK.enemies().length === before || !e) { fights.push({ skipped: true }); continue; }
      let f = 0, taken = 0, swings = 0, defends = 0, died = false, last = P.hp; const ehp = e.hp;
      for (; f < maxF && e.alive; f++) {
        if (P.dead) { died = true; break; }
        const d = e.x - P.x, ad = Math.abs(d), reach = LAB_REACH[h] + e.w / 2; P.face = Math.sign(d) || P.face;
        const threat = threatOf(e) && ad < 70 && Math.abs(e.y - P.y) < 50;
        k.left = false; k.right = false; k.block = false;
        if (threat && P.atk < 0) {
          defends++;
          if (h === 'pyro') { if (f % 20 === 0) { k[d > 0 ? 'left' : 'right'] = true; BK.press('dodge'); } }
          else if (h === 'pirate') { if (f % 12 === 0) k.block = true; }
          else k.block = true;
        } else if (ad > reach - 2) k[d > 0 ? 'right' : 'left'] = true;
        else if (P.atk < 0 && P.st >= 8 && Math.abs(e.y - P.y) < 26) { BK.press('atk'); swings++; }
        BK.sim(1);
        if (P.hp < last) taken += last - P.hp; last = P.hp;
      }
      k.left = false; k.right = false; k.block = false;
      fights.push({ killed: !e.alive, died, secs: f * (BK.SET.speed || 1) / 60, taken, swings, defends, ehp, maxHp: P.maxHp });
      for (const q of BK.enemies()) q.alive = false;
      await yieldNow();
    }
    const ok = fights.filter(x => !x.skipped), ks = ok.filter(x => x.killed);
    const avg = (a, fn) => a.length ? a.reduce((s, x) => s + fn(x), 0) / a.length : null;
    out.progress++;
    if (!ok.length) { rows.push({ lvl: lvId, h, t, skipped: true }); continue; }
    rows.push({ lvl: lvId, h, t, ehp: ok[0].ehp, kills: ks.length + '/' + ok.length, deaths: ok.filter(x => x.died).length,
      ttk: ks.length ? +avg(ks, x => x.secs).toFixed(2) : null, taken: +avg(ok, x => x.taken).toFixed(1),
      takenPct: +(100 * avg(ok, x => x.taken / x.maxHp)).toFixed(1), swings: +avg(ok, x => x.swings).toFixed(1), defends: Math.round(avg(ok, x => x.defends)) });
  }
  const acc = {};
  for (const r of rows) {
    if (r.skipped) continue;
    const s = acc[r.lvl + '/' + r.h] || (acc[r.lvl + '/' + r.h] = { n: 0, ttk: 0, ttkN: 0, pct: 0, deaths: 0, unkilled: 0 });
    s.n++; if (r.ttk != null) { s.ttk += r.ttk; s.ttkN++; } else s.unkilled++; s.pct += r.takenPct; s.deaths += r.deaths;
  }
  out.summary = {};
  for (const key in acc) { const s = acc[key]; out.summary[key] = { ttk: s.ttkN ? +(s.ttk / s.ttkN).toFixed(2) : null, hpPerFoe: +(s.pct / s.n).toFixed(1), deaths: s.deaths, unkilled: s.unkilled }; }
  out.done = true; out.ms = Date.now() - out.started;
  return out;
}

// THE BOSS LAB. Each hero into each boss's room. A boss that has an OPENING is played the way its room teaches it:
//   the closed helm   - wait for the blow and answer it on the beat (a guard in the last tenth of a second, or a roll through it)
//   the king          - stand beside one of his cages until it comes down on him, then cut him while he is held or open
//   the gallery queen - strike the pillar holding up the stretch of gallery she stands under, then cut her while she is pinned
//   the roc           - stand on the glass so her dive sticks in it, then cut her while she is down
// Every other boss is cut whenever it is in reach. All of them are defended against on their tells. The hero's health is
// put back each frame and what the boss took is counted: how long it lasts, and the damage per minute it takes to see it out.
const OPEN = b => b.t === 'closedhelm' ? b.open > 0 : b.t === 'king' ? (b.mode === 'held' || b.open > 0) : b.t === 'gqueen' ? (b.mode === 'pinned' || b.mode === 'topple') : b.t === 'roc' ? (b.mode === 'stuck' || b.mode === 'skid' || b.mode === 'downed') : b.t === 'reefmaw' ? b.mode === 'stuck' : true;
/* THE RED MARKS, from tools/tells.mjs (scratchpad hardtells.mjs writes this line): a tell no shield turns is dodged, never guarded */
const HARD_TELLS = new Set(["assassin|markTell","berserker|windTell","captain|kegTell","captain|shootTell","closedhelm|grabTell","closedhelm|stampTell","drownedking|slamTell","forgemaster|anvilTell","forgemaster|breathTell","forgemaster|dragTell","forgemaster|dropTell","forgemaster|hurlTell","forgemaster|pourTell","forgemaster|slamTell","golem|stompTell","gqueen|chandTell","gqueen|chargeTell","gqueen|gDropTell","gqueen|leapTell","gqueen|shadowTell","gqueen|slamTell","gqueen|sweepTell","grandmother|sweepTell","grandmother|throwTell","herald|sweepTell","king|cageTell","king|chargeTell","king|grabTell","king|liftTell","king|shoutTell","king|slamTell","lance|bashTell","lance|whirlTell","owl|hootTell","pitwarden|pickTell","pitwarden|roofTell","quarter|shootTell","quarter|stanceTell","ram|leapTell","ram|stampTell","ram|tossTell","roadman|leapTell","roc|diveTell","tollmaster|tollTell","troop|grabTell","windcaller|wallTell"]);
export async function bossLab(BK, opts = {}) {
  const lvm = await import('./level.js'), T = lvm.T, TS = 16, PT = await import('./playtest.js');
  const heroes = opts.heroes || HEROES;
  const bosses = opts.bosses || ['wood', 'kings', 'spire', 'crown', 'reef', 'flotilla', 'hurricane', 'deep', 'waymeet', 'undercrown'], maxSecs = opts.maxSecs || 120;
  const rows = [], out = { rows, started: Date.now(), progress: 0, total: bosses.length * heroes.length };
  if (typeof window !== 'undefined') window.__bossLab = out;
  for (const lvId of bosses) for (const h of heroes) {
    BK.setHero(h); BK.load(lvm.LEVELS.findIndex(l => l.id === lvId)); BK.state = 'play'; BK.god = false; BK.sim(10);
    const L = BK.L, A = L.arena; out.progress++;
    if (!A) { rows.push({ lvl: lvId, h, skipped: 'no arena' }); continue; }
    const boss = BK.enemies().find(e => e.t === A.boss && e.alive);
    if (!boss) { rows.push({ lvl: lvId, h, skipped: 'no boss' }); continue; }
    for (const e of BK.enemies()) if (e !== boss && !e.maxHp) e.alive = false;
    BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(30);
    /* THE QUARTERMASTER GOES UP HER SHIP: the playtest walker knows ropes, steps and ledges, so it follows her deck to deck */
    const walker = boss.t === 'quarter' ? PT.makeBot(BK) : null;
    const P = BK.P, k = BK.keys, hp0 = boss.hp, maxF = Math.round(maxSecs * 60 / (BK.SET.speed || 1));
    // the glass in the roc's room, once
    const glass = []; if (boss.t === 'roc') { const fy = Math.floor(A.floor / TS); for (let x = Math.floor(A.x0 / TS); x <= Math.floor(A.x1 / TS); x++) for (let y = fy - 3; y <= fy + 2; y++) if (L.grid[y * L.W + x] === T.CRYST) { if (L.grid[(y + 1) * L.W + x] !== T.AIR) glass.push(x * TS + 8); break; } }
    /* only glass with rock under it (the middle strip is over a shaft), nearest the middle of the room first; the bot hops between three of them so it never stands long enough to crack one */
    { const mid = (A.x0 + A.x1) / 2; glass.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid)); }
    let f = 0, taken = 0, swings = 0, opened = 0, wasOpen = false, falls = 0;
    for (; f < maxF && boss.alive; f++) {
      P.hp = P.maxHp; P.dead = 0; P.st = Math.max(P.st, 40);
      /* THE DEEP: too light to stand on the bottom without a stone. A player picks one up on the way in; the bot is handed one, and another if his is taken */
      if (lvId === 'deep' && !P.ballast) { const st = BK.props().filter(p => p.t === 'ballast' && !p.held).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; if (st) { P.ballast = st; st.held = true; st.vy = 0; } }
      const d = boss.x - P.x, ad = Math.abs(d), reach = LAB_REACH[h] + (boss.w || 20) / 2, open = OPEN(boss);
      if (open && !wasOpen) { opened++; if (opts.trace) { out.trace = out.trace || []; out.trace.push({ h, mode: boss.mode, startD: Math.round(ad), dy: Math.round(boss.y - P.y), minD: 9999, pressed: 0, swung: 0, hpAt: boss.hp }); } }
      if (!open && wasOpen && opts.trace && out.trace && out.trace.length) { const tw = out.trace[out.trace.length - 1]; tw.lost = tw.hpAt - boss.hp; }
      if (open && opts.trace && out.trace && out.trace.length) { const tw = out.trace[out.trace.length - 1]; tw.minD = Math.min(tw.minD, Math.round(ad)); if (P.atk >= 0) tw.swung++; }
      wasOpen = open;
      k.left = false; k.right = false; k.block = false; k.up = false; k.down = false; k.jump = false;
      let goal = null, strike = false;
      const tell = boss.mode && /Tell$/.test(boss.mode) && boss.mode !== 'stanceTell' && ad < 90;
      /* THE SHOULDER is no Tell by the time it reaches you: it is the rush itself, and it is answered as it arrives */
      const rushing = boss.mode === 'rush' && ad < 46;
      /* whatever is thrown and about to arrive - rubble, spit, a shot - is taken on the shield */
      const incoming = BK.seeds().find(s => (s.rubble || s.mawSpit || s.timber || s.shot || s.bolt) && !s.dead && !s.reflected && Math.abs(s.x - P.x) < 34 && Math.abs(s.y - (P.y - 8)) < 30 && (s.x - P.x) * (s.vx || 0) < 0);
      // THE ANSWER, on the beat. The paladin's aegis and the death knight's drain guard take a moment to come up, so they hold C from the start of the tell
      if (boss.t === 'reefmaw' && (boss.mode === 'biteTell' || boss.mode === 'bite')) goal = boss.x - Math.sign(d || 1) * 124;   /* THE BAIT: stand in its reach until it commits, then be out of it, so the bite finds coral */
      else if (boss.t === 'reefmaw' && !OPEN(boss) && boss.mode !== 'spitTell' && boss.mode !== 'riseTell') goal = boss.x - Math.sign(d || 1) * 84;   /* inside the 90 it rises for, outside the 104 its bite reaches once it commits */
      else if (boss.mode === 'stanceTell') goal = boss.x - Math.sign(d || 1) * 72;   /* EN GARDE: cut into it and she answers; stand off and wait for the point to drop */
      else if (rushing || (tell && (h === 'paladin' || h === 'reaper' || boss.modeT < (boss.t === 'closedhelm' ? 0.1 : 0.14)))) {
        P.face = Math.sign(d) || P.face;
        if (SHIELDED(h) && !HARD_TELLS.has(boss.t + '|' + boss.mode)) k.block = true; else if (f % 6 === 0) { k[d > 0 ? 'right' : 'left'] = true; BK.press('dodge'); }
      } else if (incoming && SHIELDED(h)) { P.face = Math.sign(incoming.x - P.x) || P.face; k.block = true; }
      else if (open) { goal = boss.x; strike = true; }
      else if (boss.t === 'closedhelm') goal = boss.x - Math.sign(d || 1) * 34;                       // close enough to be swung at
      else if (boss.t === 'roc' && glass.length) goal = glass[Math.floor(f / 75) % Math.min(3, glass.length)];   /* one of the three middle panes, a new one every second or so */
      else if (boss.t === 'king') { const cages = BK.props().filter(c => c.t === 'dropcage' && c.boss && !c.dropped);
        const c = cages.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; goal = c ? c.x + (boss.x > c.x ? -22 : 22) : boss.x;
        // his cages drop from pressure plates up on the scaffold, where the bot cannot climb: when he walks under one, it drops it, as a player on that plate would
        const under = cages.find(q => Math.abs(q.x - boss.x) < 18); if (under) { under.dropped = true; under.landed = 0; if (under.hit) under.hit.clear(); under.resetT = 5; } }
      else if (boss.t === 'gqueen') { const qx = Math.floor(boss.x / TS);
        const s = BK.props().find(p => p.t === 'support' && !p.broken && p.sx0 !== undefined && qx >= p.sx0 && qx <= p.sx1);
        if (s) { goal = s.x; if (Math.abs(s.x - P.x) < 18) { P.face = Math.sign(s.x - P.x) || P.face; if (P.atk < 0) { BK.press('atk'); swings++; } } } else goal = boss.x - Math.sign(d || 1) * 70; }
      else { goal = boss.x; strike = true; }
      // step in close before swinging: from the very edge of reach, a boss standing a little above the floor (the roc in her glass) is missed by a pixel
      if (walker && Math.abs(boss.y - P.y) > 30 && !k.block) walker(boss.x);   /* she is on another deck: go up after her the way a player would */
      else if (goal !== null && !k.block) { const gd = goal - P.x;
        /* THE PIT WARDEN'S HOLES are not a way to him: a step that would land on a course his pick took out is not taken */
        const nx = Math.floor((P.x + Math.sign(gd) * 10) / TS), hole = boss.t === 'pitwarden' && P.ground && L.grid[Math.floor(A.floor / TS) * L.W + nx] === T.AIR;
        if (Math.abs(gd) > (strike ? Math.max(8, LAB_REACH[h] * 0.6) : 6) && !hole) k[gd > 0 ? 'right' : 'left'] = true; }
      if (strike && ad <= reach && P.atk < 0 && !k.block) { P.face = Math.sign(d) || P.face; BK.press('atk'); swings++; }
      if (opts.samples && f % 45 === 0) { out.samples = out.samples || []; out.samples.push([h, Math.round(f / 60), boss.mode, Math.round(d), Math.round(boss.y - P.y), k.block ? 'B' : '-', goal === null ? '·' : Math.round(goal - P.x), P.hurt > 0 ? 'hurt' : '', P.ground ? 'g' : 'air'].join(' ')); }
      if (f % 30 === 0 && boss.y < P.y - 12 && strike && ad < reach + 20) BK.press('jump');   /* a boss standing a tile up (the roc in the glass) is cut from a hop */
      const was = P.hp; BK.sim(1); if (P.hp < was && !P.dead) taken += Math.min(60, was - P.hp);   /* a fall into a pit is a death and a respawn, not a blow: it is counted as falls, not as damage */
      if (P.dead) falls++;
      if (f % 600 === 599) await yieldNow();
    }
    k.left = false; k.right = false; k.block = false;
    const secs = f * (BK.SET.speed || 1) / 60;
    rows.push({ lvl: lvId, boss: boss.t, h, killed: !boss.alive, secs: +secs.toFixed(1), bossHp: hp0, hpLeftPct: boss.alive ? Math.round(100 * boss.hp / hp0) : 0,
      takenPerMin: Math.round(taken / Math.max(1 / 60, secs) * 60), heroHp: P.maxHp, swings, opened, ripostes: boss.ripostes || 0, wallOpens: boss.wallOpens || 0, falls });
    await yieldNow();
  }
  out.done = true; out.ms = Date.now() - out.started;
  return out;
}
