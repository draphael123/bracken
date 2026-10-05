/* tools/boss-level.mjs - ONE RULE FOR EVERY BOSS BOT: THE HERO FIGHTS AT THE LEVEL'S CAMPAIGN LEVEL (claude/botlevel; Daniel, 10-05).
   Before this, tools/combat-pilots.mjs set the hero to the level's campaign depth (BKT.setHeroLevel) while the per-boss pilots (greenteeth,
   wicker-queen, ram, ...) never did and fought a LEVEL-1 hero: Jenny was 21/21 at her campaign level and 11/21 at level 1. Two tools, two answers.
   - campaignLevel(id)         the level's depth on the gate chain (campaign-order depthsOf), at least 1. The hero is that level, no skills.
   - openLevelPage(opts)       tools/cdp.mjs openPage, but any evalp that calls BK.bossLab first levels every hero to campaignLevel(<its first boss>)
                               (BKT.setHeroLevel = xp + the even level-up card spread, no skills, no talents). A pilot that already sets its own hero
                               (it mentions setHeroLevel) is left alone. A run of several bosses at once cannot have one level: it is left alone, with a note.
   - override: --level=N or --hero-level=N on the command line (N = the hero's level; --level=1 is the old level-1 hero), or HERO_LEVEL=N.
   Use it as:  import { openLevelPage as openPage } from './boss-level.mjs'. It never changes a boss or a threshold; it only picks the hero. */
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
const DEPTH = depthsOf(LEVELS);
export const campaignLevel = id => Math.max(1, DEPTH[id] ?? 1);
export function levelOverride(argv = process.argv.slice(2), env = process.env) {
  for (const a of argv) { const m = /^--(?:hero-)?level=(\d+)$/.exec(a); if (m) return +m[1]; }
  return env.HERO_LEVEL && /^\d+$/.test(env.HERO_LEVEL) ? +env.HERO_LEVEL : null;
}
/* the JS that levels every hero (a page-side snippet; awaited before the pilot's own code) */
export const levelJs = n => `(async()=>{const PR=await import('/src/progression.js'),P=BKT.PROG;P.skillOwned=P.skillOwned||{};P.loadouts=P.loadouts||{};for(const h of PR.HERO_IDS){BKT.setHeroLevel(h,${n});P.skillOwned[h]={};P.loadouts[h]=[];if(P.talents)P.talents[h]={};}return true;})()`;
export async function openLevelPage(opts = {}) {
  const pg = await openPage(opts), evalp0 = pg.evalp, ov = levelOverride(); let warned = false;
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
