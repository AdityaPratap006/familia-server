import { IFieldResolver, IResolvers } from 'graphql-tools';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';
import { UserDoc } from '../../models/user.model';
import { InviteDoc } from '../../models/invite.model';
import InviteService from '../../services/invite.service';
import { FamilyDoc } from '../../models/family.model';
import { getGraphqlError } from '../../errors';
import { InviteValidators, MembershipValidators, UserValidators } from '../validators';
import { InviteEvents } from '../events/invite.events';

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
    const { input: { family: familyId, to: toUserId } } = args;
    const { req, pubsub } = context;

    const userAuthRecord = await authCheck(req);
    const fromUser = await UserValidators.checkIfUserExists(userAuthRecord);
    await InviteValidators.checkIfUserCanSendInvite(familyId, fromUser.id, toUserId);
    await MembershipValidators.checkIfUserIsAlreadyAMember(familyId, toUserId);
    await InviteValidators.checkIfInviteAlreadySent(familyId, fromUser.id, toUserId);

    try {
        const invite = await InviteService.createInvite({
            family: familyId,
            from: fromUser._id,
            to: toUserId,
        });

        pubsub.publish(InviteEvents.INVITE_CREATED, {
            inviteCreated: invite,
        });

        return invite;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const getInvitesReceivedByUser: IFieldResolver<any, ContextAttributes, any, Promise<InviteDoc[]>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);
    const receivingUser = await UserValidators.checkIfUserExists(userAuthRecord);

    try {
        const invites = await InviteService.getInvitesToAUser(receivingUser.id);
        return invites;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const getInvitesSentByUser: IFieldResolver<any, ContextAttributes, any, Promise<InviteDoc[]>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);
    const sendingUser = await UserValidators.checkIfUserExists(userAuthRecord);

    try {
        const invites = await InviteService.getInvitesfromAUser(sendingUser.id);
        return invites;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const deleteInvite: IFieldResolver<any, ContextAttributes, FindInviteArgs, Promise<string>> = async (source, args, context) => {
    const { input: { inviteId } } = args;

    const userAuthRecord = await authCheck(context.req);
    const requestingUser = await UserValidators.checkIfUserExists(userAuthRecord);
    await InviteValidators.checkIfUserCanDeleteInvite(inviteId, requestingUser.id);

    try {
        await InviteService.deleteInvite(inviteId);
        return `invite deleted`;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const acceptInvite: IFieldResolver<any, ContextAttributes, FindInviteArgs, Promise<string>> = async (source, args, context) => {
    await authCheck(context.req);

    const { input: { inviteId } } = args;
    const invite = await InviteValidators.checkIfInviteExists(inviteId);

    const recevingUser = invite.to as UserDoc;
    const family = invite.family as FamilyDoc;

    await MembershipValidators.checkIfUserIsAlreadyAMember(family.id, recevingUser.id);
    await MembershipValidators.checkIfSpaceLeftInFamily(family);

    try {
        await InviteService.acceptInvite(inviteId);
        return `invite accepted`;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const inviteCreatedSubscription: IFieldResolver<any, ContextAttributes, any, AsyncIterator<InviteDoc>> = (source, args, context) => {
    const { pubsub } = context;

    return pubsub.asyncIterator([InviteEvents.INVITE_CREATED]);
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
    Subscription: {
        inviteCreated: {
            subscribe: inviteCreatedSubscription,
        }
    },
};

export default inviteResolverMap;