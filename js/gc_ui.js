/* Shardscape for GameCube: screens, controls and glue around the shared engine.
 * Based on the PS Vita version's interface (vita_ui.js).
 *
 * The screen is 480 units tall and 640 wide (4:3) or 854 wide (16:9). The
 * bottom 40 units belong to the button hints, which the GameCube program
 * draws itself (__p.hints). Above them:
 *   16:9  the board on the left, the command panel docked on the right
 *   4:3   the board across the whole screen, the panel a drawer that slides
 *         in over its right side (Y, or point at the tab), with the turn
 *         shown in a bar along the top while the drawer is closed
 * Layers: 0 board, 1 hex cursor, 2 board HUD, 3 panel, 4 pop-ups.
 * Looks: the System look of the other GameCube apps (BrainBox, Flashcube). */
'use strict';
const cx = globalThis.__ctx;

/* ---------------- layout ---------------- */
const V = { SW: 640, SH: 480, HINT: 40, CH: 440, BW: 640, BH: 440, PW: 290, PX: 350, dock: false };
let CFG = __p.cfg();
function layout() {
  const wide = !!CFG.wide;
  V.SW = wide ? 854 : 640; V.SH = 480; V.HINT = 40; V.CH = V.SH - V.HINT;
  V.PW = wide ? 300 : 292; V.PX = V.SW - V.PW; V.dock = wide;
  V.BW = wide ? V.PX : V.SW; V.BH = V.CH;
  W = V.BW; H = V.BH; DPR = 1;
}

/* the System look's colours */
const COL = {
  text: '#eef1f6', soft: '#c9d2ee', dim: '#7c8692', title: '#7392ff', gold: '#e8cf4a', goldHi: '#fff496', goldInk: '#1a1608',
  rule: 'rgba(200,210,230,.28)', edge: 'rgba(215,225,240,.6)', dark: 'rgba(11,15,18,.88)', danger: '#ff5c7c', ok: '#5fe39a', muted: '#c9d2ee', brass: '#e8cf4a',
};
/* GameCube buttons, as the GameCube program reports them (PAD_BUTTON_*) */
const BTN = { LEFT: 0x1, RIGHT: 0x2, DOWN: 0x4, UP: 0x8, Z: 0x10, R: 0x20, L: 0x40, A: 0x100, B: 0x200, X: 0x400, Y: 0x800, START: 0x1000 };

/* ---------------- engine wiring ---------------- */
layout();
CARDS.forEach(c => { c.g = c.n[0]; });
const vs = {
  boardDirty: true, overlayDirty: true, panelDirty: true, hudDirty: true, popupDirty: true,
  focus: 'panel', screen: 'menu', scroll: 0, focusKey: null, items: [],
  cur: [0, 0], view: { z: 0.94, x: 0, y: 0 }, detail: null, toast: null, toastUntil: 0, thinking: null,
  touch: null, prevButtons: 0, rep: {}, ime: null, lastPhase: null, showDiff: false, buildMs: 0, frameWaiters: [], quit: false,
  menuOpen: false, menuIdx: 0, saveAt: 0,
  drawerOpen: true, drawer: 1,         /* 4:3: the drawer, and how far out it is (0..1) */
  pointer: false, ptr: { x: 320, y: 240 }, banner: null, hintKey: '',
};
globalThis.__vs = vs;
const engineDraw = draw;
draw = function () { vs.boardDirty = true; };
renderSide = function () { vs.panelDirty = true; vs.popupDirty = true; vs.hudDirty = true; };
renderChips = function () { vs.hudDirty = true; };
updateHint = function () { vs.hudDirty = true; };
toast = function (m) { vs.toast = __plain(m); vs.toastUntil = __p.time() + 2800; vs.hudDirty = true; };
animateCam = function () { cam.yaw = cam.tYaw; cam.pitch = cam.tPitch; vs.boardDirty = true; };
flashRoll = function () {};
const _commit = commit;
commit = function (fn, lazy) { _commit(fn, lazy); if (LOCAL) vs.saveAt = __p.time() + 1500; };
const _botAct = botAct;
botAct = async function (a) {
  vs.thinking = a; vs.hudDirty = true;
  await nextFrame(); await nextFrame();
  try { return await _botAct(a); } finally { vs.thinking = null; vs.hudDirty = true; }
};
function nextFrame() { return new Promise(r => vs.frameWaiters.push(r)); }
const SAVE = __p.dataDir() + 'save.json';

/* ---------------- small helpers ---------------- */
const tw = (s, size) => __c.textWidth(__plain(s), size);
function wrap(s, width, size) {
  const words = __plain(s).split(/\s+/); const lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (tw(t, size) > width && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines.length ? lines : [''];
}
function fitText(s, width, size) { s = __plain(s); if (tw(s, size) <= width) return s; while (s.length > 1 && tw(s + '...', size) > width) s = s.slice(0, -1); return s + '...'; }
function rr(x, y, w, h, r) { cx.beginPath(); r = Math.min(r, h / 2, w / 2); if (r <= 0.5) { cx.rect(x, y, w, h); return; } cx.moveTo(x + r, y); cx.lineTo(x + w - r, y); cx.arc(x + w - r, y + r, r, -Math.PI / 2, 0); cx.lineTo(x + w, y + h - r); cx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2); cx.lineTo(x + r, y + h); cx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI); cx.lineTo(x, y + r); cx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5); cx.closePath(); }
function vgrad(y0, y1, a, b) { const g = cx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function box(x, y, w, h, fill, stroke, r, lw) { rr(x, y, w, h, r === undefined ? 4 : r); if (fill) { cx.fillStyle = fill; cx.fill(); } if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = lw || 1; cx.stroke(); } }
function txt(s, x, y, size, color, align) { cx.font = (size || 13) + 'px sans-serif'; cx.fillStyle = color || COL.text; cx.textAlign = align || 'left'; cx.textBaseline = 'alphabetic'; cx.fillText(s, x, y); }

/* pieces of the System look */
function frost(x, y, w, h) { box(x, y, w, h, vgrad(y, y + h, 'rgba(76,94,114,.82)', 'rgba(40,54,70,.86)'), null, 2); cx.fillStyle = 'rgba(255,255,255,.16)'; cx.fillRect(x + 1, y + 1, w - 2, 1); box(x + 0.5, y + 0.5, w - 1, h - 1, null, COL.edge, 2); }
function goldRing(x, y, w, h) { box(x - 2.5, y - 2.5, w + 5, h + 5, null, COL.gold, 3, 3); box(x + 0.5, y + 0.5, w - 1, h - 1, null, 'rgba(106,90,16,.8)', 2); }
function goldFill(x, y, w, h) { box(x, y, w, h, vgrad(y, y + h, COL.goldHi, COL.gold), 'rgba(106,90,16,.9)', 2); }
function descBar(x, y, w, h) { box(x - 1, y - 1, w + 2, h + 2, null, 'rgba(11,11,32,1)', 4); box(x, y, w, h, vgrad(y, y + h, '#2a228c', '#3b2cb6'), null, 3); box(x + 0.5, y + 0.5, w - 1, h - 1, null, 'rgba(175,175,255,.6)', 3); }
function sysPanel(x, y, w, h) {
  box(x, y + 6, w, h, 'rgba(0,0,0,.45)', null, 6);
  box(x - 3, y - 3, w + 6, h + 6, null, 'rgba(200,208,220,.55)', 6, 2);
  box(x, y, w, h, vgrad(y, y + h, 'rgba(26,46,50,.95)', 'rgba(14,22,26,.97)'), 'rgba(10,13,16,1)', 4);
  box(x, y + 3, w, h * 0.35, vgrad(y + 3, y + 3 + h * 0.35, 'rgba(30,54,57,0)', 'rgba(40,72,74,.55)'), null, 0);
  cx.fillStyle = 'rgba(255,255,255,.18)'; cx.fillRect(x + 4, y + 1, w - 8, 1);
}
function chip(x, y, w, h) { box(x, y, w, h, 'rgba(14,22,26,.86)', 'rgba(200,208,220,.45)', h / 2); }

/* ---------------- view (pan / zoom) ---------------- */
function viewXform() { const z = vs.view.z; return { sx: z, tx: V.BW / 2 * (1 - z) + vs.view.x, ty: V.BH / 2 * (1 - z) + vs.view.y }; }
function toBase(x, y) { const t = viewXform(); return [(x - t.tx) / t.sx, (y - t.ty) / t.sx]; }
function toScreen(x, y) { const t = viewXform(); return [x * t.sx + t.tx, y * t.sx + t.ty]; }
function panelX() { return V.dock ? V.PX : V.SW - V.PW * vs.drawer; }   /* where the panel's left edge is on screen now */
function drawerShown() { return V.dock || vs.drawer > 0.98; }
function applyView() {
  const t = viewXform();
  __c.view(0, t.sx, t.tx, t.ty, 0, 0, V.BW, V.BH, true);
  __c.view(1, t.sx, t.tx, t.ty, 0, 0, V.BW, V.BH, true);
  __c.view(2, 1, 0, 0, 0, 0, V.SW, V.CH, true);
  const off = panelX() - V.PX;   /* the panel is drawn fully out; sliding moves the layer */
  const px = Math.max(0, Math.round(panelX()));
  __c.view(3, 1, off, 0, px - (V.dock ? 0 : 14), 0, V.SW - px + (V.dock ? 0 : 14), V.CH, V.dock || vs.drawer > 0.01);
  __c.view(4, 1, 0, 0, 0, 0, V.SW, V.CH, true);
}
function detailLow() { const pref = CFG.detail || 'auto'; if (pref === 'high') return false; if (pref === 'low') return true; return (S ? (S.R || 9) : 9) > 11 || (S && S.phase === 'map'); }

