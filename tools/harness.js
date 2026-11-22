// Test driver for the GameCube interface: scripted buttons and pointer, steps over frames.
const __realFrame = globalThis.__frame;
const T = globalThis.T = { queue: [], held: 0, frame: 0, wait: 0, done: false, px: 320, py: 240, moved: false };
const B = { LEFT: 0x1, RIGHT: 0x2, DOWN: 0x4, UP: 0x8, Z: 0x10, R: 0x20, L: 0x40, A: 0x100, B: 0x200, X: 0x400, Y: 0x800, START: 0x1000 };
T.step = fn => T.queue.push(fn);
T.frames = n => T.step(() => { T.wait = n; });
T.press = btn => { T.step(() => { T.held = btn; T.wait = 1; }); T.step(() => { T.held = 0; T.wait = 1; }); };
T.point = (x, y) => T.step(() => { T.px = x; T.py = y; T.moved = true; T.wait = 1; });
T.click = (x, y) => { T.point(x, y); T.press(B.A); T.frames(2); };
T.until = (cond, max) => T.step(function w() { if (cond() || (w.n = (w.n || 0) + 1) > (max || 6000)) return; T.wait = 1; T.queue.unshift(w); });
T.snap = name => T.step(() => { __p.snap('shots/' + name + '.ppm'); T.out(name + ': saved'); });
T.out = s => __p.log('[test] ' + s);
T.end = () => T.step(() => { T.done = true; });
globalThis.__frame = function (inp) {
  T.frame++;
  if (T.wait > 0) T.wait--;
  else while (T.queue.length && T.wait === 0 && !T.done) { const f = T.queue.shift(); try { f(); } catch (e) { T.out('step error ' + (e && e.stack || e)); } }
  const r = __realFrame({ buttons: T.held, lx: 0, ly: 0, rx: 0, ry: 0, ptr: { x: T.px, y: T.py, moved: T.moved }, now: __p.time() });
  T.moved = false;
  if (T.done) return false;
  return r;
};
