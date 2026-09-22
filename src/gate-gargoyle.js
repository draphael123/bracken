// gate-gargoyle.js — THE GATE GARGOYLE, the Witchlight Stair's boss (2026-09-22). Brief: .claude/briefs/witchlight-redesign.md
// (its GARGOYLE section, unchanged from witchlight-stair.md). A huge stone gargoyle bolted over the tower's outer gate, woken by the
// loose magic. He is fought on the stair's top: FLOATING SLABS that drift over the garden terrace, some solid, some CRACKED.
// His art: src/redraw/queue_bosses.js (bakeGateGargoyle): 0 perched | 1,2 fly | 3 dive tell | 4 dive | 5 gust tell | 6 gust |
// 7 spit tell | 8 spit | 9 shriek | 10 hanging.
//   THE STONE DIVE   ✕  he rises out of sight and his shadow finds the slab you stand on; he comes down on it. He follows you from
//                        slab to slab while he is up there - the aim is his until he drops. No shield turns it: be elsewhere.
//   THE WING GUST    !  wings drawn back, then a blast that shoves you along your slab toward its edge; a shield braces you.
//   THE RUBBLE SPIT  !  head back, throat lit; three chunks of masonry in a spread. Guard them or go between them.
//   THE GLYPH FLARE  ✕  (no damage) a glyph lights under the slab you stand on: still on it when it goes, and you fall UP onto its
//                        underside for three seconds - and he likes to dive on that slab while you hang there.
//   THE PERCH SHRIEK    back to the gate; two or three imps pour out of the tower's windows (three at most).
// THE OPENING IS YOURS (tools/boss-openings.mjs proves it): stand on a CRACKED slab and leave it LATE - after he has dropped - and
// he smashes through it and hangs by his claws from the next slab's broken edge for three seconds: every blow counts twice. The
// same dive on a solid slab opens nothing: he lands, shakes himself and goes up again.
// HE WILL NOT COME DOWN TO THE GARDEN: fall to the terrace and he keeps above the slabs and throws rubble; the rune columns lift you
// back up. PHASE TWO (half his health): the slabs drift faster, dives come in pairs, every flare comes with a gust, and a cracked
// slab he breaks stays broken - each opening used is gone. Touching him never hurts (the touch rule).
export const GARG = {
  hp: 410, cd: 1.35, cdP2: 0.95,
  tell: { dive: 0.95, gust: 0.75, spit: 0.7, flare: 0.9 }, tellP2: 0.82,
  dmg: { dive: 18, gust: 6, spit: 7 },
  diveV: 430, land: 1.1, hang: 3.0, hangMul: 2, recover: 0.9, rise: 0.55,
  gustV: 215, gustT: 0.6, gustReach: 170, spitV: 190, spitG: 320, spread: 0.3,
  flareT: 3.0, imps: 3, shriekEvery: 13, regrow: 8, slabP2: 1.6,
  hoverUp: 56, hoverDX: 46, high: 64,
};
const TELL = { dive: 'diveTell', gust: 'gustTell', spit: 'spitTell', flare: 'flareTell' };
const SAY = { diveTell: 'THE STONE DIVE', gustTell: 'THE WING GUST', spitTell: 'RUBBLE', flareTell: 'THE GLYPH FLARE: GET OFF THAT SLAB' };
export const gargOpen = e => e.mode === 'hang';
/* the frames of bakeGateGargoyle */
export function gargFrame(e) {
  const fly = 1 + Math.floor((e.anim || 0) * 8) % 2;
  switch (e.mode) {
    case 'sleep': case 'wake': case 'land': return 0; case 'diveTell': return 3; case 'dive': return 4;
    case 'gustTell': return 5; case 'gust': return 6; case 'spitTell': return 7; case 'spit': return 8;
    case 'flareTell': case 'shriek': return 9; case 'hang': return 10;
  }
  return fly;
}
/* HIS HEALTH: a blow while he hangs from a broken edge counts twice; nothing reaches him asleep on the gate */
export function gargTake(e, dmg) { if (!(dmg > 0) || e.mode === 'sleep') return 0; return gargOpen(e) ? Math.round(dmg * GARG.hangMul) : dmg; }

