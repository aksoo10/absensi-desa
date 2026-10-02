require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, getPool } = require('./src/config/db');

const authRouter = require('./src/routes/auth');
const attendanceRouter = require('./src/routes/attendance');
const leaveRouter = require('./src/routes/leave');
const pegawaiRouter = require('./src/routes/pegawai');
const schedulesRouter = require('./src/routes/schedules');
const reportsRouter = require('./src/routes/reports');
const dashboardRouter = require('./src/routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/pegawai', pegawaiRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/dashboard', dashboardRouter);

// Root endpoint
app.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `disconnected (${err.message})`;
  }

  res.json({
    status: 'success',
    message: 'Backend API Presensi Pegawai is running!',
    database: {
      status: dbStatus,
      name: process.env.DB_NAME || 'absensi_db',
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306
    },
    docs: {
      health: '/api/health',
      auth: '/api/auth',
      attendance: '/api/attendance',
      leave: '/api/leave',
      pegawai: '/api/pegawai',
      schedules: '/api/schedules',
      reports: '/api/reports',
      dashboard: '/api/dashboard'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT DATABASE() as current_db, NOW() as server_time');
    res.json({
      status: 'ok',
      database: 'connected',
      details: rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database initialization promise
let dbInitPromise = null;
function ensureDB() {
  if (!dbInitPromise) {
    dbInitPromise = initDB().catch((err) => {
      console.error('Database connection error:', err.message);
      dbInitPromise = null; // allow retry on next request
      throw err;
    });
  }
  return dbInitPromise;
}

// Middleware to ensure DB is connected before handling /api routes
app.use('/api', async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    res.status(503).json({
      status: 'error',
      message: 'Database service unavailable. Silakan periksa koneksi database Anda (DB_HOST, DB_USER, dll).',
      error: err.message
    });
  }
});

// Start server locally (when not running in serverless / Vercel environment)
if (!process.env.VERCEL) {
  ensureDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Backend server running smoothly on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Failed to connect to database on startup:', error.message);
      console.log(`Starting server anyway on http://localhost:${PORT} (API requests will return 503 until DB is reachable)`);
      app.listen(PORT);
    });
}

module.exports = app;
