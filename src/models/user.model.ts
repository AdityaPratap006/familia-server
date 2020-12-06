import mongoose from 'mongoose';

interface UserProfilePic {
    url: string;
    public_id: string;
}

// An interface that desribes the properties
// that are required to create a new User
export interface UserAttributes {
    email: string;
    name?: string;
    about?: string;
    fcmToken?: string;
    image?: UserProfilePic;
    auth_id: string;
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
    build: (attrs: UserAttributes) => UserDoc;
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
    email: string;
    name: string;
    image: UserProfilePic;
    about?: string;
    createdAt: string;
    updatedAt: string;
    fcmToken?: string;
    auth_id: string;
}

export function instanceOfUserDoc(object: any): object is UserDoc {
    return 'auth_id' in object;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        index: true,
        unique: true,
    },
    auth_id: {
        type: String,
        index: true,
        required: true,
        unique: true,
    },
    name: {
        type: String,
    },
    image: {
        type: Object,
        default: {
            url: '',
            public_id: '',
        }
    },
    about: {
        type: String,
    },
    fcmToken: {
        type: String,
    },
}, { timestamps: true });

userSchema.statics.build = (attrs: UserAttributes) => {
    return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User, UserDoc };