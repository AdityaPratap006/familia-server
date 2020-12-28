import { IFieldResolver, IResolvers } from 'graphql-tools';
import { UserInputError } from 'apollo-server-express';
// import chalk from 'chalk';
// import util from 'util';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';
import { FamilyDoc } from '../../models/family.model';
import FamilyService from '../../services/family.service';
import UserService from '../../services/user.service';
import { UserDoc } from '../../models/user.model';
import { FamilyErrors, getGraphqlError, UserErrors } from '../../errors';

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
        throw getGraphqlError(error);
    }
}

const createFamily: IFieldResolver<any, ContextAttributes, newFamilyArgs, Promise<FamilyDoc>> = async (source, args, context) => {
    const userRecord = await authCheck(context.req);

    if (!args.input.name.trim()) {
        throw getGraphqlError(FamilyErrors.userInput.nameRequired);
    }

    let createdByUser: UserDoc | null;
    try {
        createdByUser = await UserService.getOneUserByAuthId(userRecord.uid);

        if (!createdByUser) {
            throw UserErrors.general.userNotFound;
        }
    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const { name, description } = args.input;
        const createdFamily = await FamilyService.createFamilyAndAddMembership({
            name,
            description,
            creator: createdByUser._id as string,
        });

        return createdFamily;
    } catch (error) {
        console.log(error);
        throw getGraphqlError(error);
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