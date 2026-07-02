const { paypalBaseUrl, getAccessToken } = require('./_lib/paypal');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const amount = process.env.PAYPAL_AMOUNT || '9.00';
  const currency = process.env.PAYPAL_CURRENCY || 'USD';

  try {
    const accessToken = await getAccessToken();

    const resp = await fetch(`${paypalBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: 'Sahasra Signature Studio — Full License',
            amount: { currency_code: currency, value: amount },
          },
        ],
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error('paypal-create-order error:', data);
      res.status(500).json({ error: 'Could not create PayPal order.' });
      return;
    }

    res.status(200).json({ id: data.id });
  } catch (err) {
    console.error('paypal-create-order error:', err);
    res.status(500).json({ error: err.message });
  }
};
