import { connectDB, env } from "./config/index.js";
import app from "./app.js";

connectDB().then(() => {
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
  });
});
