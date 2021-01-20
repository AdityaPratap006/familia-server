import mongoose from 'mongoose';
import { FamilyDoc } from './family.model';
import { UserDoc } from './user.model';

// An interface that desribes the properties
// that are required to create a new Memory
export interface MemoryAttributes {
    type: string;
    content: string;
    family: string;
    date: string;
}

// An interface that describes the properties
// that a Memory Model has
interface MemoryModel extends mongoose.Model<MemoryDoc> {
    build: (attrs: MemoryAttributes) => MemoryDoc;
}

// An interface that describes the properties
// that a Memory Document has
interface MemoryDoc extends mongoose.Document {
    type: string;
    content: string;
    family: string | FamilyDoc;
    date: string;
    createdAt: string;
    updatedAt: string;
}

const MemorySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    family: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: 'Family',
    },
    date: {
        type: String,
        required: true,
    }
}, { timestamps: true });

MemorySchema.statics.build = (attrs: MemoryAttributes) => {
    return new Memory(attrs);
};

const Memory = mongoose.model<MemoryDoc, MemoryModel>('Memory', MemorySchema);

export { Memory, MemoryDoc };