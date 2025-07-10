import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhook } from './controllers/webhooks.js';
const app = express();
//Middlewares
app.use(cors())
app.use(express.json())
await connectDB();
app.get('/',(req,res)=>{
    res.send("WELCOME TO LMS BACKENED")
})
app.post('/clerk',express.json(),clerkWebhook)
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})