import School from '../models/School.js';
import Teacher from '../models/Teacher.js';
import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';

export class SchoolService {

    static async getAllSchools(search?: string) {
        const query: Record<string, unknown> = { isDeleted: false };

        if (search) {
            query.$or = [
                { 'name.chinese': { $regex: search, $options: 'i' } },
                { 'name.english': { $regex: search, $options: 'i' } }
            ];
        }

        return await School.find(query).sort({ 'name.chinese': 1 });
    }

    static async getSchoolById(id: string) {
        const school = await School.findOne({ _id: id, isDeleted: false });
        if (!school) return null;

        const teachers = await Teacher.find({
            isDeleted: false,
            school: id as unknown as typeof Teacher.prototype.school
        });

        return { ...school.toObject(), employedTeachers: teachers };
    }

    static async createSchool(data: Record<string, unknown>) {
        const school = new School(data);
        return await school.save();
    }

    static async updateSchool(id: string, data: Record<string, unknown>) {
        return await School.findOneAndUpdate(
            { _id: id, isDeleted: false },
            data,
            { new: true }
        );
    }

    static async deleteSchool(id: string) {
        const school = await School.findOne({ _id: id, isDeleted: false });
        if (!school) return false;

        school.isDeleted = true;
        await school.save();
        return true;
    }

    // Import Logic
    static async importSchools(filePath: string): Promise<{ count: number, total: number }> {
        const results: Record<string, unknown>[] = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv({
                    mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, '')
                }))
                .on('data', (data: Record<string, string>) => {
                    const cleanedRaw: Record<string, string> = {};
                    Object.keys(data).forEach(key => {
                        const val = data[key];
                        if (val && val !== '') {
                            cleanedRaw[key] = val;
                        }
                    });
                    results.push(this.unflatten(cleanedRaw));
                })
                .on('end', async () => {
                    try {
                        const result = await School.insertMany(results, { ordered: false, throwOnValidationError: true });
                        // Clean up is handled by caller or here? 
                        // Usually service shouldn't delete file if it didn't create it, but for temp uploads it's fine.
                        // Let's rely on caller/controller to cleanup to keep Service pure-ish or handle it here if it's "Import Process".
                        // Logic in original route: cleanup happened in callback.
                        resolve({
                            count: result.length,
                            total: results.length
                        });
                    } catch (error) {
                        reject(error);
                    }
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static unflatten(data: Record<string, string>): Record<string, any> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: Record<string, any> = {};
        for (const i in data) {
            const keys = i.split('.');
            keys.reduce((acc, value, index) => {
                if (index === keys.length - 1) {
                    acc[value] = data[i];
                } else {
                    acc[value] = acc[value] || {};
                }
                return acc[value];
            }, result);
        }
        return result;
    }
}
