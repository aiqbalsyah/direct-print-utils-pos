@echo off
REM Install Direct Print to Windows Startup
REM Run this as Administrator

echo ========================================
echo   Installing Direct Print Auto-Start
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

REM Get current directory
set "CURRENT_DIR=%~dp0"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo Current directory: %CURRENT_DIR%
echo Startup folder: %STARTUP_FOLDER%
echo.

REM Check if executable exists
if not exist "%CURRENT_DIR%direct-print-win.exe" (
    echo Error: direct-print-win.exe not found in current directory!
    echo Please run this script from the same folder as the executable.
    pause
    exit /b 1
)

REM Create startup batch file
echo Creating startup script...
(
echo @echo off
echo cd /d "%CURRENT_DIR%"
echo start /min "" "%CURRENT_DIR%direct-print-win.exe"
) > "%STARTUP_FOLDER%\DirectPrint-AutoStart.bat"

REM Create Windows Service (alternative method)
echo.
echo Installing as Windows Service...
sc create "DirectPrintService" binPath= "%CURRENT_DIR%direct-print-win.exe" start= auto DisplayName= "Direct Print Server"
sc description "DirectPrintService" "Automatic printing service for direct printer access"

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Direct Print has been installed to start automatically on Windows boot.
echo.
echo Two methods have been configured:
echo   1. Startup folder: DirectPrint-AutoStart.bat
echo   2. Windows Service: DirectPrintService
echo.
echo The server will be available at: http://localhost:4000
echo.
echo To uninstall, run: uninstall-startup.bat
echo.
pause