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
                url: "http://localhost:3000/api", // Local server
                description: "Localhost Server",
            },
            {
                url: "https://dms-api-alpha.vercel.app/api",
                description: "Production Server",
            },
        ],
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
