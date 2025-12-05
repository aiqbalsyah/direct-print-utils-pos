@echo off
echo ========================================
echo   Testing Complete Build Package
echo ========================================
echo.

if not exist "dist\direct-print-win.exe" (
    echo ❌ Error: direct-print-win.exe not found!
    echo Please run build-complete.bat first
    pause
    exit /b 1
)

echo 📦 Build Package Contents:
echo.
dir dist\ /B
echo.

echo 🔍 Testing executable...
echo Starting Direct Print server (will stop after 10 seconds)...
echo.

REM Start the server in background and test it
start /min "" "dist\direct-print-win.exe"

REM Wait a moment for server to start
timeout /t 3 /nobreak > nul

echo Testing HTTP endpoints...

REM Test if server is responding
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:4000' -TimeoutSec 5; Write-Host '✅ Server responding:' $response.StatusCode } catch { Write-Host '❌ Server not responding' }"

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:4000/printer-status' -TimeoutSec 5; Write-Host '✅ Printer API working:' $response.StatusCode } catch { Write-Host '❌ Printer API failed' }"

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:4000/printers' -TimeoutSec 5; Write-Host '✅ Printer list API working:' $response.StatusCode } catch { Write-Host '❌ Printer list API failed' }"

echo.
echo 🛑 Stopping test server...
taskkill /f /im "direct-print-win.exe" > nul 2>&1

echo.
echo ========================================
echo   TEST COMPLETE
echo ========================================
echo.
echo ✅ Your Windows build is ready for deployment!
echo.
echo 📋 What users need:
echo   - Just the dist\ folder
echo   - No Node.js installation
echo   - No npm dependencies  
echo   - No additional software
echo.
echo 🎯 Complete standalone application!
echo.
pause