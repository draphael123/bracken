// Original pixel art: a scavenger wearing a brass diving bell as its shell.
import {canvas,rect,line,circle,fillPoly,outline,flipX,whiten} from './px.js';
export function bakeBellcrab(){
 const R=Array.from({length:12},(_,frame)=>{
  const [c,g]=canvas(88,58), tell=[2,4,6,8].includes(frame),open=frame===10,hurt=frame===11;
  const copper=hurt?'#c4bbb1':'#b7833e',light='#f3d28a',dark='#634b32',flesh=open?'#ef9177':'#ac5845';
  const bob=frame===1?1:0,cy=36+bob;
  // Six jointed legs keep the same foot row in every pose.
  for(const side of [-1,1])for(let k=0;k<3;k++){
   const x=40+side*(13+k*3),tip=40+side*(24+k*4),joint=tip-side*4;
   line(g,x,cy+5,joint,48-k*2,dark,4);line(g,joint,48-k*2,tip,55,flesh,3);rect(g,tip-2,54,4,2,light);
  }
  fillPoly(g,[[18,43],[22,22+bob],[29,10+bob],[48,10+bob],[57,23+bob],[61,43]],dark);
  fillPoly(g,[[21,40],[25,23+bob],[31,13+bob],[47,13+bob],[54,24+bob],[58,40]],copper);
  rect(g,29,18+bob,3,19,light);rect(g,51,23+bob,3,17,'#876333');
  rect(g,20,39,40,5,light);rect(g,18,44,44,3,dark);rect(g,22,43,36,2,copper);
  for(const x of [24,32,40,48,56])rect(g,x,40,2,2,dark);
  // Hoisting eye and dark glass porthole; pressure flashes cyan through the glass.
  circle(g,39,8,5,dark);circle(g,39,8,3,copper);rect(g,38,6,3,4,'#132630');
  circle(g,40,29+bob,10,dark);circle(g,40,29+bob,8,light);circle(g,40,29+bob,6,frame===7?'#e7ffff':'#244f59');
  rect(g,37,25+bob,3,3,'#a1dbdf');rect(g,42,30+bob,2,4,'#407c85');
  if(open){rect(g,27,44,27,6,flesh);for(const x of [31,37,43,49])rect(g,x,45,3,2,'#ffd9ae');}
  // Eye stalks and asymmetric crusher/cutter claws are outside the metal shell.
  for(const x of [53,58]){line(g,x,38,x+3,33,flesh,2);rect(g,x+2,31,3,3,tell?'#fff1a5':'#aaf5d5');}
  for(const side of [-1,1]){
   const raised=frame===4?-10:frame===2&&side===1?-14:frame===8?3:frame===5?6:0;
   const reach=(frame===3&&side===1)?5:0,ax=40+side*23,tip=40+side*(31+reach),yy=38+raised;
   line(g,40+side*17,44,ax,yy+5,dark,5);line(g,ax,yy+5,tip,yy,flesh,4);
   fillPoly(g,[[tip-side*5,yy-3],[tip+side*2,yy-7],[tip+side*5,yy-4],[tip+side*1,yy],[tip+side*5,yy+3],[tip,yy+6],[tip-side*5,yy+3]],flesh);
   line(g,tip-side*2,yy-3,tip+side*2,yy-5,light,2);
  }
  if(frame===6||frame===7)for(const x of [27,35,45])rect(g,x,18-(x%3)*3,2,3,'#bcf3ee');
  outline(c,'#132126');return c;
 });
 const L=R.map(flipX),white=R.map(c=>whiten(c));
 return {R,L,white:{R:white,L:white.map(flipX)},ax:40,ay:57,w:42,h:43};
}

export function bakeBellguard(){
 const R=Array.from({length:6},(_,f)=>{const[c,g]=canvas(38,42),brass=f===5?'#dbd7c0':'#b88b4a',suit='#426661',dark='#1b3338',step=f===1?3:0;
 rect(g,10,22,16,11,suit);rect(g,12,31,5,8,dark);rect(g,21,31-step,5,8+step,dark);rect(g,8,38,10,3,brass);rect(g,21,38,10,3,brass);
 circle(g,18,16,12,dark);circle(g,18,16,10,brass);rect(g,8,24,20,3,'#e1c47b');circle(g,21,15,6,'#183a44');rect(g,19,12,3,3,f===3?'#ff7970':'#96e8e3');
 for(const x of [10,15,25])rect(g,x,8,2,2,'#eeddaa');line(g,9,21,5,31,suit,4);line(g,26,25,31,f===2?17:29,suit,4);
 line(g,32,f===2?8:19,32,35,brass,2);line(g,32,f===2?8:19,36,f===2?8:19,brass,2);line(g,36,f===2?8:19,36,f===2?13:24,brass,2);
 if(f===3){rect(g,15,3,6,2,'#ffb090');rect(g,17,0,2,3,'#ff6b6b');}if(f===4)rect(g,12,24,12,5,'#83b6a4');outline(c,'#12242a');return c;});
 const L=R.map(flipX),w=R.map(whiten);return{R,L,white:{R:w,L:w.map(flipX)},ax:18,ay:42,w:20,h:33};
}

