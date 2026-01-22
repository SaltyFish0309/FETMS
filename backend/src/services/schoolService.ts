import School from '../models/School.js';
import Teacher from '../models/Teacher.js';
import fs from 'fs';
import csv from 'csv-parser';

export class SchoolService {

    static async getAllSchools(search?: string) {
        let query: any = { isDeleted: false };

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
            school: id
        });

        return { ...school.toObject(), employedTeachers: teachers };
    }

    static async createSchool(data: any) {
        const school = new School(data);
        return await school.save();
    }

    static async updateSchool(id: string, data: any) {
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
        const results: any[] = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv({
                    mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, '')
                }))
                .on('data', (data) => {
                    const cleanedRaw: any = {};
                    Object.keys(data).forEach(key => {
                        if (data[key] !== '') {
                            cleanedRaw[key] = data[key];
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

    private static unflatten(data: any) {
        const result: any = {};
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
