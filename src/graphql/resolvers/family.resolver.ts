import { IFieldResolver, IResolvers } from 'graphql-tools';
import { ApolloError, UserInputError } from 'apollo-server-express';
import chalk from 'chalk';
// import util from 'util';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';
import { FamilyDoc } from '../../models/family.model';
import FamilyService from '../../services/family.service';
import UserService from '../../services/user.service';
import { UserDoc } from 'src/models/user.model';

interface newFamilyArgs {
    input: {
        name: FamilyDoc['name'];
        description: FamilyDoc['description'];
    };
}

const allFamilies: IFieldResolver<any, ContextAttributes, any, Promise<FamilyDoc[]>> = async (source, args, context) => {
    try {
        const families = await FamilyService.getAllFamilies();
        return families;
    } catch (error) {
        throw new ApolloError(`something went wrong`);
    }
}

const createFamily: IFieldResolver<any, ContextAttributes, newFamilyArgs, Promise<FamilyDoc>> = async (source, args, context) => {
    const userRecord = await authCheck(context.req);

    if (!args.input.name.trim()) {
        throw new UserInputError('family name is required');
    }

    let createdByUser: UserDoc | null;
    try {
        createdByUser = await UserService.getOneUserByAuthId(userRecord.uid);

        if (!createdByUser) {
            throw new UserInputError('User not found');
        }
    } catch (error) {
        throw new ApolloError(`something went wrong`);
    }

    try {
        const { name, description } = args.input;
        const createdFamily = await FamilyService.createNewFamily({
            name,
            description,
            creator: createdByUser._id as string,
        });
        return createdFamily;
    } catch (error) {
        throw new ApolloError(`something went wrong`);
    }
}

const familyResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        allFamilies,
    },
    Mutation: {
        createFamily,
    },
};

export default familyResolverMap;