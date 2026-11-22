/* QuickJS bindings: exposes the canvas (__c), platform (__p) and sockets (__ws)
 * to the game's JavaScript, and drives the per-frame JS callback. */
#include "jsapi.h"
#include "canvas.h"
#include "netws.h"
#include "platform.h"
#include "quickjs.h"
#include <string.h>
#include <stdlib.h>
#include <stdio.h>

static JSRuntime *rt;
static JSContext *ctx;
static JSValue frame_fn;

static double num(JSContext *c, JSValueConst v) { double d = 0; JS_ToFloat64(c, &d, v); return d; }
#define A(i) (argc > (i) ? num(c, argv[i]) : 0)
#define FN(name) static JSValue name(JSContext *c, JSValueConst this_val, int argc, JSValueConst *argv)
#define UNUSED (void)this_val; (void)argc; (void)argv; (void)c

/* ---- canvas ---- */
FN(j_layer) { UNUSED; cv_select_layer((int)A(0)); return JS_UNDEFINED; }
FN(j_clear) { UNUSED; cv_clear_layer((int)A(0)); return JS_UNDEFINED; }
FN(j_view) { UNUSED; cv_set_view((int)A(0), (float)A(1), (float)A(2), (float)A(3), (int)A(4), (int)A(5), (int)A(6), (int)A(7), argc > 8 ? JS_ToBool(c, argv[8]) : 1); return JS_UNDEFINED; }
FN(j_count) { UNUSED; return JS_NewInt32(c, cv_vertex_count((int)A(0))); }
FN(j_save) { UNUSED; cv_save(); return JS_UNDEFINED; }
FN(j_restore) { UNUSED; cv_restore(); return JS_UNDEFINED; }
FN(j_setT) { UNUSED; cv_set_transform((float)A(0), (float)A(1), (float)A(2), (float)A(3), (float)A(4), (float)A(5)); return JS_UNDEFINED; }
FN(j_translate) { UNUSED; cv_translate((float)A(0), (float)A(1)); return JS_UNDEFINED; }
FN(j_scale) { UNUSED; cv_scale((float)A(0), (float)(argc > 1 ? A(1) : A(0))); return JS_UNDEFINED; }
FN(j_begin) { UNUSED; cv_begin_path(); return JS_UNDEFINED; }
FN(j_moveTo) { UNUSED; cv_move_to((float)A(0), (float)A(1)); return JS_UNDEFINED; }
FN(j_lineTo) { UNUSED; cv_line_to((float)A(0), (float)A(1)); return JS_UNDEFINED; }
FN(j_closeP) { UNUSED; cv_close_path(); return JS_UNDEFINED; }
FN(j_arc) { UNUSED; cv_arc((float)A(0), (float)A(1), (float)A(2), (float)A(3), (float)A(4), argc > 5 && JS_ToBool(c, argv[5])); return JS_UNDEFINED; }
FN(j_ellipse) { UNUSED; cv_ellipse((float)A(0), (float)A(1), (float)A(2), (float)A(3), (float)A(4), (float)A(5), (float)A(6), argc > 7 && JS_ToBool(c, argv[7])); return JS_UNDEFINED; }
FN(j_quad) { UNUSED; cv_quad_to((float)A(0), (float)A(1), (float)A(2), (float)A(3)); return JS_UNDEFINED; }
FN(j_fill) { UNUSED; cv_fill(); return JS_UNDEFINED; }
FN(j_stroke) { UNUSED; cv_stroke(); return JS_UNDEFINED; }
FN(j_clip) { UNUSED; cv_clip(); return JS_UNDEFINED; }
FN(j_fillRect) { UNUSED; cv_fill_rect((float)A(0), (float)A(1), (float)A(2), (float)A(3)); return JS_UNDEFINED; }
FN(j_clearRect) { UNUSED; cv_clear_rect((float)A(0), (float)A(1), (float)A(2), (float)A(3)); return JS_UNDEFINED; }
FN(j_fillText) {
  UNUSED; const char *s = JS_ToCString(c, argv[0]); if (s) { cv_fill_text(s, (float)A(1), (float)A(2)); JS_FreeCString(c, s); }
  return JS_UNDEFINED;
}
static int color_arg(JSContext *c, JSValueConst v, uint32_t *out) {
  const char *s = JS_ToCString(c, v); if (!s) return 0; int ok = cv_parse_color(s, out); JS_FreeCString(c, s); return ok;
}
FN(j_fillColor) { UNUSED; uint32_t col; if (color_arg(c, argv[0], &col)) cv_fill_color(col); return JS_UNDEFINED; }
FN(j_strokeColor) { UNUSED; uint32_t col; if (color_arg(c, argv[0], &col)) cv_stroke_color(col); return JS_UNDEFINED; }
FN(j_fillGrad) { UNUSED; cv_fill_grad((int)A(0)); return JS_UNDEFINED; }
FN(j_strokeGrad) { UNUSED; cv_stroke_grad((int)A(0)); return JS_UNDEFINED; }
FN(j_lin) { UNUSED; return JS_NewInt32(c, cv_grad_linear((float)A(0), (float)A(1), (float)A(2), (float)A(3))); }
FN(j_rad) { UNUSED; return JS_NewInt32(c, cv_grad_radial((float)A(0), (float)A(1), (float)A(2), (float)A(3), (float)A(4), (float)A(5))); }
FN(j_stop) { UNUSED; uint32_t col; if (color_arg(c, argv[2], &col)) cv_grad_stop((int)A(0), (float)A(1), col); return JS_UNDEFINED; }
FN(j_lineWidth) { UNUSED; cv_line_width((float)A(0)); return JS_UNDEFINED; }
FN(j_alpha) { UNUSED; cv_alpha((float)A(0)); return JS_UNDEFINED; }
FN(j_font) { UNUSED; cv_font_size((float)A(0)); return JS_UNDEFINED; }
FN(j_align) { UNUSED; cv_text_align((int)A(0)); return JS_UNDEFINED; }
FN(j_baseline) { UNUSED; cv_text_baseline((int)A(0)); return JS_UNDEFINED; }
FN(j_cap) { UNUSED; cv_line_cap((int)A(0)); return JS_UNDEFINED; }
FN(j_join) { UNUSED; cv_line_join((int)A(0)); return JS_UNDEFINED; }
FN(j_textWidth) {
  UNUSED; const char *s = JS_ToCString(c, argv[0]); float w = 0; if (s) { w = plat_text_width(s, (float)A(1)); JS_FreeCString(c, s); }
  return JS_NewFloat64(c, w);
}

