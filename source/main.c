/****************************************************************************
* Shardscape for GameCube
*
* A hex-terrain skirmish game, made by a friend for Windows, macOS and the
* PS Vita; this is the GameCube version. The game itself is the same
* JavaScript as the other versions (engine.js), with a GameCube interface
* (gc_ui.js) and a relay for hosting games (gc_server.js), run in QuickJS.
*
* Two threads:
*   the interface thread (this one): the video, the controllers, the
*     pointer, Settings and the keyboard; it draws every frame from its own
*     copies of the game's layers (render.c), so the picture and the pointer
*     keep moving even while a bot is thinking
*   the game thread: runs the game's scripts, a frame at a time, on a big
*     stack, holding the game lock while it does
****************************************************************************/
#include <gccore.h>
#include <ogc/lwp_watchdog.h>
#include <malloc.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "app.h"
#include "canvas.h"
#include "dolload.h"
#include "gfx.h"
#include "input.h"
#include "jsapi.h"
#include "netws.h"
#include "osk.h"
#include "platform.h"
#include "render.h"
#include "settings.h"
#include "net/net.h"
#include "net/storage.h"

const char app_version[] = "1.0";

/* the game's scripts, built into the program (see the Makefile) */
extern const u8 stubs_js[], engine_js[], gc_server_js[], gc_ui_js[];
extern const u32 stubs_js_size, engine_js_size, gc_server_js_size, gc_ui_js_size;

static mutex_t game_lock = LWP_MUTEX_NULL;   /* held while the scripts run */
static mutex_t ui_lock = LWP_MUTEX_NULL;     /* the hints and the pointer's state */
static volatile bool exit_requested, video_changed, game_running, game_started, game_failed;
static lwp_t game_thread = LWP_THREAD_NULL;

static char hints[8][48];
static int nhints;
static volatile bool ptr_shown, ptr_hover;
static float hover_anim;
static char log_tail[6][160];   /* the last few lines logged, shown if the game can't start */
static int log_n;

void app_request_exit(void) { exit_requested = true; }
void app_video_changed(void) { video_changed = true; }

/* ============================================================ platform */

double plat_time_ms(void) { return ticks_to_microsecs(gettime()) / 1000.0; }

char *plat_read_file(const char *path, size_t *len) {
	size_t n = 0;
	char *d = storage_ok() ? storage_read(path, &n) : NULL;
	if (len) *len = n;
	return d;
}
int plat_write_file(const char *path, const char *data, size_t len) {
	return storage_ok() && storage_write_atomic(path, data, len);
}
void plat_log(const char *s) {
	LWP_MutexLock(ui_lock);
	snprintf(log_tail[log_n % 6], sizeof(log_tail[0]), "%s", s);
	log_n++;
	LWP_MutexUnlock(ui_lock);
	if (!storage_ok()) return;
	char path[300];
	storage_path(path, sizeof(path), "log.txt");
	FILE *f = fopen(path, "a");
	if (f) { fprintf(f, "%s\n", s); fclose(f); }
}
float plat_text_width(const char *s, float size) { return gfx_text_width(s, size); }
void plat_ime_open(const char *title, const char *initial, int maxlen, int kind) { osk_open(title, initial, maxlen, kind); }
int plat_ime_poll(char *out, int cap) { return osk_poll(out, cap); }
const char *plat_ip(void) { return net_state() == NET_UP ? net_ip() : ""; }
int plat_confirm_is_circle(void) { return 0; }
const char *plat_data_dir(void) {
	static char d[280];
	snprintf(d, sizeof(d), "%s/", storage_app_dir());
	return d;
}
const char *plat_app_dir(void) { return ""; }
void plat_request_exit(void) { app_request_exit(); }
void plat_snapshot(const char *path) { (void)path; }
void plat_cfg(PlatCfg *c) {
	AppSettings s = settings_get();
	c->wide = s.video.widescreen;
	snprintf(c->detail, sizeof(c->detail), "%s", s.detail);
	snprintf(c->bot_speed, sizeof(c->bot_speed), "%s", s.bot_speed);
}
void plat_set_cfg(const char *key, const char *val) { settings_set_value(key, val); }
void plat_hints(const char *const *h, int n) {
	LWP_MutexLock(ui_lock);
	nhints = n > 8 ? 8 : n;
	for (int i = 0; i < nhints; i++) snprintf(hints[i], sizeof(hints[i]), "%s", h[i]);
	LWP_MutexUnlock(ui_lock);
}
void plat_pointer_show(int on) { ptr_shown = on; }
void plat_pointer_hover(int on) { ptr_hover = on; }
void plat_settings_open(void) { settings_open(); }
int plat_settings_is_open(void) { return settings_is_open(); }
const char *plat_net_message(void) { return net_state() == NET_FAILED ? net_message() : ""; }

/* ======================================================== the game thread */

static void *game_main(void *arg) {
	(void)arg;
	const JsSource src[] = {
		{ "stubs.js", (const char *)stubs_js, stubs_js_size },
		{ "engine.js", (const char *)engine_js, engine_js_size },
		{ "gc_server.js", (const char *)gc_server_js, gc_server_js_size },
		{ "gc_ui.js", (const char *)gc_ui_js, gc_ui_js_size },
	};
	LWP_MutexLock(game_lock);
	bool ok = js_start_mem(src, 4, 10u * 1024 * 1024);
	LWP_MutexUnlock(game_lock);
	if (!ok) { game_failed = true; return NULL; }
	game_started = true;
	u32 last = gfx_frames();
	while (game_running) {
		/* a frame of the game for each frame of the picture, at most */
		while (gfx_frames() == last && game_running) usleep(1000);
		last = gfx_frames();
		JsInput in;
		input_game_take(&in);
		LWP_MutexLock(game_lock);
		int keep = js_frame(&in);
		LWP_MutexUnlock(game_lock);
		if (!keep) { app_request_exit(); break; }
	}
	return NULL;
}

