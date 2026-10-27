// src/powder-monkey.js - THE POWDER MONKEY, a SHARED FOE (claude/flotilla4; scratch/brief-flotilla4-1027.md item 4 - Daniel's rec approved 10-27 "Sure").
// Written to be reused: THE FLOTILLA and THE HURRICANE DECK place him now; SIREN ROCKS and the STORMWRECK ships can place him later with one ent ('powdermonkey') -
// nothing in here knows which level it is in. Greybox art: src/redraw/powder_monkey_art.js (the Sonnet art lane).
//
// WHO HE IS: a ship's boy who runs powder - small and quick (a distinct, low silhouette beside the big pirates), low health. He SCURRIES to keep a lobbing distance
// (never walks off his deck), and LOBS A LIT GRENADE that lands short of you and ROLLS. Told: '!!' and the grenade held up over his cap with its fuse SPARKING
// (PM.lightTell s); in flight and on the deck its fuse blinks faster as it burns, and the last of it closes a red ring (src/redraw/powder_monkey_art.js drawGrenade).
// THE ANSWER - THE LEVEL'S POWDER, YOUR TOOL: STRIKE (KICK) THE GRENADE and it goes back hard the way you struck it, its fuse held at PM.kickFuse so it never
// goes off at your feet. Struck back it BLOWS ON WHAT IT MEETS: the monkey, any other foe, a wall or a barricade - and its blast (ctx.blast with { kicked }) fires a
// DECK GUN in reach, sets off a POWDER KEG, and lands harder on foes (PM.kickBonus). Strike HIM while he holds it lit and he DROPS it at his own feet and runs.
// A grenade that rolls into the water goes out. The first grenade of a level is the TEACH: a longer fuse (PM.teachFuse) and the line over it.
// main.js calls: owns(e), spawn(base, ent), updateFoe(e, dt), update(dt), strike(hb), drawFoe(g, e, cx, cy, time), drawOver(g, cx, cy, time), clear(), read(), grenades().
// ctx: hero(), TS, EHP, enemies(), boss(), isSolid(tx, ty), oneWay(tx, ty), wet(x, y), moveBody(e, dx, dy) -> { ground }, overlap(a, b), number(x, y, t, c),
//      sound(k), blast(x, y, r, o), hint(m), heel() -> px/s^2 along the deck (optional: THE HURRICANE's roll runs a grenade downhill), time().
import * as PMA from './redraw/powder_monkey_art.js';
export const PM = {
  hp: 24, w: 8, h: 13, sightX: 250, sightY: 90, near: 70, far: 170, lobMin: 48, lobMax: 210, lobDy: 72, speed: 96, fleeSpeed: 118,
  lightTell: 0.8, lobT: 0.7, lobRec: 0.35, fleeT: 0.9, lobCd: 3.4, firstCd: 1.2, grav: 900,
  /* the grenade: its fuse from the throw, the teach fuse (the first of a level), the blast; it rolls (decel px/s^2, a wall bounce), struck back kickV / kickVy, fuse held at kickFuse */
  fuse: 2.5, teachFuse: 3.6, dropFuse: 1.0, blastR: 32, rollDecel: 80, landKeep: 0.35, bounce: 0.4, kickV: 260, kickVy: -120, kickFuse: 1.4, kickBonus: 30, contactR: 10,
};
export const PM_SAY = { teach: 'HIS GRENADE: STRIKE IT BACK AT HIM', back: 'STRUCK BACK', dropped: 'DROPPED IT', out: 'IT GOES OUT', hint: 'A POWDER MONKEY LOBS LIT GRENADES. STRIKE ONE AND IT GOES BACK - AT HIM, HIS MATES, A DECK GUN OR A KEG.' };
export const PM_MOVES = { lightTell: { mark: '!!', answer: 'dodge' } };
export function makePowderMonkeys(ctx) {
  const H = {}; let G = [], told = false;
  const T = () => ctx.TS, now = () => (ctx.time ? ctx.time() : 0);
  H.owns = e => !!e && e.t === 'powdermonkey';
  H.on = () => G.length > 0 || ctx.enemies().some(e => e.t === 'powdermonkey' && e.alive);
  H.clear = () => { G = []; told = false; };
  H.grenades = () => G;
  H.add = q => { G.push({ vx: 0, vy: 0, kicked: false, from: null, ground: false, t: 0, max: q.fuse || PM.fuse, ...q }); return G[G.length - 1]; };   /* (tools/powder-monkey.mjs) */
  H.read = () => ({ grenades: G.map(q => ({ x: Math.round(q.x), y: Math.round(q.y), fuse: +q.fuse.toFixed(2), kicked: q.kicked, rolling: q.ground })), told });
  H.spawn = (base, ent) => ({ ...base, t: 'powdermonkey', w: PM.w, h: PM.h, hp: (ctx.EHP && ctx.EHP.powdermonkey) || PM.hp, maxHp: 0, face: ent.face || -1, mode: 'idle', modeT: 0,
    cd: PM.firstCd, vx: 0, vy: 0, speed: PM.speed, pmFlee: 0 });
  /* ---------- HIM ---------- */
  function fall(e, dt) { e.vy = Math.min(420, (e.vy || 0) + PM.grav * dt); const r = ctx.moveBody(e, 0, e.vy * dt); if (r && r.ground) e.vy = 0; }
  /* he never runs off his deck: the tile ahead under his feet must stand */
  function scurry(e, vx, dt) { const tx = Math.floor((e.x + Math.sign(vx) * (PM.w / 2 + 2)) / T()), ty = Math.floor((e.y + 2) / T());
    if (!ctx.isSolid(tx, ty) && !ctx.oneWay(tx, ty)) return false; if (ctx.isSolid(tx, Math.floor((e.y - 4) / T()))) return false; ctx.moveBody(e, vx * dt, 0); return true; }
  function lob(e, P) { const T0 = PM.lobT, x0 = e.x + e.face * 4, y0 = e.y - 14, tx = P.x - Math.sign(P.x - e.x) * 10, ty = P.y - 2;
    const first = !told; told = true;
    G.push({ x: x0, y: y0, vx: (tx - x0) / T0, vy: (ty - y0) / T0 - 0.5 * PM.grav * T0, fuse: (first ? PM.teachFuse : PM.fuse) + T0, max: (first ? PM.teachFuse : PM.fuse) + T0, kicked: false, from: e, ground: false, teach: first, t: 0 });
    ctx.sound('throw'); if (first) { ctx.number(P.x, P.y - 40, PM_SAY.teach, '#ffd36b'); if (ctx.hint) ctx.hint(PM_SAY.hint); } }
  H.updateFoe = (e, dt) => { const P = ctx.hero(); if (!e.alive) return; e.anim = (e.anim || 0) + dt; fall(e, dt);
    if (checkDrop(e) || e.stagger > 0) { if (e.mode !== 'flee') e.mode = 'idle'; return; }
    e.cd = Math.max(0, (e.cd || 0) - dt); e.modeT -= dt; if (!P) return;
    const d = P.x - e.x, ad = Math.abs(d), sees = !P.dead && ad < PM.sightX && Math.abs(P.y - e.y) < PM.sightY;
    switch (e.mode) {
      case 'idle': if (sees) { e.mode = 'scurry'; e.face = Math.sign(d) || e.face; } return;
      case 'scurry': { if (!sees) { e.mode = 'idle'; return; } e.face = Math.sign(d) || e.face;
        const want = ad < PM.near ? -Math.sign(d) : ad > PM.far ? Math.sign(d) : 0; e.vx = want * PM.speed; if (want) scurry(e, e.vx, dt);
        if (e.cd <= 0 && !e.tokWait && ad > PM.lobMin && ad < PM.lobMax && Math.abs(P.y - e.y) < PM.lobDy) { e.pmDrop = false; e.mode = 'lightTell'; e.modeT = PM.lightTell; e.vx = 0; ctx.number(e.x, e.y - e.h - 8, '!!', '#ff6b6b'); ctx.sound('fuse'); }
        return; }
      case 'lightTell': e.vx = 0; e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { lob(e, P); e.mode = 'lob'; e.modeT = PM.lobRec; e.cd = PM.lobCd; } return;
      case 'lob': if (e.modeT <= 0) { e.mode = 'flee'; e.modeT = PM.fleeT; } return;
      case 'flee': e.face = -Math.sign(d) || e.face; e.vx = e.face * PM.fleeSpeed; scurry(e, e.vx, dt); if (e.modeT <= 0) { e.mode = 'scurry'; e.face = Math.sign(d) || e.face; } return;
      default: e.mode = 'idle'; } };
  /* struck while he holds it lit: it falls at his feet, and he runs */
  function checkDrop(e) { if (e.mode !== 'lightTell' || e.pmDrop || !(!e.alive || e.stagger > 0 || e.broken > 0 || e.knock > 0)) return false; e.pmDrop = true; dropIt(e); if (e.alive) { e.mode = 'flee'; e.modeT = PM.fleeT; } return true; }
  function dropIt(e) { G.push({ x: e.x, y: e.y - 2, vx: 0, vy: -30, fuse: PM.dropFuse, max: PM.dropFuse, kicked: false, from: e, ground: false, t: 0, dropped: true }); ctx.number(e.x, e.y - 22, PM_SAY.dropped, '#8fd160'); e.cd = PM.lobCd; }
  /* ---------- HIS GRENADES ---------- */
  function boom(q) { q.dead = true; ctx.blast(q.x, q.y - 4, PM.blastR, { kicked: q.kicked, from: q.from, grenade: true }); }
  H.update = dt => { const TS = T();
    /* HIT (or KILLED) WHILE HE HOLDS IT LIT: it falls at his feet. Asked here, every frame, not in his own update - a parried, broken, knocked or token-held foe's AI waits, the fuse does not */
    for (const e of ctx.enemies()) if (e.t === 'powdermonkey') checkDrop(e);
    for (const q of G) { if (q.dead) continue; q.t += dt; q.fuse -= dt;
      q.vy = Math.min(420, q.vy + PM.grav * dt);
      if (q.ground && !q.kicked) { const heel = ctx.heel ? ctx.heel(q.x, q.y) || 0 : 0; q.vx += heel * dt; const s = Math.sign(q.vx), m = Math.max(0, Math.abs(q.vx) - PM.rollDecel * dt); q.vx = s * m; }
      const nx = q.x + q.vx * dt, ny = q.y + q.vy * dt, tx = Math.floor(nx / TS);
      if (ctx.isSolid(tx, Math.floor((q.y - 3) / TS))) { if (q.kicked) { q.x = nx - Math.sign(q.vx) * 4; boom(q); continue; } q.vx = -q.vx * PM.bounce; } else q.x = nx;   /* a wall: struck back it blows on it (a barricade too); rolling it bounces */
      const fty = Math.floor(ny / TS), floor = ctx.isSolid(Math.floor(q.x / TS), fty) || (ctx.oneWay(Math.floor(q.x / TS), fty) && q.vy > 0 && Math.floor(q.y / TS) < fty);
      if (floor && q.vy > 0) { q.y = fty * TS; if (!q.ground && !q.kicked) q.vx *= PM.landKeep; q.vy = q.ground ? 0 : -q.vy * 0.25; if (Math.abs(q.vy) < 40) q.vy = 0; q.ground = true; } else { q.y = ny; if (q.vy !== 0) q.ground = false; }
      if (ctx.wet(q.x, q.y - 2)) { q.dead = true; ctx.number(q.x, q.y - 16, PM_SAY.out, '#bfe6f5'); ctx.sound('fizz'); continue; }
      if (q.kicked) { for (const e of ctx.enemies()) { if (!e.alive || e.harmless || e === ctx.boss()) continue;
          if (Math.abs(e.x - q.x) < (e.w || 10) / 2 + PM.contactR && q.y > e.y - (e.h || 14) - 6 && q.y < e.y + 6) { boom(q); break; } } if (q.dead) continue; }
      if (q.fuse <= 0) boom(q);
      if (q.y > (ctx.LH ? ctx.LH() : 1e9) * TS + 40) q.dead = true; }
    G = G.filter(q => !q.dead); };
  /* ---------- A HERO'S BLOW: a grenade struck back (any blow - the sword, a kick, a shield bash) ---------- */
  H.strike = hb => { if (!hb || !G.length) return; const P = ctx.hero(); P.hitSet = P.hitSet || new Set();
    for (const q of G) { if (q.dead || P.hitSet.has(q) || !ctx.overlap(hb, { l: q.x - 7, r: q.x + 7, t: q.y - 12, b: q.y + 2 })) continue; P.hitSet.add(q);
      const dir = (q.from && q.from.alive && !q.kicked ? Math.sign(q.from.x - P.x) : 0) || P.face || Math.sign(q.x - P.x) || 1;
      q.kicked = true; q.vx = dir * PM.kickV; q.vy = PM.kickVy; q.ground = false; q.fuse = Math.max(q.fuse, PM.kickFuse); q.max = Math.max(q.max, q.fuse);
      ctx.sound('clank'); ctx.number(q.x, q.y - 20, PM_SAY.back, '#8fd160'); } };
  /* ---------- DRAWING (GREYBOX) ---------- */
  H.drawFoe = (g, e, cx, cy, time) => { const pose = e.stagger > 0 || (e.hurtT || 0) > 0 ? 'hurt' : e.mode === 'lightTell' ? (e.modeT > PM.lightTell * 0.5 ? 'holdLit' : 'lightTell') : e.mode === 'lob' ? 'lob' : e.mode === 'flee' ? 'flee' : e.mode === 'scurry' && Math.abs(e.vx) > 5 ? 'scurry' : 'idle';
    PMA.drawMonkey(g, Math.round(e.x - cx), Math.round(e.y - cy), e.face || 1, pose, time, (e.flash || 0) > 0); e.pmPose = pose; };
  H.drawOver = (g, cx, cy, time) => { for (const q of G) PMA.drawGrenade(g, q.x - cx, q.y - cy, q.fuse, q.max, time, q.kicked); };
  return H;
}
