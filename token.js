const crypto = require('crypto');

function signToken(orderId) {
  const secret = process.env.SESSION_SECRET;
  const payload = JSON.stringify({ sid: orderId, ts: Date.now() });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return false;
  try {
    const [payloadB64, sig] = token.split('.');
    const expected = crypto
      .createHmac('sha256', process.env.SESSION_SECRET)
      .update(payloadB64)
      .digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (e) {
    return false;
  }
}

module.exports = { signToken, verifyToken };
