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
