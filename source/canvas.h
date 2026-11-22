/* Shardscape Vita: a small retained-mode Canvas 2D implementation.
 * The game's drawing code issues HTML-canvas style calls; this turns them into
 * coloured triangles and text records stored per layer, which a platform
 * renderer (vita2d on the Vita, a software rasteriser for tests) draws every
 * frame with a cheap per-layer pan/zoom. */
#ifndef SS_CANVAS_H
#define SS_CANVAS_H
#include <stdint.h>

#define CV_LAYERS 8

typedef struct { float x, y; uint32_t c; } CVert;           /* c = 0xAABBGGRR (vita2d RGBA8) */
typedef struct { float x, y, size; uint32_t c; int align, baseline; char *s; } CText;

typedef struct {
  CVert *v; int nv, capv;
  CText *t; int nt, capt;
  float sx, tx, ty;                 /* view: screen = p*sx + (tx,ty) */
  int clip[4];                      /* screen clip rect x,y,w,h (w<=0: none) */
  int visible;
  unsigned ver;                     /* bumped on every change, so a renderer knows when to rebuild */
} CLayer;

extern CLayer cv_layers[CV_LAYERS];

/* platform hook: width in px of UTF-8 string at a font size */
extern float (*cv_text_width)(const char *s, float size);

void cv_init(void);
void cv_select_layer(int id);
void cv_clear_layer(int id);
void cv_set_view(int id, float sx, float tx, float ty, int cx, int cy, int cw, int ch, int visible);

void cv_save(void); void cv_restore(void);
void cv_set_transform(float a, float b, float c, float d, float e, float f);
void cv_translate(float x, float y); void cv_scale(float x, float y);
void cv_begin_path(void); void cv_move_to(float x, float y); void cv_line_to(float x, float y);
void cv_close_path(void);
void cv_arc(float x, float y, float r, float a0, float a1, int ccw);
void cv_ellipse(float x, float y, float rx, float ry, float rot, float a0, float a1, int ccw);
void cv_quad_to(float cx, float cy, float x, float y);
void cv_fill(void); void cv_stroke(void); void cv_clip(void);
void cv_fill_rect(float x, float y, float w, float h);
void cv_clear_rect(float x, float y, float w, float h);
void cv_fill_text(const char *s, float x, float y);

int  cv_parse_color(const char *s, uint32_t *out);
void cv_fill_color(uint32_t c); void cv_stroke_color(uint32_t c);
void cv_fill_grad(int id); void cv_stroke_grad(int id);
int  cv_grad_linear(float x0, float y0, float x1, float y1);
int  cv_grad_radial(float x0, float y0, float r0, float x1, float y1, float r1);
void cv_grad_stop(int id, float t, uint32_t c);
void cv_line_width(float w); void cv_alpha(float a); void cv_font_size(float s);
void cv_text_align(int a);      /* 0 left/start, 1 center, 2 right/end */
void cv_text_baseline(int b);   /* 0 alphabetic, 1 middle, 2 top, 3 bottom */
void cv_line_cap(int round_); void cv_line_join(int round_);
int  cv_vertex_count(int id);

#endif
