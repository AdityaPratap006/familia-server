import { IFieldResolver, IResolvers } from 'graphql-tools';
import { ApolloError, UserInputError, ForbiddenError } from 'apollo-server-express';
// import chalk from 'chalk';
// import util from 'util';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';
import UserService from '../../services/user.service';
import { UserDoc } from '../../models/user.model';
import { InviteDoc } from '../../models/invite.model';
import InviteService from '../../services/invite.service';
import FamilyService from '../../services/family.service';

interface CreateInviteArgs {
    input: {
        family: string;
        to: string;
    };
}

const getAllInvites: IFieldResolver<any, ContextAttributes, any, Promise<InviteDoc[]>> = async (source, args, context) => {
    await authCheck(context.req);

    try {
        const invites = await InviteService.getAllInvites();
        return invites;
    } catch (error) {
        throw new ApolloError(`something went wrong`);
    }
}

const createInvite: IFieldResolver<any, ContextAttributes, CreateInviteArgs, Promise<InviteDoc>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);

    let fromUser: UserDoc;
    const generalErrorMsg = `something went wrong`;
    const userNotFoundErrorMsg = `user not found`;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);
        if (!user) {
            throw Error(userNotFoundErrorMsg);
        }
        fromUser = user;
    } catch (error) {
        if (error.message === userNotFoundErrorMsg) {
            throw new UserInputError(userNotFoundErrorMsg);
        }

        throw new ApolloError(generalErrorMsg);
    }

    const { input: { family: familyId, to: toUserId } } = args;

    const familyNotFoundErrorMsg = `family not found`;
    const cannotInviteErrorMsg = `you cannot invite someone to this family`;
    const cannotInviteSelfErrorMsg = `you cannot invite yourself`;

    try {
        const family = await FamilyService.getFamilyById(familyId);

        if (!family) {
            throw Error(familyNotFoundErrorMsg);
        }

        const creator = family.creator as UserDoc;

        if (fromUser.id !== creator.id) {
            throw Error(cannotInviteErrorMsg);
        }

        if (fromUser.id === toUserId) {
            throw Error(cannotInviteSelfErrorMsg);
        }

    } catch (error) {
        const msg = error.message;

        if (msg === familyNotFoundErrorMsg) {
            throw new UserInputError(familyNotFoundErrorMsg);
        } else if (msg === cannotInviteErrorMsg) {
            throw new ForbiddenError(cannotInviteErrorMsg);
        } else if (msg === cannotInviteSelfErrorMsg) {
            throw new ForbiddenError(cannotInviteSelfErrorMsg);
        }

        throw new ApolloError(generalErrorMsg);
    }

    try {
        const invite = await InviteService.createInvite({
            family: familyId,
            from: fromUser._id,
            to: toUserId,
        });

        return invite;
    } catch (error) {
        // console.log(error);
        throw new ApolloError(`something went wrong`);
    }
}

const getInvitesReceivedByUser: IFieldResolver<any, ContextAttributes, any, Promise<InviteDoc[]>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);

    let receivingUser: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);

        if (!user) {
            throw Error('user not found');
        }

        receivingUser = user;
    } catch (error) {
        throw new UserInputError(`user not found`);
    }

    try {
        const invites = await InviteService.getInvitesToAUser(receivingUser.id);
        return invites;
    } catch (error) {
        throw new ApolloError('something went wrong');
    }
}

const getInvitesSentByUser: IFieldResolver<any, ContextAttributes, any, Promise<InviteDoc[]>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);

    let sendingUser: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);

        if (!user) {
            throw Error('user not found');
        }

        sendingUser = user;
    } catch (error) {
        throw new UserInputError(`user not found`);
    }

    try {
        const invites = await InviteService.getInvitesfromAUser(sendingUser.id);
        return invites;
    } catch (error) {
        throw new ApolloError('something went wrong');
    }
}

const inviteResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        getAllInvites,
        getInvitesReceivedByUser,
        getInvitesSentByUser,
    },
    Mutation: {
        createInvite,
    },
};

export default inviteResolverMap;