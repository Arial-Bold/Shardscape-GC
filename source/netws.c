/* netws.c - see netws.h. One thread looks after every socket with select();
 * connecting to a host happens on a short-lived thread of its own, so an
 * address that doesn't answer never holds the others up. Builds for the
 * GameCube (libogc2's sockets) and, for tests, for a PC. */
#include "netws.h"
#include "net/thr.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <stdint.h>
#include <time.h>

#ifdef GEKKO
#include <network.h>
#include <ogc/lwp_watchdog.h>
#define S_SOCKET(a, b, c) net_socket(a, b, c)
#define S_CONNECT net_connect
#define S_BIND net_bind
#define S_LISTEN net_listen
#define S_ACCEPT net_accept
#define S_SEND(fd, p, n) net_send(fd, p, n, 0)
#define S_RECV(fd, p, n) net_recv(fd, p, n, 0)
#define S_CLOSE net_close
#define S_SELECT net_select
#define S_SETSOCKOPT net_setsockopt
static uint64_t now_ms(void) { return ticks_to_millisecs(gettime()); }
#else
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/select.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <unistd.h>
#define S_SOCKET(a, b, c) socket(a, b, c)
#define S_CONNECT connect
#define S_BIND bind
#define S_LISTEN listen
#define S_ACCEPT accept
#define S_SEND(fd, p, n) send(fd, p, n, MSG_NOSIGNAL)
#define S_RECV(fd, p, n) recv(fd, p, n, 0)
#define S_CLOSE close
#define S_SELECT select
#define S_SETSOCKOPT setsockopt
static uint64_t now_ms(void) { struct timespec t; clock_gettime(CLOCK_MONOTONIC, &t); return (uint64_t)t.tv_sec * 1000 + t.tv_nsec / 1000000; }
#endif

#define MAXC 12
#define MAX_MSG (2 * 1024 * 1024)
static const char *GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

typedef struct Out { struct Out *next; size_t len, off; unsigned char data[]; } Out;
enum { K_CLIENT, K_SERVED };
enum { P_CONNECTING, P_HANDSHAKE, P_OPEN, P_DEAD };
typedef struct {
	int used, id, kind, fd, phase;
	char host[128]; int port;
	unsigned char *in; size_t in_n, in_cap;
	unsigned char *frag; size_t frag_n;
	Out *qh, *qt;
	int close_after_send;
	uint64_t last_ping;
} Conn;
static Conn conns[MAXC];
static int next_id = 1;
static thr_mutex mu, evmu;   /* mu: the links; evmu: the events (taken inside mu, never the other way) */
static thr_t thread;
static bool started;
static int listen_fd = -1;
static volatile bool srv_on;

/* --------------------------------------------------------------- events */
typedef struct EvN { struct EvN *next; int kind; int id, type; char *data; size_t len; } EvN;
static EvN *eh, *et;
static void push_ev(int kind, int id, int type, const void *data, size_t len) {
	EvN *n = calloc(1, sizeof *n);
	if (!n) return;
	n->kind = kind; n->id = id; n->type = type;
	if (data) { n->data = malloc(len + 1); if (n->data) { memcpy(n->data, data, len); n->data[len] = 0; n->len = len; } }
	thr_lock(&evmu);
	if (et) et->next = n; else eh = n;
	et = n;
	thr_unlock(&evmu);
}
static int pop_ev(int kind, int *id, int *type, char **data, size_t *len) {
	thr_lock(&evmu);
	EvN *p = NULL, *n = eh;
	while (n && n->kind != kind) { p = n; n = n->next; }
	if (n) { if (p) p->next = n->next; else eh = n->next; if (et == n) et = p; }
	thr_unlock(&evmu);
	if (!n) return 0;
	*id = n->id; *type = n->type; *data = n->data; *len = n->len;
	free(n);
	return 1;
}
int ws_poll(WsEvent *ev) { char *d; size_t l; int id, t; if (!pop_ev(K_CLIENT, &id, &t, &d, &l)) return 0; ev->id = id; ev->type = t; ev->data = d; ev->len = l; return 1; }
int srv_poll(SrvEvent *ev) { char *d; size_t l; int id, t; if (!pop_ev(K_SERVED, &id, &t, &d, &l)) return 0; ev->id = id; ev->type = t; ev->data = d; ev->len = l; return 1; }

