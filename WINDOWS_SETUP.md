# Windows Setup Guide for USB Printing

This guide helps resolve the "usb.on is not a function" error on Windows.

## Prerequisites for Windows

1. **Install Visual Studio Build Tools**
   ```bash
   # Download and install Visual Studio Build Tools from:
   # https://visualstudio.microsoft.com/visual-cpp-build-tools/
   ```

2. **Install Python (Required for node-gyp)**
   ```bash
   # Download Python 3.x from: https://www.python.org/downloads/
   # Make sure to check "Add Python to PATH" during installation
   ```

3. **Install Windows Build Tools (Run as Administrator)**
   ```bash
   npm install --global windows-build-tools
   ```

4. **Install node-gyp globally**
   ```bash
   npm install -g node-gyp
   ```

## Setup Steps

1. **Clean install dependencies**
   ```bash
   # Remove existing node_modules
   rm -rf node_modules package-lock.json
   
   # Install dependencies
   npm install
   ```

2. **If USB library still fails, try rebuilding**
   ```bash
   npm rebuild usb
   npm rebuild escpos-usb
   ```

3. **Alternative: Install specific versions**
   ```bash
   npm uninstall usb escpos-usb
   npm install usb@2.9.0 escpos-usb@3.0.0-alpha.4
   ```

## Troubleshooting

### Error: "usb.on is not a function"
- This usually means the USB library didn't compile properly
- Try the rebuild steps above
- Check that your printer is properly connected and drivers are installed

### Error: "Cannot find module 'usb'"
- Run: `npm install usb --build-from-source`

### Error: "MSBuild not found"
- Install Visual Studio Build Tools as mentioned in prerequisites

### Error: "Python not found"
- Install Python and make sure it's in your PATH
- Set Python path: `npm config set python C:\Python3x\python.exe`

## Testing USB Connection

```javascript
// Test script to check USB devices
const usb = require('usb');
console.log('USB devices:', usb.getDeviceList());
```

## Printer Driver Requirements

1. Make sure your printer drivers are installed
2. The printer should be visible in Windows Device Manager
3. Test printing from Windows first to ensure driver compatibility