/* ---------------- board ---------------- */
function buildBoard() {
  const t0 = __p.time();
  __c.layer(0);
  const hov = ui.hover; ui.hover = null; ui.zoom = 1; ui.pan = { x: 0, y: 0 }; ui.fast = detailLow();
  try { engineDraw(); } catch (e) { console.log('draw failed', e && e.stack || e); }
  ui.hover = hov; vs.boardDirty = false; vs.overlayDirty = true; vs.buildMs = __p.time() - t0;
}
function cellTopRing(k, scale) {
  const g = geo(); const [q, r] = P(k); const [wx, wy] = hexW(q, r); const map = curMap(); const col = map[k];
  const h = col ? col.replace(/t/g, '').length : 0; return ring(g, wx, wy, h * LHU, scale || 1);
}
function buildOverlay() {
  __c.layer(1); __c.clear(1); __c.setTransform(1, 0, 0, 1, 0, 0);
  vs.overlayDirty = false;
  if (vs.focus !== 'board' || !S) return;
  const k = K(vs.cur[0], vs.cur[1]); if (!inBoard(vs.cur[0], vs.cur[1])) return;
  const pts = cellTopRing(k);
  cx.beginPath(); pts.forEach((p, i) => i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1])); cx.closePath();
  cx.lineWidth = 4.5; cx.strokeStyle = 'rgba(0,0,0,.6)'; cx.stroke();
  cx.lineWidth = 2.5; cx.strokeStyle = COL.gold; cx.stroke();
}
function moveCursor(dx, dy) {
  // move to the neighbouring hex whose on-screen direction best matches the D-pad
  const g = geo(); const [q, r] = vs.cur; const [wx, wy] = hexW(q, r); const p0 = pt(g, wx, wy, 0);
  let best = null, bs = -1e9;
  for (const [nq, nr] of nbrs(q, r)) {
    if (!inBoard(nq, nr)) continue; const [a, b] = hexW(nq, nr); const p = pt(g, a, b, 0);
    const vx = p[0] - p0[0], vy = p[1] - p0[1], l = Math.hypot(vx, vy) || 1; const s = (vx * dx + vy * dy) / l;
    if (s > bs) { bs = s; best = [nq, nr]; }
  }
  if (best && bs > 0.3) { vs.cur = best; vs.overlayDirty = true; vs.hudDirty = true; keepCursorVisible(); }
}
function boardRight() { return V.dock ? V.BW : (vs.drawerOpen ? V.SW - V.PW : V.SW); }   /* the part of the board you can see */
function keepCursorVisible() {
  const k = K(vs.cur[0], vs.cur[1]); const pts = cellTopRing(k); const cxp = pts.reduce((a, p) => a + p[0], 0) / 6, cyp = pts.reduce((a, p) => a + p[1], 0) / 6;
  const [sx, sy] = toScreen(cxp, cyp); const m = 60, top = V.dock ? 50 : 70;
  if (sx < m) vs.view.x += m - sx; if (sx > boardRight() - m) vs.view.x -= sx - (boardRight() - m);
  if (sy < top) vs.view.y += top - sy; if (sy > V.BH - 50) vs.view.y -= sy - (V.BH - 50);
}
function centerCursor() {
  let k = null;
  if (S) {
    const mine = S.units.find(u => u.hp > 0 && u.k && ctl(u.o) && !isBot(u.o));
    if (mine) k = mine.k; else { const z = Object.keys(S.zones || {}).find(z => ctl(S.zones[z])); if (z) k = z; }
  }
  vs.cur = k ? P(k) : [0, 0]; vs.overlayDirty = true;
}
function boardAction(lower) {
  if (!S) return;
  const k = K(vs.cur[0], vs.cur[1]);
  if (S.phase === 'map') { if (isHost()) editHex(k, !!lower); return; }
  clickHex(k, false);
}
function hexAt(x, y) {   /* the hex under a point on the screen, or null */
  if (x < 0 || y < 0 || x >= V.BW || y >= V.BH) return null;
  if (vs.boardDirty) buildBoard();
  const [bx, by] = toBase(x, y); return pick(bx, by);
}

/* ---------------- HUD over the board ---------------- */
const phaseName = { lobby: 'Lobby', map: 'Building the map', draft: 'Draft', deploy: 'Deployment', battle: 'Battle', over: 'Game over' };
function hoverInfo() {
  const k = K(vs.cur[0], vs.cur[1]); const map = curMap(); const col = map[k]; if (!col) return null;
  const g = col.replace(/t/g, ''); const tt = g[g.length - 1];
  const terr = (col.includes('t') ? 'Tree on ' : '') + TERR[tt].n + ', height ' + g.length;
  const u = S && S.units.find(x => x.hp > 0 && x.k === k);
  return { terr, u };
}
/* the logo (the layered hex of the desktop icon), for the title screen */
function drawLogo(cxp, cyp, s) {
  const hex = (x, y, r) => { const p = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 2; p.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return p; };
  const poly = (pts, c) => { cx.beginPath(); pts.forEach((p, i) => i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1])); cx.closePath(); cx.fillStyle = c; cx.fill(); };
  const r = s, k = 0.866 * r, t = s * 0.17; let y = 0;
  for (const [l, rc] of [['#76571f', '#96702a'], ['#4b4c50', '#5f6066'], ['#3a5426', '#4c6b30']]) {
    poly([[cxp - k, cyp + r / 2 + y], [cxp, cyp + r + y], [cxp, cyp + r + y + t], [cxp - k, cyp + r / 2 + y + t]], l);
    poly([[cxp, cyp + r + y], [cxp + k, cyp + r / 2 + y], [cxp + k, cyp + r / 2 + y + t], [cxp, cyp + r + y + t]], rc); y += t;
  }
  poly(hex(cxp, cyp, r), '#d4a74a'); poly(hex(cxp, cyp, r * 0.4), '#e8e3d3');
}
function hintsFor() {
  if (vs.ime || vs.settings) return [];
  if (vs.menuOpen) return ['S:Point', 'A:Choose', 'B:Close', 'ST:Close'];
  if (vs.detail) return ['B:Close'];
  const panel = vs.focus === 'panel';
  if (panel) {
    const it = vs.items.find(i => i.key === vs.focusKey);
    const h = ['S:Point', it && it.sel ? 'A:Change' : 'A:Choose'];
    if (S && !panelOpenScreen()) h.push(V.dock ? 'Y:Board' : 'Y:Close panel');
    else if (vs.screen !== 'menu') h.push('B:Back');
    h.push('ST:Menu');
    return h;
  }
  if (!S) return ['S:Point', 'A:Choose', 'ST:Menu'];
  const p = V.dock ? 'Y:Panel' : (vs.drawerOpen ? 'Y:Close panel' : 'Y:Open panel');
  if (S.phase === 'map' && isHost()) return ['A:Build', 'X:Lower', 'L/R:Turn', p, 'ST:Menu'];
  if (S.phase === 'deploy' && ctl(S.deploy.seat)) return ['A:Place / pick up', 'L/R:Turn', 'Z:Zoom', p, 'ST:Menu'];
  if (S.phase === 'battle' && S.turn.stage !== 'orders' && ctl(S.turn.seat) && !isBot(S.turn.seat))
    return ['A:Select / move / attack', 'B:Cancel', 'X:End turn', p, 'ST:Menu'];
  return ['S:Point', 'L/R:Turn', 'Z:Zoom', 'C:Tilt', p];
}
function pushHints() { const h = hintsFor(); const key = h.join('|'); if (key !== vs.hintKey) { vs.hintKey = key; __p.hints(h); } }
function statusText() {
  if (!S) return 'Shardscape - ' + (ui.dbReady ? 'online ready' : 'offline');
  let s = (S.code === 'LOCAL' ? 'Offline' : 'Game ' + S.code) + ' - ' + (phaseName[S.phase] || '');
  if (S.phase === 'battle' && S.turn) s += ' - Round ' + S.turn.round;
  return s;
}
function buildHud() {
  __c.layer(2); __c.clear(2); __c.setTransform(1, 0, 0, 1, 0, 0); vs.hudDirty = false;
  const right = boardRight();
  if (!S) {   /* the title, in the space beside the panel */
    const w = V.dock ? V.BW : V.SW - V.PW, c = w / 2, top = V.CH * 0.30;
    cx.fillStyle = 'rgba(6,6,8,.72)'; cx.fillRect(0, 0, w, V.CH);
    const s = Math.min(70, w * 0.16);
    drawLogo(c, top, s);
    txt('Shard', c, top + s * 1.95 + 22, 40, COL.text, 'right'); txt('scape', c, top + s * 1.95 + 22, 40, '#d4a74a', 'left');
    txt('HEX SKIRMISH FOR GAMECUBE', c, top + s * 1.95 + 48, 12, COL.soft, 'center');
  }
  // the bar along the top: the game and phase, and (4:3, drawer closed) whose turn it is
  if (S) {
    const closed = !V.dock && !vs.drawerOpen;
    const b = vs.banner;
    const left = closed && b ? b.text : statusText();
    const lw = Math.min(tw(left, 12) + (closed && b ? 44 : 26), right - 24);
    chip(10, 8, lw, 24);
    let x = 21;
    if (closed && b) { cx.beginPath(); cx.arc(x + 4, 20, 5, 0, Math.PI * 2); cx.fillStyle = b.color || COL.gold; cx.fill(); x += 14; }
    txt(fitText(left, lw - (x - 10) - 10, 12), x, 24, 12, COL.text);
    // the hex under the cursor: what's there, at the bottom left
    const info = (vs.pointer ? vs.pointerOnBoard : vs.focus === 'board') ? hoverInfo() : null;
    if (info) {
      const lines = [info.terr]; if (info.u) { const c = CARD[info.u.card]; lines.unshift(c.n + ' (' + seatName(S, info.u.o) + ')  HP ' + info.u.hp + '/' + c.hp); }
      const w = Math.min(Math.max(...lines.map(l => tw(l, 12))) + 22, right - 30); const h = 10 + lines.length * 17;
      box(10, V.CH - h - 8, w, h, 'rgba(14,22,26,.88)', 'rgba(200,208,220,.45)', 4);
      lines.forEach((l, i) => txt(fitText(l, w - 20, 12), 20, V.CH - h - 8 + 21 + i * 17, 12, i === 0 && info.u ? SEATC[info.u.o] : COL.text));
    }
  }
  // the drawer's tab (4:3, closed)
  if (S && !V.dock && !vs.drawerOpen) {
    const tx = V.SW - 26, ty = V.CH / 2 - 40; vs.tab = { x: tx - 6, y: ty - 6, w: 38, h: 92 };
    box(tx, ty, 30, 80, vgrad(ty, ty + 80, 'rgba(76,94,114,.9)', 'rgba(40,54,70,.92)'), COL.edge, 4);
    cx.beginPath(); cx.moveTo(tx + 9, ty + 30); cx.lineTo(tx + 19, ty + 23); cx.lineTo(tx + 19, ty + 37); cx.closePath(); cx.fillStyle = COL.text; cx.fill();
    box(tx + 6, ty + 48, 18, 18, 'rgba(8,8,10,1)', 'rgba(255,255,255,.3)', 9); txt('Y', tx + 15, ty + 61, 11, COL.soft, 'center');
  } else vs.tab = null;
  if (vs.thinking !== null && vs.thinking !== undefined && S) {
    const m = ui.botPaused ? 'Bots paused' : (vs.thinking === 'auto' ? 'The bots are setting up' : seatName(S, vs.thinking) + ' is thinking') + '...';
    const w = tw(m, 13) + 30, x = (right - w) / 2; box(x, 42, w, 26, vgrad(42, 68, COL.goldHi, COL.gold), 'rgba(106,90,16,.9)', 13); txt(m, x + w / 2, 59, 13, COL.goldInk, 'center');
  }
  if (vs.toast && __p.time() < vs.toastUntil) {
    const lines = wrap(vs.toast, Math.min(440, right - 60), 13); const h = 14 + lines.length * 18; const w = Math.max(...lines.map(l => tw(l, 13))) + 36;
    const x = (right - w) / 2, y = V.CH - h - 14 - (S ? 46 : 0);
    descBar(x, y, w, h); lines.forEach((l, i) => txt(l, x + w / 2, y + 20 + i * 18, 13, '#ecebff', 'center'));
  }
  pushHints();
}

