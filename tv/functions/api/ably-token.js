const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!env.ABLY_KEY) {
    return json({ error: 'Missing ABLY_KEY environment variable' }, 500);
  }

  try {
    const params = await readParams(request);
    const [keyName, keySecret] = env.ABLY_KEY.split(':');

    if (!keyName || !keySecret) {
      return json({ error: 'ABLY_KEY must be in the format keyName:keySecret' }, 500);
    }

    const ttl = clampNumber(params.ttl, 60 * 60 * 1000, 5 * 60 * 1000, 60 * 60 * 1000);
    const clientId = cleanClientId(params.clientId || '*');
    const capability = JSON.stringify({
      'sws-tv-room-*': ['publish', 'subscribe', 'presence'],
    });
    const timestamp = Date.now();
    const nonce = crypto.randomUUID().replace(/-/g, '');

    const mac = await hmacSha256Hex(keySecret, [
      keyName,
      ttl,
      capability,
      clientId,
      timestamp,
      nonce,
      '',
    ].join('\n'));

    return json({
      keyName,
      ttl,
      capability,
      clientId,
      timestamp,
      nonce,
      mac,
    });
  } catch (err) {
    return json({ error: err?.message || 'Could not create Ably token request' }, 500);
  }
}

async function readParams(request) {
  const url = new URL(request.url);
  const output = Object.fromEntries(url.searchParams.entries());

  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      Object.assign(output, body || {});
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await request.formData().catch(() => null);
      if (form) {
        for (const [key, value] of form.entries()) {
          output[key] = value;
        }
      }
    } else {
      const text = await request.text().catch(() => '');
      if (text) {
        try {
          Object.assign(output, JSON.parse(text));
        } catch (_) {
          for (const [key, value] of new URLSearchParams(text).entries()) {
            output[key] = value;
          }
        }
      }
    }
  }

  return output;
}

function clampNumber(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function cleanClientId(value) {
  const text = String(value || '*').trim();
  if (text === '*') return '*';
  return text.replace(/[^a-zA-Z0-9_@.:-]/g, '').slice(0, 80) || '*';
}

async function hmacSha256Hex(secret, text) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(text));
  return [...new Uint8Array(signature)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
