const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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

// middleware
const logger = (req, res, next) => {
  next();
};

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );

    const docCollection = client.db("CollaboDB").collection("assignment");
    const submitCollection = client.db("CollaboDB").collection("answers");

    // auth related api
    app.post("/jwt", logger, async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    // Logout
    app.post("/logout", async (req, res) => {
      const user = req.body;
      res
        .clearCookie("token", { maxAge: 0, sameSite: "none", secure: true })
        .send({ success: true });
    });

    // create assignments
    app.post("/data", async (req, res) => {
      const createData = req.body;
      const result = await docCollection.insertOne(createData);
      res.send(result);
    });

    // view assignments
    app.get("/data", logger, verifyToken, async (req, res) => {
      const result = await docCollection.find().toArray();
      res.send(result);
    });

    // view detail assignment
    app.get("/data/:id", logger, async (req, res) => {
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
    app.get("/answers", logger, verifyToken, async (req, res) => {
      const result = await submitCollection.find().toArray();
      res.send(result);
    });

    // view grade detail assignment
    app.get("/answers/:id", logger, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await submitCollection.findOne(query);
      res.send(result);
    });

    // view graded
    app.patch("/answers/:id", logger, async (req, res) => {
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
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Collabo port: ${port}`);
});
