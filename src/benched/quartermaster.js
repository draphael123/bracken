// ===== BENCHED (claude/flotilla2, 2026-10-17): UNWIRED - THE QUARTERMASTER, the old boss of THE FLOTILLA. Saved as text for a future mini (a deck-climbing duelist). =====
// Daniel 10-16 (interview, scratch/brief-flotilla2.md '!! 10-16'): the Flotilla's boss becomes THE ADMIRAL'S CHAMPION (src/admirals-champion.js); THE QUARTERMASTER IS CUT.
// Nothing imports this file. It is her fight exactly as src/main.js ran it (claude/keyscore's B13/B15 duelist: her EN GARDE wall, the cannon breaking her deck guard,
// her climb deck to deck cutting the lines, and the main deck falling away in her last phase), lifted out of main.js verbatim - so it still names main.js globals
// (L, P, LW, TS, SFX, DMG, number, parts, seeds, tileSpr, isSolid, damagePlayer...). To bring her back, wire her as she was (git log -S updateQuarter -- src/main.js:
// her spawn case, EHP.quarter 1150, DMG.quarterSlash/quarterRiposte/quarterShot, the round shot's guard break in updateBalls, her frames in drawEnemies, the bar name,
// boss-read GUARD 'wall', boss-greed OPEN_RULE/FULL_DAMAGE, the lab's walker branch) and give her a ship. Her sprites stay in src/redraw/pirates.js (bakeQuarter);
// her music key 'quartermaster' stays in src/audio.js (the Sound Test lists it; THE ADMIRAL'S CHAMPION does not use it - see the lane report's music section).
/* eslint-disable */
// THE QUARTERMASTER. She will not stand and fight on one deck. She holds the main deck while she can, and when she
// has had enough she goes up - to the quarterdeck, then to the poop - and cuts away the rigging she came up by, so
// every phase you have to find a new way to her. On the last one she cuts the ship herself: the main deck falls away
// plank by plank from the bow, and there is nowhere left but up. Her cutlass is a wide swing you can block; the
// pistol is aimed, slow, and unblockable, so move; and the moment she puts her blade into a line she is wide open.
function qDeck(e) { const D = (L.arena.decks || [])[e.deck] || L.arena.decks[0]; return { y: D[0], x0: D[1] * TS, x1: D[2] * TS }; }
function cutLine(e, k) {
  const c = (L.arena.cuts || [])[k]; if (!c) return;
  const [x0, x1, y0, y1] = c;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * LW + x; if (L.grid[i] !== T.AIR) { L.grid[i] = T.AIR; tileSpr[i] = null;
    parts.push({ x: x * TS + 8, y: y * TS + 8, vx: (Math.random() - 0.5) * 60, vy: -40 - Math.random() * 60, life: 1.2, max: 1.2, col: Math.random() < 0.5 ? '#c9b27c' : '#8a7a54', size: 2, grav: 260 }); } }
  SFX.crack(); shakeCam(4); number(e.x, e.y - 40, 'SHE CUT THE LINE', '#ff9a5c');
}

