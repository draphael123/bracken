// src/warden-brace.js - THE WARDEN'S SPEAR-HAFT BRACE (claude/heroblocksb, Daniel 10-30 22:15 "These work": every hero has a block).
// The Warden's C was a TAP (the deflect: a sweep of the shaft that turns a yellow blow on the beat and swats what flies). It stays exactly that.
// HOLD C now plants the spear: the heel driven in, the haft angled across her front, both hands on it (chars.js F.block - the old brace pose).
//   - it turns a YELLOW blow from the FRONT, any blow met on the haft (no beat to hit) - at MORE CHIP THAN A SHIELD (WB.chip x the knight's block cost);
//   - a RED blow is never turned and a crossbow bolt goes through (the two NOs every guard has); nothing from behind or overhead;
//   - A YELLOW CHARGER THAT RUNS ONTO THE BRACED POINT IS IMPALED (main.js impale: broken, stopped dead, vigil), and a charge that lands on the haft
//     in the same frame is impaled too - the default-deny list (main.js BRACE_STOPS) still decides which charges, plus any yellow blow thrown from a
//     charge-named mode. A boss/mini is only checked (a plain hit off the haft, B3/B13);
//   - out of wind the guard BREAKS (half the blow, the stagger, the exhaust) as the knight's does; she walks slowly while braced; a swing, a roll or a
//     jump drops it and a still-held C raises it again after WB.hold;
//   - it costs wind to stand there (WB.drain x the shared hold drain), and stamina does not come back while it is up.
// main.js owns the world and the keys; the module owns the window, the price and what a hit on the haft does. Called from updatePlayer (update),
// damagePlayer0 (takes) and the hero's draw (posed).
export const WB = {
  hold: 0.2,          /* s C is held before the haft is planted (a tap is the deflect and nothing else) */
  chip: 1.6,          /* x the knight's blockCost: the haft is a worse wall than a shield, so a turned blow costs more wind */
  drain: 0.8,         /* x the shared held-guard drain (main.js ST.hold) */
  push: 0.3,          /* x the shield's slide: she is planted, a heavy blow shifts her a little */
  breakTired: 1.2,    /* s she cannot brace again after the haft breaks */
  hitBoss: 1.0,       /* a boss/mini that runs onto the point takes this x her sword damage, as a set spear (crouch-a.js bossDmg) */
  chargeMode: /^(charge|rush|ram|butt|gore|trample|stampede|rampage|lunge|pounce|dashAtk|bull|jousting?)/i,   /* a yellow blow thrown out of one of these modes is a charge */
  fast: 70,           /* px/s: it has to be coming, fast */
};
export function makeWardenBrace(api) {
  const stats = { braces: 0, blocks: 0, impaled: 0, bossHits: 0, broke: 0, tired: 0, redThrough: 0, bolts: 0, behind: 0 };
  const P = () => api.P;
  const up = p => !!p.wBrace;
  /* EVERY FRAME (updatePlayer, the warden's block, after the deflect): the haft goes down when C has been held and nothing else has her; and while it
     is down, the cost, the slow walk's flag and the point's watch for a charge. ok = nothing else has her this frame (not stunned, rolling, swinging...) */
  function update(dt, keys, ok) {
    const p = P();
    p.wbHeld = keys.block && !p.dead ? (p.wbHeld || 0) + dt : 0;
    const want = ok && !p.dead && p.wbHeld >= WB.hold && (p.ground || p.swim) && !(p.guardTired > 0) && (p.st || 0) > 0 && !api.wardJav() && api.guardOk();
    if (want && !p.wBrace) { p.wBrace = true; p.wbT = 0; stats.braces++; api.SFX.braceSet && api.SFX.braceSet(); api.dust(p.x + p.face * 9, p.y, 3); api.ringAt(p.x + p.face * 8, p.y - 3, 9, '#c9b27c', 0.2); api.teach(); }
    else if (!want && p.wBrace) { p.wBrace = false; p.wbT = 0; }
    if (!p.wBrace) return;
    p.wbT += dt; p.st -= api.ST.hold * WB.drain * dt; p.stDelay = api.ST.delay;
    if (p.st <= 0) { p.st = 0; p.wBrace = false; p.guardTired = 0.8; p.stFlash = 0.5; stats.tired++; api.SFX.guardBreak(); api.number(p.x, p.y - 22, 'TIRED', '#ffd36b'); return; }
    api.watch(p);   /* the braced point: what runs onto it (crouch-a.js setWatch - the same default-deny rule as the thrust's) */
  }
  /* A CHARGER THAT HAS REACHED HER: is this blow a charge at the haft, from a yellow mode, coming fast and on her level? */
  function charger(p, foe) {
    if (!foe || !foe.alive || foe.harmless || foe.gone > 0 || foe.turncoat || foe.pointHit > 0) return false;
    if (Math.sign(foe.x - p.x) !== p.face) return false;
    if (!((foe.x - p.x) * (foe.vx || 0) < 0 && Math.abs(foe.vx || 0) > WB.fast)) return false;
    if (Math.abs(foe.y - p.y) > 40) return false;
    return api.braceStops(foe) || WB.chargeMode.test(String(foe.mode || ''));
  }
  /* A BLOW LANDING ON HER (main.js damagePlayer0): 'blocked' (the haft turned it), 'half' (the haft broke: half the blow finds her) or null (it finds her whole) */
  function takes(fromX, dmg, unblockable, foe, pierce, o = {}) {
    const p = P(); if (!up(p)) return null;
    const front = Math.sign(fromX - p.x) === p.face || fromX === p.x;
    if (!front) { stats.behind++; return null; }                         /* nothing from behind - the plate at his back is the knight's talent, not hers */
    if (unblockable) { stats.redThrough++; return null; }                /* a RED blow is never turned (main.js has said TOO STRONG on the beat) */
    if (pierce) { stats.bolts++; api.number(p.x, p.y - 30, 'THROUGH THE HAFT', '#ff6b6b'); api.SFX.pierce && api.SFX.pierce(); return null; }   /* a bolt goes through a guard that was already up */
    const cost = Math.round(api.blockCost(dmg) * WB.chip);
    if ((p.st || 0) < cost) {                                             /* THE HAFT BREAKS: half the blow, the stagger, the exhaust */
      p.st = 0; p.stFlash = 0.5; p.wBrace = false; p.wbT = 0; p.wbHeld = 0; stats.broke++; api.SFX.guardBreak(); api.SFX.gasp && api.SFX.gasp(); api.shakeCam(5, -p.face * 4); api.hitstop(0.1);
      p.hurt = api.STAM.breakStagger; p.guardTired = Math.max(api.STAM.breakTired, WB.breakTired); api.exhaust(p); api.number(p.x, p.y - 22, 'HAFT BREAKS', '#ffd36b'); return 'half'; }
    p.st -= cost; p.stDelay = api.ST.delay; stats.blocks++;
    const heavy = dmg >= api.heavy;
    if (charger(p, foe)) {                                                 /* IMPALED: it ran onto the point as it struck */
      if (api.big(foe)) { stats.bossHits++; api.hurtAs('light', foe, Math.max(1, Math.round(api.swordDmg() * WB.hitBoss)), p.x, false); foe.stagger = Math.max(foe.stagger || 0, 0.2); api.SFX.tipRing(); api.number(foe.x, foe.y - (foe.h || 16) - 18, 'ON THE HAFT', '#8fd160'); }
      else { stats.impaled++; api.impale(foe); if (foe.alive && !foe.elite) api.hurtAs('heavy', foe, Math.max(1, Math.round(api.swordDmg() * 0.9)), p.x, false); api.number(foe.x, foe.y - (foe.h || 16) - 30, 'IMPALED', '#8fd160'); } }
    if (!heavy) { /* the planted heel holds her: a light blow does not move her at all */ } else { p.vx = -p.face * api.guardPush(dmg) * WB.push; api.dust(p.x - p.face * 4, p.y, 4); }
    api.blockFx(p.x + p.face * 11, p.y - 11, p.face, heavy);
    api.number(p.x, p.y - 28, 'BRACED', '#8fd160');
    return 'blocked';
  }
  const read = () => { const p = P(); return { up: up(p), held: +(p.wbHeld || 0).toFixed(2), t: +(p.wbT || 0).toFixed(2), stats: { ...stats } }; };
  return { update, takes, charger, up: () => up(P()), read, stats, resetStats: () => { for (const k in stats) stats[k] = 0; } };
}
