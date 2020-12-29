import { CustomError, CustomErrorCodes } from "./general.errors";

const general = {
    inviteNotFound: new CustomError(CustomErrorCodes.STATUS_404_NOT_FOUND, `invite not found`),
}

const userInput = {

}

export const InviteErrors = {
    general,
    userInput,
}