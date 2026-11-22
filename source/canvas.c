#include "canvas.h"
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdio.h>

#define PI2 6.28318530717958647692f
CLayer cv_layers[CV_LAYERS];

static float default_tw(const char *s, float size) { return (float)strlen(s) * size * 0.55f; }
float (*cv_text_width)(const char *s, float size) = default_tw;

/* ---------------- paint ---------------- */
typedef struct { int type; uint32_t c; float x0, y0, r0, x1, y1, r1; int n; float st[8]; uint32_t sc[8]; } Paint;
#define NG 1024
static Paint grads[NG];
static int gnext = 1;

typedef struct {
  float m[6];
  Paint fill, stroke;
  float lw, alpha, fs;
  int align, base, cap, join;
  int nclip; float clip[24][2];
} State;
static State st;
static State stack[48];
static int sp = 0;

/* ---------------- path ---------------- */
typedef struct { float (*p)[2]; int n, cap, closed; } Sub;
#define MAXSUB 96
static Sub subs[MAXSUB];
static int nsub = 0;
static int have_point = 0;
static float lastx, lasty, startx, starty;
static int cur = 0;

static void ensure_v(CLayer *L, int add) {
  L->ver++;
  if (L->nv + add > L->capv) { int c = L->capv ? L->capv : 4096; while (c < L->nv + add) c *= 2; L->v = realloc(L->v, sizeof(CVert) * c); L->capv = c; }
}
static void ensure_t(CLayer *L) {
  L->ver++;
  if (L->nt + 1 > L->capt) { int c = L->capt ? L->capt * 2 : 64; L->t = realloc(L->t, sizeof(CText) * c); L->capt = c; }
}

void cv_init(void) {
  memset(cv_layers, 0, sizeof cv_layers);
  for (int i = 0; i < CV_LAYERS; i++) { cv_layers[i].sx = 1; cv_layers[i].visible = 1; }
  memset(&st, 0, sizeof st);
  st.m[0] = st.m[3] = 1; st.lw = 1; st.alpha = 1; st.fs = 10;
  st.fill.type = 0; st.fill.c = 0xff000000; st.stroke = st.fill;
}
void cv_select_layer(int id) { if (id >= 0 && id < CV_LAYERS) cur = id; }
void cv_clear_layer(int id) {
  if (id < 0 || id >= CV_LAYERS) return;
  CLayer *L = &cv_layers[id];
  for (int i = 0; i < L->nt; i++) free(L->t[i].s);
  L->nv = 0; L->nt = 0; L->ver++;
}
void cv_set_view(int id, float sx, float tx, float ty, int cx, int cy, int cw, int ch, int visible) {
  if (id < 0 || id >= CV_LAYERS) return;
  CLayer *L = &cv_layers[id];
  L->sx = sx; L->tx = tx; L->ty = ty; L->clip[0] = cx; L->clip[1] = cy; L->clip[2] = cw; L->clip[3] = ch; L->visible = visible;
}
int cv_vertex_count(int id) { return (id >= 0 && id < CV_LAYERS) ? cv_layers[id].nv : 0; }

/* ---------------- state ---------------- */
void cv_save(void) { if (sp < 48) stack[sp++] = st; }
void cv_restore(void) { if (sp > 0) st = stack[--sp]; }
void cv_set_transform(float a, float b, float c, float d, float e, float f) { st.m[0]=a; st.m[1]=b; st.m[2]=c; st.m[3]=d; st.m[4]=e; st.m[5]=f; }
void cv_translate(float x, float y) { st.m[4] += st.m[0]*x + st.m[2]*y; st.m[5] += st.m[1]*x + st.m[3]*y; }
void cv_scale(float x, float y) { st.m[0]*=x; st.m[1]*=x; st.m[2]*=y; st.m[3]*=y; }
static inline void xf(float x, float y, float *ox, float *oy) { *ox = st.m[0]*x + st.m[2]*y + st.m[4]; *oy = st.m[1]*x + st.m[3]*y + st.m[5]; }
static inline float xscale(void) { float d = st.m[0]*st.m[3] - st.m[1]*st.m[2]; return sqrtf(fabsf(d)); }

