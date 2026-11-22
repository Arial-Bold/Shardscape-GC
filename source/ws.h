/* Minimal WebSocket client (RFC 6455, text frames) for talking to the
 * Shardscape desktop game server. Runs each connection on its own threads and
 * hands events to the main loop through a queue. Portable: Vita + POSIX. */
#ifndef SS_WS_H
#define SS_WS_H
#include <stddef.h>

enum { WS_EV_OPEN = 1, WS_EV_MESSAGE = 2, WS_EV_CLOSE = 3, WS_EV_ERROR = 4 };
typedef struct { int id, type; char *data; size_t len; } WsEvent;

void ws_global_init(void);
int  ws_open(const char *host, int port);           /* returns id > 0, or 0 */
int  ws_send(int id, const char *text, size_t len);  /* queue a text frame */
void ws_close(int id);
int  ws_poll(WsEvent *ev);                           /* 1 if an event was returned; caller frees ev->data */
int  ws_state(int id);                               /* 0 connecting, 1 open, 2 closing, 3 closed */
#endif
