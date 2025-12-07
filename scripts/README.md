# Build Scripts Directory

This directory contains organized scripts for building installers across all platforms.

## Directory Structure

```
scripts/
├── macos/              # macOS DMG installer scripts
│   ├── app-wrapper.sh     # Auto-install wrapper for .app bundle
│   ├── Info.plist         # macOS app bundle metadata
│   └── README.txt         # User documentation for DMG
│
├── linux/              # Linux DEB package scripts
│   ├── postinst           # Post-installation script
│   ├── prerm              # Pre-removal script
│   ├── postrm             # Post-removal script
│   ├── direct-print-server.service   # Systemd service file
│   └── direct-print-server.desktop   # Desktop entry file
│
└── windows/            # Windows installer scripts
    ├── service/           # Windows Service scripts
    ├── startup/           # Auto-startup scripts
    └── wix/               # WiX installer scripts
```

## macOS Scripts (`macos/`)

### app-wrapper.sh
Auto-install wrapper that runs when user opens DirectPrintServer.app
- Detects if app is in /Applications
- Auto-installs LaunchAgent on first run
- Opens browser to localhost:4000
- Shows macOS notification

### Info.plist
macOS app bundle metadata
- Bundle identifier, version, icon
- System requirements

### README.txt
User-facing installation instructions included in DMG

## Linux Scripts (`linux/`)

### postinst
Post-installation script
- Sets permissions & removes extended attributes
- Fixes SELinux context
- Enables & starts systemd service
- Opens browser

### prerm / postrm
Removal scripts
- Stops and disables service
- Reloads systemd

### direct-print-server.service
Systemd service definition
- Auto-restart, runs as root, journal logging

### direct-print-server.desktop
Desktop environment integration
- Shows in application menu
- Custom icon support

## Windows Scripts (`windows/`)

### service/
- **install-service.js** - Installs as Windows Service
- **uninstall-service.js** - Removes Windows Service

### startup/
- **startup.bat** - Launches server
- **install-startup.bat** - Adds to Windows Startup
- **uninstall-startup.bat** - Removes from Startup

### wix/
- **pre-install.bat** - Pre-installation checks
- **post-install.bat** - Post-installation config
- **pre-uninstall.bat** - Pre-uninstallation cleanup

## Benefits

✅ **Cleaner Workflows** - No massive heredocs in YAML
✅ **Better Version Control** - Proper syntax highlighting and diffs
✅ **Easier Maintenance** - Update script in one place
✅ **Consistent Structure** - Same organization across platforms

## Usage in Workflows

**macOS:** `cp scripts/macos/app-wrapper.sh DirectPrintServer.app/Contents/MacOS/`
**Linux:** `cp scripts/linux/postinst direct-print-server_1.0.0_amd64/DEBIAN/`
**Windows:** `xcopy /E /I /Y "scripts\windows" "installer\scripts"`