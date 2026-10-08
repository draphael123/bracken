// tools/mark-integrity.mjs - EVERY MARK BELONGS TO A REAL MOVE (claude/mothermarks, 2026-10-07).
// Daniel, on the Mother Cap: "the mother root has red and yellow hitboxes at points, but there's actually no animation or nothing that
// comes out." Her marks were in the table and her blows were real, but no windup moved her body and her zone blows were drawn as a box.
// tools/tells.mjs reads the code and checks the MARK agrees with the blow; this one PLAYS every boss and mini and checks the mark is a
// promise kept on the screen. For every marked windup it sees (BK.markShown: a '!' or '!!' over the head), in a live fight:
//   1. A POSE: the windup is drawn. The frame is rendered twice at the same instant - once as it is, once with the creature put back in
//      the mode it was in before the windup - with the mark itself hidden in both (its MARK row blanked for the render) and the dice
//      pinned, so the only thing that can differ is how the creature, and anything its draw keys off its mode, looks. A windup whose
//      two frames are the same picture is a mark over a creature that does not move: a PHANTOM POSE.
//   2. A LANDING: within the windup and 1.5 s after it, something comes of it - the hero is hurt or thrown, or something is put in the
//      world (a seed, a vine, a wave, a rock, a fire, a mover, a creature, a burst of earth or spores, an impact ring), or the creature
//      itself goes somewhere (a charge, a leap).
//      A marked windup that never lands anything over every time it was seen is a PHANTOM MARK.
// A finding fails the run unless it is listed in KNOWN below with the reason (a list that only ever shrinks).
//   node tools/mark-integrity.mjs                 every boss and mini (PORT=<port> for the page)
//   MI_ONLY=mother,queen node tools/mark-integrity.mjs      only those
//   MI_SECS=40   seconds of fight per boss (default 40)
import { openPage } from './cdp.mjs';

/* KNOWN: 'type|mode' -> why it is allowed to stand for now. Every row is a bug to fix, not a pass (claude/mothermarks report lists them). */
const KNOWN = {};

