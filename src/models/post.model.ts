import mongoose from 'mongoose';
import { FamilyDoc } from './family.model';
import { UserDoc } from './user.model';

interface PostPhoto {
    url: string;
    public_id: string;
}

// An interface that desribes the properties
// that are required to create a new Post
export interface PostAttributes {
    title: string;
    content: string;
    image?: PostPhoto;
    author: string;
    family: string;
}

// An interface that describes the properties
// that a Post Model has
interface PostModel extends mongoose.Model<PostDoc> {
    build: (attrs: PostAttributes) => PostDoc;
}

// An interface that describes the properties
// that a Post Document has
interface PostDoc extends mongoose.Document {
    title: string;
    content: string;
    image?: PostPhoto;
    family: string | FamilyDoc;
    author: string | UserDoc;
    createdAt: string;
    updatedAt: string;
}

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
    },
    image: {
        type: Object,
    },
    family: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: 'Family',
    },
    author: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: 'User',
    },
}, { timestamps: true });

PostSchema.statics.build = (attrs: PostAttributes) => {
    return new Post(attrs);
};

const Post = mongoose.model<PostDoc, PostModel>('Post', PostSchema);

export { Post, PostDoc };