const { Kafka, logLevel } = require("kafkajs");

//----------------------------------------------Producer-------------------------------------------

//----------------------------------------------Consumer-------------------------------------------
// This creates a client instance that is configured to connect to the Kafka broker provided by
// the environment variable KAFKA_BOOTSTRAP_SERVER
const host = "localhost";

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`${host}:9092`],
  //clientId: "example-consumer",
});

const topic = "numtest";
const consumer = kafka.consumer({ groupId: "my-group" });

//Consuming;
const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic });
  await consumer.run({
    eachBatch: async ({ batch }) => {
      console.log(batch);
    },
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`- ${prefix} ${message.key}#${message.value}`);
    },
  });
};

run().catch(console.error);
