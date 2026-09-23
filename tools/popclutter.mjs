// tools/popclutter.mjs — HOW MUCH FLOATS OVER A FIGHT, AND WHAT SITS ON TOP OF A TELL?
// The yellow ! and the red !! are the most important marks in a fight, and they are the same floating number() text as
// the damage. This runs real fights headless (BK.bossLab's bot in a boss room, and a small bot in the ambush rooms) and,
// every frame, counts the floating marks on screen (BK.textLab.nums) and which of them overlap; every third frame it draws
// the frame with the text recorder on and lists every other string drawn across a tell (a hint box, the boss bar, the HUD).
//   node tools/popclutter.mjs                         the default set: four bosses and three ambush rooms
//   node tools/popclutter.mjs boss:kings,amb:wood     choose (boss:<level id> runs its arena, amb:<level id> its ambushes)
//   NUMBERS=0 node tools/popclutter.mjs               with the damage numbers option off
// Report mode: prints, writes popclutter.json, exits 0.
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { openPage, ROOT } from './cdp.mjs';

const OUT = process.env.OUT || join(ROOT, 'audits', 'readability');
const arg = process.argv[2] || 'boss:kings,boss:spire,boss:waymeet,boss:undercrown,boss:deep,amb:wood,amb:stockade,amb:waymeet';

async function pageClutter(input) {
  const BK = window.BK, TL = BK.textLab, lvm = await import('/src/level.js');
  BK.SET.numbers = input.numbers;
  const kindOf = t => t === '!!' ? 'red !!' : t === '!' ? 'yellow !' : typeof t === 'number' || /^[-+]?\d+$/.test(String(t)) ? 'number' : 'mark ' + String(t);
  const boxOf = (n, cx, cy) => { const s = String(n.txt), x = n.x - cx, y = n.y - cy; if (s === '!!') return [x - 8, y - 2, 16, 11]; const w = s.length * 8; return [x - w / 2, y, w, 8]; };
  const hit = (a, b) => Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]) > 0 && Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]) > 0;
  const runs = [];
  const newRun = name => ({ name, frames: 0, hist: {}, max: 0, maxAt: null, over3: 0, tells: 0, tellsCovered: 0, pairs: {}, overText: {}, sampleFrames: 0 });
  let run = null, fno = 0;
  const G = BK.g;
  const sample = () => {
    const v = BK.view, L = BK.L; if (!L || BK.state !== 'play') return;
    const cx = Math.max(0, Math.min(L.W * 16 - v.VW, v.x)), cy = Math.max(0, Math.min(L.H * 16 - v.VH, v.y));
    const ns = TL.nums().filter(n => n.life > 0).map(n => ({ n, b: boxOf(n, cx, cy), k: kindOf(n.txt) })).filter(q => q.b[0] + q.b[2] > 0 && q.b[0] < v.VW && q.b[1] + q.b[3] > 0 && q.b[1] < v.VH);
    run.frames++; run.hist[ns.length] = (run.hist[ns.length] || 0) + 1; if (ns.length > run.max) { run.max = ns.length; run.maxAt = ns.map(q => String(q.n.txt)).join(' '); }
    if (ns.length > 3) run.over3++;
    for (let a = 0; a < ns.length; a++) { const isTell = ns[a].k !== 'number' && ns[a].k.indexOf('!') >= 0; if (isTell && ns[a].n.life > 0.72) run.tells++;
      let covered = false;
      for (let b = 0; b < ns.length; b++) { if (a === b || !hit(ns[a].b, ns[b].b)) continue; if (b > a) { const key = [ns[a].k, ns[b].k].sort().join(' x '); run.pairs[key] = (run.pairs[key] || 0) + 1; } if (isTell) covered = true; }
      if (isTell && covered) run.tellsCovered++; }
    /* every third frame: the whole frame's text, and what is drawn across a tell */
    if (++fno % 3 === 0) { window.__textRec = []; BK.step(0); const rec = window.__textRec; window.__textRec = null; run.sampleFrames++;
      const texts = rec.filter(r => r.kind === 'text' && r.alpha > 0.05);
      const tells = texts.filter(t => t.s === '!' || t.s === '!!');
      for (const t of tells) { const tb = t.s === '!!' ? [t.x0 - 5, t.y0 - 2, 16, 11] : [t.x0, t.y0, t.w, t.h];
        for (const o of texts) { if (o === t || o.s === t.s || !o.s.trim()) continue; const ob = [o.x0, o.y0, o.w, o.h];
          if (hit(tb, ob)) { const key = (/^\d+$/.test(o.s) ? '<damage number>' : o.s.slice(0, 50)) + '  (' + o.at + ')'; run.overText[key] = (run.overText[key] || 0) + 1; } } } }
  };
  const sim0 = BK.sim;
  BK.sim = function (n = 1) { for (let i = 0; i < n; i++) { sim0.call(BK, 1); if (run) sample(); } };
  try {
    for (const job of input.jobs) {
      const [kind, id] = job.split(':'); const li = lvm.LEVELS.findIndex(l => l.id === id); if (li < 0) continue;
      if (kind === 'boss') { run = newRun('boss ' + id); fno = 0;
        await BK.bossLab({ bosses: [id], heroes: [input.hero], maxSecs: input.secs });
        runs.push(run); run = null; continue; }
      if (kind === 'amb') {
        BK.setHero(input.hero); BK.load(li); BK.state = 'play'; sim0.call(BK, 170);
        const list = BK.ambushes();
        for (let k = 0; k < list.length && k < 3; k++) { const A = list[k];
          BK.load(li); BK.state = 'play'; BK.god = true; sim0.call(BK, 120); BK.reset();
          const trig = typeof A.trigger === 'number' ? A.trigger : Math.round((A.wallL + A.wallR) / 2);
          BK.tp(trig + 1, A.row - 1); sim0.call(BK, 10);
          run = newRun('ambush ' + id + ' #' + k + ' @' + trig); fno = 0;
          const P = BK.P, keys = BK.keys;
          for (let f = 0; f < input.secs * 60; f++) {
            const foes = BK.enemies().filter(e => e.alive && !e.harmless && Math.abs(e.x - P.x) < 260 && Math.abs(e.y - P.y) < 120);
            keys.left = keys.right = keys.block = false;
            if (foes.length) { const e = foes.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0], d = e.x - P.x; P.face = Math.sign(d) || P.face;
              if (BK.telling(e) && Math.abs(d) < 60) keys.block = true; else if (Math.abs(d) > 20) keys[d > 0 ? 'right' : 'left'] = true; else if (P.atk < 0) BK.press('atk'); }
            else if (f > 600) break;
            P.hp = P.maxHp; BK.sim(1);
          }
          keys.left = keys.right = keys.block = false; BK.god = false;
          runs.push(run); run = null; await new Promise(r => setTimeout(r, 0)); }
      }
    }
  } finally { BK.sim = sim0; }
  return runs;
}

