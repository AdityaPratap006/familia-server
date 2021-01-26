import chalk from 'chalk';
import util from 'util';
import { withFilter, IFieldResolver as IFieldResolverPrimitive } from 'apollo-server-express';
import { IFieldResolver, IResolvers } from 'graphql-tools';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck, getVerifiedUser } from '../helpers/auth';
import { ContextAttributes, SubscriptionContext } from '../helpers/context';
import { getGraphqlError, PostErrors, UserErrors } from '../../errors';
import { PostDoc } from '../../models/post.model';
import PostService from '../../services/post.service';
import { UserDoc } from '../../models/user.model';
import UserService from '../../services/user.service';
import MembershipService from '../../services/membership.service';
import { pubsub } from '../helpers/pubsub';
import { PostEvents } from '../events/post.events';
import { compareMongoDocumentIds } from '../../utils/db';

interface CreatePostArgs {
    input: {
        title: string;
        content?: string;
        familyId: string;
        imageBase64String?: string;
    };
}

interface AllPostsInFamilyArgs {
    input: {
        familyId: string;
    };
}

interface DeletePostArgs {
    input: {
        postId: string;
    };
}

const allPosts: IFieldResolver<any, ContextAttributes, any, Promise<PostDoc[]>> = async (source, args, context) => {
    try {
        const posts = await PostService.getAllPosts();
        return posts;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const createPost: IFieldResolver<any, ContextAttributes, CreatePostArgs, Promise<PostDoc>> = async (source, args, context) => {
    const { req } = context;
    const userAuthRecord = await authCheck(req);

    let author: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);
        if (!user) {
            throw UserErrors.general.userNotFound;
        }
        author = user;
    } catch (error) {
        throw getGraphqlError(error);
    }

    const { input: { title, content, familyId, imageBase64String } } = args;

    // check if author belongs to the family
    try {
        const members = await MembershipService.getMembersOfAFamily(familyId);
        const isValidMembership = members.some(member => member.id === author.id);
        if (!isValidMembership) {
            throw PostErrors.forbidden.userNotAMember;
        }
    } catch (error) {
        throw getGraphqlError(error);
    }

    if (!title || title.trim() === '') {
        throw getGraphqlError(PostErrors.userInput.titleRequired);
    }

    if (!familyId || familyId.trim() === '') {
        throw getGraphqlError(PostErrors.userInput.familyIdRequired);
    }

    try {
        const newPost = await PostService.createPost({
            title,
            content,
            familyId,
            author: author.id,
            imageBase64String,
        });

        if (!newPost) {
            throw PostErrors.general.postNotFound;
        }

        pubsub.publish(PostEvents.POST_ADDED, {
            onPostAdded: newPost,
        });

        return newPost;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const deletePost: IFieldResolver<any, ContextAttributes, DeletePostArgs, Promise<PostDoc>> = async (source, args, context) => {
    const { req } = context;
    const userAuthRecord = await authCheck(req);

    let requestingUser: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);
        if (!user) {
            throw UserErrors.general.userNotFound;
        }
        requestingUser = user;
    } catch (error) {
        throw getGraphqlError(error);
    }

    const { input: { postId } } = args;

    if (!postId || postId.trim() === '') {
        throw getGraphqlError(PostErrors.general.postNotFound);
    }

    // check if requesting user is the author of the post
    try {
        const post = await PostService.getPostById(postId);
        if (!post) {
            throw PostErrors.general.postNotFound;
        }
        const postAuthor = post.author as UserDoc;
        const isAuthor = compareMongoDocumentIds(requestingUser.id, postAuthor.id);
        if (!isAuthor) {
            throw PostErrors.forbidden.cannotDelete;
        }
    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const deletedPost = await PostService.deletePost(postId);

        if (!deletedPost) {
            throw PostErrors.general.postNotFound;
        }

        pubsub.publish(PostEvents.POST_DELETED, {
            onPostDeleted: deletedPost,
        });

        return deletedPost;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const allPostsInFamily: IFieldResolver<any, ContextAttributes, AllPostsInFamilyArgs, Promise<PostDoc[]>> = async (source, args, context) => {
    const { req } = context;
    const userAuthRecord = await authCheck(req);

    let requestingUser: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);
        if (!user) {
            throw UserErrors.general.userNotFound;
        }
        requestingUser = user;
    } catch (error) {
        throw getGraphqlError(error);
    }

    const { input: { familyId } } = args;

    // check if requesting user belongs to the family
    try {
        const members = await MembershipService.getMembersOfAFamily(familyId);
        const isValidMembership = members.some(member => member.id === requestingUser.id);
        if (!isValidMembership) {
            throw PostErrors.forbidden.userNotAMember;
        }
    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const posts = await PostService.getAllPostsInAFamily(familyId);
        return posts;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const postAddedSubscription: IFieldResolverPrimitive<any, SubscriptionContext, any> = (source, args, context) => {
    return pubsub.asyncIterator([PostEvents.POST_ADDED]);
}

const postResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        allPosts,
        allPostsInFamily,
    },
    Mutation: {
        createPost,
        deletePost,
    },
    Subscription: {
        onPostAdded: {
            subscribe: postAddedSubscription,
        },
    },
};

export default postResolverMap;