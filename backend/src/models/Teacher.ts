import mongoose, { Schema, Document } from 'mongoose';

// Interface for Core Documents (Fixed Schema)
interface ICoreDoc {
    number?: string;
    expiryDate?: Date;
    filePath?: string;
    status: 'missing' | 'valid' | 'expired';
}

// Interface for Ad-hoc Documents (Flexible)
export interface IAdHocDoc {
    _id?: string;
    name: string;
    filePath: string;
    uploadDate: Date;
    boxId?: string; // Reference to a box
}

// Interface for Document Boxes
export interface IDocumentBox {
    _id?: string;
    name: string;
    order: number;
}

export interface ITeacher extends Document {
    firstName: string;
    middleName?: string;
    lastName: string;
    school?: Schema.Types.ObjectId;
    email: string;
    profilePicture?: string | undefined;
    remarks?: string;
    project: mongoose.Types.ObjectId;

    // Personal Info
    personalInfo?: {
        chineseName?: string;
        englishName?: string;
        serviceSchool?: string;
        nationality?: {
            chinese?: string;
            english?: string;
        };

        phone?: string;
        dob?: Date;
        gender?: string;
        address?: {
            taiwan?: string;
            home?: string;
        };
        hiringStatus?: 'Newly Hired' | 'Re-Hired';
    };

    // Emergency Contact
    emergencyContact?: {
        name?: string;
        relationship?: string;
        phone?: string;
        email?: string;
    };

    // Passport Details
    passportDetails?: {
        number?: string;
        expiryDate?: Date;
        issuingCountry?: string;
        issuingAuthority?: string;
        issueDate?: Date;
    };

    // Education
    education?: {
        degree?: string;
        major?: string;
        school?: string;
    };

    // Teaching License
    teachingLicense?: {
        expiryDate?: Date;
    };

    // Criminal Record
    criminalRecord?: {
        issueDate?: Date;
    };

    // Work Permit
    workPermitDetails?: {
        issueDate?: Date;
        expiryDate?: Date;
        startDate?: Date;
        permitNumber?: string;
    };

    // Contract
    contractDetails?: {
        contractStartDate?: Date;
        contractEndDate?: Date;
        payStartDate?: Date;
        payEndDate?: Date;
        senioritySalary?: string;
        seniorityLeave?: string;
        salary?: number;
        hasSalaryIncrease?: boolean;
        salaryIncreaseDate?: Date;
        estimatedPromotedSalary?: number;
    };

    // ARC
    arcDetails?: {
        expiryDate?: Date;
        purpose?: string;
    };

    // Core Documents (Embedded directly for easy access)
    documents: {
        passport: ICoreDoc;
        arc: ICoreDoc;
        contract: ICoreDoc;
        workPermit: ICoreDoc;
    };

    // Document Boxes
    documentBoxes: IDocumentBox[];

    // Ad-hoc Documents (Array for flexibility)
    otherDocuments: IAdHocDoc[];

    // Workflow Pipeline
    pipelineStage: string;
    pipelineOrder: number;

    isDeleted: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const CoreDocSchema = new Schema<ICoreDoc>({
    number: { type: String },
    expiryDate: { type: Date },
    filePath: { type: String },
    status: { type: String, enum: ['missing', 'valid', 'expired'], default: 'missing' }
}, { _id: false });

const AdHocDocSchema = new Schema<IAdHocDoc>({
    name: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    boxId: { type: String }
});

const DocumentBoxSchema = new Schema<IDocumentBox>({
    name: { type: String, required: true },
    order: { type: Number, default: 0 }
});

const TeacherSchema = new Schema<ITeacher>({
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School' },
    email: { type: String, required: true, unique: true },
    profilePicture: { type: String },
    remarks: { type: String, default: '' },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: false,
        index: true
    },

    // Personal Info
    personalInfo: {
        chineseName: { type: String },
        englishName: { type: String },
        serviceSchool: { type: String },
        nationality: {
            chinese: { type: String },
            english: { type: String }
        },

        phone: { type: String },
        dob: { type: Date },
        gender: { type: String },
        address: {
            taiwan: { type: String },
            home: { type: String }
        },
        hiringStatus: { type: String, enum: ['Newly Hired', 'Re-Hired'] }
    },

    // Emergency Contact
    emergencyContact: {
        name: { type: String },
        relationship: { type: String },
        phone: { type: String },
        email: { type: String }
    },

    // Passport Details (Extended)
    passportDetails: {
        number: { type: String },
        expiryDate: { type: Date },
        issuingCountry: { type: String },
        issuingAuthority: { type: String },
        issueDate: { type: Date }
    },

    // Education
    education: {
        degree: { type: String },
        major: { type: String },
        school: { type: String }
    },

    // Teaching License
    teachingLicense: {
        expiryDate: { type: Date }
    },

    // Criminal Record
    criminalRecord: {
        issueDate: { type: Date }
    },

    // Work Permit
    workPermitDetails: {
        issueDate: { type: Date },
        expiryDate: { type: Date },
        startDate: { type: Date },
        permitNumber: { type: String }
    },

    // Contract
    contractDetails: {
        contractStartDate: { type: Date },
        contractEndDate: { type: Date },
        payStartDate: { type: Date },
        payEndDate: { type: Date },
        senioritySalary: { type: String },
        seniorityLeave: { type: String },
        salary: { type: Number },
        hasSalaryIncrease: { type: Boolean, default: false },
        salaryIncreaseDate: { type: Date },
        estimatedPromotedSalary: { type: Number }
    },

    // ARC
    arcDetails: {
        expiryDate: { type: Date },
        purpose: { type: String }
    },

    documents: {
        passport: { type: CoreDocSchema, default: () => ({}) },
        arc: { type: CoreDocSchema, default: () => ({}) },
        contract: { type: CoreDocSchema, default: () => ({}) },
        workPermit: { type: CoreDocSchema, default: () => ({}) }
    },

    documentBoxes: [DocumentBoxSchema],
    otherDocuments: [AdHocDocSchema],

    // Workflow Pipeline
    pipelineStage: { type: String, default: 'uncategorized' },
    pipelineOrder: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false, index: true }
}, {
    timestamps: true
});

// Indexes

TeacherSchema.index({ firstName: 1 });
TeacherSchema.index({ lastName: 1 });
TeacherSchema.index({ 'personalInfo.nationality.english': 1 });


export default mongoose.model<ITeacher>('Teacher', TeacherSchema);
