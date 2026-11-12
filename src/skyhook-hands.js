// src/skyhook-hands.js - SKYHOOK's HANDS (claude/skyhook, 11-05). src/skyhook.js is the fight (pure); this binds it to the world: his told blows on the heroes
// (keyed once a hero a move; the yellow ones a shield turns, the red ones it does not), the HIGH LINE and the two winch lines (the line kit's own lines on
// THE HIGH LINES, through src/highlines-hands.js kit(): cut them, read who rides them), the TENSION LEVERS (two props in main.js's foe list, so every blow
// and every shot of every hero reaches them through hurtEnemy - like the Shriek Sisters' bodies), the hooks in flight - and the drawing.
// GREYBOX ART (readable; the art lane draws it - see the lane report's ART OWED): a human rigger in a long tarred coat and a knitted cap, a coil of line on his
// shoulder, the iron boat-hook on a chain. Every move its OWN windup and release pose (B16): hooked on (both hands up on the trolley, crouched) -> riding
// (hanging, legs swinging); the hook drawn back over his shoulder (the chain coiled in his other fist) -> thrown (arm out flat); the drop (unclipping, looking
// down, the hook pointed down) -> the slam (crouched on the rock, the hook in it); the sweep's windup (the hook held low behind him) -> the sweep (spun round
// flat at the ankles); the cut (the cutter's jaws on the winch line, both hands) -> cut (thrown back); the swing (the rope in both fists, leaning out) -> the
// swing (legs forward); the shove (the hook reversed, butt forward, drawn back) -> shove (thrust out). DOWN: on his back, the trolley's broken bracket in
// his hand, stars. THE SHARED READ (B10): OPEN = a gold ring and a timer bar; WARDED = a pale ring and the word; his COAT turns a blow: a clank and the word.
// main.js calls: spawnBoss, props, owns, ownsProp, on, update, take, lever, drawBoss, drawOver, barName, end, read, show, clear, phase, plan.
import * as SKM from './skyhook.js';
import { BOSS_PHASE } from './boss-music.js';
import { lineCut } from './line-kit.js';
import { drawRiggerArt, drawSkyTrolley, drawSkyHook, chainLine, drawRag, drawLeverArt } from './redraw/line_crew_art.js';   /* (claude/hlart) the hand-drawn rigger, trolley, hook, chain, rags and tension lever */
const { SH } = SKM;
const R = Math.round;
const SOUND = { rideTell: s => (s.ratchet || s.clank)(), ride: s => (s.ratchet || s.throwWhoosh)(), perch: s => (s.pStep || s.thud)(), hookTell: s => s.tell && s.tell(false),
  hook: s => (s.throwWhoosh || s.slash)(), dropTell: s => s.tell && s.tell(true), lock: s => (s.clank || s.thud)(), drop: s => (s.throwWhoosh || s.thud)(), slam: s => { (s.heavy || s.thud)(); (s.rubble || s.thud)(); },
  jarred: s => (s.sting || s.coin || s.clank)(), sweepTell: s => s.tell && s.tell(true), sweep: s => (s.slash || s.throwWhoosh)(), grappleTell: s => (s.clank || s.thud)(), grapple: s => (s.ratchet || s.throwWhoosh)(),
  slip: s => { (s.crack || s.thud)(); (s.ratchet || s.clank)(); }, downed: s => { (s.heavy || s.thud)(); (s.sting || s.coin || s.clank)(); }, rise: s => (s.roar || s.heavy || s.thud)(),
  shoveTell: s => s.tell && s.tell(false), shove: s => (s.heavy || s.thud)(), cutTell: s => s.tell && s.tell(true), cut: s => (s.crack || s.thud)(), cutter: s => (s.ratchet || s.clank)(),
  swingTell: s => s.tell && s.tell(true), swing: s => (s.throwWhoosh || s.slash)(), clank: s => (s.clank || s.thud)() };
