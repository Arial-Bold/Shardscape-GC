/* osk.c - see osk.h */
#include "osk.h"
#include "gfx.h"
#include "input.h"
#include "gckbd.h"
#include <math.h>
#include <stdio.h>
#include <string.h>
#include <ogc/mutex.h>

static mutex_t lock = LWP_MUTEX_NULL;
static void L(void) { if (lock == LWP_MUTEX_NULL) LWP_MutexInit(&lock, false); LWP_MutexLock(lock); }
static void U(void) { LWP_MutexUnlock(lock); }

static volatile bool open_;
static char title[160], text[128];
static int maxlen, result;   /* result: 0 none yet, 1 entered, -1 cancelled */
static char result_text[128];
static int fr, fc;           /* the key with the gold ring */
static bool caps;

#define ROWS 5
#define COLS 10
static const char *const keys[4] = { "1234567890", "qwertyuiop", "asdfghjkl-", "zxcvbnm.:_" };
enum { K_SHIFT = -1, K_SPACE = -2, K_DEL = -3, K_DONE = -4 };
static int bottom_key(int c) { return c < 2 ? K_SHIFT : c < 6 ? K_SPACE : c < 8 ? K_DEL : K_DONE; }

void osk_open(const char *t, const char *initial, int ml, int kind) {
	L();
	snprintf(title, sizeof(title), "%s", t ? t : "");
	snprintf(text, sizeof(text), "%s", initial ? initial : "");
	maxlen = ml > 0 && ml < (int)sizeof(text) ? ml : (int)sizeof(text) - 1;
	result = 0;
	caps = kind == 0 && !text[0];
	fr = kind == 0 ? 1 : 0; fc = 0;
	open_ = true;
	U();
	input_game_block(true);
}
bool osk_is_open(void) { return open_; }
int osk_poll(char *out, int cap) {
	L();
	int r = result;
	if (r) { if (r > 0) snprintf(out, cap, "%s", result_text); result = 0; }
	U();
	return r;
}

static void finish(int r) {
	L();
	result = r;
	snprintf(result_text, sizeof(result_text), "%s", text);
	open_ = false;
	U();
	input_game_block(false);
}
static void type_char(char ch) {
	size_t n = strlen(text);
	if ((int)n >= maxlen || (unsigned char)ch < 32) return;
	text[n] = ch; text[n + 1] = 0;
}
static void backspace(void) { size_t n = strlen(text); if (n) text[n - 1] = 0; }

static void press(int r, int c) {
	if (r < 4) {
		char ch = keys[r][c];
		if (caps && ch >= 'a' && ch <= 'z') ch = ch - 'a' + 'A';
		type_char(ch);
		if (caps && r > 0 && text[1] == 0) caps = false;   /* (a capital to start a name, then small letters) */
		return;
	}
	switch (bottom_key(c)) {
	case K_SHIFT: caps = !caps; break;
	case K_SPACE: type_char(' '); break;
	case K_DEL: backspace(); break;
	case K_DONE: finish(1); break;
	}
}

/* geometry */
#define KW 48
#define KH 32
#define GAP 6
#define PANEL_W (COLS * KW + (COLS - 1) * GAP + 32)
#define PANEL_H 312
static float pxl(void) { return gfx_width() / 2 - PANEL_W / 2; }
#define PYT 36
static float key_x(int c) { return pxl() + 16 + c * (KW + GAP); }
static float key_y(int r) { return PYT + 112 + r * (KH + GAP); }
static void key_rect(int r, int c, float *x, float *y, float *w) {
	*y = key_y(r);
	if (r < 4) { *x = key_x(c); *w = KW; return; }
	int k = bottom_key(c), c0 = k == K_SHIFT ? 0 : k == K_SPACE ? 2 : k == K_DEL ? 6 : 8, span = k == K_SPACE ? 4 : 2;
	*x = key_x(c0); *w = span * KW + (span - 1) * GAP;
}

