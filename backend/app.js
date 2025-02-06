import dotenv from 'dotenv'; // Import dotenv to load environment variables
dotenv.config();  // Load the .env file

// Log to check if the MONGO_URI is being loaded correctly
console.log('MONGO_URI:', process.env.MONGO_URI); // This will print the Mongo URI

import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';  // Import the connect function to connect to MongoDB
import userRoutes from './routes/user.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import projectRoutes from './routes/project.route.js';

import aiRoutes from './routes/ai.route.js';
connect();  // Call connect function to establish MongoDB connection

const app = express();
app.use(cors());
app.use(morgan('dev')); // Morgan for logging HTTP requests
app.use(express.json());  // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // Middleware to parse URL-encoded bodies
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
  // Route for user-related operations
app.use(cookieParser());
app.use('/ai',aiRoutes);

app.get('/', (req, res) => {
    res.send('Hey Mustang!');
});

export default app;
