/* testhost.c - runs Shardscape's GameCube interface on a PC: the same
 * scripts, canvas and fonts as the GameCube program, drawn by a software
 * rasteriser into a picture the size of the TV layout (640x480 for 4:3,
 * 854x480 for 16:9), so screens can be checked without a console.
 *   testhost <js dir> <test.js> [max frames]     SS_WIDE=1 for 16:9 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <sys/stat.h>
#include <time.h>
#include <unistd.h>
#include "canvas.h"
#include "jsapi.h"
#include "ws.h"
#include "platform.h"
#include "ui_assets.h"

#define SH 480
static int SW = 640;
static uint32_t *fb;
static long frame_no = 0;
static int want_exit = 0, wide = 0;
static char appdir[512] = "./";
static char hints[8][64]; static int nhints;
static int ptr_shown, ptr_hover; static float ptr_x = 320, ptr_y = 240;
static int settings_open_frames;

static int realtime;
double plat_time_ms(void) {
  if (realtime) { struct timespec t; clock_gettime(CLOCK_MONOTONIC, &t); return t.tv_sec * 1000.0 + t.tv_nsec / 1e6; }
  return frame_no * (1000.0 / 60.0);
}
char *plat_read_file(const char *path, size_t *len) {
  FILE *f = fopen(path, "rb"); if (!f) return NULL;
  fseek(f, 0, SEEK_END); long n = ftell(f); fseek(f, 0, SEEK_SET);
  char *b = malloc((size_t)n + 1); size_t got = fread(b, 1, (size_t)n, f); fclose(f); b[got] = 0; if (len) *len = got; return b;
}
int plat_write_file(const char *path, const char *data, size_t len) { FILE *f = fopen(path, "wb"); if (!f) return 0; fwrite(data, 1, len, f); fclose(f); return 1; }
void plat_log(const char *s) { fprintf(stderr, "%s\n", s); }

/* ---- the GameCube font (as the GameCube program draws it) ---- */
static const UiFont *font_for(float size) { return size <= 16 ? &font_small : &font_large; }
float plat_text_width(const char *s, float size) {
  const UiFont *f = font_for(size); float k = size / f->px, w = 0;
  for (const unsigned char *p = (const unsigned char *)s; *p; p++) w += f->glyphs[*p].adv16 / 16.0f * k;
  return w;
}
static int atlas_px(const UiFont *f, int x, int y) {   /* I8 texture: 8x4 tiles */
  int tilesx = f->w / 8; int t = (y / 4) * tilesx + (x / 8);
  return f->tex[t * 32 + (y % 4) * 8 + (x % 8)];
}
void plat_ime_open(const char *t, const char *i, int m, int k) { (void)t; (void)i; (void)m; (void)k; }
int plat_ime_poll(char *out, int cap) { (void)out; (void)cap; return 0; }
const char *plat_ip(void) { return "192.168.1.42"; }
int plat_confirm_is_circle(void) { return 0; }
const char *plat_data_dir(void) { return "./data/"; }
const char *plat_app_dir(void) { return appdir; }
void plat_request_exit(void) { want_exit = 1; }
void plat_cfg(PlatCfg *c) { c->wide = wide; snprintf(c->detail, sizeof c->detail, "auto"); snprintf(c->bot_speed, sizeof c->bot_speed, "fast"); }
void plat_set_cfg(const char *k, const char *v) { (void)k; (void)v; }
void plat_hints(const char *const *h, int n) { nhints = n > 8 ? 8 : n; for (int i = 0; i < nhints; i++) snprintf(hints[i], 64, "%s", h[i]); }
void plat_pointer_show(int on) { ptr_shown = on; }
void plat_pointer_hover(int on) { ptr_hover = on; }
void plat_settings_open(void) { settings_open_frames = 2; }
int plat_settings_is_open(void) { return settings_open_frames > 0 ? settings_open_frames-- : 0; }
const char *plat_net_message(void) { return ""; }
int plat_server_start(void) { return 0; }
int plat_server_running(void) { return 0; }

