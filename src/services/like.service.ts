import { Like } from '../models/like.model';
import { internalServerError } from '../errors';

interface CreateLikeInput {
    postId: string;
    userId: string;
}

interface DeleteLikeInput {
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

    static checkIfLikeExists = async (postId: string, userId: string) => {
        try {
            const like = await Like.findOne({ post: postId, likedBy: userId });
            if (!like) {
                return false;
            }
            return true;
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

    static deleteLike = async (input: DeleteLikeInput) => {
        try {
            const { postId, userId } = input;

            const likeToBeDeleted = await Like.findOne({
                likedBy: userId,
                post: postId,
            });

            if (!likeToBeDeleted) {
                throw Error;
            }

            const likeId: string = likeToBeDeleted.id;

            await Like.findByIdAndDelete(likeId);

            return likeId;
        } catch (error) {
            throw internalServerError;
        }
    }
}