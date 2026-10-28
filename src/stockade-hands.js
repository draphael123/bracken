/* src/stockade-hands.js - THE STOCKADE 2 (claude/stockade2, Daniel 10-14: scratch/brief-stockade2-1014.md). main.js owns the world; this owns
   the level's new verbs and the Chieftain's war tower:
     THE CAPTURED HORN  a blower flagged `drops` lets his horn fall when he dies; walk over it and it is yours for the level (a death keeps it).
                        E (INTERACT) BLOWS IT: a told ring of sound, and every camp goblin under you within LURE.r runs to the sound - to the drop of the
                        nearest log pile when one is by you - and stands there looking up for LURE.t (it notices you if you come down among them).
     THE LOG PILES      logs lashed at a walk's edge (ent 'logpile'): one blow on the lashing and they drop, told (a creak, the pile shakes) - every
                        goblin under them is CRUSHED; a hero under them takes a knock. A pile drops once an attempt.
     THE BARRED GATE    L.stockade.gate (T.PORT, barred from inside): a horn blown within GATE.r opens it - its crew (`gateGuard`) come out to
                        the sound. Opened, it stays open for the attempt (main.js's destroyed set).
     THE EXAM           L.stockade.exam: the first time the hero climbs into its box, the three exam blowers (`exam: 1..3`) all wind their
                        horns at once, each with its own draw (EXAM draw[]): the bars are drawn by main.js drawHornTell off e.hornDraw.
     THE DOZER / COOKS  a `dozing` blower does nothing until you are at his back or he is struck; `cook` goblins sit at their fire and the
                        `gateGuard`s stand behind the gate until a horn, a blow or a hero on their floor wakes them.
     THE WAR TOWER      the Chieftain's phase two (src/main.js hurtEnemy0 ENRAGED): he runs to his tower on the dais, climbs it, hauls its two
                        lashings taut and shoots from it (his bow - green). A blow on him up there lands at TOWER.take (B15 floor, told:
                        CUT THE LASHINGS). Strike BOTH pegs and the tower goes over, away from you - he comes down IN THE WRECK, open (x2,
                        his 'planted' read and its quarter cap). The same verb as the log piles: strike the lashing, it drops.
     THE AREAS          L.stockade.areas: a banner names each area as you walk into it (Rootway recipe 1).
   (claude/chief3, Daniel 10-21: "the horn looks cool but the boss doesn't use it; the exploding barrels - there's more we can do")
     HIS WAR HORN       every HORN.every s on the ground he stops and winds the camp's great war horn (a draw bar over him, gold to red): land
                        HORN.hits blows on him before it sounds and it is SILENCED - he chokes on it, open (his 'planted' read, x2, its quarter cap).
                        Let it sound and his CREW (two sprigs) come in at the hall's doors. Blow YOUR captured horn while he winds his and the
                        crew do not come (HORN ANSWERS HORN) - but only a blow on him opens him. Up his war tower he winds it once from the deck:
                        cut a lashing while he does and the lurch knocks it from his lips.
     HIS POWDER         in his club he heaves a POWDER KEG at you (told: !! and the keg over his head, its fuse lit); from his tower every third
                        shot is a keg. A keg's fuse is drawn (a bar that runs down, sparks). Move off, or STRIKE IT: it rolls away from you, lit.
                        A blast that catches him on the ground knocks him down (BLASTED: open, as SILENCED); a blast at his war tower's legs
                        takes BOTH lashings (the tower falls), at one peg that lashing. Kegs chain each other and the level's barrels.
     THE LOOKOUT        L.stockade.lookouts: a horn tower on lashed stakes (the kennels). A blast (or fire) that takes its stilts brings the
                        whole lookout down: the blower on it falls with it, silenced.
   Lines are said through ctx.number with STK_SAY (routed by src/hint-lines.js, tools/hint-shown.mjs). */
import * as SA from './redraw/stockade2_art.js';   /* (claude/stockade2art) the drawn pieces: piles, horn, gate, supports, the war tower */
export const STK_SAY = {
  took: 'HIS HORN IS YOURS: E BLOWS IT', blow: 'THE CAMP RUNS TO ITS HORN', gate: 'THE GATE OPENS TO THEIR HORN', crushed: 'CRUSHED UNDER THE LOGS',
  exam: 'THREE HORNS WIND: CROSS', tower: 'TO THE WAR TOWER', taut: 'CUT THE LASHINGS', lash: 'A LASHING GOES', falls: 'THE TOWER FALLS', wreck: 'IN THE WRECK: CUT HIM',
  woke: 'HE WAKES', noticed: 'THEY SEE YOU', comes: 'HE COMES DOWN',
  chiefHorn: 'HIS WAR HORN: SILENCE IT', silenced: 'SILENCED: CUT HIM', sounded: 'HIS CREW COMES', answered: 'HORN ANSWERS HORN', pulled: 'YOUR HORN SENDS HIS CREW HOME',
  keg: 'POWDER: STRIKE IT BACK', kicked: 'IT ROLLS', blasted: 'BLASTED: CUT HIM', powderTower: 'THE POWDER TAKES THE LASHINGS', lookout: 'THE LOOKOUT COMES DOWN',
  dropped: 'HE DROPS THE HORN', hornOut: 'THE HORN SOUNDS',
};
export const LURE = { r: 15 * 16, ry: 11 * 16, t: 6, cd: 2.4, near: 40, spread: 9, speed: 70, crewSpeed: 125 };
export const PILE = { creak: 0.35, half: 26, dmgHero: 14, shake: 4 };
export const GATE = { r: 16 * 16, delay: 0.5 };
/* (claude/chief3) HIS WAR HORN and HIS POWDER (see the header). draw: the ground wind (s), draw2 at his second wind; hits: blows that silence it;
   first/every/every2: s to the first wind and between winds; open: the SILENCED window (s); crew: what it calls; deckAt/deckDraw: the tower's one wind */
export const HORN = { draw: 3.0, draw2: 2.5, hits: 2, first: 8, every: 17, every2: 14, open: 2.6, crew: ['sprig', 'sprig'], crewMax: 2, deckAt: 3, deckDraw: 3.2 };
/* tell: his heave (s); fuse: from the throw (s); kickMin: a struck keg's fuse at least this; kickV: its roll (px/s); r: the blast; open: BLASTED (s);
   minD: he heaves only past this range; cd: s between his kegs; towerR: a blast this near his tower's legs takes both lashings; deckEvery: every Nth deck shot */
