import mongoose from 'mongoose';
import { FamilyDoc } from './family.model';
import { UserDoc } from './user.model';

// An interface that desribes the properties
// that are required to create a new Membership
export interface MembershipAttributes {
    user: string;
    family: string;
}

// An interface that describes the properties
// that a Membership Model has
interface MembershipModel extends mongoose.Model<MembershipDoc> {
    build: (attrs: MembershipAttributes) => MembershipDoc;
}

// An interface that describes the properties
// that a Membership Document has
interface MembershipDoc extends mongoose.Document {
    family: string | FamilyDoc;
    user: string | UserDoc;
    createdAt: string;
    updatedAt: string;
}

const membershipSchema = new mongoose.Schema({
    family: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: 'Family',
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: 'User',
    },
}, { timestamps: true });

membershipSchema.statics.build = (attrs: MembershipAttributes) => {
    return new Membership(attrs);
};

const Membership = mongoose.model<MembershipDoc, MembershipModel>('Membership', membershipSchema);

export { Membership, MembershipDoc };