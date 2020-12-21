import mongoose from 'mongoose';
import { FamilyDoc } from './family.model';
import { UserDoc } from './user.model';

// An interface that desribes the properties
// that are required to create a new Invite
export interface InviteAttributes {
    from: string;
    to: string;
    family: string;
}

// An interface that describes the properties
// that a Invite Model has
interface InviteModel extends mongoose.Model<InviteDoc> {
    build: (attrs: InviteAttributes) => InviteDoc;
}

// An interface that describes the properties
// that a Invite Document has
interface InviteDoc extends mongoose.Document {
    family: string | FamilyDoc;
    from: string | UserDoc;
    to: string | UserDoc;
    createdAt: string;
    updatedAt: string;
}

const InviteSchema = new mongoose.Schema({
    family: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: 'Family',
    },
    from: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: 'User',
    },
    to: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: 'User',
    },
}, { timestamps: true });

InviteSchema.statics.build = (attrs: InviteAttributes) => {
    return new Invite(attrs);
};

const Invite = mongoose.model<InviteDoc, InviteModel>('Invite', InviteSchema);

export { Invite, InviteDoc };