const ONLY = (process.env.MI_ONLY || '').split(',').filter(Boolean), SECS = +(process.env.MI_SECS || 40);
const pg = await openPage({ audio: false, fonts: false, seed: 20261007 });
const FIGHT = String.raw`async (row, secs) => {
  BK.manualSimulation = true; const M = await import('/src/marks.js');
  const go = row.kind === 'mini' ? row.level + ':mini' : row.t; if (!BK.bossJump.go(go)) return { err: 'go failed' };
  const live = () => row.kind === 'mini' ? BK.miniActive : BK.bossActive;
  const find = () => BK.enemies().find(q => q.t === row.t && q.alive && (row.kind === 'boss' || q.mini || q.t === 'greathound'));
  let f = 0; for (; f < 900 && !live(); f++) { BK.P.inv = 99; BK.sim(1); }
  const e0 = find(); if (!e0) return { err: 'no boss on the board' }; if (!live()) return { err: 'never woke' };
  const p = BK.P, buf = BK.view.buf, cx = buf.getContext('2d');
  const ARR = ['seeds', 'vines', 'movers', 'waves', 'fires', 'rocks', 'bombs', 'spearRain', 'realmWaves', 'roots', 'wardJav', 'risen', 'embers', 'glass'];
  const world = () => { let n = 0; for (const a of ARR) { try { const v = BK[a] && BK[a](); if (v && v.length) n += v.length; } catch {} }
    return n + BK.enemies().filter(q => q.alive).length; };
  const seeded = () => { let s = 987654321; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
  const shot = () => { const R = Math.random; Math.random = seeded(); const np = BK.parts ? BK.parts().length : -1; try { BK.step(0); } finally { Math.random = R; if (np >= 0) BK.parts().length = Math.min(BK.parts().length, np); }
    return cx.getImageData(0, 0, buf.width, buf.height).data; };
  /* the windup, drawn: this instant as it is, and as it was before the windup, the mark hidden in both */
  const poseDiff = (e, prevMode) => { const k = M.tellKey(e), had = k in M.MARK, was = M.MARK[k]; M.MARK[k] = '';
    const snap = Object.assign({}, e), keys = new Set(Object.keys(e));
    try { const a = shot(); e.mode = prevMode; const b = shot(); let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 30) n++; return n; }
    finally { for (const q of Object.keys(e)) if (!keys.has(q)) delete e[q]; Object.assign(e, snap); if (had) M.MARK[k] = was; else delete M.MARK[k]; BK.step(0); } };
  const rows = {}, open = []; let prevMode = null, curKey = null, cur = null, lastP = [p.x, p.y], tpd = false;
  const A = row.kind === 'mini' ? BK.L.mini : BK.L.arena;
  for (let fr = 0; fr < secs * 60; fr++) {
    const e = find(); if (!e) break;
    if (fr % 150 === 0) { const side = fr % 300 ? 1 : -1, fl = A && A.floor ? A.floor : e.y; BK.tp((e.x + side * 44) / 16 - 0.5, fl / 16 - 1); tpd = true; }
    p.maxHp = 5000; p.hp = 5000; p.inv = 0; p.dead = false;
    const w0 = world(), hp0 = p.hp, np0 = BK.parts().length, nr0 = BK.rings().length; BK.sim(1);
    const hurt = p.hp < hp0, thrown = !tpd && Math.hypot(p.x - lastP[0], p.y - lastP[1]) > 6, grew = world() > w0 || BK.parts().length - np0 >= 8 || BK.rings().length > nr0;   /* a burst of earth or spores, an impact ring: something came out where you can see it */ tpd = false; lastP = [p.x, p.y];
    for (const o of open) { if (hurt || thrown || grew) o.land = true; if (Math.hypot(e.x - o.ex, e.y - o.ey) > 14) o.land = true; o.left--; }
    const mark = BK.markShown(e), key = mark ? M.tellKey(e) : null;
    if (key !== curKey) {
      if (cur) { cur.left = 90; }
      cur = null; curKey = key;
      if (key) { cur = { key, mark, land: false, left: 1e9, ex: e.x, ey: e.y, frames: 0, pose: null, prev: prevMode }; open.push(cur); }
    }
    if (cur) { cur.frames++; cur.ex = e.x; cur.ey = e.y; if (cur.frames === 6 && cur.prev != null) cur.pose = poseDiff(e, cur.prev); }
    if (!key) prevMode = e.mode;
    for (let i = open.length - 1; i >= 0; i--) if (open[i].left <= 0) { const o = open.splice(i, 1)[0]; const r = rows[o.key] = rows[o.key] || { mark: o.mark, n: 0, landed: 0, posed: 0, poseN: 0, minPose: 1e9, maxPose: 0 };
      r.n++; if (o.land) r.landed++; if (o.pose != null) { r.poseN++; if (o.pose >= 20) r.posed++; r.minPose = Math.min(r.minPose, o.pose); r.maxPose = Math.max(r.maxPose, o.pose); } }
  }
  return { rows };
}`;
const fails = [], report = [];
try {
  await pg.evalp('(async()=>{for(let i=0;i<80;i++){if(window.BK&&BK.bossJump)return 1;await new Promise(r=>setTimeout(r,250));}return 0;})()');
  const table = await pg.evalp('BK.bossJump.table()');
  for (const row of table) {
    if (ONLY.length && !ONLY.includes(row.t)) continue;
    let r; try { r = await pg.evalp('(' + FIGHT + ')(' + JSON.stringify(row) + ',' + SECS + ')', 900000); } catch (err) { r = { err: String(err.message || err).slice(0, 160) }; }
    if (r.err) { report.push(row.t.padEnd(14) + ' SKIPPED: ' + r.err); continue; }
    const keys = Object.keys(r.rows);
    for (const k of keys) { const x = r.rows[k]; const bad = [];
      if (x.landed === 0) bad.push('PHANTOM MARK: ' + x.mark + ' shown ' + x.n + 'x and nothing ever landed');
      if (x.poseN > 0 && x.posed === 0) bad.push('PHANTOM POSE: the windup is drawn the same as ' + 'the mode before it (' + x.maxPose + ' px differ at most)');
      const line = (row.kind + ' ' + row.t).padEnd(20) + k.padEnd(30) + (x.mark || '').padEnd(3) + ' seen ' + x.n + ', landed ' + x.landed + ', posed ' + x.posed + '/' + x.poseN + (x.poseN ? ' (px ' + x.minPose + '-' + x.maxPose + ')' : '');
      report.push(line + (bad.length ? '   <- ' + bad.join('; ') + (KNOWN[k] ? '   [KNOWN: ' + KNOWN[k] + ']' : '') : ''));
      if (bad.length && !KNOWN[k]) fails.push(k + ': ' + bad.join('; ')); }
    if (!keys.length) report.push((row.kind + ' ' + row.t).padEnd(20) + '(no marked windup seen in ' + SECS + ' s)');
  }
  for (const l of report) console.log(l);
  if (pg.errors.length) fails.push('page errors: ' + pg.errors.slice(0, 3).join(' | '));
  for (const k of Object.keys(KNOWN)) if (!report.some(l => l.includes(k) && l.includes('<-'))) console.log('KNOWN row no longer fails (take it out): ' + k);
  console.log(fails.length ? '\n' + fails.length + ' PHANTOM(S):\n  ' + fails.join('\n  ') : '\nevery mark seen belongs to a windup that is drawn and lands.');
} finally { pg.close(); }
process.exit(fails.length ? 1 : 0);
