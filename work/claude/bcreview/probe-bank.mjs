import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const TS = 16; const out = {};
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.god = true; BK.sim(5);
    for (const e of BK.enemies()) if (!e.boss) e.alive = false;
    const P = () => BK.P, k = BK.keys; const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
    BK.tp(527, 29); for (let i=0;i<120;i++) BK.sim(1);
    const B = BK.boss; B.hp = B.maxHp * 0.55; 
    for (let i=0;i<600;i++) { BK.sim(1); }
    out.ph = B.phase; out.mode = B.mode;
    // stand next to the west lever on the bank
    for (const tx of [525, 526, 527, 528, 530, 534]) { BK.tp(tx, 29); for (let i=0;i<20;i++) BK.sim(1); out['at'+tx] = { x: P().x/TS, y: P().y/TS, ground: P().ground, cell: BK.cellGet ? BK.cellGet(tx, 29) : null }; }
    BK.tp(527, 29); for (let i=0;i<20;i++) BK.sim(1);
    const H = BK.buriedCityHands(); out.interact = H.interact(P()); out.pos = [P().x, P().y];
    // pull from the bank top
    P().y = 27*16; P().x = 527*16+8; out.interactTop = H.interact(P());
    P().y = 28*16; out.interact28 = H.interact(P());
    P().y = 29*16; out.interact29 = H.interact(P());
    P().y = 30*16; out.interact30 = H.interact(P());
    return out; })()`, 120000);
  console.log(JSON.stringify(r, null, 1));
  if (pg.errors.length) console.log('errors', pg.errors.slice(0,3));
} finally { pg.close(); }
