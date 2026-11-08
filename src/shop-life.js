// src/shop-life.js - THE SHOPS ARE ALIVE (claude/hubpolish, Daniel 11-01: "give the stores a bit more life. They are very prototype-ish.").
// What was there: a badger behind a counter, two shelves, a torch or two. What this adds, in the four walk-in rooms (THE STORE, THE HIGH STORE, THE CHANDLER, THE WELL STORE)
// and, lighter, on the store's own screen:
//   THE KEEPER   three idle loops (polishing a mug, counting coins, keeping the ledger), and when you come in he LOOKS UP, says a greeting, and stops what he was at.
//   BARKS        a few short lines per shop, one every while (greet, bark, thanks); the line is a plain box over his head and his paw goes up while he says it.
//   THE ROOM     a hanging sign that sways on its chains (the shop's own emblem), wares on the counter and on the wall that are THIS shop's (herbs and sacks / hammers and
//                lanterns / rope and brass / jugs and cloth), a kettle with steam, a cat (a raven on the Crag's sign, a parrot on the Chandler's, a gecko at the Well),
//                dust motes in the lamplight, and the lamplight itself, which flickers.
//   A PURCHASE   the store screen sees the coins go and fires a beat: the keeper's head nods, the coin clinks (the game's own), a ring of light pops round the item, and the
//                keeper says a line; back in the room he nods once more and says thanks.
// EVERYTHING HERE IS A HANDFUL OF RECTANGLES ON A CLOCK: no canvas is made after the first frame, no gradient, no array; it does nothing outside a shop room.
// This file has no game in it (tools/hero-swap.mjs holds it without a page): main.js passes the camera, the clock and where the keeper and the hero stand.

export const SHOP_IDS = ['shop', 'shopCrag', 'shopSea', 'shopWell'];
/* what each keeper says. Short: a box of at most ~34 letters over his head (the textfit tool measures them). Rotated in order, never the same twice running. */
export const LINES = {
  shop: { greet: ['WELL MET. MIND THE WARES.', 'COME IN, COME IN. THE FIRE IS LIT.'], bark: ['A SWORD IS ONLY AS GOOD AS ITS HAND.', 'SILVER BUYS A NEW FACE. GOLD BUYS EDGES.', 'WIPE YOUR BOOTS. THE ROAD COMES IN TOO.', 'THE KETTLE IS ON, IF YOU ARE STAYING.', 'THE ROAD IS HARD ON FINE THINGS.'], buy: ['A FINE CHOICE.', 'IT SUITS YOU.', 'MIND IT. THEY ARE NOT MADE LIKE THAT NOW.'] },
  shopCrag: { greet: ['UP THE STAIR, THEN. COLD OUT?', 'MIND THE STEP. IT IS A LONG WAY DOWN.'], bark: ['THE WIND TAKES WHAT IT LIKES UP HERE.', 'THE MOUNTAIN KEEPS NO CHANGE. I DO.', 'HARD STONE, HARD PRICES. FAIR, THOUGH.', 'THE RAVEN COUNTS MY COIN. TWICE.', 'IRON FROM THE CRAG. IT RINGS TRUE.'], buy: ['GOOD IRON. USE IT WELL.', 'THE MOUNTAIN THANKS YOU.', 'THAT WILL OUTLAST YOU. NO OFFENCE.'] },
  shopSea: { greet: ['PERMISSION TO COME ABOARD, THEN.', 'MIND YOUR HEAD. SHE IS LOW IN THE WATER.'], bark: ['EVERYTHING HERE HAS BEEN IN THE SEA.', 'POLLY HAS OPINIONS ON YOUR PRICES.', 'A SQUARE DEAL OR NO DEAL.', 'SALT KEEPS EVERYTHING. EVEN BARGAINS.', 'THE TIDE TAKES CREDIT. I DO NOT.'], buy: ['SOLD, AND FAIRLY.', 'FAIR WINDS TO YOU.', 'A BARGAIN FOR US BOTH.'] },
  shopWell: { greet: ['SIT. THE WELL IS COOL. THE WATER IS FREE.', 'SHADE IS THE FIRST THING I SELL.'], bark: ['COOLER DOWN HERE THAN ANYWHERE ON THE ROAD.', 'THE SUN HATES A GOOD BARGAIN.', 'NOTHING I SELL HAS EVER GONE TO SAND.', 'DRINK FIRST. THEN BUY.', 'CLOTH FROM THE CARAVANS, OIL FROM THE WELL.'], buy: ['MAY YOUR SHADE LAST.', 'A GOOD DAY FOR BOTH OF US.', 'GO WELL. KEEP IT OUT OF THE SAND.'] },
};
/* THE INN'S BARKEEP: lighter than a shop's keeper (the room's own fire, lanterns, window and drinkers are src/redraw/tavern_backdrop.js): dust in the firelight and a line now and then */
export const TAVERN_LINES = ['PULL UP A SEAT. THE FIRE IS FREE.', 'PRACTISE IN THE YARD. THE HAY FORGIVES.', 'FOUR AT A TABLE, ONE ROAD BETWEEN THEM.', 'THE ARENA IS ROPED OFF. NOT YET, NOT YET.', 'THE WARDROBE IS FOR THE HERO YOU WANT TO BE.'];
export const SIGNS = { shop: 'THE STORE', shopCrag: 'HIGH STORE', shopSea: 'THE CHANDLER', shopWell: 'WELL STORE' };
/* the store screen's keeper lines are the same shop's; the map's store is THE STORE */
export const linesOf = id => LINES[id] || LINES.shop;
export const BARK_EVERY = 15, BARK_SHOW = 3.6, GREET_AT = 0.9, LOOK_UP_S = 2.8, NOD_S = 0.7;
/* WHICH IDLE LOOP the keeper is in at a time: 0 polishing, 1 counting, 2 the ledger; each lasts 6.5 s and they run on the clock, so a still is repeatable */
export const loopAt = t => Math.floor((((t % 19.5) + 19.5) % 19.5) / 6.5);
/* the next line of a list that is not the one just said */
export function pickNext(list, last) { if (!list || !list.length) return ''; const i = list.indexOf(last); return list[(i + 1) % list.length]; }

