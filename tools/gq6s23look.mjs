/* tools/gq6s23look.mjs - GQ6S23LOOK (11-13): the browser look at the Highcrown burn + climb + final platform (flags ?gq6s2=1 & ?gq6s3=1). A measuring / looking tool, not a check.
     node tools/gq6s23look.mjs climb [--heroes=knight,warden,...] [--out=dir]     each hero climbs deck -> hoardings -> loft -> roof by REAL KEYS (BK.keys left / right / up), stills, time, fire cost, camera, text fit, sounds
     node tools/gq6s23look.mjs frames [--off] [--secs=20]                          frame time (BK.step = update + render): hall, roof deck, tell, burn, each tier; --off = flags off (master's fight)
     node tools/gq6s23look.mjs coop                                                a downed seat returns on her tier; the hold waits for the living
     node tools/gq6s23look.mjs attacks                                             stills of her told moves on every tier (hero invulnerable)
   Flags are set through tools/cdp.mjs (BRACKEN_GQ6S2 / BRACKEN_GQ6S3), none shipped. One headless Chrome at a time. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
const a = process.argv.slice(2), mode = a.find(x => !x.startsWith('--') && !x.endsWith('.mjs')) || 'climb', opt = (k, d) => { const x = a.find(y => y.startsWith('--' + k + '=')); return x ? x.slice(k.length + 3) : d; };
const OUT = resolve(opt('out', 'C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/gq6s23look')); mkdirSync(OUT, { recursive: true });
const HEROES = opt('heroes', 'knight,warden,pyro,paladin,pirate,reaper,geomancer,berserker,ranger').split(',');
if (a.includes('--off')) { delete process.env.BRACKEN_GQ6S2; delete process.env.BRACKEN_GQ6S3; } else { process.env.BRACKEN_GQ6S2 = '1'; process.env.BRACKEN_GQ6S3 = '1'; }
const png = (name, url) => writeFileSync(join(OUT, name), Buffer.from(url.split(',')[1], 'base64'));

/* ---------- in-page helpers (stringified into the page) ---------- */
const PAGE_SETUP = `
window.__L = (() => {
  const L = {};
  L.snaps = []; L.camAgg = {}; L.sfx = []; L.texts = new Map(); L.camBad = []; L.log = [];
  L.hold = () => { BK.P.hp = BK.P.maxHp; };
  L.keyOff = () => { const k = BK.keys; k.left = k.right = k.up = k.down = k.jump = k.atk = false; };
  L.snap = (label, scale = 1) => { const cv = document.createElement('canvas'); cv.width = BK.buf.width * scale; cv.height = BK.buf.height * scale; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(BK.buf, 0, 0, cv.width, cv.height);
    L.snaps.push({ label, url: cv.toDataURL('image/png') }); };
  return L;
})();`;

async function startHero(pg, hero, opts = {}) {
  return pg.evalp(`(async()=>{ ${''}
    const L = window.__L; const { LEVELS } = await import('/src/level.js'); const A0 = await import('/src/audio.js');
    for (const k of ['crumble','crack','portalOpen','callerBlast','blockPing','bell','bellRing']) { const f = A0.SFX[k]; if (typeof f === 'function' && !f.__w) { const w = function(...x){ L.sfx.push({ k, f: BK.time }); return f.apply(this, x); }; w.__w = 1; A0.SFX[k] = w; } }
    BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.state = 'play'; BK.god = false; BK.step(5);
    const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1);
    ${opts.hallMs ? `window.__hall = []; for (let k = 0; k < ${opts.hallMs}; k++) { BK.god = true; L.hold(); const t = performance.now(); BK.step(1); window.__hall.push(performance.now() - t); } BK.god = false;` : `for (let k = 0; k < 300; k++) { L.hold(); BK.step(1); }`}
    const q = BK.boss; q.hp = 2; (BK.hurt || (BK.env && BK.env().hurt))(q, 50, BK.P.x); for (let k = 0; k < 140; k++) { L.hold(); BK.step(1); }
    const H = BK.gqHands(); const ok = H.skipRoof(); for (let k = 0; k < 600; k++) { L.hold(); BK.step(1); if (BK.boss.stage === 'roof' && (BK.boss.mode === 'roofStand' || BK.boss.mode === 'rec') && k > 200) break; }
    const g = H.gq6s2 && H.gq6s2(); return { ok, stage: BK.boss.stage, mode: BK.boss.mode, g: !!g, S3: !!(g && g.tier && g.tier(1)), phase: g && g.state() && g.state().phase, P: [BK.P.x, BK.P.y], hp: BK.P.hp, qhp: BK.boss.hp }; })()`, 300000);
}