void cv_line_width(float w) { if (w > 0 && isfinite(w)) st.lw = w; }
void cv_alpha(float a) { if (isfinite(a)) st.alpha = a < 0 ? 0 : a > 1 ? 1 : a; }
void cv_font_size(float s) { if (s > 0) st.fs = s; }
void cv_text_align(int a) { st.align = a; }
void cv_text_baseline(int b) { st.base = b; }
void cv_line_cap(int r) { st.cap = r; }
void cv_line_join(int r) { st.join = r; }
void cv_fill_color(uint32_t c) { st.fill.type = 0; st.fill.c = c; }
void cv_stroke_color(uint32_t c) { st.stroke.type = 0; st.stroke.c = c; }
void cv_fill_grad(int id) { if (id > 0 && id < NG) st.fill = grads[id]; }
void cv_stroke_grad(int id) { if (id > 0 && id < NG) st.stroke = grads[id]; }

int cv_grad_linear(float x0, float y0, float x1, float y1) {
  int id = gnext++; if (gnext >= NG) gnext = 1;
  Paint *p = &grads[id]; memset(p, 0, sizeof *p); p->type = 1;
  xf(x0, y0, &p->x0, &p->y0); xf(x1, y1, &p->x1, &p->y1);
  return id;
}
int cv_grad_radial(float x0, float y0, float r0, float x1, float y1, float r1) {
  int id = gnext++; if (gnext >= NG) gnext = 1;
  Paint *p = &grads[id]; memset(p, 0, sizeof *p); p->type = 2;
  float s = xscale();
  xf(x0, y0, &p->x0, &p->y0); xf(x1, y1, &p->x1, &p->y1); p->r0 = r0 * s; p->r1 = r1 * s;
  return id;
}
void cv_grad_stop(int id, float t, uint32_t c) {
  if (id <= 0 || id >= NG) return; Paint *p = &grads[id];
  if (p->n >= 8) return;
  int i = p->n++; p->st[i] = t < 0 ? 0 : t > 1 ? 1 : t; p->sc[i] = c;
  for (int k = i; k > 0 && p->st[k] < p->st[k-1]; k--) { float tt = p->st[k]; p->st[k] = p->st[k-1]; p->st[k-1] = tt; uint32_t cc = p->sc[k]; p->sc[k] = p->sc[k-1]; p->sc[k-1] = cc; }
}

static uint32_t lerpc(uint32_t a, uint32_t b, float t) {
  uint32_t o = 0;
  for (int sh = 0; sh < 32; sh += 8) { float x = ((a >> sh) & 255) * (1 - t) + ((b >> sh) & 255) * t; o |= ((uint32_t)(x + 0.5f) & 255) << sh; }
  return o;
}
static uint32_t paint_at(const Paint *p, float x, float y) {
  uint32_t c;
  if (p->type == 0 || p->n == 0) c = p->type == 0 ? p->c : 0;
  else {
    float t;
    if (p->type == 1) { float dx = p->x1 - p->x0, dy = p->y1 - p->y0, l2 = dx*dx + dy*dy; t = l2 > 0 ? ((x - p->x0)*dx + (y - p->y0)*dy) / l2 : 0; }
    else { float d = sqrtf((x - p->x0)*(x - p->x0) + (y - p->y0)*(y - p->y0)); float span = p->r1 - p->r0; t = span != 0 ? (d - p->r0) / span : 0; }
    if (t <= p->st[0]) c = p->sc[0];
    else if (t >= p->st[p->n - 1]) c = p->sc[p->n - 1];
    else { int i = 1; while (i < p->n && p->st[i] < t) i++; float a = p->st[i-1], b = p->st[i]; c = lerpc(p->sc[i-1], p->sc[i], b > a ? (t - a) / (b - a) : 0); }
  }
  if (st.alpha < 1) { uint32_t a = (uint32_t)((c >> 24) * st.alpha + 0.5f); c = (c & 0x00ffffff) | (a << 24); }
  return c;
}

