import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ProjectSchema.index({ code: 1 });
ProjectSchema.index({ isActive: 1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
