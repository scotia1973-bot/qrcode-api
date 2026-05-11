# 📱 QR Code API

[![🚀 Live on Product Hunt](https://img.shields.io/badge/Product%20Hunt-Live-ff6154?logo=producthunt&style=for-the-badge)](https://www.producthunt.com/posts/qr-code-api-2)

> Generate QR codes from any text or URL — no API key required for the free tier. Built on Cloudflare Workers.

**Base URL:** `https://api.gadgethumans.com/`

## Features

- **Multiple formats:** PNG, SVG, and GIF output
- **Customizable:** Size, colors, error correction, and margin
- **Free tier:** 100 requests/day with no authentication
- **Global & fast:** Deployed on Cloudflare Workers edge network
- **Pro/Business tiers:** Higher limits with API key access

## Quick Start

```bash
curl "https://api.gadgethumans.com/?text=https://example.com" > qr.png
```

## Documentation

Full API documentation is available at:
- **Docs site:** https://www.gadgethumans.com/qr-code-api/docs/
- **API endpoint:** https://api.gadgethumans.com/

## Development

This is a [Cloudflare Workers](https://workers.cloudflare.com/) project. The worker source is in the `qrcode-api/` subdirectory.

```bash
cd qrcode-api
npm install
npx wrangler dev     # Local development
npx wrangler deploy  # Deploy to production
```

## Deployment

Configure your Cloudflare account in `wrangler.toml` at the project root, then:

```bash
npx wrangler deploy
```

## License

MIT