/* ---------------- panel widgets ---------------- */
const PADX = 12;
let PY = 0;
function IW() { return V.PW - 2 * PADX; }
function X0() { return V.PX + PADX; }
function vis(y, h) { const s = y - vs.scroll; return s + h > 0 && s < V.CH; }
function sy(y) { return y - vs.scroll; }
function focusOn(key) { return vs.focus === 'panel' && vs.focusKey === key; }
function item(key, h, o) { const it = Object.assign({ key, y: PY, h, x: X0(), w: IW() }, o); vs.items.push(it); return it; }
function pGap(h) { PY += h; }
function pHead(s) {
  PY += 8;
  if (vis(PY, 20)) { txt(s.toUpperCase(), X0(), sy(PY + 12), 11, COL.title); cx.fillStyle = COL.rule; cx.fillRect(X0(), sy(PY + 17), IW(), 1); }
  PY += 24;
}
function pText(s, o) {
  o = o || {}; const size = o.size || 13; const lines = wrap(s, IW() - (o.indent || 0), size);
  for (const l of lines) { if (vis(PY, size + 6)) txt(l, X0() + (o.indent || 0), sy(PY + size), size, o.color || COL.text, o.align); PY += Math.round(size * 1.38); }
}
function pBanner(s, color) {
  if (!vs.banner) vs.banner = { text: __plain(s), color: color || COL.gold };
  const lines = wrap(s, IW() - 30, 13); const h = 14 + lines.length * 18;
  if (vis(PY, h)) {
    descBar(X0(), sy(PY), IW(), h);
    cx.beginPath(); cx.arc(X0() + 13, sy(PY) + h / 2, 5, 0, Math.PI * 2); cx.fillStyle = color || COL.gold; cx.fill();
    lines.forEach((l, i) => txt(l, X0() + 25, sy(PY) + 20 + i * 18, 13, '#ecebff'));
  }
  PY += h + 8;
}
function pButton(key, label, act, o) {
  o = o || {}; const h = o.h || 30; const it = item(key, h, { act: o.disabled ? null : act, disabled: o.disabled, x: o.x || X0(), w: o.w || IW(), row: o.row });
  if (vis(it.y, h)) {
    const f = focusOn(key), y = sy(it.y);
    if (o.primary && !o.disabled) goldFill(it.x, y, it.w, h); else frost(it.x, y, it.w, h);
    if (o.on && !f) box(it.x + 0.5, y + 0.5, it.w - 1, h - 1, null, COL.gold, 2);
    if (f) goldRing(it.x, y, it.w, h);
    txt(fitText(label, it.w - 14, 13), it.x + it.w / 2, y + h / 2 + 5, 13, o.disabled ? COL.dim : (o.primary ? COL.goldInk : COL.text), 'center');
  }
  if (!o.row) PY += h + 7;
  return it;
}
function pRow(btns) {
  const n = btns.length, gap = 7, w = (IW() - gap * (n - 1)) / n; const y0 = PY; const rowId = 'row' + y0;
  btns.forEach((b, i) => { PY = y0; pButton(b[0], b[1], b[2], Object.assign({}, b[3] || {}, { x: X0() + i * (w + gap), w, row: rowId, h: (b[3] && b[3].h) || 28 })); });
  PY = y0 + ((btns[0][3] && btns[0][3].h) || 28) + 7;
}
function pSelect(key, label, opts, val, onChange, o) {
  o = o || {}; const h = 30; let idx = Math.max(0, opts.findIndex(x => x[0] === val));
  const change = d => { if (o.disabled) return; idx = (idx + d + opts.length) % opts.length; onChange(opts[idx][0]); vs.panelDirty = true; vs.popupDirty = true; };
  const it = item(key, h, { act: () => change(1), left: () => change(-1), right: () => change(1), sel: true, disabled: o.disabled });
  if (vis(it.y, h)) {
    const f = focusOn(key), y = sy(it.y), x = X0(), w = IW();
    frost(x, y, w, h); if (f) goldRing(x, y, w, h);
    const lw = Math.min(tw(label, 12) + 6, w * 0.46);
    txt(fitText(label, w * 0.46, 12), x + 10, y + 20, 12, COL.soft);
    const ac = o.disabled ? COL.dim : (f ? COL.text : 'rgba(201,210,238,.55)');
    const ax = x + lw + 14, bx = x + w - 10, cy = y + h / 2;
    cx.beginPath(); cx.moveTo(ax, cy); cx.lineTo(ax + 7, cy - 5.5); cx.lineTo(ax + 7, cy + 5.5); cx.closePath(); cx.fillStyle = ac; cx.fill();
    cx.beginPath(); cx.moveTo(bx, cy); cx.lineTo(bx - 7, cy - 5.5); cx.lineTo(bx - 7, cy + 5.5); cx.closePath(); cx.fill();
    const v = fitText((opts[idx] || ['', ''])[1], bx - ax - 26, 13);
    txt(v, (ax + 7 + bx - 7) / 2, y + 20, 13, o.disabled ? COL.dim : COL.text, 'center');
  }
  PY += h + 7;
}
function statLine(c) { return 'Life ' + c.hp + '  Mv ' + c.mv + '  Rng ' + c.rg + '  Atk ' + c.at + '  Def ' + c.df + '  Ht ' + figH(c); }
function portrait(x, y, r, c, owner) {
  cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.fillStyle = c.c; cx.fill();
  cx.lineWidth = 2; cx.strokeStyle = owner !== undefined ? SEATC[owner] : 'rgba(0,0,0,.45)'; cx.stroke();
  txt(c.n[0], x, y + r * 0.42, Math.round(r * 1.05), '#fff', 'center');
}
function pCard(key, c, o) {
  o = o || {}; const h = 44; const it = item(key, h, { act: o.act || null, card: c.id, disabled: o.disabled, pref: o.pref });
  if (vis(it.y, h)) {
    const f = focusOn(key), y = sy(it.y), x = X0(), w = IW();
    frost(x, y, w, h);
    if (o.sel && !f) box(x + 0.5, y + 0.5, w - 1, h - 1, null, COL.gold, 2);
    if (f) goldRing(x, y, w, h);
    cx.globalAlpha = o.dim ? 0.45 : 1;
    portrait(x + 20, y + 22, 13, c, o.owner);
    txt(fitText(c.n, w - 96, 13), x + 40, y + 19, 13, COL.text);
    txt(fitText(o.tag || (c.k + (c.f > 1 ? ' of ' + c.f : '') + (c.ab.length ? ' - ' + c.ab.map(a => ABIL[a].n).join(', ') : '')), w - 50, 11), x + 40, y + 36, 11, o.tag ? (o.owner !== undefined ? SEATC[o.owner] : COL.gold) : COL.soft);
    txt(String(c.p), x + w - 10, y + 19, 13, COL.gold, 'right');
    cx.globalAlpha = 1;
  }
  PY += h + 5;
}
function pSeatRow(i, right, o) {
  o = o || {}; const h = 26;
  if (vis(PY, h)) {
    const x = X0(), w = IW(), y = sy(PY);
    box(x, y, w, h, COL.dark, o.active ? COL.gold : 'rgba(200,208,220,.3)', 2, o.active ? 1.5 : 1);
    cx.beginPath(); cx.arc(x + 13, y + h / 2, 5, 0, Math.PI * 2); cx.fillStyle = SEATC[i]; cx.fill();
    txt(fitText(seatName(S, i) + (S.seats[i] && !LOCAL && S.seats[i].id === myId ? ' (you)' : ''), w - 124, 12), x + 25, y + 17, 12, COL.text);
    if (right) txt(right, x + w - 9, y + 17, 11, COL.soft, 'right');
  }
  PY += h + 4;
}
function pDice() {
  if (!S || !S.roll) return;
  pHead('Last roll - ' + S.roll.t);
  for (const r of S.roll.rows) {
    const h = 26 + (r.a.length || r.d.length ? 20 : 0);
    if (vis(PY, h)) {
      const x0 = X0(), w = IW(); box(x0, sy(PY), w, h, COL.dark, 'rgba(200,208,220,.3)', 2);
      txt(fitText(r.l, w - 104, 11), x0 + 8, sy(PY) + 16, 11, COL.text); txt(fitText(r.res, 96, 11), x0 + w - 8, sy(PY) + 16, 11, COL.gold, 'right');
      let x = x0 + 8; const y = sy(PY) + 23;
      const die = f => { box(x, y, 16, 16, f === 'sk' ? '#f0d9d2' : f === 'sh' ? '#d6e3f2' : '#efe6cf', null, 3); if (f === 'sk') { cx.beginPath(); cx.arc(x + 8, y + 7, 4, 0, Math.PI * 2); cx.fillStyle = '#9c2414'; cx.fill(); cx.fillRect(x + 5.5, y + 10, 5, 3.5); } else if (f === 'sh') { cx.beginPath(); cx.moveTo(x + 4, y + 3.5); cx.lineTo(x + 12, y + 3.5); cx.lineTo(x + 12, y + 8); cx.quadraticCurveTo(x + 8, y + 15, x + 4, y + 8); cx.closePath(); cx.fillStyle = '#1f4f88'; cx.fill(); } x += 19; };
      if (r.a.length) { r.a.forEach(die); x += 9; } if (r.d.length) r.d.forEach(die); if (r.blink) die('sh');
    }
    PY += h + 4;
  }
}
function pLog(n) {
  if (!S || !S.log.length) return; pHead('Battle log');
  for (const m of S.log.slice(0, n || 8)) pText(m, { size: 11, color: COL.soft });
}

