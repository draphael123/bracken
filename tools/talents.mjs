// Skill and migration contract: every historical node has a destination, every sold skill has a gameplay consumer.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEGACY_NODES,SKILLS} from '../src/progression.js';
const s=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.equal(LEGACY_NODES.length,181);
/* PRICE FOLLOWS LEVEL, from ONE table (2026-09-23), FOR WHAT IS SOLD. The actives moved to a ladder spaced every two or three hero
   levels up to 20 (Daniel), and an ability's price is whatever its unlock level costs - never a number of its own.
   PASSIVES ARE NOT SOLD (hero-kits 1b, 2026-09-24): they arrive one a level from 1 to 24, so their level is on no price ladder. Their
   `price` is kept as HISTORY - what a version-1 save paid for one, which src/progression.js passivesToLevels pays back - so it must
   still be one of the four old passive tiers, and must never be changed. */
const PASSIVE_PAID=new Set([60,120,220,360]);
const PRICE_AT={1:60,3:100,4:120,5:140,7:190,8:220,9:240,12:360,14:400,17:460,20:520};
for(const n of SKILLS){assert(s.includes("tal('"+n.id+"')")||s.includes("skillPress('"+n.id+"')"),n.hero+'/'+n.id+' has no consumer');if(!n.active){assert(PASSIVE_PAID.has(n.price),n.hero+'/'+n.id+': a passive keeps the price it was once sold for (60/120/220/360), not '+n.price);continue;}assert(PRICE_AT[n.level]!==undefined,n.hero+'/'+n.id+' unlocks at level '+n.level+', which is on no ladder');assert.equal(n.price,PRICE_AT[n.level],n.hero+'/'+n.id+': a level-'+n.level+' skill costs '+PRICE_AT[n.level]);}
assert(s.includes('const TREE = LEGACY_NODES'));assert(!s.includes('PROG.talentVersion = 2'));
/* NO TWO SKILLS SHARE A NAME (2026-09-24): the tree shows a bare name with no hero tag, and RIPOSTE (knight/pirate)
   and OPENED (reaper/warden) once meant two different things under the same word. */
{const byName={};for(const n of LEGACY_NODES){(byName[n.name]=byName[n.name]||[]).push(n.hero+'/'+n.id);}
 for(const[name,ids]of Object.entries(byName))assert.equal(ids.length,1,name+' is used by '+ids.join(' and '));}
console.log(LEGACY_NODES.length+' historical nodes mapped; '+SKILLS.length+' priced skills/techniques have gameplay consumers; destructive legacy resets removed; every skill name is unique.');
