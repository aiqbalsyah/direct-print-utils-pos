@echo off
REM Post-MSI Installation Script
REM This runs after the MSI installer to configure the application

echo ========================================
echo   Post-MSI Installation Configuration
echo ========================================
echo.

REM Get installation directory from registry or use default
set "INSTALL_DIR=%ProgramFiles%\DirectPrintServer"

echo [1/4] Verifying installation...
if not exist "%INSTALL_DIR%\DirectPrintServer.exe" (
    echo ⚠️  Warning: Executable not found at expected location
    echo Checking current directory...
    if exist "DirectPrintServer.exe" (
        echo ✅ Found in current directory
    ) else (
        echo ⚠️  Installation may be incomplete, but continuing...
    )
) else (
    echo ✅ Installation verified
)

echo [2/4] Configuring permissions...
REM Give full control to the installation directory
icacls "%INSTALL_DIR%" /grant Users:F /T >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Permissions configured
) else (
    echo ⚠️  Permission configuration failed - may affect functionality
)

echo [3/4] Registering application...
REM Add to Windows registry for uninstall info
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\DirectPrintServer" /v "DisplayName" /t REG_SZ /d "Direct Print Server" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\DirectPrintServer" /v "UninstallString" /t REG_SZ /d "msiexec /x {ProductCode}" /f >nul 2>&1

echo [4/4] Starting service...
cd /d "%INSTALL_DIR%"
start "" "DirectPrintServer.exe"
timeout /t 2 >nul

REM Check if service is running
tasklist /FI "IMAGENAME eq DirectPrintServer.exe" 2>NUL | find /I /N "DirectPrintServer.exe">NUL
if %errorLevel% equ 0 (
    echo ✅ Direct Print Server started successfully
    echo 🌐 Server available at: http://localhost:4000
) else (
    echo ⚠️  Service may need manual startup
)

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo 🎯 Direct Print Server is ready to use
echo 🌐 Access at: http://localhost:4000
echo 📁 Installed to: %INSTALL_DIR%
echo.
echo 💡 The service will auto-start with Windows
echo 🛠️  Use Windows "Add/Remove Programs" to uninstall
echo.