/* ---- platform ---- */
FN(j_time) { UNUSED; return JS_NewFloat64(c, plat_time_ms()); }
FN(j_log) { UNUSED; const char *s = JS_ToCString(c, argv[0]); if (s) { plat_log(s); JS_FreeCString(c, s); } return JS_UNDEFINED; }
FN(j_read) {
  UNUSED; const char *p = JS_ToCString(c, argv[0]); if (!p) return JS_NULL;
  size_t n; char *d = plat_read_file(p, &n); JS_FreeCString(c, p);
  if (!d) return JS_NULL; JSValue r = JS_NewStringLen(c, d, n); free(d); return r;
}
FN(j_write) {
  UNUSED; const char *p = JS_ToCString(c, argv[0]); size_t n; const char *d = JS_ToCStringLen(c, &n, argv[1]);
  int ok = (p && d) ? plat_write_file(p, d, n) : 0; if (p) JS_FreeCString(c, p); if (d) JS_FreeCString(c, d);
  return JS_NewBool(c, ok);
}
FN(j_imeOpen) {
  UNUSED; const char *t = JS_ToCString(c, argv[0]), *i = JS_ToCString(c, argv[1]);
  plat_ime_open(t ? t : "", i ? i : "", (int)A(2), (int)A(3)); if (t) JS_FreeCString(c, t); if (i) JS_FreeCString(c, i);
  return JS_UNDEFINED;
}
FN(j_imePoll) {
  UNUSED; char buf[512]; int r = plat_ime_poll(buf, sizeof buf);
  if (r == 0) return JS_NULL;
  JSValue o = JS_NewObject(c); JS_SetPropertyStr(c, o, "ok", JS_NewBool(c, r > 0)); JS_SetPropertyStr(c, o, "text", JS_NewString(c, r > 0 ? buf : "")); return o;
}
FN(j_ip) { UNUSED; return JS_NewString(c, plat_ip()); }
FN(j_circle) { UNUSED; return JS_NewBool(c, plat_confirm_is_circle()); }
FN(j_dataDir) { UNUSED; return JS_NewString(c, plat_data_dir()); }
FN(j_exit) { UNUSED; plat_request_exit(); return JS_UNDEFINED; }
FN(j_snap) { UNUSED; const char *p = JS_ToCString(c, argv[0]); if (p) { plat_snapshot(p); JS_FreeCString(c, p); } return JS_UNDEFINED; }

