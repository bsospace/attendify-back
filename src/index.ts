import app from "./app";
import { envConfig } from "./configs/env.config";
import { authRouter } from "./routes/auth.route";

// Register routes
app.use("/api/v1/auth", authRouter);

// Start server
const PORT = envConfig.appPort;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
