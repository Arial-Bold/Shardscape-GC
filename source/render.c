/* render.c - see render.h */
#include "render.h"
#include "canvas.h"
#include "gfx.h"
#include <gccore.h>
#include <malloc.h>
#include <stdlib.h>
#include <string.h>

typedef struct { float x, y, size; u32 c; int align, baseline, off; } RText;
typedef struct {
	void *dl; u32 dl_len, dl_cap;     /* the triangles, as a display list */
	unsigned ver; int have;
	float sx, tx, ty; int clip[4], visible;
	RText *t; int nt, capt;
	char *pool; int pool_n, pool_cap;
} RLayer;
static RLayer rl[CV_LAYERS];

#define CHUNK 65532   /* triangles per GX_Begin (a multiple of 3, under 65536) */

static void build_dl(RLayer *R, const CLayer *L) {
	int nv = L->nv - L->nv % 3;
	if (nv <= 0) { R->dl_len = 0; return; }
	int chunks = (nv + CHUNK - 1) / CHUNK;
	u32 need = (u32)nv * 12 + (u32)chunks * 3 + 128;   /* (the write-gather pipe needs 63 bytes' slack) */
	need = (need + 31) & ~31u;
	if (need > R->dl_cap) {
		free(R->dl);
		R->dl = memalign(32, need);
		R->dl_cap = R->dl ? need : 0;
		if (!R->dl) { R->dl_len = 0; return; }
	}
	gfx_desc_color_only();
	DCInvalidateRange(R->dl, R->dl_cap);
	GX_BeginDispList(R->dl, R->dl_cap);
	for (int base = 0; base < nv; base += CHUNK) {
		int n = nv - base; if (n > CHUNK) n = CHUNK;
		GX_Begin(GX_TRIANGLES, GX_VTXFMT1, (u16)n);
		const CVert *v = L->v + base;
		for (int i = 0; i < n; i++) {
			u32 c = v[i].c;
			GX_Position2f32(v[i].x, v[i].y);
			GX_Color4u8(c & 255, (c >> 8) & 255, (c >> 16) & 255, c >> 24);
		}
		GX_End();
	}
	R->dl_len = GX_EndDispList();   /* (0 if it didn't fit: then nothing is drawn rather than something broken) */
	gfx_desc_full();
}

static void copy_text(RLayer *R, const CLayer *L) {
	R->nt = 0; R->pool_n = 0;
	if (L->nt > R->capt) {
		RText *t = realloc(R->t, sizeof(RText) * L->nt);
		if (!t) return;
		R->t = t; R->capt = L->nt;
	}
	for (int i = 0; i < L->nt; i++) {
		const CText *s = &L->t[i];
		int len = (int)strlen(s->s) + 1;
		if (R->pool_n + len > R->pool_cap) {
			int cap = R->pool_cap ? R->pool_cap * 2 : 4096;
			while (cap < R->pool_n + len) cap *= 2;
			char *p = realloc(R->pool, cap);
			if (!p) return;
			R->pool = p; R->pool_cap = cap;
		}
		memcpy(R->pool + R->pool_n, s->s, len);
		R->t[R->nt++] = (RText){ s->x, s->y, s->size, s->c, s->align, s->baseline, R->pool_n };
		R->pool_n += len;
	}
}

void render_sync(void) {
	for (int i = 0; i < CV_LAYERS; i++) {
		const CLayer *L = &cv_layers[i];
		RLayer *R = &rl[i];
		R->sx = L->sx; R->tx = L->tx; R->ty = L->ty; R->visible = L->visible;
		memcpy(R->clip, L->clip, sizeof(R->clip));
		if (R->have && R->ver == L->ver) continue;
		build_dl(R, L);
		copy_text(R, L);
		R->ver = L->ver; R->have = 1;
	}
}

static Color col(u32 c) { return rgba(c & 255, (c >> 8) & 255, (c >> 16) & 255, c >> 24); }

void render_layers(void) {
	for (int i = 0; i < CV_LAYERS; i++) {
		RLayer *R = &rl[i];
		if (!R->have || !R->visible || (!R->dl_len && !R->nt)) continue;
		if (R->clip[2] > 0) gfx_scissor(R->clip[0], R->clip[1], R->clip[2], R->clip[3]); else gfx_scissor_off();
		if (R->dl_len) {
			gfx_mode_color();
			gfx_desc_color_only();
			gfx_layer_matrix(R->sx, R->tx, R->ty);
			GX_CallDispList(R->dl, R->dl_len);
			gfx_identity();
			gfx_desc_full();
		}
		for (int k = 0; k < R->nt; k++) {
			const RText *t = &R->t[k];
			float size = t->size * R->sx;
			if (size < 5) continue;
			const char *s = R->pool + t->off;
			float x = t->x * R->sx + R->tx, y = t->y * R->sx + R->ty;
			if (t->align) { float w = gfx_text_width(s, size); x -= t->align == 1 ? w / 2 : w; }
			if (t->baseline == 1) y += size * 0.36f; else if (t->baseline == 2) y += size * 0.8f; else if (t->baseline == 3) y -= size * 0.2f;
			Color c = col(t->c);
			gfx_text_base(x + 1, y + 1, s, size, rgba(0, 0, 0, (u8)(c.a * 0.55f)));
			gfx_text_base(x, y, s, size, c);
		}
	}
	gfx_scissor_off();
}
