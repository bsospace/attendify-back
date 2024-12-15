import express from "express";
import { Request, Response } from "express-serve-static-core";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import setupSwagger from "./swagger";
import cookieParser from "cookie-parser";


// Load environment variables
dotenv.config();

// Initiaalize Express
const app = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], 
    exposedHeaders: ["Content-Length", "X-Response-Time"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    optionsSuccessStatus: 204, // Status for preflight response
  };

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors(corsOptions)); // Enable CORS for all routes
app.use(helmet()); // Add security-related HTTP headers
app.use(morgan("dev")); // Log HTTP requests in development mode
setupSwagger(app);
app.use(cookieParser());
// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// Export the app
export default app;
