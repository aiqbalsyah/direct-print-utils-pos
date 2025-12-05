@echo off
echo Creating self-signed certificate for Windows code signing...

REM Create certs directory if it doesn't exist
if not exist "certs" mkdir certs

REM Generate self-signed certificate using PowerShell
powershell -Command ^
"$cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject 'CN=DirectPrint Code Signing, O=DirectPrint, C=US' -KeyAlgorithm RSA -KeyLength 2048 -Provider 'Microsoft Enhanced RSA and AES Cryptographic Provider' -KeyExportPolicy Exportable -KeyUsage DigitalSignature -NotAfter (Get-Date).AddYears(1); ^
$password = ConvertTo-SecureString -String 'directprint123' -Force -AsPlainText; ^
$path = 'certs\codesign.pfx'; ^
Export-PfxCertificate -Cert $cert -FilePath $path -Password $password; ^
Write-Host 'Certificate created at:' $path"

REM Convert to base64 for GitHub secrets
echo.
echo Certificate created! Getting base64 value for GitHub secrets...
powershell -Command "$bytes = [System.IO.File]::ReadAllBytes('certs\codesign.pfx'); [System.Convert]::ToBase64String($bytes)"

echo.
echo Add these to GitHub Secrets:
echo CERTIFICATE_BASE64: (the base64 string above)
echo CERTIFICATE_PASSWORD: directprint123
echo.
echo WARNING: This is a self-signed certificate for testing only!