import mongoose from 'mongoose';
import { PostDoc } from './post.model';
import { UserDoc } from './user.model';

// An interface that desribes the properties
// that are required to create a new Like
export interface LikeAttributes {
    likedBy: string;
    post: string;
}

// An interface that describes the properties
// that a Like Model has
interface LikeModel extends mongoose.Model<LikeDoc> {
    build: (attrs: LikeAttributes) => LikeDoc;
}

// An interface that describes the properties
// that a Like Document has
interface LikeDoc extends mongoose.Document {
    likedBy: string | UserDoc;
    post: string | PostDoc;
    createdAt: string;
    updatedAt: string;
}

const LikeSchema = new mongoose.Schema({
    post: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: 'Post',
    },
    likedBy: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: 'User',
    },
}, { timestamps: true });

LikeSchema.statics.build = (attrs: LikeAttributes) => {
    return new Like(attrs);
};

const Like = mongoose.model<LikeDoc, LikeModel>('Like', LikeSchema);

export { Like, LikeDoc };