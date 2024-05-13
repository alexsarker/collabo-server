const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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

    // create assignments
    app.post("/create", async (req, res) => {
      const createData = req.body;
      console.log(createData);
      const result = await docCollection.insertOne(createData);
      res.send(result);
    });

    // view assignments
    app.get("/create", async (req, res) => {
      const result = await docCollection.find().toArray();
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
