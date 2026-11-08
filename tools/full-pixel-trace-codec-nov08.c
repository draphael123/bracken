#include <wasm_simd128.h>
// Test artifact encoding only. Both complete padded pixel buffers are read.
__attribute__((export_name("diff")))
unsigned diff(unsigned padded, unsigned previous, unsigned current, unsigned output) {
  unsigned used = 0;
  for (unsigned at = 0; at < padded; at += 16) {
    v128_t a = wasm_v128_load((const void *)(previous + at));
    v128_t b = wasm_v128_load((const void *)(current + at));
    if (wasm_v128_any_true(wasm_v128_xor(a, b))) {
      *(unsigned *)(output + used) = at;
      wasm_v128_store((void *)(output + used + 4), b);
      used += 20;
    }
  }
  return used;
}