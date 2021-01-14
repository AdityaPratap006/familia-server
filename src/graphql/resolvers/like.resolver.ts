import chalk from 'chalk';
import util from 'util';
import { withFilter, IFieldResolver as IFieldResolverPrimitive } from 'apollo-server-express';
import { IFieldResolver, IResolvers } from 'graphql-tools';
import { DateTimeResolver } from 'graphql-scalars';
import { mongo } from 'mongoose';
import { authCheck } from '../helpers/auth';
import { ContextAttributes, SubscriptionContext } from '../helpers/context';
import { CustomError, CustomErrorCodes, getGraphqlError, PostErrors, UserErrors } from '../../errors';
import { UserDoc } from '../../models/user.model';
import UserService from '../../services/user.service';
import { pubsub } from '../helpers/pubsub';
import { LikeDoc } from '../../models/like.model';
import LikeService from '../../services/like.service';
import { LikeEvents } from '../events/like.events';
import { PostDoc } from '../../models/post.model';

interface AllLikesOnPostArgs {
    input: {
        postId: string;
    };
}

interface CreateLikeArgs {
    input: {
        postId: string;
    };
}

interface IsPostLikedByUserArgs {
    input: {
        postId: string;
    };
}

interface DeleteLikeArgs {
    input: {
        likeId: string;
    };
}

interface OnLikeArgs {
    input: {
        postId: string;
    };
}

interface OnUnLikeArgs {
    input: {
        postId: string;
    };
}

interface OnLikedPayload {
    onLiked: LikeDoc;
}

interface OnUnlikedPayload {
    onUnliked: LikeDoc;
}

const allLikes: IFieldResolver<any, ContextAttributes, any, Promise<LikeDoc[]>> = async (source, args, context) => {
    try {
        const likes = await LikeService.getAllLikes();
        return likes;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const allLikesOnPost: IFieldResolver<any, ContextAttributes, AllLikesOnPostArgs, Promise<LikeDoc[]>> = async (source, args, context) => {
    const { req } = context;
    await authCheck(req);

    try {
        const { input: { postId } } = args;
        const likes = await LikeService.getAllLikesOnAPost(postId);
        return likes;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const createLike: IFieldResolver<any, ContextAttributes, CreateLikeArgs, Promise<LikeDoc>> = async (source, args, context) => {
    const { req } = context;
    const userAuthRecord = await authCheck(req);

    let userWhoLiked: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);
        if (!user) {
            throw UserErrors.general.userNotFound;
        }
        userWhoLiked = user;
    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const { input: { postId } } = args;
        const newLike = await LikeService.createLike({
            postId: postId,
            userId: userWhoLiked.id,
        });

        pubsub.publish(LikeEvents.ON_LIKED, {
            onLiked: newLike,
        });

        return newLike;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const isPostLikedByUser: IFieldResolver<any, ContextAttributes, IsPostLikedByUserArgs, Promise<boolean>> = async (source, args, context) => {
    const { req } = context;
    const userAuthRecord = await authCheck(req);

    let userToBeCheckedFor: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);
        if (!user) {
            throw UserErrors.general.userNotFound;
        }
        userToBeCheckedFor = user;
    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const { input: { postId } } = args;
        const userId = userToBeCheckedFor.id;

        const isLiked = await LikeService.checkIfLikeExists(postId, userId);
        return isLiked;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const deleteLike: IFieldResolver<any, ContextAttributes, DeleteLikeArgs, Promise<LikeDoc>> = async (source, args, context) => {
    const { req } = context;
    const userAuthRecord = await authCheck(req);

    let userWhoDisliked: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);
        if (!user) {
            throw UserErrors.general.userNotFound;
        }
        userWhoDisliked = user;
    } catch (error) {
        throw getGraphqlError(error);
    }

    const { input: { likeId } } = args;

    try {
        const likeTobeDeleted = await LikeService.getOneLike(likeId);

        if (!likeTobeDeleted) {
            throw new CustomError(CustomErrorCodes.STATUS_404_NOT_FOUND, `like not found`);
        }

        const likedByUser = likeTobeDeleted.likedBy as UserDoc;
        if (likedByUser.id !== userWhoDisliked.id) {
            throw new CustomError(CustomErrorCodes.STATUS_403_FORBIDDEN, `sorry you cannot unlike`);
        }

    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const deletedLike = await LikeService.deleteLike({
            likeId,
        });

        pubsub.publish(LikeEvents.ON_UNLIKED, {
            onUnliked: deletedLike,
        });

        return deletedLike;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const onLikedSubscription: IFieldResolverPrimitive<any, SubscriptionContext, OnLikeArgs> = async (source, args, context) => {
    return withFilter(
        () => pubsub.asyncIterator([LikeEvents.ON_LIKED]),
        (payload: OnLikedPayload, variables: OnLikeArgs) => {
            const post = payload.onLiked.post as PostDoc;
            const { input: { postId } } = variables;

            const id1 = new mongo.ObjectID(post._id);
            const id2 = new mongo.ObjectID(postId);

            return id1.equals(id2);
        }
    )(source, args, context);
}

const onUnLikedSubscription: IFieldResolverPrimitive<any, SubscriptionContext, OnUnLikeArgs> = async (source, args, context) => {
    return withFilter(
        () => pubsub.asyncIterator([LikeEvents.ON_UNLIKED]),
        (payload: OnUnlikedPayload, variables: OnUnLikeArgs) => {
            const post = payload.onUnliked.post as PostDoc;
            const { input: { postId } } = variables;

            const id1 = new mongo.ObjectID(post._id);
            const id2 = new mongo.ObjectID(postId);

            return id1.equals(id2);
        }
    )(source, args, context);
}

const likeResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        allLikes,
        allLikesOnPost,
        isPostLikedByUser,
    },
    Mutation: {
        createLike,
        deleteLike,
    },
    Subscription: {
        onLiked: {
            subscribe: onLikedSubscription,
        },
        onUnliked: {
            subscribe: onUnLikedSubscription,
        }
    },
};

export default likeResolverMap;