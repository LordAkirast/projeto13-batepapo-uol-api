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


// Todas as rotas que forem criadas daqui para baixo poderão ser
// acessadas através de um front-end


///conectar com banco de dados
let db
const Mongoclient = new MongoClient(process.env.DATABASE_URL)
Mongoclient.connect()
    .then(() => db = Mongoclient.db())
    .catch((err) => console.log(err.message))

const dataSchema = Joi.object({
    name: Joi.string().required()
})

app.get("/participants", async (req, res) => {
    try {
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

    }
    users.push(name);
    res.send(users);
});


app.post("/messages", async (req,res) => {
    const { name } = req.body;
    const { error } = dataSchema.validate({ name })

    if (error) {
        const errorMessage = error.details.map((err) => err.message);
        return res.status(422).json({ error: errorMessage });
    }
    res.send(users);


    await db.collection('messages').insertOne({
        from: req.body.name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: now.format('HH:mm:ss'),
    });
})


app.listen(5000, () => console.log("Running server on port 5000"));


console.log('servidor ligado')

