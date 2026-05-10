# 📱 QR Code API

A **free, open-source** QR code generation API that runs on [Cloudflare Workers](https://workers.cloudflare.com/). Generate QR codes as PNG, SVG, or JPEG images from any text or URL.

> **Want the easy way?** Use the hosted version at **[api.gadgethumans.com](https://api.gadgethumans.com)** for **$5/month** — no setup, no maintenance, just your API key and go.

---

## ✨ Features

- 🔲 **High-quality QR codes** — Generates standard QR codes from any text or URL
- 🎨 **Customizable** — Adjust size (100-1024px), error correction, colors, and margins
- 🖼️ **Multiple formats** — PNG, SVG, and JPEG output
- ⚡ **Blazing fast** — Runs on Cloudflare's global edge network
- 💰 **Free to self-host** — Cloudflare Workers free tier includes 100k requests/day
- 📦 **No dependencies** — Pure JavaScript, lightweight, easy to customize

---

## 🚀 Self-Host (Free)

Deploy your own instance on Cloudflare Workers for **free** in under 5 minutes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) — `npm install -g wrangler`
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)

### Deployment

```bash
# 1. Clone the repo
git clone https://github.com/scotia1973-bot/qrcode-api.git
cd qrcode-api

# 2. Install dependencies
npm install

# 3. Login to Cloudflare
npx wrangler login

# 4. Deploy to Cloudflare Workers
npm run deploy
```

That's it! Your instance will be live at `https://qrcode-api.<your-subdomain>.workers.dev`.

### Local Development

```bash
npm run dev
```

This starts a local dev server at `http://localhost:8787`. Try it:
```
http://localhost:8787/generate?data=https://example.com&size=512
```

### Configuration

Edit `wrangler.toml` to customize:
- **Route** — Change the URL path or add a custom domain
- **API_KEY_ENABLED** — Set to `"true"` to require API key authentication

---

## 📖 API Documentation

### Base URL

```
Self-hosted: https://qrcode-api.<your-subdomain>.workers.dev
Hosted:      https://api.gadgethumans.com
```

### Endpoints

#### 1. Health Check

```
GET /
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "QR Code API",
  "version": "1.0.0"
}
```

#### 2. Generate QR Code (GET)

```
GET /generate?data=Hello%20World&size=256&format=png&ec_level=M&margin=4&dark_color=000000&light_color=ffffff
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `data` | string | **required** | Text or URL to encode in the QR code |
| `size` | integer | `256` | Image size in pixels (100-1024) |
| `ec_level` | string | `M` | Error correction: `L` (7%), `M` (15%), `Q` (25%), `H` (30%) |
| `margin` | integer | `4` | Quiet zone margin around the QR code |
| `format` | string | `png` | Output format: `png`, `svg`, or `jpg` |
| `dark_color` | string | `000000` | Dark module color (hex, no #) |
| `light_color` | string | `ffffff` | Light module color (hex, no #) |

**Response:** Raw image binary with appropriate `Content-Type` header.

#### 3. Generate QR Code (POST)

```
POST /generate
Content-Type: application/json

{
  "data": "https://example.com",
  "size": 512,
  "format": "png",
  "ec_level": "H",
  "margin": 4,
  "dark_color": "1a1a2e",
  "light_color": "ffffff"
}
```

**Response:** Same as GET — raw image binary.

### Examples

**Basic QR code (PNG):**
```bash
curl "https://api.gadgethumans.com/generate?data=https://example.com" > qr.png
```

**Large SVG with high error correction:**
```bash
curl "https://api.gadgethumans.com/generate?data=https://example.com&size=512&format=svg&ec_level=H" > qr.svg
```

**Colored QR code:**
```bash
curl "https://api.gadgethumans.com/generate?data=Hello&dark_color=e63946&light_color=f1faee" > colored_qr.png
```

**Using POST (for long text):**
```bash
curl -X POST "https://api.gadgethumans.com/generate" \
  -H "Content-Type: application/json" \
  -d '{"data": "https://example.com/very/long/url/that/would/not/fit/in/a/query/string", "size": 512}' \
  --output qr.png
```

---

## 🔧 Technical Details

### How It Works

This API acts as a proxy to the free [goqr.me](https://goqr.me/) QR code generation service (api.qrserver.com). Requests are forwarded, cached at Cloudflare's edge, and returned as optimized images.

### Error Correction Levels

| Level | Recovery | Best For |
|-------|----------|----------|
| **L** | ~7% | Large codes, clean printing |
| **M** | ~15% | General purpose (default) |
| **Q** | ~25% | Logos or overlays on QR |
| **H** | ~30% | Maximum durability, small surfaces |

### Caching

QR code responses are cached for 24 hours (86400 seconds) at the Cloudflare edge, so repeated requests for the same data are instant.

---

## 🆚 Self-Hosted vs Hosted

| Feature | Self-Hosted (Free) | Hosted ($5/mo) |
|---------|-------------------|----------------|
| Price | Free (Workers free tier) | $5/month |
| Setup | 5 minutes, needs Cloudflare account | None — instant API key |
| Rate Limit | Workers plan limits | 100 req/min (standard) |
| Maintenance | You handle updates | Automatic |
| Uptime | Your responsibility | 99.9% SLA |
| API Key Auth | DIY | Built-in |
| Custom Domain | DIY | Automatic HTTPS |
| Support | Community | Priority email |

---

## 📄 License

MIT — Free to use, modify, and distribute.

---

## 🙏 Contributing

PRs welcome! Especially for:
- QR code client-side generation (pure JS, no external API)
- Custom logo embedding in QR codes
- Analytics/usage tracking
- Tests and CI/CD pipeline
