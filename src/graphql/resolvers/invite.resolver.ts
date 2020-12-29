import { IFieldResolver, IResolvers } from 'graphql-tools';
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
import { FamilyErrors, getGraphqlError, InviteErrors, UserErrors } from '../../errors';

interface CreateInviteArgs {
    input: {
        family: string;
        to: string;
    };
}

interface FindInviteArgs {
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
        throw getGraphqlError(error);
    }
}

const createInvite: IFieldResolver<any, ContextAttributes, CreateInviteArgs, Promise<InviteDoc>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);

    let fromUser: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);
        if (!user) {
            throw UserErrors.general.userNotFound;
        }
        fromUser = user;
    } catch (error) {
        throw getGraphqlError(error);
    }

    const { input: { family: familyId, to: toUserId } } = args;
    try {
        const family = await FamilyService.getFamilyById(familyId);

        if (!family) {
            throw FamilyErrors.general.familyNotFound;
        }

        const creator = family.creator as UserDoc;

        if (fromUser.id !== creator.id) {
            throw InviteErrors.forbidden.cannotInviteSomeone;
        }

        if (fromUser.id === toUserId) {
            throw InviteErrors.forbidden.cannotInviteYourself;
        }

    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const members = await MembershipService.getMembersOfAFamily(familyId);
        const memberIdList = members.map(member => member.id);
        console.log(memberIdList);
        if (memberIdList.includes(toUserId)) {
            throw InviteErrors.forbidden.userAlreadyAMember;
        }
    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const sentInvites = await InviteService.getInvitesfromAUserForAFamily(fromUser.id, familyId);
        const sentInvitesRecevingUserIdList = sentInvites.map(invite => (invite.to as UserDoc).id);
        if (sentInvitesRecevingUserIdList.includes(toUserId)) {
            throw InviteErrors.forbidden.inviteAlreadySent;
        }
    } catch (error) {
        throw getGraphqlError(error);
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
        throw getGraphqlError(error);
    }
}

const getInvitesReceivedByUser: IFieldResolver<any, ContextAttributes, any, Promise<InviteDoc[]>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);

    let receivingUser: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);

        if (!user) {
            throw UserErrors.general.userNotFound;
        }

        receivingUser = user;
    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const invites = await InviteService.getInvitesToAUser(receivingUser.id);
        return invites;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const getInvitesSentByUser: IFieldResolver<any, ContextAttributes, any, Promise<InviteDoc[]>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);

    let sendingUser: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);

        if (!user) {
            throw UserErrors.general.userNotFound;
        }

        sendingUser = user;
    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const invites = await InviteService.getInvitesfromAUser(sendingUser.id);
        return invites;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const deleteInvite: IFieldResolver<any, ContextAttributes, FindInviteArgs, Promise<string>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);

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

    try {
        const invite = await InviteService.getInvite(args.input.inviteId);
        if (!invite) {
            throw InviteErrors.general.inviteNotFound;
        }

        const fromUser = invite.from as UserDoc;
        const toUser = invite.to as UserDoc;
        if ([fromUser.id, toUser.id].includes(requestingUser.id) === false) {
            throw InviteErrors.forbidden.cannotDeleteInvite;
        }

    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        await InviteService.deleteInvite(args.input.inviteId);
        return `invite deleted`;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const acceptInvite: IFieldResolver<any, ContextAttributes, FindInviteArgs, Promise<string>> = async (source, args, context) => {
    await authCheck(context.req);

    const inviteNotFoundErrorMsg = `invite not found`;

    try {
        const invite = await InviteService.getInvite(args.input.inviteId);

        if (!invite) {
            throw InviteErrors.general.inviteNotFound;
        }

        const recevingUser = invite.to as UserDoc;
        const family = invite.family as FamilyDoc;

        const members = await MembershipService.getMembersOfAFamily(family.id);

        const memberIdList = members.map(member => member.id);

        if (memberIdList.includes(recevingUser.id)) {
            throw InviteErrors.forbidden.userAlreadyAMember;
        }

        if (members.length === 12) {
            throw FamilyErrors.forbidden.cannotAddMoreMembers;
        }

    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        await InviteService.acceptInvite(args.input.inviteId);
        return `invite accepted`;
    } catch (error) {
        throw getGraphqlError(error);
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