/* ---------------- panel screens ---------------- */
const LEVEL_OPTS = [['human', 'Human'], ...LEVELS.map(l => [l, 'Bot ' + LV_NAME[l]])];
const SIZE_OPTS = [[0, 'Auto'], ...BOARDS.map(([r, nm, h]) => [r, nm + ' (' + h + ')'])];
const BUDGETS = [300, 400, 500, 700, 1000].map(b => [b, b + ' pts']);
function goScreen(s) { vs.screen = s; vs.scroll = 0; vs.focusKey = null; vs.focus = 'panel'; vs.drawerOpen = true; vs.panelDirty = vs.hudDirty = vs.popupDirty = true; }
function hasSave() { const t = __p.read(SAVE); if (!t) return false; try { const d = JSON.parse(t); return d && d.phase && d.phase !== 'over'; } catch (e) { return false; } }
function continueSave() {
  try { const d = JSON.parse(__p.read(SAVE)); LOCAL = true; gameRef = null; S = d; syncR(); readOnly = false; vs.screen = 'game'; centerCursor(); renderAll(); toast('Game restored.'); }
  catch (e) { toast('That saved game could not be loaded.'); }
}
function connectPrompt() {
  askText('Address of the game host (shown in its Network box, e.g. 192.168.1.20)', lsGet('ss-gc-server') || '', 2, 60, t => {
    t = t.trim(); if (!t) return; lsSet('ss-gc-server', t); connectServer(t); toast('Connecting to ' + t + '...');
  });
}
function hostShown() { return globalThis.__srv && __srv.running() ? __p.ip() : ui.server; }
/* host games here: the relay on this GameCube, and this player joined to it */
function hostHere() {
  if (!__srv.start()) { toast('Could not start hosting (is another program using port 47800?).'); return; }
  lsSet('ss-gc-server', '');
  switchDB(() => __srv.loopback(), __p.ip() + ' (this GameCube)', 'Lost connection to the host.');
  toast('Hosting. Friends connect to ' + __p.ip() + ' and join your game.');
}
function askText(title, initial, kind, maxlen, cb) { vs.ime = cb; __p.imeOpen(title, initial || '', maxlen || 40, kind || 0); vs.hudDirty = true; }
function screenMenu() {
  PY = 4;
  pHead('Main menu');
  if (hasSave()) pButton('cont', 'Continue offline game', continueSave, { primary: true });
  pButton('name', 'Name: ' + (ui.name || 'choose one'), () => askText('Commander name', ui.name, 0, 20, t => { ui.name = t.trim(); lsSet('ss-name', ui.name); vs.panelDirty = true; }));
  pHead('Offline - bots or pass-and-play');
  pSelect('offN', 'Players', [2, 3, 4, 5, 6].map(n => [n, n + ' players']), ui.off.n, v => ui.off.n = v);
  pSelect('offB', 'Points', BUDGETS, ui.off.b, v => ui.off.b = v);
  pSelect('offR', 'Board', SIZE_OPTS, ui.off.r || 0, v => ui.off.r = v);
  for (let i = 0; i < ui.off.n; i++) pSelect('seat' + i, 'Seat ' + (i + 1), LEVEL_OPTS, ui.off.seats[i], v => ui.off.seats[i] = v);
  pSelect('allb', 'All bots', [['', 'choose...'], ...LEVELS.map(l => [l, LV_NAME[l]])], '', v => { if (!v) return; const any = ui.off.seats.slice(0, ui.off.n).some(x => x !== 'human'); ui.off.seats = ui.off.seats.map(x => x === 'human' && any ? x : v); });
  pButton('startOff', 'Start offline game', () => { createGame(ui.off.n, ui.off.b, true, ui.off.seats.slice(0, ui.off.n), ui.off.r || null); vs.screen = 'game'; }, { primary: !hasSave() });
  pButton('watch', 'Watch bots battle', () => { ui.botPaused = false; createGame(ui.off.n, ui.off.b, true, ui.off.seats.slice(0, ui.off.n).map(x => x === 'human' ? 'normal' : x), ui.off.r || null); vs.screen = 'game'; });
  pHead('Online - over your network');
  const ip = __p.ip(), hosting = globalThis.__srv && __srv.running();
  if (!ip) pText(__p.netMessage ? __p.netMessage() : 'Connecting to the network...', { size: 12, color: __p.netMessage && __p.netMessage() ? COL.danger : COL.soft });
  else pText('This GameCube: ' + ip + (hosting ? '  (hosting games)' : ''), { size: 12, color: COL.soft });
  pText(ui.dbReady ? 'Connected to ' + ui.server + '.' : (ui.server ? 'Connecting to ' + ui.server + '...' : 'Host games here, or join a game hosted on a PC, Mac or another GameCube.'), { size: 12, color: COL.soft });
  if (ip && globalThis.__srv && !hosting) pButton('hostHere', 'Host games on this GameCube', hostHere, { primary: !ui.dbReady });
  if (!hosting) pButton('srv', ui.server ? 'Host: ' + ui.server : 'Join a host by address', connectPrompt, { disabled: !ip });
  if (ui.dbReady) {
    pSelect('onN', 'Players', [2, 3, 4, 5, 6].map(n => [n, n + ' players']), ui.onN || 2, v => ui.onN = v);
    pSelect('onB', 'Points', BUDGETS, ui.onB || 500, v => ui.onB = v);
    pSelect('onR', 'Board', SIZE_OPTS, ui.onR || 0, v => ui.onR = v);
    pButton('host', 'Start an online game', () => { createGame(ui.onN || 2, ui.onB || 500, false, null, ui.onR || null); vs.screen = 'game'; }, { primary: true });
    pButton('join', 'Join with a code', () => askText('Game code', '', 0, 5, t => { t = t.trim().toUpperCase(); if (t) { joinGame(t); vs.screen = 'game'; } }));
    const g = openGames.filter(x => x && x.code);
    if (g.length) { pHead('Recent games'); g.slice(0, 8).forEach(x => pButton('g' + x.code, x.code + ' - ' + (x.phase === 'lobby' ? 'waiting' : x.phase) + ' - ' + x.seats.filter(Boolean).length + '/' + x.n, () => { joinGame(x.code); vs.screen = 'game'; })); }
  }
  pHead('More');
  pButton('roster', 'Browse all ' + CARDS.length + ' characters', () => goScreen('roster'));
  pButton('rules', 'How to play', () => goScreen('rules'));
  pButton('settings', 'Settings', () => openSettings());
  pButton('quit', 'Exit to Launcher', () => { vs.quit = true; });
}
function rosterFiltered(left, onlyFree) {
  const f = ui.filter || 'all', q = (ui.q || '').toLowerCase();
  let l = CARDS.filter(c => f === 'all' || c.k === f || (f === 'fly' && c.ab.includes('fly')) || (f === 'ranged' && c.rg > 1) || (f === 'afford' && left != null && c.p <= left));
  if (q) l = l.filter(c => (c.n + ' ' + c.t + ' ' + c.k + ' ' + c.ab.map(a => ABIL[a].n).join(' ')).toLowerCase().includes(q));
  if (onlyFree && S) { const t = taken(S); l = l.filter(c => !t.has(c.id)); }
  return ui.sort === 'p' ? [...l].sort((a, b) => b.p - a.p) : [...l].sort((a, b) => a.n.localeCompare(b.n));
}
function pFilters(draft) {
  const opts = [['all', 'All'], ['Hero', 'Heroes'], ['Squad', 'Squads'], ['fly', 'Flyers'], ['ranged', 'Ranged']]; if (draft) opts.push(['afford', 'Affordable']);
  pSelect('flt', 'Show', opts, ui.filter || 'all', v => { ui.filter = v; vs.scroll = Math.min(vs.scroll, 0); });
  pSelect('srt', 'Sort', [['name', 'By name'], ['p', 'By points']], ui.sort || 'name', v => ui.sort = v);
  pButton('q', ui.q ? 'Search: ' + ui.q + ' (change)' : 'Search name or ability', () => askText('Search characters', ui.q || '', 0, 24, t => { ui.q = t.trim(); vs.panelDirty = true; }));
}
function screenRoster() {
  PY = 10; pButton('back', '< Back', () => goScreen(S ? 'game' : 'menu'));
  pHead(CARDS.length + ' characters'); pFilters(false);
  rosterFiltered(null).forEach(c => pCard('c' + c.id, c, { act: () => { vs.detail = c.id; vs.popupDirty = true; } }));
}
function screenRules() {
  PY = 10; pButton('back', '< Back', () => goScreen(S ? 'game' : 'menu'));
  const R_ = [
    ['Build', 'The host shapes the battlefield and marks start zones. Trees block movement and sight. Water ends movement; lava ends it and burns. Sand and snow cost 1 extra move, swamp 2; roads cost half. Ice gives -1 defense, castle stone +1 defense, power shards +1 attack.'],
    ['Draft', 'Snake draft from one shared roster: every character can be drafted once. Stay within your points, or stop early.'],
    ['Order markers', 'Each round every player secretly places markers 1, 2 and 3 (and a decoy X) on their army cards. One card can carry several.'],
    ['Turns', 'Everyone rolls a d20 for initiative (ties roll again). Then each player takes the turn marked 1, then 2, then 3. The marked card moves its figures, then attacks. A marker on a destroyed card is a lost turn.'],
    ['Moving', 'Each space costs 1, plus 1 per level climbed. A figure can climb a ledge up to its Height. Dropping its Height or more is a fall. Leaving an adjacent enemy gives it a 1-die attack.'],
    ['Combat', 'Dice show 3 skulls, 2 shields, 1 blank. Attacker counts skulls, defender counts shields; each extra skull is a wound. Standing higher gives +1 die.'],
    ['Winning', 'Be the last army standing (a 40-round limit decides by surviving points).'],
    ['Controls', 'The Control Stick moves the pointer and A clicks: select, move and attack on the board, or choose in the panel. Hold A and move to drag the board or scroll the panel. B cancels, X ends your turn (lowers terrain in the map editor), ' + (V.dock ? 'Y switches between the board and the panel' : 'Y opens and closes the panel') + '. L and R turn the battlefield, the C-Stick tilts and turns it, Z zooms. The + Control Pad steps the cursor hex by hex. START opens the menu.'],
  ];
  for (const [h, t] of R_) { pHead(h); pText(t, { size: 12 }); }
}

