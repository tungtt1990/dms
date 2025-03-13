// src/app.js
const express = require('express');
const setupSwagger = require("./config/swaggerConfig");
const app = express();

// Middleware xử lý JSON
app.use(express.json());

// Load các router tổng hợp
const routes = require('./routes');
app.use('/api', routes);

// Middleware xử lý lỗi (nếu cần)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// 🔹 Cấu hình Swagger
setupSwagger(app);

module.exports = app;