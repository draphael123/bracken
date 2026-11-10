// src/headmistress-hands.js - THE HEADMISTRESS's HANDS (claude/academy, the OPUS GREYBOX). src/headmistress.js is the fight (pure); this binds it to the world:
// the Examination's three lecterns (which one is lit: academy-hands asks arenaLit), the cantrips a striking hero has (src/academy-hands.js: floated / blinked
// through a rail / on a conjured step - the CORRECT test), her WARD RAIL (a temp rail through the academy hands, so a reset puts the cells back), the floor that
// is dismissed in stages and recalled, the dispel, her told blows on the heroes (keyed once a blow), a hero's blow on a SHIELD BOOK - and the greybox drawing.
// GREYBOX (the sonnet art lane draws the final, src/redraw/headmistress_art.js to come): every move its own windup pose and release pose (POSE, B16), its sound.
// main.js calls (one tagged line each): spawnBoss, owns, on, update, take, strike, drawBoss, drawOver, barName, end, clear, arenaLit, pitSafe.
import * as HMM from './headmistress.js';
import { HM_SAY } from './ac-lines.js';
const { HM } = HMM;

export const SOUND = { chalkTell: s => (s.tell)(), chalk: s => (s.thud)(), rulerTell: s => (s.tell)(), ruler: s => (s.whoosh || s.tell)(), boltTell: s => (s.charge || s.tell)(),
  bolt: s => (s.whoosh || s.tell)(), aboutTell: s => (s.clank || s.tell)(), about: s => (s.whoosh || s.tell)(), dispelTell: s => (s.charge || s.tell)(), dispel: s => (s.puff || s.crack || s.thud)(),
  crumbleTell: s => (s.rumble || s.thud)(), crumble: s => (s.crack || s.thud)(), callTell: s => (s.bell || s.clank || s.tell)(), glide: s => (s.whoosh || s.tell)(),
  correct: s => { (s.crack || s.thud)(); (s.ui || s.tell)(); }, work: s => (s.clank || s.thud)(), recover: s => (s.whoosh || s.tell)(), bell: s => (s.bell || s.clank || s.tell)(),
  pop: s => (s.puff || s.thud)(), wake: s => (s.bell || s.clank || s.tell)() };
/* THE POSE A MODE WEARS (greybox, local px, facing right, feet at 0,0): chalk hand [x, y], ruler hand [x, y], ruler angle (rad, 0 = forward), lean, mouth, what shows.
   Windup and release differ for every move */
export const POSE = {
  sleep: { chalk: [6, -12], ruler: [-6, -12], ang: 1.5, lean: 0, mouth: 'shut', book: true },
  wake: { chalk: [10, -30], ruler: [-8, -26], ang: -1.2, lean: -2, mouth: 'open' },
  lecture: { chalk: [10, -20], ruler: [-6, -14], ang: 1.2, lean: 2, mouth: 'open' },
  chalkTell: { chalk: [4, -40], ruler: [-6, -14], ang: 1.2, lean: -4, mouth: 'shut', chalkUp: true },
  chalk: { chalk: [16, -8], ruler: [-6, -14], ang: 1.2, lean: 8, mouth: 'open' },
  rulerTell: { chalk: [6, -16], ruler: [-14, -30], ang: -2.2, lean: -8, mouth: 'shut' },
  ruler: { chalk: [6, -16], ruler: [18, -18], ang: 0, lean: 12, mouth: 'open' },
  boltTell: { chalk: [-4, -24], ruler: [-8, -12], ang: 1.4, lean: -6, mouth: 'shut', glow: true },
  bolt: { chalk: [22, -18], ruler: [-8, -12], ang: 1.4, lean: 10, mouth: 'open' },
  aboutTell: { chalk: [8, -18], ruler: [-6, -14], ang: 1.2, lean: 0, mouth: 'shut', headBack: true },
  about: { chalk: [-8, -18], ruler: [6, -14], ang: 1.2, lean: 0, mouth: 'open' },
  dispelTell: { chalk: [0, -36], ruler: [-6, -14], ang: 1.2, lean: -3, mouth: 'shut', palm: true },
  dispel: { chalk: [20, -26], ruler: [-6, -14], ang: 1.2, lean: 6, mouth: 'wide', palm: true },
  crumbleTell: { chalk: [10, -24], ruler: [-10, -34], ang: -1.6, lean: -2, mouth: 'shut', stamp: true },
  callTell: { chalk: [12, -38], ruler: [-12, -38], ang: -1.6, lean: -4, mouth: 'wide' },
  glide: { chalk: [14, -16], ruler: [-12, -16], ang: 1.0, lean: 10, mouth: 'shut' },
  stagger: { chalk: [-14, -6], ruler: [12, -4], ang: 2.6, lean: -18, mouth: 'wide', dim: true },
  recover: { chalk: [8, -22], ruler: [-8, -22], ang: 0.4, lean: 4, mouth: 'shut' },
  bell: { chalk: [10, -30], ruler: [-6, -30], ang: -1.4, lean: 0, mouth: 'open', stamp: true },
};
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };

