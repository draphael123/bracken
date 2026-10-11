/* tools/weapon-skins.mjs - A WEAPON SKIN IS THE WEAPON, NOT A RECOLOUR OF THE CHARACTER (Daniel, 2026-10-02).
   The store's WEAPONS tab sells swords whose palette is {s, S}. heroSet() used to merge that into the hero's own palette, where 's'/'S' are
   the knight's helm, arms and legs and the pyromancer's whole robe - so buying Ember Blade turned the hero into an ember statue.
   For every hero x skin x weapon this bakes the hero in the STEEL weapon and in that weapon and asserts:
     1. only WEAPON pixels differ (the diff is inside the weapon mask: the pixels the weapon palette is able to reach at all), in the store
        frames for every skin and in the FULL combat set (every pose, mirrored, hurt, white, bare) for the default skin;
     (the freebooter's boxes skip the hip rows: her holstered pistol is a weapon pixel there)
     2. the head, torso and legs (helm / cowl, body, hem) are untouched in the idle frame, whatever the weapon - the probe is a fixed box, not derived from the bake,
        so a baker that lets the weapon palette into the body fails it even if the mask followed along;
     3. a non-steel weapon VISIBLY changes the weapon (>= MIN_PX pixels in the swing frames). Needs the page (Chrome over CDP). */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';

const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const swordBlock = src.slice(src.indexOf('const SWORDS = ['), src.indexOf('const UPGRADES = ['));
const SWORDS = [...swordBlock.matchAll(/\{ id: '([^']+)'/g)].map(m => m[1]);
assert.ok(SWORDS.length >= 9 && SWORDS[0] === 'steel', 'could not read the SWORDS table');
const HEROES = ['knight', 'pyro', 'paladin', 'pirate', 'reaper', 'warden', 'geomancer', 'berserker'];
const MIN_PX = 6;

const pg = await openPage({ audio: false, fonts: false });
try {
  const out = await pg.evalp(`(async () => {
    BK.manualSimulation = true;
    const swords = ${JSON.stringify(SWORDS)}, heroes = ${JSON.stringify(HEROES)}, skins = BKT.skinIds();
    const canv = (o, path, acc) => { if (!o) return; if (o.getContext) { acc.push([path, o]); return; } if (Array.isArray(o)) o.forEach((v, i) => canv(v, path + '[' + i + ']', acc)); else if (typeof o === 'object') for (const k in o) canv(o[k], path + '.' + k, acc); };
    const grab = set => { const acc = []; canv(set, '', acc); const m = new Map(); for (const [p, c] of acc) m.set(p, { w: c.width, h: c.height, d: c.getContext('2d').getImageData(0, 0, c.width, c.height).data }); return m; };
    const diff = (a, b) => { const out = new Map(); for (const [p, A] of a) { const B = b.get(p); if (!B || A.w !== B.w || A.h !== B.h) { out.set(p, null); continue; } const s = new Set(); for (let i = 0; i < A.d.length; i += 4) if (A.d[i] !== B.d[i] || A.d[i + 1] !== B.d[i + 1] || A.d[i + 2] !== B.d[i + 2] || A.d[i + 3] !== B.d[i + 3]) s.add(i / 4); out.set(p, s); } return out; };
    const SENT = [{ s: '#ff00ff', S: '#00ffff' }, { s: '#00ff00', S: '#ffff00' }];   /* two throwaway weapon palettes: what they both change IS what a weapon can reach */
    const rows = [], bad = [];
    const bake = (h, sk, w, full) => { const s = BKT.heroSet(sk, w, full ? false : true, h); return grab(s); };
    const withPal = (h, sk, pal, full) => bake(h, sk, { pal }, full);
    for (const h of heroes) {
      for (const full of [false, true]) {
        for (const sk of (full ? ['bracken'] : skins)) {
          const steel = bake(h, sk, 'steel', full);
          const m0 = withPal(h, sk, SENT[0], full), m1 = withPal(h, sk, SENT[1], full), mask = diff(m0, m1);
          for (const w of swords) {
            if (w === 'steel') continue;
            if (full && !['ember', 'moon'].includes(w)) continue;
            const D = diff(steel, bake(h, sk, w, full));
            let outside = 0, total = 0, atk = 0, head = 0;
            for (const [p, set] of D) {
              if (!set) { bad.push([h, sk, w, p, 'size changed']); continue; }
              const M = mask.get(p) || new Set();
              for (const px of set) { total++; if (!M.has(px)) { outside++; if (bad.length < 12) bad.push([h, sk, w, p, 'px ' + px + ' is not a weapon pixel']); } }
              if (!full && /atk/.test(p)) atk += set.size;
              if (!full && /idle\\[0\\]/.test(p)) { const W = steel.get(p).w; const boxes = h === 'pyro' ? [[8, 17, 0, 7], [9, 17, 13, 17]] : h === 'pirate' ? [[11, 19, 6, 11], [11, 18, 12, 14], [11, 18, 18, 21]] : [[11, 19, 6, 11], [11, 18, 12, 21]]; for (const px of set) { const x = px % W, y = Math.floor(px / W) - 24; if (boxes.some(([x0, x1, y0, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1)) head++; } }
            }
            rows.push({ h, sk, w, full, total, outside, atk, head });
          }
        }
      }
    }
    return { rows, bad };
  })()`);
  const nonSteel = out.rows;
  const fails = [];
  for (const r of nonSteel) {
    if (r.outside) fails.push(r.h + '/' + r.sk + '/' + r.w + (r.full ? ' (full set)' : '') + ': ' + r.outside + ' of ' + r.total + ' changed pixels are not weapon pixels');
    if (r.head) fails.push(r.h + '/' + r.sk + '/' + r.w + ': the head/body changed (' + r.head + ' px) under a weapon skin');
    if (!r.full && r.atk < MIN_PX) fails.push(r.h + '/' + r.sk + '/' + r.w + ': the weapon barely changes (' + r.atk + ' px in the swing)');
  }
  const seen = new Set(nonSteel.map(r => r.h));
  for (const h of HEROES) assert.ok(seen.has(h), 'hero ' + h + ' was not checked');
  if (fails.length) { console.error('WEAPON SKINS TOUCH MORE THAN THE WEAPON:\n  ' + [...new Set(fails)].slice(0, 25).join('\n  ') + '\n  e.g. ' + JSON.stringify(out.bad.slice(0, 4))); process.exit(1); }
  assert.deepEqual(pg.errors, []);
  console.log('weapon-skins: ok - ' + nonSteel.length + ' hero x skin x weapon bakes; only weapon pixels change, the head never does, every weapon shows');
} finally { pg.close(); }
