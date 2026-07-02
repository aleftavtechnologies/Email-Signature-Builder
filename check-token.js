const { verifyToken } = require('./_lib/token');

module.exports = async (req, res) => {
  const { token } = req.query;
  if (!process.env.SESSION_SECRET) {
    res.status(500).json({ error: 'Server is not configured yet.' });
    return;
  }
  res.status(200).json({ valid: verifyToken(token) });
};
