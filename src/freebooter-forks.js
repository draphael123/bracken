// src/freebooter-forks.js - THE FREEBOOTER'S FORK BODIES (claude/freefork). The inline fork reads live in src/main.js (fb(id) = hero()==='pirate' && tech(id), false flag off / another hero / an EVEN-L1 duel);
// the parts that are NEW code with their own state or a loop live here, behind the same reads: the big keg and the three small kegs (POWDER KEG A / B), the splinters (THE PISTOL B), the tide and the
// undertow (HEAVY SEAS A / B), the haul (THE HOOK A) and PAYDAY (BLACK FLAG B). Pure: no DOM, no main.js; every main.js thing comes in through `api`.
// Numbers are written as a multiple of an existing blow (swordDmg x k x amul): a keg is the old keg's blow times a number, the splinter a fraction of the ball, PAYDAY k swords.
// Boss law: nothing here pins, freezes, makes invulnerable or sets a resist; a boss (e.maxHp) or mini (e.mini) is damaged but never staggered, thrown, pulled or splintered.
export const FBF_K = {
  bigKeg: { fuse: 1.5, r: 80, mul: 1.5, scale: 1.7 },                               /* POWDER KEG A: the old keg is fuse 1, ring 52 x 40, blow x1 */
  threeKegs: { at: [44, 84, 124], fuse: [0.8, 1.0, 1.2], r: 38, mul: 0.45, scale: 0.8 },   /* POWDER KEG B: three kegs, each a smaller ring and 45% of the blow */
  keg: { fuse: 1, r: 52, ry: 40 },
  splinter: { r: 36, n: 3, mul: 0.5, stagger: 0.5 },                                /* THE PISTOL B: half the ball to up to three small foes */
  tide: { reach: 240, down: 2.0, coins: 3 },                                         /* HEAVY SEAS A (base: reach 160, down 1.3) */
  undertow: { reach: 110, down: 1.6, pull: 340 },                                    /* HEAVY SEAS B */
  haul: { cut: 0.6, mark: 2.5, shotT: 3 },                                           /* THE HOOK A */
  payday: { k: 3.0, r: 88, ry: 50, stoop: 1.2 },                                     /* BLACK FLAG B: three swords to everything in the old reach, a boss too */
  parley: { r: 150, stoop: 3.3, mark: 4 },
  slip: { cd: 0.55, perfect: 0.28 },                                                 /* THE HOOK CATCH A (base: ready 0.85, perfect beat 0.2) */                                           /* BLACK FLAG A (base: reach 88, stoop 2.2) */
};
export function makeFreebooterForks(api) {
  const P = () => api.P, foes = () => api.enemies;
  const live = e => e.alive && !e.harmless && !(e.gone > 0);
  const small = e => !e.maxHp && !e.mini;
  let kegs = [];
  /* ---- POWDER KEG: the new kegs (the old one keeps its own list in main.js and is untouched) ---- */
  function keg(side) {
    const p = P(), f = p.face, y = p.y;
    if (side === 'A') kegs.push({ x: p.x + f * 44, y, t: 0, fuse: FBF_K.bigKeg.fuse, r: FBF_K.bigKeg.r, mul: FBF_K.bigKeg.mul, scale: FBF_K.bigKeg.scale, boom: false, life: 0 });
    else for (let i = 0; i < 3; i++) kegs.push({ x: p.x + f * FBF_K.threeKegs.at[i], y, t: 0, fuse: FBF_K.threeKegs.fuse[i], r: FBF_K.threeKegs.r, mul: FBF_K.threeKegs.mul, scale: FBF_K.threeKegs.scale, boom: false, life: 0 });
  }
  function update(dt) {
    if (!kegs.length) return;
    for (const k of kegs) { k.t += dt;
      if (!k.boom && k.t >= k.fuse) { k.boom = true; k.life = 0.3;
        api.ringAt(k.x, k.y - 6, k.r + 4, '#ffd36b', 0.35); api.burst(k.x, k.y - 8, k.r > 60 ? 26 : 10, ['#fff6c8', '#ffd36b', '#ff9a5c', '#5c3a1d'], 160, 0.5, 120, 2); api.shakeCam(k.r > 60 ? 8 : 4); api.SFX.crack(); api.SFX.heavy();
        for (const e of foes()) { if (!live(e) || Math.abs(e.x - k.x) > k.r || Math.abs(e.y - k.y) > FBF_K.keg.ry) continue;
          api.hurtAs('shot', e, Math.round(api.kegBlow() * k.mul), k.x, false);
          if (e.alive && small(e)) { e.vx = (Math.sign(e.x - k.x) || 1) * (k.r > 60 ? 260 : 200); e.vy = -140; e.stagger = Math.max(e.stagger || 0, k.r > 60 ? 0.9 : 0.7); } } }
      else if (k.boom) k.life -= dt; }
    kegs = kegs.filter(k => !k.boom || k.life > 0);
  }
  function draw(g, cx, cy) {
    for (const k of kegs) { if (k.boom) continue; const s = k.scale, x = Math.round(k.x - cx), y = Math.round(k.y - cy), blink = Math.floor(k.t * (6 + 10 * k.t)) % 2, w = Math.round(8 * s), h = Math.round(8 * s);
      g.fillStyle = '#5c3a1d'; g.fillRect(x - (w >> 1), y - h, w, h); g.fillStyle = '#7c8797'; g.fillRect(x - (w >> 1), y - h + Math.round(2 * s), w, 1); g.fillRect(x - (w >> 1), y - h + Math.round(5 * s), w, 1);
      g.fillStyle = blink ? '#fff6c8' : '#ff9a5c'; g.fillRect(x, y - h - 3, 1, 3); g.fillRect(x - 1, y - h - 4, 3, 1); }
  }
  const clear = () => { kegs = []; };
  /* ---- THE PISTOL B: SPLINTER SHOT ---- */
  function splinter(best, ballDmg) {
    if (!best) return 0; let n = 0;
    const near = foes().filter(e => e !== best && live(e) && small(e) && Math.hypot(e.x - best.x, e.y - best.y) <= FBF_K.splinter.r).sort((a, b) => Math.hypot(a.x - best.x, a.y - best.y) - Math.hypot(b.x - best.x, b.y - best.y)).slice(0, FBF_K.splinter.n);
    for (const e of near) { api.hurtAs('shot', e, Math.max(1, Math.round(ballDmg * FBF_K.splinter.mul)), best.x, false); if (e.alive) e.stagger = Math.max(e.stagger || 0, FBF_K.splinter.stagger); api.sparks(e.x, e.y - e.h / 2, api.P.face, 4); n++; }
    if (n) api.number(best.x, best.y - best.h - 40, 'SPLINTERS', '#ffd34a');
    return n;
  }
  /* ---- HEAVY SEAS: the foes the wave met (main.js hands them in after the base loop has done its work) ---- */
  function tide(list) {
    let coins = 0;
    for (const e of list) { if (!live(e) || !small(e) || !e.alive) continue;
      e.stagger = Math.max(e.stagger || 0, FBF_K.tide.down);
      if (coins < FBF_K.tide.coins) { coins++; api.dropCoin(e.x, e.y - 8); } }
    return coins;
  }
  function undertow(list) {
    let n = 0;
    for (const e of list) { if (!live(e) || !small(e) || !e.alive) continue;
      e.vx = -P().face * FBF_K.undertow.pull; e.vy = -90; e.stagger = Math.max(e.stagger || 0, FBF_K.undertow.down); n++; }
    return n;
  }
  /* ---- THE HOOK A: HAUL AND BALL (the foe is already hauled by the base code) ---- */
  function haul(foe) {
    if (!foe || !foe.alive || !small(foe)) return;
    api.hurtAs('shot', foe, Math.max(1, Math.round(api.swordDmg() * FBF_K.haul.cut)), P().x, false);
    if (foe.alive) { foe.powderUntil = api.time + FBF_K.haul.mark; foe.powderSaid = false; api.number(foe.x, foe.y - foe.h - 26, 'MARKED', '#ffd34a'); }
    P().catchShotT = api.time + FBF_K.haul.shotT; api.number(P().x, P().y - 40, 'BALL READY', '#fff6c8');
  }
  /* ---- BLACK FLAG B: PAYDAY ---- */
  function payday(e) {
    if (!e || !e.alive || e.harmless) return;
    api.hurtAs(['heavy', 'shot'], e, Math.round(api.swordDmg() * FBF_K.payday.k), P().x, false);
    api.sparks(e.x, e.y - (e.h || 16) / 2, P().face, 8);
  }
  return { keg, update, draw, clear, splinter, tide, undertow, haul, payday, kegs: () => kegs.slice() };
}
