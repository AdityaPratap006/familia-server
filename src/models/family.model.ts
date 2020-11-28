import mongoose from 'mongoose';
import { UserDoc } from './user.model';

// An interface that desribes the properties
// that are required to create a new Family
export interface FamilyAttributes {
    name: string;
    description?: string;
    creator: string;
}

// An interface that describes the properties
// that a Family Model has
interface FamilyModel extends mongoose.Model<FamilyDoc> {
    build: (attrs: FamilyAttributes) => FamilyDoc;
}

// An interface that describes the properties
// that a Family Document has
interface FamilyDoc extends mongoose.Document {
    name: string;
    description?: string;
    creator: string | UserDoc;
    createdAt: string;
    updatedAt: string;
}

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    creator: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: 'User',
    },
}, { timestamps: true });

familySchema.statics.build = (attrs: FamilyAttributes) => {
    return new Family(attrs);
};

const Family = mongoose.model<FamilyDoc, FamilyModel>('Family', familySchema);

export { Family, FamilyDoc };