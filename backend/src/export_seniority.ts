
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Teacher from './models/Teacher.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const exportSeniority = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        const teachers = await Teacher.find({}).select('contractDetails.salary firstName lastName');

        console.log(`Found ${teachers.length} teachers.`);

        let markdown = '# Seniority (Salary) Data Export\n\n';
        markdown += '| Name | Salary |\n';
        markdown += '|---|---|\n';

        const salaryValues: number[] = [];

        teachers.forEach(t => {
            const salary = t.contractDetails?.salary;
            if (salary) {
                markdown += `| ${t.firstName} ${t.lastName} | ${salary.toLocaleString()} |\n`;
                salaryValues.push(salary);
            } else {
                markdown += `| ${t.firstName} ${t.lastName} | N/A |\n`;
            }
        });

        markdown += '\n## Summary Stats\n';
        if (salaryValues.length > 0) {
            const min = Math.min(...salaryValues);
            const max = Math.max(...salaryValues);
            const avg = salaryValues.reduce((a, b) => a + b, 0) / salaryValues.length;
            markdown += `- **Count**: ${salaryValues.length}\n`;
            markdown += `- **Min**: ${min.toLocaleString()}\n`;
            markdown += `- **Max**: ${max.toLocaleString()}\n`;
            markdown += `- **Average**: ${Math.round(avg).toLocaleString()}\n`;
        }

        const outputPath = 'e:\\Coding_things\\tfetp-management-v3\\SENIORITY_DATA.md';
        fs.writeFileSync(outputPath, markdown);
        console.log(`Exported to ${outputPath}`);

    } catch (error) {
        console.error('Export failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

exportSeniority();
