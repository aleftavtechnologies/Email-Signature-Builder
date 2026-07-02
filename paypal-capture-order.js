const { paypalBaseUrl, getAccessToken } = require('./_lib/paypal');
const { signToken } = require('./_lib/token');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const orderID = body && body.orderID;

  if (!orderID) {
    res.status(400).json({ error: 'Missing orderID' });
    return;
  }

  try {
    const accessToken = await getAccessToken();

    const resp = await fetch(`${paypalBaseUrl()}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await resp.json();

    const captureStatus =
      data &&
      data.purchase_units &&
      data.purchase_units[0] &&
      data.purchase_units[0].payments &&
      data.purchase_units[0].payments.captures &&
      data.purchase_units[0].payments.captures[0] &&
      data.purchase_units[0].payments.captures[0].status;

    if (resp.ok && (data.status === 'COMPLETED' || captureStatus === 'COMPLETED')) {
      const token = signToken(orderID);
      res.status(200).json({ paid: true, token });
    } else {
      console.error('paypal-capture-order not completed:', data);
      res.status(200).json({ paid: false });
    }
  } catch (err) {
    console.error('paypal-capture-order error:', err);
    res.status(500).json({ error: err.message });
  }
};
