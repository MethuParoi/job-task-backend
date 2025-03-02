const express = require("express");
const { ObjectId } = require("mongodb");
// const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

module.exports = (db) => {
  const userCollection = db.collection("userCollection");

  // Add user
  router.post("/add-user-data", async (req, res) => {
    try {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to add user" });
    }
  });

  //add google auth user data
  router.post("/add-google-user-data", async (req, res) => {
    try {
      const user = req.body;

      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        return res.send({ success: true });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to add user" });
    }
  });

  //get all users
  router.get("/get-all-users", async (req, res) => {
    try {
      const users = await userCollection.find({}).toArray();
      res.send(users);
    } catch (error) {
      res.status(500).send({ error: "Failed to get users" });
    }
  });

  //get single user by email
  router.get("/get-user/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const query = { email: email };

      const user = await userCollection.findOne(query);

      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      res.send(user);
    } catch (error) {
      res.status(500).send({ error: "Failed to get user" });
    }
  });

  //-------------------post link----------------
  // router.post("/post-link/:email", async (req, res) => {
  //   try {
  //     const email = req.params.email;
  //     const query = { email: email };
  //     const user = await userCollection.findOne(query);
  //     const newLink = Array.isArray(req.body.link)
  //       ? req.body.link
  //       : [req.body.link];
  //     const update = {
  //       $set: {
  //         link: user && user.link ? [...user.link, ...newLink] : newLink,
  //       },
  //     };
  //     const result = await userCollection.updateOne(query, update, {
  //       upsert: true,
  //     });
  //     res.send(result);
  //   } catch (error) {
  //     res.status(500).send({ error: "Failed to update link" });
  //   }
  // });
  router.post("/post-link/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);

      const newLink = Array.isArray(req.body.link)
        ? req.body.link
        : [req.body.link];

      const update = {
        $set: {
          link: user && user.link ? [...user.link, ...newLink] : newLink,
        },
      };

      const result = await userCollection.updateOne(query, update, {
        upsert: true,
      });

      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to update link" });
    }
  });

  //------------------get link-------------------
  router.get("/get-link/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      if (!user.link) {
        return res.status(404).send({ error: "Link not found" });
      }
      res.status(200).send(user.link);
    } catch (error) {
      res.status(500).send({ error: "Failed to get link" });
    }
  });

  // Delete link
  router.delete("/delete-link/:email/:linkId", async (req, res) => {
    try {
      const { email, linkId } = req.params; // Extract email and linkId from params
      //convert task id to number
      const linkIdNum = Number(linkId);

      // Find the user by email
      const query = { email };
      const user = await userCollection.findOne(query);

      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      // Filter out the link with the given taskId
      const updatedLinks = user.link.filter(
        (link) => link.linkId !== linkIdNum
      );

      if (updatedLinks.length === user.link.length) {
        return res.status(404).send({ error: "link not found" });
      }

      // Update the user's link array in the database
      const update = { $set: { link: updatedLinks } };
      const result = await userCollection.updateOne(query, update);

      if (result.modifiedCount === 0) {
        return res.status(400).send({ error: "Failed to delete link" });
      }

      res.send({ message: "link deleted successfully" });
    } catch (error) {
      res.status(500).send({ error: "Internal server error" });
    }
  });

  //-------------------------------------

  //get single task by task id
  router.get("/get-task/:email/:taskId", async (req, res) => {
    try {
      const { email, taskId } = req.params;
      const taskIdNum = Number(taskId);
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      const task = user.task.find((task) => task.taskId === taskIdNum);
      if (!task) {
        return res.status(404).send({ error: "Task not found" });
      }
      res.send(task);
    } catch (error) {
      res.status(500).send({ error: "Failed to get task" });
    }
  });

  // Edit task
  router.patch("/edit-task/:email/:taskId", async (req, res) => {
    try {
      const { email, taskId } = req.params; // Extract email and taskId from params
      const updatedTaskData = req.body; // Get updated task data from the request body

      // Convert taskId to number since it's stored as a number in the database
      const taskIdNum = Number(taskId);

      // Find the user with the given email
      const query = { email };
      const user = await userCollection.findOne(query);

      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      // Update the specific task in the task array
      const updatedTasks = user.task.map((task) => {
        if (task.taskId === taskIdNum) {
          // Ensure type matches
          return { ...task, ...updatedTaskData }; // Merge updated task data
        }
        return task;
      });

      // Update the user document in the database
      const update = { $set: { task: updatedTasks } };
      const result = await userCollection.updateOne(query, update);

      if (result.modifiedCount === 0) {
        return res.status(400).send({ error: "Failed to update task" });
      }

      res.send({ message: "Task updated successfully" });
    } catch (error) {
      res.status(500).send({ error: "Internal server error" });
    }
  });

  return router;
};