function screenGame() {
  const ph = S.phase; PY = 10;
  if (ph === 'lobby') {
    pBanner('Game ' + S.code);
    pText(LOCAL ? 'Offline game on this GameCube.' : 'Friends connect to ' + hostShown() + ' and join with code ' + S.code + '.', { size: 13, color: COL.muted });
    pHead('Seats');
    S.seats.forEach((x, i) => { if (!x && !readOnly) pButton('take' + i, 'Take seat ' + (i + 1), () => takeSeat(i)); else pSeatRow(i, x ? '' : 'open'); });
    const full = S.seats.every(Boolean);
    if (isHost() && !full) pButton('fill', 'Fill empty seats on this GameCube', () => commit(s => { s.seats = s.seats.map((x, i) => x || { id: myId, name: 'Player ' + (i + 1) }); }));
    if (isHost()) pButton('toMap', 'Build the battlefield', () => commit(s => { s.phase = 'map'; log(s, 'The host is building the battlefield.'); }), { primary: true, disabled: !full });
    else pText('Waiting for the host to start.', { color: COL.muted });
  } else if (ph === 'map') {
    pBanner('Battlefield editor');
    if (isHost()) {
      pText('Move the cursor on the board and press A to build, X to lower.', { size: 12, color: COL.muted });
      pSelect('tool', 'Tool', [['raise', 'Raise'], ['lower', 'Lower'], ['paint', 'Repaint'], ['zone', 'Start zone']], ui.tool, v => ui.tool = v);
      if (ui.tool === 'zone') pSelect('zs', 'Zone for', S.seats.map((_, i) => [i, seatName(S, i)]), ui.zoneSeat, v => ui.zoneSeat = v);
      else pSelect('terr', 'Terrain', Object.entries(TERR).map(([k, t]) => [k, t.n]), ui.terr, v => ui.terr = v);
      pSelect('gen', 'New layout', [['', 'choose...'], ['hills', 'Rolling Hills'], ['lava', 'Lava Rift'], ['islands', 'Twin Isles'], ['frozen', 'Frozen Peaks'], ['swamp', 'Swamp Delta'], ['castle', 'Castle Siege'], ['flat', 'Open Field']], '', v => { if (v) commit(s => { s.map = genMap(v); autoZones(s); }); });
      pSelect('bsz', 'Board size', BOARDS.map(([r, nm, h]) => [r, nm + ' (' + h + ')']), S.R || 9, v => { commit(s => { s.R = v; R = v; s.map = genMap('hills'); autoZones(s); log(s, 'Board resized to ' + boardName(v) + '.'); }); vs.view = { z: 0.94, x: 0, y: 0 }; });
      pRow([['autoZ', 'Auto zones', () => commit(s => autoZones(s))], ['clr', 'Clear', () => commit(s => { s.map = {}; for (let q = -R; q <= R; q++) for (let r = -R; r <= R; r++) if (inBoard(q, r) && dist([q, r], [0, 0]) <= 6) s.map[K(q, r)] = 'g'; s.zones = {}; })]]);
      pButton('toDraft', 'Lock map and start draft', () => { const bad = S.seats.findIndex((_, i) => !Object.values(S.zones).includes(i)); commit(s => { if (bad >= 0) autoZones(s); startDraft(s); }); }, { primary: true });
    } else pText('The host is building the map. It updates live.', { color: COL.muted });
    pHead('Players'); S.seats.forEach((_, i) => pSeatRow(i));
  } else if (ph === 'draft') {
    const seat = draftSeat(S), me = ctl(seat), left = budgetFor(S, seat) - pts(S, seat);
    pBanner((me ? (LOCAL ? seatName(S, seat) + ', your pick' : 'Your pick') : seatName(S, seat) + ' is picking') + ' - ' + left + ' pts left', SEATC[seat]);
    S.seats.forEach((_, i) => pSeatRow(i, pts(S, i) + '/' + budgetFor(S, i) + ' pts', { active: i === seat }));
    if (me) pButton('pass', 'Stop drafting', draftPass);
    pFilters(true);
    const t = taken(S); const owner = {}; for (const k in S.army) S.army[k].forEach(id => owner[id] = +k);
    rosterFiltered(me ? left : null).forEach(c => {
      const o = owner[c.id]; const can = me && o === undefined && c.p <= left;
      pCard('c' + c.id, c, { pref: can, dim: o !== undefined || (me && c.p > left), owner: o, tag: o !== undefined ? 'Drafted by ' + seatName(S, o) : null, act: can ? () => draftPick(c.id) : () => { vs.detail = c.id; vs.popupDirty = true; } });
    });
  } else if (ph === 'deploy') {
    const seat = S.deploy.seat, me = ctl(seat); const un = S.units.filter(u => u.o === seat && !u.k);
    pBanner(me ? seatName(S, seat) + ': deploy your army' : seatName(S, seat) + ' is deploying', SEATC[seat]);
    if (me) {
      pText('Pick a card, then press A on an open hex in your colored zone. Press it on a placed figure to pick it up.', { size: 12, color: COL.muted });
      pRow([['autoDep', 'Auto-deploy', () => commit(s => autoDeploy(s, s.deploy.seat))], ['ready', 'Ready', () => { ui.deploySel = null; commit(s => { log(s, seatName(s, s.deploy.seat) + ' is deployed.'); nextDeploy(s); }); }, { primary: true, disabled: un.length > 0 }]]);
      pHead('To place - ' + un.length);
      [...new Set(un.map(u => u.card))].forEach(cid => { const n = un.filter(u => u.card === cid).length; const sel = ui.deploySel && (S.units.find(u => u.id === ui.deploySel) || {}).card === cid;
        pCard('d' + cid, CARD[cid], { sel, tag: n + ' to place', act: () => { const u = S.units.find(x => x.card === cid && x.o === seat && !x.k); ui.deploySel = u ? u.id : null; setFocus('board'); vs.panelDirty = true; vs.hudDirty = true; } }); });
    }
    pHead('Players'); S.seats.forEach((_, i) => pSeatRow(i, '', { active: i === seat }));
  } else if (ph === 'battle' || ph === 'over') {
    const t = S.turn;
    if (ph === 'over') {
      pBanner(S.winner >= 0 ? seatName(S, S.winner) + ' is victorious' : 'The battle ends in a draw', S.winner >= 0 ? SEATC[S.winner] : COL.brass);
      if (isHost()) pRow([['rematch', 'Rematch', () => commit(s => startDraft(s)), { primary: true }], ['newMap', 'New map', () => commit(s => { s.phase = 'map'; s.units = []; s.army = {}; s.turn = null; s.winner = null; s.roll = null; })]]);
      if (LOCAL) try { __p.write(SAVE, '{}'); } catch (e) {}
    } else if (classic(S) && t.stage === 'orders') {
      pBanner('Round ' + t.round + ' - Place order markers');
      const need = needOrders(S); const seat = need.filter(i => ctl(i))[0];
      if (seat !== undefined) {
        const cards = cardsAlive(S, seat);
        if (!(ui.ordDraft && ui.ordDraft.seat === seat && ui.ordDraft.round === t.round)) ui.ordDraft = { seat, round: t.round, 1: cards[0], 2: cards[0], 3: cards[0], X: cards[cards.length - 1] };
        pHead(seatName(S, seat) + ': secret orders');
        pText('Choose the card for each of your three turns this round. X is a decoy.' + (LOCAL && S.seats.filter((_, i) => !isBot(i)).length > 1 ? ' Other players: look away.' : ''), { size: 12, color: COL.muted });
        [1, 2, 3, 'X'].forEach(m => pSelect('ord' + m, m === 'X' ? 'Decoy X' : 'Order ' + m, cards.map(c => [c, CARD[c].n]), ui.ordDraft[m], v => ui.ordDraft[m] = v));
        pButton('lock', 'Lock in orders', () => { lockMyOrders(); setFocus('board'); }, { primary: true });
      }
      pHead('Orders'); aliveSeats(S).forEach(i => pSeatRow(i, t.orders[i] ? 'placed' : 'placing...'));
    } else {
      const me = ctl(t.seat);
      pBanner(classic(S) ? 'Round ' + t.round + ' - Order ' + t.marker + ' - ' + (me ? (LOCAL ? seatName(S, t.seat) + "'s turn" : 'Your turn') : seatName(S, t.seat) + ' is acting') + ' - ' + CARD[t.card].n
        : 'Round ' + t.round + ' - ' + (me ? 'Your turn' : seatName(S, t.seat) + ' is acting'), SEATC[t.seat]);
      if (me) {
        const cards = classic(S) ? [t.card] : [...new Set(S.units.filter(u => u.o === t.seat && u.hp > 0 && u.k).map(u => u.card))];
        pText(t.attacking ? 'Attacking: pick a figure, then a red-ringed target.' : 'Move figures (yellow hexes), then attack. Attacking ends movement.', { size: 12, color: COL.muted });
        cards.forEach(cid => { const us = S.units.filter(u => u.card === cid && u.o === t.seat && u.hp > 0); pCard('a' + cid, CARD[cid], { sel: t.card === cid, tag: us.map(u => (CARD[cid].hp > 1 ? 'HP ' + u.hp : 'fig') + (t.moved[u.id] ? ' moved' : '') + ((t.atk[u.id] || 0) ? ' attacked' : '')).join(', '), act: () => { const u = S.units.find(x => x.card === cid && x.o === t.seat && x.hp > 0 && x.k); if (u) { vs.cur = P(u.k); clickHex(u.k, false); setFocus('board'); keepCursorVisible(); } } }); });
        pButton('end', t.card ? 'End turn (X)' : 'Pass turn', endMyTurn, { primary: true });
      }
      if (classic(S)) {
        const mine = Object.keys(t.orders || {}).map(Number).filter(i => ctl(i) && !isBot(i));
        mine.forEach(i => { pHead((LOCAL ? seatName(S, i) + "'s" : 'Your') + ' markers'); pText([1, 2, 3, 'X'].map(m => m + ': ' + CARD[t.orders[i][m]].n + (m !== 'X' && t.order.slice(0, t.idx + 1).some(e => e.i === i && e.m === m) ? ' (used)' : '')).join('   '), { size: 12 }); });
      }
    }
    pDice();
    pHead('Armies');
    S.seats.forEach((_, i) => pSeatRow(i, S.units.filter(u => u.o === i && u.hp > 0).length + '/' + S.units.filter(u => u.o === i).length + ' figures', { active: ph === 'battle' && t.seat === i }));
  }
  if (LOCAL && S.bots && Object.keys(S.bots).length && ph !== 'over') {
    pHead('Bots');
    pRow([['bs', 'Speed: ' + ui.botSpeed, () => { ui.botSpeed = { slow: 'normal', normal: 'fast', fast: 'slow' }[ui.botSpeed]; __p.setCfg('botSpeed', ui.botSpeed); vs.panelDirty = true; }], ['bp', ui.botPaused ? 'Resume' : 'Pause', () => { ui.botPaused = !ui.botPaused; vs.panelDirty = true; if (!ui.botPaused) botTick(); }]]);
    pButton('diff', vs.showDiff ? 'Hide bot difficulty' : 'Change bot difficulty', () => { vs.showDiff = !vs.showDiff; });
    if (vs.showDiff) Object.keys(S.bots).forEach(i => pSelect('lv' + i, seatName(S, +i), LEVELS.map(l => [l, LV_NAME[l]]), S.bots[i], v => {
      commit(s => { s.bots[i] = v; if (s.seats[i]) s.seats[i].name = s.seats[i].name.replace(/\([^)]*\)$/, '(' + LV_NAME[v] + ')'); log(s, seatName(s, +i) + ' is now ' + LV_NAME[v] + '.'); }); normDraftNow();
    }));
  }
  if (ph !== 'draft') pLog(ph === 'over' ? 12 : 6);
  pGap(6);
  pRow([['rules', 'Rules', () => goScreen('rules')], ['leave', 'Leave game', leaveGame]]);
}
function endMyTurn() {
  if (!(S && S.phase === 'battle' && S.turn.stage !== 'orders' && ctl(S.turn.seat))) return;
  ui.sel = null; ui.detail = null; commit(s => { log(s, seatName(s, s.turn.seat) + (s.turn.card ? ' ends the turn of ' + CARD[s.turn.card].n : ' passes') + '.'); endTurn(s); });
}
function leaveGame() { leave(); goScreen('menu'); vs.view = { z: 0.94, x: 0, y: 0 }; }


