@echo off
echo ========================================
echo   Direct Print Windows Builder
echo ========================================
echo.

echo [1/4] Cleaning previous builds...
if exist "dist" rmdir /s /q dist
mkdir dist

echo [2/4] Installing dependencies...
call npm install

echo [3/4] Building Windows executable...
call npm run build-win

echo [4/4] Creating startup files...
copy scripts\startup.bat dist\
copy scripts\install-startup.bat dist\
copy scripts\uninstall-startup.bat dist\

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Executable created: dist\direct-print-win.exe
echo.
echo To install as startup service:
echo   1. Run dist\install-startup.bat as Administrator
echo   2. Or manually copy dist\startup.bat to Windows Startup folder
echo.
echo Startup folder location:
echo   %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
echo.
pause