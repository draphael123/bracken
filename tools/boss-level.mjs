/* tools/boss-level.mjs - ONE RULE FOR EVERY BOSS BOT: THE HERO FIGHTS AT THE LEVEL'S CAMPAIGN LEVEL (claude/botlevel; Daniel, 10-05).
   Before this, tools/combat-pilots.mjs set the hero to the level's campaign depth (BKT.setHeroLevel) while the per-boss pilots (greenteeth,
   wicker-queen, ram, ...) never did and fought a LEVEL-1 hero: Jenny was 21/21 at her campaign level and 11/21 at level 1. Two tools, two answers.
   - campaignLevel(id)         the level's depth on the gate chain (campaign-order depthsOf), at least 1. The hero is that level, no skills.
   - openLevelPage(opts)       tools/cdp.mjs openPage, but any evalp that calls BK.bossLab first levels every hero to campaignLevel(<its first boss>)
                               (BKT.setHeroLevel = xp + the even level-up card spread, no skills, no talents). A pilot that already sets its own hero
                               (it mentions setHeroLevel) is left alone. A run of several bosses at once cannot have one level: it is left alone, with a note.
   - override: --level=N or --hero-level=N on the command line (N = the hero's level; --level=1 is the old level-1 hero), or HERO_LEVEL=N.
   Use it as:  import { openLevelPage as openPage } from './boss-level.mjs'. It never changes a boss or a threshold; it only picks the hero. */
/* (claude/bot2, Daniel 10-05 evening) THE EARLY BOSSES: depth alone put the Hornet Queen, the Bullfrog, the Stockade, the Spore Mother and the
   Burning Village at L1-3, but a player arrives with the XP of the road behind him. campaignLevel(id) is now the HIGHER of the depth and the
   level a straight run has banked by the end of the level before it on the gate chain (four foes in five, its mini and boss, the clear share:
   tools/xp.mjs's road), and never under L3. The road's XP comes from the page (BK.xpSim) and is kept in tools/fixtures/campaign-xp.json
   (`node tools/boss-level.mjs --write-xp` after a wood changes); a level missing from it falls back to its depth (floor L3).
   campaignLevelDepth(id) is the old rule (depth, min 1), for a tool that wants it. */
import { openPage } from './cdp.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LEVELS } from '../src/level.js';
import { depthsOf, gateOf } from '../src/campaign-order.js';
import { levelOfXp } from '../src/xp.js';
import { STANDARD } from '../src/bot-profile.js';
const DEPTH = depthsOf(LEVELS), XP_FILE = fileURLToPath(new URL('./fixtures/campaign-xp.json', import.meta.url)), LV_FLOOR = 3;
const XPROW = (() => { try { return existsSync(XP_FILE) ? JSON.parse(readFileSync(XP_FILE, 'utf8')).rows || {} : {}; } catch { return {}; } })();
const BYID = Object.fromEntries(LEVELS.map(l => [l.id, l]));
/* the XP banked by the end of the level BEFORE id on the gate chain (all of its ancestors' straight runs) */
export function xpBefore(id) { let xp = 0, seen = new Set(), p = gateOf(BYID[id]); while (p && !seen.has(p)) { seen.add(p); const r = XPROW[p]; if (!r) return null; xp += r.run; p = gateOf(BYID[p]); } return xp; }
export const campaignLevelDepth = id => Math.max(1, DEPTH[id] ?? 1);
export const campaignLevel = id => { const d = DEPTH[id] ?? 1, xb = xpBefore(id); return Math.max(LV_FLOOR, d, xb === null ? 0 : levelOfXp(xb)); };
export function levelOverride(argv = process.argv.slice(2), env = process.env) {
  for (const a of argv) { const m = /^--(?:hero-)?level=(\d+)$/.exec(a); if (m) return +m[1]; }
  return env.HERO_LEVEL && /^\d+$/.test(env.HERO_LEVEL) ? +env.HERO_LEVEL : null;
}
/* the JS that levels every hero (a page-side snippet; awaited before the pilot's own code) */
export const levelJs = n => `(async()=>{const PR=await import('/src/progression.js'),P=BKT.PROG;P.skillOwned=P.skillOwned||{};P.loadouts=P.loadouts||{};for(const h of PR.HERO_IDS){BKT.setHeroLevel(h,${n});P.skillOwned[h]={};P.loadouts[h]=[];if(P.talents)P.talents[h]={};}return true;})()`;
/* --profile=NAME (or BOT_PROFILE=NAME): the boss bot's profile for every bossLab this page runs that names none (src/bot-profile.js). Left out,
   the STANDARD (claude/bot2: 'human', the calibrated player); --profile=legacy is the old bot. --first adds a first attempt. */
