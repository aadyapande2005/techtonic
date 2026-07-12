import dotenv from 'dotenv';
dotenv.config();

import express, { json } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cookieParser())


import authroutes from './routes/auth.route.js';
import postroutes from './routes/post.route.js';
import userroutes from './routes/user.route.js';

app.use('/auth', authroutes);
app.use('/post', postroutes);
app.use('/user', userroutes);

// Serve static files from frontend build
// app.use(express.static(path.join(__dirname, "../frontend/social_media_app/dist")));

// SPA catch-all route - serve index.html for all unmatched routes
// app.get(/\/.*/, (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../frontend/social_media_app/dist/index.html"));
// });


