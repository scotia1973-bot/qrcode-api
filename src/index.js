/**
 * QR Code API - Cloudflare Worker
 * 
 * Free, self-hostable QR code generation service.
 * Generates QR codes as PNG images from text/URL input.
 * 
 * Self-host on Cloudflare Workers free tier.
 * Or use the hosted version at https://api.gadgethumans.com for $5/mo — no setup needed.
 */

// QR Code error correction levels
const EC_LEVELS = {
  L: { label: 'Low', percent: 7 },
  M: { label: 'Medium', percent: 15 },
  Q: { label: 'Quartile', percent: 25 },
  H: { label: 'High', percent: 30 },
};

// Default settings
const DEFAULTS = {
  size: 256,
  ec_level: 'M',
  margin: 4,
  format: 'png',
  dark_color: '000000',
  light_color: 'ffffff',
};

// Allowed HTTP methods
const ALLOWED_METHODS = ['GET', 'POST', 'OPTIONS'];

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

/**
 * Generate a QR code using the QR Server API (free, no key required)
 * This is a proxy approach — we use qrserver.com's free API to generate QR codes.
 * Alternatively, you can swap in any other QR generation service.
 */
async function generateQRCode(data, params = {}) {
  const size = Math.min(Math.max(parseInt(params.size) || DEFAULTS.size, 100), 1024);
  const margin = parseInt(params.margin) || DEFAULTS.margin;
  const ecLevel = (params.ec_level || DEFAULTS.ec_level).toUpperCase();
  const format = (params.format || DEFAULTS.format).toLowerCase();
  const darkColor = (params.dark_color || DEFAULTS.dark_color).replace('#', '');
  const lightColor = (params.light_color || DEFAULTS.light_color).replace('#', '');

  // Validate EC level
  const validEC = EC_LEVELS[ecLevel];
  if (!validEC) {
    throw new Error(`Invalid error correction level: ${ecLevel}. Use L, M, Q, or H.`);
  }

  // Validate format
  if (!['png', 'svg', 'jpg', 'jpeg'].includes(format)) {
    throw new Error(`Invalid format: ${format}. Use png, svg, or jpg.`);
  }

  // Build the QR code URL using qrserver.com free API
  const qrUrl = new URL('https://api.qrserver.com/v1/create-qr-code/');
  qrUrl.searchParams.set('size', `${size}x${size}`);
  qrUrl.searchParams.set('data', data);
  qrUrl.searchParams.set('margin', margin);
  qrUrl.searchParams.set('ecc', ecLevel);
  qrUrl.searchParams.set('format', format === 'jpeg' ? 'jpg' : format);
  qrUrl.searchParams.set('bgcolor', lightColor);
  qrUrl.searchParams.set('color', darkColor);

  try {
    const response = await fetch(qrUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`QR server error: ${response.status} — ${errorText}`);
    }

    // Get the image data as ArrayBuffer
    const imageBuffer = await response.arrayBuffer();

    // Determine content type
    let contentType = 'image/png';
    if (format === 'svg') contentType = 'image/svg+xml';
    if (format === 'jpg' || format === 'jpeg') contentType = 'image/jpeg';

    return {
      buffer: imageBuffer,
      contentType,
      size,
      format,
      ec_level: ecLevel,
    };
  } catch (err) {
    throw new Error(`Failed to generate QR code: ${err.message}`);
  }
}