const HORN_BLOW_AT = 0.28;   /* (claude/chief3art) the draw's share spent raising the horn (frame 22); after it he blows (frame 23) */
export const KEG = { tell: 0.8, deckTell: 0.7, flight: 0.85, fuse: 2.7, kickMin: 0.9, kickV: 200, r: 44, open: 2.4, minD: 80, cd: 9, first: 4, towerR: 56, deckEvery: 3 };
/* (claude/chief3) what one blow and one opening can take of him, AFTER every multiplier (the planted x2, a break, a finisher, a riposte) */
export const CAP = { blow: 0.12, window: 0.25 };
export const TOWER = { take: 0.5, climb: 1.1, shotEvery: 1.9, volleyEvery: 4, volleyN: 4, sway: 1.8, pegDx: 4 * 16, fall: 0.7, wreck: 3.2, cap: 40, deck: 5 };
const LURED = new Set(['sprig', 'shield', 'pike', 'brute', 'hound', 'sapper', 'thorn', 'runner']);

export function makeStockadeHands(ctx) {
  const TS = ctx.TS, say = (x, y, k, c) => ctx.number(x, y, STK_SAY[k], c || '#ffd36b');
  let gateAge = 0, Lk = null, S = null, held = false, piles = [], pickups = [], rings = [], gateOpen = false, gateT = 0, cd = 0, examOn = false, banner = null, seenArea = -1, tower = null, tookSaid = false;
  let kegs = [], crew = [], looks = [], st = {}, fx = [], store = null;   /* (claude/chief3art) fx: the blasts being drawn; store: the powder store's rack {x, floor, scorch, n, chainT} */
  const storeFrom = L => { const A0 = L.arena, bs = (L.ents || []).filter(e => e.t === 'barrel' && A0 && e.x * 16 > A0.x0 - 40 * 16 && e.x * 16 < A0.x0), grp = bs.filter(b => bs.some(o => o !== b && Math.abs(o.x - b.x) <= 3));
    return grp.length >= 2 ? { x: (grp.reduce((a, b) => a + b.x, 0) / grp.length) * 16 + 8, floor: (grp[0].y + 1) * 16, scorch: 0, n: 0, chainT: 0 } : null; };   /* (claude/chief3) his powder kegs in the hall, the crew his horn called, the lookouts on stakes */
  const on = () => !!(ctx.L && ctx.L.stockade);
  /* per level load (not per death): the horn you took stays yours, the gate you opened stays open */
  function load() { Lk = ctx.L; S = ctx.L.stockade; held = false; gateOpen = false; gateAge = 0; tookSaid = false; seenArea = -1; reset(); }
  function reset() {
    if (!on()) return; if (Lk !== ctx.L) { Lk = ctx.L; S = ctx.L.stockade; held = false; gateOpen = false; tookSaid = false; seenArea = -1; }
    piles = (ctx.L.ents || []).filter(e => e.t === 'logpile').map(e => ({ id: e.id, x: e.x * TS + 8, y: (e.y + 1) * TS, floor: floorUnder(e.x, e.y + 2), st: 'hung', t: 0, by: 0, vy: 0 }));
    pickups = []; rings = []; cd = 0; gateT = 0; examOn = false; banner = null; kegs = []; crew = []; fx = []; store = storeFrom(ctx.L); st = { horn: 0, sil: 0, snd: 0, keg: 0, kick: 0, blast: 0, ptower: 0 };
    looks = ((S && S.lookouts) || []).map(o => ({ ...o, down: false }));
    const W = ctx.L.arena, T0 = S && S.tower;
    tower = T0 ? { x: T0.x, deck: T0.deck, base: T0.base, foot: T0.foot, pegs: T0.pegs.map(x => ({ x, cut: false, cutT: 0 })), st: 'up', t: 0, dir: 1, fallK: 0 } : null;
    if (W && !T0) tower = null;
  }
  function floorUnder(tx, ty) { for (let y = ty; y < ctx.L.H; y++) if (ctx.solidAt(tx, y)) return y * TS; return ctx.L.H * TS; }
  const hero = () => ctx.P();

  /* ---- THE HORN ---- */
  function dropHorn(e) { e.hornDropped = true; if (held) return; pickups.push({ x: e.x, y: e.y - 6, vy: -80 }); }
  function blow() {
    const P = hero(); if (!held || cd > 0 || !P || P.dead) return false;
    cd = LURE.cd; ctx.sfx.hornBlast && ctx.sfx.hornBlast(); ctx.shake(2);
    rings.push({ x: P.x, y: P.y - 14, t: 0 }, { x: P.x, y: P.y - 14, t: -0.18 }, { x: P.x, y: P.y - 14, t: -0.36 });
    const pile = piles.filter(p => p.st === 'hung' && Math.abs(p.x - P.x) < 6 * TS && p.y >= P.y - 3 * TS).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    const at = pile ? pile.x : P.x; let n = 0;
    for (const e of ctx.enemies()) {
      if (!e.alive || e.dying > 0 || e.maxHp || e.mini || e.elite || e.harmless || !LURED.has(e.t)) continue;
      if (Math.abs(e.x - P.x) > LURE.r || e.y < P.y - 2 * TS || e.y - P.y > LURE.ry) continue;
      e.lureT = LURE.t; e.lureX = at + (((n++ % 3) - 1) * LURE.spread); e.cook = false; e.gateGuard = e.gateGuard && !gateOpen ? 'out' : false; e.emote = 'shock'; e.emoteT = 0.6; e.seenP = true;
    }
    if (S && S.gate && !gateOpen && Math.abs(S.gate.x * TS + 8 - P.x) < GATE.r) gateT = GATE.delay;
    /* (claude/hookpolish) YOUR HORN PULLS HIS CREW AWAY: the war horn has already called them in - your captured horn is the louder call. Every crew goblin
       in the hall turns and runs BACK TO THE DOOR IT CAME IN BY (a hall's crates can't stop a runner going home) and stands there looking up for LURE.t (it notices you
       if you come near, or if struck). He stands alone. */
    { const cb = ctx.boss(), A = ctx.L.arena; let pulled = 0;
      if (cb && cb.alive && cb.t === 'chief' && A) { let fx = 0;
        for (const e of ctx.enemies()) { if (!e.alive || e.dying > 0 || !e.chiefCrew) continue; fx = e.x < (A.x0 + A.x1) / 2 ? A.x0 + 40 : A.x1 - 40; e.lureT = LURE.t; e.lureSp = LURE.crewSpeed; e.lureX = fx; e.emote = 'shock'; e.emoteT = 0.6; e.seenP = true; pulled++; }
        if (pulled) say(cb.x, cb.y - cb.h - 24, 'pulled', '#8fd160'); } }
    /* (claude/chief3) HORN ANSWERS HORN: blown while the Chieftain winds his, his crew do not know which call to answer - nobody comes */
    const ch = ctx.boss(); if (ch && (ch.mode === 'horn' || ch.mode === 'towerHorn') && Math.abs(ch.x - P.x) < LURE.r && !ch.hornAnswered) { ch.hornAnswered = true; say(ch.x, ch.y - ch.h - 22, 'answered', '#8fd160'); }
    say(P.x, P.y - 30, 'blow');
    return true;
  }
  function interact(P) { if (!on() || !held) return false; return blow(); }

  /* ---- held foes: the dozer, the cooks, the gate's crew, the lured ---- */
  function hold(e, dt) {
    if (!on() || !e.alive) return false;
    const P = hero(), dx = P ? P.x - e.x : 999, dy = P ? P.y - e.y : 999;
    if (e.hp0Stk === undefined) e.hp0Stk = e.hp;
    const struck = e.hp < e.hp0Stk || e.stagger > 0;
    if (e.dozing) {
      if (struck || (Math.abs(dx) < 36 && Math.abs(dy) < 30)) { e.dozing = false; say(e.x, e.y - 20, 'woke', '#ff9a5c'); return false; }
      e.vx = 0; e.hornT = 0; e.draw = 0; e.timer = Math.max(e.timer || 0, 0.5); return true;
    }
    if (e.lureT > 0) {
      e.lureT -= dt;
      if (struck || (P && !P.dead && Math.abs(dx) < LURE.near && Math.abs(dy) < 24)) { e.lureT = 0; say(e.x, e.y - 20, 'noticed', '#ff9a5c'); return false; }
      const gx = e.lureX - e.x, sp = Math.max(e.lureSp || LURE.speed, (e.speed || 30) * 1.5);
      e.vx = Math.abs(gx) > 4 ? Math.sign(gx) * sp : 0; if (e.vx) e.face = Math.sign(e.vx);
      e.vy = Math.min(300, (e.vy || 0) + 1000 * dt); const r = ctx.moveBody(e, e.vx * dt, e.vy * dt); if (r && r.ground) e.vy = 0;
      e.anim = (e.anim || 0) + dt; if (!e.vx && P) e.face = Math.sign(dx) || e.face;
      return true;
    }
    if (e.cook || (e.gateGuard === true && !gateOpen)) {
      if (struck || (P && !P.dead && Math.abs(dx) < 64 && Math.abs(dy) < 24)) { e.cook = false; if (e.gateGuard === true) e.gateGuard = 'out'; return false; }
      e.vx = 0; e.vy = Math.min(300, (e.vy || 0) + 1000 * dt); const r = ctx.moveBody(e, 0, e.vy * dt); if (r && r.ground) e.vy = 0; return true;
    }
    return false;
  }

  /* ---- the frame ---- */
  function update(dt) {
    if (!on()) return; if (Lk !== ctx.L) load();
    const P = hero(); cd = Math.max(0, cd - dt);
    for (const r of rings) r.t += dt; rings = rings.filter(r => r.t < 0.9);
    for (const b of fx) b.t += dt; fx = fx.filter(b => b.t < (SA.BLAST_LIFE[b.kind] || 1)); if (store && store.chainT > 0) store.chainT -= dt;   /* (claude/chief3art) the blasts' own clock */
    /* the horns that fall */
    for (const e of ctx.enemies()) if (e.drops && !e.alive && !e.hornDropped) dropHorn(e);
    for (const k of pickups) { if (k.got) continue; k.vy = Math.min(320, k.vy + 900 * dt); const ny = k.y + k.vy * dt, tx = Math.floor(k.x / TS), ty = Math.floor(ny / TS);
      if (k.vy > 0 && (ctx.solidAt(tx, ty) || ctx.oneWay(tx, ty))) { k.y = ty * TS; k.vy = 0; } else k.y = ny;
      if (P && !P.dead && Math.abs(P.x - k.x) < 12 && Math.abs(P.y - k.y) < 20) { k.got = true; held = true; ctx.sfx.pickup && ctx.sfx.pickup(); if (!tookSaid) { tookSaid = true; say(P.x, P.y - 30, 'took'); } } }
    /* the gate */
    if (gateOpen) gateAge += dt;
    if (gateT > 0) { gateT -= dt; if (gateT <= 0 && !gateOpen && S.gate) { gateOpen = true; gateAge = 0; ctx.openCells(S.gate.x, S.gate.y0, S.gate.y1); ctx.sfx.crack && ctx.sfx.crack(); ctx.shake(3); say(S.gate.x * TS + 8, S.gate.y0 * TS, 'gate', '#8fd160');
      for (const e of ctx.enemies()) if (e.gateGuard === true) e.gateGuard = 'out'; } }
    /* the piles */
    const hb = ctx.atkBox();
    for (const p of piles) {
      if (p.st === 'hung' && hb && ctx.overlap(hb, { l: p.x - 9, r: p.x + 9, t: p.y - 22, b: p.y }) && ctx.hitOnce(p)) { p.st = 'creak'; p.t = PILE.creak; ctx.sfx.crack && ctx.sfx.crack(); }
      else if (p.st === 'creak') { p.t -= dt; if (p.t <= 0) { p.st = 'fall'; p.by = p.y; p.vy = 60; ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh(); } }
      else if (p.st === 'fall') { p.vy += 1300 * dt; p.by += p.vy * dt;
        if (p.by >= p.floor) { p.by = p.floor; p.st = 'down'; ctx.shake(PILE.shake); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.dust(p.x, p.floor, 14); let n = 0;
          for (const e of ctx.enemies()) if (e.alive && !e.maxHp && !e.mini && Math.abs(e.x - p.x) < PILE.half && e.y > p.floor - 40 && e.y <= p.floor + 4) { ctx.hurt(e, 999, p.x); n++; }
          if (P && !P.dead && Math.abs(P.x - p.x) < PILE.half - 6 && P.y > p.floor - 30 && P.y <= p.floor + 4) ctx.damage(p.x, PILE.dmgHero, { name: 'THE LOGS' });
          if (n) say(p.x, p.floor - 40, 'crushed', '#8fd160'); } }
    }
    /* the exam */
    if (S && S.exam && !examOn && P && !P.dead) { const tx = P.x / TS, ty = P.y / TS, z = S.exam;
      if (tx >= z.x0 && tx <= z.x1 + 1 && ty >= z.y0 && ty <= z.y1) { examOn = true; say(P.x, P.y - 30, 'exam', '#ff9a5c'); ctx.sfx.hornDraw && ctx.sfx.hornDraw();
        for (const e of ctx.enemies()) if (e.alive && e.exam && !e.blown) { e.examOn = true; e.hornDraw = (z.draw || [])[e.exam - 1] || 8; e.hornT = 0.001; } } }
    /* the area banner */
    if (S && S.areas && P) { const tx = P.x / TS, i = S.areas.findIndex(([, a, b]) => tx >= a && tx < b);
      if (i >= 0 && i !== seenArea) { seenArea = i; banner = { name: S.areas[i][0], t: 2.6 }; } }
    if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
    /* the exam's three horns: wound here, wherever the hero is (a blower off the screen is not updated by main.js), paused while he is staggered */
    if (examOn) for (const e of ctx.enemies()) if (e.alive && e.exam && e.examOn && !e.blown) { if (!(e.stagger > 0)) e.hornT = (e.hornT || 0) + dt; if (e.hornT > (e.hornDraw || 8)) ctx.hornSounds(e); }
    if (tower) towerStep(dt, hb);
    stepKegs(dt, hb, P); stepLooks();
    /* his crew go when he does (the hall burns: they run) */
    if (ctx.enemies().some(e => e.chiefCrew && e.alive) && !ctx.enemies().some(e => e.t === 'chief' && e.alive)) { for (const e of ctx.enemies()) if (e.chiefCrew && e.alive) { e.alive = false; ctx.dust(e.x, e.y, 6); } crew = []; }
  }

  /* ---- (claude/chief3) HIS POWDER: the kegs he heaves, their told fuses, the strike that sends one back ---- */
  function throwKeg(e, tx) {
    const P = hero(), A = ctx.L.arena, sx = e.x + e.face * 6, sy = e.y - e.h - 4, T0 = KEG.flight, ax = Math.max(A.x0 + 12, Math.min(A.x1 - 12, tx + (P ? P.vx * 0.25 : 0)));
    st.keg++; kegs.push({ x: sx, y: sy, vx: (ax - sx) / T0, vy: -300, st: 'fly', fuse: KEG.fuse, rot: 0, own: true });
    ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh();
  }
  function stepKegs(dt, hb, P) {
    if (!kegs.length) return; const A = ctx.L.arena;
    for (const k of kegs) {
      if (k.dead) continue;
      k.fuse -= dt; if (Math.random() < dt * 24) ctx.spark(k.x + 2, k.y - 13);
      if (k.st === 'fly') { k.vy = Math.min(420, k.vy + 900 * dt); const nx = k.x + k.vx * dt, ny = k.y + k.vy * dt, tx = Math.floor(nx / TS), ty = Math.floor(ny / TS);
        if (k.vy > 0 && (ctx.solidAt(tx, ty) || ctx.oneWay(tx, ty))) { k.y = ty * TS; k.x = nx; k.st = 'roll'; k.vx *= 0.3; k.vy = 0; ctx.dust(k.x, k.y, 4); ctx.sfx.thud && ctx.sfx.thud(); }
        else { k.x = nx; k.y = ny; } }
      else { k.x += k.vx * dt; k.vx *= Math.pow(0.45, dt); k.rot += k.vx * dt / 6;
        const ax = Math.floor((k.x + Math.sign(k.vx) * 6) / TS), ay = Math.floor((k.y - 6) / TS); if (k.vx && ctx.solidAt(ax, ay)) k.vx = -k.vx * 0.3;
        if (!ctx.solidAt(Math.floor(k.x / TS), Math.floor(k.y / TS)) && !ctx.oneWay(Math.floor(k.x / TS), Math.floor(k.y / TS))) k.y += 160 * dt; }
      if (A) k.x = Math.max(A.x0 + 6, Math.min(A.x1 - 6, k.x));
      /* STRIKE IT: it rolls away from you, still lit (a short fuse is made a little longer: you had to stand by it to send it) */
      if (k.st !== 'fly' && hb && P && ctx.overlap(hb, { l: k.x - 7, r: k.x + 7, t: k.y - 15, b: k.y + 1 }) && ctx.hitOnce(k)) {
        k.vx = (P.face || 1) * KEG.kickV; k.fuse = Math.max(k.fuse, KEG.kickMin); k.kicked = true; st.kick++; ctx.sparks(k.x, k.y - 8, P.face || 1, 4); ctx.sfx.stone && ctx.sfx.stone(); say(k.x, k.y - 22, 'kicked', '#ffd36b'); }
      if (k.fuse <= 0) { k.dead = true; ctx.explode(k.x, k.y - 6, KEG.r); }
    }
    kegs = kegs.filter(k => !k.dead);
  }
  /* every blast in the level comes here (main.js explode): his kegs chain, he is BLASTED on the ground, his tower's lashings go, a lookout's stilts */
  function blast(x, y, r) {
    if (!on()) return;
    /* (claude/chief3art) THE BLAST'S PICTURE: every blast in the camp is a flash, a fireball, a ring, smoke, flung stakes and a scorch; the powder store's chain is bigger and leaves the rack black; a keg at the war tower's feet throws splinters */
    if (store && Math.abs(x - store.x) < 70 && Math.abs(y - (store.floor - 8)) < 34) { store.n = store.chainT > 0 ? store.n + 1 : 1; store.chainT = 1.2; store.scorch = Math.min(1, store.scorch + 0.34);
      if (store.n === 2) { fx.push(SA.newBlast(store.x, store.floor - 16, 52, 'store')); ctx.shake(7); } }
    if (tower && tower.st === 'manned' && y > tower.deck && Math.abs(x - tower.x) < KEG.towerR) fx.push(SA.newBlast(tower.x, tower.foot - 4, 40, 'legs'));
    fx.push(SA.newBlast(x, y, Math.min(r, 56), 'keg')); if (fx.length > 14) fx.splice(0, fx.length - 14);
    for (const k of kegs) if (!k.dead && k.fuse > 0.15 && Math.hypot(k.x - x, k.y - 7 - y) < r) k.fuse = 0.15;
    const ch = ctx.boss();
    if (ch && !chiefUp(ch) && !['toTower', 'towerFall', 'planted', 'sleep', 'wake'].includes(ch.mode) && Math.abs(ch.x - x) < r + ch.w / 2 && Math.abs(ch.y - 12 - y) < r + 10) {
      if (ch.mode === 'horn') ch.hornCd = ch.phase === 2 ? HORN.every2 : HORN.every; ch.mode = 'planted'; ch.modeT = KEG.open; ch.openHp0 = ch.hp; ch.vx = 0; ch.stagger = Math.max(ch.stagger || 0, 0.3); ch.blastN = (ch.blastN || 0) + 1; ch.poseKind = 'blasted'; st.blast++; say(ch.x, ch.y - ch.h - 12, 'blasted', '#8fd160'); }
    if (tower && tower.st === 'manned' && y > tower.deck) {
      if (Math.abs(x - tower.x) < KEG.towerR) { for (const pg of tower.pegs) if (!pg.cut) cutPeg(pg, true); st.ptower++; say(tower.x, tower.foot - 44, 'powderTower', '#8fd160'); }
      else for (const pg of tower.pegs) if (!pg.cut && Math.abs(pg.x - x) < r + 8) cutPeg(pg, true);
    }
  }
  /* ---- THE LOOKOUT ON STAKES: its stilts gone (a blast, a fire), the whole of it comes down and its blower with it ---- */
  function stepLooks() {
    for (const lo of looks) {
      if (lo.down) continue; let gone = false;
      for (let x = lo.sx0; x <= lo.sx1 && !gone; x++) for (let y = lo.sy0; y <= lo.sy1; y++) if (!ctx.solidAt(x, y)) { gone = true; break; }
      if (!gone) continue;
      lo.down = true; lo.at = undefined; ctx.clearCells(lo.x0, lo.x1, lo.y0, lo.y1); ctx.shake(4); ctx.sfx.crack && ctx.sfx.crack(); ctx.sfx.heavy && ctx.sfx.heavy();
      for (let x = lo.x0; x <= lo.x1; x += 2) ctx.dust(x * TS + 8, (lo.y1 + 1) * TS, 5);
      for (const e of ctx.enemies()) if (e.alive && !e.maxHp && e.x > lo.x0 * TS - 4 && e.x < (lo.x1 + 1) * TS + 4 && e.y < (lo.y1 + 1) * TS - 6 && e.y > (lo.y0 - 2) * TS) { e.blown = true; ctx.hurt(e, 999, e.x); }
      for (const pr of ctx.props()) if (pr.t === 'towertop' && pr.x > lo.x0 * TS - 4 && pr.x < (lo.x1 + 1) * TS + 4) pr.gone = true;
      say(((lo.x0 + lo.x1) / 2) * TS + 8, lo.y0 * TS - 10, 'lookout', '#8fd160');
    }
  }
  /* ---- HIS WAR HORN: the crew it calls ---- */
  function hornSound(e) {
    const A = ctx.L.arena; ctx.sfx.hornBlast && ctx.sfx.hornBlast(); ctx.shake(3);
    rings.push({ x: e.x, y: e.y - e.h, t: 0 }, { x: e.x, y: e.y - e.h, t: -0.2 });
    st.snd++; if (e.hornAnswered) { e.hornAnswered = false; return; }
    crew = crew.filter(q => q.alive); const n = Math.max(0, HORN.crewMax - crew.length); if (!n || !A) { say(e.x, e.y - e.h - 12, 'hornOut', '#ff6b6b'); return; }
    say(e.x, e.y - e.h - 24, 'sounded', '#ff9a5c');
    for (let i = 0; i < n; i++) { const left = i % 2 === 0, x = left ? A.x0 + 48 : A.x1 - 48;   /* (in at the doors, past the fire strips his second wind lights) */ const q = ctx.spawnFoe(HORN.crew[i] || 'sprig', x, A.floor, left ? 1 : -1); if (q) { q.chiefCrew = true; crew.push(q); fx.push(SA.newBlast(x + (left ? -14 : 14), A.floor, 0, 'door')); } }   /* (claude/chief3art) the doors flung open: firelight and dust */
  }
  function chiefCap(e, dmg) {
    const m = e.maxHp || 1; let d = Math.min(dmg, Math.max(1, Math.round(m * CAP.blow)));
    if (e.mode === 'planted' && e.openHp0 !== undefined) d = Math.min(d, Math.max(1, Math.round(e.hp - (e.openHp0 - m * CAP.window))));
    return d;
  }
  /* a blow that lands on him (main.js hurtEnemy0): while he winds the horn each one chokes it - HORN.hits and it is SILENCED, and he is open */
  function chiefHit(e, dmg) {
    if (!tower && !(S && S.tower)) return;
    if (e.mode !== 'horn' || !(dmg > 0)) return;
    e.hornHits = (e.hornHits || 0) + 1;
    if (e.hornHits >= HORN.hits) { e.mode = 'planted'; e.modeT = HORN.open; e.openHp0 = e.hp; e.vx = 0; e.hornCd = e.phase === 2 ? HORN.every2 : HORN.every; e.silencedN = (e.silencedN || 0) + 1; e.poseKind = 'silenced'; st.sil++; ctx.sfx.clank && ctx.sfx.clank(); say(e.x, e.y - e.h - 12, 'silenced', '#8fd160'); }
    else ctx.sparks(e.x + (e.face || 1) * 8, e.y - e.h + 8, e.face || 1, 3);   /* (the pips under his draw bar count the blows still wanted) */
  }

  /* ---- THE CHIEFTAIN'S WAR TOWER ---- */
  function towerStep(dt, hb) {
    for (const pg of tower.pegs) if (pg.cut) pg.cutT += dt;
    const ch = ctx.boss(); if (tower.st === 'fall') { tower.fallK = Math.min(1, tower.fallK + dt / TOWER.fall); return; }
    if (tower.st !== 'manned' || !ch) return;
    for (const pg of tower.pegs) if (!pg.cut && hb && ctx.overlap(hb, { l: pg.x - 8, r: pg.x + 8, t: tower.foot - 16, b: tower.foot }) && ctx.hitOnce(pg)) cutPeg(pg, false);
  }
  function cutPeg(pg, quiet) {
    pg.cut = true; pg.cutT = 0; tower.sway = TOWER.sway; ctx.sfx.crack && ctx.sfx.crack();   /* the tower lurches: he holds on with both hands and does not shoot (the way to the other peg) */ ctx.sparks(pg.x, tower.foot - 8, 1, 5); if (!quiet) say(pg.x, tower.foot - 30, 'lash', '#8fd160');
    const ch = ctx.boss(); if (ch && ch.mode === 'towerHorn') { ch.mode = 'tower'; ch.modeT = 1; ch.hornAnswered = false; ch.silencedN = (ch.silencedN || 0) + 1; st.sil++; say(ch.x, ch.y - ch.h - 22, 'dropped', '#8fd160'); }   /* (claude/chief3) the lurch knocks the horn from his lips */
    if (tower.pegs.every(q => q.cut)) { const P = hero(); tower.dir = Math.sign(tower.x - (P ? P.x : tower.x - 1)) || 1; tower.st = 'fall'; tower.fallK = 0; say(tower.x, tower.deck - 40, 'falls', '#ff9a5c'); ctx.sfx.roar && ctx.sfx.roar(); }
  }
  /* the boss calls: main.js updateChief asks first, hurtEnemy0 tells it the phase came */
  function chiefPhase2(e) { if (!tower || tower.st !== 'up') return; e.towerGo = true; }
  function chiefStep(e, dt, A) {
    if (!tower) return false;
    /* (claude/chief3) HIS WAR HORN and HIS POWDER on the ground: from a walk, the horn when it is due, a keg in his club at range */
    if (e.mode === 'sleep' || e.mode === 'wake') return false;
    if (e.hornCd === undefined) { e.hornCd = HORN.first; e.kegCd = KEG.first; }
    const up = chiefUp(e) || ['toTower', 'towerFall', 'towerHorn', 'towerKeg'].includes(e.mode);
    if (!up) { e.hornCd -= dt; e.kegCd -= dt; }
    { const P = hero(), gm = e.mode;
      if (!up && gm === 'walk' && e.modeT <= 0 && !e.towerGo && P && !P.dead) {
        if (e.hornCd <= 0) { e.mode = 'horn'; e.modeT = e.phase === 2 ? HORN.draw2 : HORN.draw; e.hornDraw = e.modeT; e.hornHits = 0; e.hornAnswered = false; e.vx = 0; st.horn++; e.face = Math.sign(P.x - e.x) || e.face; say(e.x, e.y - e.h - 22, 'chiefHorn', '#ffd36b'); ctx.sfx.hornDraw && ctx.sfx.hornDraw(); }
        else if (e.stance === 'club' && e.kegCd <= 0 && Math.abs(P.x - e.x) > KEG.minD && !kegs.some(k => k.own && !k.dead)) { e.mode = 'kegTell'; e.modeT = KEG.tell; e.vx = 0; e.face = Math.sign(P.x - e.x) || e.face; ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); say(e.x, e.y - e.h - 22, 'keg', '#ff9a5c'); ctx.sfx.charge && ctx.sfx.charge(); }
      }
      const still = () => { e.vx = 0; e.vy = Math.min(400, (e.vy || 0) + 1000 * dt); const r = ctx.moveBody(e, 0, e.vy * dt); if (r && r.ground) e.vy = 0; e.anim += dt; e.modeT -= dt; };
      if (e.mode === 'horn') { still(); if (P) e.face = Math.sign(P.x - e.x) || e.face;
        if (e.modeT <= 0) { hornSound(e); e.mode = 'walk'; e.modeT = 0.6; e.hornCd = e.phase === 2 ? HORN.every2 : HORN.every; } return true; }
      if (e.mode === 'kegTell') { still(); if (P) e.face = Math.sign(P.x - e.x) || e.face;
        if (e.modeT <= 0) { throwKeg(e, P ? P.x : e.x + e.face * 100); e.mode = 'kegThrow'; e.modeT = 0.35; e.kegCd = KEG.cd; } return true; }
      if (e.mode === 'kegThrow') { still(); if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; } return true; } }
    if (e.towerGo && tower.st === 'up') { e.towerGo = false; tower.st = 'run'; e.mode = 'toTower'; e.modeT = 4; e.vx = 0; say(e.x, e.y - e.h - 12, 'tower', '#ff6b6b'); ctx.sfx.chiefBark && ctx.sfx.chiefBark(); }
    const m = e.mode;
    if (m === 'toTower') { const d = tower.x - e.x; e.face = Math.sign(d) || e.face; e.vx = Math.abs(d) > 6 ? e.face * 96 : 0; e.vy = Math.min(400, (e.vy || 0) + 1000 * dt);
      const r = ctx.moveBody(e, e.vx * dt, e.vy * dt); if (r && r.ground) e.vy = 0; e.anim += dt; e.modeT -= dt;
      if (Math.abs(d) <= 4 * TS || e.modeT <= 0) { e.mode = 'towerClimb'; e.modeT = TOWER.climb; e.vx = 0; e.y0Climb = e.y; e.x0Climb = e.x; } return true; }   /* (from the foot of the dais: he swings up onto it and climbs) */
    if (m === 'towerClimb') { e.modeT -= dt; e.anim += dt; const k = 1 - Math.max(0, e.modeT) / TOWER.climb; e.y = e.y0Climb + (tower.deck - e.y0Climb) * k; e.x = e.x0Climb + (tower.x - e.x0Climb) * Math.min(1, k * 2);
      if (e.modeT <= 0) { e.y = tower.deck; e.mode = 'tower'; e.modeT = 0.8; e.towerT = 0; e.stance = 'bow'; tower.st = 'manned'; e.shotN = 0; say(e.x, e.y - e.h - 12, 'taut', '#ffd36b'); ctx.sfx.clank && ctx.sfx.clank(); } return true; }
    if (m === 'tower' || m === 'towerAim' || m === 'towerLoose' || m === 'towerHorn' || m === 'towerKeg') {
      e.x = tower.x; e.y = tower.deck; e.vx = 0; e.vy = 0; e.anim += dt; e.towerT += dt; e.modeT -= dt; const P = hero(); if (P) e.face = Math.sign(P.x - e.x) || e.face;
      if (tower.st === 'fall') { e.mode = 'towerFall'; e.modeT = TOWER.fall; e.fx0 = e.x; return true; }
      if (e.towerT > TOWER.cap) { tower.st = 'down'; e.mode = 'walk'; e.modeT = 0.6; e.y = A.floor; e.stance = 'club'; say(e.x, e.y - e.h - 12, 'comes', '#ffd36b'); return true; }   /* (a safety, never the answer: 40 s up there and he climbs down) */
      if (tower.sway > 0) { tower.sway -= dt; if (m !== 'tower') e.mode = 'tower'; e.modeT = Math.max(e.modeT, 0.5); return true; }
      /* (claude/chief3) THE DECK HORN, once: cut a lashing while he winds it (cutPeg) and the lurch knocks it from his lips */
      if (m === 'towerHorn') { if (e.modeT <= 0) { hornSound(e); e.mode = 'tower'; e.modeT = 0.8; } return true; }
      if (m === 'towerKeg') { if (e.modeT <= 0) { if (P) throwKeg(e, P.x); e.mode = 'towerLoose'; e.modeT = 0.3; } return true; }
      if (m === 'tower' && e.modeT <= 0 && !e.deckHorn && e.towerT > HORN.deckAt) { e.deckHorn = true; st.horn++; e.mode = 'towerHorn'; e.modeT = HORN.deckDraw; e.hornDraw = HORN.deckDraw; e.hornAnswered = false; say(e.x, e.y - e.h - 22, 'chiefHorn', '#ffd36b'); ctx.sfx.hornDraw && ctx.sfx.hornDraw(); return true; }
      if (m === 'tower' && e.modeT <= 0 && (e.shotN + 1) % KEG.deckEvery === 0 && (e.shotN + 1) % TOWER.volleyEvery !== 0 && !kegs.some(k => k.own && !k.dead)) { e.shotN++; e.mode = 'towerKeg'; e.modeT = KEG.deckTell; ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); ctx.sfx.charge && ctx.sfx.charge(); return true; }
      if (m === 'tower' && e.modeT <= 0) { e.shotN++; if (e.shotN % TOWER.volleyEvery === 0) { e.mode = 'towerAim'; e.volley = true; e.modeT = 0.75; ctx.number(e.x, e.y - e.h - 12, '^^', '#8fd160'); } else { e.mode = 'towerAim'; e.volley = false; e.modeT = 0.6; ctx.number(e.x, e.y - e.h - 12, '^', '#8fd160'); } ctx.sfx.bow && ctx.sfx.bow(); }
      else if (m === 'towerAim' && e.modeT <= 0) { e.mode = 'towerLoose'; e.modeT = 0.25; if (P) { if (e.volley) ctx.volley(e, P.x, TOWER.volleyN); else ctx.arrow(e, P.x, P.y - 8); } }
      else if (m === 'towerLoose' && e.modeT <= 0) { e.mode = 'tower'; e.modeT = TOWER.shotEvery; }
      return true; }
    if (m === 'towerFall') { e.modeT -= dt; const k = 1 - Math.max(0, e.modeT) / TOWER.fall; e.x = e.fx0 + tower.dir * k * 3 * TS; e.y = tower.deck + (A.floor - tower.deck) * k * k;
      if (e.modeT <= 0) { e.x = Math.max(A.x0 + 14, Math.min(A.x1 - 14, e.x)); e.y = A.floor; e.vy = 0; tower.st = 'down'; ctx.shake(8); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.dust(e.x, A.floor, 18);
        for (const q of ctx.enemies()) if (q.alive && q !== e && !q.maxHp && Math.abs(q.x - (tower.x + tower.dir * 2 * TS)) < 3 * TS && q.y > A.floor - 30) ctx.hurt(q, 999, tower.x);
        e.mode = 'planted'; e.modeT = TOWER.wreck; e.openHp0 = e.hp; e.stance = 'club'; e.wreck = true; say(e.x, e.y - e.h - 12, 'wreck', '#8fd160'); } return true; }
    return false;
  }
  const chiefUp = e => !!(tower && e && (e.mode === 'tower' || e.mode === 'towerAim' || e.mode === 'towerLoose' || e.mode === 'towerClimb' || e.mode === 'towerHorn' || e.mode === 'towerKeg'));
  /* a blow on him on the tower: the B15 floor, told */
  function towerTake(e, tag) { if (!chiefUp(e)) return 1; ctx.turned(e, hero() ? hero().x : e.x, STK_SAY.taut); return TOWER.take; }

  /* ---- drawing (claude/stockade2art: src/redraw/stockade2_art.js) ---- */
  function drawWorld(g, cx, cy, time) {
    if (!on()) return;
    for (const p of piles) SA.drawPile(g, p, cx, cy, time);
    for (const k of pickups) if (!k.got) SA.drawHornPickup(g, k, cx, cy, time);
    if (S && S.gate) SA.drawGate(g, S.gate, cx, cy, { open: gateOpen, age: gateAge, lifting: gateT > 0 ? 1 - gateT / GATE.delay : 0 }, time);
    for (const e of ctx.enemies()) if (e.alive && e.dozing) SA.drawZs(g, Math.round(e.x - cx), Math.round(e.y - e.h - cy), time);   /* the dozing blower's Zs */
    if (tower) SA.drawWarTower(g, tower, cx, cy, time);
    for (const lo of looks) if (lo.down) { if (lo.at === undefined) lo.at = time; SA.drawLookFall(g, lo, cx, cy, time - lo.at); }   /* (claude/chief3art) the lookout's stilts topple, its deck breaks and drops, then the heap stays */
    for (const k of kegs) drawKeg(g, k, cx, cy, time);
  }
  /* (claude/chief3art) behind the props: the powder store's rack, tarp, spare kegs and sacks */
  function drawBack(g, cx, cy, time) { if (!on() || !store) return; SA.drawStoreBack(g, store.x, store.floor, store.scorch, cx, cy); }
  /* (claude/chief3art) a camp barrel in the Stockade IS a powder keg: its hoops and red burst, a cord that burns down, a roll */
  function drawBarrel(g, pr, cx, cy, time) {
    const x = Math.round(pr.x) - cx, y = Math.round(pr.y) - cy, lit = pr.fuse > 0, k = lit ? Math.max(0, Math.min(1, pr.fuse / 1.6)) : undefined;
    SA.drawPowderKeg(g, x, y, pr.x0 !== undefined ? (pr.x - pr.x0) / 6 : 0, k, time); if (lit) SA.drawFuseBar(g, x, y - 21, k, time);
  }
  /* (claude/chief3art) the keg he heaves: the powder keg, spinning in flight, its cord burning; the told fuse above it */
  function drawKeg(g, k, cx, cy, time) {
    const x = Math.round(k.x - cx), y = Math.round(k.y - cy); if (k.st === 'fly') k.rot = (k.rot || 0) + 0.18 * (k.vx >= 0 ? 1 : -1);
    SA.drawPowderKeg(g, x, y, k.rot || 0, k.fuse / KEG.fuse, time); SA.drawFuseBar(g, x, y - 21, k.fuse / KEG.fuse, time);
  }
  /* (claude/chief3art) his war horn's draw bar (and the note arcs from the bell), the keg heaved over his head, the cough / stars of a silenced or blasted Chieftain */
  function drawChief(g, e, cx, cy, time) {
    const x = Math.round(e.x - cx), fy = Math.round(e.y - cy), top = Math.round(e.y - e.h - cy), f = e.face || 1;
    if (e.mode === 'horn' || e.mode === 'towerHorn') {
      const k = 1 - Math.max(0, e.modeT) / (e.hornDraw || HORN.draw), y = Math.max(30, fy - 74);
      SA.drawHornBar(g, x, y, k, e.mode === 'horn' ? (e.hornHits || 0) : 0, e.mode === 'horn' ? HORN.hits : 0, time);
      if (k >= HORN_BLOW_AT) SA.drawChiefFx(g, 'blow', x, fy, f, k, time);
    }
    if (e.mode === 'planted' && e.poseKind) SA.drawChiefFx(g, e.poseKind, x, fy, f, 0, time);
    if (e.mode === 'kegTell' || e.mode === 'towerKeg') { const kx = x + f * 9, ky = fy - 44; SA.drawPowderKeg(g, kx, ky, 0, 1, time); SA.drawFuseBar(g, kx, ky - 22, 1, time); }   /* the keg in both hands, overhead (his frame 25) */
  }
  /* the Chieftain's frame on the tower (src/main.js): the climb, the hold-on, the deck's wait / aim / loose, the fall - or -1 (his own frame) */
  function chiefFrame(e) {
    if (!tower) return -1; const m = e.mode;
    /* (claude/chief3art) the silenced / blasted openings are his own poses (24 choked, 27 sat down scorched) while the opening lasts */
    if (m !== 'planted') e.poseKind = null; else if (e.poseKind === 'silenced') return 24; else if (e.poseKind === 'blasted') return 27;
    if (m === 'towerClimb') return Math.floor((e.anim || 0) * 6) % 2 ? 15 : 16;
    if (m === 'towerFall') return 19;
    if (m === 'tower' || m === 'towerAim' || m === 'towerLoose') return tower.sway > 0 ? 17 : m === 'towerAim' ? 18 : m === 'towerLoose' ? 20 : 21;
    /* (claude/chief3art, B16) his OWN poses: the horn wound up the chest (22) and blown, head back (23); the keg in both hands overhead (25) and the throw (26) */
    if (m === 'horn' || m === 'towerHorn') return 1 - Math.max(0, e.modeT) / (e.hornDraw || HORN.draw) < HORN_BLOW_AT ? 22 : 23;
    if (m === 'kegTell' || m === 'towerKeg') return 25; if (m === 'kegThrow') return 26;
    return -1;
  }
  function drawOver(g, cx, cy, time) {
    if (!on()) return;
    if (tower) SA.drawWarTowerFront(g, tower, cx, cy, time);
    { const ch = ctx.boss(); if (ch) drawChief(g, ch, cx, cy, time); }
    for (const b of fx) SA.drawBlast(g, b, cx, cy);   /* (claude/chief3art) the blasts, over the sprites */
    for (const r of rings) { if (r.t < 0) continue; const k = r.t / 0.9; g.globalAlpha = 0.7 * (1 - k); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(Math.round(r.x - cx), Math.round(r.y - cy), 10 + k * 70, 0, 7); g.stroke(); g.globalAlpha = 1; }
    const P = hero(); if (held && P && !P.dead) SA.drawBeltHorn(g, Math.round(P.x - cx), Math.round(P.y - P.h - cy) - 8, cd <= 0);   /* the horn at his belt: lit when it will blow */
    if (banner) { const a = Math.min(1, banner.t / 0.4, (2.6 - banner.t) / 0.3); g.globalAlpha = Math.max(0, a); ctx.text(banner.name, Math.round(ctx.VW() / 2), 30, '#e8dcc0', 'center', 8); g.globalAlpha = 1; }
  }
  /* for the bots and the checks */
  const read = () => ({ held, gateOpen, examOn, piles: piles.map(p => ({ id: p.id, x: p.x, y: p.y, st: p.st })), pickups: pickups.filter(k => !k.got).map(k => ({ x: k.x, y: k.y })), cd,
    tower: tower ? { x: tower.x, deck: tower.deck, foot: tower.foot, st: tower.st, pegs: tower.pegs.map(p => ({ x: p.x, cut: p.cut })) } : null, banner: banner && banner.name,
    kegs: kegs.filter(k => !k.dead).map(k => ({ x: k.x, y: k.y, st: k.st, fuse: k.fuse, kicked: !!k.kicked })), crew: crew.filter(q => q.alive).length, stats: { ...st }, looks: looks.map(l => ({ x0: l.x0, x1: l.x1, down: l.down })) });
  /* for the shared guide (src/stuck-guide.js `is`): the horn, the gate, the war tower */
  const state = n => n === 'stkHorn' ? (held ? 'held' : 'none') : n === 'stkGate' ? (gateOpen ? 'open' : 'shut') : n === 'stkTower' ? (tower ? tower.st : 'none') : '';
  /* and as props the guide's done / when read: each pile carries the horn's and the gate's state (the static tool finds the piles in L.ents) */
  const props = () => piles.map(p => ({ t: 'logpile', x: p.x, y: p.y, held, gateOpen, down: p.st !== 'hung' }));
  return { on, state, props, reset, load, update, hold, interact, blow, drawWorld, drawBack, drawBarrel, drawOver, chiefPhase2, chiefStep, chiefUp, chiefFrame, towerTake, read, give: () => { held = true; }, blast, chiefHit, chiefCap, throwKeg };
}
