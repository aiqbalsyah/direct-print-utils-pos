@echo off
REM Pre-MSI Uninstallation Script
REM This runs before the MSI uninstaller to clean up

echo ========================================
echo   Pre-MSI Uninstallation Cleanup
echo ========================================
echo.

REM Get installation directory
set "INSTALL_DIR=%ProgramFiles%\DirectPrintServer"

echo [1/3] Stopping Direct Print Service...
tasklist /FI "IMAGENAME eq direct-print-win.exe" 2>NUL | find /I /N "direct-print-win.exe">NUL
if %errorLevel% equ 0 (
    echo 🛑 Stopping running service...
    taskkill /F /IM "direct-print-win.exe" >nul 2>&1
    timeout /t 2 >nul
    echo ✅ Service stopped
) else (
    echo ✅ Service not running
)

echo [2/3] Removing Windows service (if registered)...
sc query "DirectPrint Service" >nul 2>&1
if %errorLevel% equ 0 (
    echo 🛑 Removing Windows service...
    sc stop "DirectPrint Service" >nul 2>&1
    sc delete "DirectPrint Service" >nul 2>&1
    echo ✅ Service removed
) else (
    echo ✅ No Windows service found
)

echo [3/3] Cleaning registry entries...
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\DirectPrintServer" /f >nul 2>&1
reg delete "HKCU\SOFTWARE\DirectPrintServer" /f >nul 2>&1

echo.
echo ✅ Pre-uninstallation cleanup completed
echo 🗑️  Ready for MSI uninstallation
echo.