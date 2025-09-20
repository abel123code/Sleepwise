import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

console.log("📦 Importing routes...");
import calendarRoutes from './src/routes/calendar.js';
import eventsRoutes from './src/routes/events.js';
console.log("✅ Routes imported successfully");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers

// CORS configuration - allow all origins for development
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'WTH MVP Backend is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint (alternative route)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'WTH MVP Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug middleware to see all requests
app.use((req, res, next) => {
  console.log(`🔍 Incoming request: ${req.method} ${req.originalUrl}`);
  console.log(`📋 Query params:`, req.query);
  console.log(`🌐 Origin:`, req.headers.origin);
  next();
});

// Handle preflight requests
app.options('*', (req, res) => {
  console.log('🔄 Preflight request received');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// OAuth callback route for Google
app.get('/api/auth/callback/google', (req, res) => {
  console.log("🔗 Google OAuth callback received");
  console.log("📋 Query params:", req.query);
  
  const { code, error } = req.query;
  
  if (error) {
    console.log("❌ OAuth error:", error);
    return res.status(400).json({ 
      error: 'OAuth authorization failed', 
      details: error 
    });
  }
  
  if (code) {
    console.log("✅ Authorization code received:", code);
    res.json({ 
      message: 'Authorization successful!', 
      code: code,
      instructions: 'Copy this code and paste it in your terminal where the refresh token script is waiting'
    });
  } else {
    res.status(400).json({ error: 'No authorization code received' });
  }
});

// API routes
console.log("🔧 Setting up routes...");
app.use('/calendar', calendarRoutes);
app.use('/api/events', eventsRoutes);
console.log("✅ Routes mounted successfully");


app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to WTH MVP API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      root: '/',
      calendar: {
        day: '/calendar/day?date=YYYY-MM-DD'
      },
      events: {
        breakdown: 'POST /api/events/breakdown'
      },
      oauth: {
        callback: '/api/auth/callback/google'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check available at: http://localhost:${PORT}/`);
  console.log(`📍 Alternative health check: http://localhost:${PORT}/health`);
  console.log(`📍 API info: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
