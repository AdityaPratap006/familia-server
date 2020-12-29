import { IFieldResolver, IResolvers } from 'graphql-tools';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';
import { FamilyDoc } from '../../models/family.model';
import { UserDoc } from '../../models/user.model';
import MembershipService from '../../services/membership.service';
import { getGraphqlError } from '../../errors';
import { UserValidators } from '../validators';

interface GetMembersArgs {
    input: {
        familyId: string;
    };
}

const getFamiliesOfUser: IFieldResolver<any, ContextAttributes, any, Promise<FamilyDoc[]>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);
    const user = await UserValidators.checkIfUserExists(userAuthRecord);

    try {
        const families = await MembershipService.getMembershipsOfAUser(user._id);
        return families;
    } catch (error) {
        console.log(error);
        throw getGraphqlError(error);
    }
}

const getMembersOfAFamily: IFieldResolver<any, ContextAttributes, GetMembersArgs, Promise<UserDoc[]>> = async (source, args, context) => {
    await authCheck(context.req);
    const { input: { familyId } } = args;

    try {
        const members = await MembershipService.getMembersOfAFamily(familyId);
        return members;
    } catch (error) {
        throw getGraphqlError(error);
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