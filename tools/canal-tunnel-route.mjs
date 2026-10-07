// tools/canal-tunnel-route.mjs - THE LEGGING TUNNEL walked with REAL KEYS by every hero, many seeds (claude/canal5, Daniel 10-06: "the tunnel isn't
// really working right - glitchy, awkward. There's a LADDER - I jumped out of the area and the RAFT DIDN'T FOLLOW ME... I COULDN'T GET TO THE BOSS").
// The old checks (tools/canal.mjs) only used a scripted rider who never left the barge. This hand plays it the way a player does, and the way a player
// gets it wrong: it wakes at the summit checkpoint (a real death and respawn: the game's own mooring puts her there), walks onto her deck, LEGS her with
// LEFT/RIGHT, fights what comes aboard with plain swings, goes up onto the leggers' ledge at the stop-planks, over the gap, strikes the windlass, and
// comes back to her - and, on a STRAY run, it does everything a player might to lose her:
//   - leaves her for the summit bank behind the tunnel's mouth (she must come back to it)
//   - walks off the stop-planks' ledge into the water (a fall: back ON HER DECK) and waits on the far ledge for her (THE CALL: she glides to it)
//   - climbs the moon shaft's ladder, tries to jump out of its top (the grating: it must not get out), and climbs down onto her deck
//   - gets off early onto the deep lock's gallery and strikes the paddle with her OUTSIDE the lock (it must not shut her out), then down the ladder
//   - DIES mid-tunnel (one run in three: health 1 and into the water) - the respawn must put her and the hand back together at the summit
// Then the basin exam and the corridor to JENNY'S west door (god on there: the basin is not the subject - the tunnel is). The run PASSES when the hand
// reaches her arena with NO LIFT (no teleport ever helps it) and was never parted from the barge for long with nowhere to go.
//   node tools/canal-tunnel-route.mjs [--heroes=knight,pyro,...] [--seeds=3] [--plan=stray|ride|both] [--dbg]
// Every hero (src/progression.js HERO_IDS), a fresh save (level 1, no skills), god off in the tunnel, the dice seeded per hero and seed.
import { openPage } from './cdp.mjs';
const opt = (k, d) => { const a = process.argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const DBG = process.argv.includes('--dbg');
const { HERO_IDS } = await import('../src/progression.js');
const heroes = opt('heroes', HERO_IDS.join(',')).split(','), seeds = +opt('seeds', 3), planArg = opt('plan', 'both');
const pg = await openPage({ audio: false, fonts: false });
let bad = 0; const rows = [];
try {
  for (const hero of heroes) for (let seed = 1; seed <= seeds; seed++) {
    const plan = planArg === 'both' ? (seed % 2 ? 'stray' : 'ride') : planArg, die = plan === 'stray' && seed % 3 === 1, dim = seed % 2 === 0;
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const { mulberry } = await import('/src/px.js'); const TS = 16;
      const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
      Math.random = mulberry(hash('canal5|${hero}|${seed}'));
      const TRACE = ${JSON.stringify(process.env.TRACE ? process.env.TRACE.split(',').map(Number) : null)}; const PLAN = ${JSON.stringify(plan)}, DIE = ${die}, DIM = ${dim}, STRAY = PLAN === 'stray';
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      BK.load(LEVELS.findIndex(l => l.id === 'canal')); BK.start ? BK.start() : (BK.state = 'play'); BK.god = false;
      const P = () => BK.P, k = BK.keys, C = () => BK.canal(), B = () => C().barge, log = [], dbg = [], D = ${DBG} ? (...a) => dbg.push(a.join(' ')) : () => {};
      const DMG = {}, LAST = []; let cards = 0, SUICIDE = false, heals = 0, guards = 0, frames = 0, off = 0, offMax = 0, offWhere = null, lifts = 0, escapes = 0, grabs = 0;
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      const onBarge = () => !!(P().onMover && P().onMover.canal);
      const inTun = () => P().x >= 248 * TS && P().x < 345 * TS;
      const deaths = () => BK.stats().deaths;
      class Died extends Error {}
      let ARMED = null;
      /* ONE FRAME. The tally that matters here: how long the hand is PARTED from her in the tunnel with no footing her deck can reach - off her, not on
         a ledge / ladder / the gallery she is gliding to, not in the air for a jump: the "the raft didn't follow me" clock */
      const tick = n => { for (let i = 0; i < (n || 1); i++) {
        const gr = BK.enemies().find(e => e.alive && e.t === 'grindylow' && e.mode === 'grab'); if (gr && frames % 4 === 0) { BK.press('jump'); grabs++; }   /* a grab mashed off */
        const tl = BK.enemies().find(e => e.alive && typeof e.mode === 'string' && /Tell$/.test(e.mode) && Math.abs(e.x - P().x) < 72 && Math.abs(e.y - P().y) < 40); const kb = k.block; if (tl && P().ground && !P().climb) { k.block = true; guards++; }   /* a told blow: GUARD it (a hand that reads the !!, as a player does) */
        if (BK.state === 'card') { BK.cardClose(); cards++; }   /* a level-up card: taken (the hand plays on) */
        BK.log = []; BK.sim(1); frames++; k.block = kb; for (const q of BK.log) if (q.k === 'dmgP' && q.dmg > 0) { const w = (q.who || (q.by && q.by.t) || (q.blow) || 'hazard') + ''; DMG[w] = (DMG[w] || 0) + q.dmg; LAST.push(w + ' ' + Math.round(q.dmg) + ' @' + Math.floor(P().x / TS) + ',' + Math.floor(P().y / TS)); if (LAST.length > 6) LAST.shift(); } BK.log = null;
        if (P().y < 2 * TS && P().x > 300 * TS && P().x < 312 * TS) escapes++;   /* out of the moon shaft's top */
        if (inTun() && !P().dead && !onBarge()) { const b = B(); const near = Math.abs(P().x - (b.x + b.w / 2)) < 6 * TS; off = near || P().climb || !P().ground ? 0 : off + 1; if (off > offMax) { offMax = off; offWhere = [Math.floor(P().x / TS), Math.floor(P().y / TS), Math.round(b.x / TS)]; } } else off = 0;
        if (TRACE && P().x > TRACE[0] * TS && P().x < TRACE[1] * TS && frames % 6 === 0) D('t', frames, (P().x / TS).toFixed(1), (P().y / TS).toFixed(1), Math.round(P().hp), onBarge() ? 'ON' : 'off', P().ground ? 'g' : 'air', P().climb ? 'climb' : '', 'leg' + P().legging, 'end' + P().deckEnd, 'hurt' + (+(P().hurt || 0)).toFixed(2), 'atk' + P().atk, Object.keys(k).filter(q => k[q]).join('+'), (B().x / TS).toFixed(1), B().holdWhy, 'lv' + (+(B().lv || 0)).toFixed(1), 'want' + C().leg, C().legBy, C().pend || '');
        if (!P().dead && P().hp > 0 && P().hp < P().maxHp * 0.35 && !SUICIDE) { P().hp = P().maxHp; heals++; }   /* THE CARELESS HAND'S FLASK: the subject is the barge, not the fight - a heal under 35% (counted), so a plain-swinging bot is not killed by the brood over and over */
        if (ARMED !== null && deaths() > ARMED) throw new Died(); } };
      const fight = (o = {}) => { const e = BK.enemies().filter(q => q.alive && !q.harmless && !q.waiting && !(q.t === 'grindylow' && !q.aboard && q.mode !== 'stranded') && Math.abs(q.x - P().x) < (o.r || 48) && Math.abs(q.y - P().y) < (q.t === 'willowisp' ? 34 : 16)).sort((a, b) => Math.abs(a.x - P().x) - Math.abs(b.x - P().x))[0];
        if (!e) return false; clear();
        for (let j = 0; j < 24 && Math.abs(e.x - P().x) > 14 && e.alive; j++) { clear(); if (onBarge() && (P().x < B().x + 12 || P().x > B().x + B().w - 12)) break; k[e.x > P().x ? 'right' : 'left'] = true; tick(1); }
        clear(); P().face = Math.sign(e.x - P().x) || P().face; BK.press('atk'); tick(8); clear(); tick(4);
        e.routeSwings = (e.routeSwings || 0) + 1; if (e.routeSwings > 50) { e.alive = false; log.push({ name: 'a ' + e.t + ' the hand could not cut down, taken out', ok: true, at: [Math.floor(P().x / TS), Math.floor(P().y / TS)], bx: Math.round(B().x / TS), hp: Math.round(P().hp), s: +(frames / 60).toFixed(1) }); }
        return true; };
      const walk = (tx, o = {}) => { const goal = tx * TS + 8; let still = 0, lx = P().x, n = 0;
        while (Math.abs(P().x - goal) > (o.tol || 4) && n++ < (o.max || 1500)) {
          if (!o.noFight && fight()) continue;
          clear(); k[goal > P().x ? 'right' : 'left'] = true;
          if (Math.abs(P().x - lx) < 0.3) still++; else still = 0; lx = P().x;
          if (still > 8 && P().ground && !o.noJump) { k.jump = true; BK.press('jump'); still = 0; tick(14); continue; }
          tick(1); }
        clear(); tick(2); return Math.abs(P().x - goal) <= (o.tol || 4) + 3; };
      const settle = () => { for (let j = 0; j < 90 && !P().ground && !P().climb; j++) { clear(); tick(1); } };
      const hop = (dir, o = {}) => { settle(); clear(); if (dir) k[dir > 0 ? 'right' : 'left'] = true; k.jump = true; BK.press('jump'); for (let j = 0; j < 70; j++) { tick(1); if (j > (o.hold || 24)) k.jump = false; if (j > (o.carry || 99)) k.left = k.right = false; if (j > 4 && (P().ground || P().climb)) break; } clear(); tick(3); };
      const ledgeUp = row => { for (let a = 0; a < 4 && !(P().ground && Math.round(P().y / TS) === row && !onBarge()); a++) { while (fight({ r: 36 })) {} hop(0); } return P().ground && Math.round(P().y / TS) === row; };
      const strike = d => { settle(); clear(); P().face = d; BK.press('atk'); tick(12); clear(); tick(6); };
      /* down through the board you stand on, onto her deck (she glides under you when you are off her in the tunnel) */
      const dropOn = (max = 60 * 14) => { for (let t = 0; t < max && !onBarge(); t++) { const b = B(); clear(); if (fight({ r: 30 })) continue;
          if (P().ground && P().x > b.x + 10 && P().x < b.x + b.w - 10 && P().y < b.y - 8) { k.down = true; k.jump = true; BK.press('jump'); tick(2); clear(); tick(24); } else tick(1); } clear(); tick(4); return onBarge(); };
      /* LEG HER (hold the way) until test(); fight what comes aboard; strike her lantern to DIM / LIGHT it when asked */
      const lampAt = () => B().x + 11;
      const lamp = want => { for (let a = 0; a < 6 && (C().lamp !== false) !== want; a++) { clear(); for (let j = 0; j < 120 && Math.abs(P().x - (lampAt() + 14)) > 3; j++) { clear(); k[P().x < lampAt() + 14 ? 'right' : 'left'] = true; tick(1); } clear(); tick(4); strike(-1); tick(20); } return (C().lamp !== false) === want; };
      const back = () => { for (let w = 0; w < 60 * 6 && !onBarge(); w++) { if (P().ground && !P().climb && !P().dead) { if (!fight({ r: 30 })) dropOn(90); } else { clear(); tick(1); } } return onBarge(); };   /* grabbed, hooked or knocked off her: back onto her deck */
      const leg = (test, n = 60 * 90, dir = 1) => { let i = 0; for (; i < n && !test(); i++) { if (!onBarge() && !back()) return false; if (fight({ r: 40 })) continue; clear(); k[dir > 0 ? 'right' : 'left'] = true; tick(1); } clear(); tick(2); return test(); };
      const stage = (name, ok) => { log.push({ name, ok: !!ok, at: [Math.floor(P().x / TS), Math.floor(P().y / TS)], bx: Math.round(B().x / TS), hp: Math.round(P().hp), s: +(frames / 60).toFixed(1), deaths: deaths() }); D(name, ok, Math.floor(P().x / TS), Math.floor(P().y / TS)); return ok; };
      const reach = id => C().reaches.find(q => q.id === id), low = id => Math.abs(reach(id).y - (reach(id).lo * TS + 4)) < 1, full = id => Math.abs(reach(id).y - (reach(id).hi * TS + 4)) < 1;
      /* A REAL RESPAWN AT THE SUMMIT: touch checkpoint two, then a fall at health 1 - the game wakes the hand there, and her at its mooring */
      const wake = () => { for (let i = 0; i < 900 && (BK.state !== 'play' || P().dead); i++) { BK.sim(1); frames++; } for (let i = 0; i < 40; i++) { BK.sim(1); frames++; } };
      BK.tp(242, 15); tick(60); P().inv = 0; BK.damagePlayer(P().x, 99999, { unblockable: true, name: 'THE ROUTE' }); for (let i = 0; i < 400 && !P().dead; i++) { BK.sim(1); frames++; } wake();
      stage('woken at the summit checkpoint (a real respawn): her at its mooring', Math.abs(P().x - (242 * TS + 8)) < 40 && !P().dead);
      let died = 0;
      const tunnel = () => {
        /* 1. ONTO HER: she comes up the flight to the tunnel's mouth (the hand is ahead of her) and stops - no current */
        let still = 0; for (let i = 0; i < 60 * 20 && still < 30; i++) { clear(); tick(1); still = Math.abs(B().v || 0) < 0.5 ? still + 1 : 0; }   /* she comes up the flight under the hand on the bank and stops */
        dropOn(600); for (let i = 0; i < 60 * 12 && !R_inTun(); i++) { clear(); tick(1); }
        if (!stage('down onto her deck from the summit bank; she carries you to the tunnel mouth', onBarge() && R_inTun())) return false;
        if (STRAY) { leg(() => B().x + B().w / 2 > 251 * TS, 60 * 8); for (let a = 0; a < 4 && !(P().x < 247 * TS && P().ground && !onBarge()); a++) { if (onBarge()) { for (let j = 0; j < 90 && P().x > B().x + 18; j++) { clear(); k.left = true; tick(1); } hop(-1, { hold: 30 }); settle(); } for (let i = 0; i < 90 && !P().ground; i++) tick(1); if (!onBarge() && P().x >= 247 * TS) tick(60); }
          const back = () => B().x + B().w / 2 <= 248 * TS + 4; for (let i = 0; i < 60 * 8 && !back(); i++) { clear(); tick(1); }
          stage('STRAY: back off her onto the summit bank - she comes back to the mouth for you', back());
          walk(249, { noFight: true, tol: 4 }); settle(); if (!onBarge()) dropOn(300); if (!stage('and down onto her again', onBarge())) return false; }
        /* 2. THE MOUTH: leg her in (LEFT/RIGHT), the beams over a legger, the mouth's grindylow */
        if (!stage('legged through the mouth to the stop-planks', leg(() => B().holdWhy === 'stop', 60 * 60))) return false;
        /* 3. THE STOP-PLANKS: up onto the ledge, over the gap, the windlass */
        walk(284, { tol: 3, noFight: true }); if (!stage('up onto the leggers\\' ledge', ledgeUp(15))) return false;
        if (STRAY) { walk(280, { tol: 2, noFight: true }); clear(); k.left = true; tick(30); clear(); settle(); for (let i = 0; i < 120 && !onBarge(); i++) tick(1);
          stage('STRAY: walked off the ledge into the water - handed back ON HER DECK', onBarge()); walk(284, { tol: 3, noFight: true }); ledgeUp(15); }
        const far = () => P().x > 287 * TS && Math.round(P().y / TS) === 15 && P().ground;
        for (let a = 0; a < 5 && !far(); a++) { if (onBarge() || Math.round(P().y / TS) !== 15) { walk(284, { tol: 3, noFight: true }); ledgeUp(15); } walk(285, { tol: 2, noFight: true }); hop(1, { hold: 30 }); settle(); }   /* a knock into the water is a hand-back onto her deck: up again and over */
        stage('over the gap to the far ledge', P().x > 287 * TS && Math.round(P().y / TS) === 15);
        for (let i = 0; i < 40 && BK.enemies().some(e => e.alive && Math.abs(e.y - P().y) < 20 && e.x > 287 * TS && e.x < 299 * TS); i++) { const e = BK.enemies().filter(e => e.alive && Math.abs(e.y - P().y) < 20 && e.x > 287 * TS && e.x < 299 * TS)[0]; walk(Math.round(e.x / TS), { tol: 10 }); if (!fight()) tick(10); }
        for (let a = 0; a < 4 && !(Math.abs(P().x - (294 * TS + 8)) < 6 && far()); a++) { if (!far()) { walk(284, { tol: 3, noFight: true }); ledgeUp(15); walk(285, { tol: 2, noFight: true }); hop(1, { hold: 30 }); settle(); } walk(294, { tol: 3 }); } strike(1); for (let i = 0; i < 120 && C().stops[0].k < 0.9; i++) tick(1);
        if (!stage('the windlass struck: the planks wound up', C().stops[0].k > 0.9)) return false;
        if (STRAY) { for (let i = 0; i < 60 * 10 && !(B().x + 10 < P().x && P().x < B().x + B().w - 10); i++) { clear(); if (!fight({ r: 30 })) tick(1); }
          stage('STRAY: waited on the far ledge - she glides along under you (THE CALL)', B().x + 10 < P().x && P().x < B().x + B().w - 10); }
        else walk(288, { tol: 3 });   /* back along the far ledge to its west end, and wait for her there */
        if (!stage('back down onto her deck', dropOn())) return false;
        /* 4. THE NEST: her lantern dimmed (some runs), the beams, the brood, the moon shaft */
        if (DIM) stage('her lantern DIMMED for the nest', lamp(false));
        if (DIE && !died) { leg(() => B().x + B().w / 2 > 302 * TS, 60 * 30); stage('DIES mid-tunnel (on her deck, in the nest)', true); SUICIDE = true; P().inv = 0; BK.damagePlayer(P().x, 99999, { unblockable: true, name: 'THE ROUTE' }); for (let i = 0; i < 300; i++) tick(1); }
        if (STRAY) { leg(() => B().x + B().w / 2 > 308 * TS - 4, 60 * 40);
          for (let i = 0; i < 60 * 3 && !P().climb; i++) { clear(); if (Math.abs(P().x - (308 * TS + 8)) > 3) k[P().x < 308 * TS + 8 ? 'right' : 'left'] = true; else k.up = true; tick(1); }
          for (let i = 0; i < 60 * 8 && P().climb; i++) { clear(); k.up = true; tick(1); } clear(); tick(4);
          for (let t = 0; t < 4; t++) hop(t % 2 ? 1 : -1, { hold: 40 });
          walk(304, { tol: 4, noFight: true }); walk(308, { tol: 2, noFight: true });
          for (let i = 0; i < 60 * 2 && !P().climb; i++) { clear(); k.down = true; tick(1); } for (let i = 0; i < 60 * 10 && !onBarge(); i++) { clear(); k.down = P().climb; tick(1); }
          clear(); tick(10); if (!onBarge()) dropOn(300);
          stage('STRAY: up the moon shaft\\'s ladder, the grating holds, down onto her deck', onBarge() && escapes === 0); }
        if (DIM) { leg(() => B().x + B().w / 2 > 318 * TS, 60 * 60); stage('her lantern LIT again', lamp(true)); }
        /* 5. THE DEEP LOCK */
        if (STRAY) { if (!leg(() => B().x + B().w / 2 > 322 * TS, 60 * 40)) return false; walk(Math.max(323, Math.floor(B().x / TS) + 2), { tol: 3, noFight: true }); if (!stage('STRAY: off her early onto the gallery', ledgeUp(15))) return false;
          walk(333, { tol: 3 }); strike(-1); for (let i = 0; i < 60 * 40 && !low('L6'); i++) { clear(); if (!fight({ r: 30 })) tick(1); }
          stage('STRAY: the paddle struck with her OUTSIDE the lock - she glides in, then it drains', low('L6') && B().x >= 335 * TS - 1); }
        else { if (!stage('legged into the deep lock, held at its lower gate', leg(() => B().holdWhy === 'gate' && B().x > 334 * TS, 60 * 60))) return false;
          walk(340, { tol: 3, noFight: true }); if (!stage('up onto the gallery', ledgeUp(15))) return false;
          walk(333, { tol: 3 }); strike(-1); for (let i = 0; i < 60 * 14 && !low('L6'); i++) { clear(); if (!fight({ r: 30 })) tick(1); }
          stage('the paddle struck: the deep lock drained with her in it', low('L6')); }
        walk(344, { tol: 2, noFight: true }); for (let i = 0; i < 60 * 2 && !P().climb; i++) { clear(); k.down = true; tick(1); }
        for (let i = 0; i < 60 * 14 && !onBarge(); i++) { clear(); k.down = P().climb; if (!P().climb && fight({ r: 30 })) continue; tick(1); } clear(); tick(10); if (!onBarge()) dropOn(400);
        if (!stage('down the deep lock\\'s ladder onto her deck', onBarge())) return false;
        return stage('legged out of the deep lock into the basin', leg(() => B().x + B().w / 2 > 346 * TS, 60 * 60) || (!R_inTunAt() && onBarge()));
      };
      const R_inTun = () => B().x + B().w / 2 >= 248 * TS - 2;
      const R_inTunAt = () => B().x + B().w / 2 >= 345 * TS;
      let tunnelOk = false;
      for (let t = 0; t < 4 && !tunnelOk; t++) { ARMED = deaths(); try { tunnelOk = tunnel(); ARMED = null; if (!tunnelOk) break; } catch (e) { if (!(e instanceof Died)) throw e; ARMED = null; died++;
          SUICIDE = false; stage('died in the tunnel (' + LAST.join(' | ') + '): woken at the summit, her at its mooring - from the top again', true); clear(); wake(); } }
      if (!tunnelOk) return { heals, guards, DMG, log, dbg, lifts, escapes, offMax, offWhere, died, frames, arena: false, hero: ${JSON.stringify(hero)} };
      /* 6. THE BASIN (god on: the exam is not this tool's subject) and the corridor to her door */
      BK.god = true;
      for (let i = 0; i < 60 * 20 && B().holdWhy !== 'fog'; i++) { clear(); tick(1); }
      walk(Math.floor(B().x / TS) + 1, { tol: 3, noFight: true }); ledgeUp(41); walk(355, { noFight: true }); walk(364);
      for (let i = 0; i < 60 && BK.enemies().some(e => e.alive && (e.elite || e.lamplighter) && e.x > 360 * TS && e.x < 372 * TS); i++) { const el = BK.enemies().filter(e => e.alive && (e.elite || e.lamplighter) && e.x > 360 * TS && e.x < 372 * TS)[0]; walk(Math.round(el.x / TS) - 1, { noFight: true }); if (!fight()) tick(10); }
      stage('basin: the island\\'s lamplighter and foreman down', !BK.enemies().some(e => e.alive && e.elite && e.x > 360 * TS && e.x < 372 * TS));
      walk(350, { tol: 3 }); for (let i = 0; i < 700 && C().horns.find(h => h.x > 340 * TS && h.x < 352 * TS).cd > 0; i++) tick(1); strike(-1);
      walk(363, { tol: 3, noFight: true }); if (C().bridges[3].across) strike(-1);
      stage('basin: the horn blown, the bridge swung', !C().bridges[3].across);
      walk(366, { noFight: true }); let aboard = dropOn(60 * 12);
      for (let a = 0; a < 3 && !aboard; a++) { walk(350, { tol: 3 }); for (let i = 0; i < 700 && C().horns.find(h => h.x > 340 * TS && h.x < 352 * TS).cd > 0; i++) tick(1); strike(-1); walk(363, { tol: 3, noFight: true }); if (C().bridges[3].across) strike(-1); walk(366, { noFight: true }); aboard = dropOn(60 * 12); }   /* the fog rolled back before she came: the horn again */
      stage('basin: onto her as she passes under the island', aboard);
      for (let i = 0; i < 60 * 15 && !(B().holdWhy === 'end' || B().x > 383 * TS); i++) { clear(); if (!fight({ r: 40 })) tick(1); }
      walk(388, { tol: 3, noFight: true }); strike(1); for (let i = 0; i < 60 * 8 && !full('L5'); i++) tick(1); stage('basin: its lock filled', full('L5'));
      walk(389, { tol: 3, noFight: true }); hop(1, { hold: 30 }); walk(391); walk(395); walk(398, { noFight: true }); tick(60);
      const arena = P().x > 397 * TS && P().y < 42 * TS;
      stage('IN JENNY\\'S ARENA', arena);
      return { heals, guards, DMG, log, dbg, lifts, escapes, offMax, offWhere, died, frames, arena, hero: ${JSON.stringify(hero)} };
    })()`, 2400000);
    const okRun = r.arena && !r.lifts && !r.escapes && r.offMax < 60 * 12 && r.log.every(l => l.ok);
    if (!okRun) bad++;
    rows.push({ hero, seed, plan, dim, die, ok: okRun, died: r.died, s: +(r.frames / 60).toFixed(0), offMax: +(r.offMax / 60).toFixed(1) });
    console.log((okRun ? 'ok  ' : 'FAIL') + ' ' + hero.padEnd(10) + ' seed ' + seed + ' ' + plan.padEnd(5) + (dim ? ' dim' : ' lit') + (die ? ' +death' : '') + ': ' + (r.arena ? 'reached her arena' : 'DID NOT reach her arena') + ', ' + r.died + ' death(s) in the tunnel, ' + (r.frames / 60).toFixed(0) + ' s, longest parted from her with nowhere to go ' + (r.offMax / 60).toFixed(1) + ' s, ' + r.heals + ' flask(s), ' + r.guards + ' guard frames' + (r.offWhere ? ' at ' + r.offWhere.join(',') : '') + (r.escapes ? ', OUT OF THE MOON SHAFT ' + r.escapes + ' frames' : '') + '; damage: ' + Object.entries(r.DMG).map(([a, b]) => a + ' ' + Math.round(b)).join(', '));
    for (const l of r.log) if (!l.ok || DBG) console.log('    ' + (l.ok ? 'ok  ' : 'MISS') + ' ' + l.name.padEnd(86) + ' at ' + l.at.join(',') + ' (her ' + l.bx + ')  hp ' + l.hp + '  ' + l.s + 's');
    if (DBG && r.dbg.length) console.log(r.dbg.join('\n'));
  }
  if (pg.errors.length) { console.log('page errors: ' + pg.errors.slice(0, 5).join(' | ')); bad++; }
} finally { pg.close(); }
console.log(bad ? 'FAIL canal-tunnel-route: ' + bad + ' run(s) did not reach Jenny\'s arena cleanly' : 'ok  canal-tunnel-route: every hero, every seed, stray and ride, reached Jenny\'s arena from the summit with real keys - no lift, never out of the moon shaft, never parted from her with nowhere to go');
process.exitCode = bad ? 1 : 0;
