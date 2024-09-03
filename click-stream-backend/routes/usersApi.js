import express from "express";
import { Kafka } from "kafkajs";
import fs from "fs";
import dotenv from "dotenv";
import { log } from "console";
import sqlite3 from "sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import DB from "../db.js";

const router = express.Router();

const db = DB.getConnection();
export default router;

router.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Fetch user details from the database
    const user = await getUserById(userId);

    // 2. Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 3. (Optional) Filter sensitive data before sending the response
    const filteredUser = {
      // Include only the fields you want to expose
      id: user.ID,
      email: user.Email,
      address: user.Address,
      // ... other relevant fields
    };

    res.status(200).json(filteredUser);
  } catch (err) {
    logger.error(
      err.error || "An error occurred while fetching user information"
    );
    res.status(err.status || 500).json({
      message: err.error || "An error occurred while fetching user information",
    });
  }
});

router.post("/users", async (req, res) => {
  const { email, address, paymentMethod } = req.body;

  // Basic input validation (you'll want to add more robust checks)
  if (!email || !address) {
    return res.status(400).json({ error: "Email and address are required" });
  }

  try {
    // 1. Check if email already exists (optional, depends on your requirements)
    const existingUser = await checkExistingUser(email);
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // 2. (Optional) Hash the password if you're storing it
    // const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert the new user into the database
    const result = await createUser(
      email,
      address,
      paymentMethod /*, hashedPassword */
    );
    const newUserId = result.lastID;

    // 4. (Optional) Generate a JWT token for authentication
    // const token = jwt.sign({ userId: newUserId }, 'your_secret_key');

    // 5. Publish a Kafka event
    const event = {
      key: newUserId, // Use the new user's ID as the key
      message: { type: "USER_CREATED", userId: newUserId },
    };
    publishKafkaMessage(USER_TOPIC, event).catch((err) => logger.error(err));

    res.status(201).json({
      message: "User created successfully",
      userId: newUserId,
      // token: token  // Include the token if you generated one
    });
  } catch (err) {
    logger.error(err.error || "An error occurred during user creation");
    res.status(err.status || 500).json({
      message: err.error || "An error occurred during user creation",
    });
  }
});

// Helper function (you'll need to implement this based on your database schema)
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

// Helper functions (you'll need to implement these based on your database schema)

function checkExistingUser(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT ID FROM users WHERE email = ?";
    db.get(query, [email], (err, row) => {
      if (err) {
        return reject({
          status: 500,
          error: "Database error while fetching user",
        });
      }
      resolve(row ? row.ID : null);
    });
  });
}

function createUser(email, address, paymentMethod /*, hashedPassword */) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO users (Email, Address, PaymentMethod) 
      VALUES (?, ?, ?)
    `;

    db.run(query, [email, address, paymentMethod], function (err) {
      if (err) {
        return reject({
          status: 500,
          error: "Database error while creating user",
        });
      }
      resolve(this); // Resolve with the 'this' object to access lastID
    });
  });
}
