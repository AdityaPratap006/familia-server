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
import MembershipService from '../../services/membership.service';
import { FamilyDoc } from '../../models/family.model';

interface CreateInviteArgs {
    input: {
        family: string;
        to: string;
    };
}

interface DeleteInviteArgs {
    input: {
        inviteId: string;
    };
}

interface AcceptInviteArgs {
    input: {
        inviteId: string;
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
        const members = await MembershipService.getMembersOfAFamily(familyId);
        const memberIdList = members.map(member => member.id);
        console.log(memberIdList);
        if (memberIdList.includes(toUserId)) {
            throw Error('user is already a member');
        }
    } catch (error) {
        if (error.message === 'user is already a member') {
            throw new ForbiddenError('user is already a member');
        }

        throw new ApolloError('something went wrong');
    }

    try {
        const sentInvites = await InviteService.getInvitesfromAUserForAFamily(fromUser.id, familyId);
        const sentInvitesRecevingUserIdList = sentInvites.map(invite => (invite.to as UserDoc).id);
        if (sentInvitesRecevingUserIdList.includes(toUserId)) {
            throw Error('invite already sent');
        }
    } catch (error) {
        if (error.message === 'invite already sent') {
            throw new ForbiddenError('invite already sent');
        }

        throw new ApolloError('something went wrong');
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

const deleteInvite: IFieldResolver<any, ContextAttributes, DeleteInviteArgs, Promise<string>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);

    let requestingUser: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);

        if (!user) {
            throw Error('user not found');
        }

        requestingUser = user;
    } catch (error) {
        throw new UserInputError(`user not found`);
    }

    const cannotDeleteInviteErrorMsg = `you cannot delete this invite`;
    try {
        const invite = await InviteService.getInvite(args.input.inviteId);
        if (!invite) {
            throw Error('not found');
        }

        const fromUser = invite.from as UserDoc;

        if (fromUser.id !== requestingUser.id) {
            throw Error(cannotDeleteInviteErrorMsg);
        }

    } catch (error) {
        if (error.message === cannotDeleteInviteErrorMsg) {
            throw new ForbiddenError(cannotDeleteInviteErrorMsg);
        }
        throw new UserInputError(`invite not found`);
    }

    try {
        await InviteService.deleteInvite(args.input.inviteId);
        return `invite deleted`;
    } catch (error) {
        throw new ApolloError(`something went wrong`);
    }
}

const acceptInvite: IFieldResolver<any, ContextAttributes, AcceptInviteArgs, Promise<string>> = async (source, args, context) => {
    await authCheck(context.req);

    const inviteNotFoundErrorMsg = `invite not found`;

    try {
        const invite = await InviteService.getInvite(args.input.inviteId);

        if (!invite) {
            throw Error(inviteNotFoundErrorMsg);
        }

        const recevingUser = invite.to as UserDoc;
        const family = invite.family as FamilyDoc;

        const members = await MembershipService.getMembersOfAFamily(family.id);

        const memberIdList = members.map(member => member.id);

        if (memberIdList.includes(recevingUser.id)) {
            throw Error('user already a member');
        }

        if (members.length === 12) {
            throw Error('cannot add more than 12 members');
        }

    } catch (error) {
        if (error.message === inviteNotFoundErrorMsg) {
            throw new UserInputError(inviteNotFoundErrorMsg);
        }

        if (error.message === 'user already a member') {
            throw new ForbiddenError('user already a member');
        }

        if (error.message === 'cannot add more than 12 members') {
            throw new ForbiddenError('cannot add more than 12 members');
        }

        throw new ApolloError(`something went wrong`);
    }

    try {
        await InviteService.acceptInvite(args.input.inviteId);
        return `invite accepted`;
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
        deleteInvite,
        acceptInvite,
    },
};

export default inviteResolverMap;