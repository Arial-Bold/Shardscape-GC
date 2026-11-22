/* Shardscape for GameCube: hosting games on this console. A port of the
 * desktop app's game server (server.js): a relay that keeps each game's
 * latest state and pushes changes to everyone watching it. The GameCube
 * program looks after the sockets (port 47800, the same as the desktop
 * app, so PCs, Macs, Vitas and other GameCubes can all join); this player's
 * own copy of the game talks to the relay directly, through a loopback. */
'use strict';
(function () {
  if (!globalThis.__p || !__p.srvStart) return;
  const KEY_RE = /^games\/[A-Z0-9]{1,8}$/, PORT = 47800;
  const FILE = __p.dataDir() + 'hosted_games.json';
  const games = new Map(), leases = new Map(), clients = new Set(), byId = new Map();
  let running = false, saveAt = 0;

  function load() {
    try { const t = __p.read(FILE); if (t) for (const [k, v] of Object.entries(JSON.parse(t))) if (KEY_RE.test(k)) games.set(k, v); } catch (e) { /* none yet */ }
  }
  function persist() { saveAt = __p.time() + 800; }
  function flush() {
    if (!saveAt || __p.time() < saveAt) return; saveAt = 0;
    // keep the 60 most recently touched games
    const keep = [...games.entries()].sort((a, b) => (b[1].updated || 0) - (a[1].updated || 0)).slice(0, 60);
    games.clear(); keep.forEach(([k, v]) => games.set(k, v));
    try { __p.write(FILE, JSON.stringify(Object.fromEntries(keep))); } catch (e) {}
  }
  function summary() {
    return [...games.values()].sort((a, b) => (b.updated || 0) - (a.updated || 0)).slice(0, 12)
      .map(g => ({ code: g.code, phase: g.phase, n: g.n, seats: g.seats, updated: g.updated }));
  }
  const send = (c, obj) => c.send(JSON.stringify(obj));
  function broadcastGame(key) { const data = games.get(key) || null; for (const c of clients) if (c.subs.has(key)) send(c, { t: 'snap', key, data }); }
  function broadcastList() { const data = summary(); for (const c of clients) if (c.list) send(c, { t: 'list', data }); }
  function handle(c, m) {
    if (!m || typeof m !== 'object') return;
    const key = m.key;
    switch (m.t) {
      case 'sub': if (KEY_RE.test(key)) { c.subs.add(key); send(c, { t: 'snap', key, data: games.get(key) || null }); } break;
      case 'unsub': c.subs.delete(key); break;
      case 'list': c.list = true; send(c, { t: 'list', data: summary() }); break;
      case 'get': send(c, { t: 'res', id: m.id, data: games.get(key) || null }); break;
      case 'set': {
        if (!KEY_RE.test(key) || !m.data || typeof m.data !== 'object') { send(c, { t: 'res', id: m.id, err: 'invalid_argument' }); break; }
        const old = games.get(key);
        if (old && (m.data.rev || 0) < (old.rev || 0)) { send(c, { t: 'res', id: m.id, stale: true }); send(c, { t: 'snap', key, data: old }); break; }
        games.set(key, m.data);
        send(c, { t: 'res', id: m.id });
        broadcastGame(key); broadcastList(); persist();
        break;
      }
      case 'acquire': {
        const now = Date.now(), l = leases.get(key);
        if (l && l.until > now && l.holder !== m.holder) { send(c, { t: 'res', id: m.id, acquired: false }); break; }
        leases.set(key, { holder: m.holder, until: now + Math.min(600000, Math.max(1000, m.ttl || 30000)) });
        send(c, { t: 'res', id: m.id, acquired: true });
        break;
      }
    }
  }
  /* this console's own player: a WebSocket that never leaves the GameCube */
  class LoopSocket {
    constructor() {
      this.readyState = 1;
      const self = this;
      this.c = { subs: new Set(), list: false, send: t => setTimeout(() => { if (self.readyState === 1 && self.onmessage) self.onmessage({ data: t }); }, 0) };
      clients.add(this.c);
    }
    send(s) { if (this.readyState !== 1) return; let m; try { m = JSON.parse(s); } catch (e) { return; } handle(this.c, m); }
    close() { if (this.readyState === 3) return; this.readyState = 3; clients.delete(this.c); setTimeout(() => { this.onclose && this.onclose({}); }, 0); }
  }
  globalThis.__srv = {
    start() { if (running) return true; if (!__p.srvStart(PORT)) return false; load(); running = true; return true; },
    running: () => running,
    players: () => byId.size,
    loopback: () => new LoopSocket(),
    pump() {
      if (!running) return;
      for (const e of __p.srvPoll()) {
        if (e.type === 1) { const c = { id: e.id, subs: new Set(), list: false, send: t => __p.srvSend(e.id, t) }; byId.set(e.id, c); clients.add(c); }
        else if (e.type === 2) { const c = byId.get(e.id); if (!c) continue; let m; try { m = JSON.parse(e.data); } catch (err) { continue; } try { handle(c, m); } catch (err) { console.log('relay error', err && err.stack || err); } }
        else if (e.type === 3) { const c = byId.get(e.id); if (c) { clients.delete(c); byId.delete(e.id); } }
      }
      flush();
    },
  };
})();
