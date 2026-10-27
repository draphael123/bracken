import { install } from '../../tools/node-canvas.mjs'; install();
const { bakeKingBig } = await import('../../src/chars.js');
const K = bakeKingBig(); const GF = await import('../../src/redraw/gorm_frames.js');
const d = s => s.R.slice(0,3).map(c=>c.width+'x'+c.height).join(' ')+' n='+s.R.length+' ax'+s.ax+' ay'+s.ay;
console.log('old seated', d(K.seated)); console.log('old standing', d(K.standing));
console.log('new up', d(GF.UP.set), 'stand', GF.UP.idx.stand, 'downed', GF.UP.idx.downed); console.log('new seat', d(GF.SEAT.set), GF.SEAT.idx.idle);
// bounds of frames
const bb = c => { const g=c.getContext('2d'); const D=g.getImageData(0,0,c.width,c.height).data; let x0=1e9,y0=1e9,x1=-1,y1=-1; for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++) if(D[(y*c.width+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);} return [x0,y0,x1,y1].join(','); };
console.log('old seated0 bb', bb(K.seated.R[0]), 'old standing0', bb(K.standing.R[0]), 'new stand', bb(GF.UP.set.R[GF.UP.idx.stand]), 'new seat idle', bb(GF.SEAT.set.R[GF.SEAT.idx.idle]));