async function main() {
  const pg = await openPage();
  const input = { jobs: arg.split(','), hero: process.env.HERO || 'knight', secs: +(process.env.SECS || 90), numbers: process.env.NUMBERS !== '0' };
  const runs = await pg.evalp('(' + pageClutter.toString() + ')(' + JSON.stringify(input) + ')');
  for (const r of runs) {
    const pct = k => r.frames ? Math.round(100 * k / r.frames) : 0;
    const total = Object.entries(r.hist).reduce((s, [k, v]) => s + k * v, 0), mean = r.frames ? (total / r.frames).toFixed(2) : 0;
    let acc = 0, p95 = 0; for (const k of Object.keys(r.hist).map(Number).sort((a, b) => a - b)) { acc += r.hist[k]; if (acc >= r.frames * 0.95) { p95 = k; break; } }
    console.log('\n' + r.name + ': ' + r.frames + ' frames. floating marks on screen: mean ' + mean + ', p95 ' + p95 + ', max ' + r.max + ' (' + r.maxAt + '); more than 3 at once ' + pct(r.over3) + '% of frames');
    console.log('  tells shown ' + r.tells + ', frames a tell was overlapped by another mark ' + r.tellsCovered);
    const pairs = Object.entries(r.pairs).sort((a, b) => b[1] - a[1]); if (pairs.length) console.log('  overlapping pairs (frames): ' + pairs.slice(0, 8).map(([k, v]) => k + ' ' + v).join(' | '));
    const ot = Object.entries(r.overText).sort((a, b) => b[1] - a[1]); if (ot.length) { console.log('  drawn across a tell (sampled frames):'); for (const [k, v] of ot.slice(0, 10)) console.log('    ' + v + '  ' + k); }
  }
  mkdirSync(OUT, { recursive: true }); writeFileSync(join(OUT, 'popclutter' + (input.numbers ? '' : '-nonumbers') + '.json'), JSON.stringify(runs, null, 1));
  if (pg.errors.length) console.log('page errors:\n  ' + [...new Set(pg.errors)].slice(0, 8).join('\n  '));
  pg.close(); process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