/* ----------------------------------------------------------------- bits */
static uint32_t rng = 0x9e3779b9;
static uint32_t rnd32(void) { rng ^= rng << 13; rng ^= rng >> 17; rng ^= rng << 5; return rng; }
static void b64(const unsigned char *in, int n, char *out) {
	static const char *T = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	int o = 0;
	for (int i = 0; i < n; i += 3) {
		uint32_t v = in[i] << 16 | (i + 1 < n ? in[i + 1] << 8 : 0) | (i + 2 < n ? in[i + 2] : 0);
		out[o++] = T[v >> 18 & 63]; out[o++] = T[v >> 12 & 63];
		out[o++] = i + 1 < n ? T[v >> 6 & 63] : '='; out[o++] = i + 2 < n ? T[v & 63] : '=';
	}
	out[o] = 0;
}
/* SHA-1, for the server's handshake */
static void sha1(const unsigned char *msg, size_t len, unsigned char out[20]) {
	uint32_t h[5] = { 0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0 };
	size_t total = ((len + 8) / 64 + 1) * 64;
	unsigned char *m = calloc(1, total);
	if (!m) { memset(out, 0, 20); return; }
	memcpy(m, msg, len); m[len] = 0x80;
	uint64_t bits = (uint64_t)len * 8;
	for (int i = 0; i < 8; i++) m[total - 1 - i] = (unsigned char)(bits >> (8 * i));
	for (size_t off = 0; off < total; off += 64) {
		uint32_t w[80];
		for (int i = 0; i < 16; i++) w[i] = (uint32_t)m[off + 4 * i] << 24 | (uint32_t)m[off + 4 * i + 1] << 16 | (uint32_t)m[off + 4 * i + 2] << 8 | m[off + 4 * i + 3];
		for (int i = 16; i < 80; i++) { uint32_t x = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]; w[i] = x << 1 | x >> 31; }
		uint32_t a = h[0], b = h[1], c = h[2], d = h[3], e = h[4];
		for (int i = 0; i < 80; i++) {
			uint32_t f, k;
			if (i < 20) { f = (b & c) | (~b & d); k = 0x5A827999; }
			else if (i < 40) { f = b ^ c ^ d; k = 0x6ED9EBA1; }
			else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
			else { f = b ^ c ^ d; k = 0xCA62C1D6; }
			uint32_t t = (a << 5 | a >> 27) + f + e + k + w[i];
			e = d; d = c; c = b << 30 | b >> 2; b = a; a = t;
		}
		h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e;
	}
	free(m);
	for (int i = 0; i < 5; i++) { out[4 * i] = h[i] >> 24; out[4 * i + 1] = h[i] >> 16; out[4 * i + 2] = h[i] >> 8; out[4 * i + 3] = h[i]; }
}
static Conn *find(int id) { for (int i = 0; i < MAXC; i++) if (conns[i].used && conns[i].id == id) return &conns[i]; return NULL; }
static Conn *alloc_conn(int kind) {
	for (int i = 0; i < MAXC; i++) if (!conns[i].used) {
		Conn *c = &conns[i];
		memset(c, 0, sizeof(*c));
		c->used = 1; c->id = next_id++; c->kind = kind; c->fd = -1;
		return c;
	}
	return NULL;
}
static Out *make_frame(int opcode, const unsigned char *p, size_t n, int masked) {
	size_t hl = 2 + (n >= 126 ? (n > 65535 ? 8 : 2) : 0) + (masked ? 4 : 0);
	Out *o = malloc(sizeof(Out) + hl + n);
	if (!o) return NULL;
	o->next = NULL; o->len = hl + n; o->off = 0;
	unsigned char *h = o->data; size_t k = 0;
	unsigned char mbit = masked ? 0x80 : 0;
	h[k++] = 0x80 | (opcode & 15);
	if (n < 126) h[k++] = mbit | (unsigned char)n;
	else if (n <= 65535) { h[k++] = mbit | 126; h[k++] = n >> 8; h[k++] = n & 255; }
	else { h[k++] = mbit | 127; for (int i = 7; i >= 0; i--) h[k++] = (unsigned char)((uint64_t)n >> (8 * i)); }
	if (masked) {
		uint32_t m = rnd32(); unsigned char mk[4] = { m >> 24, m >> 16, m >> 8, m };
		memcpy(h + k, mk, 4); k += 4;
		for (size_t i = 0; i < n; i++) h[k + i] = p[i] ^ mk[i & 3];
	} else memcpy(h + k, p, n);
	return o;
}
static Out *make_raw(const char *s) {
	size_t n = strlen(s);
	Out *o = malloc(sizeof(Out) + n);
	if (!o) return NULL;
	o->next = NULL; o->len = n; o->off = 0; memcpy(o->data, s, n);
	return o;
}
static void enqueue(Conn *c, Out *o) { if (!o) return; if (c->qt) c->qt->next = o; else c->qh = o; c->qt = o; }
static void free_conn(Conn *c) {
	if (c->fd >= 0) S_CLOSE(c->fd);
	free(c->in); free(c->frag);
	while (c->qh) { Out *n = c->qh->next; free(c->qh); c->qh = n; }
	int kind = c->kind, id = c->id, was = c->phase;
	memset(c, 0, sizeof(*c));
	if (kind == K_CLIENT) push_ev(K_CLIENT, id, WS_EV_CLOSE, NULL, 0);
	else if (was == P_OPEN) push_ev(K_SERVED, id, SRV_EV_CLOSE, NULL, 0);
}

