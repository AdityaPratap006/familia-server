import { CustomError, CustomErrorCodes } from "./general.errors";

const general = {
    familiesNotFound: new CustomError(CustomErrorCodes.STATUS_404_NOT_FOUND, `families not found`),
    familyNotFound: new CustomError(CustomErrorCodes.STATUS_404_NOT_FOUND, `family not found`),
}

const userInput = {
    nameRequired: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `family name is required`),
}

const forbidden = {
    cannotAddMoreMembers: new CustomError(CustomErrorCodes.STATUS_403_FORBIDDEN, `cannot add more than 12 members`),
}

export const FamilyErrors = {
    general,
    userInput,
    forbidden,
}