function buildPanel() {
  vs.banner = null;
  for (let pass = 0; pass < 3; pass++) {
    __c.layer(3); __c.clear(3); __c.setTransform(1, 0, 0, 1, 0, 0);
    const x = V.PX;
    if (!V.dock) { const g = cx.createLinearGradient(x - 14, 0, x, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); cx.fillStyle = g; cx.fillRect(x - 14, 0, 14, V.CH); }
    cx.fillStyle = vgrad(0, V.CH, 'rgba(26,46,50,.97)', 'rgba(14,22,26,.98)'); cx.fillRect(x, 0, V.PW, V.CH);
    cx.fillStyle = vgrad(0, V.CH * 0.4, 'rgba(40,72,74,.35)', 'rgba(40,72,74,0)'); cx.fillRect(x, 0, V.PW, V.CH * 0.4);
    cx.fillStyle = 'rgba(200,208,220,.55)'; cx.fillRect(x, 0, 1, V.CH); cx.fillStyle = 'rgba(10,13,16,1)'; cx.fillRect(x + 1, 0, 1, V.CH);
    vs.items = [];
    if (vs.screen === 'roster') screenRoster(); else if (vs.screen === 'rules') screenRules();
    else if (S) screenGame(); else screenMenu();
    vs.contentH = PY + 10;
    const maxScroll = Math.max(0, vs.contentH - V.CH);
    let fi = vs.items.findIndex(i => i.key === vs.focusKey);
    if (fi < 0) { fi = vs.items.findIndex(i => i.pref && !i.disabled); if (fi < 0) fi = vs.items.findIndex(i => !i.disabled); vs.focusKey = fi >= 0 ? vs.items[fi].key : null; if (fi >= 0 && pass === 0 && vs.focus === 'panel') continue; }
    let ns = Math.min(Math.max(vs.scroll, 0), maxScroll);
    const f = vs.items[fi];
    if (f && vs.focus === 'panel' && !vs.dragScroll && !vs.pointer) { if (f.y - ns < 8) ns = Math.max(0, f.y - 40); else if (f.y + f.h - ns > V.CH - 8) ns = Math.min(maxScroll, f.y + f.h - V.CH + 40); }
    if (Math.abs(ns - vs.scroll) > 0.5) { vs.scroll = ns; vs.banner = null; continue; }
    break;
  }
  if (vs.contentH > V.CH) { const h = Math.max(24, V.CH * V.CH / vs.contentH), y = vs.scroll / (vs.contentH - V.CH) * (V.CH - h); box(V.PX + V.PW - 6, y + 2, 4, h - 4, 'rgba(201,210,238,.45)', null, 2); }
  vs.panelDirty = false; vs.hudDirty = true;
}

