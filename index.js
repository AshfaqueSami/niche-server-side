const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.txbuo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Arial-watch");
    const watchesCollection = database.collection("watches");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");

    // get watches
    app.get("/watches", async (req, res) => {
      const cursor = watchesCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // get reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // get orders
    app.get("/allorders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // get orders of an user
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    // admin check
    app.get("/allusers", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const filter = await usersCollection.findOne(query);
      let isAdmin = false;
      if (filter?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // save user data
    app.post("/users", async (req, res) => {
      const newUser = {
        email: req.body.email,
        displayName: req.body.displayName,
      };
      const result = await usersCollection.insertOne(newUser);
      res.json(result);
    });

    // post order
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    // post review
    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      const result = await reviewsCollection.insertOne(newReview);
      res.json(result);
    });

    // post product
    app.post("/watches", async (req, res) => {
      const order = req.body;
      const result = await watchesCollection.insertOne(order);
      res.json(result);
    });

    // deleting order data
    app.delete("/orders", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    //   delete watch data
    app.delete("/watches", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const result = await watchesCollection.deleteOne(query);
      res.json(result);
    });

    // update to make admin
    app.put("/allusers", async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // status update using put
    app.put("/orders", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const updateStatus = {
        $set: {
          status: "shipped",
        },
      };
      const result = await ordersCollection.updateOne(query, updateStatus);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running arial-watch-website server");
});
app.listen(port, () => {
  console.log("listening to", port);
});
