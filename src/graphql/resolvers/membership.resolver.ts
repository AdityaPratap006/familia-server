import { IFieldResolver, IResolvers } from 'graphql-tools';
import { ApolloError, UserInputError } from 'apollo-server-express';
// import chalk from 'chalk';
// import util from 'util';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';
import { FamilyDoc } from '../../models/family.model';
import UserService from '../../services/user.service';
import { UserDoc } from '../../models/user.model';
import MembershipService from '../../services/membership.service';

interface GetMembersArgs {
    input: {
        familyId: string;
    };
}

const getFamiliesOfUser: IFieldResolver<any, ContextAttributes, any, Promise<FamilyDoc[]>> = async (source, args, context) => {
    const userRecord = await authCheck(context.req);

    let user: UserDoc | null;
    try {
        user = await UserService.getOneUserByAuthId(userRecord.uid);

        if (!user) {
            throw new UserInputError('User not found');
        }
    } catch (error) {
        throw new ApolloError(`something went wrong`);
    }

    try {
        const families = await MembershipService.getMembershipsOfAUser(user._id);
        return families;
    } catch (error) {
        console.log(error);
        throw new ApolloError(`something went wrong`);
    }
}

const getMembersOfAFamily: IFieldResolver<any, ContextAttributes, GetMembersArgs, Promise<UserDoc[]>> = async (source, args, context) => {
    await authCheck(context.req);

    const { input: { familyId } } = args;

    try {
        const members = await MembershipService.getMembersOfAFamily(familyId);
        return members;
    } catch (error) {
        throw new ApolloError(`something went wrong`);
    }

}

const membershipResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        getFamiliesOfUser,
        getMembersOfAFamily,
    },
};

export default membershipResolverMap;