import express from "express";
import cors from "cors";
import logger from "./middlewares/logger.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Buy Together API" });
});

app.use("/api", routes);

app.use(errorMiddleware);

export default app;
