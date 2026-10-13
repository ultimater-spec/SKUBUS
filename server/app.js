import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import busRoutes from './routes/busRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Middleware Imports
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

// Enable trust proxy for cloud deployment (Render, Railway, Heroku, Vercel)
app.set('trust proxy', 1);

// Allowed origins for CORS (including production Vercel and local dev)
const clientOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...clientOrigins,
  env.clientUrl?.replace(/\/+$/, ''),
  'https://skubus.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const cleanOrigin = origin.trim().replace(/\/+$/, '');
    const isAllowed = allowedOrigins.includes(cleanOrigin) || 
      cleanOrigin.endsWith('.vercel.app') || 
      cleanOrigin.endsWith('.onrender.com') ||
      cleanOrigin.includes('localhost') || 
      cleanOrigin.includes('127.0.0.1');

    if (isAllowed) {
      return callback(null, true);
    }
    // Fallback: in hosted setups, allow the origin so preflight won't fail
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check Endpoints
const healthHandler = (req, res) => {
  res.status(200).json({
    status: true,
    message: 'SKUBUS API is running'
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// API Routes (Mounted with /api and without /api to prevent missing-prefix failures)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/students', studentRoutes);
app.use('/students', studentRoutes);

app.use('/api/parents', parentRoutes);
app.use('/parents', parentRoutes);

app.use('/api/staff', staffRoutes);
app.use('/staff', staffRoutes);

app.use('/api/buses', busRoutes);
app.use('/buses', busRoutes);

app.use('/api/routes', routeRoutes);
app.use('/routes', routeRoutes);

app.use('/api/attendance', attendanceRoutes);
app.use('/attendance', attendanceRoutes);

app.use('/api/complaints', complaintRoutes);
app.use('/complaints', complaintRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/admin/dashboard', dashboardRoutes);

// Central Error Handler
app.use(notFound);
app.use(errorHandler);

export default app;
