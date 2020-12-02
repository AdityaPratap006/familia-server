import { IFieldResolver, IResolvers } from 'graphql-tools';
import { ApolloError } from 'apollo-server-express';
import chalk from 'chalk';
// import util from 'util';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';
import UserService from '../../services/user.service';
import { UserDoc } from '../../models/user.model';

interface CreateUserArgs {
    input: {
        authToken: string;
    };
}

interface SetDefaultFamilyIdArgs {
    input: {
        familyId: string;
    };
}

const createUser: IFieldResolver<any, ContextAttributes, CreateUserArgs, Promise<UserDoc>> = async (source, args, context) => {
    const userRecord = await authCheck(context.req);

    try {
        const existingUser = await UserService.getOneUserByAuthId(userRecord.uid);
        if (existingUser) {
            console.log(chalk.blue(`User with auth_id ${userRecord.uid} already exists`));
            return existingUser;
        }
    } catch (error) {
        console.log(error);
        throw new ApolloError(`something went wrong`);
    }

    try {
        const newUser = await UserService.createNewUser({
            name: userRecord.displayName as string,
            email: userRecord.email as string,
            photoURL: userRecord.photoURL as string,
            auth_id: userRecord.uid,
        });

        return newUser;
    } catch (error) {
        console.log(error);
        throw new ApolloError(`something went wrong`);
    }
}

const setDefaultFamilyId: IFieldResolver<any, ContextAttributes, SetDefaultFamilyIdArgs, Promise<UserDoc>> = async (source, args, context) => {
    const userRecord = await authCheck(context.req);

    try {
        const updatedUser = await UserService.setDefaultFamilyId(userRecord.uid, args.input.familyId);
        return updatedUser;
    } catch (error) {
        console.log(error);
        throw new ApolloError(`something went wrong`);
    }

}

const userResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {

    },
    Mutation: {
        createUser,
        setDefaultFamilyId,
    }
};

export default userResolverMap;