FN(j_cfg) {
  UNUSED; PlatCfg k; memset(&k, 0, sizeof k); plat_cfg(&k);
  JSValue o = JS_NewObject(c);
  JS_SetPropertyStr(c, o, "wide", JS_NewBool(c, k.wide));
  JS_SetPropertyStr(c, o, "detail", JS_NewString(c, k.detail[0] ? k.detail : "auto"));
  JS_SetPropertyStr(c, o, "botSpeed", JS_NewString(c, k.bot_speed[0] ? k.bot_speed : "normal"));
  return o;
}
FN(j_setCfg) {
  UNUSED; const char *k = JS_ToCString(c, argv[0]), *v = JS_ToCString(c, argv[1]);
  if (k && v) plat_set_cfg(k, v); if (k) JS_FreeCString(c, k); if (v) JS_FreeCString(c, v); return JS_UNDEFINED;
}
FN(j_hints) {
  UNUSED; const char *h[8]; int n = 0; uint32_t len = 0;
  JSValue lv = JS_GetPropertyStr(c, argv[0], "length"); JS_ToUint32(c, &len, lv); JS_FreeValue(c, lv);
  for (uint32_t i = 0; i < len && n < 8; i++) { JSValue e = JS_GetPropertyUint32(c, argv[0], i); h[n] = JS_ToCString(c, e); JS_FreeValue(c, e); if (h[n]) n++; }
  plat_hints(h, n);
  for (int i = 0; i < n; i++) JS_FreeCString(c, h[i]);
  return JS_UNDEFINED;
}
FN(j_ptrShow) { UNUSED; plat_pointer_show(argc > 0 && JS_ToBool(c, argv[0])); return JS_UNDEFINED; }
FN(j_ptrHover) { UNUSED; plat_pointer_hover(argc > 0 && JS_ToBool(c, argv[0])); return JS_UNDEFINED; }
FN(j_settings) { UNUSED; plat_settings_open(); return JS_UNDEFINED; }
FN(j_settingsOpen) { UNUSED; return JS_NewBool(c, plat_settings_is_open()); }
FN(j_netMsg) { UNUSED; return JS_NewString(c, plat_net_message()); }
/* hosting: the relay itself is the game's (gc_server.js); here, its sockets */
FN(j_srvStart) { UNUSED; return JS_NewBool(c, srv_start(argc > 0 ? (int)A(0) : 47800)); }
FN(j_srvPoll) {
  UNUSED; JSValue arr = JS_NewArray(c); SrvEvent ev; uint32_t i = 0;
  while (i < 64 && srv_poll(&ev)) {
    JSValue o = JS_NewObject(c);
    JS_SetPropertyStr(c, o, "id", JS_NewInt32(c, ev.id)); JS_SetPropertyStr(c, o, "type", JS_NewInt32(c, ev.type));
    if (ev.data) { JS_SetPropertyStr(c, o, "data", JS_NewStringLen(c, ev.data, ev.len)); free(ev.data); }
    JS_SetPropertyUint32(c, arr, i++, o);
  }
  return arr;
}
FN(j_srvSend) { UNUSED; size_t n; const char *d = JS_ToCStringLen(c, &n, argv[1]); int r = d ? srv_send((int)A(0), d, n) : -1; if (d) JS_FreeCString(c, d); return JS_NewInt32(c, r); }
FN(j_srvClose) { UNUSED; srv_close((int)A(0)); return JS_UNDEFINED; }

