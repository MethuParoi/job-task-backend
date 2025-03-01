require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@share-link.ny5gm.mongodb.net/?retryWrites=true&w=majority&appName=share-link`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDatabase() {
  if (!client.isConnected) {
    await client.connect();
    console.log("Connected to MongoDB");
  }
  return client;
}

module.exports = connectToDatabase;