const live = slabs => slabs.filter(m => !m.broken);
const onSlab = (P, slabs) => P.onMover && slabs.includes(P.onMover) && !P.onMover.broken ? P.onMover : null;
function begin(e, what, c) { e.mode = TELL[what]; e.modeT = GARG.tell[what] * (e.phase === 2 ? GARG.tellP2 : 1); e.last2 = e.last; e.last = what; e.side = e.side || 1;
  c.say(SAY[e.mode], what === 'dive' || what === 'flare'); c.sound(what === 'dive' ? 'screech' : what === 'flare' ? 'zap' : 'rattle'); }
/* HIS CHOICE is weighted and random, and never the same thing three times running (the Hedge Warden's first pilot had no dice in it,
   and its four passes were one fight four times) */
function choose(e, c, slab, terrace) {
  const r = c.rnd, w = terrace ? { spit: 3, shriek: e.shriekCd <= 0 && c.adds() < GARG.imps ? 1.2 : 0 }
    : { dive: 3, gust: 2, spit: 2, flare: slab && e.flareCd <= 0 ? 1.4 : 0, shriek: e.shriekCd <= 0 && c.adds() < GARG.imps ? 0.8 : 0 };
  if (e.last && e.last === e.last2 && w[e.last]) w[e.last] = 0;
  else if (e.last && w[e.last]) w[e.last] *= 0.45;
  const tot = Object.values(w).reduce((s, v) => s + v, 0); let k = r() * tot;
  for (const [what, v] of Object.entries(w)) { k -= v; if (k <= 0 && v > 0) return what; }
  return terrace ? 'spit' : 'dive';
}
const toward = (e, tx, ty, dt, k = 2.4) => { e.vx = (tx - e.x) * Math.min(1, dt * k) / Math.max(dt, 1e-6); e.vy = (ty - e.y) * Math.min(1, dt * k) / Math.max(dt, 1e-6);
  e.x += (tx - e.x) * Math.min(1, dt * k); e.y += (ty - e.y) * Math.min(1, dt * k); };