/* ---- sockets ---- */
FN(j_wsOpen) {
  UNUSED; const char *h = JS_ToCString(c, argv[0]); int id = h ? ws_open(h, (int)A(1)) : 0; if (h) JS_FreeCString(c, h); return JS_NewInt32(c, id);
}
FN(j_wsSend) {
  UNUSED; size_t n; const char *d = JS_ToCStringLen(c, &n, argv[1]); int r = d ? ws_send((int)A(0), d, n) : -1; if (d) JS_FreeCString(c, d); return JS_NewInt32(c, r);
}
FN(j_wsClose) { UNUSED; ws_close((int)A(0)); return JS_UNDEFINED; }
FN(j_wsPoll) {
  UNUSED; JSValue arr = JS_NewArray(c); WsEvent ev; uint32_t i = 0;
  while (i < 64 && ws_poll(&ev)) {
    JSValue o = JS_NewObject(c);
    JS_SetPropertyStr(c, o, "id", JS_NewInt32(c, ev.id)); JS_SetPropertyStr(c, o, "type", JS_NewInt32(c, ev.type));
    if (ev.data) { JS_SetPropertyStr(c, o, "data", JS_NewStringLen(c, ev.data, ev.len)); free(ev.data); }
    JS_SetPropertyUint32(c, arr, i++, o);
  }
  return arr;
}

typedef struct { const char *name; JSCFunction *fn; int n; } Def;
static void install(const char *objname, const Def *d, int count) {
  JSValue g = JS_GetGlobalObject(ctx), o = JS_NewObject(ctx);
  for (int i = 0; i < count; i++) JS_SetPropertyStr(ctx, o, d[i].name, JS_NewCFunction(ctx, d[i].fn, d[i].name, d[i].n));
  JS_SetPropertyStr(ctx, g, objname, o); JS_FreeValue(ctx, g);
}
static const Def CDEFS[] = {
  {"layer", j_layer, 1}, {"clear", j_clear, 1}, {"view", j_view, 9}, {"count", j_count, 1},
  {"save", j_save, 0}, {"restore", j_restore, 0}, {"setTransform", j_setT, 6}, {"translate", j_translate, 2}, {"scale", j_scale, 2},
  {"beginPath", j_begin, 0}, {"moveTo", j_moveTo, 2}, {"lineTo", j_lineTo, 2}, {"closePath", j_closeP, 0},
  {"arc", j_arc, 6}, {"ellipse", j_ellipse, 8}, {"quadraticCurveTo", j_quad, 4},
  {"fill", j_fill, 0}, {"stroke", j_stroke, 0}, {"clip", j_clip, 0}, {"fillRect", j_fillRect, 4}, {"clearRect", j_clearRect, 4}, {"fillText", j_fillText, 3},
  {"fillColor", j_fillColor, 1}, {"strokeColor", j_strokeColor, 1}, {"fillGrad", j_fillGrad, 1}, {"strokeGrad", j_strokeGrad, 1},
  {"lin", j_lin, 4}, {"rad", j_rad, 6}, {"stop", j_stop, 3},
  {"lineWidth", j_lineWidth, 1}, {"alpha", j_alpha, 1}, {"font", j_font, 1}, {"align", j_align, 1}, {"baseline", j_baseline, 1}, {"cap", j_cap, 1}, {"join", j_join, 1},
  {"textWidth", j_textWidth, 2},
};
static const Def PDEFS[] = {
  {"time", j_time, 0}, {"log", j_log, 1}, {"read", j_read, 1}, {"write", j_write, 2},
  {"imeOpen", j_imeOpen, 4}, {"imePoll", j_imePoll, 0}, {"ip", j_ip, 0}, {"confirmCircle", j_circle, 0}, {"dataDir", j_dataDir, 0}, {"exit", j_exit, 0}, {"snap", j_snap, 1},
  {"wsOpen", j_wsOpen, 2}, {"wsSend", j_wsSend, 2}, {"wsClose", j_wsClose, 1}, {"wsPoll", j_wsPoll, 0},
  {"cfg", j_cfg, 0}, {"setCfg", j_setCfg, 2}, {"hints", j_hints, 1}, {"pointerShow", j_ptrShow, 1}, {"pointerHover", j_ptrHover, 1},
  {"settings", j_settings, 0}, {"settingsOpen", j_settingsOpen, 0}, {"netMessage", j_netMsg, 0},
  {"srvStart", j_srvStart, 1}, {"srvPoll", j_srvPoll, 0}, {"srvSend", j_srvSend, 2}, {"srvClose", j_srvClose, 1},
};