/* ONE CLIMB STEP, by real keys, in the page: set her bar, wait until she tells, then walk + hold UP by keys until the hero stands on the new tier and the hold has ended. Returns the numbers. */
const STEP_FN = `async (stepIdx, thr, o) => {
  const L = window.__L, q = BK.boss, H = BK.gqHands(), g = H.gq6s2(), P = BK.P, TS = 16, st0 = g.state(), res = { step: stepIdx, thr };
  const camChk = (tag) => { const [cx, cy] = [BK.view.x, BK.view.y], vx = P.x - cx, vy = P.y - cy, qx = q.x - cx, qy = q.y - cy, ph = g.state().phase; const key = "s" + stepIdx + " " + tag + " tier" + g.state().tier; const A = L.camAgg[key] || (L.camAgg[key] = { n: 0, heroOut: 0, queenOut: 0, vyMax: -1e9, vyMin: 1e9, vxMax: -1e9, vxMin: 1e9, qOutFirst: null }); A.n++;
    A.vyMax = Math.max(A.vyMax, Math.round(vy)); A.vyMin = Math.min(A.vyMin, Math.round(vy)); A.vxMax = Math.max(A.vxMax, Math.round(vx)); A.vxMin = Math.min(A.vxMin, Math.round(vx));
    if (vx < 4 || vx > BK.view.VW - 4 || vy < 8 || vy > BK.view.VH - 4) A.heroOut++; if (ph !== "off" && ph !== "tell" && (qx < 6 || qx > BK.view.VW - 6 || qy < 22 || qy > BK.view.VH - 2)) { A.queenOut++; A.qOutFirst = A.qOutFirst || [Math.round(qx), Math.round(qy)]; } };
  const texts = () => { const r = window.__textRec || []; const [cx, cy] = BK.cam;
    for (const t of r) { if (t.kind !== 'text' || !t.s || !t.s.trim() || !(t.alpha > 0.05)) continue; const e = L.texts.get(t.s) || { s: t.s, n: 0, world: !!t.world, off: 0, first: +(BK.time).toFixed(2), box: null, stepIdx }; e.n++;
      const x0 = t.world ? t.x0 - cx : t.x0, y0 = t.world ? t.y0 - cy : t.y0; if (x0 < -1 || x0 + t.w > BK.view.VW + 1 || y0 < -1 || y0 + t.h > BK.view.VH + 1) { e.off++; e.offBox = [Math.round(x0), Math.round(y0), t.w, t.h]; } e.box = e.box || [Math.round(x0), Math.round(y0), t.w, t.h]; L.texts.set(t.s, e); } window.__textRec = []; };
  /* wait until she is free and her bar is below the threshold (the hero is invulnerable while he waits) */
  q.hp = Math.min(q.hp, q.maxHp * (thr - 0.004)); let w = 0; BK.god = true; window.__textRec = [];
  while (st0.phase !== 'tell' && w < 60 * 40) { L.hold(); BK.step(1); w++; texts(); }
  BK.god = false; res.waited = +(w / 60).toFixed(1); if (st0.phase !== 'tell') { res.fail = 'no tell in 40 s: phase ' + st0.phase + ' mode ' + q.mode + ' hp ' + q.hp / q.maxHp; return res; }
  const tier0 = st0.tier, t0 = BK.time, hp0 = P.hp, fell = []; let lost = 0, onAt = null, doneAt = null, frames = 0, grabAt = null, topAt = null, last = { x: P.x, y: P.y, t: 0 }, stuck = 0, snappedTell = false, snappedMid = false, snappedCatch = false, climbMax = 0, lifts0 = st0.lifts, track = [];
  res.start = [Math.round(P.x), Math.round(P.y)]; res.tierFrom = tier0;
  while (frames < 60 * 70) {
    const r = g.botGoal(P); const k = BK.keys; k.left = k.right = k.up = k.down = false;
    if (r) { const dx = r.goal - P.x; k.left = dx < -3; k.right = dx > 3; k.up = !!r.up; }
    L.hold(); 
    BK.step(1); frames++; const t = (BK.time - t0);
    const dmg = BK.P.maxHp - P.hp; if (dmg > 0 && dmg < 30) { lost += dmg; }
    P.hp = P.maxHp; texts(); camChk(st0.phase);
    if (P.climb && !grabAt) grabAt = t; if (P.climb) climbMax = Math.max(climbMax, P.y);
    if (frames % 10 === 0) track.push([+t.toFixed(2), Math.round(P.x), Math.round(P.y), P.climb ? 1 : 0, st0.phase[0]]);
    if (!snappedTell && t > 0.4) { snappedTell = true; L.snap('s' + stepIdx + ' tell 0.4s'); }
    if (!snappedMid && P.climb && t > 1) { snappedMid = true; L.snap('s' + stepIdx + ' on the ladder'); }
    if (!snappedCatch && st0.phase === 'hold') { snappedCatch = true; L.snap('s' + stepIdx + ' span caught, she is up'); }
    if (onAt === null && g.anyOn() && st0.tier === tier0 + 1) { onAt = t; topAt = t; }
    if (st0.phase === 'on' && st0.tier === tier0 + 1) { doneAt = t; break; }
    if (Math.hypot(P.x - last.x, P.y - last.y) > 3) { last = { x: P.x, y: P.y, t }; } else if (t - last.t > 8 && st0.phase !== 'tell') { res.stuckAt = { x: Math.round(P.x), y: Math.round(P.y), t: +t.toFixed(1), phase: st0.phase }; if (++stuck > 0) break; }
  }
  L.keyOff(); res.tierTo = st0.tier; res.phase = st0.phase; res.onTierAt = onAt === null ? null : +onAt.toFixed(2); res.holdEndAt = doneAt === null ? null : +doneAt.toFixed(2); res.grabAt = grabAt === null ? null : +grabAt.toFixed(2);
  res.fireHpLost = lost; res.lifts = st0.lifts - lifts0; res.end = [Math.round(P.x), Math.round(P.y)]; res.track = track.length > 40 ? track.filter((_, i) => i % 3 === 0) : track;
  for (let k = 0; k < 90; k++) { L.hold(); BK.god = true; BK.step(1); texts(); camChk('settle'); } BK.god = false; L.snap('s' + stepIdx + ' on tier ' + st0.tier + ' +1.5s'); res.queen = [Math.round(q.x), Math.round(q.y), q.mode]; return res; }`;

