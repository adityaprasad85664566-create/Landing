import crypto from 'node:crypto';

const COOKIE = 'mp_admin_session';
const MAX_AGE = 60 * 60 * 8;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.');
  return value;
}
function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}
export function createSession() {
  const payload = `${Date.now() + MAX_AGE * 1000}.${crypto.randomBytes(16).toString('hex')}`;
  return `${payload}.${sign(payload)}`;
}
export function validSession(req) {
  try {
    const raw = req.headers.cookie || '';
    const token = raw.split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
    if (!token) return false;
    const parts = decodeURIComponent(token).split('.');
    if (parts.length !== 3) return false;
    const payload = `${parts[0]}.${parts[1]}`;
    const expected = sign(payload);
    const got = parts[2];
    if (got.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected))) return false;
    return Number(parts[0]) > Date.now();
  } catch { return false; }
}
export function setSession(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${MAX_AGE}${secure}`);
}
export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0; Secure`);
}
export function requireAdmin(req, res) {
  if (!validSession(req)) {
    res.status(401).json({error:'Please sign in again.'});
    return false;
  }
  return true;
}
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try { return new URL(origin).host === host; } catch { return false; }
}
