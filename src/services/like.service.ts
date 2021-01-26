import { Like, LikeDoc } from '../models/like.model';
import { internalServerError } from '../errors';

interface CreateLikeInput {
    postId: string;
    userId: string;
}

interface DeleteLikeInput {
    likeId: string;
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

    static getOneLike = async (likeId: string) => {
        try {
            const like = await Like.findById(likeId).populate('likedBy');
            return like;
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
            const { likeId } = input;

            const likeToBeDeleted = await Like.findById(likeId);

            if (!likeToBeDeleted) {
                throw Error;
            }

            const likeData: LikeDoc = await likeToBeDeleted.populate('likedBy').execPopulate();

            await Like.findByIdAndDelete(likeId);

            return likeData;
        } catch (error) {
            throw internalServerError;
        }
    }

    static deleteAllLikesOnPost = async (postId: string) => {
        try {
            await Like.deleteMany({ post: postId });
        } catch (error) {
            throw internalServerError;
        }
    }
}