/* ---- drawing ---- */
static inline void blend(int x, int y, uint32_t c) {
  if (x < 0 || y < 0 || x >= SW || y >= SH) return;
  uint32_t a = c >> 24; if (!a) return; uint32_t *d = &fb[y * SW + x];
  if (a == 255) { *d = c; return; }
  uint32_t o = *d, r = ((c & 255) * a + (o & 255) * (255 - a)) / 255, g = (((c >> 8) & 255) * a + ((o >> 8) & 255) * (255 - a)) / 255, b = (((c >> 16) & 255) * a + ((o >> 16) & 255) * (255 - a)) / 255;
  *d = r | (g << 8) | (b << 16) | 0xff000000;
}
static uint32_t RGBA(int r, int g, int b, int a) { return (uint32_t)r | (uint32_t)g << 8 | (uint32_t)b << 16 | (uint32_t)a << 24; }
static void tri(const CVert *v, float sx, float tx, float ty, int cx0, int cy0, int cx1, int cy1) {
  float x0 = v[0].x*sx+tx, y0 = v[0].y*sx+ty, x1 = v[1].x*sx+tx, y1 = v[1].y*sx+ty, x2 = v[2].x*sx+tx, y2 = v[2].y*sx+ty;
  float area = (x1-x0)*(y2-y0) - (y1-y0)*(x2-x0); if (fabsf(area) < 1e-6f) return;
  int bx0 = (int)floorf(fminf(x0, fminf(x1, x2))), bx1 = (int)ceilf(fmaxf(x0, fmaxf(x1, x2)));
  int by0 = (int)floorf(fminf(y0, fminf(y1, y2))), by1 = (int)ceilf(fmaxf(y0, fmaxf(y1, y2)));
  if (bx0 < cx0) bx0 = cx0; if (by0 < cy0) by0 = cy0; if (bx1 > cx1) bx1 = cx1; if (by1 > cy1) by1 = cy1;
  uint32_t c0 = v[0].c, c1 = v[1].c, c2 = v[2].c; int flat = c0 == c1 && c1 == c2;
  for (int y = by0; y < by1; y++) for (int x = bx0; x < bx1; x++) {
    float px = x + .5f, py = y + .5f;
    float w0 = ((x1-px)*(y2-py) - (y1-py)*(x2-px)) / area, w1 = ((x2-px)*(y0-py) - (y2-py)*(x0-px)) / area, w2 = 1 - w0 - w1;
    if (w0 < -1e-5f || w1 < -1e-5f || w2 < -1e-5f) continue;
    uint32_t c;
    if (flat) c = c0;
    else { c = 0; for (int sh = 0; sh < 32; sh += 8) { float k = ((c0 >> sh) & 255) * w0 + ((c1 >> sh) & 255) * w1 + ((c2 >> sh) & 255) * w2; int ki = (int)(k + .5f); c |= (uint32_t)(ki < 0 ? 0 : ki > 255 ? 255 : ki) << sh; } }
    blend(x, y, c);
  }
}
/* text with the font atlas, bilinear, vertically placed as the GameCube program does */
static void text_at(const char *s, float x, float y_base, float size, uint32_t col, int cx0, int cy0, int cx1, int cy1) {
  const UiFont *f = font_for(size); float k = size / f->px; float pen = x;
  for (const unsigned char *p = (const unsigned char *)s; *p; p++) {
    const UiGlyph *g = &f->glyphs[*p];
    if (g->w && g->h && *p != ' ') {
      float gx = pen + g->left * k, gy = y_base + g->top * k; int dw = (int)ceilf(g->w * k) + 1, dh = (int)ceilf(g->h * k) + 1;
      for (int yy = 0; yy < dh; yy++) for (int xx = 0; xx < dw; xx++) {
        int X = (int)floorf(gx) + xx, Y = (int)floorf(gy) + yy; if (X < cx0 || Y < cy0 || X >= cx1 || Y >= cy1) continue;
        float u = (X + 0.5f - gx) / k - 0.5f, v = (Y + 0.5f - gy) / k - 0.5f;
        int u0 = (int)floorf(u), v0 = (int)floorf(v); float fu = u - u0, fv = v - v0; float a = 0;
        for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) { int uu = u0 + i, vv = v0 + j; if (uu < 0 || vv < 0 || uu >= g->w || vv >= g->h) continue; a += atlas_px(f, g->x + uu, g->y + vv) * (i ? fu : 1 - fu) * (j ? fv : 1 - fv); }
        int ai = (int)(a * (col >> 24) / 255); if (ai > 0) blend(X, Y, (col & 0xffffff) | (uint32_t)(ai > 255 ? 255 : ai) << 24);
      }
    }
    pen += g->adv16 / 16.0f * k;
  }
}
static void text(const CText *t, float sx, float tx, float ty, int cx0, int cy0, int cx1, int cy1) {
  float size = t->size * sx; if (size < 5) return;
  float x = t->x * sx + tx, y = t->y * sx + ty;
  if (t->align) { float w = plat_text_width(t->s, size); x -= t->align == 1 ? w / 2 : w; }
  if (t->baseline == 1) y += size * 0.36f; else if (t->baseline == 2) y += size * 0.8f; else if (t->baseline == 3) y -= size * 0.2f;
  text_at(t->s, x + 1, y + 1, size, RGBA(0, 0, 0, (int)((t->c >> 24) * 0.55f)), cx0, cy0, cx1, cy1);   /* the soft drop under text, as on the GameCube */
  text_at(t->s, x, y, size, t->c, cx0, cy0, cx1, cy1);
}
static void fillrect(float x, float y, float w, float h, uint32_t c) { for (int yy = (int)y; yy < (int)(y + h); yy++) for (int xx = (int)x; xx < (int)(x + w); xx++) blend(xx, yy, c); }
static void disc(float cx, float cy, float r, uint32_t c) { for (int y = (int)(cy - r - 1); y <= (int)(cy + r + 1); y++) for (int x = (int)(cx - r - 1); x <= (int)(cx + r + 1); x++) { float d = hypotf(x + .5f - cx, y + .5f - cy); float a = r + .5f - d; if (a > 0) blend(x, y, (c & 0xffffff) | (uint32_t)((c >> 24) * (a > 1 ? 1 : a)) << 24); } }
static void pill(float x, float y, float w, float h, uint32_t top, uint32_t edge) { float r = h / 2; for (int yy = (int)y; yy < (int)(y + h); yy++) for (int xx = (int)x; xx < (int)(x + w); xx++) { float cxp = xx + .5f < x + r ? x + r : (xx + .5f > x + w - r ? x + w - r : xx + .5f); float d = hypotf(xx + .5f - cxp, yy + .5f - (y + r)); if (d <= r) blend(xx, yy, d > r - 1 ? edge : top); } }
/* the backdrop: near black with a grid (the System look) */
static void backdrop(void) {
  for (int y = 0; y < SH; y++) for (int x = 0; x < SW; x++) {
    float dx = (x - SW / 2.0f) / SW, dy = (y - SH / 2.0f) / SH; float v = 1 - 0.55f * (dx * dx + dy * dy) * 2.2f;
    int gx = ((x - SW / 2) % 24 + 24) % 24, gy = ((y - SH / 2) % 24 + 24) % 24; int line = gx < 2 || gy < 2;
    int c = line ? (int)(30 * v) : (int)(8 * v); fb[y * SW + x] = RGBA(c, c, c + 2, 255);
  }
}
/* the hints along the bottom, as BrainBox draws them */
static float hint_one(const char *h, float x, float cy, int draw) {
  char key[8] = ""; const char *colon = strchr(h, ':'); const char *label = colon ? colon + 1 : h;
  if (colon && colon - h < 7) { memcpy(key, h, (size_t)(colon - h)); key[colon - h] = 0; }
  float w = 0;
  if (!strcmp(key, "S")) { if (draw) { disc(x + 10, cy + 1, 11, RGBA(0,0,0,150)); disc(x + 10, cy, 10, RGBA(0x4a,0x4a,0x52,255)); disc(x + 10, cy, 7.8f, RGBA(0x2a,0x2a,0x30,255)); disc(x + 10, cy, 6, RGBA(0xd6,0xd7,0xde,255)); } w = 20; }
  else if (key[0]) {
    const char *t = !strcmp(key, "ST") ? "START" : key; uint32_t tc = RGBA(0xd8,0xda,0xe6,255);
    if (!strcmp(key, "A")) tc = RGBA(0x5f,0xe3,0x9a,255); if (!strcmp(key, "B")) tc = RGBA(0xff,0x5c,0x7c,255); if (!strcmp(key, "Z")) tc = RGBA(0xb9,0xa2,0xff,255); if (!strcmp(key, "C")) tc = RGBA(0xff,0xd8,0x3a,255);
    float pw = plat_text_width(t, 11) + 12; if (pw < 20) pw = 20;
    if (draw) { pill(x, cy - 10, pw, 20, RGBA(0x22,0x22,0x28,255), RGBA(255,255,255,60)); float tw = plat_text_width(t, 11); text_at(t, x + pw / 2 - tw / 2, cy + 4, 11, tc, 0, 0, SW, SH); }
    w = pw;
  }
  if (key[0]) { if (draw) for (int i = 0; i < 3; i++) disc(x + w + 4 + i * 4, cy + 1, 1.1f, RGBA(0xc9,0xcb,0xd6,255)); w += 16; }
  if (draw) text_at(label, x + w, cy + 4.5f, 12, RGBA(0xdf,0xe4,0xff,255), 0, 0, SW, SH);
  return w + plat_text_width(label, 12);
}
static void hints_row(void) {
  if (nhints <= 0) return;
  float total = 0, gap = 30, maxw = SW - 60;
  for (int i = 0; i < nhints; i++) total += hint_one(hints[i], 0, 0, 0);
  if (total + gap * (nhints - 1) > maxw) gap = fmaxf(10, (maxw - total) / (nhints - 1));
  float x = SW / 2.0f - (total + gap * (nhints - 1)) / 2;
  for (int i = 0; i < nhints; i++) x += hint_one(hints[i], x, 460, 1) + gap;
}
static void pointer(void) {
  if (!ptr_shown) return;
  if (ptr_hover) disc(ptr_x, ptr_y, 11, RGBA(232, 207, 74, 110));
  float x = ptr_x, y = ptr_y;
  for (int pass = 0; pass < 3; pass++) {
    float ox = pass == 0 ? 3 : 0, oy = pass == 0 ? 4 : 0, gr = pass == 2 ? 0 : 2.2f;
    uint32_t c = pass == 0 ? RGBA(0,0,0,130) : pass == 1 ? RGBA(42,34,140,255) : RGBA(255,255,255,255);
    CVert t[3] = {{x + ox - gr * .6f, y + oy - gr * 1.6f, c}, {x + ox - gr * .6f, y + oy + 22 + gr * 1.4f, c}, {x + ox + 17 + gr * 1.7f, y + oy + 16 + gr * .6f, c}};
    tri(t, 1, 0, 0, 0, 0, SW, SH);
    for (float k = 0; k < 1; k += 0.05f) disc(x + ox + 7 + 5 * k, y + oy + 15 + 11 * k, 2.5f + gr * .9f, c);
  }
}
static void render(void) {
  backdrop();
  for (int li = 0; li < CV_LAYERS; li++) {
    CLayer *L = &cv_layers[li]; if (!L->visible) continue;
    int cx0 = 0, cy0 = 0, cx1 = SW, cy1 = SH;
    if (L->clip[2] > 0) { cx0 = L->clip[0]; cy0 = L->clip[1]; cx1 = L->clip[0] + L->clip[2]; cy1 = L->clip[1] + L->clip[3]; }
    if (cx0 < 0) cx0 = 0; if (cy0 < 0) cy0 = 0; if (cx1 > SW) cx1 = SW; if (cy1 > SH) cy1 = SH;
    for (int i = 0; i + 2 < L->nv; i += 3) tri(L->v + i, L->sx, L->tx, L->ty, cx0, cy0, cx1, cy1);
    for (int i = 0; i < L->nt; i++) text(&L->t[i], L->sx, L->tx, L->ty, cx0, cy0, cx1, cy1);
  }
  fillrect(0, 440, SW, 40, RGBA(4, 4, 6, 200)); fillrect(0, 440, SW, 1, RGBA(200, 210, 230, 50));
  hints_row();
  pointer();
}
void plat_snapshot(const char *path) {
  render();
  FILE *f = fopen(path, "wb"); if (!f) return;
  fprintf(f, "P6\n%d %d\n255\n", SW, SH);
  for (int i = 0; i < SW * SH; i++) { unsigned char px[3] = {fb[i] & 255, (fb[i] >> 8) & 255, (fb[i] >> 16) & 255}; fwrite(px, 1, 3, f); }
  fclose(f);
}
/* the test script drives the input through these globals */
int main(int argc, char **argv) {
  if (argc < 3) { fprintf(stderr, "usage: %s jsdir test.js [frames]\n", argv[0]); return 2; }
  snprintf(appdir, sizeof appdir, "%s/", argv[1]);
  long maxf = argc > 3 ? atol(argv[3]) : 60 * 60 * 10;
  wide = getenv("SS_WIDE") != NULL; realtime = getenv("SS_REALTIME") != NULL; SW = wide ? 854 : 640; fb = malloc(sizeof(uint32_t) * SW * SH);
  mkdir("./data", 0777); mkdir("./shots", 0777);
  cv_text_width = plat_text_width; cv_init(); ws_global_init();
  const char *files[] = {"stubs.js", "engine.js", "gc_server.js", "gc_ui.js", argv[2]};
  if (!js_start(files, 5, getenv("SS_HEAP") ? (size_t)atol(getenv("SS_HEAP")) : 0)) return 1;
  for (frame_no = 0; frame_no < maxf && !want_exit; frame_no++) {
    JsInput in; memset(&in, 0, sizeof in);
    in.px = ptr_x; in.py = ptr_y;
    if (!js_frame(&in)) break;
    if (realtime) usleep(16000);
    double v; if (js_get_num("globalThis.T ? T.px : 320", &v)) ptr_x = (float)v; if (js_get_num("globalThis.T ? T.py : 240", &v)) ptr_y = (float)v;
  }
  return 0;
}
