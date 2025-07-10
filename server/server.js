import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhook } from './controllers/webhooks.js';

const app = express();

// Connect DB
await connectDB();

// Middlewares
app.use(cors());

// ✅ Important: register raw body parser ONLY for webhook
app.post('/clerk', express.json(), clerkWebhook);

app.get('/', (req, res) => {
    res.send("WELCOME TO LMS BACKEND");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
