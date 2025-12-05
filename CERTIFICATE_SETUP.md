# Self-Signed Certificate for Direct Print

## Quick Setup Instructions:

### 1. Generate Certificate (Run these commands):

```bash
# Create directory
mkdir -p certs

# Generate all-in-one self-signed certificate
openssl req -x509 -newkey rsa:2048 -keyout certs/private.key -out certs/cert.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=DirectPrint/OU=Development/CN=DirectPrint Code Signing"

# Create PKCS#12 file for Windows code signing
openssl pkcs12 -export -out certs/codesign.pfx -inkey certs/private.key -in certs/cert.crt -password pass:directprint123

# Get base64 for GitHub secrets
openssl base64 -in certs/codesign.pfx | tr -d '\n'
```

### 2. Add to GitHub Secrets:

1. Go to: **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - **CERTIFICATE_BASE64**: (output from the base64 command above)
   - **CERTIFICATE_PASSWORD**: `directprint123`

### 3. Important Notes:

⚠️ **This is for testing only!** 
- Windows will show security warnings
- Users will see "Unknown Publisher" 
- Not suitable for production use

✅ **For production**, get a real code signing certificate from:
- DigiCert ($300-400/year)
- Sectigo ($150-300/year) 
- GlobalSign ($200-350/year)

## Certificate Details:
- **Type**: Self-signed code signing certificate
- **Validity**: 365 days
- **Password**: directprint123
- **Subject**: CN=DirectPrint Code Signing