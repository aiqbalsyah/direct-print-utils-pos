@echo off
REM Quick build script for development
echo Building Direct Print for Windows...

call npm install
call npm run build-win

echo Build complete! Check dist/ folder for the executable.
pause