// backend/server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { port } = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const fileRoutes = require('./routes/file.routes');
const errorHandler = require('./middleware/errorHandler');

async function bootstrap() {
  await connectDB();

  const app = express();

  app.use(cors());
  app.use(express.json());

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/files', fileRoutes);

  // Serve frontend (optional, from ../frontend/public)
  const publicDir = path.join(__dirname, '..', '..', 'frontend', 'public');
  app.use(express.static(publicDir));

  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

bootstrap();
