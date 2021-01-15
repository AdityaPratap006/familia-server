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
import { LikeEvents } from '../events/like.events';
import { pubsub } from '../helpers/pubsub';
import { UserDoc } from '../../models/user.model';
import { MessageEvents } from '../events/message.events';
interface AllChatMessagesArgs {
    input: {
        familyId: string;
        from: string;
        to: string;
    };
}

interface CreateMessageArgs {
    input: {
        familyId: string;
        from: string;
        to: string;
        text: string;
    };
}

interface OnMessageAddedArgs {
    input: {
        familyId: string;
        from: string;
        to: string;
    };
}

interface OnMessageAddedPayload {
    onMessageAdded: MessageDoc;
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

const createMessage: IFieldResolver<any, ContextAttributes, CreateMessageArgs, Promise<MessageDoc>> = async (source, args, context) => {
    const { req } = context;
    const userAuthRecord = await authCheck(req);

    let requestingUser = await UserValidators.checkIfUserExists(userAuthRecord);

    const { input: { familyId, from, to, text } } = args;

    if (from.toString() === to.toString()) {
        throw getGraphqlError(MessageErrors.forbidden.cannotAccessChats);
    }

    if (!compareMongoDocumentIds(from, requestingUser._id)) {
        throw getGraphqlError(MessageErrors.forbidden.cannotAccessChats);
    }

    try {
        const message = await MessageService.createNewMessage({
            family: familyId,
            from: from,
            to: to,
            text: text,
        });

        pubsub.publish(MessageEvents.ON_MESSAGE_ADDED, {
            onMessageAdded: message,
        });

        return message;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const onMessageAddedSubscription: IFieldResolverPrimitive<any, SubscriptionContext, OnMessageAddedArgs> = async (source, args, context) => {
    return withFilter(
        () => pubsub.asyncIterator([MessageEvents.ON_MESSAGE_ADDED]),
        (payload: OnMessageAddedPayload, variables: OnMessageAddedArgs) => {
            const fromUser = payload.onMessageAdded.from as UserDoc;
            const toUser = payload.onMessageAdded.to as UserDoc;
            const familyId = payload.onMessageAdded.family as string;

            const { input: { familyId: inputFamilyId, from, to } } = variables;

            const isAMatch = (compareMongoDocumentIds(fromUser._id, from) || compareMongoDocumentIds(fromUser._id, to))
                && (compareMongoDocumentIds(toUser._id, to) || compareMongoDocumentIds(toUser._id, from))
                && compareMongoDocumentIds(familyId, inputFamilyId);

            return isAMatch;
        }
    )(source, args, context);
}


const messageResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        allChatMessages,
    },
    Mutation: {
        createMessage,
    },
    Subscription: {
        onMessageAdded: {
            subscribe: onMessageAddedSubscription,
        },
    },
};

export default messageResolverMap;