# Scripts Organization

This folder contains organized Windows-specific scripts for the Direct Print Server.

## Structure

```
scripts/
├── windows/
│   ├── service/          # Windows Service management
│   │   ├── install-service.js
│   │   └── uninstall-service.js
│   ├── startup/          # Windows Startup management  
│   │   ├── startup.bat
│   │   ├── install-startup.bat
│   │   └── uninstall-startup.bat
│   └── wix/             # MSI Installer scripts
│       ├── pre-install.bat
│       ├── post-install.bat
│       └── pre-uninstall.bat
└── README.md

```

## Usage

### Service Scripts (windows/service/)
- **install-service.js** - Installs Direct Print as Windows Service
- **uninstall-service.js** - Removes Direct Print Windows Service

### Startup Scripts (windows/startup/)  
- **startup.bat** - Launches Direct Print Server
- **install-startup.bat** - Adds to Windows Startup folder
- **uninstall-startup.bat** - Removes from Windows Startup

### WiX MSI Scripts (windows/wix/)
- **pre-install.bat** - Pre-installation system checks
- **post-install.bat** - Post-installation configuration
- **pre-uninstall.bat** - Pre-uninstallation cleanup

## Build Integration

The `build-complete.bat` automatically copies these scripts to the `dist/scripts/` folder during build.

The GitHub Actions workflow uses the WiX scripts for MSI installer integration.