import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhook, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoutes.js'
import bodyParser from 'body-parser';
import certificateRoutes from './routes/certificateRoutes.js';
import path from 'path';

const app = express();

// Connect DB
await connectDB();
await connectCloudinary();

// Middlewares
const allowedOrigins = ['https://lms-portal-frontend-ten.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed from this origin: ' + origin), false);
  },
  credentials: true,
}));
app.use(clerkMiddleware())
app.use(bodyParser.json());
app.use('/certificates', express.static(path.join('./certificates')));

// ✅ Important: register raw body parser ONLY for webhook
app.get('/', (req, res) => {
    res.send("WELCOME TO LMS BACKEND");
});
app.post('/clerk', express.json(), clerkWebhook);

app.use('/api/educator',express.json(),educatorRouter)
app.use('/api/course',express.json(),courseRouter)
app.use('/api/user',express.json(),userRouter)
app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks)
app.use('/api/certificates', certificateRoutes)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