static int resolve(const char *host, struct in_addr *out) {
#ifdef GEKKO
	if (inet_aton(host, out)) return 1;
	struct hostent *h = net_gethostbyname(host);
	if (!h || !h->h_addr_list || !h->h_addr_list[0]) return 0;
	memcpy(out, h->h_addr_list[0], sizeof(*out));
	return 1;
#else
	if (inet_aton(host, out)) return 1;
	struct hostent *h = gethostbyname(host);
	if (!h || !h->h_addr_list[0]) return 0;
	memcpy(out, h->h_addr_list[0], sizeof(*out));
	return 1;
#endif
}

/* ------------------------------------------------------------ connecting */
typedef struct { int id; char host[128]; int port; } ConnectJob;
static void *connect_main(void *arg) {
	ConnectJob *j = arg;
	struct in_addr a;
	int fd = -1;
	if (resolve(j->host, &a)) {
		fd = S_SOCKET(AF_INET, SOCK_STREAM, IPPROTO_IP);
		if (fd >= 0) {
			struct sockaddr_in sa;
			memset(&sa, 0, sizeof(sa));
			sa.sin_family = AF_INET; sa.sin_port = htons((unsigned short)j->port); sa.sin_addr = a;
			if (S_CONNECT(fd, (struct sockaddr *)&sa, sizeof(sa)) < 0) { S_CLOSE(fd); fd = -1; }
		}
	}
	thr_lock(&mu);
	Conn *c = find(j->id);
	if (c && fd >= 0) {
		int one = 1;
		S_SETSOCKOPT(fd, IPPROTO_TCP, TCP_NODELAY, &one, sizeof(one));
		c->fd = fd; c->phase = P_HANDSHAKE;
		unsigned char key[16]; for (int i = 0; i < 16; i++) key[i] = (unsigned char)rnd32();
		char k64[32]; b64(key, 16, k64);
		char req[400];
		snprintf(req, sizeof(req), "GET / HTTP/1.1\r\nHost: %s:%d\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n", j->host, j->port, k64);
		/* the handshake goes first, ahead of anything the game queued meanwhile */
		Out *o = make_raw(req);
		if (o) { o->next = c->qh; c->qh = o; if (!c->qt) c->qt = o; }
	} else if (c) {
		push_ev(K_CLIENT, j->id, WS_EV_ERROR, "could not connect", 17);
		free_conn(c);
		if (fd >= 0) S_CLOSE(fd);
	} else if (fd >= 0) S_CLOSE(fd);
	thr_unlock(&mu);
	free(j);
	return NULL;
}

