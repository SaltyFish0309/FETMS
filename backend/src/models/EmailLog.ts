import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailRecipient {
  email: string;
  name: string;
  teacherId?: mongoose.Types.ObjectId;
  schoolId?: mongoose.Types.ObjectId;
  variables: Record<string, string>;
  status: 'sent' | 'failed';
  error?: string;
}

export interface IEmailLog extends Document {
  recipients: IEmailRecipient[];
  subject: string;
  templateId?: mongoose.Types.ObjectId;
  triggeredBy: 'manual' | 'alert';
  alertRuleId?: mongoose.Types.ObjectId;
  totalSent: number;
  totalFailed: number;
  sentAt: Date;
}

const EmailRecipientSchema = new Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School' },
    variables: { type: Map, of: String, default: {} },
    status: { type: String, enum: ['sent', 'failed'], required: true },
    error: { type: String },
  },
  { _id: false }
);

const EmailLogSchema: Schema = new Schema(
  {
    recipients: [EmailRecipientSchema],
    subject: { type: String, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'EmailTemplate' },
    triggeredBy: { type: String, enum: ['manual', 'alert'], required: true },
    alertRuleId: { type: Schema.Types.ObjectId, ref: 'AlertRule' },
    totalSent: { type: Number, required: true },
    totalFailed: { type: Number, required: true },
    sentAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export default mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);
