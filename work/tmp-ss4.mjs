import fs from 'fs';
let f='src/main.js', s=fs.readFileSync(f,'utf8'); s=s.replace(/\r\n/g,'\n');
const a="const skillAt = index => { const id = equipped(PROG, hero(), heroLevel())[index]; if (skillFor(hero(), id)?.active) return id; if (trialLend) return [...trialLend].filter(k => skillFor(hero(), k)?.active)[index] || null; return null; };";
if(!s.includes(a)) throw Error('x');
s=s.replace(a,()=>"const skillAt = index => { const eq = equipped(PROG, hero(), heroLevel()), id = eq[index]; if (skillFor(hero(), id)?.active) return id;\n  /* A TRIAL'S LENT SKILLS fill the F and G the hero has nothing on (Daniel 11-01: he has ONE slot now, so G is lent after his F is taken by his own) */\n  if (trialLend && index < 2) { const lent = [...trialLend].filter(k => skillFor(hero(), k)?.active && !eq.includes(k)); return lent[index - eq.slice(0, index).filter(k => skillFor(hero(), k)?.active).length] || null; } return null; };");
fs.writeFileSync(f,s.replace(/\n/g,'\r\n'));