/* ---------------- colour parsing ---------------- */
static int hexv(int ch) { return isdigit(ch) ? ch - '0' : (tolower(ch) >= 'a' && tolower(ch) <= 'f') ? tolower(ch) - 'a' + 10 : -1; }
static uint32_t rgba(int r, int g, int b, int a) {
  r = r < 0 ? 0 : r > 255 ? 255 : r; g = g < 0 ? 0 : g > 255 ? 255 : g; b = b < 0 ? 0 : b > 255 ? 255 : b; a = a < 0 ? 0 : a > 255 ? 255 : a;
  return (uint32_t)r | ((uint32_t)g << 8) | ((uint32_t)b << 16) | ((uint32_t)a << 24);
}
int cv_parse_color(const char *s, uint32_t *out) {
  while (*s == ' ') s++;
  if (*s == '#') {
    s++; int n = 0, v[8]; while (n < 8 && hexv(s[n]) >= 0) { v[n] = hexv(s[n]); n++; }
    if (n == 3 || n == 4) { *out = rgba(v[0]*17, v[1]*17, v[2]*17, n == 4 ? v[3]*17 : 255); return 1; }
    if (n == 6 || n == 8) { *out = rgba(v[0]*16+v[1], v[2]*16+v[3], v[4]*16+v[5], n == 8 ? v[6]*16+v[7] : 255); return 1; }
    return 0;
  }
  if (!strncmp(s, "rgb", 3)) {
    const char *p = strchr(s, '('); if (!p) return 0; p++;
    float c[4] = {0, 0, 0, 1}; int k = 0;
    while (k < 4 && *p) { char *e; float v = strtof(p, &e); if (e == p) break; c[k++] = v; p = e; while (*p == ',' || *p == ' ' || *p == '/') p++; }
    if (k < 3) return 0;
    *out = rgba((int)(c[0] + .5f), (int)(c[1] + .5f), (int)(c[2] + .5f), (int)(c[3] * 255 + .5f)); return 1;
  }
  static const struct { const char *n; uint32_t c; } names[] = {
    {"white", 0xffffffff}, {"black", 0xff000000}, {"transparent", 0}, {"red", 0xff0000ff}, {"green", 0xff008000}, {"blue", 0xffff0000}, {"gray", 0xff808080}, {"grey", 0xff808080}, {"yellow", 0xff00ffff}, {"orange", 0xff00a5ff}};
  for (unsigned i = 0; i < sizeof names / sizeof names[0]; i++) if (!strcmp(s, names[i].n)) { *out = names[i].c; return 1; }
  return 0;
}

