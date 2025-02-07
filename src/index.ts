import app from "./app";
import { authRouter } from "./routes/auth.route";
import { groupRouter } from "./routes/group.route";
import { locationRouter } from "./routes/location.route";
import { subLocationRouter } from "./routes/subLocation.route";
import { userRouter } from "./routes/user.route";

// Register routes
app.use("/api/v1/auth", authRouter,);
app.use("/api/v1/location", locationRouter);
app.use("/api/v1/sublocation", subLocationRouter);
app.use("/api/v1/group", groupRouter);
app.use("/api/v1/user", userRouter);