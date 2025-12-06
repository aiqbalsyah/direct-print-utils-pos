# 🖨️ Direct Print Server

> **Thermal Printer Service untuk Windows, Mac, dan Linux**
> Server printing yang mendukung thermal printer dan system printer dengan WebSocket real-time tracking.

[![GitHub Release](https://img.shields.io/github/v/release/aiqbalsyah/direct-print-utils-pos)](https://github.com/aiqbalsyah/direct-print-utils-pos/releases)
[![GitHub Issues](https://img.shields.io/github/issues/aiqbalsyah/direct-print-utils-pos)](https://github.com/aiqbalsyah/direct-print-utils-pos/issues)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
  - [Windows MSI Installer](#1-windows-msi-installer-recommended)
  - [Windows Executable](#2-windows-executable-portable)
  - [Manual Installation](#3-manual-installation-semua-platform)
- [Penggunaan](#-penggunaan)
- [API Documentation](#-api-documentation)
- [Debugging](#-debugging)
- [Build dari Source](#-build-dari-source)
- [Troubleshooting](#-troubleshooting)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 🎯 Core Features
- ✅ **Auto Printer Detection** - Otomatis mendeteksi printer yang tersedia
- 🖨️ **Multi-Platform Support** - Windows, macOS, Linux
- 🔌 **System Printer Support** - Terintegrasi dengan system printer OS
- 🌐 **WebSocket Real-time** - Tracking status print job secara real-time
- 📊 **Print Job Tracking** - Monitor progress, status, dan history print jobs
- 🧹 **ESC/POS Command Cleaning** - Otomatis membersihkan ESC/POS commands untuk system printer

### 🛠️ Advanced Features
- 📡 **REST API** - HTTP endpoints untuk printer management
- 🔄 **Multiple Print Methods** - Support berbagai metode printing di Windows
- 🎨 **Debug Console** - Web-based debugging interface
- 📈 **Status Dashboard** - Installation verification page
- 🔐 **Cross-Platform Compatibility** - Single codebase untuk semua platform

---

## 💻 Persyaratan Sistem

### Windows
- **OS**: Windows 10/11 (64-bit)
- **Node.js**: 18.18.0 (included in installers)
- **Printer**: Any Windows-compatible printer
- **Privileges**: Administrator (untuk MSI installer)

### macOS
- **OS**: macOS 10.13 atau lebih baru
- **Node.js**: 18.18.0
- **Printer**: CUPS-compatible printer

### Linux
- **OS**: Ubuntu 18.04+ / Debian 10+ / CentOS 7+
- **Node.js**: 18.18.0
- **Printer**: CUPS-compatible printer

---

## 🚀 Instalasi

### 1. Windows MSI Installer (Recommended)

**Instalasi paling mudah untuk Windows dengan Windows Service integration.**

#### Download & Install:
1. Download `DirectPrintServer.msi` dari [GitHub Releases](https://github.com/aiqbalsyah/direct-print-utils-pos/releases)
2. **RIGHT-CLICK** pada file MSI → **"Run as administrator"**
3. Follow installation wizard
4. Service akan otomatis start

#### ⚠️ PENTING:
- **HARUS** dijalankan sebagai administrator
- **JANGAN** double-click MSI file (akan error)
- **WAJIB** right-click → "Run as administrator"

#### Fitur MSI Installer:
- ✅ Auto-install ke `C:\Program Files\DirectPrintServer`
- ✅ Windows Service (auto-start on boot)
- ✅ Start Menu shortcut
- ✅ Add/Remove Programs integration
- ✅ Clean uninstall (removes all registry & services)

#### Verifikasi Instalasi:
```
Buka browser: http://localhost:4000
```
Anda akan melihat halaman status yang menampilkan:
- ✅ Server Status: Online
- 🖨️ Available Printers
- 🌐 WebSocket Status

---

### 2. Windows Executable (Portable)

**Untuk testing atau deployment tanpa installer.**

#### Download & Run:
1. Download `direct-print-win.exe` dari [GitHub Releases](https://github.com/aiqbalsyah/direct-print-utils-pos/releases)
2. Double-click `direct-print-win.exe`
3. Server akan start di port 4000

#### Catatan:
- Tidak perlu instalasi
- Tidak auto-start on boot
- Harus dijalankan manual setiap kali

---

### 3. Manual Installation (Semua Platform)

#### Prerequisites:
```bash
# Install Node.js 18.18.0
# Download dari: https://nodejs.org/

# Verify installation
node --version  # Should show v18.18.0
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
- Cek installation status
- View available printers
- Monitor server health

#### 2. Debug Console
```
http://localhost:4000/debug.html
```
- Test printing
- View real-time logs
- Monitor print jobs
- Check printer status

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
  "printer": "HP LaserJet",
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
  "printers": ["HP LaserJet", "EPSON TM-T88V"],
  "defaultPrinter": "HP LaserJet",
  "usbAvailable": false,
  "platform": "win32",
  "windowsSystemPrinterOnly": true
}
```

---

#### 3. Test Print
```http
POST /test-print
Content-Type: application/json

{
  "printer": "HP LaserJet"  // Optional, default: auto-detect
}
```

**Response:**
```json
{
  "status": 200,
  "message": "BERHASIL MENCETAK DATA (HP LaserJet)"
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

#### Print Job
```javascript
// Emit print job
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
  console.log('Status:', data.status);
});

// Listen for real-time status updates
socket.on('print-status', (status) => {
  console.log('Job:', status.jobId);
  console.log('Status:', status.status);  // pending, preparing, printing, success, error
  console.log('Progress:', status.progress + '%');
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

#### Using WebSocket
```javascript
const socket = io('http://localhost:4000');

socket.emit('print', {
  printerType: 'HP LaserJet',
  dataPrint: 'Test Print Content'
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

#### 1. Connection Status
- 🟢 Real-time connection indicator
- WebSocket status monitoring

#### 2. Current Job Tracking
- Job ID
- Status (pending/printing/success/error)
- Progress bar (0-100%)
- Detailed messages

#### 3. Print History
- Last 5 print jobs
- Timestamps
- Status badges
- Error messages

#### 4. Test Tools
- Simple test print
- Receipt template test
- ESC/POS command cleaning test
- Custom text input

#### 5. Console Logs
- Real-time server logs
- Color-coded messages
- Scrollable output

---

## 🔨 Build dari Source

### Prerequisites
```bash
npm install -g pkg
```

### Build Windows Executable
```bash
# Run build script
npm run build-win

# Output: dist/direct-print-win.exe
```

### Build MSI Installer

**Requires: Windows + WiX Toolset**

#### 1. Install WiX Toolset
```powershell
choco install wixtoolset -y
```

#### 2. Prepare Assets
Pastikan files ini ada di `public/`:
- `logo.bmp` - Logo aplikasi
- `logo.ico` - Application icon
- `banner.bmp` - Installer banner (493x58 pixels)

#### 3. Build MSI
```bash
# Run via GitHub Actions (recommended)
# Atau manual:
npm run build-complete
```

#### 4. Output
- `dist/direct-print-win.exe`
- `DirectPrintServer.msi`

---

### GitHub Actions Build

Workflow otomatis tersedia:

#### Build EXE
```yaml
# Trigger: Manual (workflow_dispatch)
# File: .github/workflows/build-exe.yml
# Output: Artifact dengan exe + scripts
```

#### Build MSI
```yaml
# Trigger: Manual atau Git Tag (v*)
# File: .github/workflows/build-msi.yml
# Output: MSI installer + GitHub Release
```

#### Cara Trigger Manual Build:
1. Go to **Actions** tab di GitHub
2. Select **Build Windows MSI** atau **Build Windows Executable**
3. Click **Run workflow**
4. Centang **Create GitHub Release** (optional)
5. Download dari Artifacts atau Releases

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
1. Check printer di Windows Settings
2. Set default printer
3. Refresh status di `http://localhost:4000`

#### 4. "Service Won't Start"
**Solusi:**
```bash
# Check service status
sc query DirectPrintService

# Reinstall service
cd "C:\Program Files\DirectPrintServer"
node scripts\install-service.js
```

---

### macOS / Linux

#### 1. "Permission Denied"
**Solusi:**
```bash
# macOS
sudo npm install
sudo npm start

# Check printer access
lpstat -p -d
```

#### 2. "CUPS Printer Not Found"
**Solusi:**
```bash
# Install CUPS (if not installed)
sudo apt-get install cups  # Debian/Ubuntu
brew install cups          # macOS

# List printers
lpstat -p -d

# Set default
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

#### 3. "ESC/POS Commands Not Working"
**Catatan:**
- ESC/POS commands otomatis dibersihkan untuk system printer
- Gunakan USB thermal printer untuk ESC/POS full support
- Di Windows, USB thermal printer requires WinUSB driver (Zadig)

---

## 📁 Struktur Project

```
direct-print/
├── src/
│   └── index.js              # Main server file
├── public/
│   ├── html/
│   │   ├── index.html        # Status page
│   │   └── debug.html        # Debug console
│   ├── logo.bmp              # MSI logo
│   ├── logo.ico              # App icon
│   └── banner.bmp            # MSI banner
├── scripts/
│   └── windows/
│       ├── service/          # Windows service scripts
│       ├── startup/          # Auto-startup scripts
│       └── wix/              # MSI install/uninstall scripts
├── .github/
│   └── workflows/
│       ├── build-exe.yml     # EXE build workflow
│       └── build-msi.yml     # MSI build workflow
├── package.json
└── README.md
```

---

## 🔧 Configuration

### Default Settings

| Setting | Value | Description |
|---------|-------|-------------|
| Port | 4000 | HTTP/WebSocket server port |
| Node Version | 18.18.0 | Required Node.js version |
| Timeout | 30000ms | Print command timeout |
| Platform | Auto | Detects Windows/Mac/Linux |

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
   - Windows Service: `C:\Program Files\DirectPrintServer\logs\`
   - Console: Run `DirectPrintServer.exe` to see live logs

3. **Common Issues**
   - See [Troubleshooting](#-troubleshooting) section

4. **Report Bug**
   - Create issue di GitHub dengan:
     - OS & version
     - Printer model
     - Error logs dari debug console
     - Steps to reproduce

---

## 🔐 Security Notes

### Production Deployment

**⚠️ Default configuration untuk local development**

Untuk production:

1. **Enable HTTPS**
   ```javascript
   // Add SSL certificates
   const https = require('https');
   const fs = require('fs');

   const options = {
     key: fs.readFileSync('key.pem'),
     cert: fs.readFileSync('cert.pem')
   };

   https.createServer(options, app).listen(4000);
   ```

2. **Add Authentication**
   ```javascript
   // Add API key middleware
   app.use((req, res, next) => {
     const apiKey = req.headers['x-api-key'];
     if (apiKey !== process.env.API_KEY) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     next();
   });
   ```

3. **Firewall Rules**
   - Allow port 4000 only from trusted IPs
   - Block external access if local-only

---

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Initial release
- ✅ Windows MSI installer
- ✅ Multi-platform support
- ✅ WebSocket print job tracking
- ✅ Debug console
- ✅ Auto printer detection
- ✅ ESC/POS command cleaning
- ✅ Windows Service integration

---

## 🙏 Credits

### Dependencies
- **Express** - Web server framework
- **Socket.IO** - WebSocket library
- **escpos** - ESC/POS printer library
- **usb** - USB device access
- **pkg** - Executable builder

### Build Tools
- **WiX Toolset** - MSI installer creator
- **GitHub Actions** - CI/CD automation

---

## 📄 Lisensi

ISC License

Copyright (c) 2024

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

## 🚀 Quick Start Guide

### For End Users (Windows)

1. Download `DirectPrintServer.msi`
2. Right-click → "Run as administrator"
3. Follow installer
4. Open `http://localhost:4000` to verify
5. Print from your application

### For Developers

```bash
git clone https://github.com/aiqbalsyah/direct-print-utils-pos.git
cd direct-print-utils-pos
npm install
npm start
```

Visit `http://localhost:4000/debug.html` for testing.

---

**Made with ❤️ for thermal printer enthusiasts**