async function climbHero(hero) {
  const pg = await openPage({ audio: false, fonts: true, seed: 7 });
  try {
    await pg.evalp(PAGE_SETUP);
    const s = await startHero(pg, hero); const out = { hero, setup: s, steps: [] };
    if (!s.g) throw new Error('no gq6s2 handle ' + JSON.stringify(s));
    /* the worst start for step 1: just east of the cupola (the longest walk to a deck ladder) */
    await pg.evalp(`(()=>{ const L = window.__L, P = BK.P, H = BK.gqHands(), g = H.gq6s2(); const Tw = (BK.L.arena && BK.L.arena.tower) || (BK.L.arenaRoof && BK.L.arenaRoof.tower); const cu = Tw.CUPOLA; P.x = (cu.x1 + 1) * 16 + 6; P.y = Tw.DECK.floor * 16; P.vx = 0; P.vy = 0; P.ground = true; for (let i = 0; i < 20; i++) { L.hold(); BK.god = true; BK.step(1); } BK.god = false; L.snap('deck before the burn (hero east of the cupola)'); return [P.x, P.y]; })()`);
    for (const [i, thr] of [[0, 0.85], [1, 0.70], [2, 0.50]]) {
      const r = await pg.evalp(`(${STEP_FN})(${i}, ${thr})`, 600000); out.steps.push(r); if (r.fail || r.stuckAt) { if (r.fail) break; }
    }
    out.camBad = await pg.evalp('window.__L.camAgg'); out.sfx = await pg.evalp('window.__L.sfx'); out.texts = await pg.evalp('[...window.__L.texts.values()]');
    const snaps = await pg.evalp('window.__L.snaps'); out.snaps = snaps.map(x => x.label); out.errors = pg.errors.slice(0, 5);
    snaps.forEach((s2, i) => png(hero + '-' + String(i).padStart(2, '0') + '.png', s2.url));
    return { out, snaps };
  } finally { pg.close(); }
}

