import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEVELS} from '../src/level.js';
const s=readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),world=s.slice(s.indexOf('function drawWorld('));
assert(world.indexOf('drawScenery(cx, cy)')<world.indexOf('const s = tileSpr['),'all pass-through scenery precedes collision tiles');
assert(s.includes('if(edge&&p[k]+p[k+1]+p[k+2]<150)'),'dark outer outlines are removed from scenery');
assert(s.includes("P.climb || P.cling")&&s.includes('SFX.clank(); dust(P.x+dir*6'),'wall grips have a pose, contact sound and dust');
const L=LEVELS.find(l=>l.id==='hanging').build();assert(L.hangingTown);const houses=L.ents.filter(e=>e.t==='deco'&&['hangingHouse','villageHall'].includes(e.kind));assert.equal(houses.length,L.ents.filter(e=>e.t==='door').length);assert.equal(houses.filter(h=>h.kind==='villageHall').length,2);assert((L.moversExtra||[]).filter(m=>m.kind==='lift').every(m=>Number.isFinite(m.top)));
console.log('Scenery behind tiles, softened outline-free art, wall-grip feedback, '+houses.length+' homes and two landmarks.');
