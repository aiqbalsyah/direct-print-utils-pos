#!/bin/bash

# DirectPrintServer Auto-Install Wrapper
# This script automatically sets up LaunchAgent on first run

APP_PATH="/Applications/DirectPrintServer.app"
LAUNCH_AGENT_DIR="$HOME/Library/LaunchAgents"
LAUNCH_AGENT_PLIST="$LAUNCH_AGENT_DIR/com.aiqbalsyah.directprintserver.plist"
LABEL="com.aiqbalsyah.directprintserver"

# Check if we're running from /Applications
CURRENT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Function to install LaunchAgent
install_launch_agent() {
    mkdir -p "$LAUNCH_AGENT_DIR"

    cat > "$LAUNCH_AGENT_PLIST" << 'PLIST_EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.aiqbalsyah.directprintserver</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Applications/DirectPrintServer.app/Contents/MacOS/direct-print-server-bin</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/direct-print-server.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/direct-print-server-error.log</string>
</dict>
</plist>
PLIST_EOF

    # Load the LaunchAgent
    launchctl unload "$LAUNCH_AGENT_PLIST" 2>/dev/null || true
    launchctl load "$LAUNCH_AGENT_PLIST"
    launchctl start "$LABEL"
}

# If app is in /Applications and LaunchAgent not installed, install it
if [[ "$CURRENT_PATH" == "$APP_PATH" ]]; then
    if [[ ! -f "$LAUNCH_AGENT_PLIST" ]]; then
        echo "First run detected. Installing LaunchAgent for auto-startup..."
        install_launch_agent

        # Open browser after installation
        sleep 2
        open "http://localhost:4000/index.html" 2>/dev/null || true

        # Show notification
        osascript -e 'display notification "Direct Print Server is now running at http://localhost:4000" with title "Direct Print Server Started"' 2>/dev/null || true

        echo "✅ Direct Print Server installed and started!"
        echo "   Access at: http://localhost:4000"
        exit 0
    else
        # LaunchAgent already exists, just ensure it's running
        if ! launchctl list | grep -q "$LABEL"; then
            launchctl start "$LABEL" 2>/dev/null || true
        fi

        # Open browser
        open "http://localhost:4000/index.html" 2>/dev/null || true
        exit 0
    fi
else
    # Running from DMG or other location - just start the server directly
    echo "Running from: $CURRENT_PATH"
    echo "For auto-startup, please move to /Applications first"
    exec "$CURRENT_PATH/Contents/MacOS/direct-print-server-bin"
fi