const COL = { gold: '#ffd36b', goldD: '#c9941a', cream: '#e8dcc0', wood: '#6a4626', woodD: '#3a2214', woodL: '#8a5a32', iron: '#7c8797', ironD: '#4a5260', steam: '#c9c4b8', ink: '#1b1626', red: '#c9463d', green: '#5a8a3a', blue: '#4a7ab0' };

export function makeShopLife() {
  const S = { room: null, bark: '', barkT: -99, lastBark: '', nextBark: 0, greeted: false, lookT: -99, buyT: -99, nodT: -99, lastTime: 0, line: '', stats: { barks: 0, greets: 0, buys: 0, frames: 0 } };
  const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

  /* the lamplight round the keeper: stacked translucent discs (no gradient is made), its radius and strength flickering on two sines and a hash */
  function lamp(g, x, y, t, r) {
    const fl = 0.5 + 0.25 * Math.sin(t * 9.3) + 0.15 * Math.sin(t * 23.1 + 1) + 0.1 * Math.sin(t * 3.7);
    for (let k = 0; k < 3; k++) { g.globalAlpha = (0.05 + 0.025 * fl) * (k + 1) * 0.8; g.fillStyle = '#ffb35c'; g.beginPath(); g.arc(Math.round(x), Math.round(y), r * (1 - k * 0.27) + fl * 2, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  }
  /* the hanging sign: two chains from the beams, a board on them that sways a pixel, the shop's name and its emblem; text(s, x, y, col, align, size) is the game's */
  function sign(g, x, y, t, id, text, tw) {
    const sw = Math.sin(t * 1.3) * 1.5, w = Math.max(40, tw + 22), x0 = Math.round(x - w / 2 + sw), by = y;
    rect(g, x - w / 2 + 3, by - 22, 1, 22, COL.ironD); rect(g, x + w / 2 - 4, by - 22, 1, 22, COL.ironD);
    rect(g, x0 - 1, by - 1, w + 2, 15, COL.ink); rect(g, x0, by, w, 13, COL.wood); rect(g, x0, by, w, 1, COL.woodL); rect(g, x0, by + 12, w, 1, COL.woodD);
    emblem(g, x0 + 7, by + 6, id, t);
    text(SIGNS[id] || 'THE STORE', x0 + 14 + (w - 14) / 2, by + 4, COL.gold, 'center', 6);
    return { x0, w, by };
  }
  function emblem(g, x, y, id, t) {
    if (id === 'shopCrag') { rect(g, x - 3, y - 3, 7, 2, COL.iron); rect(g, x, y - 3, 1, 8, COL.woodL); rect(g, x - 3, y - 3, 1, 3, COL.iron); rect(g, x + 3, y - 3, 1, 3, COL.iron); }   /* a pick */
    else if (id === 'shopSea') { rect(g, x, y - 4, 1, 9, COL.iron); rect(g, x - 3, y - 2, 7, 1, COL.iron); rect(g, x - 3, y + 2, 1, 3, COL.iron); rect(g, x + 3, y + 2, 1, 3, COL.iron); rect(g, x - 2, y + 4, 5, 1, COL.iron); rect(g, x - 1, y - 5, 3, 1, COL.iron); }   /* an anchor */
    else if (id === 'shopWell') { rect(g, x - 3, y - 1, 7, 5, COL.woodL); rect(g, x - 3, y - 1, 7, 1, COL.iron); rect(g, x - 2, y - 4, 1, 3, COL.ironD); rect(g, x + 2, y - 4, 1, 3, COL.ironD); rect(g, x - 2, y - 4, 5, 1, COL.ironD); }   /* a bucket */
    else { rect(g, x - 3, y - 3, 7, 7, COL.gold); rect(g, x - 2, y - 2, 5, 5, COL.goldD); rect(g, x - 1, y - 1, 3, 3, COL.gold); }   /* a coin */
  }
  /* what the SHOP's own goods are, on the counter and hung on the wall: THIS shop's, not any shop's */
  function wall(g, x, y, t, id) {
    const sw = i => Math.round(Math.sin(t * 1.1 + i * 1.7) * 0.8);
    for (let i = 0; i < 5; i++) {
      const gx = x + (i - 2) * 26 + sw(i), top = y;
      rect(g, gx, top, 1, 6 + (i % 2) * 2, COL.ironD);
      const gy = top + 6 + (i % 2) * 2;
      if (id === 'shopCrag') { if (i % 2) { rect(g, gx - 3, gy, 7, 2, COL.iron); rect(g, gx, gy, 1, 8, COL.woodL); } else { rect(g, gx - 2, gy, 5, 6, '#c9a83a'); rect(g, gx - 1, gy + 1, 3, 3, '#fff6c8'); } }   /* picks and lanterns */
      else if (id === 'shopSea') { if (i % 2) { rect(g, gx - 3, gy, 7, 2, '#8a6a3a'); rect(g, gx - 2, gy + 2, 5, 2, '#a88a52'); rect(g, gx - 3, gy + 4, 7, 2, '#8a6a3a'); } else { rect(g, gx - 2, gy, 5, 5, '#b8842a'); rect(g, gx - 1, gy + 1, 3, 3, '#e0b040'); rect(g, gx, gy - 2, 1, 2, COL.ironD); } }   /* coiled rope and brass */
      else if (id === 'shopWell') { if (i % 2) { rect(g, gx - 3, gy, 7, 9, '#b83a3a'); rect(g, gx - 3, gy + 3, 7, 1, '#e0b040'); rect(g, gx - 3, gy + 6, 7, 1, '#4a7ab0'); } else { rect(g, gx - 2, gy, 5, 7, '#a8764a'); rect(g, gx - 1, gy - 2, 3, 2, '#8a5a32'); } }   /* cloth and jugs */
      else { if (i % 2) { rect(g, gx - 3, gy, 7, 5, '#8a5a32'); rect(g, gx - 3, gy, 7, 1, '#a8764a'); rect(g, gx - 1, gy + 1, 3, 1, '#c9463d'); } else { rect(g, gx - 2, gy, 1, 7, '#5a8a3a'); rect(g, gx, gy, 1, 8, '#7ab04a'); rect(g, gx + 2, gy, 1, 6, '#5a8a3a'); } }   /* sacks and herbs */
    }
  }
  function counterGoods(g, x, y, id) {   /* x: the counter's middle, y: its top */
    if (id === 'shopCrag') { rect(g, x - 18, y - 4, 5, 4, COL.iron); rect(g, x - 18, y - 4, 5, 1, '#c9d1dc'); rect(g, x + 8, y - 5, 4, 5, '#c9a83a'); }
    else if (id === 'shopSea') { rect(g, x - 18, y - 3, 8, 3, '#8a6a3a'); rect(g, x - 18, y - 6, 8, 3, '#a88a52'); rect(g, x + 8, y - 5, 5, 5, '#b8842a'); }
    else if (id === 'shopWell') { rect(g, x - 18, y - 6, 4, 6, '#a8764a'); rect(g, x - 13, y - 5, 4, 5, '#8a5a32'); rect(g, x + 8, y - 4, 6, 4, '#b83a3a'); }
    else { rect(g, x - 18, y - 4, 4, 4, '#4aa0b0'); rect(g, x - 13, y - 5, 3, 5, '#c9463d'); rect(g, x + 8, y - 4, 5, 4, '#8fd160'); }
  }
  function kettle(g, x, y, t) {
    rect(g, x, y - 4, 6, 4, COL.ironD); rect(g, x, y - 4, 6, 1, COL.iron); rect(g, x + 6, y - 3, 2, 1, COL.ironD); rect(g, x + 1, y - 6, 4, 1, COL.ironD);
    for (let i = 0; i < 3; i++) { const ph = ((t * 0.5 + i / 3) % 1); g.globalAlpha = (1 - ph) * 0.45; rect(g, x + 2 + Math.sin(t * 2 + i * 2) * (1 + ph * 2) + ph, y - 8 - ph * 16, 2 + ph * 2, 2 + ph * 2, COL.steam); }
    g.globalAlpha = 1;
  }
  /* the creature of the room. cat: sits, blinks, flicks its tail. raven and parrot perch on the sign's top edge and shift. the gecko sits on the floor and flicks. */
  function critter(g, id, x, y, t) {
    if (id === 'shopCrag') { const b = Math.floor(t * 0.7) % 4 === 0 ? 1 : 0; rect(g, x - 3, y - 7 + b, 7, 5, '#1b1626'); rect(g, x + 2, y - 9 + b, 3, 3, '#1b1626'); rect(g, x + 5, y - 8 + b, 2, 1, '#8a8f80'); rect(g, x - 6, y - 5, 3, 2, '#1b1626'); rect(g, x, y - 2, 1, 2, '#3a3448'); rect(g, x + 2, y - 2, 1, 2, '#3a3448'); if (Math.floor(t * 3.1) % 11 === 0) rect(g, x + 3, y - 8 + b, 1, 1, '#ffd36b'); }
    else if (id === 'shopSea') { const b = Math.floor(t * 1.4) % 5 === 0 ? 1 : 0; rect(g, x - 2, y - 8, 5, 7, '#c9463d'); rect(g, x - 1, y - 11 + b, 4, 4, '#c9463d'); rect(g, x + 3, y - 10 + b, 2, 2, '#e0b040'); rect(g, x - 2, y - 2, 2, 3, '#4a7ab0'); rect(g, x, y - 2, 2, 4, '#4aa0b0'); rect(g, x, y - 10 + b, 1, 1, '#fff6c8'); }
    else if (id === 'shopWell') { const f = Math.floor(t * 4) % 9 === 0; rect(g, x - 5, y - 3, 9, 3, '#a8a05a'); rect(g, x + 4, y - 4, 3, 3, '#a8a05a'); rect(g, x - 8, y - 2, 4, 1, '#8a8240'); rect(g, x + 6, y - 3, 1, 1, '#1b1626'); if (f) rect(g, x + 7, y - 2, 3, 1, '#c9463d'); }
    else { const tail = Math.round(Math.sin(t * 2.2) * 2), blink = Math.floor(t * 0.8) % 7 === 0;   /* the cat: sitting, tail curling */
      rect(g, x - 4, y - 7, 8, 7, '#8a7a6a'); rect(g, x - 3, y - 11, 6, 5, '#8a7a6a'); rect(g, x - 3, y - 13, 2, 2, '#8a7a6a'); rect(g, x + 1, y - 13, 2, 2, '#8a7a6a'); rect(g, x - 2, y - 9, 1, blink ? 1 : 2, '#ffe28a'); rect(g, x + 1, y - 9, 1, blink ? 1 : 2, '#ffe28a');
      rect(g, x + 4, y - 3 + tail, 4, 2, '#8a7a6a'); rect(g, x + 7, y - 5 + tail, 1, 3, '#8a7a6a'); rect(g, x - 4, y - 3, 2, 1, '#6a5a4a'); }
  }
  function motes(g, cx, cy, kx, floor, t) {
    for (let i = 0; i < 12; i++) { const ph = (t * 0.06 + i * 0.131) % 1, x = kx - 110 + ((i * 53) % 220) + Math.sin(t * 0.4 + i * 2.3) * 7, y = floor - 14 - ph * 74, a = Math.sin(ph * Math.PI) * 0.5 * (0.6 + 0.4 * Math.sin(t * 2 + i));
      g.globalAlpha = a; rect(g, x - cx, y - cy, 1, 1, '#ffe9b0'); }
    g.globalAlpha = 1;
  }
  /* the keeper's own idle: three loops on the counter in front of him. o.tx/o.ty = his paw spot. */
  function loopArt(g, x, y, t, lp) {
    if (lp === 0) { const k = Math.sin(t * 5.2) * 2.5; rect(g, x - 5, y - 5, 5, 5, '#c9d1dc'); rect(g, x - 6, y - 4, 1, 3, '#c9d1dc'); rect(g, x - 5, y - 5, 5, 1, '#fff'); rect(g, Math.round(x - 5 + k + 2), y - 6, 4, 2, '#e8dcc0'); if (Math.sin(t * 5.2 + 1.6) > 0.9) rect(g, x + 1, y - 7, 1, 1, '#fff'); }   /* a mug, a cloth, a glint */
    else if (lp === 1) { for (let i = 0; i < 3; i++) rect(g, x - 7, y - 2 - i * 2, 4, 2, COL.gold); for (let i = 0; i < 2; i++) rect(g, x - 2, y - 2 - i * 2, 4, 2, COL.goldD); const w = Math.abs(Math.cos(t * 6)); rect(g, x + 4, y - 10 - Math.abs(Math.sin(t * 3)) * 3, Math.max(1, Math.round(4 * w)), 3, COL.gold); }   /* stacks of coins, one flipping over */
    else { rect(g, x - 7, y - 3, 8, 3, '#e8dcc0'); rect(g, x - 7, y - 3, 8, 1, '#8a5a32'); rect(g, x - 3, y - 3, 1, 3, '#8a5a32'); const q = Math.sin(t * 2.4) > 0.2 ? 1 : 0; rect(g, x + 3, y - 8 + q * 4, 1, 5, '#c9d1dc'); rect(g, x + 3, y - 9 + q * 4, 2, 1, '#e8dcc0'); }   /* the ledger and a quill that dips */
  }
  /* THE ROOM. o = { cx, cy, time, id, kx, ky (the keeper's feet, world), px (the hero), floor (world y of the floor), text, textW, sfx, TS } */
  function drawRoom(g, o) {
    const t = o.time, id = SHOP_IDS.includes(o.id) ? o.id : 'shop', L = linesOf(id);
    if (S.room !== o.room) { S.room = o.room; S.greeted = false; S.barkT = -99; S.nextBark = t + 5; S.lookT = -99; S.line = ''; }
    S.stats.frames++;
    const near = Math.abs(o.px - o.kx) < 150, kx = o.kx - o.cx, ky = o.ky - o.cy;
    /* the clock of what he says */
    if (!S.greeted && near) { S.greeted = true; S.lookT = t; S.barkT = t + GREET_AT; S.bark = pickNext(L.greet, S.lastBark); S.lastBark = S.bark; S.nextBark = t + BARK_EVERY; S.stats.greets++; }
    else if (S.greeted && t >= S.nextBark && t > S.barkT + BARK_SHOW) { S.barkT = t; S.bark = pickNext(L.bark, S.lastBark); S.lastBark = S.bark; S.nextBark = t + BARK_EVERY + ((S.stats.barks * 3) % 5); S.stats.barks++; }
    if (S.buyT > S.barkT && S.buyT > (S.thanksFor || -99) && t - S.buyT < 8) { S.thanksFor = S.buyT; S.barkT = t + 0.3; S.bark = pickNext(L.buy, S.lastBark); S.lastBark = S.bark; S.nodT = t + 0.3; S.lookT = -99; S.nextBark = t + BARK_EVERY; }   /* back from the counter with something bought: a nod and thanks */
    S.lastTime = t;
    const talking = t >= S.barkT && t < S.barkT + BARK_SHOW, looking = t - S.lookT < LOOK_UP_S, lp = loopAt(t);
    o.keeper.barkOn = talking;   /* main.js draws his raised paw (frame 1) while it is set */
    o.keeper.nodY = t - S.nodT < NOD_S ? (Math.floor((t - S.nodT) * 10) % 2 ? 1 : 0) : 0;
    /* THE LIGHT first (under everything), then the room, then the keeper's hands */
    lamp(g, kx - 10, ky - 26, t, 58);
    motes(g, o.cx, o.cy, o.kx, o.floor, t);
    wall(g, kx, ky - 72, t, id);
    const sg = sign(g, kx - 18, ky - 108, t, id, o.text, o.textW(SIGNS[id] || 'THE STORE', 6));
    if (id === 'shopCrag' || id === 'shopSea') critter(g, id, sg.x0 + sg.w - 12, sg.by, t);
    else if (id === 'shopWell') critter(g, id, kx + 52, ky, t);
    else critter(g, id, kx + 40, ky, t);
    counterGoods(g, kx - 14, ky - 14, id);
    if (!looking && !talking) loopArt(g, kx - 4, ky - 14, t, lp);
    kettle(g, kx - 40, ky - 14, t);
    if (looking && !talking) { const b = Math.round(Math.sin(t * 8)); rect(g, kx - 1, ky - 30 + b, 3, 5, COL.gold); rect(g, kx - 1, ky - 23 + b, 3, 2, COL.gold); }   /* a bright '!': he has seen you */
    if (t - S.buyT < 2.6 && !talking) { /* thanks, back in the room */ }
    if (talking) { const s = S.bark, w = o.textW(s, 6) + 10, a = Math.min(1, (t - S.barkT) * 6, (S.barkT + BARK_SHOW - t) * 4), bx = Math.round(Math.max(4, Math.min(o.VW - w - 4, kx - w / 2 - 6)));
      g.globalAlpha = Math.max(0, a); rect(g, bx - 1, ky - 51, w + 2, 15, COL.ink); rect(g, bx, ky - 50, w, 13, '#2a2234'); rect(g, bx, ky - 50, w, 1, '#4a4058'); o.text(s, bx + w / 2, ky - 47, COL.cream, 'center', 6); g.globalAlpha = 1; }
  }
  /* the store screen asks: the keeper's head, his line and the beat. Returns nothing; draws at (x, y) the head and the line at x + 14. */
  function bought(t) { S.buyT = t; S.nodT = t; S.stats.buys++; S.said = pickNext(linesOf(S.shopId).buy, S.said); }
  /* THE STORE SCREEN'S BIT: the keeper's head (nodding on a purchase) at x, y and, for a few seconds every while, his line in place of the help; returns the line to say now, or ''. */
  function storeLine(t, id) {
    S.shopId = SHOP_IDS.includes(id) ? id : 'shop'; const L = linesOf(S.shopId);
    if (t - S.buyT < 2.2) return S.said || L.buy[0];
    const ph = (t + 3) % 11; if (ph < 3.4) { const k = Math.floor((t + 3) / 11) % L.bark.length; return L.bark[k]; }
    return '';
  }
  function storeHead(g, head, x, y, t) {
    const nod = t - S.nodT < NOD_S ? (Math.floor((t - S.nodT) * 10) % 2 ? 1 : 0) : 0, blink = Math.floor(t * 0.9) % 6 === 0;
    if (head) g.drawImage(head, 0, 0, head.width, Math.min(head.height, 9), x, y + nod, head.width, Math.min(head.height, 9));
    if (blink) { g.fillStyle = '#3a2214'; g.fillRect(x + 4, y + 3 + nod, 6, 1); }
  }
  /* a ring of light round the item you just bought, and a few sparks, for 0.7 s (the preview art's middle is cx, cy) */
  function pop(g, cx, cy, t) {
    const k = (t - S.buyT) / 0.7; if (k < 0 || k > 1) return;
    g.globalAlpha = 1 - k; g.strokeStyle = COL.gold; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, 6 + k * 22, 0, 7); g.stroke();
    for (let i = 0; i < 6; i++) { const a = i * 1.047 + 0.4, r = 8 + k * 26; rect(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r - k * 4, 2, 2, i % 2 ? COL.gold : '#fff6c8'); }
    g.globalAlpha = 1;
  }
  /* the store screen's candle: two small flames in the panel's top corners and their glow, flickering */
  function candles(g, x0, x1, y, t) {
    for (const [cx, k] of [[x0, 0], [x1, 2.1]]) { const f = Math.sin(t * 11 + k) + Math.sin(t * 17.3 + k * 2) * 0.6; g.globalAlpha = 0.10 + 0.04 * f; g.fillStyle = '#ffb35c'; g.beginPath(); g.arc(cx, y + 3, 9, 0, 7); g.fill(); g.globalAlpha = 1;
      rect(g, cx, y + 2, 1, 4, '#e8dcc0'); rect(g, cx, y - 1 + (f > 0.8 ? 1 : 0), 1, 3, '#ffd36b'); rect(g, cx, y - 1, 1, 1, '#fff6c8'); }
  }
  /* THE INN: o = { cx, cy, time, bx, by (the bar's counter, world), hx (the hearth, world), px (nearest hero x), floor, text, textW, VW } */
  function drawTavern(g, o) {
    const t = o.time; motes(g, o.cx, o.cy, o.hx, o.floor, t); motes(g, o.cx, o.cy, o.bx, o.floor, t + 40);
    const near = Math.abs(o.px - o.bx) < 170, k = Math.floor(t / 14), ph = t % 14;
    if (near && ph < BARK_SHOW) { const s = TAVERN_LINES[k % TAVERN_LINES.length], w = o.textW(s, 6) + 10, a = Math.min(1, ph * 6, (BARK_SHOW - ph) * 4), bx = Math.round(Math.max(4, Math.min(o.VW - w - 4, o.bx - o.cx - w / 2))), by = o.by - o.cy - 62;
      g.globalAlpha = Math.max(0, a); rect(g, bx - 1, by - 1, w + 2, 15, COL.ink); rect(g, bx, by, w, 13, '#2a2234'); rect(g, bx, by, w, 1, '#4a4058'); o.text(s, bx + w / 2, by + 3, COL.cream, 'center', 6); g.globalAlpha = 1; }
  }
  const reset = () => { S.room = null; S.greeted = false; S.barkT = -99; S.buyT = -99; S.nodT = -99; S.lastTime = 0; };
  return { drawRoom, drawTavern, storeLine, storeHead, pop, candles, bought, reset, state: S };
}
