import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
import Joi from 'joi';

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


const pessoas = [];

const dataSchema = Joi.object({
    name: Joi.string().required()
})

app.get("/pessoa", (req, res) => {
    const pessoa = JSON.stringify(pessoas);
    res.send(pessoa);
})

app.get("/lista-pessoas", (req, res) => {
    const pessoas = [{ nome: "João", idade: 30 }, { nome: "Maria", idade: 20 }];
    res.send(pessoas);
})



app.post("/participants", async (req, res) => {
    const { name } = req.body;
    const { error } = dataSchema.validate({ name })


    if (error) {
        const errorMessage = error.details.map((err) => err.message);
        return res.status(422).json({ error: errorMessage });
    }


    try {
        const userExists = await db.collection("dbUol").findOne({ name })

        if (userExists) {
            return res.sendStatus(409)
        }
        await db.collection("dbUol").insertOne({ name })
    } catch (error) {

    }
    pessoas.push(name);
    res.send(pessoas);
});



app.listen(5000, () => console.log("Running server on port 5000"));


console.log('servidor ligado')

