/* render.h - draws the game's canvas layers (canvas.c) with the graphics
 * chip. Each layer's triangles become a display list, rebuilt only when the
 * layer changes; its text is copied out. So the picture can be drawn every
 * frame from these copies, even while the game is busy thinking. */
#pragma once
void render_sync(void);     /* with the game stopped (its lock held): pick up changed layers */
void render_layers(void);   /* draw them, back to front */