if (mode === "climb" && process.argv[1].endsWith("gq6s23look.mjs")) {
  const all = {}; const sheetIn = [];
  for (const h of HEROES) {
    console.log('== ' + h);
    try { const { out, snaps } = await climbHero(h); all[h] = out; sheetIn.push({ hero: h, snaps });
      for (const s of out.steps) console.log('  step ' + s.step + ' ' + JSON.stringify({ tier: s.tierFrom + '>' + s.tierTo, phase: s.phase, onTierAt: s.onTierAt, holdEndAt: s.holdEndAt, grabAt: s.grabAt, fireHpLost: s.fireHpLost, lifts: s.lifts, stuck: s.stuckAt, fail: s.fail, waited: s.waited, start: s.start, end: s.end, queen: s.queen }));
      console.log('  cam ' + JSON.stringify(out.camBad) + ' sfx ' + [...new Set(out.sfx.map(x => x.k))].join(',') + ' errors ' + JSON.stringify(out.errors));
    } catch (e) { console.log('  ERROR ' + e.message.slice(0, 300)); all[h] = { error: e.message }; }
  }
  writeFileSync(join(OUT, 'climb.json'), JSON.stringify(all, null, 1));
  /* the contact sheet: one row a hero, the six stills that tell the climb (tell, ladder, caught, +1.5 s on each tier ...) */
  const pgS = await openPage({ audio: false, fonts: true });
  try {
    const rows = sheetIn.map(r => ({ hero: r.hero, snaps: r.snaps.filter(x => /s0 tell|s0 on the ladder|s1 span caught|s2 on the ladder|s2 span caught|on tier 3|on tier 1/.test(x.label)) }));
    const url = await pgS.evalp(`(async()=>{ const rows = ${JSON.stringify(rows)}; const cols = Math.max(...rows.map(r => r.snaps.length), 1), W = 420, H = 208, cv = document.createElement('canvas'); cv.width = cols * W; cv.height = rows.length * H; const c = cv.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0, 0, cv.width, cv.height);
      for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].snaps.length; x++) { const im = new Image(); await new Promise(res => { im.onload = res; im.src = rows[y].snaps[x].url; }); c.drawImage(im, x * W, y * H, W, H); c.font = '10px monospace'; c.fillStyle = 'rgba(0,0,0,0.7)'; c.fillRect(x * W, y * H, 200, 12); c.fillStyle = '#ffe9a0'; c.fillText(rows[y].hero + ' ' + rows[y].snaps[x].label, x * W + 2, y * H + 10); }
      return cv.toDataURL('image/png'); })()`, 300000);
    png('sheet.png', url);
  } finally { pgS.close(); }
  console.log('done: ' + OUT);
}


const stats = xs => { const v = [...xs].sort((p, q) => p - q), n = v.length; return n ? { n, mean: +(v.reduce((p, q) => p + q, 0) / n).toFixed(2), p50: +v[Math.floor(n * 0.5)].toFixed(1), p95: +v[Math.floor(n * 0.95)].toFixed(1), p99: +v[Math.min(n - 1, Math.floor(n * 0.99))].toFixed(1), max: +v[n - 1].toFixed(1) } : null; };

