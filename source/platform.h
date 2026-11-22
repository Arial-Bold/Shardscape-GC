#ifndef SS_PLATFORM_H
#define SS_PLATFORM_H
#include <stddef.h>

/* Implemented by each host (main_vita.c, main_linux.c). */
double plat_time_ms(void);
char  *plat_read_file(const char *path, size_t *len);           /* malloc'd, NUL-terminated, or NULL */
int    plat_write_file(const char *path, const char *data, size_t len);
void   plat_log(const char *s);
float  plat_text_width(const char *s, float size);
void   plat_ime_open(const char *title, const char *initial, int maxlen, int kind); /* kind 0 text, 1 number, 2 url/ip */
int    plat_ime_poll(char *out, int cap);                        /* 0 still open/idle, 1 entered, -1 cancelled */
const char *plat_ip(void);                                       /* this device's IP or "" */
int    plat_confirm_is_circle(void);                             /* Japanese-style button layout */
const char *plat_data_dir(void);                                 /* writable folder, ends with '/' */
const char *plat_app_dir(void);                                  /* read-only app files, ends with '/' */
void   plat_request_exit(void);
void   plat_snapshot(const char *path);                          /* test builds: save the screen; no-op on the GameCube */

/* GameCube additions */
typedef struct { int wide; char detail[8]; char bot_speed[8]; } PlatCfg;
void   plat_cfg(PlatCfg *c);                                     /* the settings the game needs */
void   plat_set_cfg(const char *key, const char *val);           /* "botSpeed" or "detail", saved */
void   plat_hints(const char *const *h, int n);                  /* the button hints along the bottom ("A:Choose") */
void   plat_pointer_show(int on);                                /* the pointer: shown, or hidden (D-pad in use) */
void   plat_pointer_hover(int on);                               /* something clickable is under it */
void   plat_settings_open(void);                                 /* the Settings screen over the game */
int    plat_settings_is_open(void);
const char *plat_net_message(void);                              /* a network problem, or "" */
#endif