void osk_update(void) {
	if (!open_) return;
	/* the keyboard controller */
	kb_update();
	KbEvent e;
	while (kb_next(&e)) {
		if (e.key == KB_CHAR) type_char(e.ch);
		else if (e.key == KB_BACKSPACE || e.key == KB_DELETE) backspace();
		else if (e.key == KB_ENTER) { finish(1); return; }
		else if (e.key == KB_ESC) { finish(-1); return; }
	}
	kb_clear();
	u32 down = input_down();
	/* the pointer: the key under it */
	float x = input_px(), y = input_py();
	int ur = -1, uc = -1;
	for (int r = 0; r < ROWS && ur < 0; r++)
		for (int c = 0; c < COLS; c++) {
			float kx, ky, kw; key_rect(r, c, &kx, &ky, &kw);
			if (x >= kx && x <= kx + kw && y >= ky && y <= ky + KH) { ur = r; uc = c; break; }
		}
	if (input_pointer_moved() && ur >= 0) { fr = ur; fc = uc; }
	if (input_repeat(PAD_BUTTON_UP)) fr = (fr + ROWS - 1) % ROWS;
	if (input_repeat(PAD_BUTTON_DOWN)) fr = (fr + 1) % ROWS;
	if (input_repeat(PAD_BUTTON_LEFT)) {
		if (fr == 4) { int k = bottom_key(fc); fc = k == K_SHIFT ? 8 : k == K_SPACE ? 0 : k == K_DEL ? 2 : 6; }
		else fc = (fc + COLS - 1) % COLS;
	}
	if (input_repeat(PAD_BUTTON_RIGHT)) {
		if (fr == 4) { int k = bottom_key(fc); fc = k == K_SHIFT ? 2 : k == K_SPACE ? 6 : k == K_DEL ? 8 : 0; }
		else fc = (fc + 1) % COLS;
	}
	if (input_repeat(PAD_BUTTON_A)) press(fr, fc);
	if (!open_) return;
	if (input_repeat(PAD_BUTTON_B)) { if (text[0]) backspace(); else { finish(-1); return; } }
	if (input_repeat(PAD_BUTTON_X)) type_char(' ');
	if (down & PAD_BUTTON_Y) caps = !caps;
	if (down & PAD_TRIGGER_Z) { finish(-1); return; }
	if (down & PAD_BUTTON_START) finish(1);
}

static int wrap2(const char *s, float size, float w, char out[2][160]) {
	int n = 0; const char *p = s;
	while (*p && n < 2) {
		const char *best = NULL, *q = p; char tmp[160];
		while (1) {
			const char *e = q; while (*e && *e != ' ') e++;
			size_t len = (size_t)(e - p); if (len >= sizeof(tmp)) break;
			memcpy(tmp, p, len); tmp[len] = 0;
			if (gfx_text_width(tmp, size) > w && best) break;
			best = e; if (!*e) break; q = e + 1;
		}
		if (!best) best = p + strlen(p);
		size_t len = (size_t)(best - p); if (len > 159) len = 159;
		memcpy(out[n], p, len); out[n][len] = 0; n++;
		p = best; while (*p == ' ') p++;
	}
	return n;
}

void osk_draw(void) {
	if (!open_) return;
	float W = gfx_width();
	gfx_rect(-200, -100, W + 400, 700, rgba(0, 0, 0, 150));
	float px = pxl(), py = PYT;
	gfx_panel(px, py, PANEL_W, PANEL_H);
	char lines[2][160];
	int n = wrap2(title, 13, PANEL_W - 32, lines);
	for (int i = 0; i < n; i++) gfx_text(px + 16, py + 18 + i * 17, lines[i], 13, C_TITLE, 0, PANEL_W - 32);
	/* the text box */
	float fy = py + 58, fw = PANEL_W - 32;
	gfx_rrect_v(px + 16, fy, fw, 36, 3, rgba(11, 15, 18, 255), rgba(18, 24, 28, 255));
	gfx_outline(px + 16, fy, fw, 36, 3, 1, rgba(215, 225, 240, 153));
	char shown[132];
	snprintf(shown, sizeof(shown), "%s", text);
	float tw = gfx_text_width(shown, 16);
	while (tw > fw - 30 && shown[0]) { memmove(shown, shown + 1, strlen(shown)); tw = gfx_text_width(shown, 16); }
	gfx_text(px + 28, fy + 18, shown, 16, C_TEXT, 0, 0);
	if ((gfx_frames() / 30) & 1) gfx_rect(px + 30 + tw, fy + 8, 2, 20, C_GOLD);
	/* the keys */
	for (int r = 0; r < ROWS; r++)
		for (int c = 0; c < COLS; c++) {
			if (r == 4 && c != 0 && c != 2 && c != 6 && c != 8) continue;
			float kx, ky, kw; key_rect(r, c, &kx, &ky, &kw);
			bool focus = r == fr && (r < 4 ? c == fc : bottom_key(c) == bottom_key(fc));
			bool done = r == 4 && bottom_key(c) == K_DONE;
			if (done) { gfx_rect_v(kx, ky, kw, KH, C_GOLD_HI, C_GOLD); gfx_outline(kx, ky, kw, KH, 2, 1, rgba(106, 90, 16, 230)); }
			else gfx_frost(kx, ky, kw, KH);
			if (r == 4 && bottom_key(c) == K_SHIFT && caps) gfx_outline(kx + 1, ky + 1, kw - 2, KH - 2, 2, 1, C_GOLD);
			if (focus) gfx_gold_ring(kx, ky, kw, KH);
			char lab[12];
			if (r < 4) { char ch = keys[r][c]; if (caps && ch >= 'a' && ch <= 'z') ch = ch - 'a' + 'A'; lab[0] = ch; lab[1] = 0; }
			else snprintf(lab, sizeof(lab), "%s", bottom_key(c) == K_SHIFT ? "Shift" : bottom_key(c) == K_SPACE ? "Space" : bottom_key(c) == K_DEL ? "Delete" : "Done");
			gfx_text(kx + kw / 2, ky + KH / 2, lab, r < 4 ? 15 : 13, done ? rgba(26, 22, 8, 255) : C_TEXT, 1, 0);
		}
}
