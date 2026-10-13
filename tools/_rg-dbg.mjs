// scratch debug (claude/redgorgerework) - not a check; deleted before the lane ends
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const js = process.argv[2];
  const r = await pg.evalp(`(async()=>{ const { LEVELS, T: TT } = await import('/src/level.js'); const TS = 16; BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'redgorge')); BK.start ? BK.start() : (BK.state = 'play'); BK.sim(2); const P = () => BK.P, k = BK.keys, out = [];
    const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
    ${js}
    return out; })()`, 600000);
  console.log(JSON.stringify(r, null, 0));
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 5).join(' | '));
} finally { pg.close(); }