/* ---------------- geometry output ---------------- */
static void push_v(float x, float y, uint32_t c) {
  CLayer *L = &cv_layers[cur]; ensure_v(L, 1);
  L->v[L->nv].x = x; L->v[L->nv].y = y; L->v[L->nv].c = c; L->nv++;
}
static int clip_poly(const float (*in)[2], int n, float (*out)[2], const float (*cp)[2], int nc) {
  /* Sutherland-Hodgman against a convex polygon (any winding) */
  float a1 = 0; for (int i = 0; i < nc; i++) { int j = (i + 1) % nc; a1 += cp[i][0]*cp[j][1] - cp[j][0]*cp[i][1]; }
  float sgn = a1 >= 0 ? 1 : -1;
  float buf1[64][2], buf2[64][2]; int m = n < 64 ? n : 64;
  memcpy(buf1, in, sizeof(float) * 2 * m);
  float (*src)[2] = buf1, (*dst)[2] = buf2;
  for (int e = 0; e < nc && m > 0; e++) {
    const float *A = cp[e], *B = cp[(e + 1) % nc];
    int k = 0;
    for (int i = 0; i < m; i++) {
      const float *P = src[i], *Q = src[(i + 1) % m];
      float dp = sgn * ((B[0]-A[0])*(P[1]-A[1]) - (B[1]-A[1])*(P[0]-A[0]));
      float dq = sgn * ((B[0]-A[0])*(Q[1]-A[1]) - (B[1]-A[1])*(Q[0]-A[0]));
      if (dp >= 0 && k < 63) { dst[k][0] = P[0]; dst[k][1] = P[1]; k++; }
      if ((dp >= 0) != (dq >= 0) && k < 63) { float t = dp / (dp - dq); dst[k][0] = P[0] + (Q[0]-P[0])*t; dst[k][1] = P[1] + (Q[1]-P[1])*t; k++; }
    }
    float (*tmp)[2] = src; src = dst; dst = tmp; m = k;
  }
  memcpy(out, src, sizeof(float) * 2 * m);
  return m;
}
static void emit_tri(float ax, float ay, float bx, float by, float cx, float cy, const Paint *p) {
  if (st.nclip >= 3) {
    float tri[3][2] = {{ax, ay}, {bx, by}, {cx, cy}}, out[64][2];
    int n = clip_poly((const float (*)[2])tri, 3, out, (const float (*)[2])st.clip, st.nclip);
    for (int i = 1; i + 1 < n; i++) {
      push_v(out[0][0], out[0][1], paint_at(p, out[0][0], out[0][1]));
      push_v(out[i][0], out[i][1], paint_at(p, out[i][0], out[i][1]));
      push_v(out[i+1][0], out[i+1][1], paint_at(p, out[i+1][0], out[i+1][1]));
    }
    return;
  }
  push_v(ax, ay, paint_at(p, ax, ay)); push_v(bx, by, paint_at(p, bx, by)); push_v(cx, cy, paint_at(p, cx, cy));
}
static float cross3(const float *a, const float *b, const float *c) { return (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0]); }
static int in_tri(const float *p, const float *a, const float *b, const float *c, float s) {
  return s*cross3(a, b, p) >= 0 && s*cross3(b, c, p) >= 0 && s*cross3(c, a, p) >= 0;
}
static void fill_poly(float (*pts)[2], int n, const Paint *p) {
  /* drop duplicate neighbours */
  int m = 0;
  for (int i = 0; i < n; i++) { if (m && fabsf(pts[i][0]-pts[m-1][0]) < 1e-3f && fabsf(pts[i][1]-pts[m-1][1]) < 1e-3f) continue; pts[m][0] = pts[i][0]; pts[m][1] = pts[i][1]; m++; }
  while (m > 1 && fabsf(pts[0][0]-pts[m-1][0]) < 1e-3f && fabsf(pts[0][1]-pts[m-1][1]) < 1e-3f) m--;
  n = m; if (n < 3) return;
  float area = 0; for (int i = 0; i < n; i++) { int j = (i + 1) % n; area += pts[i][0]*pts[j][1] - pts[j][0]*pts[i][1]; }
  if (fabsf(area) < 1e-4f) return;
  float s = area > 0 ? 1 : -1;
  int convex = 1;
  for (int i = 0; i < n && convex; i++) if (s * cross3(pts[i], pts[(i+1)%n], pts[(i+2)%n]) < -1e-4f) convex = 0;
  if (convex) {
    if (p->type != 0 && n > 4) { /* fan from the centroid so gradients read properly */
      float cx = 0, cy = 0; for (int i = 0; i < n; i++) { cx += pts[i][0]; cy += pts[i][1]; } cx /= n; cy /= n;
      for (int i = 0; i < n; i++) { int j = (i + 1) % n; emit_tri(cx, cy, pts[i][0], pts[i][1], pts[j][0], pts[j][1], p); }
    } else for (int i = 1; i + 1 < n; i++) emit_tri(pts[0][0], pts[0][1], pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1], p);
    return;
  }
  /* ear clipping */
  int *idx = malloc(sizeof(int) * n); for (int i = 0; i < n; i++) idx[i] = i;
  int cnt = n, guard = 0, i = 0;
  while (cnt > 3 && guard < n * n) {
    guard++;
    int a = idx[(i + cnt - 1) % cnt], b = idx[i % cnt], c = idx[(i + 1) % cnt];
    int ear = s * cross3(pts[a], pts[b], pts[c]) > 0;
    if (ear) for (int k = 0; k < cnt; k++) { int q = idx[k]; if (q == a || q == b || q == c) continue; if (in_tri(pts[q], pts[a], pts[b], pts[c], s)) { ear = 0; break; } }
    if (ear) { emit_tri(pts[a][0], pts[a][1], pts[b][0], pts[b][1], pts[c][0], pts[c][1], p); memmove(idx + (i % cnt), idx + (i % cnt) + 1, sizeof(int) * (cnt - (i % cnt) - 1)); cnt--; if (i >= cnt) i = 0; }
    else i = (i + 1) % cnt;
  }
  if (cnt >= 3) for (int k = 1; k + 1 < cnt; k++) emit_tri(pts[idx[0]][0], pts[idx[0]][1], pts[idx[k]][0], pts[idx[k]][1], pts[idx[k+1]][0], pts[idx[k+1]][1], p);
  free(idx);
}