static void dump_exception(void) {
  JSValue e = JS_GetException(ctx);
  const char *s = JS_ToCString(ctx, e); JSValue stack = JS_GetPropertyStr(ctx, e, "stack"); const char *st = JS_IsUndefined(stack) ? NULL : JS_ToCString(ctx, stack);
  char buf[2048]; snprintf(buf, sizeof buf, "JS error: %s\n%s", s ? s : "?", st ? st : ""); plat_log(buf);
  if (s) JS_FreeCString(ctx, s); if (st) JS_FreeCString(ctx, st); JS_FreeValue(ctx, stack); JS_FreeValue(ctx, e);
}
static void run_jobs(void) {
  JSContext *c2;
  for (int i = 0; i < 10000; i++) { int r = JS_ExecutePendingJob(rt, &c2); if (r <= 0) { if (r < 0) dump_exception(); break; } }
}

/* the game's scripts, built into the program (see js_start_mem) */
static int run_source(const char *name, const char *src, size_t n) {
  JSValue r = JS_Eval(ctx, src, n, name, JS_EVAL_TYPE_GLOBAL);
  if (JS_IsException(r)) { dump_exception(); return 0; }
  JS_FreeValue(ctx, r); run_jobs(); return 1;
}
static int js_new(size_t heap_limit) {
  rt = JS_NewRuntime();
  if (!rt) return 0;
  if (heap_limit) JS_SetMemoryLimit(rt, heap_limit);
  JS_SetMaxStackSize(rt, 768 * 1024);   /* (the GameCube program runs the game on a 1 MB stack) */
  ctx = JS_NewContext(rt);
  if (!ctx) return 0;
  install("__c", CDEFS, sizeof CDEFS / sizeof CDEFS[0]);
  install("__p", PDEFS, sizeof PDEFS / sizeof PDEFS[0]);
  return 1;
}
static int js_find_frame(void) {
  JSValue g = JS_GetGlobalObject(ctx); frame_fn = JS_GetPropertyStr(ctx, g, "__frame"); JS_FreeValue(ctx, g);
  if (!JS_IsFunction(ctx, frame_fn)) { plat_log("no __frame function"); return 0; }
  return 1;
}
int js_start_mem(const JsSource *src, int n, size_t heap_limit) {
  if (!js_new(heap_limit)) { plat_log("couldn't start the script engine"); return 0; }
  for (int i = 0; i < n; i++) if (!run_source(src[i].name, src[i].code, src[i].len)) return 0;
  return js_find_frame();
}

