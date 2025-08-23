import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function authenticateGoogleToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(401);
  
  const token = authHeader.split(' ')[1];
  
  // Development mode: Accept mock token (works in both dev and production)
  if (token === 'dev-token-123') {
    req.user = {
      sub: 'dev-user-123',
      email: 'devuser@example.com',
      name: 'Dev User',
      picture: 'https://ui-avatars.com/api/?name=Dev+User&background=2C2C2C&color=fff',
    };
    return next();
  }
  
  // Production mode: Verify Google token
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID not set');
      return res.status(500).json({ error: 'Authentication not configured' });
    }
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    req.user = payload; // contains sub (user id), email, name, etc.
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    res.status(403).json({ error: 'Invalid token' });
  }
}

export default authenticateGoogleToken; 