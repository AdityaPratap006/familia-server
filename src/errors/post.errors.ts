import { CustomError, CustomErrorCodes } from "./general.errors";

const general = {
    postNotFound: new CustomError(CustomErrorCodes.STATUS_404_NOT_FOUND, `post not found`),
}

const userInput = {
    titleRequired: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `post title is required`),
    familyIdRequired: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `familyId is required`),
}

const forbidden = {
    userNotAMember: new CustomError(CustomErrorCodes.STATUS_403_FORBIDDEN, `sorry you cannot post in a family you don't belong to`),
}

export const PostErrors = {
    general,
    userInput,
    forbidden,
}