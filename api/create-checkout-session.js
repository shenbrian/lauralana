// Vercel Serverless Function — POST /api/create-checkout-session
// Body: { "id": "<product id from data/products.json>" }
// Returns: { "url": "<Stripe-hosted checkout page URL>" }
//
// Requires an environment variable STRIPE_SECRET_KEY set in the Vercel
// project (Settings -> Environment Variables). Use a sk_test_... key while
// testing, and switch to sk_live_... only once ready to take real payments.

const products = require('../data/products.json');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({
      error: 'Payments are not configured yet. Please contact the studio directly.',
    });
  }

  let body = req.body;
  if (!body || typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch {
      body = {};
    }
  }

  const { id } = body || {};
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  if (product.sold) {
    return res.status(400).json({ error: 'Sorry — this piece has already been sold.' });
  }
  if (!product.priceAUD || product.priceAUD <= 0) {
    return res.status(400).json({ error: 'This piece does not have a price set yet.' });
  }

  const origin = req.headers.origin || `https://${req.headers.host}`;

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', `${origin}/?checkout=success&item=${encodeURIComponent(product.id)}`);
  params.append('cancel_url', `${origin}/?checkout=cancelled`);
  params.append('line_items[0][quantity]', '1');
  params.append('line_items[0][price_data][currency]', 'aud');
  params.append('line_items[0][price_data][unit_amount]', String(product.priceAUD));
  params.append('line_items[0][price_data][product_data][name]', `LAURA LANA — ${product.en}`);
  if (product.descEn) {
    params.append('line_items[0][price_data][product_data][description]', product.descEn);
  }
  params.append('metadata[product_id]', product.id);

  // Countries LAURA LANA currently ships to. Add/remove ISO codes as needed.
  ['AU', 'NZ', 'US', 'GB', 'CA', 'CN', 'SG', 'HK'].forEach((code, i) => {
    params.append(`shipping_address_collection[allowed_countries][${i}]`, code);
  });

  try {
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error('Stripe error:', session);
      return res.status(500).json({ error: session.error?.message || 'Stripe error.' });
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    return res.status(500).json({ error: 'Server error creating checkout session.' });
  }
};
