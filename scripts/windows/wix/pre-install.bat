@echo off
REM Pre-MSI Installation Script
REM NOTE: This script is currently NOT executed by the MSI installer
REM It is included for future use or manual pre-installation checks

echo ========================================
echo   Pre-MSI Installation Preparation
echo ========================================
echo.

echo [1/3] Checking system requirements...
echo Verifying Windows version...
ver | find "Windows" >nul
if %errorLevel% neq 0 (
    echo ERROR: This installer requires Windows operating system
    exit /b 1
) else (
    echo Windows detected
)

echo [2/3] Checking for existing installations...
sc query "DirectPrint Service" >nul 2>&1
if %errorLevel% equ 0 (
    echo Warning: Existing DirectPrint Service found
    echo Stopping existing service...
    sc stop "DirectPrint Service" >nul 2>&1
    timeout /t 3 >nul
) else (
    echo No existing service found
)

echo [3/3] Checking permissions...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Warning: Administrator privileges recommended for service installation
) else (
    echo Administrator privileges detected
)

echo.
echo Pre-installation checks completed
echo Ready for MSI installation
echo.