/* netws.h - the game's network links, on a thread of their own: WebSocket
 * connections to a Shardscape host (the desktop app, or another GameCube),
 * and hosting games here: a small WebSocket server on port 47800 that
 * passes each player's messages to the game's relay (gc_server.js).
 * The client side is ws.h; the server side is below. */
#pragma once
#include <stddef.h>
#include <stdbool.h>
#include "ws.h"

enum { SRV_EV_OPEN = 1, SRV_EV_MESSAGE = 2, SRV_EV_CLOSE = 3 };
typedef struct { int id, type; char *data; size_t len; } SrvEvent;

bool srv_start(int port);          /* start listening (true: running) */
bool srv_running(void);
int  srv_poll(SrvEvent *ev);       /* 1 if an event was returned; the caller frees ev->data */
int  srv_send(int id, const char *text, size_t len);
void srv_close(int id);
