// Skill and migration contract: every historical node has a destination, every sold skill has a gameplay consumer.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEGACY_NODES,SKILLS} from '../src/progression.js';
const s=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.equal(LEGACY_NODES.length,181);
/* PRICE FOLLOWS LEVEL, from ONE table (2026-09-23). Passives keep their four tiers (1/4/8/12); the actives moved to a ladder spaced
   every two or three hero levels up to 20 (Daniel), and a skill's price is whatever its unlock level costs - never a number of its own. */
const PRICE_AT={1:60,3:100,4:120,5:140,7:190,8:220,9:240,12:360,14:400,17:460,20:520};
for(const n of SKILLS){assert(s.includes("tal('"+n.id+"')")||s.includes("skillPress('"+n.id+"')"),n.hero+'/'+n.id+' has no consumer');assert(PRICE_AT[n.level]!==undefined,n.hero+'/'+n.id+' unlocks at level '+n.level+', which is on no ladder');assert.equal(n.price,PRICE_AT[n.level],n.hero+'/'+n.id+': a level-'+n.level+' skill costs '+PRICE_AT[n.level]);}
assert(s.includes('const TREE = LEGACY_NODES'));assert(!s.includes('PROG.talentVersion = 2'));
console.log(LEGACY_NODES.length+' historical nodes mapped; '+SKILLS.length+' priced skills/techniques have gameplay consumers; destructive legacy resets removed.');
