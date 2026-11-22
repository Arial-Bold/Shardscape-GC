/* gfx.h - the picture: video modes, the GameCube's graphics chip, and the
 * System look's pieces (as BrainBox and Flashcube draw them).
 *
 * Everything is drawn in screen units: 480 tall, and 640 wide on a 4:3 TV
 * or 854 wide on a 16:9 one (gfx_width()). The projection pulls everything
 * in for overscan, and squeezes the 16:9 layout into the 640 pixels the
 * GameCube draws (the TV stretches it back out). */
#pragma once
#include <gccore.h>
#include <stdbool.h>

typedef struct { u8 r, g, b, a; } Color;
static inline Color rgba(u8 r, u8 g, u8 b, u8 a) { return (Color){ r, g, b, a }; }
Color color_alpha(Color c, float k);

enum { RES_AUTO, RES_480I, RES_480P, RES_COUNT };
typedef struct { int resolution, widescreen, full_width, overscan; } VideoSettings;

void  gfx_init(const VideoSettings *v);
void  gfx_set_video(const VideoSettings *v);   /* a changed setting: the mode and the layout follow */
void  gfx_shutdown(void);
float gfx_width(void);                         /* 640 or 854 */
bool  gfx_progressive(void);

/* a frame: begin, draw, end (waits for the TV) */
void  gfx_begin(void);
void  gfx_end(void);
u32   gfx_frames(void);

/* drawing state */
void  gfx_mode_color(void);
void  gfx_identity(void);
void  gfx_layer_matrix(float sx, float tx, float ty);   /* screen = point * sx + (tx, ty) */
void  gfx_scissor(float x, float y, float w, float h);   /* in screen units */
void  gfx_scissor_off(void);
void  gfx_desc_color_only(void);   /* vertices: position and colour (the canvas's display lists) */
void  gfx_desc_full(void);         /* vertices: position, colour and texture coordinates */

/* shapes */
void  gfx_rect_v(float x, float y, float w, float h, Color top, Color bot);
void  gfx_rect_h(float x, float y, float w, float h, Color l, Color r);
void  gfx_rect(float x, float y, float w, float h, Color c);
void  gfx_tri(float x0, float y0, float x1, float y1, float x2, float y2, Color c);
void  gfx_circle(float cx, float cy, float r, Color c);
void  gfx_rrect_v(float x, float y, float w, float h, float r, Color top, Color bot);
void  gfx_outline(float x, float y, float w, float h, float r, float t, Color c);
void  gfx_shadow(float x, float y, float w, float h, float r, float spread, Color c);
void  gfx_line(float x0, float y0, float x1, float y1, float w, Color c);
float gfx_pixel_w(void);
float gfx_pixel_h(void);

/* text: the M PLUS Rounded font of the other apps. y is the middle of the
 * capitals; align 0 left, 1 centre, 2 right; max_w > 0 shortens it with an
 * ellipsis. A soft dark drop sits under it. */
float gfx_text_width(const char *s, float size);
void  gfx_text(float x, float y, const char *s, float size, Color c, int align, float max_w);
/* text placed by its baseline, without the drop or shortening (the canvas's text) */
void  gfx_text_base(float x, float base, const char *s, float size, Color c);

/* the System look */
extern const Color C_TEXT, C_SOFT, C_TITLE, C_GOLD, C_GOLD_HI, C_DIM;
void  gfx_backdrop(void);   /* near black, a 24-unit grid, a soft vignette */
void  gfx_panel(float x, float y, float w, float h);
void  gfx_frost(float x, float y, float w, float h);
void  gfx_gold_ring(float x, float y, float w, float h);
void  gfx_desc_bar(float x, float y, float w, float h);
void  gfx_grid_patch(float x, float y, float w, float h, float cell, float span, int side, Color c);
void  gfx_hints(const char hints[][48], int n, float y);   /* "A:Choose" pills, centred */
void  gfx_pointer(float x, float y, float press, float hover);
