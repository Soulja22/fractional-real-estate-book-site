const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { validStripeSignature, normalize } = require('../api/stripe-webhook');

test('accepts a current Stripe signature and rejects tampering or stale events', () => {
  const body = Buffer.from('{"id":"evt_test"}');
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac('sha256', 'whsec_test').update(`${timestamp}.`).update(body).digest('hex');
  const header = `t=${timestamp},v1=${signature}`;
  assert.equal(validStripeSignature(body, header, 'whsec_test'), true);
  assert.equal(validStripeSignature(Buffer.from('tampered'), header, 'whsec_test'), false);
  assert.equal(validStripeSignature(body, header, 'whsec_test', (timestamp + 301) * 1000), false);
});

test('only forwards customer and transaction fields, with no payment method data', () => {
  const payload = normalize({
    id: 'evt_test', type: 'checkout.session.completed', livemode: false,
    data: { object: {
      id: 'cs_test', payment_intent: 'pi_test', payment_status: 'paid',
      customer_details: { name: 'Example Buyer', email: 'buyer@example.com', phone: '+441234', address: { country: 'GB' } },
      shipping_details: { address: { country: 'NG' } },
      payment_method_details: { card: { last4: '4242' } },
    } },
  });
  assert.equal(payload.customer_name, 'Example Buyer');
  assert.equal(payload.delivery_address.country, 'NG');
  assert.equal(payload.payment_intent_id, 'pi_test');
  assert.equal(payload.order_status, 'paid');
  assert.equal(JSON.stringify(payload).includes('4242'), false);
});

test('an unpaid completed session remains pending and a partial refund is distinct', () => {
  const pending = normalize({ id: 'evt_1', type: 'checkout.session.completed', data: { object: { payment_status: 'unpaid' } } });
  const partial = normalize({ id: 'evt_2', type: 'charge.refunded', data: { object: { amount: 2000, amount_refunded: 500 } } });
  assert.equal(pending.order_status, 'pending');
  assert.equal(partial.order_status, 'partially_refunded');
});