int js_start(const char **files, int nfiles, size_t heap_limit) {
  rt = JS_NewRuntime();
  if (heap_limit) JS_SetMemoryLimit(rt, heap_limit);
  JS_SetMaxStackSize(rt, 1024 * 1024);
  ctx = JS_NewContext(rt);
  install("__c", CDEFS, sizeof CDEFS / sizeof CDEFS[0]);
  install("__p", PDEFS, sizeof PDEFS / sizeof PDEFS[0]);
  for (int i = 0; i < nfiles; i++) {
    char path[512]; snprintf(path, sizeof path, "%s%s", plat_app_dir(), files[i]);
    size_t n; char *src = plat_read_file(path, &n);
    if (!src) { char m[600]; snprintf(m, sizeof m, "missing %s", path); plat_log(m); return 0; }
    JSValue r = JS_Eval(ctx, src, n, files[i], JS_EVAL_TYPE_GLOBAL);
    free(src);
    if (JS_IsException(r)) { dump_exception(); return 0; }
    JS_FreeValue(ctx, r); run_jobs();
  }
  JSValue g = JS_GetGlobalObject(ctx); frame_fn = JS_GetPropertyStr(ctx, g, "__frame"); JS_FreeValue(ctx, g);
  if (!JS_IsFunction(ctx, frame_fn)) { plat_log("no __frame function"); return 0; }
  return 1;
}

int js_frame(const JsInput *in) {
  JSValue o = JS_NewObject(ctx);
  JS_SetPropertyStr(ctx, o, "buttons", JS_NewUint32(ctx, in->buttons));
  JS_SetPropertyStr(ctx, o, "lx", JS_NewInt32(ctx, in->lx)); JS_SetPropertyStr(ctx, o, "ly", JS_NewInt32(ctx, in->ly));
  JS_SetPropertyStr(ctx, o, "rx", JS_NewInt32(ctx, in->rx)); JS_SetPropertyStr(ctx, o, "ry", JS_NewInt32(ctx, in->ry));
  JSValue p = JS_NewObject(ctx);
  JS_SetPropertyStr(ctx, p, "x", JS_NewFloat64(ctx, in->px)); JS_SetPropertyStr(ctx, p, "y", JS_NewFloat64(ctx, in->py));
  JS_SetPropertyStr(ctx, p, "moved", JS_NewBool(ctx, in->pmoved));
  JS_SetPropertyStr(ctx, o, "ptr", p);
  JS_SetPropertyStr(ctx, o, "now", JS_NewFloat64(ctx, plat_time_ms()));
  JSValue r = JS_Call(ctx, frame_fn, JS_UNDEFINED, 1, &o);
  JS_FreeValue(ctx, o);
  int keep = 1;
  if (JS_IsException(r)) dump_exception(); else if (JS_IsBool(r) && !JS_ToBool(ctx, r)) keep = 0;
  JS_FreeValue(ctx, r);
  run_jobs();
  return keep;
}

int js_eval(const char *code) {
  JSValue r = JS_Eval(ctx, code, strlen(code), "<eval>", JS_EVAL_TYPE_GLOBAL);
  int ok = !JS_IsException(r); if (!ok) dump_exception(); JS_FreeValue(ctx, r); run_jobs(); return ok;
}

/* a number from the scripts (test builds read the scripted pointer this way) */
int js_get_num(const char *expr, double *out) {
  JSValue r = JS_Eval(ctx, expr, strlen(expr), "<get>", JS_EVAL_TYPE_GLOBAL);
  int ok = !JS_IsException(r) && JS_ToFloat64(ctx, out, r) == 0;
  if (JS_IsException(r)) { JSValue e = JS_GetException(ctx); JS_FreeValue(ctx, e); }
  JS_FreeValue(ctx, r); return ok;
}
