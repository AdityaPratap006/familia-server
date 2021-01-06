import { IFieldResolver, IResolvers } from 'graphql-tools';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';
import { getGraphqlError, PostErrors, UserErrors } from '../../errors';
import { PostDoc } from '../../models/post.model';
import PostService from '../../services/post.service';
import { UserDoc } from '../../models/user.model';
import UserService from '../../services/user.service';
import MembershipService from '../../services/membership.service';

interface CreatePostArgs {
    input: {
        title: string;
        content?: string;
        familyId: string;
        imageBase64String?: string;
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
            title: title,
            content: content || '',
            family: familyId,
            author: author.id,
        });

        if (!newPost) {
            throw PostErrors.general.postNotFound;
        }

        return newPost;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const postResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        allPosts,
    },
    Mutation: {
        createPost,
    }
};

export default postResolverMap;