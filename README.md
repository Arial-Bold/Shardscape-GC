# Shardscape for GameCube

Shardscape is a hex-terrain skirmish game: build a battlefield, snake-draft from 196 original heroes and squads, and fight turn by turn against bots, with friends on one GameCube, or over your network with players on other GameCubes, PCs, Macs and the PS Vita. This is the GameCube version of the game [original author] made for Windows, macOS and the PS Vita.

- The whole game: all 196 characters, the 13 kinds of terrain, boards of up to 1,027 hexes, HeroScape-style rules with order markers, bots at five difficulty levels, pass-and-play, and the battlefield editor.
- The battlefield is drawn in 3D-style relief on the GameCube's graphics chip, with the miniatures standing on team-colored bases.
- A real layout for each kind of TV. On a 4:3 TV the battlefield fills the screen: the command panel is a drawer that slides in over it (Y, or point at the tab at the right edge), and whose turn it is shows in the bar along the top while it's closed. On a 16:9 TV the panel stays docked beside the board.
- Played with the pointer, as in CubeBrowser: the Control Stick moves it and A clicks. The + Control Pad steps a cursor hex by hex too.
- Host games on your GameCube, or join a game hosted on a PC, Mac or another GameCube.

## What you need

- An SD card adapter (SD2SP2, SD Gecko or GC Loader). Your settings, saved games and hosted games are kept on it.
- For online play: a network adapter (the Broadband Adapter, or a WIZnet-based one such as the ETH2GC) connected to your router.
- The GameCube keyboard controller works for typing names and addresses, but isn't needed: there's an on-screen keyboard.

## Installing

Download `shardscape.zip` from the Releases page and copy the `shardscape` folder in it to your SD card, where your Launcher looks for apps. It holds `default.dol` and `opening.bnr`.

## Controls

| Button | |
| --- | --- |
| Control Stick | Move the pointer. Push against the edge of the board to scroll it |
| A | Click: select, move and attack on the board; choose in the panel. Hold A and move to drag the board or scroll the panel |
| B | Cancel the selection; back |
| X | End your turn (in the battlefield editor: lower the terrain) |
| Y | Open or close the panel (4:3); switch between the board and the panel (16:9) |
| L / R | Turn the battlefield 45 degrees |
| C-Stick | Tilt and turn the battlefield; scroll the panel when the pointer is on it |
| Z | Zoom in steps (towards the pointer) |
| + Control Pad | Step the cursor hex by hex, or move between choices in the panel |
| START | The menu: How to play, Settings, Leave game, Exit to Launcher |

## Playing offline

On the main menu, under Offline, choose 2 to 6 players, the points each army may spend and the board size, and set each seat to Human or a bot (Beginner, Easy, Normal, Hard or Brutal). Start offline game, or Watch bots battle to let the bots play on their own. Several people can share one GameCube (pass-and-play); when someone places their secret order markers, the others look away.

An offline game saves itself as you play: Continue offline game picks it up again, even after you turn the GameCube off.

Brutal bots can think for a few seconds when they place their order markers; the pointer keeps moving while they do.

## Playing together

Every player needs the same network: a home network, or (with the right router settings) the internet.

**Host on your GameCube:** on the main menu, choose Host games on this GameCube. The menu shows your GameCube's address (for example `192.168.1.42`). Start an online game and tell your friends the address and the 4-letter game code. Games you host are kept on the SD card, so you can come back to them later.

**Join a host:** choose Join a host by address and type the address the host shows: another GameCube's, or the one in the desktop app's Network box. Then join with the game code, or pick the game from Recent games.

GameCubes, PCs, Macs and Vitas can all play in the same game, up to 6 players. The desktop app's copy-and-paste invite codes aren't available on the GameCube.

## Settings

START, then Settings:

- **Resolution**: Auto (480p with a component cable), 480i or 480p. A new resolution goes back to the old one after 10 seconds unless you press A.
- **Screen**: 4:3, or 16:9 if your TV stretches the picture to fill a widescreen. The game's layout changes to fit.
- **Picture width**: Full uses the whole width of the TV picture; Standard leaves a border.
- **Overscan**: pulls everything in from the edges if your TV cuts them off.
- **Pointer speed**: how fast the Control Stick moves the pointer.
- **Board detail**: Auto, High or Low. Low draws big boards faster; Auto uses it on Huge and Epic boards.
- **Bot speed**: how long the bots pause between moves.
- **Launcher**: which .dol at the root of the SD card Exit to Launcher starts.
- **Exit to Launcher**: leaves Shardscape.

The settings are kept in `shardscape.ini` beside the app.

## Performance

The board redraws only when something changes. Turning or tilting the battlefield redraws it, which takes a moment on big boards; panning and zooming are instant. Standard and Large boards play best.

## Building

The GitHub build does everything: each push builds `shardscape.dol` and packs the `shardscape` folder (`default.dol` and `opening.bnr`) as a download.

To build it yourself you need devkitPPC and libogc2 (devkitPro):

```
sh get-deps.sh
make
```

or with Docker:

```
sh get-deps.sh
docker run --rm -v "$PWD:/src" -w /src ghcr.io/extremscorner/libogc2:latest make
```

The game itself is the same JavaScript as the other versions (`js/engine.js`, from the PS Vita version), run by QuickJS. `js/gc_ui.js` is the GameCube interface, and `js/gc_server.js` hosts games (a port of the desktop app's game server). The C program in `source/` draws the game's canvas with the GameCube's graphics chip, reads the controllers, and runs the network links.

`tools/testhost.c` runs the same scripts on a PC with a software renderer, for checking screens without a console.

## Credits and licenses

Shardscape is by [original author]. The GameCube version's program is built on their PS Vita version.

- [QuickJS](https://bellard.org/quickjs/) by Fabrice Bellard and Charlie Gordon (MIT license).
- The font is M PLUS Rounded 1c (SIL Open Font License, see `tools/fonts/OFL.txt`).
- libogc2 and devkitPro.
