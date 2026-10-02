const fs=require('fs');
const f='src/main.js';let s=fs.readFileSync(f,'utf8');
const files=process.argv.slice(2);
for(const file of files){
  const t=fs.readFileSync(file,'utf8').split(/\r?\n/);
  const name=t[0].split(' ')[0];
  const pathLine=t.find(l=>l.startsWith('PATH '));const path=pathLine.slice(5);
  const re=new RegExp('const '+name+'_PATH = \\[.*?\\];');
  if(!re.test(s)) throw new Error('no path '+name);
  s=s.replace(re,()=> 'const '+name+'_PATH = '+path.replace(/\],\[/g,'], [')+';');
  for(const l of t){const m=l.match(/^(\w+) (\d+) (\d+) plate=(\w+) \(was/);if(!m)continue;
    const [,id,x,y,pl]=m;
    const lines=s.split('\r\n');
    const i=lines.findIndex(L=>L.includes("id: '"+id+"', kind:")||L.includes("id:'"+id+"'"));
    if(i<0)throw new Error('no node '+id);
    let L=lines[i];
    L=L.replace(/ plate: '\w+',/,'').replace(/x: ?\d+, ?y: ?\d+/,(q)=>'x: '+x+', y: '+y+(pl!=='undefined'?", plate: '"+pl+"'":''));
    lines[i]=L;s=lines.join('\r\n');
  }
}
fs.writeFileSync(f,s);