function updateQuarter(e, dt) {
  const A = L.arena; e.modeT -= dt; e.anim += dt;
  const D = qDeck(e), floor = D.y, d = P.x - e.x, ad = Math.abs(d), sameDeck = Math.abs(P.y - floor) < 30;
  if (e.mode === 'sleep') { e.y = floor; return; }
  if (e.phase === 1 && e.hp < e.maxHp * 0.66) { e.phase = 2; e.mode = 'leap'; e.modeT = 0.7; e.deckTo = 1; SFX.pJump(); number(e.x, e.y - 40, 'SHE GOES UP', '#ffd36b'); }
  if (e.phase === 2 && e.hp < e.maxHp * 0.33) { e.phase = 3; e.mode = 'leap'; e.modeT = 0.7; e.deckTo = 2; SFX.pJump(); number(e.x, e.y - 40, 'SHE CUTS THE SHIP', '#ff6b6b'); }
  const p3 = e.phase >= 3;
  if (e.guard) { e.guardT -= dt; if (e.guardT <= 0) { e.guard = false; number(e.x, e.y - 36, 'HER GUARD DROPS', '#8fd160'); }
    if (Math.random() < dt * 12) parts.push({ x: e.x + (Math.random() - 0.5) * 20, y: e.y - 10 - Math.random() * 20, vx: 0, vy: -14, life: 0.4, max: 0.4, col: '#c9d1dc', size: 1, grav: 0 }); }
  let want = 0;
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { e.mode = 'stride'; e.modeT = 1; } break;
    case 'stride': { e.face = Math.sign(d) || e.face;
      e.slashT -= dt; e.shotT -= dt; e.stanceT = (e.stanceT === undefined ? 5 : e.stanceT) - dt;
      if (sameDeck && ad < 200) want = ad > 34 ? e.face * (p3 ? 92 : 74) : -e.face * 40; else want = Math.sign((P.x < D.x0 ? D.x0 : P.x > D.x1 ? D.x1 : P.x) - e.x) * 60;
      if (sameDeck && ad < 56 && e.stanceT <= 0 && !e.guard) { e.stanceT = p3 ? 5 : 7; e.mode = 'stanceTell'; e.modeT = 0.9; e.flash = 0; number(e.x, e.y - 46, '!!', '#ff6b6b'); number(e.x, e.y - 34, 'EN GARDE', '#ff9a5c'); SFX.enGarde(); }
      else if (sameDeck && ad < 42 && e.slashT <= 0) { e.mode = 'slashTell'; e.modeT = p3 ? 0.3 : 0.42; e.slashT = p3 ? 1.5 : 2.2; number(e.x, e.y - 34, '!', '#ffd36b'); SFX.charge(); }
      else if (e.shotT <= 0 && ad < 300 && (ad > 40 || !sameDeck)) { e.mode = 'shootTell'; number(e.x, e.y - e.h - 24, '!!', '#ff6b6b'); e.modeT = p3 ? 0.45 : 0.6; e.shotT = p3 ? 2 : 2.8; e.aimY = P.y - 9; number(e.x, e.y - 34, 'TAKING AIM', '#ff9a5c'); }
      break; }
    case 'slashTell': if (e.modeT <= 0) { e.mode = 'slash'; e.modeT = 0.3; SFX.foeSlash(); e.vx = e.face * 130;
      if (!P.dead && Math.sign(d) === e.face && ad < 46 && Math.abs(P.y - e.y) < 28) { const res = damagePlayer(e.x, DMG.quarterSlash); if (res === 'blocked') { e.mode = 'reel'; e.modeT = 0.9; e.stagger = 0.9; number(e.x, e.y - 34, 'PARRIED', '#8fd160'); } else if (res === 'hit') { P.vx = e.face * 240; P.vy = -120; } } } break;
    case 'slash': if (e.modeT <= 0) { e.mode = 'stride'; e.modeT = 0.5; } break;
    /* EN GARDE. She stops and offers you the blade. Cut into it and she answers, and nothing turns her answer; wait her out
       and the point drops, and that cut is free. */
    case 'stanceTell': { e.vx = 0; e.face = Math.sign(d) || e.face;
      if (e.flash > 0.02 && !P.dead) { e.mode = 'riposte'; e.modeT = 0.35; e.ripostes = (e.ripostes || 0) + 1; SFX.riposte(); shakeCam(3); sparks(e.x + e.face * 10, e.y - 16, e.face, 6);
        if (Math.sign(d) === e.face && ad < 58 && Math.abs(P.y - e.y) < 30) { const res = damagePlayer(e.x, DMG.quarterRiposte, { unblockable: true }); if (res === 'hit') { P.vx = e.face * 260; P.vy = -120; number(P.x, P.y - 28, 'RIPOSTE', '#ff6b6b'); } }
        break; }
      if (e.modeT <= 0) { e.mode = 'reel'; e.modeT = 0.7; e.stagger = 0.7; number(e.x, e.y - 34, 'THE POINT DROPS', '#8fd160'); } break; }
    case 'riposte': if (e.modeT <= 0) { e.mode = 'stride'; e.modeT = 0.5; } break;
    case 'shootTell': { e.face = Math.sign(d) || e.face; e.vx = 0;
      if (Math.random() < dt * 30) parts.push({ x: e.x + e.face * 10, y: e.y - 14, vx: 0, vy: -20, life: 0.3, max: 0.3, col: '#ffd36b', size: 1, grav: 0 });
      if (e.modeT <= 0) { e.mode = 'shoot'; e.modeT = 0.4; SFX.crack(); shakeCam(2); flash = Math.max(flash, 0.06);
        const sx = e.x + e.face * 12, sy = e.y - 14, ty = e.aimY !== undefined ? e.aimY : P.y - 9, dd = Math.hypot(P.x - sx, ty - sy) || 1;
        seeds.push({ x: sx, y: sy, vx: (P.x - sx) / dd * 430, vy: (ty - sy) / dd * 430, g: 0, life: 1.4, shot: true, unblockable: true });
        for (let i = 0; i < 8; i++) parts.push({ x: sx, y: sy, vx: e.face * (60 + Math.random() * 120), vy: (Math.random() - 0.5) * 60, life: 0.35, max: 0.35, col: Math.random() < 0.5 ? '#fff6e0' : '#9aa39a', size: 2, grav: 20 }); } break; }
    case 'shoot': if (e.modeT <= 0) { e.mode = 'stride'; e.modeT = 0.6; } break;
    case 'leap': { e.vx = 0; const to = qDeck({ deck: e.deckTo }), k = 1 - Math.max(0, e.modeT) / 0.7;
      if (e.lx0 === undefined) { e.lx0 = e.x; e.ly0 = e.y; }
      // UP HER OWN RIGGING, ALONG, AND DOWN. A straight line from her feet to the deck above goes through
      // whatever stands between, which on the main deck is the companion house.
      const lx = Math.max(to.x0 + 24, Math.min(to.x1 - 24, e.lx0 + 40)), hiY = to.y - 34;
      const cl = (v) => Math.max(0, Math.min(1, v));
      const up = cl(k / 0.35), along = cl((k - 0.3) / 0.5), down = cl((k - 0.8) / 0.2);
      e.y = e.ly0 + (hiY - e.ly0) * up + (to.y - hiY) * down;
      e.x = e.lx0 + (lx - e.lx0) * along;
      if (e.modeT <= 0) { e.deck = e.deckTo; e.x = lx; e.y = qDeck(e).y; e.lx0 = undefined; e.mode = 'cut'; e.modeT = 0.9; SFX.thud(); } break; }
    case 'cut': { e.vx = 0; if (e.modeT <= 0) { cutLine(e, e.deck - 1); e.mode = 'stride'; e.modeT = 0.8;
        e.guard = true; e.guardT = 16; number(e.x, e.y - 40, 'HER GUARD IS UP: GO ROUND HER, OR BRING A GUN TO BEAR', '#ff9a5c'); SFX.clank();
        if (p3) { L.deckFall = { x: A.fallFrom !== undefined ? A.fallFrom : A.x1 / TS - 2, row: Math.floor(A.floor / TS), t: 0 }; number(e.x, e.y - 44, 'THE DECK IS GOING', '#ff6b6b'); } } break; }
    case 'reel': if (e.modeT <= 0) { e.mode = 'stride'; e.modeT = 0.6; } break;
    case 'dead': return;
  }
  if (e.stagger > 0) want = 0;
  e.vx += (want - e.vx) * Math.min(1, dt * 8);
  if (e.mode !== 'leap') {
    const nx = e.x + e.vx * dt, dirq = Math.sign(e.vx) || e.face;
    // the ship is in her way like it is in yours: the companion house at the middle of the main deck stops her
    const tx = Math.floor((nx + dirq * 9) / TS), ty0 = Math.floor((floor - 26) / TS), ty1 = Math.floor((floor - 6) / TS);
    let blocked = false; for (let ty = ty0; ty <= ty1; ty++) if (isSolid(tx, ty)) blocked = true;
    if (blocked) { e.vx = 0; } else e.x = nx;
    e.x = Math.max(D.x0 + 10, Math.min(D.x1 - 10, e.x)); e.y = floor;
  }
}
// the main deck going: one plank at a time from the bow, until there is nothing under you but the sea
function updateDeckFall(dt) {
  const F = L.deckFall; if (!F) return;
  F.t -= dt; if (F.t > 0) return; F.t = 0.55;
  const row = F.row; let done = true;
  for (let k = 0; k < 3; k++) { const x = F.x - k; if (x < Math.floor(L.arena.x0 / TS)) break;
    for (let y = row; y <= row + 1; y++) { const i = y * LW + x; if (L.grid[i] === T.SOLID) { done = false; L.grid[i] = T.AIR; tileSpr[i] = null; // planking only: the ladders and rails stay, or there would be no way up
      for (let q = 0; q < 3; q++) parts.push({ x: x * TS + 8, y: y * TS + 8, vx: (Math.random() - 0.5) * 40, vy: 30, life: 1.4, max: 1.4, col: Math.random() < 0.5 ? '#c9b27c' : '#6a5a44', size: 2, grav: 300 }); } } }
  F.x -= 3; SFX.crack(); shakeCam(2);
  if (F.x < (L.arena.fallTo !== undefined ? L.arena.fallTo : Math.floor(L.arena.x0 / TS)) || done) L.deckFall = null; // the deck stops going where the level says: the way up has to survive
}
