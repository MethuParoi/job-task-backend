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

  return router;
};
