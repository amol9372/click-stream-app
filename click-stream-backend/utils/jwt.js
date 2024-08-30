import jwt from "jsonwebtoken";
import { logger } from "./logger.js";
import { publishKafkaMessage } from "../kafka.js";
import { AUTH_TOPIC } from "./constants.js";

// Secret key should be kept in environment variables for security
const SECRET_KEY = process.env.JWT_SECRET || "samplesecretkey";

export function authenticateToken(req, res, next) {
  // Get the token from headers
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ error: "Token required" });
  }
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      logger.error("Invalid token");
      return res.status(403).json({ error: "Forbidden" });
    }

    const decoded = jwt.decode(token);
    // Attach user information to the request object
    req.user = { userId: decoded.id, email: decoded.email };
    next();
  });
}