/* ---------------- path building ---------------- */
static Sub *cur_sub(void) { return nsub ? &subs[nsub - 1] : NULL; }
static void sub_push(float x, float y) {
  Sub *s = cur_sub(); if (!s) return;
  if (s->n >= s->cap) { s->cap = s->cap ? s->cap * 2 : 16; s->p = realloc(s->p, sizeof(float) * 2 * s->cap); }
  s->p[s->n][0] = x; s->p[s->n][1] = y; s->n++;
}
static void new_sub(float x, float y) {
  if (nsub >= MAXSUB) return;
  Sub *s = &subs[nsub++]; s->n = 0; s->closed = 0;
  sub_push(x, y); startx = x; starty = y; lastx = x; lasty = y; have_point = 1;
}
void cv_begin_path(void) { nsub = 0; have_point = 0; }
void cv_move_to(float x, float y) { float X, Y; xf(x, y, &X, &Y); new_sub(X, Y); }
void cv_line_to(float x, float y) {
  float X, Y; xf(x, y, &X, &Y);
  if (!have_point || !nsub) { new_sub(X, Y); return; }
  sub_push(X, Y); lastx = X; lasty = Y;
}
void cv_close_path(void) { Sub *s = cur_sub(); if (s) { s->closed = 1; lastx = startx; lasty = starty; } }
static void add_point_screen(float X, float Y) { if (!have_point || !nsub) new_sub(X, Y); else { sub_push(X, Y); lastx = X; lasty = Y; } }
void cv_ellipse(float x, float y, float rx, float ry, float rot, float a0, float a1, int ccw) {
  if (rx < 0 || ry < 0) return;
  float da = a1 - a0;
  if (!ccw) { if (da >= PI2) da = PI2; else { da = fmodf(da, PI2); if (da < 0) da += PI2; } }
  else { if (-da >= PI2) da = -PI2; else { da = fmodf(da, PI2); if (da > 0) da -= PI2; } }
  float rs = (rx > ry ? rx : ry) * xscale();
  int segs = (int)ceilf(fabsf(da) * rs / 3.0f); if (segs < 4) segs = 4; if (segs > 64) segs = 64;
  if (fabsf(da) < 1e-6f) segs = 0;
  float cr = cosf(rot), sr = sinf(rot);
  for (int i = 0; i <= segs; i++) {
    float t = a0 + da * i / (segs ? segs : 1);
    float ex = rx * cosf(t), ey = ry * sinf(t);
    float X, Y; xf(x + ex*cr - ey*sr, y + ex*sr + ey*cr, &X, &Y);
    add_point_screen(X, Y);
    if (!segs) break;
  }
}
void cv_arc(float x, float y, float r, float a0, float a1, int ccw) { cv_ellipse(x, y, r, r, 0, a0, a1, ccw); }
void cv_quad_to(float cx, float cy, float x, float y) {
  if (!have_point) { cv_move_to(cx, cy); }
  /* control points in user space: invert current point back is costly; work in screen space */
  float CX, CY, X, Y; xf(cx, cy, &CX, &CY); xf(x, y, &X, &Y);
  float sx = lastx, sy = lasty;
  float len = fabsf(CX - sx) + fabsf(CY - sy) + fabsf(X - CX) + fabsf(Y - CY);
  int n = (int)(len / 6); if (n < 4) n = 4; if (n > 24) n = 24;
  for (int i = 1; i <= n; i++) { float t = (float)i / n, u = 1 - t; add_point_screen(u*u*sx + 2*u*t*CX + t*t*X, u*u*sy + 2*u*t*CY + t*t*Y); }
}

