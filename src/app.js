import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";


const app = express();
app.use(cors());
dotenv.config();
 
// Todas as rotas que forem criadas daqui para baixo poderão ser
// acessadas através de um front-end


///conectar com banco de dados
let db
const Mongoclient = new MongoClient(process.env.DATABASE_URL)
Mongoclient.connect()
.then(() => db = Mongoclient.db())
.catch((err) => console.log(err.message))


app.get("/pessoa", (req, res) => {
    const pessoa = JSON.stringify(pessoas);
    res.send(pessoa);
})

app.get("/lista-pessoas", (req, res) => {
    const pessoas = [{nome: "João", idade: 30},{nome: "Maria", idade: 20}];
    res.send(pessoas);
})

const pessoas = [];

app.post("/pessoa", (req, res) => {
    const pessoa = req.body;
    pessoas.push(pessoa);
    res.send(pessoas);
  });
  


app.listen(5000, () => console.log("Running server on port 5000"));


console.log('servidor ligado')

