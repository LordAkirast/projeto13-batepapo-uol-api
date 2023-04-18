import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
import Joi from 'joi';
import dayjs from 'dayjs';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json())


///conectar com banco de dados
let db
const Mongoclient = new MongoClient(process.env.DATABASE_URL)
Mongoclient.connect()
    .then(() => db = Mongoclient.db())
    .catch((err) => console.log(err.message))


///schemas
const dataSchema = Joi.object({
    name: Joi.string().required()
})

const messageSchema = Joi.object({

    to: Joi.string().required(),
    text: Joi.string().required(),
    type: Joi.string().valid("message", "private_message").required(),

})

app.get("/participants", async (req, res) => {
    try {
        ///essa parte vai la no banco e procura la se tem ou não para dar o erro abaixo se ja tiver
        const participants = await db.collection("participants").find().toArray();
        res.json(participants);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});


app.post("/participants", async (req, res) => {
    const { name } = req.body;
    const { error } = dataSchema.validate({ name })

    if (error) {
        const errorMessage = error.details.map((err) => err.message);
        return res.status(422).json({ error: errorMessage });
    }

    try {
        const userExists = await db.collection("participants").findOne({ name })

        if (userExists) {
            return res.sendStatus(409)
        }
        await db.collection("participants").insertOne({ name: req.body.name, lastStatus: Date.now() });
        return res.sendStatus(201)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});


app.post("/messages", async (req, res) => {
    const { to, text, type } = req.body;
    const { error } = messageSchema.validate({ to, text, type });

    if (error) {
        return res.status(422).json({ error: error.details.map((err) => err.message) });
    }

    const name = req.header("User");

    const participantExists = await db.collection("participants").findOne({ name });
    if (!participantExists) {
        return res.status(422).json({ error: "Participant not found" });
    }

    const now = dayjs();
    const message = {
        from: name,
        to,
        text,
        type,
        time: now.format("HH:mm:ss"),
    };

    try {
        await db.collection("messages").insertOne(message);
        return res.sendStatus(201);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

app.get('/messages', async (req, res) => {
    try {
      const user = req.header('User');
      let limit = parseInt(req.query.limit);
  
      if (isNaN(limit) || limit <= 0) {
        return res.status(422).send('Invalid limit parameter');
      }
  
      const messages = await Message.find({
        $or: [
          { to: user },
          { from: user },
          { to: 'Todos' },
          { to: { $exists: false } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limit);
  
      res.send(messages);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  


app.listen(5000, () => console.log("Servidor ligado na porta 5000"));


console.log('servidor ligado')