/* =================================================== Exit to Launcher */

#define PSOSDLOADID 0x7c6000a6   /* the PSO SD loader's mark at 0x80001800 */

void dol_before_jump(void) {
	gfx_shutdown();
}

static void exit_to_launcher(void) {
	char err[200];
	const char *name = settings_launcher_current();
	if (name[0]) {
		char path[80];
		snprintf(path, sizeof(path), "sd:/%s", name);
		dol_launch(path, err, sizeof(err));
		plat_log(err);   /* only gets here if it couldn't be started */
	}
	int *psoid = (int *)0x80001800;
	if (psoid[0] == PSOSDLOADID) {
		dol_before_jump();
		((void (*)(void))0x80001800)();
	}
	dol_before_jump();
	SYS_ResetSystem(SYS_HOTRESET, 0, 0);
}

/* ===================================================== the interface */

static void draw_loading(void) {
	float c = gfx_width() / 2;
	gfx_text(c, 220, "Shardscape", 24, C_TEXT, 1, 0);
	if (game_failed) {
		gfx_text(c, 254, "Shardscape couldn't start. The log beside the app (log.txt) says why:", 13, rgba(255, 92, 124, 255), 1, 0);
		LWP_MutexLock(ui_lock);
		int first = log_n > 6 ? log_n - 6 : 0;
		for (int i = first, y = 280; i < log_n; i++, y += 18) gfx_text(c, y, log_tail[i % 6], 11, C_SOFT, 1, gfx_width() - 60);
		LWP_MutexUnlock(ui_lock);
	} else if ((gfx_frames() / 20) % 4) {
		gfx_text(c, 254, "Setting up the battlefield\x85", 13, C_SOFT, 1, 0);
	}
}

static void draw_hints(void) {
	char h[8][48];
	int n;
	if (settings_is_open()) {
		n = 3;
		snprintf(h[0], 48, "S:Point"); snprintf(h[1], 48, "A:Change"); snprintf(h[2], 48, "B:Close");
	} else if (osk_is_open()) {
		n = 5;
		snprintf(h[0], 48, "A:Type"); snprintf(h[1], 48, "B:Delete"); snprintf(h[2], 48, "X:Space");
		snprintf(h[3], 48, "Z:Cancel"); snprintf(h[4], 48, "ST:Done");
	} else if (game_failed) {
		n = 1; snprintf(h[0], 48, "B:Exit to Launcher");
	} else {
		LWP_MutexLock(ui_lock);
		n = nhints;
		memcpy(h, hints, sizeof(h));
		LWP_MutexUnlock(ui_lock);
	}
	float W = gfx_width();
	gfx_rect_v(-200, 440, W + 400, 60, rgba(4, 4, 6, 210), rgba(4, 4, 6, 235));
	gfx_rect(-200, 440, W + 400, 1, rgba(200, 210, 230, 50));
	gfx_hints((const char (*)[48])h, n, 460);
}

int main(int argc, char **argv) {
	LWP_MutexInit(&game_lock, false);
	LWP_MutexInit(&ui_lock, false);
	storage_init();
	if (argc > 0 && argv && argv[0]) storage_set_program(argv[0]);
	settings_load();
	AppSettings s = settings_get();
	gfx_init(&s.video);
	input_init();
	net_start();
	ws_global_init();
	cv_text_width = plat_text_width;
	cv_init();
	LWP_SetThreadPriority(LWP_GetSelf(), 80);   /* the picture and the controls come first */

	/* the game runs on a big stack: QuickJS and the bots recurse deeply */
	game_running = true;
	const u32 stack = 1024 * 1024;
	void *stack_mem = memalign(32, stack);
	LWP_CreateThread(&game_thread, game_main, NULL, stack_mem, stack, 40);

	while (!exit_requested) {
		s = settings_get();
		input_update(gfx_width(), s.pointer_speed);
		if (settings_is_open()) settings_update();
		else if (osk_is_open()) osk_update();
		else if (game_failed && (input_down() & PAD_BUTTON_B)) app_request_exit();
		if (video_changed) { video_changed = false; AppSettings now = settings_get(); gfx_set_video(&now.video); }

		/* the game's layers: picked up whenever the game isn't in the middle of a frame */
		if (LWP_MutexTryLock(game_lock) == 0) {
			render_sync();
			LWP_MutexUnlock(game_lock);
		}

		gfx_begin();
		gfx_backdrop();
		if (game_started) render_layers(); else draw_loading();
		draw_hints();
		settings_draw();
		osk_draw();
		bool modal = settings_is_open() || osk_is_open();
		hover_anim += (((ptr_hover && !modal) ? 1.0f : 0.0f) - hover_anim) * 0.25f;
		if (ptr_shown || modal || game_failed) gfx_pointer(input_px(), input_py(), input_press(), hover_anim);
		gfx_end();
	}

	/* leaving: the game stops first (an offline game saves itself as it goes) */
	game_running = false;
	if (game_thread != LWP_THREAD_NULL) LWP_JoinThread(game_thread, NULL);
	settings_save();
	exit_to_launcher();
	return 0;
}
