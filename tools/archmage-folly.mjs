/* tools/archmage-folly.mjs — THE ARCHMAGE, HARDER (claude/archmage2; Daniel, 2026-09-29: "the Archmage fight is a bit too easy").
   The Mage's Folly's boss (id 'archmage'; tools/archmage-pilot.mjs and archmage-rings.mjs are the OTHER archmage, the Falling
   Tower's undead one). Four decisions, each proved in the page on a real fight, and every assertion SOFT and printed, so a run on
   the old code lists everything it does not do:
     1. THE WARD FIGHTS BACK   his third rune sits on a stack of books that rises out of the floor at an end of the room: sealed in
                               the books until the stack's own rune (at its foot) is struck and the stack slides down into the
                               floor. From the first rune cut the rest have a few seconds, counted down; then every cut rune seals
                               again and the stack rises again. Cut all three in time and he is open.
     2. THE ROOM ATTACKS       in each room he rewrites, told (a mark over him, a mark where it lands, an answer tag): THE FLOOD
                               brings a stack down on you (red, dodge - a shield does not help), THE ORRERY throws the flying books
                               (yellow, block - the shield turns them), TURNED OVER opens a glyph under you that takes you standing
                               or mid-jump (red, dodge) and turns you back over a breath later - never a fall to your death.
     3. PAIRED SPELLS          from his second stage, a red circle on you and a yellow one a stride aside, together; never in the
                               duel; never unanswerable - the far side is clear and a jump straight up clears both.
     4. A SHORTER OPENING      two clean blows and he recovers, in a window of about two and a half seconds.
   And his health is what it was (no bloat).
   claude/folly3 (Daniel played him, 2026-09-29: "he is too easy"):
     5. THE MIRRORS            a new stage at 30%: the room put right, two images of him that cast with him - only his own tell
                               is coloured, theirs grey and harmless - an image struck breaks and is back at his next ward; the
                               ward reseals in 4 s there (6 s in the duel still); one apprentice through a told portal each
                               ward, never a second while the first stands, with an apprentice's health; openings x3 again.
   node tools/archmage-folly.mjs          (PORT from tools/ports.mjs) */
import { MARK, ANSWER } from '../src/marks.js';
import { openPage } from './cdp.mjs';
import { readFileSync } from 'node:fs';
const LIB = 150;   /* THE RUNE LIBRARY (claude/follylib) is cut in at column 64: the Archmage's room slid right by this, and the columns below are its old numbers */
const fails = [], ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ok   ' : '  FAIL ') + m); };

// ---- the tables: every new blow is told, and says what to do about it ----
const want = { crushTell: ['!!', 'dodge'], booksTell: ['!', 'block'], glyphTell: ['!!', 'dodge'], pairTell: ['!!', 'dodge'] };
for (const [m, [mk, an]] of Object.entries(want)) ok(MARK['archmage|' + m] === mk && ANSWER['archmage|' + m] === an, 'archmage|' + m + ' wears ' + mk + ' and is answered by ' + an + ' (MARK ' + JSON.stringify(MARK['archmage|' + m]) + ', ANSWER ' + JSON.stringify(ANSWER['archmage|' + m]) + ')');

