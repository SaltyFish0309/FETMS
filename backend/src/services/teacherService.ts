import Teacher, { ITeacher, IAdHocDoc } from '../models/Teacher.js';
import School from '../models/School.js';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { Types } from 'mongoose';

// Helper for file deletion
const deleteFile = (filePath: string) => {
    if (!filePath) return;
    const absolutePath = path.resolve(filePath);
    fs.unlink(absolutePath, (err) => {
        if (err) console.error(`Failed to delete file: ${filePath}`, err);
    });
};

export class TeacherService {

    static async createTeacher(data: Partial<ITeacher>): Promise<ITeacher> {
        // Strict Mode: Resolve School ID if only string name provided (e.g. from Excel)
        if (!data.school && data.personalInfo?.serviceSchool) {
            const schoolName = data.personalInfo.serviceSchool;
            const school = await School.findOne({
                $or: [{ 'name.chinese': schoolName }, { 'name.english': schoolName }]
            });
            if (school) {
                data.school = school._id as any;
            }
        }
        const teacher = new Teacher(data);
        return await teacher.save();
    }

    static async getAllTeachers(): Promise<ITeacher[]> {
        return await Teacher.find({ isDeleted: false })
            .populate('school')
            .sort({ createdAt: -1 });
    }

    static async getTeacherById(id: string): Promise<ITeacher | null> {
        return await Teacher.findOne({ _id: id, isDeleted: false });
    }

    static async updateTeacher(id: string, data: Partial<ITeacher>): Promise<ITeacher | null> {
        return await Teacher.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
    }

    static async deleteTeacher(id: string): Promise<boolean> {
        const teacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (!teacher) return false;

        // Soft Delete
        teacher.isDeleted = true;
        await teacher.save();

        // We do NOT delete files in soft delete as per best practices for recovery, 
        // but strict requirement might vary. For now, soft delete implies data preservation.
        // If hard delete was requested, we would call deleteFile here.

        return true;
    }

    static async uploadAvatar(id: string, file: Express.Multer.File): Promise<ITeacher | null> {
        const teacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (!teacher) return null;

        if (teacher.profilePicture) {
            deleteFile(teacher.profilePicture);
        }

        teacher.profilePicture = `uploads/${file.filename}`;
        return await teacher.save();
    }

    static async deleteAvatar(id: string): Promise<ITeacher | null> {
        const teacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (!teacher) return null;

        if (teacher.profilePicture) {
            deleteFile(teacher.profilePicture);
            teacher.profilePicture = undefined;
            return await teacher.save();
        }
        return teacher;
    }

