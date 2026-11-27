#!/usr/bin/env bash
# Build a Debian/Ubuntu package for Direct Print Server.
#
# Usage: scripts/linux/build-deb.sh [VERSION] [ARCH]
#   VERSION  defaults to the "version" field in package.json
#   ARCH     amd64 (default) or arm64
#
# Requires: node/npm (deps installed), dpkg-deb.
# Output:   dist/direct-print-server_<VERSION>_<ARCH>.deb
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

VERSION="${1:-$(node -p "require('./package.json').version")}"
VERSION="${VERSION#v}"
ARCH="${2:-amd64}"

case "$ARCH" in
  amd64) PKG_ARCH="x64" ;;
  arm64) PKG_ARCH="arm64" ;;
  *) echo "Unsupported ARCH: $ARCH (use amd64 or arm64)" >&2; exit 1 ;;
esac

PKG_NAME="direct-print-server"
BIN="dist/direct-print-linux-${PKG_ARCH}"
STAGE="dist/deb/${PKG_NAME}_${VERSION}_${ARCH}"
OUT="dist/${PKG_NAME}_${VERSION}_${ARCH}.deb"

echo "==> Building ${PKG_NAME} ${VERSION} (${ARCH})"

# 1. Standalone executable (Node runtime + app + public/ assets bundled)
if [ ! -x "$BIN" ] || [ "${REBUILD:-0}" = "1" ]; then
  echo "==> Compiling executable with pkg (node20-linux-${PKG_ARCH})"
  npx --yes @yao-pkg/pkg . --targets "node20-linux-${PKG_ARCH}" --output "$BIN"
fi
chmod 755 "$BIN"

# 2. Package tree
rm -rf "$STAGE"
install -d "$STAGE/DEBIAN" \
           "$STAGE/usr/bin" \
           "$STAGE/lib/systemd/system" \
           "$STAGE/usr/share/applications" \
           "$STAGE/usr/share/pixmaps" \
           "$STAGE/usr/share/doc/${PKG_NAME}"

install -m 755 "$BIN"                                   "$STAGE/usr/bin/${PKG_NAME}"
install -m 644 scripts/linux/${PKG_NAME}.service        "$STAGE/lib/systemd/system/${PKG_NAME}.service"
install -m 644 scripts/linux/${PKG_NAME}.desktop        "$STAGE/usr/share/applications/${PKG_NAME}.desktop"
install -m 644 public/logo.png                          "$STAGE/usr/share/pixmaps/${PKG_NAME}.png"
for s in postinst prerm postrm; do
  install -m 755 "scripts/linux/$s" "$STAGE/DEBIAN/$s"
done

cat > "$STAGE/usr/share/doc/${PKG_NAME}/README" <<EOF
Direct Print Server ${VERSION}
==============================

Web interface : http://localhost:4000
Service       : sudo systemctl {start|stop|restart|status} ${PKG_NAME}
Logs          : sudo journalctl -u ${PKG_NAME} -f
Uninstall     : sudo apt remove ${PKG_NAME}

Printers must be configured in CUPS (Settings > Printers, or http://localhost:631).
Check with: lpstat -p -d

https://github.com/aiqbalsyah/direct-print-utils-pos
EOF
chmod 644 "$STAGE/usr/share/doc/${PKG_NAME}/README"

INSTALLED_KB="$(du -sk "$STAGE" | cut -f1)"

cat > "$STAGE/DEBIAN/control" <<EOF
Package: ${PKG_NAME}
Version: ${VERSION}
Section: utils
Priority: optional
Architecture: ${ARCH}
Depends: cups-client
Recommends: cups
Installed-Size: ${INSTALLED_KB}
Maintainer: aiqbalsyah <noreply@github.com>
Homepage: https://github.com/aiqbalsyah/direct-print-utils-pos
Description: Direct Print Server - thermal printer service for POS
 Local print server that receives ESC/POS receipt data from web POS
 applications over WebSocket/HTTP (port 4000) and prints it to CUPS
 or USB thermal printers. Runs as a systemd service.
EOF

# 3. Build
dpkg-deb --root-owner-group --build "$STAGE" "$OUT"
dpkg-deb --info "$OUT"
echo "==> Built $OUT"
