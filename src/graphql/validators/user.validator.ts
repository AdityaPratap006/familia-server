import { UserErrors, getGraphqlError } from "../../errors";
import UserService from "../../services/user.service";
import { UserRecord } from "../helpers/auth";

const checkIfUserExists = async (userAuthRecord: UserRecord) => {
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);
        if (!user) {
            throw UserErrors.general.userNotFound;
        }
        return user;
    } catch (error) {
        throw getGraphqlError(error);
    }
}

export const UserValidators = {
    checkIfUserExists,
};