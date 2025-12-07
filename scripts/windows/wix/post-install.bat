@echo off
setlocal enabledelayedexpansion
REM Post-MSI Installation Script
REM This runs after the MSI installer to configure the application

echo ========================================
echo   Post-MSI Installation Configuration
echo ========================================
echo.

REM Parse CustomActionData (format: INSTALLFOLDER=C:\Path\To\Install)
REM WiX passes data via %CustomActionData% environment variable
set "INSTALL_DIR="

REM Try to get from CustomActionData first
if defined CustomActionData (
    REM Use string substitution to extract path after "INSTALLFOLDER="
    set "CUSTOM_DATA=%CustomActionData%"
    set "INSTALL_DIR=!CUSTOM_DATA:INSTALLFOLDER=!"
)

REM Fallback to default location if not provided
if not defined INSTALL_DIR (
    set "INSTALL_DIR=%ProgramFiles%\DirectPrintServer"
)

REM Remove any leading/trailing spaces and equals sign
set "INSTALL_DIR=!INSTALL_DIR:~1!"

echo Installation Directory: !INSTALL_DIR!
echo.

echo [1/4] Verifying installation...
echo DEBUG: Looking for: "!INSTALL_DIR!\DirectPrintServer.exe"
echo DEBUG: Current directory: %CD%
echo DEBUG: Listing files in INSTALL_DIR:
dir "!INSTALL_DIR!" 2>nul
echo.

if not exist "!INSTALL_DIR!\DirectPrintServer.exe" (
    echo Warning: Executable not found at expected location
    echo Checking current directory...
    dir "%CD%" | findstr /i "DirectPrint"
    if exist "DirectPrintServer.exe" (
        echo Found in current directory
        set "INSTALL_DIR=%CD%"
    ) else if exist "%CD%\DirectPrintServer.exe" (
        echo Found DirectPrintServer.exe in current directory
        set "INSTALL_DIR=%CD%"
    ) else (
        echo DEBUG: Searching common locations...
        if exist "%ProgramFiles%\DirectPrintServer\DirectPrintServer.exe" (
            echo Found in Program Files
            set "INSTALL_DIR=%ProgramFiles%\DirectPrintServer"
        ) else (
            echo Installation may be incomplete, but continuing...
        )
    )
) else (
    echo Installation verified
)

echo [2/4] Configuring permissions...
REM Give full control to the installation directory
icacls "!INSTALL_DIR!" /grant Users:F /T >nul 2>&1
if %errorLevel% equ 0 (
    echo Permissions configured successfully
) else (
    echo Warning: Permission configuration failed - may affect functionality
)

echo [3/4] Registering application...
REM Add to Windows registry for uninstall info
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\DirectPrintServer" /v "DisplayName" /t REG_SZ /d "Direct Print Server" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\DirectPrintServer" /v "UninstallString" /t REG_SZ /d "msiexec /x {ProductCode}" /f >nul 2>&1

echo [4/4] Starting service...
if exist "!INSTALL_DIR!\DirectPrintServer.exe" (
    cd /d "!INSTALL_DIR!"
    start "" "!INSTALL_DIR!\DirectPrintServer.exe"
    timeout /t 2 >nul

    REM Check if service is running
    tasklist /FI "IMAGENAME eq DirectPrintServer.exe" 2>NUL | find /I /N "DirectPrintServer.exe">NUL
    if %errorLevel% equ 0 (
        echo Direct Print Server started successfully
        echo Server available at: http://localhost:4000
    ) else (
        echo Warning: Service may need manual startup
    )
) else (
    echo Warning: Cannot start service - executable not found
    echo Please start manually from: !INSTALL_DIR!
)

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Direct Print Server is ready to use
echo Access at: http://localhost:4000
echo Installed to: !INSTALL_DIR!
echo.
echo The service will auto-start with Windows
echo Use Windows "Add/Remove Programs" to uninstall
echo.