export function makeHeadmistressHands(ctx) {
  let S = null; const H = {}; let litNow = null, dissolved = [], recall = [];
  const TS = ctx.TS, A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'headmistress' ? ctx.L.arena : null);
  const ACH = () => ctx.ac && ctx.ac();
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'headmistress';
  H.clear = () => { S = null; litNow = null; dissolved = []; recall = []; };   /* (the academy hands' reset puts every changed cell back) */
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'headmistress' ? e : null; };
  const keyed = (pp, key) => { pp.hmKeys = pp.hmKeys || new Set(); if (pp.hmKeys.size > 200) pp.hmKeys.clear(); if (pp.hmKeys.has(key)) return true; pp.hmKeys.add(key); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null; S = HMM.newFight(HMM.geom(ctx.L, TS)); litNow = null; dissolved = []; recall = [];
    const hp = (ctx.EHP && ctx.EHP.headmistress) || HM.hp;
    const e = { ...base, t: 'headmistress', w: HM.w, h: HM.h, hp, maxHp: hp, noGrav: true, markH: HM.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true };
    for (const pp of ctx.players()) pp.hmKeys = null; return e; };
  /* WHICH OF THE THREE IS LIT (academy-hands' lectern test asks) */
  const lecIds = () => { const Ar = A(); return Ar ? Ar.lecterns : []; };
  const lecOf = spell => { const ids = lecIds(); return (ctx.L.ac.lecterns || []).find(l => ids.includes(l.id) && l.spell === spell) || null; };
  H.arenaLit = id => !!litNow && !!S && !S.won && lecIds().includes(id) && (lecOf(litNow) || {}).id === id;
  const heroes = () => ctx.players().map((pp, i) => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: !pp.dead && (ctx.upright ? ctx.upright(pp) : true), pp, id: i }));
  const sayKey = { correct: [HM_SAY.correct + ' ' + HM_SAY.open, '#ffd36b'], p1: [HM_SAY.p1, '#9fd8ff'], p2: [HM_SAY.p2, '#d8a0ff'], p3: [HM_SAY.p3, '#ffd36b'], fin: [HM_SAY.fin, '#ff9a5c'],
    'call:levitate': [HM_SAY.callLevitate, '#9fd8ff'], 'call:blink': [HM_SAY.callBlink, '#d8a0ff'], 'call:conjure': [HM_SAY.callConjure, '#ffd36b'], dispel: [HM_SAY.dispel, '#ff6b6b'], crumble: [HM_SAY.crumble, '#ff9a5c'], shield: [HM_SAY.shield, '#efe6d2'] };
  /* THE FLOOR: dismissed (AIR down to the bottom) in stages; recalled cell by cell when no hero stands in the cell */
  const F = () => Math.round(A().floor / TS), Hh = () => ctx.L.H;
  const dismiss = (x0, x1) => { const a = ACH(); if (!a) return; for (let x = x0; x <= x1; x++) for (let y = F(); y < Hh(); y++) { if (!dissolved.some(([c, r]) => c === x && r === y)) { dissolved.push([x, y]); a.setCell(x, y, ctx.T.AIR); } } };
  const inHero = (x, y) => ctx.players().some(pp => !pp.dead && Math.abs(pp.x - (x * TS + 8)) < 13 && pp.y > y * TS && pp.y - 14 < (y + 1) * TS);
  const stepRecall = () => { const a = ACH(); if (!a || !recall.length) return; recall = recall.filter(([x, y]) => { if (inHero(x, y)) return true; a.restoreCell(x, y); return false; }); };
  function world(e) {
    const a = ACH();
    return {
      sound: k => { const f = SOUND[k]; if (f && ctx.sfx) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake && ctx.shake(n),
      mark: (m, who) => ctx.number(who.x, who.y - HM.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      say: (k, x, y) => { const s = sayKey[k]; if (s) ctx.number(x, y - HM.markH - 8, s[0], s[1]); },
      fx: (k, x, y) => { if (k === 'open' && ctx.ring) ctx.ring(x, y - HM.h / 2, 22, '#ffd36b'); },
      hitHero: (h, d, name, key, o = {}) => { const pp = h.pp; if (!pp || keyed(pp, key)) return; ctx.asPlayer(pp, () => { const hp0 = pp.hp; ctx.damage(e.x, d, { who: e, name: HM_SAY.name, unblockable: !o.blockable });
        if (pp.hp < hp0) S.hurt[name] = (S.hurt[name] || 0) + (hp0 - pp.hp); }); },
      light: spell => { litNow = spell; },
      rail: x => { if (!a) return; if (x === null || x === undefined) { a.dropRail('hm'); return; } const col = Math.floor(x / TS), A0 = A(); a.tempRail('hm', col, Math.round(A0.ceil / TS), F() - 1); },
      crumbleTell: stg => { S.tellStage = stg; S.tellT = HM.crumble.tell; },
      crumble: stg => { const [x0, x1] = S.G.pit[Math.min(stg, S.G.pit.length) - 1]; dismiss(x0, x1); S.tellStage = 0; },
      restoreFloor: () => { recall = recall.concat(dissolved); dissolved = []; stepRecall(); },
      dispel: () => { if (a) a.dispelAll(); },
      endPhase: ph => { if (ph === 2 && a) a.dropRail('hm'); if (ph === 3) { recall = recall.concat(dissolved); dissolved = []; stepRecall(); } },
      arrive: (call, e2) => { if (call === 'blink') world(e2).rail(e2.x + e2.face * HM.about.railDx); if (call === 'conjure') dismiss(S.G.pit[0][0], S.G.pit[0][1]); },
    };
  }
  /* THE ANSWER A STRIKING HERO GIVES (src/academy-hands.js): his spell, floated this airtime / on a gallery, blinked through a rail, on a conjured step, at her back */
  H.used = (pp, e) => { const a = ACH(); if (!a || !pp) return null; const s = a.state(pp); if (!s) return null; const G = S.G;
    const onGallery = !!pp.ground && Math.abs(pp.y - (G.rafterY + TS)) < 6 && G.galleries.some(([x0, x1]) => pp.x >= x0 && pp.x <= x1);
    return { spell: s.spell, floated: (!pp.ground && s.floated) || onGallery, railBlink: a.blinkedRail(pp, HM.blinkWindow), onStep: a.onStep(pp), back: Math.sign(pp.x - e.x) === -(e.face || 1) }; };
  H.update = (e, dt) => { if (!S || !e.alive || !A()) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; ctx.number(e.x, e.y - HM.markH - 16, HM_SAY.wake, '#d8c8ff'); world(e).sound('wake'); ctx.hint && ctx.hint(HM_SAY.rule); }
    if (S.tellT > 0) S.tellT -= dt;
    stepRecall();
    HMM.step(e, S, dt, heroes(), world(e)); e.phase = S.ph; e.open = HMM.hmOpen(e) ? Math.max(0, e.modeT) : 0; };
  /* A HERO'S BLOW on a shield book */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; S.books.forEach((b, i) => { if (!b.dead && hb.l < b.x + 8 && hb.r > b.x - 8 && hb.t < b.y + 8 && hb.b > b.y - 8) HMM.popBook(S, i, world(live() || {})); }); };
  H.take = (e, dmg) => { if (!S) return dmg; const pp = ctx.hero && ctx.hero(); const [d, word] = HMM.takeBlow(e, S, dmg, H.used(pp, e), world(e));
    if (word === 'WORK') { e.chipHit = ctx.time ? ctx.time() : 0; e.guardFx = 0.2; e.guardWord = HM_SAY.work; if (!S.told.work) { S.told.work = 1; ctx.hint && ctx.hint(HM_SAY.work + '. ' + HM_SAY.rule + '.'); } world(e).sound('work'); }
    if (word === 'HOLDS') ctx.number(e.x, e.y - HM.markH, HM_SAY.holds, '#d8c8ff');
    return d; };
  H.pitSafe = pp => { if (!S || !A()) return null; const G = S.G, ls = G.ledges.map(([a, b]) => ({ x: ((a + b) / 2) * TS + 8, y: G.floorY })); return ls.sort((p, q) => Math.abs(p.x - pp.x) - Math.abs(q.x - pp.x))[0]; };
  H.barName = e => HM_SAY.name + (HMM.hmOpen(e) ? '  ' + HMM.OPEN_NAME[e.mode] : S && S.ph === 4 && S.call ? '  ' + sayKey['call:' + S.call][0] : S && S.ph <= 3 ? '  ' + sayKey['p' + S.ph][0] : '');
  H.end = () => { if (S) { const a = ACH(); if (a) { a.dropRail('hm'); a.dispelAll(); } recall = recall.concat(dissolved); dissolved = []; stepRecall(); litNow = null; S.sigils = []; S.bolts = []; S.books = []; S.won = true; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, lesson: S.lesson, call: S.call, lit: litNow, pit: S.pitStage, dissolved: dissolved.length, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...S.hurt }, won: S.won };
  /* ================= THE GREYBOX DRAWING ================= */
  H.drawBoss = (g, e, cx, cy, time) => { const p = POSE[e.mode] || POSE.lecture, f = e.face || 1, ex = R(e.x - cx), ey = R(e.y - cy) + (S && S.ph !== 2 && e.mode !== 'stagger' ? Math.sin(time * 2) * 2 : 0);
    g.globalAlpha = p.dim ? 0.65 : 1; const lean = p.lean * f;
    rect(g, ex - 8 + lean * 0.2, ey - 24, 16, 24, '#3a2a5a'); rect(g, ex - 10 + lean * 0.2, ey - 6, 20, 6, '#2a1e44');   /* the gown, the academic robe */
    rect(g, ex - 7 + lean * 0.3, ey - 26, 14, 4, '#6a4a9a');                                                            /* the house sash */
    const hy = ey - 34 + (p.headBack ? 1 : 0); rect(g, ex - 4 + lean * 0.5, hy, 8, 8, '#e8d8c8'); rect(g, ex - 6 + lean * 0.5, hy - 3, 12, 3, '#1a1428'); rect(g, ex - 2 + lean * 0.5, hy - 6, 4, 3, '#1a1428');   /* the head, the square cap */
    if (p.headBack) rect(g, ex - 5 * f + lean * 0.5, hy + 2, 2, 2, '#ffd36b');                                            /* ABOUT FACE: her eye goes behind her first */
    if (p.mouth !== 'shut') rect(g, ex - 1 + lean * 0.5 + f, hy + 5, 3, p.mouth === 'wide' ? 3 : 1, '#2a0a0a');
    const chx = ex + p.chalk[0] * f, chy = ey + p.chalk[1]; rect(g, chx - 2, chy - 2, 4, 4, '#e8d8c8'); rect(g, chx - 1, chy - 6, 2, 4, p.glow ? '#fff6c8' : '#ffffff');
    if (p.chalkUp && (time * 8) % 2 < 1) rect(g, chx - 4, chy - 9, 8, 2, '#ff6b6b');
    if (p.palm) rect(g, chx - 5, chy - 1, 10, 2, (time * 8) % 2 < 1 ? '#ff6b6b' : '#ffd36b');
    const rx = ex + p.ruler[0] * f, ry = ey + p.ruler[1], ca = Math.cos(p.ang) * f, sa = Math.sin(p.ang); for (let k = 0; k < 18; k += 2) rect(g, rx + ca * k - 1, ry + sa * k - 1, 2, 2, '#c8a060');
    if (p.stamp) rect(g, ex - 8, ey - 44, 16, 3, '#c83030');
    g.globalAlpha = 1; };
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!S) return; const x = v => R(v - cx), y = v => R(v - cy), G = S.G;
    for (const s of S.sigils) { if (s.t > HM.chalk.fall) rect(g, x(s.x) - HM.chalk.w, y(G.floorY) - 2, HM.chalk.w * 2, 2, (time * 10) % 2 < 1 ? '#ff4a2a' : '#ffffff');
      else { const k = 1 - s.t / HM.chalk.fall, yy = G.ceil + (G.floorY - G.ceil) * k; rect(g, x(s.x) - 4, y(yy) - 8, 8, 8, '#ffffff'); } }
    for (const b of S.bolts) { rect(g, x(b.x) - 6, y(b.y) - 2, 12, 4, '#fff6c8'); rect(g, x(b.x) - 10 * b.dir - 2, y(b.y) - 1, 6, 2, 'rgba(255,246,200,0.5)'); }
    for (const b of S.books) if (!b.dead) { rect(g, x(b.x) - 4, y(b.y) - 3, 8, 6, '#6a2a3a'); rect(g, x(b.x) - 4, y(b.y) - 3, 8, 1, '#efe6d2'); }
    if (S.tellT > 0 && S.tellStage) { const [x0, x1] = G.pit[S.tellStage - 1]; if ((time * 8) % 2 < 1) rect(g, x(x0 * TS), y(G.floorY), (x1 - x0 + 1) * TS, 3, '#ff4a2a'); }
    const e = live(); if (e && e.mode === 'boltTell') rect(g, x(e.x + e.face * 14) - 2, y(e.y - HM.bolt.h) - 2, 4, 4, (time * 10) % 2 < 1 ? '#ffd36b' : '#ffffff'); };
  return H;
}
