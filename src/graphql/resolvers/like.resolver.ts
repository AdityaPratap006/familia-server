import chalk from 'chalk';
import util from 'util';
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
import { LikeDoc } from '../../models/like.model';
import LikeService from '../../services/like.service';

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
        return newLike;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const likeResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        allLikes,
        allLikesOnPost,
    },
    Mutation: {
        createLike,
    },
    Subscription: {
        onLiked: {

        },
    },
};

export default likeResolverMap;