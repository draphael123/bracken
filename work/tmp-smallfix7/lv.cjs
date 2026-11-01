const fs=require('fs');const f='src/level.js';let s=fs.readFileSync(f,'utf8');
const a="classFor: 'pyro', opensOn: { level: 'stockade' } }";if(s.split(a).length!==2)throw 1;
s=s.replace(a,"classFor: 'pyro', opensOn: { level: 'stockade', gorm: true } }   /* (claude/smallfix7, Daniel 11-01) opens on KING GORM beaten in ONE LIFE (PROG.burningOpen, main.js gormBeaten); the spur still hangs off the Stockade's node */");
fs.writeFileSync(f,s);
