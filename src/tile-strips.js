// Batch adjacent opaque tiles without changing their order or blending with the world.
// The game clears this bounded cache whenever resolveTiles changes the tile picture.
export function createTileStrips(T, limit = 128) {
  const span = 8, entries = new Map();
  let tiles = null, opaque = new WeakMap();
  const lipTypes = new Set([T.SOLID, T.ONEWAY, T.PLANK, T.SHELF, T.RAIL, T.CRATE]);
  function clear() { entries.clear(); opaque = new WeakMap(); tiles = null; }
  function isOpaque(image) {
    if (!image || image.width !== 16 || image.height !== 16 || !image.getContext) return false;
    if (opaque.has(image)) return opaque.get(image);
    const data = image.getContext('2d').getImageData(0, 0, 16, 16).data;
    let yes = true;
    for (let i = 3; i < data.length; i += 4) if (data[i] !== 255) { yes = false; break; }
    opaque.set(image, yes); return yes;
  }
  function canDraw(g) {
    const m = g.getTransform();
    return g.globalAlpha === 1 && g.globalCompositeOperation === 'source-over' &&
      g.filter === 'none' && !g.shadowBlur && !g.shadowOffsetX && !g.shadowOffsetY &&
      m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && Number.isInteger(m.e) && Number.isInteger(m.f);
  }
  function draw(g, tileSpr, grid, width, col, row, x, y, lip, lip2) {
    if (tiles !== tileSpr) { clear(); tiles = tileSpr; }
    const start = row * width + col;
    let entry = entries.get(start);
    let same = !!entry && entry.lip === lip && entry.lip2 === lip2;
    for (let k = 0; k < span && same; k++) same = entry.images[k] === tileSpr[start + k] &&
      entry.cells[k] === grid[start + k] && entry.above[k] === (row > 0 ? grid[start + k - width] : null);
    if (!same) {
      for (let k = 0; k < span; k++) if (grid[start + k] === T.REED || !isOpaque(tileSpr[start + k])) return false;
      const picture = document.createElement('canvas'); picture.width = span * 16; picture.height = 16;
      const p = picture.getContext('2d'); p.imageSmoothingEnabled = false;
      entry = { picture, images: [], cells: [], above: [], lip, lip2 };
      for (let k = 0; k < span; k++) {
        const image = tileSpr[start + k], cell = grid[start + k], above = row > 0 ? grid[start + k - width] : null;
        entry.images.push(image); entry.cells.push(cell); entry.above.push(above);
        p.drawImage(image, k * 16, 0);
        if (lip && lipTypes.has(cell) && above === T.AIR) {
          p.fillStyle = lip; p.fillRect(k * 16, 0, 16, 1);
          p.fillStyle = lip2; p.fillRect(k * 16, 1, 16, 1);
        }
      }
      entries.delete(start); entries.set(start, entry);
      if (entries.size > limit) entries.delete(entries.keys().next().value);
    } else { entries.delete(start); entries.set(start, entry); }
    g.drawImage(entry.picture, x, y); return true;
  }
  return { span, clear, canDraw, draw, get bytes() { return entries.size * span * 16 * 16 * 4; } };
}
