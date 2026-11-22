// Minimal browser environment for running the shared Shardscape engine outside a browser.
var globalThis_=globalThis;
globalThis.window=globalThis;
var __timers=[],__timerSeq=1,__now=()=> (globalThis.__clock?globalThis.__clock():Date.now());
globalThis.setTimeout=function(fn,ms){const id=__timerSeq++;__timers.push({id,t:__now()+(ms||0),fn});return id};
globalThis.clearTimeout=function(id){const i=__timers.findIndex(x=>x.id===id);if(i>=0)__timers.splice(i,1)};
globalThis.setInterval=function(fn,ms){const id=__timerSeq++;const tick=()=>{fn();const e=__timers.find(x=>x.id===id);};const rec={id,t:__now()+ms,fn:null,every:ms,cb:fn};rec.fn=()=>{rec.cb();rec.t=__now()+ms;__timers.push(rec)};__timers.push(rec);return id};
globalThis.clearInterval=globalThis.clearTimeout;
globalThis.__runTimers=function(){const now=__now();let ran=0;for(let guard=0;guard<500;guard++){let k=-1,best=Infinity;for(let i=0;i<__timers.length;i++)if(__timers[i].t<=now&&__timers[i].t<best){best=__timers[i].t;k=i}if(k<0)break;const t=__timers.splice(k,1)[0];try{t.fn()}catch(e){console.log('timer error',e&&e.stack||e)}ran++}return ran};
globalThis.__nextTimer=function(){let b=Infinity;for(const t of __timers)b=Math.min(b,t.t);return b};
var __raf=[];globalThis.requestAnimationFrame=function(fn){__raf.push(fn);return __raf.length};globalThis.cancelAnimationFrame=function(){};
globalThis.__runRaf=function(){const q=__raf;__raf=[];q.forEach(f=>{try{f(__now())}catch(e){console.log('raf error',e)}});return q.length};
globalThis.performance={now:()=>__now()};
globalThis.structuredClone=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
globalThis.matchMedia=()=>({matches:false});
globalThis.localStorage={_d:{},getItem(k){return k in this._d?this._d[k]:null},setItem(k,v){this._d[k]=String(v)},removeItem(k){delete this._d[k]}};
globalThis.navigator={clipboard:{writeText:()=>Promise.reject(new Error('no clipboard'))}};
globalThis.devicePixelRatio=1;
globalThis.ResizeObserver=function(cb){this.observe=()=>{};this.disconnect=()=>{}};
function __el(id){const e={id,style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},hidden:false,value:'',innerHTML:'',innerText:'',textContent:'',
  addEventListener(){},removeEventListener(){},setPointerCapture(){},querySelector(){return null},querySelectorAll(){return []},closest(){return null},
  getBoundingClientRect(){return globalThis.__boardRect||{left:0,top:0,width:620,height:544}},animate(){return {}},focus(){},blur(){},select(){},click(){},
  getContext(){return globalThis.__ctx}};return e}
var __els={};
globalThis.document={getElementById(id){return __els[id]||(__els[id]=__el(id))},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},createElement(){return __el('x')},body:__el('body')};
globalThis.Event=function(t){this.type=t};

