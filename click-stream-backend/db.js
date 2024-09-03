import sqlite3 from "sqlite3";
import { logger } from "./utils/logger.js";

class DB {
  constructor() {
    if (DB.instance) {
      return DB.instance;
    }

    try {
      this.connection = new sqlite3.Database("./db/click-stream.db");
      this.connection.run("PRAGMA foreign_keys = ON;", (err) => {
        if (err) {
          console.error("Failed to enable foreign keys:", err.message);
          return;
        }
        logger.info("Foreign keys are enabled");
      });

      console.log("Connected to SqlLite3");
    } catch (e) {
      console.log("Error in connecting DB ::: ", e);
    }

    DB.instance = this;

    return this;
  }

  static getInstance() {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  static getConnection() {
    return DB.getInstance().connection;
  }
}

export default DB;