/* ---------------- pop-ups (card detail, the START menu) ---------------- */
function menuItems() {
  const o = [['Resume', () => {}]];
  if (S) o.push(['Leave game', leaveGame]);
  o.push(['How to play', () => goScreen('rules')]);
  o.push(['Settings', () => openSettings()]);
  o.push(['Exit to Launcher', () => { vs.quit = true; }]);
  return o;
}
function menuGeom() { const n = menuItems().length, w = 300, h = 58 + n * 34, x = (V.SW - w) / 2, y = (V.CH - h) / 2; return { x, y, w, h, rows: menuItems().map((m, i) => ({ x: x + 14, y: y + 44 + i * 34, w: w - 28, h: 26 })) }; }
function buildPopup() {
  __c.layer(4); __c.clear(4); __c.setTransform(1, 0, 0, 1, 0, 0); vs.popupDirty = false;
  if (vs.menuOpen) {
    cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(0, 0, V.SW, V.CH);
    const g = menuGeom(); sysPanel(g.x, g.y, g.w, g.h);
    txt('Menu', g.x + 14, g.y + 23, 14, COL.title); cx.fillStyle = COL.rule; cx.fillRect(g.x + 14, g.y + 32, g.w - 28, 1);
    menuItems().forEach((o, i) => { const r = g.rows[i]; frost(r.x, r.y, r.w, r.h); if (i === vs.menuIdx) goldRing(r.x, r.y, r.w, r.h); txt(o[0], r.x + 12, r.y + 18, 13, COL.text); });
    return;
  }
  let cid = null;
  if (vs.detail) cid = vs.detail;
  else if (vs.focus === 'panel' && !vs.pointerOnBoard) { const f = vs.items.find(i => i.key === vs.focusKey); if (f && f.card && (vs.screen === 'roster' || (S && S.phase === 'draft'))) cid = f.card; }
  if (!cid) return;
  const c = CARD[cid]; const right = V.dock ? V.BW : V.SW - V.PW; const x = 16, w = Math.min(right - 32, 520); let y = 44;
  const abl = c.ab.map(a => ABIL[a].n + ': ' + ABIL[a].d);
  const lines = abl.flatMap(a => wrap(a, w - 30, 12));
  const h = Math.min(V.CH - y - 12, 96 + lines.length * 17);
  sysPanel(x, y, w, h);
  portrait(x + 32, y + 32, 18, c);
  txt(fitText(c.n, w - 150, 17), x + 60, y + 29, 17, COL.text); txt(c.t + ' - ' + c.k + (c.f > 1 ? ' of ' + c.f : ''), x + 60, y + 47, 12, COL.soft);
  txt(c.p + ' pts', x + w - 14, y + 29, 16, COL.gold, 'right');
  cx.fillStyle = COL.rule; cx.fillRect(x + 14, y + 60, w - 28, 1);
  txt(statLine(c), x + 16, y + 79, 13, COL.text);
  lines.forEach((l, i) => { const ly = y + 100 + i * 17; if (ly < y + h - 6) txt(l, x + 16, ly, 12, COL.soft); });
}

/* ---------------- settings (drawn by the GameCube program) ---------------- */
function openSettings() { vs.settings = true; vs.menuOpen = false; __p.settings(); vs.hudDirty = true; }
function applyCfg() {
  const old = CFG; CFG = __p.cfg();
  ui.botSpeed = CFG.botSpeed || ui.botSpeed || 'normal';
  if (!!old.wide !== !!CFG.wide) { layout(); vs.view = { z: 0.94, x: 0, y: 0 }; vs.scroll = 0; vs.drawer = vs.drawerOpen ? 1 : 0; vs.boardDirty = vs.panelDirty = vs.hudDirty = vs.popupDirty = vs.overlayDirty = true; }
  if (old.detail !== CFG.detail) vs.boardDirty = true;
}

/* ---------------- input ---------------- */
function repeat(btn, held, now) {
  const r = vs.rep; if (!held) { delete r[btn]; return false; }
  if (!r[btn]) { r[btn] = now + 320; return true; }
  if (now >= r[btn]) { r[btn] = now + 85; return true; }
  return false;
}
function panelMove(d) {
  const it = vs.items.filter(i => !i.disabled || i.sel); if (!it.length) return;
  let fi = it.findIndex(i => i.key === vs.focusKey);
  if (fi < 0) fi = 0; else {
    const cur = it[fi];
    if (cur.row) { let j = fi; while (j >= 0 && j < it.length && it[j].row === cur.row) j += d; fi = Math.max(0, Math.min(it.length - 1, j)); }
    else fi = Math.max(0, Math.min(it.length - 1, fi + d));
  }
  vs.focusKey = it[fi].key; vs.panelDirty = true; vs.popupDirty = true;
}
function panelSide(d) {
  const it = vs.items.find(i => i.key === vs.focusKey); if (!it) return;
  if (it.sel) { (d < 0 ? it.left : it.right)(); return; }
  if (it.row) { const row = vs.items.filter(i => i.row === it.row && !i.disabled); const k = row.findIndex(i => i.key === it.key); const n = row[k + d]; if (n) { vs.focusKey = n.key; vs.panelDirty = true; } }
}
function activate(it) { if (it && it.act) { it.act(); vs.panelDirty = true; vs.hudDirty = true; vs.popupDirty = true; } }
/* where the D-pad and A go; on 4:3 the panel's drawer follows it */
function setFocus(f) {
  const drawer = f === 'panel';
  if (vs.focus === f && (V.dock || vs.drawerOpen === drawer)) return;
  vs.focus = f; if (!V.dock) vs.drawerOpen = drawer;
  vs.panelDirty = true; vs.overlayDirty = true; vs.hudDirty = true; vs.popupDirty = true;
}
function panelOpenScreen() { return !S || vs.screen !== 'game'; }   /* screens that are all panel */
function overPanel(x, y) { return y < V.CH && x >= panelX() && (V.dock || vs.drawer > 0.5); }
function overTab(x, y) { const t = vs.tab; return t && x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h; }
function itemAt(x, y) {
  const off = panelX() - V.PX, yy = y + vs.scroll;
  return vs.items.find(i => yy >= i.y && yy <= i.y + i.h && x >= i.x + off && x <= i.x + off + i.w) || null;
}
function setPointerMode(on) { if (vs.pointer === on) return; vs.pointer = on; __p.pointerShow(on); vs.hudDirty = true; }
function zoomStep(px, py) {
  const zs = [0.94, 1.5, 2.2, 3]; const i = zs.findIndex(z => z > vs.view.z + 0.01); const z0 = vs.view.z, z1 = i < 0 ? 0.94 : zs[i];
  if (z1 === 0.94) { vs.view = { z: z1, x: 0, y: 0 }; return; }
  const bx = (px - V.BW / 2 * (1 - z0) - vs.view.x) / z0, by = (py - V.BH / 2 * (1 - z0) - vs.view.y) / z0;
  vs.view.z = z1; vs.view.x = px - bx * z1 - V.BW / 2 * (1 - z1); vs.view.y = py - by * z1 - V.BH / 2 * (1 - z1);
}
/* the pointer moving: what's under it is what A will act on */
function pointerHover() {
  const { x, y } = vs.ptr; let hover = false;
  if (vs.menuOpen) { const g = menuGeom(); const k = g.rows.findIndex(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h); if (k >= 0 && k !== vs.menuIdx) { vs.menuIdx = k; vs.popupDirty = true; } hover = k >= 0; }
  else if (vs.detail) hover = false;
  else if (overTab(x, y)) hover = true;
  else if (overPanel(x, y)) {
    vs.pointerOnBoard = false;
    if (vs.focus !== 'panel') { vs.focus = 'panel'; vs.overlayDirty = vs.hudDirty = vs.popupDirty = true; }
    const it = itemAt(x, y); hover = !!(it && !it.disabled);
    if (it && it.key !== vs.focusKey) { vs.focusKey = it.key; vs.panelDirty = true; vs.popupDirty = true; }
  } else if (S && y < V.CH && x < boardRight()) {
    if (!vs.pointerOnBoard) { vs.pointerOnBoard = true; vs.popupDirty = true; }
    if (vs.focus !== 'board') { vs.focus = 'board'; vs.panelDirty = vs.hudDirty = vs.popupDirty = true; }
    const k = hexAt(x, y); hover = !!k;
    if (k) { const c = P(k); if (c[0] !== vs.cur[0] || c[1] !== vs.cur[1]) { vs.cur = c; vs.overlayDirty = true; vs.hudDirty = true; } }
  }
  __p.pointerHover(hover);
}
/* A pressed with the pointer: a tap, or (held and moved) a drag */
function pointerPress(inp, held, pressed, released) {
  const { x, y } = vs.ptr;
  if (pressed) {
    if (vs.menuOpen) { const g = menuGeom(); const k = g.rows.findIndex(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h); if (k >= 0) { vs.menuOpen = false; menuItems()[k][1](); vs.panelDirty = vs.popupDirty = vs.hudDirty = true; } else if (!(x >= g.x && x <= g.x + g.w && y >= g.y && y <= g.y + g.h)) { vs.menuOpen = false; vs.popupDirty = true; } return; }
    if (vs.detail) { vs.detail = null; vs.popupDirty = true; return; }
    if (overTab(x, y)) { setFocus('panel'); return; }
    const area = overPanel(x, y) ? 'panel' : (y < V.CH ? 'board' : null); if (!area) return;
    vs.touch = { sx: x, sy: y, moved: false, area, vx: vs.view.x, vy: vs.view.y, scroll: vs.scroll };
    return;
  }
  const T = vs.touch; if (!T) return;
  if (held) {
    if (Math.hypot(x - T.sx, y - T.sy) > 10) T.moved = true;
    if (T.moved && T.area === 'board') { vs.view.x = T.vx + (x - T.sx); vs.view.y = T.vy + (y - T.sy); }
    else if (T.moved && T.area === 'panel') { vs.dragScroll = true; vs.scroll = Math.max(0, Math.min(Math.max(0, (vs.contentH || 0) - V.CH), T.scroll - (y - T.sy))); vs.panelDirty = true; }
    return;
  }
  if (!released) return;
  vs.touch = null; vs.dragScroll = false;
  if (T.moved) return;
  if (T.area === 'board') {
    if (!V.dock && vs.drawerOpen && !panelOpenScreen()) { setFocus('board'); return; }   /* a tap beside the open drawer closes it */
    if (!S) return;
    vs.focus = 'board';
    const k = hexAt(T.sx, T.sy);
    if (k) { vs.cur = P(k); vs.overlayDirty = true; vs.hudDirty = true; boardAction(false); }
  } else {
    const it = itemAt(T.sx, T.sy);
    if (it) { vs.focus = 'panel'; vs.focusKey = it.key; const off = panelX() - V.PX; if (it.sel) (T.sx < it.x + off + it.w * 0.45 ? it.left : it.right)(); else activate(it); vs.panelDirty = vs.overlayDirty = vs.hudDirty = vs.popupDirty = true; }
  }
}
function handleInput(inp) {
  const now = inp.now, b = inp.buttons, pressed = b & ~vs.prevButtons, released = vs.prevButtons & ~b; vs.prevButtons = b;
  if (vs.ime || vs.settings) { vs.touch = null; return; }
  vs.ptr = inp.ptr;
  if (inp.ptr.moved) setPointerMode(true);
  if (pressed & (BTN.UP | BTN.DOWN | BTN.LEFT | BTN.RIGHT)) setPointerMode(false);
  if (vs.pointer && (inp.ptr.moved || vs.boardDirty === false && vs.hoverAgain)) pointerHover();
  vs.hoverAgain = false;
  if (vs.menuOpen) {
    const items = menuItems();
    if (repeat('U', b & BTN.UP, now)) { vs.menuIdx = (vs.menuIdx + items.length - 1) % items.length; vs.popupDirty = true; }
    if (repeat('D', b & BTN.DOWN, now)) { vs.menuIdx = (vs.menuIdx + 1) % items.length; vs.popupDirty = true; }
    if (vs.pointer && (pressed & BTN.A)) pointerPress(inp, true, true, false);
    else if (pressed & BTN.A) { vs.menuOpen = false; items[vs.menuIdx][1](); vs.panelDirty = vs.popupDirty = vs.hudDirty = true; }
    if (pressed & (BTN.B | BTN.START)) { vs.menuOpen = false; vs.popupDirty = true; }
    vs.hudDirty = true; return;
  }
  if (pressed & BTN.START) { vs.menuOpen = true; vs.menuIdx = 0; vs.popupDirty = vs.hudDirty = true; vs.touch = null; return; }
  if (vs.detail && (pressed & BTN.B)) { vs.detail = null; vs.popupDirty = vs.hudDirty = true; return; }
  if (pressed & BTN.Y) { if (S && !panelOpenScreen()) setFocus(vs.focus === 'board' || (!V.dock && !vs.drawerOpen) ? 'panel' : 'board'); }
  if (pressed & BTN.Z) { if (vs.pointer && vs.ptr.x < boardRight() && vs.ptr.y < V.CH) zoomStep(vs.ptr.x, vs.ptr.y); else { zoomStep(V.BW / 2, V.BH / 2); keepCursorVisible(); } vs.hoverAgain = true; }
  if (S && (pressed & BTN.L)) { cam.tYaw -= 45; animateCam(); vs.hoverAgain = true; }
  if (S && (pressed & BTN.R)) { cam.tYaw += 45; animateCam(); vs.hoverAgain = true; }
  // the C-Stick: scrolls the panel when the pointer is on it, else tilts and turns the battlefield
  const onPanel = vs.pointer ? overPanel(vs.ptr.x, vs.ptr.y) : vs.focus === 'panel';
  if (onPanel && Math.abs(inp.ry) > 18) { const mx = Math.max(0, (vs.contentH || 0) - V.CH); vs.dragScroll = true; vs.scroll = Math.max(0, Math.min(mx, vs.scroll - inp.ry / 80 * 9)); vs.panelDirty = true; }
  else if (S && !onPanel) {
    if (Math.abs(inp.rx) > 40 && repeat('RX', true, now)) { cam.tYaw += inp.rx > 0 ? 15 : -15; animateCam(); vs.hoverAgain = true; } else if (Math.abs(inp.rx) <= 40) repeat('RX', false, now);
    if (Math.abs(inp.ry) > 40 && repeat('RY', true, now)) { cam.tPitch = Math.max(22, Math.min(88, cam.tPitch + (inp.ry > 0 ? -8 : 8))); animateCam(); vs.hoverAgain = true; } else if (Math.abs(inp.ry) <= 40) repeat('RY', false, now);
  }
  if (Math.abs(inp.ry) <= 18) vs.dragScroll = vs.touch ? vs.dragScroll : false;
  // the pointer pushed against the edge of the board pans it
  if (vs.pointer && S && !onPanel && !vs.touch) {
    const { x, y } = vs.ptr, k = 7 / 80; let px = 0, py = 0;
    if (x <= 1 && inp.lx < -20) px = -inp.lx * k; if (x >= boardRight() - 2 && inp.lx > 20 && boardRight() === V.SW) px = -inp.lx * k;
    if (y <= 1 && inp.ly > 20) py = inp.ly * k; if (y >= V.SH - 2 && inp.ly < -20) py = inp.ly * k;
    if (px || py) { vs.view.x += px; vs.view.y += py; vs.hoverAgain = true; }
  }
  const up = repeat('U', b & BTN.UP, now), down = repeat('D', b & BTN.DOWN, now), left = repeat('L', b & BTN.LEFT, now), right = repeat('Rt', b & BTN.RIGHT, now);
  if (vs.pointer) pointerPress(inp, !!(b & BTN.A), !!(pressed & BTN.A), !!(released & BTN.A));
  if (vs.focus === 'panel' && (V.dock || vs.drawerOpen)) {
    if (up) panelMove(-1); if (down) panelMove(1); if (left) panelSide(-1); if (right) panelSide(1);
    if (!vs.pointer && (pressed & BTN.A)) activate(vs.items.find(i => i.key === vs.focusKey));
    if ((pressed & BTN.B) && S && !panelOpenScreen()) setFocus('board');
    else if ((pressed & BTN.B) && vs.screen !== 'menu') goScreen(S ? 'game' : 'menu');
  } else {
    if (up) moveCursor(0, -1); if (down) moveCursor(0, 1); if (left) moveCursor(-1, 0); if (right) moveCursor(1, 0);
    if (!vs.pointer && (pressed & BTN.A)) boardAction(false);
    if ((pressed & BTN.B) && ui.sel) { ui.sel = null; vs.boardDirty = true; }
  }
  if (pressed & BTN.X) {
    if (S && S.phase === 'map') { if (vs.pointer) { const k = hexAt(vs.ptr.x, vs.ptr.y); if (k) vs.cur = P(k); } boardAction(true); }
    else endMyTurn();
  }
}

