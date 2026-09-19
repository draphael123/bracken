export function hauntedCoast(L,id,T){
 if(id==='lamplit'){
  L.ents=L.ents.filter(e=>e.t!=='archer');let n=0;for(const e of L.ents)if(e.t==='wight'){e.t=n++%2?'bonecorsair':'lanternshade';}
  for(const [x,top]of[[62,18],[106,18],[142,18],[618,18]])for(let y=top;y<=21;y++)L.grid[y*L.W+x-1]=T.NET;
  L.climbCues=[[40,13],[58,22],[94,22],[168,22],[273,18],[305,18],[335,18]];
  L.ents.push({t:'sign',x:54,y:21,text:'HOLD DOWN ON A CHAIN TO DESCEND. HOLD UP TO CLIMB BACK OUT.'},{t:'sign',x:96,y:21,text:'THE LANTERN GHOST MARKS YOUR FEET. STEP CLEAR, OR GUARD THE FLASH.'});
  for(const[x,y,kind]of[[46,21,'kegStack'],[88,21,'coiledCable'],[174,21,'barrels'],[286,21,'seaChest']])L.ents.push({t:'deco',x,y,kind,v:0});
 }
 if(id==='causeway'){
  L.shipZones=[[339,350,24,29],[360,388,23,29]];L.hullZones=L.shipZones;L.interiors.push([340,348,26,28,'ship'],[362,385,25,28,'ship']);
  L.pools.push({x0:362*16,x1:389*16,y:26*16,bottom:29*16,swim:true,clear:true});
  for(const e of L.ents)if(e.t==='sailor'&&e.x>=330&&e.x<=390)e.t='bonecorsair';
  L.ents.push({t:'bonecorsair',x:366,y:28,face:1},{t:'bonecorsair',x:382,y:28,face:-1},{t:'cutlass',x:202,y:17,face:-1},{t:'marine',x:239,y:15,face:-1},{t:'tidemarauder',x:118,y:23,face:-1},{t:'tidemarauder',x:326,y:23,face:-1},{t:'tidemarauder',x:526,y:23,face:-1,mini:true}, {t:'sign',x:512,y:23,text:'THE TIDE REAVER HOLDS THE ROAD. GUARD THE HARPOON. JUMP HIS RED LOW RAKE.'},{t:'sign',x:337,y:29,text:'A PIRATE HULL, FLOODED TO THE GUNPORTS. THE BONES STILL KEEP WATCH.'});
  for(let y=0;y<24;y++)L.grid[y*L.W+533]=T.PORT;
  L.mini={x0:514*16,x1:532*16,floor:24*16,trigger:516*16,wallL:513,gate:533,y0:0,y1:25*16,swim:true,boss:'tidemarauder',name:'THE TIDE REAVER'};
  L.ents=L.ents.filter(e=>!(e.x>=514&&e.x<=533&&['sailor','tideguard','feeler'].includes(e.t)));
  L.deep.vents.push({x:374,y:28,h:3});
  for(const[x,y,kind]of[[343,28,'coiledCable'],[364,28,'rumBarrels'],[386,22,'pennant']])L.ents.push({t:'deco',x,y,kind,v:1});
 }
 return L;
}
export function drawClimbCues(g,L,cx,cy){for(const[x,y]of L.climbCues||[]){const xx=x*16-cx+4,yy=y*16-cy-10;if(xx<0||xx>g.canvas.width)continue;g.fillStyle='#bcebe0';g.fillRect(xx,yy,2,6);g.fillRect(xx-2,yy+3,6,2);g.fillRect(xx-1,yy+5,4,2);}}
