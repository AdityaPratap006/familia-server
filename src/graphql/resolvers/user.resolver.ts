import { IFieldResolver, IResolvers } from 'graphql-tools';
import chalk from 'chalk';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';
import UserService from '../../services/user.service';
import { UserDoc } from '../../models/user.model';
import { getGraphqlError, UserErrors } from '../../errors';

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
            throw UserErrors.general.userNotFound;
        }
    } catch (error) {
        console.log(error);
        throw getGraphqlError(error);
    }
}

const createUser: IFieldResolver<any, ContextAttributes, CreateUserArgs, Promise<UserDoc>> = async (source, args, context) => {
    const userRecord = await authCheck(context.req);

    const { displayName, email, photoURL, uid } = userRecord;

    if (!displayName) {
        throw getGraphqlError(UserErrors.userInput.nameRequired);
    }

    if (!email) {
        throw getGraphqlError(UserErrors.userInput.emailRequired);
    }

    if (!photoURL) {
        throw getGraphqlError(UserErrors.userInput.photoURLRequired);
    }

    if (!uid) {
        throw getGraphqlError(UserErrors.userInput.authIdRequired);
    }

    try {
        const existingUser = await UserService.getOneUserByAuthId(userRecord.uid);
        if (existingUser) {
            console.log(chalk.blue(`User with auth_id ${userRecord.uid} already exists`));
            return existingUser;
        }
    } catch (error) {
        console.log(error);
        throw getGraphqlError(error);
    }

    try {
        const newUser = await UserService.createNewUser({
            name: displayName,
            email: email,
            photoURL: photoURL,
            auth_id: uid,
        });

        return newUser;
    } catch (error) {
        console.log(error);
        throw getGraphqlError(error);
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
        throw getGraphqlError(error);
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