/* ---------------- main loop ---------------- */
let lastToastShown = false;
globalThis.__frame = function (inp) {
  const fw = vs.frameWaiters; vs.frameWaiters = []; fw.forEach(r => r());
  if (globalThis.__pumpWS) __pumpWS();
  if (globalThis.__srv) __srv.pump();
  __runTimers(); __runRaf();
  if (vs.ime) { const r = __p.imePoll(); if (r) { const cb = vs.ime; vs.ime = null; if (r.ok) try { cb(r.text); } catch (e) { console.log(e && e.stack || e); } vs.panelDirty = vs.hudDirty = true; } }
  if (vs.settings && !__p.settingsOpen()) { vs.settings = false; applyCfg(); vs.hudDirty = true; vs.prevButtons = 0xffff; }
  try { handleInput(inp); } catch (e) { console.log('input error', e && e.stack || e); }
  // phase changes move the focus to where the action is
  const ph = S ? S.phase + (S.turn && S.turn.stage ? S.turn.stage : '') + (S.turn ? S.turn.seat : '') : 'none';
  if (ph !== vs.lastPhase) {
    const wasNone = vs.lastPhase === 'none' || vs.lastPhase === null; vs.lastPhase = ph;
    if (S) { vs.screen = vs.screen === 'menu' ? 'game' : vs.screen; vs.focusKey = null; vs.scroll = 0;
      const boardPhase = (S.phase === 'map' && isHost()) || (S.phase === 'deploy' && ctl(S.deploy.seat)) || (S.phase === 'battle' && S.turn.stage !== 'orders' && ctl(S.turn.seat) && !isBot(S.turn.seat));
      setFocus(boardPhase ? 'board' : 'panel'); if (wasNone) centerCursor();
      if (S.phase === 'battle' && S.turn.stage !== 'orders' && ctl(S.turn.seat) && S.turn.card) { const u = S.units.find(x => x.card === S.turn.card && x.o === S.turn.seat && x.hp > 0 && x.k); if (u) { vs.cur = P(u.k); keepCursorVisible(); } }
    } else { vs.screen = vs.screen === 'game' ? 'menu' : vs.screen; setFocus('panel'); }
    vs.panelDirty = vs.hudDirty = vs.boardDirty = vs.overlayDirty = true;
  }
  if (panelOpenScreen() && !V.dock && !vs.drawerOpen) { vs.drawerOpen = true; vs.hudDirty = true; }
  // the drawer slides
  const target = V.dock ? 1 : (vs.drawerOpen ? 1 : 0);
  if (vs.drawer !== target) { vs.drawer += (target - vs.drawer) * 0.35; if (Math.abs(target - vs.drawer) < 0.01) { vs.drawer = target; vs.hudDirty = true; vs.hoverAgain = true; } }
  if (vs.boardDirty) buildBoard();
  if (vs.overlayDirty) buildOverlay();
  if (vs.panelDirty) buildPanel();
  const toastOn = !!(vs.toast && __p.time() < vs.toastUntil); if (toastOn !== lastToastShown) { lastToastShown = toastOn; vs.hudDirty = true; }
  if (vs.hudDirty) buildHud();
  if (vs.popupDirty) buildPopup();
  applyView();
  if ((vs.saveAt && __p.time() > vs.saveAt) || (vs.quit && vs.saveAt)) { vs.saveAt = 0; if (LOCAL && S) try { __p.write(SAVE, JSON.stringify(S)); } catch (e) {} }
  return !vs.quit;
};

/* ---------------- start ---------------- */
(function boot() {
  myId = lsGet('ss-id'); if (!myId) { myId = 'g' + Math.random().toString(36).slice(2, 10); lsSet('ss-id', myId); }
  ui.name = lsGet('ss-name') || ''; ui.dbChecked = true; ui.net = { port: 47800, ok: false, ips: [] };
  ui.botSpeed = CFG.botSpeed || 'normal';
  const srv = lsGet('ss-gc-server'); if (srv) connectServer(srv);
  __p.pointerShow(false);
  renderAll();
})();
