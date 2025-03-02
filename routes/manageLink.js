const express = require("express");
const { ObjectId } = require("mongodb");
// const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

module.exports = (db) => {
  const linkCollection = db.collection("linkCollection");

  // Add link
  router.post("/add-link", async (req, res) => {
    try {
      const newLink = req.body;
      const result = await linkCollection.insertOne(newLink);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to add link" });
    }
  });

  //get all links
  router.get("/get-all-link", async (req, res) => {
    try {
      const links = await linkCollection.find().toArray();
      res.send(links);
    } catch (error) {
      res.status(500).send({ error: "Failed to get links" });
    }
  });

  //get public links
  router.get("/get-public-link", async (req, res) => {
    try {
      const links = await linkCollection
        .find({
          privacy: "public",
        })
        .toArray();
      res.send(links);
    } catch (error) {
      res.status(500).send({ error: "Failed to get links" });
    }
  });

  return router;
};