export function updateGargoyle(e, dt, c) {
  const { P, A } = c, slabs = c.slabs, rnd = c.rnd || Math.random;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.flareCd = (e.flareCd ?? 4) - dt; e.shriekCd = (e.shriekCd ?? 8) - dt;
  e.open = gargOpen(e) ? Math.max(0, e.modeT) : 0; e.rubble ||= [];
  const slab = onSlab(P, slabs), top = A.top, terrace = !slab && !P.flip && P.y > top + 3 * 16;
  if (e.phase === 1 && e.hp <= e.maxHp / 2) { e.phase = 2; c.phase2(); c.say('THE SLABS QUICKEN', true); c.shake(6); }
  /* the rubble in the air */
  for (const b of e.rubble) { b.vy += GARG.spitG * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (!P.dead && !b.done && Math.abs(P.x - b.x) < 9 && P.y - P.h - 2 < b.y && P.y + 2 > b.y) { b.done = true; c.hit(b.x, GARG.dmg.spit, false, 'THE RUBBLE SPIT'); }
    if (b.y > A.floor || b.life <= 0) b.done = true; }
  e.rubble = e.rubble.filter(b => !b.done);
  const side = () => (e.x < P.x ? -1 : 1);
  switch (e.mode) {
    case 'wake': toward(e, e.px0 - 40, e.py0 - 20, dt, 1.5); if (e.modeT <= 0) { e.mode = 'hover'; e.cd = 0.8; } return;
    case 'hover': {
      if (e.hoverT === undefined || (e.hoverT -= dt) <= 0) { e.hoverT = 1.2 + rnd() * 1.4; e.side = rnd() < 0.5 ? -1 : 1; e.hx = GARG.hoverDX * (0.7 + rnd() * 0.6); }
      const tx = Math.max(A.x0 + 24, Math.min(A.x1 - 24, P.x + e.side * e.hx)), ty = terrace ? top - GARG.high : Math.min(P.y, top + 32) - GARG.hoverUp;
      toward(e, tx, ty, dt); e.face = Math.sign(P.x - e.x) || e.face;
      if (e.cd <= 0) { const what = e.queue && e.queue.length ? e.queue.shift() : choose(e, { ...c, rnd }, slab, terrace);
        if (what === 'shriek') { e.mode = 'perchFly'; e.modeT = 2.5; c.say('HE GOES BACK TO THE GATE', false); }
        else if (what === 'flare' && !slab) { e.cd = 0.3; }
        else { begin(e, what, c); if (what === 'flare') { e.fm = slab; e.flareCd = 7; } if (what === 'dive') { e.tgt = slab; e.off = slab ? P.x - slab.x : 0; } } }
      return; }
    /* THE STONE DIVE: up and out of sight; his shadow follows you from slab to slab until he drops */
    case 'diveTell': { const s = onSlab(P, slabs), fl = P.flip && P.flareSlab && !P.flareSlab.broken ? P.flareSlab : null;   /* in the air between slabs he keeps the last one he saw you on */
      if (fl || s) { e.tgt = fl || s; e.off = P.x - e.tgt.x; } else if (!e.tgt || e.tgt.broken) { e.tgt = live(slabs).sort((a, b) => Math.abs(a.x + a.w / 2 - P.x) - Math.abs(b.x + b.w / 2 - P.x))[0] || null; e.off = e.tgt ? e.tgt.w / 2 : 0; } e.tx = P.x;
      toward(e, e.tgt ? e.tgt.x + e.off : P.x, top - 150, dt, 3.2);
      if (e.modeT <= 0) { e.mode = 'dive'; e.modeT = 2; e.hitP = false; c.sound('whoosh'); } return; }
    case 'dive': { const m = e.tgt, gy = m ? m.y : A.floor; e.x = m ? m.x + Math.max(8, Math.min(m.w - 8, e.off)) : e.tx; e.y += GARG.diveV * dt; e.vx = 0; e.vy = GARG.diveV;
      if (e.y < gy) return;
      e.y = gy; c.shake(8); c.sound('slam'); c.dust(e.x, gy);
      const under = P.flip && P.flareSlab === m;
      if (!P.dead && Math.abs(P.x - e.x) < 24 && (Math.abs(P.y - gy) < 26 || under)) c.hit(e.x, GARG.dmg.dive, true, 'THE STONE DIVE');
      if (m && m.cracked && !m.broken) {   /* THE OPENING: a cracked slab gives under him, and he hangs by his claws from the next one's broken edge */
        c.breakSlab(m); const cxm = m.x + m.w / 2, nb = live(slabs).filter(q => q !== m).sort((a, b) => Math.min(Math.abs(a.x - cxm), Math.abs(a.x + a.w - cxm)) - Math.min(Math.abs(b.x - cxm), Math.abs(b.x + b.w - cxm)))[0];
        if (nb) { e.nb = nb; e.hs = nb.x + nb.w / 2 < cxm ? 1 : -1; e.mode = 'hang'; e.modeT = GARG.hang; e.open = GARG.hang; e.face = -e.hs; c.say('HE HANGS BY HIS CLAWS', false, true); c.sound('crack'); return; } }
      e.mode = 'land'; e.modeT = e.phase === 2 && !e.paired ? 0.5 : GARG.land; e.onM = m; e.off = m ? e.x - m.x : 0; return; }
    case 'land': { const m = e.onM; if (m) { e.x = m.x + e.off; e.y = m.y; } e.face = Math.sign(P.x - e.x) || e.face;
      if (e.modeT <= 0) { if (e.phase === 2 && !e.paired) { e.paired = true; begin(e, 'dive', c); e.modeT *= 0.7; e.tgt = onSlab(P, slabs); e.off = e.tgt ? P.x - e.tgt.x : 0; return; }
        e.paired = false; e.mode = 'rise'; e.modeT = GARG.rise; } return; }
    case 'hang': { const m = e.nb; if (m && !m.broken) { e.x = (e.hs > 0 ? m.x + m.w : m.x) + e.hs * 12; e.y = m.y + 22; } else e.modeT = Math.min(e.modeT, 0);
      if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = GARG.rise; e.cd = 0.9; } return; }
    case 'rise': toward(e, e.x, top - GARG.hoverUp - 10, dt, 3); if (e.modeT <= 0) { e.mode = 'hover'; e.cd = Math.max(e.cd, 0.6); } return;
    /* THE WING GUST: level with you, a few strides off; the blast shoves you along your slab */
    case 'gustTell': { e.gs = e.gs || side(); toward(e, P.x + e.gs * 72, P.y - 12, dt, 3); e.face = -e.gs;
      if (e.modeT <= 0) { e.mode = 'gust'; e.modeT = GARG.gustT; c.sound('gust');
        const inCone = Math.abs(P.x - e.x) < GARG.gustReach && Math.abs(P.y - e.y) < 64;
        const r = inCone ? c.hit(e.x, GARG.dmg.gust, false, 'THE WING GUST') : null; e.braced = r !== 'hit'; if (r === 'blocked') c.say('BRACED', false, true); }   /* a shield braces you; a roll goes through it */ return; }
    case 'gust': { if (!e.braced && !P.dead && Math.abs(P.x - e.x) < GARG.gustReach + 40 && Math.abs(P.y - e.y) < 80) c.push(-e.gs * GARG.gustV);
      c.wind(e.x, e.y - 14, -e.gs);
      if (e.modeT <= 0) { e.gs = 0; e.mode = 'recover'; e.modeT = GARG.recover; e.cd = e.phase === 2 ? GARG.cdP2 : GARG.cd; } return; }
    /* THE RUBBLE SPIT: three chunks in a spread */
    case 'spitTell': { const sd = e.sd = e.sd || side(); toward(e, P.x + sd * 84, (terrace ? top - 30 : P.y - 40), dt, 3); e.face = -sd;
      if (e.modeT <= 0) { e.mode = 'spit'; e.modeT = 0.35; c.sound('spit'); const mx = e.x + e.face * 14, my = e.y - 18, a0 = Math.atan2(P.y - 10 - my, P.x - mx);
        for (const k of [-1, 0, 1]) { const a = a0 + k * GARG.spread; e.rubble.push({ x: mx, y: my, vx: Math.cos(a) * GARG.spitV, vy: Math.sin(a) * GARG.spitV - 60, life: 2.6 }); } } return; }
    case 'spit': if (e.modeT <= 0) { e.sd = 0; e.mode = 'recover'; e.modeT = GARG.recover; e.cd = e.phase === 2 ? GARG.cdP2 : GARG.cd; } return;
    /* after a gust or a spit he sinks a little and gets his breath: in reach of a hero who goes to him */
    case 'recover': toward(e, e.x, Math.min(P.y, top + 32) - 16, dt, 1.2); e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) e.mode = 'hover'; return;
    /* THE GLYPH FLARE: a glyph lit under your slab; still on it when it goes and you fall up onto its underside */
    case 'flareTell': toward(e, P.x - side() * 60, P.y - 70, dt, 2);
      if (e.modeT <= 0) { const m = e.fm; e.fm = null; e.mode = 'hover'; e.cd = 0.35;
        if (m && !m.broken && onSlab(P, slabs) === m) { c.flare(m, GARG.flareT); e.queue = e.phase === 2 ? ['gust', 'dive'] : rnd() < 0.65 ? ['dive'] : []; }
        else c.say('THE GLYPH FIZZLES', false, true); } return;
    /* THE PERCH SHRIEK */
    case 'perchFly': toward(e, e.px0, e.py0, dt, 2.2); if (Math.hypot(e.x - e.px0, e.y - e.py0) < 10 || e.modeT <= 0) { e.mode = 'shriek'; e.modeT = 1.1; e.shrieked = false; c.sound('screech'); c.shake(4); } return;
    case 'shriek': e.face = -1; if (!e.shrieked && e.modeT < 0.7) { e.shrieked = true; const n = Math.min(GARG.imps - c.adds(), 2 + (rnd() < 0.5 ? 1 : 0)); for (let i = 0; i < n; i++) c.imp(A.x1 - 8, top - 40 - i * 26); e.shriekCd = GARG.shriekEvery; }
      if (e.modeT <= 0) { e.mode = 'hover'; e.cd = 0.8; } return;
  }
  e.mode = 'hover';
}

