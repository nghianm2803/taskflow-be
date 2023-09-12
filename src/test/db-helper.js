const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo;

// Create an async function to start the in-memory server
const startMongoMemoryServer = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  return uri;
};

const connect = async () => {
  const uri = await startMongoMemoryServer();
  await mongoose.connect(uri);
};

const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  // Stop the in-memory server, which will also clean up data
  if (mongo) {
    await mongo.stop();
  }
};

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

module.exports = { connect, closeDatabase, clearDatabase };

