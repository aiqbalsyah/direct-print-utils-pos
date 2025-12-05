#!/bin/bash
set -e

echo "🔧 Creating self-signed certificate for DirectPrint code signing..."
echo ""

# Create certs directory
echo "📁 Creating certificates directory..."
mkdir -p certs

# Generate self-signed certificate
echo "🔑 Generating RSA private key and certificate..."
openssl req -x509 -newkey rsa:2048 \
    -keyout certs/private.key \
    -out certs/cert.crt \
    -days 365 \
    -nodes \
    -subj "/C=US/ST=State/L=City/O=DirectPrint/OU=Development/CN=DirectPrint Code Signing"

# Create PKCS#12 file for Windows
echo "📦 Creating PKCS#12 file for Windows code signing..."
openssl pkcs12 -export \
    -out certs/codesign.pfx \
    -inkey certs/private.key \
    -in certs/cert.crt \
    -password pass:directprint123

# Generate base64 for GitHub secrets
echo ""
echo "✅ Certificate generated successfully!"
echo ""
echo "🔑 CERTIFICATE_BASE64 (copy this to GitHub Secrets):"
echo "=================================================="
openssl base64 -in certs/codesign.pfx | tr -d '\n'
echo ""
echo "=================================================="
echo ""
echo "🔒 CERTIFICATE_PASSWORD (copy this to GitHub Secrets):"
echo "directprint123"
echo ""
echo "📋 Instructions:"
echo "1. Go to your GitHub repository"
echo "2. Settings → Secrets and variables → Actions"
echo "3. Add new repository secret:"
echo "   - Name: CERTIFICATE_BASE64"
echo "   - Value: (the long base64 string above)"
echo "4. Add another secret:"
echo "   - Name: CERTIFICATE_PASSWORD"
echo "   - Value: directprint123"
echo ""
echo "⚠️  WARNING: This is a self-signed certificate for testing only!"
echo "   Production use requires a real code signing certificate."
echo ""