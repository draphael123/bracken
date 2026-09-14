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
const OPEN = b => b.t === 'closedhelm' ? b.open > 0 : b.t === 'king' ? (b.mode === 'held' || b.open > 0) : b.t === 'gqueen' ? (b.mode === 'pinned' || b.mode === 'topple') : b.t === 'roc' ? (b.mode === 'stuck' || b.mode === 'skid' || b.mode === 'downed') : true;
export async function bossLab(BK, opts = {}) {
  const lvm = await import('./level.js'), T = lvm.T, TS = 16;
  const heroes = opts.heroes || HEROES;
  const bosses = opts.bosses || ['wood', 'kings', 'spire', 'crown', 'hurricane', 'waymeet'], maxSecs = opts.maxSecs || 120;
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
    const P = BK.P, k = BK.keys, hp0 = boss.hp, maxF = Math.round(maxSecs * 60 / (BK.SET.speed || 1));
    // the glass in the roc's room, once
    const glass = []; if (boss.t === 'roc') { const fy = Math.floor(A.floor / TS); for (let x = Math.floor(A.x0 / TS); x <= Math.floor(A.x1 / TS); x++) for (let y = fy - 3; y <= fy + 2; y++) if (L.grid[y * L.W + x] === T.CRYST) { glass.push(x * TS + 8); break; } }
    let f = 0, taken = 0, swings = 0, opened = 0, wasOpen = false;
    for (; f < maxF && boss.alive; f++) {
      P.hp = P.maxHp; P.dead = 0; P.st = Math.max(P.st, 40);
      const d = boss.x - P.x, ad = Math.abs(d), reach = LAB_REACH[h] + (boss.w || 20) / 2, open = OPEN(boss);
      if (open && !wasOpen) opened++; wasOpen = open;
      k.left = false; k.right = false; k.block = false;
      let goal = null, strike = false;
      const tell = boss.mode && /Tell$/.test(boss.mode) && ad < 90;
      // THE ANSWER, on the beat. The paladin's aegis and the death knight's drain guard take a moment to come up, so they hold C from the start of the tell
      if (tell && (h === 'paladin' || h === 'reaper' || boss.modeT < (boss.t === 'closedhelm' ? 0.1 : 0.14))) {
        P.face = Math.sign(d) || P.face;
        if (SHIELDED(h)) k.block = true; else if (f % 6 === 0) { k[d > 0 ? 'right' : 'left'] = true; BK.press('dodge'); }
      } else if (open) { goal = boss.x; strike = true; }
      else if (boss.t === 'closedhelm') goal = boss.x - Math.sign(d || 1) * 34;                       // close enough to be swung at
      else if (boss.t === 'roc' && glass.length) goal = glass.reduce((a, x) => Math.abs(x - P.x) < Math.abs(a - P.x) ? x : a, glass[0]);
      else if (boss.t === 'king') { const cages = BK.props().filter(c => c.t === 'dropcage' && c.boss && !c.dropped);
        const c = cages.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; goal = c ? c.x + (boss.x > c.x ? -22 : 22) : boss.x;
        // his cages drop from pressure plates up on the scaffold, where the bot cannot climb: when he walks under one, it drops it, as a player on that plate would
        const under = cages.find(q => Math.abs(q.x - boss.x) < 18); if (under) { under.dropped = true; under.landed = 0; if (under.hit) under.hit.clear(); under.resetT = 5; } }
      else if (boss.t === 'gqueen') { const qx = Math.floor(boss.x / TS);
        const s = BK.props().find(p => p.t === 'support' && !p.broken && p.sx0 !== undefined && qx >= p.sx0 && qx <= p.sx1);
        if (s) { goal = s.x; if (Math.abs(s.x - P.x) < 18) { P.face = Math.sign(s.x - P.x) || P.face; if (P.atk < 0) { BK.press('atk'); swings++; } } } else goal = boss.x - Math.sign(d || 1) * 70; }
      else { goal = boss.x; strike = true; }
      if (goal !== null && !k.block) { const gd = goal - P.x; if (Math.abs(gd) > (strike ? reach - 2 : 6)) k[gd > 0 ? 'right' : 'left'] = true; }
      if (strike && ad <= reach && P.atk < 0 && !k.block) { P.face = Math.sign(d) || P.face; BK.press('atk'); swings++; }
      if (f % 90 === 0 && boss.y < P.y - 30 && strike) BK.press('jump');
      const was = P.hp; BK.sim(1); if (P.hp < was) taken += was - P.hp;
      if (f % 600 === 599) await yieldNow();
    }
    k.left = false; k.right = false; k.block = false;
    const secs = f * (BK.SET.speed || 1) / 60;
    rows.push({ lvl: lvId, boss: boss.t, h, killed: !boss.alive, secs: +secs.toFixed(1), bossHp: hp0, hpLeftPct: boss.alive ? Math.round(100 * boss.hp / hp0) : 0,
      takenPerMin: Math.round(taken / Math.max(1 / 60, secs) * 60), heroHp: P.maxHp, swings, opened });
    await yieldNow();
  }
  out.done = true; out.ms = Date.now() - out.started;
  return out;
}
