/* settings.c - see settings.h. The screen and the rows are BrainBox's. */
#include "settings.h"
#include "input.h"
#include "app.h"
#include "net/storage.h"
#include <dirent.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <ogc/lwp_watchdog.h>
#include <ogc/mutex.h>

static AppSettings set = { { RES_AUTO, 0, 1, 0 }, 4, "auto", "normal", "" };
static mutex_t lock = LWP_MUTEX_NULL;
static void L(void) { if (lock == LWP_MUTEX_NULL) LWP_MutexInit(&lock, false); LWP_MutexLock(lock); }
static void U(void) { LWP_MutexUnlock(lock); }

AppSettings settings_get(void) { L(); AppSettings s = set; U(); return s; }

static const char *res_name(int r) { return r == RES_480I ? "480i" : r == RES_480P ? "480p" : "Auto"; }
static int clampi(int v, int lo, int hi) { return v < lo ? lo : v > hi ? hi : v; }

void settings_load(void) {
	char path[300];
	storage_path(path, sizeof(path), "shardscape.ini");
	size_t n;
	char *d = storage_ok() ? storage_read(path, &n) : NULL;
	if (!d) return;
	L();
	for (char *line = strtok(d, "\n"); line; line = strtok(NULL, "\n")) {
		char *eq = strchr(line, '=');
		if (!eq) continue;
		*eq = 0;
		char *k = line, *v = eq + 1, *cr = strchr(v, '\r');
		if (cr) *cr = 0;
		if (!strcmp(k, "video.resolution")) set.video.resolution = !strcmp(v, "480i") ? RES_480I : !strcmp(v, "480p") ? RES_480P : RES_AUTO;
		else if (!strcmp(k, "video.screen")) set.video.widescreen = !strcmp(v, "16:9");
		else if (!strcmp(k, "video.width")) set.video.full_width = strcmp(v, "standard") != 0;
		else if (!strcmp(k, "video.overscan")) set.video.overscan = clampi(atoi(v), 0, 10);
		else if (!strcmp(k, "pointer.speed")) set.pointer_speed = clampi(atoi(v), 1, 10);
		else if (!strcmp(k, "board.detail") && (!strcmp(v, "auto") || !strcmp(v, "high") || !strcmp(v, "low"))) snprintf(set.detail, sizeof(set.detail), "%s", v);
		else if (!strcmp(k, "bots.speed") && (!strcmp(v, "slow") || !strcmp(v, "normal") || !strcmp(v, "fast"))) snprintf(set.bot_speed, sizeof(set.bot_speed), "%s", v);
		else if (!strcmp(k, "launcher")) snprintf(set.launcher, sizeof(set.launcher), "%s", v);
	}
	U();
	free(d);
}

void settings_save(void) {
	if (!storage_ok()) return;
	AppSettings s = settings_get();
	char t[700], path[300];
	snprintf(t, sizeof(t),
	         "# Shardscape settings (Settings in the game changes these)\n"
	         "video.resolution=%s\nvideo.screen=%s\nvideo.width=%s\nvideo.overscan=%d\n"
	         "pointer.speed=%d\nboard.detail=%s\nbots.speed=%s\nlauncher=%s\n",
	         s.video.resolution == RES_480I ? "480i" : s.video.resolution == RES_480P ? "480p" : "auto",
	         s.video.widescreen ? "16:9" : "4:3", s.video.full_width ? "full" : "standard", s.video.overscan,
	         s.pointer_speed, s.detail, s.bot_speed, s.launcher);
	storage_path(path, sizeof(path), "shardscape.ini");
	storage_write_atomic(path, t, strlen(t));
}

void settings_set_value(const char *key, const char *val) {
	L();
	if (!strcmp(key, "botSpeed")) snprintf(set.bot_speed, sizeof(set.bot_speed), "%s", val);
	else if (!strcmp(key, "detail")) snprintf(set.detail, sizeof(set.detail), "%s", val);
	U();
	settings_save();
}

/* --------------------------------------------------------- the Launcher */

static int cmp_name(const void *a, const void *b) { return strcasecmp((const char *)a, (const char *)b); }
static int launcher_list(char (*names)[64], int max) {
	int n = 0;
	if (!storage_ok()) return 0;
	DIR *d = opendir("sd:/");
	if (!d) return 0;
	struct dirent *ent;
	while ((ent = readdir(d)) && n < max) {
		size_t l = strlen(ent->d_name);
		if (ent->d_name[0] == '.' || l < 5 || l >= 64 || strcasecmp(ent->d_name + l - 4, ".dol")) continue;
		char path[80];
		snprintf(path, sizeof(path), "sd:/%s", ent->d_name);
		if (!storage_is_file(path)) continue;
		snprintf(names[n++], 64, "%s", ent->d_name);
	}
	closedir(d);
	qsort(names, n, 64, cmp_name);
	return n;
}

