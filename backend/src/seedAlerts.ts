import mongoose from 'mongoose';
import AlertRule from './models/AlertRule.js';
import dotenv from 'dotenv';

dotenv.config();

const seedRules = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fetms');

        await AlertRule.deleteMany({}); // clear existing

        const defaultRules = [
            { name: "ARC Expiring (90 days)", documentType: "arcDetails", conditionType: "DAYS_REMAINING", value: 90 },
            { name: "Work Permit Expiring (90 days)", documentType: "workPermitDetails", conditionType: "DAYS_REMAINING", value: 90 },
            { name: "Passport Expiring (90 days)", documentType: "passportDetails", conditionType: "DAYS_REMAINING", value: 90 },

            // Example of Date Threshold for user request demo
            { name: "End of Year Check", documentType: "arcDetails", conditionType: "DATE_THRESHOLD", value: new Date('2025-12-31') }
        ];

        await AlertRule.insertMany(defaultRules);
        console.log("Default rules seeded");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedRules();
