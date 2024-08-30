import express from "express";
import jwt from "jsonwebtoken";
import DB from "../db.js";
import { publishKafkaMessage } from "../kafka.js";
import { logger } from "../utils/logger.js";
import { AUTH_TOPIC } from "../utils/constants.js";

const router = express.Router();

const db = DB.getConnection();

const SECRET_KEY = "samplesecretkey";

router.post("/authenticate", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const source = req.header("User-Agent");

  // Query the users table for the given email
  const query = "SELECT * FROM users WHERE Email = ?";
  db.get(query, [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email" });
    }

    // Compare the provided password with the stored hashed password
    if (user.Password === password) {
      // Password matches, generate a JWT token
      const token = jwt.sign({ id: user.ID, email: user.Email }, SECRET_KEY, {
        expiresIn: "12h",
      });

      const event = {
        key: user.ID,
        message: { type: "LOGIN_SUCCESSFUL", from: source },
      };

      publishKafkaMessage(AUTH_TOPIC, event).catch((err) => logger.error(err));

      return res.json({ token });
    } else if (user.Password != password) {
      const event = {
        key: user.ID,
        message: { type: "LOGIN_FAILED", from: source },
      };

      publishKafkaMessage(AUTH_TOPIC, event).catch((err) => logger.error(err));

      return res.status(401).json({ error: "Invalid password" });
    } else {
      return res.status(500).json({ error: "Error comparing passwords" });
    }
  });
});

export default router;
