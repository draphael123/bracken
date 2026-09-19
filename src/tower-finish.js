export function polishTower(L,id,T){
 if(!['mage','fallingtower'].includes(id))return L;
 L.palette.ledges='arcane';L.towerBackdrop=true;
 if(id==='fallingtower')L.ents=L.ents.filter(e=>!(e.t==='check'&&e.filled));
 if(id==='mage'){
  L.mage.skins.unshift([118,L.W-1,0,L.H-1,'tower']);
  L.ents=L.ents.filter(e=>!(e.t==='deco'&&['gardenWall','campfire','cairn','fallenLog','tuft','flower','stone'].includes(e.kind)&&e.x>=118));
  for(const p of L.pools.filter(p=>p.acid&&!p.magePool))for(let y=Math.floor(p.y/16);y<Math.ceil(p.bottom/16)+1;y++)for(let x=p.x0/16;x<p.x1/16;x++)L.grid[y*L.W+x]=T.SOLID;
  L.pools=L.pools.filter(p=>!p.acid||p.magePool);
  for(const e of L.ents)if(e.t==='sign'&&e.x===268)e.text='THE ALCHEMY LAB. THE SEALED VATS STILL SPIT. GUARD THE SLOW GOB OR STEP ASIDE.';
 }
 return L;
}
export function drawTowerBackdrop(g,L,cx,cy){
 if(!L.towerBackdrop)return;const lo=L.mage?.outside??0;
 const start=Math.max(lo,Math.floor(cx/16)-2),end=Math.min(L.W,Math.ceil((cx+g.canvas.width)/16)+2);
 g.save();g.beginPath();g.rect(lo*16-cx,0,L.W*16,g.canvas.height);g.clip();
 // Repeating structural ribs and high windows are fixed in world space, behind every room and floor.
 for(let x=Math.floor(start/12)*12;x<end;x+=12){const px=x*16-cx;g.fillStyle='#242135';g.fillRect(px,0,12,g.canvas.height);g.fillStyle='#3b344e';g.fillRect(px+2,0,2,g.canvas.height);
  for(let y=Math.floor(cy/192)*192-192;y<cy+g.canvas.height;y+=192){const py=y-cy+38;g.fillStyle='#161c36';g.fillRect(px+40,py,35,70);g.fillStyle='#586087';g.fillRect(px+42,py+2,31,1);g.fillStyle='#3b395d';g.fillRect(px+56,py,2,70);g.fillRect(px+40,py+35,35,2);g.fillStyle='#bec2d8';g.fillRect(px+47,py+12,2,2);g.fillRect(px+66,py+25,1,1);}}
 g.restore();
}
export function gateOccupied(col,rows,actors){return actors.some(p=>p&&!p.dead&&rows.some(y=>p.x+(p.w||10)/2>col*16-4&&p.x-(p.w||10)/2<(col+1)*16+4&&p.y>y*16&&p.y-(p.h||14)<(y+1)*16));}
export function fallingTower({painter,T,TS}){
 const W=350,H=56,L=painter(W,H),{block,ent,set,coins}=L,interiors=[];block(0,W-1,40,H-1);block(0,24,24,39);
 const net=(x,y0,y1)=>{for(let y=y0;y<=y1;y++)set(x,y,T.NET);},deco=(kind,x,y)=>ent('deco',x,y,{kind});
 for(let x=25;x<=90;x++)set(x,24,T.SOLID);block(91,140,30,39);for(let x=141;x<=212;x++)set(x,30,T.SOLID);
 net(24,23,39);net(82,23,39);net(140,29,39);net(207,29,39);
 for(const[x0,x1,y]of[[25,90,24],[141,212,30]]){interiors.push([x0,x1,y+1,39,'tower']);block(x0,x1,y-10,y-9);}
 ent('check',5,23);ent('sign',10,23,{text:'THE CRACKS WARN YOU. FALL TO THE LOWER FLOOR. CLIMB THE CHAINS BACK.'});
 for(const x of [36,64]){ent('coin',x,22);ent('broom',x+9,23,{face:-1});}deco('bookpile',29,23);deco('candelabra',77,23);ent('silver',58,23);
 ent('check',96,29);ent('sign',102,29,{text:'HIS FAMILIAR SURVIVED. IT HOLDS THE LOWER DOOR. THE ARCHMAGE IS GONE.'});deco('desk',114,29);deco('globe',120,29);ent('armour',126,29,{face:-1});
 ent('silver',177,29);deco('bookpile',148,29);deco('retorts',194,29);ent('bonecorsair',185,39,{face:-1});ent('lanternshade',154,39,{face:-1});
 ent('check',224,39);block(230,292,26,27);interiors.push([230,291,28,39,'tower']);for(let y=0;y<40;y++)set(292,y,T.PORT);
 ent('sign',226,39,{text:'THE FAMILIAR. GUARD THE CLAW. JUMP THE RED SLAM. CUT THE EYE WHILE IT PANTS.'});ent('familiar',273,39,{mini:true,face:-1});
 deco('candelabra',233,39);deco('bookpile',287,39);ent('silver',312,39);ent('check',301,39);ent('gate',342,39);deco('telescope',330,39);
 for(let x=7;x<340;x+=9){const y=x<91?22:x<213?28:38;ent('coin',x,y);}for(const x of [32,73,159,200])ent('coin',x,38);
 return{W,H,grid:L.grid,ents:L.ents,START:{x:3,y:23},pools:[],falls:[],moversExtra:[],interiors,music:'fallingtower',night:true,nightA:.12,duskStart:99999,duskLen:1,edgeLit:true,
 palette:{sky:'mage',far:'mage',mid:'mage',near:'mage',dress:'village',ledges:'arcane',grass:'#736982',grassL:'#b4aac9',grassD:'#443e52',dirt:'#51475f',dirtL:'#766585',dirtD:'#30283e',canopy:['#181428','#221c36','#2c2446','#3a3058']},
 mage:{outside:0,skins:[[0,W-1,0,H-1,'tower']],shelves:[],hedges:[],chains:[],hung:[]},fallingTower:true,
 deckBreaks:[[36,44,24],[64,72,24],[153,164,30],[187,198,30]].map(([x0,x1,row])=>({x0,x1,row,t:-1,down:false})),
 mini:{x0:248*TS,x1:290*TS,floor:40*TS,trigger:250*TS,wallL:247,gate:292,y0:28*TS,y1:41*TS,boss:'familiar',name:'THE FAMILIAR, UNBOUND'},
 calm:[[0,349,0,55]],noCoin:[[0,349,0,13]]};
}



