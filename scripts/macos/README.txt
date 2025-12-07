==================================================
   Direct Print Server for macOS - v1.0.0
==================================================

SUPER EASY INSTALLATION
=======================
1. Drag "DirectPrintServer.app" to Applications folder
2. Double-click to open
3. Done!

The app will automatically:
• Install LaunchAgent for auto-startup
• Start the print server
• Open browser to http://localhost:4000
• Show a notification when ready

FIRST RUN - SECURITY NOTICE
===========================
If you see "DirectPrintServer is damaged":

Option 1 (Terminal):
  xattr -cr /Applications/DirectPrintServer.app
  open /Applications/DirectPrintServer.app

Option 2 (System Preferences):
  System Preferences → Security & Privacy → Click "Open Anyway"

This is normal for unsigned apps. The app is NOT damaged.

VERIFY INSTALLATION
===================
• Check service: launchctl list | grep directprintserver
• Open browser: http://localhost:4000
• View logs: tail -f /tmp/direct-print-server.log

UNINSTALLATION
==============
1. Stop service:
   launchctl stop com.aiqbalsyah.directprintserver
   launchctl unload ~/Library/LaunchAgents/com.aiqbalsyah.directprintserver.plist

2. Delete files:
   rm ~/Library/LaunchAgents/com.aiqbalsyah.directprintserver.plist
   rm -rf /Applications/DirectPrintServer.app
   rm /tmp/direct-print-server*.log

REQUIREMENTS
============
• macOS 10.13 (High Sierra) or later
• CUPS (pre-installed on macOS)
• Printer configured in System Preferences

TROUBLESHOOTING
===============
Service won't start?
→ Check logs: cat /tmp/direct-print-server-error.log
→ Check port: lsof -i:4000
→ Check printers: lpstat -p -d

Browser doesn't open?
→ Manually visit: http://localhost:4000

SUPPORT
=======
GitHub: https://github.com/aiqbalsyah/direct-print-utils-pos
Issues: https://github.com/aiqbalsyah/direct-print-utils-pos/issues
