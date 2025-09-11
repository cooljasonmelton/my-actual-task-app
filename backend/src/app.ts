import express, { Application } from "express";
import taskRoutes from "./routes/tasks";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

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
