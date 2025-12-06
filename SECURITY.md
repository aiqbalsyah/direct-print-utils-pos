# Security Policy

## 🔒 Supported Versions

Kami aktif maintain dan menyediakan security updates untuk versi berikut:

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 1.0.x   | :white_check_mark: | Active |
| < 1.0   | :x:                | Deprecated |

**Rekomendasi:** Selalu gunakan versi terbaru untuk mendapatkan security patches dan bug fixes.

---

## 🚨 Reporting a Vulnerability

### Jika Anda menemukan security vulnerability, **JANGAN** buat public issue!

Kami sangat menghargai responsible disclosure. Untuk melaporkan security vulnerability:

### 1. **Private Reporting (Recommended)**

Gunakan GitHub Security Advisory untuk private reporting:

1. Go to repository [Security tab](https://github.com/aiqbalsyah/direct-print-utils-pos/security)
2. Click **"Report a vulnerability"**
3. Fill in the details:
   - **Title**: Brief description
   - **Description**: Detailed explanation
   - **Severity**: Critical/High/Medium/Low
   - **Affected versions**
   - **Steps to reproduce**
   - **Proof of Concept** (if applicable)

### 2. **Email Reporting**

Jika tidak bisa menggunakan GitHub Security Advisory, kirim email ke:

📧 **security@[your-domain].com** (ganti dengan email Anda)

**Subject:** `[SECURITY] Direct Print Server - [Brief Description]`

**Include:**
- Vulnerability type (RCE, XSS, CSRF, etc.)
- Affected component/endpoint
- Impact assessment
- Steps to reproduce
- Suggested fix (optional)

---

## ⏱️ Response Timeline

Kami berkomitmen untuk merespon security reports dengan timeline berikut:

| Stage | Timeline | Action |
|-------|----------|--------|
| **Initial Response** | < 48 hours | Acknowledge receipt |
| **Assessment** | < 7 days | Validate & assess severity |
| **Fix Development** | < 30 days | Develop & test patch |
| **Release** | < 45 days | Public release with advisory |

**Note:** Timeline bisa lebih cepat untuk critical vulnerabilities.

---

## 🛡️ Security Best Practices

### For Deployment

#### 1. **Network Security**

```bash
# Firewall rules (Windows)
netsh advfirewall firewall add rule name="Direct Print Server" dir=in action=allow protocol=TCP localport=4000

# Restrict to localhost only (production)
# Edit src/index.js:
app.listen(4000, '127.0.0.1');  // Only accept local connections
```

#### 2. **Authentication & Authorization**

**⚠️ Default: NO AUTHENTICATION**

Untuk production, tambahkan authentication:

```javascript
// src/index.js - Add API Key middleware
const API_KEY = process.env.API_KEY || 'your-secret-key';

app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (apiKey !== API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    });
  }

  next();
});

// Client usage:
fetch('http://localhost:4000/printers', {
  headers: {
    'X-API-Key': 'your-secret-key'
  }
});
```

#### 3. **HTTPS/TLS**

```javascript
// Enable HTTPS for production
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

https.createServer(options, app).listen(4000, () => {
  console.log('HTTPS Server running on port 4000');
});
```

#### 4. **Input Validation**

```javascript
// Validate printer names to prevent injection
function sanitizePrinterName(name) {
  // Only allow alphanumeric, spaces, hyphens, underscores
  return name.replace(/[^a-zA-Z0-9\s\-_]/g, '');
}

// Validate print data size
const MAX_PRINT_SIZE = 1024 * 1024; // 1MB
if (dataPrint.length > MAX_PRINT_SIZE) {
  return res.status(413).json({ error: 'Print data too large' });
}
```

#### 5. **Rate Limiting**

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests from this IP'
});

app.use('/print', limiter);
```

---

## 🔍 Known Security Considerations

### 1. **Local Network Exposure**

**Risk:** Server default mendengarkan di `0.0.0.0:4000`, accessible dari network.

**Mitigation:**
```javascript
// Bind only to localhost
app.listen(4000, '127.0.0.1');

