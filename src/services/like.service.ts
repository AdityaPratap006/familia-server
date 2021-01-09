import { Like } from '../models/like.model';
import { internalServerError } from '../errors';

interface CreateLikeInput {
    postId: string;
    userId: string;
}

export default class LikeService {
    static getAllLikes = async () => {
        try {
            const likes = await Like.find().sort({ createdAt: -1 }).populate('likedBy');
            return likes;
        } catch (error) {
            throw internalServerError;
        }
    }

    static getAllLikesOnAPost = async (postId: string) => {
        try {
            const likes = await Like.find({ post: postId }).sort({ createdAt: -1 }).populate('likedBy');
            return likes;
        } catch (error) {
            throw internalServerError;
        }
    }

    static createLike = async (input: CreateLikeInput) => {
        try {
            const { postId, userId } = input;

            const newLike = Like.build({
                likedBy: userId,
                post: postId,
            });

            await newLike.save();
            await newLike.populate('likedBy').execPopulate();

            return newLike;
        } catch (error) {
            throw internalServerError;
        }
    }
}