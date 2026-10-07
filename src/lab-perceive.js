// src/lab-perceive.js - THE BOSS BOT'S EYES (claude/bot2). The boss lab's hands (src/lab.js) were written against the game's own state:
// a boss's mode and the exact time its windup has left, the frame it changed. A person has neither. This module stands between the two:
// for every frame the hands decide on, it puts on each foe the state a PLAYER WOULD HAVE READ OFF THE SCREEN, and takes it off again
// before the world steps, so the game itself never sees it.
//
//   WHAT IS READ    mode (the pose / the windup and its mark), modeT (how long the windup has left, read with an error), open (the
//                   boss's OPEN look), greedT (his greed ring). Nothing else is touched.
//   WHEN            each change is seen a REACTION TIME after it is drawn: triangular(rtMin, rtMode, rtMax) ms, drawn per change; more
//                   for a windup that wears no mark (a pose alone), more again for one off the screen (heard by its tell sound only;
//                   anything else off the screen is not seen at all, and a foe off the screen is not in BK.enemies() for the hands).
//   MISREAD         a new windup is, by `misread` chance, taken for another windup of his it has seen (or for nothing): it is answered
//                   as that one until his mode changes again.
//   GREED           a hit landed on the boss, by `greed` chance, keeps the hands in for 1-2 more swings: what he starts meanwhile is not
//                   seen until those swings are out (and humanSwingOk's "no swing into a tell" is off for them).
//   STAMINA         for `staminaSlip` of the fight (re-rolled every 3 s) the hands forget to keep a roll's wind back.
//   FIRST ATTEMPT   (profile.first) a windup seen fewer than learnAfter times is misread at firstMisread and timed firstTiming x worse;
//                   the first opening is noticed openDiscover s late.
// Its dice are its OWN stream (seeded from the row's key), so the boss's own rolls are not shifted by the eyes.
import { mulberry } from './px.js';
const FIELDS = ['mode', 'modeT', 'open', 'greedT'];
/* (claude/botreads) WHAT ELSE IS DRAWN, per boss: flags and counters a plan reads that ARE on the screen (a pose, a colour, pips), but that
   a player sees only a reaction late. Each change of one is seen after its own triangular reaction (no misread), on its own dice stream
   ('drawn|' + key), so the eyes' stream above is not shifted and a boss with no row here plays exactly as before.
     bloodknight  committed (the overhead pose and the cleave's line turning red), wardFill (the ward's pips), wardLock (the ward's grey edge) */
