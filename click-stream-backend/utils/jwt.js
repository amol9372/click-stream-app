import jwt from "jsonwebtoken";
import { logger } from "./logger.js";
import DB from "../db.js";

// Secret key should be kept in environment variables for security
const SECRET_KEY = process.env.JWT_SECRET || "samplesecretkey";

const db = DB.getConnection();

export const authenticateToken = (req, res, next) => {
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
    const userFromDb = getUserById(decoded.id);

    userFromDb
      .then((res) => {
        logger.info(`"Logged in user \n ${JSON.stringify(res)}"`);

        req.user = {
          userId: res.ID,
          name: res.Name,
          email: res.Email,
          address: {
            streetAddress: res.Address,
            city: res.City,
            province: res.Province,
            zip: res.Zip,
          },
        };
        next();
      })
      .catch((err) => {
        return res.status(500).json({ error: err });
      });
  });
};

function getUserById(userId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE ID = ?";
    db.get(query, [userId], (err, row) => {
      if (err) {
        return reject({
          status: 500,
          error: "Database error while fetching user",
        });
      }
      resolve(row);
    });
  });
}
