// tools/lookpass.mjs — READABILITY BY THE PIXELS, HEADLESS. The owner sees a walkway he cannot make out in a dark cave, or a
// pale boss under pale water, the moment he looks; no tile check sees either. This runs src/lookpass.js (BK.lookPass) on
// every campaign level and writes what it saw:
//   node tools/lookpass.mjs                         every level
//   node tools/lookpass.mjs undercrown,deep         those levels
//   OUT=some/dir PORT=5892 node tools/lookpass.mjs  where the pictures go (a folder per level) and the port to serve on
// Every frame that fails (footing that does not stand off its background, a creature lost in what is behind it, a play
// space too dark to read) is saved as a PNG with the failure drawn round it, and one picture per level is saved clean or
// not. lookpass.json beside them has every frame's numbers. REPORT MODE: it prints and exits 0 unless the page throws.
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { openPage, ROOT } from './cdp.mjs';

const OUT = process.env.OUT || join(ROOT, 'audits', 'readability');
//   node tools/lookpass.mjs --at "hurricane:60,18 flotilla:32,22"   a picture at each of those tiles only (into OUT/at/<level>)
const AT = process.argv.indexOf('--at') >= 0 ? process.argv[process.argv.indexOf('--at') + 1] : null;
const arg = AT ? '' : process.argv[2] || '';

async function main() {
  const pg = await openPage();
  /* FRONTOFF=1 draws the foreground as it was before the hero-occlusion rule (nothing fades off him), for a before-and-after by the pixels */
  if (process.env.FRONTOFF) await pg.evalp('BK.frontOff = true');
  /* a place is level:x,y or level:selector (tile=RAIL, ent=deco.column, ent=check#2, pool=foul: see points() in src/lookpass.js) */
  const at = {}; if (AT) for (const tok of AT.split(/\s+/).filter(Boolean)) { const k = tok.indexOf(':'), id = tok.slice(0, k), s = tok.slice(k + 1);
    (at[id] = at[id] || []).push(/^\d+,\d+$/.test(s) ? s.split(',').map(Number) : s); }
  const ids = AT ? Object.keys(at) : arg ? arg.split(',') : await pg.evalp('import("/src/level.js").then(m => m.LEVELS.filter(l => (!l.hidden || l.secret) && l.id !== "custom").map(l => l.id))');
  mkdirSync(OUT, { recursive: true });
  const all = [], rows = [];
  for (const id of ids) {
    const t0 = Date.now();
    let res;
    try { res = await pg.evalp('BK.lookPass({ levels: [' + JSON.stringify(id) + ']' + (AT ? ', at: ' + JSON.stringify(at[id]) : '') + ' }).then(r => r.frames.map((f, k) => Object.assign({}, f, { png: !!f.png, k })))'); }
    catch (e) { console.log(id.padEnd(11) + ' FAILED ' + e.message.split('\n')[0]); continue; }
    const dir = AT ? join(OUT, 'at', id) : join(OUT, id); mkdirSync(dir, { recursive: true });
    for (const f of res) {
      if (f.error) { console.log(id + ': ' + f.error); continue; }
      if (f.png) {
        const url = await pg.evalp('window.__lookPass.frames[' + f.k + '].png');
        const tags = [f.dark.bad && 'dark', f.foot.bad && 'footing', f.creatures.some(c => c.bad) && 'creature', f.hero && f.hero.bad && 'hero', f.tells && f.tells.some(t => t.bad) && 'tell', f.boss && 'boss-' + f.boss.t, f.rep && 'rep'].filter(Boolean).join('+') || 'clean';
        f.file = join(dir, String(f.i).padStart(2, '0') + '-' + f.kind + '-' + f.tx + '_' + f.ty + '-' + tags + '.png');
        writeFileSync(f.file, Buffer.from(url.split(',')[1], 'base64'));
      }
      delete f.png; all.push(f);
    }
    const ok = res.filter(f => !f.error), n = ok.length;
    const darkBad = ok.filter(f => f.dark.bad).length, footBad = ok.filter(f => f.foot.bad).length, heroBad = ok.filter(f => f.hero && f.hero.bad).length;
    const cre = ok.flatMap(f => f.creatures), creBad = cre.filter(c => c.bad);
    const tells = ok.flatMap(f => f.tells || []), tellBad = tells.filter(t => t.bad), tellMin = tells.length ? Math.min(...tells.map(t => t.min)) : null;
    const med = a => a.length ? a.slice().sort((x, y) => x - y)[a.length >> 1] : null;
    /* THE SCORE, out of ten, so a level can be called done or not: ten less five for the share of frames too dark, five for the share with unreadable
       footing, eight for the share of creatures lost in their background, and three for the share of frames with the hero hidden. Under 8 is not done. */
    const score = +Math.max(0, 10 - 5 * darkBad / Math.max(1, n) - 5 * footBad / Math.max(1, n) - 8 * (cre.length ? creBad.length / cre.length : 0) - 3 * heroBad / Math.max(1, n)).toFixed(1);
    const row = { id, score, frames: n, darkBad, footBad, heroBad, creatures: cre.length, creBad: creBad.length, meanL: med(ok.map(f => f.dark.mean)), p90L: med(ok.map(f => f.dark.p90)),
      footE: med(ok.map(f => f.foot.median).filter(x => x !== null)), lowFoot: +(ok.reduce((s, f) => s + f.foot.low, 0) / Math.max(1, ok.reduce((s, f) => s + f.foot.n, 0))).toFixed(2),
      worstCreatures: [...new Set(creBad.map(c => c.t))].join(' '), tells: tells.length, tellBad: tellBad.length, tellMin, tellMed: med(tells.map(t => t.min)), secs: Math.round((Date.now() - t0) / 1000) };
    rows.push(row);
    console.log(id.padEnd(11), String(score.toFixed(1)).padStart(4), String(n).padStart(3) + ' frames', ' dark ' + String(darkBad).padStart(2), ' footing ' + String(footBad).padStart(2), ' hero ' + String(heroBad).padStart(2), ' creatures ' + creBad.length + '/' + cre.length,
      ' L* ' + row.meanL + '/' + row.p90L, ' footE ' + row.footE, ' lowfoot ' + row.lowFoot, ' tells ' + tellBad.length + '/' + tells.length + (tellMin !== null ? ' min ' + tellMin.toFixed(1) + ' med ' + row.tellMed : ''), row.worstCreatures ? ' [' + row.worstCreatures + ']' : '', ' ' + row.secs + 's');
  }
  const jsonOut = join(OUT, AT ? 'lookpass-at.json' : 'lookpass.json');
  writeFileSync(jsonOut, JSON.stringify({ rows, frames: all }, null, 1));
  if (pg.errors.length) console.log('page errors:\n  ' + [...new Set(pg.errors)].slice(0, 8).join('\n  '));
  console.log('\nwrote ' + jsonOut);
  pg.close();
  process.exit(pg.errors.length ? 1 : 0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