export const DRAWN = { bloodknight: ['committed', 'wardFill', 'wardLock'] };
const seedOf = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
const tri = (r, a, c, b) => { const u = r(), f = (c - a) / (b - a); return u < f ? a + Math.sqrt(u * (b - a) * (c - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - c)); };
const gauss = r => { let u = 0, v = 0; while (u === 0) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
export function makePerception(BK, prof, key, boss, opts = {}) {
  const rng = mulberry(seedOf('eyes|' + key)), FPS = 60, spd = () => BK.SET.speed || 1;
  const msF = ms => Math.max(1, Math.round(ms / 1000 * FPS));
  const S = new Map(), seenTells = new Map(), stats = { reads: 0, rtSum: 0, misreads: 0, greeds: 0, unseen: 0, heard: 0 };
  /* (claude/walker) boss === null: THE LEVEL WALKER's eyes (tools/level-walk.mjs). The same reads on every level foe; GREED is a hit landed on
     any tracked foe (its hp went down while a swing was out). With a boss nothing here changes: the same dice in the same order. */
  let f = 0, applied = false, enemies0 = null, greedUntil = -1, greedSwings = 0, atkWas = -1, bossHp = boss ? boss.hp : 0, slip = false, slipAt = 0, openSeen = 0;
  const levelLanded = () => { for (const [e, st] of S) if (typeof st.hp0 === 'number' && e.alive && e.hp < st.hp0) return true; return false; };
  const P = () => BK.P, rngD = mulberry(seedOf('drawn|' + key)), drawnOf = e => (opts.drawn && opts.drawn[e.t]) || DRAWN[e.t] || null;
  const view = () => { const v = BK.view || {}, z = v.z || 1, VW = v.VW || 320, VH = v.VH || 180, cx = (v.x || 0) + VW / 2, cy = (v.y || 0) + VH / 2; return { l: cx - VW / 2 / z - 6, r: cx + VW / 2 / z + 6, t: cy - VH / 2 / z - 10, b: cy + VH / 2 / z + 10 }; };
  const onScreen0 = (e, V) => e.x + (e.w || 16) / 2 > V.l && e.x - (e.w || 16) / 2 < V.r && e.y > V.t && e.y - (e.h || 20) < V.b;
  /* (claude/sweep2) THE KRAKEN IS SEEN BY HIS ARMS AND HIS BEAK: his body (e.x) lies out in the sea past the screen, but every move he makes
     is made on the road. Read by e.x alone he was never on screen, so after his first slam the bot saw no pose of his again (a slam read
     for 90 s, the pinned spear never seen) - the causeway's 0/12 was that, not him */
  const onScreen = (e, V) => onScreen0(e, V) || (e.t === 'kraken' && ((e.headX > V.l && e.headX - 46 < V.r) || (e.arms || []).some(a => a.st !== 'hid' && a.st !== 'gone' && a.tx > V.l && a.tx < V.r)));
  const winding = e => !!(BK.windingUp && BK.windingUp(e));
  const marked = e => { try { return !!(BK.markShown && BK.markShown(e)); } catch { return true; } };
  const tracked = () => BK.enemies().filter(e => e && e.alive && (e === boss || (Math.abs(e.x - P().x) < 360 && Math.abs(e.y - P().y) < 240)));
  /* AFTER THE WORLD STEPS: read the real state, and work out what the player has seen of it by now */
  function update() {
    f++; const V = view(), p = P();
    /* GREED: a hit landed (his health went down while a swing of ours was out) */
    if ((boss ? boss.alive && boss.hp < bossHp : levelLanded()) && p && p.atk >= 0 && f > greedUntil && rng() < prof.greed) {
      const [a, b] = prof.greedSwings || [1, 2]; greedSwings = a + Math.floor(rng() * (b - a + 1)); greedUntil = f + msF(2500); stats.greeds++; }
    bossHp = boss ? boss.hp : 0;
    if (greedSwings > 0 && p) { if (p.atk >= 0 && atkWas < 0) greedSwings--; if (greedSwings <= 0 && p.atk < 0) greedUntil = f; }
    if (f >= greedUntil) greedSwings = 0;
    atkWas = p ? p.atk : -1;
    if (f >= slipAt) { slip = rng() < prof.staminaSlip; slipAt = f + msF(3000); }
    for (const e of tracked()) {
      let st = S.get(e); const vis = onScreen(e, V);
      if (!st) { st = { mode: e.mode, pm: e.mode, pT: e.modeT, pAt: f, seenT: e.modeT, err: 0, pend: null, open: e.open, pOpen: vis ? e.open : 0, openAt: -1, greedT: e.greedT, pGreed: vis ? e.greedT : 0, greedAt: -1 }; S.set(e, st); }
      /* a NEW pose: when will the player see it, and as what */
      if (e.mode !== st.mode) { st.mode = e.mode; const w = winding(e);
        let rt = tri(rng, prof.rtMin, prof.rtMode, prof.rtMax), how = 'seen';
        if (w && !marked(e)) rt += prof.rtUnmarked || 0;
        if (!vis) { if (w && Math.abs(e.x - p.x) < 420) { rt += prof.rtHeard || 0; how = 'heard'; } else how = 'unseen'; }
        let as = e.mode, sure = true;
        if (w) { const key2 = e.t + '|' + e.mode, n = (seenTells.get(e.t) || new Map()); seenTells.set(e.t, n);
          const times = n.get(e.mode) || 0, pMis = prof.first && times < (prof.learnAfter || 2) ? prof.firstMisread : prof.misread;
          if (rng() < pMis) { const others = [...n.keys()].filter(m => m !== e.mode); as = others.length ? others[Math.floor(rng() * others.length)] : st.pm; sure = false; stats.misreads++; }
          n.set(e.mode, times + 1); st.k2 = key2; st.rough = prof.first && times < (prof.learnAfter || 2) ? (prof.firstTiming || 2) : 1; }
        st.pend = { at: f + msF(rt), as, sure, how, real: e.mode, w };
        if (how === 'unseen') st.pend.at = Infinity; else { stats.reads++; stats.rtSum += rt; if (how === 'heard') stats.heard++; } }
      if (st.pend && st.pend.at === Infinity && vis) st.pend.at = f + msF(tri(rng, prof.rtMin, prof.rtMode, prof.rtMax));   /* it came on screen: now it can be seen */
      /* GREED hides what starts now until the swings are out */
      if (st.pend && f >= st.pend.at && !(greedSwings > 0 && f < greedUntil && st.pend.w)) {
        st.pm = st.pend.as; st.pAt = f; st.err = gauss(rng) * (prof.timingSd || 0) * (st.rough || 1); st.pend = null; }
      /* the time left, as read: the real clock (once its pose is the one it is in) plus the reader's error; a stale pose runs on its own clock */
      if (st.pm === e.mode) { st.pT = typeof e.modeT === 'number' ? e.modeT + st.err : e.modeT; st.seenT = st.pT; st.seenF = f; }
      else if (typeof st.seenT === 'number') st.pT = st.seenT - (f - (st.seenF ?? f)) * spd() / FPS;
      /* OPEN and the greed ring: seen on their way in a reaction late (the first opening of a first attempt later still); gone at once */
      const o = e.open > 0; if (!o) { st.pOpen = e.open; st.openAt = -1; }
      else if (st.openAt < 0) { let rt = tri(rng, prof.rtMin, prof.rtMode, prof.rtMax) * (prof.openRt || 1); if (e === boss && prof.first && openSeen === 0) rt += (prof.openDiscover || 0) * 1000; if (e === boss) openSeen++; st.openAt = f + msF(rt); st.pOpen = 0; }
      if (o && st.openAt >= 0 && f >= st.openAt && vis) st.pOpen = e.open;
      const g = e.greedT > 0; if (!g) { st.pGreed = e.greedT; st.greedAt = -1; } else if (st.greedAt < 0) { st.greedAt = f + msF(tri(rng, prof.rtMin, prof.rtMode, prof.rtMax)); st.pGreed = 0; }
      if (g && st.greedAt >= 0 && f >= st.greedAt && vis) st.pGreed = e.greedT;
      st.vis = vis; if (!boss) st.hp0 = e.hp;
      /* (claude/botreads) THE OTHER DRAWN THINGS (DRAWN): each change queued, seen a reaction late and in order, only while he is on the screen */
      const D = drawnOf(e); if (D) { st.d = st.d || {};
        for (const k of D) { const v = e[k]; let q = st.d[k]; if (!q) q = st.d[k] = { seen: v, last: v, Q: [] };
          if (v !== q.last) { q.last = v; q.Q.push({ v, at: f + msF(tri(rngD, prof.rtMin, prof.rtMode, prof.rtMax)) }); }
          while (q.Q.length && f >= q.Q[0].at && vis) q.seen = q.Q.shift().v; } }
    }
    for (const e of S.keys()) if (!e.alive) S.delete(e);
  }
  /* PUT ON what was seen (the hands decide on it) / TAKE IT OFF (before the world steps) */
  function apply() { if (applied) return; applied = true;
    for (const [e, st] of S) { st.real = [e.mode, e.modeT, e.open, e.greedT]; e.mode = st.pm; e.modeT = st.pT; e.open = st.pOpen; e.greedT = st.pGreed;
      if (st.d) { st.realD = {}; for (const k in st.d) { st.realD[k] = e[k]; e[k] = st.d[k].seen; } } }
    enemies0 = BK.enemies; const all = enemies0.call(BK); BK.enemies = () => all.filter(e => e === boss || !S.has(e) || S.get(e).vis !== false);
    BK.labGreedy = greedSwings > 0 && f < greedUntil; BK.labSlip = slip; }
  function restore() { if (!applied) return; applied = false;
    for (const [e, st] of S) { if (st.real) { [e.mode, e.modeT, e.open, e.greedT] = st.real; st.real = null; } if (st.realD) { for (const k in st.realD) e[k] = st.realD[k]; st.realD = null; } }
    if (enemies0) { BK.enemies = enemies0; enemies0 = null; } BK.labGreedy = false; BK.labSlip = false; }
  update();   /* (frame nought: what is on the screen as the fight begins is seen at once) */
  for (const st of S.values()) { st.pm = st.mode; st.pend = null; }
  return { update, apply, restore, stats: () => ({ ...stats, rtMean: stats.reads ? Math.round(stats.rtSum / stats.reads) : null }), get greedy() { return greedSwings > 0 && f < greedUntil; } };
}
/* THE SKILLS A PLAYER CASTS (claude/bot2 #3, opts.skills): whatever is in his slots (BK.skillAt), cast at the boss when it is ready, in its
   range, the hero free and not about to be hit by a windup he can see (or the boss OPEN), with a roll's wind kept back, at most one cast a
   second. A generic hand, the same for every boss: a player's skill use is not boss-specific either. */
export function makeSkillHands(BK, boss, h, RANGE, rollCost, v2 = false) {
  const KEYS = ['throw', 'skill2', 'skill3'], P = () => BK.P; let last = -9, casts = {};
  return { casts: () => casts, step() {
    const p = P(); if (!p || p.dead || (h === 'reaper' && !v2) || p.atk >= 0 || (p.dodge > 0) || !boss.alive) return;
    const now = BK.time; if (now - last < 1 * (BK.SET.speed || 1)) return;
    const open = boss.open > 0, wind = !!(BK.windingUp && BK.windingUp(boss)) && !open, dx = boss.x - p.x, edge = Math.abs(dx) - (boss.w || 20) / 2;
    if (h === 'reaper' && (p.harvest >= 100 || p.fHeld > 0 || p.warding || p.hurt > 0 || p.castT > 0)) return;   /* (claude/dkhero) his F key is also the surge: never press it while the blood is full; never over a ward */
    if (wind && h === 'reaper' && Math.abs(boss.y - p.y) <= 48 && edge <= (RANGE.boneArmor || 160) && !(p.boneArmor > 0)) {   /* BONE ARMOR: a tell seen in reach, a shell for the next three blows */
      for (let i = 0; i < 3; i++) { const T = globalThis.BKT, id = T && T.skillAt ? T.skillAt(i) : null; if (id !== 'boneArmor' || (p.cds && p.cds[id] > 0) || p.st < 26 + rollCost) continue;
        BK.press(KEYS[i]); last = now; casts[id] = (casts[id] || 0) + 1; return; } }
    if (wind || Math.abs(boss.y - p.y) > 48) return;
    for (let i = 0; i < 3; i++) { const T = globalThis.BKT, id = T && T.skillAt ? T.skillAt(i) : null;   /* (the slots are BKT's: main.js's skillAt) */ if (!id || !(id in RANGE) || (id === 'boneArmor')) continue;
      if (p.cds && p.cds[id] > 0) continue; if (edge > RANGE[id] || p.st < 30 + rollCost) continue;
      p.face = Math.sign(dx) || p.face; BK.press(KEYS[i]); last = now; casts[id] = (casts[id] || 0) + 1; return; } } };
}