    static async uploadAdHocDocument(id: string, name: string, file: Express.Multer.File): Promise<ITeacher | null> {
        const newDoc: Partial<IAdHocDoc> = {
            name,
            filePath: `uploads/${file.filename}`,
            uploadDate: new Date()
        };

        return await Teacher.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $push: { otherDocuments: newDoc } },
            { new: true }
        );
    }

    static async uploadCoreDocument(id: string, type: string, file: Express.Multer.File | undefined, data: any): Promise<ITeacher | null> {
        const updateData: any = {
            [`documents.${type}.status`]: 'valid',
            [`documents.${type}.filePath`]: file ? `uploads/${file.filename}` : undefined
        };

        const currentTeacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (currentTeacher) {
            const oldDoc = currentTeacher.documents?.[type as keyof typeof currentTeacher.documents];
            if (oldDoc && oldDoc.filePath && file) {
                deleteFile(oldDoc.filePath);
            }
        }

        if (data.number) updateData[`documents.${type}.number`] = data.number;
        if (data.expiryDate) updateData[`documents.${type}.expiryDate`] = data.expiryDate;

        return await Teacher.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $set: updateData },
            { new: true }
        );
    }

    static async deleteCoreDocument(id: string, type: string): Promise<ITeacher | null> {
        const teacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (!teacher) return null;

        const doc = teacher.documents[type as keyof typeof teacher.documents];
        if (doc && doc.filePath) {
            deleteFile(doc.filePath);
        }

        const updateData = {
            [`documents.${type}.status`]: 'missing',
            [`documents.${type}.filePath`]: null,
            [`documents.${type}.number`]: null,
            [`documents.${type}.expiryDate`]: null
        };

        return await Teacher.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: updateData }, { new: true });
    }

    static async deleteAdHocDocument(id: string, docId: string): Promise<ITeacher | null> {
        const teacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (!teacher) return null;

        const docIndex = teacher.otherDocuments.findIndex((d: any) => d._id.toString() === docId);
        if (docIndex === -1) return null;

        const doc = teacher.otherDocuments[docIndex];
        if (doc && doc.filePath) {
            deleteFile(doc.filePath);
        }

        teacher.otherDocuments.splice(docIndex, 1);
        return await teacher.save();
    }

    static async reorderAdHocDocuments(id: string, documents: any[]): Promise<ITeacher | null> {
        const teacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (!teacher) return null;

        const docMap = new Map(documents.map((d: any, index: number) => [d._id, { boxId: d.boxId, index }]));

        teacher.otherDocuments.forEach((doc: any) => {
            if (docMap.has(doc._id.toString())) {
                const update = docMap.get(doc._id.toString());
                doc.boxId = update?.boxId || undefined;
            }
        });

        teacher.otherDocuments.sort((a: any, b: any) => {
            const indexA = docMap.get(a._id.toString())?.index ?? -1;
            const indexB = docMap.get(b._id.toString())?.index ?? -1;
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return 0;
        });

        teacher.markModified('otherDocuments');
        return await teacher.save();
    }

    static async updateAdHocDocument(id: string, docId: string, name: string | undefined, file: Express.Multer.File | undefined): Promise<ITeacher | null> {
        const teacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (!teacher) return null;

        const docIndex = teacher.otherDocuments.findIndex((d: any) => d._id.toString() === docId);
        if (docIndex === -1) return null;

        const doc = teacher.otherDocuments[docIndex];
        if (!doc) return null;
        if (name) doc.name = name;
        if (file) {
            if (doc.filePath) deleteFile(doc.filePath);
            doc.filePath = `uploads/${file.filename}`;
            doc.uploadDate = new Date();
        }

        teacher.otherDocuments[docIndex] = doc;
        return await teacher.save();
    }

    static async createBox(id: string, name: string): Promise<ITeacher | null> {
        const teacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (!teacher) return null;

        const newBox = { name, order: teacher.documentBoxes.length };
        teacher.documentBoxes.push(newBox as any);
        return await teacher.save();
    }

    static async reorderBoxes(id: string, boxIds: string[]): Promise<ITeacher | null> {
        const teacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (!teacher) return null;

        const orderMap = new Map(boxIds.map((id, index) => [id, index]));

        teacher.documentBoxes.forEach((box: any) => {
            if (orderMap.has(box._id.toString())) {
                box.order = orderMap.get(box._id.toString());
            }
        });

        teacher.documentBoxes.sort((a: any, b: any) => a.order - b.order);
        teacher.markModified('documentBoxes');
        return await teacher.save();
    }

    static async updateBox(id: string, boxId: string, name: string | undefined, order: number | undefined): Promise<ITeacher | null> {
        const teacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (!teacher) return null;

        const box = teacher.documentBoxes.find((b: any) => b._id.toString() === boxId);
        if (!box) return null;

        if (name) box.name = name;
        if (order !== undefined) box.order = order;

        return await teacher.save();
    }

    static async deleteBox(id: string, boxId: string): Promise<ITeacher | null> {
        const teacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (!teacher) return null;

        const boxIndex = teacher.documentBoxes.findIndex((b: any) => b._id.toString() === boxId);
        if (boxIndex === -1) return null;

        teacher.documentBoxes.splice(boxIndex, 1);

        teacher.otherDocuments.forEach((doc: any) => {
            if (doc.boxId === boxId) {
                doc.boxId = undefined;
            }
        });

        teacher.markModified('documentBoxes');
        teacher.markModified('otherDocuments');
        return await teacher.save();
    }

    static async getBoxDownload(id: string, boxId: string): Promise<{ archive: archiver.Archiver, filename: string } | null> {
        const teacher = await Teacher.findOne({ _id: id, isDeleted: false });
        if (!teacher) return null;

        let boxName = 'Uncategorized';
        let docsInBox: any[] = [];

        if (boxId === 'uncategorized') {
            docsInBox = teacher.otherDocuments.filter((d: any) => !d.boxId);
        } else {
            const box = teacher.documentBoxes.find((b: any) => b._id.toString() === boxId);
            if (!box) return null;
            boxName = box.name;
            docsInBox = teacher.otherDocuments.filter((d: any) => d.boxId === boxId);
        }

        if (docsInBox.length === 0) return null; // Or throw error to indicate empty

        const archive = archiver('zip', { zlib: { level: 9 } });
        const filename = `${teacher.firstName}_${teacher.lastName}_${boxName}.zip`;

        docsInBox.forEach((doc: any) => {
            if (doc.filePath) {
                const absolutePath = path.resolve(doc.filePath);
                if (fs.existsSync(absolutePath)) {
                    archive.file(absolutePath, { name: doc.name + path.extname(doc.filePath) });
                }
            }
        });

        return { archive, filename };
    }

    static async reorderPipeline(stage: string, teacherIds: string[]): Promise<void> {
        const updates = teacherIds.map((id, index) => {
            return Teacher.findOneAndUpdate(
                { _id: id, isDeleted: false },
                {
                    pipelineStage: stage,
                    pipelineOrder: index
                }
            );
        });

        await Promise.all(updates);
    }
}
