#ifndef SS_JSAPI_H
#define SS_JSAPI_H
#include <stdint.h>
#include <stddef.h>
/* buttons: PAD_BUTTON_* held; lx, ly the Control Stick, rx, ry the C-Stick;
 * the pointer in screen units (moved: the stick moved it this frame) */
typedef struct { uint32_t buttons; int lx, ly, rx, ry; float px, py; int pmoved; } JsInput;
int js_start(const char **files, int nfiles, size_t heap_limit);   /* scripts from files (test builds) */
typedef struct { const char *name; const char *code; size_t len; } JsSource;
int js_start_mem(const JsSource *src, int n, size_t heap_limit);    /* scripts built into the program */
int js_frame(const JsInput *in);   /* returns 0 when the game asks to quit */
int js_eval(const char *code);
int js_get_num(const char *expr, double *out);
#endif
