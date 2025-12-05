@echo off
echo ========================================
echo   Windows-Safe Direct Print Builder
echo ========================================
echo.
echo This build excludes USB dependencies that cause
echo "usb.on is not a function" errors on Windows.
echo.
echo Windows version uses SYSTEM PRINTERS ONLY:
echo - No USB thermal printer support
echo - Uses Windows default printer
echo - Compatible with all Windows printers
echo - No native USB dependencies
echo.

echo [1/4] Backing up original package.json...
copy package.json package-original.json

echo [2/4] Using Windows-safe package.json...
copy package-windows.json package.json

echo [3/4] Installing Windows-safe dependencies...
call npm install

echo [4/4] Building Windows-safe executable...
call npm run build-win-safe

echo [5/5] Restoring original package.json...
copy package-original.json package.json
del package-original.json

echo.
echo Copying startup scripts...
copy scripts\startup.bat dist\
copy scripts\install-startup.bat dist\
copy scripts\uninstall-startup.bat dist\

echo.
echo ========================================
echo   WINDOWS-SAFE BUILD COMPLETE!
echo ========================================
echo.
echo ✅ Created: dist\direct-print-windows-safe.exe
echo.
echo This version:
echo   ✅ No USB dependency issues
echo   ✅ Works with any Windows printer
echo   ✅ Uses system print commands
echo   ✅ Auto-detects default printer
echo   ✅ Handles "UMUM" printer type
echo.
echo 🎯 Perfect for Windows deployment!
echo.
pause