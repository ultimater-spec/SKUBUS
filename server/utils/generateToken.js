import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const generateToken = (res, userId, role) => {
  const token = jwt.sign({ id: userId, role }, env.jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const isProd = process.env.NODE_ENV === 'production' || 
    process.env.COOKIE_SECURE === 'true' || 
    Boolean(process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost'));

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd, // true for https in production / cross-site
    sameSite: isProd ? 'none' : 'lax', // 'none' required for cross-site cookies between Vercel and backend
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export default generateToken;
