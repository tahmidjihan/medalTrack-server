require('dotenv').config();
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = 3000;

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: 'https://medal-track.web.app',
    credentials: true,
  })
);
app.use(express.json());

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send('Invalid or expired token');
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tfnar.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
      if (queries.sort) {
        const result = await usersCollection
          .find({})
          .sort({ [queries.sort]: -1 })
          .toArray();
        res.send(result);
        return;
      }
      console.log(req.query);

      const result = await usersCollection.find({}).toArray();
      res.send(result);
    });
    app.post('/api/marathons', verifyToken, async (req, res) => {
      const marathons = req.body;
      const usersCollection = client.db('Medal-Track').collection('marathons');
      const result = await usersCollection.insertOne(marathons);
      res.send(result);
    });
    app.patch('/api/marathons/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const marathons = req.body;
      const usersCollection = client.db('Medal-Track').collection('marathons');
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: marathons }
      );
      res.send(result);
    });
    app.delete('/api/marathons/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const usersCollection = client.db('Medal-Track').collection('marathons');
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    app.post('/api/applications', verifyToken, async (req, res) => {
      const applications = req.body;
      const usersCollection = client
        .db('Medal-Track')
        .collection('applications');
      const result = await usersCollection.insertOne(applications);
      res.send(result);
    });
    app.get('/api/applications', async (req, res) => {
      const queries = req.query;
      const usersCollection = client
        .db('Medal-Track')
        .collection('applications');

      if (queries.email && queries.search) {
        const result = await usersCollection
          .find({
            $and: [
              { user_email: queries.email },
              { marathon_title: { $regex: queries.search, $options: 'i' } },
            ],
          })
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
          .find({ user_email: queries.email })
          .toArray();
        res.send(result);
        return;
      }
      const result = await usersCollection.find({}).toArray();
      res.send(result);
    });
    app.patch('/api/applications/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const applications = req.body;
      const usersCollection = client
        .db('Medal-Track')
        .collection('applications');
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: applications }
      );
      res.send(result);
    });
    app.delete('/api/applications/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const usersCollection = client
        .db('Medal-Track')
        .collection('applications');
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });
      res
        .cookie('token', token, { httpOnly: true, secure: false })
        .send({ status: true });
    });
    app.post('/logout', async (req, res) => {
      res.clearCookie('token').send({ status: true });
    });

    // Connect the client to the server
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
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
