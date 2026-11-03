// tools/page-recycle.mjs - A PAGE THAT IS REPLACED EVERY ~6 BK.load CALLS (claude/botmem, 11-03; botaudit sec.4).
// BK.load leaks 40-65 MB of NATIVE memory per call and nothing in the page frees it; a tool that puts twelve loads in one page crosses
// memguard's 3 GB cap or the free-RAM floor and is killed, then reports "page CRASHED" as a red. This hands the tool a fresh page (a fresh browser
// context, as boss-run does) when the count of loads would pass `every`, and reruns ONE call whose page died to the machine, labelled.
//   const rc = recycler({ init: async pg => { await pg.evalp(src); } });          // opts: openPage options, open: opener, every: 6
//   const row = await rc.run(pg => pg.evalp(js), 3);                              // 3 = how many BK.loads that call makes
//   row.infraRetry === true  -> the first try's page was killed by the machine, this row is the rerun's
//   a second death throws an Error whose message starts 'INFRA-KILLED:' and e.infraKilled === true (report it, do not count it as a red)
//   rc.reset() after a NON-infra error (the old tools reopened the page on any error); rc.errors(), rc.stats(), await rc.close()
// LITE: BRACKEN_LITE=1 (or the tool's --lite) opens the page with cdp.mjs LITE_ARGS. Default off. BRACKEN_RECYCLE_EVERY=N overrides K (0 = never recycle).
import { openPage } from './cdp.mjs';
import { INFRA_RE } from './infra-kill.mjs';

export const liteOn = () => process.env.BRACKEN_LITE === '1';
export function recycler({ open = openPage, opts = {}, init = async () => {}, every = process.env.BRACKEN_RECYCLE_EVERY === undefined ? 6 : +process.env.BRACKEN_RECYCLE_EVERY, log = m => console.log(m) } = {}) {
  let pg = null, loads = 0, opened = 0, retries = 0, killed = 0, errs = [];
  const popts = { audio: false, fonts: false, ...(liteOn() ? { lite: true } : {}), ...opts };
  const drop = async () => { if (pg) { try { errs.push(...pg.errors.slice(0, 3)); } catch {} try { await pg.close(); } catch {} pg = null; } };
  const fresh = async () => { await drop(); pg = await open(popts); try { await init(pg); } catch (e) { await drop(); throw e; } loads = 0; opened++; return pg; };
  const isInfra = (e, p) => !!(p && p.infra) || INFRA_RE.test(String(e && e.message));
  return {
    async page(n = 0) { if (!pg || (every > 0 && loads > 0 && loads + n > every)) await fresh(); loads += n; return pg; },
    async run(fn, n = 1) {
      let p = await this.page(n);
      try { return await fn(p); }
      catch (e) {
        if (!isInfra(e, p)) throw e;
        const why = p && p.killedByGuard && p.killedByGuard(), tag = why ? 'memguard killed pid ' + why.pid + ' at ' + why.mb + ' MB (' + why.why + ')' : String(e.message).slice(0, 80);
        retries++; log('  [infra-retry] ' + tag + ' - rerunning once on a fresh page');
        await drop(); p = await this.page(n);
        try { const r = await fn(p); if (r && typeof r === 'object') r.infraRetry = true; return r; }
        catch (e2) { if (!isInfra(e2, p)) throw e2; killed++; await drop(); const k = new Error('INFRA-KILLED: ' + String(e2.message).slice(0, 100)); k.infraKilled = true; throw k; }
      }
    },
    async reset() { await drop(); },
    errors() { return [...errs, ...(pg ? pg.errors : [])]; },
    stats: () => ({ opened, retries, infraKilled: killed }),
    async close() { await drop(); },
  };
}
