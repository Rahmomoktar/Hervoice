import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { wrap, validId } from '../utils/helpers.js';
export function auth(...roles) {
  return wrap(async (req, res, next) => {
    const bearer = req.headers.authorization || '';
    if (!bearer.startsWith('Bearer ')) return res.status(401).json({
      error: 'Login required'
    });
    let payload;
    try {
      payload = jwt.verify(bearer.slice(7), process.env.JWT_SECRET, {
        algorithms: ['HS256']
      });
    } catch {
      return res.status(401).json({
        error: 'Session expired or invalid'
      });
    }
    if (!validId(payload.id)) return res.status(401).json({
      error: 'Invalid session'
    });
    const user = await User.findById(payload.id);
    if (!user || user.active === false) return res.status(401).json({
      error: 'Account not found'
    });
    if (roles.length && !roles.includes(user.role)) return res.status(403).json({
      error: 'Access denied'
    });
    req.user = user;
    next();
  });
}
