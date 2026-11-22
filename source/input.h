/* input.h - the controllers. Read once a frame on the interface thread: the
 * Control Stick drives a pointer (CubeBrowser's: a dead zone and an
 * acceleration curve, at the speed chosen in Settings). The game takes
 * what's happened since it last looked, so presses made while it was busy
 * thinking aren't lost. */
#pragma once
#include <gccore.h>
#include <stdbool.h>
#include "jsapi.h"

void  input_init(void);
void  input_update(float screen_w, int pointer_speed);   /* once a frame */
u32   input_held(void);
u32   input_down(void);                  /* pressed this frame */
bool  input_repeat(u32 mask);            /* pressed, or held long enough to repeat */
float input_px(void);
float input_py(void);
bool  input_pointer_moved(void);         /* this frame */
void  input_set_pointer(float x, float y);
float input_press(void);                 /* 0..1, how far A is held (the pointer dips) */
void  input_game_take(JsInput *in);      /* the game: everything since last time */
void  input_game_block(bool on);         /* while Settings or the keyboard is open, the game sees nothing */
