#!/usr/bin/env bash
# One-line installer for Ubuntu/Debian:
#   curl -fsSL https://raw.githubusercontent.com/aiqbalsyah/direct-print-utils-pos/main/scripts/linux/install.sh | sudo bash
#
# Optional: VERSION=1.0.0 to pin a release (default: latest release that has a .deb).
set -euo pipefail

REPO="aiqbalsyah/direct-print-utils-pos"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root, e.g.: curl -fsSL <url> | sudo bash" >&2
  exit 1
fi

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This installer supports Debian/Ubuntu (apt) only." >&2
  exit 1
fi

case "$(dpkg --print-architecture)" in
  amd64) ARCH=amd64 ;;
  arm64) ARCH=arm64 ;;
  *) echo "Unsupported architecture: $(dpkg --print-architecture)" >&2; exit 1 ;;
esac

for cmd in curl; do
  command -v "$cmd" >/dev/null 2>&1 || { apt-get update -qq && apt-get install -y -qq "$cmd"; }
done

if [ -n "${VERSION:-}" ]; then
  API="https://api.github.com/repos/${REPO}/releases/tags/v${VERSION#v}"
  RELEASES="[$(curl -fsSL "$API")]"
else
  RELEASES="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases?per_page=20")"
fi

# First matching asset URL, newest release first.
URL="$(printf '%s' "$RELEASES" \
  | grep -o "\"browser_download_url\": *\"[^\"]*linux-${ARCH}\.deb\"" \
  | head -n1 | sed 's/.*"\(https[^"]*\)"$/\1/')"

if [ -z "$URL" ]; then
  echo "No linux-${ARCH}.deb found in releases of ${REPO}." >&2
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
chmod 755 "$TMP"  # let apt's _apt user read the file
DEB="$TMP/$(basename "$URL")"

echo "==> Downloading $URL"
curl -fL --progress-bar -o "$DEB" "$URL"
chmod 644 "$DEB"

echo "==> Installing (dependencies resolved by apt)"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y "$DEB"

echo "==> Done. Open http://localhost:4000"