/* FRAME TIME: BK.step(1) = one update + one render, timed. flags on: hall, roof deck, then every burn step (tell / caught / on) with the hero climbing by keys; flags off: hall + the roof deck fight. */
const FRAME_FN = `async (on, secs) => { const L = window.__L, q = BK.boss, H = BK.gqHands(), g = H.gq6s2 && H.gq6s2(), P = BK.P, W = {}, add = (k, d) => { (W[k] = W[k] || []).push(d); };
  W.hall = window.__hall.slice(60);
  const ce = Document.prototype.createElement, cnt = { c: 0 }; Document.prototype.createElement = function (t, ...x) { if (String(t).toLowerCase() === "canvas") { cnt.c++; if (cnt.c <= 40) { const m = (new Error().stack || "").split(String.fromCharCode(10)).slice(2, 6).map(l => { const a = l.lastIndexOf("/src/"); return a < 0 ? "" : l.slice(a + 5).replace(")", ""); }).filter(Boolean).join("<"); (cnt.st = cnt.st || {})[m] = (cnt.st[m] || 0) + 1; } } return ce.call(this, t, ...x); };
  const GI = CanvasRenderingContext2D.prototype.getImageData; CanvasRenderingContext2D.prototype.getImageData = function (...x) { cnt.g = (cnt.g || 0) + 1; return GI.apply(this, x); };
  const tick = (label) => { cnt.c = 0; cnt.g = 0; cnt.st = {}; L.hold(); BK.god = true; const t = performance.now(); BK.step(1); const dd = performance.now() - t; add(label, dd); if (dd > 40) (W.__spikes = W.__spikes || []).push([label, +dd.toFixed(0), +BK.time.toFixed(2), q.mode, g && g.state() ? g.state().phase : "", "canv" + cnt.c + JSON.stringify(cnt.st), "gi" + cnt.g]); };
  for (let i = 0; i < 60 * secs; i++) tick(on ? "roofDeck" : "roofDeck");
  if (on) { const st = g.state(); const Tw = (BK.L.arena && BK.L.arena.tower) || (BK.L.arenaRoof && BK.L.arenaRoof.tower), cu = Tw.CUPOLA; P.x = (cu.x1 + 1) * 16 + 6; P.y = Tw.DECK.floor * 16; P.vx = 0; P.vy = 0;
    for (const [i, thr] of [[0, 0.85], [1, 0.70], [2, 0.50]]) { q.hp = Math.min(q.hp, q.maxHp * (thr - 0.004)); let w = 0; while (st.phase !== "tell" && w++ < 60 * 40) tick("wait");
      let n = 0, extra = 0; while (n++ < 60 * 40) { const r = g.botGoal(P), k = BK.keys; k.left = k.right = k.up = k.down = false; if (r) { const dx = r.goal - P.x; k.left = dx < -3; k.right = dx > 3; k.up = !!r.up; }
        const lab = "s" + i + "_" + st.phase + "_tier" + st.tier; tick(lab); if (st.phase === "on" && st.tier === i + 1) break; }
      L.keyOff(); for (let k = 0; k < 60 * secs; k++) tick("s" + i + "_fight_tier" + st.tier); } }
  BK.god = false; const out = { spikes: W.__spikes || [] }; delete W.__spikes; for (const k in W) { const v = W[k].slice().sort((a, b) => a - b), n = v.length; out[k] = { n, mean: +(v.reduce((a, b) => a + b, 0) / n).toFixed(2), p50: +v[Math.floor(n * .5)].toFixed(1), p95: +v[Math.floor(n * .95)].toFixed(1), p99: +v[Math.min(n - 1, Math.floor(n * .99))].toFixed(1), max: +v[n - 1].toFixed(1) }; } return out; }`;
if (mode === "frames") {
  const pg = await openPage({ audio: false, fonts: true, seed: 7 });
  try { await pg.evalp(PAGE_SETUP); const s0 = await startHero(pg, "knight", { hallMs: 960 }); console.log(JSON.stringify(s0));
    const r = await pg.evalp("(" + FRAME_FN + ")(" + !a.includes("--off") + "," + +opt("secs", 12) + ")", 900000);
    const tag = a.includes("--off") ? "off" : "on"; writeFileSync(join(OUT, "frames-" + tag + ".json"), JSON.stringify(r, null, 1));
    for (const [k, v] of Object.entries(r)) console.log(k.padEnd(24), JSON.stringify(v)); console.log("errors", JSON.stringify(pg.errors.slice(0, 3)));
  } finally { pg.close(); }
}

/* CO-OP: seat 2 (warden) stays on the deck while seat 1 climbs step 1; seat 2 is put down -> the hold must not wait for her; she bleeds back ON her tier (arena.respawn). */
const COOP_FN = `async () => { const L = window.__L, q = BK.boss, H = BK.gqHands(), g = H.gq6s2(), st = g.state(), out = { log: [] };
  const seats = BK.players(); out.seats = seats.length; const P1 = seats[0], P2 = seats[1]; out.p2 = P2 && P2.hero;
  const hold = () => { for (const p of BK.players()) { p.hp = p.maxHp; } };
  const Tw = (BK.L.arena && BK.L.arena.tower) || (BK.L.arenaRoof && BK.L.arenaRoof.tower), cu = Tw.CUPOLA;
  for (const p of BK.players()) { p.x = (cu.x1 + 1) * 16 + 6 + (p === P2 ? 24 : 0); p.y = Tw.DECK.floor * 16; p.vx = 0; p.vy = 0; }
  q.hp = Math.min(q.hp, q.maxHp * 0.846); let w = 0; BK.god = true; while (st.phase !== "tell" && w++ < 2400) { hold(); BK.step(1); } BK.god = false;
  out.tellAt = st.phase; let f = 0, downAt = null, backAt = null, holdEnd = null, p2pos = null, pre = null;
  while (f++ < 60 * 90) { hold(); const r = g.botGoal(P1), k = BK.keys; k.left = k.right = k.up = k.down = false; if (r) { const dx = r.goal - P1.x; k.left = dx < -3; k.right = dx > 3; k.up = !!r.up; }
    BK.step(1); const t = f / 60; if (t > 0.1 && P1.hp < P1.maxHp) P1.hp = P1.maxHp;
    if (t > 2 && downAt === null && P2) { pre = [Math.round(P2.x), Math.round(P2.y)]; out.coopDown = BK.coopDown(1); downAt = t; L.snap("coop: seat 2 down on the deck"); }
    if (holdEnd === null && st.phase === "on" && st.tier === 1) { holdEnd = t; out.log.push("hold ended at " + t.toFixed(1) + "s with seat2 down=" + P2.down + " dead=" + P2.dead); L.snap("coop: she is up, seat 2 still down"); }
    if (downAt !== null && backAt === null && P2 && !P2.down && !P2.dead && t > downAt + 0.5) { backAt = t; p2pos = [Math.round(P2.x), Math.round(P2.y)]; for (let k = 0; k < 20; k++) { hold(); BK.step(1); } L.snap("coop: seat 2 returned on her tier"); out.p2after = [Math.round(P2.x), Math.round(P2.y)]; break; } }
  out.pre = pre; out.downAt = downAt; out.holdEnd = holdEnd; out.backAt = backAt; out.p2pos = p2pos; out.tier1 = (() => { const t1 = g.tier(1); return { floor: t1.floor, x0: t1.x0, x1: t1.x1 }; })(); out.lifts = st.lifts; out.phase = st.phase; return out; }`;