/* ------------------------------------------------------------- receiving */
static void deliver(Conn *c, const unsigned char *p, size_t n) {
	if (c->kind == K_CLIENT) push_ev(K_CLIENT, c->id, WS_EV_MESSAGE, p, n);
	else push_ev(K_SERVED, c->id, SRV_EV_MESSAGE, p, n);
}
/* takes whole frames off the front of c->in; 0 if the link should close */
static int parse_frames(Conn *c) {
	for (;;) {
		unsigned char *b = c->in; size_t n = c->in_n;
		if (n < 2) return 1;
		int fin = b[0] & 0x80, op = b[0] & 0x0f, masked = b[1] & 0x80;
		uint64_t len = b[1] & 0x7f; size_t off = 2;
		if (len == 126) { if (n < 4) return 1; len = (uint64_t)b[2] << 8 | b[3]; off = 4; }
		else if (len == 127) { if (n < 10) return 1; len = 0; for (int i = 0; i < 8; i++) len = len << 8 | b[2 + i]; off = 10; }
		if (len > MAX_MSG) return 0;
		size_t moff = off;
		if (masked) off += 4;
		if (n < off + len) return 1;
		unsigned char *data = b + off;
		if (masked) for (size_t i = 0; i < len; i++) data[i] ^= b[moff + (i & 3)];
		if (op == 0x8) { enqueue(c, make_frame(0x8, NULL, 0, c->kind == K_CLIENT)); c->close_after_send = 1; }
		else if (op == 0x9) enqueue(c, make_frame(0xA, data, (size_t)len, c->kind == K_CLIENT));
		else if (op == 0x1 || op == 0x0) {
			if (op == 0x1 && fin) deliver(c, data, (size_t)len);
			else {
				if (op == 0x1) c->frag_n = 0;
				unsigned char *f = realloc(c->frag, c->frag_n + (size_t)len + 1);
				if (!f) return 0;
				c->frag = f; memcpy(f + c->frag_n, data, (size_t)len); c->frag_n += (size_t)len;
				if (fin) { deliver(c, c->frag, c->frag_n); c->frag_n = 0; }
			}
		}
		size_t used = off + (size_t)len;
		memmove(c->in, c->in + used, n - used);
		c->in_n = n - used;
	}
}
static char *find_header(char *req, const char *name) {
	size_t nl = strlen(name);
	for (char *p = req; *p; p++)
		if ((p == req || p[-1] == '\n') && !strncasecmp(p, name, nl) && p[nl] == ':') {
			p += nl + 1;
			while (*p == ' ') p++;
			return p;
		}
	return NULL;
}
/* a served link's first bytes: the browser-style upgrade request */
static int served_handshake(Conn *c) {
	unsigned char *e = NULL;
	for (size_t i = 3; i < c->in_n; i++) if (!memcmp(c->in + i - 3, "\r\n\r\n", 4)) { e = c->in + i + 1; break; }
	if (!e) return c->in_n < 8192;
	size_t hl = (size_t)(e - c->in);
	char req[8193];
	memcpy(req, c->in, hl); req[hl] = 0;
	char *k = find_header(req, "Sec-WebSocket-Key");
	if (!k) {
		enqueue(c, make_raw("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nShardscape game server is running (on a GameCube).\n"));
		c->close_after_send = 1;
		c->in_n = 0;
		return 1;
	}
	char key[100]; size_t kl = 0;
	while (k[kl] && k[kl] != '\r' && k[kl] != '\n' && kl < 60) kl++;
	snprintf(key, sizeof(key), "%.*s%s", (int)kl, k, GUID);
	unsigned char dig[20]; sha1((unsigned char *)key, strlen(key), dig);
	char acc[40]; b64(dig, 20, acc);
	char resp[300];
	snprintf(resp, sizeof(resp), "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: %s\r\n\r\n", acc);
	enqueue(c, make_raw(resp));
	memmove(c->in, e, c->in_n - hl);
	c->in_n -= hl;
	c->phase = P_OPEN;
	c->last_ping = now_ms();
	push_ev(K_SERVED, c->id, SRV_EV_OPEN, NULL, 0);
	return parse_frames(c);
}
/* a client link's first bytes: the host's answer to the upgrade */
static int client_handshake(Conn *c) {
	unsigned char *e = NULL;
	for (size_t i = 3; i < c->in_n; i++) if (!memcmp(c->in + i - 3, "\r\n\r\n", 4)) { e = c->in + i + 1; break; }
	if (!e) return c->in_n < 8192;
	if (c->in_n < 12 || memcmp(c->in + 9, "101", 3)) { push_ev(K_CLIENT, c->id, WS_EV_ERROR, "the host refused", 16); return 0; }
	size_t hl = (size_t)(e - c->in);
	memmove(c->in, e, c->in_n - hl);
	c->in_n -= hl;
	c->phase = P_OPEN;
	push_ev(K_CLIENT, c->id, WS_EV_OPEN, NULL, 0);
	return parse_frames(c);
}

