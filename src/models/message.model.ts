import mongoose from 'mongoose';
import { fieldEncryptionPlugin as jumblator } from 'mongoose-jumblator';
import { secretKey } from '../utils/encryption';
import { FamilyDoc } from './family.model';
import { UserDoc } from './user.model';

// An interface that desribes the properties
// that are required to create a new Message
export interface MessageAttributes {
    from: string;
    to: string;
    family: string;
    text: string;
}

// An interface that describes the properties
// that a Message Model has
interface MessageModel extends mongoose.Model<MessageDoc> {
    build: (attrs: MessageAttributes) => MessageDoc;
}

// An interface that describes the properties
// that a Message Document has
interface MessageDoc extends mongoose.Document {
    family: string | FamilyDoc;
    from: string | UserDoc;
    to: string | UserDoc;
    text: string;
    createdAt: string;
    updatedAt: string;
}

const MessageSchema = new mongoose.Schema({
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
    text: {
        type: String,
        encrypt: true,
        searchable: true,
    },
}, { timestamps: true });

MessageSchema.plugin(jumblator, {
    secret: secretKey,
    keySize: 256,
    keySalt: `message-salt`,
    seed: `message-seed`,
    encoding: `Hex`,
    length: 512,
});

MessageSchema.statics.build = (attrs: MessageAttributes) => {
    return new Message(attrs);
};

const Message = mongoose.model<MessageDoc, MessageModel>('Message', MessageSchema);

export { Message, MessageDoc };