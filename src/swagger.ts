/**
 * swagger.ts
 * This file is responsible for setting up the swagger documentation
 * Author: Piyawat Wongyat
 * Created: 14/08/2024
 */

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { envConfig } from "./configs/env.config";

// Swagger configuration

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Attendify API",
      version: "1.0.0",
      description: "Attendify API documentation",
    },
    servers: [
      {
        url: `${envConfig.nodeEnv === "development" ? `http://localhost:${envConfig.appPort}/api/v1` : `${envConfig.prodBackEndUrl}/api/v1`}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/docs/*.yaml"],
};

// Initialize swagger-jsdoc

const swaggerSpec = swaggerJSDoc(options);

// Setup Swagger
const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;