@echo off
REM Uninstall Direct Print from Windows Startup
REM Run this as Administrator

echo ========================================
echo   Uninstalling Direct Print Auto-Start
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Error: This script must be run as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo Removing startup script...
if exist "%STARTUP_FOLDER%\DirectPrint-AutoStart.bat" (
    del "%STARTUP_FOLDER%\DirectPrint-AutoStart.bat"
    echo Startup script removed.
) else (
    echo Startup script not found.
)

echo.
echo Removing Windows Service...
sc stop "DirectPrintService" >nul 2>&1
sc delete "DirectPrintService" >nul 2>&1
echo Service removed.

echo.
echo Stopping any running Direct Print processes...
taskkill /f /im "direct-print-win.exe" >nul 2>&1

echo.
echo ========================================
echo   Uninstallation Complete!
echo ========================================
echo.
echo Direct Print has been removed from Windows startup.
echo All processes have been stopped.
echo.
pause