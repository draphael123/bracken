// PAGE TOOL: launches headless Chrome
/* tools/flag-smoke.mjs - FLAG PAGE SMOKE (testkit-d 11-13). The class this exists for: the Keep 2 crash - a node proof with its own context passed while the REAL page threw every frame.
   For each feature flag tools/cdp.mjs carries an env door for (BRACKEN_<FLAG>=1|0 -> window.BRACKEN_<FLAG>), in turn, ONE headless page at a time (a booted page is ~1.4 GB):
     1. boots the game with the door set, and asserts IN THE PAGE that the flag has that value: window.BRACKEN_<FLAG>, and the flag module's own reader (gq4pOn() ...) where the table below knows it;
     2. goes to the flag's level, and wakes its boss when a boss row is known (the lab's BK.bossLab: the same wake, arena and bot every boss table uses), ~30 s of game time, drawing every 4th frame so the
        DRAW paths run too (a sim-only run never draws, which is how a render-only throw hides); a flag with a level and no boss row walks its level instead (BK.step: update + draw, god mode, the hero steered right);
        a flag with NO known level is BOOT-ONLY: the boot and the assertion, nothing more (said in its line);
     3. fails on any console.error, page error (an uncaught exception, a rejected promise) or a failed in-page assertion. Findings of the glitch recorder (tools/glitch-log.mjs) are listed as notes, never failures.
   RAM: stops (never waits) when the PC would drop below 3 GB free with a ~1.4 GB page (needs >= 4400 MB free before each launch) or scratch/BROWSER-HOLD.flag exists; flags not yet run are listed as NOT RUN.
     node tools/flag-smoke.mjs --list                 the doors, what each is asserted against, the level / boss it goes to (node only, no browser)
     node tools/flag-smoke.mjs GQ4P GQ5P              those flags, each in turn        (--secs=30  --hero=knight  --boot-only  --inject-fault = the proof it can fail)
     node tools/flag-smoke.mjs --all                  every door in cdp.mjs, in turn
   A flag that ships ON has its '=0' (lab OFF) door tested as that door's value; the ON state is the game's default and is covered by every other tool. ROAD=ww,sk,mn,ac,hl are the road-area globals (window.__WW ...). */
