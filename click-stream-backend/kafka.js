import { Kafka } from "kafkajs";
import fs from "fs";
import dotenv from "dotenv";
import { log } from "console";
import sqlite3 from "sqlite3";
import { logger } from "./utils/logger.js";
import { createHash } from "crypto";

// Initialize KafkaJS with the properties from client.properties
const loadProperties = (filePath) => {
  const properties = fs.readFileSync(filePath, "utf-8");
  const config = dotenv.parse(properties);
  return config;
};

const config = loadProperties("./client.properties");

const kafka = new Kafka({
  // clientId: config['client.id'],
  brokers: config["bootstrap.servers"].split(","),
  // ssl: config["security.protocol"] === "SASL_SSL",
  // sasl: {
  //   mechanism: config["sasl.mechanisms"].toLowerCase(), // 'plain', 'scram-sha-256', or 'scram-sha-512'
  //   username: config["sasl.username"],
  //   password: config["sasl.password"],
  // },
});

const customPartitioner = ({ topic, partitionMetadata, message }) => {
  const numPartitions = partitionMetadata.length;

  const hash = createHash("sha256")
    .update(message.key.toString())
    .digest("hex");
  const hashInt = parseInt(hash, 16);
  const partition = hashInt % numPartitions;

  logger.info(
    `"Partition no ::: ${partition}, number of partitions ${numPartitions}, message ${message.key} "`
  );
  return partition;
};

// Create a Kafka producer
const producer = kafka.producer({ createPartitioner: () => customPartitioner });

const runProducer = async () => {
  try {
    await producer.connect();
    console.log("Producer connected");
  } catch (err) {
    console.error("Error connecting producer:", err);
  }
};

runProducer();

export async function publishKafkaMessage(topic, event) {
  try {
    logger.info(
      `Sending message to topic: ${topic}, event: ${JSON.stringify(event)}`
    );

    // Ensure producer is connected once, when the application starts
    // const headers = [{ key: "timestamp", value: Date.now().toString() }];

    await producer.send({
      topic: topic,
      messages: [
        {
          key: event.key.toString(),
          value: JSON.stringify(event.message),
          // headers: headers,
        },
      ],
    });

    logger.info("Message sent successfully to Kafka");
  } catch (err) {
    logger.error("Failed to send message to Kafka", {
      error: err.message,
      stack: err.stack,
    });
    throw err; // Re-throw the error if you need to handle it in the calling function
  }
}