const char *settings_launcher_current(void) {
	static char names[48][64];
	static const char *const usual[] = { "autoexec.dol", "boot.dol", "ipl.dol" };
	int n = launcher_list(names, 48);
	AppSettings s = settings_get();
	if (s.launcher[0])
		for (int i = 0; i < n; i++) if (!strcasecmp(names[i], s.launcher)) return names[i];
	for (unsigned u = 0; u < sizeof(usual) / sizeof(usual[0]); u++)
		for (int i = 0; i < n; i++) if (!strcasecmp(names[i], usual[u])) return names[i];
	for (int i = 0; i < n; i++) if (!strncasecmp(names[i], "swiss", 5)) return names[i];
	return "";
}

/* ------------------------------------------------------------ the screen */

enum { S_RES, S_SCREEN, S_WIDTH, S_OVERSCAN, S_POINTER, S_DETAIL, S_BOTS, S_LAUNCHER, S_EXIT, S_ROWS };
static const char *const help[S_ROWS][2] = {
	{ "Resolution", "Auto picks 480p when a component cable is connected." },
	{ "Screen", "Choose 16:9 if your TV stretches the picture to fill the screen. The game's layout changes to fit." },
	{ "Picture width", "Full fills the width of the TV picture. Standard leaves a border." },
	{ "Overscan", "Pulls everything in from the edges if your TV cuts them off." },
	{ "Pointer speed", "How fast the Control Stick moves the pointer." },
	{ "Board detail", "Low draws big boards faster. Auto uses low detail on Huge and Epic boards." },
	{ "Bot speed", "How long the bots pause between moves, so you can follow them." },
	{ "Launcher", "The program at the root of the SD card that Exit to Launcher starts." },
	{ "Exit to Launcher", "Leaves Shardscape. Offline games are saved, so you can continue later." },
};
static volatile bool open_;
static int row;
static int confirm_old = -1;
static u64 confirm_until;
static char status1[120], status2[160];
static char launcher_shown[72];
static AppSettings before;

static u64 now_ms(void) { return ticks_to_millisecs(gettime()); }

bool settings_is_open(void) { return open_; }

void settings_open(void) {
	before = settings_get();
	row = 0; confirm_old = -1;
	status1[0] = 0;
	const char *l = settings_launcher_current();
	snprintf(launcher_shown, sizeof(launcher_shown), "%s", l[0] ? l : "\x02None on the SD card");
	input_game_block(true);
	open_ = true;
}

static void close_settings(void) {
	AppSettings now = settings_get();
	if (memcmp(&before, &now, sizeof(now))) settings_save();
	open_ = false;
	input_game_block(false);
}

static const char *row_value(int r, char *buf, size_t n) {
	AppSettings s = settings_get();
	switch (r) {
	case S_RES: return res_name(s.video.resolution);
	case S_SCREEN: return s.video.widescreen ? "16:9" : "4:3";
	case S_WIDTH: return s.video.full_width ? "Full" : "Standard";
	case S_OVERSCAN: if (s.video.overscan) snprintf(buf, n, "%d%%", s.video.overscan); else snprintf(buf, n, "Off"); return buf;
	case S_POINTER: snprintf(buf, n, "%d", s.pointer_speed); return buf;
	case S_DETAIL: return !strcmp(s.detail, "high") ? "High" : !strcmp(s.detail, "low") ? "Low (faster)" : "Auto";
	case S_BOTS: return !strcmp(s.bot_speed, "slow") ? "Slow" : !strcmp(s.bot_speed, "fast") ? "Fast" : "Normal";
	case S_LAUNCHER: return launcher_shown;
	default: return "";
	}
}
static const char *const row_label[S_ROWS] = { "Resolution", "Screen", "Picture width", "Overscan", "Pointer speed", "Board detail", "Bot speed", "Launcher", "Exit to Launcher" };

static void cycle(char *v, size_t n, const char *const *opts, int count, int d) {
	int i = 0;
	for (int k = 0; k < count; k++) if (!strcmp(v, opts[k])) i = k;
	snprintf(v, n, "%s", opts[(i + d + count) % count]);
}

