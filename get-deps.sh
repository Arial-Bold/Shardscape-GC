#!/bin/sh
# Downloads what the build needs into third_party/: QuickJS (JavaScript, a
# fixed version; only the engine's own files), the same one CubeBrowser uses.
set -e
cd "$(dirname "$0")"
mkdir -p third_party
if [ ! -f third_party/quickjs/quickjs.c ]; then
    # QuickJS by Fabrice Bellard and Charlie Gordon (MIT licence), release 2026-06-04
    QJS=3d5e064e9dd67c70f7962836505a7fa067bf0a4e
    URL="https://github.com/bellard/quickjs/archive/$QJS.tar.gz"
    echo "Downloading $URL"
    curl -fL -o third_party/quickjs.tar.gz "$URL"
    rm -rf third_party/quickjs-src
    mkdir -p third_party/quickjs-src third_party/quickjs
    tar -xzf third_party/quickjs.tar.gz -C third_party/quickjs-src --strip-components=1
    for f in quickjs.c quickjs.h quickjs-atom.h quickjs-opcode.h libregexp.c libregexp.h libregexp-opcode.h \
             libunicode.c libunicode.h libunicode-table.h cutils.c cutils.h dtoa.c dtoa.h list.h LICENSE; do
        cp "third_party/quickjs-src/$f" third_party/quickjs/
    done
    # the GameCube has no OS threads (for Atomics), no malloc_usable_size()
    # and no time zones
    sed -i -e 's/^#define CONFIG_ATOMICS$/#if !defined(GEKKO)\n#define CONFIG_ATOMICS\n#endif/' \
           -e 's/^#elif defined(__EMSCRIPTEN__)$/#elif defined(__EMSCRIPTEN__) || defined(GEKKO)/' \
           -e 's|^        res = -tm.tm_gmtoff / 60;$|#if defined(GEKKO)\n        res = 0;\n#else\n        res = -tm.tm_gmtoff / 60;\n#endif|' third_party/quickjs/quickjs.c
    [ "$(grep -c 'defined(GEKKO)' third_party/quickjs/quickjs.c)" -ge 3 ] || { echo "Couldn't adapt QuickJS for the GameCube"; exit 1; }
    rm -rf third_party/quickjs-src third_party/quickjs.tar.gz
fi
echo "Done. Now run: make"
