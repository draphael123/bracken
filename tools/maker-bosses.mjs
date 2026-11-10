/* tools/maker-bosses.mjs (claude/maker) - EVERY BOSS IN THE MAKER'S PALETTE WORKS IN A MADE-BY-HAND ARENA.
   Each kind in src/maker-palette.js BOSSES is placed alone in a plain wood (its arena is built round it), and with the dice
   pinned to its name: walking over the trigger WAKES the fight, it stays in the world and moves or hurts the knight, a
   blow FINISHES it once it is down to its last point, and its fall OPENS THE GOAL. The page logs no errors.
   node tools/maker-bosses.mjs [kind,kind]   (a kind not in BOSSES is tried as a candidate) */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const REPORT = process.argv.includes('--report');   /* --report: every boss with a home arena, sorted into what stops it (no assert) */
const only = REPORT ? [] : (process.argv[2] || '').split(',').filter(Boolean);
/* BOSSES WHOSE REAL FIGHT THIS TEST CANNOT PLAY: their blows are KEYED (a jump attack on a lure ...). Their room and machinery are the real
   ones; the check holds them to waking, staying in the world and a clean page, and they need a hand-played pass (docs/MAKER-BOSSES.md). */
const KEYED = { lanterneater: 'keyed fight on the raft (HIGH blows on the lure): play it by hand' };
const pg = await openPage({ port: portFor(6), audio: false, seed: 6 });
try {
  const res = await pg.evalp(`(async () => { const KEYED = ${JSON.stringify(KEYED)};
    const P = await import('/src/maker-palette.js'), MKS = await import('/src/maker-stages.js'); MKR.enter(); (await import('/src/maker-ui.js')).closePanel();
    const list = ${REPORT} ? P.BOSS_CANDIDATES() : ${JSON.stringify(only)}.length ? ${JSON.stringify(only)} : P.BOSSES, out = [];
    for (const t of list) {
      { let s = [...t].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261); Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
      P.trialBoss(t, true); const r = { t }; let d, FR = 19;
      if (MKS.hasStage(t)) { d = MKR.blank(140, 40); d.ents = [{ t: 'gate', x: 135, y: 19 }]; d.start = { x: 5, y: 19 }; const st = MKS.stampStage(d, t, 20, 27); if (!st.ok) r.err = 'stage: ' + st.say; FR = (st.boss && st.boss.arenaRec && st.boss.arenaRec.start ? st.boss.arenaRec.start[1] : 27); }   /* a boss that brings its own room */
      else { d = MKR.blank(100, 28); d.ents = [{ t: 'gate', x: 95, y: 19 }, { t, x: 62, y: 19 }]; d.start = { x: 5, y: 19 }; }
      MKR.doc = d;
      try {
        MKR.play(); BK.god = true; BK.step(20); const a = BK.L.arena; r.arena = !!(a && a.maker);
        /* (and the rest of its setup is really there: the tide, the drums, the traps, the carousel, a room's machinery) */
        const PARTS = { reefmaw: () => BK.L.pools.some(p => p.arenaTide), herald: () => BK.L.pools.some(p => p.arenaTide), bzchief: () => (BK.L.wcDrums || []).length === 2 && BK.L.warcairn,
          tombking: () => (BK.L.traps || []).length === 4 && BK.L.ents.some(e => e.t === 'dartwall'), wickerqueen: () => BK.movers().some(m => m.kind === 'carhorse') && !!BK.L.ring,
          fogknight: () => (BK.L.locks || []).length > 0 && BK.L.pools.length > 0, hawkmistress: () => (BK.L.gongs || []).length > 0, paladinboss: () => (BK.L.lamps || []).length > 0,
          lanterneater: () => BK.L.pools.length > 0 && BK.L.moversExtra.length > 0, puppeteer: () => BK.L.moversExtra.length > 0, colossus: () => (BK.L.machineCells || []).length > 0,
          duneworm: () => !!BK.L.caravan && !!(BK.caravan && BK.caravan()), shrieksisters: () => !!BK.L.arena.perchS && BK.enemies().filter(q => q.t === 'shrieksister').length === 3,
          kraken: () => BK.L.pools.some(p => p.krakenSea) && !!BK.L.leviathan && BK.L.arena.holes.length === 2, admiral: () => BK.props().filter(q => q.t === 'cannon' && q.deck).length === 2 && BK.L.pools.some(p => p.harm),
          gargoyle: () => (BK.L.winds || []).length === 1 && BK.movers().filter(m => m.slab && m.arena).length === 13 && !!BK.L.arena.rune };
        if (PARTS[t]) r.parts = !!PARTS[t]();
        if (a.start && t === 'lanterneater') BK.tp(a.start[0], a.start[1]); else BK.tp(Math.round(a.trigger / 16) + 2, FR);   /* her fight is on the raft: the arena's own start is aboard */ for (let i = 0; i < 300 && !BK.bossActive; i++) BK.step(1); r.woke = !!BK.bossActive;
        const b = BK.boss, x0 = b.x, y0 = b.y; let far = 0; for (let i = 0; i < 60; i++) { BK.step(10); far = Math.max(far, Math.hypot(b.x - x0, b.y - y0)); }
        r.moved = Math.round(far); r.inWorld = b.alive && isFinite(b.x) && isFinite(b.y) && b.y < 28 * 16 + 60;
        BK.god = false; const h0 = BK.P.hp; r.hurt = false; for (let i = 0; i < (t === 'lanterneater' ? 160 : 40); i++) {   /* an ambusher under the raft takes longer to bite */ BK.step(10); if (BK.P.hp < h0) r.hurt = true; BK.P.hp = Math.max(BK.P.hp, h0); } BK.god = true;
        /* A BOSS OPENED ONLY BY ITS OWN SET-PIECE, played as its level teaches it (not keyed: the test can do it) */
        const LURE = { duneworm: () => { const R = Math.round(BK.L.arena.floor / 16) - 3 - 1;   /* stand on a risen ledge: his breach under it hits his head (dune-worm.js wormTake) */
          for (let k = 0; k < 600 && b.alive && b.st && b.st.mode !== 'stunned'; k++) { const l = (b.st.ledges || []).find(q => q.state === 'up'); if (l && (!BK.P.ground || Math.abs(BK.P.x - (l.x0 + l.x1) / 2) > 20)) BK.tp(Math.floor((l.x0 + l.x1) / 32), R); BK.step(5); }
          r.lured = !!(b.st && b.st.mode === 'stunned'); },
          /* THREE BODIES (the anchor's health is the sum of theirs): each sister brought to her last point by the room's blows (B15: every blow takes at least one) */
          shrieksisters: () => { for (const q of BK.enemies().filter(q => q.t === 'shrieksister' && q.alive)) for (let k = 0; k < 400 && q.hp > 1; k++) { BK.env().hurt(q, Math.max(1, Math.floor((q.hp - 1) / 3)), q.x); BK.step(1); } },
          /* THREE STAGES: the first two played as done (his arms gone, then his health down to the second stage's floor), as b.hp = 1 skips every other fight;
             the last is real - he comes up against the end of the road and the blow goes at HIS EYE (the climb's reward: main.js krakenHurt stage 3) */
          kraken: () => { for (let k = 0; k < 600 && b.alive && b.stage < 3; k++) { if (b.stage === 1) for (const q of b.arms) if (q.st !== 'gone') { q.st = 'gone'; q.severed = true; q.hp = 0; if (q.ae) q.ae.alive = false; }
            if (b.stage === 2 && b.mode !== 'rise1') b.hp = b.stageFloor; BK.step(5); } for (let k = 0; k < 300 && b.mode === 'rise2'; k++) BK.step(5); r.lured = b.stage === 3; },
          /* HIS IRON HOLDS (no blade takes him under half while a plate is on): a DECK GUN struck while he stands in its line blows one off - three plates, three shots */
          admiral: () => { for (let k = 0; k < 1500 && b.alive && b.plates > 0; k++) {
              const g = BK.props().find(q => q.t === 'cannon' && q.deck && !(q.cool > 0) && Math.sign(b.x - q.x) === q.aim && b.y >= BK.L.arena.floor - 2);
              if (g) { BK.tp(Math.floor((g.x - g.aim * 20) / 16), FR); BK.P.face = g.aim; dispatchEvent(new KeyboardEvent('keydown', { key: 'x' })); BK.step(1); dispatchEvent(new KeyboardEvent('keyup', { key: 'x' })); }
              BK.step(5); }
            r.lured = b.plates === 0; },
          /* HE IS STONE OFF THE SPIKES: stand on a slab, let him dive on it, leave it LATE (after he has dropped) - nothing takes his weight, he smashes through
             onto the spikes, stunned - and STOMP him (gate-gargoyle.js gargTake: a stomp is his blow; a blade at the arena's start row cannot reach the spikes) */
          gargoyle: () => { const slabs = () => BK.movers().filter(m => m.slab && m.arena && !m.broken), on = m => { BK.P.x = m.x + m.w / 2; BK.P.y = m.y; BK.P.vy = 0; };
            for (let k = 0; k < 2000 && b.alive && b.mode !== 'stunned'; k++) {
              if (b.mode === 'dive' || b.mode === 'smash') { const far = slabs().sort((p, q) => Math.abs(q.x - b.x) - Math.abs(p.x - b.x))[0]; if (far && Math.abs(BK.P.x - b.x) < 80) on(far); }
              else if (!BK.P.onMover || BK.P.onMover.broken) { const m = slabs().sort((p, q) => Math.abs(p.x - BK.P.x) - Math.abs(q.x - BK.P.x))[0]; if (m) on(m); }
              BK.step(3); }
            r.lured = b.mode === 'stunned'; if (r.lured) { b.hp = 1; BK.P.windRide = null; BK.P.x = b.x; BK.P.y = b.y - b.h - 30; BK.P.vy = 200; for (let i = 0; i < 30 && b.alive; i++) BK.step(1); } } };
        const AIM = { shrieksisters: () => BK.enemies().find(q => q.t === 'shrieksister' && q.alive) };   /* the blows go at the bodies, not the anchor */
        if (LURE[t]) LURE[t]();
        b.hp = 1; for (let k = 0; k < 90 && b.alive; k++) {   /* a boss hurt only while OPEN (the Djinn) needs the blows spread over his cycle */ const tg = (AIM[t] && AIM[t]()) || b; BK.tp(Math.round(tg.x / 16) - 1, Math.min(FR, Math.floor(tg.y / 16))); BK.P.face = 1; dispatchEvent(new KeyboardEvent('keydown', { key: 'x' })); BK.step(1); dispatchEvent(new KeyboardEvent('keyup', { key: 'x' })); BK.step(20); }
        r.finished = !b.alive; for (let i = 0; i < 10 && !BK.L.gateOpen; i++) BK.step(60); r.gate = !!BK.L.gateOpen;
        r.ok = r.arena && r.parts !== false && r.woke && r.inWorld && (KEYED[t] ? true : (r.moved >= 4 || r.hurt) && r.finished && r.gate); if (KEYED[t]) r.note = KEYED[t];
      } catch (e) { r.err = String(e && e.message || e).slice(0, 140); r.ok = false; }
      r.name = P.nameOf(t); r.inPalette = P.BOSSES.includes(t);
      try { MKR.resume(); } catch (e) {} P.trialBoss(t, false); BK.god = false; out.push(r);
    }
    return out;
  })()`, 900000);
  if (REPORT) {
    const why = r => r.ok ? 'BEATABLE' : /of null \(reading .x.\)/.test(r.err || '') ? 'NEVER SPAWNS ALONE' : r.err ? 'NEEDS ITS OWN ARENA' : !r.woke ? 'NEVER WAKES' : !r.inWorld ? 'LEAVES THE WORLD' : !(r.moved >= 4 || r.hurt) ? 'NEVER FIGHTS' : !r.finished ? 'CANNOT BE FINISHED BY BLOWS' : 'GOAL STAYS SHUT';
    for (const r of res) console.log(JSON.stringify({ t: r.t, name: r.name, verdict: why(r), inPalette: r.inPalette, err: r.err || undefined }));
    pg.close(); process.exit(0);
  }
  const bad = res.filter(r => !r.ok);
  for (const r of bad) console.log('  FAIL', JSON.stringify(r));
  assert.equal(bad.length, 0, bad.length + ' palette boss(es) do not work in a made-by-hand arena: ' + bad.map(r => r.t).join(' '));
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-bosses: all ' + res.length + ' palette bosses wake, fight, fall to a blow and open the goal in a made-by-hand arena.');
} finally { pg.close(); }
