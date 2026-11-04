// Function declaration serialized into a cloud browser. Never execute it locally.
export async function runSkyroadSpanCases(manifest, fixtures) {
  'use strict';
  const check = (condition, message) => { if (!condition) throw Error(message); };
  const urls = [];
  const canvases = new Set();
  const rows = [];
  const publicRows = [];
  const fallbackRows = [];
  const metadata = [];
  const oldRandom = Math.random;
  let rng = 0;
  const pixels = canvas => canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  async function loadUnit(files) {
    const sources = new Map(files.map(file => [file.file,
      new TextDecoder().decode(Uint8Array.from(atob(file.contentBase64), value => value.charCodeAt(0)))]));
    const cache = new Map();
    async function url(file) {
      if (cache.has(file)) return cache.get(file);
      check(sources.has(file), 'Missing unit dependency ' + file);
      let source = sources.get(file);
      for (const match of [...source.matchAll(/from\s*(['"])(\.[^'"]+)\1/g)]) {
        const target = new URL(match[2], 'https://unit.invalid/' + file).pathname.slice(1);
        source = source.replace(match[0], 'from ' + JSON.stringify(await url(target)));
      }
      if (fixtures.testExports[file]) source += '\nexport const __test={' + fixtures.testExports[file].join(',') + '};\n';
      const value = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
      urls.push(value);
      cache.set(file, value);
      return value;
    }
    return async file => import(await url(file));
  }
  const A = await loadUnit(manifest.baseline);
  const B = await loadUnit(manifest.candidate);
  const acache = await A('src/level-tile-cache.js');
  const bcache = await B('src/level-tile-cache.js');
  const helper = await B('src/skyroad-opaque-rows.js');
  function clear() {
    acache.resetLevelTileCaches();
    bcache.resetLevelTileCaches();
    for (const canvas of canvases) { canvas.width = 0; canvas.height = 0; }
    canvases.clear();
  }
  function compare(a, b, label, destination = rows) {
    if (a === null) {
      check(b === null, label + ' null result');
      destination.push({ label, nullExact: true });
      return;
    }
    check(a instanceof HTMLCanvasElement && b instanceof HTMLCanvasElement, label + ' native canvases');
    canvases.add(a);
    canvases.add(b);
    check(a.width === b.width && a.height === b.height, label + ' dimensions');
    const x = pixels(a);
    const y = pixels(b);
    let different = 0;
    for (let index = 0; index < x.length; index++) if (x[index] !== y[index]) different++;
    check(different === 0, label + ' pixel mismatch ' + different);
    const ag = a.getContext('2d');
    const bg = b.getContext('2d');
    for (const property of ['fillStyle', 'strokeStyle', 'globalAlpha', 'globalCompositeOperation',
      'imageSmoothingEnabled', 'filter', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit',
      'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'font', 'textAlign', 'textBaseline']) {
      check(Object.is(ag[property], bg[property]), label + ' context ' + property);
    }
    const transform = context => {
      const matrix = context.getTransform();
      return [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f];
    };
    check(JSON.stringify(transform(ag)) === JSON.stringify(transform(bg)), label + ' transform');
    check(JSON.stringify(ag.getLineDash()) === JSON.stringify(bg.getLineDash()), label + ' line dash');
    check(JSON.stringify(ag.getContextAttributes()) === JSON.stringify(bg.getContextAttributes()), label + ' attributes');
    check(JSON.stringify(Reflect.ownKeys(a)) === JSON.stringify(Reflect.ownKeys(b)), label + ' own metadata keys');
    for (const key of Reflect.ownKeys(a)) {
      const left = Object.getOwnPropertyDescriptor(a, key);
      const right = Object.getOwnPropertyDescriptor(b, key);
      check(left.enumerable === right.enumerable && left.configurable === right.configurable &&
        left.writable === right.writable && typeof left.value === typeof right.value, label + ' metadata descriptor');
      if (left.value === null || typeof left.value !== 'object') check(Object.is(left.value, right.value), label + ' metadata value');
    }
    destination.push({ label, different, contextExact: true, metadataExact: true });
  }
  Math.random = () => { rng++; throw Error('Unexpected global RNG'); };
  try {
    for (const [file, jobs] of Object.entries(fixtures.families)) {
      const a = await A(file);
      const b = await B(file);
      for (const name of fixtures.entries[file]) {
        check(a[name].length === b[name].length && a[name].name === b[name].name &&
          Object.hasOwn(a[name], 'prototype') === Object.hasOwn(b[name], 'prototype'), 'Public function metadata ' + name);
        metadata.push({ file, name, exact: true });
      }
      let group;
      const aliases = new Map();
      const reverse = new Map();
      for (let index = 0; index < jobs.length; index++) {
        const job = jobs[index];
        if (group !== job.group) { clear(); aliases.clear(); reverse.clear(); group = job.group; }
        const x = a.__test[job.method](...job.args);
        const y = b.__test[job.method](...job.args);
        if (aliases.has(x)) check(aliases.get(x) === y, file + ' forward alias');
        if (reverse.has(y)) check(reverse.get(y) === x, file + ' reverse alias');
        aliases.set(x, y);
        reverse.set(y, x);
        compare(x, y, file + ':' + job.method + ':' + index);
      }
      clear();
      const T = fixtures.T;
      const W = 1200;
      const H = 80;
      const grid = new Uint8Array(W * H).fill(T.SOLID);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (y % 12 === 0 || x % 19 === 0) grid[y * W + x] = T.AIR;
      }
      const level = () => ({ W, H, grid: grid.slice(), plats: [],
        lamps: [{ x: 40, y: 10 }, { x: 200, y: 22 }, { x: 450, y: 34 }],
        sun: [{ x0: 100, x1: 120 }, { x0: 702, x1: 800 }], outside: [{ x0: 702, x1: 821 }],
        crumbles: [{ row: 20, x0: 0, x1: 1200 }] });
      const la = level();
      const lb = level();
      const at = value => (x, y) => x >= 0 && x < W && y >= 0 && y < H ? value.grid[y * W + x] : T.AIR;
      const xs = [0, 26, 38, 112, 200, 237, 409, 468, 585, 702, 845, 1020];
      const ys = [0, 1, 4, 9, 20, 34, 47, 60];
      const types = [T.SOLID, T.ONEWAY, T.SPIKE, T.SOFT, T.AIR, T.BOUNCER, T.NET];
      const entry = fixtures.primary[file];
      for (let k = 0; k < 168; k++) {
        const x = xs[k % xs.length];
        const y = ys[(k >> 2) % ys.length];
        const t = types[Math.floor(k / 24)];
        compare(a[entry](t, x, y, at(la), T, la), b[entry](t, x, y, at(lb), T, lb), file + ':public:' + k, publicRows);
      }
      clear();
    }
    const activation = helper.readOpaqueRowStats();
    check(activation.optimized > 100, 'Native span optimization actually activated');
    check(activation.pixels === activation.optimized * 256, 'All opaque input pixels evaluated');
    check(activation.spans < activation.pixels / 2, 'Native fill count reduced by more than half');

    for (const mode of ['rgba', 'invalid', 'getter', 'throw', 'delete', 'freeze']) {
      const before = await loadUnit(manifest.baseline);
      const after = await loadUnit(manifest.candidate);
      const a = await before('src/redraw/skyroad_tiles.js');
      const b = await after('src/redraw/skyroad_tiles.js');
      const h = await after('src/skyroad-opaque-rows.js');
      const traces = [[], []];
      for (const [index, module] of [a, b].entries()) {
        const palette = module.ZONE[0].s;
        if (mode === 'freeze') Object.freeze(palette);
        else if (mode === 'delete') delete palette[1];
        else if (mode === 'getter' || mode === 'throw') Object.defineProperty(palette, '1', {
          configurable: true, enumerable: true, get() {
            traces[index].push('palette');
            if (mode === 'throw') throw Error('injected palette failure');
            return 'rgba(17,33,55,0.37)';
          }
        });
        else palette[1] = mode === 'rgba' ? 'rgba(17,33,55,0.37)' : 'not-a-colour';
      }
      let x;
      let y;
      let ae;
      let be;
      try { x = a.__test.massTile(0, 5, 15, 6); } catch (error) { ae = error.name + ':' + error.message; }
      try { y = b.__test.massTile(0, 5, 15, 6); } catch (error) { be = error.name + ':' + error.message; }
      check(ae === be, 'Palette exception ' + mode);
      check(JSON.stringify(traces[0]) === JSON.stringify(traces[1]), 'Palette observer order ' + mode);
      check(h.readOpaqueRowStats().optimized === 0 && h.readOpaqueRowStats().fallback === 1, 'Palette fallback activated ' + mode);
      if (!ae) compare(x, y, 'palette:' + mode, fallbackRows);
      else fallbackRows.push({ label: 'palette:' + mode, exceptionExact: true, error: ae });
      if (x) { x.width = 0; x.height = 0; }
      if (y) { y.width = 0; y.height = 0; }
    }

    for (const method of ['fillRect', 'getContext']) {
      const before = await loadUnit(manifest.baseline);
      const after = await loadUnit(manifest.candidate);
      const a = await before('src/redraw/skyroad_tiles.js');
      const b = await after('src/redraw/skyroad_tiles.js');
      const h = await after('src/skyroad-opaque-rows.js');
      const prototype = method === 'fillRect' ? CanvasRenderingContext2D.prototype : HTMLCanvasElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
      let calls = 0;
      Object.defineProperty(prototype, method, { ...descriptor, value: function (...args) {
        calls++;
        return Reflect.apply(descriptor.value, this, args);
      } });
      let x;
      let y;
      let leftCalls;
      let rightCalls;
      try {
        x = a.__test.massTile(0, 5, 15, 6);
        leftCalls = calls;
        calls = 0;
        y = b.__test.massTile(0, 5, 15, 6);
        rightCalls = calls;
      } finally { Object.defineProperty(prototype, method, descriptor); }
      check(leftCalls === rightCalls, 'Native method observer calls ' + method);
      check(h.readOpaqueRowStats().optimized === 0 && h.readOpaqueRowStats().fallback === 1, 'Native method fallback ' + method);
      compare(x, y, 'observer:' + method, fallbackRows);
      x.width = 0; x.height = 0; y.width = 0; y.height = 0;
    }
    const px = await B('src/px.js');
    const [gpu] = px.canvas(16, 16, true);
    const prior = helper.readOpaqueRowStats();
    check(helper.makeOpaqueRows(gpu.getContext('2d'), 0, 0, 0, 2, false) === null, 'Original GPU fallback');
    check(helper.readOpaqueRowStats().fallback === prior.fallback + 1, 'GPU fallback observed');
    gpu.width = 0; gpu.height = 0;
    check(rows.length === fixtures.expectedFamilyCases, 'Complete original family matrix');
    check(publicRows.length === 672, 'Complete original public selection matrix');
    check(rng === 0, 'No global RNG');
    return { rows, publicRows, fallbackRows, metadata, activation, rng, complete: true,
      notGameSafetyOrTimingOrMemoryOrFpsProof: true };
  } finally {
    clear();
    Math.random = oldRandom;
    for (const url of urls) URL.revokeObjectURL(url);
  }
}
