import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import draftRoutes from './routes/draftRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Add this line to connect the routes
app.use('/api/draft', draftRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// https://sportsdata.io/fantasy-data TODO