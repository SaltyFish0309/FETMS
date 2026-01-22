import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
    name: {
        chinese: { type: String, required: true },
        english: { type: String }
    },
    address: {
        chinese: { type: String },
        english: { type: String }
    },
    principal: {
        chineseName: { type: String },
        englishName: { type: String }
    },
    contact: {
        name: { type: String },
        position: { type: String },
        email: { type: String },
        phone: { type: String }
    },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Indexes for performance (searching by name)
schoolSchema.index({ 'name.chinese': 1 });
schoolSchema.index({ 'name.english': 1 });
schoolSchema.index({ isDeleted: 1 });

export default mongoose.model('School', schoolSchema);
