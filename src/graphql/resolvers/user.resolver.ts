import { IFieldResolver, IResolvers } from 'graphql-tools';
import chalk from 'chalk';
// import util from 'util';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';
import UserService from '../../services/user.service';
import { UserDoc } from '../../models/user.model';

interface createUserArgs {
    input: {
        authToken: string;
    };
}

const createUser: IFieldResolver<any, ContextAttributes, createUserArgs, Promise<UserDoc>> = async (parent, args, context) => {
    const userRecord = await authCheck(context.req);

    const existingUser = await UserService.getOneUserByEmail(userRecord.email as string);
    if (existingUser) {
        console.log(chalk.blue(`User with email ${userRecord.email} already exists`));
        return existingUser;
    }

    const newUser = await UserService.createNewUser({
        name: userRecord.displayName as string,
        email: userRecord.email as string,
        photoURL: userRecord.photoURL as string,
    });

    return newUser;
}

const userResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {

    },
    Mutation: {
        createUser,
    }
};

export default userResolverMap;