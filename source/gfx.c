/* gfx.c - see gfx.h. The video modes, the projection and the System look
 * come from BrainBox (ui.c); the pointer from CubeBrowser. */
#include "gfx.h"
#include "ui_assets.h"
#include <malloc.h>
#include <math.h>
#include <stdio.h>
#include <string.h>

#define FIFO_SIZE (512 * 1024)
static void *fifo;
static u32 *xfb[2];
static int fb;
static GXRModeObj mode;
static GXRModeObj *rmode = &mode;
static VideoSettings vset;
static volatile u32 frames;
static GXTexObj tex_font_small, tex_font_large;

Color color_alpha(Color c, float k) { if (k < 0) k = 0; if (k > 1) k = 1; c.a = (u8)(c.a * k); return c; }
static inline float clamp01(float t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
static Color mix(Color a, Color b, float t) {
	t = clamp01(t);
	return rgba(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t, a.a + (b.a - a.a) * t);
}
const Color C_TEXT = { 238, 241, 246, 255 }, C_SOFT = { 201, 210, 238, 255 }, C_TITLE = { 115, 146, 255, 255 };
const Color C_GOLD = { 232, 207, 74, 255 }, C_GOLD_HI = { 255, 244, 150, 255 }, C_DIM = { 124, 134, 146, 255 };

/* ================================================================== video */

/* The GPU draws 640 pixels across. Full width stretches that to 704, the
 * whole width of the TV picture (as games do); Standard leaves it at 640. */
static void pick_mode(void) {
	bool pal = VIDEO_GetCurrentTvMode() == VI_PAL;
	GXRModeObj *base;
	if (vset.resolution == RES_480P && VIDEO_HaveComponentCable())
		base = pal ? &TVEurgb60Hz480Prog : &TVNtsc480Prog;
	else if (vset.resolution == RES_480I)
		base = pal ? &TVPal528IntDf : &TVNtsc480IntDf;
	else if (VIDEO_HaveComponentCable())
		base = pal ? &TVEurgb60Hz480Prog : &TVNtsc480Prog;
	else
		base = VIDEO_GetPreferredMode(NULL);
	mode = *base;
	if (vset.full_width) { mode.viWidth = 704; mode.viXOrigin = (720 - 704) / 2; }
	else { mode.viWidth = 640; mode.viXOrigin = (720 - 640) / 2; }
}

static void setup_gx(void) {
	f32 yscale = GX_GetYScaleFactor(rmode->efbHeight, rmode->xfbHeight);
	u32 xfb_h = GX_SetDispCopyYScale(yscale);
	GX_SetViewport(0, 0, rmode->fbWidth, rmode->efbHeight, 0, 1);
	GX_SetScissor(0, 0, rmode->fbWidth, rmode->efbHeight);
	GX_SetDispCopySrc(0, 0, rmode->fbWidth, rmode->efbHeight);
	GX_SetDispCopyDst(rmode->fbWidth, xfb_h);
	GX_SetCopyFilter(rmode->aa, rmode->sample_pattern, GX_TRUE, rmode->vfilter);
	GX_SetFieldMode(rmode->field_rendering, (rmode->viHeight == 2 * rmode->xfbHeight) ? GX_ENABLE : GX_DISABLE);
	GX_SetPixelFmt(rmode->aa ? GX_PF_RGB565_Z16 : GX_PF_RGB8_Z24, GX_ZC_LINEAR);
	GX_SetDispCopyGamma(GX_GM_1_0);
}

static void configure_vi(void) {
	VIDEO_Configure(rmode);
	VIDEO_ClearFrameBuffer(rmode, xfb[0], COLOR_BLACK);
	VIDEO_ClearFrameBuffer(rmode, xfb[1], COLOR_BLACK);
	VIDEO_SetNextFramebuffer(xfb[0]);
	VIDEO_SetBlack(FALSE);
	VIDEO_Flush();
	VIDEO_WaitVSync();
	if (rmode->viTVMode & VI_NON_INTERLACE) VIDEO_WaitVSync();
	fb = 1;
}

static void tex_init(GXTexObj *t, const void *data, int w, int h, u8 fmt) {
	DCFlushRange((void *)data, GX_GetTexBufferSize(w, h, fmt, GX_FALSE, 0));
	GX_InitTexObj(t, (void *)data, w, h, fmt, GX_CLAMP, GX_CLAMP, GX_FALSE);
	GX_InitTexObjLOD(t, GX_LINEAR, GX_LINEAR, 0, 0, 0, GX_FALSE, GX_FALSE, GX_ANISO_1);
}

void gfx_init(const VideoSettings *v) {
	vset = *v;
	VIDEO_Init();
	/* framebuffers big enough for any mode (PAL's 576 lines included) */
	size_t fb_bytes = 640 * 576 * 2;
	xfb[0] = MEM_K0_TO_K1(memalign(32, fb_bytes));
	xfb[1] = MEM_K0_TO_K1(memalign(32, fb_bytes));
	pick_mode();
	configure_vi();
	fifo = memalign(32, FIFO_SIZE);
	memset(fifo, 0, FIFO_SIZE);
	GX_Init(fifo, FIFO_SIZE);
	GX_SetCopyClear((GXColor){ 6, 6, 8, 255 }, 0x00FFFFFF);
	setup_gx();
	GX_SetCullMode(GX_CULL_NONE);
	GX_CopyDisp(xfb[0], GX_TRUE);
	tex_init(&tex_font_small, font_small.tex, font_small.w, font_small.h, GX_TF_I8);
	tex_init(&tex_font_large, font_large.tex, font_large.w, font_large.h, GX_TF_I8);
}

void gfx_set_video(const VideoSettings *v) {
	vset = *v;
	GXRModeObj old = mode;
	pick_mode();
	if (memcmp(&old, &mode, sizeof(mode))) {
		GX_DrawDone();
		VIDEO_SetBlack(TRUE);
		VIDEO_Flush();
		VIDEO_WaitVSync();
		configure_vi();
		setup_gx();
	}
}

void gfx_shutdown(void) {
	GX_DrawDone();
	VIDEO_SetBlack(TRUE);
	VIDEO_Flush();
	VIDEO_WaitVSync();
}

float gfx_width(void) { return vset.widescreen ? 854.0f : 640.0f; }
bool gfx_progressive(void) { return (rmode->viTVMode & VI_NON_INTERLACE) != 0; }
u32 gfx_frames(void) { return frames; }

/* the visible part of the layout */
static float vl, vt, vr, vb;
static void view_bounds(void) {
	float w = vset.widescreen ? 640.0f * 4.0f / 3.0f : 640.0f, h = 480.0f;
	float k = 1.0f - vset.overscan / 100.0f;
	w /= k; h /= k;
	float c = gfx_width() / 2;
	vl = c - w / 2; vr = c + w / 2; vt = 240 - h / 2; vb = 240 + h / 2;
}
float gfx_pixel_w(void) { return (vr - vl) / rmode->fbWidth; }
float gfx_pixel_h(void) { return (vb - vt) / rmode->efbHeight; }

enum { M_NONE, M_COLOR, M_TEX, M_ALPHA };
static int cur_mode = M_NONE;
static int cur_desc = 0;   /* 0 full, 1 colour only */

void gfx_desc_full(void) {
	if (cur_desc == 0) return;
	cur_desc = 0;
	GX_ClearVtxDesc();
	GX_SetVtxDesc(GX_VA_POS, GX_DIRECT);
	GX_SetVtxDesc(GX_VA_CLR0, GX_DIRECT);
	GX_SetVtxDesc(GX_VA_TEX0, GX_DIRECT);
}
void gfx_desc_color_only(void) {
	if (cur_desc == 1) return;
	cur_desc = 1;
	GX_ClearVtxDesc();
	GX_SetVtxDesc(GX_VA_POS, GX_DIRECT);
	GX_SetVtxDesc(GX_VA_CLR0, GX_DIRECT);
}

void gfx_identity(void) {
	Mtx m;
	guMtxIdentity(m);
	GX_LoadPosMtxImm(m, GX_PNMTX0);
}
void gfx_layer_matrix(float sx, float tx, float ty) {
	Mtx m;
	guMtxIdentity(m);
	m[0][0] = sx; m[1][1] = sx; m[0][3] = tx; m[1][3] = ty;
	GX_LoadPosMtxImm(m, GX_PNMTX0);
}
void gfx_scissor(float x, float y, float w, float h) {
	float sx = rmode->fbWidth / (vr - vl), sy = rmode->efbHeight / (vb - vt);
	int x0 = (int)floorf((x - vl) * sx), y0 = (int)floorf((y - vt) * sy);
	int x1 = (int)ceilf((x + w - vl) * sx), y1 = (int)ceilf((y + h - vt) * sy);
	if (x0 < 0) x0 = 0; if (y0 < 0) y0 = 0;
	if (x1 > rmode->fbWidth) x1 = rmode->fbWidth; if (y1 > rmode->efbHeight) y1 = rmode->efbHeight;
	if (x1 <= x0 || y1 <= y0) { GX_SetScissor(0, 0, 1, 1); return; }
	GX_SetScissor(x0, y0, x1 - x0, y1 - y0);
}
void gfx_scissor_off(void) { GX_SetScissor(0, 0, rmode->fbWidth, rmode->efbHeight); }

void gfx_mode_color(void) {
	if (cur_mode == M_COLOR) return;
	cur_mode = M_COLOR;
	GX_SetNumTexGens(0);
	GX_SetTevOrder(GX_TEVSTAGE0, GX_TEXCOORDNULL, GX_TEXMAP_NULL, GX_COLOR0A0);
	GX_SetTevOp(GX_TEVSTAGE0, GX_PASSCLR);
}
static void mode_tex(GXTexObj *t, bool alpha_only) {
	GX_LoadTexObj(t, GX_TEXMAP0);
	int m = alpha_only ? M_ALPHA : M_TEX;
	if (cur_mode == m) return;
	cur_mode = m;
	GX_SetNumTexGens(1);
	GX_SetTexCoordGen(GX_TEXCOORD0, GX_TG_MTX2x4, GX_TG_TEX0, GX_IDENTITY);
	GX_SetTevOrder(GX_TEVSTAGE0, GX_TEXCOORD0, GX_TEXMAP0, GX_COLOR0A0);
	if (alpha_only) {
		/* text: the vertex colour, with the font's coverage as alpha */
		GX_SetTevColorIn(GX_TEVSTAGE0, GX_CC_ZERO, GX_CC_ZERO, GX_CC_ZERO, GX_CC_RASC);
		GX_SetTevColorOp(GX_TEVSTAGE0, GX_TEV_ADD, GX_TB_ZERO, GX_CS_SCALE_1, GX_TRUE, GX_TEVPREV);
		GX_SetTevAlphaIn(GX_TEVSTAGE0, GX_CA_ZERO, GX_CA_TEXA, GX_CA_RASA, GX_CA_ZERO);
		GX_SetTevAlphaOp(GX_TEVSTAGE0, GX_TEV_ADD, GX_TB_ZERO, GX_CS_SCALE_1, GX_TRUE, GX_TEVPREV);
	} else {
		GX_SetTevOp(GX_TEVSTAGE0, GX_MODULATE);
	}
}

static inline void vtx(float x, float y, Color c, float s, float t) {
	GX_Position2f32(x, y);
	GX_Color4u8(c.r, c.g, c.b, c.a);
	GX_TexCoord2f32(s, t);
}

void gfx_begin(void) {
	view_bounds();
	Mtx44 proj;
	guOrtho(proj, vt, vb, vl, vr, 0, 1);
	GX_LoadProjectionMtx(proj, GX_ORTHOGRAPHIC);
	gfx_identity();
	GX_SetCurrentMtx(GX_PNMTX0);
	cur_desc = -1;
	gfx_desc_full();
	GX_SetVtxAttrFmt(GX_VTXFMT0, GX_VA_POS, GX_POS_XY, GX_F32, 0);
	GX_SetVtxAttrFmt(GX_VTXFMT0, GX_VA_CLR0, GX_CLR_RGBA, GX_RGBA8, 0);
	GX_SetVtxAttrFmt(GX_VTXFMT0, GX_VA_TEX0, GX_TEX_ST, GX_F32, 0);
	GX_SetVtxAttrFmt(GX_VTXFMT1, GX_VA_POS, GX_POS_XY, GX_F32, 0);
	GX_SetVtxAttrFmt(GX_VTXFMT1, GX_VA_CLR0, GX_CLR_RGBA, GX_RGBA8, 0);
	GX_SetNumChans(1);
	GX_SetChanCtrl(GX_COLOR0A0, GX_DISABLE, GX_SRC_REG, GX_SRC_VTX, GX_LIGHTNULL, GX_DF_NONE, GX_AF_NONE);
	GX_SetNumTevStages(1);
	GX_SetZMode(GX_FALSE, GX_ALWAYS, GX_FALSE);
	GX_SetBlendMode(GX_BM_BLEND, GX_BL_SRCALPHA, GX_BL_INVSRCALPHA, GX_LO_CLEAR);
	GX_SetAlphaUpdate(GX_FALSE);
	GX_SetColorUpdate(GX_TRUE);
	GX_SetCullMode(GX_CULL_NONE);
	GX_InvalidateTexAll();
	gfx_scissor_off();
	cur_mode = M_NONE;
}

void gfx_end(void) {
	GX_SetZMode(GX_TRUE, GX_ALWAYS, GX_TRUE);   /* so the copy clears depth too */
	GX_CopyDisp(xfb[fb], GX_TRUE);
	GX_DrawDone();
	frames++;
	VIDEO_SetNextFramebuffer(xfb[fb]);
	VIDEO_Flush();
	VIDEO_WaitVSync();
	fb ^= 1;
}

/* ================================================================= shapes */

void gfx_rect_v(float x, float y, float w, float h, Color top, Color bot) {
	if (!(w > 0) || !(h > 0)) return;
	gfx_mode_color();
	GX_Begin(GX_QUADS, GX_VTXFMT0, 4);
	vtx(x, y, top, 0, 0); vtx(x + w, y, top, 0, 0); vtx(x + w, y + h, bot, 0, 0); vtx(x, y + h, bot, 0, 0);
	GX_End();
}
void gfx_rect_h(float x, float y, float w, float h, Color l, Color r) {
	if (!(w > 0) || !(h > 0)) return;
	gfx_mode_color();
	GX_Begin(GX_QUADS, GX_VTXFMT0, 4);
	vtx(x, y, l, 0, 0); vtx(x + w, y, r, 0, 0); vtx(x + w, y + h, r, 0, 0); vtx(x, y + h, l, 0, 0);
	GX_End();
}
void gfx_rect(float x, float y, float w, float h, Color c) { gfx_rect_v(x, y, w, h, c, c); }
void gfx_tri(float x0, float y0, float x1, float y1, float x2, float y2, Color c) {
	gfx_mode_color();
	GX_Begin(GX_TRIANGLES, GX_VTXFMT0, 3);
	vtx(x0, y0, c, 0, 0); vtx(x1, y1, c, 0, 0); vtx(x2, y2, c, 0, 0);
	GX_End();
}
void gfx_circle(float cx, float cy, float r, Color c) {
	gfx_mode_color();
	GX_Begin(GX_TRIANGLEFAN, GX_VTXFMT0, 26);
	vtx(cx, cy, c, 0, 0);
	for (int i = 0; i <= 24; i++) {
		float a = 6.2831853f * i / 24;
		vtx(cx + cosf(a) * r, cy + sinf(a) * r, c, 0, 0);
	}
	GX_End();
}
void gfx_line(float x0, float y0, float x1, float y1, float w, Color c) {
	float dx = x1 - x0, dy = y1 - y0, l = sqrtf(dx * dx + dy * dy);
	if (l < 0.01f) { gfx_circle(x0, y0, w / 2, c); return; }
	float nx = -dy / l * w / 2, ny = dx / l * w / 2;
	gfx_mode_color();
	GX_Begin(GX_QUADS, GX_VTXFMT0, 4);
	vtx(x0 + nx, y0 + ny, c, 0, 0); vtx(x1 + nx, y1 + ny, c, 0, 0); vtx(x1 - nx, y1 - ny, c, 0, 0); vtx(x0 - nx, y0 - ny, c, 0, 0);
	GX_End();
	gfx_circle(x0, y0, w / 2, c); gfx_circle(x1, y1, w / 2, c);
}

#define RR_SEG 4
#define RR_PTS (4 * (RR_SEG + 1))
static int rr_points(float x, float y, float w, float h, float r, float *px, float *py) {
	if (r > w / 2) r = w / 2;
	if (r > h / 2) r = h / 2;
	if (r < 0) r = 0;
	const float cx[4] = { x + w - r, x + w - r, x + r, x + r }, cy[4] = { y + r, y + h - r, y + h - r, y + r };
	int n = 0;
	for (int c = 0; c < 4; c++) {
		float a0 = (-90.0f + 90.0f * c) * 3.14159265f / 180.0f;
		for (int i = 0; i <= RR_SEG; i++) {
			float a = a0 + 3.14159265f * 0.5f * i / RR_SEG;
			px[n] = cx[c] + cosf(a) * r; py[n] = cy[c] + sinf(a) * r; n++;
		}
	}
	return n;
}
void gfx_rrect_v(float x, float y, float w, float h, float r, Color top, Color bot) {
	if (!(w > 0) || !(h > 0)) return;
	float px[RR_PTS], py[RR_PTS];
	int n = rr_points(x, y, w, h, r, px, py);
	gfx_mode_color();
	GX_Begin(GX_TRIANGLEFAN, GX_VTXFMT0, n + 2);
	vtx(x + w / 2, y + h / 2, mix(top, bot, 0.5f), 0, 0);
	for (int i = 0; i <= n; i++) { int k = i % n; vtx(px[k], py[k], mix(top, bot, (py[k] - y) / h), 0, 0); }
	GX_End();
}
void gfx_outline(float x, float y, float w, float h, float r, float t, Color c) {
	if (!(w > 0) || !(h > 0)) return;
	float ux = gfx_pixel_w() * 1.02f, uy = gfx_pixel_h() * 1.02f;   /* never thinner than a pixel */
	float tx = t < ux ? ux : t, ty = t < uy ? uy : t;
	if (2 * tx >= w || 2 * ty >= h) { gfx_rrect_v(x, y, w, h, r, c, c); return; }
	float ox[RR_PTS], oy[RR_PTS], ix[RR_PTS], iy[RR_PTS];
	int n = rr_points(x, y, w, h, r, ox, oy);
	float ri = r - (tx > ty ? tx : ty);
	rr_points(x + tx, y + ty, w - 2 * tx, h - 2 * ty, ri > 0 ? ri : 0, ix, iy);
	gfx_mode_color();
	GX_Begin(GX_TRIANGLESTRIP, GX_VTXFMT0, (n + 1) * 2);
	for (int i = 0; i <= n; i++) { int k = i % n; vtx(ox[k], oy[k], c, 0, 0); vtx(ix[k], iy[k], c, 0, 0); }
	GX_End();
}
void gfx_shadow(float x, float y, float w, float h, float r, float spread, Color c) {
	for (int i = 4; i >= 1; i--) {
		float s = spread * i / 4;
		Color k = color_alpha(c, 0.28f);
		gfx_rrect_v(x - s, y - s, w + 2 * s, h + 2 * s, r + s, k, k);
	}
}

/* =================================================================== text */

static const UiFont *font_for(float size, GXTexObj **t) {
	if (size <= 16) { *t = &tex_font_small; return &font_small; }
	*t = &tex_font_large; return &font_large;
}

float gfx_text_width(const char *s, float size) {
	GXTexObj *t;
	const UiFont *f = font_for(size, &t);
	float k = size / f->px, w = 0;
	for (; *s; s++) w += f->glyphs[(u8)*s].adv16 / 16.0f * k;
	return w;
}

static void glyphs(float px, float base, const char *buf, float size, Color col) {
	GXTexObj *t;
	const UiFont *f = font_for(size, &t);
	float k = size / f->px;
	mode_tex(t, true);
	float pen = px;
	for (const char *p = buf; *p; p++) {
		const UiGlyph *g = &f->glyphs[(u8)*p];
		if (g->w && g->h && *p != ' ') {
			float gx = pen + g->left * k, gy = base + g->top * k;
			float s0 = (float)g->x / f->w, t0 = (float)g->y / f->h, s1 = (float)(g->x + g->w) / f->w, t1 = (float)(g->y + g->h) / f->h;
			GX_Begin(GX_QUADS, GX_VTXFMT0, 4);
			vtx(gx, gy, col, s0, t0); vtx(gx + g->w * k, gy, col, s1, t0);
			vtx(gx + g->w * k, gy + g->h * k, col, s1, t1); vtx(gx, gy + g->h * k, col, s0, t1);
			GX_End();
		}
		pen += g->adv16 / 16.0f * k;
	}
}

void gfx_text(float x, float y, const char *s, float size, Color c, int align, float max_w) {
	if (!s || !*s) return;
	char buf[200];
	snprintf(buf, sizeof(buf), "%s", s);
	if (max_w > 0 && gfx_text_width(buf, size) > max_w) {
		size_t n = strlen(buf);
		while (n > 0) {
			buf[--n] = 0;
			char tmp[204];
			snprintf(tmp, sizeof(tmp), "%s\x85", buf);
			if (gfx_text_width(tmp, size) <= max_w) { snprintf(buf, sizeof(buf), "%s", tmp); break; }
		}
	}
	GXTexObj *t;
	const UiFont *f = font_for(size, &t);
	float k = size / f->px;
	float w = gfx_text_width(buf, size);
	float px = align == 1 ? x - w / 2 : align == 2 ? x - w : x;
	/* the baseline, so that capitals sit centred on y */
	float base = y + (f->ascent - f->descent) * 0.5f * k * 0.9f;
	glyphs(px + 1, base + 1, buf, size, rgba(0, 0, 0, (u8)(c.a * 0.55f)));
	glyphs(px, base, buf, size, c);
}

void gfx_text_base(float x, float base, const char *s, float size, Color c) {
	if (!s || !*s) return;
	glyphs(x, base, s, size, c);
}

/* ========================================================= the System look */

void gfx_panel(float x, float y, float w, float h) {
	gfx_shadow(x, y + 6, w, h, 6, 8, rgba(0, 0, 0, 120));
	gfx_outline(x - 3, y - 3, w + 6, h + 6, 6, 2, rgba(200, 208, 220, 140));
	gfx_outline(x - 1, y - 1, w + 2, h + 2, 5, 1, rgba(10, 13, 16, 255));
	gfx_rrect_v(x, y, w, h, 4, rgba(26, 46, 50, 240), rgba(14, 22, 26, 247));
	float h1 = h * 0.35f;
	gfx_rect_v(x, y + 3, w, h1, rgba(30, 54, 57, 0), rgba(40, 72, 74, 150));
	gfx_rect_v(x, y + 3 + h1, w, h * 0.4f, rgba(40, 72, 74, 150), rgba(30, 54, 57, 0));
	float e = fminf(14, fminf(w, h) * 0.3f);
	gfx_rect_h(x, y + 3, e, h - 6, rgba(0, 0, 0, 70), rgba(0, 0, 0, 0));
	gfx_rect_h(x + w - e, y + 3, e, h - 6, rgba(0, 0, 0, 0), rgba(0, 0, 0, 70));
	gfx_rect(x + 4, y + 1, w - 8, 1, rgba(255, 255, 255, 46));
	gfx_outline(x, y, w, h, 4, 1, rgba(255, 255, 255, 30));
}

void gfx_frost(float x, float y, float w, float h) {
	gfx_rect_v(x, y, w, h, rgba(76, 94, 114, 205), rgba(40, 54, 70, 215));
	gfx_rect(x + 1, y + 1, w - 2, 1, rgba(255, 255, 255, 40));
	gfx_outline(x, y, w, h, 2, 1, rgba(215, 225, 240, 153));
}

void gfx_gold_ring(float x, float y, float w, float h) {
	gfx_outline(x - 3, y - 3, w + 6, h + 6, 0, 3, C_GOLD);
	gfx_outline(x, y, w, h, 0, 1, rgba(106, 90, 16, 200));
}

void gfx_desc_bar(float x, float y, float w, float h) {
	gfx_outline(x - 1, y - 1, w + 2, h + 2, 4, 1, rgba(11, 11, 32, 255));
	gfx_rrect_v(x, y, w, h, 3, rgba(42, 34, 140, 255), rgba(59, 44, 182, 255));
	gfx_outline(x, y, w, h, 3, 1, rgba(175, 175, 255, 153));
}

void gfx_grid_patch(float x, float y, float w, float h, float cell, float span, int side, Color c) {
	float sw = w * span, x0 = side > 0 ? x + w - sw : x;
	float lw = gfx_pixel_w();
	for (float gx = cell; gx < sw; gx += cell) {
		float px = side > 0 ? x0 + sw - gx : x0 + gx;
		float k = 1 - gx / sw;
		gfx_rect(px, y, lw, h, color_alpha(c, k));
	}
	Color clear = c;
	clear.a = 0;
	for (float gy = cell; gy < h; gy += cell) {
		if (side > 0) gfx_rect_h(x0, y + gy, sw, gfx_pixel_h(), clear, c);
		else gfx_rect_h(x0, y + gy, sw, gfx_pixel_h(), c, clear);
	}
}

/* As Flashcube's: near black, a 24-unit grid of 2-unit lines lined up on
 * the middle of the screen, and a soft dark vignette towards the edges. */
void gfx_backdrop(void) {
	float W = gfx_width();
	gfx_rect(vl, vt, vr - vl, vb - vt, rgba(6, 6, 8, 255));
	Color line = rgba(37, 37, 43, 255);
	float cxm = W / 2, cym = 240;
	for (float x = cxm - 24 * floorf((cxm - vl) / 24); x < vr; x += 24) gfx_rect(x - 1, vt, 2, vb - vt, line);
	for (float y = cym - 24 * floorf((cym - vt) / 24); y < vb; y += 24) gfx_rect(vl, y - 1, vr - vl, 2, line);
	Color dark = rgba(0, 0, 0, 170), none = rgba(0, 0, 0, 0);
	float bw = (vr - vl) * 0.22f, bh = (vb - vt) * 0.24f;
	gfx_rect_h(vl, vt, bw, vb - vt, dark, none);
	gfx_rect_h(vr - bw, vt, bw, vb - vt, none, dark);
	gfx_rect_v(vl, vt, vr - vl, bh, dark, none);
	gfx_rect_v(vl, vb - bh, vr - vl, bh, none, dark);
}

/* ------------------------------------------------- the controls (hints)
 * As CubeVerse and BrainBox draw them: a dark pill for each button (A
 * green, B red, Z purple, C yellow), the Control Stick as a little stick,
 * three dots, then what it does. */
static void hint_stick(float x, float cy, float d) {
	float r = d / 2, cx = x + r;
	gfx_circle(cx, cy + 1, r + 1, rgba(0, 0, 0, 150));
	gfx_circle(cx, cy, r, rgba(0x4a, 0x4a, 0x52, 255));
	gfx_circle(cx, cy, r * 0.78f, rgba(0x2a, 0x2a, 0x30, 255));
	float nr = d * 0.30f;
	gfx_circle(cx, cy + 1, nr, rgba(0, 0, 0, 128));
	for (int i = 4; i >= 0; i--)
		gfx_circle(cx, cy, nr * (i + 1) / 5.0f, (i & 1) ? rgba(0x9a, 0x9b, 0xa6, 255) : rgba(0xd6, 0xd7, 0xde, 255));
}

static float hint_one(const char *h, float x, float cy, bool draw) {
	char key[8] = "";
	const char *colon = strchr(h, ':');
	const char *label = colon ? colon + 1 : h;
	if (colon && colon - h < 7) { memcpy(key, h, colon - h); key[colon - h] = 0; }
	float w = 0;
	if (!strcmp(key, "S")) {
		if (draw) hint_stick(x, cy, 20);
		w = 20;
	} else if (key[0]) {
		const char *t = !strcmp(key, "ST") ? "START" : key;
		Color tc = rgba(0xd8, 0xda, 0xe6, 255), ring = rgba(255, 255, 255, 36);
		bool glow = false;
		if (!strcmp(key, "A")) { tc = rgba(0x5f, 0xe3, 0x9a, 255); ring = rgba(95, 227, 154, 97); glow = true; }
		if (!strcmp(key, "B")) { tc = rgba(0xff, 0x5c, 0x7c, 255); ring = rgba(255, 92, 124, 97); glow = true; }
		if (!strcmp(key, "Z")) { tc = rgba(0xb9, 0xa2, 0xff, 255); ring = rgba(185, 162, 255, 97); glow = true; }
		if (!strcmp(key, "C")) { tc = rgba(0xff, 0xd8, 0x3a, 255); ring = rgba(255, 216, 58, 97); glow = true; }
		if (!strcmp(key, "KB")) t = "Keyboard";
		float pw = gfx_text_width(t, 11) + 12;
		if (pw < 20) pw = 20;
		if (draw) {
			float y = cy - 10;
			if (glow) gfx_rrect_v(x - 2, y - 2, pw + 4, 24, 12, color_alpha(ring, 0.45f), color_alpha(ring, 0.45f));
			gfx_rrect_v(x, y, pw, 20, 10, rgba(0x3c, 0x3c, 0x46, 255), rgba(0x08, 0x08, 0x0a, 255));
			gfx_outline(x, y, pw, 20, 10, 1, ring);
			gfx_text(x + pw / 2, cy, t, 11, tc, 1, 0);
		}
		w = pw;
	}
	if (key[0]) {
		if (draw) for (int i = 0; i < 3; i++) gfx_circle(x + w + 4 + i * 4, cy + 1, 1.1f, rgba(0xc9, 0xcb, 0xd6, 255));
		w += 16;
	}
	if (draw) gfx_text(x + w, cy, label, 12, rgba(0xdf, 0xe4, 0xff, 255), 0, 0);
	return w + gfx_text_width(label, 12);
}

void gfx_hints(const char hints[][48], int n, float y) {
	if (n <= 0) return;
	float W = gfx_width(), total = 0, gap = 30, maxw = W - 60;
	for (int i = 0; i < n; i++) total += hint_one(hints[i], 0, 0, false);
	if (n > 1 && total + gap * (n - 1) > maxw) gap = fmaxf(10, (maxw - total) / (n - 1));
	float x = W / 2 - (total + gap * (n - 1)) / 2;
	for (int i = 0; i < n; i++) x += hint_one(hints[i], x, y, true) + gap;
}

/* ------------------------------------------------------------- the pointer
 * CubeBrowser's: an arrow (white, edged in the System look's indigo) with a
 * soft shadow; it dips a little while A is held, and a gold glow pulses
 * round it over something it can click. */
void gfx_pointer(float x, float y, float press, float hover) {
	if (hover > 0.01f) {
		float pulse = 0.5f + 0.5f * sinf(frames * 0.1f);
		gfx_circle(x, y, 9 + 3 * pulse, color_alpha(C_GOLD, 0.45f * hover));
	}
	float s = 1.0f - press * 0.15f;
	for (int pass = 0; pass < 3; pass++) {
		float ox = pass == 0 ? 3 : 0, oy = pass == 0 ? 4 : 0, grow = pass == 2 ? 0 : 2.2f;
		Color c = pass == 0 ? rgba(0, 0, 0, 128) : (pass == 1 ? rgba(42, 34, 140, 255) : rgba(255, 255, 255, 255));
		float bx = x + ox, by = y + oy;
		gfx_tri(bx - grow * 0.6f, by - grow * 1.6f, bx - grow * 0.6f, by + (22 + grow * 1.4f) * s,
		        bx + (17 + grow * 1.7f) * s, by + (16 + grow * 0.6f) * s, c);
		gfx_line(bx + 7 * s, by + 15 * s, bx + 12 * s, by + 26 * s, 5 + grow * 1.8f, c);
	}
}