const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LIB=${LIB};
    const { LEVELS, T } = await import('/src/level.js');
    BK.manualSimulation = true; BK.SET.speed = 1; const out = { notes: [] };   /* a frame is a sixtieth of a second of the fight: the numbers below are in frames */
    const P = () => BK.P, TS = 16;
    let lost = 0;
    /* one frame, the hero's health kept topped up and what he lost counted (no god mode: god mode turns every blow away) */
    const step = (n = 1) => { for (let i = 0; i < n; i++) { const p = BK.P; p.dead = 0; const was = p.hp; BK.sim(1); lost += Math.max(0, was - BK.P.hp); BK.P.hp = BK.P.maxHp; BK.P.dead = 0; calledMax = Math.max(calledMax, called().length); for (const q of called()) if (q._hp0 === undefined) { q._hp0 = q.hp; calledHps.push(q.hp); } } };
    const quiet = e => { e.T = Object.assign(e.T || {}, { ward: 99, blink: 99, bolt: 99, rend: 99, room: 99, pair: 99, cast: 99 }); };
    const fresh = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'mage')); BK.state = 'play'; BK.god = false; BK.sim(30);
      const A = BK.L.arena; BK.look(A.trigger / TS + 2, A.floor / TS - 1); for (let i = 0; i < 900 && !(BK.bossActive && BK.boss && BK.boss.mode === 'idle'); i++) step(1);
      const e = BK.boss; quiet(e); return { A, e }; };
    const R = () => BK.mg().A;
    const cfg = BK.archCfg ? BK.archCfg() : null; out.cfg = !!cfg;
    /* where each part of the fight ends, as a fraction of his health: the duel, the flood, the orrery, turned over (the old code: 0.66, 0.48, 0.24, and the room turned over ran to the end) */
    const G = cfg && cfg.gates || [0.66, 0.48, 0.24, 0]; out.gates = G; out.openMul = cfg && cfg.openMul;
    /* HIS APPRENTICES: the most of them ever up at once, over the whole run */
    const called = () => BK.enemies().filter(q => q.archCalled && q.alive); let calledMax = 0; const calledHps = []; out.calledHps = calledHps;
    const swingAt = (x, face) => { const p = BK.P; p.x = x; p.vx = 0; p.face = face; BK.press('atk'); step(1); };

    /* ======== 1. THE WARD ======== */
    { const { A, e } = fresh(); out.hp = e.maxHp; const fl = A.floor;
      BK.tp(622 + LIB, fl / TS - 1); e.x = (626 + LIB) * TS; e.stage = 1; e.T.ward = 0; for (let i = 0; i < 120 && e.mode !== 'ward'; i++) step(1);
      const W = R(); out.wardMode = e.mode; out.runes = W.runes.length; out.portal1 = W.portal ? +(W.portal.dur || 0).toFixed(2) : 0; out.calledAtWard = called().length; const sr = W.runes.find(q => q.stack), S = W.stack;
      out.stackRune = !!sr; out.stack = !!S;
      if (S) { out.stackEnd = S.x0 === A.x0 / TS || S.x1 === A.x1 / TS - 1; let solid = 0; for (let y = S.top; y < S.top + S.h; y++) for (let x = S.x0; x <= S.x1; x++) if (BK.L.grid[y * BK.L.W + x] === T.SOLID) solid++; out.stackSolid = solid === S.h * 2;
        step(40); out.runeHigh = fl - sr.y;
        /* a swing at the sealed rune (put the hero up beside it: the test's hand, not a jump) is held by the books */
        const p = BK.P; p.y = sr.y + 12; p.x = sr.x + S.face * 12; p.vy = 0; p.face = -S.face; BK.press('atk'); step(3); out.sealedHeld = sr.hp === 1; BK.tp(622 + LIB, fl / TS - 1); step(20);
        /* the stack's own rune, at its foot: struck, the stack slides down into the floor */
        BK.P.y = fl; for (let k = 0; k < 6 && S.state === 'up'; k++) { swingAt(S.fx + S.face * 12, -S.face); step(12); } out.sliding = S.state; step(60); out.slid = S.state;
        let air = 0; for (let y = S.top; y < S.top + S.h; y++) for (let x = S.x0; x <= S.x1; x++) if (BK.L.grid[y * BK.L.W + x] === T.AIR) air++; out.stackGone = air === S.h * 2; out.runeLow = fl - sr.y;
        /* cut the stack's rune: the count starts */
        for (let i = 0; i < 12 && sr.hp > 0; i++) { swingAt(sr.x + S.face * 14, -S.face); step(18); } out.stackCut = sr.hp <= 0; out.reseal = +(W.reseal || 0).toFixed(2);
        /* and leave the other two standing: the ward seals again, the stack back up with its rune on it */
        BK.tp(622 + LIB, fl / TS - 1); step(Math.round((cfg ? cfg.reseal : 6) * 60) + 30);
        out.resealed = W.runes.every(q => q.hp > 0); out.stackBack = !!W.stack && W.stack.state === 'up'; out.stillWard = e.mode === 'ward';
        /* now cut all three in time: the stack first, then the two round him */
        const S2 = W.stack; if (S2) { step(30); BK.P.y = fl; for (let k = 0; k < 6 && S2.state === 'up'; k++) { swingAt(S2.fx + S2.face * 12, -S2.face); step(12); } step(60); const r2 = W.runes.find(q => q.stack); for (let i = 0; i < 12 && r2.hp > 0; i++) { swingAt(r2.x + S2.face * 14, -S2.face); step(18); } }
        const t0 = performance.now(); let frames = 0; e.x = (626 + LIB) * TS; e.vx = 0;
        for (; frames < 600 && e.mode === 'ward'; frames++) { const up = W.runes.filter(q => q.hp > 0 && !q.stack); if (!up.length) { step(1); continue; } const q = up[0]; BK.P.x = q.x - 18 * (Math.sign(q.x - e.x) || 1); BK.P.y = fl; BK.P.face = Math.sign(q.x - BK.P.x) || 1; if (frames % 10 === 0) BK.press('atk'); step(1); }
        out.opened = e.mode === 'open' && e.open > 0; out.openLen = +(e.open || 0).toFixed(2);
        /* 4. THE OPENING: real swings, as fast as the sword goes, until he recovers */
        const hp0 = e.hp; let landed = 0, last = e.hp, f2 = 0; const openT = e.open;
        for (; f2 < 400 && e.open > 0; f2++) { BK.P.x = e.x - 14; BK.P.y = fl; BK.P.face = 1; if (f2 % 3 === 0) BK.press('atk'); step(1); if (e.hp < last) { landed++; last = e.hp; } }
        out.landed = landed; out.openFrames = f2; out.openTook = hp0 - e.hp; out.openT = openT;
      }
      out.called1 = calledMax; }

    /* ======== 3. NO PAIRS IN THE DUEL ======== */
    { const { A, e } = fresh(); BK.tp(622 + LIB, A.floor / TS - 1); e.x = (630 + LIB) * TS; e.stage = 1; e.T.pair = 0; e.T.bolt = 0; let pairs = 0; for (let i = 0; i < 600; i++) { step(1); if (e.mode === 'pairTell') pairs++; e.T.pair = 0; e.T.ward = 99; } out.duelPairs = pairs; }

    /* ======== 2 and 3 in the rooms he writes ======== */
    const toRoom = (sub) => { const { A, e } = fresh(); e.stage = 1; e.hp = Math.floor(e.maxHp * G[0]); for (let s = 1; s <= sub; s++) { for (let i = 0; i < 400 && !(e.stage === 2 && R().sub === s && e.mode === 'idle'); i++) { step(1); quiet(e); } if (s < sub) { e.hp = Math.floor(e.maxHp * G[s]); } }
      quiet(e); step(90); quiet(e); return { A, e }; };
    /* THE FLOOD: onto the first stack, and the stack from the dark comes down on it */
    { const { A, e } = toRoom(1); const M = BK.L.mage, fl = A.floor; out.floodSub = R().sub;
      const onStack = () => { BK.tp(M.stacks[0], fl / TS - 3); BK.P.x = M.stacks[0] * TS + 16; step(20); };
      onStack(); e.T.room = 0; step(2); out.crushTell = e.mode; const c = R().crush; out.crushAt = c ? Math.round(c.x - BK.P.x) : null; out.crushTellLen = cfg && cfg.tell.crush;
      lost = 0; BK.keys.block = true; for (let i = 0; i < 90 && e.mode !== 'idle'; i++) step(1); BK.keys.block = false; out.crushStill = lost;
      onStack(); e.T.room = 0; step(2); lost = 0; if (e.mode === 'crushTell') { BK.tp(M.stacks[1], fl / TS - 3); BK.P.x = M.stacks[1] * TS + 16; } for (let i = 0; i < 90 && e.mode !== 'idle'; i++) step(1); out.crushOut = lost;
      /* the pair, here: a red circle on you and a yellow one aside */
      onStack(); quiet(e); e.T.pair = 0; step(2); out.pairTell = e.mode; const c1 = R().circle, c2 = R().circle2; out.pair = c1 && c2 ? { red: c1.col, yellow: c2.col, gap: Math.round(Math.abs(c2.x - c1.x)), onYou: Math.round(Math.abs(c1.x - BK.P.x)) } : null;
      lost = 0; for (let i = 0; i < 90 && e.mode !== 'idle'; i++) step(1); out.pairStill = lost;
      onStack(); quiet(e); e.T.pair = 0; step(2); lost = 0; const pt = e.modeT; step(Math.max(0, Math.round((pt - 0.25) * 60))); BK.press('jump'); BK.keys.jump = true; for (let i = 0; i < 60 && e.mode !== 'idle'; i++) step(1); BK.keys.jump = false; out.pairJump = lost; step(40); }
    /* THE ORRERY: the books, taken standing and taken on the shield */
    { const { A, e } = toRoom(2); const fl = A.floor; out.orrerySub = R().sub; out.ride = !!R().ride;
      const stand = () => { BK.tp(612 + LIB, fl / TS - 1); step(10); };
      stand(); e.T.room = 0; step(2); out.booksTell = e.mode; const b = R().books; out.booksFrom = b ? Math.round(Math.abs(b.x - BK.P.x)) : null;
      lost = 0; for (let i = 0; i < 180; i++) step(1); out.booksStill = lost;
      stand(); quiet(e); e.T.room = 0; step(2); const side = R().books ? R().books.side : 1; lost = 0; BK.P.face = side; BK.keys.block = true; for (let i = 0; i < 180; i++) { BK.P.face = side; step(1); } BK.keys.block = false; out.booksBlocked = lost;
      /* the pair on the floor, answered by the free side */
      stand(); quiet(e); e.T.pair = 0; step(2); const p1 = R().circle, p2 = R().circle2; lost = 0; if (p1 && p2) BK.P.x = p1.x - Math.sign(p2.x - p1.x) * 44; for (let i = 0; i < 90 && e.mode !== 'idle'; i++) step(1); out.pairSide = lost; }
    /* TURNED OVER: the glyph under your feet on the ceiling */
    { const { A, e } = toRoom(3); out.overSub = R().sub; out.flipped = !!BK.P.flip;
      const walk = () => { BK.P.x = A.x0 + 120; BK.P.vx = 0; step(30); };
      walk(); e.T.room = 0; step(2); out.glyphTell = e.mode; const q = R().glyph; out.glyphAt = q ? Math.round(q.x - BK.P.x) : null;
      lost = 0; for (let i = 0; i < 60 && e.mode === 'glyphTell'; i++) step(1); step(2); out.glyphTook = !BK.P.flip; out.glyphLost = lost; out.flipBack = +(R().flipBack || 0).toFixed(2);
      let back = -1; for (let i = 0; i < 200; i++) { step(1); if (BK.P.flip) { back = i; break; } } out.turnedAgain = back;
      step(60); walk(); quiet(e); e.T.room = 0; step(2); const pt = e.modeT; step(Math.max(0, Math.round((pt - 0.2) * 60))); BK.press('jump'); BK.keys.jump = true; step(14); BK.keys.jump = false; out.glyphMidJump = !BK.P.flip; step(200);
      walk(); quiet(e); e.T.room = 0; step(2); if (R().glyph) BK.P.x = R().glyph.x + 44; step(70); out.glyphStepped = !!BK.P.flip; }
    /* ======== 5. STAGE III: THE MIRRORS (claude/folly3) ======== */
    { const { A, e } = toRoom(3); const fl = A.floor; const s3 = out.s3 = {};
      /* the room turned over holds him down to the line, and at the line - 30% - the new stage */
      e.hp = Math.floor(e.maxHp * 0.33); for (let i = 0; i < 200; i++) { step(1); quiet(e); } s3.at33 = e.stage;
      e.hp = Math.floor(e.maxHp * 0.30); for (let i = 0; i < 300 && e.stage !== 3; i++) { step(1); quiet(e); } for (let i = 0; i < 90; i++) { step(1); quiet(e); }
      s3.stage = e.stage; s3.flip = !!BK.P.flip; const I = () => (R().imgs || []); s3.imgs = I().filter(q => !q.gone).length;
      if (e.stage === 3) {
        /* HIS BOLT, AND THEIRS: only his circle and his mark are coloured; the images' are grey, and harmless */
        BK.tp(Math.round((A.x0 + 200) / TS), fl / TS - 1); step(20); quiet(e); e.T.bolt = 0; for (let i = 0; i < 60 && e.mode !== 'boltTell'; i++) step(1);
        s3.tell = e.mode; s3.real = R().circle ? R().circle.col : null; s3.fakes = (R().fakes || []).map(f => f.col); s3.imgTells = I().filter(q => !q.gone).map(q => q.tellCol || null);
        const c0 = R().circle, fk = (R().fakes || []).find(f => !c0 || Math.abs(f.x - c0.x) >= 32);
        if (fk) { BK.P.x = fk.x; BK.P.vx = 0; s3.fakeGap = c0 ? Math.round(Math.abs(fk.x - c0.x)) : null; } lost = 0; for (let i = 0; i < 70; i++) { if (fk) BK.P.x = fk.x; step(1); quiet(e); } s3.fakeLost = fk ? lost : -1;
        /* and his own, stood in: it lands (it is his) */
        for (let i = 0; i < 90 && e.mode !== 'idle'; i++) { step(1); quiet(e); } quiet(e); e.T.bolt = 0; for (let i = 0; i < 60 && e.mode !== 'boltTell'; i++) step(1); lost = 0; const c1 = R().circle; s3.tell2 = e.mode; for (let i = 0; i < 70; i++) { if (c1) BK.P.x = c1.x; step(1); quiet(e); } s3.realLost = lost;
        /* A BLOW ON AN IMAGE BREAKS IT */
        step(30); const im = I().find(q => !q.gone); if (im) { for (let k = 0; k < 4 && !im.gone; k++) { BK.P.x = im.x - 14; BK.P.y = im.y; BK.P.vy = 0; BK.P.face = 1; BK.press('atk'); step(12); quiet(e); } }
        s3.dispelled = !!im && !!im.gone; s3.afterDispel = I().filter(q => !q.gone).length; s3.bossHpKept = e.hp;
        /* THE NEXT CYCLE (his next ward): the image is back, and a portal opens for one apprentice */
        BK.tp(Math.round((A.x0 + 200) / TS), fl / TS - 1); step(10); e.T.ward = 0; for (let i = 0; i < 120 && e.mode !== 'ward'; i++) { step(1); e.T.bolt = 99; e.T.rend = 99; e.T.pair = 99; }
        s3.ward = e.mode; s3.imgsBack = I().filter(q => !q.gone).length; s3.portal = R().portal ? +(R().portal.dur || 0).toFixed(2) : 0; s3.calledAtOnce = called().length;
        for (let i = 0; i < 90; i++) { step(1); e.T.bolt = 99; e.T.rend = 99; e.T.pair = 99; } s3.called = called().length;
        /* the ward reseals in 4 s here: slide the stack, cut its rune, and read the count */
        const W = R(), S = W.stack, sr = W.runes.find(q => q.stack);
        if (S && sr) { BK.P.y = fl; for (let k = 0; k < 6 && S.state === 'up'; k++) { swingAt(S.fx + S.face * 12, -S.face); step(12); e.T.bolt = 99; } step(60); for (let i = 0; i < 12 && sr.hp > 0; i++) { swingAt(sr.x + S.face * 14, -S.face); step(18); e.T.bolt = 99; } }
        s3.reseal = +(W.reseal || 0).toFixed(2);
        /* a second ward while his apprentice still stands calls no second one */
        e.modeT = 0; step(2); e.T.ward = 0; for (let i = 0; i < 120 && e.mode !== 'ward'; i++) { step(1); e.T.bolt = 99; e.T.rend = 99; e.T.pair = 99; } for (let i = 0; i < 90; i++) { step(1); e.T.bolt = 99; } s3.calledSecond = called().length;
        /* killed, the next ward calls the next */
        for (const q of called()) { q.hp = 0; q.alive = false; } e.modeT = 0; step(2); e.T.ward = 0; for (let i = 0; i < 120 && e.mode !== 'ward'; i++) { step(1); e.T.bolt = 99; e.T.rend = 99; e.T.pair = 99; } for (let i = 0; i < 90; i++) { step(1); e.T.bolt = 99; } s3.calledNext = called().length;
        /* AN OPENING HERE IS x3 TOO: a blow while he is open against a blow while he is not */
        e.modeT = 0; step(2); quiet(e); for (let i = 0; i < 60; i++) { step(1); quiet(e); } for (const q of called()) { q.hp = 0; q.alive = false; }
        const blow = () => { const h0 = e.hp; BK.P.x = e.x - 14; BK.P.y = e.y; BK.P.vy = 0; BK.P.face = 1; BK.press('atk'); for (let i = 0; i < 12; i++) { BK.P.x = e.x - 14; step(1); quiet(e); } return h0 - e.hp; };
        e.hp = Math.floor(e.maxHp * 0.25); s3.shut = e.mode === 'open' ? -1 : blow(); step(40); quiet(e);
        e.mode = 'open'; e.modeT = 3; e.open = 3; e.openTaken = 0; e.openHits = 0; s3.opened = blow();
      } }
    out.calledMax = calledMax; out.levelAppHp = (BK.enemies().find(q => q.t === 'apprentice' && !q.archCalled) || {}).hp0 ?? null;
    out.errors = BK.errors ? BK.errors() : null;
    return out; })()`, 600000);
  console.log(JSON.stringify(r));
  ok(r.cfg, 'the page carries his numbers (BK.archCfg)');
  { const ehp = (readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').match(/^const EHP = .*?[ ,]archmage: ([0-9]+),/m) || [])[1]; ok(ehp === '720', 'his health is what it was: ' + ehp + ' in EHP, ' + r.hp + ' in the fight (no bloat)'); }
  // 1
  ok(r.wardMode === 'ward' && r.runes === 3 && r.stackRune && r.stack, 'he wards with three runes, and one sits on a stack of books (mode ' + r.wardMode + ', runes ' + r.runes + ', stack ' + r.stack + ')');
  ok(r.stackEnd && r.stackSolid, 'the stack stands at an end of the room, solid');
  ok(r.runeHigh >= 70 && r.sealedHeld, 'its rune sits high on it (' + r.runeHigh + ' px over the floor) and the books hold it against a blow until the stack is slid');
  ok(r.sliding === 'sinking' && r.slid === 'down' && r.stackGone && r.runeLow <= 16, "a blow on the stack's own rune slides it down into the floor (" + r.sliding + ' -> ' + r.slid + '), and brings its rune down to the sword (' + r.runeLow + ' px)');
  ok(r.stackCut && r.reseal > 4, 'the first rune cut starts the count (' + r.reseal + ' s)');
  ok(r.resealed && r.stackBack && r.stillWard, 'left standing, the ward seals again: every rune back, and the stack back up with its rune on it');
  ok(r.opened && r.openLen > 0 && r.openLen <= 3, 'all three cut in time and he is open - for ' + r.openLen + ' s (was 4.6)');
  // 4
  ok(r.landed >= 1 && r.landed <= 2, 'an opening is two clean blows: ' + r.landed + ' landed before he recovered (' + r.openTook + ' taken, ' + r.openFrames + ' frames)');
  // 3
  ok(r.duelPairs === 0, 'no paired spells in the duel (stage one): ' + r.duelPairs);
  ok(r.pairTell === 'pairTell' && r.pair && r.pair.red === '#ff6b6b' && r.pair.yellow === '#ffd36b' && r.pair.onYou <= 2 && r.pair.gap >= 40, 'from the second stage he casts a pair: a red circle on you and a yellow one a stride aside (' + JSON.stringify(r.pair) + ')');
  ok(r.pairStill >= 20, 'a pair stood in lands: ' + r.pairStill);
  ok(r.pairJump === 0, 'a jump straight up clears a pair: ' + r.pairJump);
  ok(r.pairSide === 0, 'and so does the side away from the yellow circle: ' + r.pairSide);
  // 2
  ok(r.floodSub === 1 && r.crushTell === 'crushTell' && r.crushAt !== null && Math.abs(r.crushAt) <= 2 && r.crushTellLen >= 0.8, 'THE FLOOD: a stack comes down over you, told (' + r.crushTell + ', ' + r.crushTellLen + ' s)');
  ok(r.crushStill >= 20, 'stood under it, a shield does not help: ' + r.crushStill);
  ok(r.crushOut === 0, 'out from under it in the tell, it misses: ' + r.crushOut);
  ok(r.orrerySub === 2 && r.ride && r.booksTell === 'booksTell' && r.booksFrom >= 90, 'THE ORRERY: the flying books come off the wall at you, told (' + r.booksTell + ', from ' + r.booksFrom + ' px)');
  ok(r.booksStill >= 12, 'stood in their way, they land: ' + r.booksStill);
  ok(r.booksBlocked < r.booksStill, 'and the shield turns them: ' + r.booksBlocked + ' through a guard');
  ok(r.pairSide === 0, 'on the floor the pair is answered by the free side');
  ok(r.overSub === 3 && r.flipped && r.glyphTell === 'glyphTell' && r.glyphAt !== null && Math.abs(r.glyphAt) <= 2, 'TURNED OVER: a glyph opens on the ceiling under you, told (' + r.glyphTell + ')');
  ok(r.glyphTook && r.flipBack > 0.5, 'stood on it, it takes you: the room rights itself for you (' + r.flipBack + ' s)');
  ok(r.turnedAgain >= 0 && r.turnedAgain <= 120, 'and turns you over again a breath later, back to the ceiling (after ' + r.turnedAgain + ' frames) - never a fall to your death');
  ok(r.glyphMidJump, 'mid-jump over it, it takes you all the same');
  ok(r.glyphStepped, 'stepped off it in the tell, it misses');
  // 5. claude/folly3 (Daniel, 2026-09-29: "he is too easy")
  const s3 = r.s3 || {}, appHp = +((readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').match(/^const EHP = .*?[ ,]apprentice: ([0-9]+),/m) || [])[1]);
  ok(r.openMul === 3, 'an opening blow is worth x3 again (openMul ' + r.openMul + '; the x4 of claude/followups is reverted)');
  ok(r.reseal > 5.5 && r.reseal <= 6.05, 'the duel still reseals in 6 s, so it still teaches (' + r.reseal + ' s)');
  ok(r.portal1 >= 0.8 && r.calledAtWard === 0 && r.called1 === 1, 'at his ward a portal opens, told (' + r.portal1 + ' s), and one apprentice steps out of it (' + r.called1 + ')');
  ok(r.calledHps.length > 0 && r.calledHps.every(h => h === (r.levelAppHp ?? appHp)), 'his apprentice has an apprentice\'s health (' + appHp + ' in EHP, ' + r.levelAppHp + ' on this level\'s own), no more: ' + JSON.stringify(r.calledHps));
  ok(Math.abs((r.gates[3] || 0) - 0.30) < 1e-9 && s3.at33 === 2 && s3.stage === 3, 'a new stage at 30%: at 33% he is still turning the room over (stage ' + s3.at33 + '), at 30% it is stage ' + s3.stage);
  ok(s3.stage === 3 && !s3.flip && s3.imgs === 2, 'THE MIRRORS: the room put right, and two images of him (' + s3.imgs + ')');
  const grey = c => typeof c === 'string' && !['#ff6b6b', '#ffd36b'].includes(c.toLowerCase());
  ok(s3.tell === 'boltTell' && s3.real === '#ffd36b' && (s3.fakes || []).length === 2 && s3.fakes.every(grey) && (s3.imgTells || []).length === 2 && s3.imgTells.every(grey), 'they cast with him, and only his is coloured: his ' + s3.real + ', theirs ' + JSON.stringify(s3.fakes) + ', their marks ' + JSON.stringify(s3.imgTells));
  ok(s3.fakeLost === 0 && s3.tell2 === 'boltTell' && s3.realLost > 0, 'their spells are harmless (' + s3.fakeLost + ' stood in one, ' + s3.fakeGap + ' px from his), his is not (' + s3.realLost + ')');
  ok(s3.dispelled && s3.afterDispel === 1, 'a blow on an image breaks it (' + s3.afterDispel + ' left)');
  ok(s3.ward === 'ward' && s3.imgsBack === 2, 'and it is back at his next ward (' + s3.imgsBack + ')');
  ok(s3.portal >= 0.8 && s3.called === 1, 'each ward, one apprentice through a told portal (' + s3.portal + ' s, ' + s3.called + ')');
  ok(s3.reseal > 3.5 && s3.reseal <= 4.05, 'in the mirrors the ward reseals in 4 s (' + s3.reseal + ' s)');
  ok(s3.calledSecond === 1 && s3.calledNext === 1 && r.calledMax === 1, 'never a second apprentice while the first stands (' + s3.calledSecond + '), the next one only when he is down (' + s3.calledNext + '); most ever at once: ' + r.calledMax);
  ok(s3.shut > 0 && s3.opened > 0 && Math.abs(s3.opened / s3.shut - 3) < 0.35, 'open in the mirrors, a blow is x3 too: ' + s3.opened + ' against ' + s3.shut);
  ok(!r.errors || !r.errors.length, 'no page errors');
  ok(!pg.errors.length, 'the page threw nothing: ' + JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
if (fails.length) { console.log('\n' + fails.length + ' FAILED'); process.exit(1); }
console.log('ok  archmage-folly   the ward fights back, the room attacks told, pairs from stage two, two blows an opening');
