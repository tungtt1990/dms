// src/app.js
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
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
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DMS - API Documentation',
      version: '1.0.0',
      description: 'Tài liệu API tự động tạo bằng Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3000/api-docs',
        description: 'Production server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Đọc tài liệu API từ các file route
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// 🔹 Thêm route Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Xuất file JSON để test trên Postman
app.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

module.exports = app;