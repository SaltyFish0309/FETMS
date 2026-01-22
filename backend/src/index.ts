import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import teacherRoutes from './routes/teachers.js';

import stageRoutes from './routes/stages.js';
import importRoutes from './routes/importRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import alertRoutes from './routes/alertRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/teachers', teacherRoutes);

app.use('/api/stages', stageRoutes);
app.use('/api/teachers', importRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/uploads', express.static('uploads'));

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Something went wrong!' });
});

// Basic route
app.get('/', (req, res) => {
    res.send('FETMS Backend Running');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fetms')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
