import { CustomError, CustomErrorCodes } from "./general.errors";

const general = {
    userNotFound: new CustomError(CustomErrorCodes.STATUS_404_NOT_FOUND, `user not found`),
}

const userInput = {
    nameRequired: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `user name is required`),
    emailRequired: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `user email is required`),
    photoURLRequired: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `user photo URL is required`),
    authIdRequired: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `user auth_id(uid) is required`),
}



export const UserErrors = {
    general,
    userInput,
}