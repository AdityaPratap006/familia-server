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
import { InviteDoc } from '../../models/invite.model';
import InviteService from '../../services/invite.service';

const getAllInvites: IFieldResolver<any, ContextAttributes, any, Promise<InviteDoc[]>> = async (source, args, context) => {
    await authCheck(context.req);

    try {
        const invites = await InviteService.getAllInvites();
        return invites;
    } catch (error) {
        throw new ApolloError(`something went wrong`);
    }
}

const inviteResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        getAllInvites,
    },
};

export default inviteResolverMap;