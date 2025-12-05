@echo off
REM Direct Print Windows Startup Script
REM This script starts the Direct Print server in the background

title Direct Print Server

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"

REM Change to the application directory
cd /d "%SCRIPT_DIR%"

REM Check if executable exists
if not exist "direct-print-win.exe" (
    echo Error: direct-print-win.exe not found!
    echo Please make sure this file is in the same directory as the executable.
    pause
    exit /b 1
)

REM Start the application in minimized window
echo Starting Direct Print Server...
echo Server will be available at: http://localhost:4000
echo.
echo This window can be closed - the server will continue running.
echo To stop the server, end the "direct-print-win.exe" process in Task Manager.
echo.

REM Start the executable (this will run in the current window)
direct-print-win.exe