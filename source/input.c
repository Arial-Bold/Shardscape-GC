/* input.c - see input.h. The pointer physics are CubeBrowser's. */
#include "input.h"
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include <ogc/mutex.h>

static u32 held, prev_held, down;
static int sx, sy, csx, csy;
static float cx = 320, cy = 240;
static bool moved;
static u32 repeat_mask; static int repeat_timer;
static float press_anim;
static mutex_t lock = LWP_MUTEX_NULL;
/* what the game hasn't seen yet */
static u32 g_pressed; static bool g_moved, g_block;

void input_init(void) {
	PAD_Init();
	LWP_MutexInit(&lock, false);
}

static float stick_axis(int v) {
	const float dz = 12, accel = 5;
	float a = fabsf((float)v);
	if (a <= dz) return 0;
	float n = (a - dz) / (96.0f - dz);
	if (n > 1) n = 1;
	n = powf(n, 1.0f + accel * 0.22f);
	return v < 0 ? -n : n;
}

void input_update(float screen_w, int speed_setting) {
	PAD_ScanPads();
	prev_held = held;
	held = down = 0;
	s8 x = 0, y = 0, cx2 = 0, cy2 = 0;
	/* a controller on any port works (Bluetooth adapters may use any of them) */
	for (int c = 0; c < 4; c++) {
		held |= PAD_ButtonsHeld(c);
		down |= PAD_ButtonsDown(c);
		s8 a = PAD_StickX(c), b = PAD_StickY(c), d = PAD_SubStickX(c), e = PAD_SubStickY(c);
		if (abs(a) > abs(x)) x = a;
		if (abs(b) > abs(y)) y = b;
		if (abs(d) > abs(cx2)) cx2 = d;
		if (abs(e) > abs(cy2)) cy2 = e;
	}
	held &= 0x1F7F; down &= 0x1F7F;   /* the buttons, not the analog bits */
	sx = x; sy = y; csx = cx2; csy = cy2;

	static u32 last_retrace;
	u32 retrace = VIDEO_GetRetraceCount();
	float steps = last_retrace ? (float)(retrace - last_retrace) : 1.0f;
	last_retrace = retrace;
	if (steps < 1) steps = 1;
	if (steps > 4) steps = 4;   /* after a long stall, don't jump across the screen */

	float ax = stick_axis(sx), ay = stick_axis(sy);
	moved = ax != 0 || ay != 0;
	if (moved) {
		if (speed_setting < 1) speed_setting = 1; if (speed_setting > 10) speed_setting = 10;
		float speed = 3.1f + (speed_setting - 1) * ((26.0f - 3.1f) / 9.0f);
		cx += ax * speed * steps;
		cy -= ay * speed * steps;   /* stick up = positive Y */
	}
	if (cx < 0) cx = 0; if (cx > screen_w - 1) cx = screen_w - 1;
	if (cy < 0) cy = 0; if (cy > 479) cy = 479;

	if (held != prev_held) { repeat_mask = held; repeat_timer = 0; } else repeat_timer++;
	float target = (held & PAD_BUTTON_A) ? 1.0f : 0.0f;
	press_anim += (target - press_anim) * 0.4f;

	LWP_MutexLock(lock);
	if (!g_block) { g_pressed |= down; if (moved) g_moved = true; }
	LWP_MutexUnlock(lock);
}

u32 input_held(void) { return held; }
u32 input_down(void) { return down; }
bool input_repeat(u32 mask) {
	if (down & mask) return true;
	if (!(held & mask) || !(repeat_mask & mask)) return false;
	return repeat_timer >= 18 && ((repeat_timer - 18) % 5) == 0;
}
float input_px(void) { return cx; }
float input_py(void) { return cy; }
bool input_pointer_moved(void) { return moved; }
void input_set_pointer(float x, float y) { cx = x; cy = y; }
float input_press(void) { return press_anim; }

void input_game_take(JsInput *in) {
	memset(in, 0, sizeof(*in));
	LWP_MutexLock(lock);
	if (!g_block) {
		in->buttons = held | g_pressed;
		in->lx = sx; in->ly = sy; in->rx = csx; in->ry = csy;
		in->pmoved = g_moved;
	}
	in->px = cx; in->py = cy;
	g_pressed = 0; g_moved = false;
	LWP_MutexUnlock(lock);
}

void input_game_block(bool on) {
	LWP_MutexLock(lock);
	g_block = on;
	g_pressed = 0; g_moved = false;
	LWP_MutexUnlock(lock);
}
