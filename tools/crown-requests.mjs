import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import vm from'node:vm';import{LEVELS}from'../src/level.js';
const L=LEVELS.find(l=>l.id==='crown').build(),s=readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),noop=()=>{};
/* (2026-09-24) THE GALLERY IS GONE and her chandeliers pin her instead: no pillars, no gallery row, and three chandeliers low enough to cut (tools/queen-chandelier.mjs plays it) */
assert.equal(L.ents.filter(e=>e.t==='support').length,0,'the gallery pillars are gone');assert.equal(L.arena&&L.arena.gallery,undefined,'the arena has no gallery');
{const ch=L.ents.filter(e=>e.t==='weight'&&e.gq);assert.equal(ch.length,6);for(const c of ch)assert((c.y+c.len)*16>=L.arena.floor-80,'a chandelier hangs within a jump and a swing of the hall floor');}
assert(L.interiors.some(r=>r[0]===470&&r[1]===509&&r[4]==='forge'));assert(L.interiors.some(r=>r[0]===762&&r[1]===809&&r[4]==='royal'));assert.equal(L.ents.filter(e=>e.unstable).length,3);
console.log('Highcrown: two additional encounters, three unstable chandeliers; the Queen\'s gallery is gone and her six chandeliers hang within reach.');
