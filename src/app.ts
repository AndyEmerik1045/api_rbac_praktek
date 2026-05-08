import express from "express";
import helmet from "helmet";
import authRoutes from "./interfaces/routes/auth.routes";
import userRoutes from "./interfaces/routes/user.routes";

const app = express();

app.use(helmet());
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);

app.use((_, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

export default app;
