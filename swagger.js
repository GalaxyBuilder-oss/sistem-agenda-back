import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "My API",
        version: "1.0.0",
        description: "API documentation for my Node.js application",
    },
    servers: [
        {
            url: "http://localhost:3000", // Update with your server URL
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ["./routes/*.js"], // Path to your API docs
};

const swaggerSpec = swaggerJSDoc(options);

export const swaggerDocs = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};