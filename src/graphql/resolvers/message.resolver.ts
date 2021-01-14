import { withFilter, IFieldResolver as IFieldResolverPrimitive } from 'apollo-server-express';
import { IFieldResolver, IResolvers } from 'graphql-tools';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes, SubscriptionContext } from '../helpers/context';
import { getGraphqlError, MessageErrors } from '../../errors';
import { MessageDoc } from '../../models/message.model';
import { compareMongoDocumentIds } from '../../utils/db';
import { MembershipValidators, UserValidators } from '../validators';
import MessageService from '../../services/message.service';

interface AllChatMessagesArgs {
    input: {
        familyId: string;
        from: string;
        to: string;
    };
}

const allChatMessages: IFieldResolver<any, ContextAttributes, AllChatMessagesArgs, Promise<MessageDoc[]>> = async (source, args, context) => {
    const { req } = context;
    const userAuthRecord = await authCheck(req);

    let requestingUser = await UserValidators.checkIfUserExists(userAuthRecord);

    const { input: { familyId, from, to } } = args;

    if (from.toString() === to.toString()) {
        throw getGraphqlError(MessageErrors.forbidden.cannotAccessChats);
    }

    if (!compareMongoDocumentIds(from, requestingUser._id) && !compareMongoDocumentIds(to, requestingUser._id)) {
        throw getGraphqlError(MessageErrors.forbidden.cannotAccessChats);
    }

    try {
        await MembershipValidators.checkIfUserBelongsToFamily(familyId, from);
        await MembershipValidators.checkIfUserBelongsToFamily(familyId, to);
    } catch (error) {
        throw getGraphqlError(MessageErrors.forbidden.cannotAccessChats);
    }

    try {
        const messages = await MessageService.getChatMessages(from, to, familyId);
        return messages;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const messageResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        allChatMessages,
    },
    Mutation: {

    },
    Subscription: {

    },
};

export default messageResolverMap;