void cv_fill(void) {
  for (int i = 0; i < nsub; i++) if (subs[i].n >= 3) {
    int n = subs[i].n; float (*tmp)[2] = malloc(sizeof(float) * 2 * n); memcpy(tmp, subs[i].p, sizeof(float) * 2 * n);
    fill_poly(tmp, n, &st.fill); free(tmp);
  }
}
static void dot(float x, float y, float r, const Paint *p) {
  int segs = (int)(r * 1.2f); if (segs < 6) segs = 6; if (segs > 20) segs = 20;
  float px = x + r, py = y;
  for (int i = 1; i <= segs; i++) { float a = PI2 * i / segs, qx = x + r * cosf(a), qy = y + r * sinf(a); emit_tri(x, y, px, py, qx, qy, p); px = qx; py = qy; }
}
void cv_stroke(void) {
  float w = st.lw * xscale(); if (w < 1) w = 1; float h = w / 2;
  for (int i = 0; i < nsub; i++) {
    Sub *s = &subs[i]; int n = s->n; if (n < 2) { if (n == 1 && st.cap) dot(s->p[0][0], s->p[0][1], h, &st.stroke); continue; }
    int segs = s->closed ? n : n - 1;
    for (int k = 0; k < segs; k++) {
      float *a = s->p[k], *b = s->p[(k + 1) % n];
      float dx = b[0] - a[0], dy = b[1] - a[1], l = sqrtf(dx*dx + dy*dy); if (l < 1e-4f) continue;
      float nx = -dy / l * h, ny = dx / l * h;
      emit_tri(a[0]+nx, a[1]+ny, b[0]+nx, b[1]+ny, b[0]-nx, b[1]-ny, &st.stroke);
      emit_tri(a[0]+nx, a[1]+ny, b[0]-nx, b[1]-ny, a[0]-nx, a[1]-ny, &st.stroke);
      if (st.join && w > 2.5f && (s->closed || k + 1 < segs)) dot(b[0], b[1], h, &st.stroke);
    }
    if (st.cap && !s->closed && w > 1.5f) { dot(s->p[0][0], s->p[0][1], h, &st.stroke); dot(s->p[n-1][0], s->p[n-1][1], h, &st.stroke); }
  }
}
void cv_clip(void) {
  if (!nsub || subs[0].n < 3) return;
  Sub *s = &subs[0]; int n = s->n > 24 ? 24 : s->n;
  if (st.nclip >= 3) {
    float out[64][2]; int m = clip_poly((const float (*)[2])s->p, n, out, (const float (*)[2])st.clip, st.nclip);
    if (m > 24) m = 24; memcpy(st.clip, out, sizeof(float) * 2 * m); st.nclip = m;
  } else { memcpy(st.clip, s->p, sizeof(float) * 2 * n); st.nclip = n; }
}
void cv_fill_rect(float x, float y, float w, float h) {
  float p[4][2]; xf(x, y, &p[0][0], &p[0][1]); xf(x + w, y, &p[1][0], &p[1][1]); xf(x + w, y + h, &p[2][0], &p[2][1]); xf(x, y + h, &p[3][0], &p[3][1]);
  emit_tri(p[0][0], p[0][1], p[1][0], p[1][1], p[2][0], p[2][1], &st.fill);
  emit_tri(p[0][0], p[0][1], p[2][0], p[2][1], p[3][0], p[3][1], &st.fill);
}
void cv_clear_rect(float x, float y, float w, float h) { (void)x; (void)y; (void)w; (void)h; cv_clear_layer(cur); }
void cv_fill_text(const char *s, float x, float y) {
  if (!s || !*s) return;
  CLayer *L = &cv_layers[cur]; ensure_t(L);
  CText *t = &L->t[L->nt++];
  xf(x, y, &t->x, &t->y); t->size = st.fs * xscale(); t->c = paint_at(&st.fill, t->x, t->y);
  t->align = st.align; t->baseline = st.base; t->s = strdup(s);
}
