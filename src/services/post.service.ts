import { Post, PostAttributes, PostDoc } from '../models/post.model';
import { internalServerError, PostErrors } from '../errors';
import { cloudinary } from '../utils/cloudinary';
import LikeService from './like.service';

interface CreatePostInput {
    title: string;
    content?: string;
    familyId: string;
    imageBase64String?: string;
    author: string;
}


export default class PostService {
    static getAllPosts = async () => {
        try {
            const posts = await Post.find().sort({ createdAt: -1 }).populate('author').populate({
                path: 'family',
                populate: {
                    path: 'creator',
                    model: 'User',
                }
            });
            return posts;
        } catch (error) {
            throw internalServerError;
        }
    }

    static getPostById = async (postId: string) => {
        try {
            const post = await Post.findById(postId).populate('author').populate({
                path: 'family',
                populate: {
                    path: 'creator',
                    model: 'User',
                }
            });
            return post;
        } catch (error) {
            throw internalServerError;
        }
    }

    static getAllPostsInAFamily = async (familyId: string) => {
        try {
            const posts = await Post.find({ family: familyId }).sort({ createdAt: -1 }).populate('author').populate({
                path: 'family',
                populate: {
                    path: 'creator',
                    model: 'User',
                }
            });
            return posts;
        } catch (error) {
            throw internalServerError;
        }
    }

    static createPost = async (input: CreatePostInput) => {

        const { title, content, imageBase64String, author, familyId } = input;

        const newPostData: PostAttributes = {
            title,
            content,
            author,
            family: familyId,
        };


        if (imageBase64String) {
            try {
                const result = await cloudinary.uploader.upload(imageBase64String, {
                    upload_preset: `posts`,
                });

                newPostData.image = {
                    public_id: result.public_id,
                    url: result.url,
                };

            } catch (error) {
                throw internalServerError;
            }
        }

        try {
            const newPost = Post.build({
                ...newPostData,
            });

            await newPost.save();
            await newPost.populate('author').populate({
                path: 'family',
                populate: {
                    path: 'creator',
                    model: 'User',
                }
            }).execPopulate();

            return newPost;
        } catch (error) {
            internalServerError;
        }
    }

    static deletePost = async (postId: string) => {
        try {
            const postToBeDeleted = await Post.findById(postId);

            if (!postToBeDeleted) {
                throw PostErrors.general.postNotFound;
            }

            const postData: PostDoc = await postToBeDeleted.populate('author').populate({
                path: 'family',
                populate: {
                    path: 'creator',
                    model: 'User',
                }
            }).execPopulate();

            if (postData.image && postData.image.public_id) {
                try {
                    await cloudinary.uploader.destroy(postData.image.public_id);
                } catch (error) {
                    throw internalServerError;
                }
            }

            await LikeService.deleteAllLikesOnPost(postId);
            await Post.findByIdAndDelete(postId);

            return postData;
        } catch (error) {
            throw internalServerError;
        }
    }
}
