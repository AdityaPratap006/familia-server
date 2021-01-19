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
import { MembershipValidators, UserValidators } from '../validators';
import MembershipService from '../../services/membership.service';

interface UpdateUserLocationArgs {
    input: {
        latitude: number;
        longitude: number;
    };
}

interface GetUserLocationArgs {
    input: {
        familyId: string;
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

const memberLocations: IFieldResolver<any, ContextAttributes, GetUserLocationArgs, Promise<LocationDoc[]>> = async (source, args, context) => {
    const { req } = context;
    const { input: { familyId } } = args;
    const userAuthRecord = await authCheck(req);
    const requestingUser = await UserValidators.checkIfUserExists(userAuthRecord);
    await MembershipValidators.checkIfUserBelongsToFamily(familyId, requestingUser.id);

    let familyMembers: UserDoc[];
    try {
        familyMembers = await MembershipService.getMembersOfAFamily(familyId);
    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const locationsList = await Promise.all(familyMembers.map(async (member) => {
            const location = await LocationService.getUserLocation(member.id);
            return location;
        }));

        return locationsList.filter(loc => loc !== null) as LocationDoc[];
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const locationResolverMap: IResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        memberLocations,
    },
    Mutation: {
        updateUserLocation,
    }
};

export default locationResolverMap;