import fs from 'fs';
let s=fs.readFileSync('tools/progression.mjs','utf8');
const a="assert(equipSkill(p,'knight',n.id,2,L,true));assert.equal(equipSkill(p,'knight',n.id,2,15,true),'Slot is locked');assert.equal(equipSkill(p,'knight',n.id,3,50,true),'Slot is locked');assert.equal(equipSkill(p,'knight',n.id,2,16,true),null);assert.equal(equipSkill(p,'knight',n.id,1,20,true),null);/* slot three opens at L16 and there is no fourth (Daniel 2026-10-04); moving it to slot two is fine */";
if(!s.includes(a)) throw Error('x');
s=s.replace(a,()=>"assert.match(equipSkill(p,'knight',n.id,1,L,true),/level 30/);assert.equal(equipSkill(p,'knight',n.id,2,50,true),'Slot is locked');assert.equal(equipSkill(p,'knight',n.id,1,30,true),null);/* the second slot opens at L30 and there is no third (Daniel 2026-11-01); moving it to slot two is fine */");
fs.writeFileSync('tools/progression.mjs',s);
let l=fs.readFileSync('tools/leveling.mjs','utf8'); l=l.replace("a 30+ hero\'s slots stay where they were","the slots of a 30+ hero stay where they were"); fs.writeFileSync('tools/leveling.mjs',l);
