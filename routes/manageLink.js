const express = require("express");
const { ObjectId } = require("mongodb");
// const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

module.exports = (db) => {
  const linkCollection = db.collection("linkCollection");

  // Cleanup expired links every 10 minutes
  async function deleteExpiredLinks() {
    try {
      const now = new Date();
      const result = await linkCollection.deleteMany({
        expiresAt: { $lt: now },
      });

      if (result.deletedCount > 0) {
        console.log(`Deleted ${result.deletedCount} expired links`);
      }
    } catch (error) {
      console.error("Error deleting expired links:", error);
    }
  }

  setInterval(deleteExpiredLinks, 10 * 60 * 1000);

  // Add link
  //   router.post("/add-link", async (req, res) => {
  //     try {
  //       const newLink = req.body;
  //       const result = await linkCollection.insertOne(newLink);
  //       res.send(result);
  //     } catch (error) {
  //       res.status(500).send({ error: "Failed to add link" });
  //     }
  //   });
  router.post("/add-link", async (req, res) => {
    try {
      const { privacy, fileLink, fileName, user, linkId, expiresAt } = req.body;

      const newLink = {
        privacy,
        fileLink,
        fileName,
        user,
        linkId,
        createdAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      };

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

  //delete link
  router.delete("/delete-link/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const linkIdNum = Number(id);
      const query = { linkId: linkIdNum };

      const result = await linkCollection.deleteOne(query);

      if (result.deletedCount === 0) {
        return res.status(404).send({ error: "Link not found" });
      }
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to delete link" });
    }
  });

  return router;
};
