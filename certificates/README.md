# HTTPS Certificates

This directory contains SSL certificates for local HTTPS development.

## Setup

Run the setup script to generate certificates:

**macOS/Linux:**
```bash
npm run setup-https
```

**Windows:**
```powershell
npm run setup-https:windows
```

This will:
1. Install mkcert (if not already installed, you'll need to do this manually)
2. Create a local Certificate Authority (CA)
3. Generate SSL certificates for localhost

## Files

After running the setup, you'll have:
- `localhost.pem` - SSL certificate
- `localhost-key.pem` - Private key

**These files are gitignored and will not be committed.**

## Manual Setup

If the script doesn't work, you can generate certificates manually:

1. Install mkcert: https://github.com/FiloSottile/mkcert
2. Run:
   ```bash
   mkcert -install
   cd certificates
   mkcert localhost 127.0.0.1 ::1
   mv localhost+2.pem localhost.pem
   mv localhost+2-key.pem localhost-key.pem
   ```

## Troubleshooting

**"Certificate not trusted" warning in browser:**
- Make sure you ran `mkcert -install` to install the local CA
- Restart your browser after installing the CA

**mkcert not found:**
- Install mkcert first:
  - macOS: `brew install mkcert`
  - Linux: See https://github.com/FiloSottile/mkcert#linux
  - Windows: `choco install mkcert` or `scoop install mkcert`
