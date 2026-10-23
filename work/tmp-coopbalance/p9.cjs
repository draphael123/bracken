const fs=require('fs');let s=fs.readFileSync('tools/coop-boss-rates.mjs','utf8');
function rep(a,b){if(s.split(a).length!==2)throw new Error(a);s=s.replace(a,()=>b);}
rep("partners = opt('partners', 'warden,pyro,paladin,knight').split(',');","PAIRS = { knight: ['warden', 'pyro', 'paladin'], warden: ['knight', 'pyro', 'paladin'], pyro: ['paladin', 'knight', 'warden'] }, partners = opt('partners', '').split(',').filter(Boolean);");
rep("const partnerOf = (h, k) => partners.filter(p => p !== h)[k];","const partnerOf = (h, k) => (partners.length ? partners.filter(p => p !== h) : PAIRS[h] || ['warden', 'knight', 'pyro'])[k];");
rep("[--partners=warden,pyro,paladin,knight]","[--partners=a,b,c  (default: knight+warden, warden+knight, pyro+paladin; a third seat knight+warden+pyro, warden+knight+pyro, pyro+paladin+knight)]");
fs.writeFileSync('tools/coop-boss-rates.mjs',s);
