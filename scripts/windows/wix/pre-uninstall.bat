@echo off
REM Pre-MSI Uninstallation Script
REM This runs before the MSI uninstaller to clean up

echo ========================================
echo   Pre-MSI Uninstallation Cleanup
echo ========================================
echo.

REM Get installation directory
set "INSTALL_DIR=%ProgramFiles%\DirectPrintServer"

echo [1/5] Stopping Direct Print Service...
REM Check for both executable names (MSI uses DirectPrintServer.exe, manual uses direct-print-win.exe)
tasklist /FI "IMAGENAME eq DirectPrintServer.exe" 2>NUL | find /I /N "DirectPrintServer.exe">NUL
if %errorLevel% equ 0 (
    echo 🛑 Stopping DirectPrintServer.exe...
    taskkill /F /IM "DirectPrintServer.exe" >nul 2>&1
    timeout /t 2 >nul
    echo ✅ DirectPrintServer.exe stopped
) else (
    echo ✅ DirectPrintServer.exe not running
)

tasklist /FI "IMAGENAME eq direct-print-win.exe" 2>NUL | find /I /N "direct-print-win.exe">NUL
if %errorLevel% equ 0 (
    echo 🛑 Stopping direct-print-win.exe...
    taskkill /F /IM "direct-print-win.exe" >nul 2>&1
    timeout /t 2 >nul
    echo ✅ direct-print-win.exe stopped
) else (
    echo ✅ direct-print-win.exe not running
)

echo [2/5] Removing Windows services (all variants)...
REM Remove service with space in name
sc query "DirectPrint Service" >nul 2>&1
if %errorLevel% equ 0 (
    echo 🛑 Removing "DirectPrint Service"...
    sc stop "DirectPrint Service" >nul 2>&1
    sc delete "DirectPrint Service" >nul 2>&1
    echo ✅ Service removed
) else (
    echo ✅ Service "DirectPrint Service" not found
)

REM Remove service without space in name
sc query "DirectPrintService" >nul 2>&1
if %errorLevel% equ 0 (
    echo 🛑 Removing "DirectPrintService"...
    sc stop "DirectPrintService" >nul 2>&1
    sc delete "DirectPrintService" >nul 2>&1
    echo ✅ Service removed
) else (
    echo ✅ Service "DirectPrintService" not found
)

echo [3/5] Removing startup folder entry...
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
if exist "%STARTUP_FOLDER%\DirectPrint-AutoStart.bat" (
    echo 🛑 Removing startup script...
    del /f "%STARTUP_FOLDER%\DirectPrint-AutoStart.bat" >nul 2>&1
    echo ✅ Startup script removed
) else (
    echo ✅ Startup script not found
)

echo [4/5] Cleaning registry entries...
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\DirectPrintServer" /f >nul 2>&1
reg delete "HKCU\SOFTWARE\DirectPrintServer" /f >nul 2>&1
echo ✅ Registry cleaned

echo [5/5] Removing Start Menu shortcuts...
set "PROGRAMS_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Direct Print Server"
if exist "%PROGRAMS_FOLDER%" (
    echo 🛑 Removing Start Menu folder...
    rd /s /q "%PROGRAMS_FOLDER%" >nul 2>&1
    echo ✅ Start Menu shortcuts removed
) else (
    echo ✅ Start Menu shortcuts not found
)

echo.
echo ✅ Pre-uninstallation cleanup completed
echo 🗑️  Ready for MSI uninstallation
echo.