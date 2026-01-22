import mongoose, { Schema, Document } from 'mongoose';

export interface IStage extends Document {
    title: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const StageSchema: Schema = new Schema({
    title: { type: String, required: true },
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<IStage>('Stage', StageSchema);
