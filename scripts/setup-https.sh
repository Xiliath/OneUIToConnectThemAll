#!/bin/bash

# Script to generate local SSL certificates for development
# This script uses mkcert to create locally-trusted development certificates

set -e

echo "🔐 Setting up HTTPS for local development..."
echo ""

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null
then
    echo "❌ mkcert is not installed."
    echo ""
    echo "Please install mkcert first:"
    echo ""
    echo "  macOS:   brew install mkcert"
    echo "  Linux:   Check https://github.com/FiloSottile/mkcert#installation"
    echo "  Windows: choco install mkcert"
    echo ""
    echo "Or download from: https://github.com/FiloSottile/mkcert/releases"
    exit 1
fi

echo "✅ mkcert is installed"
echo ""

# Create certificates directory if it doesn't exist
mkdir -p certificates

echo "📁 Created certificates directory"
echo ""

# Install local CA
echo "Installing local CA..."
mkcert -install

echo ""
echo "Generating certificates for localhost..."

# Generate certificates
cd certificates
mkcert localhost 127.0.0.1 ::1
cd ..

echo ""
echo "✅ Certificates generated successfully!"
echo ""
echo "Files created in certificates/:"
echo "  - localhost+2.pem (certificate)"
echo "  - localhost+2-key.pem (private key)"
echo ""
echo "Renaming certificates to standard names..."

# Rename to standard names
mv certificates/localhost+2.pem certificates/localhost.pem
mv certificates/localhost+2-key.pem certificates/localhost-key.pem

echo ""
echo "✅ Setup complete!"
echo ""
echo "You can now run: npm run dev"
echo "Your app will be available at: https://localhost:3000"
echo ""