static void change(int d, bool by_a) {
	L();
	switch (row) {
	case S_RES:
		confirm_old = set.video.resolution;
		set.video.resolution = (set.video.resolution + RES_COUNT + d) % RES_COUNT;
		confirm_until = now_ms() + 10000;
		break;
	case S_SCREEN: set.video.widescreen ^= 1; break;
	case S_WIDTH: set.video.full_width ^= 1; break;
	case S_OVERSCAN:
		set.video.overscan += d;
		if (set.video.overscan < 0) set.video.overscan = 0;
		if (set.video.overscan > 10) set.video.overscan = by_a ? 0 : 10;
		break;
	case S_POINTER:
		set.pointer_speed += d;
		if (set.pointer_speed < 1) set.pointer_speed = 1;
		if (set.pointer_speed > 10) set.pointer_speed = by_a ? 1 : 10;
		break;
	case S_DETAIL: { static const char *const o[] = { "auto", "high", "low" }; cycle(set.detail, sizeof(set.detail), o, 3, d); break; }
	case S_BOTS: { static const char *const o[] = { "slow", "normal", "fast" }; cycle(set.bot_speed, sizeof(set.bot_speed), o, 3, d); break; }
	case S_LAUNCHER: {
		U();
		static char names[48][64];
		int n = launcher_list(names, 48), cur = -1;
		if (n == 0) { snprintf(launcher_shown, sizeof(launcher_shown), "\x02None on the SD card"); return; }
		const char *now = settings_launcher_current();
		for (int i = 0; i < n; i++) if (!strcasecmp(names[i], now)) cur = i;
		cur = cur < 0 ? 0 : (cur + d + n) % n;
		L();
		snprintf(set.launcher, sizeof(set.launcher), "%s", names[cur]);
		snprintf(launcher_shown, sizeof(launcher_shown), "%s", names[cur]);
		break;
	}
	}
	U();
	if (row <= S_OVERSCAN) app_video_changed();
}

/* the panel's geometry, for drawing and for the pointer */
#define PW 480
#define PH 360
static float px0(void) { return gfx_width() / 2 - PW / 2; }
#define PY0 30
#define PITCH 26.5f
#define RH 25

void settings_update(void) {
	if (!open_) return;
	u32 down = input_down();
	if (confirm_old >= 0) {
		if (down & PAD_BUTTON_A) { confirm_old = -1; status1[0] = 0; return; }
		u64 now = now_ms();
		if (now >= confirm_until) {
			L(); set.video.resolution = confirm_old; U();
			confirm_old = -1; status1[0] = 0;
			app_video_changed();
			return;
		}
		snprintf(status1, sizeof(status1), "Can you see this picture?");
		snprintf(status2, sizeof(status2), "Going back to %s in %d\x85", res_name(confirm_old), (int)((confirm_until - now + 999) / 1000));
		return;
	}
	/* the pointer: the row under it is the chosen one */
	float x = input_px(), y = input_py(), px = px0();
	int under = -1;
	if (x >= px + 8 && x <= px + PW - 8) {
		int r = (int)floorf((y - (PY0 + 38)) / PITCH);
		if (r >= 0 && r < S_ROWS && y - (PY0 + 38) - r * PITCH <= RH) under = r;
	}
	if (input_pointer_moved() && under >= 0) row = under;
	if (input_repeat(PAD_BUTTON_UP)) row = (row + S_ROWS - 1) % S_ROWS;
	if (input_repeat(PAD_BUTTON_DOWN)) row = (row + 1) % S_ROWS;
	int d = 0;
	if (input_repeat(PAD_BUTTON_LEFT)) d = -1;
	if (input_repeat(PAD_BUTTON_RIGHT)) d = 1;
	if (down & (PAD_BUTTON_B | PAD_BUTTON_START)) { close_settings(); return; }
	bool by_a = false;
	if (down & PAD_BUTTON_A) {
		if (row == S_EXIT) { close_settings(); app_request_exit(); return; }
		d = 1; by_a = true;
		/* clicking the left arrow (with the pointer) steps back */
		if (under == row) {
			char buf[24];
			const char *v = row_value(row, buf, sizeof(buf));
			float right = px + PW - 20, vw = fminf(gfx_text_width(v, 14), 200), lx = right - 19 - vw - 10;
			if (v[0] && v[0] != 2 && x >= lx - 16 && x <= lx + 6) d = -1;
		}
	}
	if (d && row != S_EXIT) change(d, by_a);
}

