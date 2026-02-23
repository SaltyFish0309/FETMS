import mongoose, { Schema, Document } from 'mongoose';

export interface IAlertRule extends Document {
    name: string;
    documentType: 'arcDetails' | 'workPermitDetails' | 'passportDetails' | 'teachingLicense';
    conditionType: 'DAYS_REMAINING' | 'DATE_THRESHOLD';
    value: number | Date;
    isActive: boolean;
    emailEnabled: boolean;
    emailTemplateId?: mongoose.Types.ObjectId;
    lastTriggeredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AlertRuleSchema: Schema = new Schema({
    name: { type: String, required: true },
    documentType: { type: String, required: true },
    conditionType: { type: String, enum: ['DAYS_REMAINING', 'DATE_THRESHOLD'], required: true },
    value: { type: Schema.Types.Mixed, required: true }, // number for days, Date for threshold
    isActive: { type: Boolean, default: true },
    emailEnabled: { type: Boolean, default: false },
    emailTemplateId: { type: Schema.Types.ObjectId, ref: 'EmailTemplate' },
    lastTriggeredAt: { type: Date },
}, {
    timestamps: true
});

export default mongoose.model<IAlertRule>('AlertRule', AlertRuleSchema);
