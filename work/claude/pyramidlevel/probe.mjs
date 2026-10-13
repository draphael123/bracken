// work/claude/pyramidlevel/probe.mjs - a quick page probe of the second half's machines (claude/pyramidlevel; not a suite tool: tools/sealed-pyramid-half.mjs is)
import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const TS = 16, out = [];
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'sealedpyramid')); BK.state = 'play'; BK.god = true; BK.sim(5);
    const P = () => BK.P, K = () => BK.sealedPyramid(), k = BK.keys, clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
    const put = (c, row) => { P().x = c * TS + 8; P().y = row * TS; P().vx = P().vy = 0; BK.sim(2); };
    const tr = id => K().traps.find(t => t.id === id), n = () => JSON.parse(JSON.stringify(K().n));
    const alive = (x0, x1) => BK.enemies().filter(e => e.alive && e.x > x0 * TS && e.x < x1 * TS).map(e => (e.cnSkin || e.t) + (e.elite ? '*' : ''));
    /* tombs */
    put(500, 57); const f0 = BK.enemies().length; put(505, 57); BK.sim(200); out.push('TOMB h1: ' + K().tombs.find(q => q.id === 'h1').st + ', foes +' + (BK.enemies().length - f0) + ' ' + alive(500, 512).join(','));
    /* gas1 on its guard */
    put(630, 51); BK.sim(30); out.push('gas1 before: ' + alive(640, 650).join(',')); const n0 = n(); put(637, 51); BK.sim(60); out.push('gas1: st ' + tr('gas1').st + ' gassed ' + (n().gassed - n0.gassed) + ' killed ' + (n().killed - n0.killed) + ' left ' + alive(640, 650).join(','));
    /* oil1 */
    put(742, 48); BK.sim(30); out.push('oil1 before: ' + alive(748, 761).join(',')); const n1 = n(); put(745, 48); BK.sim(90); out.push('oil1: st ' + tr('oil1').st + ' burns ' + (n().burns - n1.burns) + ' killed ' + (n().killed - n1.killed) + ' left ' + alive(748, 761).join(','));
    /* flood1: tread, watch the water, swim up */
    put(864, 48); const pool = () => BK.level ? null : null; let lv = []; for (let i = 0; i < 300; i++) { BK.sim(1); if (i % 30 === 0) lv.push(+(tr('flood1').lvl || 0).toFixed(2)); }
    out.push('flood1 levels: ' + lv.join(' ') + ' swim ' + !!P().swim + ' at ' + Math.floor(P().x / TS) + ',' + Math.floor(P().y / TS));
    clear(); for (let i = 0; i < 400 && !(P().ground && P().y <= 42 * TS + 2 && P().x > 879 * TS); i++) { k.right = true; k.up = true; k.jump = (i % 20) < 10; BK.sim(1); } clear();
    out.push('flood1 swim-up: at ' + Math.floor(P().x / TS) + ',' + (P().y / TS).toFixed(1) + ' ground ' + P().ground);
    /* flood2 */
    put(944, 54); BK.sim(5); let lv2 = []; for (let i = 0; i < 480; i++) { BK.sim(1); if (i % 40 === 0) lv2.push(+(tr('flood2').lvl || 0).toFixed(2)); }
    out.push('flood2 levels: ' + lv2.join(' ') + ' elite left ' + alive(930, 950).join(','));
    clear(); for (let i = 0; i < 700 && !(P().ground && P().x > 951 * TS); i++) { k.right = true; k.up = true; k.jump = (i % 20) < 10; BK.sim(1); } clear();
    out.push('flood2 swim-up: at ' + Math.floor(P().x / TS) + ',' + (P().y / TS).toFixed(1) + ' ground ' + P().ground);
    out.push('n ' + JSON.stringify(n()));
    return out.join('\\n'); })()`, 300000);
  console.log(r); console.log('errors', pg.errors.slice(0, 5));
} finally { pg.close(); }