static int wrap(const char *s, float size, float w, char out[][160], int max) {
	int n = 0;
	const char *p = s;
	while (*p && n < max) {
		const char *best = NULL, *q = p;
		char tmp[160];
		while (*q) {
			const char *e = q;
			while (*e && *e != ' ') e++;
			size_t len = (size_t)(e - p);
			if (len >= sizeof(tmp)) break;
			memcpy(tmp, p, len); tmp[len] = 0;
			if (gfx_text_width(tmp, size) > w && best) break;
			best = e;
			if (!*e) break;
			q = e + 1;
		}
		if (!best) best = p + strlen(p);
		size_t len = (size_t)(best - p);
		if (len >= 160) len = 159;
		memcpy(out[n], p, len); out[n][len] = 0;
		n++;
		p = best;
		while (*p == ' ') p++;
	}
	return n;
}

void settings_draw(void) {
	if (!open_) return;
	float W = gfx_width();
	gfx_rect(-200, -100, W + 400, 700, rgba(0, 0, 0, 150));
	float pw = PW, px = px0(), py = PY0, ph = PH;
	gfx_panel(px, py, pw, ph);
	gfx_text(px + 16, py + 17, "Settings", 15, C_TITLE, 0, 200);
	char ver[40];
	snprintf(ver, sizeof(ver), "Shardscape %s", app_version);
	gfx_text(px + pw - 16, py + 17, ver, 15, C_SOFT, 2, 220);
	gfx_rect(px + 10, py + 31, pw - 20, 1, rgba(200, 210, 230, 71));
	for (int i = 0; i < S_ROWS; i++) {
		float x = px + 8, y = py + 38 + i * PITCH, w = pw - 16, cy = y + RH / 2.0f;
		bool on = i == row;
		if (on) {
			gfx_rrect_v(x, y, w, RH, 3, rgba(140, 160, 180, 87), rgba(70, 90, 110, 56));
			gfx_grid_patch(x + 1, y + 1, w - 2, RH - 2, 7, 0.45f, -1, rgba(200, 235, 245, 51));
			gfx_outline(x, y, w, RH, 3, 1, rgba(215, 225, 240, 153));
		}
		gfx_text(px + 20, cy, row_label[i], 14, C_TEXT, 0, 230);
		char buf[24];
		const char *v = row_value(i, buf, sizeof(buf));
		float right = px + pw - 20;
		if (v[0] == 2) gfx_text(right, cy, v + 1, 14, C_TEXT, 2, 250);   /* information: no arrows */
		else if (v[0]) {                                                  /* a choice: between arrows */
			float vw = fminf(gfx_text_width(v, 14), 200);
			gfx_tri(right, cy, right - 9, cy - 7, right - 9, cy + 7, C_TEXT);
			gfx_text(right - 19, cy, v, 14, C_TEXT, 2, 200);
			float lx = right - 19 - vw - 10;
			gfx_tri(lx - 9, cy, lx, cy - 7, lx, cy + 7, C_TEXT);
		}
	}
	/* what the chosen setting does (or a question, like keeping a new resolution) */
	float dy = py + ph - 10 - 44, dx = px + 10, dw = pw - 20;
	gfx_outline(dx - 1, dy - 1, dw + 2, 46, 4, 1, rgba(11, 11, 32, 255));
	gfx_rrect_v(dx, dy, dw, 44, 3, rgba(0x2a, 0x22, 0x8c, 255), rgba(0x3b, 0x2c, 0xb6, 255));
	gfx_grid_patch(dx + 1, dy + 1, dw - 2, 42, 7, 0.30f, 1, rgba(190, 190, 255, 41));
	gfx_outline(dx, dy, dw, 44, 3, 1, rgba(175, 175, 255, 153));
	Color dc = rgba(0xec, 0xeb, 0xff, 255);
	if (status1[0]) {
		gfx_text(dx + 12, dy + 13, status1, 13, dc, 0, dw - 24);
		gfx_text(dx + 12, dy + 31, status2, 13, rgba(0xc9, 0xc6, 0xff, 255), 0, dw - 24);
	} else {
		static char lines[4][160];
		int n = wrap(help[row][1], 13, dw - 24, lines, 2);
		if (n == 1) gfx_text(dx + 12, dy + 22, lines[0], 13, dc, 0, 0);
		else for (int i = 0; i < n; i++) gfx_text(dx + 12, dy + 13 + i * 18, lines[i], 13, dc, 0, i == 1 ? dw - 24 : 0);
	}
}