/* HIS MARKS ON THE WORLD: the dive's shadow (and its red cross) on the slab he is coming down on, the glyph lit under a slab, the
   rubble, the gust's wind, and the claws' dust while he hangs */
export function drawGargoyleWorld(g, e, cx, cy, time) {
  if (!e || !e.alive) return;
  if (e.mode === 'diveTell' || e.mode === 'dive') { const m = e.tgt, x = Math.round((m ? m.x + Math.max(8, Math.min(m.w - 8, e.off)) : e.tx) - cx), y = Math.round((m ? m.y : e.floorY) - cy);
    const k = e.mode === 'dive' ? 1 : 0.5 + 0.5 * Math.sin(time * 14); g.globalAlpha = 0.35 + 0.3 * k; g.fillStyle = '#120e18'; g.beginPath(); g.ellipse(x, y + 1, 18 + 6 * k, 4, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 0.9; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 6, y - 22); g.lineTo(x + 6, y - 10); g.moveTo(x + 6, y - 22); g.lineTo(x - 6, y - 10); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
  if (e.mode === 'flareTell' && e.fm) { const m = e.fm, x = Math.round(m.x + m.w / 2 - cx), y = Math.round(m.y + 14 - cy), k = 1 - Math.max(0, e.modeT) / GARG.tell.flare;
    g.globalAlpha = 0.3 + 0.5 * k; g.strokeStyle = '#c8a0ff'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 10 + 12 * k, 4 + 2 * k, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = '#ff6b6b'; g.beginPath(); g.moveTo(x - 5, y - 5); g.lineTo(x + 5, y + 5); g.moveTo(x + 5, y - 5); g.lineTo(x - 5, y + 5); g.stroke(); g.lineWidth = 1;
    g.fillStyle = '#e0c8ff'; for (let q = 0; q < 5; q++) g.fillRect(x - 12 + ((q * 7 + Math.floor(time * 20)) % 24), y - 2 - ((q * 5 + Math.floor(time * 30)) % 12), 1, 2); g.globalAlpha = 1; }
  for (const b of e.rubble || []) { const x = Math.round(b.x - cx), y = Math.round(b.y - cy); g.fillStyle = '#1b1626'; g.fillRect(x - 4, y - 4, 8, 8); g.fillStyle = '#6a6280'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#8e86a4'; g.fillRect(x - 3, y - 3, 3, 2); }
  if (e.mode === 'gust' && !e.braced) { g.globalAlpha = 0.5; g.fillStyle = '#eefaff'; for (let q = 0; q < 8; q++) { const d = ((time * 400 + q * 37) % 160); g.fillRect(Math.round(e.x - cx - e.gs * d), Math.round(e.y - cy - 30 + (q * 11) % 44), 8, 1); } g.globalAlpha = 1; }
  if (e.mode === 'hang') { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - 14 - cy), 22 + k * 3, 20, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
}
