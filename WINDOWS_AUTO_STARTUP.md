# Windows Auto-Startup Setup Guide

## 🚀 Quick Start

### 1. Build for Windows
```bash
# Run this command to build Windows executable
build-windows.bat
```

### 2. Install Auto-Startup
```bash
# Run as Administrator to install auto-startup
cd dist
install-startup.bat
```

## 📋 What Gets Created

### Build Output (`dist/` folder):
- `direct-print-win.exe` - Main application executable
- `startup.bat` - Manual startup script
- `install-startup.bat` - Auto-startup installer
- `uninstall-startup.bat` - Auto-startup remover

## 🔧 Auto-Startup Methods

### Method 1: Windows Startup Folder (Recommended)
- Automatically copies startup script to Windows startup folder
- Starts when user logs in
- Easy to manage and remove

### Method 2: Windows Service
- Runs as system service
- Starts before user login
- More robust but requires admin rights

## 🛠️ Installation Steps

### For Users:
1. **Build the Application**
   ```
   Double-click: build-windows.bat
   ```

2. **Install Auto-Startup**
   ```
   Right-click dist/install-startup.bat → "Run as administrator"
   ```

3. **Verify Installation**
   - Restart computer
   - Check if server is running: http://localhost:4000
   - Look for "DirectPrint-AutoStart.bat" in startup folder

### Manual Installation:
1. Copy `dist/startup.bat` and `dist/direct-print-win.exe` to desired folder
2. Copy `startup.bat` to: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`

## 🎯 How It Works

### On Windows Boot:
1. **System starts** → Windows loads startup programs
2. **DirectPrint-AutoStart.bat runs** → Starts the executable in background
3. **Server becomes available** → http://localhost:4000 is ready
4. **Frontend can connect** → Your printing system works automatically

### Background Operation:
- Runs minimized/hidden
- No user interaction required
- Automatic printer detection
- Handles USB and system printers

## 🛡️ Troubleshooting

### Server Not Starting:
1. Check Windows Event Viewer for errors
2. Run `startup.bat` manually to see error messages
3. Verify printer drivers are installed
4. Check firewall settings for port 4000

### Remove Auto-Startup:
```bash
# Run as Administrator
uninstall-startup.bat
```

### Manual Check:
- Task Manager → Check if "direct-print-win.exe" is running
- Services → Look for "DirectPrintService" if using service method

## 📁 File Structure
```
direct-print/
├── build-windows.bat          # Main build script
├── quick-build.bat           # Quick development build
├── scripts/
│   ├── startup.bat           # Startup script template
│   ├── install-startup.bat   # Auto-startup installer
│   └── uninstall-startup.bat # Auto-startup remover
└── dist/                     # Build output
    ├── direct-print-win.exe  # Main executable
    ├── startup.bat           # Ready-to-use startup script
    ├── install-startup.bat   # Installer
    └── uninstall-startup.bat # Uninstaller
```

## 🎯 User Instructions

### For End Users:
> "Just run `build-windows.bat` to create the Windows version, then run `install-startup.bat` as Administrator. The printing service will automatically start every time Windows boots up!"

### For IT Deployment:
> "Copy the `dist/` folder to target machines and run `install-startup.bat` as Administrator. The service will be installed and start automatically on system boot."

## ✅ Benefits

- **Zero Configuration**: Auto-detects printers on startup
- **Background Operation**: Runs silently without user interaction  
- **System Integration**: Properly integrated with Windows startup
- **Easy Management**: Simple install/uninstall process
- **Cross-Printer Support**: Works with USB and system printers
- **Network Ready**: Accessible via http://localhost:4000

Your Windows deployment is now complete! 🎉