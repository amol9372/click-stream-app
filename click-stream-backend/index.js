import express from "express";
import CartApi from "./routes/cartApi.js";
import UsersApi from "./routes/usersApi.js";
import AuthApi from "./routes/authApi.js";
import OrdersApi from "./routes/ordersApi.js";
import cors from "cors";
import DB from "./db.js";
import { authenticateToken } from "./utils/jwt.js";
import { logger } from "./utils/logger.js";
import { resetCartStatus } from "./cronjob.js";

const app = express();

// Start the Express server
const startServer = async () => {
  DB.getConnection();

  const port = 5001; // Use a port of your choice
  app.use(cors());
  app.use(express.json());
  app.use("/api", authenticateToken);

  app.use("/health-check", (req, res) => {
    res.send("App running!");
  });

  // API Routes
  app.use("/api/users", UsersApi);
  app.use("/public", AuthApi);
  app.use("/api/cart", CartApi);
  app.use("/api/orders", OrdersApi);

  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
};

startServer();

resetCartStatus();
