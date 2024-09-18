import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import draftRoutes from './routes/draftRoutes';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://nfl-fantasy-draft-assistant-fs2jq1ag7-melihonats-projects.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API routes
app.use('/api/draft', draftRoutes);

// Serve static files from the React app
const buildPath = path.join(__dirname, '../client/build');
app.use(express.static(buildPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// https://sportsdata.io/fantasy-data TODO