export function profileOverride(argv = process.argv.slice(2), env = process.env) { let p = null; for (const a of argv) { const m = /^--profile=([\w+]+)$/.exec(a);   /* (claude/underleaf2: was [w+], which matched only the letter w - --profile=human+dry was silently ignored) */ if (m) p = m[1]; }
  p = p || env.BOT_PROFILE || STANDARD; if (argv.includes('--first') && !p.includes('+first')) p += '+first'; return p; }
export async function openLevelPage(opts = {}) {
  const pg = await openPage(opts), evalp0 = pg.evalp, ov = levelOverride(), prof = profileOverride(); let warned = false;
  const reload0 = pg.reload; if (reload0) pg.reload = async (...a) => { const r = await reload0.apply(pg, a); await evalp0(`(window.BK.labProfile=${JSON.stringify(prof)},true)`).catch(() => {}); return r; };
  await evalp0(`(window.BK.labProfile=${JSON.stringify(prof)},true)`).catch(() => {});
  pg.evalp = async (expr, timeout) => {
    if (typeof expr === 'string' && expr.includes('bossLab(') && !expr.includes('setHeroLevel')) {
      const ids = (/bosses\s*:\s*\[([^\]]*)\]/.exec(expr) || [, ''])[1].match(/[A-Za-z0-9_]+/g) || [];
      const n = ov ?? (ids.length === 1 ? campaignLevel(ids[0]) : null);
      if (n != null) await evalp0(levelJs(n), 60000);
      else if (!warned) { warned = true; console.error('boss-level: several bosses (or none named) in one run - heroes left at the page default; fight them one level at a time'); }
    }
    return evalp0(expr, timeout);
  };
  return pg;
}

/* node tools/boss-level.mjs --write-xp : refresh tools/fixtures/campaign-xp.json from the page (BK.xpSim, the road a straight run walks) and
   print every boss level's campaign level, old (depth) and new. */
if (process.argv[1] && /boss-level.mjs$/.test(process.argv[1]) && process.argv.includes('--write-xp')) {
  const pg = await openPage({ audio: false, fonts: false });
  try { const rows = await pg.evalp('BK.xpSim()', 600000), out = {};
    for (const r of rows) out[r.id] = { run: Math.round(0.8 * r.foeXp) + r.bossXp + r.clear, foeXp: r.foeXp, bossXp: r.bossXp, clear: r.clear };
    writeFileSync(XP_FILE, JSON.stringify({ note: 'tools/boss-level.mjs --write-xp: a straight run per level (0.8 of its foes, its mini and boss, the clear share), from BK.xpSim', rows: out }, null, 1) + String.fromCharCode(10));
    for (const k of Object.keys(out)) XPROW[k] = out[k];
    for (const l of LEVELS.filter(l => l.id in out)) console.log(l.id.padEnd(14) + ' depth ' + String(DEPTH[l.id] ?? '-').padStart(3) + '  xp before ' + String(xpBefore(l.id)).padStart(7) + '  campaign L' + campaignLevel(l.id) + '  (was L' + campaignLevelDepth(l.id) + ')');
  } finally { pg.close(); } }
