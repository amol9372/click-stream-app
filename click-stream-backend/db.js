import sqlite3 from "sqlite3";

class DB {
  constructor() {
    if (DB.instance) {
      return DB.instance;
    }

    try {
      this.connection = new sqlite3.Database("../db/click-stream.db");
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
