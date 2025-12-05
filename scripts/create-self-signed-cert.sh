#!/bin/bash
# Create self-signed certificate for code signing (testing only)

echo "🔧 Creating self-signed certificate for testing..."

# Create certificate directory
mkdir -p certs

# Generate private key
openssl genrsa -out certs/private.key 2048

# Create certificate signing request
openssl req -new -key certs/private.key -out certs/cert.csr -subj "/C=US/ST=State/L=City/O=DirectPrint/OU=Development/CN=DirectPrint Code Signing"

# Generate self-signed certificate
openssl x509 -req -days 365 -in certs/cert.csr -signkey certs/private.key -out certs/cert.crt

# Create PKCS#12 file (.pfx) for Windows code signing
openssl pkcs12 -export -out certs/codesign.pfx -inkey certs/private.key -in certs/cert.crt -password pass:directprint123

# Convert to base64 for GitHub secrets
echo ""
echo "🔑 Certificate created! Copy this base64 value to GitHub Secrets as CERTIFICATE_BASE64:"
echo "=================================================="
openssl base64 -in certs/codesign.pfx | tr -d '\n'
echo ""
echo "=================================================="
echo ""
echo "📋 Also add this to GitHub Secrets as CERTIFICATE_PASSWORD:"
echo "directprint123"
echo ""
echo "⚠️  Note: This is a self-signed certificate for testing only!"
echo "   Windows will show security warnings to users."
echo ""

# Clean up temporary files
rm certs/cert.csr