const fs=require('fs');
function patch(f,a,b){let s=fs.readFileSync(f,'utf8');const crlf=s.includes('\r\n');if(crlf){s=s.replace(/\r\n/g,'\n');}const n=s.split(a).length-1;if(n!==1)throw new Error(f+': '+n+' matches for '+a.slice(0,50));s=s.replace(a,()=>b);if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(f,s);}
const m='src/main.js';
patch(m,`if (coop()) asPlayer(p, one); else asPlayer(p, one); if (p === P`,`asPlayer(p, one); if (p === P`);
// aiComp debug
patch(m,`mul: () => coopMul(),`,`mul: () => coopMul(), take: () => coopTake(),`);
// seat plate flask count
patch(m,`    text('LV ' + seatLv(p), x0 + w - 4, y0 + 3, '#ffd36b', 'right', 6); }
  text(fitText(seatHeroName(p), bw - 16, 6), bx, y0 + 11, UI.text, 'left', 6);`,`    text('LV ' + seatLv(p), x0 + w - 4, y0 + 3, '#ffd36b', 'right', 6);
    if (!(L && (L.shop || L.trial))) { const fn = p.flasks | 0, fx = x0 + w - 8 - textW('LV ' + seatLv(p), 6) - textW(String(fn), 6) - 8;   /* (claude/coopbalance) HIS FLASKS: a little bottle and the count on the plate's first line (every seat carries its own) */
      g.fillStyle = fn ? '#c9463d' : '#4a4452'; g.fillRect(fx + 1, y0 + 5, 4, 5); g.fillStyle = fn ? '#fff6e0' : '#6a6272'; g.fillRect(fx + 2, y0 + 3, 2, 2); text(String(fn), fx + 7, y0 + 3, fn ? '#fff6e0' : UI.dim, 'left', 6); } }
  text(fitText(seatHeroName(p), bw - 16, 6), bx, y0 + 11, UI.text, 'left', 6);`);