// ---------------- THE DIVING BELL'S NUMBERS (docs/briefs/deep-rework-2.md §4-5) ----------------
/* He vents ONLY when a ballast stone lands on the valve on his crown (A11): the valve box is valveW either side of him and from
   valveUp over his crown to valveDown into it. Shut he takes shutMul; venting, openMul, for ventT. Rests between blows are short now
   there is no vent after each one. With you over him he
   walks to stand under you (under, px/s) and does not attack until he is within underReach of it. At crackAt of his health THE BELL CRACKS (crackT, a punctuation, not a window) and he comes out:
   fast, soft (out.soft, always), and desperate (out.rest). PHASE TWO, at half: THE PRISE POUR OUT OF HIS BELL (brood) - a told
   broodTell (brood.tell s: his rim lifts and bubbles pour), then brood.n prise that swim for the stone in your hands; each vent in
   phase two tops them back up to brood.keep (never over brood.cap). They are prise: struck, they die; a stone they reach they take. Times in s, speeds in px/s, reach in px. */
export const BELL = { valveW: 15, valveUp: 12, valveDown: 10, ventT: 3, openMul: 2.2, shutMul: 0.45, rest: 0.42, rest2: 0.32, overDy: 44,
  walk: 36, walk2: 50, under: 78, underReach: 22, tells: { claw: 0.62, ballast: 0.85, pressure: 0.8, scuttle: 0.7 }, scuttle: 250, scuttle2: 290, wallStun: 0.6,
  crackAt: 1 / 3, crackT: 1.3,
  brood: { tell: 1.1, n: 3, keep: 2, cap: 3, swim: 70, run: 58, sight: 160 },   /* PHASE TWO (Daniel, 2026-09-25): the prise pour out of his bell */
  out: { w: 30, h: 22, soft: 1.3, rest: 0.26, run: 96, snipTell: 0.42, snipReach: 44, scuttleTell: 0.5, scuttle: 330, scuttleT: 0.9, leapTell: 0.5, leapV: 320, leapT: 0.8 } };

/* THE CRAB OUT OF HIS SHELL (phase three). What wore the bell: a soft hermit's body the colour of a skinned thing, the tail still
   curled to the shape of the shell it lived in, two stalked eyes, and the claws - the only hard parts of him left. Low and wide, so he
   reads as FAST and as nothing like the bell. 60 x 34, facing right, feet on the last row. Frames: 0-1 run, 2 SNIP TELL (both claws up
   and open), 3 SNIP, 4 SCUTTLE TELL (flat to the floor), 5 SCUTTLE, 6 LEAP TELL (coiled), 7 LEAP (legs flung out), 8 hurt (LAST). */
