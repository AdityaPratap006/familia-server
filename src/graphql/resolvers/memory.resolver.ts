import { IFieldResolver, IResolvers } from 'graphql-tools';
import { DateTimeResolver } from 'graphql-scalars';
import { ContextAttributes } from '../helpers/context';
import { MemoryDoc } from '../../models/memory.model';
import { getGraphqlError } from '../../errors';
import MemoryService from '../../services/memory.service';
import { authCheck } from '../helpers/auth';
import { UserValidators, MembershipValidators } from '../validators';

interface AllMemoriesInFamilyArgs {
    input: {
        familyId: string;
    };
}

interface CreateMemoryArgs {
    input: {
        type: string;
        content: string;
        familyId: string;
        date: string;
    };
}

const allMemories: IFieldResolver<any, ContextAttributes, any, Promise<MemoryDoc[]>> = async (source, args, context) => {
    try {
        const memories = await MemoryService.getAllMemories();
        return memories;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const allMemoriesInFamily: IFieldResolver<any, ContextAttributes, AllMemoriesInFamilyArgs, Promise<MemoryDoc[]>> = async (source, args, context) => {
    const { req } = context;
    const { input: { familyId } } = args;
    const userAuthRecord = await authCheck(req);
    const requestingUser = await UserValidators.checkIfUserExists(userAuthRecord);
    await MembershipValidators.checkIfUserBelongsToFamily(familyId, requestingUser.id);

    try {
        const memories = await MemoryService.getAllMemoriesOfFamily(familyId);
        return memories;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const createMemory: IFieldResolver<any, ContextAttributes, CreateMemoryArgs, Promise<MemoryDoc>> = async (source, args, context) => {
    const { req } = context;
    const { input: { familyId, content, date, type } } = args;
    const userAuthRecord = await authCheck(req);
    const requestingUser = await UserValidators.checkIfUserExists(userAuthRecord);
    await MembershipValidators.checkIfUserBelongsToFamily(familyId, requestingUser.id);

    try {
        const newMemory = await MemoryService.createMemory({
            content,
            date,
            familyId,
            type,
        });

        return newMemory;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const postResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        allMemories,
        allMemoriesInFamily,
    },
    Mutation: {
        createMemory,
    },
};

export default postResolverMap;