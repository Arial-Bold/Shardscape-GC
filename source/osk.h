/* osk.h - typing: an on-screen keyboard in the System look (the pointer or
 * the + Control Pad, and A), or the GameCube keyboard controller. Opened by
 * the game (names, addresses, game codes), run on the interface thread. */
#pragma once
#include <stdbool.h>
void osk_open(const char *title, const char *initial, int maxlen, int kind);   /* kind 0 text, 1 number, 2 address */
bool osk_is_open(void);
int  osk_poll(char *out, int cap);   /* 0 still open (or nothing), 1 entered, -1 cancelled */
void osk_update(void);               /* the interface thread, once a frame */
void osk_draw(void);