import fs from 'fs'; import os from 'os'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
/* the doors, read from tools/cdp.mjs itself so a new flag is listed the day its door lands */
export function doors() {
  const src = fs.readFileSync(path.join(ROOT, 'tools', 'cdp.mjs'), 'utf8'), out = [];
  for (const m of src.matchAll(/process\.env\.BRACKEN_([A-Z0-9_]+) === '([01])'\)\s*await send\('Page\.addScriptToEvaluateOnNewDocument',\s*\{\s*source:\s*'window\.([A-Za-z0-9_]+)=(true|false)'/g)) out.push({ flag: m[1], env: 'BRACKEN_' + m[1], val: m[2], global: m[3], expect: m[4] === 'true' });
  const road = /BRACKEN_ROAD[\s\S]{0,400}?\(\{([^}]*)\}\)\[/.exec(src);
  if (road) for (const k of road[1].matchAll(/(\w+):\s*'window\.(\w+)=true'/g)) out.push({ flag: 'ROAD=' + k[1], env: 'BRACKEN_ROAD', val: k[1], global: k[2], expect: true });
  return out;
}
/* what each flag is asserted against and where it goes. mod: [src file, reader]; level: the LEVELS id; boss: a boss-rows row ('crown:mini' = the level's mini) or null */
export const MAP = {
  GQ4L: { mod: ['gq4l', 'gq4lOn'], level: 'crown', boss: 'crown' }, GQ4P: { mod: ['gq4p', 'gq4pOn'], level: 'crown', boss: 'crown:mini' }, GQ4Q: { mod: ['gq4q', 'gq4qOn'], level: 'crown', boss: 'crown' },
  GQ5P: { mod: ['gq5p', 'gq5pOn'], level: 'crown', boss: 'crown:mini' }, GQ5Q1: { mod: ['gq5q1', 'gq5q1On'], level: 'crown', boss: 'crown' }, GQ5Q2: { mod: ['gq5q2', 'gq5q2On'], level: 'crown', boss: 'crown' },
  GQ6GEO: { mod: ['gq6geo', 'gq6geoOn'], level: 'crown', boss: 'crown:mini' }, GQ6CALL: { mod: ['gq6geo', 'gq6callOn'], level: 'crown', boss: 'crown:mini' }, GQ6FIX: { mod: ['gq6fix', 'gq6fixOn'], level: 'crown', boss: 'crown:mini' },
  COL4: { mod: ['colossus4', 'col4On'], level: 'glasssea', boss: 'glasssea' }, BC5: { mod: ['buried-city5', 'bc5On'], level: 'buriedcity', boss: 'buriedcity' },
  'ROAD=ww': { mod: ['ww-flag', 'wwOn'], level: 'wispwood', boss: null }, 'ROAD=sk': { mod: ['sk-flag', 'skOn'], level: 'silk', boss: null }, 'ROAD=mn': { mod: ['mn-flag', 'mnOn'], level: 'manor', boss: null },
  'ROAD=ac': { mod: ['ac-flag', 'acOn'], level: 'academy', boss: null }, 'ROAD=hl': { mod: null, level: 'highlines', boss: null },
};
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const all = doors();
if (args.includes('--list')) {
  console.log('flag-smoke: ' + all.length + ' doors in tools/cdp.mjs');
  for (const d of all) { const m = MAP[d.flag]; console.log('  ' + d.flag.padEnd(10) + d.env + '=' + d.val + ' -> window.' + d.global + '=' + d.expect + (m && m.mod ? '; ' + m.mod[1] + '() === ' + d.expect : '; (global only)') + '   ' + (m ? (m.boss ? 'level ' + m.level + ', boss row ' + m.boss : 'level ' + m.level + ' (no boss row: walks the level)') : 'BOOT-ONLY (no level mapping)')); }
  process.exit(0);
}
const want = args.filter(a => !a.startsWith('--')), pick = args.includes('--all') ? all : all.filter(d => want.some(w => w.toUpperCase() === d.flag.toUpperCase() || w.toUpperCase() === d.env.replace('BRACKEN_', '') || (d.flag.startsWith('ROAD=') && w.toUpperCase() === 'ROAD' )));
if (!pick.length) { console.log('usage: node tools/flag-smoke.mjs --list | --all | <FLAG> [<FLAG>..]   (flags: ' + all.map(d => d.flag).join(' ') + ')'); process.exit(2); }
const SECS = +opt('secs', 30), HERO = opt('hero', 'knight');
const freeMb = () => Math.round(os.freemem() / 1048576);
const holdFlag = () => ['scratch', path.join('..', 'scratch'), path.join('..', '..', 'scratch')].some(p => fs.existsSync(path.join(ROOT, p, 'BROWSER-HOLD.flag')));
const { openPage } = await import('./cdp.mjs'), { glitchPageJs } = await import('./glitch-log.mjs'), { campaignLevel } = await import('./boss-level.mjs');
const results = [];
for (const d of pick) {
  const m = MAP[d.flag], tag = d.env + '=' + d.val + (m ? '' : '  [BOOT-ONLY]');
  if (holdFlag()) { results.push({ d, status: 'NOT RUN', why: 'scratch/BROWSER-HOLD.flag exists' }); console.log(tag + ': NOT RUN (BROWSER-HOLD.flag)'); continue; }
  if (freeMb() < 4400) { results.push({ d, status: 'NOT RUN', why: 'only ' + freeMb() + ' MB free (needs 4400: a page is ~1.4 GB and 3 GB must stay free)' }); console.log(tag + ': NOT RUN (RAM: ' + freeMb() + ' MB free, needs 4400)'); continue; }
  const saved = process.env[d.env]; process.env[d.env] = d.val; const t0 = Date.now(), r = { d, status: 'PASS', notes: [], errors: [] };
  let pg;
  try {
    pg = await openPage({ audio: false, fonts: false });
    const a = await pg.evalp(`(async()=>{const o={g:window.${d.global}};${m && m.mod ? `try{const M=await import('/src/${m.mod[0]}.js');o.fn=M.${m.mod[1]}();}catch(e){o.fnErr=String(e.message);}` : ''}return o;})()`, 60000);
    r.asserted = a;
    if (a.g !== d.expect) r.errors.push('window.' + d.global + ' is ' + a.g + ', expected ' + d.expect);
    if (m && m.mod && a.fn !== d.expect) r.errors.push(m.mod[1] + '() is ' + a.fn + (a.fnErr ? ' (' + a.fnErr + ')' : '') + ', expected ' + d.expect);
    if (m && !args.includes('--boot-only') && !r.errors.length) {
      await pg.evalp(glitchPageJs({}), 30000).catch(() => {});
      if (args.includes('--inject-fault')) await pg.evalp("requestAnimationFrame(function f(){requestAnimationFrame(f);throw new Error('INJECTED render fault (flag-smoke --inject-fault)');});true", 10000);   /* the proof it can fail: a page that throws on every frame, from the tool, not from src/ */   /* the recorder is only used here to hear console.error */
      const lvl = m.boss ? campaignLevel(m.boss.split(':')[0]) : 3;
      const hook = `{const s=BK.sim.bind(BK);let c=0;BK.sim=function(n=1){for(let i=0;i<n;i++){s(1);if(++c%4===0)BK.step(0);}};}`;
      const js = m.boss
        ? `(async()=>{BK.manualSimulation=true;const h=${JSON.stringify(HERO)};BKT.setHeroLevel(h,${lvl});BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();${hook}const r=(await BK.bossLab({bosses:[${JSON.stringify(m.boss.split(':')[0])}],heroes:[h],maxSecs:${SECS},healthMode:'normal',seed:1,profile:'human'${m.boss.includes(':') ? ',mini:true' : ''}})).rows[0]||{};return{outcome:r.outcome||r.skipped||'?',secs:r.secs,bossLeft:r.hpLeftPct,boss:r.boss};})()`
        : `(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const idx=LEVELS.findIndex(l=>l.id===${JSON.stringify(m.level)});if(idx<0)return{outcome:'NO SUCH LEVEL'};BK.setHero(${JSON.stringify(HERO)});BK.reset({fresh:true});BK.load(idx);BK.start();BK.state='play';BK.god=true;let f=0;for(;f<${SECS * 60};f++){BK.keys.right=(f%900)<600;BK.keys.left=!BK.keys.right&&(f%900)>=750;BK.step(1);}return{outcome:'walked '+${SECS}+' s',secs:${SECS}};})()`;
      r.run = await pg.evalp(js, 600000);
      if (r.run && (r.run.outcome === 'NO SUCH LEVEL')) r.errors.push('level ' + m.level + ' not in LEVELS');
      if (r.run && String(r.run.outcome).startsWith('skip')) r.notes.push('bossLab skipped: ' + r.run.outcome);
    }
    const gl = await pg.evalp('window.__GL?window.__GL.dump():null', 30000).catch(() => null);
    if (gl) { for (const e of gl.ev) if (e.kind === 'console-error' || e.kind === 'page-error') r.errors.push(e.kind + ': ' + String(e.msg).slice(0, 160)); const o = Object.entries(gl.n).filter(([k]) => !/console-error|page-error/.test(k)); if (o.length) r.notes.push('glitch notes ' + JSON.stringify(Object.fromEntries(o))); }
    for (const e of (pg.errors || []).slice(0, 5)) r.errors.push('page-error: ' + String(e).slice(0, 160));
  } catch (e) { r.errors.push('run failed: ' + String(e.message).slice(0, 200)); }
  finally { try { if (pg) pg.close(); } catch {} await new Promise(r => setTimeout(r, 5000));   /* ONE fixed 5 s settle (the OS hands a closed browser's memory back late; the RAM check above would otherwise read it as taken), never a poll */ if (saved === undefined) delete process.env[d.env]; else process.env[d.env] = saved; }
  if (r.errors.length) r.status = 'FAIL';
  r.secsWall = Math.round((Date.now() - t0) / 1000); results.push(r);
  console.log(tag + ': ' + r.status + '  asserted ' + JSON.stringify(r.asserted) + (m ? '  ' + (m.boss ? 'boss ' + m.boss : 'level ' + m.level) + ' -> ' + JSON.stringify(r.run || 'skipped (--boot-only)') : '  boot only') + '  (' + r.secsWall + ' s wall)' + (r.notes.length ? '\n    note: ' + r.notes.join('; ') : '') + (r.errors.length ? '\n    ' + [...new Set(r.errors)].join('\n    ') : ''));
}
const fail = results.filter(r => r.status === 'FAIL'), nr = results.filter(r => r.status === 'NOT RUN');
console.log('\nflag-smoke: ' + results.filter(r => r.status === 'PASS').length + ' pass, ' + fail.length + ' FAIL, ' + nr.length + ' not run' + (nr.length ? ' (' + nr.map(r => r.d.flag).join(' ') + ')' : ''));
process.exit(fail.length || nr.length ? 1 : 0);
