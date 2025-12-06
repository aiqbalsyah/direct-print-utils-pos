# 🖨️ Direct Print Server

> **Thermal Printer Service untuk Windows, Mac, dan Linux**
>
> Server printing yang mendukung thermal printer dan system printer dengan WebSocket real-time tracking.

[![GitHub Release](https://img.shields.io/github/v/release/aiqbalsyah/direct-print-utils-pos)](https://github.com/aiqbalsyah/direct-print-utils-pos/releases)
[![GitHub Issues](https://img.shields.io/github/issues/aiqbalsyah/direct-print-utils-pos)](https://github.com/aiqbalsyah/direct-print-utils-pos/issues)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
  - [Windows (MSI/EXE)](#-windows)
  - [Linux (DEB)](#-linux)
  - [macOS (DMG)](#-macos)
  - [Manual Installation](#-manual-installation)
- [Penggunaan](#-penggunaan)
- [API Documentation](#-api-documentation)
- [Debugging](#-debugging)
- [Build dari Source](#-build-dari-source)
- [Troubleshooting](#-troubleshooting)
- [Security](#-security)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 🎯 Core Features
- ✅ **Thermal Printer Support** - RAW ESC/POS printing untuk thermal printer
- ✅ **Auto Printer Detection** - Otomatis mendeteksi printer yang tersedia
- 🖨️ **Multi-Platform Support** - Windows, macOS, Linux dengan single codebase
- 🔌 **System Printer Integration** - Terintegrasi dengan system printer OS
- 🌐 **WebSocket Real-time** - Tracking status print job secara real-time
- 📊 **Print Job Tracking** - Monitor progress, status, dan history print jobs

### 🛠️ Advanced Features
- 📡 **REST API** - HTTP endpoints untuk printer management
- 🔄 **RAW Printing Mode** - Windows API untuk thermal printer (preserves ESC/POS)
- 🎨 **Debug Console** - Web-based debugging interface
- 📈 **Status Dashboard** - Installation verification page
- 🔐 **Cross-Platform Compatibility** - Single codebase untuk semua platform
- 🚀 **Background Service** - Auto-start pada boot (Windows Service, Systemd, LaunchAgent)

---

## 💻 Persyaratan Sistem

### 🪟 Windows
- **OS**: Windows 10/11 (64-bit)
- **Runtime**: Node.js 20 LTS (included in installers)
- **Printer**: Any Windows-compatible printer or thermal printer
- **Privileges**: Administrator (untuk MSI installer)

### 🐧 Linux
- **OS**: Ubuntu 20.04+ / Debian 10+ / Linux Mint 20+
- **Runtime**: Node.js 20 LTS (included in DEB package)
- **Printer**: CUPS-compatible printer
- **Privileges**: sudo untuk instalasi

### 🍎 macOS
- **OS**: macOS 10.13 (High Sierra) atau lebih baru
- **Runtime**: Node.js 20 LTS (included in DMG)
- **Printer**: CUPS-compatible printer
- **Privileges**: sudo untuk instalasi

---

## 🚀 Instalasi

### 🪟 Windows

#### Option 1: MSI Installer (Recommended)

**Professional Windows installer dengan Service integration.**

**Download & Install:**
1. Download `DirectPrintServer.msi` dari [GitHub Releases](https://github.com/aiqbalsyah/direct-print-utils-pos/releases)
2. **RIGHT-CLICK** pada file MSI → **"Run as administrator"**
3. Follow installation wizard
4. Service akan otomatis start

**⚠️ PENTING:**
- **HARUS** right-click → "Run as administrator"
- **JANGAN** double-click MSI file (akan error)

**Features:**
- ✅ Auto-install ke `C:\Program Files\DirectPrintServer`
- ✅ Windows Service (auto-start on boot)
- ✅ Start Menu shortcut
- ✅ Add/Remove Programs integration
- ✅ Clean uninstall

**Verifikasi:**
```
http://localhost:4000
```

---

#### Option 2: Portable Executable

**Untuk testing atau deployment tanpa installer.**

**Download & Run:**
1. Download `DirectPrintServer.exe` dari [GitHub Releases](https://github.com/aiqbalsyah/direct-print-utils-pos/releases)
2. Double-click `DirectPrintServer.exe`
3. Server akan start di port 4000

**Catatan:**
- Tidak perlu instalasi
- Tidak auto-start on boot
- Harus dijalankan manual

---

### 🐧 Linux

#### Debian/Ubuntu Package (.deb)

**Native Linux package dengan Systemd integration.**

**Download & Install:**
```bash
# Download DEB package
wget https://github.com/aiqbalsyah/direct-print-utils-pos/releases/download/v1.0.0/direct-print-server_1.0.0_amd64.deb

# Install
sudo dpkg -i direct-print-server_1.0.0_amd64.deb

# Verify
systemctl status direct-print-server
```

**Features:**
- ✅ Systemd service (auto-start on boot)
- ✅ Desktop entry di Applications
- ✅ Proper dpkg integration
- ✅ Post-install scripts
- ✅ Clean uninstall

**Management:**
```bash
# Start service
sudo systemctl start direct-print-server

# Stop service
sudo systemctl stop direct-print-server

# Restart service
sudo systemctl restart direct-print-server

# Check status
systemctl status direct-print-server

# View logs
sudo journalctl -u direct-print-server -f

# Uninstall
sudo dpkg -r direct-print-server
```

**Supported Distributions:**
- Ubuntu 20.04+ (Focal, Jammy, Noble)
- Debian 10+ (Buster, Bullseye, Bookworm)
- Linux Mint 20+
- Pop!_OS 20.04+

**Verifikasi:**
```bash
curl http://localhost:4000
# atau buka browser
xdg-open http://localhost:4000
```

---

### 🍎 macOS

#### DMG Package

**Native macOS application dengan LaunchAgent integration.**

**Download & Install:**
```bash
# Download DMG
# (Manual download dari GitHub Releases atau wget)

# Open DMG
open DirectPrintServer-1.0.0.dmg

# Run automated installer
sudo bash install.sh
```

**Manual Installation:**
1. Open `DirectPrintServer-1.0.0.dmg`
2. Drag `DirectPrintServer.app` ke Applications folder
3. Copy LaunchAgent:
   ```bash
   cp DirectPrintServer.app/Contents/Library/LaunchAgents/com.aiqbalsyah.directprintserver.plist \
      ~/Library/LaunchAgents/
   ```
4. Load service:
   ```bash
   launchctl load ~/Library/LaunchAgents/com.aiqbalsyah.directprintserver.plist
   launchctl start com.aiqbalsyah.directprintserver
   ```

**Features:**
- ✅ Native .app bundle
- ✅ LaunchAgent (auto-start on login)
- ✅ DMG installer
- ✅ Installation/uninstallation scripts
- ✅ Background service

**Management:**
```bash
# Check status
launchctl list | grep directprintserver

# View logs
tail -f /tmp/direct-print-server.log

# Restart
launchctl stop com.aiqbalsyah.directprintserver
launchctl start com.aiqbalsyah.directprintserver

# Uninstall
sudo bash uninstall.sh
```

**Supported macOS Versions:**
- macOS 15 Sequoia
- macOS 14 Sonoma
- macOS 13 Ventura
- macOS 12 Monterey
- macOS 11 Big Sur
- macOS 10.15 Catalina
- macOS 10.14 Mojave
- macOS 10.13 High Sierra

**Verifikasi:**
```bash
curl http://localhost:4000
# atau buka browser
open http://localhost:4000
```

---

### 🔧 Manual Installation

**Untuk development atau custom deployment.**

#### Prerequisites:
```bash
# Install Node.js 20 LTS
# Download dari: https://nodejs.org/

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

#### Clone & Install:
```bash
# Clone repository
git clone https://github.com/aiqbalsyah/direct-print-utils-pos.git
cd direct-print-utils-pos

# Install dependencies
npm install

# Start server
npm start
```

Server akan berjalan di `http://localhost:4000`

---

## 📖 Penggunaan

### Web Interface

#### 1. Status Page
```
http://localhost:4000
```
- ✅ Server status check
- 🖨️ Available printers
- 🌐 WebSocket connection status
- 📊 System information

#### 2. Debug Console
```
http://localhost:4000/debug.html
```
- 🧪 Test printing
- 📊 Real-time logs
- 📈 Print job monitoring
- ⚙️ Printer status

---

## 🔌 API Documentation

### REST API Endpoints

#### 1. Get Printer Status
```http
GET /printer-status
```

**Response:**
```json
{
  "available": true,
  "type": "system",
  "printer": "EPSON TM-T88V",
  "message": "Printer ready"
}
```

---

#### 2. List All Printers
```http
GET /printers
```

**Response:**
```json
{
  "printers": ["EPSON TM-T88V", "HP LaserJet"],
  "defaultPrinter": "EPSON TM-T88V",
  "platform": "win32",
  "thermalPrinterSupport": true
}
```

---

#### 3. Test Print
```http
POST /test-print
Content-Type: application/json

{
  "printer": "EPSON TM-T88V"  // Optional
}
```

**Response:**
```json
{
  "status": 200,
  "message": "BERHASIL MENCETAK DATA (EPSON TM-T88V)"
}
```

---

### WebSocket API

#### Connection
```javascript
const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('Connected to Direct Print Server');
});
```

---

#### Print Job with Real-time Tracking
```javascript
// Send print job
socket.emit('print', {
  printerType: 'auto',  // or specific printer name
  dataPrint: `
    =============================
            RECEIPT
    =============================
    Item: Test Product
    Price: Rp 10,000
    =============================
  `
});

// Listen for job created
socket.on('print-job-created', (data) => {
  console.log('Job ID:', data.jobId);
  console.log('Status:', data.status);  // 'pending'
});

// Listen for real-time status updates
socket.on('print-status', (status) => {
  console.log('Job:', status.jobId);
  console.log('Status:', status.status);  // pending → preparing → sending → printing → success/error
  console.log('Progress:', status.progress + '%');  // 0 → 40 → 60 → 75 → 100
  console.log('Message:', status.message);
});

// Listen for final response
socket.on('print-response', (response) => {
  console.log('Final Status:', response.status);
  console.log('Message:', response.message);
});
```

---

#### Print Job Status Flow
```
pending → preparing → sending → printing → success/error
  0%       40%         60%        75%       100%
```

---

### Example: Simple Print

#### Using Fetch API
```javascript
fetch('http://localhost:4000/test-print', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ printer: 'auto' })
})
.then(res => res.json())
.then(data => console.log(data.message));
```

#### Using WebSocket with ESC/POS
```javascript
const socket = io('http://localhost:4000');

// ESC/POS commands for thermal printer
const escPosReceipt =
  '\x1B\x40' +           // Initialize
  '\x1B\x61\x01' +       // Center align
  '\x1B\x45\x01' +       // Bold ON
  'TOKO SAYA\n' +
  '\x1B\x45\x00' +       // Bold OFF
  '\x1B\x61\x00' +       // Left align
  '================================\n' +
  'Item         Qty    Price\n' +
  '--------------------------------\n' +
  'Product A      2    Rp 20,000\n' +
  'Product B      1    Rp 15,000\n' +
  '================================\n' +
  '\x1B\x61\x02' +       // Right align
  'Total:    Rp 35,000\n' +
  '\x1B\x61\x00' +       // Left align
  '\n\n' +
  '\x1B\x69';            // Partial cut

socket.emit('print', {
  printerType: 'EPSON TM-T88V',
  dataPrint: escPosReceipt
});

socket.on('print-response', (response) => {
  if (response.status === 200) {
    alert('Print berhasil!');
  } else {
    alert('Print gagal: ' + response.message);
  }
});
```

---

## 🐛 Debugging

### Debug Console Features

Akses: `http://localhost:4000/debug.html`

#### Features:
1. **Connection Status** - Real-time WebSocket connection indicator
2. **Current Job Tracking** - Job ID, status, progress bar (0-100%)
3. **Print History** - Last 5 print jobs dengan timestamps
4. **Test Tools** - Test receipt print, ESC/POS test, custom input
5. **Console Logs** - Real-time server logs dengan color coding

---

## 🔨 Build dari Source

### Quick Build

```bash
# Install pkg globally
npm install -g pkg

# Build untuk platform tertentu
npm run build-win      # Windows .exe
npm run build-mac      # macOS binary
npm run build-linux    # Linux binary
npm run build-all      # All platforms
```

**Output:** `dist/` directory

---

### Build dengan GitHub Actions

**Trigger Manual (Recommended):**

1. Buka **Actions** tab di GitHub
2. Pilih workflow:
   - "Build Windows MSI Installer" → `DirectPrintServer.msi`
   - "Build Windows Executable" → `DirectPrintServer.exe`
   - "Build Linux DEB Package" → `direct-print-server_1.0.0_amd64.deb`
   - "Build macOS DMG Package" → `DirectPrintServer-1.0.0.dmg`
3. Klik **"Run workflow"**
4. ✅ Centang **"Create GitHub Release"** jika ingin publish release (requires git tag `v*`)
5. Download dari **Artifacts** (retention: 90 hari)

**⚠️ Catatan Penting:**
- Semua workflows **HANYA manual trigger** (tidak ada automatic trigger)
- GitHub Release hanya dibuat jika:
  - ✅ Checkbox "Create GitHub Release" dicentang DAN
  - ✅ Current commit memiliki git tag yang dimulai dengan `v*` (contoh: `v1.0.0`)
- Jika tidak ada git tag, workflow tetap jalan tapi release tidak dibuat

**Membuat Git Tag untuk Release:**
```bash
# Create tag
git tag v1.0.0

# Push tag
git push origin v1.0.0

# Sekarang workflow bisa create release
# (tetap harus trigger manual & centang "Create GitHub Release")
```

---

### Build Artifacts

| Platform | Workflow | Output | Auto-start |
|----------|----------|--------|------------|
| 🪟 **Windows** | `build-exe.yml` | Portable EXE | ❌ Manual |
| 🪟 **Windows** | `build-msi.yml` | MSI Installer | ✅ Service |
| 🐧 **Linux** | `build-linux-deb.yml` | DEB Package | ✅ Systemd |
| 🍎 **macOS** | `build-macos-dmg.yml` | DMG Package | ✅ LaunchAgent |

Untuk detail lengkap, lihat [BUILD.md](BUILD.md)

---

## ❗ Troubleshooting

### Windows

#### 1. "MSI Installer Error: Privileges Required"
**Solusi:**
- RIGHT-CLICK pada MSI → "Run as administrator"
- JANGAN double-click

#### 2. "Print Stuck on 'Printing' Status"
**Solusi:**
```bash
# Check logs di debug console
http://localhost:4000/debug.html

# Restart service
sc stop DirectPrintService
sc start DirectPrintService
```

#### 3. "No Printer Detected"
**Solusi:**
1. Check printer di Windows Settings → Printers & scanners
2. Set default printer
3. Refresh status di `http://localhost:4000`

#### 4. "Thermal Printer - ESC/POS Commands Not Working"
**Catatan:**
- Pastikan printer terdaftar di Windows "Printers & scanners"
- Server menggunakan RAW mode (preserves ESC/POS)
- Check printer driver support RAW printing

---

### Linux

#### 1. "Service Won't Start"
**Solusi:**
```bash
# Check service status
systemctl status direct-print-server

# Check logs
sudo journalctl -u direct-print-server -xe

# Restart service
sudo systemctl restart direct-print-server
```

#### 2. "CUPS Printer Not Found"
**Solusi:**
```bash
# Install CUPS
sudo apt-get install cups

# List printers
lpstat -p -d

# Set default
lpoptions -d printer_name
```

#### 3. "Permission Denied"
**Solusi:**
```bash
# Check printer permissions
lpstat -p -d

# Add user to lp group
sudo usermod -a -G lp $USER
```

---

### macOS

#### 1. "Service Won't Start"
**Solusi:**
```bash
# Check service
launchctl list | grep directprintserver

# View error logs
cat /tmp/direct-print-server-error.log

# Reload service
launchctl unload ~/Library/LaunchAgents/com.aiqbalsyah.directprintserver.plist
launchctl load ~/Library/LaunchAgents/com.aiqbalsyah.directprintserver.plist
```

#### 2. "Printer Not Found"
**Solusi:**
```bash
# List printers
lpstat -p -d

# Set default printer
lpoptions -d printer_name
```

---

### General

#### 1. "Port 4000 Already in Use"
**Solusi:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:4000 | xargs kill -9
```

#### 2. "WebSocket Connection Failed"
**Solusi:**
- Check firewall settings
- Allow port 4000
- Check antivirus

---

## 🔐 Security

### Production Deployment

**⚠️ Default configuration untuk local development**

Untuk production, lihat [SECURITY.md](SECURITY.md) untuk:
- HTTPS/TLS configuration
- API key authentication
- Rate limiting
- Input validation
- Firewall rules

### Security Best Practices

```javascript
// 1. Bind to localhost only (production)
app.listen(4000, '127.0.0.1');

// 2. Add API key middleware
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// 3. Enable HTTPS
const https = require('https');
const fs = require('fs');
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};
https.createServer(options, app).listen(4000);
```

---

## 📁 Struktur Project

```
direct-print/
├── src/
│   └── index.js              # Main server file
├── public/
│   └── html/
│       ├── index.html        # Status page
│       └── debug.html        # Debug console
├── scripts/
│   └── windows/
│       ├── service/          # Windows service scripts
│       ├── startup/          # Auto-startup scripts
│       └── wix/              # MSI install/uninstall scripts
├── .github/
│   └── workflows/
│       ├── build-exe.yml     # Windows EXE build
│       ├── build-msi.yml     # Windows MSI build
│       ├── build-linux-deb.yml  # Linux DEB build
│       └── build-macos-dmg.yml  # macOS DMG build
├── package.json
├── README.md
├── SECURITY.md
└── BUILD.md
```

---

## 🔧 Configuration

### Default Settings

| Setting | Value | Description |
|---------|-------|-------------|
| Port | 4000 | HTTP/WebSocket server port |
| Node Version | 20 LTS | Required Node.js version |
| Timeout | 30000ms | Print command timeout |
| Platform | Auto | Auto-detects Windows/Mac/Linux |

### Custom Port

Edit `src/index.js`:
```javascript
const port = process.env.PORT || 4000;
```

Or set environment variable:
```bash
# Windows
set PORT=8080

# macOS/Linux
export PORT=8080
```

---

## 🆘 Support

### Getting Help

1. **Check Debug Console**
   ```
   http://localhost:4000/debug.html
   ```

2. **View Logs**
   - Windows Service: Check debug console or Event Viewer
   - Linux: `sudo journalctl -u direct-print-server -f`
   - macOS: `tail -f /tmp/direct-print-server.log`

3. **Common Issues**
   - See [Troubleshooting](#-troubleshooting) section

4. **Report Bug**
   - Create issue di [GitHub Issues](https://github.com/aiqbalsyah/direct-print-utils-pos/issues)
   - Include:
     - OS & version
     - Printer model
     - Error logs dari debug console
     - Steps to reproduce

---

## 🙏 Credits

### Dependencies
- **Express** - Web server framework
- **Socket.IO** - WebSocket library
- **escpos** - ESC/POS printer library
- **usb** - USB device access
- **pkg** - Executable builder

### Build Tools
- **WiX Toolset** - Windows MSI installer
- **create-dmg** - macOS DMG creator
- **dpkg** - Debian packaging
- **GitHub Actions** - CI/CD automation

---

## 📄 Lisensi

ISC License

Copyright (c) 2024 aiqbalsyah

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

## 🚀 Quick Start Guide

### For End Users

#### Windows
1. Download `DirectPrintServer.msi`
2. Right-click → "Run as administrator"
3. Follow installer
4. Open `http://localhost:4000`

#### Linux
```bash
sudo dpkg -i direct-print-server_1.0.0_amd64.deb
xdg-open http://localhost:4000
```

#### macOS
```bash
open DirectPrintServer-1.0.0.dmg
sudo bash install.sh
open http://localhost:4000
```

### For Developers

```bash
git clone https://github.com/aiqbalsyah/direct-print-utils-pos.git
cd direct-print-utils-pos
npm install
npm start
```

Visit `http://localhost:4000/debug.html` for testing.

---

## 📊 Platform Support Matrix

| Feature | Windows | macOS | Linux |
|---------|---------|-------|-------|
| **Thermal Printer** | ✅ RAW mode | ✅ CUPS | ✅ CUPS |
| **System Printer** | ✅ Yes | ✅ Yes | ✅ Yes |
| **ESC/POS Support** | ✅ Full | ⚠️ Driver dependent | ⚠️ Driver dependent |
| **Auto Detection** | ✅ PowerShell | ✅ lpstat | ✅ lpstat |
| **WebSocket Tracking** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Background Service** | ✅ Win Service | ✅ LaunchAgent | ✅ Systemd |
| **Auto-start** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Installer** | ✅ MSI | ✅ DMG | ✅ DEB |

---

**Made with ❤️ for thermal printer enthusiasts**

**🌟 Star this repo if you find it useful!**
