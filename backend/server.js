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

// Start server
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Backend server running smoothly on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
