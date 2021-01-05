import { Post, PostAttributes } from '../models/post.model';
import { internalServerError } from '../errors';

export default class PostService {
    static getAllPosts = async () => {
        try {
            const posts = await Post.find();
            return posts;
        } catch (error) {
            throw internalServerError;
        }
    }

    static getAllPostsInAFamily = async (familyId: string) => {
        try {
            const posts = await Post.find({ family: familyId });
            return posts;
        } catch (error) {
            throw internalServerError;
        }
    }

    static createPost = async (attrs: PostAttributes) => {
        try {
            const newPost = Post.build({
                ...attrs,
            });

            await newPost.save();

            return newPost;
        } catch (error) {
            internalServerError;
        }
    }
}