if (mode === "coop") {
  const pg = await openPage({ audio: false, fonts: true, seed: 7 });
  try { await pg.evalp(PAGE_SETUP); const s0 = await startHero(pg, "knight"); console.log(JSON.stringify(s0));
    console.log(JSON.stringify(await pg.evalp("(()=>BK.coopStart(\"warden\", false))()")));
    for (let k = 0; k < 3; k++) await pg.evalp("(()=>{ for (let i = 0; i < 60; i++) { for (const p of BK.players()) p.hp = p.maxHp; BK.step(1); } })()");
    const r = await pg.evalp("(" + COOP_FN + ")()", 600000); console.log(JSON.stringify(r, null, 1));
    const snaps = await pg.evalp("window.__L.snaps"); snaps.forEach((s2, i) => png("coop-" + i + ".png", s2.url)); console.log("errors", JSON.stringify(pg.errors.slice(0, 3)));
  } finally { pg.close(); }
}

/* ATTACKS: after each tier is reached, 26 s of her fight (hero invulnerable, standing where he arrived): a still at the first frame of every new told mode, and the modes seen. */
const ATT_FN = `async (tierLabel) => { const L = window.__L, q = BK.boss, seen = {}, modes = [], P = BK.P; BK.god = true; let nsn = 0; L.keyOff();
  for (let f = 0; f < 60 * 26; f++) { L.hold(); BK.step(1); const m = q.mode; if (!seen[m]) { seen[m] = f; modes.push(m + "@" + (f / 60).toFixed(1)); if (/Tell$|tell|Wind|wind|mtn|crown|volley|boulder|rock|sweep|lash/i.test(m) && nsn < 9) { for (let k = 0; k < 12; k++) { L.hold(); BK.step(1); f++; } L.snap(tierLabel + " " + m); nsn++; } } }
  BK.god = false; return modes; }`;
if (mode === "attacks") {
  const pg = await openPage({ audio: false, fonts: true, seed: 11 });
  try { await pg.evalp(PAGE_SETUP); const s0 = await startHero(pg, opt("hero", "knight")); const out = {};
    out.t0 = await pg.evalp("(" + ATT_FN + ")(\"deck\")", 300000);
    for (const [i, thr] of [[0, 0.85], [1, 0.70], [2, 0.50]]) { const r = await pg.evalp("(" + STEP_FN + ")(" + i + "," + thr + ")", 600000); out["s" + i] = { onTierAt: r.onTierAt, fire: r.fireHpLost }; out["t" + (i + 1)] = await pg.evalp("(" + ATT_FN + ")(\"tier" + (i + 1) + "\")", 300000); }
    console.log(JSON.stringify(out, null, 1)); const snaps = await pg.evalp("window.__L.snaps"); snaps.forEach((s2, i) => png("att-" + String(i).padStart(2, "0") + "-" + s2.label.replace(/[^a-z0-9]+/gi, "_") + ".png", s2.url)); console.log("errors", JSON.stringify(pg.errors.slice(0, 3)));
  } finally { pg.close(); }
}

export { startHero, PAGE_SETUP, STEP_FN, png, OUT };