/* ----------------------------------------------------------- the thread */
static void *net_main(void *arg) {
	(void)arg;
	unsigned char *buf = malloc(16384);
	for (;;) {
		fd_set rs, wsx;
		FD_ZERO(&rs); FD_ZERO(&wsx);
		int maxfd = -1;
		thr_lock(&mu);
		if (listen_fd >= 0) { FD_SET(listen_fd, &rs); if (listen_fd > maxfd) maxfd = listen_fd; }
		uint64_t now = now_ms();
		for (int i = 0; i < MAXC; i++) {
			Conn *c = &conns[i];
			if (!c->used || c->fd < 0) continue;
			if (c->kind == K_SERVED && c->phase == P_OPEN && now - c->last_ping > 25000) { c->last_ping = now; enqueue(c, make_frame(0x9, NULL, 0, 0)); }
			FD_SET(c->fd, &rs);
			if (c->qh) FD_SET(c->fd, &wsx);
			if (c->fd > maxfd) maxfd = c->fd;
		}
		thr_unlock(&mu);
		struct timeval tv = { 0, 15000 };
		int r = maxfd >= 0 ? S_SELECT(maxfd + 1, &rs, &wsx, NULL, &tv) : 0;
		if (maxfd < 0) { thr_sleep_ms(15); continue; }
		if (r <= 0) continue;
		thr_lock(&mu);
		if (listen_fd >= 0 && FD_ISSET(listen_fd, &rs)) {
			struct sockaddr_in sa; socklen_t sl = sizeof(sa);
			int fd = S_ACCEPT(listen_fd, (struct sockaddr *)&sa, &sl);
			if (fd >= 0) {
				Conn *c = alloc_conn(K_SERVED);
				if (c) { int one = 1; S_SETSOCKOPT(fd, IPPROTO_TCP, TCP_NODELAY, &one, sizeof(one)); c->fd = fd; c->phase = P_HANDSHAKE; }
				else S_CLOSE(fd);
			}
		}
		for (int i = 0; i < MAXC; i++) {
			Conn *c = &conns[i];
			if (!c->used || c->fd < 0) continue;
			int ok = 1;
			if (FD_ISSET(c->fd, &rs)) {
				int n = S_RECV(c->fd, buf, 16384);
				if (n <= 0) ok = 0;
				else {
					if (c->in_n + n > c->in_cap) {
						size_t cap = c->in_cap ? c->in_cap * 2 : 32768;
						while (cap < c->in_n + n) cap *= 2;
						unsigned char *p = cap <= MAX_MSG + 65536 ? realloc(c->in, cap) : NULL;
						if (!p) ok = 0; else { c->in = p; c->in_cap = cap; }
					}
					if (ok) {
						memcpy(c->in + c->in_n, buf, n); c->in_n += n;
						if (c->phase == P_HANDSHAKE) ok = c->kind == K_SERVED ? served_handshake(c) : client_handshake(c);
						else if (c->phase == P_OPEN) ok = parse_frames(c);
					}
				}
			}
			if (ok && c->qh && FD_ISSET(c->fd, &wsx)) {
				Out *o = c->qh;
				int n = S_SEND(c->fd, o->data + o->off, o->len - o->off);
				if (n <= 0) ok = 0;
				else {
					o->off += n;
					if (o->off >= o->len) { c->qh = o->next; if (!c->qh) c->qt = NULL; free(o); }
				}
			}
			if (ok && c->close_after_send && !c->qh) ok = 0;
			if (!ok) free_conn(c);
		}
		thr_unlock(&mu);
	}
	free(buf);
	return NULL;
}