/* ---------- Vita / native host bridges ---------- */
if (globalThis.__p) {
  globalThis.__clock = () => __p.time();
  // settings survive restarts: saved next to the game data
  const LSF = __p.dataDir() + 'settings.json';
  try { const t = __p.read(LSF); if (t) localStorage._d = JSON.parse(t) || {}; } catch (e) {}
  const _set = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (k, v) { _set(k, v); try { __p.write(LSF, JSON.stringify(this._d)); } catch (e) {} };
  globalThis.console = { log: (...a) => __p.log(a.map(x => typeof x === 'string' ? x : (x && x.stack) || JSON.stringify(x)).join(' ')), error: (...a) => console.log('ERROR', ...a), warn: (...a) => console.log('WARN', ...a) };
}
// text the Vita system font can't draw is mapped to plain equivalents
const __TXT = { '·': '-', '→': '>', '←': '<', '✓': 'ok', '♥': 'HP ', '’': "'", '‘': "'", '“': '"', '”': '"', '…': '...', '—': '-', '–': '-', '−': '-', '⚔': 'X', '✚': '+', '●': 'o', '☠': 'X', '⛨': 'O', '▶': '>', '❚': '|', '⤒': '^', '⤓': 'v', '⟲': '<', '⟳': '>', '⌂': 'H' };
globalThis.__plain = s => { let o = ''; for (const ch of String(s)) { const m = __TXT[ch]; if (m !== undefined) o += m; else if (ch.codePointAt(0) <= 255) o += ch; } return o; };
if (globalThis.__c) {
  const C = __c;
  let fs = '#000', ss = '#000', lw = 1, ga = 1, font = '10px sans-serif', ta = 'start', tb = 'alphabetic', lc = 'butt', lj = 'miter', fsize = 10;
  const stack = [];
  const grad = id => ({ __g: id, addColorStop(t, c) { C.stop(id, t, String(c)); } });
  const ctx = {
    get fillStyle() { return fs }, set fillStyle(v) { fs = v; if (v && v.__g) C.fillGrad(v.__g); else C.fillColor(String(v)); },
    get strokeStyle() { return ss }, set strokeStyle(v) { ss = v; if (v && v.__g) C.strokeGrad(v.__g); else C.strokeColor(String(v)); },
    get lineWidth() { return lw }, set lineWidth(v) { lw = v; C.lineWidth(v); },
    get globalAlpha() { return ga }, set globalAlpha(v) { ga = v; C.alpha(v); },
    get font() { return font }, set font(v) { font = v; const m = /(\d+(?:\.\d+)?)px/.exec(v); if (m) { fsize = +m[1]; C.font(fsize); } },
    get textAlign() { return ta }, set textAlign(v) { ta = v; C.align(v === 'center' ? 1 : (v === 'right' || v === 'end') ? 2 : 0); },
    get textBaseline() { return tb }, set textBaseline(v) { tb = v; C.baseline(v === 'middle' ? 1 : (v === 'top' || v === 'hanging') ? 2 : (v === 'bottom' || v === 'ideographic') ? 3 : 0); },
    get lineCap() { return lc }, set lineCap(v) { lc = v; C.cap(v === 'round' ? 1 : 0); },
    get lineJoin() { return lj }, set lineJoin(v) { lj = v; C.join(v === 'round' ? 1 : 0); },
    shadowColor: 'transparent', shadowBlur: 0, imageSmoothingEnabled: true,
    save() { C.save(); stack.push([fs, ss, lw, ga, font, ta, tb, lc, lj, fsize]); },
    restore() { C.restore(); const s = stack.pop(); if (s) [fs, ss, lw, ga, font, ta, tb, lc, lj, fsize] = s; },
    setTransform: (a, b, c, d, e, f) => C.setTransform(a, b, c, d, e, f), translate: (x, y) => C.translate(x, y), scale: (x, y) => C.scale(x, y === undefined ? x : y),
    beginPath: () => C.beginPath(), moveTo: (x, y) => C.moveTo(x, y), lineTo: (x, y) => C.lineTo(x, y), closePath: () => C.closePath(),
    arc: (x, y, r, a0, a1, ccw) => C.arc(x, y, r, a0, a1, !!ccw), ellipse: (x, y, rx, ry, rot, a0, a1, ccw) => C.ellipse(x, y, rx, ry, rot, a0, a1, !!ccw),
    quadraticCurveTo: (a, b, c, d) => C.quadraticCurveTo(a, b, c, d),
    rect(x, y, w, h) { C.moveTo(x, y); C.lineTo(x + w, y); C.lineTo(x + w, y + h); C.lineTo(x, y + h); C.closePath(); },
    fill: () => C.fill(), stroke: () => C.stroke(), clip: () => C.clip(),
    fillRect: (x, y, w, h) => C.fillRect(x, y, w, h), clearRect: (x, y, w, h) => C.clearRect(x, y, w, h),
    strokeRect(x, y, w, h) { C.beginPath(); this.rect(x, y, w, h); C.stroke(); },
    fillText(s, x, y) { const t = __plain(s); if (t) C.fillText(t, x, y); }, strokeText() {},
    measureText: s => ({ width: C.textWidth(__plain(s), fsize) }),
    createLinearGradient: (a, b, c, d) => grad(C.lin(a, b, c, d)), createRadialGradient: (a, b, c, d, e, f) => grad(C.rad(a, b, c, d, e, f)),
    setLineDash() {}, getLineDash: () => [],
  };
  globalThis.__ctx = ctx;
}
if (globalThis.__p && __p.wsOpen) {
  const socks = {};
  class NativeWebSocket {
    constructor(url) {
      const m = /^wss?:\/\/\[?([^\]\/:]+)\]?(?::(\d+))?/.exec(String(url));
      this.readyState = 0; this.url = url;
      this.id = m ? __p.wsOpen(m[1], +(m[2] || 80)) : 0;
      if (this.id) socks[this.id] = this;
      else setTimeout(() => { this.readyState = 3; this.onerror && this.onerror({}); this.onclose && this.onclose({}); }, 0);
    }
    send(s) { if (this.readyState !== 1) throw new Error('WebSocket is not open'); __p.wsSend(this.id, String(s)); }
    close() { if (this.readyState < 2) { this.readyState = 2; __p.wsClose(this.id); } }
  }
  NativeWebSocket.CONNECTING = 0; NativeWebSocket.OPEN = 1; NativeWebSocket.CLOSING = 2; NativeWebSocket.CLOSED = 3;
  globalThis.WebSocket = NativeWebSocket;
  globalThis.__pumpWS = function () {
    const evs = __p.wsPoll();
    for (const e of evs) {
      const s = socks[e.id]; if (!s) continue;
      try {
        if (e.type === 1) { s.readyState = 1; s.onopen && s.onopen({}); }
        else if (e.type === 2) s.onmessage && s.onmessage({ data: e.data });
        else if (e.type === 4) { s.lastError = e.data; s.onerror && s.onerror({ message: e.data }); }
        else if (e.type === 3) { s.readyState = 3; delete socks[e.id]; s.onclose && s.onclose({}); }
      } catch (err) { console.log('socket handler error', err && err.stack || err); }
    }
  };
}
