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

interface SearchUserArgs {
    input: {
        query: string;
    };
}

const profile: IFieldResolver<any, ContextAttributes, CreateUserArgs, Promise<UserDoc>> = async (source, args, context) => {
    const userRecord = await authCheck(context.req);

    try {
        const existingUser = await UserService.getOneUserByAuthId(userRecord.uid);
        if (existingUser) {
            return existingUser;
        } else {
            throw Error();
        }
    } catch (error) {
        console.log(error);
        throw new ApolloError(`something went wrong`);
    }
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

const searchUsers: IFieldResolver<any, ContextAttributes, SearchUserArgs, Promise<UserDoc[]>> = async (source, args, context) => {
    await authCheck(context.req);

    const { input: { query: searchQuery } } = args;

    try {
        const searchResults = await UserService.searchUsers(searchQuery);
        return searchResults;
    } catch (error) {
        console.log(error);
        throw new ApolloError(`something went wrong`);
    }

}

const userResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        profile,
        searchUsers,
    },
    Mutation: {
        createUser,
    }
};

export default userResolverMap;