export const BELL_OUT_F = { snipTell: 2, snip: 3, scuttleTell: 4, scuttle: 5, leapTell: 6, leap: 7, hurt: 8 };
export function bellOutFrame(e) { const f = BELL_OUT_F[e.mode]; return f !== undefined && f !== 8 ? f : Math.abs(e.vx) > 4 ? Math.floor(e.anim * 10) % 2 : 0; }
export function bakeBellcrabOut() {
  const R = Array.from({ length: 9 }, (_, fr) => {
    const [c, g] = canvas(60, 34), hurt = fr === 8, low = fr === 4 || fr === 5 || fr === 6, air = fr === 7;
    const skin = hurt ? '#f4d6c8' : '#e58a78', skinL = hurt ? '#fff0e6' : '#ffb8a4', skinD = '#9a4a44', shell = '#8a3a30', hard = '#c05a3a', hardL = '#ffa070';
    const by = low ? 24 : air ? 16 : 20, run = fr === 1 ? 1 : 0;
    /* six legs, jointed; in the leap they fling out, flat to the floor they splay */
    for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
      const hip = 30 + side * (4 + k * 3), knee = 30 + side * (10 + k * 4 + (low ? 3 : 0)), foot = 30 + side * (14 + k * 5 + (low ? 5 : 0) + (air ? 3 : 0));
      const ky = air ? by - 2 : by + 2 - (k === run ? 1 : 0), fy = air ? by + 6 + k : 33;
      line(g, hip, by + 3, knee, ky, skinD, 2); line(g, knee, ky, foot, fy, skin, 2); rect(g, foot - 1, Math.min(33, fy), 2, 1, skinL);
    }
    /* the soft tail, still curled to the bell, behind him */
    fillPoly(g, [[12, by + 4], [8, by - 2], [11, by - 8], [18, by - 9], [22, by - 3], [20, by + 5]], skinD);
    fillPoly(g, [[13, by + 3], [10, by - 2], [12, by - 7], [17, by - 7], [20, by - 3], [19, by + 4]], skin);
    for (const y of [by - 5, by - 2, by + 1]) line(g, 11, y, 19, y + 1, shell, 1);
    /* the body: a low soft carapace, pale underneath */
    fillPoly(g, [[18, by + 5], [20, by - 4], [30, by - 7], [40, by - 4], [42, by + 5]], skinD);
    fillPoly(g, [[20, by + 4], [22, by - 3], [30, by - 5], [38, by - 3], [40, by + 4]], skin);
    rect(g, 23, by - 3, 10, 2, skinL); rect(g, 21, by + 3, 18, 2, '#f6c8b4');
    /* stalked eyes, and in a tell they stand straight up */
    const tell = fr === 2 || fr === 4 || fr === 6;
    for (const ex of [36, 40]) { line(g, ex, by - 4, ex + 1, by - (tell ? 12 : 9), skinD, 1); rect(g, ex, by - (tell ? 14 : 11), 3, 3, tell ? '#fff1a5' : '#1a1a1a'); }
    /* the claws: the only hard things left on him */
    const claw = (sx, sy, open, big) => { const s = big ? 1 : 0.75;
      fillPoly(g, [[sx - 5 * s, sy - 3 * s], [sx + 5 * s, sy - 4 * s], [sx + 8 * s, sy - (open ? 6 : 1) * s], [sx + 3 * s, sy], [sx + 8 * s, sy + (open ? 5 : 1) * s], [sx + 2 * s, sy + 4 * s], [sx - 5 * s, sy + 3 * s]], hard);
      line(g, sx - 3 * s, sy - 3 * s, sx + 4 * s, sy - 4 * s, hardL, 1); };
    const reach = fr === 3 ? 9 : fr === 5 ? 4 : 0, up = fr === 2 ? -9 : fr === 6 ? 2 : 0;
    line(g, 38, by, 44 + reach, by - 3 + up, skinD, 3); claw(48 + reach, by - 4 + up, fr === 2 || fr === 7, true);
    line(g, 36, by + 2, 41 + reach, by + 1 + up, skinD, 2); claw(44 + reach, by + up + 1, fr === 2, false);
    if (hurt) { rect(g, 26, by - 6, 2, 2, '#ffffff'); rect(g, 33, by - 5, 2, 2, '#ffffff'); }
    outline(c, '#1a1012'); return c;
  });
  const L = R.map(flipX), white = R.map(c => whiten(c));
  return { R, L, white: { R: white, L: white.map(flipX) }, ax: 30, ay: 34, w: 30, h: 22 };
}
/* THE BELL HE LEFT: the brass shell on its side where it cracked, the porthole dark, a split up its crown - it stays on the floor for the
   rest of the fight (drawn behind him, never footing) */
export function bakeBellShell() {
  const [c, g] = canvas(64, 40);
  fillPoly(g, [[6, 38], [4, 22], [12, 8], [30, 4], [48, 10], [58, 24], [58, 38]], '#4a3622');
  fillPoly(g, [[8, 36], [7, 23], [14, 11], [30, 7], [46, 12], [55, 25], [55, 36]], '#8a6232');
  rect(g, 6, 34, 52, 4, '#b7833e'); rect(g, 6, 34, 52, 1, '#f3d28a');
  circle(g, 32, 22, 8, '#3a2a1c'); circle(g, 32, 22, 6, '#1a2a30'); rect(g, 29, 19, 2, 2, '#5a7a80');
  line(g, 30, 6, 34, 14, '#1a1008', 1); line(g, 34, 14, 31, 20, '#1a1008', 1); line(g, 34, 14, 40, 17, '#1a1008', 1);   /* the crack */
  circle(g, 30, 4, 3, '#4a3622'); rect(g, 29, 3, 2, 2, '#132630');   /* the valve he vented through */
  outline(c, '#132126'); return c;
}
