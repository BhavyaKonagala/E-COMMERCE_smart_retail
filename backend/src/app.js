const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// ------------------------------------------------------
// ✅ ALLOWED FRONTEND ORIGINS (PUT AT TOP!)
// ------------------------------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://smartretailecommerceweb.netlify.app" // your deployed frontend
];

// ------------------------------------------------------
// SERVER + SOCKET SETUP
// ------------------------------------------------------
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

// ------------------------------------------------------
// MIDDLEWARE
// ------------------------------------------------------
app.use(helmet());
app.use(compression());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ BLOCKED ORIGIN:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Allow preflight requests
app.options("*", cors());

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// ------------------------------------------------------
// DATABASE
// ------------------------------------------------------
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-retail-recommendations')
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// ------------------------------------------------------
// SOCKET EVENTS
// ------------------------------------------------------
io.on('connection', (socket) => {
  logger.info('User connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(userId);
    logger.info(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected:', socket.id);
  });
});

app.set('io', io);

// ------------------------------------------------------
// ROUTES
// ------------------------------------------------------
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const recommendationRoutes = require('./routes/recommendations');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');
const aiAssistantRoutes = require('./routes/aiAssistant');
const notificationRoutes = require('./routes/notifications');
const businessInsightsRoutes = require('./routes/businessInsights');
const userActivityRoutes = require('./routes/userActivity');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/business-insights', businessInsightsRoutes);
app.use('/api/activity', userActivityRoutes);

// ------------------------------------------------------
// HEALTH CHECK
// ------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ------------------------------------------------------
// ERROR HANDLING
// ------------------------------------------------------
app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ------------------------------------------------------
// START SERVER
// ------------------------------------------------------
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  logger.info(`Server running on ${HOST}:${PORT}`);
});

module.exports = app;
