module.exports = async (req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) {
    res.status(200).json({ configured: false });
    return;
  }
  res.status(200).json({
    configured: true,
    clientId,
    currency: process.env.PAYPAL_CURRENCY || 'USD',
  });
};
