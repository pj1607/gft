import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/conn.js';
import memberRoutes from './routes/memberRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());


connectDB();

const allowedOrigins = [
  'http://localhost:5173',
  'https://gym-fee-tracker.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));



// Routes
app.use('/members', memberRoutes);
app.use('/auth', userRoutes); 

app.get('/', (req, res) => {
    res.send("MongoDB connection is working!");
});

const PORT =  process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
