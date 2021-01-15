import { CustomError, CustomErrorCodes } from "./general.errors";

const general = {
    messageNotFound: new CustomError(CustomErrorCodes.STATUS_404_NOT_FOUND, `message not found`),
}

const userInput = {
    textRequired: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `text is required`),
    textTooLong: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `text is too long`),
    fromRequired: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `from is required`),
    toRequired: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `to is required`),
    familyRequired: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `family is required`),
}

const forbidden = {
    cannotAccessChats: new CustomError(CustomErrorCodes.STATUS_403_FORBIDDEN, `you cannot access these chats`),
}

export const MessageErrors = {
    general,
    userInput,
    forbidden,
}