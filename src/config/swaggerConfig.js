const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: 'DMS - API Documentation',
            version: '1.0.0',
            description: 'Tài liệu API tự động tạo bằng Swagger',
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production' ? "https://dms-api-alpha.vercel.app/api" : "http://localhost:3000/api",
                description: process.env.NODE_ENV === 'production' ? "Production Server" : "Local Server",
            },

        ],
        components: {
            securitySchemes: {
                // Định nghĩa bearerAuth cho token (JWT)
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        // Áp dụng xác thực toàn cục cho các API (có thể override ở từng endpoint nếu cần)
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ["./routes/*.js"], // Định nghĩa API từ các file route
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
    if (process.env.ENABLE_SWAGGER === "true") {
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
        console.log("Swagger is running at /api-docs");
    }
}

module.exports = setupSwagger;
