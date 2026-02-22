import express from "express";
import cors from 'cors'
import infRouter from '../src/routes/info.routes.js'
const app = express();


app.use(express.json());
app.use(cors());

app.use('/api',infRouter)


export default app