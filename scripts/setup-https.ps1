# PowerShell script to generate local SSL certificates for development
# This script uses mkcert to create locally-trusted development certificates

Write-Host "🔐 Setting up HTTPS for local development..." -ForegroundColor Cyan
Write-Host ""

# Check if mkcert is installed
$mkcertInstalled = Get-Command mkcert -ErrorAction SilentlyContinue

if (-not $mkcertInstalled) {
    Write-Host "❌ mkcert is not installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install mkcert first:"
    Write-Host ""
    Write-Host "  Using Chocolatey: choco install mkcert" -ForegroundColor Yellow
    Write-Host "  Using Scoop:      scoop install mkcert" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or download from: https://github.com/FiloSottile/mkcert/releases"
    exit 1
}

Write-Host "✅ mkcert is installed" -ForegroundColor Green
Write-Host ""

# Create certificates directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "certificates" | Out-Null

Write-Host "📁 Created certificates directory" -ForegroundColor Green
Write-Host ""

# Install local CA
Write-Host "Installing local CA..." -ForegroundColor Cyan
mkcert -install

Write-Host ""
Write-Host "Generating certificates for localhost..." -ForegroundColor Cyan

# Generate certificates
Set-Location certificates
mkcert localhost 127.0.0.1 ::1
Set-Location ..

Write-Host ""
Write-Host "✅ Certificates generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Files created in certificates/:" -ForegroundColor Cyan
Write-Host "  - localhost+2.pem (certificate)"
Write-Host "  - localhost+2-key.pem (private key)"
Write-Host ""
Write-Host "Renaming certificates to standard names..." -ForegroundColor Cyan

# Rename to standard names
Rename-Item -Path "certificates\localhost+2.pem" -NewName "localhost.pem" -Force
Rename-Item -Path "certificates\localhost+2-key.pem" -NewName "localhost-key.pem" -Force

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run: npm run dev" -ForegroundColor Yellow
Write-Host "Your app will be available at: https://localhost:3000" -ForegroundColor Yellow
Write-Host ""
