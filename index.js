require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const port = 3000;

//

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tfnar.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    app.get('/api/marathons', async (req, res) => {
      const queries = req.query;
      // console.log(queries);
      const usersCollection = client.db('Medal-Track').collection('marathons');
      if (queries.size) {
        const result = await usersCollection
          .find({})
          .limit(parseInt(queries.size))
          .toArray();
        res.send(result);
        return;
      }
      if (queries.id) {
        const result = await usersCollection
          .find({ _id: new ObjectId(queries.id) })
          .toArray();
        res.send(result);
        return;
      }
      if (queries.email) {
        const result = await usersCollection
          .find({ created_by: queries.email })
          .toArray();
        res.send(result);
        return;
      }

      const result = await usersCollection.find({}).toArray();
      res.send(result);
    });
    app.post('/api/marathons', async (req, res) => {
      const marathons = req.body;
      const usersCollection = client.db('Medal-Track').collection('marathons');
      const result = await usersCollection.insertOne(marathons);
      res.send(result);
    });
    app.patch('/api/marathons/:id', async (req, res) => {
      const id = req.params.id;
      const marathons = req.body;
      const usersCollection = client.db('Medal-Track').collection('marathons');
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: marathons }
      );
      res.send(result);
    });
    app.delete('/api/marathons/:id', async (req, res) => {
      const id = req.params.id;
      const usersCollection = client.db('Medal-Track').collection('marathons');
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    app.post('/api/applications', async (req, res) => {
      const applications = req.body;
      const usersCollection = client
        .db('Medal-Track')
        .collection('applications');
      const result = await usersCollection.insertOne(applications);
      res.send(result);
    });
    app.get('/api/applications', async (req, res) => {
      const queries = req.query;
      // console.log(queries);
      const usersCollection = client
        .db('Medal-Track')
        .collection('applications');

      if (queries.id) {
        const result = await usersCollection
          .find({ _id: new ObjectId(queries.id) })
          .toArray();
        res.send(result);
        return;
      }
      if (queries.email) {
        const result = await usersCollection
          .find({ user_email: queries.email })
          .toArray();
        res.send(result);
        return;
      }
      const result = await usersCollection.find({}).toArray();
      res.send(result);
    });
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
