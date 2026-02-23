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
import projectRoutes from './routes/projects.js';
import emailTemplateRoutes from './routes/emailTemplateRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import schedule from 'node-schedule';
import { AlertEmailService } from './services/AlertEmailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/teachers', teacherRoutes);

app.use('/api/stages', stageRoutes);
app.use('/api/teachers', importRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/emails', emailRoutes);
app.use('/uploads', express.static('uploads'));

// Global Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Something went wrong!' });
});

// Basic route
app.get('/', (req, res) => {
    res.send('FETMS Backend Running');
});

// Scheduled alert emails (runs daily at 8:00 AM)
if (process.env.NODE_ENV !== 'test') {
  schedule.scheduleJob('0 8 * * *', async () => {
    await AlertEmailService.runScheduledAlerts();
  });
}

// MongoDB Connection
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fetms')
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.error('MongoDB Connection Error:', err));

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
