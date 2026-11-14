// PAGE TOOL: launches headless Chrome
/* tools/maker-walk.mjs (claude/maker) - THE EXAMPLES CAN BE FINISHED. The in-page play bot (src/playtest.js makeBot) walks each of the
   maker's EXAMPLES from START to its goal gate, in god mode (this proves the way through exists - jumps reach, lifts carry, doors
   open - not how hard the fights are). Not in the suite: it is long.   node tools/maker-walk.mjs [steps=9000] */
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';
const steps = +(process.argv[2] || 20000);
const pg = await openPage({ port: portFor(18), audio: false, seed: 2 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'), U = await import('/src/maker-ui.js'), { makeBot } = await import('/src/playtest.js'); MKR.enter(); U.closePanel(); const out = [];
    for (const ex of P.EXAMPLES) { const d = ex.make(); d.hero = 'knight'; MKR.doc = d; MKR.mount(); MKR.play(); BK.god = true;
      const gate = d.ents.find(e => e.t === 'gate'), bot = makeBot(BK, { fightThrough: true }); let s = 0, best = BK.P.x, won = false;
      /* THE HAND: the bot cannot work a mechanism, so when it stalls it is given one push - the next lever is struck, a push block is
         walked onto its plate, a key is picked up - the way a player would, and the bot carries on. What it needed is reported. */
      const used = new Set(), helps = []; let stall = 0, lastBest = 0;
      const key = (k, dn) => dispatchEvent(new KeyboardEvent(dn ? 'keydown' : 'keyup', { key: k }));
      const hand = () => { const px = BK.P.x / 16, cand = d.ents.filter(e => !used.has(e) && ['lever', 'plate', 'key', 'pushblock'].includes(e.t) && e.x > px - 30).sort((a, b) => a.x - b.x)[0]; if (!cand) return false; used.add(cand);
        if (cand.t === 'lever') { BK.tp(cand.x - 1, cand.y); BK.P.face = 1; BK.step(5); key('x', 1); BK.step(2); key('x', 0); BK.step(60); }
        else if (cand.t === 'key') { BK.tp(cand.x, cand.y); BK.step(30); }
        else if (cand.t === 'pushblock') { const pl = d.ents.find(e => e.t === 'plate' && e.x > cand.x); BK.tp(cand.x - 1, cand.y); BK.step(5); key('ArrowRight', 1); for (let i = 0; i < 400; i++) { BK.step(1); if (pl && BK.movers().concat([]).length >= 0 && BK.P.x / 16 > pl.x + 1) break; } key('ArrowRight', 0); used.add(pl); }
        else { BK.tp(cand.x, cand.y); BK.step(60); }
        helps.push(cand.t + '@' + cand.x); return true; };
      for (; s < ${steps}; s++) { if (BK.state !== 'play') { won = BK.state === 'win'; break; } bot(gate.x * 16 + 8); BK.step(1); best = Math.max(best, BK.P.x);
        if (best > lastBest + 8) { lastBest = best; stall = 0; } else if (++stall > 600) { stall = 0; if (!hand()) break; } }
      out.push({ name: ex.name, won, helps, frames: s, reached: Math.round(best / 16), gate: gate.x, at: [Math.round(BK.P.x / 16), Math.round(BK.P.y / 16)] });
      try { MKR.resume(); } catch (e) {} U.closePanel(); BK.god = false; }
    return out;
  })()`, 1800000);
  for (const x of r) console.log((x.won ? 'WON   ' : 'STUCK ') + x.name.padEnd(12) + ' frames ' + x.frames + '  hand: ' + (x.helps.join(' ') || 'none') + '  got to x=' + x.reached + ' of ' + x.gate + (x.won ? '' : '  (stopped at ' + x.at.join(',') + ')'));
  console.log('page errors: ' + (pg.errors.length ? pg.errors.slice(0, 5).join(' | ') : 'none'));
} finally { pg.close(); }
