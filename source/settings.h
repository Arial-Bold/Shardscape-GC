/* settings.h - Shardscape's settings (shardscape.ini beside the app) and the
 * Settings screen, as BrainBox's: Resolution, Screen, Picture width,
 * Overscan, then the game's own (pointer speed, board detail, bot speed),
 * the Launcher and Exit to Launcher. The screen is drawn and run on the
 * interface thread, over the game. */
#pragma once
#include <stdbool.h>
#include "gfx.h"

typedef struct {
	VideoSettings video;
	int  pointer_speed;   /* 1..10 */
	char detail[8];       /* auto, high, low */
	char bot_speed[8];    /* slow, normal, fast */
	char launcher[64];    /* the .dol at the root of the SD card that Exit starts ("" = find one) */
} AppSettings;

void settings_load(void);
void settings_save(void);
AppSettings settings_get(void);                            /* a copy (any thread) */
void settings_set_value(const char *key, const char *val); /* from the game: "botSpeed", "detail" */

void settings_open(void);
bool settings_is_open(void);
void settings_update(void);   /* the interface thread, once a frame while open: the controls */
void settings_draw(void);
const char *settings_launcher_current(void);
