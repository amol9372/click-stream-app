const express = require("express");
const { Kafka } = require("kafkajs");
const fs = require("fs");
const dotenv = require("dotenv");
const { log } = require("console");

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
const kafka = new Kafka({
  // clientId: config['client.id'],
  brokers: config["bootstrap.servers"].split(","),
  ssl: config["security.protocol"] === "SASL_SSL",
  sasl: {
    mechanism: config["sasl.mechanisms"].toLowerCase(), // 'plain', 'scram-sha-256', or 'scram-sha-512'
    username: config["sasl.username"],
    password: config["sasl.password"],
  },
});

// Create a Kafka producer
const producer = kafka.producer();

const runProducer = async () => {
  try {
    await producer.connect();
    console.log("Producer connected");
  } catch (err) {
    console.error("Error connecting producer:", err);
  }
};

runProducer();

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

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
