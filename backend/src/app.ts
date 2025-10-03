import express, { Application } from "express";
import cors from "cors";
import taskRoutes from "./routes/tasks";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

// (DON'T PUSH TO PRODUCTION) allow all cross origin
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/tasks", taskRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Error handling middleware (should be last)
app.use(errorHandler);

export default app;
