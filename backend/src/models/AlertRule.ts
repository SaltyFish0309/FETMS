import mongoose, { Schema, Document } from 'mongoose';

export interface IAlertRule extends Document {
    name: string;
    documentType: string; // 'arcDetails', 'workPermitDetails', 'passportDetails'
    conditionType: 'DAYS_REMAINING' | 'DATE_THRESHOLD';
    value: number | Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AlertRuleSchema: Schema = new Schema({
    name: { type: String, required: true },
    documentType: { type: String, required: true },
    conditionType: { type: String, enum: ['DAYS_REMAINING', 'DATE_THRESHOLD'], required: true },
    value: { type: Schema.Types.Mixed, required: true }, // number for days, Date for threshold
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

export default mongoose.model<IAlertRule>('AlertRule', AlertRuleSchema);