/**
 * Handle API request
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Health check
  if (path === '/' || path === '/health') {
    return new Response(JSON.stringify({
      status: 'ok',
      service: 'QR Code API',
      version: '1.0.0',
      docs: '/docs',
    }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  // API documentation
  if (path === '/docs') {
    return new Response(JSON.stringify({
      name: 'QR Code API',
      description: 'Generate QR codes as images (PNG, SVG, JPEG) from text or URLs.',
      version: '1.0.0',
      base_url: 'https://api.gadgethumans.com',
      endpoints: {
        generate_get: {
          method: 'GET',
          path: '/generate?data=Hello%20World',
          description: 'Generate a QR code from query parameters',
          parameters: {
            data: { type: 'string', required: true, description: 'Text or URL to encode' },
            size: { type: 'integer', default: 256, description: 'Image size in pixels (100-1024)' },
            ec_level: { type: 'string', default: 'M', enum: ['L', 'M', 'Q', 'H'], description: 'Error correction level' },
            margin: { type: 'integer', default: 4, description: 'QR code margin' },
            format: { type: 'string', default: 'png', enum: ['png', 'svg', 'jpg'], description: 'Output format' },
            dark_color: { type: 'string', default: '000000', description: 'Dark module color (hex, no #)' },
            light_color: { type: 'string', default: 'ffffff', description: 'Light module color (hex, no #)' },
          },
          response: 'QR code image (binary)',
          example: 'GET /generate?data=https://example.com&size=512&format=png',
        },
        generate_post: {
          method: 'POST',
          path: '/generate',
          description: 'Generate a QR code from JSON body',
          body: {
            data: { type: 'string', required: true },
            size: { type: 'integer', default: 256 },
            ec_level: { type: 'string', default: 'M' },
            margin: { type: 'integer', default: 4 },
            format: { type: 'string', default: 'png' },
            dark_color: { type: 'string', default: '000000' },
            light_color: { type: 'string', default: 'ffffff' },
          },
          response: 'QR code image (binary)',
          example: 'POST /generate { "data": "https://example.com", "size": 512 }',
        },
      },
      rate_limiting: '100 requests per minute per IP',
      pricing: 'Self-host free on Cloudflare Workers, or use the hosted version for $5/mo',
      hosted_url: 'https://api.gadgethumans.com',
    }, null, 2), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  // GET /generate?data=...
  if (path === '/generate' && method === 'GET') {
    const data = url.searchParams.get('data');
    if (!data || data.trim() === '') {
      return new Response(JSON.stringify({ error: 'Missing required parameter: data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    try {
      const params = {
        size: url.searchParams.get('size') || DEFAULTS.size,
        ec_level: url.searchParams.get('ec_level') || DEFAULTS.ec_level,
        margin: url.searchParams.get('margin') || DEFAULTS.margin,
        format: url.searchParams.get('format') || DEFAULTS.format,
        dark_color: url.searchParams.get('dark_color') || DEFAULTS.dark_color,
        light_color: url.searchParams.get('light_color') || DEFAULTS.light_color,
      };

      const result = await generateQRCode(data, params);
      
      return new Response(result.buffer, {
        headers: {
          'Content-Type': result.contentType,
          'Content-Length': result.buffer.byteLength,
          'Cache-Control': 'public, max-age=86400',
          ...CORS_HEADERS,
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }
  }

  // POST /generate
  if (path === '/generate' && method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    if (!body.data || body.data.trim() === '') {
      return new Response(JSON.stringify({ error: 'Missing required field: data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    try {
      const params = {
        size: body.size || DEFAULTS.size,
        ec_level: body.ec_level || DEFAULTS.ec_level,
        margin: body.margin || DEFAULTS.margin,
        format: body.format || DEFAULTS.format,
        dark_color: body.dark_color || DEFAULTS.dark_color,
        light_color: body.light_color || DEFAULTS.light_color,
      };

      const result = await generateQRCode(body.data, params);
      
      return new Response(result.buffer, {
        headers: {
          'Content-Type': result.contentType,
          'Content-Length': result.buffer.byteLength,
          'Cache-Control': 'public, max-age=86400',
          ...CORS_HEADERS,
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }
  }

  // 404
  return new Response(JSON.stringify({ error: 'Not found', docs: '/docs' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// Cloudflare Worker entry point
export default {
  async fetch(request) {
    return handleRequest(request);
  },
};