// Or use environment variable
const host = process.env.HOST || '127.0.0.1';
app.listen(4000, host);
```

### 2. **Command Injection via Printer Names**

**Risk:** Malicious printer names bisa execute system commands.

**Mitigation:**
- ✅ **Already implemented**: Input sanitization di `detectAvailablePrinters()`
- ✅ **Already implemented**: Escaped quotes di PowerShell commands
- ⚠️ **User action**: Jangan trust untrusted printer names dari external sources

### 3. **File System Access**

**Risk:** Temporary files created di system temp directory.

**Current Protection:**
- ✅ Files created dengan unique timestamp names
- ✅ Files deleted after print
- ✅ No user-controlled file paths

**Additional Hardening:**
```javascript
// Set temp directory permissions (Unix/Linux)
const tempFile = path.join(os.tmpdir(), `print_${Date.now()}.txt`);
fs.writeFileSync(tempFile, cleanText, { mode: 0o600 }); // Owner read/write only
```

### 4. **ESC/POS Command Injection**

**Risk:** Malicious ESC/POS commands dalam print data.

**Protection:**
- ✅ **Already implemented**: `cleanEscPosCommands()` removes ESC/POS commands untuk system printer
- ⚠️ **Note**: Thermal printer USB mode accepts raw ESC/POS (by design)

### 5. **Denial of Service (DoS)**

**Risks:**
- Large print data
- Rapid requests
- Malformed data

**Mitigations:**
```javascript
// Add request size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Add timeout
server.setTimeout(30000); // 30 seconds

// Add rate limiting (see above)
```

---

## 🔐 Secure Configuration Checklist

### Production Deployment

- [ ] **Network**: Bind to `127.0.0.1` or specific IP only
- [ ] **Authentication**: Implement API key or OAuth
- [ ] **HTTPS**: Enable TLS/SSL certificates
- [ ] **Rate Limiting**: Implement request throttling
- [ ] **Input Validation**: Validate all user inputs
- [ ] **Logging**: Enable audit logging for print jobs
- [ ] **Firewall**: Configure firewall rules
- [ ] **Updates**: Subscribe to security advisories
- [ ] **Monitoring**: Set up health checks & alerts
- [ ] **Backup**: Regular backup of configuration

### Windows Service Security

```powershell
# Run service with limited privileges (NOT SYSTEM)
sc config DirectPrintService obj= "NT AUTHORITY\LocalService"

# Set service to manual start for additional control
sc config DirectPrintService start= demand
```

---

## 🚫 Out of Scope

Following issues are **not** considered security vulnerabilities:

1. **Local privilege escalation** - Application requires administrator for installation (by design)
2. **Physical access attacks** - Assumes trusted local environment
3. **Printer driver vulnerabilities** - Out of our control (OS/driver issue)
4. **DoS via printer hardware** - Physical printer jamming/disconnection
5. **Social engineering** - User tricked into installing malicious MSI

---

## 📋 Security Audit History

| Date | Auditor | Findings | Status |
|------|---------|----------|--------|
| 2024-12 | Internal | Initial security review | ✅ Completed |
| - | - | Awaiting external audit | 🔜 Planned |

---

## 🔄 Security Updates

Security patches akan dirilis sebagai:

- **Critical**: Immediate patch release (within 24-48 hours)
- **High**: Patch in next minor version (within 7 days)
- **Medium/Low**: Included in regular releases

**Notification Channels:**
- 📢 GitHub Security Advisories
- 🏷️ Release notes pada GitHub Releases
- 📧 Email notification (untuk subscribed users)

---

## 📚 Additional Resources

### Secure Coding Guidelines
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### Security Tools
```bash
# Scan dependencies for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for outdated packages
npm outdated
```

### Recommended Security Headers

```javascript
// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

## 📞 Contact

**Security Team:** security@[your-domain].com (replace with your email)

**GPG Key:** Available on request for encrypted communication

**Response Hours:** Monday-Friday, 9 AM - 5 PM (GMT+7)

---

## 🙏 Acknowledgments

Kami berterima kasih kepada security researchers yang membantu improve keamanan Direct Print Server:

- *Your name could be here!* - Report vulnerabilities responsibly

---

**Last Updated:** December 2024

**Version:** 1.0.0
