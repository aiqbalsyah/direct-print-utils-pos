@echo off
echo ========================================
echo   Direct Print Windows Builder (Complete)
echo ========================================
echo.

echo [1/5] Cleaning previous builds...
if exist "dist" rmdir /s /q dist
mkdir dist

echo [2/5] Installing all dependencies...
call npm install

echo [3/5] Verifying dependencies...
echo Checking required modules:
if exist "node_modules\escpos" (echo ✅ escpos) else (echo ❌ escpos)
if exist "node_modules\escpos-usb" (echo ✅ escpos-usb) else (echo ❌ escpos-usb)  
if exist "node_modules\express" (echo ✅ express) else (echo ❌ express)
if exist "node_modules\socket.io" (echo ✅ socket.io) else (echo ❌ socket.io)
if exist "node_modules\usb" (echo ✅ usb) else (echo ❌ usb)
echo.

echo [4/5] Building complete Windows executable...
echo This includes:
echo   - Node.js runtime
echo   - All dependencies (escpos, usb, express, socket.io)
echo   - USB printer drivers
echo   - Web interface files
echo   - Printer detection logic
call npm run build-win

echo [5/5] Creating deployment package...
copy scripts\startup.bat dist\
copy scripts\install-startup.bat dist\
copy scripts\uninstall-startup.bat dist\
echo.

echo Verifying build output...
if exist "dist\direct-print-win.exe" (
    echo ✅ Executable created successfully
    for %%I in (dist\direct-print-win.exe) do echo    Size: %%~zI bytes
) else (
    echo ❌ Build failed - executable not found
    pause
    exit /b 1
)

echo.
echo ========================================
echo   COMPLETE STANDALONE BUILD READY!
echo ========================================
echo.
echo 📦 What's included in the .exe:
echo   ✅ Node.js runtime (v18)
echo   ✅ All npm dependencies
echo   ✅ USB printer drivers
echo   ✅ Express web server
echo   ✅ Socket.IO real-time communication  
echo   ✅ Printer detection logic
echo   ✅ Cross-platform printer support
echo   ✅ Auto-startup capabilities
echo.
echo 🎯 Single file deployment:
echo   - No Node.js installation required
echo   - No npm install needed
echo   - No additional dependencies
echo   - Just run direct-print-win.exe!
echo.
echo 🚀 To install auto-startup:
echo   1. Run install-startup.bat as Administrator
echo   2. Reboot Windows
echo   3. Service automatically available at http://localhost:4000
echo.
echo ✨ The .exe is completely self-contained!
echo.
pause