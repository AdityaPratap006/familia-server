import { IFieldResolver, IResolvers } from 'graphql-tools';
import chalk from 'chalk';
import { DateTimeResolver } from 'graphql-scalars';
import { authCheck } from '../helpers/auth';
import { ContextAttributes } from '../helpers/context';
import LocationService from '../../services/location.service';
import { UserDoc } from '../../models/user.model';
import { LocationDoc } from '../../models/location.model';
import { getGraphqlError, UserErrors } from '../../errors';
import UserService from '../../services/user.service';
import { LocationErrors } from '../../errors';

interface UpdateUserLocationArgs {
    input: {
        latitude: number;
        longitude: number;
    };
}

const updateUserLocation: IFieldResolver<any, ContextAttributes, UpdateUserLocationArgs, Promise<LocationDoc>> = async (source, args, context) => {
    const userAuthRecord = await authCheck(context.req);

    const { input } = args;

    let userData: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);
        if (!user) {
            throw UserErrors.general.userNotFound;
        }
        userData = user;
    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const updatedlocation = await LocationService.updateUserLocation(userData.id, input);
        if (!updatedlocation) {
            throw LocationErrors.general.locationNotFound;
        }
        return updatedlocation;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const locationResolverMap: IResolvers = {
    DateTime: DateTimeResolver,

    Mutation: {
        updateUserLocation,
    }
};

export default locationResolverMap;