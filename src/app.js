import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/index.js";
import logger from "./middlewares/logger.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Buy Together API" });
});

app.get("/", (req, res) => {
  const protocol = req.header("x-forwarded-proto") || req.protocol || "http";
  const host = req.header("x-forwarded-host") || req.get("host") || "";
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = host;
  const templatePath = path.join(__dirname, "..", "templates", "landing-page.html");
  let html = fs.readFileSync(templatePath, "utf-8");
  html = html
    .replace(/APP_NAME_PLACEHOLDER/g, env.APP_NAME)
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
});

app.use("/api", routes);

app.use(errorMiddleware);

export default app;
