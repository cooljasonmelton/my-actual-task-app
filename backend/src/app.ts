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

// OR safer: allow only your frontend
app.use(
  cors({
    origin: "http://localhost:3000", // React dev server
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if you use cookies or auth headers
  })
);

app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from backend" });
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
