/* app.h - what the parts of Shardscape ask of the program as a whole (main.c) */
#pragma once
extern const char app_version[];
void app_request_exit(void);    /* Exit to Launcher, once the frame is done */
void app_video_changed(void);   /* a video setting changed: the mode and the layout follow */
