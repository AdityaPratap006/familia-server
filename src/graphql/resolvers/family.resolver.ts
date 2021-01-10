import { IFieldResolver, IResolvers } from 'graphql-tools';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';
import { FamilyDoc } from '../../models/family.model';
import FamilyService from '../../services/family.service';
import { FamilyErrors, getGraphqlError } from '../../errors';
import { UserValidators } from '../validators';

interface newFamilyArgs {
    input: {
        name: FamilyDoc['name'];
        description: FamilyDoc['description'];
    };
}

interface GetFamilyArgs {
    input: {
        familyId: string;
    }
}

const allFamilies: IFieldResolver<any, ContextAttributes, any, Promise<FamilyDoc[]>> = async (source, args, context) => {
    try {
        const families = await FamilyService.getAllFamilies();
        return families;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const family: IFieldResolver<any, ContextAttributes, GetFamilyArgs, Promise<FamilyDoc>> = async (source, args, context) => {
    await authCheck(context.req);

    try {
        const { input: { familyId } } = args;
        const family = await FamilyService.getFamilyById(familyId);

        if (!family) {
            throw FamilyErrors.general.familyNotFound;
        }

        return family;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const createFamily: IFieldResolver<any, ContextAttributes, newFamilyArgs, Promise<FamilyDoc>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);

    if (!args.input.name.trim()) {
        throw getGraphqlError(FamilyErrors.userInput.nameRequired);
    }

    const requestingUser = await UserValidators.checkIfUserExists(userAuthRecord);

    try {
        const { name, description } = args.input;
        const createdFamily = await FamilyService.createFamilyAndAddMembership({
            name,
            description,
            creator: requestingUser._id as string,
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
        family,
    },
    Mutation: {
        createFamily,
    },
};

export default familyResolverMap;