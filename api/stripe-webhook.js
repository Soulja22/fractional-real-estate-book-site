const crypto = require('node:crypto');

const HANDLED = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
  'charge.refunded',
]);

function validStripeSignature(raw, header, secret, now = Date.now()) {
  if (!header || !secret) return false;
  const parts = header.split(',').map((part) => part.trim().split('='));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  const seconds = Number(timestamp);
  if (!Number.isInteger(seconds) || Math.abs(now / 1000 - seconds) > 300) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.`).update(raw).digest();
  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), expected);
  });
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      } else chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function normalize(event) {
  const object = event.data?.object || {};
  const session = event.type.startsWith('checkout.session.') ? object : null;
  const customer = session?.customer_details || {};
  const delivery = session?.shipping_details || session?.collected_information?.shipping_details || {};
  const orderStatus = event.type === 'charge.refunded'
    ? (object.amount_refunded === object.amount ? 'refunded' : 'partially_refunded')
    : event.type === 'checkout.session.expired' ? 'cancelled'
    : event.type === 'checkout.session.async_payment_failed' ? 'failed'
    : session?.payment_status === 'paid' ? 'paid' : 'pending';
  return {
    event_id: event.id,
    event_type: event.type,
    livemode: event.livemode,
    created: event.created,
    checkout_session_id: session?.id || null,
    payment_link_id: session?.payment_link || null,
    payment_intent_id: session?.payment_intent || object.payment_intent || null,
    charge_id: event.type === 'charge.refunded' ? object.id : null,
    payment_status: session?.payment_status || null,
    order_status: orderStatus,
    customer_id: session?.customer || object.customer || null,
    customer_name: customer.name || delivery.name || null,
    customer_email: customer.email || session?.customer_email || null,
    customer_phone: customer.phone || null,
    billing_address: customer.address || null,
    delivery_address: delivery.address || null,
    amount_total: session?.amount_total ?? object.amount ?? null,
    amount_refunded: object.amount_refunded ?? null,
    currency: session?.currency || object.currency || null,
    metadata: session?.metadata || {},
  };
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const target = process.env.PWC_N8N_WEBHOOK_URL;
  const token = process.env.PWC_N8N_WEBHOOK_TOKEN;
  if (!secret || !target || !token) return res.status(503).json({ error: 'Integration not configured' });

  let raw;
  try { raw = await readRawBody(req); }
  catch { return res.status(413).json({ error: 'Invalid payload' }); }
  if (!validStripeSignature(raw, req.headers['stripe-signature'], secret)) {
    return res.status(400).json({ error: 'Invalid Stripe signature' });
  }

  let event;
  try { event = JSON.parse(raw.toString('utf8')); }
  catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  if (!HANDLED.has(event.type)) return res.status(200).json({ ignored: true });

  const payload = normalize(event);
  if (event.type.startsWith('checkout.session.') && event.livemode &&
      payload.payment_link_id !== 'plink_1Uewm1EU4e8KdkuNsRwwuvit') {
    return res.status(200).json({ ignored: true });
  }

  try {
    const upstream = await fetch(target, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-pwc-webhook-token': token },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) throw new Error(`n8n returned ${upstream.status}`);
    return res.status(200).json({ received: true });
  } catch {
    // A non-2xx response asks Stripe to retry the event.
    return res.status(502).json({ error: 'Order synchronization unavailable' });
  }
}

module.exports = handler;
module.exports.validStripeSignature = validStripeSignature;
module.exports.normalize = normalize;
