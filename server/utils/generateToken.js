import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const generateToken = (res, userId, role) => {
  const token = jwt.sign({ id: userId, role }, env.jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export default generateToken;