const C = { coat: '#3a4a5a', coatL: '#55687a', coatD: '#26313c', skin: '#d8a880', cap: '#a8341e', hook: '#b8c0c8', hookD: '#6a747c', chain: '#8a9098', rope: '#c8b088', boot: '#2a2420', red: '#ff4a2a', gold: '#ffd36b', lever: '#7a6a5a', iron: '#4a5058' };
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), Math.max(1, R(w)), Math.max(1, R(h))); };
const limb = (g, x0, y0, x1, y1, col, wd) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.beginPath(); g.moveTo(R(x0), R(y0)); g.lineTo(R(x1), R(y1)); g.stroke(); g.lineCap = 'butt'; g.lineWidth = 1; };
/* THE POSE A MODE WEARS (local px, facing right, origin = his feet; on the line his hands are up at the trolley): crouch (px his body sinks), lean (rad),
   hand [x, y] (the hook hand), off [x, y] (the other hand), hook: where the hook's head is [x, y] (null: on his back), legs: 'stand'|'hang'|'swing'|'kneel'|'down',
   cutter / grip (on the trolley) / rope (the swing rope) / butt (the hook reversed) */
export const POSE = {
  perch: { crouch: 0, lean: 0, hand: [8, -18], off: [-6, -14], hook: [10, -40], legs: 'stand' },
  wake: { crouch: 0, lean: -0.1, hand: [10, -30], off: [-8, -30], hook: [12, -52], legs: 'stand' },
  phaseTell: { crouch: 2, lean: -0.15, hand: [8, -30], off: [-8, -26], hook: [10, -46], legs: 'stand', cutter: 'up' },
  rideTell: { crouch: 6, lean: 0.1, hand: [4, -34], off: [-4, -34], hook: [-12, -24], legs: 'stand', grip: true },
  ride: { crouch: 0, lean: 0, hand: [2, -34], off: [-2, -34], hook: [-10, -10], legs: 'hang', grip: true },
  hookTell: { crouch: 2, lean: -0.2, hand: [-12, -30], off: [6, -18], hook: [-20, -38], legs: 'stand', coil: true },
  hook: { crouch: 0, lean: 0.2, hand: [20, -20], off: [-6, -16], hook: null, legs: 'stand' },
  dropTell: { crouch: 0, lean: 0.25, hand: [2, -34], off: [8, -8], hook: [10, 4], legs: 'hang', grip: true, look: true },
  drop: { crouch: 0, lean: 0.1, hand: [8, -10], off: [-8, -20], hook: [10, 6], legs: 'hang' },
  landed: { crouch: 6, lean: 0.3, hand: [12, -6], off: [-6, -10], hook: [16, 0], legs: 'kneel' },
  jarred: { crouch: 8, lean: -0.3, hand: [10, -8], off: [-10, -12], hook: [18, -2], legs: 'kneel', stars: true },
  sweepTell: { crouch: 6, lean: -0.3, hand: [-14, -8], off: [4, -14], hook: [-26, -4], legs: 'stand' },
  sweep: { crouch: 4, lean: 0.3, hand: [18, -6], off: [-6, -12], hook: [30, -3], legs: 'stand' },
  climbTell: { crouch: 2, lean: -0.15, hand: [4, -38], off: [-6, -16], hook: [6, -56], legs: 'stand' },
  climb: { crouch: 0, lean: 0, hand: [2, -34], off: [-2, -30], hook: [2, -44], legs: 'hang' },
  slip: { crouch: 0, lean: -0.6, hand: [8, -36], off: [-10, -30], hook: [14, -44], legs: 'hang', bracket: true },
  downed: { crouch: 0, lean: 0, hand: [10, -4], off: [-10, -4], hook: [18, -2], legs: 'down', stars: true, bracket: true },
  rise: { crouch: 6, lean: -0.2, hand: [14, -24], off: [-14, -24], hook: [20, -34], legs: 'kneel' },
  shoveTell: { crouch: 2, lean: -0.2, hand: [-8, -18], off: [-14, -18], hook: [-24, -18], legs: 'stand', butt: true },
  shove: { crouch: 0, lean: 0.25, hand: [16, -18], off: [10, -18], hook: [30, -18], legs: 'stand', butt: true },
  cutTell: { crouch: 6, lean: 0.35, hand: [10, -6], off: [6, -6], hook: [-12, -30], legs: 'kneel', cutter: 'jaw' },
  cut: { crouch: 2, lean: -0.3, hand: [4, -28], off: [-6, -20], hook: [-12, -34], legs: 'stand', cutter: 'up' },
  swingTell: { crouch: 4, lean: 0.3, hand: [6, -34], off: [10, -34], hook: [-12, -20], legs: 'stand', rope: true },
  swing: { crouch: 0, lean: -0.2, hand: [0, -32], off: [2, -32], hook: [-10, -16], legs: 'swing', rope: true },
};
/* HIS BODY (greybox): a stocky man in a long coat to the knees, a red knitted cap, a coil of line over one shoulder */
function drawRigger(g, p, flash, time, ph) {
  const cr = p.crouch || 0, coat = flash ? '#ffffff' : C.coat, coatL = flash ? '#ffffff' : C.coatL;
  if (p.legs === 'down') {   /* on his back across the rock */
    rect(g, -14, -8, 28, 7, coat); rect(g, -14, -8, 28, 2, coatL); rect(g, 12, -10, 7, 7, C.skin); rect(g, 13, -12, 6, 3, C.cap); rect(g, -20, -5, 7, 3, C.boot);
    limb(g, 4, -6, p.hand[0], p.hand[1], coat, 3); if (p.hook) limb(g, p.hand[0], p.hand[1], p.hook[0], p.hook[1], C.hook, 2); if (p.bracket) rect(g, -4, -14, 6, 3, C.iron); return; }
  g.save(); g.rotate(p.lean || 0);
  const top = -30 + cr;
  /* legs */
  if (p.legs === 'hang') { const sw = Math.sin(time * 6) * 3; limb(g, -3, top + 22, -4 + sw, 0, C.boot, 3); limb(g, 3, top + 22, 4 + sw, 0, C.boot, 3); }
  else if (p.legs === 'swing') { limb(g, -2, top + 22, 10, -2, C.boot, 3); limb(g, 3, top + 22, 14, 0, C.boot, 3); }
  else if (p.legs === 'kneel') { limb(g, -3, top + 22, -8, 0, C.boot, 3); limb(g, 3, top + 22, 8, -6, C.boot, 3); rect(g, 6, -3, 5, 3, C.boot); }
  else { limb(g, -3, top + 22, -4, 0, C.boot, 3); limb(g, 3, top + 22, 4, 0, C.boot, 3); }
  /* the long coat */
  rect(g, -7, top + 6, 14, 20, coat); rect(g, -7, top + 6, 3, 20, coatL); rect(g, -8, top + 22, 16, 4, coat); rect(g, -1, top + 8, 1, 16, C.coatD);
  rect(g, -7, top + 14, 14, 2, '#5a4030');   /* his belt */
  if (ph > 1) { rect(g, 3, top + 15, 5, 5, C.iron); rect(g, 4, top + 13, 1, 3, C.hook); }   /* the cutter on his belt in phase two */
  /* the coil of line over his shoulder */
  g.strokeStyle = C.rope; g.beginPath(); g.ellipse(-3, top + 10, 6, 4, 0.5, 0, 7); g.stroke();
  /* head */
  rect(g, -4, top - 2, 8, 8, C.skin); rect(g, -5, top - 5, 10, 4, C.cap); rect(g, 2, top + 1, 2, 2, '#1a1418'); rect(g, -4, top + 4, 8, 2, '#5a4a40');   /* cap, eye, beard */
  if (p.look) rect(g, 1, top + 3, 3, 2, '#1a1418');
  g.restore();
  /* arms + the hook */
  const sh = [3, top + 9], sh2 = [-3, top + 9];
  limb(g, sh2[0], sh2[1], p.off[0], p.off[1] + cr, coat, 3);
  limb(g, sh[0], sh[1], p.hand[0], p.hand[1] + cr, coat, 3); rect(g, p.hand[0] - 1, p.hand[1] + cr - 1, 3, 3, C.skin);
  if (p.hook) { const hx = p.hook[0], hy = p.hook[1] + cr; limb(g, p.hand[0], p.hand[1] + cr, hx, hy, C.hookD, 2);
    if (p.butt) rect(g, hx - 2, hy - 2, 4, 4, C.iron); else { rect(g, hx - 1, hy - 3, 3, 6, C.hook); rect(g, hx + 1, hy - 3, 3, 2, C.hook); } }
  if (p.coil) { g.strokeStyle = C.chain; g.beginPath(); g.arc(p.off[0], p.off[1] + cr, 4, 0, 7); g.stroke(); }
  if (p.cutter === 'jaw') { rect(g, p.hand[0] + 1, p.hand[1] + cr - 4, 6, 3, C.iron); rect(g, p.hand[0] + 1, p.hand[1] + cr + 1, 6, 3, C.iron); }
  if (p.cutter === 'up') { rect(g, p.hand[0] - 2, p.hand[1] + cr - 8, 4, 8, C.iron); rect(g, p.hand[0] - 3, p.hand[1] + cr - 10, 6, 3, C.hook); }
  if (p.bracket) rect(g, p.hand[0] - 2, p.hand[1] + cr - 6, 5, 3, C.iron);
}
export function makeSkyhookHands(ctx) {
  let S = null; let props = []; const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'skyhook' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => !!e && e.t === 'skyhook';
  H.ownsProp = e => !!e && e.t === 'skylever';
  H.phase = () => (S ? S.ph : 1);
  H.clear = () => { S = null; props = []; BOSS_PHASE.skyhook = 1; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'skyhook' ? e : null; };
  const kit = () => (ctx.kit ? ctx.kit() : null);
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.shKeys = pp.shKeys || new Map(); if (pp.shKeys.size > 120) pp.shKeys.clear(); if (pp.shKeys.has(key)) return true; pp.shKeys.set(key, 1); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = SKM.newFight(SKM.geom(Ar)); BOSS_PHASE.skyhook = 1;
    const hp = (ctx.EHP && ctx.EHP.skyhook) || SH.hp;
    const e = { ...base, t: 'skyhook', w: SH.w, h: SH.h, hp, maxHp: hp, noGrav: true, markH: SH.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, ward: 0 };
    SKM.atPerch(e, S); for (const pp of ctx.players) pp.shKeys = null;
    /* THE TENSION LEVERS: props in main.js's foe list (a blow or a shot reaches them like any foe; hurtEnemy hands it to lever()) - never harmed, never a kill */
    props = S.G.levers.map(l => ({ ...base, t: 'skylever', id: l.id, x: l.x, y: S.G.floorY, w: 12, h: 22, hp: 9999, maxHp: 9999, noGrav: true, alive: true, face: 1, mode: 'idle', modeT: 0, prop: true, markH: 26, xpKey: undefined, swing: 0, cool: 0 }));
    return e; };
  H.props = () => props;
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, lk: pp.lk ? pp.lk.id : null, pp }));
  function world(e) {
    const K = kit();
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.skyhook = ph; },
      mark: m => ctx.number(e.x, e.y - SH.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - 14, 34, '#ffd36b'); ctx.burst(x, y - 8, 14, ['#8a8a94', '#c8b088', '#ffd36b'], 110, 0.7); } else if (k === 'ward') ctx.ring(x, y - 14, 36, '#c8d8e8'); else if (k === 'dust') ctx.burst(x, y - 2, 18, ['#8a8a94', '#6a6a72', '#c8c8d0'], 120, 0.6); },
      lineUp: id => !!(K && K.lines[id] && !(K.lines[id].cut > 0)),
      cutLine: (id, s) => !!(K && lineCut(K, id, s)),
      riders: id => ctx.players.filter(pp => pp.lk && pp.lk.id === id && !pp.dead),
      hit: (bx, d, name, o = {}) => { const out = [];
        for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (o.ridersOnly && !(P.lk && P.lk.id === o.ridersOnly)) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          let res = null; const hp0 = P.hp; hurt(name, () => { res = ctx.damagePlayer(e.x, d, { who: e, name: 'SKYHOOK', unblockable: !o.yellow }); });
          const r = res === 'blocked' ? (P.parryT > 0.2 ? 'parried' : 'blocked') : P.hp < hp0 || P.hurt > 0 ? 'hit' : 'miss'; out.push(r);
          if (r === 'hit') {
            if (o.pull) { P.vx = (Math.sign((o.pullTo ?? e.x) - P.x) || 1) * o.pull; P.vy = Math.min(P.vy || 0, -120); P.ground = false; if (S) ctx.number(P.x, P.y - 30, SKM.SKY_SAY.hooked, '#ff9a5c'); }
            if (o.push) { P.vx = o.pushFrom !== undefined ? (Math.sign(P.x - o.pushFrom) || 1) * o.push : o.push; P.vy = Math.min(P.vy || 0, -110); P.ground = false; }
            if (o.up) { P.vy = o.up; P.ground = false; } } });
        return out; },
    };
  }
  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.6; ctx.number(e.x, e.y - 70, SKM.SKY_SAY.wake, '#ffd36b'); SOUND.rise(ctx.sfx); ctx.shake(4); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number(S.G.mid, S.G.floorY - 120, SKM.SKY_SAY.rule, '#ffd36b'); }
    SKM.stepSky(e, S, dt, heroes(), world(e));
    for (const l of props) { l.swing = Math.max(0, l.swing - dt); l.cool = Math.max(0, l.cool - dt); l.hp = l.maxHp; }
    e.phase = S.ph; e.open = SKM.skyOpen(e) ? Math.max(0, e.modeT) : 0; e.openKind = e.mode;
  };
  /* A LEVER STRUCK (main.js hurtEnemy0 hands every blow and shot on a 'skylever' here) */
  H.lever = (l, fromX) => { if (!l || l.cool > 0) return; l.cool = 0.25; l.swing = 0.35; l.hp = l.maxHp;
    const e = live(); if (!S || !e || !ctx.bossActive) { SOUND.clank(ctx.sfx); return; }
    SKM.leverStruck(e, S, l.id, world(e)); };
  /* A BLOW ON HIM (B15; src/skyhook.js takeBlow) - the turned share clanks and says why */
  H.take = (e, dmg, tag) => {   /* (tag: the blow's name - every blow is the same to his coat; kept for tools/blow-tags.mjs and a later read) */ if (!S) return dmg; const [d, word] = SKM.takeBlow(e, S, dmg);
    if (word) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 9, e.y - 16, sd, 3);
      if (!S.told.coat && word === SKM.SKY_SAY.guard) { S.told.coat = 1; ctx.hint && ctx.hint('HIS COAT TURNS HALF A BLOW. STRIKE A LEVER WHILE HE RIDES HIS LINE: IT SLIPS, AND HE COMES DOWN.'); } }
    return d; };
  H.barName = e => 'SKYHOOK' + (SKM.skyOpen(e) ? '  ' + (SKM.OPEN_NAME[e.mode] || 'OPEN') : S && S.ward > 0 ? '  WARDED' : '');
  H.end = () => { if (S) { S.hooks = []; S.leverHook = null; } const K = kit(); if (K && K.lines[S ? S.G.line.id : 'HL']) K.lines[S ? S.G.line.id : 'HL'].cut = 0; BOSS_PHASE.skyhook = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, side: S.side, ward: S.ward, lineDown: S.lineDown, hooks: S.hooks.length, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };
  H.plan = () => (S ? { levers: S.G.levers.map(l => ({ ...l })) } : null);
  /* ---------- DRAWING ---------- */
  H.drawBoss = (g, e, cx, cy, time) => {
    if (e.t === 'skylever') { drawLever(g, e, cx, cy, time); return; }
    if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const m = e.mode, p = POSE[m] || POSE.perch, f = e.face || 1, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06;
    g.save(); g.translate(R(e.x - cx), R(e.y - cy)); if (m !== 'downed') g.scale(f, 1);
    if (SKM.skyOnLine(e) || m === 'rideTell') drawSkyTrolley(g, 0, -SH.hang - 6 + (m === 'rideTell' ? SH.hang - 30 : 0), 1, time);   /* his crank trolley */
    if (p.rope) { limb(g, 0, -32, (S.G.mid - e.x) * f, S.G.swingY - e.y, C.rope, 1); }   /* the swing rope up to its anchor over the middle */
    drawRiggerArt(g, p, flash, time, S.ph, 0, 0, 1);   /* (claude/hlart) the hand-drawn rigger (the greybox drawRigger stays for the old art sheets) */
    g.restore(); };
  function drawLever(g, l, cx, cy, time) {
    const x = R(l.x - cx), y = R(l.y - cy), e = live(), hot = e && ctx.bossActive && (e.mode === 'rideTell' || SKM.skyOnLine(e)), now = hot && S && SKM.skySlippable(e, S);
    drawLeverArt(g, x, y, l.swing, hot, now, time);   /* (claude/hlart) a stone-bolted bed, the wound drum, the ratchet pawl, a lever in three states; amber while he is on the line, blinking gold over the middle */
  }
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const e = ctx.boss; const G = S.G, X = v => R(v - cx), Y = v => R(v - cy);
    /* THE MIDDLE SPAN: two rag markers tied on the high line where a lever starts to slip him (art owed: the crew's red rags) */
    { const half = (G.end.E - G.end.W) * SH.slip.span / 2; for (const sx of [G.mid - half, G.mid + half]) drawRag(g, X(sx), Y(G.ropeY(sx)), time); }
    /* THE SWING ROPE (it hangs over the middle of the station) */
    if (!e || (e.mode !== 'swing' && e.mode !== 'swingTell')) { g.globalAlpha = 0.8; limb(g, X(G.mid), Y(G.swingY), X(G.mid) + R(Math.sin(time * 1.3) * 2), Y(G.floorY - 60), C.rope, 1); g.globalAlpha = 1; }
    if (!ctx.bossActive || !e || e.t !== 'skyhook') return;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    /* THE HOOK'S AIM: a dotted line to where it goes (amber, then red once it is set) */
    if (e.mode === 'hookTell') { const set = e.modeT <= SH.hook.lock; g.globalAlpha = 0.7; g.strokeStyle = set ? blink : '#ffb347'; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(e.x), Y(e.y - 20)); g.lineTo(X(e.aimX), Y(e.aimY)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
    for (const h of S.hooks) { chainLine(g, X(h.ox), Y(e.y - 20), X(h.x), Y(h.y), time); drawSkyHook(g, X(h.x), Y(h.y), h.x >= h.ox ? 1 : -1, time); }
    /* THE DROP's ring: amber while it follows you, red once it is set */
    if (e.mode === 'dropTell') { const col = e.locked ? blink : '#ffb347'; g.globalAlpha = 0.85; g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.ellipse(X(e.lockX), Y(G.floorY) - 1, SH.drop.r, 4, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      limb(g, X(e.lockX), Y(e.y), X(e.lockX), Y(G.floorY) - 2, 'rgba(255,107,107,0.35)', 1); }
    /* THE SWEEP's reach along the floor */
    if (e.mode === 'sweepTell') { g.globalAlpha = 0.45 + 0.3 * Math.sin(time * 14); g.fillStyle = '#ff6b6b'; for (let q = e.x - SH.sweep.reach; q < e.x + SH.sweep.reach; q += 9) g.fillRect(X(q), Y(G.floorY) - 2, 5, 2); g.globalAlpha = 1; }
    /* THE LOW SWING's arc, told red */
    if (e.mode === 'swingTell') { g.globalAlpha = 0.35 + 0.3 * Math.sin(time * 16); g.strokeStyle = '#ff4a2a'; g.lineWidth = 2; g.setLineDash([5, 3]); g.beginPath();
      for (let k = 0; k <= 1.001; k += 0.05) { const q = SKM.swingAt(S, S.side, k); const yy = Y(q.y - SH.h / 2); if (k === 0) g.moveTo(X(q.x), yy); else g.lineTo(X(q.x), yy); } g.stroke(); g.setLineDash([]); g.lineWidth = 1; g.globalAlpha = 1; }
    /* HE CUTS YOUR LINE: the fray bar at the top of the winch line under his gallery */
    if (e.mode === 'cutTell') { const k = 1 - Math.max(0, e.modeT) / SH.cut.tell, x = X(e.x + (S.side === 'W' ? 18 : -18)), y = Y(e.y - 40);
      g.fillStyle = '#1b1626'; g.fillRect(x - 14, y, 28, 3); g.fillStyle = blink; g.fillRect(x - 14, y, R(28 * k), 3); }
    /* THE READ (B10) */
    const x = X(e.x), y = Y(e.y - 14);
    if (SKM.skyOpen(e)) { const kk = Math.max(0, e.modeT / (e.openT0 || 1));
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = Y(e.y - 46); ctx.text(SKM.OPEN_NAME[e.mode] || 'OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * kk), 3);
      if (e.mode === 'downed') for (let i = 0; i < 3; i++) { const a = time * 3 + i * 2.1; rect(g, x + R(Math.cos(a) * 12), Y(e.y - 18) + R(Math.sin(a) * 3), 2, 2, '#ffd36b'); } }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 28, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, Y(e.y - 46), '#c8d8e8', 'center', 5); }
    if (e.mode === 'rise') { g.globalAlpha = 0.6; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(x, Y(G.floorY - 10), R(SH.rise.r * (1 - Math.max(0, e.modeT) / SH.rise.tell)), 0, 7); g.stroke(); g.globalAlpha = 1; }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, Y(e.y - 56) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
export const _drawRigger = drawRigger;   /* (tools / the art sheet draw a pose) */