static void start(void) {
	if (started) return;
	started = true;
	rng ^= (uint32_t)now_ms() * 2654435761u;
	thr_mutex_init(&mu);
	thr_mutex_init(&evmu);
	thr_create(&thread, net_main, NULL, 64 * 1024, 60);
}

/* --------------------------------------------------------------- client */
void ws_global_init(void) { start(); }
int ws_open(const char *host, int port) {
	start();
	thr_lock(&mu);
	Conn *c = alloc_conn(K_CLIENT);
	int id = 0;
	if (c) {
		snprintf(c->host, sizeof(c->host), "%s", host); c->port = port; c->phase = P_CONNECTING; id = c->id;
		ConnectJob *j = calloc(1, sizeof *j);
		thr_t t;
		if (j) {
			j->id = id; snprintf(j->host, sizeof(j->host), "%s", host); j->port = port;
			if (!thr_create(&t, connect_main, j, 32 * 1024, 62)) { free(j); free_conn(c); id = 0; }
			else thr_detach(t);
		} else { free_conn(c); id = 0; }
	}
	thr_unlock(&mu);
	return id;
}
int ws_send(int id, const char *text, size_t len) {
	thr_lock(&mu);
	Conn *c = find(id);
	int r = -1;
	if (c && c->kind == K_CLIENT && !c->close_after_send) { enqueue(c, make_frame(0x1, (const unsigned char *)text, len, 1)); r = 0; }
	thr_unlock(&mu);
	return r;
}
void ws_close(int id) {
	thr_lock(&mu);
	Conn *c = find(id);
	if (c) { if (c->fd >= 0 && c->phase == P_OPEN) { enqueue(c, make_frame(0x8, NULL, 0, c->kind == K_CLIENT)); c->close_after_send = 1; } else free_conn(c); }
	thr_unlock(&mu);
}
int ws_state(int id) {
	thr_lock(&mu);
	Conn *c = find(id);
	int s = !c ? 3 : c->close_after_send ? 2 : c->phase == P_OPEN ? 1 : 0;
	thr_unlock(&mu);
	return s;
}

/* --------------------------------------------------------------- server */
bool srv_start(int port) {
	start();
	if (srv_on) return true;
	int fd = S_SOCKET(AF_INET, SOCK_STREAM, IPPROTO_IP);
	if (fd < 0) return false;
	int one = 1;
	S_SETSOCKOPT(fd, SOL_SOCKET, SO_REUSEADDR, &one, sizeof(one));
	struct sockaddr_in sa;
	memset(&sa, 0, sizeof(sa));
	sa.sin_family = AF_INET; sa.sin_port = htons((unsigned short)port); sa.sin_addr.s_addr = htonl(INADDR_ANY);
	if (S_BIND(fd, (struct sockaddr *)&sa, sizeof(sa)) < 0 || S_LISTEN(fd, 8) < 0) { S_CLOSE(fd); return false; }
	thr_lock(&mu);
	listen_fd = fd;
	srv_on = true;
	thr_unlock(&mu);
	return true;
}
bool srv_running(void) { return srv_on; }
int srv_send(int id, const char *text, size_t len) {
	thr_lock(&mu);
	Conn *c = find(id);
	int r = -1;
	if (c && c->kind == K_SERVED && c->phase == P_OPEN && !c->close_after_send) { enqueue(c, make_frame(0x1, (const unsigned char *)text, len, 0)); r = 0; }
	thr_unlock(&mu);
	return r;
}
void srv_close(int id) {
	thr_lock(&mu);
	Conn *c = find(id);
	if (c && c->kind == K_SERVED) { enqueue(c, make_frame(0x8, NULL, 0, 0)); c->close_after_send = 1; }
	thr_unlock(&mu);
}
