import app from "./app";
import { envConfig } from "./configs/env.config";
import { authRouter } from "./routes/auth.route";
import { locationRouter } from "./routes/location.route";
import { subLocationRouter } from "./routes/subLocation.route";

// Register routes
app.use("/api/v1/auth", authRouter,);
app.use("/api/v1/location", locationRouter);
app.use("/api/v1/sublocation", subLocationRouter);
// Start server
const PORT = envConfig.appPort;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
