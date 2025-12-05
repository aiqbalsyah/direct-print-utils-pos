# GitHub Actions Build Instructions

## 🚀 Automated Windows Builds

This repository includes GitHub Actions workflows to build Windows executables correctly, avoiding USB dependency issues.

### Available Workflows:

#### 1. **Windows-Safe Build** (Recommended for Windows)
- **File**: `.github/workflows/windows-safe.yml`
- **Purpose**: Creates USB-free Windows build
- **Trigger**: Manual or on source changes
- **Output**: `direct-print-windows-safe.exe`

#### 2. **Standard Windows Build**
- **File**: `.github/workflows/build-windows.yml`  
- **Purpose**: Standard build with full features
- **Output**: `direct-print-win.exe`

#### 3. **Multi-Platform Build**
- **File**: `.github/workflows/build-all.yml`
- **Purpose**: Builds for Windows, macOS, and Linux
- **Output**: Multiple executables

## 🛠️ How to Use

### Automatic Builds
1. **Push to main/master** - Triggers automatic builds
2. **Create a tag** (e.g., `v1.0.0`) - Creates a GitHub release
3. **Manual trigger** - Use "Actions" tab in GitHub

### Manual Release
1. Go to **Actions** tab
2. Select **Windows USB-Safe Build**
3. Click **Run workflow**
4. Enable **"Create GitHub Release"**
5. Download from **Releases** page

## 📦 Build Outputs

### Windows-Safe Build (Recommended):
- ✅ **No USB dependencies** - Eliminates Windows USB errors
- ✅ **System printers only** - Works with any Windows printer
- ✅ **Smaller file size** - No unnecessary USB libraries
- ✅ **More reliable** - Tested specifically for Windows deployment

### Standard Build:
- ✅ **Full features** - USB + System printer support
- ⚠️ **May have USB issues** on some Windows systems
- ✅ **Cross-platform** - Works on macOS/Linux too

## 🎯 Recommended for Production

**Use the Windows-Safe build** for Windows deployment:
1. More reliable on Windows systems
2. No "usb.on is not a function" errors
3. Works with any Windows printer
4. Smaller, cleaner deployment package

The Windows-safe version automatically:
- Detects Windows default printer
- Handles "UMUM" printer type
- Uses system print commands
- Avoids all USB native module issues

## 🔄 Setting Up Auto-Releases

To automatically create releases on version tags:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This will trigger the build and create a GitHub release with the executables attached.

## ✅ Benefits of GitHub Actions Build

- **Windows Environment**: Built on actual Windows runners
- **Proper Dependencies**: Correct Windows toolchain
- **No Cross-compilation Issues**: Native Windows build process  
- **Automatic Testing**: Validates build success
- **Release Automation**: Automatic GitHub releases
- **Consistent Builds**: Same environment every time

Your Windows executable will be properly compiled and tested! 🎉