const express = require("express");
const { Kafka } = require("kafkajs");
const fs = require("fs");
const dotenv = require("dotenv");
const { log } = require("console");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

// Parse client.properties and load it into environment variables
const loadProperties = (filePath) => {
  const properties = fs.readFileSync(filePath, "utf-8");
  const config = dotenv.parse(properties);
  return config;
};

// Load properties from client.properties
const config = loadProperties("./client.properties");

// Initialize KafkaJS with the properties from client.properties

// const kafka = new Kafka({
//   // clientId: config['client.id'],
//   brokers: config["bootstrap.servers"].split(","),
//   ssl: config["security.protocol"] === "SASL_SSL",
//   sasl: {
//     mechanism: config["sasl.mechanisms"].toLowerCase(), // 'plain', 'scram-sha-256', or 'scram-sha-512'
//     username: config["sasl.username"],
//     password: config["sasl.password"],
//   },
// });

// // Create a Kafka producer
// const producer = kafka.producer();

// const runProducer = async () => {
//   try {
//     await producer.connect();
//     console.log("Producer connected");
//   } catch (err) {
//     console.error("Error connecting producer:", err);
//   }
// };

// runProducer();

app.post("/produce", async (req, res) => {
  const { key, value } = req.body;

  try {
    await producer.send({
      topic: "click_stream_auth",
      messages: [{ key: key.toString(), value: value }],
    });

    res.status(200).send("Message produced successfully");
    log("Message produced successfully");
  } catch (error) {
    console.error("Error producing message", error);
    res.status(500).send("Error producing message");
  }
});

// Secret key for JWT
const SECRET_KEY = "samplesecretkey";

// Connect to SQLite database
const db = new sqlite3.Database("../db/click-stream.db");

// Authenticate endpoint
app.post("/authenticate", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

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

      return res.json({ token });
    } else if (user.Password != password) {
      return res.status(401).json({ error: "Invalid password" });
    } else {
      return res.status(500).json({ error: "Error comparing passwords" });
    }
  });
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
