const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Collabo is running.");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clusterbase.o3yqpur.mongodb.net/?retryWrites=true&w=majority&appName=Clusterbase`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const docCollection = client.db("CollaboDB").collection("assignment");
    const submitCollection = client.db("CollaboDB").collection("answers");

    // create assignments
    app.post("/data", async (req, res) => {
      const createData = req.body;
      console.log(createData);
      const result = await docCollection.insertOne(createData);
      res.send(result);
    });

    // view assignments
    app.get("/data", async (req, res) => {
      const result = await docCollection.find().toArray();
      res.send(result);
    });

    // view detail assignment

    app.get("/data/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await docCollection.findOne(query);
      res.send(result);
    });

    // submit assignments
    app.post("/answers", async (req, res) => {
      const submitData = req.body;
      const result = await submitCollection.insertOne(submitData);
      res.send(result);
    });

    // view submit assignments
    app.get("/answers", async (req, res) => {
      const result = await submitCollection.find().toArray();
      res.send(result);
    });

    // view grade detail assignment
    app.get("/answers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await submitCollection.findOne(query);
      res.send(result);
    });

    // view graded
    app.patch("/answers/:id", async (req, res) => {
      const id = req.params.id;
      const gradeData = req.body;
      const query = { _id: new ObjectId(id) };
      const update = { $set: gradeData };
      const result = await submitCollection.updateOne(query, update);
      res.send(result);
    });

    // update button
    app.put("/data/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateData = req.body;
      const uData = {
        $set: {
          title: updateData.title,
          level: updateData.level,
          dueDate: updateData.dueDate,
          totalMarks: updateData.totalMarks,
          thumbnailURL: updateData.thumbnailURL,
          description: updateData.description,
        },
      };
      const result = await docCollection.updateOne(filter, uData, options);
      res.send(result);
    });

    // delete button
    app.delete("/data/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await docCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Collabo port: ${port}`);
});
